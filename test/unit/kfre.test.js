// spec-v127 2.1: KFRE (Tangri 2011). risk = 1 - S0^exp(sum centered). 4-var NA
// S0 2yr 0.9750/5yr 0.9240; ACR mg/g -> mg/mmol (/8.84). Overflow-safe.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { kfre } from '../../lib/nephro-v127.js';

test('4-variable worked example', () => {
  const r = kfre({ mode: '4', age: 60, male: true, egfr: 30, acr: 300 });
  assert.equal(r.valid, true);
  assert.equal(r.mode, 4);
  assert.match(r.band, /3\.3% 2-year and 10% 5-year/);
});

test('8-variable mode uses the re-estimated coefficients + 4 extra labs', () => {
  const r = kfre({ mode: '8', age: 60, male: true, egfr: 30, acr: 300, albumin: 3.5, phosphate: 4.5, bicarbonate: 22, calcium: 9.0 });
  assert.equal(r.valid, true);
  assert.equal(r.mode, 8);
  assert.ok(r.risk5 > 0 && r.risk5 < 1);
});

test('8-variable missing an extra lab -> valid:false', () => {
  assert.equal(kfre({ mode: '8', age: 60, egfr: 30, acr: 300 }).valid, false);
});

test('risk bounded 0-1 under extreme inputs (overflow-safe)', () => {
  const r = kfre({ mode: '4', age: 90, male: true, egfr: 5, acr: 5000 });
  assert.ok(r.risk5 <= 1 && r.risk5 >= 0);
  assert.equal(Number.isFinite(r.risk2), true);
});

test('non-positive / missing / scalar -> valid:false (no ln(0))', () => {
  assert.equal(kfre({ mode: '4', age: 60, egfr: 30, acr: 0 }).valid, false);
  assert.equal(kfre({}).valid, false);
  assert.equal(kfre(9).valid, false);
});
