import test from 'node:test';
import assert from 'node:assert/strict';
import { aorticRegurgitationStage as ar } from '../../lib/aortic-regurgitation-stage-v846.js';

test('ar stage: the stages', () => {
  assert.equal(ar({ atRiskValve: true }).stage, 'A');
  assert.equal(ar({ venaContracta: 0.2 }).stage, 'B');
  assert.equal(ar({ venaContracta: 0.45 }).severity, 'moderate');
  assert.equal(ar({ venaContracta: 0.8, ejectionFraction: 60, endSystolicDiameter: 42, holodiastolicReversal: true }).stage, 'C1');
  assert.equal(ar({ venaContracta: 0.8, symptoms: true, holodiastolicReversal: true }).stage, 'D');
});

test('ar stage: C2 is reached by the ventricle, not the valve', () => {
  // Same regurgitation, two stages, decided entirely by the ventricle.
  const base = { venaContracta: 0.8, holodiastolicReversal: true };
  const c1 = ar({ ...base, ejectionFraction: 60, endSystolicDiameter: 44 });
  const c2 = ar({ ...base, ejectionFraction: 48, endSystolicDiameter: 44 });
  assert.equal(c1.stage, 'C1');
  assert.equal(c2.stage, 'C2');
  assert.ok(c2.ventricleNote.includes('reached by the ventricle, not the valve'));
  assert.ok(c2.ventricleNote.includes('48 percent'));
  // The diameter route reaches C2 on its own.
  assert.equal(ar({ ...base, ejectionFraction: 60, endSystolicDiameter: 54 }).stage, 'C2');
  assert.equal(c1.ventricleNote, null);
});

test('ar stage: the indexed diameter reaches C2 on its own', () => {
  const r = ar({ venaContracta: 0.8, holodiastolicReversal: true,
                 ejectionFraction: 60, endSystolicDiameter: 47, indexedEndSystolicDiameter: 28 });
  assert.equal(r.stage, 'C2');
  assert.ok(r.indexedOnlyNote.includes('would have called this C1'));
  // When the absolute diameter also crosses, the indexed-only note is not raised.
  const both = ar({ venaContracta: 0.8, ejectionFraction: 60, endSystolicDiameter: 55, indexedEndSystolicDiameter: 28 });
  assert.equal(both.indexedOnlyNote, null);
});

test('ar stage: a missing indexed diameter is flagged when the absolute one is under the line', () => {
  const r = ar({ venaContracta: 0.8, ejectionFraction: 60, endSystolicDiameter: 47, holodiastolicReversal: true });
  assert.equal(r.stage, 'C1');
  assert.ok(r.indexedMissingNote.includes('25 mm/m^2'));
  assert.equal(ar({ venaContracta: 0.8, ejectionFraction: 60, endSystolicDiameter: 47,
                    indexedEndSystolicDiameter: 20, holodiastolicReversal: true }).indexedMissingNote, null);
});

test('ar stage: each criterion grades on its own scale, most severe reported', () => {
  assert.equal(ar({ regurgitantVolume: 65 }).severity, 'severe');
  assert.equal(ar({ regurgitantFraction: 55 }).severity, 'severe');
  assert.equal(ar({ regurgitantOrifice: 0.35 }).severity, 'severe');
  assert.equal(ar({ regurgitantOrifice: 0.29 }).severity, 'moderate');
  assert.equal(ar({ regurgitantOrifice: 0.05 }).severity, 'mild');
  assert.equal(ar({ regurgitantVolume: 45 }).severity, 'moderate');
});

test('ar stage: disagreeing criteria are reported, not hidden', () => {
  const r = ar({ venaContracta: 0.2, regurgitantVolume: 70 });
  assert.equal(r.severity, 'severe');
  assert.ok(r.disagreeNote.includes('read together'));
  assert.ok(r.disagreeNote.includes('regurgitant volume'));
  assert.equal(ar({ venaContracta: 0.8, regurgitantVolume: 70 }).disagreeNote, null);
});

test('ar stage: flow reversal is reconciled against the measurements both ways', () => {
  const under = ar({ venaContracta: 0.45, holodiastolicReversal: true });
  assert.ok(under.reversalNote.includes('sign of severe regurgitation'));
  const missing = ar({ venaContracta: 0.8, ejectionFraction: 60, endSystolicDiameter: 44 });
  assert.ok(missing.noReversalNote.includes('absence is worth reconciling'));
  const agree = ar({ venaContracta: 0.8, holodiastolicReversal: true, ejectionFraction: 60, endSystolicDiameter: 44 });
  assert.equal(agree.reversalNote, null);
  assert.equal(agree.noReversalNote, null);
});

test('ar stage: severe without the ventricle stops at C and says what is missing', () => {
  const r = ar({ venaContracta: 0.8, holodiastolicReversal: true });
  assert.equal(r.stage, 'C');
  assert.ok(r.pending.includes('separate C1 from C2'));
});

test('ar stage: guards', () => {
  assert.equal(ar({}).valid, false);
  assert.equal(ar().valid, false);
  assert.equal(ar({ venaContracta: 9 }).valid, false);
  assert.equal(ar({ regurgitantVolume: 900 }).valid, false);
  assert.equal(ar({ regurgitantFraction: 150 }).valid, false);
  assert.equal(ar({ regurgitantOrifice: 9 }).valid, false);
  assert.equal(ar({ venaContracta: 0.8, ejectionFraction: 120 }).valid, false);
  assert.equal(ar({ venaContracta: 0.8, endSystolicDiameter: 500 }).valid, false);
  assert.doesNotMatch(JSON.stringify(ar({ venaContracta: 0.8, ejectionFraction: 48 })), /NaN|Infinity/);
});
