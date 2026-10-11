// spec-v1634 tool 7: RIOSORD (Zedler 2015, veterans; Zedler 2018, commercially insured).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { riosord as d, ITEMS } from '../../lib/riosord-v1634.js';

const all = (version, a, extra = {}) => ({ version, mme: 0, ...Object.fromEntries(ITEMS.map((i) => [i.arg, a])), ...extra });

test('the points are the tables\', and the maxima are 115 and 146', () => {
  assert.deepEqual(Object.fromEntries(ITEMS.map((i) => [i.arg, i.points])), {
    substanceUse: [15, 25], hepatitis: [9, null], bipolar: [7, 10], pulmonary: [5, 5], kidney: [5, 8], trauma: [4, null], sleepApnea: [3, null],
    stroke: [null, 9], heartFailure: [null, 7], pancreatic: [null, 7], headache: [null, 5], erla: [9, 5], methadone: [9, 10], oxycodone: [3, null],
    fentanyl: [null, 13], morphine: [null, 11], hydromorphone: [null, 7], antidepressant: [7, 8], benzodiazepine: [4, 9], edVisit: [11, null], hospitalized: [8, null],
  });
  assert.equal(d(all('vha', 'yes', { mme: 100 })).score, 115);
  assert.equal(d(all('commercial', 'yes', { mme: 100 })).score, 146);
  assert.equal(d(all('vha', 'no')).score, 0);
});

test('the dose bands: three in the veterans version, one in the commercial', () => {
  const v = (mme) => d(all('vha', 'no', { mme })).score;
  assert.deepEqual([19.9, 20, 49.9, 50, 99.9, 100].map(v), [0, 5, 5, 9, 9, 16]);
  const c = (mme) => d(all('commercial', 'no', { mme })).score;
  assert.deepEqual([99.9, 100].map(c), [0, 7]);
});

test('risk class edges', () => {
  // Veterans: 24 | 25 (substance use 15 + hepatitis 9 = 24; + sleep apnea 3 = 27).
  const v24 = d(all('vha', 'no', { substanceUse: 'yes', hepatitis: 'yes' }));
  assert.deepEqual([v24.score, v24.riskClass, v24.probabilityPercent], [24, 1, 3]);
  const v25 = d(all('vha', 'no', { mme: 100, hepatitis: 'yes' }));
  assert.deepEqual([v25.score, v25.riskClass, v25.probabilityPercent], [25, 2, 14]);
  const v67 = d(all('vha', 'yes', { mme: 100 }));
  assert.deepEqual([v67.riskClass, v67.probabilityPercent], [10, 94]);
  // Commercial: 4 | 5, 41 | 42.
  const c0 = d(all('commercial', 'no'));
  assert.deepEqual([c0.score, c0.riskClass, c0.probabilityPercent], [0, 1, 1.9]);
  const c5 = d(all('commercial', 'no', { pulmonary: 'yes' }));
  assert.deepEqual([c5.score, c5.riskClass, c5.probabilityPercent], [5, 2, 4.8]);
  const c41 = d(all('commercial', 'no', { substanceUse: 'yes', kidney: 'yes', antidepressant: 'yes' }));
  assert.deepEqual([c41.score, c41.riskClass], [41, 6]);
  const c42 = d(all('commercial', 'no', { substanceUse: 'yes', bipolar: 'yes', heartFailure: 'yes' }));
  assert.deepEqual([c42.score, c42.riskClass, c42.probabilityPercent], [42, 7, 83.4]);
});

test('methadone also scores the ER/LA item, once', () => {
  const m = d(all('vha', 'no', { methadone: 'yes' }));
  assert.equal(m.score, 18);
  assert.match(m.notes.join(' '), /Methadone is long-acting/);
  assert.equal(d(all('vha', 'no', { methadone: 'yes', erla: 'yes' })).score, 18);
  assert.equal(d(all('commercial', 'no', { methadone: 'yes' })).score, 15);
  // Short-acting fentanyl scores the ingredient only; the note says what an ER product adds.
  const f = d(all('commercial', 'no', { fentanyl: 'yes' }));
  assert.equal(f.score, 13);
  assert.match(f.notes.join(' '), /short-acting fentanyl scores the ingredient only/);
});

test('items of the other version are ignored, and the caveat is always printed', () => {
  const r = d({ ...all('vha', 'no'), stroke: 'yes', fentanyl: 'yes', heartFailure: 'yes' });
  assert.equal(r.score, 0);
  assert.match(r.notes.join(' '), /not the incidence in a population/);
  assert.equal(r.abnormal, false);
});

test('an unanswered item is asked for, not counted as no', () => {
  assert.match(d({}).message, /^Choose the version/);
  const partial = all('vha', 'no'); delete partial.kidney;
  assert.match(d(partial).message, /^Choose yes or no: kidney disease/);
  const noDose = all('vha', 'no'); delete noDose.mme;
  assert.match(d(noDose).message, /^Enter the maximum prescribed opioid dose/);
  const c = all('commercial', 'no'); delete c.hepatitis; delete c.oxycodone;
  assert.equal(d(c).valid, true);
  assert.equal(d(all('vha', 'no', { mme: -1 })).valid, false);
  assert.equal(d(null).valid, false);
});
