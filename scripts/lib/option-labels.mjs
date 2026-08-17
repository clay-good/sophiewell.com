// Resolve a select's option TEXT from the DOM value a worked example stores.
//
// `META.example.fields` is keyed by DOM id and holds the raw `<option value>`
// -- `male`, `onevaso`, `moderately-severe`. The MCP field registry carries
// the same DOM id with a label and the list of legal values, but not the
// option text, because an agent passes the value and never sees the picklist.
// A human reading `/tools/<id>/` does: printing "Hypotension: onevaso" states
// a token the tool never shows them, where the select on screen reads
// "Requiring one vasopressor (+/- vasopressin)".
//
// The option text exists in exactly one place, the view that builds the
// select, so this reads it out of `views/*.js` at build time.
//
// Two rules keep a wrong label off the page:
//
//  1. **Scoped per tile.** DOM ids are unique within a tile, not across the
//     catalog: `lf-type` is a Le Fort pattern in one tile and a Lisfranc one
//     in another. Extraction runs inside each tile's renderer block, so the
//     two never see each other's options.
//  2. **Checked against the registry.** A map is used only when it names
//     every value the MCP field declares. A select that does not offer the
//     declared values is not the select behind that field, and its labels are
//     dropped rather than guessed at.
//
// Anything unresolved falls back to the raw value, exactly as before -- the
// dynamic option lists (built from a lib constant at render time) are not
// statically readable, and this fails quiet rather than wrong.

import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const VIEWS = fileURLToPath(new URL('../../views/', import.meta.url));

// Slice a bracketed array literal starting at `[`, respecting nesting and
// quotes. A regex cannot do this: the option text routinely contains brackets
// and the lazy form stops at the first inner `]`.
function sliceArray(src, start) {
  let depth = 0;
  let quote = null;
  for (let i = start; i < src.length; i++) {
    const c = src[i];
    if (quote) {
      if (c === '\\') { i++; continue; }
      if (c === quote) quote = null;
      continue;
    }
    if (c === '\'' || c === '"' || c === '`') { quote = c; continue; }
    if (c === '[' || c === '{' || c === '(') depth++;
    else if (c === ']' || c === '}' || c === ')') {
      depth--;
      if (depth === 0 && c === ']') return src.slice(start, i + 1);
      if (depth < 0) return null;
    }
    if (i - start > 30000) return null;
  }
  return null;
}

// Views write options two ways: `{ value, text }` objects and `[value, text]`
// tuples. Tuples are read only when no object form matched, so an object list
// that happens to contain a nested array is not misread as a tuple list.
function parseOptions(body) {
  const out = new Map();
  const S = "(['\"`])";
  const TEXT = "((?:[^'\"`\\\\]|\\\\.)*?)";
  const objValueFirst = new RegExp(`\\{\\s*value:\\s*${S}(.*?)\\1\\s*,\\s*text:\\s*${S}${TEXT}\\3\\s*\\}`, 'g');
  const objTextFirst = new RegExp(`\\{\\s*text:\\s*${S}${TEXT}\\1\\s*,\\s*value:\\s*${S}(.*?)\\3\\s*\\}`, 'g');
  for (const m of body.matchAll(objValueFirst)) out.set(m[2], m[4]);
  for (const m of body.matchAll(objTextFirst)) out.set(m[4], m[2]);
  if (out.size === 0) {
    const tuple = new RegExp(`\\[\\s*${S}(.*?)\\1\\s*,\\s*${S}${TEXT}\\3\\s*\\]`, 'g');
    for (const m of body.matchAll(tuple)) out.set(m[2], m[4]);
  }
  return out;
}

// Within one renderer block, map every `'dom-id', [options]` (or
// `'dom-id', OPTIONS_CONST`) pair the block contains. First writer wins: a
// later `wire([...])` call listing the same id carries no options and cannot
// overwrite the real one.
function scanBlock(src, consts) {
  const map = new Map();
  const rx = /(['"])([A-Za-z][\w-]*)\1\s*,\s*(\[|[A-Za-z_$][\w$]*)/g;
  let m;
  while ((m = rx.exec(src))) {
    const dom = m[2];
    if (map.has(dom)) continue;
    let options = null;
    if (m[3] === '[') {
      const arr = sliceArray(src, rx.lastIndex - 1);
      if (arr) options = parseOptions(arr);
    } else if (consts.has(m[3])) {
      options = consts.get(m[3]);
    }
    if (options && options.size) map.set(dom, options);
  }
  return map;
}

// Module-level `const NAME = [...]` option lists, shared by several renderers
// in the same file (MMRC_OPTIONS and friends).
function moduleConsts(src) {
  const consts = new Map();
  for (const m of src.matchAll(/const\s+([A-Za-z_$][\w$]*)\s*=\s*\[/g)) {
    const arr = sliceArray(src, m.index + m[0].length - 1);
    if (!arr) continue;
    const options = parseOptions(arr);
    if (options.size) consts.set(m[1], options);
  }
  return consts;
}

/**
 * @returns {Map<string, Map<string, Map<string, string>>>} tile id -> DOM id -> value -> option text
 */
export function loadOptionLabels() {
  const byTile = new Map();
  for (const file of readdirSync(VIEWS).filter((f) => f.endsWith('.js'))) {
    const src = readFileSync(join(VIEWS, file), 'utf8');
    const consts = moduleConsts(src);
    // Renderer blocks are `  'tile-id'(root) {` / `  'tile-id': (root) => {`
    // at one indent inside the exported `renderers` object.
    const starts = [...src.matchAll(/^ {2}(['"])([A-Za-z0-9-]+)\1\s*[:(]/gm)];
    for (let i = 0; i < starts.length; i++) {
      const id = starts[i][2];
      const end = i + 1 < starts.length ? starts[i + 1].index : src.length;
      const map = scanBlock(src.slice(starts[i].index, end), consts);
      if (map.size && !byTile.has(id)) byTile.set(id, map);
    }
  }
  return byTile;
}

/**
 * The option text for `value` on `field`, or null when it cannot be resolved
 * safely. `field` is an MCP registry field record; `tileOptions` is one tile's
 * entry from `loadOptionLabels()`.
 */
export function optionText(tileOptions, field, value) {
  if (!tileOptions || !field || field.kind !== 'enum') return null;
  const options = tileOptions.get(field.dom);
  if (!options) return null;
  const declared = Array.isArray(field.values) ? field.values : [];
  if (!declared.length) return null;
  if (!declared.every((v) => options.has(String(v)))) return null;
  const text = options.get(String(value));
  return typeof text === 'string' && text.trim() ? text.trim() : null;
}
