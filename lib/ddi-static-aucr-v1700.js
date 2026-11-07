// spec-v1700 (drug-interaction-kinetics tool 2): ICH M12's mechanistic static model (section 7.5.1 and Table 3,
// read November 7, 2026):
//   AUCR = 1 / ([Ag x Bg x Cg] x (1 - Fg) + Fg) x 1 / ([Ah x Bh x Ch] x fm + (1 - fm))
//   A = 1 / (1 + [I] / Ki); B = kdeg / (kdeg + [I] x kinact / ([I] + KI)); C = 1 + d x Emax x [I] / ([I] + EC50)
// with [I]h = fu,p x (Cmax + Fa x Fg x ka x Dose / Qh / RB) and [I]g = Fa x ka x Dose / Qen. "The equation
// assumes that the drug has negligible extrahepatic clearance." AUCR from 0.80 to 1.25: "the risk of a clinically
// relevant interaction is low". A drug that both inhibits and induces is run three ways (section 7.5.1.1).
// All concentrations are in µM.
//
// Pure: no DOM, no clock, no network.

import { measured } from './num.js';
import { CUTOFFS, DEFAULTS, ENZYME_OPTIONS, enzymeRow, kdegFault } from './ich-m12.js';

export { ENZYME_OPTIONS };
const sig = (x) => Number(x.toPrecision(4));

function field(o, key, label, { min = 0, max = Infinity, open = true } = {}) {
  const v = measured(o[key]);
  if (v === null) return { value: null };
  if (open ? !(v > min) : v < min) return { message: `${label} must be ${open ? 'above' : 'at least'} ${min}.` };
  if (v > max) return { message: `${label} must be at most ${max}.` };
  return { value: v };
}

export const factors = (I, p, kdeg) => {
  const A = p.ki !== null ? 1 / (1 + I / p.ki) : 1;
  const B = p.kinact !== null ? kdeg / (kdeg + (I * p.kinact) / (I + p.kI)) : 1;
  const C = p.emax !== null ? 1 + (p.d * p.emax * I) / (I + p.ec50) : 1;
  return { A, B, C };
};

function aucr(p, use) {
  const fh = factors(p.ih, p, p.kdegH);
  const fg = p.ig === null ? { A: 1, B: 1, C: 1 } : factors(p.ig, p, p.kdegG);
  const pick = (f) => (use === 'inhibition' ? f.A * f.B : use === 'induction' ? f.C : f.A * f.B * f.C);
  const gut = 1 / (pick(fg) * (1 - p.fg) + p.fg);
  const liver = 1 / (pick(fh) * p.fm + (1 - p.fm));
  return { gut, liver, aucr: gut * liver, fh, fg };
}

export function ddiStaticAucr(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const p = {};
  for (const [key, label, opts] of [
    ['fm', 'fm (the fraction of the substrate\'s hepatic clearance by this enzyme)', { min: 0, max: 1, open: false }],
    ['fg', 'Fg (the substrate\'s fraction escaping gut metabolism)', { min: 0, max: 1, open: false }],
    ['ki', 'Ki', {}], ['kinact', 'kinact', {}], ['kI', 'KI', {}], ['emax', 'Emax', {}], ['ec50', 'EC50', {}], ['d', 'd', {}],
    ['ih', '[I]h', { min: 0, open: false }], ['ig', '[I]g', { min: 0, open: false }],
  ]) {
    const f = field(o, key, label, opts);
    if (f.message) return { valid: false, message: f.message };
    p[key] = f.value;
  }
  if (p.fm === null) return { valid: false, message: 'Enter fm, the fraction of the substrate\'s hepatic clearance by the enzyme (0 to 1).' };
  const notes = [];
  const fgBlank = p.fg === null;
  if (p.kinact !== null && p.kI === null) return { valid: false, message: 'Time-dependent inhibition needs KI with kinact.' };
  if (p.kI !== null && p.kinact === null) return { valid: false, message: 'Time-dependent inhibition needs kinact with KI.' };
  if (p.emax !== null && p.ec50 === null) return { valid: false, message: 'Induction needs EC50 with Emax.' };
  if (p.ec50 !== null && p.emax === null) return { valid: false, message: 'Induction needs Emax with EC50.' };
  if (p.ki === null && p.kinact === null && p.emax === null) return { valid: false, message: 'Enter at least one mechanism: Ki (reversible), kinact with KI (time-dependent), or Emax with EC50 (induction).' };
  if (p.d === null) p.d = DEFAULTS.d; else notes.push(`d = ${p.d} as entered.`);
  // kdeg: hepatic and intestinal, from Table 6 or entered.
  const kdegFor = (key, enzKey, fallback) => {
    const v = measured(o[key]);
    if (v !== null) { const kf = kdegFault(v); return kf ? { message: kf } : { value: v }; }
    const row = enzymeRow(String(o[enzKey] ?? fallback));
    return row ? { value: row.kdegPerMin, row } : { message: 'Choose the enzyme (for M12 Table 6\'s kdeg) or enter kdeg.' };
  };
  if (p.kinact !== null) {
    const h = kdegFor('kdegH', 'enzyme', '');
    if (h.message) return { valid: false, message: h.message };
    p.kdegH = h.value;
    const g = kdegFor('kdegG', '__', 'CYP3A4-gut');
    if (g.message) return { valid: false, message: g.message };
    p.kdegG = g.value;
    notes.push(`kdeg: liver ${p.kdegH}/min${h.row ? ` (${h.row.text}, M12 Table 6)` : ''}, gut ${p.kdegG}/min${g.row ? ' (intestinal CYP3A4, M12 Table 6)' : ''}.`);
  }

  // Concentrations: entered, or estimated with M12's equations.
  const est = String(o.estimate ?? '') === 'true' || o.estimate === true;
  if (est) {
    if (p.ih !== null || p.ig !== null) return { valid: false, message: 'Enter [I]h and [I]g, or estimate them from the dose, not both.' };
    const e = {};
    for (const [key, label] of [['fup', 'fu,p'], ['cmax', 'Cmax (µM)'], ['dose', 'the inhibitor dose (mg)'], ['mw', 'the molecular weight (g/mol)'], ['rb', 'RB, the blood-to-plasma ratio']]) {
      const v = measured(o[key]);
      if (v === null) return { valid: false, message: `Enter ${label} to estimate the concentrations.` };
      if (!(v > 0)) return { valid: false, message: `${label} must be above 0.` };
      e[key] = v;
    }
    if (e.fup > 1) return { valid: false, message: 'fu,p is a fraction from 0 to 1.' };
    const opt = (key, def, label) => { const v = measured(o[key]); if (v === null) { notes.push(`${label} not entered: ${def}, M12's stated default.`); return def; } return v; };
    const fa = opt('fa', DEFAULTS.fa, 'Fa');
    const fgi = opt('fgInhibitor', DEFAULTS.fg, 'The inhibitor\'s Fg');
    const kaMin = opt('kaPerMin', DEFAULTS.kaPerMin, 'ka (/min)');
    const qh = opt('qh', DEFAULTS.qhLPerH, 'Qh (L/h)');
    const qen = opt('qen', DEFAULTS.qenLPerH, 'Qen (L/h)');
    if (![fa, fgi, kaMin, qh, qen].every((x) => x > 0)) return { valid: false, message: 'Fa, Fg, ka, Qh and Qen must be above 0.' };
    const doseUmol = (e.dose / e.mw) * 1000;
    const kaH = kaMin * 60;
    p.ih = e.fup * (e.cmax + (fa * fgi * kaH * doseUmol) / qh / e.rb);
    p.ig = (fa * kaH * doseUmol) / qen;
    notes.push(`[I]h = fu,p x (Cmax + Fa Fg ka Dose / Qh / RB) = ${sig(p.ih)} µM; [I]g = Fa ka Dose / Qen = ${sig(p.ig)} µM (dose ${sig(doseUmol)} µmol, ka ${sig(kaH)}/h). M12 notes these estimates "can be overly conservative".`);
  } else if (p.ih === null) return { valid: false, message: 'Enter the liver inhibitor concentration [I]h in µM, or tick to estimate it from the dose.' };
  // A blank Fg is not read as 1, the most favorable value, once a gut concentration is in play (spec-v1714).
  if (fgBlank && p.ig !== null) return { valid: false, message: 'Enter Fg, the substrate\'s fraction escaping gut metabolism (0 to 1): with a gut concentration entered or estimated, a blank Fg would drop the gut term. Enter 1 only if the substrate has no gut extraction.' };
  if (fgBlank) p.fg = 1;
  if (p.fg < 1 && p.ig === null) return { valid: false, message: 'With Fg below 1 the gut term counts: enter the gut concentration [I]g, or estimate it from the dose.' };
  if (p.ig === null) p.ig = null;

  const left = [];
  if (p.ki === null) left.push('reversible inhibition (no Ki), so A = 1');
  if (p.kinact === null) left.push('time-dependent inhibition (no kinact and KI), so B = 1');
  if (p.emax === null) left.push('induction (no Emax and EC50), so C = 1');
  if (fgBlank) left.push('the gut term (no Fg and no [I]g), so the gut factor is 1');
  if (left.length) notes.unshift(`Not entered and left out: ${left.join('; ')}.`);
  const inhib = p.ki !== null || p.kinact !== null;
  const induc = p.emax !== null;
  const both = aucr(p, 'combined');
  const all = [both.aucr, both.gut, both.liver, both.fh.A, both.fh.B, both.fh.C, both.fg.A, both.fg.B, both.fg.C];
  if (!all.every(Number.isFinite) || !(both.aucr >= 1e-4 && both.aucr <= 1e4)) return { valid: false, message: 'These inputs give no AUC ratio between 0.0001 and 10,000; check the magnitudes and units entered.' };
  const band = (x) => (x >= CUTOFFS.aucrLow && x <= CUTOFFS.aucrHigh ? 'within 0.80 to 1.25' : 'outside 0.80 to 1.25');
  const lines = [
    `Liver: Ah ${sig(both.fh.A)}, Bh ${sig(both.fh.B)}, Ch ${sig(both.fh.C)}; liver factor ${sig(both.liver)}.`,
    `Gut: ${p.fg === 1 ? 'Fg 1, so the gut factor is 1' : `Ag ${sig(both.fg.A)}, Bg ${sig(both.fg.B)}, Cg ${sig(both.fg.C)}; gut factor ${sig(both.gut)}`}.`,
  ];
  if (inhib && induc) {
    const a = aucr(p, 'inhibition');
    const b = aucr(p, 'induction');
    lines.push(`Inhibition alone (C = 1): AUCR ${sig(a.aucr)}, ${band(a.aucr)}. Induction alone (A = B = 1): AUCR ${sig(b.aucr)}, ${band(b.aucr)}. Combined: ${sig(both.aucr)}.`);
    lines.push('M12 section 7.5.1.1: a combined prediction can mask either effect, so inhibition alone and induction alone should also be run, as above.');
  }
  const inBand = both.aucr >= CUTOFFS.aucrLow && both.aucr <= CUTOFFS.aucrHigh;
  // A combined run inside the band does not reassure when either mechanism alone falls outside it (7.5.1.1).
  let masked = null;
  if (inhib && induc && inBand) {
    const a = aucr(p, 'inhibition').aucr;
    const b = aucr(p, 'induction').aucr;
    const out = (x) => x < CUTOFFS.aucrLow || x > CUTOFFS.aucrHigh;
    if (out(a) || out(b)) masked = { a, b };
  }
  return {
    valid: true, aucr: sig(both.aucr), gutFactor: sig(both.gut), liverFactor: sig(both.liver), withinBand: inBand, masked: Boolean(masked), abnormal: !inBand || Boolean(masked),
    band: masked
      ? `Combined AUCR ${sig(both.aucr)} is within 0.80 to 1.25, but inhibition alone gives ${sig(masked.a)} and induction alone ${sig(masked.b)}: M12 warns that a combined prediction can mask either effect, so the combined value alone does not show a low risk.`
      : inBand
        ? `AUCR ${sig(both.aucr)}, within 0.80 to 1.25: "the risk of a clinically relevant interaction is low" (ICH M12).`
        : `AUCR ${sig(both.aucr)}, outside 0.80 to 1.25: M12 says "further evaluation should be conducted to quantify the effect".`,
    bandLabel: `AUCR ${sig(both.aucr)}`,
    notes: [...lines, ...notes, `For a substrate with linear kinetics, exposure scales with dose, so ${sig(1 / both.aucr)} of the dose (1 / AUCR) would give the exposure seen without the interacting drug. This does not hold for a drug with saturable elimination.`, 'The equation "assumes that the drug has negligible extrahepatic clearance" (M12).'],
    note: 'A development-stage prediction in ICH M12\'s terms, not a prediction for a patient. Every input is the reader\'s.',
  };
}
