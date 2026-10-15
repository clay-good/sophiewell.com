// spec-v1637: what the two DSCSA small-dispenser tools share: the exemption's end date, the choice
// list, and the check for whether that date has passed. Source and quotations are in
// dscsa-small-dispenser-check-v1637.js. Not a tool of its own.

import { inputFault } from './num.js';

export const EXEMPT_THROUGH = '2027-11-27';
// Route B: the exemption end date was read from FDA's exemptions page (re-read October 14, 2026: "until
// November 27, 2027"; small "as of November 27, 2026" at 25 or fewer). The weekly page watch
// (scripts/data/watch-pages.mjs) lists the page when its text changes.
export const SOURCE = {
  edition: 'letter of August 6, 2026', route: 'B', readOn: '2026-10-14', validThrough: EXEMPT_THROUGH,
  source: { label: 'FDA, Exemptions under the Drug Supply Chain Security Act', url: 'https://www.fda.gov/drugs/drug-supply-chain-security-act-dscsa/exemptions-under-drug-supply-chain-security-act' },
};
export const SMALL = [
  { value: 'small-business-dispenser', text: 'A small business dispenser (25 or fewer, as FDA counts them)' },
  { value: 'not-a-small-business-dispenser', text: 'Not a small business dispenser' },
];
export const whole = (label, v, lo, hi) => inputFault([[label, v, lo, hi, '']]) || (Number.isInteger(Number(v)) ? null : `Enter ${label} as a whole number.`);
// Is the day `now` falls on after the exemption's last day? null when no clock was supplied.
export function lapsed(now) {
  if (!(now instanceof Date) || Number.isNaN(now.getTime())) return null;
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  return today > EXEMPT_THROUGH;
}
export const LAPSED_NOTE = 'FDA\'s letter of August 6, 2026 granted its exemptions until November 27, 2027, and that date has passed. This tool does not know whether FDA extended them again: read FDA\'s current notice on DSCSA exemptions.';
