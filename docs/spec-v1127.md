# spec-v1127 — checking monotonicity instead of assuming it

Five tiles left on the finder's list shared one shape: **the verdict rules in
correctly and the number under it is understated**, which is
[spec-v1114](spec-v1114.md)'s rule.

Every fix of that shape rests on the score being **monotone** — what has been
entered is a floor. Rule 10 says to check that rather than assume it. So before
writing five identical fixes, I grepped the five point tables for a negative
coefficient. Two came back.

## `impede-vte` is genuinely not monotone

```js
const DEX_PTS   = { none: 0, low: 2,     high: 4 };
const PROPH_PTS = { none: 0, aspirin: -3, therapeutic: -4 };
```

Dexamethasone **adds**; thromboprophylaxis **subtracts**. Both selects fell
through to `'none'`, so an unstated dexamethasone leaves the score too **low** and
an unstated prophylaxis leaves it too **high**. A partial form gives a **range**,
not a bound in either direction — the `ces-d` shape from
[spec-v1108](spec-v1108.md), and the second instance of it in this programme.

```
impedeVte({})  ->  "IMPEDE VTE between -4 and 4 on what was entered … One raises
                    the score and the other lowers it, so this is a range rather
                    than a floor, and it spans more than one risk band."
```

The band is given where the **whole range sits inside it**, which is the same
test `ces-d` uses. With the prophylaxis stated and only the dexamethasone open,
a score of 9 has a range of 9-13 — all of it *high*, and the band is earned.

## `leipzig-wilson` looks non-monotone and is not

`LIVER_CU['0']` is worth **-1** for a normal liver copper, so the grep flagged it.
It is still a floor, and the reason is worth stating:

> **the default an omission lands on is `'na'` (0 points), never `'0'`.**

What matters for monotonicity is not whether a table *holds* a negative but
whether an **omission can reach it**. The other six items default to their
0-point level, so every unstated item can only add.

That distinction is the whole value of running the check. A grep for `-` would
have said "not monotone" and produced a range where a floor is correct;
assuming monotone would have been right here and wrong next door in
`impede-vte`. **Neither the grep nor the assumption is the answer — reading which
value the fallback selects is.**

`leipzig-wilson` takes the floor treatment: *"diagnosis established"* rules in
from a subset and keeps its verdict, while the figure beneath it says
*"at least 5 … scored from 3 of the 6 items"*.

## The three left

`emergency-surgery-score`, `hscore-hlh` and `clif-c-aclf` have no negative
coefficient and no fallback that can reach one. They are plain floors and are
recorded here as the next pass rather than done in a wave whose subject is the
check itself.
