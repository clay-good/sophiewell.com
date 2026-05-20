import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nortonPush } from '../../lib/scoring-v4.js';

test('norton 20 (all maxima; tile example) -> low risk', () => {
  const r = nortonPush({
    physicalCondition: 4, mentalCondition: 4, activity: 4, mobility: 4, incontinence: 4,
    lengthWidthBand: 0, exudate: 0, tissueType: 0,
  });
  assert.equal(r.nortonTotal, 20);
  assert.equal(r.nortonBand, 'low risk');
  assert.equal(r.pushTotal, 0);
});

test('norton 19 (lower edge of low) -> low', () => {
  const r = nortonPush({
    physicalCondition: 4, mentalCondition: 4, activity: 4, mobility: 4, incontinence: 3,
  });
  assert.equal(r.nortonTotal, 19);
  assert.equal(r.nortonBand, 'low risk');
});

test('norton 18 (upper edge of medium) -> medium', () => {
  const r = nortonPush({
    physicalCondition: 4, mentalCondition: 4, activity: 4, mobility: 3, incontinence: 3,
  });
  assert.equal(r.nortonTotal, 18);
  assert.equal(r.nortonBand, 'medium risk');
});

test('norton 14 (upper edge of at risk) -> at risk', () => {
  const r = nortonPush({
    physicalCondition: 3, mentalCondition: 3, activity: 3, mobility: 3, incontinence: 2,
  });
  assert.equal(r.nortonTotal, 14);
  assert.equal(r.nortonBand, 'at risk');
});

test('push 17 (all maxima) -> high total', () => {
  const r = nortonPush({
    physicalCondition: 4, mentalCondition: 4, activity: 4, mobility: 4, incontinence: 4,
    lengthWidthBand: 10, exudate: 3, tissueType: 4,
  });
  assert.equal(r.pushTotal, 17);
});

test('push clamps out-of-range', () => {
  const r = nortonPush({
    physicalCondition: 4, mentalCondition: 4, activity: 4, mobility: 4, incontinence: 4,
    lengthWidthBand: 99, exudate: -1, tissueType: 99,
  });
  assert.equal(r.pushTotal, 10 + 0 + 4);
});

test('norton clamps each item to 1-4', () => {
  const r = nortonPush({
    physicalCondition: 0, mentalCondition: 5, activity: 4, mobility: 4, incontinence: 4,
  });
  assert.equal(r.norton.physicalCondition, 1);
  assert.equal(r.norton.mentalCondition, 4);
});
