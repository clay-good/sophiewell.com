// spec-v592: the Amsterdam II criteria for Lynch syndrome.
//
// The load-bearing tests are that the rule is a conjunction (any single unmet requirement fails it), that
// the mnemonic covers only half of it, and that the withheld accuracy figures stay null.

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  amsterdamII, REQUIREMENTS, SPECTRUM, AMSTERDAM_I_SPECTRUM,
  MIN_RELATIVES, MIN_GENERATIONS, AGE_THRESHOLD,
} from '../../lib/amsterdam-ii-v592.js';

const ALL = Object.fromEntries(REQUIREMENTS.map((r) => [r.key, 'yes']));
const at = (over = {}) => amsterdamII({ ...ALL, allThreeColorectal: 'yes', ...over });

test('there are six requirements and the mnemonic numbers are the published ones', () => {
  assert.equal(REQUIREMENTS.length, 6);
  assert.equal(MIN_RELATIVES, 3);
  assert.equal(MIN_GENERATIONS, 2);
  assert.equal(AGE_THRESHOLD, 50);
});

// THE conjunction.
test('any single unmet requirement fails the criteria', () => {
  assert.equal(at().meetsAmsterdamII, true);
  for (const r of REQUIREMENTS) {
    const res = at({ [r.key]: 'no' });
    assert.equal(res.meetsAmsterdamII, false, r.key);
    assert.deepEqual(res.unmetRequirements, [r.key]);
    assert.equal(res.metRequirements.length, REQUIREMENTS.length - 1, 'five of six still fails');
  }
});

test('the result never presents five of six as a near miss', () => {
  const r = at({ pathologyVerified: 'no' });
  assert.match(r.bandText, /CONJUNCTION, not a count/);
  assert.match(r.bandText, /no partial credit/);
});

// THE omitted half.
test('the mnemonic covers only three of the six requirements', () => {
  const inMnemonic = REQUIREMENTS.filter((r) => r.inMnemonic).map((r) => r.key);
  const omitted = REQUIREMENTS.filter((r) => !r.inMnemonic).map((r) => r.key);
  assert.equal(inMnemonic.length, 3);
  assert.deepEqual(omitted.sort(), ['fapExcluded', 'firstDegree', 'pathologyVerified']);
});

test('the first-degree requirement is called out when it is the one that fails', () => {
  const r = at({ firstDegree: 'no' });
  assert.equal(r.meetsAmsterdamII, false);
  assert.match(r.bandText, /the one the mnemonic omits/);
  assert.match(r.bandText, /three affected relatives is not enough/);
});

test('every result explains what the mnemonic leaves out', () => {
  assert.match(at().bandText, /FIRST-DEGREE relationship/);
  assert.match(at().bandText, /VERIFIED BY PATHOLOGICAL EXAMINATION/);
  assert.match(at().bandText, /three affected cousins/);
});

// THE closed spectrum.
test('the spectrum is the published five and is stated as closed', () => {
  assert.deepEqual(SPECTRUM, ['colorectal', 'endometrium', 'small intestine', 'ureter', 'renal pelvis']);
  assert.match(at().bandText, /spectrum is CLOSED/);
  assert.match(at().bandText, /contributes NOTHING to the count/);
});

// THE predecessor comparison.
test('Amsterdam I counted colorectal cancer only', () => {
  assert.deepEqual(AMSTERDAM_I_SPECTRUM, ['colorectal']);
  assert.ok(SPECTRUM.length > AMSTERDAM_I_SPECTRUM.length);
});

test('the same family can meet Amsterdam II and fail Amsterdam I', () => {
  const mixed = at({ allThreeColorectal: 'no' });
  assert.equal(mixed.meetsAmsterdamII, true);
  assert.equal(mixed.meetsAmsterdamI, false);
  assert.match(mixed.bandText, /exactly what the 1999 expansion was written to capture/);

  const colorectalOnly = at({ allThreeColorectal: 'yes' });
  assert.equal(colorectalOnly.meetsAmsterdamI, true);
});

test('failing Amsterdam II also fails Amsterdam I', () => {
  const r = at({ underFifty: 'no', allThreeColorectal: 'yes' });
  assert.equal(r.meetsAmsterdamII, false);
  assert.equal(r.meetsAmsterdamI, false);
});

// THE negative result.
test('a negative result says it is not evidence against Lynch syndrome', () => {
  const r = at({ twoGenerations: 'no' });
  assert.match(r.bandText, /NOT evidence against Lynch syndrome/);
  assert.match(r.bandText, /not a reason to withhold mismatch-repair/);
  assert.equal(/NOT evidence against Lynch syndrome/.test(at().bandText), false,
    'the caveat appears only on a negative result');
});

// THE withheld figures.
test('the accuracy percentages are always null', () => {
  for (const over of [{}, { firstDegree: 'no' }, { allThreeColorectal: 'no' }]) {
    const r = at(over);
    assert.equal(r.sensitivityPercent, null);
    assert.equal(r.specificityPercent, null);
  }
  assert.match(at().bandText, /appeared in only one of the two sources checked/);
});

// Input handling and scope.
test('every requirement is required and the message states the rule', () => {
  assert.equal(amsterdamII({}).valid, false);
  const r = amsterdamII({ ...ALL, allThreeColorectal: 'yes', fapExcluded: '' });
  assert.equal(r.valid, false);
  assert.match(r.message, /fapExcluded/);
  assert.match(r.message, /CONJUNCTION, not a count/);
});

test('the scope note refuses diagnosis, gene identification and surveillance', () => {
  const r = at();
  assert.match(r.note, /do not diagnose Lynch syndrome/);
  assert.match(r.note, /do not identify which gene/);
  assert.match(r.note, /do not assess an individual’s cancer risk or set surveillance intervals/);
  assert.match(r.note, /belongs with genetic counseling/);
});
