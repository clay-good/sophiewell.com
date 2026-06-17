// spec-v99 2.2: Pitt Bacteremia Score (Paterson 2004 form). 0-14; >= 4 high risk.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pittBacteremia } from '../../lib/idcrit-v99.js';

test('severe temperature + hypotension -> 4 points, at the high-risk threshold', () => {
  const r = pittBacteremia({ temperature: 'severe', hypotension: true, mentalStatus: 'alert' });
  assert.equal(r.total, 4);
  assert.equal(r.highRisk, true);
});

test('all components maxed -> 14', () => {
  const r = pittBacteremia({ temperature: 'severe', hypotension: true, mechVent: true, cardiacArrest: true, mentalStatus: 'coma' });
  assert.equal(r.total, 14);
  assert.equal(r.highRisk, true);
});

test('alert, normothermic, no instability -> 0, below threshold', () => {
  const r = pittBacteremia({ temperature: 'normal', mentalStatus: 'alert' });
  assert.equal(r.total, 0);
  assert.equal(r.highRisk, false);
});

test('blank temperature surfaces the complete-the-fields fallback', () => {
  const r = pittBacteremia({ mentalStatus: 'alert' });
  assert.equal(r.valid, false);
  assert.ok(!/NaN/.test(r.band));
});
