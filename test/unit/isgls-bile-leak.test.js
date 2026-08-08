// spec-v658: ISGLS grading of bile leakage.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { isglsBileLeak } from '../../lib/isgls-bile-leak-v658.js';

test('gate not met = no bile leak', () => {
  const r = isglsBileLeak({ bileGate: false });
  assert.equal(r.valid, true);
  assert.equal(r.grade, 'none');
  assert.equal(r.gateMet, false);
  assert.equal(r.abnormal, false);
});

test('gate met, no change = Grade A', () => {
  const r = isglsBileLeak({ bileGate: true });
  assert.equal(r.grade, 'A');
  assert.equal(r.code, 'Grade A');
  assert.equal(r.abnormal, false);
});

test('gate met + change in management = Grade B', () => {
  const r = isglsBileLeak({ bileGate: true, managementChange: true });
  assert.equal(r.grade, 'B');
  assert.equal(r.code, 'Grade B');
  assert.equal(r.abnormal, true);
});

test('relaparotomy wins over change in management (most severe wins)', () => {
  const r = isglsBileLeak({ bileGate: true, managementChange: true, relaparotomy: true });
  assert.equal(r.grade, 'C');
  assert.equal(r.code, 'Grade C');
});

test('relaparotomy alone (no B) = Grade C', () => {
  assert.equal(isglsBileLeak({ bileGate: true, relaparotomy: true }).grade, 'C');
});

test('a grade feature without the gate stays no bile leak', () => {
  assert.equal(isglsBileLeak({ bileGate: false, relaparotomy: true }).grade, 'none');
  assert.equal(isglsBileLeak({ bileGate: false, managementChange: true }).grade, 'none');
});

test('the bile gate is required', () => {
  assert.equal(isglsBileLeak({}).valid, false);
  assert.equal(isglsBileLeak({}).code, 'MISSING_INPUT');
});
