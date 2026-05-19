import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isthDic } from '../../lib/scoring-v4.js';

test('isth-dic gate not met (tile default) -> not applicable band', () => {
  const r = isthDic({ underlyingDisorderPresent: false, platelet: '>100', fibrinMarker: 'none', ptProlonged: '<3s', fibrinogen: '>1' });
  assert.equal(r.gateNotMet, true);
  assert.equal(r.overtDic, false);
  assert.match(r.band, /underlying disorder known to be associated with DIC must be present/);
});

test('isth-dic 0 of 8 with gate met -> not overt DIC band', () => {
  const r = isthDic({ underlyingDisorderPresent: true, platelet: '>100', fibrinMarker: 'none', ptProlonged: '<3s', fibrinogen: '>1' });
  assert.equal(r.score, 0);
  assert.equal(r.overtDic, false);
  assert.match(r.band, /not compatible with overt DIC/);
});

test('isth-dic 4 with gate met just below cutoff -> not overt DIC', () => {
  // platelet <50 (2) + fibrin moderate (2) = 4
  const r = isthDic({ underlyingDisorderPresent: true, platelet: '<50', fibrinMarker: 'moderate', ptProlonged: '<3s', fibrinogen: '>1' });
  assert.equal(r.score, 4);
  assert.equal(r.overtDic, false);
});

test('isth-dic 5 boundary with gate met -> overt DIC', () => {
  // platelet 50-100 (1) + fibrin strong (3) + PT 3-6s (1) = 5
  const r = isthDic({ underlyingDisorderPresent: true, platelet: '50-100', fibrinMarker: 'strong', ptProlonged: '3-6s', fibrinogen: '>1' });
  assert.equal(r.score, 5);
  assert.equal(r.overtDic, true);
  assert.match(r.band, /compatible with overt DIC/);
});

test('isth-dic 8 of 8 with gate met -> overt DIC', () => {
  const r = isthDic({ underlyingDisorderPresent: true, platelet: '<50', fibrinMarker: 'strong', ptProlonged: '>6s', fibrinogen: '<=1' });
  assert.equal(r.score, 8);
  assert.equal(r.overtDic, true);
});

test('isth-dic unknown category strings contribute 0', () => {
  const r = isthDic({ underlyingDisorderPresent: true, platelet: 'unknown', fibrinMarker: 'x', ptProlonged: 'y', fibrinogen: 'z' });
  assert.equal(r.score, 0);
  assert.equal(r.overtDic, false);
});
