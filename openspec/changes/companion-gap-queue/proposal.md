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
| **SOWS** (subjective opiate withdrawal) | `cows` — the clinician-rated half of the same pair | Handelsman L, et al. 1987; Dutch validation *Eur Addict Res.* 2007;13:81-88 (PMID 17356279) |
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
