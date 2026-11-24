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
// spec-v1782: it printed twenty rows and every one of them was honest, which is a report people learn to
// skip. Two of the three ways a future tense beside a passed date is honest turned out to be structural, so
// they are decided here rather than re-read every run:
//
//   * THE SENTENCE'S LATEST DATE IS IN THE FUTURE. "FDA's letter of August 6, 2026 granted its exemptions
//     until November 27, 2027" has a passed date and a future tense, and the tense belongs to 2027. A line
//     carrying any date still ahead is making its claim about that date.
//   * A WORKED EXAMPLE IS DATED BY ITS OWN INPUTS. `lib/meta.js`'s `expected:` strings say "The MOON is due
//     by Wednesday, October 7, 2026" because the example's observation began 36 hours earlier. The example
//     and its answer move together; neither goes stale.
//
// The third way is a date that belongs to a SOURCE rather than a deadline -- "BCBSSC's March 25, 2026
// bulletin says a continued-stay review is due within seven days", where the future tense has no date of
// its own. That one needs reading, so those rows are in the JUDGED ledger below with their reasons, and the
// report prints only what is not there (spec-v1775's rule).
//
// Asserts nothing; prints a report.
//
//   node scripts/probe-dated-claims.mjs [--as-of 2026-11-21] [--ahead 30]
//   node scripts/probe-dated-claims.mjs --all      # the judged rows as well, with their reasons

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const args = process.argv.slice(2);
const opt = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };
const asOf = opt('--as-of') || new Date().toISOString().slice(0, 10);
const ahead = Number(opt('--ahead') || 0);
const limit = new Date(Date.parse(asOf) + ahead * 86400000).toISOString().slice(0, 10);

const ALL = args.includes('--all');

// Rows read and judged: a date that belongs to a source or to a rule's start, not to a deadline still
// coming. Keyed on file, date and a distinctive word of the sentence, so moving the line does not stale it.
const JUDGED = {
  "lib/gs1-drug-barcode-parser-v1637.js|2025-01-01|zeroes": 'GS1\'s rule took effect on that day and still stands; "starting" names when it began',
  "lib/ipledge-v1511.js|2026-11-15|19 days": 'the pre-modification branch of a tool that switches on the entered date at MODIFIED_FROM; both regimes are described on purpose',
  "lib/ny-maid-timeline-v1392.js|2026-08-31|re-issue": 'the date is the NYSDOH FAQ\'s; "expires" is the standing 30-day rule it states',
  "lib/pa/rules.js|2026-01-01|422.568": 'the 7-day deadline began on that day and is in force; "Beginning" names its start',
  "lib/pa/rules.js|2026-03-25|seven": 'the date is the bulletin\'s; "is due within seven days" is the standing rule it states',
};
const judgedSeen = new Set();

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
let examples = 0;
let carried = 0;
for (const root of ['lib', 'views', 'mcp/adapters']) {
  for (const f of files(root)) {
    readFileSync(f, 'utf8').split('\n').forEach((line, i) => {
      const t = line.trim();
      if (t.startsWith('//') || t.startsWith('*')) return;
      // A worked example's expected output carries the example's own dates (see the header).
      const isExample = f === 'lib/meta.js' && /^(expected|example):/.test(t);
      for (const m of line.matchAll(DATE)) {
        const d = iso(m);
        if (d > limit || d < '2025-01-01') continue;
        const ctx = line.slice(Math.max(0, m.index - 160), m.index + m[0].length + 60);
        if (!FUTURE.test(ctx.replace(/\b(was|were) due by\b/gi, ''))) continue;
        // A date still ahead IN THE SAME NEIGHBOURHOOD the future tense was found in: the tense is about
        // that date, not this one. Scoped to the context window rather than the whole line, so a stale
        // claim cannot hide behind a live one further along a long citation string.
        let aheadNearby = false;
        for (const n of ctx.matchAll(DATE)) if (iso(n) > limit) aheadNearby = true;
        if (aheadNearby) { carried++; continue; }
        if (isExample) { examples++; continue; }
        const key = Object.keys(JUDGED).find((k) => {
          const [kf, kd, word] = k.split('|');
          return kf === f && kd === d && line.includes(word);
        });
        const row = `${f}:${i + 1}\t${d}${d >= asOf ? ' (ahead)' : ''}\t${ctx.trim().slice(0, 220)}`;
        if (key) {
          judgedSeen.add(key);
          if (ALL) console.log(`JUDGED\t${row}\t${JUDGED[key]}`);
          continue;
        }
        rows++;
        console.log(row);
      }
    });
  }
}
const stale = Object.keys(JUDGED).filter((k) => !judgedSeen.has(k));
for (const k of stale) console.log(`STALE-LEDGER\t${k}\t(judged here, but the finder no longer reaches it)`);
console.error(`${rows} dated claim(s) on or before ${limit} beside future-tense words that are not judged`
  + `; ${judgedSeen.size} judged${stale.length ? `, ${stale.length} ledger row(s) STALE` : ''}`
  + `; ${examples} in a worked example's expected output, which carries the example's own dates`
  + `; ${carried} beside a date still ahead in the same clause, which is what the tense is about.`
  + `\n--all lists the judged rows and why.`);
