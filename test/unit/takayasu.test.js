// spec-v638: 2022 ACR/EULAR Takayasu Arteritis Classification Criteria.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { takayasuAcrEular2022 } from '../../lib/takayasu-v638.js';

test('both absolute requirements gate scoring', () => {
  // Neither requirement.
  assert.equal(takayasuAcrEular2022({}).applicable, false);
  // Only age, no imaging.
  assert.equal(takayasuAcrEular2022({ ageEntry: '1' }).applicable, false);
  // Only imaging, no age.
  assert.equal(takayasuAcrEular2022({ imagingEntry: '1' }).applicable, false);
  // Both met: applicable even with no weighted items (score 0).
  const r = takayasuAcrEular2022({ ageEntry: '1', imagingEntry: '1' });
  assert.equal(r.applicable, true);
  assert.equal(r.score, 0);
  assert.equal(r.abnormal, false);
});

test('META example: female + angina + abdominal aorta = 6/19 classifies', () => {
  const r = takayasuAcrEular2022({ ageEntry: '1', imagingEntry: '1', female: '1', angina: '1', abdoAorta: '1' });
  assert.equal(r.score, 6);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /2022 ACR\/EULAR 6\/19/);
  assert.match(r.band, /classify as Takayasu arteritis/);
});

test('threshold is at 5: a 4-point patient does not classify', () => {
  // female (+1) + three territories (+3) = 4, below 5.
  const r = takayasuAcrEular2022({ ageEntry: '1', imagingEntry: '1', female: '1', territories: 'three' });
  assert.equal(r.score, 4);
  assert.equal(r.abnormal, false);
  // Add a bruit (+2) -> 6, classifies.
  const r2 = takayasuAcrEular2022({ ageEntry: '1', imagingEntry: '1', female: '1', territories: 'three', bruit: '1' });
  assert.equal(r2.score, 6);
  assert.equal(r2.abnormal, true);
});

test('arterial-territory select weights +1/+2/+3', () => {
  const base = { ageEntry: '1', imagingEntry: '1' };
  assert.equal(takayasuAcrEular2022({ ...base, territories: 'none' }).score, 0);
  assert.equal(takayasuAcrEular2022({ ...base, territories: 'one' }).score, 1);
  assert.equal(takayasuAcrEular2022({ ...base, territories: 'two' }).score, 2);
  assert.equal(takayasuAcrEular2022({ ...base, territories: 'three' }).score, 3);
  // Unknown / empty territory value contributes 0.
  assert.equal(takayasuAcrEular2022({ ...base, territories: '' }).score, 0);
  assert.equal(takayasuAcrEular2022({ ...base, territories: 'four' }).score, 0);
});

test('maximum possible score is 19', () => {
  const r = takayasuAcrEular2022({
    ageEntry: 1, imagingEntry: 1, female: 1, angina: 1, claudication: 1, bruit: 1,
    reducedPulse: 1, carotid: 1, bpDiff: 1, symmetric: 1, abdoAorta: 1, territories: 'three',
  });
  assert.equal(r.score, 19);
  assert.equal(r.abnormal, true);
});

test('clinical items carry their verified weights', () => {
  const base = { ageEntry: '1', imagingEntry: '1' };
  assert.equal(takayasuAcrEular2022({ ...base, female: '1' }).score, 1);
  assert.equal(takayasuAcrEular2022({ ...base, angina: '1' }).score, 2);
  assert.equal(takayasuAcrEular2022({ ...base, claudication: '1' }).score, 2);
  assert.equal(takayasuAcrEular2022({ ...base, bruit: '1' }).score, 2);
  assert.equal(takayasuAcrEular2022({ ...base, reducedPulse: '1' }).score, 2);
  assert.equal(takayasuAcrEular2022({ ...base, carotid: '1' }).score, 2);
  assert.equal(takayasuAcrEular2022({ ...base, bpDiff: '1' }).score, 1);
  assert.equal(takayasuAcrEular2022({ ...base, symmetric: '1' }).score, 1);
  assert.equal(takayasuAcrEular2022({ ...base, abdoAorta: '1' }).score, 3);
});
