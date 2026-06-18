// spec-v103 2.3: MESA 10-year CHD risk with/without coronary-artery calcium
// (McClelland 2015).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mesaChd } from '../../lib/cvrisk-v103.js';

const base = { age: 60, male: true, race: 'white', totalChol: 200, hdl: 50, sbp: 125 };

test('missing inputs -> invalid', () => {
  assert.equal(mesaChd({ age: 60 }).valid, false);
});

test('without CAC reports a risk and no with-CAC value', () => {
  const r = mesaChd({ ...base });
  assert.equal(r.riskNoCac, 4.86);
  assert.equal(r.riskWithCac, null);
});

test('a CAC of 100 raises the estimate (with-CAC delta visible)', () => {
  const r = mesaChd({ ...base, cac: 100 });
  assert.equal(r.riskNoCac, 4.86);
  assert.equal(r.riskWithCac, 7.34);
  assert.ok(r.riskWithCac > r.riskNoCac);
});

test('CAC of 0 lowers the estimate below the no-CAC figure', () => {
  const r = mesaChd({ ...base, cac: 0 });
  assert.ok(r.riskWithCac < r.riskNoCac);
});

test('White is the reference race; an unknown race falls back to White', () => {
  assert.equal(mesaChd({ ...base, race: 'klingon' }).race, 'white');
});

test('extreme fuzzed CAC stays finite and in [0,100]', () => {
  const r = mesaChd({ ...base, cac: 1e9 });
  assert.ok(r.riskWithCac >= 0 && r.riskWithCac <= 100 && Number.isFinite(r.riskWithCac));
});
