// spec-v547 MCP wave: adapter for the AAP BRUE lower-risk criteria in lib/brue-v547.js. The dom keys mirror
// the browser renderer (views/group-v547.js) and META['brue'].example: brue-<key> maps to the lib arg <key>.
//
// **`brue-qualifiesAsBrue` IS A GATE, NOT A FORMALITY, AND THE LIB STOPS ON IT.** BRUE is a diagnosis of
// exclusion: if the history or examination explains the episode, the diagnosis is that explanation and the
// lower-risk criteria DO NOT APPLY. An agent handed "infant had an apneic episode, was it lower-risk?" must
// establish the exclusion first. Answering the gate "no" returns a finished, valid result with
// `lowerRisk: null` - deliberately null rather than false, because the event was never stratified, and
// reporting "not lower-risk" would imply higher-risk when the truth is "not a BRUE at all".
//
// **THE SEVEN CRITERIA ARE CONJUNCTIVE AND THERE IS NO SCORE.** Failing any one is higher-risk by
// definition. This is the shape an agent most reliably gets wrong on criteria lists: it will want to count
// how many were met. The result exposes no total and no score field, and returns `failed` plus `failedText`
// so a caller reports WHICH criterion failed rather than a meaningless fraction.
//
// THE PREMATURITY CRITERION SPELLS OUT ITS INEQUALITY, because published reproductions diverge: three give
// "32 weeks or more" and "45 weeks or more", two give "over 32" and "over 45". At-or-above is used, matching
// the guideline's rationale that risk attaches to birth BELOW 32 weeks and attenuates ONCE 45 weeks
// postconceptional age is reached. An infant born at exactly 32 weeks 0 days is where the renderings differ,
// so the label states the threshold in words rather than leaving it to a symbol.
//
// AND THE ASYMMETRY THE SUMMARY LEADS WITH: "lower-risk" is NOT "no risk" and NOT a discharge order, and
// "higher-risk" is NOT a diagnosis and NOT an admission order. "Lower-risk BRUE" is exactly the phrase an
// agent would otherwise turn into "safe to send home". Two of the seven criteria - concerning history and
// concerning examination - are clinical judgements this tool takes as GIVEN and cannot itself detect, and
// child abuse is among the causes an appropriate history and examination must consider.

import * as B from '../../lib/brue-v547.js';

export default [
  {
    id: 'brue',
    summary: `The American Academy of Pediatrics lower-risk criteria for a Brief Resolved Unexplained Event (Tieder and colleagues 2016). A BRUE is a sudden, brief, and NOW RESOLVED episode in an infant UNDER 1 YEAR of one or more of: ${B.BRUE_EVENT_FEATURES.join('; ')} - with NO explanation identified after an appropriate history and physical examination. IT IS A DIAGNOSIS OF EXCLUSION: if the history or examination explains the episode, whether reflux, a respiratory infection, a seizure, an airway anomaly or injury, then the diagnosis is that explanation and the lower-risk criteria DO NOT APPLY. Establish that first; this tool asks it as a gate and stops if the answer is no, returning lowerRisk as null rather than false, because an event that was never a BRUE has not been stratified and is not "higher-risk". SEVEN CRITERIA DEFINE A LOWER-RISK INFANT AND ALL SEVEN MUST BE MET: age over 60 days; gestational age 32 weeks or more AND postconceptional age 45 weeks or more; only one BRUE, with no prior BRUE ever and none occurring in clusters; duration under 1 minute; no CPR by a trained medical provider required; no concerning historical features; and no concerning physical examination findings. THE CRITERIA ARE CONJUNCTIVE AND THERE IS NO SCORE: failing any single one makes the infant higher-risk by definition, so do not count how many were met - the result returns which criteria failed, and reporting a fraction would be meaningless. The prematurity criterion is at-or-above rather than strictly-above, matching the guideline's rationale that risk attaches to birth below 32 weeks and attenuates once 45 weeks postconceptional age is reached; published reproductions diverge on that symbol, so an infant born at exactly 32 weeks 0 days is the case to be careful with. LOWER-RISK IS NOT NO RISK AND IS NOT A DISCHARGE ORDER: the classification identifies infants in whom extensive testing and admission are unlikely to help, so that they can be spared them, and shared decision-making with the family is part of the guideline rather than optional. HIGHER-RISK IS NOT A DIAGNOSIS AND NOT AN ADMISSION ORDER: it means the lower-risk pathway does not apply and the infant needs individualised assessment. This tool does not diagnose the cause of an event, does not recommend or exclude any investigation, and CANNOT DETECT the concerning historical or examination features that two of its criteria turn on - those are clinical judgements it takes as given. Child abuse is among the causes an appropriate history and examination must consider. It also addresses a different presenting complaint from the febrile-infant rules such as Rochester, which stratify a fever rather than an apneic or colour-change event in an afebrile, well-appearing infant.`,
    compute: B.brue,
    fields: [
      {
        dom: 'brue-qualifiesAsBrue', arg: 'qualifiesAsBrue', kind: 'enum', values: ['no', 'yes'], required: true,
        label: 'Does the event meet the BRUE definition - sudden, brief, now resolved, with a qualifying feature, and NO explanation identified after an appropriate history and physical examination? This is a gate: answer no and nothing further is scored, because BRUE is a diagnosis of exclusion.',
      },
      ...B.BRUE_LOWER_RISK_CRITERIA.map((c) => ({
        dom: `brue-${c.key}`, arg: c.key, kind: 'enum', values: ['no', 'yes'],
        label: `${c.text}${c.detail ? `. ${c.detail}` : ''} Required only when the event qualifies as a BRUE. All seven are conjunctive: failing this one alone makes the infant higher-risk.`,
      })),
    ],
  },
];
