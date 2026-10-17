// spec-v1629 tool 6: salt, base and hydrate conversion factor.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { saltBaseFactor as sb } from '../../lib/salt-base-factor-v1629.js';

test('pentobarbital sodium to pentobarbital gives 0.911', () => {
  const r = sb({ aFormula: 'C11H17N2NaO3', bFormula: 'C11H18N2O3' });
  assert.equal(r.valid, true);
  assert.equal(Math.round(r.factorBoverA * 1000) / 1000, 0.911);
  assert.equal(r.factorAoverB, 1.09715);
  // 100 mg of the sodium salt carries 91.1 mg of pentobarbital.
  assert.equal(sb({ aFormula: 'C11H17N2NaO3', bFormula: 'C11H18N2O3', quantity: 100, quantityOf: 'a' }).quantityB, 91.1455);
  assert.equal(sb({ aFormula: 'C11H17N2NaO3', bFormula: 'C11H18N2O3', quantity: 100, quantityOf: 'b' }).quantityA, 109.715);
});

test('a salt with two moieties per formula unit halves the weight per moiety', () => {
  const one = sb({ aMw: 500, bMw: 200 });
  const two = sb({ aMw: 500, bMw: 200, aMoieties: 2 });
  assert.equal(one.factorAoverB, 2.5);
  assert.equal(two.factorAoverB, 1.25);
  assert.match(two.notes[0], /2 active moieties per formula unit, so 250 g per mole of moiety/);
});

test('identical formulas give 1', () => {
  const r = sb({ aFormula: 'CaCl2', bFormula: 'CaCl2' });
  assert.equal(r.factorAoverB, 1);
  assert.equal(r.factorBoverA, 1);
});

test('a hydrate against its anhydrous form', () => {
  // CaCl2.2H2O 147.008 over CaCl2 110.978.
  assert.equal(sb({ aFormula: 'CaCl2.2H2O', bFormula: 'CaCl2' }).factorAoverB, 1.32466);
});

test('the moiety count taken as 1 is stated; refusals', () => {
  assert.match(sb({ aMw: 500, bMw: 200 }).notes.join(' '), /were not entered and are taken as 1/);
  assert.match(sb({ aMw: 500, bMw: 200, aMoieties: 2 }).notes.join(' '), /of form B was not entered and is taken as 1/);
  assert.match(sb({ aFormula: 'CaCl2', bFormula: 'CaCl2', aMw: 110 }).message, /either its formula or its molecular weight/);
  assert.match(sb({ bFormula: 'CaCl2' }).message, /For form A, enter either/);
  assert.match(sb({ aFormula: 'CaCl2', bFormula: 'CaXx2' }).message, /Form B: "Xx" is not an element symbol/);
  assert.match(sb({ aMw: 500, bMw: 200, aMoieties: 1.5 }).message, /whole number/);
  assert.match(sb({ aMw: 500, bMw: 200, quantity: 5 }).message, /Choose which form the quantity is a weight of/);
  assert.match(sb({ aMw: 500, bMw: 200 }).note, /label prints its own equivalency statement/);
});

// spec-v1629 tool 6 note: the label's equivalency statement outranks a computed factor and is its own input.
test('the label equivalency statement is the factor used, with the computed one shown beside it', async () => {
  const { saltBaseFactor } = await import('../../lib/salt-base-factor-v1629.js');
  const onlyLabel = saltBaseFactor({ labelA: '50', labelB: '40.1', quantity: '100', quantityOf: 'b' });
  assert.equal(onlyLabel.basis, 'label');
  assert.equal(onlyLabel.factorAoverB, 1.24688);
  assert.equal(onlyLabel.quantityA, 124.688);
  const both = saltBaseFactor({ labelA: '50', labelB: '40.1', aMw: '467.6', bMw: '375.3' });
  assert.equal(both.factorAoverB, 1.24688, 'the label wins');
  assert.equal(both.factorFromFormulas, 1.24594);
  assert.equal(saltBaseFactor({ labelA: '50' }).valid, false, 'one label number alone is refused');
  assert.equal(saltBaseFactor({ aMw: '467.6', bMw: '375.3' }).basis, 'formulas');
});
