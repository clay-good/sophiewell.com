# spec-v260.md — Pneumonia severity & antimicrobial-stewardship risk: the A-DROP score, the DRIP score, and the Shorr MRSA-pneumonia score (+3 tiles)

> Status: **SHIPPED (2026-07-09, 1112 → 1115).** Third feature spec of the **Advanced
> Risk-Stratification Instruments** program ([spec-v258](spec-v258.md) §1.1). Adds **3**
> deterministic pneumonia instruments — one for severity/disposition, two for the
> antibiotic-spectrum decision. **Each id was verified absent by a fixed-string scan of
> the extracted `app.js` id/name list** ([spec-v85 §6.2](spec-v85.md)): the catalog
> carries `curb-65`, `crb65`, `psi`, `smart-cop`, `bap-65`, and `ats-idsa-cap`, but
> **not** the A-DROP score, the DRIP score, or the Shorr MRSA-pneumonia score.
>
> Catalog effect: **live `UTILITIES.length` + 3** — enforced by the catalog-truth
> gate ([spec-v46](spec-v46.md)) at build time; no number is copied here.
>
> Every prior spec remains in force. v260 adds no runtime network call and no AI; each
> tile obeys the [spec-v100](spec-v100.md) §2 doctrine, passes the
> [spec-v29](spec-v29.md) §3 one-line test, ships its citation inline
> ([spec-v54](spec-v54.md)), inherits the [spec-v59](spec-v59.md) output-safety
> contract, renders the [spec-v50](spec-v50.md) §3 posture note, and honors
> [spec-v11](spec-v11.md) §5.3 (**no admission, ICU-transfer, or antibiotic order in
> Sophie's voice** — these compute a severity/resistance-risk category; the prescribing
> decision stays with the clinician). **Every criterion, point weight, and threshold is
> re-fetched and cross-verified against ≥2 independent open sources at implementation**
> ([spec-v97](spec-v97.md)); uncertain values carry an explicit *(verify at
> implementation, [spec-v97](spec-v97.md))* tag. The implementing session **re-runs the
> [spec-v85 §6.2](spec-v85.md) collision check** first.

## 1. Thesis

The catalog carries the Western CAP severity scores (CURB-65, CRB-65, PSI/PORT,
SMART-COP) and the IDSA/ATS severe-CAP criteria, but not the Japanese Respiratory
Society **A-DROP** severity score that many services use, and — more importantly — not
the two **stewardship** instruments that answer the question the severity scores do not:
*does this pneumonia need broad-spectrum or anti-MRSA coverage?* The DRIP score
predicts drug-resistant pathogens in general; the Shorr score is the MRSA-specific
rule-out that lets a clinician safely withhold vancomycin/linezolid. Each is a
transparent point model and each is decision support — **never an admission,
ICU-transfer, or antibiotic order**.

## 2. What v260 adds (3 tiles)

### 2.1 `a-drop` — A-DROP score (JRS community-acquired-pneumonia severity)

- **Citation:** Miyashita N, Matsushima T, Oka M; Japanese Respiratory Society. The JRS
  guidelines for the management of community-acquired pneumonia in adults: an update and
  new recommendations. *Intern Med.* 2006;45(7):419-428.
- **citationUrl:** https://doi.org/10.2169/internalmedicine.45.1691
- **Group:** G. **Specialties:** `pulmonology`, `emergency-medicine`,
  `infectious-disease`, `internal-medicine`.
- **Inputs — five items, one point each (the A-DROP mnemonic):** **A**ge (male ≥ 70 or
  female ≥ 75); **D**ehydration (BUN ≥ 21 mg/dL / 7.5 mmol/L); **R**espiratory failure
  (SpO2 ≤ 90 % or PaO2 ≤ 60 mmHg); **O**rientation disturbance (new confusion); low
  blood **P**ressure (systolic ≤ 90 mmHg).
- **Output:** the **A-DROP total (0–5)** with the JRS severity band — **0 → mild
  (outpatient), 1–2 → moderate, 3 → severe (admission), 4–5 → extremely severe (consider
  ICU)** — naming the positive items. Framed as the sex- and age-thresholded CURB-65
  variant used in the JRS pathway, with predictive power comparable to CURB-65/PSI. Class
  A. Cross-links `curb-65`, `psi`, `smart-cop`.

### 2.2 `drip-score` — Drug Resistance in Pneumonia (DRIP) score

- **Citation:** Webb BJ, Dascomb K, Stenehjem E, et al. Derivation and multicenter
  validation of the Drug Resistance in Pneumonia clinical prediction score. *Antimicrob
  Agents Chemother.* 2016;60(5):2652-2663.
- **citationUrl:** https://doi.org/10.1128/AAC.03071-15
- **Group:** G. **Specialties:** `infectious-disease`, `pulmonology`,
  `emergency-medicine`, `internal-medicine`.
- **Inputs — weighted risk factors** *(the exact item list and weights are transcribed
  verbatim from the primary paper at implementation, [spec-v97](spec-v97.md))*: **major
  criteria, +2 each** — antibiotic use within 60 days, long-term-care residence, tube
  feeding, and prior drug-resistant-pathogen infection within 1 year; **minor criteria,
  +1 each** — hospitalization within 60 days, chronic pulmonary disease, poor functional
  status, gastric-acid suppression, wound care, and MRSA colonization within 1 year.
- **Output:** the **DRIP total** with the **≥ 4 = high risk** cutoff for a drug-resistant
  pathogen (favor broad-spectrum empiric coverage) vs **< 4 = low risk** (narrow-spectrum
  reasonable) — naming the contributing factors. Framed as the validated replacement for
  the discredited HCAP definition; **it flags resistance risk, never writes an antibiotic
  order** ([spec-v11](spec-v11.md) §5.3). Class A. Cross-links `shorr`, `a-drop`,
  `curb-65`.

### 2.3 `shorr` — Shorr MRSA-pneumonia risk score

- **Citation:** Shorr AF, Myers DE, Huang DB, Nathanson BH, Emons MF, Kollef MH. A risk
  score for identifying methicillin-resistant *Staphylococcus aureus* in patients
  presenting to the hospital with pneumonia. *BMC Infect Dis.* 2013;13:268.
- **citationUrl:** https://doi.org/10.1186/1471-2334-13-268
- **Group:** G. **Specialties:** `infectious-disease`, `pulmonology`,
  `emergency-medicine`, `internal-medicine`.
- **Inputs — weighted risk factors** *(the exact 2-point items and 1-point items are
  transcribed verbatim from the primary paper at implementation,
  [spec-v97](spec-v97.md))*: **+2** for recent hospitalization and **+2** for ICU
  admission at presentation; **+1 each** for age < 30 or > 79, prior IV antibiotic
  exposure, dementia, cerebrovascular disease, female sex with diabetes, and recent
  nursing-home / long-term-acute-care / skilled-nursing-facility exposure.
- **Output:** the **Shorr total** with the three-band MRSA prevalence stratification —
  **low (0–1) → MRSA < 10 %, medium (2–5), high (≥ 6) → MRSA > 30 %** — naming the
  contributing factors. Framed as the MRSA-specific rule-out that lets anti-MRSA therapy
  be safely withheld in the low band; **it reports MRSA risk, never withholds or orders
  vancomycin/linezolid** ([spec-v11](spec-v11.md) §5.3). Class A. Cross-links
  `drip-score`, `a-drop`.

## 3. Per-tile robustness

- **Every compute routes through `lib/num.js` and is finite-guarded.** A-DROP is a
  bounded 0–5 integer sum; DRIP and Shorr are bounded weighted sums — each renders a
  "complete the fields" fallback for a missing item rather than a `NaN`, and reports the
  band the total falls in.
- **Each tile reports which items fired and the resulting band**
  ([spec-v59](spec-v59.md)) — the A-DROP severity class, the DRIP ≥ 4 dichotomy, the
  Shorr MRSA-prevalence band — so a result is never read without its basis.
- **All three render a category, not an order** — none authors an admission,
  ICU-transfer, or antibiotic order in Sophie's voice ([spec-v11](spec-v11.md) §5.3);
  each renders the [spec-v50](spec-v50.md) §3 posture note. The stewardship framing is
  explicit: DRIP and Shorr **support de-escalation / avoidance of unnecessary
  broad-spectrum and anti-MRSA therapy**, and say so.
- **All three flow through the [spec-v59](spec-v59.md) fuzz harness with zero
  non-finite leaks**, fuzzed at the band boundaries and the age/sex threshold edges.

## 4. CI/CD & maintenance

- **Maintenance classes (§6.3):** all three are **Class A** — fixed criteria/point
  models, each cited by journal + authors. The implementing session confirms whether any
  citation trips `ISSUER_PATTERN` ([spec-v92](spec-v92.md)/[spec-v94](spec-v94.md)) (the
  JRS society acronym is a candidate) and adds a `docs/citation-staleness.md` row only if
  the live pattern matches.
- **Build & gates (§6.1/§6.2):** the three computes live in a new
  `lib/pneumonia-risk-v260.js`, added to `test/unit/fuzz-tools.test.js` `MODULES`.
  Renderers live in a new `views/group-v260.js`; its `RV260` export is spread into the
  `app.js` `RENDERERS` map. Every input carries a real `<label for>`. The catalog count
  moves on all catalog-truth surfaces using the **live `UTILITIES.length` + 3**; a11y,
  `mobile-no-hscroll`, `mobile-touch-targets`, and the chromium `example-correctness`
  sweep pass.
- **Specialties** are drawn from the closed vocabulary; all tags used here already exist
  in `ALLOWED_SPECIALTIES`.
- **MCP exposure (post-ship):** all three are Class A deterministic computes and are
  **routinely MCP-adaptable** — a follow-up MCP wave exposes them as deterministic agent
  tools per the [spec-v85](spec-v85.md) recipe, self-describing the fired items and band
  so the numeric round-trip passes.

## 5. Files touched

```
docs/spec-v260.md                        (this file)
app.js                                   (+3 UTILITIES rows; import group-v260 RV260 into RENDERERS)
lib/pneumonia-risk-v260.js               (new: aDrop, dripScore, shorr)
lib/meta.js                              (+3 META entries: inline citation + citationUrl + accessed; cross-links to curb-65, psi, smart-cop)
views/group-v260.js                      (new renderer module: 3 renderers)
docs/clinical-citations.md               (+3 rows)
test/unit/a-drop.test.js, drip-score.test.js, shorr.test.js   (>=3 worked examples each)
test/unit/fuzz-tools.test.js             (add lib/pneumonia-risk-v260.js to MODULES)
docs/scope-post-parity.md                (catalog count live -> live+3; record the v260 delta)
CHANGELOG.md, README.md, package.json    (catalog count live -> live+3; spec-progression line)
```

## 6. Acceptance criteria

v260 is fully shipped when:

- The implementing session has **re-run the [spec-v85 §6.2](spec-v85.md) collision
  check** and confirmed all three ids are absent (as verified at draft).
- All 3 tiles in §2 are live (Class A) with a `META[id]` entry, inline citation +
  `citationUrl` + `accessed`, and ≥ 3 worked examples each — including an **A-DROP
  crossing its mild/moderate/severe bands and exercising the sex-specific age threshold
  (a 72-year-old man vs a 72-year-old woman)**, a **DRIP crossing the < 4 / ≥ 4 cutoff
  with a major- and a minor-criterion mix**, and a **Shorr crossing the low/medium/high
  MRSA bands**.
- Every compute is finite-guarded, routes through `lib/num.js`, and is covered by the
  [spec-v59](spec-v59.md) fuzz harness with **zero non-finite leaks**.
- `UTILITIES.length` is **live + 3** and all catalog-truth surfaces agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass; the
  CHANGELOG records v260 with the +3 delta.

## 7. Out of scope for v260

- **No admission / ICU-transfer / antibiotic order** — the tiles compute a severity or
  resistance-risk category; the disposition and prescribing decisions stay with the
  clinician ([spec-v11](spec-v11.md) §5.3).
- **No proprietary or non-reproducible variant** — the Expanded A-DROP, I-ROAD, and
  purely local resistance-derivation scores are deferred; this slice adds only the three
  canonical, openly-published instruments.
