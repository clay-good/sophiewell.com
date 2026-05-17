// Unit tests for lib/artifact-handoff.js (spec-v7 section 3.1 handoff).

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  PRIMARY_INPUT_BY_TILE,
  setPendingDrop,
  consumePendingDrop,
  peekPendingDrop,
  applyPendingDrop,
  hasPasteInputForTile,
} from '../../lib/artifact-handoff.js';

// Minimal fake document/body for the apply path. Mirrors only the
// shapes applyPendingDrop touches (createElement, getElementById,
// querySelector, parentNode, appendChild).
function makeFakeDoc() {
  const elements = new Map();
  function makeNode(tag) {
    const node = {
      tagName: String(tag).toUpperCase(),
      _children: [],
      parentNode: null,
      attrs: {},
      textContent: '',
      className: '',
      setAttribute(k, v) { this.attrs[k] = String(v); },
      appendChild(child) { this._children.push(child); child.parentNode = this; return child; },
    };
    return node;
  }
  const doc = {
    createElement(tag) { return makeNode(tag); },
    getElementById(id) { return elements.get(id) || null; },
  };
  function addInput(id) {
    const node = makeNode('textarea');
    node.id = id;
    node.value = '';
    elements.set(id, node);
    return node;
  }
  function body() {
    return {
      querySelector(sel) {
        const m = /^#(.+)$/.exec(sel);
        if (!m) return null;
        const id = m[1].replace(/\\(.)/g, '$1');
        return elements.get(id) || null;
      },
    };
  }
  return { doc, addInput, body };
}

test('PRIMARY_INPUT_BY_TILE covers the three textarea-driven decoders', () => {
  assert.equal(PRIMARY_INPUT_BY_TILE.decoder, 'bill');
  assert.equal(PRIMARY_INPUT_BY_TILE['eob-decoder'], 'eob');
  assert.equal(PRIMARY_INPUT_BY_TILE['msn-decoder'], 'msn');
});

test('hasPasteInputForTile is true for mapped tiles and false otherwise', () => {
  assert.equal(hasPasteInputForTile('decoder'), true);
  assert.equal(hasPasteInputForTile('eob-decoder'), true);
  assert.equal(hasPasteInputForTile('lab-interpret'), false);
  assert.equal(hasPasteInputForTile('insurance'), false);
});

test('setPendingDrop/consumePendingDrop round-trip and clear after one consume', () => {
  setPendingDrop('decoder', 'BILL TEXT');
  assert.deepEqual(peekPendingDrop(), { tileId: 'decoder', text: 'BILL TEXT' });
  const got = consumePendingDrop('decoder');
  assert.deepEqual(got, { tileId: 'decoder', text: 'BILL TEXT' });
  assert.equal(consumePendingDrop('decoder'), null);
  assert.equal(peekPendingDrop(), null);
});

test('consumePendingDrop ignores tileId mismatch and leaves payload intact', () => {
  setPendingDrop('decoder', 'X');
  assert.equal(consumePendingDrop('eob-decoder'), null);
  assert.deepEqual(consumePendingDrop('decoder'), { tileId: 'decoder', text: 'X' });
});

test('setPendingDrop with empty text clears the slot', () => {
  setPendingDrop('decoder', 'something');
  setPendingDrop('decoder', '');
  assert.equal(peekPendingDrop(), null);
});

test('applyPendingDrop fills the textarea and appends a banner', () => {
  const { doc, addInput, body } = makeFakeDoc();
  const input = addInput('bill');
  setPendingDrop('decoder', 'DROPPED TEXT');
  const filled = applyPendingDrop('decoder', body(), { doc });
  assert.equal(filled, 'bill');
  assert.equal(input.value, 'DROPPED TEXT');
  // Banner appended to the input's parent (we set parentNode to a host)
  // Default branch picks input.parentNode; here parentNode is null on the
  // fake input (it was added to elements, not appended to a parent), so
  // pass an explicit bannerHost to verify the banner side-effect.
  const host = doc.createElement('div');
  setPendingDrop('decoder', 'AGAIN');
  applyPendingDrop('decoder', body(), { doc, bannerHost: host });
  assert.equal(host._children.length, 1);
  assert.equal(host._children[0].className, 'artifact-handoff-banner');
  assert.match(host._children[0].textContent, /Pre-filled from the document/);
});

test('applyPendingDrop is a no-op when nothing is pending', () => {
  const { doc, addInput, body } = makeFakeDoc();
  addInput('bill');
  // Nothing set.
  assert.equal(applyPendingDrop('decoder', body(), { doc }), null);
});

test('applyPendingDrop is a no-op for unmapped tile ids', () => {
  const { doc, addInput, body } = makeFakeDoc();
  addInput('bill');
  setPendingDrop('decoder', 'X');
  // Apply to a tile with no paste input.
  assert.equal(applyPendingDrop('lab-interpret', body(), { doc }), null);
  // Pending payload still there.
  assert.equal(peekPendingDrop().tileId, 'decoder');
});
