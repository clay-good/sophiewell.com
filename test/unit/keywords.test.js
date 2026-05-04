// Unit tests for the deterministic keyword matcher.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { expandTags, selectQuestions, selectChecklist } from '../../lib/keywords.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', '..');

async function loadJson(rel) {
  return JSON.parse(await readFile(join(ROOT, rel), 'utf8'));
}

test('expandTags: includes "all" and the visit type', () => {
  const t = expandTags('annual physical', '');
  assert.ok(t.has('all'));
  assert.ok(t.has('annual physical'));
});

test('expandTags: maps cost-related keywords to cost tag', () => {
  const t = expandTags('', 'how much will this bill cost?');
  assert.ok(t.has('cost'));
});

test('expandTags: pregnancy adds prenatal tag', () => {
  const t = expandTags('', 'this is my first pregnancy');
  assert.ok(t.has('prenatal'));
});

test('expandTags: ignores unknown words', () => {
  const t = expandTags('', 'xyzzy plover');
  assert.deepEqual([...t].sort(), ['all']);
});

test('selectQuestions: empty visit / text returns "all"-tagged questions only', async () => {
  const bank = await loadJson('data/workflow/questions.json');
  const r = selectQuestions(bank, { visitType: '', freeText: '' });
  // At least one section returned and every question must carry the "all" tag.
  assert.ok(r.sections.length > 0);
  const allQ = bank.questions.filter((q) => (q.tags || []).includes('all'));
  const flat = r.sections.flatMap((s) => s.items);
  assert.equal(flat.length, allQ.length);
});

test('selectQuestions: pre-operative visit pulls in surgery-specific items', async () => {
  const bank = await loadJson('data/workflow/questions.json');
  const r = selectQuestions(bank, { visitType: 'pre-operative', freeText: '' });
  const flat = r.sections.flatMap((s) => s.items).join(' ');
  assert.match(flat, /recovery timeline|ride home/i);
});

test('selectQuestions: section filter restricts output', async () => {
  const bank = await loadJson('data/workflow/questions.json');
  const r = selectQuestions(bank, { visitType: 'follow-up', freeText: '', sections: ['Cost'] });
  for (const sec of r.sections) assert.equal(sec.section, 'Cost');
});

test('selectQuestions: deterministic - same input twice produces same output', async () => {
  const bank = await loadJson('data/workflow/questions.json');
  const a = selectQuestions(bank, { visitType: 'medication review', freeText: 'side effects?' });
  const b = selectQuestions(bank, { visitType: 'medication review', freeText: 'side effects?' });
  assert.deepEqual(a, b);
});

test('selectChecklist: returns the named procedure', async () => {
  const bank = await loadJson('data/workflow/prior-auth.json');
  const c = selectChecklist(bank, 'imaging-mri-msk');
  assert.ok(c);
  assert.equal(c.name, 'MRI, musculoskeletal');
  assert.ok(c.items.length > 0);
});

test('selectChecklist: unknown id returns null', async () => {
  const bank = await loadJson('data/workflow/prior-auth.json');
  assert.equal(selectChecklist(bank, 'no-such-procedure'), null);
});
