# spec-v157.md — Subspecialty Depth program: echocardiography, neuro/spine disability, rheumatology PRO, and endocrine/metabolic math (program-of-record)

> Status: **SHIPPED (2026-06-26).** (was PROPOSED 2026-06-23.) Program-of-record for the **Subspecialty
> Depth** initiative — the *second pass* after the [spec-v150](spec-v150.md)
> **Post-Parity Coverage** program (v151–v156). v150 closed the
> under-represented-*specialty* gaps; this program closes the deeper
> *subspecialty quantification* gaps a world-class clinician finds on a second,
> finer read — most notably that **echocardiography**, performed thousands of
> times a day, has only one quantification tile in the catalog
> (`aortic-valve-area`). It reserves the band **v158–v161** for those gaps.
>
> Catalog effect of the whole program: **+18** across four feature specs (nominal
> 704 after v156 → 722). v157 itself ships **no tile**; it is the umbrella + the
> second-pass audit, in the same role [spec-v100](spec-v100.md) and
> [spec-v150](spec-v150.md) play for their programs.
>
> Every prior spec (v4 through v156) remains in force. No tile adds a runtime
> network call or AI. Each obeys the [spec-v100](spec-v100.md) §2 doctrine
> (including the §2 classification-tile clarification), the §6 CI/CD contract,
> [spec-v59](spec-v59.md) output safety, [spec-v50](spec-v50.md) §3 posture, and
> [spec-v11](spec-v11.md) §5.3 (Sophie never authors the order). Each ships its
> primary citation inline ([spec-v54](spec-v54.md)) and passes the
> [spec-v29](spec-v29.md) §3 one-line test. **Every coefficient, formula, and band
> is re-fetched and cross-verified against ≥2 independent sources at
> implementation** ([spec-v97](spec-v97.md)); nothing here is implemented from
> recall.

## 1. The second-pass audit question

After v150–v156 the catalog is complete across whole *specialties*. A finer read
asks: within each specialty, is the **routine quantification math** present? Four
gaps survive that test, each a coherent feature spec:

| Spec | Theme | Tiles | Why it is a real gap |
|---|---|---|---|
| v158 | Echocardiography quantification | LV mass index + geometry, LA volume index, Teichholz LVEF/FS, RVSP/PASP, E/e′ (5) | Echo has **one** quantification tile today (`aortic-valve-area`); the daily chamber/valve/filling-pressure math is absent. |
| v159 | Neuro & spine disability classification | EDSS, ASIA Impairment Scale, mJOA, Nurick (4) | MS, spinal-cord-injury, and cervical-myelopathy clinics use these standard ordinal scales; **none is in the catalog**. |
| v160 | Rheumatology activity & classification completion | RAPID3, DAPSA, SLICC 2012 SLE, 2019 EULAR/ACR SLE (4) | v147/v148/v156 ship physician/PRO activity scores; the **routine US RA PRO (RAPID3)**, the **PsA activity index (DAPSA)**, and the **two SLE classification criteria** are still absent. |
| v161 | Endocrine, metabolic & nutrition-support math | Aldosterone-Renin Ratio, calcium-phosphate product, free thyroxine index, nitrogen balance (4) | The endocrine/metabolic *screening arithmetic* (primary-aldosteronism screen, CKD-MBD product, thyroid index, N-balance) is absent despite a deep nephrology/endocrine surface. |

**Total: 18 tiles.**

## 2. What is deliberately EXCLUDED (carried forward + new)

- **Copyright / closed-coefficient** (from [spec-v150](spec-v150.md) §2): MoCA,
  MMSE, ACT, CAT, FIM, SNOT-22, FRAX, STS, MDS-UPDRS, HIT-6, St George's
  (SGRQ) — **not added.**
- **Paywalled, with a free substitute already shipped:** the **Grobman MFMU VBAC
  calculator** is paywalled and was excluded in [spec-v100](spec-v100.md) §8;
  `flamm-vbac` is the free substitute and stands. **Not added.**
- **Already covered — cross-link, don't duplicate:** the **dimensionless index**
  and **aortic valve area** are already computed inside `aortic-valve-area`
  (cardio-v90); v158 cross-links rather than re-implements. ECG LVH voltage is
  `lvh-criteria` (distinct from the echo Devereux LV-mass tile v158 adds).
- **Modality-bound with no reproducible point table:** Simpson biplane LVEF
  (planimetry, not a closed formula — Teichholz is the deterministic-from-dimensions
  alternative v158 ships, with the standard caveat), strain/speckle-tracking,
  IPSS-M, SYNTAX. **Not added.**

## 3. Wave-3 backlog (real, deterministic, free — diminishing returns; ship on request)

Named here so the "is it complete?" answer hides nothing. Each is implementable but
lower daily-frequency than v158–v161; left unscheduled pending a request:

- **Geriatric-oncology screening:** `g8` (G8 screening tool) and `crash` (Chemotherapy
  Risk Assessment Scale for High-age) — complement live `carg-toxicity`/`ves-13`.
- **Pulmonary-function lab:** `dlco-correction` (Hgb/alveolar-volume-corrected DLCO)
  and `bronchodilator-response` (ATS/ERS reversibility) — complement live
  `predicted-spirometry`/`gold-spirometry`.
- **Palliative/derm PROs:** `esas-r` (Edmonton Symptom Assessment), `uas7`
  (urticaria activity score) — coherent if a future derm/palliative wave is opened.
- **Toxicology:** `poisoning-severity-score` (EAPCCT PSS).

## 4. Program doctrine (binds v158–v161)

Identical to [spec-v150](spec-v150.md) §3: per-spec `lib/<theme>-vNNN.js` compute
module + `views/group-vNNN.js` renderer with an `RVNNN` export; catalog-truth delta
on all **13 surfaces** using **live `UTILITIES.length` + delta** (never hard-coded);
[spec-v85 §6.2](spec-v85.md) collision check first; all specialty tags
(`echocardiography`, `cardiology`, `neurology`, `neurosurgery`, `rheumatology`,
`endocrinology`, `nephrology`, `nutrition`, `physical-medicine-rehabilitation`)
already exist in the `specialty-coverage.test.js` closed vocabulary — **no vocabulary
edit required.**

## 5. Feature specs

- [spec-v158](spec-v158.md) — Echocardiography quantification.
- [spec-v159](spec-v159.md) — Neuro & spine disability classification.
- [spec-v160](spec-v160.md) — Rheumatology activity & classification completion.
- [spec-v161](spec-v161.md) — Endocrine, metabolic & nutrition-support math.

## 6. Acceptance criteria (program level)

- All four feature specs (v158–v161) ship, each meeting its own §6, or a tile is
  explicitly deferred with the [spec-v97](spec-v97.md) sourcing rationale recorded.
- `UTILITIES.length` advances by the sum of shipped deltas (≤18); all 13
  catalog-truth surfaces agree; `docs/scope-post-parity.md` (or a new
  `docs/scope-subspecialty-depth.md`) records the running count.
- No tile implemented from recall; each carries an inline primary citation +
  `citationUrl` + `accessed`, cross-verified to ≥2 sources.
- `npm run lint`, `npm run test`, `npm run sbom`, `npm run build` pass at each
  feature-spec close; the CHANGELOG records each spec with its delta.

## 7. Out of scope for the program

- **No re-implementation of any live tile** — every tile in v158–v161 was confirmed
  absent by an `app.js` `UTILITIES` grep at audit time (2026-06-23).
- **No new clinical doctrine, no new group, no new specialty tag.**
- **No copyrighted item text, no closed-coefficient model, no paywalled calculator**
  (§2) — those gaps remain intentionally open.
