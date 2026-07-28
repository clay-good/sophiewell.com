// spec-v547: the AAP BRUE lower-risk criteria.
// Worked-example tests: the diagnosis-of-exclusion gate that stops before stratifying, the CONJUNCTIVE
// seven criteria with the failed ones named, the explicit at-or-above prematurity threshold, and the
// refusal of the discharge-order reading. Definition and criteria transcribed from Tieder and colleagues
// 2016 (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { brue, BRUE_LOWER_RISK_CRITERIA, BRUE_EVENT_FEATURES } from '../../lib/brue-v547.js';

function allMet(over = {}) {
  const args = { qualifiesAsBrue: 'yes' };
  for (const c of BRUE_LOWER_RISK_CRITERIA) args[c.key] = 'yes';
  return brue({ ...args, ...over });
}

test('four qualifying event features and seven lower-risk criteria', () => {
  assert.equal(BRUE_EVENT_FEATURES.length, 4);
  assert.equal(BRUE_LOWER_RISK_CRITERIA.length, 7);
});

test('BRUE IS A DIAGNOSIS OF EXCLUSION: a non-qualifying event stops before stratification', () => {
  const r = brue({ qualifiesAsBrue: 'no' });
  assert.equal(r.valid, true);
  assert.equal(r.isBrue, false);
  assert.equal(r.lowerRisk, null);     // not false: it was never stratified
  assert.match(r.band, /diagnosis of exclusion/);
  assert.match(r.band, /Nothing further is scored here/);
});

test('the seven criteria are CONJUNCTIVE: all met is lower-risk', () => {
  const r = allMet();
  assert.equal(r.isBrue, true);
  assert.equal(r.lowerRisk, true);
  assert.deepEqual(r.failed, []);
  assert.match(r.bandLabel, /lower-risk/);
});

test('failing ANY ONE criterion makes the infant higher-risk, and the result names which', () => {
  for (const c of BRUE_LOWER_RISK_CRITERIA) {
    const r = allMet({ [c.key]: 'no' });
    assert.equal(r.lowerRisk, false, c.key);
    assert.deepEqual(r.failed, [c.key], c.key);
    assert.match(r.band, /one criterion is not met/);
  }
});

test('multiple failures are all listed', () => {
  const r = allMet({ ageOver60Days: 'no', durationUnder1Min: 'no', noCpr: 'no' });
  assert.equal(r.lowerRisk, false);
  assert.equal(r.failed.length, 3);
  assert.match(r.band, /3 criteria are not met/);
  assert.match(r.band, /Age over 60 days/);
});

test('there is no score and no partial credit', () => {
  const r = allMet({ noCpr: 'no' });
  assert.equal(r.total, undefined);
  assert.equal(r.score, undefined);
  assert.match(r.note, /no score and no partial credit/);
});

test('the prematurity criterion states its inequality explicitly', () => {
  const c = BRUE_LOWER_RISK_CRITERIA.find((x) => x.key === 'gestationalAndPostconceptional');
  assert.match(c.text, /32 weeks or more AND postconceptional age 45 weeks or more/);
  assert.match(c.detail, /three say "or more", two say "over"/);
  assert.match(c.detail, /risk to birth below 32 weeks/);
});

test('lower-risk refuses the discharge-order reading', () => {
  const r = allMet();
  assert.match(r.band, /not no risk and is not a discharge order/);
  assert.match(r.band, /shared decision-making with the family/);
});

test('higher-risk refuses the diagnosis and admission-order readings', () => {
  const r = allMet({ noConcerningExam: 'no' });
  assert.match(r.band, /not a diagnosis and not an admission order/);
  assert.match(r.band, /needs individualised assessment/);
});

test('the copy names the febrile-infant distinction and child abuse', () => {
  const n = allMet().note;
  assert.match(n, /different presenting complaint from the febrile-infant rules/);
  assert.match(n, /Child abuse is among the causes/);
  assert.match(n, /cannot detect the concerning historical or examination features/);
});

test('the guards', () => {
  assert.equal(brue({}).valid, false);
  assert.match(brue({}).message, /diagnosis of exclusion/);
  const partial = brue({ qualifiesAsBrue: 'yes', ageOver60Days: 'yes' });
  assert.equal(partial.valid, false);
  assert.match(partial.message, /conjunctive/);
  assert.equal(brue({ qualifiesAsBrue: 'maybe' }).valid, false);
  assert.equal(allMet({ noCpr: 'perhaps' }).valid, false);
});
