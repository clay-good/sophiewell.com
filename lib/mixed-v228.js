// spec-v228: microcytic-anemia RBC discrimination indices — England & Fraser,
// Sirdah, the RDW Index (RDWI), Srivastava, and Ehsani. Each differentiates
// beta-thalassemia trait (BTT) from iron-deficiency anemia (IDA) in a microcytic
// hypochromic CBC, from the complete-blood-count values already in hand. Every id
// was verified absent by a direct scan of app.js first (spec-v85 §6.2); the
// catalog already carries the sibling mentzer and shine-lal indices but none of
// these five. v228 runs no AI and makes no runtime network call.
//
// These SCREEN / stratify which of two diagnoses is more likely — they are NOT a
// diagnosis and NOT a treatment order (spec-v11 §5.3); hemoglobin electrophoresis
// and iron studies remain the confirmatory tests.
//
//   englandFraser - England & Fraser discriminant function
//   sirdah        - Sirdah index
//   rdwi          - RDW Index (RDWI)
//   srivastava    - Srivastava index
//   ehsani        - Ehsani index
//
// FORMULAS AND CUTOFFS RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified
// across >= 2 independent open sources at implementation:
//   Vehapoglu A, et al. Anemia. 2014;2014:576738 (PMC4003757), and
//   Sirdah M, et al. Int J Lab Hematol. 2008;30(4):324-330 cutoff table via
//   Jameel T, et al. (PMC4003440). England & Fraser formula additionally
//   confirmed against the QJM / laboratory-samples discriminant-function reviews.

import { num, r1 } from './num.js';

function pos(v, lo, hi) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < lo || n > hi) return null;
  return n;
}

// Shared verdict: value below the cutoff favors beta-thalassemia trait, above it
// favors iron-deficiency anemia, exactly at it is indeterminate. `favorsBtt` is
// the abnormal/highlight flag because it is the result that prompts hemoglobin
// electrophoresis.
function verdict(value, cutoff) {
  if (value < cutoff) return { favorsBtt: true, dir: 'favors beta-thalassemia trait' };
  if (value > cutoff) return { favorsBtt: false, dir: 'favors iron-deficiency anemia' };
  return { favorsBtt: false, dir: 'is at the cutoff (indeterminate)' };
}

// --- England & Fraser --------------------------------------------------------
// England JM, Fraser PM. Lancet. 1973;1(7801):449-452. Discriminant function
// DF = MCV - RBC - (5 x Hb) - 3.4. DF < 0 favors beta-thalassemia trait, > 0
// favors iron deficiency. MCV in fL, RBC in 10^6/uL, Hb in g/dL.
const EF_NOTE = 'England & Fraser discriminant function (England JM, Fraser PM. Lancet. 1973;1(7801):449-452): DF = MCV - RBC - (5 x Hb) - 3.4, with MCV in fL, RBC in 10^6/uL, Hb in g/dL. DF < 0 favors beta-thalassemia trait; DF > 0 favors iron-deficiency anemia. A screening discriminant, not a diagnosis or treatment order — confirm with hemoglobin electrophoresis and iron studies.';
export function englandFraser(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const mcv = pos(o.mcv, 30, 200);
  const rbc = pos(o.rbc, 0.5, 10);
  const hb = pos(o.hb, 1, 25);
  if (mcv === null || rbc === null || hb === null) {
    return { valid: false, message: 'Enter MCV (fL), RBC (10^6/uL), and hemoglobin (g/dL).' };
  }
  const score = r1(num('England-Fraser', mcv - rbc - 5 * hb - 3.4, { min: -300, max: 300 }));
  const v = verdict(score, 0);
  return { valid: true, score, abnormal: v.favorsBtt, bandLabel: `England-Fraser ${score}`, band: `England & Fraser discriminant function ${score} — ${v.dir} (cutoff 0).`, detail: `DF = MCV ${mcv} - RBC ${rbc} - (5 x Hb ${hb}) - 3.4.`, note: EF_NOTE };
}

// --- Sirdah ------------------------------------------------------------------
// Sirdah M, Tarazi I, Al Najjar E, Al Haddad R. Int J Lab Hematol.
// 2008;30(4):324-330. Index = MCV - RBC - (3 x Hb). < 27 favors beta-thalassemia
// trait, > 27 favors iron deficiency.
const SIRDAH_NOTE = 'Sirdah index (Sirdah M, et al. Int J Lab Hematol. 2008;30(4):324-330): MCV - RBC - (3 x Hb), with MCV in fL, RBC in 10^6/uL, Hb in g/dL. < 27 favors beta-thalassemia trait; > 27 favors iron-deficiency anemia. A screening discriminant, not a diagnosis or treatment order — confirm with hemoglobin electrophoresis and iron studies.';
export function sirdah(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const mcv = pos(o.mcv, 30, 200);
  const rbc = pos(o.rbc, 0.5, 10);
  const hb = pos(o.hb, 1, 25);
  if (mcv === null || rbc === null || hb === null) {
    return { valid: false, message: 'Enter MCV (fL), RBC (10^6/uL), and hemoglobin (g/dL).' };
  }
  const score = r1(num('Sirdah', mcv - rbc - 3 * hb, { min: -300, max: 300 }));
  const v = verdict(score, 27);
  return { valid: true, score, abnormal: v.favorsBtt, bandLabel: `Sirdah ${score}`, band: `Sirdah index ${score} — ${v.dir} (cutoff 27).`, detail: `MCV ${mcv} - RBC ${rbc} - (3 x Hb ${hb}).`, note: SIRDAH_NOTE };
}

// --- RDW Index (RDWI) --------------------------------------------------------
// Jayabose S, et al. J Pediatr Hematol Oncol. 1999 (RDWI). Index =
// (MCV x RDW) / RBC. < 220 favors beta-thalassemia trait, > 220 favors iron
// deficiency. RDW as a percentage.
const RDWI_NOTE = 'RDW Index / RDWI (Jayabose S, et al. J Pediatr Hematol Oncol. 1999): (MCV x RDW) / RBC, with MCV in fL, RDW in %, RBC in 10^6/uL. < 220 favors beta-thalassemia trait; > 220 favors iron-deficiency anemia. A screening discriminant, not a diagnosis or treatment order — confirm with hemoglobin electrophoresis and iron studies.';
export function rdwi(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const mcv = pos(o.mcv, 30, 200);
  const rdw = pos(o.rdw, 5, 60);
  const rbc = pos(o.rbc, 0.5, 10);
  if (mcv === null || rdw === null || rbc === null) {
    return { valid: false, message: 'Enter MCV (fL), RDW (%), and RBC (10^6/uL).' };
  }
  const score = r1(num('RDWI', (mcv * rdw) / rbc, { min: 0, max: 100000 }));
  const v = verdict(score, 220);
  return { valid: true, score, abnormal: v.favorsBtt, bandLabel: `RDWI ${score}`, band: `RDW Index ${score} — ${v.dir} (cutoff 220).`, detail: `(MCV ${mcv} x RDW ${rdw}) / RBC ${rbc}.`, note: RDWI_NOTE };
}

// --- Srivastava --------------------------------------------------------------
// Srivastava PC. Lancet. 1973;1(7807):832 (MCH/RBC). Index = MCH / RBC. < 3.8
// favors beta-thalassemia trait, > 3.8 favors iron deficiency. MCH in pg.
const SRIVASTAVA_NOTE = 'Srivastava index (Srivastava PC. Lancet. 1973;1(7807):832): MCH / RBC, with MCH in pg and RBC in 10^6/uL. < 3.8 favors beta-thalassemia trait; > 3.8 favors iron-deficiency anemia. A screening discriminant, not a diagnosis or treatment order — confirm with hemoglobin electrophoresis and iron studies.';
export function srivastava(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const mch = pos(o.mch, 5, 60);
  const rbc = pos(o.rbc, 0.5, 10);
  if (mch === null || rbc === null) {
    return { valid: false, message: 'Enter MCH (pg) and RBC (10^6/uL).' };
  }
  const score = r1(num('Srivastava', mch / rbc, { min: 0, max: 1000 }));
  const v = verdict(score, 3.8);
  return { valid: true, score, abnormal: v.favorsBtt, bandLabel: `Srivastava ${score}`, band: `Srivastava index ${score} — ${v.dir} (cutoff 3.8).`, detail: `MCH ${mch} / RBC ${rbc}.`, note: SRIVASTAVA_NOTE };
}

// --- Ehsani ------------------------------------------------------------------
// Ehsani MA, et al. J Pediatr Hematol Oncol. 2009 (originally 2005). Index =
// MCV - (10 x RBC). < 15 favors beta-thalassemia trait, > 15 favors iron
// deficiency.
const EHSANI_NOTE = 'Ehsani index (Ehsani MA, et al. J Pediatr Hematol Oncol.): MCV - (10 x RBC), with MCV in fL and RBC in 10^6/uL. < 15 favors beta-thalassemia trait; > 15 favors iron-deficiency anemia. A screening discriminant, not a diagnosis or treatment order — confirm with hemoglobin electrophoresis and iron studies.';
export function ehsani(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const mcv = pos(o.mcv, 30, 200);
  const rbc = pos(o.rbc, 0.5, 10);
  if (mcv === null || rbc === null) {
    return { valid: false, message: 'Enter MCV (fL) and RBC (10^6/uL).' };
  }
  const score = r1(num('Ehsani', mcv - 10 * rbc, { min: -300, max: 300 }));
  const v = verdict(score, 15);
  return { valid: true, score, abnormal: v.favorsBtt, bandLabel: `Ehsani ${score}`, band: `Ehsani index ${score} — ${v.dir} (cutoff 15).`, detail: `MCV ${mcv} - (10 x RBC ${rbc}).`, note: EHSANI_NOTE };
}
