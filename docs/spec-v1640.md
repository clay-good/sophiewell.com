# spec-v1640 — Pharmacogenomics: from a genotype report to what CPIC and the FDA say

**Status:** Proposed, October 10, 2026. Specs only; nothing here is built. 9 new tools, none
gated as a whole; row-level build gates are marked where a row was not read.
**Charter:** [spec-v1627](spec-v1627.md). **Machinery:** [spec-v1628](spec-v1628.md). **Ledger:** [scope-pharmacy-practice.md](scope-pharmacy-practice.md).

A pharmacist is handed a lab report that says `CYP2D6 *4/*10x2` or `HLA-B*15:02 positive` and
has to answer two questions: what metabolizer status is that, and what does the guideline or the
label say for this drug. Both answers are table lookups plus a little arithmetic, and the tables
are public: CPIC publishes its allele-function, phenotype and recommendation tables as CC0 data
through an API, and the FDA publishes a table of pharmacogenetic associations. This wave gives
the pharmacist nine tools on one shared engine. The reader types the star alleles or the
phenotype printed on the report; the tools never call alleles from variants. Every result quotes
the source text, names the guideline and the data date, and stops.

Researched and re-verified October 10, 2026. Every tool here is group **Q** ("Medication Access &
Pharmacy") and is tagged `pharmacy` in `specialties` ([spec-v1628](spec-v1628.md) §4).

## Gap finder

**Method.** (a) The CPIC database tables were downloaded through `api.cpicpgx.org/v1/`
(`guideline`, `pair_view`, `gene`, `gene_result`, `gene_result_lookup`, `allele`,
`recommendation`, `drug`, `publication`, `change_log`, `file_artifact`) and read; (b) the FDA
Table of Pharmacogenetic Associations (147 rows) and the Table of Pharmacogenomic Biomarkers in
Drug Labeling (692 rows) were read on fda.gov; (c) 23 FDA labels were read on DailyMed for the
label-only algorithms, each on the NDA holder's current set id; (d) the CYP2D6 consensus paper
and four CPIC guidelines were read in PMC for rules that are not in the tables; (e) the license
pages of CPIC/ClinPGx, PharmVar and the KNMP (DPWG) were read.
Catalog greps: `pharmacogen, cyp2d6, cyp2c19, cyp2c9, cyp3a5, genotyp, hla-, tpmt, dpyd, nudt,
g6pd, slco, ugt1a1, activity score, metabolizer, star allele, phenoconv, eliglustat,
tetrabenazine, siponimod, clopidogrel, codeine, tramadol, pimozide, abacavir, rasburicase,
tacrolimus, thiopurine, warfarin, malignant hyperth`.

**What the catalog has.** `warfarin-iwpc`, `warfarin-gage` (regression models that take CYP2C9
and VKORC1 genotype), `warfarin-init-5mg`, `warfarin-init-10mg`, `vivax-radical-cure` and
`primaquine-single-low-dose` (WHO regimens by a G6PD **activity** result, not a genotype),
`mh-grading-scale` (clinical grading of an episode), `aat-deficiency` (a level and a Pi genotype;
not a drug-gene tool). Nothing converts a diplotype to a phenotype or returns a guideline
recommendation. No tool id below is live, and none is specified in another spec of this program.

**Three oncology tools are fixed views of this engine.** `dpyd-fluoropyrimidine-dose`,
`tpmt-nudt15-thiopurine-dose` and `ugt1a1-irinotecan-label` are specified in
[spec-v1635](spec-v1635.md) and stay there. They are built on the engine below: allele input
through tool 1's matcher, rows from the pinned recommendation table, the FDA row as the second
column, the shared footer and expiry. The DPYD rule "sum of the two lowest variant values" lives
in the engine. The metoclopramide label dose, which has a CYP2D6 poor-metabolizer row, is part of
`gi-drug-dose-check` in [spec-v1632](spec-v1632.md).

| Proposed | Live neighbor | Difference |
|---|---|---|
| `pgx-diplotype-phenotype` | none | No tool maps two alleles to a phenotype. |
| `cyp2d6-activity-score` | none | Copy-number arithmetic; nothing live. |
| `cyp2d6-phenoconversion` | none | Inhibitor adjustment of a score; nothing live. |
| `cpic-gene-drug` | `warfarin-iwpc`, `warfarin-gage` | Those are dose regressions for one drug. This is a recommendation lookup for 107 drugs. Warfarin is excluded from it (CPIC says its warfarin guidance is not a table). |
| `pgx-panel-review` | none | Reverse lookup: one report, every affected drug. |
| `eliglustat-cyp2d6-dose` | none | Label algorithm. |
| `siponimod-cyp2c9-dose` | none | Label algorithm. |
| `pgx-label-dose-limit` | `gi-drug-dose-check` ([spec-v1632](spec-v1632.md)) | That tool covers metoclopramide's renal, hepatic and CYP2D6 rows. This one covers eleven labels' poor-metabolizer ceilings and fractions and excludes metoclopramide. |
| `opioid-cyp2d6-pediatric-check` | none | No codeine or tramadol contraindication tool in the catalog. |

## Shared machinery

One engine serves the nine tools here and the three oncology tools named above.

### License (re-read October 10, 2026)

Read at `https://api.clinpgx.org/v1/data/page/dataUsagePolicy` (the page
`https://cpicpgx.org/license/` redirects to `https://www.clinpgx.org/page/dataUsagePolicy`),
under "CPIC License":

> "CPIC resources are freely available for use by anyone. All curated content published by CPIC
> is available free of restriction under the CC0 1.0 Universal (CC0 1.0) Public Domain
> Dedication."

and, under "CPIC Database and API User Agreement":

> "The CPIC database and API are also bound by these licensing and terms of use. To cite content
> downloaded via the API or from the CPIC database, please indicate the URL, the date accessed,
> and the version number."

The page does not name the four table types one by one. The dedication covers "all curated
content published by CPIC" and the database and API, and the allele-definition,
allele-functionality, diplotype-to-phenotype and recommendation tables are the curated content
the database holds (`allele_definition`, `allele`, `gene_result*`, `recommendation`). No
carve-out for any of them was found on the page. CPIC **requests** (does not require)
attribution, a statement that the primary source is at ClinPGx, citation of the publication, and
a statement that content is updated. "The CPIC logo and acronym may not be reproduced on another
website or in advertising materials without the permission of NIH": the tools write "CPIC" in
running text as the source name and never show the logo.
**Build gate:** confirm with CPIC that naming the source in text is not what the
logo-and-acronym sentence restricts (their own citation instruction is "indicate CPIC®. URL
[date accessed]", which implies naming is expected).

The same page licenses **ClinPGx/PharmGKB** data under the Creative Commons
Attribution-ShareAlike 4.0 International License and says "ClinPGx/PharmGKB is for research
purposes". None of it ships. Two columns of the CPIC `pair_view` table are PharmGKB products
carried inside the CPIC database (`clinpgxlevel`, the clinical-annotation level, and
`pgxtesting`, the label-annotation tag such as "Actionable PGx"); they are dropped at build.

**PharmVar** (star-allele definitions), read at `https://www.pharmvar.org/terms-and-conditions`
(last modified March 24, 2023): "The PharmVar database content is licensed under a Creative
Commons Attribution-ShareAlike 4.0 International license", and "you agree to only use the data
for research purposes and not with any intent to offer all or any part of the data for sale as a
commercial item." Variant-to-allele definitions therefore do not ship. Star-allele **names** are
identifiers; the names the tools show come from CPIC's own CC0 `allele` table.

### The CPIC dataset: what is fetched, pinned and stored

The dataset is `data/cpic/`, listed in [spec-v1628](spec-v1628.md) §3. That section also carries
the amendment that admits it to route A: [spec-v1501](spec-v1501.md) §2 describes route A as a
machine-readable federal file, and the CC0 CPIC tables are the one non-federal file admitted
under the same rules. This spec adds only the detail of how the tables are pinned and refreshed.

| Stored table | Endpoint | Rows read October 10, 2026 | Kept columns |
|---|---|---|---|
| Allele function | `/v1/allele` | 1,378 (1,278 with a function) | gene, allele name, `clinicalfunctionalstatus`, `activityvalue` |
| Phenotype rules | `/v1/gene_result`, `/v1/gene_result_lookup` | 101 results and 208 rules across 19 genes | gene, result, `activityscore`, `function1`, `function2`, `totalactivityscore`, `lookupkey` |
| Gene notes | `/v1/gene` | 132 | symbol, `lookupmethod` (PHENOTYPE, ACTIVITY_SCORE or ALLELE_STATUS), `notesondiplotype` |
| Recommendations | `/v1/recommendation` | 2,115 rows, 107 drugs, 246 distinct texts | guideline, drug, `population`, `lookupkey`, `implications`, `drugrecommendation`, `classification`, `comments` |
| Guidelines | `/v1/guideline` | 29 | id, name, genes, url, `notesonusage` |
| Pairs | `/v1/pair_view` | 574 | drug, gene, guideline, `cpiclevel`, `usedforrecommendation`, `provisional` (the two PharmGKB columns dropped) |
| Publications | `/v1/publication` | guideline rows only | guideline, year, PMID, DOI |
| Change log | `/v1/change_log` | 907 | used by the refresh only, not shipped |

Not stored: `gene_result_diplotype` (22 MB; every diplotype pre-expanded, and the engine
computes the same answer from the two small tables), `allele_definition` and `sequence_location`
(variant-level; the tools do not call alleles), frequency tables (no population priors).

**Size.** With recommendation strings de-duplicated into a string table, the tables fetched on
October 10, 2026 measured: recommendations 264 KB raw (33 KB gzip); allele function 60 KB (8 KB); phenotype rules
21 KB (2 KB); the FDA table below about 30 KB. About 375 KB raw, about 75 KB compressed, for
all nine tools and the three oncology tools. Re-measure at build.

**Pin.** The API is PostgREST (12.0.2) and sends `cache-control: no-cache`, no ETag and no single
database version. Three independent pins are recorded in the dataset manifest:

1. SHA-256 of each fetched table after canonical JSON serialization (sorted keys, sorted rows);
2. the newest `date` in `/v1/change_log` (read: `2026-08-03`) and the newest report date in
   `/v1/file_artifact` URLs (read: `.../data/report/2026-08-07/...`);
3. the newest release tag of `github.com/cpicpgx/cpic-data` (read: v1.60.1, published
   August 12, 2026). Its notes say "This is an application-only release so no database image
   was generated", so the tag alone does not prove data changed. It is recorded for citation,
   per CPIC's "URL, the date accessed, and the version number" request.

**How a guideline update is detected without a person.** The weekly `data-refresh` job
re-fetches the tables. If any hash differs it opens a pull request whose summary is generated
from (a) the `change_log` rows newer than the pinned date, grouped by type (`RECOMMENDATION`,
`GENE_PHENOTYPE`, `ALLELE_FUNCTION_REFERENCE`, `GUIDELINE`, `PAIR`), and (b) a row-level diff of
the recommendation and phenotype tables. Two real entries show what that looks like:
May 11, 2026, `GENE_PHENOTYPE TPMT`: "Updated the definition for an individual carrying 1
decreased function and 1 no function allele to IM instead of possible IM."; February 3, 2026,
`RECOMMENDATION RxNorm:103`: "Updated for the guideline update 2025-2026". Shape checks fail the
job (no pull request) when a table loses more than 5% of its rows, a kept column disappears, or
a `classification` value appears that is not one of `Strong, Moderate, Optional, No
Recommendation, n/a` (counts read: Optional 1,047; Strong 591; Moderate 357; No Recommendation
108; n/a 12).

**The table can lag the guideline.** CPIC's own disclaimer says the database and API "may not
have been updated to reflect content noted on the guideline page." Seen on October 10, 2026: the
`publication` table lists a 2026 update of the CYP2D6 5-HT3 antagonist guideline (PMID 41979467)
and a June 15, 2026 change-log entry "Updated pairs for Ondansetron guideline update", but
`recommendation` has **no ondansetron or tropisetron rows**. So the refresh also compares, per
guideline, the newest publication year against whether the drug has rows. A level-A or level-B
drug with a guideline and no rows is stored as `rows: none`, and the tools answer for that drug:
"CPIC has a guideline for this pair (name, year, link). Its recommendation table is not in the
CPIC database as of <date>." Nothing is transcribed by hand to fill the hole.

**Expiry and fail closed.** `expiresOn` = last successful fetch + 14 days, the default
[spec-v1517](spec-v1517.md) sets for every weekly fetched file (twice the cadence): the tables
carry no version and the change log had entries in 27 of the 36 months from September 2023
through August 2026, so two missed weekly fetches is already the signal that the copy may be
behind. A failed fetch keeps the previous data and does not renew the date. Past `expiresOn`:

- the phenotype tools stop computing and ask for the phenotype as printed on the lab report
  (route C), labeled "CPIC tables of <date> are past their check date";
- the recommendation tools show no recommendation text, only the guideline name and link;
- the label tools (6 to 9) are unaffected by CPIC expiry and carry their own label-row dates.

### The FDA table (the second column), route B

`https://www.fda.gov/medical-devices/precision-medicine/table-pharmacogenetic-associations`
is HTML only: three tables (Section 1, therapeutic management, 82 rows; Section 2, safety or
response, 25 rows; Section 3, pharmacokinetics only, 40 rows; 147 data rows after the three
header rows), four columns (Drug, Gene, Affected Subgroups, Description). No CSV, JSON, XLSX or
API link is on the page. "Content current as of: 09/10/2026". Its update list shows the cadence
is irregular: September 10, 2026; October 26, 2022; May 24, 2022; November 8, 2021; May 24,
2021; March 18, 2021; February 25, 2020. Nothing was posted for almost four years, then one
update added more than 20 rows. It is a U.S. government work (public domain). It is stored as a
dated snapshot: 147 rows of verbatim text keyed by drug and gene, the "content current as of"
date, and a hash. The page watch of [spec-v1501](spec-v1501.md) §2 covers it; a changed hash or
date flags the snapshot for re-verification by a person and never edits it. `validThrough` =
verified date + 12 months; past it the FDA column is replaced by "FDA table snapshot of <date>
is past its check date" and a link. The CPIC column keeps working.

The Table of Pharmacogenomic Biomarkers in Drug Labeling
(`https://www.fda.gov/drugs/science-and-research-drugs/table-pharmacogenomic-biomarkers-drug-labeling`,
HTML, 692 rows, current as of 08/12/2026) lists drug, therapeutic area, biomarker and the label
sections that mention it. It carries no rule, most rows are tumor markers, and on its own it is
a list. It is not shipped as a tool; the build may use it as a finder for which labels to read.

### Label rows and guideline prose

Tools 6 to 9 hold numbers read from FDA labels. Each is a label row under the label-edition
contract of [spec-v1628](spec-v1628.md) §1 (route D): the NDA holder's set id, dated by
`(setId, spl_version)` and the published date, watched weekly by section hash, failing closed
per drug. This spec restates none of that scheme; the editions read are listed under each tool.

Two rules are guideline prose that the API does not carry: the CYP2D6 inhibitor rule (tool 3)
and the warfarin adjustments (Backfills). They are route-B dated constants with a page watch on
the guideline page.

### Posture and input rules (every tool)

Output is: the computed value; the source's own sentence, verbatim, in quotation marks; CPIC's
strength of recommendation exactly as CPIC classifies it; the guideline name, its publication
year and the data date. No "give", "switch to" or "reduce" in the site's voice
([spec-v1628](spec-v1628.md) §5). A fixed footer on every CPIC result carries what CPIC asks
for: source CPIC via ClinPGx, the guideline citation, "CPIC guidelines and content are subject
to updates; confirm the current content at ClinPGx", URL, date accessed, and data pin. Where
CPIC and the FDA row differ, both are shown side by side with no reconciliation.

**No allele calling.** Inputs are star alleles, named variants or a phenotype, as the lab
printed them. No rsID or VCF input, no inference of an allele from a partial panel, no
"*1 by default" (if the reader leaves an allele blank the tool does not answer), no ancestry
priors, no polygenic scores.

## Tools

### 1. `pgx-diplotype-phenotype` — Diplotype to Phenotype (CPIC)

**Input.** Gene (selector), then the two alleles from the lab report, chosen from that gene's
CPIC allele list. Gene-specific forms: G6PD asks for one variant (hemizygous) or two; MT-RNR1,
CFTR, RYR1 and CACNA1S ask for named variants; SLCO1B1 and the others ask for star alleles.
**Compute.** Look up each allele's function in the allele table, then match the unordered pair
in the phenotype-rule table. Rules read in the API on October 10, 2026:

| Gene (method) | Allele functions (examples read) | Pair → result |
|---|---|---|
| CYP2C19 (function pair) | *1 normal; *2, *3 and ten others no function; *9, *10, *16, *19, *25, *26 decreased; *17 increased | normal+normal NM; normal+increased RM; increased+increased UM; normal+no or increased+no IM; no+no PM; a decreased allele with a normal, increased or decreased partner "Likely Intermediate Metabolizer"; decreased+no "Likely Poor Metabolizer"; any uncertain allele Indeterminate |
| CYP2C9 (activity score) | *1, *9 = 1.0; *2, *5, *8, *11 and 17 others = 0.5; *3, *6, *13 and ten others = 0 | sum: 2.0 NM; 1.5 or 1.0 IM; 0.5 or 0 PM; any uncertain or unknown allele Indeterminate. Gene note: "CYP2C9 diplotype to phenotype translation is not applicable to the warfarin guideline." |
| CYP3A5 (function pair) | *1 normal; *3, *6, *7 no function; *8, *9 unknown | normal+normal NM; normal+no IM; no+no PM; unknown+normal "Possible Intermediate Metabolizer"; other unknown pairs Indeterminate |
| CYP2B6 (function pair) | *1, *2, *5 and three others normal; *6, *9 and 13 others decreased; *18 and six others no function; *4 increased | normal+normal NM; normal+increased RM; increased+increased UM; one normal or increased with one decreased or no function IM; two of decreased or no function PM; any uncertain allele Indeterminate |
| DPYD (activity score; drug tool in [spec-v1635](spec-v1635.md)) | 56 variants 1.0; 7 at 0.5; 21 at 0 | sum of **the two lowest** variant values: 2 NM; 1.5 or 1 IM; 0.5 or 0 PM (gene note read in full) |
| TPMT (function pair) | *1 normal; *2, *3A, *3B, *3C and 34 others no function; *8 decreased | normal+normal or normal+decreased NM; normal+no, decreased+decreased or decreased+no IM; no+no PM; uncertain or unknown+no "Possible Intermediate Metabolizer"; other uncertain or unknown pairs Indeterminate |
| NUDT15 (function pair) | *1 normal; *2, *3, *4, *6 and eight others no function; *5, *8 decreased | normal+normal or normal+decreased NM; normal+no or decreased+decreased IM; no+no or no+decreased PM; uncertain+no "Possible Intermediate Metabolizer"; other uncertain pairs Indeterminate |
| UGT1A1 (function pair) | *1 normal; *6, *27, *28, *37, *80+*28, *80+*37 decreased; *36 increased; *80 alone unknown | two of normal or increased NM; one decreased with a normal or increased IM; decreased+decreased PM; any unknown allele Indeterminate |
| SLCO1B1 (function pair) | *1, *37 normal; *5, *9, *15 and eight others no function; *14, *20 increased | normal+normal or normal+increased Normal Function; increased+increased Increased Function; normal or increased + no function Decreased Function; no+no Poor Function; uncertain or unknown + no "Possible Decreased Function"; other uncertain or unknown pairs Indeterminate |
| ABCG2 (function pair) | rs2231142 G normal, T decreased | Normal, Decreased, Poor Function |
| NAT2 (function pair) | *1, *4 "increased"; *5, *6, *7, *14 and 36 others decreased | increased+increased Rapid; increased+decreased Intermediate; decreased+decreased Poor; any unknown or uncertain allele Indeterminate |
| G6PD (class pair) | 187 variants, each tagged with a WHO class: I (deficient with CNSHA) 86, II 53, III 37, IV (normal) 5, uncertain 6 | class IV only: Normal; a class II or III allele alone, or any pair of class I, II or III alleles that includes a II or III: Deficient; class I alone or class I+I: Deficient with CNSHA; one class IV with one class I, II or III: **Variable**; any uncertain allele: Indeterminate |
| RYR1, CACNA1S | RYR1: 96 variants "Malignant Hyperthermia associated", 35 normal, 216 uncertain; CACNA1S: c.520C>T and c.3257G>A MH-associated | any MH-associated variant: Malignant Hyperthermia Susceptibility; otherwise "Uncertain Susceptibility" (CPIC has no "not susceptible" result) |
| MT-RNR1 | m.1095T>C, m.1494C>T, m.1555A>G increased risk; m.827A>G normal risk; 20 uncertain | the variant's own risk class |
| CFTR | 103 variants "ivacaftor responsive", 1 non-responsive entry | at least one responsive variant: responsive |

An allele that is in CPIC's list with no function assigned (for example CYP2C19 *43 to *52,
added August 3, 2026, and CYP2C9 *76 to *94) has no rule row; the tool says "CPIC has not
assigned a function to this allele" and gives no phenotype.
**Output.** Each allele's function, the phenotype (and score where the gene uses one), CPIC's
own description sentence for the matched rule, and the data pin. CYP2D6 opens tool 2.
**Not in this tool.** HLA-A and HLA-B (the report already says positive or negative; tool 4
takes that directly), IFNL3 (guideline retired; see Rejected), VKORC1 and CYP4F2 (CPIC: "not
applicable to the warfarin guideline", no phenotype table).
**Structure decision.** One tool with a gene selector, not one tool per gene. The rules are one
data table and one matcher; fifteen ids would be fifteen copies of the same screen. Findability
is handled where it belongs: a search-prefill template per gene routes `cyp2c19 *2/*17`,
`tpmt *1/*3a`, `slco1b1 *5/*15` to this tool with the gene and alleles filled, and each gene
symbol and its common names (for example "2C19", "thiopurine methyltransferase") are search
aliases. MCP: one tool, `pgx_phenotype(gene, allele1, allele2)`, with `gene` an enum and the
allele list returned by a `values` lookup, so an agent does not need to know fifteen tool names.
**Source.** CPIC `allele`, `gene_result`, `gene_result_lookup`, `gene` tables, CC0.
**Note.** The G6PD classes are the historical WHO classes I to IV. The 2022 CPIC G6PD guideline
(read in PMC10281211) describes WHO's proposed classes A, B, C and U and says: "For the purposes
of this guideline, the historical classification (class I-class IV) will be used as G6PD alleles
have not yet been mapped to the new classes". The API still tags variants I to IV. The tool
shows CPIC's class and does not map to A/B/C/U.

### 2. `cyp2d6-activity-score` — CYP2D6 Activity Score with Duplications (CPIC)

**Input.** The two CYP2D6 alleles as reported, each optionally with a copy number or a tandem
(for example `*4`, `*10x2`, `*1x≥3`, `*36+*10`, `*68+*4`). Or: two alleles plus "a duplication
is present but the lab did not say which allele".
**Compute.** Each allele's activity value from the CPIC allele table, then the sum.
Values read: no function 0 (48 rows: *3, *4, *5, *6, *4x2, *36, *68+*4 and others); decreased
0.25 (11 rows: *9, *10, *41, *36+*10 and seven others); decreased 0.5 (13 rows: *17, *29, *14,
*10x2, *41x2, *9x2 and others); *41x3 = 0.75; normal 1.0 (16 rows: *1, *2, *35, *17x2, *29x2 and
others); increased 2.0 (*1x2, *2x2, *35x2 and three others); ≥3.0 (*1x≥3, *2x≥3). Copy-number
alleles are **rows in CPIC's table**, not a multiplication the tool performs: an
allele-and-copy-number that has no row (for example `*17x3`) is refused with "CPIC lists no
activity value for this allele".
Score to phenotype, as the phenotype table has it: 0 PM; 0.25, 0.5, 0.75, 1.0 IM; 1.25, 1.5,
1.75, 2.0, 2.25 NM; 2.5 and above UM (rows exist for 2.5, 2.75, 3.0, 4.0 and for "≥3.0",
"≥3.25", "≥3.5", "≥3.75", "≥4.0", "≥5.0" and "≥6.0"). Any uncertain or unknown allele:
Indeterminate, score "n/a".
When the duplicated allele is not identified, the tool computes both assignments and returns
both (for `*1/*4` plus a duplication: `*1x2/*4` = 2.0 NM, `*1/*4x2` = 1.0 IM) and says the
report does not determine which.
**Output.** Per-allele values, the score, the phenotype, CPIC's description of that score, pin.
**Source.** CPIC `allele` and `gene_result_lookup` (CC0). The cut points are those of Caudle et
al., "Standardizing CYP2D6 Genotype to Phenotype Translation", Clin Transl Sci 2020 (PMC6951851,
read): consensus definition PM 0; IM 0 < x < 1.25; NM 1.25 ≤ x ≤ 2.25; UM > 2.25.
**Note.** The consensus paper downgraded only *10 to 0.25 ("currently limited to CYP2D6*10").
CPIC's table now also gives **\*9 and \*41** 0.25 (change log, November 8, 2022: "Changed
function assignment for *9, *32, *41, *52, *91, *109, *119, *132,"). A tool hard-coded from the
paper would score `*1/*41` as 1.5 where CPIC's table gives 1.25, and `*4/*41` as 0.5 where the
table gives 0.25. The values are data, read from the pinned table, never constants in code.
**Scope.** CYP2D6 has its own id because its input is different in kind (copy number, tandems,
ambiguity) and because "cyp2d6 *4/*10" is the most common query in the domain.

### 3. `cyp2d6-phenoconversion` — CYP2D6 Activity Score Adjusted for an Inhibitor (CPIC Opioid Guideline)

**Input.** A CYP2D6 activity score (from tool 2 or the report) and the strength of a
concomitant CYP2D6 inhibitor: none, weak, moderate, strong. Strength is reader input.
**Compute.** Strong: score becomes 0, phenotype PM. Moderate: score × 0.5, then the phenotype
from the consensus bands (0 PM; 0 < x < 1.25 IM; 1.25 ≤ x ≤ 2.25 NM; > 2.25 UM). Weak or none:
unchanged (the guideline states a rule for strong and moderate inhibitors only).
**Output.** Genotype score and phenotype, adjusted score and phenotype, the rule sentence, and
the line "Rule as stated in the CPIC opioid guideline (2021)". If the adjusted score is not one
of CPIC's table scores (1.25 × 0.5 = 0.625), the tool gives the phenotype band only and says
recommendation rows keyed by score do not apply to it. The adjusted score links into tool 4 only
for the drugs of that guideline (codeine, tramadol, hydrocodone).
**Source.** CPIC Guideline for CYP2D6, OPRM1 and COMT and opioids, Clin Pharmacol Ther 2021
(PMC8249478, read): "For patients on strong CYP2D6 inhibitors, the CYP2D6 activity score is
adjusted to 0 and the predicted phenotype is a poor metabolizer. For patients who are on
moderate CYP2D6 inhibitors, the activity score is multiplied by 0.5 and then converted to the
predicted phenotype". This rule is guideline prose; it is **not** in the API.
**The rule is not general.** The 2023 CPIC serotonin reuptake inhibitor guideline (PMC10564324,
read) says: "Consensus approaches for adjusting CYP2D6, CYP2C19, or CYP2B6 predicted phenotypes
in the presence of inhibitors or inducers have not been established". The tool prints that
sentence under every result and does not offer the adjusted score for antidepressant,
atomoxetine, tamoxifen or other non-opioid rows.
**Proof shown, not a database.** FDA's examples page (current as of 05/29/2026) lists as strong
CYP2D6 inhibitors bupropion, fluoxetine, paroxetine, quinidine, terbinafine; as moderate
abiraterone, cinacalcet, duloxetine, lorcaserin, mirabegron, rolapitant. They appear as examples
under the strength selector with FDA's own caveat that they are examples. The tool does not
classify a drug the reader types (no interaction database, by standing rule).
**Note.** The guideline also says "There does not appear to be any clinically relevant induction
of CYP2D6 activity by any medications"; there is no "inducer" option. Duration (an inhibitor's
effect persisting after it is stopped) is not computed.

### 4. `cpic-gene-drug` — CPIC Recommendation and FDA Statement for a Drug and a Genotype Result

**Input.** Drug (107 with CPIC rows, plus the drugs that appear only in the FDA table); then,
for each gene the drug's guideline uses, the result: a phenotype, a CYP2D6, CYP2C9 or DPYD
activity score, or an HLA carrier status ("positive", "negative", "no result"). Population where
the guideline splits (read: clopidogrel: ACS or PCI, cardiovascular non-ACS non-PCI,
neurovascular; atomoxetine and voriconazole: adults, pediatrics; carbamazepine: naive, used more
than 3 months, no alternatives; oxcarbazepine, phenytoin and fosphenytoin: naive, used more than
3 months; efavirenz: one population, child over 40 kg or adult). Optional: the reader's standard
dose, for the arithmetic below.
**Compute.** Exact match on (drug, population, lookup key) in the recommendation table. The key
is a phenotype for most genes, **the activity score for CYP2D6, CYP2C9 and DPYD** (codeine rows
are keyed `"CYP2D6": "0.25"`, not "Intermediate Metabolizer"), and an allele status for HLA. Two-
gene guidelines key on both, with "No Result" a legal value (rosuvastatin: SLCO1B1 × ABCG2, 27
rows; sertraline: CYP2C19 × CYP2B6, 62; amitriptyline: CYP2D6 × CYP2C19, 206; phenytoin: CYP2C9
× HLA-B, 20 per population; fluvastatin: SLCO1B1 × CYP2C9, 48; thiopurines: TPMT × NUDT15, 35;
volatile anesthetics: RYR1 × CACNA1S, 8). No match: "CPIC has no row for this combination."
The FDA row for the same drug and gene is matched by drug and gene and shown whole; the tool
does not decide whether the reader's phenotype is inside FDA's "affected subgroup" wording, it
prints the subgroup.
**Dose arithmetic (optional).** When the matched CPIC text states a number, a small side table
maps that text to a factor, and the tool applies it to the reader's dose. Every row below was
read in the API on October 10, 2026, including the sibling drugs.

| Drug, result | CPIC text (read in the API) | Arithmetic |
|---|---|---|
| Tacrolimus, CYP3A5 NM, IM or possible IM | "Increase starting dose 1.5 to 2 times recommended starting dose. Total starting dose should not exceed 0.3 mg/kg/day." | reader's starting dose × 1.5 to × 2, each capped at 0.3 mg/kg/day × weight |
| Celecoxib, flurbiprofen, ibuprofen, lornoxicam, CYP2C9 score 0 or 0.5 | "Initiate therapy with 25-50% of the lowest recommended starting dose. Titrate dose upward to clinical effect or 25-50% of the maximum recommended dose with caution." The same sentence is stored for all four drugs, including its celecoxib-specific clause "(at least 8 days for celecoxib after first dose in PMs)". | 0.25 to 0.5 × reader's lowest starting dose; 0.25 to 0.5 × reader's maximum dose |
| Meloxicam, CYP2C9 score 1.0 | "Initiate therapy with 50% of the lowest recommended starting dose. Titrate dose upward to clinical effect or 50% of the maximum recommended dose with caution." (Score 0 or 0.5: alternative therapy, no number.) | 0.5 × |
| Omeprazole, lansoprazole, pantoprazole, dexlansoprazole, CYP2C19 UM | "Increase starting daily dose by 100%." | 2 × |
| Same four, NM or RM | "Initiate standard starting daily dose. Consider increasing dose by 50-100% for the treatment of H. pylori infection and erosive esophagitis." | 1.5 to 2 ×, shown only as the range for those two indications |
| Same four, IM, likely IM, PM or likely PM | "For chronic therapy (>12 weeks) and efficacy achieved, consider 50% reduction in daily dose" | 0.5 × |
| Phenytoin, fosphenytoin, CYP2C9 score 1.0 / score 0 or 0.5 (HLA-B*15:02 negative or no result) | "For subsequent doses, use approximately 25% less than typical maintenance dose" / "approximately 50% less than typical maintenance dose"; first dose "typical initial or loading dose" | 0.75 × / 0.5 × maintenance; first dose unchanged |
| Citalopram, escitalopram, CYP2C19 PM or likely PM | "consider a lower starting dose, slower titration schedule and 50% reduction of the standard maintenance dose" | 0.5 × maintenance |
| Sertraline, by the matched CYP2C19 × CYP2B6 row | CYP2C19 PM or likely PM with CYP2B6 other than PM: "50% reduction of standard maintenance dose as compared to CYP2C19 normal metabolizers". CYP2B6 PM with CYP2C19 NM, no result or indeterminate: "25% reduction of standard maintenance dose". CYP2B6 PM with CYP2C19 IM or likely IM: "50% reduction". Both PM: "Select an alternative antidepressant", no number. | 0.5 ×, 0.75 × or none, from the matched row only |
| Paroxetine, CYP2D6 score 0 | "Consider a 50% reduction in recommended starting dose, slower titration schedule, and a 50% lower maintenance dose" | 0.5 × |
| Vortioxetine, CYP2D6 score 0 | "Initiate 50% of starting dose (e.g., 5 mg) and titrate to the maximum recommended dose of 10 mg" | 0.5 ×; ceiling 10 mg |
| Efavirenz, CYP2B6 IM / PM | "decreased dose of 400 mg/day" / "400 or 200 mg/day" (NM, RM, UM: "standard dosing (600 mg/day)") | fixed |
| Hydralazine, NAT2 PM | "Initiate therapy at a total daily dose of 40 to 75 mg. ... use caution with total daily hydralazine doses of 200 mg or more." (Rapid and intermediate: "a starting total daily dose of at least 75 mg. Titrate up to 300 mg".) | range and flag |
| Atorvastatin, SLCO1B1 decreased or possible decreased / poor | "Prescribe ≤40mg as a starting dose" / "Prescribe ≤20mg as a starting dose" | planned starting dose against the ceiling |
| Pitavastatin, decreased or possible decreased / poor | "Prescribe ≤ 2mg as a starting dose" / "Prescribe ≤1mg as a starting dose" | same |
| Pravastatin, poor | "Prescribe ≤40mg as a starting dose" (decreased: desired starting dose, caution above 40 mg per day) | same |
| Simvastatin, decreased or possible decreased | "If simvastatin therapy is warranted, limit dose to <20mg/day." (Poor: alternative statin, no number.) | planned dose under 20 mg (strict) |
| Lovastatin, decreased or possible decreased | "If lovastatin therapy is warranted, limit dose to ≤20mg/day." (Poor: alternative statin, no number.) | planned dose at or under 20 mg |
| Rosuvastatin, by the matched SLCO1B1 × ABCG2 row | "≤20mg as a starting dose": SLCO1B1 poor with ABCG2 normal, decreased or no result; ABCG2 poor with SLCO1B1 normal, increased, indeterminate or no result. "**≤10mg** as a starting dose": ABCG2 poor with SLCO1B1 decreased, possible decreased or poor. | planned starting dose against the matched row's ceiling |
| Fluvastatin, by the matched SLCO1B1 × CYP2C9 row | "≤40mg per day as a starting dose": CYP2C9 score 1.0 or 1.5 with SLCO1B1 normal, increased, indeterminate or no result; SLCO1B1 poor with CYP2C9 2.0, n/a or no result. "≤20mg per day as a starting dose": CYP2C9 score 0 or 0.5 with SLCO1B1 normal, increased, indeterminate or no result; CYP2C9 1.0 or 1.5 with SLCO1B1 decreased or possible decreased. Alternative statin, no number: CYP2C9 0 or 0.5 with SLCO1B1 decreased, possible decreased or poor; CYP2C9 1.0 or 1.5 with SLCO1B1 poor. | planned starting dose against the matched row's ceiling |

Thiopurine and fluoropyrimidine arithmetic is in the tools of [spec-v1635](spec-v1635.md).

Each side-table row stores the SHA-256 of the exact CPIC sentence it was derived from. If a
refresh changes that sentence, the hash no longer matches, the factor is dropped (the tool shows
the new text and no arithmetic), and the refresh pull request lists the row for a person to
re-derive. A number is never parsed out of prose by code.
**Output.** Left: CPIC's "implications" sentence per gene, the recommendation text verbatim,
"Classification of recommendation: Strong / Moderate / Optional / No Recommendation" as CPIC
gives it, CPIC's comments, the guideline name and year, CPIC level of the pair (A, A/B, B).
Right: the FDA table's section (1, 2 or 3), affected subgroup and description, verbatim, with
its "content current as of" date. Then the arithmetic line if any. Then the attribution footer.
**Source.** CPIC `recommendation`, `pair_view`, `guideline`, `publication` (CC0); FDA Table of
Pharmacogenetic Associations (public domain).
**Structure decision.** One engine, one id, not one tool per guideline. Twenty-nine guideline
tools would each be the same lookup with a fixed filter, and a pharmacist asks by drug, not by
guideline. Each drug name plus its gene is a search alias with prefill ("clopidogrel cyp2c19",
"abacavir hla", "simvastatin slco1b1"). MCP: `cpic_recommendation(drug, results, population)`.
**Not answered here.** Warfarin (CPIC `notesonusage`: "Warfarin recommendation does not follow
simple diplotype to phenotype translation"; see Backfills), ondansetron and tropisetron (no rows
in the database on October 10, 2026), methadone (guideline listed, no rows, pair at level C),
peginterferon (retired).

#### CPIC guidelines in the database on October 10, 2026

Years are from the API `publication` table; rows and classifications from `recommendation`;
levels from `pair_view`. "Numbers" means the text carries a dose, percent or ceiling.

| Guideline | Drugs with rows (CPIC level) | First; latest publication | Rows | Numbers or avoid |
|---|---|---|---|---|
| HLA-B and Abacavir | abacavir (A) | 2012; 2014 | 2 | Avoid ("Abacavir is not recommended") |
| HLA-B and Allopurinol | allopurinol (A) | 2012; 2015 | 2 | Avoid ("Allopurinol is contraindicated") |
| HLA-A, HLA-B and Carbamazepine and Oxcarbazepine | carbamazepine, oxcarbazepine (A) | 2013; 2018 | 28 | Avoid, by population |
| CYP2C9, HLA-B and Phenytoin | phenytoin, fosphenytoin (A) | 2014; 2020 | 80 | Both: avoid if *15:02 positive and naive; 25% or 50% lower maintenance |
| CYP2C19 and Clopidogrel | clopidogrel (A) | 2011; 2022 | 24 | Avoid or alternative, by indication |
| CYP2C19 and Proton Pump Inhibitors | omeprazole, lansoprazole, pantoprazole (A), dexlansoprazole (B) | 2020 | 32 | Numbers (+100%, +50-100%, -50%) |
| CYP2C19 and Voriconazole | voriconazole (A) | 2016 | 16 | Alternative agent |
| CYP2D6, CYP2C19 and Tricyclic Antidepressants | amitriptyline, nortriptyline (A); clomipramine, desipramine, doxepin, imipramine, trimipramine (B) | 2013; 2016 | 1,074 | Both (not read row by row) |
| CYP2D6, CYP2C19, CYP2B6, SLC6A4, HTR2A and Serotonin Reuptake Inhibitor Antidepressants | citalopram, escitalopram, sertraline, paroxetine, vortioxetine (A); fluvoxamine, venlafaxine (B) | 2015; 2023 | 166 | Both (50%, 25%) |
| CYP2D6, OPRM1, COMT and Opioids | codeine, tramadol (A), hydrocodone (B) | 2011; 2021 | 66 | Codeine and tramadol: avoid at score 0 and at 2.5 or more |
| CYP2D6 and Atomoxetine | atomoxetine (A) | 2019 | 44 | Numbers (0.5 and 1.2 mg/kg/day; 40, 80, 100 mg/day; plasma 200 and 400 ng/mL) |
| CYP2D6 and Tamoxifen | tamoxifen (A) | 2018 | 22 | Alternative; 20 mg/day |
| CYP2D6 and Ondansetron and Tropisetron | ondansetron, tropisetron (A) | 2016; **2026** | **0** | Not in the database |
| CYP2D6, ADRB1, ADRB2, ADRA2C, GRK4, GRK5 and Beta-Blockers | metoprolol (B) | 2024 | 22 | Lowest starting dose at score 0 |
| CYP2B6 and Efavirenz | efavirenz (A) | 2019 | 6 | Numbers (600, 400, 200 mg/day) |
| CYP2B6 and Methadone | none (pair at level C) | 2024 | 0 | No recommendation rows |
| CYP2C9 and NSAIDs | celecoxib, flurbiprofen, ibuprofen, lornoxicam, meloxicam, piroxicam, tenoxicam (A) | 2020 | 42 | Both (25-50%, 50%; alternative for piroxicam, tenoxicam) |
| CYP2C9, VKORC1, CYP4F2 and Warfarin | warfarin (A) | 2011; 2017 | 0 | Algorithm in prose and a figure |
| CYP3A5 and Tacrolimus | tacrolimus (A) | 2015 | 5 | Numbers (1.5 to 2 times; 0.3 mg/kg/day) |
| DPYD and Fluoropyrimidines | fluorouracil, capecitabine (A) | 2013; 2017 | 10 | Both ([spec-v1635](spec-v1635.md)) |
| TPMT, NUDT15 and Thiopurines | azathioprine, mercaptopurine, thioguanine (A) | 2011; **2026** | 105 | Numbers ([spec-v1635](spec-v1635.md)) |
| UGT1A1 and Atazanavir | atazanavir (A) | 2015 | 4 | Alternative |
| SLCO1B1, ABCG2, CYP2C9 and Statins | atorvastatin, fluvastatin, lovastatin, pitavastatin, pravastatin, rosuvastatin, simvastatin (A) | 2012; 2022 | 105 | Numbers (dose ceilings) |
| G6PD | 33 drugs with rows; level A: dapsone, methylene blue, nitrofurantoin, pegloticase, primaquine, rasburicase, tafenoquine, toluidine blue | 2014; 2022 | 165 | Avoid; the primaquine Deficient row carries weekly regimens |
| MT-RNR1 and Aminoglycosides | amikacin, gentamicin, kanamycin, neomycin, paromomycin, plazomicin, streptomycin, tobramycin and three more (A) | 2021 | 33 | Avoid |
| RYR1, CACNA1S and Volatile Anesthetics and Succinylcholine | desflurane, enflurane, halothane, isoflurane, methoxyflurane, sevoflurane, succinylcholine (A) | 2018 | 56 | Avoid ("relatively contraindicated") |
| CFTR and Ivacaftor | ivacaftor (A) | 2014 | 2 | "Ivacaftor is not recommended" for the non-responsive result |
| NAT2 and Hydralazine | hydralazine (A) | 2025 | 4 | Numbers (40 to 75 mg, 75 mg, 200 mg, 300 mg) |
| IFNL3 and Peginterferon | peginterferon alfa-2a, alfa-2b | 2013 | 0 | **Retired** (change log, May 13, 2026) |

Pair counts by level: A 96, A/B 7, B 32, B/C 56, C 272, C/D 5, D 102, Retired 4 (574).
Level A, A/B or B pairs with **no** guideline (27, all flagged `provisional`): siponimod-CYP2C9,
pitolisant-CYP2D6, irinotecan-UGT1A1 (A); eliglustat-CYP2D6, oliceridine-CYP2D6,
pimozide-CYP2D6, tetrabenazine-CYP2D6, valproic acid-POLG, divalproex sodium-POLG and
velaglucerase alfa-GBA (A/B); aripiprazole-CYP2D6, risperidone-CYP2D6, brivaracetam-CYP2C19,
acenocoumarol (CYP2C9, CYP4F2), phenprocoumon-CYP4F2, belinostat-UGT1A1, mycophenolic
acid-HPRT1, carbamazepine-SCN1A, phenytoin-SCN1A, carglumic acid-NAGS, and valproic acid with
ABL2, ASL, ASS1, CPS1, NAGS and OTC (B). For these the CPIC column is empty by design and the
FDA table or the label (tools 6 to 8) is the source.

#### CPIC and FDA side by side: disagreements read on October 10, 2026

Each row was checked against both texts. Label editions are the NDA holder's set (version,
published date) unless stated.

| Pair | CPIC (API) | FDA table (September 10, 2026) | FDA label read |
|---|---|---|---|
| Tacrolimus, CYP3A5 expressers | Strong: "Increase starting dose 1.5 to 2 times recommended starting dose" | Section 1, "intermediate or normal metabolizers": "Measure drug concentrations and adjust dosage based on trough whole blood tacrolimus concentrations." No starting-dose change. | Prograf (version 30, March 21, 2025): CYP3A5 appears once, as a metabolizing enzyme ("CYP3A4 and CYP3A5"); the words genotype and pharmacogenomic do not appear |
| Pantoprazole, CYP2C19 IM or PM | Optional (IM) or Moderate (PM): "For chronic therapy (>12 weeks) and efficacy achieved, consider 50% reduction in daily dose" | Section 1: "Consider dosage reduction in children who are poor metabolizers. No dosage adjustment is needed for adult patients who are intermediate or poor metabolizers." | Protonix delayed-release (version 48, May 20, 2026): "For adult patients who are CYP2C19 poor metabolizers, no dosage adjustment is needed."; "For known pediatric poor metabolizers, a dose reduction should be considered." |
| Allopurinol, HLA-B*58:01 positive | Strong: "Allopurinol is contraindicated" | Section 2: "Results in higher adverse reaction risk (severe skin reactions)." No action stated. | Allopurinol tablets, Accord (version 13, November 17, 2025; no current brand label is on DailyMed): "The use of allopurinol is not recommended in HLA-B*58:01 positive patients unless the benefits clearly outweigh the risks." Not a contraindication. |
| Clopidogrel, CYP2C19 IM | Strong (ACS or PCI): "Avoid standard dose (75 mg) clopidogrel if possible" | Section 1, "intermediate or poor metabolizers": "Consider use of another platelet P2Y12 inhibitor." | Plavix (version 5, June 11, 2025) boxed warning names poor metabolizers only: "Consider use of another platelet P2Y12 inhibitor in patients identified as CYP2C19 poor metabolizers." |
| Codeine, CYP2D6 PM | Strong (score 0): "Avoid codeine use because of possibility of diminished analgesia" | Section 1 lists ultrarapid metabolizers only. Section 2, poor metabolizers: "Results in lower systemic active metabolite concentrations and may result in reduced efficacy." No action stated. | Codeine sulfate (Lannett, version 29, February 5, 2026): section 4 contraindicates by age and procedure; section 5.6 says "individuals who are ultra-rapid metabolizers should not use codeine sulfate tablets"; no action for poor metabolizers |
| Citalopram, CYP2C19 PM | Strong: alternative, or "50% reduction of the standard maintenance dose" | Section 1: "The maximum recommended dose is 20 mg." | Celexa (version 40, August 20, 2026): maximum 20 mg once daily |
| Celecoxib, CYP2C9 PM | Moderate: "25-50% of the lowest recommended starting dose" | Section 1: "Reduce starting dose to half of the lowest recommended dose in poor metabolizers." | Celebrex (version 13, December 18, 2025): "Consider a dose reduction by 50%"; section 8.8: "starting with half the lowest recommended dose" |

### 5. `pgx-panel-review` — One Genotype Report, Every Drug CPIC or the FDA Flags

**Input.** The report's results: any number of (gene, phenotype or score or carrier status)
lines. Paste or CSV accepted (two columns), parsed locally.
**Compute.** For each result, every recommendation row keyed by that gene and value (with every
other gene in a multi-gene row set to "No Result" unless the reader also entered it) whose text
differs from that drug's row for the normal result. Then every FDA row for that gene. Sorted by
CPIC classification (Strong first), then FDA section.
**Output.** A table: drug, CPIC text (truncated with a link into tool 4), classification, FDA
section. A count per result (how many drugs have a changed CPIC recommendation).
A CSV export for the patient record.
**Source.** Same tables as tool 4.
**Scope.** The reverse of tool 4 and a different task: reviewing a new panel against the whole
drug list, or answering "which drugs does HLA-B*15:02 positive touch" (read: carbamazepine,
oxcarbazepine, phenytoin, fosphenytoin). It does not read a medication list and judge it;
matching to the patient's drugs is the reader's step.
**Note.** "Differs from the normal row" is computed by text inequality, so a drug whose
recommendation is identical across phenotypes is not listed. No clinical ranking is invented.

### 6. `eliglustat-cyp2d6-dose` — Eliglustat (Cerdelga) Dose by CYP2D6 Status (FDA Label)

**Input.** CYP2D6 metabolizer status as the label names them (extensive [= normal],
intermediate, poor, ultra-rapid, indeterminate); hepatic impairment (none, mild Child-Pugh A,
moderate, severe); renal function (no impairment; mild, moderate or severe; end-stage renal
disease); concomitant CYP2D6 inhibitor (none, weak, moderate, strong); concomitant CYP3A
inhibitor (none, weak, moderate, strong).
**Compute.** The label's rules, in this order:
1. Ultra-rapid: limitation of use ("may not achieve adequate concentrations of CERDELGA to
   achieve a therapeutic effect"). Indeterminate: "A specific dosage cannot be recommended".
   Stop.
2. Contraindications (section 4, read whole in both listings). EM: a strong or moderate CYP2D6
   inhibitor together with a strong or moderate CYP3A inhibitor; moderate or severe hepatic
   impairment; mild hepatic impairment with a strong or moderate CYP2D6 inhibitor. IM: a strong
   or moderate CYP2D6 inhibitor together with a strong or moderate CYP3A inhibitor; a strong
   CYP3A inhibitor; any degree of hepatic impairment. PM: a strong CYP3A inhibitor; any degree
   of hepatic impairment.
3. Renal impairment (section 8.6). EM: "Avoid CERDELGA in patients with end-stage renal disease
   (ESRD)"; no adjustment for mild, moderate or severe impairment. IM and PM: "Avoid CERDELGA in
   patients with any degree of renal impairment."
4. Table 2, 84 mg once daily: EM without hepatic impairment taking a strong or moderate CYP2D6
   inhibitor, or a strong or moderate CYP3A inhibitor; EM with mild hepatic impairment taking a
   weak CYP2D6 inhibitor or a strong, moderate or weak CYP3A inhibitor; IM without hepatic
   impairment taking a strong or moderate CYP2D6 inhibitor.
5. Table 1: EM and IM 84 mg twice daily; PM 84 mg once daily.
**Output.** The dosage, "contraindicated" or "avoid", with the label row quoted and the section
number.
**Source.** CERDELGA label, Genzyme, DailyMed set 819f828a-b888-4e46-83fc-94d774a28a83,
version 13, published March 11, 2024; sections 1, 2.1 to 2.3, 4, 8.6, 8.7.
**Build gate.** Section 7.1, Table 5, also has "Avoid coadministration" cells short of
contraindication (CYP3A inhibitors in IMs and PMs, a strong CYP2D6 with a moderate CYP3A
inhibitor, strong CYP3A inducers). The table was read as flattened text in which the cell-to-
column alignment is not certain. Those rows ship only after Table 5 is re-read cell by cell in
the rendered label; until then a combination outside steps 1 to 5 returns "see section 7.1,
Table 5" and no dosage.
**Note.** The label says "extensive", CPIC says "normal"; the tool shows both words.

### 7. `siponimod-cyp2c9-dose` — Siponimod (Mayzent) Maintenance Dose by CYP2C9 Genotype (FDA Label)

**Input.** CYP2C9 genotype as reported.
**Compute.** *1/*1, *1/*2, *2/*2: 5-day titration (0.25, 0.25, 0.50, 0.75, 1.25 mg on days 1 to
5), maintenance 2 mg once daily starting day 6 (12-tablet starter pack). *1/*3, *2/*3: 4-day
titration (0.25, 0.25, 0.50, 0.75 mg), maintenance 1 mg once daily starting day 5 (7-tablet
starter pack). *3/*3: contraindicated. Any other genotype (*5, *6, *8, *11 and so on): "the
label gives no dosage for this genotype", with the label's sentence: "The impact of variants
other than *2 and *3 on the pharmacokinetics of siponimod has not been evaluated."
**Output.** The regimen and the label sentence. Both regimens carry: "If one titration dose is
missed for more than 24 hours, treatment needs to be reinitiated with Day 1 of the titration
regimen."
**Source.** MAYZENT label, Novartis, DailyMed set 44492772-5aed-4627-bd85-e8e89f308bb3,
version 17, published July 10, 2026; sections 2.1 to 2.3 and 4. Section 2.1: "An FDA-cleared or
-approved test for the detection of CYP2C9 variants to direct the use of siponimod is not
currently available." FDA table Section 1: "Adjust dosage based on genotype. Do not use in
patients with CYP2C9 *3/*3 genotype."
**Note.** This is a genotype list, not a phenotype: *2/*2 (CPIC score 1.0, IM) gets 2 mg and
*1/*3 (also score 1.0) gets 1 mg. The tool must not route through a phenotype.

### 8. `pgx-label-dose-limit` — Poor-Metabolizer Dose Ceilings and Fractions in FDA Labels

**Input.** Drug (list below); the metabolizer status on the report; the planned daily dose
(and single dose, weight, age or indication where the row needs it); the usual dose for the
fraction rows.
**Compute.** For a poor metabolizer of the row's enzyme:

| Drug (enzyme) | Label rule read | Check |
|---|---|---|
| Tetrabenazine (CYP2D6) | PM: "the recommended maximum single dose is 25 mg, and the recommended daily dose should not exceed a maximum of 50 mg". EM and IM: "maximum recommended daily dose is 100 mg and the maximum recommended single dose is 37.5 mg". Above 50 mg/day patients "should be first tested and genotyped". | daily and single dose against the ceiling for the status; a dose over 50 mg/day with status unknown returns the genotyping sentence |
| Deutetrabenazine (CYP2D6) | PM: "the total daily dosage of AUSTEDO XR or AUSTEDO should not exceed 36 mg" (section 2.4). The label states no single-dose ceiling for PMs. | daily ≤ 36 mg |
| Valbenazine (CYP2D6) | "The recommended dosage for known CYP2D6 poor metabolizers is INGREZZA or INGREZZA SPRINKLE 40 mg once daily" | dose = 40 mg |
| Pimozide (CYP2D6) | Children: "At doses above 0.05 mg/kg/day, CYP 2D6 genotyping should be performed. In poor CYP 2D6 metabolizers, ... doses should not exceed 0.05 mg/kg/day, and doses should not be increased earlier than 14 days". Adults: the same sentence with 4 mg/day. | mg/kg/day or mg/day against the ceiling; days since last increase ≥ 14; a dose over the threshold with status unknown returns the genotyping sentence |
| Aripiprazole oral (CYP2D6) | "Known CYP2D6 Poor Metabolizers": "Administer half of usual dose"; known PM taking a concomitant strong CYP3A4 inhibitor: "Administer a quarter of usual dose". Exception printed with the result: adjunctive use in major depressive disorder "should be administered without dosage adjustment". | usual dose × 0.5 or × 0.25; none for adjunctive MDD |
| Brexpiprazole (CYP2D6) | PM: "Administer half of the recommended dosage."; PM taking a strong or moderate CYP3A4 inhibitor: "Administer a quarter of the recommended dosage." | × 0.5 or × 0.25 |
| Vortioxetine (CYP2D6) | "The maximum recommended dose of TRINTELLIX is 10 mg/day in known CYP2D6 poor metabolizers." | daily ≤ 10 mg |
| Iloperidone (CYP2D6) | "Reduce the dose of FANAPT by one-half for CYP2D6 poor metabolizers". Table 2 gives the PM recommended dosage: schizophrenia 3 mg to 6 mg twice daily; bipolar I manic or mixed episodes 6 mg twice daily. | × 0.5; planned dose against the Table 2 dosage for the indication |
| Pitolisant (CYP2D6) | PM adults: "Initiate WAKIX at 8.9 mg once daily and increase after 7 days to a maximum recommended dosage of 17.8 mg once daily". Pediatric (6 years and older) under 40 kg: start 4.45 mg, maximum 8.9 mg once daily. Pediatric 40 kg or more: start 4.45 mg, 8.9 mg after 7 days, maximum 17.8 mg once daily. | daily against the ceiling for age and weight |
| Citalopram (CYP2C19) | "The maximum recommended dosage of CELEXA for patients who are greater than 60 years of age, patients with hepatic impairment, and for CYP2C19 poor metabolizers is 20 mg once daily" | daily ≤ 20 mg |
| Celecoxib (CYP2C9) | PM: "Consider a dose reduction by 50% (or alternative management for JRA)"; section 8.8: poor metabolizers "(i.e., CYP2C9*3/*3)", "starting with half the lowest recommended dose" | × 0.5 of the lowest recommended dose |

For a status other than poor: "the label states no adjustment for this status" (tetrabenazine
excepted, whose EM and IM ceilings are in its row).
**Output.** Within or over the label ceiling, or the fraction applied to the reader's usual
dose, with the label sentence, section, set id, version and published date.
**Source.** DailyMed labels re-read October 10, 2026, each on the NDA holder's set:

| Drug | Label (holder) | Set id | Version | Published |
|---|---|---|---|---|
| Tetrabenazine | Xenazine (Lundbeck) | ac768bab-8afa-4446-bc7f-caeeffec0cda | 21 | August 5, 2022 |
| Deutetrabenazine | Austedo, Austedo XR (Teva) | 7ea3c60a-45c7-44cc-afc2-d87fa53993c0 | 35 | March 24, 2025 |
| Valbenazine | Ingrezza (Neurocrine) | 4c970164-cafb-421f-9eb5-c226ef0a3417 | 34 | April 22, 2026 |
| Pimozide | Pimozide tablets (Par); no brand label is on DailyMed | 70b079e2-a1f7-4a93-8685-d60a4d7c1280 | 5 | September 7, 2026 |
| Aripiprazole | Abilify tablets (Otsuka) | c040bd1d-45b7-49f2-93ea-aed7220b30ac | 73 | February 3, 2025 |
| Brexpiprazole | Rexulti (Otsuka) | 2d301358-6291-4ec1-bd87-37b4ad9bd850 | 26 | May 28, 2026 |
| Vortioxetine | Trintellix (Takeda) | 1a5b68e2-14d0-419d-9ec6-1ca97145e838 | 18 | March 11, 2025 |
| Iloperidone | Fanapt (Vanda) | 33f60b40-3fca-11de-8f56-0002a5d5c51b | 35 | May 13, 2026 |
| Pitolisant | Wakix (Harmony) | 8daa5562-824e-476c-9652-26ceef3d4b0e | 18 | February 26, 2026 |
| Citalopram | Celexa (Allergan) | 4259d9b1-de34-43a4-85a8-41dd214e9177 | 40 | August 20, 2026 |
| Celecoxib | Celebrex (Viatris) | 2d6675e4-5859-4be2-8037-a20ce9f707aa | 13 | December 18, 2025 |

Repackager sets that surface first in a DailyMed search and must not be pinned: Rexulti
df891816 and 6991c065 (RemedyRepack), Trintellix 239215eb and bd0107e5 (RemedyRepack) and
cb1e9df4 (Cardinal Health), Fanapt b414d51b and 69d63a08 (a hospital repackager, 2017).
**Scope.** One tool because every row is the same shape (a label ceiling or fraction applied to
the reader's dose for one status). Metoclopramide is in `gi-drug-dose-check`
([spec-v1632](spec-v1632.md)). Inhibitor rows of the same labels (for example vortioxetine
"Reduce the dose of TRINTELLIX by one-half" with a strong CYP2D6 inhibitor) are label
drug-interaction dosing and stay out, except where the row is itself a poor-metabolizer row
(aripiprazole, brexpiprazole). Atomoxetine is not a row: the Strattera label (set 309de576-
c318-404a-bc15-660c2b1876fb, version 69, July 23, 2026, section 2.5) gives poor metabolizers no
ceiling or fraction, only "a longer titration interval of 4 weeks", with starting, target and
maximum dosages "the same as outlined in Table 1"; tool 4 shows the CPIC rows and the FDA row.
Aripiprazole long-acting injectables are not rows (their tables were not read).
**Note.** These drugs have no CPIC guideline (CPIC lists the pairs as provisional), so there is
no second column to compare, except citalopram, vortioxetine and celecoxib, which link to
tool 4.

### 9. `opioid-cyp2d6-pediatric-check` — Codeine and Tramadol: Age, Procedure and CYP2D6 Status

**Input.** Drug (codeine, tramadol), age in years, whether the use is pain after tonsillectomy
or adenoidectomy, CYP2D6 activity score or phenotype if known.
**Compute.** Label statements first, the same in both labels:
- section 4: "all children younger than 12 years of age": contraindicated;
- section 4: "postoperative management in children younger than 18 years of age following
  tonsillectomy and/or adenoidectomy": contraindicated;
- section 5.6, ages 12 to 18: "Avoid the use of ... in adolescents 12 to 18 years of age who
  have other risk factors that may increase their sensitivity to the respiratory depressant
  effects" (shown as text; the risk factors are not inputs);
- section 5.6, any age, ultra-rapid metabolizer: "individuals who are ultra-rapid metabolizers
  should not use" the drug.

Then the CPIC row for the score: score 0, "Avoid codeine use because of possibility of
diminished analgesia" (Strong; tramadol the same wording, Strong); score 2.5 or more, "Avoid
codeine use because of potential for serious toxicity" (Strong; tramadol: "potential for
toxicity", Strong); scores 0.25 to 1.0, label dosing with "If no response and opioid use is
warranted, consider a non-tramadol opioid" (codeine, Moderate) or "consider non-codeine opioid"
(tramadol, Optional); scores 1.25 to 2.25, label dosing (Strong).
**Output.** Each statement with its source, in the order label then CPIC, and which ones apply
to the inputs. With status unknown, the label rules alone.
**Source.** Codeine sulfate tablets, Lannett, DailyMed set 5819bdf7-300e-45b8-8f3a-447b53656293
(version 29, published February 5, 2026), sections 4 and 5.6 and the boxed warning. Tramadol
hydrochloride tablets, Amneal, set 67919c2c-2f8a-4bbb-bef5-0cd6c1e63a16 (version 51, published
January 28, 2026; the same pin as [spec-v1632](spec-v1632.md); no current Ultram label is on
DailyMed), sections 4 and 5.6; the Aurobindo tablet label (set e5005d9e, version 15) was read
and has the same two section 4 sentences. FDA table rows: codeine, Section 1, "Codeine is
contraindicated in children under 12 years of age."; tramadol, Section 1, "Contraindicated in
children under 12 and in adolescents following tonsillectomy/adenoidectomy. Breastfeeding is not
recommended during treatment." CPIC opioid rows via the API.
**Scope.** A decider, not a dose tool. The breastfeeding statement in the FDA tramadol row is
shown as text; it is not an input. Combination products (with acetaminophen) carry their own
labels and are not rows.

## Backfills (live tools that should do more)

| Live tool | Backfill | Source |
|---|---|---|
| `warfarin-iwpc`, `warfarin-gage` | After the model's dose, an optional CPIC step, split by self-identified ancestry as the guideline splits it. **Non-African ancestry:** for each CYP2C9 *5, *6, *8 or *11 allele entered, "decrease calculated dose by 15-30% per variant allele" (homozygous for variant alleles: 20-40%), Optional; CYP4F2*3 carrier, "increase the dose by 5-10%", Optional; rs12777823 "should not be considered". **African ancestry:** CYP2C9 *5, *6, *8 or *11, "decrease calculated dose by 15-30%" (two variant alleles: 20-40%), and rs12777823 A/G or A/A, "a dose reductions of 10-25%", both Moderate; no CYP4F2 step ("no recommendation is made for use of CYP4F2 genotype data"). Shown as a range beside the unadjusted dose. The live Gage note already says the 2008 model has no CYP4F2 term. | CPIC warfarin guideline 2017 (PMC5546947, read). Prose and a figure, not in the API: route-B constants. |
| `vivax-radical-cure`, `primaquine-single-low-dose` | One line under the result: these take a G6PD **activity** result; a genotype result of "Variable" or "Indeterminate" (CPIC) cannot stand in for it ("To ascertain G6PD status, enzyme activity must be measured."). Link to tool 1. | CPIC primaquine rows (API) |
| `mh-grading-scale` | Link to tool 4 for a known RYR1 or CACNA1S variant. No logic change. | none needed |

## Rejected

| Idea | Why not |
|---|---|
| Calling star alleles from rsIDs, a VCF or a raw consumer-genomics file | Not deterministic from what the reader holds, and out of scope by the input rule above. Also licensing: PharmVar definitions are CC BY-SA 4.0 with a research-only term. |
| "Assume *1" when an allele is not reported; inferring a phenotype from a partial panel | Imputation. A blank allele stops the tool. |
| Allele or phenotype frequencies by ancestry (the CPIC frequency tables) | Population priors; nothing to compute for one patient. |
| Polygenic or multi-gene "combinatorial" scores | Proprietary, not deterministic from a public source. |
| PharmGKB/ClinPGx clinical annotations, levels of evidence, label annotations ("Actionable PGx") | CC BY-SA 4.0 and research-only (read on the usage-policy page). Includes two columns inside CPIC's `pair_view`. |
| DPWG (Dutch) recommendations as a third column | The KNMP page (`https://www.knmp.nl/dossiers/farmacogenetica/pharmacogenetics`, updated April 23, 2026) offers a recommendation PDF (file dated May 1, 2025) and gene background PDFs with no license statement; the site is "© 2026 KNMP" and says the texts live in the G-Standaard, a subscription drug database. No machine-readable file. DPWG guideline papers in Eur J Hum Genet carry mixed license metadata (Europe PMC tags only the 2020 DPYD paper CC BY). Not licensed to ship, not maintainable without a person. The tools may link to the KNMP page. |
| One tool per gene (fifteen phenotype tools) or per guideline (twenty-nine lookups) | The same calculation under many ids. Search aliases and prefill do the findability work. |
| IFNL3 and peginterferon | CPIC marked the four pairs Retired (change log May 13, 2026: "marked peginterferon guideline pairs as retired"); no phenotype rows and no recommendation rows in the database. |
| CYP2B6 and methadone | Guideline is listed; the database has no recommendation rows and the pair is level C. |
| Ondansetron and tropisetron recommendation | A 2026 update is published; no rows in the database. Not transcribed by hand. The engine reports the gap (see Shared machinery). |
| Mavacamten dose by CYP2C19 genotype | The Camzyos label (set 669c936b-3ee6-4e36-8a22-79dd11b1255b, version 8, May 1, 2025) does not contain the word genotype; the FDA table says "adjustments based on CYP2C19 genotype are not necessary." Nothing to compute. |
| Warfarin as a CPIC table lookup | CPIC: "does not follow simple diplotype to phenotype translation." Handled as a backfill to the live models. |
| VKORC1 and CYP4F2 phenotype | CPIC gene notes: translation "not applicable to the warfarin guideline"; no result rows. |
| FDA Table of Pharmacogenomic Biomarkers as a lookup tool | A list of label sections, with no input and computed output. Mostly tumor markers. |
| Mapping G6PD variants to the WHO 2022 classes A, B, C, U | CPIC still publishes classes I to IV per variant and says the alleles "have not yet been mapped to the new classes". A hand mapping would be an invention. |
| A CYP2D6 inhibitor classifier (type a drug, get its strength) | A drug-interaction database by another name. Strength is reader input; FDA's examples are shown as proof. |
| Applying the opioid guideline's inhibitor rule to every CYP2D6 drug | The 2023 CPIC antidepressant guideline says consensus approaches for adjusting predicted phenotypes "have not been established". Tool 3 is limited to the guideline that states the rule. |
| Thioridazine CYP2D6 decider | The label (Mylan, set 52fea941-0b47-41c1-b00d-f88150e8ab93, version 15) contraindicates use in patients "known to have a genetic defect leading to reduced levels of activity of P450 2D6": a yes or no with no computation; covered by the FDA row in tool 4 ("Contraindicated in poor metabolizers."). |
| Atomoxetine as a `pgx-label-dose-limit` row | The label changes only the titration interval for poor metabolizers (see tool 8, Scope). |
| Deutetrabenazine single-dose ceiling for poor metabolizers | The FDA table says "maximum single dose of 18 mg"; section 2.4 of the label read does not state one. Two federal texts differ, so the single-dose check is not built; the 36 mg daily ceiling is in both. |
| Tacrolimus, statin, NSAID, PPI, phenytoin, SSRI, efavirenz, hydralazine as separate dose tools | Each is one CPIC row plus one multiplication; they are the arithmetic mode of tool 4, with the drug name as a search alias. |
| HLA "carrier → avoid" deciders as separate tools | Two-row lookups in tool 4; the cross-drug view is tool 5. |
| `gene_result_diplotype` shipped whole | 22 MB for answers the 21 KB rule table computes. |

## Research record

| Finding | Where read (URL) | Effect on the spec |
|---|---|---|
| CPIC content is CC0 1.0; "The CPIC database and API are also bound by these licensing and terms of use"; attribution requested; logo and acronym restricted; cite URL, date accessed, version. | `https://api.clinpgx.org/v1/data/page/dataUsagePolicy` (cpicpgx.org/license → clinpgx.org/page/dataUsagePolicy) | Tables ship; footer text; build gate on the acronym sentence. |
| ClinPGx/PharmGKB data: CC BY-SA 4.0, "for research purposes". | same page | Excluded, including `clinpgxlevel` and `pgxtesting`. |
| PharmVar: CC BY-SA 4.0; "only use the data for research purposes". Last modified March 24, 2023. | `https://www.pharmvar.org/terms-and-conditions` (rendered in a browser; the page is a script) | No allele definitions ship; allele names come from CPIC. |
| API is PostgREST 12.0.2; 40 paths in its OpenAPI root; no ETag, `cache-control: no-cache`. | `https://api.cpicpgx.org/v1/` | Pin by table hash, change-log date, release tag. |
| 29 guidelines; `version` per row is a row counter, not a release. | `/v1/guideline` | Not usable as a pin. |
| 574 pairs: A 96, A/B 7, B 32, B/C 56, C 272, C/D 5, D 102, Retired 4. Three level-A pairs have no guideline (siponimod, pitolisant, irinotecan), all provisional. | `/v1/pair_view` | Label tools 6 to 8; the irinotecan note in spec-v1635 confirmed. |
| Newest change-log date 2026-08-03 (CYP2C19 *43 to *52 added; *2 core definition changed). 907 entries; entries in 27 of the 36 months September 2023 to August 2026. | `/v1/change_log` | Update detection; why two missed weekly fetches expire the data. |
| TPMT rule changed May 11, 2026; thiopurine recommendations updated February 3 and 4, 2026; NAT2-hydralazine created September 1, 2025; peginterferon pairs retired May 13, 2026; ondansetron pairs updated June 15, 2026. | `/v1/change_log` | Examples for the refresh summary; IFNL3 rejected. |
| cpic-data release v1.60.1 (August 12, 2026), "application-only release". File-artifact report date 2026-08-07. | `https://api.github.com/repos/cpicpgx/cpic-data/releases`; `/v1/file_artifact` | Citation pin. |
| CYP2D6 values: *10, *9, *41 = 0.25; *17, *29 = 0.5; *1x2 = 2.0; *1x≥3 = "≥3.0"; *10x2 = 0.5; *41x3 = 0.75. Score 2.25 NM, 2.5 UM. CYP2C9 and DPYD: 2.0 NM; 1.5, 1.0 IM; 0.5, 0 PM. | `/v1/allele`, `/v1/gene_result`, `/v1/gene_result_lookup` | Tools 1 and 2. |
| The consensus paper downgraded only *10; bands PM 0, IM 0 < x < 1.25, NM 1.25 to 2.25, UM > 2.25. | PMC6951851 (Europe PMC full text) | Tool 2 source; proves values must be data. |
| *9 and *41 function changed November 8, 2022. The entry's `deployedrelease` field is empty, so no release date is stated. | `/v1/change_log` | Tool 2 note. |
| Inhibitor rule (strong → 0; moderate × 0.5), quoted verbatim. | PMC8249478 (NCBI efetch, author manuscript) | Tool 3. |
| The 2023 antidepressant guideline: "Consensus approaches for adjusting CYP2D6, CYP2C19, or CYP2B6 predicted phenotypes in the presence of inhibitors or inducers have not been established". | PMC10564324 (NCBI efetch) | Tool 3 limited to the opioid guideline; sentence printed; generalization rejected. |
| FDA strong and moderate CYP2D6 inhibitor examples; page current 05/29/2026. | `https://www.fda.gov/drugs/drug-interactions-labeling/healthcare-professionals-fdas-examples-drugs-interact-cyp-enzymes-and-transporter-systems` | Tool 3 examples. |
| Rules for CYP2C19 (incl. "Likely Intermediate", "Likely Poor"), CYP2C9, CYP3A5, CYP2B6, DPYD, TPMT, NUDT15, UGT1A1, SLCO1B1, ABCG2, NAT2, G6PD, RYR1, CACNA1S, MT-RNR1, CFTR, HLA-A, HLA-B. IFNL3, VKORC1, CYP4F2 have no result rows. | `/v1/gene_result`, `/v1/gene_result_lookup`, `/v1/allele`, `/v1/gene` | Tool 1 table. |
| G6PD: API tags classes I to IV; guideline keeps the historical classes and describes WHO's proposed A, B, C, U. | `/v1/allele`; PMC10281211 | Tool 1 note; mapping rejected. |
| Recommendation table: 2,115 rows, 107 drugs, 246 distinct texts; classifications Strong, Moderate, Optional, No Recommendation, n/a; CYP2D6, CYP2C9 and DPYD keyed by score. No rows for ondansetron, tropisetron, warfarin, methadone or peginterferon. | `/v1/recommendation` | Tool 4 matcher. |
| Recommendation texts for tacrolimus, clopidogrel, PPIs, codeine, tramadol, hydrocodone, efavirenz, hydralazine, ivacaftor, metoprolol, statins, NSAIDs, phenytoin, voriconazole, tamoxifen, SSRIs, vortioxetine, atomoxetine, carbamazepine, oxcarbazepine, primaquine, mercaptopurine, atazanavir, abacavir, allopurinol, volatile anesthetics. | `/v1/recommendation` | Tool 4 arithmetic table and disagreement table. |
| **Corrected.** Fluvastatin does not share a sibling's sentence: its 48 rows carry ≤40 mg and ≤20 mg per day ceilings and alternative-statin rows by CYP2C9 score and SLCO1B1 function. | `/v1/recommendation` (fluvastatin rows) | Arithmetic row added. |
| **Corrected.** Rosuvastatin: ABCG2 poor with SLCO1B1 decreased, possible decreased or poor is "≤10mg as a starting dose", not ≤20 mg. | `/v1/recommendation` (rosuvastatin, 27 rows) | Arithmetic row rewritten by matched row. |
| **Corrected.** Sertraline's factor depends on both genes (50%, 25%, or alternative with no number); it is not one 0.5 for every CYP2C19 poor metabolizer. | `/v1/recommendation` (sertraline, 62 rows) | Arithmetic row split from citalopram and escitalopram. |
| Confirmed. Flurbiprofen, ibuprofen and lornoxicam carry celecoxib's sentence verbatim; escitalopram carries citalopram's; lansoprazole and dexlansoprazole carry omeprazole's (dexlansoprazole all Optional). | `/v1/recommendation` | Sibling rows no longer gated. |
| **Corrected.** Oxcarbazepine has two populations (naive, used more than 3 months), not three; phenytoin has 20 rows per population (40 per drug). | `/v1/recommendation` | Tool 4 input and compute. |
| **Corrected.** Level A/B list was missing divalproex sodium-POLG; level B list was missing carbamazepine-SCN1A, phenytoin-SCN1A, carglumic acid-NAGS and valproic acid-ABL2. | `/v1/pair_view` | No-guideline list. |
| FDA association table: HTML, three sections (82, 25, 40 = 147 data rows), current 09/10/2026; update list back to February 25, 2020. | `https://www.fda.gov/medical-devices/precision-medicine/table-pharmacogenetic-associations` | Route B snapshot with page watch. **Corrected** the row count (147, not 150) and the update list. |
| FDA biomarker table: HTML, 692 data rows, current 08/12/2026. | `https://www.fda.gov/drugs/science-and-research-drugs/table-pharmacogenomic-biomarkers-drug-labeling` | Not shipped. |
| **Corrected.** The FDA table has a Section 2 codeine row for poor metabolizers ("may result in reduced efficacy") and its Section 1 codeine row states only the under-12 contraindication; the tonsillectomy wording is the tramadol row's. | same FDA page | Disagreement table; tool 9 source. |
| **Corrected.** Codeine and tramadol labels, section 5.6: "individuals who are ultra-rapid metabolizers should not use" the drug; and an "avoid" statement for ages 12 to 18 with other risk factors. | DailyMed sets 5819bdf7 (codeine, Lannett) and 67919c2c (tramadol, Amneal) | Tool 9 compute and test (a score of 2.5 or more is not "label permits"). |
| Tramadol section 4: under 12 years and under 18 years after tonsillectomy or adenoidectomy, read in two manufacturers' labels. | DailyMed sets 67919c2c (Amneal), e5005d9e (Aurobindo) | Tool 9; former Verify item closed. |
| Eliglustat Tables 1 and 2, both listings of section 4, limitations of use, sections 8.6 and 8.7. | DailyMed set 819f828a-b888-4e46-83fc-94d774a28a83, version 13 | Tool 6; renal step added from section 8.6; Table 5 gated. |
| Siponimod genotype dosing, titration days, *3/*3 contraindication, the "not evaluated" sentence. | DailyMed set 44492772-5aed-4627-bd85-e8e89f308bb3, version 17 | Tool 7. |
| Poor-metabolizer rows for the eleven drugs of tool 8, each on the NDA holder's set. | DailyMed sets in the tool 8 table | Tool 8. |
| **Corrected.** Rexulti, Trintellix and Fanapt re-read on the holders' sets (Otsuka 2d301358, Takeda 1a5b68e2, Vanda 33f60b40). Rows unchanged for brexpiprazole and vortioxetine; the Fanapt label now adds a Table 2 of poor-metabolizer dosages by indication. | DailyMed | Tool 8 set ids and iloperidone row. |
| **Corrected.** Aripiprazole Table 1 carries an exception: adjunctive use in major depressive disorder is given "without dosage adjustment". Pitolisant has a third poor-metabolizer row (pediatric, 40 kg or more). Deutetrabenazine's label states no single-dose ceiling. | DailyMed sets c040bd1d, 8daa5562, 7ea3c60a | Tool 8 rows; one check rejected. |
| **Corrected.** A current allopurinol label is not silent on HLA-B*58:01: "not recommended in HLA-B*58:01 positive patients unless the benefits clearly outweigh the risks." The only Zyloprim set on DailyMed is a 2009 label. | DailyMed set 682dd8b8-fc6e-47c5-95b7-82d7ad96b750 (Accord, version 13) | Disagreement table. |
| Prograf: CYP3A5 appears once (metabolism); no genotype dosing. Plavix boxed warning names poor metabolizers. Protonix: no adult adjustment; pediatric reduction considered. | DailyMed sets 7f667de1, de8b0b67, 08098cb2 | Disagreement table; former Verify item closed. |
| Strattera section 2.5: poor metabolizers get a 4-week titration interval and the same doses. | DailyMed set 309de576-c318-404a-bc15-660c2b1876fb, version 69 | Not a tool 8 row. |
| Mavacamten: no genotype dosing. | DailyMed set 669c936b-3ee6-4e36-8a22-79dd11b1255b; FDA table | Rejected. |
| **Corrected.** CPIC warfarin: the strength of the *5/*6/*8/*11 step and the presence of the CYP4F2 and rs12777823 steps differ by ancestry branch (non-African: Optional, CYP4F2 yes, rs12777823 no; African: Moderate, CYP4F2 no, rs12777823 yes). | PMC5546947 | Backfill split by branch. |
| DPWG: PDF with no license statement; text embedded in the G-Standaard. Not re-read on October 10, 2026 second pass. | `https://www.knmp.nl/dossiers/farmacogenetica/pharmacogenetics` | Rejected. |
| A 2026 CPIC 5-HT3 antagonist update exists (Clin Pharmacol Ther 2026;120:387-393). | PubMed 41979467 (abstract); `/v1/publication` | "Table lags guideline" rule. |
| Weekly fetched files expire after 14 days (twice the cadence). | [spec-v1517](spec-v1517.md), Failure behavior | **Corrected** the CPIC expiry from 180 days to 14. |

## Verify at build

- **License.** Ask CPIC (contact on cpicpgx.org) whether writing "CPIC" as a source name is
  within the logo-and-acronym sentence. The CC0 sentence was read; the per-table scope is a
  reading of "all curated content" plus the database sentence, not an itemized statement.
- **`cpic-gene-drug`.** The 1,074 tricyclic rows and the 165 G6PD rows were counted, not read
  one by one. Every arithmetic side-table row is hash-checked against the pinned sentence at
  build, as the tool requires. Sizes in Shared machinery are from one fetch; re-measure.
- **FDA column.** The 147 data rows were parsed from HTML and counted (82, 25, 40). The rows
  quoted in this spec were read; the rest were not read one by one.
- **`eliglustat-cyp2d6-dose`.** Section 7.1, Table 5 was read as flattened text. Re-read it
  cell by cell in the rendered label before any "Avoid coadministration" row ships (build gate
  on those rows).
- **`pgx-label-dose-limit`.** Aripiprazole long-acting injectables (and the FDA table's
  aripiprazole lauroxil row) have their own tables, not read; they are not rows. Confirm at
  build that Par is still the pimozide label to pin and that no brand set has appeared.
- **`opioid-cyp2d6-pediatric-check`.** Confirm at build which codeine sulfate tablet label is
  the application holder's (Lannett's was read) and re-pin if it is another.
- **`cyp2d6-phenoconversion`.** The supplement of the 2023 antidepressant guideline was not
  opened; the main text was. If the supplement states a numeric rule, it still does not change
  this tool, which cites the opioid guideline only.
- **Warfarin backfill.** The recommendation text was read; Figure 2 was not viewed as an image.
  Confirm the order of operations in the figure, and decide how the live tools ask for ancestry
  (the guideline's branches are by self-identified ancestry).
- **G6PD.** The phenotype rules for two deficient alleles of different classes were read from
  the lookup rows; the sex input is implied by one versus two alleles and must be tested against
  CPIC's own diplotype table for ten cases.
- **Units.** Tacrolimus cap is "0.3 mg/kg/day" total starting dose; the reader's dose must be
  entered as mg/kg/day or as mg/day with weight. CPIC does not say which weight; the tool asks
  for the weight the reader's protocol uses and says so.
- **DPWG.** The KNMP page facts were not re-read in the second pass; re-read before quoting them
  on a page.

## Sources

- CPIC database and API, `https://api.cpicpgx.org/v1/` (tables named above), CC0 1.0; accessed
  October 10, 2026; change log through 2026-08-03; cpic-data v1.60.1.
- ClinPGx data usage policy, `https://www.clinpgx.org/page/dataUsagePolicy`.
- PharmVar Terms and Conditions, `https://www.pharmvar.org/terms-and-conditions`.
- FDA Table of Pharmacogenetic Associations (content current as of September 10, 2026).
- FDA Table of Pharmacogenomic Biomarkers in Drug Labeling (August 12, 2026).
- FDA, examples of drugs that interact with CYP enzymes and transporter systems (May 29, 2026).
- Caudle KE et al. Standardizing CYP2D6 Genotype to Phenotype Translation. Clin Transl Sci
  2020;13:116-124. PMC6951851.
- Crews KR et al. CPIC Guideline for CYP2D6, OPRM1, and COMT Genotypes and Select Opioid
  Therapy. Clin Pharmacol Ther 2021. PMC8249478.
- Bousman CA et al. CPIC Guideline for CYP2D6, CYP2C19, CYP2B6, SLC6A4, and HTR2A Genotypes and
  Serotonin Reuptake Inhibitor Antidepressants. Clin Pharmacol Ther 2023. PMC10564324.
- Gammal RS et al. Expanded CPIC Guideline for Medication Use in the Context of G6PD Genotype.
  Clin Pharmacol Ther 2023. PMC10281211.
- Johnson JA et al. CPIC Guideline for Pharmacogenetics-Guided Warfarin Dosing: 2017 Update.
  PMC5546947.
- CPIC Guideline for CYP2D6 Genotype and Use of 5-HT3 Receptor Antagonists: 2026 Update.
  Clin Pharmacol Ther 2026;120(2):387-393. PMID 41979467 (abstract only).
- DailyMed labels (set ids in the text): Cerdelga, Mayzent, Xenazine, Austedo, Ingrezza,
  pimozide (Par), Abilify, Rexulti, Trintellix, Fanapt, Wakix, Celexa, Celebrex, Strattera,
  codeine sulfate (Lannett), tramadol hydrochloride (Amneal; Aurobindo), Plavix, Prograf,
  Protonix delayed-release, allopurinol (Accord), Camzyos, thioridazine (Mylan). Read in the
  first pass and not relied on here: Dilantin, Zyloprim (set 342832b5, a 2009 label).
- KNMP, Pharmacogenetics, `https://www.knmp.nl/dossiers/farmacogenetica/pharmacogenetics`.
- [spec-v1501](spec-v1501.md) §2, [spec-v1517](spec-v1517.md), [spec-v1628](spec-v1628.md) §1
  and §3 for the data contract this spec builds on.

## Tests

- **Engine.** The manifest hash of each stored table equals the hash of the fetched table after
  canonical serialization. A recommendation row whose text hash changed has no arithmetic
  factor. With the clock set 15 days past the last fetch, tools 1 to 5 return no computed
  phenotype and no recommendation text; at 14 days they still answer. With the FDA snapshot past
  `validThrough`, the FDA column is the stale notice and the CPIC column still answers. No
  shipped string contains `clinpgxlevel` or `pgxtesting` values. Every CPIC result carries the
  footer.
- **`pgx-diplotype-phenotype`.** CYP2C19 *1/*17 → Rapid; *17/*17 → Ultrarapid; *2/*17 →
  Intermediate; *2/*2 → Poor; *1/*9 → Likely Intermediate; *2/*9 → Likely Poor; *1/*12 →
  Indeterminate; *1/*43 → no function assigned, no phenotype. CYP2C9 *1/*2 → 1.5 IM; *2/*2 →
  1.0 IM; *1/*3 → 1.0 IM; *2/*3 → 0.5 PM; *3/*3 → 0 PM. CYP3A5 *1/*3 → IM; *3/*3 → PM. TPMT
  *3A/*8 → IM (the May 2026 change; a build on old data says Possible IM). NUDT15 *3/*5 → PM.
  UGT1A1 *1/*36 → NM; *28/*28 → PM; *1/*80 → Indeterminate. SLCO1B1 *1/*5 → Decreased Function;
  *5/*15 → Poor Function. NAT2 *4/*5 → Intermediate. G6PD one class IV and one class II allele →
  Variable; single class III allele → Deficient; class I with class II → Deficient (not "with
  CNSHA"). DPYD with three variants uses the two lowest. One allele blank → no answer.
- **`cyp2d6-activity-score`.** *1/*1 → 2.0 NM; *4/*10 → 0.25 IM; *1/*41 → 1.25 NM (1.5 if the
  build hard-coded the consensus paper); *4/*41 → 0.25 IM; *10/*10 → 0.5 IM; *1/*4 → 1.0 IM;
  *1x2/*10 → 2.25 NM; *1x2/*17 → 2.5 UM; *4x2/*4 → 0 PM; *1x≥3/*4 → "≥3.0" UM; *41x3/*4 → 0.75
  IM; *17x3 → refused; *1/*4 with unassigned duplication → both 2.0 NM and 1.0 IM; *1/*22 →
  Indeterminate.
- **`cyp2d6-phenoconversion`.** 2.0 with strong → 0 PM; 2.0 with moderate → 1.0 IM; 1.25 with
  moderate → 0.625, IM, "no score-keyed row"; 0 with any → 0 PM; 4.0 with moderate → 2.0 NM;
  weak → unchanged. Every result carries "Rule as stated in the CPIC opioid guideline (2021)"
  and the 2023 guideline's "have not been established" sentence. The adjusted score offers no
  link to a paroxetine or atomoxetine row.
- **`cpic-gene-drug`.** Abacavir, *57:01 positive → "Abacavir is not recommended", Strong.
  Codeine score 0.25 → Moderate label-dosing row; score 2.5 → avoid, Strong. Clopidogrel IM in
  ACS/PCI → avoid standard dose, Strong; the same phenotype under the neurovascular population
  returns that population's row (Moderate), and under cardiovascular non-ACS non-PCI returns No
  Recommendation. Tacrolimus NM, 0.2 mg/kg/day, 70 kg → 0.3 to 0.3 mg/kg/day (both ends capped;
  21 mg/day); 0.1 mg/kg/day → 0.15 to 0.2. Pantoprazole PM shows the CPIC 50% text beside FDA
  "No dosage adjustment is needed". Ondansetron → "guideline, no rows". Warfarin → refers to the
  live tools. Rosuvastatin with ABCG2 "No Result" matches the SLCO1B1-only row; rosuvastatin
  ABCG2 Poor with SLCO1B1 Decreased, 20 mg planned → over the ≤10 mg ceiling. Atorvastatin 80 mg
  planned, Poor Function → over the ≤20 mg ceiling. Simvastatin 20 mg, Decreased Function → over
  (the text is "<20mg/day"); lovastatin 20 mg → at. Fluvastatin CYP2C9 0.5 with SLCO1B1 Normal →
  ≤20 mg; CYP2C9 1.5 with SLCO1B1 Normal → ≤40 mg; CYP2C9 0.5 with SLCO1B1 Poor → alternative
  statin, no arithmetic. Sertraline CYP2C19 PM with CYP2B6 Normal → 0.5 ×; CYP2B6 PM with
  CYP2C19 Normal → 0.75 ×; both PM → no arithmetic. Oxcarbazepine offers two populations.
- **`pgx-panel-review`.** HLA-B *15:02 positive lists carbamazepine, oxcarbazepine, phenytoin,
  fosphenytoin and not abacavir. A normal result for every gene lists nothing. CSV round-trip.
- **`eliglustat-cyp2d6-dose`.** EM, nothing else → 84 mg twice daily. PM → 84 mg once daily. PM
  with a strong CYP3A inhibitor → contraindicated. IM with mild hepatic impairment →
  contraindicated. EM, mild impairment, weak CYP2D6 inhibitor → once daily. EM, mild impairment,
  moderate CYP2D6 inhibitor → contraindicated. EM, strong CYP2D6 and moderate CYP3A inhibitor →
  contraindicated. EM with severe renal impairment → no adjustment; EM with ESRD → avoid; IM with
  mild renal impairment → avoid. PM with a weak CYP3A inhibitor → "see section 7.1, Table 5"
  until the gate is cleared. Ultra-rapid → limitation of use, no dose. Indeterminate → no dose.
- **`siponimod-cyp2c9-dose`.** *2/*2 → 2 mg (not 1 mg: genotype, not phenotype). *1/*3 → 1 mg.
  *3/*3 → contraindicated. *1/*8 → label gives no dosage.
- **`pgx-label-dose-limit`.** Tetrabenazine PM 62.5 mg/day → over 50; single dose 37.5 → over
  25; EM 100 mg/day → at ceiling. Deutetrabenazine PM 36 → at; 42 → over. Pimozide child 20 kg
  PM 1.5 mg/day → over (0.075 mg/kg/day); adult PM 4 mg → at; increase at day 10 → too early.
  Aripiprazole usual 15 mg, PM → 7.5 mg; PM with a strong CYP3A4 inhibitor → 3.75 mg; adjunctive
  MDD → no adjustment. Iloperidone PM, schizophrenia, 8 mg twice daily → over the 3 to 6 mg
  twice daily dosage. Pitolisant PM adult 35.6 mg → over 17.8; child 30 kg 17.8 mg → over 8.9;
  child 45 kg 17.8 mg → at. Status "intermediate" for any row but tetrabenazine → no label
  adjustment stated. No pinned set id belongs to a repackager.
- **`opioid-cyp2d6-pediatric-check`.** Age 11, codeine → contraindicated regardless of genotype.
  Age 15 after tonsillectomy → contraindicated. Age 15, other pain, score 3.0 → not
  contraindicated by section 4; label section 5.6 "ultra-rapid metabolizers should not use" and
  CPIC avoid (Strong) both shown. Adult, score 0 → CPIC avoid for diminished analgesia; label
  states no action. Tramadol score 0.5 → label dosing, "consider non-codeine opioid", Optional.

## Build status

Not started. Specified October 10, 2026.
