// spec-v1629 tool 4: molecular weight from a formula, and the atomic-weight table it reads.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { molecularWeight as mw } from '../../lib/molecular-weight-v1629.js';
import { ATOMIC_WEIGHTS, ATOMIC_WEIGHTS_EDITION } from '../../lib/atomic-weights-2024.js';

const of = (formula) => mw({ formula });

test('the table is the CIAAW 2024 abridged table: 118 elements, 84 with a value, as printed', () => {
  const rows = Object.entries(ATOMIC_WEIGHTS);
  assert.equal(rows.length, 118);
  assert.deepEqual(rows.map(([, r]) => r.z), Array.from({ length: 118 }, (_, i) => i + 1));
  assert.equal(rows.filter(([, r]) => r.weight !== null).length, 84);
  // The values the spec read on the page, kept as the strings the table prints.
  const read = { H: '1.0080', C: '12.011', N: '14.007', O: '15.999', Na: '22.990', Mg: '24.305', P: '30.974', S: '32.06', Cl: '35.45', K: '39.098', Ca: '40.078', Fe: '55.845', Zn: '65.38', Li: '6.94' };
  for (const [sym, w] of Object.entries(read)) assert.equal(ATOMIC_WEIGHTS[sym].weight, w, sym);
  assert.equal(ATOMIC_WEIGHTS.Li.uncertainty, '0.06');
  for (const sym of ['Tc', 'Pm', 'Og']) assert.equal(ATOMIC_WEIGHTS[sym].weight, null, sym);
  for (const sym of ['Bi', 'Th', 'Pa', 'U']) assert.notEqual(ATOMIC_WEIGHTS[sym].weight, null, sym);
  assert.equal(ATOMIC_WEIGHTS_EDITION.edition, '2024');
  assert.match(ATOMIC_WEIGHTS_EDITION.source.url, /^https:\/\/ciaaw\.org\//);
});

test('CaCl2.2H2O = 147.01; Li2CO3 = 73.89; KCl sums to 74.548', () => {
  const ca = of('CaCl2.2H2O');
  assert.equal(ca.molecularWeight, 147.01);
  assert.equal(ca.waterPercent, 24.51);
  assert.match(ca.notes[0], /Read as: CaCl2 \+ 2 × H2O/);
  assert.equal(of('Li2CO3').molecularWeight, 73.89);
  // Chlorine is printed to two decimals, so the result is given to two (74.55); the sum is 74.548.
  const kcl = of('KCl');
  assert.equal(kcl.molecularWeightUnrounded, 74.548);
  assert.equal(kcl.molecularWeight, 74.55);
  assert.equal(kcl.decimals, 2);
});

test('C, Ca, Co and CO are four different things', () => {
  assert.equal(of('C').molecularWeight, 12.011);
  assert.equal(of('Ca').molecularWeight, 40.078);
  assert.equal(of('Co').molecularWeight, 58.933);
  assert.equal(of('CO').molecularWeight, 28.01);
  assert.deepEqual(of('CO').elements.map((e) => e.symbol), ['C', 'O']);
});

test('brackets nest, square brackets work, and a hydrate multiplier may be a decimal', () => {
  assert.equal(of('Mg(OH)2').molecularWeight, 58.319);
  assert.equal(of('Ca3(PO4)2').molecularWeight, 310.174);
  assert.equal(of('Ca((OH)2)3').elements.find((e) => e.symbol === 'O').count, 6);
  assert.equal(of('[Fe(CN)6]^4-').molecularWeight, 211.953);
  assert.equal(of('CuSO4·5H2O').molecularWeight, 249.68);
  const hemi = of('CaSO4.0.5H2O');
  assert.equal(hemi.molecularWeight, 145.14);
  assert.match(hemi.notes[0], /CaSO4 \+ 0\.5 × H2O/);
  assert.equal(of('C16H19N3O5S.3H2O').molecularWeight, 419.45);
});

test('an unknown symbol is refused, not skipped; so is an element with no standard atomic weight', () => {
  assert.match(of('Xx2').message, /"Xx" is not an element symbol.*nothing is skipped/);
  assert.match(of('CaCL2').message, /"L" is not an element symbol/);
  assert.match(of('TcO4').message, /Tc \(technetium\) has no standard atomic weight/);
});

test('lowercase input is refused, with the reason', () => {
  assert.match(of('cacl2').message, /lowercase "c" does not start an element symbol/);
  assert.match(of('NaCl h2o').message, /lowercase/);
});

test('a charge is read only after a caret; a bare sign is refused as ambiguous', () => {
  assert.equal(of('NH4^+').molecularWeight, 18.039);
  assert.equal(of('SO4^2-').molecularWeight, 96.06);
  assert.match(of('NH4+').message, /ambiguous/);
  assert.match(of('Fe3+').message, /ambiguous/);
  assert.match(of('H2^O').message, /caret is read only before a charge/);
});

test('a decimal atom count is not read as something else', () => {
  assert.match(of('Fe0.5O').message, /decimal count such as Fe0\.5 is not read/);
  assert.match(of('NaCl0').message, /count of 0/);
});

test('malformed formulas are refused', () => {
  assert.match(of('').message, /Enter a chemical formula/);
  assert.match(of('Ca(OH').message, /bracket is not closed/);
  assert.match(of('H2O)').message, /closes a bracket that was not opened/);
  assert.match(of('CaCl2.').message, /dot must be followed/);
  assert.match(of('()2').message, /brackets is empty/);
  assert.match(of('Ca#').message, /is not part of a formula/);
  assert.match(of('C'.repeat(300)).message, /longer than/);
  assert.equal(mw().valid, false);
  // A formula is text: NaN must not be read as sodium and nitrogen.
  for (const bad of [NaN, 12, true, {}, []]) assert.match(mw({ formula: bad }).message, /Enter the chemical formula as text/);
});

test('each element\'s share adds to 100, and lithium makes the result visibly less certain', () => {
  const r = of('C6H12O6');
  assert.equal(r.molecularWeight, 180.156);
  assert.ok(Math.abs(r.elements.reduce((s, e) => s + e.percent, 0) - 100) < 0.02);
  assert.deepEqual(r.elements.map((e) => e.symbol), ['C', 'H', 'O']); // Hill order
  assert.deepEqual(of('CaCl2.2H2O').elements.map((e) => e.symbol), ['Ca', 'Cl', 'H', 'O']); // no carbon: alphabetical
  assert.ok(of('Li2CO3').uncertainty > 10 * of('Na2CO3').uncertainty);
  assert.match(r.notes.at(-1), /IUPAC CIAAW, Abridged Standard Atomic Weights 2024/);
});
