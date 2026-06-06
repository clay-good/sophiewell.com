// spec-v11 §3.5: every file under `docs/audits/v11/` must parse to the
// schema in spec-v11 §3.2. The audit log is the contract; if its format
// drifts, the audit isn't auditable.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const AUDIT_DIR = resolve(__dirname, '..', '..', 'docs', 'audits', 'v11');

const REQUIRED_SECTIONS = [
  '## Boundary examples added',
  '## Cross-implementation differential',
  '## Edge-input handling notes',
  '## A11y / keyboard notes',
  '## Defects opened',
  '## Status',
];

const ALLOWED_STATUS = new Set(['PASS', 'FAIL', 'PASS-WITH-FIXES']);

test('audit-format: every docs/audits/v11/<tile>.md parses to the spec-v11 §3.2 schema', async () => {
  if (!existsSync(AUDIT_DIR)) return; // Wave 0 ships an empty dir.
  const entries = await readdir(AUDIT_DIR);
  const failures = [];
  for (const name of entries) {
    if (!name.endsWith('.md')) continue;
    if (name === 'README.md') continue;
    // Underscore-prefixed files are meta/non-tile artifacts (e.g. the
    // spec-v53 hardening log `_hardening-v53.md`), not per-tile audits, so
    // they are not held to the per-tile spec-v11 §3.2 schema. Tile audits are
    // named `<tile-id>.md` and never start with an underscore.
    if (name.startsWith('_')) continue;
    const body = await readFile(join(AUDIT_DIR, name), 'utf8');
    if (!body.match(/^# v11 audit /m)) {
      failures.push(`${name}: missing "# v11 audit ..." heading`);
      continue;
    }
    if (!body.match(/- Auditor: /)) failures.push(`${name}: missing Auditor line`);
    if (!body.match(/- Date: /)) failures.push(`${name}: missing Date line`);
    if (!body.match(/- Citation re-verified against: /)) {
      failures.push(`${name}: missing Citation re-verified line`);
    }
    for (const section of REQUIRED_SECTIONS) {
      if (!body.includes(section)) failures.push(`${name}: missing section "${section}"`);
    }
    const statusMatch = body.match(/## Status\s*[\r\n]+- ([A-Z][A-Z-]+)/);
    if (!statusMatch) {
      failures.push(`${name}: Status section must list one of PASS / FAIL / PASS-WITH-FIXES`);
    } else if (!ALLOWED_STATUS.has(statusMatch[1].trim())) {
      failures.push(`${name}: Status "${statusMatch[1]}" is not one of PASS / FAIL / PASS-WITH-FIXES`);
    }
  }
  assert.deepEqual(failures, [], `audit-format failures:\n  - ${failures.join('\n  - ')}`);
});
