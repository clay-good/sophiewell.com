// spec-v114 2.2: BAP-65 class (Tabak 2009). Class from the count of three acute
// variables (BUN>=25, AMS, pulse>=109); age>65 splits I from II at zero acute
// variables only.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bap65 } from '../../lib/pulm-v114.js';

test('worked example: BUN + AMS + age>65 -> class IV (6.3% mortality)', () => {
  const r = bap65({ bun: true, ams: true, ageOver65: true });
  assert.equal(r.cls, 'IV');
  assert.equal(r.count, 2);
  assert.equal(r.mortality, '6.3%');
  assert.match(r.band, /class IV/);
});

test('age>65 promotion at zero acute variables: I -> II', () => {
  assert.equal(bap65({ ageOver65: false }).cls, 'I');
  assert.equal(bap65({ ageOver65: true }).cls, 'II');
  assert.equal(bap65({}).mortality, '0.3%');
  assert.equal(bap65({ ageOver65: true }).mortality, '0.9%');
});

test('once an acute variable is present, age no longer changes the class', () => {
  assert.equal(bap65({ bun: true, ageOver65: false }).cls, 'III');
  assert.equal(bap65({ bun: true, ageOver65: true }).cls, 'III');
});

test('class scales with the acute-variable count: 1 -> III, 2 -> IV, 3 -> V', () => {
  assert.equal(bap65({ bun: true }).cls, 'III');
  assert.equal(bap65({ bun: true, ams: true }).cls, 'IV');
  assert.equal(bap65({ bun: true, ams: true, pulse: true }).cls, 'V');
  assert.equal(bap65({ bun: true, ams: true, pulse: true }).mortality, '13.8%');
});

test('classes IV and V are flagged abnormal; I-III are not', () => {
  assert.equal(bap65({}).abnormal, false);
  assert.equal(bap65({ bun: true }).abnormal, false);
  assert.equal(bap65({ bun: true, ams: true }).abnormal, true);
  assert.equal(bap65({ bun: true, ams: true, pulse: true }).abnormal, true);
});
