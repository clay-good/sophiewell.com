// spec-v712: MNA-SF (Mini Nutritional Assessment - Short Form).
//
// A six-item nutritional screen for older adults. Source:
//   Kaiser MJ, Bauer JM, Ramsch C, et al. Validation of the Mini Nutritional Assessment
//   Short-Form (MNA-SF): a practical tool for identification of nutritional status. J Nutr
//   Health Aging. 2009;13(9):782-788. (PMID 19812868.)
//
// Six items summed to a total of 0-14 (only neutral labels are used; the MNA is a Nestle
// trademark and its item wording is copyrighted):
//   A. Food-intake decline (3 mo):  severe 0 / moderate 1 / none 2
//   B. Weight loss (3 mo):          > 3 kg 0 / does not know 1 / 1-3 kg 2 / none 3
//   C. Mobility:                    bed/chair-bound 0 / out of bed but does not go out 1 / goes out 2
//   D. Psychological stress or acute disease in the past 3 months:  yes 0 / no 2
//   E. Neuropsychological problems: severe 0 / mild 1 / none 2
//   F. Body mass index (or calf circumference if BMI unavailable):
//        BMI < 19 or calf < 31 cm -> 0; BMI 19 to < 21 -> 1; BMI 21 to < 23 -> 2;
//        BMI >= 23 or calf >= 31 cm -> 3
//
// Bands: 12-14 normal nutritional status; 8-11 at risk of malnutrition; 0-7 malnourished.
//
// Pure: no DOM, no clock, no network.

export const MNA_SF_NOTE = 'MNA-SF, the Mini Nutritional Assessment Short Form (Kaiser MJ, Bauer JM, Ramsch C, et al, J Nutr Health Aging 2009;13(9):782-788), a six-item nutritional screen for older adults. Six items are summed to a total of 0 to 14: a decline in food intake over 3 months (severe 0, moderate 1, none 2), weight loss over 3 months (more than 3 kg 0, unknown 1, 1 to 3 kg 2, none 3), mobility (bed or chair bound 0, out of bed but does not go out 1, goes out 2), psychological stress or acute disease in the past 3 months (yes 0, no 2), neuropsychological problems (severe 0, mild 1, none 2), and body mass index (or calf circumference if BMI is unavailable): a BMI under 19 or calf under 31 cm scores 0, 19 to under 21 scores 1, 21 to under 23 scores 2, and 23 or more or a calf of 31 cm or more scores 3. A total of 12 to 14 is normal nutritional status, 8 to 11 is at risk of malnutrition, and 0 to 7 is malnourished. It is a screening aid to flag nutritional risk and prompt fuller assessment, not a diagnosis, and it supports rather than replaces clinical and dietetic judgment.';

function optIn(v, allowed) {
  if (v === '' || v === null || v === undefined) return null;
  const n = typeof v === 'number' ? v : Number(String(v).trim());
  if (!Number.isInteger(n) || !allowed.includes(n)) return null;
  return n;
}

const ITEMS = [
  { key: 'foodIntake', allowed: [0, 1, 2] },
  { key: 'weightLoss', allowed: [0, 1, 2, 3] },
  { key: 'mobility', allowed: [0, 1, 2] },
  { key: 'acuteStress', allowed: [0, 2] },
  { key: 'neuropsych', allowed: [0, 1, 2] },
  { key: 'bmiOrCalf', allowed: [0, 1, 2, 3] },
];

function band(total) {
  if (total >= 12) return { tier: 'normal', label: 'normal nutritional status' };
  if (total >= 8) return { tier: 'at-risk', label: 'at risk of malnutrition' };
  return { tier: 'malnourished', label: 'malnourished' };
}

export function mnaSf(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  let total = 0;
  for (const it of ITEMS) {
    const v = optIn(o[it.key], it.allowed);
    if (v === null) {
      return { valid: false, code: 'MISSING_INPUT', field: it.key, message: `Select a valid score for ${it.key}.`, note: MNA_SF_NOTE };
    }
    total += v;
  }

  const b = band(total);
  return {
    valid: true,
    score: total,
    tier: b.tier,
    abnormal: total <= 11,
    bandLabel: `MNA-SF ${total} of 14`,
    band: `MNA-SF ${total} of 14 — ${b.label} (12-14 normal, 8-11 at risk, 0-7 malnourished).`,
    detail: total >= 12
      ? 'Total 12-14: normal nutritional status by this screen.'
      : (total >= 8
        ? 'Total 8-11: at risk of malnutrition - consider a full nutritional assessment.'
        : 'Total 0-7: malnourished - arrange a full nutritional assessment and dietetic input.'),
    note: MNA_SF_NOTE,
  };
}
