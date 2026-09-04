# spec-v1065 — eight more, and a third instance of the same miss

Third wave of the one-blank-field programme ([spec-v1063](spec-v1063.md),
[spec-v1064](spec-v1064.md)). Same finder, same question: fill a calculator from
its own worked example, clear one field naming a quantity that cannot be zero in
a living patient, read what comes back.

## The half-fix, a third time

`pelod2` and `psofa` were guarded by an earlier wave — for their **age**, which
selects the age band the other cut-offs are read from. That was the field the
all-fields sweep pointed at. The other seven or eight measurements on each tile
kept reading `0` when blank, and the sweep stayed quiet because the age guard
was enough to make the empty form refuse.

That is now three separate instances of the same shape:

| Wave | Guarded then | Left behind |
|---|---|---|
| v1063 | `carb-insulin-bolus`: carbohydrates, ratio, current glucose | the ISF and the target |
| v1064 | `news2` / `mews`: the plain vitals | the temperature (a unit field) |
| v1065 | `pelod2` / `psofa`: the age | every other measurement |

The pattern is not a coincidence and it is not carelessness — it is what the
sweep *asks*. A sweep that clears every field can only ever point at one field
per tile, because the tile stops answering as soon as one guard fires.

## The eight

| Calculator | With one field blank | Now |
|---|---|---|
| `vte-prophylaxis-dose` | a blank creatinine clearance read as 0 mL/min, so the tile halved the frequency to q24h and printed "**CrCl <30 mL/min: renal reduction applied**" as a fact about the patient | Asks for weight and clearance |
| `toxic-alcohol` | glucose and BUN are terms in the *calculated* osmolality, so a blank one made the calculation too low and the **osmolar gap too wide** — 20 where the entered labs gave 15. The gap is an indication limb for fomepizole | Asks for the four required chemistries; ethanol, pH, bicarbonate and level stay optional |
| `maddrey-lille` | a blank bilirubin took the discriminant function from 46.8 to 36.8; a blank day-7 bilirubin took Lille to **0.017**, well under the 0.45 responder line — the reading that says carry on with steroids | Each model guarded separately, so one still works without the other |
| `aminoglycoside` | refused, which is the safe direction, but gave a **fabricated reason**: "CrCl <20 mL/min: extended-interval dosing not validated" | Asks for the clearance instead of describing one |
| `pelod2` | a blank creatinine took the score from 9 to 7 | Asks for the panel |
| `psofa` | a blank bilirubin scored the hepatic organ 0 — a normal liver — and a blank creatinine did the same to the kidney | Asks for the panel |
| `apache2` | (v1064) refactored onto the shared panel helper | — |

## Measured and found correct — do not "fix" these

The probe reports any field whose clearing **changes the answer**, which is
deliberately wider than "is a bug". Three tiles look like hits and are right:

- **`modified-marshall`** drops an organ from its failure list when that organ's
  value goes blank. Its own note says "Leave a system blank if not assessed",
  and it reports which systems were scored. That is the design, stated on screen.
- **`lrinec`** withholds a total below the suspicion threshold while any
  component is missing, and discloses "scored from N of 6 components" above it.
  This wave's `geneva-original` fix copied it.
- **`anion-gap`, `corrected-ca-na`, `aa-pf-suite`, `acromegaly-biochem`** drop
  the dependent output line, or say "not enough entered to interpret", rather
  than computing it from a zero.

## Which fix, and why

Three shapes, now settled across the programme:

1. **Refuse** — the missing value is the entry condition, or the answer could go
   either way without it.
2. **Disclose** — the score is monotone, so a partial total is a floor. Safe to
   rule in, never to rule out (spec-v1006). The floor is only safe once the score
   has *left* the reassuring band, which is why `geneva-original` withholds its
   low band and `lrinec` withholds below 6.
3. **Ask for the whole panel** — a blank is read as literal `0`, and `0` is
   profoundly deranged for one measurement (a mean arterial pressure) and
   perfectly normal for another (a bilirubin). A partial total can then sit on
   either side of the real score, so neither a floor nor a ceiling is honest.
   `apache2`, `pelod2` and `psofa` share the `needPanel` helper for this.

## A gate that was switched off

Adding `needValues` to `maddrey-lille` meant calling it in `views/group-g.js`,
which had no copy of it. Nothing in the lint chain complained. The tile shipped
the string **"needValues is not defined"** in place of its answer, and the only
thing that caught it was `example-correctness` — a browser sweep, and only
because that calculator happens to ship a worked example. A tile without one
would have gone out broken.

The cause: `eslint.config.js` never enabled `no-undef`, and never extended
`eslint:recommended`. It has carried a hand-maintained list of forty-odd browser
globals as `readonly` the whole time — a list that exists *for that rule and no
other*. The list was being maintained for a rule nobody had turned on.

Turning it on flagged 39 problems, every one a standard browser API missing from
that list (`CSS`, `Response`, `Request`, `MutationObserver`, `queueMicrotask`,
`AbortController`, `AbortSignal`, `FormData`, `structuredClone`,
`ReadableStream`) — and **no real undefined references**. So the cost of the gate
was ten lines of globals, and it now fails the build on a call to a function
that does not exist anywhere in the module.

Verified by reintroducing the defect: with `needValues` deleted from
`views/group-g.js` again, eslint reports it at both call sites and exits
non-zero.
