// spec-v53 §6 acceptance: pin the confirmed Class-A and Class-B defect fixes.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fmt } from '../../lib/num.js';
import { boundsAdvisory } from '../../lib/bounds.js';
import * as V4 from '../../lib/clinical-v4.js';
import * as V5 from '../../lib/clinical-v5.js';
import { cfs, rass } from '../../lib/scoring-v4.js';

// ---- Class A (spec-v53 §2.1): non-finite/null must not leak to the DOM ----

test('Class A: shock index at SBP=0 returns null and renders a fallback, never "undefined"', () => {
  assert.equal(V4.shockIndex({ hr: 80, sbp: 0 }), null);
  const rendered = fmt(V4.shockIndex({ hr: 80, sbp: 0 }), { digits: 2, fallback: '(enter HR & SBP > 0)' });
  assert.equal(rendered, '(enter HR & SBP > 0)');
  assert.ok(!rendered.includes('undefined'));
});

test('Class A: modified shock index at MAP=0 returns null and renders a fallback', () => {
  assert.equal(V4.modifiedShockIndex({ hr: 80, sbp: 0, dbp: 0 }), null);
  assert.equal(fmt(V4.modifiedShockIndex({ hr: 80, sbp: 0, dbp: 0 }), { digits: 2, fallback: '(enter HR, SBP & DBP > 0)' }), '(enter HR, SBP & DBP > 0)');
});

test('Class A: cfs / rass no longer leak "undefined" / "NaN" into the band for garbage input', () => {
  for (const fn of [cfs, rass]) {
    const r = fn({ level: NaN });
    assert.equal(r.level, null);
    assert.ok(!/NaN|undefined|Infinity/.test(r.band), `band leaked a token: ${r.band}`);
  }
});

// ---- Class B (spec-v53 §2.2): impossible input -> visible advisory / no 0s ----

test('Class B: an impossible serum creatinine yields a visible advisory (Cockcroft-Gault / eGFR)', () => {
  const adv = boundsAdvisory('scr', 0.01);
  assert.ok(adv && adv.length > 0);
  assert.equal(boundsAdvisory('scr', 1.0), null);
});

test('Class B: an impossible height yields a visible advisory (BMI)', () => {
  assert.ok(boundsAdvisory('heightM', 0.05));
  assert.equal(boundsAdvisory('heightM', 1.75), null);
});

test('Class B: sub-Devine height returns null tidal-volume targets (not silent 0 mL) with a warning', () => {
  const r = V5.pbwArdsnet({ heightCm: 100, sex: 'F', mlPerKg: 6 });
  assert.equal(r.pbwKg, null);
  assert.equal(r.vtTargetMl, null);
  assert.equal(r.vtRangeMl.low, null);
  assert.ok(r.warning && r.warning.includes('152.4 cm'));
  // valid height is unchanged (byte-identical path)
  const ok = V5.pbwArdsnet({ heightCm: 175, sex: 'M', mlPerKg: 6 });
  assert.equal(ok.pbwKg, 70.5);
  assert.equal(ok.vtTargetMl, 423);
  assert.equal(ok.warning, null);
});
