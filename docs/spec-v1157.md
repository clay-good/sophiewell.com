# spec-v1157 — the sweep read a different rule from the one it polices

`one-disclaimer.spec.js` exists because 1,063 of the tiles once stated the generic
clinical notice next to their own longer version of it, and a reader who meets the
same disclaimer twice learns to skip both. `app.js` drops the generic one when the
view states its own; the sweep checks nobody ends up with two.

**The recogniser was written twice** — once in `app.js`, which makes the decision,
and once in the sweep, which polices it. And the copies had already drifted:

| | `app.js` | the sweep |
| --- | --- | --- |
| `Decision support, not a verdict…` standalone branch | yes | **no** |
| `/ decision support…` opening | yes | **no** |
| requires the line to also name who decides | yes | **no** |

A sweep that exists to police a decision must read the same rule the decision is
made with. Both now import `lib/own-notice.js`, which the sweep loads into the page
the same way it already loads `/lib/meta.js`.

## Its reach, printed and asserted

The sweep visits every tile, so "how many did it visit" was never the question. The
question is **how many its recogniser can see** — because a tile whose notice is
reworded out of the pattern silently stops being checked:

```
ONEDISC: 1212 of 1706 tiles state their own clinical notice
```

Asserted, so a change that reworded most of them fails here instead of reporting
clean. That is the [spec-v1099](spec-v1099.md) / [spec-v1106](spec-v1106.md) lesson,
and [spec-v1156](spec-v1156.md) applied it to the sweep next door.

## And a carve-out that protected nothing

`loeb-minimum-criteria` was skipped, because its notice opens *"Decision support
**for** when the minimum threshold … is met"* — no break after "support", so the
recogniser does not see it and the tile keeps the banner.

But **an unrecognised tile is never flagged in the first place.** The exemption
protected nothing, and a tile exempted for nothing is a tile the gate is not
protecting. Removed; the sweep still passes, and if that notice is ever reworded
into the recognised shape the tile joins the check rather than staying carved out
of it.

## Negative-tested

With `dropDuplicateNotice`'s condition forced false, the sweep fails and counts the
damage:

```
Error: 1205 tiles state the generic notice next to their own
```

Restored, it passes. 1,706 tiles in under seven seconds.
