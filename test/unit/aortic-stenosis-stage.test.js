import test from 'node:test';
import assert from 'node:assert/strict';
import { aorticStenosisStage as as } from '../../lib/aortic-stenosis-stage-v844.js';

test('as stage: the at-risk and progressive stages', () => {
  assert.equal(as({ peakVelocity: 1.6 }).stage, 'A');
  assert.equal(as({ peakVelocity: 2.4 }).severity, 'mild');
  assert.equal(as({ peakVelocity: 2.4 }).stage, 'B');
  assert.equal(as({ peakVelocity: 3.4 }).severity, 'moderate');
  assert.equal(as({ peakVelocity: 3.4 }).stage, 'B');
});

test('as stage: high-gradient severe splits on symptoms and ejection fraction', () => {
  assert.equal(as({ peakVelocity: 4.4, ejectionFraction: 60 }).stage, 'C1');
  assert.equal(as({ peakVelocity: 4.4, ejectionFraction: 40 }).stage, 'C2');
  assert.equal(as({ peakVelocity: 4.4, ejectionFraction: 60, symptoms: true }).stage, 'D1');
  // Without an ejection fraction it stops at C and says what is missing.
  const c = as({ peakVelocity: 4.4 });
  assert.equal(c.stage, 'C');
  assert.ok(c.pending.includes('separate C1 from C2'));
});

test('as stage: the velocity and the gradient are an OR, higher wins', () => {
  // Gradient 45 is severe even though the velocity reads moderate.
  const r = as({ peakVelocity: 3.5, meanGradient: 45, ejectionFraction: 60 });
  assert.equal(r.stage, 'C1');
  assert.ok(r.disagreeNote.includes('mean gradient'));
  // And the other way round.
  const s = as({ peakVelocity: 4.2, meanGradient: 30, ejectionFraction: 60 });
  assert.equal(s.stage, 'C1');
  assert.ok(s.disagreeNote.includes('velocity'));
  assert.equal(as({ peakVelocity: 4.4, meanGradient: 50, ejectionFraction: 60 }).disagreeNote, null);
});

test('as stage: a low gradient does not exclude severe stenosis (D2)', () => {
  // The error the tile exists to prevent: gradient-only reading calls this moderate.
  const r = as({ peakVelocity: 3.2, meanGradient: 28, valveArea: 0.8, ejectionFraction: 35, symptoms: true });
  assert.equal(r.stage, 'D2');
  assert.ok(r.lowGradientNote.includes('does not exclude severe'));
  assert.ok(r.dobutamineNote.includes('pseudo-severe'));
});

test('as stage: the paradoxical low-flow pattern (D3)', () => {
  const r = as({ peakVelocity: 3.4, meanGradient: 30, valveArea: 0.9, indexedValveArea: 0.5,
                 ejectionFraction: 60, strokeVolumeIndex: 30, symptoms: true });
  assert.equal(r.stage, 'D3');
  assert.ok(r.normotensiveNote.includes('normotensive'));
  // An indexed area above 0.6 does not meet D3.
  const wide = as({ peakVelocity: 3.4, meanGradient: 30, valveArea: 0.9, indexedValveArea: 0.7,
                    ejectionFraction: 60, strokeVolumeIndex: 30, symptoms: true });
  assert.equal(wide.stage, null);
  assert.ok(wide.pending.includes('0.6'));
});

test('as stage: D2 and D3 require symptoms', () => {
  const quiet = as({ peakVelocity: 3.2, valveArea: 0.8, ejectionFraction: 35 });
  assert.equal(quiet.stage, null);
  assert.ok(quiet.pending.includes('symptomatic'));
});

test('as stage: a small area at a low gradient without flow data is flagged, not staged', () => {
  const r = as({ peakVelocity: 3.2, meanGradient: 25, valveArea: 0.9 });
  assert.equal(r.stage, null);
  assert.ok(r.missedSevereNote.includes('D2 and D3'));
});

test('as stage: normal flow with a low gradient is not a severe stage', () => {
  const r = as({ peakVelocity: 3.4, valveArea: 0.95, ejectionFraction: 60, strokeVolumeIndex: 42 });
  assert.equal(r.stage, null);
  assert.equal(r.severity, 'not severe on these entries');
});

test('as stage: very severe is named within the severe range', () => {
  const r = as({ peakVelocity: 5.2, ejectionFraction: 60 });
  assert.equal(r.stage, 'C1');
  assert.equal(r.verySevere, true);
  assert.ok(r.verySevereNote.includes('very severe'));
  assert.equal(as({ peakVelocity: 4.2, ejectionFraction: 60 }).verySevereNote, null);
});

test('as stage: guards', () => {
  assert.equal(as({}).valid, false);
  assert.equal(as().valid, false);
  assert.equal(as({ peakVelocity: 12 }).valid, false);
  assert.equal(as({ peakVelocity: 4, meanGradient: 500 }).valid, false);
  assert.equal(as({ peakVelocity: 4, valveArea: 9 }).valid, false);
  assert.equal(as({ peakVelocity: 4, ejectionFraction: 120 }).valid, false);
  // The gradient alone is enough to stage.
  assert.equal(as({ meanGradient: 50, ejectionFraction: 60 }).stage, 'C1');
  assert.doesNotMatch(JSON.stringify(as({ peakVelocity: 4.4, ejectionFraction: 60 })), /NaN|Infinity/);
});
