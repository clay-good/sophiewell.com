# spec-v215.md — Lipid, device & oncology risk scores: the Dutch Lipid Clinic Network and Simon Broome familial-hypercholesterolemia classifiers, the PADIT cardiac-device infection score, the GRIm-Score and Lung Immune Prognostic Index, and the ONKOTEV and PROTECHT cancer-VTE scores (+7 tiles)

> Status: **SHIPPED (2026-07-03).** Third feature spec of the **Bedside Decision &
> Physiology Instruments** program ([spec-v213](spec-v213.md)). Adds **7**
> deterministic lipid, device, and oncology risk scores, each **verified absent by
> a direct scan of `app.js`** (spec-v85 §6.2): the catalog carries `ldl-calc`,
> `khorana`, and the lymphoma indices, but **not** the DLCN or Simon Broome FH
> classifiers, the PADIT score, the GRIm-Score, the Lung Immune Prognostic Index,
> or the ONKOTEV / PROTECHT cancer-VTE scores.
>
> Catalog effect: **live `UTILITIES.length` + 7** — enforced by the catalog-truth
> gate ([spec-v46](spec-v46.md)).
>
> Every prior spec remains in force. v215 adds no runtime network call and no AI;
> each tile obeys the [spec-v100](spec-v100.md) §2 doctrine, passes the
> [spec-v29](spec-v29.md) §3 one-line test, ships its citation inline
> ([spec-v54](spec-v54.md)), inherits the [spec-v59](spec-v59.md) output-safety
> contract, renders the [spec-v50](spec-v50.md) §3 posture note, and honors
> [spec-v11](spec-v11.md) §5.3 (**no statin, device, chemotherapy, or
> thromboprophylaxis order** — these classify and stratify). **Every point value is
> re-fetched and cross-verified against ≥2 independent open sources**
> ([spec-v97](spec-v97.md)).

## 2. What v215 adds (7 tiles)

All Group G; all Class A. Citations are drawn from journal + author sources that
do **not** contain a guideline-issuer acronym, so none trips `ISSUER_PATTERN`
([spec-v92](spec-v92.md)) and no `docs/citation-staleness.md` row is added.

| id | name | inputs → output | citation |
| --- | --- | --- | --- |
| `dlcn-fh-score` | Dutch Lipid Clinic Network score | family history, clinical history, physical exam, LDL-C band, DNA mutation → FH probability band | Nordestgaard BG, et al. Eur Heart J. 2013;34(45):3478-3490 |
| `simon-broome-fh` | Simon Broome criteria | cholesterol criterion + tendon xanthoma / DNA / family history → definite / possible FH | Scientific Steering Committee, Simon Broome Register Group. BMJ. 1991;303(6807):893-896 |
| `padit-score` | PADIT score | prior procedures, age band, eGFR < 30, immunocompromised, procedure type (0-15) → CIED infection risk | Birnie DH, et al. J Am Coll Cardiol. 2019;74(23):2845-2854 |
| `grim-score` | GRIm-Score | LDH > ULN, albumin < 3.5, NLR > 6 (0-3) → survival on immunotherapy | Bigot F, et al. Eur J Cancer. 2017;84:212-218 |
| `lipi` | Lung Immune Prognostic Index | dNLR > 3, LDH > ULN (0-2) → immunotherapy prognostic group | Mezquita L, et al. JAMA Oncol. 2018;4(3):351-357 |
| `onkotev-score` | ONKOTEV score | Khorana > 2, metastatic, vascular/lymphatic compression, previous VTE (0-4) → 6-month cancer VTE risk | Cella CA, et al. Oncologist. 2017;22(5):601-608 |
| `protecht-score` | PROTECHT score | Khorana base + platinum + gemcitabine (0-8) → cancer-associated VTE risk | Verso M, et al. Intern Emerg Med. 2012;7(4):291-292 |

## 3. Per-tile robustness

- **Every compute routes through `lib/num.js` and is finite-guarded.** The banded
  select inputs parse to fixed point values; the numeric inputs (DLCN LDL-C,
  Simon Broome cholesterols, PADIT age, GRIm albumin/NLR, LIPI ANC/WBC) clamp to
  their published domains; `lipi` guards its `ANC / (WBC − ANC)` denominator. Each
  renders a complete-the-fields fallback rather than a `NaN`.
- **Each tile reports its result, the band that applies, and the driving inputs**
  ([spec-v59](spec-v59.md)).
- **All seven classify / stratify, not order** ([spec-v11](spec-v11.md) §5.3);
  each renders the [spec-v50](spec-v50.md) §3 posture note.
- **All seven flow through the [spec-v59](spec-v59.md) fuzz harness with zero
  non-finite leaks.**

## 4. Files touched

```
docs/spec-v215.md                        (this file)
app.js                                   (+7 UTILITIES rows; import group-v215 RV215 into RENDERERS)
lib/risk-scores-v215.js                  (new: dlcnFh, simonBroomeFh, padit, grimScore, lipi, onkotev, protecht)
lib/meta.js                              (+7 META entries)
views/group-v215.js                      (new renderer module: 7 renderers)
test/unit/risk-scores-v215.test.js       (worked examples)
test/unit/fuzz-tools.test.js             (add lib/risk-scores-v215.js to MODULES)
CHANGELOG.md, README.md, package.json, docs/architecture.md, docs/scope-post-parity.md, docs/scope-mdcalc-parity.md  (catalog count live -> live+7)
```

## 5. Acceptance criteria

v215 is fully shipped when all 7 tiles are live (Class A) with a `META[id]` entry,
inline citation + `citationUrl` + `accessed`, and worked examples; every compute is
finite-guarded and fuzz-covered; `UTILITIES.length` is **live + 7** across all
catalog-truth surfaces; and `npm run lint`, `npm run test`, `npm run sbom`, and
`npm run build` all pass.

## 6. Out of scope for v215

- **No statin / device / chemotherapy / thromboprophylaxis order** — the tiles
  classify and stratify; the decisions stay with the clinician and the patient
  ([spec-v11](spec-v11.md) §5.3).
