# spec-v268.md — The Advanced Lung Cancer Inflammation Index (ALI): a composite BMI / albumin / NLR prognostic index (+1 tile)

> Status: **SHIPPED (2026-07-09, +1).** Extends the [spec-v229](spec-v229.md)/[spec-v230](spec-v230.md)/[spec-v267](spec-v267.md)
> prognostic inflammation-index family (NLR/PLR/SII/LMR/SIRI/PIV/CAR/HALP). Proposes **1**
> tile and ships it. **The id was verified absent** ([spec-v85 §6.2](spec-v85.md)) by a
> direct scan of `app.js` and the MCP adapter set.
>
> Catalog effect: **live `UTILITIES.length` + 1**, enforced by the catalog-truth gate
> ([spec-v46](spec-v46.md)).
>
> Every prior spec remains in force. v268 adds no runtime network call and no AI; the tile
> obeys the [spec-v100](spec-v100.md) §2 doctrine, passes the [spec-v29](spec-v29.md) §3
> one-line test, ships its citation inline ([spec-v54](spec-v54.md)), inherits the
> [spec-v59](spec-v59.md) output-safety contract, renders the [spec-v50](spec-v50.md) §3
> posture note, and honors [spec-v11](spec-v11.md) §5.3 (**it computes a lab-derived value,
> never a diagnosis or treatment order**). **The formula is re-fetched and cross-verified
> against ≥2 independent open sources at implementation** ([spec-v97](spec-v97.md)).

## 1. Thesis

The catalog carries the CBC-derived indices (NLR/PLR/LMR/SII/SIRI/PIV/CAR), the nutrition
indices (PNI/CONUT/GNRI), and — as of [spec-v267](spec-v267.md) — the four-factor HALP
composite. It did **not** carry the **ALI**, the composite that folds body-mass index,
serum albumin, and the neutrophil-to-lymphocyte ratio into a single number. ALI is a
transparent product/quotient, freely reproducible from open sources, and is decision
support — **never a diagnosis or order**.

## 2. What v268 adds (1 tile)

### 2.1 `ali-index` — Advanced Lung Cancer Inflammation Index

- **Citation:** Jafri SH, Shi R, Mills G. Advanced lung cancer inflammation index (ALI) at
  diagnosis is a prognostic marker in patients with metastatic non-small cell lung cancer
  (NSCLC): a retrospective review. *BMC Cancer.* 2013;13:158.
- **citationUrl:** https://doi.org/10.1186/1471-2407-13-158
- **Group:** G. **Specialties:** `hematology`, `oncology`, `internal-medicine`.
- **Formula (cross-verified, [spec-v97](spec-v97.md)):** ALI = BMI (kg/m²) × serum albumin
  (g/dL) / NLR, where NLR = ANC / ALC. The derivation (Jafri 2013, metastatic NSCLC) and
  subsequent pan-cancer validations reuse the identical BMI × albumin / NLR definition.
- **Inputs — 4 values:** BMI (kg/m²), serum albumin (g/dL), absolute neutrophil count
  (10⁹/L), absolute lymphocyte count (10⁹/L). The tile computes NLR internally and echoes it.
- **Output:** the **ALI value** with the context-dependent posture — a **HIGHER value is more
  favorable**, so a **LOWER value is less favorable**, and there is **no universal cutoff**
  (cohort- and cancer-specific), mirroring the SII/LMR/HALP handling. It reports a
  lab-derived value, **never a diagnosis or treatment order** ([spec-v11](spec-v11.md) §5.3).
  Class A. Cross-links `nlr`, `halp-score`, `pni-onodera`.

## 3. Per-tile robustness

- **The compute routes through `lib/num.js` and is finite-guarded** — a missing or
  out-of-range input (including a zero lymphocyte count) renders a "complete the fields"
  fallback rather than a `NaN` or a divide-by-zero.
- **The tile reports the fired inputs and the derived NLR** ([spec-v59](spec-v59.md)) — the
  detail line echoes BMI, albumin, the computed NLR, and the counts — so a result is never
  read without its basis.
- **It renders a lab-derived value, not an order** ([spec-v11](spec-v11.md) §5.3) and renders
  the [spec-v50](spec-v50.md) §3 posture note.
- **It flows through the [spec-v59](spec-v59.md) fuzz harness with zero non-finite leaks.**

## 4. CI/CD & maintenance

- **Maintenance class (§6.3):** **Class A** — a fixed formula cited by journal + authors. No
  issuer acronym trips `ISSUER_PATTERN`.
- **Build & gates:** the compute lives in a new `lib/inflam-v268.js`, added to
  `test/unit/fuzz-tools.test.js` `MODULES`. The renderer lives in a new `views/group-v268.js`;
  its `RV268` export is spread into the `app.js` `RENDERERS` map. Every input carries a real
  `<label for>`. The catalog count moves on all catalog-truth surfaces using the live
  `UTILITIES.length + 1`.
- **Specialties** are drawn from the closed `ALLOWED_SPECIALTIES` vocabulary.
- **MCP exposure (post-ship):** a Class A deterministic compute, routinely MCP-adaptable — a
  follow-up MCP wave exposes it per the [spec-v85](spec-v85.md) recipe, self-describing the
  fired inputs and the derived NLR so the numeric round-trip passes.

## 5. Files touched

```
docs/spec-v268.md                        (this file)
app.js                                   (+1 UTILITIES row; import group-v268 RV268 into RENDERERS)
lib/inflam-v268.js                       (new: ali + finite guards)
lib/meta.js                              (+1 META entry: inline citation + citationUrl + accessed; cross-links nlr, halp-score, pni-onodera)
views/group-v268.js                      (new renderer module: 1 renderer)
test/unit/inflam-v268.test.js            (worked examples)
test/unit/fuzz-tools.test.js             (add lib/inflam-v268.js to MODULES)
docs/scope-post-parity.md                (catalog count live -> live+1)
docs/scope-mdcalc-parity.md              (ledger close-line -> is 1128.)
CHANGELOG.md, README.md, package.json    (catalog count live -> live+1; spec-progression line)
```

## 6. Acceptance criteria

v268 is fully shipped when:

- The implementing session has **re-run the [spec-v85 §6.2](spec-v85.md) collision check**
  and confirmed `ali-index` is absent (as verified at draft).
- The tile is live (Class A) with a `META[id]` entry, inline citation + `citationUrl` +
  `accessed`, and worked examples spanning a typical value and a low (less favorable)
  high-inflammation profile.
- The formula is reproduced from the primary source and re-verified against ≥ 2 independent
  references at implementation ([spec-v97](spec-v97.md)); the tile states the units and that
  it computes NLR internally.
- The compute is finite-guarded, routes through `lib/num.js`, guards the divide-by-zero, and
  is covered by the [spec-v59](spec-v59.md) fuzz harness with **zero non-finite leaks**.
- `UTILITIES.length` is **live + 1** and all catalog-truth surfaces agree.
- `npm run lint`, `npm run test`, and `npm run build` all pass; the CHANGELOG records v268
  with the +1 delta.

## 7. Out of scope for v268

- **No diagnosis or treatment order** — the tile computes a lab-derived value; interpretation
  stays with the clinician and the patient ([spec-v11](spec-v11.md) §5.3).
- **No hardcoded cutoff** — ALI cutoffs (often ~18 in NSCLC) are cohort- and cancer-specific
  and are not universal; the tile reports the value with the "lower is less favorable, no
  universal cutoff" posture rather than asserting a threshold.
