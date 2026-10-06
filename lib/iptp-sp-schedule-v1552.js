// spec-v1552 tool 3: is an IPTp-SP dose due today (intermittent preventive treatment of malaria in pregnancy)?
//
// Source: WHO guidelines for malaria, 10 September 2026 (doi:10.2471/B09879; CC BY-NC-SA 3.0 IGO, facts
// restated, nothing reproduced), section 4.2.1, pp. 102-104 and 108, read October 6, 2026: for pregnant women of
// all gravidities in endemic areas; start as early as possible in the second trimester and not before week 13;
// a dose at each scheduled antenatal contact until delivery, at least one month apart, aiming for at least
// three doses; 3 tablets of 500/25 mg (1,500/75 mg), directly observed. Not given before week 13, in severe
// acute illness, when oral medicine cannot be taken, after an SP-component drug in the last 30 days, with an
// SP allergy, or with any sulfa medicine including cotrimoxazole. Folic acid 5 mg a day or more counteracts SP;
// 0.4 mg does not. New in 2026: dihydroartemisinin-piperaquine IPTp for women living with HIV is not
// recommended (conditional, against), so a woman on cotrimoxazole has no IPTp option in this guideline.
//
// Stated rather than hidden: the guideline says both "one month" (between doses) and "30 days" (a recent
// SP-component drug); the tile spaces doses 4 weeks apart and says so.
//
// Pure: no DOM, no clock.

import { inputFault } from './num.js';

export const CONTRA_OPTIONS = [
  { value: 'none', text: 'None' },
  { value: 'ctx', text: 'Takes cotrimoxazole or another sulfa medicine' },
  { value: 'allergy', text: 'Allergic to SP' },
  { value: 'ill', text: 'Severely ill, or cannot take oral medicine' },
  { value: 'recent', text: 'An SP-component drug in the last 30 days' },
];
export const PREVIOUS_OPTIONS = [{ value: 'none', text: 'No previous IPTp dose' }, { value: 'yes', text: 'Had a previous dose' }];
export const FOLIC_OPTIONS = [{ value: 'low', text: '0.4 mg a day' }, { value: 'high', text: '5 mg a day or more' }, { value: 'none', text: 'None' }];

const NOTE = 'This follows the WHO guidelines for malaria of 10 September 2026. Your national protocol may differ; follow it.';
const DOSE = '3 tablets of sulfadoxine-pyrimethamine 500/25 mg (1,500/75 mg), swallowed in front of the health worker';

export function iptpSpSchedule(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const f = inputFault([['the gestational age', o.weeks, 4, 44, 'weeks']]);
  if (f) return { valid: false, message: f };
  const contra = CONTRA_OPTIONS.find((x) => x.value === o.contra);
  if (!contra) return { valid: false, message: 'Choose whether any contraindication applies (cotrimoxazole or another sulfa drug, SP allergy, severe illness, or a recent SP-component drug).' };
  const prev = PREVIOUS_OPTIONS.find((x) => x.value === o.previous);
  if (!prev) return { valid: false, message: 'Choose whether she has had an IPTp dose before.' };
  const days = o.days === undefined || o.days === null || String(o.days).trim() === '' ? 0 : Number(o.days);
  if (!Number.isInteger(days) || days < 0 || days > 6) return { valid: false, message: 'Enter the extra days as a whole number from 0 to 6.' };
  const ga = Number(o.weeks) + days / 7;
  const notes = [];
  if (o.folic === 'high') notes.push('Folic acid at 5 mg a day or more counteracts SP: switch her to the 0.4 mg formulation.');

  if (contra.value !== 'none') {
    const why = { ctx: 'she takes cotrimoxazole or another sulfa medicine', allergy: 'she is allergic to SP', ill: 'she is severely ill or cannot take oral medicine', recent: 'she had an SP-component drug in the last 30 days' }[contra.value];
    if (contra.value === 'ctx') notes.push('Since 2026, WHO does not recommend dihydroartemisinin-piperaquine as IPTp for women living with HIV, so this guideline offers her no IPTp alternative.');
    return { valid: true, band: `Do not give IPTp-SP: ${why}.`, bandLabel: 'Not to be given', abnormal: true, notes, note: NOTE };
  }
  if (ga < 13) {
    const wait = Math.ceil((13 - ga) * 7);
    return { valid: true, band: `Not yet: IPTp-SP starts no earlier than week 13 (in ${wait} day${wait === 1 ? '' : 's'}), as early as possible in the second trimester.`, bandLabel: 'Not yet', abnormal: false, notes, note: NOTE };
  }
  if (prev.value === 'yes') {
    const fw = inputFault([['the weeks since the last dose', o.since, 0, 40, 'weeks']]);
    if (fw) return { valid: false, message: fw };
    const since = Number(o.since);
    if (since < 4) {
      const wait = Math.ceil((4 - since) * 7);
      notes.push('Doses are at least one month apart; the tile uses 4 weeks.');
      return { valid: true, band: `Not yet: the last dose was ${since} weeks ago. The next is due in ${wait} day${wait === 1 ? '' : 's'}, at the next antenatal contact after that.`, bandLabel: 'Not yet', abnormal: false, notes, note: NOTE };
    }
  }
  notes.push('Give a dose at each scheduled antenatal contact until delivery, at least one month apart, aiming for at least three doses in the pregnancy.');
  return { valid: true, band: `Due today: ${DOSE}.`, bandLabel: 'Due today', abnormal: false, notes, note: NOTE };
}
