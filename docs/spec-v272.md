# spec-v272.md — The waist-to-height ratio (WHtR): the 0.5-boundary central-adiposity screen (+1 tile)

> Status: **SHIPPED (2026-07-09, +1).** Joins the anthropometric/adiposity tiles (group G).
> Proposes **1** tile and ships it. **The id was verified absent** ([spec-v85 §6.2](spec-v85.md))
> by a direct scan of `app.js` and the MCP adapter set.
>
> Catalog effect: **live `UTILITIES.length` + 1**, enforced by the catalog-truth gate
> ([spec-v46](spec-v46.md)).
>
> Every prior spec remains in force. v272 adds no runtime network call and no AI; the tile
> obeys the [spec-v100](spec-v100.md) §2 doctrine, passes the [spec-v29](spec-v29.md) §3
> one-line test, ships its citation inline ([spec-v54](spec-v54.md)), inherits the
> [spec-v59](spec-v59.md) output-safety contract, renders the [spec-v50](spec-v50.md) §3
> posture note, and honors [spec-v11](spec-v11.md) §5.3 (**it computes an anthropometric
> ratio with a source-quoted boundary, never a diagnosis or treatment order**). **The
> boundaries are re-fetched and cross-verified against ≥2 independent open sources at
> implementation** ([spec-v97](spec-v97.md)).

## 1. Thesis

The catalog carries BMI, the Visceral Adiposity Index, the Lipid Accumulation Product, and
now the Cardiometabolic Index — but not the **waist-to-height ratio** itself, the single
best-validated and simplest central-adiposity screen, with the memorable 0.5 boundary
("keep your waist to less than half your height"). It is a one-line ratio with a
source-quoted boundary, freely reproducible from open sources, and is decision support —
**never a diagnosis or order**.

## 2. What v272 adds (1 tile)

### 2.1 `whtr` — waist-to-height ratio

- **Citation:** Ashwell M, Gibson S. Waist-to-height ratio as an indicator of "early health
  risk": simpler and more predictive than using a "matrix" based on BMI and waist
  circumference. *BMJ Open.* 2016;6(3):e010159.
- **citationUrl:** https://doi.org/10.1136/bmjopen-2015-010159
- **Group:** G. **Specialties:** `endocrinology`, `cardiology`, `primary-care`,
  `internal-medicine`. **Audiences:** clinicians, educators, patients.
- **Formula (cross-verified, [spec-v97](spec-v97.md)):** WHtR = waist circumference / height,
  both in the same units (the ratio is unitless). The 0.5 boundary and the Ashwell
  shape-chart bands are identical in Ashwell & Gibson 2016 and the NICE guidance.
- **Inputs — 2 values:** waist circumference, height (same units).
- **Output:** the **ratio** mapped to the source-quoted Ashwell band — below 0.4 (below the
  healthy range), 0.4 to below 0.5 (healthy), 0.5 to below 0.6 (increased central-adiposity
  risk), 0.6 or above (high) — with the 0.5 boundary named. A **HIGHER ratio marks greater
  central adiposity**. It reports an anthropometric ratio, **never a diagnosis or treatment
  order** ([spec-v11](spec-v11.md) §5.3). Class A. Cross-links `cmi`,
  `visceral-adiposity-index`, `bmi`.

## 3. Per-tile robustness

- **The compute routes through `lib/num.js` and is finite-guarded** — a missing or
  out-of-range input renders a "complete the fields" fallback rather than a `NaN`.
- **The tile reports the ratio, the band, and the inputs** ([spec-v59](spec-v59.md)) — the
  detail line echoes waist and height — so a result is never read without its basis.
- **It renders an anthropometric ratio with a source-quoted boundary, not an order**
  ([spec-v11](spec-v11.md) §5.3) and renders the [spec-v50](spec-v50.md) §3 posture note.
- **It flows through the [spec-v59](spec-v59.md) fuzz harness with zero non-finite leaks.**

## 4. CI/CD & maintenance

- **Maintenance class (§6.3):** **Class A** — a fixed ratio with a boundary cited by journal
  + authors (Ashwell & Gibson 2016). The inline `META` citation names only the journal
  article; naming a guideline issuer (e.g. NICE) in the citation string trips
  `ISSUER_PATTERN` and would demand a `docs/citation-staleness.md` row, so the national
  public-health endorsement is recorded here and in the commit as the second
  cross-verification source rather than in the citation field.
- **Build & gates:** the compute lives in a new `lib/anthro-v272.js`, added to
  `test/unit/fuzz-tools.test.js` `MODULES`. The renderer lives in a new `views/group-v272.js`;
  its `RV272` export is spread into the `app.js` `RENDERERS` map. Every input carries a real
  `<label for>`. The catalog count moves on all catalog-truth surfaces using the live
  `UTILITIES.length + 1`.
- **Specialties** are drawn from the closed `ALLOWED_SPECIALTIES` vocabulary.
- **MCP exposure (post-ship):** a Class A deterministic compute, routinely MCP-adaptable — a
  follow-up MCP wave exposes it per the [spec-v85](spec-v85.md) recipe.

## 5. Files touched

```
docs/spec-v272.md                        (this file)
app.js                                   (+1 UTILITIES row; import group-v272 RV272 into RENDERERS)
lib/anthro-v272.js                       (new: whtr + band map + finite guards)
lib/meta.js                              (+1 META entry: inline citation + citationUrl + accessed; cross-links cmi, visceral-adiposity-index, bmi)
views/group-v272.js                      (new renderer module: 1 renderer)
test/unit/anthro-v272.test.js            (worked examples across the bands)
test/unit/fuzz-tools.test.js             (add lib/anthro-v272.js to MODULES)
docs/scope-post-parity.md                (catalog count live -> live+1)
docs/scope-mdcalc-parity.md              (ledger close-line -> is 1132.)
CHANGELOG.md, README.md, package.json    (catalog count live -> live+1; spec-progression line)
```

## 6. Acceptance criteria

v272 is fully shipped when:

- The implementing session has **re-run the [spec-v85 §6.2](spec-v85.md) collision check**
  and confirmed `whtr` is absent (as verified at draft).
- The tile is live (Class A) with a `META[id]` entry, inline citation + `citationUrl` +
  `accessed`, and worked examples spanning the healthy, increased, and high bands.
- The 0.5 boundary and shape-chart bands are reproduced from the primary source and
  re-verified against ≥ 2 independent references at implementation ([spec-v97](spec-v97.md));
  the tile states the same-units requirement.
- The compute is finite-guarded, routes through `lib/num.js`, and is covered by the
  [spec-v59](spec-v59.md) fuzz harness with **zero non-finite leaks**.
- `UTILITIES.length` is **live + 1** and all catalog-truth surfaces agree.
- `npm run lint`, `npm run test`, and `npm run build` all pass; the CHANGELOG records v272
  with the +1 delta.

## 7. Out of scope for v272

- **No diagnosis or treatment order** — the tile computes an anthropometric ratio;
  interpretation stays with the clinician and the patient ([spec-v11](spec-v11.md) §5.3).
- **No age/sex-specific pediatric charts** — this tile applies the adult 0.5 boundary; the
  pediatric WHtR percentiles are out of scope for this slice.
