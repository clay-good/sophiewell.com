// spec-v115 2.2: Brock University / PanCan nodule model (McWilliams 2013, full
// model with spiculation). x = -6.7892 + 0.0287*(age-62) + 0.6011*female
//   + 0.2961*familyHistory + 0.2953*emphysema - 5.3854*((size/10)^-0.5 - 1.58113883)
//   + typeCoef + 0.6581*upperlobe - 0.0824*(count-4) + 0.7729*spiculation;
// typeCoef solid 0 / part-solid +0.377 / non-solid -0.1276; prob = e^x/(1+e^x).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { brockNodule } from '../../lib/pulmnod-v115.js';

test('worked example: 65 yo, female, emphysema, 15 mm solid, upper, 2 nodules, spiculated -> 47.7% intermediate', () => {
  const r = brockNodule({ age: 65, female: true, emphysema: true, size: 15, type: 'solid', upperlobe: true, count: 2, spiculation: true });
  assert.equal(r.valid, true);
  assert.equal(r.pct, 47.7);
  assert.equal(r.tier, 'intermediate');
});

test('low anchor: 55 yo male, 5 mm solid, lower lobe, single, no risk factors -> 0.3% low', () => {
  const r = brockNodule({ age: 55, size: 5, type: 'solid', count: 1 });
  assert.equal(r.pct, 0.3);
  assert.equal(r.tier, 'low');
});

test('high anchor: 70 yo female, family history, emphysema, 20 mm part-solid, upper, spiculated -> 80.1% high', () => {
  const r = brockNodule({ age: 70, female: true, familyHistory: true, emphysema: true, size: 20, type: 'part-solid', upperlobe: true, count: 1, spiculation: true });
  assert.equal(r.pct, 80.1);
  assert.equal(r.tier, 'high');
});

test('nodule type changes the probability (part-solid > solid > non-solid)', () => {
  const base = { age: 65, size: 12, count: 1, upperlobe: true };
  const solid = brockNodule({ ...base, type: 'solid' }).pct;
  const part = brockNodule({ ...base, type: 'part-solid' }).pct;
  const non = brockNodule({ ...base, type: 'non-solid' }).pct;
  assert.ok(part > solid);
  assert.ok(solid > non);
});

test('zero or negative size renders a guard fallback (no ln/power on a non-positive domain)', () => {
  const r = brockNodule({ age: 65, size: 0, count: 1 });
  assert.equal(r.valid, false);
});

test('extreme inputs do not overflow to NaN/Infinity', () => {
  const r = brockNodule({ age: 1e9, size: 1e-9, count: 1 });
  assert.equal(r.valid, true);
  assert.ok(Number.isFinite(r.pct));
  assert.ok(r.pct <= 100);
});
