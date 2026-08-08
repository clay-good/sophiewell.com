// spec-v667: FGSI (Fournier's Gangrene Severity Index).
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { fgsi, FGSI_PARAMS } from '../../lib/fgsi-v667.js';

// All-normal physiology (each parameter in its 0-point band).
const normal = { temp: '37', hr: '80', rr: '16', na: '140', k: '4', creatinine: '1.0', hct: '40', wbc: '8', bicarbonate: '24' };

test('9 parameters; all-normal = 0', () => {
  assert.equal(FGSI_PARAMS.length, 9);
  assert.equal(fgsi(normal).total, 0);
  assert.equal(fgsi(normal).highMortality, false);
});

test('APACHE-II deviation bands score each parameter', () => {
  assert.equal(fgsi({ ...normal, temp: '39' }).total, 3);   // 39-40.9 -> 3
  assert.equal(fgsi({ ...normal, hr: '120' }).total, 2);    // 110-139 -> 2
  assert.equal(fgsi({ ...normal, k: '7.5' }).total, 4);     // >=7 -> 4
  assert.equal(fgsi({ ...normal, bicarbonate: '19' }).total, 2); // 18-21.9 -> 2
  assert.equal(fgsi({ ...normal, bicarbonate: '35' }).total, 1); // 32-40.9 -> 1 (not 2)
});

test('creatinine points double only when acute renal failure is set', () => {
  assert.equal(fgsi({ ...normal, creatinine: '2.5' }).total, 3); // 2-3.4 -> 3
  assert.equal(fgsi({ ...normal, creatinine: '2.5', acuteRenalFailure: true }).total, 6); // doubled
  assert.equal(fgsi({ ...normal, creatinine: '2.5', acuteRenalFailure: true }).max, 40);
});

test('threshold: total > 9 flags high mortality (9 does not)', () => {
  // build a total of exactly 9, then 10
  const nine = { ...normal, temp: '39', hr: '120', creatinine: '2.5', bicarbonate: '35' }; // 3+2+3+1 = 9
  assert.equal(fgsi(nine).total, 9);
  assert.equal(fgsi(nine).highMortality, false);
  const ten = { ...nine, rr: '30' }; // +1 -> 10
  assert.equal(fgsi(ten).total, 10);
  assert.equal(fgsi(ten).highMortality, true);
});

test('META example: total 17, high mortality', () => {
  const r = fgsi({ temp: '39', hr: '120', rr: '30', na: '150', k: '3.2', creatinine: '2.5', hct: '28', wbc: '22', bicarbonate: '19' });
  assert.equal(r.total, 17);
  assert.equal(r.highMortality, true);
  assert.match(r.bandLabel, /FGSI 17 of 36/);
});

test('all nine parameters are required', () => {
  const partial = { ...normal };
  delete partial.bicarbonate;
  assert.equal(fgsi(partial).valid, false);
  assert.equal(fgsi(partial).code, 'MISSING_INPUT');
});
