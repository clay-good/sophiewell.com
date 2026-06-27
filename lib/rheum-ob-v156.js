// spec-v156 (the sixth and CLOSING implementation spec of the spec-v150
// Post-Parity Coverage program): four deterministic instruments that complete
// the rheumatology patient-reported axis and the obstetric cesarean-audit
// standard. None duplicates a live tile; v156 runs no AI and makes no runtime
// network call. With v156 the Post-Parity Coverage program is complete.
//
//   basdai  - Bath Ankylosing Spondylitis Disease Activity Index (patient-
//             reported axial-SpA activity; the [Q1+Q2+Q3+Q4+(Q5+Q6)/2]/5 form
//             with the morning-stiffness pair averaged)
//   basfi   - Bath Ankylosing Spondylitis Functional Index (patient-reported
//             axial-SpA function; the mean of 10 items)
//   essdai  - EULAR Sjögren's Syndrome Disease Activity Index (12 weighted
//             systemic domains)
//   robson  - Robson Ten-Group Classification System (the WHO-endorsed
//             cesarean-audit standard; a deterministic input -> group mapping)
//
// v147/v148 shipped the PHYSICIAN-derived rheumatology activity scores (CDAI,
// SDAI, SLEDAI-2K, ASDAS, FFS); this spec completes the PATIENT-reported axial-
// SpA axis (basdai activity, basfi function) and adds the standard Sjögren
// systemic-activity index (essdai). robson is the obstetric audit classifier
// alongside meows / bishop / the preeclampsia cluster. Per the spec-v100 §2
// doctrine basdai/basfi/essdai are bounded means/weighted-sums and robson is a
// deterministic input -> class mapping (the §2 classification clarification:
// every valid combination resolves to exactly one of the ten groups). Citations
// live inline in lib/meta.js; the renderers in views/group-v156.js render the
// spec-v50 §3 posture note and defer the decision (treatment escalation, audit
// conclusions) to the clinician (spec-v11 §5.3).
//
// COEFFICIENTS / WEIGHTS / GROUP LOGIC RE-FETCHED, NEVER RECALLED (spec-v97),
// each cross-verified across >= 2 independent sources at implementation.
// SOURCE-GOVERNANCE:
//   - basdai (Garrett S, Jenkinson T, Kennedy LG, et al, J Rheumatol 1994;21(12):
//     2286-2291): six 0-10 items; BASDAI = [Q1 + Q2 + Q3 + Q4 + (Q5 + Q6)/2] / 5,
//     0-10. The Q5/Q6 (morning-stiffness severity + duration) AVERAGE is the
//     chief scoring nuance — the pair is averaged, then added to Q1-Q4, then
//     divided by 5 (NOT summed flat). >= 4 suggests active / suboptimally
//     controlled disease.
//   - basfi (Calin A, Garrett S, Whitelock H, et al, J Rheumatol 1994;21(12):
//     2281-2285): ten 0-10 items (8 ADL tasks + 2 coping items); BASFI = the
//     MEAN of the 10 items, 0-10.
//   - essdai (Seror R, Ravaud P, Bowman SJ, et al, Ann Rheum Dis 2010;69(6):
//     1103-1109; weights re-fetched verbatim from the Seror 2015 RMD Open user
//     guide and cross-checked against PMC4613159): 12 domains, each scored at a
//     defined activity level whose PRINTED value is already weight × level. The
//     weighted total is the direct sum. STRUCTURAL FACTS that must not be
//     "normalized away": Constitutional / Glandular / Biological have NO High
//     level (top out at Moderate); CNS has NO Low level (jumps No -> Moderate).
//     Weights: constitutional 3, lymphadenopathy 4, glandular 2, articular 2,
//     cutaneous 3, pulmonary 5, renal 5, muscular 6, PNS 5, CNS 5, haematological
//     2, biological 1. Theoretical max 123. Strata: low < 5, moderate 5-13,
//     high >= 14. An unselected domain contributes 0 (not NaN).
//   - robson (Robson MS, Fetal Matern Med Rev 2001;12(1):23-39; WHO 2015): ten
//     mutually-exclusive, totally-exhaustive groups. Precedence (so the mapping
//     is single-valued): multiple pregnancy -> 8; else single + transverse/
//     oblique lie -> 9; else single breech -> 6 (nullipara) / 7 (multipara);
//     else single cephalic preterm -> 10; else term single cephalic with a
//     previous CS -> 5; else term single cephalic, no previous CS -> nullipara
//     {spontaneous 1, induced 2a, pre-labor CS 2b} / multipara {spontaneous 3,
//     induced 4a, pre-labor CS 4b}. Groups 5-10 include cases with a previous CS
//     by design. An audit classification (no risk prediction).

import { num, r2 } from './num.js';

// Read one 0-10 patient-reported item: '' / null / undefined / non-finite or
// out-of-[0,10] -> null (so the caller surfaces a complete-the-fields fallback).
function item010(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0 || n > 10) return null;
  return n;
}

// --- 2.1 BASDAI --------------------------------------------------------------
const BASDAI_NOTE = 'Bath Ankylosing Spondylitis Disease Activity Index (Garrett S, Jenkinson T, Kennedy LG, et al, J Rheumatol 1994;21(12):2286-2291) — the patient-reported activity index for axial spondyloarthritis: six 0–10 items (fatigue, spinal pain, peripheral joint pain/swelling, enthesitis, morning-stiffness severity, morning-stiffness duration). BASDAI = [Q1 + Q2 + Q3 + Q4 + (Q5 + Q6)/2] / 5, scored 0–10. The two morning-stiffness items (Q5, Q6) are averaged before being added — not summed flat. A BASDAI ≥ 4 suggests active / suboptimally controlled disease.';

export function basdai(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const q = [o.q1, o.q2, o.q3, o.q4, o.q5, o.q6].map(item010);
  const labels = ['fatigue', 'spinal pain', 'peripheral joint pain/swelling', 'enthesitis', 'morning-stiffness severity', 'morning-stiffness duration'];
  const missing = [];
  for (let i = 0; i < 6; i += 1) if (q[i] === null) missing.push(labels[i]);
  if (missing.length) {
    return { valid: false, message: `Enter all six 0–10 items — still needed: ${missing.join(', ')}.` };
  }
  const stiffness = (q[4] + q[5]) / 2;
  const raw = (q[0] + q[1] + q[2] + q[3] + stiffness) / 5;
  const score = r2(num('BASDAI', raw, { min: 0, max: 10 }));
  const abnormal = score >= 4;
  return {
    valid: true,
    score,
    abnormal,
    bandLabel: abnormal ? 'Active disease' : 'Lower activity',
    band: `BASDAI ${score} — ${abnormal ? 'active disease (≥ 4)' : 'lower activity (< 4)'}.`,
    detail: `[${q[0]} + ${q[1]} + ${q[2]} + ${q[3]} + (${q[4]} + ${q[5]})/2 = ${r2(stiffness)}] / 5 = ${score}. A BASDAI ≥ 4 suggests suboptimal disease control.`,
    note: BASDAI_NOTE,
  };
}

// --- 2.2 BASFI ---------------------------------------------------------------
const BASFI_NOTE = 'Bath Ankylosing Spondylitis Functional Index (Calin A, Garrett S, Whitelock H, et al, J Rheumatol 1994;21(12):2281-2285) — the patient-reported functional index for axial spondyloarthritis: ten 0–10 items (eight activities-of-daily-living tasks + two coping items, each 0 = easy to 10 = impossible). BASFI = the mean of the 10 items, scored 0–10; a higher index means poorer function.';

export function basfi(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const items = [o.i1, o.i2, o.i3, o.i4, o.i5, o.i6, o.i7, o.i8, o.i9, o.i10].map(item010);
  const missing = [];
  for (let i = 0; i < 10; i += 1) if (items[i] === null) missing.push(`item ${i + 1}`);
  if (missing.length) {
    return { valid: false, message: `Enter all ten 0–10 items — still needed: ${missing.join(', ')}.` };
  }
  const sum = items.reduce((a, b) => a + b, 0);
  const score = r2(num('BASFI', sum / 10, { min: 0, max: 10 }));
  // BASFI has no published treatment threshold; flag the upper half as a coarse
  // worse-function cue (purely descriptive, never a verdict).
  const abnormal = score >= 5;
  return {
    valid: true,
    score,
    abnormal,
    bandLabel: abnormal ? 'Greater functional limitation' : 'Lesser functional limitation',
    band: `BASFI ${score} — mean of 10 items (0 = easy, 10 = impossible).`,
    detail: `Sum ${r2(sum)} / 10 = ${score}. A higher index means poorer function; the index has no fixed cut-point.`,
    note: BASFI_NOTE,
  };
}

// --- 2.3 ESSDAI --------------------------------------------------------------
const ESSDAI_NOTE = 'EULAR Sjögren’s Syndrome Disease Activity Index (Seror R, Ravaud P, Bowman SJ, et al, Ann Rheum Dis 2010;69(6):1103-1109; weights from the Seror 2015 RMD Open user guide) — 12 systemic domains, each scored at its activity level; the printed value per level is already weight × level, so the weighted total is the direct sum (theoretical max 123). Domain weights: constitutional 3, lymphadenopathy 4, glandular 2, articular 2, cutaneous 3, pulmonary 5, renal 5, muscular 6, peripheral-nervous-system 5, central-nervous-system 5, haematological 2, biological 1. Constitutional, glandular, and biological have no High level; CNS has no Low level. Strata: low < 5, moderate 5–13, high ≥ 14.';

// Each domain: the activity levels it actually offers, mapping the level name to
// its already-weighted printed score. Constitutional/glandular/biological omit
// High; CNS omits Low (verbatim, Seror 2015 user guide).
export const ESSDAI_DOMAINS = [
  { key: 'constitutional', label: 'Constitutional', weight: 3, levels: { No: 0, Low: 3, Moderate: 6 } },
  { key: 'lymphadenopathy', label: 'Lymphadenopathy', weight: 4, levels: { No: 0, Low: 4, Moderate: 8, High: 12 } },
  { key: 'glandular', label: 'Glandular', weight: 2, levels: { No: 0, Low: 2, Moderate: 4 } },
  { key: 'articular', label: 'Articular', weight: 2, levels: { No: 0, Low: 2, Moderate: 4, High: 6 } },
  { key: 'cutaneous', label: 'Cutaneous', weight: 3, levels: { No: 0, Low: 3, Moderate: 6, High: 9 } },
  { key: 'pulmonary', label: 'Pulmonary', weight: 5, levels: { No: 0, Low: 5, Moderate: 10, High: 15 } },
  { key: 'renal', label: 'Renal', weight: 5, levels: { No: 0, Low: 5, Moderate: 10, High: 15 } },
  { key: 'muscular', label: 'Muscular', weight: 6, levels: { No: 0, Low: 6, Moderate: 12, High: 18 } },
  { key: 'pns', label: 'Peripheral nervous system', weight: 5, levels: { No: 0, Low: 5, Moderate: 10, High: 15 } },
  { key: 'cns', label: 'Central nervous system', weight: 5, levels: { No: 0, Moderate: 10, High: 15 } },
  { key: 'hematological', label: 'Haematological', weight: 2, levels: { No: 0, Low: 2, Moderate: 4, High: 6 } },
  { key: 'biological', label: 'Biological', weight: 1, levels: { No: 0, Low: 1, Moderate: 2 } },
];

export function essdai(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let total = 0;
  const active = [];
  for (const d of ESSDAI_DOMAINS) {
    const raw = o[d.key];
    // The select carries the activity-level NAME ('No'/'Low'/'Moderate'/'High');
    // an unselected / unknown / out-of-domain value contributes 0 (never NaN).
    const levelName = typeof raw === 'string' && Object.prototype.hasOwnProperty.call(d.levels, raw) ? raw : 'No';
    const contribution = d.levels[levelName];
    total += contribution;
    if (contribution > 0) active.push(`${d.label} ${levelName.toLowerCase()} (+${contribution})`);
  }
  const score = num('ESSDAI', total, { min: 0, max: 123 });
  let band; let abnormal;
  if (score < 5) { band = 'low'; abnormal = false; }
  else if (score <= 13) { band = 'moderate'; abnormal = true; }
  else { band = 'high'; abnormal = true; }
  return {
    valid: true,
    score,
    abnormal,
    bandLabel: band.replace(/^./, (m) => m.toUpperCase()),
    band: `ESSDAI ${score} — ${band} systemic activity.`,
    detail: active.length
      ? `Active domains: ${active.join(', ')}. Strata: low < 5, moderate 5–13, high ≥ 14.`
      : 'No active systemic domain (total 0). Strata: low < 5, moderate 5–13, high ≥ 14.',
    note: ESSDAI_NOTE,
  };
}

// --- 2.4 Robson Ten-Group Classification System ------------------------------
const ROBSON_NOTE = 'Robson Ten-Group Classification System (Robson MS, Fetal Matern Med Rev 2001;12(1):23-39; WHO 2015 endorsement) — the WHO-standard cesarean-audit classification that sorts every delivery into one of ten mutually-exclusive groups by parity, previous cesarean, onset of labor, fetal presentation, plurality, and gestational age. Groups 1–4 are single cephalic term with no previous cesarean (split by parity then onset); group 5 is single cephalic term with a previous cesarean; groups 6–10 capture breech, multiple, transverse/oblique, and preterm cephalic deliveries (each including cases with a previous cesarean). An audit classification, not a risk prediction.';

const PARITY = { nullipara: 'nulliparous', multipara: 'multiparous' };
const ONSET = { spontaneous: 'spontaneous labor', induced: 'induced labor', 'prelabor-cs': 'cesarean before labor' };
const PRESENTATION = { cephalic: 'cephalic', breech: 'breech', 'transverse-oblique': 'transverse or oblique lie' };
const FETUSES = { single: 'single', multiple: 'multiple' };
const GESTATION = { term: 'term (≥ 37 wk)', preterm: 'preterm (< 37 wk)' };

const ROBSON_DESC = {
  1: 'Nulliparous, single cephalic, term, spontaneous labor.',
  '2a': 'Nulliparous, single cephalic, term, induced labor.',
  '2b': 'Nulliparous, single cephalic, term, cesarean before labor.',
  3: 'Multiparous (no previous cesarean), single cephalic, term, spontaneous labor.',
  '4a': 'Multiparous (no previous cesarean), single cephalic, term, induced labor.',
  '4b': 'Multiparous (no previous cesarean), single cephalic, term, cesarean before labor.',
  5: 'Previous cesarean, single cephalic, term.',
  6: 'Nulliparous, single breech.',
  7: 'Multiparous, single breech (includes previous cesarean).',
  8: 'Multiple pregnancy (includes previous cesarean).',
  9: 'Single, transverse or oblique lie (includes previous cesarean).',
  10: 'Single cephalic, preterm (includes previous cesarean).',
};

export function robson(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const parity = typeof o.parity === 'string' && PARITY[o.parity] ? o.parity : '';
  const onset = typeof o.onset === 'string' && ONSET[o.onset] ? o.onset : '';
  const presentation = typeof o.presentation === 'string' && PRESENTATION[o.presentation] ? o.presentation : '';
  const fetuses = typeof o.fetuses === 'string' && FETUSES[o.fetuses] ? o.fetuses : '';
  const gestation = typeof o.gestation === 'string' && GESTATION[o.gestation] ? o.gestation : '';
  const previousCs = o.previousCs === true || o.previousCs === 'yes' || o.previousCs === '1';
  const missing = [];
  if (!parity) missing.push('parity');
  if (!fetuses) missing.push('number of fetuses');
  if (!presentation) missing.push('presentation');
  if (!gestation) missing.push('gestational age');
  // Onset is only needed when the case lands in groups 1–4 (single cephalic
  // term, no previous CS). It is irrelevant to groups 5–10, so do not require it
  // there. We therefore defer the onset-missing check until after routing.
  if (missing.length) {
    return { valid: false, message: `Choose the ${missing.join(', ')}.` };
  }

  let group;
  if (fetuses === 'multiple') {
    group = 8;
  } else if (presentation === 'transverse-oblique') {
    group = 9;
  } else if (presentation === 'breech') {
    group = parity === 'nullipara' ? 6 : 7;
  } else if (gestation === 'preterm') {
    // single cephalic preterm
    group = 10;
  } else if (previousCs) {
    // single cephalic term with a previous cesarean
    group = 5;
  } else {
    // single cephalic term, no previous cesarean -> groups 1–4 by parity + onset
    if (!onset) {
      return { valid: false, message: 'Choose the onset of labor (spontaneous, induced, or cesarean before labor).' };
    }
    if (parity === 'nullipara') {
      group = onset === 'spontaneous' ? 1 : (onset === 'induced' ? '2a' : '2b');
    } else {
      group = onset === 'spontaneous' ? 3 : (onset === 'induced' ? '4a' : '4b');
    }
  }

  const mainGroup = String(group).replace(/[ab]$/, '');
  return {
    valid: true,
    group: String(group),
    mainGroup,
    abnormal: false,
    bandLabel: `Group ${group}`,
    band: `Robson Group ${group} — ${ROBSON_DESC[group]}`,
    detail: 'A cesarean-audit classification: report the group-specific cesarean rate and contribution, not an individual risk.',
    note: ROBSON_NOTE,
  };
}
