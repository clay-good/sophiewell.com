// spec-v1388: the legal-holiday and business-day calendar the state-law tiles share.
//
// Several statutes count time around holidays: NY MHL 9.37 counts hours "exclusive of Sundays and
// holidays", TX HSC 573.021 rolls a deadline to "4 p.m. on the next business day", CA WIC 15630
// counts working days. Each needs that state's legal holidays, and each state writes them
// differently. The holidays here are COMPUTED FROM THE STATUTORY RULE, not listed by year, so the
// answer next year needs no edit:
//
//   NY  General Construction Law s.24. Sunday holiday -> the next day. No Saturday shift. Every
//       general election day is a public holiday.
//   NJ  N.J.S.A. 36:1-1. Sunday holiday -> the Monday next following. No Saturday shift. Good
//       Friday, Lincoln's Birthday, and every general election day are legal holidays; Juneteenth
//       is the third Friday in June.
//   CA  Government Code ss.6700-6701. Sunday -> Monday only for Jan 1, Feb 12, Mar 31, Jul 4,
//       Sep 9, Nov 11, Dec 25 (s.6701(a)); Nov 11 on a Saturday -> the preceding Friday (s.6701(b)).
//       March 31 is "Farmworkers Day" since AB 2156 (effective March 26, 2026), formerly Cesar Chavez
//       Day. Good Friday is a holiday from noon to 3 p.m. only. Thanksgiving is the Thursday the
//       President appoints (s.6700(a)(20)), taken here as the fourth Thursday in November.
//   TX  Government Code s.662.003. National holidays and the Friday after Thanksgiving, Dec 24 and
//       Dec 26 are closures; Confederate Heroes Day, Texas Independence Day, San Jacinto Day,
//       Emancipation Day and LBJ Day are state holidays on which agencies must stay staffed
//       (s.662.004), so they are reported as STAFFED, not as closures. Optional holidays (Rosh
//       Hashanah, Yom Kippur, Good Friday) are not closures and are not computed. No weekend shift
//       (s.662.005).
//
// WHAT IS NOT COMPUTED, AND SAYS SO: California's Lunar New Year ("the second new moon following
// the winter solstice") and Diwali ("the 15th day of the month of Kartik in the Hindu lunar
// calendar") follow lunar calendars, and neither the statute nor CalHR publishes the Gregorian
// date. The calendar does not guess them. It counts those days as working days -- the earlier, not
// the later, deadline -- and any count that crosses their window returns a caveat naming them.
//
// A tile never reads the clock. Times are LOCAL WALL-CLOCK times, 'YYYY-MM-DDTHH:MM', in the
// state's own zone. Hours are counted in REAL elapsed time across the daylight-saving changes
// (second Sunday in March, first Sunday in November, at 2 a.m.), which all four states observe.
//
// Pure: no DOM, no clock, no network.

export const STATES = [
  { value: 'NY', text: 'New York' },
  { value: 'NJ', text: 'New Jersey' },
  { value: 'CA', text: 'California' },
  { value: 'TX', text: 'Texas' },
];

// The state picker (spec-v1388 s.1): required, no default -- a preselected state would answer a
// Texas nurse with New York law. A tile covering fewer states lists only those, in this order, so it
// never shows a state it then refuses.
export function stateOptions(covered = STATES.map((s) => s.value)) {
  const set = new Set(covered);
  const out = STATES.filter((s) => set.has(s.value));
  if (out.length !== set.size) throw new Error(`Unknown state in [${[...set].join(', ')}]. Choose from NY, NJ, CA, TX.`);
  return out;
}

// The one closing scope sentence a legal answer carries (spec-v1388 s.4). The answer states the
// rule and its section; it never says "you are compliant" or "this is legal".
export function scopeSentence(asOf) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(asOf || ''))) throw new Error('scopeSentence needs the verified date, YYYY-MM-DD.');
  const d = new Date(asOf + 'T00:00:00Z');
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return `This states the statute as of ${months[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}. It does not replace your facility's policy, its counsel, or the court.`;
}

export const STATE_SOURCES = {
  NY: 'N.Y. General Construction Law s.24',
  NJ: 'N.J.S.A. 36:1-1',
  CA: 'Cal. Gov. Code ss.6700-6701',
  TX: 'Tex. Gov. Code ss.662.003-662.005',
};

const DAY = 86400000;
const HOUR = 3600000;

// --- date arithmetic on UTC-anchored calendar dates -------------------------------------------

function ymd(y, m, d) { return Date.UTC(y, m - 1, d); }
function iso(t) { return new Date(t).toISOString().slice(0, 10); }
function weekday(t) { return new Date(t).getUTCDay(); } // 0 Sunday .. 6 Saturday

export function parseDate(s) {
  const str = String(s ?? '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) return null;
  const t = Date.parse(str + 'T00:00:00Z');
  if (!Number.isFinite(t) || iso(t) !== str) return null;
  return t;
}

export function parseDateTime(s) {
  const str = String(s ?? '').trim();
  const m = /^(\d{4}-\d{2}-\d{2})[T ](\d{2}):(\d{2})$/.exec(str);
  if (!m) return null;
  const day = parseDate(m[1]);
  const h = Number(m[2]);
  const mi = Number(m[3]);
  if (day === null || h > 23 || mi > 59) return null;
  return day + h * HOUR + mi * 60000;
}

export function formatDateTime(wall) {
  const d = new Date(wall);
  const s = d.toISOString();
  return `${s.slice(0, 10)}T${s.slice(11, 16)}`;
}

function nthWeekday(y, m, dow, n) {
  const first = ymd(y, m, 1);
  const offset = (dow - weekday(first) + 7) % 7;
  return first + (offset + (n - 1) * 7) * DAY;
}
function lastWeekday(y, m, dow) {
  const last = ymd(y, m + 1, 1) - DAY;
  const back = (weekday(last) - dow + 7) % 7;
  return last - back * DAY;
}

// Anonymous Gregorian algorithm (Meeus/Jones/Butcher).
export function easter(y) {
  const a = y % 19;
  const b = Math.floor(y / 100);
  const c = y % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return ymd(y, month, day);
}

// The general election: the Tuesday next after the first Monday in November.
function electionDay(y) { return nthWeekday(y, 11, 1, 1) + DAY; }

// --- the four statutes ------------------------------------------------------------------------

function nyRules(y) {
  return [
    { name: "New Year's Day", t: ymd(y, 1, 1), shift: 'sunday-next' },
    { name: 'Dr. Martin Luther King, Jr. Day', t: nthWeekday(y, 1, 1, 3) },
    { name: "Lincoln's Birthday", t: ymd(y, 2, 12), shift: 'sunday-next' },
    { name: "Washington's Birthday", t: nthWeekday(y, 2, 1, 3) },
    { name: 'Memorial Day', t: lastWeekday(y, 5, 1) },
    { name: 'Flag Day', t: nthWeekday(y, 6, 0, 2) }, // always a Sunday, and excepted from the shift
    { name: 'Juneteenth', t: ymd(y, 6, 19), shift: 'sunday-next' },
    { name: 'Independence Day', t: ymd(y, 7, 4), shift: 'sunday-next' },
    { name: 'Labor Day', t: nthWeekday(y, 9, 1, 1) },
    { name: 'Columbus Day', t: nthWeekday(y, 10, 1, 2) },
    { name: 'General Election Day', t: electionDay(y) },
    { name: "Veterans' Day", t: ymd(y, 11, 11), shift: 'sunday-next' },
    { name: 'Thanksgiving Day', t: nthWeekday(y, 11, 4, 4) },
    { name: 'Christmas Day', t: ymd(y, 12, 25), shift: 'sunday-next' },
  ];
}

function njRules(y) {
  return [
    { name: "New Year's Day", t: ymd(y, 1, 1), shift: 'sunday-next' },
    { name: "Martin Luther King's Birthday", t: nthWeekday(y, 1, 1, 3) },
    { name: "Lincoln's Birthday", t: ymd(y, 2, 12), shift: 'sunday-next' },
    { name: "Washington's Birthday", t: nthWeekday(y, 2, 1, 3) },
    { name: 'Good Friday', t: easter(y) - 2 * DAY },
    { name: 'Memorial Day', t: lastWeekday(y, 5, 1) },
    { name: 'Juneteenth Day', t: nthWeekday(y, 6, 5, 3) },
    { name: 'Independence Day', t: ymd(y, 7, 4), shift: 'sunday-next' },
    { name: 'Labor Day', t: nthWeekday(y, 9, 1, 1) },
    { name: 'Columbus Day', t: nthWeekday(y, 10, 1, 2) },
    { name: 'General Election Day', t: electionDay(y) },
    { name: "Veterans' Day", t: ymd(y, 11, 11), shift: 'sunday-next' },
    { name: 'Thanksgiving Day', t: nthWeekday(y, 11, 4, 4) },
    { name: 'Christmas Day', t: ymd(y, 12, 25), shift: 'sunday-next' },
  ];
}

function caRules(y) {
  return [
    { name: "New Year's Day", t: ymd(y, 1, 1), shift: 'sunday-next' },
    { name: 'Dr. Martin Luther King, Jr. Day', t: nthWeekday(y, 1, 1, 3) },
    { name: 'Lincoln Day', t: ymd(y, 2, 12), shift: 'sunday-next' },
    { name: "Washington's Birthday (third Monday in February)", t: nthWeekday(y, 2, 1, 3) },
    { name: 'Farmworkers Day', t: ymd(y, 3, 31), shift: 'sunday-next' },
    { name: 'Good Friday, noon to 3 p.m.', t: easter(y) - 2 * DAY, kind: 'partial' },
    { name: 'Genocide Remembrance Day', t: ymd(y, 4, 24) },
    { name: 'Memorial Day', t: lastWeekday(y, 5, 1) },
    { name: 'Juneteenth', t: ymd(y, 6, 19) },
    { name: 'Independence Day', t: ymd(y, 7, 4), shift: 'sunday-next' },
    { name: 'Labor Day', t: nthWeekday(y, 9, 1, 1) },
    { name: 'Admission Day', t: ymd(y, 9, 9), shift: 'sunday-next' },
    { name: 'Native American Day', t: nthWeekday(y, 9, 5, 4) },
    { name: 'Columbus Day', t: nthWeekday(y, 10, 1, 2) },
    { name: 'Veterans Day', t: ymd(y, 11, 11), shift: 'sunday-next-saturday-prior' },
    { name: 'Thanksgiving Day', t: nthWeekday(y, 11, 4, 4) },
    { name: 'Christmas Day', t: ymd(y, 12, 25), shift: 'sunday-next' },
  ];
}

function txRules(y) {
  const thanksgiving = nthWeekday(y, 11, 4, 4);
  return [
    { name: "New Year's Day", t: ymd(y, 1, 1) },
    { name: 'Martin Luther King, Jr., Day', t: nthWeekday(y, 1, 1, 3) },
    { name: 'Confederate Heroes Day', t: ymd(y, 1, 19), kind: 'staffed' },
    { name: "Presidents' Day", t: nthWeekday(y, 2, 1, 3) },
    { name: 'Texas Independence Day', t: ymd(y, 3, 2), kind: 'staffed' },
    { name: 'San Jacinto Day', t: ymd(y, 4, 21), kind: 'staffed' },
    { name: 'Memorial Day', t: lastWeekday(y, 5, 1) },
    { name: 'Emancipation Day', t: ymd(y, 6, 19), kind: 'staffed' },
    { name: 'Independence Day', t: ymd(y, 7, 4) },
    { name: 'Lyndon Baines Johnson Day', t: ymd(y, 8, 27), kind: 'staffed' },
    { name: 'Labor Day', t: nthWeekday(y, 9, 1, 1) },
    { name: 'Veterans Day', t: ymd(y, 11, 11) },
    { name: 'Thanksgiving Day', t: thanksgiving },
    { name: 'Friday after Thanksgiving Day', t: thanksgiving + DAY },
    { name: 'December 24', t: ymd(y, 12, 24) },
    { name: 'Christmas Day', t: ymd(y, 12, 25) },
    { name: 'December 26', t: ymd(y, 12, 26) },
  ];
}

const RULES = { NY: nyRules, NJ: njRules, CA: caRules, TX: txRules };

// The two California holidays the calendar does not compute, and the windows they can fall in.
const CA_LUNAR = [
  { name: 'Lunar New Year', from: [1, 21], to: [2, 20] },
  { name: 'Diwali', from: [10, 15], to: [11, 15] },
];

function checkState(state) {
  if (!RULES[state]) throw new Error(`Unknown state "${state}". Choose one of NY, NJ, CA, TX.`);
}

// Every holiday in the year, with observance shifts as their own entries. kind:
//   closure  a legal holiday: not a business day
//   staffed  a state holiday on which offices must stay staffed (Texas): still a business day
//   partial  a holiday for part of the day (California Good Friday, noon to 3 p.m.)
const cache = new Map();
export function holidaysInYear(state, year) {
  checkState(state);
  const key = `${state}:${year}`;
  if (cache.has(key)) return cache.get(key);
  const out = [];
  for (const r of RULES[state](year)) {
    const kind = r.kind || 'closure';
    out.push({ date: iso(r.t), name: r.name, kind });
    const wd = weekday(r.t);
    if ((r.shift === 'sunday-next' || r.shift === 'sunday-next-saturday-prior') && wd === 0) {
      out.push({ date: iso(r.t + DAY), name: `${r.name} (observed)`, kind, observedFrom: iso(r.t) });
    }
    if (r.shift === 'sunday-next-saturday-prior' && wd === 6) {
      out.push({ date: iso(r.t - DAY), name: `${r.name} (observed)`, kind, observedFrom: iso(r.t) });
    }
  }
  out.sort((a, b) => a.date.localeCompare(b.date));
  cache.set(key, out);
  return out;
}

export function isLegalHoliday(state, date) {
  const t = typeof date === 'number' ? date : parseDate(date);
  if (t === null) throw new Error(`Not a date: "${date}". Use YYYY-MM-DD.`);
  const day = iso(t);
  const list = holidaysInYear(state, Number(day.slice(0, 4))).filter((h) => h.date === day);
  if (!list.length) return null;
  if (list.length === 1) return list[0];
  // Two holidays on one date (Texas: MLK Day and Confederate Heroes Day on January 19, 2026). The
  // most binding kind wins, so a closure is never hidden behind a staffed day, and both are named.
  const rank = { closure: 0, partial: 1, staffed: 2 };
  const sorted = [...list].sort((a, b) => rank[a.kind] - rank[b.kind]);
  return { ...sorted[0], name: sorted.map((h) => h.name).join(' and '), also: sorted.slice(1) };
}

function isClosure(state, t) {
  const h = isLegalHoliday(state, t);
  return !!(h && h.kind === 'closure');
}

export function isBusinessDay(state, date) {
  const t = typeof date === 'number' ? date : parseDate(date);
  if (t === null) throw new Error(`Not a date: "${date}". Use YYYY-MM-DD.`);
  const wd = weekday(t);
  return wd !== 0 && wd !== 6 && !isClosure(state, t);
}

// The first business day strictly after the date.
export function nextBusinessDay(state, date) {
  const t0 = typeof date === 'number' ? Math.floor(date / DAY) * DAY : parseDate(date);
  if (t0 === null) throw new Error(`Not a date: "${date}". Use YYYY-MM-DD.`);
  let t = t0 + DAY;
  for (let i = 0; i < 30; i += 1) {
    if (isBusinessDay(state, t)) return iso(t);
    t += DAY;
  }
  throw new Error('No business day within 30 days.');
}

// --- daylight saving: US rules since 2007, local 2 a.m. on both changes -----------------------

function dstBounds(y) {
  return { start: nthWeekday(y, 3, 0, 2) + 2 * HOUR, end: nthWeekday(y, 11, 0, 1) + 2 * HOUR };
}
// A wall-clock time is in DST from 03:00 on the start day (02:00-03:00 does not exist) until 01:00
// standard on the end day; the 01:00-02:00 hour of the end day happens twice and is read as the
// FIRST (daylight) occurrence.
function wallInDst(wall) {
  const y = new Date(wall).getUTCFullYear();
  const { start, end } = dstBounds(y);
  return wall >= start + HOUR && wall < end;
}
function toReal(wall) { return wall - (wallInDst(wall) ? HOUR : 0); }
function fromReal(real) {
  const y = new Date(real).getUTCFullYear();
  const { start, end } = dstBounds(y);
  // Real-time boundaries, measured on the standard-time scale: DST begins at 02:00 standard and
  // ends at 01:00 standard on the end day.
  const inDst = real >= start && real < end - HOUR;
  return real + (inDst ? HOUR : 0);
}

export function isNonexistentWallTime(wall) {
  const { start } = dstBounds(new Date(wall).getUTCFullYear());
  return wall >= start && wall < start + HOUR;
}
export function isAmbiguousWallTime(wall) {
  const { end } = dstBounds(new Date(wall).getUTCFullYear());
  return wall >= end - HOUR && wall < end;
}

function dstCaveats(startWall, endWall) {
  const out = [];
  if (isNonexistentWallTime(startWall)) out.push('The start time falls in the hour skipped when clocks spring forward; it is read as the moment after the change.');
  if (isAmbiguousWallTime(startWall) || isAmbiguousWallTime(endWall)) out.push('A time falls in the hour repeated when clocks fall back; it is read as the first (daylight-time) occurrence.');
  for (let y = new Date(startWall).getUTCFullYear(); y <= new Date(endWall).getUTCFullYear(); y += 1) {
    const { start, end } = dstBounds(y);
    if (startWall < start && endWall >= start) out.push(`The interval crosses the spring daylight-saving change (${iso(start)}), so it holds one fewer hour on the clock.`);
    if (startWall < end && endWall >= end) out.push(`The interval crosses the fall daylight-saving change (${iso(end)}), so it holds one more hour on the clock.`);
  }
  return out;
}

// Real elapsed hours added to a local wall-clock time.
export function addHours(start, hours) {
  const w = typeof start === 'number' ? start : parseDateTime(start);
  if (w === null) throw new Error(`Not a date and time: "${start}". Use YYYY-MM-DDTHH:MM.`);
  if (!Number.isFinite(hours) || hours < 0) throw new Error('Hours must be zero or more.');
  const end = fromReal(toReal(w) + hours * HOUR);
  return { end: formatDateTime(end), endWall: end, caveats: dstCaveats(w, end) };
}

function lunarCaveats(state, startWall, endWall) {
  if (state !== 'CA') return [];
  const out = [];
  const y0 = new Date(startWall).getUTCFullYear();
  const y1 = new Date(endWall).getUTCFullYear();
  for (let y = y0; y <= y1; y += 1) {
    for (const h of CA_LUNAR) {
      const from = ymd(y, h.from[0], h.from[1]);
      const to = ymd(y, h.to[0], h.to[1]) + DAY;
      if (startWall < to && endWall >= from) {
        out.push(`California's ${h.name} follows a lunar calendar and falls between ${iso(from)} and ${iso(to - DAY)}; this count treats it as a working day. If it applies and falls inside the interval, the deadline is one day later.`);
      }
    }
  }
  return out;
}

function nonClosureCaveats(state, startWall, endWall) {
  const out = [];
  for (let t = Math.floor(startWall / DAY) * DAY; t <= endWall; t += DAY) {
    const h = isLegalHoliday(state, t);
    if (h && h.kind === 'staffed') out.push(`${h.name} (${h.date}) is a Texas state holiday on which offices stay staffed; it is counted as a business day.`);
    if (h && h.kind === 'partial') out.push(`${h.name} (${h.date}) is a holiday for part of the day only; it is counted as a working day.`);
  }
  return out;
}

// Count REAL hours forward from a local start time, skipping any hour that falls on a Sunday or a
// legal holiday (closure) in that state. This is how NY MHL 9.37 counts its 72 hours.
export function addExcludingSundaysAndHolidays(state, start, hours) {
  checkState(state);
  const w = typeof start === 'number' ? start : parseDateTime(start);
  if (w === null) throw new Error(`Not a date and time: "${start}". Use YYYY-MM-DDTHH:MM.`);
  if (!Number.isFinite(hours) || hours < 0) throw new Error('Hours must be zero or more.');
  let remaining = hours * HOUR;
  let cur = w;
  const skipped = [];
  for (let guard = 0; guard < 400; guard += 1) {
    const dayStart = Math.floor(cur / DAY) * DAY;
    const nextMidnight = dayStart + DAY;
    const excluded = weekday(dayStart) === 0 || isClosure(state, dayStart);
    if (excluded) {
      const h = isLegalHoliday(state, dayStart);
      skipped.push(h ? `${iso(dayStart)} (${h.name})` : `${iso(dayStart)} (Sunday)`);
      cur = nextMidnight;
      continue;
    }
    const available = toReal(nextMidnight) - toReal(cur);
    if (remaining <= available) {
      const end = fromReal(toReal(cur) + remaining);
      return {
        end: formatDateTime(end), endWall: end, skipped,
        caveats: [...dstCaveats(w, end), ...lunarCaveats(state, w, end), ...nonClosureCaveats(state, w, end)],
      };
    }
    remaining -= available;
    cur = nextMidnight;
  }
  throw new Error('The count ran past 400 days.');
}

// Real elapsed hours between two local wall-clock times.
export function elapsedHours(start, end) {
  const a = typeof start === 'number' ? start : parseDateTime(start);
  const b = typeof end === 'number' ? end : parseDateTime(end);
  if (a === null || b === null) throw new Error('Use YYYY-MM-DDTHH:MM for both times.');
  return (toReal(b) - toReal(a)) / HOUR;
}

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// A deadline as a nurse checks it against the clock on the wall: the date and time AND the
// interval from the start (spec-v1388 s.4).
export function formatDeadline(start, end, startLabel = 'the start') {
  const a = typeof start === 'number' ? start : parseDateTime(start);
  const b = typeof end === 'number' ? end : parseDateTime(end);
  if (a === null || b === null) throw new Error('Use YYYY-MM-DDTHH:MM for both times.');
  const d = new Date(b);
  const h = d.getUTCHours();
  const m = d.getUTCMinutes();
  const clock = `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'am' : 'pm'}`;
  const hrs = elapsedHours(a, b);
  const span = Number.isInteger(hrs) ? `${hrs} h` : `${Math.floor(hrs)} h ${Math.round((hrs % 1) * 60)} min`;
  return `${WEEKDAYS[d.getUTCDay()]}, ${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}, ${clock}, ${span} after ${startLabel}`;
}
