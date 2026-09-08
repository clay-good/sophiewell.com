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

test('spec-v1134: the two surfaces disagreed about an ungraded burden of illness', () => {
  // `pick` fell back to 0, the value of "severe"; the page's select opened on
  // "No or mild symptoms (5)". Same tile, opposite assumption, five points either
  // side of the line between outpatient oral management and admission.
  const straddles = mascc({
    noHypotension: true, noCopd: true, solidNoFungal: true, noDehydration: true,
  });
  assert.equal(straddles.valid, false);
  assert.equal(straddles.burdenStated, false);
  assert.match(straddles.band, /scores between 16 and 21/);
  assert.match(straddles.band, /Grade the burden of illness/);
});

test('spec-v1134: where the burden cannot cross 21, the tile answers', () => {
  // Rule 25. The burden adds 0 to 5, so both ends of that range decide it.
  const low = mascc({ noHypotension: true, noCopd: true });   // 9 to 14, all < 21
  assert.equal(low.valid, true);
  assert.equal(low.lowRisk, false);
  assert.match(low.band, /at least 9/);
  assert.match(low.band, /holds whatever the burden of illness turns out to be/);

  const high = mascc({                                        // 21 already
    noHypotension: true, noCopd: true, solidNoFungal: true,
    noDehydration: true, outpatient: true, ageUnder60: true,
  });
  assert.equal(high.valid, true);
  assert.equal(high.lowRisk, true);
  assert.match(high.band, /at least 21/);

  // Graded, nothing about the reading changes.
  const graded = mascc({
    burden: 'no-mild', noHypotension: true, noCopd: true, solidNoFungal: true,
    noDehydration: true, outpatient: true, ageUnder60: true,
  });
  assert.equal(graded.total, 26);
  assert.equal(graded.burdenStated, true);
  assert.match(graded.band, /^MASCC 26:/);
});
