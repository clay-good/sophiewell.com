# spec-v1178 — the same report, the other analyte

[spec-v1174](spec-v1174.md) fixed five scores that answered a platelet count in
the units a US lab report prints. This is the same defect with albumin, drained
from [spec-v1175](spec-v1175.md)'s queue — and it is **worse, because the
direction is fixed.**

An SI lab report prints serum albumin in **g/L**: 40 g/L *is* 4.0 g/dL. Higher
albumin reads as healthier in every score that uses it, and the wrong unit is ten
times higher. So it always lands on the favourable side:

| Tile | Given albumin 40 (the g/L figure) | It answered |
| --- | --- | --- |
| `albi-grade` | | *ALBI grade 1: **the best preserved liver function*** |
| `nafld-fibrosis` | | *NFS < -1.455: **excludes advanced fibrosis** (F0-F2)* |
| `stewart-sid-sig` | | *at or below ~2 mEq/L, **no excess unmeasured strong anions*** |

With platelets, whether the wrong unit reassured depended on where the count sat
in the formula. With albumin it does not depend on anything.

## `albi-grade` converts the units itself

```js
if (albuminDl === null || biliMg === null) return { valid: false, message: INCOMPLETE };
const albuminGL = albuminDl * 10;          // <- one line below the guard
```

The function knows the g/dL ↔ g/L relationship and applies it. A reader entering
the g/L figure had it **multiplied by ten a second time** — 40 became 400 g/L,
driving the score to −33 against a grade-1 cutoff of −2.60.

**A conversion inside a function is a statement about what its input is not.**
Where a library converts a unit, the input in the other unit is exactly the
mistake to guard, and the conversion line is where that is most visible.

## Each refusal does the conversion

> A serum albumin of 40 g/dL is above ~7, beyond recorded extremes. An albumin
> reported in g/L is ten times the g/dL figure, so 40 g/L is entered as 4.

The ceiling is `BOUNDS.albumin`, whose own note has said *"values outside 0.5-7
indicate a unit or entry error"* since spec-v59. As in spec-v1174, no clinical
number is invented here. A real hyperalbuminaemia of 5.5 g/dL is inside the
envelope and still answers — the bound is for the impossible, not the unusual.

## Where this leaves the queue

spec-v1175's first section listed **11** fields that answered reassuringly from
an impossible value. These three were the albumin cluster. The remainder —
`cdai-crohns` (haematocrit 750%), `ipss-r-mds` (haemoglobin 250 g/dL),
`lactate-clearance`, `sokal-cml`, `abi`, `mews` — are each a different envelope
and a different reading, and `sokal-cml` additionally prints
`3.9512129886066085e+66` into its own answer, which belongs to
`no-impossible-number.spec.js`.

## Verification

`npm run release:check` green. The three guards are tested in
`test/unit/platelet-unit-confusion.test.js` alongside the platelet ones they
share a cause with, each in both directions: the g/L figure refused with the
conversion named, and the g/dL figure still answering.
