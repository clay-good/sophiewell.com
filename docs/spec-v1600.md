# spec-v1600 — Public utility: the patient, the plan sponsor and the published rules: charter

**Status:** Proposed, September 29, 2026. Specs only; nothing here is built.
**Program ledger:** [scope-public-utility.md](scope-public-utility.md) (the gap finder, the
research record, the count, and what was rejected).
**Specs:** spec-v1600 (this charter) through spec-v1605.
**Builds on:** the medication-access program ([spec-v1500](spec-v1500.md) through
[spec-v1517](spec-v1517.md)): its admission rules, data contract, upload workbench,
document builder and licensing screen all apply here unchanged.

## What this does for the reader

The US system runs on published rules that almost nobody can check: which preventive care
a plan must cover at $0, whether a Medicare Advantage denial used criteria the regulation
allows, what an insurer actually pays a hospital, and whether a bill matches the price the
hospital itself posted. The rules are public. The data is increasingly public too: insurer
and hospital price files since 2021 and 2024, prior-authorization statistics since March
31, 2026, and patient-access APIs that must carry prior-authorization decisions from
January 1, 2027. What is missing is a neutral, free tool that puts the rule next to the
data and does the arithmetic.

Today that arithmetic is sold back to the people it concerns, by bill negotiators who take
a share of the savings, benefit consultants paid by the vendors they review, and prior-
authorization software paid by both sides. This program makes the same checks free, local
and cited, for the three readers with the least information:

| Reader | The question they can't answer today | Spec |
|---|---|---|
| A patient, or whoever helps them | "Should I have paid anything for this screening?" "Is this bill above the hospital's own posted price?" | [v1601](spec-v1601.md), [v1602](spec-v1602.md) |
| A clinician's office | "Was the criterion used to deny this lawful for a Medicare Advantage plan?" "What changed in this payer's policy?" | [v1603](spec-v1603.md) |
| A small employer, union fund or benefits committee that pays its own claims | "What are we paying as a percent of Medicare, and where?" "Is this arrangement safe for our HSA plan?" | [v1604](spec-v1604.md) |

## Why the catalog, and not a new product

Each check is a rule, a date or a join between two public files. That is the catalog's
shape: a deterministic tool, a named primary source, no account, no network, no model.
A separate product would need a server, which means a place where patient bills or plan
claims collect, which means a security budget, a business model and, eventually, a reason
to charge. Keeping the work inside a static site that never receives the data is what lets
it stay free for decades. About 32,000 people used the site in the two months before
this charter, and the readers this program serves are already among them.

## Two rules added to the six

Every tool passes the six admission rules of [spec-v1500](spec-v1500.md). This program adds
two, and a tool that fails either one is rejected even if it passes the six.

7. **It serves the side with less information.** The tool must be useful to the patient,
   the practice or the plan sponsor on its own. A check that only makes a payer's or
   vendor's existing process faster, and gives the other side nothing, belongs elsewhere.
   (Payer-side validators such as `pas-bundle-check` stay welcome where they help both
   ends meet a federal standard.)
8. **It never becomes an intermediary.** No tool asks the reader to send data anywhere,
   holds a list of payers' live endpoints, or produces a score that someone else would
   need to buy access to. The reader's files are read in the browser, and every output is
   something the reader can hand to anyone.

## What the program will not do

| Out | Why |
|---|---|
| Connect to a payer's patient-access API from the page | No network ([spec-v50](spec-v50.md) §3), and each payer requires its own app registration, which makes the site an intermediary (rule 8). The reader exports a file from an app of their choice and opens it here ([spec-v1602](spec-v1602.md)). |
| Grade or rank insurers with a single score | A composite is a model with hidden weights. The tools show each published metric beside the rule and the market figures, and the reader draws the conclusion ([spec-v1603](spec-v1603.md)). |
| Decide whether a denial was medically right | Judgment over the chart. The tools check the *process* rules a regulation sets (which criteria may be used, who must review, how long approvals last), never the clinical merits. |
| Coach habits, diet or sobriety | Real, and outside what software can do well. The structural levers inside this catalog's reach are the ones that make prevention cost nothing at the point of care ([spec-v1601](spec-v1601.md)) and put primary care within reach of an HSA plan ([spec-v1604](spec-v1604.md)). |
| A vaccine schedule tool | [spec-v5](spec-v5.md) §6 excludes annually shifting schedules, and the federal schedule has changed repeatedly since 2025. Whether a vaccine is on the schedule is reader input where a tool needs it. |
| Scrape payer policy sites or collect filed bills | Live, unstable, and it would make the site a collector. The reader pastes or opens what they have. |

## The queue

| Spec | Wave | New tools | Backfills |
|---|---|---|---|
| [v1601](spec-v1601.md) | Preventive care owed at $0 | 3 | |
| [v1602](spec-v1602.md) | Reading your own claims and bills | 3 | |
| [v1603](spec-v1603.md) | Coverage rules and the payer's own numbers | 3 | `medicare-ffs-pa-required` |
| [v1604](spec-v1604.md) | Employer plans that pay their own claims | 5 | |
| [v1605](spec-v1605.md) | Data, refresh and open exports | 0 | |
| | **Total** | **14** | **1** |

The program is small on purpose. Each tool sits on a public file or a regulation that
became checkable only in the last few years, and each one removes a paid step between a
reader and a rule.

**Build order.** [v1601](spec-v1601.md) first: it has the widest audience, needs one
dataset, and gives [v1602](spec-v1602.md) its preventive-claim check. Then v1603's
`ma-criteria-check` (rules only, no data), then v1602 and v1604, which reuse the price-file
streaming parser already built for `hpt-file-check`.

## Acceptance for the whole program

- Everything in [spec-v1500](spec-v1500.md) "Acceptance for the whole program" applies.
- Each spec's "Built" section records, per tool, which reader it serves (rule 7) and
  confirms no file leaves the browser (rule 8), with the network-denied test that proves it.
- Each tool that reads a reader's file hands off to the live tool that finishes the job
  (for example, a preventive claim with cost share opens `preventive-cost-share-check`
  pre-filled) instead of re-implementing it.
