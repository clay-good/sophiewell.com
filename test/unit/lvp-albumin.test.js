import test from 'node:test';
import assert from 'node:assert/strict';
import { lvpAlbumin as l, THRESHOLD_LITRES, GRAMS_PER_LITRE_LOW, GRAMS_PER_LITRE_HIGH, CONCENTRATIONS } from '../../lib/lvp-albumin-v892.js';

test('lvp-albumin: the published rule', () => {
  assert.equal(THRESHOLD_LITRES, 5);
  assert.equal(GRAMS_PER_LITRE_LOW, 6);
  assert.equal(GRAMS_PER_LITRE_HIGH, 8);
  assert.deepEqual(CONCENTRATIONS.map((c) => c.value), ['25', '20', '5']);
});

test('lvp-albumin: the threshold is above 5 liters, not at it', () => {
  assert.equal(l({ litersRemoved: 5 }).indicated, false);
  assert.equal(l({ litersRemoved: 5.1 }).indicated, true);
  assert.equal(l({ litersRemoved: 5 }).gramsLow, 0);
  assert.match(l({ litersRemoved: 4 }).band, /not routinely required/);
});

test('lvp-albumin: the dose is per liter across the WHOLE volume', () => {
  // The arithmetic error the rule invites.
  const r = l({ litersRemoved: 8 });
  assert.equal(r.gramsLow, 48);
  assert.equal(r.gramsHigh, 64);
  assert.match(r.arithmeticNote, /not per liter above 5/);
  assert.match(r.arithmeticNote, /18 to 24 g here/);
  // A larger tap scales linearly, not by the excess.
  assert.equal(l({ litersRemoved: 10 }).gramsLow, 60);
  assert.equal(l({ litersRemoved: 10 }).gramsHigh, 80);
});

test('lvp-albumin: the bottle count follows the concentration stocked', () => {
  // 25% and 5% are both 12.5 g per bottle; 20% is 10 g.
  const at25 = l({ litersRemoved: 8, concentration: '25' });
  assert.equal(at25.bottlesLow, 4);
  assert.equal(at25.bottlesHigh, 6);
  const at20 = l({ litersRemoved: 8, concentration: '20' });
  assert.equal(at20.bottlesLow, 5);
  assert.equal(at20.bottlesHigh, 7);
  assert.match(at20.bottlesNote, /Confirm the strength stocked/);
  // Nothing to count when none is indicated.
  assert.equal(l({ litersRemoved: 4 }).bottlesNote, null);
});

test('lvp-albumin: the volume decides it, not the albumin level', () => {
  // The reason the tile exists, so it prints on every result.
  for (const liters of [3, 8]) {
    assert.match(l({ litersRemoved: liters }).volumeNotLevelNote, /not the patient's albumin level/);
    assert.match(l({ litersRemoved: liters }).volumeNotLevelNote, /a normal one does not excuse it/);
    assert.match(l({ litersRemoved: liters }).notNutritionNote, /neither nutritional support nor a plasma expander/);
    assert.match(l({ litersRemoved: liters }).diagnosticNote, /cell count and culture/);
  }
});

test('lvp-albumin: a missing or out-of-range volume is refused', () => {
  assert.equal(l({}).valid, false);
  assert.match(l({}).message, /Enter the volume of ascitic fluid removed/);
  assert.equal(l({ litersRemoved: -1 }).valid, false);
  assert.equal(l({ litersRemoved: 31 }).valid, false);
  assert.equal(l({ litersRemoved: 8, concentration: 'made-up' }).concentration, '25');
});

test('lvp-albumin: the documented example', () => {
  const r = l({ litersRemoved: '8', concentration: '25' });
  assert.equal(r.gramsLow, 48);
  assert.equal(r.gramsHigh, 64);
  assert.equal(r.bandLabel, '48 to 64 g');
});
