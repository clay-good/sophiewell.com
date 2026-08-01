// spec-v629 wave 11: next-dose scheduling, extracted from the time-to-dose tile's
// view so the browser and the MCP adapter share one implementation. Pure: a
// starting clock time and a frequency give the next N dose times (24-hour, wrapping
// at midnight). No date, no clock, no locale.

export const DOSE_FREQ_HRS = {
  q4h: 4, q6h: 6, q8h: 8, q12h: 12, qd: 24, bid: 12, tid: 8, qid: 6,
};

// Returns { time, freq, stepHours, doses } or null when the time is malformed,
// out of range, or the frequency is unknown.
export function nextDoses({ time, freq, count = 4 }) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(String(time == null ? '' : time).trim());
  if (!m) return null;
  const h = Number(m[1]);
  const mi = Number(m[2]);
  if (h > 23 || mi > 59) return null;
  const step = DOSE_FREQ_HRS[freq];
  if (!step) return null;
  const n = Math.max(1, Math.min(24, Math.floor(count) || 4));
  const doses = [];
  for (let i = 1; i <= n; i += 1) {
    const total = h * 60 + mi + step * 60 * i;
    const nh = String(Math.floor(total / 60) % 24).padStart(2, '0');
    const nm = String(total % 60).padStart(2, '0');
    doses.push(`${nh}:${nm}`);
  }
  return {
    time: `${String(h).padStart(2, '0')}:${String(mi).padStart(2, '0')}`,
    freq,
    stepHours: step,
    doses,
  };
}
