# spec-v1099 — the finder could not see two fifths of the catalog

[spec-v1098](spec-v1098.md) reported the finder's first section empty and the
programme done. That was true of the tiles the section can **see**.

## The blind spot

"Ruled out from a subset" is tested as `abnormal` going `false` to `true`.
**698 of the 1,682 tiles with a worked example — 41.5% — never set a boolean
`abnormal` at all.** For those the test can never fire, whatever they do.

So `smart-cop` moving from *"SMART-COP 1: low risk"* to *"SMART-COP 3: moderate
risk"* sat in the weaker second section, demoted for lacking a flag rather than
for having a weaker defect. Nothing said so, and "the first section is empty" was
read as "there is nothing left".

This is the failure [spec-v1092](spec-v1092.md) wrote down — *a finder's silence
is evidence about the finder until you have watched it speak* — and then walked
into anyway, in the same file, three waves later.

## The fix, and the number that goes with it

A third section: **no severity flag, and the verdict moved**. For a tile with no
`abnormal` on either side, a change of verdict category is the only signal there
is, so it carries the weight the flip carries elsewhere.

The report now ends with its own reach:

> Reach: 984 tiles set a boolean `abnormal` and 698 do not.

**A finder's reach is part of its result.** Printing the denominator is what
would have stopped spec-v1098 from over-claiming.

The new section reads **14 fields across 7 calculators**.

## What it found: one defect in seven tiles

`dka-hhs` classified **HHS from ketones nobody measured**. Minimal ketosis is one
of the HHS criteria, and the branch asserted it:

> Hyperosmolar hyperglycemic state (HHS): marked hyperglycemia and
> hyperosmolality **with minimal ketosis** and a pH above the DKA range.

The tile already refuses for exactly this reason on its other exit — *"Enter
beta-hydroxybutyrate (or a urine ketone grade) to confirm the ketosis
criterion"* — so **one tile guarded one of its two paths**, the same half-fixed
shape [spec-v1093](spec-v1093.md) found in `scorad`. And it matters more here
than as a wording slip: the alternative to HHS on the same numbers is a **mixed
DKA/HHS picture**, which the tile names in the branch above and which is managed
differently. Ketones are what separate them.

## The other six are correct, and why

| Tile | Why it is flagged | Why it is right |
|---|---|---|
| `smart-cop` | dropping PaO2 changes the band | already guarded by [spec-v1020](spec-v1020.md); its "any one of PaO2, SpO2 or P/F serves" is the instrument's rule, and the probe reaches it only with an implausible **PaO2 of 0** |
| `mayo-uc` | partial vs full score | it says "**Partial** Mayo score 6 (0-9)" and re-bands accordingly |
| `iol-power` | no target refraction | it says "**Emmetropic** IOL power", naming the assumption |
| `tls-cairo-bishop` | no creatinine | it says "no end-organ (clinical) criterion entered" |
| `pk-suite` | missing Vd/CL/Cp | dependent lines simply stop being printed |
| `toxic-alcohol` | omitting glucose indicates fomepizole | omission over-calls treatment, the safe direction |

## A limit of the candidate generator, recorded

Candidates are scaled from the example's own value **and always include 0**. A
PaO2 of 0 is not a patient, and `smart-cop`'s guards do not reject it. Rows
turning on a zero deserve a look at the tile before a fix — the same discipline
this programme has needed all along, and the reason `smart-cop` was read rather
than patched.
