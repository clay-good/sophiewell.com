# spec-v1504 — Appeal, exception and request document builders

**Status:** Proposed, September 25, 2026. 7 new tools, group C.
**Charter:** [spec-v1500](spec-v1500.md). **Machinery:** [spec-v1501](spec-v1501.md) §4 (document builder). **Clocks:** [spec-v1503](spec-v1503.md).

The live `appeal-letter` writes a general patient letter. A request that gets decided
on time needs more than that: the right addressee, the rule that grants the right to
ask, the standard the reviewer has to apply, the enclosures, the deadline, and, for an
urgent case, the specific sentence that triggers the fast track. Each builder here
knows one payer type's rules. The builders fill in everything that's a rule or a date,
and leave the clinical argument to a person as a marked blank.

## What every builder does

- Fills in the parties, the claim or request identifiers, the dates, the deadline
  computed by the matching [spec-v1503](spec-v1503.md) clock, the regulation that grants
  the right, and the review standard, all cited.
- Includes the fast-track sentence only when the reader ticks it, and only in the form
  the rule recognizes. (For Part D, a prescriber states that the standard timeframe may
  seriously jeopardize the enrollee's life, health or ability to regain maximum
  function.)
- Leaves the clinical reasoning as a bracketed blank, with a download banner while any
  blank remains ([spec-v1501](spec-v1501.md) §4).
- Accepts attachments produced by other tools: `pa-criteria-checklist`'s cover sheet,
  `step-therapy-history`'s timeline, and `denial-next-step`'s summary.

## Tools

| Tool | Document | Rule it's built on |
|---|---|---|
| `partd-exception-request` | Part D coverage-determination or exception request, plus the prescriber's supporting-statement skeleton stating the tiering or formulary standard | 42 CFR 423.566–423.578 |
| `partd-redetermination-request` | Part D redetermination request, or a request for reconsideration by the independent review entity | 423.580–423.600 |
| `ma-reconsideration-request` | Medicare Advantage reconsideration request, standard or expedited, including the Part B drug variant | 422.578–422.590 |
| `erisa-appeal-letter` | Employer-plan internal appeal. It asserts the claimant's right to the claim file and relevant documents free of charge, to review by someone who wasn't involved in the denial, and to consultation with a health care professional for a medical judgment | 29 CFR 2560.503-1(h) |
| `external-review-request` | Request for external review (state or federal process), with the deemed-exhaustion paragraph when the reader marks a plan violation | 45 CFR 147.136 |
| `medicaid-hearing-request` | Medicaid managed care appeal or state fair hearing request, with an optional request to keep benefits during the appeal and its 10-day warning | 42 CFR 438.402–438.420, 431.221 |
| `medical-necessity-letter` | Letter of medical necessity for a drug. It covers the diagnosis (code and date), the drug, dose and duration, prior therapies and outcomes (from `step-therapy-history`), each payer criterion with where the evidence is (from `pa-criteria-checklist`), and a blank for the clinical rationale | payer policy (reader-supplied), with citations to the FDA label for the approved indication |

## Rules the builders enforce

- A builder refuses to produce a request whose deadline has already passed, unless the
  reader marks that they are asking for a good-cause extension. The builder then adds
  the extension paragraph the rule allows (for example, 423.582(c) for Part D).
- A Part D exception request without a supporting statement is still produced, with
  the statement marked missing and a warning that the 72-hour clock doesn't start until
  it arrives (423.568(b)).
- No builder claims an outcome, a success rate, or a clinical fact the reader didn't
  supply.

## Sources

The rule for each tool as listed; the CMS model forms for Part D coverage
determinations and redeterminations are cited as the plan-facing format the output
mirrors (content, not layout, reproduced).

## Tests

- Each builder: a complete request has no blanks; a missing clinical rationale leaves
  one blank and sets the banner.
- `partd-redetermination-request`: past the 60-day window, the builder refuses without
  a good-cause request and accepts with one.
- `medicaid-hearing-request`: the continuation-of-benefits paragraph shows the
  10-calendar-day deadline from the notice date.

## Build status

- **Built 2026-09-26:** all seven builders (group C). Each returns the letter as sections the page prints,
  counts the bracketed blanks left, and never writes a clinical claim the reader did not supply; the
  clinical argument is always a blank. Every rule was re-read in the eCFR: 42 CFR 423.566-423.590 (the
  supporting-statement standards of 423.578(a)(4) and (b)(5), the expedited wording of 423.570 and 423.584),
  422.578-422.590, 29 CFR 2560.503-1(h), 45 CFR 147.136 (the builder reuses `aca-external-review-clock`),
  and 42 CFR 438.402-438.420 with 431.221 (the expedited wording is 438.410(a)).
  - A late request is refused unless the reader asks for good cause, which adds the paragraph 423.582(c)
    or 422.582(c) requires; an employer plan's 180 days is stated as the minimum the plan must allow.
  - A Part D exception request without the prescriber's statement is still produced, with the statement
    marked missing and the note that the plan's clock waits for it (423.568(b)).
  - The builders take the other tools' output as plain lines (the step therapy timeline and the criteria
    cover sheet); a download banner and file attachments wait for the document builder of
    [spec-v1501](spec-v1501.md) §4.
