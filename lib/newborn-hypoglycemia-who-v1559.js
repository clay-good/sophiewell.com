// spec-v1559 tool 4: low blood sugar in a newborn: WHO thresholds and what to do, for an at-risk newborn
// without symptoms or a sick young infant.
//
// Sources, read October 6, 2026 (facts restated):
//   - HYPO97: WHO. Hypoglycaemia of the newborn: review of the literature. WHO/CHD/97.1, 1997 (IRIS 10665/63362),
//     recommendations 14-15: for an at-risk newborn without abnormal signs, keep blood glucose at 2.6 mmol/L
//     (47 mg/dL) or more; below it, feed (breastfeed, or expressed breast milk or a substitute by cup or tube),
//     repeat the measurement preferably after 1 hour and certainly before the next feed 3 hours later, and if
//     still below 2.6 consider IV glucose (a supplementary feed if IV is not available); without a reliable
//     measurement, keep warm and breastfeed, supplementing at least every 3 hours if breastfeeding is not
//     possible.
//   - PB13: WHO. Pocket book of hospital care for children, 2nd ed., 2013, pp. 52-53: a young infant who is
//     drowsy, unconscious or convulsing with glucose under 2.2 mmol/L (40 mg/dL): 10% glucose 2 mL/kg IV, then
//     an infusion of 10% glucose 5 mL/kg per hour while oral feeds are built up; if glucose cannot be checked,
//     treat as hypoglycemia; without IV access, expressed breast milk or glucose by nasogastric tube.
//
// Stated rather than hidden: WHO has several thresholds (2.6 for at-risk newborns, 2.2 for sick young
// infants, 2.5 for children); each line names its population. HYPO97's item on symptomatic newborns was
// illegible in the scan and is not used.
//
// Pure: no DOM, no clock.

import { inputFault } from './num.js';

export const POP_OPTIONS = [
  { value: 'atrisk', text: 'At-risk newborn without symptoms' },
  { value: 'sick', text: 'Sick young infant: drowsy, unconscious or convulsing' },
];
export const UNIT_OPTIONS = [{ value: 'mmol', text: 'mmol/L', default: true }, { value: 'mgdl', text: 'mg/dL' }];

const NOTE = 'This follows WHO\'s 1997 newborn hypoglycemia review and the 2013 Pocket book of hospital care for children. Each threshold names its population.';
const r1 = (x) => Math.round(x * 10) / 10;

export function newbornHypoglycemiaWho(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const pop = POP_OPTIONS.find((x) => x.value === o.population);
  if (!pop) return { valid: false, message: 'Choose the population: an at-risk newborn without symptoms, or a sick young infant.' };
  let mmol = null;
  if (String(o.glucose ?? '').trim() !== '') {
    const mg = o.unit === 'mgdl';
    const f = mg ? inputFault([['the blood glucose', o.glucose, 1, 900, 'mg/dL']]) : inputFault([['the blood glucose', o.glucose, 0.1, 50, 'mmol/L']]);
    if (f) return { valid: false, message: f };
    mmol = mg ? Number(o.glucose) / 18 : Number(o.glucose);
  }
  const notes = [];
  const out = (band, label, abnormal) => ({ valid: true, band, bandLabel: label, abnormal, notes, note: NOTE });

  if (pop.value === 'sick') {
    let kg = null;
    if (String(o.weight ?? '').trim() !== '') { const f = inputFault([['the weight', o.weight, 0.4, 10, 'kg']]); if (f) return { valid: false, message: f }; kg = Number(o.weight); }
    const doses = kg !== null ? ` = ${r1(2 * kg)} mL, then ${r1(5 * kg)} mL an hour` : '';
    if (kg === null) notes.push('Weight: not entered, so the volumes are per kg only.');
    notes.push('Without IV access, give expressed breast milk or glucose by nasogastric tube.');
    if (mmol === null) return out(`Sick young infant, glucose not entered (cannot be measured): treat as hypoglycemia. 10% glucose 2 mL/kg IV, then 5 mL/kg per hour${doses}.`, 'Treat as hypoglycemia', true);
    if (mmol < 2.2) return out(`Sick young infant, glucose ${r1(mmol)} mmol/L (under 2.2): 10% glucose 2 mL/kg IV, then 5 mL/kg per hour while feeds are built up${doses}.`, 'Give IV glucose', true);
    return out(`Sick young infant, glucose ${r1(mmol)} mmol/L (2.2 or more): not hypoglycemic by WHO's 2.2 mmol/L threshold. Keep checking regularly.`, 'Not below 2.2', false);
  }
  if (mmol === null) {
    return out('At-risk newborn, glucose not entered (no reliable measurement): keep warm and breastfeed; if breastfeeding is not possible, give expressed breast milk or a substitute by cup or tube at least every 3 hours.', 'No measurement', false);
  }
  if (mmol < 2.6) {
    notes.push('If still below 2.6 mmol/L on the recheck, consider IV glucose; where IV is not available, give a supplementary feed by cup or tube. Keep breastfeeding.');
    return out(`At-risk newborn, glucose ${r1(mmol)} mmol/L (under 2.6): feed now, and recheck after about 1 hour and before the next feed 3 hours later.`, 'Feed and recheck', true);
  }
  return out(`At-risk newborn, glucose ${r1(mmol)} mmol/L (2.6 or more): at or above WHO's target. Keep feeding at least every 3 hours.`, 'At target', false);
}
