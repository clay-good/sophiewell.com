# spec-v1669 — Independent review of the WHO field-health tools (v1540 to v1564)

> Status: **SHIPPED (2026-10-20)**: hardening, no new tool (catalog stays 2,362). Follows [spec-v1668](spec-v1668.md).

Two reviewers ran the 85 field-health libs on edge inputs. Twenty defects are fixed. Where a source states no maximum
or no lower weight, none is invented: the result says the dose passes the adult one, or flags a weight the band was not
drawn for.

| Tool | Input | Was | Now |
|---|---|---|---|
| `wasting-classify` | MUAC 11.499 cm | rounded to 115.0 mm before the test: moderate | 114.99 mm: severe acute malnutrition |
| `enteric-fever-regimen` | child, 60 kg | azithromycin 1,200 mg; ceftriaxone 4,800 mg | 500 mg and 3,000 mg, the maxima in the same AWaRe book's child dosing table |
| `crag-screen-fluconazole` | adolescent, 120 kg | consolidation "720 to 800"... with pre-emptive 1,440 and maintenance 720 mg unremarked | consolidation capped at 800 at both ends (the stated maximum); pre-emptive and maintenance say they pass the adult dose, for which the guideline states no adolescent maximum |
| `snake-neostigmine-trial` | child, 40 kg | atropine 2 mg, neostigmine 1.6 mg, unremarked | a note that the per-kg doses pass the adult ones (no child maximum stated) |
| `rectal-artesunate-prereferral` | 1 kg | one 100 mg suppository (100 mg/kg), not flagged | flagged: more than twice WHO's 10 mg/kg, a weight the rule does not address |
| `act-weight-band-dose` | artemether-lumefantrine, 0.6 kg | a confident dose above WHO's target maximum | flagged when the open-ended lowest band passes the target maximum |
| `imci-prereferral-injectables` | 4.5 kg, age 2 weeks | the 2-59 month gentamicin dose | refused: the chart is for 2 to 59 months |
| `vivax-radical-cure` | woman breastfeeding an older infant | tafenoquine offered | the line states WHO's "not in pregnancy or lactation" |
| `brazil-snakebite-antivenom` | Bothrops, clotting test blank | "no sign of envenoming" | not decided: a clotting abnormality alone makes the bite mild |
| `chagas-stage-treatment` | digestive form blank | "treat" | asked for: an advanced digestive form means do not treat |
| `leprosy-classify-mdt` | 3 lesions, smear not done | "Paucibacillary ... no bacilli" | incomplete, as its header says: PB unless a smear shows bacilli |
| `scabies-diagnosis-mda` | typical lesions and itch only | level C with no word on the findings not assessed | names the findings that could make it level B |
| `newborn-hypoglycemia-who` | 2.58 mmol/L | "2.6 mmol/L (under 2.6)" | 2.58 |
| `newborn-temperature-who` | 35.96 °C | read as 36.0 silently | still read to the nearest tenth (the guide's bands are in tenths), and the result says so |
| `wbct20` | not clotted at 5.96 hours | "6 hours ... retest at 6 hours, 0 hours from now" | 5.96 and 0.04 |
| `who-anemia-hb` | man, 129.96 g/L | "130 g/L, below the cutoff of 130" | 129.96 |
| `sam-weight-gain` | 9.96 g/kg/day | "10.0 g/kg/day: moderate" | 9.96 |
| `f100-rutf-amount` | 11.95 kg | "4.5 sachets ... read here as its top band" | 5 sachets, the top band the note names |
| `yaws-test-and-treat` | positive test, no lesion | "Rapid test: positive" then "no positive test" | the case definitions start from a lesion, said once |
| `cholera-rehydration` | severe malnutrition, age exactly 2, some dehydration | 100 mL per stool (no dehydration gave 50) | 50 mL: "up to 2 years" in both branches |

## Proof

`test/unit/review-fixes-v1546-v1563.test.js` holds the reviewer inputs (the one-character cholera branch is covered by
reading: both branches now use `age <= 2`).
