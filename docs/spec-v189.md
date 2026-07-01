# spec-v189.md — Perioperative & procedural dosing safety: local-anesthetic maximum dose, maximum allowable blood loss, Apfel PONV risk, and Janmahasatian lean body weight (+4 tiles)

> Status: **PROPOSED (2026-06-30).** Second feature spec of the
> **Acute, Perioperative & Diagnostic Quantitation** program
> ([spec-v188](spec-v188.md) §1.1), implementing the **perioperative dosing-safety**
> cluster. Adds **4** deterministic tools that fill a confirmed gap: the catalog
> carries airway-risk scores (Mallampati, El-Ganzouri) and the IBW/AdjBW/BSA
> suite, but not the local-anesthetic ceiling dose, the allowable blood loss, the
> PONV risk score, or the lean body weight used to dose anesthetics. None
> duplicates a live tile (all four were checked absent at draft; the existing
> body-weight suite ships IBW/AdjBW/BSA but not the Janmahasatian lean body weight).
>
> Catalog effect: **live `UTILITIES.length` + 4** — enforced by the catalog-truth
> gate ([spec-v46](spec-v46.md)) at build time; no number is copied here.
>
> Every prior spec remains in force. v189 adds no runtime network call and no AI;
> each tile obeys the [spec-v100](spec-v100.md) §2 doctrine, passes the
> [spec-v29](spec-v29.md) §3 one-line test, ships its citation inline
> ([spec-v54](spec-v54.md)), inherits the [spec-v59](spec-v59.md) output-safety
> contract, renders the [spec-v50](spec-v50.md) §3 posture note, and honors
> [spec-v11](spec-v11.md) §5.3 (**no dose order in Sophie's voice**). **Every
> per-agent milligram-per-kilogram ceiling, blood-volume constant, and PONV point
> is re-fetched and cross-verified against ≥2 independent sources at
> implementation** ([spec-v97](spec-v97.md)); uncertain values carry an explicit
> *(verify at implementation, [spec-v97](spec-v97.md))* tag.

## 1. Thesis

Perioperative safety turns on a few ceiling calculations that the catalog is
missing: the maximum local-anesthetic dose (the number that prevents local
anesthetic systemic toxicity), the blood loss a patient can tolerate before
transfusion, the PONV risk that drives prophylaxis, and the lean body weight that
anesthetic dosing is scaled to. v189 ships these four — each a transparent
weight-based or point computation, framed as a ceiling / risk estimate and never
an order.

## 2. What v189 adds (4 tiles)

### 2.1 `local-anesthetic-max` — Maximum Local-Anesthetic Dose

- **Citation:** Neal JM, Barrington MJ, Fettiplace MR, et al. The Third American
  Society of Regional Anesthesia and Pain Medicine Practice Advisory on Local
  Anesthetic Systemic Toxicity. *Reg Anesth Pain Med.* 2018;43(2):113-123. Per-agent
  ceilings from the standard references (lidocaine 4.5 mg/kg plain / 7 mg/kg with
  epinephrine; bupivacaine 2.5–3 mg/kg; ropivacaine 3 mg/kg *(verify each ceiling
  at implementation, [spec-v97](spec-v97.md))*).
- **citationUrl:** https://doi.org/10.1097/AAP.0000000000000720
- **Group:** F (specialized dosing). **Specialties:** `anesthesiology`,
  `emergency-medicine`, `surgery-general`, `pharmacy`.
- **Inputs:** agent (lidocaine / bupivacaine / ropivacaine / mepivacaine), an
  epinephrine-containing toggle where it changes the ceiling, weight (kg), and the
  solution concentration (%). Computes the **maximum dose (mg)** and the
  **maximum volume (mL)** at that concentration (mg per mL = 10 × %).
- **Output:** the **maximum dose (mg)** and **volume (mL)** for the selected agent,
  naming the mg/kg ceiling used and stating that the ceiling is an upper bound, not
  a target. Class A. Cross-links `lean-body-weight`.

### 2.2 `mabl` — Maximum Allowable Blood Loss

- **Citation:** Gross JB. Estimating allowable blood loss: corrected for dilution.
  *Anesthesiology.* 1983;58(3):277-280.
- **citationUrl:** https://doi.org/10.1097/00000542-198303000-00016
- **Group:** E (clinical math). **Specialties:** `anesthesiology`,
  `surgery-general`, `critical-care`.
- **Inputs:** weight, an estimated-blood-volume factor by patient category
  (neonate/infant/child/adult male/adult female, each with its mL/kg constant),
  the starting hematocrit (or hemoglobin), and the lowest acceptable hematocrit.
  Computes **EBV = weight × the category constant** and **MABL = EBV × (Hi − Hf) /
  Hi** (with the Gross average-Hct refinement noted).
- **Output:** the **estimated blood volume** and the **maximum allowable blood
  loss (mL)**, naming the category constant used, framed as a planning estimate.
  Class A. Cross-links the BSA / body-weight suite.

### 2.3 `apfel-ponv` — Apfel Simplified PONV Risk Score

- **Citation:** Apfel CC, Läärä E, Koivuranta M, Greim CA, Roewer N. A simplified
  risk score for predicting postoperative nausea and vomiting: conclusions from
  cross-validations between two centers. *Anesthesiology.* 1999;91(3):693-700.
- **citationUrl:** https://doi.org/10.1097/00000542-199909000-00022
- **Group:** G (clinical scoring & risk). **Specialties:** `anesthesiology`,
  `nursing-periop`, `surgery-general`.
- **Inputs:** the four risk factors, each 1 point — female sex, non-smoker,
  history of PONV or motion sickness, and expected postoperative opioid use.
- **Output:** the **score (0–4)** mapped to the published ~10 / 21 / 39 / 61 / 79%
  PONV risk bands *(verify the band percentages at implementation,
  [spec-v97](spec-v97.md))*, naming the factors, framed as risk stratification for
  prophylaxis decisions. Class A. Cross-links the periop risk tiles.

### 2.4 `lean-body-weight` — Lean Body Weight (Janmahasatian)

- **Citation:** Janmahasatian S, Duffull SB, Ash S, Ward LC, Byrne NM, Green B.
  Quantification of lean bodyweight. *Clin Pharmacokinet.* 2005;44(10):1051-1065.
- **citationUrl:** https://doi.org/10.2165/00003088-200544100-00004
- **Group:** E. **Specialties:** `anesthesiology`, `pharmacy`, `critical-care`.
- **Inputs:** sex, total body weight (kg), and height (for BMI). Computes the
  **Janmahasatian lean body weight** by the sex-specific equation
  (LBW = 9270·TBW / (6680 + 216·BMI) for men; 9270·TBW / (8780 + 244·BMI) for
  women *(verify constants at implementation, [spec-v97](spec-v97.md))*).
- **Output:** the **lean body weight (kg)**, contrasted with total and ideal body
  weight, naming that many anesthetic induction agents are scaled to LBW. Class A.
  Cross-links the IBW/AdjBW/BSA suite and `local-anesthetic-max`.

## 3. Per-tile robustness

- **Every compute routes through `lib/num.js` and is finite-/positive-guarded.**
  `local-anesthetic-max` guards weight > 0 and concentration > 0 before the mg→mL
  divide; `mabl` guards Hi > 0 and Hi > Hf; `lean-body-weight` guards the BMI
  denominator; outside these each tile renders a complete-the-fields fallback,
  never a `NaN`/`Infinity`.
- **`local-anesthetic-max` renders the ceiling as an upper bound with the
  systemic-toxicity caveat**, so the maximum is never read as a recommended dose
  ([spec-v59](spec-v59.md) output-safety).
- **All four flow through the [spec-v59](spec-v59.md) fuzz harness with zero
  non-finite leaks**, fuzzed at the concentration, hematocrit, and BMI edges.
- **These compute ceilings and risks; they are not orders.** Every tile renders
  the [spec-v50](spec-v50.md) §3 posture note; none authors a dose in Sophie's
  voice ([spec-v11](spec-v11.md) §5.3).

## 4. CI/CD & maintenance

- **Maintenance classes (§6.3):** all four are **Class A**. The ASRA LAST advisory
  names a society (ASRA); the implementing session confirms whether that trips
  `ISSUER_PATTERN` at build time and adds a `docs/citation-staleness.md` row only
  if the live pattern matches.
- **Build & gates (§6.1/§6.2):** the four computes live in a new
  `lib/periop-v189.js` module, added to `test/unit/fuzz-tools.test.js` `MODULES`.
  Renderers live in a new `views/group-v189.js`; its `RV189` export is spread into
  the `app.js` `RENDERERS` map. Every input carries a real `<label for>`. The
  catalog count moves on all **13 catalog-truth surfaces** using the **live
  `UTILITIES.length` + 4**; a11y, `mobile-no-hscroll`, `mobile-touch-targets`, and
  the chromium `example-correctness` sweep pass.
- **Specialties** are drawn from the closed vocabulary: `anesthesiology`,
  `emergency-medicine`, `surgery-general`, `pharmacy`, `critical-care`,
  `nursing-periop` — all already in the vocabulary.

## 5. Files touched

```
docs/spec-v189.md                        (this file)
app.js                                   (+4 UTILITIES rows; import group-v189 RV189 into RENDERERS)
lib/periop-v189.js                       (new: localAnestheticMax, mabl, apfelPonv, leanBodyWeight)
lib/meta.js                              (+4 META entries: inline citation + citationUrl + accessed; cross-links)
views/group-v189.js                      (new renderer module: 4 renderers)
docs/clinical-citations.md               (+4 rows)
test/unit/local-anesthetic-max.test.js, mabl.test.js, apfel-ponv.test.js, lean-body-weight.test.js  (>=3 worked examples each)
test/unit/fuzz-tools.test.js             (add lib/periop-v189.js to MODULES)
docs/audits/v12/*.md                     (4 spec-v11 audit logs)
docs/scope-acute-periop-quantitation.md  (record the v189 delta)
CHANGELOG.md, README.md, package.json    (catalog count live -> live+4; spec-progression line)
```

## 6. Acceptance criteria

v189 is fully shipped when:

- The implementing session has **re-run the [spec-v85 §6.2](spec-v85.md) collision
  check** and confirmed all four ids are absent.
- All 4 tiles in §2 are live (Class A) with a `META[id]` entry, inline citation +
  `citationUrl` + `accessed`, and ≥ 3 worked examples each — including a
  **local-anesthetic max dose + volume for a plain-vs-epinephrine pair**, a
  **MABL across two patient categories**, an **Apfel score band crossing**, and a
  **male-vs-female lean body weight**.
- Every compute is finite/positive-guarded, routes through `lib/num.js`, and is
  covered by the [spec-v59](spec-v59.md) fuzz harness with **zero non-finite leaks**.
- `UTILITIES.length` is **live + 4** and all catalog-truth surfaces agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass;
  the CHANGELOG records v189 with the +4 delta.

## 7. Out of scope for v189

- **No infusion / block order** — the tiles compute ceilings and risks; the block,
  the transfusion trigger, and the antiemetic prescription stay with the clinician
  ([spec-v11](spec-v11.md) §5.3).
- **No lipid-emulsion rescue dosing in this tile** — `local-anesthetic-max`
  computes the prevention ceiling; LAST treatment dosing is a separate concern.
- **No duplication of the body-weight suite** — the existing IBW/AdjBW/BSA suite is
  complementary to the Janmahasatian **lean** body weight and is cross-linked, not
  re-shipped.
