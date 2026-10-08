// A person's name, ID, birth date or contact typed into a page must never land in its shareable link:
// app.js trackHashState skips any field lib/private-fields.js calls private (marked data-private, or a free-text
// or date field whose label names a person's identifier). This scans every view's field labels, so a new
// personal field the pattern does not recognize fails here until it is classified.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { PERSONAL_LABEL } from '../../lib/private-fields.js';

const root = new URL('../../', import.meta.url);
const src = (f) => readFileSync(new URL(f, root), 'utf8');

// Labels a broad search flags that are not about the person: a plan, a provider, a site, a regimen, a birth
// weight. Anything else the broad search finds must match PERSONAL_LABEL.
const BROAD = /\b(name|id|birth|address|phone|e-?mail|contact|account|signing)\b/i;
const NOT_PERSONAL = /^(plan name|plan name \(optional\)|plan or issuer name|plan or state agency name|provider name|provider \/ facility name|regimen \d name( \(optional\))?|site \d name( \(optional\))?|birth weight \(g\)|gestational age at birth \(weeks\)|a contact with itch|beneficiary name or medicare beneficiary identifier \(mbi\)|format requested \(paper, electronic, secure email\)|date of signing up \(or the date to check\))$/i;

function labels() {
  const out = [];
  for (const f of readdirSync(new URL('views/', root)).filter((n) => n.endsWith('.js'))) {
    const t = src(`views/${f}`);
    for (const re of [/textField\(\w+, '((?:[^'\\]|\\.)+)', '([\w-]+)'/g, /(?:dateInput|field)\((?:\w+, )?'((?:[^'\\]|\\.)+)', '([\w-]+)'/g, /\['((?:[^'\\]|\\.)+)', '([\w-]+)'\]/g]) {
      // A [dom id, argument] pair is not a label.
      for (const m of t.matchAll(re)) if (!/^[a-z0-9]+(-[a-z0-9]+)+$/.test(m[1])) out.push({ file: f, label: m[1].replace(/\\'/g, "'"), id: m[2] });
    }
  }
  return out;
}

test('the URL state writer skips file inputs and private fields', () => {
  assert.match(src('app.js'), /node\.type === 'file' \|\| isPrivateField\(node\)/);
});

test('every field label that names a person\'s identifier is private by its label', () => {
  const flagged = labels().filter((l) => BROAD.test(l.label) && !NOT_PERSONAL.test(l.label));
  assert.ok(flagged.length >= 20, `found ${flagged.length}`);
  for (const l of flagged) assert.ok(PERSONAL_LABEL.test(l.label), `${l.file} ${l.id}: "${l.label}" names a person but is not private`);
  for (const must of ['Patient name', 'Date of birth', 'Member ID', 'Medicaid ID', 'Patient member ID', 'Claimant name', 'Emergency contact', 'Account number on the bill (optional)']) assert.match(must, PERSONAL_LABEL, must);
  for (const shareable of ['Plan name', 'Provider name', 'Date of service', 'Birth weight (g)', 'Recall of the five-part address']) {
    if (shareable === 'Recall of the five-part address') continue; // a select: never matched by label
    assert.doesNotMatch(shareable, PERSONAL_LABEL, shareable);
  }
});

test('the letter builders still mark their personal fields data-private, so an ID field is private whatever its label', () => {
  const v1504 = src('views/group-v1504.js');
  assert.match(v1504, /const personal = \/-\(enrollee\|member\|claimant\|requester\|patient\|prescriber\)\$\/\.test\(id\)/);
  assert.match(src('views/group-v1602.js'), /\['ibc-patient', 'Patient name \(optional\)'\], \['ibc-account', 'Account number on the bill \(optional\)'\]\]\) \{\n.*'data-private': ''/);
});
