// spec-v1629 tool 18: reduce or enlarge a master formula.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formulaScale as fs } from '../../lib/formula-scale-v1629.js';

test('a parts formula scales to the wanted weight', () => {
  const r = fs({ formula: 'Zinc oxide, 1, parts\nStarch, 1, parts\nWhite petrolatum, 2, parts', wantedYield: 120, yieldUnit: 'g' });
  assert.deepEqual(r.scaled.map((x) => x.quantity), [30, 30, 60]);
  assert.equal(r.footed, true);
  assert.match(r.notes.at(-1), /add to 120 g/);
});

test('a qs line is recomputed when every unit agrees with the yield', () => {
  const r = fs({ formula: 'Hydrocortisone, 1, g\nGlycerin, 5, g\nWhite petrolatum, qs, g', masterYield: 100, wantedYield: 30, yieldUnit: 'g' });
  assert.equal(r.factor, 0.3);
  assert.deepEqual(r.scaled.map((x) => x.quantity), [0.3, 1.5, 28.2]);
  assert.equal(r.footed, true);
  // Milligrams and grams are the same kind and convert.
  const mixed = fs({ formula: 'Drug, 500, mg\nBase, qs, g', masterYield: 100, wantedYield: 200, yieldUnit: 'g' });
  assert.deepEqual(mixed.scaled.map((x) => x.quantity), [1000, 199]);
});

test('a qs line with mixed units is left as "qs to", and the line that stops the footing is named', () => {
  const r = fs({ formula: 'Hydrocortisone, 1, g\nGlycerin, 5, mL\nWhite petrolatum, qs, g', masterYield: 100, wantedYield: 30, yieldUnit: 'g' });
  assert.equal(r.scaled[2].quantity, null);
  assert.equal(r.footed, false);
  assert.match(r.notes.join(' '), /White petrolatum: qs to 30 g\. It is not computed: "Glycerin" is in mL, which is not added to a yield in g without a specific gravity/);
});

test('scaling by one ingredient reproduces the master when the factor is 1', () => {
  const r = fs({ formula: 'Drug, 500, mg\nBase, 99.5, g', masterYield: 100, yieldUnit: 'g', ingredient: 'drug', ingredientQuantity: 500 });
  assert.equal(r.factor, 1);
  assert.deepEqual(r.scaled.map((x) => x.quantity), [500, 99.5]);
  assert.equal(r.wantedYield, 100);
  assert.equal(r.footed, true);
  const triple = fs({ formula: 'Drug, 500, mg\nBase, 99.5, g', ingredient: 'Drug', ingredientQuantity: 1500 });
  assert.deepEqual(triple.scaled.map((x) => x.quantity), [1500, 298.5]);
  assert.match(triple.notes.at(-1), /no master yield was entered/);
});

test('a master formula whose lines do not add to its stated yield is said so', () => {
  const r = fs({ formula: 'Drug, 500, mg\nBase, 90, g', masterYield: 100, wantedYield: 200, yieldUnit: 'g' });
  assert.equal(r.footed, false);
  assert.match(r.notes.at(-1), /add to 181 g, not the 200 g yield/);
});

test('refusals', () => {
  assert.match(fs({}).message, /Enter the master formula/);
  assert.match(fs({ formula: 'Drug, 1' }).message, /Formula line 1/);
  assert.match(fs({ formula: 'Drug, x, g', wantedYield: 5, yieldUnit: 'g', masterYield: 1 }).message, /quantity on formula line 1/);
  assert.match(fs({ formula: 'Drug, 1, g\nBase, 2, parts', wantedYield: 200, yieldUnit: 'g' }).message, /either all in parts or all in quantities/);
  assert.match(fs({ formula: 'A, qs, g\nB, qs, g', masterYield: 10, wantedYield: 5, yieldUnit: 'g' }).message, /Only one line can be "qs"/);
  assert.match(fs({ formula: 'Drug, 1, g', masterYield: 100, yieldUnit: 'g' }).message, /either the yield wanted, or one ingredient/);
  assert.match(fs({ formula: 'Drug, 1, g', masterYield: 100, wantedYield: 5, yieldUnit: 'g', ingredient: 'Drug', ingredientQuantity: 2 }).message, /not both and not neither/);
  assert.match(fs({ formula: 'Drug, 1, g', ingredient: 'Other', ingredientQuantity: 2 }).message, /is not one of its lines/);
  assert.match(fs({ formula: 'Drug, 80, g\nBase, 50, g\nVehicle, qs, g', masterYield: 100, wantedYield: 50, yieldUnit: 'g' }).message, /nothing is left for the "qs" line/);
  assert.match(fs({ formula: 'Drug, 1, g', masterYield: 100, wantedYield: 5 }).message, /Choose the unit of the yield/);
  assert.match(fs({ formula: 'A, 1, parts', ingredient: 'A', ingredientQuantity: 2 }).message, /scaled to a yield/);
});
