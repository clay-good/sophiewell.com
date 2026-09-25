# spec-v1551 — Malaria treatment: ACT bands, severe malaria, pre-referral, and pregnancy

Program: [scope-field-health.md](scope-field-health.md). Rules: [spec-v1540](spec-v1540.md).
Four tiles. The catalog has `who-severe-malaria` (the severe-malaria criteria) and no malaria dosing
at all.

## Sources (read in full)

| Key | Document | Licence |
|---|---|---|
| MAL26 | WHO. *WHO guidelines for malaria*, **10 September 2026** (living guideline), doi:10.2471/B09879, IRIS 10665/387504 | CC BY-NC-SA 3.0 IGO |
| MAL25 | The 13 August 2025 version, read to diff against MAL26 | CC BY-NC-SA 3.0 IGO |
| T15 | WHO. *Guidelines for the treatment of malaria*, 3rd ed. 2015 | CC BY-NC-SA 3.0 IGO |
| SMH12 | WHO. *Management of severe malaria: a practical handbook*, 3rd ed. 2012 | All rights reserved |
| RAS17 | WHO. *Rectal artesunate for pre-referral treatment of severe malaria: information note.* 2017 | CC BY-NC-SA 3.0 IGO |
| RAS23 | WHO. *The use of rectal artesunate as a pre-referral treatment for severe P. falciparum malaria*, 2023 update | CC BY-NC-SA 3.0 IGO |

## Volatility (read first)

MAL26 is a living guideline and changed dosing edges within a year: it added an artemether-
lumefantrine band **under 5 kg** (a new 1:12 infant formulation) and changed the single-low-dose
primaquine exclusions (spec-v1552). Every tile here cites **the version date and DOI**, carries a
*high*-volatility staleness row (review every 6 months), and has a test that pins each band so a
change to the guideline shows up as a deliberate edit.

---

## 1. `act-weight-band-dose` — Malaria Treatment Dose by Weight: ACTs (WHO 2026)

**Question.** What dose of this artemisinin-based combination does a patient of this weight get, and
on what schedule?

**Inputs.** Weight (kg, 0.5–150, required); regimen (required, **no default**: every regimen has its
own table): artemether-lumefantrine (AL) / artesunate-amodiaquine (AS+AQ) / artesunate-mefloquine
(AS+MQ) / dihydroartemisinin-piperaquine (DHA-PPQ) / artesunate + sulfadoxine-pyrimethamine (AS+SP);
pregnancy trimester (not pregnant / first / second or third; optional, surfaces tile 4's rule).

**Bands (MAL26 §5.2.1.1.2, pp. 175–178; T15 §4 for the differences).**

**AL**, twice a day for 3 days (6 doses); the first two doses ideally 8 hours apart; take with food
or a milky drink. Target totals: artemether 5–24 mg/kg, lumefantrine 29–144 mg/kg.

| Weight | Artemether + lumefantrine per dose |
|---|---|
| under 5 kg | 5 + 60 mg (the 1:12 infant formulation; MAL26 only) |
| 5 to under 15 kg | 20 + 120 mg |
| 15 to under 25 kg | 40 + 240 mg |
| 25 to under 35 kg | 60 + 360 mg |
| 35 kg or more | 80 + 480 mg |

**AS+AQ**, once daily for 3 days; targets 4 (2–10) mg/kg/day AS, 10 (7.5–15) mg/kg/day AQ.

| Weight | AS + AQ daily |
|---|---|
| under 9 kg (T15: 4.5 to under 9) | 25 + 67.5 mg |
| 9 to under 18 | 50 + 135 mg |
| 18 to under 36 | 100 + 270 mg |
| 36 or more | 200 + 540 mg |

**AS+MQ**, once daily for 3 days; AS 4 (2–10) mg/kg/day; MQ 8.3 (7–11) mg/kg/day in MAL26 (T15
printed 5–11; MAL26 is used and the change noted).

| Weight | AS + MQ daily |
|---|---|
| under 9 kg (T15: 5 to under 9) | 25 + 55 mg |
| 9 to under 18 | 50 + 110 mg |
| 18 to under 30 | 100 + 220 mg |
| 30 or more | 200 + 440 mg |

**AS+SP**: AS once daily for 3 days; SP a single dose on day 1 (at least 25/1.25 mg/kg).

| Weight | AS daily | SP on day 1 |
|---|---|---|
| under 10 kg (T15: 5 to under 10) | 25 mg | 250/12.5 mg |
| 10 to under 25 | 50 mg | 500/25 mg |
| 25 to under 50 | 100 mg | 1,000/50 mg |
| 50 or more | 200 mg | 1,500/75 mg |

**DHA-PPQ**, once daily for 3 days; targets for 25 kg or more: DHA 4 (2–10), PPQ 18 (16–27)
mg/kg/day; under 25 kg: DHA 4 (2.5–10), PPQ 24 (20–32).

| Weight | DHA + PPQ daily |
|---|---|
| under 8 kg (T15: 5 to under 8) | 20 + 160 mg |
| 8 to under 11 | 30 + 240 mg |
| 11 to under 17 | 40 + 320 mg |
| 17 to under 25 | 60 + 480 mg |
| 25 to under 36 | 80 + 640 mg |
| 36 to under 60 | 120 + 960 mg |
| 60 to under 80 | 160 + 1,280 mg |
| 80 or more | 200 + 1,600 mg |

**Source defect.** Both T15 and MAL26 print the last two DHA-PPQ bands as "60 < 80" and ">80", which
leaves exactly 80 kg in no band. The tile reads them as "60 to under 80" and "80 or more", consistent
with every other band in the table, and states that reading. It is a named test.

**Output.** mg per dose, doses per day, days, the achieved mg/kg against the target range (flagged
outside it), and notes: re-dose if vomited within 1 hour; prefer pediatric formulations to split
adult tablets (MAL26 p. 188 discourages splitting); SP loses efficacy with 5 mg folic acid daily but
not with 0.4 mg; DHA-PPQ: avoid high-fat meals and QT-prolonging drugs.

**Edges and traps.** Every band edge, below and at. An **empty weight refuses** (every table opens
with an "under" band, so a zero would land in the smallest dose). No regimen default. The under-5 kg
AL band needs a formulation that may not exist locally; if not, MAL26 says give an ACT at the same
mg/kg as for a 5 kg child, which the tile prints. **Artesunate-pyronaridine is not built**: MAL26
gives no dose table (only a manufacturer's label does); the regimen list names it with "no WHO dose
table; see the product label". The widely quoted AL hour schedule (0, 8, 24, 36, 48, 60 h) is in no
WHO text read and is not printed.

**Overlap.** `weight-dose` and `peds-weight-dose` carry no band tables.

## 2. `severe-malaria-injectable` — Injectable Artesunate, Artemether or Quinine for Severe Malaria (WHO)

**Question.** What is the injectable antimalarial dose for severe malaria at this weight?

**Inputs.** Weight (kg, required); drug (IV or IM artesunate / IM artemether / quinine
dihydrochloride; required, no default).

**Logic.**

- **Artesunate (MAL26 §5.2.2.1, p. 218):** **3 mg/kg per dose under 20 kg; 2.4 mg/kg at 20 kg or
  more.** Schedule on admission (0 h), 12 h, 24 h, then once daily (SMH12 p. 41; MAL26 does not
  restate the times). At least 24 hours of injectable treatment and until oral treatment is
  tolerated, then a full 3-day ACT (MAL26 p. 216), avoiding mefloquine-containing ACTs after
  impaired consciousness. Applies to infants, pregnant women in all trimesters, and breastfeeding
  women.
- **Artemether IM (MAL26 p. 219; only if artesunate is unavailable):** 3.2 mg/kg into the anterior
  thigh, then 1.6 mg/kg daily.
- **Quinine (MAL26 p. 219):** loading **20 mg salt/kg**; then 10 mg salt/kg every 8 hours starting 8
  hours after the first dose; if no improvement in 48 hours (or continuing kidney injury), reduce by
  a third to 10 mg salt/kg every 12 hours. Infuse over 4 hours, never faster than 5 mg salt/kg per
  hour, never as an IV push. IM: split the first 10 mg/kg between the two thighs, diluted to 60–100
  mg/mL. No adjustment on hemodialysis. **Doses are salt, not base**, labelled on every line.

**Output.** mg per dose and the schedule with times from the entered start time. **No mL output**:
reconstitution volumes are product-specific and MAL26 gives none beyond "approximately 5 mL of 5%
dextrose". The tile says so rather than assume a product.

**Edges.** 19.9 vs 20.0 kg (the artesunate step). Pairs with `who-severe-malaria` (criteria), which
gains a link here. IRIS lists a 2026 paper on single-step injectable artesunate not yet in MAL26;
watch in staleness.

## 3. `rectal-artesunate-prereferral` — Rectal Artesunate Before Referral for Children Under 6 (WHO)

**Question.** How many 100 mg rectal artesunate suppositories does this child get before referral,
and is it the right choice?

**Inputs.** Age (years, required; the hard stop is 6); weight (kg, preferred) or age band; IM
artesunate available here (yes / no, required); expected time to reach referral care under 6 hours
(yes / no, required); a danger sign present (fever with convulsions, unusual sleepiness or
unconsciousness, unable to drink or feed, vomiting everything; three-state).

**Logic.**

- **Eligibility (MAL26 §5.2.2.3, pp. 221–222):** where IM artesunate is not available, children
  **under 6 years** get a single rectal dose of **10 mg/kg** and are referred immediately. **Not for
  older children or adults.** Pre-referral treatment is advised unless referral takes under 6 hours.
  Order of preference under 6 years: IM artesunate, rectal artesunate, IM artemether, IM quinine.
- **Weight rule (RAS17 p. 5):** children should be over- rather than under-dosed: **up to 10 kg, one
  100 mg suppository; up to 20 kg, two.** RAS17 gives no rule above 20 kg for a child under 6; the
  tile refuses rather than invent one.
- **Expelled within 30 minutes:** insert another and hold the buttocks together for 10 minutes.
- **2023 conditions (RAS23):** rectal artesunate must always be followed by injectable artesunate and
  a full 3-day ACT at the referral facility; the answer prints this in full, because the 2023 update
  kept the recommendation only with that continuum of care.

**Output.** Suppository count, the "refer now" instruction, and what the referral facility must give.

**Traps.** The weight rule over-doses on purpose; the answer says that is the source's rule. The
2012 training manual's age bands (6 months–3 years 100 mg, above 3 years 200 mg) were read through
poor OCR and are shown only as "the 2012 manual used age bands", not as doses. The iCCM chart's age
bands (spec-v1546) link here.

## 4. `malaria-pregnancy-treatment` — Which Malaria Treatment in Pregnancy? (WHO 2026)

**Question.** Which antimalarial does WHO recommend for this pregnant woman?

**Inputs.** Trimester (first / second / third, required); severity (uncomplicated / severe,
required); species (P. falciparum / P. vivax or ovale, required).

**Logic (MAL26).**

- **Uncomplicated falciparum, first trimester (2022, p. 183):** artemether-lumefantrine. AS+AQ,
  AS+MQ, or DHA-PPQ may be considered where AL is not available or recommended. **AS+SP and
  artesunate-pyronaridine are not for the first trimester.** (The 2022 change retired quinine plus
  clindamycin.)
- **Second and third trimesters:** any ACT on the list (p. 171).
- **Severe, any trimester:** injectable artesunate (tile 2).
- **Vivax or ovale:** treat the blood stage (chloroquine or an ACT); weekly chloroquine
  chemoprophylaxis may be given until delivery and breastfeeding end, then primaquine based on
  G6PD status. **Primaquine and tafenoquine are contraindicated in pregnancy.**

**Output.** The regimen name, why, and a link to tile 1 or 2 for the dose.

## Tests

`test/unit/malaria-treatment.test.js`: every band edge of all five ACT tables; the 80 kg DHA-PPQ
reading; blank weight and blank regimen refuse; artesunate at 19.9/20.0 kg; quinine salt labelling
and the 48-hour step-down; rectal artesunate at 10.0/10.1 and 20.0/20.1 kg and at age 6; each
pregnancy branch. A "MAL26 band snapshot" test fails if any band is edited without updating the
version date.

## Staleness

MAL26 *high* (6-month review). SMH12 *low*. RAS23 *moderate*.
