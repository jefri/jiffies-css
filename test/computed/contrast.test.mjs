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
//
// The last entry is the link :focus-visible RING: typography-inline.css draws
// `outline: ... solid var(--color-primary)` around a focused link, which sits
// on the page background. As a focus indicator it is load-bearing non-text and
// MUST clear the 3:1 floor.
// Format: [label, tokenA, tokenB].
const NON_TEXT_PAIRS = [
  ["outline vs surface", "--color-outline", "--color-surface"],
  ["outline vs background", "--color-outline", "--color-background"],
  ["base-border-color vs surface", "--base-border-color", "--color-surface"],
  ["focus-ring (primary) vs background", "--color-primary", "--color-background"],
];

// Form validity / resting borders (Phase-4 component STATE, forms.css).
//
// The symposium found the gate stopped at the role layer and never reached
// the component state that actually paints these borders. forms.css raises a
// control's structural border to one of three validity colors:
//
//   --color-form-base    (= --color-outline)  — resting / no validity stated
//   --color-form-invalid (= --color-error)    — [aria-invalid="true"] border + text
//   --color-form-valid   (= --color-success)  — [aria-invalid="false"] border
//
// These are now LOAD-BEARING affordance borders: the border color is half of
// the validity cue (the other half is the non-color status glyph). As a
// structural/graphical affordance each MUST clear the WCAG 1.4.11 non-text
// floor of 3:1 against every neutral it can sit on. A control can sit on the
// page background OR on a raised surface, so each is asserted against BOTH
// --color-surface and --color-background.
//
// Format: [label, borderToken, neutralToken].
const FORM_BORDER_TOKENS = [
  ["form-base (resting)", "--color-form-base"],
  ["form-invalid (error border)", "--color-form-invalid"],
  ["form-valid (success border)", "--color-form-valid"],
];
const FORM_BORDER_NEUTRALS = ["--color-surface", "--color-background"];
const FORM_BORDER_PAIRS = FORM_BORDER_TOKENS.flatMap(([label, tok]) =>
  FORM_BORDER_NEUTRALS.map((bg) => [`${label} vs ${bg}`, tok, bg]),
);

// Cross-role text pairs: the foreground colors the CONTENT layer
// (v2/content/typography-inline.css + typography-block.css) actually paints on
// the neutral page. Unlike TEXT_PAIRS (each --color-on-X vs its own --color-X),
// these are the colors a reader literally sees on the page surface, so each is
// asserted against BOTH neutral backgrounds the content can sit on:
// --color-background and --color-surface. Every one MUST clear 4.5:1.
//
//   --color-primary            — default link, and link :focus-visible label
//   --color-secondary          — .secondary link
//   --color-on-surface         — .contrast link, body text
//   --color-on-surface-variant — ::marker, blockquote rail text
//   --color-error              — del
//   --color-success            — ins
//
// Format: [label, foregroundToken].
const CROSS_ROLE_FOREGROUNDS = [
  ["link (primary)", "--color-primary"],
  ["secondary link (secondary)", "--color-secondary"],
  ["contrast link / body text (on-surface)", "--color-on-surface"],
  ["marker / blockquote rail (on-surface-variant)", "--color-on-surface-variant"],
  ["del (error)", "--color-error"],
  ["ins (success)", "--color-success"],
];

// The two neutral backgrounds content sits on. Each cross-role foreground is
// asserted against both.
const CROSS_ROLE_BACKGROUNDS = [
  "--color-background",
  "--color-surface",
];

// Expanded to [label, fg, bg] triples — one per (foreground × background).
const CROSS_ROLE_TEXT_PAIRS = CROSS_ROLE_FOREGROUNDS.flatMap(([label, fg]) =>
  CROSS_ROLE_BACKGROUNDS.map((bg) => [`${label} on ${bg}`, fg, bg]),
);

const TEXT_FLOOR = 4.5;
const NON_TEXT_FLOOR = 3.0;

// Disabled-control legibility check (forms.css [disabled] / [aria-disabled]).
//
// IMPORTANT — this is NOT a WCAG conformance assertion. WCAG 2.x SC 1.4.3
// (Contrast Minimum) EXPLICITLY EXEMPTS disabled / inactive UI components from
// the 4.5:1 text floor, so asserting 4.5:1 here would be testing a requirement
// that does not exist. We deliberately do NOT do that.
//
// Instead this is a BEYOND-WCAG legibility sanity floor: a disabled label
// should still be readable enough to tell WHICH field is disabled, not vanish
// into the surface. forms.css renders a disabled control's label as
// --color-on-surface dimmed by opacity: 0.5 over --color-surface, so the color
// a user actually sees is the alpha composite
//
//     eff = 0.5 * on-surface + 0.5 * surface
//
// We assert that EFFECTIVE color clears a soft 3.0:1 over the surface. Failing
// this is a "the disabled state is effectively invisible" finding, not a
// conformance defect.
const DISABLED_LEGIBILITY_FLOOR = 3.0;
const DISABLED_LABEL_INK = "--color-on-surface";
const DISABLED_LABEL_SURFACE = "--color-surface";
const DISABLED_LABEL_OPACITY = 0.5;

/**
 * Alpha-composite a foreground sRGB triple over a background sRGB triple at the
 * given alpha (straight "over" blend, per-channel). Returns an sRGB triple.
 * This mirrors how the browser composites a 0.5-opacity element over its
 * backdrop, which is the color a user's eye integrates.
 */
function compositeOver(fg, bg, alpha) {
  return [0, 1, 2].map((i) => alpha * fg[i] + (1 - alpha) * bg[i]);
}

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
      ...CROSS_ROLE_TEXT_PAIRS.flatMap(([, fg, bg]) => [fg, bg]),
      ...FORM_BORDER_PAIRS.flatMap(([, a, b]) => [a, b]),
      DISABLED_LABEL_INK,
      DISABLED_LABEL_SURFACE,
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

        for (const [label, fg, bg] of CROSS_ROLE_TEXT_PAIRS) {
          it(`cross-role text ${label} >= ${TEXT_FLOOR}:1`, () => {
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
              `CROSS-ROLE TEXT contrast FAIL: pair "${label}" (${fg} on ${bg}) ` +
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

        // Phase-4 component STATE: form validity / resting borders. Each is a
        // load-bearing affordance border that MUST clear the 3:1 non-text floor
        // against both neutrals a control can sit on.
        for (const [label, a, b] of FORM_BORDER_PAIRS) {
          it(`form-border ${label} >= ${NON_TEXT_FLOOR}:1`, () => {
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
              `FORM-BORDER (non-text) contrast FAIL: pair "${label}" ` +
                `(${a} vs ${b}) at brand hue ${hue}deg, ${scheme} scheme — ` +
                `measured ${ratio.toFixed(3)}:1, floor ${NON_TEXT_FLOOR}:1 ` +
                `(rgb ${ra.rgb} vs ${rb.rgb})`,
            );
          });
        }

        // BEYOND-WCAG legibility sanity (NOT a 1.4.3 conformance assertion;
        // disabled controls are exempt). The disabled label's EFFECTIVE color
        // is on-surface alpha-composited at 0.5 over the surface; assert it
        // stays >= 3:1 over the surface so the disabled state is not invisible.
        it(
          `disabled-label legibility (effective ${DISABLED_LABEL_INK} @ ` +
            `${DISABLED_LABEL_OPACITY} over ${DISABLED_LABEL_SURFACE}) ` +
            `>= ${DISABLED_LEGIBILITY_FLOOR}:1 [beyond-WCAG, not 1.4.3]`,
          () => {
            const ink = resolved[DISABLED_LABEL_INK];
            const surface = resolved[DISABLED_LABEL_SURFACE];
            assert.ok(
              ink && ink.rgb,
              `disabled-label: ${DISABLED_LABEL_INK} did not resolve to sRGB ` +
                `(value="${ink ? ink.value : "<missing>"}") ` +
                `[hue ${hue}deg, ${scheme}]`,
            );
            assert.ok(
              surface && surface.rgb,
              `disabled-label: ${DISABLED_LABEL_SURFACE} did not resolve to ` +
                `sRGB (value="${surface ? surface.value : "<missing>"}") ` +
                `[hue ${hue}deg, ${scheme}]`,
            );
            const eff = compositeOver(
              ink.rgb,
              surface.rgb,
              DISABLED_LABEL_OPACITY,
            );
            const ratio = contrastRatio(eff, surface.rgb);
            assert.ok(
              ratio >= DISABLED_LEGIBILITY_FLOOR,
              `DISABLED-LABEL legibility FAIL (beyond-WCAG sanity floor, ` +
                `NOT a 1.4.3 conformance requirement): effective disabled ` +
                `label color (0.5*${DISABLED_LABEL_INK} + 0.5*` +
                `${DISABLED_LABEL_SURFACE}) at brand hue ${hue}deg, ` +
                `${scheme} scheme — measured ${ratio.toFixed(3)}:1 over the ` +
                `surface, floor ${DISABLED_LEGIBILITY_FLOOR}:1 ` +
                `(eff rgb ${eff.map((c) => Math.round(c))}, ` +
                `surface rgb ${surface.rgb})`,
            );
          },
        );
      });
    }
  });
}
