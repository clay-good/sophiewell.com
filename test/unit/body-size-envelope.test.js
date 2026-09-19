// spec-v1404: a weight past lib/bounds.js's ceiling is refused, and an entered one is never asked
// for as if it were blank.
//
// probe-envelope-unbounded had no row for weight, so none of these was ever driven past it:
// CDAI read "clinical remission" from a 5,000 kg weight, the IWPC warfarin model gave 690 mg/day,
// and vasopressor, CRRT, and ECMO rates computed. Six more refused the value but asked for it as
// if nothing had been typed.
//
// Each tool's worked example is run through compute_calculator with the weight set to 5,000 kg.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { META } from '../../lib/meta.js';
import { computeCalculator } from '../../mcp/tools.js';

// tool id -> the dom id of its weight field
const WEIGHT = {
  'cdai-crohns': 'cd-wt', 'osteoporosis-prescreen': 'ost-weight', 'ktv-urr': 'kt-wt',
  'warfarin-iwpc': 'iw-wt', 'warfarin-gage': 'ga-wt', bmi: 'w', bsa: 'w', 'weight-dose': 'w',
  'bw-bsa-suite': 'bw-kg', 'maint-fluids': 'mf-w', 'urine-output': 'uo-wt', 'ebv-mabl': 'em-wt',
  'burn-uop-target': 'bu-wt', 'fluid-balance': 'fb-wt', gir: 'gir-wt', 'potassium-deficit': 'kd-wt',
  'crrt-dose': 'cr-w', 'ecmo-titration': 'ec-w', vasopressor: 'vp-w', 'elemental-iron-ingested': 'iron-wt',
  schofield: 'schof-wt', 'grobman-vbac': 'grobman-weight', 'max-allowable-blood-loss': 'abl-weight',
  'six-minute-walk-predicted': 'smwd-weight', 'osteoporosis-self-assessment-tool': 'ost-weight',
  'widmark-bac': 'wid-weight', nri: 'nri-current',
};

test('a 5,000 kg weight is refused, with a range and not a request to enter it', () => {
  const bad = [];
  for (const [id, dom] of Object.entries(WEIGHT)) {
    const ex = META[id].example.fields;
    if (!computeCalculator({ id, inputs: ex }).valid) { bad.push(`${id}: its worked example no longer computes`); continue; }
    const r = computeCalculator({ id, inputs: { ...ex, [dom]: '5000' } });
    if (r.valid) bad.push(`${id}: answered from a 5,000 kg weight`);
    else if (!/range|between|must be|no more than/i.test(String(r.message))) bad.push(`${id}: refused without naming a range (${String(r.message).slice(0, 70)})`);
  }
  assert.deepEqual(bad, []);
});

// spec-v1405: the same for height. The probe's map had no height row either; its envelope is in
// metres and these fields are in cm, so the probe now carries a unit scale.
const HEIGHT = {
  'predicted-spirometry': 'ps-height', bsa: 'h', 'body-roundness-index': 'bri-height',
  whtr: 'whtr-height', cmi: 'cmi-height', 'warfarin-iwpc': 'iw-ht', 'warfarin-gage': 'ga-ht',
};

test('a 2,500 cm height is refused, with a range and not a request to enter it', () => {
  const bad = [];
  for (const [id, dom] of Object.entries(HEIGHT)) {
    const ex = META[id].example.fields;
    if (ex[dom] === undefined) { bad.push(`${id}: ${dom} is not in the worked example`); continue; }
    if (!computeCalculator({ id, inputs: ex }).valid) { bad.push(`${id}: its worked example no longer computes`); continue; }
    const r = computeCalculator({ id, inputs: { ...ex, [dom]: '2500' } });
    if (r.valid) bad.push(`${id}: answered from a 2,500 cm height`);
    else if (!/range|between|must be|no more than/i.test(String(r.message))) bad.push(`${id}: refused without naming a range (${String(r.message).slice(0, 70)})`);
  }
  assert.deepEqual(bad, []);
});
