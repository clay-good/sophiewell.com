// spec-v12 §3.6.1 wave 12-6: HOSPITAL Score boundary examples per
// Donze J, et al. JAMA Intern Med. 2013;173(8):632-638.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hospitalScore } from '../../lib/scoring-v4.js';

test('hospital-score low edge: nothing -> 0 (low)', () => {
  const r = hospitalScore({ hgbLt12: false, oncologyDischarge: false,
    sodiumLt135: false, anyProcedure: false, urgentAdmission: false,
    priorAdmissions12mo: 0, losGe5: false });
  assert.equal(r.score, 0);
  assert.match(r.band, /low risk/);
});

test('hospital-score mid: 6 (intermediate)', () => {
  const r = hospitalScore({ hgbLt12: true, oncologyDischarge: false,
    sodiumLt135: true, anyProcedure: true, urgentAdmission: true,
    priorAdmissions12mo: 0, losGe5: true });
  assert.equal(r.score, 6);
  assert.match(r.band, /intermediate/);
});

test('hospital-score high (maximum) 13', () => {
  const r = hospitalScore({ hgbLt12: true, oncologyDischarge: true,
    sodiumLt135: true, anyProcedure: true, urgentAdmission: true,
    priorAdmissions12mo: 6, losGe5: true });
  assert.equal(r.score, 13);
  assert.match(r.band, /high risk/);
});

test('hospital-score prior admissions bands: 1-2=0; 3-4=2; >=5=5', () => {
  const f = (n) => hospitalScore({ hgbLt12: false, oncologyDischarge: false,
    sodiumLt135: false, anyProcedure: false, urgentAdmission: false,
    priorAdmissions12mo: n, losGe5: false }).score;
  assert.equal(f(0), 0);
  assert.equal(f(2), 0);
  assert.equal(f(3), 2);
  assert.equal(f(4), 2);
  assert.equal(f(5), 5);
  assert.equal(f(10), 5);
});
