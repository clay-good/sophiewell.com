// spec-v1603 tool 3: check a payer's posted CMS-0057-F prior authorization metrics.
//
// Every program the rule reaches posts the same nine elements by March 31 for the previous calendar year,
// read in the eCFR on September 30, 2026: MA 42 CFR 422.122(c) (contract level), Medicaid managed care
// 438.210(f) (plan level), Marketplace issuers on a Federally-facilitated Exchange 45 CFR 156.223(c)
// (issuer level), CHIP fee-for-service 457.732(c) and Medicaid fee-for-service 440.230(e)(3) (state level).
// The first reports cover 2025 and were due March 31, 2026.
//
// The tool lists the elements not entered, recomputes a stated rate where the counts were also entered
// (a rate posted without counts is carried as posted, never back-computed), and sets the median decision
// times beside the deadline in force for the year reported. It gives no composite score (spec-v1600).
// Each entered rate is set beside the market from the bundled table (spec-v1605, curated each spring from the
// posted reports; lib/pa-metrics-market.js): the median and middle half of the reports for the same program and
// year. Where the table has no reports for them, the result says so.
//
// Pure: no DOM, no clock.

import { inputFault } from './num.js';
import { PA_METRICS_MARKET } from './pa-metrics-market.js';

const MARKET_LABELS = [
  ['stdApprovedPct', 'Standard approved'], ['stdDeniedPct', 'Standard denied'], ['appealApprovedPct', 'Approved after appeal'],
  ['extendedApprovedPct', 'Approved after an extended review'], ['expApprovedPct', 'Expedited approved'], ['expDeniedPct', 'Expedited denied'],
];
const MARKET_TEXT = { ma: 'Medicare Advantage contract', 'medicaid-mco': 'Medicaid managed care plan', qhp: 'Marketplace issuer', 'chip-ffs': 'CHIP fee-for-service', 'medicaid-ffs': 'Medicaid fee-for-service' };
const longDate = (iso) => new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

// marketLines(program, year, o) -> { lines, source } setting each entered rate beside the bundled table.
export function marketLines(program, year, o) {
  const m = PA_METRICS_MARKET[`${program}|${year}`];
  if (!m) return { lines: [], source: null };
  if (!Object.keys(m.metrics).length) {
    return { lines: [], source: `The bundled table has ${m.reports.toLocaleString('en-US')} ${MARKET_TEXT[program]} report${m.reports === 1 ? '' : 's'} for ${year}, from ${m.payers.join(' and ')} only: too few payers to stand for a market, so these rates are not set beside them.` };
  }
  const lines = [];
  for (const [k, label] of MARKET_LABELS) {
    const s = m.metrics[k];
    if (!s || blank(o[k])) continue;
    const v = Number(o[k]);
    const where = v < s.p25 ? 'below the middle half' : v > s.p75 ? 'above the middle half' : 'within the middle half';
    lines.push(`${label}: ${o[k]}% is ${where} of ${s.n.toLocaleString('en-US')} reports (median ${s.median}%, middle half ${s.p25}% to ${s.p75}%).`);
  }
  const source = `${MARKET_TEXT[program]} reports for ${year} in the bundled table: ${m.reports.toLocaleString('en-US')} from ${m.payers.join(', ')}, read ${longDate(m.readOn)}. Each report counts once, whatever its size; it is not every payer in the market.`;
  return { lines, source };
}

export const PROGRAMS = [
  { value: 'ma', text: 'Medicare Advantage', rule: '42 CFR 422.122(c)', level: 'contract', std: { before: 14, from2026: 7, rule: '42 CFR 422.568(b)(1)' }, exp: '42 CFR 422.572(a)(1)' },
  { value: 'medicaid-mco', text: 'Medicaid managed care plan', rule: '42 CFR 438.210(f)', level: 'plan', std: { before: 14, from2026: 7, rule: '42 CFR 438.210(d)(1)' }, exp: '42 CFR 438.210(d)(2)' },
  { value: 'qhp', text: 'Marketplace plan (Federally-facilitated Exchange)', rule: '45 CFR 156.223(c)', level: 'issuer', std: null, exp: null },
  { value: 'chip-ffs', text: 'CHIP fee-for-service (state)', rule: '42 CFR 457.732(c)', level: 'state', std: { before: 14, from2026: 7, rule: '42 CFR 457.495' }, exp: '42 CFR 457.495', expFrom: 2026 },
  { value: 'medicaid-ffs', text: 'Medicaid fee-for-service (state)', rule: '42 CFR 440.230(e)(3)', level: 'state', std: { before: null, from2026: 7, rule: '42 CFR 440.230(e)(1)' }, exp: '42 CFR 440.230(e)(1)', expFrom: 2026 },
];
export const YES_NO = [{ value: 'yes', text: 'Yes' }, { value: 'no', text: 'No' }];
export const TIME_UNITS = [{ value: 'days', text: 'Days' }, { value: 'hours', text: 'Hours' }];

// The nine elements, in the rule's order; 8 and 9 each need an average and a median.
const ELEMENTS = [
  ['list', '(1) the list of items and services that require prior authorization'],
  ['stdApprovedPct', '(2) the percentage of standard requests approved'],
  ['stdDeniedPct', '(3) the percentage of standard requests denied'],
  ['appealApprovedPct', '(4) the percentage of standard requests approved after appeal'],
  ['extendedApprovedPct', '(5) the percentage of requests with an extended review that were approved'],
  ['expApprovedPct', '(6) the percentage of expedited requests approved'],
  ['expDeniedPct', '(7) the percentage of expedited requests denied'],
  [['stdAvg', 'stdMedian'], '(8) the average and median decision time for standard requests'],
  [['expAvg', 'expMedian'], '(9) the average and median decision time for expedited requests'],
];

const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const decimals = (v) => { const m = /\.(\d+)$/.exec(String(v).trim()); return m ? m[1].length : 0; };
const pct = (x) => `${Math.round(x * 100) / 100}%`;

export function paMetricsCompare(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const prog = PROGRAMS.find((p) => p.value === o.program);
  if (!prog) return { valid: false, message: 'Choose the kind of plan the report is for.' };
  const yf = inputFault([['the calendar year the report covers', o.reportYear, 2025, 2100, '']]);
  if (yf) return { valid: false, message: `${yf}${/must be/.test(yf) ? ' The first reports cover 2025.' : ''}` };
  const year = Number(o.reportYear);
  if (!Number.isInteger(year)) return { valid: false, message: 'Enter the calendar year the report covers as a whole year.' };

  // Every entered number must be in range before anything is computed from it.
  const pctFields = ['stdApprovedPct', 'stdDeniedPct', 'appealApprovedPct', 'extendedApprovedPct', 'expApprovedPct', 'expDeniedPct'];
  for (const k of pctFields) {
    if (blank(o[k])) continue;
    const f = inputFault([[`the stated ${ELEMENTS.find((e) => e[0] === k)[1].replace(/^\(\d\) /, '')}`, o[k], 0, 100, 'percent']]);
    if (f) return { valid: false, message: f };
  }
  const countFields = [['stdTotal', 'the number of standard requests'], ['stdApproved', 'the number of standard requests approved'], ['stdDenied', 'the number of standard requests denied'],
    ['expTotal', 'the number of expedited requests'], ['expApproved', 'the number of expedited requests approved'], ['expDenied', 'the number of expedited requests denied']];
  for (const [k, label] of countFields) {
    if (blank(o[k])) continue;
    const f = inputFault([[label, o[k], 0, 1e9, '']]);
    if (f) return { valid: false, message: f };
    if (!Number.isInteger(Number(o[k]))) return { valid: false, message: `${label.charAt(0).toUpperCase()}${label.slice(1)} must be a whole number. Check the value entered.` };
  }
  for (const k of ['stdAvg', 'stdMedian', 'expAvg', 'expMedian']) {
    if (blank(o[k])) continue;
    const f = inputFault([['a decision time', o[k], 0, 1e5, '']]);
    if (f) return { valid: false, message: f };
  }
  const hasTimes = ['stdAvg', 'stdMedian', 'expAvg', 'expMedian'].some((k) => !blank(o[k]));
  const unit = TIME_UNITS.find((u) => u.value === o.timeUnit);
  if (hasTimes && !unit) return { valid: false, message: 'Choose whether the decision times are in days or hours.' };

  const findings = [];
  const notes = [];

  // Required elements.
  const missing = ELEMENTS.filter(([k]) => (Array.isArray(k) ? k.some((x) => blank(o[x])) : k === 'list' ? o.list !== 'yes' : blank(o[k]))).map(([, label]) => label);
  if (o.list === 'no') findings.push('The report does not post the list of items and services that require prior authorization, element (1).');

  // Stated rates against the counts.
  const checks = [['stdApprovedPct', 'stdApproved', 'stdTotal', 'standard approved'], ['stdDeniedPct', 'stdDenied', 'stdTotal', 'standard denied'],
    ['expApprovedPct', 'expApproved', 'expTotal', 'expedited approved'], ['expDeniedPct', 'expDenied', 'expTotal', 'expedited denied']];
  let checked = 0;
  for (const [pk, nk, tk, label] of checks) {
    if (blank(o[pk]) || blank(o[nk]) || blank(o[tk])) continue;
    const total = Number(o[tk]);
    const n = Number(o[nk]);
    if (total === 0) { findings.push(`The ${label} rate cannot be checked: the count of requests is 0.`); continue; }
    if (n > total) { findings.push(`More ${label} requests (${n.toLocaleString('en-US')}) than requests in all (${total.toLocaleString('en-US')}): the counts are inconsistent.`); continue; }
    checked += 1;
    const computed = (n / total) * 100;
    const tol = 0.5 * 10 ** -decimals(o[pk]) + 1e-9;
    if (Math.abs(computed - Number(o[pk])) > tol) findings.push(`The stated ${label} rate, ${o[pk]}%, does not match its counts: ${n.toLocaleString('en-US')} of ${total.toLocaleString('en-US')} is ${pct(computed)}.`);
  }
  for (const [a, d, label] of [['stdApprovedPct', 'stdDeniedPct', 'standard'], ['expApprovedPct', 'expDeniedPct', 'expedited']]) {
    if (!blank(o[a]) && !blank(o[d]) && Number(o[a]) + Number(o[d]) > 100 + 1e-9) findings.push(`The ${label} approved and denied rates add to ${pct(Number(o[a]) + Number(o[d]))}, more than 100%.`);
  }
  for (const [s, label] of [['std', 'standard'], ['exp', 'expedited']]) {
    if (!blank(o[`${s}Total`]) && !blank(o[`${s}Approved`]) && !blank(o[`${s}Denied`]) && Number(o[`${s}Approved`]) + Number(o[`${s}Denied`]) > Number(o[`${s}Total`])) {
      findings.push(`The ${label} approved and denied counts add to more than the requests in all.`);
    }
  }

  // Median decision times against the deadline in force for the year reported.
  const toDays = (v) => (unit && unit.value === 'hours' ? Number(v) / 24 : Number(v));
  if (prog.std) {
    const limit = year >= 2026 ? prog.std.from2026 : prog.std.before;
    if (limit != null && !blank(o.stdMedian) && toDays(o.stdMedian) > limit) {
      findings.push(`The median standard decision took ${o.stdMedian} ${unit.text.toLowerCase()}, past the ${limit}-calendar-day deadline for ${year} (${prog.std.rule}): more than half of standard decisions were late.`);
    }
    if (!blank(o.expMedian) && year >= (prog.expFrom || 0) && toDays(o.expMedian) > 3) {
      findings.push(`The median expedited decision took ${o.expMedian} ${unit.text.toLowerCase()}, past the 72-hour deadline (${prog.exp}): more than half of expedited decisions were late.`);
    }
  } else if (hasTimes) {
    notes.push('The federal rule for Marketplace issuers sets no prior authorization decision deadline, so the times are not compared with one.');
  }

  if (missing.length) notes.push(`Required elements not entered: ${missing.join('; ')}. If the report does not post them, it is missing them.`);
  if (!checked) notes.push('No rate was checked against counts: enter a rate with its counts to check it. A rate posted without counts is carried as posted, never back-computed.');
  const market = marketLines(prog.value, year, o);
  if (market.source) notes.push(market.source);
  else notes.push(`The bundled table has no ${prog.text} reports for ${year} yet, so these rates are not set beside other payers.`);

  const entered = ELEMENTS.length - missing.length;
  const band = `${prog.text} report for ${year} (${prog.rule}, posted at the ${prog.level} level by March 31, ${year + 1}): ${entered} of 9 required elements entered${checked ? `, ${checked} stated rate${checked === 1 ? '' : 's'} checked against counts` : ''}. ${findings.length ? `${findings.length} problem${findings.length === 1 ? '' : 's'} found.` : 'No problem found in what was entered.'}`;
  return {
    valid: true, band, findings, missing, checked, market: market.lines,
    bandLabel: findings.length ? `${findings.length} problem${findings.length === 1 ? '' : 's'}` : 'No problem found',
    abnormal: findings.length > 0, notes,
    note: 'The figures are the payer\'s, as posted. No composite score is given: each metric stands on its own.',
  };
}
