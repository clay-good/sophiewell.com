# spec-v122.md — General neurology & rehab: Hachinski Ischemic Score, Modified Ashworth Scale, and Bickerstaff criteria (+3 tiles)

> Status: **PROPOSED (2026-06-17).** Feature spec of the [spec-v100](spec-v100.md)
> MDCalc Parity Completion program, **Wave 4 (Neurology / neurosurgery / psychiatry)**.
> Adds **3** deterministic general-neurology and rehabilitation instruments that fill
> confirmed gaps. None duplicates a live tile.
>
> Catalog effect at v122 close: **531 + 3 = 534 tiles.**
>
> Every prior spec (v4 through v121) remains in force. v122 adds no runtime network
> call and no AI; each tile obeys the [spec-v100](spec-v100.md) §2 doctrine (which
> re-binds the [spec-v85](spec-v85.md) §2 doctrine) and the [spec-v100](spec-v100.md)
> §6 CI/CD contract, passes the [spec-v29](spec-v29.md) §3 one-line test, ships its
> primary citation inline ([spec-v54](spec-v54.md)), and inherits the
> [spec-v59](spec-v59.md) output-safety contract.

## 1. Thesis

Three general-neurology and rehabilitation instruments that cross specialty lines
(dementia type, spasticity grading, brainstem-encephalitis diagnosis) are absent:

- **`hachinski`** — the Hachinski Ischemic Score distinguishing vascular from
  Alzheimer-type dementia (a 13-item weighted score).
- **`modified-ashworth`** — the Modified Ashworth Scale grading muscle spasticity, the
  bedside standard in PM&R and physical therapy.
- **`bickerstaff`** — the Bickerstaff brainstem-encephalitis diagnostic criteria
  (ophthalmoplegia + ataxia + altered consciousness).

Each is a published, deterministic instrument a neurology / rehab clinician already
uses; v122 brings them onto the page.

## 2. What v122 adds (3 tiles)

### 2.1 `hachinski` — Hachinski Ischemic Score

- **Citation:** Hachinski VC, Iliff LD, Zilhka E, et al. Cerebral blood flow in
  dementia. *Arch Neurol.* 1975;32(9):632-637.
- **citationUrl:** https://doi.org/10.1001/archneur.1975.00490510088009
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `neurology`, `geriatrics`, `internal-medicine`, `psychiatry`.
- **Inputs:** the 13 weighted features — abrupt onset, stepwise deterioration,
  fluctuating course, nocturnal confusion, relative preservation of personality,
  depression, somatic complaints, emotional incontinence, history/presence of
  hypertension, history of strokes, associated atherosclerosis, focal neurological
  symptoms, and focal neurological signs (each weighted 1 or 2 per the source).
- **Output:** the **Hachinski total** with the source's framing (≤ 4 favors a primary
  degenerative/Alzheimer-type dementia; ≥ 7 favors a vascular/multi-infarct cause; 5–6
  is indeterminate). Class A (fixed point weights; citation names the journal + authors).

### 2.2 `modified-ashworth` — Modified Ashworth Scale

- **Citation:** Bohannon RW, Smith MB. Interrater reliability of a modified Ashworth
  scale of muscle spasticity. *Phys Ther.* 1987;67(2):206-207.
- **citationUrl:** https://doi.org/10.1093/ptj/67.2.206
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `physical-medicine-rehabilitation`, `physical-therapy`, `neurology`,
  `rehabilitation`.
- **Inputs:** the examiner's single ordinal selection of the resistance to passive
  movement for the muscle group tested.
- **Output:** the **Modified Ashworth grade** on the ordinal scale **0, 1, 1+, 2, 3, 4**
  with the source's description of each grade. Class A (fixed ordinal scale). The "1+"
  level is rendered as a distinct ordinal step (not arithmetically summed) so the
  grading reads exactly as published.

### 2.3 `bickerstaff` — Bickerstaff Brainstem Encephalitis Criteria

- **Citation:** Odaka M, Yuki N, Yamada M, et al. Bickerstaff's brainstem encephalitis:
  clinical features of 62 cases and a subgroup associated with Guillain-Barré syndrome.
  *Brain.* 2003;126(Pt 10):2279-2290.
- **citationUrl:** https://doi.org/10.1093/brain/awg233
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `neurology`, `neurocritical-care`, `internal-medicine`, `emergency-medicine`.
- **Inputs:** the core diagnostic features — progressive symmetric external
  ophthalmoplegia and ataxia, plus altered consciousness or hyperreflexia, and the
  supporting/exclusion items.
- **Output:** the **diagnostic determination** (features consistent with Bickerstaff
  brainstem encephalitis vs not), naming which core criteria were satisfied. Class A
  (fixed diagnostic checklist; citation names the journal + authors). Cross-links
  `brighton-gbs` (the GBS-spectrum companion).

## 3. Per-tile robustness

- **`hachinski` is a bounded weighted sum** re-fetched verbatim from the source (per the
  v97 "re-fetch, never recall coefficients" lesson) with each item's published weight;
  the total is clamped to its range and the band lookup is a deterministic table.
- **`modified-ashworth` is an ordinal selector, not an arithmetic sum.** The "0, 1, 1+,
  2, 3, 4" levels are rendered as discrete ordinal steps; the compute maps the selection
  to its label with no math that can overflow or produce a fractional grade.
- **`bickerstaff` is a diagnostic-checklist rule**, bounded and deterministic with no
  overflow-prone arithmetic; it names the inputs that drove the verdict.
- All three flow through the [spec-v59](spec-v59.md) fuzz harness with zero non-finite
  leaks, render the [spec-v50](spec-v50.md) §3 clinical posture note, quote the source's
  interpretation, and author no treatment recommendation in Sophie's voice
  ([spec-v11](spec-v11.md) §5.3). Each is mobile-first per [spec-v72](spec-v72.md)
  (44px targets, no 320px horizontal scroll).

## 4. CI/CD & maintenance

Per the [spec-v100](spec-v100.md) §6 contract (re-binding [spec-v85](spec-v85.md) §6):

- **Maintenance classes (§6.3):** all three are **Class A** (fixed point weights /
  ordinal scale / diagnostic checklist; each citation names the journal + authors, not
  an issuing society, so none trips the `ISSUER_PATTERN` gotcha) — **no**
  `docs/citation-staleness.md` row.
- **Build (§6.1):** the compute lives in new `lib/neuro-v122.js`; the renderer is new
  `views/group-v122.js` whose `RV122` export is added to the `app.js` `RENDERERS`
  spread; three `UTILITIES` rows (all group G) and three `META` entries (inline citation
  + `citationUrl` + `accessed`).
- **Gates (§6.2):** `lib/neuro-v122.js` is added to the `test/unit/fuzz-tools.test.js`
  `MODULES` list (zero non-finite leaks); each `META` example is pinned by the chromium
  `example-correctness` sweep; the catalog count moves on all **13 catalog-truth
  surfaces**; a11y, `mobile-no-hscroll`, and 44px touch-target checks pass for
  `views/group-v122.js`.

## 5. Files touched

```
docs/spec-v122.md                        (this file)
app.js                                   (+3 UTILITIES rows, group G; import group-v122 renderers into RENDERERS as RV122)
lib/neuro-v122.js                        (new module: hachinski, modifiedAshworth, bickerstaff)
lib/meta.js                              (+3 META entries: inline citation + citationUrl + accessed; cross-links to brighton-gbs)
views/group-v122.js                      (new renderer module: 3 renderers; incl. the 0/1/1+/2/3/4 ordinal selector)
docs/clinical-citations.md               (+ rows for the three sources)
test/unit/hachinski.test.js, modified-ashworth.test.js, bickerstaff.test.js  (≥3 boundary worked examples each)
test/unit/fuzz-tools.test.js             (add lib/neuro-v122.js to MODULES)
docs/audits/v12/hachinski.md, modified-ashworth.md, bickerstaff.md  (spec-v11 audit logs)
docs/scope-mdcalc-parity.md              (catalog count 531 -> 534; running v100 program ledger)
CHANGELOG.md                             (Unreleased: v122 entry, +3)
README.md, package.json                  (catalog count 531 -> 534; spec-progression line -> v122)
```

## 6. Acceptance criteria

v122 is fully shipped when:

- The implementing session has **re-run the §6.2 collision check** and confirmed all
  three ids are absent from the live catalog and from each other.
- All 3 tiles in §2 are live in Group G with a `META[id]` entry, an inline primary
  citation + `citationUrl` + `accessed`, ≥3 boundary worked examples each (including a
  `hachinski` ≤4-vs-≥7 vascular/degenerative band-flip, a `modified-ashworth` "1+" vs
  "2" ordinal step, and a `bickerstaff` criteria-met vs criteria-not-met case), a
  [spec-v11](spec-v11.md) audit log, and a passing [spec-v29](spec-v29.md) §3 check.
- `modified-ashworth` renders the "1+" level as a distinct ordinal step (no arithmetic);
  partial inputs render a complete-the-fields fallback.
- Every compute function uses `lib/num.js` and is covered by the
  [spec-v59](spec-v59.md) fuzz harness with zero non-finite leaks.
- All three are **Class A** — no `docs/citation-staleness.md` row.
- `UTILITIES.length` is **534** (or the then-current live count + 3 if specs land out
  of order) and all catalog-truth surfaces ([spec-v46](spec-v46.md)) agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass.
- The CHANGELOG records v122 with the +3 catalog delta.

## 7. Out of scope for v122

- **No imaging or EMG parsing** — each tile takes the clinician's exam/history findings
  as input; v122 parses no study feed.
- **No `brighton-gbs` re-implementation** — the existing v121 tile stands; `bickerstaff`
  cross-links it as the GBS-spectrum companion.
- **No auto-diagnosis, auto-anti-spasticity, or auto-treatment order** — each tile
  reports the score/grade/determination and the source's stated framing; the management
  decision stays with the clinician and local protocol ([spec-v11](spec-v11.md) §5.3).
