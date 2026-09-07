# spec-v1111 — four more, and a correction

Four more off the [spec-v1108](spec-v1108.md) ledger, all the same shape as
[spec-v1109](spec-v1109.md)'s: a fallback whose value is the instrument's most
favourable finding.

**Correction first.** [spec-v1110](spec-v1110.md) says *"Five remain"* and then
lists six. The ledger had six. Nothing depended on the number, but a count
stated next to the list it contradicts is exactly what
`check-catalog-truth` exists to stop elsewhere, and it was written by hand in a
place no gate looks.

## The four

| Tile | The fallback | What it answered for an empty call |
|---|---|---|
| `ses-cd` | `sumArr` clamps an absent cell to 0 | *SES-CD 0/56: endoscopic **remission*** |
| `gvhd-grade` | `?? 0` on each organ stage | *No acute GVHD (all organ stages 0)* |
| `peritoneal-cancer-index` | `continue // defaults to LS-0` | *PCI 0 of 39*, thirteen regions |
| `arvc-tfc` | an absent category reads `'none'` | *0 points (0 major, 0 minor) — **criteria not met*** |

Each of those readings is a decision. Endoscopic remission is what Crohn's
therapy is stopped on. *No acute GVHD* ends steroids. The PCI is the number a
cytoreduction is offered or refused on. *Criteria not met* closes a
cardiomyopathy workup and releases an athlete.

All four are non-negative combinations, so what has been entered is a **floor**,
and each takes the same treatment: the alarming reading rules in from a subset
(rule 13) and the rest wait, naming what is missing.

## `gvhd-grade` needed rule 11 as well as rule 13

Its alarming branch prints the three organ stages under the grade:

> Acute GVHD grade IV (modified Glucksberg) from skin stage 4, **liver stage 0,
> GI stage 0**.

Grade IV rules in and needs no footing — but the line beneath it still stated two
assessments nobody had made. **Rule 13 exempts the verdict from a footing; it
does not license the detail to invent findings.** It now reads *"liver not
staged, GI not staged"* while the grade is unchanged.

That distinction is worth keeping: rules 13 and 11 answer different questions,
and a tile can satisfy one while breaking the other in the same sentence.

## Another incomplete worked example

`peritoneal-cancer-index`'s example entered **3 of its 13 regions** and
documented *PCI 6 of 39* — a number that held only because ten regions were
being read as explored and clear. `example-correctness` caught it, as it caught
`ces-d`'s in [spec-v1108](spec-v1108.md). Completed to all thirteen, it produces
the same 6.

Two waves, two examples that demonstrated the defect rather than the
instrument. That gate is doing more work in this programme than its name
suggests: **an example written against a buggy default is a specification of the
bug**, and completing it is how the bug becomes visible.

## What is left, and why it is left

Two ledger lines: `hfa-peff` and `mdq`. They are last because they are the two
that are **not** this shape — not because they are the hardest, but because
sorting by shape put every lookup-fallback tile first. Reading them will need
the instrument, not the pattern.
