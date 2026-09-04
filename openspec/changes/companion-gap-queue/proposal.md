# Change: seven verified catalog gaps, found by companion-gap, and what each one needs

> **UPDATED spec-v958: one of the seven was buildable and is now built.** This document
> originally said none of them was, because each needs a numeric table that is in its paper's
> figures rather than its abstract. That was true of the abstract and **false of the paper**.
> The VExUS derivation is open access (PMC7142196); its Fig. 1 caption holds all three severity
> definitions verbatim and its two worked patients pin Grade 1 and Grade 3. **Check PMC before
> calling a tile blocked.** `elink.fcgi?dbfrom=pubmed&db=pmc&linkname=pubmed_pmc` gives the PMC
> id when a paper is open access; `efetch.fcgi?db=pmc` gives the whole text, captions included.
>
> The other six were then checked the same way and are genuinely blocked — see the last section.
> The standing rule is unchanged: encoding a threshold from memory into a clinical tool is the
> defect spec-v941 through spec-v946 spent a program removing — 49 source links that resolved
> perfectly and opened the wrong paper, and twelve DOIs that looked real and did not exist.
> **Get the table, then build.**

## Why

The tile program's most reliable finder is the **companion gap**: the catalog holds one member
of a family a clinician thinks of together, and not the other. Sweeping ~100 widely-used
instruments against the search corpus and confirming each miss by regex found **seven** that are
genuinely absent while their siblings are built.

## The queue

| Absent | Its sibling, already built | Primary source |
| --- | --- | --- |
| ~~**VExUS** grading~~ — **BUILT, spec-v958** | `ivc-fluid-responsiveness` — the same vein, the opposite question | Beaubien-Souligny W, et al. *Ultrasound J.* 2020;12:16 (PMID 32270297, **PMC7142196, open access**) |
| **T-MACS** (troponin-only Manchester ACS) | `heart`, `edacs`, `timi`, `grace` | Body R, et al. *Emerg Med J.* 2017;34:517-523 (PMID 28363994); external validation *Emerg Med J.* 2020;37:223-228 (PMID 32047076) |
| **GARFIELD-AF** bleeding/stroke risk | `cha2ds2-vasc`, `has-bled`, `orbit-bleeding`, `atria-bleeding` | *Eur Heart J Qual Care Clin Outcomes.* 2022;8:214-227 (PMID 33892489) |
| **CRIB-II** (neonatal mortality) | `snappe-ii`, `pim3` | derivation not yet located; validations are plentiful (e.g. PMID 41543649) |
| **PRISM III** (paediatric ICU mortality) | `pim3`, `pelod2`, `psofa`, `phoenix-sepsis` | derivation not yet located; compared against PIM/PELOD in PMID 41918661 |
| **SOWS** (subjective opiate withdrawal, Handelsman 1987 — **still absent**; see the correction below) | `cows` — the clinician-rated half of the same pair | Handelsman L, et al. 1987; Dutch validation *Eur Addict Res.* 2007;13:81-88 (PMID 17356279) |
| **Kramer** dermal icterus zones | `bhutani-bilirubin`, `neo-phototherapy` | derivation not yet located |

## What each of the remaining six is blocked on, after checking PMC

| Tile | Open access? | Blocked on |
| --- | --- | --- |
| **T-MACS** | no (PMID 28363994 and its validation both closed) | the logistic model's coefficients |
| **GARFIELD-AF** | **yes**, PMC8888127 — and still blocked | the paper says only that *"the equations using the base hazard and coefficients provide predicted probabilities"* and points at an online risk tool. The coefficients are not in the article body. |
| **PRISM III** | no (PMID 8706448) | the point table and its age bands |
| **SOWS** | no (Handelsman 1987, PMID 3687892) | the 16-item list — and note the spec-v904 rule when it arrives: licensed questionnaire wording is stripped to neutral topic labels, because scoring is positional and never text-derived |
| **Kramer zones** | no (PMID 5817480) | the zone-to-bilirubin ranges, which are approximate in the source and should be presented as such |
| **CRIB-II** | derivation not located in PubMed at all | the 5-variable point table |

Open access is necessary and not sufficient: GARFIELD-AF is the case that proves it.

## What "unblocked" looks like

For each: the derivation paper's table or figure, transcribed, and **cross-verified against a
second source** per the spec-v97 rule — with the standing instruction that a disagreement
between sources is a reason to skip the tile, not to pick one.

## Not in scope

This proposes no code. It records seven verified absences with their sources so the next
session does not re-derive them, and states plainly why none was built.


## Correction, spec-v1061: two scales abbreviate to SOWS

This row names **Handelsman 1987's SUBJECTIVE Opiate Withdrawal Scale** — sixteen items, with a
companion observer scale, the OOWS. spec-v1061 built a *different* instrument that carries the same
acronym: **Gossop 1990's SHORT Opiate Withdrawal Scale**, ten items, 0–30.

That was not a substitution. Gossop's scale is sourced, named "Short" on its face, and cites Gossop —
but **this queue row is not closed by it.** Handelsman's SOWS and its OOWS companion are both still
absent from the catalog, and both are still blocked on the same thing this table records: the item
list, in a 1987 paper that is not open access.

The collision is worth recording on its own account. A reader or an agent asking for "SOWS" may mean
either scale, and their totals are not comparable — sixteen items against ten. The built tile says so
in its first sentence rather than in a footnote, and its synonyms deliberately do not claim the word
"subjective".

Six items remain on this queue, not five: T-MACS, GARFIELD-AF, CRIB-II, PRISM III, the Kramer zones,
and Handelsman's SOWS/OOWS pair.

## Correction, spec-v1061: T-MACS is blocked on less than this says

The table below says T-MACS needs "the logistic model's coefficients". **They are open access** —
PMC8499458 states the model outright:

> l = 1.713·x_e + 0.847·x_a + 0.607·x_r + 1.417·x_v + 2.058·x_s + 1.208·x_h + 0.089·x_t − 4.766

with x_e ECG ischaemia, x_a crescendo angina, x_r pain radiating to the right arm, x_v pain with
vomiting, x_s sweating observed, x_h hypotension, x_t high-sensitivity troponin T on arrival. The
four risk strata are stated in PMC10599640 (<0.02 very low, 0.02–<0.05 low, 0.05–<0.95 moderate,
≥0.95 high), and the equation paper corroborates the first of them in words ("<2% probability ...
'very low risk'").

**What blocks it now is one unit.** No source found states whether x_t is in ng/L, and at a
coefficient of 0.089 the choice moves the answer from "rule out" to "admit". Plausibility argues for
ng/L; plausibility is not a source, and this is a chest-pain rule-out. Not built, on purpose.

That is a smaller blocker than "the coefficients", and the next attempt should start from the
equation above rather than rediscover it.

## Correction, spec-v1067: Kramer dermal zones, and OOWS and CRIB-II

Three more rows re-examined with the sourcing technique that unblocked both SOWS scales (search PMC
full text for the instrument name plus a distinctive item, and read it out of a paper that USED it).
All three stay unbuilt, but each blocker is now smaller and named.

**Kramer dermal zones — blocked on the numeric ranges, not the zones.** The five zones are
corroborated in open access (PMC11884148): head and neck; upper trunk; lower trunk and thighs; arms
and lower legs; palms and soles, following Kramer's cephalocaudal progression. The bilirubin ranges
are the problem. PMC11118406 gives zone 1 4–6, zone 2 6–8, zone 3 8–12, zone 4 12–14, zone 5 above
15 mg/dL. Those contradict the figures that circulate elsewhere for the same zones (roughly 4–8,
5–12, 8–16, 11–18, above 15). One open-access source, contradicted, is exactly the spec-v97 skip
condition, and quoting a cutoff a second source disputes is the defect the threshold audit exists to
prevent.

Worth noting for whoever picks this up: the papers themselves say visual estimation correlates only
moderately with total serum bilirubin, and the correlation is "substantially lower in preterm and
dark skin tone neonates". A zone-only tile that returns the zone, refuses to give a number, and
states that limitation would encode a real documented misread — trusting a look at the skin instead
of measuring. That is an owner's call on whether it earns a tile, not a sourcing problem.

**OOWS — the scoring rule is now known; the sign list is not.** PMC7686602 states the method
outright: the scale "consists of 13 items describing withdrawal symptoms. For each symptom that was
present during a 5-minute period and fit the given criteria, 1 point was scored." So the structure
is a 0–13 count over a five-minute observation. Three PMC searches (the scale name with "13 items",
with mydriasis, and with gooseflesh plus rhinorrhoea) did not turn up a paper reproducing the
thirteen signs; only three of them are named anywhere found (yawning, mydriasis, restlessness).
Still blocked, on a shorter list than before.

**CRIB-II — the variables are corroborated; the point weights are not.** The derivation is Parry,
Tucker and Tarnow-Mordi, Lancet 2003 (PMID 12781540), and it is paywalled. Eighty-four PMC papers
use the score and the five variables agree across them — gestation, birth weight, sex, admission
temperature and base excess (PMC11672052 states all five) — but none reproduces the weighted table
that turns them into points, which is the whole calculator. Blocked on the table, not on the
variables.

## Correction, spec-v1072: PRISM III and GARFIELD-AF, and the shape all five blockers share

The last two unattempted rows, checked with the same technique. Both stay unbuilt, and both
blockers are now named precisely.

**PRISM III — the seventeen variables are corroborated; the point table is not.** PMC12705631 lists
all seventeen in one sentence (systolic blood pressure, heart rate, temperature, pupillary reflex,
mental status, acidosis, total CO2, pH, PaO2, PaCO2, glucose, potassium, creatinine, blood urea
nitrogen, white cell count, prothrombin time, platelets) and states that each is scored 1 to 10 by
severity. Three searches did not find a paper reproducing the age-banded thresholds and the points
they carry, which is the whole calculator.

**GARFIELD-AF — the derivation is open access and still not enough.** PMC8888127 (Fox and
colleagues, 2022) is the derivation, and Tables 2 and 3 give the hazard ratios for each component of
the mortality, stroke and bleeding models. What turns a linear predictor into an absolute two-year
probability is the **base hazard**, and the paper does not print it: it says the equations "using the
base hazard and coefficients provide predicted probabilities ... These same equations are used in an
online risk tool", with the values in supplementary material that the PMC record does not carry.
Hazard ratios alone give a ranking, not the percentage the tile would have to state.

**The shape all five share.** T-MACS, CRIB-II, OOWS, Kramer, PRISM III and GARFIELD-AF are each
blocked on ONE missing piece, and in every case it is the piece that turns a corroborated structure
into a number: a unit (T-MACS), a weight table (CRIB-II, PRISM III), a sign list (OOWS), a band table
whose sources disagree (Kramer), a base hazard (GARFIELD-AF). The variables, the item counts and the
strata are all findable in papers that USED the instrument. **What a citing paper reproduces is what
it needed to describe its own cohort, and that is never the arithmetic.** A build attempt that starts
by looking for the arithmetic will know within three searches whether it is possible.
