# spec-v1624 — Build: records to calculators

**Status:** Build spec, September 29, 2026. Implements [spec-v1613](spec-v1613.md).
**Plan:** [spec-v1620](spec-v1620.md), milestone M5. **Depends on:** M3
([spec-v1623](spec-v1623.md)) for recognition and the drop surface.

## Files

| File | New or changed | Holds |
|---|---|---|
| `data/concepts/concepts.json` + `manifest.json` | new | the concept map ([spec-v1613](spec-v1613.md) §2): `{ id, label, codes: [{ system: 'LOINC', code }], unit, acceptUnits: [...], recencyDays }`; `coverage: 'subset'`, curated |
| `lib/record-ccda.js` | new | C-CDA → `Observation[]` (`{ concept?, code, system, value, unit, at }`) plus `{ birthDate, sex }`; reads only `section/entry/organizer/component/observation` and `observation` under the results (`2.16.840.1.113883.10.20.22.2.3.1`) and vital signs (`2.16.840.1.113883.10.20.22.2.4.1`) section template ids |
| `lib/record-fhir.js` | new | FHIR Bundle, NDJSON or single resources → the same shape; `Observation` with `valueQuantity` and LOINC; `Patient.birthDate`, `Patient.gender`; components of a blood-pressure panel (LOINC 85354-9) read as systolic and diastolic |
| `lib/record-apple.js` | new | streaming reader for Apple Health `export.xml` `Record` elements (a SAX-style tokenizer over the decompressed stream, never a whole-file DOM, since the file is often hundreds of MB); the HealthKit identifiers mapped are in the concept map; clinical records inside the export go through `record-fhir.js` |
| `lib/record-pick.js` | new | pure: observations + concept map + `now` → the chosen value per concept by the [spec-v1613](spec-v1613.md) §3 rules, with reasons for every value not chosen |
| `lib/record-plan.js` | new | pure: chosen values + field index → `{ ready: [...], oneShort: [...], found: [...] }` per tool, by reading each field's concept tag |
| `views/record-panel.js` | new | the "Your record can fill these tools" panel |
| `mcp/adapters/*.js` | changed | an optional `concept` on each numeric field the first release tags ([spec-v1613](spec-v1613.md) §2 list) |
| `scripts/build-field-index.mjs` | changed | emits the concept as `c` in `data/fields/` |
| `app.js` | changed | the file-derived fill path and the hash suspension (§Step 4) |

## Steps

### Step 1 — Concept map and tags

Write `data/concepts/`, with a builder entry in `scripts/build-data.mjs` (curated, so it
writes `coverage: 'subset'` and `curatedAt`). Tag the fields of the 21 tools in
[spec-v1613](spec-v1613.md) §2. A field is tagged only when it's a number in the concept's
unit family; enum age bands (such as `ageLt60`) and yes/no fields are never tagged.

A unit test asserts each tagged field's `unit` converts from the concept's canonical unit
with `convertUnit` in `lib/query-fill.js`, so no tag can point at a field the value can't
reach.

### Step 2 — The three readers and the picker

Pure modules with unit tests on synthetic fixtures built from the HL7 C-CDA and US Core
examples (no real patient data). `record-pick` handles: most recent wins; tie with
disagreement fills neither; past `recencyDays` fills with a note; past 5 years never
fills; unlisted unit never fills.

### Step 3 — The plan and the panel

`record-plan` groups tools into ready, one short and found values. `views/record-panel.js`
renders them, computing each ready tool's answer by calling the tool's compute through the
same MCP adapter `compute_calculator` uses (`mcp/tools.js` `dispatch`), which is already
pure and shared with the browser. Each answer shows its inputs with dates, in the one-box
verification line style.

The panel is the result of dropping a kind in the `ccda-*`, `fhir-clinical`,
`fhir-resource` or `apple-health-*` families ([spec-v1623](spec-v1623.md) registry rows
change from planned to live in this step).

### Step 4 — Opening a tool from the panel, without the URL

Reuse the one-box path: set `autofilledKeys` for the tile with the record's values in
canonical units, which `resetUnitsToCanonical` already handles. Add one flag,
`fileDerived`, on that object. When it's set:

- `trackHashState(body)` is not called for that view;
- the copy-link control shows *"Links aren't made from file values."*;
- each filled input gets a `data-from-file` attribute and a small "from your file,
  [date]" note under it;
- the flag stays on for the life of the view, even after hand edits.

### Step 5 — Link to preventive services

When `preventive-owed` ([spec-v1601](spec-v1601.md)) is live, the panel adds its link with
age and sex. Until then, nothing.

## Tests

- Every [spec-v1613](spec-v1613.md) test, plus: the panel's computed answers equal the
  answers from typing the same values into each tool (a loop over the ready tools).
- Privacy e2e: after opening `prevent` from a record, `location.hash` is the bare route,
  `history.length` did not grow by more than the route change, and no `localStorage`,
  `sessionStorage` or IndexedDB key was written.
- A 300 MB synthetic `export.xml` (generated at test time) is read in the worker without
  the tab's memory exceeding 500 MB (Chromium `performance.memory`, Chromium only).
