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

test('a context field left blank takes the form\'s answer; a row\'s own cell wins', () => {
  assert.deepEqual(rowArgs(FPL, { size: '3', income: '40000', region: '' }, FORM), { reference: '', size: '3', income: '40000', ...FORM, threshold: '' });
  assert.equal(rowArgs(FPL, { size: '3', income: '40000', region: 'Alaska' }, FORM).region, 'ak');
});

test('a fact about the row is never filled from the form, required or not', () => {
  const MSP = BATCH_TOOLS['extra-help-msp-screen'];
  const args = rowArgs(MSP, { marital: 'single', unearned: '1200', resources: '5000', earned: '' }, { region: 'us', year: '2026', earned: '900', dependents: '2', burial: 'yes' });
  assert.deepEqual([args.earned, args.dependents, args.burial, args.region, args.year], ['', '', '', 'us', '2026']);
  for (const f of MSP.fields) if (f.fromForm) assert.ok(['region', 'year'].includes(f.id), `${f.id} is a fact about the person, not context`);
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
  assert.equal(runBatch('extra-help-msp-screen', [{ marital: 'single', unearned: '1200', resources: '5000' }], { region: 'us', year: '2026' }).band, '1 person of 1 computed.');
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

test('a hospital\'s policy comes from the form for every patient; charges and income only from the row', () => {
  const FORM_FAP = { region: 'us', year: '2026', tier1Limit: '200', tier1Discount: '100', tier2Limit: '400', tier2Discount: '50', gross: '999', income: '1' };
  const r = runBatch('fap-discount', [{ size: '3', income: '30000', gross: '20000' }, { size: '4', income: '50000', gross: '' }], FORM_FAP);
  assert.equal(r.rows[0].label, '$0.00');
  assert.equal(r.rows[1].detail, 'Enter the gross charges in dollars.');
  assert.equal(r.band, '1 patient of 2 computed. 1 row needs corrected inputs.');
  const fap = BATCH_TOOLS['fap-discount'];
  assert.ok(!fap.fields.some((f) => fap.formOnly.includes(f.id)), 'the policy is not a file column');
  assert.equal(rowArgs(fap, { size: '3', income: '30000', gross: '20000' }, FORM_FAP).tier2Discount, '50');
});
