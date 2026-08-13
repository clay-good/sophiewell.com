// spec-v713: Edmonton Obesity Staging System (EOSS).
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { eoss } from '../../lib/eoss-v713.js';

test('all-zero domains -> stage 0', () => {
  const r = eoss({ medical: '0', functional: '0', mental: '0' });
  assert.equal(r.valid, true);
  assert.equal(r.stage, 0);
  assert.equal(r.abnormal, false);
});

test('overall stage is the most severe domain', () => {
  const r = eoss({ medical: '2', functional: '1', mental: '0' });
  assert.equal(r.stage, 2);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /EOSS stage 2/);
});

test('the mental domain can drive the stage', () => {
  const r = eoss({ medical: '1', functional: '0', mental: '4' });
  assert.equal(r.stage, 4);
});

test('established comorbidity (>= 2) is flagged; stage 1 is not', () => {
  assert.equal(eoss({ medical: '1', functional: '1', mental: '1' }).abnormal, false);
  assert.equal(eoss({ medical: '0', functional: '2', mental: '0' }).abnormal, true);
});

test('domains require an integer 0-4; required', () => {
  assert.equal(eoss({}).valid, false);
  assert.equal(eoss({}).code, 'MISSING_INPUT');
  assert.equal(eoss({ medical: '5', functional: '0', mental: '0' }).valid, false);
  assert.equal(eoss({ medical: '2', functional: '2' }).field, 'mental');
});
