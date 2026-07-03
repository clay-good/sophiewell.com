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

function bool(v) { return v === true || v === 1 || v === '1' || v === 'true' || v === 'yes'; }

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
