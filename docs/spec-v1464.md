# spec-v1464 — RTA type: a blank potassium is not a low one

Found by the same blank-select probe as [spec-v1460](spec-v1460.md).

## What was wrong

The tool types renal tubular acidosis in a fixed order: a high serum potassium gives type 4
whatever the urine pH, and only then does the urine pH separate type 1 from type 2. Potassium is
optional on the agent surface, and a blank one was hard-coded to `'low'`. So a urine pH of 5.0 with
no potassium read **"Renal tubular acidosis type 2"** (proximal), when a high potassium would make it
type 4. The type was assigned while skipping the algorithm's first branch. (The page was not
affected: its select always holds a visible choice.)

## The fix

A blank potassium assigns no type. Following the tool's existing "typing incomplete" answer, it
reads: "RTA typing incomplete — choose the serum potassium: a high potassium gives type 4 whatever
the urine pH, so it comes first." Any supporting tests entered (fractional excretion of
bicarbonate, urine anion gap) are still reported. The returned `potassium` is `null`.

## Tests

`test/unit/rta-type.test.js`: a blank or empty potassium assigns no type and asks for it; a stated
high potassium still gives type 4.
