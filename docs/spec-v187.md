# spec-v187.md — Emergency toxicology, electrolyte & acute decision instruments: Rumack-Matthew, King's College criteria, TTKG, modified Centor, and the free-water deficit (+5 tiles)

> Status: **PROPOSED (2026-06-30).** Third and **closing** feature spec of the
> **Advanced Bedside Quantitation** program ([spec-v185](spec-v185.md) §1.1),
> implementing the **emergency toxicology / electrolyte / acute-decision**
> cluster. Adds **5** deterministic acute-care instruments that fill confirmed
> gaps: the catalog carries `digifab dosing`, `anticoag-reversal`, `salicylate-
> toxicity`, `toxic-alcohol`, and the acid-base suite, but it does not yet carry
> the **time-anchored acetaminophen nomogram**, the **acute-liver-failure
> transplant criteria**, the **transtubular potassium gradient**, the
> **streptococcal-pharyngitis decision score**, or the **free-water deficit** for
> hypernatremia. None duplicates a live tile (Rumack-Matthew, King's College,
> TTKG, Centor/McIsaac, and the free-water deficit were all checked absent at
> draft).
>
> Catalog effect: **live `UTILITIES.length` + 5** — enforced by the catalog-truth
> gate ([spec-v46](spec-v46.md)) at build time; no number is copied here.
>
> Every prior spec remains in force. v187 adds no runtime network call and no AI;
> each tile obeys the [spec-v100](spec-v100.md) §2 doctrine and §6 CI/CD contract,
> passes the [spec-v29](spec-v29.md) §3 one-line test, ships its primary citation
> inline ([spec-v54](spec-v54.md)), inherits the [spec-v59](spec-v59.md)
> output-safety contract, renders the [spec-v50](spec-v50.md) §3 posture note, and
> honors [spec-v11](spec-v11.md) §5.3 (**no antidote, transplant-referral, or
> correction order in Sophie's voice** — these compute and classify; the decision
> stays with the clinician and poison control). **Every nomogram coordinate,
> criterion threshold, point weight, and correction constant is re-fetched and
> cross-verified against ≥2 independent sources at implementation**
> ([spec-v97](spec-v97.md)); uncertain values carry an explicit *(verify at
> implementation, [spec-v97](spec-v97.md))* tag.

## 1. Thesis

The acute-care clinician makes a handful of high-consequence, fully-deterministic
judgments that the catalog is missing: is this acetaminophen level above the
treatment line for its time since ingestion; does this liver failure meet the
transplant-referral criteria; is the kidney handling potassium appropriately; is
this sore throat worth a test or treatment; and how much free water is this
hypernatremic patient short. v187 ships those five. Each is a transparent
equation or criteria set — auditable, unit-tested at every threshold, and framed
as decision support that **routes the user to poison control, the transplant
center, or the protocol, never an automatic order**.

## 2. What v187 adds (5 tiles)

### 2.1 `rumack-matthew` — Acetaminophen Toxicity Nomogram (Rumack-Matthew treatment line)

- **Citation:** Rumack BH, Matthew H. Acetaminophen poisoning and toxicity.
  *Pediatrics.* 1975;55(6):871-876. Treatment-line (150 µg/mL at 4 h, log-linear
  decline) as adopted by the US "150 line": Rumack BH, Peterson RC, Koch GG,
  Amara IA. *Arch Intern Med.* 1981;141(3 Spec No):380-385.
- **citationUrl:** https://doi.org/10.1542/peds.55.6.871
- **Group:** G (clinical scoring & risk determination). **Specialties:**
  `toxicology`, `poison-control`, `emergency-medicine`.
- **Inputs:** the serum acetaminophen level and the **hours since a single acute
  ingestion** (valid 4–24 h; the tile states that the nomogram does not apply to
  staggered or unknown-time ingestions). Computes the **treatment-line value at
  that time** by the log-linear equation (150 µg/mL at 4 h, halving every ~4 h)
  and compares the measured level.
- **Output:** **above vs below the treatment line** (with the line value at that
  hour), explicitly framed as *consult poison control / NAC per protocol*, not an
  order. States the 4–24 h validity window and the single-ingestion assumption.
  Class A. Cross-links `kings-college-criteria` and `maddrey-lille`.

### 2.2 `kings-college-criteria` — King's College Criteria for Acute Liver Failure

- **Citation:** O'Grady JG, Alexander GJM, Hayllar KM, Williams R. Early
  indicators of prognosis in fulminant hepatic failure. *Gastroenterology.*
  1989;97(2):439-445.
- **citationUrl:** https://doi.org/10.1016/0016-5085(89)90081-4
- **Group:** G. **Specialties:** `hepatology`, `transplant`, `critical-care`.
- **Inputs:** an **etiology toggle** (acetaminophen vs non-acetaminophen) that
  selects the criteria set. **Acetaminophen:** arterial pH < 7.30 (after
  resuscitation), OR all three of INR > 6.5, creatinine > 3.4 mg/dL, and
  grade III–IV encephalopathy. **Non-acetaminophen:** INR > 6.5 alone, OR any
  three of (age < 10 or > 40, unfavorable etiology, jaundice-to-encephalopathy
  > 7 days, INR > 3.5, bilirubin > 17.5 mg/dL) *(verify the exact unit thresholds
  at implementation, [spec-v97](spec-v97.md))*.
- **Output:** **criteria met / not met** for the selected etiology, naming which
  branch was satisfied and stating that meeting criteria indicates
  *transplant-center referral / evaluation*, not a listing decision. Class A.
  Cross-links `rumack-matthew` and `meld-3.0`.

### 2.3 `ttkg` — Transtubular Potassium Gradient

- **Citation:** West ML, Marsden PA, Richardson RMA, Zettle RM, Halperin ML. New
  clinical approach to evaluate disorders of potassium excretion. *Miner
  Electrolyte Metab.* 1986;12(4):234-238. Validation: Ethier JH, Kamel KS, Magner
  PO, Lemann J, Halperin ML. The transtubular potassium concentration in patients
  with hypokalemia and hyperkalemia. *Am J Kidney Dis.* 1990;15(4):309-315.
- **citationUrl:** https://doi.org/10.1016/S0272-6386(12)80076-X
- **Group:** E (clinical math). **Specialties:** `nephrology`, `critical-care`,
  `internal-medicine`.
- **Inputs:** urine potassium, serum potassium, urine osmolality, and serum
  osmolality (the validity preconditions — urine osmolality ≥ serum and urine
  Na⁺ > 25 — are stated). **TTKG = (urine K⁺ / serum K⁺) ÷ (urine osm / serum
  osm)**.
- **Output:** the **TTKG**, interpreted against the expected response (in
  hyperkalemia an appropriate renal response is TTKG > 7–8; in hypokalemia a
  TTKG > 4 suggests renal potassium wasting *(verify the cut-points at
  implementation, [spec-v97](spec-v97.md))*), flagging when the validity
  preconditions are not met. Class A. Cross-links the acid-base / electrolyte
  tiles.

### 2.4 `centor-mcisaac` — Modified Centor (McIsaac) Score for Strep Pharyngitis

- **Citation:** Centor RM, Witherspoon JM, Dalton HP, Brody CE, Link K. The
  diagnosis of strep throat in adults in the emergency room. *Med Decis Making.*
  1981;1(3):239-246. Age-modified: McIsaac WJ, Goel V, To T, Low DE. The validity
  of a sore throat score in family practice. *CMAJ.* 2000;163(7):811-815.
- **citationUrl:** https://doi.org/10.1177/0272989X8100100304
- **Group:** G. **Specialties:** `emergency-medicine`, `primary-care`,
  `family-medicine`, `otolaryngology`.
- **Inputs:** the four Centor criteria (tonsillar exudate, tender anterior
  cervical nodes, fever > 38 °C, absence of cough) plus the **McIsaac age
  adjustment** (+1 for age 3–14, 0 for 15–44, −1 for ≥ 45). Total −1 to 5.
- **Output:** the **score** mapped to the published likelihood-of-streptococcus
  band and the guideline action (no testing / test / consider empiric *(bands
  verified at implementation, [spec-v97](spec-v97.md))*), framed as a decision
  aid. Class A. Cross-links the febrile-illness tiles.

### 2.5 `free-water-deficit` — Free Water Deficit (hypernatremia)

- **Citation:** the total-body-water free-water-deficit equation, FWD = TBW ×
  (Na⁺/140 − 1), with TBW = weight × the age/sex fraction (0.6 / 0.5 / 0.5 / 0.45).
  Adrogué HJ, Madias NE. Hypernatremia. *N Engl J Med.* 2000;342(20):1493-1499.
- **citationUrl:** https://doi.org/10.1056/NEJM200005183422006
- **Group:** E. **Specialties:** `nephrology`, `critical-care`,
  `emergency-medicine`, `internal-medicine`.
- **Inputs:** weight, sex, an age/elderly toggle (sets the TBW fraction), serum
  sodium, and the target sodium (default 140 mmol/L). Computes the **TBW** and
  the **free-water deficit (L)**, plus an illustrative replacement volume to
  correct at a safe rate (≤ 10–12 mmol/L per 24 h, stated as a guardrail).
- **Output:** the **free-water deficit (L)** naming the TBW fraction used, with
  the **safe-correction-rate caution** prominent (over-rapid correction of
  chronic hypernatremia risks cerebral edema). Class A. Cross-links the sodium-
  correction and maintenance-fluid tiles.

## 3. Per-tile robustness

- **Every compute routes through `lib/num.js` and is finite-/positive-guarded.**
  `rumack-matthew` evaluates its log-linear line only for 4 ≤ t ≤ 24 h and a
  positive level; `ttkg` guards both ratios (serum K⁺ > 0, serum osm > 0) and
  refuses to report when urine osm < serum osm; `free-water-deficit` guards TBW
  and the 140 denominator; outside these the tile renders a complete-the-fields
  fallback, never a `NaN`/`Infinity`.
- **`rumack-matthew` and `kings-college-criteria` carry their scope limits in the
  output, not just the help text** — the nomogram's single-ingestion 4–24 h
  window and the criteria's "referral, not listing" framing are part of the
  rendered result, so the number is never read out of context
  ([spec-v59](spec-v59.md) output-safety).
- **`free-water-deficit` renders the ≤ 10–12 mmol/L/24 h correction-rate
  guardrail as a first-class caution**, so a deficit volume is never presented as
  a bolus to give.
- **All five flow through the [spec-v59](spec-v59.md) fuzz harness with zero
  non-finite leaks**, fuzzed at the threshold and divisor edges.
- **These compute and classify; they are not orders.** Every tile renders the
  [spec-v50](spec-v50.md) §3 posture note and routes the user to poison control,
  the transplant center, or local protocol; none authors an antidote, a referral,
  or a correction order in Sophie's voice ([spec-v11](spec-v11.md) §5.3).

## 4. CI/CD & maintenance

- **Maintenance classes (§6.3):** all five are **Class A** — fixed nomogram lines /
  criteria sets / formulas, each cited by journal + authors. No society
  *issuer* is named as the guideline owner (the criteria are journal-published);
  the implementing session confirms the `ISSUER_PATTERN` result at build time and
  adds a `docs/citation-staleness.md` row only if one matches.
- **Build & gates (§6.1/§6.2):** the five computes live in a new
  `lib/acutecare-v187.js` module, added to `test/unit/fuzz-tools.test.js`
  `MODULES`. Renderers live in a new `views/group-v187.js`; its `RV187` export is
  spread into the `app.js` `RENDERERS` map. Every input carries a real
  `<label for>`. The catalog count moves on all **13 catalog-truth surfaces**
  using the **live `UTILITIES.length` + 5**; a11y, `mobile-no-hscroll`,
  `mobile-touch-targets`, and the chromium `example-correctness` sweep pass.
- **Specialties** are drawn from the closed vocabulary: `toxicology`,
  `poison-control`, `emergency-medicine`, `hepatology`, `transplant`,
  `critical-care`, `nephrology`, `internal-medicine`, `primary-care`,
  `family-medicine`, `otolaryngology` — all already in the vocabulary.
- **Program close:** v187 closes the **Advanced Bedside Quantitation** program
  (v185–v187, nominal +15). `docs/scope-advanced-quantitation.md` records the
  v187 delta and the program total against the live count.

## 5. Files touched

```
docs/spec-v187.md                        (this file)
app.js                                   (+5 UTILITIES rows; import group-v187 RV187 into RENDERERS)
lib/acutecare-v187.js                    (new: rumackMatthew, kingsCollegeCriteria, ttkg, centorMcisaac, freeWaterDeficit)
lib/meta.js                              (+5 META entries: inline citation + citationUrl + accessed; cross-links to maddrey-lille, meld-3.0, the sodium-correction tiles)
views/group-v187.js                      (new renderer module: 5 renderers)
docs/clinical-citations.md               (+5 rows)
test/unit/rumack-matthew.test.js, kings-college-criteria.test.js, ttkg.test.js, centor-mcisaac.test.js, free-water-deficit.test.js  (>=3 worked examples each)
test/unit/fuzz-tools.test.js             (add lib/acutecare-v187.js to MODULES)
docs/audits/v12/*.md                     (5 spec-v11 audit logs)
docs/scope-advanced-quantitation.md      (record the v187 delta; mark the program complete)
CHANGELOG.md, README.md, package.json    (catalog count live -> live+5; spec-progression line)
```

## 6. Acceptance criteria

v187 is fully shipped when:

- The implementing session has **re-run the [spec-v85 §6.2](spec-v85.md) collision
  check** and confirmed all five ids are absent.
- All 5 tiles in §2 are live (Class A) with a `META[id]` entry, an inline primary
  citation + `citationUrl` + `accessed`, and ≥ 3 worked examples each — including
  a **Rumack-Matthew level crossing the treatment line at a given hour**, a
  **King's College acetaminophen-vs-non-acetaminophen criteria pair**, a **TTKG
  in the hyper- and hypokalemia interpretive bands**, a **Centor/McIsaac score
  with the age adjustment changing the band**, and a **free-water deficit with
  the elderly TBW fraction**.
- Every compute is finite/positive-guarded, carries its scope limit in the
  rendered output, routes through `lib/num.js`, and is covered by the
  [spec-v59](spec-v59.md) fuzz harness with **zero non-finite leaks**.
- `UTILITIES.length` is **live + 5** and all catalog-truth surfaces agree;
  `docs/scope-advanced-quantitation.md` marks the v185–v187 program complete.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass;
  the CHANGELOG records v187 with the +5 delta.

## 7. Out of scope for v187

- **No automatic antidote or NAC order** — `rumack-matthew` reports the line
  relationship and routes to poison control; it does not order N-acetylcysteine
  ([spec-v11](spec-v11.md) §5.3).
- **No transplant listing** — `kings-college-criteria` indicates *referral /
  evaluation*, never a listing or allocation decision.
- **No staggered / unknown-time acetaminophen** — the Rumack-Matthew nomogram is
  validated only for a single acute ingestion timed 4–24 h out; the tile states
  this and does not extrapolate.
- **No correction-fluid order** — `free-water-deficit` reports the deficit and the
  safe-rate guardrail; the replacement prescription stays with the clinician.
