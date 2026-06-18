# spec-v128.md — Renal excretion & dialysis math: FE-phosphate, FE-magnesium, nPCR/nPNA, standard Kt/V, and electrolyte-free water clearance (+5 tiles)

> Status: **PROPOSED (2026-06-17).** Feature spec of the [spec-v100](spec-v100.md)
> MDCalc Parity Completion program, **Wave 5** (GI / hepatology / nephrology /
> acid-base / urology). Adds **5** deterministic renal-excretion and dialysis-math
> tiles that fill confirmed gaps beside `fena-feurea` and `ktv-urr`. None duplicates
> a live tile.
>
> Catalog effect: **560 + 5 = 565 tiles.**
>
> Every prior spec (v4 through v127) remains in force. v128 adds no runtime network
> call and no AI; each tile obeys the [spec-v100](spec-v100.md) §2 doctrine
> (re-binding the [spec-v85](spec-v85.md) §2 doctrine) and the
> [spec-v100](spec-v100.md) §6 CI/CD contract, passes the [spec-v29](spec-v29.md) §3
> one-line test, ships its primary citation inline ([spec-v54](spec-v54.md)), and
> inherits the [spec-v59](spec-v59.md) output-safety contract.

## 1. Thesis

The catalog has the sodium/urea fractional-excretion math (`fena-feurea`) and the
single-session dialysis adequacy (`ktv-urr`), but the **electrolyte-specific
fractional excretions** and the **frequency-normalized / nutrition** dialysis
quantities are absent:

- **There is no FE-phosphate** — the fractional excretion of phosphate, the standard
  workup of hypophosphatemia (renal wasting vs GI loss); it sits directly beside
  `fena-feurea`.
- **There is no FE-magnesium** — the fractional excretion of magnesium (with the ×0.7
  free-fraction correction), the parallel hypomagnesemia workup.
- **There is no nPCR/nPNA** — the normalized protein catabolic / nitrogen-appearance
  rate, the dialysis-nutrition adequacy measure that joins Kt/V.
- **There is no standard Kt/V (stdKt/V)** — the frequency-normalized weekly dialysis
  dose that lets thrice-weekly, short-daily, and nocturnal schedules be compared on
  one axis; `ktv-urr` gives only single-session Kt/V.
- **There is no electrolyte-free water clearance** — the quantity that drives
  dysnatremia, distinct from the textbook free-water clearance.

Each is a published, deterministic formula; v128 brings the renal-excretion and
dialysis-math surface to parity.

## 2. What v128 adds (5 tiles)

### 2.1 `fepo4` — Fractional excretion of phosphate

- **Citation:** Walton RJ, Bijvoet OL. Nomogram for derivation of renal threshold
  phosphate concentration. *Lancet.* 1975;2(7929):309-310.
- **citationUrl:** https://doi.org/10.1016/S0140-6736(75)92736-1
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `nephrology`, `internal-medicine`, `dialysis-nursing`.
- **Inputs:** urine and plasma phosphate, urine and plasma creatinine (consistent
  units within each pair).
- **Output:** **FEPO₄ (%) = (urine PO₄ × plasma Cr) ÷ (plasma PO₄ × urine Cr) × 100**,
  with the renal-wasting reading (> ~5–20% in hypophosphatemia suggests renal loss).
  Class A. **Near-neighbor:** `fena-feurea` — cross-linked, same fractional-excretion
  family.

### 2.2 `femg` — Fractional excretion of magnesium

- **Citation:** Elisaf M, Panteli K, Theodorou J, Siamopoulos KC. Fractional excretion
  of magnesium in normal subjects and in patients with hypomagnesemia. *Miner
  Electrolyte Metab.* 1998;24(2-3):315-318.
- **citationUrl:** https://doi.org/10.1159/000057389
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `nephrology`, `internal-medicine`, `dialysis-nursing`.
- **Inputs:** urine and plasma magnesium, urine and plasma creatinine.
- **Output:** **FEMg (%) = (urine Mg × plasma Cr) ÷ (0.7 × plasma Mg × urine Cr) ×
  100** (the 0.7 corrects for the protein-bound, non-filtered fraction), with the
  renal-wasting reading (> ~2–4% in hypomagnesemia suggests renal loss). Class A.
  Cross-links `fena-feurea` and `fepo4`.

### 2.3 `npcr-pna` — Normalized protein catabolic rate (nPCR/nPNA)

- **Citation:** Depner TA, Daugirdas JT. Equations for normalized protein catabolic
  rate based on two-point modeling of hemodialysis urea kinetics. *J Am Soc Nephrol.*
  1996;7(5):780-785.
- **citationUrl:** https://doi.org/10.1681/ASN.V75780
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `nephrology`, `dialysis-nursing`, `internal-medicine`.
- **Inputs:** pre- and post-dialysis BUN, single-pool Kt/V, the interdialytic
  interval, and body weight.
- **Output:** the **nPCR (g/kg/day)** via the published two-point urea-kinetic
  equation, with the adequacy reading (nutrition target ~ 1.0–1.2 g/kg/day). Class A.
  Cross-links `ktv-urr` and (v128) `std-ktv`.

### 2.4 `std-ktv` — Standard Kt/V (stdKt/V)

- **Citation:** Leypoldt JK, Jaber BL, Zimmerman DL. Predicting treatment dose for
  novel therapies using urea standard Kt/V. *Hemodial Int.* 2003;7(2):138-143.
- **citationUrl:** https://doi.org/10.1046/j.1492-7535.2003.00020.x
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `nephrology`, `dialysis-nursing`, `internal-medicine`.
- **Inputs:** single-pool (or equilibrated) Kt/V per session, treatment time, and the
  number of sessions per week.
- **Output:** the **weekly stdKt/V** via the Leypoldt frequency-normalized form,
  letting thrice-weekly, short-daily, and nocturnal schedules be compared (target
  ≥ 2.1/wk). Class A. **Near-neighbor:** `ktv-urr` (single-session) — cross-linked,
  both kept.

### 2.5 `efwc` — Electrolyte-free water clearance

- **Citation:** Rose BD. New approach to disturbances in the plasma sodium
  concentration. *Am J Med.* 1986;81(6):1033-1040.
- **citationUrl:** https://doi.org/10.1016/0002-9343(86)90402-0
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `nephrology`, `critical-care`, `internal-medicine`.
- **Inputs:** urine volume, urine sodium, urine potassium, and plasma sodium.
- **Output:** **EFWC = urine volume × [1 − (urine Na + urine K) ÷ plasma Na]**, with
  the dysnatremia reading (positive EFWC drives hyponatremia; negative drives
  hypernatremia). Class A. Cross-links the existing sodium-correction tiles.

## 3. Per-tile robustness

- **The fractional-excretion tiles (`fepo4`, `femg`) guard their denominators** —
  plasma analyte × urine creatinine must be nonzero and positive; a zero/blank
  denominator yields a surfaced `valid:false` complete-the-fields fallback, never a
  division by zero or a `NaN` percent. FEMg's 0.7 free-fraction constant is applied
  before the division so it never zeroes the denominator.
- **`npcr-pna` and `std-ktv` guard their kinetic math** — Kt/V, treatment time, and
  weight must be positive; the urea-kinetic equation and the frequency normalization
  use overflow-safe forms, returning a fallback rather than a number from a degenerate
  input.
- **`efwc` is a bounded arithmetic identity** — plasma sodium must be nonzero; the
  signed result (gain vs loss of free water) is reported with its sign, not silently
  capped, mirroring the program's signed-value handling.
- All five render the [spec-v50](spec-v50.md) §3 clinical posture note and quote the
  source's interpretation; none authors a treatment recommendation in Sophie's voice
  ([spec-v11](spec-v11.md) §5.3). Each compute uses `lib/num.js` and joins the fuzz
  harness with zero non-finite leaks.

## 4. CI/CD & maintenance

Per the [spec-v100](spec-v100.md) §6 contract (re-binding [spec-v85](spec-v85.md) §6):

- **Maintenance classes (§6.3):** all five tiles are **Class A** (fixed arithmetic
  formulas and kinetic equations) — **no** `docs/citation-staleness.md` row. The
  citations name the **journal and authors** (Lancet/Walton-Bijvoet, Miner Electrolyte
  Metab/Elisaf, J Am Soc Nephrol/Depner-Daugirdas, Hemodial Int/Leypoldt, Am J Med/
  Rose), **not** a society acronym, so none trips the `ISSUER_PATTERN` staleness gate.
- **Build & gates (§6.1/§6.2):** `lib/renal-v128.js` (computes `fepo4`, `femg`,
  `npcrPna`, `stdKtv`, `efwc`) is added to `test/unit/fuzz-tools.test.js` `MODULES`
  (zero non-finite leaks, with every division explicitly fuzzed for zero/negative
  denominators); the renderer is `views/group-v128.js` with its `RV128` export added
  to the `app.js` `RENDERERS` spread. Each `META` example is pinned by the chromium
  `example-correctness` sweep; the catalog count moves on all **13 catalog-truth
  surfaces**; a11y, `mobile-no-hscroll`, and 44px touch-target checks pass for
  `views/group-v128.js`.

## 5. Files touched

```
docs/spec-v128.md                        (this file)
app.js                                   (+5 UTILITIES rows, group E; import group-v128 renderers into RENDERERS)
lib/renal-v128.js                        (new module: fepo4, femg, npcrPna, stdKtv, efwc)
lib/meta.js                              (+5 META entries: inline citation + citationUrl + accessed; cross-links to fena-feurea, ktv-urr, sodium-correction tiles)
views/group-v128.js                      (new renderer module: 5 renderers; RV128 export)
docs/clinical-citations.md               (+ rows for the five sources)
test/unit/fepo4.test.js, femg.test.js, npcr-pna.test.js, std-ktv.test.js, efwc.test.js  (≥3 boundary worked examples each)
test/unit/fuzz-tools.test.js             (add lib/renal-v128.js to MODULES)
docs/audits/v12/fepo4.md, femg.md, npcr-pna.md, std-ktv.md, efwc.md  (spec-v11 audit logs)
docs/scope-mdcalc-parity.md              (catalog count 560 -> 565)
CHANGELOG.md                             (Unreleased: v128 entry, +5)
README.md, package.json                  (catalog count 560 -> 565; spec-progression line -> v128)
```

## 6. Acceptance criteria

v128 is fully shipped when:

- The implementing session has **re-run the §6.2 collision check** and confirmed all
  five ids are absent from the live catalog (distinct from `fena-feurea`, `ktv-urr`).
- All 5 tiles in §2 are live in Group E with a `META[id]` entry, an inline primary
  citation + `citationUrl` + `accessed`, ≥3 boundary worked examples each — including a
  worked FEPO₄ crossing the renal-wasting threshold, an FEMg with the 0.7 correction
  applied, an nPCR at the 1.0 g/kg/day nutrition target, a stdKt/V crossing the
  **2.1/wk adequacy boundary**, and an EFWC showing a sign flip (free-water gain vs
  loss) — a [spec-v11](spec-v11.md) audit log each, and a passing
  [spec-v29](spec-v29.md) §3 check.
- The fractional-excretion and kinetic tiles guard every denominator; `efwc` requires a
  nonzero plasma sodium and reports the signed result; partial inputs render a
  complete-the-fields fallback.
- Every compute function uses `lib/num.js` and is covered by the
  [spec-v59](spec-v59.md) fuzz harness with zero non-finite leaks.
- No tile carries a `docs/citation-staleness.md` row (all Class A); the citations name
  journals/authors, not societies.
- `UTILITIES.length` is **565** (or the then-current live count + 5 if specs land out
  of order) and all catalog-truth surfaces ([spec-v46](spec-v46.md)) agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass.
- The CHANGELOG records v128 with the +5 catalog delta.

## 7. Out of scope for v128

- **No lab-feed or dialysis-machine integration** — every value is a clinician input;
  the tiles compute the excretion/adequacy quantity from entered labs and settings.
- **No auto-repletion, auto-prescription-change, or auto-fluid order** — each tile
  reports the computed quantity and the source's stated interpretation; the management
  decision stays with the clinician and local protocol ([spec-v11](spec-v11.md) §5.3).
- **No duplication of `fena-feurea`/`ktv-urr`** — the FE-electrolyte siblings and
  stdKt/V extend, not replace, the existing tiles; cross-linked, all kept.
