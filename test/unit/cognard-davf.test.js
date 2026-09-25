// spec-v1450: Cognard classification of dural AV fistulas (Cognard 1995; two open reviews).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cognardDavf as c } from '../../lib/cognard-davf-v1450.js';

test('sinus drainage splits by the two refluxes', () => {
  assert.equal(c({ drainage: 'sinus', sinusReflux: 'no', corticalReflux: 'no' }).type, 'I');
  assert.equal(c({ drainage: 'sinus', sinusReflux: 'yes', corticalReflux: 'no' }).type, 'IIa');
  assert.equal(c({ drainage: 'sinus', sinusReflux: 'no', corticalReflux: 'yes' }).type, 'IIb');
  assert.equal(c({ drainage: 'sinus', sinusReflux: 'yes', corticalReflux: 'yes' }).type, 'IIa+b');
});

test('direct cortical drainage splits by ectasia; spinal is V', () => {
  assert.equal(c({ drainage: 'cortical', ectasia: 'no' }).type, 'III');
  assert.equal(c({ drainage: 'cortical', ectasia: 'yes' }).type, 'IV');
  assert.equal(c({ drainage: 'spinal' }).type, 'V');
});

test('cortical venous drainage separates the benign and aggressive groups', () => {
  assert.equal(c({ drainage: 'sinus', sinusReflux: 'yes', corticalReflux: 'no' }).corticalVenousDrainage, false);
  assert.equal(c({ drainage: 'sinus', sinusReflux: 'no', corticalReflux: 'yes' }).corticalVenousDrainage, true);
  assert.match(c({ drainage: 'cortical', ectasia: 'no' }).band, /8% annual hemorrhage/);
});

test('the questions for the chosen drainage are asked for', () => {
  assert.match(c({ drainage: 'sinus', sinusReflux: 'yes' }).message, /reflux into cortical veins/);
  assert.match(c({ drainage: 'cortical' }).message, /venous ectasia/);
  assert.equal(c({}).valid, false);
});
