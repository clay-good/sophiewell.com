# spec-v1069 — the input that changed nothing

The blank-field programme ([spec-v1063](spec-v1063.md) → [spec-v1067](spec-v1067.md))
asked what happens when a reader leaves a field empty. This is the mirror
question: what happens when they fill one in and it is thrown away.

## `dka-hhs` collected a mental status and discarded it

Both surfaces ask for it. The browser renders a three-option picker — **Alert /
Drowsy / Stupor or coma** — and the agent surface declares the same enum. The
value reached `dkaHhs()` as a destructured argument that **nothing in the
function body read**, so a patient graded identically whichever was chosen.

The function's own header comment had said all along that the ADA criteria
classify "from glucose, pH, bicarbonate, ketones, effective serum osmolality,
anion gap, **and mental status**". The line below it then graded "on fixed pH and
HCO3 cutoffs". The comment described the table; the code implemented two of its
rows.

**Sources.** The severity table's mental-status row is reproduced in open access
(PMC13284666): Mild **Alert**, Moderate **Alert/drowsy**, Severe **Stupor/coma**,
alongside the pH and bicarbonate rows the tile already used. PMC12693036
independently records admission mental status in those same three categories.
The three options the tile already offered are that row, verbatim.

**The fix, and the conservative half of it.** The grade is now the worst of the
pH, bicarbonate and mental-status rows — the same `max()` the first two already
used. *Alert scores nothing*: it appears in both the mild **and** the moderate
row, so it cannot identify a grade of its own, and more importantly it must never
pull down a grade the chemistry has earned. Only drowsy (moderate) and stupor or
coma (severe) raise it. Omitting mental status entirely leaves every existing
answer exactly as it was.

The worked example already set `dk-mental: 'stupor'` and expected a severe grade —
which the chemistry alone produced. So the example passed for years while the
input it set did nothing.

## What the sweep did not find

This came out of reading the `no-unused-vars` hits that spec-v1068 counted and
set aside. Of 61 in `lib/` and `mcp/`, all but a handful are dead helper imports
(`r1`, `r2`, `on`, `pos`, `fin`) or `_` placeholders. Two more looked like the
same shape and are **not** defects:

- **`ecgAxis`'s `leadII`** is collected on both surfaces and never read — but the
  function's own fallback says so out loud: "Lead II is optional and does not
  change the result." Documented, not discarded. (A reader holding leads I and II
  but not aVF still gets nothing, and Einthoven's relation would give it to them.
  That is an improvement, not a bug fix, and is left alone.)
- **`uro-v131.js`'s `fields`** is a generic "Complete every field" message
  superseded by five specific ones — every function in that file names the exact
  inputs it wants. Dead, harmless.

So the rule that produced 91 hits, and was rejected as a gate, still paid for
itself once: **one input, on two surfaces, that changed nothing.**

## A probe measured and rejected: "which enum fields are inert?"

The obvious way to mechanize this finding is dynamic: take each calculator's
worked example, vary one enum field through every value it declares, and flag the
fields where the answer never moves. It was written and run over the whole agent
surface — **2,117 enum fields across 1,682 calculators**.

It flags **38**, and the flags are noise. The reason is visible in the very
defect that prompted it: `dka-hhs|mental` is still on the list *after* the fix,
because that tile's example has a pH of 6.95, and chemistry that severe forces
the severe grade whatever the mental status says. A field that is inert **on one
patient** is not an inert field.

Four were opened and every one is correct behaviour:

| Flagged | Why it is right |
|---|---|
| `isaric-4c-mortality\|ureaUnit` | works fine — the example's urea is 5, which scores 0 in **both** units. At 20 the units give 11 and 9. |
| `gustilo-anderson\|wound` | the example is Type IIIC, which is **defined** by arterial injury regardless of wound size |
| `fleischner-2017\|risk` | the example nodule is > 8 mm, where the guideline gives the same recommendation to both risk categories |
| `dka-hhs\|mental` | fixed above; the example's chemistry already forces severe |

The rest of the list is the same shape: sums past a threshold (`mdq`'s seven
symptom items, `ses-cd`'s per-segment scores), and criteria overridden by a
stronger one on that particular patient.

**The static check is the one that works.** `no-unused-vars` with `args: "all"`
asks whether the function body references the argument *at all*, which is a
property of the code rather than of one example. It found `mental`, and it found
the one other candidate (`ecgAxis`'s `leadII`, documented and therefore fine).
Two hits, one real defect, no noise.

Do not re-run the dynamic version. If it is ever revisited, the fix is to vary
the enum from a **minimal** baseline rather than from the worked example, so
nothing else is already saturating the answer — and even then it can only say
"inert for these inputs".
