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

// spec-v1090: the low-gradient severe stages are reached through the AREA.
//
// `smallArea` is `ava !== null && ava <= 1.0`, so with no area entered it is
// false, the D2 and D3 branches are skipped, and a gradient in the moderate
// range fell straight through to stage B. On the tile's own worked example that
// turned "D2 -- symptomatic severe stenosis at a low flow and low gradient with
// a reduced ejection fraction" into "B -- moderate progressive stenosis": an
// intervention conversation becoming a watch-and-rescan one, on a measurement
// nobody supplied.
//
// The three readings have to stay distinct: absent is not the same as measured
// and small, and neither is the same as measured and not small.
test('spec-v1090: a missing valve area does not read as moderate stenosis', () => {
  const lowGradientSymptomatic = {
    peakVelocity: 3.2, meanGradient: 28, ejectionFraction: 35, symptoms: true,
  };

  // Measured and small: the severe low-flow pattern the branch exists for.
  const severe = as({ ...lowGradientSymptomatic, valveArea: 0.8 });
  assert.equal(severe.stage, 'D2');

  // Measured and not small: genuinely moderate, and still says so.
  const moderate = as({ ...lowGradientSymptomatic, valveArea: 1.4 });
  assert.equal(moderate.stage, 'B');
  assert.equal(moderate.severity, 'moderate');

  // Not measured: no stage, and the reason names the missing measurement.
  const absent = as(lowGradientSymptomatic);
  assert.equal(absent.stage, null, 'a stage from a measurement nobody took is the defect');
  assert.notEqual(absent.severity, 'moderate');
  assert.match(absent.pending, /Enter the aortic valve area/);
  assert.match(absent.pending, /D2 and D3/);

  // And the scoping, which a pre-existing test caught when the first version of
  // this guard was too broad: a velocity in the moderate range with nothing else
  // measured really IS stage B by the guideline's velocity criterion. Both D2
  // and D3 require symptoms, so only a symptomatic patient at a low gradient is
  // one whose area decides between moderate and severe.
  assert.equal(as({ peakVelocity: 3.4 }).stage, 'B');
  assert.equal(as({ peakVelocity: 3.2, meanGradient: 28, ejectionFraction: 35 }).stage, 'B');
});

// spec-v1098: spec-v1090 refused only at a MODERATE gradient, where the valve
// area decides moderate against severe. The same gap sits under the milder
// readings: a symptomatic patient whose velocity reads at-risk or mild, with no
// area entered, is still one whose severe stages are defined by an area nobody
// measured -- and severe stenosis at a low velocity is exactly the low-flow
// pattern D2 and D3 exist to name.
//
// A footing here rather than a refusal, because a low velocity with nothing else
// measured really is stage A or B by the velocity criterion.
test('spec-v1098: a symptomatic patient with no valve area is told the stage can rise', () => {
  const lowFlow = { peakVelocity: 1.6, symptoms: true, ejectionFraction: 17 };

  const noArea = as(lowFlow);
  assert.equal(noArea.stage, 'A', 'the velocity criterion still gives stage A');
  assert.match(noArea.band, /aortic valve area was not entered/);
  assert.match(noArea.band, /can only rise once the area is measured/);

  // The same patient with an area is the severe low-flow pattern.
  assert.equal(as({ ...lowFlow, valveArea: 0.8 }).stage, 'D2');

  // No symptoms, no footing: D2 and D3 both require them, so the area cannot
  // change this reading.
  const quiet = as({ peakVelocity: 1.6 });
  assert.equal(quiet.stage, 'A');
  assert.doesNotMatch(quiet.band, /was not entered/);

  // spec-v1090's behaviour is unchanged.
  assert.equal(as({ peakVelocity: 3.4 }).stage, 'B');
  assert.doesNotMatch(as({ peakVelocity: 3.4 }).band, /was not entered/);
});
