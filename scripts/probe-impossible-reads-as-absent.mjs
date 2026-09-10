#!/usr/bin/env node
// spec-v1218: an impossible value read as if the reader had said nothing.
//
// This is the half [spec-v1217](../docs/spec-v1217.md) could not see. There are
// two ways a value fails to reach the formula:
//
//   DISCARDED   -- ignored entirely, so the answer does not move.
//   SUBSTITUTED -- replaced by a constant, so the answer DOES move, to a wrong
//                  and usually benign one.
//
// `probe-impossible-changes-nothing` asks whether the answer moved, so it sees
// only the first. It missed `ids-attempts`, which carried the identical defect to
// the two fields it did flag, because that example's value was not already the
// substituted constant.
//
// The oracle here needs no constant to be guessed. Substitution shapes fall back
// to the value a MISSING field gets -- `if (!Number.isFinite(n) || n < 0 || n > hi)
// return 0` returns 0 for both, and `pos(o.low, 10) ?? 2.0` returns 2.0 for both.
// So: does an impossible value produce **exactly the answer you get by omitting
// the field**? If it does, an entry nobody could have made was read as no entry
// at all, and the tile said nothing about it.
//
// A row is a defect more often than a suspect, but two innocent cases exist:
//
//   * the field is genuinely optional AND the tile discloses the default it used
//     -- the reading names it, so the reader can see what was assumed. Check the
//     band text before acting.
//   * omitting the field is itself refused, in which case there is no comparison
//     to make; those are skipped below.
//
// Usage: node scripts/probe-impossible-reads-as-absent.mjs [--limit N]
import { META } from '../lib/meta.js';
import { computeCalculator, describeCalculator } from '../mcp/tools.js';
import { ASKING } from '../test/lib/asking-language.js';

const limitArg = process.argv.indexOf('--limit');
const LIMIT = limitArg > -1 ? Number(process.argv[limitArg + 1]) : Infinity;

const IMPOSSIBLE = ['999999', '-999999'];
const stable = (r) => JSON.stringify(r && r.result !== undefined ? r.result : r);

// `ASKING` (test/lib/asking-language.js) is the vocabulary of a tile REFUSING --
// "enter the sodium", "still needed". That is a different question from the one
// here, which is whether a tile that went ahead SAID it dropped a value. The two
// overlap but neither contains the other: `abi` says "The right ankle pressure
// was not entered", which discloses without asking for anything, and `ASKING`
// matches `'enter '` with a trailing space, so it misses "entered".
//
// This list is local on purpose. Editing the shared one would change what two
// whole-catalog sweeps flag (spec-v1039's rule: check which tiles a new phrase
// stops flagging before adding it), and this probe is a report, not a gate.
//
// `default` is on the list because `ecmo-titration` discloses as "Titrated to the
// default target PaCO2 of 40 mmHg, because no target was entered" -- naming the
// substitute rather than the rejected value. It is safe here only because the
// movement rule already restricts matching to sentences the reading ADDED, so a
// standing note that happens to mention a default cannot exempt a tile.
const DISCLOSING = /not entered|no [a-z]+ was entered|not given|was not|were not|not used|not available|unavailable|omitted|assumed|default|incomplete|the only|could not/i;
// The movement rule (spec-v1196) at SENTENCE level, not word level. Subtracting
// word-by-word destroys the phrase being looked for: `abi` adds "The right ankle
// pressure was not entered", and both "not" and "entered" appear elsewhere in the
// tile's standing note, so a word-set difference deleted the very sentence that
// proves the tile disclosed.
const sentences = (t) => String(t).split(/(?<=[.!?])\s+|\\n|","|\{|\}|\[|\]/)
  .map((x) => x.trim()).filter(Boolean);

let checked = 0;
let fieldsTried = 0;
const rows = [];
for (const [id, meta] of Object.entries(META)) {
  if (checked >= LIMIT) break;
  const example = meta && meta.example && meta.example.fields;
  if (!example) continue;
  let props;
  try { props = describeCalculator({ id }).inputSchema.properties; } catch { props = null; }
  if (!props) continue;
  const base = computeCalculator({ id, inputs: example });
  if (!base || base.valid !== true) continue;
  checked += 1;
  for (const [dom, p] of Object.entries(props)) {
    if (p.type !== 'number' || Array.isArray(p.enum)) continue;
    if (!Object.prototype.hasOwnProperty.call(example, dom)) continue;
    // An example that leaves the field BLANK gives no signal: "omitted" and "as
    // the example has it" are then the same input, and every impossible value
    // trivially matches. `berlin-ards` enters no PaO2, so all four of its rows
    // were this and nothing else.
    if (String(example[dom]).trim() === '') continue;
    // What does the tile answer when this field is simply not given?
    const without = { ...example };
    delete without[dom];
    const absent = computeCalculator({ id, inputs: without });
    // If omitting is refused, the tile requires the field and there is nothing
    // to compare an impossible value against.
    if (!absent || absent.valid !== true) continue;
    const absentAnswer = stable(absent);
    const normalSentences = new Set(sentences(stable(base)));
    fieldsTried += 1;
    for (const bad of IMPOSSIBLE) {
      const r = computeCalculator({ id, inputs: { ...example, [dom]: bad } });
      if (!r || r.valid !== true) continue;          // refused: the correct outcome
      if (stable(r) !== absentAnswer) continue;      // used it, or used something else
      // Does the reading SAY so? Compare what it added, not the whole text --
      // spec-v1196's rule: a vocabulary matched against a whole reading exempts
      // static prose that was always there. `abi` adds "The right ankle pressure
      // was not entered", which tells the reader the leg was dropped; a tile that
      // adds nothing dropped the value in silence.
      const added = sentences(stable(r)).filter((x) => !normalSentences.has(x)).join(' ');
      // spec-v1219: the third way a tile discloses, and the commonest. It says
      // nothing about the dropped value and instead ENUMERATES LESS: `pk-suite`
      // goes from "half-life 6.93 h; steady state 34.65 h; loading dose 1000 mg;
      // maintenance 1200 mg" to "loading dose 1000 mg", and its renderer omits
      // the rows whose value is null. `modified-marshall` does the same with
      // "assessed: respiratory 3, renal 2" -> "assessed: renal 2".
      //
      // A reader sees quantities disappear. That is weaker than naming the value
      // rejected, and it is not silence -- so it is separated out rather than
      // counted as a defect. What is left is the row where the reading is
      // IDENTICAL to the normal one: nothing on screen moved at all.
      const enumeratedLess = stable(r).length < stable(base).length;
      const identical = stable(r) === stable(base);
      rows.push({
        id, dom, label: p.description || dom, bad, identical,
        discloses: ASKING.test(added) || DISCLOSING.test(added) || enumeratedLess,
      });
      break;
    }
  }
}

rows.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
const silent = rows.filter((r) => !r.discloses);
const spoken = rows.length - silent.length;
const nothingMoved = silent.filter((r) => r.identical);
console.log(`${silent.length} fields where an impossible value reads as "not entered" AND the reading does not say so`
  + ` -- of which ${nothingMoved.length} where the reading is IDENTICAL to the normal one, so nothing on screen moved.`);
console.log(`${spoken} more read as absent but disclose it (named, asked for, or enumerated less).`
  + ` Reach: ${checked} tiles, ${fieldsTried} numeric fields whose omission the tile accepts.`);
for (const r of silent) {
  console.log(`  ${r.identical ? '[nothing moved] ' : '                '}${r.id}  ${r.dom} (${r.label}) = ${r.bad}`);
}
