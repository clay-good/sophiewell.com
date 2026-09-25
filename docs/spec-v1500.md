# spec-v1500 — Medication access and coverage operations: charter

**Status:** Proposed, September 25, 2026. Specs only; nothing here is built.
**Program ledger:** [scope-medication-access.md](scope-medication-access.md) (the gap-finder
result, the queue, the count, and what was rejected).
**Specs:** spec-v1500 (this charter) through spec-v1517.

## What this does for the reader

Getting a patient onto a drug, or getting a claim paid, is mostly clerical work done by
people who have better things to do: a pharmacy technician counting days until a refill
is allowed, a financial counselor working out whether a family is under 250% of the
poverty line, a biller adding up how many days are left to appeal, a 340B analyst
matching prescriptions to clinic visits in a spreadsheet, and a case manager checking
whether a skilled-nursing stay qualifies. Every one of those steps is a rule written in
a regulation, a date to count, or a table to join. None of them needs a person to
think, and none needs a paid product.

The catalog already covers the clinical question well. It barely touches this work:
of the 1,847 live entries, fewer than 70 are billing, insurance or workflow tools, and **none** covers
Part C, Part D, employer-plan, Marketplace or Medicaid appeal clocks; Part D cost
projection; poverty-line eligibility; 340B; drug-pricing reimbursement; dispensing rules;
adherence; post-acute notices or benefit periods. The program closes that gap with
101 deterministic tools.

## What the program will not do

The admission test is the one from [spec-v29](spec-v29.md) §3: a tool takes an input
and computes an output. Four kinds of work fail it, or fail our posture, and stay out:

| Out | Why |
|---|---|
| Reading a chart and deciding whether a patient meets a payer's criteria | This is judgment over free text. A deterministic tool would be brittle and would sound confident when it's wrong. The reader answers the criteria and the tool checks the answers ([spec-v1502](spec-v1502.md)). |
| Writing an appeal's clinical argument | Same reason. The generators in [spec-v1504](spec-v1504.md) assemble the regulatory skeleton, the deadlines and the citations, and leave a marked blank for the argument. |
| Submitting anything anywhere: portals, fax, ePA, clearinghouses | No network is a hard commitment ([spec-v50](spec-v50.md) §3). The tools produce the packet; the reader sends it. |
| Live status: fund openings, shortages, a payer's formulary today | These change daily and are licensed or unpublished. A tool built on them is wrong within the week. |

## Admission rule (every tool in the program must pass all six)

1. **An input and a computed output.** A table, a list or a glossary on its own is not a
   tool. Reference material appears only as the proof behind an answer.
2. **A named primary source.** A statute, a CFR section, a CMS manual chapter, an agency
   data file, or an FDA label. Secondary summaries never supply a number.
3. **Deterministic.** The same inputs give the same output on every machine. No model,
   no network, no server.
4. **Maintainable without a person.** Every number that changes on a calendar either
   (a) comes from a machine-readable federal file that the weekly refresh already
   fetches, or (b) is a dated constant with a staleness-ledger row, or (c) is an input
   the reader supplies. See the data contract in [spec-v1501](spec-v1501.md) §2.
5. **Fails closed when stale.** A tool whose data has passed its expiry date stops
   answering from that data and asks the reader for the value instead. It never
   answers silently from last year's number.
6. **Licensed to ship.** No CPT descriptors, no X12 implementation-guide text, no
   NCPDP standard text, no USP chapter text, no PQA measure text. The screen is
   [spec-v1501](spec-v1501.md) §6.

## Amendments to earlier scope rules

This program needs two older out-of-scope rules narrowed. They are narrowed, not
removed, and only where a rule above replaces the protection.

### spec-v5 §6

| spec-v5 §6 said out of scope | Now |
|---|---|
| "Any pricing tool that depends on a CMS/NADAC/ASP/CLFS/ASC fee file" | **Allowed** when the file is fetched by the weekly refresh with a pinned hash and a stated expiry date, and the tool also accepts the value as an input (the [spec-v77](spec-v77.md) §2 clause 2 posture). A fee file is never the only way the tool works. |
| "Any state-by-state Medicaid/SEP/patient-rights matrix" | **Unchanged for matrices.** A tool may take a state's threshold as an input; it never ships fifty rows. The federal rule (for example, the HealthCare.gov special-enrollment windows) is not a state matrix. |
| "Any tool whose correctness materially decays in under 12 months" | **Allowed** only under admission rules 4 and 5: the decaying value is refreshed automatically or is an input, and the tool fails closed on expiry. |

The other spec-v5 §6 exclusions (registry scraping, recall feeds, annually shifting
vaccine schedules, models, accounts) stand.

### spec-v29 §3

spec-v29 §3 retired "COBRA timeline, Medicare enrollment period checker, ACA SEP
eligibility, ABN explainer, NSA/IDR eligibility tree" as **infographics**: static
pictures of a rule. They are readmitted only as **clocks and deciders** that take the
reader's dates and facts and compute a deadline, a window, a penalty or a yes/no. That's
the same shape as the live `appeal-deadline` and `timely-filing` tools. A version that
only draws the rule stays retired. The code-reference-index ban stands: no tool in this
program is a lookup of codes.

## Where the tools live

A new group, **Q, "Medication Access & Pharmacy"**, holds the access, affordability,
340B, pricing, dispensing and adherence tools. Coverage and appeal clocks join group C,
"Insurance & Patient Literacy"; billing-file tools join group P. The five files that
declare group labels move together ([spec-v1501](spec-v1501.md) §1).

## The queue

| Spec | Wave | New tools |
|---|---|---|
| [v1501](spec-v1501.md) | Shared machinery: data contract, upload workbench, document builder, clocks | 0 |
| [v1502](spec-v1502.md) | Prior authorization and step therapy | 6 |
| [v1503](spec-v1503.md) | Coverage decisions and appeal clocks beyond Original Medicare | 8 |
| [v1504](spec-v1504.md) | Appeal, exception and request document builders | 7 |
| [v1505](spec-v1505.md) | Benefits investigation: which benefit, which rules, what the patient owes | 5 |
| [v1506](spec-v1506.md) | What the patient will pay | 9 |
| [v1507](spec-v1507.md) | Enrollment windows, penalties and eligibility | 9 |
| [v1508](spec-v1508.md) | Hospital financial assistance and self-pay estimates | 5 |
| [v1509](spec-v1509.md) | 340B | 7 |
| [v1510](spec-v1510.md) | Drug pricing and reimbursement | 7 |
| [v1511](spec-v1511.md) | Dispensing: days supply, refills, controlled substances, REMS windows | 8 |
| [v1512](spec-v1512.md) | Specialty and infusion operations | 5 |
| [v1513](spec-v1513.md) | Adherence and quality measures from a fill history | 4 |
| [v1514](spec-v1514.md) | Hospital, post-acute and DME notices and benefit clocks | 10 |
| [v1515](spec-v1515.md) | File workbenches: remittance, claim, eligibility, price files | 7 |
| [v1516](spec-v1516.md) | Denial management | 4 |
| [v1517](spec-v1517.md) | Automated refresh builders for the program's datasets | 0 |
| | **Total** | **101** |

Build order follows toil saved per hour of build: v1501 first (everything depends on
it), then v1503, v1507, v1508, v1511 and v1514 (rules and dates, few or no data files), then
the data-backed waves once v1517's builders exist.

## Acceptance for the whole program

- Every shipped tool meets the six admission rules, and its spec's "Built" section says
  what was read, what changed from the plan, and what is still unread (the
  [spec-v1388](spec-v1388.md) convention).
- The catalog count surfaces move with each wave (`node scripts/check-catalog-truth.mjs`).
- Every tool is exposed to agents through the MCP server in the same change
  ([spec-v627](spec-v627.md)).
- No tool answers from an expired dataset. The negative test sets the clock past the
  expiry and asserts the tool asks for the value instead.
