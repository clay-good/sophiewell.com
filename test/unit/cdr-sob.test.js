// spec-v173 §2.3: CDR - Sum of Boxes. Six boxes summed to 0-18; O'Bryant 2008
// staging: 0 none, 0.5-4.0 questionable/very mild, 4.5-9.0 mild, 9.5-15.5
// moderate, 16.0-18.0 severe.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cdrSob } from '../../lib/ltcga-v173.js';

test('CDR-SOB 0 -> no dementia', () => {
  const r = cdrSob({ memory: 0, orientation: 0, judgment: 0, community: 0, home: 0, personalCare: 0 });
  assert.equal(r.valid, true);
  assert.equal(r.sob, 0);
  assert.match(r.band, /no dementia/);
});

test('CDR-SOB 4.0 -> questionable, 4.5 -> mild (very-mild/mild band flip)', () => {
  const four = cdrSob({ memory: 1, orientation: 1, judgment: 1, community: 1, home: 0, personalCare: 0 });
  assert.equal(four.sob, 4.0);
  assert.match(four.band, /questionable to very mild/);
  const fourFive = cdrSob({ memory: 1, orientation: 1, judgment: 0.5, community: 1, home: 1, personalCare: 0 });
  assert.equal(fourFive.sob, 4.5);
  assert.match(fourFive.band, /mild \(CDR 1\)/);
});

test('CDR-SOB 9.0 -> mild, 9.5 -> moderate (mild/moderate band flip)', () => {
  const nine = cdrSob({ memory: 2, orientation: 2, judgment: 2, community: 2, home: 1, personalCare: 0 });
  assert.equal(nine.sob, 9.0);
  assert.match(nine.band, /mild \(CDR 1\)/);
  const nineFive = cdrSob({ memory: 2, orientation: 2, judgment: 2, community: 2, home: 0.5, personalCare: 1 });
  assert.equal(nineFive.sob, 9.5);
  assert.match(nineFive.band, /moderate \(CDR 2\)/);
});

test('CDR-SOB 16.0 -> severe', () => {
  const r = cdrSob({ memory: 3, orientation: 3, judgment: 3, community: 3, home: 3, personalCare: 1 });
  assert.equal(r.sob, 16.0);
  assert.match(r.band, /severe dementia/);
});

test('CDR-SOB rejects personal-care 0.5 (no 0.5 level) and blanks', () => {
  assert.equal(cdrSob({ memory: 1, orientation: 1, judgment: 1, community: 1, home: 1, personalCare: 0.5 }).valid, false);
  assert.equal(cdrSob({ memory: 1, orientation: 1, judgment: 1, community: 1, home: 1 }).valid, false);
  assert.equal(cdrSob({}).valid, false);
});
