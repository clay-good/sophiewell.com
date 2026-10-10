# spec-v1628 — Pharmacy practice: shared machinery

**Status:** Proposed, October 10, 2026. Specs only; nothing here is built. No new tools.
**Charter:** [spec-v1627](spec-v1627.md). **Ledger:** [scope-pharmacy-practice.md](scope-pharmacy-practice.md).
**Builds on:** [spec-v1501](spec-v1501.md) (group Q, the data contract, the upload workbench, the clock engine).

Seven of this program's waves read FDA labels, three ship a dataset, and all of them lean on
numbers the reader must supply. This spec states each shared rule once so a wave spec can point
here and so two tools never date a label, word a result or source a constant in two different
ways. Build it before any wave.

## 1. The label-edition contract (route D of the data contract)

[spec-v1501](spec-v1501.md) §2 gives a changing number three routes: a fetched federal file (A),
a dated constant with a page watch (B), and reader input (C). An FDA label fits none of them: it
is prose, it changes without notice, and most of its new versions change nothing a tool reads.
This program adds a fourth route.

**D. Label row.** A value read from the Dosage and Administration (or another named) section of
one FDA label on DailyMed.

| Rule | Detail |
|---|---|
| Which label | The NDA or BLA holder's set id, never a repackager's or relabeler's. One drug has many set ids and they are not in step: on October 10, 2026 a search for one brand returned ten labels, with the holder's and a repackager's on different versions. Where no brand label is on DailyMed, pin one manufacturer of the generic and say so on the page. |
| What dates an edition | `(setId, spl_version)` plus the `published_date` from `https://dailymed.nlm.nih.gov/dailymed/services/v2/spls/{setid}/history.json`. **Not** the `effectiveTime` inside the label's XML, which was years older than the published version on labels read for [spec-v1632](spec-v1632.md). |
| What is stored per row | `drug`, `brand`, `setId`, `splVersion`, `publishedOn`, `verifiedOn`, `validThrough`, the section's LOINC code, a SHA-256 of that section's normalized text, and the rows read from it. |
| Weekly watch | A new `scripts/data/watch-dailymed.mjs`, run by the existing `data-refresh` workflow beside the page watch. For each row it reads `history.json`. Same version: done. Newer version: it fetches the label, extracts the stored section (Dosage and Administration is LOINC 34068-7, Contraindications 34070-3, How Supplied/Storage 34069-5), normalizes whitespace and hashes. |
| Hash unchanged | The text the tool reads did not change. The builder writes the new `splVersion`, `publishedOn` and `validThrough` and nothing else. No person. |
| Hash changed | The builder sets `supersededOn` on that row and writes one line in the refresh pull request ("section 2 of this label changed in version N: re-read these rows in this tool"). It never edits a dose. A person reads the new section. |
| Retired set id | A 404 or an empty history counts as a change. |
| Hard expiry | `validThrough` is 12 months after `verifiedOn`. The watch renews it weekly by re-confirming the hash, so the 12 months runs out only when the watch has stopped. |
| Fail closed | A row answers only while `supersededOn` is unset and today is on or before `validThrough`, read through `datedValue()`. Otherwise the tool shows, for that drug only, which version it was read from, that the label has since changed, and the DailyMed link. No dose. Other drugs in the same tool keep answering. |

**Tests.** Per dataset: every row has a set id, a version, a published date and a hash; no set id
belongs to a labeler named in `data/label-dose/repackagers.json` (a short deny list kept from the
research: the repackagers whose copies surfaced first in search). Per tool: the clock set past
`validThrough`, and `supersededOn` set, each render no dose text. The watch has a fixture pair of
two real versions of one label with an unchanged section 2 and a pair with a changed one.

**Verify at build.** The hash-unchanged path was reasoned from the service's shape; it was not run
across two real versions of one label. Run it on five labels with known section-2 history before
trusting it, and check how the service reports a label whose set id was replaced.

## 2. Where a constant may come from

Every number a tool uses is one of four kinds, and the tool page says which.

| Kind | Examples | Rule |
|---|---|---|
| Arithmetic identity | C1V1, alligation, proportion, mass balance | Stated as such with the algebra shown. Never cited to a textbook or to a USP chapter. |
| Read primary source | A CFR section, an FDA label row, a guideline table, a paper's coefficient | Cited to the section, set id or table, with the date read. Routes A, B or D. |
| Shipped open dataset | Atomic weights, CPIC tables, the NIOSH list (§3) | Only the datasets in §3. Each has a named license, an edition and an expiry. |
| Reader input | E-values, pKa, displacement factors, capsule volumes, HLB values, balance sensitivity, drops per mL, overfill, a site's calcium-phosphate limit, a state's stricter rule, a plan's threshold, a defined daily dose | The field starts **blank**. No default, no placeholder that looks like a value. The page names the kind of document that carries the number. |

A product-specific or substance-specific constant with no shippable primary table is always
reader input. A tool never ships a table copied from a compendium, and never ships a familiar
default because "everyone uses it" (the 20 drops per mL, the 6 mg balance sensitivity and the
120 mg minimum are USP text; the tool computes with whatever the reader enters).

## 3. Datasets this program ships

| Dataset | Source and license | Route | Used by |
|---|---|---|---|
| `data/label-dose/` | FDA labels on DailyMed (federal work) | D | [v1629](spec-v1629.md) (label anchors in `meq-mmol-mg`), [v1630](spec-v1630.md), [v1631](spec-v1631.md), [v1632](spec-v1632.md), [v1633](spec-v1633.md), [v1635](spec-v1635.md), [v1636](spec-v1636.md), [v1639](spec-v1639.md) |
| `data/atomic-weights/` | IUPAC CIAAW, *Abridged Standard Atomic Weights 2024* (118 values; facts, cited) | B, page watch on the CIAAW page | [v1629](spec-v1629.md) |
| `data/cpic/` | CPIC allele-function, diplotype-to-phenotype and recommendation tables (CC0); never PharmGKB or ClinPGx annotations (CC BY-SA) | A, pinned by a per-table hash, the newest change-log date and the data release tag (the API has no version field); expiry as set in [v1640](spec-v1640.md) | [v1640](spec-v1640.md), three tools in [v1635](spec-v1635.md) |
| `data/niosh-hazardous-drugs/` | NIOSH *List of Hazardous Drugs in Healthcare Settings, 2024* (federal work), with the AHFS classification column dropped | B, page watch on the NIOSH page | [v1630](spec-v1630.md) |
| Open instrument content | The CC BY drug lists and criteria named in [v1634](spec-v1634.md), each with its attribution line | B, pinned to the paper | [v1634](spec-v1634.md) |

**Amendment to route A.** [spec-v1501](spec-v1501.md) §2 describes route A as a machine-readable *federal* file. This program admits one non-federal file under the same rules: the CPIC tables, which are CC0 and published through a public API. Nothing else non-federal rides route A without its own row here.

Everything else in the program is a constant inside a library module with its citation, or
reader input. No wave adds a dataset without adding a row here and to `docs/data-sources.md`.

## 4. Where the tools live

| Group | What goes there in this program |
|---|---|
| Q, "Medication Access & Pharmacy" | Compounding and bench math, sterile and storage tools, federal pharmacy law, Part D and pharmacy finance, the community counter, department measurement, nuclear pharmacy, investigational drug service, pharmacogenomics |
| F, "Medication & Infusion" | Anything a pharmacist verifies at order entry: kinetics, label dose checks, conversions and titrations, label antidote dosing, chemotherapy dose checks |
| G, E, H, I, J, B | Only where a wave spec names it, beside a live neighbor (for example `kinetic-egfr` in E with the other renal estimates, the nursing-facility tools in H) |

Each wave spec states its tools' groups. The pharmacogenomic engine tools of [v1640](spec-v1640.md) sit in Q; the three oncology views of that engine in [v1635](spec-v1635.md) sit in F with the chemotherapy checks. Every tool is tagged `pharmacy` in `specialties` (the
tag exists in the closed vocabulary) plus the clinical specialty it serves. No new group is
needed. No new specialty tag is needed for the first build; `nuclear-pharmacy` and
`compounding` are proposed additions to the closed vocabulary, decided when
[v1635](spec-v1635.md) and [v1629](spec-v1629.md) are built, because adding a term changes the
coverage test.

**Findability.** A class tool (one tool over many drugs) must be reachable by every drug's
generic and brand name: each is a synonym in `data/synonyms.json` that opens the class tool
with the drug preselected. The test is per drug, in both the page search and `find_calculator`.
A tool name that starts with a common word must not steal an acronym search
(`acronym-findable.test.js`).

## 5. Output posture: the tool computes, the source decides

These rules bind every tool in the program. They are the reason a patient-facing tool can sit
beside a pharmacist's.

1. **Report, never recommend.** The result is the source's row, close to verbatim, then the
   source. "The label gives 15 mg once daily for this clearance and indication." Never "give",
   "reduce to", "safe" or "appropriate" in the tool's own voice.
2. **Name the edition.** A label result ends with the brand, set id, version and published date
   and a link. A rule result ends with the section and the date it was read. A guideline result
   ends with the guideline and its year.
3. **No fallback to a neighbor.** When the source gives no number for the input ("dosing
   recommendations cannot be provided", "has not been established"), the tool says exactly that.
   It does not answer from the nearest band.
4. **Boundaries follow the source's wording.** The dataset records which side of each band is
   inclusive. Where a source's bands overlap, leave a gap or leave a boundary undefined, the tool
   prints both neighboring rows and says the source does not settle the value.
5. **One-way stays one-way.** A conversion table a label calls one-directional has no reverse
   mode. The tool says why.
6. **Two sources that disagree are shown side by side**, each labeled (a label and a federal
   regulation, a label and CDC, a label and CPIC). The tool does not pick.
7. **A blank required field gives no result.** No default weight, clearance, indication, date or
   constant. A partly filled form says what is missing.
8. **Federal floor.** A tool built on a federal rule says a state rule can be stricter and takes
   the state's value as reader input where one commonly exists. No tool ships a state table.
9. **A lookup miss is not a negative.** A drug not found on a list (hazardous drugs, a gene-drug
   table) returns "not on this edition of this list", with the list's stated coverage, never "not
   hazardous" or "no interaction".
10. **Clinical tools carry the standard clinical note; administrative tools carry the
    administrative one** (`clinical: true` or `false` in the catalog entry), as today.

## 6. Licensing screen additions

Added to the table in [spec-v1501](spec-v1501.md) §6. Each row was settled by the research
recorded in the ledger.

| Material | Ship? | How it is used |
|---|---|---|
| FDA labels (DailyMed SPL), OTC monographs, FDA guidances, Federal Register, CFR, U.S. Code | Yes | Rows and rules, cited to set id and version or to section |
| CDC, NIOSH, NRC, DEA, CMS, AHRQ, NIST, NCI documents | Yes | Rules and numbers, cited. NIOSH's list ships without its AHFS column |
| CPIC guidelines and tables | Yes (CC0) | Pinned tables and recommendation text, with CPIC's classification of strength |
| PharmGKB / ClinPGx annotations, DPWG text | No (CC BY-SA, or terms as recorded in [v1640](spec-v1640.md)) | Not mixed into the CPIC dataset |
| USP chapter text and defaults (795, 797, 800, 1160, 1176, 1079.2) | No | The arithmetic ships; USP's numbers are reader input unless USP's own free fact sheet or a federal document states them |
| ASPEN, ASHP, CHEST, ACC/AHA, ASAM and other society guidelines in copyrighted journals | Facts only | A number with attribution. No tables or recommendation text reproduced |
| CC BY instruments and drug lists | Yes, with the attribution line | Item content may ship |
| CC BY-NC-ND instruments | Facts only | Point values and thresholds with attribution; wording is the site's own |
| NCC MERP index | Verbatim only | Its terms allow reproduction when the text is unmodified and the notice is kept; a paraphrase is the violation |
| Instruments that need a license (Morisky scales, ARMS, MRCI, MARS-5, Hill-Bone, BMQ) | No | Rejected |
| ISMP lists, Lexicomp, Micromedex, Clinical Pharmacology, NeoFax, Harriet Lane, Sanford, AHFS | No | Never a source |
| WHO ATC/DDD values | No | The method is public and ships; each defined daily dose is reader input |
| GS1 General Specifications | Rules only | The parser implements the published structure; no GS1 text ships |
| NCPDP standards, PQA measure text | No (unchanged) | Methods via CMS documents only |
| IUPAC CIAAW atomic weights | Yes | Facts, cited with the edition |

## 7. Tools that patients use

[v1639](spec-v1639.md) and parts of [v1633](spec-v1633.md) are opened by patients and caregivers.
For a tool whose catalog entry lists `patients` in `audiences`:

- It reports a label's or monograph's figure for the facts entered and stops. It never derives a
  dose from a rule of thumb, an adult dose, or another product's label.
- It computes nothing where the current label says "do not use" or "ask a doctor" for the age or
  weight entered. It prints that sentence.
- Every result names the product whose label it read, because two products with one ingredient
  can carry different directions.
- Copy passes the plain-language and live-region rules the catalog already enforces.

## Tests

- Route D: the dataset shape test, the two fail-closed negatives and the watch fixtures in §1.
- Reader input: every field §2 names as reader input is empty on a fresh page, and its tool
  returns no result while it is empty (the empty-form sweep, with no ledger exception).
- Posture: a lint over this program's result strings rejects "give ", "reduce to", "is safe" and
  "appropriate" at the start of a result clause; one-way tools expose no reverse mode in the page
  or in the agent schema.
- Findability: the per-drug synonym test in §4.

## Build status

Not started. Specified October 10, 2026.
