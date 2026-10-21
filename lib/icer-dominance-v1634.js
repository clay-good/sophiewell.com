// spec-v1634 tool 20: incremental cost-effectiveness ratios and dominance.
//
// Source: VA Health Economics Resource Center, "Cost-Effectiveness Analysis"
// (https://www.herc.research.va.gov/include/page.asp?id=cost-effectiveness-analysis), re-read on
// October 11, 2026:
//   - The incremental cost-effectiveness ratio "is the difference in costs divided by the
//     difference in outcomes".
//   - Strong dominance: an intervention is ruled out "if there is another intervention that is both
//     more effective and less costly".
//   - Extended dominance: the remaining interventions are ordered by effectiveness, each compared
//     with the next most effective alternative, and any intervention with a ratio "greater than that
//     of a more effective intervention" is ruled out. The ratios are then recomputed.
//   - The page's worked example (standard care and five innovations) is the test.
//   - The Public Health Service task force "did not recommend a standard" for a cost-effective
//     ratio, so no threshold is applied here. Net monetary benefit is not on the page and is not
//     computed.
// The page does not say what to do with two options of equal effect; the dearer one is set aside
// and named, because no ratio can be formed between them.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

const NOTE = 'This orders the options and does the division. It applies no threshold: the page read says the Public Health Service task force did not recommend a standard for a cost-effective ratio. Whether a ratio is worth paying is the decision maker\'s call, and the answer is only as good as the costs and effects entered.';
const money = (x) => (Math.round(x * 100) / 100).toLocaleString('en-US', { maximumFractionDigits: 2 });
const num = (x) => Number(x.toPrecision(6)).toLocaleString('en-US', { maximumFractionDigits: 6 });

function parse(text) {
  const lines = String(text ?? '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) return { fault: 'Enter at least two options, one per line: name, cost, effect.' };
  if (lines.length > 20) return { fault: 'Enter at most 20 options.' };
  const options = [];
  for (const [i, line] of lines.entries()) {
    const p = line.split(/\s*[,\t]\s*/);
    if (p.length !== 3) return { fault: `Option line ${i + 1}: enter the name, a comma, the cost, a comma, then the effect. Write numbers without thousands separators.` };
    const name = p[0].trim();
    if (!name) return { fault: `Option line ${i + 1}: enter a name.` };
    if (options.some((x) => x.name.toLowerCase() === name.toLowerCase())) return { fault: `Option line ${i + 1}: the name "${name}" is used twice.` };
    const f = inputFault([[`the cost on option line ${i + 1}`, p[1].replace(/^\$/, ''), 0, 1e12, ''], [`the effect on option line ${i + 1}`, p[2], 0, 1e9, '']]);
    if (f) return { fault: f };
    options.push({ name, cost: Number(p[1].replace(/^\$/, '')), effect: Number(p[2]) });
  }
  return { options };
}

export function icerDominance(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const { options, fault } = parse(o.options);
  if (fault) return { valid: false, message: fault };
  const excluded = [];
  // Strong dominance: another option is both more effective and less costly.
  let live = options.filter((x) => {
    // Strongly dominated: another option does better at no more cost (equal cost with more effect counts, as does
    // lower cost with more effect). Equal effect is the tie case below.
    const by = options.find((y) => y.effect > x.effect && y.cost <= x.cost);
    if (by) excluded.push({ name: x.name, reason: 'strongly dominated', by: by.name, text: `${x.name}: strongly dominated by ${by.name}, which ${by.cost < x.cost ? 'costs less' : 'costs the same'} and does better.` });
    return !by;
  });
  // Equal effect: no ratio can be formed; the dearer one is set aside (not a rule on the page).
  live = live.filter((x) => {
    const tie = live.find((y) => y !== x && y.effect === x.effect && (y.cost < x.cost || (y.cost === x.cost && live.indexOf(y) < live.indexOf(x))));
    if (tie) excluded.push({ name: x.name, reason: 'equal effect', by: tie.name, text: `${x.name}: the same effect as ${tie.name} at ${x.cost === tie.cost ? 'the same cost' : 'a higher cost'}, so no ratio can be formed between them and it is set aside. The page read does not cover a tie.` });
    return !tie;
  });
  live.sort((x, y) => x.effect - y.effect);
  // Extended dominance, repeated until no ratio exceeds that of a more effective option.
  const icer = (i) => (live[i].cost - live[i - 1].cost) / (live[i].effect - live[i - 1].effect);
  for (;;) {
    let drop = -1;
    for (let i = 1; i < live.length - 1 && drop < 0; i += 1) if (icer(i) > icer(i + 1)) drop = i;
    if (drop < 0) break;
    excluded.push({ name: live[drop].name, reason: 'extended dominance', by: live[drop + 1].name, text: `${live[drop].name}: ruled out by extended dominance. Its ratio (${money(icer(drop))} per unit of effect) is greater than that of the more effective ${live[drop + 1].name} (${money(icer(drop + 1))}).` });
    live.splice(drop, 1);
  }
  const frontier = live.map((x, i) => ({ name: x.name, cost: x.cost, effect: x.effect, icer: i === 0 ? null : Number(icer(i).toPrecision(8)), against: i === 0 ? null : live[i - 1].name }));
  const lines = frontier.map((x) => (x.icer === null
    ? `${x.name}: cost ${money(x.cost)}, effect ${num(x.effect)}. The least effective option left; the others are compared from here.`
    : `${x.name}: cost ${money(x.cost)}, effect ${num(x.effect)}. Against ${x.against}: ${money(x.cost - live.find((y) => y.name === x.against).cost)} more for ${num(x.effect - live.find((y) => y.name === x.against).effect)} more effect = ${money(x.icer)} per unit of effect.`));
  let band; let label;
  if (options.length === 2) {
    const [a, b] = options;
    if (frontier.length === 2) { const top = frontier[1]; band = `A trade-off: ${top.name} does more and costs more than ${top.against}, at ${money(top.icer)} per unit of effect gained.`; label = `${money(top.icer)} per unit`; }
    else if (excluded[0].reason === 'strongly dominated') { band = `${excluded[0].by} is dominant: it ${options.find((y) => y.name === excluded[0].by).cost < options.find((y) => y.name === excluded[0].name).cost ? 'costs less' : 'costs the same'} and does better than ${excluded[0].name}. No ratio is needed.`; label = `${excluded[0].by} dominant`; }
    else { band = `${a.name} and ${b.name} have the same effect; ${excluded[0].by} costs ${a.cost === b.cost ? 'the same' : 'less'}. No ratio can be formed.`; label = 'Equal effect'; }
  } else {
    band = frontier.length === 1
      ? `Only ${frontier[0].name} is left after dominance; there is no ratio to report.`
      : `${frontier.length} of ${options.length} options are left after dominance: ${frontier.map((x) => (x.icer === null ? x.name : `${x.name} (${money(x.icer)})`)).join(', ')}. Ratios are cost per unit of effect against the option before.`;
    label = `${frontier.length} of ${options.length} options left`;
  }
  return {
    valid: true, flag: 'icer', abnormal: false, frontier, excluded: excluded.map(({ name, reason, by }) => ({ name, reason, by })),
    band, bandLabel: label,
    notes: [...lines, ...excluded.map((x) => x.text), 'VA Health Economics Resource Center, Cost-Effectiveness Analysis.'], note: NOTE,
  };
}
