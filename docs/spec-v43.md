# spec-v43.md — Instrumental ADL companion to Katz: Lawton IADL

> Status: proposed (2026-05-22). v43 is a narrow, single-tile
> spec that adds the Lawton IADL (Lawton & Brody 1969) named as
> a candidate in [spec-v42 §5](spec-v42.md). Katz ADL ships in
> v42 wave 42-1 as the basic-ADL index; Lawton is the
> instrumental-ADL companion that captures the higher-order
> activities (managing medications, finances, transportation)
> that drive whether an aging-in-place patient can safely stay
> at home without escalation of services. No other spec rule is
> amended.
>
> Catalog effect at v43 close: **251 + 1 = 252 tiles.**

## 1. Thesis

Katz ADL is the basic-ADL index — what the patient can do for
themselves physically. Lawton IADL is the *instrumental*-ADL
companion: it captures the higher-order tasks that depend on
cognition as well as mobility — placing a phone call, shopping,
preparing food, housekeeping, doing laundry, organizing
transportation, managing one's own medications, and handling
one's own finances. The clinical decision pair is standard
practice in geriatric assessment: Katz tells the bedside team
whether the patient can survive at home; Lawton tells them
whether the patient can *manage* at home.

For Sophie's nurse-first positioning, Lawton matters most at the
moment a discharging RN, case manager, or home-health nurse is
deciding whether home-with-services, an assisted-living
transition, or a SNF is the right disposition. A patient who is
Katz 6 / Lawton 8 goes home; a patient who is Katz 6 / Lawton 3
goes home only with medication-management and meal-prep
services; a patient who is Katz 4 / Lawton 1 needs an
assisted-living or SNF placement. The published literature ties
Lawton declines to mild cognitive impairment, early dementia,
and increased risk of medication errors more reliably than ADL
alone.

Lawton is the simplest IADL instrument that survives in routine
use today (the Functional Activities Questionnaire / FAQ and the
Bristol ADL are also used; Lawton is the foundational reference
both cite). The unisex eight-item collapse (each item scored 0
needs help / 1 independent) gives a 0-8 total that the bedside
RN can compute from a 60-second structured interview.

## 2. What v43 adds (1 tile)

### 2.1 `lawton-iadl` — Lawton Instrumental ADL (Lawton & Brody 1969)

- **Citation:** Lawton MP, Brody EM. *Assessment of older
  people: self-maintaining and instrumental activities of daily
  living.* Gerontologist. 1969;9(3):179-186.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `nursing-floor`, `nursing-ed`,
  `nursing-general`, `geriatrics`, `family-medicine`,
  `case-management`, `occupational-therapy`,
  `physical-therapy`.
- **Inputs:** eight binary IADL items per Lawton 1969 (each
  integer 0 needs help / 1 independent):
  - Ability to use telephone
  - Shopping
  - Food preparation
  - Housekeeping
  - Laundry
  - Mode of transportation
  - Responsibility for own medications
  - Ability to handle finances
- **Output:** total `score` (0-8) and the IADL band:
  - **8** — fully independent across all eight IADLs.
  - **6-7** — mild IADL impairment.
  - **3-5** — moderate IADL impairment.
  - **0-2** — severe IADL impairment.
- **No disposition automation.** v43 surfaces the IADL band but
  does not auto-recommend home / home-with-services / assisted-
  living / SNF; those depend on the Katz band, social support,
  prior baseline, and local resources — all outside the scope of
  a single tile.

## 3. Files touched

```
docs/spec-v43.md                         (this file)
app.js                                   (+1 UTILITIES row)
lib/scoring-v4.js                        (+1 export: lawtonIadl)
lib/meta.js                              (+1 META[id] entry)
views/group-g.js                         (+1 renderer)
test/unit/lawton-iadl.test.js            (new)
docs/audits/v11/lawton-iadl.md           (new)
docs/scope-mdcalc-parity.md              (catalog count 251 -> 252)
CHANGELOG.md                             (Unreleased: v43 entry)
README.md                                (catalog count 251 -> 252)
package.json                             (description count 251 -> 252)
```

## 4. Acceptance criteria

v43 is fully shipped when:

- This file exists.
- The tile in §2 is present: `META[id]` entry, ≥3 boundary
  worked examples in the test suite, primary citation visible
  inline, spec-v11 audit log in `docs/audits/v11/`.
- `UTILITIES.length` is 252.
- `npm run lint`, `npm run test`, `npm run sbom`, and
  `npm run build` all pass.
- The CHANGELOG records v43 with the catalog-count delta.

## 5. Out of scope for v43

- Sex-stratified Lawton scoring (the original 1969 paper scored
  men out of 5 by excluding food-prep / housekeeping / laundry
  on the assumption that men did not perform these tasks). v43
  uses the modern unisex 0-8 scoring per the current published
  Lawton form. Out of scope to re-introduce the historical
  sex-stratified scoring.
- Functional Activities Questionnaire (FAQ; Pfeffer 1982) — a
  10-item IADL with a 0-3 graded scale per item, total 0-30.
  Overlaps with Lawton; candidate for a future spec if the FAQ
  emerges as a primary audience.
- Bristol Activities of Daily Living Scale (BADLS; Bucks 1996) —
  dementia-specific 20-item ADL/IADL. Candidate for a future
  spec.
- A combined "Katz + Lawton dashboard" tile co-displaying both
  bands and a disposition recommendation. Each instrument is
  validated against its own derivation; co-display is fine but
  auto-disposition is out of scope (it depends on factors
  outside both scales).
