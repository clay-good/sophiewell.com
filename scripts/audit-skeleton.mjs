#!/usr/bin/env node
// spec-v11 §3.4: emit a pre-filled audit-log skeleton for a tile so the
// auditor types only the findings, not the format. Pure Node, no
// dependencies, consistent with the spec-v10 §2.2 dependency budget.
//
// Usage: node scripts/audit-skeleton.mjs <tile-id>
//
// Writes `docs/audits/v11/<tile-id>.md` if absent. Refuses to overwrite
// an existing log so audit progress is never silently clobbered.

import { mkdir, writeFile, access } from 'node:fs/promises';
import { constants } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { META } from '../lib/meta.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const AUDIT_DIR = join(ROOT, 'docs', 'audits', 'v11');

function today() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

function template(tileId, citation) {
  return `# v11 audit - ${tileId}

- Auditor: <name or initials>
- Date: ${today()}
- Citation re-verified against: ${citation || '<source, edition or access date>'}

## Boundary examples added
- low: <inputs -> expected>
- mid: <inputs -> expected>
- high: <inputs -> expected>

## Cross-implementation differential
- Reference implementation: <name, URL or citation>
- Test case: <inputs>
- Sophie result: <value>
- Reference result: <value>
- Delta: <%, with PASS/FAIL>

## Edge-input handling notes
- <observations + fixes if any>

## A11y / keyboard notes
- <observations + fixes if any>

## Defects opened
- <link to GitHub issue, or "none">

## Status
- PASS  /  FAIL (defect open)  /  PASS-WITH-FIXES (fixes shipped this PR)
`;
}

async function main() {
  const tileId = process.argv[2];
  if (!tileId) {
    console.error('Usage: node scripts/audit-skeleton.mjs <tile-id>');
    process.exit(2);
  }
  if (!META[tileId]) {
    console.error(`audit-skeleton: no META entry for "${tileId}". Aborting.`);
    process.exit(2);
  }
  await mkdir(AUDIT_DIR, { recursive: true });
  const out = join(AUDIT_DIR, `${tileId}.md`);
  try {
    await access(out, constants.F_OK);
    console.error(`audit-skeleton: ${out} already exists. Refusing to overwrite.`);
    process.exit(1);
  } catch {
    // expected: file does not exist
  }
  const citation = META[tileId].citation || '';
  await writeFile(out, template(tileId, citation), 'utf8');
  console.log(`wrote ${out}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
