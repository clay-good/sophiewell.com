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
import { evaluateStaleness, STATE } from '../lib/pa/staleness.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const LEDGER_PATH = join(ROOT, 'pa-staleness-ledger.json');

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

  if (warns.length) {
    console.log(`check-pa-staleness: clean with warnings (${tally}).`);
  } else {
    console.log(`check-pa-staleness: clean (${tally}).`);
  }
  process.exit(0);
}

main().catch((err) => {
  console.error('check-pa-staleness: error', err);
  process.exit(2);
});
