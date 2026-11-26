# spec-v1810 — The range the agent surface already declared

> Status: **SHIPPED (2026-11-26)**: 14 more fields stop answering a value the reader entered with "Enter
> it", taking the strong category from **35 to 21**. Every one of them was already stated on the agent
> surface and not enforced in the library. 9 files, 9 lines. No tool's arithmetic changed; the catalog stays
> 2,390.

The four waves before this one gave each flagged field a **floor** — because the shape they were chasing
was a negative value read as blank. A value past the **ceiling** reads as blank too, and the finder drives
both: it reports `999999` as often as `-999999`.

Rather than invent a ceiling per field, this wave asks what is already written down. `mcp/fields.js`
publishes a range for 2,678 of the catalog's number fields, and 17 of the flagged fields are among them:

| Tool | Field | Declared on the agent surface | Enforced in the library |
|---|---|---|---|
| `esspri` | dryness, fatigue, pain | 0 to 10 | — |
| `dmft-caries` | decayed, missing, filled | 0 to 32 | — |
| `rapid3` | MDHAQ sum, pain VAS, global VAS | 0 to 30, 0 to 10, 0 to 10 | — |
| `gcs-pupils` | GCS total | 3 to 15 | — |
| `damico-prostate-risk` | Gleason score | 2 to 10 | — |
| `fagan-post-test` | pre-test probability | 0 to 100 | — |
| `peds-weight-est`, `peds-vitals` | age | 0 to 14, 0 to 18 | — |
| `dhi`, `plaque-control-record` | item counts | per field | — |

An **agent** could never send 999999 to any of them: `validateInputs` refuses a value past a declared
literal before the library runs. The **page** calls the library directly, which is the divergence
[spec-v1743](spec-v1743.md) exists to stop — so the reader typing 999999 got "Enter the dryness, fatigue,
and pain scores (each 0-10)" while an agent got a range. Both surfaces now refuse the same values.

The change is nine lines, because nine of the ten tools already had a generated floor check from the earlier
waves and the edges simply moved from `0, Infinity` to the declared pair. `rapid3` is the tenth and the one
miss: its refusal is built from a template, so there is no sentence in the source to place against — the
same reason [spec-v1809](spec-v1809.md) could not reach it.

## Why this is the right source for the number

A ceiling invented here would be a third opinion about a quantity the catalog has already settled twice —
once in the adapter's declaration and once in `probe-declared-cap-configs`, which drives every declared
bound in 22,882 configurations and has held them honest since
[spec-v1780](spec-v1780.md). Taking the declared pair means there is **one** range per field, the gates
already police it, and a later widening moves both surfaces together.

The 18 flagged fields that declare only one edge, or none, are left: a ceiling for a basophil percentage, a
spleen size in centimetres below the costal margin, or an exacerbation count is a clinical judgment with a
source behind it, and [spec-v1206](spec-v1206.md) settled that such a choice belongs with its source rather
than with a wave.
