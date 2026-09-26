# spec-v1570 — Watcha emergence agitation scale

The shorter sibling of PAED: one rating of crying and consolability after anesthesia. (spec-v1500 to v1517 and v1540 to v1564 are other programs' ranges; this spec takes the next free number.)

## Inputs

`we-behavior`, required: the most agitated behavior since emergence.

## What it does

The level, with both numberings the sources use (0 asleep to 4 in one, 1 calm or asleep to 4 in the other; they agree from 2 up), and agitation at 3 or more. Below 3 the answer says it does not rule delirium out, with the sensitivity reported against PAED (0.34 vs 0.93).

## Sources

Watcha MF et al. Can J Anaesth 1992;39(7):649-654. Levels as stated in J Anaesthesiol Clin Pharmacol 2025 (PMC11867362) and BMJ Paediatr Open 2025 (PMC11911689); sensitivity from Braz J Anesthesiol 2024 (PMC11334726).

## Tests

`test/unit/watcha-emergence.test.js`: the worked example, the cutoffs, and blanks.
