# spec-v1267 — scope radiology checks to current ACR guidance

The radiology overlay previously converted several broad workflow conventions
into universal clinical requirements. It required conservative management for
every nonurgent MRI, required renal laboratory results before every contrast
study, and treated pediatric MRI as ionizing radiation. Those assumptions do
not match current American College of Radiology guidance.

`R-PA-RAD-002` now limits the conservative-management heuristic to nonemergent
spine and extremity MRI; brain and other MRI requests no longer inherit that
unrelated prerequisite. `R-PA-RAD-003` now asks for prior same-class contrast
reaction history and renal-risk screening. A documented negative renal-risk
screen passes without routine creatinine, while a positive risk screen still
asks for renal function when useful. Known acute kidney injury or dialysis is
itself treated as an identified risk state rather than demanding an inaccurate
eGFR calculation.

`R-PA-RAD-005` now applies its pediatric ALARA reminder only to ionizing studies
such as CT, radiography, and nuclear medicine. MRI and diagnostic ultrasound
explicitly pass that gate. `R-PA-RAD-001` remains informational but no longer
claims that an explicit ACR citation is a universal payer requirement or that
it independently improves approval rates.

The 2026 ACR Appropriateness Criteria release and the current ACR Manual on
Contrast Media were reread on 2026-09-14. Regression tests cover each narrowed
boundary. The generated browser ledger, PA audit snapshots, and SBOM are
refreshed together. This reduces source-age warnings from 75 to 74 without
changing the 1,722-tile catalog or the 876-rule PA surface.
