// spec-v1514 tool 7: the hospice aggregate cap for a cap year.
//
// 42 CFR 418.309: the aggregate cap is the cap amount times the hospice's number of Medicare beneficiaries
// for the cap year, counted by the streamlined method (418.309(b)) or the patient-by-patient proportional
// method (418.309(c)); either can give a fractional count. Payments above the cap are an overpayment the
// hospice must refund (418.308(d)). The hospice files
// its self-determined cap within 5 months after the cap year ends, remitting any overpayment then, using data
// no earlier than 3 months after it ends (418.308(c)). The cap year runs October 1 to September 30 (418.3, "cap period").
// Cap amounts: FY2026 $35,361.44; FY2027 $36,174.75 (the FY2026 amount raised by the 2.3% FY2027 payment
// update; CMS FY2027 hospice final rule fact sheet, CMS-1851-F).
//
// Pure: no DOM, no clock (the caller passes `now`).

import { inputFault } from './num.js';
import { todayUtc } from './pa/date.js';
import { datedValue } from './dated-data.js';

const money = (x) => `$${x.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const SRC = { label: 'the CMS FY2027 hospice final rule fact sheet', url: 'https://www.cms.gov/newsroom/fact-sheets/fiscal-year-2027-hospice-wage-index-payment-rate-update-hospice-quality-reporting-program' };

export const DATED_HOSPICE_CAP = {
  'hospice-cap-2026': { edition: 'FY2026', validThrough: '2026-09-30', route: 'B', ledgerId: 'medicare-hospice-cap', source: SRC, values: { cap: 35361.44 } },
  'hospice-cap-2027': { edition: 'FY2027', validThrough: '2027-09-30', route: 'B', ledgerId: 'medicare-hospice-cap', source: SRC, values: { cap: 36174.75 } },
};

export const METHODS = [
  { value: 'streamlined', text: 'Streamlined (42 CFR 418.309(b))' },
  { value: 'proportional', text: 'Patient-by-patient proportional (418.309(c))' },
];

export function hospiceAggregateCap(input = {}, now) {
  const o = input && typeof input === 'object' ? input : {};
  const f = inputFault([
    ['the number of Medicare beneficiaries for the cap year', o.beneficiaries, 0, 1e6, ''],
    ['the Medicare hospice payments for the cap year', o.payments, 0, 1e10, 'dollars'],
  ]);
  if (f) return { valid: false, message: f };
  const notes = [];
  const yr = String(o.capYear ?? '').trim();
  const t = todayUtc(now);
  const fy = yr ? Number(yr) : t.getUTCFullYear() + (t.getUTCMonth() >= 9 ? 1 : 0);
  if (!Number.isInteger(fy) || fy < 2000 || fy > 2100) return { valid: false, message: 'Enter the cap year as a four-digit federal fiscal year (FY2026 runs October 1, 2025 to September 30, 2026).' };
  if (!yr) notes.push(`A cap year was not entered, so FY${fy} (the one in progress) is used.`);
  const id = `hospice-cap-${fy}`;
  if (!DATED_HOSPICE_CAP[id]) return { valid: false, message: `Enter a cap year with a published cap amount: none for FY${fy} is on file (FY2026 and FY2027 are).` };
  const per = datedValue(id, 'cap', new Date(Date.UTC(fy, 2, 1)), DATED_HOSPICE_CAP).value;
  const n = Number(o.beneficiaries);
  const paid = Number(o.payments);
  const cap = Math.round(per * n * 100) / 100;
  const over = Math.round((paid - cap) * 100) / 100;
  const method = METHODS.find((m) => m.value === o.method);
  if (!method) notes.push('The counting method was not entered; the count is used as entered, whichever method produced it.');
  else notes.push(`Beneficiaries counted by the ${method.text.split(' (')[0].toLowerCase()} method.`);
  notes.push(`FY${fy} runs October 1, ${fy - 1} to September 30, ${fy}.`);
  const feb = new Date(Date.UTC(fy + 1, 2, 0)).getUTCDate();
  notes.push(`The self-determined cap is due to the Medicare contractor by February ${feb}, ${fy + 1} (5 months after the cap year), using data no earlier than 3 months after the year ends (December 31, ${fy}) (42 CFR 418.308(c)).`);
  if (over > 0) notes.push('Payments above the cap are an overpayment the hospice must refund, remitted when the cap determination is filed (42 CFR 418.308(c), (d)).');
  return {
    valid: true,
    cap,
    over: Math.max(0, over),
    abnormal: over > 0,
    band: over > 0
      ? `Over the cap by ${money(over)}: FY${fy} cap ${money(cap)} (${money(per)} × ${n}) against payments of ${money(paid)}.`
      : `Within the cap with ${money(-over)} to spare: FY${fy} cap ${money(cap)} (${money(per)} × ${n}) against payments of ${money(paid)}.`,
    bandLabel: over > 0 ? `${money(over)} over` : `${money(-over)} under`,
    notes,
    note: 'This is the arithmetic of 42 CFR 418.309 on the count entered; the Medicare contractor\'s cap determination controls.',
  };
}
