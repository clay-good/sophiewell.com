# spec-v1511 — Dispensing: days supply, refills, controlled substances and REMS windows

**Status:** Proposed, September 25, 2026. 8 new tools, group Q.
**Charter:** [spec-v1500](spec-v1500.md). **Machinery:** [spec-v1501](spec-v1501.md).

A pharmacy counts constantly: how many days a pen lasts, when a refill stops being "too
soon", whether a controlled-substance prescription still has a legal refill left, and
whether an iPLEDGE window has closed. Every count below follows a federal rule or a
label. None needs judgment.

## Tools

### 1. `days-supply` — Days Supply

**Input.** The dosage form and its quantities:

| Form | Inputs |
|---|---|
| Tablets, capsules | quantity, units per dose, doses per day |
| Oral liquid | volume dispensed, dose volume, doses per day |
| Insulin pen or vial | units per mL, mL per pen, pens, units per day, **priming units per injection** (the label's figure; many pens say 2 units), injections per day |
| Inhaler | actuations per canister (from the label), puffs per dose, doses per day |
| Eye drops | mL, **drops per mL (reader input; no federal figure exists)**, drops per eye per dose, eyes, doses per day |
| Pen or vial with an in-use discard limit | the label's "discard after N days once opened" |

**Compute.** Days = usable quantity ÷ daily use, rounded down, then capped by any
in-use discard limit (an insulin pen that must be discarded 28 days after opening
lasts at most 28 days, however much is left).
**Output.** Days supply with the arithmetic, and the binding constraint named.
**Note.** No CMS or FDA source gives a drops-per-mL figure, so the tool doesn't
pretend one exists. The reader enters the manufacturer's figure or their plan's
convention.

### 2. `refill-eligible-date` — Earliest Refill Date (Refill Too Soon)

**Input.** Last fill date, days supply, the plan's refill threshold percentage (reader
input), and optionally the history of earlier fills to carry forward early refills.
**Compute.** Earliest date = fill date + ceiling(days supply × threshold). With history,
days accumulated from earlier early refills are carried forward the way plans track
them.
**Preset.** Eye drops default to the CMS 2010 recommendation of 70% (a 30-day supply
may be refilled on day 21), labeled as a recommendation, not a mandate.
**Batch.** A CSV of patients' last fills gives the list of refills due this week.

### 3. `cs-refill-validity` — Controlled-Substance Refills Left (C-II to C-V)

**Input.** Schedule, date issued, refills authorized, and the fills dispensed so far
(dates and quantities).
**Compute.**
- C-II: no refills (21 CFR 1306.12(a)).
- C-III and C-IV: at most 5 refills, and nothing dispensed more than 6 months after the
  date issued, whichever comes first (21 CFR 1306.22). Partial fills count toward the
  total quantity, not as separate refills (1306.23).
- C-V: as the prescriber authorized; no federal numeric cap (1306.26).
**Output.** Refills left, the last legal fill date, and the reason the prescription
expires ("the 6-month limit on April 3, 2027 comes before the 5th refill").
**Scope.** Federal floor only. A state rule can be stricter; the tool says so.

### 4. `c2-fill-deadlines` — C-II Partial Fill and Emergency Prescription Deadlines

**Input.** Which case applies, plus the relevant dates and times:

| Case | Deadline | Rule |
|---|---|---|
| Pharmacy couldn't supply the full quantity | remainder within 72 hours of the partial fill | 21 CFR 1306.13(a) |
| Partial fill requested by the patient or prescriber | remainder within 30 days of the date written | 1306.13(b) |
| Long-term care or terminally ill patient | partial fills up to 60 days from issue | 1306.13 |
| Emergency oral C-II | prescriber delivers the written prescription within 7 days | 1306.11(d) |

**Output.** The deadline as a date and time, time remaining, and the rule.

### 5. `c2-multiple-rx-series` — Multiple C-II Prescriptions (Up to 90 Days)

**Input.** The issue date and, for each prescription in the series, its days supply
and the earliest fill date written on it.
**Compute.** Total days supply (must not exceed 90, 21 CFR 1306.12(b)), whether each
prescription carries an earliest-fill date, and whether the dates are consistent with
the supplies (a later prescription dated to fill before the earlier one runs out is
flagged).
**Output.** Valid or the specific defect, and the fill calendar.

### 6. `ipledge-dispense-window` — iPLEDGE Dispense Window (Isotretinoin)

**Input.** Specimen collection date for the pregnancy test, and whether the patient can
become pregnant.
**Compute.** Day 1 is the collection date; the window closes at 11:59 pm Eastern on
Day 7. The tool prints the "do not dispense after" date and time and the time left from
now.
**Dated rule.** The FDA approved the modified iPLEDGE REMS on February 9, 2026, with
implementation delayed to **November 15, 2026**. The modification removes the 19-day
lockout and permits home pregnancy tests during treatment. The tool carries both
editions with their effective dates (data route B), prints which one applied on the
date entered, and gets a ledger row.

### 7. `imid-rems-fill-window` — Lenalidomide REMS Fill Window

**Input.** Patient risk category (female of reproductive potential, or other), date of
the last pregnancy test (where it applies), date the authorization was issued, days of
therapy remaining on hand.
**Compute.**
- Authorization valid 7 days from the last pregnancy test (females of reproductive
  potential) or 30 days from issue (all others).
- Confirmation number valid 24 hours: ship or hand over within that window.
- At most a 28-day supply, no refills; the next fill is allowed only when 7 or fewer
  days of therapy remain.
**Output.** Whether a fill is allowed now, until when, and the next pregnancy-test due
date on the schedule (weekly for 4 weeks, then every 4 weeks, or every 2 weeks with
irregular cycles).
**Build gate.** Lenalidomide only at first. Thalidomide and pomalidomide (now the
"PS-Pomalidomide REMS") are added only after their own REMS documents are read; their
windows are not assumed to match.

### 8. `compounding-bud` — Compounded Preparation Beyond-Use Date (USP 797 / 795)

**Input.** Sterile or nonsterile. Sterile: category (1, 2 or 3), aseptic or terminally
sterilized, sterility tested or not, any nonsterile starting component, storage
(controlled room temperature, refrigerator, freezer), and the compounding date and
time. Nonsterile: aqueous or not, preserved or not, oral liquid or other. In both cases,
the earliest expiration date among the components.
**Compute.** The beyond-use limit from the USP category tables, applied from the
compounding time. The result is the earlier of that and the earliest component
expiration.
**Output.** The beyond-use date and time, and which limit bound it.
**Licensing.** The limits are the numbers USP itself published in its free *Compounding
BUD Fact Sheet* (hosted by the Mississippi Board of Pharmacy). The tool cites that sheet
and reproduces no chapter text.

## Rejected from this wave

| Idea | Why not |
|---|---|
| A drops-per-mL table by product | No public primary source; a wrong figure silently shortens a patient's supply |
| Clozapine REMS ANC clock | The FDA eliminated the clozapine REMS on June 13, 2025. The ANC monitoring in the label is clinical and belongs with the clinical tools, not here |
| A state-by-state controlled-substance rule matrix | The state-practice tiles already cover the four big states' prescribing limits ([spec-v1393](spec-v1393.md)); a fifty-state matrix is out of scope |

## Sources

- 21 CFR 1306.11, 1306.12, 1306.13, 1306.22, 1306.23, 1306.26 (eCFR).
- CMS memo, "Early Refills of Ophthalmic Medications", June 2, 2010.
- FDA, iPLEDGE REMS page (modification approved February 9, 2026; implementation
  November 15, 2026).
- Lenalidomide REMS Pharmacy Guide (Bristol Myers Squibb, revised December 2022); FDA
  REMS database entry.
- USP, *Compounding BUD Fact Sheet* (2023), via the Mississippi Board of Pharmacy.

## Tests

- `days-supply`: an insulin pen whose discard limit binds before the units run out,
  and the reverse; priming units included per injection, not per day.
- `cs-refill-validity`: the 6-month limit reached before the 5th refill; partial fills
  counted by quantity.
- `ipledge-dispense-window`: the Day 7 boundary at 11:59 pm Eastern across a
  daylight-saving change; a test date before November 15, 2026 is labeled with the old
  edition.
- `compounding-bud`: a component expiring before the category limit binds.

## Build status

- **Built 2026-09-26:** `days-supply`, `refill-eligible-date`, `cs-refill-validity`, `c2-fill-deadlines`,
  `c2-multiple-rx-series`; the last three each read against
  21 CFR part 1306 in the eCFR. Two corrections to this spec:
  - 21 CFR 1306.26 is dispensing C-V products *without* a prescription, not C-V refills. Federal rules set no
    count or time limit on C-V refills (1306.22 covers C-III and C-IV only), but partial fills of C-III to
    C-V stop 6 months after issue (1306.23(c)).
  - 1306.12(b) requires the 90-day total and the earliest fill dates; it does not forbid overlapping dates,
    so the series check flags them as "check the dates" rather than refusing the series.
  - The emergency deadline also states that a mailed prescription counts if postmarked within the 7 days
    (1306.11(d)(4)).
  - `refill-eligible-date` counts the threshold from the fill date as the CMS memo does ("a 30-day supply ...
    refills would be permitted at 21 days"); the carry-forward of earlier early refills and CSV batch mode
    are not built.
- **Built 2026-09-26:** `compounding-bud`, every limit taken from USP's own fact sheet (the Mississippi Board of
  Pharmacy copy), including the Category 1 rule that has no frozen limit and the Category 3 requirement of
  sterility testing. The longer nonsterile BUDs a monograph or stability data can support are not computed.
- **Built 2026-09-26:** `ipledge-dispense-window`, from the iPLEDGE Pharmacist Guide and the Guide for Patients
  Who Can Get Pregnant (March 2023): "add 6 to the date of your pregnancy test", 11:59 pm Eastern on Day 7,
  30 days from the visit otherwise. The FDA page confirms the November 15, 2026 implementation this spec
  states (some secondary sources still give August 8). The 19-day wait after a missed first window applies
  before that date. New ledger row `fda-ipledge-rems`.
- **Built 2026-09-26:** `imid-rems-fill-window`, lenalidomide only, from the Lenalidomide REMS Pharmacy Guide
  (12/22), which states every rule this spec lists; "7 days from" the test is counted as the 7 calendar days
  after it, and the tool says the REMS system's expiry controls.
