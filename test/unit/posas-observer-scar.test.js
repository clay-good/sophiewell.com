// spec-v691: POSAS Observer Scale.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { posasObserverScar } from '../../lib/posas-observer-scar-v691.js';

test('all-1 (normal skin) -> total 6', () => {
  const r = posasObserverScar({ vascularity: '1', pigmentation: '1', thickness: '1', relief: '1', pliability: '1', surfaceArea: '1' });
  assert.equal(r.valid, true);
  assert.equal(r.score, 6);
  assert.equal(r.overall, null);
});

test('all-10 (worst) -> total 60', () => {
  const r = posasObserverScar({ vascularity: '10', pigmentation: '10', thickness: '10', relief: '10', pliability: '10', surfaceArea: '10' });
  assert.equal(r.score, 60);
});

test('worked example sums to 27; overall opinion is separate', () => {
  const r = posasObserverScar({ vascularity: '5', pigmentation: '4', thickness: '6', relief: '5', pliability: '4', surfaceArea: '3', overallOpinion: '5' });
  assert.equal(r.score, 27);
  assert.equal(r.overall, 5);
  assert.match(r.band, /POSAS Observer total 27 of 60/);
  assert.match(r.band, /overall opinion 5\/10/);
});

test('overall opinion is NOT added to the six-item total', () => {
  const without = posasObserverScar({ vascularity: '5', pigmentation: '4', thickness: '6', relief: '5', pliability: '4', surfaceArea: '3' });
  const with10 = posasObserverScar({ vascularity: '5', pigmentation: '4', thickness: '6', relief: '5', pliability: '4', surfaceArea: '3', overallOpinion: '10' });
  assert.equal(without.score, with10.score); // 27 both
  assert.equal(without.overall, null);
  assert.equal(with10.overall, 10);
});

test('each item must be an integer 1-10; overall optional but validated', () => {
  assert.equal(posasObserverScar({}).valid, false);
  assert.equal(posasObserverScar({}).code, 'MISSING_INPUT');
  const base = { vascularity: '5', pigmentation: '4', thickness: '6', relief: '5', pliability: '4', surfaceArea: '3' };
  assert.equal(posasObserverScar({ ...base, thickness: '0' }).valid, false); // below 1
  assert.equal(posasObserverScar({ ...base, thickness: '11' }).valid, false); // above 10
  assert.equal(posasObserverScar({ ...base, overallOpinion: '12' }).field, 'overallOpinion');
});
