#!/usr/bin/env node
// spec-v1750: a date that is not one, or not one of ours, used as given.
//
// lib/num.js keeps the house date rule (`ymdFault`: the shape, the 1900-2100 window, the calendar) and the
// wall-clock parser (`wallClockUtc`). This sets every date and date-time field in the worked examples to 30
// February, month 13, and the year 1850 (keeping any time part), and every HH:MM field to 25:00, 12:75 and
// 24:30, and lists the tools that still answer. spec-v1750 found 16 of 714 date probes answering (twelve
// copies of one parser with no year window, a rabies schedule, an iMID start date read as missing).
//
// Asserts nothing; prints a report.
//
//   node scripts/probe-impossible-dates.mjs

import { META } from '../lib/meta.js';
import { computeCalculator } from '../mcp/tools.js';
import { allCalculators } from '../mcp/catalog.js';

const DATE = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2})?$/;
const TIME = /^\d{2}:\d{2}$/;
let rows = 0;
let probes = 0;
for (const t of allCalculators()) {
  const ex = META[t.id]?.example?.fields;
  if (!ex) continue;
  const base = computeCalculator({ id: t.id, inputs: { ...ex } });
  if (base.valid === false) continue;
  for (const f of (t.fields || [])) {
    const v = String(ex[f.dom] ?? '');
    let bads = [];
    if (DATE.test(v)) bads = ['2026-02-30', '2026-13-01', '1850-06-01'].map((d) => d + v.slice(10));
    else if (TIME.test(v)) bads = ['25:00', '12:75', '24:30'];
    for (const bad of bads) {
      probes++;
      const r = computeCalculator({ id: t.id, inputs: { ...ex, [f.dom]: bad } });
      if (r.valid === false) continue;
      rows++;
      const o = r.result || {};
      console.log(`${t.id}\t${f.dom}\t${bad}\t${String(o.bandLabel || o.band || o.text || '').slice(0, 90)}`);
    }
  }
}
console.error(`${rows} of ${probes} impossible dates or times still answer.`);
