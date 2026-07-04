# spec-v248.md — Wound-care + infectious-disease scores: the Abbreviated Burn Severity Index, the SINBAD diabetic-foot-ulcer score, the ATLAS C. difficile score, and the INCREMENT-CPE mortality score (+4 tiles → 1074)

> Status: **SHIPPED (2026-07-04).** A wound-care / infectious-disease slice. Adds
> **4** well-established deterministic scores. **Each id was verified absent by a
> fixed-string scan of the extracted `app.js` id/name lists AND the MCP adapter
> set** (spec-v85 §6.2): the catalog carried `wagner-dfu`, `university-texas-dfu`,
> `lund-browder`, `burn-fluid`, and `atlas` (AF-recurrence ATLAS), but none of these
> four.
>
> Catalog effect: **live `UTILITIES.length` + 4** (1070 → 1074) — enforced by the
> catalog-truth gate ([spec-v46](spec-v46.md)).
>
> Every prior spec remains in force. v248 adds no runtime network call and no AI;
> each tile obeys the [spec-v100](spec-v100.md) §2 doctrine, passes the
> [spec-v29](spec-v29.md) §3 one-line test, ships its citation inline
> ([spec-v54](spec-v54.md)), inherits the [spec-v59](spec-v59.md) output-safety
> contract, renders the [spec-v50](spec-v50.md) §3 posture note, and honors
> [spec-v11](spec-v11.md) §5.3 (**no diagnosis and no treatment order**). **Every
> point value is re-fetched and cross-verified against ≥2 independent open sources**
> ([spec-v97](spec-v97.md)). All are Class A with no staleness rows.

## 2. What v248 adds (4 tiles)

All Group G; all Class A.

| id | name | inputs → output | citation |
| --- | --- | --- | --- |
| `absi-burn` | Abbreviated Burn Severity Index | sex + age + inhalation + FT + %TBSA | Tobiasen. Ann Emerg Med. 1982 |
| `sinbad-score` | SINBAD diabetic-foot-ulcer score | 6 features × 0/1 → 0-6 | Ince. Diabetes Care. 2008 |
| `atlas-cdi` | ATLAS score (C. difficile) | 5 items → 0-10; cure = 100 − 5.08·score | Miller. BMC Infect Dis. 2013 |
| `increment-cpe` | INCREMENT-CPE mortality score | 4 factors → 0-15; ≥ 8 high | Gutierrez-Gutierrez. Mayo Clin Proc. 2017 |

## 3. Source cross-verification (spec-v97)

- **ABSI:** sex (F 1/M 0), age band (0-20=1 … 81-100=5), inhalation (+1),
  full-thickness (+1), %TBSA band (1-10%=1 … 91-100%=10); threat-to-life bands.
  Reproduced from Tobiasen 1982 and PMC9302604.
- **SINBAD:** Site + Ischemia + Neuropathy + Bacterial infection + Area + Depth,
  each 0/1; 0-6, ≥ 3 worse. Reproduced from Ince 2008 and the IWGDF.
- **ATLAS:** Age + antibiotics + Leukocyte + Albumin + Serum-creatinine, 0-10;
  cure = 100 − 5.08 × score. Reproduced from Miller 2013 (open access) and FPnotebook.
- **INCREMENT-CPE:** septic shock 5, Pitt ≥ 6 →4, Charlson ≥ 2 →3, non-urinary/biliary
  source 3; 0-15, ≥ 8 high. Reproduced from Gutierrez-Gutierrez 2017 and PMC7223509.

## 4. Per-tile robustness

- **Every compute routes through `lib/num.js` and is finite-guarded.** Checkbox,
  select, and numeric inputs coerce to bounded values; the ABSI bins age and %TBSA
  deterministically; a blank field yields a bounded score or a "complete the fields"
  message, never a `NaN`.
- **Each tile reports its score, the band, and the driving inputs**
  ([spec-v59](spec-v59.md)).
- **All score or classify risk, none diagnose or order** ([spec-v11](spec-v11.md)
  §5.3); each renders the [spec-v50](spec-v50.md) §3 posture note.
- **All flow through the [spec-v59](spec-v59.md) fuzz harness with zero non-finite
  leaks.**

## 5. Files touched

```
docs/spec-v248.md                        (this file)
app.js                                   (+4 UTILITIES rows; import group-v248 RV248 into RENDERERS)
lib/woundid-v248.js                      (new: absiBurn, sinbadScore, atlasCdi, incrementCpe)
lib/meta.js                              (+4 META entries)
views/group-v248.js                      (new renderer module: 4 renderers)
test/unit/woundid-v248.test.js           (new: worked examples)
test/unit/fuzz-tools.test.js             (register woundid-v248.js)
index.html, README.md, package.json, docs/architecture.md, docs/scope-mdcalc-parity.md, docs/scope-post-parity.md   (catalog count 1070 → 1074)
```
