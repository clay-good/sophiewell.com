// spec-v1657 tool 2: nursing home reported nurse staffing hours per resident day, the CMS PBJ method.
//
// Source: CMS, Design for Care Compare, Nursing Home Five-Star Quality Rating System: Technical Users'
// Guide, September 2026, "Staffing Domain", read October 19, 2026:
//   Job codes: RN 5, 6, 7; LPN 8, 9; nurse aide 10, 11, 12.
//   "The quarterly reported nurse staffing hours per resident day are then calculated by dividing the
//    aggregate reported hours by the aggregate resident census. Only days that have at least one
//    resident are included in the calculations." Weekends: the same over Saturdays and Sundays.
//   The six exclusion criteria (no staffing level reported): total nurse staffing (5-12) of zero, or
//    over 12 hours per resident day, over all days or over weekend days; nurse aide staffing (10-12)
//    over 5.25 hours per resident day, over all days or over weekend days.
//   Scoring exception: "four or more days in the quarter with no RN staffing hours (job codes 5-7) on
//    days when there were one or more residents" gives a one-star staffing rating.
// The census is CMS's, derived from MDS assessments; a facility's own count may differ.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

export const EDITION = 'September 2026';

// The guide is a watched source (scripts/data/watch-pages.mjs): a changed PDF is listed on the weekly
// data-refresh pull request, with this module, so the transcribed figures are re-read.
export const SOURCES = [
  { edition: EDITION, route: 'B', readOn: '2026-10-19', source: { label: 'CMS, Nursing Home Five-Star Quality Rating System: Technical Users\' Guide', url: 'https://www.cms.gov/medicare/provider-enrollment-and-certification/certificationandcomplianc/downloads/usersguide.pdf' } },
];
const r3 = (n) => Math.round(n * 1000) / 1000;
const blank = (v) => v === null || v === undefined || String(v).trim() === '';

export function pbjHoursPerResidentDay(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const f = inputFault([
    ['the RN hours (job codes 5 to 7)', o.rnHours, 0, 1e8, ''],
    ['the LPN hours (job codes 8 and 9)', o.lpnHours, 0, 1e8, ''],
    ['the nurse aide hours (job codes 10 to 12)', o.aideHours, 0, 1e8, ''],
    ['the aggregate resident census', o.census, null, 1e8, ''],
  ]);
  if (f) return { valid: false, message: f };
  const rn = Number(o.rnHours) / Number(o.census);
  const aide = Number(o.aideHours) / Number(o.census);
  const total = (Number(o.rnHours) + Number(o.lpnHours) + Number(o.aideHours)) / Number(o.census);
  const lines = [];
  const notes = [];
  if (total === 0) lines.push('Total nurse staffing is zero, an exclusion: CMS reports no staffing level.');
  if (total > 12) lines.push('Total nurse staffing is over 12 hours per resident day, an exclusion: CMS reports no staffing level.');
  if (aide > 5.25) lines.push('Nurse aide staffing is over 5.25 hours per resident day, an exclusion: CMS reports no staffing level.');

  let weekend = null;
  const wk = [o.weekendNurseHours, o.weekendAideHours, o.weekendCensus];
  if (wk.some((v) => !blank(v))) {
    const g = inputFault([
      ['the weekend nurse hours (job codes 5 to 12)', o.weekendNurseHours, 0, 1e8, ''],
      ['the weekend nurse aide hours (job codes 10 to 12)', o.weekendAideHours, 0, 1e8, ''],
      ['the weekend resident census', o.weekendCensus, null, 1e8, ''],
    ]);
    if (g) return { valid: false, message: g };
    weekend = Number(o.weekendNurseHours) / Number(o.weekendCensus);
    const wAide = Number(o.weekendAideHours) / Number(o.weekendCensus);
    if (weekend === 0) lines.push('Weekend total nurse staffing is zero, an exclusion.');
    if (weekend > 12) lines.push('Weekend total nurse staffing is over 12 hours per resident day, an exclusion.');
    if (wAide > 5.25) lines.push('Weekend nurse aide staffing is over 5.25 hours per resident day, an exclusion.');
  } else {
    notes.push('Enter the weekend hours and census to get the weekend ratio and check the three weekend exclusions.');
  }
  if (!blank(o.daysWithoutRn)) {
    const g = inputFault([['the days with residents and no RN hours', o.daysWithoutRn, 0, 92, '']]);
    if (g) return { valid: false, message: g };
    if (Number(o.daysWithoutRn) >= 4) lines.push(`${Number(o.daysWithoutRn)} days with residents and no RN hours: four or more is a scoring exception that gives a one-star staffing rating.`);
  } else {
    notes.push('Enter the days with residents and no RN hours to check the one-star scoring exception (four or more days).');
  }
  const ratios = `Total nurse ${r3(total)}, RN ${r3(rn)}${weekend === null ? '' : `, weekend total nurse ${r3(weekend)}`} reported hours per resident day.`;
  return {
    valid: true, total: r3(total), rn: r3(rn), aide: r3(aide), weekend: weekend === null ? null : r3(weekend),
    flags: lines, abnormal: lines.length > 0,
    band: lines.length ? `${ratios} ${lines.join(' ')}` : `${ratios} None of the exclusions entered applies.`,
    bandLabel: `${r3(total)} total / ${r3(rn)} RN`,
    notes,
    note: `CMS method from the Five-Star Technical Users' Guide, ${EDITION}: hours summed over the quarter divided by the MDS census summed over the days with at least one resident. These are reported hours; the star uses case-mix adjusted hours.`,
  };
}
