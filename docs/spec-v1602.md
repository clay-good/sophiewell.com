# spec-v1602 — Reading your own claims and bills

**Status:** Proposed, September 29, 2026. Nothing built.
**Charter:** [spec-v1600](spec-v1600.md). **Group:** C, "Insurance & Patient Literacy".
**Machinery:** the [spec-v1501](spec-v1501.md) §3 upload workbench (JSON and CSV, in a Web
Worker, nothing kept) and the streaming price-file parser built for `hpt-file-check`
([spec-v1515](spec-v1515.md)).

## What changed that makes this possible

Patients can now get their own claims as structured data. Plans under CMS-9115-F have
offered a Patient Access API since 2021, using the CARIN Blue Button profile of the FHIR
ExplanationOfBenefit. From January 1, 2027, CMS-0057-F adds prior-authorization requests
and decisions to that API. The CMS health technology ecosystem, launched in 2025 and live
in 2026, pushes networks to let a patient pull that data into an app of their choice and
export it.

So the patient can hold a file with every claim their plan processed, the allowed amounts
and what the plan paid. Hospitals also publish every negotiated rate. The pieces for
checking a bill are all public. What's missing is a tool that reads them together without
sending them anywhere.

## How the reader gets the file

This site does not connect to plans ([spec-v1600](spec-v1600.md), rule 8). Each tool page
says how to get the file: export from the patient's app of choice (the page names the
FHIR export formats it accepts, not vendors), Medicare's Blue Button 2.0 through an
app that offers download, or a request under the HIPAA right of access (`hipaa-roa` builds
it) asking for the claims in electronic form.

## Tools

### 1. `carin-eob-reader` — Read My Claims File

**Input.** A FHIR Bundle or NDJSON of ExplanationOfBenefit resources (CARIN Blue Button
STU 2.x), from a Patient Access API export.
**Compute.** For each claim: dates, provider, network status, billed, allowed, plan paid,
patient responsibility (deductible, copay, coinsurance, noncovered), and the adjudication
reason codes (codes only, per [spec-v1501](spec-v1501.md) §6). Then these deterministic
flags, each handing off to the live tool that finishes the job:

| Flag | Hands off to |
|---|---|
| Cost sharing on a claim whose codes match a service from `preventive-owed` | `preventive-cost-share-check` |
| Out-of-network emergency claim, or out-of-network professional claim at an in-network facility, with patient responsibility above in-network cost sharing | `nsa-cost-share` |
| Same provider, same date, same code, both paid with patient cost share | (listed as a possible duplicate) |
| A denial | `denial-next-step` |
| Coinsurance that doesn't match the plan's stated percentage of allowed (reader supplies the percentage) | (listed with the arithmetic) |

**Output.** A table of claims, the totals by year (for checking the out-of-pocket
maximum), the flags with their reasons, and a CSV.
**Rule.** A flag is "worth asking about," never "you were overcharged." Every flag states
the fact it rests on.

### 2. `itemized-bill-check` — Compare My Itemized Bill With the Hospital's Posted Prices

**Input.** The itemized bill as CSV (code, description, units, charge per line), the
hospital's own machine-readable price file, and, optionally, the patient's plan name as it
appears in that file.
**Compute.** For each line: the hospital's posted gross charge, discounted cash price,
and the negotiated rate for the patient's plan for that code, from the hospital's own
file. Then: lines charged above the gross charge the hospital posted; for self-pay, lines
above the posted cash price; and code pairs that CMS's NCCI edits bar from billing
together, from the NCCI and MUE files ([spec-v1614](spec-v1614.md) §3, or the reader's own
copy, §6), with the verdict logic `ncci-ptp` and `mue-check` already use.
**Output.** Each line beside the hospital's own number, the differences, and a total. The
[spec-v1501](spec-v1501.md) §4 builder drafts a request for correction citing the posted
file (the hospital's own public statement of its price).
**Rule.** A code absent from the price file is "not posted," not "overcharged."
Negotiated rates are compared only when the reader names the plan; the tool never guesses
which plan row applies.

### 3. `patient-pa-record-reader` — Read My Prior Authorization Record

**Input.** The prior-authorization records in a Patient Access API export (from 2027:
the request, decision and dates the plan returned).
**Compute.** For each request: the payer type, whether it was urgent or standard, how
long the decision took, compared with the CMS-0057-F windows through the live
`pa-turnaround` tool; whether a denial carries a specific reason (a CMS-0057-F
requirement); and the appeal clock from the decision date.
**Output.** A timeline per request, late decisions marked with the rule, and each denial's
next step.
**Build gate.** Built after January 1, 2027, when real exports exist to test against.
Until then the spec stands and the tool is counted, as `340b-rebate-model-clock` is.

## Sources

- CMS-9115-F (85 FR 25510, May 1, 2020) and CMS-0057-F (89 FR 8758, February 8, 2024):
  42 CFR 422.119, 431.60, 438.242, 457.730; 45 CFR 156.221.
- HL7 CARIN Consumer Directed Payer Data Exchange (CARIN IG for Blue Button), STU 2.x
  (CC0; X12, CPT and NUBC value sets checked for format only).
- 45 CFR 180.50 (hospital standard charges); the CMS hospital price transparency data
  dictionary, the version `hpt-file-check` pins.
- No Surprises Act, 45 CFR 149.110–149.130; 45 CFR 164.524 (right of access).

## Verify at build

- The CARIN IG version most Patient Access APIs serve in 2026, and whether the common
  export apps produce Bundle or NDJSON.
- Whether CMS-0057-F's patient-access prior-authorization data is exposed as a Da Vinci
  PAS ClaimResponse, a CARIN resource or both. The reader handles whichever the IG says.

## Tests

- `carin-eob-reader`: a CARIN sample bundle round-trips its totals to the cent; a
  preventive code with coinsurance raises the preventive flag and nothing else; a missing
  allowed amount is shown as missing, not zero.
- `itemized-bill-check`: a line above the posted gross charge is flagged with both
  numbers; a code absent from the file says "not posted"; no plan named means no
  negotiated-rate comparison.
- Network test: with the network blocked, every tool here runs and produces the same
  output.

## Build status

- **Not yet built.**
