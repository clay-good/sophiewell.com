// spec-v1766: lib/bounds.js envelopes were widened (specs v1762 to v1765) to sit past values
// patients have survived; each source is in lib/bounds.js. These tools kept a narrower cap of
// their own, a copy of an older limit, and still refused a survivable value just inside the
// envelope. Each row drives a value between the old cap and the envelope and checks the tool
// now answers; the next test checks the envelope still refuses just past it.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeCalculator } from '../../mcp/tools.js';
import { META } from '../../lib/meta.js';
import { BOUNDS } from '../../lib/bounds.js';

const run = (id, over) => computeCalculator({ id, inputs: { ...META[id].example.fields, ...over } });

// [tool id, the field driven, a value past the old cap, old cap, other fields the case needs]
const ROWS = [
  ['pelod2', 'p2-lactate', '45', 40],
  ['pelod2', 'p2-paco2', '230', 200],
  ['pelod2', 'p2-wbc', '1500', 200],
  ['pelod2', 'p2-plt', '3000', 2000],
  ['psofa', 'ps-plt', '3000', 2000],
  ['psofa', 'ps-bili', '70', 60],
  ['psofa', 'ps-creat', '70', 30],
  ['apache2', 'ap-temp', '15', 20],
  ['apache2', 'ap-hr', '500', 300],
  ['apache2', 'ap-ph', '6.4', 6.5],
  ['apache2', 'ap-na', '205', 200],
  ['apache2', 'ap-k', '14', 12],
  ['apache2', 'ap-creat', '70', 25],
  ['apache2', 'ap-wbc', '1500', 200],
  ['abcd3-i', 'abcd3i-sbp', '450', 300],
  ['abcd3-i', 'abcd3i-sbp', '25', 30, { 'abcd3i-dbp': '10' }],
  ['abcd3-i', 'abcd3i-dbp', '350', 200, { 'abcd3i-sbp': '450' }],
  ['abcd3-i', 'abcd3i-dbp', '7', 10],
  ['charge-af', 'charge-sbp', '450', 300],
  ['charge-af', 'charge-sbp', '25', 60, { 'charge-dbp': '10' }],
  ['charge-af', 'charge-dbp', '350', 200, { 'charge-sbp': '450' }],
  ['charge-af', 'charge-dbp', '7', 30],
  ['corrected-potassium-ph', 'kc-ph', '6.4', 6.5, { 'kc-k': '8' }],
  ['bonacini-cds', 'bon-plt', '3000', 1000],
  ['guci', 'guci-ast', '25000', 5000, { 'guci-plt': '3000' }],
  ['guci', 'guci-plt', '3000', 1000],
  ['potassium-deficit', 'kd-k', '14', 10],
  ['magnesium-replacement', 'mg-serum', '20', 10],
  ['carb-insulin-bolus', 'ci-cur', '2700', 2000],
  ['rome-ecopd', 'rome-paco2', '230', 150],
  ['rome-ecopd', 'rome-paco2', '7', 10],
  ['rome-ecopd', 'rome-ph', '6.4', 6.5],
  ['glasgow-blatchford', 'gbs-sbp', '450', 300],
  ['hepamet-fibrosis', 'hep-ast', '25000', 20000],
  ['mecki', 'mecki-na', '205', 180],
  ['mecki', 'mecki-na', '88', 100],
  ['sits-sich', 'sits-glu', '2700', 2000],
  ['sits-sich', 'sits-sbp', '450', 400],
  ['percent-platelet-recovery', 'ppr-pre', '2500', 2000, { 'ppr-post': '2600' }],
  ['percent-platelet-recovery', 'ppr-post', '2500', 2000, { 'ppr-pre': '2400' }],
  ['cerebral-perfusion-pressure', 'cpp-sbp', '450', 400],
  ['cerebral-perfusion-pressure', 'cpp-dbp', '350', 300, { 'cpp-sbp': '450' }],
  ['mets-ir', 'metsir-fpg', '2700', 2000],
  ['mets-ir', 'metsir-tg', '2', 5],
  ['aminoglycoside-label-renal', 'agl-creatinine', '70', 15],
  ['aminoglycoside-label-renal', 'agl-creatinine', '0.15', 0.2],
  ['measured-crcl', 'mcrcl-scr', '70', 30],
  ['cmi', 'cmi-tg', '2', 5],
  ['thakar-aki', 'thakar-creatinine', '70', 30],
  ['sbp-ascitic-fluid', 'sbp-cr', '70', 30],
  ['sea-guideline', 'sea-wbc', '1500', 200],
  ['chemo-organ-label-dose', 'col-bili', '70', 60],
  ['doac-dose-check', 'doac-scr', '70', 20],
];

for (const [id, field, value, oldCap, extra = {}] of ROWS) {
  test(`spec-v1766 ${id}: ${field} ${value} (past the old cap of ${oldCap}) now answers`, () => {
    const r = run(id, { ...extra, [field]: value });
    assert.equal(r.valid, true, `${id} ${field}=${value}: ${r.message}`);
  });
}

test('spec-v1766: just past the new envelope is still refused', () => {
  const over = (k) => String(BOUNDS[k].max + 1);
  const under = (k) => String(BOUNDS[k].min / 2);
  for (const [id, field, value, extra = {}] of [
    ['pelod2', 'p2-wbc', over('wbc')], ['psofa', 'ps-creat', over('scr')],
    ['apache2', 'ap-hr', over('hr')], ['apache2', 'ap-temp', under('temperature')], ['apache2', 'ap-ph', '6.2'],
    ['abcd3-i', 'abcd3i-sbp', over('sbp')], ['charge-af', 'charge-dbp', over('dbp'), { 'charge-sbp': '450' }],
    ['corrected-potassium-ph', 'kc-ph', '6.2', { 'kc-k': '8' }], ['bonacini-cds', 'bon-plt', over('platelets')],
    ['guci', 'guci-ast', over('ast')], ['potassium-deficit', 'kd-k', over('potassium')],
    ['magnesium-replacement', 'mg-serum', over('magnesium')], ['carb-insulin-bolus', 'ci-cur', over('glucose')],
    ['rome-ecopd', 'rome-paco2', over('paCO2')], ['glasgow-blatchford', 'gbs-sbp', over('sbp')],
    ['hepamet-fibrosis', 'hep-ast', over('ast')], ['mecki', 'mecki-na', over('sodium')], ['mecki', 'mecki-na', '80'],
    ['sits-sich', 'sits-glu', over('glucose')], ['percent-platelet-recovery', 'ppr-post', over('platelets')],
    ['cerebral-perfusion-pressure', 'cpp-sbp', over('sbp')], ['mets-ir', 'metsir-fpg', over('glucose')],
    ['mets-ir', 'metsir-tg', '0.5'], ['aminoglycoside-label-renal', 'agl-creatinine', over('scr')],
    ['measured-crcl', 'mcrcl-scr', over('scr')], ['cmi', 'cmi-tg', '0.5'], ['thakar-aki', 'thakar-creatinine', over('scr')],
    ['sbp-ascitic-fluid', 'sbp-cr', over('scr')], ['sea-guideline', 'sea-wbc', over('wbc')],
    ['chemo-organ-label-dose', 'col-bili', over('bilirubin')], ['doac-dose-check', 'doac-scr', over('scr')],
  ]) {
    const r = run(id, { ...extra, [field]: value });
    assert.equal(r.valid, false, `${id} ${field}=${value} should be refused`);
  }
});

test('spec-v1766: in-range worked examples compute as before', () => {
  for (const id of new Set(ROWS.map((r) => r[0]))) {
    assert.equal(run(id, {}).valid, true, id);
  }
});
