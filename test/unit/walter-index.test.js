// spec-v669: Walter Index - 1-year mortality after hospitalization in older adults.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { walterIndex } from '../../lib/walter-index-v669.js';

// A minimal all-lowest-risk case: female, independent, no CHF, no cancer,
// normal creatinine and albumin -> 0 points -> 4% band.
const LOW = { sex: 'female', adl: 'none', chf: false, cancer: 'none', creatinine: '1.0', albumin: '4.0' };

test('all-lowest inputs score 0 -> 4% band', () => {
  const r = walterIndex(LOW);
  assert.equal(r.valid, true);
  assert.equal(r.score, 0);
  assert.equal(r.mortality, '4%');
  assert.equal(r.abnormal, false);
});

test('individual point weights', () => {
  assert.equal(walterIndex({ ...LOW, sex: 'male' }).score, 1);
  assert.equal(walterIndex({ ...LOW, adl: 'some' }).score, 2);
  assert.equal(walterIndex({ ...LOW, adl: 'all' }).score, 5);
  assert.equal(walterIndex({ ...LOW, chf: true }).score, 2);
  assert.equal(walterIndex({ ...LOW, cancer: 'solitary' }).score, 3);
  assert.equal(walterIndex({ ...LOW, cancer: 'metastatic' }).score, 8);
  assert.equal(walterIndex({ ...LOW, creatinine: '3.5' }).score, 2);
  assert.equal(walterIndex({ ...LOW, albumin: '3.2' }).score, 1);
  assert.equal(walterIndex({ ...LOW, albumin: '2.5' }).score, 2);
});

test('lab thresholds are exact', () => {
  // creatinine: strictly > 3.0 scores 2; exactly 3.0 scores 0.
  assert.equal(walterIndex({ ...LOW, creatinine: '3.0' }).score, 0);
  assert.equal(walterIndex({ ...LOW, creatinine: '3.01' }).score, 2);
  // albumin: > 3.4 = 0; 3.0-3.4 inclusive = 1; < 3.0 = 2.
  assert.equal(walterIndex({ ...LOW, albumin: '3.5' }).score, 0);
  assert.equal(walterIndex({ ...LOW, albumin: '3.4' }).score, 1);
  assert.equal(walterIndex({ ...LOW, albumin: '3.0' }).score, 1);
  assert.equal(walterIndex({ ...LOW, albumin: '2.99' }).score, 2);
});

test('bands: 0-1=4%, 2-3=19%, 4-6=34%, >6=64%', () => {
  assert.equal(walterIndex({ ...LOW, sex: 'male' }).mortality, '4%');       // 1
  assert.equal(walterIndex({ ...LOW, adl: 'some', sex: 'male' }).mortality, '19%'); // 3
  assert.equal(walterIndex({ ...LOW, adl: 'all' }).mortality, '34%');       // 5
  assert.equal(walterIndex({ ...LOW, cancer: 'metastatic' }).mortality, '64%'); // 8
});

test('abnormal flag set at 4 points and above', () => {
  assert.equal(walterIndex({ ...LOW, adl: 'some', chf: true }).abnormal, true); // 4
  assert.equal(walterIndex({ ...LOW, adl: 'some' }).abnormal, false);           // 2
});

test('META example: male, dependent 1-4 ADLs, CHF, solitary cancer, creat 3.5, alb 3.2', () => {
  const r = walterIndex({ sex: 'male', adl: 'some', chf: true, cancer: 'solitary', creatinine: '3.5', albumin: '3.2' });
  // 1 + 2 + 2 + 3 + 2 + 1 = 11 -> >6 -> 64%
  assert.equal(r.score, 11);
  assert.equal(r.mortality, '64%');
  assert.match(r.band, /Walter index 11\/20/);
});

test('required inputs are validated', () => {
  assert.equal(walterIndex({}).valid, false);
  assert.equal(walterIndex({}).code, 'MISSING_INPUT');
  assert.equal(walterIndex({ ...LOW, sex: '' }).field, 'sex');
  assert.equal(walterIndex({ ...LOW, adl: 'x' }).field, 'adl');
  assert.equal(walterIndex({ ...LOW, cancer: 'x' }).field, 'cancer');
  assert.equal(walterIndex({ ...LOW, creatinine: '' }).field, 'creatinine');
  assert.equal(walterIndex({ ...LOW, albumin: '' }).field, 'albumin');
});
