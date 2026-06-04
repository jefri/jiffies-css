// test/computed/contrast.test.mjs
//
// Automated WCAG 2.x contrast enforcement for the M3 generative color engine.
//
// This is the gate the symposium found missing: with no contrast test, a
// too-low default border (outline-variant where outline was needed) was able
// to ship. These assertions resolve every semantic role token to real sRGB
// bytes (via browser canvas readback, which applies oklch() gamut mapping
// exactly as the renderer does) and assert the WCAG 2.x contrast ratio against
// the real floors — 4.5:1 for text pairs, 3:1 for load-bearing non-text
// (the focusable/structural border) pairs.
//
// Coverage is a cross-product: BOTH color schemes (light + dark) × a SPREAD of
// brand hues (blue / red / green / magenta). Brand hue is set as an INLINE
// style on document.documentElement, which overrides the theme-layer :root
// --brand-color so the whole derivation chain (functions.css fns layer →
// theme/colors.css roles) re-derives for that hue.
//
// A failure here is a real engine defect (a derived tone that does not clear
// its WCAG floor for some hue/scheme), NOT a stylistic choice. The 4.5 / 3.0
// thresholds are the genuine WCAG floors and must not be weakened to force a
// pass. Each failure names the pair, brand hue, scheme, and measured ratio so a
// regression is diagnosable.

import { describe, before, after, it } from "node:test";
import assert from "node:assert/strict";
import { withPage } from "./helpers.mjs";

// Brand hues to sweep (degrees in oklch). A spread around the wheel so a
// derived tone cannot pass by luck at one hue while failing at another.
const HUES = [255, 25, 140, 310];

// Text pairs: each foreground role MUST clear 4.5:1 against its background
// role. Every role that has an on-* partner in theme/colors.css is covered.
// Format: [label, foregroundToken, backgroundToken].
const TEXT_PAIRS = [
  ["primary", "--color-on-primary", "--color-primary"],
  [
    "primary-container",
    "--color-on-primary-container",
    "--color-primary-container",
  ],
  ["secondary", "--color-on-secondary", "--color-secondary"],
  [
    "secondary-container",
    "--color-on-secondary-container",
    "--color-secondary-container",
  ],
  ["tertiary", "--color-on-tertiary", "--color-tertiary"],
  [
    "tertiary-container",
    "--color-on-tertiary-container",
    "--color-tertiary-container",
  ],
  ["error", "--color-on-error", "--color-error"],
  ["error-container", "--color-on-error-container", "--color-error-container"],
  ["info", "--color-on-info", "--color-info"],
  ["info-container", "--color-on-info-container", "--color-info-container"],
  ["success", "--color-on-success", "--color-success"],
  [
    "success-container",
    "--color-on-success-container",
    "--color-success-container",
  ],
  ["warning", "--color-on-warning", "--color-warning"],
  [
    "warning-container",
    "--color-on-warning-container",
    "--color-warning-container",
  ],
  ["background", "--color-on-background", "--color-background"],
  ["surface", "--color-on-surface", "--color-surface"],
  ["surface-variant", "--color-on-surface-variant", "--color-surface-variant"],
];

// Non-text pairs: the load-bearing structural border MUST clear 3:1 (WCAG
// 1.4.11) against the surfaces it sits on. --base-border-color (borders.css)
// resolves through --color-outline, so it is asserted too as the consumer-
// facing token. NOTE: --color-outline-variant is intentionally NOT asserted
// here — it is documented (borders.css) as a purely decorative hairline,
// exempt from the 3:1 non-text floor.
// Format: [label, tokenA, tokenB].
const NON_TEXT_PAIRS = [
  ["outline vs surface", "--color-outline", "--color-surface"],
  ["outline vs background", "--color-outline", "--color-background"],
  ["base-border-color vs surface", "--base-border-color", "--color-surface"],
];

const TEXT_FLOOR = 4.5;
const NON_TEXT_FLOOR = 3.0;

/**
 * Inside the page: resolve a list of role tokens to sRGB byte triples.
 *
 * For each token we read its computed value off :root, then resolve that
 * string to sRGB via canvas readback: set ctx.fillStyle to the color string,
 * fillRect a single pixel, and read it back with getImageData. The 2D canvas
 * resolves any CSS color (including oklch(from ...)) to gamut-mapped sRGB
 * bytes — the reliable sRGB path. getComputedStyle alone returns the literal
 * oklch(from ...) string for a custom property and may return a non-sRGB
 * oklch() for `color`, so canvas readback is used instead.
 *
 * Returns a map token -> { value, rgb: [r,g,b] | null }.
 */
function resolveTokensInPage(tokens) {
  const root = document.documentElement;
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  // willReadFrequently keeps readback on the CPU path (faster, deterministic).
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const cs = getComputedStyle(root);

  const out = {};
  for (const token of tokens) {
    const value = cs.getPropertyValue(token).trim();
    let rgb = null;
    if (value !== "") {
      // Reset to a known sentinel so an unparseable color leaves a detectable
      // (rather than stale) pixel.
      ctx.fillStyle = "#000000";
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = value;
      ctx.fillRect(0, 0, 1, 1);
      const data = ctx.getImageData(0, 0, 1, 1).data;
      rgb = [data[0], data[1], data[2]];
    }
    out[token] = { value, rgb };
  }
  return out;
}

/** WCAG relative luminance from an sRGB byte channel. */
function channelLuminance(byte) {
  const c = byte / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/** WCAG relative luminance of an sRGB triple. */
function relativeLuminance([r, g, b]) {
  return (
    0.2126 * channelLuminance(r) +
    0.7152 * channelLuminance(g) +
    0.0722 * channelLuminance(b)
  );
}

/** WCAG 2.x contrast ratio between two sRGB triples. */
function contrastRatio(rgbA, rgbB) {
  const la = relativeLuminance(rgbA);
  const lb = relativeLuminance(rgbB);
  const max = Math.max(la, lb);
  const min = Math.min(la, lb);
  return (max + 0.05) / (min + 0.05);
}

/**
 * Set --brand-color as an inline style on the root element (overriding the
 * theme-layer :root) and resolve every token used by the pair tables to sRGB
 * bytes for the current hue. Returns the resolved map.
 */
async function measureForHue(page, hue) {
  const allTokens = Array.from(
    new Set([
      ...TEXT_PAIRS.flatMap(([, fg, bg]) => [fg, bg]),
      ...NON_TEXT_PAIRS.flatMap(([, a, b]) => [a, b]),
    ]),
  );

  return page.evaluate(
    ({ hue, tokens, fnSource }) => {
      document.documentElement.style.setProperty(
        "--brand-color",
        `oklch(55% 0.18 ${hue}deg)`,
      );
      // Reconstitute the resolver function inside the page context.
      const resolve = new Function(`return (${fnSource})`)();
      return resolve(tokens);
    },
    { hue, tokens: allTokens, fnSource: resolveTokensInPage.toString() },
  );
}

for (const scheme of ["light", "dark"]) {
  describe(`WCAG contrast — ${scheme} scheme`, () => {
    let session;
    let page;

    before(async () => {
      session = await withPage({ colorScheme: scheme });
      page = session.page;
    });

    after(async () => {
      await session.close();
    });

    for (const hue of HUES) {
      describe(`brand hue ${hue}deg`, () => {
        let resolved;

        before(async () => {
          resolved = await measureForHue(page, hue);
        });

        for (const [label, fg, bg] of TEXT_PAIRS) {
          it(`text ${label} (${fg} on ${bg}) >= ${TEXT_FLOOR}:1`, () => {
            const f = resolved[fg];
            const b = resolved[bg];
            assert.ok(
              f && f.rgb,
              `${label}: foreground ${fg} did not resolve to sRGB ` +
                `(value="${f ? f.value : "<missing>"}") ` +
                `[hue ${hue}deg, ${scheme}]`,
            );
            assert.ok(
              b && b.rgb,
              `${label}: background ${bg} did not resolve to sRGB ` +
                `(value="${b ? b.value : "<missing>"}") ` +
                `[hue ${hue}deg, ${scheme}]`,
            );
            const ratio = contrastRatio(f.rgb, b.rgb);
            assert.ok(
              ratio >= TEXT_FLOOR,
              `TEXT contrast FAIL: pair "${label}" (${fg} on ${bg}) ` +
                `at brand hue ${hue}deg, ${scheme} scheme — ` +
                `measured ${ratio.toFixed(3)}:1, floor ${TEXT_FLOOR}:1 ` +
                `(fg rgb ${f.rgb}, bg rgb ${b.rgb})`,
            );
          });
        }

        for (const [label, a, b] of NON_TEXT_PAIRS) {
          it(`non-text ${label} >= ${NON_TEXT_FLOOR}:1`, () => {
            const ra = resolved[a];
            const rb = resolved[b];
            assert.ok(
              ra && ra.rgb,
              `${label}: ${a} did not resolve to sRGB ` +
                `(value="${ra ? ra.value : "<missing>"}") ` +
                `[hue ${hue}deg, ${scheme}]`,
            );
            assert.ok(
              rb && rb.rgb,
              `${label}: ${b} did not resolve to sRGB ` +
                `(value="${rb ? rb.value : "<missing>"}") ` +
                `[hue ${hue}deg, ${scheme}]`,
            );
            const ratio = contrastRatio(ra.rgb, rb.rgb);
            assert.ok(
              ratio >= NON_TEXT_FLOOR,
              `NON-TEXT contrast FAIL: pair "${label}" (${a} vs ${b}) ` +
                `at brand hue ${hue}deg, ${scheme} scheme — ` +
                `measured ${ratio.toFixed(3)}:1, floor ${NON_TEXT_FLOOR}:1 ` +
                `(rgb ${ra.rgb} vs ${rb.rgb})`,
            );
          });
        }
      });
    }
  });
}
