// spec-v52 §8.3: PA dataset-staleness evaluator unit tests (wave 52-6c).
//
// The evaluator is a pure function of (ledger, now); these tests pin `now`
// to fixed dates so the staleness boundaries are deterministic.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { evaluateStaleness, STATE, findLedgerRuleOrphans, findRuleSourceOrphans, findLedgerCoverageGaps, disabledSourceMap } from '../../lib/pa/staleness.js';

function ledgerWith(sources, extra) {
  return {
    policy: { warnAfterDays: 90, failAfterDays: 365 },
    sources,
    acknowledgments: [],
    ...(extra || {}),
  };
}

const SRC = (id, lastVerified) => ({ id, label: id, url: 'https://example.test/' + id, lastVerified });

test('a freshly-verified source is fresh and ok', () => {
  const r = evaluateStaleness(ledgerWith([SRC('a', '2026-05-01')]), '2026-05-28');
  assert.equal(r.entries[0].state, STATE.FRESH);
  assert.equal(r.entries[0].ageDays, 27);
  assert.equal(r.ok, true);
  assert.equal(r.worst, STATE.FRESH);
});

test('a source past the warn window warns but stays ok', () => {
  // 100 days old: > 90 (warn), < 365 (fail).
  const r = evaluateStaleness(ledgerWith([SRC('a', '2026-01-01')]), '2026-04-11');
  assert.equal(r.entries[0].ageDays, 100);
  assert.equal(r.entries[0].state, STATE.WARN);
  assert.equal(r.ok, true, 'warnings do not break the build by default');
  assert.equal(r.summary.warn, 1);
});

test('a source past the fail window fails (not ok)', () => {
  // 400 days old: > 365.
  const r = evaluateStaleness(ledgerWith([SRC('a', '2025-01-01')]), '2026-02-05');
  assert.equal(r.entries[0].ageDays, 400);
  assert.equal(r.entries[0].state, STATE.FAIL);
  assert.equal(r.ok, false);
  assert.equal(r.worst, STATE.FAIL);
});

test('boundary: exactly warnAfterDays is still fresh; one day past warns', () => {
  const at90 = evaluateStaleness(ledgerWith([SRC('a', '2026-01-01')]), '2026-04-01');
  assert.equal(at90.entries[0].ageDays, 90);
  assert.equal(at90.entries[0].state, STATE.FRESH);
  const at91 = evaluateStaleness(ledgerWith([SRC('a', '2026-01-01')]), '2026-04-02');
  assert.equal(at91.entries[0].ageDays, 91);
  assert.equal(at91.entries[0].state, STATE.WARN);
});

test('a current acknowledgment downgrades a fail to acknowledged', () => {
  const ledger = ledgerWith(
    [SRC('a', '2025-01-01')],
    { acknowledgments: [{ id: 'a', ackDate: '2026-02-01', reason: 'source under CMS review' }] },
  );
  const r = evaluateStaleness(ledger, '2026-02-05');
  assert.equal(r.entries[0].state, STATE.ACKNOWLEDGED);
  assert.equal(r.ok, true, 'an acknowledged stale source does not break the build');
});

test('a stale acknowledgment does not mask a stale source forever', () => {
  // Source 400 days stale; ack itself is also 400 days old (> failAfterDays).
  const ledger = ledgerWith(
    [SRC('a', '2025-01-01')],
    { acknowledgments: [{ id: 'a', ackDate: '2025-01-01', reason: 'old ack' }] },
  );
  const r = evaluateStaleness(ledger, '2026-02-05');
  assert.equal(r.entries[0].state, STATE.FAIL);
  assert.equal(r.ok, false);
});

test('an unparseable lastVerified is invalid and not ok', () => {
  const r = evaluateStaleness(ledgerWith([SRC('a', 'never')]), '2026-05-28');
  assert.equal(r.entries[0].state, STATE.INVALID);
  assert.equal(r.entries[0].ageDays, null);
  assert.equal(r.ok, false);
});

test('summary tallies and worst reflect a mixed ledger', () => {
  const r = evaluateStaleness(ledgerWith([
    SRC('fresh', '2026-05-20'),
    SRC('warn', '2026-01-01'),
    SRC('fail', '2024-01-01'),
  ]), '2026-05-28');
  assert.deepEqual(r.summary, { fresh: 1, warn: 1, fail: 1, acknowledged: 0, invalid: 0 });
  assert.equal(r.worst, STATE.FAIL);
  assert.equal(r.ok, false);
});

// spec-v52 §4.5.6 / §8.3 (wave 52-6e): ledger -> ruleset coverage. -----------

test('findLedgerRuleOrphans returns an empty array when every reference ships', () => {
  const ledger = ledgerWith([{ ...SRC('a', '2026-05-01'), rules: ['R-PA-001', 'R-PA-002'] }]);
  assert.deepEqual(findLedgerRuleOrphans(ledger, ['R-PA-001', 'R-PA-002', 'R-PA-003']), []);
  // a Set is accepted as well as an array
  assert.deepEqual(findLedgerRuleOrphans(ledger, new Set(['R-PA-001', 'R-PA-002'])), []);
});

test('findLedgerRuleOrphans reports each dead reference with its source, in order', () => {
  const ledger = ledgerWith([
    { ...SRC('a', '2026-05-01'), rules: ['R-PA-001', 'R-PA-GONE'] },
    { ...SRC('b', '2026-05-01'), rules: ['R-PA-ALSO-GONE'] },
  ]);
  assert.deepEqual(findLedgerRuleOrphans(ledger, ['R-PA-001']), [
    { sourceId: 'a', ruleId: 'R-PA-GONE' },
    { sourceId: 'b', ruleId: 'R-PA-ALSO-GONE' },
  ]);
});

test('findLedgerRuleOrphans tolerates a source with no rules array', () => {
  const ledger = ledgerWith([SRC('a', '2026-05-01')]);
  assert.deepEqual(findLedgerRuleOrphans(ledger, ['R-PA-001']), []);
});

test('the shipped ledger references only rule ids that ship in lib/pa/rules.js', async () => {
  const { readFile } = await import('node:fs/promises');
  const { fileURLToPath } = await import('node:url');
  const { dirname, join } = await import('node:path');
  const { STARTER_RULES } = await import('../../lib/pa/rules.js');
  const here = dirname(fileURLToPath(import.meta.url));
  const ledger = JSON.parse(await readFile(join(here, '../../pa-staleness-ledger.json'), 'utf8'));
  const orphans = findLedgerRuleOrphans(ledger, new Set(STARTER_RULES.map((r) => r.id)));
  assert.deepEqual(orphans, [], 'every ledger rule reference must name a shipped rule');
});

// spec-v63 OA4: the ledger now also tracks the non-PA ops rule families (the
// dated regulatory constants behind the v63 ops calculators). They carry an
// empty `rules` array (they anchor no pa-lint rule) but must still be
// staleness-evaluated, and must not introduce any rule orphan.
test('OA4: the ledger tracks the spec-v63 ops rule families without orphans', async () => {
  const { readFile } = await import('node:fs/promises');
  const { fileURLToPath } = await import('node:url');
  const { dirname, join } = await import('node:path');
  const { STARTER_RULES } = await import('../../lib/pa/rules.js');
  const here = dirname(fileURLToPath(import.meta.url));
  const ledger = JSON.parse(await readFile(join(here, '../../pa-staleness-ledger.json'), 'utf8'));

  const ops = ledger.sources.filter((s) => s.ruleFamily === 'ops-v63');
  // One source per dated constant family named in spec-v63 §5 (OA4).
  assert.ok(ops.length >= 7, `expected >=7 ops-v63 ledger sources, found ${ops.length}`);
  for (const s of ops) {
    assert.deepEqual(s.rules, [], `${s.id}: an ops source anchors no pa-lint rule (empty rules array)`);
    assert.match(s.lastVerified, /^\d{4}-\d{2}-\d{2}$/, `${s.id}: needs an ISO lastVerified date`);
    assert.ok(s.url && s.label, `${s.id}: needs a url and label`);
  }
  // The ops additions introduce no rule orphan (empty rules arrays are inert).
  const orphans = findLedgerRuleOrphans(ledger, new Set(STARTER_RULES.map((r) => r.id)));
  assert.deepEqual(orphans, []);

  // Each ops family is staleness-evaluated like any other source.
  const ev = evaluateStaleness(ledger, '2026-06-10');
  const evIds = new Set(ev.entries.map((e) => e.id));
  for (const s of ops) assert.ok(evIds.has(s.id), `${s.id}: must be staleness-evaluated`);
});

// spec-v52 §4.5.6 (wave 52-6h): per-rule source metadata coverage. ----------

test('findRuleSourceOrphans returns empty when every rule source is a known ledger id', () => {
  const rules = [
    { id: 'R-PA-001', sources: [] },
    { id: 'R-PA-007', sources: ['ama-cpt', 'cms-hcpcs'] },
  ];
  assert.deepEqual(findRuleSourceOrphans(rules, ['ama-cpt', 'cms-hcpcs', 'cms-pos']), []);
  assert.deepEqual(findRuleSourceOrphans(rules, new Set(['ama-cpt', 'cms-hcpcs'])), []);
});

test('findRuleSourceOrphans reports each unknown source with its rule, in order', () => {
  const rules = [
    { id: 'R-PA-007', sources: ['ama-cpt', 'gone-source'] },
    { id: 'R-PA-013', sources: ['also-gone'] },
  ];
  assert.deepEqual(findRuleSourceOrphans(rules, ['ama-cpt']), [
    { ruleId: 'R-PA-007', source: 'gone-source' },
    { ruleId: 'R-PA-013', source: 'also-gone' },
  ]);
});

test('findLedgerCoverageGaps returns empty when every ledger anchor is reflected in rule.sources', () => {
  const ledger = ledgerWith([{ ...SRC('ama-cpt', '2026-05-01'), rules: ['R-PA-007', 'R-PA-008'] }]);
  const rules = [
    { id: 'R-PA-007', sources: ['ama-cpt', 'cms-hcpcs'] },
    { id: 'R-PA-008', sources: ['ama-cpt'] },
  ];
  assert.deepEqual(findLedgerCoverageGaps(ledger, new Map(rules.map((r) => [r.id, r]))), []);
  // a plain id -> sources object is accepted too
  assert.deepEqual(findLedgerCoverageGaps(ledger, { 'R-PA-007': ['ama-cpt'], 'R-PA-008': ['ama-cpt'] }), []);
});

test('findLedgerCoverageGaps reports an anchor the per-rule map fails to honor', () => {
  const ledger = ledgerWith([{ ...SRC('cms-ncci', '2026-05-01'), rules: ['R-PA-012', 'R-PA-054'] }]);
  // R-PA-054 has drifted: it no longer claims cms-ncci.
  const rules = new Map([
    ['R-PA-012', { id: 'R-PA-012', sources: ['cms-ncci'] }],
    ['R-PA-054', { id: 'R-PA-054', sources: [] }],
  ]);
  assert.deepEqual(findLedgerCoverageGaps(ledger, rules), [
    { sourceId: 'cms-ncci', ruleId: 'R-PA-054' },
  ]);
});

test('the shipped ruleset and ledger agree in both coverage directions', async () => {
  const { readFile } = await import('node:fs/promises');
  const { fileURLToPath } = await import('node:url');
  const { dirname, join } = await import('node:path');
  const { STARTER_RULES } = await import('../../lib/pa/rules.js');
  const here = dirname(fileURLToPath(import.meta.url));
  const ledger = JSON.parse(await readFile(join(here, '../../pa-staleness-ledger.json'), 'utf8'));
  const ledgerIds = new Set((ledger.sources || []).map((s) => s.id));
  // Every shipped rule carries a sources array, and every id it names is real.
  for (const r of STARTER_RULES) assert.ok(Array.isArray(r.sources), `${r.id} must carry a sources array`);
  assert.deepEqual(findRuleSourceOrphans(STARTER_RULES, ledgerIds), [], 'no rule may claim an unknown source');
  // Every ledger anchor is reflected in the per-rule sources.
  assert.deepEqual(
    findLedgerCoverageGaps(ledger, new Map(STARTER_RULES.map((r) => [r.id, r]))),
    [],
    'every ledger anchor must be reflected in the rule it anchors',
  );
});

test('the shipped ledger is fresh as of its verification date', async () => {
  const { readFile } = await import('node:fs/promises');
  const { fileURLToPath } = await import('node:url');
  const { dirname, join } = await import('node:path');
  const here = dirname(fileURLToPath(import.meta.url));
  const ledger = JSON.parse(await readFile(join(here, '../../pa-staleness-ledger.json'), 'utf8'));
  // Evaluate the day after the newest lastVerified: every source should be fresh.
  const r = evaluateStaleness(ledger, '2026-05-29');
  assert.equal(r.ok, true, 'shipped ledger must be green at ship time');
  assert.equal(r.summary.fail, 0);
  assert.equal(r.summary.invalid, 0);
  assert.ok(r.entries.length >= 10, 'ledger should enumerate the PA-rule source families');
});

// spec-v52 §4.5.6 (wave 52-6j): stale-source disabling. ----------------------

test('disabledSourceMap normalizes both the object and bare-true disabled forms', () => {
  const ledger = ledgerWith([
    { ...SRC('a', '2026-05-01'), disabled: { since: '2026-06-01', reason: '404 on home page' } },
    { ...SRC('b', '2026-05-01'), disabled: true },
    SRC('c', '2026-05-01'), // not disabled
  ]);
  const map = disabledSourceMap(ledger);
  assert.equal(map.size, 2);
  assert.deepEqual(map.get('a'), { since: '2026-06-01', reason: '404 on home page' });
  assert.equal(map.get('b').since, null);
  assert.match(map.get('b').reason, /marked unavailable/);
  assert.equal(map.has('c'), false);
});

test('the shipped ledger disables no source', async () => {
  const { readFile } = await import('node:fs/promises');
  const { fileURLToPath } = await import('node:url');
  const { dirname, join } = await import('node:path');
  const here = dirname(fileURLToPath(import.meta.url));
  const ledger = JSON.parse(await readFile(join(here, '../../pa-staleness-ledger.json'), 'utf8'));
  assert.equal(disabledSourceMap(ledger).size, 0, 'no PA source ships disabled');
});
