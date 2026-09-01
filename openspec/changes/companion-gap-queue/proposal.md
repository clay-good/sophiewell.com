# Change: seven verified catalog gaps, found by companion-gap, and what each one needs

> **NONE OF THESE IS BUILDABLE FROM THIS DOCUMENT.** Every one names a primary source and a
> numeric table that is in the paper's figures rather than its abstract. Encoding a threshold
> from memory into a clinical tool is the defect spec-v941 through spec-v946 spent a whole
> program removing — 49 source links that resolved perfectly and opened the wrong paper, and
> twelve DOIs that looked real and did not exist. **Get the table, then build.**

## Why

The tile program's most reliable finder is the **companion gap**: the catalog holds one member
of a family a clinician thinks of together, and not the other. Sweeping ~100 widely-used
instruments against the search corpus and confirming each miss by regex found **seven** that are
genuinely absent while their siblings are built.

## The queue

| Absent | Its sibling, already built | Primary source |
| --- | --- | --- |
| **VExUS** grading (venous congestion) | `ivc-fluid-responsiveness` — the same vein, the opposite question | Beaubien-Souligny W, et al. *Ultrasound J.* 2020;12:16 (PMID 32270297) |
| **T-MACS** (troponin-only Manchester ACS) | `heart`, `edacs`, `timi`, `grace` | Body R, et al. *Emerg Med J.* 2017;34:517-523 (PMID 28363994); external validation *Emerg Med J.* 2020;37:223-228 (PMID 32047076) |
| **GARFIELD-AF** bleeding/stroke risk | `cha2ds2-vasc`, `has-bled`, `orbit-bleeding`, `atria-bleeding` | *Eur Heart J Qual Care Clin Outcomes.* 2022;8:214-227 (PMID 33892489) |
| **CRIB-II** (neonatal mortality) | `snappe-ii`, `pim3` | derivation not yet located; validations are plentiful (e.g. PMID 41543649) |
| **PRISM III** (paediatric ICU mortality) | `pim3`, `pelod2`, `psofa`, `phoenix-sepsis` | derivation not yet located; compared against PIM/PELOD in PMID 41918661 |
| **SOWS** (subjective opiate withdrawal) | `cows` — the clinician-rated half of the same pair | Handelsman L, et al. 1987; Dutch validation *Eur Addict Res.* 2007;13:81-88 (PMID 17356279) |
| **Kramer** dermal icterus zones | `bhutani-bilirubin`, `neo-phototherapy` | derivation not yet located |

## What each one is blocked on

**VExUS** is the closest to ready and the clearest illustration of the rule. Its abstract
confirms the instrument, the three Doppler sites (hepatic, portal, intrarenal), the **IVC ≥ 2 cm**
dilation threshold, and that severe congestion means *severe flow abnormalities in multiple
Doppler patterns with a dilated IVC*. It does **not** state the grade 0/1/2/3 boundaries, nor
what makes each individual waveform "severe". Both live in the paper's figures. A tile built
without them would be a plausible-looking grader that no one had checked.

**T-MACS** and **GARFIELD-AF** are logistic models: they need their coefficients, not a
description. **CRIB-II** and **PRISM III** need their point tables and age bands. **SOWS** needs
its item list — and note the spec-v904 rule when it arrives: licensed questionnaire wording is
stripped to neutral topic labels, because scoring is positional and never text-derived.
**Kramer** needs the zone-to-bilirubin ranges, which are approximate in the source and should be
presented as such.

## What "unblocked" looks like

For each: the derivation paper's table or figure, transcribed, and **cross-verified against a
second source** per the spec-v97 rule — with the standing instruction that a disagreement
between sources is a reason to skip the tile, not to pick one.

## Not in scope

This proposes no code. It records seven verified absences with their sources so the next
session does not re-derive them, and states plainly why none was built.
