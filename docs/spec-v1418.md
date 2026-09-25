# spec-v1418 — Paprosky classification of acetabular bone loss

From the classification-gap queue. Revision hip surgery had the femoral side
(`vancouver-periprosthetic`), heterotopic bone (`brooker`) and infection (`icm-pji-2018`), and
nothing for the acetabular defect that decides the reconstruction.

## Sources

- Paprosky WG, Perona PG, Lawrence JM, *J Arthroplasty* 1994;9:33-44 (DOI confirmed via
  Crossref): the original, from 147 failed acetabular components.
- Telleria JJM, Gee AO, *Classifications in Brief: Paprosky Classification of Acetabular Bone Loss*,
  Clin Orthop Relat Res 2013;471:3725-3730 (open access, PMC3792247), read 2026-09-24. Its Table 1
  is the rule this tool applies:

| type | teardrop | hip center | Kohler line | ischium |
|---|---|---|---|---|
| 1 | intact | no migration | intact | intact |
| 2A | intact | < 2 cm superomedial | intact | intact |
| 2B | intact | < 2 cm superolateral | intact | intact |
| 2C | moderate lysis | < 2 cm medial | disrupted | intact |
| 3A | moderate lysis | > 2 cm superolateral | intact | moderate lysis |
| 3B | severe lysis | > 2 cm superomedial | disrupted | severe lysis |

## Behavior

The type is **derived**: migration sets the grade; under 2 cm the direction (or a disrupted Kohler
line, which only 2C has) sets 2A/2B/2C; over 2 cm the Kohler line sets 3A (intact, "up and out")
or 3B (disrupted, "up and in"), following the review's text. The teardrop and ischium are optional;
when entered they are checked against the row, and any disagreement is printed as "not a clean fit"
rather than silently absorbed. Type 3 raises pelvic discontinuity. Every answer carries the
reliability range the review reports (interobserver kappa 0.02 to 0.79), and the note records that
the 2 cm line was later moved to 3 cm.

## Tests

`test/unit/paprosky-acetabular.test.js`: every Table 1 row derives its own type and is concordant;
the Kohler line decides grade 3; a disrupted line under 2 cm is 2C with the direction flagged; a
finding off the row is reported; the pelvic-discontinuity and reliability notes; the refusals.
