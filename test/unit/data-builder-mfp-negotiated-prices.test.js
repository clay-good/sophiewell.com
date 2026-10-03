// spec-v1517 route A: the CMS negotiated-prices builder. The file is a dated history -- rows are added,
// inflation-updated or deselected, never replaced -- so every row is kept, and the per-drug table the
// price check reads is derived from it.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeZip } from '../lib/zip-fixture.js';
import builder, { drugId, drugTable } from '../../scripts/data/builders/mfp-negotiated-prices.mjs';
import { MFP_FILE } from '../../data/mfp-negotiated-prices/drugs.js';
import { DATED_MFP, DRUGS } from '../../lib/mfp-prices-v1506.js';

const HEAD = 'IPAY,Selected Drug Name,Active Ingredient Name or Active Moiety Name,NDC-9,NDC-11,XREF NDC-11,HCPCS Code,MFP Effective Date,MFP End Date,Single MFP per 30 DES,NDC-9 MFP per Unit Price,HCPCS Code Dosage Price,As of Date,Type of Update,Remarks';
// Rows shaped like the file of 2026-09-21: an inflation update, an NDC split into two same-price periods,
// an NDC dropped before its price took effect, and a drug selected before its price is published.
const ROWS = [
  '2026,ELIQUIS; ELIQUIS SPRINKLE,APIXABAN,00003-0893,00003-0893-21,,,01/01/2026,12/31/2026,231,4.145072,,08/15/2024,End Date,"Added for IPAY 2026, end dated"',
  '2026,ELIQUIS; ELIQUIS SPRINKLE,APIXABAN,00003-0893,00003-0893-21,,,01/01/2027,,237.25,4.257193,,11/25/2025,Inflation,Inflation adjustment',
  '2026,ENTRESTO; ENTRESTO SPRINKLE,SACUBITRIL; VALSARTAN,00078-0659,00078-0659-20,,,01/01/2026,05/31/2026,295,4.9,,08/15/2024,Recalc,',
  '2026,ENTRESTO; ENTRESTO SPRINKLE,SACUBITRIL; VALSARTAN,00078-0659,00078-0659-20,,,06/01/2026,12/31/2026,295,4.9,,05/01/2026,Deselect,',
  '2026,ENTRESTO; ENTRESTO SPRINKLE,SACUBITRIL; VALSARTAN,00078-0777,00078-0777-20,,,01/01/2026,12/31/2025,295,4.9,,08/15/2024,Deselect,dropped before it took effect',
  '2028,BIKTARVY,BICTEGRAVIR; EMTRICITABINE; TENOFOVIR ALAFENAMIDE,61958-2501,61958-2501-01,,,01/01/2028,,,,,01/30/2026,New IPAY,',
];
const csv = (rows = ROWS, head = HEAD) => Buffer.from([head, ...rows].join('\r\n') + '\r\n');
const zip = (data, name = 'CMS_Negotiation_Program_Selected_Drug_List_and_Maximum_Fair_Price_Data_File_20260921.csv') => makeZip([{ name, data }]);
const run = async (z = zip(csv())) => { const found = {}; const out = await builder.parse(z, found, { bounds: false }); return { found, ...out }; };

test('every row is kept, the edition is the CSV name\'s date, and a quoted remark with a comma stays one cell', async () => {
  const { found, records } = await run();
  assert.equal(found.edition, '2026-09-21');
  assert.equal(records.length, ROWS.length);
  const first = records[0];
  assert.deepEqual([first.ndc11, first.effective, first.end, first.per30, first.perUnit, first.type], ['00003-0893-21', '2026-01-01', '2026-12-31', 231, 4.145072, 'End Date']);
  assert.equal(records.find((r) => r.ndc11 === '00078-0777-20').end, '2025-12-31', 'the row dropped before its price took effect is still in the shard');
});

test('the per-drug table merges same-price periods, skips a row that ends before it starts, and keeps an unpublished price as null', async () => {
  const { records } = await run();
  assert.deepEqual(drugTable(records), [
    ['eliquis', 'ELIQUIS; ELIQUIS SPRINKLE', 2026, [['2026-01-01', '2026-12-31', 231], ['2027-01-01', null, 237.25]]],
    ['entresto', 'ENTRESTO; ENTRESTO SPRINKLE', 2026, [['2026-01-01', '2026-12-31', 295]]],
    ['biktarvy', 'BIKTARVY', 2028, [['2028-01-01', null, null]]],
  ]);
  assert.equal(drugId('OZEMPIC; RYBELSUS; WEGOVY'), 'ozempic');
  assert.equal(drugId('BREO ELLIPTA'), 'breo-ellipta');
});

test('the module is good through December 31 of the newest priced year', async () => {
  const { ancillary } = await run();
  assert.match(ancillary['drugs.js'], /"validThrough":"2027-12-31"/);
  const later = await run(zip(csv([...ROWS, '2026,ELIQUIS; ELIQUIS SPRINKLE,APIXABAN,00003-0893,00003-0893-21,,,01/01/2028,,243.1,4.36,,11/30/2026,Inflation,'])));
  assert.match(later.ancillary['drugs.js'], /"validThrough":"2028-12-31"/);
});

test('a changed header, an undated CSV name, or a malformed NDC stops the run', async () => {
  await assert.rejects(run(zip(csv(ROWS, HEAD.replace('Single MFP per 30 DES', 'MFP')))), /header lost Single MFP per 30 DES/);
  await assert.rejects(run(zip(csv(), 'prices.csv')), /carries no yyyymmdd date/);
  await assert.rejects(run(zip(csv([ROWS[0].replace('00003-0893-21', '0003-893-21')]))), /is not 5-4-2/);
});

test('the shipped table is the one the price check reads', () => {
  const [id] = Object.keys(DATED_MFP);
  assert.equal(id, `mfp-file-${MFP_FILE.edition.replaceAll('-', '')}`);
  assert.deepEqual(DATED_MFP[id].values.drugs.map(([d, , y, p]) => [d, y, p]), MFP_FILE.drugs.map(([d, , y, p]) => [d, y, p]));
  assert.equal(DRUGS.find((d) => d.value === 'novolog').text, 'NovoLog / Fiasp (all pens and vials)');
  assert.equal(DRUGS.find((d) => d.value === 'austedo').text, 'Austedo / Austedo XR');
});
