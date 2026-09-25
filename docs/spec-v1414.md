# spec-v1414 — the 4-hour window for a blood component

The third bedside question from [spec-v1412](spec-v1412.md). `blood transfusion rate` ranked the
ABC massive-transfusion score first; the generic `infusion-time-remaining` does the arithmetic but
knows nothing about the one limit a blood unit carries.

## The rule

The Circular of Information for the Use of Human Blood and Blood Components (AABB, American Red
Cross, America's Blood Centers, Armed Services Blood Program; 2024 edition, which FDA recognizes as
an extension of the container label), read 2026-09-24:

| item | text |
|---|---|
| Instructions for Use, 13 | "Transfusion of blood or blood components should start before expiration and finish within 4 hours after entering the container." |
| Instructions for Use, 10 | "the rate of infusion should initially be slow" (no number) |
| Red Blood Cells | "If the anticipated infusion rate must be so slow that the entire unit cannot be infused within 4 hours, it is appropriate to order smaller aliquots for transfusion." |

## What `blood-4h-window` does

Volume left in the bag (required), minutes since it was spiked (blank = not yet), and the pump rate
(optional):

- **No rate:** the slowest rate that finishes inside what is left of the 240 minutes, rounded **up**
  (300 mL unspiked = 75 mL/h).
- **A rate:** whether it finishes, and by how much it clears or misses the limit. A miss is flagged,
  gives the rate that would finish, and repeats the Circular's aliquot advice.
- **Past 240 minutes:** no rate is offered; the answer says the window has closed and to ask the
  transfusion service before running more.
- **Not yet spiked:** a reminder that the clock starts at spiking, and that the slow initial rate is
  the facility's number because the Circular gives none.

The minimum rate is arithmetic about the bag. Whether the patient's circulation tolerates it is a
clinical judgment, and the note says so.

## Tests

`test/unit/blood-4h-window.test.js`: the unspiked minimum, rounding up, a rate that finishes, a rate
that misses (with the aliquot step), a rate exactly at the limit, the closed window, and refusals.

## Not built: a push-dose pressor tile

The last of the five bedside absences. It would be a dilution-and-dose calculator, and the one
peer-reviewed treatment of the practice (Holden D et al, *Ann Emerg Med* 2018;71:83-92) reports no
outcome data over a continuous infusion and names preparation errors as its main hazard. Its dose
and dilution tables are not in the abstract, and a calculator's numbers must come from a source that
was read. Left out on purpose; `vasopressor` covers the infusion.
