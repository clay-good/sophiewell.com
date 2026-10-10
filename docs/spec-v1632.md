# spec-v1632 — Dose checks read from the FDA label (renal, hepatic, weight, age, indication)

**Status:** Proposed, October 10, 2026. Specs only; nothing here is built. 18 new tools, none build-gated.
**Charter:** [spec-v1627](spec-v1627.md). **Machinery:** [spec-v1628](spec-v1628.md). **Ledger:** [scope-pharmacy-practice.md](scope-pharmacy-practice.md).

An order-verification pharmacist asks the same question several hundred times a shift: is this
dose right for this kidney function, this liver, this weight, this indication? The answer is in
section 2 of the label, and finding it means opening DailyMed and reading a table. This wave
gives the pharmacist 18 tools that take the patient facts and the drug and **report the row the
current label gives**, with the label's set id, version and publication date. They never
recommend, and they stop answering when the label they were read from has been replaced.

Research date: October 10, 2026. Every row below was read that day from the label's SPL XML,
fetched through the DailyMed web service, and the high-harm rows were read a second time the same
day from a fresh fetch (Research record). Rows not read are listed under Verify at build.

## 0. Shared pattern (build once; every tool below uses it)

### 0.1 Structure decision

| Option | Verdict | Why |
|---|---|---|
| One tool per drug (about 75 ids) | No | Seventy-five tiles with one shape. It splits one calculation (find the band, report the row) into many ids, and each new drug costs the full new-tile recipe. |
| One generic `label-renal-dose` over a 75-drug data file | No | The inputs are not the same question. Labels key on CrCl (mL/min), CrCl normalized to 1.73 m² (levetiracetam, ertapenem, topiramate, atenolol, rosuvastatin), eGFR (metformin, SGLT2, sitagliptin, allopurinol, nirmatrelvir), serum creatinine (tranexamic acid, cefazolin's alternate, apixaban), Child-Pugh class, weight band, age, and potassium. One agent tool with a 75-value enum and per-drug conditional fields is untyped in practice, and one citation line cannot name 75 labels. |
| **One engine and one dataset, surfaced as class tools** | **Yes** | This is what `abx-renal` already is (a per-drug band table in `data/abx-renal/abx.json`, a drug select, each result naming its label). A class tool has one input shape, a small drug enum for agents, and a citation list a reader can scan. A label that carries an algorithm rather than a band table (dofetilide, apixaban's 2-of-3, eplerenone's potassium table, ketorolac's limits, the GLP-1 escalation) gets its own compute inside its class tool or its own tool. |

**One engine, program-wide.** `chemo-organ-label-dose` in [spec-v1635](spec-v1635.md) and the
label-reading tools in [spec-v1630](spec-v1630.md), [spec-v1631](spec-v1631.md),
[spec-v1633](spec-v1633.md), [spec-v1636](spec-v1636.md) and [spec-v1639](spec-v1639.md) use this
same engine and the same label-edition contract.

**Label-edition contract.** Specified once in [spec-v1628 §1](spec-v1628.md) and not repeated
here: which set id is pinned, how an edition is dated, the weekly `watch-dailymed.mjs`, and the
12-month expiry. A drug whose label section changed stops answering; the other drugs in the same
class tool keep answering.

**Group.** F (Medications), beside the live `abx-renal`. This holds for every tool in this file.

**Findability.** Every drug's generic and brand name is a synonym (`data/synonyms.json`) that
routes to its class tool with the drug preselected (the query-compute prefill the home box
already does). The test is per drug: typing `apixaban` or `Eliquis` lands on `doac-dose-check`
with apixaban selected.

### 0.2 Dataset: `data/label-dose/` (one shard per class)

One row per drug per label. The edition fields (`setId`, `splVersion`, `publishedOn`,
`verifiedOn`, `supersededOn`, the section hash) are the ones spec-v1628 §1 defines. This wave adds:

```
{ drug, brand, /* edition fields per spec-v1628 §1 */
  basis: 'crcl' | 'crcl-bsa' | 'egfr' | 'scr' | 'child-pugh' | 'weight' | 'age' | 'potassium',
  crclWeight: 'actual' | 'ideal' | 'not stated',   // what the label says to use, verbatim
  rows: [ { indication, from, to, fromExclusive, toInclusive, text, flag } ] }
```

`flag` is one of `dose`, `no-adjustment`, `not-recommended`, `contraindicated`,
`no-recommendation-given`. `abx-renal`'s four rows move into this shape unchanged.

### 0.3 Output rules specific to dose checks

- The result is the label's row, close to verbatim, then "Label: {brand} set id {setId},
  version {n}, published {date}" with the link.
- Never "give", "reduce to" or "safe" in the tool's own voice. "The label gives 15 mg once
  daily for this clearance and indication."
- When the label gives no number for the input ("dosing recommendations cannot be provided",
  "dose should be individualized"), the tool says exactly that. It does not fall back to the
  nearest band.
- A boundary value follows the label's own wording, and the dataset records which side is
  inclusive. Where the label's bands overlap or leave a gap (listed per tool), the tool reports
  both rows or says the label does not cover the value.
- A blank required field gives no result (no default clearance, no default indication).
- Each tool states which clearance the label asks for and with which weight, and links
  `cockcroft-gault` or `egfr-suite`. It does not compute clearance itself except where the
  label defines a derived quantity (levetiracetam, below).

## Gap finder

**Method.** For each drug: the catalog was searched by generic name, brand, class and the output
("renal dose", "creatinine clearance", "titration"); the live neighbor's lib source was read
where one existed (`abxRenalDose` in `lib/medication-v4.js`,
`enoxaparinDose` in `lib/clinical-v8.js`, `digoxin` in `lib/medication-v5.js`); then the label was
fetched. 106 label files were fetched (a few were wrong matches or older copies and were
replaced); about 75 drugs carried a computable row. No tool id below is live, and none is
specified in another spec of this program.

**Live in this domain:** `abx-renal` (cefepime, piperacillin-tazobactam, vancomycin, IV
ciprofloxacin; FDA labels), `vte-prophylaxis-dose` (enoxaparin prophylaxis and treatment,
CrCl < 30), `digoxin`, `heparin-nomogram`, `sugammadex`, `anticoag-reversal`,
`periop-bridging`, `cockcroft-gault`, `egfr-suite`, `salazar-corcoran`, `meld-childpugh`,
`dose-calendar`, `peds-dose`, `qtc`, `tisdale-qtc`. No catalog entry names any DOAC, antiviral,
gabapentinoid, metformin, SGLT2 inhibitor, DPP-4 inhibitor, GLP-1 agonist, dofetilide, sotalol,
colchicine, allopurinol, bisphosphonate, tranexamic acid dose, ketorolac, famotidine or
metoclopramide as a dose check.

| Proposed | Live neighbor | Difference |
|---|---|---|
| `doac-dose-check` | `anticoag-reversal`, `periop-bridging`, `hasbled` | Those reverse, bridge or score. None reports the label dose for an indication and clearance. |
| `lmwh-fondaparinux-dose-check` | `vte-prophylaxis-dose`, `heparin-nomogram` | Enoxaparin and heparin only. Dalteparin and fondaparinux are absent. |
| `iv-antithrombotic-renal-check` | `heparin-nomogram`, `vasopressor` | No bivalirudin, eptifibatide, tirofiban or argatroban. |
| `antiviral-renal-dose`, `nrti-renal-dose` | `abx-renal`, `npep-2025`, `hbv-serology` | Antibiotics only; the HIV and HBV tools decide or interpret, they do not dose by clearance. |
| `gabapentinoid-renal-dose`, `cns-renal-dose-check` | none | No live tool names these drugs. |
| `diabetes-drug-egfr-check` | `egfr-suite` | Computes eGFR; says nothing about a drug. |
| `glp1-titration-check` | `dose-calendar`; `label-titration-calendar` in [spec-v1633](spec-v1633.md) | `dose-calendar` lays out dates from a schedule the reader types, and `label-titration-calendar` prints a dated schedule from a preset. This holds the GLP-1 labels' escalation steps and checks an order against them. Missed doses are `missed-dose-label-rule` in [spec-v1639](spec-v1639.md). |
| `dofetilide-dose-algorithm` | `qtc`, `tisdale-qtc` | Those correct or score QT. Neither applies the label's CrCl dose and the 15% / 500 ms rule. |
| `cardiac-renal-dose-check`, `mra-potassium-dose-check` | `digoxin`, `potassium-deficit` | Neither reports a label dose for sotalol, atenolol, lisinopril, sacubitril-valsartan, rosuvastatin, spironolactone or eplerenone. |
| `gout-drug-renal-dose` | `gout-acr-eular-2015` | Classification criteria, not dosing. |
| `bisphosphonate-renal-check` | none | No live tool names a bisphosphonate. |
| `tranexamic-acid-renal-dose` | `batt`, `pph-who-2025` | Those decide whether to give TXA; neither adjusts for creatinine. |
| `ketorolac-limit-check` | `apap-24h-max` | Same shape (a ceiling check), different drug. |
| `gi-drug-dose-check` | none | No live tool doses famotidine or metoclopramide. |
| `hepatic-label-dose` | `meld-childpugh` | Computes the class; this reports what a label does with it. |

## Tools

"Clearance" inputs are numbers the reader supplies; each tool names the equation and weight the
label asks for.

### 1. `doac-dose-check` — DOAC Dose by Indication and Kidney Function (Label Check)

**Input.** Drug; indication (the label's list for that drug); CrCl (mL/min); for apixaban: age,
weight, serum creatinine; for edoxaban: weight; interacting-drug flags the label names.
**Compute.**
- **Apixaban** (Eliquis, version 30). Atrial fibrillation: 5 mg twice daily; 2.5 mg twice daily
  when at least two of age ≥ 80 years, weight ≤ 60 kg, serum creatinine ≥ 1.5 mg/dL. DVT
  prophylaxis after hip or knee replacement: 2.5 mg twice daily (35 days hip, 12 days knee).
  DVT/PE treatment: 10 mg twice daily for 7 days, then 5 mg twice daily. Reduction of
  recurrence: 2.5 mg twice daily after at least 6 months. Combined P-gp and strong CYP3A4
  inhibitor: reduce a 5 or 10 mg dose by 50%; at 2.5 mg twice daily, avoid. The 2-of-3 rule
  applies to the AF indication only; the tool must not apply it to VTE.
- **Rivaroxaban** (Xarelto, version 65; label says calculate CrCl with **actual** weight).
  AF: CrCl > 50, 20 mg once daily with the evening meal; CrCl ≤ 50, 15 mg once daily (the label
  notes CrCl < 30 was not studied). DVT/PE treatment: CrCl ≥ 15, 15 mg twice daily for 21 days,
  then 20 mg once daily; CrCl < 15, avoid. Reduction of recurrence, hip (35 days), knee (12
  days), acutely ill medical (31 to 39 days): CrCl ≥ 15, 10 mg once daily; < 15, avoid. CAD and
  PAD: 2.5 mg twice daily with aspirin, no adjustment by CrCl.
- **Dabigatran** (Pradaxa capsules, version 48). AF: CrCl > 30, 150 mg twice daily; 15 to 30,
  75 mg twice daily; < 15 or dialysis, no recommendation given. With dronedarone or systemic
  ketoconazole: CrCl 30 to 50, 75 mg twice daily; CrCl < 30, avoid. DVT/PE treatment and
  recurrence: CrCl > 30, 150 mg twice daily; ≤ 30 or dialysis, no recommendation; P-gp
  inhibitor with CrCl < 50, avoid. Hip prophylaxis: CrCl > 30, 110 mg on day 1 then 220 mg
  once daily; ≤ 30, no recommendation; P-gp inhibitor with CrCl < 50, avoid.
- **Edoxaban** (Savaysa, version 28; Cockcroft-Gault is printed in the label). AF: 60 mg once
  daily; **do not use when CrCl > 95**; 30 mg once daily for CrCl 15 to 50. DVT/PE: 60 mg once
  daily after 5 to 10 days of parenteral therapy; 30 mg once daily for CrCl 15 to 50, weight
  ≤ 60 kg, or "certain concomitant P-gp inhibitor medications." Section 2 does not list them;
  section 14.2 names the ones the trial used (verapamil, quinidine, or short-term azithromycin,
  clarithromycin, erythromycin, oral itraconazole or oral ketoconazole), and the tool shows that
  sentence with its section number. For AF, section 7.3 says no dose reduction is recommended
  for P-gp inhibitor use. CrCl < 15, either indication: not recommended (section 8.6; section 2
  has no row).
**Output.** The label row, the rule that selected it (for apixaban, which of the three criteria
were met), and the label edition.
**Source.** The four labels (set ids in Sources).
**Scope.** Adults. The pediatric weight-band tables (rivaroxaban, dabigatran) are out; see
Rejected. Switching between anticoagulants is specified in [spec-v1633](spec-v1633.md).

### 2. `lmwh-fondaparinux-dose-check` — Dalteparin and Fondaparinux Dose by Weight (Label Check)

**Input.** Drug, indication, weight (kg), CrCl, and for dalteparin cancer VTE the month of
treatment and platelet count.
**Compute.**
- **Dalteparin** (Fragmin, version 27). Unstable angina/non-Q-wave MI: 120 units/kg every 12
  hours, not more than 10,000 units. Table 1 gives the band dose: < 50 kg 5,500; 50–59 6,500;
  60–69 7,500; 70–79 9,000; 80–89 and ≥ 90 10,000 units. Cancer VTE month 1: 200 units/kg once
  daily, not above 18,000; Table 3: ≤ 56 kg 10,000; 57–68 12,500; 69–82 15,000; 83–98 and ≥ 99
  18,000. Months 2–6: about 150 units/kg, not above 18,000; Table 4: ≤ 56 kg 7,500; 57–68
  10,000; 69–82 12,500; 83–98 15,000; ≥ 99 18,000. Platelets (adults): ≤ 50,000 stop until
  above 50,000; above 50,000 up to 100,000 reduce the daily dose by 2,500 units until the count
  is at least 100,000. CrCl < 30 in cancer VTE: the label gives no dose; it says monitor
  anti-Xa, target 0.5 to 1.5 units/mL, sampled 4 to 6 hours after a dose and after 3 to 4
  doses. Prophylaxis (fixed doses, no weight band): hip replacement, 5,000 units once daily
  after surgery, with three start options (Table 2: postoperative start 2,500 units 4 to 8
  hours after surgery; day-of-surgery start 2,500 units within 2 hours before and 2,500 units 4
  to 8 hours after; evening-before start 5,000 units 10 to 14 hours before and 5,000 units 4 to
  8 hours after); abdominal surgery, 2,500 units once daily starting 1 to 2 hours before
  surgery, or 5,000 units the evening before and then once daily when the risk is high;
  medical patients with severely restricted mobility, 5,000 units once daily.
- **Fondaparinux** (Arixtra, version 13). Prophylaxis after hip fracture, hip replacement, knee
  replacement or abdominal surgery: 2.5 mg once daily, first dose no earlier than 6 to 8 hours
  after surgery. Treatment: 5 mg (< 50 kg), 7.5 mg (50 to 100 kg), 10 mg (> 100 kg) once
  daily. Contraindicated: CrCl < 30; weight < 50 kg for prophylaxis in adults.
**Output.** Band dose and, for dalteparin, the units/kg figure next to it (they differ by
design; the label prints both), plus the contraindication line when it applies.
**Source.** Fragmin and Arixtra labels.
**Scope.** Adults. The pediatric tables in both labels are out (Rejected).

### 3. `iv-antithrombotic-renal-check` — Bivalirudin, Eptifibatide, Tirofiban, Argatroban (Label Check)

**Input.** Drug, weight, CrCl, dialysis yes/no, and for argatroban the Child-Pugh class.
**Compute.** Bivalirudin (Dr. Reddy's, version 10): no bolus reduction; CrCl < 30, infusion
1 mg/kg/h; hemodialysis, 0.25 mg/kg/h. Eptifibatide (Baxter, version 13): 180 mcg/kg bolus,
then 2 mcg/kg/min, or 1 mcg/kg/min when CrCl < 50 (PCI: second 180 mcg/kg bolus at 10 minutes).
Tirofiban (Aggrastat, version 18; Cockcroft-Gault with **actual** weight): 25 mcg/kg within 5
minutes, then 0.15 mcg/kg/min for up to 18 hours; at CrCl ≤ 60 the infusion is 0.075
mcg/kg/min. Argatroban (Hikma, version 29): HIT
without hepatic impairment 2 mcg/kg/min; moderate or severe hepatic impairment (Child-Pugh)
0.5 mcg/kg/min.
**Output.** The label rate in the label's units and the mcg/min or mg/h it comes to at the
entered weight. No pump mL/h (that is `conc-rate`).
**Source.** The four labels.

### 4. `antiviral-renal-dose` — Antiviral Dose by Kidney Function (Label Check)

**Input.** Drug, indication (per label), CrCl or eGFR as the label uses, dialysis.
**Compute.**
- **Acyclovir IV** (Eugia, version 7; CrCl in mL/min/1.73 m²): > 50, 100% every 8 h; 25 to 50,
  100% every 12 h; 10 to 25, 100% every 24 h; 0 to 10, 50% every 24 h; an added dose after each
  hemodialysis. Bands share their edges in the label.
- **Valacyclovir** (Valtrex, version 32), columns CrCl ≥ 50 / 30–49 / 10–29 / < 10: cold sores
  2 g ×2 twelve hours apart / 1 g ×2 / 500 mg ×2 / 500 mg once; genital initial 1 g q12h / no
  reduction / 1 g q24h / 500 mg q24h; recurrent 500 mg q12h / none / 500 mg q24h / 500 mg q24h;
  suppression 1 g q24h / none / 500 mg q24h / 500 mg q24h; suppression alternate (≤ 9
  recurrences a year) 500 mg q24h / none / 500 mg q48h / 500 mg q48h; HIV 500 mg q12h / none /
  500 mg q24h / 500 mg q24h; zoster 1 g q8h / 1 g q12h / 1 g q24h / 500 mg q24h.
- **Famciclovir** (Teva, version 19), CrCl ≥ 60 / 40–59 / 20–39 / < 20 / hemodialysis:
  recurrent genital herpes 1,000 mg q12h ×1 day / 500 mg q12h ×1 day / 500 mg once / 250 mg
  once / 250 mg after dialysis; herpes labialis 1,500 mg once / 750 / 500 / 250 / 250 after
  dialysis; zoster 500 mg q8h / q12h / q24h / 250 mg q24h / 250 mg after each dialysis.
  Suppression (bands ≥ 40 / 20–39 / < 20 / HD): 250 mg q12h / 125 mg q12h / 125 mg q24h / 125 mg
  after dialysis. HIV recurrent: 500 mg q12h / 500 mg q24h / 250 mg q24h / 250 mg after dialysis.
- **Ganciclovir IV** (Fresenius Kabi, version 8): CrCl ≥ 70, induction 5 mg/kg q12h,
  maintenance 5 mg/kg q24h; 50–69, 2.5 q12h and 2.5 q24h; 25–49, 2.5 q24h and 1.25 q24h; 10–24,
  1.25 q24h and 0.625 q24h; < 10, 1.25 and 0.625 mg/kg three times a week after hemodialysis.
- **Valganciclovir** (Valcyte, version 24): ≥ 60, 900 mg twice daily induction, 900 mg daily
  maintenance; 40–59, 450 mg twice daily and 450 mg daily; 25–39, 450 mg daily and 450 mg every
  2 days; 10–24, 450 mg every 2 days and 450 mg twice weekly; < 10 on hemodialysis, not
  recommended.
- **Oseltamivir** (Tamiflu, version 45), treatment / prophylaxis: CrCl > 60–90, 75 mg twice
  daily ×5 days / 75 mg daily; > 30–60, 30 mg twice daily / 30 mg daily; > 10–30, 30 mg daily /
  30 mg every other day; hemodialysis (≤ 10), 30 mg now then after every cycle / after
  alternate cycles; CAPD, one 30 mg dose / 30 mg now then weekly; ESRD not on dialysis, not
  recommended.
- **Nirmatrelvir-ritonavir** (Paxlovid, version 12; **eGFR**): ≥ 60 to < 90, no adjustment;
  ≥ 30 to < 60, 150 mg/100 mg twice daily ×5 days; **< 30 including hemodialysis, 300 mg/100 mg
  once on day 1, then 150 mg/100 mg once daily on days 2–5**, after dialysis on dialysis days.
- **Remdesivir** (Veklury, version 24): no adjustment at any degree of renal impairment,
  including dialysis. The tool reports that sentence; it is a real answer.
**Output.** The row for the indication and band.
**Source.** The eight labels.

### 5. `nrti-renal-dose` — Tenofovir, Emtricitabine/Tenofovir, Entecavir, Lamivudine by CrCl (Label Check)

**Input.** Drug, use (treatment or PrEP for emtricitabine/tenofovir; usual or
lamivudine-refractory for entecavir), CrCl, dialysis.
**Compute.** Tenofovir DF 300 mg (Viread, version 31; label says CrCl by **ideal** body
weight): ≥ 50 every 24 h; 30–49 every 48 h; 10–29 every 72 to 96 h; hemodialysis every 7 days
or after about 12 hours of dialysis; < 10 not on hemodialysis, the label says no data are
available to make a recommendation. Truvada (version
32; ideal weight): ≥ 50 every 24 h; 30–49 every 48 h; < 30 or hemodialysis, not recommended;
PrEP not recommended below 60. Entecavir (Baraclude, version 42), usual / refractory: ≥ 50,
0.5 mg / 1 mg daily; 30 to < 50, 0.25 mg daily or 0.5 mg q48h / 0.5 mg daily or 1 mg q48h; 10
to < 30, 0.15 mg daily or 0.5 mg q72h / 0.3 mg daily or 1 mg q72h; < 10, hemodialysis or CAPD,
0.05 mg daily or 0.5 mg every 7 days / 0.1 mg daily or 1 mg every 7 days. Lamivudine (Epivir,
version 24): ≥ 50, 150 mg twice daily or 300 mg daily; 30–49, 150 mg daily; 15–29, 150 mg
first dose then 100 mg daily; 5–14, 150 mg then 50 mg daily; < 5, 50 mg then 25 mg daily.
**Output.** The row, and the weight basis the label names.
**Source.** The four labels. **Note.** Tenofovir alafenamide products were not read.

### 6. `gabapentinoid-renal-dose` — Gabapentin and Pregabalin by CrCl (Label Check)

**Input.** Drug, CrCl, the total daily dose for normal renal function (pregabalin: 150, 300,
450 or 600 mg/day), hemodialysis.
**Compute.** Gabapentin (Neurontin, version 48; age ≥ 12): CrCl ≥ 60, 900–3,600 mg/day in
three doses; > 30–59, 400–1,400 mg/day in two; > 15–29, 200–700 mg/day once daily; 15,
100–300 mg/day once daily; below 15, reduce in proportion to CrCl (the label's example: 7.5
mL/min gets half the 15 mL/min dose); post-hemodialysis supplement 125, 150, 200, 250 or 350
mg matched to the column. Pregabalin (Lyrica, version 59): the label maps each normal daily
dose to a band dose. ≥ 60: 150 / 300 / 450 / 600 in 2–3 doses; 30–60: 75 / 150 / 225 / 300 in
2–3 doses; 15–30: 25–50 / 75 / 100–150 / 150 in 1–2 doses; < 15: 25 / 25–50 / 50–75 / 75 once
daily. Supplement after every 4-hour hemodialysis, keyed to the once-daily regimen: 25 mg →
25 or 50 mg; 25–50 mg → 50 or 75 mg; 50–75 mg → 75 or 100 mg; 75 mg → 100 or 150 mg.
**Output.** The band's total daily dose range and regimen; for gabapentin below 15, the
proportional figure with the label's sentence.
**Source.** Neurontin and Lyrica labels. **Note.** Pregabalin's bands share edges (30 and 60
each appear in two rows); the tool reports both rows at an edge.

### 7. `cns-renal-dose-check` — Renal Dose Limits for Eight CNS Drugs (Label Check)

**Input.** Drug, CrCl (and height and weight for levetiracetam), dialysis.
**Compute.**
- **Levetiracetam** (Keppra, version 36). The label defines the input:
  CLcr (mL/min/1.73 m²) = CLcr (mL/min) × 1.73 / BSA. > 80: 500–1,500 mg q12h; 50–80:
  500–1,000 mg q12h; 30–50: 250–750 mg q12h; < 30: 250–500 mg q12h; ESRD on dialysis:
  500–1,000 mg q24h with a 250–500 mg supplement after dialysis. The tool computes the
  normalization (it is the label's own step) from a reader-supplied CrCl and BSA.
- **Lacosamide** (Vimpat, version 63): mild to moderate impairment, no adjustment; severe
  impairment (CLcr < 30 by Cockcroft-Gault) or end-stage renal disease, "a reduction of 25% of
  the maximum dosage"; after a 4-hour hemodialysis, a supplement of up to 50% is to be
  considered. The label gives the reduction as a percentage, not a milligram figure; the tool
  reports the sentence and applies 25% only to a maximum the reader enters.
- **Topiramate** (Topamax, version 31): CrCl < 70 mL/min/1.73 m², one-half the usual adult dose.
- **Memantine XR** (Namenda XR, version 6): CrCl 5–29, maximum 14 mg/day.
- **Tramadol immediate release** (Amneal, version 51): CrCl < 30, every 12 hours, maximum
  200 mg/day; severe hepatic impairment, 50 mg every 12 hours; over 75 years, not above 300
  mg/day.
- **Duloxetine** (Lupin, version 26): avoid at GFR < 30; avoid in chronic liver disease or
  cirrhosis.
- **Desvenlafaxine** (Pristiq, version 67): CrCl 30–50, maximum 50 mg/day; 15–29 or < 15,
  25 mg daily or 50 mg every other day.
- **Varenicline** (Chantix, version 49): CrCl < 30, start 0.5 mg once daily, maximum 0.5 mg
  twice daily; end-stage renal disease on hemodialysis, maximum 0.5 mg once daily if tolerated.
**Output.** The limit or range, and whether the entered dose (optional) is above the label's
maximum for the band.
**Source.** The eight labels.

### 8. `diabetes-drug-egfr-check` — Metformin, SGLT2 and DPP-4 Rules by eGFR (Label Check)

**Input.** Drug, indication (SGLT2 inhibitors), eGFR (mL/min/1.73 m²) or CrCl for alogliptin,
starting or continuing, and for canagliflozin albuminuria above 300 mg/day.
**Compute.**
- **Metformin** (Zydus, version 17): eGFR < 30 contraindicated; starting at 30 to 45 not
  recommended; already taking and falls below 45, the label says assess benefit and risk;
  falls below 30, discontinue. Iodinated contrast: stop at or before the procedure when eGFR
  is 30 to 60 (or liver disease, alcoholism, heart failure, intra-arterial contrast);
  re-evaluate eGFR at 48 hours.
- **Empagliflozin** (Jardiance, version 31): for glycemic control, not recommended below eGFR
  30. Section 2 gives **no eGFR floor** for the heart failure, CKD or cardiovascular
  indications; section 8.6 says the trials did not enroll below 20 or on dialysis. The tool
  reports both sentences and does not invent a cutoff.
- **Dapagliflozin** (Farxiga, version 49): glycemic control, not recommended below 45; other
  indications, same dose at eGFR ≥ 25, initiation not recommended below 25, and a patient
  already on it may continue 10 mg daily.
- **Canagliflozin** (Invokana, version 32): eGFR 30 to < 60, maximum 100 mg daily; < 30,
  initiation not recommended, and adults with albuminuria > 300 mg/day may continue 100 mg.
- **Sitagliptin** (Januvia, version 71): eGFR ≥ 45, no adjustment; 30 to < 45, 50 mg daily;
  < 30 or dialysis, 25 mg daily.
- **Saxagliptin** (Mylan, version 4): eGFR < 45, 2.5 mg daily (after hemodialysis).
- **Alogliptin** (Nesina, version 22; **CrCl, not eGFR**): ≥ 60 no adjustment; ≥ 30 to < 60,
  12.5 mg daily; < 30 or ESRD, 6.25 mg daily.
**Output.** The rule, keyed to indication and to starting versus continuing.
**Source.** The seven labels. **Note.** Three different renal measures appear in one class;
the form relabels the field per drug.

### 9. `glp1-titration-check` — GLP-1 Dose Escalation Check (Label Check)

**Input.** Product, indication (Ozempic, Wegovy, Zepbound), adult or pediatric, current dose,
date the current dose began, today.
**Compute.** The earliest date the label permits the next step, the step, and the maximum.
- Ozempic injection (version 20): 0.25 mg weekly ×4 weeks, then 0.5 mg; after at least 4 weeks
  1 mg; after at least 4 weeks 2 mg (maximum). Type 2 diabetes with chronic kidney disease:
  maintenance 1 mg after at least 4 weeks on 0.5 mg.
- Wegovy injection (version 19): weeks 1–4 0.25 mg; 5–8 0.5 mg; 9–12 1 mg; 13–16 1.7 mg; week
  17 on, maintenance by indication. Cardiovascular risk reduction: 2.4 mg (recommended) or
  1.7 mg. Weight reduction, adults: 1.7 mg or 2.4 mg (recommended), and after at least 4 weeks
  tolerating 2.4 mg the dosage may be increased to a maximum of **7.2 mg** weekly. Weight
  reduction, age 12 and older: 2.4 mg (recommended) or 1.7 mg. MASH: 2.4 mg, may be decreased
  to 1.7 mg. A step not tolerated: the label says consider delaying escalation for 4 weeks.
- Wegovy tablets (same label): days 1–30 1.5 mg; 31–60 4 mg; 61–90 9 mg; day 91 on 25 mg.
- Oral semaglutide (Rybelsus and Ozempic tablets, one label, version 14; the two are not
  substitutable milligram for milligram). Rybelsus: days 1–30 3 mg; days 31–60 7 mg; from day
  61, stay at 7 mg or increase to 14 mg. Ozempic tablets: days 1–30 1.5 mg; days 31–60 4 mg;
  from day 61, stay at 4 mg or increase to 9 mg.
- Mounjaro (version 40): 2.5 mg weekly; 2.5 mg increments after at least 4 weeks on the
  current dose; maximum 15 mg adults, 10 mg pediatric.
- Zepbound (version 40): 2.5 mg ×4 weeks, then 5 mg; 2.5 mg increments after at least 4 weeks;
  maintenance 5, 10 or 15 mg, or 10 or 15 mg, by indication; maximum 15 mg.
- Victoza (version 31): 0.6 mg daily ×1 week, 1.2 mg, then 1.8 mg (maximum) after at least a
  week.
- Saxenda (version 22): weeks 1–5: 0.6, 1.2, 1.8, 2.4, 3 mg daily. Reassess at 16 weeks (4% of
  baseline weight).
- Trulicity (version 62): 0.75 mg; after 4 weeks 1.5 mg; 1.5 mg increments after at least 4
  weeks; maximum 4.5 mg (pediatric 1.5 mg).
**Output.** "The label permits 1 mg from {date}", the weeks completed at the current dose, and
whether the order's dose is a step the label lists for that indication. A dose the label does
not list is reported as not on the label, not as wrong.
**Source.** The eight labels. **Why not a `dose-calendar` preset.** That tool takes the
schedule as input and has no step-validity rule.
**Missed doses.** Not here: `missed-dose-label-rule` in [spec-v1639](spec-v1639.md) owns every
GLP-1 missed-dose and restart rule.

### 10. `dofetilide-dose-algorithm` — Dofetilide Starting Dose and QTc Step (Tikosyn Label)

**Input.** Baseline QTc (or QT when heart rate < 60), ventricular conduction abnormality
yes/no, CrCl (label: Cockcroft-Gault with **actual** weight), then optionally the QTc 2–3 hours
after dose 1 and after later doses.
**Compute.** Step 1: baseline > 440 ms (500 with conduction abnormality): contraindicated.
Step 2: CrCl > 60, 500 mcg twice daily; 40 to 60, 250 mcg twice daily; 20 to < 40, 125 mcg
twice daily; < 20, contraindicated. Step 5: if the post-dose-1 QTc rose more than 15% from
baseline **or** exceeds 500 ms (550), step down: 500→250 twice daily, 250→125 twice daily,
125 twice daily→125 once daily. After dose 2 onward: QTc > 500 (550) at any time, the label
says discontinue; no further down-titration. Heart rate < 50: the label has no data; the tool
says so.
**Output.** The step reached, the dose the algorithm gives, and the percent change computed.
**Source.** Tikosyn label, version 30 (published April 22, 2026).
**Note.** The 40 and 60 edges: "40 to 60" and "> 60", "20 to < 40". Exactly 60 is 250 mcg.

### 11. `cardiac-renal-dose-check` — Sotalol, Atenolol, Lisinopril, Sacubitril-Valsartan, Rosuvastatin (Label Check)

**Input.** Drug, CrCl or eGFR, indication where the label splits, Child-Pugh class for
sacubitril-valsartan.
**Compute.** Sotalol (Betapace, version 6): interval 12 h at CrCl > 60; 24 h at 30–59; 36–48 h
at 10–29; < 10 individualized; escalate only after at least 5 doses. Atenolol (Tenormin,
version 2; mL/min/1.73 m²): 15–35, maximum 50 mg daily; < 15, 25 mg daily; hemodialysis 25 or
50 mg after each session. Lisinopril (Zestril, version 2): CrCl > 30, no adjustment; CrCl ≥ 10
and ≤ 30, half the usual starting dose (hypertension 5 mg, heart failure 2.5 mg, acute MI
2.5 mg), maximum 40 mg; CrCl < 10 or hemodialysis, initial dose 2.5 mg once daily.
Sacubitril-valsartan (Entresto, version 25): eGFR < 30, half the usual starting dose;
Child-Pugh B, half the starting dose; Child-Pugh C, not recommended. Rosuvastatin (Crestor,
version 19): CLcr < 30 mL/min/1.73 m² not on hemodialysis, start 5 mg, not above 10 mg.
**Output.** The row. **Source.** The five labels.

### 12. `mra-potassium-dose-check` — Spironolactone and Eplerenone by Potassium and Kidney Function (Label Check)

**Input.** Drug, indication, serum potassium (mEq/L), eGFR or CrCl, current dose.
**Compute.** Spironolactone, heart failure (Aldactone, version 25): potassium ≤ 5.0 and eGFR
> 50, start 25 mg daily (may go to 50 mg); hyperkalemia on 25 mg daily, 25 mg every other day;
eGFR 30 to 50, consider starting at 25 mg every other day. Eplerenone (Inspra, version 6),
post-MI heart failure table: potassium < 5.0, step up (25 mg every other day → 25 mg daily →
50 mg daily); 5.0–5.4, no change; 5.5–5.9, step down (50 → 25 daily → 25 every other day →
withhold); ≥ 6.0, withhold and restart at 25 mg every other day when below 5.5.
Contraindicated in all patients: potassium > 5.5 at initiation, CrCl ≤ 30. Contraindicated for
hypertension only: CrCl < 50, serum creatinine > 2.0 mg/dL (men) or > 1.8 mg/dL (women), type
2 diabetes with microalbuminuria, potassium supplements or potassium-sparing diuretics.
**Output.** The step the table gives from the current dose. **Source.** The two labels.

### 13. `gout-drug-renal-dose` — Allopurinol and Colchicine by Kidney Function (Label Check)

**Input.** Drug, indication, eGFR or CrCl, dialysis, and for colchicine the interacting-drug
class.
**Compute.** Allopurinol (Dr. Reddy's, version 15; **the label now keys on eGFR**), gout initial
dose: > 60 no change; > 30 to 60, 50 mg daily; > 15 to 30, 50 mg every other day; 5 to 15,
50 mg twice weekly; < 5, 50 mg once weekly; increase by 50 mg/day every 2 to 4 weeks; the
label says the maximum by eGFR is not defined. Cancer-therapy hyperuricemia: > 20 to 60 no
change; 10 to 20, 200 mg/day; < 10, 100 mg/day; dialysis 50 mg q12h or 100 mg q24h.
Colchicine tablets (Amneal, version 18; the label prints Cockcroft-Gault and calls CLcr 50 to 80
mild, 30 to 50 moderate). Gout-flare prophylaxis: mild or moderate impairment, no adjustment;
severe impairment, start 0.3 mg/day; dialysis, start **0.3 mg twice a week**. Gout-flare
treatment: mild or moderate, no adjustment; severe, the dose is unchanged but a course is
repeated no more than once every 2 weeks; dialysis, **a single 0.6 mg dose**, not repeated
more than once every 2 weeks. Treating a flare is not recommended in a patient with renal or
hepatic impairment who is taking colchicine for prophylaxis. Familial Mediterranean fever:
CLcr < 30 or dialysis, start 0.3 mg/day. With renal or hepatic impairment plus a P-gp or
strong CYP3A4 inhibitor: contraindicated.
**Output.** The row. **Source.** Allopurinol and colchicine labels.
**Note.** The NDA holder's Colcrys label is not on DailyMed; see Verify at build.

### 14. `bisphosphonate-renal-check` — Zoledronic Acid Dose and Bisphosphonate CrCl Cutoffs (Label Check)

**Input.** Drug and product (zoledronic acid 4 mg oncology, Reclast 5 mg, alendronate,
risedronate), indication, CrCl (zoledronic acid labels: Cockcroft-Gault; Reclast says actual
weight), serum creatinine for hypercalcemia of malignancy.
**Compute.** Zoledronic acid 4 mg, myeloma and bone metastases (Heritage, version 22): CrCl
> 60, 4 mg; 50–60, 3.5 mg; 40–49, 3.3 mg; 30–39, 3 mg. Hypercalcemia of malignancy: 4 mg; no
adjustment for serum creatinine < 4.5 mg/dL; retreat no sooner than 7 days. Reclast (version
3): contraindicated at CrCl < 35; 5 mg at ≥ 35. Alendronate (Fosamax, version 10): not
recommended at CrCl < 35; no adjustment at 35–60. Risedronate (Actonel, version 31): not
recommended at CrCl < 30.
**Output.** The dose or the cutoff sentence. **Source.** The four labels.
**Note.** The 4 mg label gives no row below 30; the tool reports that no dose is given.

### 15. `tranexamic-acid-renal-dose` — Tranexamic Acid by Serum Creatinine (Label Check)

**Input.** Route, serum creatinine (mg/dL), weight for IV.
**Compute.** IV (Cyklokapron, version 34): 1.36 to 2.83 mg/dL, 10 mg/kg twice daily; 2.83 to
5.66, 10 mg/kg daily; > 5.66, 10 mg/kg every 48 hours or 5 mg/kg every 24 hours. Oral
(ANI tablets, version 4): normal 1,300 mg three times daily for at most 5 days; above
1.4 and ≤ 2.8, 1,300 mg twice daily; above 2.8 and ≤ 5.7, 1,300 mg once daily; above 5.7,
650 mg once daily.
**Output.** The row and, for IV, the mg at the entered weight.
**Note.** These tables key on serum creatinine, not clearance: the field must not accept a
CrCl. The IV table repeats 2.83 in two rows; at exactly 2.83 the tool shows both.

### 16. `ketorolac-limit-check` — Ketorolac Dose and Duration Limits (Label Check)

**Input.** Age, weight, renal impairment yes/no, route, single or multiple dose, days of
ketorolac so far by any route, total mg in the last 24 hours.
**Compute.** From the injection label (Hospira, version 36). Single dose IM: 60 mg under 65;
30 mg at ≥ 65, renally impaired or under 50 kg. Single dose IV: 30 mg; 15 mg for the same
group. Multiple dose: 30 mg every 6 hours, not above 120 mg/day; 15 mg every 6 hours, not
above 60 mg/day for the same group. Tablets (Teva, version 19), only as continuation after
IV or IM dosing: age 17 to 64, 20 mg once, then 10 mg every 4 to 6 hours, not above 40 mg/day;
age ≥ 65, renally impaired or under 50 kg, 10 mg once, then 10 mg every 4 to 6 hours, not above
40 mg/day. Combined IV, IM and oral duration: not to exceed 5 days. Advanced renal impairment:
contraindicated. Neither label defines "renally impaired" with a number; the tool takes it as
a yes/no the reader answers.
**Output.** The label dose for the group, the daily ceiling, mg and days remaining.
**Source.** Ketorolac injection and tablet labels.

### 17. `gi-drug-dose-check` — Famotidine and Metoclopramide Adjustments (Label Check)

**Input.** Drug, indication, CrCl, Child-Pugh class, and for metoclopramide age group, CYP2D6
poor metabolizer and strong CYP2D6 inhibitor flags.
**Compute.** Famotidine tablets (Teva, version 21), maximum dosage at CrCl 30–60 / < 30:
duodenal or gastric ulcer 20 mg daily or 40 mg every other day / 20 mg every other day;
nonerosive GERD 20 mg daily / 20 mg every other day; erosive esophagitis 20 mg daily or 40 mg
every other day / 20 mg every other day (and 40 mg daily / 20 mg daily for the 40 mg
twice-daily regimen); hypersecretory conditions, avoid. Metoclopramide (Reglan,
version 8): GERD 10–15 mg four times daily, maximum 60 mg; Child-Pugh B or C, CYP2D6 poor
metabolizer, strong CYP2D6 inhibitor, or CrCl ≤ 60: 5 mg four times daily or 10 mg three
times daily, maximum 30 mg; ESRD 5 mg four times daily or 10 mg twice daily, maximum 20 mg.
Gastroparesis: 10 mg four times daily, maximum 40 mg; the adjusted group 5 mg four times
daily, maximum 20 mg; ESRD 5 mg twice daily, maximum 10 mg.
**Output.** The row and maximum daily dose. **Source.** The two labels.

### 18. `hepatic-label-dose` — What the Label Gives for a Child-Pugh Class

**Input.** Drug, Child-Pugh class (A, B, C) or score, linked from `meld-childpugh`.
**Compute.** Lookup of the label's hepatic row. Read on October 10, 2026:

| Drug | A | B | C |
|---|---|---|---|
| Voriconazole | Standard load; halve maintenance | Same as A | No data; use only if benefit outweighs risk |
| Caspofungin | Score 5–6: no change | Score 7–9: 35 mg daily after a 70 mg load | No clinical experience |
| Tigecycline | No change | No change | 100 mg, then 25 mg every 12 h |
| Ondansetron (oral) | — | — | Score ≥ 10: not above 8 mg/day |
| Atomoxetine | No change | 50% of the usual dose | 25% of the usual dose |
| Desvenlafaxine | — | Score 7–15: 50 mg/day; not above 100 | Same |
| Metoclopramide | No change | Reduced (tool 17) | Reduced (tool 17) |
| Sacubitril-valsartan | No change | Half the starting dose | Not recommended |
| Mirabegron | 25 mg, max 50 mg | 25 mg, max 25 mg | Not recommended |
| Solifenacin | — | Not above 5 mg once daily | Do not use |
| Argatroban (HIT) | — | 0.5 mcg/kg/min | 0.5 mcg/kg/min |
| Nirmatrelvir-ritonavir | No change | No change | Not recommended |
| Lacosamide | 25% lower maximum | 25% lower maximum | Not recommended |
| Entecavir | No change | No change | No change |

**Output.** The cell, verbatim, with the label edition. Where the label names "mild/moderate/
severe" without Child-Pugh (lacosamide, tramadol, colchicine), the tool says the label does not
define the terms and shows the label's words; it does not map them to a class.
**Source.** The labels above.

## Backfills (live tools that should do more)

1. **`abx-renal` — move to the shared dataset and add 18 labels.** Rows read on October 10, 2026:
   meropenem (> 50 q8h; 26–50 full dose q12h; 10–25 half dose q12h; < 10 half dose q24h;
   dialysis: inadequate information); levofloxacin (750 mg: 20–49 q48h; 10–19 and HD/CAPD 750
   then 500 q48h. 500 mg: 20–49 500 then 250 q24h; 10–19 and HD/CAPD 500 then 250 q48h. 250 mg:
   20–49 none; 10–19 q48h, none for uncomplicated UTI; dialysis, no information); ciprofloxacin oral (30–50 250–500 mg
   q12h; 5–29 q18h; dialysis q24h after dialysis); TMP-SMX (> 30 usual; 15–30 half; < 15 not
   recommended); nitrofurantoin (**contraindicated at CrCl under 60** on the current Macrobid
   label, version 26); daptomycin (≥ 30 q24h; < 30, HD, CAPD q48h; 4 or 6 mg/kg by
   indication); ertapenem (≤ 30 mL/min/1.73 m², 500 mg daily; 150 mg supplement if dosed
   within 6 h before hemodialysis); cefazolin (≥ 55 full; 35–54 full at ≥ 8 h intervals; 11–34
   half q12h; ≤ 10 half q18–24h; the label also gives serum creatinine bands); ampicillin-
   sulbactam (≥ 30 q6–8h; 15–29 q12h; 5–14 q24h); ceftazidime (31–50 1 g q12h; 16–30 1 g q24h;
   6–15 500 mg q24h; < 5 500 mg q48h; the label skips 5 to 6); imipenem (four columns from ≥ 90
   to 15, two susceptibility rows); aztreonam (10–30 halve after a load; < 10 one-fourth);
   ceftaroline (> 30 to ≤ 50 400 mg; ≥ 15 to ≤ 30 300 mg; ESRD 200 mg, all q12h); amoxicillin
   and amoxicillin-clavulanate (GFR < 30 no 875 mg; 10–30 500 or 250 mg q12h; < 10 and HD 500 or 250 mg q24h, with an added
   dose during and at the end of dialysis); cephalexin
   (≥ 60 none; 30–59 max 1 g/day; 15–29 250 mg q8–12h; 5–14 q24h; 1–4 q48–60h); colistimethate (≥ 80
   2.5–5 mg/kg/day; 50–79 2.5–3.8; 30–49 2.5; 10–29 1.5 mg/kg q36h, colistin base); fluconazole
   (≤ 50 without dialysis 50%; hemodialysis 100% after each session).
2. **`abx-renal` — edition and expiry.** The manifest says `sourceEdition: "unversioned"` and
   `expiresOn: 2028-10-10`. Four named labels with set ids are versioned. Record `splVersion`
   and put them under the watch in spec-v1628 §1; a two-year blind expiry is the gap this wave
   closes.
3. **`abx-renal` — indication as an input.** Cefepime's and piperacillin-tazobactam's
   indication variants sit in a `note` string. The shared row shape carries `indication`.
4. **`vte-prophylaxis-dose` — the rest of the enoxaparin label.** Its source line cites the
   label and CHEST 2012 together. Lovenox (version 33) Table 1 at CrCl < 30 has eight
   indication rows, including STEMI under 75 (30 mg IV bolus plus 1 mg/kg, then 1 mg/kg once
   daily) and STEMI ≥ 75 (1 mg/kg once daily, no bolus); normal renal function STEMI: 30 mg IV
   bolus plus 1 mg/kg, then 1 mg/kg q12h with a 100 mg cap on the first two doses, and at ≥ 75
   years 0.75 mg/kg q12h with a 75 mg cap on the first two doses, no bolus. Add the indications
   and name which rows are label and which are CHEST. On obesity the label (section 8.9) says
   only that the safety and efficacy of prophylactic doses at BMI > 30 kg/m² "has not been
   fully determined and there is no consensus for dose adjustment"; the tool should quote that.
5. **`cockcroft-gault` — say which weight the drug's label asks for.** Labels disagree:
   rivaroxaban, dofetilide, tirofiban and Reclast say actual weight; tenofovir DF and
   emtricitabine/tenofovir say ideal weight; levetiracetam wants the result normalized to
   1.73 m². A "for which drug?" selector that sets the weight basis, fed from the dataset's
   `crclWeight` field. Listed with the program's other live-tool changes in
   [spec-v1641](spec-v1641.md).
6. **`digoxin`.** Its bands are cited to ACC/AHA/HFSA 2022, and the code returns "typical
   maintenance" strings by CrCl < 30 / < 50 and age ≥ 70. The digoxin label is read in
   [spec-v1631](spec-v1631.md) (`digoxin-label-dose`), which owns this change; no digoxin row is
   added to tool 11.

## Rejected

| Idea | Why not |
|---|---|
| Pediatric label doses (rivaroxaban, dabigatran, fondaparinux, daptomycin, meropenem, entecavir, mirabegron weight tables and the rest) | A second program, not a row. Each label keys on weight band, age band and formulation at once, often with a different renal measure (Schwartz eGFR) and a different table per indication. Twelve such tables were seen in the labels read; they need their own verified wave. `peds-dose` exists. |
| One generic `label-renal-dose` | §0.1. |
| Vancomycin, aminoglycosides, lithium, digoxin levels | Pharmacokinetics, specified in [spec-v1631](spec-v1631.md). The vancomycin label gives no CrCl table (`abx-renal` already says so). |
| Flucytosine | Ancobon's label says start "at the lower level" when creatinine is raised. No number. |
| Baclofen | The tablet label read (version 104) carries no renal number in section 2. |
| Ranolazine | Section 4 gives a contraindication in cirrhosis and no renal dose. One yes/no line is a fact, not a tool; it is a row in tool 18 at most. |
| Ivabradine | Severe hepatic impairment contraindicated; no renal dose. Same. |
| Morphine, oxycodone, hydromorphone hepatic/renal | Labels not read. Not specified until a label with a computable row is read. |
| Sulfonylureas | Glipizide's label (version 1016) gave no renal or hepatic number in section 2. |
| Low-dose methotrexate | Trexall section 2 gave no CrCl row in this extraction. Oncology dosing is specified in [spec-v1635](spec-v1635.md). |
| Neostigmine, dexmedetomidine, ceftriaxone, linagliptin | No adjustment on the label; nothing to compute. |
| Sugammadex | Live. |
| Ranitidine | Withdrawn from the US market. |
| Colistimethate "label versus EMA" | Two sources that disagree on a number. The backfill ships the US label row only and says the units are colistin base. |
| Acetaminophen maximums, OTC | Live `apap-24h-max`; OTC label dosing is specified in [spec-v1639](spec-v1639.md). |
| Apixaban dose in dialysis | Section 2 has no dialysis row. Section 8.6 says, for the VTE indications, "no dose adjustment is recommended for patients with renal impairment, including those with ESRD on dialysis", and for AF that the usually recommended dose gives concentrations similar to the trial's, with the caveat that trials did not enroll these patients. The tool quotes 8.6; it does not create a row. |
| Enoxaparin obesity dosing | The label gives no number (section 8.9: "no consensus for dose adjustment"). |
| DOAC and anticoagulant switching | Specified in [spec-v1633](spec-v1633.md). |

## Research record

| Finding | Where read | Effect on the spec |
|---|---|---|
| `history.json` answers without a key. It returns `data.spl` (`title`, `setid`), `data.history[]` newest first (each `spl_version`, `published_date` as "May 05, 2025"), and `metadata` (`db_published_date`, `total_elements`, `total_pages`, `elements_per_page` 100, `current_page`, `next_page_url` as the string "null"). Version numbers can skip (Xarelto: 60 entries, newest version 65) | Called October 10, 2026 for `e9481622-7cc6-418a-acb6-c5450daae9b0` (Eliquis: versions 30 and 29, May 5, 2025 and January 30, 2023), `02aa374f-37b4-456a-b5de-cfd3bbb6ce6e` (cefepime: 2 and 1) and `10db92f9-2300-4a80-836b-673e1ae91610` (Xarelto) at `https://dailymed.nlm.nih.gov/dailymed/services/v2/spls/{setid}/history.json` | Confirms the edition source in spec-v1628 §1. The watch must compare versions with "greater than", read the date as text, and page past 100 entries |
| XML `effectiveTime` can be years older than the published version (Baraclude 2019-11-06 at v42, Dec 2025; Lyrica 2020-06-15 at v59) | The SPL XML for set ids `046e61c9-...` and `60185c88-...` | Edition key is set id plus version; print `published_date` (spec-v1628 §1) |
| One drug name returns many set ids on different versions (Eliquis: 10) | `.../v2/spls.json?drug_name=eliquis` | Pin the NDA holder's set id (spec-v1628 §1) |
| Section 2 is LOINC 34068-7 in both new and old label formats | Every XML fetched | The section hash in spec-v1628 §1 |
| Apixaban 2-of-3 rule sits under the AF heading only | Eliquis XML, §2.1 | Tool 1 must not apply it to VTE |
| Rivaroxaban AF band is "> 50" and "≤ 50"; CrCl by actual weight; < 15 "avoid" for VTE indications | Xarelto XML, Table 1 | Exactly 50 is 15 mg |
| Dabigatran gives "no recommendation" rather than a contraindication below the band | Pradaxa XML, §2.2 | `no-recommendation-given` flag |
| Edoxaban: do not use above CrCl 95 (AF) | Savaysa XML, §2.1 | Upper-bound rule |
| Paxlovid now has a dose for eGFR < 30 and hemodialysis | Paxlovid XML v12, Table 1 | Tool 4 carries the severe-impairment dose |
| Remdesivir: no renal adjustment at any degree | Veklury XML, §2.4 | A "no adjustment" answer is shipped as an answer |
| Jardiance section 2 has one eGFR rule (glycemic, < 30); no floor for HF or CKD | Jardiance XML, §2.1 and §8.6 | Tool 8 reports the absence |
| Farxiga: 45 for glycemic control, 25 for initiation in other indications, may continue below 25 | Farxiga XML, §2.2–2.3 | Starting versus continuing is an input |
| Alogliptin uses CrCl while the other DPP-4 labels use eGFR | Nesina XML, §2.2 | Field relabels per drug |
| Allopurinol label is now in the new format with an eGFR table down to "< 5: 50 mg weekly" | Allopurinol tablets XML v104 | Tool 13 |
| Nitrofurantoin: contraindicated under CrCl 60 on the current Macrobid label | Macrobid XML v26, Contraindications | Backfill row |
| Tranexamic acid tables key on serum creatinine, with different edges IV and oral | Cyklokapron and tablet XML | Tool 15's field is creatinine |
| Levetiracetam requires CrCl normalized to BSA | Keppra XML, §2.5 | Tool 7 computes the label's normalization |
| Tenofovir DF and Truvada: CrCl by ideal body weight | Viread and Truvada XML, table footnotes | Backfill 5 |
| Dofetilide algorithm, all steps | Tikosyn XML v30 | Tool 10 |
| Label band tables overlap or leave gaps (acyclovir IV, pregabalin, tranexamic acid IV; ceftazidime skips 5–6) | The XML tables | Output rule: show both rows or say not covered |
| Enoxaparin Table 1 has eight rows at CrCl < 30; STEMI age ≥ 75 rule | Lovenox XML v33, §2.1–2.4 | Backfill 4 |
| GLP-1 escalation steps | Ozempic, Wegovy, Mounjaro, Zepbound, Victoza, Saxenda, Trulicity and oral semaglutide XML | Tool 9 |
| The oral semaglutide set id is now titled "OZEMPIC (ORAL SEMAGLUTIDE) TABLET RYBELSUS (ORAL SEMAGLUTIDE) TABLET" and carries two escalation schedules | Set id `27f15fac-7d98-4114-a2ec-92494a91da98`, version 14, §2.2 | Tool 9 lists both and says they are not interchangeable |

**Second reading, October 10, 2026.** Every set id in Sources was fetched again and its version
and date matched `history.json`. Section 2 (and section 4 or 8.6 where cited) was re-read for
the DOACs, dalteparin, fondaparinux, the four IV antithrombotics, all eight antivirals, the four
NRTIs, gabapentin, pregabalin, the eight CNS drugs, the seven diabetes drugs, the eight GLP-1
labels, dofetilide, the five cardiac drugs, both MRAs, allopurinol, colchicine, the four
bisphosphonates, both tranexamic acid labels, both ketorolac labels, famotidine, metoclopramide
and the hepatic table. Rows not listed below matched.

| Corrected or added | Where read | Change |
|---|---|---|
| Colchicine in dialysis is not 0.3 mg/day for gout: prophylaxis starts at 0.3 mg twice a week, and flare treatment is a single 0.6 mg dose no more than once every 2 weeks. 0.3 mg/day is the FMF row | Colchicine tablets (Amneal) set id `7daef7e2-...` v18, §2.5; the same sentences are in the Colcrys copy `d6adc880-...` v4 (Proficient Rx, October 21, 2022) | Tool 13 rewritten; build gate removed |
| Wegovy adult weight-reduction maximum is 7.2 mg weekly after at least 4 weeks at 2.4 mg; maintenance differs by indication | Wegovy XML v19, §2.2 | Tool 9; indication is an input |
| Ozempic has a kidney-disease maintenance dose (1 mg) | Ozempic XML v20, §2.2 | Tool 9 |
| Oral semaglutide steps (3/7/14 mg and 1.5/4/9 mg) | Set id `27f15fac-...` v14, §2.2 | Tool 9 |
| Edoxaban below CrCl 15 is "not recommended" (section 8.6, not section 2); the VTE P-gp inhibitor list is in section 14.2; no reduction for P-gp inhibitors in AF (7.3) | Savaysa XML v28 | Tool 1 |
| Fondaparinux prophylaxis is 2.5 mg once daily; dalteparin prophylaxis doses (Table 2 and text) | Arixtra XML v13 §2.2–2.3; Fragmin XML v27 §2.2 | Tool 2 |
| Tirofiban usual infusion is 0.15 mcg/kg/min (0.075 at CrCl ≤ 60) | Aggrastat XML v18, §2.1 | Tool 3 states both |
| Ganciclovir bands are 50–69, 25–49, 10–24 (the first copy read had lost the dashes) | Ganciclovir (Fresenius Kabi) `b47f5d1c-...` v8, §2.5 | Source re-pinned |
| Pregabalin post-hemodialysis supplements | Lyrica XML v59, Table 2 | Tool 6 |
| Lacosamide severe renal impairment: "a reduction of 25% of the maximum dosage" (no milligram figure) | Vimpat XML v63, §2.4 | Tool 7 |
| Varenicline on hemodialysis: maximum 0.5 mg once daily | Chantix XML v49, §2.2 | Tool 7; source re-pinned to the NDA holder |
| Lisinopril below CrCl 10 or on hemodialysis: initial 2.5 mg once daily; the half-dose band is ≥ 10 and ≤ 30 | Zestril XML v2, §2.4 | Tool 11 |
| Rosuvastatin's CLcr is per 1.73 m²; atenolol's also | Crestor XML v19 §2; Tenormin XML v2 | Tool 11, §0.1 |
| Eplerenone hypertension-only contraindications (CrCl < 50, creatinine > 2.0 or > 1.8 mg/dL) | Inspra XML v6, §4 | Tool 12 |
| Ketorolac tablets: 20 mg (or 10 mg) once, then 10 mg every 4 to 6 hours, not above 40 mg/day | Ketorolac tablets (Teva) `688f5dec-...` v19 | Tool 16 |
| Famotidine erosive-esophagitis rows | Famotidine tablets (Teva) `4c6f4f9e-...` v21, §2.2 | Tool 17 |
| Enoxaparin label does address obesity (section 8.9: no consensus for dose adjustment); STEMI under 75 includes the 30 mg IV bolus | Lovenox XML v33 | Backfill 4, Rejected |
| Cephalexin has a "≥ 60: no adjustment" row; levofloxacin 250 mg has "no information" for dialysis; amoxicillin dialysis doses | Cephalexin (Aurobindo) `8e28f049-...` v19; levofloxacin (Aurobindo) `529ac72c-...` v23; amoxicillin (USAntibiotics) `110ba6b1-...` v6 | Backfill 1 |
| `abx-renal` backfill lists 18 labels, not 15 | Count of the rows in backfill 1 | Backfill 1 |
| Fourteen rows first read from a repackager's copy were re-read from a manufacturer's label and matched, apart from the items above | Sources, rows marked "re-pinned" | Sources table |

## Verify at build

- **Reference labels not on DailyMed.** No NDA holder's label was found on DailyMed on October
  10, 2026 for Famvir, Levaquin, Augmentin tablets, Keflex, Ultram, Zyloprim, Colcrys, Pepcid
  tablets, Lysteda, Amoxil, Zofran, Glucophage, Vesicare, Cymbalta, Cytovene, Angiomax,
  Integrilin, Merrem, Onglyza, Zometa or Toradol (the brand search returned nothing or only
  repackager copies from 2008 to 2022). Each of these drugs is pinned to one manufacturer's
  generic label, named in Sources. Before build, look up the reference standard for each in
  the FDA Orange Book and pin that labeler's set id if it differs. The contract in spec-v1628
  §1 says what to pin when no NDA holder's label exists.
- **Colchicine.** The gout rows now come from the Amneal tablets label (version 18, March 28,
  2025) and agree with the newest Colcrys-titled copy on DailyMed (a repackager's, October 21,
  2022). Takeda's own Colcrys label was not found. Mitigare capsules (Hikma, set id
  `cb5f9d85-6b81-49f8-bcd6-17b7bfbc10f2`) carry a shorter section 2 (prophylaxis only) and were
  not read row by row; the tool covers tablets only until they are.
- **Zepbound.** The two maintenance lists (5, 10 or 15 mg; 10 or 15 mg) were read without
  their indication headings. Confirm which indication each belongs to on the rendered label.
- **Wegovy 7.2 mg.** The label gives the condition (at least 4 weeks tolerating 2.4 mg). Whether
  it lists intermediate steps between 2.4 mg and 7.2 mg was not read.
- **Metformin.** "Between 30 and 45" does not say which side each edge falls on; record the
  edges as the label words them and show both readings at exactly 30 and 45.
- **Famotidine.** Footnotes a to e of the renal table (Teva, section 2.2) were not read,
  including the one that replaces a dose for duodenal-ulcer recurrence below CrCl 30.
- **Ketorolac.** Neither label defines "renally impaired" with a number (the injection label
  refers to "moderately elevated serum creatinine").
- **Dalteparin and fondaparinux pediatric sections.** Seen, not specified (Rejected).
- **Imipenem** hemodialysis wording; **aztreonam** interval text; **cefazolin** peritoneal
  dialysis; **zoledronic acid** hold-and-resume creatinine rules.
- **Ceftazidime-avibactam and ceftolozane-tazobactam.** Top rows read (Avycaz 31–50: 1.25 g
  q8h; 16–30: 0.94 g q12h); lower rows cut. Add to the `abx-renal` backfill after a full read.
- **Metoclopramide.** The SPL table merges cells: the reduced regimen prints once, beside the
  first of five grouped rows (Child-Pugh B or C, CYP2D6 poor metabolizers, strong CYP2D6
  inhibitors, renal impairment). Confirm on the rendered label that the group shares it. The
  elderly row (5 mg four times daily) carries a footnote that was not read.
- **Memantine.** Read from Namenda XR; the immediate-release tablet figure was not read.
- **Tenofovir alafenamide products, oral acyclovir, emtricitabine alone, morphine.** Not read.
  Digoxin is read in [spec-v1631](spec-v1631.md).
- **The watch.** The hash-unchanged path (spec-v1628 §1) was reasoned from the service's shape,
  not run across two real versions. Before relying on it, fetch two consecutive versions of one
  label where only the labeler block changed and confirm the section hash holds.
- **Labels that share an NDA holder but differ by formulation** (Valcyte tablets versus
  solution, Keppra tablets versus injection, Cubicin versus Cubicin RF, Wegovy injection versus
  tablets, Rybelsus versus Ozempic tablets): one set id often covers several; confirm the row
  applies to the formulation offered.

## Sources

All at `https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid={setId}`; version and
publication date from `history.json` on October 10, 2026. A brand name means the NDA holder's
label. A labeler in parentheses means a manufacturer's generic label, used because no NDA
holder's label was on DailyMed (Verify at build). "Re-pinned" marks a row first read from a
repackager's copy and read again from the label named here.

| Label | Set id | Version | Published |
|---|---|---|---|
| Eliquis | e9481622-7cc6-418a-acb6-c5450daae9b0 | 30 | May 5, 2025 |
| Xarelto | 10db92f9-2300-4a80-836b-673e1ae91610 | 65 | Sep 11, 2026 |
| Pradaxa capsules | ba74e3cd-b06f-4145-b284-5fd6b84ff3c9 | 48 | Jun 30, 2025 |
| Savaysa | e77d3400-56ad-11e3-949a-0800200c9a66 | 28 | Jul 14, 2025 |
| Lovenox | 5017a927-2a24-4f27-89f9-27c805bf7d59 | 33 | May 29, 2026 |
| Fragmin | 23527b8b-9b28-4e6d-9751-33b143975ac7 | 27 | Oct 2, 2025 |
| Arixtra | d3b30c68-cf45-4b46-8ba6-72090f7ba01a | 13 | Feb 3, 2025 |
| Bivalirudin (Dr. Reddy's) | 19beb2ae-6064-3c24-fe50-0cee86896979 | 10 | Jun 27, 2024 |
| Eptifibatide (Baxter) | 5f46b76b-5c83-49b9-ada8-4ad5cf81a38c | 13 | May 21, 2026 |
| Aggrastat | fe0ced75-ccbf-4d2e-bd0d-b57e60ab913f | 18 | Dec 26, 2024 |
| Argatroban (Hikma) | 0cdf3f67-5bf3-4d58-b330-03febdc652bf | 29 | Jun 5, 2026 |
| Acyclovir sodium injection (Eugia) | ae921e4e-b8ae-4a45-acc1-32e5e719812b | 7 | Jul 7, 2023 |
| Valtrex | f8e0d8f8-cb73-4206-a484-88f5c4fbd719 | 32 | Jun 10, 2026 |
| Famciclovir (Teva; re-pinned) | 3f02042f-8f51-4ccf-b608-5dcd75d100fb | 19 | Aug 7, 2023 |
| Ganciclovir injection (Fresenius Kabi; re-pinned) | b47f5d1c-36b8-49b6-a410-3b3f4661dde7 | 8 | Feb 12, 2026 |
| Valcyte | 4c517a39-2ded-4c5a-8d56-276853414b31 | 24 | Dec 10, 2025 |
| Tamiflu | ee3c9555-60f2-4f82-a760-11983c86e97b | 45 | Dec 19, 2025 |
| Paxlovid | 8a99d6d6-fd9e-45bb-b1bf-48c7f761232a | 12 | Feb 23, 2026 |
| Veklury | c0978fa8-53ff-4ca2-82a7-567fd3e958ca | 24 | Aug 7, 2026 |
| Viread | 33fd6418-fbdc-42ca-a50d-ce2a476a5418 | 31 | Feb 24, 2025 |
| Truvada | 54e82b13-a037-49ed-b4b3-030b37c0ecdd | 32 | Jul 25, 2025 |
| Baraclude | 046e61c9-9298-4b2e-b76e-b26b81fecd20 | 42 | Dec 22, 2025 |
| Epivir | 89226149-47fa-4f7d-bb1f-1aa7034486b8 | 24 | Sep 14, 2026 |
| Diflucan | f694c617-3383-416c-91b6-b94fda371204 | 57 | Apr 9, 2026 |
| Vfend | ce3ef5cf-3087-4d92-9d94-9eb8287228db | 58 | Mar 2, 2026 |
| Cancidas | 3bad23a6-09a6-4194-9182-093ed61bc71c | 41 | Nov 17, 2025 |
| Tygacil | 2ccdb48e-c14a-4eeb-348c-4920ccfd7465 | 50 | Nov 19, 2025 |
| Meropenem (B. Braun) | 3b952a55-6ef7-45c8-be21-16eefe37ec2e | 25 | Aug 8, 2025 |
| Levofloxacin tablets (Aurobindo; re-pinned) | 529ac72c-c4a0-4001-8cf9-b94f5bf7265c | 23 | Jul 1, 2024 |
| Bactrim | f59d0c04-9c66-4d53-a0e1-cb55570deb62 | 18 | Jan 1, 2025 |
| Macrobid | 8f270a9f-12a1-44d4-bc7e-873613555801 | 26 | Nov 17, 2025 |
| Cubicin RF | 0b1a8885-2198-4a0e-8105-0c76c1cba6c2 | 22 | Jun 20, 2025 |
| Invanz | 33f3b99b-fa82-42e0-26bf-f49891ae3d22 | 42 | Apr 9, 2026 |
| Cefazolin (WG Critical Care) | f17160d4-fc42-4f9c-abb8-d04f01ae6dd1 | 21 | Apr 9, 2025 |
| Unasyn | 155c7ec0-5862-404f-b1d0-f278f8a8bbda | 46 | Jul 20, 2026 |
| Coly-Mycin M | 6d6e13e2-dc33-4b7b-84d0-66146a57c552 | 27 | Jun 22, 2026 |
| Tazicef | 1ab5ae3e-e303-4499-4c89-472d7cc1e46c | 30 | Jul 5, 2024 |
| Primaxin | f41d8abd-7792-4918-1b93-bd83ea01955e | 34 | Nov 17, 2025 |
| Azactam | 9a105eaf-ee77-4016-beeb-d425a5565db2 | 15 | Dec 23, 2025 |
| Teflaro | 3ecde48b-75a2-4beb-9999-369f3f61bb8a | 43 | Nov 17, 2025 |
| Cipro tablets | 888dc7f9-ad9c-4c00-8d50-8ddfd9bd27c0 | 32 | Mar 4, 2026 |
| Amoxicillin capsules (USAntibiotics; re-pinned) | 110ba6b1-f175-48a1-8e30-616c02212538 | 6 | Jul 9, 2026 |
| Amoxicillin-clavulanate tablets (Sandoz; re-pinned) | 7cba82f0-9886-46e9-8dbd-43a448aade29 | 27 | Jul 9, 2025 |
| Cephalexin capsules (Aurobindo; re-pinned) | 8e28f049-6110-4473-830f-c494191a7197 | 19 | Oct 2, 2026 |
| Avycaz (partly read) | d9c2803f-dc9c-4b19-b4a3-8303bc8c15fd | 25 | Aug 11, 2026 |
| Neurontin | 97935fd9-1d4a-43b6-a5d9-de994591187b | 48 | Aug 6, 2026 |
| Lyrica | 60185c88-ecfd-46f9-adb9-b97c6b00a553 | 59 | Sep 29, 2025 |
| Keppra | 3ca9df05-a506-4ec8-a4fe-320f1219ab21 | 36 | Jan 29, 2026 |
| Vimpat | 9e79b42c-38a3-4b2c-a196-a5a1948250e2 | 63 | May 13, 2026 |
| Topamax | 21628112-0c47-11df-95b3-498d55d89593 | 31 | Oct 6, 2026 |
| Namenda XR | 1fa2b7bc-94e5-4566-a7c5-419f8fd393a7 | 6 | Feb 28, 2018 |
| Tramadol tablets (Amneal; re-pinned) | 67919c2c-2f8a-4bbb-bef5-0cd6c1e63a16 | 51 | Jan 28, 2026 |
| Duloxetine capsules (Lupin; re-pinned) | 829a4f51-c882-4b64-81f3-abfb03a52ebe | 26 | Jun 8, 2026 |
| Pristiq | 0f43610c-f290-46ea-d186-4f998ed99fce | 67 | Apr 27, 2026 |
| Chantix (re-pinned to the NDA holder) | f0ff4f27-5185-4881-a749-c6b7a0ca5696 | 49 | Jan 23, 2026 |
| Strattera | 309de576-c318-404a-bc15-660c2b1876fb | 69 | Jul 23, 2026 |
| Ondansetron tablets (Dr. Reddy's; re-pinned) | 162f2088-9fb1-47e7-b88c-45104be7e7bb | 17 | Jul 23, 2025 |
| Metformin tablets (Zydus; re-pinned) | c82a10fa-1e8e-46b6-890a-737de3f34ee1 | 17 | Aug 17, 2026 |
| Jardiance | faf3dd6a-9cd0-39c2-0d2e-232cb3f67565 | 31 | Feb 2, 2026 |
| Farxiga | 72ad22ae-efe6-4cd6-a302-98aaee423d69 | 49 | Sep 11, 2026 |
| Invokana | b9057d3b-b104-4f09-8a61-c61ef9d4a3f3 | 32 | Jun 15, 2026 |
| Januvia | f85a48d0-0407-4c50-b0fa-7673a160bf01 | 71 | Nov 17, 2025 |
| Saxagliptin (Mylan) | 6e8d8c4f-96eb-4b64-9c8c-4a5448a23a78 | 4 | Mar 24, 2025 |
| Nesina | a3768c7e-aa4c-44d3-bc53-43bb7346c0b0 | 22 | Mar 24, 2025 |
| Ozempic | adec4fd2-6858-4c99-91d4-531f5f2a2d79 | 20 | Jun 10, 2026 |
| Wegovy (injection and tablets) | ee06186f-2aa3-4990-a760-757579d8f77b | 19 | Jun 30, 2026 |
| Rybelsus and Ozempic tablets | 27f15fac-7d98-4114-a2ec-92494a91da98 | 14 | Aug 19, 2026 |
| Mounjaro | d2d7da5d-ad07-4228-955f-cf7e355c8cc0 | 40 | Sep 2, 2026 |
| Zepbound | 487cd7e7-434c-4925-99fa-aa80b1cc776b | 40 | Sep 2, 2026 |
| Victoza | 5a9ef4ea-c76a-4d34-a604-27c5b505f5a4 | 31 | Nov 17, 2025 |
| Saxenda | 3946d389-0926-4f77-a708-0acb8153b143 | 22 | Jun 15, 2026 |
| Trulicity | 463050bd-2b1c-40f5-b3c3-0a04bb433309 | 62 | Aug 10, 2026 |
| Tikosyn | 02438044-d6a3-49e9-a1ac-3aad21ef2c8c | 30 | Apr 22, 2026 |
| Betapace | afce2787-8899-4098-87c8-f1e8dd19e6dd | 6 | Jun 29, 2023 |
| Tenormin | 6e850b1e-28a4-4ff8-8ed7-bb0b29faa28a | 2 | May 1, 2026 |
| Zestril | 838c2d78-d2d8-4981-9ec9-e50ef9e1a5d8 | 2 | May 5, 2025 |
| Entresto | 000dc81d-ab91-450c-8eae-8eb74e72296f | 25 | Jul 7, 2026 |
| Crestor | 325a5d0e-9a72-4015-9fcd-1655fb504cee | 19 | Sep 30, 2026 |
| Aldactone | 0fed2822-3a03-4b64-9857-c682fcd462bc | 25 | Dec 1, 2025 |
| Inspra | 1a52bedc-8e2c-4116-a296-a87770676b4a | 6 | Feb 6, 2026 |
| Allopurinol tablets (Dr. Reddy's; re-pinned) | 19a138b8-d225-03e6-f762-abe71560204b | 15 | Sep 7, 2026 |
| Colchicine tablets (Amneal; re-pinned) | 7daef7e2-888d-4116-81a9-2c02b9ef97ef | 18 | Mar 28, 2025 |
| Zoledronic acid 4 mg (Heritage) | 00a5bd5a-e5ee-4bad-b510-a4d4485485c8 | 22 | Sep 22, 2023 |
| Reclast | 5a9b3737-9ce6-4a89-b76e-6aab79eba9cf | 3 | Feb 13, 2026 |
| Fosamax | 14e931fd-2c5f-4d90-b7db-5980706f4a56 | 10 | Mar 16, 2026 |
| Actonel | 24ed00e0-25e2-49a8-97fc-66c1b417dc0b | 31 | May 11, 2026 |
| Cyklokapron | 6e89a7d9-4da4-42aa-b7f8-c602c24eefe5 | 34 | Sep 8, 2025 |
| Tranexamic acid tablets (ANI; re-pinned) | 82bc4879-bcf5-47c4-8636-a73c4e7d0de9 | 4 | Sep 22, 2025 |
| Ketorolac injection (Hospira) | 8accbb78-fc64-45d5-69b0-35c23a1d2a2e | 36 | Jul 21, 2026 |
| Ketorolac tablets (Teva) | 688f5dec-a6db-43c6-a1f8-5df99d08d395 | 19 | Jan 6, 2025 |
| Famotidine tablets (Teva; re-pinned) | 4c6f4f9e-f3f5-4ecf-9f40-887e037e8847 | 21 | Aug 14, 2026 |
| Reglan | de55c133-eb08-4a35-91a2-5dc093027397 | 8 | Feb 16, 2026 |
| Myrbetriq | ba9e9e15-e666-4c56-9271-2e24739cfa2d | 17 | Aug 20, 2024 |
| Solifenacin tablets (Glenmark; re-pinned) | 010c0657-c907-477f-8bd7-5d455a5f50eb | 6 | Jan 29, 2026 |

Licensing: FDA labels on DailyMed are public domain (the `abx-renal` manifest already records
this). No compendium was used for any number.

## Tests

Shared (every tool): clock past the 12-month expiry gives no dose; `supersededOn` set gives no dose
for that drug and a dose for its neighbors; blank clearance gives no result; every drug's
generic and brand name routes to its tool; the result names set id, version and date; no
result string contains "give", "recommend" in the tool's voice, or a dose when the flag is
`no-recommendation-given`.

- `doac-dose-check`: apixaban AF, age 80, 60 kg, creatinine 1.4 → 2.5 mg (two of three, edges
  inclusive); age 79, 61 kg, creatinine 1.5 → 5 mg; the same patient under DVT treatment → 10
  mg then 5 mg, never 2.5. Rivaroxaban AF at CrCl 50 → 15 mg, 51 → 20 mg; VTE at 14 → avoid.
  Dabigatran AF at 30 → 75 mg ("15 to 30"), 31 → 150, 14 → no recommendation; with dronedarone
  at 40 → 75 mg, at 29 → avoid. Edoxaban AF at 96 → do not use, 95 → 60 mg, 50 → 30 mg, 14 →
  not recommended, citing section 8.6.
- `lmwh-fondaparinux-dose-check`: dalteparin month 1 at 56 kg → 10,000, 57 kg → 12,500, 120 kg
  → 18,000 (cap); months 2–6 at 99 kg → 18,000. Fondaparinux 50 kg → 7.5 mg, 49 kg → 5 mg,
  101 kg → 10 mg; CrCl 29 → contraindicated; prophylaxis at 49 kg → contraindicated, at 50 kg →
  2.5 mg once daily. Dalteparin medical prophylaxis → 5,000 units at any weight.
- `iv-antithrombotic-renal-check`: eptifibatide CrCl 49 → 1 mcg/kg/min, 50 → 2; tirofiban CrCl
  60 → reduced, 61 → not; bivalirudin dialysis → 0.25 mg/kg/h regardless of CrCl.
- `antiviral-renal-dose`: valacyclovir zoster at 49 → 1 g q12h, 29 → 1 g q24h, 9 → 500 mg
  q24h; genital initial at 40 → no reduction. Oseltamivir at 60 → 30 mg twice daily, 61 → 75
  mg. Paxlovid eGFR 29 → day-1 300/100 once, then 150/100 daily. Remdesivir at any value → the
  no-adjustment sentence. Valganciclovir at 9 → not recommended.
- `nrti-renal-dose`: Truvada treatment at 29 → not recommended; PrEP at 59 → not recommended;
  entecavir refractory at 30 → 0.5 mg daily or 1 mg q48h; lamivudine at 4 → 50 mg then 25 mg.
- `gabapentinoid-renal-dose`: gabapentin at 7.5 → half the 15 mL/min figure; pregabalin 300
  mg/day at CrCl 30 → both the 30–60 and 15–30 rows shown; pregabalin 75 mg once daily on
  hemodialysis → supplement 100 or 150 mg.
- `cns-renal-dose-check`: levetiracetam CrCl 60 mL/min with BSA 2.3 → 45 mL/min/1.73 m² →
  moderate band (the un-normalized value would pick mild); topiramate at 70 → usual, 69 → half;
  lacosamide at 29 with no maximum entered → the 25% sentence and no milligram figure;
  varenicline on hemodialysis → maximum 0.5 mg once daily.
- `diabetes-drug-egfr-check`: metformin start at 40 → not recommended; continuing at 40 →
  assess; 29 → contraindicated. Dapagliflozin glycemic at 44 → not recommended; heart failure,
  starting at 24 → not recommended; continuing at 24 → may continue 10 mg. Empagliflozin CKD at
  15 → "section 2 gives no floor" plus the 8.6 sentence. Alogliptin field reads CrCl.
- `glp1-titration-check`: Ozempic 0.25 mg begun 27 days ago → not yet; 28 → 0.5 mg permitted;
  Wegovy 2.0 mg → not a labeled step; Wegovy 7.2 mg under cardiovascular risk reduction → not
  listed for that indication; under adult weight reduction after 28 days at 2.4 mg → listed,
  after 27 → not yet; Rybelsus 4 mg → not a Rybelsus step (it is an Ozempic tablets step);
  Mounjaro 15 mg pediatric → above the 10 mg maximum; the form has no last-dose field and the
  result links `missed-dose-label-rule`.
- `dofetilide-dose-algorithm`: baseline 441 → contraindicated; 441 with conduction
  abnormality → proceeds; CrCl 60 → 250 mcg, 61 → 500, 39.9 → 125, 19 → contraindicated;
  baseline 400, post-dose 461 (15.25%) → step down; 460 (15.0%) → no change; post-dose-3 QTc
  501 → discontinue, not step down.
- `cardiac-renal-dose-check`: sotalol at 59 → 24 h, 9 → individualized (no number); lisinopril
  hypertension at 30 → 5 mg, 31 → no adjustment, 9 → 2.5 mg.
- `mra-potassium-dose-check`: eplerenone potassium 5.5 on 25 mg every other day → withhold;
  6.0 → withhold, restart rule shown; CrCl 30 → contraindicated; hypertension at CrCl 49 →
  contraindicated, heart failure at 49 → not.
- `gout-drug-renal-dose`: allopurinol gout eGFR 60 → 50 mg daily ("> 30 to 60"), 61 → no
  change, 4 → 50 mg weekly. Colchicine prophylaxis on dialysis → 0.3 mg twice a week (not
  daily); flare treatment on dialysis → single 0.6 mg dose; FMF on dialysis → 0.3 mg/day.
- `bisphosphonate-renal-check`: zoledronic acid 4 mg at 60 → 3.5 mg, 61 → 4 mg, 29 → no dose
  given; Reclast at 34 → contraindicated.
- `tranexamic-acid-renal-dose`: oral at 1.4 → normal, 1.5 → twice daily, 2.8 → twice daily,
  5.8 → 650 mg; IV at 2.83 → both rows; entering 45 (a clearance) is refused by the field range.
- `ketorolac-limit-check`: age 65 → reduced group; 49 kg → reduced group; day 6 → over the
  5-day limit; 125 mg in 24 h under 65 → over 120; tablets as the first dose → the label's
  "continuation only" sentence; 50 mg oral in 24 h → over 40.
- `gi-drug-dose-check`: metoclopramide GERD at CrCl 60 → adjusted group (label says "less than
  or equal to 60" for GERD, "less than 60" for gastroparesis: test both edges).
- `hepatic-label-dose`: caspofungin score 7 → 35 mg; score 10 → "no clinical experience";
  atomoxetine C → 25%; lacosamide with class B → the label's "mild or moderate" wording and a
  note that the label does not name Child-Pugh.

## Build status

Not started. Specified October 10, 2026.
