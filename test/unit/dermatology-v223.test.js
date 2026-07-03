// spec-v223: worked examples for the dermatology instruments. Point systems
// spec-v97 cross-verified (see module header for source pairs).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  uas7, hiscr, hurleyStage, poem, alden, pest, glasgow7,
} from '../../lib/dermatology-v223.js';

test('uas7: banded sum', () => {
  const r = uas7({ whealSum: 10, itchSum: 8 });
  assert.equal(r.score, 18);
  assert.match(r.band, /moderate/);
});
test('uas7: free at 0', () => {
  const r = uas7({ whealSum: 0, itchSum: 0 });
  assert.equal(r.score, 0);
  assert.equal(r.abnormal, false);
});
test('uas7: invalid without inputs', () => { assert.equal(uas7({}).valid, false); });

test('hiscr: achieved with 50% reduction', () => {
  const r = hiscr({ baselineAbscess: 2, baselineNodule: 6, currentAbscess: 1, currentNodule: 2, baselineFistula: 1, currentFistula: 1 });
  assert.equal(r.achieved, true);
});
test('hiscr: not achieved if abscess increases', () => {
  const r = hiscr({ baselineAbscess: 1, baselineNodule: 7, currentAbscess: 3, currentNodule: 0, baselineFistula: 0, currentFistula: 0 });
  assert.equal(r.achieved, false);
});

test('hurley: staging', () => {
  assert.equal(hurleyStage({}).stage, 'I');
  assert.equal(hurleyStage({ sinusTract: true }).stage, 'II');
  assert.equal(hurleyStage({ diffuse: true }).stage, 'III');
});

test('poem: banded sum', () => {
  const r = poem({ itch: 3, sleep: 2, flaking: 2, dryness: 4 });
  assert.equal(r.score, 11);
  assert.match(r.band, /moderate/);
});
test('poem: clear at 0-2', () => {
  assert.equal(poem({ itch: 2 }).abnormal, false);
});

test('alden: very probable', () => {
  const r = alden({ delay: '3', drugPresent: '0', challenge: '0', dechallenge: '0', notoriety: '3' });
  assert.equal(r.score, 6);
  assert.match(r.band, /very probable/);
});
test('alden: negative excluded', () => {
  const r = alden({ delay: '-3', drugPresent: '-3', notoriety: '-1' });
  assert.equal(r.score, -7);
  assert.match(r.band, /very unlikely/);
});

test('pest: positive at 3', () => {
  const r = pest({ swollenJoint: true, nailPits: true, heelPain: true });
  assert.equal(r.score, 3);
  assert.equal(r.abnormal, true);
});
test('pest: negative below 3', () => {
  assert.equal(pest({ swollenJoint: true }).abnormal, false);
});

test('glasgow7: weighted refer', () => {
  const r = glasgow7({ size: true, color: true }); // 2+2
  assert.equal(r.score, 4);
  assert.match(r.band, /refer/);
});
test('glasgow7: minor only below threshold', () => {
  const r = glasgow7({ diameter: true, inflammation: true }); // 1+1
  assert.equal(r.score, 2);
  assert.equal(r.abnormal, false);
});
