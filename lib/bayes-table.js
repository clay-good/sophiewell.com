// The Bayesian risk table genetic counselors check their work by: prior, conditional, joint, posterior.
// Shared by the spec-v1660 tools so each prints the same table the same way. Bayes' theorem: joint =
// prior × the product of the conditionals; posterior = joint ÷ the sum of the joints.
//
// Pure: no DOM, no clock, no network.

// bayes([{ name, prior, conditionals: [..] }]) -> rows with joint and posterior, or { error }.
export function bayes(hypotheses) {
  const rows = hypotheses.map((h) => ({ ...h, joint: h.conditionals.reduce((p, c) => p * c, h.prior) }));
  const total = rows.reduce((s, r) => s + r.joint, 0);
  if (!(total > 0)) return { error: 'Every joint probability is zero, so there is no posterior. Check the priors and conditionals.' };
  return { rows: rows.map((r) => ({ ...r, posterior: r.joint / total })), total };
}

// "1 in N" for a probability, N rounded to a whole number above 10 and to one decimal below.
export function oneIn(p) {
  if (!(p > 0)) return 'none';
  const n = 1 / p;
  return `1 in ${n >= 10 ? Math.round(n).toLocaleString('en-US') : (Math.round(n * 10) / 10).toLocaleString('en-US')}`;
}

const sig = (x) => Number(x.toPrecision(4));

// One line per hypothesis, for the result notes.
export function tableLines(rows) {
  return rows.map((r) => `${r.name}: prior ${sig(r.prior)} × conditional ${r.conditionals.map(sig).join(' × ') || '1'} = joint ${sig(r.joint)}; posterior ${sig(r.posterior)} (${oneIn(r.posterior)}).`);
}

// A probability typed as a decimal, a percentage ("2%"), a fraction ("1/58") or "1 in 58".
export function parseProbability(raw) {
  const s = String(raw ?? '').trim().toLowerCase();
  if (!s) return null;
  let m = /^1\s*in\s*([\d,]*\.?\d+)$/.exec(s);
  if (m) return 1 / Number(m[1].replace(/,/g, ''));
  m = /^(\d*\.?\d+)\s*\/\s*([\d,]*\.?\d+)$/.exec(s);
  if (m) return Number(m[1]) / Number(m[2].replace(/,/g, ''));
  m = /^(\d*\.?\d+)\s*%$/.exec(s);
  if (m) return Number(m[1]) / 100;
  if (/^\d*\.?\d+$/.test(s)) return Number(s);
  return NaN;
}

// probability(label, raw) -> { value } or { message } naming the field. Zero and one are allowed.
export function probability(label, raw) {
  const v = parseProbability(raw);
  if (v === null) return { message: `Enter ${label}, as a decimal, a percentage, a fraction such as 1/58, or "1 in 58".` };
  if (!Number.isFinite(v)) return { message: `${label.charAt(0).toUpperCase()}${label.slice(1)} is not a probability. Enter it as a decimal, a percentage, a fraction or "1 in N".` };
  if (v < 0 || v > 1) return { message: `${label.charAt(0).toUpperCase()}${label.slice(1)} must be between 0 and 1 (0% to 100%).` };
  return { value: v };
}
