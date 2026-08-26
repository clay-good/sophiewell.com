// spec-v781: STarT Back Screening Tool.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { startBack } from '../../lib/startback-v781.js';

test('nothing endorsed -> 0 of 9, low risk', () => {
  const r = startBack({});
  assert.equal(r.valid, true);
  assert.equal(r.total, 0);
  assert.equal(r.subscore, 0);
  assert.equal(r.tier, 'low');
  assert.equal(r.abnormal, false);
});

test('bothersomeness scores only for very much or extremely', () => {
  assert.equal(startBack({ bother: 'moderately' }).total, 0);
  assert.equal(startBack({ bother: 'slightly' }).total, 0);
  assert.equal(startBack({ bother: 'very-much' }).total, 1);
  assert.equal(startBack({ bother: 'extremely' }).total, 1);
  assert.equal(startBack({ bother: 'extremely' }).subscore, 1);
});

test('worked example: a total of 7 is only MEDIUM when the subscore is 3', () => {
  const r = startBack({ q1: true, q2: true, q3: true, q4: true, q5: true, q6: true, bother: 'extremely' });
  assert.equal(r.total, 7);
  assert.equal(r.subscore, 3);
  assert.equal(r.tier, 'medium');
});

test('a lower total of 5 is HIGH when all of it is psychosocial', () => {
  const r = startBack({ q5: true, q6: true, q7: true, q8: true, bother: 'extremely' });
  assert.equal(r.total, 5);
  assert.equal(r.subscore, 5);
  assert.equal(r.tier, 'high');
  assert.equal(r.abnormal, true);
});

test('3 is the top of the low band and 4 is the first medium', () => {
  assert.equal(startBack({ q1: true, q2: true, q3: true }).tier, 'low');
  assert.equal(startBack({ q1: true, q2: true, q3: true, q4: true }).tier, 'medium');
});

test('only items 5 to 9 count toward the subscore', () => {
  const r = startBack({ q1: true, q2: true, q3: true, q4: true });
  assert.equal(r.total, 4);
  assert.equal(r.subscore, 0);
});

test('an unknown bothersomeness level is rejected, not treated as zero', () => {
  const r = startBack({ bother: 'a bit' });
  assert.equal(r.valid, false);
  assert.equal(r.field, 'bother');
});
