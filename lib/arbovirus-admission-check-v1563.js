// spec-v1563 tool 6: dengue, chikungunya, Zika or yellow fever: signs that might encourage hospitalization,
// and the drug rules (WHO 2025).
//
// Source: WHO guidelines for clinical management of arboviral diseases: dengue, chikungunya, Zika and
// yellow fever, July 3, 2025 (IRIS 10665/381804; CC BY-NC-SA 3.0 IGO, facts restated). Read October 6, 2026:
//   - Section 2.7 (pp. 13-14), from PAHO 2022, criteria that "might encourage clinicians to hospitalize"
//     a dengue patient: warning signs (abdominal pain progressive to continuous or intense; irritability,
//     drowsiness or lethargy; mucosal bleeding; liver more than 2 cm below the costal margin; persistent
//     vomiting, 3 in 1 hour or 4 in 6 hours; hematocrit rising on at least 2 consecutive measurements);
//     severe dengue (WHO 2009); oral intolerance; difficulty breathing; narrowing pulse pressure;
//     hypotension; acute kidney failure; prolonged capillary refill; pregnancy; coagulopathy. Some settings
//     also admit extremes of age and high-risk conditions. For chikungunya, Zika and yellow fever,
//     hospitalization is an individual assessment.
//   - Recommendations (pp. 1-2): against NSAIDs (strong); acetaminophen or metamizole for pain or fever
//     (conditional); against corticosteroids (conditional). Table 4-2 (p. 30): acetaminophen over 50 kg
//     500 mg-1 g every 4-6 hours (maximum 4 g a day); children 10-15 mg/kg every 4-6 hours (maximum 60
//     mg/kg a day); never more often than every 4 hours.
//
// Stated rather than hidden: the output says "might encourage hospitalization", WHO's wording, not "admit".
// A sign left blank is not assessed; "none present" is said only when every listed sign was answered.
//
// Pure: no DOM, no clock.

import { inputFault } from './num.js';

export const DISEASE_OPTIONS = [
  { value: 'dengue', text: 'Dengue' },
  { value: 'chik', text: 'Chikungunya' },
  { value: 'zika', text: 'Zika' },
  { value: 'yf', text: 'Yellow fever' },
];
export const YES_NO = [{ value: 'no', text: 'No' }, { value: 'yes', text: 'Yes' }];

export const SIGNS = [
  ['abdo', 'abdominal pain, continuous or intense'],
  ['sensory', 'irritability, drowsiness or lethargy'],
  ['mucosal', 'mucosal bleeding'],
  ['liver', 'liver more than 2 cm below the ribs'],
  ['vomit', 'persistent vomiting (3 in 1 hour or 4 in 6 hours)'],
  ['hct', 'hematocrit rising on 2 measurements in a row'],
  ['severe', 'severe dengue (WHO 2009 criteria)'],
  ['oral', 'unable to tolerate oral fluids'],
  ['breath', 'difficulty breathing'],
  ['pulse', 'narrowing pulse pressure'],
  ['hypo', 'low blood pressure'],
  ['renal', 'acute kidney failure'],
  ['crt', 'prolonged capillary refill'],
  ['preg', 'pregnancy'],
  ['coag', 'coagulopathy'],
];
const WARNING = new Set(['abdo', 'sensory', 'mucosal', 'liver', 'vomit', 'hct']);
const NOTE = 'This follows WHO\'s 2025 arboviral disease guidelines. WHO lists signs that "might encourage" hospitalization; the decision is the clinician\'s.';
const join = (a) => (a.length < 2 ? a.join('') : `${a.slice(0, -1).join(', ')} and ${a[a.length - 1]}`);

export function arbovirusAdmissionCheck(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const d = DISEASE_OPTIONS.find((x) => x.value === o.disease);
  if (!d) return { valid: false, message: 'Choose the disease: dengue, chikungunya, Zika or yellow fever.' };
  let kg = null;
  if (String(o.weight ?? '').trim() !== '') {
    const fw = inputFault([['the weight', o.weight, 1, 250, 'kg']]);
    if (fw) return { valid: false, message: fw };
    kg = Number(o.weight);
  }
  const notes = [];
  notes.push('No NSAIDs (ibuprofen, aspirin, diclofenac and the like), whatever the severity. No corticosteroids.');
  if (kg === null) notes.push('Acetaminophen: over 50 kg, 500 mg to 1 g every 4-6 hours (maximum 4 g a day); children 10-15 mg/kg every 4-6 hours (maximum 60 mg/kg a day). Weight: not entered, so no child dose is computed.');
  else if (kg > 50) notes.push('Acetaminophen 500 mg to 1 g every 4-6 hours, at most 4 g a day; never more often than every 4 hours.');
  else notes.push(`Acetaminophen ${Math.round(10 * kg)}-${Math.round(15 * kg)} mg every 4-6 hours (10-15 mg/kg), at most ${Math.round(60 * kg).toLocaleString('en-US')} mg a day (60 mg/kg); never more often than every 4 hours.`);
  notes.push('Metamizole is an alternative for pain or fever.');
  const out = (band, label, abnormal) => ({ valid: true, band, bandLabel: label, abnormal, notes, note: NOTE });

  if (d.value !== 'dengue') {
    return out(`${d.text}: WHO leaves hospitalization to the clinician's individual assessment; its list of signs is for dengue.`, 'Individual assessment', false);
  }
  const yes = SIGNS.filter(([k]) => o[k] === 'yes');
  const open = SIGNS.filter(([k]) => o[k] !== 'yes' && o[k] !== 'no');
  if (o.risk === 'yes') notes.push('Some settings also admit people at the extremes of age (older adults, neonates) or with high-risk conditions.');
  if (yes.length) {
    const warn = yes.filter(([k]) => WARNING.has(k)).length;
    if (warn) notes.push('Warning signs present: plan IV fluids by the dengue fluid ladder if oral fluids fail.');
    return out(`Signs that might encourage hospitalization are present: ${join(yes.map(([, t]) => t))}.`, 'Signs present', true);
  }
  if (open.length) return out(`None present so far, but not assessed: ${join(open.map(([, t]) => t))}.`, 'Not fully assessed', false);
  notes.push('WHO treats dengue without these features as non-severe, managed as an outpatient; warning signs often appear around days 4-5, at defervescence.');
  return out('None of WHO\'s listed signs is present.', 'No listed signs', false);
}
