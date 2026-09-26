// spec-v1506 tools 5 and 8: percent of the poverty guidelines, and IRMAA.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ASKING, DISCLOSING } from '../lib/asking-language.js';
import { fplPercent as fp, irmaa as ir } from '../../lib/income-screens-v1506.js';

test('poverty guidelines: base plus a fixed amount per person, by region and year', () => {
  assert.equal(fp({ size: '3', income: '40000', region: 'us', program: 'current', period: 'annual', year: '2026' }).guideline, 27320);
  assert.equal(fp({ size: '8', income: '1', region: 'ak', program: 'current', period: 'annual', year: '2026' }).guideline, 69650);
  assert.equal(fp({ size: '8', income: '1', region: 'hi', program: 'current', period: 'annual', year: '2025' }).guideline, 62300);
  assert.equal(fp({ size: '1', income: '2000', region: 'ak', program: 'current', period: 'monthly', year: '2026' }).percent, 120.3);
});

test('the premium tax credit uses the prior year\'s guidelines', () => {
  const r = fp({ size: '3', income: '40000', region: 'us', program: 'ptc', period: 'annual', year: '2026', threshold: '400' });
  assert.equal(r.guideline, 26650);
  assert.equal(r.percent, 150.1);
  assert.match(r.bandLabel, /within 400%/);
  assert.match(fp({ size: '3', income: '40000', region: 'us', program: 'current', period: 'annual', year: '2028' }).message, ASKING);
  assert.match(fp({ size: '3', income: '40000', region: 'us', program: 'current', year: '2026' }).notes[0], DISCLOSING);
});

test('IRMAA: brackets by filing status, and the boundaries', () => {
  assert.equal(ir({ filing: 'single', magi: '109000', year: '2026' }).partBAdjustment, 0);
  assert.equal(ir({ filing: 'single', magi: '109001', year: '2026' }).partBAdjustment, 81.2);
  assert.equal(ir({ filing: 'joint', magi: '300000', year: '2026' }).partDAdjustment, 37.5);
  assert.equal(ir({ filing: 'single', magi: '499999', year: '2026' }).partBAdjustment, 446.3);
  assert.equal(ir({ filing: 'single', magi: '500000', year: '2026' }).partBAdjustment, 487);
  assert.equal(ir({ filing: 'mfs', magi: '120000', year: '2026' }).partBAdjustment, 446.3);
  assert.equal(ir({ filing: 'mfs', magi: '391000', year: '2026' }).partDAdjustment, 91);
  assert.match(ir({ filing: 'single', magi: '200000', year: '2027' }).message, ASKING);
  assert.match(ir({}).message, ASKING);
});
