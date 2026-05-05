import { test } from 'node:test';
import assert from 'node:assert/strict';
import { installDom, makeDiv } from '../fixtures/dom-stub.js';

installDom();

const { traverseTree, encodePath, decodePath, renderDecisionTree } = await import('../../lib/tree.js');

const sampleTree = {
  question: 'Wound type?',
  options: [
    { label: 'Clean minor', next: {
      question: 'Tdap in last 10 years?',
      options: [
        { label: 'Yes', result: 'No prophylaxis indicated.', rationale: 'CDC tetanus chart row 1.' },
        { label: 'No',  result: 'Td/Tdap indicated.', rationale: 'CDC tetanus chart row 2.' },
      ],
    } },
    { label: 'Dirty', next: {
      question: 'Tdap in last 5 years?',
      options: [
        { label: 'Yes', result: 'No prophylaxis indicated.' },
        { label: 'No',  result: 'Td/Tdap + TIG indicated.' },
      ],
    } },
  ],
};

test('traverseTree: empty path returns root', () => {
  const r = traverseTree(sampleTree, []);
  assert.equal(r.atResult, false);
  assert.equal(r.node.question, 'Wound type?');
  assert.deepEqual(r.history, []);
});

test('traverseTree: terminal path returns result and history', () => {
  const r = traverseTree(sampleTree, [0, 1]);
  assert.equal(r.atResult, true);
  assert.equal(r.node.result, 'Td/Tdap indicated.');
  assert.deepEqual(r.history, [
    { question: 'Wound type?', choice: 'Clean minor' },
    { question: 'Tdap in last 10 years?', choice: 'No' },
  ]);
});

test('traverseTree: invalid index returns null node', () => {
  const r = traverseTree(sampleTree, [99]);
  assert.equal(r.node, null);
  assert.equal(r.invalidAt, 0);
});

test('encodePath/decodePath: round-trip', () => {
  const p = [0, 2, 1];
  assert.deepEqual(decodePath(encodePath(p)), p);
});

test('decodePath: empty string yields empty array', () => {
  assert.deepEqual(decodePath(''), []);
});

test('decodePath: drops non-integer tokens', () => {
  assert.deepEqual(decodePath('0,abc,1'), [0, 1]);
});

test('renderDecisionTree: renders root question and options', () => {
  const root = makeDiv();
  globalThis.window.location.hash = '';
  renderDecisionTree(root, sampleTree);
  const h2 = root.querySelector('h2');
  assert.equal(h2.textContent, 'Wound type?');
  const buttons = root.querySelectorAll('button');
  // Two option buttons (no Back/Restart at root).
  const labels = buttons.map((b) => b.textContent);
  assert.ok(labels.includes('Clean minor'));
  assert.ok(labels.includes('Dirty'));
  assert.ok(!labels.includes('Back'));
});

test('renderDecisionTree: clicking advances to next question', () => {
  const root = makeDiv();
  globalThis.window.location.hash = '';
  renderDecisionTree(root, sampleTree);
  const opts = root.querySelectorAll('.tree-option');
  opts[0].click();
  const q = root.querySelector('.tree-question');
  assert.equal(q.textContent, 'Tdap in last 10 years?');
  // Back button now appears.
  const backs = root.querySelectorAll('.tree-back');
  assert.equal(backs.length, 1);
});

test('renderDecisionTree: terminal click renders result with rationale and path', () => {
  const root = makeDiv();
  globalThis.window.location.hash = '';
  renderDecisionTree(root, sampleTree);
  root.querySelectorAll('.tree-option')[0].click();
  root.querySelectorAll('.tree-option')[1].click();
  const text = root.textContent;
  assert.ok(text.includes('Td/Tdap indicated.'));
  assert.ok(text.includes('CDC tetanus chart row 2.'));
  assert.ok(text.includes('Wound type?'));
  assert.ok(text.includes('Clean minor'));
});
