# spec-v828 — 2017 Consensus Criteria (Cystic Fibrosis)

## What this gives you

Enter the entry route, the sweat chloride and the CFTR genetics; get whether the 2017 Cystic
Fibrosis Foundation criteria are met, and what an intermediate value means.

## §1 A diagnosis needs both halves

**An entry route** — a positive newborn screen, clinical features consistent with CF, or a
sibling with CF.

**AND evidence of CFTR dysfunction** — a sweat chloride ≥60 mmol/L, or two CF-causing CFTR
variants in trans.

| Sweat chloride | |
|---|---|
| **≥60 mmol/L** | consistent with CF |
| **30–59 mmol/L** | intermediate — CFTR genetic analysis needed |
| **<30 mmol/L** | CF unlikely |

## §2 The threshold moved in 2017 — down, and across all ages

The intermediate band used to begin at **40 mmol/L** for anyone over six months. It now
begins at **30** for everyone.

A sweat chloride of 35 in a nine-month-old was *normal* under the older reading and is
*intermediate* now — and the difference is CFTR analysis and continued follow-up rather than
reassurance and discharge. Infants left intermediate after newborn screening are designated
CRMS / CFSPID and followed, not discharged as negative.

So the tile asks for age even though age no longer changes the threshold. That is exactly the
point: it can only say "this used to depend on your age and no longer does" where a value
falls in the 30–39 range the two readings disagree about. At 40 and above, and below 30, the
readings agree and the tile stays quiet. Tested in all three ranges.

## §3 A sweat chloride alone is not a diagnosis

Without an entry route, a raised sweat chloride does not make CF by these criteria. A tool
reporting "consistent with CF" on a number alone skips the half of the definition that says
who should have been tested — so when CFTR dysfunction is present and no route is, the tile
says so by name rather than returning a bare "not met".

## §4 Sourcing (spec-v97 gate)

- Farrell PM, White TB, Ren CL, et al. Diagnosis of Cystic Fibrosis: Consensus Guidelines
  from the Cystic Fibrosis Foundation. *J Pediatr.* 2017;181S:S4-S15.e1.
- The three bands and the 40→30 change were corroborated independently (PMC5760465) before
  encoding.

## §5 Posture

Decision support, not a verdict. It applies published criteria to results already obtained.
It does not order the sweat test or the genetic panel, and it does not start any therapy.

Catalog 1619 → 1620.
