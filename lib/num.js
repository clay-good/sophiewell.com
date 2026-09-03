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

// Overflow guard (spec-v183 §4.5, MCP fuzz battery): for any clinical-range `n`
// the scaled rounding is finite and the result is byte-identical to the pre-v53
// copies, so no valid result moves. Only a float64-saturating magnitude (|n| >=
// ~1e305, never a real measurement) would overflow `n * scale` to +/-Infinity;
// there the rounding is already a no-op, so we return `n` unchanged rather than
// leak an `Infinity` token into an interpolated band string.
const safeRound = (n, scale) => {
  const x = Math.round(n * scale) / scale;
  return Number.isFinite(x) ? x : n;
};
export const r1 = (n) => safeRound(n, 10);
export const r2 = (n) => safeRound(n, 100);
export const r3 = (n) => safeRound(n, 1000);

// spec-v184 §4.5: US-format an ISO `yyyy-mm-dd` date for display. The string is
// parsed directly (no `Date` round-trip, so no timezone shift) and a non-ISO
// input is returned unchanged. The canonical/ISO value the compute returns is
// never altered -- only its rendered presentation. `usDate` -> MM/DD/YYYY (the
// numeric US convention); `usDateLong` -> "Mon D, YYYY" (US business-letter).
const US_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export function usDate(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso));
  return m ? `${m[2]}/${m[3]}/${m[1]}` : String(iso);
}
export function usDateLong(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso));
  if (!m) return String(iso);
  return `${US_MONTHS[Number(m[2]) - 1] || m[2]} ${Number(m[3])}, ${m[1]}`;
}

// Validate a numeric input. Throws TypeError on a non-finite value and
// RangeError when out of [min, max].
//
// spec-v1015: these two messages are READER-FACING. Every view wraps its
// renderer in a `safe()` that prints `err.message` into the answer region, so
// "weightKg out of range [0.3, 500]" and "gcs must be a finite number" were what
// a nurse saw when a value was implausible -- a refusal in the words of a stack
// trace, from the tool that is supposed to be the plain-language one. The
// refusals themselves were right; only the language was wrong.
//
// The name is the caller's argument name and there are 695 distinct ones, so it
// is spaced at camelCase boundaries rather than translated: `weightKg` becomes
// "weight kg", `deductibleRemainingCents` becomes "deductible remaining cents".
// Imperfect for an acronym (`scr` stays `scr`), never misleading, and the
// sentence around it now carries the meaning. The thrown TYPES are unchanged --
// the suites assert RangeError and TypeError, not the wording.
function readable(name) {
  return String(name)
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    // A camel segment that is an ordinary word ("Kg", "Remaining") reads better
    // lowercased mid-sentence; a run of capitals is an acronym (ULN, BMI) and is
    // left exactly as the caller wrote it.
    .replace(/\b([A-Z])([a-z]+)\b/g, (m, a, rest) => a.toLowerCase() + rest)
    .replace(/\s+/g, ' ')
    .trim();
}
export function num(name, v, { min = -Infinity, max = Infinity } = {}) {
  const label = readable(name);
  if (typeof v !== 'number' || !Number.isFinite(v)) throw new TypeError(`${label} must be a number.`);
  if (v < min || v > max) {
    const bounds = (min > -Infinity && max < Infinity) ? `between ${min} and ${max}`
      : (max < Infinity ? `no more than ${max}` : `at least ${min}`);
    throw new RangeError(`${label} must be ${bounds}. Check the value entered.`);
  }
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
