// spec-v1629 tool 3: serial dilution plan.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { serialDilution as s } from '../../lib/serial-dilution-v1629.js';

const base = { unit: 'mg-ml', finalVolume: 10 };

test('a total factor that is not a power of the step factor still lands exactly on the target', () => {
  const r = s({ ...base, stock: 100, target: 0.03, factor: 10 });
  assert.equal(r.valid, true);
  assert.equal(r.steps.length, 4);
  assert.deepEqual(r.steps.map((x) => x.factor), [10, 10, 10, 3.33333]);
  assert.deepEqual(r.steps.map((x) => x.strength), [10, 1, 0.1, 0.03]);
  assert.deepEqual(r.steps.map((x) => x.transfer), [1, 1, 1, 3]);
  assert.match(r.notes[3], /Step 4: 3 mL of step 3, made up to 10 mL \(1 in 3\.33333\), gives 0\.03 mg\/mL/);
});

test('an exact power takes exactly that many steps', () => {
  assert.equal(s({ ...base, stock: 1000, target: 1, factor: 10 }).steps.length, 3);
  assert.equal(s({ ...base, stock: 100, target: 10, factor: 10 }).steps.length, 1);
  assert.equal(s({ ...base, stock: 100, target: 50, factor: 10 }).steps.length, 1); // one partial step
});

test('a minimum volume forces an extra step', () => {
  // 1 in 1,000 into 10 mL: a 0.1 mL transfer allows 1 in 100 per step (2 steps); 0.5 mL allows 1 in 20 (3 steps).
  const fine = s({ ...base, stock: 1000, target: 1, minVolume: 0.1 });
  const coarse = s({ ...base, stock: 1000, target: 1, minVolume: 0.5 });
  assert.equal(fine.steps.length, 2);
  assert.equal(coarse.steps.length, 3);
  for (const r of [fine, coarse]) for (const st of r.steps) assert.ok(st.transfer >= (r === fine ? 0.1 : 0.5));
  assert.equal(coarse.steps.at(-1).strength, 1);
  assert.match(coarse.notes.join(' '), /3 steps are the fewest in which every transfer is at or above it/);
});

test('each step is made to the last step\'s volume unless another is given, and the result says which', () => {
  assert.match(s({ ...base, stock: 1000, target: 1, factor: 10 }).notes.join(' '), /Every step is made to 10 mL/);
  const r = s({ ...base, stock: 1000, target: 1, factor: 10, stepVolume: 5 });
  assert.deepEqual(r.steps.map((x) => x.volume), [5, 5, 10]);
  assert.deepEqual(r.steps.map((x) => x.transfer), [0.5, 0.5, 1]);
  // A last step that needs more than the step before it made is refused.
  assert.match(s({ unit: 'mg-ml', stock: 1000, target: 1, finalVolume: 100, stepVolume: 5, factor: 10 }).message, /needs 10 mL of step 2, which made only 5 mL/);
});

test('refusals: unit, strengths, and exactly one of factor and minimum volume', () => {
  assert.match(s({}).message, /Choose the strength unit/);
  assert.match(s({ ...base, stock: 1, target: 2, factor: 10 }).message, /target strength must be below the stock/);
  assert.match(s({ ...base, stock: 10, target: 2 }).message, /either a dilution factor per step or the smallest volume/);
  assert.match(s({ ...base, stock: 10, target: 2, factor: 10, minVolume: 1 }).message, /either a dilution factor per step or the smallest volume/);
  assert.match(s({ ...base, stock: 10, target: 2, factor: 1 }).message, /must be above 1/);
  assert.match(s({ ...base, stock: 10, target: 2, minVolume: 20 }).message, /must be larger than the smallest volume/);
  assert.match(s({ ...base, stock: 1e9, target: 1, factor: 1.5 }).message, /more than the 20 this tool plans/);
  assert.match(s({ ...base, target: 2, factor: 10 }).message, /Enter the stock strength/);
});
