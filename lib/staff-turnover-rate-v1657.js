// spec-v1657 tool 5: staff turnover and vacancy rate, with CMS's PBJ turnover formula.
//
// General rates are arithmetic identities: turnover = separations ÷ average headcount × 100, average
// headcount = (start + end) ÷ 2; vacancy = (budgeted − filled) ÷ budgeted × 100.
// CMS: Five-Star Technical Users' Guide, September 2026, "Specifications for Staff Turnover Measures",
// read October 19, 2026: "(Total number of employment spells that ended in turnover)/(Total number of
// eligible employment spells)", maximum 100 percent; eligible = at least 120 hours in the 90 days from
// the first observed workday; turnover = a gap of at least 90 consecutive days with no work; agency staff
// are included; a returning employee starts a new spell; fewer than five eligible nurses is excluded.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

const r1 = (n) => Math.round(n * 10) / 10;
const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const any = (...v) => v.some((x) => !blank(x));

export function staffTurnoverRate(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const lines = [];
  const notes = [];
  let turnover = null;
  let vacancy = null;
  let cms = null;

  if (any(o.separations, o.startHeadcount, o.endHeadcount)) {
    const f = inputFault([
      ['the separations', o.separations, 0, 1e6, ''],
      ['the headcount at the start', o.startHeadcount, 0, 1e6, ''],
      ['the headcount at the end', o.endHeadcount, 0, 1e6, ''],
    ]);
    if (f) return { valid: false, message: f };
    const avg = (Number(o.startHeadcount) + Number(o.endHeadcount)) / 2;
    if (avg === 0) return { valid: false, message: 'The average headcount is zero, so there is no turnover rate. Check the headcounts.' };
    turnover = r1((Number(o.separations) / avg) * 100);
    lines.push(`Turnover ${turnover}%: ${o.separations} separations ÷ an average headcount of ${avg}.`);
    if (turnover > 100) notes.push('More separations than the average headcount: turnover over 100% happens when positions turn over more than once.');
  }
  if (any(o.budgeted, o.filled)) {
    const f = inputFault([['the budgeted positions', o.budgeted, null, 1e6, ''], ['the filled positions', o.filled, 0, 1e6, '']]);
    if (f) return { valid: false, message: f };
    vacancy = r1(((Number(o.budgeted) - Number(o.filled)) / Number(o.budgeted)) * 100);
    lines.push(`Vacancy ${vacancy}%: ${Number(o.budgeted) - Number(o.filled)} unfilled of ${o.budgeted} budgeted positions.`);
  }
  if (any(o.spellsEnded, o.eligibleSpells)) {
    const f = inputFault([['the spells ended in turnover', o.spellsEnded, 0, 1e6, ''], ['the eligible employment spells', o.eligibleSpells, null, 1e6, '']]);
    if (f) return { valid: false, message: f };
    if (Number(o.spellsEnded) > Number(o.eligibleSpells)) return { valid: false, message: 'More spells ended in turnover than eligible spells. Under the CMS method the rate cannot pass 100%.' };
    cms = r1((Number(o.spellsEnded) / Number(o.eligibleSpells)) * 100);
    lines.push(`CMS turnover ${cms}%: ${o.spellsEnded} of ${o.eligibleSpells} eligible employment spells ended in a 90-day gap.`);
    notes.push('The CMS measure counts agency staff who worked at least 120 hours in 90 days, and treats a return after a 90-day gap as a new spell. A home with fewer than five eligible nurses is excluded.');
    if (Number(o.eligibleSpells) < 5) notes.push('Fewer than five eligible spells: CMS excludes a home with fewer than five eligible nurses from the nurse turnover measures.');
  }
  if (!lines.length) return { valid: false, message: 'Enter separations and headcounts, budgeted and filled positions, or the CMS spell counts.' };
  return {
    valid: true, turnover, vacancy, cms, abnormal: false,
    band: lines.join(' '), bandLabel: [turnover !== null && `${turnover}% turnover`, vacancy !== null && `${vacancy}% vacancy`, cms !== null && `${cms}% CMS`].filter(Boolean).join(', '),
    notes, note: 'No benchmark is built in. Compare rates computed the same way over the same length of period.',
  };
}
