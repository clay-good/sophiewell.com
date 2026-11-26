#!/usr/bin/env node
// Finder (not a gate): inputs a calculator READS that no surface can SUPPLY.
//
// The agent tool calls each library with the arguments its MCP adapter declares, and the page
// passes the same keys (check-mcp-catalog round-trips the two). A library that reads a key outside
// that set is reading something nobody can say, and whatever branch sits behind it is either dead
// or, worse, decides the answer for everyone who could not say it:
//
//   uiss-rcc      refused node-positive disease on `nodePositive` / `metastatic`; nothing asked,
//                 so N1 or M1 disease got a localized tier and its survival figure.
//   minor-self-consent
//                 routed a married Texas minor on `married`; nothing supplied it.
//   ireton-jones  fell back to `obese` when the height was blank, so every blank height was
//                 "not obese" and lost the -609 kcal/day term.
//
// spec-v1803: one row is accepted and judged below -- spetzler-ponce, where a Spetzler-Martin grade is an
// alternative to the class the adapter asks for and gives the same tier. The note here used to name
// peds-bmi-percentile as a second; the finder no longer reaches it, and the ledger said so on its first
// run, which is what a ledger is for.
//
// Reach is printed. Only compute functions that read one input object named `o`
// (`const o = input ...`) or destructure their parameter are read; helpers they call are not, and
// an adapter with a `toArgs` transform is skipped because its args are not the library's keys.

import { readdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIR = join(ROOT, 'mcp', 'adapters');

function readsOf(src) {
  const body = src.replace(/\/\/[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '');
  const keys = new Set();
  if (/\bconst o = /.test(body)) {
    for (const m of body.matchAll(/\bo\.([A-Za-z_$][\w$]*)/g)) keys.add(m[1]);
    for (const m of body.matchAll(/\bo\[['"]([\w$]+)['"]\]/g)) keys.add(m[1]);
    return keys;
  }
  const head = body.match(/^[^(]*\(\s*\{([^}]*)\}\s*=\s*\{\}/);
  if (head) {
    for (const part of head[1].split(',')) {
      const name = part.split(/[=:]/)[0].trim();
      if (/^[A-Za-z_$][\w$]*$/.test(name)) keys.add(name);
    }
    return keys;
  }
  return null;
}

// spec-v1803: THE FILE-UPLOAD SURFACE SUPPLIES KEYS TOO. `lib/upload-worker.js` maps a parsed file's rows
// onto a structured key -- `fillRows` by default, and `medicationRows`, `apptRows`, `claimRows` or
// `authRows` for the tools named there -- and calls the library with it. That is a real surface a reader
// reaches by dropping a CSV on the page, so a library reading those keys is reading something somebody CAN
// say. Reading only the adapter's fields called three of them unsupplied.
//
// The map is read from the worker's source rather than copied, so a new tool added there is covered the
// day it is added.
const WORKER = join(ROOT, 'lib', 'upload-worker.js');
const workerSrc = readFileSync(WORKER, 'utf8');
const UPLOAD_KEYS = new Set(['fillRows']);
for (const m of workerSrc.matchAll(/'([A-Za-z_$][\w$]*Rows)'/g)) UPLOAD_KEYS.add(m[1]);
// And the keys the worker builds by hand for the two tools it reshapes itself.
for (const m of workerSrc.matchAll(/result = fn\(\{ \.\.\.input, (\w+) \}\)/g)) UPLOAD_KEYS.add(m[1]);

// Rows where the extra key is an ALTERNATIVE the adapter's own field already covers, so no reader is
// decided for. Each was read and is recorded here rather than printed every run.
const JUDGED = {
  'spetzler-ponce:smGrade': 'a Spetzler-Martin grade is an alternative to the class the adapter asks for, and gives the same tier',
};
const ALL = process.argv.includes('--all');
const judgedSeen = new Set();

const rows = [];
let entries = 0;
let read = 0;
let reshaped = 0;
for (const file of readdirSync(DIR).filter((f) => f.endsWith('.js')).sort()) {
  const mod = await import(pathToFileURL(join(DIR, file)).href);
  const list = Array.isArray(mod.default) ? mod.default : [];
  for (const e of list) {
    if (!e || typeof e.compute !== 'function' || !Array.isArray(e.fields)) continue;
    entries++;
    if (typeof e.toArgs === 'function') { reshaped++; continue; }
    const keys = readsOf(e.compute.toString());
    if (!keys) continue;
    read++;
    const args = new Set(e.fields.map((f) => f.arg));
    const extra = [...keys].filter((k) => !args.has(k) && !UPLOAD_KEYS.has(k));
    const kept = [];
    for (const k of extra) {
      const jk = `${e.id}:${k}`;
      if (JUDGED[jk]) { judgedSeen.add(jk); if (ALL) console.log(`JUDGED\t${jk}\t${JUDGED[jk]}`); continue; }
      kept.push(k);
    }
    if (kept.length) rows.push({ id: e.id, file, extra: kept });
  }
}

for (const k of Object.keys(JUDGED)) {
  if (!judgedSeen.has(k)) console.log(`STALE-LEDGER\t${k}\t(judged here, but the finder no longer reaches it)`);
}
console.log(`${rows.length} calculator(s) read an input no surface supplies (${judgedSeen.size} judged).\n`);
for (const r of rows) console.log(`  ${r.id.padEnd(34)} ${r.extra.join(', ')}   (mcp/adapters/${r.file})`);
console.log(`\nReach: ${entries} adapter entries; ${read} compute functions read directly`
  + ` (an \`o\` input object or a destructured parameter); ${reshaped} reshape their input with toArgs`
  + ` and ${entries - read - reshaped} delegate or wrap; neither was read.`
  + ` ${UPLOAD_KEYS.size} structured row key(s) are supplied by lib/upload-worker.js and counted as said.`);
