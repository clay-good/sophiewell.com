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
