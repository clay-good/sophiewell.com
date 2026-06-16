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
