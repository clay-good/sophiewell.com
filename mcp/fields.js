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

// Build the published JSON Schema for one calculator's { inputs } object. This
// is the machine-readable contract describe_calculator returns; it documents
// the ideal type for an agent. Validation (validateInputs) is intentionally a
// touch more lenient so DOM-string example payloads round-trip unchanged.
export function fieldSchema(fields) {
  const properties = {};
  const required = [];
  for (const f of fields) {
    const p = { description: f.label || f.arg };
    if (f.kind === 'number') p.type = 'number';
    else if (f.kind === 'bool') p.type = 'boolean';
    else if (f.kind === 'enum') { p.type = 'string'; p.enum = f.values.slice(); }
    else p.type = 'string';
    if (f.unit) p.description += ` (${f.unit})`;
    properties[f.dom] = p;
    if (f.required) required.push(f.dom);
  }
  return { type: 'object', properties, required, additionalProperties: false };
}

// Validate an inputs object against the field descriptors. Faithful to the
// DOM-origin contract: numbers may arrive as numeric strings, booleans as the
// '1'/'yes' forms, enums as their listed values. Returns { valid, message }.
export function validateInputs(inputs, fields) {
  if (inputs == null || typeof inputs !== 'object' || Array.isArray(inputs)) {
    return { valid: false, message: 'inputs must be an object.' };
  }
  const known = new Set(fields.map((f) => f.dom));
  for (const key of Object.keys(inputs)) {
    if (!known.has(key)) return { valid: false, message: `Unknown input "${key}". Call describe_calculator for the input schema.` };
  }
  for (const f of fields) {
    const present = Object.prototype.hasOwnProperty.call(inputs, f.dom);
    if (!present) {
      if (f.required) return { valid: false, message: `Missing required input "${f.dom}".` };
      continue;
    }
    const v = inputs[f.dom];
    if (f.kind === 'number') {
      if (v === '' || v === null || v === undefined) {
        if (f.required) return { valid: false, message: `"${f.dom}" is required.` };
        continue;
      }
      const n = typeof v === 'number' ? v : (typeof v === 'string' && v.trim() !== '' ? Number(v) : NaN);
      if (!Number.isFinite(n)) return { valid: false, message: `"${f.dom}" must be a finite number.` };
    } else if (f.kind === 'bool') {
      if (!isBoolLike(v)) return { valid: false, message: `"${f.dom}" must be a boolean.` };
    } else if (f.kind === 'enum') {
      if (!f.values.includes(String(v))) {
        return { valid: false, message: `"${f.dom}" must be one of: ${f.values.join(', ')}.` };
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
