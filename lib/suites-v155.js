// spec-v155 (the fifth implementation spec of the spec-v150 Post-Parity
// Coverage program): four deterministic instruments, each plugging a named hole
// in an otherwise-complete suite. None duplicates a live tile; v155 runs no AI
// and makes no runtime network call.
//
//   mipi                 - Mantle Cell Lymphoma International Prognostic Index
//                          (the lymphoma-index suite had nccn-ipi/r-ipi/flipi
//                          but no mantle-cell index)
//   forrest              - Forrest endoscopic-stigmata classification for UGI
//                          bleeding (the rebleed-risk anchor beside gbs/rockall/
//                          aims65/oakland)
//   wagner-dfu           - Wagner (Meggitt-Wagner) diabetic-foot-ulcer grade
//   university-texas-dfu - University of Texas diabetic-foot-ulcer grade × stage
//                          (wifi grades limb threat but the wound-care grading
//                          systems were absent)
//
// PRECISE-DAPT (spec-v155 §2.1) is DEFERRED: the published score is a
// restricted-cubic-spline continuous nomogram, not a per-variable integer point
// table, and no independent source publishes a verbatim per-value lookup across
// the full input ranges (MDCalc computes the spline internally; only the
// graphical nomogram + anchor maxima are reproducible). Under the spec-v97
// >= 2-source verbatim rule it cannot be cross-verified, so it is parked with
// crib-ii / gail-bcrat rather than approximated (spec-v155 §2.1 / §7).
//
// Per the spec-v100 §2 doctrine forrest / wagner-dfu / university-texas-dfu are
// deterministic input -> class mappings (the §2 classification clarification:
// every combination, including the UT grade × stage grid, resolves to exactly
// one defined cell); mipi is a closed-form continuous index whose log10(LDH/ULN)
// and log10(WBC) terms are the chief NaN risk and are guarded (LDH/ULN and WBC
// must be > 0 or the tile returns a surfaced valid:false). Citations live inline
// in lib/meta.js; the renderers in views/group-v155.js render the spec-v50 §3
// posture note and defer the management decision (DAPT duration, therapy
// intensity, endoscopic therapy, debridement/amputation) to the clinician
// (spec-v11 §5.3).
//
// COEFFICIENTS / TABLES RE-FETCHED, NEVER RECALLED (spec-v97), each cross-
// verified across >= 2 independent sources at implementation. SOURCE-GOVERNANCE:
//   - mipi (Hoster E, Dreyling M, Klapper W, et al, Blood 2008;111(2):558-565 +
//     erratum): index = 0.03535·age + 0.6978·(ECOG 2-4) + 1.367·log10(LDH/ULN)
//     + 0.9393·log10(WBC). CRITICAL: WBC is the ABSOLUTE count in cells per
//     microliter inside log10 (the Hoster erratum warns that inserting WBC as
//     counts per 10^-9 L / "thousands" gives wrong results — for 8000/µL use
//     log10(8000)=3.903, not log10(8)). Bands: low < 5.7, intermediate 5.7 to
//     < 6.2, high >= 6.2. The "simplified MIPI" point table is a distinct
//     variant — the biologic continuous index is the shipped compute.
//   - forrest (Forrest JA, Finlayson ND, Shearman DJ, Lancet 1974;2:394-397):
//     Ia spurting, Ib oozing, IIa non-bleeding visible vessel (all high-risk
//     stigmata -> endoscopic therapy), IIb adherent clot (intermediate), IIc
//     flat pigmented spot, III clean base (low-risk). Untreated rebleed risk is
//     reported as approximate ranges (no single canonical value): Ia/Ib ~55%,
//     IIa ~43%, IIb ~22%, IIc ~10%, III ~5%.
//   - wagner-dfu (Wagner FW Jr, Foot Ankle 1981;2(2):64-122): grade 0 intact/at-
//     risk (no open lesion), 1 superficial, 2 deep to tendon/capsule/bone (no
//     abscess/osteomyelitis), 3 deep with abscess/osteomyelitis, 4 localized
//     (forefoot/heel) gangrene, 5 whole-foot gangrene.
//   - university-texas-dfu (Lavery LA, Armstrong DG, Harkless LB, J Foot Ankle
//     Surg 1996;35(6):528-531; validation Armstrong, Diabetes Care 1998;21(5):
//     855-859): grade 0 epithelialized pre/post-ulcer, 1 superficial (not to
//     tendon/capsule/bone), 2 to tendon/capsule, 3 to bone/joint; stage A clean,
//     B infection, C ischemia, D infection + ischemia. Higher grade AND stage ->
//     poorer healing/amputation odds (Stage D ~76.5% vs ~3.5% midfoot-or-higher
//     amputation; probe-to-bone 18.3% vs 2.0%).

import { num, r2 } from './num.js';

// Read one numeric input: '' / null / undefined / non-finite -> null (so a
// caller can surface a complete-the-fields fallback).
function fin(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

// --- 2.2 MIPI ----------------------------------------------------------------
const MIPI_NOTE = 'Mantle Cell Lymphoma International Prognostic Index (Hoster E, Dreyling M, Klapper W, et al, Blood 2008;111(2):558-565) — the biologic prognostic index for advanced-stage mantle cell lymphoma: 0.03535·age(yr) + 0.6978·(1 if ECOG 2–4) + 1.367·log₁₀(LDH/upper-limit-of-normal) + 0.9393·log₁₀(WBC per µL). Bands: low < 5.7, intermediate 5.7 to < 6.2, high ≥ 6.2. WBC is the absolute count in cells per microliter inside the log (the erratum warns that using thousands/µL gives the wrong result). The simplified-MIPI point table is a distinct variant; this is the continuous biologic index.';

export function mipi(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const age = fin(o.age);
  const ldh = fin(o.ldh);
  const uln = fin(o.uln);
  const wbc = fin(o.wbc);
  const ecogRaw = o.ecog;
  const ecogChosen = ecogRaw === '0' || ecogRaw === '1' || ecogRaw === 0 || ecogRaw === 1;
  const missing = [];
  if (age === null) missing.push('age');
  if (!ecogChosen) missing.push('ECOG status');
  if (ldh === null) missing.push('LDH');
  if (uln === null) missing.push('LDH upper limit of normal');
  if (wbc === null) missing.push('WBC');
  if (missing.length) {
    return { valid: false, message: `Enter all fields — still needed: ${missing.join(', ')}.` };
  }
  // log10 domain guard: LDH, ULN, WBC, and age must be > 0 or the index is
  // undefined (log of 0 / a negative). This is the chief NaN path; surface it.
  if (!(age > 0) || !(ldh > 0) || !(uln > 0) || !(wbc > 0)) {
    return { valid: false, message: 'Age, LDH, ULN, and WBC must each be greater than 0.' };
  }
  const ecogHigh = ecogRaw === '1' || ecogRaw === 1;
  const ratio = ldh / uln;
  const raw = 0.03535 * age
    + 0.6978 * (ecogHigh ? 1 : 0)
    + 1.367 * Math.log10(ratio)
    + 0.9393 * Math.log10(wbc);
  const index = num('MIPI index', raw, { min: -100, max: 100 });
  const score = r2(index);
  let band; let abnormal;
  if (index < 5.7) { band = 'low'; abnormal = false; }
  else if (index < 6.2) { band = 'intermediate'; abnormal = true; }
  else { band = 'high'; abnormal = true; }
  return {
    valid: true,
    score,
    bandLabel: band.replace(/^./, (m) => m.toUpperCase()),
    abnormal,
    ldhRatio: r2(ratio),
    band: `MIPI ${score} — ${band} risk.`,
    detail: `0.03535·age ${age} + 0.6978·(ECOG ${ecogHigh ? '2–4' : '0–1'} = ${ecogHigh ? 1 : 0}) + 1.367·log₁₀(LDH/ULN ${r2(ratio)}) + 0.9393·log₁₀(WBC ${wbc}/µL) = ${score}.`,
    note: MIPI_NOTE,
  };
}

// --- 2.3 Forrest classification ----------------------------------------------
const FORREST_NOTE = 'Forrest classification (Forrest JA, Finlayson ND, Shearman DJ, Lancet 1974;2:394-397) — the endoscopic-stigmata grading of a bleeding peptic ulcer that anchors rebleed risk and the decision to apply endoscopic therapy. Class Ia (active spurting), Ib (active oozing), and IIa (non-bleeding visible vessel) are high-risk stigmata that warrant endoscopic haemostasis; IIb (adherent clot) is intermediate; IIc (flat pigmented spot) and III (clean ulcer base) are low-risk. Untreated rebleeding risk falls across the classes (approximately Ia/Ib ~55%, IIa ~43%, IIb ~22%, IIc ~10%, III ~5%; reported as ranges in the literature).';

const FORREST = {
  Ia: { desc: 'active spurting haemorrhage', tier: 'high', rebleed: '~55%' },
  Ib: { desc: 'active oozing haemorrhage', tier: 'high', rebleed: '~50%' },
  IIa: { desc: 'non-bleeding visible vessel', tier: 'high', rebleed: '~43%' },
  IIb: { desc: 'adherent clot', tier: 'intermediate', rebleed: '~22%' },
  IIc: { desc: 'flat pigmented spot', tier: 'low', rebleed: '~10%' },
  III: { desc: 'clean ulcer base', tier: 'low', rebleed: '~5%' },
};
const FORREST_TIER = {
  high: 'high-risk stigmata — endoscopic therapy indicated',
  intermediate: 'intermediate risk',
  low: 'low-risk stigmata',
};

export function forrest(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const k = typeof o.klass === 'string' ? o.klass : '';
  const entry = FORREST[k];
  if (!entry) {
    return { valid: false, message: 'Choose the endoscopic finding (Forrest Ia, Ib, IIa, IIb, IIc, or III).' };
  }
  const abnormal = entry.tier === 'high';
  return {
    valid: true,
    klass: k,
    bandLabel: entry.desc.replace(/^./, (m) => m.toUpperCase()),
    abnormal,
    tier: entry.tier,
    band: `Forrest ${k} — ${entry.desc}: ${FORREST_TIER[entry.tier]}.`,
    detail: `Approximate untreated rebleeding risk ${entry.rebleed}.`,
    note: FORREST_NOTE,
  };
}

// --- 2.4 Wagner (Meggitt-Wagner) diabetic foot ulcer grade -------------------
const WAGNER_NOTE = 'Wagner (Meggitt-Wagner) diabetic foot ulcer grade (Wagner FW Jr, Foot Ankle 1981;2(2):64-122) — the depth/extent grading of a diabetic foot lesion: grade 0 intact skin / pre- or post-ulcerative at-risk foot (no open lesion), 1 superficial ulcer (not past subcutaneous tissue), 2 deep ulcer to tendon, capsule, or bone without abscess or osteomyelitis, 3 deep ulcer with abscess or osteomyelitis, 4 localized (forefoot/heel) gangrene, 5 gangrene of the whole foot. Higher grades carry poorer healing and higher amputation odds.';

const WAGNER = [
  'intact skin / pre- or post-ulcerative at-risk foot (no open lesion)',
  'superficial ulcer (not past subcutaneous tissue)',
  'deep ulcer to tendon, capsule, or bone (no abscess or osteomyelitis)',
  'deep ulcer with abscess or osteomyelitis',
  'localized (forefoot or heel) gangrene',
  'gangrene of the whole foot',
];

export function wagnerDfu(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const g = fin(o.grade);
  if (g === null || !Number.isInteger(g) || g < 0 || g > 5) {
    return { valid: false, message: 'Choose the Wagner grade (0–5).' };
  }
  const abnormal = g >= 3;
  return {
    valid: true,
    grade: g,
    bandLabel: WAGNER[g].replace(/^./, (m) => m.toUpperCase()),
    abnormal,
    band: `Wagner grade ${g} — ${WAGNER[g]}.`,
    detail: g >= 3
      ? 'Grade 3+ involves deep infection or gangrene — surgical / vascular evaluation.'
      : 'Lower grade — local wound care with offloading and risk-factor control.',
    note: WAGNER_NOTE,
  };
}

// --- 2.5 University of Texas diabetic foot ulcer grade × stage ----------------
const UT_NOTE = 'University of Texas diabetic foot ulcer classification (Lavery LA, Armstrong DG, Harkless LB, J Foot Ankle Surg 1996; validation Armstrong DG, Diabetes Care 1998;21(5):855-859) — a two-axis grid: grade (depth) 0 epithelialized pre/post-ulcerative lesion, 1 superficial wound not involving tendon/capsule/bone, 2 wound penetrating to tendon or capsule, 3 wound penetrating to bone or joint; stage A clean, B infection, C ischemia, D infection + ischemia. Outcomes worsen with increasing grade and stage (in the validation, infected + ischemic Stage D had ~76.5% midfoot-or-higher amputation vs ~3.5% in less advanced stages; probe-to-bone wounds 18.3% vs 2.0%).';

const UT_GRADE = [
  'epithelialized pre- or post-ulcerative lesion',
  'superficial wound (not to tendon, capsule, or bone)',
  'wound penetrating to tendon or capsule',
  'wound penetrating to bone or joint',
];
const UT_STAGE = {
  A: 'clean (no infection or ischemia)',
  B: 'infection',
  C: 'ischemia',
  D: 'infection and ischemia',
};
const UT_ROMAN = ['0', 'I', 'II', 'III'];

export function universityTexasDfu(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const g = fin(o.grade);
  const s = typeof o.stage === 'string' ? o.stage.toUpperCase() : '';
  const gradeOk = g !== null && Number.isInteger(g) && g >= 0 && g <= 3;
  const stageOk = Object.prototype.hasOwnProperty.call(UT_STAGE, s);
  const missing = [];
  if (!gradeOk) missing.push('grade (0–3)');
  if (!stageOk) missing.push('stage (A–D)');
  if (missing.length) {
    return { valid: false, message: `Choose the ${missing.join(' and ')}.` };
  }
  const cell = `${UT_ROMAN[g]}${s}`;
  // Worsening prognosis is driven jointly by depth (grade) and complication
  // (stage). Flag when either axis is at the worse end: deep wound (grade >= 2)
  // or any ischemia/infection complication beyond clean (stage other than A).
  const abnormal = g >= 2 || s !== 'A';
  return {
    valid: true,
    cell,
    grade: g,
    stage: s,
    bandLabel: cell,
    abnormal,
    band: `University of Texas ${cell} — grade ${g} (${UT_GRADE[g]}), stage ${s} (${UT_STAGE[s]}).`,
    detail: s === 'D'
      ? 'Stage D (infection + ischemia) carries the highest amputation risk in the validation series.'
      : 'Healing odds fall and amputation odds rise as grade and stage increase.',
    note: UT_NOTE,
  };
}
