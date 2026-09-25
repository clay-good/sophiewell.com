# spec-v1442 — Kyoto classification of gastritis score

From the classification-gap queue (`kyoto`, `kimura-takemoto`): the catalog grades the esophagus
(`la-esophagitis`), the hiatus (`hill-grade`) and superficial neoplasia (`paris-classification`),
and had nothing for the background gastric mucosa that sets gastric cancer risk.

## Source, read 2026-09-24

Hiramatsu T et al, *Clin Endosc* 2025;58:787 (open access, PMC12933536; DOI checked on Crossref),
Table 4 and text:

| finding | 0 | 1 | 2 |
|---|---|---|---|
| atrophy (Kimura-Takemoto) | C0-C1 | C2-C3 | O1-O3 |
| intestinal metaplasia | none | antrum | antrum and corpus |
| enlarged folds | no | yes | |
| nodularity | no | yes | |
| diffuse redness | none (RAC present) | mild (RAC partly visible) | severe (RAC absent) |

"The Kyoto score is calculated as the sum of 0 to 8 points"; "a Kyoto score of 4 or higher is
rated as a risk for GC". Eradication lowered the mean score (3.90 to 2.78) through folds,
nodularity and redness but not atrophy or metaplasia, and "because map-like redness appears after
eradication, the score may increase with eradication".

## Behavior

Every finding is required. The answer compares the total with 4, always carries the
post-eradication caveat, and says the score grades the background mucosa: it does not detect or
exclude a cancer. The paper's modified Kyoto classification (Table 5) is a different scale and is
not included.

## Tests

`test/unit/kyoto-gastritis.test.js`: 0-8 range, the 3/4 edge, the caveat, blanks and invalid values.
