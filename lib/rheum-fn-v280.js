// spec-v280: rheumatology function & case definition — the Health Assessment
// Questionnaire Disability Index (HAQ-DI) and the ASAS classification criteria for
// axial spondyloarthritis. Both ids were verified absent (spec-v85 §6.2) by a
// direct scan of app.js AND the MCP adapter set first. v280 runs no AI and makes
// no runtime network call.
//
// HAQ-DI reports a disability index; ASAS presents the criteria's own
// classification (for study enrollment, NOT a diagnosis). Neither is a diagnosis
// or a treatment order (spec-v11 §5.3).
//
// DEFINITIONS RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across >= 2
// independent open sources at implementation (see each function header).

import { num, r3 } from './num.js';

function isYes(v) {
  return v === true || v === 1 || v === '1' || v === 'on' || v === 'yes' || v === 'true';
}
function catScore(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0 || n > 3) return null;
  return Math.round(n);
}

// --- HAQ-DI (Fries 1980) ------------------------------------------------------
// Fries JF, Spitz P, Kraines RG, Holman HR. Measurement of patient outcome in
// arthritis. Arthritis Rheum. 1980;23(2):137-145. Eight functional categories,
// each scored 0-3 (0 without any difficulty, 1 some, 2 much, 3 unable); the
// category score is the HIGHEST among its items. Aids/devices or help from another
// person for a category raises a category scored 0 or 1 to 2 (much difficulty).
// The HAQ-DI is the mean of the (adjusted) category scores, computable only when
// at least 6 of the 8 categories are answered; range 0-3, higher = worse. Bands:
// <= 1 mild-to-moderate, > 1 to 2 moderate-to-severe, > 2 severe; MCID ~0.22.
// Scoring cross-verified against standard HAQ references (the maximum-item rule,
// the aid-to-2 adjustment, and the 6-of-8 completeness rule are identical across
// sources).
const HAQ_CATS = ['dressing', 'arising', 'eating', 'walking', 'hygiene', 'reach', 'grip', 'activities'];
const HAQ_NOTE = 'Health Assessment Questionnaire Disability Index (HAQ-DI; Fries 1980): the mean of 8 functional-category scores (dressing/grooming, arising, eating, walking, hygiene, reach, grip, activities), each 0-3 (0 no difficulty to 3 unable). A category is the highest of its items; aids/devices or help from another person raise a category scored 0 or 1 to 2. Computed when >= 6 of 8 categories are answered; range 0-3, higher = more disability. Bands: <= 1 mild-to-moderate, > 1 to 2 moderate-to-severe, > 2 severe. Minimum clinically important difference ~0.22. A disability index, not a diagnosis or treatment order.';

export function haqDi(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let sum = 0;
  let answered = 0;
  let aidApplied = 0;
  for (const cat of HAQ_CATS) {
    const raw = catScore(o[cat]);
    if (raw === null) continue;
    answered += 1;
    let adj = raw;
    if ((raw === 0 || raw === 1) && isYes(o[`${cat}Aid`])) { adj = 2; aidApplied += 1; }
    sum += adj;
  }
  if (answered < 6) {
    return { valid: false, message: 'Answer at least 6 of the 8 functional categories (0 = no difficulty to 3 = unable).' };
  }
  const score = num('HAQ-DI', r3(sum / answered), { min: 0, max: 3 });
  const band = score > 2 ? 'severe disability' : (score > 1 ? 'moderate-to-severe disability' : 'mild-to-moderate difficulty');
  return {
    valid: true,
    score,
    band,
    abnormal: score > 1,
    answered,
    aidApplied,
    bandLabel: `HAQ-DI ${score} — ${band}`,
    detail: `HAQ-DI ${score}/3 (mean of ${answered} of 8 categories answered${aidApplied ? `; aids/devices adjustment raised ${aidApplied} categor${aidApplied === 1 ? 'y' : 'ies'} to 2` : ''}). ${band}. MCID ~0.22.`,
    note: HAQ_NOTE,
  };
}

// --- ASAS axial-SpA classification criteria (Rudwaleit 2009) ------------------
// Rudwaleit M, van der Heijde D, Landewé R, et al. Ann Rheum Dis. 2009;68(6):
// 777-783. Entry: back pain >= 3 months AND age at onset < 45 years. Then either
// the IMAGING arm (sacroiliitis on imaging -- active MRI or definite radiographic
// sacroiliitis by the modified New York grading -- PLUS >= 1 SpA feature) OR the
// CLINICAL arm (HLA-B27 positive PLUS >= 2 OTHER SpA features). SpA features (11):
// inflammatory back pain, arthritis, enthesitis (heel), uveitis, dactylitis,
// psoriasis, Crohn's/colitis, good response to NSAIDs, family history of SpA,
// HLA-B27, elevated CRP. In the imaging arm HLA-B27 counts as one of the >= 1
// features; in the clinical arm it is the anchor and does NOT count toward the
// >= 2 "other" features. Cross-verified against the primary paper and independent
// reproductions (SPARTAN, review articles), which agree on both arms and the list.
// This is a CLASSIFICATION (study-enrollment) tool, not a diagnostic test.
const ASAS_FEATURES = ['ibp', 'arthritis', 'enthesitis', 'uveitis', 'dactylitis', 'psoriasis', 'ibd', 'nsaidResponse', 'familyHistory', 'hlaB27', 'elevatedCrp'];
const ASAS_LABELS = {
  ibp: 'inflammatory back pain', arthritis: 'arthritis', enthesitis: 'enthesitis (heel)',
  uveitis: 'uveitis', dactylitis: 'dactylitis', psoriasis: 'psoriasis', ibd: "Crohn's/colitis",
  nsaidResponse: 'good NSAID response', familyHistory: 'family history of SpA', hlaB27: 'HLA-B27', elevatedCrp: 'elevated CRP',
};
const ASAS_NOTE = 'ASAS classification criteria for axial spondyloarthritis (Rudwaleit 2009): entry = back pain >= 3 months with age at onset < 45 years, then either the imaging arm (sacroiliitis on imaging by active MRI or definite radiographic modified-New-York grading, plus >= 1 SpA feature) or the clinical arm (HLA-B27 positive plus >= 2 other SpA features). SpA features: inflammatory back pain, arthritis, enthesitis (heel), uveitis, dactylitis, psoriasis, Crohn\'s/colitis, good NSAID response, family history of SpA, HLA-B27, elevated CRP. This CLASSIFIES for study enrollment (it admits radiographic and non-radiographic axial SpA) and is not a diagnostic test or a treatment order.';

export function asasAxspa(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const entry = isYes(o.backPain3mo) && isYes(o.ageOnsetUnder45);
  const present = ASAS_FEATURES.filter((f) => isYes(o[f]));
  const featureCount = present.length;
  const otherFeatureCount = present.filter((f) => f !== 'hlaB27').length;
  const sacroiliitis = isYes(o.sacroiliitisImaging);
  const hlaB27 = isYes(o.hlaB27);

  const imagingArm = sacroiliitis && featureCount >= 1;
  const clinicalArm = hlaB27 && otherFeatureCount >= 2;

  if (!isYes(o.backPain3mo) && !isYes(o.ageOnsetUnder45) && featureCount === 0 && !sacroiliitis) {
    return { valid: false, message: 'Enter the entry criteria (chronic back pain >= 3 months, age at onset < 45), then the imaging finding and/or the SpA features.' };
  }

  const meets = entry && (imagingArm || clinicalArm);
  const arms = [];
  if (entry && imagingArm) arms.push('imaging arm (sacroiliitis on imaging + >= 1 SpA feature)');
  if (entry && clinicalArm) arms.push('clinical arm (HLA-B27 + >= 2 other SpA features)');

  let reason;
  if (!entry) reason = 'entry criterion not met (needs back pain >= 3 months AND age at onset < 45 years)';
  else if (meets) reason = `meets via the ${arms.join(' and the ')}`;
  else reason = 'entry met, but neither arm is satisfied (imaging arm needs sacroiliitis + >= 1 feature; clinical arm needs HLA-B27 + >= 2 other features)';

  return {
    valid: true,
    meets,
    score: meets ? 'meets' : 'does not meet',
    band: meets ? 'meets ASAS axial-SpA classification' : 'does not meet ASAS axial-SpA classification',
    abnormal: meets,
    featureCount,
    bandLabel: meets ? 'Meets ASAS axial-SpA criteria' : 'Does not meet ASAS axial-SpA criteria',
    detail: `${meets ? 'MEETS' : 'Does not meet'} the ASAS axial-SpA classification — ${reason}. SpA features present (${featureCount}): ${featureCount ? present.map((f) => ASAS_LABELS[f]).join(', ') : 'none'}. Classification for study enrollment, not a diagnosis.`,
    note: ASAS_NOTE,
  };
}
