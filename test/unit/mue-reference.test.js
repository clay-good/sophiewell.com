// spec-v1614 §6: the reader's own MUE table, in the CMS CSV layout the data/mue builder reads (a quoted
// copyright preamble, a header cell with a line break inside its quotes), as a CSV and inside the CMS zip.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseMueTable, readMueFile } from '../../lib/mue-reference.js';
import { makeZip } from '../lib/zip-fixture.js';

const PRE = '"Current Procedural Terminology (CPT) codes, descriptions and other data only are copyright the American Medical Association.\r\n\r\nApplicable FARS/DFARS Restrictions Apply.",,,\r\n';
const hospital = PRE + '"HCPCS/\r\nCPT Code",Outpatient Hospital Services MUE Values,MUE Adjudication Indicator,MUE Rationale\r\n36415,2,3 Date of Service Edit: Clinical,Nature of Service/Procedure\r\n99284,1,2 Date of Service Edit: Policy,CMS Policy\r\n';

test('the hospital table: setting from the column, rows read, edition from the member name', () => {
  const t = parseMueTable(hospital, 'MCR_MUE_OutpatientHospitalServices_Eff_10-01-2026.csv');
  assert.equal(t.setting, 'hospital');
  assert.equal(t.edition, 'effective 2026-10-01');
  assert.deepEqual(t.rows['36415'], { mue: 2, mai: 3 });
  assert.equal(t.count, 2);
});

test('the shipped sample reads as the practitioner table; a non-MUE file is refused', () => {
  const t = parseMueTable(readFileSync('test/fixtures/file-kinds/reference-mue.csv', 'latin1'));
  assert.equal(t.setting, 'practitioner');
  assert.throws(() => parseMueTable('code,units\n99213,1\n'), /not a CMS MUE table/);
});

test('readMueFile opens the CMS zip and picks the MCR_MUE member', async () => {
  const zip = makeZip([{ name: 'readme.txt', data: 'x' }, { name: 'MCR_MUE_OutpatientHospitalServices_Eff_10-01-2026.csv', data: hospital }]);
  const t = await readMueFile(new File([zip], 'medicare-ncci-2026-q4-facility-outpatient-hospital-services-mue-table.zip'));
  assert.equal(t.setting, 'hospital');
  assert.equal(t.edition, 'effective 2026-10-01');
});
