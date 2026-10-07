// spec-v1602 tool 2: itemized-bill-check. A line above the posted gross charge is flagged with both numbers;
// a code absent from the file says "not posted"; no plan named means no negotiated-rate comparison.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { itemizedBillCheck, linesFromText, billCorrectionRequest } from '../../lib/itemized-bill-check.js';
import { extractForCodes } from '../../lib/hpt-compare.js';

const ATT = 'To the best of its knowledge and belief';
const blob = (name, text, type) => { const b = new Blob([text], { type }); Object.defineProperty(b, 'name', { value: name }); return b; };
const priceFile = blob('alpha.csv', [
  `hospital_name,last_updated_on,version,location_name,hospital_address,license_number|AL,"${ATT}"`,
  'Alpha Hospital,2026-07-01,3.0.0,Alpha City,1 Way,123,true',
  'description,code|1,code|1|type,setting,standard_charge|gross,standard_charge|discounted_cash,standard_charge|min,standard_charge|max,payer_name,plan_name,standard_charge|negotiated_dollar,standard_charge|negotiated_percentage,standard_charge|negotiated_algorithm,median_amount,10th_percentile,90th_percentile,count,standard_charge|methodology',
  'ED visit level 4,99284,CPT,outpatient,2000,900,500,1500,Acme Health,Gold PPO,1100,,,,,,,fee schedule',
  'ED visit level 4,99284,CPT,outpatient,2000,900,500,1500,Other Plan,Silver,1500,,,,,,,fee schedule',
  'CBC,85025,CPT,outpatient,60,25,10,40,Acme Health,Gold PPO,18,,,,,,,fee schedule',
].join('\n'), 'text/csv');

const run = async (bill, extra = {}) => {
  const lines = linesFromText(bill);
  const p = await extractForCodes(priceFile, lines.map((l) => l.code));
  return itemizedBillCheck({ lines, setting: 'outpatient', payment: 'insured', prices: p.prices, hospital: p.hospital, ...extra });
};

test('extractForCodes groups a price file\'s items by the codes asked for', async () => {
  const p = await extractForCodes(priceFile, ['99284', '85025', '12345']);
  assert.equal(p.hospital, 'Alpha Hospital');
  assert.deepEqual(Object.keys(p.prices).sort(), ['85025', '99284']);
  assert.equal(p.prices['99284'].length, 2);
});

test('a line above the posted gross charge is flagged with both numbers; one at it is not', async () => {
  const r = await run('2026-03-02, 99284, 1, 2400, ED visit\n2026-03-02, 85025, 2, 120, CBC');
  assert.deepEqual(r.rows.map((x) => x.status), ['ask', 'ok']);
  assert.deepEqual(r.rows[0].findings, ['charged $2,400.00 a unit, above the $2,000.00 gross charge the hospital posted']);
  assert.equal(r.totals.over, 40000);
  assert.equal(r.band, '2 lines totaling $2,520.00; 1 line worth asking about, $400.00 above the gross charges the hospital posted.');
});

test('a code absent from the file is "not posted", not overcharged', async () => {
  const r = await run('2026-03-02, 36415, 1, 45, Venipuncture');
  assert.deepEqual(r.rows[0].findings, ['not posted: the hospital\'s file does not list this code for this setting']);
  assert.equal(r.totals.over, 0);
});

test('no plan named means no negotiated rate; a named plan shows only its own rows', async () => {
  const none = await run('2026-03-02, 99284, 1, 2000, ED visit');
  assert.deepEqual(none.rows[0].planRates, []);
  assert.match(none.notes[0], /^No plan was named, so no negotiated rate is shown/);
  const gold = await run('2026-03-02, 99284, 1, 2000, ED visit', { plan: 'gold ppo' });
  assert.deepEqual(gold.rows[0].planRates, ['$1,100.00']);
});

test('self-pay lines are compared with the posted cash price; inpatient lines with inpatient prices only', async () => {
  const cash = await run('2026-03-02, 85025, 1, 50, CBC', { payment: 'self-pay' });
  assert.deepEqual(cash.rows[0].findings, ['charged $50.00 a unit, above the $25.00 discounted cash price the hospital posted']);
  const inpatient = await run('2026-03-02, 85025, 1, 50, CBC', { setting: 'inpatient' });
  assert.match(inpatient.rows[0].findings[0], /^not posted/);
});

test('outpatient units above the MUE are named with the edit; a date-of-service edit sums the day', async () => {
  const mue = { 85025: { mue: 1, mai: 3 } };
  const r = await run('2026-03-02, 85025, 1, 25, CBC\n2026-03-02, 85025, 1, 25, CBC repeat', { mue });
  assert.match(r.rows[0].findings[0], /^2 units of 85025 on 2026-03-02, above the 1 Medicare would pay \(outpatient hospital MUE, MAI 3\)$/);
  const lineEdit = await run('2026-03-02, 85025, 2, 50, CBC', { mue: { 85025: { mue: 1, mai: 1 } } });
  assert.match(lineEdit.rows[0].findings[0], /^2 units on this line, above the 1/);
});

test('the bill is refused by name until it is complete', () => {
  assert.match(itemizedBillCheck({ bill: '' }).message, /^Enter the bill lines/);
  assert.match(itemizedBillCheck({ bill: ',99284,1,100', payment: 'insured' }).message, /inpatient or outpatient/);
  assert.deepEqual(itemizedBillCheck({ bill: ',99284,1,100\n,85025,1,20', setting: 'outpatient', payment: 'insured' }).needCodes, ['99284', '85025']);
  const bad = itemizedBillCheck({ bill: ',99284,lots,100', setting: 'outpatient', payment: 'insured', prices: {} });
  assert.equal(bad.rows[0].status, 'invalid');
});

test('spec-v1501 §4: the request to the billing office lists each flagged line with the posted number, and blanks what it was not told', async () => {
  const r = await run('2026-03-02, 99284, 1, 2400, ED visit\n2026-03-02, 85025, 2, 120, CBC\n2026-03-02, 12345, 1, 50, Supply');
  const now = new Date('2026-10-07T12:00:00Z');
  const letter = billCorrectionRequest(r, {}, now);
  assert.equal(letter.valid, true);
  const items = letter.sections.find((s) => s.heading === 'Lines to review').items;
  assert.deepEqual(items, [
    'Line 1, code 99284 (ED visit), 2026-03-02: $2,400.00 for 1 unit. Charged $2,400.00 a unit, above the $2,000.00 gross charge the hospital posted.',
    'Line 3, code 12345 (Supply), 2026-03-02: $50.00 for 1 unit. Not posted: the hospital\'s file does not list this code for this setting.',
  ], 'the line at its posted price is not listed');
  const text = letter.sections.flatMap((s) => [...(s.paragraphs || []), ...(s.items || [])]).join('\n');
  assert.match(text, /Alpha Hospital, billing office/);
  assert.match(text, /45 CFR 180\.50/);
  assert.match(text, /Date: October 7, 2026/);
  assert.match(text, /please tell me the standard charge you set for it/);
  assert.equal(letter.blanks, 3, 'patient name twice and the account number');
  assert.doesNotMatch(text, /overbill|overcharg/i, 'it asks; it does not accuse');
  const filled = billCorrectionRequest(r, { patient: 'Pat Lee', account: 'A-100' }, now);
  assert.equal(filled.blanks, 0);
  assert.match(filled.band, /^2 lines listed for review\. No blanks left/);
});

test('with nothing flagged, or no check, there is no letter', async () => {
  const r = await run('2026-03-02, 85025, 2, 120, CBC');
  assert.match(billCorrectionRequest(r).message, /no correction to ask for/);
  assert.equal(billCorrectionRequest(null).valid, false);
});
