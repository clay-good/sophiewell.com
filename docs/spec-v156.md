# spec-v156.md — Rheumatology PRO & obstetric classification: BASDAI, BASFI, ESSDAI, and Robson Ten-Group (+4 tiles)

> Status: **PROPOSED (2026-06-23).** **Closing spec** of the
> [spec-v150](spec-v150.md) **Post-Parity Coverage** program. Adds **4**
> deterministic instruments that complete the rheumatology patient-reported axis
> and the obstetric cesarean-audit standard. None duplicates a live tile. With
> v156 the Post-Parity Coverage program is **complete: nominal 679 → 704
> (+25)** (or the actual shipped sum if PRECISE-DAPT deferred in v155).
>
> Catalog effect at v156 close: **live count + 4** (catalog-truth gate enforces).
>
> Every prior spec (v4 through v155) remains in force. v156 adds no runtime
> network call and no AI; each tile obeys the [spec-v100](spec-v100.md) §2
> doctrine (including the §2 classification-tile clarification), passes the
> [spec-v29](spec-v29.md) §3 one-line test, ships its primary citation inline
> ([spec-v54](spec-v54.md)), and inherits the [spec-v59](spec-v59.md)
> output-safety contract. Item scoring, domain weights, and bands are re-fetched
> and cross-verified to ≥2 sources at implementation ([spec-v97](spec-v97.md)).

## 1. Thesis

v147/v148 shipped the *physician-derived* rheumatology activity scores (CDAI, SDAI,
SLEDAI-2K, ASDAS, FFS). This spec completes the **patient-reported** axis for axial
spondyloarthritis (BASDAI activity, BASFI function) and adds the standard Sjögren
disease-activity index (ESSDAI) — the three rheumatology instruments still absent.
It also adds the **Robson Ten-Group Classification System**, the WHO-endorsed
cesarean-audit standard, completing the obstetrics surface alongside `meows`,
`bishop`, and the preeclampsia cluster.

## 2. What v156 adds (4 tiles)

### 2.1 `basdai` — Bath Ankylosing Spondylitis Disease Activity Index

- **Citation:** Garrett S, Jenkinson T, Kennedy LG, et al. A new approach to
  defining disease status in ankylosing spondylitis: the Bath Ankylosing
  Spondylitis Disease Activity Index. *J Rheumatol.* 1994;21(12):2286-2291.
- **citationUrl:** (PMID 7699630 — verify at implementation)
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `rheumatology`, `physical-medicine-rehabilitation`.
- **Inputs:** **6 questions** each on a **0–10** scale — fatigue (Q1), spinal pain
  (Q2), peripheral joint pain/swelling (Q3), enthesitis/tenderness (Q4), morning
  stiffness severity (Q5), morning stiffness duration (Q6).
- **Output:** **BASDAI 0–10** = `[Q1 + Q2 + Q3 + Q4 + (Q5 + Q6)/2] / 5`; reports the
  total with the **≥4 → active disease** treatment-consideration threshold. Class A.
  The Q5/Q6 averaging is the chief scoring nuance and is surfaced.

### 2.2 `basfi` — Bath Ankylosing Spondylitis Functional Index

- **Citation:** Calin A, Garrett S, Whitelock H, et al. A new approach to defining
  functional ability in ankylosing spondylitis: the development of the Bath
  Ankylosing Spondylitis Functional Index. *J Rheumatol.* 1994;21(12):2281-2285.
- **citationUrl:** (PMID 7699629 — verify at implementation)
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `rheumatology`, `physical-medicine-rehabilitation`, `physical-therapy`.
- **Inputs:** **10 items** each on a **0–10** scale (8 activities-of-daily-living
  tasks + 2 coping items).
- **Output:** **BASFI 0–10** = the **mean of the 10 items**; reports the functional
  index. Class A. Cross-linked to `basdai` and the v148 `asdas` (all axial-SpA).

### 2.3 `essdai` — EULAR Sjögren's Syndrome Disease Activity Index

- **Citation:** Seror R, Ravaud P, Bowman SJ, et al. EULAR Sjögren's syndrome
  disease activity index: development of a consensus systemic disease activity index
  for primary Sjögren's syndrome. *Ann Rheum Dis.* 2010;69(6):1103-1109.
- **citationUrl:** https://doi.org/10.1136/ard.2009.110619 (verify at
  implementation)
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `rheumatology`.
- **Inputs:** the **12 domains** (constitutional, lymphadenopathy, glandular,
  articular, cutaneous, pulmonary, renal, muscular, peripheral-nervous-system,
  central-nervous-system, hematological, biological), each at its defined activity
  level (none/low/moderate/high) with the published **domain weights**.
- **Output:** the **weighted ESSDAI total** with the activity strata (low <5,
  moderate 5–13, high ≥14). Class A. The per-domain weight × activity-level table is
  **re-fetched and cross-verified to ≥2 sources** at implementation (the weights are
  the correctness-critical content); every domain combination resolves to a defined
  contribution.

### 2.4 `robson` — Robson Ten-Group Classification System (cesarean audit)

- **Citation:** Robson MS. Classification of caesarean sections. *Fetal Matern Med
  Rev.* 2001;12(1):23-39. (WHO-endorsed: WHO statement on caesarean section rates,
  2015.)
- **citationUrl:** https://doi.org/10.1017/S0965539501000122 (verify at
  implementation)
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `obstetrics`, `maternal-fetal-medicine`.
- **Inputs:** parity (nullipara/multipara), previous cesarean, onset of labor
  (spontaneous/induced/pre-labor CS), fetal lie & presentation (cephalic/breech/
  transverse-oblique), number of fetuses (single/multiple), and gestational age
  (term/preterm).
- **Output:** the **group 1–10** per the source's mutually-exclusive decision logic.
  Class A — a deterministic input→group mapping ([spec-v100](spec-v100.md) §2
  classification clarification); every valid combination resolves to exactly one of
  the ten groups. An audit-classification tile (no risk prediction).

## 3. Per-tile robustness

- **`basdai`, `basfi`** are bounded means/weighted-means over 0–10 inputs; every
  input is finite-checked. **BASDAI's `(Q5+Q6)/2` substitution** is the chief
  scoring risk and is unit-tested against a worked example so the morning-stiffness
  pair is not double-counted or summed flat.
- **`essdai`** is a bounded weighted sum over per-domain activity selects; the
  weight table is a fixed constant exercised on every domain, and an unselected
  domain contributes 0 (not `NaN`). The activity strata boundaries (4/5, 13/14) are
  asserted.
- **`robson`** is deterministic decision logic over categorical inputs; a unit test
  asserts **mutual exclusivity** (no input combination maps to two groups) and
  **totality** (every valid combination maps to exactly one group); an incomplete
  combination renders a surfaced `valid:false` complete-the-fields fallback.
- All four render the [spec-v50](spec-v50.md) §3 posture note (patient-reported or
  audit classification, not a treatment order) and defer the decision to the
  clinician ([spec-v11](spec-v11.md) §5.3).

## 4. CI/CD & maintenance

Per the [spec-v100](spec-v100.md) §6 contract:

- **Maintenance class (§6.3):** **BASDAI, BASFI, Robson** are **Class A** (cited by
  journal/authors, no issuing-society acronym → no `ISSUER_PATTERN` trip).
  **`essdai`** is cited to **EULAR** — that society acronym **trips
  `ISSUER_PATTERN`** and forces a **documentation-only `docs/citation-staleness.md`
  row** (the index is a fixed 2010 consensus, not a drifting standard — same
  treatment as the v138/v139 ACOG/ESHRE rows).
- **Build & gates (§6.1/§6.2):** the four computes live in the new
  `lib/rheum-ob-v156.js` module (`basdai`, `basfi`, `essdai`, `robson`), added to
  `fuzz-tools.test.js` `MODULES` (`robson` asserted mutually-exclusive/total).
  Renderers live in the new `views/group-v156.js`; its `RV156` export is spread into
  `app.js` `RENDERERS`. The catalog count moves on all **13 catalog-truth
  surfaces**; a11y, `mobile-no-hscroll`, `mobile-touch-targets`, and the chromium
  `example-correctness` sweep pass. Watch the META interpretation `band[0].text`
  **200-char cap** (the ESSDAI domain-weight description is long — abbreviate as the
  v143 mfi-11/carg fix did).

## 5. Files touched

```
docs/spec-v156.md                        (this file)
app.js                                   (+4 UTILITIES rows, group G; import group-v156 RV156 into RENDERERS)
lib/rheum-ob-v156.js                     (new module: basdai, basfi, essdai, robson)
lib/meta.js                              (+4 META entries: inline citation + citationUrl + accessed; cross-links to asdas, das28, meows, bishop)
views/group-v156.js                      (new renderer module: 4 renderers)
docs/clinical-citations.md               (+ rows for the four sources)
docs/citation-staleness.md               (+ documentation-only row for essdai — EULAR issuer)
test/unit/basdai.test.js, basfi.test.js, essdai.test.js, robson.test.js   (≥3 boundary worked examples each)
test/unit/fuzz-tools.test.js             (add lib/rheum-ob-v156.js to MODULES)
docs/audits/v12/basdai.md, basfi.md, essdai.md, robson.md                 (spec-v11 audit logs)
docs/scope-post-parity.md                (catalog ledger; CLOSE the v150 program running count)
CHANGELOG.md                             (Unreleased: v156 entry, +4; note Post-Parity Coverage program complete)
README.md, package.json                  (catalog count + spec-progression line -> v156)
```

## 6. Acceptance criteria

v156 is fully shipped when:

- The implementing session has re-run the [spec-v85 §6.2](spec-v85.md) collision
  check and confirmed all four ids are absent.
- All 4 tiles are live with a `META[id]` entry, inline primary citation +
  `citationUrl` + `accessed`, ≥3 boundary worked examples each (including a
  **BASDAI worked total exercising the `(Q5+Q6)/2` term**, a **BASFI 10-item mean**,
  an **ESSDAI low/moderate 4/5 boundary across multiple weighted domains**, and a
  **Robson nullipara-induced-cephalic-term → Group 2a** worked case), a
  [spec-v11](spec-v11.md) audit log, and a passing [spec-v29](spec-v29.md) §3 check.
- `essdai` carries its documentation-only `docs/citation-staleness.md` row; `robson`
  is asserted mutually-exclusive and total; blank inputs render a
  complete-the-fields fallback.
- Every compute uses `lib/num.js` where numeric and is covered by the
  [spec-v59](spec-v59.md) fuzz harness with zero non-finite leaks.
- `UTILITIES.length` is live count + 4, all catalog-truth surfaces agree, and
  `docs/scope-post-parity.md` records the **Post-Parity Coverage program complete**.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass; the
  CHANGELOG records v156 with the +4 delta and the program close.

## 7. Out of scope for v156

- **No ASAS/SpA classification criteria** — the v147/v148 classification suite plus
  these activity/function PROs cover axial SpA; the full ASAS classification flow is
  a future spec if requested.
- **No copyrighted instrument** — ESSPRI (patient-reported Sjögren symptom index)
  with licensed item text is excluded; ESSDAI (systemic activity) is the
  free physician-scored index ([spec-v150](spec-v150.md) §2).
- **No automatic management** — each tile reports the score/group and the source's
  interpretation; treatment escalation and audit conclusions stay with the clinician.
