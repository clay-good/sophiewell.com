// spec-v52 §4.5.6 / §8.2: PA rule-source refresh helper unit tests (wave 52-6i).
//
// refresh-pa-rules.mjs makes outbound network requests when run directly, but
// its report-building core is a pure function of (ledger, outcomes, rules,
// now). These tests exercise that core with injected fetch outcomes -- no
// network, so they run in CI alongside every other unit test.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  OUTCOME,
  sha256,
  classifyFetchOutcome,
  dependentRuleCounts,
  buildRefreshReport,
  formatReportText,
} from '../../scripts/refresh-pa-rules.mjs';

test('sha256 is stable, prefixed, and content-sensitive', () => {
  assert.equal(sha256('abc'), sha256('abc'));
  assert.match(sha256('abc'), /^sha256:[0-9a-f]{64}$/);
  assert.notEqual(sha256('abc'), sha256('abd'));
});

test('classifyFetchOutcome: a 200 at the recorded URL resolves', () => {
  const c = classifyFetchOutcome({ ok: true, status: 200, redirected: false, bodyHash: 'sha256:deadbeef' });
  assert.equal(c.state, OUTCOME.RESOLVED);
  assert.equal(c.hash, 'sha256:deadbeef');
});

test('classifyFetchOutcome: a redirect is "moved" and recommends the new URL', () => {
  const c = classifyFetchOutcome({ ok: true, status: 200, redirected: true, finalUrl: 'https://x.test/new', bodyHash: 'sha256:abc' });
  assert.equal(c.state, OUTCOME.MOVED);
  assert.match(c.recommendation, /https:\/\/x\.test\/new/);
});

test('classifyFetchOutcome: 404 / 410 are "gone" with a re-point/disable hint', () => {
  for (const status of [404, 410]) {
    const c = classifyFetchOutcome({ ok: false, status });
    assert.equal(c.state, OUTCOME.GONE);
    assert.equal(c.hash, null);
    assert.match(c.recommendation, /§4\.5\.6/);
  }
});

test('classifyFetchOutcome: a network error or other status is "error", never silent', () => {
  assert.equal(classifyFetchOutcome({ error: 'timeout after 20000ms' }).state, OUTCOME.ERROR);
  assert.equal(classifyFetchOutcome({ ok: false, status: 503 }).state, OUTCOME.ERROR);
  // A missing outcome must not crash and must not read as resolved.
  assert.equal(classifyFetchOutcome(undefined).state, OUTCOME.ERROR);
});

test('dependentRuleCounts tallies every rule that claims a source', () => {
  const rules = [
    { id: 'R-PA-007', sources: ['ama-cpt', 'cms-hcpcs'] },
    { id: 'R-PA-008', sources: ['ama-cpt'] },
    { id: 'R-PA-001', sources: [] },
  ];
  const counts = dependentRuleCounts(rules);
  assert.equal(counts.get('ama-cpt'), 2);
  assert.equal(counts.get('cms-hcpcs'), 1);
  assert.equal(counts.get('nope'), undefined);
});

const LEDGER = {
  sources: [
    { id: 'a', label: 'Source A', url: 'https://a.test', ruleFamily: 'core', rules: ['R-PA-007'], lastVerified: '2026-05-01' },
    { id: 'b', label: 'Source B', url: 'https://b.test', ruleFamily: 'cms-ffs', rules: ['R-PA-CMS-001'], lastVerified: '2026-05-01' },
  ],
};
const RULES = [
  { id: 'R-PA-007', sources: ['a'] },
  { id: 'R-PA-008', sources: ['a'] },
  { id: 'R-PA-CMS-001', sources: ['b'] },
];

test('buildRefreshReport summarizes outcomes, ages, and dependent-rule counts', () => {
  const report = buildRefreshReport(
    LEDGER,
    { a: { ok: true, status: 200, bodyHash: 'sha256:aa' }, b: { ok: false, status: 404 } },
    RULES,
    '2026-05-28',
  );
  assert.equal(report.generatedAt, '2026-05-28');
  assert.deepEqual(report.summary, { resolved: 1, moved: 0, gone: 1, error: 0 });
  assert.equal(report.ok, false, 'a gone source makes the run not ok (exit 1)');

  const a = report.sources.find((s) => s.id === 'a');
  assert.equal(a.state, OUTCOME.RESOLVED);
  assert.equal(a.ageDays, 27);
  assert.equal(a.dependentRuleCount, 2, 'source a backs R-PA-007 and R-PA-008');
  assert.equal(a.hash, 'sha256:aa');

  const b = report.sources.find((s) => s.id === 'b');
  assert.equal(b.state, OUTCOME.GONE);
  assert.equal(b.dependentRuleCount, 1);
});

test('buildRefreshReport treats a source with no supplied outcome as an error, ok=true when all resolve', () => {
  const missing = buildRefreshReport(LEDGER, {}, RULES, '2026-05-28');
  assert.equal(missing.summary.error, 2);
  assert.equal(missing.ok, false);

  const allOk = buildRefreshReport(
    LEDGER,
    { a: { ok: true, status: 200 }, b: { ok: true, status: 200 } },
    RULES,
    '2026-05-28',
  );
  assert.equal(allOk.ok, true);
  assert.equal(allOk.summary.resolved, 2);
});

test('formatReportText is deterministic and surfaces state, age, and dependents', () => {
  const report = buildRefreshReport(
    LEDGER,
    { a: { ok: true, status: 200, bodyHash: 'sha256:aa' }, b: { ok: false, status: 404 } },
    RULES,
    '2026-05-28',
  );
  const text = formatReportText(report);
  assert.equal(text, formatReportText(report), 'pure: same input -> same text');
  assert.match(text, /RESOLVED\s+a/);
  assert.match(text, /GONE\s+b/);
  assert.match(text, /backs 2 rules/);
  assert.match(text, /backs 1 rule\b/);
});

test('the shipped ledger maps cleanly through the refresh report (every source, real dependents)', async () => {
  const { readFile } = await import('node:fs/promises');
  const { fileURLToPath } = await import('node:url');
  const { dirname, join } = await import('node:path');
  const { STARTER_RULES } = await import('../../lib/pa/rules.js');
  const here = dirname(fileURLToPath(import.meta.url));
  const ledger = JSON.parse(await readFile(join(here, '../../pa-staleness-ledger.json'), 'utf8'));
  // No outcomes supplied (offline): every source reports as error, but the
  // structural fields (ids, families, dependent-rule counts) must populate.
  const report = buildRefreshReport(ledger, {}, STARTER_RULES, '2026-05-29');
  assert.equal(report.sources.length, ledger.sources.length);
  const totalDeps = report.sources.reduce((n, s) => n + s.dependentRuleCount, 0);
  assert.ok(totalDeps >= STARTER_RULES.filter((r) => (r.sources || []).length).length,
    'every source-anchored rule is counted under at least one source');
  for (const s of report.sources) assert.ok(s.id && s.ruleFamily, 'each source carries id + family');
});
