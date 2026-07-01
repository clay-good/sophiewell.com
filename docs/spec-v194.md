# spec-v194.md — Neonatal & pediatric acute assessment: Westley croup score, Finnegan neonatal abstinence, Silverman-Andersen, and the pediatric early-warning score (+4 tiles)

> Status: **PROPOSED (2026-06-30).** Third feature spec of the **Acute Triage &
> Specialty Severity** program ([spec-v192](spec-v192.md) §1.1), implementing the
> **neonatal / pediatric acute-assessment** cluster. Adds **4** deterministic
> bedside instruments that fill a confirmed gap: the catalog carries the pediatric
> GCS, Kocher criteria, PECARN rules, and pediatric BMI percentiles, but not the
> croup severity score, the neonatal abstinence score, the neonatal respiratory-
> distress score, or the pediatric early-warning score. None duplicates a live tile
> (all four checked absent at draft).
>
> Catalog effect: **live `UTILITIES.length` + 4** — enforced by the catalog-truth
> gate ([spec-v46](spec-v46.md)) at build time; no number is copied here.
>
> Every prior spec remains in force. v194 adds no runtime network call and no AI;
> each tile obeys the [spec-v100](spec-v100.md) §2 doctrine, passes the
> [spec-v29](spec-v29.md) §3 one-line test, ships its citation inline
> ([spec-v54](spec-v54.md)), inherits the [spec-v59](spec-v59.md) output-safety
> contract, renders the [spec-v50](spec-v50.md) §3 posture note, and honors
> [spec-v11](spec-v11.md) §5.3 (**no medication, escalation, or admission order in
> Sophie's voice**). **Every item, anchor, and escalation threshold is re-fetched
> and cross-verified against ≥2 independent sources at implementation**
> ([spec-v97](spec-v97.md)); uncertain values carry an explicit *(verify at
> implementation, [spec-v97](spec-v97.md))* tag.

## 1. Thesis

The pediatric ward, the newborn nursery, and the pediatric ED run on a set of
validated observational scores the catalog is missing: the croup severity that
guides steroids and epinephrine (Westley), the neonatal abstinence score that
guides withdrawal treatment (Finnegan), the newborn respiratory-distress score
(Silverman-Andersen), and the early-warning score that flags a deteriorating
child (PEWS). v194 ships these four. Each is a fixed observational scale —
auditable, unit-tested at every band — and each is decision support, **never a
medication, escalation, or admission order**.

## 2. What v194 adds (4 tiles)

### 2.1 `westley-croup` — Westley Croup Severity Score

- **Citation:** Westley CR, Cotton EK, Brooks JG. Nebulized racemic epinephrine by
  IPPB for the treatment of croup. *Am J Dis Child.* 1978;132(5):484-487.
- **citationUrl:** https://doi.org/10.1001/archpedi.1978.02120300044008
- **Group:** G (clinical scoring). **Specialties:** `pediatric-emergency`,
  `pediatrics`, `emergency-medicine`, `nursing-peds`.
- **Inputs:** the five items — level of consciousness (0 or 5), cyanosis (0, 4, or
  5), stridor (0, 1, or 2), air entry (0, 1, or 2), and retractions (0, 1, 2, or 3).
- **Output:** the **Westley score (0–17)** banded **mild (≤ 2) / moderate (3–5) /
  severe (6–11) / impending respiratory failure (≥ 12)** *(verify band edges at
  implementation, [spec-v97](spec-v97.md))*, naming the items. Class A. Cross-links
  the pediatric respiratory tiles.

### 2.2 `finnegan-nas` — Finnegan Neonatal Abstinence Score

- **Citation:** Finnegan LP, Connaughton JF Jr, Kron RE, Emich JP. Neonatal
  abstinence syndrome: assessment and management. *Addict Dis.* 1975;2(1-2):141-158.
- **citationUrl:** https://pubmed.ncbi.nlm.nih.gov/1163358/
- **Group:** G. **Specialties:** `neonatology`, `nursing-nicu`, `pediatrics`.
- **Inputs:** the weighted signs across the CNS, metabolic/vasomotor/respiratory,
  and gastrointestinal domains (e.g., high-pitched cry, sleep after feeding,
  Moro reflex, tremors, tone, excoriation, myoclonus, seizures, sweating, fever,
  yawning, nasal stuffiness/sneezing/flaring, respiratory rate, feeding, regurgitation,
  stools), each with its published point value.
- **Output:** the **total score**, banded against the pharmacologic-treatment
  threshold (the commonly-cited three-consecutive-scores ≥ 8, or a single ≥ 12
  *(verify at implementation, [spec-v97](spec-v97.md))*), naming the domains. Class
  A. Cross-links the neonatal tiles.

### 2.3 `silverman-andersen` — Silverman-Andersen Respiratory Severity Score

- **Citation:** Silverman WA, Andersen DH. A controlled clinical trial of effects
  of water mist on obstructive respiratory signs, death rate and necropsy findings
  among premature infants. *Pediatrics.* 1956;17(1):1-10.
- **citationUrl:** https://doi.org/10.1542/peds.17.1.1
- **Group:** G. **Specialties:** `neonatology`, `nursing-nicu`,
  `pediatric-critical-care`.
- **Inputs:** the five signs each 0–2 — chest movement (upper-chest/abdomen
  synchrony), intercostal retractions, xiphoid retractions, nares dilation, and
  expiratory grunt. Note the **inverted scale**: 0 is no distress, 10 is severe.
- **Output:** the **Silverman-Andersen score (0–10)**, banded (0 no distress, rising
  to severe), naming the signs and stating the inverted direction (unlike an Apgar,
  a higher score is worse). Class A. Cross-links `westley-croup`.

### 2.4 `pews` — Pediatric Early Warning Score

- **Citation:** Duncan H, Hutchison J, Parshuram CS. The Pediatric Early Warning
  System score: a severity of illness score to predict urgent medical need in
  hospitalized children. *J Crit Care.* 2006;21(3):271-278. (Brighton PEWS:
  Monaghan A. *Paediatr Nurs.* 2005;17(1):32-35.)
- **citationUrl:** https://doi.org/10.1016/j.jcrc.2006.06.007
- **Group:** G. **Specialties:** `pediatrics`, `nursing-peds`,
  `pediatric-critical-care`, `pediatric-emergency`.
- **Inputs:** the three Brighton components each 0–3 — behavior, cardiovascular
  (color / capillary refill), and respiratory (rate / effort / oxygen) — plus the
  escalation points for persistent nebulizers and post-nebulizer emesis *(the exact
  component thresholds are age-banded; verified at implementation,
  [spec-v97](spec-v97.md))*.
- **Output:** the **PEWS total**, banded against the escalation threshold (a total
  ≥ 3, or any single component of 3, prompts review *(verify at implementation,
  [spec-v97](spec-v97.md))*), naming the components. Class A. Cross-links the
  pediatric vital-sign tiles.

## 3. Per-tile robustness

- **Every compute routes through `lib/num.js` and is finite-guarded.** Each item is
  clamped to its published range before summing; a blank required item renders a
  complete-the-fields fallback rather than a partial total read as complete.
- **`silverman-andersen` states its inverted direction as first-class output**, so
  the score is never misread as an Apgar-like "higher is better"
  ([spec-v59](spec-v59.md) output-safety).
- **`finnegan-nas` and `pews` render their escalation thresholds, not an
  escalation order** — the pharmacologic-treatment and rapid-response triggers are
  described, never issued in Sophie's voice ([spec-v11](spec-v11.md) §5.3).
- **All four flow through the [spec-v59](spec-v59.md) fuzz harness with zero
  non-finite leaks**, fuzzed at the band boundaries.
- **These observe and stratify; they are not orders.** Every tile renders the
  [spec-v50](spec-v50.md) §3 posture note; none authors a medication, escalation, or
  admission order in Sophie's voice ([spec-v11](spec-v11.md) §5.3).

## 4. CI/CD & maintenance

- **Maintenance classes (§6.3):** all four are **Class A** — fixed observational
  scales, each cited by journal + authors. The implementing session confirms the
  `ISSUER_PATTERN` ([spec-v92](spec-v92.md)/[spec-v94](spec-v94.md)) result at build
  time and adds a `docs/citation-staleness.md` row only if a society issuer matches.
- **Build & gates (§6.1/§6.2):** the four computes live in a new
  `lib/pedsacute-v194.js` module, added to `test/unit/fuzz-tools.test.js` `MODULES`.
  Renderers live in a new `views/group-v194.js`; its `RV194` export is spread into
  the `app.js` `RENDERERS` map. Every input carries a real `<label for>`. The
  catalog count moves on all **13 catalog-truth surfaces** using the **live
  `UTILITIES.length` + 4**; a11y, `mobile-no-hscroll`, `mobile-touch-targets`, and
  the chromium `example-correctness` sweep pass.
- **Specialties** are drawn from the closed vocabulary: `pediatric-emergency`,
  `pediatrics`, `emergency-medicine`, `nursing-peds`, `neonatology`,
  `nursing-nicu`, `pediatric-critical-care` — all already in the vocabulary.

## 5. Files touched

```
docs/spec-v194.md                        (this file)
app.js                                   (+4 UTILITIES rows; import group-v194 RV194 into RENDERERS)
lib/pedsacute-v194.js                    (new: westleyCroup, finneganNas, silvermanAndersen, pews)
lib/meta.js                              (+4 META entries: inline citation + citationUrl + accessed; cross-links)
views/group-v194.js                      (new renderer module: 4 renderers)
docs/clinical-citations.md               (+4 rows)
test/unit/westley-croup.test.js, finnegan-nas.test.js, silverman-andersen.test.js, pews.test.js  (>=3 worked examples each)
test/unit/fuzz-tools.test.js             (add lib/pedsacute-v194.js to MODULES)
docs/audits/v12/*.md                     (4 spec-v11 audit logs)
docs/scope-acute-triage-severity.md      (record the v194 delta)
CHANGELOG.md, README.md, package.json    (catalog count live -> live+4; spec-progression line)
```

## 6. Acceptance criteria

v194 is fully shipped when:

- The implementing session has **re-run the [spec-v85 §6.2](spec-v85.md) collision
  check** and confirmed all four ids are absent.
- All 4 tiles in §2 are live (Class A) with a `META[id]` entry, inline citation +
  `citationUrl` + `accessed`, and ≥ 3 worked examples each — including a **Westley
  band crossing (moderate → severe)**, a **Finnegan crossing the treatment
  threshold**, a **Silverman-Andersen example demonstrating the inverted scale**,
  and a **PEWS crossing the escalation threshold**.
- Every compute is finite-guarded, routes through `lib/num.js`, and is covered by
  the [spec-v59](spec-v59.md) fuzz harness with **zero non-finite leaks**.
- `UTILITIES.length` is **live + 4** and all catalog-truth surfaces agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass;
  the CHANGELOG records v194 with the +4 delta.

## 7. Out of scope for v194

- **No medication order** — the scores guide, but do not issue, croup steroids /
  epinephrine, neonatal opioid weaning, or respiratory support
  ([spec-v11](spec-v11.md) §5.3).
- **No rapid-response automation** — `pews` describes the escalation threshold; the
  activation stays with the bedside team and local protocol.
- **No single canonical NAS tool mandate** — `finnegan-nas` ships the Finnegan
  instrument; ESC (Eat-Sleep-Console) and other approaches are out of scope for
  this slice.
