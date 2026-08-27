# spec-v812 — Leipzig Score (Wilson Disease diagnosis)

## What this gives you

Enter the clinical, biochemical, histological and genetic findings; get the Leipzig score
and which of its three conclusions it supports.

Wilson disease was a zero-hit word in this catalog. It is the treatable one — miss it and a
young person goes to transplant or dies of a disease that responds to chelation — and the
score that pulls the scattered evidence together was not here.

## §1 The table

| Item | Levels | Points |
|---|---|---|
| Kayser-Fleischer rings | present / absent | 2 / 0 |
| Neurologic symptoms or typical brain MRI | severe / mild / absent | 2 / 1 / 0 |
| Serum ceruloplasmin | <0.1 / 0.1–0.2 / normal | 2 / 1 / 0 |
| Coombs-negative hemolytic anemia | present / absent | 1 / 0 |
| Liver copper (dry weight) | >4 µmol/g / 0.8–4 / **normal** | 2 / 1 / **−1** |
| Rhodanine-positive granules | present *(only if no quantitative copper)* | 1 |
| 24-h urinary copper | >2× ULN / 1–2× ULN / normal | 2 / 1 / 0 |
| — also | normal at baseline but >5× ULN after D-penicillamine | 2 |
| ATP7B mutation analysis | both chromosomes / one / none | 4 / 1 / 0 |

**≥4** diagnosis established · **exactly 3** possible, more tests needed · **≤2** very
unlikely.

## §2 The two items that are not a plain checklist

Both would be got wrong by an implementation that just adds up whatever is ticked, and both
have a unit test.

**A normal liver copper scores −1, not 0.** It is evidence *against* the diagnosis. A tool
that clamps items at zero reports a higher total than the rule gives — and it matters right
at the boundary: KF rings plus mild neurologic signs is 3 ("possible") with no biopsy, and 2
("very unlikely") once a normal quantitative copper comes back. The tile says so when it
happens rather than leaving the reader to notice the total moved the wrong way.

**Rhodanine granules substitute for quantitative liver copper.** The published table scores
them *"if no quantitative liver copper is available"*. They are an alternative, not an
extra; adding both double-counts the same histology. When both are entered the tile scores
the quantitative result, ignores the stain, and says which and why.

## §3 Sourcing (spec-v97 gate)

- Ferenci P, Caca K, Loudianos G, et al. Diagnosis and phenotypic classification of Wilson
  disease. *Liver Int.* 2003;23(3):139-142 — the system agreed by the Working Party at the
  8th International Meeting on Wilson Disease, Leipzig 2001.
- Independently reproduced, item for item including the −1 and the rhodanine condition, in
  PMC8471362 and PMC8584493.

Two independent reproductions agree on every item, every weight and all three band cutoffs.

## §4 Shape

Seven selects and one checkbox. Option *values* are numeric codes rather than point values,
because two urinary-copper options are both worth 2 points and a value cannot double as the
score. Options are literal, not looped, so the pre-rendered pages resolve their text.

## §5 Posture

Decision support, not a verdict. It scores evidence already gathered. It does not start
chelation or zinc.

Catalog 1603 → 1604.
