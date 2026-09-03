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
