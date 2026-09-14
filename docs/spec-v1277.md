# spec-v1277 — correct UnitedHealthcare intake checks

The first five UnitedHealthcare overlay rules previously promoted useful
routing hints into universal submission requirements. They flagged packets
that did not cite a coverage policy, assumed every request needed one of five
recognized clinical document types, described phone submission as a standard
channel, left the member-specific requirement check as a permanent passing
stub, and demanded a notification reference before a request was submitted.

The rules now follow UnitedHealthcare's current provider materials:

- `R-PA-UHC-001` is an informational policy-mapping aid. UnitedHealthcare
  publishes several types of coverage policies, but does not state that every
  prior-authorization packet must cite one.
- `R-PA-UHC-002` advises when no recognized clinical material is present and
  tells the user to verify the request-specific requirements. UnitedHealthcare
  says requests vary and supports uploading medical notes and attachments; it
  does not prescribe one universal attachment set on the cited page.
- `R-PA-UHC-003` names the electronic routes in the 2026 Administrative Guide:
  Provider Portal, EDI 278, or API. Phone and fax are no longer presented as
  generally interchangeable submission routes because the guide limits them
  to permitted circumstances.
- `R-PA-UHC-004` is now a real informational check for a member-specific
  requirement lookup rather than an always-passing stub. It accepts the lookup
  result or Decision ID and does not pretend a static repository list can
  answer a member-, plan-, and state-specific question.
- `R-PA-UHC-005` checks for a confirmation reference only when the packet says
  an advance notification was already submitted. An unsubmitted request no
  longer fails for lacking a number it cannot yet have.

Regression tests cover both sides of each changed behavior, including an
unsubmitted request, a submitted notification without confirmation, and a
submitted notification with a Decision ID. The source ledger now registers the
current requirements page and 2026 Administrative Guide, and all generated PA
audit reports are updated.

The source ledger contains 91 registered authorities: 22 fresh and 69 warning
by age, with no failures, source orphans, or coverage gaps. Its citations now
resolve across 97 registered URLs. Of 876 PA rules, 823 are source-anchored.
The 1,722-tile catalog is unchanged.
