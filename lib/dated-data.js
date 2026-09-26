// spec-v1501 §2: the data contract for values that change on a calendar.
//
// A tool that depends on a number published once a year -- a Part D threshold, a poverty
// guideline, a premium -- reads it only through datedValue(). While the value is current it
// comes back with its edition and source; past its validThrough date the accessor returns
// { expired: true } and the tool asks the reader for the new figure instead of computing from
// last year's. It never answers silently from an expired value.
//
// Route A values (fetched federal files) and route B values (dated constants published only as
// prose) both live here. Route B rows name the staleness-ledger row (`ledgerId`) that tracks the
// source page; route C values are reader input and never appear here.
//
// Pure: `now` is passed in (or taken from the SOPHIEWELL_NOW pin) so tests are deterministic.

import { todayUtc, parseDate, diffDays } from './pa/date.js';

// id -> { edition, validThrough: 'YYYY-MM-DD', source: { label, url }, route: 'A'|'B',
//         ledgerId?, values: { key: number|string } }
export const DATED = {};

export function datedValue(id, key, now, table = DATED) {
  const row = table[id];
  if (!row) throw new RangeError(`no dated value set "${id}"`);
  if (!(key in row.values)) throw new RangeError(`dated value set "${id}" has no key "${key}"`);
  const through = parseDate(row.validThrough);
  if (!through) throw new RangeError(`dated value set "${id}" has no valid validThrough date`);
  const today = todayUtc(now);
  if (diffDays(today, through) > 0) {
    return { expired: true, edition: row.edition, lastValue: row.values[key], source: row.source };
  }
  return { expired: false, value: row.values[key], edition: row.edition, source: row.source };
}

// The sentence a tool prints when its value has lapsed, so every tool words it the same way.
export function expiredPrompt(label, v, unitFmt = (x) => String(x)) {
  return `The ${v.edition} ${label} was ${unitFmt(v.lastValue)}. Enter the current figure from ${v.source.label}.`;
}
