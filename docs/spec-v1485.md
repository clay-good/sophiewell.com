# spec-v1485 — ICDAS caries codes

The catalog had the DMFT caries index but not ICDAS, the International Caries Detection and Assessment
System. ICDAS records caries by severity, from the first visible change in enamel to an extensive
cavity.

## What it does

The reader chooses an ICDAS code, 0 to 6, for up to six surfaces. The answer gives the most severe
code, what it means, and a count of the surfaces in each merged severity group:

| Code | Meaning | Merged severity |
|---|---|---|
| 0 | sound tooth surface | sound |
| 1 | first visual change in enamel, seen only after drying | initial |
| 2 | distinct visual change in enamel | initial |
| 3 | localized enamel breakdown, no dentin visible | moderate |
| 4 | underlying dark shadow from dentin | moderate |
| 5 | distinct cavity with visible dentin | extensive |
| 6 | extensive distinct cavity with visible dentin | extensive |

A surface left blank is not scored; it is not read as sound. With nothing entered, the tool asks.

## Sources

- Ismail AI et al. Community Dent Oral Epidemiol 2007;35(3):170-178.
- Codes as stated in Braz Oral Res 2026 (PMC12969832).
- The merged severity as stated in J Clin Exp Dent 2026 (PMC13354049).

## Tests

`test/unit/icdas-caries.test.js`: the worked example, the merged groups, and blank surfaces.
