// Whole tablets that make a dose exactly, from the strengths a pharmacy stocks: the fewest tablets, then
// the larger strengths. A dose no combination makes exactly gets no answer (no rounding, no splitting).
// Used by the titration and taper calendars. Not a tool of its own.
// Pure.

// parseStrengths('25, 50, 100 mg') -> [100, 50, 25], or { message }.
export function parseStrengths(text) {
  const parts = String(text ?? '').replace(/mg/gi, '').split(/[,;\s]+/).map((x) => x.trim()).filter(Boolean);
  if (!parts.length) return { message: 'Enter the tablet strengths in mg, separated by commas.' };
  const out = [];
  for (const p of parts) {
    const n = Number(p);
    if (!Number.isFinite(n) || n <= 0 || n > 10000) return { message: `Enter each tablet strength as a number of mg above 0; "${p}" is not one.` };
    if (!out.includes(n)) out.push(n);
  }
  if (out.length > 8) return { message: 'Enter at most 8 tablet strengths.' };
  return { strengths: out.sort((a, b) => b - a) };
}

// tabletsFor(75, [50, 25]) -> { count: 2, combo: [[50, 1], [25, 1]], text: '1 × 50 mg + 1 × 25 mg' } or null.
export function tabletsFor(dose, strengths) {
  const d = Number(dose);
  if (!Number.isFinite(d) || d < 0 || !Array.isArray(strengths) || !strengths.length) return null;
  if (d === 0) return { count: 0, combo: [], text: 'none' };
  // Work in hundredths of a mg so 12.5 and 0.5 mg tablets are exact.
  const T = Math.round(d * 100); const S = strengths.map((s) => Math.round(s * 100));
  if (T > 2000000) return null;
  const best = new Array(T + 1).fill(Infinity); const pick = new Array(T + 1).fill(-1); best[0] = 0;
  for (let t = 1; t <= T; t += 1) {
    for (let i = 0; i < S.length; i += 1) {
      const s = S[i];
      if (s <= t && best[t - s] + 1 < best[t]) { best[t] = best[t - s] + 1; pick[t] = i; }
    }
  }
  if (!Number.isFinite(best[T]) || best[T] > 40) return null;
  const n = new Array(S.length).fill(0);
  for (let t = T; t > 0; t -= S[pick[t]]) n[pick[t]] += 1;
  const combo = strengths.map((s, i) => [s, n[i]]).filter(([, k]) => k > 0);
  return { count: best[T], combo, text: combo.map(([s, k]) => `${k} × ${s} mg`).join(' + ') };
}
