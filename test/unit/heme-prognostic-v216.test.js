// spec-v216: worked examples for the hematology prognostic scores and staging.
// Point systems spec-v97 cross-verified (see module header for source pairs).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  wpssMds, mdaccCll, pitPtcl, primaPi, durieSalmon, ldt, talcott,
} from '../../lib/heme-prognostic-v216.js';

test('wpss: sums three parts', () => {
  const r = wpssMds({ whoCategory: '2', karyotype: '1', transfusion: true });
  assert.equal(r.score, 4);
  assert.match(r.band, /high risk/);
});
test('wpss: very low at 0', () => {
  const r = wpssMds({ whoCategory: '0', karyotype: '0' });
  assert.equal(r.score, 0);
  assert.equal(r.abnormal, false);
});

test('mdacc: banded age/alc plus booleans', () => {
  const r = mdaccCll({ age: 70, b2mBand: '2', alc: 60, male: true });
  assert.equal(r.score, 7);
  assert.match(r.band, /intermediate/);
});
test('mdacc: low band', () => {
  const r = mdaccCll({ age: 45, b2mBand: '0', alc: 10 });
  assert.equal(r.score, 0);
  assert.equal(r.abnormal, false);
});
test('mdacc: invalid without age/alc', () => { assert.equal(mdaccCll({}).valid, false); });

test('pit: group from factor count', () => {
  const r = pitPtcl({ ageOver60: true, ldhHigh: true });
  assert.equal(r.score, 2);
  assert.equal(r.group, 3);
});
test('pit: group 4 caps at 3-4 factors', () => {
  assert.equal(pitPtcl({ ageOver60: true, ldhHigh: true, ecog2: true, marrow: true }).group, 4);
});

test('prima-pi: intermediate with marrow', () => {
  const r = primaPi({ b2m: 2, marrow: true });
  assert.equal(r.group, 'Intermediate');
});
test('prima-pi: high when B2M > 3', () => {
  assert.equal(primaPi({ b2m: 4, marrow: false }).group, 'High');
});
test('prima-pi: low when B2M <= 3 no marrow', () => {
  const r = primaPi({ b2m: 2, marrow: false });
  assert.equal(r.group, 'Low');
  assert.equal(r.abnormal, false);
});

test('durie-salmon: stage III from low Hb', () => {
  const r = durieSalmon({ hemoglobin: 7, calcium: 10, boneLesions: 4, mProtein: '2', creatinine: 1.0 });
  assert.equal(r.stage, 'IIIA');
});
test('durie-salmon: stage I when all low', () => {
  const r = durieSalmon({ hemoglobin: 12, calcium: 9, boneLesions: 0, mProtein: '0', creatinine: 1.0 });
  assert.equal(r.stage, 'IA');
  assert.equal(r.abnormal, false);
});
test('durie-salmon: subclass B by creatinine', () => {
  const r = durieSalmon({ hemoglobin: 12, calcium: 9, boneLesions: 0, mProtein: '0', creatinine: 2.5 });
  assert.equal(r.stage, 'IB');
});

test('ldt: doubling time formula', () => {
  const r = ldt({ alc1: 20, alc2: 40, intervalMonths: 6 });
  assert.equal(r.months, 6);
  assert.equal(r.abnormal, true);
});
test('ldt: favorable above 12 months', () => {
  const r = ldt({ alc1: 20, alc2: 30, intervalMonths: 12 }); // 12*ln2/ln(1.5)=20.5
  assert.equal(r.abnormal, false);
});
test('ldt: invalid when later <= earlier', () => {
  assert.equal(ldt({ alc1: 40, alc2: 30, intervalMonths: 6 }).valid, false);
});

test('talcott: group IV low risk when all false', () => {
  const r = talcott({});
  assert.equal(r.group, 'IV');
  assert.equal(r.abnormal, false);
});
test('talcott: inpatient is group I', () => {
  assert.equal(talcott({ inpatient: true }).group, 'I');
});
test('talcott: comorbidity is group II', () => {
  assert.equal(talcott({ comorbidity: true }).group, 'II');
});
