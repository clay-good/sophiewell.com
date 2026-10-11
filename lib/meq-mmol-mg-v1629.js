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
// Not built here: the FDA label lines for four salts (spec-v1629 tool 5, "Label anchors"), which
// wait for label rows that can be withheld when their label changes (spec-v1628 section 1).
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';
import { molecularWeight } from './molecular-weight-v1629.js';

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

export function meqMmolMg(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const unit = String(o.unit ?? '').trim();
  if (!UNITS.some((u) => u.value === unit)) return { valid: false, message: 'Choose the unit of the quantity: mg, mmol, mEq or mOsm.' };
  const qf = inputFault([['the quantity', o.quantity, null, 1e9, unit]]);
  if (qf) return { valid: false, message: qf };
  const q = Number(o.quantity);

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
  const parts = [`${show(mg)} mg`, `${show(mmol)} mmol`];
  if (mEq !== null) parts.push(`${show(mEq)} mEq`);
  if (mOsm !== null) parts.push(`${show(mOsm)} mOsm (ideal)`);
  return { ...out, band: `${parts.join(' = ')}.`, bandLabel: mEq !== null ? `${show(mEq)} mEq` : `${show(mmol)} mmol`, notes, note: NOTE };
}
