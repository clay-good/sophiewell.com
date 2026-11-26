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

## Three spec statuses that had gone stale

While the section was being sorted, the seven specs marked **DEFERRED** or **PARTIALLY SHIPPED** on
*sourcing* grounds were checked against the catalog, because a spec that parks a tile is only as true as
that tile's absence. Three had gone stale:

| Spec | Said | Is |
|---|---|---|
| [spec-v170](spec-v170.md) | KDPI and EPTS parked, OPTN returned 403 | `kdri-kdpi` shipped in [spec-v1717](spec-v1717.md); EPTS still parked |
| [spec-v264](spec-v264.md) | KDRI, KDPI and EPTS not reproducible | the same: two of three shipped |
| [spec-v266](spec-v266.md) | Leibovich and UISS parked | both shipped the next day in [spec-v279](spec-v279.md) |

Each now says where the work landed, above its original deferral, which stays as the record of why it
waited. The gates held in both cases: the KDPI was built from a verbatim OPTN table once the guides became
fetchable, not approximated.

The other four are accurate. `gwtg-hf`, `ehmrg` and `precise-dapt` are still only in paywalled papers;
Fenton's LMS tables are still Springer supplementary objects behind a 403; McLaughlin and the PWH massive-
transfusion score are still not reproducible from open sources; and EPTS still needs
`epts_mapping_table.pdf`.

**And nothing was reading those statuses**, which is why three could drift. `test/unit/parked-tiles-still-
absent.test.js` holds the eight parked ids with the spec and the reason each was parked, and fails when one
appears in the catalog — the STALE-LEDGER shape, applied to prose. It is the other half of the rule in
[spec-v1049](spec-v1049.md): a doc citing a **check** is only as true as the check's existence, and a doc
citing a **parked tile** is only as true as the tile's absence.

## What this closes

The reassuring-direction filter is **spent** on this section: what is left has no signal to sort by and is a
judgement per tile. That sentence is now in the finder's header, so the next reader starts from it rather
than re-deriving it — the same reason [spec-v1816](spec-v1816.md) wrote down why 39 instruments turn on
purpose.
