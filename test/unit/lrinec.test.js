// spec-v109 2.4: LRINEC (Wong 2004). 6-lab necrotizing-fasciitis suspicion score
// 0-13; low <= 5, intermediate 6-7, high >= 8.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lrinec } from '../../lib/traumaclass-v109.js';

test('all-normal labs score 0 (low risk)', () => {
  const r = lrinec({ crp: 40, wbc: 10, hemoglobin: 14, sodium: 140, creatinine: 1.0, glucose: 100 });
  assert.equal(r.total, 0);
  assert.equal(r.riskBand, 'low');
});

test('each lab bands to its published point value', () => {
  // CRP>=150=4, WBC>25=2, Hb<11=2, Na<135=2, Cr>1.6=2, Glu>180=1 => 13
  const r = lrinec({ crp: 200, wbc: 30, hemoglobin: 9, sodium: 130, creatinine: 2.0, glucose: 250 });
  assert.equal(r.total, 13);
  assert.equal(r.riskBand, 'high');
});

test('intermediate band 6-7', () => {
  // Three labs, total 6: at the suspicion threshold, so it rules in (spec-v1006).
  // CRP>=150=4, WBC 15-25=1, Hb 11-13.5=1 => 6
  const r = lrinec({ crp: 160, wbc: 20, hemoglobin: 12 });
  assert.equal(r.total, 6);
  assert.equal(r.riskBand, 'intermediate');
  assert.match(r.band, />= 6 should raise suspicion/);
});

test('band flip: a sixth-lab point crosses 7 into the high band', () => {
  // CRP4 + WBC2 + Hb2 = 8 -> high
  const r = lrinec({ crp: 180, wbc: 26, hemoglobin: 10 });
  assert.equal(r.total, 8);
  assert.equal(r.riskBand, 'high');
  assert.match(r.band, /high risk of necrotizing fasciitis \(> 75%\)/);
});

test('hemoglobin boundary: 13.5 scores 1, just above scores 0', () => {
  // spec-v1006: the point table is exercised against a COMPLETE panel. A single
  // lab on its own no longer produces a total, because a partial LRINEC in the
  // low band is withheld rather than reported as reassurance.
  const rest = { crp: 40, wbc: 10, sodium: 140, creatinine: 1.0, glucose: 100 };
  assert.equal(lrinec({ ...rest, hemoglobin: 13.5 }).total, 1);
  assert.equal(lrinec({ ...rest, hemoglobin: 13.6 }).total, 0);
  assert.equal(lrinec({ ...rest, hemoglobin: 10.9 }).total, 2);
});

// spec-v1006: every component adds zero or more, so a partial total is a lower
// bound. It may rule necrotizing fasciitis IN and must never rule it out.

test('an empty panel does not report low risk', () => {
  const r = lrinec({});
  assert.equal(r.valid, false);
  assert.equal(r.total, null);
  assert.match(r.band, /Enter all six LRINEC labs/);
  assert.doesNotMatch(r.band, /low risk/);
});

test('a partial panel below the suspicion threshold is withheld, and names what is missing', () => {
  const r = lrinec({ crp: 200 });
  assert.equal(r.valid, false);
  assert.match(r.band, /Missing: WBC, hemoglobin, sodium, creatinine, glucose/);
  assert.match(r.band, /can only add points/);
});

test('a partial panel already at the threshold still rules in', () => {
  // CRP 4 + WBC 2 = 6 with four labs unentered: the missing four can only add,
  // so the suspicion stands and the reading says what it was scored from.
  const r = lrinec({ crp: 200, wbc: 30 });
  assert.equal(r.valid, true);
  assert.equal(r.total, 6);
  assert.equal(r.riskBand, 'intermediate');
  assert.equal(r.partialFrom, 2);
  assert.match(r.band, /Scored from 2 of 6 components/);
});

test('a complete panel reads exactly as before', () => {
  const r = lrinec({ crp: 40, wbc: 10, hemoglobin: 14, sodium: 140, creatinine: 1.0, glucose: 100 });
  assert.equal(r.total, 0);
  assert.equal(r.riskBand, 'low');
  assert.equal(r.partialFrom, null);
  assert.doesNotMatch(r.band, /Scored from/);
});
