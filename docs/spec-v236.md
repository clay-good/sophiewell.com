# spec-v236.md — Ophthalmology / refractive calculators: the spherical equivalent, vertex-distance conversion, percent tissue altered, and the Randleman Ectasia Risk Score System (+4 tiles → 1025)

> Status: **SHIPPED (2026-07-04).** An ophthalmology slice. Adds **4** well-
> established deterministic calculators. **Each id was verified absent by a fixed-
> string scan of the extracted `app.js` id/name lists AND the MCP adapter set**
> (spec-v85 §6.2): the catalog carried `visual-acuity`, `iol-power`, and `opp`, but
> none of these refractive / ectasia-risk tools.
>
> Catalog effect: **live `UTILITIES.length` + 4** (1021 → 1025) — enforced by the
> catalog-truth gate ([spec-v46](spec-v46.md)).
>
> Every prior spec remains in force. v236 adds no runtime network call and no AI;
> each tile obeys the [spec-v100](spec-v100.md) §2 doctrine, passes the
> [spec-v29](spec-v29.md) §3 one-line test, ships its citation inline
> ([spec-v54](spec-v54.md)), inherits the [spec-v59](spec-v59.md) output-safety
> contract, renders the [spec-v50](spec-v50.md) §3 posture note, and honors
> [spec-v11](spec-v11.md) §5.3 (**no diagnosis and no treatment order** — these
> compute an optical value or a risk score). **Every formula is re-fetched and
> cross-verified against ≥2 independent open sources** ([spec-v97](spec-v97.md)).
> All are Class A with no staleness rows.

## 2. What v236 adds (4 tiles)

All Group G; all Class A.

| id | name | inputs → output | citation |
| --- | --- | --- | --- |
| `spherical-equivalent` | Spherical equivalent | sphere + cylinder/2 → D | StatPearls (NBK589657) |
| `vertex-distance` | Vertex distance conversion | Fs / (1 − d·Fs) → D | geometric optics |
| `percent-tissue-altered` | Percent tissue altered | (flap + ablation) / CCT × 100; ≥ 40% high risk | Santhiago. Am J Ophthalmol. 2014 |
| `randleman-erss` | Randleman Ectasia Risk Score | topography + RSB + age + CCT + MRSE, each 0-4 | Randleman. Ophthalmology. 2008 |

## 3. Source cross-verification (spec-v97)

- **Spherical equivalent:** SE = sphere + cylinder/2. Reproduced from StatPearls and
  standard refraction references.
- **Vertex distance:** Fc = Fs / (1 − d·Fs), d in meters. Reproduced from the
  geometric-optics derivation (Wikipedia) and Omnicalculator.
- **Percent tissue altered:** (flap thickness + ablation depth) / central corneal
  thickness × 100; ≥ 40% is the strongest single predictor of post-LASIK ectasia in
  a normal-topography eye. Reproduced from Santhiago 2014 and AAO EyeNet.
- **Randleman ERSS:** topography (0-4), residual stromal bed (0-4), age (0-4),
  corneal thickness (0-4), MRSE myopia magnitude (0-4); 0-2 low, 3 moderate, ≥ 4
  high. Reproduced from Randleman 2008 (PMC3748728) and PMC7591850.

## 4. Per-tile robustness

- **Every compute routes through `lib/num.js` and is finite-guarded.** Diopter and
  micron inputs coerce to bounded numbers; the vertex conversion guards the
  1 − d·Fs = 0 singularity; a blank field yields a "complete the fields" message,
  never a `NaN`.
- **Each tile reports its value / risk band and the driving inputs**
  ([spec-v59](spec-v59.md)).
- **All compute a value or risk score, none diagnose or order**
  ([spec-v11](spec-v11.md) §5.3); each renders the [spec-v50](spec-v50.md) §3 note.
- **All flow through the [spec-v59](spec-v59.md) fuzz harness with zero non-finite
  leaks.**

## 5. Files touched

```
docs/spec-v236.md                        (this file)
app.js                                   (+4 UTILITIES rows; import group-v236 RV236 into RENDERERS)
lib/ophtho-v236.js                       (new: sphericalEquivalent, vertexDistance, percentTissueAltered, randlemanErss)
lib/meta.js                              (+4 META entries)
views/group-v236.js                      (new renderer module: 4 renderers)
test/unit/ophtho-v236.test.js            (new: worked examples)
test/unit/fuzz-tools.test.js             (register ophtho-v236.js)
index.html, README.md, package.json, docs/architecture.md, docs/scope-mdcalc-parity.md, docs/scope-post-parity.md   (catalog count 1021 → 1025)
```
