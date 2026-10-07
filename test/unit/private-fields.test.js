// A person's name, ID, birth date or contact typed into a letter must never land in the page's shareable
// link: app.js trackHashState skips a file input and any field marked data-private. This checks the source
// of every view that asks for one, so a new personal field without the mark fails here.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const PERSONAL = /\b(patient name|enrollee name|claimant name|member id|dob|date of birth|emergency contact|account number|name of the enrollee|prescriber name)\b/i;
const src = (f) => readFileSync(new URL(`../../${f}`, import.meta.url), 'utf8');

test('the URL state writer skips file inputs and data-private fields', () => {
  assert.match(src('app.js'), /node\.type === 'file' \|\| node\.hasAttribute\('data-private'\)/);
});

test('every personal text field in the letter builders is marked data-private', () => {
  const v1504 = src('views/group-v1504.js');
  const rule = new RegExp(v1504.match(/const personal = (\/[^/]+\/)/)[1].slice(1, -1));
  const fields = [...v1504.matchAll(/textField\(root, '([^']+)', '([^']+)'/g)].map(([, label, id]) => ({ label, id }));
  const personal = fields.filter((f) => PERSONAL.test(f.label));
  assert.ok(personal.length >= 15, `found ${personal.length}`);
  for (const f of personal) assert.ok(rule.test(f.id), `${f.id} (${f.label}) is not private`);
  assert.ok(!rule.test('prr-plan') && !rule.test('prr-drug'), 'plan and drug stay shareable');

  const h = src('views/group-h.js');
  const ids = new Set(JSON.parse(h.match(/const PRIVATE_IDS = new Set\((\[[^\]]+\])\)/)[1].replace(/'/g, '"')));
  for (const [, label, id] of h.matchAll(/\['([^']+)', '([a-z]+-[a-z]+)'\]/g)) if (PERSONAL.test(label)) assert.ok(ids.has(id), `${id} (${label}) is not private`);

  const ibc = src('views/group-v1602.js');
  assert.match(ibc, /\['ibc-patient', 'Patient name \(optional\)'\], \['ibc-account', 'Account number on the bill \(optional\)'\]\]\) \{\n.*'data-private': ''/);
});
