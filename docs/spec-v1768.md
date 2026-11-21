# spec-v1768 — A sourced floor for hemoglobin and hematocrit

> Status: **SHIPPED (2026-11-21)**. The catalog stays 2,387.

spec-v1762 left hemoglobin's floor unsourced: case reports cited 0.7 g/dL with transfusion and 1.8 g/dL without, but
the primary reports could not be read, so `CEILING_ONLY` let any low hemoglobin or hematocrit through. A primary
report now names the extreme: a hemoglobin of 1.4 g/dL, survived "without any sequelae" (de Araujo Azi et al.,
*Transfusion* 2014, PMID 24117834).

| Quantity | Floor was | Floor now |
|---|---|---|
| hemoglobin | 2 g/dL, not enforced (CEILING_ONLY) | 1 g/dL, enforced |
| hematocrit | 5 %, not enforced | 3 % (1.4 g/dL is a hematocrit of about 4 %), enforced |

Both left `CEILING_ONLY` (albumin and glucose stay on it). The floor finder then listed 13 tools that still answered
a hemoglobin of 0.5 g/dL or a hematocrit of 1.5 %; each now refuses with the range. EBV/MABL's "minimum acceptable
hematocrit" is a target, not a measurement, and keeps its own range.

Tests: `test/unit/hemoglobin-floor-v1768.test.js`.
