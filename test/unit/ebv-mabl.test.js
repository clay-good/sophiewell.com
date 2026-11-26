// spec-v61 §3.3: estimated blood volume + max allowable blood loss.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ebvMabl } from '../../lib/clinical-v7.js';

test('example: 70 kg adult-male factor 75, Hct 45->30 = EBV 5250, MABL 1750', () => {
  const r = ebvMabl({ weightKg: 70, ebvFactor: 75, startHct: 45, minHct: 30 });
  assert.equal(r.ebv, 5250);
  assert.equal(r.mabl, 1750);
});
test('min Hct above start Hct throws RangeError', () => {
  assert.throws(() => ebvMabl({ weightKg: 70, ebvFactor: 75, startHct: 30, minHct: 45 }), RangeError);
});
test('zero start Hct / weight -> null fallback', () => {
  // spec-v1801: the minimum acceptable hematocrit now carries BOUNDS.hematocrit's floor, so the 0 this
  // case used to pass incidentally is refused on its own account. The subject here is the START hematocrit
  // and the weight, so each is tested with the other values valid.
  assert.equal(ebvMabl({ weightKg: 70, ebvFactor: 75, startHct: 0, minHct: 30 }), null);
  assert.equal(ebvMabl({ weightKg: 0, ebvFactor: 75, startHct: 45, minHct: 30 }), null);
});

test('spec-v1801: a minimum acceptable hematocrit below the envelope is refused, not answered', () => {
  assert.throws(() => ebvMabl({ weightKg: 70, ebvFactor: 75, startHct: 45, minHct: 1.5 }), /hct must be between 3 and 100/i);
  assert.notEqual(ebvMabl({ weightKg: 70, ebvFactor: 75, startHct: 45, minHct: 25 }), null);
});
