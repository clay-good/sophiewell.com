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
// spec-v1641 row 18: those three figures are the Merck Manual's, re-read October 10, 2026,
// and each is the iron share of a formula mass, so the result shows the derivation and the
// hydrate it assumes (SALTS below). The dose is still computed from the Manual's figures.
//
// Toxicity thresholds (mg/kg elemental). The Merck Manual gives the 20 and 60 lines; the
// 150 line is StatPearls's, which could not be opened to re-read on October 10, 2026:
//   < 20   nontoxic / minimal
//   20-60  mild to moderate toxicity
//   > 60   severe / potentially serious toxicity
//   > 150  potentially lethal
//
// This is an advisory triage estimate — always involve Poison Control and use the serum
// iron level. Pure: no DOM, no clock, no network.

import { boundsAdvisory } from './bounds.js';

export const IRON_NOTE = 'Elemental iron ingested estimator (Merck Manual Professional, Iron Poisoning; StatPearls, Iron Toxicity, NBK459224). Only elemental iron is toxic, and iron salts differ in elemental content, so a reported ingestion must be converted: elemental iron (mg) = number of tablets x milligrams of iron salt per tablet x the percent elemental (ferrous sulfate 20 percent, ferrous gluconate 12 percent, ferrous fumarate 33 percent, as the Merck Manual prints them; each is the share of iron in the formula mass of the salt, for ferrous sulfate as the heptahydrate and ferrous gluconate as the dihydrate); the per-kilogram dose = elemental iron / body weight. Standard thresholds for the elemental dose are: under 20 mg/kg minimal or nontoxic, 20 to 60 mg/kg mild to moderate toxicity, over 60 mg/kg severe or potentially serious, and over 150 mg/kg potentially lethal. This is an advisory triage estimate based on the reported amount, which is often uncertain; it does not replace Poison Control, a measured serum iron level, or clinical assessment, and a reassuring estimate never rules out a serious ingestion.';

function pos(v) {
  if (v === '' || v === null || v === undefined) return NaN;
  return typeof v === 'number' ? v : Number(String(v).trim());
}

// Standard atomic weights (IUPAC, abridged), for the derivation shown beside the result.
const ATOMIC = { Fe: 55.845, S: 32.06, O: 15.999, H: 1.008, C: 12.011 };

// Fraction elemental iron by salt, as the Merck Manual prints it, with the formula that
// figure corresponds to. `atoms` counts the whole formula unit, waters included.
const SALTS = {
  'ferrous-sulfate': { fraction: 0.20, name: 'Ferrous sulfate', formula: 'FeSO4·7H2O, the heptahydrate', atoms: { Fe: 1, S: 1, O: 11, H: 14 } },
  'ferrous-gluconate': { fraction: 0.12, name: 'Ferrous gluconate', formula: 'C12H22FeO14·2H2O, the dihydrate', atoms: { C: 12, H: 26, Fe: 1, O: 16 } },
  'ferrous-fumarate': { fraction: 0.33, name: 'Ferrous fumarate', formula: 'C4H2FeO4', atoms: { C: 4, H: 2, Fe: 1, O: 4 } },
  'elemental': { fraction: 1.0 },
};

function formulaMass(atoms) {
  return Object.entries(atoms).reduce((sum, [el, n]) => sum + ATOMIC[el] * n, 0);
}

// Dried (exsiccated) ferrous sulfate, FeSO4·H2O: a different iron share from the same name.
const DRIED_SULFATE_PERCENT = Math.round((ATOMIC.Fe / formulaMass({ Fe: 1, S: 1, O: 5, H: 2 })) * 1000) / 10;

function derivation(salt) {
  if (!salt.atoms) return '';
  const mass = formulaMass(salt.atoms);
  const pct = Math.round((ATOMIC.Fe / mass) * 1000) / 10;
  const dried = salt.name === 'Ferrous sulfate'
    ? ` Dried ferrous sulfate (FeSO4·H2O) is ${DRIED_SULFATE_PERCENT}% iron: if the label says dried or gives the elemental iron, enter that as elemental iron instead.`
    : '';
  return ` ${salt.name} as ${salt.formula}: iron ${ATOMIC.Fe} ÷ formula mass ${mass.toFixed(2)} = ${pct}%, printed as ${Math.round(salt.fraction * 100)}% in the Merck Manual.${dried}`;
}

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
  const salt = Object.prototype.hasOwnProperty.call(SALTS, o.saltType) ? SALTS[o.saltType] : undefined;
  if (salt === undefined) {
    return { valid: false, code: 'MISSING_INPUT', field: 'saltType', message: 'Select the iron salt (ferrous sulfate / gluconate / fumarate, or elemental).', note: IRON_NOTE };
  }
  const weight = pos(o.weightKg);
  if (!Number.isFinite(weight) || weight <= 0) {
    return { valid: false, code: 'MISSING_INPUT', field: 'weightKg', message: 'Enter body weight in kg.', note: IRON_NOTE };
  }
  // spec-v1404: the weight envelope lib/bounds.js declares; a 5000 kg weight computed.
  const weightFault = boundsAdvisory('weightKg', weight);
  if (weightFault) return { valid: false, code: 'OUT_OF_RANGE', field: 'weightKg', message: weightFault, note: IRON_NOTE };

  const fraction = salt.fraction;
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
    detail: `${tablets} tablet(s) x ${mgPerTablet} mg salt x ${Math.round(fraction * 100)}% elemental = ${roundedMg} mg; / ${weight} kg = ${roundedDose} mg/kg. Thresholds: <20 minimal, 20-60 mild-moderate, >60 severe, >150 potentially lethal.${derivation(salt)}`,
    note: IRON_NOTE,
  };
}
