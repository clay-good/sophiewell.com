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

## Follow-up the same day: en-dash labels

The first pattern read "(0-2)" and "(0 to 2)" but not "(0–100)" with an en dash, so 79 fields were outside
it. Seven of them took a value past the label: PASI and EASI area 101%, DAS28 patient global 101, SCORAD
pruritus 11, Tinetti balance 17, the infant weight estimate at 13 months, and BATT with a GCS of 2. The
pattern now reads en and em dashes, and the catalog declares 551 ranges across 182 tools.

The browser was checked too: 88 of these fields are typed number boxes whose lib accepts the value, and 87
already carry the same `min`/`max` attributes. A value past them already raises the page's range warning
("Check the highlighted value ... outside the 0 to 100 this field accepts", spec-v1009), which keeps the
answer on screen by design; that decision is left as it is.
