// spec-v119 (Wave 4 of the spec-v100 MDCalc Parity Completion program): four
// deterministic prehospital large-vessel-occlusion (LVO) triage and
// cerebrovascular-diagnosis instruments the EMS crew and stroke team run in the
// field and the ED. v118 covered the in-hospital hemorrhagic-stroke grading;
// v119 covers the field LVO-severity screens and two cerebrovascular-diagnosis
// rules. None duplicates a live tile; each takes the clinician's field exam or
// imaging *read* (the NIHSS-derived field items, the microbleed / siderosis /
// white-matter reads) as input -- v119 parses no DICOM, no pixels, no radiology
// report (spec-v119 §7).
//
//   cpsss     - Cincinnati Prehospital Stroke Severity Scale / C-STAT (0-4)
//   fastEd    - Field Assessment Stroke Triage for Emergency Destination (0-9)
//   bostonCaa - Boston Criteria v2.0 cerebral-amyloid-angiopathy certainty
//   cvtRisk   - cerebral-venous-thrombosis outcome risk score (0-9)
//
// Pure functions only (spec-v29 §3 one-line test). Citations live inline in
// lib/meta.js; renderers in views/group-v119.js wire these to the home grid and
// render the spec-v50 §3 clinical-posture note. Each tile reports the score or
// diagnostic category and the source's stated framing; the destination, bypass,
// and treatment decisions stay with the EMS crew, stroke team, and local
// protocol -- none authors that order in Sophie's voice (spec-v11 §5.3).
//
// POINT TABLES / DIAGNOSTIC LOGIC RE-FETCHED, NEVER RECALLED (spec-v97 lesson),
// each cross-verified across >= 2 independent sources (the derivation paper +
// MDCalc / PMC / validation-cohort reproductions). NO-FABRICATION notes:
//   - cpsss (Katz 2015, Stroke): three NIHSS-derived field items -- conjugate
//     gaze deviation (+2), level-of-consciousness questions/commands wrong (+1),
//     and severe arm weakness (NIHSS motor-arm >= 2, +1); total 0-4. The
//     validated dichotomy is >= 2 predicts a large-vessel occlusion. The 2/1/1
//     weighting and the >= 2 cutoff are unanimous across the derivation, the
//     external validation cohort, and MDCalc. Operating characteristics are
//     cohort-dependent (Katz derivation ~89%/73% for severe stroke [NIHSS >= 15];
//     external validation ~70%/87% for LVO), so the tile frames the >= 2 LVO
//     prediction and names the cohort rather than fixing a single sens/spec pair.
//   - fastEd (Lima 2016, Stroke): five NIHSS-derived field items -- Facial palsy
//     (0-1), Arm weakness (0-2), Speech changes (0-2), Eye deviation (0-2), and
//     Denial/Neglect (0-2); total 0-9 (the item maxima sum to 9 -- MDCalc's UI
//     "0-10" is a sum-of-fives artifact; the paper and the arithmetic give 9).
//     The validated dichotomy is >= 4 predicts LVO and supports comprehensive-
//     center triage (sensitivity ~0.60, specificity ~0.89, PPV ~0.72 in the
//     derivation cohort). Point bands re-fetched verbatim from Lima Table 1.
//   - bostonCaa (Charidimou 2022, Lancet Neurol): the v2.0 diagnostic-certainty
//     logic. Every in-vivo category requires age >= 50, a compatible clinical
//     presentation (spontaneous lobar ICH, transient focal neurological episodes,
//     or cognitive impairment/dementia), MRI findings as below, and ABSENCE of
//     any deep hemorrhagic lesion. v2.0's signal addition is the non-hemorrhagic
//     white-matter feature (severe centrum-semiovale enlarged perivascular spaces
//     [> 20 in one hemisphere] OR a white-matter-hyperintensity multispot
//     pattern). Definite = full postmortem (severe CAA). Probable with supporting
//     pathology = biopsy or evacuated-hematoma specimen showing some CAA.
//     Probable (in vivo) = >= 2 strictly lobar hemorrhagic lesions (lobar ICH,
//     cerebral microbleeds, or cortical-superficial-siderosis foci, in any
//     combination) OR 1 lobar hemorrhagic lesion PLUS >= 1 white-matter feature.
//     Possible (in vivo) = 1 strictly lobar hemorrhagic lesion OR >= 1
//     white-matter feature. Deep hemorrhagic lesions exclude the lobar-restricted
//     CAA categories; the tile reports that rather than inventing a category. The
//     logic for all four categories is verbatim-confirmed across two independent
//     reproductions of the Lancet Neurology source.
//   - cvtRisk (Ferro 2009, Cerebrovasc Dis; derived from the ISCVT cohort):
//     predicts poor outcome (mRS > 2 -- dependency or death) from six items --
//     Malignancy (+2), Coma / GCS < 9 (+2), Deep venous system thrombosis (+2),
//     Mental-status disturbance (+1), Male sex (+1), and Intracranial hemorrhage
//     (+1); total 0-9. The validated dichotomy is >= 3 predicts poor outcome
//     (combined sensitivity ~0.96, specificity ~0.14 -- a high-sensitivity
//     screen). The integer weights {2,2,2,1,1,1} reflect the published hazard
//     ranking and are unanimous across the accessible reproductions. The paper
//     publishes NO per-score probability-of-poor-outcome table, so the tile
//     frames risk via the >= 3 threshold and the cited operating characteristics
//     only -- it invents no continuous probability.

import { r1 } from './num.js';

void r1; // shared lib/num.js dependency (spec-v119 §6); the v119 scores are integer point-sums.

const onFlag = (v) => v === true || v === 'yes' || v === 'on' || v === 1 || v === '1';
const clamp = (x, lo, hi) => (x < lo ? lo : x > hi ? hi : x);
const lvl = (v, max) => {
  const n = typeof v === 'number' ? v : Number(v);
  if (!Number.isFinite(n)) return 0;
  return clamp(Math.round(n), 0, max);
};

// --- 2.1 cpsss / C-STAT --------------------------------------------------------
const CPSSS_NOTE = 'Cincinnati Prehospital Stroke Severity Scale / C-STAT (Katz BS, McMullan JT, Sucharew H, Adeoye O, Broderick JP, Stroke 2015): a field screen built from three NIHSS-derived items -- conjugate gaze deviation (+2), level-of-consciousness questions or commands answered/followed incorrectly (+1), and severe arm weakness, meaning the arm cannot be held against gravity (+1) -- for a total of 0-4. A total of 2 or more predicts a large-vessel occlusion (sensitivity about 89% and specificity about 73% for severe stroke in the derivation; about 70% and 87% for occlusion in external validation). It frames occlusion likelihood for triage; the destination and bypass decisions stay with the EMS crew, stroke team, and local protocol.';

export function cpsss(input = {}) {
  const counted = [];
  let total = 0;
  if (onFlag(input.gaze)) { total += 2; counted.push('conjugate gaze deviation (+2)'); }
  if (onFlag(input.loc)) { total += 1; counted.push('LOC questions/commands incorrect (+1)'); }
  if (onFlag(input.arm)) { total += 1; counted.push('severe arm weakness (+1)'); }
  total = clamp(total, 0, 4);
  const high = total >= 2;
  return {
    valid: true, total,
    abnormal: high,
    band: `C-STAT / CPSSS ${total}/4: ${high ? 'a total >= 2 predicts a large-vessel occlusion -- consider comprehensive-stroke-center triage per protocol' : 'below the >= 2 large-vessel-occlusion threshold'}.`,
    counted: counted.length ? counted.join(', ') : 'no field items present',
    note: CPSSS_NOTE,
  };
}

// --- 2.2 fast-ed --------------------------------------------------------------
const FASTED_NOTE = 'FAST-ED -- Field Assessment Stroke Triage for Emergency Destination (Lima FO, Silva GS, Furie KL, et al, Stroke 2016): a field large-vessel-occlusion screen built from five NIHSS-derived items -- Facial palsy (0-1), Arm weakness (0-2), Speech changes (0-2), Eye deviation (0-2), and Denial/Neglect (0-2) -- for a total of 0-9. A total of 4 or more predicts a large-vessel occlusion and supports routing to a comprehensive stroke center (sensitivity about 0.60, specificity about 0.89, positive predictive value about 0.72 in the derivation cohort). It frames occlusion likelihood for triage; the destination decision stays with the EMS crew, stroke team, and local protocol.';
const FASTED_ITEMS = [
  ['facial', 1, 'facial palsy'],
  ['arm', 2, 'arm weakness'],
  ['speech', 2, 'speech changes'],
  ['eye', 2, 'eye deviation'],
  ['neglect', 2, 'denial/neglect'],
];

export function fastEd(input = {}) {
  const counted = [];
  let total = 0;
  for (const [key, max, label] of FASTED_ITEMS) {
    const pts = lvl(input[key], max);
    total += pts;
    if (pts > 0) counted.push(`${label} +${pts}`);
  }
  total = clamp(total, 0, 9);
  const high = total >= 4;
  return {
    valid: true, total,
    abnormal: high,
    band: `FAST-ED ${total}/9: ${high ? 'a total >= 4 predicts a large-vessel occlusion -- supports comprehensive-stroke-center triage per protocol' : 'below the >= 4 large-vessel-occlusion threshold'}.`,
    counted: counted.length ? counted.join(', ') : 'no field deficits scored (total 0)',
    note: FASTED_NOTE,
  };
}

// --- 2.3 boston-caa -----------------------------------------------------------
const BOSTON_NOTE = 'Boston Criteria version 2.0 for cerebral amyloid angiopathy (Charidimou A, Boulouis G, Frosch MP, et al, Lancet Neurol 2022): grades diagnostic certainty -- definite, probable with supporting pathology, probable, or possible CAA. Every in-vivo category requires age 50 or older, a compatible clinical presentation (spontaneous lobar intracerebral hemorrhage, transient focal neurological episodes, or cognitive impairment/dementia), the MRI findings below, and the absence of any deep hemorrhagic lesion. Version 2.0 adds the non-hemorrhagic white-matter feature: severe centrum-semiovale enlarged perivascular spaces (more than 20 in one hemisphere) or a white-matter-hyperintensity multispot pattern. Probable CAA needs two or more strictly lobar hemorrhagic lesions (lobar ICH, cerebral microbleeds, or cortical-superficial-siderosis foci, in any combination) or one lobar hemorrhagic lesion plus one white-matter feature; possible CAA needs one lobar hemorrhagic lesion or one white-matter feature. It reports the diagnostic certainty; the management decision stays with the clinician and local protocol.';

export function bostonCaa(input = {}) {
  const pathology = input.pathology === 'postmortem' || input.pathology === 'specimen'
    ? input.pathology : 'none';
  const age50 = onFlag(input.age50);
  const presentation = onFlag(input.presentation);
  const deep = onFlag(input.deep);
  const lobar = lvl(input.lobar, 2); // count of strictly lobar hemorrhagic lesions, capped at 2 (>= 2)
  const wm = onFlag(input.wm); // >= 1 white-matter feature (CSO-PVS > 20 or WMH-multispot)

  // Pathology paths take precedence -- a tissue diagnosis outranks the in-vivo MRI
  // categories.
  if (pathology === 'postmortem') {
    return {
      valid: true, category: 'Definite CAA',
      abnormal: true,
      band: 'Definite cerebral amyloid angiopathy: full postmortem examination showing severe CAA with vasculopathy and no other diagnostic lesion.',
      detail: 'pathology: full postmortem',
      note: BOSTON_NOTE,
    };
  }
  if (pathology === 'specimen') {
    return {
      valid: true, category: 'Probable CAA with supporting pathology',
      abnormal: true,
      band: 'Probable cerebral amyloid angiopathy with supporting pathology: a biopsy or evacuated-hematoma specimen shows some degree of CAA, with a compatible presentation and no other diagnostic lesion.',
      detail: 'pathology: biopsy / evacuated-hematoma specimen',
      note: BOSTON_NOTE,
    };
  }

  // In-vivo MRI categories.
  if (!age50 || !presentation) {
    return {
      valid: true, category: 'Criteria not met',
      abnormal: false,
      band: 'The in-vivo Boston v2.0 CAA categories require age 50 or older and a compatible clinical presentation (lobar ICH, transient focal neurological episodes, or cognitive impairment/dementia). Mark both, or select an available pathology specimen, to classify.',
      detail: `age >= 50: ${age50 ? 'yes' : 'no'}; compatible presentation: ${presentation ? 'yes' : 'no'}`,
      note: BOSTON_NOTE,
    };
  }
  if (deep) {
    return {
      valid: true, category: 'Criteria not met',
      abnormal: false,
      band: 'A deep hemorrhagic lesion is present, which falls outside the strictly lobar Boston v2.0 CAA categories -- the criteria require the absence of deep hemorrhagic lesions. CAA cannot be classified as probable or possible here.',
      detail: 'deep hemorrhagic lesion present (exclusion)',
      note: BOSTON_NOTE,
    };
  }

  const markers = [];
  if (lobar > 0) markers.push(`${lobar >= 2 ? '>= 2' : '1'} strictly lobar hemorrhagic lesion${lobar >= 2 ? 's' : ''}`);
  if (wm) markers.push('1 white-matter feature');

  let category;
  if (lobar >= 2 || (lobar === 1 && wm)) {
    category = 'Probable CAA';
  } else if (lobar === 1 || wm) {
    category = 'Possible CAA';
  } else {
    return {
      valid: true, category: 'Criteria not met',
      abnormal: false,
      band: 'No strictly lobar hemorrhagic lesion and no white-matter feature were marked, so neither the probable nor the possible Boston v2.0 CAA category is met.',
      detail: 'no qualifying lobar hemorrhagic lesion or white-matter feature',
      note: BOSTON_NOTE,
    };
  }
  return {
    valid: true, category,
    abnormal: true,
    band: `${category}: ${markers.join(' plus ')}, with a compatible presentation, age 50 or older, and no deep hemorrhagic lesion.`,
    detail: markers.join(' plus '),
    note: BOSTON_NOTE,
  };
}

// --- 2.4 cvt-risk -------------------------------------------------------------
const CVT_NOTE = 'Cerebral venous thrombosis outcome risk score (Ferro JM, Bacelar-Nicolau H, Rodrigues T, et al, Cerebrovasc Dis 2009; derived from the ISCVT cohort): predicts a poor outcome (modified Rankin Scale greater than 2 -- dependency or death) from six items -- Malignancy (+2), Coma, meaning a Glasgow Coma Scale below 9 (+2), Deep venous system thrombosis (+2), Mental-status disturbance (+1), Male sex (+1), and Intracranial hemorrhage (+1) -- for a total of 0-9. A total of 3 or more predicts a poor outcome (combined sensitivity about 96% and specificity about 14% -- a high-sensitivity screen). It frames outcome risk; the management decision stays with the neurology / neurocritical-care team and local protocol.';

export function cvtRisk(input = {}) {
  const counted = [];
  let total = 0;
  if (onFlag(input.malignancy)) { total += 2; counted.push('malignancy (+2)'); }
  if (onFlag(input.coma)) { total += 2; counted.push('coma / GCS < 9 (+2)'); }
  if (onFlag(input.deepCvt)) { total += 2; counted.push('deep venous system thrombosis (+2)'); }
  if (onFlag(input.mentalStatus)) { total += 1; counted.push('mental-status disturbance (+1)'); }
  if (onFlag(input.male)) { total += 1; counted.push('male sex (+1)'); }
  if (onFlag(input.ich)) { total += 1; counted.push('intracranial hemorrhage (+1)'); }
  total = clamp(total, 0, 9);
  const high = total >= 3;
  return {
    valid: true, total,
    abnormal: high,
    band: `CVT risk ${total}/9: ${high ? 'a total >= 3 predicts a poor outcome (mRS > 2; sensitivity ~96%, specificity ~14%)' : 'below the >= 3 poor-outcome threshold'}.`,
    counted: counted.length ? counted.join(', ') : 'no risk items present',
    note: CVT_NOTE,
  };
}
