# spec-v600 — Fisher grade (original, subarachnoid hemorrhage CT)

## What this gives you

The original Fisher grade — and the reason its numbers do not order the risk it was built to predict.

## Why it exists

A **predecessor gap**: `modified-fisher` is in the catalog and the scale it modified was not. Every slug
spelling and filename search returned 0.

## The grades

| Grade | CT appearance |
|---|---|
| 1 | No subarachnoid blood detected |
| 2 | Diffuse or vertical layer < 1 mm thick |
| 3 | Localized clot, or vertical layer ≥ 1 mm | 
| 4 | Intracerebral or intraventricular blood, with diffuse or **no** subarachnoid blood |

## The grades are not ordinal for vasospasm risk

Risk rises from grade 1 to grade 3 — then **grade 4 does not continue the trend**. **Grade 3 carries the
highest vasospasm risk.** A higher Fisher grade does not mean higher risk.

**Why:** grade 4 is defined by **location, not amount**. It is different blood in a different compartment, so
the scale changes what it measures between 3 and 4:

| Finding | Grade | Highest risk? |
|---|---|---|
| Speck of intraventricular blood, **no** SAH | **4** | no |
| Thick cisternal subarachnoid clot | **3** | **yes** |

**The same grade 4 covers a speck and a ventricle full of clot** — the documented flaw that motivated the
modified scale.

## The modified scale is not a renumbering

It adds a **grade 0** and splits blood thickness from intraventricular hemorrhage into two independent axes.
**A Fisher 3 is not a modified Fisher 3.** No conversion is offered, and a test asserts none is exposed.

## A dated threshold

The 1 mm cut was measured on **1980-era CT**. Slice thickness, resolution and windowing have changed beyond
recognition, so a 1 mm layer on a modern scanner is not the same observation. Applied as published, with the
caveat stated.

## Scope (spec-v11 §5.3)

Grades the **appearance of blood on a scan** in an established diagnosis. It does not diagnose subarachnoid
hemorrhage, does not grade **clinical** severity — Hunt and Hess and WFNS do that, both in this catalog — and
does not localize or identify an aneurysm. It does not indicate nimodipine, transcranial Doppler
surveillance or angiography, and **a low grade is not a reason to relax vasospasm monitoring**.

## Source

- Fisher CM, Kistler JP, Davis JM. *Neurosurgery.* 1980;6(1):1-9.

## Files

`lib/fisher-grade-v600.js`, `views/group-v600.js`, `mcp/adapters/fisher-grade-v600.js` (wave 425),
`test/unit/fisher-grade.test.js`. Catalog 1449 → 1450; MCP 1386 → 1387.
