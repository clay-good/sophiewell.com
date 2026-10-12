// spec-v1639 tool 1: the quantity to dispense for a days supply.
//
// Source: arithmetic on the prescription and the label, the same footing as days-supply
// (spec-v1511), run the other way: quantity = daily use x days, rounded UP to the unit that can be
// dispensed. The tool supplies no number. Priming units, drops per mL, actuations per canister,
// package sizes and whether a payer requires whole boxes are the reader's entries; no federal
// source gives a drops-per-mL figure, so none is assumed.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

export const FORMS = [
  { value: 'solid-oral', text: 'Tablets or capsules' },
  { value: 'taper', text: 'Taper (tablets, step by step)' },
  { value: 'liquid', text: 'Oral liquid' },
  { value: 'pens-or-vials', text: 'Insulin pen or vial' },
  { value: 'inhaler', text: 'Inhaler' },
  { value: 'drops', text: 'Eye drops' },
  { value: 'patch', text: 'Patches' },
  { value: 'countable-item', text: 'Test strips, lancets, pen needles or nebulizer vials' },
];
export const CHANGE_UNITS = [{ value: 'hr-interval', text: 'Hours' }, { value: 'day-interval', text: 'Days' }];
const POSTURE = 'This is arithmetic on the prescription and the label, not a coverage decision; whether a plan requires whole packages or caps the days is the plan\'s rule.';
const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const r2 = (n) => Math.round(n * 100) / 100;
const up = (n) => Math.ceil(n - 1e-9);
const down = (n) => Math.floor(n + 1e-9);
const s = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
const DAYS = ['the days supply wanted', 'days', 366, 'days'];
const FIELDS = {
  'solid-oral': [DAYS, ['the units per dose', 'perDose', 100, ''], ['the doses per day', 'dosesPerDay', 48, '']],
  liquid: [DAYS, ['the dose volume', 'doseMl', 1000, 'mL'], ['the doses per day', 'dosesPerDay', 48, '']],
  'pens-or-vials': [DAYS, ['the units injected per day', 'unitsPerDay', 10000, 'units'], ['the injections per day', 'injectionsPerDay', 48, ''], ['the insulin concentration', 'unitsPerMl', 1000, 'units/mL'], ['the mL per pen or vial', 'mlPerPen', 100, 'mL']],
  inhaler: [DAYS, ['the puffs per dose', 'puffsPerDose', 50, ''], ['the doses per day', 'dosesPerDay', 48, ''], ['the actuations per canister', 'actuations', 10000, '']],
  drops: [DAYS, ['the drops per eye per dose', 'dropsPerEye', 20, ''], ['the number of eyes treated', 'eyes', 2, ''], ['the doses per day', 'dosesPerDay', 48, ''], ['the drops per mL (the manufacturer\'s or plan\'s figure)', 'dropsPerMl', 100, '']],
  patch: [DAYS, ['the time between patch changes', 'changeInterval', 720, ''], ['the patches worn at once', 'patchesWorn', 20, '']],
  'countable-item': [DAYS, ['the uses per day', 'usesPerDay', 100, '']],
};
const PACKAGE = { 'solid-oral': ['units per bottle', 'unit'], taper: ['units per bottle', 'unit'], liquid: ['mL per bottle', 'mL'], 'pens-or-vials': ['pens or vials per box', 'pen'], inhaler: ['canisters per box', 'canister'], drops: ['mL per bottle', 'mL'], patch: ['patches per box', 'patch'], 'countable-item': ['units per box', 'unit'] };

function taperSteps(text) {
  const rows = String(text ?? '').split(/\r?\n|;/).map((x) => x.trim()).filter(Boolean);
  if (!rows.length) return { message: 'Enter the taper steps, one a line: units per dose, doses per day, days.' };
  if (rows.length > 12) return { message: 'Enter at most 12 taper steps.' };
  const steps = [];
  for (const [i, row] of rows.entries()) {
    const cells = row.split(/[,\t]/).map((x) => x.trim());
    if (cells.length !== 3) return { message: `Enter step ${i + 1} as three numbers: units per dose, doses per day, days.` };
    const f = inputFault([[`step ${i + 1}'s units per dose`, cells[0], null, 100, ''], [`step ${i + 1}'s doses per day`, cells[1], null, 48, ''], [`step ${i + 1}'s days`, cells[2], null, 366, 'days']]);
    if (f) return { message: f };
    if (!Number.isInteger(Number(cells[2]))) return { message: `Enter step ${i + 1}'s days as a whole number.` };
    steps.push(cells.map(Number));
  }
  return { steps };
}

export function quantityToDispense(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const form = PACKAGE[o.form] ? o.form : null;
  if (!form) return { valid: false, message: 'Choose the dosage form.' };
  const notes = [];
  let need; let unit; let daily = null; let days; let whole; let limitDays = null;
  if (form === 'taper') {
    const t = taperSteps(o.taperSteps);
    if (t.message) return { valid: false, message: t.message };
    need = t.steps.reduce((a, [u, d, n]) => a + u * d * n, 0);
    days = t.steps.reduce((a, [, , n]) => a + n, 0);
    if (days > 366) return { valid: false, message: 'Enter taper steps that total 366 days or fewer.' };
    unit = 'unit'; whole = up(need);
    notes.push(`${t.steps.map(([u, d, n]) => `${u} x ${d} a day x ${s(n, 'day')}`).join(' + ')} = ${r2(need)} units over ${s(days, 'day')}.`);
  } else {
    const f = inputFault(FIELDS[form].map(([label, k, hi, u]) => [label, o[k], null, hi, u]));
    if (f) return { valid: false, message: f };
    const n = Object.fromEntries(FIELDS[form].map(([, k]) => [k, Number(o[k])]));
    days = n.days;
    if (form === 'solid-oral') { daily = n.perDose * n.dosesPerDay; need = daily * days; unit = 'unit'; whole = up(need); notes.push(`${n.perDose} x ${n.dosesPerDay} a day x ${s(days, 'day')} = ${r2(need)} units.`); }
    else if (form === 'liquid') { daily = n.doseMl * n.dosesPerDay; need = daily * days; unit = 'mL'; whole = r2(need); notes.push(`${n.doseMl} mL x ${n.dosesPerDay} a day x ${s(days, 'day')} = ${r2(need)} mL.`); }
    else if (form === 'countable-item') { daily = n.usesPerDay; need = daily * days; unit = 'unit'; whole = up(need); notes.push(`${n.usesPerDay} a day x ${s(days, 'day')} = ${r2(need)} units.`); }
    else if (form === 'drops') {
      const dropsDay = n.dropsPerEye * n.eyes * n.dosesPerDay;
      daily = dropsDay / n.dropsPerMl; need = daily * days; unit = 'mL'; whole = r2(need);
      notes.push(`${n.dropsPerEye} x ${s(n.eyes, 'eye')} x ${n.dosesPerDay} a day x ${s(days, 'day')} = ${r2(dropsDay * days)} drops; at the entered ${n.dropsPerMl} drops per mL that is ${r2(need)} mL. No drops-per-mL figure is assumed: it is the manufacturer's or the plan's.`);
    } else if (form === 'inhaler') {
      let prime = 0;
      if (!blank(o.primingPuffs)) {
        const pf = inputFault([['the priming puffs per canister', o.primingPuffs, 0, 100, '']]);
        if (pf) return { valid: false, message: pf };
        prime = Number(o.primingPuffs);
      } else notes.push('Priming puffs were not entered, so none are counted.');
      const usable = n.actuations - prime;
      if (!(usable > 0)) return { valid: false, message: 'Enter priming puffs fewer than the actuations per canister.' };
      const puffs = n.puffsPerDose * n.dosesPerDay * days;
      daily = n.puffsPerDose * n.dosesPerDay / usable; need = puffs / usable; unit = 'canister'; whole = up(need);
      notes.push(`${n.puffsPerDose} puffs x ${n.dosesPerDay} a day x ${s(days, 'day')} = ${r2(puffs)} puffs; a canister gives ${usable} after priming, so ${s(whole, 'canister')}.`);
    } else if (form === 'patch') {
      const cu = CHANGE_UNITS.find((u) => u.value === String(o.changeUnit ?? '').trim());
      if (!cu) return { valid: false, message: 'Choose whether the time between patch changes is in hours or days.' };
      const hours = cu.value === 'day-interval' ? n.changeInterval * 24 : n.changeInterval;
      const changes = up(days * 24 / hours);
      need = changes * n.patchesWorn; unit = 'patch'; whole = need; daily = n.patchesWorn * 24 / hours;
      notes.push(`${s(days, 'day')} x 24 ÷ ${r2(hours)} hours = ${r2(days * 24 / hours)}, rounded up to ${s(changes, 'change')}; x ${n.patchesWorn} worn at once = ${whole} patches.`);
    } else {
      let prime = 0;
      if (!blank(o.primingUnits)) {
        const pf = inputFault([['the priming units per injection', o.primingUnits, 0, 20, 'units']]);
        if (pf) return { valid: false, message: pf };
        prime = Number(o.primingUnits);
      } else notes.push('Priming units per injection were not entered, so no priming is counted; the figure is on the pen\'s label.');
      const dailyUnits = n.unitsPerDay + prime * n.injectionsPerDay;
      const perPen = n.unitsPerMl * n.mlPerPen;
      const byUnits = up(dailyUnits * days / perPen);
      notes.push(`Daily use: ${n.unitsPerDay} units + ${prime} priming x ${s(n.injectionsPerDay, 'injection')} = ${r2(dailyUnits)} units. Over ${s(days, 'day')}: ${r2(dailyUnits * days)} units ÷ ${r2(perPen)} units a pen or vial = ${s(byUnits, 'pen')} or vials, rounded up.`);
      whole = byUnits; unit = 'pen'; daily = dailyUnits / perPen; need = dailyUnits * days / perPen;
      if (!blank(o.discardDays)) {
        const df = inputFault([['the in-use discard limit', o.discardDays, null, 3650, 'days']]);
        if (df) return { valid: false, message: df };
        limitDays = Number(o.discardDays);
        const byDiscard = up(days / limitDays);
        if (byDiscard > byUnits) { whole = byDiscard; notes.push(`The in-use discard limit binds: each is discarded ${s(limitDays, 'day')} after first use, so ${s(days, 'day')} needs ${byDiscard}, more than the units alone require.`); }
        else notes.push(`The units bind, not the ${limitDays}-day in-use discard limit (which alone would need ${byDiscard}).`);
      } else notes.push('No in-use discard limit was entered, so none is applied.');
    }
  }
  const out = { valid: true, form, daysWanted: days, quantity: whole, unit };
  let dispensed = whole;
  const [packLabel, packUnit] = PACKAGE[form];
  if (!blank(o.packageSize)) {
    const pf = inputFault([[`the package size (${packLabel})`, o.packageSize, null, 100000, '']]);
    if (pf) return { valid: false, message: pf };
    const size = Number(o.packageSize);
    out.packages = up(whole / size);
    dispensed = out.packages * size;
    out.dispensed = r2(dispensed); out.leftover = r2(dispensed - need);
    notes.push(`In packages of ${size} (${packLabel}): ${s(out.packages, 'package')}, ${r2(dispensed)} ${packUnit === 'mL' ? 'mL' : `${packUnit}${dispensed === 1 ? '' : packUnit === 'patch' ? 'es' : 's'}`} in all.`);
  } else notes.push(`No package size was entered (${packLabel}), so no package count is shown.`);
  if (daily !== null) {
    let covers = down(dispensed / daily);
    if (limitDays !== null) covers = Math.min(covers, down(dispensed * limitDays));
    out.daysCovered = covers;
    notes.push(`What is dispensed covers ${s(covers, 'day')} at this use${covers > days ? `, ${s(covers - days, 'day')} more than asked` : ''}.`);
  }
  notes.push(POSTURE);
  const word = unit === 'mL' ? 'mL' : unit === 'patch' ? (whole === 1 ? 'patch' : 'patches') : unit === 'pen' ? (whole === 1 ? 'pen or vial' : 'pens or vials') : `${unit}${whole === 1 ? '' : 's'}`;
  return { ...out, flag: 'quantity', abnormal: false, band: `${whole} ${word} for ${s(days, 'day')}.`, bandLabel: out.packages !== undefined ? s(out.packages, 'package') : `${whole} ${word}`, notes, note: notes.join(' ') };
}
