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

import { premiumTaxCredit as ptc, employerAffordability as ea, applicablePercentage, DATED_PTC } from '../../lib/marketplace-credit-v1506.js';

test('applicable percentage: linear within a band, rounded to a hundredth', () => {
  const b26 = DATED_PTC['ptc-table-2026'].values.bands;
  assert.equal(applicablePercentage(175, b26), 5.4);
  assert.equal(applicablePercentage(120, b26), 2.1);
  assert.equal(applicablePercentage(400, b26), 9.96);
  assert.equal(applicablePercentage(275, DATED_PTC['ptc-table-2027'].values.bands), 9.44);
});

test('premium tax credit: the benchmark less the expected contribution, and the 100%/400% limits', () => {
  const r = ptc({ magi: '40000', size: '1', region: 'us', benchmark: '550', year: '2026' });
  assert.equal(r.applicablePercent, 8.61);
  assert.equal(r.credit, 3156);
  assert.equal(ptc({ magi: '70000', size: '1', region: 'us', benchmark: '550', year: '2026' }).bandLabel, 'Above 400%');
  assert.equal(ptc({ magi: '12000', size: '1', region: 'us', benchmark: '550', year: '2026' }).bandLabel, 'Below 100%');
  assert.match(ptc({ magi: '40000', size: '1', region: 'us', benchmark: '550', year: '2028' }).message, ASKING);
});

test('employer affordability: self-only for the employee, the family premium for the family', () => {
  const r = ea({ income: '50000', selfOnly: '400', family: '1200', year: '2026' });
  assert.match(r.band, /Employee: affordable/);
  assert.match(r.band, /Family members: not affordable/);
  assert.equal(ea({ income: '50000', selfOnly: '420', year: '2026' }).bandLabel, 'Not affordable for the employee');
  assert.equal(ea({ income: '50000', selfOnly: '420', year: '2027' }).bandLabel, 'Affordable for the employee');
});
