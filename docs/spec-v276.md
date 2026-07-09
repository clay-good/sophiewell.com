# spec-v276.md — The Buzby Nutritional Risk Index (NRI): the VA-TPN perioperative undernutrition index (+1 tile)

> Status: **SHIPPED (2026-07-09, +1).** Joins the nutrition tiles (GNRI / PNI / CONUT) in the
> group-E lab family. Proposes **1** tile and ships it. **The id was verified absent**
> ([spec-v85 §6.2](spec-v85.md)) by a direct scan of `app.js` and the MCP adapter set.
>
> Catalog effect: **live `UTILITIES.length` + 1**, enforced by the catalog-truth gate
> ([spec-v46](spec-v46.md)).
>
> Every prior spec remains in force. v276 adds no runtime network call and no AI; the tile
> obeys the [spec-v100](spec-v100.md) §2 doctrine, passes the [spec-v29](spec-v29.md) §3
> one-line test, ships its citation inline ([spec-v54](spec-v54.md)), inherits the
> [spec-v59](spec-v59.md) output-safety contract, renders the [spec-v50](spec-v50.md) §3
> posture note, and honors [spec-v11](spec-v11.md) §5.3 (**it computes a nutrition-risk index
> with source-quoted bands, never a diagnosis or treatment order**). **The formula and bands
> are re-fetched and cross-verified against ≥2 independent open sources at implementation**
> ([spec-v97](spec-v97.md)).

## 1. Thesis

The catalog carries the Geriatric Nutritional Risk Index (GNRI), the Onodera Prognostic
Nutritional Index (PNI), and CONUT — but not the original **Buzby Nutritional Risk Index**,
the VA-TPN perioperative undernutrition index that GNRI was later derived from (GNRI replaced
usual weight with ideal weight). It is a transparent two-term expression with source-quoted
bands, freely reproducible from open sources, and is decision support — **never a diagnosis
or order**.

## 2. What v276 adds (1 tile)

### 2.1 `nri` — Nutritional Risk Index (Buzby)

- **Citation:** Buzby GP, et al., for the Veterans Affairs Total Parenteral Nutrition
  Cooperative Study Group. Perioperative total parenteral nutrition in surgical patients.
  *N Engl J Med.* 1991;325(8):525-532.
- **citationUrl:** https://doi.org/10.1056/NEJM199108223250801
- **Group:** E. **Specialties:** `nutrition`, `surgery`, `internal-medicine`.
- **Formula (cross-verified, [spec-v97](spec-v97.md)):** NRI = 1.519 × serum albumin (g/L) +
  41.7 × (current body weight / usual body weight). Standard nutrition references reuse the
  identical formula and bands.
- **Inputs — 3 values:** serum albumin (g/L), current weight, usual weight (same unit).
- **Output:** the **NRI** mapped to the source-quoted band — > 100 no nutritional risk,
  97.5-100 mild, 83.5 to < 97.5 moderate, < 83.5 severe. A **LOWER value marks greater
  perioperative nutritional risk**. It reports a screening index, **never a diagnosis or
  treatment order** ([spec-v11](spec-v11.md) §5.3). Class A. Cross-links `gnri`,
  `pni-onodera`, `conut`.

## 3. Per-tile robustness

- **The compute routes through `lib/num.js` and is finite-guarded** — a missing or
  out-of-range input renders a "complete the fields" fallback, and a zero usual weight
  (divide-by-zero) is rejected by the range floor.
- **The tile reports the score, band, and the two terms** ([spec-v59](spec-v59.md)) — the
  detail line echoes the albumin term and the weight ratio — so a result is never read
  without its basis.
- **It renders a screening index with source-quoted bands, not an order**
  ([spec-v11](spec-v11.md) §5.3) and renders the [spec-v50](spec-v50.md) §3 posture note.
- **It flows through the [spec-v59](spec-v59.md) fuzz harness with zero non-finite leaks.**

## 4. CI/CD & maintenance

- **Maintenance class (§6.3):** **Class A** — a fixed formula with fixed bands cited by
  journal + authors. No issuer acronym trips `ISSUER_PATTERN`.
- **Build & gates:** the compute lives in a new `lib/nutrition-v276.js`, added to
  `test/unit/fuzz-tools.test.js` `MODULES`. The renderer lives in a new `views/group-v276.js`;
  its `RV276` export is spread into the `app.js` `RENDERERS` map. Every input carries a real
  `<label for>`. The catalog count moves on all catalog-truth surfaces using the live
  `UTILITIES.length + 1`.
- **Specialties** are drawn from the closed `ALLOWED_SPECIALTIES` vocabulary.
- **MCP exposure (post-ship):** a Class A deterministic compute, routinely MCP-adaptable — a
  follow-up MCP wave exposes it per the [spec-v85](spec-v85.md) recipe.

## 5. Files touched

```
docs/spec-v276.md                        (this file)
app.js                                   (+1 UTILITIES row; import group-v276 RV276 into RENDERERS)
lib/nutrition-v276.js                    (new: nri + band map + finite guards)
lib/meta.js                              (+1 META entry: inline citation + citationUrl + accessed; cross-links gnri, pni-onodera, conut)
views/group-v276.js                      (new renderer module: 1 renderer)
test/unit/nutrition-v276.test.js         (worked examples across the bands)
test/unit/fuzz-tools.test.js             (add lib/nutrition-v276.js to MODULES)
docs/scope-post-parity.md                (catalog count live -> live+1)
docs/scope-mdcalc-parity.md              (ledger close-line -> is 1136.)
CHANGELOG.md, README.md, package.json    (catalog count live -> live+1; spec-progression line)
```

## 6. Acceptance criteria

v276 is fully shipped when:

- The implementing session has **re-run the [spec-v85 §6.2](spec-v85.md) collision check**
  and confirmed `nri` is absent (as verified at draft).
- The tile is live (Class A) with a `META[id]` entry, inline citation + `citationUrl` +
  `accessed`, and worked examples spanning the no-risk, moderate, and severe bands.
- The formula and bands are reproduced from the primary source and re-verified against ≥ 2
  independent references at implementation ([spec-v97](spec-v97.md)); the tile states the g/L
  albumin unit.
- The compute is finite-guarded, routes through `lib/num.js`, and is covered by the
  [spec-v59](spec-v59.md) fuzz harness with **zero non-finite leaks**.
- `UTILITIES.length` is **live + 1** and all catalog-truth surfaces agree.
- `npm run lint`, `npm run test`, and `npm run build` all pass; the CHANGELOG records v276
  with the +1 delta.

## 7. Out of scope for v276

- **No diagnosis or treatment order** — the tile computes a screening index; interpretation
  and the decision to intervene nutritionally stay with the clinician and the patient
  ([spec-v11](spec-v11.md) §5.3).
- **No GNRI substitution** — the tile uses usual weight per the original Buzby NRI; the
  ideal-weight GNRI variant is the separate `gnri` tile.
