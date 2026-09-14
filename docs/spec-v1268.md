# spec-v1268 — validate real NDC values in infusion packets

The Medicaid and cross-payer infusion rules previously accepted a bare `NDC:`
label with no identifier. Their loose regular expression also accepted segment
shapes that FDA does not assign. This let incomplete physician-administered-drug
packets pass while the finding claimed an NDC had been documented.

Both rules now share one strict current-format detector. It accepts FDA's three
10-digit forms (4-4-2, 5-3-2, and 5-4-1), the 11-digit 5-4-2 form, and an
undashed 11-digit reimbursement value. A bare label or malformed shape fails.
Tests pin every accepted shape and representative invalid values.

The wording now separates identifiers from coverage. FDA's NDC Directory does
not prove that a product is approved or reimbursable, and an 11-digit NDC is a
HIPAA transaction format rather than the current FDA-assigned format.
`R-PA-INF-001` therefore discloses that its all-J-code warning is a conservative
cross-payer heuristic. `R-PA-INF-004` likewise distinguishes FDA-labeled use,
clinically permissible off-label prescribing, and payer coverage decisions.

FDA's 2026 final NDC-format rule was reread on 2026-09-14. FDA continues to
assign 10-digit NDCs until the uniform native 12-digit format takes effect on
2033-03-07, beyond this ruleset's accepted service-date horizon. The canonical
ledger URL, generated browser ledger, PA audit snapshots, and SBOM are refreshed
together. This reduces source-age warnings from 74 to 73 without changing the
1,722-tile catalog or the 876-rule PA surface.
