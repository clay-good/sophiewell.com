// spec-v908: Hy's Law. The test that matters is the one separating a potential case from a case.

import test from 'node:test';
import assert from 'node:assert/strict';
import { hysLaw, HYS_LAW_NOTE } from '../../lib/hys-law-v908.js';

const LABS = { alt: 250, altUln: 40, bilirubin: 3.5, bilirubinUln: 1.2, alp: 150, alpUln: 120 };

test('hys-law: each lab pair is required, and the message says why', () => {
  assert.match(hysLaw({}).message, /ALT or an AST/);
  assert.match(hysLaw({ alt: 250, altUln: 40 }).message, /total bilirubin/);
  assert.match(hysLaw({ alt: 250, altUln: 40, bilirubin: 3, bilirubinUln: 1 }).message, /alkaline phosphatase/);
});

test('hys-law: the labs alone make a potential case, never a case', () => {
  const r = hysLaw(LABS);
  assert.equal(r.verdict, 'potential');
  assert.equal(r.bandLabel, `Potential Hy's Law case`);
  assert.match(r.band, /potential case, not a case/);
  assert.equal(r.abnormal, true);
});

test('hys-law: recording the exclusion of other causes is what makes it a case', () => {
  const r = hysLaw({ ...LABS, otherCausesExcluded: true });
  assert.equal(r.verdict, 'case');
  assert.equal(r.bandLabel, `Meets Hy's Law`);
  assert.equal(r.criteria.find((c) => c.key === 'other-causes').met, true);
});

test('hys-law: a raised alkaline phosphatase takes the picture out of the rule', () => {
  const r = hysLaw({ ...LABS, alp: 400, otherCausesExcluded: true });
  assert.equal(r.verdict, 'not-met');
  assert.match(r.band, /the absence of cholestasis/);
  assert.match(r.criteria.find((c) => c.key === 'no-cholestasis').detail, /hepatocellular injury/);
});

test('hys-law: the alkaline phosphatase threshold is 2x, and 2x itself is out', () => {
  assert.equal(hysLaw({ ...LABS, alp: 239, alpUln: 120 }).verdict, 'potential');
  assert.equal(hysLaw({ ...LABS, alp: 240, alpUln: 120 }).verdict, 'not-met');
});

test('hys-law: the aminotransferase threshold is at or above 3x, the bilirubin is strictly above 2x', () => {
  assert.equal(hysLaw({ ...LABS, alt: 120 }).criteria[0].met, true);
  assert.equal(hysLaw({ ...LABS, alt: 119 }).criteria[0].met, false);
  assert.equal(hysLaw({ ...LABS, bilirubin: 2.4 }).criteria[1].met, false);
  assert.equal(hysLaw({ ...LABS, bilirubin: 2.5 }).criteria[1].met, true);
});

test('hys-law: the higher aminotransferase is the one the rule is written on', () => {
  const r = hysLaw({ ...LABS, alt: 80, ast: 400, astUln: 40 });
  assert.equal(r.atSource, 'AST');
  assert.equal(r.atRatio, 10);
  assert.equal(r.criteria[0].met, true);
});

test('hys-law: an AST alone is enough to run the check', () => {
  const r = hysLaw({ ast: 400, astUln: 40, bilirubin: 3.5, bilirubinUln: 1.2, alp: 150, alpUln: 120 });
  assert.equal(r.valid, true);
  assert.equal(r.atSource, 'AST');
});

test('hys-law: a zero or missing upper limit of normal does not divide', () => {
  assert.equal(hysLaw({ ...LABS, alpUln: 0 }).valid, false);
  assert.equal(hysLaw({ ...LABS, altUln: -5 }).valid, false);
});

test('hys-law: the signal, cholestasis, potential-case and timing notes print on every result', () => {
  const r = hysLaw(LABS);
  assert.match(r.signalNote, /signal about a drug, not a prognosis/);
  assert.match(r.cholestasisNote, /takes the picture out of the rule/);
  assert.match(r.potentialNote, /judgment rather than a measurement/);
  assert.match(r.timingNote, /same episode/);
  assert.match(r.scopeNote, /does not attribute the injury to any drug/);
  assert.match(HYS_LAW_NOTE, /wider population/);
});
