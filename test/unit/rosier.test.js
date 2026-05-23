import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rosier } from '../../lib/scoring-v4.js';

const min = {
  locSyncope: false, seizure: false, facialWeakness: false,
  armWeakness: false, legWeakness: false,
  speechDisturbance: false, visualFieldDefect: false,
};

test('rosier 0 (tile example) -> low probability of stroke', () => {
  const r = rosier(min);
  assert.equal(r.score, 0);
  assert.equal(r.strokeLikely, false);
  assert.equal(r.band, 'low probability of stroke');
});

test('rosier 1 (single focal-deficit item) -> stroke likely', () => {
  const r = rosier({ ...min, facialWeakness: true });
  assert.equal(r.score, 1);
  assert.equal(r.strokeLikely, true);
  assert.equal(r.band, 'stroke likely');
});

test('rosier -1 (LOC alone) -> low probability of stroke', () => {
  const r = rosier({ ...min, locSyncope: true });
  assert.equal(r.score, -1);
  assert.equal(r.strokeLikely, false);
});

test('rosier -2 (LOC + seizure) -> low probability (mimic territory)', () => {
  const r = rosier({ ...min, locSyncope: true, seizure: true });
  assert.equal(r.score, -2);
  assert.equal(r.strokeLikely, false);
});

test('rosier 0 (one focal + one mimic cancels) -> low probability', () => {
  const r = rosier({ ...min, locSyncope: true, armWeakness: true });
  assert.equal(r.score, 0);
  assert.equal(r.strokeLikely, false);
});

test('rosier +5 (all five focal-deficit items, no mimic) -> stroke likely', () => {
  const r = rosier({
    ...min, facialWeakness: true, armWeakness: true, legWeakness: true,
    speechDisturbance: true, visualFieldDefect: true,
  });
  assert.equal(r.score, 5);
  assert.equal(r.strokeLikely, true);
});

test('rosier parts mirror inputs with correct signs', () => {
  const r = rosier({ ...min, seizure: true, speechDisturbance: true });
  assert.equal(r.parts.seizure, -1);
  assert.equal(r.parts.speechDisturbance, 1);
  assert.equal(r.score, 0);
});

test('rosier text mentions Nor 2005', () => {
  assert.match(rosier(min).text, /Nor 2005/);
  assert.match(rosier({ ...min, facialWeakness: true }).text, /Nor 2005/);
});

test('rosier rejects non-boolean inputs', () => {
  assert.throws(() => rosier({ ...min, locSyncope: 1 }));
  assert.throws(() => rosier({ ...min, seizure: 'yes' }));
  assert.throws(() => rosier({ ...min, facialWeakness: null }));
  assert.throws(() => rosier({}));
});
