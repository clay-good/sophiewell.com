# spec-v1762 — Review of v1758-v1761: limits that refused survivable values

> Status: **SHIPPED (2026-11-21)**. The catalog stays 2,387.

An independent review re-ran every worked example (and each with one field blanked or deleted) on the code before
and after specs v1758-v1761: no answer moved, no blank was refused, no unit was mixed. It found three places where
the new guards refuse values real patients have had.

| Finding | Before | Now | Source |
|---|---|---|---|
| The weight floor (0.3 kg) sat above the smallest surviving infant | GIR, urine output, fluid balance and others refused a 250 g baby | floor 0.2 kg | 245 g, San Diego 2018 (University of Iowa Tiniest Babies Registry) |
| The potassium ceiling (10 mmol/L) sat below a reported survival | APACHE II and lab-interpret refused 11-14 | ceiling 15 mmol/L | survival from 14.0 mmol/L (Extreme hyperkalemia, PMID 16108244); 10.1 (Hylander 1987) |
| spec-v1760 exempted four floors from its finder, but the v1758 guards enforced them | lab-interpret refused a glucose of 4 or a hemoglobin of 1.5; PSI, LRINEC and the IV-iron course too | flagged as critical-low; ceilings hold | hemoglobin survivals below 2 g/dL; congenital analbuminemia; neonatal glucose |

`CEILING_ONLY` in `lib/bounds.js` now names the four keys whose floor is not a recorded extreme, and
`envelopeAdvisory(key, value)` checks only their ceiling (any other key: exactly `boundsAdvisory`). The finders'
`NO_FLOOR_KEYS` reads the same set, so the libraries and the finders cannot drift apart.

Open: a sourced floor for hemoglobin (case reports cite 0.7 g/dL with transfusion and 1.8 g/dL without; the primary
reports were not readable here).

Tests: `test/unit/review-fixes-v1762.test.js`.
