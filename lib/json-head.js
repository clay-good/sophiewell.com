// spec-v1623 step 1 / spec-v1611 §2.3: what a JSON file is, from its head.
//
// A price file can be tens of gigabytes, so it is never parsed whole: a small
// tokenizer walks the first bytes and stops where the head ends, which is
// usually mid-value. It reports the top-level keys, the top-level
// `resourceType`, every nested `resourceType` it saw (a Bundle's entries),
// every string in a `profile` array (FHIR `meta.profile`), and whether the text
// is NDJSON. Pure; no DOM.

const MAX_DEPTH = 8;

// scanJsonHead(text) -> { kind: 'object' | 'array' | 'ndjson' | null, topKeys,
//   resourceType, nestedTypes, profiles, truncated }
export function scanJsonHead(input) {
  const text = String(input || '').replace(/^﻿/, '');
  const nd = ndjsonLines(text);
  if (nd) {
    const out = { kind: 'ndjson', topKeys: [], resourceType: null, nestedTypes: [], profiles: [], truncated: false };
    for (const obj of nd) {
      for (const k of Object.keys(obj)) if (!out.topKeys.includes(k)) out.topKeys.push(k);
      if (typeof obj.resourceType === 'string' && !out.nestedTypes.includes(obj.resourceType)) out.nestedTypes.push(obj.resourceType);
      for (const p of (obj.meta && Array.isArray(obj.meta.profile) ? obj.meta.profile : [])) if (typeof p === 'string' && !out.profiles.includes(p)) out.profiles.push(p);
    }
    return out;
  }
  return tokenize(text);
}

// NDJSON: the first three non-empty lines (or all of them, if fewer and the
// text ends) each parse as a JSON object. A pretty-printed object fails on its
// first line, "{", so it is never mistaken for NDJSON.
function ndjsonLines(text) {
  const lines = [];
  let start = 0;
  while (lines.length < 3) {
    const nl = text.indexOf('\n', start);
    if (nl === -1) break; // the last line may be cut off by the head; ignore it
    const line = text.slice(start, nl).trim();
    start = nl + 1;
    if (line) lines.push(line);
  }
  if (lines.length < 2) return null;
  const objs = [];
  for (const line of lines) {
    try {
      const v = JSON.parse(line);
      if (!v || typeof v !== 'object' || Array.isArray(v)) return null;
      objs.push(v);
    } catch { return null; }
  }
  return objs;
}

function tokenize(text) {
  const out = { kind: null, topKeys: [], resourceType: null, nestedTypes: [], profiles: [], truncated: true };
  let i = 0;
  const n = text.length;
  const ws = () => { while (i < n && ' \t\r\n'.includes(text[i])) i += 1; };
  // A string token; returns null when the head ends inside it.
  const str = () => {
    let s = '';
    i += 1;
    while (i < n) {
      const c = text[i];
      if (c === '"') { i += 1; return s; }
      if (c === '\\') {
        const e = text[i + 1];
        if (e === undefined) return null;
        if (e === 'u') { const h = text.slice(i + 2, i + 6); if (h.length < 4) return null; s += String.fromCharCode(parseInt(h, 16)); i += 6; continue; }
        s += ({ n: '\n', t: '\t', r: '\r', b: '\b', f: '\f' })[e] ?? e;
        i += 2;
        continue;
      }
      s += c;
      i += 1;
    }
    return null;
  };
  // Stack frames: { type: 'object' | 'array', key: current key, parentKey }
  const stack = [];
  ws();
  if (text[i] === '{') out.kind = 'object';
  else if (text[i] === '[') out.kind = 'array';
  else return { ...out, truncated: false };
  while (i < n) {
    ws();
    if (i >= n) break;
    const c = text[i];
    const top = stack.at(-1);
    if (c === '{' || c === '[') {
      stack.push({ type: c === '{' ? 'object' : 'array', key: null, parentKey: top ? top.key : null, expectKey: c === '{' });
      i += 1;
      if (stack.length > MAX_DEPTH + 1) { stack.pop(); skipValue(); }
      continue;
    }
    if (c === '}' || c === ']') {
      stack.pop();
      i += 1;
      if (!stack.length) { out.truncated = false; break; }
      continue;
    }
    if (c === ',') { i += 1; if (top && top.type === 'object') top.expectKey = true; continue; }
    if (c === ':') { i += 1; if (top) top.expectKey = false; continue; }
    if (c === '"') {
      const s = str();
      if (s === null) break;
      if (top && top.type === 'object' && top.expectKey) {
        top.key = s;
        if (stack.length === 1 && !out.topKeys.includes(s)) out.topKeys.push(s);
        continue;
      }
      // A string value.
      if (top && top.type === 'object' && top.key === 'resourceType') {
        if (stack.length === 1) out.resourceType = s;
        else if (!out.nestedTypes.includes(s)) out.nestedTypes.push(s);
      } else if (top && top.type === 'array' && top.parentKey === 'profile') {
        if (!out.profiles.includes(s)) out.profiles.push(s);
      }
      continue;
    }
    // A number, true, false or null.
    while (i < n && !',}] \t\r\n'.includes(text[i])) i += 1;
  }
  return out;

  // Past MAX_DEPTH, skip a whole value without recording anything in it.
  function skipValue() {
    let depth = 1;
    while (i < n && depth > 0) {
      const c = text[i];
      if (c === '"') { if (str() === null) return; continue; }
      if (c === '{' || c === '[') depth += 1;
      else if (c === '}' || c === ']') depth -= 1;
      i += 1;
    }
  }
}
