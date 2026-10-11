// spec-v1630 tool 2: what is actually in the bag (admixture concentration).
//
// Arithmetic on the reader's own numbers; the tool supplies none.
//   fluid in the bag  = nominal volume + overfill - volume withdrawn
//   final volume      = fluid in the bag + additive volumes + any other volume added
//   final strength    = (what the fluid already holds + amount added) / final volume
//   on the nominal volume = what the nominal volume already holds + amount added, / nominal volume
// The second figure is what a label that ignores overfill and additive volume would say; the percent
// difference between the two is shown. Solved the other way, the additive volume that reaches a
// target strength at the additive's own strength s, in fluid volume V holding baseline amount B:
//   (B + s x) / (V + x) = target   =>   x = (target V - B) / (s - target)
// and the volume to withdraw so the bag ends at its nominal volume is overfill + everything added.
//
// No overfill table ships: overfill is the manufacturer's figure for the bag in hand, and two
// documents quoting one manufacturer disagree. With overfill blank the result is on the nominal
// volume only, and says so. The baseline field covers a fluid that already holds the additive
// (potassium 4 mEq/L in a replacement-fluid bag), so dialysis and CRRT bag additions fit.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

export const UNITS = [
  { value: 'mg', text: 'mg' },
  { value: 'g', text: 'g' },
  { value: 'mcg', text: 'mcg' },
  { value: 'units', text: 'Units' },
  { value: 'mEq', text: 'mEq' },
  { value: 'mmol', text: 'mmol' },
];
export const PER = [
  { value: 'mL', text: 'Per mL' },
  { value: 'L', text: 'Per liter' },
];
const UNIT_TEXT = { mg: 'mg', g: 'g', mcg: 'mcg', units: 'units', mEq: 'mEq', mmol: 'mmol' };
const NOTE = 'Arithmetic on the numbers you entered; the tool supplies none of them. Overfill varies by manufacturer, bag size and lot: take it from the manufacturer. The tool does not say what to prepare.';

const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const sig = (x) => Number(Number(x).toPrecision(6));
const show = (x) => sig(x).toLocaleString('en-US', { maximumSignificantDigits: 6 });

export function admixtureConcentration(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const unitKey = String(o.unit ?? '').trim();
  if (!Object.prototype.hasOwnProperty.call(UNIT_TEXT, unitKey)) return { valid: false, message: 'Choose the unit of the additive amount: mg, g, mcg, units, mEq or mmol.' };
  const u = UNIT_TEXT[unitKey];
  const per = String(o.per ?? '').trim();
  if (per !== 'mL' && per !== 'L') return { valid: false, message: 'Choose how to state the strength: per mL or per liter.' };
  const k = per === 'L' ? 1000 : 1;
  const cu = `${u}/${per}`;
  const f = inputFault([['the nominal bag volume', o.nominalVolume, null, 1e6, 'mL']]);
  if (f) return { valid: false, message: f };
  const nominal = Number(o.nominalVolume);

  const optional = (label, v, hi, unit) => {
    if (blank(v)) return { value: null };
    const fault = inputFault([[label, v, 0, hi, unit]]);
    return fault ? { fault } : { value: Number(v) };
  };
  const over = optional('the overfill', o.overfill, 1e6, 'mL'); if (over.fault) return { valid: false, message: over.fault };
  const out = optional('the volume withdrawn', o.withdrawn, 1e6, 'mL'); if (out.fault) return { valid: false, message: out.fault };
  const other = optional('the other volume added', o.otherVolume, 1e6, 'mL'); if (other.fault) return { valid: false, message: other.fault };
  const base = optional('the strength already in the bag', o.baseline, 1e12, cu); if (base.fault) return { valid: false, message: base.fault };

  const lines = String(o.additives ?? '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (!lines.length) return { valid: false, message: 'Enter what is added, one line for each addition: the amount, a comma, then its volume in mL.' };
  if (lines.length > 200) return { valid: false, message: `${lines.length} lines is more than the 200 this tool adds up.` };
  let added = 0; let addedVolume = 0;
  for (const [i, line] of lines.entries()) {
    const p = line.split(/\s*,\s*/);
    if (p.length !== 2) return { valid: false, message: `Additive line ${i + 1}: enter the amount, a comma, then its volume in mL.` };
    const lf = inputFault([[`the amount on additive line ${i + 1}`, p[0], null, 1e12, u], [`the volume on additive line ${i + 1}`, p[1], null, 1e6, 'mL']]);
    if (lf) return { valid: false, message: lf };
    added += Number(p[0]); addedVolume += Number(p[1]);
  }

  const overfill = over.value ?? 0; const withdrawn = out.value ?? 0; const otherVolume = other.value ?? 0; const baseline = base.value ?? 0;
  const fluid = nominal + overfill - withdrawn;
  if (!(fluid > 0)) return { valid: false, message: `Withdrawing ${show(withdrawn)} mL leaves nothing of a bag that holds ${show(nominal + overfill)} mL.` };
  const finalVolume = fluid + addedVolume + otherVolume;
  const baseAmount = (baseline / k) * fluid;
  const conc = ((baseAmount + added) / finalVolume) * k;
  const nominalConc = baseline + (added / nominal) * k;
  const pct = ((conc - nominalConc) / nominalConc) * 100;

  const notes = [
    `Final volume: ${show(nominal)}${over.value === null ? '' : ` + ${show(overfill)} overfill`}${out.value === null ? '' : ` − ${show(withdrawn)} withdrawn`} + ${show(addedVolume)} of additive${other.value === null ? '' : ` + ${show(otherVolume)} other`} = ${show(finalVolume)} mL.`,
    `In the bag: ${base.value === null ? '' : `${show(baseAmount)} ${u} already in ${show(fluid)} mL of fluid, plus `}${show(added)} ${u} added${base.value === null ? '' : ` = ${show(baseAmount + added)} ${u}`}; ÷ ${show(finalVolume)} mL = ${show(conc)} ${cu}.`,
    `On the nominal ${show(nominal)} mL alone the same addition reads ${show(nominalConc)} ${cu}; the bag as made is ${sig(pct) === 0 ? 'the same' : `${show(Math.abs(pct))}% ${pct < 0 ? 'weaker' : 'stronger'} than that`}.`,
  ];
  if (over.value === null) notes.push('No overfill was entered, so this is on the nominal volume only: a bag holds more than its label volume, and the true strength is lower by that much.');
  const toNominal = overfill + addedVolume + otherVolume;
  notes.push(sig(finalVolume) === sig(nominal)
    ? 'The final volume equals the nominal volume.'
    : `To end at exactly ${show(nominal)} mL, ${show(toNominal)} mL would be withdrawn before adding (${over.value === null ? '' : 'the overfill plus '}everything added).`);

  const result = {
    valid: true, finalVolume: sig(finalVolume), concentration: sig(conc), nominalConcentration: sig(nominalConc), percentDifference: sig(pct),
    withdrawToNominal: sig(toNominal), overfillEntered: over.value !== null,
  };
  if (!blank(o.target)) {
    const tf = inputFault([['the target strength', o.target, null, 1e12, cu]]);
    if (tf) return { valid: false, message: tf };
    const target = Number(o.target);
    const stock = (added / addedVolume) * k;
    const base0 = fluid + otherVolume;
    if (!(target > (baseAmount / base0) * k)) return { valid: false, message: `A target of ${show(target)} ${cu} is not above what the bag already holds (${show((baseAmount / base0) * k)} ${cu}), so no addition reaches it.` };
    if (!(stock > target)) return { valid: false, message: `A target of ${show(target)} ${cu} is not below the additive's own strength (${show(stock)} ${cu}), so no volume of it reaches the target.` };
    const x = ((target / k) * base0 - baseAmount) / ((stock - target) / k);
    notes.push(`For ${show(target)} ${cu}: (${show(target)} × ${show(base0 / k)} ${per} of fluid − ${show(baseAmount)} ${u} already there) ÷ (${show(stock)} − ${show(target)}) = ${per === 'L' ? `${show(x / k)} L, or ` : ''}${show(x)} mL of additive at ${show(stock)} ${cu}, which is ${show((x * stock) / k)} ${u}.`);
    result.targetAdditiveVolume = sig(x); result.targetAmount = sig((x * stock) / k);
  }
  return {
    ...result,
    band: `${show(conc)} ${cu} in a final volume of ${show(finalVolume)} mL${over.value === null ? ' (nominal volume only: no overfill entered)' : ''}.`,
    bandLabel: `${show(conc)} ${cu}`,
    notes, note: NOTE,
  };
}
