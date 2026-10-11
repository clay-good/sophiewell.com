// spec-v1634 tool 4: NCC MERP Index for Categorizing Medication Errors (categories A to I).
//
// Sources, both downloaded from https://www.nccmerp.org/types-medication-errors and re-read on
// October 11, 2026: the NCC MERP Index (copyright 2022) and the NCC MERP Index for Categorizing
// Medication Errors Algorithm (copyright 2001).
//
// Licensing: both pages carry "Permission is hereby granted to reproduce information contained
// herein provided that such reproduction shall not modify the text and shall include the copyright
// notice appearing on the pages from which it was copied." So the category and term definitions
// below are the Index's own words, unmodified, and the result carries the notice. Do not paraphrase
// them: here a paraphrase is the violation.
//
// The algorithm, as drawn:
//   actual error? no -> A.  reached the patient? no -> B.  contributed to or resulted in death? yes -> I.
//   harmed? no -> intervention to preclude harm or extra monitoring required? no -> C, yes -> D.
//   harmed? yes -> intervention necessary to sustain life? yes -> harm permanent? yes -> G, no -> H.
//                  no -> harm temporary? no -> G; yes -> initial or prolonged hospitalization?
//                  yes -> F, no -> E.
//
// Pure: no DOM, no clock, no network.

export const YES_NO = [{ value: 'yes', text: 'Yes' }, { value: 'no', text: 'No' }];
export const QUESTIONS = [
  { arg: 'error', dom: 'error', text: 'Did an actual error occur?' },
  { arg: 'reached', dom: 'reached', text: 'Did the error reach the patient? (An error of omission does reach the patient.)' },
  { arg: 'death', dom: 'death', text: 'Did the error contribute to or result in patient death?' },
  { arg: 'harmed', dom: 'harmed', text: 'Was the patient harmed?' },
  { arg: 'monitoring', dom: 'monitoring', text: 'Was intervention to preclude harm or extra monitoring required? (if not harmed)' },
  { arg: 'lifeSustaining', dom: 'life-sustaining', text: 'Did the error require an intervention necessary to sustain life? (if harmed)' },
  { arg: 'permanent', dom: 'permanent', text: 'Was the harm permanent? (if life-sustaining intervention was needed)' },
  { arg: 'temporary', dom: 'temporary', text: 'Was the harm temporary? (if no life-sustaining intervention was needed)' },
  { arg: 'hospitalization', dom: 'hospitalization', text: 'Did the error require initial or prolonged hospitalization? (if the harm was temporary)' },
];
// The Index's own words (2022), unmodified.
export const CATEGORIES = {
  A: { group: 'No Error', text: 'Circumstances or events that have the capacity to cause error' },
  B: { group: 'Error, No Harm', text: 'An error occurred but the error did not reach the patient (An "error of omission" does reach the patient)' },
  C: { group: 'Error, No Harm', text: 'An error occurred that reached the patient but did not cause patient harm' },
  D: { group: 'Error, No Harm', text: 'An error occurred that reached the patient and required monitoring to confirm that it resulted in no harm to the patient and/or required intervention to preclude harm' },
  E: { group: 'Error, Harm', text: 'An error occurred that may have contributed to or resulted in temporary harm to the patient and required intervention' },
  F: { group: 'Error, Harm', text: 'An error occurred that may have contributed to or resulted in temporary harm to the patient and required initial or prolonged hospitalization' },
  G: { group: 'Error, Harm', text: 'An error occurred that may have contributed to or resulted in permanent patient harm' },
  H: { group: 'Error, Harm', text: 'An error occurred that required intervention necessary to sustain life' },
  I: { group: 'Error, Death', text: 'An error occurred that may have contributed to or resulted in the patient’s death' },
};
export const DEFINITIONS = [
  'Harm: Impairment of the physical, emotional, or psychological function or structure of the body and/or pain resulting therefrom.',
  'Monitoring: To observe or record relevant physiological or psychological signs.',
  'Intervention: May include change in therapy or active medical/surgical treatment.',
  'Intervention Necessary to Sustain Life: Includes cardiovascular and respiratory support (e.g., CPR, defibrillation, intubation, etc.)',
];
export const NOTICE = '© 2022 National Coordinating Council for Medication Error Reporting and Prevention. All Rights Reserved. Algorithm © 2001 National Coordinating Council for Medication Error Reporting and Prevention. All Rights Reserved. Reproduced unmodified with permission granted on the Index.';
const Q = Object.fromEntries(QUESTIONS.map((q) => [q.arg, q.text]));

export function nccMerpIndex(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const path = [];
  // Returns true or false, or throws the question that is still unanswered.
  const ask = (arg) => {
    const v = String(o[arg] ?? '').trim();
    if (v !== 'yes' && v !== 'no') { const e = new Error(arg); e.ask = true; throw e; }
    path.push(`${Q[arg].replace(/ \(if [^)]*\)$/, '')} ${v === 'yes' ? 'Yes' : 'No'}.`);
    return v === 'yes';
  };
  let cat;
  try {
    if (!ask('error')) cat = 'A';
    else if (!ask('reached')) cat = 'B';
    else if (ask('death')) cat = 'I';
    else if (!ask('harmed')) cat = ask('monitoring') ? 'D' : 'C';
    else if (ask('lifeSustaining')) cat = ask('permanent') ? 'G' : 'H';
    else if (!ask('temporary')) cat = 'G';
    else cat = ask('hospitalization') ? 'F' : 'E';
  } catch (e) {
    if (!e.ask) throw e;
    return { valid: false, message: `Choose an answer: ${Q[e.message]}` };
  }
  const c = CATEGORIES[cat];
  return {
    valid: true, flag: `category-${cat.toLowerCase()}`, category: cat, group: c.group,
    abnormal: c.group === 'Error, Harm' || c.group === 'Error, Death',
    // No full stop is added: the Index prints none, and its text is not to be modified.
    band: `Category ${cat}: ${c.text}`,
    bandLabel: `Category ${cat} (${c.group})`,
    notes: [`Path: ${path.join(' ')}`, ...DEFINITIONS, NOTICE], note: 'The category follows from the answers given; the tool does not judge whether harm occurred or what caused it. Answers to questions the path did not reach are ignored.',
  };
}
