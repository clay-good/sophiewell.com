# spec-v1265 — separate NPI syntax from provider-role assumptions

The NPI checksum was correct, but two PA findings promised more than the
implementation or the CMS standard could establish. The syntax rule described
its valid identifier as the ordering provider even though the extractor does
not infer roles. The second-NPI rule then flagged every one-provider packet,
including ordinary office requests where a separate servicing entity was never
named.

`R-PA-016` now says exactly what it proves: at least one 10-digit provider NPI
has the CMS Luhn check digit calculated as if the `80840` issuer prefix were
present. It continues to state that checksum validity does not prove NPPES
registry membership. `R-PA-019` now asks for a second distinct NPI only when the
packet names a separate servicing facility or uses an institutional place of
service. Single-provider office packets pass without an unsupported warning.

Regression tests preserve the CMS worked checksum example, pin the narrower
syntax wording, and cover both the institutional flag and office pass. The CMS
NPI standard was reread on 2026-09-14; the ledger now links its canonical CMS
page. The generated browser ledger, PA audit snapshots, and SBOM are refreshed
together. This reduces source-age warnings from 77 to 76 without changing the
1,722-tile catalog or the 876-rule PA surface.
