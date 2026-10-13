// spec-v1638 tool 11: the Part D concurrent-use safety measures (COB, Poly-ACH, Poly-CNS).
//
// Sources, re-read October 12, 2026:
//   CMS, Medicare 2027 Part C & D Star Ratings Technical Notes (September 30, 2026), measure D12
//     (COB): beneficiaries 18 or older "with at least two prescription claims for opioid medications
//     with unique DOS and at least 15 cumulative days' supply of opioids during the measurement
//     period and an IPSD that occurs at least 30 days prior to the end of the measurement period";
//     numerator, "at least two prescription claims for any benzodiazepines with unique dates of
//     service (DOS) and concurrent use of opioids and benzodiazepines for at least 30 cumulative
//     days". Excluded: hospice, cancer diagnosis, sickle cell disease diagnosis, palliative care,
//     cancer-related pain treatment diagnosis.
//   The same notes, measure D13 (Poly-ACH): 65 or older "with at least two prescription claims with
//     different DOS of the same ACH medication"; "the earliest DOS for any target medication with at
//     least two prescription claims on different DOS, should be at least 30 days from the last day
//     of the measurement period"; numerator, "concurrent use for at least 30 cumulative days of two
//     or more unique ACH medications, each with at least two prescription claims with different
//     dates of service". Excluded: hospice.
//   CMS, 2026 Display Measures Technical Notes (December 16, 2025), DMD14 (Poly-CNS): the same shape
//     with "3 or more CNS active medications"; excluded: hospice, seizure disorder diagnosis. It
//     states no index-date cutoff, so none is applied.
//   All three: "Concurrent use is defined as overlapping days' supply for at least 30 cumulative
//     days during the measurement period"; continuous enrollment allows one gap of up to one
//     calendar month; a lower rate is better.
//
// The method is CMS's public text. No PQA specification or medication list is shipped: the reader
// assigns each fill its class and names its medication. CMS's notes do not say how days' supply is
// laid on the calendar. This tool counts each fill from its fill date for its days' supply, stops at
// December 31, and does not shift a fill that overlaps an earlier fill of the same medication.
//
// Pure: no DOM, no clock, no network.

import { parseIsoStrict } from './deadline.js';
import { inputFault } from './num.js';

export const CLASSES = ['opioid', 'benzodiazepine', 'anticholinergic', 'cns'];
export const EXCLUSIONS = ['hospice', 'cancer', 'sickle-cell', 'palliative-care', 'cancer-pain', 'seizure'];
const COB_EX = ['hospice', 'cancer', 'sickle-cell', 'palliative-care', 'cancer-pain'];
const DAY = 86400000;
const POSTURE = 'This applies CMS\'s published method to the list entered. It is not CMS\'s rating, and it does not say that any prescription is wrong.';
const lines = (t) => String(t ?? '').split(/\r?\n/).map((x) => x.trim()).filter(Boolean);
function date(v) { try { return parseIsoStrict(String(v ?? '').trim()); } catch { return null; } }
const iso = (t) => new Date(t).toISOString().slice(0, 10);

// Days (as day numbers) a fill covers inside the year.
function covered(fill, end) { const out = []; for (let i = 0; i < fill.days; i += 1) { const t = fill.t + i * DAY; if (t > end) break; out.push(t); } return out; }

function poly(m, cls, need, end, cutoff) {
  const byMed = new Map();
  for (const f of m.fills.filter((x) => x.cls === cls)) { if (!byMed.has(f.med)) byMed.set(f.med, []); byMed.get(f.med).push(f); }
  const qualifying = [...byMed.entries()].filter(([, fs]) => new Set(fs.map((f) => f.t)).size >= 2);
  if (!qualifying.length) return { inDenominator: false, reason: 'no medication of this class has two claims on different dates' };
  if (cutoff) {
    const first = Math.min(...qualifying.flatMap(([, fs]) => fs.map((f) => f.t)));
    const before = Math.round((end - first) / DAY);
    if (before < 30) return { inDenominator: false, reason: `the earliest qualifying fill (${iso(first)}) is ${before} days from the last day of the year; at least 30 are needed` };
  }
  const count = new Map();
  for (const [, fs] of qualifying) { const days = new Set(fs.flatMap((f) => covered(f, end))); for (const d of days) count.set(d, (count.get(d) || 0) + 1); }
  const overlap = [...count.values()].filter((n) => n >= need).length;
  return { inDenominator: true, reason: null, qualifyingMedications: qualifying.length, overlapDays: overlap, inNumerator: qualifying.length >= need && overlap >= 30 };
}

export function partdConcurrentUseMeasures(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const yf = inputFault([['the measurement year', o.measurementYear, 2020, 2100, '']]);
  if (yf) return { valid: false, message: yf };
  const year = Number(o.measurementYear);
  if (!Number.isInteger(year)) return { valid: false, message: 'Enter the measurement year as a whole year, such as 2025.' };
  const start = Date.UTC(year, 0, 1); const end = Date.UTC(year, 11, 31);
  const mRows = lines(o.members); const fRows = lines(o.fills);
  if (!mRows.length) return { valid: false, message: 'Enter the members, one per line: member, age, continuously enrolled (yes or no), and any exclusions.' };
  if (!fRows.length) return { valid: false, message: 'Enter the fills, one per line: member, fill date, days supply, medication, class.' };
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
    const exs = ex.toLowerCase().split(/[;|]/).map((x) => x.trim()).filter((x) => x && x !== 'none');
    const bad = exs.find((x) => !EXCLUSIONS.includes(x));
    if (bad) return { valid: false, message: `Enter exclusions from the list on member line ${i + 1} (${EXCLUSIONS.join(', ')}), separated by semicolons, or leave it blank.` };
    members.set(id, { id, age: Number(age), ce: c === 'yes', ex: exs, fills: [] });
  }
  let outside = 0;
  for (const [i, row] of fRows.entries()) {
    const [id = '', d = '', ds = '', med = '', cls = ''] = row.split(/[,\t]/).map((x) => x.trim());
    const m = members.get(id);
    if (!m) return { valid: false, message: `Enter a member line for "${id}" (fill line ${i + 1} names a member who is not listed).` };
    const dt = date(d);
    if (!dt) return { valid: false, message: `Enter the fill date on fill line ${i + 1} as YYYY-MM-DD.` };
    const df = inputFault([[`the days supply on fill line ${i + 1}`, ds, null, 366, 'days']]);
    if (df) return { valid: false, message: df };
    if (!Number.isInteger(Number(ds))) return { valid: false, message: `Enter the days supply on fill line ${i + 1} as a whole number.` };
    if (!med) return { valid: false, message: `Enter the medication (active ingredient) on fill line ${i + 1}.` };
    const c = cls.toLowerCase();
    if (!CLASSES.includes(c)) return { valid: false, message: `Enter the class on fill line ${i + 1} as one of: ${CLASSES.join(', ')}.` };
    if (dt.getTime() < start || dt.getTime() > end) { outside += 1; continue; }
    m.fills.push({ t: dt.getTime(), days: Number(ds), med: med.toLowerCase(), cls: c });
  }
  const tally = { cob: [0, 0], polyAch: [0, 0], polyCns: [0, 0] };
  const rows = []; const notes = [];
  for (const m of members.values()) {
    const r = { member: m.id };
    const out = (reason) => ({ inDenominator: false, reason });
    // COB
    const op = m.fills.filter((f) => f.cls === 'opioid'); const bz = m.fills.filter((f) => f.cls === 'benzodiazepine');
    const cobEx = m.ex.find((x) => COB_EX.includes(x));
    if (!m.ce) r.cob = out('not continuously enrolled');
    else if (m.age < 18) r.cob = out(`age ${m.age} is under 18`);
    else if (cobEx) r.cob = out(`excluded: ${cobEx}`);
    else if (new Set(op.map((f) => f.t)).size < 2) r.cob = out('fewer than two opioid claims on different dates');
    else if (op.reduce((a, f) => a + f.days, 0) < 15) r.cob = out(`${op.reduce((a, f) => a + f.days, 0)} cumulative days' supply of opioids; at least 15 are needed`);
    else {
      const ipsd = Math.min(...op.map((f) => f.t)); const before = Math.round((end - ipsd) / DAY);
      if (before < 30) r.cob = out(`the first opioid fill (${iso(ipsd)}) is ${before} days before the end of the year; at least 30 are needed`);
      else {
        const od = new Set(op.flatMap((f) => covered(f, end))); const bd = new Set(bz.flatMap((f) => covered(f, end)));
        const overlap = [...od].filter((d) => bd.has(d)).length;
        const twoBenzo = new Set(bz.map((f) => f.t)).size >= 2;
        r.cob = { inDenominator: true, reason: null, overlapDays: overlap, inNumerator: twoBenzo && overlap >= 30 };
      }
    }
    // Poly-ACH and Poly-CNS
    for (const [key, cls, need, exs, cutoff] of [['polyAch', 'anticholinergic', 2, ['hospice'], true], ['polyCns', 'cns', 3, ['hospice', 'seizure'], false]]) {
      const ex = m.ex.find((x) => exs.includes(x));
      if (!m.ce) r[key] = out('not continuously enrolled');
      else if (m.age < 65) r[key] = out(`age ${m.age} is under 65`);
      else if (ex) r[key] = out(`excluded: ${ex}`);
      else r[key] = poly(m, cls, need, end, cutoff);
    }
    for (const k of ['cob', 'polyAch', 'polyCns']) if (r[k].inDenominator) { tally[k][0] += 1; if (r[k].inNumerator) tally[k][1] += 1; }
    rows.push(r);
  }
  const NAMES = { cob: 'COB', polyAch: 'Poly-ACH', polyCns: 'Poly-CNS' };
  const rate = (k) => (tally[k][0] ? Math.round((tally[k][1] / tally[k][0]) * 1000) / 10 : null);
  for (const k of ['cob', 'polyAch', 'polyCns']) notes.push(`${NAMES[k]}: ${tally[k][0]} in the denominator, ${tally[k][1]} in the numerator${tally[k][0] ? ` (${rate(k)}%)` : ''}.`);
  for (const r of rows) {
    const part = (k) => (r[k].inDenominator ? `${NAMES[k]} in the denominator, ${r[k].overlapDays} overlap day${r[k].overlapDays === 1 ? '' : 's'}, ${r[k].inNumerator ? 'in the numerator' : 'not in the numerator'}` : `${NAMES[k]} out (${r[k].reason})`);
    notes.push(`${r.member}: ${part('cob')}; ${part('polyAch')}; ${part('polyCns')}.`);
  }
  if (outside) notes.push(`${outside} fill${outside === 1 ? '' : 's'} dated outside ${year} ${outside === 1 ? 'was' : 'were'} not counted.`);
  if (['cob', 'polyAch', 'polyCns'].some((k) => tally[k][0] && tally[k][0] < 30)) notes.push('CMS rates a contract on a measure only with 30 or more members in its denominator; the rates are shown for this list all the same.');
  notes.push('A lower rate is better on all three. COB and Poly-ACH are Star Ratings measures from the 2027 ratings (measurement year 2025); Poly-CNS is a display measure.');
  notes.push('How the days were counted: each fill runs from its fill date for its days\' supply and stops at December 31; a fill that overlaps an earlier fill of the same medication is not moved later. CMS\'s notes do not state these details. "The same medication" is the medication name entered (for Poly-ACH, the same anticholinergic active ingredient). Classes, exclusions and continuous enrollment are the reader\'s entries; no medication list is supplied.');
  notes.push(POSTURE);
  const any = tally.cob[1] + tally.polyAch[1] + tally.polyCns[1];
  return { valid: true, measurementYear: year, cob: { denominator: tally.cob[0], numerator: tally.cob[1], ratePercent: rate('cob') }, polyAch: { denominator: tally.polyAch[0], numerator: tally.polyAch[1], ratePercent: rate('polyAch') }, polyCns: { denominator: tally.polyCns[0], numerator: tally.polyCns[1], ratePercent: rate('polyCns') }, rows,
    flag: any ? 'members-in-a-numerator' : 'no-member-in-a-numerator', abnormal: any > 0,
    band: `COB ${tally.cob[1]} of ${tally.cob[0]}; Poly-ACH ${tally.polyAch[1]} of ${tally.polyAch[0]}; Poly-CNS ${tally.polyCns[1]} of ${tally.polyCns[0]}.`, bandLabel: any ? `${any} numerator hit${any === 1 ? '' : 's'}` : 'No numerator hits', notes, note: notes.join(' ') };
}
