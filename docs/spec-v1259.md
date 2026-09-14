# spec-v1259 — dependency security refresh

The root dependency audit reported a high-severity vulnerability in the libheif
build bundled through `sharp` 0.35.2 and Wrangler’s Miniflare dependency. It
also reported three moderate Hono advisories affecting static-file output,
deeply nested form parsing, and URL-fragment query parsing.

Wrangler is updated from 4.125.0 to 4.131.1, which brings the fixed Sharp line,
and both the root and MCP override Hono at 4.13.5 or newer. No unrelated major
dependency was upgraded. Both lockfiles were regenerated and audited after the
change.

No application behavior, calculator, citation, or catalog count changed.
