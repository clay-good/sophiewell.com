# Product decisions

## One calculation explanation

- **Date:** August 23, 2026
- **Status:** Accepted

Every calculator and tool exposes one closed-by-default disclosure named
"How this is calculated." It contains all available methodology and provenance:
the formula or derivation, interpretation guidance, citations, source links,
and dataset version details.

Do not add a separate citation or sources disclosure. Method and evidence
answer the same user question, and splitting them creates duplicate controls
and uncertainty about which one to open.

## No persistent input memory

- **Date:** August 23, 2026
- **Status:** Accepted

Calculator and tool views do not offer device-persistent input storage. Input
state may remain in the URL fragment for reloadable, shareable links, but the
application does not save calculator inputs in `localStorage`,
`sessionStorage`, IndexedDB, cookies, or a server.

This keeps the interface minimal, avoids an extra privacy decision during a
calculation, and preserves the site's client-side privacy model.
