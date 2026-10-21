// Regression tests for the defects an independent review found in the spec-v300 to v499 tools on 2026-10-20
// (spec-v1680), each with the input that showed it.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { jonesCriteria } from '../../lib/jones-v315.js';
import { gvhdGrade } from '../../lib/gvhd-v309.js';
import { icansGrade as icans } from '../../lib/icans-v306.js';
import { nottinghamNpi } from '../../lib/nottingham-npi-v330.js';
import { cdiSeverity } from '../../lib/cdi-severity-v317.js';
import { ceapVenous } from '../../lib/ceap-venous-v356.js';
import { goldAbe } from '../../lib/gold-abe-v316.js';
import { wexner } from '../../lib/wexner-v324.js';

test('Jones: chorea is sufficient whatever else is present; one joint manifestation counts', () => {
  assert.equal(jonesCriteria({ riskPopulation: 'low', episode: 'initial', chorea: true, fever: true }).met, true);
  assert.equal(jonesCriteria({ riskPopulation: 'low', episode: 'initial', chorea: true, carditis: true }).met, true);
  assert.equal(jonesCriteria({ riskPopulation: 'modhigh', episode: 'initial', polyarthritis: true, monoarthritis: true, gasEvidence: true }).met, false);
});

test('GVHD (Przepiorka 1995): gut stage 4 alone is grade III', () => {
  assert.equal(gvhdGrade({ skinStage: '0', liverStage: '0', giStage: '4' }).gradeRoman, 'III');
});

test('ICANS: a blank ICE score with no other finding is not labeled "No ICANS"', () => {
  assert.match(icans({ ice: '', loc: 'spontaneous', seizure: 'none', icp: 'none', motor: false }).bandLabel, /not excluded/);
});

test('NPI 2.404 is above 2.4, and printed above it', () => {
  const r = nottinghamNpi({ size: '2.02', nodeStage: '1', grade: '1' });
  assert.equal(r.group, 'good');
  assert.equal(r.npi, 2.404);
  assert.equal(nottinghamNpi({ size: '7', nodeStage: '1', grade: '1' }).group, 'good');
});

test('implausible units, fractional counts, a bare C4 and a blank Wexner item are asked about', () => {
  assert.equal(cdiSeverity({ wbc: '18', creatinine: '1.0' }).valid, false);
  assert.equal(goldAbe({ mmrc: '1.5' }).valid, false);
  assert.equal(ceapVenous({ cls: 'C4' }).valid, false);
  assert.equal(ceapVenous({ cls: 'C4c' }).ceapClass, 'C4c');
  assert.equal(wexner({}).valid, false);
});
