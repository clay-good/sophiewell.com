// spec-v1692: the ACMG practice resource's own arithmetic and cautions on residual carrier risk.
// Quotes are from "Screening for autosomal recessive and X-linked conditions during pregnancy and
// preconception: a practice resource of the ACMG", Genet Med 2021;23:1793 (PMC8488021).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { residualCarrierRisk } from '../../lib/residual-carrier-risk-v1660.js';

const run = (cf, dr) => residualCarrierRisk({ carrierFrequency: cf, detectionRate: dr });

test("ACMG's printed product is reported when it differs from the posterior", () => {
  // ACMG: "Population Carrier frequency x (1 - Detection Rate)" = 0.04 x 0.1 = 0.004, 1 in 250.
  // Bayes: 0.004 / (0.004 + 0.96) = 0.004149, 1 in 241.
  const r = run('0.04', '0.9');
  assert.equal(r.residual, 0.004149);
  assert.equal(r.acmgProduct, 0.004);
  assert.match(r.band, /1 in 241/);
  const said = r.notes.find((n) => /ACMG practice resource states this as/.test(n));
  assert.ok(said, 'the source\'s own figure must be on the page');
  assert.match(said, /1 in 250/);
  assert.match(said, /numerator of the same calculation/);
});

test('the two diverge as the carrier frequency grows, which is why both are shown', () => {
  // At a carrier frequency of 1 in 2 the product is 1 in 20 and the posterior 1 in 11.
  const r = run('0.5', '0.9');
  assert.equal(r.acmgProduct, 0.05);
  assert.match(r.band, /1 in 11/);
  assert.ok(r.notes.some((n) => /1 in 20/.test(n)));
});

test('the comparison is printed only when the gap is one a reader would see', () => {
  // The product understates the posterior by about the carrier frequency. At 1 in a million that is
  // 0.0001%, and saying so would be noise -- even though the rendered "1 in N" strings differ
  // (1 in 10,000,000 against 1 in 9,999,991), which is why the rule is relative and not textual.
  const tiny = run('0.000001', '0.9');
  assert.ok(!tiny.notes.some((n) => /ACMG practice resource states this as/.test(n)),
    'an immaterial difference must not be explained');
  const small = run('0.001', '0.9'); // 0.09% understatement
  assert.ok(!small.notes.some((n) => /ACMG practice resource states this as/.test(n)));

  // A carrier frequency of 1 in 25 understates by about 4%, which is worth saying.
  const material = run('0.04', '0.9');
  const said = material.notes.find((n) => /ACMG practice resource states this as/.test(n));
  assert.ok(said);
  assert.match(said, /understates it by about the carrier frequency, 4% here/);
});

test('every result carries the three cautions that bound what the number means', () => {
  const r = run('0.0345', '0.91');
  const all = r.notes.join(' ');
  // "The residual risk to be a carrier for any condition is never zero."
  assert.match(all, /never zero/);
  // Multiplex panels: "It is impractical to provide a precise residual risk ..."
  assert.match(all, /impractical after a multiplex panel/);
  // Reporting: ethnicity, data set, and imprecision for X-linked genes.
  assert.match(all, /self-identified ethnicity/);
  assert.match(all, /imprecise for many X-linked genes/);
});

test('the cautions are present even on a reassuring result', () => {
  // A high detection rate drives the residual risk very low; that is exactly when a reader
  // might read it as a rule-out.
  const r = run('0.0345', '0.999');
  assert.ok(r.residual < 0.0001);
  assert.match(r.notes.join(' '), /never zero/);
  assert.equal(r.abnormal, false);
  assert.match(r.note, /does not rule carrier status out/);
});

test('a detection rate of 100% is still refused rather than reported as zero risk', () => {
  const r = run('0.04', '1');
  assert.equal(r.valid, false);
  assert.match(r.message, /no residual risk to compute/);
});

test('the Bayes table is still the first thing shown, unchanged by the additions', () => {
  const r = run('0.04', '0.9');
  assert.ok(/Carrier/.test(r.notes[0]), `expected the table first, got: ${r.notes[0]}`);
});
