// spec-v1554 tool 3: cotrimoxazole prophylaxis in HIV: who gets it (WHO 2021) and the once-daily dose by weight
// (WHO 2026).
//
// Sources, read October 6, 2026 (CC BY-NC-SA 3.0 IGO; facts restated, nothing reproduced):
//   - WHO. Consolidated guidelines on HIV prevention, testing, treatment, service delivery and monitoring, 2021
//     (IRIS 10665/342899), section 6.3: adults (including pregnant women) at WHO stage 3 or 4 and/or CD4 350 or
//     less; where malaria or severe bacterial infections are highly prevalent, regardless of CD4 or stage; anyone
//     with active TB regardless of CD4; may stop in adults stable on ART with immune recovery and suppression
//     where prevalence is low. Children and adolescents with HIV: all, with priority under 5 years, stage 3-4 or
//     CD4 350 or less; continue to adulthood where prevalence is high; may stop from 5 years in low-prevalence
//     settings if stable or suppressed for 6 months with CD4 over 350. HIV-exposed infants: from 4-6 weeks until
//     HIV is excluded after breastfeeding has fully stopped.
//   - WHO optimal antiretroviral dosing guidance, 6 May 2026 (IRIS 10665/385571, doi:10.2471/B09711), Table 6:
//     once daily, 3 to under 6 kg suspension 2.5 mL or 1 dispersible 100/20 mg; 6 to under 10 kg 5 mL, 2 dispersible
//     or half a 400/80; 10 to under 15 kg the same; 15 to under 20 kg 10 mL, 4 dispersible, one 400/80 or half an
//     800/160; 20 to under 25 kg the same; 25 to under 35 kg two 400/80 or one 800/160.
//
// Stated rather than hidden: the adult dose (800/160 mg once daily) is read from the 25-35 kg column, which the
// table carries into adult tablets; under 3 kg is below the table.
//
// Pure: no DOM, no clock.

import { inputFault } from './num.js';

export const GROUP_OPTIONS = [
  { value: 'exposed', text: 'HIV-exposed infant' },
  { value: 'child', text: 'Child or adolescent living with HIV' },
  { value: 'adult', text: 'Adult living with HIV (including pregnant women)' },
];
export const YES_NO = [{ value: 'no', text: 'No' }, { value: 'yes', text: 'Yes' }];

const BANDS = [
  [3, '2.5 mL of suspension (200/40 mg per 5 mL) or 1 dispersible 100/20 mg tablet'],
  [6, '5 mL of suspension, 2 dispersible 100/20 mg tablets, or half a scored 400/80 mg tablet'],
  [10, '5 mL of suspension, 2 dispersible 100/20 mg tablets, or half a scored 400/80 mg tablet'],
  [15, '10 mL of suspension, 4 dispersible 100/20 mg tablets, one 400/80 mg tablet, or half an 800/160 mg tablet'],
  [20, '10 mL of suspension, 4 dispersible 100/20 mg tablets, one 400/80 mg tablet, or half an 800/160 mg tablet'],
  [25, 'two 400/80 mg tablets or one 800/160 mg tablet'],
];
const BAND_TEXT = ['3 to under 6 kg', '6 to under 10 kg', '10 to under 15 kg', '15 to under 20 kg', '20 to under 25 kg', '25 to under 35 kg'];
const NOTE = 'This follows WHO\'s 2021 HIV guidelines (section 6.3) and the May 2026 dosing guidance (Table 6). Your national protocol may differ; follow it.';

function dose(w) {
  if (w < 3) return null;
  if (w >= 35) return { text: '800/160 mg once a day (the adult dose)', band: '35 kg or more' };
  const i = BANDS.map((b) => b[0]).filter((lo) => w >= lo).length - 1;
  return { text: `${BANDS[i][1]}, once a day`, band: BAND_TEXT[i] };
}

export function whoCotrimoxazole(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const g = GROUP_OPTIONS.find((x) => x.value === o.group);
  if (!g) return { valid: false, message: 'Choose who this is for: an HIV-exposed infant, a child or adolescent with HIV, or an adult with HIV.' };
  const notes = [];

  if (g.value === 'adult') {
    if (!YES_NO.some((x) => x.value === o.highPrevalence)) return { valid: false, message: 'Choose whether malaria or severe bacterial infections are highly prevalent here: then everyone with HIV gets it.' };
    if (!YES_NO.some((x) => x.value === o.tb)) return { valid: false, message: 'Choose whether the person has active TB: then it is given regardless of CD4.' };
    if (!YES_NO.some((x) => x.value === o.advanced)) return { valid: false, message: 'Choose whether the person is at WHO clinical stage 3 or 4.' };
    let cd4 = null;
    if (!(o.cd4 === undefined || o.cd4 === null || String(o.cd4).trim() === '')) {
      const f = inputFault([['the CD4 count', o.cd4, 0, 3000, 'cells/mm³']]);
      if (f) return { valid: false, message: f };
      cd4 = Number(o.cd4);
    }
    const why = [];
    if (o.highPrevalence === 'yes') why.push('high malaria or bacterial-infection setting');
    if (o.tb === 'yes') why.push('active TB');
    if (o.advanced === 'yes') why.push('WHO stage 3 or 4');
    if (cd4 !== null && cd4 <= 350) why.push(`CD4 ${cd4} (350 or less)`);
    if (!why.length && cd4 === null) return { valid: false, message: 'Enter the CD4 count: with stage 1-2, no TB and a low-prevalence setting, CD4 350 or less decides it.' };
    if (!why.length) {
      notes.push('In a low-prevalence setting it may also be stopped once a person is stable on ART with immune recovery and viral suppression.');
      return { valid: true, band: `Not indicated by these criteria: CD4 ${cd4} (above 350), stage 1-2, no active TB, low-prevalence setting.`, bandLabel: 'Not indicated', abnormal: false, notes, note: NOTE };
    }
    notes.push('The adult dose is read from the 25-35 kg column of WHO\'s table, which carries into the adult tablet.');
    notes.push('Where malaria or bacterial infections are highly prevalent, it continues regardless of CD4 or stage.');
    return { valid: true, band: `Cotrimoxazole 800/160 mg once a day (${why.join('; ')}).`, bandLabel: 'Indicated: 800/160 mg daily', abnormal: false, notes, note: NOTE };
  }

  const f = inputFault([['the weight', o.weight, 1, 150, 'kg']]);
  if (f) return { valid: false, message: f };
  const w = Number(o.weight);
  const d = dose(w);
  if (!d) return { valid: false, message: 'WHO\'s cotrimoxazole table starts at 3 kg. Below that, follow your national protocol.' };
  if (g.value === 'exposed') {
    notes.push('Start at 4 to 6 weeks of age and continue until HIV infection is excluded by an age-appropriate test after breastfeeding has fully stopped.');
  } else {
    notes.push('Every child and adolescent with HIV gets it, with priority for those under 5, at stage 3 or 4, or with CD4 350 or less.');
    notes.push('Where malaria or bacterial infections are highly prevalent it continues into adulthood; in low-prevalence settings it may stop from 5 years if stable or suppressed on ART for 6 months with CD4 over 350.');
  }
  notes.push('Re-dose by weight band as the child grows.');
  return { valid: true, band: `Cotrimoxazole for ${Math.round(w * 10) / 10} kg (${d.band}): ${d.text}.`, bandLabel: d.band, abnormal: false, notes, note: NOTE };
}
