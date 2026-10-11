// spec-v1634 tool 13: STOPPFall, the fall-risk-increasing drug classes.
//
// Source: Seppala LJ, Petrovic M, Ryg J, et al. STOPPFall (Screening Tool of Older Persons
// Prescriptions in older adults with high fall risk): a Delphi study by the EuGMS Task and Finish
// Group on Fall-Risk-Increasing Drugs. Age Ageing 2021;50(4):1189-1199 (PMC8244563), re-read in
// full text on October 11, 2026: "In total, 14 classes were included", named in the Results.
// The paper is CC BY-NC-ND. The class names are facts and are listed; its deprescribing guidance
// table is not reproduced (no derivatives). The paper defines no score and no cutoff, so the tool
// reports the classes present and their count and nothing more.
//
// Pure: no DOM, no clock, no network.

export const YES_NO = [{ value: 'yes', text: 'Yes' }, { value: 'no', text: 'No' }];
export const CLASSES = [
  { arg: 'benzodiazepines', dom: 'benzodiazepines', text: 'Benzodiazepines' },
  { arg: 'benzodiazepineRelated', dom: 'z-drugs', text: 'Benzodiazepine-related drugs' },
  { arg: 'antipsychotics', dom: 'antipsychotics', text: 'Antipsychotics' },
  { arg: 'antidepressants', dom: 'antidepressants', text: 'Antidepressants' },
  { arg: 'opioids', dom: 'opioids', text: 'Opioids' },
  { arg: 'antiepileptics', dom: 'antiepileptics', text: 'Antiepileptics' },
  { arg: 'anticholinergics', dom: 'anticholinergics', text: 'Anticholinergics' },
  { arg: 'diuretics', dom: 'diuretics', text: 'Diuretics' },
  { arg: 'alphaBlockersHypertension', dom: 'alpha-bp', text: 'Alpha-blockers used as antihypertensives' },
  { arg: 'alphaBlockersProstate', dom: 'alpha-bph', text: 'Alpha-blockers for prostate hyperplasia' },
  { arg: 'centralAntihypertensives', dom: 'central-bp', text: 'Centrally-acting antihypertensives' },
  { arg: 'antihistamines', dom: 'antihistamines', text: 'Antihistamines' },
  { arg: 'vasodilators', dom: 'vasodilators', text: 'Vasodilators used in cardiac diseases' },
  { arg: 'bladderDrugs', dom: 'bladder', text: 'Medications for overactive bladder and urge incontinence' },
];
const NOTE = 'A list for a medication review in an older adult at high risk of falls, agreed by an expert panel. It gives no score and no cutoff, and a drug class being present does not mean it should be stopped: the paper pairs the list with deprescribing guidance that is not reproduced here. An empty list does not mean no drug is contributing.';

export function stoppfallCheck(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const present = [];
  for (const c of CLASSES) {
    const a = String(o[c.arg] ?? '').trim();
    if (a !== 'yes' && a !== 'no') return { valid: false, message: `Choose yes or no: ${c.text.replace(/^./, (x) => x.toLowerCase())}. All 14 classes are needed; an unanswered class is not counted as absent.` };
    if (a === 'yes') present.push(c.text);
  }
  const n = present.length;
  return {
    valid: true, flag: n ? 'classes-present' : 'none-present', abnormal: n > 0, count: n, classes: present,
    band: n ? `${n} of the 14 STOPPFall drug classes ${n === 1 ? 'is' : 'are'} present.` : 'None of the 14 STOPPFall drug classes is present.',
    bandLabel: `${n} of 14 classes`,
    notes: [...(n ? [`Present: ${present.join('; ')}.`] : []),
      'Within some classes the panel agreed that risk differs: for example strong opioids more than weak ones, tricyclic antidepressants more than others, loop diuretics more than other diuretics, and first-generation antihistamines more than second-generation ones.',
      'Seppala LJ, et al. Age Ageing 2021;50:1189-1199.'], note: NOTE,
  };
}
