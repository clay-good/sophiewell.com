# spec-v1274 — correct Aetna review-mode and evidence checks

Aetna overlay rules 006 through 010 previously applied several published
statements beyond their scope. An initial inpatient request was treated as an
active concurrent review, every hospital-outpatient radiology code could be
treated as MRI or CT, member-specific site-of-care language became a universal
blocking requirement, and one generic objective-evidence check covered several
unrelated procedures. The drug rule also attributed a universal NDC field to a
form that does not contain it.

The five rules now follow the current Aetna materials:

- `R-PA-AETNA-006` runs only when the packet explicitly identifies concurrent
  or continued-stay review. A missing current-condition or clinical-progress
  update is informational because Aetna describes collecting that information
  during review; Aetna itself creates and reviews the discharge plan.
- `R-PA-AETNA-007` recognizes MRI or CT from the named service rather than the
  entire `7xxxx` radiology range. Its missing-rationale result is informational
  because Aetna's 2026 list says site-of-care requirements apply to some
  members, not every Aetna plan.
- `R-PA-AETNA-008` remains a packet-completeness reminder for an unexplained
  expedited label, but is informational and source-free. The current commercial
  precertification overview does not publish the universal urgency criterion
  the old citation claimed.
- `R-PA-AETNA-009` is limited to upper-lid surgery requested for functional
  visual impairment. It requires photographs and taped/untaped visual-field
  testing under Aetna CPB 0084, plus margin-reflex distance for ptosis repair.
  Other eyelid indications and unrelated procedures do not inherit the check.
- `R-PA-AETNA-010` follows Aetna's general information request form by advising
  on a missing applicable administration code for a J-code drug or injectable.
  It no longer claims that Aetna universally requires an NDC. The separate
  cross-payer infusion rule continues to handle validated NDC content.

Regression tests cover initial versus concurrent review, member-specific
site-of-care advice, a non-MRI `7xxxx` code, source-free expedited review,
functional versus unspecified blepharoplasty, the extra ptosis measurement,
and missing versus present administration codes. The three Aetna fixture
descriptions and all 46 generated PA audit reports are updated. The Aetna
ledger entry now registers the 2026 precertification list, CPB 0084, and the
general information request form.

The source ledger contains 91 registered authorities: 22 fresh and 69 warning
by age, with no failures, source orphans, or coverage gaps. Of 876 PA rules, 825
are source-anchored. The 1,722-tile catalog is unchanged.
