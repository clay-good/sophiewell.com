import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mods } from '../../lib/scoring-v4.js';

// Worked examples per Marshall JC, et al. Crit Care Med.
// 1995;23(10):1638-1652 Tables 1 (per-variable 0-4 scoring) and 4
// (band-rate ICU mortality).

test('mods all-normal -> 0 of 24, 0% mortality band', () => {
  const r = mods({ pfRatio: 350, creatinineMgDl: 1.0, bilirubinMgDl: 1.0, par: 8, plateletsK: 200, gcs: 15 });
  assert.equal(r.score, 0);
  assert.match(r.band, /0%/);
});

test('mods per-variable boundaries -> sum 6 -> 3-5% band', () => {
  // Each variable at its first non-zero threshold: PaO2/FiO2 280 (=1),
  // Cr 1.5 (=1), bili 2.0 (=1), PAR 12 (=1), plt 100 (=1), GCS 14 (=1).
  const r = mods({ pfRatio: 280, creatinineMgDl: 1.5, bilirubinMgDl: 2.0, par: 12, plateletsK: 100, gcs: 14 });
  assert.equal(r.score, 6);
  assert.equal(r.parts.respiratory, 1);
  assert.equal(r.parts.renal, 1);
  assert.equal(r.parts.hepatic, 1);
  assert.equal(r.parts.cardiovascular, 1);
  assert.equal(r.parts.hematologic, 1);
  assert.equal(r.parts.neurologic, 1);
  assert.match(r.band, /3-5%/);
});

test('mods moderate dysfunction -> 12 of 24 -> ~25% band', () => {
  // PaO2/FiO2 200 (=2), Cr 3.0 (=2), bili 5.0 (=2), PAR 18 (=2),
  // plt 70 (=2), GCS 11 (=2). Sum 12.
  const r = mods({ pfRatio: 200, creatinineMgDl: 3.0, bilirubinMgDl: 5.0, par: 18, plateletsK: 70, gcs: 11 });
  assert.equal(r.score, 12);
  assert.match(r.band, /25%/);
});

test('mods severe -> 18 -> ~75% band', () => {
  // PaO2/FiO2 100 (=3), Cr 5.0 (=3), bili 10.0 (=3), PAR 25 (=3),
  // plt 30 (=3), GCS 8 (=3). Sum 18.
  const r = mods({ pfRatio: 100, creatinineMgDl: 5.0, bilirubinMgDl: 10.0, par: 25, plateletsK: 30, gcs: 8 });
  assert.equal(r.score, 18);
  assert.match(r.band, /75%/);
});

test('mods maximum 24 -> ~100% band', () => {
  // Every variable in the worst category: P/F 50 (=4), Cr 6.0 (=4),
  // bili 20 (=4), PAR 40 (=4), plt 10 (=4), GCS 5 (=4). Sum 24.
  const r = mods({ pfRatio: 50, creatinineMgDl: 6.0, bilirubinMgDl: 20, par: 40, plateletsK: 10, gcs: 5 });
  assert.equal(r.score, 24);
  assert.match(r.band, /100%/);
});

test('mods threshold check: PaO2/FiO2 = 75 falls into the 76-150 -> 3 band', () => {
  // 75 is the upper bound of the worst respiratory category (<=75 -> 4).
  const r = mods({ pfRatio: 75, creatinineMgDl: 1.0, bilirubinMgDl: 1.0, par: 8, plateletsK: 200, gcs: 15 });
  assert.equal(r.parts.respiratory, 4);
  assert.equal(r.score, 4);
});

test('mods threshold check: creatinine 1.1 falls into the <=1.1 -> 0 band', () => {
  const r = mods({ pfRatio: 350, creatinineMgDl: 1.1, bilirubinMgDl: 1.0, par: 8, plateletsK: 200, gcs: 15 });
  assert.equal(r.parts.renal, 0);
  assert.equal(r.score, 0);
});
