// spec-v1506 tool 9: does a drug have a Medicare negotiated price (maximum fair price) on a date?
//
// Source: CMS, "Selected Drug List and Negotiated Prices (also known as Maximum Fair Prices in Statute)",
// the data file read by the weekly data refresh (first: the file of 2026-09-21,
// CMS_Negotiation_Program_Selected_Drug_List_and_Maximum_Fair_Price_Data_File_20260921.csv). The file is NDC-level; the single price per 30-day equivalent supply is the same for
// every NDC of a drug in a period, so it is kept here per drug. Rows whose end date falls before their
// effective date (NDCs deselected before the price took effect) are dropped; the remaining periods are
// merged. A drug whose last period ends is deselected from then. A drug selected before its price is
// published has a period with no price. Prices are adjusted for inflation every January 1, so the table is
// good through December 31 of its newest price year (2027 in the file of 2026-09-21) and asks after that. Per-NDC unit prices are in the CMS file and not repeated
// here.
//
// Pure: no DOM, no clock (the caller passes `now`).

import { todayUtc } from './pa/date.js';
import { parseIsoStrict } from './deadline.js';
import { datedValue } from './dated-data.js';
import { longDate } from './partd-appeals-v1503.js';
import { MFP_FILE } from '../data/mfp-negotiated-prices/drugs.js';

const money = (x) => `$${x.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const SOURCE = { label: `the CMS selected drug list and negotiated prices file (${longDate(parseIsoStrict(MFP_FILE.edition))})`, url: 'https://www.cms.gov/initiatives/medicare-prescription-drug-affordability/overview/medicare-drug-price-negotiation-program/selected-drugs-negotiated-prices' };

// The table: data/mfp-negotiated-prices/drugs.js, written by the weekly data refresh from the CMS file
// (spec-v1517 route A), so a new price year or a deselection arrives without hand entry. Display names are
// the file's, title-cased; NAMES holds the one the rule gets wrong.
const NAMES = { novolog: 'NovoLog / Fiasp (all pens and vials)' };
const titleCase = (cms) => cms.split(';').map((s) => s.trim().split(/\s+/).map((w) => (/^[A-Z]{1,2}$/.test(w) ? w : w[0] + w.slice(1).toLowerCase())).join(' ')).join(' / ');
const FILE_ID = `mfp-file-${MFP_FILE.edition.replaceAll('-', '')}`;

// [id, name, first price year, [[effective, end or null, price per 30-day equivalent supply or null]]]
export const DATED_MFP = {
  [FILE_ID]: { edition: `CMS file of ${MFP_FILE.edition}`, validThrough: MFP_FILE.validThrough, route: 'A', ledgerId: 'cms-negotiated-prices-file', source: SOURCE,
    values: { drugs: MFP_FILE.drugs.map(([id, cms, year, periods]) => [id, NAMES[id] || titleCase(cms), year, periods]) } },
};
export const DRUGS = DATED_MFP[FILE_ID].values.drugs.map(([value, text]) => ({ value, text }));

export function mfpPriceCheck(input = {}, now) {
  const o = input && typeof input === 'object' ? input : {};
  const all = DATED_MFP[FILE_ID].values.drugs;
  const row = all.find(([id]) => id === o.drug);
  if (!row) return { valid: false, message: 'Choose the drug: only drugs selected for Medicare price negotiation are listed.' };
  const notes = [];
  let day;
  if (String(o.date ?? '').trim()) {
    try { day = parseIsoStrict(String(o.date).trim()); } catch { return { valid: false, message: 'Enter the date of service as YYYY-MM-DD, or leave it blank for today.' }; }
  } else {
    day = todayUtc(now);
    notes.push(`A date of service was not entered, so today, ${longDate(day)}, is used.`);
  }
  const iso = day.toISOString().slice(0, 10);
  const got = datedValue(FILE_ID, 'drugs', day, DATED_MFP);
  if (got.expired) return { valid: false, message: `Check the current CMS negotiated-prices file for ${longDate(day)}: the prices here run through ${longDate(parseIsoStrict(MFP_FILE.validThrough))}, and are adjusted for inflation every January 1.` };
  const [, name, year, periods] = row;
  const cur = periods.find(([a, b]) => a <= iso && (b === null || iso <= b));
  const next = periods.find(([a]) => a > iso);
  const last = periods[periods.length - 1];
  let band;
  let label;
  let price = null;
  if (cur && cur[2] !== null) {
    price = cur[2];
    band = `${name}: ${money(price)} per 30-day equivalent supply on ${longDate(day)}.`;
    label = `${money(price)} per 30 days`;
    if (next && next[2] !== null) band += ` From ${longDate(parseIsoStrict(next[0]))}: ${money(next[2])}.`;
    else if (cur[1] !== null && !next) band += ` ${name} was deselected: there is no negotiated price after ${longDate(parseIsoStrict(cur[1]))}.`;
  } else if (!cur && next && next[2] === null) {
    band = `${name} was selected for negotiated prices starting ${longDate(parseIsoStrict(next[0]))}, and the price is not yet published in the CMS file.`;
    label = 'Price not yet published';
  } else if (!cur && next) {
    band = `No negotiated price yet on ${longDate(day)}. The negotiated price for ${name} takes effect ${longDate(parseIsoStrict(next[0]))}: ${money(next[2])} per 30-day equivalent supply.`;
    label = 'Not yet in effect';
  } else {
    band = `No negotiated price on ${longDate(day)}: ${name} was deselected, and its negotiated price ended ${longDate(parseIsoStrict(last[1]))}.`;
    label = 'Deselected';
  }
  notes.push(`First price year: ${year}. The negotiated price applies to Medicare Part D claims${year >= 2028 ? ' (and to Part B for Part B drugs)' : ''}; what the patient pays still depends on the plan's cost sharing.`);
  notes.push('Per-unit prices by NDC are in the CMS file.');
  return { valid: true, price, band, bandLabel: label, notes, note: `Read from ${SOURCE.label}. CMS updates the file; the current file controls.` };
}
