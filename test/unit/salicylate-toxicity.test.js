// spec-v86 §2.2: EXTRIP salicylate hemodialysis-indication boundary examples
// per Juurlink DN, et al; EXTRIP Workgroup. Ann Emerg Med. 2015;66(2):165-181.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { salicylateToxicity } from '../../lib/tox-v86.js';

test('acute level over 100 mg/dL -> hemodialysis recommended, criterion named', () => {
  const r = salicylateToxicity({ level: 110, unit: 'mgdl', poisoningType: 'acute' });
  assert.match(r.recommendation, /recommended/i);
  assert.match(r.criteriaText, /over 100 mg\/dL/);
  assert.equal(r.levelMgDl, 110);
});

test('arterial pH 7.20 or below -> recommended regardless of level', () => {
  const r = salicylateToxicity({ pH: 7.18 });
  assert.match(r.recommendation, /recommended/i);
  assert.match(r.criteriaText, /pH/);
});

test('altered mental status alone -> recommended (number not required)', () => {
  const r = salicylateToxicity({ alteredMentalStatus: true });
  assert.match(r.recommendation, /recommended/i);
  assert.match(r.criteriaText, /altered mental status/);
});

test('impaired kidney + level over 90 -> recommended', () => {
  const r = salicylateToxicity({ level: 95, unit: 'mgdl', impairedKidney: true, poisoningType: 'acute' });
  assert.match(r.recommendation, /recommended/i);
  assert.match(r.criteriaText, /90 mg\/dL with impaired kidney/);
});

test('standard therapy failing only -> suggested, not recommended', () => {
  const r = salicylateToxicity({ standardTherapyFailing: true });
  assert.match(r.recommendation, /suggested/i);
});

test('low level, no clinical criteria -> no listed criterion met', () => {
  const r = salicylateToxicity({ level: 25, unit: 'mgdl', poisoningType: 'acute' });
  assert.match(r.recommendation, /No listed EXTRIP/i);
  assert.equal(r.criteriaText, null);
});

test('unit conversion: mmol/L is converted to mg/dL', () => {
  const r = salicylateToxicity({ level: 8, unit: 'mmoll', poisoningType: 'acute' });
  // 8 mmol/L * 13.81 = ~110.5 mg/dL -> over 100, recommended
  assert.ok(r.levelMgDl > 100 && r.levelMgDl < 115);
  assert.match(r.recommendation, /recommended/i);
});

test('the Done nomogram is named only to say it is NOT used', () => {
  const r = salicylateToxicity({ level: 110, unit: 'mgdl', poisoningType: 'acute' });
  assert.doesNotMatch(r.recommendation, /Done nomogram/i);
  assert.match(r.note, /Done nomogram is not used/i);
});

test('spec-v1136: the recommendation names the level and the unit it was read in', () => {
  // `unit === 'mmoll' ? x * 13.81 : x` read every other value -- an unstated unit
  // included -- as mg/dL. A level of 45 was either "no listed EXTRIP criterion
  // met" or "hemodialysis recommended", and the recommendation named neither the
  // unit nor the level. The quiet direction is the dangerous one: a mmol/L level
  // read as mg/dL under-states by 13.81.
  const assumed = salicylateToxicity({ level: 45 });
  assert.match(assumed.recommendation, /Read against a salicylate of 45 mg\/dL/);
  assert.match(assumed.recommendation, /no unit given; mg\/dL assumed/);
  assert.match(assumed.recommendation, /13\.81 times this/);

  const stated = salicylateToxicity({ level: 45, unit: 'mgdl' });
  assert.match(stated.recommendation, /Read against a salicylate of 45 mg\/dL\./);
  assert.doesNotMatch(stated.recommendation, /no unit given/);

  // The conversion itself is unchanged, and the converted value is shown.
  const mmol = salicylateToxicity({ level: 45, unit: 'mmoll' });
  assert.equal(mmol.levelMgDl, 621.5);
  assert.match(mmol.recommendation, /Hemodialysis recommended \(EXTRIP\)/);
  assert.match(mmol.recommendation, /621\.5 mg\/dL \(45 mmol\/L entered\)/);
});

test('spec-v1136: with no level there is nothing to disclose', () => {
  const r = salicylateToxicity({ alteredMentalStatus: true });
  assert.match(r.recommendation, /Hemodialysis recommended/);
  assert.doesNotMatch(r.recommendation, /Read against a salicylate/);
});
