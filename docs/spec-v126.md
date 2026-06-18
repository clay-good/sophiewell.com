# spec-v126.md — GI disease activity & severity: CDAI, UCEIS, SES-CD, HAPS, Balthazar CTSI, and modified Marshall (+6 tiles)

> Status: **PROPOSED (2026-06-17).** Feature spec of the [spec-v100](spec-v100.md)
> MDCalc Parity Completion program, **Wave 5** (GI / hepatology / nephrology /
> acid-base / urology). Adds **6** deterministic GI disease-activity and pancreatitis-
> severity instruments that fill confirmed gaps in the IBD and pancreatitis clusters.
> None duplicates a live tile.
>
> Catalog effect: **550 + 6 = 556 tiles.**
>
> Every prior spec (v4 through v125) remains in force. v126 adds no runtime network
> call and no AI; each tile obeys the [spec-v100](spec-v100.md) §2 doctrine
> (re-binding the [spec-v85](spec-v85.md) §2 doctrine) and the
> [spec-v100](spec-v100.md) §6 CI/CD contract, passes the [spec-v29](spec-v29.md) §3
> one-line test, ships its primary citation inline ([spec-v54](spec-v54.md)), and
> inherits the [spec-v59](spec-v59.md) output-safety contract.

## 1. Thesis

The catalog has individual IBD-adjacent tiles (the v93 `harvey-bradshaw`,
`truelove-witts`, `mayo-uc`) and pancreatitis severity (`glasgow-imrie`,
`ranson`), but the **clinical-trial-standard activity indices** and the standard
pancreatitis **imaging/organ-failure** scores are absent:

- **There is no Crohn's Disease Activity Index (CDAI)** — the 8-item weighted score
  that defines remission/response in essentially every Crohn's trial; `harvey-bradshaw`
  is its bedside simplification, not a replacement.
- **There is no UCEIS** — the validated ulcerative-colitis endoscopic severity index.
- **There is no SES-CD** — the Simple Endoscopic Score for Crohn's Disease.
- **There is no HAPS** — the Harmless Acute Pancreatitis Score that rules out a severe
  course at admission.
- **There is no Balthazar CT Severity Index** — the pancreatitis CT grade + necrosis
  score, distinct from the clinical `glasgow-imrie`/`ranson`.
- **There is no modified Marshall organ-failure score** — the Revised Atlanta organ-
  failure definition for pancreatitis severity.

Each is a published, deterministic instrument; v126 brings the GI activity and
pancreatitis-severity surface to parity.

## 2. What v126 adds (6 tiles)

### 2.1 `cdai-crohns` — Crohn's Disease Activity Index

- **Citation:** Best WR, Becktel JM, Singleton JW, Kern F Jr. Development of a Crohn's
  disease activity index. National Cooperative Crohn's Disease Study.
  *Gastroenterology.* 1976;70(3):439-444.
- **citationUrl:** https://doi.org/10.1016/S0016-5085(76)80163-1
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `gastroenterology`, `internal-medicine`.
- **Inputs:** the 8 weighted 7-day items — liquid stools, abdominal pain (0–3 daily),
  general well-being (0–4 daily), complications count, antidiarrheal use,
  abdominal mass, hematocrit deficit (sex-specific), and percent-below-standard body
  weight.
- **Output:** the **CDAI total (~0–600)** with the published bands (< 150 remission;
  150–220 mild; 221–450 moderate; > 450 severe), naming the dominant contributors.
  Class A (fixed 1976 weights). Cross-links `harvey-bradshaw`.

### 2.2 `uceis` — UC Endoscopic Index of Severity

- **Citation:** Travis SP, Schnell D, Krzeski P, et al. Developing an instrument to
  assess the endoscopic severity of ulcerative colitis: the Ulcerative Colitis
  Endoscopic Index of Severity (UCEIS). *Gut.* 2012;61(4):535-542.
- **citationUrl:** https://doi.org/10.1136/gutjnl-2011-300486
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `gastroenterology`, `internal-medicine`.
- **Inputs:** the three endoscopic descriptors at the worst-affected area — vascular
  pattern (0–2), bleeding (0–3), and erosions/ulcers (0–3).
- **Output:** the **UCEIS total (0–8)** with the published severity reading (higher =
  more severe; remission near 0–1). Class A (fixed descriptor scale). Cross-links
  `mayo-uc`.

### 2.3 `ses-cd` — Simple Endoscopic Score for Crohn's Disease

- **Citation:** Daperno M, D'Haens G, Van Assche G, et al. Development and validation
  of a new, simplified endoscopic activity score for Crohn's disease: the SES-CD.
  *Gastrointest Endosc.* 2004;60(4):505-512.
- **citationUrl:** https://doi.org/10.1016/S0016-5107(04)01878-4
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `gastroenterology`, `internal-medicine`.
- **Inputs:** for each of 5 ileocolonic segments, the four variables — ulcer size
  (0–3), ulcerated surface (0–3), affected surface (0–3), and stenosis (0–3).
- **Output:** the **SES-CD total (0–56)** with the published bands (0–2 remission;
  3–6 mild; 7–15 moderate; > 15 severe). Class A. Cross-links `cdai-crohns`.

### 2.4 `haps` — Harmless Acute Pancreatitis Score

- **Citation:** Lankisch PG, Weber-Dany B, Hebel K, et al. The harmless acute
  pancreatitis score: a clinical algorithm for rapid initial stratification of
  nonsevere disease. *Clin Gastroenterol Hepatol.* 2009;7(6):702-705.
- **citationUrl:** https://doi.org/10.1016/j.cgh.2009.02.020
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `gastroenterology`, `emergency-medicine`, `internal-medicine`.
- **Inputs:** three admission criteria — absence of rebound/guarding, normal
  hematocrit, and normal serum creatinine (sex-specific thresholds).
- **Output:** the **HAPS determination** — all three negative/normal predicts a
  **harmless (non-severe)** course; any positive does not rule severity in. Class A.
  Cross-links `glasgow-imrie` and `ranson`.

### 2.5 `ctsi-balthazar` — CT Severity Index (Balthazar)

- **Citation:** Balthazar EJ, Robinson DL, Megibow AJ, Ranson JH. Acute pancreatitis:
  value of CT in establishing prognosis. *Radiology.* 1990;174(2):331-336.
- **citationUrl:** https://doi.org/10.1148/radiology.174.2.2296641
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `gastroenterology`, `interventional-radiology`,
  `internal-medicine`.
- **Inputs:** the Balthazar CT grade (A–E → 0–4 points) and the percent pancreatic
  necrosis band (none/≤ 30%/30–50%/> 50% → 0/2/4/6 points).
- **Output:** the **CTSI total (0–10)** with the published severity bands (0–3 mild;
  4–6 moderate; 7–10 severe). Class A (fixed grade/necrosis weights). Cross-links
  `glasgow-imrie`.

### 2.6 `modified-marshall` — Modified Marshall organ-dysfunction score

- **Citation:** Banks PA, Bollen TL, Dervenis C, et al; Acute Pancreatitis
  Classification Working Group. Classification of acute pancreatitis — 2012: revision
  of the Atlanta classification and definitions by international consensus. *Gut.*
  2013;62(1):102-111.
- **citationUrl:** https://doi.org/10.1136/gutjnl-2012-302779
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `gastroenterology`, `critical-care`, `internal-medicine`.
- **Inputs:** the three organ systems — respiratory (PaO₂/FiO₂), renal (creatinine),
  and cardiovascular (systolic BP, fluid/pressor responsiveness) — each scored 0–4.
- **Output:** the **per-system Marshall score (0–4)**, flagging **organ failure when
  any system ≥ 2** (the Revised Atlanta definition that separates moderately-severe
  from severe acute pancreatitis). Class B (the Revised Atlanta definition is
  revisable → `docs/citation-staleness.md` row, on-publication cadence). Cross-links
  `ctsi-balthazar`.

## 3. Per-tile robustness

- **`modified-marshall` guards the PaO₂/FiO₂ ratio denominator** (FiO₂ > 0) and clamps
  each system to its 0–4 band; a blank system is reported as not-assessed rather than
  scored 0, mirroring the v93 `glasgow-imrie` blank-handling pattern.
- **`cdai-crohns` guards the hematocrit-deficit and weight-percent terms** (sex-
  specific standard, no division by a zero standard weight) and reports which items
  drove the total; the diary items sum bounded.
- **`uceis`, `ses-cd`, and `haps` are bounded ordinal/threshold logic** — UCEIS sums
  three descriptors (0–8), SES-CD sums four variables across five segments (0–56),
  HAPS is a three-criterion rule. Each flows through the [spec-v59](spec-v59.md) fuzz
  harness and names which criteria/segments were counted.
- All six render the [spec-v50](spec-v50.md) §3 clinical posture note and quote the
  source's interpretation; none authors a treatment recommendation in Sophie's voice
  ([spec-v11](spec-v11.md) §5.3). Each compute uses `lib/num.js` and joins the fuzz
  harness with zero non-finite leaks.

## 4. CI/CD & maintenance

Per the [spec-v100](spec-v100.md) §6 contract (re-binding [spec-v85](spec-v85.md) §6):

- **Maintenance classes (§6.3):** `cdai-crohns`, `uceis`, `ses-cd`, `haps`, and
  `ctsi-balthazar` are **Class A** (fixed derivation papers and weights) — **no**
  staleness row; their citations name the **journal and authors**
  (Gastroenterology/Best, Gut/Travis, Gastrointest Endosc/Daperno,
  Clin Gastroenterol Hepatol/Lankisch, Radiology/Balthazar), not a society acronym.
  **`modified-marshall` is Class B** (Revised Atlanta consensus definition) — it gets
  a `docs/citation-staleness.md` row naming the **2012 Revised Atlanta** edition in
  force, the `accessed` date, and an on-publication review cadence, monitored by the
  `scripts/check-citation-cadence.mjs` warn-job.
- **Build & gates (§6.1/§6.2):** `lib/gi-v126.js` (computes `cdaiCrohns`, `uceis`,
  `sesCd`, `haps`, `ctsiBalthazar`, `modifiedMarshall`) is added to
  `test/unit/fuzz-tools.test.js` `MODULES` (zero non-finite leaks, with the Marshall
  PaO₂/FiO₂ division explicitly fuzzed); the renderer is `views/group-v126.js` with
  its `RV126` export added to the `app.js` `RENDERERS` spread. Each `META` example is
  pinned by the chromium `example-correctness` sweep; the catalog count moves on all
  **13 catalog-truth surfaces**; a11y, `mobile-no-hscroll`, and 44px touch-target
  checks pass for `views/group-v126.js`.

## 5. Files touched

```
docs/spec-v126.md                        (this file)
app.js                                   (+6 UTILITIES rows, group G; import group-v126 renderers into RENDERERS)
lib/gi-v126.js                           (new module: cdaiCrohns, uceis, sesCd, haps, ctsiBalthazar, modifiedMarshall)
lib/meta.js                              (+6 META entries: inline citation + citationUrl + accessed; cross-links to harvey-bradshaw, mayo-uc, glasgow-imrie, ranson)
views/group-v126.js                      (new renderer module: 6 renderers; RV126 export; incl. SES-CD per-segment input)
docs/citation-staleness.md               (+ row: modified-marshall 2012 Revised Atlanta)
docs/clinical-citations.md               (+ rows for the six sources)
test/unit/cdai-crohns.test.js, uceis.test.js, ses-cd.test.js, haps.test.js, ctsi-balthazar.test.js, modified-marshall.test.js  (≥3 boundary worked examples each)
test/unit/fuzz-tools.test.js             (add lib/gi-v126.js to MODULES)
docs/audits/v12/cdai-crohns.md, uceis.md, ses-cd.md, haps.md, ctsi-balthazar.md, modified-marshall.md  (spec-v11 audit logs)
docs/scope-mdcalc-parity.md              (catalog count 550 -> 556)
CHANGELOG.md                             (Unreleased: v126 entry, +6)
README.md, package.json                  (catalog count 550 -> 556; spec-progression line -> v126)
```

## 6. Acceptance criteria

v126 is fully shipped when:

- The implementing session has **re-run the §6.2 collision check** and confirmed all
  six ids are absent from the live catalog (distinct from `harvey-bradshaw`,
  `truelove-witts`, `mayo-uc`, `glasgow-imrie`, `ranson`).
- All 6 tiles in §2 are live in Group G with a `META[id]` entry, an inline primary
  citation + `citationUrl` + `accessed`, ≥3 boundary worked examples each — including
  a **CDAI 150 remission/mild boundary flip**, a UCEIS 0–8 worked case, an SES-CD
  per-segment sum crossing the 6→7 mild/moderate boundary, a HAPS all-normal harmless
  case, a CTSI 6→7 moderate/severe flip, and a modified-Marshall any-system-≥2 organ-
  failure flag — a [spec-v11](spec-v11.md) audit log each, and a passing
  [spec-v29](spec-v29.md) §3 check.
- `modified-marshall` guards the PaO₂/FiO₂ denominator and treats blank systems as
  not-assessed; `cdai-crohns` guards its weight/hematocrit terms; partial inputs
  render a complete-the-fields fallback.
- Every compute function uses `lib/num.js` and is covered by the
  [spec-v59](spec-v59.md) fuzz harness with zero non-finite leaks.
- `modified-marshall` carries `accessed` + a `docs/citation-staleness.md` row; the
  five Class A citations name journals/authors, not societies.
- `UTILITIES.length` is **556** (or the then-current live count + 6 if specs land out
  of order) and all catalog-truth surfaces ([spec-v46](spec-v46.md)) agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass.
- The CHANGELOG records v126 with the +6 catalog delta.

## 7. Out of scope for v126

- **No endoscopy or CT image parsing** — UCEIS/SES-CD take the clinician's scored
  endoscopic descriptors and `ctsi-balthazar` the read CT grade/necrosis, not an
  image feed.
- **No auto-biologic, auto-ERCP, or auto-fluid order** — each tile reports the
  activity/severity score and the source's stated interpretation; the management
  decision stays with the clinician and local protocol ([spec-v11](spec-v11.md) §5.3).
- **No duplication of `harvey-bradshaw`/`mayo-uc`** — `cdai-crohns`/`uceis` are the
  trial-standard companions; cross-linked, all kept.
