// spec-v1803: the file-upload surface really does supply the structured row keys three libraries read.
//
// `scripts/probe-unsupplied-input.mjs` asks which inputs a library reads that no surface can send, and the
// answer used to include `fillRows`, `medicationRows` and `apptRows` -- which `lib/upload-worker.js` sends
// every time a reader drops a CSV on the page. This file used to carry those three in a BY_DESIGN list
// beside the probe's own note, which is one rule written twice; the probe reads the worker's map now, and
// `test/unit/finder-ledgers.test.js` holds it to zero findings with its remaining judgement.
//
// What is left here is the invariant that makes the probe's reading TRUE and which no ledger can state: the
// worker must still hand those keys over. If a tool is dropped from its map, the library branch behind the
// key becomes unreachable again -- and the probe, reading the same map, would fall silent about it.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const worker = readFileSync(fileURLToPath(new URL('../../lib/upload-worker.js', import.meta.url)), 'utf8');

test('the upload worker still hands a parsed file to the libraries that read structured rows', () => {
  // The default key, and the per-tool overrides the map names.
  assert.match(worker, /\|\| 'fillRows'/, 'the default row key');
  for (const [tool, key] of [
    ['med-sync-plan', 'medicationRows'],
    ['chair-day-planner', 'apptRows'],
    ['pharmacy-spread-check', 'claimRows'],
    ['auth-runout', 'authRows'],
  ]) {
    assert.match(worker, new RegExp(`'${tool}': '${key}'`), `${tool} -> ${key}`);
  }
  // And it is actually passed to the compute, not merely named.
  assert.match(worker, /fn\(\{ \.\.\.input, \[rowKey\]: mappedRows \}\)/);
});

test('each library that reads a structured row key still falls back to the text field beside it', () => {
  // The page and the agent surface send the same rows as TEXT, so the key is an alternative and never the
  // only way in. `Array.isArray(o.<key>) ? o.<key> : o.<text>` is that fallback, and losing it would make
  // the text field unreadable for everyone who does not upload a file.
  const pairs = [
    ['adherence-v1513.js', /Array\.isArray\(o\.fillRows\) \? o\.fillRows : o\.fills/],
    ['adherence-v1513.js', /Array\.isArray\(o\.medicationRows\) \? o\.medicationRows : o\.meds/],
    ['chair-day-planner.js', /Array\.isArray\(o\.apptRows\) \? o\.apptRows : fromText\(o\.appointments\)/],
  ];
  for (const [file, re] of pairs) {
    const src = readFileSync(fileURLToPath(new URL(`../../lib/${file}`, import.meta.url)), 'utf8');
    assert.match(src, re, `${file} must keep its text fallback`);
  }
});
