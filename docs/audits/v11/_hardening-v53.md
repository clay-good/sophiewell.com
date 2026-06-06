# v53 hardening audit log — output safety & input bounds

spec: [docs/spec-v53.md](../../spec-v53.md). Zero-tile hardening release.
Catalog unchanged (255). No clinical formula, threshold, or rounding precision
changed; every valid-input result is byte-identical (the full unit suite passes
before and after the §4.1 refactor).

## Defect reproductions and fixes

### Class A — non-finite / null leaks into the rendered string (§2.1)

- **`views/group-e.js` shock index / modified shock index** (confirmed).
  `${V4.shockIndex({ hr, sbp })?.toFixed(2)}` rendered the literal `undefined`
  for `sbp = 0` (`shockIndex` returns `null`). Fixed: routed through
  `fmt(..., { fallback: '(enter HR & SBP > 0)' })`. Pinned by
  `test/unit/hardening-v53.test.js`.
- **`lib/scoring-v4.js` `cfs` / `rass`** (found by the fuzz harness, §4.4.2).
  A non-finite `level` clamped to `NaN`, so the rendered band leaked
  `CFS 9 (undefined)` / `RASS NaN`. Fixed: reject a non-finite level up front
  and return a clean "(enter …)" band with `level: null`. Valid input is
  unchanged (the forgiving 1–9 / −5–+4 clamp still applies).

### Class B — physiologically impossible input → silent nonsense (§2.2)

- **`cockcroftGault` scr / `bmi` heightM** (confirmed). The hard `min: 0.01`
  floors (divide-by-zero guards) stay and now carry a comment naming the
  physiologic reason. The renderer (`views/group-e.js`) shows
  `boundsAdvisory('scr', scr)` / `boundsAdvisory('heightM', heightM)`
  (`lib/bounds.js`) as a `.warn` note next to the result for a frankly-impossible
  input (e.g. `scr 0.01`, `height 0.05 m`). The number is not silently clamped;
  the advisory is additive.
- **`pbwArdsnet` sub-Devine height** (confirmed). Below the 60-inch Devine floor
  the linear formula goes non-physical and used to clamp PBW to 0, showing
  `0 kg` / `0 mL` tidal-volume *targets* as if real. Fixed: return
  `null` targets (not 0) and surface the existing `warning` (which the renderer
  had never actually displayed — a second latent bug). The renderer routes the
  fields through `fmt(..., { fallback: '(height too low for PBW)' })`.

### Class C — reference-range floors that never flag a low value (§2.3)

- **`lib/lab-interpret.js` `totalChol` / `ldl` / `triglycerides`** had a bare
  `refLow: 0`. These are genuinely one-sided analytes (a low value is clinically
  benign), so each is now marked `oneSidedLow: true` with a comment — an explicit
  documented choice, not an accidental default.

### Class D — duplicated numeric helpers drift (§2.4)

- `r1` / `r2` / `r3` / `num` were declared identically in `lib/clinical.js` and
  `lib/clinical-v5.js`. (The spec also listed `clinical-v4.js` and `scoring-v4.js`,
  but those never declared or used these helpers — they use inline `Math.round`.)
  All four now have a single source of truth in **`lib/num.js`**, imported where
  used. `fmt()` is added there as the display guard.

## The two gates (§4.4)

1. **`scripts/check-output-safety.mjs`** (wired into `npm run lint`) — bans the
   `)?.toFixed(` / `?.toString(` / `?.toPrecision(` leak fingerprint in
   `views/`. Its detector is unit-tested both ways (it bites on a reintroduced
   pattern and does not flag the safe `fmt()` pattern):
   `test/unit/check-output-safety.test.js`.
2. **`test/unit/fuzz-tools.test.js`** (wired into `npm run test`) — reflection-
   driven; enumerates every export of `clinical*.js`, `medication-v4.js`,
   `scoring-v4.js`, `lab-interpret.js`, `unit-convert.js` (245 functions) and
   drives each with the fixed adversarial matrix.

### Two deliberate, documented deviations from the spec proposal

- **Location/runner.** The spec proposed `test/integration/fuzz-tools.spec.js`,
  but the functions are pure Node (no browser) and the spec requires the harness
  be "wired into `npm run test`" — which runs `test:unit` (node:test), not
  `test:e2e` (Playwright). A Playwright spec would only run in `test:e2e`, so it
  would *not* satisfy that requirement. The harness is therefore a `node:test`
  unit file, correctly in the `npm run test` path.
- **Assertion set.** The matrix passes each adversarial value as the *sole*
  argument. Most compute functions take a single object and destructure it, so a
  scalar argument yields `undefined` fields and a `NaN` return — but that input
  is **not reachable** through any renderer (renderers always pass a populated
  object). Asserting "every numeric field is finite" for the scalar matrix flags
  ~486 such unreachable cases and would force a defensive guard onto 245
  functions for no behavior change — exactly the non-surgical sweep §7 forbids.
  The harness therefore asserts the two invariants that are both meaningful and
  reachable: **throw-safety** (only `TypeError`/`RangeError` may be thrown) and
  **no banned token in a returned string field** (string fields render verbatim).
  The finiteness-on-reachable-input half is enforced where it bites: `fmt()`, the
  output-safety gate, and the confirmed Class-A/B fixes.

### What the harness surfaced and fixed

- **42 functions threw a plain `Error`** for validation (41 in `scoring-v4.js`,
  1 in `medication-v4.js`; plus `interpretLab` in `lab-interpret.js`), violating
  §3.1 ("only the validation errors `TypeError`/`RangeError`"). Normalized:
  range-flavored messages → `RangeError`, type/presence/enum messages →
  `TypeError` (matching `num()`'s convention). No message changed; `TypeError` and
  `RangeError` both extend `Error`, so existing `assert.throws` checks still pass.
- **`cfs` / `rass`** string leaks (above).

## Verification

`npm run lint` (now including `check-output-safety`), `npm run test`
(2,646 unit tests incl. the fuzz harness, `num`, the gate negative-test, and the
v53 acceptance pins), `npm run sbom`, `npm run build`, and the full Playwright
e2e suite all pass. `UTILITIES.length` is still 255.
