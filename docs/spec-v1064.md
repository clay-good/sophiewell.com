# spec-v1064 — seven more, and the shape of the miss

Second wave of the one-blank-field programme opened in [spec-v1063](spec-v1063.md).
Same finder: fill a calculator from its own worked example, clear a single field
whose label names a quantity that cannot be zero in a living patient, read what
comes back.

## The miss has a shape

Three of the seven here were **half-fixed by an earlier wave**, and the half that
was left behind was always the same kind of field.

| Calculator | Fixed then | Left behind |
|---|---|---|
| `news2` | four vitals moved to `nvOrNull` | the temperature — a **unit field**, read through `unitNum` |
| `mews` | three vitals moved to `nvOrNull` | the temperature — same |
| `carb-insulin-bolus` (v1063) | carbohydrates, ratio, current glucose | the ISF and the target |

A unit field is read by a different helper (`unitNum`, which converts before
returning), and the blank-safe twin `unitNumOpt` has existed since spec-v184. The
earlier fixes swept the plain number readers and did not follow the conversion
path. Because the all-fields sweeps go quiet as soon as *one* guard fires, that
left no trace.

**When a fix moves readers to a blank-safe helper, grep the tile for every
reader it uses, not every reader of the kind you just changed.**

## The seven

| Calculator | With one field blank | Now |
|---|---|---|
| `apache2` | a blank heart rate scores 0 bpm (**+4**) and a blank age scores 0 years (**+0**), so the total moved to 26 or to 20 from 23 — and the quoted mortality from ~25% to ~55% | Asks for the full panel of 13 |
| `egfr` | CKD-EPI falls with age, so a blank age returned the **highest** eGFR the creatinine allows: 93.7 where the patient's age gave 64.5 | Asks for the age |
| `news2` | a blank temperature converted to 0 °C — the bottom band, 3 points — taking NEWS2 from 0 "continue routine monitoring" to 3 "**urgent review**" | Asks for the temperature |
| `mews` | same miss, same cause | Asks for the temperature |
| `iss-rts` | a blank systolic pressure coded as 0 mmHg dropped the Revised Trauma Score from 7.84 to 4.91 beside an unchanged ISS | RTS withheld unless all three vitals are present; ISS unaffected |
| `saag` | the gradient is one albumin minus the other, so a blank ascites albumin made SAAG equal to the serum albumin: 3.5 g/dL where the pair gave 2 | Asks for both |
| `geneva-original` | a blank heart rate silently omits its point | Withholds the **low** band; discloses above it |

## Why `apache2` is asked for rather than disclosed

spec-v1063 established two shapes of fix — refuse, or disclose that a monotone
total is a floor. APACHE II is neither, and it is worth naming why.

A blank field there is read as the literal value 0, and 0 is *profoundly
deranged* for a heart rate (+4 points) and *perfectly normal* for an age (+0).
So a partial total is **not** a floor: it can sit above or below the patient's
real score depending on which field is empty. Neither ruling in nor ruling out
is safe, and there is no honest sentence to print alongside the number. The
score is defined over a complete physiologic panel, so the panel is asked for.

`geneva-original` shows the boundary case for the monotone rule. The heart rate
adds a point or nothing, so the total is a floor — which is safe once the score
has left the low band, and unsafe exactly at the edge: a 4 scored without the
pulse is a 5, intermediate probability, if the pulse is above 100. "Low clinical
probability" is the sentence a pulmonary embolism gets ruled out on. So the low
band is withheld and every other band says what it was scored from — the same
split `lrinec` already used.

## Verification

Each fix is pinned by a named test, and the two that changed shared library
behaviour had existing tests that encoded the defect:

- Three `geneva-original` tests omitted the heart rate and landed in the low
  band, relying on the blank scoring as absent. They now pass an explicit normal
  rate, which is what each was actually testing.
- `iss-rts` gained the null-vitals case beside its existing full-vitals one.

The build was re-run so the SBOM's per-file hashes match; the previous wave's
commit missed that and failed CI's build-idempotency job.
