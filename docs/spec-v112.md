# spec-v112.md — ICU mortality & sepsis-coagulopathy: MEDS, SIC, CPIS-VAP, lactate clearance, and MRC sum score (+5 tiles)

> Status: **SHIPPED (2026-06-19).** Feature spec of the
> [spec-v100](spec-v100.md) **MDCalc Parity Completion** program, **Wave 3 —
> Critical care & pulmonary** ([spec-v100 §4](spec-v100.md)). Adds **5**
> deterministic critical-care decision rules that fill confirmed gaps. None
> duplicates a live tile.
>
> Catalog effect at v112 close: **487 + 5 = 492 tiles** (the program's running
> count carried a one-tile drift from the v109 reconciliation — see
> [spec-v111](spec-v111.md) — so v112 lands at 492, not the draft's 493; the
> catalog-truth gate enforces the live count + 5).
>
> Every prior spec (v4 through v111) remains in force. v112 adds no runtime
> network call and no AI; each tile obeys the [spec-v100 §2](spec-v100.md)
> doctrine (re-binding [spec-v85 §2](spec-v85.md)) and the
> [spec-v100 §6](spec-v100.md) CI/CD contract, passes the
> [spec-v29](spec-v29.md) §3 one-line test, ships its primary citation inline
> ([spec-v54](spec-v54.md)), and inherits the [spec-v59](spec-v59.md)
> output-safety contract.

## 1. Thesis

The catalog has the ICU *admission-severity* models (`apache2`, `saps-ii`) and
the sepsis-*triage* tools (`sirs`, `qsofa-sofa`, `curb-65`), but five standard
critical-care instruments — used at the bedside for sepsis mortality, sepsis
coagulopathy, ventilator-associated pneumonia, resuscitation response, and
ICU-acquired weakness — are absent:

- **ED sepsis has no MEDS score** — the Mortality in Emergency Department Sepsis
  rule that risk-stratifies 28-day mortality at the front door, distinct from the
  ICU-admission models.
- **DIC/sepsis coagulopathy has no SIC score** — the Sepsis-Induced Coagulopathy
  screen (platelet + PT-INR + capped SOFA) that gates early anticoagulation
  consideration, a precursor step to the overt-DIC scores.
- **Ventilator-associated pneumonia has no CPIS** — the Clinical Pulmonary
  Infection Score that quantifies VAP likelihood from temperature, WBC,
  secretions, oxygenation, and radiograph.
- **Resuscitation has lactate targets nowhere computed** — lactate *clearance*
  (the percentage fall between draws) is a standard early-goal-directed endpoint
  the catalog cannot calculate.
- **ICU-acquired weakness has no MRC sum score** — the 12-muscle-group manual
  strength sum (0–60) that defines ICU-acquired weakness at < 48.

Each is a published, deterministic instrument a clinician already uses; v112
brings them onto the page.

## 2. What v112 adds (5 tiles)

### 2.1 `meds-score` — Mortality in Emergency Department Sepsis

- **Citation:** Shapiro NI, Wolfe RE, Moore RB, Smith E, Burdick E, Bates DW.
  Mortality in Emergency Department Sepsis (MEDS) score: a prospectively derived
  and validated clinical prediction rule. *Crit Care Med.* 2003;31(3):670-675.
- **citationUrl:** https://doi.org/10.1097/01.CCM.0000054867.01688.D1
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `emergency-medicine`, `critical-care`, `internal-medicine`,
  `nursing-icu`.
- **Inputs:** terminal illness (6), tachypnea/hypoxia (3), septic shock (3),
  platelets < 150k (3), bands > 5% (3), age > 65 (3), lower respiratory infection
  (2), nursing-home resident (2), altered mental status (2).
- **Output:** the **total (0–27)** with the published 28-day mortality risk bands
  (very low / low / moderate / high / very high). Class A (fixed point weights).
  Cross-links `qsofa-sofa` and `apache2`.

### 2.2 `sic-score` — Sepsis-Induced Coagulopathy Score

- **Citation:** Iba T, Levy JH, Warkentin TE, Thachil J, van der Poll T, Levi M.
  Diagnosis and management of sepsis-induced coagulopathy and disseminated
  intravascular coagulation. *J Thromb Haemost.* 2019;17(11):1989-1994 (ISTH SIC
  criteria).
- **citationUrl:** https://doi.org/10.1111/jth.14578
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `critical-care`, `internal-medicine`, `nursing-icu`.
- **Inputs:** platelet count (banded points), PT-INR (banded points), and the
  **total SOFA capped at 2** (the SIC restriction of the SOFA sum to the
  respiratory/cardiovascular/etc. components, capped at 2 points).
- **Output:** the **total (0–6)** with the rule's verdict — **SIC if ≥ 4** with a
  platelet- and PT-INR-subscore minimum — naming the subscores counted. Class A
  (fixed ISTH thresholds). Cross-links `qsofa-sofa`.

### 2.3 `cpis-vap` — Clinical Pulmonary Infection Score

- **Citation:** Pugin J, Auckenthaler R, Mili N, Janssens JP, Lew PD, Suter PM.
  Diagnosis of ventilator-associated pneumonia by bacteriologic analysis of
  bronchoscopic and nonbronchoscopic "blind" bronchoalveolar lavage fluid.
  *Am Rev Respir Dis.* 1991;143(5 Pt 1):1121-1129 (the CPIS as derived).
- **citationUrl:** https://doi.org/10.1164/ajrccm/143.5_Pt_1.1121
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `critical-care`, `pulmonology`, `respiratory-therapy`,
  `nursing-icu`.
- **Inputs:** temperature (banded 0/1/2), WBC (banded 0/1/2 with bands bonus),
  tracheal secretions (0/1/2), oxygenation by PaO₂/FiO₂ (0/2), chest-radiograph
  infiltrate (0/1/2), and culture (0/1/2 in the modified form).
- **Output:** the **total (0–12)** with the **> 6 suggests VAP** interpretation,
  naming the components scored. Class A (fixed point structure). Cross-links
  `curb-65` and the modified-form note.

### 2.4 `lactate-clearance` — Lactate Clearance

- **Citation:** Nguyen HB, Rivers EP, Knoblich BP, Jacobsen G, Muzzin A, Ressler
  JA, Tomlanovich MC. Early lactate clearance is associated with improved outcome
  in severe sepsis and septic shock. *Crit Care Med.* 2004;32(8):1637-1642.
- **citationUrl:** https://doi.org/10.1097/01.CCM.0000132904.35713.A7
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `critical-care`, `emergency-medicine`, `nursing-icu`.
- **Inputs:** initial lactate, repeat lactate, and (optional) the interval between
  draws.
- **Output:** the **% clearance = (initial − repeat) / initial × 100**, with the
  cited ≥ 10% early-clearance favorable framing and a negative-value (rising
  lactate) note. Class A (fixed arithmetic). **Robustness:** division by zero is
  guarded — initial lactate must be > 0 or a complete-the-fields fallback renders
  rather than a probability from `NaN`/`Infinity`.

### 2.5 `mrc-sum-score` — MRC Sum Score (ICU-acquired weakness)

- **Citation:** De Jonghe B, Sharshar T, Lefaucheur JP, et al. Paresis acquired
  in the intensive care unit: a prospective multicenter study. *JAMA.*
  2002;288(22):2859-2867.
- **citationUrl:** https://doi.org/10.1001/jama.288.22.2859
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `critical-care`, `nursing-icu`, `internal-medicine`.
- **Inputs:** the 6 bilateral movements (shoulder abduction, elbow flexion, wrist
  extension, hip flexion, knee extension, ankle dorsiflexion), each graded 0–5 on
  the MRC scale (12 muscle groups total).
- **Output:** the **sum (0–60)** with the **< 48 = ICU-acquired weakness**
  threshold, naming the groups assessed. Class A (fixed scale). Cross-links
  `rass-sedation` and the weaning cluster.

## 3. Per-tile robustness

- **`meds-score`, `sic-score`, `cpis-vap`, and `mrc-sum-score` are
  criteria/threshold logic** with bounded sums; they flow through the
  [spec-v59](spec-v59.md) fuzz harness and name which components were counted. The
  `sic-score` SOFA component is clamped to its 0–2 cap before summing.
- **`lactate-clearance` guards division by zero** — the compute requires
  `initialLactate > 0`; a zero or blank initial value renders the surfaced
  complete-the-fields fallback rather than dividing. A repeat above the initial
  yields a correctly-signed negative clearance (rising lactate), flagged in words,
  never silently clamped.
- All five render the [spec-v50](spec-v50.md) §3 clinical posture note and quote
  the source's interpretation; none authors a treatment recommendation in Sophie's
  voice ([spec-v11](spec-v11.md) §5.3). Each compute uses `lib/num.js`.

## 4. CI/CD & maintenance

Per the [spec-v100 §6](spec-v100.md) contract (re-binding [spec-v85 §6](spec-v85.md)):

- **Maintenance classes (§6.3):** all five are **Class A** — fixed point weights /
  thresholds / arithmetic — so **no** `docs/citation-staleness.md` row is needed.
  Citations name the **journal and authors** (Shapiro/CCM, Iba/JTH, Pugin/ARRD,
  Nguyen/CCM, De Jonghe/JAMA), not an issuing-society acronym, so the
  `check-citations.mjs` `ISSUER_PATTERN` does **not** trip a spurious staleness
  row.
- **Gates (§6.2):** `lib/critcare-v112.js` is added to the
  `test/unit/fuzz-tools.test.js` `MODULES` list (zero non-finite leaks; the
  `lactate-clearance` division explicitly fuzzed for zero/negative denominators);
  each `META` example is pinned by the chromium `example-correctness` sweep; the
  catalog count moves on all **13 catalog-truth surfaces**; a11y,
  `mobile-no-hscroll`, and 44px touch-target checks pass for `views/group-v37.js`.
- **Renderer numbering (§6.1):** v112 claims `views/group-v37.js` (continuing the
  `group-vNN` sequence past the v85 program's `group-v25`) and adds its `RV37`
  export to the `app.js` `RENDERERS` spread.

## 5. Files touched

```
docs/spec-v112.md                        (this file)
app.js                                   (+5 UTILITIES rows; import group-v37 renderers into RENDERERS)
lib/critcare-v112.js                     (new module: medsScore, sicScore, cpisVap, lactateClearance, mrcSumScore)
lib/meta.js                              (+5 META entries: inline citation + citationUrl + accessed; cross-links to qsofa-sofa, apache2, saps-ii, curb-65, rass-sedation)
views/group-v37.js                       (new renderer module: 5 renderers; incl. the MRC 12-group grid and the lactate two-draw input)
docs/clinical-citations.md               (+ rows for the five sources)
test/unit/meds-score.test.js, sic-score.test.js, cpis-vap.test.js, lactate-clearance.test.js, mrc-sum-score.test.js  (≥3 boundary worked examples each)
test/unit/fuzz-tools.test.js             (add lib/critcare-v112.js to MODULES)
docs/audits/v12/meds-score.md, sic-score.md, cpis-vap.md, lactate-clearance.md, mrc-sum-score.md  (spec-v11 audit logs)
docs/scope-mdcalc-parity.md              (catalog count 488 -> 493; Wave 3 running ledger)
CHANGELOG.md                             (Unreleased: v112 entry, +5)
README.md, package.json                  (catalog count 488 -> 493; spec-progression line -> v112)
```

## 6. Acceptance criteria

v112 is fully shipped when:

- The implementing session has **re-run the [spec-v85 §6.2](spec-v85.md) collision
  check** and confirmed all five ids are absent from the then-current catalog.
- All 5 tiles in §2 are live (Group G except `lactate-clearance` in E) with a
  `META[id]` entry, an inline primary citation + `citationUrl` + `accessed`, ≥3
  boundary worked examples each (including a MEDS very-high-risk total, a SIC
  total flipping at ≥ 4, a CPIS crossing the > 6 VAP threshold, a worked
  lactate-clearance ≥ 10% case, and an MRC sum flipping at < 48), a
  [spec-v11](spec-v11.md) audit log, and a passing [spec-v29](spec-v29.md) §3
  check.
- `lactate-clearance` guards its denominator (initial > 0); the `sic-score` SOFA
  component is clamped to 0–2; partial inputs render a complete-the-fields
  fallback.
- Every compute function uses `lib/num.js` and is covered by the
  [spec-v59](spec-v59.md) fuzz harness with zero non-finite leaks.
- `UTILITIES.length` is **493** (or live count + 5 if specs land out of order) and
  all catalog-truth surfaces ([spec-v46](spec-v46.md)) agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass.
- The CHANGELOG records v112 with the +5 catalog delta.

## 7. Out of scope for v112

- **No ventilator control or weaning order.** `mrc-sum-score` and `cpis-vap`
  report the score and the source's interpretation; the extubate/sedate/treat
  decision stays with the clinician and local protocol.
- **No microbiology or radiograph parsing** — `cpis-vap` takes the clinician's
  scored components (secretions, infiltrate, culture), not a feed.
- **No auto-anticoagulation order** — `sic-score` reports the SIC verdict and the
  ISTH framing; the anticoagulation decision stays with the clinician.
- **No SOFA re-implementation** — `sic-score` uses the SOFA total (capped at 2)
  the existing `qsofa-sofa` tile already computes; cross-linked.
- **No lactate trend graphing** — `lactate-clearance` reports the single
  two-draw percentage; serial trending is out of scope.
