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
  const r = triss({ mechanism: 'blunt', rts: 7.8408, iss: 75, age: 1e9 });
  assert.equal(r.valid, true);
  assert.ok(Number.isFinite(r.pct));
});
