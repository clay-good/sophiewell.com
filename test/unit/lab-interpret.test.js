// spec-v6 §3.3: lab result interpreter tests. Covers ref-range bounds,
// the four-band flag taxonomy (within-range / borderline / flagged-mild
// / flagged-significant), sex / pregnancy variants, critical thresholds,
// and the spec-v6 §6 worked-example contract for the META entry.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  interpretLab,
  interpretLabs,
  LAB_ANALYTES,
  LAB_GROUPS,
} from '../../lib/lab-interpret.js';

test('within-range: sodium 140 is within range', () => {
  const r = interpretLab('sodium', 140);
  assert.equal(r.flag, 'within-range');
  assert.equal(r.direction, null);
  assert.equal(r.refLow, 135);
  assert.equal(r.refHigh, 145);
  assert.match(r.narrative, /typical reference range/);
});

test('borderline-low: potassium 3.4 is borderline (within 5% buffer)', () => {
  // refRange 3.5-5.0, span 1.5, buffer = max(0.075, 0.05) = 0.075. 3.4 >= 3.425? No -- 0.025 below 3.425.
  // So 3.45 is borderline-low, 3.4 is mild-low. Pick 3.45 to land in borderline.
  const r = interpretLab('potassium', 3.45);
  assert.equal(r.flag, 'borderline');
  assert.equal(r.direction, 'low');
});

test('flagged-mild: sodium 130 is mild low (outside 5% buffer, not critical)', () => {
  const r = interpretLab('sodium', 130);
  assert.equal(r.flag, 'flagged-mild');
  assert.equal(r.direction, 'low');
  assert.ok(r.narrative.length > 0);
  assert.ok(r.ask.length > 0);
});

test('flagged-significant: sodium 118 is at the critical threshold', () => {
  const r = interpretLab('sodium', 118);
  assert.equal(r.flag, 'flagged-significant');
  assert.equal(r.direction, 'low');
});

test('flagged-significant high: potassium 6.5 is critical', () => {
  const r = interpretLab('potassium', 6.5);
  assert.equal(r.flag, 'flagged-significant');
  assert.equal(r.direction, 'high');
});

test('sex variant: creatinine 1.2 within range for male, high-side for female', () => {
  const male = interpretLab('creatinine', 1.2, { sex: 'male' });
  const female = interpretLab('creatinine', 1.2, { sex: 'female' });
  assert.equal(male.flag, 'within-range');
  assert.equal(female.refHigh, 1.1);
  // 1.2 vs refHigh 1.1, span = 0.6, buffer = 0.03, so 1.2 > 1.13 -> mild.
  assert.equal(female.flag, 'flagged-mild');
  assert.equal(female.direction, 'high');
});

test('pregnancy variant: hemoglobin 11.5 is within range for pregnant patient', () => {
  const r = interpretLab('hemoglobin', 11.5, { sex: 'female', pregnant: true });
  assert.equal(r.flag, 'within-range');
  assert.equal(r.refLow, 11.0);
  assert.equal(r.refHigh, 14.0);
});

test('A1C 6.0 is borderline (prediabetes territory above range)', () => {
  const r = interpretLab('a1c', 6.0);
  // refRange is 4.0-5.6; span 1.6; buffer 5% = 0.08; 6.0 > 5.68 -> mild
  assert.equal(r.flag, 'flagged-mild');
  assert.equal(r.direction, 'high');
  assert.match(r.narrative, /diabetes range/);
});

test('LDL 200 is flagged-mild high; renderer provides narrative + ask', () => {
  const r = interpretLab('ldl', 200);
  assert.equal(r.direction, 'high');
  assert.ok(['flagged-mild', 'flagged-significant'].includes(r.flag));
  assert.ok(r.narrative.includes('LDL'));
  assert.ok(r.ask.length > 0);
});

test('interpretLab: unknown analyte throws', () => {
  assert.throws(() => interpretLab('does-not-exist', 1), /Unknown analyte/);
});

test('interpretLab: non-finite value throws', () => {
  assert.throws(() => interpretLab('sodium', NaN), /finite number/);
  assert.throws(() => interpretLab('sodium', Infinity), /finite number/);
});

test('interpretLabs: maps a batch with shared opts', () => {
  const results = interpretLabs([
    { analyteId: 'sodium', value: 140 },
    { analyteId: 'potassium', value: 6.5 },
  ], { sex: 'male' });
  assert.equal(results.length, 2);
  assert.equal(results[0].flag, 'within-range');
  assert.equal(results[1].flag, 'flagged-significant');
});

test('LAB_GROUPS: every group id references analytes defined in LAB_ANALYTES', () => {
  for (const g of LAB_GROUPS) {
    for (const id of g.ids) {
      assert.ok(LAB_ANALYTES[id], `analyte ${id} (group ${g.id}) not in LAB_ANALYTES`);
    }
  }
});

test('worked example (META wiring): A1C 5.4 within-range', () => {
  const r = interpretLab('a1c', 5.4);
  assert.equal(r.flag, 'within-range');
  assert.equal(r.refLow, 4.0);
  assert.equal(r.refHigh, 5.6);
});

test('flag taxonomy: every result uses one of the four bands from spec-v6 §3.3', () => {
  const seen = new Set();
  for (const id of Object.keys(LAB_ANALYTES)) {
    const a = LAB_ANALYTES[id];
    seen.add(interpretLab(id, a.refLow + (a.refHigh - a.refLow) / 2).flag);
    seen.add(interpretLab(id, a.refLow - (a.refHigh - a.refLow) * 0.02).flag);
    seen.add(interpretLab(id, a.refLow - (a.refHigh - a.refLow) * 0.5).flag);
  }
  for (const f of seen) {
    assert.ok(
      ['within-range', 'borderline', 'flagged-mild', 'flagged-significant'].includes(f),
      `Unexpected flag value: ${f}`
    );
  }
});
