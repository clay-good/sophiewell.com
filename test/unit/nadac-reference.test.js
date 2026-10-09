// spec-v1614 §6: the reader's own NADAC file prices older fills. A yearly file repeats each drug every week; each
// claim is priced at the step in effect on its fill date, and only while the file's weeks reach that date.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readNadacFile, nadacHistory, stepOn } from '../../lib/nadac-reference.js';
import { pharmacySpreadCheck } from '../../lib/pharmacy-spread-check.js';

const CSV = [
  'NDC_Description,NDC,NADAC_Per_Unit,Effective_Date,Pricing_Unit,Pharmacy_Type_Indicator,OTC,Explanation_Code,Classification_for_Rate_Setting,Corresponding_Generic_Drug_NADAC_Per_Unit,Corresponding_Generic_Drug_Effective_Date,As_of_Date',
  '"METFORMIN HCL 500 MG TABLET",00093104801,0.02000,01/15/2020,EA,C/I,N,"1, 5",G,,,01/22/2020',
  '"METFORMIN HCL 500 MG TABLET",00093104801,0.02000,01/15/2020,EA,C/I,N,"1, 5",G,,,01/29/2020',
  '"METFORMIN HCL 500 MG TABLET",00093104801,0.01800,02/12/2020,EA,C/I,N,"1, 5",G,,,02/19/2020',
  '"OTHER DRUG",12345678901,9.99,01/15/2020,EA,C/I,N,1,B,,,02/19/2020',
].join('\r\n');

test('reads the yearly layout with underscores, keeping only the labelers asked for; the history has distinct steps', async () => {
  const n = await readNadacFile(new File([CSV], 'nadac-2020.csv'), ['00093']);
  assert.equal(n.rows.length, 3);
  assert.equal(n.asOfDate, '2020-02-19');
  assert.equal(n.firstAsOf, '2020-01-22');
  const h = nadacHistory(n.rows);
  assert.deepEqual(h['00093104801'].map((r) => [r.effectiveDate, r.perUnit]), [['2020-01-15', 0.02], ['2020-02-12', 0.018]]);
  assert.equal(stepOn(h['00093104801'], '2020-02-01').perUnit, 0.02);
  assert.equal(stepOn(h['00093104801'], '2020-02-12').perUnit, 0.018);
  await assert.rejects(readNadacFile(new File(['a,b\n1,2\n'], 'x.csv'), ['00093']), /not a CMS NADAC file/);
});

test('pharmacy-spread-check prices each fill at the step in effect that day; outside the file it says why', async () => {
  const n = await readNadacFile(new File([CSV], 'nadac-2020.csv'), ['00093']);
  const nadac = { status: 'ok', asOfDate: n.asOfDate, edition: { id: 'nadac', sourceEdition: 'nadac-2020.csv, your copy' }, labelers: { '00093': 'listed' }, rows: [], history: nadacHistory(n.rows) };
  const claims = '00093-1048-01, 100, 2020-02-01, 10, 0\n00093-1048-01, 100, 2020-02-15, 10, 0\n00093-1048-01, 100, 2020-01-01, 10, 0\n00093-1048-01, 100, 2020-03-01, 10, 0';
  const r = pharmacySpreadCheck({ claims, nadac });
  assert.equal(r.rows[0].nadacCost, 200);
  assert.equal(r.rows[1].nadacCost, 180);
  assert.match(r.rows[2].reason, /after the fill date/);
  assert.match(r.rows[3].reason, /after the NADAC week/);
});
