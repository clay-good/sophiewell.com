# spec-v1187 — the name on the bag

After [spec-v1185](spec-v1185.md) and [spec-v1186](spec-v1186.md), three bedside
queries out of thirty still returned **nothing**, and all three failed for one
reason: not one of the 664 synonym entries was a brand name.

```
"how much tylenol"     -> nothing, while Acetaminophen 24-Hour Total exists
"morphine to dilaudid" -> nothing, while the opioid converter handles both
"how much bicarb"      -> nothing, while Bicarbonate Deficit exists
```

A nurse reads the name on the bag, the vial and the MAR. The catalog only knew
the name in the paper.

## The obvious rule is wrong, and that is the finding

"Send a brand where its generic already lands" sounds principled, and it is
measurable — so it was measured, across 48 candidate brands. It produces
**confidently wrong** answers:

| generic | where it lands today | what the brand would have got |
|---|---|---|
| acetaminophen | King's College criteria (**non**-acetaminophen ALF) | Tylenol → a liver-failure prognosis |
| warfarin | HAS-BLED | Coumadin → a bleeding-risk score |
| ceftriaxone | Boston Criteria (febrile infant) | Rocephin → infant fever criteria |
| furosemide | Furosemide Stress Test (AKI) | Lasix → a diagnostic test, not a dose |

A brand routed there is **worse than one that returns nothing**: a nurse asking
how much Tylenol would get a liver-failure prognosis, stated confidently. A
synonym is a hard route, matched before ranking, so it is the strongest claim
this codebase can make about a query.

## The rule that shipped

Route a brand only where the landing tile's **name** names that drug, its
generic, or the conversion it belongs to. It is checkable, so
`test/unit/brand-name-routes.test.js` asserts it rather than describing it —
which is what stops the next batch shipping `warfarin -> HAS-BLED`.

**39 phrases across 14 tiles.** Tylenol was hand-corrected to
`apap-24h-max`, against where its generic lands, for exactly the reason above.

**Not shipped, and why:** Lasix, Coumadin, Rocephin, Cordarone (the generic lands
somewhere incidental); Eliquis, Xarelto, Pradaxa (reversal dosing is a real
answer, but not what someone typing the brand usually wants); Lanoxin (its
generic lands on the *antidote*, DigiFab); "epi" (too short, and it collides);
Motrin, Advil, Zofran, Protonix, Plavix, Toradol, Cardizem, Keppra and a dozen
more, whose generic reaches nothing today — there is no tile to route them to,
and inventing one is a different wave.

## Measured

| | before | after |
|---|---|---|
| bedside queries returning nothing | 3 of 30 | **0 of 30** |
| brand routes reaching the intended tile at rank 1 | — | **18 of 18** |
| tiles whose top-1 for their own name changed | — | **0 of 1,706** |

## Verification

`npm run release:check` green, exit code read directly rather than through a
pipe. The existing synonym gates (`synonyms.test.js`,
`synonyms-catalog.test.js`) pass unchanged: every phrase lowercase, no duplicate
across entries, every tile id real.

Rank 1 is asserted here, unlike the sibling search gates that assert membership
only — a synonym is matched before ranking and does not depend on how the catalog
reweights, so it cannot go stale when a tile is added. That is precisely why the
other gates avoid position.
