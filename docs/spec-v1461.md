# spec-v1461 — Jones criteria: a blank risk tier or episode is not the stricter one

Found by the same blank-select probe as [spec-v1460](spec-v1460.md).

## What was wrong

The 2015 Jones criteria change with the population: in a moderate- or high-risk population,
monoarthritis and polyarthralgia count as major manifestations and monoarthralgia as minor. A
recurrent episode can also be met by three minor manifestations. On the agent surface, a blank tier
was read as low-risk and a blank episode as initial, which are the two stricter choices, and nothing
said so. Group A strep evidence plus carditis plus monoarthritis read **"Does not meet the 2015 Jones
criteria"**. In a moderate- or high-risk population those findings do meet the criteria. (The page
was not affected: its selects always hold a visible choice.)

## The fix

With the tier or episode blank, every combination of the blank ones is evaluated.

- If the blank one changes the result, the tool asks for it: "Choose the population risk tier (low
  or moderate/high): with these manifestations it decides whether the criteria are met."
- If the blank one does not change the result, the answer stands and says what it assumed: "No
  population risk tier was entered, so the low-risk criteria were counted; the moderate/high-risk
  criteria give the same result." The returned `riskPopulation` and `episode` are then `null`, not a
  value nobody entered.

The worked example (carditis and polyarthritis with strep evidence) still meets the criteria.

## Tests

`test/unit/jones.test.js`:

- a deciding blank tier is asked for;
- a deciding blank episode (three minor manifestations) is asked for;
- a non-deciding blank is disclosed, and a stated tier and episode carry no disclosure.
