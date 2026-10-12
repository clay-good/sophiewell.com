// spec-v1637 tool 23: 16 CFR 1700.14(a), each row tested at its own operator.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pppaSpecialPackagingCheck as chk, SUBSTANCES } from '../../lib/pppa-special-packaging-check-v1637.js';

const need = (substance, amount, extra = {}) => chk({ substance, amount, ...extra }).required;

test('"more than" rows are not required exactly at the figure; "or more" rows are', () => {
  // more than
  for (const [s, at, over] of [['acetaminophen-oral', 1000, 1000.5], ['ketoprofen', 50, 50.1], ['diphenhydramine-oral', 66, 66.1], ['loperamide-oral', 0.045, 0.046], ['lidocaine', 5, 5.1], ['dibucaine', 0.5, 0.51], ['minoxidil', 14, 14.1], ['methyl-salicylate-liquid', 5, 5.1]]) {
    assert.deepEqual([need(s, at), need(s, over)], [false, true], s);
  }
  // or more
  for (const [s, under, at] of [['ibuprofen-oral', 999, 1000], ['naproxen', 249, 250], ['imidazoline', 0.079, 0.08], ['mouthwash-ethanol', 2.9, 3]]) {
    assert.deepEqual([need(s, under), need(s, at)], [false, true], s);
  }
});

test('the spec\'s own cases', () => {
  // 24 x 325 mg acetaminophen is required; 2 x 500 mg is exactly one gram and is not.
  assert.equal(need('acetaminophen-oral', 24 * 325), true);
  assert.equal(need('acetaminophen-oral', 2 * 500), false);
  // Prednisone 21 x 5 mg = 105 mg is exempt; 22 x 5 mg is not.
  assert.equal(need('rx-prednisone-tablets', 105, { noOtherSubstance: 'yes' }), false);
  assert.equal(need('rx-prednisone-tablets', 110, { noOtherSubstance: 'yes' }), true);
  // Methylprednisolone 21 x 4 mg = 84 mg is exempt.
  assert.equal(need('rx-methylprednisolone-tablets', 84, { noOtherSubstance: 'yes' }), false);
  // Baloxavir 80 mg is exempt.
  assert.equal(need('rx-baloxavir-tablets', 80), false);
  assert.equal(need('rx-baloxavir-tablets', 160), true);
});

test('iron: 250 mg or more AND the concentration floor for the form', () => {
  const iron = (amount, percent, form) => chk({ substance: 'iron-drug-or-supplement', amount, percent, form }).required;
  assert.equal(iron(250, 0.05, 'non-liquid-form'), true);
  assert.equal(iron(249, 5, 'non-liquid-form'), false);
  assert.equal(iron(500, 0.04, 'non-liquid-form'), false);
  assert.equal(iron(500, 0.04, 'liquid-form'), true);
  assert.equal(iron(500, 0.024, 'liquid-form'), false);
  assert.match(chk({ substance: 'iron-drug-or-supplement', amount: 300, percent: 1 }).message, /^Choose liquid or non-liquid/);
});

test('fluoride: the household row needs both tests; the prescription row is exempt on either', () => {
  const house = (amount, percent) => chk({ substance: 'fluoride-household-product', amount, percent }).required;
  assert.deepEqual([house(51, 0.6), house(50, 0.6), house(51, 0.5)], [true, false, false]);
  const rx = (amount, percent) => chk({ substance: 'rx-sodium-fluoride', amount, percent, noOtherSubstance: 'yes' }).required;
  // 110 mg or less is exempt by amount; a larger package at 0.4% is exempt by concentration.
  assert.deepEqual([rx(110), rx(200), rx(200, 0.4), rx(200, 0.6)], [false, true, false, true]);
});

test('an exemption that requires "no other substance" is lost when there is one, and must be answered', () => {
  assert.equal(need('rx-prednisone-tablets', 50, { noOtherSubstance: 'no' }), true);
  assert.match(chk({ substance: 'rx-prednisone-tablets', amount: 50 }).message, /^Choose yes or no: does the package contain no other substance/);
  // Colesevelam's paragraph carries no such condition.
  assert.equal(need('rx-colesevelam-powder', 3750), false);
});

test('always-required rows, named exemptions, and the over-the-counter switch', () => {
  assert.equal(chk({ substance: 'oral-prescription-drug' }).required, true);
  assert.equal(chk({ substance: 'oral-dea-scheduled-drug' }).required, true);
  assert.equal(chk({ substance: 'aspirin-oral' }).required, true);
  assert.equal(chk({ substance: 'rx-nitroglycerin-sublingual' }).required, false);
  assert.equal(chk({ substance: 'otc-switched-oral-ingredient', approvedBefore2002: 'no' }).required, true);
  assert.equal(chk({ substance: 'otc-switched-oral-ingredient', approvedBefore2002: 'yes' }).required, false);
  assert.match(chk({ substance: 'otc-switched-oral-ingredient' }).message, /^Choose yes or no: was every active ingredient/);
});

test('the dispensing exception is for a prescription and does not change the requirement', () => {
  const r = chk({ substance: 'oral-prescription-drug', request: 'purchaser-requests-noncomplying' });
  assert.deepEqual([r.required, r.flag, r.noncomplyingAllowedByRequest], [true, 'required-with-dispensing-exception', true]);
  assert.equal(chk({ substance: 'oral-prescription-drug', request: 'no-request' }).flag, 'special-packaging-required');
  // An over-the-counter row takes no such exception.
  assert.equal(chk({ substance: 'ibuprofen-oral', amount: 2000, request: 'purchaser-requests-noncomplying' }).flag, 'special-packaging-required');
});

test('every row answers or asks, and nothing is defaulted', () => {
  for (const s of SUBSTANCES) {
    const r = chk({ substance: s.value, amount: 1, percent: 1, form: 'liquid-form', noOtherSubstance: 'yes', approvedBefore2002: 'no' });
    assert.equal(r.valid, true, s.value);
    assert.match(r.paragraph, /^16 CFR 1700\.14\(a\)/);
  }
  assert.match(chk({}).message, /^Choose the substance/);
  assert.match(chk({ substance: 'ibuprofen-oral' }).message, /^Enter the total amount in the package/);
});
