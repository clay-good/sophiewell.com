# spec-v1823 — Two envelopes the catalog had been asking for since July

> Status: **SHIPPED (2026-11-26)**: `lib/bounds.js` gains a **total cholesterol** and a **C-reactive
> protein** envelope, both sourced; **nine** calculators across seven libraries stop scoring an impossible
> value, and ten fields publish the new fences. 8 library files, 7 adapters, 2 tests. The catalog stays
> 2,390.

## What the envelope list was missing

[spec-v1731](spec-v1731.md) drove every unguarded sibling at 999999 and listed what `lib/bounds.js` could
not yet refuse, by quantity. [spec-v1820](spec-v1820.md) re-drove it and found the list down to fourteen
fields — and the two commonest quantities on it were a **total cholesterol** (three tools) and a **CRP**
(two). Those are not clinical judgements that need an owner; they are extreme-value questions with a
literature, which is how every other envelope here was fenced ([spec-v1734](spec-v1734.md)).

**Total cholesterol.** The thousands are reached by **lipoprotein-X** accumulation in cholestasis, not by
familial hypercholesterolemia: **2,554 mg/dL** in a 26-year-old with primary sclerosing cholangitis
([JACC Case Rep 2023](https://www.jacc.org/doi/10.1016/j.jaccas.2023.101799)), **2,415 mg/dL** in primary
biliary cirrhosis, normalized over sixteen plasmapheresis sessions, and **1,730 mg/dL** in an 18-month-old
with extrahepatic cholestasis
([Front Pediatr 2022](https://pmc.ncbi.nlm.nih.gov/articles/PMC9386286)). The fence is **1 to 5,000
mg/dL**, past all of them by the margin spec-v1734 uses.

**C-reactive protein.** The highest value a review of extremely elevated CRP reports is **839 mg/L**, from
a Belgian series in which infection accounted for 88% of values above 500
([Clin Med Insights 2023](https://pmc.ncbi.nlm.nih.gov/articles/PMC10594506)); a retrospective series of
CRP over 200 peaked at **580**, and Landry et al at **576**
([J Appl Sci Clin Pract 2025](https://journals.lww.com/jasc/fulltext/2025/01000/correlates_of_markedly_elevated_c_reactive_protein.7.aspx)).
The fence is **0 to 2,000 mg/L**.

## Nine tools were scoring past them

Each of these takes the **log** of the value or **bands** it, so the model is monotone and nothing stopped
it: `framingham-cvd`, `reynolds-risk`, `mesa-chd`, `ascvd`, `prevent`, `non-hdl-remnant`, `forns-index`,
`conut`, `lrinec` and `isaric-4c-mortality`. A total cholesterol of 10,000 mg/dL read a risk band; a CRP of
4,000 mg/L scored LRINEC's heaviest term (4 points at 150 or more) and 4C's top CRP band.

Two of them needed care rather than a line:

- **`non-hdl-remnant`** carries a mg/mmol select that rescales all three lipids, so the agent surface
  cannot hold a static declaration for the field at all — the category `probe-undeclared-cap` counts
  apart. The **library** knows which unit was chosen, so the envelope is applied to the converted value, at
  38.67 mg/dL to the mmol/L.
- **`conut`** reads a cholesterol whose being **low** is the finding the score is built on, so it takes
  `boundsAdvisory` and keeps the floor, not `envelopeAdvisory`.

## A fraction of the cholesterol is not the total

`probe-envelope-unenforced` reported `ascvd`'s **HDL** within a minute of the envelope landing, and it was
right to. The key `cholesterol` splits into the word every lipid field carries — *"HDL cholesterol"*, *"LDL
cholesterol (optional, for remnant)"* — so a fraction claimed the total's fence, where a floor of 1 mg/dL
says nothing true about an HDL of 25. `scripts/lib/quantity-name.mjs` gains `NOT_THE_TOTAL` for that, in the
same shape as its compartment and `NOT_ARTERIAL` rules; a fraction wants its own fence, with its own source.

## And the count nobody was reading

CONTRIBUTING.md names the number of envelopes **twice**, in the two rules a contributor reads before
writing a cap — that a literal there freezes a number that moves, and that a field whose cap is one of them
names it rather than restating it. It said **45** while the list had reached 47, and this spec would have
left it at 45. There is now a test that reads the prose against `Object.keys(BOUNDS).length`, because an
unlisted visible count will drift; that is the same rule the catalog count has been held to since
[spec-v982](spec-v982.md).

The cascade is the part worth remembering: each library that took the envelope made the next tool visible,
because the finder's question is "does a field whose words name an envelope answer past it" — and until the
envelope existed, none of these ten fields named one. Three rounds, and the finder is back to zero.
