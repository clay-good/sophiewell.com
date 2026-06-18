// spec-v107 2.2: New Orleans Head Trauma Criteria (Haydel 2000). Any positive -> CT.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newOrleansHead } from '../../lib/eddecision-v107.js';

test('no criteria -> CT not indicated', () => {
  const r = newOrleansHead({});
  assert.equal(r.positive, 0);
  assert.equal(r.ctIndicated, false);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /All 7 New Orleans Criteria negative/);
});

test('band flip: one positive criterion flips no-CT -> CT', () => {
  const r = newOrleansHead({ headache: true });
  assert.equal(r.positive, 1);
  assert.equal(r.ctIndicated, true);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /1 positive criterion \(Headache\): head CT indicated/);
});

test('tile example: vomiting + age > 60 = 2 positive, CT indicated', () => {
  const r = newOrleansHead({ vomiting: true, ageOver60: true });
  assert.equal(r.positive, 2);
  assert.deepEqual(r.flagged, ['Vomiting', 'Age > 60 years']);
  assert.match(r.band, /2 positive criteria \(Vomiting; Age > 60 years\): head CT indicated/);
});

test('all 7 positive -> CT indicated, all listed', () => {
  const r = newOrleansHead({
    headache: true, vomiting: true, ageOver60: true, intoxication: true,
    amnesia: true, traumaAboveClavicle: true, seizure: true,
  });
  assert.equal(r.positive, 7);
  assert.equal(r.ctIndicated, true);
});
