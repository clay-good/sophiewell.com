// spec-v1660: genetic counseling risk arithmetic. Hardy 1908 for the carrier frequency, Wright 1922 for the
// coefficients, and Bayes' theorem for the rest.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseProbability, oneIn, bayes } from '../../lib/bayes-table.js';
import { hardyWeinbergCarrier as hw } from '../../lib/hardy-weinberg-carrier-v1660.js';
import { residualCarrierRisk as res } from '../../lib/residual-carrier-risk-v1660.js';
import { recessiveCoupleRisk as couple } from '../../lib/recessive-couple-risk-v1660.js';
import { xLinkedBayesRisk as xl } from '../../lib/x-linked-bayes-risk-v1660.js';
import { coefficientOfRelationship as cor } from '../../lib/coefficient-of-relationship-v1660.js';
import { bayesRiskTable as table } from '../../lib/bayes-risk-table-v1660.js';

test('probabilities parse as decimals, percents, fractions and 1 in N', () => {
  assert.equal(parseProbability('1 in 58'), 1 / 58);
  assert.equal(parseProbability('1/58'), 1 / 58);
  assert.equal(parseProbability('91%'), 0.91);
  assert.equal(parseProbability('0.5'), 0.5);
  assert.equal(parseProbability(''), null);
  assert.ok(Number.isNaN(parseProbability('abc')));
  assert.equal(oneIn(1 / 634.3), '1 in 634');
  assert.equal(bayes([{ name: 'a', prior: 0, conditionals: [1] }, { name: 'b', prior: 1, conditionals: [0] }]).error !== undefined, true);
});

test('Hardy-Weinberg: 1 in 2,500 gives q 0.02 and 2pq 0.0392', () => {
  const r = hw({ from: 'incidence', incidence: '1 in 2500' });
  assert.equal(r.q, 0.02);
  assert.equal(r.p, 0.98);
  assert.equal(r.carrierFrequency, 0.0392);
  assert.equal(hw({ from: 'allele', alleleFrequency: '0.02' }).carrierFrequency, 0.0392);
  assert.match(hw({ incidence: '1 in 2500' }).message, /^Choose/);
  assert.equal(hw({ from: 'incidence', incidence: '1' }).valid, false);
  assert.equal(hw({ from: 'incidence', incidence: '2' }).valid, false);
});

test('residual risk: CF 1/58 and DR 91% give 1 in 634', () => {
  const r = res({ carrierFrequency: '1/58', detectionRate: '91%' });
  assert.equal(r.bandLabel, '1 in 634');
  assert.ok(r.notes[0].startsWith('Carrier: prior'));
  assert.equal(res({ carrierFrequency: '1/58', detectionRate: '100%' }).valid, false);
  assert.match(res({ detectionRate: '91%' }).message, /prior carrier frequency/);
});

test('couple risk: the product times 1/4; two confirmed carriers', () => {
  assert.equal(couple({ riskA: '1', riskB: '1' }).risk, 0.25);
  assert.equal(couple({ riskA: '1/25', riskB: '1/25' }).bandLabel, '1 in 2,500');
  assert.equal(couple({ riskA: '1.2', riskB: '1' }).valid, false);
  assert.match(couple({ riskA: '1' }).message, /partner B/);
});

test('X-linked: a prior of 1/2 and three unaffected sons gives 1/9', () => {
  const r = xl({ prior: '1/2', unaffectedSons: '3' });
  assert.equal(r.posterior, Number((1 / 9).toPrecision(4)));
  assert.equal(xl({ prior: '1/2', unaffectedSons: '0' }).posterior, 0.5);
  assert.ok(xl({ prior: '1/2', unaffectedSons: '1', detectionRate: '0.9' }).posterior < 1 / 3);
  assert.equal(xl({ prior: '1/2', unaffectedSons: '1.5' }).valid, false);
});

test('Wright: the coefficients from the path rule', () => {
  const F = (rel) => cor({ relationship: rel }).inbreeding;
  assert.equal(F('first-cousins'), 1 / 16);
  assert.equal(F('second-cousins'), 1 / 64);
  assert.equal(F('uncle-niece'), 1 / 8);
  assert.equal(F('half-siblings'), 1 / 8);
  assert.equal(F('double-first-cousins'), 1 / 8);
  assert.equal(F('first-cousins-once-removed'), 1 / 32);
  assert.equal(F('half-first-cousins'), 1 / 32);
  assert.equal(cor({ relationship: 'custom', paths: '2, 2\n2, 2' }).inbreeding, 1 / 16);
  const q = cor({ relationship: 'first-cousins', alleleFrequency: '0.01' });
  assert.ok(q.notes.some((n) => /0\.0007188/.test(n)));
  assert.match(cor({ relationship: 'custom', paths: '0, 2' }).message, /Line 1/);
  assert.equal(cor({}).valid, false);
});

test('Bayes table: matches the X-linked tool; priors must sum to 1 unless normalized', () => {
  const r = table({ hypotheses: 'Carrier, 1/2, 1/2, 1/2, 1/2\nNot a carrier, 1/2, 1, 1, 1' });
  assert.equal(Number(r.posteriors[0].posterior.toPrecision(4)), Number((1 / 9).toPrecision(4)));
  assert.match(table({ hypotheses: 'A, 0.5, 1\nB, 0.6, 1' }).message, /add up to 1.1/);
  assert.equal(table({ hypotheses: 'A, 0.5, 1\nB, 0.6, 1', normalize: 'yes' }).valid, true);
  assert.match(table({ hypotheses: 'A, 0.5, 1\nB, 0.5' }).message, /same number/);
  assert.match(table({ hypotheses: 'A, 0.5, 1.5\nB, 0.5, 1' }).message, /between 0 and 1/);
});
