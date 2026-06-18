# spec-v121.md — Neuromuscular: GBS & myasthenia: EGRIS, mEGOS, Brighton GBS, and MGFA + MG-ADL (+4 tiles)

> Status: **PROPOSED (2026-06-17).** Feature spec of the [spec-v100](spec-v100.md)
> MDCalc Parity Completion program, **Wave 4 (Neurology / neurosurgery / psychiatry)**.
> Adds **4** deterministic Guillain-Barré-syndrome and myasthenia-gravis instruments
> that fill confirmed gaps. None duplicates a live tile.
>
> Catalog effect at v121 close: **527 + 4 = 531 tiles.**
>
> Every prior spec (v4 through v120) remains in force. v121 adds no runtime network
> call and no AI; each tile obeys the [spec-v100](spec-v100.md) §2 doctrine (which
> re-binds the [spec-v85](spec-v85.md) §2 doctrine) and the [spec-v100](spec-v100.md)
> §6 CI/CD contract, passes the [spec-v29](spec-v29.md) §3 one-line test, ships its
> primary citation inline ([spec-v54](spec-v54.md)), and inherits the
> [spec-v59](spec-v59.md) output-safety contract.

## 1. Thesis

The catalog has no neuromuscular-emergency prognosis or severity tools — the GBS and
myasthenia instruments that a neurology and neurocritical-care service uses to predict
respiratory failure and grade disease. Four standard instruments are absent:

- **`egris`** — the Erasmus GBS Respiratory Insufficiency Score (risk of mechanical
  ventilation in week 1).
- **`megos`** — the modified Erasmus GBS Outcome Score (inability to walk unaided at
  4 and 26 weeks).
- **`brighton-gbs`** — the Brighton Collaboration GBS diagnostic-certainty level (1–4).
- **`mgfa`** — the MGFA clinical classification plus the 8-item MG-ADL severity score.

Each is a published, deterministic instrument a neurology clinician already uses;
v121 brings them onto the page.

## 2. What v121 adds (4 tiles)

### 2.1 `egris` — Erasmus GBS Respiratory Insufficiency Score

- **Citation:** Walgaard C, Lingsma HF, Ruts L, et al. Prediction of respiratory
  insufficiency in Guillain-Barré syndrome. *Ann Neurol.* 2010;67(6):781-787.
- **citationUrl:** https://doi.org/10.1002/ana.21976
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `neurology`, `neurocritical-care`, `critical-care`, `nursing-neuro`.
- **Inputs:** days between onset of weakness and admission band, facial and/or bulbar
  weakness, and the MRC sum-score band at admission.
- **Output:** the **EGRIS total (0–7)** with the source's banded probability of needing
  mechanical ventilation within the first week. Class A (fixed point weights; citation
  names the journal + authors). Cross-links `mrc-sum-score`, `megos`.

### 2.2 `megos` — modified Erasmus GBS Outcome Score

- **Citation:** Walgaard C, Lingsma HF, Ruts L, van Doorn PA, Steyerberg EW, Jacobs BC.
  Early recognition of poor prognosis in Guillain-Barré syndrome. *Neurology.*
  2011;76(11):968-975.
- **citationUrl:** https://doi.org/10.1212/WNL.0b013e3182104407
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `neurology`, `neurocritical-care`, `physical-medicine-rehabilitation`,
  `nursing-neuro`.
- **Inputs:** age band, the presence of preceding diarrhea, and the MRC sum-score band
  (at admission and/or day 7, per the published variant).
- **Output:** the **mEGOS total** with the source's banded probability of being unable
  to walk unaided at 4 and 26 weeks. Class A (fixed point weights). Cross-links `egris`,
  `mrc-sum-score`.

### 2.3 `brighton-gbs` — Brighton Collaboration GBS Criteria

- **Citation:** Sejvar JJ, Kohl KS, Gidudu J, et al. Guillain-Barré syndrome and Fisher
  syndrome: case definitions and guidelines for collection, analysis, and presentation
  of immunization safety data. *Vaccine.* 2011;29(3):599-612.
- **citationUrl:** https://doi.org/10.1016/j.vaccine.2010.06.003
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `neurology`, `neurocritical-care`, `internal-medicine`, `emergency-medicine`.
- **Inputs:** bilateral flaccid limb weakness, decreased/absent reflexes, monophasic
  course with onset 12 h–28 days, CSF albuminocytologic dissociation, nerve-conduction
  findings consistent with GBS, and absence of an alternative diagnosis.
- **Output:** the **Brighton diagnostic-certainty level (1 highest – 4 lowest)** per the
  features met, naming which criteria were satisfied. Class A (fixed case definition;
  citation names the journal + authors, not an issuing society).

### 2.4 `mgfa` — MGFA Clinical Classification + MG-ADL

- **Citation:** Jaretzki A 3rd, Barohn RJ, Ernstoff RM, et al. Myasthenia gravis:
  recommendations for clinical research standards. *Neurology.* 2000;55(1):16-23; with
  the MG-ADL profile of Wolfe GI, Herbelin L, Statland JM, et al. (1999).
- **citationUrl:** https://doi.org/10.1212/WNL.55.1.16
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `neurology`, `neurocritical-care`, `internal-medicine`, `nursing-neuro`.
- **Inputs:** for the MGFA class — the predominant weakness pattern (ocular vs
  generalized) and its severity (mild / moderate / severe / intubation) selecting class
  I–V with the a/b subtype; for MG-ADL — the eight ADL items (talking, chewing,
  swallowing, breathing, brushing/combing, rising from a chair, double vision, eyelid
  droop), each 0–3.
- **Output:** the **MGFA class (I–V with a/b subtype)** and the **MG-ADL total (0–24)**.
  Class A (fixed classification + ordinal sum). Cross-links `egris`.

## 3. Per-tile robustness

- **`egris` and `megos` are bounded point-sum models** re-fetched verbatim from their
  derivation papers (per the v97 "re-fetch, never recall coefficients" lesson), each
  clamped to its published range with a deterministic band lookup.
- **`brighton-gbs` and the MGFA half of `mgfa` are classification rules** (certainty
  level; class with subtype), bounded and deterministic with no overflow-prone
  arithmetic; each names the inputs that drove the verdict.
- **The MG-ADL half of `mgfa` is a bounded ordinal sum** (8 items × 0–3 → 0–24); each
  item is clamped to 0–3 so the total cannot exceed 24, and a partially-answered profile
  reports which items were scored.
- All four flow through the [spec-v59](spec-v59.md) fuzz harness with zero non-finite
  leaks, render the [spec-v50](spec-v50.md) §3 clinical posture note, quote the source's
  interpretation, and author no treatment recommendation in Sophie's voice
  ([spec-v11](spec-v11.md) §5.3). Each is mobile-first per [spec-v72](spec-v72.md)
  (44px targets, no 320px horizontal scroll).

## 4. CI/CD & maintenance

Per the [spec-v100](spec-v100.md) §6 contract (re-binding [spec-v85](spec-v85.md) §6):

- **Maintenance classes (§6.3):** all four are **Class A** (fixed point weights / case
  definition / classification + ordinal sum; each citation names the journal + authors,
  not an issuing society, so none trips the `ISSUER_PATTERN` gotcha) — **no**
  `docs/citation-staleness.md` row.
- **Build (§6.1):** the compute lives in new `lib/neuro-v121.js`; the renderer is new
  `views/group-v121.js` whose `RV121` export is added to the `app.js` `RENDERERS`
  spread; four `UTILITIES` rows (all group G) and four `META` entries (inline citation +
  `citationUrl` + `accessed`).
- **Gates (§6.2):** `lib/neuro-v121.js` is added to the `test/unit/fuzz-tools.test.js`
  `MODULES` list (zero non-finite leaks); each `META` example is pinned by the chromium
  `example-correctness` sweep; the catalog count moves on all **13 catalog-truth
  surfaces**; a11y, `mobile-no-hscroll`, and 44px touch-target checks pass for
  `views/group-v121.js`.

## 5. Files touched

```
docs/spec-v121.md                        (this file)
app.js                                   (+4 UTILITIES rows, group G; import group-v121 renderers into RENDERERS as RV121)
lib/neuro-v121.js                        (new module: egris, megos, brightonGbs, mgfa)
lib/meta.js                              (+4 META entries: inline citation + citationUrl + accessed; cross-links to mrc-sum-score)
views/group-v121.js                      (new renderer module: 4 renderers; incl. the 8-item MG-ADL input)
docs/clinical-citations.md               (+ rows for the four sources)
test/unit/egris.test.js, megos.test.js, brighton-gbs.test.js, mgfa.test.js  (≥3 boundary worked examples each)
test/unit/fuzz-tools.test.js             (add lib/neuro-v121.js to MODULES)
docs/audits/v12/egris.md, megos.md, brighton-gbs.md, mgfa.md  (spec-v11 audit logs)
docs/scope-mdcalc-parity.md              (catalog count 527 -> 531; running v100 program ledger)
CHANGELOG.md                             (Unreleased: v121 entry, +4)
README.md, package.json                  (catalog count 527 -> 531; spec-progression line -> v121)
```

## 6. Acceptance criteria

v121 is fully shipped when:

- The implementing session has **re-run the §6.2 collision check** and confirmed all
  four ids are absent from the live catalog and from each other.
- All 4 tiles in §2 are live in Group G with a `META[id]` entry, an inline primary
  citation + `citationUrl` + `accessed`, ≥3 boundary worked examples each (including an
  `egris` low-vs-high ventilation-risk band-flip, a worked `megos` band, a
  `brighton-gbs` level-1-vs-level-3 case, and an `mgfa` class-II vs class-IV with an
  MG-ADL total band-flip), a [spec-v11](spec-v11.md) audit log, and a passing
  [spec-v29](spec-v29.md) §3 check.
- Each score clamps to its published range (MG-ADL items 0–3, total 0–24) and partial
  inputs render a complete-the-fields fallback.
- Every compute function uses `lib/num.js` and is covered by the
  [spec-v59](spec-v59.md) fuzz harness with zero non-finite leaks.
- All four are **Class A** — no `docs/citation-staleness.md` row.
- `UTILITIES.length` is **531** (or the then-current live count + 4 if specs land out
  of order) and all catalog-truth surfaces ([spec-v46](spec-v46.md)) agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass.
- The CHANGELOG records v121 with the +4 catalog delta.

## 7. Out of scope for v121

- **No nerve-conduction or CSF assay parsing** — `brighton-gbs` takes the clinician's
  determination that the NCS and CSF findings are consistent, not a raw study feed.
- **No `mrc-sum-score` re-implementation** — the existing v112 tile stands; `egris` and
  `megos` cross-link it as the strength input they band.
- **No auto-treatment, auto-IVIG/PLEX, or auto-intubation decision** — each tile reports
  the score/class/level and the source's stated framing; the management decision stays
  with the clinician and local protocol ([spec-v11](spec-v11.md) §5.3).
