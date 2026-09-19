// spec-v1398: heat, smoke, air, and Valley fever.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { aqiPm25, pm25ToAqi, aqiToPm25 } from '../../lib/aqi-pm25-v1398.js';
import { caloshaOutdoorHeat as oh } from '../../lib/calosha-outdoor-heat-v1398.js';
import { caloshaIndoorHeat as ih } from '../../lib/calosha-indoor-heat-v1398.js';
import { caloshaWildfireSmoke as ws } from '../../lib/calosha-wildfire-smoke-v1398.js';
import { caValleyFeverTestPrompt as vf } from '../../lib/ca-valley-fever-test-prompt-v1398.js';

test('aqi: the 2024 breakpoints -- 9.0 Good, 9.1 Moderate, 35.4 is 100, 35.5 is 101', () => {
  assert.deepEqual([9.0, 9.1, 35.4, 35.5].map((c) => pm25ToAqi(c).aqi), [50, 51, 100, 101]);
  assert.equal(pm25ToAqi(10).category, 'Moderate');
  assert.equal(pm25ToAqi(9.09).aqi, 50);
});

test('aqi: every AQI from 0 to 500 survives the round trip', () => {
  for (let a = 0; a <= 500; a += 1) assert.equal(pm25ToAqi(aqiToPm25(a)).aqi, a);
  assert.equal(aqiPm25({ aqi: '151' }).category, 'Unhealthy');
  assert.equal(aqiPm25({}).valid, false);
  assert.equal(aqiPm25({ aqi: '50', conc: '9' }).valid, false);
});

test('outdoor heat: 82F after five days averaging 70F is a heat wave; averaging 78F is not', () => {
  const hw = oh({ tempF: '82', industry: 'construction', priorHighs: '70,70,70,70,70' });
  assert.match(hw.requirements.join(' '), /Heat wave/);
  const no = oh({ tempF: '82', industry: 'construction', priorHighs: '78,78,78,78,78' });
  assert.doesNotMatch(no.requirements.join(' '), /Heat wave/);
  assert.match(no.heatWaveNote, /Not a heat wave/);
});

test('outdoor heat: high-heat at 95F only in listed industries; the cool-down is agriculture only', () => {
  assert.equal(oh({ tempF: '95', industry: 'other' }).bandLabel, 'Shade required');
  assert.doesNotMatch(oh({ tempF: '96', industry: 'construction' }).requirements.join(' '), /ten-minute/);
  assert.match(oh({ tempF: '96', industry: 'agriculture' }).requirements.join(' '), /ten-minute net preventative cool-down/);
  assert.equal(oh({ tempF: '80', industry: 'agriculture' }).bandLabel, 'Water and planning only');
});

test('indoor heat: 82F threshold, 15-minute exemption, 87F or clothing triggers controls', () => {
  assert.equal(ih({ tempF: '81', clothing: 'no', radiant: 'no' }).applies, false);
  assert.equal(ih({ tempF: '85', clothing: 'no', radiant: 'no', minutesPerHour: '10' }).applies, false);
  assert.equal(ih({ tempF: '85', clothing: 'no', radiant: 'no', minutesPerHour: '10', vehicleOrContainer: 'yes' }).applies, true);
  assert.equal(ih({ tempF: '85', clothing: 'no', radiant: 'no' }).controls, false);
  assert.equal(ih({ tempF: '85', clothing: 'yes', radiant: 'no' }).controls, true);
  assert.equal(ih({ tempF: '85', heatIndexF: '88', clothing: 'no', radiant: 'no' }).controls, true);
});

test('smoke: 150 none, 151 voluntary N95, 501 required; 45 minutes at 300 is exempt', () => {
  assert.equal(ws({ aqi: '150', hours: '8' }).level, 'none');
  assert.equal(ws({ aqi: '151', hours: '8' }).level, 'voluntary');
  assert.equal(ws({ aqi: '501', hours: '8' }).level, 'required');
  assert.equal(ws({ aqi: '300', hours: '0.75' }).level, 'exempt');
  assert.equal(ws({ aqi: '300' }).valid, false);
});

test('valley fever: any advisory prompt says test; blanks are incomplete', () => {
  assert.equal(vf({ respiratory: 'yes', noResponse: 'yes' }).consider, true);
  assert.equal(vf({ respiratory: 'yes', endemic: 'no' }).consider, null);
  assert.equal(vf({ respiratory: 'yes', endemic: 'no', dust: 'no', week: 'no', noResponse: 'no' }).consider, false);
  assert.match(vf({ respiratory: 'yes', endemic: 'yes', severe: 'yes' }).tests.join(' '), /PCR and culture/);
});
