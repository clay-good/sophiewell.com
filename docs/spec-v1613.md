# spec-v1613 — Records to calculators: your record fills the tools it can

**Status:** Proposed, September 29, 2026. Nothing built.
**Charter:** [spec-v1610](spec-v1610.md). **Depends on:** [spec-v1611](spec-v1611.md),
[spec-v1612](spec-v1612.md), and the registry-driven prefill of
[spec-v753](spec-v753.md).

## Why this is the prevention piece

Every certified EHR's patient portal must let a patient download their record as a C-CDA
document (45 CFR 170.315(e)(1), "view, download, and transmit"), and patient-access apps
export FHIR. A patient's record holds the numbers the prevention calculators need: age,
sex, blood pressure, cholesterol, creatinine, A1c, liver enzymes, platelets. Today a
person who wants their 10-year cardiovascular risk, or to know whether their kidney
numbers are moving, has to find each value in a portal, find the right calculator, and
type the values in.

After this spec, they drop the file, and the site shows: *"Your record can fill these
tools"*, with the values it will use and their dates, one click from each answer. It
works the same way for a clinician given a transfer record. It's the one-box prefill
([spec-v753](spec-v753.md)) with a file as the query.

## 1. What is read: coded values only

Only structured, coded data. Narrative sections are never read ([spec-v1610](spec-v1610.md)).

| Source | What is read |
|---|---|
| C-CDA | Results and vital signs sections (`observation` entries with a LOINC `code`, a `value` of type `PQ` with a UCUM unit, and an `effectiveTime`); the patient's `birthTime` and `administrativeGenderCode` from the header |
| FHIR (Bundle, NDJSON, or single resources) | `Observation` with a LOINC coding, `valueQuantity` with a UCUM code, and `effective[x]`; `Patient.birthDate` and `Patient.gender` |
| Apple Health `export.xml` | `Record` elements for body mass, height, blood pressure and heart rate (HealthKit type identifiers), with dates. Labs come only from the FHIR clinical records inside the same export, when present |

## 2. The concept map

A new dataset, `data/concepts/`, maps codes to **concepts** the calculators use. It starts
with the concepts the highest-value prevention and kidney/liver tools need:

| Concept | Codes (LOINC unless noted) | Canonical unit |
|---|---|---|
| systolic BP | 8480-6 | mmHg |
| diastolic BP | 8462-4 | mmHg |
| body weight | 29463-7 | kg |
| body height | 8302-2 | cm |
| total cholesterol | 2093-3 | mg/dL |
| HDL cholesterol | 2085-9 | mg/dL |
| LDL cholesterol (calculated or direct) | 13457-7, 18262-6 | mg/dL |
| triglycerides | 2571-8 | mg/dL |
| creatinine, serum | 2160-0 | mg/dL |
| cystatin C | 33863-2 | mg/L |
| hemoglobin A1c | 4548-4 | % |
| glucose, fasting | 1558-6 | mg/dL |
| ALT, AST | 1742-6, 1920-8 | U/L |
| platelets | 777-3 | 10³/µL |
| albumin, serum | 1751-7 | g/dL |
| urine albumin/creatinine ratio | 9318-7 | mg/g |
| sodium, potassium, calcium, bicarbonate, chloride | 2951-2, 2823-3, 17861-6, 1963-8, 2075-0 | mmol/L (calcium mg/dL) |

Each row cites LOINC (free to use with attribution under the LOINC license; the concept
map ships code numbers and our own short names, not LOINC long names) and states the unit
conversions it accepts, reusing `canonUnit` and `convertUnit` from `lib/query-fill.js`. A
value in a unit the map doesn't list is **not filled**; it is shown with its unit and the
field is left for the reader.

The field registry (`data/fields/`) gains an optional concept key per field (`c`). A
field with a concept can be filled from a record; the rest can't. The tags are added tool
by tool; the first release tags these tools, all live today: `prevent`, `ascvd`,
`score2`, `egfr`, `egfr-suite`, `ckd-epi-cystatin`, `cockcroft-gault`, `kfre`,
`uacr-upcr`, `fib4`, `apri`, `nafld-fibrosis`, `meld-na`, `bmi`, `ldl-calc`,
`non-hdl-remnant`, `eag-a1c`, `tyg-index`, `homa-ir`, `anion-gap`, `corrected-calcium`.

## 3. Choosing the values

For each concept, the **most recent** value is used, with its date. Rules:

- Age is computed on today's date from the birth date. Sex comes from the record's
  administrative gender; a value the calculator can't use (for example `UN`) is not filled.
- A value older than the concept's **recency window** is shown with an amber "from
  [date], [n] months ago" note and still filled, because the reader can judge; the
  windows are 12 months for labs and vitals by default and are stated on the page. A
  value older than 5 years is not filled.
- When two results share the most recent timestamp and disagree, neither is filled; both
  are shown.
- Values the calculator treats as yes/no answers (smoker, diabetes, on BP treatment) are
  **not** filled from the record in the first release. Coded conditions and medications
  can decide these, but mapping them is judgment-prone; they stay questions the reader
  answers. The tool asks for them by name, as the one-box partial state already does
  ([spec-v755](spec-v755.md)).

## 4. What the reader sees

A results panel, above everything else after a record is dropped:

**"Your record can fill these tools"**, in three groups:

1. **Ready:** every required field filled. Each row shows the tool name, the answer
   already computed, and the values used with dates (*"PREVENT 10-year CVD risk: 6.1%
   (borderline). Age 58 · Female · SBP 138 (Aug 2, 2026) · Total chol 212 · HDL 51 (Jun
   14, 2026) · eGFR 88 (from creatinine, Jun 14, 2026)"*). Tools needing a yes/no answer
   appear here with the question inline.
2. **One value short:** the tool and the single missing field (*"FIB-4 needs a platelet
   count"*).
3. **The values we found:** a table of every concept found, value, unit, date and the
   code it came from, so the reader can check the parse in a glance (the one-box
   verification principle, [scope-one-box.md](scope-one-box.md)).

Opening a tool fills its fields and marks each filled field "from your file, [date]." The
reader can overwrite any of them. Nothing is computed from a value the reader can't see.

If the record's age and sex are present, the panel also links `preventive-owed`
([spec-v1601](spec-v1601.md)) pre-filled: *"Screenings your plan must cover at $0 at your
age."*

## 5. Privacy: file values never reach the URL

The site writes tool inputs into the URL fragment so links reproduce results
(`trackHashState` in `app.js`). A value that came from a file must never go there: a URL
lands in browser history, sync, screenshots and shared links.

- When any field was filled from a file, `trackHashState` is suspended for that view,
  and the "copy link" control is replaced by *"Links aren't made from file values."*
- If the reader edits a filled field by hand, it's still treated as file-derived for the
  rest of that view. The simple rule is easier to trust than a precise one.
- The record's contents are held in the worker's memory only. Closing the tab ends them.

## Tests

- A synthetic C-CDA and a synthetic FHIR bundle (no real patient data, built from the
  HL7 examples) each produce the expected "Ready" list and values, and the same answers as
  typing the values into each tool.
- Unit handling: creatinine in µmol/L converts; a potassium in an unlisted unit is shown
  and not filled.
- Recency: a 14-month-old LDL fills with the amber note; a 6-year-old one does not fill.
- Two same-time conflicting values: neither fills.
- Privacy: after a record fills `prevent`, the URL fragment is unchanged and history has
  no entry containing a value (Playwright reads `location.hash` and `history.length`).
- Yes/no fields are never filled from the record.
