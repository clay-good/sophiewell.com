// spec-v1629 tool 8: crushed tablets as a drug source.
//
// An arithmetic identity, proportion. Commercial tablets are crushed and a weight of the powder is
// taken that carries the drug wanted:
//   average tablet weight = total weight of the counted tablets / count
//   tablets to crush      = ceiling(drug needed / labeled strength), plus any extra entered
//   powder to weigh       = drug needed x average tablet weight / labeled strength
// The tablet count rounds up; the powder weight does not. Nothing here is cited to a textbook or a
// compendium (spec-v1628 section 2).
//
// Two assumptions, stated in the result: the drug is spread evenly through the crushed powder, and
// each tablet holds its labeled strength (the label, not an assay).
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

const IDENTITY_NOTE = 'An arithmetic identity (proportion). It assumes the drug is spread evenly through the crushed powder and that each tablet holds its labeled strength; no assay is used. The tool does the arithmetic and does not say what to make.';

const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const sig = (x) => Number(Number(x).toPrecision(6));
const show = (x) => sig(x).toLocaleString('en-US', { maximumSignificantDigits: 6 });

export function tabletPowderSource(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const f = inputFault([
    ['the drug needed', o.needed, null, 1e7, 'mg'],
    ['the labeled strength per tablet', o.strength, null, 1e5, 'mg'],
    ['the number of tablets weighed', o.count, 1, 10000, ''],
    ['the total weight of those tablets', o.totalWeight, null, 1e8, 'mg'],
  ]);
  if (f) return { valid: false, message: f };
  const needed = Number(o.needed); const strength = Number(o.strength); const count = Number(o.count); const total = Number(o.totalWeight);
  if (!Number.isInteger(count)) return { valid: false, message: 'The number of tablets weighed must be a whole number.' };
  const avg = total / count;
  if (!(avg > strength)) return { valid: false, message: `These tablets average ${show(avg)} mg each, which is not more than the ${show(strength)} mg of drug each is labeled to hold. Check the total weight (in mg) and the count.` };
  let extra = 0;
  if (!blank(o.extra)) {
    const ef = inputFault([['the extra tablets', o.extra, 0, 10000, '']]);
    if (ef) return { valid: false, message: ef };
    extra = Number(o.extra);
    if (!Number.isInteger(extra)) return { valid: false, message: 'The extra tablets must be a whole number.' };
  }
  const exact = needed / strength;
  // Rounded up on the value itself (a hair of tolerance for float noise only): 10.00004 tablets' worth needs 11.
  const whole = Math.ceil(exact - 1e-9);
  const tablets = whole + extra;
  const powder = needed * avg / strength;
  const crushed = tablets * avg;
  const left = crushed - powder;
  return {
    valid: true, tablets, powderMg: sig(powder), averageTabletMg: sig(avg), leftOverMg: sig(left),
    band: `Crush ${tablets} tablet${tablets === 1 ? '' : 's'} and weigh ${show(powder)} mg of the powder, which holds ${show(needed)} mg of drug.`,
    bandLabel: `${show(powder)} mg of powder`,
    notes: [
      `Average tablet: ${show(total)} mg ÷ ${count} = ${show(avg)} mg.`,
      `Tablets: ${show(needed)} mg ÷ ${show(strength)} mg = ${show(exact)}, rounded up to ${whole}${extra ? `, plus ${extra} extra` : ''}.`,
      `Powder: ${show(needed)} mg × ${show(avg)} mg ÷ ${show(strength)} mg = ${show(powder)} mg. The powder weight is not rounded.`,
      `Left over: ${tablets} × ${show(avg)} mg − ${show(powder)} mg = ${show(left)} mg of powder.`,
    ],
    note: IDENTITY_NOTE,
  };
}
