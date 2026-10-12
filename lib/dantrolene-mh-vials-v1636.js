// spec-v1636 tool 6: dantrolene for malignant hyperthermia, dose and vials, from the three labels.
//
// Sources, DailyMed labels re-read October 11, 2026:
//   RYANODEX, Eagle (set 8f7b3ac0-..., version 10). 2.1: "Administer RYANODEX by intravenous push at a
//     minimum dose of 1 mg/kg. If the physiologic and metabolic abnormalities of MH continue,
//     administer additional intravenous boluses up to the maximum cumulative dosage of 10 mg/kg."
//     2.2: prevention, "2.5 mg/kg intravenously over a period of at least 1 minute, starting
//     approximately 75 minutes prior to surgery." 2.4: reconstitute each vial with 5 mL of sterile
//     water for injection. 11: 250 mg dantrolene sodium and 125 mg mannitol per vial; 50 mg/mL.
//     "(the amount of mannitol in RYANODEX is insufficient to maintain diuresis)".
//   Dantrium Intravenous, Par (set 4df35098-..., version 15) and Revonto, USWM (set
//     f1650487-..., version 2; the manufacturer's label, not a distributor's copy): "continuous rapid intravenous push beginning at a minimum dose of
//     1 mg/kg, and continuing until symptoms subside or the maximum cumulative dose of 10 mg/kg has
//     been reached"; prophylaxis 2.5 mg/kg, starting about 1.25 hours before anticipated anesthesia
//     and infused over approximately 1 hour; each vial 20 mg dantrolene sodium and 3,000 mg mannitol,
//     reconstituted with 60 mL sterile water for injection.
//
// All three labels give the treatment figure as "a minimum of 1 mg/kg". 2.5 mg/kg is the labels'
// prevention dose; as a treatment starting dose it is on none of them, so the per-kilogram treatment
// dose is the reader's entry and the tool says how it stands against the label.
//
// Pure: the clock is a parameter (used only for the label rows).

import { inputFault } from './num.js';
import { labelRow } from './label-row.js';

export const PRODUCTS = [
  { value: 'ryanodex', text: 'Ryanodex (250 mg vial)', name: 'RYANODEX', setId: '8f7b3ac0-604d-4c78-b545-5e0f8ea3d698', vialMg: 250, waterMl: 5, mannitolMg: 125, prevention: 'over at least 1 minute, starting about 75 minutes before surgery' },
  { value: 'dantrium-intravenous', text: 'Dantrium Intravenous (20 mg vial)', name: 'Dantrium Intravenous', setId: '4df35098-8702-46be-ac67-30cfdf1aa570', vialMg: 20, waterMl: 60, mannitolMg: 3000, prevention: 'infused over about 1 hour, starting about 1.25 hours before anticipated anesthesia' },
  { value: 'revonto', text: 'Revonto (20 mg vial)', name: 'Revonto', setId: 'f1650487-32bd-4017-b9c2-b38829a531af', vialMg: 20, waterMl: 60, mannitolMg: 3000, prevention: 'infused over about 1 hour, starting about 1.25 hours before anticipated anesthesia' },
];
export const LABELS = Object.fromEntries(PRODUCTS.map((p) => [p.value, { name: p.name, setId: p.setId }]));
export const USES = [
  { value: 'treatment', text: 'Treatment of a malignant hyperthermia crisis' },
  { value: 'prevention', text: 'Prevention in a patient at high risk' },
];
const NOTE = 'Arithmetic for the dose entered and the product in hand. Dantrolene is one part of treating malignant hyperthermia; the label\'s supportive measures and the MH hotline protocol are not replaced by this, and it does not choose the dose.';
const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const n0 = (x) => Math.round(x).toLocaleString('en-US');
const n1 = (x) => (Math.round(x * 10) / 10).toLocaleString('en-US');

export function dantroleneMhVials(input = {}, now, table) {
  const o = input && typeof input === 'object' ? input : {};
  const f = inputFault([['the weight', o.weight, 0.4, 300, 'kg']]);
  if (f) return { valid: false, message: f };
  const p = PRODUCTS.find((x) => x.value === String(o.product ?? '').trim());
  if (!p) return { valid: false, message: 'Choose the product: a Ryanodex vial holds 250 mg, a Dantrium Intravenous or Revonto vial 20 mg.' };
  const use = USES.find((x) => x.value === String(o.use ?? '').trim());
  if (!use) return { valid: false, message: 'Choose the use: treatment of a crisis, or prevention. The label doses differ.' };
  const kg = Number(o.weight);
  let perKg = 2.5; let given = null;
  if (use.value === 'treatment') {
    const df = inputFault([['the dose for this bolus', o.dosePerKg, null, 10, 'mg/kg']]);
    if (df) return { valid: false, message: `${df} The labels give a minimum of 1 mg/kg and do not choose the dose.` };
    perKg = Number(o.dosePerKg);
    if (!blank(o.cumulativeGiven)) {
      const cf = inputFault([['the dantrolene already given', o.cumulativeGiven, 0, 5000, 'mg']]);
      if (cf) return { valid: false, message: cf };
      given = Number(o.cumulativeGiven);
    }
  }
  const lr = labelRow(p.setId, now, table);
  if (!lr.answers) return { valid: true, withheld: true, flag: 'withheld', abnormal: true, labelUrl: lr.url, band: `The ${p.name} label figures are withheld: ${lr.why}. Read the dose and reconstitution from the label in hand.`, bandLabel: 'Withheld', notes: [], note: NOTE };

  const mg = perKg * kg;
  const vials = Math.ceil(mg / p.vialMg - 1e-9);
  const conc = p.vialMg / p.waterMl;
  const mannitol = mg * p.mannitolMg / p.vialMg;
  const notes = [
    `${perKg} mg/kg × ${kg} kg = ${n1(mg)} mg.`,
    `Vials: ${vials} × ${p.vialMg} mg, each reconstituted with ${p.waterMl} mL of sterile water for injection without a bacteriostatic agent (${n0(vials * p.waterMl)} mL of sterile water in all).`,
    `Volume for ${n1(mg)} mg: ${n1(mg / conc)} mL at ${Number(conc.toFixed(3))} mg/mL.`,
    `Mannitol in ${n1(mg)} mg of ${p.name}: ${mannitol < 1000 ? `${n1(mannitol)} mg` : `${n1(mannitol / 1000)} g`} (${p.mannitolMg.toLocaleString('en-US')} mg per vial).${p.value === 'ryanodex' ? ' The label says this amount is insufficient to maintain diuresis.' : ''}`,
  ];
  const cap = 10 * kg; const capVials = Math.ceil(cap / p.vialMg - 1e-9);
  let flag; let abnormal = false; let lead = '';
  if (use.value === 'prevention') {
    flag = 'prevention';
    notes.push(`Label: 2.5 mg/kg, ${p.prevention}.`);
  } else {
    flag = 'treatment';
    if (perKg < 1) { flag = 'below-label-minimum'; abnormal = true; lead = `${perKg} mg/kg is below the label's minimum of 1 mg/kg. `; }
    else notes.push('Label: a minimum of 1 mg/kg by intravenous push, repeated while the abnormalities continue, to a maximum cumulative 10 mg/kg. The label does not name a larger starting dose; 2.5 mg/kg is its prevention dose.');
    if (given === null && flag === 'treatment') { flag = 'treatment-cumulative-not-entered'; abnormal = true; }
    if (given === null) notes.push(`Dantrolene already given was not entered, so this bolus is not tested against the cumulative maximum of 10 mg/kg (${n0(cap)} mg at ${kg} kg).`);
    else {
      const after = given + mg;
      notes.push(`Cumulative: ${n1(given)} mg given + ${n1(mg)} mg = ${n1(after)} mg, ${n1(after / kg)} mg/kg of the label's maximum cumulative 10 mg/kg (${n0(cap)} mg).`);
      if (after > cap + 1e-9) { flag = 'past-cumulative-maximum'; abnormal = true; lead = `This bolus would take the cumulative dose to ${n1(after / kg)} mg/kg, past the label's maximum cumulative 10 mg/kg; ${n1(Math.max(0, cap - given))} mg remains under it. `; }
      else notes.push(`Remaining under 10 mg/kg after this bolus: ${n1(cap - after)} mg.`);
    }
    notes.push(`To reach 10 mg/kg (${n0(cap)} mg) at ${kg} kg: ${capVials} vials of ${p.name} and ${n0(capVials * p.waterMl)} mL of sterile water.`);
    notes.push('The labels say the regimen may be repeated if the abnormalities reappear.');
  }
  notes.push(`Label: ${lr.edition}.`);
  return {
    valid: true, flag, abnormal, labelUrl: lr.url, doseMg: Number(mg.toFixed(1)), vials, sterileWaterMl: vials * p.waterMl, volumeMl: Number((mg / conc).toFixed(1)),
    mannitolGrams: Number((mg * p.mannitolMg / p.vialMg / 1000).toFixed(2)), vialsToTenMgKg: use.value === 'treatment' ? capVials : null,
    band: `${lead}${p.name}: ${n1(mg)} mg (${perKg} mg/kg) from ${vials} vial${vials === 1 ? '' : 's'}, ${n1(mg / conc)} mL.`,
    bandLabel: `${n1(mg)} mg, ${vials} vial${vials === 1 ? '' : 's'}`, notes, note: NOTE,
  };
}
