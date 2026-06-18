# spec-v148.md — Rheumatology (vasculitis/SpA), palliative & pharmacy: ASDAS, FFS-2011, 2022 ACR/EULAR GCA, PPI, PaP, opioid conversion, Naranjo, and valproate correction (+8 tiles)

> Status: **PROPOSED (2026-06-17).** Feature spec of the
> [spec-v100](spec-v100.md) **MDCalc Parity Completion** program, **Wave 8**
> (Surgery / anesthesia / ortho / rheum / geriatrics / pharmacy), and the
> **CLOSING spec of the entire spec-v100 program.** Adds **8** deterministic
> rheumatology, palliative, and pharmacy instruments that fill confirmed gaps.
> None duplicates a live tile. With v148 the [spec-v100](spec-v100.md) program is
> **complete: 432 → 679 (+247).**
>
> Catalog effect at v148 close: **671 + 8 = 679 tiles** — the program end state
> (or live count + 8 if specs land out of order; the catalog-truth gate enforces
> agreement).
>
> Every prior spec (v4 through v147) remains in force. v148 adds no runtime
> network call and no AI; each tile obeys the [spec-v100](spec-v100.md) §2
> doctrine (re-binding [spec-v85](spec-v85.md) §2) — including the §2
> classification-tile clarification — and the [spec-v100](spec-v100.md) §6 CI/CD
> contract. Each passes the [spec-v29](spec-v29.md) §3 one-line test, ships its
> primary citation inline ([spec-v54](spec-v54.md)), and inherits the
> [spec-v59](spec-v59.md) output-safety contract.

## 1. Thesis

v148 finishes the rheumatology surface (the spondyloarthritis activity score, the
vasculitis prognosis score, and the giant-cell-arteritis classification), opens the
palliative-prognosis cluster (PPI and PaP — the free substitutes for the licensed
Palliative Performance Scale), and adds two pharmacy tiles. The opioid converter is
distinct from the surveillance-only `opioid-mme` (which sums daily MME for risk
flagging) — it performs an actual equianalgesic rotation with a cross-tolerance
reduction. The valproate correction parallels the existing `corrected-phenytoin`
albumin correction, exactly as the [spec-v100](spec-v100.md) §7 backlog notes.

- **ASDAS** — the Ankylosing Spondylitis Disease Activity Score, a weighted
  composite of four patient NRS items + CRP (or ESR), with the published cutoffs.
- **FFS-2011** — the revised Five-Factor Score for systemic necrotizing
  vasculitis 5-year mortality (4 factors).
- **2022 ACR/EULAR GCA** — the giant-cell-arteritis classification: age ≥50 entry +
  weighted clinical/lab/imaging/biopsy items, **≥ 6 = classified GCA**.
- **PPI** — the Palliative Prognostic Index, survival band from PPS, oral intake,
  edema, dyspnea at rest, and delirium.
- **PaP** — the Palliative Prognostic Score, three 30-day-survival risk groups from
  dyspnea, anorexia, Karnofsky, clinical prediction of survival, WBC, and
  lymphocyte %.
- **opioid-conversion** — an equianalgesic/rotation converter (PO↔IV + drug switch
  with cross-tolerance reduction + transdermal sizing), distinct from `opioid-mme`.
- **Naranjo** — the adverse-drug-reaction probability scale (−4 to +13) → doubtful/
  possible/probable/definite.
- **valproate-correction** — albumin-corrected total valproate (parallels
  `corrected-phenytoin`).

## 2. What v148 adds (8 tiles)

### 2.1 `asdas` — Ankylosing Spondylitis Disease Activity Score

- **Citation:** Lukas C, Landewé R, Sieper J, et al. Development of an ASAS-endorsed
  disease activity score (ASDAS) in patients with ankylosing spondylitis. *Ann Rheum
  Dis.* 2009;68(1):18-24.
- **citationUrl:** https://doi.org/10.1136/ard.2008.094870
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `rheumatology`, `internal-medicine`.
- **Inputs:** four 0–10 NRS items — back pain, duration of morning stiffness,
  patient global, peripheral pain/swelling — plus CRP (mg/L; ASDAS-CRP preferred) or
  ESR (ASDAS-ESR).
- **Output:** the **ASDAS value** via the published weighted formula with the
  cutoffs (inactive <1.3, low <2.1, high ≤3.5, very high >3.5). Class A. The CRP and
  ESR variants are both computed when inputs allow.

### 2.2 `ffs-2011` — Five-Factor Score (2011 revision)

- **Citation:** Guillevin L, Pagnoux C, Seror R, et al. The Five-Factor Score
  revisited: assessment of prognoses of systemic necrotizing vasculitides based on
  the French Vasculitis Study Group (FVSG) cohort. *Medicine (Baltimore).*
  2011;90(1):19-27.
- **citationUrl:** https://doi.org/10.1097/MD.0b013e318205a4c6
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `rheumatology`, `internal-medicine`.
- **Inputs:** the 4 prognostic factors (each +1) — age >65 years, cardiac
  insufficiency, gastrointestinal involvement, renal insufficiency
  (stabilized creatinine ≥150 µmol/L); plus the favorable factor (absence of ENT
  manifestations, +1, applicable to GPA/EGPA).
- **Output:** the **FFS total (0–...)** with the published 5-year-mortality bands
  (0 ≈ 9%, 1 ≈ 21%, ≥2 ≈ 40%). Class A.

### 2.3 `gca-acr-eular-2022` — 2022 ACR/EULAR Giant Cell Arteritis Classification

- **Citation:** Ponte C, Grayson PC, Robson JC, et al. 2022 American College of
  Rheumatology/EULAR classification criteria for giant cell arteritis. *Ann Rheum
  Dis.* 2022;81(12):1647-1653.
- **citationUrl:** https://doi.org/10.1136/ard-2022-223480
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `rheumatology`, `internal-medicine`.
- **Inputs:** the entry criterion (age ≥50 at diagnosis), then the weighted clinical
  items (morning stiffness, sudden visual loss, jaw/tongue claudication, new
  temporal headache, scalp tenderness, abnormal temporal artery on exam), lab (max
  ESR ≥50 / CRP ≥10), and imaging/biopsy items (halo on US, positive biopsy/giant
  cells, bilateral axillary involvement, FDG-PET aorta uptake).
- **Output:** the **total** with the published threshold **≥ 6 = classified GCA**
  (after the age ≥50 entry), naming the items counted. Class B (ACR/EULAR
  classification criteria — `docs/citation-staleness.md` row).

### 2.4 `palliative-prognostic-index` — Palliative Prognostic Index (PPI)

- **Citation:** Morita T, Tsunoda J, Inoue S, Chihara S. The Palliative Prognostic
  Index: a scoring system for survival prediction of terminally ill cancer patients.
  *Support Care Cancer.* 1999;7(3):128-133.
- **citationUrl:** https://doi.org/10.1007/s005200050242
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `palliative-care`, `oncology`, `nursing-rehab`.
- **Inputs:** Palliative Performance Scale band, oral intake (normal/reduced/
  mouthfuls or less), edema, dyspnea at rest, and delirium (each weighted).
- **Output:** the **PPI total** with the published survival bands (e.g., >6 →
  survival likely <3 weeks; >4 → likely <6 weeks). Class A. Cross-links
  `ecog-karnofsky` and `palliative-prognostic-score`.

### 2.5 `palliative-prognostic-score` — Palliative Prognostic Score (PaP)

- **Citation:** Maltoni M, Nanni O, Pirovano M, et al. Successful validation of the
  palliative prognostic score in terminally ill cancer patients. *J Pain Symptom
  Manage.* 1999;17(4):240-247.
- **citationUrl:** https://doi.org/10.1016/S0885-3924(98)00146-8
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `palliative-care`, `oncology`, `internal-medicine`.
- **Inputs:** dyspnea, anorexia, Karnofsky Performance Status, the clinician's
  clinical prediction of survival (weeks), total WBC, and lymphocyte percentage
  (each weighted).
- **Output:** the **PaP total (0–17.5)** mapped to the published **30-day-survival
  risk groups A (>70%) / B (30–70%) / C (<30%)**, naming the contributors. Class A.
  Cross-links `palliative-prognostic-index` and `ecog-karnofsky`.

### 2.6 `opioid-conversion` — Opioid Equianalgesic / Rotation Converter

- **Citation:** McPherson ML. *Demystifying Opioid Conversion Calculations: A Guide
  for Effective Dosing.* 2nd ed. Bethesda, MD: ASHP; 2018 (equianalgesic constants);
  the standard equianalgesic table.
- **citationUrl:** https://www.ashp.org/ (verify edition/page at implementation)
- **Group:** Medication & Infusion (`F`).
- **Specialties:** `palliative-care`, `pain-management`, `pharmacy`.
- **Inputs:** source opioid + route + total daily dose, target opioid + route, and
  the cross-tolerance reduction (default 25–50%).
- **Output:** the **equianalgesic target daily dose** (PO↔IV and drug switch) with
  the cross-tolerance-reduced recommended starting dose, plus transdermal-fentanyl
  sizing where applicable. The renderer shows the worked conversion AND the
  high-stakes second-check caveat: *confirm against your institutional protocol and
  an independent second check* ([spec-v11](spec-v11.md) §5.3,
  [spec-v100](spec-v100.md) §2 clause 5). Class A (fixed equianalgesic constants).
  **Methadone and buprenorphine are deliberately excluded** ([spec-v100](spec-v100.md)
  §8 — non-deterministic ratios). Near-neighbor: `opioid-mme` (surveillance MME
  sum) — distinct, cross-linked, both kept.

### 2.7 `naranjo` — Naranjo ADR Probability Scale

- **Citation:** Naranjo CA, Busto U, Sellers EM, et al. A method for estimating the
  probability of adverse drug reactions. *Clin Pharmacol Ther.* 1981;30(2):239-245.
- **citationUrl:** https://doi.org/10.1038/clpt.1981.154
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `pharmacy`, `internal-medicine`.
- **Inputs:** the 10 questions (each yes/no/unknown with its published weight) —
  prior reports, temporal sequence, dechallenge, rechallenge, alternative causes,
  placebo, toxic concentration, dose-response, prior similar reaction, objective
  confirmation.
- **Output:** the **total (−4 to +13)** mapped to the published bands — **≤0
  doubtful, 1–4 possible, 5–8 probable, ≥9 definite** — naming the answers. Class A.

### 2.8 `valproate-correction` — Valproate Albumin Correction

- **Citation:** Hermida J, Tutor JC. A theoretical method for normalizing total
  serum valproic acid concentration in hypoalbuminemic patients. *Ther Drug Monit.*
  2005;27(5):619-625.
- **citationUrl:** https://doi.org/10.1097/01.ftd.0000170028.91426.99
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `pharmacy`, `internal-medicine`, `pain-medicine`.
- **Inputs:** measured total valproate (µg/mL) and serum albumin (g/dL).
- **Output:** the **albumin-corrected total valproate** via the published
  normalization equation, with the therapeutic-range framing. Class A. Near-neighbor:
  `corrected-phenytoin` (the Sheiner-Tozer albumin parallel) — cross-linked, both
  kept.

## 3. Per-tile robustness

- **`asdas` guards its weighted formula** — the CRP/ESR variant uses the published
  coefficients (re-fetched verbatim, [spec-v100](spec-v100.md) §5); a non-finite or
  blank CRP/ESR falls back to the other variant or a surfaced `valid:false`, never a
  value from `NaN`. Cutoffs are unit-tested at each boundary.
- **`ffs-2011`, `gca-acr-eular-2022`, and `naranjo` are bounded sums** mapped to
  published bands; `gca-acr-eular-2022` enforces the age ≥50 entry criterion first
  (without it the criteria do not apply). Each names which items were counted.
- **`palliative-prognostic-index` and `palliative-prognostic-score` are weighted
  sums** mapped to published survival bands; band boundaries are unit-tested.
- **`opioid-conversion` uses an equianalgesic table + cross-tolerance reduction.**
  Per the [spec-v11](spec-v11.md) §5.3 second-check note, the renderer shows the
  worked conversion AND the *confirm-against-protocol/independent-second-check*
  caveat. Methadone and buprenorphine are excluded ([spec-v100](spec-v100.md) §8).
  Division by the equianalgesic ratio is domain-guarded (ratios are fixed positive
  constants; a zero/blank dose returns a surfaced fallback).
- **`valproate-correction` guards its division** — albumin in the denominator is
  finite- and positive-checked; a non-finite/zero albumin returns a surfaced
  `valid:false` fallback rather than `Infinity`/`NaN`.
- All eight render the [spec-v50](spec-v50.md) §3 clinical posture note and quote
  the source's interpretation; none authors a dosing/treatment order in Sophie's
  voice ([spec-v11](spec-v11.md) §5.3); all flow through the [spec-v59](spec-v59.md)
  fuzz harness with zero non-finite leaks.

## 4. CI/CD & maintenance

Per the [spec-v100](spec-v100.md) §6 contract (re-binding
[spec-v85](spec-v85.md) §6):

- **Maintenance classes (§6.3):** `asdas`, `ffs-2011`,
  `palliative-prognostic-index`, `palliative-prognostic-score`, `opioid-conversion`,
  `naranjo`, and `valproate-correction` are **Class A** — fixed formulas/constants
  cited by journal + authors. **`gca-acr-eular-2022` is Class B** — it is ACR/EULAR
  (society) classification criteria; its citation names **ACR/EULAR**, which trips
  the `ISSUER_PATTERN` ([spec-v92](spec-v92.md)/[spec-v94](spec-v94.md) lesson), so
  it gets a `docs/citation-staleness.md` row naming the 2022 edition, the `accessed`
  date, and an on-publication review cadence.
- **Build & gates (§6.1/§6.2):** the eight computes live in the new
  `lib/rheum-v148.js` module (`asdas`, `ffs2011`, `gcaAcrEular2022`,
  `palliativePrognosticIndex`, `palliativePrognosticScore`, `opioidConversion`,
  `naranjo`, `valproateCorrection`), added to the `test/unit/fuzz-tools.test.js`
  `MODULES` list — `asdas`, `opioid-conversion`, and `valproate-correction`
  explicitly fuzzed for the division/overflow paths (zero non-finite leaks).
  Renderers live in the new `views/group-v148.js` module; its `RV148` export is
  spread into the `app.js` `RENDERERS` map. `opioid-conversion`'s textarea/select
  hints carry a real `<label for>`. The catalog count moves on all **13
  catalog-truth surfaces** in the same change; a11y, `mobile-no-hscroll`,
  `mobile-touch-targets`, and the chromium `example-correctness` sweep pass for
  `views/group-v148.js`.
- **Program-close note:** with v148 the [spec-v100](spec-v100.md) program is
  complete at **679** tiles. The §6.3 cadence job now monitors the **full v100
  program Class B set** (the cha2ds2-va/chads-65/score2/score2-op/hfa-peff,
  wifi/rutherford-fontaine, aspects, modified-marshall, metabolic-syndrome,
  rotterdam-pcos, roma-ovarian, afi/iom-gwg, weber-ankle, fleischner-2017,
  ahi-odi-severity, lithium-extrip, denver-bcvi/aast-organ-injury, szpilman-drowning,
  the v147 acr-eular-2010-ra/gout-acr-eular-2015/caspar, and this spec's
  gca-acr-eular-2022 rows) alongside the existing spec-v85 program rows.
  `scope-mdcalc-parity.md` records the spec-v100 program **complete: 432 → 679
  (+247)**.

## 5. Files touched

```
docs/spec-v148.md                        (this file)
app.js                                   (+8 UTILITIES rows, groups G/F/E; import group-v148 RV148 into RENDERERS)
lib/rheum-v148.js                        (new module: asdas, ffs2011, gcaAcrEular2022, palliativePrognosticIndex, palliativePrognosticScore, opioidConversion, naranjo, valproateCorrection)
lib/meta.js                              (+8 META entries: inline citation + citationUrl + accessed; cross-links to das28, opioid-mme, corrected-phenytoin, ecog-karnofsky)
views/group-v148.js                      (new renderer module: 8 renderers)
docs/citation-staleness.md               (+ row: gca-acr-eular-2022)
docs/clinical-citations.md               (+ rows for the eight sources)
test/unit/asdas.test.js, ffs-2011.test.js, gca-acr-eular-2022.test.js, palliative-prognostic-index.test.js, palliative-prognostic-score.test.js, opioid-conversion.test.js, naranjo.test.js, valproate-correction.test.js  (≥3 boundary worked examples each)
test/unit/fuzz-tools.test.js             (add lib/rheum-v148.js to MODULES)
docs/audits/v12/asdas.md, ffs-2011.md, gca-acr-eular-2022.md, palliative-prognostic-index.md, palliative-prognostic-score.md, opioid-conversion.md, naranjo.md, valproate-correction.md  (spec-v11 audit logs)
docs/scope-mdcalc-parity.md              (catalog count 671 -> 679; RECORD the spec-v100 program COMPLETE: 432 -> 679, +247)
CHANGELOG.md                             (Unreleased: v148 entry, +8; spec-v100 program-complete note)
README.md, package.json                  (catalog count 671 -> 679; spec-progression line -> v148)
```

## 6. Acceptance criteria

v148 is fully shipped when:

- The implementing session has **re-run the [spec-v85 §6.2](spec-v85.md) collision
  check** and confirmed all eight ids are absent.
- All 8 tiles in §2 are live (groups G/F/E) with a `META[id]` entry, an inline
  primary citation + `citationUrl` + `accessed`, ≥3 boundary worked examples each
  (including an **ASDAS high→very-high (3.5) boundary**, an **FFS 1→2 mortality-band
  change**, a **2022 GCA ≥ 6 classified flip** (after the age ≥50 entry), a **PaP
  group B→C boundary**, a Naranjo **probable→definite (8→9) flip**, and a worked
  valproate albumin correction), a [spec-v11](spec-v11.md) audit log, and a passing
  [spec-v29](spec-v29.md) §3 check.
- `opioid-conversion` shows the worked conversion AND the second-check caveat, and
  **excludes methadone/buprenorphine**; `valproate-correction` and `asdas` guard
  their division/overflow paths; blank inputs render a complete-the-fields fallback.
- Every compute uses `lib/num.js` and is covered by the [spec-v59](spec-v59.md)
  fuzz harness with zero non-finite leaks.
- `gca-acr-eular-2022` carries `accessed` + a `docs/citation-staleness.md` row.
- `UTILITIES.length` is **679** (or live count + 8) and all catalog-truth surfaces
  ([spec-v46](spec-v46.md)) agree; `scope-mdcalc-parity.md` records the
  **spec-v100 program complete (432 → 679, +247)**.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass.
- The CHANGELOG records v148 with the +8 catalog delta and the program-complete note.

## 7. Out of scope for v148

- **No methadone or buprenorphine conversion** — non-deterministic ratios
  ([spec-v100](spec-v100.md) §8); `opioid-conversion` covers the deterministic
  equianalgesic set only and excludes them by design.
- **No corticosteroid taper** — no consensus algorithm; excluded per §8.
- **No Palliative Performance Scale (Victoria Hospice), MNA, Edmonton Frail Scale,
  ORT, SOAPP, or COMM** — licensed/proprietary, excluded per §8; PPI and PaP are
  the free palliative-prognosis substitutes.
- **No STOPP/START** — a 190-criterion checklist with no aggregate score; excluded
  per §8 (`naranjo` is the deterministic pharmacy-causality tile v148 ships).
- **No automatic dosing/treatment order** — each tile reports the score/converted
  dose and the source's interpretation; the high-stakes opioid conversion adds the
  second-check note; the decision stays with the clinician and local protocol
  ([spec-v11](spec-v11.md) §5.3).
