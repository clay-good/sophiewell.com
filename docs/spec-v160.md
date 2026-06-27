# spec-v160.md — Rheumatology activity & classification completion: RAPID3, DAPSA, SLICC 2012 SLE, and 2019 EULAR/ACR SLE (+4 tiles)

> Status: **SHIPPED (2026-06-26).** (was PROPOSED 2026-06-23.) Feature spec of the
> [spec-v157](spec-v157.md) **Subspecialty Depth** program. Adds **4**
> deterministic rheumatology activity/classification instruments that complete the
> surface begun by v147/v148/v156 — the routine US RA patient-reported index, the
> psoriatic-arthritis disease-activity index, and the two lupus classification
> criteria. None duplicates a live tile.
>
> Catalog effect at v160 close: **live count + 4** (catalog-truth gate enforces).
>
> Every prior spec (v4 through v159) remains in force. v160 adds no runtime
> network call and no AI; each tile obeys the [spec-v100](spec-v100.md) §2
> doctrine (including the §2 classification-tile clarification), passes the
> [spec-v29](spec-v29.md) §3 one-line test, ships its primary citation inline
> ([spec-v54](spec-v54.md)), and inherits the [spec-v59](spec-v59.md)
> output-safety contract. Item weights and classification thresholds are re-fetched
> and cross-verified to ≥2 sources at implementation ([spec-v97](spec-v97.md)).

## 1. Thesis

v147 shipped the physician-derived RA activity indices (CDAI/SDAI) and the 2010
ACR/EULAR RA classification; v148 added ASDAS/FFS/GCA; v156 added the SpA PROs and
ESSDAI. Four standard rheumatology instruments remain absent: **RAPID3** (the most
widely used PRO in US RA clinics, complementing CDAI/SDAI), **DAPSA** (the
psoriatic-arthritis disease-activity index, complementing the planned CASPAR
classification), and the **two lupus classification criteria** (SLICC 2012 and the
2019 EULAR/ACR weighted criteria), complementing the live `sledai-2k` *activity*
index.

## 2. What v160 adds (4 tiles)

### 2.1 `rapid3` — Routine Assessment of Patient Index Data 3 (RAPID3)

- **Citation:** Pincus T, Swearingen CJ, Bergman M, Yazici Y. RAPID3, an index of
  physical function, pain, and global status as "vital signs" compared to ACR20
  and DAS28. *Bull NYU Hosp Jt Dis.* 2009;67(2):211-225.
- **citationUrl:** (PMID 19583554 — verify at implementation)
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `rheumatology`, `primary-care`.
- **Inputs:** the three patient-reported components — physical function (10-item
  MDHAQ FN, 0–10 after the ÷3 transform), pain VAS (0–10), and patient global VAS
  (0–10).
- **Output:** **RAPID3 0–30** = FN + pain + global, with the categories (high >12,
  moderate 6.1–12, low 3.1–6, near-remission ≤3). Class A. The MDHAQ FN ÷3
  transform is surfaced so the function component is correctly 0–10.

### 2.2 `dapsa` — Disease Activity in Psoriatic Arthritis (DAPSA)

- **Citation:** Schoels MM, Aletaha D, Alasti F, Smolen JS. Disease activity in
  psoriatic arthritis (DAPSA): defining remission and treatment success. *Ann Rheum
  Dis.* 2016;75(5):811-818.
- **citationUrl:** https://doi.org/10.1136/annrheumdis-2015-207507 (verify at
  implementation)
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `rheumatology`, `dermatology`.
- **Inputs:** 68-joint tender count, 66-joint swollen count, patient global VAS
  (0–10 cm), patient pain VAS (0–10 cm), and CRP (mg/dL).
- **Output:** **DAPSA = TJC68 + SJC66 + patientGlobal + pain + CRP(mg/dL)** with the
  cutoffs (remission ≤4, low 5–14, moderate 15–28, high >28). Class A. The **CRP
  unit (mg/dL, not mg/L)** is the chief input-unit risk and is labeled explicitly.

### 2.3 `slicc-sle` — SLICC 2012 SLE Classification Criteria

- **Citation:** Petri M, Orbai AM, Alarcón GS, et al. Derivation and validation of
  the Systemic Lupus International Collaborating Clinics classification criteria for
  systemic lupus erythematosus. *Arthritis Rheum.* 2012;64(8):2677-2686.
- **citationUrl:** https://doi.org/10.1002/art.34473 (verify at implementation)
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `rheumatology`.
- **Inputs:** the 11 clinical and 6 immunologic criteria (checkboxes).
- **Output:** **classifies as SLE** if **≥4 criteria (≥1 clinical and ≥1
  immunologic)**, *or* **biopsy-proven lupus nephritis with ANA or anti-dsDNA**.
  Class A — deterministic rule logic; both qualifying pathways are evaluated and
  the satisfied pathway is named.

### 2.4 `sle-2019-eular-acr` — 2019 EULAR/ACR SLE Classification Criteria

- **Citation:** Aringer M, Costenbader K, Daikh D, et al. 2019 European League
  Against Rheumatism/American College of Rheumatology classification criteria for
  systemic lupus erythematosus. *Arthritis Rheumatol.* 2019;71(9):1400-1412.
- **citationUrl:** https://doi.org/10.1002/art.40930 (verify at implementation)
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `rheumatology`.
- **Inputs:** the **entry criterion** (ANA ≥1:80 ever — a hard gate), then the
  weighted additive criteria across 7 clinical and 3 immunologic domains (only the
  **highest-weighted item per domain** counts).
- **Output:** **classifies as SLE** if the entry criterion is met **and** the
  weighted total **≥10** with **≥1 clinical criterion**. Class A — the entry gate,
  the within-domain max-weight rule, and the ≥10 threshold are each surfaced. The
  weight table is **re-fetched and cross-verified to ≥2 sources** (the per-item
  weights are the correctness-critical content).

## 3. Per-tile robustness

- **`rapid3`, `dapsa`** are bounded weighted sums; every input is finite-checked,
  the MDHAQ ÷3 transform and the DAPSA CRP-unit are handled explicitly, and the
  [spec-v59](spec-v59.md) fuzz harness confirms no `NaN` band. The category
  boundaries (RAPID3 3/3.1, 6/6.1, 12; DAPSA 4/5, 14/15, 28) are exercised.
- **`slicc-sle`** evaluates **both** qualifying pathways (≥4-with-distribution and
  the biopsy-nephritis shortcut); a unit test asserts the biopsy pathway classifies
  with <4 total criteria when ANA/anti-dsDNA is present.
- **`sle-2019-eular-acr`** enforces the **ANA entry gate first** (no ANA ⇒ not
  classified regardless of total), applies the **within-domain maximum-weight rule**
  (two items in one domain do not both count), and requires ≥1 clinical criterion —
  each rule unit-tested; an unmet entry gate renders the "entry criterion not met"
  state rather than a misleading score.
- All four render the [spec-v50](spec-v50.md) §3 posture note (classification
  criteria are for study/standardization, not a substitute for clinical diagnosis)
  and defer the diagnosis/treatment to the clinician ([spec-v11](spec-v11.md) §5.3).

## 4. CI/CD & maintenance

Per the [spec-v100](spec-v100.md) §6 contract:

- **Maintenance class (§6.3):** all four cite **journals/authors** (Pincus,
  Schoels, Petri, Aringer). The 2019 criteria are commonly cited as **"EULAR/ACR"**
  — if the META citation text contains those acronyms it **trips `ISSUER_PATTERN`**
  and forces a **documentation-only `docs/citation-staleness.md` row** (fixed 2012/
  2019 criteria, not drifting — same treatment as the v147 ACR/EULAR RA row, which
  this spec mirrors). SLICC and RAPID3/DAPSA do not trip it.
- **Build & gates (§6.1/§6.2):** the four computes live in the new
  `lib/rheum-v160.js` module (`rapid3`, `dapsa`, `sliccSle`, `sle2019EularAcr`),
  added to `fuzz-tools.test.js` `MODULES`. Renderers live in the new
  `views/group-v160.js`; its `RV160` export is spread into `app.js` `RENDERERS`.
  The catalog count moves on all **13 catalog-truth surfaces**; a11y,
  `mobile-no-hscroll`, `mobile-touch-targets`, and the chromium
  `example-correctness` sweep pass. Watch the META `band[0].text` **200-char cap**
  (the 2019 weighted-criteria description is long — abbreviate per the v143 fix).

## 5. Files touched

```
docs/spec-v160.md                        (this file)
app.js                                   (+4 UTILITIES rows, group G; import group-v160 RV160 into RENDERERS)
lib/rheum-v160.js                        (new module: rapid3, dapsa, sliccSle, sle2019EularAcr)
lib/meta.js                              (+4 META entries: inline citation + citationUrl + accessed; cross-links to das28, cdai-ra/sdai-ra, sledai-2k, caspar)
views/group-v160.js                      (new renderer module: 4 renderers)
docs/clinical-citations.md               (+ rows for the four sources)
docs/citation-staleness.md               (+ documentation-only row for sle-2019-eular-acr if it trips ISSUER_PATTERN)
test/unit/rapid3.test.js, dapsa.test.js, slicc-sle.test.js, sle-2019-eular-acr.test.js   (≥3 boundary worked examples each)
test/unit/fuzz-tools.test.js             (add lib/rheum-v160.js to MODULES)
docs/audits/v12/rapid3.md, dapsa.md, slicc-sle.md, sle-2019-eular-acr.md                 (spec-v11 audit logs)
docs/scope-subspecialty-depth.md         (catalog ledger; advance the v157 running count)
CHANGELOG.md                             (Unreleased: v160 entry, +4)
README.md, package.json                  (catalog count + spec-progression line -> v160)
```

## 6. Acceptance criteria

v160 is fully shipped when:

- The implementing session has re-run the [spec-v85 §6.2](spec-v85.md) collision
  check and confirmed all four ids are absent.
- All 4 tiles are live with a `META[id]` entry, inline primary citation +
  `citationUrl` + `accessed`, ≥3 boundary worked examples each (including a
  **RAPID3 with the MDHAQ ÷3 function transform**, a **DAPSA remission ≤4 boundary
  with CRP in mg/dL**, a **SLICC biopsy-nephritis shortcut classifying with <4
  total criteria**, and a **2019 EULAR/ACR case with the ANA entry gate unmet**), a
  [spec-v11](spec-v11.md) audit log, and a passing [spec-v29](spec-v29.md) §3 check.
- The SLE entry gate / within-domain max-weight / both-pathway logic is unit-tested;
  blank inputs render a complete-the-fields fallback.
- Every compute uses `lib/num.js` where numeric and is covered by the
  [spec-v59](spec-v59.md) fuzz harness with zero non-finite leaks.
- `UTILITIES.length` is live count + 4 and all catalog-truth surfaces agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass; the
  CHANGELOG records v160 with the +4 delta.

## 7. Out of scope for v160

- **No 1997 ACR SLE criteria** — the SLICC 2012 and 2019 EULAR/ACR criteria
  supersede them for classification; the older list is not re-implemented.
- **No PASI/skin re-implementation** — DAPSA quantifies joint activity; psoriasis
  skin severity is `pasi` (v151), cross-linked.
- **No automatic diagnosis** — classification criteria are reported as such, with the
  diagnosis left to the clinician ([spec-v50](spec-v50.md) §3).
