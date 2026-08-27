// spec-v807: Chicago Classification v4.0 achalasia subtypes.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { chicagoAchalasia } from '../../lib/chicago-achalasia-v807.js';

const GATE = { abnormalIrp: true, absentPeristalsis: true };

test('both gates are required, and each is named when missing', () => {
  assert.equal(chicagoAchalasia({}).achalasia, false);
  assert.equal(chicagoAchalasia({}).missing.length, 2);
  assert.equal(chicagoAchalasia({ abnormalIrp: true }).achalasia, false);
  assert.equal(chicagoAchalasia({ absentPeristalsis: true }).achalasia, false);
  assert.equal(chicagoAchalasia(GATE).achalasia, true);
});

test('the body findings cannot produce a subtype without the gates', () => {
  const r = chicagoAchalasia({ prematureSwallows: true, panesophagealPressurization: true });
  assert.equal(r.achalasia, false);
  assert.equal(r.subtype, null);
});

test('with the gates met, the body findings pick the subtype', () => {
  assert.equal(chicagoAchalasia(GATE).subtype, 'I');
  assert.equal(chicagoAchalasia({ ...GATE, panesophagealPressurization: true }).subtype, 'II');
  assert.equal(chicagoAchalasia({ ...GATE, prematureSwallows: true }).subtype, 'III');
});

test('spasm decides over pressurization, because spasm is what defines type III', () => {
  const both = chicagoAchalasia({ ...GATE, prematureSwallows: true, panesophagealPressurization: true });
  assert.equal(both.subtype, 'III');
  assert.equal(both.bothBodyFeatures, true);
  assert.match(both.band, /spasm is what defines type III/);
});

test('type I is the quiet case, not a fallback for missing data', () => {
  const r = chicagoAchalasia(GATE);
  assert.equal(r.subtype, 'I');
  assert.match(r.band, /neither pressurization nor spasm/);
});

test('an isolated abnormal relaxation pressure is called out rather than graded', () => {
  const r = chicagoAchalasia({ abnormalIrp: true });
  assert.match(r.band, /absent peristalsis/);
  assert.equal(r.abnormal, false);
});
