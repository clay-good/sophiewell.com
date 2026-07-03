// spec-v225: worked examples for the obstetrics & gynecology instruments. Point
// systems spec-v97 cross-verified (see module header for source pairs).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  nugent, amsel, ferrimanGallwey, pbac, thompsonHie, menopauseRating, kupperman,
} from '../../lib/obgyn-v225.js';

test('nugent: BV band', () => {
  const r = nugent({ lactobacillus: '4', gardnerella: '4', mobiluncus: '1' });
  assert.equal(r.score, 9);
  assert.match(r.band, /bacterial vaginosis/);
});
test('nugent: normal', () => {
  assert.equal(nugent({ lactobacillus: '0', gardnerella: '0' }).abnormal, false);
});

test('amsel: BV at 3', () => {
  const r = amsel({ discharge: true, ph: true, whiff: true });
  assert.equal(r.score, 3);
  assert.equal(r.abnormal, true);
});

test('ferriman-gallwey: hirsutism at 8', () => {
  const r = ferrimanGallwey({ upperLip: '2', chin: '2', chest: '2', thigh: '2' });
  assert.equal(r.score, 8);
  assert.equal(r.abnormal, true);
});
test('ferriman-gallwey: below cutoff', () => {
  assert.equal(ferrimanGallwey({ upperLip: '2' }).abnormal, false);
});

test('pbac: weighted tally > 100', () => {
  const r = pbac({ soakedPads: 5, moderatePads: 4, largeClots: 2 }); // 100+20+10
  assert.equal(r.score, 130);
  assert.equal(r.abnormal, true);
});
test('pbac: below heavy range', () => {
  assert.equal(pbac({ lightPads: 10 }).abnormal, false);
});

test('thompson: mild band', () => {
  const r = thompsonHie({ tone: '2', consciousness: '2', posture: '2', respiration: '2' });
  assert.equal(r.score, 8);
  assert.match(r.band, /mild/);
});
test('thompson: severe at 15', () => {
  const r = thompsonHie({ tone: '3', consciousness: '2', seizures: '2', posture: '3', moro: '2', respiration: '3' });
  assert.equal(r.score, 15);
  assert.match(r.band, /severe/);
});

test('mrs: moderate band', () => {
  const r = menopauseRating({ hotFlushes: '3', sleepProblems: '2', depressive: '2', irritability: '2' });
  assert.equal(r.score, 9);
  assert.match(r.band, /moderate/);
});

test('kupperman: weighted moderate', () => {
  const r = kupperman({ hotFlushes: '3', insomnia: '2', nervousness: '2' }); // 12+4+4
  assert.equal(r.score, 20);
  assert.match(r.band, /moderate/);
});
test('kupperman: mild below 15', () => {
  assert.equal(kupperman({ headache: '3' }).abnormal, true); // 3, still mild band
  assert.match(kupperman({ headache: '3' }).band, /mild/);
});
