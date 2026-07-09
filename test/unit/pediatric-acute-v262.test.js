// spec-v262: worked examples for the pediatric acute-assessment instruments.
// Bands/weights spec-v97 verified against the primary papers and independent
// calculators: Lab-score (Galetto-Lacour, Pediatr Infect Dis J 2008; CRP/PCT/urine,
// 0-9, cutoff >= 3), CHALICE (Dunning, Arch Dis Child 2006; 14 criteria any-positive),
// Egami (Egami, J Pediatr 2006 Table 1; ALT/age/day/CRP/platelets, 0-6, cutoff >= 3).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { labScore, chalice, egami } from '../../lib/pediatric-acute-v262.js';

// --- Lab-score ---
test('lab-score: all low bands is a zero low-risk score', () => {
  const r = labScore({ crp: 'lt40', pct: 'lt05' });
  assert.equal(r.valid, true);
  assert.equal(r.score, 0);
  assert.equal(r.abnormal, false);
  assert.ok(r.band.includes('Lab-score 0 of 9'));
  assert.ok(r.band.includes('low risk'));
});
test('lab-score: crosses the >= 3 cutoff across the CRP and PCT bands', () => {
  const r = labScore({ crp: 'mid', pct: 'mid' });
  // CRP 40-99 (+2) + PCT 0.5-1.99 (+2) = 4.
  assert.equal(r.score, 4);
  assert.equal(r.abnormal, true);
  assert.ok(r.band.includes('Lab-score 4 of 9'));
  assert.ok(r.band.includes('high risk'));
});
test('lab-score: a single high CRP band alone crosses the cutoff', () => {
  const r = labScore({ crp: 'high' });
  assert.equal(r.score, 4);
  assert.ok(r.abnormal);
});
test('lab-score: max score with urine positive reaches 9', () => {
  const r = labScore({ crp: 'high', pct: 'high', urinePositive: true });
  assert.equal(r.score, 9);
  assert.ok(r.detail.includes('urine dipstick positive'));
});

// --- CHALICE ---
test('chalice: all 14 criteria absent -> CT not required', () => {
  const r = chalice({});
  assert.equal(r.valid, true);
  assert.equal(r.score, 0);
  assert.equal(r.abnormal, false);
  assert.ok(r.band.includes('CT not required'));
  assert.ok(r.band.includes('all 14 criteria absent'));
});
test('chalice: a history-only positive -> CT recommended', () => {
  const r = chalice({ locOver5: true });
  assert.equal(r.score, 1);
  assert.equal(r.abnormal, true);
  assert.ok(r.band.includes('CT head recommended'));
  assert.ok(r.band.includes('1 of 14'));
  assert.ok(r.detail.includes('(history)'));
});
test('chalice: an examination-only positive -> CT recommended', () => {
  const r = chalice({ gcsLow: true });
  assert.equal(r.score, 1);
  assert.ok(r.abnormal);
  assert.ok(r.detail.includes('(examination)'));
});
test('chalice: multiple criteria count and name their groups', () => {
  const r = chalice({ vomits3: true, fall3m: true });
  assert.equal(r.score, 2);
  assert.ok(r.band.includes('2 of 14'));
  assert.ok(r.detail.includes('(history)'));
  assert.ok(r.detail.includes('(mechanism)'));
});

// --- Egami ---
test('egami: no items positive is a zero low-risk score', () => {
  const r = egami({});
  assert.equal(r.valid, true);
  assert.equal(r.score, 0);
  assert.equal(r.abnormal, false);
  assert.ok(r.band.includes('Egami 0 of 6'));
  assert.ok(r.band.includes('low risk'));
});
test('egami: crosses the >= 3 IVIG-resistance cutoff', () => {
  const r = egami({ altHigh: true, ageYoung: true });
  // ALT >= 80 (+2) + age <= 6 months (+1) = 3.
  assert.equal(r.score, 3);
  assert.equal(r.abnormal, true);
  assert.ok(r.band.includes('Egami 3 of 6'));
  assert.ok(r.band.includes('high risk of IVIG resistance'));
});
test('egami: a score of 2 stays low risk (below cutoff)', () => {
  const r = egami({ altHigh: true });
  assert.equal(r.score, 2);
  assert.equal(r.abnormal, false);
  assert.ok(r.band.includes('low risk'));
});
test('egami: all five items reach the 6-point maximum', () => {
  const r = egami({ altHigh: true, ageYoung: true, earlyTreatment: true, crpHigh: true, plateletsLow: true });
  assert.equal(r.score, 6);
  assert.ok(r.band.includes('high risk'));
});
