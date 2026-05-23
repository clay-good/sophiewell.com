import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lawtonIadl } from '../../lib/scoring-v4.js';

const all = (v) => ({
  telephone: v, shopping: v, foodPrep: v, housekeeping: v,
  laundry: v, transportation: v, medications: v, finances: v,
});

test('lawtonIadl 8 (tile example) -> full independence', () => {
  const r = lawtonIadl(all(1));
  assert.equal(r.score, 8);
  assert.equal(r.band, 'full independence');
});

test('lawtonIadl 7 (one dependent) -> mild impairment', () => {
  const r = lawtonIadl({ ...all(1), foodPrep: 0 });
  assert.equal(r.score, 7);
  assert.equal(r.band, 'mild impairment');
});

test('lawtonIadl 6 (lower edge of mild) -> mild impairment', () => {
  const r = lawtonIadl({ ...all(1), foodPrep: 0, housekeeping: 0 });
  assert.equal(r.score, 6);
  assert.equal(r.band, 'mild impairment');
});

test('lawtonIadl 5 (upper edge of moderate) -> moderate impairment', () => {
  const r = lawtonIadl({ ...all(1), foodPrep: 0, housekeeping: 0, laundry: 0 });
  assert.equal(r.score, 5);
  assert.equal(r.band, 'moderate impairment');
});

test('lawtonIadl 3 (lower edge of moderate) -> moderate impairment', () => {
  const r = lawtonIadl({ telephone: 1, shopping: 1, foodPrep: 1, housekeeping: 0, laundry: 0, transportation: 0, medications: 0, finances: 0 });
  assert.equal(r.score, 3);
  assert.equal(r.band, 'moderate impairment');
});

test('lawtonIadl 2 (upper edge of severe) -> severe impairment', () => {
  const r = lawtonIadl({ ...all(0), telephone: 1, finances: 1 });
  assert.equal(r.score, 2);
  assert.equal(r.band, 'severe impairment');
});

test('lawtonIadl 0 (all dependent) -> severe impairment', () => {
  const r = lawtonIadl(all(0));
  assert.equal(r.score, 0);
  assert.equal(r.band, 'severe impairment');
});

test('lawtonIadl text mentions Lawton 1969', () => {
  assert.match(lawtonIadl(all(1)).text, /Lawton 1969/);
  assert.match(lawtonIadl(all(0)).text, /Lawton 1969/);
});

test('lawtonIadl rejects bad inputs', () => {
  assert.throws(() => lawtonIadl({ ...all(1), telephone: 2 }));
  assert.throws(() => lawtonIadl({ ...all(1), telephone: -1 }));
  assert.throws(() => lawtonIadl({ ...all(1), telephone: 0.5 }));
  assert.throws(() => lawtonIadl({ ...all(1), telephone: NaN }));
  assert.throws(() => lawtonIadl({ telephone: 1, shopping: 1 })); // missing items
});
