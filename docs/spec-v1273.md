# spec-v1273 — scope Aetna precertification checks to published requirements

The first five Aetna overlay rules previously turned workflow suggestions into
packet requirements. They flagged every coded request that did not cite a
Clinical Policy Bulletin, every request without a separately classified
clinical document, every packet that omitted its submission channel, and every
spinal or bariatric request without a procedure-specific questionnaire. Aetna's
current provider guidance does not support those universal requirements.

The rules now preserve the useful checks without overstating the source:

- `R-PA-AETNA-001` is an informational reminder when a coded request does not
  identify the applicable coverage criterion. Aetna lists criteria it may use
  during review but does not require every submission to cite one.
- `R-PA-AETNA-002` is informational when a coded request has no supporting
  clinical document. Aetna may review clinical information, while its
  procedure-specific forms define records required after an information
  request.
- `R-PA-AETNA-003` no longer treats the absence of an EDI, portal, or phone
  label in packet text as a defect. Aetna identifies accepted submission
  channels but does not require that operational choice in the packet.
- `R-PA-AETNA-004` remains a non-enforcing reminder because the application
  does not bundle Aetna's service and plan-specific precertification lists. Its
  citation now describes that limitation and Aetna's actual applicability
  categories clearly.
- `R-PA-AETNA-005` is limited to the reviewed spinal-surgery form and flags a
  missing response only when the packet says Aetna asked for additional
  information or pended the request. A spinal request alone no longer proves
  that a form was requested.

Regression tests cover advisory criteria and clinical-document findings, the
absence of a packet-level channel requirement, a spinal request with no Aetna
follow-up, and missing versus completed responses after an explicit request.
The Aetna fixture descriptions and all 46 generated PA audit reports are
updated with the new behavior. The source ledger now includes Aetna's current
provider-forms page and spinal-surgery information request form, and records
the review on September 14, 2026.

The source ledger contains 91 registered authorities: 22 fresh and 69 warning
by age, with no failures, source orphans, or coverage gaps. The 1,722-tile
catalog and 876-rule PA surface are unchanged.
