// spec-v4 §7 step v4.8 (waves 3-4): >=5 cases per score covering each band.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  centor, mcisaac, caprini, bishop, alvarado, pediatricAppendicitis,
  MRS_DESCRIPTIONS, miniCog,
  PHQ9_CONFIG, GAD7_CONFIG, AUDITC_CONFIG, CAGE_CONFIG, EPDS_CONFIG,
} from '../../lib/scoring-v4.js';
import { scoreScreener, bandFor } from '../../lib/screener.js';

// --- 146 Centor / McIsaac ---------------------------------------------
test('centor: 0 -> Low', () => assert.match(centor({}).band, /Low/));
test('centor: 2 -> Moderate', () => {
  const r = centor({ tonsillarExudate: true, feverHistory: true });
  assert.equal(r.score, 2); assert.match(r.band, /Moderate/);
});
test('centor: 4 -> High', () => {
  const r = centor({ tonsillarExudate: true, tenderAnteriorAdenopathy: true,
    feverHistory: true, absenceOfCough: true });
  assert.equal(r.score, 4); assert.match(r.band, /High/);
});
test('mcisaac: child age 5 adds +1 (3 -> 4)', () => {
  const r = mcisaac({ tonsillarExudate: true, tenderAnteriorAdenopathy: true,
    feverHistory: true, absenceOfCough: false, ageYears: 5 });
  assert.equal(r.ageModifier, 1); assert.equal(r.score, 4);
});
test('mcisaac: age 60 subtracts -1 (3 -> 2)', () => {
  const r = mcisaac({ tonsillarExudate: true, tenderAnteriorAdenopathy: true,
    feverHistory: true, absenceOfCough: false, ageYears: 60 });
  assert.equal(r.ageModifier, -1); assert.equal(r.score, 2);
});
test('mcisaac: age 30 modifier 0', () => {
  const r = mcisaac({ tonsillarExudate: true, ageYears: 30 });
  assert.equal(r.ageModifier, 0);
});

// --- 147 Caprini -------------------------------------------------------
test('caprini: empty -> Very low', () => assert.match(caprini({ items: [] }).band, /Very low/));
test('caprini: 2 pts -> Low', () => assert.match(caprini({ items: [{ points: 1 }, { points: 1 }] }).band, /Low/));
test('caprini: 4 pts -> Moderate', () => assert.match(caprini({ items: [{ points: 2 }, { points: 2 }] }).band, /Moderate/));
test('caprini: 6 pts -> High', () => assert.match(caprini({ items: [{ points: 5 }, { points: 1 }] }).band, /High/));
test('caprini: throws on non-array', () => assert.throws(() => caprini({ items: null })));

// --- 148 Bishop --------------------------------------------------------
test('bishop: closed unfavorable cervix -> Unfavorable', () => {
  const r = bishop({ dilation: 0, effacement: 0, station: -3, consistency: 'firm', position: 'posterior' });
  assert.equal(r.score, 0); assert.match(r.band, /Unfavorable/);
});
test('bishop: midpoint values -> Intermediate', () => {
  const r = bishop({ dilation: 3, effacement: 60, station: 0, consistency: 'medium', position: 'mid' });
  // 2+2+2+1+1 = 8
  assert.equal(r.score, 8); assert.match(r.band, /Intermediate/);
});
test('bishop: max values -> Favorable', () => {
  const r = bishop({ dilation: 6, effacement: 80, station: 2, consistency: 'soft', position: 'anterior' });
  // 3+3+3+2+2 = 13
  assert.equal(r.score, 13); assert.match(r.band, /Favorable/);
});
test('bishop: just over Unfavorable boundary', () => {
  const r = bishop({ dilation: 1, effacement: 30, station: -2, consistency: 'medium', position: 'mid' });
  assert.ok(r.score >= 5);
});
test('bishop: 9 -> Favorable', () => {
  const r = bishop({ dilation: 4, effacement: 70, station: 0, consistency: 'medium', position: 'mid' });
  // 2+2+2+1+1 = 8 -> Intermediate; bump effacement
  const r2 = bishop({ dilation: 4, effacement: 80, station: 0, consistency: 'medium', position: 'mid' });
  assert.equal(r2.score, 9); assert.match(r2.band, /Favorable/);
});

// --- 149 Alvarado -----------------------------------------------------
test('alvarado: 0 -> Low', () => assert.match(alvarado({}).band, /Low/));
test('alvarado: 4 -> Low boundary', () => {
  const r = alvarado({ migration: true, anorexia: true, nausea: true, reboundTenderness: true });
  assert.equal(r.score, 4); assert.match(r.band, /Low/);
});
test('alvarado: 6 -> Equivocal (RLQ + lab)', () => {
  const r = alvarado({ rlqTenderness: true, leukocytosis: true, migration: true, anorexia: true });
  assert.equal(r.score, 6); assert.match(r.band, /Equivocal/);
});
test('alvarado: 9 -> High', () => {
  const r = alvarado({ migration: true, anorexia: true, nausea: true,
    rlqTenderness: true, reboundTenderness: true, elevatedTemp: true,
    leukocytosis: true, leftShift: true });
  assert.equal(r.score, 10); assert.match(r.band, /High/);
});
test('pediatricAppendicitis: 0 -> Low', () => assert.match(pediatricAppendicitis({}).band, /Low/));
test('pediatricAppendicitis: cough+RLQ alone -> Equivocal', () => {
  const r = pediatricAppendicitis({ coughHopTenderness: true, rlqTenderness: true });
  assert.equal(r.score, 4); assert.match(r.band, /Equivocal/);
});
test('pediatricAppendicitis: max -> High', () => {
  const r = pediatricAppendicitis({ coughHopTenderness: true, rlqTenderness: true,
    migration: true, anorexia: true, fever: true, nausea: true, leukocytosis: true, leftShift: true });
  assert.equal(r.score, 10); assert.match(r.band, /High/);
});

// --- 150 mRS reference ------------------------------------------------
test('mRS: covers 0 through 6 inclusive', () => {
  assert.equal(MRS_DESCRIPTIONS.length, 7);
  for (let i = 0; i <= 6; i++) assert.equal(MRS_DESCRIPTIONS[i].score, i);
});
test('mRS: 0 = no symptoms; 6 = dead', () => {
  assert.match(MRS_DESCRIPTIONS[0].label, /No symptoms/i);
  assert.match(MRS_DESCRIPTIONS[6].label, /Dead/i);
});

// --- 151 PHQ-9 --------------------------------------------------------
test('PHQ-9: all 0 -> Minimal', () => {
  const score = scoreScreener(PHQ9_CONFIG.items, new Array(9).fill(0));
  assert.equal(score, 0);
  assert.match(bandFor(PHQ9_CONFIG.severityBands, score).label, /Minimal/);
});
test('PHQ-9: score 7 -> Mild (5-9)', () => {
  assert.match(bandFor(PHQ9_CONFIG.severityBands, 7).label, /Mild/);
});
test('PHQ-9: score 12 -> Moderate', () => {
  assert.match(bandFor(PHQ9_CONFIG.severityBands, 12).label, /^Moderate/);
});
test('PHQ-9: score 18 -> Moderately severe', () => {
  assert.match(bandFor(PHQ9_CONFIG.severityBands, 18).label, /Moderately severe/);
});
test('PHQ-9: score 25 -> Severe (max 27)', () => {
  assert.match(bandFor(PHQ9_CONFIG.severityBands, 25).label, /Severe/);
});

// --- 152 GAD-7 --------------------------------------------------------
test('GAD-7: 0 -> Minimal', () => assert.match(bandFor(GAD7_CONFIG.severityBands, 0).label, /Minimal/));
test('GAD-7: 7 -> Mild', () => assert.match(bandFor(GAD7_CONFIG.severityBands, 7).label, /Mild/));
test('GAD-7: 12 -> Moderate', () => assert.match(bandFor(GAD7_CONFIG.severityBands, 12).label, /Moderate/));
test('GAD-7: 18 -> Severe', () => assert.match(bandFor(GAD7_CONFIG.severityBands, 18).label, /Severe/));
test('GAD-7: max 21 -> Severe', () => assert.match(bandFor(GAD7_CONFIG.severityBands, 21).label, /Severe/));

// --- 153 AUDIT-C ------------------------------------------------------
test('AUDIT-C: 0 -> Negative', () => assert.match(bandFor(AUDITC_CONFIG.severityBands, 0).label, /Negative/));
test('AUDIT-C: 4 -> risky drinking', () => assert.match(bandFor(AUDITC_CONFIG.severityBands, 4).label, /risky/));
test('AUDIT-C: 8 -> high risk', () => assert.match(bandFor(AUDITC_CONFIG.severityBands, 8).label, /high risk/));
test('AUDIT-C: 12 (max) -> high risk', () => assert.match(bandFor(AUDITC_CONFIG.severityBands, 12).label, /high risk/));

// --- 154 CAGE ---------------------------------------------------------
test('CAGE: 0 -> Negative', () => assert.match(bandFor(CAGE_CONFIG.severityBands, 0).label, /Negative/));
test('CAGE: 1 -> Negative', () => assert.match(bandFor(CAGE_CONFIG.severityBands, 1).label, /Negative/));
test('CAGE: 2 -> Positive', () => assert.match(bandFor(CAGE_CONFIG.severityBands, 2).label, /Positive/));
test('CAGE: 4 (max) -> Positive', () => assert.match(bandFor(CAGE_CONFIG.severityBands, 4).label, /Positive/));

// --- 155 EPDS ---------------------------------------------------------
test('EPDS: 0 -> Low likelihood', () => assert.match(bandFor(EPDS_CONFIG.severityBands, 0).label, /Low/));
test('EPDS: 11 -> Possible depression', () => assert.match(bandFor(EPDS_CONFIG.severityBands, 11).label, /Possible/));
test('EPDS: 13 -> Likely depression', () => assert.match(bandFor(EPDS_CONFIG.severityBands, 13).label, /Likely/));
test('EPDS: 30 (max) -> Likely depression', () => assert.match(bandFor(EPDS_CONFIG.severityBands, 30).label, /Likely/));
test('EPDS: 9 boundary -> Low', () => assert.match(bandFor(EPDS_CONFIG.severityBands, 9).label, /Low/));

// --- 156 Mini-Cog -----------------------------------------------------
test('miniCog: 3-word recall + normal clock = 5 -> Negative', () => {
  assert.match(miniCog({ wordsRecalled: 3, clockNormal: true }).band, /Negative/);
});
test('miniCog: 1 word + abnormal clock = 1 -> Positive', () => {
  assert.match(miniCog({ wordsRecalled: 1, clockNormal: false }).band, /Positive/);
});
test('miniCog: 0 words + normal clock = 2 -> Positive', () => {
  assert.match(miniCog({ wordsRecalled: 0, clockNormal: true }).band, /Positive/);
});
test('miniCog: 1 word + normal clock = 3 -> Negative', () => {
  assert.match(miniCog({ wordsRecalled: 1, clockNormal: true }).band, /Negative/);
});
test('miniCog: clamps wordsRecalled', () => {
  assert.equal(miniCog({ wordsRecalled: 99, clockNormal: true }).score, 5);
});
