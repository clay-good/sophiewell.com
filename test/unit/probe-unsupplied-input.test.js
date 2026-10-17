// scripts/probe-unsupplied-input.mjs ran by hand only. On October 17, 2026 it found two inputs a library asks
// for that no surface could send (peds-bmi-percentile weight and height for an agent; parta-premium's premium
// for a year with no published figure, on the page and for an agent). The four left are by design, and a new
// one fails here.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const PROBE = fileURLToPath(new URL('../../scripts/probe-unsupplied-input.mjs', import.meta.url));
const BY_DESIGN = new Map([
  // A pre-parsed list the file intake hands over; the page and agents send the same rows as text.
  ['mpr-gap-days', 'fillRows'],
  ['med-sync-plan', 'medicationRows'],
  ['chair-day-planner', 'apptRows'],
  // An alternate route from a Spetzler-Martin grade; both surfaces ask for the class itself.
  ['spetzler-ponce', 'smGrade'],
]);

test('every input a library reads is one some surface can supply, except the listed alternates', () => {
  const out = execFileSync(process.execPath, [PROBE], { encoding: 'utf8' });
  const found = [...out.matchAll(/^ {2}(\S+)\s+(\S.*?)\s+\(mcp\/adapters\//gm)].map((m) => [m[1], m[2].trim()]);
  const unexpected = found.filter(([id, args]) => BY_DESIGN.get(id) !== args);
  assert.deepEqual(unexpected, [], 'a library reads an input no surface supplies; add the field or list it here with why');
  assert.equal(found.length, BY_DESIGN.size, out);
});
