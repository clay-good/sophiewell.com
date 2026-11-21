// spec-v1760: a value below the floor lib/bounds.js declares used to answer; no
// finder had driven a floor. Per fixed field: half the floor is refused, and an
// in-range value still answers.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { adaDiabetesRisk, cambridgeDiabetes, vai, conicity } from '../../lib/metabolic-hepatic-v219.js';
import { findrisc, grobmanVbac, adhereHf } from '../../lib/risk-v192.js';
import { issRts, sipa } from '../../lib/scoring-v5.js';
import { rems, cartScore } from '../../lib/resus-trauma-v207.js';
import { actionIcu } from '../../lib/cardiology-risk-v214.js';
import { gorlin, lvotStrokeVolume } from '../../lib/gaps-v185.js';
import { sitsSich } from '../../lib/stroke-risk-v217.js';
import { cropIndex } from '../../lib/rheumcrit-v256.js';
import { lastLipid } from '../../lib/last-lipid-v896.js';
import { ocularPerfusionPressure } from '../../lib/ophtho-v164.js';
import { romeEcopd } from '../../lib/rome-ecopd-v804.js';
import { thakarAki } from '../../lib/thakar-aki-v568.js';

const FLOOR = /below the plausible range/;

// [name, fn, base input, field, half-floor value]
const CASES = [
  ['ada bmi', adaDiabetesRisk, { age: 50, bmi: 28 }, 'bmi', 2.5],
  ['cambridge bmi', cambridgeDiabetes, { age: 50, bmi: 28 }, 'bmi', 2.5],
  ['vai bmi', vai, { waist: 90, bmi: 28, triglycerides: 1.5, hdl: 1.2 }, 'bmi', 2.5],
  ['conicity weight', conicity, { waist: 90, weight: 80, height: 175 }, 'weight', 0.15],
  ['conicity height (cm)', conicity, { waist: 90, weight: 80, height: 175 }, 'height', 22.5],
  ['findrisc bmi', findrisc, { age: 50, bmi: 28, waist: 90, sex: 'male' }, 'bmi', 2.5],
  ['grobman weight', grobmanVbac, { age: 30, weight: 70, height: 165, vaginalHistory: 'none' }, 'weight', 0.15],
  ['grobman height (cm)', grobmanVbac, { age: 30, weight: 70, height: 165, vaginalHistory: 'none' }, 'height', 22.5],
  ['adhere bun', adhereHf, { bun: 30, sbp: 130, creatinine: 1 }, 'bun', 0.5],
  ['adhere sbp', adhereHf, { bun: 30, sbp: 130, creatinine: 1 }, 'sbp', 10],
  ['rems hr', rems, { age: 50, map: 80, hr: 80, rr: 16, spo2: 97, gcs: 15 }, 'hr', 5],
  ['cart hr', cartScore, { rr: 16, hr: 80, dbp: 70, age: 50 }, 'hr', 5],
  ['cart dbp', cartScore, { rr: 16, hr: 80, dbp: 70, age: 50 }, 'dbp', 2.5],
  ['action icu hr', actionIcu, { heartRate: 80, sbp: 130 }, 'heartRate', 5],
  ['action icu sbp', actionIcu, { heartRate: 80, sbp: 130 }, 'sbp', 10],
  ['gorlin hr', gorlin, { valve: 'aortic', co: 5, hr: 70, period: 0.3, grad: 40 }, 'hr', 5],
  ['lvot hr', lvotStrokeVolume, { d: 2, vti: 20, hr: 70, bsa: 1.9 }, 'hr', 5],
  ['sits sbp', sitsSich, { nihss: 8, glucose: 120, sbp: 150, weight: 80, age: 70 }, 'sbp', 10],
  ['sits weight', sitsSich, { nihss: 8, glucose: 120, sbp: 150, weight: 80, age: 70 }, 'weight', 0.15],
  ['crop rr', cropIndex, { compliance: 40, pimax: 30, pao2: 80, fio2: 0.4, paco2: 40, rr: 20 }, 'rr', 1.5],
  ['last lipid weight', lastLipid, { weightKg: 60 }, 'weightKg', 0.15],
  ['opp sbp', ocularPerfusionPressure, { sbp: 120, dbp: 70, iop: 15 }, 'sbp', 10],
  ['opp dbp', ocularPerfusionPressure, { sbp: 120, dbp: 70, iop: 15 }, 'dbp', 2.5],
  ['rome rr', romeEcopd, { dyspneaVas: 6, respiratoryRate: 26, heartRate: 100, crp: 20, spo2: 90 }, 'respiratoryRate', 1.5],
  ['rome hr', romeEcopd, { dyspneaVas: 6, respiratoryRate: 26, heartRate: 100, crp: 20, spo2: 90 }, 'heartRate', 5],
];

for (const [name, fn, base, field, half] of CASES) {
  test(`${name}: half the floor is refused, an in-range value answers`, () => {
    const ok = fn(base);
    assert.equal(ok.valid, true, `${name} in range: ${ok.message}`);
    const bad = fn({ ...base, [field]: half });
    assert.equal(bad.valid, false);
    assert.match(bad.message, FLOOR);
  });
}

const THAKAR = {
  female: 'no', congestiveHeartFailure: 'no', lvefUnder35: 'no', preoperativeIabp: 'no', copd: 'no',
  insulinDiabetes: 'no', previousCardiacSurgery: 'no', emergencySurgery: 'no', surgeryType: 'cabg',
};

test('thakar creatinine: half the floor is refused, an in-range value answers', () => {
  const ok = thakarAki({ ...THAKAR, creatinine: 1.0 });
  assert.equal(ok.valid, true, ok.message);
  const bad = thakarAki({ ...THAKAR, creatinine: 0.05 });
  assert.equal(bad.valid, false);
  assert.match(bad.message, FLOOR);
});

test('iss-rts: SBP and RR below the envelope floors are RTS bands and still score', () => {
  const base = { ais1: 3, ais2: 2, ais3: 1, gcs: 14, sbp: 120, rr: 18 };
  assert.equal(issRts(base).rts, 7.84);
  // The RTS codes a systolic of 1-49 and a rate of 1-5 as 1: values under the envelope floors are its own bands.
  assert.equal(typeof issRts({ ...base, sbp: 10, rr: 1.5 }).rts, 'number');
  assert.equal(typeof issRts({ ...base, sbp: 0, rr: 0 }).rts, 'number');
});

test('sipa: an HR or SBP under the floor throws; an in-range pair answers', () => {
  assert.equal(typeof sipa({ ageYears: 5, hr: 120, sbp: 100 }).shockIndex, 'number');
  assert.throws(() => sipa({ ageYears: 5, hr: 5, sbp: 100 }), FLOOR);
  assert.throws(() => sipa({ ageYears: 5, hr: 120, sbp: 10 }), FLOOR);
});
