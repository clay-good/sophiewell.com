import test from 'node:test';
import assert from 'node:assert/strict';
import { afStages2023 as af, PAROXYSMAL_MAX_DAYS, LONGSTANDING_MIN_MONTHS } from '../../lib/af-stages-2023-v839.js';

test('af stages: the seven stages', () => {
  assert.equal(af({ riskFactors: true }).stage, '1');
  assert.equal(af({ predisposingFindings: true }).stage, '2');
  assert.equal(af({ documentedAf: true, pattern: 'paroxysmal' }).stage, '3A');
  assert.equal(af({ documentedAf: true, pattern: 'persistent' }).stage, '3B');
  assert.equal(af({ documentedAf: true, pattern: 'long-standing-persistent' }).stage, '3C');
  assert.equal(af({ documentedAf: true, freeAfterAblation: true }).stage, '3D');
  assert.equal(af({ documentedAf: true, rhythmControlAbandoned: true }).stage, '4');
});

test('af stages: permanent is a DECISION, not a duration', () => {
  // The error the staging exists to prevent.
  const longstanding = af({ documentedAf: true, pattern: 'long-standing-persistent' });
  assert.equal(longstanding.stage, '3C');
  assert.ok(longstanding.permanentNote.includes('NOT permanent'));
  assert.ok(longstanding.permanentNote.includes('close off options'));

  // The same long-standing AF becomes stage 4 when rhythm control is abandoned.
  const abandoned = af({ documentedAf: true, pattern: 'long-standing-persistent', rhythmControlAbandoned: true });
  assert.equal(abandoned.stage, '4');
  assert.ok(abandoned.permanentNote.includes('DECISION'));

  // And paroxysmal AF becomes permanent too, if rhythm control is abandoned.
  assert.equal(af({ documentedAf: true, pattern: 'paroxysmal', rhythmControlAbandoned: true }).stage, '4');
});

test('af stages: stages 1 and 2 have NO arrhythmia', () => {
  const s1 = af({ riskFactors: true });
  assert.equal(s1.stage, '1');
  assert.ok(s1.preAfNote.includes('NO atrial fibrillation'));
  // Predisposing findings outrank bare risk factors.
  assert.equal(af({ riskFactors: true, predisposingFindings: true }).stage, '2');
  // Documented AF outranks both.
  assert.equal(af({ riskFactors: true, predisposingFindings: true, documentedAf: true, pattern: 'paroxysmal' }).stage, '3A');
});

test('af stages: successful ablation is its own stage', () => {
  const r = af({ documentedAf: true, pattern: 'persistent', freeAfterAblation: true });
  assert.equal(r.stage, '3D');
  assert.ok(r.ablationNote.includes('has not returned to stage 2'));
  // But abandoning rhythm control still outranks it.
  assert.equal(af({ documentedAf: true, freeAfterAblation: true, rhythmControlAbandoned: true }).stage, '4');
});

test('af stages: documented AF with no pattern is staged as 3', () => {
  const r = af({ documentedAf: true });
  assert.equal(r.stage, '3');
  assert.ok(r.label.includes('not yet specified'));
});

test('af stages: the durations are 7 days and 12 months', () => {
  assert.equal(PAROXYSMAL_MAX_DAYS, 7);
  assert.equal(LONGSTANDING_MIN_MONTHS, 12);
  assert.ok(af({ documentedAf: true, pattern: 'paroxysmal' }).label.includes('7 days'));
  assert.ok(af({ documentedAf: true, pattern: 'long-standing-persistent' }).label.includes('12 months'));
});

test('af stages: the result says the stages are a continuum, not a ladder', () => {
  const r = af({ documentedAf: true, rhythmControlAbandoned: true });
  assert.ok(r.continuumNote.includes('both directions'));
  assert.ok(r.continuumNote.includes('out of stage 4'));
  assert.equal(af({}).continuumNote, null);
});

test('af stages: empty and invalid input', () => {
  const empty = af({});
  assert.equal(empty.valid, true);
  assert.equal(empty.stage, null);
  assert.equal(empty.permanentNote, null);
  assert.equal(af({ pattern: 'chronic' }).valid, false);
  assert.equal(af().valid, true);
  assert.doesNotMatch(JSON.stringify(af({ documentedAf: true, pattern: 'paroxysmal' })), /NaN|Infinity/);
});
