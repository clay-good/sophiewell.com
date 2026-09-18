# spec-v1400 — city-burden infectious disease I: serology and TB

Program: [scope-state-practice.md](scope-state-practice.md). Group J. Specialties:
`infectious-disease`, `family-medicine`, `obstetrics`, `neonatology`, `hepatology`,
`nursing-general`. Audiences: clinicians, educators.

These are **national** tiles, from CDC sources that are US government works (public domain). They
are in this program because the need concentrates in these cities: CA, TX, and NY lead the
nation in TB cases, TX and CA lead it in congenital syphilis, and the Bronx, Harris County, and
Los Angeles have the densest HIV, HBV, and HCV testing load. They also close gaps the state tiles
point to: `prenatal-infection-screening-schedule` sends a positive result to
`congenital-syphilis-scenario`, and `ny-hiv-hcv-test-offer` sends a reactive antibody to
`hcv-test-sequence`. The catalog has `tb-testing`, `lyme-two-tier`, and `sti-screening`, but **no
serology interpreter for syphilis, HBV, or HCV**.

| tile | the reading it prevents |
|---|---|
| `syphilis-serology-sequence` | a reactive treponemal EIA with a nonreactive RPR read as "false positive" **without the TP-PA** |
| `congenital-syphilis-scenario` | a newborn called "less likely" when the mother's treatment began **under 30 days** before delivery |
| `hbv-serology` | isolated anti-HBc read as immunity (it has four possible meanings, one of them susceptible) |
| `hcv-test-sequence` | a reactive antibody read as current infection without an RNA test |
| `ca-adult-tb-risk` | a patient from a high-burden country not tested because they "feel fine" |
| `ltbi-regimen-dosing` | the 9-month isoniazid default, when 3HP, 4R, and 3HR are preferred |

## `syphilis-serology-sequence` — Syphilis Serology Interpreter (Traditional and Reverse Sequence)

Inputs: the algorithm (traditional: nontreponemal first, or reverse: treponemal first), each
result, the RPR/VDRL titer, prior treatment and prior titer. Output: CDC's interpretation and
next test. In reverse sequence, EIA/CIA reactive with RPR nonreactive leads to a **second,
different treponemal assay (TP-PA)**. TP-PA reactive means past or present syphilis; TP-PA
nonreactive means syphilis is unlikely. With a prior titer, a **fourfold** change is flagged
(two dilutions). Source: *CDC Laboratory Recommendations for Syphilis Testing, United States,
2024*, MMWR Recomm Rep 2024;73(RR-1).

## `congenital-syphilis-scenario` — Congenital Syphilis Evaluation Scenario (CDC 2021)

Inputs: infant exam (normal / consistent with congenital syphilis), infant and maternal
nontreponemal titers, maternal treatment (none, inadequate, erythromycin or non-penicillin,
penicillin), **the date maternal treatment began versus delivery**, and the maternal titer course.
Output: Scenario 1–4, the recommended evaluation (CSF VDRL, cell count and protein, CBC,
long-bone films), and the regimen with **weight-based dose** from the entered weight.

- **1, proven or highly probable:** abnormal exam, **or** an infant titer **fourfold or more** above
  the maternal titer, **or** positive darkfield, PCR, or silver stain. Aqueous penicillin G
  50,000 U/kg IV every 12 h for 7 days, then every 8 h, 10 days total, or procaine penicillin G
  50,000 U/kg IM daily for 10 days.
- **2, possible:** normal exam and titer under fourfold, **and** the mother was untreated,
  inadequately treated, treated with a non-penicillin drug, or **treated under 30 days before
  delivery**.
- **3, less likely:** mother adequately treated **30 or more days** before delivery, with no
  reinfection. Benzathine penicillin G 50,000 U/kg IM once.
- **4, unlikely:** adequate treatment **before pregnancy** with a stable low titer.

Source: CDC STI Treatment Guidelines, 2021, Congenital Syphilis. The 30-day date is computed from
the two entered dates. The date arithmetic is the reason the tile exists.

## `hbv-serology` — Hepatitis B Serology Interpreter (CDC)

Inputs: HBsAg, total anti-HBc, IgM anti-HBc, anti-HBs (each positive / negative / not done).
Output: CDC's interpretation (susceptible; immune from vaccination; immune from natural infection;
acute infection; chronic infection) or, for **isolated anti-HBc**, all four possibilities
(resolved infection, false-positive anti-HBc, low-level chronic infection, resolving acute
infection) and the next step. A panel with any marker "not done" names what it cannot distinguish.
It does not guess. The note states CDC's 2023 recommendation: universal triple-panel screening
(HBsAg, anti-HBs, total anti-HBc) **at least once for every adult 18 or older**. Sources: CDC,
*Interpretation of Hepatitis B Serologic Test Results*. *Screening and Testing for Hepatitis B Virus
Infection: CDC Recommendations, United States, 2023*, MMWR Recomm Rep 2023;72(RR-1).

## `hcv-test-sequence` — Hepatitis C Testing Sequence (CDC)

Inputs: HCV antibody (nonreactive / reactive), HCV RNA (detected / not detected / not done),
suspected recent exposure. Output: no infection; current infection (link to care); **no current
infection**, with the note that past resolved infection and a false-positive antibody are
distinguished only by a different antibody assay; or **RNA needed** (a reactive antibody alone is
never a diagnosis). With recent exposure and a nonreactive antibody, it states that RNA testing
is how an early infection is found. Sources: CDC, *Testing for HCV Infection: An Update of
Guidance for Clinicians and Laboratorians*, MMWR 2013;62(18); universal adult screening at least
once, CDC 2020.

## `ca-adult-tb-risk` — California Adult TB Risk Assessment (CDPH)

Inputs: the three CDPH risk boxes: birth, travel, or residence **for at least 1 month** in a
country with an elevated TB rate; current or planned immunosuppression; and close contact with
infectious TB, or experiencing homelessness or incarceration. Output: test (IGRA preferred) or do
not test. An elevated rate means **10 or more per 100,000**. Source: CDPH *California Adult TB Risk
Assessment*, **September 2026 version**. **Source typo, handled:** the form gives steroids as
"prednisone ≥15 mg/kg/day". The dose is 15 **mg/day** for at least a month, as in every other CDC and
CDPH document. The tile uses mg/day and the note says so, citing the correction. Siblings to queue next: the CDPH pediatric (August
2024) and school-staff (February 2026) versions.

## `ltbi-regimen-dosing` — Latent TB Treatment Regimen and Dose (CDC/NTCA 2020)

Inputs: weight, age, the regimen (3HP, 4R, 3HR, 6H/9H), HIV status and antiretrovirals, and
pregnancy. Output: each drug's dose, count, and duration, with the maxima.

- **3HP:** 12 weekly doses. Isoniazid 15 mg/kg for 12 years and older (25 mg/kg for ages 2–11),
  rounded up to the nearest 50 or 100 mg, maximum 900 mg. Rifapentine by weight band: 300 / 450 /
  600 / 750 / **900 mg max**.
- **4R:** rifampin 10 mg/kg adults (15–20 mg/kg children), maximum 600 mg, 120 doses.
- **3HR:** isoniazid 5 mg/kg (300 mg max), rifampin 10 mg/kg (600 mg max), 90 doses.

Rifamycin interactions with antiretrovirals and hormonal contraception are **flagged, not
resolved**. The tile points to an interaction check. It says 3HP is not recommended in pregnancy.
Source: NTCA/CDC, MMWR Recomm Rep 2020;69(RR-1), and the CDC LTBI regimens table.

## Acceptance

- Congenital syphilis: two examples identical except maternal treatment at 35 versus 25 days before
  delivery. The results are Scenario 3 and Scenario 2.
- HBV: isolated anti-HBc prints all four meanings. A panel with anti-HBs "not done" does not print
  "immune".
- HCV: a reactive antibody with RNA "not done" never prints "infected" or "not infected".
- LTBI: a 60 kg adult on 3HP gets rifapentine 900 mg and isoniazid 900 mg; a 30 kg 10-year-old
  gets isoniazid by the 25 mg/kg rule.
