// spec-v1634 tool 26: preventability of an adverse drug reaction, modified Schumock and Thornton criteria.
//
// The original (Schumock GT, Thornton JP. Hosp Pharm. 1992;27:538) has not been read; it is not reprinted in any
// open copy found. What is built is the later modified, two-section form that ADR studies use, read on the owner's
// rule of October 17, 2026 (a verified reprint is a source) in four open papers that agree item for item:
//   PMC11162198 (2024 review, CC BY 4.0, Table 10), PMC6019808 (Iftikhar group 2018, Table 5), PMC11574781 (2024,
//   Supplementary 3) and PMC8415655 (2021, the nine points named in the methods). PMC6021047 (Iftikhar 2018)
//   gives the rule: section A has five questions and B four; any yes in A is definitely preventable; if A is all
//   no, any yes in B is probably preventable; otherwise not preventable. One further copy (PMC12633994, 2025)
//   moves an item from B to A and lists only three in B against its own text, and is not followed.
//   A: history of allergy or previous reaction to the drug; drug inappropriate for the clinical condition; dose,
//      route or frequency inappropriate for age, weight or disease state; toxic serum concentration (or lab
//      monitoring test) documented; a known treatment for the ADR.
//   B: required drug monitoring or other necessary lab test not done; a drug interaction involved; poor
//      adherence involved; preventive measures not prescribed or given.
// Questions are restated in this tool's words.
//
// Pure: no DOM, no clock, no network.

export const YES_NO = [{ value: 'yes', text: 'Yes' }, { value: 'no', text: 'No' }];
export const SECTION_A = [
  ['allergyHistory', 'a history of allergy or a previous reaction to the drug'],
  ['inappropriateDrug', 'the drug was inappropriate for the clinical condition'],
  ['inappropriateDose', 'the dose, route or frequency was inappropriate for age, weight or disease state'],
  ['toxicLevel', 'a toxic serum concentration or lab monitoring result was documented'],
  ['knownTreatment', 'there was a known treatment for the reaction'],
];
export const SECTION_B = [
  ['monitoringNotDone', 'required drug monitoring or another necessary lab test was not done'],
  ['interaction', 'a drug interaction was involved'],
  ['poorAdherence', 'poor adherence was involved'],
  ['preventionNotGiven', 'preventive measures were not prescribed or given'],
];
const NOTE = 'The modified Schumock and Thornton criteria as used in ADR studies, read in four open papers that agree. The 1992 original has a different, single-section form that was not read. A structured judgment for reviews and reporting, not a finding of fault.';

export function schumockThorntonPreventability(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const all = [...SECTION_A, ...SECTION_B];
  const missing = all.filter(([k]) => o[k] !== 'yes' && o[k] !== 'no').map(([, q]) => q);
  if (missing.length) return { valid: false, message: `Answer yes or no for each question; still unanswered: ${missing.length} of ${all.length}.` };
  const yesA = SECTION_A.filter(([k]) => o[k] === 'yes').map(([, q]) => q);
  const yesB = SECTION_B.filter(([k]) => o[k] === 'yes').map(([, q]) => q);
  const notes = [];
  let category; let section;
  if (yesA.length) { category = 'definitely preventable'; section = 'A'; notes.push(`Section A answered yes: ${yesA.join('; ')}.`); }
  else if (yesB.length) { category = 'probably preventable'; section = 'B'; notes.push(`Section A all no. Section B answered yes: ${yesB.join('; ')}.`); }
  else { category = 'not preventable'; section = 'C'; notes.push('Every question in sections A and B was answered no (section C).'); }
  if (section === 'A' && yesB.length) notes.push(`Section B also had a yes (${yesB.join('; ')}); the scale stops at the first section with one.`);
  return {
    valid: true, category, section,
    band: `Modified Schumock and Thornton: ${category} (section ${section}).`,
    bandLabel: category[0].toUpperCase() + category.slice(1), abnormal: section !== 'C', notes, note: NOTE,
  };
}
