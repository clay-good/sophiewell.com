# spec-v1835 — The weak half holds

> Status: **SHIPPED (2026-11-26)**: the 120 fields left in the "entered, and asked for again" report were
> driven against the ranges their own refusals state, and every one enforces what it says. No code changed,
> and that is the result. The catalog stays 2,390.

## The question spec-v1830 left behind

[spec-v1831](spec-v1831.md) gated the **strong** half of this report at zero — a refusal that names no range
at all — and left the **weak** half as a reading list: 120 fields whose refusal *does* state its range and
happens to share that sentence with the blank case. The argument was that a reader who types 999999 and is
told *"from 1 to 365"* has been told what is wrong.

[spec-v1830](spec-v1830.md) then found three tools that **say** "from 1 to 365" and **accept 0.95**. If the
sentence can be wrong about the range three times, the reading-list argument rests on the sentence being
true, and nobody had checked.

So each of the 120 was driven against its own words: parse the range out of the refusal, enter a value just
outside it, see whether it is refused.

## It holds

Four rows came back, and all four are the **extractor** reading the wrong numbers out of the sentence:

| Row | What my regex read | What it is |
|---|---|---|
| `glycemia-risk-index` | "from 54 to 69 mg/dL" | the field's **name** — the glucose band it measures |
| `ddi-static-aucr` | "between 0.0001 and 10,000" | a statement about the **output** ratio |
| `vanc-initial-dose` | "(guideline 400 to 600)" | the **guideline target**; the field accepts wider on purpose |
| `vanc-continuous-infusion` | "(guideline 15 to 20)" | the same, with its own rule stated next |

That is the mistake [spec-v1823](spec-v1823.md) had to add `NOT_THE_TOTAL` for, in another costume:
**numbers inside a label are not the field's range**, any more than the word "cholesterol" inside "HDL
cholesterol" is the total.

So the three tools spec-v1830 fixed were the exceptions rather than the first of a hundred, and the
decision to gate only the strong half stands — now on a measurement instead of an argument. The finder's
header carries the check and its four false positives, so nobody drives it a second time.
