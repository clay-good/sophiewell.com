# spec-v99.md — ID, critical-care & burns: Duke endocarditis, Pitt bacteremia, SAPS II, Lund-Browder TBSA, and refeeding risk (+5 tiles)

> Status: **PROPOSED (2026-06-16).** Final feature spec of **Wave 2** and the
> **closing spec of the [spec-v85](spec-v85.md) Advanced Clinical Calculators
> program.** Adds **5** deterministic infectious-disease, critical-care, and burns
> decision rules that fill confirmed gaps. None duplicates a live tile.
>
> Catalog effect at v99 close: **427 + 5 = 432 tiles** — the program end state.
> The [spec-v85](spec-v85.md) program takes the catalog **366 → 432 (+66)**.
>
> Every prior spec (v4 through v98) remains in force. v99 adds no runtime network
> call and no AI; each tile obeys the [spec-v85](spec-v85.md) §2 doctrine and the
> [spec-v85](spec-v85.md) §6 CI/CD contract, passes the [spec-v29](spec-v29.md) §3
> one-line test, ships its primary citation inline ([spec-v54](spec-v54.md)), and
> inherits the [spec-v59](spec-v59.md) output-safety contract.

> **Scope correction recorded.** An earlier draft proposed `pecarn-cspine`; a
> full-catalog sweep found it **already shipped** in Group N (`pecarn-cspine`,
> citing Leonard 2011/2019). v99 drops it (and cross-links the existing tile) and
> ships `saps-ii` — the adult-ICU mortality companion to the already-shipped
> `apache2` — in its place, keeping the +5 delta with five genuinely-new tiles.

## 1. Thesis

The catalog has the acute-infection and critical-care *triage* tools (`curb-65`,
`sirs`, `qsofa-sofa`, `smart-cop`, `apache2`) and the burn-*resuscitation*
calculator (`burn-fluid`, which takes %TBSA as an input), but five standard
ID/critical-care/burns instruments are absent:

- **Infective endocarditis has no Duke-criteria tile** — the major/minor
  determination that decides "definite vs possible vs rejected IE," updated by the
  2023 Duke-ISCVID revision, is reachable nowhere.
- **Bloodstream infection has no Pitt Bacteremia Score** — the acute-physiology
  mortality score used across the ID/sepsis literature to risk-stratify bacteremia.
- **Adult ICU mortality has APACHE II but not SAPS II** — the other widely-used
  admission severity model, often reported alongside APACHE for benchmarking.
- **Burns has the resuscitation math but no %TBSA estimator** — `burn-fluid`
  *consumes* a total-body-surface-area percentage the clinician must compute by
  hand; the age-adjusted Lund-Browder chart (and the Rule of Nines cross-check) is
  the tool that produces it.
- **Nutrition has the ICU energy/protein target but no refeeding-risk screen** —
  the NICE high-risk criteria that gate cautious refeeding.

Each is a published, deterministic instrument a clinician already uses; v99 brings
them onto the page and closes the program.

## 2. What v99 adds (5 tiles)

### 2.1 `duke-endocarditis` — Modified Duke criteria for infective endocarditis (2023 Duke-ISCVID)

- **Citation:** Fowler VG, Durack DT, Selton-Suty C, et al. The 2023 Duke-ISCVID
  Criteria for Infective Endocarditis: Updating the Modified Duke Criteria. *Clin
  Infect Dis.* 2023;77(4):518-526; building on Li JS, Sexton DJ, Mick N, et al.
  Proposed modifications to the Duke criteria. *Clin Infect Dis.* 2000;30(4):633-638.
- **citationUrl:** https://doi.org/10.1093/cid/ciad271
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `infectious-disease`, `cardiology`, `cardiac-surgery`,
  `internal-medicine`.
- **Inputs:** the major criteria (typical organism on persistently positive blood
  cultures, positive imaging/echo evidence of endocardial involvement, surgical/
  pathologic findings per the 2023 update) and minor criteria (predisposing
  condition, fever ≥38 °C, vascular phenomena, immunologic phenomena, microbiologic
  evidence not meeting a major criterion).
- **Output:** **"definite," "possible," or "rejected"** IE per the rule —
  **definite** = 2 major, or 1 major + 3 minor, or 5 minor; **possible** = 1 major +
  1 minor, or 3 minor — naming the criteria counted. Class B (the Duke-ISCVID
  criteria are revisable → `docs/citation-staleness.md` row, on-publication cadence).

### 2.2 `pitt-bacteremia` — Pitt Bacteremia Score

- **Citation:** Paterson DL, Ko WC, Von Gottberg A, et al. International prospective
  study of *Klebsiella pneumoniae* bacteremia: implications of extended-spectrum
  beta-lactamase production in nosocomial infections. *Ann Intern Med.*
  2004;140(1):26-32 (the widely-applied Pitt Bacteremia Score form).
- **citationUrl:** https://doi.org/10.7326/0003-4819-140-1-200401060-00008
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `infectious-disease`, `critical-care`, `internal-medicine`,
  `pharmacy`.
- **Inputs:** temperature (banded points), hypotension (2), mechanical ventilation
  (2), cardiac arrest (4), and mental status (alert 0 / disoriented 1 / stupor 2 /
  coma 4).
- **Output:** the **total (0–14)** with the mortality-risk framing (a score ≥ 4 is
  commonly used to denote high risk). Class A. Cross-links `qsofa-sofa` and
  `apache2`.

### 2.3 `saps-ii` — Simplified Acute Physiology Score II

- **Citation:** Le Gall JR, Lemeshow S, Saulnier F. A new Simplified Acute
  Physiology Score (SAPS II) based on a European/North American multicenter study.
  *JAMA.* 1993;270(24):2957-2963.
- **citationUrl:** https://doi.org/10.1001/jama.1993.03510240069035
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `critical-care`, `nursing-icu`, `anesthesiology`.
- **Inputs:** the 17 SAPS II variables — age, heart rate, systolic BP, temperature,
  PaO₂/FiO₂ (if ventilated/CPAP), urine output, BUN, sodium, potassium, bicarbonate,
  bilirubin, WBC, Glasgow Coma Scale, chronic disease (metastatic cancer /
  hematologic malignancy / AIDS), and admission type (scheduled surgical /
  unscheduled surgical / medical).
- **Output:** the **SAPS II point total** and the **predicted hospital mortality
  (%)** via the published logistic conversion (logit = −7.7631 + 0.0737·SAPS +
  0.9971·ln(SAPS+1)). Class A (fixed 1993 coefficients). Companion to the
  already-shipped `apache2`; cross-linked, both kept. Robustness: the logistic and
  the `ln(SAPS+1)` are domain-guarded.

### 2.4 `lund-browder` — Lund-Browder chart + Rule of Nines for %TBSA burn

- **Citation:** Lund CC, Browder NC. The estimation of areas of burns. *Surg Gynecol
  Obstet.* 1944;79:352-358.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `burn-surgery`, `emergency-medicine`, `critical-care`,
  `nursing-ed`.
- **Inputs:** age band (age-adjusts the head / thigh / leg percentages), and the
  fraction of each body region burned (partial-thickness and deeper counted).
- **Output:** the **total %TBSA** via the age-adjusted Lund-Browder regions, with
  the adult **Rule of Nines** estimate shown alongside as a cross-check. The
  age-adjusted region percentages are **compiled constants** ([spec-v85](spec-v85.md)
  §5), not a dataset. Class A. **Near-neighbor:** `burn-fluid` (I) *consumes* the
  %TBSA this tile *produces* — cross-linked, both kept (different jobs).

### 2.5 `refeeding-risk` — NICE refeeding-syndrome risk stratification

- **Citation:** National Institute for Health and Care Excellence (NICE). Nutrition
  support for adults: oral nutrition support, enteral tube feeding and parenteral
  nutrition (CG32), 2006; updated 2017.
- **citationUrl:** https://www.nice.org.uk/guidance/cg32
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `critical-care`, `nutrition`, `internal-medicine`,
  `nursing-floor`.
- **Inputs:** BMI; unintentional weight loss (% over 3–6 months); days with little
  or no nutritional intake; pre-feeding potassium / magnesium / phosphate (low or
  not); and the history flags (alcohol misuse; insulin, chemotherapy, antacid, or
  diuretic use).
- **Output:** the NICE risk determination — **high risk** if **one** major criterion
  (BMI < 16 kg/m², weight loss > 15%, > 10 days negligible intake, or low
  pre-feeding K/Mg/PO₄) **or two** minor criteria — with the cited cautious-
  refeeding caveat. Class B (NICE guidance is revisable → `docs/citation-staleness.md`
  row, on-publication cadence). Cross-links `icu-nutrition-target` (F) and
  `electrolyte-replacement` (F).

## 3. Per-tile robustness

- **`duke-endocarditis`, `pitt-bacteremia`, and `refeeding-risk` are
  criteria/threshold logic** with bounded sums; they flow through the
  [spec-v59](spec-v59.md) fuzz harness and name which criteria were counted.
- **`saps-ii` guards its math.** The point assignment clamps each physiologic
  variable to its SAPS II band; the mortality logistic uses an overflow-safe
  `1/(1+e^-x)` and guards `ln(SAPS+1)` (SAPS ≥ 0 always), returning a surfaced
  fallback rather than a probability from `NaN` when a required variable is blank.
- **`lund-browder` clamps region fractions to 0–1 and flags an implausible total**
  (> 100%) rather than silently capping, mirroring the signed-value handling
  elsewhere in the program. The Rule-of-Nines cross-check is computed independently
  so the two estimates can be compared.
- All five render the [spec-v50](spec-v50.md) §3 clinical posture note and quote the
  source's interpretation; none authors a treatment recommendation in Sophie's voice
  ([spec-v11](spec-v11.md) §5.3).

## 4. CI/CD & maintenance

Per the [spec-v85](spec-v85.md) §6 contract:

- **Maintenance classes (§6.3):** `pitt-bacteremia`, `saps-ii`, and `lund-browder`
  are **Class A** (fixed derivation papers / coefficients / region table) — no
  `docs/citation-staleness.md` row. `duke-endocarditis` (Duke-ISCVID) and
  `refeeding-risk` (NICE CG32) are **Class B** — each gets a staleness row naming the
  edition in force (2023 Duke-ISCVID; NICE CG32 2017 update), the `accessed` date,
  and an on-publication review cadence, monitored by the
  `scripts/check-citation-cadence.mjs` warn-job ([spec-v90](spec-v90.md), §6.3).
- **Gates (§6.2):** `lib/idcrit-v99.js` is added to the
  `test/unit/fuzz-tools.test.js` `MODULES` list (zero non-finite leaks, with the
  SAPS II logistic explicitly fuzzed for overflow); each `META` example is pinned by
  the chromium `example-correctness` sweep; the catalog count moves on all **13
  catalog-truth surfaces**; a11y, mobile-no-hscroll, and 44px touch-target checks
  pass for `views/group-v25.js`.
- **Program-close note:** with v99 the [spec-v85](spec-v85.md) program is complete at
  **432** tiles. The §6.3 cadence job now monitors the full set of program Class B
  rows (ESC/ERS PVR, ADA hyperglycemic-crisis, FDA carboplatin cap, EULAR DAS28,
  ASA-PS, EXTRIP, ASE/ACC-AHA aortic-stenosis, GOLD, GLI, KDIGO CKD, AAP Kawasaki,
  Duke-ISCVID, NICE refeeding). `scope-mdcalc-parity.md` records the program closed
  366 → 432 (+66).

## 5. Files touched

```
docs/spec-v99.md                         (this file)
app.js                                   (+5 UTILITIES rows, group G; import group-v25 renderers into RENDERERS)
lib/idcrit-v99.js                        (new module: dukeEndocarditis, pittBacteremia, sapsII, lundBrowder, refeedingRisk)
lib/meta.js                              (+5 META entries: inline citation + citationUrl + accessed; cross-links to curb-65, qsofa-sofa, apache2, pecarn-cspine, nexus-cspine, burn-fluid, icu-nutrition-target)
views/group-v25.js                       (new renderer module: 5 renderers; incl. the Lund-Browder per-region input + Rule-of-Nines cross-check)
docs/citation-staleness.md               (+ rows: duke-endocarditis 2023 Duke-ISCVID, refeeding-risk NICE CG32)
docs/clinical-citations.md               (+ rows for the five sources)
test/unit/duke-endocarditis.test.js, pitt-bacteremia.test.js, saps-ii.test.js, lund-browder.test.js, refeeding-risk.test.js  (≥3 boundary worked examples each)
test/unit/fuzz-tools.test.js             (add lib/idcrit-v99.js to MODULES)
docs/audits/v12/duke-endocarditis.md, pitt-bacteremia.md, saps-ii.md, lund-browder.md, refeeding-risk.md  (spec-v11 audit logs)
docs/scope-mdcalc-parity.md              (catalog count 427 -> 432; CLOSE the spec-v85 program in the running ledger: 366 -> 432, +66)
CHANGELOG.md                             (Unreleased: v99 entry, +5; program-complete note)
README.md, package.json                  (catalog count 427 -> 432; spec-progression line -> v99)
```

## 6. Acceptance criteria

v99 is fully shipped when:

- The implementing session has **re-run the §6.2 collision check** and confirmed all
  five ids are absent (`pecarn-cspine` stays the existing Group N tile, cross-linked).
- All 5 tiles in §2 are live in Group G with a `META[id]` entry, an inline primary
  citation + `citationUrl` + `accessed`, ≥3 boundary worked examples (including Duke
  definite/possible/rejected, Pitt ≥ 4, a worked SAPS II point-total → mortality, a
  Lund-Browder age-adjusted %TBSA vs Rule-of-Nines cross-check, and the NICE
  single-major high-risk case), a [spec-v11](spec-v11.md) audit log, and a passing
  [spec-v29](spec-v29.md) §3 check.
- `saps-ii` guards its logistic and `ln(SAPS+1)`; `lund-browder` clamps region
  fractions and flags > 100% totals; partial inputs render a complete-the-fields
  fallback.
- Every compute function uses `lib/num.js` and is covered by the
  [spec-v59](spec-v59.md) fuzz harness with zero non-finite leaks.
- `duke-endocarditis` and `refeeding-risk` carry `accessed` + a
  `docs/citation-staleness.md` row.
- `UTILITIES.length` is **432** (or live count + 5 if specs land out of order) and
  all catalog-truth surfaces ([spec-v46](spec-v46.md)) agree; `scope-mdcalc-parity.md`
  records the spec-v85 program complete (366 → 432, +66).
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass.
- The CHANGELOG records v99 with the +5 catalog delta and the program-complete note.

## 7. Out of scope for v99

- **No microbiology/echo-report parsing** — `duke-endocarditis` takes the
  clinician's major/minor criteria determinations, not a culture or echo feed.
- **No burn-fluid duplication** — `lund-browder` *produces* %TBSA; `burn-fluid` (I)
  *consumes* it. Cross-linked, both kept.
- **No `pecarn-cspine` re-implementation** — the existing Group N tile stands; v99
  cross-links it from `lund-browder`/trauma context where relevant.
- **No auto-antibiotic, auto-imaging, or auto-feeding-rate order** — each tile
  reports the rule's verdict/score and the source's stated guidance; the management
  decision stays with the clinician and local protocol.
