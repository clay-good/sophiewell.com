# spec-v1489 — Peri-implant case definitions (2017 World Workshop)

The catalog staged periodontitis by the 2017 World Workshop but had not its implant half. Workgroup 4
defined peri-implant health, peri-implant mucositis and peri-implantitis.

## What it does

With a baseline radiograph and probing record:

| Bleeding or suppuration | Bone loss beyond remodeling | Deeper probing depth | Case |
|---|---|---|---|
| no | no | — | Peri-implant health |
| yes | no | — | Peri-implant mucositis |
| yes | yes | yes | Peri-implantitis |
| yes | yes | no | Criteria not all met |
| no | yes | — | Fits no case definition |

Without a baseline, peri-implantitis needs bleeding or suppuration with a probing depth of 6 mm or
more and a bone level 3 mm or more below the most coronal part of the implant within bone. Below
either threshold the answer says the thresholds are not met and that mucositis cannot be confirmed
without a baseline. A blank that decides the category is asked for; the depth and bone level are
checked against 0 to 20 mm.

## Sources

- Berglundh T et al. J Clin Periodontol 2018;45 Suppl 20:S286-S291.
- The definitions as applied in Clin Oral Implants Res 2026 (PMC13542762).

## Tests

`test/unit/peri-implant-status.test.js`: the worked example, every baseline row, the thresholds,
blanks and bounds.
