# spec-v1456 — max-ICH's NIHSS box enforces the range its label states

A full local chromium run after [spec-v1451..v1454](spec-v1453.md) failed one page sweep,
`label-states-a-range.spec.js`: every label that names a range must have an input that enforces
it. The max-ICH field said "NIHSS score (0 to 42)" and its input carried `min="0"` with no `max`.
The library already refused anything above 42; only the page's own control disagreed with its
label.

The view's `numField` helper now takes an optional maximum, and the NIHSS box sets `max="42"`. The
label-range and two-ranges sweeps both pass (2 passed, chromium).

The lesson for the next new tool: a label that states a range is a promise the input must keep;
the library refusing is not enough for this sweep. Add it to the pre-push checks in the notes.
