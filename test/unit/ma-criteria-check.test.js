// spec-v1603 tool 1: ma-criteria-check, against 42 CFR 422.101(b)(6), 422.566(d) and 422.112(b)(8).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { maCriteriaCheck as m } from '../../lib/ma-criteria-check.js';

const base = { benefit: 'basic', denial: 'medical-necessity', source: 'internal' };
const status = (r, rule) => r.rows.find((x) => x.rule.startsWith(rule))?.status;

test('the spec cases: stricter internal criteria where an LCD fully sets them is not met', () => {
  const r = m({ ...base, medicareCriteria: 'full', reviewer: 'expert' });
  assert.equal(r.verdict, 'not-met');
  assert.equal(status(r, '42 CFR 422.101(b)(6) and (c)(1)(i)(A)'), 'not-met');
});

test('the spec cases: unposted internal criteria are not met; a blank reviewer is unknown, never met', () => {
  const r = m({ ...base, medicareCriteria: 'none', posted: 'no', evidence: 'yes' });
  assert.equal(status(r, '42 CFR 422.101(b)(6)(ii)'), 'not-met');
  assert.equal(status(r, '42 CFR 422.566(d)'), 'unknown');
  const u = m({ ...base, medicareCriteria: 'none', posted: 'yes', evidence: 'yes' });
  assert.equal(u.verdict, 'unknown');
  assert.match(u.band, /not assessed/);
});

test('each allowed case for internal criteria cites its own paragraph', () => {
  for (const [v, p] of [['flex', '(b)(6)(i)(B)'], ['general', '(b)(6)(i)(A)'], ['none', '(b)(6)(i)(C)']]) {
    const r = m({ ...base, medicareCriteria: v, posted: 'yes', evidence: 'yes', reviewer: 'expert' });
    assert.equal(r.verdict, 'met', v);
    assert.equal(r.rows[0].rule, `42 CFR 422.101${p}`);
  }
});

test('a denial on Medicare criteria skips the public-criteria rule; a non-necessity denial skips the reviewer rule', () => {
  const r = m({ benefit: 'basic', denial: 'other', source: 'medicare' });
  assert.equal(r.verdict, 'met');
  assert.deepEqual(r.rows.map((x) => x.rule), ['42 CFR 422.101(b)']);
  assert.equal(m({ ...base, source: 'medicare', reviewer: 'not-expert' }).verdict, 'not-met');
});

test('the 90-day transition for a new enrollee in active treatment', () => {
  const ok = { ...base, source: 'medicare', reviewer: 'expert', course: 'new-enrollee' };
  assert.equal(m({ ...ok, days: '89' }).verdict, 'not-met');
  assert.equal(m({ ...ok, days: '90' }).verdict, 'met');
  assert.equal(m(ok).verdict, 'unknown');
  assert.equal(m({ ...ok, course: 'approved' }).verdict, 'unknown');
});

test('a supplemental benefit is outside these rules and never says met or not met', () => {
  const r = m({ ...base, benefit: 'supplemental', medicareCriteria: 'full' });
  assert.equal(r.verdict, 'does-not-apply');
});

test('it never says the service is medically necessary', () => {
  for (const r of [m({ ...base, medicareCriteria: 'full' }), m({ benefit: 'basic', denial: 'other', source: 'medicare' })]) {
    assert.doesNotMatch(r.band, /is medically necessary/);
  }
});

test('refusals', () => {
  assert.equal(m({}).valid, false);
  assert.equal(m({ ...base, benefit: 'x' }).valid, false);
  assert.equal(m({ ...base, reviewer: 'maybe' }).valid, false);
  assert.equal(m({ ...base, course: 'new-enrollee', days: '-1' }).valid, false);
  assert.equal(m({ ...base, course: 'new-enrollee', days: '1.5' }).valid, false);
});

test('an unanswered public-criteria question is named, one by one', () => {
  const row = (x) => m({ ...base, medicareCriteria: 'none', reviewer: 'expert', ...x }).rows.find((r) => r.rule === '42 CFR 422.101(b)(6)(ii)');
  assert.match(row({ evidence: 'yes' }).text, /^Whether the criteria are posted publicly was not assessed/);
  assert.match(row({ posted: 'yes' }).text, /^Whether a summary of their evidence/);
  assert.match(row({}).text, /posted publicly, and whether a summary/);
});
