import test from 'node:test';
import assert from 'node:assert/strict';
import { mitralRegurgitationStage as mr } from '../../lib/mitral-regurgitation-stage-v847.js';

test('mr stage: the stages', () => {
  assert.equal(mr({ atRiskValve: true }).stage, 'A');
  assert.equal(mr({ venaContracta: 0.2 }).stage, 'B');
  assert.equal(mr({ venaContracta: 0.5 }).severity, 'moderate');
  assert.equal(mr({ venaContracta: 0.8, ejectionFraction: 65, endSystolicDimension: 34 }).stage, 'C1');
  assert.equal(mr({ venaContracta: 0.8, symptoms: true }).stage, 'D');
});

test('mr stage: an ejection fraction of 60 percent is already dysfunction here', () => {
  // The error the tile exists to prevent. 55 percent reads as normal anywhere else.
  const r = mr({ venaContracta: 0.8, ejectionFraction: 55, endSystolicDimension: 34 });
  assert.equal(r.stage, 'C2');
  assert.ok(r.flatteredEfNote.includes('would read as normal against the 50 percent threshold'));
  assert.ok(r.flatteredEfNote.includes('ABOVE 60 percent'));
  // Exactly 60 is dysfunction; 61 is not.
  assert.equal(mr({ venaContracta: 0.8, ejectionFraction: 60, endSystolicDimension: 34 }).stage, 'C2');
  assert.equal(mr({ venaContracta: 0.8, ejectionFraction: 61, endSystolicDimension: 34 }).stage, 'C1');
  // The note is about the flattering band, so a plainly low fraction does not raise it.
  assert.equal(mr({ venaContracta: 0.8, ejectionFraction: 35, endSystolicDimension: 34 }).flatteredEfNote, null);
});

test('mr stage: the end-systolic dimension reaches C2 on its own', () => {
  const r = mr({ venaContracta: 0.8, ejectionFraction: 68, endSystolicDimension: 43 });
  assert.equal(r.stage, 'C2');
  assert.ok(r.dimensionOnlyNote.includes('reaches C2 on its own'));
  assert.ok(r.dimensionOnlyNote.includes('earlier signal'));
  // 39 mm does not.
  assert.equal(mr({ venaContracta: 0.8, ejectionFraction: 68, endSystolicDimension: 39 }).stage, 'C1');
  // When the fraction is also down, the dimension-only note is not raised.
  assert.equal(mr({ venaContracta: 0.8, ejectionFraction: 55, endSystolicDimension: 43 }).dimensionOnlyNote, null);
});

test('mr stage: each criterion grades on its own scale', () => {
  assert.equal(mr({ venaContracta: 0.7 }).severity, 'severe');
  assert.equal(mr({ venaContracta: 0.69 }).severity, 'moderate');
  assert.equal(mr({ regurgitantVolume: 60 }).severity, 'severe');
  assert.equal(mr({ regurgitantFraction: 50 }).severity, 'severe');
  assert.equal(mr({ regurgitantOrifice: 0.4 }).severity, 'severe');
  assert.equal(mr({ regurgitantOrifice: 0.39 }).severity, 'moderate');
  assert.equal(mr({ regurgitantOrifice: 0.15 }).severity, 'mild');
});

test('mr stage: disagreeing criteria are reported, not hidden', () => {
  const r = mr({ venaContracta: 0.4, regurgitantOrifice: 0.5 });
  assert.equal(r.severity, 'severe');
  assert.ok(r.disagreeNote.includes('read together'));
  assert.ok(r.disagreeNote.includes('effective regurgitant orifice'));
  assert.equal(mr({ venaContracta: 0.8, regurgitantOrifice: 0.5 }).disagreeNote, null);
});

test('mr stage: it says on every result that these are the PRIMARY criteria', () => {
  for (const input of [{ atRiskValve: true }, { venaContracta: 0.2 }, { venaContracta: 0.8, symptoms: true }]) {
    const r = mr(input);
    assert.ok(r.primaryOnlyNote.includes('Secondary regurgitation'));
    assert.ok(r.primaryOnlyNote.includes('do not apply to it'));
  }
});

test('mr stage: severe without the ventricle stops at C and says what is missing', () => {
  const r = mr({ regurgitantVolume: 70 });
  assert.equal(r.stage, 'C');
  assert.ok(r.pending.includes('separate C1 from C2'));
});

test('mr stage: guards', () => {
  assert.equal(mr({}).valid, false);
  assert.equal(mr().valid, false);
  assert.equal(mr({ venaContracta: 9 }).valid, false);
  assert.equal(mr({ regurgitantVolume: 900 }).valid, false);
  assert.equal(mr({ regurgitantFraction: 150 }).valid, false);
  assert.equal(mr({ regurgitantOrifice: 9 }).valid, false);
  assert.equal(mr({ venaContracta: 0.8, ejectionFraction: 120 }).valid, false);
  assert.equal(mr({ venaContracta: 0.8, endSystolicDimension: 500 }).valid, false);
  assert.doesNotMatch(JSON.stringify(mr({ venaContracta: 0.8, ejectionFraction: 55 })), /NaN|Infinity/);
});
