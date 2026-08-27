# spec-v836 — 4Ts Score (Heparin-Induced Thrombocytopenia)

## What this gives you

Pick the four domains; get the 4Ts score, the probability band, and what the guideline says to
do about it.

This was a real absence rather than a rare-disease gap: the 4Ts is one of the most-used scores
in hospital medicine, and nothing here computed it.

## §1 The four domains, 0–2 each

| | 2 | 1 | 0 |
|---|---|---|---|
| **T**hrombocytopenia | fall >50% **and** nadir ≥20 | fall 30–50% **or** nadir 10–19 | fall <30% **or** nadir <10 |
| **T**iming | clear onset **days 5–14**, or a fall within 1 day with exposure in the past 30 days | consistent with days 5–14 but unclear, or onset after day 14, or a fall within 1 day with exposure 30–100 days ago | fall within 4 days without recent exposure |
| **T**hrombosis | new confirmed thrombosis; skin necrosis at injection sites; anaphylactoid reaction after an IV bolus; adrenal hemorrhage | progressive or recurrent thrombosis; non-necrotizing skin lesions; suspected but unconfirmed thrombosis | none |
| o**T**her causes | none apparent | possible | definite |

**6–8** high · **4–5** intermediate · **≤3** low.

## §2 The timing window is days 5–14, not 5–10

The original description used the narrower window; the version the American Society of
Hematology publishes widens it. A tool still on 5–10 **under-scores** the domain in patients
whose platelet fall begins in the second week — and the timing domain is worth two points, so
that alone can move a patient from intermediate to low.

## §3 A low score is a reason *not* to test

This is the part that inverts usual practice, and it is why the tile returns advice rather
than just a number.

At **low** probability the Society recommends **against** laboratory testing for HIT. The
negative predictive value of a low score is near total; the positive predictive value of a
high one is poor. **The score rules out far better than it rules in** — so a high score is a
reason to send an immunoassay and consider stopping heparin empirically, not a diagnosis.

## §4 Missing data scores *upward*

Most scores treat absent data as zero. This one does not: the Society states that where key
information is missing, it may be prudent to err on the side of a **higher** 4Ts score. So the
tile flags the total as a **floor** when that is declared — and adds the documented exception
that testing may be appropriate despite a low score when the uncertainty is about the score
itself.

## §5 One implementation note

The probability tier is returned as `probability`, not `band`: in this codebase `band` is the
result *sentence* by convention, and naming the tier `band` shadowed it. The first version did
exactly that and four tests caught it.

## §6 Sourcing (spec-v97 gate)

- Lo GK, Juhl D, Warkentin TE, Sigouin CS, Eichler P, Greinacher A. *J Thromb Haemost.*
  2006;4(4):759-765.
- The scoring table, the days 5–14 window, the testing recommendations and the missing-data
  advice were taken verbatim from the American Society of Hematology's own HIT pocket guide,
  which adapts Lo 2006 with Warkentin 2010.

## §7 Posture

Decision support, not a verdict. It estimates a pretest probability from information already
gathered. It does not stop heparin or start an alternative anticoagulant.

Catalog 1627 → 1628.
