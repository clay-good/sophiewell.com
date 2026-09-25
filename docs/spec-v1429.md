# spec-v1429 — Nerot-Sirveaux classification of scapular notching

From the classification-gap queue. The shoulder arthroplasty tiles cover the glenoid before surgery
(`walch-glenoid`) and cuff tear arthropathy (`hamada`), and nothing graded the commonest radiographic
finding after a reverse shoulder arthroplasty: the notch the humeral component erodes in the
scapular neck.

## Sources

- Sirveaux F, Favard L, Oudet D, Huquet D, Walch G, Mole D, *J Bone Joint Surg Br* 2004;86:388-395
  (PubMed 15125127; DOI confirmed via Crossref): the original, 80 Grammont reverse shoulders.
- Young BL, Cantrell CK, Hamid N, *Classifications in Brief: The Nerot-Sirveaux Classification for
  Scapular Notching*, Clin Orthop Relat Res 2018;476:2454-2457 (open access, PMC6259901), read
  2026-09-24. Its text is the rule this tool applies, on a true AP tangential to the baseplate:

| grade | how far the notch reaches |
|---|---|
| 1 | inferior pillar of the scapular neck only |
| 2 | in contact with the lower screw |
| 3 | extends over the lower screw |
| 4 | extends under the baseplate |

## Behavior

The grade is read from the landmark the notch reaches. No notch returns "nothing to grade" rather
than an invented grade 0. Grades 1-2 carry the impingement note and grades 3-4 the osteolysis note
the review gives. A projection other than a true AP tangential to the baseplate adds a warning that
the notch can be hidden. Every graded answer carries the single reliability study (kappa above 0.86)
and the review's caution that no grade has been shown to be an indication for revision.

## Tests

`test/unit/nerot-sirveaux.test.js`: each landmark gives its grade; no notch is not grade 0; the
mechanism note splits between grades 2 and 3; the projection warning; the refusals.
