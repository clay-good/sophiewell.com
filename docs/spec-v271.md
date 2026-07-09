# spec-v271.md — The Castelli Risk Index (I and II): classic atherogenic cholesterol ratios (+1 tile)

> Status: **SHIPPED (2026-07-09, +1).** Joins the lipid tiles (non-HDL / remnant cholesterol)
> in the group-E lab family. Proposes **1** tile and ships it. **The id was verified absent**
> ([spec-v85 §6.2](spec-v85.md)) by a direct scan of `app.js` and the MCP adapter set.
>
> Catalog effect: **live `UTILITIES.length` + 1**, enforced by the catalog-truth gate
> ([spec-v46](spec-v46.md)).
>
> Every prior spec remains in force. v271 adds no runtime network call and no AI; the tile
> obeys the [spec-v100](spec-v100.md) §2 doctrine, passes the [spec-v29](spec-v29.md) §3
> one-line test, ships its citation inline ([spec-v54](spec-v54.md)), inherits the
> [spec-v59](spec-v59.md) output-safety contract, renders the [spec-v50](spec-v50.md) §3
> posture note, and honors [spec-v11](spec-v11.md) §5.3 (**it computes lab-derived ratios,
> never a diagnosis or treatment order**). **The formula is re-fetched and cross-verified
> against ≥2 independent open sources at implementation** ([spec-v97](spec-v97.md)).

## 1. Thesis

The catalog carries non-HDL and remnant cholesterol and the Atherogenic Index of Plasma, but
not the **Castelli Risk Index** — the two classic cholesterol-ratio indices (the
total-cholesterol/HDL "cardiac risk ratio" and its LDL/HDL companion) that clinicians still
read off a lipid panel. Both are transparent unitless ratios, freely reproducible from open
sources, and are decision support — **never a diagnosis or order**.

## 2. What v271 adds (1 tile)

### 2.1 `castelli-index` — Castelli Risk Index I & II

- **Citation:** Castelli WP, Abbott RD, McNamara PM. Summary estimates of cholesterol used to
  predict coronary heart disease. *Circulation.* 1983;67(4):730-734.
- **citationUrl:** https://doi.org/10.1161/01.CIR.67.4.730
- **Group:** E. **Specialties:** `cardiology`, `internal-medicine`, `primary-care`.
- **Formula (cross-verified, [spec-v97](spec-v97.md)):** Risk Index-I = total cholesterol /
  HDL-C; Risk Index-II = LDL-C / HDL-C. Both are unitless (numerator and denominator share
  units). Standard lipid references reproduce identical definitions.
- **Inputs — 3 values:** total cholesterol, LDL cholesterol, HDL cholesterol (same units).
- **Output:** both ratios, with the context-dependent posture — a **HIGHER ratio marks a
  more atherogenic profile**; commonly cited desirable ranges are roughly < 5 (Index-I) and
  < 3 (Index-II) but there is **no single universal cut-point**. It reports lab-derived
  ratios, **never a diagnosis or treatment order** ([spec-v11](spec-v11.md) §5.3). Class A.
  Cross-links `non-hdl-remnant`, `atherogenic-index-of-plasma`, `ldl-calc`.

## 3. Per-tile robustness

- **The compute routes through `lib/num.js` and is finite-guarded** — a missing or
  out-of-range input renders a "complete the fields" fallback rather than a `NaN`.
- **The tile reports both ratios and their inputs** ([spec-v59](spec-v59.md)) — the detail
  line echoes each division — so a result is never read without its basis.
- **It renders lab-derived ratios, not an order** ([spec-v11](spec-v11.md) §5.3) and renders
  the [spec-v50](spec-v50.md) §3 posture note.
- **It flows through the [spec-v59](spec-v59.md) fuzz harness with zero non-finite leaks.**

## 4. CI/CD & maintenance

- **Maintenance class (§6.3):** **Class A** — fixed ratios cited by journal + authors. No
  issuer acronym trips `ISSUER_PATTERN`.
- **Build & gates:** the compute lives in a new `lib/lipids-v271.js`, added to
  `test/unit/fuzz-tools.test.js` `MODULES`. The renderer lives in a new `views/group-v271.js`;
  its `RV271` export is spread into the `app.js` `RENDERERS` map. Every input carries a real
  `<label for>`. The catalog count moves on all catalog-truth surfaces using the live
  `UTILITIES.length + 1`.
- **Specialties** are drawn from the closed `ALLOWED_SPECIALTIES` vocabulary.
- **MCP exposure (post-ship):** a Class A deterministic compute, routinely MCP-adaptable — a
  follow-up MCP wave exposes it per the [spec-v85](spec-v85.md) recipe, self-describing both
  ratios so the numeric round-trip passes.

## 5. Files touched

```
docs/spec-v271.md                        (this file)
app.js                                   (+1 UTILITIES row; import group-v271 RV271 into RENDERERS)
lib/lipids-v271.js                       (new: castelli + finite guards)
lib/meta.js                              (+1 META entry: inline citation + citationUrl + accessed; cross-links non-hdl-remnant, atherogenic-index-of-plasma, ldl-calc)
views/group-v271.js                      (new renderer module: 1 renderer)
test/unit/lipids-v271.test.js            (worked examples)
test/unit/fuzz-tools.test.js             (add lib/lipids-v271.js to MODULES)
docs/scope-post-parity.md                (catalog count live -> live+1)
docs/scope-mdcalc-parity.md              (ledger close-line -> is 1131.)
CHANGELOG.md, README.md, package.json    (catalog count live -> live+1; spec-progression line)
```

## 6. Acceptance criteria

v271 is fully shipped when:

- The implementing session has **re-run the [spec-v85 §6.2](spec-v85.md) collision check**
  and confirmed `castelli-index` is absent (as verified at draft).
- The tile is live (Class A) with a `META[id]` entry, inline citation + `citationUrl` +
  `accessed`, and worked examples spanning a typical and a more-atherogenic profile.
- The formulas are reproduced from the primary source and re-verified against ≥ 2 independent
  references at implementation ([spec-v97](spec-v97.md)); the tile states the same-units
  requirement.
- The compute is finite-guarded, routes through `lib/num.js`, and is covered by the
  [spec-v59](spec-v59.md) fuzz harness with **zero non-finite leaks**.
- `UTILITIES.length` is **live + 1** and all catalog-truth surfaces agree.
- `npm run lint`, `npm run test`, and `npm run build` all pass; the CHANGELOG records v271
  with the +1 delta.

## 7. Out of scope for v271

- **No diagnosis or treatment order** — the tile computes lab-derived ratios; interpretation
  stays with the clinician and the patient ([spec-v11](spec-v11.md) §5.3).
- **No hardcoded cut-point** — Castelli thresholds vary by sex and reference; the tile
  reports the ratios with the "higher is more atherogenic, no single universal cut-point"
  posture.
