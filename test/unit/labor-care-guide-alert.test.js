// spec-v1558 tool 2: WHO Labour Care Guide alert thresholds. Each threshold at its edge, encoded as printed
// ("or more" vs "more than"), the lag times, the second stage, blank rows as not assessed, and refusals.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { laborCareGuideAlert as l } from '../../lib/labor-care-guide-alert-v1558.js';

const F = { stage: 'first' };
const one = (k, v, extra = {}) => l({ ...F, ...extra, [k]: v });

test('fetal heart rate: below 110 or 160 or more', () => {
  assert.equal(one('fhr', '110').bandLabel, 'No alerts');
  assert.equal(one('fhr', '109').bandLabel, '1 alert');
  assert.equal(one('fhr', '159').bandLabel, 'No alerts');
  assert.equal(one('fhr', '160').bandLabel, '1 alert');
  assert.match(one('fhr', '160').notes[0], /turn onto her left side/);
});

test('maternal signs, each as printed', () => {
  assert.equal(one('pulse', '119').bandLabel, 'No alerts');
  assert.equal(one('pulse', '120').bandLabel, '1 alert');
  assert.equal(one('pulse', '59').bandLabel, '1 alert');
  assert.equal(one('sbp', '139').bandLabel, 'No alerts');
  assert.equal(one('sbp', '140').bandLabel, '1 alert');
  assert.equal(one('sbp', '79').bandLabel, '1 alert');
  assert.equal(one('dbp', '89').bandLabel, 'No alerts');
  assert.equal(one('dbp', '90').bandLabel, '1 alert');
  assert.equal(one('temp', '37.4').bandLabel, 'No alerts');
  assert.equal(one('temp', '37.5').bandLabel, '1 alert');
  assert.equal(one('temp', '34.9').bandLabel, '1 alert');
  assert.equal(one('protein', '1').bandLabel, 'No alerts');
  assert.equal(one('protein', '2').bandLabel, '1 alert');
});

test('contractions: 2 or fewer, or MORE THAN 5; duration under 20 or over 60', () => {
  assert.equal(one('contractions', '2').bandLabel, '1 alert');
  assert.equal(one('contractions', '3').bandLabel, 'No alerts');
  assert.equal(one('contractions', '5').bandLabel, 'No alerts');
  assert.equal(one('contractions', '6').bandLabel, '1 alert');
  assert.match(one('contractions', '6').notes[0], /count again over another 10 minutes/);
  assert.equal(one('duration', '20').bandLabel, 'No alerts');
  assert.equal(one('duration', '19').bandLabel, '1 alert');
  assert.equal(one('duration', '60').bandLabel, 'No alerts');
  assert.equal(one('duration', '61').bandLabel, '1 alert');
});

test('baby and supportive care rows', () => {
  assert.equal(one('decel', 'L').bandLabel, '1 alert');
  assert.equal(one('decel', 'V').bandLabel, 'No alerts');
  assert.equal(one('fluid', 'M3').bandLabel, '1 alert');
  assert.equal(one('fluid', 'M2').bandLabel, 'No alerts');
  assert.equal(one('fluid', 'B').bandLabel, '1 alert');
  assert.equal(one('position', 'T').bandLabel, '1 alert');
  assert.equal(one('caput', '3').bandLabel, '1 alert');
  assert.equal(one('moulding', '2').bandLabel, 'No alerts');
  assert.equal(one('posture', 'supine').bandLabel, '1 alert');
  assert.equal(one('companion', 'no').bandLabel, '1 alert');
});

test('time at the same dilatation: 5 cm 6 h, 6 cm 5 h, 7 cm 3 h, 8 cm 2.5 h, 9 cm 2 h', () => {
  for (const [cm, h] of [[5, 6], [6, 5], [7, 3], [8, 2.5], [9, 2]]) {
    assert.equal(l({ ...F, dilatation: String(cm), lagHours: String(h - 0.1) }).bandLabel, 'No alerts', `${cm} cm`);
    assert.equal(l({ ...F, dilatation: String(cm), lagHours: String(h) }).bandLabel, '1 alert', `${cm} cm`);
  }
  assert.equal(l({ ...F, dilatation: '4', lagHours: '1' }).valid, false, 'the guide starts at 5 cm');
});

test('second stage: 3 h nulliparous, 2 h multiparous', () => {
  const S = { stage: 'second' };
  assert.equal(l({ ...S, parity: 'nullip', secondHours: '2.9' }).bandLabel, 'No alerts');
  assert.equal(l({ ...S, parity: 'nullip', secondHours: '3' }).bandLabel, '1 alert');
  assert.equal(l({ ...S, parity: 'multip', secondHours: '2' }).bandLabel, '1 alert');
  assert.match(l({ ...S, fhr: '140' }).notes.join(' '), /fetal heart every 5 minutes/);
});

test('blank rows are not assessed, listed, and never read as normal', () => {
  const r = l({ ...F, fhr: '140', pulse: '88' });
  assert.equal(r.band, 'None of the 2 rows assessed meets an alert threshold.');
  assert.match(r.notes.join(' '), /Not assessed: companion, pain relief, oral fluid, posture, fetal heart decelerations/);
  assert.match(r.notes.join(' '), /Descent has no alert threshold/);
  assert.match(l({ ...F }).message, /Enter at least one observation/);
});

test('several alerts are counted', () => {
  const r = l({ ...F, fhr: '170', pulse: '125', contractions: '4' });
  assert.equal(r.bandLabel, '2 alerts');
  assert.equal(r.band, "2 of the 3 rows assessed meet the Labour Care Guide's alert threshold.");
});

test('refusals', () => {
  assert.equal(l({}).valid, false);
  assert.equal(l({ ...F, fhr: '20' }).valid, false);
  assert.equal(l({ ...F, decel: 'X' }).valid, false);
  assert.equal(l({ stage: 'second', parity: 'grand', secondHours: '1' }).valid, false);
});
