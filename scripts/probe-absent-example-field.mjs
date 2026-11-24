#!/usr/bin/env node
// spec-v1778: the optional field no finder drove.
//
// 863 of the catalog's 4,544 free number fields -- nearly one in five -- are ABSENT from their tool's own
// worked example. Two finders were supposed to cover what they do with an impossible value, and each of them
// hands this class to the other:
//
//   * `probe-impossible-changes-nothing` (spec-v1217) skips a field that is not in the example outright:
//     `if (!hasOwnProperty(example, dom)) continue`. It has no value to perturb.
//   * `probe-adapter-only-bounds` (spec-v1744) does drive them, and then skips the row when the answer did
//     not move -- "the field changed nothing: another finder's job", which is the finder above.
//
// So a reader can type 999999 into one of these and be answered as though the box were empty, while an agent
// sending the same value is refused by the adapter. That is spec-v1214's silent substitution on the surface
// spec-v1743 cares about, in the one place neither gate looks.
//
// Driving them needs a configuration where the field is actually READ. An absent field is usually absent
// because the example takes a branch that does not use it, and filling it changes nothing for an honest
// reason. So for each field this walks configurations -- each enum at every option it lists -- until the
// answer MOVES when the field is filled with a plausible value. That configuration is the proof the tool
// reads the field; only then is an impossible value entered.
//
// Three sections:
//
//   * IGNORED -- the tool reads the field in some configuration, and in that same configuration accepts an
//     impossible value and answers exactly as it does with the box empty. A defect: the reader's number was
//     discarded in silence.
//   * REFUSED-ELSEWHERE -- the impossible value is refused, but only once some OTHER input is also supplied.
//     Read it: the guard is behind a condition.
//   * NEVER-READ -- no configuration tried made the field matter. That is the discarded-input class
//     (`probe-unsupplied-input`, `probe-omitted-field-decides`), not this one, and it is counted but not
//     listed unless --all.
//
// Asserts nothing; prints a report.
//
//   node scripts/probe-absent-example-field.mjs
//   node scripts/probe-absent-example-field.mjs --all
//   TOOLS=pc-dose-pole,hat-treatment node scripts/probe-absent-example-field.mjs

import { META } from '../lib/meta.js';
import { REGISTRY } from '../mcp/catalog.js';

const ALL = process.argv.includes('--all');
const ONLY = process.env.TOOLS ? new Set(process.env.TOOLS.split(',')) : null;

// Rows read and judged, with their reason (docs/spec-v1778.md). The report prints only what is NOT here, so
// a new row is a decision someone takes rather than a line in a report that already prints seven known ones
// (spec-v1775's rule). Two kinds of reason appear: the answer is identical because the value was USED and
// found to make no difference, and spec-v1218's innocent case -- read as absent, and the reading says so.
const JUDGED = {
  'copay-card-runout:ccr-perfill': 'a per-fill maximum of 999,999 covers every fill, which is what no per-fill maximum does: the value was used',
  'vial-rounding:vr-v2': 'a 999,999 mg vial cannot fill a 420 mg dose, so the plan is the one with no second vial: the value was used and found unusable',
  'vial-rounding:vr-v3': 'a 999,999 mg vial cannot fill a 420 mg dose, so the plan is the one with no third vial: the value was used and found unusable',
  'o2-cylinder-duration:o2-target': 'owner decision of 2026-11-17: this tool keeps reading an optional target as absent (docs/spec-v1759.md)',
  'phoenix-sepsis:phx-ddimer': 'read as absent and the reading SAYS so -- "a D-dimer" stays on the not-entered list (spec-v1218\'s disclosed case)',
  'phoenix-sepsis:phx-fib': 'read as absent and the reading SAYS so -- "a fibrinogen" stays on the not-entered list (spec-v1218\'s disclosed case)',
  'tls-cairo-bishop:tl-uab': 'read as absent and the reading SAYS so -- "No baseline entered", and the note names what was assumed instead',
};
const judgedSeen = new Set();

// The house constants for a value no reader can mean (spec-v1217), and a ladder of plausible fills for a
// quantity whose scale is unknown. A declared range gives its own midpoint, which is always plausible.
const IMPOSSIBLE = ['999999', '-999999'];
const LADDER = [1, 5, 20, 60, 100];

const run = (e, inputs) => {
  try {
    const r = e.compute(e.toArgs(inputs));
    return r == null ? null : r;
  } catch {
    return null;
  }
};
const stable = (r) => JSON.stringify(r === null ? null : (r.result !== undefined ? r.result : r));
const refused = (r) => r === null || r.valid === false;

let tools = 0;
let absent = 0;
const sections = { IGNORED: [], 'REFUSED-ELSEWHERE': [], 'NEVER-READ': [] };

for (const [id, e] of REGISTRY) {
  if (ONLY && !ONLY.has(id)) continue;
  const ex = META[id]?.example?.fields;
  if (!ex || !e.fields) continue;
  const base = run(e, { ...ex });
  if (refused(base)) continue;
  tools += 1;

  const enums = e.fields.filter((f) => f.kind === 'enum' && Array.isArray(f.values));
  for (const f of e.fields) {
    if (f.kind !== 'number' || Array.isArray(f.values)) continue;
    if (Object.prototype.hasOwnProperty.call(ex, f.dom) && String(ex[f.dom]).trim() !== '') continue;
    absent += 1;

    const fills = [];
    if (Number.isFinite(f.min) && Number.isFinite(f.max)) fills.push(Number(((f.min + f.max) / 2).toPrecision(4)));
    for (const v of LADDER) if (!fills.includes(v)) fills.push(v);

    // Configurations: the example, then each enum at every option. The first one in which filling the field
    // moves the answer is the configuration this field is read in.
    const configs = [['the example', { ...ex }]];
    for (const o of enums) for (const v of o.values) configs.push([`${o.dom}=${v}`, { ...ex, [o.dom]: String(v) }]);

    let readIn = null;
    for (const [label, cfg] of configs) {
      const cfgBase = run(e, cfg);
      if (refused(cfgBase)) continue;
      const empty = stable(cfgBase);
      for (const fill of fills) {
        const filled = run(e, { ...cfg, [f.dom]: String(fill) });
        if (refused(filled) || stable(filled) === empty) continue;
        readIn = { label, cfg, empty, fill };
        break;
      }
      if (readIn) break;
    }
    if (!readIn) { sections['NEVER-READ'].push(`${id}\t${f.dom}\t${f.label || ''}`); continue; }

    // In that configuration, is an impossible value refused -- or answered as though the box were empty?
    const ignored = [];
    for (const bad of IMPOSSIBLE) {
      const r = run(e, { ...readIn.cfg, [f.dom]: bad });
      if (refused(r)) continue;
      if (stable(r) === readIn.empty) ignored.push(bad);
    }
    if (!ignored.length) continue;

    // Does any configuration refuse it? Then the guard exists and sits behind a condition.
    let guardedSomewhere = false;
    for (const [, cfg] of configs) {
      if (refused(run(e, cfg))) continue;
      if (IMPOSSIBLE.some((bad) => refused(run(e, { ...cfg, [f.dom]: bad })))) { guardedSomewhere = true; break; }
    }
    const key = `${id}:${f.dom}`;
    const row = `${id}\t${f.dom}\t${ignored.join(',')}\tread when ${readIn.label} (filled ${readIn.fill})\t${f.label || ''}`;
    if (JUDGED[key]) {
      judgedSeen.add(key);
      if (ALL) console.log(`JUDGED\t${row}\t${JUDGED[key]}`);
      continue;
    }
    sections[guardedSomewhere ? 'REFUSED-ELSEWHERE' : 'IGNORED'].push(row);
  }
}

for (const [name, rows] of Object.entries(sections)) {
  if (!rows.length) continue;
  if (name === 'NEVER-READ' && !ALL) continue;
  console.log(`\n== ${name} (${rows.length})`);
  // NEVER-READ is another finder's class, not a finding of this one, so each of its rows says so on the
  // line: test/unit/finder-ledgers.test.js reads this report and would otherwise count them as findings.
  for (const r of rows.sort()) console.log(name === 'NEVER-READ' ? `NEVER-READ\t${r}` : r);
}

const stale = Object.keys(JUDGED).filter((k) => !judgedSeen.has(k));
for (const k of stale) console.log(`STALE-LEDGER\t${k}\t(judged here, but the finder no longer reaches it)`);
console.error(`\n${sections.IGNORED.length} field(s) absent from their worked example are READ in some configuration and `
  + `discard an impossible value there in silence; ${sections['REFUSED-ELSEWHERE'].length} are refused only once `
  + `another input is supplied; ${judgedSeen.size} judged`
  + `${stale.length ? `, ${stale.length} ledger row(s) STALE` : ''}.\nReach: ${tools} tool(s) with a computable worked `
  + `example, ${absent} number field(s) absent from it; ${sections['NEVER-READ'].length} never moved the answer in any `
  + `configuration tried (another finder's class; --all lists them, and the judged rows with their reasons).`);
