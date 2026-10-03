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
import { normalizeNdc } from './nadac-margin.js';

const money = (x) => `$${x.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const unitMoney = (x) => `$${x.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })}`;
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

// ndcFacts(o, iso) -> { error } | { drug, notes }: the drug an NDC belongs to and its per-unit price on the
// day, from `o.ndcRows` (every row of the CMS file, data/mfp-negotiated-prices). `ndcRows` null means the
// list could not be loaded, which is never read as "not in the file".
function ndcFacts(o, iso, day) {
  const n = normalizeNdc(o.ndc);
  if (n.error) return { error: n.error };
  const shown = `${n.ndc.slice(0, 5)}-${n.ndc.slice(5, 9)}-${n.ndc.slice(9)}`;
  if (!Array.isArray(o.ndcRows)) return { error: `The CMS file's NDC list could not be loaded, so NDC ${shown} cannot be looked up. Choose the drug instead.` };
  const mine = o.ndcRows.filter((r) => r.ndc11.replace(/-/g, '') === n.ndc);
  if (!mine.length) return { error: `NDC ${shown} is not in ${SOURCE.label}. Only NDCs of drugs selected for negotiation are listed, and CMS adds new ones as it updates the file. Check the NDC, or choose the drug.` };
  const drug = (MFP_FILE.drugs.find(([, cms]) => cms === mine[0].drug) || [])[0];
  if (!drug) return { error: `NDC ${shown} is listed for ${mine[0].drug}, which is not in the price table. Choose the drug.` };
  const notes = [];
  if (o.drug && o.drug !== drug) notes.push(`NDC ${shown} is not the drug chosen in the list; the NDC's drug is used.`);
  const live = mine.find((r) => r.effective <= iso && (r.end === null || iso <= r.end) && !(r.end && r.end < r.effective));
  if (live && live.perUnit !== null) notes.push(`NDC ${shown}: ${unitMoney(live.perUnit)} per unit on ${longDate(day)} (the file's NDC-9 price per unit).`);
  else if (live) notes.push(`NDC ${shown}: no per-unit price is published for ${longDate(day)} yet.`);
  else notes.push(`NDC ${shown} has no negotiated price on ${longDate(day)}: no period of the file covers that day for this package.`);
  return { drug, notes };
}

export function mfpPriceCheck(input = {}, now) {
  const o = input && typeof input === 'object' ? input : {};
  const all = DATED_MFP[FILE_ID].values.drugs;
  const hasNdc = String(o.ndc ?? '').trim() !== '';
  if (!hasNdc && !all.some(([id]) => id === o.drug)) return { valid: false, message: 'Choose the drug, or enter its NDC: only drugs selected for Medicare price negotiation are listed.' };
  const notes = [];
  let day;
  if (String(o.date ?? '').trim()) {
    try { day = parseIsoStrict(String(o.date).trim()); } catch { return { valid: false, message: 'Enter the date of service as YYYY-MM-DD, or leave it blank for today.' }; }
  } else {
    day = todayUtc(now);
    notes.push(`A date of service was not entered, so today, ${longDate(day)}, is used.`);
  }
  const iso = day.toISOString().slice(0, 10);
  let drugId = o.drug;
  if (hasNdc) {
    const f = ndcFacts(o, iso, day);
    if (f.error) return { valid: false, message: f.error };
    drugId = f.drug;
    notes.push(...f.notes);
  }
  const row = all.find(([id]) => id === drugId);
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
  if (!hasNdc) notes.push('Enter an NDC for its per-unit price.');
  return { valid: true, price, band, bandLabel: label, notes, note: `Read from ${SOURCE.label}. CMS updates the file; the current file controls.` };
}
