// spec-v94 §2.4: MASCC risk index for febrile neutropenia (Klastersky 2000).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mascc } from '../../lib/hemonc-v94.js';

test('worked example: maximal favorable profile scores 26, low risk', () => {
  const r = mascc({ burden: 'no-mild', noHypotension: 'yes', noCopd: 'yes', solidNoFungal: 'yes', noDehydration: 'yes', outpatient: 'yes', ageUnder60: 'yes' });
  assert.equal(r.total, 26);
  assert.equal(r.lowRisk, true);
  assert.match(r.band, /LOW risk/);
});

test('low-risk cut: 21 is low, 20 is not low', () => {
  // 5 + 5 + 4 + 4 + 3 = 21.
  const low = mascc({ burden: 'no-mild', noHypotension: 'yes', noCopd: 'yes', solidNoFungal: 'yes', noDehydration: 'yes' });
  assert.equal(low.total, 21);
  assert.equal(low.lowRisk, true);
  // moderate burden (3) + 5 + 4 + 4 + 3 + 0 + 0 ... build exactly 20.
  const notLow = mascc({ burden: 'moderate', noHypotension: 'yes', noCopd: 'yes', solidNoFungal: 'yes', noDehydration: 'yes' });
  assert.equal(notLow.total, 19);
  assert.equal(notLow.lowRisk, false);
});

test('exactly 20 is not low risk', () => {
  // no-mild 5 + no-hypotension 5 + no-copd 4 + solid 4 + age 2 = 20.
  const r = mascc({ burden: 'no-mild', noHypotension: 'yes', noCopd: 'yes', solidNoFungal: 'yes', ageUnder60: 'yes' });
  assert.equal(r.total, 20);
  assert.equal(r.lowRisk, false);
});

test('severe burden contributes zero', () => {
  assert.equal(mascc({ burden: 'severe' }).items.find((i) => i.label === 'Burden of illness').points, 0);
});
