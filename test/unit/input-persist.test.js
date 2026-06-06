// spec-v61 §2 A7: unit coverage for opt-in, client-only input persistence.
// Verifies the off-by-default contract, that only numeric/choice inputs are
// stored (never free-text / textarea / PHI), that opting out erases storage,
// and that restore is a no-op while disabled.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { installDom } from '../fixtures/dom-stub.js';
import { el } from '../../lib/dom.js';
import {
  isRememberEnabled, setRememberEnabled, saveInputs, applySavedInputs, hasPersistableInputs,
} from '../../lib/input-persist.js';

installDom();

// Minimal localStorage stub: a real Map behind the get/set/remove surface the
// module touches. Reset before each test for isolation.
function installStorage() {
  const map = new Map();
  globalThis.localStorage = {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => { map.set(String(k), String(v)); },
    removeItem: (k) => { map.delete(k); },
    get length() { return map.size; },
    _map: map,
  };
  return map;
}

// Build a tile body with a mix of persistable and PHI/free-text fields.
function makeBody() {
  const body = el('div', { id: 'tool-body' });
  body.appendChild(el('input', { id: 'weight', type: 'number', value: '70' }));
  body.appendChild(el('select', { id: 'band' }));
  body.querySelector('#band').value = 'adult';
  const cb = el('input', { id: 'esrd', type: 'checkbox' });
  cb.checked = true;
  body.appendChild(cb);
  body.appendChild(el('input', { id: 'patient-name', type: 'text', value: 'Jane Doe' }));
  body.appendChild(el('textarea', { id: 'notes', value: 'allergic to PCN' }));
  return body;
}

test('A7: feature is off by default - nothing is stored and nothing restores', () => {
  installStorage();
  assert.equal(isRememberEnabled(), false);
  const body = makeBody();
  saveInputs('demo', body);
  assert.equal(localStorage.length, 0, 'no key written while disabled');
  const filled = applySavedInputs(body, 'demo', new Set());
  assert.equal(filled.size, 0, 'restore is a no-op while disabled');
});

test('A7: enabling stores only numeric/choice inputs, never free-text or textarea', () => {
  const map = installStorage();
  setRememberEnabled(true);
  assert.equal(isRememberEnabled(), true);
  saveInputs('demo', makeBody());
  const saved = JSON.parse(map.get('sw-saved-inputs')).demo;
  assert.deepEqual(
    Object.keys(saved).sort(),
    ['band', 'esrd', 'weight'],
    'persists number/select/checkbox only',
  );
  assert.equal('patient-name' in saved, false, 'free-text not persisted (PHI)');
  assert.equal('notes' in saved, false, 'textarea not persisted (PHI)');
  assert.equal(saved.weight, '70');
  assert.equal(saved.band, 'adult');
  assert.equal(saved.esrd, '1');
});

test('A7: remembered values restore into a fresh body and respect the skip set', () => {
  installStorage();
  setRememberEnabled(true);
  saveInputs('demo', makeBody());

  const fresh = makeBody();
  fresh.querySelector('#weight').value = '';
  fresh.querySelector('#esrd').checked = false;
  // A deep-link hash already owns `weight`, so it must not be overwritten.
  const filled = applySavedInputs(fresh, 'demo', new Set(['weight']));
  assert.equal(fresh.querySelector('#weight').value, '', 'skipped field untouched');
  assert.equal(fresh.querySelector('#esrd').checked, true, 'checkbox restored');
  assert.ok(filled.has('esrd'));
  assert.ok(!filled.has('weight'));
});

test('A7: unchecking the toggle erases the stored inputs', () => {
  const map = installStorage();
  setRememberEnabled(true);
  saveInputs('demo', makeBody());
  assert.ok(map.has('sw-saved-inputs'));
  setRememberEnabled(false);
  assert.equal(isRememberEnabled(), false);
  assert.equal(map.has('sw-remember'), false);
  assert.equal(map.has('sw-saved-inputs'), false, 'opting out erases stored inputs');
});

test('A7: hasPersistableInputs detects numeric/choice inputs but ignores pure text bodies', () => {
  const numeric = el('div', {});
  numeric.appendChild(el('input', { id: 'x', type: 'number' }));
  assert.equal(hasPersistableInputs(numeric), true);

  const textOnly = el('div', {});
  textOnly.appendChild(el('input', { id: 'name', type: 'text' }));
  textOnly.appendChild(el('textarea', { id: 'free' }));
  assert.equal(hasPersistableInputs(textOnly), false);
});
