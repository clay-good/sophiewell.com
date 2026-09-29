// spec-v1624 step 3 / spec-v1613 §4: which tools a record can fill. Pure:
// the picked values + each tool's field rows (the field index: { d, k, l, u,
// r, v, c }) -> the tools that are ready, the tools one value short, and the
// values found.
//
// A field is filled only through its concept tag (`c`) and only in a unit the
// concept converts to. Yes/no and choice fields that no record can answer
// (smoker, on treatment, race) are never filled: a tool that needs them is
// ready "with questions", and the reader answers them on the tool's page.

import { toField } from './record-units.js';

const round = (v) => Math.round(v * 1000) / 1000;

// The tools whose fields carry a concept tag (mcp/adapters), so the page loads
// only their field rows. test/unit/record-concepts.test.js holds this list to
// the registry.
export const RECORD_TOOLS = ['anion-gap', 'apri', 'ascvd', 'bmi', 'ckd-epi-cystatin', 'cockcroft-gault', 'corrected-calcium', 'eag-a1c', 'egfr', 'egfr-suite', 'fib4', 'kfre', 'ldl-calc', 'meld-na', 'nafld-fibrosis', 'prevent', 'score2', 'tyg-index'];

function fieldValue(row, picked, conceptsById) {
  const v = picked[row.c];
  if (!v) return null;
  if (row.c === 'sex') {
    const want = v.value === 'F' ? ['F', 'female', 'Female'] : ['M', 'male', 'Male'];
    const hit = (row.v || []).find((x) => want.includes(x));
    return hit === undefined ? null : hit;
  }
  if (row.c === 'age') return v.value;
  const concept = conceptsById.get(row.c);
  if (!concept) return null;
  const x = toField(concept, v.value, row.u);
  return x === null ? null : round(x);
}

// plan(picked.values, tools, concepts) -> { ready, oneShort }
//   tools: [{ id, name, rows }]
//   ready: [{ id, name, fills: { dom: value }, used: [{ dom, concept }], questions: [row] }]
//   oneShort: [{ id, name, fills, missing: row }]
export function plan(picked, tools, concepts) {
  const byId = new Map(concepts.map((c) => [c.id, c]));
  const ready = [];
  const oneShort = [];
  for (const t of tools) {
    const tagged = t.rows.filter((r) => r.c);
    if (!tagged.length) continue;
    const fills = {};
    const used = [];
    for (const r of tagged) {
      const v = fieldValue(r, picked, byId);
      if (v !== null) { fills[r.d] = v; used.push({ dom: r.d, concept: r.c }); }
    }
    if (!used.length) continue;
    // Every yes/no or choice field a record cannot answer is a question, not
    // only the required ones: an unticked "smoker" box reads as "no", and a
    // risk computed on that is a reassuring answer from nothing.
    const questions = t.rows.filter((r) => !(r.d in fills) && !r.c && (r.k === 'bool' || r.k === 'enum'));
    const blanks = t.rows.filter((r) => r.r && !(r.d in fills) && !questions.includes(r));
    if (!blanks.length) ready.push({ id: t.id, name: t.name, fills, used, questions });
    else if (blanks.length === 1) oneShort.push({ id: t.id, name: t.name, fills, used, missing: blanks[0] });
  }
  const order = (a, b) => a.name.localeCompare(b.name);
  return { ready: ready.sort(order), oneShort: oneShort.sort(order) };
}
