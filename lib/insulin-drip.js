// spec-v629 wave 12: sliding-scale insulin-drip math, extracted from the
// insulin-drip tile view so the browser and the MCP adapter share one
// implementation. Pure: an example protocol and a current blood glucose give a
// sample rate (units/hr) from a fixed ladder. EXAMPLE protocols only — not any
// institution's active protocol. No DOM, no clock, no locale.

export const INSULIN_DRIP_PROTOCOLS = {
  low: 'low-intensity sample protocol',
  mod: 'moderate-intensity sample protocol',
};

// Returns { protocol, bg, rate, protocolLabel } or null when the protocol is
// unknown or the blood glucose is not a finite number.
export function insulinDripRate({ protocol, bg } = {}) {
  const protocolLabel = INSULIN_DRIP_PROTOCOLS[protocol];
  if (!protocolLabel) return null;
  // spec-v1013: a blank glucose is not a glucose of zero. `Number(null)` and
  // `Number('')` are both 0, which is finite, so a cleared field used to reach
  // the ladder as a real reading and the tile answered "Suggested rate (example
  // only): 0 units/hr" -- a rate for a patient nobody has measured.
  if (bg === null || bg === undefined || (typeof bg === 'string' && bg.trim() === '')) return null;
  const g = typeof bg === 'number' ? bg : Number(bg);
  if (!Number.isFinite(g)) return null;
  let rate;
  if (protocol === 'low') rate = g <= 100 ? 0 : (g <= 150 ? 0.5 : (g <= 200 ? 1 : (g <= 250 ? 2 : 3)));
  else rate = g <= 100 ? 0 : (g <= 150 ? 1 : (g <= 200 ? 2 : (g <= 250 ? 3 : 4)));
  return { protocol, bg: g, rate, protocolLabel };
}
