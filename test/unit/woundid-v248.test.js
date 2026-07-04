// spec-v248: worked examples for the wound-care + infectious-disease scores. Point
// systems spec-v97 verified (Tobiasen 1982; Ince 2008; Miller 2013; Gutierrez-
// Gutierrez 2017).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { absiBurn, sinbadScore, atlasCdi, incrementCpe } from '../../lib/woundid-v248.js';

test('absi: severe threat band', () => {
  const r = absiBurn({ sex: 'female', age: 50, inhalation: true, fullThickness: true, tbsa: 35 });
  assert.equal(r.score, 10);
  assert.equal(r.abnormal, true);
});
test('absi: low score very low threat', () => {
  const r = absiBurn({ sex: 'male', age: 30, tbsa: 5 }); // 0 + 2 + 1 = 3
  assert.equal(r.score, 3);
  assert.equal(r.abnormal, false);
});

test('sinbad: >= 3 higher risk', () => {
  const r = sinbadScore({ site: true, ischemia: true, neuropathy: true });
  assert.equal(r.score, 3);
  assert.equal(r.abnormal, true);
});

test('atlas: predicted cure', () => {
  const r = atlasCdi({ age: 1, antibiotics: 2, leukocyte: 1, albumin: 1, creatinine: 1 });
  assert.equal(r.score, 6);
  assert.match(r.band, /69\.5%/);
});

test('increment-cpe: >= 8 high risk', () => {
  const r = incrementCpe({ shock: true, pitt: true }); // 5 + 4 = 9
  assert.equal(r.score, 9);
  assert.equal(r.abnormal, true);
});
test('increment-cpe: low risk', () => {
  const r = incrementCpe({ charlson: true }); // 3
  assert.equal(r.score, 3);
  assert.equal(r.abnormal, false);
});
