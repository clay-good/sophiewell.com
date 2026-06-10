# v11 audit - 60-Day Overpayment Report-and-Return Clock (`overpayment-60day`)

- Auditor: CG
- Date: 2026-06-10
- Citation re-verified against: ACA 6402(a) (42 U.S.C. 1320a-7k(d)); 42 CFR 401.305 (report and return within 60 days of identification). spec-v63 §3.5.

## Boundary examples added
- identified 2026-05-01 -> report-and-return by 2026-06-30 (60-day clock).
- identified 2026-01-01 -> 2026-03-02 (past-due relative to a mid-2026 clock).
- malformed/impossible date (2026-13-40) -> RangeError (caught by safe()).

## Cross-implementation differential
- Computed through lib/deadline.js, the same 60-day calendar math as breach-clock. 2026-05-01 + 60 d = 2026-06-30; 2026-01-01 + 60 d = 2026-03-02. Hand-checked. PASS.

## Edge-input handling notes
- States the rule's deadline only; makes no judgment that an overpayment occurred (the breach-clock posture). The note records that reasonable diligence is allowed before the 60-day clock starts. PASS.

## A11y / keyboard notes
- A single labeled native date input; aria-live output, past-due flagged. test:a11y clean; 320px no-hscroll clean. PASS.

## Defects opened
- none

## Status
- PASS
