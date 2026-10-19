# spec-v1655 — Infection prevention arithmetic and healthcare worker exclusion clocks

> Status: **SHIPPED (2026-10-19)**: six tools. One more is specified and gated (below).

The build of the [infection-prevention-metrics](../openspec/changes/infection-prevention-metrics/proposal.md)
change proposed in [spec-v1654](spec-v1654.md). Every number in these tools was read on its source page on
October 19, 2026.

## What shipped

| Tool | What it answers | Source read |
|---|---|---|
| `nhsn-sir` | Observed infections over the predicted count on the NHSN report; no ratio below 1.0 predicted | NHSN SIR Guide, updated March 2024 |
| `device-utilization-ratio` | Central line, urinary catheter or ventilator days over patient days | NHSN Patient Safety Component Manual, January 2026, chapters 4, 7 and 10 |
| `device-infection-rate` | CLABSI, CAUTI or VAE per 1,000 device days, and VAE per 100 episodes of mechanical ventilation | same chapters |
| `outbreak-attack-rates` | Attack rate among exposed and unexposed for each exposure with the risk ratio, overall attack rate, secondary attack rate | CDC *Principles of Epidemiology*, 3rd ed., Lesson 3 sections 2 and 5 |
| `hcp-exposure-clock` | Exclusion or monitoring dates after a measles, mumps, rubella, varicella or pertussis exposure | CDC *Infection Control in Healthcare Personnel*, five section pages (updated January 2024 to March 2026) |
| `hcp-illness-return-date` | When the work exclusion ends for seven infections | the same guidance, seven section pages |

Each tool's worked example comes from its source where the source prints one: the SIR guide's facility
(5 CLABSIs, 2.365 predicted, SIR 2.114, over 1,850 central line days, 2.70 per 1,000), and CDC's potato
salad (30 of 99) and shigellosis secondary attack rate (17 of 86 − 18, 25.0%) in the unit tests.

## What changed from the proposal

- **Antimicrobial days per 1,000 days present was dropped.** The live `au-rate-saar` already computes it,
  with the SAAR. The proposal's name search used "days of therapy" and missed that tile's name.
- **The cumulative attributable difference was left out of `nhsn-sir`.** The guide's one sentence on it
  can be read two ways, and the TAP guide that defines it was not read.
- **No SIR interval or p-value.** No source stating the exact interval formula was read. Liddell 1984 was
  found, but its formulas are only in page images. The result points to the NHSN report.
- **The attack-rate tool reads pasted lines, not a dropped file.** Lines take a name and two or four counts.
  It is renamed `outbreak-attack-rates` because it no longer builds a table from a line list.
- **The personnel clocks cover the infections whose own section pages were read.** Diphtheria, parvovirus
  B19 and viral respiratory infections were read only in the summary and are not in the pickers.
  Group A streptococcus and meningococcal disease were read on their pages and are included.
- **Two exceptions the summary did not show.** The mumps page lifts the exclusion for a person given a first
  MMR dose before the exposure. The varicella page lifts it for a person with one prior dose who gets the
  second within 5 days.
- **Day 0.** No section says whether the exposure date is day 0 or day 1. The measles page counts rash onset
  as day 0, so the tools count the exposure and onset dates as day 0 and say so on every result.
- **The watch reports; it does not stop the tool.** The seven CDC section pages are route-B sources under the
  weekly page watch (`scripts/data/watch-pages.mjs`, hashes recorded October 19, 2026). A changed page is
  listed on the data-refresh pull request, as for every other watched page. The proposal asked for the tools
  to stop answering on a change; no tool in the catalog does that for a watched page, and adding it is a
  separate change.

## Specified, not built

### 5. `hand-hygiene-compliance` — Hand Hygiene Compliance Rate From Observed Opportunities

**Build gate.** The WHO *Hand Hygiene Technical Reference Manual* (2009) returned a bot-check page from WHO
IRIS and PAHO on October 19, 2026, so its compliance formula and its definitions of opportunity and action
were not read.

The arithmetic proposed is actions ÷ opportunities × 100, overall and per WHO moment or role, with the
opportunity count beside each figure and no target rate.

## Proof

- `test/unit/infection-prevention-v1655.test.js`: the source examples above, every exposure window at both
  ends, the immune globulin and second-dose branches, pertussis "whichever comes first", and the refusals.
- `test/unit/fuzz-tools.test.js` runs all six modules; `test/mcp/mcp-search-relevance.test.js` has one probe
  per tool.
