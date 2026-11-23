// spec-v108 2.1: TRISS (Boyd 1987; MTOS coefficients). Ps = 1/(1+e^-b).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { triss } from '../../lib/trauma-v108.js';

test('partial input -> complete-the-fields fallback', () => {
  assert.equal(triss({}).valid, false);
  assert.equal(triss({ rts: 6, iss: 25 }).valid, false); // no age
});

test('tile example: blunt RTS 6, ISS 25, age 60 -> 65.8%', () => {
  const r = triss({ mechanism: 'blunt', rts: 6, iss: 25, age: 60 });
  assert.equal(r.valid, true);
  assert.equal(r.pct, 65.8);
  assert.match(r.band, /probability of survival 65\.8% \(blunt/);
});

test('band flip: same inputs, penetrating set gives a different (lower) Ps', () => {
  const blunt = triss({ mechanism: 'blunt', rts: 6, iss: 25, age: 60 });
  const pen = triss({ mechanism: 'penetrating', rts: 6, iss: 25, age: 60 });
  assert.equal(pen.pct, 45);
  assert.ok(pen.pct < blunt.pct);
  assert.equal(pen.mechanism, 'penetrating');
});

test('age >= 55 applies the age penalty (AgeIndex 1)', () => {
  const young = triss({ mechanism: 'blunt', rts: 6, iss: 25, age: 40 });
  const old = triss({ mechanism: 'blunt', rts: 6, iss: 25, age: 60 });
  assert.equal(young.ageIndex, 0);
  assert.equal(old.ageIndex, 1);
  assert.ok(young.pct > old.pct);
});

test('out-of-range RTS / ISS reject', () => {
  assert.equal(triss({ rts: 9, iss: 25, age: 30 }).valid, false);
  assert.equal(triss({ rts: 6, iss: 99, age: 30 }).valid, false);
});

test('overflow-safe: extreme age does not leak NaN/Infinity', () => {
  // spec-v1741: age now has an envelope (0 to 130 years), so the probe sits at its
  // top; an age of 1e9 is refused.
  const r = triss({ mechanism: 'blunt', rts: 7.8408, iss: 75, age: 130 });
  assert.equal(r.valid, true);
  assert.ok(Number.isFinite(r.pct));
  assert.equal(triss({ mechanism: 'blunt', rts: 7.8408, iss: 75, age: 1e9 }).valid, false);
});

test('spec-v1741: an age past the envelope is refused, an old real one and the example answer', () => {
  const tenX = triss({ mechanism: 'blunt', rts: 6, iss: 25, age: 1300 });
  assert.equal(tenX.valid, false);
  assert.match(tenX.band, /plausible range for age/);
  assert.equal(triss({ mechanism: 'blunt', rts: 6, iss: 25, age: 110 }).valid, true);
  assert.equal(triss({ mechanism: 'blunt', rts: 6, iss: 25, age: 60 }).band,
    'TRISS probability of survival 65.8% (blunt mechanism; RTS 6, ISS 25, age >= 55).');
});

// spec-v1746: an entered value outside the range read as blank and was asked for again.
test('spec-v1746: an out-of-range RTS, ISS or age is told its range, a blank is still asked for', () => {
  const EX = { mechanism: 'blunt', rts: 6, iss: 25, age: 60 };
  for (const [k, v] of [['rts', 999999], ['iss', 999999], ['age', -999999]]) {
    const r = triss({ ...EX, [k]: v });
    assert.equal(r.valid, false);
    assert.match(r.band, /must be/);
  }
  assert.match(triss({ ...EX, age: null }).band, /^Enter the patient age/);
  assert.match(triss({ ...EX, iss: null }).band, /^Enter the Injury Severity Score/);
  assert.equal(triss(EX).valid, true);
});

// spec-v1773: the ISS is the sum of the squares of three AIS grades, so 25.5 is not a score anyone has.
// The coded RTS beside it is a weighted sum and stays fractional.
test('a half-step ISS is refused; the coded RTS stays fractional', () => {
  const r = triss({ rts: 7.8408, iss: 25.5, age: 40, mechanism: 'blunt' });
  assert.equal(r.valid, false);
  assert.match(r.message || r.band, /whole number/);
  assert.equal(triss({ rts: 6.9041, iss: 25, age: 40, mechanism: 'blunt' }).valid, true);
});
