// spec-v687: Elemental iron ingested — toxic-dose estimator.
//
// Converts a reported iron-salt ingestion into milligrams of ELEMENTAL iron and a per-kg
// dose, then places it against the standard toxicity thresholds. Only elemental iron is
// toxic, and iron salts differ widely in elemental content, so this conversion is the step
// people most often get wrong. Sources: Merck Manual Professional (Iron Poisoning);
// StatPearls, Iron Toxicity (NBK459224).
//
//   elemental iron (mg) = tablets x mg of iron salt per tablet x (percent elemental / 100)
//   dose (mg/kg)        = elemental iron (mg) / body weight (kg)
//
// Elemental-iron content by salt: ferrous sulfate 20%, ferrous gluconate 12%,
// ferrous fumarate 33% (an "elemental" option treats the entered mg as already elemental).
//
// Toxicity thresholds (mg/kg elemental; Merck + StatPearls agree):
//   < 20   nontoxic / minimal
//   20-60  mild to moderate toxicity
//   > 60   severe / potentially serious toxicity
//   > 150  potentially lethal
//
// This is an advisory triage estimate — always involve Poison Control and use the serum
// iron level. Pure: no DOM, no clock, no network.

export const IRON_NOTE = 'Elemental iron ingested estimator (Merck Manual Professional, Iron Poisoning; StatPearls, Iron Toxicity, NBK459224). Only elemental iron is toxic, and iron salts differ in elemental content, so a reported ingestion must be converted: elemental iron (mg) = number of tablets x milligrams of iron salt per tablet x the percent elemental (ferrous sulfate 20 percent, ferrous gluconate 12 percent, ferrous fumarate 33 percent); the per-kilogram dose = elemental iron / body weight. Standard thresholds for the elemental dose are: under 20 mg/kg minimal or nontoxic, 20 to 60 mg/kg mild to moderate toxicity, over 60 mg/kg severe or potentially serious, and over 150 mg/kg potentially lethal. This is an advisory triage estimate based on the reported amount, which is often uncertain; it does not replace Poison Control, a measured serum iron level, or clinical assessment, and a reassuring estimate never rules out a serious ingestion.';

function pos(v) {
  if (v === '' || v === null || v === undefined) return NaN;
  return typeof v === 'number' ? v : Number(String(v).trim());
}

// Fraction elemental iron by salt.
const SALT_FRACTION = {
  'ferrous-sulfate': 0.20,
  'ferrous-gluconate': 0.12,
  'ferrous-fumarate': 0.33,
  'elemental': 1.0,
};

function band(mgkg) {
  if (mgkg < 20) return { tier: 'minimal', label: 'minimal / nontoxic' };
  if (mgkg <= 60) return { tier: 'mild-moderate', label: 'mild to moderate toxicity' };
  if (mgkg <= 150) return { tier: 'severe', label: 'severe / potentially serious toxicity' };
  return { tier: 'lethal', label: 'potentially lethal' };
}

export function elementalIronIngested(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const tablets = pos(o.tablets);
  if (!Number.isFinite(tablets) || tablets <= 0) {
    return { valid: false, code: 'MISSING_INPUT', field: 'tablets', message: 'Enter the number of tablets ingested.', note: IRON_NOTE };
  }
  const mgPerTablet = pos(o.mgPerTablet);
  if (!Number.isFinite(mgPerTablet) || mgPerTablet <= 0) {
    return { valid: false, code: 'MISSING_INPUT', field: 'mgPerTablet', message: 'Enter the mg of iron salt per tablet.', note: IRON_NOTE };
  }
  const fraction = SALT_FRACTION[o.saltType];
  if (fraction === undefined) {
    return { valid: false, code: 'MISSING_INPUT', field: 'saltType', message: 'Select the iron salt (ferrous sulfate / gluconate / fumarate, or elemental).', note: IRON_NOTE };
  }
  const weight = pos(o.weightKg);
  if (!Number.isFinite(weight) || weight <= 0) {
    return { valid: false, code: 'MISSING_INPUT', field: 'weightKg', message: 'Enter body weight in kg.', note: IRON_NOTE };
  }

  const elementalMg = tablets * mgPerTablet * fraction;
  const mgkg = elementalMg / weight;
  const roundedMg = Math.round(elementalMg);
  const roundedDose = Math.round(mgkg * 10) / 10;
  const b = band(mgkg);

  return {
    valid: true,
    elementalMg: roundedMg,
    dosePerKg: roundedDose,
    tier: b.tier,
    abnormal: mgkg > 60,
    bandLabel: `${roundedDose} mg/kg elemental iron`,
    band: `Elemental iron ${roundedMg} mg; ${roundedDose} mg/kg — ${b.label}.`,
    detail: `${tablets} tablet(s) x ${mgPerTablet} mg salt x ${Math.round(fraction * 100)}% elemental = ${roundedMg} mg; / ${weight} kg = ${roundedDose} mg/kg. Thresholds: <20 minimal, 20-60 mild-moderate, >60 severe, >150 potentially lethal.`,
    note: IRON_NOTE,
  };
}
