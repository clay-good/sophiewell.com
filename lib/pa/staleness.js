// spec-v52 §8.3 / §4.5.6: deterministic PA dataset-staleness evaluator.
//
// The PA ruleset is anchored to external sources (CMS NCD/LCD, AMA CPT,
// ICD-10-CM, ACR Appropriateness Criteria, DSM-5-TR, etc.). §8.3 calls
// for a staleness ledger that records, per source, the date the
// maintainer last verified it, and a CI check that fails (or warns,
// depending on the configured grace window) when a source has gone
// unverified beyond that window. This forces the maintainer to either
// re-verify or explicitly acknowledge staleness.
//
// The spec named the ledger `dkb-staleness-ack.yml` (Vaulytica's file).
// Sophie ships zero runtime dependencies (spec-v10 §6), so introducing a
// YAML parser for one config file is the wrong trade. The ledger is JSON
// (`pa-staleness-ledger.json`) and this module is the pure, testable
// evaluator over it; `scripts/check-pa-staleness.mjs` is the CLI wrapper.
//
// Determinism (§4.10): `evaluateStaleness(ledger, now)` is a pure
// function of its inputs. All date math goes through `lib/pa/date.js`
// (UTC-midnight), so two machines evaluating the same ledger at the same
// `now` produce identical output. The only `new Date()` lives in the CLI
// wrapper's default `now`, which is overridable for tests.

import { parseDate, diffDays, todayUtc } from './date.js';

export const DEFAULT_WARN_AFTER_DAYS = 90;
export const DEFAULT_FAIL_AFTER_DAYS = 365;

// state values, worst-first so callers can rank.
export const STATE = {
  FAIL: 'fail',
  WARN: 'warn',
  ACKNOWLEDGED: 'acknowledged',
  FRESH: 'fresh',
  INVALID: 'invalid',
};

function policyOf(ledger) {
  const p = (ledger && ledger.policy) || {};
  const warnAfterDays = Number.isFinite(p.warnAfterDays) ? p.warnAfterDays : DEFAULT_WARN_AFTER_DAYS;
  const failAfterDays = Number.isFinite(p.failAfterDays) ? p.failAfterDays : DEFAULT_FAIL_AFTER_DAYS;
  return { warnAfterDays, failAfterDays };
}

// Build a Map id -> { ackDate, reason } from the acknowledgments list. An
// acknowledgment suppresses fail/warn for its source as long as the ack
// itself is no older than `failAfterDays` (so a stale ack does not mask a
// stale source forever).
function acknowledgmentsOf(ledger) {
  const map = new Map();
  for (const a of (ledger && ledger.acknowledgments) || []) {
    if (a && a.id) map.set(a.id, { ackDate: a.ackDate || null, reason: a.reason || '' });
  }
  return map;
}

// Evaluate one source entry against `nowUtc`. Pure.
function evaluateEntry(entry, nowUtc, policy, acks) {
  const id = entry && entry.id ? String(entry.id) : '';
  const url = entry && entry.url ? String(entry.url) : '';
  const label = entry && entry.label ? String(entry.label) : id;
  const lastVerified = entry ? entry.lastVerified : null;
  const verifiedUtc = parseDate(lastVerified);

  if (!verifiedUtc) {
    return { id, label, url, lastVerified: lastVerified || null, ageDays: null, state: STATE.INVALID };
  }

  const ageDays = diffDays(nowUtc, verifiedUtc);
  let state;
  if (ageDays > policy.failAfterDays) state = STATE.FAIL;
  else if (ageDays > policy.warnAfterDays) state = STATE.WARN;
  else state = STATE.FRESH;

  // An acknowledgment downgrades a fail/warn to "acknowledged" while the
  // ack itself is current.
  if ((state === STATE.FAIL || state === STATE.WARN) && acks.has(id)) {
    const ack = acks.get(id);
    const ackUtc = parseDate(ack.ackDate);
    const ackAge = ackUtc ? diffDays(nowUtc, ackUtc) : null;
    if (ackUtc && ackAge != null && ackAge <= policy.failAfterDays) {
      state = STATE.ACKNOWLEDGED;
    }
  }

  return { id, label, url, lastVerified, ageDays, state };
}

// evaluateStaleness(ledger, now) -> {
//   policy, evaluatedAt, entries: [...], summary: { fresh, warn, fail, acknowledged, invalid },
//   worst: <state>, ok: <bool>  // ok = no fail and no invalid
// }
// `now` may be a Date, an ISO/date string, or omitted (defaults to today).
export function evaluateStaleness(ledger, now) {
  const policy = policyOf(ledger);
  const acks = acknowledgmentsOf(ledger);
  const nowUtc = now == null ? todayUtc() : (parseDate(now) || todayUtc(now));
  const sources = (ledger && ledger.sources) || [];

  const entries = sources.map((e) => evaluateEntry(e, nowUtc, policy, acks));

  const summary = { fresh: 0, warn: 0, fail: 0, acknowledged: 0, invalid: 0 };
  for (const e of entries) {
    if (summary[e.state] != null) summary[e.state] += 1;
  }

  const RANK = [STATE.INVALID, STATE.FAIL, STATE.WARN, STATE.ACKNOWLEDGED, STATE.FRESH];
  let worst = STATE.FRESH;
  for (const r of RANK) {
    if (entries.some((e) => e.state === r)) { worst = r; break; }
  }

  const ok = summary.fail === 0 && summary.invalid === 0;
  return {
    policy,
    evaluatedAt: nowUtc.toISOString().slice(0, 10),
    entries,
    summary,
    worst,
    ok,
  };
}

// spec-v52 §4.5.6 / §8.3: keep the ledger honest about the rule ids it
// claims to back. Each source enumerates the representative anchor rule ids
// it covers in its `rules` array. If a rule is renamed or retired (as
// happened in wave 52-2b's id correction) the ledger can silently keep
// pointing at a dead id -- and the deferred `scripts/refresh-pa-rules.mjs`
// (§4.5.6) will iterate exactly these ids, so a stale reference there is
// worse than no reference. `findLedgerRuleOrphans` returns every
// ledger-referenced rule id that is not in the shipped rule set, in
// deterministic order (source order, then the order listed under that
// source), so a CI check can fail on drift. Pure: no I/O, no clock.
export function findLedgerRuleOrphans(ledger, shippedRuleIds) {
  const shipped = shippedRuleIds instanceof Set ? shippedRuleIds : new Set(shippedRuleIds || []);
  const orphans = [];
  for (const source of (ledger && ledger.sources) || []) {
    const sourceId = source && source.id ? String(source.id) : '';
    for (const ruleId of (source && source.rules) || []) {
      if (!shipped.has(ruleId)) orphans.push({ sourceId, ruleId: String(ruleId) });
    }
  }
  return orphans;
}

// spec-v52 §4.5.6: keep the per-rule source metadata (rule.sources, attached
// in rules.js from lib/pa/rule-sources.js) honest about the ledger. Every
// source id a rule claims must be a real ledger source -- a typo or a
// retired source id would otherwise point the deferred refresh script at a
// source that no longer exists. `findRuleSourceOrphans` returns every
// (ruleId, source) pair whose source is absent from the ledger, in
// deterministic order (rule order, then the order the rule lists them).
// Pure: no I/O, no clock.
export function findRuleSourceOrphans(rules, ledgerSourceIds) {
  const known = ledgerSourceIds instanceof Set ? ledgerSourceIds : new Set(ledgerSourceIds || []);
  const orphans = [];
  for (const rule of rules || []) {
    const ruleId = rule && rule.id ? String(rule.id) : '';
    for (const source of (rule && rule.sources) || []) {
      if (!known.has(source)) orphans.push({ ruleId, source: String(source) });
    }
  }
  return orphans;
}

// spec-v52 §4.5.6: the two coverage directions must agree. The ledger's
// per-source `rules` arrays are the representative anchor rules for each
// source; every such (source, rule) anchor must be reflected in that rule's
// own `sources`. If they drift -- e.g. the ledger anchors a rule to a source
// the per-rule map does not -- the refresh script would re-verify the source
// for a rule that has quietly stopped claiming it. `findLedgerCoverageGaps`
// returns every anchor the per-rule map fails to honor, in deterministic
// order (source order, then the order listed). `rulesById` is a Map or plain
// object mapping rule id -> rule (or id -> its sources array). Pure.
export function findLedgerCoverageGaps(ledger, rulesById) {
  const lookup = (id) => {
    if (rulesById instanceof Map) return rulesById.get(id);
    return rulesById ? rulesById[id] : undefined;
  };
  const gaps = [];
  for (const source of (ledger && ledger.sources) || []) {
    const sourceId = source && source.id ? String(source.id) : '';
    for (const ruleId of (source && source.rules) || []) {
      const entry = lookup(ruleId);
      const sources = Array.isArray(entry) ? entry : (entry && entry.sources) || [];
      if (!sources.includes(sourceId)) gaps.push({ sourceId, ruleId: String(ruleId) });
    }
  }
  return gaps;
}

// spec-v52 §4.5.6 (stale-source disabling): a ledger source may be marked
// unavailable -- e.g. the maintainer ran `scripts/refresh-pa-rules.mjs`, saw
// the URL return 404, and could not yet re-point it. A source is disabled
// when it carries a truthy `disabled` field: either `true` or, preferably,
// `{ since, reason }`. `disabledSourceMap` normalizes those into a
// Map sourceId -> { since, reason } the engine consumes to skip every rule
// anchored to a disabled source (via the per-rule `sources` metadata). Pure.
export function disabledSourceMap(ledger) {
  const map = new Map();
  for (const s of (ledger && ledger.sources) || []) {
    if (!s || !s.id || !s.disabled) continue;
    const d = s.disabled;
    const obj = d && typeof d === 'object' ? d : {};
    map.set(String(s.id), {
      since: obj.since ? String(obj.since) : null,
      reason: obj.reason ? String(obj.reason) : 'source marked unavailable in the staleness ledger',
    });
  }
  return map;
}
