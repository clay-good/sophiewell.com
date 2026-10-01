// spec-v1515 tool 6: hpt-price-compare. One code across a tall CSV, a wide CSV and a JSON file.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { extractForCode, compareHpt, parseQuery, CSV_HEADERS, csvRow } from '../../lib/hpt-compare.js';

const blob = (name, text, type) => { const b = new Blob([text], { type }); Object.defineProperty(b, 'name', { value: name }); return b; };
const ATT = 'To the best of its knowledge and belief';
const tall = blob('a.csv', [
  `hospital_name,last_updated_on,version,location_name,hospital_address,license_number|AL,"${ATT}"`,
  'Alpha Hospital,2026-07-01,3.0.0,Alpha City,1 Way,123,true',
  'description,code|1,code|1|type,code|2,code|2|type,setting,standard_charge|gross,standard_charge|discounted_cash,standard_charge|min,standard_charge|max,payer_name,plan_name,standard_charge|negotiated_dollar,standard_charge|negotiated_percentage,standard_charge|negotiated_algorithm,median_amount,10th_percentile,90th_percentile,count,standard_charge|methodology',
  'Office visit,99213,CPT,0510,RC,outpatient,200,150,90,180,Plan A,Gold,120,,,,,,,fee schedule',
  'Office visit,99213,CPT,0510,RC,outpatient,200,150,90,180,Plan B,Silver,,60,,95,80,110,11,percent of total billed charges',
  'MRI,70553,CPT,,,outpatient,3000,1800,900,2500,Plan A,Gold,1500,,,,,,,fee schedule',
].join('\n'), 'text/csv');
const wide = blob('b.csv', [
  `hospital_name,last_updated_on,version,location_name,hospital_address,license_number|AL,"${ATT}"`,
  'Beta Hospital,2026-06-15,3.0.0,Beta Town,2 Way,456,true',
  'description,code|1,code|1|type,setting,standard_charge|gross,standard_charge|discounted_cash,standard_charge|min,standard_charge|max,standard_charge|Plan A|Gold|negotiated_dollar,standard_charge|Plan A|Gold|negotiated_percentage,standard_charge|Plan A|Gold|negotiated_algorithm,standard_charge|Plan A|Gold|methodology,median_amount|Plan A|Gold,10th_percentile|Plan A|Gold,90th_percentile|Plan A|Gold,count|Plan A|Gold,additional_payer_notes|Plan A|Gold',
  'Office visit,99213,CPT,outpatient,180,120,100,140,110,,,fee schedule,,,,,',
].join('\n'), 'text/csv');
const json = blob('c.json', JSON.stringify({
  hospital_name: 'Gamma Hospital', last_updated_on: '2026-05-01', version: '3.0.0', location_name: ['Gamma'],
  standard_charge_information: [
    { description: 'Office visit', code_information: [{ code: '99213', type: 'CPT' }], standard_charges: [{ setting: 'outpatient', gross_charge: 250, discounted_cash: 100, minimum: 80, maximum: 200, payers_information: [{ payer_name: 'Plan C', plan_name: 'All', standard_charge_dollar: 95, methodology: 'case rate' }] }] },
    { description: 'Lab', code_information: [{ code: '80053', type: 'CPT' }], standard_charges: [{ setting: 'outpatient', gross_charge: 50 }] },
  ],
}), 'application/json');

test('one code is pulled from a tall CSV, a wide CSV and a JSON file', async () => {
  const q = parseQuery('99213');
  const files = await Promise.all([tall, wide, json].map((f) => extractForCode(f, q)));
  assert.deepEqual(files.map((f) => [f.hospital, f.format, f.matches.length, f.rows]), [['Alpha Hospital', 'CSV tall', 2, 3], ['Beta Hospital', 'CSV wide', 1, 1], ['Gamma Hospital', 'JSON', 1, 2]]);
  const r = compareHpt(files, q);
  assert.equal(r.table.length, 4);
  assert.match(r.band, /^4 price rows for 99213 across 3 hospitals\. The lowest discounted cash price is \$100\.00 at Gamma Hospital \(outpatient\)\.$/);
  const pct = r.table.find((t) => t.plan === 'Silver');
  assert.equal(pct.negotiated, '60%', 'a percentage is shown as stated, not converted');
  assert.deepEqual([pct.median, pct.p10, pct.p90, pct.count], [95, 80, 110, '11']);
  assert.equal(CSV_HEADERS.length, csvRow(r.table[0]).length);
});

test('a code type narrows the match; a code no file lists is said plainly', async () => {
  const rc = await extractForCode(tall, parseQuery('0510', 'RC'));
  assert.equal(rc.matches.length, 2);
  assert.equal((await extractForCode(tall, parseQuery('0510', 'CPT'))).matches.length, 0);
  assert.deepEqual(parseQuery('MS-DRG 470'), { code: '470', type: 'MS-DRG' });
  const none = compareHpt([await extractForCode(json, parseQuery('11111'))], parseQuery('11111'));
  assert.match(none.band, /^No file lists 11111\./);
  assert.ok(none.notes.some((n) => /Gamma Hospital lists no item with code 11111 among 2 items/.test(n)));
});

test('an unreadable file is named, not fatal; blanks are asked for', async () => {
  const bad = await extractForCode(blob('x.json', '{"hospital_name": ', 'application/json'), parseQuery('99213'));
  assert.ok(bad.error);
  const r = compareHpt([bad, await extractForCode(json, parseQuery('99213'))], parseQuery('99213'));
  assert.ok(r.notes.some((n) => /^x\.json could not be read/.test(n)));
  assert.equal(r.table.length, 1);
  assert.match(compareHpt([], parseQuery('99213')).message, /^Choose two or more/);
  assert.match(compareHpt([bad], null).message, /^Enter the billing code/);
});
