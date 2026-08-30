import test from 'node:test';
import assert from 'node:assert/strict';
import { lastLipid as l, WEIGHT_BREAK_KG, BOLUS_ML_PER_KG, INFUSION_ML_PER_KG_MIN, MAX_ML_PER_KG, EPI_MCG_PER_KG_MAX } from '../../lib/last-lipid-v896.js';

test('last-lipid: the published constants', () => {
  assert.equal(WEIGHT_BREAK_KG, 70);
  assert.equal(BOLUS_ML_PER_KG, 1.5);
  assert.equal(INFUSION_ML_PER_KG_MIN, 0.25);
  assert.equal(MAX_ML_PER_KG, 12);
  assert.equal(EPI_MCG_PER_KG_MAX, 1);
});

test('last-lipid: the two weight branches, split at 70 kg', () => {
  const heavy = l({ weightKg: 80 });
  assert.equal(heavy.bolusMl, 100);
  assert.equal(heavy.infusionText, '200 to 250 mL over 15 to 20 minutes');
  assert.equal(heavy.maxMl, 960);
  const light = l({ weightKg: 50 });
  assert.equal(light.bolusMl, 75);
  assert.equal(light.infusionText, '12.5 mL per minute');
  assert.equal(light.maxMl, 600);
  // Exactly 70 kg takes the fixed-volume branch.
  assert.equal(l({ weightKg: 70 }).bolusMl, 100);
  assert.equal(l({ weightKg: 69 }).bolusMl, 103.5);
});

test('last-lipid: lipid goes early, said on every result', () => {
  // The reason the tile exists.
  for (const w of [50, 80]) {
    assert.match(l({ weightKg: w }).earlyNote, /not at cardiac arrest/);
    assert.match(l({ weightKg: w }).earlyNote, /waiting for arrest is the delay/);
  }
});

test('last-lipid: the epinephrine ceiling is computed and stated either way', () => {
  const arrest = l({ weightKg: 50, cardiacArrest: true });
  assert.equal(arrest.epiMaxMcg, 50);
  assert.match(arrest.epinephrineNote, /In this arrest/);
  assert.match(arrest.epinephrineNote, /no more than about 50 micrograms/);
  assert.match(arrest.epinephrineNote, /roughly a tenth of the usual dose/);
  // Stated before arrest too, because it is the number a team reaches for out of habit.
  const notYet = l({ weightKg: 50 });
  assert.match(notYet.epinephrineNote, /If arrest occurs/);
  assert.match(notYet.epinephrineNote, /about 50 micrograms/);
  // The lipid dose itself does not change with arrest.
  assert.equal(arrest.bolusMl, notYet.bolusMl);
});

test('last-lipid: propofol and the avoided drugs are named on every result', () => {
  for (const w of [50, 80]) {
    assert.match(l({ weightKg: w }).avoidNote, /Propofol is not a substitute/);
    assert.match(l({ weightKg: w }).avoidNote, /Vasopressin, calcium channel blockers, beta blockers/);
  }
});

test('last-lipid: the first step is named as not being on this page', () => {
  const r = l({ weightKg: 80 });
  assert.match(r.stopNote, /stop injecting the local anesthetic/);
  assert.match(r.stopNote, /before any arithmetic here/);
  assert.match(r.monitorNote, /four to six hours after a cardiovascular event/);
  assert.match(r.scopeNote, /does not replace the checklist at the bedside/);
});

test('last-lipid: the re-bolus is bounded by the per-kilogram limit', () => {
  assert.match(l({ weightKg: 80 }).persistentNote, /re-boluses once or twice and doubles the infusion rate/);
  assert.match(l({ weightKg: 80 }).persistentNote, /960 mL upper limit/);
});

test('last-lipid: a missing or out-of-range weight is refused', () => {
  assert.equal(l({}).valid, false);
  assert.match(l({}).message, /Enter the patient weight/);
  assert.equal(l({ weightKg: 0 }).valid, false);
  assert.equal(l({ weightKg: 301 }).valid, false);
});

test('last-lipid: the documented example', () => {
  const r = l({ weightKg: '80' });
  assert.equal(r.bolusMl, 100);
  assert.equal(r.maxMl, 960);
});
