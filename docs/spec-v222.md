# spec-v222.md — Rheumatology classification & activity: the 2017 EULAR/ACR myositis criteria, the 2012 PMR criteria, Bohan & Peter criteria, the 2013 systemic-sclerosis criteria, the modified Rodnan skin score, the 2016 Sjögren criteria, and ESSPRI (+7 tiles)

> Status: **SHIPPED (2026-07-03).** Tenth feature spec of the **Bedside Decision &
> Physiology Instruments** program ([spec-v213](spec-v213.md)). Adds **7**
> deterministic rheumatology classification and activity instruments, each
> **verified absent by a direct scan of `app.js`** (spec-v85 §6.2): the catalog
> carries `sledai-2k`, `slicc-sle`, `essdai`, `gca-acr-eular-2022`, `dapsa`, and
> `rapid3`, but **not** the 2017 myositis criteria, the 2012 PMR criteria, Bohan &
> Peter criteria, the 2013 systemic-sclerosis criteria, the modified Rodnan skin
> score, the 2016 Sjögren criteria, or ESSPRI.
>
> Catalog effect: **live `UTILITIES.length` + 7** — enforced by the catalog-truth
> gate ([spec-v46](spec-v46.md)).
>
> Every prior spec remains in force. v222 adds no runtime network call and no AI;
> each tile obeys the [spec-v100](spec-v100.md) §2 doctrine, passes the
> [spec-v29](spec-v29.md) §3 one-line test, ships its citation inline
> ([spec-v54](spec-v54.md)), inherits the [spec-v59](spec-v59.md) output-safety
> contract, renders the [spec-v50](spec-v50.md) §3 posture note, and honors
> [spec-v11](spec-v11.md) §5.3 (**no diagnostic or treatment order** — these
> classify and score activity). **Every point value is re-fetched and
> cross-verified against ≥2 independent open sources** ([spec-v97](spec-v97.md));
> the myositis criteria use the published without-biopsy weights.

## 2. What v222 adds (7 tiles)

All Group G; all Class A; journal + author citations, none trips `ISSUER_PATTERN`.

| id | name | inputs → output | citation |
| --- | --- | --- | --- |
| `iim-eular-acr-2017` | 2017 EULAR/ACR myositis | weighted criteria → definite / probable / possible | Lundberg IE, et al. Arthritis Rheumatol. 2017;69(12):2271-2282 |
| `pmr-eular-acr-2012` | 2012 PMR criteria | 4-item score (0-6) → PMR at >= 4 | Dasgupta B, et al. Ann Rheum Dis. 2012;71(4):484-492 |
| `bohan-peter` | Bohan & Peter criteria | 5 criteria → PM/DM definite/probable/possible | Bohan A, Peter JB. N Engl J Med. 1975;292(7):344-347 |
| `acr-eular-2013-systemic-sclerosis` | 2013 systemic sclerosis | weighted criteria → SSc at >= 9 | van den Hoogen F, et al. Arthritis Rheum. 2013;65(11):2737-2747 |
| `mrss-modified-rodnan-skin-score` | Modified Rodnan skin score | 17 sites × 0-3 (0-51) | Clements P, et al. J Rheumatol. 1995;22(7):1281-1285 |
| `acr-eular-2016-sjogren` | 2016 Sjögren criteria | 5 weighted items (0-9) → Sjögren at >= 4 | Shiboski CH, et al. Arthritis Rheumatol. 2017;69(1):35-45 |
| `esspri` | ESSPRI | mean of 3 patient VAS (0-10) | Seror R, et al. Ann Rheum Dis. 2011;70(6):968-972 |

## 3. Per-tile robustness

- **Every compute routes through `lib/num.js` and is finite-guarded.** The
  weighted-sum tiles (myositis, systemic sclerosis) parse each item to a fixed
  weight and clamp the total; the modified Rodnan score sums 17 site grades (each
  0-3) and clamps to 51; ESSPRI guards its three 0-10 inputs; the classifiers are
  count/threshold rules. Each renders a complete-the-fields fallback rather than a
  `NaN`.
- **Each tile reports its score / verdict, the band, and the driving inputs**
  ([spec-v59](spec-v59.md)).
- **All seven classify / score activity, not order** ([spec-v11](spec-v11.md)
  §5.3); each renders the [spec-v50](spec-v50.md) §3 posture note.
- **All seven flow through the [spec-v59](spec-v59.md) fuzz harness with zero
  non-finite leaks.**

## 4. Files touched

```
docs/spec-v222.md                        (this file)
app.js                                   (+7 UTILITIES rows; import group-v222 RV222 into RENDERERS)
lib/rheum-classification-v222.js         (new: iimEularAcr, pmrEularAcr, bohanPeter, ssc2013, mrss, sjogren2016, esspri)
lib/meta.js                              (+7 META entries)
views/group-v222.js                      (new renderer module: 7 renderers)
test/unit/rheum-classification-v222.test.js (worked examples)
test/unit/fuzz-tools.test.js             (add lib/rheum-classification-v222.js to MODULES)
CHANGELOG.md, README.md, package.json, docs/architecture.md, docs/scope-post-parity.md, docs/scope-mdcalc-parity.md  (catalog count live -> live+7)
```

## 5. Acceptance criteria

v222 is fully shipped when all 7 tiles are live (Class A) with a `META[id]` entry,
inline citation + `citationUrl` + `accessed`, and worked examples; every compute is
finite-guarded and fuzz-covered; `UTILITIES.length` is **live + 7** across all
catalog-truth surfaces; and `npm run lint`, `npm run test`, `npm run sbom`, and
`npm run build` all pass.

## 6. Out of scope for v222

- **No diagnostic / treatment order** — the tiles classify and score activity; the
  decisions stay with the rheumatologist and the patient ([spec-v11](spec-v11.md)
  §5.3). **BVAS v3** and the **Vasculitis Damage Index** are deferred: their full
  56- and 64-item point maps are not reproducible from ≥2 open sources
  ([spec-v97](spec-v97.md)) without transcribing the official forms verbatim.
