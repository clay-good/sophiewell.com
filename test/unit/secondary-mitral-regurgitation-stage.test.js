import test from 'node:test';
import assert from 'node:assert/strict';
import { secondaryMitralRegurgitationStage as smr } from '../../lib/secondary-mitral-regurgitation-stage-v849.js';

test('smr stage: the stages', () => {
  assert.equal(smr({ smallJet: true }).stage, 'A');
  assert.equal(smr({ regurgitantOrifice: 0.15 }).stage, 'B');
  assert.equal(smr({ regurgitantOrifice: 0.45 }).stage, 'C');
  assert.equal(smr({ regurgitantOrifice: 0.45, symptoms: true, therapyOptimized: true }).stage, 'D');
});

test('smr stage: severe is 0.40 and 60, not the 2014 lines of 0.20 and 30', () => {
  // The error the tile exists to prevent.
  const r = smr({ regurgitantOrifice: 0.25 });
  assert.equal(r.severity, 'moderate');
  assert.equal(r.stage, 'B');
  assert.ok(r.supersededNote.includes('2014'));
  assert.ok(r.supersededNote.includes('0.40 square cm and 60 mL'));

  const v = smr({ regurgitantVolume: 45 });
  assert.equal(v.severity, 'moderate');
  assert.ok(v.supersededNote.includes('45 mL'));

  // Outside that band there is no old-versus-new ambiguity to warn about.
  assert.equal(smr({ regurgitantOrifice: 0.45 }).supersededNote, null);
  assert.equal(smr({ regurgitantOrifice: 0.15 }).supersededNote, null);
  assert.equal(smr({ regurgitantVolume: 70 }).supersededNote, null);
  assert.equal(smr({ regurgitantVolume: 20 }).supersededNote, null);
});

test('smr stage: each criterion grades on its own scale', () => {
  assert.equal(smr({ regurgitantOrifice: 0.40 }).severity, 'severe');
  assert.equal(smr({ regurgitantOrifice: 0.39 }).severity, 'moderate');
  assert.equal(smr({ regurgitantVolume: 60 }).severity, 'severe');
  assert.equal(smr({ regurgitantVolume: 59 }).severity, 'moderate');
  assert.equal(smr({ regurgitantVolume: 29 }).severity, 'mild');
  assert.equal(smr({ regurgitantFraction: 50 }).severity, 'severe');
  assert.equal(smr({ regurgitantFraction: 49 }).severity, 'moderate');
});

test('smr stage: the most severe criterion decides and a disagreement is stated', () => {
  const r = smr({ regurgitantOrifice: 0.45, regurgitantVolume: 20 });
  assert.equal(r.severity, 'severe');
  assert.deepEqual(r.decidedBy, ['effective regurgitant orifice']);
  assert.ok(r.disagreeNote.includes('mild to severe'));
  assert.equal(smr({ regurgitantOrifice: 0.45, regurgitantVolume: 70 }).disagreeNote, null);
});

test('smr stage: D waits for the underlying disease to be treated', () => {
  const pending = smr({ regurgitantVolume: 70, symptoms: true });
  assert.equal(pending.stage, 'C or D');
  assert.ok(pending.pending.includes('PERSIST'));
  assert.equal(pending.treatedNote, null);
  assert.ok(pending.abnormal);

  const d = smr({ regurgitantVolume: 70, symptoms: true, therapyOptimized: true });
  assert.equal(d.stage, 'D');
  assert.ok(d.treatedNote.includes('persisted'));
});

test('smr stage: there is no C1 or C2 split on this table', () => {
  const r = smr({ regurgitantVolume: 70, ejectionFraction: 35 });
  assert.equal(r.stage, 'C');
  assert.ok(r.noSplitNote.includes('no C1 or C2'));
  assert.ok(r.noSplitNote.includes('CAUSE'));
  // A ventricle recorded against a non-severe leak raises nothing.
  assert.equal(smr({ regurgitantVolume: 20, ejectionFraction: 35 }).noSplitNote, null);
});

test('smr stage: the scope is stated every time, and a missing substrate is named', () => {
  const r = smr({ regurgitantVolume: 70 });
  assert.ok(r.secondaryOnlyNote.includes('SECONDARY'));
  assert.ok(r.substrateNote.includes('coronary disease or cardiomyopathy'));
  assert.equal(smr({ regurgitantVolume: 70, substrate: true }).substrateNote, null);
  assert.equal(smr({ regurgitantVolume: 70, substrate: true }).substrateRecorded, true);
});

test('smr stage: validation', () => {
  assert.equal(smr({}).valid, false);
  assert.equal(smr({ substrate: true }).valid, false);
  assert.equal(smr({ regurgitantOrifice: 5 }).valid, false);
  assert.equal(smr({ regurgitantVolume: 500 }).valid, false);
  assert.equal(smr({ regurgitantFraction: 120 }).valid, false);
  assert.equal(smr({ regurgitantVolume: 70, ejectionFraction: 2 }).valid, false);
  assert.equal(smr(null).valid, false);
  assert.equal(smr({ regurgitantVolume: '' , smallJet: 'true' }).stage, 'A');
});

test('smr stage: the documented example round-trips', () => {
  const r = smr({ regurgitantOrifice: '0.25', substrate: 'true' });
  assert.equal(r.valid, true);
  assert.equal(r.bandLabel, 'Stage B');
  assert.ok(r.band.includes('stage B'));
});
