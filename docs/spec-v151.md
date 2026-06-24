# spec-v151.md — Dermatology severity indices: PASI, EASI, SCORAD, and DLQI (+4 tiles)

> Status: **PROPOSED (2026-06-23).** Feature spec of the
> [spec-v150](spec-v150.md) **Post-Parity Coverage** program. Adds **4**
> deterministic dermatology severity instruments that fill a confirmed gap —
> dermatology has **no** scored-severity tile in the live catalog. None
> duplicates a live tile.
>
> Catalog effect at v151 close: **live count + 4** (the catalog-truth gate
> enforces agreement; nominal 679 → 683 if specs land in order).
>
> Every prior spec (v4 through v150) remains in force. v151 adds no runtime
> network call and no AI; each tile obeys the [spec-v100](spec-v100.md) §2
> doctrine (re-binding [spec-v85](spec-v85.md) §2), passes the
> [spec-v29](spec-v29.md) §3 one-line test, ships its primary citation inline
> ([spec-v54](spec-v54.md)), and inherits the [spec-v59](spec-v59.md)
> output-safety contract. All coefficients/region weights are re-fetched and
> cross-verified to ≥2 sources at implementation ([spec-v97](spec-v97.md)).

## 1. Thesis

The catalog covers dermatologic *infection/risk* rules (`lrinec`, `alt-70`) but
has no instrument for the chronic inflammatory dermatoses that fill a
dermatology clinic. The four below are the field's daily quantitative tools — the
psoriasis severity index that gates biologics, the two competing atopic-dermatitis
indices, and the universal skin quality-of-life score. Each is a bounded
region/item-weighted sum (or computed composite) with published bands.

## 2. What v151 adds (4 tiles)

### 2.1 `pasi` — Psoriasis Area and Severity Index (PASI)

- **Citation:** Fredriksson T, Pettersson U. Severe psoriasis — oral therapy with
  a new retinoid. *Dermatologica.* 1978;157(4):238-244.
- **citationUrl:** https://doi.org/10.1159/000250839 (verify at implementation)
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `dermatology`, `rheumatology`, `primary-care`.
- **Inputs:** for each of the **4 body regions** (head/neck, upper limbs, trunk,
  lower limbs): erythema, induration, and desquamation each **0–4**, plus an area
  score **0–6** (0=0%, 1=<10%, 2=10–29%, 3=30–49%, 4=50–69%, 5=70–89%, 6=90–100%).
- **Output:** **PASI 0–72** = Σ over regions of `(E+I+D) × area × regionWeight`
  with weights **head 0.1, upper limbs 0.2, trunk 0.3, lower limbs 0.4**; reports
  the total and the common interpretive bands (mild <10, moderate 10–20, severe
  >20) and the PASI-75/90 reference framing. Class A.

### 2.2 `easi` — Eczema Area and Severity Index (EASI)

- **Citation:** Hanifin JM, Thurston M, Omoto M, et al. The Eczema Area and
  Severity Index (EASI): assessment of reliability in atopic dermatitis. *Exp
  Dermatol.* 2001;10(1):11-18.
- **citationUrl:** https://doi.org/10.1034/j.1600-0625.2001.100102.x (verify at
  implementation)
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `dermatology`, `pediatrics`, `primary-care`.
- **Inputs:** for each of the **4 regions** (head/neck, upper limbs, trunk, lower
  limbs): erythema, edema/papulation, excoriation, lichenification each **0–3**,
  plus an area score **0–6**. The implementation must carry the **age-dependent
  region weights** — adult/≥8 yr (head 0.1, upper 0.2, trunk 0.3, lower 0.4) vs
  child <8 yr (head 0.2, upper 0.2, trunk 0.3, lower 0.3).
- **Output:** **EASI 0–72** = Σ `(E+Ed+Ex+L) × area × regionWeight`; reports total
  and severity strata (clear 0, mild 0.1–5.9, moderate 6–22.9, severe ≥23 per
  Leshem 2015). Class A. Near-neighbor: `scorad` — both kept, cross-linked
  (different items/weighting).

### 2.3 `scorad` — SCORAD (SCORing Atopic Dermatitis)

- **Citation:** European Task Force on Atopic Dermatitis. Severity scoring of
  atopic dermatitis: the SCORAD index. *Dermatology.* 1993;186(1):23-31.
- **citationUrl:** https://doi.org/10.1159/000247298 (verify at implementation)
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `dermatology`, `pediatrics`, `primary-care`.
- **Inputs:** **A** = extent (% BSA affected, 0–100, by rule-of-nines); **B** = 6
  intensity items (erythema, edema/papulation, oozing/crusting, excoriation,
  lichenification, dryness) each **0–3** → 0–18; **C** = 2 subjective VAS
  (pruritus, sleeplessness) each **0–10** → 0–20.
- **Output:** **SCORAD = A/5 + 7B/2 + C**, range **0–103**; bands mild <25,
  moderate 25–50, severe >50; also reports **oSCORAD = A/5 + 7B/2** (objective,
  subjective items dropped). Class A. Computation is guarded arithmetic over
  bounded inputs.

### 2.4 `dlqi` — Dermatology Life Quality Index (DLQI)

- **Citation:** Finlay AY, Khan GK. Dermatology Life Quality Index (DLQI) — a
  simple practical measure for routine clinical use. *Clin Exp Dermatol.*
  1994;19(3):210-216.
- **citationUrl:** https://doi.org/10.1111/j.1365-2230.1994.tb01167.x (verify at
  implementation)
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `dermatology`, `primary-care`.
- **Inputs:** 10 questions each **0–3** (not relevant = 0). The "not relevant"
  option and question-7 work-prevented branch are handled per the scoring manual.
- **Output:** **DLQI 0–30** = simple sum; bands **0–1 no effect, 2–5 small, 6–10
  moderate, 11–20 very large, 21–30 extremely large** effect on quality of life.
  Class A.

## 3. Per-tile robustness

- **PASI/EASI/SCORAD are bounded region/item-weighted sums** over selects and
  percentage inputs; every input is finite-checked; the region-weight table is a
  fixed constant (EASI's table is **age-branched** and must be exercised on both
  branches). No combination yields `NaN`/`undefined` — the [spec-v59](spec-v59.md)
  fuzz harness covers the percentage→area-score mapping and the weighted sum.
- **EASI age-weight branch** is the chief correctness risk: the child (<8 yr)
  head/lower-limb weights differ; an explicit unit test asserts the pediatric and
  adult weightings on the same intensity inputs produce the documented different
  totals.
- **DLQI** is a guarded 0–3 sum; the "not relevant" and unanswered handling is
  spelled out so a partially-completed form renders a surfaced `valid:false`
  fallback rather than an undercounted total.
- All four render the [spec-v50](spec-v50.md) §3 clinical-posture note (the score
  reflects the clinician's/patient's read, not an image parse) and quote the
  source's bands; none authors a treatment-escalation order in Sophie's voice
  ([spec-v11](spec-v11.md) §5.3).

## 4. CI/CD & maintenance

Per the [spec-v100](spec-v100.md) §6 contract:

- **Maintenance class (§6.3):** all four are **Class A** — fixed published indices
  cited by journal + authors (not an issuing society), so none trips the
  `ISSUER_PATTERN` and **none needs a `docs/citation-staleness.md` row.**
- **Build & gates (§6.1/§6.2):** the four computes live in the new `lib/derm-v151.js`
  module (`pasi`, `easi`, `scorad`, `dlqi`), added to the
  `test/unit/fuzz-tools.test.js` `MODULES` list. Renderers live in the new
  `views/group-v151.js`; its `RV151` export is spread into `app.js` `RENDERERS`.
  The catalog count moves on all **13 catalog-truth surfaces** in the same change;
  a11y, `mobile-no-hscroll`, `mobile-touch-targets`, and the chromium
  `example-correctness` sweep pass for `views/group-v151.js`.

## 5. Files touched

```
docs/spec-v151.md                        (this file)
app.js                                   (+4 UTILITIES rows, group G; import group-v151 RV151 into RENDERERS)
lib/derm-v151.js                         (new module: pasi, easi, scorad, dlqi)
lib/meta.js                              (+4 META entries: inline citation + citationUrl + accessed)
views/group-v151.js                      (new renderer module: 4 renderers)
docs/clinical-citations.md               (+ rows for the four sources)
test/unit/pasi.test.js, easi.test.js, scorad.test.js, dlqi.test.js   (≥3 boundary worked examples each)
test/unit/fuzz-tools.test.js             (add lib/derm-v151.js to MODULES)
docs/audits/v12/pasi.md, easi.md, scorad.md, dlqi.md                 (spec-v11 audit logs)
docs/scope-post-parity.md                (catalog ledger; advance the v150 program running count)
CHANGELOG.md                             (Unreleased: v151 entry, +4)
README.md, package.json                  (catalog count + spec-progression line -> v151)
```

## 6. Acceptance criteria

v151 is fully shipped when:

- The implementing session has re-run the [spec-v85 §6.2](spec-v85.md) collision
  check and confirmed all four ids are absent.
- All 4 tiles are live with a `META[id]` entry, inline primary citation +
  `citationUrl` + `accessed`, ≥3 boundary worked examples each (including a **PASI
  region-weight worked total**, an **EASI adult-vs-child weight divergence on
  identical intensities**, a **SCORAD A/5 + 7B/2 + C composite**, and a **DLQI band
  boundary at 5/6 and 10/11**), a [spec-v11](spec-v11.md) audit log, and a passing
  [spec-v29](spec-v29.md) §3 check.
- Every compute uses `lib/num.js` where numeric and is covered by the
  [spec-v59](spec-v59.md) fuzz harness with zero non-finite leaks; the EASI
  age-weight branch is exercised on both branches.
- `UTILITIES.length` is live count + 4 and all catalog-truth surfaces agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass; the
  CHANGELOG records v151 with the +4 delta.

## 7. Out of scope for v151

- **No image ingestion or BSA auto-estimation** — extent/area inputs are the
  clinician's bounded read of the exam.
- **No PASI-75/90 longitudinal tracking** — each tile computes a single
  point-in-time score; trend storage is out of scope.
- **No copyrighted instrument** — POEM and the patient-oriented SCORAD variants
  with licensed item text are intentionally excluded ([spec-v150](spec-v150.md) §2).
