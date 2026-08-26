// spec-v779: Schofield equations for basal metabolic rate.
//
// Source:
//   Schofield WN. Predicting basal metabolic rate, new standards and review of
//   previous work. Hum Nutr Clin Nutr. 1985;39 Suppl 1:5-41. (PMID 4044297.)
//   Adopted as the FAO/WHO/UNU reference standard and the equation set most UK
//   dietetic practice starts from.
//
// Weight-only form, kcal/day, W = weight in kilograms:
//
//   Age band   Male                     Female
//   under 3    59.512 x W - 30.4        58.317 x W - 31.1
//   3 to 10    22.706 x W + 504.3       20.315 x W + 485.9
//   10 to 18   17.686 x W + 658.2       13.384 x W + 692.6
//   18 to 30   15.057 x W + 692.2       14.818 x W + 486.6
//   30 to 60   11.472 x W + 873.1        8.126 x W + 845.6
//   over 60    11.711 x W + 587.7        9.082 x W + 658.5
//
// Bands are closed at the bottom and open at the top, so an age of exactly 30
// uses the 30-to-60 equation.
//
// This is BASAL metabolic rate. Activity, stress and injury factors are applied
// to it by the dietitian; the tile does not apply any.
//
// Pure: no DOM, no clock, no network.

export const SCHOFIELD_NOTE = 'The Schofield equations (Schofield WN, Hum Nutr Clin Nutr 1985;39 Suppl 1:5-41) predict basal metabolic rate from body weight, using a different coefficient and constant for each sex and each of six age bands: under 3, 3 to 10, 10 to 18, 18 to 30, 30 to 60, and over 60 years. They are the FAO, WHO and UNU reference standard and the starting point for most UK dietetic practice, and unlike Mifflin-St Jeor or Harris-Benedict they need only weight, age and sex, with no height. The result is a basal rate: activity, stress and injury factors are applied to it by the dietitian, and this tile applies none of them. It is a regression estimate with a known error against indirect calorimetry, not a measured value, and the energy prescription stays with the dietitian and local protocol.';

const BANDS = [
  { min: 0, max: 3, label: 'under 3 years', male: [59.512, -30.4], female: [58.317, -31.1] },
  { min: 3, max: 10, label: '3 to 10 years', male: [22.706, 504.3], female: [20.315, 485.9] },
  { min: 10, max: 18, label: '10 to 18 years', male: [17.686, 658.2], female: [13.384, 692.6] },
  { min: 18, max: 30, label: '18 to 30 years', male: [15.057, 692.2], female: [14.818, 486.6] },
  { min: 30, max: 60, label: '30 to 60 years', male: [11.472, 873.1], female: [8.126, 845.6] },
  { min: 60, max: Infinity, label: 'over 60 years', male: [11.711, 587.7], female: [9.082, 658.5] },
];

export function schofield(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const weight = o.weight === '' || o.weight === null || o.weight === undefined ? null : Number(o.weight);
  const age = o.age === '' || o.age === null || o.age === undefined ? null : Number(o.age);
  const sex = o.sex === undefined || o.sex === null ? '' : String(o.sex).trim();

  if (weight === null || !Number.isFinite(weight) || weight <= 0) {
    return { valid: false, code: 'MISSING_INPUT', field: 'weight', message: 'Enter a weight above zero.', note: SCHOFIELD_NOTE };
  }
  if (age === null || !Number.isFinite(age) || age < 0 || age > 120) {
    return { valid: false, code: 'MISSING_INPUT', field: 'age', message: 'Enter an age from 0 to 120 years.', note: SCHOFIELD_NOTE };
  }
  if (sex !== 'male' && sex !== 'female') {
    return { valid: false, code: 'MISSING_INPUT', field: 'sex', message: 'Choose male or female - the coefficients differ.', note: SCHOFIELD_NOTE };
  }

  const band = BANDS.find((b) => age >= b.min && age < b.max);
  const [coefficient, constant] = band[sex];
  const bmr = Math.round(coefficient * weight + constant);

  return {
    valid: true,
    bmr,
    band: `Schofield BMR ${bmr} kcal/day — ${sex}, ${band.label}: ${coefficient} x weight ${constant < 0 ? '-' : '+'} ${Math.abs(constant)}.`,
    bandLabel: `Schofield BMR ${bmr} kcal/day`,
    ageBand: band.label,
    coefficient,
    constant,
    abnormal: false,
    detail: `Weight ${weight} kg at age ${age} years selects the ${band.label} ${sex} equation. Bands are closed at the bottom and open at the top, so an age of exactly 30 uses the 30-to-60 equation. This is the basal rate; activity, stress and injury factors are applied to it separately.`,
    note: SCHOFIELD_NOTE,
  };
}
