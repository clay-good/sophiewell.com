// spec-v1637 tool 24: the federal hazardous waste generator category for one calendar month.
//
// Source: 40 CFR 262.13, 266.501, 266.502 and 261.33, read on eCFR as current October 8, 2026
// (re-read October 12, 2026).
//   Table 1 to 262.13 (acute / non-acute / residues from a cleanup of acute hazardous waste):
//     > 1 kg / any / any                          Large quantity generator
//     any / >= 1,000 kg / any                     Large quantity generator
//     any / any / > 100 kg                        Large quantity generator
//     <= 1 kg / > 100 kg and < 1,000 kg / <= 100 kg   Small quantity generator
//     <= 1 kg / <= 100 kg / <= 100 kg             Very small quantity generator
//   262.13(b)(4)  a generator of both applies "the more stringent generator category" to both.
//   262.13(c)(9)  not counted: "a hazardous waste pharmaceutical ... that is subject to or managed
//     in accordance with 40 CFR part 266 subpart P or is a hazardous waste pharmaceutical that is
//     also a Drug Enforcement Administration controlled substance and is conditionally exempt
//     under 266.506."
//   266.501(a)  "A healthcare facility that is a very small quantity generator when counting all
//     of its hazardous waste, including both its hazardous waste pharmaceuticals and its
//     non-pharmaceutical hazardous waste, remains subject to 262.14 and is not subject to this
//     subpart", with stated exceptions.
//   266.502(f)(1)  "A healthcare facility may accumulate non-creditable hazardous waste
//     pharmaceuticals on site for one year or less".
//   261.33, P075  nicotine and salts: "this listing does not include patches, gums and lozenges
//     that are FDA-approved over-the-counter nicotine replacement therapies".
//
// Which wastes are hazardous, and which are acute, is the reader's entry: the tool does not
// classify drugs. Federal categories only.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

export const SUBPART_P = [
  { value: 'pharmaceuticals-under-subpart-p', text: 'Yes: hazardous waste pharmaceuticals are managed under subpart P, and are left out of the figures above' },
  { value: 'pharmaceuticals-counted-above', text: 'No: the figures above include the hazardous waste pharmaceuticals' },
];
const RANK = { 'very small quantity generator': 0, 'small quantity generator': 1, 'large quantity generator': 2 };
const fmt = (n) => n.toLocaleString('en-US', { maximumFractionDigits: 3 });

// category(acute, nonAcute, residue) -> { category, drivers[] } by Table 1 to 262.13.
function category(acute, nonAcute, residue) {
  const drivers = [];
  if (acute > 1) drivers.push(`acute hazardous waste ${fmt(acute)} kg is more than 1 kg`);
  if (nonAcute >= 1000) drivers.push(`non-acute hazardous waste ${fmt(nonAcute)} kg is 1,000 kg or more`);
  if (residue > 100) drivers.push(`acute cleanup residue ${fmt(residue)} kg is more than 100 kg`);
  if (drivers.length) return { category: 'large quantity generator', drivers };
  if (nonAcute > 100) return { category: 'small quantity generator', drivers: [`non-acute hazardous waste ${fmt(nonAcute)} kg is more than 100 kg and less than 1,000 kg, with acute waste at 1 kg or less and cleanup residue at 100 kg or less`] };
  return { category: 'very small quantity generator', drivers: ['acute hazardous waste is 1 kg or less, non-acute is 100 kg or less, and acute cleanup residue is 100 kg or less'] };
}

export function hwGeneratorCategory(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const f = inputFault([
    ['the acute hazardous waste generated this calendar month (0 if none)', o.acuteKg, 0, 1e7, 'kg'],
    ['the non-acute hazardous waste generated this calendar month (0 if none)', o.nonAcuteKg, 0, 1e7, 'kg'],
    ['the residues from a cleanup of acute hazardous waste this calendar month (0 if none)', o.residueKg, 0, 1e7, 'kg'],
  ]);
  if (f) return { valid: false, message: f };
  const p = SUBPART_P.find((x) => x.value === String(o.subpartP ?? '').trim());
  if (!p) return { valid: false, message: 'Choose whether hazardous waste pharmaceuticals are managed under 40 CFR part 266 subpart P: those are not counted toward the category.' };
  const acute = Number(o.acuteKg); const nonAcute = Number(o.nonAcuteKg); const residue = Number(o.residueKg);
  const c = category(acute, nonAcute, residue);
  const label = c.category.charAt(0).toUpperCase() + c.category.slice(1);
  const notes = [`${label} for this calendar month: ${c.drivers.join('; ')} (Table 1 to 40 CFR 262.13).`];
  notes.push('A generator of both acute and non-acute waste finds the category for each and applies the more stringent one to both (262.13(b)(4)); the table above gives that result.');
  if (p.value === 'pharmaceuticals-under-subpart-p') {
    notes.push('Hazardous waste pharmaceuticals managed under part 266 subpart P are not counted toward the category (262.13(c)(9)), and the figures entered leave them out.');
    if (c.category === 'very small quantity generator') notes.push('One check the figures cannot make: a healthcare facility that is a very small quantity generator when ALL its hazardous waste is counted, pharmaceuticals included, remains under 262.14 and is not subject to subpart P, apart from 266.505, 266.507 and the optional 266.504 (266.501(a)). Add the pharmaceuticals back in and run this again to see which side of that line the facility is on.');
    notes.push('Under subpart P, a healthcare facility may accumulate non-creditable hazardous waste pharmaceuticals on site for one year or less (266.502(f)(1)).');
  } else {
    notes.push('The figures include the hazardous waste pharmaceuticals, which is how a facility not operating under subpart P counts them, and how 266.501(a) tests whether a healthcare facility is very small.');
    if (c.category === 'very small quantity generator') notes.push('A healthcare facility that is very small on this all-in count remains under 262.14 and is not subject to subpart P, apart from 266.505, 266.507 and the optional 266.504 (266.501(a)).');
    else notes.push('A healthcare facility that is not very small on this all-in count manages its hazardous waste pharmaceuticals under subpart P (266.501(d)); those then drop out of the monthly count (262.13(c)(9)), which can lower the category for the rest.');
  }
  notes.push('FDA-approved over-the-counter nicotine patches, gums and lozenges are not P075 acute hazardous waste (40 CFR 261.33).');
  notes.push('Federal categories only. A state may not have adopted subpart P or may be stricter, and which wastes are hazardous or acute is as entered: this does not classify drugs.');
  return { valid: true, flag: c.category.replace(/ /g, '-'), category: c.category, rank: RANK[c.category], drivers: c.drivers, abnormal: c.category === 'large quantity generator', band: `${label} for this calendar month.`, bandLabel: label, notes, note: notes.join(' ') };
}
