// spec-v311: acute cholecystitis severity grade (Tokyo Guidelines TG18/TG13).
// Worked-example tests: the mild (no criteria) case, the ANY-ONE-moderate Grade II
// boundary (the key difference from the acute cholangitis grade, which needs two),
// each organ dysfunction as Grade III, organ-dysfunction precedence over moderate
// criteria, the severe flag, and the worked example (duration > 72 h -> Grade II).
// Criteria transcribed from Yokoe 2018 Table 4 (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cholecystitisSeverity } from '../../lib/cholecystitis-v311.js';

test('no criteria is Grade I (mild)', () => {
  const r = cholecystitisSeverity({});
  assert.equal(r.grade, 1);
  assert.equal(r.gradeRoman, 'I');
  assert.equal(r.abnormal, false);
  assert.equal(r.severe, false);
  assert.match(r.band, /Grade I \(mild\)/);
});

test('any one moderate criterion makes it Grade II (moderate)', () => {
  // The key difference from acute cholangitis: ONE moderate criterion suffices.
  for (const k of ['elevatedWbc', 'tenderMass', 'durationOver72h', 'markedInflammation']) {
    const r = cholecystitisSeverity({ [k]: true });
    assert.equal(r.gradeRoman, 'II', `${k} should be Grade II`);
    assert.equal(r.abnormal, true);
    assert.equal(r.severe, false);
    assert.equal(r.moderateCount, 1);
  }
});

test('each single organ dysfunction is Grade III (severe)', () => {
  for (const k of ['cardiovascular', 'neurological', 'respiratory', 'renal', 'hepatic', 'hematological']) {
    const r = cholecystitisSeverity({ [k]: true });
    assert.equal(r.gradeRoman, 'III', `${k} should be Grade III`);
    assert.equal(r.severe, true);
    assert.equal(r.abnormal, true);
  }
});

test('one organ dysfunction outranks a moderate criterion', () => {
  const r = cholecystitisSeverity({ renal: true, durationOver72h: true });
  assert.equal(r.grade, 3);
  assert.equal(r.organCount, 1);
});

test('the moderate criteria are pluralized correctly', () => {
  const r = cholecystitisSeverity({ elevatedWbc: true, tenderMass: true });
  assert.equal(r.grade, 2);
  assert.equal(r.moderateCount, 2);
  assert.match(r.band, /2 moderate criteria/);
});

test('non-true values do not fire a criterion', () => {
  const r = cholecystitisSeverity({ durationOver72h: 'true', renal: 1, tenderMass: 'yes' });
  assert.equal(r.grade, 1);
  assert.equal(r.moderateCount, 0);
  assert.equal(r.organCount, 0);
});

test('the worked example (duration > 72 h) is Grade II with the 72 h fact', () => {
  const r = cholecystitisSeverity({ durationOver72h: true });
  assert.equal(r.gradeRoman, 'II');
  assert.equal(r.severe, false);
  assert.match(r.band, /72 h/);
});
