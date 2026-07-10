// spec-v283: US-customary unit defaults. The shared unit arrays keep the
// canonical unit as option 0 (identity converter) and tag the US-customary
// alternate (lb, in, °F) with `default: true`; unitField pre-selects the
// tagged option at render while unitNum still returns the canonical value.
// This guard pins both halves of the contract so a future edit can neither
// reorder the canonical option away from index 0 nor drop the US default.
//
// unitField/unitNum need a DOM; like derivation.test.js, a minimal stub
// document stands in (the full UI assertion lives in the Playwright
// unit-toggle spec).
import { test } from 'node:test';
import assert from 'node:assert/strict';

const byId = new Map();

function makeStubDocument() {
  byId.clear();
  return {
    createElement(tag) {
      const node = {
        tag,
        children: [],
        attrs: {},
        className: '',
        appendChild(c) {
          this.children.push(c);
          return c;
        },
        setAttribute(k, v) {
          this.attrs[k] = String(v);
          if (k === 'id') byId.set(String(v), this);
        },
        get textContent() { return this._text || ''; },
        set textContent(v) { this._text = v; },
      };
      if (tag === 'select') {
        node.selectedIndex = 0;
        Object.defineProperty(node, 'options', {
          get() { return this.children.filter((c) => c.tag === 'option'); },
        });
      }
      return node;
    },
    createTextNode(s) { return { text: String(s) }; },
    getElementById(id) { return byId.get(id) || null; },
  };
}

const originalDocument = globalThis.document;
globalThis.document = makeStubDocument();
const { WEIGHT_UNITS, HEIGHT_UNITS, TEMP_UNITS, GLUCOSE_UNITS, unitField, unitNum } =
  await import('../../lib/field-units.js');
if (originalDocument) globalThis.document = originalDocument;
else delete globalThis.document;

function withStubDocument(fn) {
  const prev = globalThis.document;
  globalThis.document = makeStubDocument();
  try {
    return fn();
  } finally {
    if (prev) globalThis.document = prev;
    else delete globalThis.document;
  }
}

// --- 1. Array-shape guard (tasks 1.2 / 5.2) ------------------------------

const US_DEFAULTS = [
  ['WEIGHT_UNITS', WEIGHT_UNITS, 'lb'],
  ['HEIGHT_UNITS', HEIGHT_UNITS, 'in'],
  ['TEMP_UNITS', TEMP_UNITS, '°F'],
];

for (const [name, units, usUnit] of US_DEFAULTS) {
  test(`${name}: canonical option 0 is the identity converter and ${usUnit} is the tagged default`, () => {
    assert.equal(units[0].toCanonical(123.456), 123.456, 'option 0 must be canonical (identity)');
    assert.equal(units[0].default, undefined, 'the canonical option must not be the default');
    const tagged = units.filter((u) => u.default === true);
    assert.equal(tagged.length, 1, 'exactly one default-tagged option');
    assert.equal(tagged[0].unit, usUnit);
  });
}

test('GLUCOSE_UNITS stays US-conventional by position: mg/dL is option 0 and nothing is tagged', () => {
  assert.equal(GLUCOSE_UNITS[0].unit, 'mg/dL');
  assert.equal(GLUCOSE_UNITS[0].toCanonical(9.9), 9.9);
  assert.equal(GLUCOSE_UNITS.filter((u) => u.default).length, 0);
});

// --- 2. unitField renders with the US default selected (task 1.3) --------

test('unitField(WEIGHT_UNITS) pre-selects lb and unitNum converts back to kg', () => {
  withStubDocument(() => {
    unitField('Weight', 'w', WEIGHT_UNITS);
    const sel = document.getElementById('w-unit');
    assert.equal(sel.selectedIndex, 1, 'lb (index 1) is pre-selected');
    assert.equal(sel.options[0].attrs.value, 'kg', 'canonical kg stays option 0');
    document.getElementById('w').value = '154.324';
    const kg = unitNum('w');
    assert.ok(Math.abs(kg - 70) < 0.001, `lb entry converts to kg (got ${kg})`);
  });
});

test('unitField(TEMP_UNITS) pre-selects °F and unitNum returns °C', () => {
  withStubDocument(() => {
    unitField('Temperature', 't', TEMP_UNITS);
    const sel = document.getElementById('t-unit');
    assert.equal(sel.selectedIndex, 1, '°F (index 1) is pre-selected');
    document.getElementById('t').value = '98.6';
    const c = unitNum('t');
    assert.ok(Math.abs(c - 37) < 0.001, `°F entry converts to °C (got ${c})`);
  });
});

test('unitField with an untagged array (GLUCOSE_UNITS) keeps option 0 selected', () => {
  withStubDocument(() => {
    unitField('Glucose', 'g', GLUCOSE_UNITS);
    const sel = document.getElementById('g-unit');
    assert.equal(sel.selectedIndex, 0);
  });
});

// --- 3. The applyExample reset contract ----------------------------------
// applyExample (app.js) sets selectedIndex = 0 before filling a documented
// example; option 0 must then read the raw value unchanged.

test('resetting the select to option 0 restores canonical reads (the applyExample contract)', () => {
  withStubDocument(() => {
    unitField('Weight', 'w', WEIGHT_UNITS);
    const sel = document.getElementById('w-unit');
    sel.selectedIndex = 0;
    document.getElementById('w').value = '70';
    assert.equal(unitNum('w'), 70, 'canonical option reads the example value unchanged');
  });
});
