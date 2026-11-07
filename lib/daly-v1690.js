// spec-v1690 (closes spec-v1659 tool 9): DALYs as YLL + YLD, in the simplified form WHO uses.
//
// Source: WHO, "WHO methods and data sources for global burden of disease estimates 2000-2023",
// Global Health Estimates Technical Paper WHO/DSA/DDA/GHE/2026.3, September 2026, read November 7,
// 2026 from cdn.who.int (ghe2023_daly_methods.pdf):
//
//   Section 2: "DALYs for a specific cause are calculated as the sum of the YLLs from that cause and
//   the YLDs for people living in states of less than good health resulting from the specific cause:
//   DALY(c,s,a,t) = YLL(c,s,a,t) + YLD(c,s,a,t)".
//
//   Section 2, YLL: "YLL(c,s,a,t) = N(c,s,a,t) x L(s,a)", where N is the number of deaths due to the
//   cause at that age and sex, and "L(s,a) is a standard loss function specifying years of life lost
//   for a death at age a for sex s".
//
//   Section 2.1, the simplified DALY WHO adopted from GBD 2010: "Calculation of YLDs simply as the
//   prevalence of each sequela multiplied by the relevant disability weight", "Adjustment for
//   comorbidity in the calculation of YLDs", and "No discounting for time or unequal age weights".
//
//   Section 2.3 records why: the experts consulted for GBD 2010 "advised against discounting", and
//   with DALYs conceptualized as a measure of population health loss "it is difficult to justify the
//   inclusion of age weights".
//
//   Section 2.2 and Table 2.1: the loss function is normative, not local. It is "based on the
//   projected frontier life expectancy for 2050", with a life expectancy at birth of 92.7 years, and
//   is "intended to represent the potential maximum life span of an individual in good health at a
//   given age". The same table is used for both sexes in the WHO GHE column.
//
// A TYPOGRAPHICAL ERROR IN THE SOURCE TABLE, recorded rather than silently corrected. Table 2.1's
// WHO GHE cell for ages 75-79 is printed "17,19", with a comma where every other cell in the column
// uses a decimal point. 17.19 is the only reading consistent with the column, which falls
// monotonically (70-74 is 21.62 and 80-84 is 13.08), and with the GBD 2010 column beside it
// (16.78 / 12.85). It is entered here as 17.19 and this comment is the audit trail.
//
// WHAT THIS CANNOT DO, and says so on every result: WHO adjusts YLDs for independent comorbidity
// (section 2.1), which needs the whole sequela set for a population and cannot be done from one
// cause's prevalence. The YLD here is the unadjusted product, so a multi-sequela total built by
// adding these figures overstates the burden.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

// Table 2.1, the WHO GHE column: standard years of life lost for a death in each age range.
export const LOSS_FUNCTION = [
  { key: 'neonatal', label: 'Neonatal (under 28 days)', years: 92.65 },
  { key: 'postneonatal', label: 'Postneonatal (28 days to under 1 year)', years: 92.21 },
  { key: '1-4', label: '1 to 4 years', years: 89.74 },
  { key: '5-9', label: '5 to 9 years', years: 85.25 },
  { key: '10-14', label: '10 to 14 years', years: 80.26 },
  { key: '15-19', label: '15 to 19 years', years: 75.27 },
  { key: '20-24', label: '20 to 24 years', years: 70.28 },
  { key: '25-29', label: '25 to 29 years', years: 65.31 },
  { key: '30-34', label: '30 to 34 years', years: 60.34 },
  { key: '35-39', label: '35 to 39 years', years: 55.38 },
  { key: '40-44', label: '40 to 44 years', years: 50.43 },
  { key: '45-49', label: '45 to 49 years', years: 45.51 },
  { key: '50-54', label: '50 to 54 years', years: 40.61 },
  { key: '55-59', label: '55 to 59 years', years: 35.74 },
  { key: '60-64', label: '60 to 64 years', years: 30.92 },
  { key: '65-69', label: '65 to 69 years', years: 26.21 },
  { key: '70-74', label: '70 to 74 years', years: 21.62 },
  { key: '75-79', label: '75 to 79 years', years: 17.19 },
  { key: '80-84', label: '80 to 84 years', years: 13.08 },
  { key: '85+', label: '85 years and over', years: 7.28 },
];

export const AGE_RANGES = LOSS_FUNCTION.map((r) => ({ value: r.key, text: r.label }));

const byKey = new Map(LOSS_FUNCTION.map((r) => [r.key, r]));

const EDITION = 'WHO Global Health Estimates technical paper GHE/2026.3 (September 2026), covering 2000 to 2023';

const NOTE = `Simplified DALY: years of life lost plus years lived with disability, with no time discounting and no age weights, as ${EDITION} sets it out. The years lost for a death come from WHO's standard loss function, which is a normative maximum life span (life expectancy at birth 92.7 years in this edition), not the life expectancy where the death happened.`;

const COMORBIDITY_NOTE = 'WHO adjusts years lived with disability for independent comorbidity. That needs every sequela in the population, so it is not done here: this figure is prevalence times the disability weight, unadjusted, and adding several causes computed this way overstates the total.';

const loc = (n) => Number(n).toLocaleString('en-US', { maximumFractionDigits: 2 });
const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const round2 = (n) => Math.round(n * 100) / 100;

export function daly(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const deathsGiven = !blank(o.deaths);
  const casesGiven = !blank(o.prevalentCases);
  if (!deathsGiven && !casesGiven) {
    return {
      valid: false,
      message: 'Enter the deaths from this cause, the people living with it, or both. A DALY is the two added, '
        + 'and a blank half is not a zero: leaving deaths blank reports the disability side only, and the result says so.',
    };
  }

  // --- YLL: deaths x the standard loss function for the age at death -------
  let yll = 0;
  let lossYears = null;
  let ageLabel = null;
  if (deathsGiven) {
    const f = inputFault([['the deaths from this cause', o.deaths, 0, 1000000000, '']]);
    if (f) return { valid: false, message: f };
    const row = byKey.get(String(o.ageRange ?? '').trim());
    if (!row) {
      return {
        valid: false,
        message: 'Choose the age range the deaths fall in. The years lost for a death depend on the age at death, '
          + "so there is no DALY without it (WHO's standard loss function runs from 92.65 years for a neonatal death to 7.28 at 85 and over).",
      };
    }
    yll = Number(String(o.deaths).trim()) * row.years;
    lossYears = row.years;
    ageLabel = row.label;
  }

  // --- YLD: prevalence x disability weight (the simplified, prevalence form)
  let yld = 0;
  let weight = null;
  if (casesGiven) {
    const f = inputFault([
      ['the people living with this cause', o.prevalentCases, 0, 1000000000, ''],
      ['the disability weight', o.disabilityWeight, 0, 1, ''],
    ]);
    if (f) return { valid: false, message: f };
    weight = Number(String(o.disabilityWeight).trim());
    yld = Number(String(o.prevalentCases).trim()) * weight;
  }

  const total = yll + yld;
  const notes = [];
  if (deathsGiven) {
    notes.push(`Years of life lost: ${loc(round2(yll))} (${loc(Number(String(o.deaths).trim()))} deaths x ${lossYears} standard years for a death at ${ageLabel.toLowerCase()}).`);
  } else {
    notes.push('No deaths were entered, so this is the disability side only and not the full burden of the cause.');
  }
  if (casesGiven) {
    notes.push(`Years lived with disability: ${loc(round2(yld))} (${loc(Number(String(o.prevalentCases).trim()))} people x a disability weight of ${weight}).`);
    notes.push(COMORBIDITY_NOTE);
  } else {
    notes.push('No people living with the cause were entered, so this is the fatal side only; a cause with a long non-fatal course loses most of its burden that way.');
  }
  notes.push('Figures from this edition are not directly comparable with earlier WHO DALY estimates, which used a 3% discount rate and age weights, and an incidence rather than prevalence basis for the disability side.');

  return {
    valid: true,
    daly: round2(total),
    yll: round2(yll),
    yld: round2(yld),
    lossYears,
    disabilityWeight: weight,
    abnormal: false,
    band: `${loc(round2(total))} DALYs: ${loc(round2(yll))} years of life lost plus ${loc(round2(yld))} years lived with disability.`,
    bandLabel: `${loc(round2(total))} DALYs`,
    notes,
    note: NOTE,
  };
}
