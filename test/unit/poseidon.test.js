// spec-v549: the POSEIDON classification of low-prognosis patients in assisted reproduction.
//
// The tests that carry the weight here are the ones about the SHAPE of the scheme rather than the
// arithmetic: only groups 1 and 2 subdivide, only groups 1 and 2 need a prior cycle, and a normal responder
// is not in the scheme at all. Each of those is a place where a plausible-looking implementation would be
// wrong in a way no single spot check would catch.

import test from 'node:test';
import assert from 'node:assert/strict';
import { poseidon, POSEIDON_GROUPS, AFC_THRESHOLD, AMH_THRESHOLD, AGE_THRESHOLD } from '../../lib/poseidon-v549.js';

test('thresholds are the published ones', () => {
  assert.equal(AFC_THRESHOLD, 5);
  assert.equal(AMH_THRESHOLD, 1.2);
  assert.equal(AGE_THRESHOLD, 35);
});

test('there are exactly six groups: 1a, 1b, 2a, 2b, 3, 4', () => {
  assert.deepEqual(POSEIDON_GROUPS.map((g) => g.value), ['1a', '1b', '2a', '2b', '3', '4']);
});

test('groups 3 and 4 carry no subdivision', () => {
  const undivided = POSEIDON_GROUPS.filter((g) => g.value === '3' || g.value === '4');
  for (const g of undivided) assert.match(g.text, /not subdivided/);
});

// The four subdivided cells.
test('adequate reserve with a prior cycle assigns 1a, 1b, 2a and 2b by age and oocyte yield', () => {
  const base = { amh: '2.0', priorCycle: 'yes' };
  assert.equal(poseidon({ ...base, age: '30', oocytes: '3' }).group, '1a');
  assert.equal(poseidon({ ...base, age: '30', oocytes: '4' }).group, '1b');
  assert.equal(poseidon({ ...base, age: '30', oocytes: '9' }).group, '1b');
  assert.equal(poseidon({ ...base, age: '35', oocytes: '3' }).group, '2a');
  assert.equal(poseidon({ ...base, age: '40', oocytes: '9' }).group, '2b');
});

test('the a/b boundary sits between 3 and 4 oocytes', () => {
  const base = { age: '30', amh: '2.0', priorCycle: 'yes' };
  assert.equal(poseidon({ ...base, oocytes: '3' }).subdivision, 'a');
  assert.equal(poseidon({ ...base, oocytes: '4' }).subdivision, 'b');
});

test('age 35 exactly is the older half, not the younger', () => {
  const base = { amh: '2.0', priorCycle: 'yes', oocytes: '2' };
  assert.equal(poseidon({ ...base, age: '34' }).group, '1a');
  assert.equal(poseidon({ ...base, age: '35' }).group, '2a');
});

// Poor reserve: no prior cycle needed, no subdivision produced.
test('poor reserve assigns group 3 or 4 with no prior cycle supplied at all', () => {
  const young = poseidon({ age: '30', afc: '4' });
  assert.equal(young.valid, true);
  assert.equal(young.group, '3');
  assert.equal(young.subdivided, false);

  const older = poseidon({ age: '41', amh: '0.5' });
  assert.equal(older.group, '4');
  assert.equal(older.subdivided, false);
});

test('poor reserve never produces a 3a or 4b, whatever the oocyte count', () => {
  for (const oocytes of ['0', '3', '5', '9', '20']) {
    const r = poseidon({ age: '30', afc: '2', priorCycle: 'yes', oocytes });
    assert.equal(r.group, '3');
  }
});

// The two refusals that matter.
test('adequate reserve with no prior cycle is unclassifiable, not group 1', () => {
  const r = poseidon({ age: '30', amh: '2.0', priorCycle: 'no' });
  assert.equal(r.valid, true);
  assert.equal(r.classified, false);
  assert.equal(r.group, null);
  assert.match(r.band, /require a prior conventional-stimulation cycle/);
});

test('adequate reserve with 10 or more oocytes is outside the classification', () => {
  const r = poseidon({ age: '30', amh: '2.0', priorCycle: 'yes', oocytes: '10' });
  assert.equal(r.valid, true);
  assert.equal(r.classified, false);
  assert.equal(r.group, null);
  assert.match(r.band, /Not a POSEIDON group/);
});

test('nine oocytes is still in the scheme; ten is not', () => {
  const base = { age: '30', amh: '2.0', priorCycle: 'yes' };
  assert.equal(poseidon({ ...base, oocytes: '9' }).classified, true);
  assert.equal(poseidon({ ...base, oocytes: '10' }).classified, false);
});

// The markers are alternatives.
test('either marker alone is enough', () => {
  assert.equal(poseidon({ age: '30', afc: '6', priorCycle: 'yes', oocytes: '5' }).group, '1b');
  assert.equal(poseidon({ age: '30', amh: '1.2', priorCycle: 'yes', oocytes: '5' }).group, '1b');
});

test('both markers absent is a refusal', () => {
  const r = poseidon({ age: '30' });
  assert.equal(r.valid, false);
  assert.match(r.message, /alternatives/);
});

test('discordant markers grade reserve adequate and say so', () => {
  const r = poseidon({ age: '30', afc: '2', amh: '2.0', priorCycle: 'yes', oocytes: '5' });
  assert.equal(r.adequateReserve, true);
  assert.equal(r.markersDiscordant, true);
  assert.equal(r.group, '1b');
  assert.match(r.band, /markers disagree/);
});

test('concordant markers do not raise the discordance flag', () => {
  const r = poseidon({ age: '30', afc: '10', amh: '2.0', priorCycle: 'yes', oocytes: '5' });
  assert.equal(r.markersDiscordant, false);
  assert.doesNotMatch(r.band, /markers disagree/);
});

test('marker thresholds are inclusive at the boundary', () => {
  assert.equal(poseidon({ age: '30', afc: '5', priorCycle: 'yes', oocytes: '2' }).adequateReserve, true);
  assert.equal(poseidon({ age: '30', afc: '4' }).adequateReserve, false);
  assert.equal(poseidon({ age: '30', amh: '1.2', priorCycle: 'yes', oocytes: '2' }).adequateReserve, true);
  assert.equal(poseidon({ age: '30', amh: '1.19' }).adequateReserve, false);
});

// Input handling.
test('missing or out-of-range age is refused', () => {
  assert.equal(poseidon({}).valid, false);
  assert.equal(poseidon({ age: '9', afc: '2' }).valid, false);
  assert.equal(poseidon({ age: '70', afc: '2' }).valid, false);
  assert.equal(poseidon({ age: 'x', afc: '2' }).valid, false);
});

test('adequate reserve without a prior-cycle answer is refused', () => {
  const r = poseidon({ age: '30', amh: '2.0' });
  assert.equal(r.valid, false);
  assert.match(r.message, /prior conventional-stimulation cycle/);
});

test('a prior cycle without an oocyte count is refused', () => {
  const r = poseidon({ age: '30', amh: '2.0', priorCycle: 'yes' });
  assert.equal(r.valid, false);
  assert.match(r.message, /oocytes retrieved/);
});

test('a non-integer or absurd oocyte count is refused', () => {
  const base = { age: '30', amh: '2.0', priorCycle: 'yes' };
  assert.equal(poseidon({ ...base, oocytes: '4.5' }).valid, false);
  assert.equal(poseidon({ ...base, oocytes: '200' }).valid, false);
  assert.equal(poseidon({ ...base, oocytes: '-1' }).valid, false);
});

test('every classified result carries the scope note', () => {
  const r = poseidon({ age: '30', afc: '2' });
  assert.match(r.note, /does not diagnose infertility/);
  assert.match(r.note, /not select a stimulation protocol|does not select a stimulation protocol/);
});
