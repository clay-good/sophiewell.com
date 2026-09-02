// spec-v984: the gate reported "clean" while the defect it exists to catch was
// present.
//
// check-issue-templates split the body on the literal `\n  - type: `, which is
// two spaces because that is how these files happen to be written. Four-space
// indentation is equally valid YAML, and under it the split matched nothing, the
// per-field loop never ran, and a form with a required field and NO `id:` passed.
// GitHub discards that field's answer at runtime, which is the whole reason the
// check exists.
//
// It had no test because the module ran its check, and could `process.exit(1)`,
// at import. Both are fixed; this is the test that was not possible before.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { bodyFields } from '../../scripts/check-issue-templates.mjs';

const twoSpace = `name: A form
description: Something
body:
  - type: markdown
    attributes:
      value: hello
  - type: input
    id: where
    attributes:
      label: Where
  - type: textarea
    attributes:
      label: Detail
`;

const fourSpace = `name: A form
description: Something
body:
    - type: input
      id: where
      attributes:
        label: Where
    - type: textarea
      attributes:
        label: Detail
`;

test('fields are read at two-space indentation', () => {
  const f = bodyFields(twoSpace);
  assert.deepEqual(f.map((x) => [x.type, x.hasId]), [['markdown', false], ['input', true], ['textarea', false]]);
});

test('and at four-space indentation, which is the bug this replaces', () => {
  const f = bodyFields(fourSpace);
  assert.deepEqual(f.map((x) => [x.type, x.hasId]), [['input', true], ['textarea', false]]);
  // The old split returned [] here, so a missing id went unreported.
  assert.notEqual(f.length, 0);
});

test('a nested list inside a field is not mistaken for a field', () => {
  const withOptions = `name: A form
description: Something
body:
  - type: dropdown
    id: pick
    attributes:
      label: Pick
      options:
        - type: one
        - type: two
`;
  const f = bodyFields(withOptions);
  assert.deepEqual(f.map((x) => x.type), ['dropdown']);
  assert.equal(f[0].hasId, true);
});

test('an id nested deeper than the field is not the field id', () => {
  const nested = `name: A form
description: Something
body:
  - type: input
    attributes:
      label: Where
      id: not-the-field-id
`;
  assert.equal(bodyFields(nested)[0].hasId, false);
});

test('no body: at all is distinguishable from an empty body', () => {
  assert.equal(bodyFields('name: x\ndescription: y\n'), null);
  assert.deepEqual(bodyFields('name: x\ndescription: y\nbody:\n'), []);
});

test('reading stops at the next top-level key', () => {
  const trailing = `name: A form
description: Something
body:
  - type: input
    id: a
labels: ["bug"]
`;
  assert.deepEqual(bodyFields(trailing).map((x) => x.type), ['input']);
});

test('the live templates all give every field an id', () => {
  const dir = new URL('../../.github/ISSUE_TEMPLATE/', import.meta.url);
  const forms = readdirSync(dir).filter((f) => f.endsWith('.yml') && !f.startsWith('config.'));
  assert.ok(forms.length >= 4);
  for (const f of forms) {
    const fields = bodyFields(readFileSync(new URL(f, dir), 'utf8'));
    assert.ok(fields && fields.length, `${f}: no fields parsed`);
    for (const fld of fields) {
      if (fld.type === 'markdown') continue;
      assert.ok(fld.hasId, `${f}: a "${fld.type}" field has no id`);
    }
  }
});
