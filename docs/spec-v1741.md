# spec-v1741 — Envelopes the finder could not see

> Status: **SHIPPED (2026-11-16)**: 38 tools. The catalog stays 2,387.

`scripts/lib/envelope-map.mjs` matched each field's unit against an envelope's unit, and some adapters carry the
unit only in the label ("Heart rate (beats/min)", "Serum sodium (mmol/L)"). Those fields had an empty unit and were
invisible to `probe-envelope-unbounded.mjs` and to the page test `envelope-refused-on-page.spec.js`. FGSI's nine
vitals and labs were all among them. The map now reads a trailing parenthetical when `unit` is missing.

| | Before | After |
|---|---|---|
| fields the map reaches | 813 | 910 |
| fields answering ten times past an envelope `lib/bounds.js` already declares | 0 (visible) | 50 found, 0 left |
| an entered age past 130 asked for again as if blank | 0 (visible) | 7 found, 0 left |
| fields the page test drives | 735 across 418 tools | 816 across 470 tools |

Fixed, each with `boundsAdvisory` after the tool's own missing-value branch (or `gradeFault` before it, for the
asked-again ages): `fgsi` (seven vitals and labs), `insulin-drip`, `cdi-severity`, `vacs-index`, `covid-gram`,
`isaric-4c-mortality`, `ca-5585-minor-hold`, `gelf-criteria`, `hodgkin-ips`, `nccn-ipi`, `dipss-mf`,
`dipss-plus-mf`, `myeloma-iss`, `myeloma-r-iss`, `mipi`, `dragon-stroke`, `sedan-score`, `thrive-stroke`,
`bronchiectasis-bsi`, `faced-bronchiectasis`, `nosas-score`, `brock-nodule`, `mayo-spn`, `rapid-pleural`,
`reveal-lite-2` (eGFR), `koff-bladder-capacity`, `snappe-ii`, `peds-bmi-percentile`, `cdc-stature-for-age`,
`cdc-weight-for-age`, `digifab-dosing`, `nac-dosing`, `hiet-dosing`, `tca-bicarbonate`, `tash-score`, `triss`,
`alt-70`, `lrinec`. Examples: an antidote dose for a 5,000 kg patient, a TRISS survival for an age of 1,300, a
FGSI score from a temperature of 450 C.

Judgment calls:
- `snappe-ii` temperature is checked at the ceiling only; spec-v1234 kept the 25 C floor off a neonatal lowest
  temperature. Its FiO2 field is in percent and is checked as a fraction (21 to 100%).
- Envelope floors now refuse too where a tool took them silently: FGSI creatinine 0, insulin-drip glucose below 5,
  SNAPPE-II PaO2 below 10 and FiO2 below 21%, BMI below 5.
- `max-allowable-blood-loss` is excluded from the map: one field takes either a hematocrit or a hemoglobin.
- The page test's refusal detector now also reads "must be from 30 to 250 cm" (`kdri-kdpi`), which was a correct
  refusal the old pattern did not recognize.

Older overflow tests that fed 1e9 into an enveloped field (`brock-nodule`, `mayo-spn`, `tash-score`, `triss`) now
use a value inside the envelope and assert 1e9 is refused; `snappe-ii`'s "zero FiO2" test now expects a refusal.

Tests: one spec-v1741 case in each tool's own unit test file.
