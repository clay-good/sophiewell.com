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
//
// ONE KIND, ONE SPELLING (spec-v1168). This file has always recognised `bool`,
// and adapters have always also written `boolean` -- 90 fields when spec-v753
// found it, 698 by the time anyone looked again. Every branch below is a
// `=== 'bool'` test, so those 698 fell through to the string default:
//
//   chads|chf            kind 'bool'    -> {"type":"boolean"}
//   migraine-ichd3|...   kind 'boolean' -> {"type":"string","maxLength":2048}
//
// The published contract told an agent that a checkbox was free text, its value
// was never validated as boolean-like, and it reached toArgs as `String(raw)`.
// Scoring survived only because the libraries coerce with their own allow-list
// helpers (`onFlag`), which is defence, not correctness.
//
// spec-v753 normalised the spelling in ONE consumer (scripts/build-field-index)
// and wrote that the index "is not the place to fix it, but it IS the place to
// stop it spreading". It did not stop it spreading, because normalising in a
// consumer does not reach the author of the next adapter. So it is normalised
// here, at the contract, and mcp/catalog.js rejects an unknown kind outright.

import { parseDecimal, GROUPING_MESSAGE } from '../lib/num.js';
import { BOUNDS, CEILING_ONLY } from '../lib/bounds.js';

export const FIELD_KINDS = Object.freeze(['number', 'bool', 'enum', 'string']);

// `boolean` is the same kind as `bool`; anything else is unknown and the
// registry refuses it rather than letting it become a string.
export function normalizeKind(kind) {
  return kind === 'boolean' ? 'bool' : kind;
}

// Returns a copy of the field list with one spelling per kind. Called once, at
// registry build, so every consumer downstream -- the schema, the coercion, the
// probes and the sweeps that filter on `kind` -- sees the same thing.
export function normalizeFieldKinds(fields) {
  return fields.map((f) => (f.kind === 'boolean' ? { ...f, kind: 'bool' } : f));
}

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

// spec-v1779: a field may NAME its envelope instead of restating it.
//
// [spec-v1777](../docs/spec-v1777.md) declared 285 caps that libraries enforce and nothing stated, and left
// 435 undeclared on purpose: those are one of the 45 `lib/bounds.js` envelopes, and a descriptor holds only
// literals. Copying an envelope into 435 descriptors rebuilds the problem specs v1762-v1765 spent three
// specs undoing -- four envelopes were widened past values verified in survivors, and every narrower copy
// left behind in a library had to be chased.
//
// So `bound: 'weightKg'` resolves against `BOUNDS` on every read, and a declaration cannot fall behind the
// envelope it names. `boundScale` is for a field stated in a sub-unit of the envelope's: a height in cm
// against an envelope in metres is `bound: 'heightM', boundScale: 100`. An explicit `min`/`max` always wins,
// which is how a tool whose own validated range is narrower than survival keeps it.
//
// **A named envelope DOCUMENTS the range; it does not refuse.** That split is the whole of this mechanism's
// behaviour, and it is deliberate. `validateInputs` refuses a literal `min`/`max` before the library runs,
// and the sentence it returns is its own: `"ap-na" must be from 90 to 208; got 84.` The libraries already
// refuse these same values -- that is how the probe found them -- and they do it in the words a reader sees
// on the page: "Input below the plausible range for serum sodium (90 to 208 mEq/L); verify the units", or
// "PaO2 (mmHg) must be between 10 and 700. Check the value entered." Pre-refusing would replace the page's
// sentence with a worse one on the agent surface only, which is the divergence spec-v1743 exists to stop.
// Three tests said so immediately: apache2's sodium, SMART-COP's PaO2 and toxic-alcohol's typed zero each
// assert the library's own wording.
//
// So an envelope-named range reaches the published input schema -- which is the gap
// [spec-v1777](../docs/spec-v1777.md) set out to close, an agent being told the input is a number and
// nothing more -- while the refusal stays where the sentence is. `declaredLiterals` below is what enforces,
// and `scripts/probe-declared-cap-configs.mjs` is what holds the library to the documented range.
export function fieldRange(f) {
  let min = Number.isFinite(f.min) ? f.min : null;
  let max = Number.isFinite(f.max) ? f.max : null;
  if (f.bound && (min === null || max === null)) {
    const b = BOUNDS[f.bound];
    // A name that is not an envelope is a typo, and silently widening a field to "no bound at all" is the
    // worst reading of one. test/unit/field-bound-names.test.js refuses it at the gate; here it is left as
    // whatever the descriptor stated, so a typo cannot loosen a field that also declares a literal.
    if (b) {
      const s = Number.isFinite(f.boundScale) && f.boundScale > 0 ? f.boundScale : 1;
      // A CEILING_ONLY envelope has no floor to publish: a hemoglobin of 1.4 g/dL and an albumin below 0.1
      // have been survived, so lib/bounds.js flags a critical low rather than refusing it (spec-v1762), and
      // a published minimum would claim a floor the library does not hold.
      if (min === null && Number.isFinite(b.min) && !CEILING_ONLY.has(f.bound)) min = Number((b.min * s).toPrecision(12));
      if (max === null && Number.isFinite(b.max)) max = Number((b.max * s).toPrecision(12));
    }
  }
  return { min, max, exclusiveMin: !!f.exclusiveMin, exclusiveMax: !!f.exclusiveMax };
}

// What `validateInputs` refuses on: the literals only. See the note above `fieldRange` for why a named
// envelope documents without refusing.
function declaredLiterals(f) {
  return {
    min: Number.isFinite(f.min) ? f.min : null,
    max: Number.isFinite(f.max) ? f.max : null,
    exclusiveMin: !!f.exclusiveMin,
    exclusiveMax: !!f.exclusiveMax,
  };
}

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
      // spec-v1777: `exclusiveMin` / `exclusiveMax` mark an edge the library itself refuses. Three fields
      // declared an inclusive bound their library states as exclusive -- a pre-test probability "between 0
      // and 100% (exclusive)", a bioavailability and a salt factor "between 0 (exclusive) and 1" -- so the
      // schema said 0 was allowed and the library then turned it away.
      const r = fieldRange(f);
      if (r.min !== null) p[r.exclusiveMin ? 'exclusiveMinimum' : 'minimum'] = r.min;
      if (r.max !== null) p[r.exclusiveMax ? 'exclusiveMaximum' : 'maximum'] = r.max;
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
      // spec-v1542: a string is read in either decimal convention ("37,5" is 37.5); grouping like "1,500" is refused.
      const p = parseDecimal(v);
      if (p.error === GROUPING_MESSAGE) return { valid: false, code: 'INVALID_TYPE', field: f.dom, message: `"${f.dom}": ${GROUPING_MESSAGE}` };
      const n = p.blank ? NaN : p.value;
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
      // spec-v1646: a field whose label states its range declares it, and a value
      // past it is refused. Libs met it three wrong ways: clamped (Aldrete 3 -> 2),
      // summed (CIWA nausea 8), or dropped (Roland-Morris 25 scored 0).
      // spec-v1777: an exclusive edge is refused, and the sentence says which edge it was, so "must be
      // from 0 to 1" cannot be read as permitting the 0 the library turns away.
      const range0 = declaredLiterals(f);
      const underMin = range0.min !== null && (range0.exclusiveMin ? n <= range0.min : n < range0.min);
      const overMax = range0.max !== null && (range0.exclusiveMax ? n >= range0.max : n > range0.max);
      if (underMin || overMax) {
        const lo = `${range0.min}${range0.exclusiveMin ? ' (exclusive)' : ''}`;
        const hi = `${range0.max}${range0.exclusiveMax ? ' (exclusive)' : ''}`;
        // spec-v1728: a one-sided range read "from 0 to undefined".
        const range = range0.min !== null && range0.max !== null ? `from ${lo} to ${hi}`
          : (range0.min !== null ? `at least ${lo}` : `at most ${hi}`);
        // spec-v1798: NAME THE FIELD the way the reader's page names it, not by its dom key. spec-v1248 set
        // that rule for this exact tool -- `lymphocyte-doubling-time` must say "Earlier absolute lymphocyte
        // count" and not `"ldt-alc1"` -- and the rule was being kept only by the library, so declaring a
        // range on such a field quietly replaced a named refusal with an anonymous one. A long label is no
        // use in a sentence, so the key stands in above sixty characters.
        const label = typeof f.label === 'string' && f.label.length <= 60
          ? `${f.label}${f.unit ? ` (${f.unit})` : ''}` : `"${f.dom}"`;
        return { valid: false, code: 'OUT_OF_RANGE', field: f.dom, message: `${label} must be ${range}; got ${n}.` };
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
      if (f.kind === 'number') v = (raw === '' || raw === null || raw === undefined) ? null : (parseDecimal(raw).value ?? Number(raw));
      else if (f.kind === 'bool') v = toBool(raw);
      else v = String(raw);
      if (typeof f.to === 'function') v = f.to(v);
      args[f.arg] = v;
    }
    return args;
  };
}
