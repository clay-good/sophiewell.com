# spec-v1652: NIHSS severity bands cite where they are stated

> Status: **SHIPPED (2026-10-19).**

Each NIHSS table row said "per NIH/NINDS interpretation guide", and the table's source line credited the
bands to Adams 1999 and the public NIHSS form. Neither was read for these bands, and Adams 1999 grouped
scores differently. Open stroke cohorts state the five bands exactly (minor 1-4, moderate 5-15,
moderate-to-severe 16-20, severe 21-42) and call them a widely used clinical stratification
(PMC12250339, PMC13390899, PMC13361296).

The rows now name the band only, and the source line says what the bands are and where they are stated,
with Brott 1989 kept for the scale itself. The bands and the result are unchanged ([spec-v1645](spec-v1645.md)
made the result agree with them). This closes the last open item of [spec-v1644](spec-v1644.md).
