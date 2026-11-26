// spec-v1132: does a function print a DEFAULTED parameter's value into its own
// answer?
//
// The shape comes from spec-v1131's ROX index, whose `hoursAfterStart = 12`
// reached the band string as "failure-predicting at 12h" -- an hour nobody
// entered, printed as though they had. A default that only changes arithmetic is
// one problem; a default the answer NAMES is a fabricated observation.
//
// Reports; asserts nothing. A row is a suspect, not a defect: a default is
// disclosed, and fine, when the control says what it means ("unchecked =
// anhidrotic / classic", "Chronic / unknown onset (ceiling 8)"). Read the
// control before touching the tile.
//
// NEGATIVE TEST -- run this before trusting a quiet report. Its first version
// found ZERO on the very defect it was written from, because it tracked one hop
// of aliasing and ROX takes two (hoursAfterStart -> hrRaw -> hr):
//
//   mkdir -p /tmp/nt/lib && git show <pre-fix>:lib/clinical-v4.js > /tmp/nt/lib/clinical-v4.js
//   cd /tmp/nt && node <path>/probe-default-in-answer.mjs   # must print the rox row
//
//   node scripts/probe-default-in-answer.mjs
import { readFileSync, readdirSync } from 'node:fs';

// spec-v1803: A DEFAULT THE SURFACES ALWAYS OVERRIDE CANNOT REACH THE ANSWER. `vis` takes six vasoactive
// doses, each defaulted to 0 in the signature -- and its adapter marks all six REQUIRED, so `validateInputs`
// refuses an agent that omits one and the page sends every box. The default is unreachable, the row is
// noise, and nine of the nineteen this finder printed were exactly that: vis's six, free-water-deficit's
// target sodium and replacement hours, and digoxin's indication.
//
// So each row is checked against the adapters: the tools whose `compute` is this function are found by
// name, and a parameter every one of them declares `required: true` is dropped.
const { allCalculators } = await import('../mcp/catalog.js');
const adapterSrc = readdirSync('mcp/adapters').filter((f) => f.endsWith('.js'))
  .map((f) => [f, readFileSync(`mcp/adapters/${f}`, 'utf8')]);
const toolsByFn = new Map();
for (const t of allCalculators()) {
  const [file, src] = adapterSrc.find(([, x]) => x.includes(`id: '${t.id}'`)) || [];
  if (!src) continue;
  const i = src.indexOf(`id: '${t.id}'`);
  // The entry's own text, to the next `id:` -- where its `compute:` names the library function.
  const next = src.indexOf("id: '", i + 6);
  const body = src.slice(i, next === -1 ? src.length : next);
  for (const m of body.matchAll(/\b[A-Za-z_$][\w$]*\.([a-zA-Z0-9_]+)\s*[,(]/g)) {
    if (!toolsByFn.has(m[1])) toolsByFn.set(m[1], new Set());
    toolsByFn.get(m[1]).add(t);
  }
  void file;
}
const alwaysSupplied = (fn, param) => {
  const tools = toolsByFn.get(fn);
  if (!tools || !tools.size) return false;
  let seen = false;
  for (const t of tools) {
    const f = (t.fields || []).find((x) => x.arg === param);
    if (!f) continue;
    seen = true;
    if (!f.required) return false;
  }
  return seen;
};

// spec-v1803: a judged ledger. The note above says a row is a SUSPECT, not a defect -- a default is fine
// when the control says what it means -- so a suspect that has been read is noise on every later run.
const JUDGED = {
  // Not an adapter entry at all, by its own file's note: "mppr is intentionally not here: its input is a
  // variable number of fee rows". No surface can set the mode, and none is misled about one.
  'mppr:mode': 'mppr has no adapter entry by design (billing-v78.js says so); no surface supplies or is told a mode',
  // Controls that disclose the default in their own label.
  'ndcHcpcsUnits:rounding': 'the field label reads "Rounding: up, down, or nearest (default up)"',
  // spec-v1803 made this one true: the page's select already showed "ESR (DAS28-ESR)" as its first option,
  // and the agent field now says which form it assumes.
  'das28:form': 'the field label reads "Inflammatory-marker form (default esr)" and the page\'s select shows ESR (DAS28-ESR) first',
  'heatstrokeDecision:sweating': 'the field label reads "Sweating present (exertional; unchecked = anhidrotic / classic)"',
  // Defaults of ZERO on an optional quantity, where zero IS the absent case and the answer names the total
  // rather than the default: no modifying units, no separately billable procedure minutes, no basal rate,
  // no proposed modifier.
  'anesthesiaUnits:modifyingUnits': 'an optional count whose absent case IS zero; the answer names the base units it computed, not the default',
  'criticalCareTime:procedureMinutes': 'an optional count whose absent case IS zero; the answer names the net time, and zero procedures is the plain reading',
  'pcaPump:basalMgPerH': 'an optional rate whose absent case IS zero; a PCA with no basal is the common order',
  'ncciPtp:proposedModifier': "the default is the empty string and the sentence that names it runs only when a modifier WAS given",
  // spec-v1236 wrote this one's disclosure into the control itself.
  'sodiumCorrection:acuity': 'the page option reads "Chronic / unknown onset (ceiling 8)", which states the assumption the default makes',
};
const ALL = process.argv.includes('--all');
const judgedSeen = new Set();

const files = readdirSync('lib').filter((f) => f.endsWith('.js'));
const rows = [];
let supplied = 0;
for (const f of files) {
  const src = readFileSync(`lib/${f}`, 'utf8');
  const lines = src.split('\n');
  // find exported functions with defaulted destructured params
  const re = /export function ([a-zA-Z0-9_]+)\(\{([^}]*)\}/g;
  let m;
  while ((m = re.exec(src))) {
    const [, name, params] = m;
    const defaulted = [...params.matchAll(/([a-zA-Z0-9_]+)\s*=\s*([^,}]+)/g)]
      .map(([, p, v]) => ({ p, v: v.trim() }))
      .filter(({ v }) => !/^(null|undefined|false|\[\]|\{\})$/.test(v));
    if (!defaulted.length) continue;
    // body: from match end to the next `\nexport ` or EOF
    const start = m.index;
    const nextExport = src.indexOf('\nexport ', start + 10);
    const body = src.slice(start, nextExport === -1 ? src.length : nextExport);
    const startLine = src.slice(0, start).split('\n').length;
    for (const { p, v } of defaulted) {
      // is the parameter (or a variable trivially assigned from it) interpolated
      // into a template literal that also reads like prose?
      const interp = new RegExp('\\$\\{[^}]*\\b' + p + '\\b[^}]*\\}');
      // Aliases to a FIXED POINT. The defect this probe was written from reaches
      // its sentence in two hops -- hoursAfterStart -> hrRaw -> hr -- and a
      // one-hop alias list reported zero on it.
      const names = [p];
      for (let pass = 0; pass < 6; pass++) {
        const before = names.length;
        for (const n of [...names]) {
          for (const a of body.matchAll(new RegExp('const ([a-zA-Z0-9_]+) = [^;\\n]*\\b' + n + '\\b', 'g'))) {
            if (!names.includes(a[1])) names.push(a[1]);
          }
        }
        if (names.length === before) break;
      }
      const hit = body.split('\n').find((ln) => {
        if (!/`/.test(ln)) return false;
        if (!/[a-z]{4,} [a-z]{3,}/.test(ln)) return false;   // prose, not a key
        return names.some((n) => new RegExp('\\$\\{[^}]*\\b' + n + '\\b[^}]*\\}').test(ln));
      });
      if (!hit) continue;
      // spec-v1803: an OBJECT or ARRAY default is not a value printed into prose, and the signature parser
      // -- which reads to the first `}` -- splits one in the middle. That is where `buildHash(state = {)`
      // came from: a row about a brace.
      if (/^[[{]/.test(String(v).trim())) continue;
      if (alwaysSupplied(name, p)) { supplied += 1; continue; }
      const jk = `${name}:${p}`;
      if (JUDGED[jk]) { judgedSeen.add(jk); if (ALL) console.log(`JUDGED\t${jk}\t${JUDGED[jk]}`); continue; }
      rows.push({ file: f, name, param: p, def: v, line: hit.trim().slice(0, 130), at: startLine });
    }
  }
}
for (const k of Object.keys(JUDGED)) {
  if (!judgedSeen.has(k)) console.log(`STALE-LEDGER\t${k}\t(judged here, but the finder no longer reaches it)`);
}
console.log(`${rows.length} defaulted parameter(s) reach a prose string (${judgedSeen.size} judged) `
  + `(${supplied} more are declared required by every adapter that calls the function, so the default cannot fire).\n`);
for (const r of rows) console.log(`  lib/${r.file}:${r.at}  ${r.name}(${r.param} = ${r.def})\n      ${r.line}\n`);
