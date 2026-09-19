// spec-v1398: Valley fever (coccidioidomycosis) -- when California's public health advisory says to
// consider it and how to test.
//
// Source: CDPH CAHAN, "Substantial Rise in Coccidioidomycosis in California: Recommendations for
// California Healthcare Providers", January 18, 2024 (cdph.ca.gov, read 2026-09-18):
//   Consider coccidioidomycosis in a patient with community-acquired pneumonia or respiratory illness
//   who: lives, works, or travels in areas with coccidioidomycosis; is exposed to outdoor dust or dirt;
//   is symptomatic for a week or longer; or is not responding to standard CAP treatment.
//   Serology: EIA, immunodiffusion (ID), and complement fixation (CF) are the tests most used, with
//   variable sensitivity; a negative result on one type does not cancel a positive on another; not
//   every patient has a CF titer; antibodies may lag onset by weeks. With high suspicion, repeat
//   serology in 2-4 weeks or use histopathology, PCR, or culture. For a patient hospitalized with
//   suspected severe disease, consider PCR and culture of tissue or respiratory specimens,
//   especially if serology is negative. Culture is handled in a BSL-3 laboratory.
//
// The advisory's own words for place are "areas with coccidioidomycosis"; no county list is carried,
// because incidence changes year to year.
//
// Pure: no DOM, no clock, no network.

export const VF_VERIFIED = '2026-09-18';
export const YES_NO = [
  { value: 'yes', text: 'Yes' },
  { value: 'no', text: 'No' },
];
const PROMPTS = [
  ['endemic', 'lives, works, or travels in an area with coccidioidomycosis'],
  ['dust', 'exposed to outdoor dust or dirt'],
  ['week', 'symptomatic for a week or longer'],
  ['noResponse', 'not responding to standard CAP treatment'],
];

export function caValleyFeverTestPrompt(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  if (o.respiratory !== 'yes' && o.respiratory !== 'no') return { valid: false, message: 'Answer whether the patient has community-acquired pneumonia or a respiratory illness. The advisory is written for that presentation.' };
  const tests = [
    'Serology for Coccidioides IgM and IgG: EIA, immunodiffusion, and complement fixation. A negative on one type does not cancel a positive on another, and not every patient develops a CF titer.',
    'Antibodies can lag the illness by weeks: with high suspicion and negative serology, repeat it in 2 to 4 weeks, or use histopathology, PCR, or culture.',
  ];
  if (o.severe === 'yes') tests.push('Hospitalized with suspected severe disease: send PCR and culture of tissue or respiratory specimens, especially if serology is negative. Tell the laboratory, because cultures need BSL-3 handling.');
  if (o.respiratory === 'no') {
    return { valid: true, consider: false, abnormal: false, bandLabel: 'Outside the advisory', band: 'The CDPH advisory addresses community-acquired pneumonia and respiratory illness; for other presentations (skin, bone, meningitis), use clinical judgment and infectious diseases advice.', tests: [] };
  }
  const rows = PROMPTS.map(([k, label]) => ({ label, v: o[k] === 'yes' || o[k] === 'no' ? o[k] : null }));
  const yes = rows.filter((r) => r.v === 'yes').map((r) => r.label);
  const open = rows.filter((r) => r.v === null).map((r) => r.label);
  if (yes.length) {
    return {
      valid: true, consider: true, abnormal: true,
      bandLabel: 'Consider coccidioidomycosis; test',
      band: `CDPH advises considering Valley fever: the patient ${yes.join('; ')}.`,
      tests,
      reportNote: 'Coccidioidomycosis is reportable in California. Early diagnosis avoids unneeded antibiotics.',
    };
  }
  if (open.length) {
    return { valid: true, consider: null, abnormal: false, bandLabel: 'Incomplete', band: `Not decided. Still needed, for this patient: ${open.join('; ')}. Ask about travel and occupation.`, tests: [] };
  }
  return { valid: true, consider: false, abnormal: false, bandLabel: 'No advisory prompt present', band: 'None of the advisory\'s four prompts is present. Keep Valley fever in mind if the illness persists or exposure history changes.', tests: [] };
}
