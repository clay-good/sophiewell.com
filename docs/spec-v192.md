# spec-v192.md — Neurocritical care, coma & trauma triage: ABC/2 hemorrhage volume, ICH Score, FOUR Score, Canadian CT Head Rule, and the Revised Trauma Score (+5 tiles)

> Status: **PROPOSED (2026-06-30).** First feature spec of the new
> **Acute Triage & Specialty Severity** program (umbrella below, §1.1),
> implementing the **neurocritical / coma / trauma-triage** cluster. Adds **5**
> deterministic bedside instruments that fill a confirmed gap: the catalog carries
> the Glasgow Coma Scale, modified Rankin, Hunt-Hess, modified Fisher, and the
> Spetzler-Martin grade, but not the hemorrhage-volume estimate, the ICH mortality
> score, the FOUR coma score for intubated patients, the CT-head decision rule, or
> the physiologic trauma score. None duplicates a live tile (all five checked
> absent at draft).
>
> Catalog effect: **live `UTILITIES.length` + 5** — enforced by the catalog-truth
> gate ([spec-v46](spec-v46.md)) at build time; no number is copied here.
>
> Every prior spec remains in force. v192 adds no runtime network call and no AI;
> each tile obeys the [spec-v100](spec-v100.md) §2 doctrine (re-binding
> [spec-v85](spec-v85.md) §2) and the §6 CI/CD contract, passes the
> [spec-v29](spec-v29.md) §3 one-line test, ships its citation inline
> ([spec-v54](spec-v54.md)), inherits the [spec-v59](spec-v59.md) output-safety
> contract, renders the [spec-v50](spec-v50.md) §3 posture note, and honors
> [spec-v11](spec-v11.md) §5.3 (**no imaging, disposition, or goals-of-care order
> in Sophie's voice**). **Every point weight, volume constant, and mortality band
> is re-fetched and cross-verified against ≥2 independent sources at
> implementation** ([spec-v97](spec-v97.md)); uncertain values carry an explicit
> *(verify at implementation, [spec-v97](spec-v97.md))* tag.

### 1.1 Program umbrella — Acute Triage & Specialty Severity (v192–v195)

v192 opens a four-spec program closing the next band of advanced bedside gaps:
**v192** neurocritical / coma / trauma triage, **[spec-v193](spec-v193.md)** ID &
community-acquired-pneumonia severity, **[spec-v194](spec-v194.md)** neonatal &
pediatric acute assessment, and **[spec-v195](spec-v195.md)** cardiology /
hepatology / electrolyte bedside indices. The ledger is
[scope-acute-triage-severity.md](scope-acute-triage-severity.md).

## 1. Thesis

The neuro ICU and the trauma bay quantify a few high-consequence judgments with
fixed, fully-deterministic instruments the catalog is missing: how big the bleed
is (ABC/2), what its 30-day mortality is (ICH Score), how deep the coma is when
the patient is intubated and the GCS verbal score is unavailable (FOUR Score),
whether a head-injured patient needs a CT (Canadian CT Head Rule), and the
physiologic severity of a trauma (Revised Trauma Score). v192 ships these five.
Each is a transparent computation — auditable, unit-tested at every band — and
each is decision support, **never an order to image, admit, or withdraw care**.

## 2. What v192 adds (5 tiles)

### 2.1 `ich-volume` — Intracerebral Hemorrhage Volume (ABC/2)

- **Citation:** Kothari RU, Brott T, Broderick JP, et al. The ABCs of measuring
  intracerebral hemorrhage volumes. *Stroke.* 1996;27(8):1304-1305.
- **citationUrl:** https://doi.org/10.1161/01.str.27.8.1304
- **Group:** E (clinical math). **Specialties:** `neurocritical-care`, `neurology`,
  `neurosurgery`, `emergency-medicine`.
- **Inputs:** the three orthogonal CT diameters A, B (cm) and C (either the slice
  thickness × the number of slices with hemorrhage, or a measured craniocaudal
  diameter), plus the shape factor (÷ 2 for the ellipsoid ABC/2; the tile notes the
  ÷ 3 correction for irregular hematomas). **Volume = (A × B × C) / 2** (mL).
- **Output:** the **hemorrhage volume (mL)**, naming the shape factor used and the
  ≥ 30 mL threshold associated with worse prognosis. Class A. Cross-links
  `ich-score`.

### 2.2 `ich-score` — Hemphill ICH Score (30-day mortality)

- **Citation:** Hemphill JC 3rd, Bonovich DC, Besmertis L, Manley GT, Johnston SC.
  The ICH score: a simple, reliable grading scale for intracerebral hemorrhage.
  *Stroke.* 2001;32(4):891-897.
- **citationUrl:** https://doi.org/10.1161/01.str.32.4.891
- **Group:** G (clinical scoring & risk). **Specialties:** `neurocritical-care`,
  `neurology`, `neurosurgery`, `emergency-medicine`.
- **Inputs:** GCS (3–4 = 2, 5–12 = 1, 13–15 = 0), age ≥ 80 (1), infratentorial
  origin (1), ICH volume ≥ 30 mL (1), and intraventricular hemorrhage (1).
- **Output:** the **ICH Score (0–6)** mapped to the published 30-day mortality
  bands (0 ≈ 0%, rising to essentially 100% at 5–6 *(verify at implementation,
  [spec-v97](spec-v97.md))*), naming the components; explicitly framed as a
  prognostic estimate for the whole team, not a self-fulfilling
  withdrawal-of-care trigger ([spec-v11](spec-v11.md) §5.3). Class A. Cross-links
  `ich-volume`.

### 2.3 `four-score` — FOUR Score (Full Outline of UnResponsiveness)

- **Citation:** Wijdicks EFM, Bamlet WR, Maramattom BV, Manno EM, McClelland RL.
  Validation of a new coma scale: the FOUR score. *Ann Neurol.*
  2005;58(4):585-593.
- **citationUrl:** https://doi.org/10.1002/ana.20611
- **Group:** G. **Specialties:** `neurocritical-care`, `critical-care`,
  `neurology`, `emergency-medicine`.
- **Inputs:** the four components each 0–4 — eye response, motor response,
  brainstem reflexes, and respiration — selected from the anchored descriptors.
  Unlike the GCS, the FOUR does not require a verbal response, so it grades the
  intubated patient.
- **Output:** the **FOUR Score (0–16)** with each component, naming that a lower
  score reflects deeper coma / brainstem dysfunction and that the score works when
  the GCS verbal score cannot be obtained. Class A. Cross-links the GCS tile.

### 2.4 `canadian-ct-head` — Canadian CT Head Rule

- **Citation:** Stiell IG, Wells GA, Vandemheen K, et al. The Canadian CT Head Rule
  for patients with minor head injury. *Lancet.* 2001;357(9266):1391-1396.
- **citationUrl:** https://doi.org/10.1016/S0140-6736(00)04561-X
- **Group:** G. **Specialties:** `emergency-medicine`, `neurosurgery`,
  `family-medicine`.
- **Inputs:** the eligibility gate (minor head injury, GCS 13–15, witnessed loss of
  consciousness / amnesia / disorientation) and the five high-risk and two
  medium-risk criteria (GCS < 15 at 2 h, suspected open/depressed skull fracture,
  signs of basal skull fracture, ≥ 2 episodes of vomiting, age ≥ 65; retrograde
  amnesia ≥ 30 min, dangerous mechanism).
- **Output:** **CT indicated vs not** by the rule, naming which criteria fired and
  stating the rule's exclusions (anticoagulation, seizure, age < 16 *(verify the
  exclusions at implementation, [spec-v97](spec-v97.md))*). Class A. Cross-links
  the NEXUS / Ottawa decision tiles.

### 2.5 `rts` — Revised Trauma Score

- **Citation:** Champion HR, Sacco WJ, Copes WS, Gann DS, Gennarelli TA, Flanagan
  ME. A revision of the Trauma Score. *J Trauma.* 1989;29(5):623-629.
- **citationUrl:** https://doi.org/10.1097/00005373-198905000-00017
- **Group:** G. **Specialties:** `trauma-surgery`, `emergency-medicine`,
  `critical-care`, `ems`.
- **Inputs:** GCS, systolic blood pressure, and respiratory rate, each mapped to a
  coded value 0–4. The **triage RTS** = the unweighted sum (0–12); the
  **outcome/weighted RTS** = 0.9368·GCS_c + 0.7326·SBP_c + 0.2908·RR_c *(verify the
  coefficients at implementation, [spec-v97](spec-v97.md))*.
- **Output:** the **triage RTS (0–12)** and the **weighted RTS**, naming the coded
  components and the < 11 triage threshold suggesting transfer to a trauma center.
  Class A. Cross-links `triss` and the trauma tiles.

## 3. Per-tile robustness

- **Every compute routes through `lib/num.js` and is finite-/positive-guarded.**
  ABC/2 guards each diameter > 0; the coded scores clamp their inputs to the
  published ranges before summing; outside the valid domain each tile renders a
  complete-the-fields fallback, never a `NaN`/`Infinity` or an out-of-range band.
- **`ich-score` renders the "prognostic estimate for the team, not a
  withdrawal-of-care trigger" framing as first-class output**, so a high score is
  never read as an automatic goals-of-care decision ([spec-v11](spec-v11.md) §5.3;
  [spec-v59](spec-v59.md) output-safety).
- **`canadian-ct-head` enforces its eligibility gate and states its exclusions**,
  so the rule is never applied outside its validated population.
- **All five flow through the [spec-v59](spec-v59.md) fuzz harness with zero
  non-finite leaks**, fuzzed at the band boundaries and coded-value edges.
- **These grade and stratify; they are not orders.** Every tile renders the
  [spec-v50](spec-v50.md) §3 posture note; none authors an imaging, disposition, or
  goals-of-care order in Sophie's voice ([spec-v11](spec-v11.md) §5.3).

## 4. CI/CD & maintenance

- **Maintenance classes (§6.3):** all five are **Class A** — fixed formulas /
  validated scores / a decision rule, each cited by journal + authors. No society
  *issuer* owns these journal-published instruments; the implementing session
  confirms the `ISSUER_PATTERN` ([spec-v92](spec-v92.md)/[spec-v94](spec-v94.md))
  result at build time and adds a `docs/citation-staleness.md` row only if one
  matches.
- **Build & gates (§6.1/§6.2):** the five computes live in a new
  `lib/neurotrauma-v192.js` module, added to `test/unit/fuzz-tools.test.js`
  `MODULES`. Renderers live in a new `views/group-v192.js`; its `RV192` export is
  spread into the `app.js` `RENDERERS` map. Every input carries a real
  `<label for>`. The catalog count moves on all **13 catalog-truth surfaces** using
  the **live `UTILITIES.length` + 5**; a11y, `mobile-no-hscroll`,
  `mobile-touch-targets`, and the chromium `example-correctness` sweep pass.
- **Specialties** are drawn from the closed vocabulary: `neurocritical-care`,
  `neurology`, `neurosurgery`, `emergency-medicine`, `critical-care`,
  `trauma-surgery`, `ems`, `family-medicine` — all already in the vocabulary.

## 5. Files touched

```
docs/spec-v192.md                        (this file)
app.js                                   (+5 UTILITIES rows; import group-v192 RV192 into RENDERERS)
lib/neurotrauma-v192.js                  (new: ichVolume, ichScore, fourScore, canadianCtHead, rts)
lib/meta.js                              (+5 META entries: inline citation + citationUrl + accessed; cross-links)
views/group-v192.js                      (new renderer module: 5 renderers)
docs/clinical-citations.md               (+5 rows)
test/unit/ich-volume.test.js, ich-score.test.js, four-score.test.js, canadian-ct-head.test.js, rts.test.js  (>=3 worked examples each)
test/unit/fuzz-tools.test.js             (add lib/neurotrauma-v192.js to MODULES)
docs/audits/v12/*.md                     (5 spec-v11 audit logs)
docs/scope-acute-triage-severity.md      (record the v192 delta)
CHANGELOG.md, README.md, package.json    (catalog count live -> live+5; spec-progression line)
```

## 6. Acceptance criteria

v192 is fully shipped when:

- The implementing session has **re-run the [spec-v85 §6.2](spec-v85.md) collision
  check** and confirmed all five ids are absent.
- All 5 tiles in §2 are live (Class A) with a `META[id]` entry, inline citation +
  `citationUrl` + `accessed`, and ≥ 3 worked examples each — including an **ABC/2
  volume crossing 30 mL**, an **ICH Score mortality-band flip**, a **FOUR Score for
  an intubated patient**, a **Canadian CT Head Rule CT-indicated-vs-not pair**, and
  a **Revised Trauma Score below the triage threshold**.
- Every compute is finite/positive-guarded, routes through `lib/num.js`, and is
  covered by the [spec-v59](spec-v59.md) fuzz harness with **zero non-finite leaks**.
- `UTILITIES.length` is **live + 5** and all catalog-truth surfaces agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass;
  the CHANGELOG records v192 with the +5 delta.

## 7. Out of scope for v192

- **No imaging or disposition order** — the rules and scores stratify; the CT
  decision, the admission, and the transfer stay with the clinician
  ([spec-v11](spec-v11.md) §5.3).
- **No goals-of-care automation** — `ich-score` is a prognostic estimate for shared
  decision-making, never a withdrawal-of-care trigger.
- **No planimetric volumetry** — `ich-volume` ships the bedside ABC/2 estimate, not
  a voxel-segmentation pipeline (no imaging processing; the no-network invariant
  holds).
