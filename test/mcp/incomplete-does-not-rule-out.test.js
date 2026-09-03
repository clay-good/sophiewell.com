// spec-v1006: an incomplete score may rule IN. It must never rule OUT.
//
// spec-v930 established that a blank field and an absent field must reach the same
// outcome, and said in its own comment that it deliberately proves nothing about
// WHICH outcome is right. This is the question it left open, and the answer was
// bad for seven calculators built on measurements:
//
//   lrinec              no labs at all -> "LRINEC 0: low risk of necrotizing fasciitis"
//                       CRP alone      -> "LRINEC 4: low risk" (five labs, nine points, unentered)
//   mods                creatinine 5   -> "MODS 3 of 24: ICU mortality ~1-2%" (five organ systems unmeasured)
//   carpenter-coustan   nothing        -> "0 of 4 values exceed cutoffs -> not diagnostic of GDM"
//   iadpsg              nothing        -> "0 of 3 values exceed cutoffs -> not diagnostic of GDM"
//   nutric / mnutric    an age         -> "low nutritional risk"
//   rome-ecopd          nothing        -> "mild COPD exacerbation"
//
// Every one of these is monotone: a component can add points or leave them alone,
// never subtract. So a partial total is a LOWER BOUND. That makes an incomplete
// score safe to rule in and never safe to rule out -- and each of these was ruling
// out, in the reassuring direction, on evidence that had not been entered.
//
// The invariant below is narrow on purpose: for these seven, computing with no
// inputs must not produce a reassuring reading. It says nothing about tiles whose
// inputs are checklist criteria, where "none present" is a real answer a clinician
// can give -- CHADS2 0 in a patient with no risk factors is correct, not missing.

import test from 'node:test';
import assert from 'node:assert/strict';
import { allCalculators } from '../../mcp/catalog.js';

// The reassuring words these scores used to reach for from nothing.
const RULES_OUT = /\b(low risk|low nutritional risk|not diagnostic|mild|remission|0%|normal)\b/i;

const MEASUREMENT_SCORES = [
  'lrinec', 'mods', 'carpenter-coustan', 'iadpsg', 'nutric', 'mnutric', 'rome-ecopd',
];

test('a score built on measurements does not rule out from an empty call', () => {
  const byId = new Map(allCalculators().map((t) => [t.id, t]));
  const offenders = [];
  for (const id of MEASUREMENT_SCORES) {
    const tool = byId.get(id);
    assert.ok(tool, `${id} is no longer exposed; update this list deliberately`);
    let r;
    try { r = tool.compute({}); } catch { continue; } // refusing by throwing is fine
    const band = String(r?.band ?? r?.bandLabel ?? '');
    if (RULES_OUT.test(band)) offenders.push(`${id}: ${band.slice(0, 90)}`);
  }
  assert.deepEqual(offenders, [],
    'these answered reassuringly with no inputs at all:\n  ' + offenders.join('\n  '));
});

test('and does not rule out from a single value either', () => {
  // The likelier real case: someone types the one number they have.
  const byId = new Map(allCalculators().map((t) => [t.id, t]));
  const oneValue = {
    lrinec: { crp: 200 },
    mods: { creatinineMgDl: 5 },
    'carpenter-coustan': { fasting: 80 },
    iadpsg: { fasting: 80 },
    nutric: { ageYears: 30 },
    mnutric: { ageYears: 30 },
    'rome-ecopd': { respiratoryRate: 18 },
  };
  const offenders = [];
  for (const [id, args] of Object.entries(oneValue)) {
    let r;
    try { r = byId.get(id).compute(args); } catch { continue; }
    const band = String(r?.band ?? r?.bandLabel ?? '');
    if (RULES_OUT.test(band)) offenders.push(`${id}: ${band.slice(0, 90)}`);
  }
  assert.deepEqual(offenders, [],
    'these answered reassuringly from one value:\n  ' + offenders.join('\n  '));
});

test('but an incomplete score still rules IN when the evidence is already there', () => {
  // The whole point of the lower-bound argument: what is measured stands.
  const byId = new Map(allCalculators().map((t) => [t.id, t]));
  const rulesIn = [
    ['lrinec', { crp: 200, wbc: 30 }, /intermediate risk|high risk/],
    ['mods', { creatinineMgDl: 5, plateletsK: 10, gcs: 6 }, /MODS 11 of 24/],
    ['carpenter-coustan', { fasting: 100, oneHour: 200 }, /GDM diagnosed/],
    ['iadpsg', { fasting: 100 }, /GDM diagnosed/],
    ['nutric', { ageYears: 80, apache2: 30, sofa: 12 }, /high nutritional risk/],
    ['rome-ecopd', { dyspneaVas: 8, respiratoryRate: 30, heartRate: 110 }, /moderate COPD exacerbation/],
  ];
  for (const [id, args, want] of rulesIn) {
    const band = String(byId.get(id).compute(args).band ?? '');
    assert.match(band, want, `${id} should still rule in from partial evidence`);
  }
});

test('every refusal names what is missing', () => {
  // A prompt that does not say which value it wants sends the reader back to the
  // form to guess. Each refusal lists the inputs it is waiting for.
  const byId = new Map(allCalculators().map((t) => [t.id, t]));
  for (const id of MEASUREMENT_SCORES) {
    const band = String(byId.get(id).compute({}).band ?? '');
    assert.match(band, /Missing:|Not yet entered:|Enter the .* inputs/i, `${id}: ${band.slice(0, 80)}`);
  }
});

// ---------------------------------------------------------------------------
// spec-v1007: the same rule, the second wave.
//
// The spec-v1006 finder narrowed to tiles where EVERY field is a bare measurement
// and found seven. Widening it to tiles that mix measurements with checklist
// criteria -- where "no" is a real answer but a blank lab is not -- found eight
// more answering reassuringly from nothing:
//
//   bard-score   nothing -> "BARD 0/4: 0 to 1 -- advanced fibrosis is robustly ruled out"
//   hscore-hlh   nothing -> "HScore 0: estimated HLH probability <1%"
//   tash-score   nothing -> "TASH score 0: ~0.7% probability of mass transfusion"
//   rabt-score   nothing -> "RABT score 0: below the massive-transfusion threshold"
//   alt-70       nothing -> "ALT-70 0: cellulitis unlikely (>= 83% pseudocellulitis)"
//   mehran-cin   nothing -> "Mehran score 0: low risk: ~7.5% contrast-induced nephropathy"
//   timi-stemi   blank age -> "0.8% 30-day mortality" read off the bottom of the table
//   nihss        no items  -> "No stroke symptoms"
//
// The checkboxes and pickers in these tiles are answers, not gaps: an unchecked
// "positive FAST" is a negative FAST. Only the unentered MEASUREMENTS withhold the
// reading, and only the reassuring one.
const V1007_SCORES = [
  'bard-score', 'hscore-hlh', 'tash-score', 'rabt-score', 'alt-70', 'mehran-cin', 'timi-stemi',
];

// The reassuring readings these eight used to reach for from nothing.
const V1007_RULES_OUT = /ruled out|probability <1%|~0\.7%|below the massive-transfusion threshold|cellulitis unlikely|low risk:|0\.8% 30-day mortality|No stroke symptoms/i;

test('spec-v1007: the second wave does not rule out from an empty call', () => {
  const byId = new Map(allCalculators().map((t) => [t.id, t]));
  const offenders = [];
  for (const id of V1007_SCORES) {
    const tool = byId.get(id);
    assert.ok(tool, `${id} is no longer exposed; update this list deliberately`);
    let r;
    try { r = tool.compute({}); } catch { continue; }
    const band = String(r?.band ?? r?.bandLabel ?? '');
    if (V1007_RULES_OUT.test(band)) offenders.push(`${id}: ${band.slice(0, 90)}`);
  }
  const nihss = byId.get('nihss');
  assert.ok(nihss, 'nihss is no longer exposed; update this list deliberately');
  const severity = String(nihss.compute({}).severity ?? '');
  if (V1007_RULES_OUT.test(severity)) offenders.push(`nihss: ${severity}`);
  assert.deepEqual(offenders, [],
    'these answered reassuringly with no inputs at all:\n  ' + offenders.join('\n  '));
});

test('spec-v1007: nor from the one number someone happens to have', () => {
  const byId = new Map(allCalculators().map((t) => [t.id, t]));
  const oneValue = {
    'bard-score': { bmi: 24 },
    'hscore-hlh': { ferritin: 500 },
    'tash-score': { hb: 13 },
    'rabt-score': { hr: 80 },
    'alt-70': { wbc: 8 },
    'mehran-cin': { egfr: 90 },
    'timi-stemi': { sbpLow: 'no' },
  };
  const offenders = [];
  for (const [id, args] of Object.entries(oneValue)) {
    let r;
    try { r = byId.get(id).compute(args); } catch { continue; }
    const band = String(r?.band ?? r?.bandLabel ?? '');
    if (V1007_RULES_OUT.test(band)) offenders.push(`${id}: ${band.slice(0, 90)}`);
  }
  // One NIHSS item scored 0 is twelve items unscored, not a normal exam.
  const severity = String(byId.get('nihss').compute({ '1a': 0 }).severity ?? '');
  if (V1007_RULES_OUT.test(severity)) offenders.push(`nihss: ${severity}`);
  assert.deepEqual(offenders, [],
    'these answered reassuringly from one value:\n  ' + offenders.join('\n  '));
});

test('spec-v1007: and each still rules IN on the evidence it does have', () => {
  const byId = new Map(allCalculators().map((t) => [t.id, t]));
  const rulesIn = [
    // BMI 30 (+1) + diabetes (+1) = 2: advanced fibrosis is in play whatever the labs say.
    ['bard-score', { bmi: 30, diabetes: true }, /not ruled out/],
    // 18 + 49 + 38 + 34 + 30 = 169 without a ferritin, triglyceride or AST.
    ['hscore-hlh', { immunosuppression: 'yes', temp: 40, organomegaly: 'both', cytopenias: 3, fibrinogen: 2 }, /HScore 169/],
    // 8 + 4 + 6 + 3 = 21 -> over 50% without a systolic BP or heart rate.
    ['tash-score', { hb: 6, baseExcess: -12, pelvis: true, fast: true }, /probability of mass transfusion/],
    // Two flags fire the rule with no vitals at all.
    ['rabt-score', { pelvis: true, penetrating: true }, /massive transfusion predicted/],
    // Asymmetry (3) + WBC 12 (1) + HR 95 (1) = 5 without an age.
    ['alt-70', { asymmetry: true, wbc: 12, hr: 95 }, /cellulitis likely/],
    // Hypotension 5 + IABP 5 + CHF 5 = 15 before a drop of contrast is given.
    ['mehran-cin', { hypotension: true, iabp: true, chf: true }, /high risk/],
  ];
  for (const [id, args, want] of rulesIn) {
    const band = String(byId.get(id).compute(args).band ?? '');
    assert.match(band, want, `${id} should still rule in from partial evidence`);
  }
  // A blank age does not stop TIMI-STEMI scoring the risk factors that were answered.
  const timi = byId.get('timi-stemi').compute({ sbpLow: 'yes', killip24: 'yes' });
  assert.equal(timi.total, 5);
  assert.equal(timi.mortality, null);
  // Five points of deficit is five points of deficit, however many items are left.
  assert.equal(byId.get('nihss').compute({ '1a': 1, 4: 1, 5: 2, 9: 1 }).severity, 'Moderate stroke');
});

test('spec-v1007: every refusal names the measurement it is waiting for', () => {
  const byId = new Map(allCalculators().map((t) => [t.id, t]));
  const wants = {
    'bard-score': /BMI/,
    'hscore-hlh': /ferritin/,
    'tash-score': /base excess/,
    'rabt-score': /systolic BP/,
    'alt-70': /white blood cell count/,
    'mehran-cin': /contrast volume/,
    'timi-stemi': /enter age/i,
  };
  for (const [id, want] of Object.entries(wants)) {
    const band = String(byId.get(id).compute({}).band ?? '');
    assert.match(band, want, `${id}: ${band.slice(0, 100)}`);
    assert.match(band, /add points|underestimate/i, `${id} should say why the missing values matter`);
  }
  assert.match(String(byId.get('nihss').compute({}).severity), /13 of 13 items unscored/);
});
