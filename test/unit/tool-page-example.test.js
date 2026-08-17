// The worked example on `/tools/<id>/` is a join: `META.example.fields` is
// keyed by DOM id, and the MCP field registry carries the same DOM id with a
// human label and a unit. The page builder prints the example only when every
// key in the example matches a field, because a partial join would state an
// example that is missing one of the values that produced the result.
//
// That join is silent when it breaks: renaming a DOM id on one side drops the
// whole Example block off the page with no error and no failing build. This
// test is the gate.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { META } from '../../lib/meta.js';
import { getCalculator } from '../../mcp/catalog.js';

const read = (p) => JSON.parse(readFileSync(fileURLToPath(new URL(`../../${p}`, import.meta.url)), 'utf8'));

// Measured at 1,564 tiles: 1,538 pages carry an example block. The rest are
// tiles with no MCP adapter (no field registry to join against) or no worked
// example at all. A drop below this means a rename broke the join.
const MIN_JOINED = 1538;

function joined() {
  const ok = [];
  const broken = [];
  for (const [id, meta] of Object.entries(META)) {
    const fields = meta?.example?.fields;
    if (!fields || !meta?.example?.expected) continue;
    let rec = null;
    try { rec = getCalculator(id); } catch { rec = null; }
    if (!rec || !Array.isArray(rec.fields)) continue; // no adapter, nothing to join
    const doms = new Set(rec.fields.map((f) => f.dom));
    const missing = Object.keys(fields).filter((k) => !doms.has(k));
    if (missing.length) { broken.push(`${id}: ${missing.join(', ')}`); continue; }
    // A tile whose example sets no value at all (every box left unchecked) has
    // no rows to print, and the page falls back to stating the result alone.
    const printable = Object.values(fields).filter((v) => String(v ?? '').trim());
    if (printable.length) ok.push(id);
  }
  return { ok, broken };
}

test('every worked example joins to the field registry it is drawn from', () => {
  const { broken } = joined();
  assert.deepEqual(broken, [], `example field ids with no matching MCP field:\n${broken.join('\n')}`);
});

test('the worked example reaches at least as many tool pages as it did', () => {
  const { ok } = joined();
  assert.ok(ok.length >= MIN_JOINED, `only ${ok.length} tiles join cleanly, was ${MIN_JOINED}`);
});

// Every printed row needs a label to name it. A blank example value is not a
// defect: seven tiles leave a select on its blank default, and those rows are
// omitted from the page rather than printed as an empty cell.
test('every field behind a joined example has a label to print', () => {
  const { ok } = joined();
  for (const id of ok) {
    const rec = getCalculator(id);
    const byDom = new Map(rec.fields.map((f) => [f.dom, f]));
    for (const dom of Object.keys(META[id].example.fields)) {
      const label = byDom.get(dom).label;
      assert.ok(typeof label === 'string' && label.trim(), `${id}/${dom} has no label`);
    }
  }
});

// --- The three question-flow tiles.
//
// tetanus, rabies-pep, and bbp-exposure render one question at a time, so they
// have no static fields and no `META.example` to join. Their worked example is
// written into `data/tool-copy/<id>.json` by hand, which means it can drift
// away from the tile the moment the underlying rule table is updated. Each
// case below re-derives the result string the same way the view builds it,
// from the same committed data file the view loads. Change a rule and this
// fails; the page never states a recommendation the tool would not give.

test('the tetanus example matches the rule table the tile reads', () => {
  const copy = read('data/tool-copy/tetanus.json');
  const d = read('data/tetanus/tetanus.json');
  const k = d.dirtyOrSerious.unknownOrLessThan3Doses;
  assert.deepEqual(copy.example.rows, [
    ['Wound type', 'Dirty / serious wound'],
    ['Tdap / Td immunization status', 'Unknown or <3 doses'],
  ]);
  assert.equal(copy.example.result, `Td/Tdap: ${k.tdap}; TIG: ${k.tig}`);
});

test('the rabies-pep example matches the schedule the tile reads', () => {
  const copy = read('data/tool-copy/rabies-pep.json');
  const d = read('data/rabies-pep/rabies.json');
  const animal = copy.example.rows[0][1];
  const rule = d.animalRules.find((a) => a.animal === animal);
  assert.ok(rule, `no animal rule named "${animal}"`);
  const s = d.schedule.previouslyUnvaccinated;
  assert.equal(
    copy.example.result,
    `${rule.action}. If PEP indicated: HRIG ${s.hrig}; vaccine days ${s.vaccineDays.join(', ')}.`
  );
});

test('the bbp-exposure example matches the PEP table the tile reads', () => {
  const copy = read('data/tool-copy/bbp-exposure.json');
  const d = read('data/bbp-exposure/bbp.json');
  assert.equal(
    copy.example.result,
    `HIV PEP: ${d.hivPep.regimen}, start within ${d.hivPep.startWithin}. HBV: ${d.hbvPep.vaccinatedRespondersExposed}. HCV: ${d.hcv}`
  );
});

// Every tool page now carries a worked example except the two tiles that take
// no input at all (a reference card and a lookup table), where an example
// would be the wrong shape. Those two say so in their own words.
test('only the two no-input tiles lack a worked example', () => {
  const without = [];
  for (const [id, meta] of Object.entries(META)) {
    if (meta?.example?.expected) continue;
    let copy = null;
    try { copy = read(`data/tool-copy/${id}.json`); } catch { copy = null; }
    if (!copy?.example?.result) without.push(id);
  }
  assert.deepEqual(without.sort(), ['co-cn-antidote', 'sti-screening']);
});

// The result strings are checked against the data files above, but the ROWS
// are the answers a reader is told to pick. If a label drifts from the option
// the view actually renders, the page directs them to a choice that is not
// there -- and no data file would catch it, because the option labels live in
// the view. Assert each one appears verbatim in the module that renders it.
test('every question-flow example row names an option the view renders', () => {
  const views = {
    tetanus: 'views/group-j.js',
    'rabies-pep': 'views/group-j.js',
    'bbp-exposure': 'views/group-j.js',
  };
  const missing = [];
  for (const [id, view] of Object.entries(views)) {
    const src = readFileSync(fileURLToPath(new URL(`../../${view}`, import.meta.url)), 'utf8');
    const copy = read(`data/tool-copy/${id}.json`);
    for (const [, value] of copy.example.rows) {
      // rabies-pep's animal names come from its data file, not the view.
      if (id === 'rabies-pep' && !src.includes(value)) {
        const d = read('data/rabies-pep/rabies.json');
        if (d.animalRules.some((a) => a.animal === value)) continue;
      }
      if (!src.includes(value)) missing.push(`${id}: "${value}"`);
    }
  }
  assert.deepEqual(missing, [], `example answers with no matching option:\n${missing.join('\n')}`);
});
