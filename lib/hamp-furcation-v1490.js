// spec-v1490: the Hamp furcation degree, beside the Glickman furcation classes.
//
// Sources, read 2026-09-25:
//   Hamp SE, Nyman S, Lindhe J. Periodontal treatment of multirooted teeth: results after 5 years.
//     J Clin Periodontol. 1975;2(3):126-135 (the original).
//   Degrees as stated in Clin Exp Dent Res 2024 (PMC10838140): "Degree I: horizontal ... loss up to
//     3 mm. Degree II: horizontal ... loss exceeding 3 mm, but no 'through and through' destruction.
//     Degree III: horizontal 'through and through' destruction in the furcation."
//   Dentomaxillofac Radiol 2023 (PMC10461257) states degree I as "less than 3 mm", and adds that with
//     the 2017 classification "the presence of Class II or Class III furcation increases treatment
//     complexity and, thus, also the stage of periodontal disease."
//
// The two wordings disagree at exactly 3 mm; the answer says so rather than picking one.
// Pure: no DOM, no clock.

import { inputFault } from './num.js';

export const YES_NO = [{ value: 'yes', text: 'Yes' }, { value: 'no', text: 'No' }];

const NOTES = [
  'The degrees measure horizontal loss of support; the Glickman classes describe the same furcation by what is seen and probed.',
  'With the 2017 classification, a degree II or III furcation adds treatment complexity and so raises the periodontitis stage.',
];
const NOTE = 'Hamp SE et al, J Clin Periodontol 1975; degrees as stated in Clin Exp Dent Res 2024 and Dentomaxillofac Radiol 2023. It describes the furcation; treatment is a clinical decision.';
const out = (degree, label, band, abnormal) => ({ valid: true, degree, abnormal, band, bandLabel: label, notes: NOTES, note: NOTE });

export function hampFurcation(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const through = o.through === 'yes' || o.through === 'no' ? o.through : null;
  if (!through) return { valid: false, message: 'Choose whether the probe passes through the furcation from one side to the other.' };
  if (through === 'yes') {
    return out(3, 'Degree III', 'Hamp degree III: through-and-through destruction of the supporting tissue in the furcation.', true);
  }
  const fault = inputFault([['the horizontal probing depth into the furcation', o.horizontal, 0, 15, 'mm']]);
  if (fault) return { valid: false, message: fault };
  const h = Number(o.horizontal);
  if (h === 0) return out(0, 'No furcation involvement', 'No furcation involvement: the probe does not enter the furcation horizontally.', false);
  if (h < 3) return out(1, 'Degree I', `Hamp degree I: horizontal loss of support of ${h} mm, under 3 mm.`, true);
  if (h === 3) {
    return out(null, 'Degree I or II (3 mm boundary)', 'Degree I or II: exactly 3 mm of horizontal loss is degree I where the definition reads "up to 3 mm" and degree II where degree I is "less than 3 mm". The sources disagree at this point.', true);
  }
  return out(2, 'Degree II', `Hamp degree II: horizontal loss of support of ${h} mm, more than 3 mm, without through-and-through destruction.`, true);
}
