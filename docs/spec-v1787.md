# spec-v1787 — Measure the toggle, do not guess it

> Status: **SHIPPED (2026-11-24)**: 34 more fields declare their range, one finder's classification is
> measured rather than guessed. No tool's arithmetic changed; the catalog stays 2,390.

`probe-undeclared-cap` has a section for the caps it must not propose: a field a **unit select rescales**
cannot take a static `min`/`max`, because the bound would be applied to whatever unit the caller chose.
[spec-v1777](spec-v1777.md) decided that by looking at the selects a tool carries and matching their names
and labels against `/unit|imperial|metric|\blbs?\b|\bkg\b|celsius|fahrenheit/`. That guess was wrong three
ways at once, and every way cost a declaration that was safe:

| Tool | What matched | What it actually is |
|---|---|---|
| `iv-iron-course` | `\bkg\b`, in the label "INFeD above 15 kg: sex" | a **sex** select |
| `mayo-adpkd` | a trigger word further along a long label | an imaging-morphology class a radiologist assigns |
| `chatelut-carboplatin` | `chc-cr-unit`, a real unit select | the unit of the **creatinine**, which rescales neither the weight nor the age |

So the question is now **asked of the tool instead of its labels**: flip the select, re-bisect the field's
edge, and a cap that does not move is not rescaled, whatever the select is called. The same sweep answers
the other question in the same pass -- a cap that moves with any other input belongs in VARIES -- so one
measurement replaces both a heuristic and a gap.

| Section | spec-v1786 | now | why it moved |
|---|---|---|---|
| UNIT-TOGGLED | 99 | **31** | 74 were held back by the label guess; the flip shows their caps do not move |
| VARIES | 81 | **135** | the enum sweep finds 54 caps that genuinely move with a select, which nothing asked before |
| DECLARABLE | 106 | 63 | the honest remainder, after both corrections |

The point of moving those 54 is **when** they are known. They were being proposed by the codemod and then
rejected by `probe-declared-cap-configs` after the fact -- 49 of 59 in spec-v1781, 75 of 893 before that.
Now the finder knows first. Writing the declarations it proposes brought the false-proposal rate from
**83% (49 of 59) down to 26% (12 of 47)**.

## The blind spot an older gate caught

The new measurement skipped any configuration in which the flipped select left the worked example
uncomputable, on the grounds that such a configuration proves nothing. For a **unit** select that is the
loudest evidence there is, and `gmi` showed why: its worked example is a mean glucose of 180 mg/dL, which is
absurd as mmol/L, so the flip was skipped and the probe never learned that the library's 40 to 600 guard is
applied to a value it has already converted. The field was declared 40 to 600 -- on an input a reader can
properly enter 8.3 into.

`probe-unit-equivalent`, which has driven every unit pair since [spec-v1771](spec-v1771.md), reported it
immediately: `"gmi-mean" must be from 40 to 600; got 8.324915918`. An inconclusive flip of a unit select now
counts **against** declaring, which is the conservative reading, and that declaration is reverted.

It is the second time this session that one finder caught another's new rule, after
[spec-v1785](spec-v1785.md)'s message change silenced `probe-envelope-inside`. A finder is a claim about
reach, and the cheapest way to check a new claim is the gates that were already there.

## What moved

| | before | after |
|---|---|---|
| Fields with a declared range | 2,135 | **2,169** |
| `probe-envelope-inside` | 28 | **22** |
| `probe-declared-cap-configs` | 0 open, 1 judged | 0 open, 1 judged, over 18,516 configurations |
| `probe-unit-equivalent` | 0 open, 5 judged | unchanged, after the one it caught was reverted |
