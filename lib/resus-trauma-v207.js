// spec-v207: resuscitation, cardiac-arrest & trauma-death prognosis instruments
// (Frontline & Bedside Decision Instruments program, spec-v204 §1.1). Every id
// was verified absent by a direct scan of app.js first (spec-v85 §6.2). None
// duplicates a live tile; v207 runs no AI and makes no runtime network call.
// These prognosticate and stratify — they are NOT a termination, rapid-response,
// transfusion, or care-limitation order (spec-v11 §5.3). Shipped one tile at a
// time per an active /goal.
//
//   torRule    - Termination-of-Resuscitation rule (BLS and ALS)
//   rems       - Rapid Emergency Medicine Score
//   cartScore  - Cardiac Arrest Risk Triage (CART) score
//   cahpScore  - Cardiac Arrest Hospital Prognosis (CAHP) score
//   crash2     - CRASH-2 prognostic model (death in traumatic bleeding)
//
// CRITERIA / POINT WEIGHTS RE-FETCHED, NEVER RECALLED (spec-v97), each
// cross-verified across >= 2 independent open sources at implementation:
//   - TOR rules (Morrison LJ, et al, N Engl J Med 2006;355(5):478-487 for BLS;
//     Resuscitation 2007;74(2):266-275 for ALS): the BLS rule allows terminating
//     resuscitation when ALL THREE are true — arrest not witnessed by EMS, no
//     ROSC before transport, and no shock delivered (specificity ~90%, PPV for
//     death ~99.5%). The ALS rule adds two — arrest not witnessed by ANYONE
//     (bystander or EMS) and no bystander CPR — so all FIVE positive facts must
//     be absent (100% specificity for death in the derivation). Non-traumatic
//     adult OHCA only.

import { num } from './num.js';

function bool(v) { return v === true || v === 1 || v === '1' || v === 'true' || v === 'yes'; }
function numIn(v, lo, hi) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < lo || n > hi) return null;
  return n;
}

// --- 2.3 Termination-of-Resuscitation rule ----------------------------------
const TOR_NOTE = 'Termination-of-Resuscitation rules (Morrison LJ, et al, N Engl J Med 2006;355(5):478-487 for BLS; Resuscitation 2007;74(2):266-275 for ALS): field decision support for non-traumatic adult out-of-hospital cardiac arrest. BLS TOR may be considered when the arrest was not witnessed by EMS, there was no ROSC before transport, and no shock was delivered (specificity ≈ 90%, PPV for death ≈ 99.5%). ALS TOR adds two more — not witnessed by anyone and no bystander CPR (100% specificity for death in the derivation). Decision support for a field crew — never a mandate to stop and never a disposition order.';

export function torRule(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const rule = o.rule === 'als' ? 'als' : o.rule === 'bls' ? 'bls' : null;
  if (rule === null) {
    return { valid: false, message: 'Select the rule (BLS or ALS) and set the arrest facts.' };
  }
  // Positive facts (what happened); TOR requires each to be ABSENT.
  const emsWitnessed = bool(o.emsWitnessed);
  const rosc = bool(o.rosc);
  const shock = bool(o.shock);
  const bystanderWitnessed = bool(o.bystanderWitnessed);
  const bystanderCpr = bool(o.bystanderCpr);
  // Each entry: [label of the survival-favoring fact, present?]
  const facts = [
    ['arrest witnessed by EMS', emsWitnessed],
    ['ROSC before transport', rosc],
    ['shock delivered', shock],
  ];
  if (rule === 'als') {
    facts.push(['arrest witnessed by a bystander', bystanderWitnessed]);
    facts.push(['bystander CPR provided', bystanderCpr]);
  }
  const present = facts.filter((f) => f[1]).map((f) => f[0]);
  const met = present.length === 0;
  return {
    valid: true,
    met,
    abnormal: met,
    bandLabel: rule.toUpperCase() + (met ? ' TOR met' : ' continue'),
    band: met
      ? `${rule.toUpperCase()} TOR rule — all criteria met; termination of resuscitation may be considered.`
      : `${rule.toUpperCase()} TOR rule — not met; continue resuscitation / transport.`,
    detail: met
      ? 'None of the survival-favoring facts is present.'
      : `Continue because present: ${present.join('; ')}.`,
    note: TOR_NOTE,
  };
}

// --- 2.5 Rapid Emergency Medicine Score (REMS) ------------------------------
// POINT MAP RE-FETCHED, NEVER RECALLED (spec-v97): REMS (Olsson T, Terent A, Lind
// L, J Intern Med 2004;255(5):579-587) is the abbreviated-APACHE-II acute-
// physiology scheme plus age and SpO2. The structure — age 0-6, and MAP, heart
// rate, respiratory rate, SpO2, and GCS each 0-4 (maximum 26) — is confirmed
// across >= 3 open sources. MAP / heart rate / respiratory rate use the
// universally documented APACHE-II acute-physiology bands; SpO2 and the banded
// GCS are the REMS specifics. NOTE: one readable reproduction (PMC4024603 Table
// 1) is internally inconsistent — it compresses MAP/HR/SpO2 to a maximum of 3, so
// its columns sum to 23, contradicting the ≥ 3-source-confirmed maximum of 26;
// the APACHE-II-standard bands below (validated by that max-26 constraint) are
// used instead. Risk bands: low < 6, medium 6-13, high > 13 in-hospital mortality.
const REMS_NOTE = 'Rapid Emergency Medicine Score (Olsson T, Terent A, Lind L, J Intern Med 2004;255(5):579-587): an abbreviated-APACHE-II in-hospital-mortality score needing no labs — age, mean arterial pressure, heart rate, respiratory rate, SpO₂, and GCS (age 0-6, the five physiologic variables 0-4 each; total 0-26). Risk bands: low < 6, medium 6-13, high > 13; each 1-point rise carries an odds ratio ≈ 1.4 for in-hospital death. A rapid ED prognostic estimate, not a triage or disposition order.';

function remsAge(v) { return v < 45 ? 0 : v <= 54 ? 2 : v <= 64 ? 3 : v <= 74 ? 5 : 6; }
function remsMap(v) { return (v < 50 || v >= 160) ? 4 : v <= 69 ? 2 : v <= 109 ? 0 : v <= 129 ? 2 : 3; }
function remsHr(v) { return (v < 40 || v >= 180) ? 4 : v <= 54 ? 3 : v <= 69 ? 2 : v <= 109 ? 0 : v <= 139 ? 2 : 3; }
function remsRr(v) { return (v < 6 || v >= 50) ? 4 : v <= 9 ? 2 : v <= 11 ? 1 : v <= 24 ? 0 : v <= 34 ? 1 : 3; }
function remsSpo2(v) { return v < 75 ? 4 : v <= 85 ? 3 : v <= 89 ? 1 : 0; }
function remsGcs(v) { return v > 13 ? 0 : v >= 11 ? 1 : v >= 8 ? 2 : v >= 5 ? 3 : 4; }

export function rems(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const age = numIn(o.age, 0, 120);
  const map = numIn(o.map, 0, 300);
  const hr = numIn(o.hr, 0, 350);
  const rr = numIn(o.rr, 0, 120);
  const spo2 = numIn(o.spo2, 0, 100);
  const gcs = numIn(o.gcs, 3, 15);
  if ([age, map, hr, rr, spo2, gcs].some((v) => v === null)) {
    return { valid: false, message: 'Enter age, mean arterial pressure (mmHg), heart rate, respiratory rate, SpO₂ (%), and GCS (3–15).' };
  }
  const parts = [
    ['Age', remsAge(age)], ['MAP', remsMap(map)], ['Heart rate', remsHr(hr)],
    ['Respiratory rate', remsRr(rr)], ['SpO₂', remsSpo2(spo2)], ['GCS', remsGcs(gcs)],
  ];
  let total = 0;
  for (const [, pts] of parts) total += pts;
  total = num('REMS', total, { min: 0, max: 26 });
  let tier; let abnormal = true;
  if (total < 6) { tier = 'low-risk (< 6)'; abnormal = false; }
  else if (total <= 13) tier = 'medium-risk (6–13)';
  else tier = 'high-risk (> 13)';
  const active = parts.filter((p) => p[1] > 0).map((p) => `${p[0]} +${p[1]}`);
  return {
    valid: true,
    score: total,
    abnormal,
    bandLabel: `REMS ${total}`,
    band: `REMS ${total}/26 — ${tier} for in-hospital mortality.`,
    detail: active.length ? `Contributors: ${active.join('; ')}.` : 'All variables in their reference bands — REMS 0.',
    note: REMS_NOTE,
  };
}
