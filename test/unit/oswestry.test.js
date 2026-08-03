// spec-v643: Oswestry Disability Index (ODI).
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { oswestryDisabilityIndex, ODI_SECTIONS } from '../../lib/oswestry-v643.js';

const KEYS = ODI_SECTIONS.map((s) => s.key);
function allAt(v) { const o = {}; for (const k of KEYS) o[k] = String(v); return o; }

test('META example: all ten sections at 3 = 60% severe', () => {
  const r = oswestryDisabilityIndex(allAt(3));
  assert.equal(r.total, 60);
  assert.equal(r.band, 'severe disability');
  assert.match(r.bandLabel, /ODI 60%/);
  assert.match(r.bandLabel, /severe disability/);
});

test('bands cover the full range', () => {
  assert.equal(oswestryDisabilityIndex(allAt(1)).band, 'minimal disability'); // 20%
  assert.equal(oswestryDisabilityIndex(allAt(2)).band, 'moderate disability'); // 40%
  assert.equal(oswestryDisabilityIndex(allAt(3)).band, 'severe disability'); // 60%
  assert.equal(oswestryDisabilityIndex(allAt(4)).band, 'crippled'); // 80%
  assert.equal(oswestryDisabilityIndex(allAt(5)).band, 'bed-bound (or symptoms exaggerated)'); // 100%
});

test('band boundaries are inclusive at the upper edge', () => {
  // 20% is minimal (0-20), 21% is moderate.
  assert.equal(oswestryDisabilityIndex(allAt(1)).total, 20);
  assert.equal(oswestryDisabilityIndex(allAt(1)).band, 'minimal disability');
});

test('variable denominator: an omitted section drops the divisor by 5', () => {
  // Nine sections at 3 = sum 27, denominator 45 -> 60% (same grade as all ten at 3).
  const nine = allAt(3);
  delete nine.sexLife;
  const r = oswestryDisabilityIndex(nine);
  assert.equal(r.sectionsAnswered, 9);
  assert.equal(r.sum, 27);
  assert.equal(r.total, 60);
});

test('rounding to a whole percent', () => {
  // Five sections at 1 = sum 5, denominator 25 -> 20%. One section at 1 = 5/5 = 20%.
  const one = { pain: '1' };
  assert.equal(oswestryDisabilityIndex(one).total, 20);
  // Fractional case: sum 10 over 9 sections = 10/45 = 22.2% -> rounds to 22.
  const nine = {};
  for (const k of KEYS.slice(0, 9)) nine[k] = '0';
  nine.pain = '5'; nine.lifting = '5'; // sum 10 across 9 answered
  const r = oswestryDisabilityIndex(nine);
  assert.equal(r.sectionsAnswered, 9);
  assert.equal(r.sum, 10);
  assert.equal(r.total, 22);
});

test('invalid: no sections answered, and out-of-range values', () => {
  assert.equal(oswestryDisabilityIndex({}).valid, false);
  assert.equal(oswestryDisabilityIndex({ pain: '6' }).valid, false);
  assert.equal(oswestryDisabilityIndex({ pain: '-1' }).valid, false);
  assert.equal(oswestryDisabilityIndex({ pain: '2.5' }).valid, false);
});
