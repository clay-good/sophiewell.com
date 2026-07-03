# spec-v216.md — Hematology prognostic scores & staging: WPSS (MDS), the MDACC CLL index, PIT (PTCL-U), PRIMA-PI (follicular lymphoma), Durie-Salmon myeloma staging, lymphocyte doubling time, and Talcott febrile-neutropenia groups (+7 tiles)

> Status: **SHIPPED (2026-07-03).** Fourth feature spec of the **Bedside Decision &
> Physiology Instruments** program ([spec-v213](spec-v213.md)). Adds **7**
> deterministic hematology prognostic instruments, each **verified absent by a
> direct scan of `app.js`** (spec-v85 §6.2): the catalog carries `ipss-r-mds`,
> `cll-ipi`, `binet-cll`, `rai-cll`, `flipi`, `nccn-ipi`, `myeloma-iss`,
> `myeloma-r-iss`, and `mascc`, but **not** WPSS, the MDACC CLL index, PIT,
> PRIMA-PI, Durie-Salmon staging, lymphocyte doubling time, or the Talcott rules.
>
> Catalog effect: **live `UTILITIES.length` + 7** — enforced by the catalog-truth
> gate ([spec-v46](spec-v46.md)).
>
> Every prior spec remains in force. v216 adds no runtime network call and no AI;
> each tile obeys the [spec-v100](spec-v100.md) §2 doctrine, passes the
> [spec-v29](spec-v29.md) §3 one-line test, ships its citation inline
> ([spec-v54](spec-v54.md)), inherits the [spec-v59](spec-v59.md) output-safety
> contract, renders the [spec-v50](spec-v50.md) §3 posture note, and honors
> [spec-v11](spec-v11.md) §5.3 (**no chemotherapy, transplant, or treatment
> order** — these stage and stratify prognosis). **Every point value / cut-point is
> re-fetched and cross-verified against ≥2 independent open sources**
> ([spec-v97](spec-v97.md)).

## 2. What v216 adds (7 tiles)

All Group G; all Class A; journal + author citations, none trips `ISSUER_PATTERN`.

| id | name | inputs → output | citation |
| --- | --- | --- | --- |
| `wpss-mds` | WPSS | WHO category + karyotype + transfusion (0-6) → MDS survival band | Malcovati L, et al. J Clin Oncol. 2007;25(23):3503-3510 |
| `mdacc-cll-index` | MDACC CLL index | age, B2M band, ALC, male, Rai III-IV, nodal groups (0-9) → CLL survival band | Wierda WG, et al. Blood. 2007;109(11):4679-4685 |
| `pit-ptcl` | PIT (PTCL-U) | age > 60, LDH > normal, ECOG >= 2, marrow (0-4) → PTCL prognostic group | Gallamini A, et al. Blood. 2004;103(7):2474-2479 |
| `prima-pi` | PRIMA-PI | B2M threshold 3 mg/L + marrow → follicular-lymphoma risk group | Bachy E, et al. Blood. 2018;132(1):49-58 |
| `durie-salmon` | Durie-Salmon staging | Hb, calcium, bone lesions, M-protein, creatinine → myeloma stage I/II/III + A/B | Durie BGM, Salmon SE. Cancer. 1975;36(3):842-854 |
| `lymphocyte-doubling-time` | Lymphocyte doubling time | two ALCs + interval → doubling time (months) | Molica S, Alberti A. Cancer. 1987;60(11):2712-2716 |
| `talcott-febrile-neutropenia` | Talcott rules | inpatient / comorbidity / uncontrolled cancer → risk group I-IV | Talcott JA, et al. Arch Intern Med. 1988;148(12):2561-2568 |

## 3. Per-tile robustness

- **Every compute routes through `lib/num.js` and is finite-guarded.** Banded
  select inputs parse to fixed point values; numeric inputs clamp to their
  published domains; `lymphocyte-doubling-time` guards its `ln(ALC2/ALC1)`
  denominator (requires the later count to exceed the earlier). Each renders a
  complete-the-fields fallback rather than a `NaN`.
- **Each tile reports its score / stage / group, the band, and the driving
  inputs** ([spec-v59](spec-v59.md)).
- **All seven stage / stratify, not order** ([spec-v11](spec-v11.md) §5.3); each
  renders the [spec-v50](spec-v50.md) §3 posture note.
- **All seven flow through the [spec-v59](spec-v59.md) fuzz harness with zero
  non-finite leaks.**

## 4. Files touched

```
docs/spec-v216.md                        (this file)
app.js                                   (+7 UTILITIES rows; import group-v216 RV216 into RENDERERS)
lib/heme-prognostic-v216.js              (new: wpssMds, mdaccCll, pitPtcl, primaPi, durieSalmon, ldt, talcott)
lib/meta.js                              (+7 META entries)
views/group-v216.js                      (new renderer module: 7 renderers)
test/unit/heme-prognostic-v216.test.js   (worked examples)
test/unit/fuzz-tools.test.js             (add lib/heme-prognostic-v216.js to MODULES)
CHANGELOG.md, README.md, package.json, docs/architecture.md, docs/scope-post-parity.md, docs/scope-mdcalc-parity.md  (catalog count live -> live+7)
```

## 5. Acceptance criteria

v216 is fully shipped when all 7 tiles are live (Class A) with a `META[id]` entry,
inline citation + `citationUrl` + `accessed`, and worked examples; every compute is
finite-guarded and fuzz-covered; `UTILITIES.length` is **live + 7** across all
catalog-truth surfaces; and `npm run lint`, `npm run test`, `npm run sbom`, and
`npm run build` all pass.

## 6. Out of scope for v216

- **No chemotherapy / transplant / treatment order** — the tiles stage and
  stratify; the decisions stay with the hematologist-oncologist and the patient
  ([spec-v11](spec-v11.md) §5.3).
