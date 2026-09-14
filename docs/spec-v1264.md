# spec-v1264 — align Medicare DME paperwork with the current manual

The Medicare FFS DME checks had turned post-delivery and conditional CMS
requirements into universal prior-authorization blockers. They required every
written order before delivery, required quantity and an NPI on every order,
asked prospective packets for proof of delivery, and described the supplier
PTAN as a claim identifier.

The checks now follow CMS Program Integrity Manual chapters 4 and 5:

- every DMEPOS claim needs a signed written order, but only items on the WOPD
  list need that order before delivery;
- an SWO accepts beneficiary name or MBI and practitioner name or NPI, while
  quantity is required only when applicable;
- proof of delivery is checked only after the packet says delivery occurred;
- missing supplier-enrollment evidence is informational, and PTAN is no longer
  described as a required claim field.

Regression tests cover an undated practitioner signature, the SWO alternatives,
a prospective packet without proof of delivery, delivered equipment without
proof, and active PECOS enrollment. The CMS Pub 100-08 source was reread on
2026-09-14. Its ledger date, generated browser module, PA audit snapshots, and
SBOM are refreshed together. This reduces source-age warnings from 78 to 77
without changing the 1,722-tile catalog or the 876-rule PA surface.
