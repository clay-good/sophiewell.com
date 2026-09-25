# spec-v1548 — Growth and wasting: z-scores, MUAC, and where to treat

Program: [scope-field-health.md](scope-field-health.md). Rules: [spec-v1540](spec-v1540.md).
Three new tiles and one backfill to `who-growth-zscore`, which also fixes a live accuracy defect.

## Sources (read in full)

| Key | Document | Licence |
|---|---|---|
| CDCWHO | CDC NCHS, *WHO Growth Chart data files*: weight-for-length (45–110 cm) and head circumference-for-age (0–24 months), boys and girls | No copyright line; CDC public-domain policy (same basis as the existing tile) |
| WHO06 | WHO Multicentre Growth Reference Study Group. *WHO Child Growth Standards: methods and development.* 2006 | All rights reserved (method facts only) |
| WHOCOMP | WHO. *Computation of centiles and z-scores* (the restricted-z method) | WHO copyright (formula only) |
| ANTH19 | WHO/UNICEF. *Recommendations for data collection, analysis and reporting on anthropometric indicators in children under 5.* 2019 | CC BY-NC-SA 3.0 IGO |
| WAST23 | WHO. *Guideline on the prevention and management of wasting and nutritional oedema in infants and children under 5 years.* 2023 (IRIS 10665/376075) | CC BY-NC-SA 3.0 IGO |
| SAM13 | WHO. *Updates on the management of severe acute malnutrition.* 2013 | All rights reserved |
| SAMC21 | WHO. *Training course on the inpatient management of SAM*, module 4. 2021 | CC BY-NC-SA 3.0 IGO |
| MUAC20 | UNICEF. *Child MUAC tape specification.* May 12, 2020 | Facts only (band limits) |

## What is blocked, and why

WHO's own tables for 24–60 months (weight-for-age, length/height-for-age, BMI-for-age),
MUAC-for-age, skinfolds, growth velocity, and the 5–19 year reference are published only on
WHO's website (non-commercial terms, and "substantial portions" need written permission) or in
GPL-3 R packages. None may be bundled. They are listed in spec-v1564 with the permission request.
**This spec uses only the four CDC-redistributed sets**, plus one verified fact that stretches
them: WHO derived weight-for-height by shifting the weight-for-length curve 0.7 cm (WHO06 p. 20).
The research checked all 888 overlapping rows of WHO's own two tables and found them identical
under that shift. So CDC's weight-for-length file also gives **weight-for-height for 65.0–109.3
cm** (the file stops at 110 cm). Interpolating CDC's 0.5 cm grid linearly was off by at most
0.0022 z against WHO's 0.1 cm table.

---

## 1. Backfill: `who-growth-zscore` — add wasting and head size, and fix the z beyond ±3

**Live defect.** `lib/peds-growth-v141.js` computes weight-for-age z with the plain LMS formula.
WHO's method restricts weight-based z-scores beyond ±3 SD, because percentiles out there do not
track the LMS curve. The research checked against WHO's daily tables:

| Child | Tile today | WHO |
|---|---|---|
| Boy, 365 days, 5.5 kg | −5.05 | −4.75 |
| Girl, 183 days, 4.0 kg | −5.05 | −4.69 |
| Boy, 365 days, 16.0 kg | +4.71 | +4.96 |

The two agree exactly at ±3, so **no band changes**; only the printed z beyond ±3 disagrees with WHO
Anthro. A health worker comparing with a WHO Anthro printout sees two numbers for one child.

**Changes.**

1. **Restricted z for weight-based indicators** (weight-for-age, weight-for-length/height): if the
   raw z is above 3, z = 3 + (y − SD3pos) / (SD3pos − SD2pos); below −3, z = −3 + (y − SD3neg) /
   (SD2neg − SD3neg), with SDk = M(1 + L·S·k)^(1/L) (WHOCOMP pp. 1–3). Length-for-age and head
   circumference use the plain formula, as WHO Anthro does. Rounded to 2 decimals.
2. **New measures:** weight-for-length (under 24 months, 45–110 cm); weight-for-height (24 months
   or more, 65.0–109.3 cm, via the 0.7 cm shift); head circumference-for-age (0–24 months).
3. **Measured lying or standing** (required). The 0.7 cm rule (ANTH19 p. 53): add 0.7 cm to a
   standing height taken under 2 years; subtract 0.7 cm from a lying length taken at 2 years or
   more. The age cut is 731 days, as WHO Anthro uses. A "standing" position under 9 months is
   flagged as a likely entry error.
4. **Implausible-value flags** (ANTH19 p. 60 text and WHO Anthro defaults): weight-for-age below −6
   or above 5; length/height-for-age beyond ±6; weight-for-length/height and head circumference
   beyond ±5. The flag prints "check the measurement" and still shows the z. ANTH19's Table 8 prints
   the weight-for-age and weight-for-height flags swapped, against its own text and WHO's code;
   the text is followed and the discrepancy is noted in a code comment.
5. **Edema.** A required "edema of both feet" input for weight-based measures. If present, **no
   weight-based z is printed**: the answer says weight is not interpretable with edema and that
   edema itself classifies severe acute malnutrition (link to tile 2).
6. **Out of range refuses:** weight-for-height above 109.3 cm (the CDC file cannot supply it),
   head circumference over 24 months, any measure outside its table.

**Tests.** The three rows above reproduce WHO to 2 decimals; weight-for-height at 65.0 and 109.3 cm
and refusal at 109.4; the 0.7 cm rule at 730 and 731 days; edema suppresses the z; each flag edge.
Expected values come from WHO `anthro` run in a fixture-generation script (GPL, used as an oracle
only, never copied into `lib/`). Head circumference interpolates monthly rows; its error against
WHO's daily rows is measured in the test and must stay under 0.01 z.

## 2. `wasting-classify` — Severe and Moderate Wasting in Children 6–59 Months (WHO 2023, MUAC and WHZ)

**Question.** Does this child have severe acute malnutrition, moderate wasting, or neither, by WHO's
2023 definitions?

**Inputs.** Age (months, 6–59, required); MUAC (mm, 80–250; cm accepted and converted); WHZ or WLZ
(−6 to +5, or computed by tile 1 from weight and length); edema of both feet: none / + / ++ / +++
(**required**). At least one of MUAC or WHZ unless edema is present.

**Logic (WAST23 §1.2, pp. 30–31).**

- **Severe acute malnutrition:** edema (any grade), and/or WHZ below −3, and/or MUAC below 115 mm.
- **Moderate wasting:** WHZ from −3 to below −2, and/or MUAC from 115 to below 125 mm, with no edema.
- **Not wasted:** WHZ −2 or more and MUAC 125 mm or more (whichever were measured), no edema.
- **Edema grades (SAM13 p. 11):** + both feet; ++ both feet plus lower legs, hands, or lower arms;
  +++ generalized, including the face.
- **MUAC tape color (MUAC20):** red below 115 mm, yellow 115 to below 125, green 125 or more. The
  tape prints 11.5 in both red and yellow; WHO's definition decides that 115 exactly is yellow and
  125 exactly is green.

**Output.** The classification, which measure put it there (MUAC, WHZ, edema), the tape color word,
and a line when only one of MUAC or WHZ was measured ("WHZ not measured; MUAC alone was used"). A
child can be severe by MUAC with a normal WHZ, or the reverse; the worse one decides and both are
shown. Links to tile 3 for where to treat.

**IMCI note.** CB14 (2014) calls these "complicated SAM", "uncomplicated SAM" and "moderate acute
malnutrition" and sends every child with edema of both feet for urgent referral. The 2023 care
setting rules (tile 3) are less strict. The answer names both.

**Edges.** MUAC 114/115/124/125; WHZ −3.00 exactly is moderate (−3 or more) and −3.01 severe; edema
blank refuses; under 6 months refuses and links tile 4.

## 3. `sam-care-setting` — Admit or Treat at Home? Severe Acute Malnutrition, 6–59 Months (WHO 2023)

**Question.** Should this child with severe acute malnutrition be admitted, have an in-depth
assessment first, or be treated as an outpatient, and when can they move on or be discharged?

**Inputs.** Mode: "at presentation" / "ready to move to outpatient care?" / "ready to exit
treatment?" (required).

- At presentation: any IMCI danger sign; an acute medical problem; edema +++; appetite test (passed
  / failed / not done); in-depth assessment items (a problem needing investigation but not
  immediate admission; a chronic condition linked to nutrition; not gaining weight in outpatient
  care; a previous episode of SAM). Three-state each.
- Transfer: no danger signs for 24–48 hours; medical problems resolved enough; no continued weight
  loss; edema no longer +++ and resolving; good appetite.
- Exit: WHZ and MUAC at the last two visits; edema at the last two visits.

**Logic (WAST23 recs B2, B3, B5, pp. 17–19).**

- **Admit** if any: danger sign, acute medical problem, edema +++, or failed appetite test.
- Else **in-depth assessment** if any in-depth item.
- Else **outpatient**, when the appetite test is passed.
- **Appetite test (SAMC21 module 4, p. 37):** passed if the child eats at least 30 g of RUTF (a third
  of a 92 g sachet) within 30 minutes.
- **Transfer to outpatient** when every transfer item is met. WAST23 B3(b): do **not** use a WHZ or
  MUAC threshold to decide transfer; the tile has no such input.
- **Exit:** WHZ −2 or more **and** MUAC 125 mm or more at **2 consecutive visits**, and no edema for 2
  consecutive visits. Percent weight gain is not an exit criterion.

**Edges and traps.** An appetite test "not done" is never "passed"; the tile asks for it. WAST23's
glossary defines recovery with "and/or" depending on how the child was admitted, while B5 says
"and"; the tile implements B5 and the answer quotes the difference in one sentence.

## 4. `infant-at-risk-under-6-months` — Infants Under 6 Months at Risk of Poor Growth (WHO 2023)

**Question.** Does this infant under 6 months need admission, an in-depth assessment, or outpatient
follow-up?

**Inputs.** Age (weeks, 0–<26); IMCI danger sign; acute problem or severe IMCI classification;
edema; recent weight loss; in-depth items: a medical problem needing investigation or a chronic
condition, WAZ (optional, from tile 1), WLZ (optional), MUAC (optional, mm), failure to gain weight
at two consecutive measurements, ineffective breastfeeding, feeding concerns if not breastfed,
maternal or social concerns. Three-state each.

**Logic (WAST23 rec A2, p. 14).** **Admit** if any: danger sign; acute problem or severe
classification; edema; recent weight loss. Else **in-depth assessment** if any: a medical problem
needing investigation or a chronic condition; **WAZ below −2, WLZ below −3, or MUAC below 110 mm
(MUAC only from 6 weeks to under 6 months)**; failure to gain weight twice; ineffective
breastfeeding; feeding concerns; maternal or social issues. Else **outpatient** follow-up. Transfer
out of inpatient care (A3) needs no danger signs for 48 hours and documented weight gain for 2–3
days, among other items, which print as a checklist.

**Edges and traps.** There is **no SAM MUAC cutoff under 6 months**, and 110 mm applies only from 6
weeks. RUTF is not given under 6 months (SAMC21); the tile says so if asked about feeding.

## Tests

`test/unit/growth-wasting.test.js`: the restricted-z oracle rows; every MUAC and WHZ edge; edema
blocks weight z and forces SAM; the admit, assess, outpatient branches; exit needs two visits;
MUAC at 5 and 6 weeks in tile 4; empty forms refuse.

## Staleness

CDCWHO and WHO06 *low*. WAST23 *low*, with one flag: SAMC21's footnote says WHO is reviewing the 30%
edema-weight assumption, which would touch spec-v1549.
