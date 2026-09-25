# Scope — field health: WHO frontline care for community health workers and rural clinics

**Status:** Specified September 25, 2026. Nothing built yet.
**Specs:** [spec-v1540](spec-v1540.md) (charter) through [spec-v1564](spec-v1564.md).
**When built:** 100 additions, plus 6 modes or backfills on live entries (the count is in the table below).

## What this does for a health worker

A community health worker in rural Kenya, an auxiliary nurse in the Peruvian Andes, or a clinical
officer at a district hospital in Malawi works without reliable internet, labs, or a specialist to
call, from a WHO chart their ministry adapted. The catalog already answers the US bedside. This
program adds the WHO layer: the IMCI and iCCM charts, growth and wasting standards, the malaria, TB
and HIV weight bands, snakebite and rabies, maternal emergencies, epidemic-prone disease, and the
neglected tropical diseases. Every answer shows the number, the cutoff, and the edition it came
from, and works with no signal once the site has loaded.

It complements, and does not compete with, the ministry-run case-management apps (Community Health
Toolkit, CommCare, ePOCT+). It holds no patient data.

## Why the catalog, and not a new product

The site is already an offline-capable, no-account, MIT-licensed catalog of point-of-care
calculations with visible working. The research found about twenty live entries in this space
(`who-severe-malaria`, `who-dengue-2009`, `who-growth-zscore`, `snakebite-severity`, `rabies-pep`,
`ridley-jopling`, `rassi-chagas`, and the weight-based dosing entries) and **no IMCI, iCCM, wasting,
WHO anemia, malaria dosing, WHO TB or HIV, or NTD treatment content at all**. The math engine,
three-state inputs, band handling, citation ledger, and agent surface already exist. What is missing
is the content, and three platform pieces (below).

## The count

| Spec | Wave | New | Modes / backfills |
|---|---|---|---|
| [v1540](spec-v1540.md) | Charter: admission rule, edition switch, band engine, licensing, regulatory posture | 0 | |
| [v1541](spec-v1541.md) | Offline that survives the field | 0 | |
| [v1542](spec-v1542.md) | Metric field units and safe decimal-comma input | 0 | |
| [v1543](spec-v1543.md) | Languages: design and review gate | 0 | |
| [v1544](spec-v1544.md) | The sick young infant, 0–59 days | 3 | |
| [v1545](spec-v1545.md) | The sick child, 2–59 months: IMCI boxes | 6 | |
| [v1546](spec-v1546.md) | IMCI and iCCM treatment: fluids, dose bands, the CHW chart | 4 | |
| [v1547](spec-v1547.md) | ETAT, shock fluids, glucose, oxygen | 4 | `maint-fluids`, `peds-weight-dose` |
| [v1548](spec-v1548.md) | Growth and wasting | 3 | `who-growth-zscore` |
| [v1549](spec-v1549.md) | Severe acute malnutrition: feeds, RUTF, fluids, weight gain | 4 | |
| [v1550](spec-v1550.md) | Anemia and micronutrients | 4 | |
| [v1551](spec-v1551.md) | Malaria treatment | 4 | |
| [v1552](spec-v1552.md) | Malaria prevention and relapse | 4 | |
| [v1553](spec-v1553.md) | Tuberculosis | 6 | |
| [v1554](spec-v1554.md) | HIV | 7 | |
| [v1555](spec-v1555.md) | Snakebite (Asia and Africa) | 5 | |
| [v1556](spec-v1556.md) | Latin American envenomation, scorpion, organophosphate atropine | 7 | |
| [v1557](spec-v1557.md) | Rabies (WHO) and tetanus | 1 | `tetanus`, `measles-case-def` |
| [v1558](spec-v1558.md) | Maternal emergencies | 3 | `shock-index` |
| [v1559](spec-v1559.md) | Antenatal and newborn care | 5 | |
| [v1560](spec-v1560.md) | Epidemic-prone disease | 5 | |
| [v1561](spec-v1561.md) | Skin and eye NTDs | 10 | |
| [v1562](spec-v1562.md) | Worms and mass drug administration | 6 | |
| [v1563](spec-v1563.md) | Protozoal and arboviral NTDs | 9 | |
| [v1564](spec-v1564.md) | Owner decisions, blocked items, rejections | 0 | |
| | **Total** | **100** | **6** |

Every proposed id was checked against every live id and legacy alias on September 25, 2026: no
collisions, no duplicates.

## Build order

1. **Platform first:** spec-v1540's machinery, then spec-v1541 (offline) and spec-v1542 (metric and
   decimal commas). An offline promise that breaks on the next deploy fails this audience first.
2. **Calculation-shaped, lower regulatory risk:** `who-anemia-hb`, the `who-growth-zscore` fix and
   `wasting-classify`, `act-weight-band-dose`, `severe-malaria-injectable`, `rectal-artesunate-prereferral`,
   `imci-ors-plan`, `cholera-rehydration-plan`, `wbct20`, `who-rabies-pep`, `pph-who-2025`,
   `labour-care-guide-alert`, `who-tb-fdc-dose`, `pc-dose-pole`, `dengue-fluid-plan`.
3. **After owner decision D1 (listed in the last spec):** everything that classifies and advises:
   IMCI, iCCM, PSBI, ETAT, SAM care setting, the TB decision algorithm.
4. **High volatility last:** pediatric ARV doses and infant prophylaxis (D4), arpraziquantel.
5. **Languages** (spec-v1543) after the offline pack, starting with French, Portuguese, and Spanish.

## Research record

Six research passes on September 25, 2026 read the primary sources directly: WHO documents through
the IRIS repository's API (the old direct PDF links now return an empty page), the WHO malaria
guideline of September 10, 2026, WHO's TB modules and HIV guidance through December 2025, GTFCC's 2024
cholera job aids, Brazil's 2024 surveillance guide, India's 2016 snakebite guideline, PAHO's
leishmaniasis and Chagas guidelines, the Brazilian Society of Cardiology's 2023 Chagas guideline, and
the CDC's redistribution of WHO growth data. Dose tables that exist only as images were rendered and
read visually. Findings that shaped the plan:

- **WHO editions disagree, and a tile must not pick silently.** Child health alone had 15 conflicts
  (zinc dose, the young-infant fever threshold, the critical-illness sign list, gentamicin by week of
  life, shock boluses, the SpO2 edge). Hence the edition switch (spec-v1540 §3).
- **Sources have holes.** DHA-piperaquine leaves exactly 80 kg in no band; egg-count classes leave
  50,000 in none; the Buruli weight bands skip 10–11 kg; ivermectin's height pole has gaps; two
  ivermectin height schemes exist and must never be merged. Each is a named test.
- **Living guidelines move.** WHO malaria changed its under-5 kg band and a primaquine age exclusion
  within a year; advanced HIV disease became CD4 200 or less in December 2025; pediatric ARV bands
  changed in May 2026. Hence the volatility column (spec-v1540 §8).
- **Licensing is restrictive but workable.** Older WHO charts are all rights reserved; newer ones are
  CC BY-NC-SA. Facts and logic can be restated with citation; text cannot be copied. WHO's own growth
  tables beyond 24 months cannot be bundled; the CDC-redistributed sets can (spec-v1540 §6).
- **Offline is fragile today.** One visit caches everything, but each deploy's update deletes that
  copy before the new one is complete (spec-v1541).
- **Decimal commas.** `Number('37,5')` is not a number and `parseFloat('37,5')` is 37. The target
  audience's phones write decimals with commas (spec-v1542).
- **Regulation turns on intended use, not price.** No country checked exempts free software; this is
  owner decision D1.
- **One live defect found:** `who-growth-zscore` prints raw z-scores beyond ±3 where WHO restricts
  them (spec-v1548).

## What this program will not do

Store patient data, sync, or schedule follow-up visits; claim validation or equivalence to IMCI or
any trial-validated app; name commercial products; reproduce WHO text, charts, or logos; bundle data
whose licence forbids it; or ship a translation that has not been through the review gate. The full
list of blocked and rejected candidates, with reasons, is spec-v1564.
