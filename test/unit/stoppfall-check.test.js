// spec-v1634 tool 13: STOPPFall (Seppala 2021).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { stoppfallCheck as d, CLASSES } from '../../lib/stoppfall-check-v1634.js';

const all = (a, extra = {}) => ({ ...Object.fromEntries(CLASSES.map((c) => [c.arg, a])), ...extra });

test('the 14 classes the panel included', () => {
  assert.deepEqual(CLASSES.map((c) => c.text), ['Benzodiazepines', 'Benzodiazepine-related drugs', 'Antipsychotics', 'Antidepressants', 'Opioids', 'Antiepileptics', 'Anticholinergics', 'Diuretics', 'Alpha-blockers used as antihypertensives', 'Alpha-blockers for prostate hyperplasia', 'Centrally-acting antihypertensives', 'Antihistamines', 'Vasodilators used in cardiac diseases', 'Medications for overactive bladder and urge incontinence']);
});

test('the classes present are listed and counted; there is no score band', () => {
  const r = d(all('no', { opioids: 'yes', diuretics: 'yes' }));
  assert.deepEqual([r.count, r.classes], [2, ['Opioids', 'Diuretics']]);
  assert.equal(r.bandLabel, '2 of 14 classes');
  assert.equal(d(all('yes')).count, 14);
  const none = d(all('no'));
  assert.deepEqual([none.count, none.abnormal], [0, false]);
  assert.match(none.note, /no score and no cutoff/);
  assert.match(none.note, /does not mean no drug is contributing/);
  assert.match(d(all('no', { opioids: 'yes' })).band, /^1 of the 14 STOPPFall drug classes is present/);
});

test('every class is needed', () => {
  assert.match(d({}).message, /^Choose yes or no: benzodiazepines/);
  const p = all('no'); delete p.bladderDrugs;
  assert.match(d(p).message, /^Choose yes or no: medications for overactive bladder/);
  assert.equal(d(null).valid, false);
});
