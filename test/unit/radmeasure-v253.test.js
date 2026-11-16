// spec-v253: worked examples for the radiologic measurements & scores. Formulas /
// point systems spec-v97 verified (NASCET 1991; Raj 2014; Genant 1993; Lambert).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nascetCarotidStenosis, helsinkiCtScore, genantVertebralFracture, testicularVolume } from '../../lib/radmeasure-v253.js';

test('nascet: moderate band', () => {
  const r = nascetCarotidStenosis({ narrowest: 3, distal: 8 });
  assert.equal(r.score, 62.5);
  assert.match(r.band, /moderate/);
});
test('nascet: severe >= 70%', () => {
  const r = nascetCarotidStenosis({ narrowest: 2, distal: 8 }); // 75%
  assert.equal(r.score, 75);
  assert.equal(r.abnormal, true);
});

test('helsinki: sum with IVH and cisterns', () => {
  const r = helsinkiCtScore({ massType: 2, ivh: true, cisterns: 1 }); // 2+3+1
  assert.equal(r.score, 6);
  assert.equal(r.abnormal, true);
});
test('helsinki: epidural subtracts', () => {
  const r = helsinkiCtScore({ massType: -3 });
  assert.equal(r.score, -3);
});

test('genant: grade 2 moderate', () => {
  const r = genantVertebralFracture({ heightLoss: 30 });
  assert.equal(r.score, 2);
  assert.equal(r.abnormal, true);
});
test('genant: grade 0 no fracture', () => {
  const r = genantVertebralFracture({ heightLoss: 10 });
  assert.equal(r.score, 0);
  assert.equal(r.abnormal, false);
});

test('testicular-volume: Lambert 0.71', () => {
  const r = testicularVolume({ length: 4, width: 3, height: 2.5 });
  assert.equal(r.score, 21.3);
});

// spec-v1746: an entered value outside the range read as blank and was asked for again.
test('spec-v1746: genant-vertebral-fracture names the range of an impossible height loss and still asks for a blank one', () => {
  assert.equal(genantVertebralFracture({ heightLoss: 30 }).valid, true);
  const r = genantVertebralFracture({ heightLoss: 999999 });
  assert.equal(r.valid, false);
  assert.match(r.message, /vertebral height loss \(%\) must be between 0 and 100/);
  assert.equal(genantVertebralFracture({ heightLoss: '' }).message, 'Enter the vertebral height loss (%).');
});
