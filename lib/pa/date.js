// spec-v52 §4.10: deterministic date helpers for the PA rule engine.
//
// All date arithmetic goes through this module so the engine never
// touches the local timezone (different machines run rules on the
// same packet and must produce byte-identical findings). Inputs are
// either:
//   - a Date instance (assumed to represent a UTC-midnight day), or
//   - a string in the formats Sophie's extractors emit: "YYYY-MM-DD",
//     "MM/DD/YYYY", "M/D/YYYY", "Month D, YYYY".
//
// The output of `parseDate` is always a Date at UTC midnight (so two
// dates compare equal iff they refer to the same calendar day in
// UTC), and `diffDays(a, b)` returns an integer count of UTC days.

const MONTHS = {
  jan: 0, january: 0,
  feb: 1, february: 1,
  mar: 2, march: 2,
  apr: 3, april: 3,
  may: 4,
  jun: 5, june: 5,
  jul: 6, july: 6,
  aug: 7, august: 7,
  sep: 8, sept: 8, september: 8,
  oct: 9, october: 9,
  nov: 10, november: 10,
  dec: 11, december: 11,
};

function utc(y, m, d) {
  return new Date(Date.UTC(y, m, d));
}

export function parseDate(input) {
  if (input == null) return null;
  if (input instanceof Date) {
    if (Number.isNaN(input.getTime())) return null;
    return utc(input.getUTCFullYear(), input.getUTCMonth(), input.getUTCDate());
  }
  const s = String(input).trim();
  if (!s) return null;
  let m;
  if ((m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/))) {
    return utc(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  }
  if ((m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/))) {
    let y = Number(m[3]);
    if (y < 100) y += y >= 70 ? 1900 : 2000;
    return utc(y, Number(m[1]) - 1, Number(m[2]));
  }
  if ((m = s.match(/^([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})$/))) {
    const monthKey = m[1].toLowerCase();
    const month = MONTHS[monthKey];
    if (month === undefined) return null;
    return utc(Number(m[3]), month, Number(m[2]));
  }
  return null;
}

export function isValidDate(d) {
  return d instanceof Date && !Number.isNaN(d.getTime());
}

export function diffDays(a, b) {
  if (!isValidDate(a) || !isValidDate(b)) return null;
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  return Math.round((a.getTime() - b.getTime()) / MS_PER_DAY);
}

// Returns the UTC-midnight `Date` for the moment provided. Defaults to
// "now". Centralized so the engine has one place to mock for tests.
export function todayUtc(now) {
  const t = now instanceof Date ? now : new Date();
  return utc(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate());
}
