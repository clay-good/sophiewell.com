# spec-v191.md — Cardiac & echo hemodynamics with anticoagulation bleeding risk: Gorlin valve area, Qp/Qs shunt ratio, HAS-BLED, and Doppler stroke volume / cardiac output (+4 tiles)

> Status: **PROPOSED (2026-06-30).** Fourth and **closing** feature spec of the
> **Acute, Perioperative & Diagnostic Quantitation** program
> ([spec-v188](spec-v188.md) §1.1), implementing the **cardiac / echo hemodynamics
> + bleeding-risk** cluster. Adds **4** deterministic tools that fill confirmed
> gaps: the catalog carries the continuity-equation aortic valve area, the
> thermodilution hemodynamic suite, CHA₂DS₂-VASc / ATRIA / ORBIT, and Duke
> treadmill, but not the Gorlin catheter valve area, the shunt ratio, the HAS-BLED
> bleeding score, or the Doppler (LVOT-VTI) stroke volume. None duplicates a live
> tile (all four checked absent at draft).
>
> Catalog effect: **live `UTILITIES.length` + 4** — enforced by the catalog-truth
> gate ([spec-v46](spec-v46.md)) at build time; no number is copied here.
>
> Every prior spec remains in force. v191 adds no runtime network call and no AI;
> each tile obeys the [spec-v100](spec-v100.md) §2 doctrine, passes the
> [spec-v29](spec-v29.md) §3 one-line test, ships its citation inline
> ([spec-v54](spec-v54.md)), inherits the [spec-v59](spec-v59.md) output-safety
> contract, renders the [spec-v50](spec-v50.md) §3 posture note, and honors
> [spec-v11](spec-v11.md) §5.3 (**no anticoagulation or intervention order in
> Sophie's voice**). **Every constant, coefficient, and point weight is re-fetched
> and cross-verified against ≥2 independent sources at implementation**
> ([spec-v97](spec-v97.md)); uncertain values carry an explicit *(verify at
> implementation, [spec-v97](spec-v97.md))* tag.

## 1. Thesis

The cath lab and the echo lab quantify valve and shunt hemodynamics with a small
set of closed-form equations the catalog is missing, and the anticoagulation
decision pairs a stroke-risk score (already present) with a bleeding-risk score
(absent). v191 ships the Gorlin valve area, the Qp/Qs shunt ratio, HAS-BLED, and
the Doppler stroke volume / cardiac output. Each is a transparent physiologic or
point computation — auditable, unit-tested at its band edges — and each is
decision support, **never an order to anticoagulate, intervene, or operate**.

## 2. What v191 adds (4 tiles)

### 2.1 `gorlin` — Gorlin Valve-Area Equation

- **Citation:** Gorlin R, Gorlin SG. Hydraulic formula for the calculation of the
  area of the stenotic mitral valve, other cardiac valves, and central circulatory
  shunts. *Am Heart J.* 1951;41(1):1-29.
- **citationUrl:** https://doi.org/10.1016/0002-8703(51)90002-6
- **Group:** E (clinical math). **Specialties:** `cardiology`,
  `interventional-radiology`, `echocardiography`, `critical-care`.
- **Inputs:** cardiac output, heart rate, the systolic (for aortic) or diastolic
  (for mitral) filling period, the mean pressure gradient, and the valve type (the
  Gorlin constant is 44.3, with the mitral empirical factor). **Valve area =
  (CO / (period × HR)) / (constant × √mean gradient)** *(verify the constant and
  the aortic-vs-mitral period at implementation, [spec-v97](spec-v97.md))*.
- **Output:** the **valve area (cm²)** banded against the stenosis-severity strata
  (e.g., aortic severe < 1.0 cm²), naming the flow and gradient used. Class A.
  Cross-links `aortic-valve-area` (continuity method) and the hemodynamic suite.

### 2.2 `qp-qs` — Pulmonary-to-Systemic Flow Ratio (shunt)

- **Citation:** the Fick-based shunt ratio Qp/Qs = (SaO₂ − SvO₂) / (SpvO₂ − SpaO₂),
  the mixed-venous, pulmonary-vein, and pulmonary-artery saturations defining the
  step-up/step-down. Standard congenital-hemodynamics reference (Wilkinson JL.
  Haemodynamic calculations in the catheter laboratory. *Heart.* 2001;85(1):113-120).
- **citationUrl:** https://doi.org/10.1136/heart.85.1.113
- **Group:** E. **Specialties:** `pediatric-cardiology`, `cardiology`,
  `interventional-radiology`.
- **Inputs:** the aortic (systemic arterial) saturation, the mixed-venous
  saturation, the pulmonary-vein saturation (default 98%), and the pulmonary-artery
  saturation. Computes **Qp/Qs = (Ao − MV) / (PV − PA)**.
- **Output:** the **Qp/Qs ratio**, interpreted (≈ 1 no net shunt; > 1 net
  left-to-right; < 1 net right-to-left; the ~1.5–2.0 intervention-consideration
  band noted *(verify at implementation, [spec-v97](spec-v97.md))*), naming the
  saturations used. Class A. Cross-links `gorlin`.

### 2.3 `has-bled` — HAS-BLED Bleeding-Risk Score

- **Citation:** Pisters R, Lane DA, Nieuwlaat R, de Vos CB, Crijns HJGM, Lip GYH.
  A novel user-friendly score (HAS-BLED) to assess 1-year risk of major bleeding
  in patients with atrial fibrillation. *Chest.* 2010;138(5):1093-1100.
- **citationUrl:** https://doi.org/10.1378/chest.10-0134
- **Group:** G (clinical scoring & risk). **Specialties:** `cardiology`,
  `hematology`, `internal-medicine`, `primary-care`.
- **Inputs:** the HAS-BLED criteria, each 1 point — uncontrolled hypertension,
  abnormal renal function, abnormal liver function, prior stroke, prior major
  bleeding/predisposition, labile INR, elderly (> 65), drugs (antiplatelet/NSAID),
  and alcohol excess.
- **Output:** the **score (0–9)** mapped to the published ~1-year major-bleeding
  risk bands (≥ 3 = high risk warranting caution/review *(verify percentages at
  implementation, [spec-v97](spec-v97.md))*), naming the factors, framed as a
  bleeding-risk assessment to weigh against the stroke-risk score — **not** a
  reason to withhold anticoagulation on its own. Class A. Cross-links
  `cha2ds2-vasc` and `orbit`.

### 2.4 `lvot-stroke-volume` — Doppler Stroke Volume & Cardiac Output (LVOT-VTI)

- **Citation:** Lang RM, Badano LP, Mor-Avi V, et al. Recommendations for cardiac
  chamber quantification by echocardiography in adults (ASE/EACVI). *J Am Soc
  Echocardiogr.* 2015;28(1):1-39. Stroke volume = LVOT cross-sectional area ×
  LVOT velocity-time integral.
- **citationUrl:** https://doi.org/10.1016/j.echo.2014.10.003
- **Group:** E. **Specialties:** `echocardiography`, `cardiology`, `critical-care`.
- **Inputs:** the LVOT diameter (cm), the LVOT velocity-time integral (cm), and the
  heart rate. Computes the **LVOT area = π·(D/2)²**, the **stroke volume =
  area × VTI**, the **cardiac output = SV × HR / 1000**, and the stroke-volume
  index / cardiac index when BSA is supplied.
- **Output:** the **stroke volume (mL)** and **cardiac output (L/min)** (and the
  indexed values), naming the LVOT area, banded against the normal SV and CI
  ranges. Class A. Cross-links the thermodilution `hemodynamic-suite` and the Fick
  cardiac-output tile ([spec-v186](spec-v186.md)).

## 3. Per-tile robustness

- **Every compute routes through `lib/num.js` and is finite-/positive-guarded.**
  Gorlin guards the mean gradient > 0 before the square root and the flow period ×
  HR > 0; Qp/Qs guards the (PV − PA) denominator ≠ 0; `lvot-stroke-volume` guards
  the LVOT diameter > 0; outside these each tile renders a complete-the-fields
  fallback, never a `NaN`/`Infinity` or a negative area.
- **`qp-qs` refuses a zero or near-zero saturation denominator** (the step-up
  guard), the [spec-v59](spec-v59.md) contract on a difference-in-denominator ratio.
- **`has-bled` renders the "weigh against stroke risk, do not withhold on its own"
  framing as first-class output**, so a high bleeding score is never read as a
  standalone anticoagulation-stop order.
- **All four flow through the [spec-v59](spec-v59.md) fuzz harness with zero
  non-finite leaks**, fuzzed at the gradient, denominator, and diameter edges.
- **These quantify and stratify; they are not orders.** Every tile renders the
  [spec-v50](spec-v50.md) §3 posture note; none authors an anticoagulation,
  intervention, or operative order in Sophie's voice ([spec-v11](spec-v11.md) §5.3).

## 4. CI/CD & maintenance

- **Maintenance classes (§6.3):** all four are **Class A** — fixed physiologic
  formulas / a validated point score, each cited by journal + authors. The
  `lvot-stroke-volume` ASE/EACVI recommendation names societies; the implementing
  session confirms whether that trips `ISSUER_PATTERN` at build time and adds a
  `docs/citation-staleness.md` row only if the live pattern matches (the
  [spec-v158](spec-v158.md) echo tiles are the precedent — ASE did not trip it).
- **Build & gates (§6.1/§6.2):** the four computes live in a new
  `lib/cardiohemo-v191.js` module, added to `test/unit/fuzz-tools.test.js`
  `MODULES`. Renderers live in a new `views/group-v191.js`; its `RV191` export is
  spread into the `app.js` `RENDERERS` map. Every input carries a real
  `<label for>`. The catalog count moves on all **13 catalog-truth surfaces** using
  the **live `UTILITIES.length` + 4**; a11y, `mobile-no-hscroll`,
  `mobile-touch-targets`, and the chromium `example-correctness` sweep pass.
- **Specialties** are drawn from the closed vocabulary: `cardiology`,
  `pediatric-cardiology`, `echocardiography`, `interventional-radiology`,
  `critical-care`, `hematology`, `internal-medicine`, `primary-care` — all already
  in the vocabulary.
- **Program close:** v191 closes the **Acute, Perioperative & Diagnostic
  Quantitation** program (v188–v191, nominal +18).
  `docs/scope-acute-periop-quantitation.md` records the v191 delta and marks the
  program complete.

## 5. Files touched

```
docs/spec-v191.md                        (this file)
app.js                                   (+4 UTILITIES rows; import group-v191 RV191 into RENDERERS)
lib/cardiohemo-v191.js                    (new: gorlin, qpQs, hasBled, lvotStrokeVolume)
lib/meta.js                              (+4 META entries: inline citation + citationUrl + accessed; cross-links to aortic-valve-area, cha2ds2-vasc, hemodynamic-suite)
views/group-v191.js                      (new renderer module: 4 renderers)
docs/clinical-citations.md               (+4 rows)
test/unit/gorlin.test.js, qp-qs.test.js, has-bled.test.js, lvot-stroke-volume.test.js  (>=3 worked examples each)
test/unit/fuzz-tools.test.js             (add lib/cardiohemo-v191.js to MODULES)
docs/audits/v12/*.md                     (4 spec-v11 audit logs)
docs/scope-acute-periop-quantitation.md  (record the v191 delta; mark the program complete)
CHANGELOG.md, README.md, package.json    (catalog count live -> live+4; spec-progression line)
```

## 6. Acceptance criteria

v191 is fully shipped when:

- The implementing session has **re-run the [spec-v85 §6.2](spec-v85.md) collision
  check** and confirmed all four ids are absent.
- All 4 tiles in §2 are live (Class A) with a `META[id]` entry, inline citation +
  `citationUrl` + `accessed`, and ≥ 3 worked examples each — including a **Gorlin
  aortic-vs-mitral valve area**, a **Qp/Qs left-to-right shunt example**, a
  **HAS-BLED score crossing the high-risk (≥ 3) threshold**, and an **LVOT stroke
  volume + cardiac output**.
- Every compute is finite/positive-guarded (including the Gorlin square-root and
  the Qp/Qs denominator), routes through `lib/num.js`, and is covered by the
  [spec-v59](spec-v59.md) fuzz harness with **zero non-finite leaks**.
- `UTILITIES.length` is **live + 4** and all catalog-truth surfaces agree;
  `docs/scope-acute-periop-quantitation.md` marks the v188–v191 program complete.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass;
  the CHANGELOG records v191 with the +4 delta.

## 7. Out of scope for v191

- **No anticoagulation decision** — `has-bled` stratifies bleeding risk to weigh
  against stroke risk; the anticoagulation decision stays with the clinician and
  the patient ([spec-v11](spec-v11.md) §5.3).
- **No intervention or operative recommendation** — the valve-area and shunt tiles
  quantify hemodynamics; the intervention decision stays with the heart team.
- **No duplication of the continuity-equation or thermodilution tiles** — the
  existing `aortic-valve-area` (continuity) and `hemodynamic-suite` (thermodilution)
  are complementary to the **Gorlin** and **Doppler** methods v191 adds and are
  cross-linked, not re-shipped.
