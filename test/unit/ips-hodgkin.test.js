// spec-v661: International Prognostic Score (IPS) for advanced Hodgkin lymphoma.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { ipsHodgkin } from '../../lib/ips-hodgkin-v661.js';

// A "no adverse factor" baseline: albumin 4.5, Hgb 13, age 30, WBC 8000, lymph 2000.
const clean = { albumin: '4.5', hemoglobin: '13', age: '30', wbc: '8000', lymphocyteCount: '2000' };

test('all factors absent = 0', () => {
  assert.equal(ipsHodgkin(clean).total, 0);
});

test('all seven factors present = 7', () => {
  const r = ipsHodgkin({ albumin: '3.5', hemoglobin: '10', age: '50', wbc: '16000', lymphocyteCount: '500', male: true, stageIV: true });
  assert.equal(r.total, 7);
});

test('each numeric threshold scores independently at its boundary', () => {
  assert.equal(ipsHodgkin({ ...clean, albumin: '3.9' }).total, 1); // < 4
  assert.equal(ipsHodgkin({ ...clean, albumin: '4' }).total, 0);   // not < 4
  assert.equal(ipsHodgkin({ ...clean, hemoglobin: '10.4' }).total, 1); // < 10.5
  assert.equal(ipsHodgkin({ ...clean, age: '45' }).total, 1); // >= 45
  assert.equal(ipsHodgkin({ ...clean, age: '44' }).total, 0);
  assert.equal(ipsHodgkin({ ...clean, wbc: '15000' }).total, 1); // >= 15000
  assert.equal(ipsHodgkin({ ...clean, lymphocyteCount: '599' }).total, 1); // < 600
});

test('lymphocytopenia fires on the percentage arm even when absolute >= 600', () => {
  // absolute 1050 (not < 600) but 7% (< 8%) -> still 1 point
  const r = ipsHodgkin({ ...clean, lymphocyteCount: '1050', lymphocytePct: '7' });
  assert.equal(r.total, 1);
  // 9% and absolute 2000 -> 0
  assert.equal(ipsHodgkin({ ...clean, lymphocyteCount: '2000', lymphocytePct: '9' }).total, 0);
});

test('booleans male and stage IV each add 1', () => {
  assert.equal(ipsHodgkin({ ...clean, male: true }).total, 1);
  assert.equal(ipsHodgkin({ ...clean, stageIV: true }).total, 1);
});

test('META example: albumin 3.5, Hgb 12, age 50, WBC 10000, lymph 800, male = 3', () => {
  const r = ipsHodgkin({ albumin: '3.5', hemoglobin: '12', age: '50', wbc: '10000', lymphocyteCount: '800', male: true });
  assert.equal(r.total, 3);
  assert.match(r.bandLabel, /IPS 3 of 7/);
});

test('the core numeric inputs are required', () => {
  assert.equal(ipsHodgkin({ albumin: '4', hemoglobin: '13', age: '30', wbc: '8000' }).valid, false);
  assert.equal(ipsHodgkin({ albumin: '4', hemoglobin: '13', age: '30', wbc: '8000' }).code, 'MISSING_INPUT');
});
