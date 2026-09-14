# spec-v1270 — remove the obsolete buprenorphine X-waiver check

`R-PA-BH-005` previously required every medication treatment request for a
substance use disorder to reference an X-waiver or opioid treatment program.
That combined distinct federal rules and could tell a valid buprenorphine or
naltrexone packet that obsolete authorization evidence was missing.

Section 1262 of the Consolidated Appropriations Act, 2023 eliminated the
federal DATA/X-waiver requirement for practitioners prescribing buprenorphine
for opioid use disorder in December 2022. SAMHSA confirms that a standard DEA
registration is now sufficient under federal law, subject to state law.
Methadone dispensed for opioid use disorder remains tied to a certified opioid
treatment program, while naltrexone does not inherit that OTP requirement.

The rule now applies those branches separately. A buprenorphine request passes
without an X-waiver. A naltrexone request does not trigger the methadone rule.
Only methadone paired with an `F11` opioid-use-disorder diagnosis produces an
informational finding when no certified OTP anchor is present; a medication
list containing methadone does not by itself establish OUD treatment. Tests pin
all four paths.

The rule now maps to a dedicated SAMHSA authority verified on 2026-09-14 rather
than the mixed DSM source. The generated browser ledger, PA audit snapshots,
and SBOM are refreshed together. Source-age warnings remain at 72, with 16
fresh sources, and the 1,722-tile catalog and 876-rule PA surface are unchanged.
