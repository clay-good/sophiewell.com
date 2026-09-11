// spec-v683: Effective serum osmolality (tonicity).
//
// The effective osmolality — tonicity — is the calculated serum osmolality restricted to
// the osmoles that DO NOT freely cross cell membranes, so it reflects the osmotic gradient
// that actually drives water shifts. It deliberately EXCLUDES urea (and other freely
// permeant osmoles such as ethanol), unlike total calculated osmolality (the osmolal-gap
// tile). It is the value used in the diagnostic criteria for the hyperosmolar hyperglycemic
// state (HHS).
//
//   Effective osmolality (mOsm/kg) = 2 x sodium (mEq/L) + glucose (mg/dL) / 18
//
// Reference range ~275-295 mOsm/kg. An effective osmolality > 320 mOsm/kg is a diagnostic
// criterion for HHS and correlates with depressed mental status in hyperglycemic crises.
// Source: standard physiology; ADA hyperglycemic-crises criteria (Kitabchi AE, et al.
// Diabetes Care 2009;32(7):1335-1343).
//
// Pure: no DOM, no clock, no network.

export const EFFECTIVE_OSM_NOTE = 'Effective serum osmolality, or tonicity, is the calculated osmolality restricted to osmoles that do not freely cross cell membranes, so it reflects the osmotic gradient that actually moves water. Effective osmolality (mOsm/kg) = 2 x sodium (mEq/L) + glucose (mg/dL) / 18. It deliberately excludes urea (and other freely permeant osmoles such as ethanol), unlike the total calculated osmolality used for the osmolal gap. The reference range is about 275 to 295 mOsm/kg. An effective osmolality above 320 mOsm/kg is a diagnostic criterion for the hyperosmolar hyperglycemic state (HHS) and correlates with depressed mental status in hyperglycemic crises (ADA criteria, Kitabchi AE, et al, Diabetes Care 2009;32(7):1335-1343). It is a calculated value that supports rather than replaces clinical assessment.';

function pos(v) {
  if (v === '' || v === null || v === undefined) return NaN;
  return typeof v === 'number' ? v : Number(String(v).trim());
}

function band(osm) {
  if (osm < 275) return { tier: 'low', label: 'below the reference range' };
  if (osm <= 295) return { tier: 'normal', label: 'within the reference range' };
  if (osm <= 320) return { tier: 'elevated', label: 'elevated' };
  return { tier: 'markedly-elevated', label: 'markedly elevated (HHS diagnostic range)' };
}

import { boundsAdvisory } from './bounds.js';

// spec-v1234: this tile's criteria are threshold comparisons, so past a
// threshold the size of the number stops mattering. Envelope and wording from
// BOUNDS + boundsAdvisory in lib/bounds.js; nothing clinical is decided here,
// and the check runs after the tile's own missing-value branch (spec-v1207) so a
// blank field is still asked for by name.
function envelopeFault(rows, note) {
  for (const [key, v] of rows) {
    // spec-v1234: `Number('')` is 0 and 0 is finite, so a blank field reached
    // `boundsAdvisory` as a measurement of zero -- which is BELOW several
    // envelopes. `phoenix-sepsis`'s own worked example leaves the INR out, and
    // this printed "Input below the plausible range for INR (0.5 to 20)" over the
    // whole tile. The repo has hit this exact trap at spec-v1038, spec-v1040 and
    // spec-v1213; `measured()` in lib/num.js exists for it.
    if (v === null || v === undefined) continue;
    if (typeof v === 'string' && v.trim() === '') continue;
    if (!Number.isFinite(Number(v))) continue;
    const fault = boundsAdvisory(key, Number(v));
    if (fault) return { valid: false, code: 'INVALID_INPUT', message: fault, band: fault, note };
  }
  return null;
}

export function effectiveOsmolality(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const sodium = pos(o.sodium);
  if (!Number.isFinite(sodium) || sodium <= 0 || sodium > 200) {
    return { valid: false, code: 'MISSING_INPUT', field: 'sodium', message: 'Enter serum sodium in mEq/L.', note: EFFECTIVE_OSM_NOTE };
  }
  const glucose = pos(o.glucose);
  if (!Number.isFinite(glucose) || glucose < 0) {
    return { valid: false, code: 'MISSING_INPUT', field: 'glucose', message: 'Enter serum glucose in mg/dL.', note: EFFECTIVE_OSM_NOTE };
  }
  const osmFault = envelopeFault([['sodium', sodium], ['glucose', glucose]], EFFECTIVE_OSM_NOTE);
  if (osmFault) return osmFault;

  const value = 2 * sodium + glucose / 18;
  const rounded = Math.round(value * 10) / 10;
  const b = band(value);

  return {
    valid: true,
    osmolality: rounded,
    tier: b.tier,
    abnormal: value > 320,
    bandLabel: `Effective osmolality ${rounded} mOsm/kg`,
    band: `Effective osmolality ${rounded} mOsm/kg — ${b.label}.`,
    detail: `2 x ${sodium} + ${glucose}/18 = ${rounded} mOsm/kg. Urea is excluded (this is tonicity, not total osmolality). Above 320 is a diagnostic criterion for the hyperosmolar hyperglycemic state.`,
    note: EFFECTIVE_OSM_NOTE,
  };
}
