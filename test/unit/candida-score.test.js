// spec-v137 2.3: Candida score (Leon C, et al, Crit Care Med 2006;34:730).
// Integer items TPN 1, surgery 1, multifocal colonization 1, severe sepsis 2;
// total 0-5; cut-off >= 3. Tests pin the threshold crossing at exactly 3.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { candidaScore } from '../../lib/id-v137.js';

test('severe sepsis is worth 2 points: TPN + surgery + sepsis = 4 -> likely', () => {
  const r = candidaScore({ tpn: 'yes', surgery: 'yes', colonization: 'no', sepsis: 'yes' });
  assert.equal(r.valid, true);
  assert.equal(r.total, 4);
  assert.equal(r.likely, true);
});

test('threshold crossing: three single-point items = 3 -> likely (>= 3)', () => {
  const r = candidaScore({ tpn: 'yes', surgery: 'yes', colonization: 'yes', sepsis: 'no' });
  assert.equal(r.total, 3);
  assert.equal(r.likely, true);
  assert.equal(r.abnormal, true);
});

test('below threshold: two single-point items = 2 -> not likely', () => {
  const r = candidaScore({ tpn: 'yes', surgery: 'yes', colonization: 'no', sepsis: 'no' });
  assert.equal(r.total, 2);
  assert.equal(r.likely, false);
});

test('severe sepsis alone = 2 -> not likely (below 3)', () => {
  const r = candidaScore({ tpn: 'no', surgery: 'no', colonization: 'no', sepsis: 'yes' });
  assert.equal(r.total, 2);
  assert.equal(r.likely, false);
});

test('maximum is 5 -> likely', () => {
  const r = candidaScore({ tpn: 'yes', surgery: 'yes', colonization: 'yes', sepsis: 'yes' });
  assert.equal(r.total, 5);
  assert.equal(r.likely, true);
});

test('missing any item surfaces the fallback', () => {
  assert.equal(candidaScore({}).valid, false);
  assert.equal(candidaScore({ tpn: 'yes', surgery: 'yes', colonization: 'yes' }).valid, false);
  assert.equal(candidaScore({ tpn: 'yes', surgery: 'yes', colonization: 'yes', sepsis: '' }).valid, false);
});
