# spec-v1430 — Spinal Deformity Study Group classification of lumbosacral spondylolisthesis

From the classification-gap queue. Spondylolisthesis had the slip grade
(`meyerding-spondylolisthesis`) and the cause (`wiltse-spondylolisthesis`), and nothing that adds
the pelvic and global sagittal balance that the SDSG types are built on.

## Sources

- Labelle H, Mac-Thiong JM, Roussouly P, *Eur Spine J* 2011;20(Suppl 5):641-646 (PubMed 21809015;
  DOI confirmed via Crossref): the six-type description from the SDSG database of 816 patients.
- Camino Willhuber G, Kido G, *Classifications in Brief: The Spinal Deformity Study Group
  Classification of Lumbosacral Spondylolisthesis*, Clin Orthop Relat Res 2020;478:681-684 (open
  access, PMC7145059), read 2026-09-24. Its text is the rule this tool applies:

| type | slip | then |
|---|---|---|
| 1 | low grade (under 50%) | pelvic incidence under 45° |
| 2 | low grade | pelvic incidence 45° to 60° |
| 3 | low grade | pelvic incidence over 60° |
| 4 | high grade (over 50%) | balanced sacropelvis (low pelvic tilt, high sacral slope) |
| 5 | high grade | unbalanced sacropelvis, C7 plumb line at or behind the femoral heads |
| 6 | high grade | unbalanced sacropelvis, C7 plumb line in front of the femoral heads |

## Behavior

The type is **derived** from the slip percent, then the pelvic incidence (low grade) or the
sacropelvic balance and plumb line (high grade); each input is asked for only when its branch
needs it. Two choices are disclosed rather than hidden: the review gives no number for "high
pelvic tilt / low sacral slope", so the balance is entered as a judgment and not computed from
angles; and a slip of exactly 50% is counted as low grade (Meyerding grade II runs to 50%) with a
note. A pelvic incidence within the 5° measurement error of 45° or 60° is flagged; a low-grade slip
marked unbalanced is reported as "not a clean fit", since the review says low-grade slips are
balanced. Reliability (kappa 0.83 intra, 0.64 inter; 0.60-0.63 among types 1-3) and the SDSG's
reduction recommendations, with the review's caution, are printed. Not for degenerative or L4-L5
slips.

## Tests

`test/unit/sdsg-spondylolisthesis.test.js`: the 45°/60° edges; types 4-6; the 50% edge; the
measurement-error flag; the imbalance note; missing and impossible inputs refused.
