// spec-v544: NEMS, the Nine Equivalents of Nursing Manpower Use Score. All probe tokens zero-hit before this
// tile: "nems", "nursing manpower", "tiss", "miranda", and "workload" across corpus.json, app.js, and
// lib/meta.js.
//
// **A GENUINELY DIFFERENT AXIS FROM EVERY OTHER ICU TILE IN THE CATALOG.** APACHE, SOFA, SAPS, LODS, PELOD,
// OASIS and the rest score how SICK the patient is, or how likely they are to die. NEMS scores how much
// NURSING RESOURCE the patient consumes over a shift. Those come apart constantly: a stable ventilated
// patient on two vasoactive infusions is enormously expensive in nursing time and may have an unremarkable
// severity score, while a patient dying of an untreatable illness may consume very little. NEMS is the
// instrument that maps to STAFFING, and nothing in the catalog answered that question.
//
// NINE ITEMS, TOTAL 0-56. The weights are not uniform and were derived, not assigned by intuition:
//   1 basic monitoring                            9
//   2 intravenous medication                      6   (bolus or continuous; EXCLUDES vasoactive drugs)
//   3 mechanical ventilatory support             12
//   4 supplementary ventilatory care              3
//   5 single vasoactive medication                7
//   6 multiple vasoactive medication             12
//   7 dialysis techniques                         6
//   8 specific interventions IN the ICU           5
//   9 specific interventions OUTSIDE the ICU      6
//
// **TWO PAIRS ARE MUTUALLY EXCLUSIVE, AND THIS TILE MAKES THAT STRUCTURAL RATHER THAN A RULE TO REMEMBER.**
// Items 3 and 4 cannot both be scored: the source states that mechanical ventilatory support EXCLUDES
// supplementary ventilatory care. Items 5 and 6 likewise: "multiple" is not an addition to "single", it
// replaces it. This tile therefore offers ventilation as ONE three-way choice and vasoactive support as ONE
// three-way choice, so an implementation cannot score both members of either pair.
//
// THE ARITHMETIC IS THE PROOF, AND IT IS WORTH STATING. Summing all nine weights naively gives 66. The
// published maximum is 56, which is reachable only as 9 + 6 + 12 + 12 + 6 + 5 + 6 -- that is, exactly one of
// {3,4} and exactly one of {5,6}. The exclusivity is not an interpretation; it is the only reading under
// which the instrument's own stated maximum is achievable. A test asserts both the 56 ceiling and the 66
// naive sum, so the distinction cannot silently regress.
//
// ONE PUBLISHED SOURCE STATES THE MAXIMUM AS 63. That figure is inconsistent with the item weights under any
// exclusivity rule, and 56 is corroborated elsewhere and is what the weights produce. This tile uses 56 and
// records the disagreement rather than hiding it.
//
// ITEM 8 EXCLUDES ROUTINE CARE, WHICH IS THE COMMONEST SCORING ERROR. Specific interventions in the ICU
// means things like intubation, pacemaker insertion, cardioversion, endoscopy, emergency operation in the
// past 24 hours, or gastric lavage. It explicitly does NOT include routine radiographs, echocardiograms,
// ECGs, dressings, or the insertion of venous and arterial lines. Counting routine care here inflates a
// large fraction of ICU patients by five points.
//
// HIGH-STAKES AND OFTEN MISUSED: NEMS measures CONSUMED nursing workload for a period already worked. It is
// not an illness-severity score, not a mortality predictor, and not a triage tool -- a high NEMS does not
// mean a sicker patient and a low one does not mean a safe one. It is not a nurse-to-patient ratio and does
// not by itself determine safe staffing, which depends on skill mix, unit layout, patient acuity that NEMS
// does not capture, and local standards. It says nothing about the psychological and family-support work
// that occupies real nursing time and appears in none of its nine items, so it systematically under-counts
// the care of the dying and of distressed families (spec-v11 section 5.3). Staffing decisions stay with the
// nursing leadership.
//
// ITEMS, WEIGHTS, EXCLUSIVITY, AND THE MAXIMUM RE-FETCHED, NEVER RECALLED (spec-v97), transcribed from two
// faithful reproductions of the scoring table that agree on every value, with the sum-to-56 arithmetic as
// independent corroboration:
//   - Reis Miranda D, Moreno R, Iapichino G. Nine equivalents of nursing manpower use score (NEMS).
//     Intensive Care Med. 1997;23(7):760-765.

export const NEMS_INDEPENDENT = [
  { key: 'basicMonitoring', points: 9, text: 'Basic monitoring: hourly vital signs, regular record and calculation of fluid balance' },
  { key: 'ivMedication', points: 6, text: 'Intravenous medication, bolus or continuous — NOT including vasoactive or inotropic drugs, which are scored separately' },
  { key: 'dialysis', points: 6, text: 'Dialysis techniques (all)' },
  {
    key: 'interventionsInIcu', points: 5,
    text: 'Specific interventions IN the ICU: intubation, pacemaker insertion, cardioversion, endoscopy, emergency operation in the past 24 hours, gastric lavage. Routine radiographs, echocardiograms, ECGs, dressings, and venous or arterial line insertion do NOT count.',
  },
  { key: 'interventionsOutsideIcu', points: 6, text: 'Specific interventions OUTSIDE the ICU: a surgical or diagnostic procedure related to the severity of illness, making extra demand on ICU manpower' },
];

// One three-way choice, because items 3 and 4 are mutually exclusive.
export const NEMS_VENTILATION = [
  { value: 'none', points: 0, text: 'Neither' },
  { value: 'supplementary', points: 3, text: 'Supplementary ventilatory care: breathing spontaneously through an endotracheal tube, or supplementary oxygen by any method' },
  { value: 'mechanical', points: 12, text: 'Mechanical ventilatory support: any form of mechanical or assisted ventilation for 2 hours or more in the shift. This EXCLUDES supplementary ventilatory care rather than adding to it.' },
];

// One three-way choice, because items 5 and 6 are mutually exclusive.
export const NEMS_VASOACTIVE = [
  { value: 'none', points: 0, text: 'None' },
  { value: 'single', points: 7, text: 'A single vasoactive or inotropic drug, continuously intravenous' },
  { value: 'multiple', points: 12, text: 'More than one vasoactive or inotropic drug, regardless of type and dose, continuously intravenous. This REPLACES the single-drug score rather than adding to it.' },
];

export const NEMS_MAX = 56;
// What a naive implementation that scored every item would reach. Kept as an exported constant so the
// distinction is testable.
export const NEMS_NAIVE_SUM = NEMS_INDEPENDENT.reduce((a, i) => a + i.points, 0)
  + NEMS_VENTILATION.reduce((a, v) => a + v.points, 0)
  + NEMS_VASOACTIVE.reduce((a, v) => a + v.points, 0);

const NOTE = 'NEMS, the Nine Equivalents of Nursing Manpower Use Score (Reis Miranda and colleagues 1997), scores nine items for a total of 0 to 56. It measures NURSING WORKLOAD consumed, not illness severity: a stable ventilated patient on two vasoactive infusions is expensive in nursing time and may have an unremarkable severity score, while a patient dying of an untreatable illness may consume very little. Two pairs of items are mutually exclusive. Mechanical ventilatory support, worth 12, explicitly excludes supplementary ventilatory care, worth 3, rather than adding to it; and multiple vasoactive medications, worth 12, replaces the single-drug score of 7 rather than adding to it. This tile offers each pair as a single three-way choice so both members cannot be scored. The arithmetic is the proof: summing all nine weights naively gives 66, while the published maximum of 56 is reachable only by taking exactly one item from each exclusive pair. One published source states the maximum as 63, which is inconsistent with the item weights under any exclusivity rule; 56 is what the weights produce and is what this tile uses. The specific-interventions-in-the-ICU item excludes routine care, which is the commonest scoring error: routine radiographs, echocardiograms, ECGs, dressings, and venous or arterial line insertion do not count, and counting them inflates a large fraction of ICU patients by five points. NEMS measures workload for a period already worked. It is not an illness-severity score, not a mortality predictor, and not a triage tool, so a high score does not mean a sicker patient and a low one does not mean a safe one. It is not a nurse-to-patient ratio and does not by itself determine safe staffing, which depends on skill mix, unit layout, patient acuity it does not capture, and local standards. It says nothing about psychological and family-support work, which occupies real nursing time and appears in none of its nine items, so it systematically under-counts the care of the dying and of distressed families.';

function readBool(v) {
  if (v === '' || v === null || v === undefined) return null;
  if (v === true || v === 1) return true;
  if (v === false || v === 0) return false;
  const s = String(v).trim().toLowerCase();
  if (['yes', 'y', '1', 'true'].includes(s)) return true;
  if (['no', 'n', '0', 'false'].includes(s)) return false;
  return NaN;
}

// input: each NEMS_INDEPENDENT key as yes/no; ventilation and vasoactive each one of their option values.
export function nems(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const read = NEMS_INDEPENDENT.map((i) => ({ i, v: readBool(o[i.key]) }));
  const missing = read.filter((r) => r.v === null).map((r) => r.i.key);

  const vent = o.ventilation === '' || o.ventilation === null || o.ventilation === undefined
    ? null : NEMS_VENTILATION.find((v) => v.value === String(o.ventilation).trim());
  const vaso = o.vasoactive === '' || o.vasoactive === null || o.vasoactive === undefined
    ? null : NEMS_VASOACTIVE.find((v) => v.value === String(o.vasoactive).trim());
  if (vent === null) missing.push('ventilation');
  if (vaso === null) missing.push('vasoactive');

  if (missing.length) {
    return { valid: false, message: `Answer every item. Still needed: ${missing.join(', ')}.` };
  }
  const bad = read.filter((r) => Number.isNaN(r.v)).map((r) => r.i.key);
  if (bad.length) {
    return { valid: false, message: `Each yes/no item must be yes or no. Unrecognized: ${bad.join(', ')}.` };
  }
  if (vent === undefined) {
    return { valid: false, message: 'Ventilation must be none, supplementary, or mechanical. Supplementary and mechanical are mutually exclusive, so they are one choice rather than two items.' };
  }
  if (vaso === undefined) {
    return { valid: false, message: 'Vasoactive support must be none, single, or multiple. Single and multiple are mutually exclusive, so they are one choice rather than two items.' };
  }

  const selected = read.filter((r) => r.v).map((r) => ({ key: r.i.key, points: r.i.points }));
  const total = selected.reduce((a, c) => a + c.points, 0) + vent.points + vaso.points;

  return {
    valid: true,
    total,
    max: NEMS_MAX,
    ventilation: vent.value,
    ventilationPoints: vent.points,
    vasoactive: vaso.value,
    vasoactivePoints: vaso.points,
    selected,
    bandLabel: `NEMS ${total} of ${NEMS_MAX}`,
    band: `NEMS ${total} of ${NEMS_MAX}. Ventilation contributed ${vent.points} and vasoactive support ${vaso.points}; each is a single choice because its two items are mutually exclusive, which is why the maximum is ${NEMS_MAX} rather than the ${NEMS_NAIVE_SUM} a naive sum of all nine would give. This measures nursing workload consumed, not illness severity, and it is not a nurse-to-patient ratio.`,
    note: NOTE,
  };
}
