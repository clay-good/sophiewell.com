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
const isDate = (v) => /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2})?$/.test(String(v || ''));

let rows = 0;
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
      rows++;
      console.log(`${name}\t${t.id}\t${lo.arg}=${h} > ${hi.arg}=${l}\t${say(r.result || {})}`);
    }
  }
  const dates = (t.fields || []).filter((f) => isDate(ex[f.dom]));
  for (let i = 0; i < dates.length; i++) for (let j = i + 1; j < dates.length; j++) {
    if (ex[dates[i].dom] === ex[dates[j].dom]) continue;
    const r = swap(dates[i], dates[j]);
    if (r.valid === false) continue;
    rows++;
    console.log(`date\t${t.id}\t${dates[i].arg}<->${dates[j].arg}\t${say(r.result || {})}`);
  }
}
console.error(`${rows} swapped pair(s) still answer; read each.`);
