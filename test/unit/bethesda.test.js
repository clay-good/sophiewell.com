// spec-v593: the revised Bethesda guidelines.
//
// The load-bearing tests are that any single criterion suffices (the inverse of its Amsterdam II companion),
// that the tumor spectrum is strictly broader, and that the three age rules stay distinct.

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  bethesda, CRITERIA, SPECTRUM, AMSTERDAM_II_SPECTRUM, MSI_HISTOLOGY_FEATURES,
  AGE_EARLY_ONSET, AGE_MSI_HISTOLOGY,
} from '../../lib/bethesda-v593.js';
import { REQUIREMENTS as AMSTERDAM_REQUIREMENTS } from '../../lib/amsterdam-ii-v592.js';

const NONE = Object.fromEntries(CRITERIA.map((c) => [c.key, 'no']));
const at = (over = {}) => bethesda({ ...NONE, ...over });

test('there are five criteria', () => {
  assert.equal(CRITERIA.length, 5);
});

// THE inverted logic.
test('any single criterion alone indicates testing', () => {
  assert.equal(at().testingIndicated, false);
  for (const c of CRITERIA) {
    const r = at({ [c.key]: 'yes' });
    assert.equal(r.testingIndicated, true, c.key);
    assert.deepEqual(r.metCriteria, [c.key]);
  }
});

test('the logic is the inverse of its Amsterdam II companion', () => {
  // Amsterdam II needs all of its requirements; Bethesda needs one of its criteria.
  assert.ok(AMSTERDAM_REQUIREMENTS.length > 0);
  const oneOfEach = at({ [CRITERIA[0].key]: 'yes' });
  assert.equal(oneOfEach.testingIndicated, true, 'one criterion is enough here');
  assert.match(oneOfEach.bandText, /OPPOSITE of the Amsterdam II criteria/);
  assert.match(oneOfEach.bandText, /require ALL SIX/);
});

// THE broader spectrum.
test('the Bethesda spectrum is strictly broader than Amsterdam II\'s', () => {
  assert.ok(SPECTRUM.length > AMSTERDAM_II_SPECTRUM.length);
  for (const cancer of ['stomach', 'ovarian', 'pancreas', 'biliary tract', 'brain']) {
    assert.ok(SPECTRUM.includes(cancer), `${cancer} is in the Bethesda spectrum`);
    assert.equal(AMSTERDAM_II_SPECTRUM.includes(cancer), false, `${cancer} is NOT in Amsterdam II's`);
  }
});

test('the gastric-and-ovarian family is named as the disagreement case', () => {
  assert.match(at().bandText, /gastric and ovarian FAILS Amsterdam II on spectrum alone/);
});

// THE three age rules.
test('three criteria carry distinct age rules and two carry none', () => {
  const rules = CRITERIA.map((c) => c.ageRule);
  assert.equal(rules.filter((r) => r === 'none').length, 2);
  assert.ok(rules.includes(`under ${AGE_EARLY_ONSET}`));
  assert.ok(rules.includes(`under ${AGE_MSI_HISTOLOGY}`));
  assert.notEqual(AGE_EARLY_ONSET, AGE_MSI_HISTOLOGY);
  assert.match(at().bandText, /Carrying one threshold across the set/);
});

test('the two age-free criteria are the ones the source leaves age-free', () => {
  const ageFree = CRITERIA.filter((c) => c.ageRule === 'none').map((c) => c.key);
  assert.deepEqual(ageFree, ['synchronousOrMetachronous', 'twoRelativesAnyAge']);
  for (const key of ageFree) assert.match(CRITERIA.find((c) => c.key === key).text, /REGARDLESS OF AGE/);
});

// The contested threshold and the histology step.
test('the vote behind the sixty-year threshold is disclosed when that criterion fires', () => {
  const r = at({ msiHistologyUnderSixty: 'yes' });
  assert.match(r.bandText, /settled by a VOTE, not by data/);
  assert.match(r.bandText, /no consensus/);
  assert.equal(/settled by a VOTE/.test(at().bandText), false, 'only when the criterion is met');
});

test('the histology criterion is described as a judgment rather than a laboratory result', () => {
  const r = at({ msiHistologyUnderSixty: 'yes' });
  assert.match(r.bandText, /screening step for the screening test/);
  for (const f of MSI_HISTOLOGY_FEATURES) assert.ok(r.bandText.includes(f), f);
});

// The differing degrees.
test('the two family-history criteria use different degrees of relative', () => {
  const four = CRITERIA.find((c) => c.key === 'oneFirstDegreeUnderFifty');
  const five = CRITERIA.find((c) => c.key === 'twoRelativesAnyAge');
  assert.match(four.text, /FIRST-DEGREE/);
  assert.match(five.text, /FIRST- OR SECOND-DEGREE/);
  assert.match(at().bandText, /easily conflated/);
});

// The negative result.
test('a negative result says it does not exclude Lynch syndrome', () => {
  assert.match(at().bandText, /does NOT exclude Lynch syndrome/);
  assert.match(at().bandText, /universal tumor testing/);
  assert.equal(/does NOT exclude Lynch syndrome/.test(at({ underFifty: 'yes' }).bandText), false,
    'the caveat appears only on a negative result');
});

// Input handling and scope.
test('every criterion is required and the message states the OR rule', () => {
  assert.equal(bethesda({}).valid, false);
  const r = bethesda({ ...NONE, underFifty: '' });
  assert.equal(r.valid, false);
  assert.match(r.message, /underFifty/);
  assert.match(r.message, /ANY ONE criterion is enough/);
});

test('the scope note separates testing from diagnosis', () => {
  const r = at();
  assert.match(r.note, /decide WHO GETS A TEST, not who has Lynch syndrome/);
  assert.match(r.note, /not a diagnosis and not a prediction/);
  assert.match(r.note, /belongs with genetic counseling/);
});
