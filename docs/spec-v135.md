# spec-v135.md — Lymphoma prognostic indices: R-IPI, NCCN-IPI, GELF, Hodgkin IPS, and CLL-IPI (+5 tiles)

> Status: **PROPOSED (2026-06-17).** Feature spec of the [spec-v100](spec-v100.md)
> **MDCalc Parity Completion** program, **Wave 6 — Heme / onc / endocrine / ID.**
> Adds **5** deterministic lymphoma and CLL prognostic indices that fill confirmed
> catalog gaps. None duplicates a live tile.
>
> Catalog effect at v135 close: **598 + 5 = 603 tiles.** (If specs land out of
> order, the implementing session uses the then-current `UTILITIES.length` plus
> this spec's +5, and the catalog-truth gate enforces agreement.)
>
> Every prior spec (v4 through v134) remains in force. v135 adds no runtime network
> call and no AI; each tile obeys the [spec-v100](spec-v100.md) §2 doctrine
> (re-binding [spec-v85](spec-v85.md) §2) and the [spec-v100](spec-v100.md) §6 CI/CD
> contract, passes the [spec-v29](spec-v29.md) §3 one-line test, ships its primary
> citation inline ([spec-v54](spec-v54.md)), and inherits the [spec-v59](spec-v59.md)
> output-safety contract.

## 1. Thesis

The catalog has the follicular-lymphoma index (`flipi`) and the MDS prognostic score
(`ipss-r-mds`), but the wider lymphoma/CLL prognostic-index cluster that sits beside
`flipi` is absent — no DLBCL index, no follicular tumor-burden criteria, no Hodgkin
score, no CLL index. Each is a published, deterministic instrument an oncologist
already uses, and each sits conceptually beside `flipi`:

- **DLBCL has no prognostic index.** The **R-IPI** (5 IPI factors collapsed to three
  outcome groups) and the **NCCN-IPI** (categorized age/LDH/stage/extranodal/ECOG,
  0–8) are the two standard rituximab-era DLBCL indices; neither is reachable.
- **Follicular lymphoma has no treat-vs-watch tool.** The **GELF** high-tumor-burden
  criteria flag which low-grade follicular patients warrant treatment rather than
  observation — the companion to the already-shipped `flipi`.
- **Hodgkin lymphoma has no score.** The **Hasenclever IPS** counts 7 adverse factors
  for advanced Hodgkin and is the standard prognostic instrument.
- **CLL has no index.** The **CLL-IPI** weights TP53, IGHV, β2-microglobulin, stage,
  and age into a 0–10 score with four risk groups.

v135 brings the lymphoma/CLL prognostic cluster onto the page beside `flipi`.

## 2. What v135 adds (5 tiles)

### 2.1 `r-ipi` — Revised International Prognostic Index (DLBCL)

- **Citation:** Sehn LH, Berry B, Chhanabhai M, et al. The revised International
  Prognostic Index (R-IPI) is a better predictor of outcome than the standard IPI for
  patients with diffuse large B-cell lymphoma treated with R-CHOP. *Blood.*
  2007;109(5):1857-1861.
- **citationUrl:** https://doi.org/10.1182/blood-2006-08-038257
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `hematology`, `oncology`, `internal-medicine`.
- **Inputs:** the 5 IPI factors — age > 60, serum LDH above normal, Ann Arbor stage
  III–IV, ≥ 2 extranodal sites, ECOG performance status ≥ 2.
- **Output:** the **factor count (0–5)** collapsed to the three R-IPI outcome groups
  — **very good (0), good (1–2), poor (3–5)** — with the published survival framing,
  naming which factors were present. Class A. Cross-links `nccn-ipi`.

### 2.2 `nccn-ipi` — NCCN International Prognostic Index (DLBCL)

- **Citation:** Zhou Z, Sehn LH, Rademaker AW, et al. An enhanced International
  Prognostic Index (NCCN-IPI) for patients with diffuse large B-cell lymphoma treated
  in the rituximab era. *Blood.* 2014;123(6):837-842.
- **citationUrl:** https://doi.org/10.1182/blood-2013-09-524108
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `hematology`, `oncology`, `internal-medicine`.
- **Inputs:** age (categorized: >40–60 → 1, >60–75 → 2, >75 → 3); LDH ratio
  (>1–3× normal → 1, >3× → 2); Ann Arbor stage III–IV (1); ECOG ≥ 2 (1); extranodal
  disease in a major site — marrow, CNS, liver/GI, or lung (1).
- **Output:** the **total (0–8)** mapped to the four NCCN-IPI risk groups — **low
  (0–1), low-intermediate (2–3), high-intermediate (4–5), high (6–8)** — naming the
  categorized contributions. Class A. Cross-links `r-ipi`.

### 2.3 `gelf-criteria` — GELF High-Tumor-Burden Criteria (follicular lymphoma)

- **Citation:** Brice P, Bastion Y, Lepage E, et al. Comparison in low-tumor-burden
  follicular lymphomas between an initial no-treatment policy, prednimustine, or
  interferon alfa: a randomized study from the Groupe d'Etude des Lymphomes
  Folliculaires (GELF). *J Clin Oncol.* 1997;15(3):1110-1117.
- **citationUrl:** https://doi.org/10.1200/JCO.1997.15.3.1110
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `hematology`, `oncology`, `internal-medicine`.
- **Inputs:** any nodal/extranodal mass > 7 cm; ≥ 3 nodal sites each > 3 cm;
  systemic (B) symptoms; symptomatic splenomegaly; pleural/peritoneal effusion;
  cytopenias (Hgb < 10 g/dL or platelets < 100 ×10⁹/L); leukemic phase
  (> 5.0 ×10⁹/L circulating malignant cells).
- **Output:** the **high-tumor-burden flag** — **met** if **any one** criterion is
  present (treatment indicated) vs **not met** (observation an option) — naming which
  criteria were satisfied. Class A. Cross-links `flipi`.

### 2.4 `hodgkin-ips` — Hasenclever International Prognostic Score (advanced Hodgkin)

- **Citation:** Hasenclever D, Diehl V; International Prognostic Factors Project on
  Advanced Hodgkin's Disease. A prognostic score for advanced Hodgkin's disease.
  *N Engl J Med.* 1998;339(21):1506-1514.
- **citationUrl:** https://doi.org/10.1056/NEJM199811193392104
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `hematology`, `oncology`, `internal-medicine`.
- **Inputs:** the 7 adverse factors — serum albumin < 4 g/dL; hemoglobin < 10.5 g/dL;
  male sex; age ≥ 45; Ann Arbor stage IV; WBC ≥ 15 ×10⁹/L; lymphocytes < 600/µL or
  < 8% of WBC.
- **Output:** the **adverse-factor count (0–7)** with the published freedom-from-
  progression framing, naming which factors were present. Class A. Cross-links
  `flipi` and `r-ipi`.

### 2.5 `cll-ipi` — CLL International Prognostic Index

- **Citation:** International CLL-IPI Working Group. An international prognostic index
  for patients with chronic lymphocytic leukaemia (CLL-IPI): a meta-analysis of
  individual patient data. *Lancet Oncol.* 2016;17(6):779-790.
- **citationUrl:** https://doi.org/10.1016/S1470-2045(16)30029-8
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `hematology`, `oncology`, `internal-medicine`.
- **Inputs:** TP53 status (del(17p) or *TP53* mutation) (4); IGHV unmutated (2);
  serum β2-microglobulin > 3.5 mg/L (2); clinical stage (Rai I–IV / Binet B–C) (1);
  age > 65 (1).
- **Output:** the **weighted total (0–10)** mapped to the four risk groups — **low
  (0–1), intermediate (2–3), high (4–6), very high (7–10)** — with the published
  5-year-survival framing, naming the weighted contributions. Class A. Cross-links
  `flipi`.

## 3. Per-tile robustness

- **All five are criteria-count or weighted-sum logic** with bounded outputs; each
  flows through the [spec-v59](spec-v59.md) fuzz harness and names which
  factors/weights were counted, returning a surfaced complete-the-fields fallback
  rather than a partial group when a required input is blank.
- **`nccn-ipi` and `cll-ipi` carry banded/weighted sub-scores.** NCCN-IPI's age and
  LDH-ratio bands and CLL-IPI's 4/2/2/1/1 weights are compiled constants; each total
  is clamped to its published range and the risk-group boundaries are exact.
- **`gelf-criteria` is an any-one-positive flag.** Each criterion compares an entered
  value (mass size, node count, cytopenia threshold) or a boolean to its fixed
  cut-point with a blank guard; the verdict names exactly which criteria fired.
- All five render the [spec-v50](spec-v50.md) §3 clinical posture note and quote the
  source's outcome-group interpretation; none authors a treat/observe recommendation
  in Sophie's voice ([spec-v11](spec-v11.md) §5.3) — `gelf-criteria` in particular
  reports the criteria status, not a "start chemotherapy" directive.

## 4. CI/CD & maintenance

Per the [spec-v100](spec-v100.md) §6 contract (re-binding [spec-v85](spec-v85.md) §6):

- **Maintenance classes (§6.3):** all five are **Class A** (fixed derivation papers /
  point weights) — **no** `docs/citation-staleness.md` row. Each citation names the
  **journal and authors** (Blood, J Clin Oncol, NEJM, Lancet Oncol), not an
  issuing-society acronym, so `check-citations.mjs` `ISSUER_PATTERN` does not fire.
  (The `nccn-ipi` *name* contains "NCCN" but its citation names the journal and
  Zhou et al.; verify at implementation that the rendered citation string carries no
  bare society acronym that trips the pattern.)
- **Build (§6.1):** `lib/lymphoma-v135.js` is the new compute module (`rIpi`,
  `nccnIpi`, `gelfCriteria`, `hodgkinIps`, `cllIpi`); `views/group-v135.js` is the
  new renderer module, exporting `RV135` into the `app.js` `RENDERERS` spread.
- **Gates (§6.2):** `lib/lymphoma-v135.js` is added to
  `test/unit/fuzz-tools.test.js` `MODULES` (zero non-finite leaks); each `META`
  example is pinned by the chromium `example-correctness` sweep; the catalog count
  moves on all **13 catalog-truth surfaces**; a11y, `mobile-no-hscroll`, and 44px
  touch-target checks pass for `views/group-v135.js`.

## 5. Files touched

```
docs/spec-v135.md                        (this file)
app.js                                   (+5 UTILITIES rows, group G; import group-v135 RV135 into RENDERERS)
lib/lymphoma-v135.js                     (new module: rIpi, nccnIpi, gelfCriteria, hodgkinIps, cllIpi)
lib/meta.js                              (+5 META entries: inline citation + citationUrl + accessed; cross-links to flipi, ipss-r-mds)
views/group-v135.js                      (new renderer module: 5 renderers)
docs/clinical-citations.md               (+ rows for the five sources)
test/unit/r-ipi.test.js, nccn-ipi.test.js, gelf-criteria.test.js, hodgkin-ips.test.js, cll-ipi.test.js  (≥3 boundary worked examples each)
test/unit/fuzz-tools.test.js             (add lib/lymphoma-v135.js to MODULES)
docs/audits/v12/r-ipi.md, nccn-ipi.md, gelf-criteria.md, hodgkin-ips.md, cll-ipi.md  (spec-v11 audit logs)
docs/scope-mdcalc-parity.md              (catalog count 598 -> 603; running ledger)
CHANGELOG.md                             (Unreleased: v135 entry, +5)
README.md, package.json                  (catalog count 598 -> 603; spec-progression line -> v135)
```

## 6. Acceptance criteria

v135 is fully shipped when:

- The implementing session has **re-run the §6.2 collision check** and confirmed all
  five ids are absent.
- All 5 tiles in §2 are live in Group G with a `META[id]` entry, an inline primary
  citation + `citationUrl` + `accessed`, ≥3 boundary worked examples each (including
  an **R-IPI very-good/good/poor group boundary**, an **NCCN-IPI risk-group flip**, a
  **GELF any-one-criterion met-vs-not flip**, a **Hodgkin IPS factor-count case**, and
  a **CLL-IPI very-high vs high boundary**), a [spec-v11](spec-v11.md) audit log, and a
  passing [spec-v29](spec-v29.md) §3 check.
- Every compute function uses `lib/num.js` and is covered by the
  [spec-v59](spec-v59.md) fuzz harness with zero non-finite leaks; partial inputs
  render a complete-the-fields fallback.
- `UTILITIES.length` is **603** (or live count + 5 if specs land out of order) and
  all catalog-truth surfaces ([spec-v46](spec-v46.md)) agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass.
- The CHANGELOG records v135 with the +5 catalog delta.

## 7. Out of scope for v135

- **No pathology or cytogenetic interpretation** — the CLL-IPI consumes the
  clinician-entered TP53/IGHV status; it does not interpret a FISH or sequencing
  report.
- **No treat/observe order** — `gelf-criteria` reports whether high-tumor-burden
  criteria are met; the treatment decision stays with the clinician.
- **No FLIPI re-implementation** — `flipi` is the live follicular index;
  `gelf-criteria` is its complementary treat-vs-watch flag, cross-linked, both kept.
- **No staging-system tile** — Ann Arbor / Lugano staging is an *input* here, not a
  separate browsable reference (which the [spec-v29](spec-v29.md) §3 test forbids).
