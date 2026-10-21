// spec-v1629 tool 18: reduce or enlarge a master formula.
//
// An arithmetic identity, proportion: every quantity is multiplied by one factor,
//   factor = wanted yield / master yield,  or  wanted quantity of one ingredient / its master quantity.
// A formula written in parts is first turned into fractions of the total parts and then into
// quantities of the wanted yield. A "qs" line (enough to make the total) is recomputed as the wanted
// yield less everything else when every line is in the same kind of unit as the yield; otherwise it
// stays "qs to" the new total. Nothing here is cited to a textbook or a compendium (spec-v1628
// section 2).
//
// Weights and volumes are not added to each other: grams and milliliters in one formula stop the
// footing check, and the result names the line that stops it. Within a kind, units convert (mcg, mg,
// g, kg; mL, L).
//
// The formula is text, one ingredient per line: name, quantity, unit. The quantity may be "qs"; the
// unit may be "parts".
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

export const YIELD_UNITS = [
  { value: 'g', text: 'g' },
  { value: 'mL', text: 'mL' },
];
// Units as a multiple of the base unit of their kind (g for weight, mL for volume).
const KIND = {
  mcg: ['weight', 1e-6], mg: ['weight', 1e-3], g: ['weight', 1], kg: ['weight', 1000],
  ml: ['volume', 1], l: ['volume', 1000],
};
const IDENTITY_NOTE = 'An arithmetic identity (proportion): every quantity is multiplied by the same factor. The tool does the arithmetic; it does not check the formula itself or say what to make.';
const MAX_LINES = 60;

const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const sig = (x) => Number(Number(x).toPrecision(6));
const show = (x) => sig(x).toLocaleString('en-US', { maximumSignificantDigits: 6 });
const kindOf = (unit) => KIND[String(unit).toLowerCase()] || null;

function parse(text) {
  const lines = String(text ?? '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (!lines.length) return { error: 'Enter the master formula, one ingredient per line: name, quantity, unit. The quantity may be "qs" and the unit may be "parts".' };
  if (lines.length > MAX_LINES) return { error: `A formula of ${lines.length} lines is more than the ${MAX_LINES} this tool takes.` };
  const rows = [];
  for (const [i, line] of lines.entries()) {
    const p = line.split(/\s*,\s*/);
    if (p.length !== 3 || !p[0] || !p[2]) return { error: `Formula line ${i + 1}: enter the name, the quantity and the unit, separated by commas.` };
    const qs = /^q\.?s\.?$/i.test(p[1]);
    if (!qs) {
      const f = inputFault([[`the quantity on formula line ${i + 1}`, p[1], null, 1e9, '']]);
      if (f) return { error: f };
    }
    rows.push({ name: p[0], qs, quantity: qs ? null : Number(p[1]), unit: p[2], parts: /^parts?$/i.test(p[2]) });
  }
  return { rows };
}

export function formulaScale(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const parsed = parse(o.formula);
  if (parsed.error) return { valid: false, message: parsed.error };
  const { rows } = parsed;
  const anyParts = rows.some((r) => r.parts);
  if (anyParts && !rows.every((r) => r.parts)) return { valid: false, message: 'A formula is either all in parts or all in quantities: this one mixes them. Enter every line the same way.' };
  if (rows.filter((r) => r.qs).length > 1) return { valid: false, message: 'Only one line can be "qs": it is whatever is left to make the total.' };
  if (anyParts && rows.some((r) => r.qs)) return { valid: false, message: 'A formula in parts has no "qs" line: every ingredient has its parts.' };

  const yieldUnit = String(o.yieldUnit ?? '').trim();
  const byIngredient = !blank(o.ingredient) || !blank(o.ingredientQuantity);
  const byYield = !blank(o.wantedYield);
  if (byIngredient === byYield) return { valid: false, message: 'Enter either the yield wanted, or one ingredient and the quantity of it wanted, not both and not neither.' };

  // ---- a parts formula: fractions of the total, times the wanted yield.
  if (anyParts) {
    if (!byYield) return { valid: false, message: 'A formula in parts is scaled to a yield: enter the yield wanted.' };
    if (yieldUnit !== 'g' && yieldUnit !== 'mL') return { valid: false, message: 'Choose the unit of the yield: g or mL.' };
    const yf = inputFault([['the yield wanted', o.wantedYield, null, 1e9, yieldUnit]]);
    if (yf) return { valid: false, message: yf };
    const wanted = Number(o.wantedYield);
    const totalParts = rows.reduce((s, r) => s + r.quantity, 0);
    const scaled = rows.map((r) => ({ name: r.name, quantity: sig(wanted * r.quantity / totalParts), unit: yieldUnit }));
    const sum = scaled.reduce((s, r) => s + r.quantity, 0);
    return {
      valid: true, factor: null, scaled, footed: true,
      band: `${rows.length} ingredients in ${show(totalParts)} parts, scaled to ${show(wanted)} ${yieldUnit}.`,
      bandLabel: `${show(wanted)} ${yieldUnit}`,
      notes: [
        ...scaled.map((r, i) => `${r.name}: ${show(rows[i].quantity)} of ${show(totalParts)} parts × ${show(wanted)} ${yieldUnit} = ${show(r.quantity)} ${r.unit}.`),
        `Footing: the scaled quantities add to ${show(sum)} ${yieldUnit}.${yieldUnit === 'mL' ? ' Parts by volume assume the volumes add; make the product up to its final volume.' : ''}`,
      ],
      note: IDENTITY_NOTE,
    };
  }

  // ---- a quantity formula.
  let factor; let wantedYield = null; let masterYield = null; const notes = [];
  if (byYield) {
    if (yieldUnit !== 'g' && yieldUnit !== 'mL') return { valid: false, message: 'Choose the unit of the yield: g or mL.' };
    const yf = inputFault([['the master formula\'s yield', o.masterYield, null, 1e9, yieldUnit], ['the yield wanted', o.wantedYield, null, 1e9, yieldUnit]]);
    if (yf) return { valid: false, message: yf };
    masterYield = Number(o.masterYield); wantedYield = Number(o.wantedYield);
    factor = wantedYield / masterYield;
    notes.push(`Factor: ${show(wantedYield)} ${yieldUnit} ÷ ${show(masterYield)} ${yieldUnit} = ${show(factor)}.`);
  } else {
    const name = String(o.ingredient ?? '').trim().toLowerCase();
    const row = rows.find((r) => r.name.toLowerCase() === name);
    if (!row) return { valid: false, message: `Enter the name of the ingredient to scale by exactly as it is written in the formula. "${String(o.ingredient ?? '').trim()}" is not one of its lines.` };
    if (row.qs) return { valid: false, message: 'The "qs" line has no fixed quantity to scale by. Choose another ingredient, or scale by yield.' };
    const qf = inputFault([[`the quantity of ${row.name} wanted`, o.ingredientQuantity, null, 1e9, row.unit]]);
    if (qf) return { valid: false, message: qf };
    factor = Number(o.ingredientQuantity) / row.quantity;
    notes.push(`Factor: ${show(Number(o.ingredientQuantity))} ${row.unit} ÷ ${show(row.quantity)} ${row.unit} of ${row.name} = ${show(factor)}.`);
    // A master yield entered without its unit is asked for, not dropped.
    if (!blank(o.masterYield) && yieldUnit !== 'g' && yieldUnit !== 'mL') return { valid: false, message: 'Choose the unit of the master formula\'s yield: g or mL. Or clear the yield.' };
    if (!blank(o.masterYield)) {
      const mf = inputFault([['the master formula\'s yield', o.masterYield, null, 1e9, yieldUnit]]);
      if (mf) return { valid: false, message: mf };
      masterYield = Number(o.masterYield); wantedYield = masterYield * factor;
      notes.push(`New yield: ${show(masterYield)} ${yieldUnit} × ${show(factor)} = ${show(wantedYield)} ${yieldUnit}.`);
    }
  }

  // Footing: only when every fixed line is the same kind of unit as the yield.
  const yieldKind = wantedYield === null ? null : (yieldUnit === 'g' ? 'weight' : 'volume');
  const stopper = yieldKind === null ? null : rows.find((r) => !r.qs && (!kindOf(r.unit) || kindOf(r.unit)[0] !== yieldKind));
  const canFoot = yieldKind !== null && !stopper;
  const toYield = (q, unit) => q * kindOf(unit)[1];
  let fixedSum = 0;
  const scaled = rows.map((r) => {
    if (r.qs) return { name: r.name, quantity: null, unit: r.unit, qs: true };
    const q = r.quantity * factor;
    if (canFoot) fixedSum += toYield(q, r.unit);
    return { name: r.name, quantity: sig(q), unit: r.unit };
  });
  for (const [i, r] of scaled.entries()) if (!r.qs) notes.push(`${r.name}: ${show(rows[i].quantity)} ${r.unit} × ${show(factor)} = ${show(r.quantity)} ${r.unit}.`);
  const qsRow = scaled.find((r) => r.qs);
  let footed = false;
  if (qsRow) {
    const qsKind = kindOf(qsRow.unit);
    if (canFoot && qsKind && qsKind[0] === yieldKind) {
      const left = wantedYield - fixedSum;
      if (left < 0) return { valid: false, message: `The other ingredients add to ${show(fixedSum)} ${yieldUnit}, more than the ${show(wantedYield)} ${yieldUnit} yield, so nothing is left for the "qs" line. Check the master yield and the quantities.` };
      qsRow.quantity = sig(left / qsKind[1]);
      footed = true;
      notes.push(`${qsRow.name}: qs. ${show(wantedYield)} ${yieldUnit} − ${show(fixedSum)} ${yieldUnit} of the other ingredients = ${show(qsRow.quantity)} ${qsRow.unit}.${yieldKind === 'volume' ? ' Volumes are taken to add; make the product up to its final volume.' : ''}`);
    } else {
      notes.push(`${qsRow.name}: qs to ${wantedYield === null ? 'the new total' : `${show(wantedYield)} ${yieldUnit}`}. It is not computed: ${wantedYield === null ? 'no master yield was entered' : stopper ? `"${stopper.name}" is in ${stopper.unit}, which is not added to a yield in ${yieldUnit} without a specific gravity` : `its unit, ${qsRow.unit}, is not the same kind as the yield's`}.`);
    }
  } else if (canFoot) {
    footed = sig(fixedSum) === sig(wantedYield);
    notes.push(footed
      ? `Footing: the scaled quantities add to ${show(fixedSum)} ${yieldUnit}, the yield wanted.`
      : `Footing: the scaled quantities add to ${show(fixedSum)} ${yieldUnit}, not the ${show(wantedYield)} ${yieldUnit} yield. The master formula's lines do not add to its stated yield.`);
  } else if (stopper) {
    notes.push(`Footing not checked: "${stopper.name}" is in ${stopper.unit}, which is not added to a yield in ${yieldUnit} without a specific gravity.`);
  } else notes.push('Footing not checked: no master yield was entered.');
  return {
    valid: true, factor: sig(factor), scaled, footed, wantedYield: wantedYield === null ? null : sig(wantedYield),
    band: `Factor ${show(factor)}: ${scaled.length} ingredient${scaled.length === 1 ? '' : 's'} scaled${wantedYield === null ? '' : ` to ${show(wantedYield)} ${yieldUnit}`}.`,
    bandLabel: `× ${show(factor)}`,
    notes, note: IDENTITY_NOTE,
  };
}
