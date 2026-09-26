// spec-v1506 tool 9: does a drug have a Medicare negotiated price (maximum fair price) on a date?
//
// Source: CMS, "Selected Drug List and Negotiated Prices (also known as Maximum Fair Prices in Statute)",
// data file dated 2026-09-21 (CMS_Negotiation_Program_Selected_Drug_List_and_Maximum_Fair_Price_Data_File
// _20260921.csv). The file is NDC-level; the single price per 30-day equivalent supply is the same for
// every NDC of a drug in a period, so it is kept here per drug. Rows whose end date falls before their
// effective date (NDCs deselected before the price took effect) are dropped; the remaining periods are
// merged. A drug whose last period ends is deselected from then. Drugs selected for 2028 have no price in
// this file. The 2026 and 2027 prices are adjusted for inflation every January 1, so the table is good
// through December 31, 2027 and asks after that. Per-NDC unit prices are in the CMS file and not repeated
// here.
//
// Pure: no DOM, no clock (the caller passes `now`).

import { todayUtc } from './pa/date.js';
import { parseIsoStrict } from './deadline.js';
import { datedValue } from './dated-data.js';
import { longDate } from './partd-appeals-v1503.js';

const money = (x) => `$${x.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const SOURCE = { label: 'the CMS selected drug list and negotiated prices file (September 21, 2026)', url: 'https://www.cms.gov/initiatives/medicare-prescription-drug-affordability/overview/medicare-drug-price-negotiation-program/selected-drugs-negotiated-prices' };

// [id, name, first price year, [[effective, end or null, price per 30-day equivalent supply or null]]]
export const DATED_MFP = {
  'mfp-file-20260921': { edition: 'CMS file of 2026-09-21', validThrough: '2027-12-31', route: 'B', ledgerId: 'cms-negotiated-prices-file', source: SOURCE,
    values: { drugs: [
      ['eliquis', 'Eliquis / Eliquis Sprinkle', 2026, [['2026-01-01', '2026-12-31', 231], ['2027-01-01', null, 237.25]]],
      ['enbrel', 'Enbrel', 2026, [['2026-01-01', '2026-12-31', 2355], ['2027-01-01', null, 2418.7]]],
      ['entresto', 'Entresto / Entresto Sprinkle', 2026, [['2026-01-01', '2026-12-31', 295]]],
      ['farxiga', 'Farxiga', 2026, [['2026-01-01', '2026-12-31', 178.5], ['2027-01-01', null, 183.33]]],
      ['imbruvica', 'Imbruvica', 2026, [['2026-01-01', '2026-12-31', 9319], ['2027-01-01', null, 9571.07]]],
      ['januvia', 'Januvia', 2026, [['2026-01-01', '2026-12-31', 113], ['2027-01-01', null, 116.06]]],
      ['jardiance', 'Jardiance', 2026, [['2026-01-01', '2026-12-31', 197], ['2027-01-01', null, 202.33]]],
      ['novolog', 'NovoLog / Fiasp (all pens and vials)', 2026, [['2026-01-01', '2026-12-31', 119]]],
      ['stelara', 'Stelara', 2026, [['2026-01-01', '2026-12-31', 4695]]],
      ['xarelto', 'Xarelto', 2026, [['2026-01-01', '2026-12-31', 197]]],
      ['austedo', 'Austedo / Austedo XR', 2027, [['2027-01-01', null, 4093]]],
      ['breo-ellipta', 'Breo Ellipta', 2027, [['2027-01-01', null, 67]]],
      ['calquence', 'Calquence', 2027, [['2027-01-01', null, 8600]]],
      ['ibrance', 'Ibrance', 2027, [['2027-01-01', null, 7871]]],
      ['janumet', 'Janumet / Janumet XR', 2027, [['2027-01-01', null, 80]]],
      ['linzess', 'Linzess', 2027, [['2027-01-01', null, 136]]],
      ['ofev', 'Ofev', 2027, [['2027-01-01', null, 6350]]],
      ['otezla', 'Otezla / Otezla XR', 2027, [['2027-01-01', null, 1650]]],
      ['ozempic', 'Ozempic / Rybelsus / Wegovy', 2027, [['2027-01-01', null, 274]]],
      ['pomalyst', 'Pomalyst', 2027, [['2027-01-01', null, 8650]]],
      ['tradjenta', 'Tradjenta', 2027, [['2027-01-01', null, 78]]],
      ['trelegy-ellipta', 'Trelegy Ellipta', 2027, [['2027-01-01', null, 175]]],
      ['vraylar', 'Vraylar', 2027, [['2027-01-01', null, 770]]],
      ['xifaxan', 'Xifaxan', 2027, [['2027-01-01', null, 1000]]],
      ['xtandi', 'Xtandi', 2027, [['2027-01-01', null, 7004]]],
      ['anoro-ellipta', 'Anoro Ellipta', 2028, [['2028-01-01', null, null]]],
      ['biktarvy', 'Biktarvy', 2028, [['2028-01-01', null, null]]],
      ['botox', 'Botox / Botox Cosmetic', 2028, [['2028-01-01', null, null]]],
      ['cimzia', 'Cimzia', 2028, [['2028-01-01', null, null]]],
      ['cosentyx', 'Cosentyx', 2028, [['2028-01-01', null, null]]],
      ['entyvio', 'Entyvio', 2028, [['2028-01-01', null, null]]],
      ['erleada', 'Erleada', 2028, [['2028-01-01', null, null]]],
      ['kisqali', 'Kisqali', 2028, [['2028-01-01', null, null]]],
      ['lenvima', 'Lenvima', 2028, [['2028-01-01', null, null]]],
      ['orencia', 'Orencia', 2028, [['2028-01-01', null, null]]],
      ['rexulti', 'Rexulti', 2028, [['2028-01-01', null, null]]],
      ['trulicity', 'Trulicity', 2028, [['2028-01-01', null, null]]],
      ['verzenio', 'Verzenio', 2028, [['2028-01-01', null, null]]],
      ['xeljanz', 'Xeljanz / Xeljanz XR', 2028, [['2028-01-01', null, null]]],
      ['xolair', 'Xolair', 2028, [['2028-01-01', null, null]]],
    ] } },
};
export const DRUGS = DATED_MFP['mfp-file-20260921'].values.drugs.map(([value, text]) => ({ value, text }));

export function mfpPriceCheck(input = {}, now) {
  const o = input && typeof input === 'object' ? input : {};
  const all = DATED_MFP['mfp-file-20260921'].values.drugs;
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
  const got = datedValue('mfp-file-20260921', 'drugs', day, DATED_MFP);
  if (got.expired) return { valid: false, message: `Check the current CMS negotiated-prices file for ${longDate(day)}: the prices here run through December 31, 2027, and are adjusted for inflation every January 1.` };
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
