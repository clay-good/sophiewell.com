# spec-v1824 — The reassuring-direction filter, spent

> Status: **SHIPPED (2026-11-26)**: no code changed. Section 3 of `probe-omitted-field-decides` is filtered
> for the one shape that can hurt, the four rows it returns are read, and the finding is recorded where the
> next reader will see it. The catalog stays 2,390.

## Why a report with nothing to fix is worth a spec

[spec-v1813](spec-v1813.md) gated the first two sections of this finder at zero and left the third — 108
rows across 56 calculators — as a prioritized reading list, because a row there is the band or stage moving
while `abnormal` does not, which is the weaker signal by construction. A reading list nobody sorts is a
reading list nobody reads, which is the lesson [spec-v1817](spec-v1817.md) drew from a residue that had been
*described* in a comment while 24 of its rows came and went.

So the section was filtered for the one direction that can hurt: **the reading with the field omitted is
reassuring and the reading with it filled is not.** Four rows.

| Row | Verdict |
|---|---|
| `posas-observer-scar`, `posas-patient-scar` | false positive: *"6 = normal skin"* is the **scale's** explanation, not a verdict |
| `yellow-fever-case-def` | a case definition at the tier its entered criteria support |
| `congenital-syphilis-scenario` | correct, and worth the reading |

## The one that needed reading

`congenital-syphilis-scenario` classifies a newborn against CDC's 2021 scenarios, and the difference it
decides is not small: Scenario 1 is proven or highly probable congenital syphilis and ten days of IV
penicillin. With the darkfield/PCR answer omitted the tool reads **Scenario 2**, the lighter pathway, and
says nothing about the missing test — which is the shape [spec-v1813](spec-v1813.md) found in
`lf-mda-regimen` and [spec-v1814](spec-v1814.md) in `visceral-leishmaniasis-2026`.

It is right here, and only the field's own wording shows why. The option is labelled **"Negative or not
done"**, and CDC's Scenario 1 criterion is a **positive** darkfield or PCR. A test nobody did does not meet
it, the field says exactly that where the reader chooses, and an omitted select reads as the same answer the
page's own default gives. There is nothing the reading is hiding.

The exam beside it is `required: true` on the agent surface, so an agent cannot omit that one at all, and
both titers are refused when blank. The only field of the four Scenario 1 criteria that may be left out is
the one whose absence is already its answer.

## What this closes

The reassuring-direction filter is **spent** on this section: what is left has no signal to sort by and is a
judgement per tile. That sentence is now in the finder's header, so the next reader starts from it rather
than re-deriving it — the same reason [spec-v1816](spec-v1816.md) wrote down why 39 instruments turn on
purpose.
