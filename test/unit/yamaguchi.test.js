// spec-v642: Yamaguchi criteria for Adult-Onset Still's Disease.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { yamaguchiAosd } from '../../lib/yamaguchi-v642.js';

const MAJORS = { feverMajor: '1', arthralgia: '1', rash: '1', leukocytosis: '1' };

test('META example: 4 major + 1 minor = 5 criteria, classifies', () => {
  const r = yamaguchiAosd({ ...MAJORS, soreThroat: '1' });
  assert.equal(r.total, 5);
  assert.equal(r.majorCount, 4);
  assert.equal(r.classified, true);
  assert.equal(r.excluded, false);
  assert.match(r.band, /5 criteria including 4 major/);
  assert.match(r.band, /adult-onset Still/);
});

test('needs >= 5 total: 4 criteria does not classify', () => {
  const r = yamaguchiAosd({ ...MAJORS }); // 4 major, 0 minor = 4 total
  assert.equal(r.total, 4);
  assert.equal(r.classified, false);
});

test('needs >= 2 major: 1 major + 4 minor = 5 total does NOT classify', () => {
  const r = yamaguchiAosd({ feverMajor: '1', soreThroat: '1', lymphSpleen: '1', liverDysfunction: '1', negativeRfAna: '1' });
  assert.equal(r.total, 5);
  assert.equal(r.majorCount, 1);
  assert.equal(r.classified, false);
});

test('2 major + 3 minor = 5 total with 2 major classifies', () => {
  const r = yamaguchiAosd({ feverMajor: '1', arthralgia: '1', soreThroat: '1', lymphSpleen: '1', liverDysfunction: '1' });
  assert.equal(r.total, 5);
  assert.equal(r.majorCount, 2);
  assert.equal(r.classified, true);
});

test('any exclusion vetoes classification even when criteria are met', () => {
  const met = { ...MAJORS, soreThroat: '1' }; // would classify (5, 4 major)
  for (const excl of ['exclInfection', 'exclMalignancy', 'exclRheumatic']) {
    const r = yamaguchiAosd({ ...met, [excl]: '1' });
    assert.equal(r.excluded, true);
    assert.equal(r.classified, false);
    assert.match(r.band, /Not classifiable/);
  }
});

test('lymphadenopathy/splenomegaly is ONE minor, and RF+ANA is ONE minor', () => {
  // Only four distinct minor keys exist; setting all four gives minorCount 4.
  const r = yamaguchiAosd({ soreThroat: '1', lymphSpleen: '1', liverDysfunction: '1', negativeRfAna: '1' });
  assert.equal(r.minorCount, 4);
  assert.equal(r.majorCount, 0);
});

test('empty inputs: 0 criteria, not classified, not excluded', () => {
  const r = yamaguchiAosd({});
  assert.equal(r.total, 0);
  assert.equal(r.classified, false);
  assert.equal(r.excluded, false);
  assert.equal(r.valid, true);
});
