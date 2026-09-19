# spec-v1392 — end of life: aid in dying, ethics-committee review, death declaration

Program: [scope-state-practice.md](scope-state-practice.md). Depends on spec-v1388 (calendar,
ledger). Group M. Specialties: `palliative-care`, `critical-care`, `nursing-icu`, `health-law`.

Three states now have an aid-in-dying law, and the waiting periods differ by an order of
magnitude: **48 hours** in California, **15 days** in New Jersey, and a **5-day** fill wait in New
York. New York's law took effect **August 5, 2026**, six weeks ago, so a hospice nurse there has no
settled habit yet.

| tile | the reading it prevents |
|---|---|
| `ny-maid-timeline` | New York's wait is from **prescription written to filled**, not between requests |
| `nj-maid-timeline` | the **15-day** gap counted from the written request instead of the first oral one |
| `ca-eoloa-timeline` | the pre-2022 **15-day** wait still applied (SB 380 cut it to 48 hours) |
| `tx-ethics-review-timeline` | the "10-day rule", which has been **25 days** since 2023 |
| `nj-death-religious-exemption` | death declared on neurologic criteria over a documented religious objection |
| `tx-death-cert-deadline` | the medical certification left past its **5-day** limit |

The aid-in-dying tiles **compute dates and check documented steps. They never assess
eligibility for the patient.** Prognosis, capacity, and voluntariness are physician findings and
enter as three-state controls. Each tile says in one sentence that participation is voluntary for
clinicians.

## `ny-maid-timeline` — New York Medical Aid in Dying Steps (PHL Article 28-F)

Inputs: date of the oral request (recorded on video or audio), date of the written request (form
DOH-5847) and its two witnesses, the attending, consulting, and mental-health evaluation dates, and
the date the prescription was written. Output: the next permitted step; the **5-day** wait from
prescription written to filled (waived when death is expected sooner, as the attending certifies);
and the **30-day** expiry of an unfilled prescription, which may be reissued. It also checks the
written request against the six witness disqualifications. Sources: NYSDOH MAID FAQ and the
August 5, 2026 press release. **Volatility high**: regulations are proposed, not final. The ledger
review date is the regulations' adoption.

## `nj-maid-timeline` — New Jersey Medical Aid in Dying Timeline (N.J.S.A. 26:16-10)

Inputs: dates of the first oral, second oral, and written requests. Output: the earliest date a
prescription may be written, as the **latest** of these: **15 days** after the first oral request,
**48 hours** after the written request, and a second oral request at least **15 days** after the
first. The binding constraint is highlighted. Residency proofs are listed as a checklist. Source:
the Act's text as published by NJ Consumer Affairs. Waiver bills are pending, so it gets a ledger row
each session.

## `ca-eoloa-timeline` — California End of Life Option Act Timeline (HSC §443.1–443.3)

Inputs: dates of the two oral requests and the written request, and the two witnesses'
relationships. Output: whether the oral requests are at least **48 hours** apart (SB 380, effective
January 1, 2022), the earliest valid date, and a witness check: two adults, **no more than one**
who is a relative or heir. Eligibility (adult, capacity, resident, able to self-administer, death
"within six months") enters as physician findings. The §443.215 sunset date **did not load in
research**. The tile prints no sunset until it is read from the statute.

## `tx-ethics-review-timeline` — Texas Ethics Committee Review Timeline (HSC 166.046)

Inputs: the date written notice of the meeting was given, the meeting date, the decision date, the
date the start notice was given, and whether a transfer-enabling procedure is requested. Output
(166.046 as amended in 2023): the earliest permitted meeting (**7 days'** written notice), the
**48-hour** notice of the right to counsel, **day 25** after the start notice as the earliest
date life-sustaining treatment may be withdrawn (the 25 days cannot be paused once started), and
the **24-hour** consent window for a transfer-enabling procedure. Contested area: the tile adds
one line pointing to the facility's ethics committee and counsel.

## `nj-death-religious-exemption` — New Jersey Declaration of Death: Religious Exemption (N.J.S.A. 26:6A-5)

Inputs: whether the physician has reason to believe that declaring death on neurologic criteria
would violate the person's religious beliefs. Output: if yes, **death is declared on
cardiorespiratory criteria only**, with the statutory basis. New Jersey is the only state in this
program with such a provision, and an ICU team that moved there from New York will not know it.
The statute text was confirmed from search excerpts; the direct fetch was blocked. **Read the full
text before the build.**

## `tx-death-cert-deadline` — Texas Medical Certification of Death Deadline (HSC 193.005)

Inputs: the date the death certificate was presented to the certifier. Output: medical certification
due **within 5 days**, and who may certify when the attending is unavailable (193.005(a)–(c)).

## Acceptance

- NJ, two tests. First oral request on day 0, written on day 2: the 15-day rule binds (day 15).
  Written on day 14: the 48 hours bind (day 16), not the 15 days.
- The CA tile rejects two oral requests 47 hours apart, and a witness pair made up of two heirs.
- The NY tile shows no prescription date until the oral request, written request, and all three
  evaluations are entered.
- The TX ethics tile never prints a date earlier than day 25.

## Built (2026-09-18)

| tile | source read |
|---|---|
| `ny-maid-timeline` | nysenate.gov, PHL 2899-e and 2899-f |
| `nj-maid-timeline` | N.J.S.A. 26:16-10 (FindLaw, current as of January 1, 2024) |
| `ca-eoloa-timeline` | leginfo, HSC 443.2 and 443.3 |
| `tx-ethics-review-timeline` | official mirror, HSC 166.046 |
| `nj-death-religious-exemption` | N.J.S.A. 26:6A-5 (FindLaw, current as of January 1, 2024) |
| `tx-death-cert-deadline` | official mirror, HSC 193.005 |

- The plan's **30-day expiry** of an unfilled New York prescription is not in 2899-f.
  It came from the Department's FAQ, which was not read, so the tile prints no expiry.
  The five-day wait runs from the date **and time** written (2899-f(3)), so the
  tile counts 120 hours.
- New York witnesses: **both** must be free of all six disqualifications (2899-e),
  unlike California, where only one of the two may be a relative or heir.
- California 443.3(c) reads two ways when one witness is a relative and the other
  works at the treating entity. The tile says so instead of passing or failing the pair.
- 443.215 (the sunset) still did not load; no sunset is printed.
- New Jersey residency proofs (another section) were not read, so no checklist is
  shown. The NJ religious exemption was read in full, as the plan required.
- Texas ethics: the 25 days run from the start notice, or from the procedure named in
  a delay notice, whichever is first. The tile takes one and refuses both at once.
- Acceptance tests pass: NJ day 15 versus day 16, CA 47 hours and two heirs, NY
  with no date before all five steps, and TX never earlier than day 25.

## Update (2026-09-19): no sunset

The sunset question is settled. SB 403 (Stats. 2025, ch. 315, approved October 3, 2025) repealed
section 443.215 and its January 1, 2031 end date; leginfo's bill history and the current text of Part
1.85 (443 through 443.22, no 443.215) were read. `ca-eoloa-timeline` now says the Act has no end
date instead of saying the sunset was not read.

## Update (2026-09-19): the New York 30-day expiry

The Department's Medical Aid in Dying FAQ (health.ny.gov, revised August 2026) loaded with a browser
user agent. It says a prescription the patient does not fill within 30 days expires, and the attending
may re-issue it without restarting the process. `ny-maid-timeline` now states this once a prescription
is written. It computes no expiry date, because the FAQ does not say what the 30 days run from.

## Update (2026-09-19): New Jersey residency

N.J.S.A. 26:16-11 was read (FindLaw, current as of January 1, 2024). No request is granted until the
patient gives the attending one of four proofs of residency: an MVC driver's license or non-driver ID,
proof of voter registration, a New Jersey resident income tax return for the most recent year, or
another government record the attending reasonably believes shows current residency.
`nj-maid-timeline` now lists them. It does not ask which was given.
