# spec-v1395 — reporting and consent: reportable conditions, mandated reports, minors, forensic exams

Program: [scope-state-practice.md](scope-state-practice.md). Depends on spec-v1388. Group M.
Specialties: `infectious-disease`, `emergency-medicine`, `pediatrics`, `nursing-er`,
`social-work`, `health-law`.

## `reportable-condition-urgency` — Reportable Disease: Report Now or Later? (NY, NJ, CA, TX)

Inputs: state, condition (a searchable pick list), time identified. Output: the urgency class, the
deadline as a date and time, and to whom (the local health department where the patient lives,
unless the state says otherwise).

| State | Source and edition | Classes |
|---|---|---|
| NY | DOH-389 instructions, rev. 08/26 (10 NYCRR 2.10) | Immediately by phone (about 35 conditions, e.g. measles, meningococcal disease, TB, syphilis); all others **within 24 h**. Syphilis goes by phone for a nontreponemal titer **≥1:16**, any prenatal or delivery positive, or primary or secondary stage |
| NJ | N.J.A.C. 8:57-1.5 | 18 immediately by phone (including pertussis, hepatitis A, Hib, measles); the rest within 24 h. **Blocked:** the 2024 amendment (56 N.J.R. 213(a)) must be read before the NJ list ships |
| CA | 17 CCR §2500, CDPH list June 2025 | Immediately by phone (measles, mpox, invasive meningococcal, novel influenza …); **1 working day** (syphilis, TB, pertussis; acute HIV by phone); **7 calendar days** (coccidioidomycosis, chronic HBV/HCV) |
| TX | DSHS *Notifiable Conditions 2026* (rev. 01/01/26) | Call immediately (measles; lead at any level by call or fax); **1 work day** (Vibrio, typhus, Chagas); **1 week** (TB infection, arboviral including dengue and West Nile); **1 month** and **10 work days** for the rest |

Each state's list is data (`data/reportable-conditions/<state>.json`) with its edition in the
manifest. The answer prints the edition. **Texas reissues its list every January.** That is under
the 12-month rule, so TX ships only with a ledger row due every January 1, and the gate fails if the
row goes stale. Build from each state's **PDF text**, never a summary. In research, a summarizer
misread measles as "1 working day" and Vibrio as "1 week".

## `mandated-report-router` — Mandated Report: To Whom and How Fast (NY, NJ, CA, TX)

Inputs: state, the victim (child; elder or dependent adult; long-term-care resident; and for CA an
injury from a firearm or assaultive conduct), whether there is serious bodily injury, and the
reporter's role. Output: the agency, the phone deadline, and the written deadline.

| State | Rule |
|---|---|
| NY | SSL 415: child abuse **immediately** by phone to the Statewide Central Register, written within **48 h**. PHL 2803-d: nursing-home abuse immediately to DOH, written within 48 h |
| NJ | N.J.S.A. 9:6-8.10: **any person**, immediately, to the state hotline. N.J.S.A. 52:27D-409: health professionals report vulnerable-adult abuse to county Adult Protective Services |
| CA | PC §11166: child, by phone immediately, written within **36 h**. WIC §15630: elder or dependent adult, by phone immediately, written within 2 working days; in long-term care with serious bodily injury, **police within 2 h**, written within 24 h. **PC §11160**: injuries from a firearm or assaultive conduct, including domestic violence, by phone immediately, written within 2 working days. This duty is California's alone |
| TX | Family Code 261.101(b): a professional reports child abuse **within 24 h**, and the duty cannot be delegated (**SB 571, effective June 20, 2025**; it was 48 h). Human Resources Code 48.051: elderly or disabled adult, immediately |

The Texas 24-hour change is fifteen months old. A nurse trained under 48 hours is now late on
the second day. The tile states the change in one sentence.

## `ny-hiv-hcv-test-offer` — New York Required HIV and Hepatitis C Test Offer (PHL 2781-a, 2171)

Inputs: age, setting (inpatient, ED, primary care), prior offer documented, life-threatening
emergency, and capacity. Output: whether an HIV offer is required (**age 13+**) and whether an HCV
offer is required (**age 18+**), with each exception. For a reactive HCV antibody, the law requires
an **HCV RNA** test and follow-up care or referral. That links to `hcv-test-sequence`
(spec-v1400). There is no NY hepatitis B offer law; research found none. The tile says so rather
than implying one.

## `minor-self-consent` — Can This Minor Consent Alone? (CA, TX)

Inputs: state, age, living situation, managing own finances, and service (outpatient mental
health, SUD treatment, STI or reportable disease, pregnancy care, contraception, sexual assault
exam, active duty). Output: may consent alone / may not, the section, and any parent-notice rule.

- **CA** Family Code §6922 (15+, living apart, managing own money), §6924 (12+, outpatient mental
  health if mature enough), §6925 (pregnancy, any age; AB 260, effective September 26, 2025),
  §6926 (12+, STI or reportable disease), §6927 (12+, rape), §6929 (12+, SUD; replacement
  narcotic therapy excluded).
- **TX** Family Code 32.003(a)–(f): active duty; 16+ living apart and managing own affairs;
  reportable infection; pregnancy (**not abortion**); drug or chemical dependency; an unmarried
  parent consenting for their own child. The provider may still tell the parents.

NY and NJ minor-consent law was not researched. They are added in a later wave, not guessed.

## `tx-sa-forensic-exam-window` — Texas Sexual Assault Forensic Exam Eligibility (CCP ch. 56A, HSC 323.004)

Inputs: age, hours since the assault, law-enforcement referral, and whether this ED is a
SAFE-ready facility. Output: exam eligible (minors at any time; adults **within 120 hours**, or
later on referral), the required services, and, for a non-SAFE-ready facility, the transfer duty.

## `ca-adverse-event-1279` — California Reportable Adverse Event (HSC §1279.1)

Inputs: event category (the **28** enumerated events, including a stage 3 or 4 pressure injury, a
fall resulting in death or serious injury, and neonatal bilirubin over 30), and whether there is an
ongoing urgent threat. Output: reportable or not; report to CDPH **within 5 days**, or **24 h** for
an ongoing urgent or emergent threat.

## Acceptance

- `reportable-condition-urgency` ships per state. NJ ships only after the 2024 amendment is read,
  and the tile offers only the states it has.
- A TX test for measles (call immediately) and one for Vibrio (1 work day). These are the two
  a summarizer got wrong.
- `mandated-report-router`: a CA test for a gunshot wound in an adult with no abuse suspected,
  which must still route to PC §11160.

## Built (2026-09-18): `mandated-report-router` and `ny-hiv-hcv-test-offer`

Catalog 1,741 → 1,743. Every rule was read from its source: nysenate.gov (SSL 415, PHL 2803-d,
2781-a, 2171), FindLaw (N.J.S.A. 9:6-8.10, 52:27D-409), leginfo (Penal Code 11166, 11160; WIC 15630),
the S.B. 571 enrolled bill, and the official Texas statutes mirror (tcss.legis.texas.gov: Family Code
261.101, Human Resources Code 48.051). What the text changed from the table above:

- **California's long-term-care police call is two hours in every case but one.** WIC
  15630(b)(1)(A): a verbal report to local law enforcement "no longer than two hours", with written
  reports within 24 hours, *unless* the abuse was by a resident with physician-diagnosed dementia and
  there was no serious bodily injury (then written reports within 24 hours only). The plan tied the
  two hours to serious bodily injury, which would under-report.
- **The Texas 24-hour change is S.B. 571 section 1.30**, confirmed in the enrolled bill ("24th [48th]
  hour"); the professional may not delegate the report.
- **New Jersey's vulnerable-adult section (52:27D-409) sets no time limit.** The tile says so. New
  Jersey's long-term care route (the Ombudsman) is not included until its statute is read.
- New York's community-elder case has no mandated-report rule in the sections read; the tile says
  that, rather than claiming New York has none.
- New York's HIV (13+) and hepatitis C (18+) offers share three exceptions; a reactive HCV screen
  is followed by an HCV RNA test and care or referral. There is no New York hepatitis B offer law in
  these sections.

## Built (2026-09-18): `ca-adverse-event-1279`, `tx-sa-forensic-exam-window`, `minor-self-consent`

Catalog 1,743 → 1,746. Read from leginfo (HSC 1279.1; Family Code 6922-6929) and the official Texas
mirror (CCP 56A.303, HSC 323.004, Family Code 32.003).

- **1279.1 lists a fall only when it causes death** ((b)(5)(D)); a fall causing serious disability is
  reported through the (b)(7) catch-all. The 28 events are 27 enumerated plus that catch-all. The
  patient is told by the time the report is made.
- **The Texas examination** is required for a minor whenever they arrive and for an adult within 120
  hours, or later on referral by law enforcement or by a physician, sexual assault examiner, or nurse
  examiner after a preliminary evaluation. A facility that is not SAFE-ready has its own duties,
  including written consent to a transfer and a call confirming an examiner is available.
- **Contraception is not pregnancy care in Texas.** 32.003(a)(4) covers a pregnant child's pregnancy
  care, other than abortion; it has no contraception ground, so the tile separates the two services.
  California's 6925 covers both, and since AB 260 (2025) excludes only sterilization. 6929(e)(2) lets
  a 16-year-old consent to opioid use disorder medication in a licensed program where federal law
  expressly permits. Texas 32.003 also has a ground for a child confined by the Department of
  Criminal Justice.
- **Texas sexual assault consent for a minor** runs through CCP 56A.303, which points to Family Code
  32.003 and 32.005; 32.005 was not read, so the tile names the routes and does not decide.

`reportable-condition-urgency` (built from each state's PDF) is still to come.

## Built (2026-09-19): `reportable-condition-urgency`, California and Texas

- Transcribed from the PDFs themselves: CDPH's June 2025 Title 17 list (94
  conditions; the counts of each urgency marker were checked against the PDF text)
  and DSHS's *Texas Notifiable Conditions 2026* (89 conditions, rev. 01/01/26,
  expires 12/31/26). The lists live in the library, with the edition printed on
  every answer.
- **Corrected from the plan:** in Texas, Chagas disease and typhus are **within one
  week**, not one work day. The plan's summary had them wrong, which is why this tile
  was never going to ship from a summary. Measles is call immediately and Vibrio one
  work day, and tests pin all four.
- "Within one working day" is read as the same clock time on the next working day of
  that state's legal-holiday calendar, the earliest reading, and the tile says so.
- New York (the DOH-389 guidance returned 403) and New Jersey (the 2024 amendment was
  not read) are not offered. The tile offers only the states it has.

### Why New York and New Jersey are still not offered (checked 2026-09-19)

- **New York:** 10 NYCRR 2.10 (Cornell LII) sets one deadline for every disease listed in 2.1:
  within 24 hours of first seeing the case, by telephone, fax, or electronic transmission, plus a
  written report. The shorter "immediately by telephone" list is in the Department's DOH-389
  instructions, which returned 403 again. Shipping New York on the regulation alone would print
  24 hours for conditions the Department wants phoned in at once, so it waits for DOH-389.
- **New Jersey:** Cornell's copy of N.J.A.C. 8:57-1.5 says the adopted 2024 version (56 N.J.R.
  213(a), effective January 3, 2024) "is not yet available". The text shown predates it, so New
  Jersey waits for the current text.

## Built (2026-09-19): `reportable-condition-urgency`, New York

The note above is superseded for New York. health.ny.gov serves its files to a browser user agent,
so the Department's *Communicable Disease Reporting Requirements* (#8218, dated 08/26, the
instructions for form DOH-389) was read.

- The page says diseases "listed in red bold type" are reported immediately by phone. Plain text
  loses color, so the red entries were read from the PDF's text colors (CMYK 0/1/1/0): 31
  diseases, plus syphilis, whose footnote narrows the phone report. They include measles, diphtheria, meningococcal disease, current tuberculosis, hepatitis A in a food
  handler, encephalitis, foodborne illness, and an animal bite for which rabies prophylaxis is given.
- Every other listed disease is due within 24 hours of first seeing the case (10 NYCRR 2.10).
- Footnotes kept: notify the local health department before starting rabies prophylaxis; syphilis
  goes by phone for a nontreponemal titer of 1:16 or more, any positive prenatal or delivery test, or
  primary or secondary stage; Creutzfeldt-Jakob disease and other TSEs also go to the State registry
  on suspicion; HIV and AIDS go on form DOH-4189. Two entries the form marks "proposed addition to
  list" (vancomycin-resistant *S. aureus*, vibriosis) are labeled so.
- New Jersey is still not offered.

## Built (2026-09-19): `reportable-condition-urgency`, New Jersey

nj.gov served the Department's *Communicable Disease Reporting Requirements for Health Care
Professionals & Administrators* (January 2026), which cites N.J.A.C. 8:57-2.2 to 2.4, the numbering
after the 2024 amendment. The rule text is on LexisNexis and was not read; the tool names its source
as the Department's summary.

- Two classes: **immediately by telephone** (21 diseases, plus an outbreak of any communicable
  disease, bioterrorism, or a potential public health emergency) and **by the next business day** to
  the local health department by eCR or CDRSS. Chlamydia, influenza other than pediatric deaths, and
  Lyme disease are eCR only. STDs and tuberculosis go to NJDOH via CDRSS; HIV by electronic lab report.
- **Changed from the plan:** the plan's "18 immediately by phone (including pertussis, hepatitis A,
  Hib, measles); the rest within 24 h" was the pre-2024 rule. Under the current summary pertussis is
  next business day, while hepatitis A, invasive *H. influenzae*, and measles stay immediate.
- "By the next business day" is read as the same clock time on the next business day, the tool's
  earliest-reading rule, and the answer says so.

## Built (2026-09-19): `minor-self-consent`, New York and New Jersey

The note above ("NY and NJ minor-consent law was not researched") is superseded.

| state | read | may consent alone |
|---|---|---|
| NY | PHL 2504, 2305; MHL 33.21, 22.11 (nysenate text via newyork.public.law, updated August 8, 2025) | prenatal care at any age; STI care under 21 without parental knowledge; outpatient mental health and chemical dependence treatment **only on documented grounds** (a parent unavailable, involvement detrimental, or a refusal overridden by a physician); a minor who is a parent, married, or a homeless youth consents to everything |
| NJ | N.J.S.A. 9:17A-1, 9:17A-4 (FindLaw, current as of January 1, 2024) | pregnancy care; STI at any age and HIV from 13; care after apparent sexual assault (parents told unless not in the patient's best interests); substance use treatment, confidential; temporary outpatient behavioral health from 16, no medication |

- A third answer, "Not settled by the sections read here", is new. New York contraception, abortion,
  and care after sexual assault, New Jersey contraception and abortion, and New Jersey opioid
  treatment programs get it rather than a guess.
- New York's conditional grounds get their own answer, "Only if the grounds are documented".
- New Jersey's 9:17A-1 refers to a 1999 parental-notification law (C.9:17A-1.1). Its status was not
  read, so the tool does not apply it.

## Update (2026-09-19): Texas Family Code 32.005

32.005 was read on the official mirror. A physician, dentist, or psychologist with reasonable grounds
to believe abuse or neglect may examine a child without anyone's consent, including X-rays, blood
tests, and photographs, except a child 16 or older who refuses or where a court order prohibits it.
`minor-self-consent` now answers the Texas sexual-assault question with that rule ("Only if the
grounds are documented") instead of saying 32.005 was not read.
