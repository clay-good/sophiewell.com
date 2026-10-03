// spec-v1501 §3: batch mode for form tools -- one case per CSV row, through the tool's own function.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BATCH_TOOLS, cellValue, rowArgs, runBatch } from '../../lib/batch-tools.js';
import { fplPercent } from '../../lib/income-screens-v1506.js';
import { CSV_TOOLS } from '../../lib/upload-fields.js';

const FPL = BATCH_TOOLS['fpl-percent'];
const field = (id) => FPL.fields.find((f) => f.id === id);
const FORM = { region: 'us', program: 'current', period: 'annual', year: '2026' };

test('a choice cell matches by value, by its words, or by an alias, ignoring case; anything else passes as written', () => {
  assert.equal(cellValue(field('region'), 'Alaska'), 'ak');
  assert.equal(cellValue(field('region'), ' HI '), 'hi');
  assert.equal(cellValue(field('region'), 'the 48 contiguous states and dc'), 'us');
  assert.equal(cellValue(field('program'), 'Marketplace'), 'ptc');
  assert.equal(cellValue(field('period'), 'Monthly'), 'monthly');
  assert.equal(cellValue(field('region'), 'Guam'), 'Guam');
  assert.equal(cellValue(field('size'), ' 3 '), '3');
});

test('a row\'s cells override the form\'s answers, and a blank optional cell keeps the form\'s', () => {
  assert.deepEqual(rowArgs(FPL, { size: '3', income: '40000', region: '' }, FORM), { ...FORM, size: '3', income: '40000' });
  assert.equal(rowArgs(FPL, { size: '3', income: '40000', region: 'Alaska' }, FORM).region, 'ak');
});

test('each row is the form\'s own answer, and a bad row says why without stopping the rest', () => {
  const rows = [
    { reference: 'A', size: '3', income: '40000' },
    { reference: 'B', size: '4', income: '6000', period: 'monthly', region: 'Hawaii' },
    { reference: 'C', size: 'three', income: '40000' },
  ];
  const r = runBatch('fpl-percent', rows, FORM);
  assert.equal(r.valid, true);
  assert.equal(r.rows[0].detail, fplPercent({ ...FORM, size: '3', income: '40000' }).band);
  assert.equal(r.rows[1].label, fplPercent({ ...FORM, size: '4', income: '6000', period: 'monthly', region: 'hi' }).bandLabel);
  assert.equal(r.rows[2].ok, false);
  assert.equal(r.rows[2].detail, fplPercent({ ...FORM, size: 'three', income: '40000' }).message);
  assert.equal(r.band, '2 households of 3 computed. 1 row needs corrected inputs.');
  assert.equal(r.abnormal, true);
});

test('a blank required cell is the row\'s, never the form\'s', () => {
  const r = runBatch('fpl-percent', [{ size: '2', income: '' }], { ...FORM, size: '3', income: '40000' });
  assert.equal(r.rows[0].ok, false);
  assert.equal(r.rows[0].detail, fplPercent({ ...FORM, size: '2', income: '' }).message);
});

test('a file without the region or program columns needs the form to answer them', () => {
  const r = runBatch('fpl-percent', [{ size: '3', income: '40000' }], {});
  assert.equal(r.rows[0].ok, false);
  assert.match(r.rows[0].detail, /Choose where the household lives/);
});

test('a households file is recognized by its size and income columns', () => {
  const t = CSV_TOOLS.find((x) => x.id === 'fpl-percent');
  assert.ok(t);
  assert.deepEqual(t.fields.filter((f) => f.required).map((f) => f.id), ['size', 'income']);
  assert.equal(runBatch('no-such-tool', [], {}).valid, false);
});
