// spec-v221: worked examples for the pulmonary & critical-care risk scores.
// Point systems spec-v97 cross-verified (see module header for source pairs).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  simplifiedGeneva, scap, corb, resp, ildGap, duBoisIpf, pneumothoraxVolume,
} from '../../lib/pulmonary-risk-v221.js';

test('geneva: HR band plus items', () => {
  const r = simplifiedGeneva({ heartRate: 100, ageOver65: true, malignancy: true }); // 2+1+1
  assert.equal(r.score, 4);
  assert.match(r.band, /likely/);
});
test('geneva: unlikely', () => {
  const r = simplifiedGeneva({ heartRate: 70 });
  assert.equal(r.score, 0);
  assert.equal(r.abnormal, false);
});
test('geneva: invalid without HR', () => { assert.equal(simplifiedGeneva({}).valid, false); });

test('scap: weighted sum, >= 10 high', () => {
  const r = scap({ rrHigh: true, bunHigh: true }); // 9+5
  assert.equal(r.score, 14);
  assert.match(r.band, /high/);
});
test('scap: single major triggers high', () => {
  assert.equal(scap({ sbpLow: true }).score, 11);
});

test('corb: >= 2 severe', () => {
  const r = corb({ confusion: true, oxygen: true });
  assert.equal(r.score, 2);
  assert.equal(r.abnormal, true);
});

test('resp: class from score', () => {
  const r = resp({ ageBand: '-2', mvBand: '3', diagnosis: '3' }); // -2+3+3=4
  assert.equal(r.score, 4);
  assert.equal(r.riskClass, 'II');
});
test('resp: negative modifiers drop class', () => {
  const r = resp({ ageBand: '-3', diagnosis: '0', cns: true }); // -3-7
  assert.equal(r.score, -10);
  assert.equal(r.riskClass, 'V');
});

test('ild-gap: staging', () => {
  const r = ildGap({ subtype: '0', ageBand: '2', fvc: 60, dlcoBand: '1', male: true }); // 0+2+1+1+1
  assert.equal(r.score, 5);
  assert.equal(r.stage, 'III');
});
test('ild-gap: low stage', () => {
  const r = ildGap({ subtype: '-2', ageBand: '0', fvc: 90, dlcoBand: '0', male: false });
  assert.equal(r.stage, 'I');
  assert.equal(r.abnormal, false);
});

test('dubois: high mortality band', () => {
  const r = duBoisIpf({ age: 72, fvc: 60, deltaFvc: -6 }); // 8+13+10
  assert.equal(r.score, 31);
  assert.match(r.band, /high/);
});
test('dubois: invalid without delta FVC', () => { assert.equal(duBoisIpf({ age: 60, fvc: 80 }).valid, false); });

test('pneumothorax: Collins formula', () => {
  const r = pneumothoraxVolume({ apex: 2, midUpper: 3, midLower: 2 }); // 4.2+4.7*7
  assert.equal(r.percent, 37.1);
});
test('pneumothorax: caps at 100', () => {
  const r = pneumothoraxVolume({ apex: 20, midUpper: 20, midLower: 20 });
  assert.equal(r.percent, 100);
});
