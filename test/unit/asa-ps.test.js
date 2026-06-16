// spec-v89 §2.3: ASA Physical Status classification (I-VI + E modifier).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { asaPs } from '../../lib/rheum-periop-v89.js';

test('class III elective renders ASA III', () => {
  const r = asaPs({ asaClass: 3, emergency: false });
  assert.equal(r.valid, true);
  assert.equal(r.display, 'ASA III');
  assert.equal(r.eApplied, false);
  assert.match(r.definition, /severe systemic disease/);
});

test('E modifier appends -E on a valid class', () => {
  const r = asaPs({ asaClass: 3, emergency: true });
  assert.equal(r.display, 'ASA III-E');
  assert.equal(r.eApplied, true);
  assert.equal(r.eSuppressed, false);
});

test('E modifier is NOT assignable to ASA I', () => {
  const r = asaPs({ asaClass: 1, emergency: true });
  assert.equal(r.display, 'ASA I'); // no -E
  assert.equal(r.eApplied, false);
  assert.equal(r.eSuppressed, true);
});

test('E modifier is NOT assignable to ASA VI', () => {
  const r = asaPs({ asaClass: 6, emergency: true });
  assert.equal(r.display, 'ASA VI');
  assert.equal(r.eApplied, false);
  assert.equal(r.eSuppressed, true);
});

test('E modifier valid on classes II-V', () => {
  for (const c of [2, 3, 4, 5]) {
    const r = asaPs({ asaClass: c, emergency: true });
    assert.match(r.display, /-E$/, `class ${c} should carry -E`);
    assert.equal(r.eApplied, true);
  }
});

test('emergency accepts the string "yes"/"on"', () => {
  assert.equal(asaPs({ asaClass: 2, emergency: 'yes' }).eApplied, true);
  assert.equal(asaPs({ asaClass: 2, emergency: 'on' }).eApplied, true);
});

test('each class returns its definition and examples', () => {
  for (const c of [1, 2, 3, 4, 5, 6]) {
    const r = asaPs({ asaClass: c });
    assert.ok(r.definition.length > 0);
    assert.ok(r.examples.length > 0);
  }
});

test('out-of-range or blank class -> select-the-class fallback', () => {
  assert.equal(asaPs({ asaClass: 0 }).valid, false);
  assert.equal(asaPs({ asaClass: 7 }).valid, false);
  assert.equal(asaPs({}).valid, false);
  assert.equal(asaPs({ asaClass: 3.5 }).valid, false);
});
