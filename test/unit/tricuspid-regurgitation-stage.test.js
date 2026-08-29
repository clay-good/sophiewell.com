import test from 'node:test';
import assert from 'node:assert/strict';
import { tricuspidRegurgitationStage as tr } from '../../lib/tricuspid-regurgitation-stage-v848.js';

test('tr stage: the stages', () => {
  assert.equal(tr({ atRiskValve: true }).stage, 'A');
  assert.equal(tr({ jetArea: 3 }).stage, 'B');
  assert.equal(tr({ jetArea: 7 }).severity, 'moderate');
  assert.equal(tr({ jetArea: 12, hepaticVeinReversal: true }).stage, 'C');
  assert.equal(tr({ jetArea: 12, hepaticVeinReversal: true, symptoms: true }).stage, 'D');
});

test('tr stage: the volume threshold is 45 here, not the 60 of the left side', () => {
  // The error the tile exists to prevent.
  const r = tr({ regurgitantVolume: 50, hepaticVeinReversal: true });
  assert.equal(r.severity, 'severe');
  assert.equal(r.stage, 'C');
  assert.ok(r.volumeThresholdNote.includes('SEVERE on the tricuspid valve'));
  assert.ok(r.volumeThresholdNote.includes('60 mL'));
  // Above 60 there is no left-versus-right ambiguity to warn about.
  assert.equal(tr({ regurgitantVolume: 70 }).volumeThresholdNote, null);
  assert.equal(tr({ regurgitantVolume: 40 }).volumeThresholdNote, null);
  assert.equal(tr({ regurgitantVolume: 44 }).severity, 'moderate');
});

test('tr stage: the orifice threshold is 0.40 here, not the aortic 0.30', () => {
  const r = tr({ regurgitantOrifice: 0.35 });
  assert.equal(r.severity, 'moderate');
  assert.ok(r.orificeThresholdNote.includes('does NOT reach severe on the tricuspid valve'));
  assert.ok(r.orificeThresholdNote.includes('over-call'));
  assert.equal(tr({ regurgitantOrifice: 0.45 }).severity, 'severe');
  assert.equal(tr({ regurgitantOrifice: 0.45 }).orificeThresholdNote, null);
});

test('tr stage: each criterion grades on its own tricuspid scale', () => {
  assert.equal(tr({ jetArea: 10 }).severity, 'severe');
  assert.equal(tr({ jetArea: 9.9 }).severity, 'moderate');
  assert.equal(tr({ venaContracta: 0.7 }).severity, 'severe');
  assert.equal(tr({ venaContracta: 0.69 }).severity, 'moderate');
  assert.equal(tr({ venaContracta: 0.2 }).severity, 'mild');
});

test('tr stage: hepatic vein reversal is reconciled both ways', () => {
  assert.ok(tr({ jetArea: 12 }).hepaticNote.includes('absence is worth reconciling'));
  assert.ok(tr({ jetArea: 7, hepaticVeinReversal: true }).hepaticSupportsNote.includes('points to severe'));
  const agree = tr({ jetArea: 12, hepaticVeinReversal: true });
  assert.equal(agree.hepaticNote, null);
  assert.equal(agree.hepaticSupportsNote, null);
});

test('tr stage: the mechanism is recorded but does not change the thresholds', () => {
  const secondary = tr({ jetArea: 12, mechanism: 'secondary', hepaticVeinReversal: true });
  assert.equal(secondary.stage, 'C');
  assert.ok(secondary.mechanismNote.includes('these thresholds apply either way'));
  const primary = tr({ jetArea: 12, mechanism: 'primary', hepaticVeinReversal: true });
  assert.equal(primary.stage, 'C');
  assert.ok(primary.mechanismNote.includes('Most tricuspid regurgitation is secondary'));
  assert.equal(tr({ jetArea: 12 }).mechanismNote, null);
});

test('tr stage: there is no C1 or C2 on this valve, and the tile says so', () => {
  const r = tr({ jetArea: 12, hepaticVeinReversal: true });
  assert.equal(r.stage, 'C');
  assert.ok(r.noSubdivisionNote.includes('no C1 or C2'));
  assert.equal(tr({ jetArea: 12, symptoms: true }).noSubdivisionNote, null);
});

test('tr stage: disagreeing criteria are reported, not hidden', () => {
  const r = tr({ jetArea: 3, regurgitantVolume: 50 });
  assert.equal(r.severity, 'severe');
  assert.ok(r.disagreeNote.includes('read together'));
  assert.equal(tr({ jetArea: 12, regurgitantVolume: 50 }).disagreeNote, null);
});

test('tr stage: guards', () => {
  assert.equal(tr({}).valid, false);
  assert.equal(tr().valid, false);
  assert.equal(tr({ jetArea: 200 }).valid, false);
  assert.equal(tr({ venaContracta: 9 }).valid, false);
  assert.equal(tr({ regurgitantOrifice: 9 }).valid, false);
  assert.equal(tr({ regurgitantVolume: 900 }).valid, false);
  assert.doesNotMatch(JSON.stringify(tr({ jetArea: 12, symptoms: true })), /NaN|Infinity/);
});
