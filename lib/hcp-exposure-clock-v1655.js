// spec-v1655 tool 5: healthcare personnel exposed to measles, mumps, rubella, varicella or pertussis:
// the monitoring or work-exclusion dates.
//
// Source: CDC, Infection Control in Healthcare Personnel: Epidemiology and Control of Selected
// Infections Transmitted Among Healthcare Personnel and Patients (cdc.gov/infection-control/hcp/
// healthcare-personnel-epidemiology-control/), each section page read October 19, 2026:
//   Measles (updated April 5, 2024): immune and exposed, "daily monitoring ... from the 5th day after
//    their first exposure through the 21st day after their last exposure"; not immune, "Exclude from
//    work from the 5th day after their first exposure through the 21st day after their last exposure",
//    "regardless of receipt of postexposure prophylaxis".
//   Mumps (updated April 5, 2024): the same with days 10 and 25. Not immune but given a first MMR dose
//    before the exposure: work restrictions are not needed; monitor days 10 to 25; second dose at least
//    28 days after the first.
//   Rubella (updated April 5, 2024): days 7 and 23.
//   Varicella (updated March 23, 2026): days 8 and 21; not immune and given VariZIG, excluded through the
//    28th day after the last exposure; not immune with one prior dose who receive the second dose within
//    5 days after exposure, work restrictions are not necessary.
//   Pertussis (updated January 26, 2024): likely to interact with persons at increased risk (infants
//    under 12 months, the third trimester of pregnancy, conditions a pertussis infection may worsen) and
//    not receiving postexposure prophylaxis, "restrict from contact ... for 21 days after the last
//    exposure"; otherwise "Implement daily monitoring for 21 days after the last exposure".
// Counting: no section says whether the exposure date is day 0 or day 1. CDC counts rash onset as day 0
// on the measles page, and symptom onset as day 0 in the respiratory section; the exposure date is day 0
// here, and the result says so.
//
// Pure: no DOM, no clock (dates are inputs), no network.

import { parseDate, diffDays } from './pa/date.js';

// The section pages these windows were read from. Each is under the weekly page watch
// (scripts/data/watch-pages.mjs): a changed page is listed on the data-refresh pull request.
export const SOURCES = [
  { edition: 'April 5, 2024', route: 'B', readOn: '2026-10-19', source: { label: 'CDC, Infection Control in Healthcare Personnel: Measles', url: 'https://www.cdc.gov/infection-control/hcp/healthcare-personnel-epidemiology-control/measles.html' } },
  { edition: 'April 5, 2024', route: 'B', readOn: '2026-10-19', source: { label: 'CDC, Infection Control in Healthcare Personnel: Mumps', url: 'https://www.cdc.gov/infection-control/hcp/healthcare-personnel-epidemiology-control/mumps.html' } },
  { edition: 'April 5, 2024', route: 'B', readOn: '2026-10-19', source: { label: 'CDC, Infection Control in Healthcare Personnel: Rubella', url: 'https://www.cdc.gov/infection-control/hcp/healthcare-personnel-epidemiology-control/rubella.html' } },
  { edition: 'March 23, 2026', route: 'B', readOn: '2026-10-19', source: { label: 'CDC, Infection Control in Healthcare Personnel: Varicella', url: 'https://www.cdc.gov/infection-control/hcp/healthcare-personnel-epidemiology-control/varicella.html' } },
  { edition: 'January 26, 2024', route: 'B', readOn: '2026-10-19', source: { label: 'CDC, Infection Control in Healthcare Personnel: Pertussis', url: 'https://www.cdc.gov/infection-control/hcp/healthcare-personnel-epidemiology-control/pertussis.html' } },
];

export const PATHOGENS = [
  { value: 'measles', text: 'Measles', from: 5, to: 21, page: 'measles section (updated April 5, 2024)' },
  { value: 'mumps', text: 'Mumps', from: 10, to: 25, page: 'mumps section (updated April 5, 2024)' },
  { value: 'rubella', text: 'Rubella', from: 7, to: 23, page: 'rubella section (updated April 5, 2024)' },
  { value: 'varicella', text: 'Varicella (chickenpox) or herpes zoster', from: 8, to: 21, page: 'varicella section (updated March 23, 2026)' },
  { value: 'pertussis', text: 'Pertussis', from: null, to: 21, page: 'pertussis section (updated January 26, 2024)' },
];
export const IMMUNITY = [
  { value: 'immune', text: 'Has presumptive evidence of immunity' },
  { value: 'not-immune', text: 'No presumptive evidence of immunity' },
  { value: 'unknown', text: 'Not known yet' },
];
const NOTE = 'Day 0 is the exposure date: no CDC section says which day counts first, and CDC counts onset as day 0 elsewhere in this guidance. Local policy or the health department may set a different window.';
const DAY = 86400000;
const addDays = (d, n) => new Date(d.getTime() + n * DAY);
export const fmt = (d) => d.toLocaleDateString('en-US', { timeZone: 'UTC', month: 'long', day: 'numeric', year: 'numeric' });
const yes = (v) => v === true || String(v ?? '').trim().toLowerCase() === 'yes';

export function hcpExposureClock(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const p = PATHOGENS.find((x) => x.value === String(o.pathogen ?? '').trim());
  if (!p) return { valid: false, message: 'Choose the infection the person was exposed to.' };
  const rawFirst = String(o.firstExposure ?? '').trim();
  if (!rawFirst) return { valid: false, message: 'Enter the date of the first exposure.' };
  const first = parseDate(rawFirst);
  if (!first) return { valid: false, message: 'Enter the first exposure as a real date.' };
  const rawLast = String(o.lastExposure ?? '').trim();
  const last = rawLast ? parseDate(rawLast) : first;
  if (!last) return { valid: false, message: 'Enter the last exposure as a real date, or leave it blank for a single exposure.' };
  const span = diffDays(last, first);
  if (span < 0) return { valid: false, message: 'The last exposure cannot be before the first.' };
  if (span > 365) return { valid: false, message: 'The exposure period is longer than a year. Check the dates.' };
  const notes = [];
  const cite = `CDC, Infection Control in Healthcare Personnel, ${p.page}.`;

  if (p.value === 'pertussis') {
    const end = addDays(last, p.to);
    const highRisk = String(o.highRiskContact ?? '').trim();
    if (highRisk !== 'yes' && highRisk !== 'no') return { valid: false, message: 'Say whether the person is likely to interact with persons at increased risk of severe pertussis.' };
    let band; let label; let action;
    if (highRisk === 'yes' && !yes(o.prophylaxis)) {
      action = 'restrict';
      band = `Restrict from contact with persons at increased risk of severe pertussis through ${fmt(end)} (21 days after the last exposure), unless postexposure prophylaxis is given.`;
      label = `Restricted through ${fmt(end)}`;
    } else if (highRisk === 'yes') {
      action = 'none';
      band = 'Receiving postexposure prophylaxis: CDC states the contact restriction for personnel who are not receiving it, so none is set here.';
      label = 'No restriction stated';
    } else {
      action = 'monitor';
      band = `Daily monitoring for pertussis symptoms through ${fmt(end)} (21 days after the last exposure).`;
      label = `Monitor through ${fmt(end)}`;
    }
    notes.push('Persons at increased risk, as CDC lists them: infants under 12 months, people in the third trimester of pregnancy, and people with conditions a pertussis infection may worsen (such as immunocompromise or moderate to severe asthma).');
    notes.push(cite);
    return { valid: true, flag: action, action, start: null, end: end.toISOString().slice(0, 10), abnormal: action === 'restrict', band, bandLabel: label, notes, note: NOTE };
  }

  const imm = String(o.immunity ?? '').trim();
  if (!IMMUNITY.some((x) => x.value === imm)) return { valid: false, message: 'Choose the person\'s immunity status.' };
  const start = addDays(first, p.from);
  let endDay = p.to;
  let exclude = imm !== 'immune';
  if (p.value === 'varicella' && imm === 'not-immune') {
    if (yes(o.secondDoseWithin5Days)) {
      exclude = false;
      notes.push('One varicella vaccine dose before the exposure and the second dose within 5 days after it: CDC says work restrictions are not necessary. Daily monitoring still applies.');
    } else if (yes(o.immuneGlobulin)) {
      endDay = 28;
      notes.push('Varicella-zoster immune globulin was given, which can lengthen the incubation period: the exclusion runs through the 28th day after the last exposure.');
    }
  }
  if (p.value === 'mumps' && imm === 'not-immune' && yes(o.firstMmrBeforeExposure)) {
    exclude = false;
    notes.push('A first MMR dose before the exposure: CDC says work restrictions are not needed. Monitor daily, and give the second dose at least 28 days after the first.');
  }
  const end = addDays(last, endDay);
  const window = `from ${fmt(start)} (day ${p.from} after the first exposure) through ${fmt(end)} (day ${endDay} after the last exposure)`;
  let band; let action;
  if (imm === 'unknown') {
    action = 'unknown';
    band = `Immunity not yet known. If immune: daily monitoring ${window}. If not immune: exclude from work for the same dates. Establish immunity first.`;
  } else if (exclude) {
    action = 'exclude';
    band = `Exclude from work ${window}.`;
    if (p.value === 'measles') notes.unshift('CDC: this applies regardless of receipt of postexposure prophylaxis.');
  } else {
    action = 'monitor';
    band = `No work restriction; daily monitoring for symptoms ${window}.`;
  }
  notes.push(cite);
  return {
    valid: true, flag: action, action, start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10),
    abnormal: action === 'exclude' || action === 'unknown', band,
    bandLabel: `${action === 'exclude' ? 'Excluded' : action === 'monitor' ? 'Monitor' : 'Window'} ${fmt(start)} to ${fmt(end)}`,
    notes, note: NOTE,
  };
}
