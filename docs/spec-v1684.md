# spec-v1684 — The hEDS Beighton cutoff defaulted a blank age group

> Status: **SHIPPED (2026-10-24)**: hardening, no new tool (catalog stays 2,362). Follows [spec-v1683](spec-v1683.md).

An independent review of the v800–v907 tools found one defect provable from the tool's own cited text.

| Tool | Input | Was | Now |
|---|---|---|---|
| `heds-2017` | all criteria met, Beighton 4, age group not chosen, for a patient over 50 | a blank age group silently defaulted to the pubertal-to-50 cutoff of 5, so Beighton 4 read as one below the cutoff and the 2017 criteria were called **not met** — a falsely reassuring false-negative (and a pre-pubertal patient at 5 was over-called) | the age group is asked for, not defaulted: the cutoff is age-adjusted (6 pre-pubertal/adolescent, 5 to age 50, 4 over 50), so the tool refuses until it is chosen, as the sibling tiles `ewgsop2` and `feno` already do |

The Beighton cutoff in criterion 1 is age-adjusted, so the group is not optional information — it decides the
criterion and therefore the whole verdict. The compute now refuses a blank group with an asking message; the
browser select gained a "Choose the age group" first option so it no longer opens on a cutoff nobody picked; and
`META['heds-2017'].example` now names the group it had been relying on the default to supply.

The other 104 files in the range proved clean against their own cited text.

## Proof

`test/unit/heds-2017.test.js` (a new "a blank age group is refused, not defaulted" test pins the over-50,
Beighton-4 clinical case; the shared bases and the empty-input test were updated to carry a chosen group, each
change commented). Verified live in the browser: with the group blank, the result region shows the refusal.
