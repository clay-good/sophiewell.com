# spec-v1056 — The drift was being paid for in exemptions

spec-v1055 found one checking rule implemented twice and already divergent. The obvious next
question is where else — and the likeliest place was code I wrote this session.

Two whole-catalog sweeps need the same vocabulary: **the words a calculator uses when it is asking
rather than answering.** The empty-form sweep clears every field; the required-field sweep clears
one. A reading that asks is not a tile that answered, so both must skip it. I wrote the second by
copying the first, then extended it as tiles were fixed.

They had drifted: 22 shared terms, and each carried terms the other lacked.

## Why that is not symmetrical noise

A phrase missing from a sweep makes that sweep **flag a tile that is refusing correctly**. And the
way a flagged tile gets quiet is a **ledger line**.

So the drift had been paid for in exemptions. `ascvd` and `prevent` refuse with *"PCE valid for ages
40-79 only"*; `arc-hbr` with *"Still needed: hemoglobin"*. One sweep recognised those as refusals and
the other did not, so each sat on the empty-form ledger — exempted from the gate that was meant to be
protecting them, for a defect they did not have.

Unifying the vocabulary and re-running with the ledger ignored: **35 of the 78 lines were
unnecessary.** Some were tiles fixed across spec-v1029 to spec-v1047 whose lines nobody deleted; the
rest were never defects. The ledger is 43.

## The general shape

**An exemption is the cheapest way to silence a gate.** So a gate whose judgment is slightly wrong
does not look wrong — it looks like a longer ledger. Nobody reviews a list of ids; they review the
diff that adds one, and each addition is individually defensible.

Two consequences worth keeping:

1. **Re-run every ledgered sweep with its ledger ignored, periodically.** It is the only way a stale
   line surfaces. Both sweeps in this program now have that as a documented step.
2. **A ledger growing is evidence about the gate, not only about the catalog.** Thirty-five lines
   accumulated without anyone doing anything wrong.

`test/lib/asking-language.js` holds the vocabulary, with the two rules for editing it that
spec-v1039 and spec-v1046 cost: check which tiles a new phrase stops flagging, and never soften the
list to accommodate a tile that says the words and answers anyway — make the tile refuse.
