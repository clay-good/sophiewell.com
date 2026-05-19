# v11 audit - ecog-karnofsky

- Auditor: CG
- Date: 2026-05-19
- Citation re-verified against: Oken MM, Creech RH, Tormey DC, et al. *Toxicity and response criteria of the Eastern Cooperative Oncology Group.* Am J Clin Oncol. 1982;5(6):649-655 (ECOG); Karnofsky DA, Burchenal JH. *The clinical evaluation of chemotherapeutic agents in cancer.* In: MacLeod CM, ed. Evaluation of Chemotherapeutic Agents. Columbia University Press; 1949:191-205 (Karnofsky); Buccheri G, Ferrigno D, Tamburini M. *Karnofsky and ECOG performance status scoring in lung cancer: a prospective, longitudinal study of 536 patients from a single institution.* Eur J Cancer. 1996;32A(7):1135-1141 (ECOG <-> KPS crosswalk).

`lib/scoring-v4.js ecogKarnofsky()` exposes two coupled pickers: ECOG 0-5 (Oken 1982 descriptors) and Karnofsky 100-0 in steps of 10 (Karnofsky 1949 descriptors). Selecting an ECOG value auto-suggests the corresponding KPS via the Buccheri 1996 crosswalk (ECOG 0 -> KPS 90; 1 -> 80; 2 -> 60; 3 -> 40; 4 -> 20; 5 -> 0), and the user may override either value independently. The output renders both scales side by side with the source's descriptor text verbatim.

## Boundary examples added
- low (tile example): ECOG 0, KPS 100 -> 'Fully active' / 'Normal; no complaints; no evidence of disease.'
- mid: ECOG 2, KPS 60 -> 'Ambulatory and capable of all self-care; up >50% of waking hours' / 'Requires occasional assistance...'.
- high: ECOG 4, KPS 20 -> 'Completely disabled' / 'Very sick; hospital admission necessary...'.
- terminal: ECOG 5, KPS 0 -> 'Dead' / 'Dead.'

## Cross-implementation differential
- Reference implementation: Oken MM, et al. Am J Clin Oncol. 1982;5(6):649-655 (ECOG table) and Karnofsky DA, Burchenal JH. 1949 (KPS table). Crosswalk per Buccheri 1996.
- Test case: ECOG 2 -> auto-suggest KPS 60.
- Sophie result: suggestedKps = 60; if user accepts, KPS descriptor matches Karnofsky 1949 row 60.
- Reference result: Buccheri 1996 Table 1 ECOG 2 <-> KPS 60. PASS.

## Edge-input handling notes
- ECOG input is clamped to 0-5; KPS input is rounded to the nearest 10 and clamped to 0-100.
- Both inputs accept `null` / empty for partial entry; the function returns `null` descriptors so the renderer surfaces 'no input' gracefully.
- Override behavior: the renderer only auto-fills KPS when ECOG changes; the user may then edit KPS independently without triggering another auto-fill.

## A11y / keyboard notes
- Two labeled `<select>` elements (ECOG 0-5 and KPS 100-0 by 10s) carrying both numeric values and Oken 1982 / Karnofsky 1949 descriptor text; Tab-reachable; output region `aria-live="polite"`. `npm run test:a11y` clean after the tile was added.

## Defects opened
- none

## Status
- PASS
