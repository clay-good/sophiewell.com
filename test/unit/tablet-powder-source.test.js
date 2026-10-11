// spec-v1629 tool 8: crushed tablets as a drug source.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tabletPowderSource as tp } from '../../lib/tablet-powder-source-v1629.js';

test('a need that is not a whole number of tablets rounds the count up and leaves the powder unrounded', () => {
  const r = tp({ needed: 150, strength: 40, count: 10, totalWeight: 2500 });
  assert.equal(r.tablets, 4); // 3.75 rounds up
  assert.equal(r.powderMg, 937.5); // 150 x 250 / 40, not rounded
  assert.equal(r.averageTabletMg, 250);
  assert.equal(r.leftOverMg, 62.5);
  assert.match(r.note, /spread evenly through the crushed powder/);
  assert.match(r.note, /no assay is used/);
});

test('a whole number of tablets is not rounded up again; extra tablets add', () => {
  assert.equal(tp({ needed: 80, strength: 40, count: 10, totalWeight: 2500 }).tablets, 2);
  const r = tp({ needed: 80, strength: 40, count: 10, totalWeight: 2500, extra: 1 });
  assert.equal(r.tablets, 3);
  assert.equal(r.powderMg, 500);
  assert.equal(r.leftOverMg, 250);
});

test('refusals', () => {
  assert.match(tp({}).message, /Enter the drug needed/);
  assert.match(tp({ needed: 80, strength: 40, count: 10 }).message, /Enter the total weight/);
  assert.match(tp({ needed: 80, strength: 40, count: 2.5, totalWeight: 600 }).message, /whole number/);
  // A tablet cannot weigh less than the drug it is labeled to hold: grams typed as mg, usually.
  assert.match(tp({ needed: 80, strength: 40, count: 10, totalWeight: 300 }).message, /not more than the 40 mg of drug/);
  assert.match(tp({ needed: 80, strength: 40, count: 10, totalWeight: 2500, extra: 1.5 }).message, /extra tablets must be a whole number/);
});
