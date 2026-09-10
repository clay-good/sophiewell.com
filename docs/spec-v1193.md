# spec-v1193 — exempted by prose that was written before the gap existed

[spec-v1192](spec-v1192.md) closed by naming a hole rather than fixing it.
`probe-half-guarded.mjs` had printed `hiv-pep-occupational` as **guarded** for a
missing source status, and it was not guarded at all. The exemption came from the
tile's own option label:

> source unknown status, or **the source cannot be** identified

`cannot be` is in `ASKING` for the range refusals — "age cannot be negative" —
and it matched a sentence that refuses nothing.

## Why the phrase was the wrong thing to fix

The obvious repair is to tighten `cannot be`, and the evidence says no. Nine
tiles refuse an empty form with the house's monotone phrasing —

> each unrated item can only add points, so the low-risk reading **cannot be**
> given yet

— so the phrase earns its place, and `cannot be <verb>` runs to a seventy-row
tail across `lib/`. An allow-list of verbs is the drift this repo keeps paying
for ([[project_duplicated_rule_drift]] is the ledger of it).

## The discriminator is movement, not vocabulary

Drop one field from the worked example, and compare each string of the reading
against the same reading with nothing dropped. **A string identical in both
cannot be a statement about the field that was dropped** — it was written before
anyone left anything out. Only text that *changed* can be asking or disclosing
about this gap.

`scripts/probe-static-exemption.mjs` is that finder. It asserts nothing and does
not run in CI.

```
1682 calculators have a worked example that computes;
497 dropped-field readings are exempted by the vocabulary at all,
and 17 of those are exempted only by text that was already there.
```

Seventeen rows across twelve calculators, and the exemptions read like typos once
they are printed beside the phrase that granted them:

| tile | exempted by | the text it matched |
|---|---|---|
| `gadolinium-nsf` | `blank` | "The **blank**et rule that gadolinium is contraindicated…" |
| `marsi` | `choose ` | "it does not **choose** an adhesive" |
| `narcolepsy-criteria` | `select ` | "it does not **select** treatment" |
| `lyme-two-tier` | `measure ` | "Serology does not **measure** treatment response" |
| `cauti-nhsn` | `must be ` | "**must be** either still in place on the date of event" |
| `polyp-surveillance` | `complete ` | "presumes a **complete** examination to the cecum" |
| `atrial-enlargement` | `does not rule` | "a normal P wave **does not rule** enlargement out" |

Not one is a refusal. Five sweeps had been reading these tiles as ones that ask.

## What they were hiding

Six of the twelve answer from a blank. Three are shipped here, and they share a
code shape with [spec-v1192](spec-v1192.md)'s pair — a copy-pasted helper

```js
const oneOf = (list, v, fallback) => (list.some((i) => i.value === v) ? v : fallback);
```

whose third argument is a level nobody chose:

| | fallback | what that row means | what the tile published |
|---|---|---|---|
| `polyp-surveillance` | `HISTOLOGY → 'none'` | "No polyps found" | **Next colonoscopy in 10 years, on a normal examination** |
| `gadolinium-nsf` | `RENAL_STATES → 'normal'` | "stable kidney function at an eGFR of 30 or above" | **No heightened concern** |
| `periop-bridging` | `AGENTS → 'doac'` | "A direct oral anticoagulant" | **never bridged** — for a drug nobody named |

`polyp-surveillance` is the sharpest. Its own worked example — one 12 mm adenoma
— is a **three-year** interval. Drop the histology and it became **ten**, and
named "a normal examination" as the reason. That is not a shorter answer; it is a
different patient.

`gadolinium-nsf` is the one where the default deletes the question rather than
softening it. Nephrogenic systemic fibrosis is a risk *of* impaired clearance, so
reading a blank kidney function as normal clears every agent group.

`periop-bridging` had three of them — the agent, the bleeding risk of the
procedure, and the thrombotic risk — each the quiet end of its own table. The
thrombotic risk is the one that decides: high risk on warfarin is the only route
to considering a bridge, and a blank took the other branch silently.

## Rule 13 throughout

Each field is asked for only where it changes the answer.

- `polyp-surveillance` does **not** ask for the histology when piecemeal
  resection of a lesion 20 mm or larger is recorded (its own six-month track
  outranks the table), or when the examination did not reach the cecum.
- `periop-bridging` does not ask for the drug at minimal bleeding risk, and does
  not ask for the thrombotic risk on a direct oral anticoagulant.
- `gadolinium-nsf` keeps its **agent-group** fallback: "Not known which agent will
  be used" is a real row of that table, it is what a blank honestly means, and it
  is the cautious end rather than the reassuring one.

Every refusal carries the tile's standing caveats, since before anything is
entered is when they are worth most.

## Three more tests that pinned the default

```js
assert.equal(p({ histology: 'made-up' }).histology, 'none');
assert.equal(g({ renalState: 'made-up' }).renalState, 'normal');
assert.equal(b({ agent: 'made-up' }).agent, 'doac');
```

The same shape [spec-v1192](spec-v1192.md) found in `hiv-pep-occupational`: the
harmful default written down and asserted, so the gate could never move. All
three are now the regression test for the opposite.

## Proof

`probe-static-exemption` reads **17 → 14** rows, **12 → 9** calculators. Lint,
13,466 unit tests, 448 MCP tests and eight browser sweeps pass, and all three
refusals were read off the rendered page.

## Still open

Nine calculators remain on the finder. Three of them answer from a blank —
`narcolepsy-criteria` and `aom-criteria` both report **"Criteria not met"** when
the deciding observation is left out, and `atrial-enlargement` drops one chamber
from "left and right" without saying the P-wave measurement was missing. The
other six were read and are correct; they are exempt for the wrong reason, which
is a gate problem rather than a tile problem.
