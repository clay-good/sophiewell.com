// design-system wave 3.3: the stat-grid opt-in on the shared result renderer.
//
// A multi-output tile passes `{ stats: true }` and its labeled numbers render as
// the shared `.stat` grid instead of `Label: Value` list rows. Three properties
// have to hold, because the catalog-wide sweeps depend on them:
//   - document order survives, so a tile that heads a group of numbers with a
//     band line (burn-fluid's "Parkland" / "Modified Brooke") still reads in
//     order: one grid per run of consecutive numbers, bands as rows between;
//   - every number the list showed is still on the page, with its units;
//   - the copy payload is built from the items, not the DOM, so it is identical
//     with and without the opt-in.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { installDom, makeDiv } from '../fixtures/dom-stub.js';

installDom();

const { resultRow } = await import('../../lib/result-copy.js');

const cells = (o) => o.querySelectorAll('.stat').map((s) => ({
  value: s.querySelector('.stat-value').textContent,
  label: s.querySelector('.stat-label').textContent,
  primary: (s.className || '').split(/\s+/).includes('stat--primary'),
}));

test('stats: labeled numbers become stat cells, the first one primary', () => {
  const o = makeDiv();
  resultRow(o, [
    { label: 'Du Bois', value: 1.84, units: 'm^2' },
    { label: 'Mosteller', value: 1.85, units: 'm^2' },
  ], { stats: true });
  assert.equal(o.querySelectorAll('.stat-grid').length, 1);
  assert.deepEqual(cells(o), [
    { value: '1.84 m^2', label: 'Du Bois', primary: true },
    { value: '1.85 m^2', label: 'Mosteller', primary: false },
  ]);
  // No list row duplicates a number that is now a cell.
  assert.equal(o.querySelectorAll('li').length, 0);
});

test('stats: a band line stays a row and keeps its place between the grids', () => {
  const o = makeDiv();
  resultRow(o, [
    { text: 'Parkland' },
    { label: 'Total 24h', value: 4000, units: 'mL' },
    { label: 'First 8h', value: 2000, units: 'mL' },
    { text: 'Modified Brooke' },
    { label: 'Total 24h', value: 2000, units: 'mL' },
  ], { stats: true });
  const order = o.children.map((n) => (n.tagName === 'UL'
    ? `band:${n.textContent}`
    : (n.className || '').includes('stat-grid') ? `grid:${n.querySelectorAll('.stat').length}` : n.tagName));
  assert.deepEqual(order, ['band:Parkland', 'grid:2', 'band:Modified Brooke', 'grid:1', 'P']);
  // Only the first number overall is the primary cell.
  assert.deepEqual(cells(o).map((c) => c.primary), [true, false, false]);
  const bands = o.querySelectorAll('.result-band');
  assert.equal(bands.length, 2);
});

test('stats does not change the copy payload', () => {
  const items = [
    { text: 'Band line' },
    { label: 'REE', value: 1500, units: 'kcal/day' },
    { label: 'TDEE', value: 2100, units: 'kcal/day' },
  ];
  const plain = makeDiv(); resultRow(plain, items);
  const grid = makeDiv(); resultRow(grid, items, { stats: true });
  const copyText = (o) => o.querySelector('.copy-row').textContent;
  assert.equal(copyText(grid), copyText(plain));
  // Every number the list stated is still stated.
  for (const n of ['1500', '2100']) {
    assert.ok(grid.textContent.includes(n), `${n} missing from the stat grid`);
    assert.ok(plain.textContent.includes(n));
  }
});

test('without the opt-in the list renders exactly as before', () => {
  const o = makeDiv();
  resultRow(o, [
    { label: 'PAO2', value: 100, units: 'mmHg' },
    { label: 'A-a gradient', value: 10, units: 'mmHg' },
  ]);
  assert.equal(o.querySelectorAll('.stat-grid').length, 0);
  assert.equal(o.querySelectorAll('.result-primary').length, 1);
  assert.equal(o.querySelectorAll('li')[1].textContent, 'A-a gradient: 10 mmHg');
});
