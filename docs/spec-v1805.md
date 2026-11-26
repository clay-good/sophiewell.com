# spec-v1805 — Four house phrasings the vocabulary did not know

> Status: **SHIPPED (2026-11-26)**: `test/lib/asking-language.js` learns five phrasings, measured one at a
> time as its own rules require, and **38 correct readings** stop being flagged across its seven consumers.
> Two more finders become gates at zero, taking the suite to **21**. No tool's arithmetic changed; the
> catalog stays 2,390.

`test/lib/asking-language.js` is the list of words a calculator uses when it is **asking** rather than
answering. Two whole-catalog sweeps and five finders read it, and its own header says what a gap in it
costs:

> A phrase missing from one sweep makes that sweep flag a tile that is refusing correctly, and the way a
> flagged tile gets quiet is a LEDGER LINE. ... A tile exempted for nothing is a tile the gate is not
> protecting.

Walking `probe-half-guarded`'s rows — tiles that guard one missing input and stay silent on another — turned
up four readings that plainly disclose and were being flagged anyway:

| Tool | What it says when a field is dropped | The list knew |
|---|---|---|
| `hear`, `scorad`, `fabq` | *"HEAR score **at least** 3"*, *"SCORAD at least 35/103"*, *"FABQ — physical activity at least 12 of 24 **over 3 of its 4 items**"* | `can only add`, `can only raise`, `scored from` — the same idea, other words |
| `ca-np-103-104-tracker` | *"Transition to practice complete; **still to confirm**: passed the national NP board certification examination"* | nothing |
| `mcpherson-pji` | *"a late chronic infection; **answer the remaining** factors to fix the grades"* | nothing |
| `brazil-scorpion-antivenom`, `brazil-spider-antivenom`, `chikungunya-case-def`, `zika-case-def` | *"Not decided: the systemic signs were **not fully assessed**"* | nothing |
| `arpraziquantel-dose` | *"Contraindications **not all entered**: rule out cysticercosis first"* | `not entered`, which this is not |

## The one that needed care

`at least <number>` is the interesting one, and it is why the file's first rule exists. **Bare, it moves 30
rows and five of them are a criterion quoted rather than a floor disclosed:**

* `migraine-ichd3` — *"for 1.1: **at least 2 of the 4** headache characteristics"*
* `blood-4h-window` — *"It needs **at least** 5 h"*
* `arpraziquantel-dose` ×3 — *"Disperse in **at least 10 mL** of water"*, standing dosing prose

Exempting those five would be exactly the failure the header warns about: a tile stops being flagged for
saying words it did not mean about the gap in question.

The distinction is **positional**. A floor is stated with the total it is a floor *for*, at the start of the
reading; a criterion is quoted further in. Measured at several widths, **forty characters** moves exactly
the 22 floor disclosures (`hear` 3, `scorad` 8, `fabq` 11) and none of the five. That anchor is now in the
list, with the measurement written beside it.

`test/unit/asking-language-movement.test.js` holds all of it, including the honest limit: the anchor is
positional, so `arpraziquantel-dose`'s dosing sentence **would** match if it were the start of a reading.
In place it is not, and the tool is exempt on *"not all entered"* — the phrase that is actually about the
gap. The guarantee the measurement gives is over the whole catalog, not over a sentence lifted out of one,
and the test says so rather than implying more.

## What it buys

| Finder | Was | Now |
|---|---|---|
| `probe-half-guarded` | 20 calculators | **14** |
| `probe-omitted-item` | 166 fields / 92 calculators | **150 / 85** |
| `probe-static-exemption` | 0 | 0, and **gated** |
| `probe-refusal-unrendered` | 0 | 0, and **gated** |

No ledger line anywhere became stale, which is the good case: these 38 rows were being flagged in reports
rather than exempted in a sweep, so nothing had been paid for them yet. The cost was noise — and noise in a
prioritiser is what hides the next real row. That is the same argument [spec-v1803](spec-v1803.md) made for
giving three suspect-lists a ledger; this is the other half of it, where the finder was right to ask and the
*vocabulary* was what had not caught up.
