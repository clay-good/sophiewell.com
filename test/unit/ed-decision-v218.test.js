// spec-v218: worked examples for the ED / trauma / infection decision instruments.
// Point systems spec-v97 cross-verified (see module header for source pairs).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  faint, nexusHead, handoc, denova, icmPji, airScore, adultAppendicitis,
} from '../../lib/ed-decision-v218.js';

test('faint: NT-proBNP counts double', () => {
  const r = faint({ heartFailure: true, ntprobnp: true });
  assert.equal(r.score, 3);
  assert.equal(r.abnormal, true);
});
test('faint: 0 is low risk', () => {
  const r = faint({});
  assert.equal(r.score, 0);
  assert.equal(r.abnormal, false);
});

test('nexus-head: any criterion means CT', () => {
  const r = nexusHead({ ageOver65: true });
  assert.equal(r.ctIndicated, true);
});
test('nexus-head: all absent = deferrable', () => {
  const r = nexusHead({});
  assert.equal(r.ctIndicated, false);
  assert.equal(r.abnormal, false);
});

test('handoc: >= 3 recommends echo', () => {
  const r = handoc({ murmur: true, aetiology: '1', cultures2: true });
  assert.equal(r.score, 3);
  assert.match(r.band, /recommended/);
});
test('handoc: S. anginosus subtracts', () => {
  const r = handoc({ aetiology: '2', community: true });
  assert.equal(r.score, 0); // -1 + 1
});

test('denova: >= 3 recommends echo', () => {
  const r = denova({ duration7: true, cultures2: true, murmur: true });
  assert.equal(r.score, 3);
  assert.match(r.band, /recommended/);
});

test('icm-pji: major means infected', () => {
  const r = icmPji({ major: true });
  assert.equal(r.infected, true);
});
test('icm-pji: minor sum >= 6 infected', () => {
  const r = icmPji({ synovialWbcLe: true, alphaDefensin: true }); // 3+3
  assert.equal(r.score, 6);
  assert.equal(r.infected, true);
});
test('icm-pji: inconclusive band', () => {
  const r = icmPji({ crpDdimer: true }); // 2
  assert.match(r.band, /inconclusive/);
});

test('air: high band', () => {
  const r = airScore({ vomiting: true, rifPain: true, rebound: '2', fever: true, wbc: 16, pmnPct: 86, crp: 60 });
  assert.equal(r.score, 11);
  assert.match(r.band, /high/);
});
test('air: low band', () => {
  const r = airScore({ wbc: 8, pmnPct: 60, crp: 5 });
  assert.equal(r.score, 0);
  assert.equal(r.abnormal, false);
});
test('air: invalid without labs', () => { assert.equal(airScore({ vomiting: true }).valid, false); });

test('aas: high probability with branching', () => {
  const r = adultAppendicitis({ rlqPain: true, relocation: true, tenderness: true, age: 55, guarding: '4', wbc: 15, pmnPct: 84, crp: 100 });
  assert.equal(r.score, 19);
  assert.match(r.band, /high/);
});
test('aas: young woman tenderness scores 1', () => {
  // WBC 7.0 is below the 7.2 band, so only the +1 tenderness counts.
  const r = adultAppendicitis({ tenderness: true, female: true, age: 30, wbc: 7.0, pmnPct: 50, crp: 2 });
  assert.equal(r.score, 1);
});
test('aas: CRP band depends on duration', () => {
  // WBC 7.0 scores 0; >= 24 h CRP 100 -> 2, under 24 h CRP 100 -> 1
  const over = adultAppendicitis({ age: 40, wbc: 7.0, pmnPct: 50, crp: 100, durationOver24h: true });
  const under = adultAppendicitis({ age: 40, wbc: 7.0, pmnPct: 50, crp: 100 });
  assert.equal(over.score, 2);
  assert.equal(under.score, 1);
});
