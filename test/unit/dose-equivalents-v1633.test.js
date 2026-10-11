// spec-v1633 tools 19 and 20: omeprazole and fluoxetine equivalents from two papers' abstracts.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ppiOmeprazoleEquivalent as ppi, PPIS } from '../../lib/ppi-omeprazole-equivalent-v1633.js';
import { antidepressantFluoxetineEquivalent as ad, EQUIVALENTS, DRUGS } from '../../lib/antidepressant-fluoxetine-equivalent-v1633.js';

test('PPI potencies are the paper\'s, and dexlansoprazole is not offered', () => {
  assert.deepEqual(PPIS.map((p) => [p.value, p.potency]), [['pantoprazole', 0.23], ['lansoprazole', 0.9], ['omeprazole', 1], ['esomeprazole', 1.6], ['rabeprazole', 1.82]]);
  assert.equal(PPIS.some((p) => p.value === 'dexlansoprazole'), false);
});

test('omeprazole equivalent is dose times potency; a target divides by its own', () => {
  assert.equal(ppi({ ppi: 'pantoprazole', dailyDose: 40 }).omeprazoleEquivalentMg, 9.2);
  assert.equal(ppi({ ppi: 'esomeprazole', dailyDose: 40 }).omeprazoleEquivalentMg, 64);
  assert.equal(ppi({ ppi: 'omeprazole', dailyDose: 20 }).omeprazoleEquivalentMg, 20);
  const r = ppi({ ppi: 'pantoprazole', dailyDose: 40, target: 'esomeprazole' });
  assert.deepEqual([r.omeprazoleEquivalentMg, r.targetDoseMg], [9.2, 5.75]);
  assert.match(r.notes.join(' '), /not rounded to a marketed strength/);
  assert.match(r.note, /view it with caution/);
  assert.match(r.notes.join(' '), /1\.9-fold higher dose/);
});

test('PPI refusals', () => {
  assert.match(ppi({}).message, /^Choose the proton-pump inhibitor/);
  assert.match(ppi({ ppi: 'omeprazole' }).message, /^Enter the daily dose/);
  assert.match(ppi({ ppi: 'omeprazole', dailyDose: 20, target: 'omeprazole' }).message, /same drug/);
  assert.match(ppi({ ppi: 'omeprazole', dailyDose: 20, target: 'dexlansoprazole' }).message, /from the list/);
});

test('fluoxetine equivalents: the 22 doses equal to fluoxetine 40 mg a day', () => {
  assert.equal(EQUIVALENTS.length, 23); // fluoxetine itself and 22 others
  assert.deepEqual(Object.fromEntries(EQUIVALENTS), { fluoxetine: 40, paroxetine: 34, agomelatine: 53.2, amitriptyline: 122.3, bupropion: 348.5, clomipramine: 116.1, desipramine: 196.3, dothiepin: 154.8, doxepin: 140.1, escitalopram: 18, fluvoxamine: 143.3, imipramine: 137.2, lofepramine: 250.2, maprotiline: 118, mianserin: 101.1, mirtazapine: 50.9, moclobemide: 575.2, nefazodone: 535.2, nortriptyline: 100.9, reboxetine: 11.5, sertraline: 98.5, trazodone: 401.4, venlafaxine: 149.4 });
  for (const missing of ['citalopram', 'duloxetine', 'vortioxetine']) assert.equal(DRUGS.some((d) => d.value === missing), false, missing);
});

test('fluoxetine equivalent is dose times 40 over the equivalent dose', () => {
  for (const [drug, e] of EQUIVALENTS) assert.ok(Math.abs(ad({ drug, dailyDose: e }).fluoxetineEquivalentMg - 40) < 0.01, drug);
  assert.equal(ad({ drug: 'sertraline', dailyDose: 197 }).fluoxetineEquivalentMg, 80);
  assert.equal(ad({ drug: 'escitalopram', dailyDose: 9 }).fluoxetineEquivalentMg, 20);
  const dox = ad({ drug: 'doxepin', dailyDose: 140.1 });
  assert.equal(dox.abnormal, true);
  assert.match(dox.notes.join(' '), /except doxepin/);
  assert.equal(ad({ drug: 'sertraline', dailyDose: 100 }).abnormal, false);
  assert.match(ad({ drug: 'sertraline', dailyDose: 100 }).note, /not a plan for switching or cross-tapering/);
});

test('antidepressant refusals', () => {
  assert.match(ad({}).message, /^Choose the antidepressant/);
  assert.match(ad({ drug: 'citalopram', dailyDose: 20 }).message, /citalopram, duloxetine and vortioxetine are not among them/);
  assert.match(ad({ drug: 'sertraline' }).message, /^Enter the daily dose/);
});
