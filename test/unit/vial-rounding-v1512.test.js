// spec-v1512 tool 1: dose rounding to whole vials.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { vialRounding as v, vialRounding, MAX_STEPS } from '../../lib/vial-rounding-v1512.js';

test('mg/kg dose rounds to the nearest whole-vial total within 10%', () => {
  const r = v({ basis: 'mgkg', dose: '5', weight: '84', vial1: '100' });
  assert.equal(r.rounded, 400);
  assert.match(r.band, /discarding 80 mg/);
});

test('ties on total break on cost', () => {
  assert.match(v({ basis: 'mg', dose: '460', vial1: '100', vial2: '500', cost1: '700', cost2: '3400' }).band, /: 1 × 500 mg, nothing discarded, \$3,400\.00/);
});

test('no combination within the threshold says rounding is not within policy', () => {
  const r = v({ basis: 'mg', dose: '150', vial1: '100', threshold: '5' });
  assert.equal(r.rounded, null);
  assert.equal(r.bandLabel, 'Not within policy');
});

test('an exact whole-vial dose needs no rounding and discards nothing', () => {
  const r = v({ basis: 'mg', dose: '400', vial1: '100' });
  assert.equal(r.rounded, 400);
  assert.match(r.band, /JZ modifier/);
});

test('blank inputs ask', () => {
  assert.equal(v({}).valid, false);
  assert.equal(v({ basis: 'mg', vial1: '100' }).valid, false);
  assert.equal(v({ basis: 'mgkg', dose: '5', vial1: '100' }).valid, false);
  assert.equal(v({ basis: 'mg', dose: '400' }).valid, false);
});

// It used to list every combination of vial counts and sort them. 10,000 mg
// from 1, 5 and 10 mg vials was about 2.6e10 combinations: the page froze, and
// the field-values e2e sweep hung on this tile until it timed out.
test('a large dose from small vials answers promptly', () => {
  const t = Date.now();
  const r = vialRounding({ basis: 'mg', dose: '10000', vial1: '1', vial2: '5', vial3: '10' });
  assert.ok(Date.now() - t < 2000, `took ${Date.now() - t} ms`);
  assert.equal(r.rounded, 10000);
  assert.match(r.band, /1000 × 10 mg, nothing discarded/);
});

test('a search too large to finish is refused, not attempted', () => {
  const t = Date.now();
  const r = vialRounding({ basis: 'mgkg', dose: '1000000', weight: '350', vial1: '0.001', vial2: '0.002', vial3: '0.003' });
  assert.ok(Date.now() - t < 500);
  assert.equal(r.valid, false);
  assert.match(r.message, new RegExp(`more than ${MAX_STEPS.toLocaleString('en-US')} steps`));
});

test('ties go to the combination the full enumeration listed first', () => {
  // 1630 and 1620 are both 5 mg from 1625 with six vials each.
  const r = vialRounding({ basis: 'mg', dose: '1625', threshold: '25', vial1: '500', vial2: '40', cost2: '250', vial3: '50', cost3: '285' });
  assert.equal(r.rounded, 1630);
  assert.match(r.band, /3 × 500 mg \+ 2 × 40 mg \+ 1 × 50 mg/);
});
