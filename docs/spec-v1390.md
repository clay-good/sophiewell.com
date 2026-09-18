# spec-v1390 — hold criteria and court-ordered outpatient treatment

Program: [scope-state-practice.md](scope-state-practice.md). Depends on spec-v1388. Group M.
Specialties: `psychiatry`, `nursing-psych`, `social-work`, `health-law`.

spec-v1389 answers *when*. These four answer *whether the statutory elements are documented*.
They are the tiles where the incomplete-input rule matters most. **Every criterion is a
three-state control**, and an unassessed element withholds both verdicts:

| tile | the reading it prevents |
|---|---|
| `ny-aot-kendras-law` | "two hospitalizations" read as lifetime; the statute says **within 36 months**, extended by recent confinement |
| `ca-grave-disability-sb43` | the pre-2024 definition applied, missing **severe SUD alone**, **personal safety**, and **necessary medical care** |
| `ca-care-court-eligibility` | bipolar I with psychotic features treated as ineligible (it has qualified since SB 27, 2026) |
| `tx-emergency-detention-criteria` | the pre-September 2025 criteria used after SB 1164 rewrote them |

## `ny-aot-kendras-law` — New York Assisted Outpatient Treatment (Kendra's Law) Criteria (MHL 9.60)

Inputs: age, the seven 9.60(c) criteria (three-state), dates of psychiatric hospitalizations and
incarcerations, date of any violent act or threat, date any earlier AOT order expired, and dates
of any current or recent confinement. Output: each criterion met / not met / not assessed, and
overall "meets 9.60(c)", "does not meet", or "incomplete: waiting for …".

History prong, verified against MHL 9.60(c)(4): **two or more** hospitalizations or incarcerations
**within 36 months**, **or** an act, threat, or attempt of serious violence **within 48 months**,
**or** an AOT order that expired **within the last 6 months**. The lookback is **extended** by
any current confinement or one that ended in the past 6 months. The tile computes the extended
window from the entered dates and shows it. Initial order: up to **1 year**.

## `ca-grave-disability-sb43` — California Gravely Disabled Definition After SB 43 (WIC §5008(h))

Inputs: cause (mental disorder / severe substance use disorder / co-occurring), and each unmet
need (food, clothing, shelter, **personal safety**, **necessary medical care**) as three-state
controls. Output: whether the documented findings meet §5008(h)(1)(A) as amended. "Severe"
means the DSM-5 severity specifier; the tile says so and does not compute DSM criteria. Counties
could defer implementation to January 1, 2026; that date has passed, so the tile applies the
amended definition statewide and prints the history in one sentence.

## `ca-care-court-eligibility` — California CARE Court Eligibility (WIC §5972, as amended by SB 27)

Inputs: the §5972 criteria (a)–(f) as three-state controls. That covers age 18 or older; a
diagnosis in the schizophrenia spectrum **or bipolar I with psychotic features** (SB 27, effective
January 1, 2026); not clinically stabilized in ongoing voluntary treatment; the danger or
deterioration element; and CARE as the least restrictive alternative. Output: qualifies / does not
/ incomplete, **naming the failing criterion**. Exclusions are stated in the answer: psychosis
due to intoxication and SUD alone do not qualify. Volatility **high**: ledger review each January.

## `tx-emergency-detention-criteria` — Texas Emergency Detention Criteria Checklist (HSC 573.001, 573.012, 573.022)

Three sections, each a checklist of the statutory elements as three-state controls:
peace-officer apprehension without a warrant (573.001(a)), a magistrate's warrant on
application (573.012(b)), and the physician's written statement (573.022(a)). Output: which
elements are documented and which are missing, for each path. The two criteria SB 1164 added
(effective September 1, 2025) are separate items so a pre-2025 form is visibly incomplete:
**severe emotional distress with deterioration**, and **inability to recognize symptoms or
appreciate the risks of not being treated**.

## Acceptance

- Each tile has three worked examples: meets, does not meet, and incomplete. The incomplete example
  must name the missing criterion and print neither verdict.
- Kendra's Law: a test where the second hospitalization falls at month 38. It fails the 36-month
  test alone and passes once a 3-month confinement that ended 4 months ago extends the window by its length.
- `no-answer-from-nothing-sweep` and `required-field-agreement` both pass with no ledger exception.
