// spec-v1637 tool 17: read the string a scanner returns from a drug package's GS1 DataMatrix.
//
// Sources, re-read October 12, 2026:
//   GS1 General Specifications, release 26.0 (ratified January 2026), and GS1's machine-readable
//   list of application identifiers (ref.gs1.org/ai). Facts used (number, length, separator):
//     (00) SSCC N18; (01) GTIN N14; (02) content GTIN N14; (11) production date N6; (15) best
//     before N6; (17) expiration N6: fixed length, no separator needed.
//     (10) lot X..20; (21) serial X..20; (240) additional id X..30; (30), (37) counts N..8;
//     (715) NHRN NDC X..20; (7003) expiry date and time N10: ended by the separator (FNC1, sent by
//     a scanner as ASCII 29) or by the end of the data.
//   3.4.7: a date is YYMMDD; "When it is not necessary to specify the day (the day field is filled
//     with two zeroes), the resultant data string SHALL be interpreted as the last day of the
//     noted month including any adjustment for leap years"; and "for regulated healthcare products
//     ... starting 1 January 2025 ... the day of the month SHALL NOT be expressed as two zeroes".
//   7.12: a two-digit year covers "from 49 years in the past to 50 years in the future of the
//     current year".
//   21 U.S.C. 360eee(14) (as the spec read it; not re-read at build): the product identifier is
//     the standardized numerical identifier (NDC and serial number), lot number and expiration
//     date.
// No GS1 text ships. The tool reads a string; it does not decode an image, and it does not say
// whether a product is genuine.
//
// Pure: the clock is a parameter (used only to place a two-digit year in its century).

import { gs1CheckDigit } from './ndc-gtin-convert-v1637.js';

const GS = '\u001d';
// [name, fixed length or null, maximum length, digits only]
const AIS = {
  '00': ['SSCC', 18, 18, true], '01': ['GTIN', 14, 14, true], '02': ['GTIN of the contents', 14, 14, true],
  '10': ['Lot', null, 20, false], '11': ['Production date', 6, 6, true], '15': ['Best before date', 6, 6, true],
  '17': ['Expiration date', 6, 6, true], '21': ['Serial number', null, 20, false], '30': ['Variable count', null, 8, true],
  '37': ['Count', null, 8, true], '240': ['Additional product identification', null, 30, false],
  '715': ['NDC (application identifier 715)', null, 20, false], '7003': ['Expiration date and time', 10, 10, true],
};
// Fixed-length identifiers that need no separator after them (GS1's predefined-length table).
const NO_SEPARATOR = new Set(['00', '01', '02', '11', '15', '17']);
const CHARSET = /^[!%-?A-Z_a-z"]+$/;
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// A two-digit year in its century: 49 years back to 50 years ahead of the current year.
function fullYear(yy, currentYear) {
  const century = Math.floor(currentYear / 100) * 100;
  const diff = yy - (currentYear % 100);
  if (diff >= 51) return century - 100 + yy;
  if (diff <= -50) return century + 100 + yy;
  return century + yy;
}
// "271130" -> { iso, text, dayZero } or { fault }.
function readDate(v, currentYear) {
  const yy = +v.slice(0, 2); const mm = +v.slice(2, 4); const dd = +v.slice(4, 6);
  if (mm < 1 || mm > 12) return { fault: `month ${v.slice(2, 4)} is not a month` };
  const year = fullYear(yy, currentYear);
  const last = new Date(Date.UTC(year, mm, 0)).getUTCDate();
  if (dd > last) return { fault: `day ${v.slice(4, 6)} is past the end of ${MONTHS[mm - 1]} ${year}` };
  const day = dd === 0 ? last : dd;
  return { iso: `${year}-${String(mm).padStart(2, '0')}-${String(day).padStart(2, '0')}`, text: `${MONTHS[mm - 1]} ${day}, ${year}`, dayZero: dd === 0 };
}

// elements(raw) -> { list: [{ ai, value }], problems: [] } from either form of the string.
function elements(raw) {
  let s = String(raw).replace(/^\](?:d2|C1|Q3|e0|J1)/, '').replace(/<GS>|\{GS\}|\\x1d|\\u001d/gi, GS).trim();
  const list = []; const problems = [];
  if (/^\(\d{2,4}\)/.test(s)) {
    const re = /\((\d{2,4})\)([^(]*)/g; let m; let last = 0;
    while ((m = re.exec(s)) !== null) { list.push({ ai: m[1], value: m[2].split(GS).join('').trim() }); last = re.lastIndex; }
    if (last < s.length) problems.push(`"${s.slice(last, last + 20)}" after the last element was not read`);
    return { list, problems };
  }
  while (s.startsWith(GS)) s = s.slice(1);
  let i = 0;
  while (i < s.length) {
    if (s[i] === GS) { i += 1; continue; }
    const ai = [4, 3, 2].map((n) => s.slice(i, i + n)).find((c) => AIS[c]);
    if (!ai) { problems.push(`"${s.slice(i, i + 12)}" does not start with an application identifier this tool reads; the rest of the string was not read`); break; }
    i += ai.length;
    const [, fixed] = AIS[ai];
    let value;
    if (fixed !== null) { value = s.slice(i, i + fixed); i += fixed; }
    else {
      const end = s.indexOf(GS, i);
      value = end === -1 ? s.slice(i) : s.slice(i, end);
      if (end === -1 && value.length > AIS[ai][2]) problems.push(`no separator was found after ${AIS[ai][0].toLowerCase()}, so everything to the end of the string was read as its value. A variable-length element that is not last needs the separator (ASCII 29); the human-readable form with parentheses avoids this`);
      i = end === -1 ? s.length : end + 1;
    }
    list.push({ ai, value });
  }
  return { list, problems };
}

export function gs1DrugBarcodeParser(input = {}, now) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.scan ?? '');
  if (!raw.trim()) return { valid: false, message: 'Enter the scanned string, raw or in the human-readable form with parentheses, such as (01)00312345678906(17)271130(10)A1B2(21)12345.' };
  if (raw.length > 500) return { valid: false, message: 'Enter one barcode\'s data: this is longer than 500 characters.' };
  const currentYear = now instanceof Date && !Number.isNaN(now.getTime()) ? now.getFullYear() : null;
  const { list, problems } = elements(raw);
  if (!list.length) return { valid: false, message: `Enter a GS1 element string. ${problems[0] ? `${problems[0].charAt(0).toUpperCase()}${problems[0].slice(1)}.` : 'No application identifier was found.'}` };
  const notes = []; const out = { valid: true, elements: [] };
  const seen = new Set();
  for (const { ai, value } of list) {
    const def = AIS[ai];
    if (!def) { problems.push(`application identifier (${ai}) is not one this tool reads`); out.elements.push({ ai, value, read: false }); notes.push(`(${ai}) ${value}: not an identifier this tool reads.`); continue; }
    const [name, fixed, max, numeric] = def;
    if (seen.has(ai)) problems.push(`application identifier (${ai}) appears more than once`);
    seen.add(ai);
    const el = { ai, name, value, read: true };
    const faults = [];
    if (value === '') faults.push('is empty');
    else if (fixed !== null && value.length !== fixed) faults.push(`has ${value.length} characters where ${fixed} are required`);
    else if (value.length > max) faults.push(`has ${value.length} characters, more than the ${max} allowed`);
    if (value !== '' && (numeric ? !/^\d+$/.test(value) : !CHARSET.test(value))) faults.push(numeric ? 'holds something other than digits' : 'holds a character outside the GS1 set');
    let line = `(${ai}) ${name}: ${value}`;
    if (!faults.length && (ai === '01' || ai === '02')) {
      const want = gs1CheckDigit(value.slice(0, 13));
      if (want !== value[13]) faults.push(`has check digit ${value[13]} where these digits take ${want}`);
      else line += ', check digit correct';
      if (ai === '01' && !faults.length) { out.gtin = value; if (value[1] === '0' && value[2] === '3') out.ndcPositionDigits = value.slice(3, 13); }
    }
    if (!faults.length && ['11', '15', '17'].includes(ai)) {
      if (currentYear === null) line += ' (YYMMDD; no clock was supplied to place the year in its century)';
      else {
        const d = readDate(value, currentYear);
        if (d.fault) faults.push(d.fault);
        else {
          el.date = d.iso; line += `, read as ${d.text}`;
          if (ai === '17') { out.expiration = d.iso; out.expirationDayWasZero = d.dayZero; }
          if (d.dayZero) line += ' (day 00 means the last day of the month)';
        }
      }
    }
    if (!faults.length && ai === '10') out.lot = value;
    if (!faults.length && ai === '21') out.serial = value;
    if (!faults.length && ai === '715') out.ndc715 = value;
    if (faults.length) { el.fault = faults.join('; '); problems.push(`${name.toLowerCase()} ${faults.join('; ')}`); line += `. Problem: it ${faults.join('; ')}`; }
    out.elements.push(el);
    notes.push(`${line}.`);
  }
  if (out.expirationDayWasZero) notes.push('GS1 says that for regulated healthcare products, starting January 1, 2025, the day of the month shall not be expressed as two zeroes. This expiration date uses 00; it is read as the last day of the month and flagged.');
  if (out.ndc715) notes.push(`NDC from application identifier (715): ${out.ndc715}.`);
  else if (out.ndcPositionDigits) notes.push(`No (715) element. The GTIN carries U.P.C. prefix 3, and the 10 digits in its NDC position are ${out.ndcPositionDigits}; the three NDC segments cannot be recovered from the digits alone, and GS1 does not say every such GTIN holds an NDC.`);
  else if (out.gtin) notes.push('No (715) element, and the GTIN does not carry U.P.C. prefix 3, so no NDC digits are read from it.');
  const have = { GTIN: Boolean(out.gtin), 'serial number': Boolean(out.serial), lot: Boolean(out.lot), 'expiration date': Boolean(out.expiration) || (currentYear === null && seen.has('17')) };
  const missing = Object.entries(have).filter(([, ok]) => !ok).map(([k]) => k);
  out.dscsaElementsPresent = missing.length === 0;
  notes.push(missing.length ? `Of the four elements of a DSCSA product identifier, not read cleanly here: ${missing.join(', ')}.` : 'All four elements of a DSCSA product identifier are present: GTIN, serial number, lot and expiration date.');
  if (problems.length) notes.push(`Problems: ${problems.join('; ')}.`);
  notes.push('This reads the string a scanner returns. It does not decode an image, and it does not say whether the product is genuine.');
  out.problems = problems;
  return { ...out, flag: problems.length ? 'problems-found' : out.dscsaElementsPresent ? 'read-all-four-elements' : 'read-with-elements-missing', abnormal: problems.length > 0,
    band: `${out.elements.filter((e) => e.read && !e.fault).length} of ${out.elements.length} element${out.elements.length === 1 ? '' : 's'} read cleanly${out.gtin ? `; GTIN ${out.gtin}` : ''}.`,
    bandLabel: problems.length ? `${problems.length} problem${problems.length === 1 ? '' : 's'} found` : out.dscsaElementsPresent ? 'All four DSCSA elements present' : `Missing: ${missing.join(', ')}`, notes, note: notes.join(' ') };
}
