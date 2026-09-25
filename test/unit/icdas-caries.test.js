// spec-v1485: ICDAS caries codes and the ICDAS-merged severity.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ASKING } from '../lib/asking-language.js';
import { icdasCaries as ic, icdasMerged } from '../../lib/icdas-caries-v1485.js';

test('the worked example: the most severe of four surfaces is a moderate code 3', () => {
  const r = ic({ s1: '0', s2: '2', s3: '3', s4: '1' });
  assert.equal(r.band, 'Most severe: ICDAS 3, localized enamel breakdown without visible dentin (moderate). 4 surfaces: 1 sound, 2 initial, 1 moderate.');
});

test('the merged groups', () => {
  assert.deepEqual([0, 1, 2, 3, 4, 5, 6].map(icdasMerged), ['sound', 'initial', 'initial', 'moderate', 'moderate', 'extensive', 'extensive']);
  assert.equal(ic({ s1: '0' }).abnormal, false);
  assert.equal(ic({ s1: '6' }).bandLabel, 'ICDAS 6, extensive');
});

test('blank surfaces are not scored, and nothing entered is asked for', () => {
  assert.match(ic({ s2: '5' }).band, /One surface: 1 extensive/);
  const r = ic({});
  assert.equal(r.valid, false);
  assert.match(r.message, ASKING);
});
