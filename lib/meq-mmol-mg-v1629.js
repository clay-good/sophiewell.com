// spec-v1629 tool 5: milligrams, millimoles, milliequivalents and milliosmoles.
//
// Definitions (amount of substance; equivalents by charge):
//   mmol = mg / molecular weight          mEq = mmol x valence
//   mOsm (ideal) = mmol x particles       normality = molarity x valence
// The molecular weight is typed, or computed from a formula by lib/molecular-weight-v1629.js (IUPAC
// CIAAW 2024 atomic weights). Use the weight of the form weighed: a hydrate's formula for a hydrate.
//
// Valence is the total positive charge per formula unit (1 for KCl, 2 for CaCl2, 3 for K3 citrate)
// and is the reader's entry, never inferred from the formula: the parser cannot know that iron is
// 2+ in one salt and 3+ in another. A blank valence gives millimoles only, never an assumed 1.
// Particles on complete dissociation are the reader's entry too; a blank gives no milliosmoles.
// "Ideal" is printed with every milliosmole figure: a real solution's measured osmolality is lower
// than complete dissociation predicts, and no osmotic coefficient is applied.
//
// Label check (optional): four FDA labels print their own equivalence, re-read October 13, 2026 on
// DailyMed. The label's line is shown beside the computed one; it is the figure printed on that
// product, and it is withheld when the label's text has changed (spec-v1628 section 1).
//   Klor-Con (Upsher-Smith, 4340c3f2, v2), Description: "Each contains 600 mg or 750 mg of potassium
//     chloride equivalent to 8 mEq or 10 mEq of potassium".
//   Urocit-K (Mission, 72cdea1b, v30), Description: "5 mEq (540 mg) potassium citrate, 10 mEq (1080 mg)
//     potassium citrate and 15 mEq (1620 mg) potassium citrate each".
//   Sodium Bicarbonate Injection (Exela, f8806ec3, v1), Description: "Sodium bicarbonate, 84 mg is equal
//     to one milliequivalent each of Na+ and HCO3-".
//   Lithium carbonate and Lithium Oral Solution (Hikma, 7dc9c6d2, v28), section 2: "Each 5 mL of
//     Lithium Oral Solution contains 8 mEq of lithium ion (Li+) which is equivalent to the amount of
//     lithium in 300 mg of lithium carbonate"; Table 2: 150 mg = 4 mEq (2.5 mL), 300 mg = 8 mEq (5 mL),
//     600 mg = 16 mEq (10 mL).
// For lithium carbonate the oral-solution volume follows the label's own conversion, mL = mg / 300 x 5,
// not the computed milliequivalents: the label rounds 8.12 mEq to 8.
//
// Pure: no DOM, no network. `now` is read only to check that a label edition still stands.

import { inputFault } from './num.js';
import { molecularWeight } from './molecular-weight-v1629.js';
import { labelRow } from './label-row.js';

export const LABEL_CHECKS = [
  { value: 'potassium-chloride', text: 'Potassium chloride (Klor-Con)', setId: '4340c3f2-ecf8-44cd-9b69-217f543e24e2', brand: 'Klor-Con', line: 'Description: "Each contains 600 mg or 750 mg of potassium chloride equivalent to 8 mEq or 10 mEq of potassium".' },
  { value: 'potassium-citrate', text: 'Potassium citrate (Urocit-K)', setId: '72cdea1b-2240-41db-987d-86d5c6aaa978', brand: 'Urocit-K', line: 'Description: tablets "contain 5 mEq (540 mg) potassium citrate, 10 mEq (1080 mg) potassium citrate and 15 mEq (1620 mg) potassium citrate each".' },
  { value: 'sodium-bicarbonate', text: 'Sodium bicarbonate (injection)', setId: 'f8806ec3-a1c0-47a9-9660-2628dca4623e', brand: 'Sodium Bicarbonate Injection (Exela)', line: 'Description: "Sodium bicarbonate, 84 mg is equal to one milliequivalent each of Na+ and HCO3-".' },
  { value: 'lithium-carbonate', text: 'Lithium carbonate and lithium oral solution', setId: '7dc9c6d2-6d9a-49e4-a8ab-437b0ed5f84e', brand: 'lithium (Hikma)', line: 'Section 2: "Each 5 mL of Lithium Oral Solution contains 8 mEq of lithium ion (Li+) which is equivalent to the amount of lithium in 300 mg of lithium carbonate". Table 2: 150 mg = 4 mEq (2.5 mL); 300 mg = 8 mEq (5 mL); 600 mg = 16 mEq (10 mL).' },
];

export const UNITS = [
  { value: 'mg', text: 'mg' },
  { value: 'mmol', text: 'mmol' },
  { value: 'mEq', text: 'mEq' },
  { value: 'mOsm', text: 'mOsm (ideal)' },
];
const NOTE = 'Definitions: millimoles are milligrams over the molecular weight, milliequivalents are millimoles times the valence, and ideal milliosmoles are millimoles times the particles on complete dissociation. The valence and the particle count are yours to enter. Where a product label prints its own equivalence, that line is the figure for that product. The tool does the arithmetic; it does not say what to give.';

const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const sig = (x) => Number(Number(x).toPrecision(6));
const show = (x) => sig(x).toLocaleString('en-US', { maximumSignificantDigits: 6 });

export function meqMmolMg(input = {}, now, table) {
  const o = input && typeof input === 'object' ? input : {};
  const unit = String(o.unit ?? '').trim();
  if (!UNITS.some((u) => u.value === unit)) return { valid: false, message: 'Choose the unit of the quantity: mg, mmol, mEq or mOsm.' };
  const qf = inputFault([['the quantity', o.quantity, null, 1e9, unit]]);
  if (qf) return { valid: false, message: qf };
  const q = Number(o.quantity);
  const check = blank(o.labelCheck) ? null : LABEL_CHECKS.find((c) => c.value === String(o.labelCheck).trim());
  if (!blank(o.labelCheck) && !check) return { valid: false, message: 'Choose one of the four label checks, or leave it blank.' };

  const haveF = !blank(o.formula); const haveM = !blank(o.molecularWeight);
  if (haveF === haveM) return { valid: false, message: 'Enter either the formula or the molecular weight, not both and not neither. Use the form that is weighed: a hydrate\'s formula for a hydrate.' };
  let mw; let mwFrom;
  if (haveM) {
    const mf = inputFault([['the molecular weight', o.molecularWeight, null, 1e6, 'g/mol']]);
    if (mf) return { valid: false, message: mf };
    mw = Number(o.molecularWeight); mwFrom = `${show(mw)} g/mol as entered`;
  } else {
    const r = molecularWeight({ formula: o.formula });
    if (!r.valid) return { valid: false, message: r.message };
    mw = r.molecularWeightUnrounded; mwFrom = `${String(o.formula).replace(/\s+/g, '')} = ${show(mw)} g/mol`;
  }

  let valence = null;
  if (!blank(o.valence)) {
    const vf = inputFault([['the valence', o.valence, 1, 12, '']]);
    if (vf) return { valid: false, message: vf };
    if (!Number.isInteger(Number(o.valence))) return { valid: false, message: 'The valence is a whole number: the total positive charge per formula unit.' };
    valence = Number(o.valence);
  }
  let particles = null;
  if (!blank(o.particles)) {
    const pf = inputFault([['the particles on complete dissociation', o.particles, 1, 20, '']]);
    if (pf) return { valid: false, message: pf };
    if (!Number.isInteger(Number(o.particles))) return { valid: false, message: 'The particles on complete dissociation is a whole number: 2 for KCl, 3 for CaCl2, 1 for dextrose.' };
    particles = Number(o.particles);
  }
  if (unit === 'mEq' && valence === null) return { valid: false, message: 'A quantity in mEq needs the valence (the total positive charge per formula unit). It is not assumed to be 1.' };
  if (unit === 'mOsm' && particles === null) return { valid: false, message: 'A quantity in mOsm needs the number of particles on complete dissociation. It is not assumed.' };

  const mmol = unit === 'mg' ? q / mw : unit === 'mmol' ? q : unit === 'mEq' ? q / valence : q / particles;
  const mg = mmol * mw;
  const mEq = valence === null ? null : mmol * valence;
  const mOsm = particles === null ? null : mmol * particles;
  const notes = [`Molecular weight: ${mwFrom}.`];
  if (unit === 'mg') notes.push(`mmol: ${show(q)} mg ÷ ${show(mw)} = ${show(mmol)}.`);
  else if (unit === 'mEq') notes.push(`mmol: ${show(q)} mEq ÷ ${valence} = ${show(mmol)}; mg: ${show(mmol)} × ${show(mw)} = ${show(mg)}.`);
  else if (unit === 'mOsm') notes.push(`mmol: ${show(q)} mOsm ÷ ${particles} = ${show(mmol)}; mg: ${show(mmol)} × ${show(mw)} = ${show(mg)}.`);
  else notes.push(`mg: ${show(mmol)} mmol × ${show(mw)} = ${show(mg)}.`);
  notes.push(mEq === null
    ? 'No valence was entered, so no milliequivalents are given. It is not assumed to be 1.'
    : `mEq: ${show(mmol)} mmol × ${valence} = ${show(mEq)}.`);
  notes.push(mOsm === null
    ? 'No particle count was entered, so no milliosmoles are given.'
    : `mOsm (ideal): ${show(mmol)} mmol × ${particles} = ${show(mOsm)}. A real solution measures lower: complete dissociation is assumed and no osmotic coefficient is applied.`);
  const out = { valid: true, mg: sig(mg), mmol: sig(mmol), mEq: mEq === null ? null : sig(mEq), mOsmIdeal: mOsm === null ? null : sig(mOsm) };
  if (!blank(o.volumeMl)) {
    const vf = inputFault([['the volume', o.volumeMl, null, 1e7, 'mL']]);
    if (vf) return { valid: false, message: vf };
    const L = Number(o.volumeMl) / 1000;
    out.mmolPerL = sig(mmol / L);
    out.mEqPerL = mEq === null ? null : sig(mEq / L);
    out.mOsmPerLIdeal = mOsm === null ? null : sig(mOsm / L);
    notes.push(`In ${show(Number(o.volumeMl))} mL: ${show(mmol / L)} mmol/L${mEq === null ? '' : `, ${show(mEq / L)} mEq/L (normality ${show(mEq / L / 1000)} N)`}${mOsm === null ? '' : `, ${show(mOsm / L)} mOsm/L (ideal)`}.`);
  }
  if (check) {
    const lr = labelRow(check.setId, now, table);
    out.labelLinks = [{ text: `${check.brand.charAt(0).toUpperCase()}${check.brand.slice(1)} label on DailyMed`, url: lr.url }];
    if (!lr.answers) { out.labelWithheld = true; notes.push(`The ${check.brand} label line is withheld: ${lr.why}. The arithmetic above does not depend on it.`); }
    else {
      notes.push(`Label line, ${check.brand}. ${check.line} That is the figure printed on that product; the figures above are computed from what was entered. (${lr.edition}.)`);
      if (check.value === 'lithium-carbonate') {
        out.lithiumSolutionMl = sig((mg / 300) * 5);
        notes.push(`Taking the ${show(mg)} mg as lithium carbonate, the label's conversion (300 mg to 5 mL of the 8 mEq per 5 mL oral solution) gives ${show((mg / 300) * 5)} mL. The volume follows the label's line, not the computed milliequivalents: the label rounds 8.12 mEq to 8.`);
      }
    }
  }
  const parts = [`${show(mg)} mg`, `${show(mmol)} mmol`];
  if (mEq !== null) parts.push(`${show(mEq)} mEq`);
  if (mOsm !== null) parts.push(`${show(mOsm)} mOsm (ideal)`);
  return { ...out, band: `${parts.join(' = ')}.`, bandLabel: mEq !== null ? `${show(mEq)} mEq` : `${show(mmol)} mmol`, notes, note: NOTE };
}
