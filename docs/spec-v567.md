# spec-v567.md — IGCCCG prognostic classification tile

> Status: **SHIPPED (2026-07-28).** Builds the `igcccg` tile. Catalog **1416 → 1417**, group G.

## Why

`igcccg` was zero-hit, and `grep -c "id: 'igcccg'" app.js` returned 0.

## What it does

**Nonseminoma**

| Group | Criteria |
| --- | --- |
| Good | Testis/retroperitoneal primary **AND** no nonpulmonary visceral mets **AND** AFP <1,000 ng/mL **AND** hCG <5,000 IU/L **AND** LDH <1.5× normal |
| Intermediate | Same primary/mets picture **AND any one of** AFP 1,000-10,000, hCG 5,000-50,000, LDH 1.5 to <10× normal |
| Poor | Mediastinal primary **OR** nonpulmonary visceral mets **OR any one of** AFP >10,000, hCG >50,000, LDH ≥10× normal |

**Seminoma** — any primary site, AFP must be normal, hCG and LDH ignored entirely. Good = no nonpulmonary
visceral metastases; intermediate = present. **There is no poor group.**

## The four rules a plausible implementation breaks

**1. Seminoma has no poor-prognosis category — the sixth cell does not exist.** The source says so outright.
A 3×2 table invites filling the gap, and falling through to "poor" would invent a category the
classification refuses to contain. A test sweeps every seminoma input path asserting none reaches poor.

**2. The table mixes all-of and any-of.** Good requires **every** criterion; intermediate and poor need
**any one**. Reading it in a single direction misclassifies both ways — tests pin each direction.

**3. In seminoma the AFP is a gate, not a graded marker.** A raised AFP does not make a seminoma
higher-risk: by definition the tumor is a **nonseminoma**. The lib returns `reclassifyAsNonseminoma: true`
rather than a group. A test also asserts a mediastinal primary does not demote a seminoma, since seminoma
permits any primary site.

**4. Units matter, and one is a documented typo.** hCG is in **IU/L**; a widely used secondary source prints
IU/mL in two rows while quoting the same numbers — reading it that way is wrong by a factor of a thousand.
LDH is a **multiple** of the local upper limit of normal, not an absolute value.

## Three disclosures

**Marker timing.** Values must be **post-orchiectomy, pre-chemotherapy**. A dedicated study exists showing
pre-orchiectomy markers mis-assign the risk group, because markers fall once the primary is removed.

**Two survival vintages, identical definitions.** The 1997 original and the 2021 update classify patients
the same way and differ only in outcomes — poor-risk nonseminoma moved from **48% to 71%**. Both are
reported, labeled, rather than one being picked.

**An LDH of exactly 10× normal.** The printed wording makes intermediate "1.5 to <10" and poor ">10", which
would leave exactly 10 in no group. The lib assigns ≥10 to poor so the bands stay exhaustive, and discloses
that **at** that value.

**A resolved divergence:** one secondary table lists "testis/retroperitoneal" for the seminoma intermediate
row, while the original and an independent source both say *any* primary site. Two sources against one, the
original among them — any primary site is used.

## Scope (spec-v11 §5.3)

Assigns a **prognostic group** for **metastatic** disease, and the groups map onto very different
chemotherapy intensities in practice. It does **not** diagnose germ cell cancer, does not establish that
disease is metastatic, and does not distinguish seminoma from nonseminoma — a pathologic and serologic
determination taken here as an input. It does not select a regimen or number of cycles, and does not apply
to stage I disease, relapsed or refractory disease, or non-germ-cell tumors.

## Files

- `lib/igcccg-v567.js` — `igcccg()`, `HISTOLOGIES`, `PRIMARY_SITES`, `SURVIVAL`, marker thresholds.
- `views/group-v567.js` (RV567) — histology first (it gates everything), then the nonseminoma and seminoma
  sections under separate **h2** headings.
- `mcp/adapters/igcccg-v567.js` — wave 392.
- `test/unit/igcccg.test.js` — 21 tests.
- `docs/spec-v567.md` (this file).

## Sourcing (spec-v97)

- International Germ Cell Cancer Collaborative Group. *J Clin Oncol.* 1997;15(2):594-603.
- Gillessen S, et al. IGCCCG Update Consortium. *J Clin Oncol.* 2021;39(14):1563-1574 — updated outcomes,
  group definitions unchanged.
