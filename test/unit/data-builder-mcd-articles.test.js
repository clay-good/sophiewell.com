// spec-v1517 mcd-export: the MCD articles builder, against a ZIP holding a ZIP of the CSV tables it reads,
// cut to two articles in the export's own layout (B/M/E range rows, HTML paragraphs, a New York region).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import mcd, { parse, plain } from '../../scripts/data/builders/mcd-articles.mjs';
import { checkDataset } from '../../scripts/data/check.mjs';
import { makeZip } from '../lib/zip-fixture.js';

const csv = (rows) => Buffer.from(rows.map((r) => r.map((c) => (/[",\n]/.test(c) ? `"${c.replace(/"/g, '""')}"` : c)).join(',')).join('\n'), 'utf8');
const tables = {
  article: [['article_id', 'article_version', 'title', 'date_retired', 'display_id'], ['52369', '17', 'Billing and Coding: Knee Arthroscopy \u2013 Article', '', 'A52369'], ['99', '1', 'Retired', '2026-01-01', 'A99']],
  article_x_hcpc_code: [['article_id', 'article_version', 'hcpc_code_id', 'hcpc_code_group', 'long_description', 'range'], ['52369', '17', '29877', '1', 'AMA TEXT', 'N'], ['52369', '17', 'G0289', '1', 'TEXT', 'N'], ['99', '1', '29877', '1', '', 'N']],
  article_x_icd10_covered: [['article_id', 'article_version', 'icd10_code_id', 'icd10_covered_group', 'range', 'description', 'asterisk'], ['52369', '17', 'M23.200', '1', 'B', 'x', 'N'], ['52369', '17', 'M23.201', '1', 'M', 'x', 'Y'], ['52369', '17', 'M23.202', '1', 'E', 'x', 'N']],
  article_x_icd10_noncovered: [['article_id', 'article_version', 'icd10_code_id', 'icd10_noncovered_group', 'range', 'description'], ['52369', '17', 'M17.11', '1', 'N', 'x']],
  article_x_hcpc_code_group: [['article_id', 'article_version', 'hcpc_code_group', 'paragraph'], ['52369', '17', '1', '']],
  article_x_icd10_covered_group: [['article_id', 'article_version', 'icd10_covered_group', 'paragraph'], ['52369', '17', '1', '<p>Bill with the &#8211;KX modifier &amp; a meniscal tear.</p>']],
  article_x_icd10_noncovered_group: [['article_id', 'article_version', 'icd10_noncovered_group', 'paragraph'], ['52369', '17', '1', '<p>Nationally non-covered (NCD 150.9).</p>']],
  update_period: [['period_id', 'begin_date', 'end_date'], ['1219', '2026-09-14 00:00:00', '2026-09-21 00:00:00'], ['1220', '2026-09-21 00:00:00', '2026-09-28 00:00:00']],
  state_lookup: [['state_id', 'state_abbrev', 'description'], ['7', 'CT', 'Connecticut'], ['65', 'UN', 'New York - Upstate']],
  contractor: [['contractor_id', 'contractor_type_id', 'contractor_version', 'contractor_bus_name'], ['500', '8', '1', 'Wellpoint Federal']],
  contractor_jurisdiction: [['contractor_id', 'contractor_type_id', 'contractor_version', 'state_id', 'term_date'], ['500', '8', '1', '7', ''], ['500', '8', '1', '65', '']],
  article_x_contractor: [['article_id', 'article_version', 'article_type', 'contractor_id', 'contractor_type_id', 'contractor_version'], ['52369', '17', '6', '500', '8', '1']],
};
const inner = makeZip(Object.entries(tables).map(([name, rows]) => ({ name: `${name}.csv`, data: csv(rows) })));
const outer = makeZip([{ name: 'current_article_csv.zip', data: inner, method: 0 }, { name: 'readme_first.txt', data: 'x', method: 0 }]);

test('parse: current articles with codes, ranges already code by code, regions read as their state', async () => {
  const found = {};
  const { records, ancillary } = await parse(outer, found, { bounds: false });
  assert.deepEqual(records.map((r) => r.id), ['52369'], 'the retired article is dropped');
  const a = records[0];
  assert.deepEqual(a.codes, { 1: ['29877', 'G0289'] });
  assert.deepEqual(a.covered, { 1: ['M23.200', 'M23.201', 'M23.202'] });
  assert.deepEqual(a.noncovered, { 1: ['M17.11'] });
  assert.deepEqual(a.asterisked, ['M23.201']);
  assert.deepEqual(a.states, ['CT', 'NY']);
  assert.deepEqual(a.regions, ['New York - Upstate']);
  assert.equal(a.paragraphs.covered[1], 'Bill with the \u2013KX modifier & a meniscal tear.');
  assert.ok(!JSON.stringify(records).includes('AMA TEXT'), 'descriptions are dropped');
  assert.deepEqual(ancillary['index.json']['29877'], [['52369', '1']]);
  assert.deepEqual([found.edition, found.expiresOn, found.nextExpected], ['2026-09-28 weekly', '2026-10-12', '2026-10-05']);
  assert.deepEqual(checkDataset({ records, ancillary, canaries: mcd.stableCanaries, shape: mcd.shape }).problems, []);
});

test('paragraph HTML becomes capped plain text; the bounds hold on real runs', async () => {
  assert.equal(plain('<p>a&nbsp;b</p><br/>c'), 'a b c');
  assert.ok(plain('x'.repeat(2000)).length <= 800);
  await assert.rejects(parse(outer, {}), /outside 400-3000/);
});
