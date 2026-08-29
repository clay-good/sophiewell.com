# spec-v882 — Post-polypectomy surveillance interval

## What this gives you

The next colonoscopy interval from the US Multi-Society Task Force table, with the precondition
every row of it rests on.

## §1 The table

| Finding | Interval |
|---|---|
| Normal, or hyperplastic polyps < 10 mm in rectum/sigmoid | 10 years |
| 1–2 tubular adenomas < 10 mm | 7–10 years |
| 3–4 tubular adenomas < 10 mm | 3–5 years |
| 5–10 adenomas < 10 mm | 3 years |
| Any adenoma ≥ 10 mm, villous/tubulovillous, or high-grade dysplasia | 3 years |
| More than 10 adenomas | 1 year |
| Piecemeal resection of an adenoma ≥ 20 mm | 6 months |

## §2 Every interval presumes a complete, adequate examination

This is why the tile exists. If the colonoscopy did not reach the cecum, or the preparation was
not adequate, **no number from the table applies** and the recommendation is an early repeat. Both
are inputs, and the sentence prints on every result — a reader entering findings will not think to
check.

## §3 The piecemeal row is a completeness check, not surveillance

Six months after piecemeal resection of an adenoma ≥ 20 mm confirms the resection was complete. It
outranks every other row, including the examination precondition.

## §4 Size, histology and dysplasia each shorten the interval on their own

A single 12 mm adenoma is a 3-year interval even though the count is 1. The tile says so when the
count is low and the interval is short, and when a size sits just under the 10 mm line.

## §5 What it does not cover

Average-risk surveillance after polypectomy only — not a personal or family history that puts a
patient on a different schedule, and not inflammatory bowel disease. On every result.

## §6 Sourcing (spec-v97 gate)

- Gupta S, Lieberman D, Anderson JC, et al. *Recommendations for Follow-Up After Colonoscopy and
  Polypectomy: A Consensus Update by the US Multi-Society Task Force on Colorectal Cancer.*
  Gastroenterology. 2020;158(4):1131-1153.

No tracked guideline issuer, so no `docs/citation-staleness.md` row is owed.

## §7 Posture

Decision support, not a verdict. It applies a published interval table to findings already
recorded. It does not decide when a patient is scheduled.

Catalog 1672 → 1673.
