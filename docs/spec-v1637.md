# spec-v1637 — Federal pharmacy law as arithmetic: controlled substances, supply chain, product identifiers and packaging limits

**Status:** Proposed, October 10, 2026. Specs only; nothing here is built. 24 new tools, 1 of them build-gated (`dea-number-check`).
**Charter:** [spec-v1627](spec-v1627.md). **Machinery:** [spec-v1628](spec-v1628.md). **Ledger:** [scope-pharmacy-practice.md](scope-pharmacy-practice.md).

The pharmacist-in-charge, the compliance officer and the receiving technician spend their day
on federal rules that are really counts and dates: when the next controlled-substance inventory
is due, whether an order form is still valid, how many boxes of pseudoephedrine one buyer may
take home, what the barcode on a carton says, and how many packages of a suspect lot to check.
This wave turns 24 of those rules into tools, each read in the eCFR, the U.S. Code or the
agency's own document on October 10, 2026. All tools are group **Q**.

Everything here is the **federal floor**. A state rule can be stricter; each tool says so and
takes the state value as reader input where one commonly exists.

## Gap finder

**Method.** Enumerated 21 CFR parts 1301, 1304, 1305, 1306, 1307, 1314 and 1317 section by
section for any rule with a number, a date or a yes/no test; then 42 CFR 8.12 (opioid treatment
programs), section 582 of the FD&C Act (21 U.S.C. 360eee-1, dispenser duties), 21 CFR 201/207/211
(expiration dating and the NDC), 16 CFR 1700.14 (child-resistant packaging), 40 CFR 262.13 and
part 266 subpart P (hazardous waste pharmaceuticals), and the GS1 General Specifications
(release 26.0). Companion sweep: every Federal Register rule from DEA and FDA since January
2025 that touches those parts. Catalog check: grepped `catalog.tsv` for each idea by rule
number, drug, synonym and output, then grepped `lib/` and `views/` for the CFR citations
(`1306.26`, `1307.11`, `1314.20`, `1700.14`, `1305.13`, `1301.76`, `1304.11`, `360eee`, `GTIN`,
`pseudoephedrine`): no hits. No id below is live, and none is specified in another spec of this
program.

**Live in this domain:** `days-supply`, `refill-eligible-date`, `cs-refill-validity`,
`c2-fill-deadlines`, `c2-multiple-rx-series`, `ipledge-dispense-window`,
`imid-rems-fill-window`, `compounding-bud`, `ndc-convert`, `npi-validate`, `mbi-validate`,
`substitution-check`, `acute-opioid-rx-limit`, `tx-aprn-pa-controlled-delegation`,
`drug-wastage`, `breach-clock`.

| Proposed | Live neighbor | Difference |
|---|---|---|
| `dea-number-check` | `npi-validate`, `mbi-validate` | Different identifier and checksum; nothing checks a DEA number |
| `dea-registration-renewal` | none | Registration expiry and renewal window; no live tool |
| `cs-biennial-inventory` | none | Inventory due date and count method |
| `cs-record-retention` | `breach-clock` (HIPAA) | Retention end dates for DEA, CMEA and DSCSA records; HIPAA clocks are elsewhere |
| `dea-222-validity` | `c2-fill-deadlines` | That tool times a patient's C-II prescription; this times a supplier order form |
| `cs-theft-loss-clock` | `breach-clock`, `mandated-report-router` | Different rule (21 CFR 1301.76(b)) and different clocks |
| `cs-five-percent-rule` | none | Dosage-unit share distributed vs dispensed |
| `cs-rx-transfer-check` | `cs-refill-validity` | That tool counts refills left; this decides whether a transfer is allowed and what to record |
| `c2-rx-form-check` | `c2-fill-deadlines` | That tool gives the 7-day follow-up deadline; this decides which form of prescription may be dispensed from |
| `c5-otc-sale-limit` | `cs-refill-validity` ([spec-v1511](spec-v1511.md) noted 1306.26 is not refills) | Nonprescription C-V quantity in 48 hours; unbuilt |
| `cmea-sales-limit` | none | Pseudoephedrine/ephedrine base grams per day and per 30 days |
| `otp-take-home-limit` | `days-supply` | Treatment-day ladder for methadone take-homes; not a supply calculation |
| `otp-admission-clock` | none | Opioid treatment program exam and interim-treatment clocks |
| `oud-telemedicine-rx-window` | none | Six-calendar-month and seven-day limits, plus a dated temporary rule |
| `mat-injection-admin-deadline` | none | 45 days from the practitioner's receipt |
| `cs-disposal-clock` | none | Reverse-distributor and long-term-care disposal deadlines |
| `gs1-drug-barcode-parser` | `ndc-convert`, `x12-*-reader` | Reads a GS1 element string from a drug package; no live tool reads a barcode |
| `ndc-gtin-convert` | `ndc-convert` | GTIN check digit and the NDC inside a GTIN; `ndc-convert` handles only 10 and 11 digits |
| `dscsa-dispenser-clocks` | none | 24-hour, 2-business-day and 6-year clocks |
| `dscsa-suspect-sample-size` | none | "3 packages or 10 percent, whichever is greater" |
| `dscsa-small-dispenser-check` | none | Dated exemption test |
| `unit-dose-repack-expiry` | `compounding-bud` | That tool is USP compounding limits; this is FDA's repackaging policy (6 months or 25%) |
| `pppa-special-packaging-check` | `elemental-iron-ingested` (G, toxic dose) | Package-content thresholds for child-resistant packaging; not a toxicity tool |
| `hw-generator-category` | none | Hazardous waste generator category by monthly kilograms |

## Tools

### 1. `dea-number-check` — DEA Registration Number Format Check

**Input.** The DEA number, and optionally the registrant's last name or business name.
**Compute.** Structure: two characters then seven digits. Checksum: (d1 + d3 + d5) +
2 × (d2 + d4 + d6); the last digit of that total must equal d7. If a name is given, the second
character is compared with its first letter.
**Output.** Well-formed or not, with the arithmetic shown, and the standing statement that a
passing check does not show the registration is real or active.
**Source.** DEA, *Pharmacist's Manual* (EO-DEA154R1, revised 2022), p. 43, "Construction of a
Valid DEA Registration Number for Practitioners":
https://www.deadiversion.usdoj.gov/GDP/(DEA-DC-046R1)(EO-DEA154R1)_Pharmacist's_Manual_DEA.pdf
**Build gate (admission rule 2 of [spec-v1500](spec-v1500.md)).** The manual states the letters
(A before October 1, 1985; B or F after; M for mid-level practitioners; the second letter
"almost always" the first letter of the last name) and "a computer generated sequence of seven
numbers (such as MJ3614511)." It does **not** state the checksum. Its one example, MJ3614511,
satisfies the formula above. A second search on October 10, 2026 found no DEA statement of the
arithmetic:

| Read | Result |
|---|---|
| DEA *Pharmacist's Manual*, 2022, 2010 and 2004 editions (the two older ones from the Internet Archive copy of deadiversion.usdoj.gov) | Letters and the MJ3614511 example; no checksum. The 2004 edition says the second letter "is" the last-name initial; 2010 and 2022 say "almost always" |
| DEA *Practitioner's Manual* (2023) and the archived 2006 edition | No description of the number at all |
| DEA registration page and registration Q&A page | No description of the number |
| DEA registration validation tool (login page) | Redirects to a login; nothing public |
| Federal Register full text, "DEA number" with "check digit" or "checksum" | 4 hits, all HHS provider-identifier rules (63 FR 25320, 69 FR 3434, 77 FR 22950, 77 FR 54664); none states the arithmetic and none is DEA |
| Web search limited to federal and state .gov domains (HHS, CMS, GAO, OIG, DOJ, VA, DoD, state Medicaid) | No agency document with the arithmetic |
| A drug distributor's operating procedure filed as an exhibit on a federal court site (files.cand.uscourts.gov, AL-SF-00096) | States the formula with a worked example (RW0184159). A private company's document, not an agency's |
| Gabay M, "Federal Controlled Substances Act: Controlled Substances Prescriptions," *Hospital Pharmacy* 2013 (PMC3847977) | States the formula. A journal article, not DEA |

So the formula appears only in non-DEA copies. **Owner decision:** either (a) accept a formula
that every DEA-printed example obeys and that a peer-reviewed pharmacy-law article states, and
ship with the source line "DEA does not publish this check; formula as stated in Gabay 2013;
DEA's own example satisfies it"; or (b) hold the tool until DEA prints the rule. Under (a) the
copy must say "second letter almost always," never "must," and a mismatch is a note, not a
failure. The full first-letter list (G, P, R, X and others) was not read on a DEA page: see
Verify at build.

### 2. `dea-registration-renewal` — DEA Registration Expiration and Renewal Window

**Input.** The expiration date on the certificate; today's date; optionally the date a
renewal application was submitted. For a new registrant: the registration date and the
assigned expiration month.
**Compute.**
- Expiration is the last day of the assigned month (21 CFR 1301.13(d)).
- Earliest renewal application: not more than 60 days before expiration (1301.13(b)); 120 days
  for bulk manufacturers and importers of Schedule I or II.
- Automatic extension: an application filed at least 45 days before expiration keeps the
  registration in effect until DEA acts (1301.36(i)).
- Next cycle: 36 months from the prior expiration for a retail pharmacy, hospital/clinic,
  practitioner, emergency medical services agency or teaching institution. The first period
  is not less than 28 nor more than 39 months from registration (1301.13(d)).
- Reinstatement: DEA policy allows it "for one calendar month after the expiration date"; after
  that a new application is required. No controlled substance may be handled on an expired
  registration at any time.
**Output.** The four dates (earliest application, 45-day mark, expiration, end of the
reinstatement month) and where today falls.
**Source.** 21 CFR 1301.13(b), (d); 1301.36(i); DEA registration page
https://www.deadiversion.usdoj.gov/drugreg/registration.html
**Note.** The one-calendar-month reinstatement is DEA policy on a web page, not a regulation:
route B with a page watch. A 2025 DEA conference slide says a number is retired when no
renewal arrives "within 30 days of the expiration date"; the tool uses the policy page and
shows both statements. The eCFR on October 10, 2026 prints paragraph (d) of 1301.13 twice, once
with and once without emergency medical services agencies; the numbers are the same in both.

### 3. `cs-biennial-inventory` — Controlled-Substance Inventory Due Date and Count Method

**Input.** Date of the last inventory; optionally, for a newly scheduled drug, the rule's
effective date; and for a container: schedule, opened or sealed, labeled count.
**Compute.**
- Next inventory due: "on any date which is within two years of the previous biennial
  inventory date" (21 CFR 1304.11(c)). The tool gives the last permitted date and days left.
- Newly controlled substance: inventory on the effective date of the scheduling rule
  (1304.11(d)).
- Count method for an opened commercial container (1304.11(e)(6)): Schedule I or II, exact
  count or measure. Schedule III, IV or V, an estimate, unless the container holds more than
  1,000 tablets or capsules, then exact.
- The inventory must say whether it was taken as of opening or as of close of business
  (1304.11(a)).
**Output.** The due date, the count method for the container, and the retention date
(at least two years, 1304.04(a)).
**Source.** 21 CFR 1304.11(a), (c), (d), (e)(6); 1304.04(a).
**Scope.** Many states require an annual inventory; the reader may enter a shorter state
interval and the tool reports the earlier date.

### 4. `cs-record-retention` — Federal Pharmacy Record Retention Date

**Input.** Record type and its date (for refill transfers, the date of the last refill).
**Compute.** Earliest date the federal rule stops requiring the record:

| Record | Kept for | Counted from | Rule |
|---|---|---|---|
| Any controlled-substance inventory or record | at least 2 years | date of the inventory or record | 21 CFR 1304.04(a) |
| DEA Form 222 (executed) | 2 years | the form | 1305.17(c) |
| Electronic (CSOS) order and linked records | 2 years | the order | 1305.27 |
| C-III to C-V prescription transferred for refills | 2 years | date of last refill | 1306.25(c) |
| Electronic prescription transferred for first fill | 2 years | date of transfer (both pharmacies) | 1306.08(h) |
| Pseudoephedrine/ephedrine logbook entry | not fewer than 2 years | date the entry is made | 1314.30(e); 21 U.S.C. 830(e)(1)(A)(vi) |
| DSCSA transaction information and statement (and history, for transactions before November 27, 2023) | not less than 6 years | the transaction | 21 U.S.C. 360eee-1(d)(1)(A)(iii); (k)(1) |
| DSCSA suspect-product investigation record | not less than 6 years | conclusion of the investigation | 360eee-1(d)(4)(A)(iv) |
| DSCSA illegitimate-product disposition record | not less than 6 years | conclusion of the disposition | 360eee-1(d)(4)(B)(v) |

**Output.** "Federal law requires this record until [date]," the rule, and a standing line that
state law, Medicare and Medicaid contracts and litigation holds commonly run longer; a reader-
entered longer period wins.
**Source.** The sections in the table.
**Note.** The duty to provide and receive transaction history ended November 27, 2023
(360eee-1(k)(1)); records already captured keep their 6-year period.
**Scope.** HIPAA and Medicare Part D retention belong to other waves
([spec-v1638](spec-v1638.md) for Part D); this tool only names them.

### 5. `dea-222-validity` — DEA Form 222 and CSOS Order Validity

**Input.** Date the purchaser executed the order; paper Form 222 or electronic (CSOS);
shipment dates so far; whether the purchaser is a Defense Logistics Agency procurement officer.
**Compute.** No order is valid more than 60 days after its execution by the purchaser. A
partly filled order may be completed by further shipments within 60 days following the date of
the form (paper: 21 CFR 1305.13(b); electronic: 1305.22(e)). Defense Supply Center orders:
partial shipments not to exceed six months from the date of the order (1305.13(f), 1305.22(h)).
A supplier that does not report to ARCOS sends its copy to DEA at the close of the month in
which the order is filled, or in which the final shipment is made or the 60 days run out
(1305.13(d)).
**Output.** Last valid shipment date, days left, whether each listed shipment was in time, and
the month-end copy deadline where it applies.
**Source.** 21 CFR 1305.13, 1305.22.
**Note.** The rule gives no time of day; the tool counts calendar days and treats day 60 as valid.

### 6. `cs-theft-loss-clock` — Theft or Significant Loss Report Clock (DEA Form 106)

**Input.** Date of discovery; practitioner/pharmacy or non-practitioner registrant; optional
list of days the business is closed.
**Compute.** Written notice to the DEA Field Division Office within one business day of
discovery. A complete and accurate Form 106, filed online, within 45 days after discovery
(21 CFR 1301.76(b) for practitioners and pharmacies; 1301.74(c) for non-practitioners).
The clock starts at **discovery**, not at the loss.
**Output.** Both deadlines, and the six factors 1301.76(b) lists for deciding whether a loss is
"significant," shown as a checklist that the reader answers. The tool does not decide
significance.
**Source.** 21 CFR 1301.76(b) as amended at 88 FR 40712 (June 22, 2023); 1301.74(c).
**Note.** "Business day" is not defined in 21 CFR 1300.01. The tool skips Saturdays, Sundays
and federal holidays, says so, and lets the reader override. The 45 days are calendar days:
1301.74(c) says "45 calendar days"; 1301.76(b) says "45 days."

### 7. `cs-five-percent-rule` — Five Percent Rule: Distribution Without a Distributor Registration

**Input.** For the calendar year: total dosage units of all controlled substances dispensed,
total distributed to other registrants under 21 CFR 1307.11 and 1301.25, and (retail pharmacy
only) units sent to its own automated dispensing systems at long-term care facilities.
Optional: a planned transfer.
**Compute.** Share = distributed ÷ (distributed + dispensed), with long-term-care automated
dispensing system distributions excluded from the distributed count (1307.11(c)). The limit is
5% of the total "distributed and dispensed" in the same calendar year (1307.11(a)(1)(iv)).
Also: headroom = the largest further distribution d that keeps
(D + d) ÷ (D + d + P) ≤ 0.05, which is d = (0.05·P − 0.95·D) ÷ 0.95, rounded down.
**Output.** The percentage, dosage units of headroom left this year, whether the planned
transfer fits, and the rule's consequence: a practitioner with reason to believe the share
will pass 5% must obtain a distributor registration (1307.11(b)).
**Source.** 21 CFR 1307.11.
**Note.** The denominator is distributed **plus** dispensed, not dispensed alone; a build that
divides by dispensed is wrong. "Dosage unit" is not defined in part 1300; the tool counts
whatever the reader's records count and says so. Schedule I or II transfers also need a
Form 222 (1307.11(a)(1)(iii)).

### 8. `cs-rx-transfer-check` — May This Controlled-Substance Prescription Be Transferred?

**Input.** Schedule; whether the prescription has been filled at least once; paper/oral or
electronic; whether it has been transferred before; whether the two pharmacies share a
real-time online database; whether state law allows the transfer (reader input).
**Compute.**
- Never filled, electronic, Schedule II to V: one transfer between retail pharmacies, at the
  patient's request, in electronic form only, unaltered; refills on a C-III to C-V
  prescription travel with it (21 CFR 1306.08(e)–(g)).
- Never filled, paper or oral: no DEA regulation provides for the transfer. DEA's preamble says
  its rules address transfer "for refill dispensing, but not for initial dispensing," and that
  an unfilled paper prescription can be handed back to the patient (88 FR 48365). The tool says
  so.
- C-III to C-V, for refill dispensing: one transfer; pharmacies sharing a real-time online
  database may transfer up to the maximum refills permitted by law and the prescriber's
  authorization (1306.25(a)).
- Filled C-II: nothing to transfer (no refills, 1306.12(a)).
- Both rules apply only if state law allows (1306.08(g), 1306.25(e)).
**Output.** Allowed or not, with the reason; the items each pharmacist must record
(1306.08(f)(4)–(5); 1306.25(b)); and the retention date (two years from the transfer, or from
the last refill).
**Source.** 21 CFR 1306.08(e)–(i) (added at 88 FR 48365, July 27, 2023, effective
August 28, 2023), 1306.25.

### 9. `c2-rx-form-check` — Which Form of a Schedule II Prescription May Be Dispensed From?

**Input.** How the prescription arrived (signed paper, electronic, fax, oral); and for fax or
oral: narcotic compounded for direct parenteral or intraspinal infusion; resident of a
long-term care facility; hospice patient (Medicare-certified or state-licensed program);
emergency.
**Compute.** Signed paper or a compliant electronic prescription: yes. Fax: only for review,
with the original signed prescription presented before dispensing, except that the fax serves
as the original for (e) a narcotic compounded for direct administration by parenteral,
intravenous, intramuscular, subcutaneous or intraspinal infusion, (f) a long-term care
facility resident, (g) a hospice patient, where the prescription notes hospice status. Oral:
emergency only, quantity limited to the emergency period, reduced to writing immediately,
written prescription due within 7 days (deadline computed by live `c2-fill-deadlines`). A
central fill pharmacy may not take an oral emergency order (21 CFR 1306.11(d)(5)).
**Output.** Dispense from this form: yes, no, or yes with conditions, and the paragraph.
**Source.** 21 CFR 1306.11(a), (d)–(g).
**Note.** Paragraphs (e) and (g) say "narcotic"; (f) says any Schedule II substance. The build
must keep that difference.

### 10. `c5-otc-sale-limit` — Nonprescription Controlled-Substance Sale Limit (48 Hours)

**Input.** Whether the product contains opium; liquid (mL) or solid (dosage units); quantity
requested; quantities sold to the same purchaser in the past 48 hours; purchaser age.
**Compute.** In any 48-hour period to the same purchaser, not more than 240 cc (8 ounces) of a
product containing opium, 120 cc (4 ounces) of any other, 48 dosage units containing opium, or
24 dosage units of any other. Purchaser at least 18. Dispensing by a pharmacist only; bound
record book (21 CFR 1306.26).
**Output.** Allowed quantity remaining in the window, when the window reopens, and the record
items.
**Source.** 21 CFR 1306.26.
**Scope.** Applies only where no federal, state or local law requires a prescription
(1306.26(f)); many states do. The tool asks first and stops if the state requires one. A
central fill pharmacy may not sell under this section (1306.26(g)).

### 11. `cmea-sales-limit` — Pseudoephedrine and Ephedrine Sales Limit

**Input.** Ingredient (pseudoephedrine, ephedrine, phenylpropanolamine); salt (hydrochloride,
sulfate, or base); strength per tablet or per mL; units per package; packages; seller type
(retail store, mobile retail vendor, mail-order); base grams already sold to this purchaser
today and in the past 30 days.
**Compute.** Base grams = salt mg × (base molecular weight ÷ salt molecular weight) × units.
Pseudoephedrine and ephedrine share one set of weights (PubChem: base 165.23, hydrochloride
201.69, sulfate 428.5 with two base molecules per sulfate), so the factors are
165.23 ÷ 201.69 = 0.81923 for the hydrochloride and 330.46 ÷ 428.5 = 0.7712 for the sulfate.
The build keeps the unrounded ratios: they reproduce every cell of DEA's chart, while the
four-decimal factors 0.8192 and 0.7711 miss seven liquid cells by 1 mL.
Limits:
- Any regulated seller: 3.6 g base per purchaser per calendar day, whatever the number of
  transactions (21 U.S.C. 830(d)(1); 21 CFR 1314.20(a), 1314.100(a)).
- Mobile retail vendor and mail-order: 7.5 g base per purchaser in any 30-day period
  (21 U.S.C. 830(e)(1)(A)(ix)(II) and (e)(2)(B); 21 CFR 1314.20(b), 1314.100(b)).
- **Purchaser** limit: it is unlawful to knowingly or intentionally purchase at retail more
  than 9 g base during a 30-day period, and "of such 9 grams, not more than 7.5 grams may be
  imported by means of shipping through any private or commercial carrier or the Postal
  Service" (21 U.S.C. 844(a)).
- Logbook not required for a purchase of a single sales package with not more than 60 mg
  pseudoephedrine (1314.30(a); 830(e)(1)(A)(iii)).
**Output.** Base grams in this sale, grams left today and in the 30-day window, the largest
whole number of packages that fits, and which limit binds.
**Source.** 21 U.S.C. 830(d), (e); 844(a); 21 CFR 1314.20, 1314.30, 1314.100; DEA, *General
Information Regarding the Combat Methamphetamine Epidemic Act of 2005* (May 2006),
equivalency charts: https://www.deadiversion.usdoj.gov/meth/cma2005_general_info.pdf ;
PubChem compound records 7028, 9581, 9802673, 9294, 65326, 5359318.
**Note.** The federal 9-gram figure binds the buyer, not a store: the seller's federal duty at
a fixed retail store is the 3.6 g daily limit. The tool states this and takes a state 30-day
seller limit as reader input. DEA's chart rounds tablet and milliliter counts **down**; so does
the tool. DEA says its chart "is not found within DEA law or regulations" and is provided "for
informational purposes only." The chart has no phenylpropanolamine row; the factor from PubChem
weights (151.21 ÷ 187.66 = 0.8058 for the hydrochloride) has no DEA figure to check against,
and the tool says so.

### 12. `otp-take-home-limit` — Methadone Take-Home Supply Limit (Opioid Treatment Program)

**Input.** Admission date and today's date (or the treatment day); medication (methadone or
buprenorphine); days of take-home supply proposed; optionally the first-day total methadone dose.
**Compute.** Methadone, beyond closure-day doses:
- "during the first 14 days of treatment": limited to 7 days;
- "from 15 days of treatment": limited to 14 days;
- "from 31 days of treatment": not to exceed 28 days (42 CFR 8.12(i)(3)(i)–(iii)).
Closure days (one weekend day, state and federal holidays) are allowed at any time in
treatment (8.12(i)(1)). The limits do not apply to buprenorphine products (8.12(i)(3)).
First-day check: the total methadone dose for the first day "should not exceed 50 milligrams"
unless the practitioner documents in the record that a higher dose was clinically indicated
(8.12(h)(3)(ii)).
**Output.** The ceiling that applies on that treatment day, whether the proposed supply fits,
the date the next step opens, and the first-day flag if a dose was entered.
**Source.** 42 CFR 8.12(h)(3)(ii), (i).
**Scope.** The ceilings are maximums; whether a patient gets any take-home dose is the
practitioner's documented decision under the six criteria in 8.12(i)(2). The tool reports the
ceiling and never recommends a supply. A state may set a lower ceiling (reader input).
**Note.** A 30 mg initial-dose limit found in older references is not in the current text.
Only the 50 mg first-day total remains.

### 13. `otp-admission-clock` — Opioid Treatment Program Admission and Interim Treatment Clocks

**Input.** Admission date; date and place of the screening exam; dates of any lab draws;
interim treatment start date, if any.
**Compute.**
- Screening exam by a practitioner who is not a program practitioner: no more than seven days
  before admission (42 CFR 8.12(f)(2)(ii)).
- Full in-person physical exam: within 14 calendar days following admission (8.12(f)(2)(iii)).
- Serology and other tests used in the exam: drawn not more than 30 days before admission
  (8.12(f)(2)(iv)).
- Initial psychosocial assessment and care plan: within 14 calendar days of admission
  (8.12(f)(4)(i)).
- Interim treatment: no longer than 180 days in any 12-month period; a plan for continuing
  treatment by day 120; at least two drug tests in the period (8.12(j)(1), (j)(4)(ii)–(iii)).
- Drug testing in comprehensive treatment: no fewer than eight random tests per year per
  patient (8.12(f)(6)).
**Output.** Each due date, what is overdue, and the rule paragraph.
**Source.** 42 CFR 8.12(f)(2), (f)(4), (f)(6), (j).

### 14. `oud-telemedicine-rx-window` — Telemedicine Prescribing Window for Controlled Substances

**Input.** Date of the prescription; schedule; whether it treats opioid use disorder with an
FDA-approved Schedule III to V product; date of the first telemedicine prescription to this
patient; whether an in-person evaluation has happened; whether the state drug-monitoring
database could be checked; whether the prescriber is a Department of Veterans Affairs
practitioner and the patient has had an in-person evaluation by any VA practitioner.
**Compute.**
- Opioid use disorder, Schedule III to V (21 CFR 1306.51): prescriptions may be issued "for a
  period not to exceed six calendar months beginning on the date the first prescription is
  issued"; after that an in-person evaluation or another lawful telemedicine route is needed.
  If the monitoring database cannot be checked: a seven-day supply at a time, each needing a
  new check, and those days count toward the six months. The pharmacist must verify the
  patient's identity before filling.
- Any Schedule II to V prescription without an in-person evaluation (21 CFR 1307.41, the
  temporary rule): authorized from May 12, 2023 **through December 31, 2026**.
- Department of Veterans Affairs (21 CFR 1306.52): a VA employee or contractor may prescribe by
  telemedicine to a VA patient who has at any time had an in-person evaluation by any VA
  practitioner. No time limit is stated. If the VA record or the state database is
  unavailable, the prescription is limited to a 7-day supply.
**Output.** Which authority covers the prescription on its date, the last date of the six-month
window, and for the temporary rule the expiry.
**Dated rule (route B).** 1307.41 has been extended four times (latest 90 FR 61301,
December 31, 2025, effective January 1 through December 31, 2026). The tool carries
`validThrough: 2026-12-31`; on January 1, 2027 it stops answering under that rule and asks the
reader for the rule then in force. Ledger row `dea-telemedicine-temporary-rule`, page watch on
the eCFR section. No successor rule appears among DEA's final or proposed rules published in
the Federal Register from January 1 through October 9, 2026.
**Source.** 21 CFR 1306.51, 1306.52, 1307.41.

### 15. `mat-injection-admin-deadline` — Pharmacy-Delivered Injectable Buprenorphine: Administer-By Date

**Input.** Date the practitioner received the drug from the pharmacy.
**Compute.** The drug must be administered to the named patient not later than 45 days after
the date of receipt by the practitioner (21 CFR 1306.07(f)(5)).
**Output.** The last administration date and days left, with the conditions of 1306.07(f): a
Schedule III to V narcotic for maintenance or detoxification, by injection or implantation,
delivered to the practitioner's registered location, not for office stock.
**Source.** 21 CFR 1306.07(f), last amended at 91 FR 34754 (June 9, 2026, effective
July 9, 2026).
**Note.** Older references say 14 days, which is what 21 U.S.C. 829a first provided (91 FR
34755–34756); the current text says 45.

### 16. `cs-disposal-clock` — Controlled-Substance Disposal Deadlines

**Input.** Who is disposing (reverse distributor; long-term care facility; long-term care
collection receptacle) and the trigger date.
**Compute.**
- Reverse distributor: destroy no later than 30 calendar days after receipt (21 CFR 1317.15(d)).
- Long-term care facility placing a resident's drugs in a collection receptacle: immediately,
  and no longer than three business days after the resident stops using the drug (1317.80(a)).
- Sealed inner liner removed at a long-term care facility: stored at most three business days
  (1317.80(d)).
**Output.** The deadline, and the standing requirements read with it: two employees witness
on-site destruction and sign the DEA Form 41 (1317.95(d), 1304.21(e)).
**Source.** 21 CFR 1317.15, 1317.80, 1317.95, 1304.21(e).

### 17. `gs1-drug-barcode-parser` — Drug Package Barcode Reader (GS1 DataMatrix)

**Input.** The scanned string: raw with the group-separator character (ASCII 29), or the
human-readable form with parentheses, e.g. `(01)00312345678906(17)271130(10)A1B2(21)12345`.
**Compute.**
- Split into GS1 element strings. Fixed length: (01) GTIN, 14 digits; (17) expiration, 6
  digits YYMMDD. Variable length, ended by the separator or the end of the data: (10) lot, up
  to 20 characters; (21) serial, up to 20 characters. Also recognized: (00), (02), (11), (15),
  (30), (37), (240), (715) NDC, (7003).
- GTIN check digit (see tool 18).
- Expiration: year by the GS1 rule (a two-digit year covers 49 years in the past to 50 years in
  the future of the current year); day `00` means the last day of that month, leap years
  included. GS1 states that for regulated healthcare products, starting January 1, 2025, the
  day "SHALL NOT be expressed as two zeroes": the tool still reads it and flags it.
- NDC: from (715) when present; otherwise the 10 digits in the NDC position of a GTIN that
  begins `003` or `x03` (tool 18).
**Output.** GTIN, NDC digits, lot, serial, expiration as a date, each check passed or failed,
and whether the four DSCSA product-identifier elements are all present.
**Source.** GS1 General Specifications, release 26.0 (ratified January 2026), sections 3.2 (the
Application Identifier table), 3.4.1 (lot), 3.4.7 (expiration date), 3.8.20 (NDC, AI 715), 7.8,
7.9 and 7.12: https://www.gs1.org/docs/barcodes/GS1_General_Specifications.pdf ;
machine-readable AI list https://ref.gs1.org/ai/GS1_Application_Identifiers.jsonld ; FDA,
*Product Identifiers Under the DSCSA: Questions and Answers* (June 2021),
https://www.fda.gov/media/116304/download ; 21 U.S.C. 360eee(14).
**Dated rule.** From March 7, 2033 every NDC is 12 digits (tool 18 and the `ndc-convert`
backfill). A 12-digit NDC does not fit in a GTIN, so from that date the tool reports an NDC
taken from a GTIN as "the 10-digit form" and prefers (715) when it is present.
**Licensing.** GS1 states its standards are made available royalty-free "to the greatest
extent possible" under its IP Policy and tells implementers to check patents themselves. The
tool implements the syntax and ships no GS1 text. The AI table is facts (number, length,
separator). See Verify at build and [spec-v1628](spec-v1628.md) §6.
**Scope.** Reads the string a scanner returns; it does not decode an image. It does not say
whether the product is genuine.

### 18. `ndc-gtin-convert` — NDC to GTIN and GTIN Check Digit

**Input.** A GTIN (12 or 14 digits) or a 10-digit NDC with its packaging-level indicator digit.
**Compute.** Check digit: from the right, excluding the check digit, multiply digits
alternately by 3 and 1 (the digit next to the check digit takes 3), sum, and subtract from the
nearest equal or higher multiple of ten. NDC inside a GTIN: GTIN-12 = `3` + NDC(10) + check.
In a 14-digit field the single item is `00` + GTIN-12 (begins `003`, same check digit). A
GTIN-14 for a grouping is the indicator digit (1 to 8) + `0` + `3` + NDC(10) + a recalculated
check (begins `x03`).
**Output.** The valid GTIN with its check digit, or the 10 digits in the NDC position of a
GTIN, with the statement that the three NDC segments cannot be recovered from the digits alone
(4-4-2, 5-3-2 and 5-4-1 are indistinguishable without the FDA directory).
**Source.** GS1 General Specifications 26.0: section 7.9.1 (check digit, Tables 7-8 and 7-9);
Table 1-6 (GS1 Prefix 03, U.P.C. Prefix 3: "Used to issue U.P.C. Company Prefixes, reserved for
alignment with FDA Labeler Code"); Table 1-9 (a GTIN-12 in a 14-digit field takes two leading
filler zeros); Table 2-16 (a GTIN-14 built on a GTIN-12 is the indicator, a zero, the first 11
digits of the GTIN-12 and a new check digit). FDA, proposed bar code rule,
68 FR 12500 at 12506 (March 14, 2003): "if the drug's NDC number were 1234567890, the UPC
number might be 312345678906, where the first digit (3) signifies that the product is a drug."
FDA Q&A guidance (June 2021), Q5: FDA recommends against the GTIN in place of the three-segment
NDC in the human-readable part of the label, and "views this practice" (encoding the NDC in the
GTIN) "as satisfying the requirement for a machine-readable NDC."
**Dated rule.** FDA's final rule (91 FR 10749, March 5, 2026) is effective **March 7, 2033**.
From that date every NDC is 12 digits (6-4-2). The rule says a 12-digit NDC "is too long to be
embedded into the current GTIN structure" and that GS1 created AI (715) for the NDC. For three
years after the effective date FDA "does not intend to object to continued use of" 10-digit
NDCs assigned before that date "on the labeling of products remaining in interstate commerce."
The tool carries the 2033 date: until then it converts in both directions; from then it still
reads the 10 digits out of a GTIN, labels them "10-digit form," and no longer builds a GTIN
from an NDC without that warning.
**Note.** GS1 reserves the prefix for the FDA labeler code; it does not say every GTIN that
begins `03` holds an NDC, and FDA's 2003 text notes some over-the-counter drugs carry a UPC
that does not contain the NDC. The output says "digits in the NDC position," not "the NDC."

### 19. `dscsa-dispenser-clocks` — DSCSA Dispenser Deadlines

**Input.** The event and its date and time: determined a product is illegitimate; received a
request for transaction records from FDA or a state official; concluded a suspect-product
investigation.
**Compute.**
- Illegitimate product: notify FDA (Form FDA 3911) and immediate trading partners not later
  than 24 hours after making the determination (21 U.S.C. 360eee-1(d)(4)(B)(ii)).
- Request for information in a recall or investigation: provide the records not later than
  2 business days after receiving the request, or in another reasonable time FDA sets
  (360eee-1(d)(1)(D)).
- Records: 6 years (tool 4).
**Output.** The deadline as a date and time, time remaining, and the paragraph.
**Source.** 21 U.S.C. 360eee-1(d)(1)(D), (d)(4)(B)(ii), (m).
**Note.** Since November 27, 2023 the response time for manufacturers, wholesale distributors
and repackagers is 24 hours: subsection (m) names subsections (b)(1)(B), (c)(1)(C) and
(e)(1)(C). The dispenser paragraph is not on that list and stays at 2 business days. The tool
is for dispensers and says so. The 24-hour clock starts at the **determination**, not at first
suspicion.

### 20. `dscsa-suspect-sample-size` — How Many Packages to Verify in a Suspect Lot

**Input.** Number of packages of the suspect product in the dispenser's possession; whether
the dispenser is a small business dispenser (tool 21).
**Compute.** Verify the product identifier of at least 3 packages or 10% of the suspect
product, whichever is greater, or all packages if there are fewer than 3. The 10% figure is
rounded **up** to a whole package.
**Output.** The number to verify, with the arithmetic.
**Source.** 21 U.S.C. 360eee-1(d)(4)(A)(ii)(II).
**Dated exemption (route B).** FDA's letter of August 6, 2026 exempts small business
dispensers from this verification (sections 582(d)(4)(A)(ii)(II) and (B)(iii) of the FD&C Act)
from November 27, 2026 until November 27, 2027; the earlier exemption covers the period before
that. For a small business dispenser the tool shows the number and says the requirement is
exempted until that date, while "all other verification requirements" of 582(d)(4) still
apply. Same ledger row and expiry as tool 21.
**Note.** The statute does not say how to round 10%; rounding up is the only reading that
meets "at least." The tool states the choice.

### 21. `dscsa-small-dispenser-check` — DSCSA Small-Dispenser Exemption Check

**Input.** Total number of full-time employees licensed as pharmacists or qualified as
pharmacy technicians at the **corporate entity that owns** the dispenser, as of
November 27, 2026.
**Compute.** 25 or fewer: the company is a small business dispenser and FDA's exemptions run
until November 27, 2027. More than 25: no exemption. "Full-time" follows the IRS definition
FDA adopts in the letter: on average at least 30 hours of service per week, or 130 hours per
month.
**Output.** Exempt or not, until when, the requirements the letter covers, and FDA's statement
that nothing needs to be filed. Covered: product-identifier verification of suspect or
illegitimate product (582(d)(4)(A)(ii)(II) and (B)(iii)), and the enhanced drug distribution
security requirements of 582(g)(1)(A) through (F) (electronic interoperable exchange,
package-level identifiers in transaction information, package-level verification systems, and
the systems for responding to requests, gathering transaction information and accepting
saleable returns). The letter says the exemptions "do not apply to other requirements in
section 582."
**Dated rule (route B).** `validThrough: 2027-11-27`; ledger row `fda-dscsa-small-dispenser`,
page watch on the FDA exemptions page. After that date the tool stops answering and asks the
reader for the current FDA notice.
**Source.** FDA, *DSCSA Exemptions from Certain Requirements Under Section 582 of the FD&C Act
for Small Business Dispensers Until November 27, 2027* (letter issued August 6, 2026):
https://www.fda.gov/media/194424/download?attachment ; FDA, *Exemptions Under the Drug Supply
Chain Security Act* (page current as of August 26, 2026):
https://www.fda.gov/drugs/drug-supply-chain-security-act-dscsa/exemptions-under-drug-supply-chain-security-act
**Note.** The count is by owner, not by store, and clerks are not counted. The statute's own
phrase is "25 or fewer full-time employees" of any kind (21 U.S.C. 360eee-1(g)(2)(B)(i)); FDA's
letter says its test reaches a broader group of dispensers.

### 22. `unit-dose-repack-expiry` — Unit-Dose Repackaging Expiration Date

**Input.** Date of repackaging; the expiration date on the manufacturer's container (a
month-year date is read as the last day of that month); answers to the five conditions.
**Compute.** Expiration = repackaging date + the shorter of (1) 6 months and (2) 25% of
the time between the repackaging date and the manufacturer's expiration date. Applies only if
all five conditions hold: USP <671> Class A or Class B container; light protection at least
equal to the original where the label says to protect from light; original container
previously unopened and the whole contents repackaged in one operation; labeled storage
conditions kept; labeling does not caution against repackaging.
**Output.** The latest expiration date, which limit bound it, and any failed condition.
**Source.** FDA, *Expiration Dating of Unit-Dose Repackaged Solid Oral Dosage Form Drug
Products* (July 2020), section III: https://www.fda.gov/media/70985/download ; month-year rule
from FDA's product-identifier Q&A (June 2021); 21 CFR 211.137, 201.17.
**Scope.** The guidance covers solid oral dosage forms repackaged by FDA-registered commercial
repackagers. It excludes liquids and excludes state-licensed pharmacies, federal facilities
and outsourcing facilities, which fall under a separate January 2017 guidance that was not
read. The tool states that scope before it answers. A pharmacy's own repackaging date under
state law or its board's rule is reader input. The manufacturer's expiration date is reader
input from the container; the tool reads no label edition.
**Note.** The guidance says "25 percent of the time" without saying how to round a fractional
day; the tool rounds down.

### 23. `pppa-special-packaging-check` — Does This Package Need Child-Resistant Packaging?

**Input.** Prescription or over-the-counter; oral or not; the ingredient; total amount of that
ingredient in the package (strength × count, or concentration × volume); for the listed
exemptions, the dosage form and package type; whether the prescriber or patient asked for a
non-child-resistant package.
**Compute.** Thresholds in 16 CFR 1700.14(a), each **per package**:

| Substance | Special packaging required when the package holds |
|---|---|
| Any oral prescription drug | always, except the listed exemptions below |
| Any oral controlled drug | always |
| Aspirin (oral) | always (two narrow exemptions) |
| Acetaminophen (oral) | more than 1 g in total (two narrow exemptions) |
| Ibuprofen (oral) | 1 g or more |
| Naproxen | the equivalent of 250 mg or more |
| Ketoprofen | more than 50 mg |
| Diphenhydramine (oral) | more than the equivalent of 66 mg base |
| Loperamide (oral) | more than 0.045 mg |
| Iron-containing drugs and dietary supplements | 250 mg or more elemental iron, at a concentration of 0.025% w/v or more (liquids) or 0.05% w/w or more (non-liquids); supplements that are powders with no more than 0.12% w/w elemental iron are exempt |
| Lidocaine | more than 5.0 mg |
| Dibucaine | more than 0.5 mg |
| Minoxidil | more than 14 mg |
| Imidazolines (tetrahydrozoline, naphazoline, oxymetazoline, xylometazoline) | the equivalent of 0.08 mg or more |
| Fluoride (household substances) | more than 50 mg elemental fluoride **and** more than 0.5% |
| Methyl salicylate (liquid, not a pressurized spray) | more than 5% by weight |
| Mouthwash | 3 g or more ethanol (one pump-dispenser exemption) |
| Rx-to-OTC switched oral ingredient | always, unless every active ingredient was approved for over-the-counter sale on an application submitted to FDA before January 29, 2002 (paragraph (a)(30)) |

Prescription exemptions computed from content, 1700.14(a)(10): sublingual nitroglycerin;
isosorbide dinitrate sublingual or chewable, strengths of 10 mg or less; erythromycin
ethylsuccinate granules or suspension not more than 8 g, tablets not more than 16 g; potassium
supplements in unit dose with not more than 50 mEq per unit dose; sodium fluoride with not
more than 110 mg per package **or** not more than 0.5% elemental fluoride; betamethasone
tablets in manufacturers' dispenser packages, not more than 12.6 mg; prednisone tablets not
more than 105 mg; methylprednisolone tablets not more than 84 mg; mebendazole tablets not more
than 600 mg; colestipol powder not more than 5 g; colesevelam powder not more than 3.75 g;
sevelamer carbonate powder not more than 2.4 g; baloxavir marboxil tablets not more than
80 mg; conjugated estrogens tablets not more than 32.0 mg and norethindrone acetate tablets
not more than 50 mg in mnemonic packages; cyclically administered oral contraceptives in
manufacturers' mnemonic dispenser packages and hormone replacement products, each only when
they rely solely on progestogen or estrogen substances; anhydrous cholestyramine powder;
pancrelipase tablets, capsules or powder; medroxyprogesterone acetate tablets; sacrosidase in
a solution of glycerol and water.
Dispensing exception: a prescription may go out in a non-complying package only when the
prescriber's order directs it or the purchaser asks (15 U.S.C. 1473(b)).
**Output.** Required or not, the paragraph, the total content computed, and the margin to the
threshold.
**Source.** 16 CFR 1700.14(a)(1), (3), (4), (10), (12), (13), (16), (17), (20)–(28), (30), (33);
15 U.S.C. 1473.
**Note.** The operators differ row by row ("more than" vs "or more"); the test at the exact
threshold must follow the text. Paragraph (a)(12) prints the liquid concentration clause
twice in the eCFR; the tool uses 0.025% w/v for liquids and 0.05% w/w for non-liquids as
paragraph (13) states them. Several exemptions also require that the package hold "no other
substance subject to" the section; the tool asks. The aspirin and acetaminophen exemptions
are effervescent tablets and unflavored unit-dose powders within stated limits
((a)(1)(i)–(ii), (a)(16)(i)–(ii)); the tool lists them and takes the reader's answer.
Household chemicals in the same section are out of scope.

### 24. `hw-generator-category` — Hazardous Waste Generator Category (Pharmacy)

**Input.** For one calendar month, in kilograms: acute hazardous waste, non-acute hazardous
waste, residues from cleanup of acute hazardous waste; whether hazardous waste pharmaceuticals
are managed under 40 CFR part 266 subpart P.
**Compute.** Table 1 to 40 CFR 262.13:
- Large quantity: acute > 1 kg, or non-acute ≥ 1,000 kg, or acute cleanup residue > 100 kg.
- Small quantity: acute ≤ 1 kg and non-acute > 100 kg and < 1,000 kg and residue ≤ 100 kg.
- Very small quantity: acute ≤ 1 kg and non-acute ≤ 100 kg and residue ≤ 100 kg.
A generator of both acute and non-acute waste finds the category for each and applies the more
stringent one to both (262.13(b)(4)); the three tests above give the same result.
Hazardous waste pharmaceuticals managed under subpart P are not counted (262.13(c)(9)).
A healthcare facility that is very small when **all** its hazardous waste is counted, including
pharmaceuticals, stays under 262.14 (266.501(a)).
**Output.** The category for the month and what drove it, plus the facts the section adds:
non-creditable hazardous waste pharmaceuticals may be accumulated for one year or less under
subpart P (266.502(f)(1)); FDA-approved over-the-counter nicotine patches, gums and lozenges
are not P075 waste (40 CFR 261.33).
**Source.** 40 CFR 262.13, 262.14, 266.501, 266.502, 261.33.
**Scope.** Federal categories only; a state may not have adopted subpart P or may be stricter
(reader checks). Which wastes are hazardous is reader input: the tool does not classify drugs.

## Backfills (live tools that should do more)

| Live tool | Add | Source |
|---|---|---|
| `ndc-convert` | **The 12-digit NDC.** FDA's final rule (91 FR 10749, March 5, 2026) requires every NDC to be 12 digits in one 6-4-2 format. "This rule is effective March 7, 2033." A 3-year transition follows the effective date (to March 7, 2036 by the calendar; the rule prints no end date), during which FDA "does not intend to object to continued use of" 10-digit NDCs assigned before the effective date "on the labeling of products remaining in interstate commerce." Conversion: "adding leading zeros to the labeler code, product code, and/or package code segments as needed." Add 10 → 12, 11 (billing 5-4-2) → 12 and 12 → 10/11, the dates, and a line that the two forms are "the same NDC with different formats." | 91 FR 10749; amended 21 CFR 207.33(b) at 91 FR 10770 |
| `ndc-convert` | **Six-digit labeler codes.** Current 207.33(b) already allows a 6-digit labeler (6-4-1, 6-3-2, eleven digits natively), and the live tool rejects these. FDA said in March 2026 that "only 5-digit labeler codes are being assigned," so none exists yet; under the final rule none will exist outside the 12-digit format. The tool accepts the format, says no such NDC has been assigned, and says a native 11-digit NDC without hyphens cannot be told from a billing 5-4-2 NDC. | 21 CFR 207.33(b)(1)–(2); 91 FR 10750–10751 |
| Every tool that takes an NDC (`substitution-check`, `nadac-margin`, `pharmacy-spread-check`, `ndc-hcpcs-units`, `340b-*`, `mfp-*`) | Route NDC input through one shared normalizer that accepts 12 digits, so the 2033 change is one edit. | same |
| `c2-fill-deadlines` | Link to `c2-rx-form-check` from the emergency case; no rule change found. | 21 CFR 1306.11 |
| `cs-refill-validity` | A line under the result: "A transfer does not add refills or time" with a link to `cs-rx-transfer-check`. | 21 CFR 1306.25 |
| `days-supply` | A line of copy: a practitioner who is not registered as a narcotic treatment program may dispense "not more than a three-day supply" of a narcotic at one time to start maintenance or detoxification while referral is arranged, and the supply "may not be renewed or extended." | 21 CFR 1306.07(b) |

## Rejected

| Idea | Why not |
|---|---|
| Controlled-substance schedule lookup; exempt/excluded product lists | A list (rule 1). The schedules change by Federal Register notice, and no machine-readable federal file was found |
| Buprenorphine patient-limit tool | The waiver and its limits were repealed in December 2022; DEA's rule at 91 FR 34754 removes 21 CFR 1301.28 |
| Three-day emergency narcotic supply (1306.07(b)) as its own tool | One comparison against 3 days; live `days-supply` computes the supply. Recorded as a backfill line for that tool's copy |
| Transfer of business 14-day advance notice (1301.52(d)) | One subtraction with no branches; folded into `dea-registration-renewal` copy as a note |
| Power of attorney, CSOS certificates, two-factor e-prescribing | Procedures with no arithmetic (1305.05, part 1311) |
| Long-term care emergency kits | No number in the CFR (a DEA policy statement and state law) |
| Listed-chemical thresholds, quotas, ARCOS | Manufacturer and distributor rules, not pharmacy work; tables |
| Tall-man lettering formatter | FDA's list is public but is a list of about 35 names; a lookup of it is a table (rule 1) and its silence on a name would read as "no risk." ISMP's longer list is not licensed to ship |
| Sig-code translator | No authoritative public source. The ISMP list is copyrighted, the Joint Commission list is short and is the Commission's own, and expanding free-text directions is judgment over free text |
| Medication Guide dispensing rule (21 CFR 208.24) | A duty with no input to compute; which drugs have a guide is live status |
| FDA recall classes and depth | Definitions; a static picture |
| "Do not flush" list, DEA non-retrievable standard | Lists and a performance standard, no arithmetic |
| 503A 5% interstate limit | Not a tool in this wave. The arithmetic is specified, and held behind a dated enforcement status, as `compound-interstate-share` in [spec-v1629](spec-v1629.md). The reason: the statute sets 5% of total prescription orders (21 U.S.C. 353a(b)(3)(B)(ii)), but FDA has extended the period before it "intends to begin enforcing" the limit and treats the 2020 standard MOU as suspended (FDA page current as of October 20, 2022). A calculator that presented an unenforced limit as a live test would mislead; spec-v1629 prints the enforcement status with its date beside the arithmetic |
| Beyond-use date on a dispensed prescription vial | State law and USP text; reader input only |
| USPS mailing rules for controlled substances; NCPDP SCRIPT | Rules without arithmetic; NCPDP text is not licensed |
| DSCSA timeline picture | A static picture (spec-v29). The one dated decision is tool 21 |
| DEA Form 41 two-witness rule as its own tool | A fixed requirement; shown inside `cs-disposal-clock` |
| Pharmacy repackaging under the 2017 FDA guidance | Not read; its limits refer to USP text |
| Methadone 30 mg initial dose check | Not in the current 42 CFR 8.12; only the 50 mg first-day total remains (inside tool 12) |

## Research record

All eCFR text was read through the renderer API on October 10, 2026 (titles 16, 21 and 40
current to October 7, 2026; title 42 to October 8, 2026):
`https://www.ecfr.gov/api/renderer/v1/content/enhanced/current/title-NN?part=P&section=S`.
U.S. Code text was read at govinfo (`https://www.govinfo.gov/link/uscode/21/830` and the like;
2024 edition). uscode.house.gov was down for maintenance. Federal Register text and citations
were read through the federalregister.gov API. Every section named in the Tools was read a
second time on the same day; the rows marked **Corrected** record what that second reading
changed.

| Finding | Where read | Effect on the spec |
|---|---|---|
| The Pharmacist's Manual (2022, 2010 and 2004 editions) gives the letters and one example but **not** the checksum; the Practitioner's Manual (2023, 2006) and DEA's registration pages do not describe the number; no Federal Register document states the arithmetic. It appears only in a distributor's procedure filed as a court exhibit and in a 2013 journal article (PMC3847977) | DEA manuals (current site and Internet Archive copies); Federal Register API search for "DEA number" with "check digit" (4 hits, all HHS) and with "checksum" (0); .gov-limited web search | Tool 1 carries a build gate and an owner decision instead of a claim |
| Theft or loss: written notice within one business day **of discovery**; complete Form 106 within 45 days after discovery (1301.74(c): "45 calendar days"); six factors for "significant" | 21 CFR 1301.76(b); 1301.74(c) | Tool 6 |
| Form 222: "No DEA Form 222 is valid more than 60 days after its execution by the purchaser"; partial shipments within 60 days; DLA six months; month-end copy to DEA for non-ARCOS suppliers | 21 CFR 1305.13(b), (d), (f); 1305.22(e), (h) | Tool 5 |
| Five percent rule: denominator is "distributed and dispensed"; the numerator counts distributions under 1307.11 and 1301.25; long-term-care automated dispensing systems excluded | 21 CFR 1307.11(a)(1)(iv), (b), (c) | Tool 7 formula and input |
| Biennial inventory "on any date which is within two years of the previous biennial inventory date"; newly scheduled drug on the effective date; opened-container count rule with the 1,000 threshold; opening or close of business | 21 CFR 1304.11(a), (c), (d), (e)(6) | Tool 3 |
| Records kept "at least 2 years from the date of such inventory or record"; section last amended 91 FR 5241 (February 5, 2026) | 21 CFR 1304.04(a) | Tool 4 |
| Registration: apply not more than 60 days before expiry; 28 to 39 months first period then 36 months; 45-day automatic extension | 21 CFR 1301.13(b), (d); 1301.36(i) | Tool 2 |
| Reinstatement "for one calendar month after the expiration date"; a 2025 DEA slide says "within 30 days" | DEA registration page; DEA 2025 supply chain conference slides | Tool 2 note; route B |
| One-time transfer of an unfilled **electronic** C-II to C-V prescription; refills travel; 2-year record. DEA's rules address transfer "for refill dispensing, but not for initial dispensing" | 21 CFR 1306.08(e)–(i); 88 FR 48365 (July 27, 2023), preamble | Tool 8 |
| Refill transfer: one time, or up to the maximum refills with a shared real-time database; records 2 years from last refill | 21 CFR 1306.25 | Tool 8 |
| Fax as original for C-II: (e) narcotic for infusion, (f) long-term care resident (any C-II), (g) hospice narcotic | 21 CFR 1306.11(a), (e)–(g) | Tool 9, with the narcotic/any difference |
| Nonprescription sale: 240 cc/120 cc/48 units/24 units per 48 hours; age 18 | 21 CFR 1306.26 | Tool 10 |
| 3.6 g/day (all sellers); 7.5 g/30 days (mobile vendors, mail-order); 9 g/30 days is the **purchaser's** limit; 60 mg logbook exception; logbook 2 years | 21 U.S.C. 830(d)(1), (e)(1)(A)(iii), (vi), (ix)(II), (e)(2)(B); 844(a); 21 CFR 1314.20, 1314.30, 1314.100 | Tool 11. The 9 g figure is not a store limit |
| **Corrected.** The four-decimal factors 0.8192 and 0.7711 do not reproduce the whole DEA chart: all tablet cells match, but 7 liquid cells are off by 1 mL (for example 6.25 mg/5 mL ephedrine hydrochloride at 7.5 g: chart 7,323 mL, four-decimal factor 7,324). The unrounded ratios from PubChem weights (165.23, 201.69, 428.5) with rounding down reproduce every cell of the chart | DEA CMEA general information PDF (May 2006), recomputed; PubChem PUG REST for the six compounds | Tool 11 uses the unrounded ratios; test added |
| **Corrected.** 21 U.S.C. 844(a) limits the 7.5 g portion to product "imported by means of shipping through any private or commercial carrier or the Postal Service," not "by mail or carrier" generally | 21 U.S.C. 844(a) | Tool 11 quotes the statute |
| Take-home: 7 days in the first 14 days, 14 from 15 days, 28 from 31 days; not for buprenorphine; first-day methadone total "should not exceed 50 milligrams" | 42 CFR 8.12(h)(3)(ii), (i)(1)–(3) | Tool 12; no 30 mg check |
| Program clocks: seven days, 14 calendar days, 30 days, 180 days in 12 months, day 120, eight tests a year | 42 CFR 8.12(f)(2)(ii)–(iv), (f)(4)(i), (f)(6), (j)(1), (j)(4) | Tool 13, now with paragraph numbers |
| Temporary telemedicine rule "in effect until the end of the day December 31, 2026" | 21 CFR 1307.41 | Tool 14 dated constant |
| **Corrected.** The fourth extension is 90 FR 61301 (pages 61301–61306; the eCFR source note cites the amendment page, 61306) | Federal Register API, document 2025-24123 | Tool 14 citation |
| Buprenorphine telemedicine: six calendar months beginning on the date of the first prescription; seven-day supply when the monitoring database is unavailable; pharmacist verifies identity | 21 CFR 1306.51 | Tool 14 |
| **Added.** The Veterans Affairs telemedicine rule is 21 CFR 1306.52 (90 FR 6539, January 17, 2025): prior in-person evaluation by any VA practitioner; 7-day supply when the VA record or state database is unavailable | 21 CFR 1306.52 | Tool 14 gains a third branch; its build gate is removed |
| Injectable buprenorphine delivered to a practitioner: administer "not later than 45 days after the date of receipt"; the statute first said 14 days; 1301.28 removed | 21 CFR 1306.07(f)(5); 91 FR 34754–34768 (June 9, 2026, effective July 9, 2026) | Tool 15; a rejected row |
| Reverse distributor 30 calendar days; long-term care 3 business days | 21 CFR 1317.15(d), 1317.80(a), (d) | Tool 16 |
| Dispenser: 24 hours after determining illegitimate; 2 business days for information requests; 6 years; 3 packages or 10% | 21 U.S.C. 360eee-1(d)(1)(A)(iii), (d)(1)(D), (d)(4)(A)(ii)(II), (d)(4)(A)(iv), (d)(4)(B)(ii), (d)(4)(B)(v) | Tools 4, 19, 20, now with paragraph numbers |
| The 24-hour response that began November 27, 2023 names subsections (b)(1)(B), (c)(1)(C) and (e)(1)(C) only, not dispensers; transaction history sunset on the same date | 21 U.S.C. 360eee-1(m), (k)(1) | Tool 19 note; tool 4 row |
| Small-dispenser exemption runs to **November 27, 2027** (an earlier exemption ran to November 27, 2026); test is 25 or fewer full-time pharmacists and technicians at the owning corporate entity as of November 27, 2026 | FDA exemptions page (current as of August 26, 2026); FDA letter of August 6, 2026 | Tool 21 |
| **Added.** The letter exempts small business dispensers from the "3 packages or 10 percent" product-identifier verification itself (582(d)(4)(A)(ii)(II) and (B)(iii)), and from 582(g)(1)(A)–(F); "full-time" is the IRS definition | FDA letter of August 6, 2026, https://www.fda.gov/media/194424/download?attachment | Tool 20 gains a dated exemption; tool 21 lists what is covered |
| **12-digit NDC final rule**: 6-4-2; "This rule is effective March 7, 2033"; 3-year transition after the effective date; leading zeros; "the same NDC with different formats"; "only 5-digit labeler codes are being assigned" | 91 FR 10749–10771 (document 2026-04368), full text | Backfills to `ndc-convert` and every NDC input; tools 17 and 18 dated rule. The March 7, 2036 end of the transition is computed, not printed |
| A 12-digit NDC "is too long to be embedded into the current GTIN structure"; GS1 AI (715) carries the NDC | 91 FR 10749, response 23; GS1 AI list (715 "NHRN NDC", N3+X..20) | Tools 17 and 18 dated rule |
| AI formats: (01) N2+N14, (17) N2+N6, (10) and (21) N2+X..20 | GS1 Application Identifiers JSON-LD | Tool 17 |
| Day `00` means the last day of the month, leap years included; "SHALL NOT be expressed as two zeroes" for regulated healthcare from January 1, 2025; date range 49 years back to 50 ahead | GS1 General Specifications 26.0, sections 3.4.7 and 7.12 | Tool 17. **Corrected:** the expiration-date section is 3.4.7 (3.4.2 is the production date) |
| Check digit: alternate ×3 and ×1 from the right, subtract from the nearest equal or higher multiple of ten. Computed: body 0031234567890 → 6; body 31234567890 → 6 (FDA's example 312345678906); GS1's 17-digit example 37610425002123456 → 9 | GS1 General Specifications 26.0, section 7.9.1, Tables 7-8 and 7-9 | Tool 18 |
| **Added.** GS1 Prefix 03 (U.P.C. Prefix 3) is "reserved for alignment with FDA Labeler Code"; a GTIN-12 takes two filler zeros in a 14-digit field; a GTIN-14 on a GTIN-12 is indicator + 0 + 11 digits + new check. FDA: UPC "312345678906, where the first digit (3) signifies that the product is a drug" | GS1 General Specifications 26.0, Tables 1-6, 1-9, 2-16; 68 FR 12500 at 12506 (March 14, 2003) | Tool 18 build gate removed |
| A year-month expiration means "the last calendar day of the month"; FDA recommends against the GTIN in place of the human-readable NDC but accepts the NDC encoded through the GTIN in the barcode; serial up to 20 characters | FDA product-identifier Q&A guidance (June 2021), Q4, Q5 | Tools 17, 18, 22 |
| Repackaging: 6 months or 25% of the remaining time, whichever is shorter, with five conditions; commercial repackagers of solid oral forms only | FDA guidance (July 2020), section III | Tool 22 and its scope |
| Expiration date required and where it appears | 21 CFR 211.137, 201.17 | Tool 22 source |
| Every special-packaging threshold in the table | 16 CFR 1700.14(a), whole section | Tool 23 |
| **Corrected** in tool 23: the sodium fluoride exemption is 110 mg per package **or** a concentration of not more than 0.5%; paragraph (a)(30) has a carve-out for ingredients approved over the counter on applications before January 29, 2002; baloxavir marboxil tablets (not more than 80 mg) are exempt under (a)(10)(xxiv); acetaminophen has two exemptions; iron supplements have a 0.12% powder exemption; mouthwash has a pump-dispenser exemption | 16 CFR 1700.14(a)(10)(vii), (xxiv), (13)(ii), (16), (22), (30) | Tool 23 table and exemption list |
| Non-complying package on the prescriber's direction or purchaser's request | 15 U.S.C. 1473(b) | Tool 23 |
| Generator table; more stringent category for mixed waste; subpart P waste not counted; one-year accumulation; nicotine exemption | 40 CFR 262.13(a)–(b), Table 1 and (c)(9); 266.501(a); 266.502(f)(1); 261.33 | Tool 24 |
| FDA is not enforcing the 503A 5% limit; MOU suspended | FDA MOU page (current as of October 20, 2022) | Rejected row; the tool lives in spec-v1629 |
| "Business day" and "dosage unit" are not defined in 21 CFR 1300.01 | 21 CFR 1300.01 (search, no match) | Notes on tools 6, 7, 16 |

## Verify at build

- **`dea-number-check`:** an official statement of the checksum (the registrant data file
  documentation at NTIS was unreachable on October 10, 2026); the full list of first letters
  with their registrant types, read on a DEA page; the rule for a business registrant's second
  character (the court exhibit says a digit can stand there; that is not a DEA statement).
- **`dea-registration-renewal`:** which of "one calendar month" and "30 days" DEA applies today.
- **`cmea-sales-limit`:** DEA's chart has no phenylpropanolamine row, so the PubChem-derived
  factor is unchecked against DEA. PubChem prints the sulfate weight to one decimal (428.5).
- **`oud-telemedicine-rx-window`:** whether DEA publishes a successor to 1307.41 before
  December 31, 2026; how "six calendar months" is counted when the start date has no
  counterpart in the sixth month.
- **`otp-take-home-limit`:** whether "from 15 days of treatment" counts the admission day as
  day 1 (the text does not say; the tool states its convention).
- **`cs-biennial-inventory`:** "within two years" of a February 29 inventory; the tool gives
  February 28 and says so.
- **`gs1-drug-barcode-parser`:** the century figure (7-17) is an image and was not read as
  text, only the 49/50-year range; Table 7-6 of predefined lengths; the GS1 IP Policy text
  itself, to confirm an open-source implementation needs no license; symbology identifier
  prefixes (`]d2`, `]C1`).
- **`ndc-gtin-convert`:** whether codes other than NDCs (for example device labeler codes) are
  issued under GS1 Prefix 03; this was not read, and it is why the output says "digits in the
  NDC position."
- **`dscsa-small-dispenser-check`, `dscsa-suspect-sample-size`:** the July 2024 exemption
  letter (https://www.fda.gov/media/179256/download?attachment) was not read; it governs dates
  before November 27, 2026.
- **`unit-dose-repack-expiry`:** whether the guidance is still current (FDA guidance search);
  the January 2017 pharmacy repackaging guidance if the tool is to serve pharmacies.
- **`pppa-special-packaging-check`:** the duplicated clause in 1700.14(a)(12) (confirm against
  the printed CFR or the amending Federal Register document).
- **`hw-generator-category`:** which states have adopted subpart P (reader input, not a table).
- **`ndc-convert` backfill:** the final rule prints no worked 10-to-12 padding example; the
  test cases below follow its sentence "adding leading zeros to the labeler code, product code,
  and/or package code segments."
- **`cs-five-percent-rule`:** whether the long-term-care automated dispensing units are also
  left out of the denominator (the rule says only that they "do not count toward the 5 percent
  limit").

## Sources

- 21 CFR 1300.01; 1301.13, 1301.36, 1301.52, 1301.74, 1301.76; 1304.03, 1304.04, 1304.11,
  1304.21; 1305.13, 1305.17, 1305.22, 1305.27; 1306.05, 1306.07, 1306.08, 1306.11, 1306.12,
  1306.25, 1306.26, 1306.51, 1306.52; 1307.11, 1307.41; 1314.20, 1314.25, 1314.30, 1314.100,
  1314.105, 1314.110; 1317.15, 1317.80, 1317.95 (eCFR, current to October 7, 2026).
- 21 CFR 201.17, 207.33, 208.24, 211.137; 16 CFR 1700.14, 1700.15; 42 CFR 8.12; 40 CFR 261.33,
  262.13, 262.14, 266.500–266.502, 266.507.
- 21 U.S.C. 830, 844, 353a, 360eee, 360eee-1; 15 U.S.C. 1473 (govinfo, 2024 edition).
- FDA, "Revising the National Drug Code Format and Drug Label Barcode Requirements," 91 FR
  10749 (March 5, 2026), effective March 7, 2033. FDA, "Bar Code Label Requirement for Human
  Drug Products and Blood," proposed rule, 68 FR 12500 (March 14, 2003).
- DEA, "Implementation of the Substance Use-Disorder Prevention That Promotes Opioid Recovery
  and Treatment for Patients and Communities Act of 2018," final rule, 91 FR 34754
  (June 9, 2026); "Fourth Temporary Extension of COVID-19 Telemedicine Flexibilities for
  Prescription of Controlled Medications," 90 FR 61301 (December 31, 2025); "Transfer of
  Electronic Prescriptions for Schedules II-V Controlled Substances Between Pharmacies for
  Initial Filling," 88 FR 48365 (July 27, 2023).
- DEA, *Pharmacist's Manual* (2022; 2010 and 2004 editions from the Internet Archive);
  *Practitioner's Manual* (2023; 2006 edition from the Internet Archive); DEA registration
  page; DEA, *General Information Regarding the Combat Methamphetamine Epidemic Act of 2005*
  (May 2006).
- FDA, *Product Identifiers Under the DSCSA: Questions and Answers* (June 2021); *Expiration
  Dating of Unit-Dose Repackaged Solid Oral Dosage Form Drug Products* (July 2020); *Exemptions
  Under the DSCSA* page and the small business dispenser letter of August 6, 2026; compounding
  MOU page; Name Differentiation Project page.
- GS1 General Specifications, release 26.0 (January 2026); GS1 Application Identifiers JSON-LD.
- PubChem compound records for pseudoephedrine, ephedrine, phenylpropanolamine and their
  hydrochloride and sulfate salts (molecular weights).
- Gabay M. Federal Controlled Substances Act: Controlled Substances Prescriptions. *Hosp
  Pharm.* 2013 (PMC3847977). Read only for the `dea-number-check` gate.

## Tests

- **`dea-number-check`:** MJ3614511 passes (3+1+5=9; (6+4+1)×2=22; 31 → 1). Change one digit:
  fails. A name whose initial differs from the second letter is a note, not a failure.
- **`dea-registration-renewal`:** expiry stated as a month resolves to its last day, including
  February in a leap year; day 61 before expiry is too early, day 60 is allowed; an application
  44 days before expiry does not get the automatic extension, 45 does.
- **`cs-biennial-inventory`:** last inventory February 29, 2024 → last permitted date
  February 28, 2026, with the convention stated; a 1,000-count C-IV bottle may be estimated, a
  1,001-count must be counted; any opened C-II is exact.
- **`cs-record-retention`:** a refill transfer counts from the last refill, not the transfer;
  a DSCSA record gives 6 years while the same day's Form 222 gives 2.
- **`dea-222-validity`:** shipment on day 60 valid, day 61 not; the DLA case gives six months;
  the month-end copy date when the 60 days end mid-month.
- **`cs-theft-loss-clock`:** discovery on a Friday → notice due Monday, or Tuesday when Monday
  is a federal holiday; Form 106 date is discovery + 45 calendar days; the clock ignores the
  date of the loss itself.
- **`cs-five-percent-rule`:** dispensed 95,000 and distributed 5,000 → exactly 5.00%, allowed;
  5,001 → over. A build that divides by dispensed alone reports 5.26% and fails this test.
  Long-term-care automated dispensing units are excluded.
- **`cs-rx-transfer-check`:** an unfilled paper C-II → not transferable; an unfilled electronic
  C-II → once; a second transfer of the same prescription → refused; shared database →
  remaining refills; state law "no" overrides every yes.
- **`c2-rx-form-check`:** fax for a long-term care resident of a non-narcotic C-II → fax is the
  original; fax for a hospice patient of a non-narcotic C-II → original still required.
- **`c5-otc-sale-limit`:** 240 mL opium product allowed, 241 not; 120 mL of an opium product
  sold 47 hours ago leaves 120 mL, so a 240 mL sale is refused; 49 hours ago it is allowed;
  age 17 refused.
- **`cmea-sales-limit`:** reproduces DEA's chart: 30 mg pseudoephedrine HCl → 146 tablets at
  3.6 g, 305 at 7.5 g, 366 at 9 g; 120 mg sulfate → 38, 81, 97; 15 mg/1.6 mL HCl → 468 mL;
  6.25 mg/5 mL ephedrine HCl → 7,323 mL at 7.5 g and 8,788 mL at 9 g (a build with the factor
  rounded to 0.8192 gives 7,324 and 8,789 and fails). A fixed retail store is not shown a
  federal 30-day seller limit. A 60 mg single package needs no logbook entry; two do.
- **`otp-take-home-limit`:** day 14 → 7, day 15 → 14, day 30 → 14, day 31 → 28; buprenorphine →
  no federal ceiling; a 55 mg first-day total is flagged, 50 mg is not.
- **`otp-admission-clock`:** an outside screening exam 8 days before admission is flagged;
  interim treatment day 181 in the same 12 months is flagged.
- **`oud-telemedicine-rx-window`:** a prescription dated January 1, 2027 gets no answer from
  1307.41 (fails closed); the six-month end date across a short month; two seven-day supplies
  count 14 days toward the six months; a VA prescription with no prior in-person VA evaluation
  is not covered by 1306.52.
- **`mat-injection-admin-deadline`:** receipt + 45 days; day 46 is late.
- **`cs-disposal-clock`:** reverse distributor receipt + 30 calendar days; a resident's drug
  discontinued on a Friday → receptacle by Wednesday (three business days).
- **`gs1-drug-barcode-parser`:** a lot followed by a serial with no separator is reported as
  ambiguous, not split by guess; `(17)280200` → February 29, 2028 with the day-00 flag;
  `(17)270631` → invalid date; a wrong GTIN check digit is flagged; a string with (715) returns
  that NDC rather than the GTIN's.
- **`ndc-gtin-convert`:** body 0031234567890 → check digit 6 (GTIN 00312345678906); FDA's
  example NDC 1234567890 → UPC 312345678906; GS1's example 37610425002123456 → 9; a GTIN not
  beginning `003` or `x03` yields no NDC digits; the output never hyphenates recovered digits.
- **`dscsa-dispenser-clocks`:** a request received Friday afternoon → due Tuesday (two business
  days); the 24-hour clock is exact to the minute and does not skip weekends.
- **`dscsa-suspect-sample-size`:** 2 packages → 2; 3 → 3; 30 → 3; 31 → 4 (10% = 3.1, rounded
  up); 100 → 10; a small business dispenser on any date through November 27, 2027 sees the
  exemption line.
- **`dscsa-small-dispenser-check`:** 25 → exempt, 26 → not; clock past November 27, 2027 →
  the tool asks for the current notice.
- **`unit-dose-repack-expiry`:** 36 months remaining → 6 months binds; 12 months remaining →
  25% (3 months) binds; manufacturer date "2027-06" read as June 30, 2027; any failed condition
  stops the answer.
- **`pppa-special-packaging-check`:** acetaminophen exactly 1,000 mg → not required, 1,001 mg →
  required; ibuprofen exactly 1,000 mg → required; loperamide 0.045 mg → not required;
  prednisone tablets 105 mg → exempt, 110 mg → required; sodium fluoride 150 mg in a package
  at 0.4% elemental fluoride → exempt by concentration; baloxavir marboxil 80 mg → exempt; a patient request
  permits a non-complying prescription package but not an over-the-counter one.
- **`hw-generator-category`:** acute exactly 1 kg → not large on that ground, 1.01 kg → large;
  non-acute exactly 100 kg → very small, exactly 1,000 kg → large; subpart P pharmaceuticals
  excluded from the count.
- **`ndc-convert` backfill:** 0002-1234-01 → 000002-1234-01; 12345-678-90 → 012345-0678-90;
  12345-6789-0 → 012345-6789-00; a date before March 7, 2033 labels the 12-digit form as
  "not yet in effect."

## Build status

Not started. Specified October 10, 2026.
