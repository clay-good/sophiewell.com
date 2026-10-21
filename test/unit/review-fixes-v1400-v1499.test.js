// Regression tests for the defects two independent reviews found in the spec-v1400 to v1499 tools on 2026-10-20,
// each with the input that showed it.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { syphilisSerologySequence } from '../../lib/syphilis-serology-sequence-v1400.js';
import { hvpg } from '../../lib/hvpg-v1416.js';
import { blood4hWindow } from '../../lib/blood-4h-window-v1414.js';
import { strongyloidesPresumptive } from '../../lib/strongyloides-presumptive-v1401.js';
import { hypoglycemiaLevel } from '../../lib/hypoglycemia-level-v1446.js';
import { uterineActivity } from '../../lib/uterine-activity-v1439.js';
import { cpak } from '../../lib/cpak-v1447.js';
import { hbvSerology } from '../../lib/hbv-serology-v1400.js';
import { powersRatio } from '../../lib/powers-ratio-v1454.js';
import { mrecist } from '../../lib/mrecist-v1475.js';
import { cgmTimeInRange } from '../../lib/cgm-time-in-range-v1472.js';
import { glycemiaRiskIndex } from '../../lib/glycemia-risk-index-v1473.js';
import { deanFluorosisCfi } from '../../lib/dean-fluorosis-cfi-v1484.js';
import { periodontitisStageGrade } from '../../lib/periodontitis-stage-grade-v1480.js';
import { msuDiscHerniation } from '../../lib/msu-disc-herniation-v1468.js';

test('syphilis, traditional sequence: a nontreponemal test not done is asked for, not read as reactive', () => {
  assert.equal(syphilisSerologySequence({ algorithm: 'traditional', nontreponemal: 'not-done', treponemal: 'reactive' }).valid, false);
});

test('values are decided unrounded at their cut-offs and printed on that side', () => {
  assert.ok(hvpg({ whvp: 25.04, fhvp: 5, bleeding: 'yes' }).notes.some((n) => /20 mmHg/.test(n)));
  assert.match(hvpg({ whvp: 14.96, fhvp: 5 }).band, /^HVPG 9\.96 mmHg: sinusoidal/);
  assert.match(hypoglycemiaLevel({ needsAssistance: 'no', glucoseMgDl: 53.6 }).band, /glucose 53\.6 mg\/dL/);
  assert.match(uterineActivity({ w1: 3, w2: 3, w3: 3, mvuCount: 4, peak: 80.1, tone: 30 }).band, /200\.4 .*above the 200/);
  assert.match(cpak({ mpta: 87.04, ldfa: 85 }).band, /^CPAK type III/);
  assert.equal(powersRatio({ bc: 9.97, oa: 10, modality: 'radiograph' }).abnormal, false);
  assert.match(mrecist({ baseline: 601, current: 601, nadir: 501 }).band, /^Stable disease/);
  assert.match(mrecist({ baseline: 1001, current: 701, nadir: 701 }).band, /^Stable disease/);
  assert.match(cgmTimeInRange({ pop: 'standard', vlow: 0.5, low: 3.45, tir: 80, high: 16.05, vhigh: 0 }).band, /every target is met/);
  assert.match(glycemiaRiskIndex({ vlow: 0, low: 0, high: 25.05, vhigh: 0 }).band, /^GRI 20\.04 \(zone B\)/);
  const cfi = deanFluorosisCfi({ normal: 399, questionable: 0, veryMild: 601, mild: 0, moderate: 0, severe: 0 });
  assert.match(cfi.band, /0\.601 .*slight/);
  assert.ok(!cfi.notes.some((n) => /shared endpoint/.test(n)));
  assert.match(periodontitisStageGrade({ cal: 2, toothLoss: 0, boneLossPct: 24.9, age: 100 }).band, /bone loss \/ age 0\.249/);
  assert.ok(msuDiscHerniation({ dist: 20, extent: 10.08, zone: 'B' }).notes.some((n) => /50\.4%/.test(n)));
});

test('impossible or unasked: the end of the blood window, an unasked contraindication, contradictory HBV markers', () => {
  assert.match(blood4hWindow({ volumeMl: 300, elapsedMin: 239.8 }).band, /effectively over/);
  assert.match(strongyloidesPresumptive({ region: 'asia', overseas: 'no', pregnant: 'no', steroids: 'no', weightKg: 70 }).band, /hypersensitivity reaction to ivermectin \(not asked here\)/);
  assert.equal(hbvSerology({ hbsag: 'negative', antiHbc: 'negative', igmAntiHbc: 'positive', antiHbs: 'negative' }).valid, false);
  assert.ok(periodontitisStageGrade({ cal: 2.5, toothLoss: 0, direct: 'none' }).notes.some((n) => /between the printed bands/.test(n)));
});
