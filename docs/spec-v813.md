# spec-v813 — WHO Criteria (Systemic Mastocytosis)

## What this gives you

Tick the marrow, flow, molecular and tryptase findings; get whether the WHO criteria for
systemic mastocytosis are met — with the tryptase value corrected for hereditary
alpha-tryptasemia before it is judged.

Mastocytosis was a zero-hit word here. It is rare, under-diagnosed, and its criteria are
spread across four different laboratories' reports, which is exactly the shape a checklist
tool is for.

## §1 The rule

**One major plus one minor criterion, or three minor criteria.**

**Major** — multifocal dense infiltrates of mast cells, ≥15 in aggregates, in bone marrow or
another extracutaneous organ.

**Minor**
1. \>25% of mast cells atypical or spindle-shaped.
2. An activating KIT point mutation at codon 816 **or another critical region**.
3. Mast cells aberrantly expressing CD2, CD25 **or CD30**.
4. Baseline serum tryptase **>20 ng/mL**, *in the absence of an associated myeloid neoplasm*.

CD30 and the widening beyond codon 816 are 2022 (5th edition) changes.

## §2 The computed part, and why it earns the tile

Minor criterion 4 is not a threshold you can read off a lab report. In hereditary
alpha-tryptasemia the value must first be divided by **(1 + the number of extra
alpha-tryptase gene copies)**.

The consensus worked example: **30 ng/mL with one extra copy corrects to 15** — and 15 does
not meet the criterion. Read raw, it does.

That is not a rounding difference. In the three-minor-criteria route it is the whole
diagnosis: with atypical morphology and a KIT mutation already counted, the raw reading
gives three minors and systemic mastocytosis, and the corrected reading gives two and
cutaneous. A unit test asserts exactly that flip.

The tile therefore asks for the **measured** tryptase and the copy number, does the
correction itself, and prints what the correction did whenever it did anything. It also
declines the criterion outright when an associated myeloid neoplasm is present, because
that exception is in the published wording rather than a caveat added on top.

## §3 Sourcing (spec-v97 gate)

- Khoury JD, Solary E, Abla O, et al. The 5th edition of the WHO Classification of
  Haematolymphoid Tumours. *Leukemia.* 2022;36(7):1703-1719.
- PMC9322501 — reproduces the major and four minor criteria with every threshold.
- Valent P, Akin C, Hartmann K, et al., consensus proposal (PMC8659997) — the
  alpha-tryptasemia correction and its worked example.

WHO is a tracked issuer, so `docs/citation-staleness.md` carries a row for this tile.

## §4 Posture

Decision support, not a verdict. It applies criteria to results already obtained. It does
not order the marrow biopsy or the tryptase genotyping that most of them depend on — and the
genotyping is precisely what criterion 4 turns on.

Catalog 1604 → 1605.
