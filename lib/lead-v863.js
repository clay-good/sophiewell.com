// spec-v863: the CDC blood lead reference value and what a result means against it.
//
// Source:
//   Centers for Disease Control and Prevention. Blood Lead Reference Value. Atlanta: CDC; 2021.
//   (Updated from 5 to 3.5 micrograms per deciliter on the recommendation of the Lead Exposure
//   and Prevention Advisory Committee.)
//
//     under 3.5   below the reference value
//     3.5 and up  AT OR ABOVE the reference value -- identify and remove the source
//     45 and up   the level at which chelation is considered
//     70 and up   a medical emergency
//
// THE REFERENCE VALUE IS 3.5, NOT 5, AND THAT IS WHY THIS TILE EXISTS. It was lowered in 2021.
// A result read against the old line of 5 leaves every child between 3.5 and 5 looking normal.
//
// THE REFERENCE VALUE IS NOT A SAFE LEVEL AND NOT A TREATMENT THRESHOLD. It is the 97.5th
// percentile of the blood lead distribution in young children in the United States -- a
// statistical marker for identifying children with more exposure than most. No level of lead in
// blood is known to be without effect.
//
// A CAPILLARY RESULT IS NOT A DIAGNOSIS. Lead on the skin contaminates a fingerstick, so an
// elevated capillary result is confirmed venous before it is acted on.
//
// spec-v1401 Part B: an optional California line. Source: California Department of Public Health,
// Childhood Lead Poisoning Prevention Branch, "California Management Guidelines on Childhood Lead
// Poisoning for Health Care Providers" (August 2023), read 2026-09-19. For a capillary result, the
// confirmatory venous test is due within 3 months (3.5-9.4), within 1 month (9.5-14.4 and 14.5-19.4),
// within 2 weeks (19.5-44.4), within 48 hours (44.5-59.4), within 24 hours (59.5-69.4), and
// immediately (69.5 and above). California regulations require testing at 12 and 24 months (up to
// 72 months if missed at 24) for a child in a publicly funded program for low-income children or
// with other lead exposure risks. With no state chosen, nothing below changes.
//
// spec-v1401 Part B: an optional New York line. Source: 10 NYCRR 67-1.1 and 67-1.2 (Cornell LII copy,
// amended effective September 25, 2019; read 2026-09-19). 67-1.1(e): an elevated blood lead level is
// 5 micrograms per deciliter or more; (d) a confirmed level is measured on venous blood. 67-1.2(a):
// (1) risk assessment at each well-child visit from 6 months to under 6 years; (3) screen at or
// around ages 1 and 2; (8) risk reduction education and nutritional counseling at 5 or more; (9) a
// capillary result of 5 or more is confirmed on a venous sample -- the rule sets no deadline for it;
// (10) a confirmed level of 5 or more gets a complete diagnostic evaluation (exposure assessment,
// nutritional assessment including iron status, developmental screening), treatment if needed, and
// referral to the local or State health unit for environmental management. 67-1.2(b): an emergency
// department or other one-time provider asks whether a child 6 months to under 6 years has been
// screened, and screens or refers if not.
//
// spec-v1401 Part B: an optional New York City line. Sources, read 2026-09-19: NYC Health Code
// 11.03(a) as amended by the Board of Health on October 25, 2022 (notice of adoption on
// rules.cityofnewyork.us): a blood lead level of 3.5 or more is reportable, and 3.5 is also the
// threshold for a Department investigation (Article 173). NYC Health Department letter "Current
// Guidance for Blood Lead Testing and Management" (September 12, 2025): report 3.5 or more within
// 24 hours; when an in-office capillary test is 3.5 or more, draw a venous sample before the patient
// leaves; monitor until a level under 3.5; assess pregnant patients' risk at the first prenatal
// visit. New York State's rule applies in the city too.
//
// spec-v1401 Part B: an optional Texas line. Source: Texas DSHS, "Reference for Blood Lead Retesting
// and Medical Case Management" (form Pb-109, rev. March 2024), read 2026-09-19. Table 1, capillary
// screen to diagnostic venous test: 3.5-9 within 1 to 12 weeks; 10-19 within 1 to 4 weeks; 20-44
// within 1 to 2 weeks; 45 or more within 48 hours. Table 2, early venous retesting: 3.5-9 at 3
// months; 10-19 at 1 to 3 months; 20-44 at 2 weeks to 1 month; 45 or more as soon as possible.
// Table 3: an environmental lead investigation at a diagnostic venous 20 or more, and at 3.5-19 only
// if a venous 10 or more persists at least 12 weeks after the diagnostic test. The form prints
// whole-number bands (3.5-9, 10-19, ...), so a value between them (9.5) is read with the lower band.
//
// Pure: no DOM, no clock, no network.

export const LEAD_NOTE = 'The blood lead reference value published by the Centers for Disease Control and Prevention is 3.5 micrograms per deciliter. It was lowered from 5 in 2021, so a result read against the old line leaves every child between 3.5 and 5 looking normal. Three things about it are commonly got wrong. It is not a safe level: it is the 97.5th percentile of the blood lead distribution among young children in the United States, a statistical marker for identifying the children with more exposure than most, and no level of lead in blood is known to be without effect. It is not a treatment threshold either; chelation is considered at 45 micrograms per deciliter and above, and 70 and above is a medical emergency, while everything at or above the reference value calls for finding and removing the source rather than for a drug. And a capillary result is not a diagnosis, because lead on the skin contaminates a fingerstick, so an elevated capillary result is confirmed on a venous sample before it is acted on. The value has been lowered before, from 10 to 5 and then to 3.5, and it is expected to fall again as exposure in the population falls. It reads a result against the published reference value. It does not schedule confirmatory testing, choose a chelating agent, or replace the local health department, the regional poison center, or a lead program.';

function num(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export const REFERENCE_VALUE = 3.5;
const CHELATION_CONSIDERED = 45;
const EMERGENCY = 70;
const OLD_REFERENCE = 5;

const CA_CONFIRM = [
  [69.5, 'immediately'],
  [59.5, 'within 24 hours'],
  [44.5, 'within 48 hours'],
  [19.5, 'within 2 weeks'],
  [9.5, 'within 1 month'],
  [3.5, 'within 3 months'],
];

function californiaLine(level, sample) {
  const testing = 'California requires testing at 12 and 24 months (up to 72 months if missed at 24) for a child in a publicly funded program for low-income children or with other lead exposure risks.';
  if (level < REFERENCE_VALUE) return `California (CDPH, August 2023): below 3.5 no confirmation is needed. ${testing}`;
  const when = CA_CONFIRM.find(([min]) => level >= min)[1];
  if (sample === 'capillary') return `California (CDPH, August 2023): confirm this capillary result with a venous test ${when}. Every retest at 3.5 or more is venous. ${testing}`;
  if (sample === 'venous') return `California (CDPH, August 2023): a venous result; retest per this range, and at 44.5 or more follow the urgent pathway. A capillary result at this level would need venous confirmation ${when}. ${testing}`;
  return `California (CDPH, August 2023): if this was capillary, confirm it with a venous test ${when}. ${testing}`;
}

const NY_SCHEDULE = 'Children are screened at or around ages 1 and 2, and assessed for risk at each well-child visit from 6 months to 6 years. An emergency department or other one-time provider asks whether a child that age has been screened, and screens or refers if not (67-1.2(a)(1), (a)(3), (b)).';

function newYorkCityLine(level, sample) {
  const head = 'New York City (Health Code 11.03; Health Department letter, September 12, 2025):';
  const state = 'New York State\'s rule applies too: screen at or around ages 1 and 2.';
  if (level < REFERENCE_VALUE) return `${head} below 3.5 is not reportable by the provider. ${state}`;
  const venous = sample === 'capillary'
    ? 'If this capillary test was run in your office, draw a venous sample before the patient leaves.'
    : sample === 'venous' ? '' : 'If this was an in-office capillary test, draw a venous sample before the patient leaves.';
  return `${head} report a level of 3.5 or more to the NYC Health Department within 24 hours. ${venous}${venous ? ' ' : ''}Monitor until a level under 3.5 is obtained; the Department investigates at 3.5 or more. ${state}`;
}

function newYorkLine(level, sample) {
  const head = 'New York (10 NYCRR 67-1):';
  if (level < 5) return `${head} New York's elevated level is 5 or more, so this result is not elevated under the state rule${level >= REFERENCE_VALUE ? ', although it is at or above the CDC reference value' : ''}. ${NY_SCHEDULE}`;
  const followUp = 'Provide risk reduction education and nutritional counseling. Once a venous level of 5 or more confirms it, arrange a complete diagnostic evaluation (a lead exposure assessment, a nutritional assessment including iron status, and a developmental screening), treatment if needed, and referral to the local health unit for environmental management (67-1.2(a)(8), (a)(10)).';
  if (sample === 'venous') return `${head} a confirmed level of 5 or more is elevated. ${followUp} ${NY_SCHEDULE}`;
  const confirm = sample === 'capillary' ? 'Confirm this capillary result on a venous sample' : 'If this was capillary, confirm it on a venous sample';
  return `${head} 5 or more is elevated. ${confirm}; the rule sets no deadline for that (67-1.2(a)(9)). ${followUp} ${NY_SCHEDULE}`;
}

const TX_BANDS = [
  [45, 'within 48 hours', 'as soon as possible'],
  [20, 'within 1 to 2 weeks', 'at 2 weeks to 1 month'],
  [10, 'within 1 to 4 weeks', 'at 1 to 3 months'],
  [3.5, 'within 1 to 12 weeks (sooner the higher the result)', 'at 3 months'],
];

function texasLine(level, sample) {
  const head = 'Texas (DSHS form Pb-109, March 2024):';
  if (level < REFERENCE_VALUE) return `${head} below 3.5 no diagnostic venous test is needed; use the screening schedule (form Pb-120).`;
  const [, confirm, retest] = TX_BANDS.find(([min]) => level >= min);
  const investigation = level >= 20
    ? 'An environmental lead investigation is part of case management at a diagnostic venous level of 20 or more.'
    : 'An environmental lead investigation follows only if a venous level of 10 or more persists at least 12 weeks after the diagnostic test.';
  if (sample === 'venous') return `${head} if this is the diagnostic venous test, retest ${retest} for the first 2 to 4 tests. ${investigation}`;
  const lead = sample === 'capillary' ? 'Obtain a diagnostic venous test' : 'If this was capillary, obtain a diagnostic venous test';
  return `${head} ${lead} ${confirm}. ${investigation}`;
}

export function bloodLead(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const level = num(o.level);
  if (level === null) {
    return { valid: false, message: 'Enter the blood lead level in micrograms per deciliter.' };
  }
  if (level < 0 || level > 500) {
    return { valid: false, message: 'The blood lead level is outside a plausible range of 0 to 500 micrograms per deciliter.' };
  }

  const sample = o.sample === 'capillary' || o.sample === 'venous' ? o.sample : null;

  const atOrAbove = level >= REFERENCE_VALUE;
  const emergency = level >= EMERGENCY;
  const chelationRange = level >= CHELATION_CONSIDERED;

  const state = emergency
    ? `${level} micrograms per deciliter, a medical emergency`
    : chelationRange
      ? `${level} micrograms per deciliter, in the range where chelation is considered`
      : atOrAbove
        ? `${level} micrograms per deciliter, at or above the reference value of ${REFERENCE_VALUE}`
        : `${level} micrograms per deciliter, below the reference value of ${REFERENCE_VALUE}`;

  // The band the old line hides. This is the reason the tile exists.
  const loweredNote = atOrAbove && level < OLD_REFERENCE
    ? `A level of ${level} is at or above the reference value of ${REFERENCE_VALUE} and below the old line of ${OLD_REFERENCE}. Read against the value in use before 2021 this would have looked normal. That whole band is what the change was made to find.`
    : null;

  const notSafeNote = 'The reference value is not a safe level. It is the 97.5th percentile of the blood lead distribution among young children in the United States, which makes it a marker for identifying the children with more exposure than most. No level of lead in blood is known to be without effect.';

  const actionNote = emergency
    ? `A level of ${level} is at or above ${EMERGENCY} and is treated as a medical emergency. Contact the regional poison center and arrange care immediately.`
    : chelationRange
      ? `A level of ${level} is at or above ${CHELATION_CONSIDERED}, the level at which chelation is considered. That decision is made with a specialist, not from a number alone.`
      : atOrAbove
        ? 'At or above the reference value the response is to find and remove the source of the exposure. It is not a threshold for a drug.'
        : 'Below the reference value the response is still prevention: no level of lead in blood is known to be without effect, and a result below the value does not mean there is no exposure.';

  const capillaryNote = sample === 'capillary' && atOrAbove
    ? 'This is a capillary result. Lead on the skin contaminates a fingerstick, so an elevated capillary result is confirmed on a venous sample before it is acted on.'
    : sample === null && atOrAbove
      ? 'The sample type was not entered. An elevated capillary result is confirmed on a venous sample before it is acted on, because lead on the skin contaminates a fingerstick.'
      : null;

  const historyNote = 'The reference value has been lowered before, from 10 to 5 and then to 3.5 in 2021, and it falls as exposure in the population falls. Check that the value a result is being read against is the current one.';

  const scopeNote = 'This reads a result against the published reference value. It does not schedule confirmatory testing, choose a chelating agent, or replace the local health department, the regional poison center, or a lead program.';

  const caNote = o.state === 'CA' ? californiaLine(level, sample) : null;
  const nyNote = o.state === 'NY' ? newYorkLine(level, sample) : o.state === 'NYC' ? newYorkCityLine(level, sample) : null;
  const txNote = o.state === 'TX' ? texasLine(level, sample) : null;

  return {
    valid: true,
    level,
    sample,
    caNote,
    nyNote,
    txNote,
    referenceValue: REFERENCE_VALUE,
    atOrAbove,
    chelationRange,
    emergency,
    state,
    loweredNote,
    notSafeNote,
    actionNote,
    capillaryNote,
    historyNote,
    scopeNote,
    abnormal: atOrAbove,
    bandLabel: emergency ? 'Medical emergency' : chelationRange ? 'Chelation considered' : atOrAbove ? 'At or above the reference value' : 'Below the reference value',
    band: `Blood lead ${state}.`,
    detail: `The reference value is ${REFERENCE_VALUE} micrograms per deciliter, lowered from ${OLD_REFERENCE} in 2021. At or above it, the response is to find and remove the source. Chelation is considered at ${CHELATION_CONSIDERED} and above, and ${EMERGENCY} and above is a medical emergency.`,
    note: LEAD_NOTE,
  };
}
