# spec-v1421 — Johnson and Strom staging of adult-acquired flatfoot deformity

From the classification-gap queue. The foot had fracture systems (`lisfranc-myerson`,
`sanders-calcaneal`, `hawkins-talar`) and a posture measure (`foot-posture-index`), but no staging
for the commonest acquired flatfoot, posterior tibial tendon dysfunction.

## Sources

- Johnson KA, Strom DE, *Tibialis posterior tendon dysfunction*, Clin Orthop Relat Res
  1989;(239):196-206 (PubMed 2912622; no DOI registered): stages I to III. The review's own
  PubMed link for this paper points at a different 1983 article; the PMID here was found by
  author search and checked by title, journal, year and pages.
- Myerson MS, *Instr Course Lect* 1997;46:393-405 (PubMed 9143981): stage IV A and B.
- Abousayed MM, Tartaglione JP, Rosenbaum AJ, Dipreta JA, *Classifications in Brief: Johnson and
  Strom Classification of Adult-acquired Flatfoot Deformity*, Clin Orthop Relat Res
  2016;474:588-593 (open access, PMC4709320), read 2026-09-24. Its Table 1:

| finding | stage I | stage II | stage III |
|---|---|---|---|
| deformity | absent | present, flexible | present, fixed |
| heel-rise test | mild weakness | marked weakness | marked weakness |
| "too many toes" | absent | present | present |
| images | no changes | gross deformity | deformity and diffuse arthritic change |

Stage IV (Myerson): ankle valgus with deltoid insufficiency, A flexible, B fixed.

## Behavior

The stage is **derived**. The ankle is required, so a blank is never read as "no valgus"; valgus
makes IVA or IVB. Otherwise the hindfoot deformity (the row that separates the stages) makes I, II
or III. Heel rise, the "too many toes" sign and arthritic change are optional; when entered they
are checked against the column and a mismatch prints "not a clean fit". Stage IV on a hindfoot
that is not fixed is flagged against Johnson and Strom's own description. Every answer says the
staging has never been validated and leaves out the spring and deltoid ligaments and midfoot
joints. No treatment is given: the stage does not choose it.

## Tests

`test/unit/johnson-strom-flatfoot.test.js`: each column derives its stage and is concordant; the
exact stage II band; stage IV and the non-fixed hindfoot flag; mismatched findings reported; the
validity notes; refusals, including a blank ankle.
