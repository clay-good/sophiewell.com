# spec-v511.md — CRAFFT (adolescent substance-use screen) tile

> Status: **SHIPPED (2026-07-27).** Builds the `crafft` tile — the six-item adolescent substance-use screen,
> total 0-6, positive at 2. Catalog **1360 → 1361**, group G.

## Why

The catalog already carries the **adult** substance screens — CAGE, AUDIT, DAST — but `crafft` was zero-hit
across `corpus.json` and `app.js`. CRAFFT is the one validated for adolescents, and it is the screen a
pediatric, school-based, or urgent-care clinician actually reaches for, so the age band the existing tiles do
not cover was the whole gap.

## What it does

Six yes/no questions, one point each, total 0-6; **2 or more** is the validated positive cut point. The
letters are the mnemonic: **C**ar, **R**elax, **A**lone, **F**orget, **F**amily or friends, **T**rouble.

- `lib/crafft-v511.js` — pure answers → total. Exports `CRAFFT_ITEMS` (each question with its mnemonic
  letter) so the renderer and the tests share one source of wording. Accepts `yes`/`no`, booleans, and 0/1;
  rejects a missing answer and anything it cannot read as a yes or a no.
- `views/group-v511.js` (RV511) — six selects (dom `cf-q1` … `cf-q6`), each with a real `<label for>`;
  surfaces the lib's validation message rather than a half-result.
- `lib/meta.js` — Knight and colleagues 1999 citation + accessed date + grouped bands. No citation-staleness
  row (a named-author article, no guideline-issuer acronym).
- 7 worked-example unit tests + fuzz registration; synonym entry; corpus → 1361.

**HIGH-STAKES:** it is a **screen**, not a diagnosis ([spec-v11](spec-v11.md) §5.3). A positive score means
further assessment is indicated, not that a substance use disorder is present; a negative score does not
exclude one. Two things the copy states rather than leaves implicit:

- The **CAR** question asks about riding with an impaired driver. That is a risk worth addressing whatever
  the total is, and a total below 2 must not read as permission to skip it.
- The score is **not** an indication for drug testing, for a treatment referral, or for disclosure to a parent
  or guardian. Adolescent confidentiality rules vary by jurisdiction and a screening score does not decide
  them.

## Duplicate check

Per the procedure in [spec-v508](spec-v508.md): the acronym (`crafft`), the concept words (`adolescent
substance use`, `teen substance`), and the neighbouring instruments (`cage`, `audit`, `dast`, `asrs`,
`crafft`) — each against **both** `corpus.json` and `app.js`; plus a `test/unit/` and `lib/` scan. The adult
screens exist and are different instruments with different items and different cut points; nothing covers the
adolescent one.

## Sourcing (spec-v97)

- **Citation:** Knight JR, Shrier LA, Bravender TD, Farrell M, Vander Bilt J, Shaffer HJ. A new brief screen
  for adolescent substance abuse. *Arch Pediatr Adolesc Med.* 1999;153(6):591-596.
- Cross-verified against adolescent-medicine references reproducing the same six questions, one point each,
  and the same positive cut point of 2.

## Verification

Lint (all catalog-truth surfaces at 1361), unit suite (+7 + fuzz), a11y, build — all green.

## Out of scope

The tile does not administer the CRAFFT part A frequency questions that decide whether the full six are asked,
score the CRAFFT-N+ nicotine items, or produce a brief-intervention script. The MCP adapter + golden-probe
promotion follow in the next wave (336).
