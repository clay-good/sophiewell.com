# spec-v1092 — a finder that is not bounded by the worked example

[spec-v1091](spec-v1091.md) was found by hand, and it should not have been. The
probe that exists for exactly that question — `scripts/probe-omitted-item.mjs` —
had looked at both tiles and reported nothing.

## Why the old probe could not see it

It fills a tile from its **worked example**, drops one field, and asks whether
the answer moved. Worked examples are written alarming, because an example that
demonstrates nothing is not worth printing. So dropping a field usually leaves an
alarming reading standing — and an alarming reading from fewer inputs is the
**floor**, which is the safe direction.

The defect lives on the reassuring side of the threshold. The example never goes
there, so the probe never asks about it.

## The question that is not bounded

`scripts/probe-omitted-field-decides.mjs` asks a different one: **drop a field,
then try plausible values in it, and see whether any of them would have changed
the verdict.** Candidates are scaled from the example's own value, so each tile's
range guards throw out the implausible ones.

That alone was not enough, and finding out cost a negative test. The first
version still reported **zero on `mitral-stenosis-stage` with the spec-v1091
footing deliberately removed** — it had inherited the very blindness it was
written to fix, because that tile's example is severe on *both* measurements. So
the probe now scales the **remaining** fields first, in both directions, to reach
a reading that is not already alarming, and only then asks whether the dropped
field could flip it.

Negative-tested both ways: two hits with the footing removed, silent once
restored. **A finder that has never been watched to fail is not a finder yet.**

It reports in two sections. *Ruled out from a subset* — the omitted reading is
`abnormal: false` and some value of the missing field makes it `true` — is the
spec-v1091 shape and the one that can hurt. *Verdict could change* is weaker.
The comparison strips digits, because `band` embeds the score and without that
"SCORAD 37 — moderate" counted as a different verdict from "SCORAD 38 —
moderate": one point of arithmetic reported as a changed conclusion.

Over 1,682 tiles and 3,274 numeric fields it reads **47 fields across 19
calculators** in the first section.

## The first thing it found: PASI and EASI

Both score four body regions and sum non-negative terms, so a partial
examination can only **under**-state severity. `areaGrade` returns 0 for an
absent area, and `detail` lists only regions scoring above 0 — so a region nobody
examined and a region examined and clear print identically, as nothing at all.

Dropping one region's area took PASI from **10.2, moderate** to **7.8, mild**.
Mild is the side of the line where systemic therapy is not discussed.

Each now carries a footing: *"Scored from 3 of 4 regions; head/neck was not
entered. An unscored region contributes 0, exactly as a clear one does, so this
total is a floor and can only rise."* No score changes.

The footing is keyed on the **area** field alone. The severity selects open on
"0 — none" and are never blank in the browser, so keying on them would have made
the footing fire for agents and never for readers — the cross-surface split this
programme keeps finding. The area is a real number input that can be empty, and
it multiplies the whole region term.

`headArea: 0` stays silent. Examined and clear is a finding; never examined is
not.

## A correction to spec-v1088

That wave grouped `pasi`, `easi`, `vasi`, `lund-browder`, `scorad` and `mswat`
under "a region with no disease in it" and judged them **"likely correct as they
stand"**, on the reasoning that 0% involved is a real finding and each tile
prints the regions it summed.

Printing the regions that scored is not the same as saying the total is a floor,
and the judgment was made from the probe's output rather than from the tiles. The
remaining four are the obvious next wave: `vasi`, `mswat` and `scorad` are fixed in
[spec-v1093](spec-v1093.md), where `lund-browder` is deliberately left alone.
