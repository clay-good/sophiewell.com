import { test } from 'node:test';
import assert from 'node:assert/strict';
import { electrolyteReplacement } from '../../lib/scoring-v4.js';

test('K within range (>=3.5) -> 0 mEq', () => {
  const r = electrolyteReplacement({ electrolyte: 'k', level: 3.8, route: 'iv' });
  assert.ok(r.dose.startsWith('0 mEq'));
});

test('K 3.0-3.4 -> 40 mEq', () => {
  const r = electrolyteReplacement({ electrolyte: 'k', level: 3.2, route: 'iv' });
  assert.equal(r.dose, '40 mEq');
});

test('K 2.5-2.9 -> 60 mEq', () => {
  const r = electrolyteReplacement({ electrolyte: 'k', level: 2.8, route: 'iv' });
  assert.equal(r.dose, '60 mEq');
});

test('K <2.5 -> 80 mEq', () => {
  const r = electrolyteReplacement({ electrolyte: 'k', level: 2.2, route: 'iv' });
  assert.equal(r.dose, '80 mEq');
});

test('Mg <1.0 -> 4 g MgSO4', () => {
  const r = electrolyteReplacement({ electrolyte: 'mg', level: 0.9, route: 'iv' });
  assert.equal(r.dose, '4 g MgSO4');
});

test('Mg 1.0-1.7 -> 2 g MgSO4', () => {
  const r = electrolyteReplacement({ electrolyte: 'mg', level: 1.4, route: 'iv' });
  assert.equal(r.dose, '2 g MgSO4');
});

test('Phos 1.6-2.2 -> 0.16 mmol/kg (Brown 2006)', () => {
  const r = electrolyteReplacement({ electrolyte: 'phos', level: 1.8, route: 'iv' });
  assert.equal(r.dose, '0.16 mmol/kg');
});

test('Phos <1.0 -> 0.64 mmol/kg', () => {
  const r = electrolyteReplacement({ electrolyte: 'phos', level: 0.8, route: 'iv' });
  assert.equal(r.dose, '0.64 mmol/kg');
});

test('Renal-impairment flag adds dose-halving banner', () => {
  const r = electrolyteReplacement({ electrolyte: 'k', level: 2.8, route: 'iv', renalImpaired: true });
  assert.ok(r.banners.some((b) => b.includes('Renal impairment')));
});

test('Rejects unknown electrolyte or route', () => {
  assert.throws(() => electrolyteReplacement({ electrolyte: 'na', level: 130 }));
  assert.throws(() => electrolyteReplacement({ electrolyte: 'k', level: 3.0, route: 'im' }));
});
