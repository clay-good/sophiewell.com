// spec-v4 §7 step v4.4: ACA SEP window math, >=5 scenarios.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ACA_SEP_EVENTS, sepFor, sepEventIds } from '../../lib/aca-sep.js';

test('sepFor: loss-of-coverage allows 60 days before AND after', () => {
  const e = sepFor('loss-of-coverage');
  assert.equal(e.windowDays, 60);
  assert.equal(e.windowAlsoBefore, 60);
});

test('sepFor: marriage 60-day window post-event only', () => {
  const e = sepFor('marriage');
  assert.equal(e.windowDays, 60);
  assert.equal(e.windowAlsoBefore, 0);
  assert.match(e.documentation.join(' '), /Marriage certificate/);
});

test('sepFor: birth-adoption coverage retroactive to date of event', () => {
  const e = sepFor('birth-adoption');
  assert.match(e.coverageStarts, /retroactive/i);
});

test('sepFor: permanent-move requires 60 days of prior qualifying coverage', () => {
  const e = sepFor('permanent-move');
  assert.equal(e.windowAlsoBefore, 60);
  assert.match(e.documentation.join(' '), /qualifying coverage/);
});

test('sepFor: cobra-exhaustion explicitly notes voluntary drop is not eligible', () => {
  const e = sepFor('cobra-exhaustion');
  assert.match(e.note || '', /Voluntarily/);
});

test('sepFor: medicaid-chip-denial is a valid SEP', () => {
  const e = sepFor('medicaid-chip-denial');
  assert.equal(e.windowDays, 60);
});

test('sepFor: unknown event returns null', () => {
  assert.equal(sepFor('unknown-event'), null);
});

test('sepEventIds: includes all canonical events', () => {
  const ids = sepEventIds();
  for (const k of ['loss-of-coverage', 'marriage', 'birth-adoption', 'permanent-move',
    'medicaid-chip-denial', 'cobra-exhaustion', 'gain-citizenship', 'release-from-incarceration']) {
    assert.ok(ids.includes(k), `missing canonical event ${k}`);
  }
});

test('every event has a label, windowDays >=30, and at least one documentation entry', () => {
  for (const [id, e] of Object.entries(ACA_SEP_EVENTS)) {
    assert.ok(e.label, `${id} missing label`);
    assert.ok(e.windowDays >= 30, `${id} windowDays unrealistic`);
    assert.ok(Array.isArray(e.documentation) && e.documentation.length > 0, `${id} missing documentation`);
  }
});
