# spec-v1680 — Independent review of the v300 to v499 tools

> Status: **SHIPPED (2026-10-20)**: hardening, no new tool (catalog stays 2,362). Follows [spec-v1679](spec-v1679.md).

A reviewer ran the 198 libs in `lib/*-v300.js` to `lib/*-v499.js`.

| Tool | Input | Was | Now |
|---|---|---|---|
| `jones-criteria` | chorea with fever; polyarthritis with polyarthralgia | "not met" (chorea lost the diagnosis once anything else was ticked); the joint counted twice | met: chorea is sufficient (2015 AHA, PMC7152370); one joint manifestation counts, as major or minor |
| `jones-criteria` view | risk tier and episode | opened on "low" and "initial", so the lib's "choose the tier" never fired | "Not stated" first |
| `gvhd-grade` | gut stage 4 alone | grade IV | grade III: Przepiorka 1995 gives IV for skin or liver stage 4 (table in PMC5797560); gut stage 4 relabeled "severe abdominal pain with or without ileus", skin stage 3 "rash over 50%" |
| `gvhd-grade` view | all organs | opened on stage 0: "No acute GVHD" | "Not staged" first |
| `icans` | ICE score blank, nothing else | "No ICANS" beside "cannot be excluded" | "ICANS not excluded (ICE score not entered)" |
| `nottingham-npi` | 2.02 cm, node 1, grade 1 (NPI 2.404) | "2.4, excellent" | good, printed 2.404; node and grade open on "Not selected" |
| `cdi-severity` | WBC 18 (thousands typed as cells) | "Non-severe" | asks for cells/uL (counts under 100) |
| `ceap-venous` | C4c; bare C4 | refused; silently C4a | C4c corona phlebectatica (2020 revision); bare C4 asks which subclass |
| `gold-abe` | mMRC 1.5, 1.5 exacerbations | scored | whole numbers only |
| `wexner`, `fazekas`, `nohria-stevenson` views | an empty form | "perfect continence", "absent", "profile A" on load | blank first options; Wexner asks for every item |

Not changed: the Lachman grade wording and Young-Burgess flags (unverified), and the Lansky, Schwab and England and
Montreal selects, which open on their first rows.

## Proof

`test/unit/review-fixes-v300-v499.test.js`; the jones, gvhd, ceap and wexner tests updated, each change commented.
