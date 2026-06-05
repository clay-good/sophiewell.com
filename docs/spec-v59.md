# spec-v59.md — Full-catalog stress-test sweep & PA-toolchain hardening

> Status: proposed (2026-06-05). v59 is a zero-tile hardening
> spec. It adds **no** new tile and changes **no** clinical
> formula. It finishes the job [spec-v53](spec-v53.md) began but
> deliberately scoped out — the *full-catalog* migration onto the
> output-safety and physiologic-bounds contract — and extends that
> contract for the first time to the **prior-authorization (PA)
> document-linter toolchain** (`lib/pa/`, `views/pa-lint.js`),
> which v53 never covered. The catalog count is unchanged.
>
> Catalog effect at v59 close: **307 + 0 = 307 tiles.**
>
> Every prior spec (v4 through v58) remains in force. v59 does not
> touch any clinical result that is already correct for valid
> input: it changes only how edge inputs are handled, how values
> are displayed, and how the PA pipeline behaves under hostile
> input. No URL change, no new runtime network call, no AI.
> Sophie's eight commitments ([spec-v50](spec-v50.md) §3) are
> preserved without modification. v59 ships no tile and passes the
> [spec-v29](spec-v29.md) §3 scope test vacuously.

## 1. Thesis

[spec-v53](spec-v53.md) defined the public-compute hardening
contract — "no `NaN`/`undefined`/`Infinity` reaches the DOM; every
physiologically impossible input produces a clamped result with a
visible note or an explicit fallback, never a silent wrong number"
— and then, by design, fixed only the **confirmed-defect sites**
and installed the gates that stop *new* leaks. Its §7 said so
explicitly: "A full 255-tile migration onto `BOUNDS` … the rest
migrate opportunistically."

That deferral was correct at the time and is now the open work.
Since v53, the catalog has been planned up to **307 tiles**
(v55–v58 add 52), the v53 gates have shipped, and a fresh
stress-test of the *whole* surface — not just the v53 sites —
finds three things:

1. The output-safety **fingerprint** (`?.toFixed(`) is gone, but
   safety at ~50 render sites now depends on the backing compute
   function *throwing* and being caught by a per-renderer
   `safe()` wrapper. Two sites have already slipped that net and
   render a magic-constant number, not a fallback.
2. The Class-B "impossible-input → confident wrong number" class
   is **not** closed. `lib/bounds.js` defines only 6 of the ~30
   physiologic envelopes the catalog actually consumes, is wired
   at only 3 render sites, and a `Number(x) || <default>` idiom in
   `lib/scoring-v4.js` lets several scores emit a band from *no
   entered data at all*.
3. The PA toolchain — a genuinely public surface where a user
   pastes or uploads a payer document — has **never** been
   stress-tested by spec. Its real exposure is not a crash; it is
   a **privacy default**: the report a nurse downloads by default
   echoes raw extracted PHI.

v59 closes the class across the full catalog and brings the PA
toolchain under the same contract.

The one-line invariant v59 adds to the v53 contract:

> **The v53 output-safety and physiologic-plausibility contract
> holds for every one of the 307 catalog tiles and for the PA
> document pipeline; no result is rendered whose safety depends
> only on an exception being thrown; no score reports a band from
> an empty instrument; and no PHI leaves the PA tool in a report
> the user did not explicitly ask to contain it.**

## 2. What the v53 sweep deferred (now in scope)

v53's gates shipped and are working — these are confirmed and v59
does **not** re-do them:

- `lib/num.js` (`r1`/`r2`/`r3`/`num`/`fmt`) and `lib/bounds.js`
  (`BOUNDS`/`boundsAdvisory`) exist.
- `scripts/check-output-safety.mjs` is in `npm run lint`; the
  `?.toFixed(` fingerprint is eradicated from `views/group-*.js`.
- The three v53 Class-B sites (`bmi` height, `cockcroftGault` /
  `egfr` scr) carry hard-floor comments and `boundsAdvisory`
  render wiring.
- The Class-C `refLow: 0` analytes (`totalChol`, `ldl`,
  `triglycerides`) now carry `oneSidedLow: true` + a comment.
- A reflection-driven fuzz harness shipped — but at
  `test/unit/fuzz-tools.test.js`, **not** the
  `test/integration/fuzz-tools.spec.js` path v53 §4.4.2 named.

What v53 left, confirmed by the v58-close stress-test:

### 2.1 Class A residual — magic-constant numbers, not fallbacks

Two live render sites print a magic-default number instead of a
fallback, because the backing function returns a constant rather
than `null` for missing input:

| # | file:line | tile / fn | defect |
|---|---|---|---|
| A-1 | `views/group-g.js:2282` | `hacor` | `PaO2/FiO2 ${r.pfRatio.toFixed(0)}` renders `0` as a real ratio when FiO₂ ≤ 0; `lib/scoring-v4.js:1773` returns `pfRatio: 0` (magic) instead of `null` |
| A-2 | `views/group-g.js:2353` | `lisMurray` | same pattern; `lib/scoring-v4.js:1862` substitutes the magic constant `pfRatio: 300` when FiO₂ ≤ 0, rendering a fictitious P/F of 300 |

Both are fixed by (a) returning `null` for the missing-input case
in the compute function and (b) routing the render through
`fmt(r.pfRatio, { digits: 0, fallback: '(enter PaO₂ & FiO₂)' })`.
`views/group-g.js:2314` already guards the same field with
`if (r.pfRatio != null)` — that is the correct pattern to copy.

The remaining ~50 unguarded `.toFixed()` sites (enumerated in the
v59 audit log) are *throw-safe today* — they work only because the
lib function throws `TypeError`/`RangeError` and the renderer's
`safe()` wrapper prints the message. v59 routes them through
`fmt()` so correctness no longer depends on the throw/`safe()`
coupling. This is mechanical and behavior-preserving for valid
input.

### 2.2 Class B — impossible-but-finite input → confident wrong number

Two sub-patterns, both unmitigated outside the three v53 sites.

**B1 — unbounded `clinical*.js` math.** Functions validated only
against a divide-by-zero floor with `max: Infinity`:

| # | file:line | fn | reproduction |
|---|---|---|---|
| B1-1 | `lib/clinical.js:95` | `correctedSodium` | `{ measuredNa: 140, glucose: 1e9 }` → `naBy1_6 = 16,000,138.4`, rendered verbatim |
| B1-2 | `lib/clinical.js:89` | `correctedCalcium` | no bound on `measuredCa`/`albumin` → returns `1e9` |
| B1-3 | `lib/clinical.js:72` | `map` | `{ sbp: 1e9, dbp: 1e9 }` → `1e9` |
| B1-4 | `lib/clinical.js:103` | `aaGradient` | no max on `paco2`/`pao2` |
| B1-5 | `lib/clinical.js:125` | `cockcroftGault` | `scr 0.01` → ~8,750 mL/min (advisory wired only at one of its render sites) |

**B2 — `Number(x) || <default>` masks an empty instrument.** In
`lib/scoring-v4.js`, a blank/zero/`NaN` field becomes a
clinically-meaningful default, so a score is emitted from no data:

| # | file:line | fn | reproduction |
|---|---|---|---|
| B2-1 | `lib/scoring-v4.js:1776` | `hacor` | `Number(ph) \|\| 7.4` — blank pH scored as normal |
| B2-2 | `lib/scoring-v4.js:1777` | `hacor` | `Number(gcs) \|\| 15` — blank GCS scored as 15; **all-empty input → `score: 6, "high risk of NIV failure"`** |
| B2-3 | `lib/scoring-v4.js:1867` | `lisMurray` | `Number(compliance) \|\| 80` — blank compliance scored near-normal |

A census of the `Number(x) || default` idiom in `scoring-v4.js`
finds ~58 sites; the 6 that default to a *clinically loaded
non-zero* value (lines 1776, 1777, 1867, 2228, 2229, 2230) are the
dangerous ones and are the v59 fix set. The remaining sites that
default to `0` are reviewed but only changed where `0` is itself a
loaded value for that instrument.

The fix is the v53 pattern, applied for real: a continuous
physiologic input that is absent makes the function return `null`
(→ `fmt()` fallback "(complete all N inputs)"); a present-but-
implausible input renders the result with a `boundsAdvisory()`
note. v59 does **not** silently clamp a clinically plausible
value.

### 2.3 Class C — confirmed closed; add a regression assertion only

The three `oneSidedLow` analytes landed (`lib/lab-interpret.js:157,
163,178`). v59 adds one regression test asserting `interpretLab`
honors `oneSidedLow` (suppresses the low-flag rather than silently
reporting "within range" for an impossibly low value) — and no
new silent `refLow: 0` is introduced.

### 2.4 Class D residual — helper duplication still drifting

`lib/num.js` is imported by `clinical.js`, `clinical-v4.js`,
`clinical-v5.js`. Still re-declaring the helpers:

| # | file:line | symbol | note |
|---|---|---|---|
| D-1 | `lib/field.js:3` | `const r2 = …` | re-declared |
| D-2 | `lib/field.js:4` | `const r3 = …` | re-declared |
| D-3 | `lib/field.js:6` | `function num(…, { min = 0 })` | re-declared **and already diverged** — its default `min: 0` differs from `num.js`'s `min: -Infinity`; this is exactly the drift v53 §2.4 warned about |
| D-4 | `lib/scoring-v4.js:3813` | `const round1 = …` | inlines `r1` under a different name |
| D-5 | `lib/scoring-v4.js:3891` | `const round1 = …` | duplicate #2 |
| D-6 | `lib/scoring-v4.js:3938` | `const round1 = …` | duplicate #3 |

`lib/scoring-v4.js` does not import `num.js` at all. v59 makes
both modules import `r1`/`r2`/`r3`/`num` from `lib/num.js` and
deletes the local copies. `field.js`'s callers that relied on the
`min: 0` default pass an explicit `{ min: 0 }`, so no result moves.

### 2.5 BOUNDS coverage — 6 of ~30

`lib/bounds.js` defines `scr`, `heightM`, `weightKg`, `ageYears`,
`hr`, `sbp` only. The catalog actively consumes, with no envelope:
`glucose`, `sodium`, `potassium`, `chloride`, `bicarbonate`,
`calcium`, `magnesium`, `phosphate`, `albumin`, `bilirubin`,
`platelets`, `INR`, `lactate`, `paO2`, `paCO2`, `pH`, `FiO2`
(max 1.0), `dbp`, `temperature`, `qtMs`, `RR`, `GCS`, `hemoglobin`,
`hematocrit`, `WBC`, `BUN`, plus the high-bound for `eGFR`. v59
expands `BOUNDS` to the full set, each with a one-line physiologic
`note` and a public source, and wires `boundsAdvisory()` into the
render sites for the Class-B fixes above.

### 2.6 Fuzz-harness gaps

`test/unit/fuzz-tools.test.js` has two structural holes:

1. **Scalar-only matrix.** It passes each adversarial value as the
   *sole* argument. Because nearly every compute function takes a
   destructured *object*, the scalar yields all-`undefined` fields
   and never exercises the realistic "valid object with one
   impossible field" path (e.g. `{ glucose: 1e9 }`). It therefore
   does not assert numeric-field finiteness on *reachable* input —
   exactly the half of the v53 invariant that catches Class B.
2. **Module coverage.** It enumerates only `clinical`,
   `clinical-v4`, `clinical-v5`, `medication-v4`, `scoring-v4`,
   `lab-interpret`, `unit-convert` — and skips `field.js`,
   `derivation.js`, `screener.js`, `coding-v5.js`, `regulatory.js`,
   `table.js`, `tree.js`, `prompt.js`, `workflow-v4.js`.

v59 rewrites the harness to (a) build an **object-aware**
adversarial matrix per function (each known field driven through
`0`, `-1`, `1e9`, `NaN`, `Infinity`, `''`, plus a valid baseline,
holding the others valid) and assert every numeric return field is
finite or exactly `null`; and (b) cover all 16 lib modules. It is
moved to the v53-named path `test/integration/fuzz-tools.spec.js`
(or the deviation is recorded once in the audit log and the path
kept) and remains in the test run.

### 2.7 Uncovered public surfaces

These take user input and render a result but were outside v53's
module list and have zero adversarial coverage: `lib/screener.js`
(`bandFor` can return `null` outside all bands — verify the render
path), `lib/coding-v5.js`, `lib/field.js` (Field-Medicine dosing,
with its diverged `num`), `lib/regulatory.js`
(`breachNotificationDeadlines` date/count input),
`lib/workflow-v4.js` (string builders that can interpolate
`undefined` into a generated discharge/HIPAA document),
`lib/derivation.js` (the "show your work" panel can render `NaN`
even when the headline result is `fmt()`-guarded). v59 brings each
into the fuzz harness and routes any user-value interpolation in
`derivation.js` / `workflow-v4.js` through `fmt()`.

## 3. PA-toolchain hardening (new surface)

The PA document-linter (`lib/pa/`, driven by `views/pa-lint.js`)
is a public tool: a user drops payer prior-auth files, and the
pipeline `buildBundle → runEngine → buildReport` extracts,
classifies, redacts, and reports. It is determinism-clean and has
**no catastrophic ReDoS** (verified). Its real defects are
privacy and unbounded work.

### 3.1 PHI default — the highest-severity finding

`views/pa-lint.js:319` wires the default "Download report" buttons
to `buildJsonReport` / `buildDocxReport`, which emit
`extractedData: d.extract` (`lib/pa/report.js:168`) and the raw
`evidenceLedger` with `patientName`/`dob`/`memberId`
(`report.js:106-108`); the DOCX renders the full extract appendix
(`lib/pa/docx.js:250`). **Redaction is a separate, third button.**
A nurse exporting "the report" to attach or share therefore gets
full PHI by default.

**v59 decision:** the *default* export is the redacted report.
The raw-PHI export remains available but is reached only behind an
explicit, labeled action (a "include PHI — for internal use"
toggle or a confirm step). Equivalently, `extractedData` /
`evidenceLedger` PHI fields are redacted unconditionally in the
default builder and surfaced raw only via the explicit path. A
test pins the policy: the default report contains none of the
extracted `patientName`/`dob`/`memberId`/SSN values.

### 3.2 Redaction coverage gaps

`lib/pa/redact.js` redaction is correct where it fires but
under-covers (each verified by probe):

| # | file:line | gap |
|---|---|---|
| R-1 | `redact.js:46` | addresses redacted only on a labeled `Address:` line; `lives at 123 Main St, Springfield, IL 62704` passes through |
| R-2 | `redact.js:40` | DOB redacted only when labeled; `born 03/12/1985` passes through |
| R-3 | `redact.js:42` | member-ID / MRN value capture caps at 20 chars, leaking the overflow: `Member ID: 1234…(24 digits)` → `[REDACTED]1234` |
| R-4 | `redact.js:32` | phone pattern is US-NANP only; `+44 20 7946 0958` passes through |
| R-5 | `extract.js:156` | `extractPatientName` stops at the first comma/digit, so the literal-name redaction set under-captures (`Doe, Jane Q` → only `Doe`) |

v59 widens these patterns (unlabeled street/ZIP heuristic;
international phone; ID capture to a word boundary; name capture
across `Last, First`) and documents the residual known limit
(free-form names in note bodies are best-effort).

### 3.3 Unbounded work on hostile input

| # | file:line | issue | fix |
|---|---|---|---|
| U-1 | `lib/pa/extract.js:131,145,121` | `extractDates` / `extractServiceDates` / `extractPosCodes` are uncapped `matchAll` loops; a multi-MB repeated-date document builds a multi-million-element array that lands in the report | apply the existing `uniqueMatches` cap (`extract.js:37`) to these extractors |
| U-2 | `views/pa-lint.js:159` | PDF page-text join is unbounded over page and item count | cap combined extracted-text length and page count; surface a "truncated" flag |
| U-3 | `views/pa-lint.js:379` | binary/non-UTF8 `.txt` runs the full engine over U+FFFD garbage | pre-gate on the `countReplacementChars` ratio already computed at `extract.js:292` |
| U-4 | `lib/pa/ocr.js` (`ocrScannedPdf`) | no OCR page-count ceiling or abort | cap OCR pages; offer cancel |
| U-5 | `lib/pa/rules.js` (~40 overlay rules) | each re-compiles and re-scans full `d.text` for NDC/signature → O(rules × text) on large packets | hoist NDC/signature presence into `extractAll` once; rules read the precomputed field |

### 3.4 A regex-timing regression guard

Current patterns are safe, but nothing stops a future rule adding
a catastrophically backtracking regex. v59 adds a test that runs
the extractor and rule engine against a pathological 1 MB input
and asserts completion under a fixed wall-clock budget.

## 4. What v59 changes (summary)

1. **Compute functions** (`lib/clinical.js`, `lib/scoring-v4.js`):
   the B1/B2 functions return `null` for absent/impossible input
   instead of a magic default; A-1/A-2 return `null` `pfRatio`.
2. **`lib/bounds.js`**: expand `BOUNDS` from 6 to the full ~30
   physiologic envelopes; each with a sourced `note`.
3. **Renderers**: route the two live Class-A sites and the
   throw-safe `.toFixed()` sites through `fmt()`; wire
   `boundsAdvisory()` at the Class-B render sites; route
   `derivation.js` / `workflow-v4.js` user-value interpolation
   through `fmt()`.
4. **`lib/num.js` adoption**: `field.js` and `scoring-v4.js`
   import the helpers; local copies deleted; `field.js` callers
   pass explicit `{ min: 0 }` where they relied on the old
   default.
5. **Fuzz harness**: object-aware matrix asserting numeric-field
   finiteness; all 16 lib modules covered; at the v53-named path.
6. **PA toolchain**: redacted-by-default export; widened
   redaction patterns; capped extractors / OCR pages / PDF text;
   hoisted NDC/signature scan; new adversarial + regex-timing
   tests.

## 5. Files touched

```
docs/spec-v59.md                         (this file)
lib/bounds.js                            (expand BOUNDS 6 -> ~30 with sourced notes)
lib/clinical.js                          (correctedSodium/Calcium/map/aaGradient bounds; null on impossible)
lib/scoring-v4.js                        (hacor/lisMurray null pfRatio + empty-instrument refusal; import num.js; delete round1 x3)
lib/field.js                             (import r2/r3/num from num.js; delete local copies)
lib/derivation.js                        (route inputs interpolation through fmt)
lib/workflow-v4.js                       (route user-field interpolation through fmt)
views/group-g.js                         (hacor/lisMurray pfRatio via fmt; boundsAdvisory wiring)
views/group-e.js                         (route throw-safe .toFixed sites through fmt; boundsAdvisory)
views/group-f.js                         (route throw-safe .toFixed sites through fmt)
lib/pa/report.js                         (redact extractedData/evidenceLedger PHI in default builder)
lib/pa/redact.js                         (widen address/DOB/ID/phone patterns)
lib/pa/extract.js                        (cap dates/serviceDates/pos extractors; widen patientName)
lib/pa/rules.js                          (read precomputed NDC/signature field; stop per-rule full-text scans)
views/pa-lint.js                         (default = redacted export; explicit PHI toggle; cap PDF text/pages)
lib/pa/ocr.js                            (cap OCR pages; abort)
test/integration/fuzz-tools.spec.js      (object-aware matrix, all 16 modules — v53-named path)
test/unit/pa-redact.test.js              (negative cases: unlabeled address/DOB, intl phone, long-ID overflow)
test/unit/pa-report.test.js              (default report contains no extracted PHI)
test/integration/pa-stress.spec.js       (empty / multi-MB / binary / date-extreme; regex-timing budget)
test/unit/lab-interpret.test.js          (oneSidedLow regression assertion)
scripts/check-output-safety.mjs          (extend fingerprint to bare `.toFixed(` on magic-default fields)
docs/audits/v11/_hardening-v59.md        (audit log: full-catalog sweep + PA repros + fix verification)
CHANGELOG.md                             (Unreleased: v59 entry, zero-tile)
```

No change to `app.js` UTILITIES, the README catalog count, or the
`package.json` description count — the catalog is unchanged at 307.

## 6. Acceptance criteria

v59 is fully shipped when:

- This file exists.
- The two live Class-A sites (`views/group-g.js:2282,2353`) render
  a `fmt()` fallback, not a magic-constant number, for FiO₂ ≤ 0; a
  unit test pins each.
- `hacor` (and the other B2 functions) returns a fallback, not a
  band, from an all-empty instrument; a unit test pins this.
- The B1 functions render a `boundsAdvisory()` note for the
  impossible input (`glucose 1e9`, `measuredCa 1e9`, `scr 0.01`,
  …) rather than a silent number; tests pin each.
- `lib/bounds.js` defines the full physiologic envelope set; a
  grep finds no remaining local `r1`/`r2`/`r3`/`num`/`round1`
  declaration outside `lib/num.js`; `field.js` results are
  byte-identical before/after (golden diff in the audit log).
- The rewritten fuzz harness drives an object-aware matrix across
  all 16 lib modules with zero non-finite leaks, and the §4.1
  refactor leaves every pre-existing valid-input result
  byte-identical.
- The PA default export contains none of the extracted
  `patientName`/`dob`/`memberId`/SSN values (test); the widened
  redaction negative cases (R-1…R-5) pass; the PA stress spec
  (empty / multi-MB / binary / date-extreme) completes under the
  fixed time budget.
- `npm run lint`, `npm run test`, `npm run sbom`, and
  `npm run build` all pass.
- `UTILITIES.length` is still 307 and all catalog-truth surfaces
  ([spec-v46](spec-v46.md)) agree.
- The CHANGELOG records v59 as a zero-tile hardening release.

## 7. Out of scope for v59

- Changing any clinical formula, threshold, or rounding precision.
  v59 is behavior-preserving for valid input by construction; any
  valid-input result that *moves* is a v59 bug.
- Property-based / generative fuzzing beyond the fixed object-aware
  matrix. A `fast-check`-style generator adds a dependency the
  budget ([spec-v10](spec-v10.md)) forbids; a small seeded
  document generator for the PA fixtures is allowed because it has
  no dependency.
- A live link-checker or any build-time/runtime network call.
- OCR accuracy or PDF-layout fidelity improvements — v59 bounds
  the *work* and protects *privacy*; extraction quality is its own
  concern.
- Internationalization of fallback/advisory strings. The `fmt()`
  fallback is a caller-supplied literal.
- Citation correctness and freshness — that is
  [spec-v60](spec-v60.md).
- New tiles or tool enhancements — that is
  [spec-v61](spec-v61.md).
