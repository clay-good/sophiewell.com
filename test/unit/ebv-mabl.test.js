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
  assert.equal(ebvMabl({ weightKg: 70, ebvFactor: 75, startHct: 0, minHct: 0 }), null);
  assert.equal(ebvMabl({ weightKg: 0, ebvFactor: 75, startHct: 45, minHct: 30 }), null);
});
