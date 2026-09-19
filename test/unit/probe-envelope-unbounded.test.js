// spec-v1251: the envelope probe recognizes its known reassuring vocabulary
// and does not map ratio inputs merely because their metadata names an example
// unit.
import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const PROBE = fileURLToPath(new URL('../../scripts/probe-envelope-unbounded.mjs', import.meta.url));

test('envelope probe keeps its drained queue after LIPI documents shared units', () => {
  const output = execFileSync(process.execPath, [PROBE], { encoding: 'utf8' });

  assert.match(output, /^0 field\(s\) across 0 calculator\(s\) answer/m);
  assert.match(output, /REASSURING FROM AN IMPOSSIBLE VALUE -- 0/);
  assert.doesNotMatch(output, /lipi\|lipi-wbc/);
});

// spec-v1406: the map was blind to two-fifths of lib/bounds.js (weight, height, age, INR, BMI,
// eGFR, BUN, QT and the rest), and 97 fields that answered from an impossible value, or asked for
// one the reader had typed, never showed up. Every section reads zero across the full map now.
// This also fails if the map shrinks back, since a zero from a smaller map is not the same claim.
test('envelope probe: every section is zero across the full map', () => {
  const out = execFileSync(process.execPath, [PROBE], { encoding: 'utf8' });
  assert.match(out, /THE REST -- 0/);
  assert.match(out, /ASKED FOR A VALUE THE READER ENTERED -- 0/);
  assert.match(out, /0 are mis-mapped/);
  const reach = Number(out.match(/Reach: (\d+) field\(s\)/)[1]);
  const testable = Number(out.match(/(\d+) have a worked example inside that envelope/)[1]);
  assert.ok(reach >= 700, `reach fell to ${reach} fields; the map has lost rows`);
  assert.ok(testable >= 650, `only ${testable} fields are testable; the zero covers less than it did`);
});
