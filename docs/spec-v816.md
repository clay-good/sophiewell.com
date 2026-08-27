# spec-v816 — ICHD-3 Criteria (Medication-Overuse Headache)

## What this gives you

Enter headache days, how long the overuse has run, and days per month by drug class; get
whether 8.2 is met and which subtype(s) apply.

## §1 The umbrella

- **A** — headache on ≥15 days/month in a patient with a pre-existing headache disorder.
- **B** — regular overuse for **>3 months** of one or more acute or symptomatic headache
  drugs.
- **C** — not better accounted for by another ICHD-3 diagnosis.

## §2 The threshold is not one number

This is the whole reason the tile takes a field per class instead of one "days of acute
medication" box.

| Class | Overuse at |
|---|---|
| 8.2.1 ergotamine | ≥10 days/month |
| 8.2.2 triptans | ≥10 |
| 8.2.4 opioids | ≥10 |
| 8.2.5 combination analgesics | ≥10 |
| **8.2.3 simple analgesics** (acetaminophen, aspirin, other NSAIDs) | **≥15** |

**Ibuprofen on 12 days a month is not overuse. A triptan on 12 days is.** Any single
threshold gets one of those wrong. When a simple analgesic lands in the 10–14 gap — where it
looks like overuse to anyone carrying "10 days" as the rule — the tile says explicitly that
it is not, and why.

## §3 The subtype that catches everyone else

**8.2.6** — any combination of ergotamine, triptans, non-opioid analgesics and/or opioids on
a **total** of ≥10 days/month, *without* overuse of any single class.

A triptan on 6 days and ibuprofen on 6 days is neither triptan-overuse nor
analgesic-overuse. It is medication-overuse headache. A tool that only checked each class
against its own threshold would return "not met" for a patient who has it.

## §4 Days, not doses

8.2.6 counts **days**. Summing the per-drug fields double-counts every day two drugs were
taken — the patient above who took both on the same 6 days has 6 medication days, not 12,
and falls *under* the threshold.

So the tile asks for the total separately, uses it when given, falls back to the sum when
not, and says which basis it used whenever the two disagree. Tested both ways.

## §5 Day counts are bounded, and that is a correctness fix

Every "days per month" field is validated to 0–31, and months of overuse to a sane maximum.

This is not defensive padding. "Days per month" cannot exceed the length of a month, and
without the bound the 8.2.6 total overflowed to `Infinity` on extreme input and printed it
in the result — the same class of defect that once had 81 tiles rendering `Infinity` on
screen. The MCP fuzz suite caught it; none of the clinical test cases above would have.
There is now a regression test.

## §6 Sourcing (spec-v97 gate)

- Headache Classification Committee of the International Headache Society (IHS). *The
  International Classification of Headache Disorders, 3rd edition.* Cephalalgia.
  2018;38(1):1-211 — section 8.2 read from the Society's free full text, together with the
  8.2.1, 8.2.2, 8.2.3.1, 8.2.3.3, 8.2.4, 8.2.5 and 8.2.6 subsection pages, each of which
  states its own threshold.

Every threshold was read from the subsection that defines it rather than from a summary
table, because the per-class differences are exactly what summary tables flatten.

## §7 Posture

Decision support, not a verdict. It applies published criteria to a medication history
already taken. It does not plan a withdrawal or start a preventive.

Catalog 1607 → 1608.
