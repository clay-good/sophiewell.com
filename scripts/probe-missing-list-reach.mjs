// spec-v1140: a tile's own "what is missing" list -- does it cover every input
// the tile HAS, or only the ones the author happened to be fixing?
//
// mehran-cin (spec-v1139) listed its two measurements and left six clinical
// factors outside the list, so an agent omitting "heart failure" moved the
// answer two risk bands with nothing said. The question generalises: for each
// tile that builds a missing/unstated/ungraded list, how many of its declared
// fields does that list actually mention?
import { allCalculators } from '../mcp/catalog.js';
import { META } from '../lib/meta.js';
import { computeCalculator } from '../mcp/tools.js';

const rows = [];
for (const tool of allCalculators()) {
  const ex = META[tool.id]?.example?.fields;
  if (!ex) continue;
  const fields = (tool.fields || []).filter((f) => ex[f.dom] !== undefined && String(ex[f.dom]).trim() !== '');
  if (fields.length < 3) continue;
  // Does the tile refuse on an empty call, and does that refusal name things?
  const empty = computeCalculator({ id: tool.id, inputs: {} });
  const said = String(empty?.result?.band || empty?.result?.message || '');
  if (!/missing|enter |state |grade |choose |say what/i.test(said)) continue;
  // Which of its own fields does the refusal NOT mention, by label word?
  const unnamed = fields.filter((f) => {
    const label = String(f.label || '').toLowerCase().replace(/\(.*?\)/g, '').trim();
    const words = label.split(/[^a-z0-9]+/).filter((w) => w.length > 3);
    if (!words.length) return false;
    return !words.some((w) => said.toLowerCase().includes(w));
  });
  // Of those, which actually MOVE the answer when dropped from the example?
  const movers = [];
  for (const f of unnamed) {
    const partial = { ...ex }; delete partial[f.dom];
    const got = computeCalculator({ id: tool.id, inputs: partial });
    const full = computeCalculator({ id: tool.id, inputs: ex });
    if (got?.valid !== true || full?.valid !== true) continue;
    const a = String(got.result?.band || got.result?.bandLabel || '').replace(/[\d.]+/g, '#');
    const b = String(full.result?.band || full.result?.bandLabel || '').replace(/[\d.]+/g, '#');
    if (a !== b) movers.push({ dom: f.dom, label: String(f.label || '').slice(0, 40), was: b.slice(0, 70), now: a.slice(0, 70) });
  }
  if (movers.length) rows.push({ id: tool.id, said: said.slice(0, 90), movers });
}
console.log(`${rows.length} tile(s) refuse with a list that names some inputs, and have OTHER inputs`);
console.log('that change the verdict when dropped without being named.\n');
for (const r of rows.slice(0, 20)) {
  console.log(`  ${r.id}`);
  console.log(`     says: ${r.said}`);
  for (const m of r.movers.slice(0, 3)) console.log(`     ${m.dom} (${m.label}) -> ${m.now}`);
}
