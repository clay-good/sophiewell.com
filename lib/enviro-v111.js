// spec-v111 (closing spec of Wave 2 of the spec-v100 MDCalc Parity Completion
// program): four deterministic environmental / wilderness-medicine severity
// scores and classifications that fill confirmed gaps. None duplicates a live
// tile.
//
//   lakeLouiseAms     - 2018 Lake Louise Acute Mountain Sickness score
//   szpilmanDrowning  - Szpilman drowning classification (grade 1-6 + rescue/dead)
//   snakebiteSeverity - Snakebite Severity Score (SSS, 0-20)
//   cauchyFrostbite   - Cauchy frostbite classification (grade 1-4)
//
// Pure functions only (spec-v29 §3 one-line test). Citations live inline in
// lib/meta.js; renderers in views/group-v36.js wire these to the home grid and
// render the spec-v50 §3 field-posture note. These are triage / severity-grading
// instruments: none authors a descent, antivenom, debridement, or amputation
// order in Sophie's voice (spec-v11 §5.3); the field-triage, transport, and
// definitive-management decisions stay with the clinician and local protocol.
//
// FORMULAS / DECISION LIMBS RE-FETCHED, NEVER RECALLED (spec-v97 lesson), each
// cross-verified across >= 2 independent sources (original paper + StatPearls /
// NEJM reproduction / consensus reproduction):
//   - Lake Louise AMS 2018 (Roach RC, et al, High Alt Med Biol 2018): four
//     self-reported symptoms (headache, GI, fatigue/weakness, dizziness), each
//     0-3, total 0-12. AMS is diagnosed only when the total is >= 3 AND a
//     headache is present (>= 1), in the setting of a recent ascent. Severity
//     bands once AMS is diagnosed: mild 3-5, moderate 6-9, severe 10-12. The
//     2018 revision removed the sleep item. Class A.
//   - Szpilman drowning (Szpilman D, Chest 1997; 1,831 cases): a decision tree
//     on cough / auscultation / pulmonary edema / hypotension / respiratory
//     arrest / cardiac arrest -> Rescue (no cough), grade 1 (normal
//     auscultation + cough), grade 2 (rales in some fields), grade 3 (pulmonary
//     edema, no hypotension), grade 4 (pulmonary edema + hypotension), grade 5
//     (isolated respiratory arrest), grade 6 (cardiopulmonary arrest), or Dead
//     (submersion > 1 h or postmortem signs). Original-series mortality: rescue
//     / grade 1 = 0%, grade 2 = 0.6%, grade 3 = 5.2%, grade 4 = 19.4%,
//     grade 5 = 44%, grade 6 = 93%. Class B (revisable decision tree).
//   - Snakebite Severity Score (Dart RC, et al, Ann Emerg Med 1996): six body
//     systems summed -- pulmonary 0-3, cardiovascular 0-3, local wound 0-4,
//     gastrointestinal 0-3, hematologic 0-4, CNS 0-3 (total 0-20). SOURCE-FAITHFUL
//     NOTE: Dart 1996 validated the SSS as a CONTINUOUS severity index and does
//     NOT define minimal/moderate/severe total-score cutoffs; the 0-3/4-7/>=8
//     cutoffs circulated online belong to a different modified 7-system (max 23)
//     instrument. This tile reports the continuous total and a descriptor read
//     RELATIVE to the 0-20 range (not a Dart-defined cutoff). Class A.
//   - Cauchy frostbite (Cauchy E, et al, Wilderness Environ Med 2001; cross-read
//     from the NEJM 2022 Table 1 reproduction): four grades set by day-0 lesion
//     topography, day-2 bone-scan uptake, and day-2 blisters. The grade is the
//     most severe of the three findings; prognosis is the published amputation
//     level + sequelae for that grade (grade 1 no amputation / no sequela;
//     grade 2 tissue [soft-tissue/nail] amputation; grade 3 bone amputation of
//     the digit + functional sequelae; grade 4 bone amputation of the limb +
//     functional sequelae). Class A.

const fin = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);
const onFlag = (v) => v === true || v === 'yes' || v === 'on' || v === 1 || v === '1';
const clampInt = (v, lo, hi) => Math.max(lo, Math.min(hi, Math.round(v)));

// --- 2.1 lake-louise-ams - 2018 Lake Louise AMS score ------------------------
const LLS_NOTE = 'The 2018 Lake Louise Acute Mountain Sickness Score (Roach RC, Hackett PH, Oelz O, et al; Lake Louise AMS Score Consensus Committee, High Alt Med Biol 2018): four self-reported symptoms -- headache, gastrointestinal symptoms, fatigue/weakness, and dizziness/lightheadedness -- each rated 0-3 for a total of 0-12. AMS is diagnosed only when the total is >= 3 in the presence of a headache, after a recent gain in altitude; severity is then mild (3-5), moderate (6-9), or severe (10-12). The 2018 revision dropped the sleep item. A field severity score that informs descent, oxygen, and evacuation decisions; it does not make them -- those stay with the clinician and local protocol.';

export function lakeLouiseAms(input = {}) {
  const headache = fin(input.headache);
  const gi = fin(input.gi);
  const fatigue = fin(input.fatigue);
  const dizziness = fin(input.dizziness);
  if (headache == null || gi == null || fatigue == null || dizziness == null) {
    return { valid: false, band: 'Rate all four symptoms (headache, GI, fatigue/weakness, dizziness) 0-3 to compute the Lake Louise AMS score.', note: LLS_NOTE };
  }
  const h = clampInt(headache, 0, 3);
  const g = clampInt(gi, 0, 3);
  const f = clampInt(fatigue, 0, 3);
  const d = clampInt(dizziness, 0, 3);
  const total = h + g + f + d;
  const headachePresent = h >= 1;
  const amsPresent = total >= 3 && headachePresent;
  const severity = !amsPresent ? null
    : total <= 5 ? 'mild' : total <= 9 ? 'moderate' : 'severe';
  let band;
  if (!amsPresent && total >= 3 && !headachePresent) {
    band = `Total ${total}/12 but no headache: the headache-required diagnostic rule is NOT met -- AMS is not diagnosed by the 2018 Lake Louise criteria.`;
  } else if (!amsPresent) {
    band = `Total ${total}/12 (< 3): below the AMS diagnostic threshold.`;
  } else {
    band = `Total ${total}/12 with a headache present: AMS diagnosed, ${severity} (mild 3-5, moderate 6-9, severe 10-12).`;
  }
  return {
    valid: true, total, headachePresent, amsPresent, severity,
    abnormal: amsPresent,
    band, note: LLS_NOTE,
  };
}

// --- 2.2 szpilman-drowning - Szpilman drowning classification ----------------
const SZP_NOTE = 'Szpilman drowning classification (Szpilman D, Chest 1997, from 1,831 cases): a bedside decision tree on cough, auscultation, pulmonary edema, hypotension, and respiratory/cardiac arrest. Rescue (normal auscultation, no cough) and grade 1 (normal auscultation with cough) carry ~0% mortality; grade 2 (rales in some fields) ~0.6%; grade 3 (pulmonary edema, normotensive) ~5.2%; grade 4 (pulmonary edema with hypotension) ~19.4%; grade 5 (isolated respiratory arrest) ~44%; grade 6 (cardiopulmonary arrest) ~93%. A triage / disposition aid: it grades severity and frames mortality, it does not direct resuscitation -- that stays with the clinician and local protocol.';
const SZP_GRADES = {
  rescue: { grade: 0, label: 'Rescue', mortality: '~0%', dispo: 'normal auscultation, no cough -- evaluate and release from the scene if no associated condition.' },
  1: { grade: 1, label: 'Grade 1', mortality: '~0%', dispo: 'normal auscultation with cough -- rest, warm, and reassure; no specific care required.' },
  2: { grade: 2, label: 'Grade 2', mortality: '~0.6%', dispo: 'rales in some lung fields -- low-flow oxygen and hospital observation.' },
  3: { grade: 3, label: 'Grade 3', mortality: '~5.2%', dispo: 'acute pulmonary edema without hypotension -- high-flow oxygen, hospitalize to ICU.' },
  4: { grade: 4, label: 'Grade 4', mortality: '~19.4%', dispo: 'acute pulmonary edema with hypotension -- oxygen plus fluid resuscitation, ICU.' },
  5: { grade: 5, label: 'Grade 5', mortality: '~44%', dispo: 'isolated respiratory arrest -- rescue ventilation, then treat as grade 4, ICU.' },
  6: { grade: 6, label: 'Grade 6', mortality: '~93%', dispo: 'cardiopulmonary arrest -- start CPR per protocol, ICU after return of circulation.' },
  dead: { grade: 7, label: 'Dead', mortality: '100%', dispo: 'submersion > 1 h or postmortem signs (rigor mortis, lividity, putrefaction) -- resuscitation is not initiated.' },
};

export function szpilmanDrowning(input = {}) {
  const status = typeof input.status === 'string' ? input.status : '';
  if (status === 'dead') return szpResult('dead');
  if (status === 'cardiac-arrest') return szpResult(6);
  if (status === 'respiratory-arrest') return szpResult(5);
  if (status !== 'breathing') {
    return { valid: false, band: 'Select the cardiopulmonary status (breathing / respiratory arrest / cardiac arrest / deceased) to walk the Szpilman classification.', note: SZP_NOTE };
  }
  const ausc = typeof input.auscultation === 'string' ? input.auscultation : '';
  const cough = onFlag(input.cough);
  const hypotension = onFlag(input.hypotension);
  if (ausc === 'pulmonary-edema') return szpResult(hypotension ? 4 : 3);
  if (ausc === 'rales-some') return szpResult(2);
  if (ausc === 'normal') return szpResult(cough ? 1 : 'rescue');
  return { valid: false, band: 'Select the lung-auscultation finding (normal / rales in some fields / acute pulmonary edema) to grade the breathing victim.', note: SZP_NOTE };
}
function szpResult(key) {
  const g = SZP_GRADES[key];
  const name = g.grade === 0 || g.grade === 7 ? g.label : `${g.label}`;
  return {
    valid: true, grade: g.grade, label: g.label, mortality: g.mortality,
    abnormal: g.grade >= 2,
    band: `${name} (mortality ${g.mortality}): ${g.dispo}`,
    note: SZP_NOTE,
  };
}

// --- 2.3 snakebite-severity - Snakebite Severity Score (SSS) -----------------
const SSS_NOTE = 'Snakebite Severity Score (Dart RC, Hurlbut KM, Garcia R, Boren J, Ann Emerg Med 1996): six body-system subscores summed -- pulmonary (0-3), cardiovascular (0-3), local wound (0-4), gastrointestinal (0-3), hematologic (0-4), and central nervous system (0-3), for a total of 0-20. Dart 1996 validated the SSS as a CONTINUOUS severity index that correlates with clinician assessment and tracks progression on serial scoring; it does NOT define fixed minimal/moderate/severe total-score cutoffs, so the descriptor here is read relative to the 0-20 range, not a published threshold. A severity / trend index, not an antivenom order -- the give-it and species decisions stay with the clinician, poison center, and local protocol.';
const SSS_MAX = { pulmonary: 3, cardiovascular: 3, local: 4, gi: 3, hematologic: 4, cns: 3 };

export function snakebiteSeverity(input = {}) {
  const keys = Object.keys(SSS_MAX);
  const subs = {};
  let any = false;
  for (const k of keys) {
    const v = fin(input[k]);
    if (v != null) any = true;
    subs[k] = v == null ? 0 : clampInt(v, 0, SSS_MAX[k]);
  }
  if (!any) {
    return { valid: false, band: 'Enter the six SSS body-system subscores (pulmonary, cardiovascular, local wound, GI, hematologic, CNS) to compute the total.', note: SSS_NOTE };
  }
  const total = keys.reduce((s, k) => s + subs[k], 0);
  // Descriptor read RELATIVE to the 0-20 range (not a Dart-defined cutoff):
  // thirds of the range as a readability aid only.
  const tier = total === 0 ? 'no envenomation findings scored'
    : total <= 6 ? 'lower third of the 0-20 range (minimal-mild)'
    : total <= 13 ? 'middle third of the 0-20 range (moderate)'
    : 'upper third of the 0-20 range (severe)';
  const parts = `pulmonary ${subs.pulmonary}, cardiovascular ${subs.cardiovascular}, local wound ${subs.local}, GI ${subs.gi}, hematologic ${subs.hematologic}, CNS ${subs.cns}`;
  return {
    valid: true, total, subs,
    severe: total >= 14,
    abnormal: total >= 14,
    band: `SSS ${total}/20: ${tier} (${parts}). A continuous index -- higher is more severe; Dart 1996 sets no fixed cutoff.`,
    note: SSS_NOTE,
  };
}

// --- 2.4 cauchy-frostbite - Cauchy frostbite classification ------------------
const CAU_NOTE = 'Cauchy frostbite classification (Cauchy E, Chetaille E, Marchand V, Marsigny B, Wilderness Environ Med 2001): four grades set by the day-0 lesion topography after rapid rewarming, the day-2 bone-scan uptake, and the day-2 blisters. Grade 1 (no lesion) -- no amputation, no sequela; grade 2 (distal phalanx / clear blisters) -- soft-tissue (nail) amputation; grade 3 (intermediate-proximal phalanx / hemorrhagic blisters / absent digit uptake) -- bone amputation of the digit with functional sequelae; grade 4 (carpal-tarsal / hemorrhagic blisters over the carpus-tarsus / absent carpal-tarsal uptake) -- bone amputation of the limb with functional sequelae. A day-0/day-2 prognosis grade; the debridement and amputation decisions stay with the clinician and surgical team.';
const CAU_PROGNOSIS = {
  1: 'no amputation, no sequela',
  2: 'soft-tissue (nail) amputation likely',
  3: 'bone amputation of the digit, functional sequelae',
  4: 'bone amputation of the limb, functional sequelae',
};

export function cauchyFrostbite(input = {}) {
  // Each finding maps to a grade level; the overall grade is the most severe
  // (a more proximal bone-scan or topography finding upgrades the grade).
  const topoMap = { none: 1, 'distal-phalanx': 2, 'intermediate-proximal': 3, 'carpal-tarsal': 4 };
  const boneMap = { 'not-done': 1, normal: 1, hypofixation: 2, 'absent-digit': 3, 'absent-carpal-tarsal': 4 };
  const blistMap = { none: 1, clear: 2, 'hemorrhagic-digit': 3, 'hemorrhagic-carpal-tarsal': 4 };
  const topo = topoMap[input.topography];
  const bone = boneMap[input.boneScan];
  const blist = blistMap[input.blisters];
  if (topo == null) {
    return { valid: false, band: 'Select the day-0 lesion topography (none / distal phalanx / intermediate-proximal phalanx / carpal-tarsal) to grade the frostbite.', note: CAU_NOTE };
  }
  const grade = Math.max(topo, bone == null ? 1 : bone, blist == null ? 1 : blist);
  const drivers = [];
  if (grade === topo) drivers.push('topography');
  if (bone != null && grade === bone && bone > 1) drivers.push('bone scan');
  if (blist != null && grade === blist && blist > 1) drivers.push('blisters');
  return {
    valid: true, grade, prognosis: CAU_PROGNOSIS[grade],
    abnormal: grade >= 3,
    band: `Cauchy grade ${grade} (set by ${drivers.join(' + ') || 'topography'}): ${CAU_PROGNOSIS[grade]}.`,
    note: CAU_NOTE,
  };
}
