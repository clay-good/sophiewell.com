# spec-v221.md — Pulmonary & critical-care risk scores: the Simplified Revised Geneva PE score, the SCAP and CORB pneumonia-severity scores, the RESP ECMO-survival score, the ILD-GAP and du Bois IPF mortality scores, and the Collins pneumothorax-size formula (+7 tiles)

> Status: **SHIPPED (2026-07-03).** Ninth feature spec of the **Bedside Decision &
> Physiology Instruments** program ([spec-v213](spec-v213.md)). Adds **7**
> deterministic pulmonary and critical-care risk scores, each **verified absent by
> a direct scan of `app.js`** (spec-v85 §6.2): the catalog carries
> `wells-pe-geneva`, `geneva-original`, `psi`, `curb-65`, `gap-ipf`,
> `driving-pressure`, and `lis-murray`, but **not** the Simplified Revised Geneva
> score, SCAP, CORB, RESP, ILD-GAP, the du Bois IPF score, or the Collins
> pneumothorax-size formula.
>
> Catalog effect: **live `UTILITIES.length` + 7** — enforced by the catalog-truth
> gate ([spec-v46](spec-v46.md)).
>
> Every prior spec remains in force. v221 adds no runtime network call and no AI;
> each tile obeys the [spec-v100](spec-v100.md) §2 doctrine, passes the
> [spec-v29](spec-v29.md) §3 one-line test, ships its citation inline
> ([spec-v54](spec-v54.md)), inherits the [spec-v59](spec-v59.md) output-safety
> contract, renders the [spec-v50](spec-v50.md) §3 posture note, and honors
> [spec-v11](spec-v11.md) §5.3 (**no anticoagulation, ECMO, admission, or drainage
> order**). **Every point value is re-fetched and cross-verified against ≥2
> independent open sources** ([spec-v97](spec-v97.md)).

## 2. What v221 adds (7 tiles)

All Group G; all Class A; journal + author citations, none trips `ISSUER_PATTERN`.

| id | name | inputs → output | citation |
| --- | --- | --- | --- |
| `simplified-revised-geneva` | Simplified Revised Geneva | 8-point PE probability → unlikely / likely | Klok FA, et al. Arch Intern Med. 2008;168(19):2131-2136 |
| `scap-score` | SCAP score | weighted major/minor criteria → severe CAP (>= 10) | España PP, et al. Am J Respir Crit Care Med. 2006;174(11):1249-1256 |
| `corb-score` | CORB score | confusion, oxygenation, RR, BP (0-4) → severe CAP (>= 2) | Buising KL, et al. Emerg Med Australas. 2007;19(5):418-426 |
| `resp-score` | RESP score | age, immunocompromise, ventilation, diagnosis, modifiers → ECMO survival class | Schmidt M, et al. Am J Respir Crit Care Med. 2014;189(11):1374-1382 |
| `ild-gap` | ILD-GAP index | subtype, sex, age, FVC, DLCO → stage I-IV mortality | Ryerson CJ, et al. Chest. 2014;145(4):723-728 |
| `du-bois-ipf` | du Bois IPF score | age, hospitalization, FVC, FVC change (0-61) → 1-year mortality | du Bois RM, et al. Am J Respir Crit Care Med. 2011;184(4):459-466 |
| `pneumothorax-volume` | Pneumothorax size | interpleural distances → percent of hemithorax | Collins CD, et al. AJR Am J Roentgenol. 1995;165(5):1127-1130 |

## 3. Per-tile robustness

- **Every compute routes through `lib/num.js` and is finite-guarded.** Numeric
  inputs clamp to their published domains; the RESP negative-weight bands and the
  du Bois signed FVC-change term are handled explicitly; the pneumothorax percent
  caps at 100. Each renders a complete-the-fields fallback rather than a `NaN`.
- **Each tile reports its score / class / stage, the band, and the driving
  inputs** ([spec-v59](spec-v59.md)).
- **All seven stratify / estimate, not order** ([spec-v11](spec-v11.md) §5.3);
  each renders the [spec-v50](spec-v50.md) §3 posture note.
- **All seven flow through the [spec-v59](spec-v59.md) fuzz harness with zero
  non-finite leaks.**

## 4. Files touched

```
docs/spec-v221.md                        (this file)
app.js                                   (+7 UTILITIES rows; import group-v221 RV221 into RENDERERS)
lib/pulmonary-risk-v221.js               (new: simplifiedGeneva, scap, corb, resp, ildGap, duBoisIpf, pneumothoraxVolume)
lib/meta.js                              (+7 META entries)
views/group-v221.js                      (new renderer module: 7 renderers)
test/unit/pulmonary-risk-v221.test.js    (worked examples)
test/unit/fuzz-tools.test.js             (add lib/pulmonary-risk-v221.js to MODULES)
CHANGELOG.md, README.md, package.json, docs/architecture.md, docs/scope-post-parity.md, docs/scope-mdcalc-parity.md  (catalog count live -> live+7)
```

## 5. Acceptance criteria

v221 is fully shipped when all 7 tiles are live (Class A) with a `META[id]` entry,
inline citation + `citationUrl` + `accessed`, and worked examples; every compute is
finite-guarded and fuzz-covered; `UTILITIES.length` is **live + 7** across all
catalog-truth surfaces; and `npm run lint`, `npm run test`, `npm run sbom`, and
`npm run build` all pass.

## 6. Out of scope for v221

- **No anticoagulation / ECMO / admission / drainage order** — the tiles stratify
  and estimate; the decisions stay with the clinician and the patient
  ([spec-v11](spec-v11.md) §5.3). Static/dynamic **respiratory-system compliance**
  is deferred: the live `driving-pressure` tile already computes it.
