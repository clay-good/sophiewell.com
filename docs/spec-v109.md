# spec-v109.md — Trauma classification & soft-tissue infection: Denver BCVI, AAST organ injury, MESS, LRINEC, and ALT-70 (+5 tiles)

> Status: **SHIPPED (2026-06-18).** Feature spec of the [spec-v100](spec-v100.md)
> MDCalc Parity Completion program, **Wave 2 — Emergency / trauma / toxicology /
> environmental** ([spec-v106](spec-v106.md)–[spec-v111](spec-v111.md)). Adds **5**
> deterministic trauma-classification and soft-tissue-infection decision rules that
> fill confirmed gaps. None duplicates a live tile.
>
> Catalog effect at v109 close: **473 + 5 = 478 tiles** (v108 closed at 473; the
> roster's 474/479 projection ran one high because spec-v102 deferred `gwtg-hf`).
>
> Every prior spec (v4 through v108) remains in force. v109 adds no runtime network
> call and no AI; each tile obeys the [spec-v100](spec-v100.md) §2 doctrine (which
> re-binds the [spec-v85](spec-v85.md) §2 doctrine verbatim, including the §2
> classification-tile clarification: these consume findings and compute a class,
> they are not browsable reference tables) and the [spec-v100](spec-v100.md) §6
> CI/CD contract, pass the [spec-v29](spec-v29.md) §3 one-line test, ship their
> primary citation inline ([spec-v54](spec-v54.md)), and inherit the
> [spec-v59](spec-v59.md) output-safety contract.

## 1. Thesis

The catalog carries the trauma-physiology and skin-infection-disposition tools, but
five standard classification and soft-tissue-infection instruments are absent:

- **No Denver BCVI criteria.** The expanded screening criteria that flag the need
  for CT angiography to detect blunt cerebrovascular injury are reachable nowhere.
- **No AAST organ-injury grading.** The spleen/liver/kidney injury grades I–V
  (2018 revision, incorporating vascular findings) — the lingua franca of trauma
  operative decision-making — have no tile.
- **No MESS.** The Mangled Extremity Severity Score (skeletal/soft-tissue energy +
  limb ischemia + shock + age), whose ≥ 7 threshold informs the salvage-vs-
  amputation conversation, is missing.
- **No LRINEC.** The 6-lab necrotizing-fasciitis suspicion score is absent.
- **No ALT-70.** The cellulitis-vs-mimic likelihood score is absent.

Each consumes clinician-entered findings and computes a class/score with the
source's management-relevant interpretation; v109 brings them onto the page.

## 2. What v109 adds (5 tiles)

### 2.1 `denver-bcvi` — Expanded Denver Criteria for blunt cerebrovascular injury

- **Citation:** Burlew CC, Biffl WL, Moore EE, Barnett CC, Johnson JL, Bensard DD.
  Blunt cerebrovascular injuries: redefining screening criteria in the era of
  noninvasive diagnosis. *J Trauma Acute Care Surg.* 2012;72(2):330-337.
- **citationUrl:** https://doi.org/10.1097/TA.0b013e31823de8a0
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `trauma-surgery`, `emergency-medicine`, `nursing-er`.
- **Inputs:** the signs/symptoms criteria (arterial hemorrhage, cervical bruit
  age < 50, expanding hematoma, focal neurologic deficit, stroke on CT,
  neurologic exam incongruent with head CT) and the risk-factor criteria
  (high-energy mechanism with LeFort II/III, cervical-spine fracture patterns,
  basilar skull fracture with carotid-canal involvement, diffuse axonal injury
  with GCS < 6, near-hanging with anoxia, seatbelt sign with swelling/pain/AMS) —
  each yes/no.
- **Output:** a **CTA screening indicated if any positive vs no screening
  criterion met** verdict, naming which criterion/criteria flagged. Class B (the
  EAST/society screening criteria are revisable → `docs/citation-staleness.md`
  row, on-publication cadence).

### 2.2 `aast-organ-injury` — AAST solid-organ injury scales (2018)

- **Citation:** Kozar RA, Crandall M, Shanmuganathan K, et al; AAST Patient
  Assessment Committee. Organ injury scaling 2018 update: spleen, liver, and
  kidney. *J Trauma Acute Care Surg.* 2018;85(6):1119-1122.
- **citationUrl:** https://doi.org/10.1097/TA.0000000000002058
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `trauma-surgery`, `emergency-medicine`, `critical-care`.
- **Inputs:** the organ selector (spleen / liver / kidney) and the
  imaging/operative/pathologic findings for that organ (hematoma extent,
  laceration depth, devascularization, and — new in 2018 — the vascular-injury
  findings such as pseudoaneurysm or active bleeding).
- **Output:** the **AAST grade (I–V)** for the selected organ, naming the findings
  that set the grade and rendering the 2018 vascular-finding upgrade rule. Class B
  (the AAST scales are revised periodically → `docs/citation-staleness.md` row,
  on-publication cadence).

### 2.3 `mangled-extremity` — Mangled Extremity Severity Score (MESS)

- **Citation:** Johansen K, Daines M, Howey T, Helfet D, Hansen ST Jr. Objective
  criteria accurately predict amputation following lower extremity trauma. *J
  Trauma.* 1990;30(5):568-573.
- **citationUrl:** https://doi.org/10.1097/00005373-199005000-00007
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `trauma-surgery`, `emergency-medicine`, `surgery`.
- **Inputs:** skeletal/soft-tissue injury energy (1–4), limb ischemia (1–3,
  **doubled if ischemia time > 6 h**), shock (0–2 by systolic BP), and age band
  (0–2). (id `mangled-extremity` per the [spec-v100](spec-v100.md) §4 collision
  rename, distinct from `mess-first-seizure` in v120.)
- **Output:** the **total** with the published amputation-risk framing (≥ 7
  historically associated with amputation), naming the components and the
  ischemia-time doubling rule when it applied. Class A.

### 2.4 `lrinec` — Laboratory Risk Indicator for Necrotizing Fasciitis

- **Citation:** Wong CH, Khin LW, Heng KS, Tan KC, Low CO. The LRINEC (Laboratory
  Risk Indicator for Necrotizing Fasciitis) score: a tool for distinguishing
  necrotizing fasciitis from other soft tissue infections. *Crit Care Med.*
  2004;32(7):1535-1541.
- **citationUrl:** https://doi.org/10.1097/01.ccm.0000129486.35458.7d
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `emergency-medicine`, `infectious-disease`, `surgery`,
  `critical-care`.
- **Inputs:** CRP, total WBC, hemoglobin, sodium, creatinine, and glucose — each
  banded to its published point value.
- **Output:** the **total (0–13)** mapped to the published **low (≤ 5) /
  intermediate (6–7) / high (≥ 8)** suspicion bands, naming the band. Class A.

### 2.5 `alt-70` — ALT-70 cellulitis score

- **Citation:** Raff AB, Weng QY, Cohen JM, et al. A predictive model for
  diagnosis of lower extremity cellulitis: a risk score based on clinical and
  patient characteristics. *J Am Acad Dermatol.* 2017;76(4):618-625.e2.
- **citationUrl:** https://doi.org/10.1016/j.jaad.2016.12.044
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `dermatology`, `emergency-medicine`, `internal-medicine`,
  `infectious-disease`.
- **Inputs:** Asymmetry (3), Leukocytosis ≥ 10 000 (1), Tachycardia ≥ 90 (1), and
  age ≥ 70 (2).
- **Output:** the **total (0–7)** mapped to the published bands — **≤ 2
  cellulitis unlikely (reassess), 3–4 indeterminate, ≥ 5 cellulitis likely** —
  naming the band. Class A.

## 3. Per-tile robustness

- **`mangled-extremity` carries the ischemia-time doubling rule** — the ischemia
  subscore is multiplied when ischemia time exceeds 6 hours; the compute applies
  the multiplier explicitly and renders that it did, so the total is reproducible.
- **`aast-organ-injury` is a per-organ decision tree, not a table.** The clinician
  selects the organ and enters findings; the compute walks the 2018 grade rules
  (including the vascular-finding upgrade) for that organ and returns a single
  grade with the findings that set it. It computes a class from inputs and so
  passes the [spec-v100](spec-v100.md) §2 classification-tile clause; it is not a
  browsable atlas.
- **`denver-bcvi`, `lrinec`, and `alt-70` are bounded criteria/threshold logic.**
  Each bands its inputs, clamps the total to its published range, and names which
  items/labs were counted. All five flow through the [spec-v59](spec-v59.md) fuzz
  harness with zero non-finite leaks.
- All five render the [spec-v50](spec-v50.md) §3 clinical posture note and quote the
  source's interpretation; none authors a CTA, surgical-debridement, antibiotic,
  or amputation order in Sophie's voice ([spec-v11](spec-v11.md) §5.3) — the
  `mangled-extremity` posture note states explicitly that the score informs, never
  dictates, the salvage-vs-amputation decision.

## 4. CI/CD & maintenance

Per the [spec-v100](spec-v100.md) §6 contract (re-binding [spec-v85](spec-v85.md) §6):

- **Maintenance classes (§6.3):** `mangled-extremity`, `lrinec`, and `alt-70` are
  **Class A** (fixed derivation papers cited by journal + authors → no staleness
  row). `denver-bcvi` (the EAST/society screening criteria) and `aast-organ-injury`
  (the periodically-revised AAST scales) are **Class B** — each gets a
  `docs/citation-staleness.md` row naming the edition in force (2012 expanded
  Denver criteria; AAST 2018 update), the `accessed` date, and an on-publication
  review cadence, monitored by the `scripts/check-citation-cadence.mjs` warn-job.
- **Module & gates (§6.2):** the compute module is **`lib/traumaclass-v109.js`**
  (exports `denverBcvi`, `aastOrganInjury`, `mangledExtremity`, `lrinec`,
  `alt70`), added to the `test/unit/fuzz-tools.test.js` `MODULES` list (zero
  non-finite leaks). The renderer module is **`views/group-v34.js`**; its `RV34`
  export is added to the `app.js` `RENDERERS` spread. Each `META` example is pinned
  by the chromium `example-correctness` sweep; the catalog count moves on all
  **13 catalog-truth surfaces**; a11y, `mobile-no-hscroll`, and 44px touch-target
  checks pass for `views/group-v34.js`.

## 5. Files touched

```
docs/spec-v109.md                        (this file)
app.js                                   (+5 UTILITIES rows, group G; import group-v34 renderers (RV34) into RENDERERS)
lib/traumaclass-v109.js                  (new module: denverBcvi, aastOrganInjury, mangledExtremity, lrinec, alt70)
lib/meta.js                              (+5 META entries: inline citation + citationUrl + accessed; cross-links to iss-rts, mess-first-seizure)
views/group-v34.js                       (new renderer module: 5 renderers; incl. the AAST per-organ selector)
docs/citation-staleness.md               (+ rows: denver-bcvi 2012 expanded Denver, aast-organ-injury 2018 AAST update)
docs/clinical-citations.md               (+5 rows for the five sources)
test/unit/denver-bcvi.test.js, aast-organ-injury.test.js, mangled-extremity.test.js, lrinec.test.js, alt-70.test.js  (≥3 boundary worked examples each)
test/unit/fuzz-tools.test.js             (add lib/traumaclass-v109.js to MODULES)
docs/audits/v12/denver-bcvi.md, aast-organ-injury.md, mangled-extremity.md, lrinec.md, alt-70.md  (spec-v11 audit logs)
docs/scope-mdcalc-parity.md              (catalog count 474 -> 479; Wave 2 progress in the running ledger)
CHANGELOG.md                             (Unreleased: v109 entry, +5)
README.md, package.json                  (catalog count 474 -> 479; spec-progression line -> v109)
```

## 6. Acceptance criteria

v109 is fully shipped when:

- The implementing session has **re-run the §6.2 collision check** and confirmed
  all five ids are absent (`denver-bcvi`, `aast-organ-injury`, `mangled-extremity`,
  `lrinec`, `alt-70`; `mangled-extremity` honors the §4 rename, distinct from
  `mess-first-seizure`).
- All 5 tiles in §2 are live in Group G with a `META[id]` entry, an inline primary
  citation + `citationUrl` + `accessed`, ≥3 boundary worked examples each including
  a **band-flip per tile** (Denver: one positive criterion flipping no-screen→CTA;
  AAST: a vascular finding upgrading the grade; MESS: the ischemia-time doubling
  pushing the total across 7; LRINEC: total crossing into the high band; ALT-70:
  total crossing 5 into cellulitis-likely), a [spec-v11](spec-v11.md) audit log,
  and a passing [spec-v29](spec-v29.md) §3 check.
- `aast-organ-injury` returns one grade per selected organ with the 2018
  vascular-upgrade rule; `mangled-extremity` applies the ischemia-time doubling;
  partial inputs render a complete-the-fields fallback.
- Every compute function uses `lib/num.js` and is covered by the
  [spec-v59](spec-v59.md) fuzz harness with zero non-finite leaks.
- `denver-bcvi` and `aast-organ-injury` carry `accessed` + a
  `docs/citation-staleness.md` row; the other three carry no row.
- `UTILITIES.length` is **479** (or the then-current live count + 5 if specs land
  out of order) and all catalog-truth surfaces ([spec-v46](spec-v46.md)) agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass.
- The CHANGELOG records v109 with the +5 catalog delta.

## 7. Out of scope for v109

- **No imaging or pathology parsing** — `aast-organ-injury` takes the clinician's
  findings, not a CT or operative-note feed; `denver-bcvi` takes the screening
  findings, not a CTA result.
- **No surgical, antibiotic, debridement, or amputation order** — each tile reports
  the class/score/verdict and the source's stated interpretation; the operative,
  antimicrobial, and salvage decisions stay with the clinician and local protocol.
- **No browsable injury atlas** — each tile consumes inputs and computes a single
  class/score per the [spec-v100](spec-v100.md) §2 classification clause; none is a
  reference table.
