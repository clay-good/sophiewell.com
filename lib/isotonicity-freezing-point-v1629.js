// spec-v1629 tool 13: isotonicity by freezing-point depression (the cryoscopic method).
//
// Colligative freezing-point depression. The target was re-read on October 10, 2026 in Umar AK,
// Wathoni N, Hasanah AN, Kurniawansyah IS, Abdassah M. Kahar Method: A Novel Calculation Method of
// Tonicity Adjustment. J Pharm Bioallied Sci. 2019;11(Suppl 4):S635-S649 (PMC7020836): the isotonic
// state is "freezing point depression of blood at -0.52 °C".
//
//   Depression the solutes supply = sum(% w/v x the depression of a 1% solution)
//   Adjusting agent needed (% w/v) = (0.52 - supplied) / the agent's 1% depression
//   grams = % x volume / 100
// A supplied depression at or above 0.52 is reported as "at or past 0.52", never as a negative weight.
//
// Every 1% depression is the reader's entry from the reference they hold, the adjusting agent's
// included: no preset ships (the paper's worked tables use 0.576 for sodium chloride, but a second,
// primary source for that figure was not read).
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

export const ISOTONIC_DEPRESSION_C = 0.52;
const NOTE = 'The cryoscopic method: a solution that freezes 0.52 °C below water is taken as isotonic with blood, and each solute lowers the freezing point by its percent strength times the depression of its 1% solution. Those depressions are yours to supply from a reference; none is assumed. The method treats the depressions as additive; it does not replace a measured osmolality, and the tool does not say what to make.';

const sig = (x) => Number(Number(x).toPrecision(6));
const show = (x) => sig(x).toLocaleString('en-US', { maximumSignificantDigits: 6 });

export function isotonicityFreezingPoint(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const lines = String(o.solutes ?? '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (!lines.length) return { valid: false, message: 'Enter each solute on its own line: its strength in % w/v, then the freezing-point depression of its 1% solution in °C.' };
  if (lines.length > 40) return { valid: false, message: `${lines.length} solutes is more than the 40 this tool sums.` };
  let supplied = 0; const working = [];
  for (const [i, line] of lines.entries()) {
    const p = line.split(/\s*,\s*/);
    if (p.length !== 2) return { valid: false, message: `Solute line ${i + 1}: enter the strength in % w/v, a comma, then the 1% depression in °C.` };
    const f = inputFault([[`the strength on solute line ${i + 1}`, p[0], null, 100, '% w/v'], [`the 1% depression on solute line ${i + 1}`, p[1], 0, 5, '°C']]);
    if (f) return { valid: false, message: f };
    supplied += Number(p[0]) * Number(p[1]);
    working.push(`${show(Number(p[0]))} × ${show(Number(p[1]))}`);
  }
  const notes = [`Depression the solutes supply: ${working.join(' + ')} = ${show(supplied)} °C.`];
  if (sig(supplied) >= ISOTONIC_DEPRESSION_C) {
    notes.push(`That is at or past the 0.52 °C taken as isotonic${sig(supplied) > ISOTONIC_DEPRESSION_C ? `, by ${show(supplied - ISOTONIC_DEPRESSION_C)} °C` : ''}. No adjusting agent is added.`);
    return { valid: true, suppliedC: sig(supplied), atOrPast: true, agentPercent: null, agentG: null, abnormal: sig(supplied) > ISOTONIC_DEPRESSION_C, band: `Already at or past 0.52 °C (${show(supplied)} °C): no adjusting agent is added.`, bandLabel: 'At or past 0.52 °C', notes, note: NOTE };
  }
  const af = inputFault([['the 1% depression of the adjusting agent', o.agentDepression, null, 5, '°C']]);
  if (af) return { valid: false, message: `${af} It comes from your reference; none is assumed, sodium chloride's included.` };
  const vf = inputFault([['the final volume', o.volumeMl, null, 1e7, 'mL']]);
  if (vf) return { valid: false, message: vf };
  const dep = Number(o.agentDepression); const V = Number(o.volumeMl);
  const pct = (ISOTONIC_DEPRESSION_C - supplied) / dep;
  const grams = pct * V / 100;
  notes.push(`Adjusting agent: (0.52 − ${show(supplied)}) ÷ ${show(dep)} = ${show(pct)}% w/v.`);
  notes.push(`For ${show(V)} mL: ${show(pct)} × ${show(V)} ÷ 100 = ${show(grams)} g.`);
  return { valid: true, suppliedC: sig(supplied), atOrPast: false, agentPercent: sig(pct), agentG: sig(grams), band: `Add ${show(grams)} g of the adjusting agent (${show(pct)}% w/v) to ${show(V)} mL.`, bandLabel: `${show(grams)} g`, notes, note: NOTE };
}
