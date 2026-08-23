// spec-v183 §2.3: the field machinery shared by every adapter.
//
// An adapter declares a flat `fields` list. Each field bridges the three
// representations that already exist in the codebase but do not line up:
//
//   dom   - the input key the browser renderer (views/group-*.js) reads and the
//           key META[id].example.fields is keyed by. The MCP input contract is
//           keyed by these so an adapter's example round-trips with zero
//           re-typing (the spec-v183 §4.4 gate feeds example.fields straight
//           through toArgs).
//   arg   - the argument name the pure lib compute function expects.
//   kind  - 'number' | 'bool' | 'enum' | 'string', the coercion + validation.
//
// From that one list we derive both the published JSON Schema (documentation
// for the agent) and the default toArgs() that maps validated inputs onto the
// lib function's argument object. No coefficient, citation, or expected value
// is ever re-typed here.

// True for the values a checkbox-origin input can legitimately carry: a real
// boolean, or the DOM-string / select forms the renderer and META.example use.
function isBoolLike(v) {
  return v === true || v === false
    || v === 1 || v === 0
    || v === '1' || v === '0'
    || v === 'true' || v === 'false'
    || v === 'yes' || v === 'no';
}

function toBool(v) {
  return v === true || v === 1 || v === '1' || v === 'true' || v === 'yes';
}

// The values of a 0..max scored scale, as the strings a <select> carries. A
// scale item is a number to the calculator -- its points get summed -- and a
// fixed set of options to the person answering it, and `values` is how a
// descriptor says both at once.
export function scaleValues(max, min = 0) {
  const out = [];
  for (let i = min; i <= max; i += 1) out.push(String(i));
  return out;
}

// Build the published JSON Schema for one calculator's { inputs } object. This
// is the machine-readable contract describe_calculator returns; it documents
// the ideal type for an agent. Validation (validateInputs) is intentionally a
// touch more lenient so DOM-string example payloads round-trip unchanged.
const MAX_STRING_LENGTH = 2048;

export function fieldSchema(fields) {
  const properties = {};
  const required = [];
  for (const f of fields) {
    const p = { description: f.label || f.arg };
    if (f.kind === 'number') {
      p.type = 'number';
      // A number field whose form is a fixed set of options: say so. "Mass
      // lesion type" typed only as `number` told an agent nothing about which
      // numbers mean anything, and 0 / 2 / -3 is not guessable.
      if (Array.isArray(f.values)) p.enum = f.values.map(Number);
    }
    else if (f.kind === 'bool') p.type = 'boolean';
    else if (f.kind === 'enum') { p.type = 'string'; p.enum = f.values.slice(); }
    else { p.type = 'string'; p.maxLength = MAX_STRING_LENGTH; }
    if (f.unit) p.description += ` (${f.unit})`;
    properties[f.dom] = p;
    if (f.required) required.push(f.dom);
  }
  return { type: 'object', properties, required, additionalProperties: false };
}

// Validate an inputs object against the field descriptors. Faithful to the
// DOM-origin contract: numbers may arrive as numeric strings, booleans as the
// '1'/'yes' forms, enums as their listed values.
// spec-v637 §1: every failure carries a stable machine-readable `code` (and the
// offending `field` where one applies) alongside the English `message`, so an
// agent can branch on the code instead of parsing prose. Returns
// { valid, code?, field?, message? }.
export function validateInputs(inputs, fields) {
  if (inputs == null || typeof inputs !== 'object' || Array.isArray(inputs)) {
    return { valid: false, code: 'BAD_ARGS', message: 'inputs must be an object.' };
  }
  const known = new Set(fields.map((f) => f.dom));
  for (const key of Object.keys(inputs)) {
    if (key.length > MAX_STRING_LENGTH) return { valid: false, code: 'BAD_ARGS', message: 'Input field name is too long.' };
    if (!known.has(key)) return { valid: false, code: 'UNKNOWN_INPUT', field: key, message: `Unknown input "${key}". Call describe_calculator for the input schema.` };
  }
  for (const f of fields) {
    const present = Object.prototype.hasOwnProperty.call(inputs, f.dom);
    if (!present) {
      if (f.required) return { valid: false, code: 'MISSING_INPUT', field: f.dom, message: `Missing required input "${f.dom}".` };
      continue;
    }
    const v = inputs[f.dom];
    if (typeof v === 'string' && v.length > MAX_STRING_LENGTH) {
      return { valid: false, code: 'BAD_ARGS', field: f.dom, message: `"${f.dom}" exceeds ${MAX_STRING_LENGTH} characters.` };
    }
    if (f.kind === 'number') {
      if (v === '' || v === null || v === undefined) {
        if (f.required) return { valid: false, code: 'MISSING_INPUT', field: f.dom, message: `"${f.dom}" is required.` };
        continue;
      }
      const n = typeof v === 'number' ? v : (typeof v === 'string' && v.trim() !== '' ? Number(v) : NaN);
      if (!Number.isFinite(n)) return { valid: false, code: 'INVALID_TYPE', field: f.dom, message: `"${f.dom}" must be a finite number.` };
      // Scored categories are numbers, but only some numbers. Passing one the
      // form has no option for used to score as if the finding were absent and
      // return a confident total: atlas-cdi took atl-abx = 9 where the options
      // are 0 or 2 and answered ATLAS 4 instead of 6, valid: true. The kind
      // stays `number` on purpose -- these values are summed, and an enum would
      // hand the lib a string.
      if (Array.isArray(f.values) && !f.values.includes(String(n))) {
        return { valid: false, code: 'INVALID_TYPE', field: f.dom, message: `"${f.dom}" must be one of: ${f.values.join(', ')}.` };
      }
    } else if (f.kind === 'bool') {
      if (!isBoolLike(v)) return { valid: false, code: 'INVALID_TYPE', field: f.dom, message: `"${f.dom}" must be a boolean.` };
    } else if (f.kind === 'enum') {
      if (!f.values.includes(String(v))) {
        return { valid: false, code: 'INVALID_TYPE', field: f.dom, message: `"${f.dom}" must be one of: ${f.values.join(', ')}.` };
      }
    }
  }
  return { valid: true };
}

// Default toArgs: coerce each present input by kind and assign it to the lib
// argument name. Absent inputs are left unset so the lib treats them as missing
// (its own complete-the-fields fallback fires). An optional per-field `to`
// transform handles the enum->boolean / enum->number cases the renderers use.
export function makeToArgs(fields) {
  return function toArgs(inputs) {
    const args = {};
    for (const f of fields) {
      if (!Object.prototype.hasOwnProperty.call(inputs, f.dom)) continue;
      const raw = inputs[f.dom];
      let v;
      if (f.kind === 'number') v = (raw === '' || raw === null || raw === undefined) ? null : Number(raw);
      else if (f.kind === 'bool') v = toBool(raw);
      else v = String(raw);
      if (typeof f.to === 'function') v = f.to(v);
      args[f.arg] = v;
    }
    return args;
  };
}
