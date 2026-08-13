// spec-v711: AUSDRISK (Australian Type 2 Diabetes Risk Assessment Tool).
//
// Estimates the 5-year risk of developing type 2 diabetes. Source:
//   Chen L, Magliano DJ, Balkau B, et al. AUSDRISK: an Australian Type 2 Diabetes Risk
//   Assessment Tool. Med J Aust. 2010;192(4):197-202. Point table per the Australian
//   Government Department of Health AUSDRISK handout.
//
// Total 0-35, summed from:
//   Age:               < 35 -> 0, 35-44 -> 2, 45-54 -> 4, 55-64 -> 6, >= 65 -> 8
//   Sex:               female 0, male 3
//   Aboriginal/Torres Strait Islander/Pacific Islander/Maori descent:  no 0, yes 2
//   Born in Asia (incl. subcontinent), Middle East, North Africa, or Southern Europe:  no 0, yes 2
//   Family history of diabetes (parent or sibling):  no 0, yes 3
//   Ever found to have high blood glucose:           no 0, yes 6
//   On antihypertensive medication:                  no 0, yes 2
//   Current daily smoker:                            no 0, yes 2
//   Does NOT eat vegetables/fruit every day:         +1
//   Less than 2.5 h physical activity per week:      +2
//   Waist circumference (cm), ethnicity- and sex-specific bands (see below).
//
// Waist bands (points 0 / 4 / 7):
//   Asian or Aboriginal/TSI descent -- Men: < 90 / 90-100 / > 100;  Women: < 80 / 80-90 / > 90
//   All others -------------------- Men: < 102 / 102-110 / > 110;  Women: < 88 / 88-100 / > 100
//
// Risk tiers (Australian Government three-tier): <= 5 low; 6-14 intermediate; >= 15 high.
//
// Pure: no DOM, no clock, no network.

export const AUSDRISK_NOTE = 'AUSDRISK, the Australian Type 2 Diabetes Risk Assessment Tool (Chen L, Magliano DJ, Balkau B, et al, Med J Aust 2010;192(4):197-202), estimates the 5-year risk of developing type 2 diabetes. Points are summed to a total of 0 to 35 from age (under 35 scores 0, then 2, 4, 6, and 8 for older bands), sex (male adds 3), Aboriginal, Torres Strait Islander, Pacific Islander or Maori descent (adds 2), being born in Asia, the Middle East, North Africa or Southern Europe (adds 2), a family history of diabetes in a parent or sibling (adds 3), ever having had high blood glucose (adds 6), taking blood-pressure medication (adds 2), being a current daily smoker (adds 2), not eating vegetables and fruit every day (adds 1), doing less than 2.5 hours of physical activity per week (adds 2), and waist circumference scored 0, 4, or 7 using ethnicity- and sex-specific bands. A total of 5 or less is low risk, 6 to 14 is intermediate risk and worth discussing with a doctor, and 15 or more is high risk and warrants a fasting blood glucose test. It is a screening estimate of future risk, not a diagnosis of diabetes, and it supports rather than replaces clinical judgment and confirmatory testing.';

function num(v) {
  if (v === '' || v === null || v === undefined) return NaN;
  return typeof v === 'number' ? v : Number(String(v).trim());
}
function truthy(v) { return v === true || v === 'true' || v === 1 || v === '1' || v === 'on' || v === 'yes'; }

function waistPoints(cm, sex, lowerThreshold) {
  // lowerThreshold true = Asian / Aboriginal / TSI band set.
  if (sex === 'male') {
    if (lowerThreshold) return cm < 90 ? 0 : (cm <= 100 ? 4 : 7);
    return cm < 102 ? 0 : (cm <= 110 ? 4 : 7);
  }
  if (lowerThreshold) return cm < 80 ? 0 : (cm <= 90 ? 4 : 7);
  return cm < 88 ? 0 : (cm <= 100 ? 4 : 7);
}

function band(total) {
  if (total <= 5) return { tier: 'low', label: 'low risk' };
  if (total <= 14) return { tier: 'intermediate', label: 'intermediate risk' };
  return { tier: 'high', label: 'high risk' };
}

export function ausdrisk(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const age = num(o.agePoints);
  if (!Number.isFinite(age) || ![0, 2, 4, 6, 8].includes(age)) {
    return { valid: false, code: 'MISSING_INPUT', field: 'agePoints', message: 'Select the age band.', note: AUSDRISK_NOTE };
  }
  if (!(o.sex === 'female' || o.sex === 'male')) {
    return { valid: false, code: 'MISSING_INPUT', field: 'sex', message: 'Select sex.', note: AUSDRISK_NOTE };
  }
  const waist = num(o.waist);
  if (!Number.isFinite(waist) || waist <= 0 || waist > 250) {
    return { valid: false, code: 'MISSING_INPUT', field: 'waist', message: 'Enter the waist circumference in cm.', note: AUSDRISK_NOTE };
  }

  let total = age;
  if (o.sex === 'male') total += 3;
  if (truthy(o.indigenousOrPacific)) total += 2;
  if (truthy(o.highRiskBirthplace)) total += 2;
  if (truthy(o.familyHistory)) total += 3;
  if (truthy(o.everHighGlucose)) total += 6;
  if (truthy(o.antihypertensive)) total += 2;
  if (truthy(o.smoker)) total += 2;
  if (truthy(o.lowVegFruit)) total += 1;
  if (truthy(o.lowActivity)) total += 2;

  const wp = waistPoints(waist, o.sex, truthy(o.asianOrIndigenousWaist));
  total += wp;

  const b = band(total);
  return {
    valid: true,
    score: total,
    tier: b.tier,
    abnormal: total >= 15,
    waistPoints: wp,
    bandLabel: `AUSDRISK ${total} of 35`,
    band: `AUSDRISK ${total} of 35 — ${b.label} (<= 5 low, 6-14 intermediate, >= 15 high).`,
    detail: `Waist added ${wp} point${wp === 1 ? '' : 's'}. High risk (>= 15) warrants a fasting blood glucose test; intermediate (6-14) is worth discussing with a doctor.`,
    note: AUSDRISK_NOTE,
  };
}
