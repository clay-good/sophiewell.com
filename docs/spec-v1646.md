# spec-v1646: A field that states its range enforces it

> Status: **SHIPPED (2026-10-19).**

## What was wrong

An agent reads a field's label, and hundreds of number fields say their range: "Activity (0-2)",
"Nausea / vomiting (0-7)". Nothing on the agent surface held a value to it. Starting from each tool's
own worked example and setting one field one past either end, 22 tools gave an answer:

| What the lib did | Example |
|---|---|
| Clamped silently | Aldrete activity 3 scored as 2; Pediatric GCS eye 5 scored as 4 and moved the band to "mild" |
| Summed it | CIWA nausea 8 counted 8 |
| Dropped it | Roland-Morris 25 scored **0**; Phoenix GCS 16 was read as missing |

The browser was not affected: its controls offer only the range.

## What it does

- `mcp/fields.js`: a number field may declare `min` and `max`. `validateInputs` refuses a value past
  either with the existing `OUT_OF_RANGE` code (spec-v637) and the field name; `fieldSchema` publishes
  them as JSON Schema `minimum` / `maximum`.
- 472 fields across 155 agent tools (counted from the live catalog) now declare the range their label states (written by a script from the
  label, then checked by the test below).
- E/M MDM (`em-mdm`, `em-mdm-2023`): the labels said "(1 to 4)" but the options are levels 2 to 5. The
  label was wrong, not the field; it now reads "(2 to 5: straightforward, low, moderate, high)".

Two tools are left to their own lib checks, each with a reason in the test: `mtm-eligibility-check`
(a 4 is answered "plan settings not permitted") and `label-titration-calendar` (preset-specific
fields, each refused by the lib in the label's own words).

## Proof

`test/mcp/labeled-ranges.test.js`:
- every number field whose label states a range declares exactly that range, or has options inside it;
- five of the original offenders now return `OUT_OF_RANGE` naming the field, and their examples still compute;
- the range reaches the input schema (`ciwa` nausea: minimum 0, maximum 7).
