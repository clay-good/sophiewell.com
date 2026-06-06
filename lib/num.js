// spec-v53 §4.1: the single source of truth for Sophie's numeric helpers.
//
// Before v53, `r1`/`r2`/`r3` and `num()` were declared identically in both
// `lib/clinical.js` and `lib/clinical-v5.js`. They agreed, but nothing kept
// them agreeing -- a future rounding fix applied to one copy would silently
// diverge the other, so two tiles could round the same intermediate
// differently (spec-v53 §2.4, a latent correctness bug). They now live here and
// are imported everywhere; no other module re-declares them.
//
// The signatures of `r1`/`r2`/`r3`/`num` are byte-identical to the old copies,
// so no clinical result moves (spec-v53 §4.1 / §5 acceptance: valid-input
// outputs are unchanged). `fmt()` is new -- the display guard that keeps
// `NaN` / `undefined` / `Infinity` out of rendered output (spec-v53 §3.2).

export const r1 = (n) => Math.round(n * 10) / 10;
export const r2 = (n) => Math.round(n * 100) / 100;
export const r3 = (n) => Math.round(n * 1000) / 1000;

// Validate a numeric input. Throws TypeError on a non-finite value and
// RangeError when out of [min, max]. Behavior unchanged from the pre-v53 copies.
export function num(name, v, { min = -Infinity, max = Infinity } = {}) {
  if (typeof v !== 'number' || !Number.isFinite(v)) throw new TypeError(`${name} must be a finite number`);
  if (v < min || v > max) throw new RangeError(`${name} out of range [${min}, ${max}]`);
  return v;
}

// spec-v53 §3.2 / §4.1: the display guard. Every numeric result a renderer
// interpolates into a string must pass through here, so a `null` / `undefined`
// / non-finite value becomes the caller-supplied `fallback` string instead of
// leaking the literal token `NaN` / `undefined` / `Infinity` to the user.
//
//   fmt(2.345, { digits: 2, unit: 'mL/hr' })    -> "2.35 mL/hr"
//   fmt(null,  { fallback: '(enter SBP)' })      -> "(enter SBP)"
//   fmt(Infinity, { fallback: '(check inputs)' })-> "(check inputs)"
//   fmt(7,     { unit: 'mmHg' })                 -> "7 mmHg"
//
// `digits` (default null) applies a fixed number of decimals via toFixed;
// null leaves the number as-is. `unit` is appended with a leading space only
// when a value is actually shown.
export function fmt(value, { digits = null, unit = '', fallback = '--' } = {}) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  const shown = digits == null ? String(value) : value.toFixed(digits);
  return unit ? `${shown} ${unit}` : shown;
}
