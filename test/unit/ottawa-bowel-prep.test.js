// spec-v670: Ottawa Bowel Preparation Scale (OBPS).
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { ottawaBowelPrep } from '../../lib/ottawa-bowel-prep-v670.js';

test('perfect prep sums to 0', () => {
  const r = ottawaBowelPrep({ right: '0', mid: '0', rectosigmoid: '0', fluid: '0' });
  assert.equal(r.valid, true);
  assert.equal(r.total, 0);
  assert.equal(r.segmentTotal, 0);
  assert.equal(r.abnormal, false);
});

test('worst prep sums to 14 (3x4 + 2)', () => {
  const r = ottawaBowelPrep({ right: '4', mid: '4', rectosigmoid: '4', fluid: '2' });
  assert.equal(r.total, 14);
  assert.equal(r.segmentTotal, 12);
  assert.equal(r.abnormal, true);
});

test('total = segment sum + fluid', () => {
  const r = ottawaBowelPrep({ right: '1', mid: '2', rectosigmoid: '1', fluid: '1' });
  assert.equal(r.segmentTotal, 4);
  assert.equal(r.fluid, 1);
  assert.equal(r.total, 5);
});

test('abnormal flag set when any segment is poor (3) or inadequate (4)', () => {
  assert.equal(ottawaBowelPrep({ right: '2', mid: '2', rectosigmoid: '2', fluid: '2' }).abnormal, false);
  assert.equal(ottawaBowelPrep({ right: '3', mid: '0', rectosigmoid: '0', fluid: '0' }).abnormal, true);
  assert.equal(ottawaBowelPrep({ right: '0', mid: '0', rectosigmoid: '4', fluid: '0' }).abnormal, true);
});

test('META example: right 1, mid 2, rectosigmoid 1, fluid 1 -> 5/14', () => {
  const r = ottawaBowelPrep({ right: '1', mid: '2', rectosigmoid: '1', fluid: '1' });
  assert.equal(r.total, 5);
  assert.match(r.band, /Ottawa bowel prep 5\/14/);
  assert.match(r.detail, /mid fair \(2\)/);
});

test('each score is a required integer in range', () => {
  assert.equal(ottawaBowelPrep({}).valid, false);
  assert.equal(ottawaBowelPrep({}).code, 'MISSING_INPUT');
  assert.equal(ottawaBowelPrep({ right: '5', mid: '0', rectosigmoid: '0', fluid: '0' }).field, 'right');
  assert.equal(ottawaBowelPrep({ right: '0', mid: '0', rectosigmoid: '0', fluid: '3' }).field, 'fluid');
  assert.equal(ottawaBowelPrep({ right: '1.5', mid: '0', rectosigmoid: '0', fluid: '0' }).valid, false);
});
