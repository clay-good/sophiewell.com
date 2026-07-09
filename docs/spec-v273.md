# spec-v273.md — TyG-BMI: the triglyceride-glucose index scaled by BMI (+1 tile)

> Status: **SHIPPED (2026-07-09, +1).** Joins the [spec-v136](spec-v136.md) endocrine/
> metabolic cluster (HOMA-IR / QUICKI / TyG / METS-IR). Proposes **1** tile and ships it.
> **The id was verified absent** ([spec-v85 §6.2](spec-v85.md)) by a direct scan of `app.js`
> and the MCP adapter set.
>
> Catalog effect: **live `UTILITIES.length` + 1**, enforced by the catalog-truth gate
> ([spec-v46](spec-v46.md)).
>
> Every prior spec remains in force. v273 adds no runtime network call and no AI; the tile
> obeys the [spec-v100](spec-v100.md) §2 doctrine, passes the [spec-v29](spec-v29.md) §3
> one-line test, ships its citation inline ([spec-v54](spec-v54.md)), inherits the
> [spec-v59](spec-v59.md) output-safety contract, renders the [spec-v50](spec-v50.md) §3
> posture note, and honors [spec-v11](spec-v11.md) §5.3 (**it computes a lab-derived index,
> never a diagnosis or treatment order**). **The formula is re-fetched and cross-verified
> against ≥2 independent open sources at implementation** ([spec-v97](spec-v97.md)).

## 1. Thesis

The catalog carries the triglyceride-glucose (TyG) index and METS-IR, but not **TyG-BMI**,
the enhanced surrogate that multiplies the TyG index by BMI to fold adiposity into the
insulin-resistance estimate — often the best-discriminating of the TyG-family markers in
nondiabetic cohorts. It is a transparent closed-form expression, freely reproducible from
open sources, and is decision support — **never a diagnosis or order**.

## 2. What v273 adds (1 tile)

### 2.1 `tyg-bmi` — TyG-BMI

- **Citation:** Er LK, Wu S, Chou HH, et al. Triglyceride glucose-body mass index is a simple
  and clinically useful surrogate marker for insulin resistance in nondiabetic individuals.
  *PLoS One.* 2016;11(3):e0149731.
- **citationUrl:** https://doi.org/10.1371/journal.pone.0149731
- **Group:** E. **Specialties:** `endocrinology`, `internal-medicine`, `primary-care`,
  `family-medicine`.
- **Formula (cross-verified, [spec-v97](spec-v97.md)):** TyG-BMI = ln[(fasting TG × fasting
  glucose) / 2] × BMI, both TG and glucose in mg/dL. The TyG core is the Simental-Méndia 2008
  definition already carried by the catalog's `tyg-index`; validation cohorts reuse the
  identical TyG × BMI definition.
- **Inputs — 3 values:** fasting triglycerides (mg/dL), fasting glucose (mg/dL), BMI (kg/m²).
- **Output:** the **TyG-BMI value** with the context-dependent posture — a **HIGHER value
  marks greater insulin resistance** and there is **no universal diagnostic cut-point**,
  mirroring the TyG/METS-IR handling. It reports a lab-derived index, **never a diagnosis or
  treatment order** ([spec-v11](spec-v11.md) §5.3). Class A. Cross-links `tyg-index`,
  `mets-ir`, `homa-ir`.

## 3. Per-tile robustness

- **The compute routes through `lib/num.js` and is finite-guarded** — a missing or
  out-of-range input renders a "complete the fields" fallback rather than a `NaN`.
- **The tile reports the fired inputs and the TyG core** ([spec-v59](spec-v59.md)) — the
  detail line echoes the TyG value and BMI — so a result is never read without its basis.
- **It renders a lab-derived index, not an order** ([spec-v11](spec-v11.md) §5.3) and renders
  the [spec-v50](spec-v50.md) §3 posture note.
- **It flows through the [spec-v59](spec-v59.md) fuzz harness with zero non-finite leaks.**

## 4. CI/CD & maintenance

- **Maintenance class (§6.3):** **Class A** — a fixed formula cited by journal + authors. No
  issuer acronym trips `ISSUER_PATTERN`.
- **Build & gates:** the compute lives in a new `lib/metabolic-v273.js`, added to
  `test/unit/fuzz-tools.test.js` `MODULES`. The renderer lives in a new `views/group-v273.js`;
  its `RV273` export is spread into the `app.js` `RENDERERS` map. Every input carries a real
  `<label for>`. The catalog count moves on all catalog-truth surfaces using the live
  `UTILITIES.length + 1`.
- **Specialties** are drawn from the closed `ALLOWED_SPECIALTIES` vocabulary.
- **MCP exposure (post-ship):** a Class A deterministic compute, routinely MCP-adaptable — a
  follow-up MCP wave exposes it per the [spec-v85](spec-v85.md) recipe.

## 5. Files touched

```
docs/spec-v273.md                        (this file)
app.js                                   (+1 UTILITIES row; import group-v273 RV273 into RENDERERS)
lib/metabolic-v273.js                    (new: tygBmi + finite guards)
lib/meta.js                              (+1 META entry: inline citation + citationUrl + accessed; cross-links tyg-index, mets-ir, homa-ir)
views/group-v273.js                      (new renderer module: 1 renderer)
test/unit/metabolic-v273.test.js         (worked examples)
test/unit/fuzz-tools.test.js             (add lib/metabolic-v273.js to MODULES)
docs/scope-post-parity.md                (catalog count live -> live+1)
docs/scope-mdcalc-parity.md              (ledger close-line -> is 1133.)
CHANGELOG.md, README.md, package.json    (catalog count live -> live+1; spec-progression line)
```

## 6. Acceptance criteria

v273 is fully shipped when:

- The implementing session has **re-run the [spec-v85 §6.2](spec-v85.md) collision check**
  and confirmed `tyg-bmi` is absent (as verified at draft).
- The tile is live (Class A) with a `META[id]` entry, inline citation + `citationUrl` +
  `accessed`, and worked examples spanning a typical value and a higher (more
  insulin-resistant) profile.
- The formula is reproduced from the primary source and re-verified against ≥ 2 independent
  references at implementation ([spec-v97](spec-v97.md)); the tile states the mg/dL units.
- The compute is finite-guarded, routes through `lib/num.js`, and is covered by the
  [spec-v59](spec-v59.md) fuzz harness with **zero non-finite leaks**.
- `UTILITIES.length` is **live + 1** and all catalog-truth surfaces agree.
- `npm run lint`, `npm run test`, and `npm run build` all pass; the CHANGELOG records v273
  with the +1 delta.

## 7. Out of scope for v273

- **No diagnosis or treatment order** — the tile computes a lab-derived index; interpretation
  stays with the clinician and the patient ([spec-v11](spec-v11.md) §5.3).
- **No hardcoded cut-point** — TyG-BMI thresholds are cohort-specific; the tile reports the
  value with the "higher is more insulin-resistant, no universal cut-point" posture.
