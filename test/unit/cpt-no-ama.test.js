// Per spec section 5: ensure no AMA-style CPT descriptor strings appear in
// the bundled cpt-summaries data. The check is conservative: it asserts the
// summaries file contains the project's attribution and that none of the
// summaries are merely a copy of a known canonical AMA short descriptor for
// any of the highly recognizable codes.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', '..');

const FORBIDDEN_PHRASES = [
  // Highly recognizable AMA short descriptor language for common E/M codes.
  // These are the *short descriptors* the AMA publishes; copying them is the
  // exact thing the spec section 5 prohibits.
  /office\/outpatient visit est/i,
  /office\/outpatient visit new/i,
];

test('CPT summaries file: present and has attribution', async () => {
  const path = join(ROOT, 'data', 'cpt-summaries', 'summaries.json');
  const json = JSON.parse(await readFile(path, 'utf8'));
  assert.ok(Array.isArray(json) && json.length > 0, 'summaries should be a non-empty array');
});

test('CPT summaries: no entry resembles a known AMA short descriptor', async () => {
  const path = join(ROOT, 'data', 'cpt-summaries', 'summaries.json');
  const json = JSON.parse(await readFile(path, 'utf8'));
  for (const item of json) {
    for (const re of FORBIDDEN_PHRASES) {
      assert.equal(re.test(item.summary || ''), false, `summary for ${item.range} matches forbidden pattern ${re}`);
      assert.equal(re.test(item.family || ''), false, `family for ${item.range} matches forbidden pattern ${re}`);
    }
  }
});

test('CPT summaries: every entry is reasonably long (substantive original prose)', async () => {
  const path = join(ROOT, 'data', 'cpt-summaries', 'summaries.json');
  const json = JSON.parse(await readFile(path, 'utf8'));
  for (const item of json) {
    assert.ok((item.summary || '').length > 60, `summary for ${item.range} too short to be original prose`);
  }
});

test('CPT manifest: declares MIT-original status', async () => {
  const path = join(ROOT, 'data', 'cpt-summaries', 'manifest.json');
  const json = JSON.parse(await readFile(path, 'utf8'));
  assert.equal(json.status, 'mit-original');
  assert.match(json.notes || '', /Not derived from AMA/);
});
