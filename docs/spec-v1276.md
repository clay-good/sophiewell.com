# spec-v1276 — correct Aetna program and appeal checks

The final five Aetna overlay rules previously attributed requirements to the
general precertification page that it does not publish. They treated a signed
written order as a universal Aetna DME and home-health packet requirement,
required transplant-center evaluation content, inferred investigational status
from broad terms such as off-label use, applied post-service claim-appeal
requirements to prospective authorization appeals, and required a network-gap
justification for every out-of-network request.

The rules now follow the current Aetna materials:

- `R-PA-AETNA-016` is an explicitly source-free informational reminder to
  check the applicable benefit, supplier, and regulatory written-order rules.
  It no longer claims a universal Aetna commercial requirement.
- `R-PA-AETNA-017` follows Aetna's 2026 participating-provider
  precertification list. It advises on National Medical Excellence routing for
  CAR-T drugs, major-organ transplant evaluations and transplants, and
  bone-marrow replacement or stem-cell transfer. It does not require an
  evaluation attachment that the list does not specify.
- `R-PA-AETNA-018` runs only when the packet explicitly says Aetna or a CPB
  classified the service as experimental or investigational. It asks for the
  applicable CPB, benefit-plan, or appeal basis as information; off-label use
  and clinical-trial language alone do not trigger it.
- `R-PA-AETNA-019` is limited to post-service appeals. It checks for the
  explanation, supporting records, and original denial, EOB, or claim reference
  listed on Aetna's provider appeals page. Prospective precertification appeals
  do not inherit those claim-appeal fields.
- `R-PA-AETNA-020` replaces the unsupported universal network-gap test with
  an informational check that identifies the member's out-of-network benefit
  and who handles precertification. Aetna says those answers depend on the plan
  and that members handle precertification when they use an out-of-network
  provider.

Regression tests cover missing and present order reminders, NME routing,
explicit versus inferred investigational status, prospective versus
post-service appeals, and incomplete versus documented out-of-network routing.
The source ledger now registers Aetna's provider appeals and out-of-network
benefit pages, and all generated PA audit reports are updated.

The source ledger contains 91 registered authorities: 22 fresh and 69 warning
by age, with no failures, source orphans, or coverage gaps. Of 876 PA rules, 823
are source-anchored; the decrease reflects the honestly source-free DME /
home-health reminder. The 1,722-tile catalog is unchanged.
