// spec-v229: worked examples for the CBC-derived count & inflammation indices.
// Formulas and bands spec-v97 cross-verified (see module header for source pairs).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { aec, nlr, plr, sii } from '../../lib/hematology-v229.js';

// AEC = WBC(10^3/uL) x eos% x 10.
test('aec: mild eosinophilia band', () => {
  const r = aec({ wbc: 8, eosPct: 12 }); // 960
  assert.equal(r.score, 960);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /mild eosinophilia/);
});
test('aec: normal band', () => {
  const r = aec({ wbc: 6, eosPct: 2 }); // 120
  assert.equal(r.score, 120);
  assert.equal(r.abnormal, false);
});
test('aec: moderate flags hypereosinophilia', () => {
  const r = aec({ wbc: 10, eosPct: 20 }); // 2000
  assert.equal(r.score, 2000);
  assert.match(r.band, /moderate/);
  assert.match(r.detail, /hypereosinophilia/);
});
test('aec: severe band', () => {
  assert.match(aec({ wbc: 30, eosPct: 20 }).band, /severe/); // 6000
});
test('aec: invalid without inputs', () => {
  assert.equal(aec({ wbc: 8 }).valid, false);
});

// NLR = ANC / ALC.
test('nlr: elevated above 3', () => {
  const r = nlr({ anc: 6, alc: 1.5 }); // 4
  assert.equal(r.score, 4);
  assert.equal(r.abnormal, true);
});
test('nlr: within reference', () => {
  const r = nlr({ anc: 3, alc: 2 }); // 1.5
  assert.equal(r.score, 1.5);
  assert.equal(r.abnormal, false);
});
test('nlr: invalid without inputs', () => {
  assert.equal(nlr({ anc: 6 }).valid, false);
});

// PLR = platelets / ALC, read against the Lee 2018 healthy reference interval
// 46.8-218.0. spec-v964: the old cut at 180 appeared in no cited source and sat
// inside that interval, so 180-218 read as elevated when it is not.
test('plr: 200 is inside the healthy reference interval, not elevated', () => {
  const r = plr({ plt: 300, alc: 1.5 }); // 200
  assert.equal(r.score, 200);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /within the healthy reference interval \(46\.8-218\.0\)/);
});
test('plr: above the interval', () => {
  const r = plr({ plt: 300, alc: 1.2 }); // 250
  assert.equal(r.score, 250);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /above the healthy reference interval/);
});
test('plr: below the interval', () => {
  const r = plr({ plt: 90, alc: 3 }); // 30
  assert.equal(r.score, 30);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /below the healthy reference interval/);
});
test('plr: within range', () => {
  const r = plr({ plt: 200, alc: 2 }); // 100
  assert.equal(r.score, 100);
  assert.equal(r.abnormal, false);
});
test('plr: states that there is no validated general cut-off', () => {
  assert.match(plr({ plt: 200, alc: 2 }).note, /no validated general cut-off/);
});

// SII = platelets x ANC / ALC.
test('sii: composite value', () => {
  const r = sii({ plt: 300, anc: 6, alc: 1.5 }); // 1200
  assert.equal(r.score, 1200);
  assert.equal(r.abnormal, false);
});
test('sii: invalid without all three', () => {
  assert.equal(sii({ plt: 300, anc: 6 }).valid, false);
});
