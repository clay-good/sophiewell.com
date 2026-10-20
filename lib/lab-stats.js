// Laboratory statistics shared by the spec-v1658 quality tools: mean, sample standard deviation,
// nearest-rank percentile, an ordinary least-squares line, and a pasted-list parser. One copy, so
// the tools that report a mean or an SD compute it the same way.
//
// Pure: no DOM, no clock, no network.

export const mean = (xs) => xs.reduce((s, x) => s + x, 0) / xs.length;

// Sample SD, n − 1 in the denominator.
export function sampleSd(xs) {
  const m = mean(xs);
  return Math.sqrt(xs.reduce((s, x) => s + (x - m) ** 2, 0) / (xs.length - 1));
}

// Nearest rank: the smallest value with at least p% of the values at or below it, the
// ceil(p / 100 × n)-th value in ascending order.
export function nearestRank(xs, p) {
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.max(1, Math.ceil((p / 100) * s.length)) - 1];
}

export function median(xs) {
  const s = [...xs].sort((a, b) => a - b);
  const k = s.length >> 1;
  return s.length % 2 ? s[k] : (s[k - 1] + s[k]) / 2;
}

// Least squares y = slope × x + intercept, with Pearson r.
export function leastSquares(xs, ys) {
  const mx = mean(xs);
  const my = mean(ys);
  let sxy = 0;
  let sxx = 0;
  let syy = 0;
  for (let i = 0; i < xs.length; i += 1) {
    sxy += (xs[i] - mx) * (ys[i] - my);
    sxx += (xs[i] - mx) ** 2;
    syy += (ys[i] - my) ** 2;
  }
  const slope = sxy / sxx;
  return { slope, intercept: my - slope * mx, r: syy === 0 ? null : sxy / Math.sqrt(sxx * syy) };
}

// Numbers per line, separated by commas or tabs, `width` of them on every line. Returns { rows } as arrays of
// numbers with `width` cells each, or { error } naming the line. A leading date or label cell is
// dropped only when the line has width + 1 cells and that first cell is not a number ("2026-01-02, 98");
// a line of width + 1 numbers is refused rather than having its first number silently thrown away.
export function parseNumberLines(text, width, what) {
  const rows = [];
  const lines = String(text ?? '').split(/\r?\n/);
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i].trim();
    if (!line) continue;
    let cells = line.split(/[,\t]/).map((c) => c.trim());
    if (cells.length === width + 1 && !/^-?\d*\.?\d+$/.test(cells[0])) cells = cells.slice(1);
    if (cells.length !== width) return { error: `Line ${i + 1} needs ${what}.` };
    const nums = [];
    for (const c of cells) {
      if (!/^-?\d*\.?\d+$/.test(c)) return { error: `Line ${i + 1}: "${c}" is not a number.` };
      nums.push(Number(c));
    }
    rows.push(nums);
  }
  return { rows };
}
