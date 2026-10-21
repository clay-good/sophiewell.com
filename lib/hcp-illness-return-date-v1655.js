// spec-v1655 tool 6: healthcare personnel with a known or suspected infection: when the work
// exclusion ends.
//
// Source: CDC, Infection Control in Healthcare Personnel, section pages read October 19, 2026:
//   Measles (updated April 5, 2024): "exclude from work for 4 days after the rash appears"; the page
//    counts rash onset as day 0.
//   Mumps (updated April 5, 2024): "exclude from work for 5 days after the onset of parotitis"; without
//    parotitis, "for 5 days after onset of their first symptom".
//   Rubella (updated April 5, 2024): "for 7 days after the rash appears".
//   Pertussis (updated January 26, 2024): "for 21 days from the onset of cough, or until 5 days after the
//    start of effective antimicrobial therapy".
//   Varicella (updated March 23, 2026): until "all lesions have dried and crusted"; non-vesicular lesions,
//    until "no new lesions appear within a 24-hour period". No day count.
//   Group A Streptococcus (updated January 31, 2025): until infection is ruled out or "until 24 hours
//    after the start of effective antimicrobial therapy", provided draining lesions can be contained.
//   Meningococcal disease (updated January 25, 2024): invasive disease, until 24 hours after the start of
//    effective antimicrobial therapy.
// Onset is day 0, as the measles page counts it.
//
// Pure: no DOM, no clock (dates are inputs), no network.

import { parseDate } from './pa/date.js';
import { fmt } from './hcp-exposure-clock-v1655.js';

// The section pages these windows were read from. Each is under the weekly page watch
// (scripts/data/watch-pages.mjs): a changed page is listed on the data-refresh pull request.
export const SOURCES = [
  { edition: 'April 5, 2024', route: 'B', readOn: '2026-10-19', source: { label: 'CDC, Infection Control in Healthcare Personnel: Measles', url: 'https://www.cdc.gov/infection-control/hcp/healthcare-personnel-epidemiology-control/measles.html' } },
  { edition: 'April 5, 2024', route: 'B', readOn: '2026-10-19', source: { label: 'CDC, Infection Control in Healthcare Personnel: Mumps', url: 'https://www.cdc.gov/infection-control/hcp/healthcare-personnel-epidemiology-control/mumps.html' } },
  { edition: 'April 5, 2024', route: 'B', readOn: '2026-10-19', source: { label: 'CDC, Infection Control in Healthcare Personnel: Rubella', url: 'https://www.cdc.gov/infection-control/hcp/healthcare-personnel-epidemiology-control/rubella.html' } },
  { edition: 'March 23, 2026', route: 'B', readOn: '2026-10-19', source: { label: 'CDC, Infection Control in Healthcare Personnel: Varicella', url: 'https://www.cdc.gov/infection-control/hcp/healthcare-personnel-epidemiology-control/varicella.html' } },
  { edition: 'January 26, 2024', route: 'B', readOn: '2026-10-19', source: { label: 'CDC, Infection Control in Healthcare Personnel: Pertussis', url: 'https://www.cdc.gov/infection-control/hcp/healthcare-personnel-epidemiology-control/pertussis.html' } },
  { edition: 'January 31, 2025', route: 'B', readOn: '2026-10-19', source: { label: 'CDC, Infection Control in Healthcare Personnel: Group A Streptococcus', url: 'https://www.cdc.gov/infection-control/hcp/healthcare-personnel-epidemiology-control/group-a-streptococcus.html' } },
  { edition: 'January 25, 2024', route: 'B', readOn: '2026-10-19', source: { label: 'CDC, Infection Control in Healthcare Personnel: Meningococcal Disease', url: 'https://www.cdc.gov/infection-control/hcp/healthcare-personnel-epidemiology-control/meningococcal-disease.html' } },
];

export const CONDITIONS = [
  { value: 'measles', text: 'Measles', anchor: 'rash', days: 4, page: 'measles section (updated April 5, 2024)' },
  { value: 'mumps-parotitis', text: 'Mumps with parotitis', anchor: 'parotitis', days: 5, page: 'mumps section (updated April 5, 2024)' },
  { value: 'mumps-no-parotitis', text: 'Mumps without parotitis', anchor: 'symptom', days: 5, page: 'mumps section (updated April 5, 2024)' },
  { value: 'rubella', text: 'Rubella', anchor: 'rash', days: 7, page: 'rubella section (updated April 5, 2024)' },
  { value: 'pertussis', text: 'Pertussis', anchor: 'cough', days: 21, page: 'pertussis section (updated January 26, 2024)' },
  { value: 'varicella', text: 'Varicella or disseminated herpes zoster', anchor: null, page: 'varicella section (updated March 23, 2026)' },
  { value: 'group-a-strep', text: 'Group A streptococcal infection', anchor: 'therapy', hours: 24, page: 'group A Streptococcus section (updated January 31, 2025)' },
  { value: 'meningococcal', text: 'Invasive meningococcal disease', anchor: 'therapy', hours: 24, page: 'meningococcal disease section (updated January 25, 2024)' },
];
const ANCHOR_TEXT = { rash: 'the date the rash appeared', parotitis: 'the date parotitis began', symptom: 'the date of the first symptom', cough: 'the date the cough began' };
const NOTE = 'Day 0 is the onset date, as CDC counts rash onset on the measles page. The dates are when CDC\'s exclusion ends; local policy may add conditions.';
const DAY = 86400000;
const addDays = (d, n) => new Date(d.getTime() + n * DAY);

function parseWhen(v) {
  const m = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})$/.exec(String(v ?? '').trim());
  if (!m) return null;
  const d = parseDate(`${m[1]}-${m[2]}-${m[3]}`);
  const h = Number(m[4]); const mi = Number(m[5]);
  if (!d || h > 23 || mi > 59) return null;
  return new Date(d.getTime() + (h * 60 + mi) * 60000);
}
const clock = (t) => `${fmt(t)} at ${t.toISOString().slice(11, 16)}`;

export function hcpIllnessReturnDate(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const c = CONDITIONS.find((x) => x.value === String(o.condition ?? '').trim());
  if (!c) return { valid: false, message: 'Choose the infection.' };
  const cite = `CDC, Infection Control in Healthcare Personnel, ${c.page}.`;
  const notes = [];

  if (c.value === 'varicella') {
    const crusted = String(o.lesionsCrusted ?? '').trim().toLowerCase() === 'yes';
    notes.push('For lesions that are not vesicular and do not crust, CDC\'s end point is no new lesions appearing within a 24-hour period.', cite);
    return crusted
      ? { valid: true, flag: 'ends', abnormal: false, endsAt: null, band: 'All lesions have dried and crusted: CDC\'s condition for ending the exclusion is met.', bandLabel: 'Condition met', notes, note: NOTE }
      : { valid: true, flag: 'condition-unmet', abnormal: true, endsAt: null, band: 'Exclude from work until all lesions have dried and crusted. CDC gives no day count, so no date is set.', bandLabel: 'Not yet', notes, note: NOTE };
  }

  if (c.anchor === 'therapy') {
    const raw = String(o.therapyStart ?? '').trim();
    if (!raw) return { valid: false, message: 'Enter the date and time effective antimicrobial therapy started.' };
    const t = parseWhen(raw);
    if (!t) return { valid: false, message: 'Enter the therapy start as a date and time (YYYY-MM-DDTHH:MM).' };
    const end = new Date(t.getTime() + c.hours * 3600000);
    if (c.value === 'group-a-strep') notes.push('Or earlier, if group A Streptococcus infection is ruled out. CDC adds: provided any draining skin lesions can be contained and covered.');
    notes.push(cite);
    return { valid: true, flag: 'ends', abnormal: false, endsAt: end.toISOString().slice(0, 16), band: `Exclude from work until ${clock(end)}, 24 hours after effective antimicrobial therapy started.`, bandLabel: `Until ${clock(end)}`, notes, note: NOTE };
  }

  const raw = String(o.onsetDate ?? '').trim();
  if (!raw) return { valid: false, message: `Enter ${ANCHOR_TEXT[c.anchor]}.` };
  const onset = parseDate(raw);
  if (!onset) return { valid: false, message: `Enter ${ANCHOR_TEXT[c.anchor]} as a real date.` };
  let end = addDays(onset, c.days);
  let band = `Exclude from work through ${fmt(end)}: ${c.days} days after ${ANCHOR_TEXT[c.anchor].replace(/^the date /, '')} (day 0 is ${fmt(onset)}).`;
  if (c.value === 'pertussis') {
    const rawT = String(o.therapyStart ?? '').trim();
    if (rawT) {
      const t = parseWhen(rawT) || (parseDate(rawT) && new Date(parseDate(rawT).getTime()));
      if (!t) return { valid: false, message: 'Enter the therapy start as a date and time, or leave it blank.' };
      const tDay = parseDate(t.toISOString().slice(0, 10));
      if (tDay < onset) return { valid: false, message: 'Therapy cannot start before the cough began.' };
      const byTherapy = addDays(tDay, 5);
      if (byTherapy < end) {
        end = byTherapy;
        band = `Exclude from work through ${fmt(end)}: 5 days after effective antimicrobial therapy started, which comes before day 21 of the cough (${fmt(addDays(onset, 21))}).`;
      } else {
        notes.push(`Five days after therapy started would be ${fmt(byTherapy)}, which is not earlier than day 21 of the cough.`);
      }
    } else {
      notes.push('If effective antimicrobial therapy is started, the exclusion ends 5 days after the start, when that is earlier. Enter the start to see it.');
    }
  }
  notes.push(cite);
  return { valid: true, flag: 'ends', abnormal: false, endsAt: end.toISOString().slice(0, 10), band, bandLabel: `Through ${fmt(end)}`, notes, note: NOTE };
}
