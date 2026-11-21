// spec-v1760: a value below the floor lib/bounds.js declares was answered; no finder had driven a floor.
// Per fixed field: half the floor is refused, and an in-range value still answers.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { apache2, pelod2, psofa } from '../../lib/scoring-v6.js';
import { watsonTbw, salazarCorcoran, furosemideStressTest } from '../../lib/nephrology-v226.js';
import { agile3plus, hepamet } from '../../lib/hepatology-gibleed-v201.js';
import { abicScore, mayoPscRisk } from '../../lib/liver-v196.js';
import { burnFluid, pedsDose } from '../../lib/field.js';
import { kingScore } from '../../lib/hep-fibrosis-portal-v212.js';
import { arcRiskScores } from '../../lib/arc-risk-scores-v1631.js';
import { dkaResolution } from '../../lib/dka-resolution-v905.js';
import { meldNa } from '../../lib/hepgi-v190.js';
import { pim3 } from '../../lib/peds-v98.js';
import { salicylateToxicity } from '../../lib/tox-v86.js';
import { toeBrachialIndex } from '../../lib/oneformula-v167.js';

const refused = (r) => r.valid === false && /plausible range/.test(r.message);

test('apache2: heart rate, respiratory rate, PaO2, potassium and creatinine below their floors are refused', () => {
  const base = { temp: 39, map: 60, hr: 120, rr: 30, oxy: 65, ph: 7.3, na: 150, k: 5.6, creatinine: 2, hct: 48, wbc: 18, gcs: 13, age: 60 };
  for (const [k, v] of [['hr', 5], ['rr', 1.5], ['oxy', 5], ['k', 0.5], ['creatinine', 0.05]]) {
    assert.throws(() => apache2({ ...base, [k]: v }), /plausible range/, k);
  }
  assert.equal(typeof apache2(base).total, 'number');
  assert.equal(typeof apache2({ ...base, hr: 30, rr: 4, oxy: 40, k: 1.5, creatinine: 0.3 }).total, 'number');
});

test('pelod2: a PaO2/FiO2 ratio and a PaCO2 below their floors are refused', () => {
  const base = { ageMonths: 24, gcs: 12, lactate: 6, map: 50, creatinine: 60, pao2fio2: 300, paco2: 40, invasiveVent: true, wbc: 5, platelets: 100 };
  assert.throws(() => pelod2({ ...base, pao2fio2: 5 }), /PaO2\/FiO2 ratio/);
  assert.throws(() => pelod2({ ...base, paco2: 2.5 }), /plausible range/);
  assert.equal(typeof pelod2({ ...base, pao2fio2: 40, paco2: 10 }).score, 'number');
});

test('psofa: a PaO2/FiO2 ratio and a creatinine below their floors are refused', () => {
  const base = { ageMonths: 24, pao2fio2: 250, vent: true, platelets: 120, bilirubin: 1.5, map: 50, gcs: 13, creatinine: 0.7 };
  assert.throws(() => psofa({ ...base, pao2fio2: 5 }), /PaO2\/FiO2 ratio/);
  assert.throws(() => psofa({ ...base, creatinine: 0.05 }), /plausible range/);
  assert.equal(typeof psofa({ ...base, pao2fio2: 50, creatinine: 0.2 }).score, 'number');
});

test('watson-tbw, salazar-corcoran, furosemide-stress-test: a height or weight below its floor is refused', () => {
  const w = { age: 40, height: 175, weight: 70 };
  assert.ok(refused(watsonTbw({ ...w, height: 22.5 })));
  assert.ok(refused(watsonTbw({ ...w, weight: 0.15 })));
  assert.equal(watsonTbw(w).valid, true);
  const s = { age: 40, weight: 90, height: 170, creatinine: 1 };
  assert.ok(refused(salazarCorcoran({ ...s, height: 22.5 })));
  assert.ok(refused(salazarCorcoran({ ...s, weight: 0.15 })));
  assert.equal(salazarCorcoran(s).valid, true);
  assert.ok(refused(furosemideStressTest({ weight: 0.15, urineOutput2h: 150 })));
  assert.equal(furosemideStressTest({ weight: 70, urineOutput2h: 150 }).valid, true);
});

test('agile-3plus, hepamet-fibrosis, mayo-psc-risk, king-score: an AST or ALT below 1 U/L is refused', () => {
  const a = { lsm: 10, ast: 40, alt: 50, platelets: 200, age: 55, sex: 'male', diabetes: false };
  assert.ok(refused(agile3plus({ ...a, ast: 0.5 })));
  assert.ok(refused(agile3plus({ ...a, alt: 0.5 })));
  assert.equal(agile3plus(a).valid, true);
  const h = { age: 55, sex: 'male', ast: 40, albumin: 4, platelets: 200, diabetes: true };
  assert.ok(refused(hepamet({ ...h, ast: 0.5 })));
  assert.equal(hepamet(h).valid, true);
  const m = { age: 50, bilirubin: 1.5, albumin: 3.8, ast: 60 };
  assert.ok(refused(mayoPscRisk({ ...m, ast: 0.5 })));
  assert.equal(mayoPscRisk(m).valid, true);
  const k = { age: 50, ast: 40, inr: 1.1, platelets: 200 };
  assert.ok(refused(kingScore({ ...k, ast: 0.5 })));
  assert.ok(refused(kingScore({ ...k, inr: 0.25 })));
  assert.equal(kingScore(k).valid, true);
});

test('abic-score: an INR below 0.5 is refused', () => {
  const b = { age: 50, bilirubin: 5, creatinine: 1, inr: 1.5 };
  assert.ok(refused(abicScore({ ...b, inr: 0.25 })));
  assert.equal(abicScore(b).valid, true);
});

test('burn-fluid, peds-weight-dose: a weight below 0.3 kg is refused', () => {
  assert.throws(() => burnFluid({ weightKg: 0.15, tbsaPercent: 20 }), /plausible range/);
  assert.equal(typeof burnFluid({ weightKg: 70, tbsaPercent: 20 }).parkland.total24h, 'number');
  assert.throws(() => pedsDose({ weightKg: 0.15, recipe: 'epinephrine-iv-io' }), /plausible range/);
  assert.equal(typeof pedsDose({ weightKg: 10, recipe: 'epinephrine-iv-io' }).dose, 'number');
});

test('arc-risk-scores: a creatinine below 0.1 mg/dL is refused', () => {
  const b = { sex: 'male', trauma: 'yes', age: 40, creatinine: 0.8, modifiedSofa: 3 };
  assert.ok(refused(arcRiskScores({ ...b, creatinine: 0.05 })));
  assert.equal(arcRiskScores(b).valid, true);
});

test('dka-resolution: a bicarbonate below 1 is refused; a blank stays allowed', () => {
  const b = { glucoseMgDl: 180, venousPh: 7.35, anionGap: 10 };
  assert.ok(refused(dkaResolution({ ...b, bicarbonate: 0.5 }))); // spec-v1765: bound widened (source in lib/bounds.js)
  assert.equal(dkaResolution({ ...b, bicarbonate: 18 }).valid, true);
  assert.equal(dkaResolution(b).valid, true);
});

test('meld-na: a sodium below 90 is refused (the 125 clamp had hidden it)', () => {
  const b = { bilirubin: 3, inr: 1.8, creatinine: 1.5, sodium: 130 };
  assert.ok(refused(meldNa({ ...b, sodium: 45 })));
  assert.equal(meldNa(b).valid, true);
});

test('pim3: a positive systolic below 20 is refused; 0 keeps its cardiac-arrest meaning', () => {
  const b = { recovery: 'none', riskCategory: 'none' };
  assert.ok(refused(pim3({ ...b, sbp: 10 })));
  assert.notEqual(pim3({ ...b, sbp: 0 }).valid, false);
  assert.notEqual(pim3({ ...b, sbp: 90 }).valid, false);
});

test('salicylate-toxicity: an arterial pH outside 6.5-8 is refused; a blank pH stays allowed', () => {
  assert.ok(refused(salicylateToxicity({ level: 50, unit: 'mgdl', pH: 3.25 })));
  assert.ok(refused(salicylateToxicity({ level: 50, unit: 'mgdl', pH: 12 })));
  assert.notEqual(salicylateToxicity({ level: 50, unit: 'mgdl', pH: 7.15 }).valid, false);
  assert.match(salicylateToxicity({ level: 50, unit: 'mgdl', pH: 7.15 }).recommendation, /recommended/);
  assert.notEqual(salicylateToxicity({ level: 50, unit: 'mgdl' }).valid, false);
});

test('toe-brachial-index: a brachial systolic below 20 is refused; the toe pressure keeps its own range', () => {
  assert.ok(refused(toeBrachialIndex({ toe: 80, brachial: 10 })));
  assert.equal(toeBrachialIndex({ toe: 80, brachial: 120 }).valid, true);
  assert.equal(toeBrachialIndex({ toe: 5, brachial: 120 }).valid, true);
});

test('apache2: a sodium of 84 is refused (its own minimum of 80 had let 80-89 score +4)', async () => {
  // spec-v1763: bound widened (source in lib/bounds.js)
  const { computeCalculator } = await import('../../mcp/tools.js');
  const { META } = await import('../../lib/meta.js');
  const ex = META.apache2.example.fields;
  const low = computeCalculator({ id: 'apache2', inputs: { ...ex, 'ap-na': '84' } });
  assert.equal(low.valid, false);
  assert.match(low.message, /plausible range for serum sodium/);
  assert.notEqual(computeCalculator({ id: 'apache2', inputs: { ...ex, 'ap-na': '135' } }).valid, false);
});
