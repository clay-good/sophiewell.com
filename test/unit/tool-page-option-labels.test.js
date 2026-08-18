// The worked example on `/tools/<id>/` prints what the reader would have
// picked on screen, not the raw `<option value>` the example stores. The
// option text lives only in `views/*.js`, so `scripts/lib/option-labels.mjs`
// reads it out of the view at build time.
//
// That extraction is source-text parsing, so it fails quiet: a view rewritten
// to build its select a different way stops resolving, and the page silently
// goes back to printing `onevaso` and `moderately-severe`. These tests are the
// gate on both halves -- that it still resolves as much as it did, and that it
// cannot resolve the wrong tile's options.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { META } from '../../lib/meta.js';
import { getCalculator } from '../../mcp/catalog.js';
import { loadOptionLabels, loadFieldLabels, optionText } from '../../scripts/lib/option-labels.mjs';

const YES_NO = new Set(['yes', 'no', 'true', 'false']);

// Every enum value a worked example sets, paired with the field it belongs to.
function enumExampleValues() {
  const out = [];
  for (const [id, meta] of Object.entries(META)) {
    const fields = meta?.example?.fields;
    if (!fields) continue;
    let rec = null;
    try { rec = getCalculator(id); } catch { rec = null; }
    if (!rec || !Array.isArray(rec.fields)) continue;
    const byDom = new Map(rec.fields.map((f) => [f.dom, f]));
    for (const [dom, raw] of Object.entries(fields)) {
      const field = byDom.get(dom);
      if (!field || field.kind !== 'enum') continue;
      const value = String(raw ?? '').trim();
      if (!value || YES_NO.has(value.toLowerCase())) continue;
      out.push({ id, field, value });
    }
  }
  return out;
}

// Measured when the extractor landed: 636 of 1,465 enum example values across
// the catalog resolve to the option text. The rest are selects whose options
// are built at render time from a lib constant, which is not statically
// readable; those keep printing the raw value, as they always did.
const MIN_RESOLVED = 636;

test('the option text still resolves for as many example values as it did', () => {
  const labels = loadOptionLabels();
  const resolved = enumExampleValues().filter(({ id, field, value }) => optionText(labels.get(id), field, value));
  assert.ok(
    resolved.length >= MIN_RESOLVED,
    `only ${resolved.length} enum example values resolve to option text, was ${MIN_RESOLVED}. ` +
      'A view was probably rewritten to build its select in a shape scripts/lib/option-labels.mjs does not read.',
  );
});

// A DOM id is unique inside a tile, not across the catalog. `lf-type` is a Le
// Fort fracture level in one tile and a Lisfranc injury pattern in another; a
// globally-keyed map would print one tile's options on the other tile's page.
test('option maps do not leak between tiles that share a DOM id', () => {
  const labels = loadOptionLabels();
  const leFort = labels.get('le-fort')?.get('lf-type');
  const lisfranc = labels.get('lisfranc-myerson')?.get('lf-type');
  assert.ok(leFort && lisfranc, 'both tiles should have their own lf-type options');
  assert.match(leFort.get('I'), /Le Fort/);
  assert.ok(!lisfranc.has('I'), 'the Lisfranc select must not carry the Le Fort options');
  assert.match(lisfranc.get('A'), /incongruity/);
});

// The guard that makes the extraction safe: a map is used only when it names
// every value the MCP registry declares for that field. A select that does not
// offer the declared values is not the select behind the field.
test('a map that does not cover the declared values is refused', () => {
  const field = { dom: 'x-grade', kind: 'enum', values: ['a', 'b', 'c'] };
  const partial = new Map([['x-grade', new Map([['a', 'Alpha'], ['b', 'Beta']])]]);
  const full = new Map([['x-grade', new Map([['a', 'Alpha'], ['b', 'Beta'], ['c', 'Gamma']])]]);
  assert.equal(optionText(partial, field, 'a'), null);
  assert.equal(optionText(full, field, 'a'), 'Alpha');
  assert.equal(optionText(full, field, 'zzz'), null);
});

// Every resolved label has to be readable on its own: a blank or duplicated
// option text names nothing.
test('resolved option text is distinct within its select', () => {
  const labels = loadOptionLabels();
  for (const { id, field } of enumExampleValues()) {
    const options = labels.get(id)?.get(field.dom);
    if (!options) continue;
    const declared = (field.values || []).map(String);
    if (!declared.every((v) => options.has(v))) continue;
    const texts = declared.map((v) => options.get(v).trim());
    assert.ok(texts.every(Boolean), `${id}/${field.dom} has a blank option text`);
    assert.equal(new Set(texts).size, texts.length, `${id}/${field.dom} has duplicate option text`);
  }
});

// --- Field labels for the tiles with no MCP adapter.
//
// Nineteen document builders, timers, and question flows have a worked example
// in META and no field registry to name its keys, so their pages printed no
// example at all. The label comes from the view instead. Same failure mode as
// above: a view rewritten into a shape the parser cannot read takes the
// example block off the page with no error.

// The tiles whose every example key resolves to a view label. Measured when
// the extraction landed; `mppr` is the one that does not, because it builds
// its row ids at render time.
const VIEW_LABELLED = [
  'appeal-letter', 'code-blue-clock', 'device-day-counter', 'discharge-instr', 'ems-doc',
  'ews-escalation', 'hipaa-roa', 'hipaa-auth', 'modifier-x-selector', 'roi', 'prep',
  'prior-auth', 'sbar-template', 'sepsis-bundle-clock', 'specialty-visit', 'unit-converter-v4',
  'wallet-card',
];

test('every adapterless tile with a view-derived example still resolves all of its keys', () => {
  const labels = loadFieldLabels();
  const broken = [];
  for (const id of VIEW_LABELLED) {
    const fields = META[id]?.example?.fields || {};
    const keys = Object.keys(fields);
    assert.ok(keys.length, `${id} lost its worked example`);
    const map = labels.get(id);
    const missing = keys.filter((dom) => !map?.get(dom));
    if (missing.length) broken.push(`${id}: ${missing.join(', ')}`);
  }
  assert.deepEqual(broken, [], `example keys with no view label:\n${broken.join('\n')}`);
});

// The pairing is what a parser gets wrong: reading the label off the call next
// door pairs a real id with a real label and prints a plausible lie. These are
// checked against the view by hand.
test('a view label names the field it was read from', () => {
  const labels = loadFieldLabels();
  assert.equal(labels.get('appeal-letter').get('al-denial'), 'Denial date');
  assert.equal(labels.get('appeal-letter').get('al-reason'), 'Denial reason from EOB');
  assert.equal(labels.get('sepsis-bundle-clock').get('sb-t0'), 'Sepsis recognition time T0');
  assert.equal(labels.get('roi').get('roi-dob'), 'DOB');
  assert.equal(labels.get('discharge-instr').get('di-dx'), 'Diagnosis');
  assert.equal(labels.get('wallet-card').get('wc-ec'), 'Emergency contact');
});
