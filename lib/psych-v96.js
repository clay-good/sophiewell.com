// spec-v96 (Wave 2 of the spec-v85 Advanced Clinical Calculators program):
// six deterministic psychiatry rating scales -- the clinician-rated severity
// scales and the bipolar/PTSD screens that sit one rung above the brief
// self-report screeners already in the catalog (phq9, gad7, cssrs, gds15, epds,
// auditc). They measure depression, anxiety, OCD and PTSD severity and track
// treatment response over time.
//
//   hamd  - Hamilton Depression Rating Scale (HAM-D / HDRS, 17-item; Hamilton 1960)
//   hama  - Hamilton Anxiety Rating Scale (HAM-A, 14-item; Hamilton 1959)
//   madrs - Montgomery-Asberg Depression Rating Scale (10-item; Montgomery 1979)
//   mdq   - Mood Disorder Questionnaire bipolar-spectrum screen (Hirschfeld 2000)
//   ybocs - Yale-Brown Obsessive Compulsive Scale (Y-BOCS, 10-item; Goodman 1989)
//   pcl5  - PTSD Checklist for DSM-5 (PCL-5, 20-item; Blevins 2015)
//
// Pure functions only (spec-v29 §3 one-line test). Citations live inline in
// lib/meta.js; renderers in views/group-v22.js wire these to the home grid.
//
// Robustness (spec-v96 §3): every item is clamped to its own anchor range before
// summing; an item outside its anchor range never reaches the total -- the
// compute surfaces a valid:false fallback rather than a silently-wrong sum. The
// summed scales (hamd/hama/madrs/ybocs/pcl5) REFUSE a severity band from a
// partially-completed instrument (spec-v57): a blank item yields
// "(complete all N items)" and no band, because an unanswered item is not a zero.
// mdq is a fixed three-gate boolean rule, not a sum; a positive screen requires
// all three gates and the result names the failing gate(s) so a near-miss is
// auditable. None authors a diagnosis or treatment order in Sophie's voice
// (spec-v11 §5.3) -- each reports the score, the cited source's own band/cutoff,
// and the clinical posture note.

// Finite-or-null: any non-finite input (NaN/Infinity/''/undefined/null) is
// treated as "not provided" rather than throwing.
const fin = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);
const onFlag = (v) => v === true || v === 'yes' || v === 'on' || v === 1 || v === '1';

// Sum a fixed-length instrument whose item i has integer anchor range [0, max[i]].
// Returns { ok, total } when every item is a valid integer in range; otherwise a
// { ok:false, reason } describing the first failure: 'partial' (a blank item) or
// 'range' (an out-of-range / non-integer value). A blank item is distinct from an
// out-of-range one: the former withholds the band, the latter is a hard reject.
function scoreItems(items, maxes) {
  if (!Array.isArray(items) || items.length !== maxes.length) {
    return { ok: false, reason: 'partial' };
  }
  let total = 0;
  let outOfRange = false;
  for (let i = 0; i < maxes.length; i += 1) {
    const v = fin(items[i]);
    if (v == null) return { ok: false, reason: 'partial' };
    if (!Number.isInteger(v) || v < 0 || v > maxes[i]) { outOfRange = true; continue; }
    total += v;
  }
  if (outOfRange) return { ok: false, reason: 'range' };
  return { ok: true, total };
}

// --- 2.1 hamd - Hamilton Depression Rating Scale (17-item) --------------------
// Mixed anchors per Hamilton's original weighting: items 1-3, 7-11, 15 score
// 0-4; items 4-6, 12-14, 16-17 score 0-2. Total 0-52.
const HAMD_MAX = [4, 4, 4, 2, 2, 2, 4, 4, 4, 4, 4, 2, 2, 2, 4, 2, 2];
function hamdBand(t) {
  if (t <= 7) return { label: 'no / none', range: '0–7' };
  if (t <= 16) return { label: 'mild', range: '8–16' };
  if (t <= 23) return { label: 'moderate', range: '17–23' };
  return { label: 'severe', range: '≥ 24' };
}
const HAMD_NOTE = 'Hamilton Depression Rating Scale (HAM-D / HDRS, Hamilton 1960): 17 clinician-rated items with mixed anchors -- items 1-3, 7-11 and 15 score 0-4; items 4-6, 12-14 and 16-17 score 0-2. Total 0-52. Severity: no/none 0-7, mild 8-16, moderate 17-23, severe >= 24. A blank item withholds the band (an unanswered item is not a zero); the rated total measures severity, it does not diagnose.';
export function hamd({ items } = {}) {
  const s = scoreItems(items, HAMD_MAX);
  if (!s.ok) {
    return {
      valid: false,
      band: s.reason === 'partial' ? '(complete all 17 items)' : 'Each HAM-D item must be an integer in its anchor range (items 1-3, 7-11, 15: 0–4; items 4-6, 12-14, 16-17: 0–2).',
      note: HAMD_NOTE,
    };
  }
  const b = hamdBand(s.total);
  return {
    valid: true,
    total: s.total,
    bandLabel: b.label,
    range: b.range,
    band: `HAM-D ${s.total}: ${b.label} depression (${b.range}).`,
    note: HAMD_NOTE,
  };
}

// --- 2.2 hama - Hamilton Anxiety Rating Scale (14-item) -----------------------
// 14 clinician-rated items, each 0-4. Total 0-56.
const HAMA_MAX = [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4];
function hamaBand(t) {
  if (t <= 17) return { label: 'mild', range: '≤ 17' };
  if (t <= 24) return { label: 'mild to moderate', range: '18–24' };
  if (t <= 30) return { label: 'moderate to severe', range: '25–30' };
  return { label: 'severe', range: '≥ 31' };
}
const HAMA_NOTE = 'Hamilton Anxiety Rating Scale (HAM-A, Hamilton 1959): 14 clinician-rated items, each 0-4. Total 0-56. Severity: mild <= 17, mild to moderate 18-24, moderate to severe 25-30, severe >= 31. A blank item withholds the band; the rated total measures severity, it does not diagnose.';
export function hama({ items } = {}) {
  const s = scoreItems(items, HAMA_MAX);
  if (!s.ok) {
    return {
      valid: false,
      band: s.reason === 'partial' ? '(complete all 14 items)' : 'Each HAM-A item must be an integer 0–4.',
      note: HAMA_NOTE,
    };
  }
  const b = hamaBand(s.total);
  return {
    valid: true,
    total: s.total,
    bandLabel: b.label,
    range: b.range,
    band: `HAM-A ${s.total}: ${b.label} anxiety (${b.range}).`,
    note: HAMA_NOTE,
  };
}

// --- 2.3 madrs - Montgomery-Asberg Depression Rating Scale (10-item) ----------
// 10 items, each 0-6. Total 0-60. Designed to be sensitive to change.
const MADRS_MAX = [6, 6, 6, 6, 6, 6, 6, 6, 6, 6];
function madrsBand(t) {
  if (t <= 6) return { label: 'normal / symptom absent', range: '0–6' };
  if (t <= 19) return { label: 'mild', range: '7–19' };
  if (t <= 34) return { label: 'moderate', range: '20–34' };
  return { label: 'severe', range: '≥ 35' };
}
const MADRS_NOTE = 'Montgomery-Asberg Depression Rating Scale (MADRS, Montgomery & Asberg 1979): 10 items, each 0-6, designed to be sensitive to change with treatment. Total 0-60. Severity: normal 0-6, mild 7-19, moderate 20-34, severe >= 35. A blank item withholds the band; the rated total measures severity, it does not diagnose.';
export function madrs({ items } = {}) {
  const s = scoreItems(items, MADRS_MAX);
  if (!s.ok) {
    return {
      valid: false,
      band: s.reason === 'partial' ? '(complete all 10 items)' : 'Each MADRS item must be an integer 0–6.',
      note: MADRS_NOTE,
    };
  }
  const b = madrsBand(s.total);
  return {
    valid: true,
    total: s.total,
    bandLabel: b.label,
    range: b.range,
    band: `MADRS ${s.total}: ${b.label} (${b.range}).`,
    note: MADRS_NOTE,
  };
}

// --- 2.4 mdq - Mood Disorder Questionnaire (bipolar-spectrum screen) ----------
// A fixed three-gate boolean rule, NOT a sum. A positive screen requires ALL of:
// (1) >= 7 of 13 symptom items YES, (2) co-occurrence YES, (3) impairment moderate
// or serious. The output names which gate(s) failed when the screen is negative.
const MDQ_IMPAIRMENT = { none: 0, minor: 1, moderate: 2, serious: 3 };
const MDQ_NOTE = 'Mood Disorder Questionnaire (Hirschfeld 2000): a bipolar-spectrum SCREEN, not a diagnosis. A positive screen requires all three gates -- >= 7 of the 13 symptom items endorsed YES, AND the symptoms co-occurred during the same period, AND they caused moderate or serious functional impairment. A positive screen warrants a structured diagnostic interview; it does not establish bipolar disorder.';
export function mdq({ symptoms, coOccurrence, impairment } = {}) {
  // Count endorsed symptom items among whatever is provided (a non-array is 0).
  const list = Array.isArray(symptoms) ? symptoms : [];
  const yesCount = list.reduce((n, v) => n + (onFlag(v) ? 1 : 0), 0);
  const coOccur = onFlag(coOccurrence);
  const impKey = impairment == null ? '' : String(impairment).toLowerCase();
  const impLevel = Object.prototype.hasOwnProperty.call(MDQ_IMPAIRMENT, impKey) ? MDQ_IMPAIRMENT[impKey] : null;
  const impairmentOk = impLevel != null && impLevel >= 2;

  const gateSymptoms = yesCount >= 7;
  const positive = gateSymptoms && coOccur && impairmentOk;

  // spec-v1114: declared here rather than below, where the first draft put it --
  // `failed` reads it, and a `const` used above its declaration is a ReferenceError
  // rather than an undefined. The spec-v53 fuzz harness caught that on the very
  // path my own check had not taken.
  const answeredSymptoms = list.filter((v) => v !== '' && v !== null && v !== undefined).length;
  const unansweredSymptoms = 13 - answeredSymptoms;

  const failed = [];
  if (!gateSymptoms) {
    failed.push(`${yesCount} of ${answeredSymptoms === 13 ? '13' : `the ${answeredSymptoms} answered`} symptoms YES — below the 7-item threshold`);
  }
  if (!coOccur) failed.push('symptoms did not co-occur in the same period');
  if (!impairmentOk) {
    failed.push(impLevel == null
      ? 'functional impairment not rated'
      : 'impairment rated below moderate');
  }

  // spec-v1108's ledger, drained in spec-v1112, and NOT the lookup-fallback
  // shape the rest of that ledger turned out to be. The MDQ is three AND-gates,
  // and every one of them can be unanswered.
  //
  // The first draft of this fix guarded only the impairment, on the reasoning
  // that the other two are checkboxes and an unticked checkbox is a real "no"
  // (rule 4). They are not checkboxes. `views/group-v22.js` renders the thirteen
  // symptom items and the co-occurrence question as yes/no SELECTS, which
  // defaulted to "No" -- so the tile opened reading "Negative screen: 0 of 13
  // symptoms YES" for a screener nobody had administered. Rule 4 is about a
  // control that is a genuine binary; a select that opens on one of its two
  // answers is answering for the reader (rule 8).
  //
  // The symptom gate is MONOTONE: an unanswered item can only add a YES. So a
  // negative on that gate is earned only when enough items are answered that
  // even every remaining one being YES could not reach 7. And a gate nobody
  // answered has not been failed:
  //
  //   mdq({ symptoms: [13 x yes], coOccurrence: true })
  //     -> "Negative screen: functional impairment not rated."
  //
  // Thirteen of thirteen symptoms, co-occurring, and the screen came back
  // negative because nobody rated the impairment.
  const symptomGateSettled = gateSymptoms || (yesCount + unansweredSymptoms < 7);
  const coOccurAnswered = coOccurrence !== undefined && coOccurrence !== null && coOccurrence !== '';
  // A gate FAILS only if it was answered and did not pass.
  const ratedGatesFail = (symptomGateSettled && !gateSymptoms)
    || (coOccurAnswered && !coOccur)
    || (impLevel != null && !impairmentOk);
  const blockedOnUnrated = !positive && !ratedGatesFail;
  const outstanding = [];
  if (!symptomGateSettled) outstanding.push(`${unansweredSymptoms} of the 13 symptom items are unanswered`);
  // Phrased with the house's `is needed` (rule 16, measured in spec-v1097)
  // rather than a new form of words. The symptom clause above already matches
  // the `N of the 13 ... items` pattern.
  if (!coOccurAnswered) outstanding.push('an answer to the co-occurrence question is needed');
  if (impLevel == null) outstanding.push('a functional-impairment rating is needed');

  const band = positive
    // spec-v1114: "13 of 13 symptoms YES" read as thirteen asked and thirteen
    // endorsed. With twelve answered it said "12 of 13", which is a different
    // claim from twelve of twelve. Rule 20: the denominator is the number
    // answered, and it belongs in the sentence.
    ? `Positive screen: ${yesCount} of ${answeredSymptoms === 13 ? '13' : `the ${answeredSymptoms} answered`} symptoms YES, co-occurring, with moderate/serious impairment — all three gates met.`
    : (blockedOnUnrated
      ? `Not yet a screen result: ${outstanding.length > 1
        ? `${outstanding.slice(0, -1).join(', ')} and ${outstanding[outstanding.length - 1]}`
        : outstanding[0]}. A gate that was not answered has `
        + 'not been failed, so this is neither a positive nor a negative screen.'
      : `Negative screen: ${failed.join('; ')}.`);
  return {
    valid: true,
    positive,
    blockedOnUnrated,
    outstanding,
    answeredSymptoms,
    yesCount,
    coOccur,
    impairmentLevel: impKey || 'not rated',
    gates: { symptoms: gateSymptoms, coOccurrence: coOccur, impairment: impairmentOk },
    band,
    note: MDQ_NOTE,
  };
}

// --- 2.5 ybocs - Yale-Brown Obsessive Compulsive Scale (10-item) --------------
// 10 items, each 0-4: items 1-5 obsessions, items 6-10 compulsions. Total 0-40,
// obsession subtotal 0-20, compulsion subtotal 0-20.
const YBOCS_MAX = [4, 4, 4, 4, 4, 4, 4, 4, 4, 4];
function ybocsBand(t) {
  if (t <= 7) return { label: 'subclinical', range: '0–7' };
  if (t <= 15) return { label: 'mild', range: '8–15' };
  if (t <= 23) return { label: 'moderate', range: '16–23' };
  if (t <= 31) return { label: 'severe', range: '24–31' };
  return { label: 'extreme', range: '32–40' };
}
const YBOCS_NOTE = 'Yale-Brown Obsessive Compulsive Scale (Y-BOCS, Goodman 1989): 10 items, each 0-4 -- items 1-5 grade obsessions, items 6-10 grade compulsions. Total 0-40 (obsession subtotal 0-20 + compulsion subtotal 0-20). Severity: subclinical 0-7, mild 8-15, moderate 16-23, severe 24-31, extreme 32-40. A blank item withholds the band; the rated total measures severity, it does not diagnose.';
export function ybocs({ items } = {}) {
  const s = scoreItems(items, YBOCS_MAX);
  if (!s.ok) {
    return {
      valid: false,
      band: s.reason === 'partial' ? '(complete all 10 items)' : 'Each Y-BOCS item must be an integer 0–4.',
      note: YBOCS_NOTE,
    };
  }
  const obsession = items.slice(0, 5).reduce((a, v) => a + v, 0);
  const compulsion = items.slice(5, 10).reduce((a, v) => a + v, 0);
  const b = ybocsBand(s.total);
  return {
    valid: true,
    total: s.total,
    obsession,
    compulsion,
    bandLabel: b.label,
    range: b.range,
    band: `Y-BOCS ${s.total}: ${b.label} (${b.range}) — obsessions ${obsession}/20, compulsions ${compulsion}/20.`,
    note: YBOCS_NOTE,
  };
}

// --- 2.6 pcl5 - PTSD Checklist for DSM-5 (20-item) ----------------------------
// 20 items, each 0-4, mapped to DSM-5 clusters: 1-5 B re-experiencing, 6-7 C
// avoidance, 8-14 D negative cognitions/mood, 15-20 E arousal. Total 0-80. An
// item is "endorsed" toward a cluster tally at a rating >= 2 per the source's
// symptom-cluster scoring convention. The provisional-PTSD screen is quoted as
// the source's cutoff RANGE (commonly >= 31-33), not a single hard threshold.
const PCL5_MAX = [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4];
const PCL5_NOTE = 'PTSD Checklist for DSM-5 (PCL-5, Blevins 2015; US-government public domain): 20 items, each 0-4. Total 0-80. DSM-5 clusters: items 1-5 B re-experiencing, 6-7 C avoidance, 8-14 D negative cognitions/mood, 15-20 E arousal (an item counts toward its cluster tally at a rating >= 2). A total at or above the commonly cited provisional cutoff (>= 31-33) suggests probable PTSD and warrants a structured interview; the optimal cutpoint varies by population. A blank item withholds the result.';
function clusterTally(items, lo, hi) {
  let n = 0;
  for (let i = lo; i <= hi; i += 1) if (items[i] >= 2) n += 1;
  return n;
}
export function pcl5({ items } = {}) {
  const s = scoreItems(items, PCL5_MAX);
  if (!s.ok) {
    return {
      valid: false,
      band: s.reason === 'partial' ? '(complete all 20 items)' : 'Each PCL-5 item must be an integer 0–4.',
      note: PCL5_NOTE,
    };
  }
  // Quote the cutoff as the source's range; total >= 31 is "at or above" it.
  const atCutoff = s.total >= 31;
  const clusters = {
    B: clusterTally(items, 0, 4),
    C: clusterTally(items, 5, 6),
    D: clusterTally(items, 7, 13),
    E: clusterTally(items, 14, 19),
  };
  const screen = atCutoff
    ? 'at or above the commonly cited provisional cutoff (≥ 31–33)'
    : 'below the commonly cited provisional cutoff (≥ 31–33)';
  return {
    valid: true,
    total: s.total,
    atCutoff,
    clusters,
    band: `PCL-5 ${s.total}: ${screen}. Clusters endorsed (rating ≥ 2): B ${clusters.B}/5, C ${clusters.C}/2, D ${clusters.D}/7, E ${clusters.E}/6.`,
    note: PCL5_NOTE,
  };
}
