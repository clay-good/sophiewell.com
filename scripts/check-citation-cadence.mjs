#!/usr/bin/env node
// spec-v85 §6.3 + spec-v90 §4: warn-only citation-cadence job.
//
// This is the monthly scheduled "is any guideline-derived row overdue for a
// re-verification?" check. It reads our OWN docs/citation-staleness.md ledger
// (never an external feed -- spec-v5 §2) and, for every Class-B row whose
// `accessed` date is older than its declared review cadence, ANNOTATES the run.
// It never blocks and never auto-edits: a guideline update is always a
// reviewed, audited maintainer change (spec-v85 §6.4). Exit status is always 0;
// the signal is the printed annotation, surfaced in the scheduled-run log.
//
// A row is "Class B / cadence-tracked" when its justification names a review
// cadence: either an explicit "on-publication" / "on the next ... update" phrase
// (event-driven -- never flagged by elapsed time, only listed for visibility)
// or a calendar cadence ("annual", "quarterly", "every N months"). For a
// calendar cadence we compare the elapsed time since `accessed` against the
// stated interval and annotate when it is exceeded.
//
// Usage:
//   node scripts/check-citation-cadence.mjs            (uses today's date)
//   node scripts/check-citation-cadence.mjs --asof 2026-12-01   (pin a date)

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const ROOT = process.cwd();
const LEDGER = 'docs/citation-staleness.md';

// Parse a YYYY-MM-DD cell into a UTC Date, or null.
function parseDate(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || '').trim());
  if (!m) return null;
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  return Number.isNaN(d.getTime()) ? null : d;
}

// Whole months between two UTC dates (calendar months, partial month rounds
// down) -- the cadence unit the ledger speaks in.
function monthsBetween(from, to) {
  let months = (to.getUTCFullYear() - from.getUTCFullYear()) * 12
    + (to.getUTCMonth() - from.getUTCMonth());
  if (to.getUTCDate() < from.getUTCDate()) months -= 1;
  return months;
}

// Read a review cadence (in months) out of a justification cell. Returns a
// number of months for a calendar cadence, the string 'event' for an
// on-publication / next-update cadence, or null when no cadence is declared.
export function cadenceMonths(justification) {
  const j = String(justification || '').toLowerCase();
  if (/on[-\s]publication|on the next|next .* (update|statement|guideline|edition)/.test(j)) {
    return 'event';
  }
  const everyN = /every\s+(\d+)\s+months?/.exec(j);
  if (everyN) return Number(everyN[1]);
  if (/\bannual|\byearly|every\s+year/.test(j)) return 12;
  if (/\bbiannual|\bsemiannual|every\s+6\s+months/.test(j)) return 6;
  if (/\bquarterly/.test(j)) return 3;
  return null;
}

// Pull pipe-table data rows out of the ledger markdown: [{ id, accessed,
// justification }]. Mirrors parseLedgerIds in check-citations.mjs (first cell
// is the id; we also read the accessed + justification columns by header).
export function parseLedgerRows(markdown) {
  const lines = String(markdown || '').split('\n');
  const rows = [];
  let header = null;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('|')) { header = null; continue; }
    const cells = trimmed.split('|').slice(1, -1).map((c) => c.trim());
    if (cells.every((c) => /^:?-+:?$/.test(c) || c === '')) continue; // separator
    const firstLower = (cells[0] || '').toLowerCase();
    if (firstLower === 'tile id') { header = cells.map((c) => c.toLowerCase()); continue; }
    if (!header) continue; // a table with no header we recognized
    const id = cells[0].replace(/`/g, '').trim();
    if (!id) continue;
    const accIdx = header.findIndex((h) => h.includes('accessed'));
    const justIdx = header.findIndex((h) => h.includes('justification'));
    rows.push({
      id,
      accessed: accIdx >= 0 ? cells[accIdx] : null,
      justification: justIdx >= 0 ? cells[justIdx] : null,
    });
  }
  return rows;
}

// Pure core: given rows and an as-of date, return the annotations to print.
export function findOverdue(rows, asOf) {
  const out = [];
  for (const row of rows) {
    const cadence = cadenceMonths(row.justification);
    if (cadence == null || cadence === 'event') continue; // not calendar-tracked
    const accessed = parseDate(row.accessed);
    if (!accessed) {
      out.push({ id: row.id, level: 'note', message: `no parseable accessed date (declared cadence ${cadence} mo)` });
      continue;
    }
    const elapsed = monthsBetween(accessed, asOf);
    if (elapsed >= cadence) {
      out.push({
        id: row.id,
        level: 'warn',
        message: `last verified ${row.accessed} (${elapsed} mo ago) exceeds the ${cadence}-month review cadence`,
      });
    }
  }
  return out;
}

async function main() {
  const args = process.argv.slice(2);
  const asofIdx = args.indexOf('--asof');
  let asOf;
  if (asofIdx >= 0 && args[asofIdx + 1]) {
    asOf = parseDate(args[asofIdx + 1]);
    if (!asOf) { console.error('check-citation-cadence: --asof must be YYYY-MM-DD'); process.exit(0); }
  } else {
    const now = new Date();
    asOf = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  }

  const md = await readFile(join(ROOT, LEDGER), 'utf8').catch(() => '');
  const rows = parseLedgerRows(md);
  const overdue = findOverdue(rows, asOf);

  const calendarTracked = rows.filter((r) => typeof cadenceMonths(r.justification) === 'number').length;
  if (overdue.length === 0) {
    console.log(
      `check-citation-cadence: clean (${rows.length} ledger rows, ${calendarTracked} calendar-tracked, none overdue).`,
    );
    process.exit(0);
  }
  console.log('check-citation-cadence: the following ledger rows are due for a re-verification (warn-only):');
  for (const o of overdue) console.log(`  [${o.level}] ${o.id}: ${o.message}`);
  console.log('This is advisory. Re-verify the cited edition against the live source and bump `accessed` if unchanged, or ship the new edition as a reviewed change (spec-v85 §6.4).');
  process.exit(0); // never blocks
}

if (process.argv[1] && process.argv[1].endsWith('check-citation-cadence.mjs')) {
  main().catch((err) => { console.error(err); process.exit(0); });
}
