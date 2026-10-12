// spec-v1635 tool 30: radioactive package label category and transport index.
//
// Source: 49 CFR 172.403(b), (c) and (g), 173.403 and 173.441, read on eCFR as current October 8,
// 2026 (re-read October 11, 2026):
//   173.403     the transport index is "the dimensionless number (rounded up to the next tenth)"
//               found "by multiplying the maximum radiation level in millisieverts (mSv) per hour
//               at 1 m ... by 100 (equivalent to the maximum radiation level in millirem per hour
//               at 1 m)".
//   172.403(c)  transport index             surface radiation level               label
//               0 (a measured TI not        0.5 mrem/h or less                    WHITE-I
//               greater than 0.05 may be
//               considered zero)
//               more than 0, not over 1     over 0.5, not over 50 mrem/h          YELLOW-II
//               more than 1, not over 10    over 50, not over 200 mrem/h          YELLOW-III
//               more than 10                over 200, not over 1,000 mrem/h       YELLOW-III, exclusive use
//               Footnote 1: any package holding a highway route controlled quantity is YELLOW-III.
//   172.403(b)  the label is "the highest category required for any of the two determining
//               conditions". Its example, index 0.8 and surface 60 mrem/h, is YELLOW-III.
//   173.441(a)  a package may not exceed 200 mrem/h at the surface or an index of 10 unless shipped
//               under exclusive use (b).
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

export const UNITS = [{ value: 'mrem-h', text: 'mrem/h', perMrem: 1 }, { value: 'msv-h', text: 'mSv/h', perMrem: 0.01 }];
export const YES_NO = [{ value: 'yes', text: 'Yes' }, { value: 'no', text: 'No' }];
const NAMES = ['RADIOACTIVE WHITE-I', 'RADIOACTIVE YELLOW-II', 'RADIOACTIVE YELLOW-III', 'RADIOACTIVE YELLOW-III, shipped under exclusive use'];
const NOTE = 'The category follows from the two measurements entered; the tool does not measure, classify the contents or decide whether the package or shipment otherwise meets the rules (packaging type, fissile material, placarding, exclusive-use conditions). The label must also carry the contents, the activity in SI units, and the transport index on a YELLOW label (172.403(g)).';
const show = (x) => Number(x.toPrecision(4)).toLocaleString('en-US', { maximumSignificantDigits: 4 });

export function radPackageLabelCategory(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const unit = UNITS.find((u) => u.value === String(o.unit ?? '').trim());
  if (!unit) return { valid: false, message: 'Choose the unit of the dose rates: mrem/h or mSv/h.' };
  const f = inputFault([['the maximum dose rate at the package surface', o.surface, 0, 1e5 * unit.perMrem, unit.text], ['the maximum dose rate at 1 meter', o.oneMeter, 0, 1e5 * unit.perMrem, unit.text]]);
  if (f) return { valid: false, message: f };
  const hrcq = YES_NO.find((y) => y.value === String(o.highwayRouteControlled ?? '').trim());
  if (!hrcq) return { valid: false, message: 'Choose whether the package holds a highway route controlled quantity: such a package is always YELLOW-III.' };
  const surface = Number(o.surface) / unit.perMrem; const atOne = Number(o.oneMeter) / unit.perMrem; // mrem/h
  if (atOne > surface) return { valid: false, message: 'The dose rate at 1 meter is higher than at the surface. Check the two readings.' };
  // Rounded up to the next tenth; a measured value not greater than 0.05 may be considered zero.
  const ti = atOne <= 0.05 ? 0 : Math.ceil(atOne * 10 - 1e-9) / 10;
  if (surface > 1000) return { valid: true, flag: 'above-table', abnormal: true, transportIndex: ti, band: `A surface dose rate of ${show(surface)} mrem/h is above 1,000 mrem/h (10 mSv/h), the top of the label table and of the exclusive-use limit.`, bandLabel: 'Above the table', notes: ['49 CFR 172.403(c), 173.441(b).'], note: NOTE };
  const byIndex = ti === 0 ? 0 : ti <= 1 ? 1 : ti <= 10 ? 2 : 3;
  const bySurface = surface <= 0.5 ? 0 : surface <= 50 ? 1 : surface <= 200 ? 2 : 3;
  let cat = Math.max(byIndex, bySurface);
  const set = byIndex === bySurface ? 'both tests' : byIndex > bySurface ? 'the transport index' : 'the surface dose rate';
  const notes = [
    `Transport index: ${show(atOne)} mrem/h at 1 meter${atOne <= 0.05 && atOne > 0 ? ', not greater than 0.05, taken as 0' : `, rounded up to the next tenth, is ${ti}`}. By the index alone: ${NAMES[byIndex]}.`,
    `Surface: ${show(surface)} mrem/h (${show(surface / 100)} mSv/h). By the surface alone: ${NAMES[bySurface]}.`,
    `The label is the higher of the two (172.403(b)); here it is set by ${set}.`,
  ];
  let byHrcq = false;
  if (hrcq.value === 'yes' && cat < 2) { cat = 2; byHrcq = true; notes.push('A highway route controlled quantity makes the package YELLOW-III whatever the two readings (footnote 1 to the table).'); }
  if (cat === 3) notes.push('Above an index of 10 or 200 mrem/h at the surface, the package must be shipped under the exclusive use provisions of 49 CFR 173.441(b), which carry their own limits.');
  notes.push('49 CFR 172.403, 173.403, 173.441.');
  return { valid: true, flag: ['white-i', 'yellow-ii', 'yellow-iii', 'yellow-iii-exclusive-use'][cat], abnormal: cat === 3, transportIndex: ti, category: NAMES[cat], setBy: byHrcq ? 'highway route controlled quantity' : set, band: `${NAMES[cat]}; transport index ${ti}.`, bandLabel: `${NAMES[cat].replace('RADIOACTIVE ', '').replace(', shipped under exclusive use', '')}, TI ${ti}`, notes, note: NOTE };
}
