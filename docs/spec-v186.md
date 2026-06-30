# spec-v186.md — Critical-care oxygenation, gas exchange & ARDS severity: A–a gradient, Berlin/global ARDS, oxygenation index, oxygen delivery, and the Fick cardiac output (+5 tiles)

> Status: **PROPOSED (2026-06-30).** Second feature spec of the
> **Advanced Bedside Quantitation** program ([spec-v185](spec-v185.md) §1.1),
> implementing the **oxygenation / gas-exchange / ARDS-severity** cluster. Adds
> **5** deterministic respiratory-physiology tools that fill a confirmed gap: the
> catalog carries `winters-formula`, `driving pressure + compliance`, the new MCP
> `dead-space`, and ABG interpretation, but it does not yet quantify
> **oxygenation and oxygen transport** — the A–a gradient, the Berlin/global
> ARDS severity strata, the oxygenation index, oxygen delivery/consumption, and a
> Fick cardiac output. None duplicates a live tile (A–a gradient, oxygenation
> index, oxygen delivery, and the Fick principle were all checked absent at
> draft).
>
> Catalog effect: **live `UTILITIES.length` + 5** — enforced by the catalog-truth
> gate ([spec-v46](spec-v46.md)) at build time; no number is copied here.
>
> Every prior spec remains in force. v186 adds no runtime network call and no AI;
> each tile obeys the [spec-v100](spec-v100.md) §2 doctrine and §6 CI/CD contract,
> passes the [spec-v29](spec-v29.md) §3 one-line test, ships its primary citation
> inline ([spec-v54](spec-v54.md)), inherits the [spec-v59](spec-v59.md)
> output-safety contract, renders the [spec-v50](spec-v50.md) §3 posture note, and
> honors [spec-v11](spec-v11.md) §5.3 (no ventilator/escalation order in Sophie's
> voice). **Every constant, severity cut-point, and barometric default is
> re-fetched and cross-verified against ≥2 independent sources at implementation**
> ([spec-v97](spec-v97.md)); uncertain values carry an explicit *(verify at
> implementation, [spec-v97](spec-v97.md))* tag.

## 1. Thesis

Oxygenation failure is the most common reason a patient reaches the ICU, and the
bedside team quantifies it with a small set of closed-form computations that the
catalog is missing. v186 ships them: the **alveolar–arterial gradient** (with the
age-expected value), the **Berlin ARDS severity** strata (and the 2023 global
S/F surrogate), the **oxygenation index** (and the SpO₂-based OSI for the
non-invasive case), **oxygen delivery and consumption** (the Fick oxygen
cascade), and a **Fick cardiac output**. Each is a transparent physiologic
equation — fully auditable, unit-tested at the band transitions, and framed as
decision support, never an order to intubate, prone, or escalate.

## 2. What v186 adds (5 tiles)

### 2.1 `aa-gradient` — Alveolar–Arterial Oxygen Gradient (+ age-expected)

- **Citation:** the alveolar gas equation, PAO₂ = FiO₂·(Patm − PH₂O) − PaCO₂/R;
  A–a = PAO₂ − PaO₂; age-expected A–a ≈ (age/4) + 4. West JB. *Respiratory
  Physiology: The Essentials.* (standard reference) and Mellemgaard K. The
  alveolar–arterial oxygen difference. *Acta Physiol Scand.* 1966;67:10-20.
- **citationUrl:** https://doi.org/10.1111/j.1748-1716.1966.tb03281.x
- **Group:** E (clinical math). **Specialties:** `critical-care`, `pulmonology`,
  `emergency-medicine`, `respiratory-therapy`.
- **Inputs:** PaO₂, PaCO₂, FiO₂ (fraction or %), age, and an optional barometric
  pressure (default 760 mmHg) and respiratory quotient (default 0.8); altitude/
  PH₂O defaults stated. Computes PAO₂, the **A–a gradient**, and the
  **age-expected A–a**.
- **Output:** the **A–a gradient (mmHg)** versus the age-expected value, naming
  PAO₂ and flagging an **elevated (widened) gradient** (shunt / V̇/Q̇ mismatch /
  diffusion) versus a normal gradient with hypoventilation. Class A. Cross-links
  `winters-formula` and the ABG tiles.

### 2.2 `berlin-ards` — ARDS Severity (Berlin 2012 + 2023 global S/F surrogate)

- **Citation:** ARDS Definition Task Force; Ranieri VM, Rubenfeld GD, Thompson
  BT, et al. Acute respiratory distress syndrome: the Berlin Definition. *JAMA.*
  2012;307(23):2526-2533. Global definition (S/F surrogate, HFNO): Matthay MA,
  Arabi YM, Arroliga AC, et al. A new global definition of ARDS. *Am J Respir
  Crit Care Med.* 2024;209(1):37-47.
- **citationUrl:** https://doi.org/10.1001/jama.2012.5669
- **Group:** G (clinical scoring & severity). **Specialties:** `critical-care`,
  `pulmonology`, `respiratory-therapy`.
- **Inputs:** PaO₂ (or SpO₂ for the surrogate), FiO₂, and PEEP/CPAP (the Berlin
  definition requires PEEP ≥ 5 cmH₂O). Computes the **P/F ratio** (or the
  **S/F ratio** when only SpO₂ is available, with SpO₂ ≤ 97% for validity) and
  assigns the severity stratum.
- **Output:** **mild / moderate / severe** by P/F (≤ 300 / ≤ 200 / ≤ 100 at
  PEEP ≥ 5) or the corresponding S/F bands *(S/F cut-points verified at
  implementation, [spec-v97](spec-v97.md))*, stating which ratio was used and the
  PEEP precondition. Class A — the implementing session confirms whether the
  global-definition society authorship trips `ISSUER_PATTERN` and adds a
  `docs/citation-staleness.md` row only if it does. Cross-links `aa-gradient` and
  `oxygenation-index`.

### 2.3 `oxygenation-index` — Oxygenation Index (OI) & Oxygen Saturation Index (OSI)

- **Citation:** Pediatric Acute Lung Injury Consensus Conference (PALICC).
  Pediatric acute respiratory distress syndrome: consensus recommendations.
  *Pediatr Crit Care Med.* 2015;16(5):428-439. OI = (FiO₂% × mean airway
  pressure × ... ) / PaO₂; OSI substitutes SpO₂.
- **citationUrl:** https://doi.org/10.1097/PCC.0000000000000350
- **Group:** E. **Specialties:** `pediatric-critical-care`, `critical-care`,
  `neonatology`, `respiratory-therapy`.
- **Inputs:** FiO₂ (%), mean airway pressure (cmH₂O), and PaO₂ (for OI) or SpO₂
  (for OSI). Computes **OI = (FiO₂ × MAP × 100) / PaO₂** and the **OSI** surrogate.
- **Output:** the **OI / OSI**, banded against the PALICC pediatric-ARDS severity
  strata *(strata verified at implementation, [spec-v97](spec-v97.md))*, stating
  which index was used. Class A. Cross-links the MCP `mean-airway-pressure` tile
  and `berlin-ards`.

### 2.4 `oxygen-delivery` — Oxygen Delivery, Consumption & Extraction (the Fick cascade)

- **Citation:** the oxygen-content and Fick relationships: CaO₂ = 1.34·Hb·SaO₂ +
  0.003·PaO₂; DO₂ = CO·CaO₂·10; VO₂ = CO·(CaO₂ − CvO₂)·10; O₂ER = VO₂/DO₂.
  Standard critical-care physiology (Nunn's Applied Respiratory Physiology;
  Vincent JL. *Crit Care.* 2008;12 Suppl 4:S2 review of the DO₂/VO₂ relationship).
- **citationUrl:** https://doi.org/10.1186/cc6948
- **Group:** E. **Specialties:** `critical-care`, `echocardiography`,
  `anesthesiology`, `respiratory-therapy`.
- **Inputs:** hemoglobin, SaO₂ and PaO₂ (arterial), SvO₂ and PvO₂ (mixed-venous,
  optional), and cardiac output (or cardiac index with BSA). Computes **CaO₂**,
  **CvO₂**, **DO₂ (and DO₂I)**, **VO₂ (and VO₂I)**, and the **oxygen extraction
  ratio**.
- **Output:** the oxygen-transport panel banded against the normal ranges
  (DO₂ ≈ 900–1100 mL/min, VO₂ ≈ 200–270 mL/min, O₂ER ≈ 0.20–0.30 *(verify at
  implementation, [spec-v97](spec-v97.md))*), flagging a high extraction ratio as
  a marker of delivery-dependent oxygen consumption. Class A. Cross-links the MCP
  `hemodynamic-suite` tile.

### 2.5 `fick-cardiac-output` — Cardiac Output by the Fick Principle

- **Citation:** Fick A. Über die Messung des Blutquantums in den Herzventrikeln.
  *Sitzungsber Phys Med Ges Würzburg.* 1870. Estimated-VO₂ form: LaFarge CG,
  Miettinen OS. The estimation of oxygen consumption. *Cardiovasc Res.*
  1970;4(1):23-30.
- **citationUrl:** https://doi.org/10.1093/cvr/4.1.23
- **Group:** E. **Specialties:** `cardiology`, `critical-care`,
  `echocardiography`, `pediatric-cardiology`.
- **Inputs:** VO₂ (measured, or estimated by the LaFarge equation from age / sex /
  heart rate), hemoglobin, and the arterial and mixed-venous O₂ saturations.
  Computes the arteriovenous O₂ content difference and **CO = VO₂ / (Ca−Cv)O₂ ×
  10**, with the cardiac index when BSA is supplied.
- **Output:** the **cardiac output (L/min)** and **cardiac index**, naming the
  arteriovenous O₂ difference, banded against the normal CI 2.5–4.0 L/min/m².
  Class A. Cross-links the MCP `hemodynamic-suite` and `oxygen-delivery`.

## 3. Per-tile robustness

- **Every compute routes through `lib/num.js` and is finite-/positive-guarded.**
  The A–a gradient, P/F, S/F, OI, O₂ content, extraction ratio, and the Fick
  cardiac output each guard their divisor (PaO₂, FiO₂, the arteriovenous O₂
  difference) so a zero or a blank renders a complete-the-fields fallback, never a
  divide-by-zero, a negative content, or a `NaN`.
- **`berlin-ards` enforces the PEEP ≥ 5 precondition and the SpO₂ ≤ 97% validity
  bound for the S/F surrogate**, stating when the surrogate is not interpretable
  rather than emitting a spurious band.
- **FiO₂ is normalized once** (a value ≤ 1 is treated as a fraction, > 1 as a
  percent) and clamped to (0, 1] before any multiply, so the oxygenation
  computations cannot be inflated by an ambiguous unit.
- **All five flow through the [spec-v59](spec-v59.md) fuzz harness with zero
  non-finite leaks**, fuzzed at the divisor edges (PaO₂ → 0, FiO₂ → 0, Ca−Cv → 0).
- **These quantify physiology; they are not orders.** Every tile renders the
  [spec-v50](spec-v50.md) §3 posture note and frames the result as the cited
  method's estimate; none authors an intubation, proning, or escalation order in
  Sophie's voice ([spec-v11](spec-v11.md) §5.3).

## 4. CI/CD & maintenance

- **Maintenance classes (§6.3):** all five are **Class A** physiologic formulas /
  consensus severity strata. The implementing session confirms whether the Berlin
  / global-ARDS / PALICC society authorship trips `ISSUER_PATTERN`
  ([spec-v92](spec-v92.md)/[spec-v94](spec-v94.md) lesson) at build time and adds a
  `docs/citation-staleness.md` row only if the live pattern matches.
- **Build & gates (§6.1/§6.2):** the five computes live in a new
  `lib/oxygenation-v186.js` module, added to `test/unit/fuzz-tools.test.js`
  `MODULES`. Renderers live in a new `views/group-v186.js`; its `RV186` export is
  spread into the `app.js` `RENDERERS` map. Every input carries a real
  `<label for>`. The catalog count moves on all **13 catalog-truth surfaces**
  using the **live `UTILITIES.length` + 5**; a11y, `mobile-no-hscroll`,
  `mobile-touch-targets`, and the chromium `example-correctness` sweep pass.
- **Specialties** are drawn from the closed vocabulary: `critical-care`,
  `pulmonology`, `respiratory-therapy`, `emergency-medicine`,
  `pediatric-critical-care`, `neonatology`, `cardiology`, `pediatric-cardiology`,
  `echocardiography`, `anesthesiology` — all already in the vocabulary.
- **MCP eligibility:** `lib/oxygenation-v186.js` is a clean future
  [spec-v183](spec-v183.md) MCP-wave candidate (flat numeric/enum inputs,
  round-tripping `META.example`, no DOM coupling).

## 5. Files touched

```
docs/spec-v186.md                        (this file)
app.js                                   (+5 UTILITIES rows; import group-v186 RV186 into RENDERERS)
lib/oxygenation-v186.js                  (new: aaGradient, berlinArds, oxygenationIndex, oxygenDelivery, fickCardiacOutput)
lib/meta.js                              (+5 META entries: inline citation + citationUrl + accessed; cross-links to winters-formula, mean-airway-pressure, hemodynamic-suite)
views/group-v186.js                      (new renderer module: 5 renderers)
docs/clinical-citations.md               (+5 rows)
test/unit/aa-gradient.test.js, berlin-ards.test.js, oxygenation-index.test.js, oxygen-delivery.test.js, fick-cardiac-output.test.js  (>=3 worked examples each)
test/unit/fuzz-tools.test.js             (add lib/oxygenation-v186.js to MODULES)
docs/audits/v12/*.md                     (5 spec-v11 audit logs)
docs/scope-advanced-quantitation.md      (record the v186 delta)
CHANGELOG.md, README.md, package.json    (catalog count live -> live+5; spec-progression line)
```

## 6. Acceptance criteria

v186 is fully shipped when:

- The implementing session has **re-run the [spec-v85 §6.2](spec-v85.md) collision
  check** and confirmed all five ids are absent.
- All 5 tiles in §2 are live (Class A) with a `META[id]` entry, an inline primary
  citation + `citationUrl` + `accessed`, and ≥ 3 worked examples each — including
  an **A–a gradient crossing the age-expected line**, a **Berlin P/F band flip
  (moderate ↔ severe) and an S/F surrogate example**, an **OI/OSI PALICC stratum
  crossing**, an **oxygen-delivery panel with a high extraction ratio**, and a
  **Fick cardiac output from estimated VO₂**.
- Every compute is finite/positive-guarded, normalizes FiO₂ once, routes through
  `lib/num.js`, and is covered by the [spec-v59](spec-v59.md) fuzz harness with
  **zero non-finite leaks**.
- `UTILITIES.length` is **live + 5** and all catalog-truth surfaces agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass;
  the CHANGELOG records v186 with the +5 delta.

## 7. Out of scope for v186

- **No ventilator-mode automation** — v186 quantifies oxygenation; it does not
  recommend a mode, a tidal volume, or a PEEP step ([spec-v11](spec-v11.md) §5.3).
- **No thermodilution-only outputs already shipped** — the existing
  `hemodynamic-suite` (thermodilution CO → CI/SVR/PVR) is complementary to the
  **Fick** cardiac output v186 adds and is cross-linked, not re-shipped.
- **No continuous SvO₂ trending or device integration** — the tiles compute from
  entered values; no runtime device feed (the no-network, no-AI invariant holds).
