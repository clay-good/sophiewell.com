// spec-v1494: Kotlow's classification of ankyloglossia.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ASKING } from '../lib/asking-language.js';
import { kotlowAnkyloglossia as k } from '../../lib/kotlow-ankyloglossia-v1494.js';

test('the worked example: 9 mm is Class II', () => {
  assert.equal(k({ length: '9' }).band, 'Kotlow Class II (moderate ankyloglossia): free tongue length 9 mm, in the 8 to 11 mm range.');
});

test('every class and its edges', () => {
  const l = (x) => k({ length: String(x) }).bandLabel;
  assert.deepEqual([17, 16, 12, 11, 8, 7, 3, 2.5].map(l), ['Not short (over 16 mm)', 'Class I, mild', 'Class I, mild', 'Class II, moderate',
    'Class II, moderate', 'Class III, severe', 'Class III, severe', 'Class IV, complete']);
  assert.equal(k({ length: '20' }).abnormal, false);
});

test('a length between the whole-mm ranges is reported as between', () => {
  assert.equal(k({ length: '11.5' }).bandLabel, 'Between Class I and Class II');
  assert.equal(k({ length: '7.5' }).bandLabel, 'Between Class II and Class III');
});

test('a blank or impossible length is asked for', () => {
  assert.match(k({}).message, ASKING);
  assert.equal(k({ length: '90' }).valid, false);
});
