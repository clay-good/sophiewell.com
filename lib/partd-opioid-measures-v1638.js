// spec-v1638 tool 13: the Part D opioid display measures (OHD, OMP, IOP-LD).
//
// Source, re-read October 12, 2026: CMS, 2026 Display Measures Technical Notes (December 16, 2025).
//   DMD11 (OHD): beneficiaries 18 or older "with an average daily dosage greater than or equal to 90
//     morphine milligram equivalents (MME) over a period of 90 days or more. ... The opioid episode
//     starts at the date of the first opioid prescription claim and the end of the enrollment
//     episode must extend at least 90 days from the first opioid prescription claim." Denominator:
//     "at least 2 prescription claims of a prescription opioid on unique dates of service and at
//     least 15 cumulative opioid days' supply over a period of 90 days or longer".
//   DMD12 (OMP): the same denominator; numerator, "opioids from 4 or more prescribers and 4 or more
//     pharmacies within 180 days or less".
//   DMD15 (IOP-LD): denominator, "1 or more opioid prescription claim(s) in the measurement period
//     with a negative medication history during the 90-day lookback period"; numerator, "more than
//     7 cumulative days' supply for opioid prescription claims within any 3-day opioid initiation
//     period", which "includes the date of the initial opioid prescription plus 2 days".
//   All three are rates of member-years ("if a beneficiary is enrolled for six out of twelve months
//     of the year, they will count as only 0.5 member-years"). Excluded: hospice, cancer diagnosis,
//     sickle cell disease diagnosis, palliative care.
//
// CMS's notes do not define the divisor of "average daily MME". This tool computes it two ways (per
// day of the episode, and per day covered by an opioid fill), puts a member in the numerator on the
// higher of the two, and says when the two disagree. The MME per day of each fill is the reader's
// entry. No PQA specification or medication list is shipped.
//
// Three nearby thresholds differ: the safety edit is 90 MME or more on a day
// (partd-opioid-safety-edit); the drug management program criterion is an average above 90 MME over
// 6 months with 3 or more prescribers and pharmacies, or 5 or more prescribers
// (partd-dmp-criteria-check); OHD is an average of 90 MME or more over 90 days or longer.
//
// Pure: no DOM, no clock, no network.

import { parseIsoStrict } from './deadline.js';
import { inputFault } from './num.js';

export const EXCLUSIONS = ['hospice', 'cancer', 'sickle-cell', 'palliative-care'];
const DAY = 86400000;
const POSTURE = 'This applies CMS\'s published method to the list entered. It is not CMS\'s display rate, and it does not say that any prescription is wrong.';
const lines = (t) => String(t ?? '').split(/\r?\n/).map((x) => x.trim()).filter(Boolean);
function date(v) { try { return parseIsoStrict(String(v ?? '').trim()); } catch { return null; } }
const iso = (t) => new Date(t).toISOString().slice(0, 10);
const r1 = (n) => Math.round(n * 10) / 10;

export function partdOpioidMeasures(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const yf = inputFault([['the measurement year', o.measurementYear, 2020, 2100, '']]);
  if (yf) return { valid: false, message: yf };
  const year = Number(o.measurementYear);
  if (!Number.isInteger(year)) return { valid: false, message: 'Enter the measurement year as a whole year, such as 2024.' };
  const start = Date.UTC(year, 0, 1); const end = Date.UTC(year, 11, 31);
  const mRows = lines(o.members); const fRows = lines(o.fills);
  if (!mRows.length) return { valid: false, message: 'Enter the members, one per line: member, age, months enrolled, enrolled through (date), and any exclusion.' };
  if (!fRows.length) return { valid: false, message: 'Enter the opioid fills, one per line: member, fill date, days supply, MME per day, prescriber, pharmacy.' };
  if (mRows.length > 2000 || fRows.length > 20000) return { valid: false, message: 'Enter at most 2,000 members and 20,000 fills.' };
  const members = new Map();
  for (const [i, row] of mRows.entries()) {
    const [id = '', age = '', months = '', through = '', ex = ''] = row.split(/[,\t]/).map((x) => x.trim());
    if (!id) return { valid: false, message: `Enter a member reference on member line ${i + 1}.` };
    if (members.has(id)) return { valid: false, message: `Enter each member once: "${id}" appears twice.` };
    const af = inputFault([[`the age on member line ${i + 1}`, age, 0, 120, 'years'], [`the months enrolled on member line ${i + 1}`, months, 1, 12, 'months']]);
    if (af) return { valid: false, message: af };
    const thr = date(through);
    if (!thr || thr.getTime() < start || thr.getTime() > end) return { valid: false, message: `Enter the last day of enrollment in ${year} on member line ${i + 1} as YYYY-MM-DD (${year}-12-31 for a full year).` };
    const e = ex.toLowerCase();
    if (e && e !== 'none' && !EXCLUSIONS.includes(e)) return { valid: false, message: `Enter an exclusion from the list on member line ${i + 1} (${EXCLUSIONS.join(', ')}), or leave it blank.` };
    members.set(id, { id, age: Number(age), my: Number(months) / 12, through: thr.getTime(), ex: e && e !== 'none' ? e : null, fills: [], prior: [] });
  }
  let ignored = 0;
  for (const [i, row] of fRows.entries()) {
    const [id = '', d = '', ds = '', mme = '', prescriber = '', pharmacy = ''] = row.split(/[,\t]/).map((x) => x.trim());
    const m = members.get(id);
    if (!m) return { valid: false, message: `Enter a member line for "${id}" (fill line ${i + 1} names a member who is not listed).` };
    const dt = date(d);
    if (!dt) return { valid: false, message: `Enter the fill date on fill line ${i + 1} as YYYY-MM-DD.` };
    const ff = inputFault([[`the days supply on fill line ${i + 1}`, ds, null, 366, 'days'], [`the MME per day on fill line ${i + 1}`, mme, 0, 5000, 'MME']]);
    if (ff) return { valid: false, message: ff };
    if (!Number.isInteger(Number(ds))) return { valid: false, message: `Enter the days supply on fill line ${i + 1} as a whole number.` };
    if (!prescriber || !pharmacy) return { valid: false, message: `Enter a prescriber and a pharmacy reference on fill line ${i + 1}.` };
    const f = { t: dt.getTime(), days: Number(ds), mme: Number(mme), prescriber: prescriber.toLowerCase(), pharmacy: pharmacy.toLowerCase() };
    if (f.t > end) { ignored += 1; continue; }
    if (f.t < start) { if (start - f.t <= 90 * DAY) m.prior.push(f); else ignored += 1; continue; }
    m.fills.push(f);
  }
  const T = { ohd: [0, 0], omp: [0, 0], iop: [0, 0] };
  const rows = []; const notes = []; let disagree = 0;
  for (const m of members.values()) {
    const r = { member: m.id, memberYears: Math.round(m.my * 1000) / 1000 };
    const fills = [...m.fills].sort((a, b) => a.t - b.t);
    const out = (reason) => ({ inDenominator: false, reason });
    let base = null;
    if (m.age < 18) base = out(`age ${m.age} is under 18`);
    else if (m.ex) base = out(`excluded: ${m.ex}`);
    // OHD and OMP share a denominator.
    if (base) { r.ohd = base; r.omp = base; } else if (new Set(fills.map((f) => f.t)).size < 2) { r.ohd = out('fewer than two opioid claims on different dates'); r.omp = r.ohd; } else if (fills.reduce((a, f) => a + f.days, 0) < 15) { r.ohd = out(`${fills.reduce((a, f) => a + f.days, 0)} cumulative days' supply; at least 15 are needed`); r.omp = r.ohd; } else if ((m.through - fills[0].t) / DAY < 90) { r.ohd = out(`enrollment runs ${Math.round((m.through - fills[0].t) / DAY)} days from the first opioid claim (${iso(fills[0].t)}); at least 90 are needed`); r.omp = r.ohd; } else {
      const stop = Math.min(m.through, end);
      const lastCovered = Math.min(stop, Math.max(...fills.map((f) => f.t + (f.days - 1) * DAY)));
      const episodeDays = Math.round((lastCovered - fills[0].t) / DAY) + 1;
      let total = 0; const cov = new Set();
      for (const f of fills) for (let k = 0; k < f.days; k += 1) { const t = f.t + k * DAY; if (t > stop) break; total += f.mme; cov.add(t); }
      const perEpisode = total / episodeDays; const perCovered = total / cov.size;
      const hi = Math.max(perEpisode, perCovered);
      const split = (perEpisode >= 90) !== (perCovered >= 90);
      if (split) disagree += 1;
      r.ohd = { inDenominator: true, reason: null, averageMmePerEpisodeDay: r1(perEpisode), averageMmePerCoveredDay: r1(perCovered), readingsDisagree: split, inNumerator: hi >= 90 };
      let multi = false;
      for (let a = 0; a < fills.length && !multi; a += 1) {
        const w = fills.filter((f) => f.t >= fills[a].t && f.t <= fills[a].t + 179 * DAY);
        if (new Set(w.map((f) => f.prescriber)).size >= 4 && new Set(w.map((f) => f.pharmacy)).size >= 4) multi = true;
      }
      r.omp = { inDenominator: true, reason: null, prescribers: new Set(fills.map((f) => f.prescriber)).size, pharmacies: new Set(fills.map((f) => f.pharmacy)).size, inNumerator: multi };
    }
    // IOP-LD
    if (base) r.iop = base; else {
      const all = [...m.prior, ...fills].sort((a, b) => a.t - b.t);
      const initials = fills.filter((f) => !all.some((g) => g.t < f.t && f.t - g.t <= 90 * DAY));
      if (!initials.length) r.iop = out(fills.length ? 'every opioid claim has another opioid claim in the 90 days before it' : 'no opioid claim in the year');
      else {
        const long = initials.some((f) => fills.filter((g) => g.t >= f.t && g.t <= f.t + 2 * DAY).reduce((a, g) => a + g.days, 0) > 7);
        r.iop = { inDenominator: true, reason: null, initialClaims: initials.length, inNumerator: long };
      }
    }
    for (const k of ['ohd', 'omp', 'iop']) if (r[k].inDenominator) { T[k][0] += m.my; if (r[k].inNumerator) T[k][1] += m.my; }
    rows.push(r);
  }
  const NAMES = { ohd: 'OHD', omp: 'OMP', iop: 'IOP-LD' };
  const rate = (k) => (T[k][0] ? Math.round((T[k][1] / T[k][0]) * 1000) / 10 : null);
  for (const k of ['ohd', 'omp', 'iop']) notes.push(`${NAMES[k]}: ${r1(T[k][0])} member-years in the denominator, ${r1(T[k][1])} in the numerator${T[k][0] ? ` (${rate(k)}%)` : ''}.`);
  for (const r of rows) {
    const p = (k, extra) => (r[k].inDenominator ? `${NAMES[k]} in the denominator${extra}, ${r[k].inNumerator ? 'in the numerator' : 'not in the numerator'}` : `${NAMES[k]} out (${r[k].reason})`);
    notes.push(`${r.member}: ${p('ohd', r.ohd.inDenominator ? ` (average ${r.ohd.averageMmePerEpisodeDay} MME per episode day, ${r.ohd.averageMmePerCoveredDay} per covered day)` : '')}; ${p('omp', r.omp.inDenominator ? ` (${r.omp.prescribers} prescribers, ${r.omp.pharmacies} pharmacies in the year)` : '')}; ${p('iop', r.iop.inDenominator ? ` (${r.iop.initialClaims} initial claim${r.iop.initialClaims === 1 ? '' : 's'})` : '')}.`);
  }
  if (disagree) notes.push(`For ${disagree} member${disagree === 1 ? '' : 's'} the two readings of "average daily MME" fall on different sides of 90. CMS's notes do not define the divisor; the higher reading was used for the numerator.`);
  if (ignored) notes.push(`${ignored} fill${ignored === 1 ? '' : 's'} dated after ${year}, or more than 90 days before it, ${ignored === 1 ? 'was' : 'were'} not used.`);
  notes.push('Fills dated in the 90 days before the year are used only as the lookback for IOP-LD. If earlier fills were not entered, a January to March claim can look like an initial claim when it is not.');
  notes.push('Average daily MME is shown two ways: total MME over the days from the first claim to the last day covered by a fill, and over the days covered by a fill. The MME per day of each fill, the exclusions and the member-months are the reader\'s entries. CMS does not report a contract with 30 or fewer member-years in a denominator.');
  notes.push('Three nearby thresholds differ: the safety edit is 90 MME or more on a day; the drug management program criterion is an average above 90 MME over 6 months with 3 or more prescribers and 3 or more pharmacies, or 5 or more prescribers; OHD is an average of 90 MME or more over 90 days or longer.');
  notes.push(POSTURE);
  const hits = rows.filter((r) => ['ohd', 'omp', 'iop'].some((k) => r[k].inNumerator)).length;
  const pack = (k) => ({ denominatorMemberYears: Math.round(T[k][0] * 1000) / 1000, numeratorMemberYears: Math.round(T[k][1] * 1000) / 1000, ratePercent: rate(k) });
  return { valid: true, measurementYear: year, ohd: pack('ohd'), omp: pack('omp'), iopLd: pack('iop'), rows, flag: hits ? 'members-in-a-numerator' : 'no-member-in-a-numerator', abnormal: hits > 0,
    band: `OHD ${rate('ohd') ?? 'no denominator'}${rate('ohd') === null ? '' : '%'}; OMP ${rate('omp') ?? 'no denominator'}${rate('omp') === null ? '' : '%'}; IOP-LD ${rate('iop') ?? 'no denominator'}${rate('iop') === null ? '' : '%'}.`, bandLabel: hits ? `${hits} member${hits === 1 ? '' : 's'} in a numerator` : 'No member in a numerator', notes, note: notes.join(' ') };
}
