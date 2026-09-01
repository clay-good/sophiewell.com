#!/usr/bin/env node
// spec-v952: every tile id a test navigates to is a live tile.
//
// spec-v948 retired four duplicate tiles. The pre-retirement sweep grepped for
// the quoted form `'cincinnati'` across .js and .mjs and found the unit and MCP
// tests. It missed `test/integration/smoke.spec.js`, which writes ids the way a
// reader does -- as a URL fragment, `page.goto('/#cincinnati')`. CI went red an
// hour after the push (spec-v951), on a test that had nothing to do with the
// change except that it named a tile.
//
// The redirect worked perfectly, which is the second half of the lesson: the
// alias took the test to `cpss`, a tile in a DIFFERENT GROUP whose renderer does
// not emit the notice the test asserts. An alias keeps a reader's permalink
// working; it does not keep a test's assumptions true.
//
// So: fail on an id that is not a live tile, and fail on a RETIRED one even
// though it redirects, unless the test is deliberately exercising the redirect
// and says so by listing itself in ALIAS_TESTS below.
//
// Run: node scripts/check-test-tile-ids.mjs   (wired into `npm run lint`)
// Exit 0 clean, 1 on violation.

import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(import.meta.url), '..', '..');

// Tests that navigate to a retired id ON PURPOSE, to prove the redirect works.
// `file:id` pairs, so listing one does not excuse the rest of the file.
export const ALIAS_TESTS = new Set([]);

// This gate's own test file holds retired and invented ids as FIXTURES -- they
// are the inputs that prove the rule bites, not navigation. Scanning it would
// make the gate fail on its own evidence.
const SELF_TEST = 'test/unit/check-test-tile-ids.test.js';

// Every way a test names a tile in a URL: the fragment a reader's permalink
// uses, and the pre-rendered page path.
const PATTERNS = [
  /['"`]\/#([a-z0-9][a-z0-9-]*)['"`]/g,
  /['"`]\/tools\/([a-z0-9][a-z0-9-]*)\/?['"`]/g,
  /['"`]#([a-z0-9][a-z0-9-]*)['"`]\s*\)?\s*;?\s*\/\/\s*tile/g,
];

// findTestTileIds(text) -> [{ id, line }]. Pure, so the shape is testable.
export function findTestTileIds(text) {
  const out = [];
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    for (const re of PATTERNS) {
      re.lastIndex = 0;
      let m = re.exec(lines[i]);
      while (m) {
        out.push({ id: m[1], line: i + 1 });
        m = re.exec(lines[i]);
      }
    }
  }
  return out;
}

// parseIds(appJsText) -> { live, retired }.
export function parseIds(appJsText) {
  const live = new Set();
  const start = appJsText.indexOf('const UTILITIES = [');
  // Bound the slice at the array's own closing bracket. Reading to end of file
  // swept up `id: 'tool-body'` from an unrelated DOM helper and reported 1707
  // tiles against a catalog of 1706.
  const end = start === -1 ? -1 : appJsText.indexOf('\n];', start);
  const body = start === -1 || end === -1 ? '' : appJsText.slice(start, end);
  for (const m of body.matchAll(/\{\s*id:\s*'([^']+)'/g)) live.add(m[1]);

  const retired = new Map();
  const aStart = appJsText.indexOf('const RETIRED_TILE_ALIASES = new Map([');
  if (aStart !== -1) {
    const aEnd = appJsText.indexOf(']);', aStart);
    for (const m of appJsText.slice(aStart, aEnd).matchAll(/\['([^']+)',\s*'([^']+)'\]/g)) {
      retired.set(m[1], m[2]);
    }
  }
  return { live, retired };
}

// findViolations({ files, live, retired, aliasTests }) -> [string]. Pure.
export function findViolations({ files, live, retired, aliasTests = new Set() }) {
  const out = [];
  for (const { path, text } of files) {
    for (const { id, line } of findTestTileIds(text)) {
      if (live.has(id)) continue;
      if (retired.has(id)) {
        if (aliasTests.has(`${path}:${id}`)) continue;
        out.push(`${path}:${line} navigates to '${id}', retired in favour of '${retired.get(id)}'. `
          + 'The redirect works, but the surviving tile may render something else entirely -- '
          + 'point the test at a live tile, or add it to ALIAS_TESTS if it is testing the redirect.');
        continue;
      }
      out.push(`${path}:${line} navigates to '${id}', which is not a tile.`);
    }
  }
  return out;
}

async function collect(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...await collect(full));
    else if (/\.(js|mjs)$/.test(entry.name)) {
      const path = `test/${full.slice(join(ROOT, 'test').length + 1)}`;
      if (path === SELF_TEST) continue;
      out.push({ path, text: await readFile(full, 'utf8') });
    }
  }
  return out;
}

async function main() {
  const appJs = await readFile(join(ROOT, 'app.js'), 'utf8');
  const { live, retired } = parseIds(appJs);
  const files = await collect(join(ROOT, 'test'));
  const violations = findViolations({ files, live, retired, aliasTests: ALIAS_TESTS });
  if (violations.length) {
    console.error('check-test-tile-ids: FAIL - tests navigating to a tile that is not there:');
    for (const v of violations) console.error(`  ${v}`);
    process.exit(1);
  }
  const refs = files.reduce((n, f) => n + findTestTileIds(f.text).length, 0);
  console.log(`check-test-tile-ids: clean (${refs} tile references across ${files.length} test files; `
    + `${live.size} live tiles, ${retired.size} retired ids).`);
}

if (import.meta.url === `file://${process.argv[1]}`) await main();
