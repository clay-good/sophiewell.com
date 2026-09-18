# spec-v1381 — correct Texas Medicaid intake and clinical-review checks

Texas rules 001–010 carried both templates. The Texas Medicaid Provider
Procedures Manual, Volume 1, Section 5 (February 2026) is TMHP's
fee-for-service prior authorization chapter, and it settles most of them.

**Intake (001–005)**

- `001` becomes informational: TMHP decides against criteria in the Volume 2
  handbook for each service, which the packet is not required to cite.
- `002` flags an explicit prior authorization request that carries no
  documentation of medical necessity — TMHP says a request "must contain
  correct and complete information, including documentation of medical
  necessity," and denies an incomplete one the provider does not complete.
- `003` treats the channel — mail, fax, or portal, with electronic or wet
  signatures — as transport metadata.
- `004` points at the Volume 2 handbook, and at the MCO for a managed care
  client.
- `005` checks for the authorization number a claim must carry, only once the
  packet says authorization was obtained.

**Clinical review (006–010)**

- `007` follows TMHP's radiology prior authorization: cardiac nuclear imaging,
  CT, CTA, fMRI, MRA, MRE, MRI, and PET, triggered by a named study rather than
  any 7xxxx code.
- `008` follows TMHP's timing rule in place of an urgency test: authorization for
  urgent and emergency services provided after business hours, on a weekend, or
  on a holiday may be requested on the next business day, and later requests may
  be denied.
- `009` follows TMHP's provider-change rule: a change of provider during an active
  authorization needs a client-signed, dated change-of-provider letter naming
  both providers and the effective date. Texas publishes no site-of-care
  steering rule.
- `006` (inpatient) and `010` (NDC) run only on packet-declared workflows; the
  chapter leaves inpatient authorization to the hospital handbook.

Ten focused tests cover the payer wiring, the named-study trigger, the
after-hours timing rule, the change-of-provider letter, and false-positive
regressions. One pinned test is updated. The TMPPM Section 5 PDF is registered
in the source ledger.

The source ledger contains 91 registered authorities: 48 fresh and 43 warning
by age, with no failures, source orphans, or coverage gaps. Registering the
TMPPM Section 5 PDF moved the Texas source to fresh. Rule citations reference
241 distinct URLs, all among the 303 registered and none behind a sign-in wall.
Of 876 PA rules, 823 are source-anchored. The 1,722-tile catalog is unchanged.

Verification covers 1,355 PA-engine tests, 14,674 repository unit tests, and
459 MCP tests, all passing. Lint, accessibility, data integrity, and the
1,722-page production build also pass.
