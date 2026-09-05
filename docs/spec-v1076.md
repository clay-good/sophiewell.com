# spec-v1076 — three attacks, or nobody asked

[spec-v1066](spec-v1066.md) named the three states a criterion list has:

| State | What it means | What it may support |
|---|---|---|
| met | measured, and crossed its threshold | ruling in |
| **not met** | measured, and did not cross | ruling **out** |
| **not measured** | nobody entered it | **neither** |

It fixed two tiles that had collapsed the third into the second. The ICHD-3
headache family had it too, in a form that is easy to walk past because the tile
looks like it is explaining itself.

## What `migraine-ichd3` said

Fill everything except the attack count, and it answers:

> Neither ICHD-3 migraine criteria set is met — **for 1.1: at least 5 attacks**;
> for 1.2: at least 2 attacks, at least one fully reversible aura symptom…

Now enter `3` attacks — a patient who genuinely has had three — and it answers:

> Neither ICHD-3 migraine criteria set is met — **for 1.1: at least 5 attacks**;
> for 1.2: at least one fully reversible aura symptom…

The clause is identical. Every criterion is gated `attacks !== null && attacks >=
MIN`, so an unentered count and a short count both land as "unmet", and the
verdict on both is a **rule-out of migraine**.

The result object even has a `missing` array, which is what made this survive
three earlier waves: it looks like the tile is already owning up. It is not.
`missing` lists unmet **requirements**, never un-entered **fields**, and it reads
the same in both cases above.

## Both surfaces, one fix

The browser sends `val('mig-attacks')`, an empty string, which `num()` maps to
`null` — the same path. Checked directly against the library:

```
attackCount ''  ->  Neither ICHD-3 migraine criteria set is met — for 1.1: at least 5 attacks…
attackCount '3' ->  Neither ICHD-3 migraine criteria set is met — for 1.1: at least 5 attacks…
```

So this is not an adapter defect like [spec-v1073](spec-v1073.md) to
[spec-v1075](spec-v1075.md); it lives in `lib/`, and fixing it there fixes the
tile and the agent tool together.

Neither whole-catalog sweep could see it. The browser's `one-blank-field` gate
only clears fields whose label names a quantity that cannot be zero in a living
patient, and "Number of attacks so far" is a count. The agent-side probe found
it, which is what that probe is for.

## The three tiles

Each keeps a `notEntered` list beside `missing`, and while it is non-empty the
verdict says so instead of ruling out. An un-entered number is also named as
un-entered inside `missing` itself — "the number of attacks (1.1 asks for at
least 5)" rather than "at least 5 attacks".

| | |
|---|---|
| `migraine-ichd3` | attack count, untreated duration |
| `tension-headache-ichd3` | headache days per month, episode count, months of pattern, episode duration |
| `indomethacin-headache-ichd3` | attack count, duration, attacks per day, months continuous |

Two of them needed the outstanding list to be **per criteria set**, not per tile:

- 2.3 Chronic tension-type headache has **no episode-count requirement** — the
  tile already says so in `episodeNote` — so a blank episode count is
  outstanding only while an episodic form is still in play.
- Only 3.2 Paroxysmal hemicrania reads the attack count, duration and daily
  frequency; only 3.4 Hemicrania continua reads the months. Each number is
  outstanding for the set that asks for it.

A tile-level "you left something blank" would have been wrong in both, and would
have refused to rule out a diagnosis on evidence the classification never asked
for.

## Three exemptions retired

All three tiles were in `empty-form-ledger.js`, because an empty form used to
produce "No ICHD-3 tension-type headache subtype is met on these entries" — an
answer, so the sweep had to be told to skip them.

Now that they refuse, they do not need the exemption. The refusal is worded to
**ask** — "Not assessed: enter headache days per month, the number of episodes…"
— because the empty-form sweep matches `ASKING` only, deliberately: merging
`DISCLOSING` into it would excuse every tile that says "scored from 0 of 6" and
then prints a total ([spec-v1067](spec-v1067.md)). Wording the refusal to the
vocabulary that already exists is the right way round; widening the vocabulary to
fit a tile is the trap `asking-language.js` warns about in its own header.

The sweep passes with those three lines deleted, run without them to check.

## What holds it

One assertion per tile in the existing unit suites, each comparing all three
states — meets / entered-but-short / blank — and asserting the blank reading is
not the short one. Each tests the blank reading against `ASKING` itself rather
than a phrase, so rewording the sentence cannot quietly break the property the
sweep depends on. Verified by collapsing the third state back into the second in
all three libraries: three failures, and they pass again on restore.

The agent-side probe reads **99 fields across 53 calculators**, down from 107.

## The lesson

> **A tile that lists what it still needs is not necessarily distinguishing
> "unmet" from "unasked".** `missing` was a list of requirements, not of gaps,
> and it made three calculators look like they were already owning up while they
> ruled a diagnosis out on numbers nobody had entered. Check what a disclosure
> field is a list *of*.
