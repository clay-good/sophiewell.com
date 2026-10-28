// The shared design-system builders (lib/components.js, docs/design.md 5).
//
// Task 0.3 of the cleanup: a status chip never signals by color alone. The
// severity drives the color token and the label is the word beside it, so the
// property to hold is that a chip always carries text -- in the builder, and in
// the two shared renderers that show one when a band authors a severity.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { installDom, makeDiv } from '../fixtures/dom-stub.js';

installDom();

const { statusChip, statGrid } = await import('../../lib/components.js');
const { resultRow } = await import('../../lib/result-copy.js');

test('statusChip: severity on the attribute, the band word as text', () => {
  const chip = statusChip('high', 'High probability');
  assert.equal(chip.getAttribute('data-severity'), 'high');
  assert.ok((chip.className || '').includes('chip--status'));
  // The dot is decorative; the word is what a reader who cannot see the color
  // has to go on.
  assert.equal(chip.textContent, 'High probability');
  assert.ok(chip.querySelector('.chip-dot'));
});

test('a severity with no label renders no chip rather than a wordless one', () => {
  const o = makeDiv();
  resultRow(o, [{ text: 'Score 7', severity: 'high' }]);
  assert.equal(o.querySelectorAll('.chip--status').length, 0);
});

test('a band that authors both gets a chip, and it carries the word', () => {
  const o = makeDiv();
  resultRow(o, [{ text: 'Score 7', severity: 'high', severityLabel: 'High' }]);
  const chips = o.querySelectorAll('.chip--status');
  assert.equal(chips.length, 1);
  assert.equal(chips[0].textContent.trim(), 'High');
  // The band text itself is untouched, so the copy payload still matches.
  assert.ok(o.querySelector('.result-band').textContent.startsWith('Score 7'));
});

test('statGrid: value, units and caption all reach the cell', () => {
  const grid = statGrid([{ label: 'Total 24h', value: 4000, units: 'mL', primary: true }]);
  const cell = grid.querySelector('.stat');
  assert.ok((cell.className || '').includes('stat--primary'));
  assert.equal(cell.querySelector('.stat-value').textContent, '4000 mL');
  assert.equal(cell.querySelector('.stat-label').textContent, 'Total 24h');
});
