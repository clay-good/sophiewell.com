# spec-v150.md — Post-Parity Coverage program: closing the last deterministic-calculator gaps after MDCalc parity (program-of-record)

> Status: **IN PROGRESS (v151 SHIPPED 2026-06-26, 676 → 680).** Program-of-record for the **Post-Parity
> Coverage** initiative — the successor to the [spec-v100](spec-v100.md)
> **MDCalc Parity Completion** program, which closes at v148 (679 tiles). This
> spec answers a single clinical question — *"have we included every calculator
> and tool a healthcare worker would actually use?"* — and reserves the
> implementation band **v151–v156** for the gaps that survive that audit.
>
> Catalog effect of the whole program: **679 → 704 (+25)** across six feature
> specs. v150 itself ships **no tile**; it is the umbrella + the gap audit, in
> the same role [spec-v100](spec-v100.md) plays for Waves 1–8.
>
> Every prior spec (v4 through v149) remains in force. No tile in this program
> adds a runtime network call or AI. Each obeys the [spec-v100](spec-v100.md) §2
> doctrine (re-binding [spec-v85](spec-v85.md) §2) — including the §2
> **classification-tile clarification** (a tile *consumes the clinician's
> findings and computes a class/score*, it does not display a reference table) —
> and the [spec-v100](spec-v100.md) §6 CI/CD contract. Each passes the
> [spec-v29](spec-v29.md) §3 one-line test, ships its primary citation inline
> ([spec-v54](spec-v54.md)), and inherits the [spec-v59](spec-v59.md)
> output-safety contract. Every coefficient, weight, and band is **re-fetched and
> cross-verified against ≥2 independent sources at implementation**
> ([spec-v97](spec-v97.md)); nothing in this document is implemented from recall.

## 1. The audit question

Across 652 live tiles (+27 planned in v145–v148 = 679) the catalog already covers
the deterministic-calculator surface of cardiology, pulmonology/critical care,
hepatology, nephrology, neurology/stroke, psychiatry, hematology/oncology,
obstetrics, pediatrics/neonatology, infectious disease, surgery/anesthesia,
orthopedics, rheumatology, toxicology, EMS, and clinical chemistry. A
specialty-by-specialty re-read against the working clinician's daily toolset
finds the catalog **substantially complete** — the remaining gaps are not in the
core acute-care scores (those are saturated) but in **under-represented
specialties** and a few **completions of otherwise-finished suites.**

The gaps cluster into six coherent groups, each a feature spec:

| Spec | Theme | Tiles | Why it is a real gap |
|---|---|---|---|
| v151 | Dermatology severity | PASI, EASI, SCORAD, DLQI (4) | Dermatology has **zero** scored-severity tiles today; these four are the field's daily quantitative instruments. |
| v152 | Nutrition & energy expenditure | Mifflin-St Jeor, Harris-Benedict, Katch-McArdle, Penn State, Ireton-Jones (5) | The catalog has nutrition *screening* (MUST/NRS-2002/NUTRIC) and an ICU target, but **no predictive resting/total energy-expenditure equations** — the input every dietitian starts from. |
| v153 | Urology & men's-health PROs | IPSS/AUA-SI, IIEF-5 (SHIM), OABSS (3) | Urology has the oncology math (PSA suite, Gleason, D'Amico, CAPRA) but **none of the symptom-score PROs** that drive BPH, ED, and OAB management. |
| v154 | Function, falls & palliative performance | Berg Balance, Timed Up & Go, Tinetti POMA, Palliative Performance Scale (4) | Falls/rehab has the *risk* scores (Morse/Hendrich) but **no performance-based mobility measures**; palliative has ECOG/Karnofsky but **not the PPS** that gates hospice eligibility. |
| v155 | Suite completions (cardio / heme-onc / GI / wound) | PRECISE-DAPT, MIPI, Forrest, Wagner DFU, University-of-Texas DFU (5) | Each plugs a named hole in a suite that is otherwise complete (DAPT bleeding side, mantle-cell lymphoma, UGI-bleed endoscopic stigmata, diabetic-foot grading). |
| v156 | Rheumatology PRO & obstetric classification | BASDAI, BASFI, ESSDAI, Robson Ten-Group (4) | v147/v148 ship the rheum *physician-derived* activity scores; these complete the **patient-reported** axis (axial SpA, Sjögren) plus the WHO cesarean-audit standard. |

**Total: 25 tiles, 679 → 704.**

## 2. What is deliberately EXCLUDED (and why)

A "world-class clinician" audit must also name what we are *not* adding, so the
"is it complete?" answer is honest:

- **Copyright-encumbered instruments.** MoCA, MMSE, the Asthma Control Test (ACT),
  the COPD Assessment Test (CAT), the FIM, and the SNOT-22 are owned/licensed
  instruments whose item text cannot be reproduced. We already ship the free
  equivalents where they exist (`mini-cog`, `mmrc-dyspnea`). **Not added.**
- **Proprietary closed-coefficient models.** FRAX (osteoporosis) and the STS
  Adult Cardiac risk calculator do not publish their coefficients; we already ship
  the open alternatives (`osteoporosis-prescreen` OST/ORAI; `euroscore2`).
  **Not added.**
- **Pure reference tables / lookups.** NYHA and CCS-angina functional classes,
  the Los Angeles esophagitis grade, and similar are descriptive lookups that fail
  the [spec-v29](spec-v29.md) §3 + [spec-v100](spec-v100.md) §2 "computes, not
  displays" test. **Not added.**
- **Imaging-parsing or genomics-dependent scores** with no published reproducible
  point table (e.g. SYNTAX, IPSS-M molecular MDS). **Not added** unless a future
  source makes them verbatim-sourceable.
- **Sourcing-risk tiles parked, not dropped.** Where a tile's published form is a
  **continuous nomogram** rather than a closed sum (notably **PRECISE-DAPT**), the
  feature spec flags it: if the per-variable point tables cannot be cross-verified
  to ≥2 independent sources at implementation, it is **deferred** under the same
  rule that parked `crib-ii`/`gail-bcrat` ([spec-v97](spec-v97.md)), not shipped
  from an approximation.

## 3. Program doctrine (binds every feature spec v151–v156)

1. **No new doctrine.** Each feature spec re-binds the existing contracts only:
   [spec-v100](spec-v100.md) §2 (compute-not-display + classification clarification),
   §6 (CI/CD + maintenance classes), [spec-v59](spec-v59.md) (output safety/fuzz),
   [spec-v50](spec-v50.md) §3 (clinical-posture note), [spec-v11](spec-v11.md) §5.3
   (Sophie never authors the order), [spec-v54](spec-v54.md) (inline citation).
2. **Per-spec module + renderer.** Each feature spec lands one `lib/<theme>-vNNN.js`
   compute module and one `views/group-vNNN.js` renderer module with an `RVNNN`
   export spread into `app.js` `RENDERERS`, exactly as v142–v145 did.
3. **Catalog-truth on every change.** The `UTILITIES.length` delta moves on **all
   13 catalog-truth surfaces** ([spec-v46](spec-v46.md)) in the same commit; use the
   **live `UTILITIES.length` + delta**, never a hard-coded number (the program's
   standing off-by-one warning). The catalog-truth gate enforces agreement.
4. **Collision check first.** Each implementing session re-runs the
   [spec-v85 §6.2](spec-v85.md) id-collision check before writing.
5. **Specialty vocabulary.** All specialty tags used (`dermatology`, `nutrition`,
   `urology`, `palliative`, `rehabilitation`, `physical-therapy`,
   `occupational-therapy`, `wound-care`, `vascular-surgery`, `rheumatology`,
   `obstetrics`) already exist in the `specialty-coverage.test.js` closed
   vocabulary — **no vocabulary edit is required.**

## 4. Feature specs

- [spec-v151](spec-v151.md) — Dermatology severity (PASI, EASI, SCORAD, DLQI).
- [spec-v152](spec-v152.md) — Nutrition & energy expenditure (Mifflin-St Jeor,
  Harris-Benedict, Katch-McArdle, Penn State, Ireton-Jones).
- [spec-v153](spec-v153.md) — Urology & men's-health PROs (IPSS/AUA-SI, IIEF-5,
  OABSS).
- [spec-v154](spec-v154.md) — Function, falls & palliative performance (Berg
  Balance, Timed Up & Go, Tinetti POMA, Palliative Performance Scale).
- [spec-v155](spec-v155.md) — Suite completions (PRECISE-DAPT, MIPI, Forrest,
  Wagner DFU, University-of-Texas DFU).
- [spec-v156](spec-v156.md) — Rheumatology PRO & obstetric classification (BASDAI,
  BASFI, ESSDAI, Robson Ten-Group).

## 5. Acceptance criteria (program level)

The Post-Parity Coverage program is complete when:

- All six feature specs (v151–v156) are shipped, each meeting its own §6
  acceptance criteria, **or** a tile is explicitly deferred in its feature spec
  with the [spec-v97](spec-v97.md) sourcing rationale recorded.
- `UTILITIES.length` has advanced by the sum of the shipped deltas (≤ 25), all 13
  catalog-truth surfaces agree, and `docs/scope-mdcalc-parity.md` (or a new
  `docs/scope-post-parity.md` ledger) records the running count.
- No tile in the program is implemented from recall: each carries an inline primary
  citation + `citationUrl` + `accessed`, cross-verified to ≥2 sources.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` pass at each
  feature-spec close; the CHANGELOG records each spec with its catalog delta.

## 6. Out of scope for the program

- **No re-implementation of any live tile** — every tile below was confirmed absent
  by an `app.js` `UTILITIES` grep at audit time (2026-06-23).
- **No new clinical doctrine, no new group, no new specialty tag.**
- **No copyrighted item text** (§2) and **no closed-coefficient model** (§2) —
  those gaps remain intentionally open.
