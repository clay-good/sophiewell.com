// spec-v1435: HATCH (de Vos 2010, JACC; points as restated in Li 2019, Chest).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hatchAf } from '../../lib/hatch-af-v1435.js';

const NONE = { htn: 'no', age75: 'no', tiaStroke: 'no', copd: 'no', hf: 'no' };

test('points: hypertension 1, age >=75 1, TIA/stroke 2, COPD 1, heart failure 2', () => {
  assert.equal(hatchAf(NONE).score, 0);
  assert.equal(hatchAf({ htn: 'yes', age75: 'yes', tiaStroke: 'yes', copd: 'yes', hf: 'yes' }).score, 7);
  assert.equal(hatchAf({ ...NONE, tiaStroke: 'yes' }).score, 2);
  assert.equal(hatchAf({ ...NONE, hf: 'yes', age75: 'yes' }).score, 3);
});

test('only the two published anchors carry a rate', () => {
  assert.match(hatchAf(NONE).band, /about 6%/);
  assert.match(hatchAf({ htn: 'yes', age75: 'no', tiaStroke: 'yes', copd: 'yes', hf: 'yes' }).band, /nearly 50%/); // 6
  assert.match(hatchAf({ ...NONE, htn: 'yes', tiaStroke: 'yes', hf: 'yes' }).band, /gives no rate for this score/); // 5
});

test('a blank item is asked for, never read as no', () => {
  assert.match(hatchAf({ ...NONE, copd: '' }).message, /COPD is still needed/);
  assert.equal(hatchAf({}).valid, false);
});
