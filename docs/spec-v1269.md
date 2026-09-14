# spec-v1269 — scope surgical checks to their governing workflows

The surgery specialty overlay previously treated requirements associated with
joint replacement, anesthesia care, and completed hospital surgery records as
universal prerequisites for every surgical CPT from `10004` through `69990`.
That produced false PA defects for unrelated procedures and for prospective
packets that correctly did not yet contain facility workflow records.

`R-PA-SURG-001` and `R-PA-SURG-002` now apply only when a Medicare FFS packet
for primary total hip or knee arthroplasty (`27130` or `27447`) explicitly names
CMS LCD L40232. The LCD supports conservative therapy and radiographic findings
for those procedures and expressly permits a documented rationale when
conservative care is not appropriate. The linter does not infer that one local
policy governs another payer or jurisdiction. Tests verify that an unrelated
laparoscopic surgery no longer inherits arthroplasty policy.

The ASA checks now reflect anesthesia practice rather than payer approval.
`R-PA-SURG-003` is an informational workflow reminder only when anesthesia is
explicitly planned, ASA Physical Status III-V is documented, and a
preanesthesia assessment is absent. It no longer equates ASA III with a
universal need for separate “medical clearance.” `R-PA-SURG-004` validates a
supplied ASA I-VI value, including the emergency modifier, but does not require
an ASA field in every prospective PA packet.

`R-PA-SURG-005` now checks consent only for a completed inpatient or hospital-
outpatient surgery record. Under 42 CFR 482.51(b)(2), the executed consent form
belongs in the hospital chart before surgery except in emergencies; that rule
does not make completed consent a universal prospective PA attachment.

The former mixed surgical source row is split into CMS total-joint, ASA
preanesthesia, ASA Physical Status, and CMS hospital-surgery authorities, each
mapped to the rules it actually supports and verified on 2026-09-14. The
generated browser ledger, PA audit snapshots, and SBOM are refreshed together.
This reduces source-age warnings from 73 to 72 without changing the 1,722-tile
catalog or 876-rule PA surface.
