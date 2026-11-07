// Probe (not a gate): spec-v1063 excludes *-probe.spec.js unless RUN_PROBES=1.
// This finder sizes the remaining design-system-cleanup waves (docs/design.md,
// openspec/changes/design-system-cleanup) by listing the spots in source that do
// not yet use the shared components. It is static analysis -- it reads files, it
// never launches a page -- and it never fails; it only reports.
//
//   RUN_PROBES=1 npx playwright test test/integration/design-conformance-probe.spec.js --project=chromium
import { test } from '@playwright/test';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

test('design-conformance finder: non-conforming spots by category', () => {
  const viewsDir = join(ROOT, 'views');
  const views = readdirSync(viewsDir).filter((f) => f.endsWith('.js'));

  const rawFileInputs = [];
  const inlineStyles = [];
  for (const file of views) {
    const src = readFileSync(join(viewsDir, file), 'utf8');
    // A native file input built in a view that does not route through dropzone().
    if (/type:\s*'file'/.test(src) && !/\bdropzone\s*\(/.test(src)) rawFileInputs.push(file);
    // Presentation that bypasses shared classes + tokens.
    if (/\bstyle:\s*['"`]/.test(src) || /\.style\.[a-zA-Z]/.test(src)) inlineStyles.push(file);
  }

  // Wave 3.3 sizing: a `resultRow` call that states three or more labeled
  // numbers and has not opted into the stat grid (`{ stats: true }`) is a
  // candidate -- a panel of numbers still rendered as a stack of sentences.
  //
  // The call is read by balancing parentheses from the `resultRow(` token, not
  // by scanning a fixed window: a single-line `resultRow(o, [...]);` ends on its
  // own line, and a window that ran past it borrowed the `label:` rows of the
  // next tiles and reported one-row calls as candidates.
  const callsIn = (src) => {
    const calls = [];
    const re = /resultRow\(/g;
    let m;
    while ((m = re.exec(src)) !== null) {
      let depth = 0;
      let k = m.index + m[0].length - 1;
      for (; k < src.length; k++) {
        const ch = src[k];
        if (ch === '(') depth++;
        else if (ch === ')') { depth--; if (depth === 0) break; }
      }
      const call = src.slice(m.index, k + 1);
      calls.push({ call, line: src.slice(0, m.index).split('\n').length });
      re.lastIndex = k + 1;
    }
    return calls;
  };

  // The grid's bar is narrower than "three labeled rows": a stat cell holds a
  // NUMBER, so a call is only pickable when EVERY labeled row's value is one.
  // A row whose value is a criterion met or not met, a yes/no flag, a category
  // name, or an "(enter X)" fallback is a verdict and stays a list row. Reading
  // that per call by hand over every three-row call is what made the earlier
  // sizing unusable, so the rule is encoded here. It over-reports rather than
  // under-reports: a pick is still confirmed against the rendered tile.
  const UNITY = /^(?:of|per|and|to|or|at|in|mg|mcg|ng|g|kg|lb|mL|L|dL|mEq|mmol|mOsm|mmHg|cmH2O|cm|mm|m|ft|kcal|kJ|IU|U|mg\/dL|yr|yrs|year|years|mo|month|months|wk|week|weeks|day|days|hr|hrs|h|min|sec|s|bpm|beats|breaths|score|points|point|times|fold|SD|percentile|normal|q6h)$/i;
  const rowsOf = (call) => call.split(/\{\s*label:/).slice(1).map((chunk) => {
    const m = /\bvalue:\s*/.exec(chunk);
    if (!m) return '';
    let depth = 0;
    let i = m.index + m[0].length;
    for (; i < chunk.length; i++) {
      const ch = chunk[i];
      if ('([{`'.includes(ch)) depth++;
      else if (')]}`'.includes(ch)) { if (depth === 0) break; depth--; }
      else if (ch === ',' && depth === 0) break;
    }
    return chunk.slice(m.index + m[0].length, i);
  });
  // A property read is the classifier's blind spot: `r.opScore` is a number and
  // `r.riskGroup` is a word, and nothing in the expression says which. The name
  // does. Reviewing the first list by hand turned up the vocabulary a result
  // object uses for its word-valued verdicts, so those are rejected by name
  // rather than offered again every wave.
  //
  // Two things this has to get right, both learned from getting them wrong: the
  // name is matched by camelCase SEGMENT, not by substring (`stage` is not an
  // `age`), and the test applies to every read in the value, not only to a bare
  // one: a value whose text is only a separator, with both halves read from
  // word-valued properties, leaves no literal word behind to catch.
  const WORDY = new Set(['label', 'band', 'bandlabel', 'tier', 'category', 'group', 'stratum', 'stage',
    'class', 'profile', 'interpretation', 'severity', 'risk', 'status', 'version', 'activity',
    'survival', 'probability', 'pattern', 'grade', 'finding', 'scale', 'definition', 'examples',
    'text', 'note', 'message', 'reading', 'verdict', 'recommendation', 'action', 'ventilation',
    'vasoactive', 'uncorrectedband']);
  const NUMERIC = new Set(['score', 'total', 'count', 'sum', 'index', 'ratio', 'pct', 'percent',
    'point', 'points', 'pts', 'mg', 'ml', 'dose', 'rate', 'area', 'volume', 'mortality',
    'morbidity', 'gap', 'number', 'age', 'day', 'days', 'hour', 'hours', 'min', 'mins', 'max']);
  // 'laboratoryTier' -> ['laboratory', 'tier']; the whole name is kept too, so a
  // compound like 'bandLabel' can be named outright.
  const segments = (name) => [name.toLowerCase(), ...name.split(/(?=[A-Z])/).map((w) => w.toLowerCase())];
  const readsWord = (name) => {
    const segs = segments(name);
    return segs.some((w) => WORDY.has(w)) && !segs.some((w) => NUMERIC.has(w));
  };

  const isNumeric = (value) => {
    if (!value) return false;
    // A ternary or a `||` fallback that can yield a word is a verdict, not a number.
    if (/metTag\s*\(/.test(value)) return false;
    if (/[?|]{1,2}\s*['"]/.test(value) || /:\s*['"]/.test(value)) return false;
    if (/fallback:\s*['"]\(/.test(value)) return false;
    // Any read whose name says it holds a word disqualifies the row.
    for (const m of value.matchAll(/\.([A-Za-z][A-Za-z0-9]*)/g)) {
      if (readsWord(m[1])) return false;
    }
    // Then every alphabetic word still standing is literal text in the template,
    // and literal text may only be a unit. That separates `${r.yesCount} yes`
    // (prose: a count of answers, read as a verdict) from `${r.total} of ${r.max}`.
    const words = value
      .replace(/\.[A-Za-z][A-Za-z0-9]*/g, ' ')
      .replace(/\b(?:r|fmt|Number|Math|String)\b/g, ' ')
      .replace(/\$\{|\}/g, ' ')
      .match(/[A-Za-z][A-Za-z0-9/]*/g) || [];
    return words.every((w) => UNITY.test(w));
  };

  const statCandidates = [];
  const statPickable = [];
  let statTotal = 0;
  let pickableTotal = 0;
  for (const file of views) {
    const open = [];
    const pick = [];
    for (const { call, line } of callsIn(readFileSync(join(viewsDir, file), 'utf8'))) {
      const rows = rowsOf(call);
      if (rows.length < 3 || /stats:\s*true/.test(call)) continue;
      open.push(line);
      if (rows.every(isNumeric)) pick.push(line);
    }
    if (open.length) { statCandidates.push(`${file}:${open.join('/')}`); statTotal += open.length; }
    if (pick.length) { statPickable.push(`${file}:${pick.join('/')}`); pickableTotal += pick.length; }
  }

  // Wave 3.1 sizing: a banded answer with no status chip. The pickable ones are
  // where the chip is a mapping and not a judgment -- the view's own compute
  // already returns an ordinal tier at its published cut, so the view maps that
  // tier to a severity token and authors no threshold. A compute with fewer than
  // two tier literals is not banded, and one the view never renders as a band
  // line has nowhere to put a chip.
  const LIB_DIR = join(ROOT, 'lib');
  const tierLiterals = (src) => new Set([
    ...[...src.matchAll(/\b(?:tier|category|stratum):\s*'([^']+)'/g)].map((m) => m[1]),
  ]);
  const libCache = new Map();
  const tiersOfLib = (rel) => {
    if (!libCache.has(rel)) {
      try {
        libCache.set(rel, tierLiterals(readFileSync(join(LIB_DIR, rel), 'utf8')));
      } catch {
        libCache.set(rel, new Set());
      }
    }
    return libCache.get(rel);
  };

  const chipCandidates = [];
  const chipPickable = [];
  let chipTotal = 0;
  let chipPickableTotal = 0;
  for (const file of views) {
    const src = readFileSync(join(viewsDir, file), 'utf8');
    // The tiers every lib this view computes with can return.
    const tiers = new Set();
    for (const m of src.matchAll(/from '\.\.\/lib\/([^']+)'/g)) {
      for (const t of tiersOfLib(m[1])) tiers.add(t);
    }
    const bare = [];
    for (const { call, line } of callsIn(src)) {
      // Each band item in the call: `{ text: ... }` without an authored severity.
      for (const item of call.split(/\{\s*(?=text:)/).slice(1)) {
        const body = item.slice(0, item.search(/\}\s*,|\}\s*\]/) + 1);
        if (/\bseverity:/.test(body)) continue;
        bare.push(line);
        break;
      }
    }
    if (bare.length) {
      chipCandidates.push(`${file}:${bare.length}`);
      chipTotal += bare.length;
      if (tiers.size >= 2) { chipPickable.push(`${file}:${bare.length}`); chipPickableTotal += bare.length; }
    }
  }

  const css = readFileSync(join(ROOT, 'styles.css'), 'utf8');
  const hexLiterals = (css.match(/#[0-9a-fA-F]{3,8}\b/g) || []).length;

  console.log('[design-conformance] views with a raw file input (migrate to dropzone):',
    rawFileInputs.length, rawFileInputs.join(', ') || '(none)');
  console.log('[design-conformance] views using inline style (move to shared classes):',
    inlineStyles.length, inlineStyles.join(', ') || '(none)');
  console.log('[design-conformance] hex color literals in styles.css (candidates to tokenize):',
    hexLiterals);
  console.log('[design-conformance] three-or-more-row results not yet on the stat grid (file:lines):',
    statTotal, statCandidates.join(', ') || '(none)');
  console.log('[design-conformance] ...of those, every labeled row is a number (pickable now):',
    pickableTotal, statPickable.join(', ') || '(none)');
  console.log('[design-conformance] banded answers with no status chip (file:calls):',
    chipTotal, chipCandidates.join(', ') || '(none)');
  console.log('[design-conformance] ...of those, whose compute already returns an ordinal tier:',
    chipPickableTotal, chipPickable.join(', ') || '(none)');
});
