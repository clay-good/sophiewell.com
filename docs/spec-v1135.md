# spec-v1135 — "all items at 0" was printed for a form nobody had filled in

[spec-v1129](spec-v1129.md) fixed `mgfa`'s subtype letter — the one that says
whether the weakness threatens the airway. It did not look at the other half of
the same tile, which is [rule 15](incomplete-input-program.md) in one line: *a fix
scoped by one worked case is scoped to that case.*

```
nobody rated anything   MGFA Class I -- ocular weakness only, all other strength
                        normal; MG-ADL 0/24 (all items at 0).
all eight rated normal  MGFA Class I -- ocular weakness only, all other strength
                        normal; MG-ADL 0/24 (all items at 0).
```

Two different clinical statements, one sentence. For a myasthenic patient,
*normal swallowing and breathing* is a finding somebody made; *nobody asked about
swallowing* is not.

## The bug is in what the counter counted

```js
if (raw !== undefined && raw !== '' && raw !== null) {
  const v = lvl(raw, 3);
  adlTotal += v;
  if (v > 0) scored += 1;      // <- items that are ABNORMAL, not items that were RATED
}
```

`scored` was a count of **non-zero** items, so `scored === 0` was true for the
all-normal patient as well as the empty form, and both got the parenthetical that
asserts normality. The loop already knew which items had a value — it is the
condition on the line above — and threw that away.

The MG-ADL is a sum of eight non-negative items, so a partial total is a floor:

| Rated | What it says |
| --- | --- |
| none | *MG-ADL not scored: none of its eight items has been rated* |
| some | *MG-ADL at least 5/24 from the 3 of 8 items rated (the other 5 not rated, each worth up to 3)* |
| all eight | *MG-ADL 5/24* |

The count is in the sentence, not only in the returned object
([spec-v1113](spec-v1113.md): disclosing in data is not disclosing). All eight
selects on the page now open on `Not rated` — they opened on `0 — normal`, so the
reader could not express the distinction the library was drawing.

## The worked example was itself a partial rating

`mgfa`'s example rates three of the eight items and documented its output as
*"MG-ADL 5/24"*. That was never a complete MG-ADL; it read like one. The
documented output now shows the floor sentence, so the example demonstrates the
distinction instead of hiding it.

**An example that omits a field is documentation of what omitting that field
does** — which is only a fair thing to publish once omitting it says so.
