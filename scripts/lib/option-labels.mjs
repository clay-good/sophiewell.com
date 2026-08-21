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
//
// Tried and reverted: walking one level into an export that is a lookup keyed
// by variant, so `opts(M.ONSET_ITEMS.hepatocellular)` would resolve. It gains
// one row and risks a wrong one. rucam's two scales share every option VALUE
// and disagree on four of the seven option TEXTS -- "Prior exposure, onset 1
// to 15 days" on the hepatocellular scale, "1 to 90 days" on the cholestatic
// one -- so resolving to whichever branch the view happens to name in a
// literal prints the other scale's wording as if it were this one's.
// test/unit/mcp-enum-values.test.js caught it on the sibling field, where the
// values differ too. A raw token is a token the reader can see is a token; a
// confident wrong label is not.

import { readFileSync, readdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const VIEWS = fileURLToPath(new URL('../../views/', import.meta.url));
const LIB = fileURLToPath(new URL('../../lib/', import.meta.url));

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
  // The text runs to its own closing delimiter, whichever one opened it. The
  // first cut excluded all three quote characters from the text regardless,
  // and did so silently: `['A', 'A - complete filling ("white-out")']` never
  // matched, so the whole Barrack grade list came back short and the registry
  // check refused it. A quote inside option text is ordinary -- a nickname for
  // a radiographic sign, a quoted grade name -- and every one of them dropped
  // its select.
  //
  // So the text is anything at all, lazily, closed by a back-reference to the
  // delimiter that opened it. Lazy plus back-reference stops at the first
  // unescaped matching quote, which is the end of the string and nowhere else;
  // `\\.` leads the alternation so an escaped delimiter is consumed rather
  // than treated as the close.
  const TEXT = '((?:\\\\.|[\\s\\S])*?)';
  const objValueFirst = new RegExp(`\\{\\s*value:\\s*${S}(.*?)\\1\\s*,\\s*text:\\s*${S}${TEXT}\\3\\s*\\}`, 'g');
  const objTextFirst = new RegExp(`\\{\\s*text:\\s*${S}${TEXT}\\1\\s*,\\s*value:\\s*${S}(.*?)\\3\\s*\\}`, 'g');
  for (const m of body.matchAll(objValueFirst)) out.set(m[2], m[4]);
  for (const m of body.matchAll(objTextFirst)) out.set(m[4], m[2]);
  // `el('option', { value: 'x', text: 'X' })` -- the same pair written as an
  // element call rather than a plain object, which is how the older views
  // build a select.
  if (out.size === 0) {
    const elValueFirst = new RegExp(`value:\\s*${S}(.*?)\\1\\s*,\\s*text:\\s*${S}${TEXT}\\3`, 'g');
    for (const m of body.matchAll(elValueFirst)) out.set(m[2], m[4]);
  }
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
  const put = (dom, options) => {
    if (dom && options && options.size && !map.has(dom)) map.set(dom, options);
  };

  // `el('select', { id: 'dom-id' }, [ el('option', ...), ... ])`: the id is
  // inside the attribute object, so the option array does not follow the id
  // directly -- it follows the object's closing brace.
  const inAttrs = /id:\s*(['"])([A-Za-z][\w-]*)\1[^{}]*\}\s*,\s*\[/g;
  let a;
  while ((a = inAttrs.exec(src))) {
    const arr = sliceArray(src, inAttrs.lastIndex - 1);
    if (arr) put(a[2], parseOptions(arr));
  }

  // `'dom-id', [...]`, `'dom-id', CONST`, `'dom-id', M.CONST`, and the wrapped
  // form `'dom-id', CHOICE(CONST)` -- a helper that prepends a blank "choose"
  // row and otherwise passes the list through untouched. Only a call whose
  // single argument is a list already known by name is unwrapped; anything
  // computed stays unresolved.
  const rx = /(['"])([A-Za-z][\w-]*)\1\s*,\s*(\[|[A-Za-z_$][\w$.]*\s*\(\s*[A-Za-z_$][\w$.]*\s*\)|[A-Za-z_$][\w$.]*)/g;
  let m;
  while ((m = rx.exec(src))) {
    const dom = m[2];
    if (map.has(dom)) continue;
    let options = null;
    const token = m[3].trim();
    if (token === '[') {
      const arr = sliceArray(src, rx.lastIndex - 1);
      if (arr) options = parseOptions(arr);
    } else {
      const call = token.match(/^[A-Za-z_$][\w$.]*\s*\(\s*([A-Za-z_$][\w$.]*)\s*\)$/);
      const name = call ? call[1] : token;
      if (consts.has(name)) options = consts.get(name);
    }
    put(dom, options);
  }
  return map;
}

// --- Option lists that live in `lib/`, not in the view.
//
// A view routinely writes `select('Disease stage', 'ebmt-stage', opts(M.STAGE_BANDS))`:
// the labels are in the lib module the tile computes with, and the view only
// reshapes them. Reading them back out of the source is hopeless -- so the lib
// module is imported and the array read directly. These modules are pure
// arithmetic and touch no DOM, which is why they can be loaded under Node at
// all; anything that throws on import is skipped and its tile falls back to the
// raw value, same as before.
//
// An array counts as an option list only when every element carries a value and
// a text, in either the object or the tuple form. That rules out the score
// tables and threshold arrays that sit beside them in the same module.
function optionsFromArray(arr) {
  if (!Array.isArray(arr) || !arr.length) return null;
  const out = new Map();
  for (const item of arr) {
    if (Array.isArray(item)) {
      if (item.length < 2 || typeof item[1] !== 'string') return null;
      out.set(String(item[0]), item[1]);
      continue;
    }
    if (!item || typeof item !== 'object') return null;
    const { value, text } = item;
    if (value === undefined || typeof text !== 'string') return null;
    out.set(String(value), text);
  }
  return out.size ? out : null;
}

async function importedConsts(src, fileUrl) {
  const consts = new Map();
  const rx = /import\s+(?:\*\s+as\s+([A-Za-z_$][\w$]*)|\{([^}]*)\})\s+from\s+(['"])([^'"]+)\3/g;
  let m;
  while ((m = rx.exec(src))) {
    const [, namespace, named, , spec] = m;
    if (!spec.startsWith('.')) continue;
    let mod;
    try {
      mod = await import(new URL(spec, fileUrl).href);
    } catch {
      continue;
    }
    if (namespace) {
      for (const [key, value] of Object.entries(mod)) {
        const options = optionsFromArray(value);
        if (options) consts.set(`${namespace}.${key}`, options);
      }
      continue;
    }
    for (const part of named.split(',')) {
      const name = part.trim().split(/\s+as\s+/).pop().trim();
      if (!name) continue;
      const options = optionsFromArray(mod[name]);
      if (options) consts.set(name, options);
    }
  }
  return consts;
}

// Field descriptor objects -- `{ key, dom: 'dom-id', label, opts: [...] }` --
// listed once and built in a loop. These sit at module scope, outside every
// renderer block, so the per-tile scan cannot see them.
//
// Scoping is recovered rather than dropped: a descriptor is offered to a tile
// only when the renderer block names the DOM id outright, or the id is
// prefixed with the tile's own id (`cheops-cry` belongs to `cheops`), or the
// file defines a single renderer and there is nothing else it could belong to.
// The registry check in `optionText` still has to pass on top of that.
function moduleDescriptors(src) {
  const map = new Map();
  const rx = /dom:\s*(['"])([A-Za-z][\w-]*)\1[\s\S]{0,200}?\bopts:\s*\[/g;
  let m;
  while ((m = rx.exec(src))) {
    const arr = sliceArray(src, rx.lastIndex - 1);
    if (!arr || map.has(m[2])) continue;
    const options = parseOptions(arr);
    if (options.size) map.set(m[2], options);
  }
  return map;
}

function adoptDescriptors(map, descriptors, tileId, block, soleRenderer) {
  for (const [dom, options] of descriptors) {
    if (map.has(dom)) continue;
    if (!(soleRenderer || dom.startsWith(`${tileId}-`) || block.includes(`'${dom}'`) || block.includes(`"${dom}"`))) continue;
    map.set(dom, options);
  }
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

// Renderer blocks sit at one indent inside the exported `renderers` object:
// `  'tile-id'(root) {`, `  'tile-id': (root) => {`, and -- for the ids that
// happen to be valid identifiers -- `  roi(root) {` with no quotes at all.
function rendererStarts(src) {
  return [...src.matchAll(/^ {2}(?:(['"])([A-Za-z0-9-]+)\1|([A-Za-z][\w$]*))\s*[:(]/gm)]
    .map((m) => ({ id: m[2] || m[3], index: m.index }));
}

/**
 * @returns {Map<string, Map<string, Map<string, string>>>} tile id -> DOM id -> value -> option text
 */
export async function loadOptionLabels() {
  const byTile = new Map();
  for (const file of readdirSync(VIEWS).filter((f) => f.endsWith('.js'))) {
    const path = join(VIEWS, file);
    const src = readFileSync(path, 'utf8');
    const consts = moduleConsts(src);
    // A lib list is a fallback: a name defined in the view itself wins, since
    // that is the list the select was actually built from.
    for (const [name, options] of await importedConsts(src, pathToFileURL(path))) {
      if (!consts.has(name)) consts.set(name, options);
    }
    const descriptors = moduleDescriptors(src);
    const starts = rendererStarts(src);
    for (let i = 0; i < starts.length; i++) {
      const id = starts[i].id;
      const end = i + 1 < starts.length ? starts[i + 1].index : src.length;
      const block = src.slice(starts[i].index, end);
      const map = scanBlock(block, consts);
      adoptDescriptors(map, descriptors, id, block, starts.length === 1);
      if (map.size && !byTile.has(id)) byTile.set(id, map);
    }
  }
  libBanks = await loadLibBanks();
  return byTile;
}

// --- The option lists a view never names.
//
// Some tiles hand a whole bank to a builder -- `buildTile(root, { prefix:
// 'loeb', sites: M.LOEB_SITES })` -- which mints the DOM ids inside itself, so
// nothing in the view file ties `LOEB_SITES` to a DOM id and the scan above
// resolves nothing. 24 example rows printed the raw token instead: a nurse
// reading /tools/loeb-minimum-criteria/ saw "uti-no-catheter" where the select
// on screen reads "Urinary tract -- without indwelling catheter".
//
// The DOM id is not the only way to identify the right list. A bank that
// carries every value the MCP field declares, when it is the only bank in
// `lib/` that does, is that field's list -- which is rule 2 above doing the
// scoping on its own, without the DOM id. Ambiguity is refused rather than
// guessed at: across the catalog no field has two covering banks, and if one
// ever does, neither is used.
let libBanks = null;

// A bank writes its display string as `label` where a view's inline option
// list writes `text`, because the bank is a data record the renderer turns
// into an option rather than the option itself. Accepted only here, so the
// view scan keeps meaning exactly what it meant.
function bankFromArray(arr) {
  const out = new Map();
  for (const item of arr) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return null;
    const { value } = item;
    const shown = typeof item.text === 'string' ? item.text : item.label;
    if (value === undefined || typeof shown !== 'string' || !shown.trim()) return null;
    out.set(String(value), shown);
  }
  return out.size ? out : null;
}

async function loadLibBanks() {
  const banks = [];
  for (const file of readdirSync(LIB).filter((f) => f.endsWith('.js'))) {
    let mod;
    try { mod = await import(pathToFileURL(join(LIB, file)).href); } catch { continue; }
    for (const value of Object.values(mod)) {
      // Two entries at least: a one-entry array names nothing and would match
      // any single-value field.
      if (!Array.isArray(value) || value.length < 2) continue;
      const options = bankFromArray(value);
      if (options) banks.push(options);
    }
  }
  return banks;
}

function bankText(declared, value) {
  if (!libBanks) return null;
  const covering = libBanks.filter((b) => declared.every((v) => b.has(String(v))));
  if (covering.length !== 1) return null;
  const text = covering[0].get(String(value));
  return typeof text === 'string' && text.trim() ? text.trim() : null;
}

/**
 * The option text for `value` on `field`, or null when it cannot be resolved
 * safely. `field` is an MCP registry field record; `tileOptions` is one tile's
 * entry from `loadOptionLabels()`.
 */
export function optionText(tileOptions, field, value) {
  if (!field || field.kind !== 'enum') return null;
  const declared = Array.isArray(field.values) ? field.values : [];
  if (!declared.length) return null;
  const options = tileOptions?.get(field.dom);
  if (!options || !declared.every((v) => options.has(String(v)))) {
    return bankText(declared, value);
  }
  const text = options.get(String(value));
  return typeof text === 'string' && text.trim() ? text.trim() : null;
}

// --- Field labels for the tiles with no MCP adapter.
//
// Twenty-four tiles are not exposed over MCP -- document builders, timers, and
// question flows -- so there is no field registry to read a label off. Nineteen
// of them do have a worked example in META, and their pages printed no example
// at all: the reader was told what the tool answers without being shown one
// filled-in run of it.
//
// The label is in the view, in the same call that names the DOM id:
// `field('Insertion timestamp', 'dd-ins', ...)`. Only calls to a field-building
// helper are read -- `setAttribute('aria-live', 'polite')` is the same shape and
// is not a label.
const FIELD_HELPER = /field|num|select|check|number|grade|scale|point|score|money|range|date|textarea|pick|time|text/i;
// `f29d` / `s29d` and friends: the same helpers, named for the spec that added
// them rather than for what they build.
const FIELD_HELPER_ALIAS = /^[fs]\d*[a-z]*$/i;
const isFieldHelper = (name) => FIELD_HELPER.test(name) || FIELD_HELPER_ALIAS.test(name);

/**
 * @returns {Map<string, Map<string, string>>} tile id -> DOM id -> field label
 */
export function loadFieldLabels() {
  const byTile = new Map();
  for (const file of readdirSync(VIEWS).filter((f) => f.endsWith('.js'))) {
    const src = readFileSync(join(VIEWS, file), 'utf8');
    const starts = rendererStarts(src);
    for (let i = 0; i < starts.length; i++) {
      const id = starts[i].id;
      if (byTile.has(id)) continue;
      const end = i + 1 < starts.length ? starts[i + 1].index : src.length;
      const block = src.slice(starts[i].index, end);
      const map = new Map();
      const rx = /([A-Za-z_$][\w$]*)\(\s*(['"`])((?:[^'"`\\]|\\.){2,160}?)\2\s*,\s*(['"])([a-z][\w-]*)\4/g;
      let m;
      while ((m = rx.exec(block))) {
        const [, helper, , label, , dom] = m;
        if (!isFieldHelper(helper)) continue;
        if (!/[A-Za-z]/.test(label)) continue;
        if (!map.has(dom)) map.set(dom, label.trim());
      }
      // `el('label', { for: 'dom-id', text: 'Label' })`: the label element
      // written out by hand, in either key order.
      const forFirst = /\bfor:\s*(['"])([a-z][\w-]*)\1\s*,\s*text:\s*(['"`])((?:[^'"`\\]|\\.){2,160}?)\3/g;
      const textFirst = /\btext:\s*(['"`])((?:[^'"`\\]|\\.){2,160}?)\1\s*,\s*for:\s*(['"])([a-z][\w-]*)\3/g;
      for (const m of block.matchAll(forFirst)) if (!map.has(m[2])) map.set(m[2], m[4].trim());
      for (const m of block.matchAll(textFirst)) if (!map.has(m[4])) map.set(m[4], m[2].trim());

      // Several tiles list their fields as `[label, id]` tuples and build them
      // in a loop, so the label never appears in the same call as the id. The
      // pair is read label-first: an option list is `[value, text]`, the other
      // way round, and its first element is the token, not the sentence.
      const tuple = /\[\s*(['"`])((?:[^'"`\\]|\\.){2,160}?)\1\s*,\s*(['"])([a-z][\w-]*)\3\s*[,\]]/g;
      let t;
      while ((t = tuple.exec(block))) {
        const label = t[2].trim();
        const dom = t[4];
        if (map.has(dom) || !/[A-Za-z]/.test(label)) continue;
        if (!/[A-Z]/.test(label) && !label.includes(' ')) continue;
        map.set(dom, label);
      }
      if (map.size) byTile.set(id, map);
    }
  }
  return byTile;
}

/**
 * The option text for a raw value on a tile with no MCP registry entry to
 * check against. Per-tile scoping is the only guard available here, and it is
 * the one that matters: the map came from this tile's own renderer block.
 */
export function looseOptionText(tileOptions, dom, value) {
  const text = tileOptions?.get(dom)?.get(String(value));
  return typeof text === 'string' && text.trim() ? text.trim() : null;
}
