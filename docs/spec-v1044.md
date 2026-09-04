# spec-v1044 — Nine rating scales that did not say how many items they scored

`docs/spec-v1043.md` grouped the required-field ledger by reason, and the grouping made one entry
obvious: nine of the remaining lines were the *same* judgment, not nine separate ones.

Each is a scale that totals its items. `Number('')` is 0, so an item nobody rated arrived as an item
rated zero — and the tile printed a total as if the assessment were complete:

| Tile | Items | An unrated item |
| --- | --- | --- |
| `esas-symptom-assessment` | 9 symptoms, 0–10 | understates the symptom burden |
| `bess-balance-error` | 6 stances, 0–10 errors | understates the errors, i.e. looks steadier |
| `mmt8-myositis` | 8 muscle groups, 0–10 | **looks weaker** — higher is better here |
| `harris-hip-score` | 4 domains | **looks worse** — "poor (< 70)" |
| `harvey-bradshaw` | 5 components | shifts the Crohn's activity band |
| `ihs4` | 3 lesion counts | shifts the hidradenitis band |
| `intubation-difficulty-scale` | N1–N7 | shifts "slight-to-moderate difficulty" |
| `midas` | 5 questions | shifts the disability grade |
| `salt-score` | 4 scalp regions | shifts the alopecia severity band |

Note the third and fourth rows. On a scale where a higher score is better, the same blank field makes
the patient look **worse**, not better — which is why "an incomplete score may rule in" is not a
licence to print an incomplete total either way (spec-v1036).

## The fix

One helper, `needItems`, added to the eight view modules that hold these scales. It names the
unrated items in the words on their own labels:

> Rate the top of the scalp, the back and the left side: the total is the sum of the items, so one
> left blank is not an item scoring zero.

A clinician who means zero types zero, and **a typed zero still means zero** — the first rule of
`docs/product-decisions.md`. That is the whole distinction being drawn here.

Ledger: 27 → 18. The remaining 18 are the sums over things that are present or absent, the partial
scores that already state their footing, WAT-1 (blocked on a control change) and the four billing
tiles whose `required` declaration is probably wider than their formula.
