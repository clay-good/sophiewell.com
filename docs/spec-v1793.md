# spec-v1793 — Ask the question a declaration makes

> Status: **SHIPPED (2026-11-25)**: 86 more fields declare the range their library already enforces, and
> the finder that proposes them stopped believing its own weakest test. No tool's arithmetic changed; the
> catalog stays 2,390.

[spec-v1777](spec-v1777.md) opened a vein: a cap a library **enforces** that nothing **declares** is
invisible, so an agent reading `describe_calculator` is told the input is a number and nothing more, and
then refused by a sentence it had no way to anticipate. Fifteen specs have been closing it.
`probe-undeclared-cap` finds the caps; this spec is about the 63 it was still offering, and about why only
20 of them were safe.

## The test that was too easy to pass

Before proposing a cap, the finder has to be sure the cap is **this field's own** — not a budget shared with
a sibling, not an output range reached from one direction. It asked that by shifting **one** sibling (the
first positive numeric input) by 25%, flipping each enum, and re-bisecting: a cap that held was the field's
own.

Driving the 63 survivors against **every single-factor variation** of the worked example instead — each
numeric sibling at nine multiples, each enum option, each flag — showed **20 of them moving**:

| Field | Its cap is really | Shown by |
|---|---|---|
| `qbl-pph` dry tare | the weighed pad mass | `qp-pad=1800` → 945 g accepted |
| `popq-staging` point Ba | the vaginal length | `pq-tvl=18` → 9.45 cm accepted |
| `hadlock-efw` BPD, HC | the abdominal circumference | `he-ac=3` → 502 mm accepted |
| `mfp-refund-check` quantity | whichever drug is picked | `mr-drug=austedo` → 1,050,000 units accepted |
| `katch-mcardle` body fat | the lean body mass | `km-lbm=1` → 105% accepted |
| `recist` nadir, `light-criteria` serum LDH, `unit-budget-variance` both amounts, `fap-discount` AGB, `ddi-static-aucr` Emax, `percent-platelet-recovery` post count, `pbac-hmb` clots and pads, `ectopy-burden` total beats | a sibling, or an output range | the same sweep |

Every one of those would have been frozen into a descriptor as a number true of one worked example.

So the finder no longer asks "did the edge move?". It asks the question a declaration actually makes —
**is anything past this edge ever accepted?** — of every variation that still computes, at three distances
out, since a cap that merely shifts outward is still not this field's own. The rewrite is also **3× faster**,
because an acceptance check is a handful of calls where a re-bisection is a decade walk and forty halvings.

## Four more ways it was wrong, each caught by its own evidence

**A narrow sibling is unreachable by multiples.** `corrected-potassium-ph` takes a pH of 6.3 to 8, so every
multiple of its 7.4 example lands outside and is refused, no variation computes, and the finder called the
potassium's floor the potassium's own. It is not: the floor is where the pH-corrected potassium leaves its
output range. Where a sibling **declares** a range, that declaration says where to look, so the sweep now
samples inside it.

**The gap between a declaration and a found edge is its own question.** The strongest claim this finder makes
is DISAGREES — a declared range the library does not keep, a defect either way round. It claimed one:
`corrected-potassium-ph` declares a pH of 6.3 to 8 and the bisection found 6.5. Neither number is wrong;
6.4 is accepted whenever the potassium is high enough, and the gap closes as the sibling moves. Values past
a cap are tested far out, where a declared floor's own refusal arrives first and hides this, so the gap is
now sampled in its own right. DISAGREES is empty.

**`exclusiveMaximum` is a declaration too.** The reader looked only at `maximum`, so `fagan-post-test`'s
pre-test probability was reported as undeclared when it has declared 0 to 100 exclusive since spec-v1777 —
one of the three fields that use the key, so the blind spot was the whole of it.

**The first eight options are not the list.** `mfp-refund-check`'s quantity ceiling moves with the drug, and
the drug that proves it was ninth. `q.values.slice(0, 8)` is gone.

**A cap can move inward.** The acceptance sweep is blind to that, and it is exactly what a unit select does:
`donor-recipient-size-match` converts lb to kg before the `weightKg` envelope, so its floor is 0.2 in kg and
0.44 in lb, nothing below either is accepted, the sweep was satisfied, and the field was declared. Naming
the envelope published "0.2 to 500" and `probe-declared-cap-configs` answered at **525 lb** — 238 kg, well
inside it — within the hour. Where a unit select exists the edge is re-bisected under each option, and a cap
that moves **at all** is held back. Those two fields wait for a declaration that can carry a unit.

## What is declared

| | before | after |
|---|---|---|
| Number fields declaring a bound | 2,186 of 5,189 | **2,272** |
| Declared edges | 3,931 | **4,105** |
| Configurations `probe-declared-cap-configs` drives | 18,516 | **19,563** |
| `probe-undeclared-cap` DECLARABLE | 63 | **0** |
| DISAGREES | 1 (false) | **0** |

Four of the declarations cost nothing but reading what was already there. `pufa-index` has carried each
dental code's tooth-count ceiling as the third element of `PUFA_FIELDS` since the tool was built, and the
descriptor dropped it on the floor; `rasrm-stage` exports `RASRM_MAX`; `turesky-plaque`'s six surface counts
and `osha-standard-threshold-shift`'s twelve audiogram thresholds are each built in a loop, so one edit
declares the family from the same source of truth the library reads. Two are deliberately loose:
`methacholine` carries both a PD20 in micrograms and a PC20 in mg/mL in one field, so its ceiling is the
**union** of 10,000 and 200 — the library still refuses a PC20 over 200 in its own words.

## The gates found the mistakes, not the review

Two declarations written here were wrong, and neither was caught by reading them:

* `test/unit/declared-cap-honest.test.js` — *every declared bound is an edge the library accepts* — refused
  a floor of 0 on `qbl-pph`'s pad mass (at 0 the dry tare's own cap collapses to 0) and on `methacholine`'s
  value (the library asks for a value **above** 0, so the floor is exclusive).
* `probe-declared-cap-configs` refused the `donor-recipient-size-match` weights above.

That is the layering working as intended: the finder proposes, the gate disposes. Three assertions in
`test/unit/sign-flipped-fields.test.js` also failed, for a reason worth recording — they pinned the exact
words `validateInputs` uses for a lone floor, and declaring a ceiling beside it changes the sentence to
"must be from X to Y". The assertion is that the **floor** is what refuses; it now accepts either sentence.
