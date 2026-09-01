// spec-v969: a labelled source link must be allowed to wrap.
//
// `citationUrls` renders the label as the link text, so a link's width is a
// data value: it grows with the paper's name. Both citation-link rules carried
// `white-space: nowrap` (and the in-app one `display: inline-block`), which
// forbade the label the line breaks its own spaces offered, so a 37-character
// label pushed a 320px page to 337px and a 40-character one to 361px. Nothing
// local caught it -- lint, unit and build were all clean -- and it failed the
// two chromium 320px sweeps in CI an hour later.
//
// The fix is structural: let the label wrap at its spaces and let a bare URL
// break anywhere. This pins that, so the nowrap cannot come back and take the
// mobile sweeps with it.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { META } from '../../lib/meta.js';

const ROOT = join(fileURLToPath(import.meta.url), '..', '..', '..');
const CSS = readFileSync(join(ROOT, 'styles.css'), 'utf8');

// block(selector) -> the declarations inside that rule, or ''.
function block(selector) {
  const i = CSS.indexOf(selector + ' {');
  if (i === -1) return '';
  return CSS.slice(i, CSS.indexOf('}', i));
}

for (const selector of ['.tool-page .tp-citation-link', '.tool-meta .citation-link']) {
  test(`${selector}: the label may wrap`, () => {
    const rule = block(selector);
    assert.notEqual(rule, '', `${selector} is gone; the wrapping guard no longer guards anything`);
    assert.doesNotMatch(rule, /white-space:\s*nowrap/,
      `${selector} forbids wrapping, so a long citation label overflows 320px`);
    assert.doesNotMatch(rule, /display:\s*inline-block/,
      `${selector} wraps atomically, so a long citation label overflows 320px`);
    assert.match(rule, /overflow-wrap:\s*anywhere/,
      `${selector} needs overflow-wrap so a bare URL breaks instead of overflowing`);
  });
}

test('citation labels stay short enough to read on a phone', () => {
  const long = [];
  for (const [id, m] of Object.entries(META)) {
    for (const e of m.citationUrls || []) {
      if (typeof e?.label === 'string' && e.label.length > 40) long.push(`${id}: ${e.label.length} chars`);
    }
  }
  assert.deepEqual(long, [], `citation labels over 40 characters:\n  - ${long.join('\n  - ')}`);
});
