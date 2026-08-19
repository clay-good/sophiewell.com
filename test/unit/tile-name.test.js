import test from 'node:test';
import assert from 'node:assert/strict';
import { tileName } from '../../scripts/lib/tile-name.mjs';

// Every static surface regexes the tile name out of the UTILITIES array in
// app.js. The pattern stopped at the first quote, including an escaped one,
// so two tiles published a browser tab reading "CDAI (Crohn\ - Free, in your
// browser" and a search snippet to match.
test('tileName keeps a name through its escaped apostrophe', () => {
  const line = "  { id: 'cdai-crohns', name: 'CDAI (Crohn\\'s Disease Activity Index)', group: 'G' },";
  assert.equal(tileName(line), "CDAI (Crohn's Disease Activity Index)");
});

test('tileName reads an ordinary name unchanged', () => {
  assert.equal(tileName("  { id: 'gcs', name: 'Glasgow Coma Scale', group: 'G' },"), 'Glasgow Coma Scale');
});

test('tileName returns null for a line with no name', () => {
  assert.equal(tileName("  // a comment about name: things"), null);
});
