#!/usr/bin/env node
// spec-v52 §8.3: PA dataset-staleness CI check.
//
// Reads the staleness ledger (pa-staleness-ledger.json) and evaluates each
// PA-rule source against the policy window. Default behavior:
//
//   - fresh / acknowledged      -> ok
//   - warn  (> warnAfterDays)   -> printed as a warning, exit 0
//   - fail  (> failAfterDays)   -> printed as an error, exit 1
//   - invalid (unparseable date)-> printed as an error, exit 1
//
// This matches §8.3's "fails (or warns, depending on the configured grace
// window)": the 90-day window warns, the 365-day window fails. The
// maintainer keeps CI green by re-verifying each source (bump lastVerified)
// or adding an acknowledgments entry. Run with --strict to also fail on
// warnings (the stricter literal reading of §8.3's 90-day fail).
//
// Determinism / testing: pass SOPHIEWELL_NOW=YYYY-MM-DD to pin "today".
// The pure evaluator lives in lib/pa/staleness.js and is unit-tested.

import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { evaluateStaleness, STATE, findLedgerRuleOrphans, findRuleSourceOrphans, findLedgerCoverageGaps } from '../lib/pa/staleness.js';
import { renderModule } from './build-pa-staleness-ledger.mjs';
import { STARTER_RULES } from '../lib/pa/rules.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const LEDGER_PATH = join(ROOT, 'pa-staleness-ledger.json');
const MODULE_PATH = join(ROOT, 'lib', 'pa', 'staleness-ledger.js');

const strict = process.argv.includes('--strict');
const now = process.env.SOPHIEWELL_NOW || null;

async function main() {
  let ledger;
  try {
    ledger = JSON.parse(await readFile(LEDGER_PATH, 'utf8'));
  } catch (err) {
    console.error('check-pa-staleness: cannot read pa-staleness-ledger.json:', err && err.message ? err.message : err);
    process.exit(2);
  }

  // spec-v52 §8.3 follow-up: the ledger is also bundled into the shipped JS
  // (lib/pa/staleness-ledger.js) so the in-tab report can surface staleness
  // with no runtime fetch. Fail if that generated module has drifted from
  // the canonical JSON -- the maintainer must re-run
  // `node scripts/build-pa-staleness-ledger.mjs` after editing the ledger.
  const expectedModule = renderModule(ledger);
  let actualModule;
  try {
    actualModule = await readFile(MODULE_PATH, 'utf8');
  } catch {
    actualModule = null;
  }
  if (actualModule !== expectedModule) {
    console.error('check-pa-staleness: lib/pa/staleness-ledger.js is out of sync with pa-staleness-ledger.json.');
    console.error('  Run `node scripts/build-pa-staleness-ledger.mjs` and commit the result.');
    process.exit(1);
  }

  // spec-v52 §4.5.6 / §8.3: the ledger's per-source `rules` arrays must name
  // rule ids that actually ship in lib/pa/rules.js. A renamed or retired rule
  // (cf. the wave 52-2b id correction) would otherwise leave the ledger -- and
  // the deferred refresh script that iterates these ids -- pointing at a dead
  // reference. Fail on any orphan.
  const shippedIds = new Set(STARTER_RULES.map((r) => r.id));
  const orphans = findLedgerRuleOrphans(ledger, shippedIds);
  if (orphans.length) {
    for (const o of orphans) {
      console.error(`  ORPHAN ${o.ruleId}: referenced by source "${o.sourceId}" but not in the shipped ruleset.`);
    }
    console.error(`check-pa-staleness: ${orphans.length} ledger rule reference(s) do not match lib/pa/rules.js.`);
    console.error('  Re-point the ledger source\'s `rules` list to a current rule id, or drop the stale id. See docs/pa-maintenance.md.');
    process.exit(1);
  }

  // spec-v52 §4.5.6: the reverse direction. Every source id a rule claims via
  // its structured `sources` metadata (rules.js / lib/pa/rule-sources.js) must
  // be a real ledger source -- otherwise the deferred refresh script would
  // chase a source that does not exist. Fail on any orphan.
  const ledgerSourceIds = new Set((ledger.sources || []).map((s) => s && s.id).filter(Boolean));
  const sourceOrphans = findRuleSourceOrphans(STARTER_RULES, ledgerSourceIds);
  if (sourceOrphans.length) {
    for (const o of sourceOrphans) {
      console.error(`  ORPHAN ${o.ruleId}: claims source "${o.source}" which is not in pa-staleness-ledger.json.`);
    }
    console.error(`check-pa-staleness: ${sourceOrphans.length} rule source reference(s) do not match the ledger.`);
    console.error('  Fix the assignment in lib/pa/rule-sources.js, or add the source to pa-staleness-ledger.json. See docs/pa-maintenance.md.');
    process.exit(1);
  }

  // spec-v52 §4.5.6: the two coverage directions must agree. Every ledger
  // anchor (source -> representative rule) must be reflected in that rule's
  // own `sources`, so the ledger and the per-rule map cannot silently drift.
  const coverageGaps = findLedgerCoverageGaps(ledger, new Map(STARTER_RULES.map((r) => [r.id, r])));
  if (coverageGaps.length) {
    for (const g of coverageGaps) {
      console.error(`  GAP ${g.ruleId}: ledger source "${g.sourceId}" anchors it, but the rule's sources omit "${g.sourceId}".`);
    }
    console.error(`check-pa-staleness: ${coverageGaps.length} ledger anchor(s) not reflected in per-rule sources.`);
    console.error('  Align lib/pa/rule-sources.js with the ledger\'s per-source `rules` arrays. See docs/pa-maintenance.md.');
    process.exit(1);
  }

  const result = evaluateStaleness(ledger, now);
  const { summary, policy, evaluatedAt } = result;

  const fails = result.entries.filter((e) => e.state === STATE.FAIL || e.state === STATE.INVALID);
  const warns = result.entries.filter((e) => e.state === STATE.WARN);
  const acked = result.entries.filter((e) => e.state === STATE.ACKNOWLEDGED);

  for (const e of fails) {
    if (e.state === STATE.INVALID) {
      console.error(`  FAIL ${e.id}: unparseable lastVerified (${e.lastVerified}) -- ${e.label}`);
    } else {
      console.error(`  FAIL ${e.id}: ${e.ageDays} days unverified (> ${policy.failAfterDays}) -- ${e.label} <${e.url}>`);
    }
  }
  for (const e of warns) {
    console.error(`  WARN ${e.id}: ${e.ageDays} days unverified (> ${policy.warnAfterDays}) -- ${e.label} <${e.url}>`);
  }
  for (const e of acked) {
    console.error(`  ACK  ${e.id}: ${e.ageDays} days unverified, acknowledged -- ${e.label}`);
  }

  const tally = `evaluated ${evaluatedAt}: ${summary.fresh} fresh, ${summary.warn} warn, `
    + `${summary.fail} fail, ${summary.acknowledged} acknowledged, ${summary.invalid} invalid`;

  if (fails.length || (strict && warns.length)) {
    console.error(`check-pa-staleness: stale sources found (${tally}).`);
    console.error('  Re-verify the source and bump lastVerified, or add an acknowledgments entry. See docs/pa-maintenance.md.');
    process.exit(1);
  }

  const sourced = STARTER_RULES.filter((r) => (r.sources || []).length).length;
  const coverage = `${shippedIds.size} rules shipped, 0 ledger orphans, ${sourced} source-anchored, 0 source orphans, 0 coverage gaps`;
  if (warns.length) {
    console.log(`check-pa-staleness: clean with warnings (${tally}; ${coverage}).`);
  } else {
    console.log(`check-pa-staleness: clean (${tally}; ${coverage}).`);
  }
  process.exit(0);
}

main().catch((err) => {
  console.error('check-pa-staleness: error', err);
  process.exit(2);
});
