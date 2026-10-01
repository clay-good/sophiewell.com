// spec-v1506 tool 4: what a patient pays for a Part B drug.
//
// The allowed amount and coinsurance are asp-payment's (imported, not copied): the quarter's payment limit
// per unit times units, and the file's coinsurance percentage, which is below 20% where an inflation
// reduction applies (Pub. L. 117-169 section 11101, posted per code in the file since CMS stopped publishing a
// separate list). Insulin through a pump (J1817) is capped at $35 for a month's supply, and the Part B
// deductible does not apply to it, from July 1, 2023 (42 U.S.C. 1395l(a), concluding provisions, and
// (b)(13), added by Pub. L. 117-169 section 11407).
//
// Pure: no DOM, no fetch, no clock. The caller passes `lookup` as for asp-payment.

import { aspPayment } from './asp-payment.js';
import { inputFault } from './num.js';
import { parseDate } from './pa/date.js';

const money = (c) => `$${(c / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
export const PUMP_INSULIN = 'J1817';
const CAP_CENTS = 3500;

export function partBDrugCoinsurance(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const r = aspPayment(o);
  if (!r.valid) return r;
  const notes = [];
  let patient = r.patientCents;
  let capped = false;
  const pump = r.code === PUMP_INSULIN;
  if (pump) {
    const dos = parseDate(o.serviceDate);
    if (!dos || dos.toISOString().slice(0, 10) >= '2023-07-01') {
      const f = inputFault([['the months of insulin this supply covers', o.months, 1, 12, 'months']]);
      if (f) return { valid: false, message: `${f} Insulin through a pump is capped at $35 for each month's supply.` };
      const cap = CAP_CENTS * Number(o.months);
      if (patient > cap) { patient = cap; capped = true; }
      notes.push('Insulin through a pump has no Part B deductible (42 U.S.C. 1395l(b)(13)).');
    }
  }
  const reduced = r.coinsurance < 20;
  const band = `Medicare allows ${money(r.allowedCents)} for ${r.code}. You pay ${money(patient)}`
    + (capped ? `, the $35-a-month cap for insulin through a pump (${Number(o.months)} month${Number(o.months) === 1 ? '' : 's'}), instead of ${r.coinsurance}% (${money(r.patientCents)})`
      : ` coinsurance, ${r.coinsurance}% of the allowed amount`)
    + `${reduced ? `: an inflation reduction lowered it from 20% because the drug's price rose faster than inflation` : ''}.`;
  if (!pump) notes.push('This is after the Part B deductible: any of the yearly deductible not yet met is paid first.');
  notes.push('A Medigap or other supplemental plan, or Medicaid, may pay some or all of this.');
  return {
    valid: true, code: r.code, allowedCents: r.allowedCents, patientCents: patient, coinsurance: r.coinsurance,
    inflationReduced: reduced, capped, band,
    bandLabel: `You pay ${money(patient)}`, abnormal: false,
    notes: [...notes, ...r.notes.filter((n) => !/deductible/.test(n))],
    note: 'Payment limits and coinsurance percentages are CMS\'s, by quarter; your Medicare Summary Notice shows what was actually billed.',
  };
}
