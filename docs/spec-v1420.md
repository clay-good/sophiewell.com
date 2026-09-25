# spec-v1420 — Paprosky classification of femoral bone loss

From the classification-gap queue. Revision hip surgery had the acetabular defect
([spec-v1418](spec-v1418.md), `paprosky-acetabular`), femoral morphology (`dorr-femur`) and
periprosthetic fracture (`vancouver-periprosthetic`), and nothing for the femoral defect that
decides the revision stem.

## Sources

- Aribindi R, Barba M, Solomon MI, Arp P, Paprosky W, *Bypass fixation*, Orthop Clin North Am
  1998;29:319-329 (DOI confirmed via Crossref, PubMed 9553577): the paper the review names as the
  initial description.
- Ibrahim DA, Fernando ND, *Classifications In Brief: The Paprosky Classification of Femoral Bone
  Loss*, Clin Orthop Relat Res 2017;475:917-921 (open access, PMC5289194), read 2026-09-24. Its
  Table 1 is the rule this tool applies:

| type | metaphysis | diaphysis | deciding feature |
|---|---|---|---|
| I | minimal loss | intact | proximal geometry kept |
| II | extensive loss | minimal loss | diaphysis intact |
| IIIA | extensive loss | extensive loss | 4 cm or more intact diaphysis |
| IIIB | extensive loss | extensive loss | less than 4 cm intact diaphysis |
| IV | extensive loss | extensive loss | nonsupportive isthmus |

## Behavior

The type is **derived**. Metaphysis and diaphysis are required. With both extensive, the isthmus
is asked for (nonsupportive is type IV), then the intact length (4 cm splits IIIA from IIIB).
Minimal metaphyseal with extensive diaphyseal loss is not a row, so the tool says "No single type"
instead of forcing one. A nonsupportive isthmus entered for type I or II, or 4 cm of intact bone
entered with type IV, prints a "not a clean fit" note. Every answer says that films understated
the loss in 12% of hips in one series, that the final type is set at surgery, and gives the kappa
range (0.12 to 0.80).

## Tests

`test/unit/paprosky-femoral.test.js`: every Table 1 row derives its own type; the exact IIIB band;
type IV overrides an entered 4 cm with a note; the off-table combination and the inconsistent
isthmus; the caveats; refusals only for the finding that decides the type.
