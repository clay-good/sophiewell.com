// spec-v1636 tool 15: count antimicrobial days and days present from the reader's own rows.
//
// Source: CDC NHSN, Antimicrobial Use and Resistance (AUR) Module protocol, July 2026, re-read
// October 12, 2026.
//   Numerator: "the aggregate sum of days for which any amount of a specific antimicrobial agent
//     was administered to individual patients"; "only counted as an antimicrobial day on the day of
//     administration. For example, when a patient is administered 1 gram Vancomycin intravenously
//     twice daily for three days, three 'Vancomycin Days (total)' and three 'Vancomycin Days (IV)'
//     are counted". Routes: intravenous, intramuscular, digestive, respiratory (Table 1); "Other
//     routes of administration are excluded". Table 2 footnote: an agent given by two routes on one
//     day is one total day and one day in each route.
//   Days present: "the number of patients who were present ... for any portion of each day ... The
//     day of admission, discharge, and transfer to and from locations will be included"; "One
//     patient can only contribute one day present for a specific location per calendar day"; on a
//     transfer day the patient counts in both locations. Facility-wide: "it is not permissible to
//     sum the individual days present ... The calculation must be a separate summation"; outpatient
//     locations (ED, pediatric ED, 24-hour observation) "should not be included in FacWideIN".
//   Appendix C, Example 2: a patient given vancomycin in the MICU and the medical ward on one day
//     is one vancomycin day in each location and one, not two, facility-wide.
//
// The tool does not know which locations are inpatient: the reader lists the ones to leave out of
// the facility-wide count. It does not check an agent against the protocol's Appendix B, and it
// does not count admissions.
//
// Pure: no DOM, no clock, no network.

import { rowsOf } from './csv-rows.js';

const MAX_ROWS = 20000;
const ROUTES = ['iv', 'im', 'digestive', 'respiratory'];
const ROUTE_WORDS = {
  iv: 'iv', intravenous: 'iv',
  im: 'im', intramuscular: 'im',
  digestive: 'digestive', po: 'digestive', oral: 'digestive', enteral: 'digestive', rectal: 'digestive', 'digestive tract': 'digestive',
  respiratory: 'respiratory', inhaled: 'respiratory', inhalation: 'respiratory', 'respiratory tract': 'respiratory',
};
export const ROUTE_LABEL = { iv: 'IV', im: 'IM', digestive: 'digestive', respiratory: 'respiratory' };

// "2025-12-01", "2025-12-01 07:00" or "2025-12-01T07:00" -> "2025-12-01"; anything else, null.
function dayOf(raw) {
  const m = /^(\d{4})-(\d{2})-(\d{2})(?:[ T]\d{1,2}:\d{2}(?::\d{2})?)?$/.exec(String(raw || '').trim());
  if (!m) return null;
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  if (d.getUTCFullYear() !== +m[1] || d.getUTCMonth() !== +m[2] - 1 || d.getUTCDate() !== +m[3]) return null;
  return `${m[1]}-${m[2]}-${m[3]}`;
}
function nextDay(iso) {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}
const clean = (v) => String(v === undefined || v === null ? '' : v).trim();
const key = (v) => clean(v).toLowerCase().replace(/\s+/g, ' ');
const rowsIn = (text) => rowsOf(String(text === undefined || text === null ? '' : text)).filter((r) => r.some((c) => clean(c) !== ''));
// A header row is one whose date cell is not a date and names a column.
const isHeader = (cells) => cells.some((c) => /^(patient|agent|drug|route|date|location|unit|in|out|admit|discharge)\b/i.test(clean(c))) && !cells.some((c) => dayOf(c));

const days = (n, what) => `${n} ${what === 'present' ? (n === 1 ? 'day present' : 'days present') : (n === 1 ? 'antimicrobial day' : 'antimicrobial days')}`;
function bump(map, k) { map.set(k, (map.get(k) || 0) + 1); }

export function antimicrobialDayCounter(input) {
  const o = input && typeof input === 'object' ? input : {};
  const adminRows = rowsIn(o.administrations);
  const stayRows = rowsIn(o.stays);
  if (!adminRows.length && !stayRows.length) {
    return { valid: false, message: 'Enter the administration rows (patient, agent, route, date, location), the stay rows (patient, location, date in, date out), or both.' };
  }
  if (adminRows.length > MAX_ROWS || stayRows.length > MAX_ROWS) {
    return { valid: false, message: `Enter no more than ${MAX_ROWS.toLocaleString('en-US')} rows in each list.` };
  }
  const outside = new Set(clean(o.outpatientLocations).split(/[,;\n]/).map(key).filter(Boolean));
  const unplaced = [];
  const name = new Map(); // key -> first spelling seen, for locations and agents
  const called = (k, raw) => { if (!name.has(k)) name.set(k, clean(raw)); return k; };

  // ---- antimicrobial days
  const seen = new Set();
  const locDays = new Map();   // month|loc|agent|stratum -> days
  const facDays = new Map();   // month|agent|stratum -> days
  const therapy = new Map();   // month -> patient-days on any agent, facility-wide
  let adminUsed = 0;
  adminRows.forEach((cells, i) => {
    if (i === 0 && isHeader(cells)) return;
    const [patient, agent, routeRaw, dateRaw, location] = cells.map(clean);
    const line = `Administration row ${i + 1}`;
    if (!patient || !agent || !location) { unplaced.push(`${line}: a patient, an agent and a location are all needed.`); return; }
    const day = dayOf(dateRaw);
    if (!day) { unplaced.push(`${line}: "${dateRaw}" is not a date written as YYYY-MM-DD.`); return; }
    const route = ROUTE_WORDS[key(routeRaw)];
    if (!route) { unplaced.push(`${line}: route "${routeRaw}" is not intravenous, intramuscular, digestive or respiratory. The protocol leaves other routes out.`); return; }
    adminUsed += 1;
    const month = day.slice(0, 7);
    const p = key(patient); const a = called(`a:${key(agent)}`, agent); const l = called(`l:${key(location)}`, location);
    const once = (k, map, mk) => { if (!seen.has(k)) { seen.add(k); bump(map, mk); } };
    once(`L|${p}|${a}|${l}|${day}`, locDays, `${month}|${l}|${a}|total`);
    once(`L|${p}|${a}|${l}|${day}|${route}`, locDays, `${month}|${l}|${a}|${route}`);
    if (!outside.has(key(location))) {
      once(`F|${p}|${a}|${day}`, facDays, `${month}|${a}|total`);
      once(`F|${p}|${a}|${day}|${route}`, facDays, `${month}|${a}|${route}`);
      once(`T|${p}|${day}`, therapy, month);
    }
  });

  // ---- days present
  const locPresent = new Map(); // month|loc -> days
  const facPresent = new Map(); // month -> days
  let stayUsed = 0;
  stayRows.forEach((cells, i) => {
    if (i === 0 && isHeader(cells)) return;
    const [patient, location, inRaw, outRaw] = cells.map(clean);
    const line = `Stay row ${i + 1}`;
    if (!patient || !location) { unplaced.push(`${line}: a patient and a location are both needed.`); return; }
    const from = dayOf(inRaw); const to = dayOf(outRaw);
    if (!from || !to) { unplaced.push(`${line}: the date in and the date out are both needed, written as YYYY-MM-DD. A stay with no date out is not counted.`); return; }
    if (to < from) { unplaced.push(`${line}: the date out is before the date in.`); return; }
    if ((Date.parse(to) - Date.parse(from)) / 86400000 > 3660) { unplaced.push(`${line}: the stay is longer than ten years.`); return; }
    stayUsed += 1;
    const p = key(patient); const l = called(`l:${key(location)}`, location);
    for (let d = from; d <= to; d = nextDay(d)) {
      const month = d.slice(0, 7);
      const lk = `P|${p}|${l}|${d}`;
      if (!seen.has(lk)) { seen.add(lk); bump(locPresent, `${month}|${l}`); }
      if (!outside.has(key(location))) {
        const fk = `PF|${p}|${d}`;
        if (!seen.has(fk)) { seen.add(fk); bump(facPresent, month); }
      }
    }
  });

  if (!adminUsed && !stayUsed) {
    return { valid: false, message: `Enter at least one row that can be counted. ${unplaced.slice(0, 3).join(' ')}` };
  }

  const months = [...new Set([...locDays.keys(), ...facDays.keys(), ...locPresent.keys(), ...facPresent.keys()].map((k) => k.slice(0, 7)))].sort();
  const strata = (map, prefix) => {
    const total = map.get(`${prefix}|total`) || 0;
    return { total, ...Object.fromEntries(ROUTES.map((r) => [r, map.get(`${prefix}|${r}`) || 0])) };
  };
  const say = (s) => `${days(s.total, 'agent')} (${ROUTES.map((r) => `${ROUTE_LABEL[r]} ${s[r]}`).join(', ')})`;
  const table = [];
  const notes = [];
  for (const month of months) {
    const locAgents = [...locDays.keys()].filter((k) => k.startsWith(`${month}|`) && k.endsWith('|total')).map((k) => k.split('|')).sort((x, y) => (x[1] + x[2]).localeCompare(y[1] + y[2]));
    for (const [, l, a] of locAgents) {
      const s = strata(locDays, `${month}|${l}|${a}`);
      table.push({ month, location: name.get(l), agent: name.get(a), ...s });
      notes.push(`${month}, ${name.get(l)}, ${name.get(a)}: ${say(s)}.`);
    }
    const facAgents = [...facDays.keys()].filter((k) => k.startsWith(`${month}|`) && k.endsWith('|total')).map((k) => k.split('|')[1]).sort();
    for (const a of facAgents) {
      const s = strata(facDays, `${month}|${a}`);
      table.push({ month, location: 'Facility-wide inpatient', agent: name.get(a), ...s });
      notes.push(`${month}, facility-wide inpatient, ${name.get(a)}: ${say(s)}.`);
    }
    const locs = [...locPresent.keys()].filter((k) => k.startsWith(`${month}|`)).sort();
    for (const k of locs) {
      const l = k.split('|')[1];
      table.push({ month, location: name.get(l), daysPresent: locPresent.get(k) });
      notes.push(`${month}, ${name.get(l)}: ${days(locPresent.get(k), 'present')}.`);
    }
    if (facPresent.has(month)) {
      table.push({ month, location: 'Facility-wide inpatient', daysPresent: facPresent.get(month) });
      notes.push(`${month}, facility-wide inpatient: ${days(facPresent.get(month), 'present')}, counted once per patient per day, not summed from the locations.`);
    }
    if (therapy.has(month)) notes.push(`${month}, facility-wide inpatient: ${therapy.get(month)} patient-days on any agent (length of therapy, a by-product; not an NHSN measure).`);
  }
  if (outside.size) notes.push(`Left out of the facility-wide counts, as entered: ${[...outside].join(', ')}.`);
  else notes.push('No location was named as outpatient, so every location is in the facility-wide counts. The protocol leaves the emergency department, the pediatric emergency department and 24-hour observation out of them.');
  if (unplaced.length) notes.push(`${unplaced.length} row${unplaced.length === 1 ? '' : 's'} could not be counted: ${unplaced.slice(0, 20).join(' ')}${unplaced.length > 20 ? ` and ${unplaced.length - 20} more.` : ''}`);
  notes.push('Agents are counted as spelled; the tool does not check them against the protocol\'s agent list, and it does not count admissions. The counts are only as complete as the rows entered.');

  const totalDays = [...facDays.entries()].filter(([k]) => k.endsWith('|total')).reduce((n, [, v]) => n + v, 0);
  const totalPresent = [...facPresent.values()].reduce((n, v) => n + v, 0);
  return {
    valid: true, flag: unplaced.length ? 'some-rows-not-counted' : 'counted',
    months, table, unplaced, administrationsCounted: adminUsed, staysCounted: stayUsed,
    facilityAntimicrobialDays: totalDays, facilityDaysPresent: totalPresent,
    band: `${days(totalDays, 'agent')} and ${days(totalPresent, 'present')}, facility-wide inpatient, across ${months.length} month${months.length === 1 ? '' : 's'}.`,
    bandLabel: unplaced.length ? `${unplaced.length} row${unplaced.length === 1 ? '' : 's'} not counted` : 'All rows counted',
    abnormal: unplaced.length > 0,
    notes, note: notes.join(' '),
  };
}
