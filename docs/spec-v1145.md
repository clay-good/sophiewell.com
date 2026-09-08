# spec-v1145 — the half-filled form, and what each starting state can see

[spec-v1144](spec-v1144.md) added a second starting state to `js-error-probe`
after the first one — the cleared form — turned out to be structurally unable to
find the defect [spec-v1143](spec-v1143.md) fixed. This adds the third, and then
measures what each of the three can actually reach.

## The third state

CLEARED takes every guard to its refusal. AS IT OPENS takes none of them. The
crash a renderer is most likely to have is neither: it is the **half-filled
form**, where the library answers partially and the renderer reads a property
that result does not carry. That is the shape the blank-field waves were built
on — an all-fields sweep goes quiet the moment one guard fires, so it never
reaches the tile that answers a partial form and then trips over its own answer.

Each field is cleared from the complete worked example and put back before the
next one. Clearing them cumulatively is the cleared pass again.

## What each state sees

Negative-tested by reverting the `derivation()` fix and running all three:

| Pass | `drg-payment` | `drug-wastage` |
| --- | --- | --- |
| cleared form | — | — |
| as it opens | found | found |
| one field blank | found (on **two** fields) | — |

**No pass subsumes another.** `drug-wastage` refuses before it reaches its
derivation once a field is missing, so only the untouched form finds it;
`drg-payment` is found by two of the three, and by neither the original one.

With the fix in place, all three are clean across the catalog, and the whole file
runs in under four minutes.

## Its reach, printed with its result

A clean sweep is a claim about its reach, so the third pass prints its own:

| | |
| --- | --- |
| (tile, field) pairs actually cleared | **2,613** |
| tiles with **no filled** text or number input | **845** |

Those 845 are built of checkboxes and graded selects, and this pass cannot drop
one: unchecking a box is a real *"no"* (rule 4), not a blank, so it is a
different question rather than the same one at a different starting point. Naming
the number is the point — five checks in this programme were narrowed exactly
this way and stayed silent about it.
