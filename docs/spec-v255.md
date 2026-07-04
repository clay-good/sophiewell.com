# spec-v255.md — Risk & severity scores: the Venous Clinical Severity Score, the PEN-FAST penicillin-allergy rule, the Harris Hip Score, and the Koivuranta PONV score (+4 tiles → 1102)

> Status: **SHIPPED (2026-07-04).** A cross-specialty risk-score slice. Adds **4**
> well-established deterministic scores. **Each id was verified absent by a fixed-
> string scan of the extracted `app.js` id/name lists AND the MCP adapter set**
> (spec-v85 §6.2): the catalog carried `apfel`, `wells-dvt-caprini`, and `quickdash`,
> but none of these four.
>
> Catalog effect: **live `UTILITIES.length` + 4** (1098 → 1102) — enforced by the
> catalog-truth gate ([spec-v46](spec-v46.md)).
>
> Every prior spec remains in force. v255 adds no runtime network call and no AI;
> each tile obeys the [spec-v100](spec-v100.md) §2 doctrine, passes the
> [spec-v29](spec-v29.md) §3 one-line test, ships its citation inline
> ([spec-v54](spec-v54.md)), inherits the [spec-v59](spec-v59.md) output-safety
> contract, renders the [spec-v50](spec-v50.md) §3 posture note, and honors
> [spec-v11](spec-v11.md) §5.3 (**no diagnosis and no treatment order**). **Every
> point value is re-fetched and cross-verified against ≥2 independent open sources**
> ([spec-v97](spec-v97.md)). All are Class A with no staleness rows.

## 2. What v255 adds (4 tiles)

All Group G; all Class A.

| id | name | inputs → output | citation |
| --- | --- | --- | --- |
| `vcss` | Venous Clinical Severity Score | 10 attributes × 0-3 → 0-30 | Vasquez. J Vasc Surg. 2010 |
| `pen-fast` | PEN-FAST rule | Five years + Anaphylaxis/SCAR + Treatment → 0-5 | Trubiano. JAMA Intern Med. 2020 |
| `harris-hip-score` | Harris Hip Score | pain + function + deformity + ROM → 0-100 | Harris. JBJS Am. 1969 |
| `koivuranta-ponv` | Koivuranta PONV score | 5 factors × 1 → 0-5 | Koivuranta. Anaesthesia. 1997 |

## 3. Source cross-verification (spec-v97)

- **VCSS:** 10 attributes each 0-3; 0-30. Reproduced from Vasquez 2010 and the
  American Venous Forum.
- **PEN-FAST:** Five years (+2), Anaphylaxis/angioedema or SCAR (+2), Treatment
  required (+1); 0-5, < 3 low risk. Reproduced from Trubiano 2020 (JAMA IM) and MDCalc.
- **Harris Hip:** pain (0-44), function (0-47), deformity (0/4), ROM (0-5); 0-100,
  < 70 poor … 90-100 excellent. Reproduced from Harris 1969 and APTA.
- **Koivuranta:** female, prior PONV, motion sickness, non-smoker, surgery > 60 min,
  each 1; 0-5, risk ~ 17/18/42/54/74/87%. Reproduced from Koivuranta 1997 and BJA.

## 4. Per-tile robustness

- **Every compute routes through `lib/num.js` and is finite-guarded.** Select,
  checkbox, and domain-score inputs coerce to bounded values; a blank form yields a 0
  score, never a `NaN`.
- **Each tile reports its score, the band, and the driving inputs**
  ([spec-v59](spec-v59.md)).
- **All score or grade risk, none diagnose or order** ([spec-v11](spec-v11.md) §5.3);
  each renders the [spec-v50](spec-v50.md) §3 posture note.
- **All flow through the [spec-v59](spec-v59.md) fuzz harness with zero non-finite
  leaks.**

## 5. Files touched

```
docs/spec-v255.md                        (this file)
app.js                                   (+4 UTILITIES rows; import group-v255 RV255 into RENDERERS)
lib/riskscores-v255.js                   (new: vcss, penFast, harrisHipScore, koivurantaPonv)
lib/meta.js                              (+4 META entries)
views/group-v255.js                      (new renderer module: 4 renderers)
test/unit/riskscores-v255.test.js        (new: worked examples)
test/unit/fuzz-tools.test.js             (register riskscores-v255.js)
index.html, README.md, package.json, docs/architecture.md, docs/scope-mdcalc-parity.md, docs/scope-post-parity.md   (catalog count 1098 → 1102)
```
