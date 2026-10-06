// spec-v1554 tool 2: is this advanced HIV disease, and what does the WHO package of care include?
//
// Source: WHO. Guidelines on the management of advanced HIV disease, December 2025 (AHD25; IRIS
// 10665/384543; CC BY-NC-SA 3.0 IGO, facts restated). Read October 6, 2026:
//   - Definitions of key terms: 5 years and older, CD4 200 cells/mm3 or less; where CD4 testing is
//     unavailable, a WHO clinical stage 3 or 4 event at presentation; every child under 5 at presentation,
//     unless on ART for more than a year and clinically stable. Rapid ART start: within 7 days, same day
//     preferred. Adolescent 10-19 years; child 1 to under 10.
//   - p. 12: children established on ART and older than 2 years are not considered to have advanced disease;
//     no routine CrAg screening under 10 years; defer ART if symptoms suggest TB or cryptococcal meningitis.
//   - Table 2 (p. 14): TB screening for all; CrAg screening and fluconazole pre-emptive therapy below 200 and
//     below 100 cells/mm3 (adults and adolescents only); histoplasmosis antigen testing (adults and
//     adolescents); concurrent NAAT and urine LF-LAM for TB; cotrimoxazole below 350 or stage 3 or 4 (any CD4
//     where malaria or severe bacterial infections are common); TPT for all (3HP preferred in adults and
//     adolescents); rapid ART; tailored adherence counselling below 200.
//
// Stated rather than hidden: the definition says "more than a year" on ART and stable, while p. 12 says
// "established on ART and older than two years"; both are printed for a stable child under 5. CD4 exactly 200
// is advanced disease under the 2025 definition (2021 said below 200).
//
// Pure: no DOM, no clock.

import { inputFault } from './num.js';

export const STAGE_OPTIONS = [
  { value: '1', text: 'Stage 1' },
  { value: '2', text: 'Stage 2' },
  { value: '3', text: 'Stage 3' },
  { value: '4', text: 'Stage 4' },
];
export const YES_NO = [{ value: 'no', text: 'No' }, { value: 'yes', text: 'Yes' }];

const NOTE = 'This follows WHO\'s December 2025 guidelines on the management of advanced HIV disease.';

function pkg(years, cd4, stage) {
  const n = [];
  const adultish = years >= 10;
  n.push('Screen for TB (everyone with HIV); test with a rapid molecular test on a respiratory sample plus urine LF-LAM (stool NAAT in children).');
  if (adultish) {
    if (cd4 !== null && cd4 < 200) n.push(`Screen for cryptococcal antigen before starting or restarting ART (CD4 ${cd4}: ${cd4 < 100 ? 'strongly recommended below 100' : 'may be considered below 200'}); give pre-emptive fluconazole if positive and meningitis is excluded.`);
    else if (cd4 === null) n.push('Cryptococcal antigen screening applies below CD4 200 (strongly below 100): CD4 not entered, so its need is not decided.');
    n.push('Test for histoplasmosis antigen where relevant.');
  } else {
    n.push('No routine cryptococcal antigen screening under 10 years; investigate a child with signs of meningitis.');
  }
  const ctx = (cd4 !== null && cd4 < 350) || stage === '3' || stage === '4';
  n.push(ctx ? 'Give cotrimoxazole prophylaxis (CD4 below 350 or stage 3 or 4).' : 'Cotrimoxazole prophylaxis applies below CD4 350, at stage 3 or 4, or at any CD4 where malaria or severe bacterial infections are common.');
  n.push(adultish ? 'Give TB preventive treatment once TB disease is excluded (3HP preferred).' : 'Give TB preventive treatment once TB disease is excluded.');
  n.push('Start ART rapidly (within 7 days, ideally the same day), but defer it if symptoms suggest TB or cryptococcal meningitis.');
  n.push('Tailored adherence counselling, with home visits if feasible.');
  if (!adultish) n.push('Check BCG and age-appropriate vaccinations, growth and nutrition.');
  return n;
}

export function whoAdvancedHiv(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const f = inputFault([['the age', o.age, 0, 120, 'years']]);
  if (f) return { valid: false, message: f };
  const years = Number(o.age);
  let cd4 = null;
  if (String(o.cd4 ?? '').trim() !== '') {
    const fc = inputFault([['the CD4 count', o.cd4, 0, 5000, 'cells/mm3']]);
    if (fc) return { valid: false, message: fc };
    cd4 = Number(o.cd4);
  }
  const stage = STAGE_OPTIONS.some((x) => x.value === o.stage) ? o.stage : null;
  const out = (band, label, ahd, notes) => ({ valid: true, band, bandLabel: label, abnormal: ahd, notes, note: NOTE });

  if (years < 5) {
    if (!YES_NO.some((x) => x.value === o.stable)) return { valid: false, message: 'Choose whether the child has been on ART for more than a year and is clinically stable: under 5, that decides it.' };
    if (o.stable === 'yes') {
      return out('Not advanced HIV disease: a child under 5 on ART for more than a year and clinically stable is the exception to "all children under 5".', 'Not advanced', false,
        ['WHO\'s text also says children established on ART and older than 2 years are not considered to have advanced disease.', 'Reassess as advanced disease if the child presents again after interrupting ART, or with a stage 3 or 4 event.']);
    }
    return out('Advanced HIV disease: every child under 5 at presentation, unless on ART for more than a year and clinically stable.', 'Advanced HIV disease', true, pkg(years, cd4, stage));
  }

  const extra = o.stable ? ['The "on ART more than a year and stable" answer applies only under 5 years; it is not used here.'] : [];
  if (cd4 !== null) {
    if (cd4 <= 200) {
      const notes = pkg(years, cd4, stage);
      if (cd4 === 200) notes.unshift('CD4 exactly 200 is advanced disease under the 2025 definition (200 or less); the 2021 definition was below 200.');
      return out(`Advanced HIV disease: CD4 ${cd4} cells/mm³ (200 or less).`, 'Advanced HIV disease', true, [...extra, ...notes]);
    }
    const notes = [...extra, 'Not advanced disease by CD4, whatever the clinical stage: the stage is the fallback only where CD4 testing is unavailable.'];
    if (cd4 < 350) notes.push('Cotrimoxazole prophylaxis still applies below 350.');
    return out(`Not advanced HIV disease: CD4 ${cd4} cells/mm³ (above 200).`, 'Not advanced', false, notes);
  }
  if (!stage) return { valid: false, message: 'Enter the CD4 count, or choose the WHO clinical stage if CD4 testing is not available.' };
  if (stage === '3' || stage === '4') {
    return out(`Advanced HIV disease: a WHO clinical stage ${stage} event at presentation, with no CD4 count (the fallback definition).`, 'Advanced HIV disease', true, [...extra, 'Get a CD4 count when you can: it is the definition.', ...pkg(years, null, stage)]);
  }
  return out(`Not advanced HIV disease on clinical stage ${stage}, but CD4 not entered: stage 1 or 2 does not exclude a CD4 of 200 or less. Get a CD4 count.`, 'Not on stage alone', false, extra);
}
