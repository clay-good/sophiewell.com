// spec-v278: the Phoenix Sepsis Score — the 2024 international-consensus
// organ-dysfunction score that now DEFINES pediatric sepsis. Four organ systems
// (respiratory 0-3, cardiovascular 0-6, coagulation 0-2, neurologic 0-2) sum to
// a 0-13 total. In a child with suspected/confirmed infection: Phoenix >= 2 =
// sepsis; sepsis + cardiovascular sub-score >= 1 = septic shock. The id was
// verified absent (spec-v85 §6.2) by a direct scan of app.js AND the MCP adapter
// set first. v278 runs no AI and makes no runtime network call.
//
// This computes an organ-dysfunction score and states the consensus threshold —
// it is NOT a diagnosis and NOT a treatment order (spec-v11 §5.3). Recognition
// and treatment stay with the clinician.
//
// DEFINITION RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across >= 2
// independent open sources at implementation:
//   - Schlapbach LJ, Watson RS, Sorce LR, et al; SCCM Pediatric Sepsis
//     Definition Task Force. International Consensus Criteria for Pediatric
//     Sepsis and Septic Shock. JAMA. 2024;331(8):665-674.
//   - Sanchez-Pinto LN, Bennett TD, DeWitt PE, et al. Development and Validation
//     of the Phoenix Criteria for Pediatric Sepsis and Septic Shock. JAMA.
//     2024;331(8):675-686.
//   Point tables cross-checked against the open-access `phoenix` R-package
//   vignette (CRAN) and an independent Phoenix-logic reference; the two agree on
//   every threshold. NOTE: the verified lactate bands are 5 to <11 mmol/L (1 pt)
//   and >= 11 mmol/L (2 pt) — NOT the 2-4.9 sketch in the spec draft, which
//   spec-v97 required re-verifying.

import { num } from './num.js';

function pos(v, lo, hi) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < lo || n > hi) return null;
  return n;
}
function isYes(v) {
  return v === true || v === 1 || v === '1' || v === 'on' || v === 'yes' || v === 'true';
}

// --- Cardiovascular: age-banded mean-arterial-pressure thresholds (mmHg) ------
// Each band gives [twoPointCeiling, onePointCeiling]: MAP < twoPointCeiling -> 2
// points; twoPointCeiling <= MAP <= onePointCeiling -> 1 point; else 0. Source:
// Phoenix cardiovascular MAP table (JAMA 2024), verbatim from the consensus
// paper and the CRAN `phoenix` vignette (identical values).
//   0 to <1 mo:      <17 -> 2, 17-30 -> 1, >=31 -> 0
//   1 to <12 mo:     <25 -> 2, 25-38 -> 1, >=39 -> 0
//   12 to <24 mo:    <31 -> 2, 31-43 -> 1, >=44 -> 0
//   24 to <60 mo:    <32 -> 2, 32-44 -> 1, >=45 -> 0
//   60 to <144 mo:   <36 -> 2, 36-48 -> 1, >=49 -> 0
//   144 to <216 mo:  <38 -> 2, 38-51 -> 1, >=52 -> 0
const MAP_BANDS = [
  { maxMonths: 1, two: 17, one: 30 },
  { maxMonths: 12, two: 25, one: 38 },
  { maxMonths: 24, two: 31, one: 43 },
  { maxMonths: 60, two: 32, one: 44 },
  { maxMonths: 144, two: 36, one: 48 },
  { maxMonths: Infinity, two: 38, one: 51 },
];
function mapBand(ageMonths) {
  for (const b of MAP_BANDS) if (ageMonths < b.maxMonths) return b;
  return MAP_BANDS[MAP_BANDS.length - 1];
}
function mapPoints(ageMonths, map) {
  const b = mapBand(ageMonths);
  if (map < b.two) return 2;
  if (map <= b.one) return 1;
  return 0;
}

// --- Respiratory sub-score (0-3) ---------------------------------------------
// support: 'none' | 'support' (any non-invasive respiratory support) | 'imv'
// (invasive mechanical ventilation). ratioType: 'pf' (PaO2/FiO2) | 'sf'
// (SpO2/FiO2, valid only when SpO2 <= 97%).
//   0: no support, OR PaO2/FiO2 >=400 / SpO2/FiO2 >=292
//   1: PaO2/FiO2 <400 (or SpO2/FiO2 <292) on ANY respiratory support
//   2: PaO2/FiO2 100-200 (or SpO2/FiO2 148-220) AND IMV
//   3: PaO2/FiO2 <100 (or SpO2/FiO2 <148) AND IMV
function respPoints(ratioType, ratio, support) {
  if (support !== 'support' && support !== 'imv') return 0;
  const sf = ratioType === 'sf';
  const onePt = sf ? 292 : 400;
  const twoLo = sf ? 148 : 100;
  const twoHi = sf ? 220 : 200;
  if (support === 'imv') {
    if (ratio < twoLo) return 3;
    if (ratio <= twoHi) return 2;
    return ratio < onePt ? 1 : 0;
  }
  // any (non-invasive) respiratory support
  return ratio < onePt ? 1 : 0;
}

const NOTE = 'Phoenix Sepsis Score (2024 international consensus, SCCM/JAMA): an organ-dysfunction score across four systems — respiratory (0-3), cardiovascular (0-6), coagulation (0-2), neurologic (0-2), total 0-13. In a child with suspected or confirmed infection, a total >= 2 meets the consensus definition of sepsis, and sepsis with a cardiovascular sub-score >= 1 meets the definition of septic shock. Score the worst values in the time window. SpO2/FiO2 is used only when SpO2 <= 97%. This reports a score and the consensus threshold — not a diagnosis or a treatment order; recognition and treatment stay with the clinician.';

import { boundsAdvisory } from './bounds.js';

// spec-v1234: this tile's criteria are threshold comparisons, so past a
// threshold the size of the number stops mattering. Envelope and wording from
// BOUNDS + boundsAdvisory in lib/bounds.js; nothing clinical is decided here,
// and the check runs after the tile's own missing-value branch (spec-v1207) so a
// blank field is still asked for by name.
function envelopeFault(rows) {
  for (const [key, v] of rows) {
    // spec-v1234: `Number('')` is 0 and 0 is finite, so a blank field reached
    // `boundsAdvisory` as a measurement of zero -- which is BELOW several
    // envelopes. `phoenix-sepsis`'s own worked example leaves the INR out, and
    // this printed "Input below the plausible range for INR (0.5 to 20)" over the
    // whole tile. The repo has hit this exact trap at spec-v1038, spec-v1040 and
    // spec-v1213; `measured()` in lib/num.js exists for it.
    if (v === null || v === undefined) continue;
    if (typeof v === 'string' && v.trim() === '') continue;
    if (!Number.isFinite(Number(v))) continue;
    const fault = boundsAdvisory(key, Number(v));
    if (fault) return { valid: false, message: fault, band: fault };
  }
  return null;
}

export function phoenixSepsis(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const ageMonths = pos(o.ageMonths, 0, 300);

  // Gather every clinical input; a blank field is "not measured" and contributes
  // no points (finite-guarded — never NaN).
  const ratioType = o.ratioType === 'sf' ? 'sf' : 'pf';
  const support = o.support === 'support' || o.support === 'imv' ? o.support : 'none';
  const ratio = pos(o.ratio, 0, 2000);
  const vasoactives = pos(o.vasoactives, 0, 20);
  const lactate = pos(o.lactate, 0, 60);
  const map = pos(o.map, 0, 250);
  const platelets = pos(o.platelets, 0, 3000);
  const inr = pos(o.inr, 0, 30);
  const ddimer = pos(o.ddimer, 0, 500);
  const fibrinogen = pos(o.fibrinogen, 0, 3000);
  const gcs = pos(o.gcs, 3, 15);
  const pupilsFixed = isYes(o.pupilsFixed);

  const anyEntered = [ratio, vasoactives, lactate, map, platelets, inr, ddimer, fibrinogen, gcs]
    .some((v) => v !== null) || pupilsFixed || support !== 'none';
  if (ageMonths === null || !anyEntered) {
    return { valid: false, message: 'Enter the patient age (in months) and the available organ-system values.' };
  }
  // Only the three whose unit matches: lactate mmol/L, platelets x10^9/L
  // (= x10^3/uL) and MAP mmHg against BOUNDS.sbp -- a mean pressure and a
  // systolic one are the same quantity in the same unit for the purpose of
  // "no patient has this". The ratio, D-dimer, fibrinogen and vasoactive count
  // have no entry in the table.
  // THE RAW VALUES, not the read ones: `pos(o.lactate, 0, 60)` returns null for a
  // lactate of 400, and null here means "not measured", so the impossible value
  // was being DISCARDED in silence and the tile scored the other organ systems
  // as if the lactate had never been drawn (spec-v1217's shape). Reading `o.*`
  // is what lets the refusal see it at all.
  const phxFault = envelopeFault([['lactate', o.lactate], ['platelets', o.platelets], ['inr', o.inr]]);
  if (phxFault) return phxFault;

  // Respiratory (0-3)
  const resp = (support !== 'none' && ratio !== null) ? respPoints(ratioType, ratio, support) : 0;

  // Cardiovascular (0-6): vasoactive count + lactate band + age-banded MAP
  const vasoPts = vasoactives === null ? 0 : (vasoactives >= 2 ? 2 : (vasoactives >= 1 ? 1 : 0));
  const lactPts = lactate === null ? 0 : (lactate >= 11 ? 2 : (lactate >= 5 ? 1 : 0));
  const mapPts = map === null ? 0 : mapPoints(ageMonths, map);
  const cardio = Math.min(6, vasoPts + lactPts + mapPts);

  // Coagulation (0-2, max 2): 1 pt each for low platelets, high INR, high D-dimer, low fibrinogen
  const coagItems = (platelets !== null && platelets < 100 ? 1 : 0)
    + (inr !== null && inr > 1.3 ? 1 : 0)
    + (ddimer !== null && ddimer > 2 ? 1 : 0)
    + (fibrinogen !== null && fibrinogen < 100 ? 1 : 0);
  const coag = Math.min(2, coagItems);

  // Neurologic (0-2): fixed pupils = 2; else GCS <= 10 = 1
  const neuro = pupilsFixed ? 2 : (gcs !== null && gcs <= 10 ? 1 : 0);

  const score = num('Phoenix', Math.min(13, resp + cardio + coag + neuro), { min: 0, max: 13 });

  const systems = [];
  if (resp > 0) systems.push(`respiratory ${resp}`);
  if (cardio > 0) systems.push(`cardiovascular ${cardio}`);
  if (coag > 0) systems.push(`coagulation ${coag}`);
  if (neuro > 0) systems.push(`neurologic ${neuro}`);

  // spec-v1104: which of the nine organ-system values were never entered.
  //
  // Every limb above reads `x === null ? 0 : ...`, so a value nobody measured
  // scores the same as one measured and normal. The score is a SUM, so it is
  // monotone: what is entered is a FLOOR, and the two readings that depend on
  // NOT reaching a threshold are the ones a gap can invent.
  //
  //   phoenixSepsis({ ageMonths: 60, platelets: 250 })
  //     -> "Phoenix 0/13 — below the Phoenix >= 2 organ-dysfunction threshold for sepsis"
  //
  // One normal platelet count ruled out sepsis in a child. And with the whole
  // cardiovascular limb blank, a genuine Phoenix 7 septic shock read as
  // "Phoenix 5 — sepsis threshold", because shock turns on cardiovascular >= 1.
  //
  // Two things are real answers and are not counted as gaps: `support: 'none'`
  // means room air, which scores no respiratory points correctly, and the fixed-
  // pupils checkbox is a checkbox (rule 4). Everything else is a measurement.
  const missing = [];
  if (support !== 'none' && ratio === null) missing.push('an oxygenation ratio');
  if (vasoactives === null) missing.push('a vasoactive-medication count');
  if (lactate === null) missing.push('a lactate');
  if (map === null) missing.push('a mean arterial pressure');
  if (platelets === null) missing.push('a platelet count');
  if (inr === null) missing.push('an INR');
  if (ddimer === null) missing.push('a D-dimer');
  if (fibrinogen === null) missing.push('a fibrinogen');
  if (gcs === null) missing.push('a Glasgow Coma Scale score');
  const cardioMissing = missing.filter((m) => m.includes('vasoactive') || m.includes('lactate') || m.includes('arterial'));

  const sepsis = score >= 2;
  const shock = sepsis && cardio >= 1;
  const bandLabel = shock
    ? `Phoenix ${score} — septic shock threshold`
    : (sepsis
      ? `Phoenix ${score} — sepsis threshold`
      // Rule 14: the headline is what gets read, so it cannot say "below" while a
      // paragraph underneath explains that the panel is half taken.
      : (missing.length
        ? `Phoenix ${score} so far — below the threshold on what was entered`
        : `Phoenix ${score} — below sepsis threshold`));
  const category = shock
    ? 'with suspected/confirmed infection, meets the consensus definition of SEPTIC SHOCK (Phoenix >= 2 and cardiovascular >= 1)'
    : (sepsis
      ? 'with suspected/confirmed infection, meets the consensus definition of SEPSIS (Phoenix >= 2)'
      : (missing.length
        ? `scored from ${9 - missing.length} of 9 organ-system values, which is below the `
          + 'Phoenix >= 2 threshold on those alone. The ones still blank can only raise it, so '
          + 'this is a floor and does not rule sepsis out'
        : 'below the Phoenix >= 2 organ-dysfunction threshold for sepsis'));

  // Rule 13 the other way round: Phoenix >= 2 rules sepsis IN and needs no
  // footing, but SHOCK is a second threshold on the cardiovascular limb alone,
  // and "sepsis, not shock" is a rule-out of its own.
  const shockCaveat = (sepsis && !shock && cardioMissing.length)
    ? ` Septic shock is not ruled out: the cardiovascular sub-score is 0 and ${cardioMissing.join(', ')}`
      + ` ${cardioMissing.length === 1 ? 'was' : 'were'} not entered — any of them can only raise it.`
    : '';

  return {
    valid: true,
    score,
    resp,
    cardio,
    coag,
    neuro,
    sepsis,
    shock,
    abnormal: sepsis,
    bandLabel,
    missing,
    band: `Phoenix Sepsis Score ${score}/13 — ${category}.${shockCaveat}`,
    detail: `Sub-scores: respiratory ${resp}, cardiovascular ${cardio}, coagulation ${coag}, neurologic ${neuro}.${systems.length ? ` Dysfunctional systems: ${systems.join(', ')}.` : ' No organ-system dysfunction scored.'}${missing.length ? ` Not entered: ${missing.join(', ')}.` : ''}`,
    note: NOTE,
  };
}
