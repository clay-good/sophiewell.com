# spec-v547.md — BRUE lower-risk criteria tile

> Status: **SHIPPED (2026-07-28).** Builds the `brue` tile — the AAP seven lower-risk criteria for a Brief
> Resolved Unexplained Event. Catalog **1396 → 1397**, group G.

## Why

`brue`, `tieder`, `apparent life threatening`, and `alte` were all zero-hit.

**A different presenting complaint from the existing febrile-infant rules.** Rochester, Philadelphia, Boston
and Step-by-Step all stratify a **fever**. BRUE stratifies an apneic or color-change event in an infant who
is **afebrile and well-appearing** by the time they are seen. Reaching for a febrile-infant rule here applies
a tool to a patient it was never derived in.

## What it does

**A BRUE** is a sudden, brief, **now resolved** episode in an infant **under 1 year** of ≥1 of: cyanosis or
pallor; absent, decreased, or irregular breathing; marked change in tone; altered level of responsiveness —
**with no explanation identified** after an appropriate history and physical examination.

### BRUE is a diagnosis of exclusion, and the tile enforces that order

The event only qualifies if no explanation is found. If the history or exam explains it — reflux, a
respiratory infection, a seizure, an airway anomaly, injury — then it is *that* diagnosis and the lower-risk
criteria do not apply. The tile asks this **first** and stops if the answer is no, returning
`lowerRisk: null` — deliberately **null rather than false**, because an event that was never a BRUE has not
been stratified, and "not lower-risk" would wrongly imply higher-risk. The renderer hides the seven criteria
in that case.

### The seven criteria are conjunctive: all must be met

1. Age **over 60 days**
2. **Gestational age ≥32 weeks AND postconceptional age ≥45 weeks**
3. Only **one** BRUE — no prior event, none in clusters
4. Duration **under 1 minute**
5. **No CPR** by a trained medical provider required
6. **No concerning historical features**
7. **No concerning physical examination findings**

Failing **any one** makes the infant higher-risk by definition. There is **no score and no partial credit** —
so the tile returns a binary verdict plus **the list of criteria not met**, because "higher-risk" without
saying which criterion failed is far less useful at the bedside. A test walks all seven single-failure cases.

**Criterion 2 states its inequality explicitly**, because published renderings diverge: three reproductions
give "or more", two give "over". The tile uses **at or above**, matching the guideline's own rationale — risk
is attributed to birth **below** 32 weeks and attenuates **once** 45 weeks postconceptional age is reached.
An infant born at exactly 32w0d is precisely where the renderings disagree, so the threshold is spelled out
rather than left to a symbol.

- `lib/brue-v547.js` — pure gate + criteria → verdict with `failed`/`failedText`. Exports
  `BRUE_EVENT_FEATURES` and `BRUE_LOWER_RISK_CRITERIA`.
- `views/group-v547.js` (RV547) — the gate plus seven yes/no selects under two **h2** headings; the criteria
  are hidden when the event is not a BRUE.
- `lib/meta.js` — Tieder and colleagues 2016 citation + accessed date + bands. No citation-staleness row
  (`AAP` appears in the author list, not as the citation's issuer acronym).
- 11 worked-example unit tests + fuzz registration; synonym entry; corpus → 1397.

**HIGH-STAKES, and the asymmetry is the whole point:** **"lower-risk" is not "no risk", and it is not a
discharge order.** The classification exists to identify infants in whom extensive testing and admission are
unlikely to help, so they can be *spared* them — it does not establish that nothing is wrong, and shared
decision-making with the family is part of the guideline rather than an optional extra. **"Higher-risk" is
not a diagnosis and not an admission order**; it means the lower-risk pathway does not apply and the infant
needs individualized assessment. The tile does not diagnose a cause, does not recommend or exclude any
investigation, and **cannot detect** the concerning historical or examination features that criteria 6 and 7
turn on — those are clinical judgments it takes as given ([spec-v11](spec-v11.md) §5.3). **Child abuse** is
among the causes an appropriate history and examination must consider.

## Duplicate check

Per the procedure in [spec-v508](spec-v508.md): the acronym (`brue`), the former name (`apparent life
threatening`, `alte`), the first author (`tieder`), and the neighboring febrile-infant rule (`rochester`) —
each against **both** `corpus.json` and `app.js` (and `lib/meta.js`), plus a `test/unit/` scan. Only
`rochester` is non-zero, and it is the febrile-infant tile addressed above.

## Sourcing (spec-v97)

- **Citation:** Tieder JS, Bonkowsky JL, Etzel RA, et al; Subcommittee on Apparent Life Threatening Events.
  *Pediatrics.* 2016;137(5):e20160590.
- The AAP's own site returned 403 on every attempt, so the primary PDF could not be fetched. Every element —
  the definition, the four qualifying features, and all seven criteria — was confirmed across **five
  independent reproductions** that agree. That limitation is recorded here rather than implied.

## Verification

Lint (all catalog-truth surfaces at 1397), unit suite (+11 + fuzz), a11y, build, and the chromium
heading-level check — all green.

## Out of scope

The tile does not diagnose the cause of an event, recommend or exclude investigations, assess for child
abuse, apply the older ALTE framework, or stratify a febrile infant. The MCP adapter + golden-probe promotion
ship in the same wave (372).
