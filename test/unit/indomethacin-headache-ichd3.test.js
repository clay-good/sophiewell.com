import test from 'node:test';
import assert from 'node:assert/strict';
import { indomethacinHeadacheIchd3 as ind } from '../../lib/indomethacin-headache-ichd3-v819.js';

const ph = { attackCount: 30, attackMinutes: 15, attacksPerDay: 8, miosisPtosis: true, indomethacinResponse: true, noBetterExplanation: true };
const hc = { unilateralContinuous: true, monthsContinuous: 6, moderateExacerbations: true, miosisPtosis: true, indomethacinResponse: true, noBetterExplanation: true };

test('indomethacin TACs: each criteria set is met on its own terms', () => {
  assert.deepEqual(ind(ph).diagnoses, ['3.2 Paroxysmal hemicrania']);
  assert.deepEqual(ind(hc).diagnoses, ['3.4 Hemicrania continua']);
});

test('indomethacin TACs: the drug response is a CRITERION, so nothing is diagnosed without it', () => {
  // This is the point of the tile. Everything else textbook, no trial: no diagnosis.
  const noTrial = ind({ ...ph, indomethacinResponse: false });
  assert.deepEqual(noTrial.diagnoses, []);
  assert.equal(noTrial.paroxysmalHemicrania.e, false);
  assert.ok(noTrial.indomethacinNote.includes('diagnostic criterion'));

  const noTrialHc = ind({ ...hc, indomethacinResponse: false });
  assert.deepEqual(noTrialHc.diagnoses, []);
  assert.ok(noTrialHc.indomethacinNote);
});

test('indomethacin TACs: the note is not raised when other criteria are missing too', () => {
  // If the history does not otherwise fit, the missing trial is not the story.
  assert.equal(ind({ indomethacinResponse: false }).indomethacinNote, null);
  assert.equal(ind({ ...ph, indomethacinResponse: false, attackCount: 2 }).indomethacinNote, null);
});

test('indomethacin TACs: paroxysmal hemicrania needs MORE than 5 attacks a day', () => {
  assert.equal(ind({ ...ph, attacksPerDay: 5 }).paroxysmalHemicrania.d, false);
  assert.equal(ind({ ...ph, attacksPerDay: 6 }).paroxysmalHemicrania.d, true);
});

test('indomethacin TACs: the 2 to 30 minute window separates it from cluster headache', () => {
  assert.equal(ind({ ...ph, attackMinutes: 2 }).paroxysmalHemicrania.b, true);
  assert.equal(ind({ ...ph, attackMinutes: 30 }).paroxysmalHemicrania.b, true);
  assert.equal(ind({ ...ph, attackMinutes: 1 }).paroxysmalHemicrania.b, false);
  const long = ind({ ...ph, attackMinutes: 60 });
  assert.equal(long.paroxysmalHemicrania.b, false);
  assert.ok(long.clusterNote.includes('Cluster headache'));
});

test('indomethacin TACs: at least 20 attacks, and more than 3 months', () => {
  assert.equal(ind({ ...ph, attackCount: 19 }).paroxysmalHemicrania.a, false);
  assert.equal(ind({ ...ph, attackCount: 20 }).paroxysmalHemicrania.a, true);
  assert.equal(ind({ ...hc, monthsContinuous: 3 }).hemicraniaContinua.b, false);
  assert.equal(ind({ ...hc, monthsContinuous: 4 }).hemicraniaContinua.b, true);
  // Exacerbations are part of criterion B, not optional.
  assert.equal(ind({ ...hc, moderateExacerbations: false }).hemicraniaContinua.b, false);
});

test('indomethacin TACs: movement aggravation counts for 3.4 and NOT for 3.2', () => {
  const byMovement = { ...ph, miosisPtosis: false, aggravatedByMovement: true };
  assert.equal(ind(byMovement).paroxysmalHemicrania.c, false);
  assert.deepEqual(ind(byMovement).diagnoses, []);

  const hcByMovement = { ...hc, miosisPtosis: false, aggravatedByMovement: true };
  assert.equal(ind(hcByMovement).hemicraniaContinua.c, true);
  assert.deepEqual(ind(hcByMovement).diagnoses, ['3.4 Hemicrania continua']);
  assert.ok(ind(hcByMovement).movementNote.includes('only in 3.4'));
});

test('indomethacin TACs: restlessness alone satisfies criterion C for both', () => {
  assert.equal(ind({ ...ph, miosisPtosis: false, restlessness: true }).paroxysmalHemicrania.c, true);
  assert.equal(ind({ ...hc, miosisPtosis: false, restlessness: true }).hemicraniaContinua.c, true);
});

test('indomethacin TACs: empty and out-of-range input', () => {
  const empty = ind({});
  assert.equal(empty.valid, true);
  assert.equal(empty.criteriaMet, false);
  assert.equal(empty.clusterNote, null);
  assert.equal(ind({ attackMinutes: 1e308 }).valid, false);
  assert.equal(ind({ attacksPerDay: -1 }).valid, false);
  assert.equal(ind().valid, true);
  assert.doesNotMatch(JSON.stringify(ind({ attackCount: 1e308 })), /NaN|Infinity/);
});
