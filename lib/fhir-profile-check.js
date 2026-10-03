// spec-v1626 shared module (the FHIR half of `schema-check`): check a FHIR R4 resource against a profile's
// snapshot -- cardinality, data types, fixed and pattern values, required bindings to a value set the profile
// set ships, and slices (value, pattern, type and profile discriminators, extensions by url). FHIRPath
// invariants are not evaluated; the result counts how many the profile states so the reader knows what was
// not checked. Pure: the caller passes the reduced snapshots (see scripts/build-pas-profiles.mjs).
//
// A reduced element: { id, path, min, max, slice?, slicing?: { d: [{ type, path }], rules }, type?: [{ code,
// profile?, targetProfile? }], fixed*?, pattern*?, binding? }.

const PRIMITIVE = {
  boolean: (v) => typeof v === 'boolean',
  integer: (v) => Number.isInteger(v),
  positiveInt: (v) => Number.isInteger(v) && v > 0,
  unsignedInt: (v) => Number.isInteger(v) && v >= 0,
  decimal: (v) => typeof v === 'number' && Number.isFinite(v),
  string: (v) => typeof v === 'string' && v.length > 0,
  markdown: (v) => typeof v === 'string' && v.length > 0,
  code: (v) => typeof v === 'string' && /^[^\s]+( [^\s]+)*$/.test(v),
  id: (v) => typeof v === 'string' && /^[A-Za-z0-9\-.]{1,64}$/.test(v),
  uri: (v) => typeof v === 'string' && !/\s/.test(v) && v.length > 0,
  url: (v) => typeof v === 'string' && !/\s/.test(v) && v.length > 0,
  canonical: (v) => typeof v === 'string' && !/\s/.test(v) && v.length > 0,
  oid: (v) => typeof v === 'string' && /^urn:oid:[0-2](\.(0|[1-9][0-9]*))+$/.test(v),
  uuid: (v) => typeof v === 'string' && /^urn:uuid:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(v),
  base64Binary: (v) => typeof v === 'string' && /^(\s*([0-9a-zA-Z+/=]){4}\s*)+$/.test(v),
  date: (v) => typeof v === 'string' && /^\d{4}(-(0[1-9]|1[0-2])(-(0[1-9]|[12]\d|3[01]))?)?$/.test(v),
  dateTime: (v) => typeof v === 'string' && /^\d{4}(-(0[1-9]|1[0-2])(-(0[1-9]|[12]\d|3[01])(T([01]\d|2[0-3]):[0-5]\d:([0-5]\d|60)(\.\d+)?(Z|[+-]((0\d|1[0-3]):[0-5]\d|14:00)))?)?)?$/.test(v),
  instant: (v) => typeof v === 'string' && /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])T([01]\d|2[0-3]):[0-5]\d:([0-5]\d|60)(\.\d+)?(Z|[+-]((0\d|1[0-3]):[0-5]\d|14:00))$/.test(v),
  time: (v) => typeof v === 'string' && /^([01]\d|2[0-3]):[0-5]\d:([0-5]\d|60)(\.\d+)?$/.test(v),
};
const upper = (s) => s.charAt(0).toUpperCase() + s.slice(1);
// Snapshots type id, url and extension values with the FHIRPath system types.
const SYSTEM = { String: 'string', Boolean: 'boolean', Integer: 'integer', Decimal: 'decimal', Date: 'date', DateTime: 'dateTime', Time: 'time' };
const typeName = (code) => { const m = /^http:\/\/hl7\.org\/fhirpath\/System\.(\w+)$/.exec(code || ''); return m ? (SYSTEM[m[1]] || 'string') : code; };
const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const canonicalUrl = (u) => String(u || '').split('|')[0];

// matches(value, pattern): every property the pattern states is in the value, recursively; arrays match when
// each pattern item matches some value item (FHIR pattern[x] semantics).
export function matches(value, pattern) {
  if (Array.isArray(pattern)) return Array.isArray(value) && pattern.every((p) => value.some((v) => matches(v, p)));
  if (isObj(pattern)) return isObj(value) && Object.entries(pattern).every(([k, p]) => matches(value[k], p));
  return value === pattern;
}
const deepEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const fixedOf = (e) => Object.entries(e).find(([k]) => k.startsWith('fixed'));
const patternOf = (e) => Object.entries(e).find(([k]) => k.startsWith('pattern'));

// index(profile) -> elements by id, and each element's direct children (ids one segment longer).
function index(elements) {
  const byId = new Map(elements.map((e) => [e.id, e]));
  const kids = new Map();
  for (const e of elements) {
    const cut = e.id.lastIndexOf('.');
    if (cut < 0) continue;
    const parent = e.id.slice(0, cut);
    if (!kids.has(parent)) kids.set(parent, []);
    kids.get(parent).push(e);
  }
  return { byId, kids };
}

// The values an element names in an object: a plain name, or a choice element's typed keys.
function valuesFor(obj, name) {
  if (name.endsWith('[x]')) {
    const stem = name.slice(0, -3);
    const keys = Object.keys(obj).filter((k) => k.startsWith(stem) && /^[A-Z]/.test(k.slice(stem.length)));
    return keys.flatMap((k) => { const v = obj[k]; return (Array.isArray(v) ? v : [v]).map((x) => ({ value: x, key: k, type: k.slice(stem.length) })); });
  }
  const v = obj[name];
  if (v === undefined) return [];
  return (Array.isArray(v) ? v : [v]).map((x) => ({ value: x, key: name }));
}

function discriminatorValue(d, sliceEls, sliceId) {
  // The value the slice fixes at the discriminator path, read from the slice's own child element.
  const at = d.path === '$this' ? sliceId : `${sliceId}.${d.path}`;
  const el = sliceEls.get(at);
  return el ? (fixedOf(el) || patternOf(el) || [])[1] : undefined;
}

function itemAt(item, path) {
  if (path === '$this') return [item];
  let cur = [item];
  for (const seg of path.split('.')) {
    if (seg === 'resolve()') return cur;
    cur = cur.flatMap((c) => (isObj(c) ? valuesFor(c, seg).map((x) => x.value) : []));
  }
  return cur;
}

export function createChecker({ profiles, valueSets = {} }) {
  const cache = new Map();
  const getIndex = (url) => {
    const key = canonicalUrl(url);
    if (!profiles[key]) return null;
    if (!cache.has(key)) cache.set(key, { ...index(profiles[key].elements), profile: profiles[key] });
    return cache.get(key);
  };

  // check(resource, profileUrl, path, add, ctx) -- add(severity, location, message).
  function check(resource, profileUrl, location, add, ctx = {}) {
    const ix = getIndex(profileUrl);
    if (!ix) { add('warning', location, `is not checked: the profile ${canonicalUrl(profileUrl)} is not in the set this tool ships.`); return; }
    const root = ix.profile.type;
    if (resource.resourceType && root !== resource.resourceType && !/^[a-z]/.test(root)) {
      add('error', location, `is a ${resource.resourceType}; the profile ${ix.profile.name || canonicalUrl(profileUrl)} is for ${root}.`);
      return;
    }
    walk(resource, root, ix, location, add, ctx);
  }

  function checkValueType(v, typeCode, location, add) {
    if (PRIMITIVE[typeCode]) {
      if (!PRIMITIVE[typeCode](v)) add('error', location, `must be a FHIR ${typeCode}; found ${JSON.stringify(v).slice(0, 60)}.`);
      return false;
    }
    if (!isObj(v)) { add('error', location, `must be a ${typeCode} object; found ${JSON.stringify(v).slice(0, 60)}.`); return false; }
    return true;
  }

  // walk(obj, elementId, ix, location): check obj's children against the element's child definitions.
  function walk(obj, elId, ix, location, add, ctx) {
    const plain = (ix.kids.get(elId) || []).filter((e) => !e.id.slice(e.id.lastIndexOf('.') + 1).includes(':'));
    for (const e of plain) {
      const name = e.id.slice(e.id.lastIndexOf('.') + 1);
      const vals = valuesFor(obj, name);
      if (e.min > 0 && vals.length < e.min) add('error', `${location}.${name}`, `is required (at least ${e.min}); ${vals.length ? `found ${vals.length}` : 'it is missing'}.`);
      if (e.max !== '*' && e.max != null && vals.length > Number(e.max)) add('error', `${location}.${name}`, `allows at most ${e.max}; found ${vals.length}.`);
      if (e.max === '0' && vals.length) continue;
      const fixed = fixedOf(e); const pattern = patternOf(e);
      vals.forEach((x, i) => {
        const at = vals.length > 1 || Array.isArray(obj[x.key]) ? `${location}.${x.key}[${i}]` : `${location}.${x.key}`;
        const types = e.type || [];
        const typeCode = typeName(x.type ? (types.find((t) => upper(typeName(t.code)) === x.type) || {}).code : types.length === 1 ? types[0].code : null);
        if (x.type && !typeCode) { add('error', at, `is a ${x.type}, which this element does not allow (${types.map((t) => t.code).join(', ')}).`); return; }
        if (fixed && !deepEqual(x.value, fixed[1])) add('error', at, `must be exactly ${JSON.stringify(fixed[1]).slice(0, 80)}.`);
        if (pattern && !matches(x.value, pattern[1])) add('error', at, `must match ${JSON.stringify(pattern[1]).slice(0, 80)}.`);
        if (e.binding && valueSets[canonicalUrl(e.binding)]) bindingCheck(x.value, typeCode, valueSets[canonicalUrl(e.binding)], at, add);
        if (typeCode && !checkValueType(x.value, typeCode, at, add)) return;
        if (typeCode === 'Reference' && ctx.onReference) ctx.onReference(x.value, types.find((t) => t.code === 'Reference'), at);
        if (ix.kids.has(e.id)) walk(x.value, e.id, ix, at, add, ctx);
      });
      if (e.slicing) slices(vals, e, ix, `${location}.${name}`, add, ctx);
    }
  }

  function bindingCheck(v, typeCode, vs, at, add) {
    const codings = typeCode === 'code' ? [{ code: v }] : typeCode === 'Coding' ? [v] : typeCode === 'CodeableConcept' ? (v.coding || []) : [];
    if (!codings.length) return;
    if (!codings.some((c) => vs.codes.includes(c.code))) add('error', at, `must use a code from ${vs.name || 'the bound value set'} (${vs.codes.slice(0, 6).join(', ')}${vs.codes.length > 6 ? ', ...' : ''}).`);
  }

  // slices: assign each item to a slice by its discriminators, check each slice's cardinality and walk the
  // item against the slice's child definitions.
  function slices(vals, e, ix, location, add, ctx) {
    const items = vals.map((x) => x.value);
    const defs = (ix.kids.get(e.id.slice(0, e.id.lastIndexOf('.'))) || []).filter((s) => s.path === e.path && s.slice && s.id === `${e.id}:${s.slice}`);
    if (!defs.length) return;
    const sliceEls = new Map();
    for (const d of defs) {
      const stack = [d.id];
      while (stack.length) { const id = stack.pop(); const el = ix.byId.get(id); if (el) sliceEls.set(id, el); for (const k of ix.kids.get(id) || []) stack.push(k.id); }
    }
    const fits = (item, def, i) => (e.slicing.d || []).every((d) => {
      if (d.type === 'type' && d.path === '$this' && vals[i].type) {
        // A choice element sliced by type: the slice names the type the value's key carries.
        return (def.type || []).some((t) => upper(typeName(t.code)) === vals[i].type);
      }
      if (d.type === 'type') {
        const types = (sliceEls.get(d.path === '$this' ? def.id : `${def.id}.${d.path}`) || def).type || [];
        const got = itemAt(item, d.path)[0];
        return Boolean(got && types.some((t) => t.code === got.resourceType));
      }
      if (d.type === 'profile') {
        const el = sliceEls.get(d.path === '$this' ? def.id : `${def.id}.${d.path.replace('.resolve()', '')}`) || def;
        const want = (el.type || []).flatMap((t) => [...(t.profile || []), ...(t.targetProfile || [])]).map(canonicalUrl);
        const got = itemAt(item, d.path).flatMap((r) => ((r && r.meta && r.meta.profile) || []).map(canonicalUrl));
        return want.some((w) => got.includes(w));
      }
      const want = discriminatorValue(d, sliceEls, def.id);
      // An extension slice whose url child is not in the snapshot is named by its extension profile.
      if (want === undefined) return d.path === 'url' ? (def.type || []).some((t) => (t.profile || []).map(canonicalUrl).includes(canonicalUrl(item.url))) : false;
      return itemAt(item, d.path).some((v) => (d.type === 'pattern' ? matches(v, want) : deepEqual(v, want)));
    });
    const counts = new Map(defs.map((d) => [d.slice, 0]));
    items.forEach((item, i) => {
      const hit = defs.find((d) => fits(item, d, i));
      if (!hit) {
        if (e.slicing.rules === 'closed') add('error', `${location}[${i}]`, 'matches none of the slices this closed element allows.');
        return;
      }
      counts.set(hit.slice, counts.get(hit.slice) + 1);
      if (ix.kids.has(hit.id)) walk(item, hit.id, ix, `${location}[${i}]`, add, ctx);
      const res = (hit.type || []).find((t) => t.profile);
      if (res && res.code === 'Extension' && ctx.checkExtension) ctx.checkExtension(item, res.profile[0], `${location}[${i}]`);
    });
    for (const d of defs) {
      const n = counts.get(d.slice);
      if (d.min > 0 && n < d.min) add('error', location, `needs ${d.min === 1 ? 'a' : `at least ${d.min}`} "${d.slice}" ${d.min === 1 ? 'entry' : 'entries'}; found ${n}.`);
      if (d.max !== '*' && n > Number(d.max)) add('error', location, `allows at most ${d.max} "${d.slice}" ${Number(d.max) === 1 ? 'entry' : 'entries'}; found ${n}.`);
    }
  }

  return { check, getIndex };
}
