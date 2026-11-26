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
    probe: 'probe-order-swapped.mjs',
    what: 'two values whose order is fixed by definition, entered the other way round and answered as if they were not',
    fix: 'Refuse the pair with orderFault in lib/num.js (docs/spec-v1737.md), say what the reading means '
      + '(docs/spec-v1784.md), or add it to JUDGED in the finder with the reason either order is a real situation',
    informational: ['--all lists'],
    minJudged: 6,
  },
  {
    probe: 'probe-impossible-as-zero.mjs',
    what: 'an impossible value scored exactly as 0 on the path the page takes',
    fix: 'Refuse it where the ceiling already is (docs/spec-v1783.md), or add it to JUDGED in the finder with '
      + 'the reason the verdict is right for both values, or the clamp is unreachable',
    informational: ['Reach:', '"agents fenced"', '0 field', '1 field', '2 field', '3 field'],
    minJudged: 4,
  },
  {
    probe: 'probe-dated-claims.mjs',
    what: 'a date that has passed, written in the future tense',
    fix: 'Re-read it against its source and rewrite it in the past tense or update it (docs/spec-v1782.md), '
      + 'or add it to JUDGED in the finder with the reason the date belongs to a source or to a rule\'s start',
    informational: ['A line whose', '--all lists'],
    minJudged: 5,
  },
  {
    probe: 'probe-half-guarded.mjs',
    what: 'a tile that guards one missing input and stays silent on another that moves its answer',
    fix: 'Own the gap in the reading (docs/spec-v1805.md, docs/spec-v1812.md), or add it to JUDGED in the '
      + 'finder with the reason the silence is right -- the verdict cannot move, the gap is visible in what '
      + 'is printed, or the field is an optional extra',
    // Its report is a three-line preamble and then a tile per indented block; a row is what is indented.
    isFinding: (l) => l.startsWith('  '),
    informational: [],
    minJudged: 13,
  },
  {
    probe: 'probe-omitted-field-decides.mjs',
    args: ['--all', '--only-ruled-out'],
    what: 'a tile that decides from a subset: with one field omitted the reading is `abnormal: false` and some '
      + 'value of that field would have made it true, or the tile carries no flag at all and its verdict moved',
    fix: 'Give the reading its footing (docs/spec-v1091.md, docs/spec-v1813.md), or add it to JUDGED_RULED_OUT '
      + 'or JUDGED_UNFLAGGED in the finder with the reason -- it names the value it assumed, the field is an '
      + 'optional extra, the verdict is scoped to what was entered, or the reading only LOST a clause',
    // Its report is a count line and then two indented lines per row; a row is what is indented.
    isFinding: (l) => l.startsWith('  '),
    informational: [],
    minJudged: 32,
  },
  {
    probe: 'probe-note-lost-in-a-branch.mjs',
    what: 'a tile that owns a gap in some configurations of its other fields and answers without owning it in '
      + 'the rest, where the missing field could still have moved the verdict there',
    fix: 'Own the gap on every path that answers (docs/spec-v1813.md, docs/spec-v1814.md), or add it to JUDGED '
      + 'in the finder with the reason -- the verdict cannot move there, the band already names what it stood '
      + 'on, or the owning configuration is about a different field',
    // Its report is a preamble and then three indented lines per row; a row is what is indented.
    isFinding: (l) => l.startsWith('  '),
    informational: [],
    minJudged: 14,
  },
  // spec-v1815: six finders that report ZERO and were not gated. A finder at zero with no gate is the one
  // state nobody notices changing: the next regression prints a row into a report nobody runs. None of
  // them needs a ledger -- there is nothing to judge -- so they are here for the other half of the test,
  // which is that a row appearing at all fails. Each one's `isFinding` is its row shape, read from the
  // `console.log` that prints a row rather than guessed: five indent, and `probe-impossible-dates` prints
  // tab-separated columns with no indent at all.
  {
    probe: 'probe-impossible-changes-nothing.mjs',
    what: 'a field whose impossible value changed nothing in the reading',
    fix: 'Refuse the impossible value or make it move the answer (docs/spec-v1783.md)',
    isFinding: (l) => l.startsWith('  '),
    informational: [],
    minJudged: 0,
  },
  {
    probe: 'probe-impossible-dates.mjs',
    what: 'an impossible date or time (February 30th, 25:00) still answered',
    fix: 'Refuse it where the date is read (docs/spec-v1737.md)',
    // Its rows are tab-separated columns at the left margin; every other line it prints is prose.
    isFinding: (l) => /^[a-z0-9-]+\t/.test(l),
    informational: [],
    minJudged: 0,
  },
  {
    probe: 'probe-impossible-reads-as-absent.mjs',
    what: 'an impossible value that reads as "not entered" while the reading does not say so',
    fix: 'Refuse it rather than reading it as absent (docs/spec-v1726.md)',
    isFinding: (l) => l.startsWith('  '),
    informational: [],
    minJudged: 0,
  },
  {
    probe: 'probe-message-promises.mjs',
    what: 'a field a tile NAMES in its own refusal message and then answers without',
    fix: 'Require it, or stop naming it in the message (rule 23, docs/spec-v1181.md)',
    isFinding: (l) => l.startsWith('  '),
    informational: [],
    minJudged: 0,
  },
  {
    probe: 'probe-missing-list-reach.mjs',
    what: 'a tile that refuses with a list of inputs and has OTHER inputs that move the verdict unnamed',
    fix: 'Name them in the list, or own the gap in the reading (docs/spec-v1091.md)',
    isFinding: (l) => l.startsWith('  '),
    informational: [],
    minJudged: 0,
  },
  {
    probe: 'probe-envelope-unbounded.mjs',
    what: 'a value an order of magnitude past a ceiling lib/bounds.js already declares, still answered',
    fix: 'Apply the envelope where the value is read (docs/spec-v1404.md, docs/spec-v1741.md)',
    isFinding: (l) => l.startsWith('  '),
    informational: [],
    minJudged: 0,
  },
  {
    probe: 'probe-reversal.mjs',
    what: 'a formula that turns once and runs on to the edge of its own input range, which is the smell of a '
      + 'cap nobody read',
    fix: 'Apply the cap the source states (docs/spec-v1718.md), or add the calculator to JUDGED in the finder '
      + 'with the reason it really is non-monotone -- a symmetric severity score, a banded criterion, a '
      + 'published squared or reciprocal term, a two-sided reference interval, or a distance',
    // Its rows are two indented lines under an indented header; a row is what is indented.
    isFinding: (l) => l.startsWith('  '),
    informational: [],
    minJudged: 38,
  },
  {
    probe: 'probe-fraction-rounded.mjs',
    what: 'a fractional value in a whole-number field, silently rounded to the nearest whole number',
    fix: 'Refuse the fraction with `gradeFault(..., true)` or `wholeFault` (docs/spec-v1722.md), or add it to '
      + 'JUDGED in the finder with the reason -- only a printed figure moves, the band\'s published edges are '
      + 'at that precision, or the score is published as an integer',
    isFinding: (l) => l.startsWith('  '),
    informational: ['Reach:'],
    minJudged: 46,
  },
  {
    probe: 'probe-helper-behaviour-drift.mjs',
    what: 'copies of one helper name that answer the same question differently when driven over a battery '
      + 'of plausible and impossible readings',
    fix: 'Give them one behaviour and add the name to `check-helper-drift`\'s WATCHED set (docs/spec-v1818.md), '
      + 'or add the name/arity to JUDGED in the finder with the reason they are two different functions '
      + 'wearing one short name',
    // Its rows are a group header at the left margin and indented detail beneath; a header is the finding.
    isFinding: (l) => /DISAGREE|not comparable/.test(l),
    informational: [],
    minJudged: 6,
  },
  {
    probe: 'probe-declared-cap-configs.mjs',
    what: 'a declared bound the library answers past in some configuration, so the page answers what the agent is refused',
    fix: 'Hoist the guard above the branch split with gradeFault (docs/spec-v1780.md), drop the declaration, '
      + 'or add it to JUDGED in the finder with the reason',
    informational: ['Reach:', '--all lists'],
    // spec-v1794: 0, and deliberately. The one row this ledger carried was peds-weight-est's years floor,
    // left as a reader-facing choice; the choice has been made and the row is closed, not judged. A ledger
    // that empties because its last finding was FIXED is the end state this whole vein is aiming at.
    minJudged: 0,
  },
  {
    probe: 'probe-absent-example-field.mjs',
    what: 'a field absent from its worked example that discards an impossible value in silence',
    fix: 'Refuse the impossible value (docs/spec-v1778.md), or add it to JUDGED in the finder with the reason '
      + 'the value was used, or read as absent AND disclosed',
    informational: ['Reach:', '0 field'],
    isFinding: (l) => l.includes('\t') && !l.startsWith('==') && !l.startsWith('NEVER-READ'),
    minJudged: 7,
  },
  {
    // spec-v1805: already at zero when the sweep reached it, and gated so it stays there. Its exclusions
    // are measured and printed in its reach line, so it needs no ledger.
    probe: 'probe-refusal-unrendered.mjs',
    what: 'a refusal the library can return that the page would not show, so a reader sees nothing where an agent is told why',
    fix: 'Render the refusal the library returns (docs/spec-v1046.md), or make the state unreachable from either surface',
    informational: ['actionable tile(s).', 'Excluded:', 'Reach:', 'Wrong-key and reachable'],
    isFinding: (l) => l.includes('\t'),
    minJudged: 0,
  },
  {
    // spec-v1805: the same -- at zero, and gated. It asks whether the asking/disclosing vocabulary that
    // exempts a dropped-field reading is earning that exemption on text the tool added for the purpose, or
    // on words that happened to be there already.
    probe: 'probe-static-exemption.mjs',
    what: 'a dropped-field reading exempted only by text that was already there, about a gap that did not exist when it was written',
    fix: 'Say what the missing field would change (docs/spec-v1778.md), or let the row be reported',
    informational: ['row(s) across', 'Reach:', '(Verdict-moving rows only', 'about a gap that'],
    isFinding: (l) => l.includes('\t'),
    minJudged: 0,
  },
  {
    // spec-v1804: all 58 of its rows across 19 tools are fixed, and it has no ledger: a refusal that names
    // a camelCase argument is never the right answer, because no control anywhere shows that word.
    probe: 'probe-identifier-in-refusal.mjs',
    what: 'a refusal that names an input by the developer\'s name for it, in a tool whose promise is plain language',
    fix: 'Print the item table\'s own prose (docs/spec-v1790.md, docs/spec-v1804.md) -- add a `text` beside '
      + 'the key where the table has none, as lib/thwaites-v529.js has always had',
    informational: ['refusal(s) across', 'Reach:', 'The fix is'],
    isFinding: (l) => l.includes('\t'),
    minJudged: 0,
  },
  {
    // spec-v1803: nineteen rows became one once it asked the adapters whether a default can fire at all --
    // `vis`'s six vasoactive doses are all declared required, so the zeros in its signature are unreachable
    // -- and that one was fixed by saying the default in the label.
    probe: 'probe-default-in-answer.mjs',
    what: 'a defaulted parameter whose value is printed into the tool\'s own answer, as though someone had entered it',
    fix: 'Ask for it, or say the default in the control (docs/spec-v1132.md, docs/spec-v1803.md), or add it '
      + 'to JUDGED in the finder with the disclosure the control already makes',
    informational: ['defaulted parameter(s)'],
    isFinding: (l) => /^ {2}lib\/\S+\.js:\d+ {2}/.test(l),
    minJudged: 9,
  },
  {
    // spec-v1803: its one row was read and judged -- the call site guards from the RAW value, which this
    // finder cannot see from the `num()` line alone. Its own note says a row is a suspect, not a defect,
    // and a suspect that has been read is noise on every later run.
    probe: 'probe-optional-read-as-zero.mjs',
    what: 'a field the page calls optional, read with Number() so a blank arrives as a measurement of zero',
    fix: 'Read the raw value to tell blank from 0 (docs/spec-v1213.md), or add it to JUDGED in the finder '
      + 'with the guard the call site already has',
    informational: ['optional-labelled fields'],
    isFinding: (l) => /^ {2}\S+\.js:\d+ {2}/.test(l),
    minJudged: 1,
  },
  {
    // spec-v1803: a gate once it learned that lib/upload-worker.js is a surface too. It reported three
    // libraries as reading a key nobody can say; a reader supplies all three by dropping a CSV on the page.
    probe: 'probe-unsupplied-input.mjs',
    what: 'a library reading an input no surface supplies, so the branch behind it decides for everyone who could not say it',
    fix: 'Ask for it on the adapter and the page, or drop the branch (docs/spec-v1403.md, docs/spec-v1803.md), '
      + 'or add it to JUDGED in the finder with the reason the key is an alternative to one that IS asked for',
    informational: ['calculator(s) read', 'Reach:'],
    isFinding: (l) => l.trim().startsWith('  ') === false && l.includes('   (mcp/adapters/'),
    minJudged: 1,
  },
  {
    // spec-v1802: the last of the envelope finders. It has no ledger because its three non-findings are
    // MEASURED, not judged: a cap that moves with another input, a cap on the range the tool reports its
    // output in, and a range the field itself declares. Each is counted in the reach line.
    probe: 'probe-envelope-inside.mjs',
    what: 'a value just inside a lib/bounds.js envelope refused by a narrower cap that nothing declares',
    fix: 'Declare the narrower cap on the adapter descriptor (docs/spec-v1802.md), or widen the library to '
      + 'the envelope where the narrower copy was an older one',
    informational: ['of 1700 value'],
    isFinding: (l) => l.includes('\t'),
    minJudged: 0,
  },
  {
    // spec-v1801: the last of the declaration finders to become a gate, because it is the last to reach
    // zero. Every DECLARABLE row it has found since spec-v1777 is now declared -- 2,667 of 5,189 number
    // fields -- and the two it still reaches are not declarations at all.
    probe: 'probe-undeclared-cap.mjs',
    what: 'a field whose library enforces a stable, unit-free cap that nothing declares',
    fix: 'Declare it on the adapter descriptor as a literal min/max (docs/spec-v1795.md), or name the '
      + 'envelope where the library applies one, or add it to JUDGED in the finder with the reason it is not a declaration',
    // --all also prints the three sections that explain why a cap was NOT offered; those are not findings.
    informational: ['== ', 'Reach:'],
    isFinding: (l) => l.includes('\t') && !l.startsWith('JUDGED') && !/\t\[(= BOUNDS|moves with|rescaled by|declaration spans)/.test(l),
    minJudged: 2,
  },
  {
    // spec-v1800: promoted the day its last row was judged. Its findings CAN be deliberate -- an infusate's
    // electrolytes are not a patient's, a unit converter converts, and a rewarming tool is opened for the
    // record-breaking case -- so unlike probe-borrowed-envelope it carries a ledger.
    probe: 'probe-envelope-unenforced.mjs',
    what: 'a field that IS one of lib/bounds.js\'s quantities, answered outside that quantity\'s envelope',
    fix: 'Apply the envelope the 569 other fields of that quantity apply (docs/spec-v1799.md, '
      + 'docs/spec-v1800.md), or add it to JUDGED in the finder with the reason the value is ordinary',
    informational: [],
    isFinding: (l) => l.includes('\t') && !l.startsWith('OK'),
    minJudged: 11,
  },
  {
    // spec-v1797: promoted the day it was written, because the 163 rows it found were all one refactor --
    // a borrowed envelope plus a scale is an obfuscated literal -- and the refactor is done. It has no
    // ledger: a borrowed envelope is never the right answer, so there is nothing here to judge.
    probe: 'probe-borrowed-envelope.mjs',
    what: 'a field naming a lib/bounds.js envelope for a quantity it is not, which its library never mentions',
    fix: 'State the range the library enforces as a literal, or name the envelope that does fit '
      + '(docs/spec-v1796.md, docs/spec-v1797.md) -- and drop the boundScale, which was chosen for the borrowed numbers',
    informational: [],
    isFinding: (l) => l.includes('\t') && !l.startsWith('OK'),
    minJudged: 0,
  },
  {
    // spec-v1794: promoted from a hand-run report to a gate once its eighteen rows were fixed. It is the
    // mirror of probe-declared-cap-configs: that one asks whether a declaration holds in every
    // CONFIGURATION, this one whether the library enforces it at all.
    probe: 'probe-adapter-only-bounds.mjs',
    what: 'a range the adapter declares and the library does not enforce, so the page answers what the agent is refused',
    fix: 'Declare the range the library actually enforces (docs/spec-v1794.md) -- never an envelope borrowed for '
      + 'its numbers -- or add the guard to the library, or add it to JUDGED in the finder with the reason',
    informational: ['row(s) of'],
    isFinding: (l) => l.includes('\t') && !l.startsWith('=='),
    minJudged: 1,
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
    // spec-v1813: `args` for a finder whose ledger covers ONE section of a longer report; the rest of
    // its sections are a reading list and are not gated.
    try { out = run(f.probe, f.args || ['--all']); } catch (err) { assert.fail(`the finder did not run: ${err.message}`); }
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

// spec-v1782: a precision rule is a claim that certain rows are honest, and the cheapest way to get a quiet
// report is to write one that is too wide. The dated-claims finder skips a passed date beside a date still
// ahead in the same clause, and skips a worked example's expected output. Driven at a date past every future
// claim in the catalog, it must still report the ones that have then gone stale -- so the rules narrow it
// rather than blind it.
test('probe-dated-claims.mjs still finds a claim once its own future date has passed', () => {
  const out = run('probe-dated-claims.mjs', ['--as-of', '2028-01-01']);
  const rows = out.split('\n').filter((l) => /^(lib|views|mcp)\/.*\t20\d\d-\d\d-\d\d/.test(l));
  assert.ok(rows.length > 10, `only ${rows.length} rows as of 2028-01-01; the structural rules may be too wide`);
  assert.ok(rows.some((l) => l.includes('2027-11-27')),
    'the DSCSA exemptions run until November 27, 2027, so that claim must be stale as of 2028');
});
