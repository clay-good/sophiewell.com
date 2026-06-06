#!/usr/bin/env node
// spec-v53 §4.4: output-safety lint gate.
//
// Bans the renderer "leak fingerprint": a compute call whose result is
// optional-chained into `.toFixed(` / `.toString(` / `.toPrecision(` and then
// interpolated into a string. When the compute function returns `null` for an
// edge input, `null?.toFixed(2)` evaluates to `undefined`, and the DOM shows the
// literal word `undefined` (spec-v53 §2.1, Class A). Renderers must instead pass
// the result through `fmt()` (lib/num.js), which substitutes a fallback string.
//
// Scans views/*.js (the only files that render compute results to the DOM).
// Exit 0 clean, 1 on any violation. The detector `findOutputSafetyViolations`
// is exported so test/unit can prove the gate bites on a reintroduced pattern.

import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(import.meta.url), '..', '..');

// The banned fingerprint: `)?.toFixed(` (or toString / toPrecision) -- a call
// result optional-chained into a number-formatting method. `(?<=\))` anchors on
// the close-paren of the compute call so a plain `x?.toFixed()` on an
// already-guarded local is not the target; the leak is specifically chaining
// off a fresh `fn(...)` result.
const LEAK = /\)\s*\?\.\s*(?:toFixed|toString|toPrecision)\s*\(/g;

// findOutputSafetyViolations(text) -> [{ line, snippet }]. Pure; line-numbered.
export function findOutputSafetyViolations(text) {
  const out = [];
  const lines = String(text || '').split('\n');
  for (let i = 0; i < lines.length; i += 1) {
    if (LEAK.test(lines[i])) out.push({ line: i + 1, snippet: lines[i].trim() });
    LEAK.lastIndex = 0;
  }
  return out;
}

async function listViewFiles() {
  const dir = join(ROOT, 'views');
  const names = await readdir(dir);
  return names.filter((n) => n.endsWith('.js')).map((n) => join('views', n));
}

async function main() {
  const files = await listViewFiles();
  const violations = [];
  for (const rel of files) {
    const text = await readFile(join(ROOT, rel), 'utf8');
    for (const v of findOutputSafetyViolations(text)) {
      violations.push(`${rel}:${v.line}  ${v.snippet}`);
    }
  }
  if (violations.length) {
    console.error('check-output-safety: FAIL -- renderer leak fingerprint (compute()?.toFixed/.toString) found.');
    console.error('  Route the result through fmt() (lib/num.js) with a fallback string instead.');
    for (const v of violations) console.error('  ' + v);
    process.exit(1);
  }
  console.log(`check-output-safety: clean (${files.length} view files scanned).`);
}

// Only run the CLI when invoked directly, not when imported by a unit test.
if (process.argv[1] && process.argv[1].endsWith('check-output-safety.mjs')) {
  main().catch((err) => { console.error(err); process.exit(1); });
}
