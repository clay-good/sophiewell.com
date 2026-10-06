// spec-v1553 tool 2: can this child or adolescent (3 months to 16 years) with presumed drug-susceptible TB
// take the 4-month regimen (2HRZ(E)/2HR) instead of 6 months?
//
// Source: WHO. Operational handbook on tuberculosis, Module 5: management of TB in children and adolescents,
// 2022 (IRIS 10665/352523; CC BY-NC-SA 3.0 IGO, facts restated). Read October 6, 2026: Box 5.2 (p. 90),
// §5.2.4.1 and Box 5.3 (pp. 91-92), §5.2.4.2 (p. 92), §5.2.5 (pp. 93-94):
//   - A (CXR and bacteriology): CXR consistent with non-severe TB (intrathoracic nodes without significant
//     airway obstruction; one lobe, no cavities, no miliary pattern; uncomplicated effusion) AND Xpert
//     negative, trace, very low or low, or smear-negative AND mild symptoms.
//   - B (no CXR): that bacteriology result and mild symptoms, OR isolated peripheral lymph node TB and mild
//     symptoms. C (neither): isolated peripheral node TB, or a clinical diagnosis of pulmonary TB, with mild
//     symptoms.
//   - Mild symptoms: no danger or high-priority sign, no asymmetric persistent wheeze, no extrapulmonary TB
//     other than peripheral nodes, no SAM, respiratory distress, fever over 39 C, severe pallor,
//     restlessness, irritability or lethargy.
//   - Not eligible: SAM, under 3 months (or under 3 kg), TB treated in the past 2 years, severe acute
//     pneumonia; MDR/RR-TB is outside this regimen. Living with HIV: clinicians "may consider" 4 months.
//   - Ethambutol in the first 2 months: preferred for every child living with HIV; strongly recommended where
//     HIV (1% or more of pregnant women, or 5% or more of people with TB) or isoniazid resistance is high.
//   - Without a CXR: follow up monthly; continue to 6 months if there is no clinical response at 4.
//
// Stated rather than hidden: "3 months to 16 years" is read as up to the 17th birthday. Isolated peripheral
// lymph node TB qualifies in every setting (it is non-severe TB by the handbook's definition, and Boxes B and
// C name it). The mild-symptom components are asked as one question.
//
// Pure: no DOM, no clock.

import { inputFault } from './num.js';

export const SETTING_OPTIONS = [
  { value: 'full', text: 'Chest X-ray and bacteriology available' },
  { value: 'nocxr', text: 'Bacteriology, no chest X-ray' },
  { value: 'none', text: 'Neither chest X-ray nor bacteriology' },
];
export const CXR_OPTIONS = [
  { value: 'nodes', text: 'Intrathoracic lymph nodes, no significant airway obstruction' },
  { value: 'onelobe', text: 'One lobe, no cavities, no miliary pattern' },
  { value: 'effusion', text: 'Uncomplicated pleural effusion' },
  { value: 'other', text: 'Other (cavities, more than one lobe, miliary, complicated)' },
];
export const BACT_OPTIONS = [
  { value: 'neg', text: 'Xpert negative' },
  { value: 'trace', text: 'Xpert trace' },
  { value: 'verylow', text: 'Xpert very low' },
  { value: 'low', text: 'Xpert low' },
  { value: 'medium', text: 'Xpert medium' },
  { value: 'high', text: 'Xpert high' },
  { value: 'smearneg', text: 'Smear negative (no Xpert)' },
  { value: 'smearpos', text: 'Smear positive (no Xpert)' },
];
export const YES_NO = [{ value: 'no', text: 'No' }, { value: 'yes', text: 'Yes' }];

const ELIGIBLE_BACT = new Set(['neg', 'trace', 'verylow', 'low', 'smearneg']);
const NOTE = 'This follows WHO\'s 2022 handbook on TB in children and adolescents (Boxes 5.2 and 5.3). Your national program may differ.';
const has = (opts, v) => opts.some((x) => x.value === v);

export function tb4MonthEligibility(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const f = inputFault([['the age', o.age, 0, 25, 'years'], ['the weight', o.weight, 0.5, 150, 'kg']]);
  if (f) return { valid: false, message: f };
  const years = Number(o.age);
  const kg = Number(o.weight);
  const setting = SETTING_OPTIONS.find((x) => x.value === o.setting);
  if (!setting) return { valid: false, message: 'Choose the setting: chest X-ray and bacteriology, bacteriology only, or neither.' };
  for (const [k, q] of [['dr', 'whether drug-resistant TB is suspected or known'], ['prior', 'whether TB was treated in the past 2 years'], ['signs', 'whether any sign rules out mild symptoms'], ['pneumonia', 'whether there is severe acute pneumonia'], ['periph', 'whether this is isolated peripheral lymph node TB'], ['hiv', 'whether the child is living with HIV']]) {
    if (!has(YES_NO, o[k])) return { valid: false, message: `Choose ${q}.` };
  }

  const six = (why, extra = []) => ({ valid: true, band: `6 months (2HRZ(E)/4HR): ${why}`, bandLabel: '6 months', abnormal: true, notes: extra, note: NOTE });
  if (o.dr === 'yes') return { valid: true, band: 'Not this regimen: suspected or known drug-resistant TB is treated with a drug-resistant TB regimen guided by the source case\'s resistance pattern.', bandLabel: 'Drug-resistant TB', abnormal: true, notes: [], note: NOTE };
  if (years >= 17) return { valid: true, band: 'Outside the 4-month child regimen\'s range (3 months to 16 years). From 12 years and at least 40 kg, the 4-month 2HPMZ/2HPM regimen is an option for pulmonary TB.', bandLabel: 'Over 16 years', abnormal: false, notes: [], note: NOTE };
  if (years < 0.25 || kg < 3) return six('under 3 months or under 3 kg. Doses may need adjusting by a clinician experienced in pediatric TB.');
  if (o.prior === 'yes') return six('TB was treated in the past 2 years.');
  if (o.pneumonia === 'yes') return six('severe acute pneumonia.');
  if (o.signs === 'yes') return six('the symptoms are not mild (a danger or high-priority sign, asymmetric persistent wheeze, extrapulmonary TB beyond peripheral nodes, SAM, respiratory distress, fever over 39 °C, severe pallor, restlessness, irritability or lethargy).');

  const notes = [];
  let path;
  if (o.periph === 'yes') {
    path = 'isolated peripheral lymph node TB with mild symptoms';
  } else if (setting.value === 'none') {
    path = 'a clinical diagnosis of pulmonary TB with mild symptoms (Box 5.3 C)';
  } else {
    const bact = BACT_OPTIONS.find((x) => x.value === o.bact);
    if (!bact) return { valid: false, message: 'Choose the Xpert or smear result: the setting says bacteriology is available.' };
    if (!ELIGIBLE_BACT.has(bact.value)) return six(`the bacteriology is ${bact.text.replace(/^Smear/, 'smear')}; only negative, trace, very low or low Xpert results (or a negative smear) qualify.`);
    if (setting.value === 'full') {
      const cxr = CXR_OPTIONS.find((x) => x.value === o.cxr);
      if (!cxr) return { valid: false, message: 'Choose the chest X-ray pattern: the setting says an X-ray is available.' };
      if (cxr.value === 'other') return six('the chest X-ray is not consistent with non-severe TB.');
      path = `a chest X-ray consistent with non-severe TB, ${bact.text.replace(/^Smear/, 'smear')}, and mild symptoms (Box 5.3 A)`;
    } else {
      path = `${bact.text.replace(/^Smear/, 'smear')} and mild symptoms, without a chest X-ray (Box 5.3 B)`;
    }
  }

  if (o.cxr && setting.value !== 'full') notes.push('The chest X-ray pattern is not used: the setting says no X-ray.');
  const highPrev = o.highprev === 'yes';
  const eth = o.hiv === 'yes' || highPrev;
  notes.push(eth
    ? `Add ethambutol for the first 2 months (2HRZE/2HR): ${o.hiv === 'yes' ? 'preferred for every child living with HIV' : 'HIV or isoniazid resistance is common here'}.`
    : (o.highprev === 'no'
      ? 'No ethambutol needed (2HRZ/2HR) where HIV and isoniazid resistance are not common. Ethambutol is added where HIV prevalence is 1% or more among pregnant women (or 5% or more among people with TB) or isoniazid resistance is high.'
      : 'High-prevalence setting: not entered. Add ethambutol for the first 2 months where HIV prevalence is 1% or more among pregnant women (or 5% or more among people with TB) or isoniazid resistance is high.'));
  if (setting.value !== 'full' && o.periph !== 'yes') notes.push('Without a chest X-ray, review monthly: symptoms should resolve within a month. If there is no clinical response at 4 months, continue to 6 and look for drug-resistant TB, another disease or poor adherence.');
  if (o.hiv === 'yes') {
    notes.push('Monitor closely, especially at 4 months, and extend to 6 months if progress is insufficient.');
    return { valid: true, band: `4 months may be considered (2HRZE/2HR) for a child living with HIV, depending on the degree of immunosuppression, ART status and other opportunistic infections. Criteria met: ${path}.`, bandLabel: '4 months may be considered', abnormal: false, notes, note: NOTE };
  }
  return { valid: true, band: `4 months (${eth ? '2HRZE/2HR' : o.highprev === 'no' ? '2HRZ/2HR' : '2HRZ(E)/2HR'}): ${path}.`, bandLabel: '4 months', abnormal: false, notes, note: NOTE };
}
