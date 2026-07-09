# spec-v264.md — Deceased-donor kidney allocation: the Kidney Donor Risk Index, the Kidney Donor Profile Index, and the Estimated Post-Transplant Survival score (+3 tiles)

> Status: **DEFERRED (2026-07-09) — not reproducible from open sources in-session.**
> First feature spec of the **Advanced Sub-specialty Prognostic Instruments** program
> (§1.1). Proposes **3** deterministic instruments a transplant team reads at the
> deceased-donor offer — the donor-side KDRI/KDPI pair and the recipient-side EPTS.
> **Each id was verified absent** ([spec-v85 §6.2](spec-v85.md)).
>
> **Why deferred:** the [spec-v97](spec-v97.md) contract requires every coefficient and
> mapping to be re-fetched and cross-verified against ≥2 independent, fetchable open
> sources. That cannot be met in-session for this triad:
>
> - **KDPI and EPTS** are percentiles produced by **large OPTN mapping tables that OPTN
>   revises every year** from the prior year's recovered-donor / waitlist population
>   (KDRI→KDPI cumulative-percentage table; raw-EPTS→percentile table). The exact
>   reference-year tables live only in the OPTN/HRSA guide PDFs, which are
>   redirect/403-blocked to fetch here; open secondary calculators reproduce *a* mapping
>   but at unstated or differing reference years, so no two fetchable sources agree on the
>   same year's table. Emitting a national organ-allocation percentile from a
>   mismatched-year or unverifiable table would be a spec-v97 violation with real
>   clinical-integrity risk.
> - **KDRI** is a fixed regression, but the clinically-reported **KDRI-Rao is
>   median-scaled by an annually-revised constant**, and its standalone value without the
>   KDPI percentile is limited; it is not shipped alone.
>
> **Re-open condition:** ship when the current-reference-year OPTN KDRI→KDPI and
> raw-EPTS→percentile tables (and the KDRI median-scaling constant) are reproducible from
> ≥2 open, fetchable sources for the *same* reference year, or are supplied directly. This
> follows the [spec-v259](spec-v259.md) deferral precedent.
>
> Catalog effect while deferred: **none** (docs-only; `UTILITIES.length` unchanged). If
> re-opened, the catalog effect is **live `UTILITIES.length` + 3**, enforced by the
> catalog-truth gate ([spec-v46](spec-v46.md)).
>
> Every prior spec remains in force. v264 adds no runtime network call and no AI; each
> tile obeys the [spec-v100](spec-v100.md) §2 doctrine, passes the
> [spec-v29](spec-v29.md) §3 one-line test, ships its citation inline
> ([spec-v54](spec-v54.md)), inherits the [spec-v59](spec-v59.md) output-safety
> contract, renders the [spec-v50](spec-v50.md) §3 posture note, and honors
> [spec-v11](spec-v11.md) §5.3 (**no accept/decline, allocation, or listing order in
> Sophie's voice** — these compute a risk index or a survival percentile; the decision to
> accept or decline an organ stays with the transplant team). **Every variable, coefficient,
> and mapping is re-fetched and cross-verified against ≥2 independent open sources at
> implementation** ([spec-v97](spec-v97.md)); uncertain or annually-revised values carry an
> explicit *(verify at implementation, [spec-v97](spec-v97.md))* tag. The implementing
> session **re-runs the [spec-v85 §6.2](spec-v85.md) collision check** first.

## 1. Thesis

The catalog estimates renal function (CKD-EPI creatinine and cystatin, CKD staging),
scores dialysis adequacy (Kt/V, URR), and quantifies frailty, but it does **not** carry
the three instruments that govern how a deceased-donor kidney is matched to a candidate in
the OPTN Kidney Allocation System (KAS): the donor-side **KDRI/KDPI** pair that grades the
organ, and the recipient-side **EPTS** that grades the candidate's expected post-transplant
survival. Each is a transparent, openly-published regression model, freely reproducible
from OPTN's own documentation, and each is decision support — **never an accept, decline,
or allocation order**.

### 1.1 Program: Advanced Sub-specialty Prognostic Instruments

v264–v266 add nine deterministic instruments that a sub-specialist reaches for at a
prognostic or allocation decision point — grade this donor organ, predict this trauma
patient's transfusion need, stratify this cancer's recurrence risk. Each is Class A,
freely reproducible from open sources, and absent from the catalog at draft. The program
adds no new module theme beyond the existing Group G (clinical scoring & risk) surface and
no runtime dependency. It succeeds the completed **Bedside Acute-Care Instruments**
program ([spec-v261](spec-v261.md) §1.1).

## 2. What v264 adds (3 tiles)

### 2.1 `kdri` — Kidney Donor Risk Index (KDRI)

- **Citation:** Rao PS, Schaubel DE, Guidinger MK, et al. A comprehensive risk
  quantification score for deceased donor kidneys: the kidney donor risk index.
  *Transplantation.* 2009;88(2):231-236.
- **citationUrl:** https://doi.org/10.1097/TP.0b013e3181ac620b
- **Group:** G. **Specialties:** `transplant`, `nephrology`, `surgery`.
- **Inputs — 10 donor variables** *(each coefficient is transcribed verbatim from the OPTN
  KDPI/KDRI guide at implementation, [spec-v97](spec-v97.md))*: donor age (piecewise, with
  the < 18 and ≥ 50 spline terms), height (cm), weight (< 80 kg term), history of
  hypertension, history of diabetes, cause of death from cerebrovascular accident, serum
  creatinine (with the > 1.5 mg/dL term), hepatitis C status, and donation-after-circulatory-
  death (DCD) status. The tile reports the **race-free (2022) KDRI** as the default and
  notes that the original 2009 model carried a self-reported-race term *(the race term was
  removed from OPTN allocation in 2022; the tile reproduces the current race-free
  coefficients — [spec-v97](spec-v97.md))*.
- **Output:** the **KDRI-Rao** relative-risk ratio (median-scaled), i.e. the graft-failure
  hazard of this donor relative to the reference donor, naming the dominant contributing
  terms. Framed as the donor-quality index that underlies the KDPI percentile; **it reports
  a relative-risk ratio, never an accept/decline decision** ([spec-v11](spec-v11.md) §5.3).
  Class A. Cross-links `kdpi`, `epts`, `ckd-epi`.

### 2.2 `kdpi` — Kidney Donor Profile Index (KDPI)

- **Citation:** Organ Procurement and Transplantation Network (OPTN). A Guide to
  Calculating and Interpreting the Kidney Donor Profile Index (KDPI). HRSA/OPTN
  (annually revised mapping table).
- **citationUrl:** https://optn.transplant.hrsa.gov/data/allocation-calculators/kdpi-calculator/
- **Group:** G. **Specialties:** `transplant`, `nephrology`, `surgery`.
- **Inputs — the same 10 donor variables as §2.1**, mapped through the current OPTN
  **KDRI-to-KDPI cumulative-percentage table** *(the mapping table is revised every year
  from the prior year's recovered-donor population; the tile cites the reference-year table
  it reproduces and carries an explicit "verify against the current OPTN mapping year" note
  — [spec-v97](spec-v97.md))*.
- **Output:** the **KDPI percentage (0–100 %)** — the cumulative percentile of this donor's
  KDRI among all kidneys recovered in the reference year, so a KDPI of 85 % means the donor
  carries higher failure risk than 85 % of recovered kidneys. The tile states the reference
  mapping year inline and names the driving donor factors. Framed as the percentile that
  KAS uses for the top-20 %/longevity-matching thresholds; **it reports a percentile, never
  an allocation order** ([spec-v11](spec-v11.md) §5.3). Class A. Cross-links `kdri`,
  `epts`.

### 2.3 `epts` — Estimated Post-Transplant Survival score (EPTS)

- **Citation:** Organ Procurement and Transplantation Network (OPTN). A Guide to
  Calculating and Interpreting the Estimated Post-Transplant Survival (EPTS) Score.
  HRSA/OPTN (annually revised mapping table). Derived from Clayton PA, et al.
  *Transplantation.* 2014.
- **citationUrl:** https://optn.transplant.hrsa.gov/data/allocation-calculators/epts-calculator/
- **Group:** G. **Specialties:** `transplant`, `nephrology`, `internal-medicine`.
- **Inputs — 4 recipient variables** *(the raw-EPTS coefficients and diabetes-interaction
  terms are transcribed verbatim from the OPTN EPTS guide at implementation,
  [spec-v97](spec-v97.md))*: candidate age, years on dialysis (with the "not yet on
  dialysis" term), prior solid-organ transplant, and diabetes (which interacts with all
  three of the other terms). Raw EPTS = 0.047·max(age − 25, 0) − 0.015·diabetes·max(age −
  25, 0) + 0.398·prior transplant − 0.237·diabetes·prior transplant + 0.315·ln(years on
  dialysis + 1) − 0.099·diabetes·ln(years on dialysis + 1) + 0.130·(no dialysis yet) −
  0.348·diabetes·(no dialysis yet) + 1.262·diabetes.
- **Output:** the **EPTS percentage (0–100 %)** via the current OPTN raw-EPTS-to-percentile
  mapping *(reference-year table cited inline, [spec-v97](spec-v97.md))*, with the **≤ 20 %
  longevity-matching threshold** flagged (candidates at ≤ 20 % EPTS are offered KDPI ≤ 20 %
  kidneys first). Framed as the recipient-longevity index that pairs with KDPI; **it reports
  a survival percentile, never a listing or allocation order** ([spec-v11](spec-v11.md)
  §5.3). Class A. Cross-links `kdpi`, `kdri`.

## 3. Per-tile robustness

- **Every compute routes through `lib/num.js` and is finite-guarded.** KDRI is a bounded
  exponential of a coefficient sum, KDPI and EPTS are bounded [0, 100] % percentile lookups
  — each renders a "complete the fields" fallback for a missing input rather than a `NaN`,
  and clamps percentiles to [0, 100] %.
- **Each tile reports which donor/recipient factors dominate and the resulting index or
  percentile** ([spec-v59](spec-v59.md)) — the KDRI relative-risk ratio, the KDPI/EPTS
  percentile with its reference year — so a result is never read without its basis.
- **All three render an index or percentile, not an order** — none authors an accept,
  decline, listing, or allocation order in Sophie's voice ([spec-v11](spec-v11.md) §5.3);
  each renders the [spec-v50](spec-v50.md) §3 posture note.
- **All three flow through the [spec-v59](spec-v59.md) fuzz harness with zero non-finite
  leaks**, fuzzed at the KDRI age-spline knots, the KDPI/EPTS 20 % thresholds, and the
  EPTS diabetes-interaction toggles.

## 4. CI/CD & maintenance

- **Maintenance classes (§6.3):** all three are **Class A** — the KDRI regression is fixed
  (2009 model, 2022 race-free revision); the KDPI and EPTS **percentile mapping tables are
  revised annually by OPTN**, so both carry a `docs/citation-staleness.md` row keyed to the
  reference mapping year with an annual re-verify note ([spec-v97](spec-v97.md)). The
  implementing session confirms whether any citation trips `ISSUER_PATTERN`
  ([spec-v92](spec-v92.md)/[spec-v94](spec-v94.md)).
- **Build & gates (§6.1/§6.2):** the three computes live in a new
  `lib/transplant-v264.js`, added to `test/unit/fuzz-tools.test.js` `MODULES`. The
  transcribed KDRI coefficient vector and the KDRI→KDPI and raw-EPTS→percentile mapping
  tables live as named constants with the source table and reference year cited in a
  comment. Renderers live in a new `views/group-v264.js`; its `RV264` export is spread into
  the `app.js` `RENDERERS` map. Every input carries a real `<label for>`. The catalog count
  moves on all catalog-truth surfaces using the **live `UTILITIES.length` + 3**; a11y,
  `mobile-no-hscroll`, `mobile-touch-targets`, and the chromium `example-correctness` sweep
  pass.
- **Specialties** are drawn from the closed vocabulary; all tags used here already exist in
  `ALLOWED_SPECIALTIES`.
- **MCP exposure (post-ship):** all three are Class A deterministic computes and are
  **routinely MCP-adaptable** — a follow-up MCP wave exposes them as deterministic agent
  tools per the [spec-v85](spec-v85.md) recipe, self-describing the dominant factors and the
  reference mapping year so the numeric round-trip passes.

## 5. Files touched

```
docs/spec-v264.md                        (this file)
app.js                                   (+3 UTILITIES rows; import group-v264 RV264 into RENDERERS)
lib/transplant-v264.js                   (new: kdri, kdpi, epts + KDRI coefficient / KDPI+EPTS mapping constants)
lib/meta.js                              (+3 META entries: inline citation + citationUrl + accessed; cross-links to ckd-epi, ktv-urr)
views/group-v264.js                      (new renderer module: 3 renderers)
docs/clinical-citations.md               (+3 rows)
docs/citation-staleness.md               (+2 rows: KDPI + EPTS annual mapping year)
test/unit/kdri.test.js, kdpi.test.js, epts.test.js   (>=3 worked examples each)
test/unit/fuzz-tools.test.js             (add lib/transplant-v264.js to MODULES)
docs/scope-post-parity.md                (catalog count live -> live+3; record the v264 delta)
CHANGELOG.md, README.md, package.json    (catalog count live -> live+3; spec-progression line)
```

## 6. Acceptance criteria

v264 is fully shipped when:

- The implementing session has **re-run the [spec-v85 §6.2](spec-v85.md) collision check**
  and confirmed all three ids are absent (as verified at draft).
- All 3 tiles in §2 are live (Class A) with a `META[id]` entry, inline citation +
  `citationUrl` + `accessed`, and ≥ 3 worked examples each — including a **KDRI spanning a
  low-risk and a high-risk donor**, a **KDPI crossing the 20 % longevity-matching
  threshold with its reference year stated**, and an **EPTS crossing the ≤ 20 % threshold
  with a diabetes-interaction case**.
- The transcribed KDRI coefficients, the KDRI→KDPI mapping, and the raw-EPTS coefficients
  and →percentile mapping are reproduced from the OPTN guides and re-verified against ≥ 2
  independent references at implementation ([spec-v97](spec-v97.md)); the reference mapping
  year is stated inline on both KDPI and EPTS.
- Every compute is finite-guarded, routes through `lib/num.js`, clamps percentiles to
  [0, 100] %, and is covered by the [spec-v59](spec-v59.md) fuzz harness with **zero
  non-finite leaks**.
- `UTILITIES.length` is **live + 3** and all catalog-truth surfaces agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass; the
  CHANGELOG records v264 with the +3 delta.

## 7. Out of scope for v264

- **No accept / decline / allocation / listing order** — the tiles compute a risk index or
  survival percentile; the decision to accept or decline an organ, and how it is allocated,
  stays with the transplant team and OPTN policy ([spec-v11](spec-v11.md) §5.3).
- **No non-kidney allocation index** — the liver DRI, lung allocation score (LAS/CAS), and
  heart allocation status are deferred to a later slice; this spec adds only the kidney
  KDRI/KDPI/EPTS triad. If the OPTN mapping table for a given reference year cannot be
  reproduced from ≥ 2 open, fetchable sources at implementation, that tile is parked (not
  approximated), per [spec-v97](spec-v97.md) and the [spec-v259](spec-v259.md) precedent.
