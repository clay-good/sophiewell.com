// spec-v583: the NAC / Gillmore ATTR cardiac amyloidosis stage.
//
// The load-bearing test is that stage 4 cuts across the original stages rather than extending stage 3.

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  nacAttrStage, NTPROBNP_THRESHOLD, EGFR_THRESHOLD, STAGE4_THRESHOLD,
  YOUDEN_OPTIMAL, ONE_YEAR_MORTALITY, MEDIAN_SURVIVAL_MONTHS,
} from '../../lib/nac-attr-stage-v583.js';

const at = (ntProBnp, egfr) => nacAttrStage({ ntProBnp, egfr });

test('the original three stages sit where the source puts them', () => {
  assert.equal(at(1000, 60).originalStage, 1);
  assert.equal(at(5000, 60).originalStage, 2);
  assert.equal(at(1000, 30).originalStage, 2);
  assert.equal(at(5000, 30).originalStage, 3);
});

test('the boundaries use the published operators', () => {
  assert.equal(at(NTPROBNP_THRESHOLD, 60).originalStage, 1, 'exactly 3000 is stage 1 territory');
  assert.equal(at(NTPROBNP_THRESHOLD + 1, 60).originalStage, 2);
  assert.equal(at(1000, EGFR_THRESHOLD).originalStage, 1, 'exactly 45 is stage 1 territory');
  assert.equal(at(1000, EGFR_THRESHOLD - 0.1).originalStage, 2);
});

// THE cross-cutting stage.
test('stage 4 applies irrespective of eGFR and cuts across the original stages', () => {
  const good = at(12000, 60);
  assert.equal(good.originalStage, 2, 'a perfectly good eGFR');
  assert.equal(good.expandedStage, 4);
  assert.equal(good.reclassifiedByExpansion, true);
  assert.match(good.bandText, /NOT A TAIL OF STAGE 3 - IT CUTS ACROSS/);
  assert.match(good.bandText, /65 of its 180/);
});

test('a stage 3 patient crossing 10000 is stage 4 without being reclassified', () => {
  const r = at(12000, 30);
  assert.equal(r.originalStage, 3);
  assert.equal(r.expandedStage, 4);
  assert.equal(r.reclassifiedByExpansion, false);
});

test('the stage 4 threshold is at-or-above', () => {
  assert.equal(at(STAGE4_THRESHOLD, 60).expandedStage, 4);
  assert.equal(at(STAGE4_THRESHOLD - 1, 60).expandedStage, 2);
});

test('the original stage is always reported alongside the expanded one', () => {
  const r = at(12000, 60);
  assert.match(r.bandText, /stage 4 by the 2024 four-stage system; stage 2 by the original/);
  assert.equal(r.bandLabel, 'NAC stage 4 (original stage 2)');
});

// The overlapping published definition.
test('stage 2 is applied as the residual and the published overlap is disclosed', () => {
  const r = at(5000, 30);
  assert.equal(r.originalStage, 3, 'meeting both criteria is stage 3, not stage 2');
  assert.match(r.bandText, /defines stage 2 with an OR/);
  assert.match(r.bandText, /stage 3 taking precedence/);
});

// The two opposite stage-2 patients.
test('stage 2 names which of its two opposite patients it is', () => {
  const cardiac = at(5000, 60);
  assert.equal(cardiac.stage2Kind, 'cardiac-dominant');
  assert.match(cardiac.bandText, /CARDIAC-dominant/);
  const renal = at(1000, 30);
  assert.equal(renal.stage2Kind, 'renal-dominant');
  assert.match(renal.bandText, /RENAL-dominant/);
  assert.equal(cardiac.originalStage, renal.originalStage, 'same stage, opposite patients');
});

test('stages other than 2 carry no stage-2 kind', () => {
  assert.equal(at(1000, 60).stage2Kind, null);
  assert.equal(at(5000, 30).stage2Kind, null);
});

// Outcomes, including the deliberate absence of one.
test('one-year mortality is reported for every stage', () => {
  assert.equal(at(1000, 60).oneYearMortalityPercent, ONE_YEAR_MORTALITY[1]);
  assert.equal(at(5000, 30).oneYearMortalityPercent, ONE_YEAR_MORTALITY[3]);
  assert.equal(at(12000, 60).oneYearMortalityPercent, ONE_YEAR_MORTALITY[4]);
});

test('median survival is null for stages 1 and 2 because none was reached', () => {
  assert.equal(MEDIAN_SURVIVAL_MONTHS[1], null);
  assert.equal(MEDIAN_SURVIVAL_MONTHS[2], null);
  const r = at(1000, 60);
  assert.equal(r.medianSurvivalMonths, null);
  assert.match(r.bandText, /Quoting one here would be inventing it/);
  assert.equal(at(5000, 30).medianSurvivalMonths, 33.5);
  assert.equal(at(12000, 30).medianSurvivalMonths, 22.5);
});

// Sourcing holes.
test('the rounded cut-point and its modest sensitivity are stated', () => {
  const r = at(1000, 60);
  assert.match(r.bandText, new RegExp(String(YOUDEN_OPTIMAL)));
  assert.match(r.bandText, /a stage below 4 is not reassurance/);
});

test('the unstated eGFR equation is reported rather than assumed', () => {
  assert.match(at(1000, 60).bandText, /does NOT state which eGFR equation/);
  assert.match(at(1000, 60).bandText, /CKD-EPI and MDRD/);
});

// Input handling.
test('both biomarkers are required', () => {
  assert.equal(nacAttrStage({}).valid, false);
  assert.equal(nacAttrStage({ ntProBnp: '1000' }).valid, false);
  assert.match(nacAttrStage({ ntProBnp: 'x', egfr: '60' }).message, /must be a number/);
});

test('the scope note refuses to diagnose, to subtype, or to select therapy', () => {
  const r = at(1000, 60);
  assert.match(r.note, /does not diagnose amyloidosis/);
  assert.match(r.note, /light-chain amyloidosis/);
  assert.match(r.note, /does not select or withhold tafamidis/);
  assert.match(r.note, /requires TTR sequencing/);
});
