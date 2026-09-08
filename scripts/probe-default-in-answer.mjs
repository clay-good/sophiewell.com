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

const files = readdirSync('lib').filter((f) => f.endsWith('.js'));
const rows = [];
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
      if (hit) rows.push({ file: f, name, param: p, def: v, line: hit.trim().slice(0, 130), at: startLine });
      else if (interp.test(body)) { /* interpolated but not into prose */ }
    }
  }
}
console.log(`${rows.length} defaulted parameter(s) reach a prose string.\n`);
for (const r of rows) console.log(`  lib/${r.file}:${r.at}  ${r.name}(${r.param} = ${r.def})\n      ${r.line}\n`);
