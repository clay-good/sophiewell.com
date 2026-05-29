#!/usr/bin/env node
// spec-v52 §4.5.6 / §8.2: PA rule-source refresh helper (maintainer-only).
//
// The monthly verification pass (docs/pa-maintenance.md) asks the maintainer
// to open each `pa-staleness-ledger.json` source URL, confirm it still
// resolves and still says what its rules assume, and then bump `lastVerified`
// (or re-point `url`, or acknowledge / disable affected rules per §4.5.6).
// This script automates the mechanical half of that pass: it fetches every
// ledger source URL, reports the HTTP outcome and a content SHA-256, computes
// each source's staleness age, counts how many shipped rules depend on it
// (via the per-rule `sources` metadata, wave 52-6h), and prints a
// per-source recommendation. The human judgement -- "does the page still say
// what the rule assumes?" -- stays with the maintainer; the script does not
// auto-bump `lastVerified`.
//
// THIS SCRIPT MAKES OUTBOUND NETWORK REQUESTS. It is therefore NOT wired into
// `npm run lint` / `npm run test` and never runs in CI's offline build or in
// the browser (the no-network commitment, spec-v50 §3.1, is about Sophie's
// runtime; this is a maintainer laptop tool). The pure report-building core
// below is network-free and unit-tested in test/unit/pa-refresh.test.js with
// injected outcomes.
//
// Run:  node scripts/refresh-pa-rules.mjs            # human-readable report
//       node scripts/refresh-pa-rules.mjs --json     # machine-readable JSON
//       SOPHIEWELL_NOW=YYYY-MM-DD node scripts/refresh-pa-rules.mjs   # pin age
// Exit: 0 when every source resolves; 1 when any source is gone (404/410) or
//       errored, so a maintainer can wire it into an alert.

import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseDate, diffDays, todayUtc } from '../lib/pa/date.js';
import { STARTER_RULES } from '../lib/pa/rules.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const LEDGER_PATH = join(ROOT, 'pa-staleness-ledger.json');
const FETCH_TIMEOUT_MS = 20000;

// Outcome states, worst-first so callers can rank a run.
export const OUTCOME = {
  GONE: 'gone', //       404 / 410: the source no longer exists
  ERROR: 'error', //     network failure, timeout, or other non-OK status
  MOVED: 'moved', //     resolved but the final URL differs (redirect)
  RESOLVED: 'resolved', //200 at the recorded URL
};

// sha256 of a string or Buffer/Uint8Array, as "sha256:<hex>". Pure.
export function sha256(input) {
  return 'sha256:' + createHash('sha256').update(input).digest('hex');
}

// classifyFetchOutcome(outcome) -> { state, hash, note, recommendation }.
// `outcome` is a plain object so this is testable without a real fetch:
//   { error?: string }                               -- request threw / timed out
//   { ok, status, redirected, finalUrl, bodyHash }   -- a completed response
// `bodyHash` is the already-computed "sha256:..." of the response body (the
// caller hashes the bytes; keeping bytes out of this function keeps it pure
// and cheap to test). Pure: no I/O, no clock.
export function classifyFetchOutcome(outcome) {
  const o = outcome || {};
  if (o.error) {
    return { state: OUTCOME.ERROR, hash: null, note: String(o.error), recommendation: 'Retry; check connectivity. Do not change the ledger on a transient failure.' };
  }
  const status = Number(o.status) || 0;
  if (status === 404 || status === 410) {
    return { state: OUTCOME.GONE, hash: null, note: `HTTP ${status}`, recommendation: 'Re-point url to the current page, or acknowledge / disable the affected rules per spec-v52 §4.5.6.' };
  }
  if (!o.ok || status < 200 || status >= 300) {
    return { state: OUTCOME.ERROR, hash: null, note: `HTTP ${status || 'unknown'}`, recommendation: 'Investigate; may be transient (rate limit, WAF, auth wall). Do not change the ledger yet.' };
  }
  if (o.redirected && o.finalUrl) {
    return { state: OUTCOME.MOVED, hash: o.bodyHash || null, note: `redirected to ${o.finalUrl}`, recommendation: `Confirm the content, then update url to ${o.finalUrl} and bump lastVerified.` };
  }
  return { state: OUTCOME.RESOLVED, hash: o.bodyHash || null, note: 'HTTP 200', recommendation: 'Confirm the page still supports its rules, then bump lastVerified.' };
}

// Count how many shipped rules depend on each ledger source, using the
// per-rule `sources` metadata (wave 52-6h). Returns a Map sourceId -> count.
// Pure.
export function dependentRuleCounts(rules) {
  const counts = new Map();
  for (const rule of rules || []) {
    for (const source of (rule && rule.sources) || []) {
      counts.set(source, (counts.get(source) || 0) + 1);
    }
  }
  return counts;
}

// buildRefreshReport(ledger, outcomesById, rules, now) -> {
//   generatedAt, sources: [{ id, label, url, ruleFamily, anchorRules,
//   dependentRuleCount, lastVerified, ageDays, state, hash, note,
//   recommendation }], summary: { resolved, moved, gone, error }, ok }
// `outcomesById` maps a source id to the object classifyFetchOutcome accepts.
// Pure: no I/O; the only clock is the optional `now` (defaults to today UTC),
// mirroring lib/pa/staleness.js.
export function buildRefreshReport(ledger, outcomesById, rules, now) {
  const nowUtc = now == null ? todayUtc() : (parseDate(now) || todayUtc(now));
  const depCounts = dependentRuleCounts(rules);
  const summary = { resolved: 0, moved: 0, gone: 0, error: 0 };
  const sources = ((ledger && ledger.sources) || []).map((s) => {
    const id = s && s.id ? String(s.id) : '';
    const verifiedUtc = parseDate(s ? s.lastVerified : null);
    const ageDays = verifiedUtc ? diffDays(nowUtc, verifiedUtc) : null;
    const outcome = (outcomesById instanceof Map ? outcomesById.get(id) : (outcomesById || {})[id]) || { error: 'no outcome supplied' };
    const c = classifyFetchOutcome(outcome);
    if (summary[c.state] != null) summary[c.state] += 1;
    return {
      id,
      label: s && s.label ? String(s.label) : id,
      url: s && s.url ? String(s.url) : '',
      ruleFamily: s && s.ruleFamily ? String(s.ruleFamily) : '',
      anchorRules: (s && s.rules) || [],
      dependentRuleCount: depCounts.get(id) || 0,
      lastVerified: (s && s.lastVerified) || null,
      ageDays,
      state: c.state,
      hash: c.hash,
      note: c.note,
      recommendation: c.recommendation,
    };
  });
  return {
    generatedAt: nowUtc.toISOString().slice(0, 10),
    sources,
    summary,
    ok: summary.gone === 0 && summary.error === 0,
  };
}

// formatReportText(report) -> string. Pure, deterministic.
export function formatReportText(report) {
  const lines = [];
  lines.push(`refresh-pa-rules: ${report.sources.length} source(s) evaluated ${report.generatedAt}`);
  lines.push(`  ${report.summary.resolved} resolved, ${report.summary.moved} moved, ${report.summary.gone} gone, ${report.summary.error} error`);
  lines.push('');
  for (const s of report.sources) {
    const tag = s.state.toUpperCase().padEnd(8);
    const age = s.ageDays == null ? 'age ?' : `${s.ageDays}d since verify`;
    lines.push(`${tag} ${s.id}  (${age}, backs ${s.dependentRuleCount} rule${s.dependentRuleCount === 1 ? '' : 's'})`);
    lines.push(`         ${s.label}`);
    lines.push(`         <${s.url}>  ${s.note}`);
    if (s.hash) lines.push(`         ${s.hash}`);
    lines.push(`         -> ${s.recommendation}`);
    lines.push('');
  }
  return lines.join('\n');
}

// --- network layer (only runs on direct invocation) ------------------------

async function fetchOutcome(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal, redirect: 'follow', headers: { 'user-agent': 'sophiewell-refresh-pa-rules/1.0 (+https://sophiewell.com)' } });
    const buf = Buffer.from(await res.arrayBuffer());
    return { ok: res.ok, status: res.status, redirected: res.redirected, finalUrl: res.url, bodyHash: sha256(buf) };
  } catch (err) {
    return { error: err && err.name === 'AbortError' ? `timeout after ${FETCH_TIMEOUT_MS}ms` : (err && err.message ? err.message : String(err)) };
  } finally {
    clearTimeout(timer);
  }
}

async function main() {
  const asJson = process.argv.includes('--json');
  const now = process.env.SOPHIEWELL_NOW || null;
  let ledger;
  try {
    ledger = JSON.parse(await readFile(LEDGER_PATH, 'utf8'));
  } catch (err) {
    console.error('refresh-pa-rules: cannot read pa-staleness-ledger.json:', err && err.message ? err.message : err);
    process.exit(2);
  }

  const outcomesById = {};
  for (const s of ledger.sources || []) {
    if (!s || !s.id || !s.url) continue;
    if (!asJson) process.stderr.write(`fetching ${s.id} ...\n`);
    outcomesById[s.id] = await fetchOutcome(s.url);
  }

  const report = buildRefreshReport(ledger, outcomesById, STARTER_RULES, now);
  if (asJson) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(formatReportText(report));
  }
  process.exit(report.ok ? 0 : 1);
}

// Only run when invoked directly, so the pure helpers above can be imported
// by the unit test without making any network request.
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch((err) => {
    console.error('refresh-pa-rules: error', err);
    process.exit(2);
  });
}
