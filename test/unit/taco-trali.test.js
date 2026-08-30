import test from 'node:test';
import assert from 'node:assert/strict';
import { tacoTrali as t, OVERLOAD_FEATURES, INJURY_FEATURES } from '../../lib/taco-trali-v906.js';

const gate = { withinSixHours: true, newHypoxemiaWithInfiltrates: true };

test('taco-trali: the published feature lists', () => {
  assert.equal(OVERLOAD_FEATURES.length, 5);
  assert.equal(INJURY_FEATURES.length, 2);
});

test('taco-trali: the entry criteria gate everything, and the missing one is named', () => {
  assert.equal(t({ raisedNatriureticPeptide: true }).direction, 'gate-not-met');
  assert.match(t({ withinSixHours: true, raisedNatriureticPeptide: true }).band, /hypoxemia with infiltrates is not recorded/);
  assert.match(t({ newHypoxemiaWithInfiltrates: true }).band, /six-hour window is not recorded/);
  assert.match(t({}).band, /neither is recorded/);
  assert.equal(t({}).abnormal, false);
});

test('taco-trali: any overload feature points that way', () => {
  for (const f of OVERLOAD_FEATURES) {
    const r = t({ ...gate, [f.key]: true });
    assert.equal(r.direction, 'overload', f.key);
    assert.match(r.band, /none pointing away from it/);
  }
});

test('taco-trali: injury features alone point the other way', () => {
  for (const f of INJURY_FEATURES) {
    assert.equal(t({ ...gate, [f.key]: true }).direction, 'injury', f.key);
  }
  assert.match(t({ ...gate, noHydrostaticEvidence: true, noOtherArdsRiskFactor: true }).band, /both supporting features are/);
});

test('taco-trali: features on both sides is its own answer, not a tie to break', () => {
  const r = t({ ...gate, positiveFluidBalance: true, noOtherArdsRiskFactor: true });
  assert.equal(r.direction, 'both');
  assert.match(r.band, /does not resolve to one answer/);
  assert.match(r.coexistNote, /treat the picture in front of you, not to pick a label/);
});

test('taco-trali: the entry criteria met with no features says so', () => {
  const r = t(gate);
  assert.equal(r.direction, 'undifferentiated');
  assert.match(r.band, /nothing here says/);
});

test('taco-trali: stop-the-transfusion and the treatment divergence print on every result', () => {
  // The reason the tile exists, and the step that precedes it.
  for (const input of [{}, gate, { ...gate, positiveFluidBalance: true }]) {
    assert.match(t(input).stopNote, /Stop the transfusion and report the event for both/);
    assert.match(t(input).stopNote, /does not wait on this distinction/);
    assert.match(t(input).treatmentNote, /a diuretic given to a patient who is not overloaded makes them worse/);
    assert.match(t(input).surveillanceNote, /not a bedside algorithm/);
  }
});

test('taco-trali: the counts are read back', () => {
  assert.equal(t(gate).recordedNote, 'Recorded: 0 of 5 features pointing to circulatory overload, 0 of 2 pointing to acute lung injury.');
  assert.equal(t({ ...gate, positiveFluidBalance: true, cardiogenicSigns: true, noHydrostaticEvidence: true }).recordedNote,
    'Recorded: 2 of 5 features pointing to circulatory overload, 1 of 2 pointing to acute lung injury.');
});

test('taco-trali: the documented example', () => {
  const r = t({ ...gate, raisedNatriureticPeptide: true, positiveFluidBalance: true });
  assert.equal(r.direction, 'overload');
  assert.equal(r.overload.length, 2);
});
