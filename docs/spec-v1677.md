# spec-v1677 — Independent review of the v600 to v699 tools

> Status: **SHIPPED (2026-10-20)**: hardening, no new tool (catalog stays 2,362). Follows [spec-v1676](spec-v1676.md).

A reviewer ran the 81 libs in `lib/*-v600.js` to `lib/*-v699.js` on edge inputs. The largest defect reached past that
range: the APACHE II step lookup (copied into FGSI and the derivation view) only matched values inside its closed
printed ranges, so anything between two of them scored 0.

| Tool | Input | Was | Now |
|---|---|---|---|
| `apache2`, `fgsi`, derivation view | temperature 40.95, pH 7.695, K 6.95, creatinine 1.95 | 0 points (between "39-40.9" and "41") | each band runs up to the next band's low end: 3, 3, 3, 2 |
| `fgsi` | a negative value | 0 points | refused |
| `fisher-grade` | intraventricular blood with a thick clot | grade 4, "not the highest vasospasm risk" | grade 3: grade 4 is defined as that blood with diffuse or no subarachnoid blood |
| `pollock-flickinger` | score exactly 2.00 | the lower row, beside a note saying the higher one applies | the higher row |
| `qcsi` | 15 L/min | scored 5 | refused: the item covers 5 to 6 L/min (Haimovich 2020, Table 2) and the outcome is a need above 10 |
| `oswestry` | one section answered | "ODI 100%, bed-bound" | labeled partial, from 1 of 10 sections |
| `sartorius-hs` | no lesions, a distance or "not separated" | 9 or 18 points for an empty region | refused, or 0 |
| `elemental-iron-ingested`, `effective-osmolality`, `free-androgen-index` | 19.97 mg/kg; 320.03 and 295.03 mOsm/kg; FAI 5.04 and 29.95 | printed 20, 320, 295, 5, 30 beside the band on the other side | printed at the digits that keep them on their side; osmolality below or above the range is flagged |
| `cobb-angle`, `walter-index` | 24.5°; albumin 3.45 | "moderate" but not flagged; 0 points | mild; 1 point (below 3.5) |
| `bauer-score`, `pedis`, `ucsf-hcc` | lung primary that is also breast; intact skin with bone-deep ulcer; one nodule with a different total | scored | refused |
| `wang-bronchiolitis`, `van-nuys-vnpi` | respiratory rate 0; age 500 | scored | refused |
| `indomethacin-headache-ichd3` | paroxysmal hemicrania with no pain description | criterion B met on duration alone | a "severe one-sided orbital, supraorbital and/or temporal pain" item, as cluster headache has |
| `hpa-glaucoma` | the detail line | "better than -6 early, -6 to -12 moderate" | matches the code and the GFDC table (-6 is early) |

Not changed: the McCormack apposition and Cleveland constipation label wording (the reviewer could not reach the
papers, and neither could this check). `kings-score-v697.js` and `ips-hodgkin-v661.js` are not served to users.

## Proof

`test/unit/review-fixes-v600-v699.test.js`; the fisher, pollock, sartorius, pedis, bauer, qcsi and indomethacin tests updated, each change commented.
