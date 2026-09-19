# spec-v1391 — who decides: surrogates, proxies, MOLST, and DNR

Program: [scope-state-practice.md](scope-state-practice.md). Depends on spec-v1388. Group M.
Specialties: `nursing-general`, `palliative-care`, `case-management`, `social-work`, `ems`,
`health-law`. Audiences: clinicians, patients, educators.

At 2 a.m. a patient without capacity needs a consent, and the nurse needs a name. Each state
answers differently, and one of them is often misremembered as a ranked list:

| tile | the reading it prevents |
|---|---|
| `ny-fhcda-surrogate` | skipping a **domestic partner**, who ranks with a spouse |
| `ca-surrogate-decisionmaker` | treating Probate Code §4712(b) as a ranking. **It is not one**; only (a) is ordered |
| `tx-surrogate-consent-hierarchy` | a surrogate consenting to what Texas bars a surrogate from (inpatient mental health, ECT) |
| `ny-health-care-proxy-check` | the agent signing as a witness |
| `ny-molst-checklist-router` | the general checklist used for a person with I/DD, who needs the OPWDD checklist |
| `tx-ooh-dnr-validity` | an EMS crew honoring or refusing an out-of-hospital DNR on a technicality it gets wrong |
| `tx-in-hospital-dnr-pathway` | a DNR entered without the notice 166.204 requires |

**New Jersey is deliberately absent.** It has no general default-surrogate statute (N.J.S.A.
26:14-5 sets an order for research consent only), so a New Jersey finder would invent law.
The NY and CA tiles' notes say this in one line, so a New Jersey reader learns why.

## `ny-fhcda-surrogate` — New York Surrogate Decision-Maker (Family Health Care Decisions Act, PHL 2994-d)

Inputs: who is reasonably available and willing (Article 81 guardian, spouse or domestic partner,
adult child, parent, adult sibling, close friend), and whether a health care proxy exists. Output:
the highest-priority surrogate, per PHL 2994-d(1). An existing proxy agent supersedes the list;
the tile says so and stops. Also prints the FHCDA's standard for withdrawing life-sustaining
treatment as one sentence, without applying it.

## `ca-surrogate-decisionmaker` — California Surrogate Decision-Maker (Probate Code §4711, §4712)

Inputs: a surrogate the patient named orally (§4711), an agent under an advance health care
directive or power of attorney, a conservator, the family and friends available, and any person
the patient disqualified (§4715). Output:

- §4712(a) is a **mandatory priority order**: §4711 surrogate, then agent, then conservator. The
  tile applies it.
- §4712(b) lists spouse or domestic partner, adult child, parent, sibling, adult grandchild, and
  relative or close friend. A surrogate **may be chosen from any of them**; this list is not ranked
  (AB 2338, effective January 1, 2023). The tile lists who is eligible, **never ranks them**, and
  prints the clinician's duty to choose by the statute's factors.

## `tx-surrogate-consent-hierarchy` — Texas Surrogate Consent Finder (HSC 313.004, 166.039)

Inputs: guardian, medical power of attorney agent, spouse, adult children, parents, nearest
living relative (availability of each), the treatment type, and whether the patient is a jail
inmate. Output: who may consent under 313.004(a); whether a **second physician must concur** when
no surrogate is available (166.039(e)); the treatments a surrogate **may not** consent to
(voluntary inpatient mental health, electroconvulsive therapy, appointing another surrogate, and
for inmates psychotropics); and the **120-day** limit for inmate surrogates. **No majority-vote
rule is modeled.** It was not found in the statutes as read; see the scope's rejection table.

## `ny-health-care-proxy-check` — New York Health Care Proxy Validity Check (PHL 2981)

Inputs: signer, two adult witnesses, agent identity, the facility type, and whether the agent is
a facility employee. Output: valid, or a list of defects. The tile checks that there are two adult
witnesses, that the agent is not a witness, and that a facility employee is not the agent unless
related. In an OMH facility, one witness must be unaffiliated, and in a hospital one witness must be
a psychiatrist or psychiatric NP.

## `ny-molst-checklist-router` — New York MOLST: Which Checklist Applies

Inputs: adult or minor, decision-making capacity, proxy, FHCDA surrogate, intellectual or
developmental disability, setting. Output: which NYSDOH legal-requirements checklist applies
(#1–#5, #6 for minors, or the **OPWDD checklist**, which is required for a person with I/DD who
lacks capacity and has no proxy). Also shows the **90-day** review cadence from the 8-step protocol.
Source: NYSDOH MOLST pages, form revised June 2025. Volatility medium.

## `tx-ooh-dnr-validity` — Texas Out-of-Hospital DNR Validity (HSC 166.082–166.092)

Inputs: adult or minor, who executed it (the person, a guardian or agent, a qualified relative, or
two physicians), the witnesses, for a minor the terminal or irreversible diagnosis, and whether the
person currently expresses a contrary wish. Output: valid or not, with the **specific element**
that fails. The answer says plainly that a competent person's contrary wish revokes it. The revocation section (166.092) was not read in this research; confirm it at build.

## `tx-in-hospital-dnr-pathway` — Texas In-Hospital DNR Order Pathway (HSC 166.203, 166.204)

Inputs: patient competent, advance directive present, surrogate present, and whether death is
imminent (minutes to hours) in the physician's judgment. Output: which 166.203(a) pathway applies,
whether a second physician must concur, and the **notice** 166.204 requires before or after entry.
Added by SB 11 (2019); low volatility.

## Acceptance

- The CA tile has a test with three eligible family members and asserts that **no ordering** is
  printed.
- The TX surrogate tile refuses an ECT consent by a surrogate and names 313.004 as the reason.
- NY proxy: a test where the agent is also a witness and the result says "defect", naming it.
- Each tile has a ledger row. The MOLST row names the June 2025 form revision.

## Built (2026-09-18)

| tile | source read |
|---|---|
| `ny-fhcda-surrogate` | nysenate.gov, PHL 2994-b and 2994-d |
| `ca-surrogate-decisionmaker` | leginfo, Probate Code 4711, 4712, 4715 |
| `tx-surrogate-consent-hierarchy` | official mirror, HSC 313.004 and 166.039 |
| `ny-health-care-proxy-check` | nysenate.gov, PHL 2980 and 2981 |
| `ny-molst-checklist-router` | NYSDOH MOLST page (revised June 2025) |
| `tx-ooh-dnr-validity` | official mirror, HSC 166.003 and 166.082-166.092 |
| `tx-in-hospital-dnr-pathway` | official mirror, HSC 166.203-166.205 |

- The "second physician concurs" rule the plan placed at 166.039(e) applies to
  life-sustaining decisions. For ordinary treatment with no surrogate, it is
  313.004(a-1), and both are printed where they apply.
- A physician or NP of a general hospital may be a proxy agent (2981(3)(b)). Only
  the facility's other staff, and clinicians of a mental hygiene facility, need a
  family tie. The check asks which the agent is.
- Section 166.088(a) states no witness requirement when a guardian executes an
  out-of-hospital DNR with the physician, so that route is not failed on witnesses.
  Where a proxy, agent, or parent signs in place of the person, the tile reads
  166.082(b)'s witnesses as still applying and says so.
- 166.204(b): a missed DNR notice does not void the order. The in-hospital tile
  prints the notice duty for an imminent-death order and says so.
- The MOLST 90-day review cadence in the plan was not confirmed (the protocol page
  blocked the fetch). The tile prints the Department's review-on-transition rule instead.
- New Jersey is absent, as planned; the NY and CA tiles say why in one line.

## Built (2026-09-19): the MOLST 90-day review

The 90-day cadence the plan listed is confirmed. health.ny.gov served the MOLST form itself, DOH-5003
(06/25), to a browser user agent. Its Section I: a physician, NP, or PA reviews the MOLST at least every
90 days, and also on a move to another location, a major change in health status, or a change of mind.
`ny-molst-checklist-router` now says so, and adds two things the plan did not have: a MOLST past its
90-day review **stays valid and must be followed**, and for a patient with I/DD **only a physician**
may do the review.
