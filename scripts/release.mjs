#!/usr/bin/env node
// scripts/release.mjs — cut a release: bump, commit, tag, push, publish.
//
// Usage: npm run release
//
// Always run it as `npm run release`, not `node scripts/release.mjs`
// directly: testing and building happen first via npm's own "prerelease"
// script (package.json), which npm runs automatically before "release"
// whenever you invoke it through `npm run`. Calling this file directly
// skips that.
//
// Version is always CalVer: <ISO-week-year>.<ISO-week>.<micro> — the same
// scheme @davidsouther/jiffies uses. micro increments if a release already
// went out this ISO week; otherwise it starts at 0. No overrides — if the
// computed version is wrong, the clock or the last release's version is
// wrong; fix that instead.
//
// Always pushes the commit + tag and runs `npm publish` — that's the point
// of running this script instead of bumping the version by hand.

import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const BUNDLE_FILES = [
  "jiffies-css-bundle.css",
  "jiffies-css-bundle.css.map",
  "jiffies-css-bundle.min.css",
  "jiffies-css-bundle.min.css.map",
];

function run(command, args) {
  execFileSync(command, args, { stdio: "inherit" });
}

function capture(command, args) {
  return execFileSync(command, args, { encoding: "utf8" });
}

// ISO 8601 week-year and week number (matches @davidsouther/jiffies's scheme).
function isoWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7) + 3); // nearest Thursday
  const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  firstThursday.setUTCDate(
    firstThursday.getUTCDate() - ((firstThursday.getUTCDay() + 6) % 7) + 3,
  );
  const week = 1 + Math.round((d - firstThursday) / (7 * 86400000));
  return `${d.getUTCFullYear()}.${week}`;
}

function nextVersion(currentVersion) {
  const yearWeek = isoWeek(new Date());
  const [currentYearWeek, currentMicro] = [
    currentVersion.split(".").slice(0, 2).join("."),
    Number(currentVersion.split(".")[2] ?? -1),
  ];
  const micro = currentYearWeek === yearWeek ? currentMicro + 1 : 0;
  return `${yearWeek}.${micro}`;
}

// The tree must be clean except for the bundle files `prerelease`'s build
// step just regenerated — those are exactly what this release commits.
const dirty = capture("git", [
  "status",
  "--porcelain",
  "--",
  ".",
  ...BUNDLE_FILES.map((f) => `:!${f}`),
]).trim();
if (dirty) {
  console.error(`release: working tree has unexpected changes:\n${dirty}`);
  process.exit(1);
}

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const version = nextVersion(pkg.version);
console.log(`release: ${pkg.version} -> ${version}`);

pkg.version = version;
writeFileSync("package.json", `${JSON.stringify(pkg, null, 2)}\n`);

const lock = JSON.parse(readFileSync("package-lock.json", "utf8"));
lock.version = version;
if (lock.packages?.[""]) lock.packages[""].version = version;
writeFileSync("package-lock.json", `${JSON.stringify(lock, null, 2)}\n`);

run("git", ["add", "package.json", "package-lock.json", ...BUNDLE_FILES]);
run("git", ["commit", "-m", `Bump to ${version}`]);
run("git", ["tag", "-a", `v${version}`, "-m", `v${version}`]);

run("git", ["push"]);
run("git", ["push", "--tags"]);
run("npm", ["publish"]);

console.log(`release: published v${version}`);
