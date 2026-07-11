// spec-v292: restrictive transfusion threshold decision aid (AABB 2023).
// Worked-example tests: each population's threshold, a band-flip pair (just
// below vs at), the ACS no-recommendation branch (asserts NO fabricated
// number - Design D2), the symptomatic-anemia override annotation, and the
// RangeError guard on an impossible hemoglobin.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { transfusionThreshold } from '../../lib/transfusion-v292.js';

test('each population reports its verified AABB 2023 threshold', () => {
  assert.equal(transfusionThreshold({ hemoglobin: 6, population: 'stable-adult' }).threshold, 7);
  assert.equal(transfusionThreshold({ hemoglobin: 6, population: 'stable-child' }).threshold, 7);
  assert.equal(transfusionThreshold({ hemoglobin: 6, population: 'heme-onc' }).threshold, 7);
  assert.equal(transfusionThreshold({ hemoglobin: 6, population: 'cardiac-surgery' }).threshold, 7.5);
  assert.equal(transfusionThreshold({ hemoglobin: 6, population: 'orthopedic-surgery' }).threshold, 8);
  assert.equal(transfusionThreshold({ hemoglobin: 6, population: 'cardiovascular-disease' }).threshold, 8);
});

test('hematologic/oncologic patients use the AABB 2023 conditional 7 g/dL threshold', () => {
  const r = transfusionThreshold({ hemoglobin: 6.5, population: 'heme-onc' });
  assert.equal(r.threshold, 7);
  assert.equal(r.belowThreshold, true);
  assert.match(r.band, /below the 7 g\/dL AABB restrictive threshold for a hospitalized adult with a hematologic or oncologic disorder/);
});

test('band flips at the threshold: below vs at or above', () => {
  const below = transfusionThreshold({ hemoglobin: 6.8, population: 'stable-adult' });
  assert.equal(below.belowThreshold, true);
  assert.equal(below.abnormal, true);
  assert.match(below.band, /below the 7 g\/dL AABB restrictive threshold/);
  assert.match(below.band, /transfusion is reasonable/);

  // Exactly at the threshold is NOT below (restrictive = transfuse when < threshold).
  const at = transfusionThreshold({ hemoglobin: 7, population: 'stable-adult' });
  assert.equal(at.belowThreshold, false);
  assert.equal(at.abnormal, false);
  assert.match(at.band, /at or above the 7 g\/dL AABB restrictive threshold/);
  assert.match(at.band, /do not transfuse on the hemoglobin alone/);
});

test('cardiac surgery uses the 7.5 g/dL threshold (spec-v97 correction from the 8 sketch)', () => {
  const r = transfusionThreshold({ hemoglobin: 7.2, population: 'cardiac-surgery' });
  assert.equal(r.threshold, 7.5);
  assert.equal(r.belowThreshold, true);
  assert.match(r.band, /below the 7.5 g\/dL AABB restrictive threshold for cardiac surgery/);
});

test('acute coronary syndrome: no numeric threshold, never a fabricated number (Design D2)', () => {
  const r = transfusionThreshold({ hemoglobin: 6.5, population: 'acute-coronary-syndrome' });
  assert.equal(r.valid, true);
  assert.equal(r.threshold, null);
  assert.equal(r.belowThreshold, null);
  assert.match(r.band, /no restrictive-threshold recommendation for acute coronary syndrome/);
  // The band must not emit any hemoglobin threshold number.
  assert.doesNotMatch(r.band, /\d+(\.\d+)?\s*g\/dL/);
});

test('symptomatic-anemia override annotates without lowering the threshold', () => {
  const r = transfusionThreshold({ hemoglobin: 7.5, population: 'stable-adult', symptomatic: true });
  assert.equal(r.threshold, 7); // unchanged
  assert.equal(r.belowThreshold, false); // 7.5 is still at/above 7
  assert.match(r.band, /clinical-judgment override/);
  // Off by default.
  const plain = transfusionThreshold({ hemoglobin: 7.5, population: 'stable-adult' });
  assert.doesNotMatch(plain.band, /clinical-judgment override/);
});

test('g/L input is converted to g/dL upstream; blank hemoglobin is a friendly prompt', () => {
  const blank = transfusionThreshold({ hemoglobin: '', population: 'stable-adult' });
  assert.equal(blank.valid, false);
  assert.match(blank.message, /Enter a hemoglobin/);
});

test('impossible hemoglobin throws RangeError', () => {
  assert.throws(() => transfusionThreshold({ hemoglobin: 0, population: 'stable-adult' }), RangeError);
  assert.throws(() => transfusionThreshold({ hemoglobin: -3, population: 'stable-adult' }), RangeError);
  assert.throws(() => transfusionThreshold({ hemoglobin: 31, population: 'stable-adult' }), RangeError);
});

test('unknown population defaults to the stable-adult 7 g/dL threshold', () => {
  const r = transfusionThreshold({ hemoglobin: 6, population: 'nonsense' });
  assert.equal(r.threshold, 7);
});
