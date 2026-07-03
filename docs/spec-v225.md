# spec-v225.md — Obstetrics & gynecology scoring: the Nugent and Amsel bacterial-vaginosis criteria, the modified Ferriman-Gallwey hirsutism score, the PBAC menstrual-blood-loss chart, the Thompson neonatal-encephalopathy score, the Menopause Rating Scale, and the Blatt-Kupperman index (+7 tiles)

> Status: **SHIPPED (2026-07-03).** Thirteenth feature spec of the **Bedside
> Decision & Physiology Instruments** program ([spec-v213](spec-v213.md)). Adds
> **7** deterministic obstetrics and gynecology instruments, each **verified absent
> by a direct scan of `app.js`** (spec-v85 §6.2): the catalog carries `bishop`,
> `apgar`, `ballard`, `epds`, and `due-date`, but **not** the Nugent or Amsel
> criteria, the Ferriman-Gallwey score, PBAC, the Thompson score, the Menopause
> Rating Scale, or the Blatt-Kupperman index.
>
> Catalog effect: **live `UTILITIES.length` + 7** — enforced by the catalog-truth
> gate ([spec-v46](spec-v46.md)).
>
> Every prior spec remains in force. v225 adds no runtime network call and no AI;
> each tile obeys the [spec-v100](spec-v100.md) §2 doctrine, passes the
> [spec-v29](spec-v29.md) §3 one-line test, ships its citation inline
> ([spec-v54](spec-v54.md)), inherits the [spec-v59](spec-v59.md) output-safety
> contract, renders the [spec-v50](spec-v50.md) §3 posture note, and honors
> [spec-v11](spec-v11.md) §5.3 (**no diagnostic or treatment order** — these score
> and classify). **Every point value is re-fetched and cross-verified against ≥2
> independent open sources** ([spec-v97](spec-v97.md)).

## 2. What v225 adds (7 tiles)

All Group G; all Class A; journal + author citations, none trips `ISSUER_PATTERN`.

| id | name | inputs → output | citation |
| --- | --- | --- | --- |
| `nugent-score` | Nugent score | 3 morphotype grades (0-10) → BV at 7-10 | Nugent RP, et al. J Clin Microbiol. 1991;29(2):297-301 |
| `amsel-criteria` | Amsel criteria | 4 findings → BV at >= 3 | Amsel R, et al. Am J Med. 1983;74(1):14-22 |
| `ferriman-gallwey` | Modified Ferriman-Gallwey | 9 areas × 0-4 (0-36) → hirsutism at >= 8 | Ferriman D, Gallwey JD. J Clin Endocrinol Metab. 1961;21(11):1440-1447 |
| `pbac-hmb` | PBAC | weighted pad/tampon/clot tally → HMB at > 100 | Higham JM, et al. Br J Obstet Gynaecol. 1990;97(8):734-739 |
| `thompson-hie` | Thompson score | 9 neonatal signs → mild/moderate/severe | Thompson CM, et al. Acta Paediatr. 1997;86(7):757-761 |
| `menopause-rating-scale` | Menopause Rating Scale | 11 items × 0-4 (0-44) → severity band | Heinemann K, et al. Health Qual Life Outcomes. 2004;2:45 |
| `kupperman-index` | Blatt-Kupperman index | 11 weighted symptoms (to 51) → severity band | Kupperman HS, et al. J Clin Endocrinol Metab. 1953;13(6):688-703 |

## 3. Per-tile robustness

- **Every compute routes through `lib/num.js` and is finite-guarded.** Grade
  selects parse to fixed values and clamp; PBAC weights non-negative counts;
  Amsel is a count-threshold classifier. Each renders a complete-the-fields
  fallback rather than a `NaN`.
- **Each tile reports its score, the band, and the driving inputs**
  ([spec-v59](spec-v59.md)).
- **All seven score / classify, not order** ([spec-v11](spec-v11.md) §5.3); each
  renders the [spec-v50](spec-v50.md) §3 posture note.
- **All seven flow through the [spec-v59](spec-v59.md) fuzz harness with zero
  non-finite leaks.**

## 4. Files touched

```
docs/spec-v225.md                        (this file)
app.js                                   (+7 UTILITIES rows; import group-v225 RV225 into RENDERERS)
lib/obgyn-v225.js                        (new: nugent, amsel, ferrimanGallwey, pbac, thompsonHie, menopauseRating, kupperman)
lib/meta.js                              (+7 META entries)
views/group-v225.js                      (new renderer module: 7 renderers)
test/unit/obgyn-v225.test.js             (worked examples)
test/unit/fuzz-tools.test.js             (add lib/obgyn-v225.js to MODULES)
CHANGELOG.md, README.md, package.json, docs/architecture.md, docs/scope-post-parity.md, docs/scope-mdcalc-parity.md  (catalog count live -> live+7)
```

## 5. Acceptance criteria

v225 is fully shipped when all 7 tiles are live (Class A) with a `META[id]` entry,
inline citation + `citationUrl` + `accessed`, and worked examples; every compute is
finite-guarded and fuzz-covered; `UTILITIES.length` is **live + 7** across all
catalog-truth surfaces; and `npm run lint`, `npm run test`, `npm run sbom`, and
`npm run build` all pass.

## 6. Out of scope for v225

- **No diagnostic / treatment order** — the tiles score and classify; the decisions
  stay with the clinician and the patient ([spec-v11](spec-v11.md) §5.3). Band
  cutoffs for the Blatt-Kupperman index vary across "modified Kupperman" variants;
  the tile states the variant it uses.
