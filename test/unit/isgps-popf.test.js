// spec-v656: ISGPS 2016 grading of postoperative pancreatic fistula.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { isgpsPopf } from '../../lib/isgps-popf-v656.js';

test('gate not met = no POPF', () => {
  const r = isgpsPopf({ amylaseGate: false });
  assert.equal(r.valid, true);
  assert.equal(r.grade, 'none');
  assert.equal(r.gateMet, false);
  assert.equal(r.abnormal, false);
});

test('gate met, no B/C feature = biochemical leak', () => {
  const r = isgpsPopf({ amylaseGate: true });
  assert.equal(r.grade, 'BL');
  assert.equal(r.code, 'Biochemical leak');
  assert.equal(r.abnormal, false);
});

test('gate met + grade-B feature = Grade B', () => {
  const r = isgpsPopf({ amylaseGate: true, gradeBFeature: true });
  assert.equal(r.grade, 'B');
  assert.equal(r.code, 'Grade B');
  assert.equal(r.abnormal, true);
});

test('grade-C feature wins over grade-B (most severe wins)', () => {
  const r = isgpsPopf({ amylaseGate: true, gradeBFeature: true, gradeCFeature: true });
  assert.equal(r.grade, 'C');
  assert.equal(r.code, 'Grade C');
  assert.equal(r.abnormal, true);
});

test('grade-C feature alone (no B) = Grade C', () => {
  assert.equal(isgpsPopf({ amylaseGate: true, gradeCFeature: true }).grade, 'C');
});

test('a grade-B or grade-C feature without the gate stays no POPF', () => {
  assert.equal(isgpsPopf({ amylaseGate: false, gradeCFeature: true }).grade, 'none');
  assert.equal(isgpsPopf({ amylaseGate: false, gradeBFeature: true }).grade, 'none');
});

test('the amylase gate is required', () => {
  assert.equal(isgpsPopf({}).valid, false);
  assert.equal(isgpsPopf({}).code, 'MISSING_INPUT');
});
