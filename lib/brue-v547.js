// spec-v547: the AAP lower-risk criteria for a Brief Resolved Unexplained Event (BRUE). Zero-hit before this
// tile: "brue", "tieder", "apparent life threatening", and "alte" across corpus.json, app.js, and
// lib/meta.js.
//
// A DIFFERENT PRESENTING COMPLAINT FROM THE EXISTING FEBRILE-INFANT RULES. The catalog's Rochester,
// Philadelphia, Boston and Step-by-Step tiles all stratify a FEVER. BRUE stratifies an apneic or
// color-change event in an infant who is AFEBRILE and WELL-APPEARING by the time they are seen. Reaching
// for a febrile-infant rule here would be applying a tool to a patient it was never derived in.
//
// **BRUE IS A DIAGNOSIS OF EXCLUSION, AND THE TILE ENFORCES THAT ORDER.** The event only qualifies as a BRUE
// if, after an appropriate history and physical examination, NO EXPLANATION IS IDENTIFIED. If the history or
// examination explains the episode -- reflux, a respiratory infection, a seizure, an airway anomaly, injury
// -- then it is that diagnosis and not a BRUE, and none of the lower-risk criteria apply. This tile asks
// that question FIRST and stops if the answer is no, rather than letting a reader stratify an event that was
// never a BRUE.
//
// THE QUALIFYING EVENT: an infant UNDER 1 YEAR, with a sudden, brief, and NOW RESOLVED episode of one or
// more of: cyanosis or pallor; absent, decreased, or irregular breathing; a marked change in tone, either
// hyper- or hypotonia; or an altered level of responsiveness.
//
// **THE SEVEN LOWER-RISK CRITERIA ARE CONJUNCTIVE: ALL SEVEN MUST BE MET.** Failing ANY ONE makes the infant
// higher-risk by definition -- there is no partial credit and no score. This tile therefore returns a binary
// verdict plus THE LIST OF CRITERIA NOT MET, because "higher-risk" without saying which criterion failed is
// far less useful at the bedside than knowing it was the duration, or the prematurity, or the exam.
//   1 age over 60 days
//   2 gestational age 32 weeks or more AND postconceptional age 45 weeks or more
//   3 only one BRUE: no prior BRUE ever, and not occurring in clusters
//   4 duration under 1 minute
//   5 no CPR by a trained medical provider required
//   6 no concerning historical features
//   7 no concerning physical examination findings
//
// **CRITERION 2 IS STATED WITH ITS INEQUALITY EXPLICIT, BECAUSE PUBLISHED RENDERINGS DIVERGE THERE.** Three
// independent reproductions give "32 weeks or more" and "45 weeks or more"; two give "over 32" and "over
// 45". This tile uses AT OR ABOVE, which matches the guideline's own stated rationale -- the risk is
// attributed to birth BELOW 32 weeks and attenuates ONCE 45 weeks postconceptional age is reached. An infant
// born at exactly 32 weeks 0 days is precisely where the two renderings disagree, so the threshold is spelled
// out rather than left to a symbol.
//
// HIGH-STAKES, AND THE ASYMMETRY IS THE WHOLE POINT: "lower-risk" is NOT "no risk", and it is NOT a discharge
// order. The classification exists to identify infants in whom extensive testing and admission are unlikely
// to help, so that they can be spared them -- it does not establish that nothing is wrong, and shared
// decision-making with the family is part of the guideline rather than an optional extra. "Higher-risk" is
// likewise not a diagnosis and not an admission order; it means the lower-risk pathway does not apply and
// the infant needs individualized assessment. This tile does not diagnose the cause of an event, does not
// recommend or exclude any investigation, and cannot detect the concerning historical or examination
// features that criteria 6 and 7 turn on -- those are clinical judgments the tile takes as given
// (spec-v11 section 5.3). Child abuse is among the causes an appropriate history and examination must
// consider. The clinical decision stays with the clinician.
//
// DEFINITION AND CRITERIA RE-FETCHED, NEVER RECALLED (spec-v97). The AAP's own site was inaccessible, so
// every element was confirmed across five independent reproductions of the guideline that agree on the
// definition and on all seven criteria:
//   - Tieder JS, Bonkowsky JL, Etzel RA, et al; Subcommittee on Apparent Life Threatening Events. Brief
//     Resolved Unexplained Events (Formerly Apparent Life-Threatening Events) and Evaluation of Lower-Risk
//     Infants. Pediatrics. 2016;137(5):e20160590.

export const BRUE_EVENT_FEATURES = [
  'Cyanosis or pallor',
  'Absent, decreased, or irregular breathing',
  'Marked change in tone, either hypertonia or hypotonia',
  'Altered level of responsiveness',
];

export const BRUE_LOWER_RISK_CRITERIA = [
  { key: 'ageOver60Days', text: 'Age over 60 days' },
  {
    key: 'gestationalAndPostconceptional',
    text: 'Gestational age 32 weeks or more AND postconceptional age 45 weeks or more',
    detail: 'Stated as at-or-above. Published renderings diverge here: three say "or more", two say "over". At or above matches the guideline’s rationale, which attributes risk to birth below 32 weeks, attenuating once 45 weeks postconceptional age is reached.',
  },
  { key: 'singleEvent', text: 'Only one BRUE: no prior BRUE ever, and not occurring in clusters' },
  { key: 'durationUnder1Min', text: 'Duration under 1 minute' },
  { key: 'noCpr', text: 'No CPR by a trained medical provider was required' },
  { key: 'noConcerningHistory', text: 'No concerning historical features' },
  { key: 'noConcerningExam', text: 'No concerning physical examination findings' },
];

const NOTE = 'The AAP guideline (Tieder and colleagues 2016) defines a Brief Resolved Unexplained Event as a sudden, brief, and now resolved episode in an infant under 1 year, of one or more of cyanosis or pallor, absent, decreased or irregular breathing, a marked change in tone, or an altered level of responsiveness, with no explanation identified after an appropriate history and physical examination. It is a diagnosis of exclusion: if the history or examination explains the episode, it is that diagnosis and not a BRUE, and the lower-risk criteria do not apply. Seven criteria define a lower-risk infant and all seven must be met: age over 60 days; gestational age 32 weeks or more and postconceptional age 45 weeks or more; only one BRUE, with no prior event and none in clusters; duration under 1 minute; no CPR by a trained medical provider; no concerning historical features; and no concerning physical examination findings. Failing any single criterion makes the infant higher-risk by definition, so there is no score and no partial credit. The prematurity criterion is stated as at or above because published renderings diverge between at-or-above and strictly-above, and at or above matches the guideline’s own rationale that risk is attributed to birth below 32 weeks and attenuates once 45 weeks postconceptional age is reached. Lower-risk is not no risk and is not a discharge order: the classification exists to identify infants in whom extensive testing and admission are unlikely to help, so that they can be spared them, and shared decision-making with the family is part of the guideline rather than an optional extra. Higher-risk is likewise not a diagnosis and not an admission order; it means the lower-risk pathway does not apply and the infant needs individualized assessment. This does not diagnose the cause of an event, does not recommend or exclude any investigation, and cannot detect the concerning historical or examination features that two of its criteria turn on, which are clinical judgments taken as given. Child abuse is among the causes an appropriate history and examination must consider. It also addresses a different presenting complaint from the febrile-infant rules, which stratify a fever rather than an apneic or color-change event in an afebrile, well-appearing infant.';

function readBool(v) {
  if (v === '' || v === null || v === undefined) return null;
  if (v === true || v === 1) return true;
  if (v === false || v === 0) return false;
  const s = String(v).trim().toLowerCase();
  if (['yes', 'y', '1', 'true'].includes(s)) return true;
  if (['no', 'n', '0', 'false'].includes(s)) return false;
  return NaN;
}

// input: qualifiesAsBrue (yes/no) plus one key per BRUE_LOWER_RISK_CRITERIA entry (yes/no).
export function brue(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const qualifies = readBool(o.qualifiesAsBrue);
  if (qualifies === null) {
    return { valid: false, message: 'Answer the qualifying question first: does the event meet the BRUE definition, with no explanation found after an appropriate history and examination? BRUE is a diagnosis of exclusion.' };
  }
  if (Number.isNaN(qualifies)) {
    return { valid: false, message: 'The qualifying answer must be yes or no.' };
  }

  if (!qualifies) {
    return {
      valid: true,
      isBrue: false,
      lowerRisk: null,
      failed: [],
      bandLabel: 'Not a BRUE',
      band: 'This event does not meet the BRUE definition, either because it does not match the qualifying features or because the history and examination identified an explanation. BRUE is a diagnosis of exclusion: when an explanation is found, the diagnosis is that explanation and the lower-risk criteria do not apply. Nothing further is scored here.',
      note: NOTE,
    };
  }

  const read = BRUE_LOWER_RISK_CRITERIA.map((c) => ({ c, v: readBool(o[c.key]) }));
  const missing = read.filter((r) => r.v === null).map((r) => r.c.key);
  if (missing.length) {
    return { valid: false, message: `All seven criteria must be answered, because they are conjunctive. Still needed: ${missing.join(', ')}.` };
  }
  const bad = read.filter((r) => Number.isNaN(r.v)).map((r) => r.c.key);
  if (bad.length) {
    return { valid: false, message: `Each criterion must be yes or no. Unrecognized: ${bad.join(', ')}.` };
  }

  const failed = read.filter((r) => !r.v).map((r) => r.c);
  const lowerRisk = failed.length === 0;

  return {
    valid: true,
    isBrue: true,
    lowerRisk,
    failed: failed.map((c) => c.key),
    failedText: failed.map((c) => c.text),
    bandLabel: lowerRisk ? 'BRUE, lower-risk' : 'BRUE, higher-risk',
    band: lowerRisk
      ? 'All seven lower-risk criteria are met, so this is a lower-risk BRUE. Lower-risk is not no risk and is not a discharge order: it identifies an infant in whom extensive testing and admission are unlikely to help, and shared decision-making with the family is part of the guideline.'
      : `Higher-risk, because the criteria are conjunctive and ${failed.length === 1 ? 'one criterion is' : `${failed.length} criteria are`} not met: ${failed.map((c) => c.text).join('; ')}. Higher-risk is not a diagnosis and not an admission order; it means the lower-risk pathway does not apply and the infant needs individualized assessment.`,
    note: NOTE,
  };
}
