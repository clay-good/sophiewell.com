// spec-v165 (the third feature spec of the spec-v162 Cross-Discipline
// Completion program): four deterministic diagnostic-radiology classification /
// quantification instruments that fill a zero structured-reporting gap. None
// duplicates a live tile; v165 runs no AI and makes no runtime network call.
//
//   acrTirads        - ACR TI-RADS thyroid-nodule points -> TR level + FNA rule
//   adrenalCtWashout - absolute / relative washout (adenoma vs non-adenoma)
//   bosniak          - Bosniak 2019 renal-cyst classification (I/II/IIF/III/IV)
//   ctEffectiveDose  - CT effective dose = DLP x region k factor
//
// Per the spec-v100 §2 doctrine (including the §2 classification-tile
// clarification) acrTirads/bosniak are deterministic input->class mappings and
// adrenalCtWashout/ctEffectiveDose are guarded arithmetic. Citations live inline
// in lib/meta.js; the renderers in views/group-v165.js render the spec-v50 §3
// posture note and defer the management decision to the clinician (spec-v11
// §5.3).
//
// SOURCE-GOVERNANCE (point tables / thresholds cross-verified, spec-v97):
//   - acrTirads (Tessler FN, et al, J Am Coll Radiol 2017;14(5):587-595;
//     cross-verified vs the Radiology Assistant TI-RADS guide and the RSNA
//     User's Guide): composition cystic/spongiform 0, mixed 1, solid 2;
//     echogenicity anechoic 0, hyper/iso 1, hypo 2, very-hypo 3; shape
//     wider-than-tall 0, taller-than-wide 3; margin smooth/ill-defined 0,
//     lobulated/irregular 2, extra-thyroidal extension 3; echogenic foci ADDITIVE
//     — macrocalcification 1, peripheral/rim 2, punctate 3 (summed). Total → TR1
//     0, TR2 1-2, TR3 3, TR4 4-6, TR5 ≥7. FNA / follow size: TR3 FNA ≥2.5 cm /
//     follow ≥1.5 cm; TR4 FNA ≥1.5 / follow ≥1.0; TR5 FNA ≥1.0 / follow ≥0.5.
//   - adrenalCtWashout (Caoili EM, et al, Radiology 2002;222(3):629-633):
//     APW = (E − D)/(E − U) × 100 (≥ 60% adenoma); RPW = (E − D)/E × 100 (≥ 40%
//     adenoma); unenhanced ≤ 10 HU is a lipid-rich adenoma. Guards (E − U) and E.
//   - bosniak (Silverman SG, et al, Radiology 2019;292(2):475-488; cross-verified
//     vs the Radiology Assistant Bosniak-2019 page and PMC8017011): top-down
//     first-match — enhancing nodule (obtuse ≥4 mm or acute any size) IV; thick
//     (≥4 mm) wall/septa or obtuse ≤3 mm protrusion III; minimally-thickened
//     (3 mm) wall/septa or ≥4 smooth thin enhancing septa IIF; 1-3 thin septa or
//     any calcification II; thin smooth wall, no septa I. Calcification never
//     upgrades class in v2019.
//   - ctEffectiveDose (AAPM Report 96 / EUR 16262 conversion coefficients;
//     cross-verified across two CT-dose references): effective dose (mSv) = DLP
//     (mGy·cm) × k; adult k (mSv/mGy·cm) head 0.0021, head-neck 0.0031, neck
//     0.0059, chest 0.014, abdomen 0.015, pelvis 0.015, abdomen-pelvis 0.015.

import { num, r1, r2 } from './num.js';

// Strictly positive bounded reader.
function pos(v, max = Infinity) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0 || n > max) return null;
  return n;
}
// Finite value allowing zero/negative (HU attenuation), bounded.
function huVal(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < -200 || n > 600) return null;
  return n;
}
// Read a select keyed against an options map, returning the matched key or ''.
function pick(v, map) {
  return typeof v === 'string' && Object.prototype.hasOwnProperty.call(map, v) ? v : '';
}
function flag(v) { return v === true || v === '1' || v === 1 || v === 'on'; }

// --- 2.1 ACR TI-RADS --------------------------------------------------------
const TIRADS_NOTE = 'ACR TI-RADS (Tessler FN, et al, J Am Coll Radiol 2017;14(5):587-595). Points: composition (cystic/spongiform 0, mixed 1, solid 2) + echogenicity (anechoic 0, hyper/iso 1, hypo 2, very-hypo 3) + shape (wider-than-tall 0, taller-than-wide 3) + margin (smooth/ill-defined 0, lobulated/irregular 2, extra-thyroidal extension 3) + echogenic foci (ADDITIVE: macrocalcification 1, peripheral/rim 2, punctate 3). Total → TR1 0, TR2 1-2, TR3 3, TR4 4-6, TR5 ≥7. FNA / follow by max diameter: TR3 FNA ≥2.5 / follow ≥1.5 cm; TR4 FNA ≥1.5 / follow ≥1.0; TR5 FNA ≥1.0 / follow ≥0.5.';

const TIRADS_COMPOSITION = { cystic: 0, spongiform: 0, mixed: 1, solid: 2 };
const TIRADS_ECHO = { anechoic: 0, hyper: 1, iso: 1, hypo: 2, veryhypo: 3 };
const TIRADS_SHAPE = { wider: 0, taller: 3 };
const TIRADS_MARGIN = { smooth: 0, illdefined: 0, lobulated: 2, ete: 3 };
// FNA / follow thresholds (cm) per TR level.
const TIRADS_RULE = {
  1: { fna: null, follow: null, label: 'TR1 — benign' },
  2: { fna: null, follow: null, label: 'TR2 — not suspicious' },
  3: { fna: 2.5, follow: 1.5, label: 'TR3 — mildly suspicious' },
  4: { fna: 1.5, follow: 1.0, label: 'TR4 — moderately suspicious' },
  5: { fna: 1.0, follow: 0.5, label: 'TR5 — highly suspicious' },
};

function tiradsLevel(points) {
  if (points <= 0) return 1;
  if (points <= 2) return 2;
  if (points === 3) return 3;
  if (points <= 6) return 4;
  return 5;
}

export function acrTirads(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const comp = pick(o.composition, TIRADS_COMPOSITION);
  const echo = pick(o.echogenicity, TIRADS_ECHO);
  const shape = pick(o.shape, TIRADS_SHAPE);
  const margin = pick(o.margin, TIRADS_MARGIN);
  const missing = [];
  if (!comp) missing.push('composition');
  if (!echo) missing.push('echogenicity');
  if (!shape) missing.push('shape');
  if (!margin) missing.push('margin');
  if (missing.length) return { valid: false, message: `Choose the ${missing.join(', ')}.` };
  // Echogenic foci are additive (sum all that apply).
  const fociMacro = flag(o.fociMacro) ? 1 : 0;
  const fociRim = flag(o.fociRim) ? 2 : 0;
  const fociPunctate = flag(o.fociPunctate) ? 3 : 0;
  const points = TIRADS_COMPOSITION[comp] + TIRADS_ECHO[echo] + TIRADS_SHAPE[shape] + TIRADS_MARGIN[margin] + fociMacro + fociRim + fociPunctate;
  const level = tiradsLevel(points);
  const rule = TIRADS_RULE[level];
  const diameter = o.diameter === '' || o.diameter === null || o.diameter === undefined ? null : pos(o.diameter, 20);
  let action;
  if (rule.fna === null) {
    action = 'No FNA and no follow-up imaging indicated by size.';
  } else if (diameter === null) {
    action = `Enter the nodule maximum diameter to apply the size rule (FNA ≥ ${rule.fna} cm, follow ≥ ${rule.follow} cm).`;
  } else if (diameter >= rule.fna) {
    action = `Diameter ${diameter} cm ≥ ${rule.fna} cm → recommend FNA.`;
  } else if (diameter >= rule.follow) {
    action = `Diameter ${diameter} cm ≥ ${rule.follow} cm → recommend follow-up ultrasound.`;
  } else {
    action = `Diameter ${diameter} cm below the ${rule.follow} cm follow-up threshold → no FNA or follow-up by size.`;
  }
  const suspicious = level >= 4;
  return {
    valid: true,
    points,
    level,
    abnormal: suspicious,
    bandLabel: rule.label,
    band: `${points} points → ${rule.label}.`,
    detail: action,
    note: TIRADS_NOTE,
  };
}

// --- 2.2 Adrenal CT washout -------------------------------------------------
const WASHOUT_NOTE = 'Adrenal CT washout (Caoili EM, et al, Radiology 2002;222(3):629-633). Absolute washout APW = (enhanced − delayed)/(enhanced − unenhanced) × 100; ≥ 60% indicates a lipid-poor adenoma. Relative washout RPW = (enhanced − delayed)/enhanced × 100; ≥ 40% indicates an adenoma (used when an unenhanced scan is unavailable). An unenhanced attenuation ≤ 10 HU already indicates a lipid-rich adenoma. Attenuations are entered in Hounsfield units.';

export function adrenalCtWashout(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const e = huVal(o.enhanced);
  const d = huVal(o.delayed);
  const u = o.unenhanced === '' || o.unenhanced === null || o.unenhanced === undefined ? null : huVal(o.unenhanced);
  const missing = [];
  if (e === null) missing.push('enhanced/portal-venous attenuation (HU)');
  if (d === null) missing.push('delayed attenuation (HU)');
  if (missing.length) return { valid: false, message: `Enter the ${missing.join(', ')}.` };
  if (e === 0) return { valid: false, message: 'Enhanced attenuation cannot be 0 HU (relative washout divides by it).' };
  const rpw = r1(num('RPW', ((e - d) / e) * 100, { min: -1e4, max: 1e4 }));
  let apw = null;
  let apwAdenoma = null;
  if (u !== null) {
    if (e - u === 0) {
      return { valid: false, message: 'Enhanced and unenhanced attenuation are equal; absolute washout is undefined. Use the relative washout (omit the unenhanced value) or recheck the values.' };
    }
    apw = r1(num('APW', ((e - d) / (e - u)) * 100, { min: -1e4, max: 1e4 }));
    apwAdenoma = apw >= 60;
  }
  const rpwAdenoma = rpw >= 40;
  const lipidRich = u !== null && u <= 10;
  const adenoma = apwAdenoma || rpwAdenoma || lipidRich;
  const primary = apw !== null
    ? `Absolute washout ${apw}% — ${apwAdenoma ? 'lipid-poor adenoma (≥ 60%)' : 'does not meet the 60% adenoma threshold'}.`
    : `Relative washout ${rpw}% — ${rpwAdenoma ? 'adenoma (≥ 40%)' : 'does not meet the 40% adenoma threshold'}.`;
  return {
    valid: true,
    apw,
    rpw,
    apwAdenoma,
    rpwAdenoma,
    lipidRich,
    abnormal: !adenoma,
    bandLabel: adenoma ? 'Adenoma features' : 'Indeterminate / non-adenoma',
    band: primary,
    detail: `${apw !== null ? `Relative washout ${rpw}% (≥ 40% adenoma). ` : ''}${lipidRich ? `Unenhanced ${u} HU ≤ 10 HU indicates a lipid-rich adenoma. ` : ''}Washout below threshold does not exclude an adenoma and may warrant further work-up.`,
    note: WASHOUT_NOTE,
  };
}

// --- 2.3 Bosniak 2019 -------------------------------------------------------
const BOSNIAK_NOTE = 'Bosniak classification of cystic renal masses, version 2019 (Silverman SG, et al, Radiology 2019;292(2):475-488). Class by the most significant feature (top-down): an enhancing nodule (obtuse protrusion ≥ 4 mm or any acute-margined protrusion) → IV; thick (≥ 4 mm) enhancing wall/septa or an obtuse ≤ 3 mm protrusion → III; minimally-thickened (3 mm) enhancing wall/septa or ≥ 4 smooth thin enhancing septa → IIF; 1-3 thin (≤ 2 mm) septa or any calcification → II; thin smooth non-enhancing wall, no septa → I. Calcification never upgrades class in v2019. Approximate malignancy: I ~0%, II <1%, IIF ~5%, III ~50%, IV ~90%.';

const BOSNIAK_WALL = { thin: 'thin', minimal: 'minimal', thick: 'thick' };
const BOSNIAK_SEPTA = { none: 'none', few: 'few', many: 'many' };
const BOSNIAK_PROTRUSION = { none: 'none', obtuseSmall: 'obtuseSmall', obtuseLarge: 'obtuseLarge', acute: 'acute' };
const BOSNIAK_CLASS = {
  I: { label: 'Class I — benign simple cyst', malignancy: '~0%', followup: 'No follow-up; benign.' },
  II: { label: 'Class II — benign minimally complex', malignancy: '<1%', followup: 'No follow-up; benign.' },
  IIF: { label: 'Class IIF — follow-up recommended', malignancy: '~5%', followup: 'Imaging follow-up (e.g. 6 months, then annually).' },
  III: { label: 'Class III — indeterminate', malignancy: '~50%', followup: 'Consider surgery, ablation, or active surveillance.' },
  IV: { label: 'Class IV — clearly malignant features', malignancy: '~90%', followup: 'Surgical / oncologic management.' },
};

export function bosniak(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const wall = pick(o.wall, BOSNIAK_WALL);
  const septa = pick(o.septa, BOSNIAK_SEPTA);
  const protrusion = pick(o.protrusion, BOSNIAK_PROTRUSION);
  const missing = [];
  if (!wall) missing.push('wall thickness');
  if (!septa) missing.push('septa');
  if (!protrusion) missing.push('enhancing protrusion / nodule');
  if (missing.length) return { valid: false, message: `Choose the ${missing.join(', ')}.` };
  const calcification = flag(o.calcification);
  let cls;
  if (protrusion === 'obtuseLarge' || protrusion === 'acute') cls = 'IV';
  else if (protrusion === 'obtuseSmall' || wall === 'thick' || septa === 'many') {
    // thick wall/septa OR obtuse <=3mm protrusion -> III; >=4 thin enhancing septa -> IIF
    if (protrusion === 'obtuseSmall' || wall === 'thick') cls = 'III';
    else cls = 'IIF'; // septa === 'many' (>=4 thin enhancing) without thickening/protrusion
  } else if (wall === 'minimal') cls = 'IIF';
  else if (septa === 'few' || calcification) cls = 'II';
  else cls = 'I';
  const def = BOSNIAK_CLASS[cls];
  return {
    valid: true,
    cls,
    abnormal: cls === 'III' || cls === 'IV',
    bandLabel: def.label,
    band: `Bosniak ${cls} — malignancy ${def.malignancy}.`,
    detail: `${def.label}. ${def.followup}`,
    note: BOSNIAK_NOTE,
  };
}

// --- 2.4 CT effective dose --------------------------------------------------
const CTDOSE_NOTE = 'CT effective dose (AAPM Report 96 / EUR 16262 conversion coefficients). Effective dose (mSv) = dose-length product DLP (mGy·cm) × region k factor (mSv/mGy·cm). Adult k: head 0.0021, head-neck 0.0031, neck 0.0059, chest 0.014, abdomen 0.015, pelvis 0.015, abdomen-pelvis 0.015. A population estimate (ICRP-60 weighting), not patient-specific organ dosimetry; pediatric factors differ and are not used here.';

const CT_K = {
  head: { k: 0.0021, label: 'head' },
  headneck: { k: 0.0031, label: 'head and neck' },
  neck: { k: 0.0059, label: 'neck' },
  chest: { k: 0.014, label: 'chest' },
  abdomen: { k: 0.015, label: 'abdomen' },
  pelvis: { k: 0.015, label: 'pelvis' },
  abdomenpelvis: { k: 0.015, label: 'abdomen and pelvis' },
};

export function ctEffectiveDose(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const dlp = pos(o.dlp, 100000);
  const region = pick(o.region, CT_K);
  const missing = [];
  if (dlp === null) missing.push('dose-length product DLP (mGy·cm)');
  if (!region) missing.push('body region');
  if (missing.length) return { valid: false, message: `Enter the ${missing.join(', ')}.` };
  const { k, label } = CT_K[region];
  const dose = r2(num('effective dose', dlp * k, { min: 0, max: 1e5 }));
  // Background-equivalent framing: US annual natural background ~3 mSv.
  const bgMonths = r1(num('background', (dose / 3) * 12, { min: 0, max: 1e6 }));
  return {
    valid: true,
    dose,
    k,
    region: label,
    bandLabel: 'Effective dose',
    band: `Effective dose ${dose} mSv (${label}, k ${k}).`,
    detail: `Effective dose = DLP ${dlp} × k ${k} = ${dose} mSv ≈ ${bgMonths} months of natural background radiation (~3 mSv/year). Population estimate, not organ dosimetry.`,
    note: CTDOSE_NOTE,
  };
}
