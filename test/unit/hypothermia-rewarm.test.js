import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hypothermiaRewarm } from '../../lib/scoring-v4.js';

test('HT I: 33.5 C, alert and shivering -> passive external rewarming', () => {
  const r = hypothermiaRewarm({ coreTempC: 33.5, state: 'alert-shivering' });
  assert.equal(r.stage, 'HT I');
  assert.match(r.pathway, /Passive external/);
});

test('HT II: 30 C, impaired consciousness -> active external + minimally invasive', () => {
  const r = hypothermiaRewarm({ coreTempC: 30, state: 'impaired' });
  assert.equal(r.stage, 'HT II');
  assert.match(r.pathway, /Active external/);
  assert.ok(r.banners.some((b) => /Avoid sudden movement/.test(b)));
});

test('HT III: 26 C, unconscious with pulse -> active internal, ECMO/CPB consideration', () => {
  const r = hypothermiaRewarm({ coreTempC: 26, state: 'unconscious' });
  assert.equal(r.stage, 'HT III');
  assert.match(r.pathway, /Active internal/);
  assert.match(r.pathway, /ECMO/);
});

test('HT IV: 22 C, cardiac arrest, no exclusion -> ECPR first-line', () => {
  const r = hypothermiaRewarm({ coreTempC: 22, state: 'arrest' });
  assert.equal(r.stage, 'HT IV');
  assert.match(r.pathway, /ECPR.*first-line/);
});

test('HT IV: K+ 14 mmol/L -> ECPR not indicated (ERC K+ > 12 cut-off)', () => {
  const r = hypothermiaRewarm({ coreTempC: 22, state: 'arrest', potassium: 14 });
  assert.equal(r.stage, 'HT IV');
  assert.match(r.pathway, /ECPR not indicated/);
  assert.match(r.pathway, /12 cut-off/);
});

test('HT IV: lethal-injury / chest-non-compressible flag -> ECPR not indicated', () => {
  const r = hypothermiaRewarm({ coreTempC: 22, state: 'arrest', ecprExclusion: true });
  assert.match(r.pathway, /ECPR not indicated/);
});

test('K+ 12 exactly (boundary) -> ECPR still indicated', () => {
  const r = hypothermiaRewarm({ coreTempC: 22, state: 'arrest', potassium: 12 });
  assert.match(r.pathway, /ECPR.*first-line/);
});

test('extreme cold (< 13.7 C) -> survival banner shown', () => {
  const r = hypothermiaRewarm({ coreTempC: 13.0, state: 'arrest' });
  assert.ok(r.banners.some((b) => /Lowest reported survival/.test(b)));
});

test('do-not-declare banner always present', () => {
  const r = hypothermiaRewarm({ coreTempC: 33.5, state: 'alert-shivering' });
  assert.ok(r.banners.some((b) => /Do not declare death/.test(b)));
});

test('rejects invalid temperature and state', () => {
  assert.throws(() => hypothermiaRewarm({ coreTempC: 50, state: 'alert-shivering' }));
  assert.throws(() => hypothermiaRewarm({ coreTempC: 30, state: 'unknown' }));
  assert.throws(() => hypothermiaRewarm({ coreTempC: 'cold', state: 'alert-shivering' }));
});
