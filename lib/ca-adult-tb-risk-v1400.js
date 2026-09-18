// spec-v1400: the California Adult TB Risk Assessment (CDPH), for asymptomatic adults.
//
// Source:
//   California Department of Public Health, TB Control Branch. California Adult Tuberculosis Risk
//   Assessment (>18 years old). Version posted September 2026.
//   https://www.cdph.ca.gov/Programs/CID/DCDC/CDPH%20Document%20Library/CA-Adult-TB-Risk-Assessment.pdf
//
// Testing for latent TB infection is recommended if ANY of four boxes is checked:
//
//   1. birth, travel, or residence for at least 1 month, or frequent border crossing, in a country
//      with an elevated TB rate (10 or more cases per 100,000)
//   2. immunosuppression, current or planned
//   3. close contact with someone with infectious TB disease during their lifetime
//   4. homelessness or incarceration, current or past (including shelters and correctional or
//      detention facilities)
//
// IGRA is preferred over the TST, especially for people born outside the US. The assessment is for
// ASYMPTOMATIC adults: symptoms or an abnormal chest x-ray mean an active-disease workup instead,
// and a negative test does not rule active disease out.
//
// SOURCE TYPO, HANDLED: the form gives the steroid threshold as "prednisone >=15 mg/kg/day for >=1
// month". That is 900 mg a day for a 60 kg adult. CDC's threshold is 15 mg/DAY for at least a
// month; the tile uses mg/day and says so.
//
// Pure: no DOM, no clock, no network.

export const CA_TB_NOTE = 'CDPH California Adult TB Risk Assessment. Test for latent TB infection if any box applies: birth, travel, or residence of at least 1 month, or frequent border crossing, in a country with an elevated TB rate (10 or more cases per 100,000, which is most countries outside the US, Canada, Australia, New Zealand, and western and northern Europe); immunosuppression, current or planned; close contact with infectious TB; or homelessness or incarceration, current or past. IGRA is preferred. Repeat testing only for a new risk factor. The tool is for asymptomatic adults; it is not a diagnosis.';

export const STEROID_NOTE = 'The form prints the steroid threshold as prednisone 15 mg/kg/day, which would be 900 mg a day at 60 kg. The threshold CDC uses is the equivalent of prednisone 15 mg per DAY or more for at least 1 month, and that is what this tool means by immunosuppression from steroids.';

export const YES_NO = [
  { value: 'yes', text: 'Yes' },
  { value: 'no', text: 'No' },
];

export const CA_TB_BOXES = [
  { key: 'country', label: 'Birth, travel, or residence for at least 1 month, or frequent border crossing, in a country with an elevated TB rate' },
  { key: 'immunosuppression', label: 'Immunosuppression, current or planned (HIV, organ transplant, TNF-alpha inhibitors or other biologics, prednisone 15 mg/day or more for 1 month or more, other immunosuppressive drugs)' },
  { key: 'contact', label: 'Close contact with someone with infectious TB disease, at any time' },
  { key: 'congregate', label: 'Homelessness or incarceration, current or past (shelter, jail, prison, or immigration detention)' },
];

function isBlank(v) {
  return v === null || v === undefined || String(v).trim() === '';
}

export function caAdultTbRisk(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  if (isBlank(o.symptoms)) {
    return { valid: false, message: 'First answer whether there are symptoms of TB disease (cough over 2 weeks, fever, night sweats, unexplained weight loss) or an abnormal chest x-ray. The risk assessment is only for people without them.' };
  }
  if (o.symptoms === 'yes') {
    return {
      valid: true, testLtbi: null, abnormal: true, checked: [],
      bandLabel: 'Evaluate for active TB disease',
      band: 'Symptoms of TB disease or an abnormal chest x-ray: this is not a latent TB screening question. Evaluate for active TB disease (exam, chest x-ray, and sputum as indicated) and contact the local TB control program if TB is suspected. A negative IGRA or skin test does not rule active disease out.',
      steroidNote: STEROID_NOTE,
      postureNote: 'Decision support, not a verdict. Local TB control programs may add their own recommendations and mandates.',
      note: CA_TB_NOTE,
    };
  }

  const blank = CA_TB_BOXES.filter((b) => isBlank(o[b.key]));
  if (blank.length) {
    return { valid: false, message: `Answer all four risk questions (${blank.length} unanswered). An unanswered risk box is not a "no", and "no testing indicated" is the reassuring way to be wrong.` };
  }

  const checked = CA_TB_BOXES.filter((b) => o[b.key] === 'yes');
  if (checked.length) {
    return {
      valid: true, testLtbi: true, abnormal: true, checked: checked.map((b) => b.key),
      bandLabel: 'Test for latent TB infection',
      band: `Test for latent TB infection: ${checked.length} of the 4 risk boxes ${checked.length === 1 ? 'applies' : 'apply'}. IGRA is preferred over a tuberculin skin test, especially for people born outside the US.`,
      nextStep: 'If the test is positive, exclude active TB disease (symptom review, exam, chest x-ray) before treating latent infection. Most people with a risk factor and a positive test should be treated.',
      steroidNote: STEROID_NOTE,
      postureNote: 'Decision support, not a verdict. Local TB control programs may add their own recommendations and mandates.',
      note: CA_TB_NOTE,
    };
  }
  return {
    valid: true, testLtbi: false, abnormal: false, checked: [],
    bandLabel: 'No TB testing indicated',
    band: 'None of the 4 risk boxes apply: no TB testing is indicated at this time. Routine testing without a risk factor produces false positives and unnecessary treatment.',
    nextStep: 'Mandated testing (for example health care, correctional, or long-term-care employment) still applies; this assessment does not replace it.',
    steroidNote: STEROID_NOTE,
    postureNote: 'Decision support, not a verdict. Local TB control programs may add their own recommendations and mandates.',
    note: CA_TB_NOTE,
  };
}
