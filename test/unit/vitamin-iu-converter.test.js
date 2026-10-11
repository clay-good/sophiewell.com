// spec-v1633 tool 18: vitamin unit conversion by FDA's 2019 labeling guidance.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { vitaminIuConverter as d, QUANTITIES } from '../../lib/vitamin-iu-converter-v1633.js';

const from = (quantity, amount) => d({ quantity, direction: 'from-iu', amount });
const to = (quantity, amount) => d({ quantity, direction: 'to-iu', amount });

test('the factors are the guidance\'s', () => {
  assert.deepEqual(QUANTITIES.filter((q) => q.factor).map((q) => q.factor), [0.025, 0.30, 0.30, 0.05, 0.025, 0.67, 0.45]);
  assert.deepEqual(QUANTITIES.map((q) => q.dv), [20, 900, 900, 900, 900, 15, 15, 400, 16]);
});

test('vitamin D: 1 IU is 0.025 mcg, 1 mcg is 40 IU', () => {
  assert.deepEqual([from('vitamin-d', 400).metric, from('vitamin-d', 400).percentDailyValue], [10, 50]);
  assert.deepEqual([to('vitamin-d', 20).iu, to('vitamin-d', 20).percentDailyValue], [800, 100]);
  assert.match(from('vitamin-d', 400).notes[0], /1 mcg = 40 IU/);
});

test('vitamin A: the factor depends on the source form, and the result says there is no single one', () => {
  assert.deepEqual(['vitamin-a-retinol', 'vitamin-a-supplemental-beta-carotene', 'vitamin-a-dietary-beta-carotene', 'vitamin-a-other-carotenoid'].map((q) => from(q, 5000).metric), [1500, 1500, 250, 125]);
  assert.equal(to('vitamin-a-retinol', 900).iu, 3000);
  assert.match(from('vitamin-a-retinol', 5000).notes.join(' '), /no direct conversion factor/);
});

test('vitamin E reproduces the guidance\'s two worked examples', () => {
  const natural = from('vitamin-e-natural', 3); // Example 18: 3 IU x 0.67 = 2.01 mg, 13% DV
  assert.deepEqual([natural.metric, natural.percentDailyValue], [2.01, 13]);
  const synthetic = from('vitamin-e-synthetic', 35); // Example 19: 35 IU x 0.45 = 15.75 mg, 105% DV
  assert.deepEqual([synthetic.metric, synthetic.percentDailyValue], [15.75, 105]);
});

test('folate in DFE and niacin in NE', () => {
  const f = d({ quantity: 'folate-dfe', amount: 100, amount2: 200 });
  assert.deepEqual([f.result, f.percentDailyValue], [440, 110]);
  assert.equal(d({ quantity: 'folate-dfe', amount2: 400 }).result, 680);
  assert.match(d({ quantity: 'folate-dfe', amount2: 400 }).notes.join(' '), /left blank and counted as none/);
  const n = d({ quantity: 'niacin-ne', amount: 10, amount2: 120 });
  assert.deepEqual([n.result, n.percentDailyValue], [12, 75]);
});

test('nothing is defaulted: the form and the direction are asked for', () => {
  assert.match(d({}).message, /^Choose the vitamin and its form/);
  assert.match(d({ quantity: 'vitamin-d', amount: 400 }).message, /^Choose the direction/);
  assert.match(d({ quantity: 'vitamin-d', direction: 'from-iu' }).message, /^Enter the amount/);
  assert.match(d({ quantity: 'folate-dfe' }).message, /food folate, the folic acid, or both/);
  assert.match(d({ quantity: 'niacin-ne' }).message, /niacin, the tryptophan, or both/);
  assert.equal(QUANTITIES.some((q) => q.value === 'vitamin-a'), false); // no form-less vitamin A
});
