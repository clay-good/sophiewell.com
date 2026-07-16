// spec-v329: Paris endoscopic classification of superficial neoplastic lesions. Worked-
// example tests: the protruded (0-Ip/0-Is), non-protruding (0-IIa/0-IIb/0-IIc), and
// excavated (0-III) types, the higher-risk flag on the depressed/excavated types, input
// normalization (optional "0-" prefix, case-insensitive), and the invalid-type guard.
// Types transcribed from the Paris classification (GIE 2003 / Endoscopy 2005) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parisClassification } from '../../lib/paris-classification-v329.js';

test('0-IIc: slightly depressed, higher-risk (the META example)', () => {
  const r = parisClassification({ type: '0-IIc' });
  assert.equal(r.valid, true);
  assert.equal(r.type, '0-IIc');
  assert.equal(r.highRisk, true);
  assert.match(r.band, /slightly depressed/);
  assert.match(r.band, /higher risk of submucosal invasion/);
});

test('0-Ip and 0-Is are protruded, not higher-risk', () => {
  assert.match(parisClassification({ type: '0-Ip' }).band, /pedunculated/);
  assert.match(parisClassification({ type: '0-Is' }).band, /sessile/);
  assert.equal(parisClassification({ type: '0-Ip' }).highRisk, false);
  assert.equal(parisClassification({ type: '0-Is' }).highRisk, false);
});

test('0-IIa/0-IIb are non-protruding and not higher-risk; 0-III is excavated and higher-risk', () => {
  assert.equal(parisClassification({ type: '0-IIa' }).highRisk, false);
  assert.equal(parisClassification({ type: '0-IIb' }).highRisk, false);
  const iii = parisClassification({ type: '0-III' });
  assert.equal(iii.highRisk, true);
  assert.match(iii.band, /excavated/);
});

test('input is normalized: the leading "0-" is optional and case-insensitive', () => {
  assert.equal(parisClassification({ type: 'iic' }).type, '0-IIc');
  assert.equal(parisClassification({ type: 'III' }).type, '0-III');
  assert.equal(parisClassification({ type: '0-iia' }).type, '0-IIa');
});

test('a missing or unknown type is invalid', () => {
  assert.equal(parisClassification({}).valid, false);
  assert.equal(parisClassification({ type: '0-IV' }).valid, false);
  assert.equal(parisClassification({ type: 'X' }).valid, false);
});
