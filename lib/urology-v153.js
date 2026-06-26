// spec-v153 (the third implementation spec of the spec-v150 Post-Parity
// Coverage program): three deterministic urology / men's-health patient-
// reported symptom scores that fill a confirmed gap — the catalog carried the
// urologic *oncology* math (psa-density, psa-velocity, psa-doubling-time,
// prostate-volume, gleason-grade-group, damico-prostate-risk, capra-score) and
// the stone scores, but NONE of the validated symptom-score instruments that
// drive benign-disease management. None duplicates a live tile; v153 runs no AI
// and makes no runtime network call.
//
//   ipss  - International Prostate Symptom Score (IPSS / AUA-SI) for BPH/LUTS
//   iief5 - IIEF-5 / Sexual Health Inventory for Men (SHIM) for erectile dysfunction
//   oabss - Overactive Bladder Symptom Score for OAB
//
// Per the spec-v100 §2 doctrine each is a bounded item sum over fixed-range
// selects (spec-v29 §3 one-line test); a blank/unanswered item renders a
// surfaced valid:false complete-the-fields fallback rather than scoring an
// undercounted total (spec-v59 output safety). Citations live inline in
// lib/meta.js; the renderers in views/group-v153.js render the spec-v50 §3
// posture note (these are self-reported symptoms over the recall window) and
// defer the management decision to the clinician (spec-v11 §5.3).
//
// ITEM SCORING AND BANDS RE-FETCHED, NEVER RECALLED (spec-v97), each cross-
// verified across >= 2 independent sources at implementation (the original
// validation papers, MDCalc, AUA/EAU guideline summaries, and peer-reviewed
// urology reviews). SOURCE-GOVERNANCE:
//   - ipss (Barry MJ, Fowler FJ, O'Leary MP, et al, J Urol 1992;148(5):1549):
//     SEVEN symptom questions each 0-5 (incomplete emptying, frequency,
//     intermittency, urgency, weak stream, straining, nocturia) summed 0-35;
//     bands 0-7 mild, 8-19 moderate, 20-35 severe. A SEPARATE quality-of-life /
//     bother item 0-6 ("delighted" 0 -> "terrible" 6) is reported alongside and
//     is NEVER summed into the 0-35 symptom total (a common scoring error).
//   - iief5 (Rosen RC, Cappelleri JC, Smith MD, et al, Int J Impot Res
//     1999;11(6):319): FIVE items. Q1 (confidence) is a pure 1-5 Likert with no
//     0; Q2-Q5 carry an on-form "0 = no sexual activity / did not attempt
//     intercourse" option (range 0-5). The published clinical range and the
//     severity table are anchored to 5-25: 22-25 no ED, 17-21 mild, 12-16 mild-
//     to-moderate, 8-11 moderate, 5-7 severe (totals below 5, possible when the
//     0 options are used, fall in the severe band).
//   - oabss (Homma Y, Yoshida M, Seki N, et al, Urology 2006;68(2):318): FOUR
//     items — daytime frequency (0-2: <=7=0, 8-14=1, >=15=2), nighttime
//     frequency/nocturia (0-3: 0/1/2/>=3), urgency (0-5 six-point frequency
//     scale), urgency incontinence (0-5 same scale). Total 0-15; bands <=5 mild,
//     6-11 moderate, >=12 severe. The OAB DIAGNOSTIC GATE is urgency item >= 2
//     AND total >= 3; a high total without urgency >= 2 does not meet the
//     symptom definition and is flagged.

import { num } from './num.js';

// Read one fixed-range item: '' / null / undefined -> null (so a caller can
// surface a complete-the-fields fallback); otherwise clamp to [0, max] integer.
function item(v, max) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  return Math.min(max, Math.max(0, Math.round(n)));
}

// Sum a fixed list of items, collecting the 1-based positions still missing.
function sumItems(o, keys, max) {
  const missing = [];
  let total = 0;
  keys.forEach((k, i) => {
    const v = item(o[k], max);
    if (v === null) missing.push(`Q${i + 1}`);
    else total += v;
  });
  return { total, missing };
}

// --- 2.1 IPSS / AUA Symptom Index --------------------------------------------
const IPSS_NOTE = 'International Prostate Symptom Score / AUA Symptom Index (Barry MJ, Fowler FJ Jr, O’Leary MP, et al, J Urol 1992;148(5):1549-1557) — the standard self-administered instrument for lower-urinary-tract symptoms of benign prostatic hyperplasia. Seven symptom questions (incomplete emptying, frequency, intermittency, urgency, weak stream, straining, nocturia) are each scored 0–5 over the past month and summed: total 0–7 mild, 8–19 moderate, 20–35 severe. The separate quality-of-life / bother item (0 delighted → 6 terrible) is reported alongside and is not added into the 0–35 symptom total.';
const IPSS_QOL = ['delighted', 'pleased', 'mostly satisfied', 'mixed', 'mostly dissatisfied', 'unhappy', 'terrible'];

export function ipss(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const keys = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7'];
  const { total, missing } = sumItems(o, keys, 5);
  if (missing.length) {
    return { valid: false, message: `Answer all 7 symptom questions — ${missing.length} still needed (${missing.join(', ')}).` };
  }
  const t = num('IPSS total', total, { min: 0, max: 35 });
  let band; let abnormal;
  if (t <= 7) { band = 'mild'; abnormal = false; }
  else if (t <= 19) { band = 'moderate'; abnormal = true; }
  else { band = 'severe'; abnormal = true; }
  const qol = item(o.qol, 6);
  const out = {
    valid: true,
    score: t,
    bandLabel: band.replace(/^./, (m) => m.toUpperCase()),
    abnormal,
    band: `IPSS ${t}/35 — ${band} symptoms.`,
    detail: `sum of seven 0–5 symptom answers = ${t}.`,
    note: IPSS_NOTE,
  };
  if (qol !== null) {
    out.qol = qol;
    out.qolLabel = IPSS_QOL[qol];
    out.band += ` Quality of life ${qol}/6 (${IPSS_QOL[qol]}) — reported separately, not in the symptom total.`;
  }
  return out;
}

// --- 2.2 IIEF-5 / SHIM -------------------------------------------------------
const IIEF5_NOTE = 'IIEF-5 / Sexual Health Inventory for Men (Rosen RC, Cappelleri JC, Smith MD, et al, Int J Impot Res 1999;11(6):319-326) — the abridged five-item screen for erectile dysfunction over the past six months. Item 1 (confidence) is scored 1–5; items 2–5 carry an on-form "0 = no sexual activity / did not attempt intercourse" option (0–5). The total is banded 22–25 no erectile dysfunction, 17–21 mild, 12–16 mild-to-moderate, 8–11 moderate, 5–7 severe; a score ≤21 is the diagnostic threshold for erectile dysfunction.';

export function iief5(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const keys = ['q1', 'q2', 'q3', 'q4', 'q5'];
  const { total, missing } = sumItems(o, keys, 5);
  if (missing.length) {
    return { valid: false, message: `Answer all 5 questions — ${missing.length} still needed (${missing.join(', ')}).` };
  }
  const t = num('IIEF-5 total', total, { min: 0, max: 25 });
  let band; let abnormal;
  if (t >= 22) { band = 'no erectile dysfunction'; abnormal = false; }
  else if (t >= 17) { band = 'mild ED'; abnormal = true; }
  else if (t >= 12) { band = 'mild-to-moderate ED'; abnormal = true; }
  else if (t >= 8) { band = 'moderate ED'; abnormal = true; }
  else { band = 'severe ED'; abnormal = true; }
  return {
    valid: true,
    score: t,
    bandLabel: band.replace(/^./, (m) => m.toUpperCase()),
    abnormal,
    band: `IIEF-5 ${t}/25 — ${band}${t <= 21 ? ' (≤21 meets the diagnostic threshold for ED)' : ''}.`,
    detail: `sum of five items (Q1 1–5, Q2–Q5 0–5) = ${t}.`,
    note: IIEF5_NOTE,
  };
}

// --- 2.3 OABSS ----------------------------------------------------------------
const OABSS_NOTE = 'Overactive Bladder Symptom Score (Homma Y, Yoshida M, Seki N, et al, Urology 2006;68(2):318-323) — a four-item self-report for overactive bladder over the past week. Daytime frequency (0–2), nighttime frequency / nocturia (0–3), urgency (0–5), and urgency incontinence (0–5) sum to 0–15: ≤5 mild, 6–11 moderate, ≥12 severe. The diagnostic definition requires the urgency item ≥2 and a total ≥3; a high total driven by frequency alone (urgency < 2) does not meet the OAB symptom definition and is flagged.';

export function oabss(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const day = item(o.daytime, 2);
  const night = item(o.nocturia, 3);
  const urg = item(o.urgency, 5);
  const inc = item(o.incontinence, 5);
  const missing = [];
  if (day === null) missing.push('daytime frequency');
  if (night === null) missing.push('nocturia');
  if (urg === null) missing.push('urgency');
  if (inc === null) missing.push('urgency incontinence');
  if (missing.length) {
    return { valid: false, message: `Answer all 4 items — still needed: ${missing.join(', ')}.` };
  }
  const t = num('OABSS total', day + night + urg + inc, { min: 0, max: 15 });
  let band; let abnormal;
  if (t <= 5) { band = 'mild'; abnormal = false; }
  else if (t <= 11) { band = 'moderate'; abnormal = true; }
  else { band = 'severe'; abnormal = true; }
  const meetsOab = urg >= 2 && t >= 3;
  let bandText = `OABSS ${t}/15 — ${band}.`;
  if (meetsOab) {
    bandText += ' Meets the OAB symptom definition (urgency ≥ 2 and total ≥ 3).';
  } else {
    bandText += urg < 2
      ? ' Does NOT meet the OAB symptom definition — the urgency item is < 2 (OAB requires urgency ≥ 2 and total ≥ 3).'
      : ' Does NOT meet the OAB symptom definition — total < 3 (OAB requires urgency ≥ 2 and total ≥ 3).';
  }
  return {
    valid: true,
    score: t,
    bandLabel: band.replace(/^./, (m) => m.toUpperCase()),
    abnormal,
    meetsOab,
    urgency: urg,
    band: bandText,
    detail: `daytime ${day} + nocturia ${night} + urgency ${urg} + incontinence ${inc} = ${t}.`,
    note: OABSS_NOTE,
  };
}
