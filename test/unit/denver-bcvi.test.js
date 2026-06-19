// spec-v109 2.1: Expanded Denver Criteria (Burlew 2012). Any sign/symptom or
// risk factor -> CTA screening for BCVI indicated.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { denverBcvi } from '../../lib/traumaclass-v109.js';

test('no criterion -> screening not indicated', () => {
  const r = denverBcvi({});
  assert.equal(r.screen, false);
  assert.equal(r.positive, 0);
  assert.match(r.band, /not indicated/);
});

test('band flip: one sign/symptom flips no-screen -> CTA', () => {
  const r = denverBcvi({ expandingHematoma: true });
  assert.equal(r.screen, true);
  assert.equal(r.positive, 1);
  assert.match(r.band, /1 criterion positive \(Expanding cervical hematoma\): CT angiography screening for BCVI is indicated\./);
});

test('a risk factor alone also flags screening', () => {
  const r = denverBcvi({ daiLowGcs: true });
  assert.equal(r.screen, true);
  assert.equal(r.positive, 1);
});

test('multiple positives are counted and named (plural)', () => {
  const r = denverBcvi({ arterialHemorrhage: true, lefort: true, nearHanging: true });
  assert.equal(r.positive, 3);
  assert.match(r.band, /3 criteria positive/);
});
