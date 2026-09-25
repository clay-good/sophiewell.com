# spec-v1419 — Allen and Ferguson classification (subaxial cervical spine injury)

From the classification-gap queue. The subaxial cervical spine has the current systems
(`ao-spine-subaxial`, `slic-score`), but older operative notes, radiology reports and most papers
before 2016 name injuries by Allen and Ferguson stage ("DF3", "CE2"), and nothing here read them.

## Sources

- Allen BL Jr, Ferguson RL, Lehmann TR, O'Brien RP, *Spine* 1982;7:1-27 (DOI confirmed via
  Crossref, PubMed 7071658): the original, 165 closed, indirect subaxial injuries.
- Bunzel EW, Gendelberg D, *Classifications In Brief: The Allen and Ferguson Classification*,
  Clin Orthop Relat Res 2024;482:1137-1144 (open access, PMC11219176), read 2026-09-24. Its
  Figs. 1-6 define the 21 stages this tool returns:

| phylogeny | stages | what the top stage is |
|---|---|---|
| compressive flexion | 5 | body displaced back into the canal |
| vertical compression | 3 | fracture joins both endplates, fragments displaced |
| distractive flexion | 4 | bilateral facet dislocation, 100% displacement |
| compressive extension | 5 | body displaced forward its full width |
| distractive extension | 2 | anterior failure plus backward displacement |
| lateral flexion | 2 | contralateral distraction with ligament failure |

## Behavior

A **decoder**, not a derivation. The phylogeny is a mechanism the reader infers from the films,
so no finding decides it without guessing; the reader picks the stage and the tool returns the
published definition. Three stages also carry the neurologic result the 1982 series reported
(CF5, VC3, DE2). CE3 and CE4 say that the series had no such injuries; lateral flexion says its
interobserver kappa was -0.16. Every answer carries the reliability data (kappa 0.34 over 21
stages, 0.50 over six phylogenies) and the review's recommendation against using the scheme as a
diagnostic or prognostic tool, pointing to `ao-spine-subaxial`.

## Tests

`test/unit/allen-ferguson.test.js`: 21 stages in the 5/3/4/5/2/2 split, each with a distinct
definition; exact wording of the definitions; the series notes on the three stages that have them;
the unobserved-stage and lateral-flexion flags; the reliability and against-use notes; refusals of
a missing or nonexistent stage.
