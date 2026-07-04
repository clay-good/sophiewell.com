# spec-v234.md — Dermatology scoring indices: MASI, SALT, NAPSI (per target nail), and the Vancouver Scar Scale (+4 tiles → 1017)

> Status: **SHIPPED (2026-07-04).** A dermatology-severity slice. Adds **4**
> well-established deterministic scoring indices. **Each id was verified absent by a
> fixed-string scan of the extracted `app.js` id/name lists AND the MCP adapter
> set** (spec-v85 §6.2): the catalog carried `pasi`, `easi`, `scorad`, `dlqi`, and
> `uas7`, but none of MASI, SALT, NAPSI, or the Vancouver Scar Scale.
>
> Catalog effect: **live `UTILITIES.length` + 4** (1013 → 1017) — enforced by the
> catalog-truth gate ([spec-v46](spec-v46.md)).
>
> Every prior spec remains in force. v234 adds no runtime network call and no AI;
> each tile obeys the [spec-v100](spec-v100.md) §2 doctrine, passes the
> [spec-v29](spec-v29.md) §3 one-line test, ships its citation inline
> ([spec-v54](spec-v54.md)), inherits the [spec-v59](spec-v59.md) output-safety
> contract, renders the [spec-v50](spec-v50.md) §3 posture note, and honors
> [spec-v11](spec-v11.md) §5.3 (**no diagnosis and no treatment order** — these
> grade and classify severity). **Every formula is re-fetched and cross-verified
> against ≥2 independent open sources** ([spec-v97](spec-v97.md)). All are Class A
> with no staleness rows.

## 2. What v234 adds (4 tiles)

All Group G; all Class A.

| id | name | inputs → output | citation |
| --- | --- | --- | --- |
| `masi` | Melasma Area and Severity Index | 4 regions × (Area 0-6, Darkness + Homogeneity 0-4), weighted → 0-48 | Kimbrough-Green. Arch Dermatol. 1994 |
| `salt-score` | Severity of Alopecia Tool | 4 scalp regions × % loss, weighted → 0-100 + S0-S5 | Olsen. J Am Acad Dermatol. 2004 |
| `napsi` | Nail Psoriasis Severity Index | matrix (0-4) + bed (0-4) per nail → 0-8 | Rich & Scher. J Am Acad Dermatol. 2003 |
| `vancouver-scar-scale` | Vancouver Scar Scale | pigmentation + vascularity + pliability + height → 0-13 | Sullivan. J Burn Care Rehabil. 1990 |

## 3. Source cross-verification (spec-v97)

- **MASI:** forehead / right malar / left malar weighted 0.3, chin 0.1; region term =
  weight × Area × (Darkness + Homogeneity); range 0-48. Reproduced from Kimbrough-Green
  1994 and plasticsurgerykey / globale-dermatologie. No official severity bands.
- **SALT:** top 0.40, back 0.24, right 0.18, left 0.18 of % terminal hair loss;
  range 0-100 with S0-S5 categories. Reproduced from Olsen 2004 (PMC7450487) and DermaTopics.
- **NAPSI (per nail):** matrix quadrant count (0-4) + bed quadrant count (0-4) = 0-8;
  patient total sums involved nails. Reproduced from Rich & Scher 2003 and clinical references.
- **Vancouver Scar Scale:** pigmentation (0-2) + vascularity (0-3) + pliability (0-5) +
  height (0-3) = 0-13. Reproduced from Sullivan 1990 and independent scar-scale reviews.

## 4. Per-tile robustness

- **Every compute routes through `lib/num.js` and is finite-guarded.** Bounded
  select/percent inputs coerce to integers/percentages; a blank form yields a 0
  score, not a `NaN`.
- **Each tile reports its score, the band / S-category / driving inputs**
  ([spec-v59](spec-v59.md)).
- **All grade or classify severity, none diagnose or order** ([spec-v11](spec-v11.md)
  §5.3); each renders the [spec-v50](spec-v50.md) §3 posture note.
- **All flow through the [spec-v59](spec-v59.md) fuzz harness with zero non-finite
  leaks.**

## 5. Files touched

```
docs/spec-v234.md                        (this file)
app.js                                   (+4 UTILITIES rows; import group-v234 RV234 into RENDERERS)
lib/dermscore-v234.js                    (new: masi, saltScore, napsi, vancouverScarScale)
lib/meta.js                              (+4 META entries)
views/group-v234.js                      (new renderer module: 4 renderers)
test/unit/dermscore-v234.test.js         (new: worked examples)
test/unit/fuzz-tools.test.js             (register dermscore-v234.js)
index.html, README.md, package.json, docs/architecture.md, docs/scope-mdcalc-parity.md, docs/scope-post-parity.md   (catalog count 1013 → 1017)
```
