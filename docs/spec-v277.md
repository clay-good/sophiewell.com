# spec-v277.md — Measured (timed-urine) creatinine clearance: the direct C = (U × V) / P clearance (+1 tile)

> Status: **SHIPPED (2026-07-09, +1).** Joins the renal tiles (group E) beside the
> Cockcroft-Gault and eGFR estimators. Proposes **1** tile and ships it. **The id was
> verified absent** ([spec-v85 §6.2](spec-v85.md)) by a direct scan of `app.js` and the MCP
> adapter set.
>
> Catalog effect: **live `UTILITIES.length` + 1**, enforced by the catalog-truth gate
> ([spec-v46](spec-v46.md)).
>
> Every prior spec remains in force. v277 adds no runtime network call and no AI; the tile
> obeys the [spec-v100](spec-v100.md) §2 doctrine, passes the [spec-v29](spec-v29.md) §3
> one-line test, ships its citation inline ([spec-v54](spec-v54.md)), inherits the
> [spec-v59](spec-v59.md) output-safety contract, renders the [spec-v50](spec-v50.md) §3
> posture note, and honors [spec-v11](spec-v11.md) §5.3 (**it computes a clearance value,
> never a diagnosis or treatment order**). **The formula is re-fetched and cross-verified
> against ≥2 independent open sources at implementation** ([spec-v97](spec-v97.md)).

## 1. Thesis

The catalog carries the Cockcroft-Gault and CKD-EPI/MDRD **estimates** of renal function, but
not the **measured** creatinine clearance from a timed urine collection — the direct
clearance calculation a nephrologist still runs off a 24-hour urine. It is the textbook
clearance identity C = (U × V) / P, freely reproducible from open sources, and is decision
support — **never a diagnosis or order**.

## 2. What v277 adds (1 tile)

### 2.1 `measured-crcl` — measured (timed-urine) creatinine clearance

- **Citation:** Measured creatinine clearance = (urine creatinine × urine volume) / (serum
  creatinine × collection time) — the C = (U × V) / P clearance identity. Reviewed for
  measured clearance in Stevens LA, Levey AS. Measured GFR as a confirmatory test for
  estimated GFR. *J Am Soc Nephrol.* 2009;20(11):2305-2313.
- **citationUrl:** https://doi.org/10.1681/ASN.2009020171
- **Group:** E. **Specialties:** `nephrology`, `internal-medicine`, `pharmacy`.
- **Formula (cross-verified, [spec-v97](spec-v97.md)):** CrCl (mL/min) = (urine creatinine
  [mg/dL] × urine volume [mL]) / (serum creatinine [mg/dL] × collection time [min]). Because
  urine and serum creatinine share units, only their ratio matters; volume in mL and time in
  minutes give mL/min.
- **Inputs — 4 values:** urine creatinine (mg/dL), urine volume over the collection (mL),
  serum creatinine (mg/dL), collection time (hours).
- **Output:** the **clearance in mL/min**, naming the collection duration and stating it is
  **not BSA-normalized**; typical adult clearance is ~90-140 mL/min and falls with age. It
  reports a clearance value, **never a diagnosis or treatment order** ([spec-v11](spec-v11.md)
  §5.3). Class A. Cross-links `cockcroft-gault`, `egfr`, `uacr-upcr`.

## 3. Per-tile robustness

- **The compute routes through `lib/num.js` and is finite-guarded** — a missing or
  out-of-range input renders a "complete the fields" fallback, and a zero serum creatinine or
  zero time (divide-by-zero) is rejected by the range floors.
- **The tile reports the clearance and the full expression** ([spec-v59](spec-v59.md)) — the
  detail line echoes the urine and serum terms and the minutes — so a result is never read
  without its basis.
- **It renders a clearance value, not an order** ([spec-v11](spec-v11.md) §5.3) and renders
  the [spec-v50](spec-v50.md) §3 posture note.
- **It flows through the [spec-v59](spec-v59.md) fuzz harness with zero non-finite leaks.**

## 4. CI/CD & maintenance

- **Maintenance class (§6.3):** **Class A** — a fixed textbook identity; the review citation
  names journal + authors. No issuer acronym trips `ISSUER_PATTERN`.
- **Build & gates:** the compute lives in a new `lib/renal-v277.js`, added to
  `test/unit/fuzz-tools.test.js` `MODULES`. The renderer lives in a new `views/group-v277.js`;
  its `RV277` export is spread into the `app.js` `RENDERERS` map. Every input carries a real
  `<label for>`. The catalog count moves on all catalog-truth surfaces using the live
  `UTILITIES.length + 1`.
- **Specialties** are drawn from the closed `ALLOWED_SPECIALTIES` vocabulary.
- **MCP exposure (post-ship):** a Class A deterministic compute, routinely MCP-adaptable — a
  follow-up MCP wave exposes it per the [spec-v85](spec-v85.md) recipe.

## 5. Files touched

```
docs/spec-v277.md                        (this file)
app.js                                   (+1 UTILITIES row; import group-v277 RV277 into RENDERERS)
lib/renal-v277.js                        (new: measuredCrcl + finite guards)
lib/meta.js                              (+1 META entry: inline citation + citationUrl + accessed; cross-links cockcroft-gault, egfr, uacr-upcr)
views/group-v277.js                      (new renderer module: 1 renderer)
test/unit/renal-v277.test.js             (worked examples incl. units-cancel + reduced clearance)
test/unit/fuzz-tools.test.js             (add lib/renal-v277.js to MODULES)
docs/scope-post-parity.md                (catalog count live -> live+1)
docs/scope-mdcalc-parity.md              (ledger close-line -> is 1137.)
CHANGELOG.md, README.md, package.json    (catalog count live -> live+1; spec-progression line)
```

## 6. Acceptance criteria

v277 is fully shipped when:

- The implementing session has **re-run the [spec-v85 §6.2](spec-v85.md) collision check**
  and confirmed `measured-crcl` is absent (as verified at draft).
- The tile is live (Class A) with a `META[id]` entry, inline citation + `citationUrl` +
  `accessed`, and worked examples spanning a normal and a reduced clearance.
- The formula is reproduced from standard references and re-verified against ≥ 2 independent
  sources at implementation ([spec-v97](spec-v97.md)); the tile states the units and that it
  is not BSA-normalized.
- The compute is finite-guarded, routes through `lib/num.js`, and is covered by the
  [spec-v59](spec-v59.md) fuzz harness with **zero non-finite leaks**.
- `UTILITIES.length` is **live + 1** and all catalog-truth surfaces agree.
- `npm run lint`, `npm run test`, and `npm run build` all pass; the CHANGELOG records v277
  with the +1 delta.

## 7. Out of scope for v277

- **No diagnosis or treatment order** — the tile computes a clearance value; interpretation
  stays with the clinician and the patient ([spec-v11](spec-v11.md) §5.3).
- **No BSA normalization or drug-dosing adjustment** — the tile reports the raw mL/min; the
  separate `bsa` and drug-dosing tiles cover those steps.
