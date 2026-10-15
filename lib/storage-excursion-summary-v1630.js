// spec-v1630 tool 15: temperature log, excursions and time out of range.
//
// CDC, Vaccine Storage and Handling Toolkit, July 2026 edition, re-read on October 11, 2026:
//   "Storage units must maintain the following temperature ranges at all times: Refrigerators between
//   2 C and 8 C (36 F and 46 F); Freezers between -50 C and -15 C (-58 F and +5 F); Ultra-cold
//   freezers between -90 C and -60 C (-130 F and -76 F)."
//   "Any temperature reading outside the recommended range in the manufacturer's package insert or
//   EUA factsheet is a temperature excursion." Manufacturers weigh "the magnitude of the temperature
//   excursion and the total amount of time that temperatures were out of range".
//   On an excursion: label exposed vaccines "DO NOT USE - TEMPERATURE EXCURSION", move them to the
//   correct storage conditions, "Do not discard these vaccines", document the date and time, the
//   storage unit temperature (with minimum and maximum), and contact the immunization program or the
//   manufacturers "to determine if it is safe and effective to use the impacted vaccines."
//   Section One: "freezing temperatures (0 C [32 F] or colder) can completely destroy vaccine potency."
// The toolkit also notes one frozen vaccine with a narrower range (-40 C to -15 C), which is why a
// range can be entered from the package insert.
//
// An excursion here runs from the first reading outside the range to the next reading back inside it
// (or to the last reading, when the log ends outside). A log cannot say when between two readings the
// temperature crossed, and the result says so. A reading is compared in the unit entered against the
// figure the toolkit prints for that unit (36 F, not 2 C converted to 35.6 F).
//
// The tool never says a product is still usable: the manufacturer decides. The toolkit PDF is under
// the weekly page watch.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';
import { csvText } from './csv-out.js';

export const TOOLKIT = {
  edition: 'July 2026', route: 'B', readOn: '2026-10-11',
  source: { label: 'CDC, Vaccine Storage and Handling Toolkit (July 2026)', url: 'https://www.cdc.gov/vaccines/hcp/downloads/storage-handling-toolkit.pdf' },
};
export const RANGES = {
  refrigerator: { text: 'Refrigerator, 2°C to 8°C (36°F to 46°F)', C: [2, 8], F: [36, 46] },
  freezer: { text: 'Freezer, −50°C to −15°C (−58°F to +5°F)', C: [-50, -15], F: [-58, 5] },
  'ultra-cold': { text: 'Ultra-cold freezer, −90°C to −60°C (−130°F to −76°F)', C: [-90, -60], F: [-130, -76] },
  custom: { text: 'A range from the package insert' },
};
export const RANGE_OPTIONS = Object.entries(RANGES).map(([value, r]) => ({ value, text: r.text }));
export const UNITS = [
  { value: 'C', text: '°C' },
  { value: 'F', text: '°F' },
];
const FREEZING = { C: 0, F: 32 };
const CDC_STEPS = 'CDC\'s steps for an excursion: label the exposed products "DO NOT USE", move them to the correct storage conditions, do not discard them, and contact the immunization program or the manufacturer, who decides whether they can be used.';
const NOTE = 'A log shows readings, not the moments between them: an excursion is timed from the first reading outside the range to the next one back inside. This summary never says a product is still usable; the manufacturer decides.';

const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const show = (x) => Number(Number(x).toFixed(2)).toLocaleString('en-US', { maximumFractionDigits: 2 });
const stamp = (t) => new Date(t).toISOString().slice(0, 16).replace('T', ' ');
function span(ms) {
  const m = Math.round(ms / 60000);
  const h = Math.floor(m / 60);
  return h ? `${h.toLocaleString('en-US')} h ${m % 60} min` : `${m} min`;
}
// "2026-10-01 08:00" or "2026-10-01T08:00[:00]", read as written with no time zone.
function parseStamp(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/.exec(s);
  if (!m) return null;
  const [y, mo, d, h, mi, se] = m.slice(1).map((v) => Number(v ?? 0));
  const t = Date.UTC(y, mo - 1, d, h, mi, se);
  const back = new Date(t);
  return back.getUTCFullYear() === y && back.getUTCMonth() === mo - 1 && back.getUTCDate() === d && h < 24 && mi < 60 && se < 60 ? t : null;
}

// spec-v1630 tool 15, data-logger intake: a logger's export, read as it comes. A first row with no
// readable time is a header; its temperature column is the one named "temp" or carrying a degree sign,
// and a separate time column is joined to a date column. Commas, semicolons or tabs separate the
// columns. Dates may be YYYY-MM-DD or M/D/YYYY, with HH:MM[:SS] and an optional AM or PM.
function usStamp(s) {
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})[ T]+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*([AaPp][Mm])?$/.exec(s);
  if (!m) return null;
  let h = Number(m[4]);
  if (m[7]) { if (h < 1 || h > 12) return null; h = (h % 12) + (/p/i.test(m[7]) ? 12 : 0); }
  const iso = `${m[3]}-${m[1].padStart(2, '0')}-${m[2].padStart(2, '0')} ${String(h).padStart(2, '0')}:${m[5]}${m[6] ? `:${m[6]}` : ''}`;
  return parseStamp(iso);
}
function anyStamp(s) {
  const x = String(s ?? '').trim().replace(/\s+/g, ' ');
  return parseStamp(x) ?? usStamp(x);
}
// Lines -> [{ when, temp }] strings, or { message }. A two-column "time, temperature" log passes as is.
function loggerLines(lines) {
  const sep = (l) => (l.includes('\t') ? '\t' : l.includes(';') ? ';' : ',');
  const cells = (l) => l.split(sep(l)).map((c) => c.trim().replace(/^"(.*)"$/, '$1'));
  const first = cells(lines[0]);
  // Two columns with a number in the second is a plain log, even when its first time is mistyped.
  const headerless = first.length === 2 && /^-?\d/.test(first[1]);
  if (headerless) return { rows: lines.map((l, i) => ({ i, c: cells(l), at: 0, temp: 1 })) };
  const h = first.map((c) => c.toLowerCase());
  const temp = h.findIndex((c) => /temp|°|deg/.test(c));
  const stamp = h.findIndex((c) => /date ?time|timestamp|^time ?stamp/.test(c));
  const date = h.findIndex((c) => /^date\b/.test(c) && !/time/.test(c));
  const time = h.findIndex((c) => /^time\b/.test(c) && !/stamp|zone/.test(c));
  if (temp < 0) return { message: `Enter readings as "date and time, temperature", or a logger export whose header names a temperature column. The first row read was: ${first.join(', ').slice(0, 120)}.` };
  if (stamp < 0 && date < 0) return { message: 'Enter a logger export whose header names a date and time column (or a date column and a time column).' };
  return { header: true, rows: lines.slice(1).map((l, i) => ({ i: i + 1, c: cells(l), at: stamp >= 0 ? stamp : date, time: stamp >= 0 ? -1 : time, temp })) };
}

export function storageExcursionSummary(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const unit = String(o.unit ?? '').trim();
  if (unit !== 'C' && unit !== 'F') return { valid: false, message: 'Choose the unit of the readings: °C or °F.' };
  const u = `°${unit}`;
  const kind = String(o.range ?? '').trim();
  if (!Object.prototype.hasOwnProperty.call(RANGES, kind)) return { valid: false, message: 'Choose the storage range: refrigerator, freezer, ultra-cold freezer, or a range from the package insert.' };
  const [lo0, hi0] = unit === 'F' ? [-148, 212] : [-100, 100];
  let low; let high;
  if (kind === 'custom') {
    const rf = inputFault([['the lowest temperature of the range', o.low, lo0, hi0, u], ['the highest temperature of the range', o.high, lo0, hi0, u]]);
    if (rf) return { valid: false, message: rf };
    low = Number(o.low); high = Number(o.high);
    if (!(high > low)) return { valid: false, message: 'The highest temperature of the range must be above the lowest.' };
  } else {
    if (!blank(o.low) || !blank(o.high)) return { valid: false, message: 'A lowest and highest temperature are used only with a range from the package insert. Clear them, or choose that range.' };
    [low, high] = RANGES[kind][unit];
  }
  const lines = String(o.readings ?? '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) return { valid: false, message: 'Enter at least two readings, one per line: the date and time (YYYY-MM-DD HH:MM), a comma, then the temperature.' };
  if (lines.length > 20000) return { valid: false, message: `${lines.length.toLocaleString('en-US')} lines is more than the 20,000 this tool reads.` };
  const read = loggerLines(lines);
  if (read.message) return { valid: false, message: read.message };
  if (read.rows.length < 2) return { valid: false, message: 'Enter at least two readings after the header row.' };
  const rows = [];
  for (const r of read.rows) {
    const i = r.i;
    const when = r.time >= 0 ? `${r.c[r.at] ?? ''} ${r.c[r.time] ?? ''}` : r.c[r.at];
    const t = anyStamp(when);
    if (t === null) return { valid: false, message: `Line ${i + 1}: enter the date and time as YYYY-MM-DD HH:MM (or M/D/YYYY with the time), then the temperature.` };
    // A decimal comma ("4,5") is read as a point; it can only appear when commas do not separate columns.
    const raw = String(r.c[r.temp] ?? '').replace(/\s*°?\s*[CcFf]$/, '').replace(/^(-?\d+),(\d+)$/, '$1.$2');
    const tf = inputFault([[`the temperature on line ${i + 1}`, raw, lo0, hi0, u]]);
    if (tf) return { valid: false, message: tf };
    if (rows.length && t <= rows[rows.length - 1].t) return { valid: false, message: `Line ${i + 1}: its time is not after the line before it. Put the readings in time order, one per time.` };
    rows.push({ t, v: Number(raw) });
  }

  const side = (v) => (v > high ? 'above' : v < low ? 'below' : null);
  const excursions = []; let open = null;
  for (const r of rows) {
    const s = side(r.v);
    if (open && s !== open.side) { excursions.push({ ...open, end: r.t, ended: true }); open = null; }
    if (s && !open) open = { side: s, start: r.t, extreme: r.v, readings: 0 };
    if (open) { open.readings += 1; open.extreme = s === 'above' ? Math.max(open.extreme, r.v) : Math.min(open.extreme, r.v); }
  }
  if (open) excursions.push({ ...open, end: rows[rows.length - 1].t, ended: false });
  const total = (s) => excursions.filter((e) => e.side === s).reduce((sum, e) => sum + (e.end - e.start), 0);
  const above = total('above'); const below = total('below');
  const min = Math.min(...rows.map((r) => r.v)); const max = Math.max(...rows.map((r) => r.v));
  const frozen = kind === 'refrigerator' ? rows.filter((r) => r.v <= FREEZING[unit]) : [];
  const first = rows[0].t; const last = rows[rows.length - 1].t;
  const rangeText = `${show(low)} ${u} to ${show(high)} ${u}`;

  const notes = [`${rows.length.toLocaleString('en-US')} readings from ${stamp(first)} to ${stamp(last)} against ${rangeText}: lowest ${show(min)} ${u}, highest ${show(max)} ${u}.`];
  excursions.slice(0, 50).forEach((e, i) => notes.push(`Excursion ${i + 1}, ${e.side} range: ${stamp(e.start)} to ${stamp(e.end)}${e.ended ? '' : ' (still out of range at the last reading)'}, ${span(e.end - e.start)}${e.readings === 1 && !e.ended ? ' (one reading)' : ''}; ${e.side === 'above' ? 'highest' : 'lowest'} reading ${show(e.extreme)} ${u}.`));
  if (excursions.length > 50) notes.push(`${excursions.length - 50} more excursions are not listed.`);
  if (excursions.length) notes.push(`Time out of range: ${span(above)} above and ${span(below)} below.`);
  if (frozen.length) notes.push(`Freezing flag: ${frozen.length} reading${frozen.length === 1 ? '' : 's'} at ${show(FREEZING[unit])} ${u} or colder, first at ${stamp(frozen[0].t)}. CDC: freezing temperatures can completely destroy the potency of refrigerated vaccines.`);
  if (excursions.length) notes.push(CDC_STEPS);
  const n = excursions.length;
  return {
    valid: true, excursions: n, minutesAbove: Math.round(above / 60000), minutesBelow: Math.round(below / 60000), min, max, readings: rows.length,
    freezingReadings: frozen.length, low, high, abnormal: n > 0,
    csv: csvText(['excursion', 'side', 'start', 'end', 'minutes', `highest or lowest reading (${u})`, 'back in range'], excursions.map((e, i) => [i + 1, e.side, stamp(e.start), stamp(e.end), Math.round((e.end - e.start) / 60000), e.extreme, e.ended])),
    band: n
      ? `${n} excursion${n === 1 ? '' : 's'} outside ${rangeText}: ${span(above)} above and ${span(below)} below, in ${rows.length.toLocaleString('en-US')} readings.`
      : `No reading outside ${rangeText} in ${rows.length.toLocaleString('en-US')} readings from ${stamp(first)} to ${stamp(last)}.`,
    bandLabel: n ? `${n} excursion${n === 1 ? '' : 's'}` : 'No excursion in this log',
    notes, note: NOTE,
  };
}
