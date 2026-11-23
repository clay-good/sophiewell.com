// spec-v1774: the same inputs must get the same answer on every machine.
//
// A clock tool counts days from "today", and ten of them worked that out by reading the LOCAL calendar date
// out of `now` and calling it UTC: `Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())`. So the
// answer moved with the machine's time zone. On a UTC server the controlled-substance theft clock said
// "Notice was due 41 days ago; Form 106 due in 0 days"; fourteen hours east of it, from the same inputs, it
// said "Form 106 was due 1 day ago". `clockToday` in lib/deadline.js is the one rule now.
//
// This drives every calculator's worked example in four zones -- UTC, the two extremes of the offset range,
// and one that observes daylight saving -- and asserts the answer never moves. TZ is read afresh for each
// new Date, so changing it mid-process is enough.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { META } from '../../lib/meta.js';
import { computeCalculator } from '../../mcp/tools.js';
import { allCalculators } from '../../mcp/catalog.js';

const ZONES = ['Pacific/Kiritimati', 'Pacific/Niue', 'America/Chicago'];

function answersIn(zone, ids) {
  process.env.TZ = zone;
  const out = new Map();
  for (const id of ids) {
    let r;
    try { r = computeCalculator({ id, inputs: { ...META[id].example.fields } }); } catch (e) { r = { threw: String(e.message) }; }
    out.set(id, JSON.stringify(r.result ?? r));
  }
  return out;
}

test('no worked-example answer depends on the machine time zone', () => {
  const before = process.env.TZ;
  const ids = allCalculators().map((t) => t.id).filter((id) => META[id] && META[id].example && META[id].example.fields);
  assert.ok(ids.length > 2000, `only ${ids.length} examples found; this sweep is meant to read the whole catalog`);
  try {
    const utc = answersIn('UTC', ids);
    const moved = [];
    for (const zone of ZONES) {
      const other = answersIn(zone, ids);
      // A tool whose answer depends on the real clock could straddle midnight between two reads, so a
      // difference counts only when a second UTC read reproduces the first exactly.
      const utcAgain = answersIn('UTC', ids);
      for (const id of ids) {
        if (other.get(id) === utc.get(id)) continue;
        if (utc.get(id) !== utcAgain.get(id)) continue;
        moved.push(`${id} (UTC vs ${zone})`);
      }
    }
    assert.deepEqual(moved, [], `these answers move with the machine time zone: ${moved.slice(0, 8).join(', ')}`);
  } finally {
    if (before === undefined) delete process.env.TZ; else process.env.TZ = before;
  }
});
