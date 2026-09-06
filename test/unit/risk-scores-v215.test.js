// spec-v215: worked examples for the lipid / device / oncology risk scores.
// Point systems spec-v97 cross-verified (see module header for source pairs).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  dlcnFh, simonBroomeFh, padit, grimScore, lipi, onkotev, protecht,
} from '../../lib/risk-scores-v215.js';

test('dlcn: sums categories + LDL band', () => {
  // fam 1 + clin 2 + exam 6 + LDL 7.0 (->5) + DNA 0 = 14
  const r = dlcnFh({ familyHistory: '1', clinicalHistory: '2', physicalExam: '6', ldl: 7.0 });
  assert.equal(r.valid, true);
  assert.equal(r.score, 14);
  assert.match(r.band, /definite/);
});
test('dlcn: LDL bands', () => {
  assert.equal(dlcnFh({ ldl: 8.5 }).score, 8);
  assert.equal(dlcnFh({ ldl: 4.2 }).score, 1);
  assert.equal(dlcnFh({ ldl: 3.0 }).score, 0);
});
test('dlcn: unlikely below 3', () => {
  const r = dlcnFh({ ldl: 4.5 });
  assert.equal(r.score, 1);
  assert.equal(r.abnormal, false);
});
test('dlcn: invalid without LDL', () => { assert.equal(dlcnFh({}).valid, false); });

test('simon-broome: definite with xanthoma', () => {
  const r = simonBroomeFh({ totalChol: 8.0, tendonXanthoma: true });
  assert.equal(r.definite, true);
  assert.match(r.band, /definite/);
});
test('simon-broome: possible with family history', () => {
  const r = simonBroomeFh({ ldl: 5.0, famMi: true });
  assert.equal(r.possible, true);
  assert.equal(r.definite, false);
});
test('simon-broome: child thresholds', () => {
  const r = simonBroomeFh({ totalChol: 6.8, child: true, dnaMutation: true });
  assert.equal(r.definite, true);
});
test('simon-broome: not met below threshold', () => {
  const r = simonBroomeFh({ totalChol: 5.0 });
  assert.equal(r.cholMet, false);
  assert.equal(r.abnormal, false);
});

test('padit: high band', () => {
  // prior 4 + age 55 (->2) + type 4 = 10
  const r = padit({ priorProcedures: '4', age: 55, procedureType: '4' });
  assert.equal(r.score, 10);
  assert.match(r.band, /high/);
});
test('padit: low band and age bands', () => {
  assert.equal(padit({ priorProcedures: '0', age: 75, procedureType: '0' }).score, 0);
  assert.equal(padit({ priorProcedures: '0', age: 65, procedureType: '0' }).score, 1);
});
test('padit: invalid without age', () => { assert.equal(padit({}).valid, false); });

test('grim: three factors', () => {
  const r = grimScore({ albumin: 3.0, nlr: 8, ldhHigh: true });
  assert.equal(r.score, 3);
  assert.equal(r.abnormal, true);
});
test('grim: low with high albumin low nlr', () => {
  const r = grimScore({ albumin: 4.0, nlr: 3, ldhHigh: false });
  assert.equal(r.score, 0);
  assert.equal(r.abnormal, false);
});

test('lipi: dNLR computed and banded', () => {
  // 7/(9-7)=3.5 > 3 -> 1; ldh -> 1; poor
  const r = lipi({ anc: 7, wbc: 9, ldhHigh: true });
  assert.equal(r.dnlr, 3.5);
  assert.equal(r.score, 2);
  assert.match(r.band, /poor/);
});
test('lipi: good group', () => {
  const r = lipi({ anc: 4, wbc: 8, ldhHigh: false }); // dNLR 1.0
  assert.equal(r.score, 0);
});
test('lipi: invalid when WBC <= ANC', () => {
  assert.equal(lipi({ anc: 9, wbc: 8 }).valid, false);
});

test('onkotev: high at >= 2', () => {
  const r = onkotev({ khoranaHigh: true, metastatic: true });
  assert.equal(r.score, 2);
  assert.match(r.band, /high/);
});
test('onkotev: low at 0', () => {
  const r = onkotev({});
  assert.equal(r.score, 0);
  assert.equal(r.abnormal, false);
});

test('protecht: high at >= 3', () => {
  // site 2 + platelets 1 + platinum 1 = 4
  const r = protecht({ cancerSite: '2', plateletsHigh: true, platinum: true });
  assert.equal(r.score, 4);
  assert.match(r.band, /high/);
});
test('protecht: low-intermediate', () => {
  const r = protecht({ cancerSite: '1', wbcHigh: true });
  assert.equal(r.score, 2);
  assert.equal(r.abnormal, false);
});

// spec-v1095: the Simon Broome cholesterol criterion is an OR over two lipids,
// each tested as "entered AND above threshold", so a lipid nobody measured read
// as a lipid below threshold. With one entered and below the line the tile said
// "cholesterol criterion not met" -- a statement about a measurement it did not
// have. The other lipid at a plausible value takes the same patient to definite
// FH, which is the difference between a cascade-screening referral and none.
test('spec-v1095: one lipid below threshold does not settle the cholesterol criterion', () => {
  const ldlOnly = simonBroomeFh({ ldl: 3 });
  assert.equal(ldlOnly.cholMet, false);
  assert.match(ldlOnly.band, /not met on the LDL-C entered/);
  assert.match(ldlOnly.band, /Total cholesterol was not entered/);
  assert.match(ldlOnly.band, /does not rule familial hypercholesterolemia out/);

  const tcOnly = simonBroomeFh({ totalChol: 5 });
  assert.match(tcOnly.band, /LDL-C was not entered/);

  // Both measured and both below: the criterion really is not met.
  const both = simonBroomeFh({ ldl: 3, totalChol: 5 });
  assert.match(both.band, /cholesterol criterion not met/);
  assert.match(both.band, /FH not classified/);
  assert.doesNotMatch(both.band, /was not entered/);

  // Ruling IN is untouched.
  assert.equal(simonBroomeFh({ ldl: 5, tendonXanthoma: true }).definite, true);
});
