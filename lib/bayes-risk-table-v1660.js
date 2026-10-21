// spec-v1660 tool 7: a general Bayesian risk table, prior × conditionals, joint and posterior.
//
// Bayes' theorem, an arithmetic identity: for each hypothesis, joint = prior × the product of the conditional
// probabilities of each piece of evidence; posterior = joint ÷ the sum of the joints. Priors must sum to 1
// unless the reader asks for them to be normalized, which the result then says.
//
// Pure: no DOM, no clock, no network.

import { probability, bayes, tableLines } from './bayes-table.js';

// "Carrier, 1/2, 1/2, 1/2" per line: hypothesis, prior, then one conditional per piece of evidence.
export function parseHypotheses(text) {
  const out = [];
  const lines = String(text ?? '').split(/\r?\n/);
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i].trim();
    if (!line) continue;
    const c = line.split(/[,\t]/).map((x) => x.trim());
    if (c.length < 2 || !c[0]) return { error: `Line ${i + 1} needs a hypothesis, its prior, and then its conditional probabilities, such as Carrier, 1/2, 1/2.` };
    const vals = [];
    for (const [j, raw] of c.slice(1).entries()) {
      const p = probability(j === 0 ? `line ${i + 1}'s prior` : `line ${i + 1}'s conditional ${j}`, raw);
      if (p.message) return { error: p.message };
      vals.push(p.value);
    }
    out.push({ name: c[0], prior: vals[0], conditionals: vals.slice(1) });
  }
  return { hypotheses: out };
}

export function bayesRiskTable(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const p = parseHypotheses(o.hypotheses);
  if (p.error) return { valid: false, message: p.error };
  const hs = p.hypotheses;
  if (hs.length < 2) return { valid: false, message: 'Enter at least two hypotheses, one per line.' };
  const k = hs[0].conditionals.length;
  if (hs.some((h) => h.conditionals.length !== k)) return { valid: false, message: 'Every line needs the same number of conditional probabilities, one per piece of evidence.' };
  const sum = hs.reduce((s, h) => s + h.prior, 0);
  const notes = [];
  if (Math.abs(sum - 1) > 1e-6) {
    if (o.normalize !== 'yes') return { valid: false, message: `The priors add up to ${Number(sum.toPrecision(6))}, not 1. Correct them, or choose to normalize them.` };
    for (const h of hs) h.prior /= sum;
    notes.push(`The priors added up to ${Number(sum.toPrecision(6))} and were divided by that sum.`);
  }
  const t = bayes(hs);
  if (t.error) return { valid: false, message: t.error };
  const top = [...t.rows].sort((a, b) => b.posterior - a.posterior)[0];
  return {
    valid: true, posteriors: t.rows.map((r) => ({ name: r.name, posterior: Number(r.posterior.toPrecision(6)) })), abnormal: false,
    band: `Posteriors: ${t.rows.map((r) => `${r.name} ${Number(r.posterior.toPrecision(4))}`).join('; ')}. Most probable: ${top.name}.`,
    bandLabel: `${top.name} ${Number(top.posterior.toPrecision(3))}`,
    notes: [...notes, ...tableLines(t.rows)],
    note: `Bayes' theorem over ${k} piece${k === 1 ? '' : 's'} of evidence, each assumed independent given the hypothesis.`,
  };
}
