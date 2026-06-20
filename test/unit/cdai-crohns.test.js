// spec-v126 2.1: CDAI (Best 1976). 8 weighted items; <150 remission, 150-220 mild,
// 221-450 moderate, >450 severe.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cdaiCrohns } from '../../lib/gi-v126.js';

const ex = { stools: 20, pain: 14, wellbeing: 7, complications: 1, antidiarrheal: true, abdMass: 2, female: false, hct: 40, weight: 60, standardWeight: 70 };

test('worked example -> 285, moderate', () => {
  const r = cdaiCrohns(ex);
  assert.equal(r.valid, true);
  assert.equal(r.total, 285);
  assert.match(r.band, /moderate/);
});

test('remission band (< 150) not flagged', () => {
  const r = cdaiCrohns({ hct: 45, weight: 70, standardWeight: 70 });
  assert.ok(r.total < 150);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /remission/);
});

test('hematocrit deficit weight is x6 and sex-specific (men ref 47)', () => {
  const base = cdaiCrohns({ hct: 47, weight: 70, standardWeight: 70 }).total; // deficit 0
  const low = cdaiCrohns({ hct: 37, weight: 70, standardWeight: 70 }).total;  // deficit 10 x6 = 60
  assert.equal(low - base, 60);
});

test('missing labs -> valid:false (no division by zero standard)', () => {
  assert.equal(cdaiCrohns({ stools: 5 }).valid, false);
  assert.equal(cdaiCrohns({ hct: 40, weight: 60, standardWeight: 0 }).valid, false);
  assert.equal(cdaiCrohns(9).valid, false);
});
