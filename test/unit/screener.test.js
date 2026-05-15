import { test } from 'node:test';
import assert from 'node:assert/strict';
import { installDom, makeDiv } from '../fixtures/dom-stub.js';

installDom();

const { scoreScreener, bandFor, isComplete, serializeAnswers, parseAnswers, renderScreener } =
  await import('../../lib/screener.js');

const phq2Items = [
  { prompt: 'Little interest or pleasure?', options: [
    { label: 'Not at all', value: 0 }, { label: 'Several days', value: 1 },
    { label: 'More than half', value: 2 }, { label: 'Nearly every day', value: 3 },
  ] },
  { prompt: 'Feeling down?', options: [
    { label: 'Not at all', value: 0 }, { label: 'Several days', value: 1 },
    { label: 'More than half', value: 2 }, { label: 'Nearly every day', value: 3 },
  ] },
];
const bands = [
  { min: 0, max: 2, label: 'Negative' },
  { min: 3, max: 6, label: 'Positive', advisory: 'Consider PHQ-9 follow-up.' },
];

test('scoreScreener: sums numeric answers', () => {
  assert.equal(scoreScreener(phq2Items, [2, 3]), 5);
});

test('scoreScreener: ignores blanks but throws on non-numeric', () => {
  assert.equal(scoreScreener(phq2Items, [null, 2]), 2);
  assert.throws(() => scoreScreener(phq2Items, ['x', 1]));
});

test('bandFor: matches inclusive range', () => {
  assert.equal(bandFor(bands, 0).label, 'Negative');
  assert.equal(bandFor(bands, 2).label, 'Negative');
  assert.equal(bandFor(bands, 3).label, 'Positive');
  assert.equal(bandFor(bands, 99), null);
});

test('isComplete: false until every item is answered', () => {
  assert.equal(isComplete(phq2Items, [null, null]), false);
  assert.equal(isComplete(phq2Items, [0, null]), false);
  assert.equal(isComplete(phq2Items, [0, 0]), true);
});

test('serializeAnswers / parseAnswers: round-trip with blanks preserved', () => {
  const a = [0, null, 2];
  const round = parseAnswers(serializeAnswers(a));
  assert.equal(round[0], '0');
  assert.equal(round[1], null);
  assert.equal(round[2], '2');
});

test('renderScreener: shows notice and items', () => {
  const root = makeDiv();
  globalThis.window.location.hash = '';
  renderScreener(root, { id: 'phq2', items: phq2Items, severityBands: bands, citation: 'Kroenke 2003.' });
  assert.ok(root.textContent.includes('Screening, not diagnosis'));
  assert.equal(root.querySelectorAll('fieldset').length, 2);
  // 4 radio inputs per item.
  assert.equal(root.querySelectorAll('input').length, 8);
});

test('renderScreener: live-renders score and band when all items answered', () => {
  const root = makeDiv();
  globalThis.window.location.hash = '';
  const api = renderScreener(root, { id: 'phq2', items: phq2Items, severityBands: bands, citation: 'x' });
  api.setAnswers([3, 2]);
  assert.ok(root.textContent.includes('Score: 5'));
  assert.ok(root.textContent.includes('Severity: Positive'));
  assert.ok(root.textContent.includes('Consider PHQ-9 follow-up.'));
});

test('renderScreener: exampleAnswers auto-fill on first paint (spec-v9 §3.3)', () => {
  const root = makeDiv();
  globalThis.window.location.hash = '';
  renderScreener(root, { id: 'phq2', items: phq2Items, severityBands: bands, citation: 'x', exampleAnswers: [1, 1] });
  // The example fills before any user interaction; the score is live.
  assert.ok(root.textContent.includes('Score: 2'));
  assert.ok(root.textContent.includes('Severity: Negative'));
  // The "Reset to example" link replaces the prior "Test with example" button.
  const link = root.querySelector('.example-reset');
  assert.ok(link, 'Reset-to-example link is rendered');
});

test('renderScreener: empty severityBands and zero score still works', () => {
  const root = makeDiv();
  globalThis.window.location.hash = '';
  const api = renderScreener(root, { id: 'phq2', items: phq2Items, severityBands: [], citation: 'x' });
  api.setAnswers([0, 0]);
  assert.ok(root.textContent.includes('Score: 0'));
});
