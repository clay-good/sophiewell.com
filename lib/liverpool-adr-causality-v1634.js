// spec-v1634 tool 1: Liverpool adverse drug reaction causality assessment tool.
//
// Source: Gallagher RM, Kirkham JJ, Mason JR, et al. Development and inter-rater reliability of the
// Liverpool adverse drug reaction causality assessment tool. PLoS One 2011;6(12):e28096
// (doi 10.1371/journal.pone.0028096), Figure 2, re-read from the published figure on October 11,
// 2026. Open access under a Creative Commons Attribution license; the question wording is the
// figure's, used with attribution.
//
// The flowchart:
//   1 suspect an ADR? no -> Unlikely.
//   2 event appeared after the drug was given or the dose increased? no -> 2b pre-existing symptoms
//     exacerbated by the drug? no -> Unlikely.  (2 yes or 2b yes -> 3)
//   3 improved (with or without treatment) when the drug was stopped or the dose reduced?
//     yes or unassessable -> 5;  no -> 4 long-lasting disability or impairment? no -> Possible; yes -> 5.
//   5 probability that the event was due to an underlying disease?
//     low -> 6 positive rechallenge? yes -> Definite; no -> 8.
//     high or unsure -> 7 objective evidence supportive of the causal mechanism? no -> Possible; yes -> 8.
//   8 past history of the same event with this drug in this patient? yes -> Definite;
//     no -> 9 event previously reported with this drug? yes -> Probable; no -> Possible.
//
// Pure: no DOM, no clock, no network.

export const YES_NO = [{ value: 'yes', text: 'Yes' }, { value: 'no', text: 'No' }];
export const YES_NO_UNASSESSABLE = [...YES_NO, { value: 'unassessable', text: 'Unassessable' }];
export const DISEASE = [{ value: 'low', text: 'Low' }, { value: 'high-or-unsure', text: 'High or unsure' }];
export const QUESTIONS = [
  { arg: 'suspected', dom: 'suspected', options: YES_NO, text: 'Do you suspect an adverse drug reaction?' },
  { arg: 'afterDrug', dom: 'after-drug', options: YES_NO, text: 'Did the event appear after the drug was administered or dose increased?' },
  { arg: 'exacerbated', dom: 'exacerbated', options: YES_NO, text: 'Were pre-existing symptoms exacerbated by the drug? (if it did not appear after the drug)' },
  { arg: 'improved', dom: 'improved', options: YES_NO_UNASSESSABLE, text: 'Did the event improve (with or without treatment) when the drug was stopped or dose reduced?' },
  { arg: 'disability', dom: 'disability', options: YES_NO, text: 'Was the event associated with long-lasting disability or impairment? (if it did not improve)' },
  { arg: 'underlyingDisease', dom: 'underlying-disease', options: DISEASE, text: 'What is the probability that the event was due to an underlying disease?' },
  { arg: 'rechallenge', dom: 'rechallenge', options: YES_NO, text: 'Was there a positive rechallenge? (if low)' },
  { arg: 'objectiveEvidence', dom: 'objective-evidence', options: YES_NO, text: 'Is there any objective evidence supportive of the causal ADR mechanism? (if high or unsure)' },
  { arg: 'pastHistory', dom: 'past-history', options: YES_NO, text: 'Is there a past history of the same event with this drug in this patient?' },
  { arg: 'reportedBefore', dom: 'reported-before', options: YES_NO, text: 'Has the event previously been reported with this drug?' },
];
const BY = Object.fromEntries(QUESTIONS.map((q) => [q.arg, q]));
const FOOTNOTES = [
  'Unassessable refers to situations where the medicine is administered on one occasion (for example a vaccine), the patient receives intermittent therapy (for example chemotherapy), or is on medication which cannot be stopped (for example immunosuppressants).',
  'Examples of objective evidence: positive laboratory investigations of the causal ADR mechanism (not those merely confirming the adverse reaction), supra-therapeutic drug levels, good evidence of a dose-dependent relationship with toxicity in the patient.',
];
const NOTE = 'The category follows from the answers given. It is one structured assessment of causality, not proof that the drug did or did not cause the event; the paper reports how far raters agreed, not how often the category is right. Answers to questions the path did not reach are ignored.';

export function liverpoolAdrCausality(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const path = [];
  const ask = (arg) => {
    const q = BY[arg]; const v = String(o[arg] ?? '').trim();
    const opt = q.options.find((x) => x.value === v);
    if (!opt) { const e = new Error(arg); e.ask = true; throw e; }
    path.push(`${q.text.replace(/ \(if [^)]*\)$/, '')} ${opt.text}.`);
    return v;
  };
  let category;
  try {
    const later = () => {
      if (ask('pastHistory') === 'yes') return 'Definite';
      return ask('reportedBefore') === 'yes' ? 'Probable' : 'Possible';
    };
    const fromDisease = () => {
      if (ask('underlyingDisease') === 'low') return ask('rechallenge') === 'yes' ? 'Definite' : later();
      return ask('objectiveEvidence') === 'no' ? 'Possible' : later();
    };
    if (ask('suspected') === 'no') category = 'Unlikely';
    else if (ask('afterDrug') === 'no' && ask('exacerbated') === 'no') category = 'Unlikely';
    else if (ask('improved') === 'no' && ask('disability') === 'no') category = 'Possible';
    else category = fromDisease();
  } catch (e) {
    if (!e.ask) throw e;
    return { valid: false, message: `Choose an answer: ${BY[e.message].text}` };
  }
  return {
    valid: true, flag: category.toLowerCase(), category, abnormal: category === 'Definite' || category === 'Probable',
    band: `Liverpool causality category: ${category}.`, bandLabel: category,
    notes: [`Path: ${path.join(' ')}`, ...FOOTNOTES, 'Gallagher RM, et al. PLoS One 2011;6(12):e28096, Figure 2 (CC BY).'], note: NOTE,
  };
}
