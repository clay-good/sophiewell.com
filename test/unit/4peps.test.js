// spec-v106 2.2: 4PEPS (Roy 2021). 13 weighted items, total -5..+21, four tiers.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fourPeps } from '../../lib/vte-v106.js';

test('very low: age 40 alone scores -2 (no test)', () => {
  const r = fourPeps({ age: 40 });
  assert.equal(r.total, -2);
  assert.equal(r.tier, 'very low');
});

test('low tier example: age 70 + male = +2 -> low (D-dimer < 1000)', () => {
  const r = fourPeps({ age: 70, male: true });
  assert.equal(r.total, 2);
  assert.equal(r.tier, 'low');
});

test('band flip: total crossing the moderate -> high boundary (12 -> 13)', () => {
  // age >=65 (0) + male (2) + prior VTE (2) + syncope (2) + immobility (2) +
  // calf/edema (3) = 11 -> moderate; add chest pain+dyspnea (1) = 12 moderate.
  const mod = fourPeps({ age: 70, male: true, priorVte: true, syncope: true, immobility: true, calfPainEdema: true, chestPainDyspnea: true });
  assert.equal(mod.total, 12);
  assert.equal(mod.tier, 'moderate');
  // add SpO2 < 95 (+3) crosses into high (>= 13, clamped path).
  const hi = fourPeps({ age: 70, male: true, priorVte: true, syncope: true, immobility: true, calfPainEdema: true, chestPainDyspnea: true, spo2: 92 });
  assert.equal(hi.total, 15);
  assert.equal(hi.tier, 'high');
});

test('negative items: chronic resp -1 and HR < 80 -1 lower the total', () => {
  const r = fourPeps({ age: 40, chronicResp: true, heartRate: 70 });
  assert.equal(r.total, -4); // -2 age, -1 resp, -1 HR<80
  assert.equal(r.tier, 'very low');
});

test('age requires a value; blank age -> fallback', () => {
  assert.equal(fourPeps({}).valid, false);
  assert.equal(fourPeps({ age: 0 }).valid, false);
});

test('total clamps to the published -5..+21 range', () => {
  const r = fourPeps({
    age: 70, male: true, estrogen: true, priorVte: true, syncope: true,
    immobility: true, calfPainEdema: true, chestPainDyspnea: true, spo2: 80, peMostLikely: true,
  });
  assert.ok(r.total <= 21 && r.total >= -5);
  assert.equal(r.tier, 'high');
});
