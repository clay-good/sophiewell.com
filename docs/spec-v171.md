# spec-v171.md — Preterm & fetal growth percentiles: Fenton 2013 and INTERGROWTH-21st EFW (+2 tiles)

> Status: **PROPOSED (2026-06-23).** **Closing spec** of the
> [spec-v168](spec-v168.md) **Data-Sourced Reference-Table** program — and, on the
> clinician's honest read, the closing spec of the entire four-pass
> coverage effort begun at [spec-v150](spec-v150.md). Adds **2** deterministic
> growth-percentile instruments built on **verbatim-fetched LMS/standard tables**
> ([spec-v141](spec-v141.md) pattern). Fills a confirmed gap — the catalog has term
> growth (`peds-bmi-percentile`, `who-growth-zscore`, the v169 CDC tiles) and
> `hadlock-efw` (an EFW *value*) but **no preterm growth percentile and no EFW
> percentile-for-gestational-age.** None duplicates a live tile. With v171 the
> Data-Sourced Reference-Table program is **complete (+7, nominal 741 → 748).**
>
> Catalog effect at v171 close: **live count + 2** (catalog-truth gate enforces).
>
> Every prior spec (v4 through v170) remains in force. v171 adds no runtime
> network call and no AI; each tile obeys the [spec-v100](spec-v100.md) §2
> doctrine, passes the [spec-v29](spec-v29.md) §3 one-line test, ships its primary
> citation inline ([spec-v54](spec-v54.md)), and inherits the
> [spec-v59](spec-v59.md) output-safety contract. **All table values are
> verbatim-fetched and programmatically parsed — none hand-transcribed**
> ([spec-v168](spec-v168.md) §3, [spec-v97](spec-v97.md)).

## 1. Thesis

A preterm infant's weight and an estimated fetal weight are only interpretable as a
**percentile for gestational age**. The catalog computes the EFW *value* (`hadlock-efw`)
but cannot say whether it is small-, appropriate-, or large-for-gestational-age. The
two standards below fill that: the Fenton 2013 preterm growth chart (postnatal, by
GA and sex) and the INTERGROWTH-21st estimated-fetal-weight standard (in-utero, by
GA). Both are LMS/skew-normal lookups over published tables fetched verbatim.

## 2. What v171 adds (2 tiles)

### 2.1 `fenton-preterm-growth` — Fenton 2013 Preterm Growth Percentile

- **Citation:** Fenton TR, Kim JH. A systematic review and meta-analysis to revise
  the Fenton growth chart for preterm infants. *BMC Pediatr.* 2013;13:59.
- **citationUrl:** https://doi.org/10.1186/1471-2431-13-59 (verify at
  implementation; fetch the published LMS/percentile tables)
- **Group:** Pediatrics & Neonatal (`N`).
- **Specialties:** `neonatology`, `pediatrics`.
- **Inputs:** sex, gestational/corrected age (weeks; the chart spans 22–50 wk), and
  the measure — weight (g), length (cm), or head circumference (cm).
- **Output:** the **z-score and percentile** for the chosen measure at that GA via
  the verbatim Fenton LMS, with the SGA (<10th) / AGA / LGA (>90th) framing. Class A
  (fixed Fenton 2013 standard → documentation-only staleness row). Reuses the
  `interpLMS`/`normalCdf` helpers; cross-linked to `who-growth-zscore`,
  `corrected-age`, `ballard`.

### 2.2 `intergrowth-efw-percentile` — INTERGROWTH-21st EFW Percentile-for-GA

- **Citation:** Stirnemann J, Villar J, Salomon LJ, et al. International estimated
  fetal weight standards of the INTERGROWTH-21st Project. *Ultrasound Obstet
  Gynecol.* 2017;49(4):478-486.
- **citationUrl:** https://doi.org/10.1002/uog.17347 (verify at implementation;
  fetch the INTERGROWTH-21st EFW standard tables/coefficients)
- **Group:** Pediatrics & Neonatal (`N`).
- **Specialties:** `maternal-fetal-medicine`, `obstetrics`.
- **Inputs:** gestational age (weeks) and the estimated fetal weight (g) — taken from
  `hadlock-efw` or entered directly.
- **Output:** the **EFW percentile-for-GA** from the verbatim INTERGROWTH-21st
  standard (skew-normal by GA), with the <10th SGA / <3rd severe-SGA / >90th LGA
  framing. Class A (fixed published standard → documentation-only staleness row).
  Cross-linked to `hadlock-efw` (the EFW source), `afi`, `bpp`.

## 3. Per-tile robustness

- **Verbatim sourcing:** the Fenton LMS tables and the INTERGROWTH-21st EFW standard
  are fetched to disk and parsed programmatically by the generator
  (`scratchpad/gen-*.js`, uncommitted); the audit log records source URL + fetch date
  + the ≥2-source cross-verification. **No value is hand-typed.**
- **LMS / skew-normal guards** ([spec-v141](spec-v141.md) lesson): `interpLMS` guards
  a non-array stratum; the GA-range bounds (Fenton 22–50 wk; INTERGROWTH per its
  published GA span) are enforced — an out-of-range GA renders a surfaced
  `valid:false` complete-the-fields fallback rather than extrapolating; percentiles
  clamp [0.1, 99.9]; the ordinal-suffix helper avoids the `/tiles?/` drift-scan
  collision.
- Both flow through the [spec-v59](spec-v59.md) fuzz harness with zero non-finite
  leaks; the **SGA/AGA/LGA boundary flips** (10th, 90th; 3rd for severe) are
  unit-tested at the percentile cutoffs.
- Both render the [spec-v50](spec-v50.md) §3 posture note (a single percentile is not
  a diagnosis of growth restriction; serial measurement and Dopplers inform that) and
  author no order ([spec-v11](spec-v11.md) §5.3).

## 4. CI/CD & maintenance

Per the [spec-v100](spec-v100.md) §6 contract:

- **Maintenance class (§6.3):** both are **Class A** — fixed published standards
  (Fenton 2013, INTERGROWTH-21st 2017); each carries a **documentation-only**
  `docs/citation-staleness.md` row (the standards do not drift, but the source
  organizations may trip `ISSUER_PATTERN`).
- **Specialty vocabulary:** no new tags (`neonatology`, `pediatrics`,
  `maternal-fetal-medicine`, `obstetrics` all exist).
- **Build & gates (§6.1/§6.2):** the two computes live in the new
  `lib/fetal-growth-v171.js` module (`fentonPretermGrowth`,
  `intergrowthEfwPercentile`) plus new strata in `lib/growth-lms-data.js` (Fenton +
  INTERGROWTH tables, fetched verbatim), added to `fuzz-tools.test.js` `MODULES`.
  Renderers live in the new `views/group-v171.js`; its `RV171` export is spread into
  `app.js` `RENDERERS`. The catalog count moves on all **13 catalog-truth surfaces**;
  a11y, `mobile-no-hscroll`, `mobile-touch-targets`, and the chromium
  `example-correctness` sweep pass. **Housekeeping:** `git checkout -- data/` after
  any baseline `build-data`.

## 5. Files touched

```
docs/spec-v171.md                        (this file)
app.js                                   (+2 UTILITIES rows, group N; import group-v171 RV171 into RENDERERS)
lib/fetal-growth-v171.js                 (new module: fentonPretermGrowth, intergrowthEfwPercentile)
lib/growth-lms-data.js                   (+ Fenton 2013 & INTERGROWTH-21st EFW strata, fetched verbatim)
lib/meta.js                              (+2 META entries: inline citation + citationUrl + accessed; cross-links to hadlock-efw, who-growth-zscore, corrected-age, ballard, bpp)
views/group-v171.js                      (new renderer module: 2 renderers)
docs/clinical-citations.md               (+ rows for the Fenton/INTERGROWTH sources)
docs/citation-staleness.md               (+ documentation-only rows for both tiles)
test/unit/fenton-preterm-growth.test.js, intergrowth-efw-percentile.test.js   (≥3 boundary worked examples each)
test/unit/fuzz-tools.test.js             (add lib/fetal-growth-v171.js to MODULES)
docs/audits/v12/fenton-preterm-growth.md, intergrowth-efw-percentile.md   (spec-v11 audit logs; record source URL + fetch date + cross-verify source)
docs/scope-data-sourced.md               (catalog ledger; CLOSE the v168 program running count)
CHANGELOG.md                             (Unreleased: v171 entry, +2; note Data-Sourced Reference-Table program complete + four-pass coverage effort complete)
README.md, package.json                  (catalog count + spec-progression line -> v171)
```

## 6. Acceptance criteria

v171 is fully shipped when:

- The implementing session has re-run the [spec-v85 §6.2](spec-v85.md) collision
  check and confirmed both ids are absent.
- Both tiles are live with a `META[id]` entry, inline primary citation +
  `citationUrl` + `accessed`, ≥3 boundary worked examples each (including a **Fenton
  10th-percentile SGA boundary at a given GA/sex** and an **INTERGROWTH EFW 3rd/10th
  percentile flip**), a [spec-v11](spec-v11.md) audit log recording the **verbatim
  source URL + fetch date + cross-verification source**, and a passing
  [spec-v29](spec-v29.md) §3 check.
- Every table value is verbatim-fetched and programmatically parsed — **no
  hand-transcription**; the GA-range bounds are enforced (no extrapolation);
  percentiles clamp [0.1, 99.9]; blank inputs render a complete-the-fields fallback.
- Both carry documentation-only `docs/citation-staleness.md` rows.
- Every compute uses the LMS helpers and is covered by the [spec-v59](spec-v59.md)
  fuzz harness with zero non-finite leaks.
- `UTILITIES.length` is live count + 2, all catalog-truth surfaces agree, the `data/`
  diff is surgical, and `docs/scope-data-sourced.md` records the **Data-Sourced
  Reference-Table program complete**.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass; the
  CHANGELOG records v171 with the +2 delta and the program close.

## 7. Out of scope for v171

- **No customized/GROW growth charts** — those use proprietary coefficient engines;
  v171 ships the free population standards (Fenton, INTERGROWTH-21st) only.
- **No growth-restriction diagnosis** — the tiles report a percentile; serial growth,
  Dopplers, and the `cerebroplacental-ratio` (v167) inform the diagnosis, which stays
  with the clinician.
- **No EFW re-implementation** — `hadlock-efw` computes the weight; v171 places it on
  the percentile, cross-linked.
