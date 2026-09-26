// spec-v1502 tool 2: step therapy history builder.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { stepTherapyHistory as s } from '../../lib/step-therapy-v1502.js';

const now = new Date(Date.UTC(2026, 8, 26));
const steps = 'conventional DMARD, 2, 90\nTNF inhibitor, 1, 84';
const trials = 'methotrexate, conventional DMARD, 2025-01-10, 2025-06-30, inadequate response\nleflunomide, conventional DMARD, 2025-06-01, 2025-07-15, intolerance\nadalimumab, TNF inhibitor, 2025-08-01, ongoing, still taking';

test('an intolerance counts toward a step only when the plan accepts it', () => {
  assert.deepEqual(s({ steps, trials }, now).unmet, ['conventional DMARD']);
  assert.deepEqual(s({ steps, trials, acceptsIntolerance: 'yes' }, now).unmet, []);
});

test('overlapping trials are dated', () => {
  assert.match(s({ steps, trials }, now).notes.join(' '), /methotrexate and leflunomide overlap for 30 days/);
});

test('Medicare Advantage Part B lookback: a claim within 365 days means step therapy cannot apply', () => {
  const ma = { steps, trials, acceptsIntolerance: 'yes', planType: 'ma-part-b', requestDate: '2026-09-20' };
  assert.equal(s({ ...ma, lastClaim: '2026-02-01' }, now).bandLabel, 'Lookback: not a new start');
  assert.equal(s({ ...ma, lastClaim: '2025-09-19' }, now).bandLabel, 'All steps met');
});

test('the same drug twice counts once', () => {
  const t = 'methotrexate, conventional DMARD, 2025-01-01, 2025-04-30, inadequate response\nmethotrexate, conventional DMARD, 2025-06-01, 2025-09-30, inadequate response';
  assert.deepEqual(s({ steps: 'conventional DMARD, 2, 90', trials: t }, now).unmet, ['conventional DMARD']);
});

test('malformed or unknown entries ask', () => {
  assert.equal(s({}, now).valid, false);
  assert.match(s({ steps, trials: 'methotrexate, biologic, 2025-01-01, 2025-04-30, inadequate response' }, now).message, /not in the steps/);
  assert.match(s({ steps, trials: 'methotrexate, conventional DMARD, 2025-01-01, 2025-04-30, felt fine' }, now).message, /reason/);
});
