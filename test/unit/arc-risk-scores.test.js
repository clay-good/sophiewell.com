// spec-v1631 tool 19: augmented renal clearance risk (ARC and ARCTIC scores).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { arcRiskScores as arc } from '../../lib/arc-risk-scores-v1631.js';

const base = { age: 30, sex: 'male', creatinine: 0.6, trauma: 'yes', modifiedSofa: 3 };

test('ARC score: 6 for age 50 or younger, 3 for trauma, 1 for a modified SOFA of 4 or lower', () => {
  assert.equal(arc(base).arcScore, 10);
  assert.equal(arc({ ...base, age: 50 }).arcScore, 10);
  assert.equal(arc({ ...base, age: 51 }).arcScore, 4);
  assert.equal(arc({ ...base, trauma: 'no' }).arcScore, 7);
  assert.equal(arc({ ...base, modifiedSofa: 4 }).arcScore, 10);
  assert.equal(arc({ ...base, modifiedSofa: 5 }).arcScore, 9);
  assert.equal(arc({ ...base, age: 70, trauma: 'no', modifiedSofa: 9 }).arcScore, 0);
  // No cutoff is published, so the result carries no band for it.
  const r = arc(base);
  assert.match(r.notes[0], /gives no cutoff and calls the score speculative/);
  assert.equal(r.abnormal, undefined);
});

test('ARCTIC score: 4 under 56, 3 from 56 to 75, 3 for creatinine below 0.7, 2 for male sex; 6 or higher is the cutoff', () => {
  assert.deepEqual([arc(base).arctic, arc(base).arcticAtOrAboveSix], [9, true]);
  assert.equal(arc({ ...base, age: 55 }).arctic, 9);
  assert.equal(arc({ ...base, age: 56 }).arctic, 8);
  assert.equal(arc({ ...base, age: 75 }).arctic, 8);
  assert.equal(arc({ ...base, age: 76 }).arctic, 5);
  assert.equal(arc({ ...base, creatinine: 0.7 }).arctic, 6);
  assert.deepEqual([arc({ ...base, creatinine: 0.7, sex: 'female' }).arctic, arc({ ...base, creatinine: 0.7, sex: 'female' }).arcticAtOrAboveSix], [4, false]);
  assert.match(arc(base).notes.join(' '), /sensitivity of 0\.843 and a specificity of 0\.682/);
});

test('ARCTIC is not worked out off its population: not trauma, or a creatinine above 1.3', () => {
  const noTrauma = arc({ ...base, trauma: 'no' });
  assert.deepEqual([noTrauma.arctic, noTrauma.arcScore], [null, 7]);
  assert.match(noTrauma.notes.join(' '), /derived in trauma intensive care patients/);
  const high = arc({ ...base, creatinine: 1.4 });
  assert.equal(high.arctic, null);
  assert.match(high.notes.join(' '), /excluded patients with a serum creatinine above 1\.3/);
  assert.match(high.notes.join(' '), /110 µmol\/L \(1\.24 mg\/dL\) or less/);
  assert.equal(arc({ ...base, creatinine: 1.3 }).arctic, 6);
});

test('every input is required, and neither score is called a clearance', () => {
  for (const k of Object.keys(base)) {
    const r = arc({ ...base, [k]: '' });
    assert.equal(r.valid, false, k);
    assert.ok(r.message.length <= 280, k);
  }
  assert.match(arc({ ...base, modifiedSofa: 3.5 }).message, /whole number/);
  assert.match(arc(base).notes.at(-1), /Neither score is a clearance/);
});
