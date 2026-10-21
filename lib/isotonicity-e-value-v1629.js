// spec-v1629 tool 12: isotonicity by sodium chloride equivalent.
//
// The method's two constants were re-read on October 10, 2026 in Umar AK, Wathoni N, Hasanah AN,
// Kurniawansyah IS, Abdassah M. Kahar Method: A Novel Calculation Method of Tonicity Adjustment.
// J Pharm Bioallied Sci. 2019;11(Suppl 4):S635-S649 (PMC7020836, open access): the isotonic state is
// "0.9% of NaCl in aqueous solution", and the White-Vincent method multiplies the mass of the
// material and its NaCl equivalent value "by 111.1 as a constant" (100 / 0.9).
//
//   Sodium chloride that makes the volume isotonic  = 0.9 g per 100 mL x volume
//   Sodium chloride the solutes already stand for   = sum(grams x E-value)
//   Sodium chloride still to add                    = the first less the second
//   Another tonicity agent                          = that amount / the agent's E-value
//   White-Vincent: water that makes the solutes isotonic = sum(grams x E-value) x 100 / 0.9 mL,
//   then made to volume with an isotonic vehicle.
// A negative amount is reported as "already hypertonic by this method", never as 0 g.
//
// No E-value table ships: the published tables sit in pharmacy references, and each E-value is the
// reader's entry from the reference they hold, as is the agent's (1 for sodium chloride itself).
// The method treats tonicity as additive; it is an estimate of osmotic behavior, not a measurement.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

export const MODES = [
  { value: 'agent', text: 'Tonicity agent to add for a final volume' },
  { value: 'white-vincent', text: 'Isotonic volume of water (White-Vincent)' },
];
export const ISOTONIC_NACL_PERCENT = 0.9;
const NOTE = 'The sodium chloride equivalent method: 0.9% sodium chloride is taken as isotonic, and each solute counts as its weight times its E-value. E-values are yours to supply from a reference; none is assumed. The method is an estimate that treats tonicity as additive; it does not replace a measured osmolality, and the tool does not say what to make.';

const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const sig = (x) => Number(Number(x).toPrecision(6));
const show = (x) => sig(x).toLocaleString('en-US', { maximumSignificantDigits: 6 });

function parseSolutes(text) {
  const lines = String(text ?? '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (!lines.length) return { error: 'Enter each solute on its own line: its weight in grams, then its sodium chloride equivalent (E-value).' };
  if (lines.length > 40) return { error: `${lines.length} solutes is more than the 40 this tool sums.` };
  let total = 0; const working = [];
  for (const [i, line] of lines.entries()) {
    const p = line.split(/\s*,\s*/);
    if (p.length !== 2) return { error: `Solute line ${i + 1}: enter the weight in grams, a comma, then the E-value.` };
    const f = inputFault([[`the weight on solute line ${i + 1}`, p[0], null, 1e6, 'g'], [`the E-value on solute line ${i + 1}`, p[1], 0, 5, '']]);
    if (f) return { error: f };
    total += Number(p[0]) * Number(p[1]);
    working.push(`${show(Number(p[0]))} × ${show(Number(p[1]))}`);
  }
  return { total, working, count: lines.length };
}

export function isotonicityEValue(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const mode = String(o.mode ?? '').trim();
  if (mode !== 'agent' && mode !== 'white-vincent') return { valid: false, message: 'Choose what to work out: the tonicity agent to add, or the isotonic volume of water (White-Vincent).' };
  const s = parseSolutes(o.solutes);
  if (s.error) return { valid: false, message: s.error };
  const represented = s.total;
  const sumLine = `Sodium chloride the solutes stand for: ${s.working.join(' + ')} = ${show(represented)} g.`;

  if (mode === 'white-vincent') {
    // With every E-value 0 the solutes stand for no sodium chloride, so there is no isotonic volume to make.
    if (!(represented > 0)) return { valid: false, message: 'The solutes stand for no sodium chloride (every E-value entered is 0), so there is no isotonic volume of water. Check the E-values.' };
    const vIso = represented * 100 / ISOTONIC_NACL_PERCENT;
    const notes = [sumLine, `Isotonic volume: ${show(represented)} g × 100 ÷ 0.9 = ${show(vIso)} mL of water (the method prints the constant as 111.1). Then make to the final volume with an isotonic vehicle.`];
    let flagged = false;
    if (!blank(o.volumeMl)) {
      const vf = inputFault([['the final volume', o.volumeMl, null, 1e7, 'mL']]);
      if (vf) return { valid: false, message: vf };
      const V = Number(o.volumeMl);
      if (sig(vIso) > sig(V)) { flagged = true; notes.push(`That is more than the final volume of ${show(V)} mL: the solutes are already hypertonic in ${show(V)} mL by this method, and no isotonic vehicle makes up the difference.`); } else notes.push(`Isotonic vehicle to add: ${show(V)} − ${show(vIso)} = ${show(V - vIso)} mL.`);
    }
    return { valid: true, mode, naclEquivalentG: sig(represented), isotonicVolumeMl: sig(vIso), exceedsFinalVolume: flagged, abnormal: flagged, band: `Dissolve the solutes in water to make ${show(vIso)} mL; that solution is isotonic by this method.${flagged ? ' That is more than the final volume.' : ''}`, bandLabel: `${show(vIso)} mL`, notes, note: NOTE };
  }

  const vf = inputFault([['the final volume', o.volumeMl, null, 1e7, 'mL']]);
  if (vf) return { valid: false, message: vf };
  if (blank(o.agentE)) return { valid: false, message: 'Enter the E-value of the tonicity agent to be added: 1 for sodium chloride itself, or the agent\'s value from your reference. It is not assumed.' };
  const af = inputFault([['the E-value of the tonicity agent', o.agentE, null, 5, '']]);
  if (af) return { valid: false, message: af };
  const V = Number(o.volumeMl); const agentE = Number(o.agentE);
  const needed = ISOTONIC_NACL_PERCENT * V / 100;
  const toAdd = needed - represented;
  const notes = [`Sodium chloride that makes ${show(V)} mL isotonic: 0.9 g per 100 mL × ${show(V)} mL = ${show(needed)} g.`, sumLine];
  if (sig(toAdd) < 0) {
    notes.push(`The solutes already stand for ${show(-toAdd)} g more sodium chloride than ${show(V)} mL can hold at 0.9%. Nothing is added; the preparation is hypertonic by this method.`);
    return { valid: true, mode, naclNeededG: sig(needed), naclEquivalentG: sig(represented), agentG: null, hypertonic: true, abnormal: true, band: 'Already hypertonic by this method: no tonicity agent is added.', bandLabel: 'Already hypertonic', notes, note: NOTE };
  }
  const agent = toAdd / agentE;
  notes.push(`Sodium chloride still to add: ${show(needed)} − ${show(represented)} = ${show(toAdd)} g.`);
  notes.push(agentE === 1 ? 'The agent\'s E-value is 1 (sodium chloride), so that is the weight to add.' : `Tonicity agent: ${show(toAdd)} g ÷ ${show(agentE)} = ${show(agent)} g.`);
  return { valid: true, mode, naclNeededG: sig(needed), naclEquivalentG: sig(represented), naclToAddG: sig(toAdd), agentG: sig(agent), hypertonic: false, band: `Add ${show(agent)} g of the tonicity agent to make ${show(V)} mL isotonic by this method.`, bandLabel: `${show(agent)} g`, notes, note: NOTE };
}
