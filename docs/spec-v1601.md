# spec-v1601 — Preventive care owed at $0

**Status:** Proposed, September 29, 2026. Nothing built.
**Charter:** [spec-v1600](spec-v1600.md). **Group:** C, "Insurance & Patient Literacy".

## Why this wave comes first

Section 2713 of the Public Health Service Act requires most private plans to cover
USPSTF A and B recommendations, HRSA's women's and children's guidelines, and
recommended immunizations with no cost sharing in network. The Supreme Court upheld the
USPSTF route on June 27, 2025 (*Kennedy v. Braidwood Management*). About 100 million
people use it each year.

It still fails at the point of care in predictable ways: a screening colonoscopy becomes
"diagnostic" once a polyp is removed, the follow-up colonoscopy after a positive stool
test is billed with a deductible, the office visit around a preventive service is billed
separately, PrEP labs are charged. Each of these has a written federal answer. Nobody
hands it to the patient.

This is also the program's prevention lever. Software can't make someone exercise. It can
make sure the screening they were owed didn't cost them $600, which is the reason many
people skip the next one.

## Tools

### 1. `preventive-owed` — Preventive Services Your Plan Must Cover at $0

**Input.** Age, sex at birth, pregnancy status, and the risk factors the USPSTF
recommendations are conditioned on (tobacco use, sexual-health risk, family history
items), each optional. Plan type: non-grandfathered private plan, grandfathered plan,
Medicaid expansion, Medicare (the last two get a note, because different rules apply).
**Compute.** Filters the current USPSTF A and B recommendations to those whose population
matches, and applies the one-year rule: a recommendation binds plan years beginning one
year after its issue date ([45 CFR 147.130](https://www.ecfr.gov/current/title-45/part-147/section-147.130)(b)).
**Output.** The list, each with its grade, the recommendation text verbatim (the USPSTF
terms require it), the issue date, the first plan year it binds, and a link. Recommendations
issued less than a year ago are shown separately as "not yet required."
**Rule.** A blank risk factor is not "no": recommendations conditioned on it are listed
under "depends on" with the question to answer, never dropped. A grandfathered plan gets
no list and says why.
**Data.** Route A: the USPSTF Prevention TaskForce API ([spec-v1605](spec-v1605.md)).
HRSA women's and Bright Futures items are route B rows, added after the USPSTF list is
live. Immunizations are out ([spec-v1600](spec-v1600.md)).

### 2. `preventive-cost-share-check` — Should I Have Paid Anything for This?

**Input.** What happened, as choices: the service (screening colonoscopy, follow-up
colonoscopy after a positive stool-based test, polyp removal during a screening,
anesthesia for a screening colonoscopy, PrEP and its required labs, contraception,
well-woman visit, a USPSTF service from `preventive-owed`), whether it was in network,
whether an office visit was billed separately, and whether the visit's primary purpose
was the preventive service. Optional: the amount charged.
**Compute.** Walks the federal rules: the office-visit rules in 45 CFR 147.130(a)(2)
(separately billed visit; primary purpose), and the Departments' FAQs that settled
specific services (follow-up colonoscopy, polyp removal and anesthesia as integral to the
screening; PrEP's baseline and monitoring services).
**Output.** "Cost sharing allowed" or "not allowed," the rule and FAQ that decide it, and
what to do next: ask the plan to reprocess, then the internal appeal clock from
`appeal-deadline` or `which-appeal-path`, pre-filled. A letter through the
[spec-v1501](spec-v1501.md) §4 document builder cites the rule and leaves the facts the
tool wasn't told as marked blanks.
**Rule.** Out of network and grandfathered plans say "the $0 rule doesn't apply" and why;
they never say "you owe this."

### 3. `hsa-predeductible-check` — Can an HSA Plan Cover This Before the Deductible?

**Input.** The item or service, the diagnosis it's for (for the chronic-condition list),
and whether it's telehealth.
**Compute.** Checks the IRS safe harbors: preventive care (Notice 2004-23), the chronic-
condition list (Notice 2019-45: for example, statins for heart disease, insulin and glucose
meters for diabetes, inhaled corticosteroids for asthma), the insulin rule (IRC 223(c)(2)(G)), and
telehealth (made permanent by the 2025 reconciliation act, Notice 2026-5).
**Output.** "Safe harbor applies" with the notice and line, or "not in any safe harbor,"
in which case covering it before the deductible would cost the member HSA eligibility.
**Who it's for.** Employers designing a plan, and members checking why a drug their
chronic condition needs is behind the deductible when it doesn't have to be.

## Sources

- PHS Act 2713; 45 CFR 147.130; 29 CFR 2590.715-2713; 26 CFR 54.9815-2713, eCFR.
- *Kennedy v. Braidwood Management, Inc.*, 606 U.S. ___ (June 27, 2025).
- Departments' FAQs about ACA implementation: the parts on colonoscopy follow-up, polyp
  removal and anesthesia, and PrEP (part numbers verified at build).
- USPSTF Prevention TaskForce API and its instructions, uspreventiveservicestaskforce.org.
- IRS Notices 2004-23, 2019-45, 2026-5; IRC 223(c).

## Verify at build

- The FAQ part numbers for colonoscopy follow-up (believed Part 51, 2022), PrEP (Part 47,
  2021) and anesthesia (believed Part 29, 2015).
- The Prevention TaskForce API requires a request form and key. If a key can't be held by
  the refresh workflow, the USPSTF A and B list becomes route B (the published list page,
  page-watched) and the API is dropped.
- Whether any USPSTF recommendation was withdrawn or blocked by the Secretary after
  *Braidwood*; the tool must show the status the USPSTF site shows.

## Tests

- `preventive-owed`: a recommendation issued 11 months before the plan year is "not yet
  required," at 12 months required; a blank tobacco field lists lung-cancer screening
  under "depends on"; a grandfathered plan lists nothing and says why.
- `preventive-cost-share-check`: follow-up colonoscopy after a positive FIT is "not
  allowed" with its FAQ; separately billed office visit whose primary purpose was not
  preventive is "allowed"; out-of-network never says "you owe."
- `hsa-predeductible-check`: statin for diagnosed heart disease passes under 2019-45;
  the same statin with no qualifying diagnosis fails; an item absent from every list fails.

## Build status

| Tool | Status | What was read, and what differed |
|---|---|---|
| `preventive-owed` | Open | Waits for the `uspstf` dataset ([spec-v1621](spec-v1621.md) §3.6). |
| `preventive-cost-share-check` | **Built September 29, 2026** (catalog 1,950) | Read in the source that day: 45 CFR 147.130(a)(2)-(3) in the eCFR, and the Departments' FAQs in the CMS copies (the DOL pages refuse scripted requests). **The spec's part numbers were partly wrong:** anesthesia is FAQs Part XXVI (May 11, 2015) Q7, not Part 29; Part XXIX (Oct. 23, 2015) holds the pre-screening specialist consultation (Q7) and polyp pathology (Q8); polyp removal is Part XII (Feb. 20, 2013) Q5; bowel preparation is Part 31 (Apr. 20, 2016) Q1; PrEP is Part 47 (July 19, 2021); the follow-up colonoscopy is Part 51 (Jan. 10, 2022) Q7, binding plan years beginning on or after May 31, 2022 (Q8), and contraception is Q9 there. An unanswered office-visit question is its own outcome ("not assessed" or "depends on its purpose"), never read as yes or no. The letter through the [spec-v1501](spec-v1501.md) §4 builder and the pre-filled appeal clock are not built; the result names **Which Appeal Rules Apply?** instead. |
| `hsa-predeductible-check` | Open | Needs the curated `irs-hsa` rows. |
