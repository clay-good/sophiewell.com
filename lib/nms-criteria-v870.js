// spec-v870: the international consensus diagnostic criteria for neuroleptic malignant syndrome.
//
// Source:
//   Gurrera RJ, Caroff SN, Cohen A, et al. An international consensus study of neuroleptic
//   malignant syndrome diagnostic criteria using the Delphi method.
//   J Clin Psychiatry. 2011;72(9):1222-1228.
//
//   Eight items carry Delphi-derived priority points summing to 100. A total of 74 or more
//   supports the diagnosis.
//
//     20  dopamine antagonist exposure, or dopamine agonist withdrawal, within 72 hours
//     18  hyperthermia above 100.4 F on at least two occasions
//     17  rigidity
//     13  mental status alteration
//     10  creatine kinase at least four times the upper limit of normal
//     10  sympathetic nervous system lability
//      7  negative work-up for infectious, toxic, metabolic and neurologic causes
//      5  hypermetabolism
//
// IT IS A DIAGNOSTIC-PRIORITY SCALE, NOT A SEVERITY SCALE, AND THAT IS WHY THIS TILE EXISTS.
// The points weigh how much each finding argues FOR the diagnosis. A higher total does not mean
// a sicker patient and does not grade anything.
//
// NEITHER FEVER NOR RIGIDITY IS REQUIRED. The threshold is reachable without hyperthermia (82 of
// the remaining points) and without rigidity (83), which matters because atypical antipsychotics
// are associated with presentations lacking one or both.
//
// THE NEGATIVE WORK-UP IS A SCORED ITEM, NOT A PRECONDITION. It contributes 7 points; it does
// not gate the total, and the diagnosis stays one of exclusion in practice.
//
// THE CREATINE KINASE ITEM IS FOUR TIMES THE UPPER LIMIT OF NORMAL, not any elevation.
//
// Pure: no DOM, no clock, no network.

export const NMS_NOTE = 'The international consensus diagnostic criteria for neuroleptic malignant syndrome (Gurrera and colleagues, Journal of Clinical Psychiatry, 2011) assign Delphi-derived priority points to eight findings, summing to 100: dopamine antagonist exposure or dopamine agonist withdrawal within 72 hours scores 20, hyperthermia 18, rigidity 17, mental status alteration 13, a creatine kinase at least four times the upper limit of normal 10, sympathetic nervous system lability 10, a negative work-up for other causes 7, and hypermetabolism 5. A total of 74 or more supports the diagnosis. Four things about the instrument are worth stating plainly. The points weigh how much each finding argues for the diagnosis, so this is a diagnostic-priority scale and not a severity scale, and a higher total does not mean a sicker patient. Neither fever nor rigidity is required, since the threshold is reachable without either one, which matters because presentations associated with atypical antipsychotics may lack one or both. The negative work-up is a scored item rather than a precondition, so it adds points without gating the total, and the diagnosis remains one of exclusion in practice. And the creatine kinase item asks for four times the upper limit of normal, not any elevation. It applies published criteria to findings already recorded. It does not diagnose the syndrome, and it does not decide whether to stop a drug or start treatment.';

export const NMS_ITEMS = [
  { key: 'exposure', points: 20, short: 'Exposure or withdrawal', text: 'Dopamine antagonist exposure, or dopamine agonist withdrawal, within the past 72 hours' },
  { key: 'hyperthermia', points: 18, short: 'Hyperthermia', text: 'Hyperthermia above 100.4 F on at least two occasions, measured orally' },
  { key: 'rigidity', points: 17, short: 'Rigidity', text: 'Rigidity' },
  { key: 'mentalStatus', points: 13, short: 'Mental status alteration', text: 'Mental status alteration: reduced or fluctuating level of consciousness' },
  { key: 'creatineKinase', points: 10, short: 'Creatine kinase', text: 'Creatine kinase at least four times the upper limit of normal' },
  { key: 'sympatheticLability', points: 10, short: 'Sympathetic lability', text: 'Sympathetic nervous system lability: at least two of a blood pressure rise of 25 percent or more above baseline, a swing of 20 mmHg diastolic or 25 mmHg systolic within 24 hours, diaphoresis, or urinary incontinence' },
  { key: 'negativeWorkup', points: 7, short: 'Negative work-up', text: 'Negative work-up for infectious, toxic, metabolic and neurologic causes' },
  { key: 'hypermetabolism', points: 5, short: 'Hypermetabolism', text: 'Hypermetabolism: a heart rate 25 percent or more above baseline together with a respiratory rate 50 percent or more above baseline' },
];

export const NMS_THRESHOLD = 74;
export const NMS_TOTAL_POINTS = 100;

function on(v) {
  return v === true || v === 'true' || v === 'yes' || v === 1 || v === '1';
}

export function nmsCriteria(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const present = NMS_ITEMS.filter((i) => on(o[i.key]));
  const total = present.reduce((sum, i) => sum + i.points, 0);
  const meets = total >= NMS_THRESHOLD;

  const action = meets
    ? `A priority total of ${total} of ${NMS_TOTAL_POINTS} reaches the consensus threshold of ${NMS_THRESHOLD} and supports the diagnosis.`
    : `A priority total of ${total} of ${NMS_TOTAL_POINTS} is below the consensus threshold of ${NMS_THRESHOLD}.`;

  const shortBy = meets ? 0 : NMS_THRESHOLD - total;
  const gapNote = meets ? null : `Short of the threshold by ${shortBy} point${shortBy === 1 ? '' : 's'}. A total below it does not exclude the syndrome; the criteria were built to make cases comparable, and a patient in front of you may be treated on suspicion regardless.`;

  // The reason the tile exists, on every result.
  const notSeverityNote = 'The points weigh how much each finding argues for the diagnosis. This is a diagnostic-priority scale, not a severity scale, and a higher total does not mean a sicker patient.';

  // Reachable without either of the two findings everyone expects.
  const withoutFever = NMS_TOTAL_POINTS - 18;
  const withoutRigidity = NMS_TOTAL_POINTS - 17;
  const featureNote = (!on(o.hyperthermia) || !on(o.rigidity))
    ? `Neither fever nor rigidity is required. The threshold of ${NMS_THRESHOLD} is reachable without hyperthermia, which leaves ${withoutFever} points, and without rigidity, which leaves ${withoutRigidity}. Presentations associated with atypical antipsychotics may lack one or both.`
    : null;

  const workupNote = on(o.negativeWorkup)
    ? 'The negative work-up is a scored item worth 7 points, not a precondition. It adds to the total without gating it, and the diagnosis remains one of exclusion in practice.'
    : 'The negative work-up for infectious, toxic, metabolic and neurologic causes is a scored item worth 7 points. It is not recorded here, and those causes are the ones this syndrome is most often confused with.';

  const ckNote = on(o.creatineKinase)
    ? 'The creatine kinase item asks for at least four times the upper limit of normal. Any lesser elevation does not score it.'
    : null;

  const exposureNote = on(o.exposure)
    ? null
    : 'Exposure is the single largest item at 20 points, and it is not recorded here. Dopamine agonist withdrawal counts as exposure, which is the branch most often missed.';

  const presentNote = present.length
    ? `Scored: ${present.map((i) => `${i.short} (${i.points})`).join('; ')}.`
    : 'None of the eight items was recorded.';

  const scopeNote = 'This applies published criteria to findings already recorded. It does not diagnose the syndrome, and it does not decide whether to stop a drug or start treatment.';

  return {
    valid: true,
    total,
    meets,
    shortBy,
    present: present.map((i) => i.text),
    action,
    presentNote,
    gapNote,
    notSeverityNote,
    featureNote,
    workupNote,
    ckNote,
    exposureNote,
    scopeNote,
    abnormal: meets,
    bandLabel: meets ? 'Meets the consensus threshold' : 'Below the consensus threshold',
    band: action,
    detail: `Eight items carry Delphi-derived priority points summing to ${NMS_TOTAL_POINTS}: exposure 20, hyperthermia 18, rigidity 17, mental status alteration 13, creatine kinase 10, sympathetic lability 10, a negative work-up 7, and hypermetabolism 5. A total of ${NMS_THRESHOLD} or more supports the diagnosis.`,
    note: NMS_NOTE,
  };
}
