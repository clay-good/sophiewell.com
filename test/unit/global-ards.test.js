// spec-v570: the New Global Definition of ARDS.
//
// The load-bearing tests are that severity exists only in the intubated branch, that the resource-limited
// branch is a terminal dead end, and that the saturation ratio is a hard gate above 97 percent.

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  globalArds, ARDS_SETTINGS, RATIO_TYPES, COMMON_CRITERIA,
  SPO2_VALIDITY_CEILING, MIN_PEEP, MIN_HFNO_FLOW,
} from '../../lib/global-ards-v570.js';

const met = () => Object.fromEntries(COMMON_CRITERIA.map((c) => [c.key, 'yes']));
const intubated = (ratioValue, over = {}) => globalArds({
  setting: 'intubated', ...met(), peepAtLeast5: 'yes', ratioType: 'pf',
  ratioValue: String(ratioValue), ...over,
});
const nonintubated = (ratioValue, over = {}) => globalArds({
  setting: 'nonintubated', ...met(), nonintubatedSupport: 'yes', ratioType: 'pf',
  ratioValue: String(ratioValue), ...over,
});

test('there are three categories and only the intubated one is graded', () => {
  assert.deepEqual(ARDS_SETTINGS.map((s) => s.value), ['nonintubated', 'intubated', 'resource-limited']);
  assert.equal(ARDS_SETTINGS.find((s) => s.value === 'intubated').graded, true);
  assert.equal(ARDS_SETTINGS.find((s) => s.value === 'nonintubated').graded, false);
  assert.equal(ARDS_SETTINGS.find((s) => s.value === 'resource-limited').graded, false);
});

// THE grading rule.
test('intubated ARDS is graded on the published thresholds', () => {
  assert.equal(intubated(90).severity, 'Severe');
  assert.equal(intubated(100).severity, 'Severe');
  assert.equal(intubated(101).severity, 'Moderate');
  assert.equal(intubated(200).severity, 'Moderate');
  assert.equal(intubated(201).severity, 'Mild');
  assert.equal(intubated(300).severity, 'Mild');
});

test('the saturation-ratio severity thresholds are the published ones', () => {
  const sf = (v) => intubated(v, { ratioType: 'sf', spo2: '94' });
  assert.equal(sf(148).severity, 'Severe');
  assert.equal(sf(149).severity, 'Moderate');
  assert.equal(sf(235).severity, 'Moderate');
  assert.equal(sf(236).severity, 'Mild');
  assert.equal(sf(315).severity, 'Mild');
});

test('nonintubated ARDS meets the definition but gets NO severity', () => {
  const r = nonintubated(120);
  assert.equal(r.meetsDefinition, true);
  assert.equal(r.severity, null);
  assert.match(r.bandText, /NO severity grading/);
});

test('no nonintubated ratio produces a severity, however low', () => {
  for (const v of [50, 100, 150, 250, 300]) {
    assert.equal(nonintubated(v).severity, null, `ratio ${v}`);
  }
});

// The resource-limited dead end.
test('the resource-limited branch is ungraded and accepts only the saturation ratio', () => {
  const r = globalArds({
    setting: 'resource-limited', ...met(), ratioType: 'sf', ratioValue: '200', spo2: '92',
  });
  assert.equal(r.meetsDefinition, true);
  assert.equal(r.severity, null);
  assert.match(r.bandText, /different denominator, not a milder rung/);

  const withPf = globalArds({
    setting: 'resource-limited', ...met(), ratioType: 'pf', ratioValue: '200',
  });
  assert.equal(withPf.valid, false);
  assert.match(withPf.message, /SpO2:FiO2 ratio only/);
});

test('the resource-limited branch needs no PEEP or flow answer', () => {
  const r = globalArds({
    setting: 'resource-limited', ...met(), ratioType: 'sf', ratioValue: '200', spo2: '92',
  });
  assert.equal(r.valid, true);
  assert.equal(r.meetsDefinition, true);
});

// THE saturation gate.
test('the saturation ratio is refused above 97 percent rather than computed', () => {
  const r = intubated(200, { ratioType: 'sf', ratioValue: '200', spo2: '99' });
  assert.equal(r.valid, true);
  assert.equal(r.applicable, false);
  assert.equal(r.meetsDefinition, null);
  assert.equal(r.severity, null);
  assert.match(r.bandText, /not valid when the oxygen saturation is above 97 percent/);
});

test('the saturation ratio is accepted at exactly 97 percent', () => {
  const r = intubated(200, { ratioType: 'sf', ratioValue: '200', spo2: String(SPO2_VALIDITY_CEILING) });
  assert.equal(r.applicable, true);
  assert.equal(r.severity, 'Moderate');
});

test('the saturation ratio requires an SpO2 to be supplied at all', () => {
  const r = globalArds({ setting: 'intubated', ...met(), peepAtLeast5: 'yes', ratioType: 'sf', ratioValue: '200' });
  assert.equal(r.valid, false);
  assert.match(r.message, /not valid when the oxygen saturation is above/);
});

// Support floors.
test('an intubated patient without the minimum PEEP does not meet the definition', () => {
  const r = intubated(150, { peepAtLeast5: 'no' });
  assert.equal(r.meetsDefinition, false);
  assert.equal(r.severity, null);
  assert.match(r.bandText, new RegExp(`minimum PEEP of ${MIN_PEEP} cm H2O is required`));
});

test('a nonintubated patient without qualifying support does not meet the definition', () => {
  const r = nonintubated(150, { nonintubatedSupport: 'no' });
  assert.equal(r.meetsDefinition, false);
  assert.match(r.bandText, new RegExp(`${MIN_HFNO_FLOW} L/min`));
});

// The common criteria.
test('failing any common criterion fails the definition', () => {
  for (const c of COMMON_CRITERIA) {
    const r = intubated(150, { [c.key]: 'no' });
    assert.equal(r.meetsDefinition, false, c.key);
  }
});

test('a ratio above the ceiling fails the definition', () => {
  const r = intubated(320);
  assert.equal(r.meetsDefinition, false);
  assert.match(r.bandText, /above the ceiling of 300/);
});

// Corrections.
test('the FiO2 estimate and altitude correction are stated', () => {
  const r = intubated(150);
  assert.match(r.bandText, /0\.03 times the oxygen flow rate/);
  assert.match(r.bandText, /barometric pressure divided by 760/);
});

// Input handling.
test('the setting is required and names the grading asymmetry', () => {
  const r = globalArds({});
  assert.equal(r.valid, false);
  assert.match(r.message, /Severity grading exists only for the intubated category/);
});

test('missing common criteria are refused and named', () => {
  const r = globalArds({ setting: 'intubated', ratioType: 'pf', ratioValue: '150' });
  assert.equal(r.valid, false);
  assert.match(r.message, /riskFactor/);
});

test('the ratio types are the published two', () => {
  assert.deepEqual(RATIO_TYPES.map((r) => r.value), ['pf', 'sf']);
});

test('the scope note refuses to identify the cause or indicate an intervention', () => {
  const r = intubated(150);
  assert.match(r.note, /does not identify the cause/);
  assert.match(r.note, /does not indicate intubation, prone positioning/);
  assert.match(r.note, /not exclude cardiogenic pulmonary edema/);
});
