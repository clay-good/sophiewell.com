// spec-v1401: nonoccupational HIV postexposure prophylaxis (nPEP) -- CDC 2025.
//
// Source: Tanner MR, et al. Antiretroviral Postexposure Prophylaxis After Sexual, Injection Drug Use,
// or Other Nonoccupational Exposure to HIV -- CDC Recommendations, United States, 2025. MMWR Recomm
// Rep 2025;74(RR-1) (PMC12064164, read 2026-09-18; corrected by the erratum in MMWR 2025;74(35)).
//   Box 2: nPEP is recommended when an exposure within the past 72 hours presents a substantial risk
//     for HIV transmission and the source has HIV without sustained viral suppression, or their
//     suppression is unknown. Case-by-case when the source's HIV status is unknown. Not recommended
//     when the exposure presents no substantial risk. Stop if the source is found not to have HIV.
//   Start as soon as possible, ideally within 24 hours, no later than 72; do not wait for laboratory
//     results; a rapid or laboratory Ag/Ab test before starting. 28 days. Preferred for adults and
//     adolescents, pregnancy included: BIC/FTC/TAF, or DTG plus (TAF or TDF) plus (FTC or 3TC).
//   Table 1: sexual exposure while taking PrEP as recommended -- nPEP not generally recommended, but
//     may be considered after a recent start, missed doses, an off-guideline intermittent regimen, or a
//     source with resistance to PrEP components. Sexual exposure to a source with sustained viral
//     suppression (treatment > 6 months, consistent adherence, HIV RNA < 200 copies/mL or undetectable
//     on every test in the past year, the latest within 1-2 months) -- not routinely recommended.
//     Shared injection equipment with such a source -- case-by-case.
//   Past 72 hours: evidence is insufficient to recommend nPEP; test for HIV, give prevention
//     counseling including PrEP, and a follow-up testing plan.
//   Follow-up: a visit at 24 hours; HIV Ag/Ab and NAT at 4-6 weeks (may be deferred if nPEP started
//     within 24 hours and no dose was missed) and at 12 weeks. Baseline labs: creatinine, ALT, AST, HIV,
//     hepatitis B, pregnancy; test and treat HCV and STIs as indicated. Offer PrEP and a nPEP-to-PrEP
//     plan to anyone with ongoing indications.
//
// Pure: no DOM, no clock, no network.

export const NPEP_VERIFIED = '2026-09-18';
export const ROUTES = [
  { value: 'sexual', text: 'Sexual (anal, vaginal, or oral), including sexual assault' },
  { value: 'injection', text: 'Shared needles or other injection equipment' },
  { value: 'other', text: 'Other: a discarded needle, a bite, or a splash' },
];
export const RISK = [
  { value: 'yes', text: 'Yes: blood or genital, rectal, or bloody fluid onto a mucous membrane, broken skin, or through the skin' },
  { value: 'no', text: 'No: intact skin, or saliva, tears, sweat, urine, or nasal fluid without blood' },
];
export const SOURCES = [
  { value: 'hiv-viremic', text: 'Has HIV, not durably suppressed or viral load unknown' },
  { value: 'hiv-suppressed', text: 'Has HIV with sustained viral suppression' },
  { value: 'unknown', text: 'HIV status unknown' },
  { value: 'negative', text: 'Tested and does not have HIV' },
];
export const PREP = [
  { value: 'none', text: 'Not taking PrEP' },
  { value: 'consistent', text: 'Taking PrEP as recommended' },
  { value: 'gap', text: 'Recent start, missed doses, or an off-guideline intermittent regimen' },
];

function isBlank(v) {
  return v === null || v === undefined || String(v).trim() === '';
}

const REGIMEN = 'Regimen for 28 days, preferred for adults and adolescents, pregnancy included: bictegravir/emtricitabine/tenofovir alafenamide, or dolutegravir plus (tenofovir alafenamide or tenofovir disoproxil fumarate) plus (emtricitabine or lamivudine). Tailor to kidney function, other drugs, and any earlier long-acting injectable exposure.';
const FOLLOW = [
  'Before the first dose: a rapid or laboratory HIV Ag/Ab test; do not wait for laboratory results to start.',
  'Baseline: creatinine, ALT, AST, HIV, hepatitis B, and pregnancy; test and treat hepatitis C and other STIs as indicated.',
  'Follow-up: a visit at 24 hours; HIV Ag/Ab and NAT at 4 to 6 weeks (may be deferred if nPEP began within 24 hours and no dose was missed) and at 12 weeks.',
  'Offer PrEP, with a plan to move from nPEP to PrEP, if exposure is likely to continue.',
];
const LATE = [
  'Test for HIV now.',
  'HIV prevention counseling, including PrEP.',
  'A follow-up HIV testing plan.',
];

export function npep2025(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  if (isBlank(o.hours)) return { valid: false, message: 'Enter the hours since the exposure. nPEP starts within 72 hours, ideally within 24.' };
  const h = Number(String(o.hours).trim());
  if (!Number.isFinite(h) || h < 0 || h > 8760) return { valid: false, message: 'Enter the hours since the exposure.' };
  const route = ROUTES.find((r) => r.value === o.route);
  if (!route) return { valid: false, message: 'Choose how the exposure happened.' };
  if (o.risk !== 'yes' && o.risk !== 'no') return { valid: false, message: 'Answer whether the exposure presents a substantial risk: which fluid, onto or through what.' };
  const src = SOURCES.find((s) => s.value === o.source);
  if (!src) return { valid: false, message: "Choose what is known about the source's HIV status." };
  const prep = PREP.find((p) => p.value === o.prep);
  if (!prep) return { valid: false, message: 'Choose whether the exposed person takes PrEP.' };

  const base = { valid: true, whatsNew: 'New in 2025: preferred regimens are BIC/FTC/TAF or dolutegravir-based; the indications now address a source with sustained viral suppression and a person already on PrEP; sexual assault testing follows CDC STI guidelines; and the first dose should come within 24 hours.' };
  if (h > 72) {
    return {
      ...base, decision: 'not-recommended', abnormal: true, bandLabel: 'Past 72 hours: nPEP not recommended',
      band: `At ${h} hours the evidence does not support starting nPEP. Offer instead:`, steps: LATE,
    };
  }
  if (o.risk === 'no') return { ...base, decision: 'not-recommended', abnormal: false, bandLabel: 'No substantial risk: not recommended', band: 'The exposure presents no substantial risk for HIV transmission, so nPEP is not recommended.', steps: LATE.slice(1) };
  if (src.value === 'negative') return { ...base, decision: 'not-indicated', abnormal: false, bandLabel: 'Source does not have HIV', band: 'nPEP is not indicated when the source does not have HIV; stop it if it was started and the source is then found negative.', steps: [] };

  let decision;
  let band;
  if (src.value === 'hiv-suppressed' && route.value === 'sexual') {
    decision = 'not-routine';
    band = 'Sexual exposure to a source with sustained viral suppression: nPEP is not routinely recommended, because such a source is not expected to transmit HIV sexually. Confirm the source has stayed adherent since the last viral load.';
  } else if (src.value === 'hiv-suppressed') {
    decision = 'case-by-case';
    band = 'Exposure to a suppressed source by a non-sexual route: a case-by-case decision. Transmission is not expected, but direct data are lacking.';
  } else if (src.value === 'unknown') {
    decision = 'case-by-case';
    band = 'Substantial-risk exposure to a source of unknown HIV status: a case-by-case decision, weighing the likelihood the source has HIV.';
  } else {
    decision = 'recommended';
    band = 'Substantial-risk exposure to a source with HIV who is not durably suppressed: nPEP is recommended.';
  }
  if (route.value === 'sexual' && prep.value === 'consistent' && decision !== 'not-routine') {
    decision = 'not-generally';
    band = 'Sexual exposure in someone taking PrEP as recommended: nPEP is not generally recommended. It may be considered after a recent start, missed doses, an off-guideline intermittent regimen, or a source with resistance to PrEP drugs.';
  }
  const give = decision === 'recommended' || decision === 'case-by-case' || decision === 'not-generally';
  const timing = h <= 24 ? `At ${h} hours: start now, within the ideal 24 hours.` : `At ${h} hours: start now; the limit is 72 hours.`;
  return {
    ...base,
    decision,
    abnormal: decision === 'recommended',
    bandLabel: { recommended: 'nPEP recommended', 'case-by-case': 'Case-by-case decision', 'not-routine': 'Not routinely recommended', 'not-generally': 'Not generally recommended' }[decision],
    band: `${band}${give ? ` ${timing}` : ''}`,
    regimen: give ? REGIMEN : null,
    steps: give ? FOLLOW : LATE.slice(1),
  };
}
