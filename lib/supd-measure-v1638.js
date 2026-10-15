// spec-v1638 tool 12: Statin Use in Persons with Diabetes (SUPD), by CMS's Star Ratings method.
//
// Source, re-read October 12, 2026: CMS, Medicare 2027 Part C & D Star Ratings Technical Notes (last
// updated September 30, 2026), measure D11, measurement year 2025: "the percentage of Medicare Part D
// beneficiaries, 40-75 years old, who were dispensed at least two diabetes medication fills on unique
// dates of service and received a statin medication fill during the measurement period. The index
// prescription start date (IPSD) is the earliest date of service for a diabetes medication during
// the measurement year. Continuous enrollment (CE) is defined as being continuously enrolled in a
// Medicare Part D contract during the measurement period, with one allowable gap in enrollment of up
// to one calendar month. Beneficiaries are only included in the measure calculation if the IPSD
// occurs at least 90 days before the end of the measurement period." Exclusions: hospice; ESRD
// diagnosis or dialysis coverage dates; rhabdomyolysis and myopathy; pregnancy, lactation and
// fertility; cirrhosis; pre-diabetes; polycystic ovary syndrome. "Contracts with 29 or fewer
// continuously enrolled beneficiaries (in the denominator)" are not rated. Higher is better.
//
// The method is CMS's public text. The tool ships no PQA specification and no medication list: the
// reader assigns each fill its class. The notes do not say on which day age is taken, so the reader
// enters the age as counted.
//
// CMS, "CY 2026 Patient Safety Reports and Updates" memo, April 22, 2026, re-read October 14, 2026,
// "Measure Specification Updates for YOS 2026": "SUPD: CMS will add a denominator exception for those
// beneficiaries with diabetes who do not have a prescription claim for a statin but do have one or more
// prescription claim(s) for either a proprotein convertase subtilisin/Kexin type 9 (PCSK9) inhibitor or
// bempedoic acid." Applied from measurement year 2026; a fill of either before then is listed and does
// not change the result.
//
// Pure: no DOM, no clock, no network.

import { parseIsoStrict } from './deadline.js';
import { inputFault } from './num.js';

export const CLASSES = ['diabetes', 'statin', 'pcsk9', 'bempedoic'];
const EXCEPTION_FROM = 2026;
export const EXCLUSIONS = ['hospice', 'esrd', 'rhabdomyolysis-or-myopathy', 'pregnancy-lactation-fertility', 'cirrhosis', 'pre-diabetes', 'pcos'];
const POSTURE = 'The gap list names members in the denominator with no statin fill. It does not say a statin should be prescribed, and the result is not CMS\'s rating.';
const lines = (t) => String(t ?? '').split(/\r?\n/).map((x) => x.trim()).filter(Boolean);
function date(v) { try { return parseIsoStrict(String(v ?? '').trim()); } catch { return null; } }

export function supdMeasure(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const yf = inputFault([['the measurement year', o.measurementYear, 2020, 2100, '']]);
  if (yf) return { valid: false, message: yf };
  const year = Number(o.measurementYear);
  if (!Number.isInteger(year)) return { valid: false, message: 'Enter the measurement year as a whole year, such as 2025.' };
  const start = Date.UTC(year, 0, 1); const end = Date.UTC(year, 11, 31);
  const mRows = lines(o.members); const fRows = lines(o.fills);
  if (!mRows.length) return { valid: false, message: 'Enter the members, one per line: member, age, continuously enrolled (yes or no), and an exclusion if any.' };
  if (!fRows.length) return { valid: false, message: 'Enter the fills, one per line: member, fill date, class (diabetes, statin, pcsk9 or bempedoic).' };
  if (mRows.length > 2000 || fRows.length > 20000) return { valid: false, message: 'Enter at most 2,000 members and 20,000 fills.' };
  const members = new Map();
  for (const [i, row] of mRows.entries()) {
    const [id = '', age = '', ce = '', ex = ''] = row.split(/[,\t]/).map((x) => x.trim());
    if (!id) return { valid: false, message: `Enter a member reference on member line ${i + 1}.` };
    if (members.has(id)) return { valid: false, message: `Enter each member once: "${id}" appears twice.` };
    const af = inputFault([[`the age on member line ${i + 1}`, age, 0, 120, 'years']]);
    if (af) return { valid: false, message: af };
    const c = ce.toLowerCase();
    if (c !== 'yes' && c !== 'no') return { valid: false, message: `Enter yes or no for continuous enrollment on member line ${i + 1}.` };
    const e = ex.toLowerCase();
    if (e && e !== 'none' && !EXCLUSIONS.includes(e)) return { valid: false, message: `Enter an exclusion from the list on member line ${i + 1} (${EXCLUSIONS.join(', ')}), or leave it blank.` };
    members.set(id, { id, age: Number(age), ce: c === 'yes', exclusion: e && e !== 'none' ? e : null, diabetes: new Set(), statin: 0, nonstatin: 0 });
  }
  let outside = 0;
  for (const [i, row] of fRows.entries()) {
    const [id = '', d = '', cls = ''] = row.split(/[,\t]/).map((x) => x.trim());
    const m = members.get(id);
    if (!m) return { valid: false, message: `Enter a member line for "${id}" (fill line ${i + 1} names a member who is not listed).` };
    const dt = date(d);
    if (!dt) return { valid: false, message: `Enter the fill date on fill line ${i + 1} as YYYY-MM-DD.` };
    const c = cls.toLowerCase();
    if (!CLASSES.includes(c)) return { valid: false, message: `Enter the class on fill line ${i + 1} as diabetes, statin, pcsk9 or bempedoic.` };
    if (dt.getTime() < start || dt.getTime() > end) { outside += 1; continue; }
    if (c === 'diabetes') m.diabetes.add(dt.getTime()); else if (c === 'statin') m.statin += 1; else m.nonstatin += 1;
  }
  const rows = []; let den = 0; let num = 0; const gaps = [];
  for (const m of members.values()) {
    let reason = null;
    if (!m.ce) reason = 'not continuously enrolled';
    else if (m.age < 40 || m.age > 75) reason = `age ${m.age} is outside 40 to 75`;
    else if (m.exclusion) reason = `excluded: ${m.exclusion}`;
    else if (m.diabetes.size < 2) reason = `${m.diabetes.size} diabetes fill date${m.diabetes.size === 1 ? '' : 's'} in the year; two on different dates are needed`;
    else {
      const ipsd = Math.min(...m.diabetes);
      const before = Math.round((end - ipsd) / 86400000);
      if (before < 90) reason = `the first diabetes fill (${new Date(ipsd).toISOString().slice(0, 10)}) is ${before} days before the end of the year; at least 90 are needed`;
      else if (year >= EXCEPTION_FROM && m.statin === 0 && m.nonstatin > 0) reason = 'denominator exception: no statin fill, and a PCSK9 inhibitor or bempedoic acid fill (from measurement year 2026)';
    }
    const inDen = reason === null; const statin = m.statin > 0;
    if (inDen) { den += 1; if (statin) num += 1; else gaps.push(m.id); }
    rows.push({ member: m.id, inDenominator: inDen, reason, statinFill: statin });
  }
  const rate = den ? Math.round((num / den) * 1000) / 10 : null;
  const notes = [`Measurement year ${year}: ${members.size} member${members.size === 1 ? '' : 's'}, ${den} in the denominator, ${num} with a statin fill.`];
  for (const r of rows) notes.push(r.inDenominator ? `${r.member}: in the denominator; ${r.statinFill ? 'a statin fill is on record' : 'no statin fill on record'}.` : `${r.member}: not in the denominator (${r.reason}).`);
  if (gaps.length) notes.push(`Gap list (in the denominator, no statin fill): ${gaps.join(', ')}.`);
  if (outside) notes.push(`${outside} fill${outside === 1 ? '' : 's'} dated outside ${year} ${outside === 1 ? 'was' : 'were'} not counted.`);
  const early = [...members.values()].filter((m) => m.nonstatin > 0).length;
  if (year < EXCEPTION_FROM && early) notes.push(`${early} member${early === 1 ? ' has' : 's have'} a PCSK9 inhibitor or bempedoic acid fill; the exception for those starts with measurement year 2026, so for ${year} they count as no statin fill.`);
  if (den && den < 30) notes.push('CMS does not rate a contract with 29 or fewer members in the denominator; the rate is shown for this list all the same.');
  notes.push('Method: CMS 2027 Star Ratings Technical Notes, measure D11 (written for measurement year 2025). Continuous enrollment (one gap of up to one calendar month allowed), the exclusion diagnoses and each fill\'s class are entered by the reader; no medication list is supplied. The notes do not say on which day age is counted. From measurement year 2026 a member with no statin fill and a PCSK9 inhibitor or bempedoic acid fill is excepted from the denominator (CMS Patient Safety memo, April 22, 2026). A higher rate is better.');
  return { valid: true, measurementYear: year, denominator: den, numerator: num, ratePercent: rate, gapList: gaps, rows, flag: den === 0 ? 'no-denominator' : gaps.length ? 'gaps' : 'no-gaps', abnormal: gaps.length > 0 || den === 0,
    band: den ? `${rate}% (${num} of ${den}) had a statin fill.` : 'No member is in the denominator.', bandLabel: den ? `${gaps.length} member${gaps.length === 1 ? '' : 's'} on the gap list` : 'No denominator', notes, note: POSTURE };
}
