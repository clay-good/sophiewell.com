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

// spec-v1170: is (y, mo, d) a real day on the calendar?
//
// This is the one rule this file exists to hold once, because it had been
// written four times and only one copy was right. `new Date(2026, 12, 45)` and
// `Date.UTC(2026, 12, 45)` do not fail on a month of 13 or a day of 45 -- they
// ROLL OVER, silently, to 2027-02-14. So a shape test (`\d{4}-\d{2}-\d{2}`)
// followed by a Date constructor accepts every impossible date there is and
// answers from a different one:
//
//   rosendaal-ttr  one line typed 2026-02-30 in a 20-day INR record
//                  -> "TTR 88.3% -- 53 of 60 days in range"   (was 80% of 20)
//   preg-dating    LMP 2026-13-45 -> EDD 2027-11-21, redate by the ultrasound
//
// `lib/deadline.js`'s parseIsoStrict was the copy that got it right, by
// round-tripping the components back out of the Date. Counting the days in the
// month says the same thing without constructing anything, and says it for the
// two parsers that accept shapes parseIsoStrict does not (`2026-3-4`,
// `3/14/2026`).
const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
export function isRealYmd(y, mo, d) {
  if (!Number.isInteger(y) || !Number.isInteger(mo) || !Number.isInteger(d)) return false;
  if (mo < 1 || mo > 12 || d < 1) return false;
  const leap = mo === 2 && ((y % 4 === 0 && y % 100 !== 0) || y % 400 === 0);
  return d <= (leap ? 29 : DAYS_IN_MONTH[mo - 1]);
}

// The strict `YYYY-MM-DD` form of the same rule: the shape AND the calendar.
// Returns { y, mo, d } or null. Callers that need a different shape (a
// single-digit month, a US-format date) call isRealYmd on their own parts.
export function ymd(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso));
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  return isRealYmd(y, mo, d) ? { y, mo, d } : null;
}

// spec-v1170: the same question for a moment in time rather than a day.
//
// `new Date(x)` will parse almost anything the engine feels like -- `3/14/2026`,
// `March 14 2026`, `2026` -- and hand back a timestamp. The browser can only
// ever send the `datetime-local` shape, so the tiles that take a timestamp had
// never met the others; an agent could, and `restraint-timer` answered
// `3/14/2026` with a face-to-face deadline of 06:00 UTC -- a time of day nobody
// entered, on a clock that 42 CFR 482.13(e) counts in hours.
//
// So: the shape the control produces, the calendar checked, and the clock in
// range. Returns a Date or null. A bare offset-less string stays LOCAL, which is
// what `datetime-local` means and what the bedside reader typed.
export function localTimestamp(s) {
  const m = /^(\d{4})-(\d{1,2})-(\d{1,2})[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2})?$/
    .exec(String(s).trim());
  if (!m) return null;
  const [y, mo, d, hh, mi] = [1, 2, 3, 4, 5].map((i) => Number(m[i]));
  const ss = m[6] === undefined ? 0 : Number(m[6]);
  if (!isRealYmd(y, mo, d) || hh > 23 || mi > 59 || ss > 59) return null;
  const dt = m[7]
    ? new Date(`${m[1]}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}T${m[4]}:${m[5]}:${String(ss).padStart(2, '0')}${m[7]}`)
    : new Date(y, mo - 1, d, hh, mi, ss);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

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
