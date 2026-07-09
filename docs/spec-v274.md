# spec-v274.md — The albumin-to-globulin ratio (A/G): a routine serum-protein prognostic ratio (+1 tile)

> Status: **SHIPPED (2026-07-09, +1).** Joins the group-E lab tiles (protein / lipid /
> metabolic ratios). Proposes **1** tile and ships it. **The id was verified absent**
> ([spec-v85 §6.2](spec-v85.md)) by a direct scan of `app.js` and the MCP adapter set.
>
> Catalog effect: **live `UTILITIES.length` + 1**, enforced by the catalog-truth gate
> ([spec-v46](spec-v46.md)).
>
> Every prior spec remains in force. v274 adds no runtime network call and no AI; the tile
> obeys the [spec-v100](spec-v100.md) §2 doctrine, passes the [spec-v29](spec-v29.md) §3
> one-line test, ships its citation inline ([spec-v54](spec-v54.md)), inherits the
> [spec-v59](spec-v59.md) output-safety contract, renders the [spec-v50](spec-v50.md) §3
> posture note, and honors [spec-v11](spec-v11.md) §5.3 (**it computes a lab-derived ratio,
> never a diagnosis or treatment order**). **The definition is re-fetched and cross-verified
> against ≥2 independent open sources at implementation** ([spec-v97](spec-v97.md)).

## 1. Thesis

The catalog carries non-HDL/remnant cholesterol, the Castelli ratios, transferrin
saturation, and the CBC-derived inflammation indices — but not the **albumin-to-globulin
ratio**, one of the most routine numbers on a comprehensive metabolic panel and a validated
prognostic inflammation/nutrition marker. It is a one-line ratio off two panel values,
freely reproducible from open sources, and is decision support — **never a diagnosis or
order**.

## 2. What v274 adds (1 tile)

### 2.1 `agr` — albumin-to-globulin ratio

- **Citation:** A/G ratio = albumin / globulin, with globulin = total protein − albumin
  (standard clinical chemistry). Prognostic value reviewed in Suh B, Park S, Shin DW, et al.
  Low albumin-to-globulin ratio associated with cancer incidence and mortality in generally
  healthy adults. *Ann Oncol.* 2014;25(11):2260-2266.
- **citationUrl:** https://doi.org/10.1093/annonc/mdu274
- **Group:** E. **Specialties:** `internal-medicine`, `hematology`, `oncology`,
  `primary-care`.
- **Formula (cross-verified, [spec-v97](spec-v97.md)):** A/G = albumin / (total protein −
  albumin), both in the same units (the ratio is unitless). The calculated-globulin identity
  is standard across laboratory references.
- **Inputs — 2 values:** serum albumin, total protein (same units, g/dL).
- **Output:** the **ratio** and the calculated **globulin**, with the context-dependent
  posture — typical range ~1.1-2.5, and a **low or reversed ratio (< ~1)** flags inflammation,
  paraproteinemia, or protein loss; a **lower A/G is less favorable**. It reports a
  lab-derived ratio, **never a diagnosis or treatment order** ([spec-v11](spec-v11.md) §5.3).
  Class A. Cross-links `non-hdl-remnant`, `tsat`, `castelli-index`.

## 3. Per-tile robustness

- **The compute routes through `lib/num.js` and is finite-guarded** — a missing or
  out-of-range input renders a "complete the fields" fallback, and total protein ≤ albumin
  (non-positive globulin, a divide-by-zero / negative-ratio) is rejected with a clear message.
- **The tile reports the ratio, the calculated globulin, and the inputs**
  ([spec-v59](spec-v59.md)) — so a result is never read without its basis.
- **It renders a lab-derived ratio, not an order** ([spec-v11](spec-v11.md) §5.3) and renders
  the [spec-v50](spec-v50.md) §3 posture note.
- **It flows through the [spec-v59](spec-v59.md) fuzz harness with zero non-finite leaks.**

## 4. CI/CD & maintenance

- **Maintenance class (§6.3):** **Class A** — a fixed standard-chemistry ratio; the prognostic
  citation names journal + authors. No issuer acronym trips `ISSUER_PATTERN`.
- **Build & gates:** the compute lives in a new `lib/proteins-v274.js`, added to
  `test/unit/fuzz-tools.test.js` `MODULES`. The renderer lives in a new `views/group-v274.js`;
  its `RV274` export is spread into the `app.js` `RENDERERS` map. Every input carries a real
  `<label for>`. The catalog count moves on all catalog-truth surfaces using the live
  `UTILITIES.length + 1`.
- **Specialties** are drawn from the closed `ALLOWED_SPECIALTIES` vocabulary.
- **MCP exposure (post-ship):** a Class A deterministic compute, routinely MCP-adaptable — a
  follow-up MCP wave exposes it per the [spec-v85](spec-v85.md) recipe, self-describing the
  calculated globulin so the numeric round-trip passes.

## 5. Files touched

```
docs/spec-v274.md                        (this file)
app.js                                   (+1 UTILITIES row; import group-v274 RV274 into RENDERERS)
lib/proteins-v274.js                     (new: agr + calculated globulin + finite/positivity guards)
lib/meta.js                              (+1 META entry: inline citation + citationUrl + accessed; cross-links non-hdl-remnant, tsat, castelli-index)
views/group-v274.js                      (new renderer module: 1 renderer)
test/unit/proteins-v274.test.js          (worked examples incl. a reversed ratio)
test/unit/fuzz-tools.test.js             (add lib/proteins-v274.js to MODULES)
docs/scope-post-parity.md                (catalog count live -> live+1)
docs/scope-mdcalc-parity.md              (ledger close-line -> is 1134.)
CHANGELOG.md, README.md, package.json    (catalog count live -> live+1; spec-progression line)
```

## 6. Acceptance criteria

v274 is fully shipped when:

- The implementing session has **re-run the [spec-v85 §6.2](spec-v85.md) collision check**
  and confirmed `agr` is absent (as verified at draft).
- The tile is live (Class A) with a `META[id]` entry, inline citation + `citationUrl` +
  `accessed`, and worked examples spanning a normal and a reversed (< 1) ratio.
- The definition is reproduced from standard references and re-verified against ≥ 2
  independent sources at implementation ([spec-v97](spec-v97.md)); the tile states the
  same-units requirement.
- The compute is finite-guarded, routes through `lib/num.js`, rejects non-positive globulin,
  and is covered by the [spec-v59](spec-v59.md) fuzz harness with **zero non-finite leaks**.
- `UTILITIES.length` is **live + 1** and all catalog-truth surfaces agree.
- `npm run lint`, `npm run test`, and `npm run build` all pass; the CHANGELOG records v274
  with the +1 delta.

## 7. Out of scope for v274

- **No diagnosis or treatment order** — the tile computes a lab-derived ratio; interpretation
  stays with the clinician and the patient ([spec-v11](spec-v11.md) §5.3).
- **No serum protein electrophoresis interpretation** — the tile reports the calculated A/G
  ratio only; it does not interpret an SPEP pattern or quantify a monoclonal spike.
