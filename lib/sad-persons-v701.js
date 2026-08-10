// spec-v701: SAD PERSONS scale for suicide risk.
//
// A mnemonic 10-item screen for suicide risk. Source:
//   Patterson WM, Dohn HH, Bird J, Patterson GA. Evaluation of suicidal patients: the SAD
//   PERSONS scale. Psychosomatics. 1983;24(4):343-345,348-349. (PMID 6867245.)
//
// Ten items, each present = 1 point (total 0-10):
//   S - male Sex
//   A - Age < 19 or > 45 years
//   D - Depression
//   P - Previous suicide attempt
//   E - Excess alcohol or substance use (Ethanol)
//   R - Rational thinking loss (psychosis or organic illness)
//   S - Social supports lacking
//   O - Organized plan
//   N - No spouse / partner (single, widowed, or divorced)
//   S - Sickness (chronic or serious illness)
//
// Numeric risk bands: 0-4 lower, 5-6 moderate, 7-10 high. An action guide (original): 0-2
// send home with follow-up; 3-4 close follow-up, consider admission; 5-6 strongly consider
// admission; 7-10 hospitalize or commit. IMPORTANT: SAD PERSONS has LOW sensitivity and must
// be used as a screen to prompt a full risk assessment, never to rule out risk or to justify
// discharge on its own.
//
// Pure: no DOM, no clock, no network.

export const SAD_PERSONS_NOTE = 'SAD PERSONS scale for suicide risk (Patterson WM, Dohn HH, Bird J, Patterson GA, Psychosomatics 1983;24(4):343-345). A mnemonic 10-item screen adding one point each for male sex, age under 19 or over 45, depression, a previous suicide attempt, excess alcohol or substance use, rational-thinking loss (psychosis or organic illness), lacking social supports, an organized plan, no spouse or partner, and serious sickness, for a total of 0 to 10. Numeric bands are 0 to 4 lower, 5 to 6 moderate, and 7 to 10 high risk; the original action guide sends 0 to 2 home with follow-up, arranges close follow-up and considers admission at 3 to 4, strongly considers admission at 5 to 6, and hospitalizes at 7 to 10. Critically, SAD PERSONS has low sensitivity and should be used only to prompt a full clinical suicide-risk assessment, never to rule out risk or to justify discharge on its own; any acute concern warrants urgent psychiatric evaluation regardless of the score. It supports rather than replaces clinical judgment.';

function truthy(v) { return v === true || v === 'true' || v === 1 || v === '1' || v === 'on' || v === 'yes'; }

const ITEMS = [
  { key: 'maleSex', label: 'male sex' },
  { key: 'ageRisk', label: 'age <19 or >45' },
  { key: 'depression', label: 'depression' },
  { key: 'previousAttempt', label: 'previous attempt' },
  { key: 'substanceUse', label: 'excess alcohol/substance use' },
  { key: 'rationalThinkingLoss', label: 'rational thinking loss' },
  { key: 'lackingSupports', label: 'social supports lacking' },
  { key: 'organizedPlan', label: 'organized plan' },
  { key: 'noSpouse', label: 'no spouse/partner' },
  { key: 'sickness', label: 'serious sickness' },
];

function band(total) {
  if (total <= 4) return { tier: 'lower', label: 'lower risk' };
  if (total <= 6) return { tier: 'moderate', label: 'moderate risk' };
  return { tier: 'high', label: 'high risk' };
}

export function sadPersons(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  let total = 0;
  const factors = [];
  for (const it of ITEMS) {
    if (truthy(o[it.key])) { total += 1; factors.push(it.label); }
  }

  const b = band(total);
  return {
    valid: true,
    score: total,
    tier: b.tier,
    // Flag moderate or higher (>= 5); but the note stresses any acute concern overrides the score.
    abnormal: total >= 5,
    factors,
    bandLabel: `SAD PERSONS ${total} of 10`,
    band: `SAD PERSONS ${total} of 10 — ${b.label} (a screen, not a rule-out).`,
    detail: 'Bands: 0-4 lower, 5-6 moderate, 7-10 high. SAD PERSONS has low sensitivity: use it to prompt a full suicide-risk assessment, never to rule out risk or justify discharge. Any acute concern warrants urgent psychiatric evaluation regardless of the score.',
    note: SAD_PERSONS_NOTE,
  };
}
