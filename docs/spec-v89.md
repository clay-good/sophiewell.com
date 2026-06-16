# spec-v89.md — Rheumatology, hepatology & perioperative: DAS28, King's College criteria, ASA Physical Status, and the Surgical Apgar (+4 tiles)

> Status: **SHIPPED (2026-06-16).** Fourth and final feature spec of the
> [spec-v85](spec-v85.md) Advanced Clinical Calculators program. Adds **4**
> deterministic subspecialty calculators that open a whole missing surface
> (rheumatology) and complete the hepatology/perioperative cluster: the RA
> disease-activity score, the acetaminophen-ALF transplant-referral rule, the
> anesthesia physical-status classification, and the intraoperative outcome score.
> The catalog has zero rheumatology tiles, ships `acetaminophen-nomogram` but no
> transplant-referral rule, and ships `rcri`/`ariscat`/`apfel` but neither the
> baseline ASA class nor the intraoperative Surgical Apgar. None duplicates an
> existing tile.
>
> Catalog effect at v89 close: **375 + 4 = 379 tiles** — the program end state.
>
> Every prior spec (v4 through v88) remains in force. v89 adds no runtime network
> call and no AI; each tile obeys the [spec-v85](spec-v85.md) §2 doctrine, passes
> the [spec-v29](spec-v29.md) §3 one-line test, ships its primary citation inline
> ([spec-v54](spec-v54.md)), and inherits the [spec-v59](spec-v59.md) output-safety
> contract — with explicit domain guards on the square roots and logarithm in
> DAS28.

## 1. Thesis

Four published instruments span three subspecialties the catalog under-serves:

- **Rheumatology has no tile at all.** DAS28 (in its ESR and CRP forms) is the
  standard rheumatoid-arthritis disease-activity measure, with EULAR remission/low/
  moderate/high cutoffs that drive treat-to-target decisions. It is a clean formula
  over a tender-joint count, a swollen-joint count, an inflammatory marker, and a
  patient global VAS.

- **The acetaminophen overdose that progresses needs a transplant-referral rule.**
  The catalog flags the toxic acetaminophen level (`acetaminophen-nomogram`) and,
  with [spec-v86](spec-v86.md), the salicylate dialysis threshold — but not the
  King's College Criteria, the validated rule for *when to refer for transplant* in
  acetaminophen-induced acute liver failure.

- **Perioperative care wants both the baseline and the intraoperative score.** RCRI,
  ARISCAT, and Apfel ship; the ASA Physical Status classification (the single most-
  documented preoperative descriptor) and the Surgical Apgar Score (a 10-point
  intraoperative outcome predictor from blood loss and the lowest MAP and heart
  rate) do not.

Each is a published, deterministic instrument a physician already uses; v89 brings
them onto the page and closes the program.

## 2. What v89 adds (4 tiles)

### 2.1 `das28` — DAS28-ESR / DAS28-CRP (rheumatoid arthritis disease activity)

- **Citation:** Prevoo MLL, van 't Hof MA, Kuper HH, et al. Modified disease
  activity scores that include twenty-eight-joint counts. *Arthritis Rheum.*
  1995;38(1):44-48 (DAS28-ESR). DAS28-CRP — Wells G, Becker JC, Teng J, et al.
  Validation of the 28-joint Disease Activity Score (DAS28) and EULAR response
  criteria based on CRP. *Ann Rheum Dis.* 2009;68(6):954-960.
- **citationUrl:** https://doi.org/10.1002/art.1780380107
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `rheumatology`, `internal-medicine`, `nursing-floor`.
- **Inputs:** tender 28-joint count (TJC28, 0–28); swollen 28-joint count (SJC28,
  0–28); the inflammatory marker — **ESR** (mm/hr) **or** **CRP** (mg/L), with a
  form toggle; and patient global health VAS (0–100 mm).
- **Output:** the score for the selected form —
  **DAS28-ESR = 0.56·√TJC28 + 0.28·√SJC28 + 0.70·ln(ESR) + 0.014·GH**;
  **DAS28-CRP = 0.56·√TJC28 + 0.28·√SJC28 + 0.36·ln(CRP+1) + 0.014·GH + 0.96** —
  shown as a derivation, with the **EULAR disease-activity band**: remission
  < 2.6, low activity ≤ 3.2, moderate activity ≤ 5.1, high activity > 5.1. The EULAR
  cutoffs are revisable → `docs/citation-staleness.md` row.

### 2.2 `kings-college` — King's College Criteria (acetaminophen-induced acute liver failure)

- **Citation:** O'Grady JG, Alexander GJM, Hayllar KM, Williams R. Early indicators
  of prognosis in fulminant hepatic failure. *Gastroenterology.* 1989;97(2):439-445.
  Lactate modification: Bernal W, Donaldson N, Wyncoll D, Wendon J. Blood lactate as
  an early predictor of outcome in paracetamol-induced acute liver failure. *Lancet.*
  2002;359(9306):558-563.
- **citationUrl:** https://doi.org/10.1016/0016-5085(89)90081-4
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `hepatology`, `critical-care`, `transplant`,
  `emergency-medicine`, `toxicology`.
- **Inputs (acetaminophen pathway):** arterial pH (after fluid resuscitation);
  arterial lactate (mmol/L, for the modified criterion); INR (or PT in seconds);
  serum creatinine (mg/dL or µmol/L); and grade III/IV hepatic encephalopathy
  (yes/no).
- **Output:** **meets King's College Criteria** (poor prognosis → list/refer for
  transplant) when **either** arterial pH < 7.30 after adequate fluid resuscitation,
  **or** all three of INR > 6.5 (PT > 100 s) **and** creatinine > 3.4 mg/dL
  (> 300 µmol/L) **and** grade III/IV encephalopathy are present; the **modified**
  criterion (arterial lactate > 3.5 mmol/L early, or > 3.0 after resuscitation) is
  surfaced as the Bernal addition. The output names which limb met and states this
  is the **acetaminophen** pathway (the non-acetaminophen criteria differ and are
  out of scope, §6). Cross-links `acetaminophen-nomogram`, `meld-childpugh`.

### 2.3 `asa-ps` — ASA Physical Status Classification

- **Citation:** American Society of Anesthesiologists. ASA Physical Status
  Classification System (Committee on Economics; current version last amended
  December 13, 2020, with approved examples).
- **citationUrl:** https://www.asahq.org/standards-and-practice-parameters/statement-on-asa-physical-status-classification-system
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `anesthesiology`, `surgery`, `periop`, `nursing-periop`.
- **Inputs:** a guided selection of the patient descriptor that best fits — **I**
  (normal healthy), **II** (mild systemic disease), **III** (severe systemic disease,
  not a constant threat to life), **IV** (severe systemic disease that is a constant
  threat to life), **V** (moribund, not expected to survive without the operation),
  **VI** (declared brain-dead, organ donor) — with the ASA's published example
  conditions shown for each tier; plus the **emergency (E) modifier** toggle (a
  delay in treatment would lead to a significant increase in the threat to life or
  body part).
- **Output:** the **ASA class (I–VI), with the E modifier appended** where selected
  (e.g. "ASA III-E"), and the ASA's published definition and example descriptors for
  the chosen tier. The computation is the descriptor→class mapping and the E-modifier
  application (E is not assignable to I or VI; the tile enforces that). The result
  notes that ASA-PS describes preoperative physical status and is not, by itself, a
  predictor of operative risk. ASA definitions are revisable →
  `docs/citation-staleness.md` row.

### 2.4 `surgical-apgar` — Surgical Apgar Score

- **Citation:** Gawande AA, Kwaan MR, Regenbogen SE, Lipsitz SA, Zinner MJ. An Apgar
  score for surgery. *J Am Coll Surg.* 2007;204(2):201-208. Validation: Regenbogen
  SE, et al. *Arch Surg.* 2009;144(1):30-36.
- **citationUrl:** https://doi.org/10.1016/j.jamcollsurg.2006.11.011
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `surgery`, `anesthesiology`, `critical-care`, `nursing-periop`.
- **Inputs:** estimated intraoperative blood loss (mL); lowest intraoperative mean
  arterial pressure (mmHg); lowest intraoperative heart rate (bpm).
- **Output:** the **0–10 score** from the three point bands —
  estimated blood loss (≤ 100 mL = 3; 101–600 = 2; 601–1000 = 1; > 1000 = 0);
  lowest MAP (≥ 70 = 3; 55–69 = 2; 40–54 = 1; < 40 = 0);
  lowest heart rate (≤ 55 = 4; 56–65 = 3; 66–75 = 2; 76–85 = 1; > 85 = 0) —
  shown as a derivation, with the major-complication/death risk band (≤ 4 = high
  risk; the published gradient runs from ~4% at 9–10 to ~14–58% at ≤ 4). Distinct
  from the neonatal `apgar` tile already shipped (same name lineage, different
  instrument) — the output states the distinction.

## 3. Per-tile robustness

- **`das28` guards its transcendental terms.** √TJC and √SJC are over clamped 0–28
  counts (never negative); ln(ESR) requires ESR > 0 and ln(CRP+1) is defined for
  CRP ≥ 0, so the logarithm domain is safe; a blank marker or VAS renders a
  "(enter ESR/CRP and patient global)" fallback rather than a `NaN`. The two forms
  are not interchangeable and the output labels which was computed.
- **`kings-college` is boolean/threshold logic** with unit-aware creatinine and
  INR/PT inputs; it surfaces the limb that met and refuses a verdict on the
  three-part limb unless all three components are entered (a partial three-part limb
  is shown as "incomplete," never a false negative).
- **`asa-ps` and `surgical-apgar` are bounded selectors/sums.** ASA enforces the
  E-modifier rules (no E on I or VI); the Surgical Apgar sums three bounded point
  bands (max 10) and clamps each input to its band edges. Both flow through the
  [spec-v59](spec-v59.md) fuzz harness to confirm no `undefined` reaches the DOM.
- All four render the [spec-v50](spec-v50.md) §3 clinical posture note and quote the
  source's band/definition; none authors a treatment recommendation in Sophie's
  voice ([spec-v11](spec-v11.md) §5.3).

## 4. Files touched

```
docs/spec-v89.md                         (this file)
app.js                                   (+4 UTILITIES rows, group G; import group-v15 renderers into RENDERERS)
lib/rheum-periop-v89.js                  (new module: das28, kingsCollege, asaPs, surgicalApgar)
lib/meta.js                              (+4 META entries: inline citation + citationUrl + accessed; cross-links to acetaminophen-nomogram, meld-childpugh, rcri, ariscat, apgar)
views/group-v15.js                       (new renderer module: 4 renderers; DAS28 form toggle + derivation, King's College criteria limbs, ASA guided selector, Surgical Apgar point grid)
docs/citation-staleness.md               (+ rows: EULAR DAS28 cutoffs, ASA Physical Status 2020 definitions)
docs/clinical-citations.md               (+ rows for the four sources)
test/unit/das28.test.js                  (new; ≥3 worked examples incl. both ESR/CRP forms and a EULAR band-flip)
test/unit/kings-college.test.js          (new; ≥3 incl. the pH limb, the three-part limb, and the incomplete-limb guard)
test/unit/asa-ps.test.js                 (new; ≥3 incl. the E-modifier rules and the no-E-on-I/VI enforcement)
test/unit/surgical-apgar.test.js         (new; ≥3 incl. the band edges and the ≤4 high-risk flag)
test/unit/fuzz-tools.test.js             (add lib/rheum-periop-v89.js to MODULES)
docs/audits/v12/das28.md, kings-college.md, asa-ps.md, surgical-apgar.md  (spec-v11 audit logs)
docs/scope-mdcalc-parity.md              (catalog count 375 -> 379; close the spec-v85 program in the running ledger)
CHANGELOG.md                             (Unreleased: v89 entry, +4)
README.md, package.json                  (catalog count 375 -> 379; spec-progression line -> v89)
```

## 5. Acceptance criteria

v89 is fully shipped when:

- All 4 tiles in §2 are live in Group G with a `META[id]` entry, an inline primary
  citation + `citationUrl` + `accessed`, ≥3 boundary worked examples in the unit
  test (including the DAS28 band-flip, both King's College limbs, the ASA E-modifier
  rules, and the Surgical Apgar band edges), a [spec-v11](spec-v11.md) audit log, and
  a passing [spec-v29](spec-v29.md) §3 scope check.
- `das28` reproduces a published worked example within 0.5% for both the ESR and CRP
  forms, applies the EULAR remission/low/moderate/high bands, and guards the
  logarithm domain.
- `kings-college` flags the pH < 7.30 limb, the complete three-part limb, and the
  lactate modification, and refuses a verdict on an incomplete three-part limb.
- `asa-ps` returns the class with the E modifier where valid and blocks E on I/VI;
  `surgical-apgar` returns the 0–10 sum from the three bands and flags ≤ 4.
- Every compute function uses `lib/num.js`, guards its domains, and is covered by the
  [spec-v59](spec-v59.md) fuzz harness with zero non-finite leaks.
- The revisable thresholds (EULAR, ASA) carry `accessed` + a
  `docs/citation-staleness.md` row.
- `UTILITIES.length` is **379** and all catalog-truth surfaces
  ([spec-v46](spec-v46.md)) agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass.
- The CHANGELOG records v89 with the +4 catalog delta, and `scope-mdcalc-parity.md`
  records the [spec-v85](spec-v85.md) program as complete (366 → 379, +13).

## 6. Out of scope for v89

- **No non-acetaminophen King's College pathway.** The non-acetaminophen criteria
  (INR > 6.5 alone, or any three of five etiology/age/bilirubin/INR/jaundice-interval
  factors) are a separate decision rule; `kings-college` ships the acetaminophen
  pathway, which is the one the catalog's `acetaminophen-nomogram` patient needs, and
  states the limitation.
- **No other RA activity indices in this spec.** CDAI, SDAI, and the ACR response
  criteria are deferred; `das28` is the standard treat-to-target measure and the
  natural first rheumatology tile.
- **No operative-risk prediction from ASA class.** `asa-ps` classifies physical
  status per the ASA definitions; it does not compute a mortality/morbidity
  percentage (the `rcri`, `ariscat`, and a future Gupta-MICA tile cover periop risk
  prediction).
- **No auto-disposition or transplant listing.** Each tile reports the score/class
  and the source's stated interpretation; the treat-to-target escalation, the
  transplant referral, and the operative decision stay with the clinician and local
  protocol.
