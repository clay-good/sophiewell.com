# spec-v249.md — Renal & respiratory bedside formulas: the renal failure index, the fractional excretion of uric acid, the bronchodilator responsiveness, and the integrative weaning index (+4 tiles → 1078)

> Status: **SHIPPED (2026-07-04).** A nephrology / pulmonary-critical-care slice.
> Adds **4** well-established deterministic formulas. **Each id was verified absent
> by a fixed-string scan of the extracted `app.js` id/name lists AND the MCP adapter
> set** (spec-v85 §6.2): the catalog carried `fena-feurea`, `predicted-spirometry`,
> and `rsbi`, but none of these four.
>
> Catalog effect: **live `UTILITIES.length` + 4** (1074 → 1078) — enforced by the
> catalog-truth gate ([spec-v46](spec-v46.md)).
>
> Every prior spec remains in force. v249 adds no runtime network call and no AI;
> each tile obeys the [spec-v100](spec-v100.md) §2 doctrine, passes the
> [spec-v29](spec-v29.md) §3 one-line test, ships its citation inline
> ([spec-v54](spec-v54.md)), inherits the [spec-v59](spec-v59.md) output-safety
> contract, renders the [spec-v50](spec-v50.md) §3 posture note, and honors
> [spec-v11](spec-v11.md) §5.3 (**no diagnosis and no treatment order**). **Every
> formula is re-fetched and cross-verified against ≥2 independent open sources**
> ([spec-v97](spec-v97.md)). All are Class A with no staleness rows.

## 2. What v249 adds (4 tiles)

All Group G; all Class A.

| id | name | inputs → output | citation |
| --- | --- | --- | --- |
| `renal-failure-index` | Renal failure index | UNa × PCr / UCr | Miller. Ann Intern Med. 1978 |
| `feua` | Fractional excretion of uric acid | 100 × UUA·SCr / (SUA·UCr) | standard nephrology |
| `bronchodilator-response` | Bronchodilator responsiveness | 100 × (post − pre)/predicted | ATS/ERS. 2022 |
| `integrative-weaning-index` | Integrative weaning index | Cstat × SaO2 / RSBI | Nemer. Crit Care. 2009 |

## 3. Source cross-verification (spec-v97)

- **RFI:** urine Na × plasma Cr / urine Cr; < 1 prerenal, > 1 ATN. Reproduced from
  GlobalRPh and MDApp (distinct from FeNa — no plasma-sodium term).
- **FEUA:** 100 × (UUA × SCr) / (SUA × UCr); 4-11% normal. Reproduced from wikidoc
  and medicalalgorithms.
- **Bronchodilator response:** 100 × (post − pre)/predicted; > 10% significant per
  ATS/ERS 2022. Reproduced from ERJ 2022 and PMC10392779.
- **IWI:** static compliance × SaO2 / RSBI; ≥ 25 weaning success. Reproduced from
  Nemer 2009 (PMC2784374) and PMC4711200.

## 4. Per-tile robustness

- **Every compute routes through `lib/num.js` and is finite-guarded.** Lab and
  spirometry inputs coerce to bounded numbers; denominators are guarded by their
  positive input ranges; a blank field yields a "complete the fields" message, never
  a `NaN`.
- **Each tile reports its value, the band, and the driving inputs**
  ([spec-v59](spec-v59.md)).
- **All compute a value, none diagnose or order** ([spec-v11](spec-v11.md) §5.3);
  each renders the [spec-v50](spec-v50.md) §3 posture note.
- **All flow through the [spec-v59](spec-v59.md) fuzz harness with zero non-finite
  leaks.**

## 5. Files touched

```
docs/spec-v249.md                        (this file)
app.js                                   (+4 UTILITIES rows; import group-v249 RV249 into RENDERERS)
lib/renalpulm-v249.js                    (new: renalFailureIndex, feua, bronchodilatorResponse, integrativeWeaningIndex)
lib/meta.js                              (+4 META entries)
views/group-v249.js                      (new renderer module: 4 renderers)
test/unit/renalpulm-v249.test.js         (new: worked examples)
test/unit/fuzz-tools.test.js             (register renalpulm-v249.js)
index.html, README.md, package.json, docs/architecture.md, docs/scope-mdcalc-parity.md, docs/scope-post-parity.md   (catalog count 1074 → 1078)
```
