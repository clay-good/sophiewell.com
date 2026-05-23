# spec-v42.md — Geriatric / discharge-planning ADL: Katz Index

> Status: proposed (2026-05-22). v42 is a narrow, single-tile
> spec that closes the geriatric / discharge-planning gap in
> Sophie's nursing surface. The current catalog ships fall-risk
> (Hendrich II, Morse), pressure-injury (Braden, Norton+PUSH),
> frailty (Clinical Frailty Scale), and cognitive screening
> (mini-Cog) — but nothing for functional status / ADL
> independence, the core nurse / case-management question on
> every discharge huddle. Katz ADL (Katz 1963) is that
> instrument. No other spec rule is amended.
>
> Catalog effect at v42 close: **250 + 1 = 251 tiles.**

## 1. Thesis

The bedside RN, case manager, and rehab team need a single
common-language number for *can this patient go home, and to
what level of support?* Katz ADL is that number. It is six
binary items covering the activities of daily living (bathing,
dressing, toileting, transferring, continence, feeding); the
total runs 0-6 with 6 = fully independent, 4 = moderate
impairment, and ≤2 = severe functional impairment per Katz 1963.

Katz ADL is RN-administered by direct observation or by
structured interview. It is the standard input to discharge
planning at most hospitals, the geriatric assessment in primary
care, and the home-health initial assessment (OASIS items M1830-
M1870 are largely Katz-aligned). It is short enough to perform
in 60 seconds at the bedside and durable enough to track over
time as a functional-decline signal — a Katz drop from 6 to 4
between admissions is one of the most reliable early indicators
of an aging-in-place patient who needs more support.

Sophie's catalog already covers the geriatric-bedside surface
across fall risk, pressure injury, frailty, and cognition; Katz
ADL fills the functional-status gap and lets the bedside RN
write "Katz 4 — independent in feeding and continence, requires
assistance with bathing and dressing" on the discharge note
without leaving the page.

## 2. What v42 adds (1 tile)

### 2.1 `katz-adl` — Katz Index of Independence in Activities of Daily Living (Katz 1963)

- **Citation:** Katz S, Ford AB, Moskowitz RW, Jackson BA,
  Jaffe MW. *Studies of illness in the aged. The index of ADL:
  a standardized measure of biological and psychosocial
  function.* JAMA. 1963;185(12):914-919.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `nursing-floor`, `nursing-ed`,
  `nursing-general`, `geriatrics`, `family-medicine`,
  `physical-therapy`, `occupational-therapy`, `case-management`.
- **Inputs:** six binary items per Katz 1963 (each integer 0
  dependent / 1 independent):
  - bathing
  - dressing
  - toileting
  - transferring
  - continence (bowel and bladder)
  - feeding
- **Output:** total `score` (0-6), `parts`, and the Katz 1963
  band:
  - **6** — full independence in all six ADLs.
  - **5** — mild impairment (independence in five ADLs).
  - **3-4** — moderate impairment.
  - **0-2** — severe functional impairment.
- **No discharge automation.** v42 does not auto-recommend a
  disposition (home / home-with-services / SNF / acute rehab);
  the Katz band is one input to that decision, which depends on
  social support, prior baseline, and local resources outside
  the scope of a single tile.

## 3. Files touched

```
docs/spec-v42.md                         (this file)
app.js                                   (+1 UTILITIES row)
lib/scoring-v4.js                        (+1 export: katzAdl)
lib/meta.js                              (+1 META[id] entry)
views/group-g.js                         (+1 renderer)
test/unit/katz-adl.test.js               (new)
docs/audits/v11/katz-adl.md              (new)
docs/scope-mdcalc-parity.md              (catalog count 250 -> 251)
CHANGELOG.md                             (Unreleased: v42 entry)
README.md                                (catalog count 250 -> 251)
package.json                             (description count 250 -> 251)
```

## 4. Acceptance criteria

v42 is fully shipped when:

- This file exists.
- The tile in §2 is present: `META[id]` entry, ≥3 boundary
  worked examples in the test suite, primary citation visible
  inline, spec-v11 audit log in `docs/audits/v11/`.
- `UTILITIES.length` is 251.
- `npm run lint`, `npm run test`, `npm run sbom`, and
  `npm run build` all pass.
- The CHANGELOG records v42 with the catalog-count delta.

## 5. Out of scope for v42

- Barthel Index (Mahoney & Barthel 1965) — a 10-item weighted
  ADL with a 0-100 range used predominantly in inpatient rehab.
  Overlaps clinically with Katz at this granularity; candidate
  for a future spec if rehab nursing emerges as a primary
  audience.
- Lawton IADL (Lawton & Brody 1969) — instrumental ADL scale
  (telephone, shopping, food prep, housekeeping, laundry,
  transport, medication, finances). Complementary to Katz but a
  distinct construct; candidate for a future spec.
- FIM (Functional Independence Measure) — 18-item weighted ADL
  used in inpatient rehab; copyrighted instrument with formal
  certification requirement that is not Sophie-shaped. Out of
  scope.
- OASIS-D M-codes — the federal home-health assessment dataset.
  Distinct deliverable (a structured form, not a single
  computation) and out of scope.
- A discharge-disposition recommendation tile consuming the Katz
  band — depends on local protocol and social work assessment;
  out of scope.
