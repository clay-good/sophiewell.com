// spec-v161 (fourth and CLOSING feature spec of the spec-v157 Subspecialty Depth
// program): four endocrine / metabolic / nutrition-support arithmetic computes.
// The endocrine/metabolic screening arithmetic was absent despite a deep
// nephrology/endocrine surface. v161 runs no AI and makes no runtime network
// call; with it the Subspecialty Depth program is complete.
//
//   arr                     - Aldosterone-Renin Ratio (primary-aldosteronism screen)
//   calciumPhosphateProduct - Ca x PO4 product (CKD-MBD)
//   freeThyroxineIndex      - Free Thyroxine Index (FTI / T7)
//   nitrogenBalance         - Nitrogen balance (nutrition support)
//
// Per the spec-v100 §2 doctrine each is closed-form arithmetic over finite-checked
// labs. Citations live inline in lib/meta.js; the renderers in
// views/group-v161.js render the spec-v50 §3 posture note (screening/monitoring
// arithmetic over labs; confirmation and treatment are clinical) and defer the
// decision to the clinician (spec-v11 §5.3).
//
// FORMULAS / CONVERSIONS / CUTOFFS RE-FETCHED, NEVER RECALLED (spec-v97), each
// cross-verified across >= 2 independent sources at implementation.
// SOURCE-GOVERNANCE:
//   - arr (Funder JW, et al, Endocrine Society, J Clin Endocrinol Metab 2016;
//     101(5):1889-1916): ARR = plasma aldosterone (PAC, ng/dL) / renin. Renin is
//     either plasma renin activity (PRA, ng/mL/h) or direct renin concentration
//     (DRC, mIU/L). UNIT DISCIPLINE is the dominant concern: the screening cutoff
//     differs by renin unit and is never compared across unit systems. With PAC
//     in ng/dL and PRA in ng/mL/h the commonly cited cutoff is ARR ~20-40 (a
//     representative 30) with PAC >= 15 ng/dL as a positive screen; with DRC in
//     mIU/L the cutoff is ~3.7 (range 2.4-4.9). A positive screen warrants
//     confirmatory testing, not a diagnosis. Renin guarded > 0.
//   - calciumPhosphateProduct (KDIGO CKD-MBD; historical KDOQI 2003 target):
//     product = Ca (mg/dL) x PO4 (mg/dL), units mg^2/dL^2. Historical caution
//     threshold > 55. Contemporary KDIGO guidance favors tracking Ca and PO4
//     individually over the product (surfaced). SI: Ca mg/dL = mmol/L x 4.008,
//     PO4 mg/dL = mmol/L x 3.097.
//   - freeThyroxineIndex (Clark F, Horn DB, J Clin Endocrinol Metab 1965;25(1):
//     39-45): FTI = total T4 x (T3RU% / reference-mean T3RU%); reference mean
//     defaults to 30%. Corrects total T4 for thyroid-binding-globulin changes
//     (pregnancy/estrogen raise TBG and total T4 but FTI stays normal). Ratio
//     guarded (reference > 0).
//   - nitrogenBalance (ASPEN nutrition-support standard): N balance (g/day) =
//     (protein g / 6.25) - (24h UUN g + insensible losses); insensible default
//     4 g/day. 6.25 g protein per g nitrogen. Positive = anabolic, negative =
//     catabolic.

import { num, r1, r2 } from './num.js';

function pos(v, max = Infinity) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0 || n > max) return null;
  return n;
}
function nonneg(v, max = Infinity) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0 || n > max) return null;
  return n;
}

// --- 2.1 Aldosterone-Renin Ratio --------------------------------------------
const ARR_NOTE = 'Aldosterone-Renin Ratio for primary-aldosteronism screening (Funder JW, et al, Endocrine Society, J Clin Endocrinol Metab 2016;101(5):1889-1916): ARR = plasma aldosterone (ng/dL) ÷ renin. With plasma renin activity (PRA, ng/mL/h) the commonly cited cutoff is roughly 20–40 (representative 30) with aldosterone ≥ 15 ng/dL as a positive screen; with direct renin concentration (DRC, mIU/L) the cutoff is about 3.7 (range 2.4–4.9). The cutoff differs by renin unit and is never compared across unit systems. A positive screen warrants confirmatory testing, not a diagnosis.';

const RENIN_UNIT = {
  pra: { label: 'PRA (ng/mL/h)', cutoff: 30, cutoffText: '≈ 20–40 (representative 30)' },
  drc: { label: 'DRC (mIU/L)', cutoff: 3.7, cutoffText: '≈ 3.7 (range 2.4–4.9)' },
};

export function arr(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const aldo = pos(o.aldosterone, 200); // ng/dL
  const renin = pos(o.renin, 1000);
  const unit = typeof o.reninUnit === 'string' && RENIN_UNIT[o.reninUnit] ? o.reninUnit : '';
  const missing = [];
  if (aldo === null) missing.push('plasma aldosterone (ng/dL)');
  if (renin === null) missing.push('renin value (> 0)');
  if (!unit) missing.push('renin assay unit (PRA or DRC)');
  if (missing.length) {
    return { valid: false, message: `Enter the ${missing.join(', ')}.` };
  }
  const u = RENIN_UNIT[unit];
  const ratio = r1(num('ARR', aldo / renin, { min: 0, max: 100000 })); // renin guarded > 0
  const aldoAdequate = aldo >= 15;
  const ratioHigh = ratio >= u.cutoff;
  const positive = ratioHigh && aldoAdequate;
  return {
    valid: true,
    ratio,
    unit,
    positive,
    abnormal: positive,
    bandLabel: positive ? 'Positive screen' : 'Not a positive screen',
    band: `ARR ${ratio} (aldosterone ng/dL ÷ ${u.label}) — ${positive ? 'positive screen' : 'not a positive screen'}.`,
    detail: `Cutoff for this unit: ARR ${u.cutoffText}, with aldosterone ≥ 15 ng/dL. ${ratioHigh ? 'Ratio above cutoff' : 'Ratio below cutoff'}; aldosterone ${aldoAdequate ? '≥' : '<'} 15 ng/dL. A positive screen warrants confirmatory testing.`,
    note: ARR_NOTE,
  };
}

// --- 2.2 Calcium-Phosphate Product ------------------------------------------
const CAPO4_NOTE = 'Calcium-phosphate product for CKD–mineral and bone disorder (historical KDOQI target; KDIGO CKD-MBD guidance): product = serum calcium (mg/dL) × serum phosphate (mg/dL), in mg²/dL². A product above 55 mg²/dL² was a historical caution threshold. Contemporary KDIGO guidance favors tracking calcium and phosphate individually over the product, so the product is shown as context, not a target. SI conversion: calcium mg/dL = mmol/L × 4.008, phosphate mg/dL = mmol/L × 3.097.';

const CAPO4_UNIT = { 'mg-dl': 'mg/dL', 'mmol-l': 'mmol/L' };

export function calciumPhosphateProduct(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const unit = typeof o.unit === 'string' && CAPO4_UNIT[o.unit] ? o.unit : 'mg-dl';
  const caRaw = pos(o.calcium, 30);
  const poRaw = pos(o.phosphate, 30);
  const missing = [];
  if (caRaw === null) missing.push(`serum calcium (${CAPO4_UNIT[unit]})`);
  if (poRaw === null) missing.push(`serum phosphate (${CAPO4_UNIT[unit]})`);
  if (missing.length) {
    return { valid: false, message: `Enter the ${missing.join(', ')}.` };
  }
  // Convert to mg/dL when entered in SI.
  const ca = unit === 'mmol-l' ? caRaw * 4.008 : caRaw;
  const po = unit === 'mmol-l' ? poRaw * 3.097 : poRaw;
  const product = r1(num('Ca×PO4', ca * po, { min: 0, max: 2000 }));
  const high = product > 55;
  return {
    valid: true,
    product,
    abnormal: high,
    bandLabel: high ? 'Above the historical > 55 threshold' : 'At or below the historical 55 threshold',
    band: `Ca × PO₄ ${product} mg²/dL² — ${high ? 'above' : 'at or below'} the historical 55 caution threshold.`,
    detail: 'Contemporary KDIGO guidance favors tracking calcium and phosphate individually over the product; the product is context, not a target.',
    note: CAPO4_NOTE,
  };
}

// --- 2.3 Free Thyroxine Index -----------------------------------------------
const FTI_NOTE = 'Free Thyroxine Index (FTI / T7) (Clark F, Horn DB, J Clin Endocrinol Metab 1965;25(1):39-45): FTI = total T4 × (T3-resin uptake % ÷ reference-mean T3RU%), the binding-corrected free-hormone estimate. The reference mean defaults to 30% (normal T3RU ~25–35%). FTI corrects total T4 for thyroid-binding-globulin changes — pregnancy and estrogen raise TBG and total T4 but the FTI stays normal. A legacy index used where direct free-T4 immunoassay is unavailable.';

export function freeThyroxineIndex(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const t4 = pos(o.t4, 60); // µg/dL
  const t3ru = pos(o.t3ru, 100); // %
  const ref = pos(o.reference, 100) ?? 30; // reference-mean T3RU %, default 30
  const missing = [];
  if (t4 === null) missing.push('total T4 (µg/dL)');
  if (t3ru === null) missing.push('T3-resin uptake (%)');
  if (missing.length) {
    return { valid: false, message: `Enter the ${missing.join(', ')}.` };
  }
  const fti = r2(num('FTI', t4 * (t3ru / ref), { min: 0, max: 1000 })); // ref guarded > 0
  return {
    valid: true,
    fti,
    reference: ref,
    abnormal: false, // an index, not a flagged threshold (lab-specific reference range applies)
    bandLabel: 'Free thyroxine index',
    band: `FTI ${fti} — total T4 ${t4} × (T3RU ${t3ru}% ÷ ${ref}% reference).`,
    detail: 'Corrects total T4 for binding-protein changes; interpret against the local FTI reference range (low in hypothyroidism, high in hyperthyroidism). Reference mean defaults to 30%.',
    note: FTI_NOTE,
  };
}

// --- 2.4 Nitrogen Balance ---------------------------------------------------
const NBAL_NOTE = 'Nitrogen balance for nutrition support (ASPEN standard formulation): N balance (g/day) = (24-hour protein intake g ÷ 6.25) − (24-hour urine urea nitrogen g + insensible losses). Protein is ~16% nitrogen, so 6.25 g protein carries 1 g nitrogen. The insensible-loss constant defaults to 4 g/day (skin, stool, respiration). A positive balance is anabolic (intake exceeds losses), a negative balance catabolic. Requires a complete, accurate 24-hour urine collection and is unreliable in significant renal impairment.';

export function nitrogenBalance(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const protein = nonneg(o.protein, 1000); // g/day
  const uun = nonneg(o.uun, 200); // g/day
  const insensible = nonneg(o.insensible, 50) ?? 4; // g/day, default 4
  const missing = [];
  if (protein === null) missing.push('24-hour protein intake (g)');
  if (uun === null) missing.push('24-hour urine urea nitrogen (g)');
  if (missing.length) {
    return { valid: false, message: `Enter the ${missing.join(', ')}.` };
  }
  const intakeN = protein / 6.25;
  const losses = uun + insensible;
  const balance = r1(num('N balance', intakeN - losses, { min: -200, max: 200 }));
  const anabolic = balance >= 0;
  const sign = balance > 0 ? '+' : '';
  return {
    valid: true,
    balance,
    intakeN: r1(intakeN),
    abnormal: !anabolic,
    bandLabel: anabolic ? 'Anabolic / neutral' : 'Catabolic',
    band: `Nitrogen balance ${sign}${balance} g/day — ${anabolic ? 'anabolic / neutral (intake ≥ losses)' : 'catabolic (losses exceed intake)'}.`,
    detail: `N intake ${r1(intakeN)} g (protein ${protein} ÷ 6.25) − (UUN ${uun} + insensible ${insensible}) = ${sign}${balance} g/day.`,
    note: NBAL_NOTE,
  };
}
