# scope-one-box.md — One box in, an instrument out

> Status: **SHIPPED (2026-08-20).** Six specs, `spec-v751` through `spec-v756`, all green.
> Mockup: [one-box-mockup.html](one-box-mockup.html) — an interactive four-state prototype, built
> against the real `styles.css` tokens. Open it directly; the example chips walk all four states.

## The product in one line

A nurse types the question the way they would say it, and gets the number, the inputs it came
from, and the source. Nothing else on the page.

## Why not a chatbot

The output here is a number that goes on a chart, not prose. For that class of task the best
interfaces are instruments, not conversations — Google's calculator card, not a chat thread.
Three concrete reasons the card wins:

| | |
|---|---|
| **Verification** | A nurse reading `39 mL/min` in a chat bubble has to trust it. A nurse who sees `72 · Female · 68 kg · Cr 1.4` sitting under the 39 catches a mis-parse in about a second. That glance is the entire safety story, and a bubble deletes it. |
| **Posture** | A chat box invites "should I hold the metoprolol?". A box that returns an instrument never makes that offer. The site must read as a tool, not an advisor. |
| **Scrollback** | Chat accumulates. Mid-shift the current number should fill the screen, not sit under three previous patients'. `search → find → use → leave` is still right. |

What we want *from* chat is real and needs no model: you type how you talk, the machine shows what
it understood, and it asks for what is missing instead of handing you a blank form. All three are
deterministic. All three are in these specs.

## The four states

| State | Query | Spec |
|---|---|---|
| Fully prefilled | `crcl for a 72 year old woman, 68 kg, creatinine 1.4` | v752, v753, v754 |
| Partial | `wells score for PE, heart rate 110, previous DVT` | v753, v755 |
| One value short | `heparin drip 25000 units in 250 mL at 12 mL/hr` | v755 |
| Ambiguous | `correct the sodium` | v756 |

## Build order

Each spec is independently shippable and leaves CI green. v751 and v752 are presentation and can
land in either order; v753 is the substrate for v754–v756 and must land before them.

All six landed. Each row links to its own close-out, including what shipped differently
from the plan.

| Spec | What it does | Depends on |
|---|---|---|
| [v751](spec-v751.md) | The home page becomes one box | — |
| [v752](spec-v752.md) | Answer first, inputs second, proof collapsed | — |
| [v753](spec-v753.md) | Registry-driven prefill for the whole catalog | — |
| [v754](spec-v754.md) | Enter goes to the answer, not a picklist | v753 |
| [v755](spec-v755.md) | Ask for the missing value in words | v753, v754 |
| [v756](spec-v756.md) | Two plain choices when the query is ambiguous | v754 |

## What it cost, and what it caught

Three bugs that would have put wrong numbers in front of a nurse, all found by building it:

| | |
|---|---|
| The worked example topped up a partly answered question | Wells scored **6 instead of 3** — [v754](spec-v754.md) |
| Canonical values were read as US-customary | Cockcroft-Gault answered **17.69 instead of 39** — [v754](spec-v754.md) |
| A blank required field rendered as a confident zero | **"0 mL/min"** above an unanswered question — [v755](spec-v755.md) |

Plus one pre-existing bug, unrelated to this program: `applyHashState` dispatched only one
event type per restored field, so **every shared deep link with a `<select>` on an
input-wired tile rendered a stale number**. Fixed in [v754](spec-v754.md).

## What this program is not

- **Not an LLM.** No model runs, local or remote. Every step is parsing and table lookup, so there
  is no inference cost, no server, and no path by which a dose gets hallucinated.
- **Not query telemetry.** The home page says *no tracking*, and that stays true. Failed queries
  are diagnosable by running the extractor over a checked-in corpus of phrasings
  (`test/fixtures/queries.txt`), never by recording what a nurse typed. If we ever want real miss
  data, that is a separate decision with its own consent surface, not a side effect of this work.
- **Not a catalog change.** No tile is added, removed, or renumbered. The catalog stays **1564**
  through all six specs.
