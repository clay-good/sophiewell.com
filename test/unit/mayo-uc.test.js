// spec-v93 §2.5: Mayo score / partial Mayo for ulcerative colitis.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mayoUc } from '../../lib/hepgi-v93.js';

test('full Mayo: all four subscores -> 8 (0-12), moderate', () => {
  const r = mayoUc({ stoolFreq: 2, rectalBleeding: 2, physicianGlobal: 2, endoscopy: 2 });
  assert.equal(r.form, 'full');
  assert.equal(r.total, 8);
  assert.equal(r.bandKey, 'moderate');
});

test('partial Mayo: endoscopy omitted -> 6 (0-9), moderate', () => {
  const r = mayoUc({ stoolFreq: 2, rectalBleeding: 2, physicianGlobal: 2 });
  assert.equal(r.form, 'partial');
  assert.equal(r.total, 6);
  assert.equal(r.bandKey, 'moderate');
});

test('same subscores produce different bands under each form', () => {
  // full 6 = moderate; partial 6 = moderate but a partial 5 = moderate, full 5 = mild
  assert.equal(mayoUc({ stoolFreq: 2, rectalBleeding: 2, physicianGlobal: 1, endoscopy: 0 }).bandKey, 'mild'); // full 5
  assert.equal(mayoUc({ stoolFreq: 2, rectalBleeding: 2, physicianGlobal: 1 }).bandKey, 'moderate');          // partial 5
});

test('endoscopy 0 still computes the full form', () => {
  const r = mayoUc({ stoolFreq: 0, rectalBleeding: 0, physicianGlobal: 0, endoscopy: 0 });
  assert.equal(r.form, 'full');
  assert.equal(r.total, 0);
  assert.equal(r.bandKey, 'remission');
});

test('out-of-range subscore is clamped', () => {
  const r = mayoUc({ stoolFreq: 9, rectalBleeding: 0, physicianGlobal: 0 });
  assert.equal(r.components.stoolFreq, 3);
  assert.equal(r.clamped, true);
});

// spec-v1755: a Mayo subscore has no value between its steps; a fraction was summed.
test('spec-v1755: mayoUc refuses a half-step subscore; whole subscores and the worked example answer', () => {
  const ex = { stoolFreq: 2, rectalBleeding: 2, physicianGlobal: 2, endoscopy: 2 };
  assert.equal(mayoUc(ex).total, 8);
  const half = mayoUc({ ...ex, stoolFreq: 2.5 });
  assert.equal(half.valid, false);
  assert.match(half.band, /whole number/);
  assert.equal(mayoUc({ ...ex, stoolFreq: 3 }).total, 9);
});
