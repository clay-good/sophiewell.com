# spec-v1512 — Specialty and infusion operations

**Status:** Proposed, September 25, 2026. 5 new tools, group Q.
**Charter:** [spec-v1500](spec-v1500.md). **Machinery:** [spec-v1501](spec-v1501.md).

An infusion center's day is dose rounding, vial math, dose calendars and chair
scheduling. The catalog has the adjacent pieces (`drug-wastage` for JW/JZ units,
`ndc-hcpcs-units`, `infusion-time-remaining`) but not these.

## Tools

### 1. `vial-rounding` — Dose Rounding to Whole Vials

**Input.** Ordered dose (mg, or mg/kg with weight, or mg/m² with body surface area),
the vial sizes available, the rounding threshold (default 10%, editable) and optionally
each vial's cost.
**Compute.** Every vial combination that delivers a dose within the threshold. The
tool picks the one with the least waste, breaking ties on cost, then on fewest vials.
When no combination is within the threshold, it reports the least-waste combination
at or above the ordered dose and says rounding isn't within policy.
**Output.** The rounded dose, the percent change from the order, the vials, the waste
in mg, and the JW/JZ line that `drug-wastage` would bill.
**Source.** Hematology/Oncology Pharmacy Association position statement on dose
rounding (JCO Oncology Practice 2018): biologics and monoclonal antibodies to the
nearest vial within 10%. The threshold is editable because institutions set their own.
**Rule.** The tool never changes an order. It shows the pharmacist the rounding their
policy permits.

### 2. `dose-calendar` — Loading and Maintenance Dose Calendar

**Input.** Start date, the schedule as the label states it (for example, weeks 0, 2 and
6, then every 8 weeks), the number of maintenance doses to show, and the allowed window
around each dose (reader input, for example ±3 days).
**Compute.** Each dose date, its earliest and latest acceptable dates, and dates that
fall on a weekend or federal holiday. It re-anchors from an actual administration date
when a dose was given late.
**Output.** A dated list and an `.ics` calendar file generated in the browser.

### 3. `rate-escalation-schedule` — Infusion Rate Escalation Schedule

**Input.** Total volume, starting rate, increment, interval between increments, and the
maximum rate (all as the label or protocol states), or a custom step table.
**Compute.** Each step's start time, rate and volume delivered, and the total infusion
time.
**Output.** The step table and the finish time from a given start. It covers the
first-infusion and subsequent-infusion protocols as two runs.

### 4. `chair-day-planner` — Infusion Chair Day Planner

**Input.** The number of chairs, opening hours, and a list of appointments (CSV upload,
or typed): patient reference, chair minutes (from `rate-escalation-schedule` or entered),
premedication lead time, post-infusion observation time, and a preferred start time.
**Compute.** A deterministic first-fit schedule honoring preferred starts where
possible. It reports utilization per chair, the appointments that don't fit, and the
earliest slot each could take.
**Output.** A chair-by-time table and a CSV.
**Scope.** Scheduling arithmetic only. It doesn't know about nurse ratios or
pharmacy prep capacity unless the reader enters them as constraints.

### 5. `substitution-check` — Can This Product Be Substituted?

**Input.** The prescribed product and the product on the shelf (by name or NDC).
**Compute.**
- **Small molecules:** both products' Orange Book entries. Substitution is supported
  when the therapeutic-equivalence codes are both "A"-rated against the same reference
  listed drug.
- **Biologics:** the Purple Book entries. Pharmacy-level substitution is supported only
  when the shelf product's license type is "351(k) Interchangeable" for that reference
  product; a biosimilar that isn't interchangeable needs a new prescription.
**Output.** "Substitutable at the pharmacy (subject to state law)", "Not substitutable:
biosimilar, not interchangeable" or "Not substitutable: TE code BX", with both
entries and the data edition.
**Data.** Orange Book (monthly ZIP, tilde-delimited) and Purple Book (monthly CSV) are
route A files ([spec-v1517](spec-v1517.md)).
**Why this is not a lookup.** It takes two products and decides one question; it
doesn't list products.

## Sources

- HOPA, "Dose Rounding of Biologic and Cytotoxic Anticancer Agents", JCO Oncology
  Practice 2018 (doi:10.1200/JOP.2017.025411).
- FDA Orange Book data files; FDA Purple Book data download.
- FDA prescribing information for the example drugs in each test.

## Tests

- `vial-rounding`: an exact vial fit; a 9% rounding accepted and an 11% rounding
  refused at the 10% threshold; the cost tie-break.
- `dose-calendar`: a late dose re-anchors the rest of the schedule; a dose landing on
  Juneteenth is flagged.
- `substitution-check`: an AB-rated generic; a BX-rated product; an interchangeable
  and a non-interchangeable biosimilar of the same reference product.
