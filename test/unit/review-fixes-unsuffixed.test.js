// Regression tests for the defects an independent review found in the unversioned core libs and v1570-v1572
// (spec-v1682) on 2026-10-21, each with the input that showed it.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bmi, pfRatio, chadsVasc } from '../../lib/clinical.js';
import { interpretLab } from '../../lib/lab-interpret.js';
import { glenoidTrack } from '../../lib/glenoid-track-v1571.js';
import { thomazeauOccupation } from '../../lib/thomazeau-occupation-v1572.js';
import { normalizeIcd } from '../../lib/lcd-diagnosis-check.js';
import { insulinDripRate } from '../../lib/insulin-drip.js';
import { aorticStenosisStage } from '../../lib/aortic-stenosis-stage-v844.js';

test('lab narratives follow the published bands: A1C 5.7 is prediabetes, LDL 110 near-optimal, TG 1,200 very high', () => {
  assert.match(interpretLab('a1c', 5.7).narrative, /prediabetes/);
  assert.match(interpretLab('ldl', 110).narrative, /near-optimal/);
  assert.equal(interpretLab('ldl', 190).flag, 'flagged-significant');
  assert.equal(interpretLab('triglycerides', 1200).flag, 'flagged-significant');
  assert.match(interpretLab('glucose', 110).narrative, /impaired fasting glucose/);
  assert.throws(() => interpretLab('potassium', -3));
  assert.notEqual(interpretLab('hemoglobin', 11.5, { sex: 'male', pregnant: true }).flag, 'within-range');
});

test('BMI and P/F are categorized as computed and printed on that side', () => {
  assert.deepEqual(bmi({ weightKg: 68.04, heightM: 1.651 }), { bmi: 24.96, category: 'Normal' });
  assert.equal(pfRatio({ pao2: 57, fio2: 0.57 }).category, 'Severe ARDS (Berlin)');
  assert.equal(pfRatio({ pao2: 114, fio2: 0.57 }).category, 'Moderate ARDS (Berlin)');
  assert.equal(chadsVasc({ ageGte75: true, ageGte65: true }).total, 2);
});

test('glenoid track is labeled on the unrounded distance; Thomazeau prints its ratio on the judged side', () => {
  const g = glenoidTrack({ glenoidWidth: 29, defect: 0, hsWidth: 20, bridge: 4.1 });
  assert.equal(g.bandLabel, 'Off-track');
  assert.equal(g.dtd, -0.03);
  const t = thomazeauOccupation({ muscle: 7.79, fossa: 12.99 });
  assert.match(t.band, /^Occupation ratio 0\.5997 \(59\.97%\): Thomazeau grade II/);
  assert.equal(thomazeauOccupation({ muscle: 11.5, fossa: 10 }).valid, false);
});

test('U codes are ICD-10-CM; impossible glucose and stroke volume index are refused', () => {
  assert.equal(normalizeIcd('U07.1'), 'U07.1');
  assert.equal(insulinDripRate({ protocol: 'mod', bg: -40 }), null);
  assert.equal(aorticStenosisStage({ peakVelocity: 3.5, strokeVolumeIndex: -10 }).valid, false);
});
