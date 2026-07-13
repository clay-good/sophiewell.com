// spec-v59 §3.3 / §3.4: PA-toolchain stress + regex-timing regression guard.
//
// These are pure Node compute paths (extractAll -> buildBundle -> runEngine ->
// redactText / buildJsonReport) with no browser involved, so the harness lives
// under test/unit (same deviation rationale as the fuzz harness: it must run in
// `npm run test`, which is node:test, not Playwright). The pa-no-network.spec
// covers the browser drop-and-download path; this file pins that the
// deterministic core completes in a bounded wall-clock budget on hostile input
// and that no widened redaction / extractor pattern can catastrophically
// backtrack (a future rule adding a backtracking regex would blow this budget).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildBundle, runEngine } from '../../lib/pa/engine.js';
import { buildJsonReport, buildRedactedJsonReport } from '../../lib/pa/report.js';
import { extractAll, extractDates, extractServiceDates, extractPosCodes } from '../../lib/pa/extract.js';
import { redactText } from '../../lib/pa/redact.js';

// Pin "today" so the clock-relative rules (R-PA-005 retro window, R-PA-006
// future ceiling) see the hardcoded fixture service dates as recent forever.
// Same seed date as scripts/audit-pa.mjs; todayUtc() reads the pin lazily.
process.env.SOPHIEWELL_NOW = '2026-05-29';

// A generous ceiling: the real pipeline finishes a 1 MB packet in well under
// this. The point is to catch an O(n^2)/backtracking regression, not to
// benchmark; CI machines are slow and shared, so the budget is deliberately
// loose while still being thousands of times tighter than a hang.
const BUDGET_MS = 4000;

function within(label, fn) {
  const start = process.hrtime.bigint();
  const out = fn();
  const ms = Number(process.hrtime.bigint() - start) / 1e6;
  assert.ok(ms < BUDGET_MS, `${label} took ${ms.toFixed(0)}ms (budget ${BUDGET_MS}ms)`);
  return out;
}

// ~1 MB of a repeated date / address / phone line -- the multi-MB and
// date-extreme cases the spec calls out.
const DATE_BOMB = ('Date of service: 04/12/2026  POS 11  ' + '01/02/2026 '.repeat(8) + '\n').repeat(20000);
const ADDR_BOMB = ('patient lives at 123 Main St, Springfield, IL 62704 call +44 20 7946 0958\n').repeat(15000);
// Binary / non-UTF8 garbage: a long run of the Unicode replacement char.
const BINARY = '�'.repeat(500000);

test('extractors are capped and finish under budget on a multi-MB date bomb', () => {
  within('extractDates', () => assert.ok(extractDates(DATE_BOMB).length <= 200));
  within('extractServiceDates', () => assert.ok(extractServiceDates(DATE_BOMB).length <= 200));
  within('extractPosCodes', () => assert.ok(extractPosCodes(DATE_BOMB).length <= 200));
});

test('redactText (widened patterns) finishes under budget on a 1 MB address bomb', () => {
  const out = within('redactText', () => redactText(ADDR_BOMB));
  assert.equal(/123 Main St/.test(out), false);
  assert.equal(/7946 0958/.test(out), false);
});

test('the full engine + report builders finish under budget on hostile input', () => {
  within('buildBundle+runEngine+reports', () => {
    const bundle = buildBundle([{ name: 'bomb.txt', sha256: 'sha-bomb', kind: 'TXT', text: DATE_BOMB }], { totalBytes: DATE_BOMB.length });
    const findings = runEngine(bundle);
    buildJsonReport(bundle, findings, {});
    buildRedactedJsonReport(bundle, findings, {});
    return findings;
  });
});

test('empty and binary inputs are handled without throwing or hanging', () => {
  within('empty', () => {
    const b = buildBundle([{ name: 'e.txt', sha256: 's', kind: 'TXT', text: '' }], { totalBytes: 0 });
    runEngine(b);
  });
  within('binary', () => {
    const ex = extractAll(BINARY);
    // The replacement-char ratio is surfaced so the view can pre-gate (U-3).
    assert.ok(ex.replacementChars >= 500000);
    const b = buildBundle([{ name: 'b.txt', sha256: 's', kind: 'TXT', text: BINARY }], { totalBytes: BINARY.length });
    runEngine(b);
  });
});
