// spec-v1634 tool 21: cost avoidance from pharmacist interventions, by the Nesbit method.
//
// Source: the method of Nesbit TW, Shermock KM, Bobek MB, et al. (Am J Health Syst Pharm 2001), as
// restated in Abushanab D, Atchan M, Elajez R, et al. Economic impact of clinical pharmacist
// interventions in a general tertiary hospital in Qatar. PLoS One 2023;18(6):e0286419
// (PMC10234553, CC BY), re-read on October 11, 2026: cost avoidance "was calculated for each
// intervention by multiplying the estimated probability of an ADE in the absence of the
// intervention by the cost of an ADE"; "The probabilities are: 0 (none), 0.01 (very low), 0.1
// (low), 0.4 (medium), or 0.6 (high)". The 2001 paper itself was not read.
//
//   cost avoidance = sum over interventions of probability x cost of the adverse event averted
//
// Every dollar figure and every class is the reader's; the tool multiplies and adds.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

export const CLASSES = [
  { value: 'none', text: 'none', p: 0 },
  { value: 'very low', text: 'very low', p: 0.01 },
  { value: 'low', text: 'low', p: 0.1 },
  { value: 'medium', text: 'medium', p: 0.4 },
  { value: 'high', text: 'high', p: 0.6 },
];
const NOTE = 'An estimate, not money saved: the class given to each intervention is a judgment about an adverse event that did not happen, and the cost of that event is the reader\'s figure. The tool multiplies and adds. The probabilities are the method\'s as restated in a 2023 open paper; the 2001 original was not read.';
const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const money = (x) => (Math.round(x * 100) / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function adeCostAvoidance(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const lines = String(o.interventions ?? '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (!lines.length) return { valid: false, message: 'Enter at least one line: probability class, cost of the adverse event averted, and (optionally) the number of such interventions.' };
  if (lines.length > 200) return { valid: false, message: 'Enter at most 200 lines; group like interventions on one line with a count.' };
  const byClass = new Map(CLASSES.map((c) => [c.value, { count: 0, avoided: 0 }]));
  let total = 0; let n = 0;
  for (const [i, line] of lines.entries()) {
    const p = line.split(/\s*[,\t]\s*/);
    if (p.length < 2 || p.length > 3) return { valid: false, message: `Line ${i + 1}: enter the class, a comma, the cost, and optionally a comma and a count. Write numbers without thousands separators.` };
    const cls = CLASSES.find((c) => c.value === p[0].trim().toLowerCase().replace(/[-_]+/g, ' '));
    if (!cls) return { valid: false, message: `Line ${i + 1}: choose the class from none, very low, low, medium or high.` };
    const f = inputFault([[`the cost on line ${i + 1}`, p[1].replace(/^\$/, ''), 0, 1e9, ''], ...(p.length === 3 ? [[`the count on line ${i + 1}`, p[2], null, 1e6, '']] : [])]);
    if (f) return { valid: false, message: f };
    const count = p.length === 3 ? Number(p[2]) : 1;
    if (!Number.isInteger(count)) return { valid: false, message: `Line ${i + 1}: enter the count as a whole number.` };
    const avoided = cls.p * Number(p[1].replace(/^\$/, '')) * count;
    const b = byClass.get(cls.value); b.count += count; b.avoided += avoided;
    total += avoided; n += count;
  }
  let time = null;
  if (!blank(o.timeCost)) {
    const tf = inputFault([['the pharmacist time cost', o.timeCost, 0, 1e9, '']]);
    if (tf) return { valid: false, message: tf };
    time = Number(o.timeCost);
  }
  const rows = CLASSES.filter((c) => byClass.get(c.value).count).map((c) => ({ class: c.value, probability: c.p, interventions: byClass.get(c.value).count, avoided: Math.round(byClass.get(c.value).avoided * 100) / 100 }));
  const notes = rows.map((r) => `${r.class[0].toUpperCase()}${r.class.slice(1)} (probability ${r.probability}): ${r.interventions.toLocaleString('en-US')} intervention${r.interventions === 1 ? '' : 's'}, ${money(r.avoided)} avoided.`);
  const net = time === null ? null : total - time;
  if (net !== null) notes.push(`Net of the pharmacist time cost: ${money(total)} − ${money(time)} = ${money(net)}.`);
  notes.push('Nesbit method, as restated in Abushanab D, et al. PLoS One 2023;18(6):e0286419 (CC BY).');
  return {
    valid: true, flag: 'cost-avoidance', abnormal: false, interventions: n, costAvoidance: Math.round(total * 100) / 100, byClass: rows, ...(net === null ? {} : { net: Math.round(net * 100) / 100 }),
    band: `Estimated cost avoidance: ${money(total)} across ${n.toLocaleString('en-US')} intervention${n === 1 ? '' : 's'}${net === null ? '' : `; ${money(net)} net of the time cost`}.`,
    bandLabel: money(net === null ? total : net),
    notes, note: NOTE,
  };
}
