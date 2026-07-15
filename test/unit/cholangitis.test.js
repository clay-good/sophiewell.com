// spec-v310: acute cholangitis severity grade (Tokyo Guidelines TG18/TG13).
// Worked-example tests: the mild (no criteria) case, the exactly-one-moderate case
// that stays Grade I, the two-moderate Grade II boundary, each organ dysfunction
// as Grade III, organ-dysfunction precedence over moderate criteria, the severe
// flag, and the worked example (hepatic -> Grade III). Criteria transcribed from
// Kiriyama 2018 Table 3 (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cholangitisSeverity } from '../../lib/cholangitis-v310.js';

test('no criteria is Grade I (mild)', () => {
  const r = cholangitisSeverity({});
  assert.equal(r.grade, 1);
  assert.equal(r.gradeRoman, 'I');
  assert.equal(r.abnormal, false);
  assert.equal(r.severe, false);
  assert.match(r.band, /Grade I \(mild\)/);
});

test('exactly one moderate criterion stays Grade I', () => {
  const r = cholangitisSeverity({ age: true });
  assert.equal(r.grade, 1);
  assert.equal(r.moderateCount, 1);
  assert.match(r.band, /2 needed for Grade II/);
});

test('any two moderate criteria make it Grade II (moderate)', () => {
  const r = cholangitisSeverity({ age: true, highFever: true });
  assert.equal(r.gradeRoman, 'II');
  assert.equal(r.grade, 2);
  assert.equal(r.abnormal, true);
  assert.equal(r.severe, false);
  assert.equal(r.moderateCount, 2);
});

test('each single organ dysfunction is Grade III (severe)', () => {
  for (const k of ['cardiovascular', 'neurological', 'respiratory', 'renal', 'hepatic', 'hematological']) {
    const r = cholangitisSeverity({ [k]: true });
    assert.equal(r.gradeRoman, 'III', `${k} should be Grade III`);
    assert.equal(r.severe, true);
    assert.equal(r.abnormal, true);
  }
});

test('one organ dysfunction outranks two moderate criteria', () => {
  const r = cholangitisSeverity({ renal: true, age: true, highFever: true });
  assert.equal(r.grade, 3);
  assert.equal(r.organCount, 1);
});

test('the fired-criteria lists reflect what was checked', () => {
  const r = cholangitisSeverity({ hepatic: true, hematological: true, abnormalWbc: true });
  assert.equal(r.organCount, 2);
  assert.equal(r.moderateCount, 1);
  assert.match(r.band, /2 organ dysfunctions/);
});

test('non-true values do not fire a criterion', () => {
  // Only strict boolean true counts (matches the checkbox contract).
  const r = cholangitisSeverity({ age: 'true', highFever: 1, renal: 'yes' });
  assert.equal(r.grade, 1);
  assert.equal(r.moderateCount, 0);
  assert.equal(r.organCount, 0);
});

test('the worked example (hepatic PT-INR > 1.5) is Grade III severe', () => {
  const r = cholangitisSeverity({ hepatic: true });
  assert.equal(r.gradeRoman, 'III');
  assert.equal(r.severe, true);
  assert.match(r.band, /hepatic/);
});
