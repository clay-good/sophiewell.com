# spec-v275.md — The RDW-to-platelet ratio (RPR): a non-invasive liver-fibrosis marker (+1 tile)

> Status: **SHIPPED (2026-07-09, +1).** Joins the non-invasive liver-fibrosis family (APRI /
> FIB-4 / Forns / Lok / King) in the group-E lab tiles. Proposes **1** tile and ships it.
> **The id was verified absent** ([spec-v85 §6.2](spec-v85.md)) by a direct scan of `app.js`
> and the MCP adapter set.
>
> Catalog effect: **live `UTILITIES.length` + 1**, enforced by the catalog-truth gate
> ([spec-v46](spec-v46.md)).
>
> Every prior spec remains in force. v275 adds no runtime network call and no AI; the tile
> obeys the [spec-v100](spec-v100.md) §2 doctrine, passes the [spec-v29](spec-v29.md) §3
> one-line test, ships its citation inline ([spec-v54](spec-v54.md)), inherits the
> [spec-v59](spec-v59.md) output-safety contract, renders the [spec-v50](spec-v50.md) §3
> posture note, and honors [spec-v11](spec-v11.md) §5.3 (**it computes a lab-derived ratio,
> never a diagnosis or treatment order**). **The formula and boundary are re-fetched and
> cross-verified against ≥2 independent open sources at implementation** ([spec-v97](spec-v97.md)).

## 1. Thesis

The catalog carries APRI, FIB-4, Forns, Lok, and King for non-invasive liver-fibrosis
staging, but not the **RDW-to-platelet ratio** — the simplest of them, computed from two
routine CBC values (red cell distribution width and platelet count). It is a one-line ratio
with a source-quoted cutoff, freely reproducible from open sources, and is decision support
— **never a diagnosis or order**. It is distinct from the catalog's existing `rdw-index`,
which discriminates thalassemia trait from iron deficiency.

## 2. What v275 adds (1 tile)

### 2.1 `rpr` — RDW-to-platelet ratio

- **Citation:** Chen B, Ye B, Zhang J, et al. RDW to platelet ratio: a novel noninvasive
  index for predicting hepatic fibrosis and cirrhosis in chronic hepatitis B. *PLoS One.*
  2013;8(7):e68780.
- **citationUrl:** https://doi.org/10.1371/journal.pone.0068780
- **Group:** E. **Specialties:** `hepatology`, `gastroenterology`, `internal-medicine`.
- **Formula (cross-verified, [spec-v97](spec-v97.md)):** RPR = red cell distribution width
  (%) / platelet count (10⁹/L). Validation cohorts reuse the identical definition.
- **Inputs — 2 values:** RDW (%), platelet count (10⁹/L).
- **Output:** the **ratio** with the context-dependent posture — a **HIGHER ratio marks more
  advanced fibrosis**, and the derivation cutoff is **~0.1 for significant fibrosis** though
  thresholds vary by etiology (HBV/HCV/NAFLD). It reports a lab-derived ratio, **never a
  diagnosis or treatment order** ([spec-v11](spec-v11.md) §5.3). Class A. Cross-links `fib4`,
  `forns-index`, `lok-index`.

## 3. Per-tile robustness

- **The compute routes through `lib/num.js` and is finite-guarded** — a missing or
  out-of-range input renders a "complete the fields" fallback rather than a `NaN`.
- **The tile reports the ratio, the ~0.1 boundary, and the inputs** ([spec-v59](spec-v59.md))
  — so a result is never read without its basis.
- **It renders a lab-derived ratio, not an order** ([spec-v11](spec-v11.md) §5.3) and renders
  the [spec-v50](spec-v50.md) §3 posture note.
- **It flows through the [spec-v59](spec-v59.md) fuzz harness with zero non-finite leaks.**

## 4. CI/CD & maintenance

- **Maintenance class (§6.3):** **Class A** — a fixed ratio cited by journal + authors. No
  issuer acronym trips `ISSUER_PATTERN`.
- **Build & gates:** the compute lives in a new `lib/fibrosis-v275.js`, added to
  `test/unit/fuzz-tools.test.js` `MODULES`. The renderer lives in a new `views/group-v275.js`;
  its `RV275` export is spread into the `app.js` `RENDERERS` map. Every input carries a real
  `<label for>`. The catalog count moves on all catalog-truth surfaces using the live
  `UTILITIES.length + 1`.
- **Specialties** are drawn from the closed `ALLOWED_SPECIALTIES` vocabulary.
- **MCP exposure (post-ship):** a Class A deterministic compute, routinely MCP-adaptable — a
  follow-up MCP wave exposes it per the [spec-v85](spec-v85.md) recipe.

## 5. Files touched

```
docs/spec-v275.md                        (this file)
app.js                                   (+1 UTILITIES row; import group-v275 RV275 into RENDERERS)
lib/fibrosis-v275.js                     (new: rpr + finite guards)
lib/meta.js                              (+1 META entry: inline citation + citationUrl + accessed; cross-links fib4, forns-index, lok-index)
views/group-v275.js                      (new renderer module: 1 renderer)
test/unit/fibrosis-v275.test.js          (worked examples across the ~0.1 boundary)
test/unit/fuzz-tools.test.js             (add lib/fibrosis-v275.js to MODULES)
docs/scope-post-parity.md                (catalog count live -> live+1)
docs/scope-mdcalc-parity.md              (ledger close-line -> is 1135.)
CHANGELOG.md, README.md, package.json    (catalog count live -> live+1; spec-progression line)
```

## 6. Acceptance criteria

v275 is fully shipped when:

- The implementing session has **re-run the [spec-v85 §6.2](spec-v85.md) collision check**
  and confirmed `rpr` is absent (as verified at draft).
- The tile is live (Class A) with a `META[id]` entry, inline citation + `citationUrl` +
  `accessed`, and worked examples spanning the low and elevated (≥ 0.1) ranges.
- The formula and cutoff are reproduced from the primary source and re-verified against ≥ 2
  independent references at implementation ([spec-v97](spec-v97.md)).
- The compute is finite-guarded, routes through `lib/num.js`, and is covered by the
  [spec-v59](spec-v59.md) fuzz harness with **zero non-finite leaks**.
- `UTILITIES.length` is **live + 1** and all catalog-truth surfaces agree.
- `npm run lint`, `npm run test`, and `npm run build` all pass; the CHANGELOG records v275
  with the +1 delta.

## 7. Out of scope for v275

- **No diagnosis or treatment order** — the tile computes a lab-derived ratio; interpretation
  stays with the clinician and the patient ([spec-v11](spec-v11.md) §5.3).
- **No etiology-specific cutoff switching** — the tile reports the value with the derivation's
  ~0.1 significant-fibrosis boundary noted; it does not branch cutoffs by HBV/HCV/NAFLD.
