// spec-v1629 tool 1: alligation.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { alligation } from '../../lib/alligation-v1629.js';

const two = (x) => alligation({ mode: 'two', strengthUnit: 'percent', quantityUnit: 'g', ...x });

test('70% and 20% to make 30% is 1 part to 4 parts', () => {
  const r = two({ higher: 70, lower: 20, target: 30, total: 500 });
  assert.equal(r.valid, true);
  assert.deepEqual([r.partsHigher, r.partsLower], [1, 4]);
  assert.deepEqual([r.higherQty, r.lowerQty, r.total], [100, 400, 500]);
  assert.match(r.band, /100 g of the 70% strength with 400 g of the 20% strength makes 500 g at 30%/);
  assert.match(r.notes.join(' '), /Check: 70 × 100 \+ 20 × 400 = 15,000, and 30 × 500 = 15,000/);
});

test('fortifying 100 g of 1% to 2.5% with pure drug takes 1.54 g, not 1.5 g', () => {
  const r = two({ higher: 100, lower: 1, target: 2.5, lowerQty: 100 });
  assert.equal(r.higherQty, 1.53846);
  assert.equal(r.total, 101.538);
  assert.match(r.band, /pure drug \(100%\)/);
});

test('diluting a fixed amount of the higher strength, and a plain diluent at 0', () => {
  const r = two({ higher: 10, lower: 0, target: 2.5, higherQty: 30 });
  assert.equal(r.lowerQty, 90);
  assert.equal(r.total, 120);
  assert.match(r.band, /diluent \(0\)/);
});

test('a target equal to one strength gives all of that component', () => {
  const low = two({ higher: 70, lower: 20, target: 20, total: 500 });
  assert.deepEqual([low.higherQty, low.lowerQty], [0, 500]);
  assert.match(low.notes[0], /all of the 20% strength/);
  const high = two({ higher: 70, lower: 20, target: 70, total: 500 });
  assert.deepEqual([high.higherQty, high.lowerQty], [500, 0]);
  // With a fixed amount of the component that cannot be used, there is nothing to compute.
  assert.match(two({ higher: 70, lower: 20, target: 20, higherQty: 10 }).message, /none of the higher strength can be used/);
});

test('a target outside the pair is refused', () => {
  assert.match(two({ higher: 70, lower: 20, target: 80, total: 100 }).message, /outside the two strengths/);
  assert.match(two({ higher: 70, lower: 20, target: 10, total: 100 }).message, /outside the two strengths/);
  assert.match(two({ higher: 20, lower: 70, target: 30, total: 100 }).message, /higher strength must be above/);
  assert.match(two({ higher: 170, lower: 20, target: 30, total: 100 }).message, /between 0 and 100/);
});

test('exactly one quantity, and nothing is defaulted', () => {
  assert.match(two({ higher: 70, lower: 20, target: 30 }).message, /exactly one quantity/);
  assert.match(two({ higher: 70, lower: 20, target: 30, total: 5, lowerQty: 2 }).message, /exactly one quantity/);
  assert.match(two({ higher: 70, lower: 20, total: 5 }).message, /Enter the target strength/);
  assert.match(alligation({}).message, /Choose the mode/);
  assert.match(alligation({ mode: 'two' }).message, /Choose the strength unit/);
  assert.match(alligation({ mode: 'two', strengthUnit: 'percent' }).message, /Choose the quantity unit/);
  assert.match(alligation({ mode: 'two', strengthUnit: 'constructor', quantityUnit: 'g' }).message, /Choose the strength unit/);
});

test('medial: several lots mixed give sum(strength × quantity) ÷ sum(quantity)', () => {
  const r = alligation({ mode: 'medial', strengthUnit: 'mg-ml', quantityUnit: 'mL', lots: '10, 100\n20, 300' });
  assert.equal(r.strength, 17.5);
  assert.equal(r.total, 400);
  assert.match(r.notes.join(' '), /alcohol and water do not/); // volumes: additivity is stated, not assumed silently
  assert.match(alligation({ mode: 'medial', strengthUnit: 'percent', quantityUnit: 'g', lots: '10, 100' }).message, /at least two lots/);
  assert.match(alligation({ mode: 'medial', strengthUnit: 'percent', quantityUnit: 'g', lots: '10, 100\n20' }).message, /Lot line 2/);
  assert.match(alligation({ mode: 'medial', strengthUnit: 'percent', quantityUnit: 'g', lots: '10, 100\n120, 5' }).message, /cannot be above 100/);
});

test('a weight result does not carry the volume warning; a volume result does', () => {
  assert.doesNotMatch(two({ higher: 70, lower: 20, target: 30, total: 500 }).notes.join(' '), /alcohol/);
  assert.match(alligation({ mode: 'two', strengthUnit: 'percent', quantityUnit: 'mL', higher: 70, lower: 20, target: 30, total: 500 }).notes.join(' '), /alcohol and water do not/);
});
