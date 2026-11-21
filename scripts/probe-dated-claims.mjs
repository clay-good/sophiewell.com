#!/usr/bin/env node
// A date that has passed, written in the future tense.
//
// The New York nurse-training tool said the updated child-abuse course "is due by November 17, 2026"
// after that day had gone; its state-law ledger row caught it only because the tool cites state law.
// A federal rule, a payer's program or a label change has no such row, so its "takes effect", "is
// due by" or "proposed rule would" goes stale in silence (the 340B tool still called the CY2027 fee
// schedule rule "proposed" twelve days after the final rule was published).
//
// Reads every non-comment line of lib/, views/ and mcp/adapters/ for a written date (Month D, YYYY;
// Month YYYY; YYYY-MM-DD) near future-tense words, and prints the ones whose date is before today
// (or before --as-of YYYY-MM-DD; --ahead N also lists dates within the next N days). Worked examples
// and branches that compare against an entered date are honest and show up too: every row needs
// reading. A real one is re-read against its source, then rewritten in the past tense or updated.
//
// Asserts nothing; prints a report.
//
//   node scripts/probe-dated-claims.mjs [--as-of 2026-11-21] [--ahead 30]

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const args = process.argv.slice(2);
const opt = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };
const asOf = opt('--as-of') || new Date().toISOString().slice(0, 10);
const ahead = Number(opt('--ahead') || 0);
const limit = new Date(Date.parse(asOf) + ahead * 86400000).toISOString().slice(0, 10);

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const M = MONTHS.join('|');
const DATE = new RegExp(`\\b(?:(${M}) (\\d{1,2}), (20\\d\\d)|(${M}) (20\\d\\d)|(20\\d\\d)-(\\d\\d)-(\\d\\d))\\b`, 'g');
const FUTURE = /\b(is due|are due|due by|will|takes? effect|begins?|starting|until|expires|is scheduled|pending|proposed rule|would require)\b/i;

function iso(m) {
  const pad = (n) => String(n).padStart(2, '0');
  if (m[1]) return `${m[3]}-${pad(MONTHS.indexOf(m[1]) + 1)}-${pad(m[2])}`;
  // "November 2026" reads as the month's last day: it has passed only once the month has.
  if (m[4]) { const mo = MONTHS.indexOf(m[4]) + 1; return `${m[5]}-${pad(mo)}-${pad(new Date(Date.UTC(+m[5], mo, 0)).getUTCDate())}`; }
  return `${m[6]}-${m[7]}-${m[8]}`;
}

function* files(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* files(p);
    else if (p.endsWith('.js')) yield p;
  }
}

let rows = 0;
for (const root of ['lib', 'views', 'mcp/adapters']) {
  for (const f of files(root)) {
    readFileSync(f, 'utf8').split('\n').forEach((line, i) => {
      const t = line.trim();
      if (t.startsWith('//') || t.startsWith('*')) return;
      for (const m of line.matchAll(DATE)) {
        const d = iso(m);
        if (d > limit || d < '2025-01-01') continue;
        const ctx = line.slice(Math.max(0, m.index - 160), m.index + m[0].length + 60);
        if (!FUTURE.test(ctx.replace(/\b(was|were) due by\b/gi, ''))) continue;
        rows++;
        console.log(`${f}:${i + 1}\t${d}${d >= asOf ? ' (ahead)' : ''}\t${ctx.trim().slice(0, 220)}`);
      }
    });
  }
}
console.error(`${rows} dated claim(s) on or before ${limit} beside future-tense words; read each.`);
