// spec-v1632 backfill 5 (spec-v1641 row 24): which weight a drug's label asks for in Cockcroft-Gault.
//
// Labels disagree, so `cockcroft-gault` offers a "for which drug's label?" choice and reports the
// clearance on the weight that label names. Seven labels, each re-read on October 11, 2026 for the
// tool that doses the drug (the sentence quoted is the label's):
//   Xarelto: calculate the creatinine clearance with actual body weight.
//   Tikosyn: creatinine clearance by Cockcroft-Gault with actual body weight.
//   Aggrastat: "calculated using the Cockcroft-Gault equation with actual body weight".
//   Reclast: "based on actual body weight using Cockcroft-Gault formula before each Reclast dose".
//   Viread and Truvada: creatinine clearance "Calculated using ideal (lean) body weight".
//   Keppra: "CLcr (mL/min/1.73m2) = CLcr (mL/min) x 1.73 / BSA". The label names no formula for the
//     body surface area; Mosteller's is used here and the result says so.
//
// Each row sits on the label edition its tool reads (spec-v1628 section 1) and fails closed with it.
//
// Pure: no DOM, no network; `now` is passed in.

import { labelRow } from './label-row.js';

export const DRUGS = [
  { value: 'rivaroxaban', text: 'Rivaroxaban (Xarelto)', brand: 'Xarelto', setId: '10db92f9-2300-4a80-836b-673e1ae91610', basis: 'actual' },
  { value: 'dofetilide', text: 'Dofetilide (Tikosyn)', brand: 'Tikosyn', setId: '02438044-d6a3-49e9-a1ac-3aad21ef2c8c', basis: 'actual' },
  { value: 'tirofiban', text: 'Tirofiban (Aggrastat)', brand: 'Aggrastat', setId: 'fe0ced75-ccbf-4d2e-bd0d-b57e60ab913f', basis: 'actual' },
  { value: 'zoledronic-acid', text: 'Zoledronic acid (Reclast)', brand: 'Reclast', setId: '5a9b3737-9ce6-4a89-b76e-6aab79eba9cf', basis: 'actual' },
  { value: 'tenofovir-df', text: 'Tenofovir DF (Viread)', brand: 'Viread', setId: '33fd6418-fbdc-42ca-a50d-ce2a476a5418', basis: 'ideal' },
  { value: 'emtricitabine-tenofovir', text: 'Emtricitabine/tenofovir DF (Truvada)', brand: 'Truvada', setId: '54e82b13-a037-49ed-b4b3-030b37c0ecdd', basis: 'ideal' },
  { value: 'levetiracetam', text: 'Levetiracetam (Keppra)', brand: 'Keppra', setId: '3ca9df05-a506-4ec8-a4fe-320f1219ab21', basis: 'bsa' },
];

// byWeight: { actual, ideal, idealKg } in mL/min, as lib/clinical.js cockcroftGaultByWeight returns
// (ideal is null without a height of 5 ft or more). weightKg and heightCm are needed for Keppra.
// -> null when no drug is chosen, else { valid, basis, crcl, unit, text } | { valid: false, message }
export function crclForLabel({ drug, byWeight, weightKg, heightCm } = {}, now, table) {
  const key = String(drug ?? '').trim();
  if (key === '') return null;
  const d = DRUGS.find((x) => x.value === key);
  if (!d) return { valid: false, message: 'Choose a drug from the list, or leave it blank.' };
  const row = labelRow(d.setId, now, table);
  if (!row.answers) return { valid: true, withheld: true, labelUrl: row.url, text: `The ${d.brand} label's weight for Cockcroft-Gault is withheld: ${row.why}. Read it from the label in hand.` };
  const base = { valid: true, drug: d.value, basis: d.basis, labelUrl: row.url, edition: row.edition };
  const w = byWeight || {};
  if (d.basis === 'actual') {
    return { ...base, crcl: w.actual, unit: 'mL/min', text: `The ${d.brand} label calculates the clearance with actual body weight: ${w.actual} mL/min.` };
  }
  const hasHeight = Number(heightCm) > 0;
  if (d.basis === 'ideal') {
    if (!hasHeight) return { valid: false, message: `Enter a height: the ${d.brand} label calculates the clearance with ideal (lean) body weight.` };
    if (w.ideal === null || w.ideal === undefined) return { ...base, crcl: null, unit: 'mL/min', text: `The ${d.brand} label calculates the clearance with ideal (lean) body weight, and the Devine formula gives no ideal weight below 5 ft (152.4 cm).` };
    return { ...base, crcl: w.ideal, unit: 'mL/min', text: `The ${d.brand} label calculates the clearance with ideal (lean) body weight (${w.idealKg} kg): ${w.ideal} mL/min.` };
  }
  if (!hasHeight) return { valid: false, message: `Enter a height: the ${d.brand} label adjusts the clearance for body surface area.` };
  if (!(Number(weightKg) > 0) || !(Number(heightCm) > 0)) return { ...base, valid: false, message: 'Enter the weight and height: the Keppra label adjusts the clearance for body surface area.' };
  const bsa = Math.sqrt((Number(heightCm) * Number(weightKg)) / 3600);
  const crcl = Math.round(((w.actual * 1.73) / bsa) * 100) / 100;
  return { ...base, crcl, unit: 'mL/min/1.73 m²', bsa: Math.round(bsa * 100) / 100, text: `The ${d.brand} label adjusts the clearance for body surface area: ${w.actual} mL/min × 1.73 ÷ ${bsa.toFixed(2)} m² = ${crcl} mL/min/1.73 m². The label names no formula for the surface area; Mosteller's is used here.` };
}
