// spec-v709: Opioid Risk Tool (ORT).
//
// A brief, sex-specific screen for the risk of aberrant drug-related behavior before starting
// long-term opioid therapy. Source:
//   Webster LR, Webster RM. Predicting aberrant behaviors in opioid-treated patients:
//   preliminary validation of the Opioid Risk Tool. Pain Med. 2005;6(6):432-442.
//   (PMID 16336480.)
//
// Points are SEX-SPECIFIC (Female / Male):
//   Family history of alcohol abuse .................. 1 / 3
//   Family history of illegal drug use ............... 2 / 3
//   Family history of prescription drug abuse ........ 4 / 4
//   Personal history of alcohol abuse ................ 3 / 3
//   Personal history of illegal drug use ............. 4 / 4
//   Personal history of prescription drug abuse ...... 5 / 5
//   Age 16-45 years .................................. 1 / 1
//   History of preadolescent sexual abuse ............ 3 / 0
//   Psychological disease: ADD/OCD/bipolar/schizophrenia . 2 / 2
//   Psychological disease: depression ................ 1 / 1
//
// Risk of future opioid-related aberrant behavior: 0-3 low; 4-7 moderate; >= 8 high.
//
// Pure: no DOM, no clock, no network.

export const ORT_NOTE = 'Opioid Risk Tool (ORT) (Webster LR, Webster RM, Pain Med 2005;6(6):432-442), a brief screen for the risk of aberrant drug-related behavior before starting long-term opioid therapy. Points are sex-specific. A family history of alcohol abuse adds 1 for women and 3 for men, illegal drug use 2 or 3, and prescription drug abuse 4 for both; a personal history of alcohol abuse adds 3, illegal drug use 4, and prescription drug abuse 5 for both; being aged 16 to 45 adds 1; a history of preadolescent sexual abuse adds 3 for women and 0 for men; attention-deficit, obsessive-compulsive, bipolar, or schizophrenia adds 2; and depression adds 1. The total maps to risk of future opioid aberrant behavior: 0 to 3 low, 4 to 7 moderate, and 8 or more high. It is a screening aid to guide monitoring intensity, not a reason to withhold appropriate pain treatment, and it supports rather than replaces clinical judgment.';

function truthy(v) { return v === true || v === 'true' || v === 1 || v === '1' || v === 'on' || v === 'yes'; }

// [femalePoints, malePoints]
const ITEMS = [
  { key: 'famAlcohol', pts: [1, 3], label: 'family hx alcohol' },
  { key: 'famIllegal', pts: [2, 3], label: 'family hx illegal drugs' },
  { key: 'famRx', pts: [4, 4], label: 'family hx prescription drugs' },
  { key: 'personalAlcohol', pts: [3, 3], label: 'personal hx alcohol' },
  { key: 'personalIllegal', pts: [4, 4], label: 'personal hx illegal drugs' },
  { key: 'personalRx', pts: [5, 5], label: 'personal hx prescription drugs' },
  { key: 'age16to45', pts: [1, 1], label: 'age 16-45' },
  { key: 'sexualAbuse', pts: [3, 0], label: 'preadolescent sexual abuse' },
  { key: 'psychAddBipolar', pts: [2, 2], label: 'ADD/OCD/bipolar/schizophrenia' },
  { key: 'psychDepression', pts: [1, 1], label: 'depression' },
];

function band(total) {
  if (total <= 3) return { tier: 'low', label: 'low risk' };
  if (total <= 7) return { tier: 'moderate', label: 'moderate risk' };
  return { tier: 'high', label: 'high risk' };
}

export function opioidRiskTool(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  if (!(o.sex === 'female' || o.sex === 'male')) {
    return { valid: false, code: 'MISSING_INPUT', field: 'sex', message: 'Select sex (points are sex-specific).', note: ORT_NOTE };
  }
  const idx = o.sex === 'female' ? 0 : 1;

  let total = 0;
  const factors = [];
  for (const it of ITEMS) {
    if (truthy(o[it.key])) {
      const p = it.pts[idx];
      if (p > 0) { total += p; factors.push(`${it.label} (${p})`); } else { factors.push(`${it.label} (0)`); }
    }
  }

  const b = band(total);
  return {
    valid: true,
    score: total,
    tier: b.tier,
    abnormal: total >= 8,
    factors,
    bandLabel: `ORT ${total}`,
    band: `ORT ${total} — ${b.label} of opioid aberrant behavior (0-3 low, 4-7 moderate, >= 8 high).`,
    detail: `${b.label} (${b.tier === 'high' ? 'score 8 or more' : (b.tier === 'moderate' ? 'score 4-7' : 'score 0-3')}). A screening aid to guide monitoring intensity, not a reason to withhold appropriate pain treatment.`,
    note: ORT_NOTE,
  };
}
