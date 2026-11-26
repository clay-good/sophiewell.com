# spec-v1834 — Every section of the report, accounted for

> Status: **SHIPPED (2026-11-26)**: the fourth and last section of `probe-omitted-field-decides` is read,
> and it turns out to be a question already answered two specs ago. No code changed. The catalog stays
> 2,390.

## The last unread section

This report has four sections, and three had been dealt with: sections 1 and 2 are gated at zero behind
judged ledgers ([spec-v1813](spec-v1813.md)), and section 3 was filtered for the direction that can hurt
and came back clean ([spec-v1824](spec-v1824.md)). Section 4 — five rows — had never been read.

It is the **blank-as-zero** question wearing another hat. [spec-v1142](spec-v1142.md) added it for the 154
tiles that carry neither a boolean flag nor a band string, where *the number is the conclusion*, so a row
here is a computed figure moving when a field is dropped. All five rows are a field whose **blank reads as
an entered 0**, and four of them are already judged, with their reasons, in
`probe-blank-as-zero` ([spec-v1832](spec-v1832.md)):

- `insulin-correction`'s carbohydrate, whose label reads *"omit for a correction-only dose"* — the blank
  **is** the correction-only case;
- `anesthesia-units`' modifying units, a count where none is a real answer;
- the pounds and the ounces of `peds-weight-conv`, where a blank pounds beside an entered ounces is zero
  pounds, which is the conversion being asked for.

The fifth, `lab-interpret`'s A1C, is [spec-v1196](spec-v1196.md)'s shape: the `count` it moves is *how many
labs were interpreted*, so dropping one interprets one fewer. A reading that lost a clause has fabricated
nothing.

## Why this is worth a spec at all

Because the alternative is the state spec-v1817 measured: a section nobody has read, in a report that
prints every run, where a new row would arrive among known ones and look like the rest. Four sections, four
dispositions, all written in the finder's own header:

| Section | State |
|---|---|
| 1 — ruled out from a subset | gated at zero, 15 judged |
| 2 — no severity flag, verdict moved | gated at zero, 19 judged |
| 3 — verdict could change | 108 rows; dangerous-direction filter applied and spent |
| 4 — the number is the verdict | 5 rows, all explained here |

The next reader starts from that table rather than from 236 rows.
