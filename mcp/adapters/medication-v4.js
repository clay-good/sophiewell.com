// spec-v183 MCP wave 54: adapters for lib/medication-v4.js - the medication
// reference computes: steroid / benzodiazepine equivalents, renal antibiotic
// dosing, vasopressor rate math, TPN macronutrients, and the AGS Beers
// screen. The equivalence / dosing tables are read from the same data/ JSON
// shards the site ships (single source of truth - never re-typed here).

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import * as F from '../../lib/medication-v4.js';
import * as AB from '../../lib/abx-renal-v1632.js';
import { PARTD_MME_THRESHOLDS } from '../../lib/partd-opioid-safety-edit-v1638.js';

// The equivalence / renal-dosing tables are the exact data/ shards the website
// ships (single source of truth, spec-v183 §1.2 - never re-typed here). Reading
// JSON is pure and DOM-free, so it satisfies the bare-Node adapter contract.
const DATA = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'data');
const readJson = (rel) => JSON.parse(readFileSync(join(DATA, rel), 'utf8'));
const STEROID = readJson('steroid-equiv/steroid.json');
const BENZO = readJson('benzo-equiv/benzo.json');
const MME = readJson('mme-factors/mme.json');
const VASO = readJson('vasopressor-doses/vasopressors.json');
const VASO_UNITS = new Map(VASO.map((r) => [r.drug, r.units]));

// Only rows with a numeric equivDoseMg are convertible (fludrocortisone carries
// a text mineralocorticoid note, not a glucocorticoid equivalence).
const STEROID_DRUGS = STEROID.filter((r) => typeof r.equivDoseMg === 'number').map((r) => r.drug);
const BENZO_DRUGS = BENZO.map((r) => r.drug);

export default [
  {
    id: 'steroid-equiv',
    summary: 'Glucocorticoid equipotency conversion (anti-inflammatory potency table): converts a dose of one systemic corticosteroid to the equivalent mg of another.',
    compute: (a) => {
      const equivalentMg = F.steroidEquivalent({ drug: a.drug, doseMg: a.doseMg, target: a.target, table: STEROID });
      return equivalentMg == null ? null : { inputMg: a.doseMg, fromDrug: a.drug, toDrug: a.target, equivalentMg };
    },
    fields: [
      { dom: 'st-dose', arg: 'doseMg', kind: 'number', required: true, label: 'Dose', unit: 'mg' },
      { dom: 'st-from', arg: 'drug', kind: 'enum', values: STEROID_DRUGS, required: true, label: 'From steroid' },
      { dom: 'st-to', arg: 'target', kind: 'enum', values: STEROID_DRUGS, required: true, label: 'To steroid' },
    ],
  },
  {
    id: 'benzo-equiv',
    summary: 'Benzodiazepine equivalence (Ashton manual approximate diazepam-equivalent table): converts a dose of one benzodiazepine to the equivalent mg of another.',
    compute: (a) => {
      const equivalentMg = F.benzoEquivalent({ drug: a.drug, doseMg: a.doseMg, target: a.target, table: BENZO });
      return equivalentMg == null ? null : { inputMg: a.doseMg, fromDrug: a.drug, toDrug: a.target, equivalentMg };
    },
    fields: [
      { dom: 'bz-dose', arg: 'doseMg', kind: 'number', required: true, label: 'Dose', unit: 'mg' },
      { dom: 'bz-from', arg: 'drug', kind: 'enum', values: BENZO_DRUGS, required: true, label: 'From benzodiazepine' },
      { dom: 'bz-to', arg: 'target', kind: 'enum', values: BENZO_DRUGS, required: true, label: 'To benzodiazepine' },
    ],
  },
  {
    id: 'abx-renal',
    summary: 'Antibiotic dose by kidney function, read from the renal table of 22 FDA labels (cefepime, piperacillin-tazobactam, vancomycin, ciprofloxacin, meropenem, levofloxacin, trimethoprim-sulfamethoxazole, nitrofurantoin, daptomycin, ertapenem, cefazolin, ampicillin-sulbactam, ceftazidime, imipenem, aztreonam, ceftaroline, amoxicillin, amoxicillin-clavulanate, cephalexin, colistimethate, fluconazole). It reports the label row for the creatinine clearance entered, or the label line for hemodialysis or peritoneal dialysis. It recommends nothing.',
    // spec-v1632: the rows moved from data/abx-renal to lib/abx-renal-v1632.js on the shared band
    // engine. Nothing is defaulted: the regimen and the dialysis answer are asked for.
    compute: (a) => AB.abxRenal({ regimen: a.drug, dialysis: a.dialysis, kidney: a.crCl }),
    fields: [
      { dom: 'abx-drug', arg: 'drug', kind: 'enum', values: AB.REGIMENS.map((r) => r.value), required: true, label: 'Antibiotic and usual dose' },
      { dom: 'abx-dialysis', arg: 'dialysis', kind: 'enum', values: AB.DIALYSIS.map((d) => d.value), required: true, label: 'Dialysis: none, hd or pd' },
      { dom: 'abx-crcl', arg: 'crCl', kind: 'number', label: 'Creatinine clearance (not used on dialysis)', unit: 'mL/min' },
    ],
  },
  {
    id: 'tpn-macro',
    summary: 'Total parenteral nutrition macronutrients: grams and kcal of dextrose (3.4 kcal/g), amino acids (4 kcal/g), and lipid by product (2 kcal/mL for the 20% emulsions, 3 for Intralipid 30%, 1.12 for Omegaven; each from its FDA label) from the final volume and percentages, with total kcal.',
    compute: F.tpnMacro,
    fields: [
      { dom: 'tpn-vol', arg: 'volumeMl', kind: 'number', required: true, label: 'Final volume', unit: 'mL' },
      { dom: 'tpn-d', arg: 'dextrosePct', kind: 'number', required: true, label: 'Dextrose (% final)', to: (v) => v || 0 },
      { dom: 'tpn-aa', arg: 'aminoAcidPct', kind: 'number', required: true, label: 'Amino acid (% final)', to: (v) => v || 0 },
      { dom: 'tpn-lipid', arg: 'lipidPctOfVolume', kind: 'number', required: true, label: 'Lipid emulsion (mL as % of final volume)', to: (v) => v || 0 },
      { dom: 'tpn-product', arg: 'lipidProduct', kind: 'enum', values: ['lipid-20', 'intralipid-30', 'omegaven'], required: false, label: 'Lipid product (default: a 20% emulsion)' },
    ],
  },
  {
    id: 'beers-check',
    summary: 'AGS Beers Criteria (2023) screen: flags potentially inappropriate medications, drug-disease and drug-drug interactions for an adult >= 65 from a checked medication and comorbidity list.',
    // Rebuild the medications[] / comorbidities[] arrays from the flat per-item
    // booleans (the drug-burden-index array-rebuild precedent). The key sets are
    // read from the lib's own BEERS_PIM / BEERS_DISEASE tables so the input
    // schema can never drift from the model.
    compute: (a) => F.beersCheck({
      ageYears: a.ageYears,
      medications: Object.keys(F.BEERS_PIM).filter((k) => a[`med:${k}`]),
      comorbidities: Object.keys(F.BEERS_DISEASE).filter((k) => a[`dz:${k}`]),
    }),
    fields: [
      { dom: 'bc-age', arg: 'ageYears', kind: 'number', required: true, label: 'Age', unit: 'years' },
      ...Object.keys(F.BEERS_PIM).map((k) => ({ dom: `bc-m-${k}`, arg: `med:${k}`, kind: 'bool', required: false, label: F.BEERS_PIM[k].label || k })),
      ...Object.keys(F.BEERS_DISEASE).map((k) => ({ dom: `bc-c-${k}`, arg: `dz:${k}`, kind: 'bool', required: false, label: k })),
    ],
  },
  {
    id: 'opioid-mme',
    // Single-medication MME (the browser tile sums multiple rows); the CDC 2022
    // conversion factors are read from the shipped data shard (single source of
    // truth). The compute echoes the CDC 50 / 90 MME/day breakpoints so they
    // appear in the JSON alongside the total.
    summary: 'CDC 2022 opioid morphine-milligram-equivalents (MME): daily MME = mg per dose x doses per day x the drug conversion factor. Reference only (not a prescription), with the CDC 2022 action at 50 MME/day or more (added precautions, more frequent follow-up, offer naloxone and overdose prevention education). The 90 MME/day line belonged to the 2016 guideline; 2022 sets none.',
    compute: (a) => {
      const r = F.mmeTotal({ rows: [{ drug: a.drug, mgPerDose: a.mgPerDose, dosesPerDay: a.dosesPerDay }], factors: MME });
      return { ...r, cdcReassessThreshold: 50, cdcJustifyThreshold: 90, ...(r.totalMme >= 90 ? { partDThresholds: PARTD_MME_THRESHOLDS } : {}) };
    },
    fields: [
      // The tile is a repeatable row builder; these are row one, which is the
      // row it opens with. The ids used to be written without the row, so the
      // worked example filled nothing and the tile rendered no total.
      { dom: 'mme-row-1-drug', arg: 'drug', kind: 'enum', values: MME.map((f) => f.drug), required: true, label: 'Opioid' },
      { dom: 'mme-row-1-mg', arg: 'mgPerDose', kind: 'number', required: true, label: 'mg per dose' },
      { dom: 'mme-row-1-n', arg: 'dosesPerDay', kind: 'number', required: true, label: 'Doses per day' },
    ],
  },
  {
    id: 'vasopressor',
    // Bidirectional dose <-> pump-rate conversion (matching the browser tile):
    // give a dose to get mL/hr, and/or a rate to get the dose back. The drug's
    // dosing units come from the shipped vasopressor shard; vasopressin's
    // "units/min" is treated as mcg/min for the rate math, exactly as the
    // renderer does. mcg/kg/min drugs (dopamine, dobutamine) require a weight
    // (the compute throws a clear error without one).
    summary: 'Vasopressor infusion dose <-> pump-rate conversion: mL/hr = (dose in ug/min / concentration in ug/mL) x 60 (a mcg/kg/min dose is first multiplied by weight); the reverse gives the dose from a pump rate. Drug dosing units come from the vasopressor table. A math aid, not an infusion order.',
    compute: (a) => {
      const rawUnits = VASO_UNITS.get(a.drug);
      const units = rawUnits === 'units/min' ? 'mcg/min' : rawUnits;
      // spec-v931: a bag concentration is a mass per volume, and neither is negative. The dose
      // and rate below are already gated on `> 0`; the concentration was echoed back unchecked.
      if (!(a.concUgPerMl > 0)) return null;
      const out = { drug: a.drug, doseUnits: rawUnits, concUgPerMl: a.concUgPerMl, weightKg: a.weightKg ?? null };
      if (a.dose > 0) { out.dose = a.dose; out.rateMlHr = F.vasopressorRateMlHr({ dose: a.dose, units, weightKg: a.weightKg, concUgPerMl: a.concUgPerMl }); }
      if (a.rateMlHr > 0) { out.inputRateMlHr = a.rateMlHr; out.doseFromRate = F.vasopressorDose({ rateMlHr: a.rateMlHr, units, weightKg: a.weightKg, concUgPerMl: a.concUgPerMl }); }
      return out;
    },
    fields: [
      { dom: 'vp-drug', arg: 'drug', kind: 'enum', values: VASO.map((r) => r.drug), required: true, label: 'Vasopressor' },
      { dom: 'vp-conc', arg: 'concUgPerMl', kind: 'number', required: true, label: 'Bag concentration', unit: 'mcg/mL' },
      { dom: 'vp-dose', arg: 'dose', kind: 'number', label: 'Dose to convert to a rate (in the drug units: mcg/min, mcg/kg/min, or units/min)' },
      { dom: 'vp-rate', arg: 'rateMlHr', kind: 'number', label: 'OR a pump rate (mL/hr) to convert back to a dose' },
      { dom: 'vp-w', arg: 'weightKg', kind: 'number', label: 'Patient weight (required for mcg/kg/min drugs)', unit: 'kg' },
    ],
  },
];
