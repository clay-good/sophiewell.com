# v11 audit logs

This directory holds the per-tile audit logs that satisfy
[spec-v11 §3](../../spec-v11.md). One `<tile-id>.md` file per tile, in the
schema in spec-v11 §3.2. A tile is not audited until its log file exists,
is committed, and is PASS or PASS-WITH-FIXES.

- Generate a skeleton: `node scripts/audit-skeleton.mjs <tile-id>`
- Report coverage: `node scripts/audit-coverage.mjs`

Wave 0 ships this directory empty; subsequent waves fill it in
the spec-v11 §3.3 audit order.
