// spec-v1511 tool 8: beyond-use date of a compounded preparation (USP <797> sterile, <795> nonsterile).
//
// The limits are the ones USP published in its free fact sheet "USP Compounding Standards and Beyond-Use
// Dates" (revised chapters of November 1, 2022; the copy hosted by the Mississippi Board of Pharmacy):
//   <797> Category 1: 12 hours at controlled room temperature, 24 hours refrigerated.
//         Category 2, aseptic, no sterility test, sterile components only: 4 / 10 / 45 days (room /
//           refrigerator / freezer); with any nonsterile component: 1 / 4 / 45; aseptic, sterility tested:
//           30 / 45 / 60; terminally sterilized, not tested: 14 / 28 / 45; tested: 45 / 60 / 90.
//         Category 3 (sterility tested and meeting every Category 3 requirement): aseptic 60 / 90 / 120;
//           terminally sterilized 90 / 120 / 180.
//   <795> nonpreserved aqueous (water activity 0.60 or more) 14 days; preserved aqueous 35 days; nonaqueous
//         oral liquid 90 days; other nonaqueous forms 180 days.
// The BUD counts from the date and time of compounding and may not pass the earliest expiration date of any
// component. Longer nonsterile BUDs supported by a USP-NF monograph or stability data are out of scope.
//
// Pure: no DOM, no clock.

import { parseIsoStrict } from './deadline.js';
import { parseDateTime } from './state-calendar.js';
import { longDate } from './partd-appeals-v1503.js';

export const PREP_TYPES = [{ value: 'sterile', text: 'Sterile (USP <797>)' }, { value: 'nonsterile', text: 'Nonsterile (USP <795>)' }];
export const CATEGORIES = [{ value: '1', text: 'Category 1' }, { value: '2', text: 'Category 2' }, { value: '3', text: 'Category 3' }];
export const METHODS = [{ value: 'aseptic', text: 'Aseptically processed' }, { value: 'terminal', text: 'Terminally sterilized' }];
export const YES_NO = [{ value: 'yes', text: 'Yes' }, { value: 'no', text: 'No' }];
export const STORAGE = [{ value: 'room', text: 'Controlled room temperature' }, { value: 'fridge', text: 'Refrigerator' }, { value: 'freezer', text: 'Freezer' }];
export const FORMS = [
  { value: 'aqueous-nonpreserved', text: 'Aqueous (water activity 0.60 or more), not preserved' },
  { value: 'aqueous-preserved', text: 'Aqueous (water activity 0.60 or more), preserved' },
  { value: 'nonaqueous-oral', text: 'Nonaqueous oral liquid (water activity under 0.60)' },
  { value: 'nonaqueous-other', text: 'Other nonaqueous form (water activity under 0.60)' },
];
const NONSTERILE_DAYS = { 'aqueous-nonpreserved': 14, 'aqueous-preserved': 35, 'nonaqueous-oral': 90, 'nonaqueous-other': 180 };
const NONSTERILE_WHY = { 'aqueous-nonpreserved': 'nonpreserved aqueous', 'aqueous-preserved': 'preserved aqueous', 'nonaqueous-oral': 'nonaqueous oral liquid', 'nonaqueous-other': 'other nonaqueous form' };
const pick = (list, v) => (list.some((x) => x.value === v) ? v : null);
const HOUR = 3600000;
const clock = (w) => {
  const d = new Date(w);
  const h = d.getUTCHours();
  return `${longDate(new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())))}, ${h % 12 === 0 ? 12 : h % 12}:${String(d.getUTCMinutes()).padStart(2, '0')} ${h < 12 ? 'am' : 'pm'}`;
};

function sterileLimit(o) {
  const cat = pick(CATEGORIES, o.category);
  if (!cat) return { ask: 'Choose the <797> category (1, 2 or 3).' };
  const store = pick(STORAGE, o.storage);
  if (!store) return { ask: 'Choose where the preparation is stored.' };
  const i = { room: 0, fridge: 1, freezer: 2 }[store];
  if (cat === '1') {
    if (store === 'freezer') return { ask: 'Choose room temperature or refrigerator: Category 1 has no frozen limit (12 hours at room temperature, 24 hours refrigerated).' };
    return { hours: [12, 24][i], why: `Category 1, ${store === 'room' ? 'room temperature' : 'refrigerated'}` };
  }
  const method = pick(METHODS, o.method);
  if (!method) return { ask: 'Choose aseptic processing or terminal sterilization.' };
  const tested = pick(YES_NO, o.sterilityTested);
  if (!tested) return { ask: 'Choose whether the preparation passed a sterility test.' };
  const where = ['room temperature', 'refrigerated', 'frozen'][i];
  if (cat === '3') {
    if (tested !== 'yes') return { ask: 'Category 3 requires passing sterility testing; without it, choose Category 2.' };
    return { days: (method === 'aseptic' ? [60, 90, 120] : [90, 120, 180])[i], why: `Category 3, ${method === 'aseptic' ? 'aseptically processed' : 'terminally sterilized'}, ${where}`, extra: 'Category 3 limits apply only when every Category 3 requirement is met at all times.' };
  }
  if (method === 'terminal') return { days: (tested === 'yes' ? [45, 60, 90] : [14, 28, 45])[i], why: `Category 2, terminally sterilized, ${tested === 'yes' ? 'sterility tested' : 'not sterility tested'}, ${where}` };
  if (tested === 'yes') return { days: [30, 45, 60][i], why: `Category 2, aseptically processed, sterility tested, ${where}` };
  const nonsterile = pick(YES_NO, o.nonsterileComponent);
  if (!nonsterile) return { ask: 'Choose whether any starting component was nonsterile: it shortens the limit for an untested aseptic preparation.' };
  return { days: (nonsterile === 'yes' ? [1, 4, 45] : [4, 10, 45])[i], why: `Category 2, aseptically processed, not sterility tested, ${nonsterile === 'yes' ? 'with a nonsterile starting component' : 'sterile components only'}, ${where}` };
}

export function compoundingBud(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const type = pick(PREP_TYPES, o.prepType);
  if (!type) return { valid: false, message: 'Choose sterile or nonsterile.' };
  const made = parseDateTime(o.compounded);
  if (made === null) return { valid: false, message: 'Enter the date and time of compounding (YYYY-MM-DDTHH:MM).' };
  let lim;
  if (type === 'sterile') lim = sterileLimit(o);
  else {
    const form = pick(FORMS, o.form);
    lim = form ? { days: NONSTERILE_DAYS[form], why: NONSTERILE_WHY[form] } : { ask: 'Choose the dosage form and water activity.' };
  }
  if (lim.ask) return { valid: false, message: lim.ask };
  const span = lim.hours ? lim.hours * HOUR : lim.days * 24 * HOUR;
  const byLimit = made + span;
  const limitText = lim.hours ? `${lim.hours} hours` : `${lim.days} days`;
  const notes = [];
  if (lim.extra) notes.push(lim.extra);
  let bud = byLimit;
  let bound = `the USP limit of ${limitText} (${lim.why})`;
  if (String(o.componentExpiry ?? '').trim()) {
    let exp;
    try { exp = parseIsoStrict(String(o.componentExpiry).trim()); } catch { return { valid: false, message: 'Enter the earliest component expiration as YYYY-MM-DD, or leave it blank.' }; }
    const expEnd = exp.getTime() + 24 * HOUR - 60000;
    if (expEnd < made) return { valid: false, message: 'A component expired before the compounding time: it cannot be used.' };
    if (expEnd < byLimit) { bud = expEnd; bound = `the earliest component expiration, ${longDate(exp)}, which comes before the USP limit of ${limitText}`; }
    else notes.push(`The earliest component expiration, ${longDate(exp)}, comes after the USP limit, so the limit governs.`);
  } else notes.push('The earliest component expiration date was not entered; the BUD may not pass it.');
  if (type === 'nonsterile') notes.push('<795> allows a longer BUD when a USP-NF monograph or stability information supports it; that is not computed here.');
  return {
    valid: true,
    bud: new Date(bud).toISOString().slice(0, 16),
    band: `Beyond-use: ${clock(bud)}, set by ${bound}, counted from compounding at ${clock(made)}.`,
    bandLabel: `BUD ${new Date(bud).toISOString().slice(0, 16).replace('T', ' ')}`,
    notes,
    note: 'Limits from the USP Compounding BUD fact sheet (revised <795> and <797>, November 1, 2022); the chapter and the pharmacy\'s own policy control.',
  };
}
