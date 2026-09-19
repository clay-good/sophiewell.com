// spec-v1244: the final ten rows from the out-of-range-as-missing probe.
//
// Each calculator already rejects these values, but its local reader returned
// the same sentinel for a blank and an out-of-range number. The caller then
// asked for a value the reader had just entered. These checks pin the visible
// distinction without changing any bound or the existing blank-field branch.
import test from 'node:test';
import assert from 'node:assert/strict';

import { adhereHf } from '../../lib/risk-v192.js';
import { compartmentDeltaPressure } from '../../lib/ortho-v145.js';
import { scaiShock } from '../../lib/acs-v193.js';
import { mecki } from '../../lib/cvrisk-engines-v202.js';
import { efwClearance } from '../../lib/nephro-fluids-v204.js';
import { cartScore } from '../../lib/resus-trauma-v207.js';
import { lipi } from '../../lib/risk-scores-v215.js';
import { effectiveOsmolality } from '../../lib/effective-osmolality-v683.js';

const CHECK = /must be .* Check the value entered\.$/;

test('the remaining range refusals name the value instead of asking for it again', () => {
  assert.match(adhereHf({ bun: 50, sbp: 3_000, creatinine: 2 }).message, /^Systolic BP \(mmHg\) must be/);
  assert.match(adhereHf({ bun: 50, sbp: 100, creatinine: 250 }).message, /^Creatinine \(mg\/dL\) must be/);
  assert.match(compartmentDeltaPressure({ diastolic: 3_000, compartment: 20 }).message,
    /^Diastolic blood pressure \(mmHg\) must be/);
  assert.match(scaiShock({ sbp: 80, lactate: 400, support: 'one' }).message, /^Serum lactate \(mmol\/L\) must be/);
  assert.match(mecki({ hb: 250, sodium: 138, lvef: 35, ppvo2: 60, veco2: 32, egfr: 70 }).message,
    /^Hemoglobin \(g\/dL\) must be/);
  assert.match(mecki({ hb: 12, sodium: 1_380, lvef: 35, ppvo2: 60, veco2: 32, egfr: 70 }).message,
    /^Sodium \(mEq\/L\) must be/);
  assert.match(efwClearance({ urineNa: 80, urineK: 40, plasmaNa: 2_500, urineVolume: 1_000 }).message,
    /^Plasma sodium \(mEq\/L\) must be/);
  assert.match(cartScore({ rr: 18, hr: 90, dbp: 2_000, age: 60 }).message,
    /^Diastolic blood pressure \(mmHg\) must be/);
  assert.match(lipi({ anc: 4, wbc: -1, ldhHigh: false }).message, /^Total WBC must be/);
  assert.match(effectiveOsmolality({ sodium: 2_000, glucose: 90 }).message, /^Serum sodium \(mEq\/L\) must be/);
});

test('the same readers identify out-of-range sibling inputs', () => {
  assert.match(adhereHf({ bun: 4_000, sbp: 100, creatinine: 2 }).message, CHECK);
  assert.match(compartmentDeltaPressure({ diastolic: 70, compartment: 300 }).message, CHECK);
  assert.match(mecki({ hb: 12, sodium: 138, lvef: 350, ppvo2: 60, veco2: 32, egfr: 70 }).message, CHECK);
  assert.match(efwClearance({ urineNa: 800, urineK: 40, plasmaNa: 140, urineVolume: 1_000 }).message, CHECK);
  assert.match(cartScore({ rr: 180, hr: 90, dbp: 70, age: 60 }).message, CHECK);
  assert.match(lipi({ anc: -1, wbc: 9, ldhHigh: false }).message, CHECK);
});

test('blank fields still reach each calculator own refusal', () => {
  assert.match(adhereHf({ bun: 50 }).message, /^Enter the BUN/);
  assert.match(compartmentDeltaPressure({ diastolic: 70 }).message, /^Enter both/);
  assert.match(scaiShock({ sbp: 80, support: 'one' }).message, /^Enter the serum lactate/);
  assert.match(mecki({ hb: 12, sodium: 138 }).message, /^Enter hemoglobin/);
  assert.match(efwClearance({ urineNa: 80, urineK: 40, plasmaNa: 140 }).message, /^Enter urine sodium/);
  assert.match(cartScore({ rr: 18, hr: 90, dbp: 70 }).message, /^Enter respiratory rate/);
  assert.match(lipi({ anc: 4 }).message, /^Enter absolute neutrophil count/);
  assert.equal(effectiveOsmolality({ glucose: 90 }).code, 'MISSING_INPUT');
});

test('ADHERE ignores optional creatinine until its branch needs it', () => {
  assert.equal(adhereHf({ bun: 30, sbp: 130, creatinine: 250 }).valid, true);
  assert.match(adhereHf({ bun: 50, sbp: 100, creatinine: 250 }).message, /^Creatinine/);
});
