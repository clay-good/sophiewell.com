// spec-v1775: the half-step finder's ledger, kept honest.
//
// `scripts/probe-half-step.mjs` drives every ordinal item and count at its worked-example value plus a half
// step. spec-v1755 fixed 74 tools and left 61 rows standing, and spec-v1773 fixed ten more that were ordinal
// totals and counts rather than the rating lines the record named. The 44 that remain are fractional by
// definition, and each is now in the finder's JUDGED ledger with the reason.
//
// This test is what makes that ledger worth having: a NEW half-step row fails here, so it is a decision
// someone takes (fix the tool, or write down why the half step is real) rather than a line in a report that
// already prints 44 known ones. A ledger row the finder no longer reaches fails too, so the reasons cannot
// outlive the fields they describe.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const PROBE = fileURLToPath(new URL('../../scripts/probe-half-step.mjs', import.meta.url));

test('every half step the finder reaches is either refused or judged, and no judgement is stale', () => {
  let out = '';
  try {
    out = execFileSync(process.execPath, [PROBE], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  } catch (err) {
    assert.fail(`the finder did not run: ${err.message}`);
  }
  const lines = out.split('\n').filter((l) => l.trim() !== '');
  const stale = lines.filter((l) => l.startsWith('STALE-LEDGER'));
  const fresh = lines.filter((l) => !l.startsWith('STALE-LEDGER') && !l.startsWith('JUDGED'));
  assert.deepEqual(stale, [], `the ledger judges a field the finder no longer reaches:\n${stale.join('\n')}`);
  assert.deepEqual(fresh, [], 'a tool scores a half step in an ordinal item or a count. Refuse it with '
    + '`gradeFault(..., true)` or `wholeFault` (docs/spec-v1773.md), or add it to JUDGED in the finder with '
    + `the reason the half step is real (docs/spec-v1755.md):\n${fresh.join('\n')}`);
});

test('the judged rows each carry a reason, and --all prints them', () => {
  const out = execFileSync(process.execPath, [PROBE, '--all'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  const judged = out.split('\n').filter((l) => l.startsWith('JUDGED'));
  assert.ok(judged.length >= 40, `only ${judged.length} judged rows; the ledger should still cover them`);
  for (const line of judged) {
    const [, id, dom, , why] = line.split('\t');
    assert.ok(why && why.length > 25, `${id}:${dom} has no reason worth reading: ${why}`);
  }
});
