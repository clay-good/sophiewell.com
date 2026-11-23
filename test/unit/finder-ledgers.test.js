// spec-v1775: the finders' judged ledgers, kept honest.
//
// Four finders print rows that are not defects. `scripts/probe-half-step.mjs` drives every ordinal item and
// count at its worked-example value plus a half step, and 44 of those fields are fractional by definition (a
// visual-analogue line, a measurement, a CYP2D6 activity score in CPIC's half steps).
// `scripts/probe-unit-equivalent.mjs` asks the same quantity in another unit, and five tools rewrite a line
// of their answer to convert the figure entered, which reads to it as a lost claim.
// `scripts/probe-negative-as-zero.mjs` enters each value as a negative, and five of its rows are quantities
// that are signed by definition or false positives of its own method (a field where 0 is refused too), and
// `scripts/probe-sign-flipped.mjs` has two more that an owner decided to leave as they are.
//
// Each of those rows is in its finder's JUDGED ledger with the reason, and the finder prints only what is
// NOT judged. This test is what makes the ledgers worth having, in both directions:
//
//   - a row that is not judged fails here, so it is a decision someone takes (fix the tool, or write down
//     why the difference is right) rather than a line in a report that already prints 56 known ones;
//   - a judged row the finder no longer reaches fails too, so a reason cannot outlive what it describes.
//
// Both directions were negative-tested by removing a ledger row and by adding a bogus one.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// `informational` lines are the finder saying what it did, not what it found. `isFinding` overrides that for
// a finder whose report is prose with indented rows rather than one row per line.
const FINDERS = [
  {
    probe: 'probe-half-step.mjs',
    what: 'a half step in an ordinal item or a count',
    fix: 'Refuse it with `gradeFault(..., true)`, `wholeFault` or `setFault` (docs/spec-v1773.md, docs/spec-v1775.md), '
      + 'or add it to JUDGED in the finder with the reason the half step is real',
    informational: [],
    minJudged: 40,
  },
  {
    probe: 'probe-negative-as-zero.mjs',
    what: 'a field answers a negative value exactly as it answers 0, which is a silent clamp',
    fix: 'Refuse the negative (docs/spec-v1740.md), or add it to JUDGED in the finder with the reason it is signed '
      + 'by definition or the row is a false positive of the method',
    informational: ['Reach:'],
    minJudged: 5,
  },
  {
    probe: 'probe-sign-flipped.mjs',
    what: 'a field reads a negative value as blank, or as its absolute value',
    fix: 'Refuse the negative or keep its sign (docs/spec-v1728.md), or add it to JUDGED in the finder with the reason',
    // Its report is a heading per kind with indented rows beneath; a row is what is indented.
    isFinding: (l) => l.startsWith('  '),
    minJudged: 2,
  },
  {
    probe: 'probe-unit-equivalent.mjs',
    what: 'an answer that moves when the same quantity is entered in another unit',
    fix: 'Fix the conversion (docs/spec-v1771.md), or add it to JUDGED in the finder with the reason the difference is right',
    informational: ['FILLED'],
    minJudged: 5,
  },
];

const run = (probe, args = []) => execFileSync(
  process.execPath,
  [fileURLToPath(new URL(`../../scripts/${probe}`, import.meta.url)), ...args],
  { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
);

for (const f of FINDERS) {
  // One run per finder, with --all, so both halves of the ledger are read from the same output: the judged
  // rows print with their reasons, and everything else is a finding.
  test(`${f.probe}: every row is judged or gone, no judgement is stale, and each reason reads`, () => {
    let out = '';
    try { out = run(f.probe, ['--all']); } catch (err) { assert.fail(`the finder did not run: ${err.message}`); }
    const lines = out.split('\n').filter((l) => l.trim() !== '');
    const judged = lines.filter((l) => l.startsWith('JUDGED'));
    const stale = lines.filter((l) => l.startsWith('STALE-LEDGER'));
    const rest = lines.filter((l) => !l.startsWith('JUDGED') && !l.startsWith('STALE-LEDGER'));
    const found = rest.filter((l) => (f.isFinding ? f.isFinding(l) : !(f.informational || []).some((p) => l.startsWith(p))));

    assert.deepEqual(stale, [], `the ledger judges something the finder no longer reaches:\n${stale.join('\n')}`);
    assert.deepEqual(found, [], `${f.what}. ${f.fix}:\n${found.join('\n')}`);
    assert.ok(judged.length >= f.minJudged, `only ${judged.length} judged rows; the ledger should still cover them`);
    for (const line of judged) {
      const parts = line.split('\t');
      const why = parts[parts.length - 1];
      assert.ok(why && why.length > 25, `${parts[1]}:${parts[2]} has no reason worth reading: ${why}`);
    }
  });
}
