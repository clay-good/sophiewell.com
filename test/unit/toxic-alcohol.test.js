// spec-v86 §2.3: osmolar gap + AACT fomepizole-indication boundary examples.
// Osmolality: Smithline N, Gardner KD. JAMA. 1976;236(14):1594-1597.
// Indication: Barceloux DG, et al (AACT) methanol/ethylene-glycol guidelines.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toxicAlcohol } from '../../lib/tox-v86.js';

test('ethanol-corrected calculated osmolality and signed osmolar gap', () => {
  const r = toxicAlcohol({ measuredOsm: 305, sodium: 140, glucose: 90, bun: 14, ethanol: 0, recentIngestion: true });
  // 2*140 + 90/18 + 14/2.8 + 0 = 290; gap = 305 - 290 = 15
  assert.equal(r.calcOsm, 290);
  assert.equal(r.osmolarGap, 15);
  assert.equal(r.indicated, true);
  assert.match(r.limbsText, /recent-ingestion/);
});

test('ethanol term reduces the gap (correction applied)', () => {
  const r = toxicAlcohol({ measuredOsm: 305, sodium: 140, glucose: 90, bun: 14, ethanol: 37 });
  // adds 37/3.7 = 10 to the calc, so calc 300, gap 5
  assert.equal(r.calcOsm, 300);
  assert.equal(r.osmolarGap, 5);
});

test('documented level over 20 mg/dL -> fomepizole indicated', () => {
  const r = toxicAlcohol({ measuredOsm: 290, sodium: 140, glucose: 90, bun: 14, knownLevel: 25 });
  assert.equal(r.indicated, true);
  assert.match(r.limbsText, /over 20 mg\/dL/);
});

test('strong suspicion with 2 of 3 supportive features -> indicated', () => {
  // pH 7.1 (<7.3), bicarb 15 (<20), small gap (not >10) -> 2 of 3
  const r = toxicAlcohol({ measuredOsm: 295, sodium: 140, glucose: 90, bun: 14, pH: 7.1, bicarbonate: 15, strongSuspicion: true });
  assert.equal(r.indicated, true);
  assert.match(r.limbsText, /strong suspicion/);
});

test('negative osmolar gap is reported signed, not clamped', () => {
  const r = toxicAlcohol({ measuredOsm: 280, sodium: 145, glucose: 90, bun: 14 });
  // calc ~ 2*145 + 5 + 5 = 300; gap = 280 - 300 = -20
  assert.ok(r.osmolarGap < 0);
  assert.equal(r.indicated, false);
});

test('normal-gap-does-not-exclude caveat is surfaced', () => {
  const r = toxicAlcohol({ measuredOsm: 290, sodium: 140, glucose: 90, bun: 14 });
  assert.match(r.note, /does not exclude/i);
  assert.match(r.note, /anion gap/i);
});

test('missing osmolality or sodium returns null', () => {
  assert.equal(toxicAlcohol({ sodium: 140 }), null);
  assert.equal(toxicAlcohol({ measuredOsm: 290 }), null);
});
