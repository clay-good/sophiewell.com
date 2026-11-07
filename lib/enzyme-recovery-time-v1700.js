// spec-v1700 (drug-interaction-kinetics tool 6): enzyme recovery after stopping an inducer or an irreversible
// inhibitor, by first-order turnover at ICH M12's kdeg (Table 6, read November 7, 2026):
// E(t) = 1 + (E0 - 1) e^(-kdeg t); the time to close a fraction f of the gap is -ln(1 - f) / kdeg.
//
// Pure: no DOM, no clock, no network.

import { measured } from './num.js';
import { ENZYME_OPTIONS, enzymeRow } from './ich-m12.js';

export { ENZYME_OPTIONS };
const sig = (x) => Number(x.toPrecision(4));
const pct = (e) => `${sig(e * 100)}%`;

export function enzymeRecoveryTime(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let kdegMin = measured(o.kdeg);
  const row = enzymeRow(String(o.enzyme ?? ''));
  const notes = [];
  if (kdegMin === null) {
    if (!row) return { valid: false, message: 'Choose the enzyme (for M12 Table 6\'s kdeg) or enter kdeg.' };
    kdegMin = row.kdegPerMin;
    notes.push(`kdeg ${kdegMin}/min for ${row.text}, ICH M12 Table 6 (which prints a half-life of ${row.halfLifeH} h; the two columns are rounded separately).`);
  } else {
    if (!(kdegMin > 0)) return { valid: false, message: 'kdeg must be above 0.' };
    notes.push(`kdeg ${kdegMin}/min as entered.`);
  }
  const k = kdegMin * 60;
  if (!Number.isFinite(k)) return { valid: false, message: 'kdeg is too large to compute a recovery time; enter it per minute.' };
  const e0 = measured(o.startLevel);
  if (e0 === null) return { valid: false, message: 'Enter the starting enzyme level as a fraction of baseline: below 1 after an irreversible inhibitor (0 if fully inactivated), above 1 after an inducer.' };
  if (e0 < 0) return { valid: false, message: 'The starting level cannot be negative.' };
  if (e0 === 1) return { valid: false, message: 'A starting level of 1 is already at baseline; there is nothing to recover.' };
  const delay = measured(o.washoutHours);
  if (delay !== null && delay < 0) return { valid: false, message: 'The washout delay cannot be negative.' };
  const d = delay ?? 0;
  const level = (t) => (t <= d ? e0 : 1 + (e0 - 1) * Math.exp(-k * (t - d)));
  const t50 = d + Math.LN2 / k;
  const t90 = d + Math.log(10) / k;
  const hours = measured(o.hoursSinceStop);
  if (hours !== null && hours < 0) return { valid: false, message: 'Hours since stopping cannot be negative.' };
  if (hours === null) notes.push('Hours since stopping not entered, so no current level is given; the table below covers the first week.');
  const table = [0, 24, 48, 72, 96, 120, 168].map((t) => `${t} h: ${pct(level(t))} of baseline.`);
  const dir = e0 < 1 ? 'back up' : 'back down';
  notes.push(`E(t) = 1 + (E0 - 1) e^(-kdeg t), kdeg ${sig(k)}/h; half the gap closes in ln 2 / kdeg = ${sig(Math.LN2 / k)} h.`);
  if (d) notes.push(`Recovery starts after the ${d} h washout entered for the drug itself; every time includes it.`);
  else notes.push('The drug itself must wash out before the enzyme recovers; enter a washout delay to add it to every time.');
  const head = hours !== null
    ? `${pct(level(hours))} of baseline at ${hours} h; 50% of the way ${dir} at ${sig(t50)} h, 90% at ${sig(t90)} h.`
    : `50% of the way ${dir} to baseline at ${sig(t50)} h, 90% at ${sig(t90)} h.`;
  if (![t50, t90].every(Number.isFinite) || (hours !== null && !Number.isFinite(level(hours)))) return { valid: false, message: 'These inputs give no finite recovery time; check the magnitudes entered.' };
  const span = Math.max(168, Math.ceil((t90 * 1.25) / 24) * 24);
  const curve = Array.from({ length: 25 }, (_, i) => { const t = (span * i) / 24; return { t: sig(t), percent: sig(level(t) * 100) }; });
  return {
    valid: true, curve, t50: sig(t50), t90: sig(t90), levelNow: hours !== null ? sig(level(hours) * 100) : null, abnormal: false,
    band: head, bandLabel: `${sig(t90)} h to 90%`,
    notes: [...notes, ...table],
    note: 'Representative turnover from M12 Table 6; enzyme turnover varies between people and is uncertain for some enzymes.',
  };
}
