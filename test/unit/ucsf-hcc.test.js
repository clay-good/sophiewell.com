// spec-v686: UCSF criteria for HCC liver-transplant eligibility.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { ucsfHcc } from '../../lib/ucsf-hcc-v686.js';

test('single tumor <= 6.5 cm is within UCSF', () => {
  const r = ucsfHcc({ nodules: '1', largest: '6.0', total: '6.0' });
  assert.equal(r.valid, true);
  assert.equal(r.within, true);
  assert.equal(r.abnormal, false);
});

test('single tumor boundary: 6.5 within, 6.6 outside', () => {
  assert.equal(ucsfHcc({ nodules: '1', largest: '6.5', total: '6.5' }).within, true);
  assert.equal(ucsfHcc({ nodules: '1', largest: '6.6', total: '6.6' }).within, false);
});

test('multi-tumor: <=3 nodules, largest <=4.5 and total <=8 is within', () => {
  assert.equal(ucsfHcc({ nodules: '3', largest: '4.5', total: '8.0' }).within, true);
  assert.equal(ucsfHcc({ nodules: '3', largest: '4.6', total: '8.0' }).within, false); // largest too big
  assert.equal(ucsfHcc({ nodules: '3', largest: '4.5', total: '8.1' }).within, false); // total too big
});

test('more than 3 nodules is outside regardless of size', () => {
  const r = ucsfHcc({ nodules: '4', largest: '2.0', total: '6.0' });
  assert.equal(r.within, false);
  assert.match(r.detail, /exceeds the maximum of 3/);
});

test('vascular invasion or extrahepatic spread vetoes an otherwise-within case', () => {
  assert.equal(ucsfHcc({ nodules: '1', largest: '5.0', total: '5.0', vascular: true }).within, false);
  assert.equal(ucsfHcc({ nodules: '1', largest: '5.0', total: '5.0', extrahepatic: true }).within, false);
  assert.match(ucsfHcc({ nodules: '1', largest: '5.0', total: '5.0', vascular: true }).detail, /within limits/);
});

test('META example: 2 nodules, largest 4.0, total 7.0 -> within UCSF', () => {
  const r = ucsfHcc({ nodules: '2', largest: '4.0', total: '7.0' });
  assert.equal(r.within, true);
  assert.match(r.band, /Within UCSF/);
  assert.match(r.detail, /4.5 cm/);
});

test('inputs validated; total cannot be less than largest', () => {
  assert.equal(ucsfHcc({}).valid, false);
  assert.equal(ucsfHcc({}).code, 'MISSING_INPUT');
  assert.equal(ucsfHcc({ nodules: '0', largest: '3', total: '3' }).field, 'nodules');
  assert.equal(ucsfHcc({ nodules: '2', largest: '5', total: '3' }).field, 'total'); // total < largest
});
