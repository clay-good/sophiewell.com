// spec-v98 2.1: Kawasaki disease diagnostic criteria (classic + the AHA
// incomplete-Kawasaki algorithm; McCrindle 2017).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { kawasakiCriteria } from '../../lib/peds-v98.js';

test('classic Kawasaki: fever >= 5 days plus >= 4 principal features', () => {
  const r = kawasakiCriteria({ feverDays: 6, principal: ['conjunctivitis', 'oral', 'lymphadenopathy', 'extremity'] });
  assert.equal(r.valid, true);
  assert.equal(r.pathway, 'classic');
  assert.equal(r.principalCount, 4);
  assert.match(r.band, /classic Kawasaki disease criteria/);
});

test('incomplete pathway: prolonged fever + 2-3 features, inflamed, >= 3 supplementary criteria supports KD', () => {
  const r = kawasakiCriteria({ feverDays: 7, principal: ['oral', 'rash'], crp: 5, esr: 50, supplementary: ['anemia', 'albumin', 'wbc'] });
  assert.equal(r.pathway, 'incomplete');
  assert.equal(r.supports, true);
  assert.match(r.band, /supports incomplete Kawasaki disease/);
});

test('incomplete pathway: inflammatory markers below the gate -> serial evaluation', () => {
  const r = kawasakiCriteria({ feverDays: 6, principal: ['oral', 'rash'], crp: 1, esr: 20 });
  assert.equal(r.pathway, 'incomplete');
  assert.equal(r.inflamed, false);
  assert.match(r.band, /threshold not met/);
});

test('incomplete pathway waits for CRP/ESR before a verdict', () => {
  const r = kawasakiCriteria({ feverDays: 6, principal: ['oral', 'rash'] });
  assert.equal(r.pathway, 'incomplete-pending');
  assert.match(r.band, /enter CRP/);
});

test('fewer than 2 features and short fever does not meet either pathway', () => {
  const r = kawasakiCriteria({ feverDays: 3, principal: ['rash'] });
  assert.equal(r.pathway, 'not-met');
  assert.ok(!/NaN/.test(r.band));
});

test('blank fever duration surfaces the complete-the-fields fallback', () => {
  const r = kawasakiCriteria({ principal: ['oral'] });
  assert.equal(r.valid, false);
  assert.ok(!/NaN/.test(r.band));
});
