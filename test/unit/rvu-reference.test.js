// spec-v1614 §6: the reader's own CMS relative value file, in the PPRRVU and GPCI layouts the data/mpfs builder
// reads, as a bare CSV and inside the CMS RVU zip.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parsePprrvu, parseGpci, readRvuFile } from '../../lib/rvu-reference.js';
import { makeZip } from '../lib/zip-fixture.js';

// One PPRRVU row: 32 columns; status 4, work 6, PE nonfacility 7, PE facility 9, malpractice 11, conversion factor 26.
const row = (code, mod, work, peNf, peF, mp, cf) => {
  const r = Array(32).fill('');
  Object.assign(r, { 0: code, 1: mod, 2: 'desc, with a comma', 3: 'A', 5: work, 6: peNf, 8: peF, 10: mp, 25: cf });
  return r.map((v) => (String(v).includes(',') ? `"${v}"` : v)).join(',');
};
const PPRRVU = [
  ',,2027 National Physician Fee Schedule Relative Value File January Release,,,',
  `HCPCS,MOD,DESCRIPTION,${Array(29).fill('X').join(',')}`,
  row('99214', '', '1.92', '1.50', '0.80', '0.13', '34.0000'),
  row('71046', '26', '0.22', '0.09', '0.09', '0.02', '34.0000'),
].join('\r\n');
const GPCI = 'Medicare Administrative Contractor,State,Locality Number,Locality Name,PW GPCI,PE GPCI,MP GPCI\r\n'
  .replace(/^/, 'ADDENDUM E. GPCIs,,,,,,\r\n') + '04412,TX,18,HOUSTON,1.000,1.100,0.900\r\n,,,,,,\r\nfootnote,,,,,,\r\n';

test('the PPRRVU rows and their single conversion factor', () => {
  const p = parsePprrvu(PPRRVU);
  assert.equal(p.conversionFactor, 34);
  assert.deepEqual(p.rows['99214'][0], { code: '99214', statusCode: 'A', workRvu: 1.92, peRvuNonFacility: 1.5, peRvuFacility: 0.8, mpRvu: 0.13 });
  assert.equal(p.rows['71046'][0].modifier, '26');
  assert.throws(() => parsePprrvu('HCPCS,MOD\n99213,'), /not a CMS physician fee schedule relative value/);
  assert.throws(() => parsePprrvu(PPRRVU.replace('34.0000', '33.0000')), /carries 2 conversion factors/);
});

test('the GPCIs stop at the footnotes', () => {
  assert.deepEqual(parseGpci(GPCI), [{ mac: '04412', state: 'TX', locality: '18', name: 'HOUSTON', workGpci: 1, peGpci: 1.1, mpGpci: 0.9 }]);
});

test('readRvuFile: the RVU zip gives rows, factor, localities and the member name as the edition', async () => {
  const zip = makeZip([{ name: 'PPRRVU2027_Jan_QPP.csv', data: PPRRVU }, { name: 'PPRRVU2027_Jan_nonQPP.csv', data: PPRRVU }, { name: 'GPCI2027.csv', data: GPCI }]);
  const z = await readRvuFile(new File([zip], 'RVU27A.zip'));
  assert.equal(z.edition, 'PPRRVU2027_Jan_nonQPP');
  assert.equal(z.localities.length, 1);
  const csv = await readRvuFile(new File([PPRRVU], 'PPRRVU2027_Jan_nonQPP.csv'));
  assert.equal(csv.localities.length, 0);
  assert.equal(csv.edition, 'PPRRVU2027_Jan_nonQPP');
});
