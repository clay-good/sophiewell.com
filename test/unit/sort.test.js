// spec-v142 2.3: SORT (Protopapa 2014). Six-variable logistic 30-day mortality.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sort } from '../../lib/surg-v142.js';

test('ASA III, urgent, high-risk, Xmajor, cancer, 65-79 -> 14.67%', () => {
  const r = sort({ asa: 3, urgency: 'urgent', age: '65to79', highRisk: true, severity: true, cancer: true });
  assert.equal(r.valid, true);
  assert.equal(r.mortality, 14.67);
  assert.match(r.band, /30-day mortality 14\.67%/);
});

test('ASA I & II share the reference (no ASA-II coefficient)', () => {
  const base = { urgency: 'elective', age: 'under65' };
  assert.equal(sort({ ...base, asa: 1 }).mortality, sort({ ...base, asa: 2 }).mortality);
  // a healthy elective ASA I patient -> very low (logit -7.366 -> ~0.06%)
  const r = sort({ ...base, asa: 1 });
  assert.ok(r.mortality < 0.1, `mortality ${r.mortality}`);
});

test('age bands are mutually exclusive (>=80 is 1.591, not 0.777+1.591)', () => {
  const a80 = sort({ asa: 1, urgency: 'elective', age: '80plus' });
  // logit = -7.366 + 1.591 = -5.775 -> ~0.31%
  assert.ok(a80.mortality > 0.25 && a80.mortality < 0.4, `mortality ${a80.mortality}`);
});

test('missing required selects -> valid:false', () => {
  assert.equal(sort({}).valid, false);
  assert.equal(sort({ asa: 3 }).valid, false);
  assert.equal(sort({ asa: 3, urgency: 'urgent' }).valid, false);
});
