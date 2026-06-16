// spec-v89 §2.4: Surgical Apgar Score (intraoperative 0-10 outcome predictor).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { surgicalApgar } from '../../lib/rheum-periop-v89.js';

test('worked example: EBL 200 / MAP 60 / HR 80 -> 5 (intermediate)', () => {
  const r = surgicalApgar({ ebl: 200, lowestMap: 60, lowestHr: 80 });
  assert.equal(r.valid, true);
  assert.equal(r.eblPts, 2); // 101-600
  assert.equal(r.mapPts, 2); // 55-69
  assert.equal(r.hrPts, 1); // 76-85
  assert.equal(r.score, 5);
  assert.equal(r.risk, 'intermediate');
});

test('best possible score is 10 (low risk)', () => {
  const r = surgicalApgar({ ebl: 50, lowestMap: 80, lowestHr: 50 });
  assert.equal(r.eblPts, 3);
  assert.equal(r.mapPts, 3);
  assert.equal(r.hrPts, 4);
  assert.equal(r.score, 10);
  assert.equal(r.risk, 'low');
});

test('worst possible score is 0 (high risk)', () => {
  const r = surgicalApgar({ ebl: 2000, lowestMap: 30, lowestHr: 120 });
  assert.equal(r.eblPts, 0);
  assert.equal(r.mapPts, 0);
  assert.equal(r.hrPts, 0);
  assert.equal(r.score, 0);
  assert.equal(r.risk, 'high');
});

test('blood-loss band edges', () => {
  assert.equal(surgicalApgar({ ebl: 100, lowestMap: 80, lowestHr: 50 }).eblPts, 3);
  assert.equal(surgicalApgar({ ebl: 101, lowestMap: 80, lowestHr: 50 }).eblPts, 2);
  assert.equal(surgicalApgar({ ebl: 600, lowestMap: 80, lowestHr: 50 }).eblPts, 2);
  assert.equal(surgicalApgar({ ebl: 1000, lowestMap: 80, lowestHr: 50 }).eblPts, 1);
  assert.equal(surgicalApgar({ ebl: 1001, lowestMap: 80, lowestHr: 50 }).eblPts, 0);
});

test('MAP band edges', () => {
  assert.equal(surgicalApgar({ ebl: 50, lowestMap: 70, lowestHr: 50 }).mapPts, 3);
  assert.equal(surgicalApgar({ ebl: 50, lowestMap: 69, lowestHr: 50 }).mapPts, 2);
  assert.equal(surgicalApgar({ ebl: 50, lowestMap: 54, lowestHr: 50 }).mapPts, 1);
  assert.equal(surgicalApgar({ ebl: 50, lowestMap: 39, lowestHr: 50 }).mapPts, 0);
});

test('heart-rate band edges (low HR scores highest)', () => {
  assert.equal(surgicalApgar({ ebl: 50, lowestMap: 80, lowestHr: 55 }).hrPts, 4);
  assert.equal(surgicalApgar({ ebl: 50, lowestMap: 80, lowestHr: 56 }).hrPts, 3);
  assert.equal(surgicalApgar({ ebl: 50, lowestMap: 80, lowestHr: 65 }).hrPts, 3);
  assert.equal(surgicalApgar({ ebl: 50, lowestMap: 80, lowestHr: 85 }).hrPts, 1);
  assert.equal(surgicalApgar({ ebl: 50, lowestMap: 80, lowestHr: 86 }).hrPts, 0);
});

test('score of 4 flags high risk', () => {
  // EBL 700 (1) + MAP 60 (2) + HR 70 (... 66-75 -> 2) = 5; tune to 4:
  const r = surgicalApgar({ ebl: 700, lowestMap: 50, lowestHr: 70 }); // 1 + 1 + 2 = 4
  assert.equal(r.score, 4);
  assert.equal(r.risk, 'high');
});

test('partial input gives a partial score and no risk band', () => {
  const r = surgicalApgar({ ebl: 200, lowestMap: 60 });
  assert.equal(r.complete, false);
  assert.equal(r.risk, null);
  assert.equal(r.score, 4); // 2 + 2, HR not entered
  assert.match(r.band, /Partial/);
});

test('nothing entered -> complete-the-fields fallback', () => {
  const r = surgicalApgar({});
  assert.equal(r.valid, false);
  assert.match(r.band, /Enter/);
});
