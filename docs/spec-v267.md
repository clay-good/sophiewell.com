# spec-v267.md — The HALP score: a composite hemoglobin / albumin / lymphocyte / platelet prognostic index (+1 tile)

> Status: **SHIPPED (2026-07-09, +1).** Extends the [spec-v229](spec-v229.md)/[spec-v230](spec-v230.md)
> prognostic inflammation-index family (NLR/PLR/SII/LMR/SIRI/PIV/CAR). Proposes **1**
> tile and ships it. **The id was verified absent** ([spec-v85 §6.2](spec-v85.md)) by a
> direct scan of `app.js` and the MCP adapter set.
>
> Catalog effect: **live `UTILITIES.length` + 1**, enforced by the catalog-truth gate
> ([spec-v46](spec-v46.md)).
>
> Every prior spec remains in force. v267 adds no runtime network call and no AI; the tile
> obeys the [spec-v100](spec-v100.md) §2 doctrine, passes the [spec-v29](spec-v29.md) §3
> one-line test, ships its citation inline ([spec-v54](spec-v54.md)), inherits the
> [spec-v59](spec-v59.md) output-safety contract, renders the [spec-v50](spec-v50.md) §3
> posture note, and honors [spec-v11](spec-v11.md) §5.3 (**it computes a lab value, never a
> diagnosis or treatment order**). **The formula is re-fetched and cross-verified against ≥2
> independent open sources at implementation** ([spec-v97](spec-v97.md)).

## 1. Thesis

The catalog already carries the CBC-derived prognostic indices — NLR, PLR, LMR, SII, SIRI,
PIV, CRP-to-albumin — and the nutrition indices PNI/CONUT/GNRI. It did **not** carry the
**HALP score**, the one composite that folds all four of hemoglobin, albumin, lymphocytes,
and platelets into a single number. HALP is a transparent product/quotient, freely
reproducible from open sources, and is decision support — **never a diagnosis or order**.

## 2. What v267 adds (1 tile)

### 2.1 `halp-score` — HALP score

- **Citation:** Chen X-L, Xue L, Wang W, et al. Prognostic significance of the combination
  of preoperative hemoglobin, albumin, lymphocyte and platelet in patients with gastric
  carcinoma: a retrospective cohort study. *Oncotarget.* 2015;6(38):41370-41382.
- **citationUrl:** https://doi.org/10.18632/oncotarget.5629
- **Group:** G. **Specialties:** `hematology`, `oncology`, `internal-medicine`.
- **Formula (cross-verified, [spec-v97](spec-v97.md)):** HALP = hemoglobin (g/L) × albumin
  (g/L) × absolute lymphocyte count (10⁹/L) / platelet count (10⁹/L). The derivation (Chen
  2015, gastric cancer) and pan-cancer validations (e.g. Guo Y, et al. *J Cancer.*
  2019;10(1):81-91) reuse the identical product/quotient definition and the g/L + 10⁹/L unit
  convention.
- **Inputs — 4 lab values:** hemoglobin (g/L), serum albumin (g/L), absolute lymphocyte
  count (10⁹/L), platelet count (10⁹/L). The renderer states the g/L convention (multiply a
  g/dL value by 10) to avoid a unit mismatch.
- **Output:** the **HALP value** with the context-dependent posture — **a LOWER value is less
  favorable**, and there is **no universal cutoff** (cohort- and cancer-specific), mirroring
  the SII/LMR handling. It reports a lab value, **never a diagnosis or treatment order**
  ([spec-v11](spec-v11.md) §5.3). Class A. Cross-links `pni-onodera`, `gnri`, `lmr`.

## 3. Per-tile robustness

- **The compute routes through `lib/num.js` and is finite-guarded** — a missing or
  out-of-range input renders a "complete the fields" fallback rather than a `NaN`.
- **The tile reports the fired inputs** ([spec-v59](spec-v59.md)) — the detail line echoes
  each entered value — so a result is never read without its basis.
- **It renders a lab value, not an order** ([spec-v11](spec-v11.md) §5.3) and renders the
  [spec-v50](spec-v50.md) §3 posture note.
- **It flows through the [spec-v59](spec-v59.md) fuzz harness with zero non-finite leaks.**

## 4. CI/CD & maintenance

- **Maintenance class (§6.3):** **Class A** — a fixed formula cited by journal + authors. No
  issuer acronym trips `ISSUER_PATTERN`.
- **Build & gates:** the compute lives in a new `lib/inflam-v267.js`, added to
  `test/unit/fuzz-tools.test.js` `MODULES`. The renderer lives in a new `views/group-v267.js`;
  its `RV267` export is spread into the `app.js` `RENDERERS` map. Every input carries a real
  `<label for>`. The catalog count moves on all catalog-truth surfaces using the live
  `UTILITIES.length + 1`.
- **Specialties** are drawn from the closed `ALLOWED_SPECIALTIES` vocabulary.
- **MCP exposure (post-ship):** a Class A deterministic compute, routinely MCP-adaptable — a
  follow-up MCP wave exposes it per the [spec-v85](spec-v85.md) recipe, self-describing the
  fired inputs so the numeric round-trip passes.

## 5. Files touched

```
docs/spec-v267.md                        (this file)
app.js                                   (+1 UTILITIES row; import group-v267 RV267 into RENDERERS)
lib/inflam-v267.js                       (new: halp + finite guards)
lib/meta.js                              (+1 META entry: inline citation + citationUrl + accessed; cross-links pni-onodera, gnri, lmr)
views/group-v267.js                      (new renderer module: 1 renderer)
test/unit/inflam-v267.test.js            (worked examples)
test/unit/fuzz-tools.test.js             (add lib/inflam-v267.js to MODULES)
docs/scope-post-parity.md                (catalog count live -> live+1)
docs/scope-mdcalc-parity.md              (ledger close-line -> is 1127.)
CHANGELOG.md, README.md, package.json    (catalog count live -> live+1; spec-progression line)
```

## 6. Acceptance criteria

v267 is fully shipped when:

- The implementing session has **re-run the [spec-v85 §6.2](spec-v85.md) collision check**
  and confirmed `halp-score` is absent (as verified at draft).
- The tile is live (Class A) with a `META[id]` entry, inline citation + `citationUrl` +
  `accessed`, and worked examples spanning a healthy-range value and a low (less favorable)
  profile.
- The formula is reproduced from the primary source and re-verified against ≥ 2 independent
  references at implementation ([spec-v97](spec-v97.md)); the tile states the g/L + 10⁹/L
  unit convention.
- The compute is finite-guarded, routes through `lib/num.js`, and is covered by the
  [spec-v59](spec-v59.md) fuzz harness with **zero non-finite leaks**.
- `UTILITIES.length` is **live + 1** and all catalog-truth surfaces agree.
- `npm run lint`, `npm run test`, and `npm run build` all pass; the CHANGELOG records v267
  with the +1 delta.

## 7. Out of scope for v267

- **No diagnosis or treatment order** — the tile computes a lab value; interpretation stays
  with the clinician and the patient ([spec-v11](spec-v11.md) §5.3).
- **No hardcoded cutoff** — HALP cutoffs are cohort- and cancer-specific and are not
  universal; the tile reports the value with the "lower is less favorable, no universal
  cutoff" posture rather than asserting a threshold.
