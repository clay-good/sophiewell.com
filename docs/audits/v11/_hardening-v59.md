# v59 hardening audit — full-catalog stress sweep & PA-toolchain hardening

- Auditor: CG
- Date: 2026-06-06 (spec-v59).
- Scope: zero-tile hardening. No clinical formula, threshold, or rounding
  changed; every valid-input result is byte-identical (the 2,900+ pre-existing
  unit tests are the regression guard and all pass). Catalog unchanged at 307.

## Class A — magic-constant numbers replaced by fallbacks

- `hacor` (`lib/scoring-v4.js`): previously `pf = fio>0 ? pao/fio : 0` and
  `Number(ph)||7.4` / `Number(gcs)||15`. Now refuses (`score:null`, fallback
  band) when any of the six inputs is absent/non-finite or FiO2 ≤ 0; the
  renderer (`views/group-g.js`) reads blanks as null (`nvOrNull`), shows the
  fallback, and routes the P/F line through `fmt()`. Pinned by
  `test/unit/hacor.test.js`.
- `lisMurray`: previously substituted a magic P/F of 300 for FiO2 ≤ 0 and a
  near-normal compliance of 80 for a blank field. Same refusal pattern; pinned
  by `test/unit/lis-murray.test.js`.

## Class B2 — empty-instrument refusal

- `bps` (`lib/scoring-v4.js`): the three observational items no longer default a
  blank to 1 (“relaxed/no expression”) and emit “acceptable pain” from no data;
  a missing item refuses. The 1–4 clamp still forces a present 0 → 1 (so the
  existing clamp test is byte-identical). Pinned by `test/unit/bps.test.js`.

## Class B1 — physiologic-plausibility advisories

- `lib/bounds.js`: `BOUNDS` expanded from 6 to 31 envelopes (glucose, the
  electrolytes, the blood gases, FiO2 ≤ 1.0, dbp, temperature, qtMs, rr, gcs,
  hematology, bun, the eGFR high-bound, …), each with a sourced one-line note.
- `views/group-e.js`: `boundsAdvisory()` wired at the B1 render sites
  (corrected sodium, corrected calcium, MAP, A-a gradient) joining the v53 sites
  (BMI, Cockcroft-Gault). The compute functions are unchanged — they still
  return the (huge-but-finite) number; the advisory surfaces a “verify the
  units” note next to it, never silently clamping a plausible value. Pinned by
  `test/unit/bounds.test.js`.

## Class C — oneSidedLow regression assertion

- `test/unit/lab-interpret.test.js`: asserts the three `oneSidedLow` analytes
  (totalChol, ldl, triglycerides) never raise a low flag for an impossibly low
  value (the refLow:0 “never flag low” choice is deliberate, not an accidental
  default).

## Class D — helper de-duplication

- `lib/field.js`: deleted the local `r2`/`r3`/`num` (its `num` defaulted
  `min:0`, already diverged from `num.js`’s `min:-Infinity`); now imports them
  from `lib/num.js`. Every call site passes an explicit `{ min }`, so no result
  moves (verified: full field-medicine test suite byte-identical).
- `lib/scoring-v4.js`: deleted the three local `round1` inlines (identical to
  `r1`); now imports `r1` from `lib/num.js`.
- A grep confirms no remaining local `r1`/`r2`/`r3`/`num`/`round1` declaration
  outside `lib/num.js`.

## Fuzz harness — object-aware, 16 modules

- `test/unit/fuzz-tools.test.js` rewritten. It now reflects each function’s
  destructured field names and drives EACH field through the adversarial matrix
  on a valid baseline (the reachable “valid object + one impossible field” path
  the old scalar-only matrix never exercised), across the 16 pure compute
  modules (added field, coding-v5, regulatory, prompt, workflow-v4).
- Scoping (honesty discipline, spec-v53 §7): the harness asserts the actual
  DOM-safety invariant — no banned token in any returned STRING field — on the
  object path, plus throw-safety. It does NOT assert blanket finiteness of
  internal numeric fields: a divide-by-an-entered-0 (e.g. shock index, SBP=0) is
  a mathematically-forced Infinity in an internal field that the render-side
  `fmt()`/`boundsAdvisory()` keeps out of the DOM; forcing a null-return onto
  the ~40 such functions is precisely the non-surgical sweep spec-v53 §7 forbids
  and contradicts spec-v59 §2.2’s own render-side fix strategy.
- The object-aware string-leak check newly caught four real leaks the scalar
  harness missed; all fixed to route the interpolation through a finite guard:
  `rox` (`at NaNh`), `vis` (`VIS Infinity`), `berlinArds` (`PaO2/FiO2 NaN`),
  `mtpTracker` (`Infinity:1:1`). `workflow-v4` builders gained a `txt()`
  sanitizer so a non-finite value renders the labeled fallback (§2.7).
- DOM-renderer modules (derivation, screener, table, tree) require `document`
  and cannot run under node:test; they are exercised by the Playwright
  all-tools / mobile-no-hscroll specs. `derivation.js`’s one numeric path (the
  show-your-work panel) is additionally guarded at the source via `fmt()`.

## PA-toolchain hardening

- §3.1 (highest severity): the DEFAULT report export is now PHI-redacted
  (`views/pa-lint.js` wires the .docx/.json buttons to the redacted builders).
  The raw extract (patientName/dob/memberId) is reached only by ticking an
  explicit, labeled “include raw PHI — internal use only” checkbox first. Pinned
  by `test/unit/pa-report.test.js` (default report contains none of the
  extracted PHI values) and the `pa-no-network.spec` download sweep.
- §3.2 widened redaction (`lib/pa/redact.js`): unlabeled street address +
  City/ST/ZIP (R-1), unlabeled “born <date>” (R-2), member/MRN/chart ID captured
  to the token boundary instead of a fixed 20 chars (R-3), international phone
  with a + country code (R-4); `extractPatientName` captures a “Last, First”
  name whole (R-5). Every new quantifier is bounded ({0,n}) — no ReDoS. Pinned
  by the R-1…R-4 negative cases in `test/unit/pa-redact.test.js`.
- §3.3 bounded work: `extractDates`/`extractServiceDates`/`extractPosCodes`
  capped at 200 matches (U-1) — far above any real packet, so the 46 golden
  fixtures are byte-identical (verified by `audit-pa`); a binary/non-UTF8 .txt is
  pre-gated on its U+FFFD replacement-char ratio and skipped rather than run
  through the full engine (U-3).
- §3.4 regex-timing guard: `test/unit/pa-stress.test.js` runs the extractor +
  redactor + engine + both report builders over a ~1 MB date/address bomb and a
  500 k replacement-char binary blob and asserts completion under a fixed
  wall-clock budget (and empty/binary inputs neither throw nor hang).

### Residual / deferred (documented, not silently dropped)

- U-2 (PDF page-text join cap) and U-4 (OCR page-count ceiling) are browser-side
  work-bounding niceties; the determinism-critical extract/redact/engine core is
  bounded (U-1/U-3 above) and the stress test pins it. Candidate for a follow-up.
- U-5 (hoist the per-rule NDC/signature full-text scan into `extractAll`) is a
  performance optimization that would require hand-editing the 1.5 MB generated
  `lib/pa/rules.js`; deferred as too risky for a zero-behavior-change release.

## Status

- PASS. `npm run lint`, `npm run test` (2,983 unit), `npm run test:a11y`,
  `npm run sbom`, `npm run build`, and the Playwright suite all green.
