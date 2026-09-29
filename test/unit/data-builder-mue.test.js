// spec-v1621 §3.3 and §6: the MUE builder, against trimmed copies of the
// 2026 Q4 tables (the quoted multi-line AMA notice, the header with its
// embedded line break, six codes per setting) and the saved landing page.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import mue, { discover, parse, settingRows, quarterDates } from '../../scripts/data/builders/mue.mjs';
import { checkDataset } from '../../scripts/data/check.mjs';
import { makeZip } from '../lib/zip-fixture.js';

const FIX = join(dirname(fileURLToPath(import.meta.url)), '..', 'fixtures', 'data-sources', 'mue');
const read = (f) => readFileSync(join(FIX, f));
const zipOf = (member) => makeZip([{ name: member, data: read(member) }, { name: member.replace('.csv', '.xlsx'), data: 'x', method: 0 }]);
const P = zipOf('MCR_MUE_PractitionerServices_Eff_10-01-2026.csv');
const H = zipOf('MCR_MUE_OutpatientHospitalServices_Eff_10-01-2026.csv');
const D = zipOf('MCR_MUE_DMESupplierServices_Eff_10-01-2026.csv');

test('quarter dates', () => {
  assert.deepEqual(quarterDates(2026, 4), { effectiveFrom: '2026-10-01', nextExpected: '2026-12-02', expiresOn: '2027-04-01' });
});

test('discover: the newest quarter with all three settings', async () => {
  const found = await discover({ getText: async () => read('landing.html').toString() });
  assert.equal(found.edition, '2026 Q4');
  assert.match(found.url, /2026-q4-practitioner-services/);
  assert.equal(found.parts.length, 2);
  assert.match(found.urls.dme, /dme-supplier-services/);
});

test('settingRows: position-mapped, indicator as a number, codes only', () => {
  const { member, rows } = settingRows(P, 'practitioner', { bounds: false });
  assert.equal(member, 'MCR_MUE_PractitionerServices_Eff_10-01-2026.csv');
  assert.deepEqual(rows.find((r) => r.code === '99213'), { code: '99213', mue: 2, mai: 3, rationale: 'Clinical: Data' });
  assert.throws(() => settingRows(P, 'practitioner'), /outside 13000-18000/, 'the bounds hold on real runs');
});

test('parse merges three settings per code and passes the 2026 Q4 canaries', async () => {
  const found = { urls: { hospital: 'h', dme: 'd' }, partBytes: { h: H, d: D } };
  const { records, ancillary } = await parse(P, found, { bounds: false });
  const r71046 = records.find((r) => r.code === '71046');
  assert.deepEqual(r71046, { code: '71046', practitioner: { mue: 2, mai: 3, rationale: 'Clinical: Data' }, hospital: { mue: 3, mai: 3, rationale: 'Clinical: Data' } });
  assert.equal(records.find((r) => r.code === 'E0114').dme.mue, 1);
  assert.equal(ancillary['members.json'].dme, 'MCR_MUE_DMESupplierServices_Eff_10-01-2026.csv');
  const check = checkDataset({ records, ancillary, canaries: [...mue.stableCanaries, ...mue.canaries['2026 Q4']], shape: mue.shape });
  assert.deepEqual(check.problems, []);
});

test('a header that moved, or an indicator that is not 1-3, fails the parse', () => {
  const text = read('MCR_MUE_PractitionerServices_Eff_10-01-2026.csv').toString('latin1');
  const moved = makeZip([{ name: 'MCR_MUE_PractitionerServices_Eff_10-01-2026.csv', data: Buffer.from(text.replace('MUE Adjudication Indicator', 'Indicator X'), 'latin1') }]);
  assert.throws(() => settingRows(moved, 'practitioner', { bounds: false }), /header changed/);
  const bad = makeZip([{ name: 'MCR_MUE_PractitionerServices_Eff_10-01-2026.csv', data: Buffer.from(text.replace('99213,2,3 Date', '99213,2,7 Date'), 'latin1') }]);
  assert.throws(() => settingRows(bad, 'practitioner', { bounds: false }), /99213 has MUE/);
});
