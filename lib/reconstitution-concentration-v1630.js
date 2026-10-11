// spec-v1630 tool 1: reconstitution (powder volume and resulting strength).
//
// An arithmetic identity, a volume balance: the reconstituted volume is the diluent plus the volume
// the powder takes up.
//   powder volume  = label final volume - label diluent volume
//   final volume   = amount / label concentration        (when the label gives a concentration)
//   with another diluent volume:  final = diluent + powder volume;  concentration = amount / final
//   for a wanted concentration:   diluent = amount / wanted concentration - powder volume
//   volume for a dose             = dose / concentration
// Nothing here is cited to a textbook or a compendium (spec-v1628 section 2), and no displacement
// value ships: the figures come from the product's own label. With none of the label's
// concentration, its final volume or a displacement volume entered, the tool refuses; it never
// assumes the powder takes no space.
//
// The powder volume is not constant across concentrations: the ceftriaxone label's own table gives
// about 0.4 mL at 100 mg/mL and about 0.76 mL at 350 mg/mL for the same 1 g vial. A result for a
// diluent volume the label does not list says so. One unit serves the amount, the concentrations and
// the dose; the tool does not convert between them.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

export const UNITS = [
  { value: 'mg', text: 'mg' },
  { value: 'g', text: 'g' },
  { value: 'mcg', text: 'mcg' },
  { value: 'units', text: 'Units' },
  { value: 'mEq', text: 'mEq' },
];
const UNIT_TEXT = { mg: 'mg', g: 'g', mcg: 'mcg', units: 'units', mEq: 'mEq' };
const IDENTITY_NOTE = 'An arithmetic identity (volume balance). The label\'s diluent volume is the manufacturer\'s instruction; the tool only reports what the numbers give, and does not say what to prepare.';
const DRIFT_NOTE = 'The powder volume is taken from the label\'s own figures and is not constant: a label that lists several diluent volumes often implies a different powder volume for each. Use the label\'s own row when it has one.';

const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const sig = (x) => Number(Number(x).toPrecision(6));
const show = (x) => sig(x).toLocaleString('en-US', { maximumSignificantDigits: 6 });

export function reconstitutionConcentration(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const unitKey = String(o.unit ?? '').trim();
  if (!Object.prototype.hasOwnProperty.call(UNIT_TEXT, unitKey)) return { valid: false, message: 'Choose the unit of the drug amount: mg, g, mcg, units or mEq.' };
  const u = UNIT_TEXT[unitKey];
  const f = inputFault([['the drug amount in the container', o.amount, null, 1e12, u], ['the diluent volume the label states', o.labelDiluent, null, 1e6, 'mL']]);
  if (f) return { valid: false, message: f };
  const amount = Number(o.amount); const labelDiluent = Number(o.labelDiluent);

  const given = [['labelConcentration', o.labelConcentration], ['labelFinalVolume', o.labelFinalVolume], ['displacement', o.displacement]].filter(([, v]) => !blank(v));
  if (given.length !== 1) return { valid: false, message: 'Enter exactly one figure from the label: its resulting concentration, its final volume, or the powder displacement volume. The powder is never assumed to take no space.' };
  const [which, raw] = given[0];
  let powder; let labelFinal; let how;
  if (which === 'labelConcentration') {
    const cf = inputFault([['the label\'s resulting concentration', raw, null, 1e12, `${u}/mL`]]);
    if (cf) return { valid: false, message: cf };
    labelFinal = amount / Number(raw); powder = labelFinal - labelDiluent;
    how = `Final volume: ${show(amount)} ${u} ÷ ${show(Number(raw))} ${u}/mL = ${show(labelFinal)} mL. Powder volume: ${show(labelFinal)} − ${show(labelDiluent)} = ${show(powder)} mL.`;
  } else if (which === 'labelFinalVolume') {
    const vf = inputFault([['the label\'s final volume', raw, null, 1e6, 'mL']]);
    if (vf) return { valid: false, message: vf };
    labelFinal = Number(raw); powder = labelFinal - labelDiluent;
    how = `Powder volume: ${show(labelFinal)} − ${show(labelDiluent)} = ${show(powder)} mL.`;
  } else {
    const df = inputFault([['the powder displacement volume', raw, 0, 1e6, 'mL']]);
    if (df) return { valid: false, message: df };
    powder = Number(raw); labelFinal = labelDiluent + powder;
    how = `Final volume: ${show(labelDiluent)} + ${show(powder)} = ${show(labelFinal)} mL.`;
  }
  if (sig(powder) < 0) return { valid: false, message: `These label figures give a final volume of ${show(labelFinal)} mL, less than the ${show(labelDiluent)} mL of diluent, which cannot be. Check the amount, the concentration and their unit.` };
  powder = Math.max(powder, 0);
  const labelConc = amount / labelFinal;

  const asked = [['newDiluent', o.newDiluent], ['wantedConcentration', o.wantedConcentration]].filter(([, v]) => !blank(v));
  if (asked.length > 1) return { valid: false, message: 'Enter the diluent volume you intend to use or the concentration wanted, not both.' };
  let diluent = labelDiluent; let finalVolume = labelFinal; let conc = labelConc; let changed = false;
  const notes = [how, `Label: ${show(amount)} ${u} with ${show(labelDiluent)} mL of diluent makes ${show(labelFinal)} mL at ${show(labelConc)} ${u}/mL.`];
  if (asked.length) {
    const [what, v] = asked[0];
    if (what === 'newDiluent') {
      const nf = inputFault([['the diluent volume you intend to use', v, null, 1e6, 'mL']]);
      if (nf) return { valid: false, message: nf };
      diluent = Number(v); finalVolume = diluent + powder; conc = amount / finalVolume;
      notes.push(`With ${show(diluent)} mL of diluent: ${show(diluent)} + ${show(powder)} = ${show(finalVolume)} mL, and ${show(amount)} ÷ ${show(finalVolume)} = ${show(conc)} ${u}/mL.`);
    } else {
      const wf = inputFault([['the concentration wanted', v, null, 1e12, `${u}/mL`]]);
      if (wf) return { valid: false, message: wf };
      conc = Number(v); finalVolume = amount / conc; diluent = finalVolume - powder;
      if (!(sig(diluent) > 0)) return { valid: false, message: `${show(conc)} ${u}/mL cannot be reached: ${show(amount)} ${u} would have to fit in ${show(finalVolume)} mL, and the powder alone takes ${show(powder)} mL.` };
      notes.push(`For ${show(conc)} ${u}/mL: ${show(amount)} ÷ ${show(conc)} = ${show(finalVolume)} mL final, less ${show(powder)} mL of powder = ${show(diluent)} mL of diluent.`);
    }
    changed = sig(diluent) !== sig(labelDiluent);
    if (changed) notes.push(DRIFT_NOTE);
  }

  let doseVolume = null;
  if (!blank(o.dose)) {
    const dz = inputFault([['the ordered dose', o.dose, null, 1e12, u]]);
    if (dz) return { valid: false, message: dz };
    const dose = Number(o.dose);
    doseVolume = dose / conc;
    notes.push(`Volume for ${show(dose)} ${u}: ${show(dose)} ÷ ${show(conc)} = ${show(doseVolume)} mL.${dose > amount ? ` That is more than one container holds (${show(amount)} ${u}).` : ''}`);
  }
  const head = asked.length && asked[0][0] === 'wantedConcentration'
    ? `Add ${show(diluent)} mL of diluent for ${show(conc)} ${u}/mL (final volume ${show(finalVolume)} mL).`
    : `${show(amount)} ${u} with ${show(diluent)} mL of diluent makes ${show(finalVolume)} mL at ${show(conc)} ${u}/mL.`;
  return {
    valid: true, powderVolume: sig(powder), diluent: sig(diluent), finalVolume: sig(finalVolume), concentration: sig(conc),
    labelConcentration: sig(labelConc), offLabelVolume: changed, ...(doseVolume === null ? {} : { doseVolume: sig(doseVolume) }),
    band: `${head} Powder volume ${show(powder)} mL.${doseVolume === null ? '' : ` Dose volume ${show(doseVolume)} mL.`}`,
    bandLabel: doseVolume === null ? `${show(conc)} ${u}/mL` : `${show(doseVolume)} mL`,
    notes, note: IDENTITY_NOTE,
  };
}
