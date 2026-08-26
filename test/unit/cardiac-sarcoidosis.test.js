// spec-v791: HRS 2014 cardiac sarcoidosis criteria.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { cardiacSarcoidosis } from '../../lib/cardiac-sarcoidosis-v791.js';

const FINDINGS = ['steroidResponsive', 'lowEf', 'sustainedVt', 'heartBlock', 'petUptake', 'cmrLge', 'galliumUptake'];

test('nothing selected -> criteria not met, and all three clinical parts are named', () => {
  const r = cardiacSarcoidosis({});
  assert.equal(r.valid, true);
  assert.equal(r.tier, 'not-met');
  assert.equal(r.missing.length, 3);
  assert.equal(r.abnormal, false);
});

test('the histological pathway stands alone: biopsy alone is definite', () => {
  const r = cardiacSarcoidosis({ myocardialGranuloma: true });
  assert.equal(r.tier, 'definite');
  assert.equal(r.pathway, 'histological');
  assert.deepEqual(r.missing, []);
});

test('the clinical pathway needs all three parts', () => {
  const full = { extracardiacSarcoid: true, cmrLge: true, otherCausesExcluded: true };
  assert.equal(cardiacSarcoidosis(full).tier, 'probable');

  const noExclusion = { extracardiacSarcoid: true, cmrLge: true };
  assert.equal(cardiacSarcoidosis(noExclusion).tier, 'not-met');
  assert.deepEqual(cardiacSarcoidosis(noExclusion).missing, ['reasonable exclusion of other causes']);

  const noExtracardiac = { cmrLge: true, otherCausesExcluded: true };
  assert.equal(cardiacSarcoidosis(noExtracardiac).tier, 'not-met');

  const noFinding = { extracardiacSarcoid: true, otherCausesExcluded: true };
  assert.equal(cardiacSarcoidosis(noFinding).tier, 'not-met');
});

test('any single qualifying cardiac finding satisfies part b', () => {
  for (const f of FINDINGS) {
    const r = cardiacSarcoidosis({ extracardiacSarcoid: true, otherCausesExcluded: true, [f]: true });
    assert.equal(r.tier, 'probable', f);
    assert.equal(r.cardiacFindings.length, 1, f);
  }
});

test('cardiac findings alone, however many, do not meet the criteria', () => {
  const o = {};
  for (const f of FINDINGS) o[f] = true;
  const r = cardiacSarcoidosis(o);
  assert.equal(r.tier, 'not-met');
  assert.equal(r.cardiacFindings.length, 7);
});

test('a biopsy result outranks an incomplete clinical pathway', () => {
  const r = cardiacSarcoidosis({ myocardialGranuloma: true, cmrLge: true });
  assert.equal(r.tier, 'definite');
});
