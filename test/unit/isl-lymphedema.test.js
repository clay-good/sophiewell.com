// spec-v539: the ISL staging of peripheral lymphedema.
// Worked-example tests: the five stages, the NON-MONOTONIC pitting that makes stage III read backwards if
// treated as a severity dial, stage and severity as SEPARATE axes, the bilateral caveat on an inter-limb
// measurement, and the guards. Stages and grades transcribed from the ISL 2020 consensus (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { islLymphedema, ISL_STAGES, ISL_SEVERITY } from '../../lib/isl-lymphedema-v539.js';

function stage(v, over = {}) {
  return islLymphedema({ stage: v, severity: 'minimal', bilateral: 'no', ...over });
}

test('five stages including late stage II', () => {
  assert.deepEqual(ISL_STAGES.map((s) => s.value), ['0', 'I', 'II', 'late II', 'III']);
});

test('elevation separates stage I from stage II', () => {
  assert.match(stage('I').band, /SUBSIDES with limb elevation/);
  assert.match(stage('II').band, /RARELY reduces the tissue swelling/);
});

test('PITTING IS NON-MONOTONIC: it rises to stage II then falls away again', () => {
  assert.match(stage('I').band, /Pitting MAY occur/);
  assert.match(stage('II').band, /Pitting IS manifest/);
  assert.match(stage('late II').band, /MAY NOT pit/);
  assert.match(stage('III').band, /Pitting CAN BE ABSENT/);
  // The advanced stages must say the absence of pitting is fibrosis, not improvement.
  for (const v of ['late II', 'III']) {
    assert.equal(stage(v).pittingFallsAway, true, v);
    assert.match(stage(v).band, /fibrosis/i);
    assert.match(stage(v).band, /not improvement/);
  }
  assert.equal(stage('I').pittingFallsAway, false);
  assert.equal(stage('II').pittingFallsAway, false);
});

test('stage and severity are separate axes: a stage III limb can be minimal by volume', () => {
  const r = stage('III', { severity: 'minimal' });
  assert.equal(r.stage, 'III');
  assert.equal(r.severity, 'minimal');
  assert.match(r.band, /separate axes and neither implies the other/);
  // ...and a stage II limb can be severe by volume.
  const r2 = stage('II', { severity: 'severe' });
  assert.equal(r2.stage, 'II');
  assert.equal(r2.severity, 'severe');
});

test('the four severity grades sit at the published cut points, and name the alternative convention', () => {
  assert.deepEqual(ISL_SEVERITY.map((s) => s.value), ['none', 'minimal', 'moderate', 'severe']);
  assert.match(ISL_SEVERITY[1].text, /above 5 percent and below 20 percent/);
  assert.match(ISL_SEVERITY[2].text, /20 to 40 percent/);
  assert.match(ISL_SEVERITY[3].text, /above 40 percent/);
  assert.match(stage('II').band, /some clinics instead use above 5 to 10 percent as minimal/);
});

test('an ungraded limb can still be measurably abnormal', () => {
  const r = stage('0', { severity: 'none' });
  assert.match(r.band, /3 to 5 percent/);
  assert.match(r.band, /measurably abnormal and still ungraded/);
});

test('bilateral swelling attaches a caveat to the severity grade (the META example)', () => {
  const uni = stage('II', { severity: 'moderate', bilateral: 'no' });
  assert.equal(uni.bilateral, false);
  assert.doesNotMatch(uni.band, /understates the disease/);

  const bi = stage('II', { severity: 'moderate', bilateral: 'yes' });
  assert.equal(bi.bilateral, true);
  assert.match(bi.band, /inter-limb comparison/);
  assert.match(bi.band, /understates the disease/);
});

test('every stage states that a limb may exhibit more than one stage', () => {
  for (const s of ISL_STAGES) {
    assert.match(stage(s.value).band, /may exhibit more than one stage/);
    assert.match(stage(s.value).band, /extremities only/);
  }
});

test('the copy refuses the diagnosis reading and names the urgent mimics', () => {
  const n = stage('II').note;
  assert.match(n, /does not diagnose lymphedema/);
  assert.match(n, /deep vein thrombosis, lipedema, and infection/);
  assert.match(n, /cellulitis or thrombosis rather than staging/);
  assert.match(n, /not an indication for compression/);
});

test('stage aliases and the guards', () => {
  assert.equal(islLymphedema({ stage: 'iii', severity: 'severe', bilateral: 'no' }).stage, 'III');
  assert.equal(islLymphedema({ stage: 'LATE II', severity: 'minimal', bilateral: 'no' }).stage, 'late II');
  assert.equal(islLymphedema({}).valid, false);
  assert.equal(islLymphedema({ stage: 'IV', severity: 'minimal', bilateral: 'no' }).valid, false);
  assert.equal(islLymphedema({ stage: 'II', severity: 'mild', bilateral: 'no' }).valid, false);
  const noBi = islLymphedema({ stage: 'II', severity: 'minimal' });
  assert.equal(noBi.valid, false);
  assert.match(noBi.message, /inter-limb comparison/);
});
