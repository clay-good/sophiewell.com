// spec-v1629 tool 11: density, specific gravity and weight-to-volume.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { specificGravity as sg } from '../../lib/specific-gravity-v1629.js';

test('weight of a volume and volume of a weight', () => {
  assert.equal(sg({ mode: 'weight', volume: 120, specificGravity: 1.25 }).weightG, 150);
  assert.equal(sg({ mode: 'volume', weight: 150, specificGravity: 1.25 }).volumeMl, 120);
  assert.match(sg({ mode: 'weight', volume: 120, specificGravity: 1.25 }).notes.join(' '), /Water is taken as 1 g\/mL/);
});

test('specific gravity from three weighings', () => {
  const r = sg({ mode: 'measure', empty: 20, filled: 51.25, water: 45 });
  assert.equal(r.specificGravity, 1.25);
  assert.match(r.notes[0], /\(51\.25 − 20\) ÷ \(45 − 20\) = 31\.25 ÷ 25 = 1\.25/);
});

test('container weights that give a specific gravity of 0 or a negative are refused', () => {
  assert.match(sg({ mode: 'measure', empty: 20, filled: 20, water: 45 }).message, /zero or less/);
  assert.match(sg({ mode: 'measure', empty: 20, filled: 15, water: 45 }).message, /zero or less/);
  assert.match(sg({ mode: 'measure', empty: 20, filled: 30, water: 20 }).message, /filled with water must weigh more/);
  assert.match(sg({ mode: 'measure', empty: 20, filled: 900, water: 21 }).message, /above any liquid/);
  assert.match(sg({ mode: 'volume', weight: 30, specificGravity: 0 }).message, /greater than 0/);
});

test('% w/w × specific gravity = % w/v, and it moves the right way for a liquid heavier than water', () => {
  const heavy = sg({ mode: 'strength', percentWw: 37, specificGravity: 1.18 });
  assert.equal(heavy.percentWv, 43.66);
  assert.ok(heavy.percentWv > 37);
  const light = sg({ mode: 'strength', percentWw: 95, specificGravity: 0.8 });
  assert.equal(light.percentWv, 76);
  assert.ok(light.percentWv < 95);
});

test('nothing is defaulted', () => {
  assert.match(sg({}).message, /Choose what to work out/);
  assert.match(sg({ mode: 'weight', volume: 10 }).message, /Enter the specific gravity/);
  assert.match(sg({ mode: 'weight', specificGravity: 1.1 }).message, /Enter the volume/);
  assert.match(sg({ mode: 'measure', empty: 20, filled: 30 }).message, /Enter the weight of the container filled with water/);
  assert.match(sg({ mode: 'strength', percentWw: 120, specificGravity: 1 }).message, /at most 100/);
});
