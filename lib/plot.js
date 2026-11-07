// The geometry behind the shared plot component (docs/design.md 4, "Plot"): scales, nice ticks and SVG path data
// for one or more line series, in a fixed viewBox the page scales to its width. Pure: no DOM, so the numbers a
// reader sees in the plot's value table and the path drawn from them are tested in Node.

export const VIEW = { width: 320, height: 200, left: 44, right: 10, top: 10, bottom: 34 };

// niceTicks(lo, hi, n) -> about n round tick values covering [lo, hi].
export function niceTicks(lo, hi, n = 5) {
  if (!(hi > lo)) return [lo];
  const raw = (hi - lo) / Math.max(1, n - 1);
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) || 10 * mag;
  // The ticks enclose the data: the first at or below lo, the last at or above hi.
  const first = Math.floor(lo / step + 1e-9) * step;
  const last = Math.ceil(hi / step - 1e-9) * step;
  const out = [];
  for (let i = 0; first + i * step <= last + step * 1e-9; i += 1) out.push(Number((first + i * step).toPrecision(12)));
  return out;
}

// A tick label short enough for the axis: up to four significant figures, no float noise.
export const tickLabel = (v) => {
  if (v === 0) return '0';
  const a = Math.abs(v);
  if (a >= 1e5 || a < 1e-3) return v.toExponential(1);
  return String(Number(v.toPrecision(4)));
};

// geometry({ series: [{ points: [[x, y], ...] }], xLog?, yFromZero? }) -> { paths, xTicks, yTicks, x, y, box } or
// { error }. Non-finite points are dropped; a series with fewer than two points draws nothing.
export function geometry({ series = [], xLog = false, yFromZero = true } = {}) {
  const pts = series.flatMap((s) => (s.points || []).filter(([x, y]) => Number.isFinite(x) && Number.isFinite(y) && (!xLog || x > 0)));
  if (pts.length < 2) return { error: 'Not enough points to draw.' };
  const fx = xLog ? Math.log10 : (v) => v;
  let x0 = Math.min(...pts.map((p) => fx(p[0])));
  let x1 = Math.max(...pts.map((p) => fx(p[0])));
  let y0 = Math.min(...pts.map((p) => p[1]));
  let y1 = Math.max(...pts.map((p) => p[1]));
  if (yFromZero) { y0 = Math.min(0, y0); y1 = Math.max(0, y1); }
  if (x1 === x0) { x0 -= 1; x1 += 1; }
  if (y1 === y0) { y0 -= 1; y1 += 1; }
  const yTicks = niceTicks(y0, y1, 5);
  y0 = Math.min(y0, yTicks[0]);
  y1 = Math.max(y1, yTicks[yTicks.length - 1]);
  const xTicks = xLog
    ? Array.from({ length: Math.floor(x1) - Math.ceil(x0) + 1 }, (_, i) => 10 ** (Math.ceil(x0) + i))
    : niceTicks(x0, x1, 5);
  const box = { x: VIEW.left, y: VIEW.top, w: VIEW.width - VIEW.left - VIEW.right, h: VIEW.height - VIEW.top - VIEW.bottom };
  const sx = (v) => box.x + ((fx(v) - x0) / (x1 - x0)) * box.w;
  const sy = (v) => box.y + box.h - ((v - y0) / (y1 - y0)) * box.h;
  const r = (v) => Math.round(v * 10) / 10;
  const paths = series.map((s) => {
    const p = (s.points || []).filter(([x, y]) => Number.isFinite(x) && Number.isFinite(y) && (!xLog || x > 0));
    return p.length < 2 ? '' : p.map(([x, y], i) => `${i ? 'L' : 'M'}${r(sx(x))} ${r(sy(y))}`).join(' ');
  });
  return {
    paths, box,
    xTicks: xTicks.filter((v) => fx(v) >= x0 - 1e-9 && fx(v) <= x1 + 1e-9).map((v) => ({ v, at: r(sx(v)), label: tickLabel(v) })),
    yTicks: yTicks.map((v) => ({ v, at: r(sy(v)), label: tickLabel(v) })),
    x: { min: xLog ? 10 ** x0 : x0, max: xLog ? 10 ** x1 : x1 },
    y: { min: Math.min(...pts.map((p) => p[1])), max: Math.max(...pts.map((p) => p[1])) },
  };
}

// describe(title, xLabel, yLabel, g) -> the text alternative: what is plotted and over what range.
export function describe(title, xLabel, yLabel, g) {
  return `${title}: ${yLabel} from ${tickLabel(g.y.min)} to ${tickLabel(g.y.max)} as ${xLabel} runs from ${tickLabel(g.x.min)} to ${tickLabel(g.x.max)}. The values are in the table below.`;
}
