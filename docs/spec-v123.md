# spec-v123.md — Psychiatry (public-domain instruments): AIMS, Bush-Francis catatonia, Barnes akathisia, SCOFF, and CES-D (+5 tiles)

> Status: **PROPOSED (2026-06-17).** Feature spec of the [spec-v100](spec-v100.md)
> MDCalc Parity Completion program, **Wave 4 (Neurology / neurosurgery / psychiatry)**.
> Closes Wave 4 with **5** deterministic, **confirmed public-domain / free-to-use**
> psychiatry instruments that fill confirmed gaps. None duplicates a live tile, and
> every instrument here is cleared against the [spec-v100](spec-v100.md) §8
> permanent-exclusion governance list.
>
> Catalog effect at v123 close: **534 + 5 = 539 tiles** — the Wave 4 end state.
>
> Every prior spec (v4 through v122) remains in force. v123 adds no runtime network
> call and no AI; each tile obeys the [spec-v100](spec-v100.md) §2 doctrine (which
> re-binds the [spec-v85](spec-v85.md) §2 doctrine) and the [spec-v100](spec-v100.md)
> §6 CI/CD contract, passes the [spec-v29](spec-v29.md) §3 one-line test, ships its
> primary citation inline ([spec-v54](spec-v54.md)), and inherits the
> [spec-v59](spec-v59.md) output-safety contract.

## 1. Thesis

The catalog has the free public-domain mood/risk screens (`phq9`, `cssrs`) but not the
movement-side-effect, catatonia, eating-disorder, and depression instruments a
psychiatry service uses — restricted, deliberately, to the ones whose copyright/license
status permits an interactive implementation. Five such instruments are absent:

- **`aims-tardive`** — the Abnormal Involuntary Movement Scale (AIMS) for tardive-
  dyskinesia severity, a US-government public-domain instrument (NIMH/ECDEU).
- **`bfcrs`** — the Bush-Francis Catatonia Rating Scale (screening + severity).
- **`bars-akathisia`** — the Barnes Akathisia Rating Scale for drug-induced akathisia.
- **`scoff`** — the SCOFF eating-disorder screen (free in the BMJ source paper).
- **`ces-d`** — the Center for Epidemiologic Studies Depression Scale, developed by NIMH
  and in the public domain.

Each is a published, deterministic instrument a psychiatry clinician already uses;
v123 brings them onto the page and closes Wave 4.

## 2. What v123 adds (5 tiles)

### 2.1 `aims-tardive` — Abnormal Involuntary Movement Scale (AIMS)

- **Citation:** Guy W. ECDEU Assessment Manual for Psychopharmacology (DHEW Publication
  No. ADM 76-338), Abnormal Involuntary Movement Scale (AIMS). Rockville, MD: US
  Department of Health, Education, and Welfare, NIMH; 1976:534-537.
- **citationUrl:** https://archive.org/details/ecdeuassessmentm1933guyw (verify at implementation)
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `psychiatry`, `nursing-psych`, `neurology`, `movement-disorders`.
- **Inputs:** the 12 AIMS items — seven movement items (facial/oral, extremity, trunk),
  each 0–4 in severity; the three global-judgment items; and the two dental-status items.
- **Output:** the **AIMS movement-severity total** (sum of the seven movement items,
  0–28) alongside the global-severity rating, naming the regions involved. Class A
  (fixed ordinal scale; US-government public-domain instrument). **Provenance:** the AIMS
  was produced by NIMH/ECDEU and is in the **public domain** — free to reproduce
  interactively ([spec-v100](spec-v100.md) §8 cleared). Cross-links `bars-akathisia`.

### 2.2 `bfcrs` — Bush-Francis Catatonia Rating Scale

- **Citation:** Bush G, Fink M, Petrides G, Dowling F, Francis A. Catatonia. I. Rating
  scale and standardized examination. *Acta Psychiatr Scand.* 1996;93(2):129-136.
- **citationUrl:** https://doi.org/10.1111/j.1600-0447.1996.tb09814.x
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `psychiatry`, `nursing-psych`, `neurology`, `neurocritical-care`.
- **Inputs:** the 14-item Bush-Francis Catatonia Screening Instrument (presence/absence)
  and the 23-item severity scale (each item 0–3, per the published examination).
- **Output:** the **screening result** (catatonia suspected if the published number of
  screen items are present) and the **severity total (sum of the 23 items, 0–69)**,
  naming the signs elicited. Class A (fixed ordinal scale; citation names the journal +
  authors). Cross-links `aims-tardive`.

### 2.3 `bars-akathisia` — Barnes Akathisia Rating Scale

- **Citation:** Barnes TRE. A rating scale for drug-induced akathisia. *Br J Psychiatry.*
  1989;154:672-676.
- **citationUrl:** https://doi.org/10.1192/bjp.154.5.672
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `psychiatry`, `nursing-psych`, `neurology`, `movement-disorders`.
- **Inputs:** the objective observation of restlessness (0–3), the subjective awareness
  of restlessness (0–3), the subjective distress related to restlessness (0–3), and the
  global clinical assessment of akathisia (0–5).
- **Output:** the **objective + subjective subtotals** and the **global akathisia rating
  (0–5)** with the source's categorical interpretation (absent / questionable / mild /
  moderate / marked / severe). Class A (fixed ordinal scale). Cross-links `aims-tardive`.

### 2.4 `scoff` — SCOFF Questionnaire

- **Citation:** Morgan JF, Reid F, Lacey JH. The SCOFF questionnaire: assessment of a
  new screening tool for eating disorders. *BMJ.* 1999;319(7223):1467-1468.
- **citationUrl:** https://doi.org/10.1136/bmj.319.7223.1467
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `psychiatry`, `nursing-psych`, `internal-medicine`, `emergency-medicine`.
- **Inputs:** the five yes/no SCOFF items (Sick / Control / One-stone / Fat / Food).
- **Output:** the **SCOFF count (0–5)** with the source's framing (≥ 2 positive flags a
  likely eating disorder warranting further assessment). Class A (fixed item set).
  **Provenance:** the five SCOFF questions are reproduced in full in the open BMJ source
  paper and are **free to use** ([spec-v100](spec-v100.md) §8 cleared).

### 2.5 `ces-d` — Center for Epidemiologic Studies Depression Scale (CES-D)

- **Citation:** Radloff LS. The CES-D Scale: a self-report depression scale for research
  in the general population. *Appl Psychol Meas.* 1977;1(3):385-401.
- **citationUrl:** https://doi.org/10.1177/014662167700100306
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `psychiatry`, `nursing-psych`, `internal-medicine`, `geriatrics`.
- **Inputs:** the 20 CES-D items, each rated 0–3 over the past week, with the four
  positively-worded items reverse-scored per the published key.
- **Output:** the **CES-D total (0–60)** with the source's framing (≥ 16 commonly flags
  clinically significant depressive symptoms warranting further evaluation). Class A
  (fixed ordinal scale). **Provenance:** the CES-D was developed by NIMH and is in the
  **public domain** — free to reproduce interactively ([spec-v100](spec-v100.md) §8
  cleared). Cross-links `phq9`.

## 3. Per-tile robustness

- **All five are bounded ordinal sums or item counts.** Each item is clamped to its
  published range (AIMS 0–4, BFCRS severity 0–3, BARS 0–3/0–5, SCOFF 0/1, CES-D 0–3),
  so no total can exceed its published maximum (AIMS movement 0–28, BFCRS severity 0–69,
  SCOFF 0–5, CES-D 0–60). The CES-D reverse-scored items are applied per the published
  key inside the compute.
- **`scoff` is a yes/no item count** and `bfcrs` carries a screen-vs-severity split; each
  names which items/signs were positive and reports a partial profile as a complete-the-
  fields fallback rather than a count from `NaN`.
- All five flow through the [spec-v59](spec-v59.md) fuzz harness with zero non-finite
  leaks, render the [spec-v50](spec-v50.md) §3 clinical posture note, quote the source's
  interpretation, and author no treatment recommendation in Sophie's voice
  ([spec-v11](spec-v11.md) §5.3). Each is mobile-first per [spec-v72](spec-v72.md)
  (44px targets, no 320px horizontal scroll).

## 4. CI/CD & maintenance

Per the [spec-v100](spec-v100.md) §6 contract (re-binding [spec-v85](spec-v85.md) §6):

- **Maintenance classes (§6.3):** all five are **Class A** (fixed ordinal scales / item
  sets; each citation names the journal/manual + authors, not an issuing society, so none
  trips the `ISSUER_PATTERN` gotcha) — **no** `docs/citation-staleness.md` row.
- **License clearance (§8):** each instrument here is re-confirmed at implementation as
  public-domain (AIMS, CES-D — NIMH/US-government) or free-to-use (SCOFF — reproduced in
  the open BMJ paper; BFCRS, BARS — journal-published rating scales reproduced in full in
  their source articles). This is the §8 "feature spec re-confirms the license status of
  the instruments it ships" requirement; the copyrighted psychiatry instruments are
  **deliberately excluded** (see §7).
- **Build (§6.1):** the compute lives in new `lib/psych-v123.js`; the renderer is new
  `views/group-v123.js` whose `RV123` export is added to the `app.js` `RENDERERS`
  spread; five `UTILITIES` rows (all group G) and five `META` entries (inline citation +
  `citationUrl` + `accessed`).
- **Gates (§6.2):** `lib/psych-v123.js` is added to the `test/unit/fuzz-tools.test.js`
  `MODULES` list (zero non-finite leaks); each `META` example is pinned by the chromium
  `example-correctness` sweep; the catalog count moves on all **13 catalog-truth
  surfaces**; a11y, `mobile-no-hscroll`, and 44px touch-target checks pass for
  `views/group-v123.js`.
- **Wave-close note:** with v123 the [spec-v100](spec-v100.md) Wave 4 is complete at
  **539** tiles (507 → 539, +32).

## 5. Files touched

```
docs/spec-v123.md                        (this file)
app.js                                   (+5 UTILITIES rows, group G; import group-v123 renderers into RENDERERS as RV123)
lib/psych-v123.js                        (new module: aimsTardive, bfcrs, barsAkathisia, scoff, cesD)
lib/meta.js                              (+5 META entries: inline citation + citationUrl + accessed; cross-links to phq9, cssrs)
views/group-v123.js                      (new renderer module: 5 renderers; incl. the 20-item CES-D and 23-item BFCRS inputs)
docs/clinical-citations.md               (+ rows for the five sources, each noting PD/free provenance)
test/unit/aims-tardive.test.js, bfcrs.test.js, bars-akathisia.test.js, scoff.test.js, ces-d.test.js  (≥3 boundary worked examples each)
test/unit/fuzz-tools.test.js             (add lib/psych-v123.js to MODULES)
docs/audits/v12/aims-tardive.md, bfcrs.md, bars-akathisia.md, scoff.md, ces-d.md  (spec-v11 audit logs)
docs/scope-mdcalc-parity.md              (catalog count 534 -> 539; note Wave 4 complete 507 -> 539, +32)
CHANGELOG.md                             (Unreleased: v123 entry, +5; Wave-4-complete note)
README.md, package.json                  (catalog count 534 -> 539; spec-progression line -> v123)
```

## 6. Acceptance criteria

v123 is fully shipped when:

- The implementing session has **re-run the §6.2 collision check** and confirmed all
  five ids are absent from the live catalog and from each other.
- All 5 tiles in §2 are live in Group G with a `META[id]` entry, an inline primary
  citation + `citationUrl` + `accessed`, ≥3 boundary worked examples each (including an
  `aims-tardive` movement-total case, a `bfcrs` screen-positive vs severity-total case,
  a `bars-akathisia` global-rating step, a `scoff` ≥2 positive-screen band-flip, and a
  `ces-d` ≥16 depression-threshold band-flip with the reverse-scored items applied), a
  [spec-v11](spec-v11.md) audit log, and a passing [spec-v29](spec-v29.md) §3 check.
- Each score clamps to its published per-item and total range; the CES-D reverse-scoring
  key is applied in-compute; partial inputs render a complete-the-fields fallback.
- Every compute function uses `lib/num.js` and is covered by the
  [spec-v59](spec-v59.md) fuzz harness with zero non-finite leaks.
- All five are **Class A** — no `docs/citation-staleness.md` row; each instrument's
  public-domain / free-to-use status is re-confirmed per §8 and recorded in
  `docs/clinical-citations.md`.
- `UTILITIES.length` is **539** (or the then-current live count + 5 if specs land out of
  order) and all catalog-truth surfaces ([spec-v46](spec-v46.md)) agree;
  `scope-mdcalc-parity.md` notes Wave 4 complete (507 → 539, +32).
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass.
- The CHANGELOG records v123 with the +5 catalog delta and the Wave-4-complete note.

## 7. Out of scope for v123

- **No copyrighted or licensed psychiatry instruments.** Per the
  [spec-v100](spec-v100.md) §8 permanent-exclusion governance list, **BDI/BDI-II
  (Pearson), QIDS, LSAS, PANSS (MHS), Conners (MHS), ASRS (WHO), EAT-26, CRAFFT, ISI
  (Mapi), PSQI, Zung, YMRS** and the copyrighted cognition screens (MoCA, MMSE, SLUMS,
  etc.) are **deliberately excluded** and must not be re-proposed without a documented
  §8 licensing-clearance amendment. The five instruments shipped here — **AIMS, BFCRS,
  BARS, SCOFF, CES-D** — are the confirmed **public-domain / free-to-use** subset.
- **No diagnosis.** Each tile reports the score/screen result and the source's stated
  threshold framing; it does not assert a DSM diagnosis.
- **No auto-treatment, auto-medication-change, or auto-referral order** — the management
  decision (continue/stop the offending agent, refer, admit) stays with the clinician and
  local protocol ([spec-v11](spec-v11.md) §5.3).
