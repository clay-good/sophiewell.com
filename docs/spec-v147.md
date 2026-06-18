# spec-v147.md — Rheumatology activity & classification: CDAI, SDAI, 2010 ACR/EULAR RA, SLEDAI-2K, 2015 gout, CASPAR, and 2016 fibromyalgia (+7 tiles)

> Status: **PROPOSED (2026-06-17).** Feature spec of the
> [spec-v100](spec-v100.md) **MDCalc Parity Completion** program, **Wave 8**
> (Surgery / anesthesia / ortho / rheum / geriatrics / pharmacy). Adds **7**
> deterministic rheumatology disease-activity and classification instruments that
> fill confirmed gaps. None duplicates a live tile.
>
> Catalog effect at v147 close: **664 + 7 = 671 tiles** (or live count + 7 if
> specs land out of order; the catalog-truth gate enforces agreement).
>
> Every prior spec (v4 through v146) remains in force. v147 adds no runtime
> network call and no AI; each tile obeys the [spec-v100](spec-v100.md) §2
> doctrine (re-binding [spec-v85](spec-v85.md) §2) — including the §2
> classification-tile clarification — and the [spec-v100](spec-v100.md) §6 CI/CD
> contract. Each passes the [spec-v29](spec-v29.md) §3 one-line test, ships its
> primary citation inline ([spec-v54](spec-v54.md)), and inherits the
> [spec-v59](spec-v59.md) output-safety contract.

## 1. Thesis

The catalog has `das28` (DAS28 RA disease activity) as the rheumatology anchor, but
the rest of the standard rheumatology activity/classification surface is absent. The
[spec-v100](spec-v100.md) §7 deepening backlog explicitly pairs `das28` with the
CDAI/SDAI suite; v147 ships that suite plus the major classification criteria. CDAI
and SDAI are the lab-light/CRP-adding DAS28 companions; the 2010 ACR/EULAR RA,
2015 gout, CASPAR, and 2016 fibromyalgia criteria are the standard classification
rules; and SLEDAI-2K is the SLE activity index. Each sits beside `das28`.

- **CDAI** — the Clinical Disease Activity Index, SJC28 + TJC28 + patient and
  physician global (0–76), entirely lab-free; the DAS28 sibling for clinic use.
- **SDAI** — the Simplified Disease Activity Index, the CDAI inputs **plus** CRP
  (mg/dL), 0–86; cross-linked to CDAI.
- **2010 ACR/EULAR RA** — the four-domain (joints, serology, acute-phase,
  duration) classification, 0–10; **≥ 6 = definite RA** (the entry/threshold rule).
- **SLEDAI-2K** — the weighted-descriptor SLE disease-activity index (0–105).
- **2015 ACR/EULAR gout** — the entry criterion + MSU-crystal sufficient bypass +
  weighted clinical/lab/imaging domains; **≥ 8 = classified gout**.
- **CASPAR** — the psoriatic-arthritis classification: inflammatory articular
  disease entry + ≥ 3 weighted points.
- **2016 fibromyalgia** — the revised ACR criteria from the Widespread Pain Index
  (WPI) and Symptom Severity Scale (SSS) with the generalized-pain condition.

## 2. What v147 adds (7 tiles)

### 2.1 `cdai-ra` — Clinical Disease Activity Index (RA)

- **Citation:** Aletaha D, Nell VPK, Stamm T, et al. Acute phase reactants add
  little to composite disease activity indices for rheumatoid arthritis: validation
  of a clinical activity score. *Arthritis Res Ther.* 2005;7(4):R796-R806.
- **citationUrl:** https://doi.org/10.1186/ar1740
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `rheumatology`, `internal-medicine`.
- **Inputs:** swollen-joint count (0–28), tender-joint count (0–28), patient global
  assessment (0–10 cm VAS), physician global assessment (0–10 cm VAS).
- **Output:** the **CDAI total (0–76)** with the published bands — remission ≤2.8,
  low ≤10, moderate ≤22, high >22. Class A. Near-neighbor: `das28`/`sdai-ra` —
  cross-linked (the RA activity suite).

### 2.2 `sdai-ra` — Simplified Disease Activity Index (RA)

- **Citation:** Smolen JS, Breedveld FC, Schiff MH, et al. A simplified disease
  activity index for rheumatoid arthritis for use in clinical practice.
  *Rheumatology (Oxford).* 2003;42(2):244-257.
- **citationUrl:** https://doi.org/10.1093/rheumatology/keg072
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `rheumatology`, `internal-medicine`.
- **Inputs:** the CDAI inputs (SJC28, TJC28, patient global, physician global) plus
  CRP (mg/dL).
- **Output:** the **SDAI total (0–86)** with the published bands — remission ≤3.3,
  low ≤11, moderate ≤26, high >26. Class A. Cross-links `cdai-ra` and `das28`.

### 2.3 `acr-eular-2010-ra` — 2010 ACR/EULAR Rheumatoid Arthritis Classification

- **Citation:** Aletaha D, Neogi T, Silman AJ, et al. 2010 Rheumatoid arthritis
  classification criteria: an American College of Rheumatology/European League
  Against Rheumatism collaborative initiative. *Arthritis Rheum.*
  2010;62(9):2569-2581.
- **citationUrl:** https://doi.org/10.1002/art.27584
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `rheumatology`, `internal-medicine`.
- **Inputs:** the 4 weighted domains — joint involvement (number/size, 0–5),
  serology (RF / anti-CCP negative/low/high, 0–3), acute-phase reactants (CRP/ESR
  normal vs abnormal, 0–1), symptom duration (<6 vs ≥6 weeks, 0–1); applied after
  the entry condition (≥1 joint with definite clinical synovitis not better
  explained otherwise).
- **Output:** the **total (0–10)** with the published threshold **≥ 6 = definite
  RA**, naming the domain scores. Class B (ACR/EULAR classification criteria —
  `docs/citation-staleness.md` row).

### 2.4 `sledai-2k` — SLEDAI-2K (SLE Disease Activity Index)

- **Citation:** Gladman DD, Ibañez D, Urowitz MB. Systemic lupus erythematosus
  disease activity index 2000. *J Rheumatol.* 2002;29(2):288-291.
- **citationUrl:** https://pubmed.ncbi.nlm.nih.gov/11838846/ (verify DOI at
  implementation)
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `rheumatology`, `internal-medicine`, `dermatology`.
- **Inputs:** the 24 weighted descriptors (each present/absent) across CNS,
  vascular, renal, musculoskeletal, serosal, dermatologic, immunologic, and
  constitutional/hematologic domains, with the SLEDAI-2K weights (8/4/2/1).
- **Output:** the **total (0–105)** with the published activity framing (e.g.,
  ≥6 commonly denoting clinically meaningful active disease), naming the
  descriptors counted. Class A.

### 2.5 `gout-acr-eular-2015` — 2015 ACR/EULAR Gout Classification

- **Citation:** Neogi T, Jansen TLTA, Dalbeth N, et al. 2015 Gout classification
  criteria: an American College of Rheumatology/European League Against Rheumatism
  collaborative initiative. *Arthritis Rheumatol.* 2015;67(10):2557-2568.
- **citationUrl:** https://doi.org/10.1002/art.39254
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `rheumatology`, `internal-medicine`, `emergency-medicine`.
- **Inputs:** the entry criterion (≥1 episode of peripheral-joint/bursa swelling/
  pain/tenderness), the sufficient criterion (MSU crystals in a symptomatic joint/
  bursa or tophus → classifies directly), then the weighted clinical pattern, serum
  urate band, synovial-fluid analysis, and imaging (US double-contour / DECT urate /
  erosion) domains.
- **Output:** the **classification** — sufficient-criterion bypass, or the weighted
  **total with ≥ 8 = classified gout** — naming the contributing domains. Class B
  (ACR/EULAR classification criteria — `docs/citation-staleness.md` row).

### 2.6 `caspar` — CASPAR Psoriatic Arthritis Criteria

- **Citation:** Taylor W, Gladman D, Helliwell P, et al. Classification criteria
  for psoriatic arthritis: development of new criteria from a large international
  study. *Arthritis Rheum.* 2006;54(8):2665-2670.
- **citationUrl:** https://doi.org/10.1002/art.21972
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `rheumatology`, `dermatology`, `internal-medicine`.
- **Inputs:** the entry condition (inflammatory articular disease — joint/spine/
  entheseal) plus the weighted items — psoriasis (current 2 / history 1 / family
  history 1), psoriatic nail dystrophy, negative RF, dactylitis (current/history),
  and juxta-articular new bone formation on radiograph.
- **Output:** the **classification** — inflammatory articular disease entry **and**
  **≥ 3 points** → CASPAR-positive psoriatic arthritis — naming the items counted.
  Class B (society classification criteria — `docs/citation-staleness.md` row).

### 2.7 `fibromyalgia-acr-2016` — 2016 Revised ACR Fibromyalgia Criteria

- **Citation:** Wolfe F, Clauw DJ, Fitzcharles MA, et al. 2016 Revisions to the
  2010/2011 fibromyalgia diagnostic criteria. *Semin Arthritis Rheum.*
  2016;46(3):319-329.
- **citationUrl:** https://doi.org/10.1016/j.semarthrit.2016.08.012
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `rheumatology`, `pain-medicine`, `internal-medicine`.
- **Inputs:** the Widespread Pain Index (WPI, 0–19 regions), the Symptom Severity
  Scale (SSS, 0–12: fatigue/waking-unrefreshed/cognitive 0–3 each + somatic-symptom
  burden 0–3), generalized pain (≥4 of 5 regions), and symptom duration ≥3 months.
- **Output:** the **criteria-met / not-met** determination per the rule (WPI ≥7 and
  SSS ≥5, **or** WPI 4–6 and SSS ≥9; generalized pain present; duration ≥3 months),
  with the WPI/SSS values shown. Class A (the 2016 revision is a fixed published
  criteria set cited by journal + authors).

## 3. Per-tile robustness

- **`cdai-ra`, `sdai-ra`, and `sledai-2k` are bounded weighted sums** mapped to
  published activity bands; band boundaries (CDAI 2.8/10/22; SDAI 3.3/11/26) are
  unit-tested at each cutoff. `sdai-ra` guards the CRP addend (finite, non-negative)
  so a malformed CRP returns a surfaced fallback, not a sum with `NaN`.
- **`acr-eular-2010-ra`, `gout-acr-eular-2015`, and `caspar` are weighted sums with
  entry and (for gout) sufficient criteria.** The entry condition is enforced first:
  without it the tile states the criteria do not apply rather than scoring; the gout
  sufficient-criterion (MSU crystals/tophus) short-circuits to classified before the
  weighted total is computed. Each names which domains/items contributed.
- **`fibromyalgia-acr-2016` is dual-threshold boolean logic** (the WPI/SSS
  either-branch plus generalized pain and duration); both branches and the
  generalized-pain gate are unit-tested.
- All seven are categorical/bounded; the [spec-v59](spec-v59.md) fuzz harness
  asserts every input combination resolves to a defined band/decision with no
  `NaN`/`undefined`; blank required inputs render a complete-the-fields fallback.
- All seven render the [spec-v50](spec-v50.md) §3 clinical posture note and quote
  the source's interpretation; none authors a treat/escalate recommendation in
  Sophie's voice ([spec-v11](spec-v11.md) §5.3).

## 4. CI/CD & maintenance

Per the [spec-v100](spec-v100.md) §6 contract (re-binding
[spec-v85](spec-v85.md) §6):

- **Maintenance classes (§6.3):** `cdai-ra`, `sdai-ra`, `sledai-2k`, and
  `fibromyalgia-acr-2016` are **Class A** — fixed published indices/criteria cited
  by journal + authors. **`acr-eular-2010-ra`, `gout-acr-eular-2015`, and `caspar`
  are Class B** — they are ACR/EULAR (society) classification criteria; their
  citations name **ACR/EULAR**, which trips the `ISSUER_PATTERN` in
  `check-citations.mjs` ([spec-v92](spec-v92.md)/[spec-v94](spec-v94.md) lesson), so
  each gets a `docs/citation-staleness.md` row naming the edition in force (2010 RA,
  2015 gout, 2006 CASPAR), the `accessed` date, and an on-publication review cadence,
  monitored by `scripts/check-citation-cadence.mjs`. (`fibromyalgia-acr-2016` is
  phrased to name the journal/authors, so it stays Class A.)
- **Build & gates (§6.1/§6.2):** the seven computes live in the new
  `lib/rheum-v147.js` module (`cdaiRa`, `sdaiRa`, `acrEular2010Ra`, `sledai2k`,
  `goutAcrEular2015`, `caspar`, `fibromyalgiaAcr2016`), added to the
  `test/unit/fuzz-tools.test.js` `MODULES` list (zero non-finite leaks; every band
  boundary covered). Renderers live in the new `views/group-v147.js` module; its
  `RV147` export is spread into the `app.js` `RENDERERS` map. The catalog count
  moves on all **13 catalog-truth surfaces** in the same change; a11y,
  `mobile-no-hscroll`, `mobile-touch-targets`, and the chromium
  `example-correctness` sweep pass for `views/group-v147.js`.

## 5. Files touched

```
docs/spec-v147.md                        (this file)
app.js                                   (+7 UTILITIES rows, group G; import group-v147 RV147 into RENDERERS)
lib/rheum-v147.js                        (new module: cdaiRa, sdaiRa, acrEular2010Ra, sledai2k, goutAcrEular2015, caspar, fibromyalgiaAcr2016)
lib/meta.js                              (+7 META entries: inline citation + citationUrl + accessed; cross-links to das28)
views/group-v147.js                      (new renderer module: 7 renderers)
docs/citation-staleness.md               (+ rows: acr-eular-2010-ra, gout-acr-eular-2015, caspar)
docs/clinical-citations.md               (+ rows for the seven sources)
test/unit/cdai-ra.test.js, sdai-ra.test.js, acr-eular-2010-ra.test.js, sledai-2k.test.js, gout-acr-eular-2015.test.js, caspar.test.js, fibromyalgia-acr-2016.test.js  (≥3 boundary worked examples each)
test/unit/fuzz-tools.test.js             (add lib/rheum-v147.js to MODULES)
docs/audits/v12/cdai-ra.md, sdai-ra.md, acr-eular-2010-ra.md, sledai-2k.md, gout-acr-eular-2015.md, caspar.md, fibromyalgia-acr-2016.md  (spec-v11 audit logs)
docs/scope-mdcalc-parity.md              (catalog count 664 -> 671; advance the spec-v100 running ledger)
CHANGELOG.md                             (Unreleased: v147 entry, +7)
README.md, package.json                  (catalog count 664 -> 671; spec-progression line -> v147)
```

## 6. Acceptance criteria

v147 is fully shipped when:

- The implementing session has **re-run the [spec-v85 §6.2](spec-v85.md) collision
  check** and confirmed all seven ids are absent.
- All 7 tiles in §2 are live in Group G with a `META[id]` entry, an inline primary
  citation + `citationUrl` + `accessed`, ≥3 boundary worked examples each
  (including a **2010 ACR/EULAR RA ≥ 6 definite flip**, a CDAI **low→moderate (10→
  10.x) boundary**, a **2015 gout MSU-sufficient bypass vs weighted ≥ 8** pair, and
  a fibromyalgia WPI/SSS either-branch case), a [spec-v11](spec-v11.md) audit log,
  and a passing [spec-v29](spec-v29.md) §3 check.
- The entry/sufficient criteria are enforced (RA/gout/CASPAR entry first; gout MSU
  short-circuit); band boundaries land in the published band; blank inputs render a
  complete-the-fields fallback.
- Every compute uses `lib/num.js` and is covered by the [spec-v59](spec-v59.md)
  fuzz harness with zero non-finite leaks.
- `acr-eular-2010-ra`, `gout-acr-eular-2015`, and `caspar` carry `accessed` + a
  `docs/citation-staleness.md` row.
- `UTILITIES.length` is **671** (or live count + 7) and all catalog-truth surfaces
  ([spec-v46](spec-v46.md)) agree; `scope-mdcalc-parity.md` advances the spec-v100
  ledger.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass.
- The CHANGELOG records v147 with the +7 catalog delta.

## 7. Out of scope for v147

- **No automatic treat/escalate/DMARD order** — each tile reports the activity band/
  classification and the source's interpretation; the treatment decision stays with
  the rheumatologist and local protocol ([spec-v11](spec-v11.md) §5.3).
- **No imaging/serology parsing** — the criteria tiles take the clinician's read of
  the serology, synovial fluid, and imaging as bounded inputs.
- **No `das28` re-implementation** — the existing tile stands; `cdai-ra`/`sdai-ra`
  are the suite deepening that cross-links it.
- **No browsable criteria index** — per the [spec-v100](spec-v100.md) §2
  clarification, every tile consumes inputs and computes a score/classification.
