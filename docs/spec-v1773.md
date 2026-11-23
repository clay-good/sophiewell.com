# spec-v1773 — Ordinal totals and counts that still took a half step

> Status: **SHIPPED (2026-11-23)**: 10 tools. The catalog stays 2,390.

[spec-v1755](spec-v1755.md) refused a half step in 74 tools and left 61 rows of its finder standing. Its
record names the kinds it left fractional on purpose -- visual-analogue and 0-10 rating lines, averages and
frequencies, durations, a center's own cutoff, an iron tablet count -- and those are most of what is left.
Re-reading the report today, ten of the remaining rows are none of those: they are ordinal TOTALS and
COUNTS, where a half step is not a finer reading but an impossible one.

| Tool | The field | What a half step did |
|---|---|---|
| `sic-score` | Total SOFA score | scored half a point, for a SIC total of 4.5 out of 6 |
| `triss` | Injury Severity Score | an ISS is the sum of three squared AIS grades; 25.5 is not one |
| `span-100` | NIHSS | an NIHSS of 22.5 made a SPAN-100 index of 102.5 against a cutoff of 100 |
| `pearl-index` | accidental pregnancies | half a pregnancy became a failure rate per 100 woman-years |
| `phoenix-sepsis` | vasoactive medication count | 1.5 medications fell in the band for one and scored it |
| `anesthesia-units` | base units (and modifying units) | half a unit went into the total and the payment |
| `heds-2017` | Beighton score (0-9) | nine yes-or-no manoeuvres, and a 6.5 decided criterion 1 |
| `periodontitis-stage-grade` | teeth lost to periodontitis | half a tooth raised the stage exactly as one did |
| `rapid3` | MDHAQ function sum (0-30) | ten items scored 0 to 3; 18.5 divided into a RAPID3 and was banded |
| `levey-jennings-limits` | the laboratory's minimum count | a minimum of 10.5 results |

Each is `gradeFault`'s whole flag or `wholeFault` from `lib/num.js`, the helpers spec-v1722 and spec-v1755
already built. The measurement beside each one stays fractional and is tested that way: the age in SPAN-100,
the months of exposure in the Pearl index, the coded RTS in TRISS, anesthesia time in minutes, and the two
VAS lines in RAPID3.

Three more rows of the finder are left where they are, on the rule of [spec-v1744](spec-v1744.md): the
Burch-Wartofsky point fields, the Helsinki mass-lesion type and the Cormack-Lehane grade are selects on the
page and declare their value list to an agent, which `mcp/fields.js` already enforces -- a direct library
call is the only way to reach them. `auth-runout`'s approved and used units are left too: nothing there is
rounded or banded, and a payer's "units" are not an ordinal scale.

The finder is down from 61 rows to 51.

Tests: one case in each tool's own unit test file, each asserting the refusal and the fractional
measurement beside it.
