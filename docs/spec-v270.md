# spec-v270.md — The Cardiometabolic Index (CMI): a lipid × central-adiposity composite (+1 tile)

> Status: **SHIPPED (2026-07-09, +1).** Joins the visceral-adiposity-index /
> lipid-accumulation-product adiposity family (group G). Proposes **1** tile and ships it.
> **The id was verified absent** ([spec-v85 §6.2](spec-v85.md)) by a direct scan of `app.js`
> and the MCP adapter set.
>
> Catalog effect: **live `UTILITIES.length` + 1**, enforced by the catalog-truth gate
> ([spec-v46](spec-v46.md)).
>
> Every prior spec remains in force. v270 adds no runtime network call and no AI; the tile
> obeys the [spec-v100](spec-v100.md) §2 doctrine, passes the [spec-v29](spec-v29.md) §3
> one-line test, ships its citation inline ([spec-v54](spec-v54.md)), inherits the
> [spec-v59](spec-v59.md) output-safety contract, renders the [spec-v50](spec-v50.md) §3
> posture note, and honors [spec-v11](spec-v11.md) §5.3 (**it computes a lab/anthropometric
> index, never a diagnosis or treatment order**). **The formula is re-fetched and
> cross-verified against ≥2 independent open sources at implementation** ([spec-v97](spec-v97.md)).

## 1. Thesis

The catalog carries the Visceral Adiposity Index and Lipid Accumulation Product — sex- and
lipid-aware adiposity composites — but not the **Cardiometabolic Index**, which multiplies
the atherogenic TG/HDL ratio by the waist-to-height ratio into a single discriminator for
diabetes and cardiovascular risk. It is a transparent product of two ratios, freely
reproducible from open sources, and is decision support — **never a diagnosis or order**.

## 2. What v270 adds (1 tile)

### 2.1 `cmi` — Cardiometabolic Index

- **Citation:** Wakabayashi I, Daimon T. The "cardiometabolic index" as a new marker
  determined by adiposity and blood lipids for discrimination of diabetes mellitus. *Clin
  Chim Acta.* 2015;438:274-278.
- **citationUrl:** https://doi.org/10.1016/j.cca.2014.08.042
- **Group:** G. **Specialties:** `endocrinology`, `cardiology`, `internal-medicine`.
- **Formula (cross-verified, [spec-v97](spec-v97.md)):** CMI = (triglycerides / HDL-C) ×
  (waist circumference / height). TG and HDL in the same units (the ratio is unitless);
  waist and height in the same units (the ratio is the waist-to-height ratio). The derivation
  and validation cohorts reuse the identical definition.
- **Inputs — 4 values:** triglycerides, HDL cholesterol (same units), waist circumference,
  height (same units).
- **Output:** the **CMI value** with the context-dependent posture — a **HIGHER value marks
  a worse cardiometabolic profile**, and cut-points are **sex- and cohort-specific** (no
  universal threshold), mirroring the VAI/LAP handling. It reports a lab/anthropometric
  index, **never a diagnosis or treatment order** ([spec-v11](spec-v11.md) §5.3). Class A.
  Cross-links `visceral-adiposity-index`, `lipid-accumulation-product`, `tyg-index`.

## 3. Per-tile robustness

- **The compute routes through `lib/num.js` and is finite-guarded** — a missing or
  out-of-range input renders a "complete the fields" fallback rather than a `NaN`.
- **The tile reports the fired sub-ratios** ([spec-v59](spec-v59.md)) — the detail line
  echoes the TG/HDL ratio and the waist-to-height ratio — so a result is never read without
  its basis.
- **It renders a lab/anthropometric index, not an order** ([spec-v11](spec-v11.md) §5.3) and
  renders the [spec-v50](spec-v50.md) §3 posture note.
- **It flows through the [spec-v59](spec-v59.md) fuzz harness with zero non-finite leaks.**

## 4. CI/CD & maintenance

- **Maintenance class (§6.3):** **Class A** — a fixed formula cited by journal + authors. No
  issuer acronym trips `ISSUER_PATTERN`.
- **Build & gates:** the compute lives in a new `lib/adiposity-v270.js`, added to
  `test/unit/fuzz-tools.test.js` `MODULES`. The renderer lives in a new `views/group-v270.js`;
  its `RV270` export is spread into the `app.js` `RENDERERS` map. Every input carries a real
  `<label for>`. The catalog count moves on all catalog-truth surfaces using the live
  `UTILITIES.length + 1`.
- **Specialties** are drawn from the closed `ALLOWED_SPECIALTIES` vocabulary.
- **MCP exposure (post-ship):** a Class A deterministic compute, routinely MCP-adaptable — a
  follow-up MCP wave exposes it per the [spec-v85](spec-v85.md) recipe.

## 5. Files touched

```
docs/spec-v270.md                        (this file)
app.js                                   (+1 UTILITIES row; import group-v270 RV270 into RENDERERS)
lib/adiposity-v270.js                    (new: cmi + finite guards)
lib/meta.js                              (+1 META entry: inline citation + citationUrl + accessed; cross-links visceral-adiposity-index, lipid-accumulation-product, tyg-index)
views/group-v270.js                      (new renderer module: 1 renderer)
test/unit/adiposity-v270.test.js         (worked examples)
test/unit/fuzz-tools.test.js             (add lib/adiposity-v270.js to MODULES)
docs/scope-post-parity.md                (catalog count live -> live+1)
docs/scope-mdcalc-parity.md              (ledger close-line -> is 1130.)
CHANGELOG.md, README.md, package.json    (catalog count live -> live+1; spec-progression line)
```

## 6. Acceptance criteria

v270 is fully shipped when:

- The implementing session has **re-run the [spec-v85 §6.2](spec-v85.md) collision check**
  and confirmed `cmi` is absent (as verified at draft).
- The tile is live (Class A) with a `META[id]` entry, inline citation + `citationUrl` +
  `accessed`, and worked examples spanning a typical value and a higher (worse) profile.
- The formula is reproduced from the primary source and re-verified against ≥ 2 independent
  references at implementation ([spec-v97](spec-v97.md)); the tile states the same-units
  requirement for each ratio.
- The compute is finite-guarded, routes through `lib/num.js`, and is covered by the
  [spec-v59](spec-v59.md) fuzz harness with **zero non-finite leaks**.
- `UTILITIES.length` is **live + 1** and all catalog-truth surfaces agree.
- `npm run lint`, `npm run test`, and `npm run build` all pass; the CHANGELOG records v270
  with the +1 delta.

## 7. Out of scope for v270

- **No diagnosis or treatment order** — the tile computes a lab/anthropometric index;
  interpretation stays with the clinician and the patient ([spec-v11](spec-v11.md) §5.3).
- **No hardcoded cut-point** — CMI thresholds are sex- and cohort-specific; the tile reports
  the value with the "higher is worse, no universal cut-point" posture.
