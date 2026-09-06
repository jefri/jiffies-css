#!/usr/bin/env node
// scripts/release.mjs — cut a release: verify, bump, build, commit, tag.
//
// Usage:
//   node scripts/release.mjs <patch|minor|major|X.Y.Z> [options]
//
// Options:
//   --dry-run     Print what would happen; touch no files, run no git commands.
//   --skip-tests  Skip the test suite gate (not recommended).
//   --push        After tagging, `git push && git push --tags`.
//   --publish     After tagging (and pushing, if --push), run `npm publish`.
//
// Without --push/--publish, the script stops after a local commit + tag and
// prints the exact follow-up commands — publishing to npm and pushing tags
// are outward-facing, hard-to-reverse actions and stay opt-in.
//
// What it does, in order:
//   1. Refuse to run with a dirty working tree.
//   2. Run the test suite (`npm test`), unless --skip-tests.
//   3. Compute the new version (semver bump, or an explicit X.Y.Z).
//   4. Write it into package.json AND package-lock.json (both the top-level
//      `version` and the `packages[""].version` field — the two fields npm
//      itself keeps in sync, and which had drifted independently before).
//   5. Rebuild the published bundle (`sh build.sh`) so the checked-in
//      jiffies-css-v2-bundle.* artifacts match the new version's source.
//   6. Commit exactly those files as "Bump to X.Y.Z" and tag `vX.Y.Z`.

import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const PACKAGE_JSON = path.join(ROOT, "package.json");
const PACKAGE_LOCK = path.join(ROOT, "package-lock.json");

const BUMP_KINDS = new Set(["patch", "minor", "major"]);
const SEMVER_RE = /^\d+\.\d+\.\d+$/;

const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith("--")));
const positional = args.filter((a) => !a.startsWith("--"));
const dryRun = flags.has("--dry-run");
const skipTests = flags.has("--skip-tests");
const shouldPush = flags.has("--push");
const shouldPublish = flags.has("--publish");

function fail(message) {
  console.error(`release: ${message}`);
  process.exit(1);
}

function run(command, cmdArgs, { silent = false } = {}) {
  if (dryRun) {
    console.log(`[dry-run] ${command} ${cmdArgs.join(" ")}`);
    return "";
  }
  return execFileSync(command, cmdArgs, {
    cwd: ROOT,
    stdio: silent ? ["ignore", "pipe", "pipe"] : "inherit",
    encoding: "utf8",
  });
}

function git(cmdArgs, opts) {
  return run("git", cmdArgs, opts);
}

function bumpVersion(current, kind) {
  if (SEMVER_RE.test(kind)) return kind;
  if (!BUMP_KINDS.has(kind)) {
    fail(
      `expected "patch", "minor", "major", or an explicit X.Y.Z version, got "${kind}"`,
    );
  }
  const [major, minor, patch] = current.split(".").map(Number);
  if ([major, minor, patch].some(Number.isNaN)) {
    fail(`current package.json version "${current}" is not a plain X.Y.Z semver`);
  }
  if (kind === "major") return `${major + 1}.0.0`;
  if (kind === "minor") return `${major}.${minor + 1}.0`;
  return `${major}.${minor}.${patch + 1}`;
}

function main() {
  const bumpArg = positional[0];
  if (!bumpArg) {
    fail('missing version argument — run `node scripts/release.mjs <patch|minor|major|X.Y.Z>`');
  }

  // ---- 1. Clean working tree ------------------------------------------------
  const status = git(["status", "--porcelain"], { silent: true });
  if (status.trim() && !dryRun) {
    fail(
      "working tree is not clean — commit, stash, or discard changes before releasing:\n" +
        status,
    );
  }

  const pkg = JSON.parse(readFileSync(PACKAGE_JSON, "utf8"));
  const currentVersion = pkg.version;
  const nextVersion = bumpVersion(currentVersion, bumpArg);
  console.log(`release: ${currentVersion} -> ${nextVersion}`);

  // ---- 2. Test gate -----------------------------------------------------
  if (skipTests) {
    console.log("release: --skip-tests set, skipping the test suite (not recommended)");
  } else {
    console.log("release: running the test suite (npm test)...");
    run("npm", ["test"]);
  }

  // ---- 3/4. Bump package.json + package-lock.json -----------------------
  pkg.version = nextVersion;
  const pkgJsonText = `${JSON.stringify(pkg, null, 2)}\n`;
  if (dryRun) {
    console.log(`[dry-run] would write ${PACKAGE_JSON} with version ${nextVersion}`);
  } else {
    writeFileSync(PACKAGE_JSON, pkgJsonText);
  }

  const lock = JSON.parse(readFileSync(PACKAGE_LOCK, "utf8"));
  lock.version = nextVersion;
  if (lock.packages?.[""]) lock.packages[""].version = nextVersion;
  const lockJsonText = `${JSON.stringify(lock, null, 2)}\n`;
  if (dryRun) {
    console.log(`[dry-run] would write ${PACKAGE_LOCK} with version ${nextVersion}`);
  } else {
    writeFileSync(PACKAGE_LOCK, lockJsonText);
  }

  // ---- 5. Rebuild the published bundle -----------------------------------
  console.log("release: rebuilding the bundle (sh build.sh)...");
  run("sh", ["build.sh"]);

  // ---- 6. Commit + tag ----------------------------------------------------
  const filesToCommit = [
    "package.json",
    "package-lock.json",
    "jiffies-css-v2-bundle.css",
    "jiffies-css-v2-bundle.css.map",
    "jiffies-css-v2-bundle.min.css",
    "jiffies-css-v2-bundle.min.css.map",
  ];
  git(["add", ...filesToCommit]);
  git(["commit", "-m", `Bump to ${nextVersion}`]);
  git(["tag", "-a", `v${nextVersion}`, "-m", `v${nextVersion}`]);
  console.log(`release: committed and tagged v${nextVersion}`);

  // ---- 7. Push / publish, opt-in only -------------------------------------
  if (shouldPush) {
    console.log("release: pushing commit and tags...");
    git(["push"]);
    git(["push", "--tags"]);
  }
  if (shouldPublish) {
    console.log("release: publishing to npm...");
    run("npm", ["publish"]);
  }

  if (!shouldPush || !shouldPublish) {
    console.log("\nrelease: local commit + tag done. Remaining steps:");
    if (!shouldPush) console.log("  git push && git push --tags");
    if (!shouldPublish) console.log("  npm publish");
  }
}

main();
