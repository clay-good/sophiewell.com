// spec-v663: Lichtiger Index (Modified Truelove-Witts Severity Index) for UC activity.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { lichtigerIndex, LICHTIGER_ITEMS } from '../../lib/lichtiger-index-v663.js';

const zero = { diarrhea: '0', nocturnal: '0', blood: '0', incontinence: '0', pain: '0', wellbeing: '0', tenderness: '0', antidiarrheal: '0' };
const max = { diarrhea: '4', nocturnal: '1', blood: '3', incontinence: '1', pain: '3', wellbeing: '5', tenderness: '3', antidiarrheal: '1' };

test('there are 8 items; range 0 to 21', () => {
  assert.equal(LICHTIGER_ITEMS.length, 8);
  assert.equal(lichtigerIndex(zero).total, 0);
  assert.equal(lichtigerIndex(max).total, 21);
});

test('per-item maxima: wellbeing 0-5, tenderness/pain/blood 0-3, diarrhea 0-4, yes/no 0-1', () => {
  assert.equal(lichtigerIndex({ ...zero, wellbeing: '5' }).total, 5);
  assert.equal(lichtigerIndex({ ...zero, wellbeing: '6' }).valid, false); // out of range
  assert.equal(lichtigerIndex({ ...zero, diarrhea: '4' }).total, 4);
  assert.equal(lichtigerIndex({ ...zero, nocturnal: '2' }).valid, false); // 0-1 only
});

test('activity flags: remission <= 3, active >= 10, response range in between', () => {
  assert.equal(lichtigerIndex({ ...zero, diarrhea: '3' }).remission, true); // 3
  assert.equal(lichtigerIndex({ ...zero, diarrhea: '3' }).active, false);
  assert.equal(lichtigerIndex({ ...zero, wellbeing: '5', diarrhea: '4' }).total, 9); // 9 -> not active
  assert.equal(lichtigerIndex({ ...zero, wellbeing: '5', diarrhea: '4' }).active, false);
  assert.equal(lichtigerIndex({ ...zero, wellbeing: '5', diarrhea: '4', pain: '1' }).active, true); // 10
});

test('META example: diarrhea 2, nocturnal 1, blood 2, pain 2, wellbeing 3, tenderness 1, antidiarrheal 1 = 12, active', () => {
  const r = lichtigerIndex({ diarrhea: '2', nocturnal: '1', blood: '2', incontinence: '0', pain: '2', wellbeing: '3', tenderness: '1', antidiarrheal: '1' });
  assert.equal(r.total, 12);
  assert.equal(r.active, true);
  assert.match(r.bandLabel, /Lichtiger 12 of 21/);
});

test('all eight items are required', () => {
  const partial = { ...zero };
  delete partial.antidiarrheal;
  assert.equal(lichtigerIndex(partial).valid, false);
  assert.equal(lichtigerIndex(partial).code, 'MISSING_INPUT');
});
