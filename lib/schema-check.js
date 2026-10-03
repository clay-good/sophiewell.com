// spec-v1626 shared module: a JSON Schema checker for the draft-07 keywords the CMS Transparency in
// Coverage schemas use. A keyword draft-07 does not define is ignored, as a draft-07 validator ignores
// it (the allowed-amounts schema states dependentRequired; CMS's own sample breaks it, and
// lib/tic-file-check.js reports it as a note instead). check() validates a whole value; walk()
// validates while reading a lib/json-stream.js parser, so an array of millions of items is checked one
// item at a time and never held whole.
//
// Findings go to add(code, location, message), with location as a JSON path ($.in_network[3].name).

const MAX_DEPTH = 64;
// A streamed object or array has been checked where it was read; checking its stand-in again would
// report its absent children. The parent still sees the key as present.
const STREAMED = Symbol('streamed');

const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const typeName = (v) => (v === null ? 'null' : Array.isArray(v) ? 'array' : typeof v === 'number' ? (Number.isInteger(v) ? 'integer' : 'number') : typeof v);
const typeOk = (t, v) => (t === 'integer' ? Number.isInteger(v) : t === 'number' ? typeof v === 'number' : t === 'array' ? Array.isArray(v) : t === 'object' ? isObject(v) : t === 'null' ? v === null : typeof v === t);
const show = (v) => { const s = JSON.stringify(v); return s.length > 60 ? `${s.slice(0, 57)}...` : s; };
const isDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s) && new Date(`${s}T00:00:00Z`).toISOString().slice(0, 10) === s;
const isUri = (s) => { try { new URL(s); return true; } catch { return false; } };

export const pathKey = (path, key) => (typeof key === 'number' ? `${path}[${key}]` : /^[A-Za-z_][A-Za-z0-9_]*$/.test(key) ? `${path}.${key}` : `${path}[${JSON.stringify(key)}]`);

// canonical(v): one string per JSON value regardless of key order, for uniqueItems.
export const canonical = (v) => (Array.isArray(v) ? `[${v.map(canonical).join(',')}]` : isObject(v) ? `{${Object.keys(v).sort().map((k) => `${JSON.stringify(k)}:${canonical(v[k])}`).join(',')}}` : JSON.stringify(v));

// A long canonical string is kept as a 53-bit hash and its length, so a uniqueness set over a large
// array stays small.
function fingerprint(s) {
  if (s.length <= 512) return s;
  let h1 = 0xdeadbeef; let h2 = 0x41c6ce57;
  for (let i = 0; i < s.length; i += 1) { const c = s.charCodeAt(i); h1 = Math.imul(h1 ^ c, 2654435761); h2 = Math.imul(h2 ^ c, 1597334677); }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return `#${(4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36)}:${s.length}`;
}

export function resolve(schema, root) {
  let s = schema; let hops = 0;
  while (s && s.$ref) {
    if (!s.$ref.startsWith('#/') || (hops += 1) > 32) throw new Error(`Unsupported schema reference ${s.$ref}.`);
    s = s.$ref.slice(2).split('/').reduce((o, k) => (o ? o[k] : undefined), root);
  }
  return s || {};
}

const objectLike = (s) => s.type === 'object' || Boolean(s.properties);

// The keywords that test one value by itself. Returns false when the type is wrong, so nothing
// below it is tested against a value of another kind.
function checkLocal(v, s, path, add) {
  if (s.type && !(Array.isArray(s.type) ? s.type : [s.type]).some((t) => typeOk(t, v))) {
    add('type', path, `must be ${Array.isArray(s.type) ? s.type.join(' or ') : s.type === 'integer' ? 'a whole number' : s.type === 'array' || s.type === 'object' ? `an ${s.type}` : `a ${s.type}`}; found ${typeName(v)} ${show(v)}.`);
    return false;
  }
  if (s.enum && !s.enum.some((e) => canonical(e) === canonical(v))) add('enum', path, `must be one of ${s.enum.map((e) => JSON.stringify(e)).join(', ')}; found ${show(v)}.`);
  if (Object.hasOwn(s, 'const') && canonical(s.const) !== canonical(v)) add('const', path, `must be ${JSON.stringify(s.const)}; found ${show(v)}.`);
  if (typeof v === 'string') {
    if (s.minLength != null && [...v].length < s.minLength) add('minLength', path, s.minLength === 1 ? 'must not be empty.' : `must be at least ${s.minLength} characters; found ${[...v].length}.`);
    if (s.maxLength != null && [...v].length > s.maxLength) add('maxLength', path, `must be at most ${s.maxLength} characters; found ${[...v].length}.`);
    if (s.pattern && !new RegExp(s.pattern, 'u').test(v)) add('pattern', path, `does not match the required pattern ${s.pattern}; found ${show(v)}.`);
    if (s.format === 'date' && !isDate(v)) add('format', path, `must be a date as YYYY-MM-DD; found ${show(v)}.`);
    if (s.format === 'uri' && !isUri(v)) add('format', path, `must be a full URL; found ${show(v)}.`);
  }
  if (typeof v === 'number') {
    if (s.minimum != null && v < s.minimum) add('minimum', path, `must be at least ${s.minimum}; found ${v}.`);
    if (s.maximum != null && v > s.maximum) add('maximum', path, `must be at most ${s.maximum}; found ${v}.`);
    if (typeof s.exclusiveMinimum === 'number' && v <= s.exclusiveMinimum) add('exclusiveMinimum', path, `must be greater than ${s.exclusiveMinimum}; found ${v}.`);
    if (typeof s.exclusiveMaximum === 'number' && v >= s.exclusiveMaximum) add('exclusiveMaximum', path, `must be less than ${s.exclusiveMaximum}; found ${v}.`);
  }
  return true;
}

function arrayRules(count, duplicateAt, s, path, add) {
  if (s.minItems != null && count < s.minItems) add('minItems', path, s.minItems === 1 ? 'must list at least one item; it is empty.' : `must list at least ${s.minItems} items; found ${count}.`);
  if (s.maxItems != null && count > s.maxItems) add('maxItems', path, `must list at most ${s.maxItems} ${s.maxItems === 1 ? 'item' : 'items'}; found ${count}.`);
  if (s.uniqueItems && duplicateAt != null) add('uniqueItems', path, `must not repeat an item; item ${duplicateAt} repeats an earlier one.`);
}

const missing = (o, keys) => keys.filter((k) => !Object.hasOwn(o, k));

// dependencyGaps(o, deps) -> one sentence per present key whose listed companions are missing.
export function dependencyGaps(o, deps) {
  const out = [];
  for (const [k, need] of Object.entries(deps || {})) {
    if (!Object.hasOwn(o, k) || !Array.isArray(need)) continue;
    const gone = missing(o, need);
    if (gone.length) out.push(`has ${k}, so it must also have ${gone.join(', ')}.`);
  }
  return out;
}

// The object-level rules: required and dependencies, then if/then/else, anyOf and
// oneOf. `o` may be a shallow stand-in whose streamed children were checked already.
export function checkObjectLevel(o, s, root, path, add) {
  for (const k of missing(o, s.required || [])) add('required', pathKey(path, k), 'is required and missing.');
  for (const gone of dependencyGaps(o, s.dependencies)) add('dependencies', path, gone);
  combinators(o, s, root, path, add);
}

function trial(v, schema, root, path) {
  const errors = [];
  check(v, schema, root, path, (code, location, message) => errors.push({ code, location, message }));
  return errors;
}

function combinators(v, s, root, path, add) {
  if (s.if) {
    if (!trial(v, s.if, root, path).length) { if (s.then) check(v, s.then, root, path, add); } else if (s.else) check(v, s.else, root, path, add);
  }
  if (s.anyOf) {
    const runs = s.anyOf.map((b) => trial(v, b, root, path));
    if (!runs.some((r) => !r.length)) {
      const names = s.anyOf.every((b) => b.required && Object.keys(b).length === 1) ? s.anyOf.map((b) => b.required.join(' and ')) : null;
      add('anyOf', path, names ? `must have ${names.join(' or ')}; it has neither.` : `matches none of the ${s.anyOf.length} allowed forms.`);
    }
  }
  if (s.oneOf) {
    const runs = s.oneOf.map((b) => trial(v, b, root, path));
    const passed = runs.filter((r) => !r.length).length;
    if (passed === 0) {
      const closest = runs.reduce((a, b) => (b.length < a.length ? b : a));
      add('oneOf', path, `matches none of the ${s.oneOf.length} allowed forms. Closest: ${closest[0].location === path ? '' : `${closest[0].location} `}${closest[0].message}`);
    } else if (passed > 1) add('oneOf', path, `matches ${passed} of the allowed forms; exactly one is allowed.`);
  }
}

// check(value, schema, root, path, add): validate a whole value.
export function check(v, schema, root, path, add) {
  if (v && v[STREAMED]) return;
  const s = resolve(schema, root);
  if (!checkLocal(v, s, path, add)) return;
  if (Array.isArray(v)) {
    let duplicateAt = null;
    if (s.uniqueItems) { const seen = new Set(); v.forEach((item, i) => { const f = fingerprint(canonical(item)); if (seen.has(f) && duplicateAt == null) duplicateAt = i; seen.add(f); }); }
    if (s.items) v.forEach((item, i) => check(item, s.items, root, pathKey(path, i), add));
    arrayRules(v.length, duplicateAt, s, path, add);
    combinators(v, s, root, path, add);
  } else if (isObject(v)) {
    for (const [k, child] of Object.entries(v)) if (s.properties && Object.hasOwn(s.properties, k)) check(child, s.properties[k], root, pathKey(path, k), add);
    checkObjectLevel(v, s, root, path, add);
  } else combinators(v, s, root, path, add);
}

// skip(parser): read one value and discard it, holding nothing. JSON syntax is still enforced.
export async function skip(parser, depth = 0) {
  if (depth > MAX_DEPTH) throw new RangeError('JSON nesting exceeds 64 levels.');
  const t = await parser.next();
  if (t.type === 'value') return;
  if (t.type === '[') {
    if ((await parser.peek()).type === ']') { await parser.next(); return; }
    while (true) { await skip(parser, depth + 1); const sep = await parser.next(); if (sep.type === ']') return; if (sep.type !== ',') throw new SyntaxError('Expected a comma or closing bracket in a JSON array.'); }
  }
  if (t.type === '{') {
    if ((await parser.peek()).type === '}') { await parser.next(); return; }
    while (true) {
      const key = await parser.expect('value'); if (typeof key.value !== 'string') throw new SyntaxError('JSON object keys must be strings.');
      await parser.expect(':'); await skip(parser, depth + 1);
      const sep = await parser.next(); if (sep.type === '}') return; if (sep.type !== ',') throw new SyntaxError('Expected a comma or closing brace in a JSON object.');
    }
  }
  throw new SyntaxError(`Unexpected JSON token ${t.type}.`);
}

const streamed = (extra) => Object.assign({ [STREAMED]: true }, extra);

// walk(parser, schema, root, path, ctx): read the next value from the parser and validate it as
// check() would. Objects are read key by key; arrays of objects item by item (an array that must hold
// unique items keeps one fingerprint per item); a primitive or an array of primitives is read whole.
// ctx = { add, onValue(path, value) } -- onValue sees every value read whole, for cross-checks.
// Returns the value, or for a streamed object or array a stand-in (an array's carries its `count`).
export async function walk(parser, schema, root, path, ctx, depth = 0) {
  if (depth > MAX_DEPTH) throw new RangeError('JSON nesting exceeds 64 levels.');
  const s = resolve(schema, root);
  const next = (await parser.peek()).type;
  if (next === '{' && objectLike(s)) return walkObject(parser, s, root, path, ctx, depth);
  if (next === '[' && s.items && objectLike(resolve(s.items, root))) return walkArray(parser, s, root, path, ctx, depth);
  const v = await parser.value();
  check(v, s, root, path, ctx.add);
  ctx.onValue?.(path, v);
  return v;
}

async function walkObject(parser, s, root, path, ctx, depth) {
  await parser.expect('{');
  const shallow = {}; const keys = new Set();
  if ((await parser.peek()).type === '}') await parser.next();
  else {
    while (true) {
      const key = await parser.expect('value'); if (typeof key.value !== 'string') throw new SyntaxError('JSON object keys must be strings.');
      if (keys.has(key.value)) throw new SyntaxError(`Duplicate JSON key ${key.value} at ${path}.`); keys.add(key.value);
      await parser.expect(':');
      if (s.properties && Object.hasOwn(s.properties, key.value)) shallow[key.value] = await walk(parser, s.properties[key.value], root, pathKey(path, key.value), ctx, depth + 1);
      else { await skip(parser, depth + 1); shallow[key.value] = streamed(); }
      const sep = await parser.next(); if (sep.type === '}') break; if (sep.type !== ',') throw new SyntaxError('Expected a comma or closing brace in a JSON object.');
    }
  }
  checkObjectLevel(shallow, s, root, path, ctx.add);
  return streamed();
}

async function walkArray(parser, s, root, path, ctx, depth) {
  await parser.expect('[');
  const item = s.items; const seen = s.uniqueItems ? new Set() : null;
  let count = 0; let duplicateAt = null;
  if ((await parser.peek()).type === ']') await parser.next();
  else {
    while (true) {
      const at = pathKey(path, count);
      if (seen) {
        const v = await parser.value();
        check(v, item, root, at, ctx.add); ctx.onValue?.(at, v);
        const f = fingerprint(canonical(v)); if (seen.has(f) && duplicateAt == null) duplicateAt = count; seen.add(f);
      } else await walk(parser, item, root, at, ctx, depth + 1);
      count += 1;
      const sep = await parser.next(); if (sep.type === ']') break; if (sep.type !== ',') throw new SyntaxError('Expected a comma or closing bracket in a JSON array.');
    }
  }
  arrayRules(count, duplicateAt, s, path, ctx.add);
  return streamed({ count });
}
