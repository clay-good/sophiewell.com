#!/usr/bin/env node
// spec-v1737/v1738: two values whose order is fixed by definition, entered the other way round.
//
// For each tool, pairs of number fields are matched by label (a whole and a part of it, or an upper and a
// lower pressure), and pairs of DATE fields are taken as they come. The worked example's two values are
// swapped and the tool is kept when it still answers. A diastolic of 120 over a systolic of 80 gave a mean
// arterial pressure above the "systolic"; an HDL of 213 over a total cholesterol of 50 gave a 0.6%
// Framingham risk; an ultrasound dated before the last menstrual period was dated as usual.
//
// Most DATE swaps are honest different situations ("not yet open", "1 h 20 min early"), and some label
// pairs are not orders at all (draw times, body areas, distances). Every row needs reading; the fix for a
// real one is `orderFault` in lib/num.js.
//
// spec-v1784: date fields are "taken as they come" because the probe cannot know which pairs have a fixed
// order, and most do not -- two completed course dates, a notice and an election. So the oracle for a date
// pair is no longer "the tool still answers" but **the tool answers IDENTICALLY**. A swap that MOVES the
// answer is the tool reading a different chronology and saying so, which is the behaviour spec-v1737 was
// asking for; 43 of its 48 date rows were that. A swap answered byte for byte the same is the tool reading
// the reversed order as the same situation, which is the defect shape: an ultrasound dated before the last
// menstrual period, dated as usual. Number pairs keep the old oracle, because `PAIRS` lists only orders
// that ARE fixed by definition.
//
// Asserts nothing; prints a report.
//
//   node scripts/probe-order-swapped.mjs

import { META } from '../lib/meta.js';
import { computeCalculator } from '../mcp/tools.js';
import { allCalculators } from '../mcp/catalog.js';

// [name, whole/upper label, part/lower label] -- the second must not exceed the first.
const PAIRS = [
  ['sbp>=dbp', /systolic/i, /diastolic/i],
  ['fvc>=fev1', /\bFVC\b|forced vital capacity/i, /\bFEV1\b|FEV₁/i],
  ['tc>=hdl', /total cholesterol/i, /\bHDL\b/i],
  ['tc>=ldl', /total cholesterol/i, /\bLDL\b/i],
  ['tp>=alb', /total protein/i, /\balbumin\b/i],
  ['peak>=trough', /\bpeak\b/i, /\btrough\b/i],
  ['edv>=esv', /end-?diastolic|\bLVEDV?\b|\bLVIDd\b/i, /end-?systolic|\bLVESV?\b|\bLVIDs\b/i],
  ['tca>=ica', /total calcium/i, /ioni[sz]ed/i],
  ['mpap>=pcwp', /mean (PA|pulmonary)/i, /\bPCWP\b|wedge/i],
  ['sao2>=svo2', /arterial Sa?O2|\bSaO2\b/i, /mixed-venous|\bSvO2\b/i],
  ['wbc>=anc', /\bWBC\b|white (blood )?cell/i, /neutrophil|\bANC\b/i],
  ['wbc>=alc', /\bWBC\b|white (blood )?cell/i, /lymphocyte|\bALC\b/i],
  ['tbili>=dbili', /total bilirubin/i, /direct|conjugated/i],
  ['tibc>=iron', /\bTIBC\b|iron.binding/i, /serum iron|^iron\b/i],
  ['age>=onset', /^(current |patient )?age\b/i, /age at|onset age|age of onset|age when/i],
  ['max>=min', /\b(max(imum)?|highest)\b/i, /\b(min(imum)?|lowest)\b/i],
];
// Rows read and judged, with the reason (docs/spec-v1784.md). The report prints only what is not here.
const JUDGED = Object.fromEntries([
  ['written<->consulting'], ['written<->mentalHealth'], ['attending<->consulting'],
  ['attending<->mentalHealth'], ['consulting<->mentalHealth'],
].map(([pair]) => [`ny-maid-timeline:${pair}`,
  'Public Health Law 2899-f(2) requires the consulting and mental-health confirmations BEFORE prescribing and '
  + 'states no order among the four, so the tool checks that each is documented and dates only the five-day fill '
  + 'wait from the prescription; either order is the same situation under the statute as cited']));
// A number pair the tool answers ON PURPOSE, because the impossible order is a real reading.
JUDGED['tsat:ironUgDl>tibcUgDl'] = 'spec-v1784: the serum iron genuinely can exceed TIBC in acute iron ingestion, '
  + 'so this is not refused; above 100% the answer says the iron is above the capacity to bind it and asks for the '
  + 'two values to be checked, instead of naming a hemochromatosis work-up';
const ALL = process.argv.includes('--all');
const judgedSeen = new Set();

const isDate = (v) => /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2})?$/.test(String(v || ''));

let rows = 0;
let moved = 0;
const say = (o) => String(o.bandLabel || o.verdict || o.band || o.text || '').slice(0, 100);
for (const t of allCalculators()) {
  const ex = META[t.id]?.example?.fields;
  if (!ex) continue;
  const base = computeCalculator({ id: t.id, inputs: { ...ex } });
  if (base.valid === false) continue;
  const swap = (a, b) => computeCalculator({ id: t.id, inputs: { ...ex, [a.dom]: ex[b.dom], [b.dom]: ex[a.dom] } });
  const nums = (t.fields || []).filter((f) => f.kind === 'number' && !Array.isArray(f.values));
  for (const [name, hiRe, loRe] of PAIRS) {
    for (const hi of nums) for (const lo of nums) {
      if (hi === lo || !hiRe.test(hi.label || '') || loRe.test(hi.label || '') || !loRe.test(lo.label || '')) continue;
      const h = Number(ex[hi.dom]); const l = Number(ex[lo.dom]);
      if (!Number.isFinite(h) || !Number.isFinite(l) || h <= l) continue;
      const r = swap(hi, lo);
      if (r.valid === false) continue;
      const nkey = `${t.id}:${lo.arg}>${hi.arg}`;
      const nrow = `${name}\t${t.id}\t${lo.arg}=${h} > ${hi.arg}=${l}\t${say(r.result || {})}`;
      if (JUDGED[nkey]) {
        judgedSeen.add(nkey);
        if (ALL) console.log(`JUDGED\t${nrow}\t${JUDGED[nkey]}`);
        continue;
      }
      rows++;
      console.log(nrow);
    }
  }
  const dates = (t.fields || []).filter((f) => isDate(ex[f.dom]));
  const stable = (r) => JSON.stringify(r && r.result !== undefined ? r.result : r);
  const baseline = stable(base);
  for (let i = 0; i < dates.length; i++) for (let j = i + 1; j < dates.length; j++) {
    if (ex[dates[i].dom] === ex[dates[j].dom]) continue;
    const r = swap(dates[i], dates[j]);
    if (r.valid === false) continue;
    if (stable(r) !== baseline) { moved++; continue; }
    const key = `${t.id}:${dates[i].arg}<->${dates[j].arg}`;
    const row = `date\t${t.id}\t${dates[i].arg}<->${dates[j].arg}\t${say(r.result || {})}`;
    if (JUDGED[key]) {
      judgedSeen.add(key);
      if (ALL) console.log(`JUDGED\t${row}\t${JUDGED[key]}`);
      continue;
    }
    rows++;
    console.log(row);
  }
}
const stale = Object.keys(JUDGED).filter((k) => !judgedSeen.has(k));
for (const k of stale) console.log(`STALE-LEDGER\t${k}\t(judged here, but the finder no longer reaches it)`);
console.error(`${rows} swapped pair(s) still answer and are not judged; ${judgedSeen.size} judged`
  + `${stale.length ? `, ${stale.length} ledger row(s) STALE` : ''}`
  + `; ${moved} date swap(s) MOVED the answer, which is the tool reading a different chronology and saying so.`
  + `\n--all lists the judged rows and why.`);
