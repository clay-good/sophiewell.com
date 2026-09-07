# spec-v1101 — a finder for "one tile, two gaps, one guarded"

Three times in this programme a calculator had already been fixed for a missing
input and left silent on the identical gap beside it:

| Tile | Guarded | Left silent |
|---|---|---|
| `scorad` ([v1093](spec-v1093.md)) | the extent, since [v1016](spec-v1016.md) | a blank itch score, read as a symptom the patient denied |
| `dka-hhs` ([v1099](spec-v1099.md)) | one exit, for want of a ketone measurement | the other, asserting "with minimal ketosis" |
| `abi` ([v1100](spec-v1100.md)) | a missing **ankle** pressure, since [v1067](spec-v1067.md) | one of two **brachial** pressures, in the same divisor |

Each time the reasoning was already written out in the code, for the half that
was guarded. Nobody walked the other half. Three occurrences is a pattern, and
this one is cheap to detect.

## The signal

Inside **one** tile, drop each field in turn. If dropping some fields makes the
tile refuse, ask or disclose, then the author already agreed this class of gap
matters *here* — so the fields that stay silent while the answer moves are the
ones they did not get to.

`scripts/probe-half-guarded.mjs` prints that asymmetry. It is a **prioritiser,
not a new defect list**: every row also appears in
`probe-omitted-field-decides.mjs`. What it adds is the evidence that the tile
itself already agrees the question is worth asking, which is a much stronger
reason to look than "a verdict moved".

It reads **8 calculators**.

## What it found

`hf-ef-classification` carries a caveat for exactly this — *"With no baseline
measurement this is HFmrEF. The same 45 percent in a patient whose baseline was
30 would be HFimpEF"* — and fired it **for HFmrEF only**.

HFimpEF requires the current measurement merely to be **above 40**, which is the
whole preserved range as well. So a baseline of 30 rising to 55 is HFimpEF, and
with the baseline left out the tile called it **HFpEF** and said nothing.

The file's own header says a tool classifying from one ejection fraction *"will
silently call these patients HFmrEF."* It silently called them HFpEF too. The
note is now worded from `category` and the published constants rather than
naming a band, so a later band cannot fall out of it the way this one did.

HFrEF stays silent, correctly: a current measurement at or below 40 cannot be
HFimpEF whatever the baseline.

## The other seven are correct

| Tile | Silent field | Why that is right |
|---|---|---|
| `mayo-uc` | endoscopy subscore | it re-labels to "**Partial** Mayo score (0-9)" and re-bands |
| `ipss` | quality-of-life item | reported separately and not part of the total, by the instrument's design |
| `posas-observer-scar`, `posas-patient-scar` | overall opinion | the field's own label says "not in total" |
| `adrenal-ct-washout` | unenhanced HU | it switches to **relative** washout and says which formula it used |
| `nen-who-grade` | mitotic count | at G3 nothing can raise the grade, and it says "graded on the Ki-67 index alone" |
| `ph-hemodynamics-2022` | wedge pressure | it answers "not classifiable without the wedge pressure" |

Six of seven were left alone after reading the tile. That ratio is the point: a
prioritiser earns its place by making the *first* row worth opening, not by being
right about all of them.
