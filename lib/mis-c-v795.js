// spec-v795: MIS-C surveillance case definition (2023).
//
// Source:
//   Council of State and Territorial Epidemiologists / CDC surveillance case definition
//   for multisystem inflammatory syndrome in children associated with SARS-CoV-2
//   infection, United States. MMWR Recomm Rep. 2022;71(4):1-14. Effective 2023-01-01.
//
// EVERY criterion is required:
//   age under 21 years
//   fever, subjective or documented, at least 38.0 degrees Celsius
//   C-reactive protein at least 3.0 mg/dL (30 mg/L)
//   new-onset manifestations in at least TWO of five categories:
//     cardiac, mucocutaneous, shock, gastrointestinal, hematologic
//   laboratory evidence of SARS-CoV-2 by RNA, antigen, or antibody within 60 days
//     before or during the hospitalization
//   no alternative diagnosis - and a final diagnosis of Kawasaki disease made by the
//     treating team COUNTS as an alternative diagnosis
//
// The Kawasaki exclusion is the part that surprises people: a child who otherwise meets
// every criterion is still not a MIS-C case if the treating team has settled on Kawasaki
// disease.
//
// This is a SURVEILLANCE definition, written to count cases consistently across states.
// It is not a clinical diagnosis and not a treatment threshold.
//
// Pure: no DOM, no clock, no network.

export const MISC_NOTE = 'The 2023 surveillance case definition for multisystem inflammatory syndrome in children (Council of State and Territorial Epidemiologists and CDC, MMWR Recomm Rep 2022;71(4):1-14, effective January 2023) requires every one of its criteria: an age under 21 years, fever of at least 38 degrees Celsius whether documented or reported, a C-reactive protein of at least 3.0 milligrams per deciliter, new-onset involvement in at least two of five categories being cardiac, mucocutaneous, shock, gastrointestinal and hematologic, laboratory evidence of SARS-CoV-2 within 60 days before or during the admission, and no alternative diagnosis. A final diagnosis of Kawasaki disease by the treating team counts as an alternative diagnosis, so a child who meets everything else is still not a case. This is a surveillance definition written so that states count cases the same way. It is not a clinical diagnosis, it is not a treatment threshold, and a child who does not meet it can still be seriously unwell and need treatment.';

const CATEGORIES = [
  { arg: 'cardiac', text: 'cardiac' },
  { arg: 'mucocutaneous', text: 'mucocutaneous' },
  { arg: 'shock', text: 'shock' },
  { arg: 'gastrointestinal', text: 'gastrointestinal' },
  { arg: 'hematologic', text: 'hematologic' },
];

function truthy(v) { return v === true || v === 'true' || v === 1 || v === '1' || v === 'on' || v === 'yes'; }

function optNum(v, min, max) {
  if (v === '' || v === null || v === undefined) return null;
  const n = typeof v === 'number' ? v : Number(String(v).trim());
  if (!Number.isFinite(n) || n < min || n > max) return undefined;
  return n;
}

export function misC(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const age = optNum(o.ageYears, 0, 120);
  if (age === undefined) return { valid: false, code: 'INVALID_INPUT', field: 'ageYears', message: 'Enter an age in years between 0 and 120.', note: MISC_NOTE };
  const crp = optNum(o.crp, 0, 100);
  if (crp === undefined) return { valid: false, code: 'INVALID_INPUT', field: 'crp', message: 'Enter a C-reactive protein between 0 and 100 mg/dL.', note: MISC_NOTE };
  if (age === null) return { valid: false, code: 'MISSING_INPUT', field: 'ageYears', message: 'Enter the age in years.', note: MISC_NOTE };
  if (crp === null) return { valid: false, code: 'MISSING_INPUT', field: 'crp', message: 'Enter the C-reactive protein in mg/dL.', note: MISC_NOTE };

  const categories = CATEGORIES.filter((c) => truthy(o[c.arg])).map((c) => c.text);
  const kawasaki = truthy(o.kawasakiFinalDiagnosis);

  const missing = [];
  if (!(age < 21)) missing.push('age under 21 years');
  if (!truthy(o.fever)) missing.push('fever of 38.0 C or above');
  if (!(crp >= 3)) missing.push('CRP of 3.0 mg/dL or above');
  if (categories.length < 2) missing.push(`at least two involved categories (${categories.length} selected)`);
  if (!truthy(o.sarsCov2Evidence)) missing.push('laboratory evidence of SARS-CoV-2 within 60 days');

  const excluded = kawasaki;
  const met = missing.length === 0 && !excluded;

  let band;
  if (excluded) {
    band = 'MIS-C case definition NOT met — a final diagnosis of Kawasaki disease counts as an alternative diagnosis, so this is not reported as a case.';
  } else if (met) {
    band = `MIS-C case definition met — all criteria present, with ${categories.length} of five categories involved.`;
  } else {
    band = `MIS-C case definition not met — still needed: ${missing.join('; ')}.`;
  }

  return {
    valid: true,
    met,
    excluded,
    categories,
    categoryCount: categories.length,
    missing,
    abnormal: met,
    bandLabel: met ? 'MIS-C: case definition met' : 'MIS-C: case definition not met',
    band,
    detail: 'Every criterion is required: age under 21; fever of 38.0 C or above, documented or reported; CRP of 3.0 mg/dL or above; new-onset involvement in at least two of cardiac, mucocutaneous, shock, gastrointestinal and hematologic; laboratory evidence of SARS-CoV-2 within 60 days before or during admission; and no alternative diagnosis, where a final diagnosis of Kawasaki disease by the treating team counts as one.',
    note: MISC_NOTE,
  };
}
