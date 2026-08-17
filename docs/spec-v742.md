# spec-v742.md — A worked example on every tool page

> Status: **SHIPPED (2026-08-17).** Presentation only. No tile added, no number changed, no
> catalog surface moved. Catalog stays **1564**.

## Why

`/tools/<id>/` told the reader what the tool would give them — "What you get: POSEIDON group 1b."
— without telling them a single value that produced it. A grade with no inputs behind it is not an
example; it is an assertion. The page listed the field names separately, so the reader had to hold
two lists in their head and guess which value went where.

The tool itself has always opened pre-filled with a worked example. The page that ranks in search,
and that a reader sees first, did not show it.

## What it does

States the example as values, above everything else on the page.

```
Example
Patient age                     32 years
Anti-Mullerian hormone          2.0 ng/mL
Prior conventional-stim cycle   Yes
Oocytes retrieved               6 oocytes

Result: POSEIDON group 1b.
The tool opens with these values already filled in. Replace them with your own.
```

The reader now sees the shape of every value — the unit, the precision, whether it is a number or a
yes — before they open the tool. That is what makes the pre-filled fields usable: they know what to
overwrite each one with.

| | |
|---|---|
| **Source** | `META.example.fields` is keyed by DOM id; the MCP field registry carries the same DOM id with a human label and a unit. The two join. |
| **Reach** | 1,538 of 1,564 pages. The other 26 have no MCP adapter to name the fields, and keep the old "What you get" line. |
| **Refusal** | If any example key has no matching field, the whole block is dropped rather than printed half-populated. |
| **Blank values** | Seven tiles leave a select on its blank default. Those rows are omitted, not printed as an empty cell. |
| **Booleans** | Stored as `1` / `true` / `yes` depending on the tile. All print as **Yes** / **No** — "Heart rate > 100: 1" stated a count, not a checked box. |
| **Cap** | 10 rows, then "and N more fields". |

## Two things it fixed on the way

**The field list stopped running on.** `splitLead` refused any lead under 20 characters, so
`Patient age. The classification splits at 35: under 35 gives groups 1 and 3, 35 or over gives
groups 2 and 4.` printed whole — the run-on spec-v741 set out to remove. A field label is not a
paragraph: "Patient age." *is* the label and everything after it is qualification. `splitLead` now
takes a `minLead` option and the page builder passes 10. The full text is still one click away
under **Full field descriptions**.

**The heading stopped over-promising.** With the result moved into the example, most pages had only
the input list left under a heading reading "Inputs and output". It now reads **What you enter**,
and only says "Inputs and output" on the 26 pages that still state an output there.

## Where it lives

- `scripts/build-tool-pages.mjs` — `exampleRows()`, `shortLabel()`, `exampleValue()`, the section.
- `lib/long-note.js` — `splitLead(text, { minLead })`.
- `styles.css` — `.tp-ex-dl`, `.tp-ex-row`, `.tp-ex-result`. Label above value at narrow widths, so
  a long unit never pushes the page sideways.

## Proof

- `test/unit/tool-page-example.test.js` — the join is the thing that breaks silently, so it is
  gated: every example key resolves to a field, at least 1,538 tiles join cleanly, and every joined
  field has a label to print. A DOM-id rename on either side now fails the build instead of quietly
  deleting the example from 1,500 pages.
- `test/unit/long-note.test.js` — the `minLead` floor: the default refuses a two-word lead, the
  field-label floor takes it.
- `test/integration/static-pages-mobile.spec.js` — all 1,564 pre-rendered pages at 320px, no
  horizontal scroll. Green on chromium.
