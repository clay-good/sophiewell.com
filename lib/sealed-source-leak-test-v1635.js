// spec-v1635 tool 32: sealed source leak test result and next due date.
//
// Source: 10 CFR 35.67 and 35.3067, read on eCFR as current October 8, 2026 (re-read October 11, 2026):
//   35.67(b)  test before first use (unless the supplier certifies a test within 6 months before
//             transfer), then "at intervals not to exceed 6 months or at other intervals approved by
//             the Commission or an Agreement State in the Sealed Source and Device Registry".
//   35.67(c)  the measurement must be able to detect 185 Bq (0.005 microcurie).
//   35.67(e)  185 Bq (0.005 microcurie) or more of removable contamination: immediately withdraw
//             the source from use, and file a report within 5 days of the leak test (35.3067).
//   35.67(f)  no leak test is needed for: byproduct material with a half-life under 30 days; a gas;
//             100 microcuries or less of beta or gamma-emitting material or 10 microcuries or less of
//             alpha-emitting material; iridium-192 seeds in nylon ribbon; sources stored and not in
//             use (tested before any use or transfer unless tested within the 6 months before).
// Activity on the wipe = net counts per minute / counter efficiency / 2.22 x 10^6 disintegrations
// per minute per microcurie (3.7 x 10^4 per second x 60), a unit identity.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';
import { parseIsoStrict, fmtUtc, addCalendarDaysUtc, addMonthsUtc } from './deadline.js';

export const EXEMPTIONS = [
  { value: 'none', text: 'None of these: a leak test is required' },
  { value: 'short-half-life', text: 'Half-life under 30 days' },
  { value: 'gas', text: 'Byproduct material as a gas' },
  { value: 'small-activity', text: '100 µCi or less beta or gamma, or 10 µCi or less alpha' },
  { value: 'ir192-ribbon', text: 'Iridium-192 seeds in nylon ribbon' },
  { value: 'stored', text: 'Stored and not being used' },
];
const NOTE = 'A wipe result, not a survey of the source: the counter efficiency is the reader\'s, for the radionuclide and geometry counted, and the measurement must be able to detect 0.005 µCi. The 6-month interval can be different where the Sealed Source and Device Registry approves another. Agreement State rules may differ.';
const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const say = (d) => d.toLocaleDateString('en-US', { timeZone: 'UTC', year: 'numeric', month: 'long', day: 'numeric' });
function date(v) { try { return parseIsoStrict(String(v ?? '').trim()); } catch { return null; } }

export function sealedSourceLeakTest(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const ex = EXEMPTIONS.find((e) => e.value === String(o.exemption ?? '').trim());
  if (!ex) return { valid: false, message: 'Choose whether one of the rule\'s exemptions applies to the source, or "none of these".' };
  const cite = '10 CFR 35.67, 35.3067.';
  if (ex.value !== 'none' && blank(o.netCpm)) {
    const stored = ex.value === 'stored';
    return { valid: true, flag: 'exempt', abnormal: false, band: stored ? 'A source stored and not being used needs no periodic leak test, but it must be tested before any use or transfer unless it was tested within the 6 months before.' : `No leak test is required for this source: ${ex.text.toLowerCase()} (10 CFR 35.67(f)).`, bandLabel: 'No test required', notes: ['The semi-annual physical inventory of sealed sources still applies (35.67(g)).', cite], note: NOTE };
  }
  const f = inputFault([['the net counts per minute on the wipe', o.netCpm, 0, 1e9, ''], ['the counter efficiency', o.efficiencyPercent, null, 100, '%']]);
  if (f) return { valid: false, message: f };
  const uci = Number(o.netCpm) / (Number(o.efficiencyPercent) / 100) / 2.22e6;
  const bq = uci * 37000;
  // A hair of tolerance: 11,100 cpm at 100% is exactly 0.005 microcurie, and the division lands just under it.
  const leaking = uci >= 0.005 - 1e-12;
  let test = null;
  if (!blank(o.testDate)) { test = date(o.testDate); if (!test) return { valid: false, message: 'Enter the date of the leak test as a date, or leave it blank.' }; }
  const show = (x) => Number(x.toPrecision(3)).toLocaleString('en-US', { maximumSignificantDigits: 3 });
  const notes = [`${Number(o.netCpm).toLocaleString('en-US')} net counts per minute ÷ ${Number(o.efficiencyPercent)}% efficiency ÷ 2,220,000 dpm per µCi = ${show(uci)} µCi (${show(bq)} Bq).`];
  const out = { valid: true, flag: leaking ? 'leaking' : 'not-leaking', abnormal: leaking, microcuries: Number(uci.toPrecision(6)), becquerels: Number(bq.toPrecision(6)), leaking };
  if (leaking) {
    notes.push('At 185 Bq (0.005 µCi) or more: immediately withdraw the source from use and store, dispose of or repair it, and file a report within 5 days of the leak test (35.67(e), 35.3067).');
    if (test) { const due = addCalendarDaysUtc(test, 5); out.reportDue = fmtUtc(due); notes.push(`Tested ${say(test)}: the report is due by ${say(due)}.`); }
  } else if (test) {
    const next = addMonthsUtc(test, 6); out.nextTestDue = fmtUtc(next);
    notes.push(ex.value === 'none' ? `Tested ${say(test)}: the next test is due by ${say(next)}, at an interval not to exceed 6 months (35.67(b)(2)).` : `Tested ${say(test)}. The source falls under an exemption (${ex.text.toLowerCase()}), so the rule sets no periodic interval for it.`);
    if (ex.value !== 'none') delete out.nextTestDue;
  }
  notes.push(cite);
  return { ...out, band: `${show(uci)} µCi (${show(bq)} Bq) of removable contamination: ${leaking ? 'at or above' : 'below'} the 0.005 µCi (185 Bq) level.${out.reportDue ? ` Report due by ${say(parseIsoStrict(out.reportDue))}.` : out.nextTestDue ? ` Next test due by ${say(parseIsoStrict(out.nextTestDue))}.` : ''}`, bandLabel: leaking ? 'Leaking' : 'Below 0.005 µCi', notes, note: NOTE };
}
