// spec-v1765: lib/bounds.js widened eight envelopes to sit past values patients have survived
// (INR 189, chloride 48 and 175, hematocrit 88, hemoglobin 25.3, BUN 306, phosphate 55,
// triglycerides 33,727 mg/dL; each source is in lib/bounds.js). These tools kept their own,
// narrower cap and still refused the survived value. Each row drives a value between the old
// cap and the new envelope and checks the tool now answers; the next test checks the envelope
// still refuses just past it.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeCalculator } from '../../mcp/tools.js';
import { META } from '../../lib/meta.js';
import { BOUNDS } from '../../lib/bounds.js';

const run = (id, over) => computeCalculator({ id, inputs: { ...META[id].example.fields, ...over } });

// [tool id, the field driven, a survived value past the old cap, old cap, other fields the case needs]
const ROWS = [
  // INR: old caps 15, 20 or 30; survived 189 (Tsutaoka 2003).
  ['anticoag-switch-clock', 'asc-inr', '189', 20],
  ['anticoag-reversal', 'ar-inr', '189', 30],
  ['bonacini-cds', 'bon-inr', '189', 15],
  ['guci', 'guci-inr', '189', 15],
  ['meld-na', 'meldna-inr', '189', 30],
  ['clif-c-ad', 'clifad-inr', '189', 30],
  ['king-score', 'king-inr', '189', 20],
  ['fibroq', 'fq-inr', '189', 20],
  ['abic-score', 'abic-inr', '189', 20],
  ['meld3', 'm3-inr', '189', 30],
  ['phoenix-sepsis', 'phx-inr', '189', 30],
  ['peds-warfarin-nomogram', 'pwn-inr', '189', 20],
  ['inr-variability', 'iv-series', '2.0 2\n189 1\n2.5 2', 20],
  ['tpa-eligibility', 'tpa-inr', '189', 20],
  ['warfarin-inr-out-of-range', 'wio-inr', '189', 30],
  // Hemoglobin: old cap 25 g/dL (250 or 200 g/L); survived 25.3 g/dL (Negro 2020).
  ['cao2-do2', 'cao2-hb', '25.3', 25],
  ['mecki', 'mecki-hb', '25.3', 25],
  ['esa-chemo-dose-adjust', 'eca-hgb', '25.3', 25],
  ['esa-chemo-dose-adjust', 'eca-hgb-2wk', '25.3', 25],
  ['fick-cardiac-output', 'fick-hb', '25.3', 25],
  ['glasgow-blatchford', 'gbs-hb', '25.3', 25],
  ['green-king-index', 'gk-hb', '25.3', 25],
  ['england-fraser-index', 'ef-hb', '25.3', 25],
  ['sirdah-index', 'sd-hb', '25.3', 25],
  ['dlco-correction', 'dlco-hb', '25.3', 25],
  ['who-anemia-hb', 'ahb-hb', '25.3', 25],
  ['who-anemia-hb', 'ahb-hb', '253', 250, { 'ahb-unit': 'gl' }],
  ['iron-supplement-who', 'fe-hb', '253', 200, { 'fe-group': 'pregnant', 'fe-tri': '2', 'fe-daily': 'yes' }],
  ['iv-iron-course', 'iic-hb', '25.3', 25, { 'iic-regimen': 'injectafer-hf' }],
  // Hematocrit: old caps 70 or 80 %; survived 88 % (Braig 2009).
  ['crusade', 'crusade-hct', '88', 70],
  ['retic-index', 'ri-hct', '88', 70],
  ['apache2', 'ap-hct', '88', 80],
  ['iv-iron-course', 'iic-hct', '88', 70, { 'iic-regimen': 'infed-blood-loss', 'iic-loss': '500' }],
  // BUN: old cap 300 mg/dL; survived 306.7 (Sinha 2015).
  ['lods', 'lods-bun', '306', 300],
  ['sbp-ascitic-fluid', 'sbp-bun', '306', 300],
  // Chloride: old caps 50 to 150 or 160 mmol/L; survived 48 and 175 (Akoum 2021; Rayamajhi 2023).
  ['corrected-anion-gap', 'cl', '48', 50],
  ['corrected-anion-gap', 'cl', '100', 150, { na: '180', hco3: '2' }],
  ['delta-gap', 'dg-cl', '48', 50, { 'dg-na': '110', 'dg-hco3': '30' }],
  ['delta-gap', 'dg-cl', '170', 160, { 'dg-na': '200' }],
  // Phosphate: old caps 20 or 30 mg/dL; survived 55 (Biebl 2009).
  ['calcium-phosphate-product', 'capo4-po', '55', 30],
  ['iv-phosphate-order-check', 'ip-phos', '55', 20],
  // Triglycerides: old caps 2,000 to 10,000 mg/dL (30 or 100 mmol/L); survived 33,727 mg/dL (El-Koofy 2021).
  ['cmi', 'cmi-tg', '33700', 10000],
  ['spise', 'spise-tg', '33700', 2000],
  ['ldl-calc', 'ldl-tg', '33700', 5000, { 'ldl-tc': '900' }],
  ['tyg-bmi', 'tygbmi-tg', '33700', 10000],
  ['mets-ir', 'metsir-tg', '33700', 10000],
  // The tool's own output check keeps AIP within -2 to 2 (kept); an HDL of 4 holds log10(380 / 4) under it.
  ['atherogenic-index-of-plasma', 'aip-tg', '380', 30, { 'aip-hdl': '4' }],
  ['lipid-accumulation-product', 'lap-tg', '380', 100],
  ['visceral-adiposity-index', 'vai-tg', '380', 100],
];

for (const [id, field, value, oldCap, extra = {}] of ROWS) {
  test(`spec-v1765 ${id}: ${field} ${value.replace(/\n/g, ' / ')} (past the old cap of ${oldCap}) now answers`, () => {
    const r = run(id, { ...extra, [field]: value });
    assert.equal(r.valid, true, `${id} ${field}=${value}: ${r.message}`);
  });
}

// The chloride rows above hold the gap arithmetic in range: 180 - 100 - 2 for the high one.
test('spec-v1765 corrected-anion-gap and delta-gap: a chloride of 175 answers', () => {
  assert.equal(run('corrected-anion-gap', { na: '200', cl: '175', hco3: '5' }).valid, true);
  assert.equal(run('delta-gap', { 'dg-na': '200', 'dg-cl': '175', 'dg-hco3': '5' }).valid, true);
});

test('spec-v1765: just past the new envelope is still refused', () => {
  const over = (k) => String(BOUNDS[k].max + 1);
  for (const [id, field, k] of [
    ['meld3', 'm3-inr', 'inr'], ['warfarin-inr-out-of-range', 'wio-inr', 'inr'], ['tpa-eligibility', 'tpa-inr', 'inr'],
    ['mecki', 'mecki-hb', 'hemoglobin'], ['dlco-correction', 'dlco-hb', 'hemoglobin'],
    ['crusade', 'crusade-hct', 'hematocrit'], ['retic-index', 'ri-hct', 'hematocrit'],
    ['lods', 'lods-bun', 'bun'], ['sbp-ascitic-fluid', 'sbp-bun', 'bun'],
    ['delta-gap', 'dg-cl', 'chloride'], ['corrected-anion-gap', 'cl', 'chloride'],
    ['calcium-phosphate-product', 'capo4-po', 'phosphate'], ['iv-phosphate-order-check', 'ip-phos', 'phosphate'],
    ['cmi', 'cmi-tg', 'triglycerides'], ['spise', 'spise-tg', 'triglycerides'], ['ldl-calc', 'ldl-tg', 'triglycerides'],
  ]) {
    const r = run(id, { [field]: over(k) });
    assert.equal(r.valid, false, `${id} ${field}=${over(k)} should be refused`);
  }
  // The millimole fields convert the envelope (35,000 mg/dL / 88.57 is about 395 mmol/L).
  for (const [id, field] of [['atherogenic-index-of-plasma', 'aip-tg'], ['lipid-accumulation-product', 'lap-tg'], ['visceral-adiposity-index', 'vai-tg']]) {
    assert.equal(run(id, { [field]: '400' }).valid, false, id);
  }
  assert.equal(run('who-anemia-hb', { 'ahb-unit': 'gl', 'ahb-hb': '261' }).valid, false);
  assert.equal(run('iron-supplement-who', { 'fe-group': 'pregnant', 'fe-tri': '2', 'fe-daily': 'yes', 'fe-hb': '261' }).valid, false);
});

test('spec-v1765 phoenix-sepsis: an INR of 189 is scored, not read as missing', () => {
  // The old cap of 30 did not refuse: pos() read the value as blank, so the coagulation item lost its point in silence.
  const r = run('phoenix-sepsis', { 'phx-inr': '189' });
  assert.equal(r.result.coag, 2);
  assert.ok(!r.result.missing.includes('an INR'));
});

test('spec-v1765: iron-ganzoni reads a hemoglobin of 25.3 and refuses it for the reason that applies', () => {
  // The old cap of 25 refused it as implausible; it is survivable, and Ganzoni only applies below the target.
  const r = run('iron-ganzoni', { hb: '25.3', tgt: '15' });
  assert.equal(r.valid, false);
  assert.match(r.message, /below target/);
  assert.doesNotMatch(r.message, /between 1 and 25/);
});

test('spec-v1765: in-range worked examples compute as before', () => {
  for (const id of new Set(ROWS.map((r) => r[0]))) {
    assert.equal(run(id, {}).valid, true, id);
  }
});
