// spec-v657: ISGLS grading of post-hepatectomy liver failure.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { isglsPhlf } from '../../lib/isgls-phlf-v657.js';

test('gate not met = no PHLF', () => {
  const r = isglsPhlf({ labGate: false });
  assert.equal(r.valid, true);
  assert.equal(r.grade, 'none');
  assert.equal(r.gateMet, false);
  assert.equal(r.abnormal, false);
});

test('gate met, no deviation = Grade A', () => {
  const r = isglsPhlf({ labGate: true });
  assert.equal(r.grade, 'A');
  assert.equal(r.code, 'Grade A');
  assert.equal(r.abnormal, false);
});

test('gate met + non-invasive deviation = Grade B', () => {
  const r = isglsPhlf({ labGate: true, managementDeviation: true });
  assert.equal(r.grade, 'B');
  assert.equal(r.code, 'Grade B');
  assert.equal(r.abnormal, true);
});

test('invasive treatment wins over deviation (most severe wins)', () => {
  const r = isglsPhlf({ labGate: true, managementDeviation: true, invasiveTreatment: true });
  assert.equal(r.grade, 'C');
  assert.equal(r.code, 'Grade C');
});

test('invasive treatment alone (no B) = Grade C', () => {
  assert.equal(isglsPhlf({ labGate: true, invasiveTreatment: true }).grade, 'C');
});

test('a grade feature without the gate stays no PHLF', () => {
  assert.equal(isglsPhlf({ labGate: false, invasiveTreatment: true }).grade, 'none');
  assert.equal(isglsPhlf({ labGate: false, managementDeviation: true }).grade, 'none');
});

test('the lab gate is required', () => {
  assert.equal(isglsPhlf({}).valid, false);
  assert.equal(isglsPhlf({}).code, 'MISSING_INPUT');
});
