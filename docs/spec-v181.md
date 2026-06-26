# spec-v181.md — Long-term-care infection surveillance & antimicrobial stewardship: Revised McGeer surveillance definitions and Loeb minimum criteria (+2 tiles)

> Status: **PROPOSED (2026-06-24).** Feature spec of the
> [spec-v172](spec-v172.md) **Long-Term Care & Geriatric Assessment (LTC-GA)**
> program, cluster **§3.9**. Adds **2** deterministic infection-prevention /
> antimicrobial-stewardship instruments that fill a confirmed gap — the catalog
> carries no long-term-care infection surveillance definition and no
> antibiotic-initiation minimum-criteria tool. Neither duplicates a live tile.
> **Two tiles is intentional**, not an under-fill: this is the tight, high-value
> pair §3.9 reserves — the same deliberate 2-tile close as
> [spec-v171](spec-v171.md) — covering exactly the two consensus instruments a
> nursing home's CMS-mandated infection-prevention-and-control program (IPCP) and
> antibiotic-stewardship program (ASP) run on.
>
> Catalog effect at v181: **live count + 2** (the catalog-truth gate enforces the
> live `UTILITIES.length` + delta).
>
> Every prior spec (v4 through v180) remains in force. v181 adds no runtime
> network call and no AI; each tile obeys the [spec-v100](spec-v100.md) §2
> doctrine (re-binding [spec-v85](spec-v85.md) §2) — including the §2
> **classification-tile clarification** (a tile *consumes the clinician's
> observations and computes a class/determination*; it is not a static reference
> card) — and the [spec-v100](spec-v100.md) §6 CI/CD contract. Each passes the
> [spec-v29](spec-v29.md) §3 one-line test, ships its primary citation inline
> ([spec-v54](spec-v54.md)), inherits the [spec-v59](spec-v59.md) output-safety
> contract, renders the [spec-v50](spec-v50.md) §3 clinical-posture note, and
> honors [spec-v11](spec-v11.md) §5.3 (no dosing/treatment order in Sophie's
> voice). **Every criterion, body-site definition, and boolean rule is re-fetched
> and cross-verified against ≥2 independent sources at implementation**
> ([spec-v97](spec-v97.md)); nothing here is implemented from recall.

## 1. Thesis

The **CMS Requirements of Participation (RoP), Phase 3** (42 CFR §483.80) require
every nursing home to operate a formal **infection prevention and control program
(IPCP)** with **surveillance** and an **antibiotic stewardship program (ASP)** with
protocols for the **appropriate initiation** of antimicrobials. Two consensus
instruments are the field standard for exactly those two obligations, and the
catalog carries neither:

- **Revised McGeer criteria** are the surveillance case definitions of infection in
  long-term care — the instrument an infection preventionist uses to decide, by body
  site, whether a resident's findings **meet the surveillance definition** of a
  facility-acquired infection for tracking and reporting. They are a *counting*
  definition, not a diagnosis or a treatment trigger.
- **Loeb minimum criteria** are the consensus minimum criteria for **initiating
  antibiotics** in a long-term-care resident — the decision-support instrument a
  stewardship program uses at the point a clinician is considering antimicrobials,
  to ask whether the minimum threshold for starting them is met.

Both consume the clinician's observed and site-specific findings and **compute a
meets / does-not-meet determination**, naming the criteria that were satisfied. They
are the two halves of the LTC infection workflow — surveillance (McGeer, look-back)
and initiation support (Loeb, point-of-decision) — and `mcgeer-criteria` cross-links
`loeb-minimum-criteria` so the user sees the surveillance vs initiation distinction.

- **mcgeer-criteria** — the Revised McGeer (SHEA/CDC 2012) surveillance definitions:
  pick the suspected infection site, enter the constitutional and site-specific
  criteria present → **MEETS / DOES NOT MEET** the surveillance definition for that
  site, naming which criteria were satisfied.
- **loeb-minimum-criteria** — the Loeb 2001 minimum criteria for initiating
  antibiotics: pick the suspected site, enter the criteria present → minimum criteria
  **MET / NOT MET** for initiating antimicrobials, naming the satisfied criteria.

## 2. What v181 adds (2 tiles)

### 2.1 `mcgeer-criteria` — Revised McGeer Surveillance Definitions of Infection in LTC

- **Citation:** Stone ND, Ashraf MS, Calder J, et al. Surveillance definitions of
  infections in long-term care facilities: revisiting the McGeer criteria. *Infect
  Control Hosp Epidemiol.* 2012;33(10):965-977.
- **citationUrl:** https://doi.org/10.1086/667743 (verify at implementation,
  [spec-v97](spec-v97.md))
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `infectious-disease`, `geriatrics`, `nursing-general`,
  `quality-safety`.
- **Inputs:** first a **select for the suspected infection site** — **urinary tract
  (UTI)**, **lower respiratory (pneumonia / lower-respiratory-tract)**, **upper
  respiratory**, **skin / soft tissue**, **gastrointestinal**, **eye / ear / nose /
  mouth (incl. conjunctivitis, oral, sinusitis)**, and **systemic
  (primary-bloodstream / unexplained-febrile)** — then the **constitutional criteria**
  (e.g., fever, leukocytosis, acute change in mental status / functional decline per
  the published constitutional set) and the **site-specific criteria** for the chosen
  site, each entered as present/absent (verify the exact per-site item list and the
  catheter-associated UTI sub-definition at implementation, [spec-v97](spec-v97.md)).
- **Output:** **MEETS** or **DOES NOT MEET** the Revised McGeer surveillance
  definition for the selected site, **naming which criteria were satisfied** and
  which required-but-missing criterion blocked a "meets" result. The output is
  **categorical** — there is no numeric score. **Class B** — the citation names
  **SHEA** (and **CDC**), which trips `ISSUER_PATTERN`
  ([spec-v92](spec-v92.md)/[spec-v94](spec-v94.md) lesson), so the tile carries an
  `accessed` date and a `docs/citation-staleness.md` row naming the **2012 revision**,
  the accessed date, and an **on-publication review cadence**. **Posture:** this is a
  **surveillance** definition (for infection tracking and reporting) — it is
  explicitly **not a diagnosis and not a treatment trigger**; the renderer states this
  in plain language ([spec-v50](spec-v50.md) §3). Cross-links `loeb-minimum-criteria`.

### 2.2 `loeb-minimum-criteria` — Loeb Minimum Criteria for Initiating Antibiotics in LTC

- **Citation:** Loeb M, Bentley DW, Bradley S, et al. Development of minimum criteria
  for the initiation of antibiotics in residents of long-term-care facilities: results
  of a consensus conference. *Infect Control Hosp Epidemiol.* 2001;22(2):120-124.
- **citationUrl:** https://doi.org/10.1086/501875 (verify at implementation,
  [spec-v97](spec-v97.md))
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `infectious-disease`, `pharmacy`, `primary-care`,
  `nursing-general`, `quality-safety`.
- **Inputs:** first a **select for the suspected site** — **UTI without an indwelling
  catheter**, **UTI with an indwelling catheter**, **respiratory (incl.
  fever-with-cough / pneumonia)**, **skin / soft tissue**, and **fever of unknown
  source** — then the **criteria present** for the chosen site, each entered as
  present/absent (verify the exact per-site minimum-criteria item list, including the
  acute-dysuria sufficient-criterion path and the temperature thresholds, at
  implementation, [spec-v97](spec-v97.md)).
- **Output:** minimum criteria **MET** or **NOT MET** for **initiating
  antimicrobials** for the selected site, **naming the satisfied criteria** and the
  blocking gap when not met. The output is **categorical** — no numeric score. Class A
  (a journal-published consensus instrument). **Posture:** this is **decision-support
  for stewardship** — it does **not order and does not withhold antibiotics**; the
  **prescriber and the facility's local protocol decide** ([spec-v11](spec-v11.md)
  §5.3, [spec-v100](spec-v100.md) §2 clause 5). Cross-links `mcgeer-criteria` (the
  surveillance counterpart — the renderer names the surveillance-vs-initiation
  distinction).

## 3. Per-tile robustness

- **Both tiles are deterministic criteria-logic evaluations** — a fixed boolean
  combination of constitutional + site-specific criteria, **branched on the selected
  site**, returning a **meets / does-not-meet** (McGeer) or **met / not-met** (Loeb)
  determination with the satisfied criteria named. There is no weighting and no
  arithmetic score; the published per-site rule is encoded literally and unit-tested
  at each criterion boundary (re-fetched verbatim, [spec-v100](spec-v100.md) §5 /
  [spec-v97](spec-v97.md)).
- **Empty / partial selection is guarded.** If no site is selected, or a site is
  selected but the criteria needed to evaluate its rule are blank, the tile returns a
  surfaced **"complete the fields"** fallback (`valid:false`) — it **never** returns a
  false "meets" / "met" from an incomplete input. A site whose required criteria are
  all *absent* correctly returns **does-not-meet** (a determination), distinct from
  *unanswered* (the fallback); the renderer distinguishes the two.
- **[spec-v59](spec-v59.md) output safety** — the output is **categorical**
  (meets/does-not-meet + a named-criteria list), so there is **no numeric leak**; the
  fuzz harness asserts no non-finite value and no false-positive determination escapes
  for any site under random present/absent vectors and any empty/partial selection.
- **The surveillance vs treatment-initiation purposes are explicitly distinguished.**
  `mcgeer-criteria` states it is a **surveillance** definition (tracking/reporting,
  not diagnosis, not a treatment trigger); `loeb-minimum-criteria` states it is
  **stewardship decision-support** for initiation (it does not order or withhold).
  Each renders the [spec-v50](spec-v50.md) §3 clinical-posture note and quotes the
  source's own framing. **Neither authors an antibiotic order, agent, or dose in
  Sophie's voice** ([spec-v11](spec-v11.md) §5.3) — `loeb-minimum-criteria` adds the
  *"the prescriber and local protocol decide"* line.

## 4. CI/CD & maintenance

Per the [spec-v100](spec-v100.md) §6 contract (re-binding [spec-v85](spec-v85.md)
§6):

- **Maintenance classes (§6.3):** `loeb-minimum-criteria` is **Class A** — a
  journal-published consensus instrument cited by journal + authors.
  **`mcgeer-criteria` is Class B** — its citation names **SHEA** (and **CDC**), which
  trips the `ISSUER_PATTERN` ([spec-v92](spec-v92.md)/[spec-v94](spec-v94.md) lesson),
  so it gets a **`docs/citation-staleness.md` row** naming the **2012 revision**, the
  `accessed` date, and an **on-publication review cadence**. The implementing session
  confirms at build time that SHEA/CDC trip the pattern (and that the Loeb citation,
  which names no issuer acronym, does not) rather than from this document
  ([spec-v172](spec-v172.md) §5).
- **Build & gates (§6.1/§6.2):** the two evaluations live in the new
  **`lib/ltcga-v181.js`** module (named exports `mcgeerCriteria`,
  `loebMinimumCriteria`), added to the `test/unit/fuzz-tools.test.js` `MODULES` list
  — both fuzzed for the empty/partial-selection and false-positive-determination
  paths (zero non-finite leaks, no false "meets"). Renderers live in the new
  **`views/group-v181.js`** module; its **`RV181`** export is spread into the `app.js`
  `RENDERERS` map. Each site-select and each criterion checkbox carries a real
  `<label for>`. The catalog count moves on all **13 catalog-truth surfaces**
  ([spec-v46](spec-v46.md)) in the same change using the **live `UTILITIES.length` +
  2**; a11y, `mobile-no-hscroll`, `mobile-touch-targets`, and the chromium
  `example-correctness` sweep pass for `views/group-v181.js`.
- **Program note:** v181 is the §3.9 cluster of the [spec-v172](spec-v172.md) LTC-GA
  program. The §6.3 cadence job adds `mcgeer-criteria` to the monitored Class B set;
  `scope-mdcalc-parity.md` records the v181 contribution to the LTC-GA program tally.

## 5. Files touched

```
docs/spec-v181.md                        (this file)
app.js                                   (+2 UTILITIES rows, group G; import group-v181 RV181 into RENDERERS)
lib/ltcga-v181.js                        (new module: mcgeerCriteria, loebMinimumCriteria)
lib/meta.js                              (+2 META entries: inline citation + citationUrl + accessed; cross-link mcgeer-criteria <-> loeb-minimum-criteria)
views/group-v181.js                      (new renderer module: 2 renderers, RV181)
docs/citation-staleness.md               (+1 row: mcgeer-criteria — 2012 revision, accessed, on-publication cadence)
docs/clinical-citations.md               (+2 rows for the two sources)
test/unit/mcgeer-criteria.test.js, loeb-minimum-criteria.test.js  (>=3 boundary worked examples each)
test/unit/fuzz-tools.test.js             (add lib/ltcga-v181.js to MODULES)
docs/audits/v12/mcgeer-criteria.md, loeb-minimum-criteria.md  (spec-v11 audit logs)
docs/scope-mdcalc-parity.md              (catalog count live -> live+2; record v181 under the LTC-GA program)
CHANGELOG.md                             (Unreleased: v181 entry, +2)
README.md, package.json                  (catalog count live -> live+2; spec-progression line -> v181)
```

## 6. Acceptance criteria

v181 is fully shipped when:

- The implementing session has **re-run the [spec-v85 §6.2](spec-v85.md) collision
  check** and confirmed both ids (`mcgeer-criteria`, `loeb-minimum-criteria`) are
  absent.
- Both tiles in §2 are live (Group G) with a `META[id]` entry, an inline primary
  citation + `citationUrl` + `accessed`, a [spec-v11](spec-v11.md) audit log, and a
  passing [spec-v29](spec-v29.md) §3 check.
- **≥3 worked examples per tile, each flipping the meets / does-not-meet
  determination at a criterion boundary** — including:
  - a **McGeer UTI** example that **MEETS** the surveillance definition vs one that
    **DOES NOT MEET** because the localizing site-specific criterion is missing, plus
    a third example on a different site (e.g., lower-respiratory or skin/soft tissue)
    flipping at its boundary;
  - a **Loeb UTI-without-catheter** example that is **MET** (e.g., the acute-dysuria
    sufficient path, verify at implementation) vs one **NOT MET** because the minimum
    threshold is unsatisfied, plus a third on a different site (e.g., respiratory or
    fever-of-unknown-source) flipping at its boundary.
- The output is **categorical** (meets/does-not-meet + named satisfied criteria) with
  **no numeric leak**; an empty/partial selection renders the **complete-the-fields**
  fallback and **never** a false "meets"/"met"; both computes flow through the
  [spec-v59](spec-v59.md) fuzz harness with zero non-finite leaks and no
  false-positive determination.
- `mcgeer-criteria` carries `accessed` + a **`docs/citation-staleness.md` row** (2012
  revision); the renderer states the **surveillance-not-diagnosis-not-treatment**
  posture. `loeb-minimum-criteria` states the **stewardship-decision-support /
  prescriber-and-local-protocol-decide** posture and authors **no** antibiotic agent
  or dose in Sophie's voice.
- `UTILITIES.length` is the **live count + 2** and all catalog-truth surfaces
  ([spec-v46](spec-v46.md)) agree; `scope-mdcalc-parity.md` records the v181
  contribution to the LTC-GA program.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass.
- The CHANGELOG records v181 with the +2 catalog delta.

## 7. Out of scope for v181

- **Not the full McGeer manuscript tables.** The tile computes the meets /
  does-not-meet **determination** for the selected site; it does **not** reproduce the
  entire Stone 2012 set of per-site definition tables as a static reference, nor the
  **CDC NHSN LTCF surveillance protocol** — those are reference documents
  ([spec-v29](spec-v29.md) §3 / [spec-v100](spec-v100.md) §2). The tile consumes the
  clinician's findings and returns the determination.
- **No deprescribing / PIM checklists.** **STOPP/START** and the **full Beers list**
  live elsewhere ([spec-v172](spec-v172.md) §3.7 `beers-check` / the v179 burden
  quantifiers; STOPP/START excluded per [spec-v148](spec-v148.md) §7 — a ≈190-criterion
  checklist with no aggregate score).
- **No antibiotic selection or dosing.** v181 computes only whether a **surveillance**
  definition (McGeer) or an **initiation minimum-criteria** threshold (Loeb) is met;
  it does **not** select an antimicrobial **agent**, **dose**, **route**, or
  **duration**, and it does not order or withhold therapy — the prescriber and the
  facility's local protocol decide ([spec-v11](spec-v11.md) §5.3).
- **No automatic reporting or NHSN submission.** The tile reports the determination
  for the clinician/infection-preventionist; it does not transmit, store, or submit
  surveillance data.
