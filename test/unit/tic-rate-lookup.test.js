// spec-v1604 tool 2: tic-rate-lookup and lib/medicare-reprice.js. A fixture with 3 codes across 2
// providers returns exactly those rates; a code with no Medicare equivalent is labeled. Fee schedule rows
// are literal here, so a quarterly data refresh cannot change the expected amounts.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gzipSync } from 'node:zlib';
import { parseQuery, extractRates, summarize, medicareFor } from '../../lib/tic-rate-lookup.js';
import { repriceProfessional, settingFor, FACILITY_POS, NONFACILITY_POS } from '../../lib/medicare-reprice.js';
import { runRateLookup } from '../../lib/tic-rate-run.js';

const ROWS = {
  99214: [{ code: '99214', statusCode: 'A', workRvu: 1.92, peRvuNonFacility: 1.5, peRvuFacility: 0.8, mpRvu: 0.13 }],
  71046: [
    { code: '71046', statusCode: 'A', workRvu: 0.21, peRvuNonFacility: 0.76, peRvuFacility: 0.76, mpRvu: 0.02 },
    { code: '71046', modifier: '26', statusCode: 'A', workRvu: 0.21, peRvuNonFacility: 0.08, peRvuFacility: 0.08, mpRvu: 0.01 },
    { code: '71046', modifier: 'TC', statusCode: 'A', workRvu: 0, peRvuNonFacility: 0.68, peRvuFacility: 0.68, mpRvu: 0.01 },
  ],
  80053: [{ code: '80053', statusCode: 'X', workRvu: 0, peRvuNonFacility: 0, peRvuFacility: 0, mpRvu: 0 }],
};
const GPCI = { name: 'TEST LOCALITY', workGpci: 1, peGpci: 1.1, mpGpci: 0.9 };
const CF = 33.4009;
const ctx = { rowsFor: (c) => ROWS[c] || [], gpci: GPCI, conversionFactor: CF, edition: 'RVU26D' };
const fee = (w, pe, mp) => Math.round((w * 1 + pe * 1.1 + mp * 0.9) * CF * 100) / 100;

const price = (rate, extra = {}) => ({ negotiated_type: 'negotiated', negotiated_rate: rate, expiration_date: '9999-12-31', service_code: ['11'], billing_class: 'professional', setting: 'outpatient', ...extra });
const item = (code, rates, type = 'CPT') => ({ negotiation_arrangement: 'ffs', name: code, billing_code_type: type, billing_code_type_version: '2026', billing_code: code, description: `Service ${code}`, negotiated_rates: rates });
const FILE = {
  reporting_entity_name: 'Example Plan', reporting_entity_type: 'issuer', last_updated_on: '2026-09-01', version: '2.2.1',
  in_network: [
    item('99214', [{ provider_references: [1], negotiated_prices: [price(150)] }, { provider_references: [2], negotiated_prices: [price(120, { service_code: ['22'] })] }]),
    item('71046', [{ provider_references: [2], negotiated_prices: [price(30, { billing_code_modifier: ['26'] })] }]),
    item('99999', [{ provider_references: [1], negotiated_prices: [price(10)] }]),
    item('470', [{ provider_references: [2], negotiated_prices: [price(25000, { billing_class: 'institutional', setting: 'inpatient', service_code: undefined })] }], 'MS-DRG'),
  ],
  // After in_network, as some insurers write it: groups are resolved at the end.
  provider_references: [
    { provider_group_id: 1, network_name: ['N'], provider_groups: [{ npi: [1234567893], tin: { type: 'ein', value: '12-3456789', business_name: 'Alpha Clinic' } }] },
    { provider_group_id: 2, network_name: ['N'], provider_groups: [{ npi: [1987654321, 1111111112], tin: { type: 'ein', value: '98-7654321', business_name: 'Beta Hospital' } }] },
  ],
};
const file = (v, name = 'rates.json') => new File([typeof v === 'string' || v instanceof Uint8Array ? v : JSON.stringify(v)], name);

test('the POS lists are disjoint and hold the hospital settings where they belong', () => {
  assert.equal(FACILITY_POS.filter((p) => NONFACILITY_POS.includes(p)).length, 0);
  assert.equal(settingFor(['21']), 'facility');
  assert.equal(settingFor(['11', '12']), 'nonfacility');
  assert.match(settingFor(['11', '22']).unpriced, /both facility and nonfacility/);
  assert.match(settingFor(['CSTM-00']).unpriced, /every place of service/);
  assert.match(settingFor(['18']).unpriced, /neither Medicare list/);
});

test('a professional line reprices at RVU x GPCI x CF, facility or nonfacility by place of service', () => {
  const base = { code: '99214', rows: ROWS[99214], gpci: GPCI, conversionFactor: CF, edition: 'RVU26D' };
  assert.equal(repriceProfessional({ ...base, serviceCodes: ['11'] }).amount, fee(1.92, 1.5, 0.13));
  assert.equal(repriceProfessional({ ...base, serviceCodes: ['22'] }).amount, fee(1.92, 0.8, 0.13));
  assert.equal(repriceProfessional({ ...base, serviceCodes: ['11'], modifiers: ['25'] }).amount, fee(1.92, 1.5, 0.13), '25 is price-neutral');
  assert.match(repriceProfessional({ ...base, serviceCodes: ['11'], modifiers: ['50'] }).unpriced, /modifier 50 changes the Medicare amount/);
  const pc = repriceProfessional({ code: '71046', rows: ROWS[71046], gpci: GPCI, conversionFactor: CF, edition: 'RVU26D', serviceCodes: ['11'], modifiers: ['26'] });
  assert.equal(pc.amount, fee(0.21, 0.08, 0.01));
  assert.match(pc.method, /modifier 26, TEST LOCALITY$/);
  assert.match(repriceProfessional({ code: '80053', rows: ROWS[80053], gpci: GPCI, conversionFactor: CF, serviceCodes: ['11'] }).unpriced, /status X/);
  assert.match(repriceProfessional({ code: '12345', rows: [], gpci: GPCI, conversionFactor: CF, serviceCodes: ['11'] }).unpriced, /not in the physician fee schedule/);
});

test('3 codes across 2 providers return exactly those rates; one with no Medicare equivalent is labeled', async () => {
  const q = parseQuery('99214, 71046 470');
  const x = await extractRates(file(FILE), q);
  const r = summarize([{ name: 'rates.json', ...x }], q, ctx);
  assert.deepEqual(r.rows.map((row) => [row.code, row.rate]), [['99214', 150], ['99214', 120], ['71046', 30], ['470', 25000]]);
  assert.deepEqual(r.rows.map((row) => row.pctMedicare), [Math.round(150 / fee(1.92, 1.5, 0.13) * 1000) / 10, Math.round(120 / fee(1.92, 0.8, 0.13) * 1000) / 10, Math.round(30 / fee(0.21, 0.08, 0.01) * 1000) / 10, null]);
  assert.match(r.rows[3].medicareBasis, /IPPS, whose hospital base rates this site does not hold/);
  assert.match(r.rows[0].medicareBasis, /^physician fee schedule, nonfacility rate, TEST LOCALITY, RVU26D$/);
  assert.match(r.rows[0].providers, /^Alpha Clinic EIN 12-3456789 \(1 NPI\)$/);
  assert.match(r.band, /^4 rates for 3 codes across 2 provider groups\. Rates priced against Medicare run /);
});

test('a provider filter keeps only that provider; an absent code is named; no locality labels every line', async () => {
  const q = parseQuery('99214 99215', '98-7654321');
  const x = await extractRates(file(gzipSync(JSON.stringify(FILE)), 'rates.json.gz'), q);
  const r = summarize([{ name: 'rates.json.gz', ...x }], q, null);
  assert.deepEqual(r.rows.map((row) => row.rate), [120]);
  assert.equal(r.rows[0].medicareBasis, 'choose a Medicare locality to compare');
  assert.deepEqual(r.notes, ['No rates for 99215 in the file for the providers named.']);
});

test('percentage, per diem and non-fee-for-service rates are never compared as dollars', () => {
  const row = { arrangement: 'ffs', negotiatedType: 'percentage', rate: 60, billingClass: 'professional', codeType: 'CPT', code: '99214', serviceCodes: ['11'], modifiers: [] };
  assert.match(medicareFor(row, ctx).unpriced, /percentage, not a dollar amount/);
  assert.match(medicareFor({ ...row, negotiatedType: 'per diem' }, ctx).unpriced, /per diem/);
  assert.match(medicareFor({ ...row, negotiatedType: 'negotiated', arrangement: 'bundle' }, ctx).unpriced, /bundle arrangement/);
  assert.match(medicareFor({ ...row, negotiatedType: 'negotiated', billingClass: 'institutional', setting: 'outpatient' }, ctx).unpriced, /OPPS/);
});

test('bad input is refused by name, before reading', () => {
  assert.equal(parseQuery('').error, 'Enter at least one billing code.');
  assert.match(parseQuery('99214', '12345').error, /^12345 is neither a 10-digit NPI nor a 9-digit TIN\.$/);
  assert.match(parseQuery(Array.from({ length: 51 }, (_, i) => String(10000 + i)).join(' ')).error, /at most 50/);
});

test('a run has a receipt naming the fee schedule edition, and a CSV ending with its provenance row', async () => {
  const { result, csv, receipts } = await runRateLookup([file(FILE)], { codes: '99214', providers: '' }, { rows: ROWS, gpci: GPCI, conversionFactor: CF, edition: 'RVU26D' });
  assert.equal(result.rows.length, 2);
  assert.deepEqual(receipts.receipt.data, [{ id: 'mpfs', sourceEdition: 'RVU26D' }]);
  assert.deepEqual(receipts.receipt.options, { codes: ['99214'], providers: [], locality: 'TEST LOCALITY' });
  assert.match(csv.trimEnd().split(/\r?\n/).at(-1), /^# Made by sophiewell\.com tic-rate-lookup, build [^,]+, data mpfs RVU26D, result [0-9a-f]{64}\./);
});

// spec-v1614 §6: an outpatient institutional rate is priced from the reader's own Addendum B; without it, or for
// an inpatient or non-HCPCS row, it says why.
test('outpatient institutional rates priced from the reader\'s Addendum B', async () => {
  const { medicareFor } = await import('../../lib/tic-rate-lookup.js');
  const { parseAddendumB } = await import('../../lib/opps-addendum-b.js');
  const opps = parseAddendumB('Addendum B.-Final OPPS Payment by HCPCS Code for CY 2026,,,,,\nHCPCS Code,Short Descriptor,SI,APC,Relative Weight,Payment Rate\n71046,,S,5521,0.9726,$88.91\nG0463,,J2,5012,1.4879,$136.02\n');
  const row = { code: '71046', codeType: 'CPT', arrangement: 'ffs', negotiatedType: 'negotiated', rate: 150, billingClass: 'institutional', setting: 'outpatient', serviceCodes: [], modifiers: [] };
  assert.deepEqual(medicareFor(row, null, opps), { amount: 88.91, method: 'OPPS national rate, APC 5521, status indicator S', edition: 'Final OPPS Payment by HCPCS Code for CY 2026' });
  assert.match(medicareFor(row, null).unpriced, /add your copy of the CMS Addendum B/);
  assert.match(medicareFor({ ...row, code: 'G0463', codeType: 'HCPCS' }, null, opps).unpriced, /^status indicator J2/);
  assert.match(medicareFor({ ...row, codeType: 'RC' }, null, opps).unpriced, /RC codes are not in the OPPS Addendum B/);
  assert.match(medicareFor({ ...row, setting: 'inpatient' }, null, opps).unpriced, /IPPS/);
});
