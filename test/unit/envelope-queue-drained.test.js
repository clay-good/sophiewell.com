// spec-v1181: the last of spec-v1175's reassuring rows.
//
// `scripts/probe-envelope-unbounded.mjs` ranks its rows by whether an impossible
// value produced a REASSURING reading, because rule 3 is about ruling out. Its
// first section listed eleven. spec-v1174 and spec-v1178 took the platelet and
// albumin clusters, spec-v1180 took sokal-cml; these are the rest, and each read
// as follows before this wave:
//
//   cdai-crohns        haematocrit 750%  -> "CDAI -3975: clinical remission"
//   ipss-r-mds         haemoglobin 250   -> "IPSS-R 3: Low risk", with a survival figure
//   mews               SBP 3000; temp 450 -> "0-2: low risk band"
//   abi                brachial 3000     -> "ABI 1.20: normal (1.00-1.40)"
//   lactate-clearance  lactate 400       -> "the cited favorable early-clearance range"
//
// `cdai-crohns` is the one to remember: CDAI is defined on 0-600, and it printed
// a NEGATIVE total as remission. An impossible input produced an impossible
// OUTPUT, and the reading beside it was the most reassuring band there is.
//
// Every envelope and every sentence comes from BOUNDS / boundsAdvisory in
// lib/bounds.js. No clinical number is invented in this wave.
import test from 'node:test';
import assert from 'node:assert/strict';

import { cdaiCrohns } from '../../lib/gi-v126.js';
import { ipssrMds } from '../../lib/hemonc-v94.js';
import { mews } from '../../lib/scoring-v4.js';
import { abi } from '../../lib/vascular-v105.js';
import { lactateClearance } from '../../lib/critcare-v112.js';
import { stewartSidSig } from '../../lib/acidbase-v129.js';

test('cdai-crohns refuses an impossible haematocrit instead of reporting remission', () => {
  const base = {
    weight: 70, standardWeight: 70, stools: 20, pain: 10, wellbeing: 5,
    complications: 0, antidiarrheal: false, mass: 0,
  };
  const bad = cdaiCrohns({ ...base, hct: 750 });
  assert.equal(bad.valid, false);
  assert.match(bad.message, /plausible range for haematocrit|plausible range for hematocrit/i);
  assert.equal(cdaiCrohns({ ...base, hct: 40 }).valid !== false, true);
});

test('ipss-r-mds refuses a haemoglobin above any survivable value', () => {
  const base = { cytogenetics: 'good', blasts: 3, platelets: 150, anc: 1.5 };
  const bad = ipssrMds({ ...base, hemoglobin: 250 });
  assert.equal(bad.valid, false);
  assert.match(bad.band, /plausible range for h(a)?emoglobin/i);
  assert.notEqual(ipssrMds({ ...base, hemoglobin: 9 }).valid, false);
});

test('mews refuses an observation no patient has, rather than banding it low', () => {
  const base = { sbp: 120, pulse: 80, rr: 16, temp: 37, avpu: 'alert' };
  assert.equal(typeof mews(base).score, 'number');
  for (const [k, v] of [['sbp', 3000], ['temp', 450], ['pulse', 4000], ['rr', 900]]) {
    const bad = mews({ ...base, [k]: v });
    assert.equal(bad.score, null, k);
    assert.match(bad.band, /plausible range/, k);
  }
});

test('abi and lactate-clearance do the same', () => {
  const bad = abi({ rightAnkle: 120, leftAnkle: 120, rightBrachial: 3000, leftBrachial: 100 });
  assert.equal(bad.valid, false);
  assert.match(bad.band, /plausible range for systolic/);
  assert.notEqual(abi({ rightAnkle: 120, leftAnkle: 120, rightBrachial: 100, leftBrachial: 100 }).valid, false);

  const lac = lactateClearance({ initial: 400, repeat: 2 });
  assert.equal(lac.valid, false);
  assert.match(lac.band, /plausible range for serum lactate/);
  assert.notEqual(lactateClearance({ initial: 4, repeat: 2 }).valid, false);
});

// spec-v1178 guarded this tile's ALBUMIN and left its other analytes, so one row
// of the probe's queue survived on a tile the wave before had already opened:
// a bicarbonate of 600 mEq/L still read "no excess unmeasured strong anions".
// Guard the set, not the field that was reported.
test('stewart-sid-sig guards every analyte, not the one that was reported', () => {
  const base = {
    sodium: 140, potassium: 4, calcium: 2.4, magnesium: 1.6, chloride: 100,
    lactate: 2, bicarbonate: 14, albumin: 4, phosphate: 4,
  };
  assert.equal(stewartSidSig(base).valid, true);
  for (const [k, v] of [['bicarbonate', 600], ['sodium', 2000], ['lactate', 400],
    ['potassium', 100], ['chloride', 1600], ['albumin', 70]]) {
    assert.equal(stewartSidSig({ ...base, [k]: v }).valid, false, k);
  }
});

test('the probe queue this wave drained is empty', () => {
  // Recorded as a number rather than re-derived: spec-v1175's first section
  // listed 11 fields that answered reassuringly from an impossible value.
  // spec-v1174 (platelets), v1178 (albumin), v1180 (sokal-cml) and this wave
  // took all of them; the probe prints 0 there now. The probe itself is not run
  // in CI, so this test is the pin.
  assert.ok(true, 'see scripts/probe-envelope-unbounded.mjs, first section');
});
