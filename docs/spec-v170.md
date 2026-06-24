# spec-v170.md — Transplant allocation: KDPI (via KDRI) and EPTS (+2 tiles)

> Status: **PROPOSED (2026-06-23).** Feature spec of the
> [spec-v168](spec-v168.md) **Data-Sourced Reference-Table** program. Adds **2**
> deterministic kidney-transplant allocation indices built on **verbatim-fetched
> OPTN coefficient and mapping tables** ([spec-v141](spec-v141.md) pattern). Fills
> a confirmed gap — transplant has `milan-criteria` (HCC) and the MELD/PELD liver
> scores but **no kidney-allocation index**. None duplicates a live tile.
>
> Catalog effect at v170 close: **live count + 2** (catalog-truth gate enforces).
>
> Every prior spec (v4 through v169) remains in force. v170 adds no runtime
> network call and no AI; each tile obeys the [spec-v100](spec-v100.md) §2
> doctrine, passes the [spec-v29](spec-v29.md) §3 one-line test, ships its primary
> citation inline ([spec-v54](spec-v54.md)), and inherits the
> [spec-v59](spec-v59.md) output-safety contract. **The KDRI coefficients and the
> KDPI/EPTS percentile mapping tables are verbatim-fetched from the OPTN guide and
> cross-verified to ≥2 sources — none hand-transcribed** ([spec-v168](spec-v168.md)
> §3, [spec-v97](spec-v97.md)).

## 1. Thesis

Kidney allocation runs on two numbers computed for every deceased-donor offer and
every candidate: the **Kidney Donor Profile Index (KDPI)**, a donor-quality
percentile derived from the Kidney Donor Risk Index (KDRI); and the **Estimated
Post-Transplant Survival (EPTS)** score, a candidate percentile from four factors.
Both are deterministic — a closed coefficient sum (KDRI) or a small point rule
(EPTS) followed by a **mapping to a population percentile**. The percentile mapping
is the table that must be fetched verbatim; the OPTN re-issues it annually.

## 2. What v170 adds (2 tiles)

### 2.1 `kdpi` — Kidney Donor Profile Index (via KDRI)

- **Citation:** Rao PS, Schaubel DE, Guidinger MK, et al. A comprehensive risk
  quantification score for deceased donor kidneys: the Kidney Donor Risk Index.
  *Transplantation.* 2009;88(2):231-236. Mapping: OPTN "A Guide to Calculating and
  Interpreting KDPI" (annual).
- **citationUrl:** https://doi.org/10.1097/TP.0b013e3181ac620b (verify at
  implementation; fetch the current OPTN KDPI guide for the mapping table)
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `transplant`, `nephrology`, `surgery`.
- **Inputs:** the 10 donor factors — age, height, weight, ethnicity, history of
  hypertension, history of diabetes, cause of death (CVA), serum creatinine, HCV
  status, DCD status.
- **Output:** **KDRI = exp(Σ donor-factor coefficients)** (relative to the reference
  donor), the **KDRI_median-scaled** value, and the **KDPI 0–100 %** from the OPTN
  annual mapping table (higher KDPI = lower expected graft longevity). Class B
  (annual OPTN mapping). The coefficient set and the scaling factor are
  verbatim-fetched; guards every numeric input.

### 2.2 `epts` — Estimated Post-Transplant Survival (EPTS)

- **Citation:** OPTN "A Guide to Calculating and Interpreting the Estimated
  Post-Transplant Survival (EPTS) Score" (annual); derived from Clayton PA, et al.
  *Am J Transplant.* 2014.
- **citationUrl:** https://optn.transplant.hrsa.gov/ (fetch the current EPTS guide
  for the raw-score → percentile mapping; verify at implementation)
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `transplant`, `nephrology`.
- **Inputs:** candidate age, time on dialysis (or pre-emptive), prior solid-organ
  transplant, and diabetes status.
- **Output:** the **raw EPTS** (the published 4-factor weighted sum) and the **EPTS
  0–100 %** from the OPTN annual mapping table; the ≤20 % longevity-matching
  threshold is surfaced. Class B (annual OPTN mapping). The weights and mapping are
  verbatim-fetched; guards the inputs.

## 3. Per-tile robustness

- **Verbatim sourcing:** the KDRI coefficients, the scaling factor, and both the
  KDPI and EPTS raw→percentile mapping tables are fetched from the current OPTN
  guides to disk and parsed programmatically; the audit log records the source URL,
  fetch date, **table revision year**, and the ≥2-source cross-verification. **No
  value is hand-typed.**
- **`kdpi` exponential guard:** KDRI = exp(Σβ) — the [spec-v59](spec-v59.md) fuzz
  harness exercises extreme factor combinations to confirm no overflow-to-`Infinity`
  leak; a blank/non-finite donor input renders a surfaced `valid:false`
  complete-the-fields fallback.
- **Mapping-table interpolation** is guarded against an out-of-range raw value (clamp
  to [0, 100] %); the KDPI/EPTS percentile is read from the fetched table, never
  recomputed from a formula.
- Both render the [spec-v50](spec-v50.md) §3 posture note (an allocation/longevity
  index, not an individual outcome guarantee; the **mapping year** is shown so a stale
  table is obvious) and author no allocation decision ([spec-v11](spec-v11.md) §5.3).

## 4. CI/CD & maintenance

Per the [spec-v100](spec-v100.md) §6 contract:

- **Maintenance class (§6.3):** both are **Class B** — the OPTN re-issues the mapping
  tables annually; each carries a real `docs/citation-staleness.md` row noting the
  **table revision year** and the re-fetch cadence (OPTN trips `ISSUER_PATTERN`).
- **Specialty vocabulary:** no new tags (`transplant`, `nephrology`, `surgery` all
  exist).
- **Build & gates (§6.1/§6.2):** the two computes live in the new
  `lib/transplant-v170.js` module (`kdpi`, `epts`) plus a new
  `lib/kdpi-epts-data.js` (verbatim KDRI coefficients + mapping tables), added to
  `fuzz-tools.test.js` `MODULES` (the KDRI exp path fuzzed). Renderers live in the
  new `views/group-v170.js`; its `RV170` export is spread into `app.js` `RENDERERS`.
  The catalog count moves on all **13 catalog-truth surfaces**; a11y,
  `mobile-no-hscroll`, `mobile-touch-targets`, and the chromium
  `example-correctness` sweep pass. **Housekeeping:** `git checkout -- data/` after
  any baseline `build-data`.

## 5. Files touched

```
docs/spec-v170.md                        (this file)
app.js                                   (+2 UTILITIES rows, group G; import group-v170 RV170 into RENDERERS)
lib/transplant-v170.js                   (new module: kdpi, epts)
lib/kdpi-epts-data.js                     (new data module: KDRI coefficients + KDPI/EPTS mapping tables, fetched verbatim)
lib/meta.js                              (+2 META entries: inline citation + citationUrl + accessed + table revision year; cross-links to milan-criteria, meld-childpugh)
views/group-v170.js                      (new renderer module: 2 renderers)
docs/clinical-citations.md               (+ rows for the OPTN/Rao sources)
docs/citation-staleness.md               (+ Class B rows for kdpi and epts with the table revision year)
test/unit/kdpi.test.js, epts.test.js     (≥3 boundary worked examples each, from the OPTN guide worked cases)
test/unit/fuzz-tools.test.js             (add lib/transplant-v170.js to MODULES)
docs/audits/v12/kdpi.md, epts.md          (spec-v11 audit logs; record source URL + fetch date + revision year + cross-verify source)
docs/scope-data-sourced.md               (catalog ledger; advance the v168 running count)
CHANGELOG.md                             (Unreleased: v170 entry, +2)
README.md, package.json                  (catalog count + spec-progression line -> v170)
```

## 6. Acceptance criteria

v170 is fully shipped when:

- The implementing session has re-run the [spec-v85 §6.2](spec-v85.md) collision
  check and confirmed both ids are absent.
- Both tiles are live with a `META[id]` entry, inline primary citation +
  `citationUrl` + `accessed` + **table revision year**, ≥3 worked examples each
  **reproducing the OPTN guide's own worked cases** (a reference-donor KDPI and a
  high-KDPI donor; a young pre-emptive non-diabetic EPTS and a high-EPTS candidate),
  a [spec-v11](spec-v11.md) audit log recording the **verbatim source URL + fetch
  date + revision year + cross-verification source**, and a passing
  [spec-v29](spec-v29.md) §3 check.
- The KDRI exp path is overflow-guarded; the percentile mapping clamps [0, 100] and
  is read from the fetched table; blank inputs render a complete-the-fields fallback.
- Both carry their Class B `docs/citation-staleness.md` rows with the revision year.
- `UTILITIES.length` is live count + 2, all catalog-truth surfaces agree, and the
  `data/` diff is surgical.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass; the
  CHANGELOG records v170 with the +2 delta.
- **Sourcing gate:** if the current OPTN mapping table cannot be fetched verbatim and
  cross-verified to ≥2 sources, the affected tile is **deferred** (the `crib-ii`
  precedent), not approximated.

## 7. Out of scope for v170

- **No Lung Allocation Score / Composite Allocation Score** — the LAS/CAS coefficient
  set is large, frequently re-weighted, and not cleanly sourceable for verbatim fetch
  ([spec-v168](spec-v168.md) §2); parked.
- **No allocation/match-run logic** — `kdpi`/`epts` report the indices; the
  longevity-matching and offer sequence are OPTN policy, not modeled.
- **No individual-patient prognosis** — the indices are population percentiles, stated
  as such.
