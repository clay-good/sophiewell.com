// spec-v12 §3.4.3 wave 12-4: Maddrey DF + Lille Model boundary
// examples per the shipping contract in spec-v12 §5.
// Maddrey: Maddrey WC, et al. Gastroenterology. 1978;75(2):193-199.
// Lille:   Louvet A, et al. Hepatology. 2007;45(6):1348-1354.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { maddreyDf, lille } from '../../lib/scoring-v4.js';

// ----- Maddrey DF -----------------------------------------------------

test('maddreyDf low edge: PT 13, control 12, bili 1 -> 5.6 (not severe)', () => {
  const r = maddreyDf({ patientPtSec: 13, controlPtSec: 12, bilirubinMgDl: 1 });
  assert.ok(Math.abs(r.df - 5.6) < 1e-9);
  assert.equal(r.severe, false);
  assert.match(r.band, /not in the severe/);
});

test('maddreyDf mid: PT 20, control 12, bili 10 -> 46.8 (severe)', () => {
  const r = maddreyDf({ patientPtSec: 20, controlPtSec: 12, bilirubinMgDl: 10 });
  assert.ok(Math.abs(r.df - 46.8) < 1e-9);
  assert.equal(r.severe, true);
  assert.match(r.band, /severe alcoholic hepatitis/);
});

test('maddreyDf high edge: PT 30, control 12, bili 20 -> 102.8', () => {
  const r = maddreyDf({ patientPtSec: 30, controlPtSec: 12, bilirubinMgDl: 20 });
  assert.ok(Math.abs(r.df - 102.8) < 1e-9);
  assert.equal(r.severe, true);
});

test('maddreyDf cutoff boundary: DF exactly 32 -> severe', () => {
  // 4.6 * (PT-control) + bili = 32 -> e.g., PT 18.957, control 12, bili 0
  const r = maddreyDf({ patientPtSec: 18.957, controlPtSec: 12, bilirubinMgDl: 0 });
  assert.ok(r.df >= 31.99 && r.df <= 32.01);
  assert.equal(r.severe, true);
});

// ----- Lille Model ----------------------------------------------------

test('lille low (responder): bili drops 10 -> 6 with otherwise modest disease', () => {
  const r = lille({ ageYears: 50, albuminGDl: 3.0, creatinineMgDl: 0.9,
    bilirubinDay0MgDl: 10, bilirubinDay7MgDl: 6, ptSec: 20 });
  assert.ok(r.score < 0.45);
  assert.equal(r.nonResponder, false);
  // Hand-computed expected score ~ 0.085 within 0.5%.
  assert.ok(Math.abs(r.score - 0.0852) < 0.005);
});

test('lille high (non-responder): renal insufficiency, no bili drop', () => {
  const r = lille({ ageYears: 65, albuminGDl: 2.0, creatinineMgDl: 1.5,
    bilirubinDay0MgDl: 15, bilirubinDay7MgDl: 15, ptSec: 25 });
  assert.ok(r.score >= 0.45);
  assert.equal(r.nonResponder, true);
});

test('lille rejects zero PT', () => {
  assert.throws(() => lille({ ageYears: 50, albuminGDl: 3.0, creatinineMgDl: 0.9,
    bilirubinDay0MgDl: 10, bilirubinDay7MgDl: 6, ptSec: 0 }), /ptSec/);
});
