# spec-v53.md — Public-tool stress-test & hardening

> Status: proposed (2026-06-05). v53 is a zero-tile hardening
> spec. It adds **no** new tile and changes **no** clinical
> formula. It defines the contract that every public-facing
> compute path must satisfy under adversarial input, fixes the
> concrete output-safety and input-bounds defects found in the
> v52-close audit, and adds two automated gates so the same
> defect class cannot reappear. The catalog count is unchanged.
>
> Catalog effect at v53 close: **255 + 0 = 255 tiles.**
>
> Every prior spec (v4 through v52) remains in force. v53 does
> not touch any clinical result that is already correct: it
> changes only *how* edge inputs are handled and *how* values
> are displayed. No URL changes, no new runtime network call, no
> AI. Sophie's eight commitments ([spec-v50](spec-v50.md) §3)
> are preserved without modification.

## 1. Thesis

Every tile in Sophie is a public function: a user types numbers,
a pure compute function runs, and a string is rendered to the
screen. The catalog has grown to 255 tiles across 12 lib modules
and 11 view groups, and the per-tile correctness work
([spec-v11](spec-v11.md) audits) has verified that each formula
computes the *right answer for valid input*. What has never been
specified as a cross-cutting invariant is what the tiles do for
*invalid* input: zero denominators, empty fields, negative
weights, physiologically impossible labs, and non-finite numbers.

A bedside tool that prints `Shock index (HR/SBP): undefined`, or
`BMI: Infinity kg/m^2`, or `eGFR 13222 mL/min` from a creatinine
of `0.01`, is worse than no tool — it looks authoritative while
being meaningless, and at 3 a.m. the nurse does not always have
the slack to notice. The v52-close audit found three confirmed
classes of this defect and several latent ones. v53 closes the
class, not the instances.

The one-line invariant v53 introduces:

> **No public compute path may render the literal token `NaN`,
> `undefined`, `Infinity`, `-Infinity`, `null`, or `$NaN` to the
> user, and no compute function may throw an unhandled error or
> return a non-finite number that reaches the DOM. Every
> physiologically out-of-range input either produces a clamped
> result with a visible note or a clear "(enter X)" fallback —
> never a silent wrong number.**

v53 passes the v29 §3 scope test trivially (it ships no tile),
and is the hardening counterpart to the citation-integrity work
in [spec-v54](spec-v54.md). The two are independent and may ship
in either order.

## 2. The defect classes (audit findings)

The v52-close stress-test audit drove every exported compute
function with adversarial inputs (`0`, negative, empty string,
`NaN`, `Infinity`, and order-of-magnitude-too-large values).
The confirmed findings, grouped by class:

### 2.1 Class A — non-finite / null leaks into the rendered string

The renderer interpolates a compute result directly into a
template literal using optional chaining, so when the function
returns `null` the DOM shows the literal word `undefined`.

- `views/group-e.js:339` —
  `` `Shock index (HR/SBP): ${V4.shockIndex({ hr, sbp })?.toFixed(2)}` ``
  renders `Shock index (HR/SBP): undefined` when `sbp = 0`.
  (`lib/clinical-v4.js:41` returns `null` for `sbp <= 0`.)
- `views/group-e.js:340` — modified shock index, same pattern,
  renders `undefined` when MAP resolves to `0`.

These are the *confirmed reproductions*. The pattern
(`fn(...)?.toFixed(...)` interpolated into a string) is the
fingerprint; §4.2 bans it.

### 2.2 Class B — physiologically impossible input → silent nonsense

The compute function validates only that the input is a finite
number above a numeric floor chosen to dodge divide-by-zero, not
that it is physiologically plausible. The result is a confident,
wrong number.

- `lib/clinical.js` `cockcroftGault` — accepts `scr` down to
  `0.01 mg/dL`. Input `{ age:50, weightKg:70, scr:0.01, sex:'M' }`
  computes a creatinine clearance of ~13,222 mL/min and renders
  it with no warning. A serum creatinine of 0.01 mg/dL is not a
  survivable value.
- `lib/clinical.js` `bmi` — height floor is the magic constant
  `0.01 m` (0.4 in), purely to dodge a divide-by-zero. Any height
  between 0.01 m and a plausible human minimum produces a BMI in
  the thousands with no note.
- `lib/clinical-v5.js` PBW / ARDSnet tidal-volume path — for
  height below the Devine 60-inch floor the predicted body weight
  is clamped to `0`, so the rendered tidal-volume *targets* become
  `0 mL`. The "use a peds-specific approach" note is present but
  the zeros are shown alongside it as if they were real targets.

### 2.3 Class C — reference-range floors that never flag a low value

`lib/lab-interpret.js` defines several analytes with `refLow: 0`,
so an impossible low value is silently reported "within range":

- `lib/lab-interpret.js:154` `totalChol` `refLow: 0` —
  `interpretLab('totalChol', 5)` → "within the desirable range."
- `lib/lab-interpret.js:159` (HDL-class analyte) `refLow: 0`.
- `lib/lab-interpret.js:173` (LDL-class analyte) `refLow: 0`.

A `refLow: 0` is legitimate for a one-sided analyte (where any
low value is benign), but it must be an explicit, documented
choice, not an accidental default that suppresses a genuinely
implausible reading.

### 2.4 Class D — duplicated numeric helpers drift

The rounding helpers `r1` / `r2` / `r3` and the `num()` range
validator are re-declared, identically, in `lib/clinical.js`,
`lib/clinical-v4.js`, and `lib/clinical-v5.js` (and inlined
ad-hoc in `lib/scoring-v4.js`). They agree today. Nothing keeps
them agreeing: a future rounding fix (e.g., the well-known
`Math.round(0.125*100)/100 === 0.12` float artifact) applied to
one copy silently diverges the others, so two tiles can round the
same intermediate differently. This is a latent correctness bug,
not just a tidiness issue.

### 2.5 Non-findings (audited, confirmed safe — do not "fix")

To keep v53 surgical, these were investigated and are correct as
written; v53 must **not** touch them:

- `feNa` / `feUrea` (`lib/clinical-v4.js:68,72`) already return
  `null` on any non-positive input and the renderer
  (`views/group-e.js:404-405`) already prints
  `(incomplete inputs)` — this is the *correct* pattern and is
  the template §4.1 generalizes.
- `wintersFormula` `NaN`-guarding via `Number.isFinite` is
  correct.
- `rFactorLiver` and the sodium-correction direction-mismatch
  logic are guarded by their range checks and return `null` with
  a warning on bad direction; correct.

## 3. The hardening contract

Every exported function reachable from a `views/group-*.js`
renderer ("a public compute path") must satisfy, for **all**
inputs including adversarial ones:

1. **Total on the happy path, explicit on the sad path.** It
   either returns a finite number / well-formed object, or it
   returns `null` (or a field set to `null`) to signal "not
   computable from this input." It must not return `NaN`,
   `Infinity`, `-Infinity`, or `undefined`, and it must not throw
   an error type other than the validation errors defined in §4.1.
2. **Display fallback, never a leaked token.** The renderer must
   pass every numeric result through the shared `fmt()` helper
   (§4.1), which substitutes a caller-supplied fallback string
   (e.g. `(enter SBP)`, `(incomplete inputs)`) for any
   `null` / non-finite value. The literal tokens `NaN`,
   `undefined`, `Infinity`, `-Infinity`, `null`, `$NaN` must
   never appear in rendered output for any input.
3. **Plausibility, not just finiteness.** Inputs outside a
   documented physiologic envelope (§4.3) produce a *visible*
   note alongside the result, or a refusal — never a silent
   out-of-band number. Hard divide-by-zero floors stay, but every
   such floor gets a one-line comment naming the physiologic
   reason, not just "avoid /0."
4. **One source of truth for arithmetic.** `r1`/`r2`/`r3`,
   `num()`, and `fmt()` live in exactly one module and are
   imported everywhere (§4.1). No module re-declares them.

## 4. What v53 changes

### 4.1 New shared module `lib/num.js`

Extract the duplicated helpers into a single module and export
them. Signatures are unchanged from the existing copies (so no
clinical result moves):

```
export const r1 = (n) => Math.round(n * 10) / 10;
export const r2 = (n) => Math.round(n * 100) / 100;
export const r3 = (n) => Math.round(n * 1000) / 1000;

// unchanged behavior: throws TypeError on non-finite,
// RangeError on out-of-range.
export function num(name, v, { min = -Infinity, max = Infinity } = {});

// NEW: the display guard. value may be number | null | undefined.
// digits: fixed decimals (default null = no rounding).
// unit: appended with a leading space when a value is shown.
// fallback: shown verbatim when value is null/undefined/non-finite.
export function fmt(value, { digits = null, unit = '', fallback = '—' } = {});
```

`fmt(2.345, { digits: 2, unit: 'mL/hr' })` → `"2.35 mL/hr"`.
`fmt(null, { fallback: '(enter SBP)' })` → `"(enter SBP)"`.
`fmt(Infinity, { fallback: '(check inputs)' })` → `"(check inputs)"`.

`lib/clinical.js`, `lib/clinical-v4.js`, `lib/clinical-v5.js`,
and `lib/scoring-v4.js` delete their local `r1`/`r2`/`r3`/`num`
declarations and import from `lib/num.js`. This is a pure
refactor — the test suite must show byte-identical numeric
outputs before and after (§5 acceptance).

### 4.2 Renderer output-safety sweep

Every interpolation of a compute result into a rendered string is
routed through `fmt()`. The two confirmed Class-A sites are fixed
first:

- `views/group-e.js:339-340` — replace
  `${V4.shockIndex({ hr, sbp })?.toFixed(2)}` with
  `${fmt(V4.shockIndex({ hr, sbp }), { digits: 2, fallback: '(enter HR & SBP)' })}`
  and the modified-shock-index line analogously.

A new lint gate (`scripts/check-output-safety.mjs`, §4.4) bans
the `fn(...)?.toFixed(` interpolation fingerprint in `views/` so
the pattern cannot be reintroduced; renderers must use `fmt()`.

### 4.3 Physiologic-bounds table

Add `lib/bounds.js` exporting a single frozen table of
plausibility envelopes for the common physiologic inputs, with a
public source for each bound:

```
export const BOUNDS = Object.freeze({
  scr:      { min: 0.1,  max: 25,   unit: 'mg/dL', note: '...' },
  heightM:  { min: 0.45, max: 2.5,  unit: 'm',     note: '...' },
  weightKg: { min: 0.3,  max: 500,  unit: 'kg',    note: '...' },
  ageYears: { min: 0,    max: 130,  unit: 'yr',    note: '...' },
  hr:       { min: 10,   max: 300,  unit: 'bpm',   note: '...' },
  sbp:      { min: 20,   max: 300,  unit: 'mmHg',  note: '...' },
  // ...extended as tiles are migrated
});
```

The distinction the table encodes: a **hard floor** (below which
the math is undefined — e.g. a zero denominator) still throws or
returns `null`; a **soft envelope** (mathematically defined but
clinically implausible — e.g. `scr 0.01`, `heightM 0.05`) renders
the result **with a visible advisory note** ("input below the
plausible range; verify units"). v53 does not silently clamp a
clinically-plausible value; it only flags the frankly impossible.

Migration is scoped to the three confirmed Class-B sites in v53
(`cockcroftGault` scr, `bmi` heightM, PBW/ARDSnet height); the
remaining tiles adopt `BOUNDS` opportunistically as they are next
edited. v53 does **not** require a 255-tile sweep — that would
violate the surgical-change principle. The table and the two
confirmed-class fixes are the deliverable; the gate (§4.4)
prevents *new* leaks everywhere.

### 4.4 Two automated gates

1. **`scripts/check-output-safety.mjs`** — wired into
   `npm run lint`. Static scan of `views/group-*.js` that fails CI
   on the `?.toFixed(` / `?.toString(` interpolation fingerprint
   and on any template literal that interpolates a bare
   `compute(...)` call without routing through `fmt()`. Allowlist
   for already-safe `fmt(...)`, `(incomplete inputs)` ternaries,
   and string-returning compute functions.
2. **`test/integration/fuzz-tools.spec.js`** — wired into
   `npm run test`. For every exported compute function in
   `lib/clinical*.js`, `lib/medication-v4.js`, `lib/scoring-v4.js`,
   `lib/lab-interpret.js`, and `lib/unit-convert.js`, drive it with
   a fixed adversarial input matrix (`0`, `-1`, `1e9`, `NaN`,
   `Infinity`, `''`, `undefined`, and one valid baseline) and
   assert, for each: (a) it does not throw anything other than
   `TypeError`/`RangeError`; (b) every numeric field of the return
   is finite or exactly `null`; (c) `JSON.stringify(result)`
   contains none of `NaN`, `Infinity`, `undefined`. The harness is
   reflection-driven (it enumerates exports), so a new tile is
   covered automatically the moment its lib module is imported.

### 4.5 `lab-interpret` low-bound documentation

For each `refLow: 0` analyte (`lib/lab-interpret.js:154,159,173`),
either set a real low bound from the cited reference range or add
an explicit `oneSidedLow: true` field and a comment stating that a
low value for this analyte is clinically benign and intentionally
unflagged. No silent `refLow: 0`.

## 5. Files touched

```
docs/spec-v53.md                         (this file)
lib/num.js                               (new: r1/r2/r3, num, fmt)
lib/bounds.js                            (new: BOUNDS table)
lib/clinical.js                          (import helpers; scr/heightM soft-bound notes)
lib/clinical-v4.js                       (import helpers)
lib/clinical-v5.js                       (import helpers; PBW height soft-bound note)
lib/scoring-v4.js                        (import helpers)
lib/lab-interpret.js                     (document/replace refLow:0 analytes)
views/group-e.js                         (route shock-index lines through fmt)
scripts/check-output-safety.mjs          (new lint gate)
scripts/grep-check.mjs                   (register output-safety gate, or call from lint)
package.json                             (lint runs check-output-safety; no count change)
test/integration/fuzz-tools.spec.js      (new reflection-driven fuzz harness)
test/unit/num.test.js                    (new: r1/r2/r3/num/fmt unit tests)
docs/audits/v11/_hardening-v53.md        (audit log: defect repro + fix verification)
CHANGELOG.md                             (Unreleased: v53 entry)
```

No change to `app.js` UTILITIES, README catalog count, or
`package.json` description count — the catalog is unchanged at
255.

## 6. Acceptance criteria

v53 is fully shipped when:

- This file exists.
- `lib/num.js` and `lib/bounds.js` exist; `r1`/`r2`/`r3`/`num`
  are declared in exactly one module (a grep finds a single
  declaration site each) and imported elsewhere.
- The two confirmed Class-A sites (`views/group-e.js:339-340`)
  render a fallback string, not `undefined`, for `sbp = 0`; a
  unit test pins this.
- The three confirmed Class-B sites render a visible advisory
  note for the impossible input (`scr 0.01`, `heightM 0.05`,
  sub-Devine height) rather than a silent number; unit tests pin
  each.
- `test/integration/fuzz-tools.spec.js` enumerates every public
  compute export and passes for the full adversarial matrix; the
  refactor in §4.1 leaves every pre-existing valid-input result
  byte-identical (a golden-output diff is part of the audit log).
- `scripts/check-output-safety.mjs` passes and fails on a
  deliberately reintroduced `?.toFixed(` interpolation (a
  negative test fixture proves the gate bites).
- `npm run lint`, `npm run test`, `npm run sbom`, and
  `npm run build` all pass.
- `UTILITIES.length` is still 255.
- The CHANGELOG records v53 as a zero-tile hardening release.

## 7. Out of scope for v53

- A full 255-tile migration onto `BOUNDS`. v53 fixes the
  confirmed-defect sites and installs the gate that prevents new
  leaks; the rest migrate opportunistically. A blanket sweep
  would touch every tile for no behavior change and violate the
  surgical-change principle.
- Changing any clinical formula, threshold, or rounding
  precision. v53 is behavior-preserving for valid input by
  construction; any result that *moves* is a v53 bug.
- Internationalization of error/fallback strings. The `fmt()`
  fallback is a caller-supplied literal; i18n is a separate
  concern.
- Property-based / generative fuzzing beyond the fixed
  adversarial matrix. A `fast-check`-style generator would add a
  dependency, which the dependency-budget ([spec-v10](spec-v10.md))
  forbids; the fixed matrix is sufficient to catch the defect
  classes in §2.
- Citation correctness and freshness — that is
  [spec-v54](spec-v54.md).
