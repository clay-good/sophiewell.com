// spec-v302: Instability Severity Index Score (ISIS) — a preoperative score that
// estimates the risk of recurrence after arthroscopic Bankart repair for anterior
// shoulder instability (a catalog gap surfaced by the SESSION-40 fresh-domain
// search sweep: "shoulder dislocation/instability" had no tile). Six clinical /
// plain-radiograph factors sum to 0-10; a score above 6 predicts a high
// recurrence risk and favors an open procedure (Latarjet or open Bankart).
//
// This reports the cited score and its published threshold, NOT a surgical
// decision (spec-v11 §5.3) — the operative choice stays with the surgeon.
//
// POINTS RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified at build against two
// independent sources that agree on the six factors, their weights, and the >6
// cutoff:
//   - Balg F, Boileau P. The instability severity index score. A simple
//     pre-operative score to select patients for arthroscopic or open shoulder
//     stabilisation. J Bone Joint Surg Br. 2007;89(11):1470-1477.
//   - Reliability study, Clin Orthop Surg 2019;11(4):445 (reproduces Table 1:
//     age ≤20 = 2, competitive = 2, contact/overhead = 1, hyperlaxity = 1,
//     Hill-Sachs on AP = 2, glenoid loss of contour = 2; max 10; >6 favors open).

const POINTS = {
  ageUnder20: 2,        // age ≤20 years at surgery
  competitive: 2,       // competitive (vs recreational/none) sport
  contactSport: 1,      // contact or forced-overhead sport
  hyperlaxity: 1,       // anterior or inferior shoulder hyperlaxity
  hillSachs: 2,         // Hill-Sachs visible on AP radiograph in external rotation
  glenoidLoss: 2,       // glenoid loss of contour on AP radiograph
};
const MAX = 10;
const CUTOFF = 6; // score > 6 predicts high recurrence risk

const NOTE = 'Instability Severity Index Score (ISIS; Balg & Boileau 2007): six preoperative factors sum to 0-10 — age ≤20 (2), competitive sport (2), contact or forced-overhead sport (1), shoulder hyperlaxity (1), Hill-Sachs visible on the AP external-rotation radiograph (2), and glenoid loss of contour on the AP radiograph (2). A score above 6 predicts a high recurrence risk after an arthroscopic Bankart repair (recurrence >70% in the original series), for whom an open procedure (Latarjet or open Bankart) is favored; a score of 6 or less makes an arthroscopic Bankart repair a reasonable option. This reports the cited score and its threshold, not a surgical decision, which stays with the surgeon.';

// input booleans (each present -> its points). Returns the total and the
// high-recurrence-risk flag (>6).
export function isisScore(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const b = (v) => v === true || v === 'true' || v === 1 || v === '1' || v === 'on';

  let total = 0;
  for (const [key, pts] of Object.entries(POINTS)) {
    if (b(o[key])) total += pts;
  }
  const highRisk = total > CUTOFF;

  const band = highRisk
    ? `ISIS ${total} of ${MAX}: score >${CUTOFF} — high recurrence risk after arthroscopic Bankart repair; an open procedure (Latarjet or open Bankart) is favored.`
    : `ISIS ${total} of ${MAX}: score ≤${CUTOFF} — lower recurrence risk; arthroscopic Bankart repair is a reasonable option.`;

  return {
    valid: true,
    total,
    max: MAX,
    cutoff: CUTOFF,
    highRisk,
    abnormal: highRisk,
    bandLabel: highRisk ? `ISIS ${total} (high risk)` : `ISIS ${total}`,
    band,
    note: NOTE,
  };
}
