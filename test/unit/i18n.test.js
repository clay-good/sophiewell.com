// spec-v1543 acceptance, with the owner's decision of 2026-10-03: the language layer ships with English
// only and changes nothing visible; a planted French catalog proves a translation plugs in, that a stale
// one falls back to English, and that no message carries a digit.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { t, addMessages, setLanguage, getLanguage, SHIPPED, _catalogs } from '../../lib/i18n.js';
import { MESSAGES } from '../../lib/i18n/en/offline-status.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

test('English is the only language shipped, and choosing another is refused', () => {
  assert.deepEqual(SHIPPED, ['en']);
  assert.equal(setLanguage('fr'), false);
  assert.equal(getLanguage(), 'en');
  assert.equal(t('offline-status', 'saving', { pct: 40 }), 'Saving for offline use... 40%.');
  assert.throws(() => t('offline-status', 'nope'), /no English message offline-status\.nope/);
});

test('a translation plugs in by namespace; a stale or missing one shows the English', () => {
  addMessages('fr', 'offline-status', {
    saved: { text: 'Enregistré pour une utilisation hors ligne.', source: MESSAGES.saved },
    saving: { text: 'Enregistrement hors ligne... {pct} %.', source: MESSAGES.saving },
    update: { text: 'Une mise à jour est prête.', source: 'An update is ready.' },
  });
  assert.equal(t('offline-status', 'saved', {}, 'fr'), 'Enregistré pour une utilisation hors ligne.');
  assert.equal(t('offline-status', 'saving', { pct: 40 }, 'fr'), 'Enregistrement hors ligne... 40 %.', 'the number comes from the code');
  assert.equal(t('offline-status', 'update', {}, 'fr'), MESSAGES.update, 'translated from older English: stale, so English');
  assert.equal(t('offline-status', 'mayClear', {}, 'fr'), MESSAGES.mayClear, 'not translated: English');
});

const digits = (text) => String(text).replace(/\{\w+\}/g, '').match(/\d/);

test('no message, in any language file, carries a number outside a placeholder', async () => {
  const dir = join(ROOT, 'lib', 'i18n');
  for (const lang of readdirSync(dir)) for (const f of readdirSync(join(dir, lang))) await import(join(dir, lang, f));
  const offenders = [];
  for (const [lang, nss] of _catalogs()) {
    for (const [ns, msgs] of nss) {
      for (const [k, v] of Object.entries(msgs)) {
        const text = typeof v === 'string' ? v : v.text;
        if (digits(text)) offenders.push(`${lang} ${ns}.${k}: "${text}"`);
      }
    }
  }
  assert.deepEqual(offenders, []);
  assert.ok(digits('Give 2 tablets'), 'the check catches a planted number');
  assert.equal(digits('Give {n} tablets'), null);
});

test('every shipped language other than English has a signed-off row in docs/translations.md', () => {
  const doc = readFileSync(join(ROOT, 'docs', 'translations.md'), 'utf8');
  for (const lang of SHIPPED.filter((l) => l !== 'en')) {
    const row = doc.split('\n').find((l) => l.split('|').map((c) => c.trim())[2] === lang);
    assert.ok(row, `${lang} is shipped with no row in docs/translations.md`);
    assert.match(row.split('|').map((c) => c.trim())[7] || '', /^\d{4}-\d{2}-\d{2}$/, `${lang} has no sign-off date`);
  }
});
