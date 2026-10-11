// spec-v1629 tool 20: apothecary, avoirdupois and household measures (NIST Handbook 44 App. C; 21 CFR 101.9).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { apothecaryHouseholdMeasures as ah, UNITS } from '../../lib/apothecary-household-measures-v1629.js';

const one = (unit) => ah({ quantity: 1, unit });

test('1 grain = 64.79891 mg; 1 minim = 0.06161152 mL', () => {
  assert.equal(one('grain').value, 64.79891);
  assert.equal(one('minim').value, 0.06161152);
  assert.equal(ah({ quantity: 15, unit: 'grain' }).value, 971.98365);
});

test('the values Handbook 44 prints, to the digits it prints them', () => {
  // Appendix C: scruple 1.295 978 2 g; apothecaries dram 3.887 934 6 g; apothecaries pound 373.241 721 6 g;
  // avoirdupois pound 453.592 37 g; fluid dram 3.696 691 mL; fluid ounce 29.573 53 mL; pint 473.176 5 mL;
  // quart 946.352 9 mL; gallon 3 785.411 784 mL.
  assert.equal(one('scruple').value, 1295.9782);
  assert.equal(one('dram-ap').value, 3887.9346);
  assert.equal(one('pound-ap').value, 373241.72);
  assert.equal(one('pound-av').value, 453592.37);
  assert.equal(Number(one('fluid-dram').value.toFixed(6)), 3.696691);
  assert.equal(Number(one('fluid-ounce').value.toFixed(5)), 29.57353);
  assert.equal(Number(one('pint').value.toFixed(4)), 473.1765);
  assert.equal(Number(one('quart').value.toFixed(4)), 946.3529);
  assert.equal(Number(one('gallon').value.toFixed(4)), 3785.4118);
});

test('an apothecaries ounce (31.103 g) is not an avoirdupois ounce (28.350 g)', () => {
  const ap = one('ounce-ap'); const av = one('ounce-av');
  assert.equal(Number((ap.value / 1000).toFixed(3)), 31.103);
  assert.equal(Number((av.value / 1000).toFixed(3)), 28.35);
  assert.match(ap.notes.join(' '), /The other ounce: 1 avoirdupois ounce is 28\.349523 g \(437\.5 grains\)/);
  assert.match(av.notes.join(' '), /The other ounce: 1 apothecaries ounce is 31\.103477 g \(480 grains\)/);
  assert.match(ap.notes.join(' '), /In grains: 480/);
});

test('a fluid ounce shows 29.57 mL and 30 mL, each with its source', () => {
  const r = one('fluid-ounce');
  assert.match(r.band, /29\.57353 mL/);
  assert.deepEqual(r.alternatives, [{ value: 30, unit: 'mL', source: '21 CFR 101.9(b)(5)(viii), "for nutrition labeling purposes"' }]);
  const text = r.notes.join(' ');
  assert.match(text, /NIST Handbook 44 \(2026\), Appendix C/);
  assert.match(text, /"1 fl oz means 30 mL"/);
  assert.match(text, /a rule for nutrition labels, not a unit of measure/);
  const cup = one('cup');
  assert.equal(Number(cup.value.toFixed(1)), 236.6);
  assert.equal(cup.alternatives[0].value, 240);
});

test('1 teaspoon is shown as 5 mL and as about 1⅓ fluid drams', () => {
  const r = one('teaspoon');
  assert.equal(r.value, 5);
  const text = r.notes.join(' ');
  assert.match(text, /1⅓ fluid drams/);
  assert.match(text, /imprecise units; a household spoon is not a measuring device/);
  assert.equal(one('tablespoon').value, 15);
  // 1⅓ fluid drams is 4.93 mL: the 5 mL is the rounded figure the handbook prints.
  assert.equal(Number((one('fluid-dram').value * 4 / 3).toFixed(2)), 4.93);
});

test('every unit converts, and nothing is defaulted', () => {
  assert.equal(UNITS.length, 16);
  for (const u of UNITS) assert.equal(one(u.value).valid, true, u.value);
  assert.match(ah({ quantity: 1 }).message, /Choose the unit/);
  assert.match(ah({ quantity: 1, unit: 'drachm' }).message, /Choose the unit/);
  assert.match(ah({ unit: 'grain' }).message, /Enter the quantity/);
  assert.match(ah({ quantity: 0, unit: 'grain' }).message, /greater than 0/);
});
