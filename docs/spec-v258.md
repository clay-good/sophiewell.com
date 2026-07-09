# spec-v258.md — Acute & primary-care decision rules: the Canadian CT Head Rule, the San Francisco Syncope Rule, and the McIsaac score (+3 tiles)

> Status: **SHIPPED (2026-07-08, 1109 → 1112).** First feature spec of the **Advanced
> Risk-Stratification Instruments** program (§1.1). Adds **3** deterministic
> point/criteria rules that decide imaging, disposition, or testing at the bedside.
> **Each id was verified absent by a fixed-string scan of the extracted `app.js`
> id/name list** ([spec-v85 §6.2](spec-v85.md)): the catalog carries `nexus-cspine`,
> `pecarn-head`, `canadian-syncope`, `rose-syncope`, `egsys`, `ottawa-sah`, `centor`,
> and `feverpain`, but **not** the Canadian CT Head Rule, the San Francisco Syncope
> Rule, or the McIsaac score.
>
> Catalog effect: **live `UTILITIES.length` + 3** — enforced by the catalog-truth
> gate ([spec-v46](spec-v46.md)) at build time; no number is copied here.
>
> Every prior spec remains in force. v258 adds no runtime network call and no AI; each
> tile obeys the [spec-v100](spec-v100.md) §2 doctrine, passes the
> [spec-v29](spec-v29.md) §3 one-line test, ships its citation inline
> ([spec-v54](spec-v54.md)), inherits the [spec-v59](spec-v59.md) output-safety
> contract, renders the [spec-v50](spec-v50.md) §3 posture note, and honors
> [spec-v11](spec-v11.md) §5.3 (**no imaging, admission, discharge, or antibiotic
> order in Sophie's voice** — these compute a risk/eligibility category; the decision
> stays with the clinician). **Every criterion, point weight, and threshold is
> re-fetched and cross-verified against ≥2 independent open sources at implementation**
> ([spec-v97](spec-v97.md)); uncertain values carry an explicit *(verify at
> implementation, [spec-v97](spec-v97.md))* tag. The implementing session **re-runs the
> [spec-v85 §6.2](spec-v85.md) collision check** first.

## 1. Thesis

The catalog carries the pediatric and c-spine imaging rules (PECARN, NEXUS, Canadian
C-Spine) and three syncope-risk engines (Canadian Syncope, ROSE, EGSYS), but not the
single most-cited adult **head-CT** decision rule, not the original **syncope**
disposition rule that the later engines were built to replace, and not the
**age-adjusted** sore-throat score that turns raw Centor into a management pathway.
Each is a transparent, decades-validated instrument and each is decision support —
**never an imaging, admission, discharge, or prescribing order**.

### 1.1 Program: Advanced Risk-Stratification Instruments

v258–v260 add nine deterministic instruments that a clinician reaches for at a
decision point — image or not, admit or not, broaden antibiotics or not. Each is
Class A, freely reproducible from open sources, and absent from the catalog at draft.
The program adds no new module theme beyond the existing Group G (clinical scoring &
risk) surface and no runtime dependency.

## 2. What v258 adds (3 tiles)

### 2.1 `canadian-ct-head` — Canadian CT Head Rule (minor head injury)

- **Citation:** Stiell IG, Wells GA, Vandemheen K, et al. The Canadian CT Head Rule
  for patients with minor head injury. *Lancet.* 2001;357(9266):1391-1396.
- **citationUrl:** https://doi.org/10.1016/S0140-6736(00)04561-X
- **Group:** G. **Specialties:** `emergency-medicine`, `neurosurgery`, `neurology`,
  `critical-care`.
- **Applies to:** minor head injury with witnessed loss of consciousness, amnesia, or
  disorientation and an initial GCS 13–15. The rule is **not** validated for
  non-trauma, GCS < 13, age < 16, anticoagulation/bleeding disorder, obvious open
  skull fracture, or seizure — the tile states these exclusions explicitly *(verify the
  exclusion list at implementation, [spec-v97](spec-v97.md))*.
- **Inputs — five high-risk criteria** (predict need for neurosurgical intervention):
  GCS < 15 at 2 h post-injury; suspected open or depressed skull fracture; any sign of
  basal skull fracture (hemotympanum, raccoon eyes, CSF oto/rhinorrhea, Battle's sign);
  ≥ 2 vomiting episodes; age ≥ 65. **Two medium-risk criteria** (predict any clinically
  important brain injury on CT): retrograde amnesia ≥ 30 min before impact; dangerous
  mechanism (pedestrian struck, occupant ejected, fall from > 3 ft / 5 stairs).
- **Output:** **CT head recommended** when any high- or medium-risk criterion is
  present, naming which criteria fired and whether they are the neurosurgical (high) or
  clinically-important (medium) tier; **CT not required by the rule** when all seven are
  absent. Framed as the sensitivity-first rule that safely reduces head CT in minor
  head injury. Class A. Cross-links `pecarn-head`, `nexus-cspine`, `gcs`.

### 2.2 `sf-syncope` — San Francisco Syncope Rule (CHESS)

- **Citation:** Quinn JV, Stiell IG, McDermott DA, Sellers KL, Kohn MA, Wells GA.
  Derivation of the San Francisco Syncope Rule to predict patients with short-term
  serious outcomes. *Ann Emerg Med.* 2004;43(2):224-232.
- **citationUrl:** https://doi.org/10.1016/S0196-0644(03)00823-0
- **Group:** G. **Specialties:** `emergency-medicine`, `cardiology`,
  `internal-medicine`.
- **Inputs — the CHESS mnemonic, any one positive:** history of **C**ongestive heart
  failure; **H**ematocrit < 30 %; abnormal **E**CG (new change or any non-sinus rhythm);
  complaint of **S**hortness of breath; triage **S**ystolic BP < 90 mmHg.
- **Output:** **high risk** for a serious 7-day outcome when **any** CHESS item is
  positive (naming the item[s]); **low risk** when all five are negative — the rule's
  value is its ~ 96 % sensitivity as a rule-out. Framed as the original ED syncope
  disposition screen that the Canadian Syncope and ROSE engines refined. Class A.
  Cross-links `canadian-syncope`, `rose-syncope`, `egsys`.

### 2.3 `mcisaac` — McIsaac score (modified Centor, streptococcal pharyngitis)

- **Citation:** McIsaac WJ, White D, Tannenbaum D, Low DE. A clinical score to reduce
  unnecessary antibiotic use in patients with sore throat. *CMAJ.* 1998;158(1):75-83.
- **citationUrl:** https://pmc.ncbi.nlm.nih.gov/articles/PMC1228750/
- **Group:** G. **Specialties:** `primary-care`, `family-medicine`,
  `emergency-medicine`, `internal-medicine`.
- **Inputs:** temperature > 38 °C (+1); absence of cough (+1); tender anterior cervical
  adenopathy (+1); tonsillar swelling or exudate (+1); and the **age adjustment** that
  distinguishes McIsaac from raw Centor — age 3–14 (+1), 15–44 (0), ≥ 45 (−1).
- **Output:** the **McIsaac total (−1 to 5)** mapped to the estimated probability of
  group-A strep and the published management band — roughly ≤ 0 → ~ 1–2.5 % (no test,
  no antibiotic), 1 → ~ 5–10 %, 2–3 → ~ 11–28 % (test, treat if positive), 4–5 →
  ~ 50 % (test or empiric treat) *(the exact per-score probabilities are transcribed
  from the primary paper at implementation, [spec-v97](spec-v97.md))* — naming the
  contributing features. Framed as the age-corrected Centor that turns a raw count into
  a testing/treatment pathway; **it recommends a testing strategy, never writes an
  antibiotic order** ([spec-v11](spec-v11.md) §5.3). Class A. Cross-links `centor`,
  `feverpain`.

## 3. Per-tile robustness

- **Every compute routes through `lib/num.js` and is finite-guarded.** Canadian CT Head
  and SF Syncope are boolean-criteria rules (any-positive logic); McIsaac is a bounded
  −1…5 integer sum with an age band — each renders a "complete the fields" fallback for
  a missing item rather than a `NaN`, and clamps probabilities to [0, 100] %.
- **Each tile reports which criteria fired and the resulting category**
  ([spec-v59](spec-v59.md)) — the head-CT tier, the CHESS item(s), the McIsaac features
  — so a result is never read without its basis.
- **All three render a category, not an order** — none authors an imaging, admission,
  discharge, or prescribing order in Sophie's voice ([spec-v11](spec-v11.md) §5.3); each
  renders the [spec-v50](spec-v50.md) §3 posture note.
- **All three flow through the [spec-v59](spec-v59.md) fuzz harness with zero
  non-finite leaks**, fuzzed at the age bands and the any-positive boundaries.

## 4. CI/CD & maintenance

- **Maintenance classes (§6.3):** all three are **Class A** — fixed criteria/point
  models, each cited by journal + authors. The implementing session confirms whether any
  citation trips `ISSUER_PATTERN` ([spec-v92](spec-v92.md)/[spec-v94](spec-v94.md)) and
  adds a `docs/citation-staleness.md` row only if the live pattern matches.
- **Build & gates (§6.1/§6.2):** the three computes live in a new
  `lib/decision-rules-v258.js`, added to `test/unit/fuzz-tools.test.js` `MODULES`.
  Renderers live in a new `views/group-v258.js`; its `RV258` export is spread into the
  `app.js` `RENDERERS` map. Every input carries a real `<label for>`. The catalog count
  moves on all catalog-truth surfaces using the **live `UTILITIES.length` + 3**; a11y,
  `mobile-no-hscroll`, `mobile-touch-targets`, and the chromium `example-correctness`
  sweep pass.
- **Specialties** are drawn from the closed vocabulary; all tags used here already exist
  in `ALLOWED_SPECIALTIES`.
- **MCP exposure (post-ship):** each tile is a Class A deterministic single-source
  compute and is therefore **routinely MCP-adaptable** — a follow-up MCP wave exposes
  all three as deterministic agent tools per the [spec-v85](spec-v85.md) recipe (append
  adapters to a `mcp/adapters/decision-rules-v258.js`, self-describing echo of the fired
  criteria so the numeric round-trip passes).

## 5. Files touched

```
docs/spec-v258.md                        (this file)
app.js                                   (+3 UTILITIES rows; import group-v258 RV258 into RENDERERS)
lib/decision-rules-v258.js               (new: canadianCtHead, sfSyncope, mcisaac)
lib/meta.js                              (+3 META entries: inline citation + citationUrl + accessed; cross-links to pecarn-head, canadian-syncope, centor)
views/group-v258.js                      (new renderer module: 3 renderers)
docs/clinical-citations.md               (+3 rows)
test/unit/canadian-ct-head.test.js, sf-syncope.test.js, mcisaac.test.js   (>=3 worked examples each)
test/unit/fuzz-tools.test.js             (add lib/decision-rules-v258.js to MODULES)
docs/scope-post-parity.md                (catalog count live -> live+3; record the v258 delta)
CHANGELOG.md, README.md, package.json    (catalog count live -> live+3; spec-progression line)
```

## 6. Acceptance criteria

v258 is fully shipped when:

- The implementing session has **re-run the [spec-v85 §6.2](spec-v85.md) collision
  check** and confirmed all three ids are absent (as verified at draft).
- All 3 tiles in §2 are live (Class A) with a `META[id]` entry, inline citation +
  `citationUrl` + `accessed`, and ≥ 3 worked examples each — including a **Canadian CT
  Head with a high-risk-only, a medium-risk-only, and an all-negative case**, an **SF
  Syncope crossing the any-positive threshold**, and a **McIsaac spanning the age
  adjustment (a child, an adult < 45, and an adult ≥ 45 with the same clinical
  features)**.
- Every compute is finite-guarded, routes through `lib/num.js`, clamps probabilities to
  [0, 100] %, and is covered by the [spec-v59](spec-v59.md) fuzz harness with **zero
  non-finite leaks**.
- `UTILITIES.length` is **live + 3** and all catalog-truth surfaces agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass; the
  CHANGELOG records v258 with the +3 delta.

## 7. Out of scope for v258

- **No imaging / admission / discharge / prescribing order** — the tiles compute a
  risk or eligibility category; the scan/admit/treat decisions stay with the clinician
  ([spec-v11](spec-v11.md) §5.3).
- **No proprietary or non-reproducible variant** — the New Orleans / NEXUS-II head-CT
  criteria and the many local Centor-derived pathways are deferred; this slice adds only
  the three canonical, openly-published rules.
