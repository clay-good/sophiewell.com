# spec-v993 — The idempotence gate strict-equality-tested a measurement

## The finding

The "the build must be idempotent" step added at spec-v990 and widened at spec-v991 did its job
on its first real run, and failed:

```
-  "gzipBytes": 56561,
+  "gzipBytes": 55956,
```

`data/search-corpus/manifest.json` records the **gzipped size** of the search corpus, against a
budget. That number is produced by whichever zlib the running machine has, so it differs between a
contributor's macOS Node and the Ubuntu runner **even when the corpus is byte-identical** — and it
is: the `hash` field beside it, which is what actually pins the content, was unchanged on both
sides of that diff.

So the gate was asserting equality on a measurement of the environment rather than on the artifact.
A check that fails for a reason unrelated to the change under test is a check people learn to
ignore.

## The fix

The idempotence check now covers `data/search-corpus/corpus.json` and `corpus-detail.json` in full
— the actual corpus, where a real drift would show — and skips the manifest that carries the
platform-dependent byte count. `data/fields/` has no such field and stays covered whole.

The general rule, which this project has now paid for twice: **never strict-equality-test a value
that is stamped by the environment.** Compare the content hash, or compare against the budget the
number exists to check, and leave the measurement out of the assertion.

## Why this ships beside spec-v992

It is a one-line correction to a gate that landed hours earlier and is currently failing `main`.
Holding it back to keep one change per commit would leave the branch red for no benefit; the
CHANGELOG carries both entries.
