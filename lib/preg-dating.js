// spec-v629 wave 13: a deterministic pregnancy-dating composition for the MCP
// surface. The insulin-drip/time-to-dose extractions shared code with the view;
// this one deliberately does NOT. The preg-dating view answers an interactive
// "how far along am I today?" and reads the wall clock for the current GA. An MCP
// tool must be deterministic (identical inputs -> byte-identical output), so this
// wrapper anchors every gestational-age reading to a supplied date and never
// touches the clock:
//   - LMP -> EDD is Naegele (LMP + 280 days), independent of any "today".
//   - CRL -> GA/EDD is anchored to the ultrasound date the caller provides.
//   - Discordance compares LMP-derived and CRL-derived GA *at the same reference
//     date* (the ultrasound date), which also fixes a latent same-date bug the
//     interactive view carries (it compares today's LMP GA to the ultrasound CRL
//     GA). The view is left as-is on purpose — different question, different code.
//
// Pure: no DOM, no clock, no locale. Composes lib/clinical-v4.js.

import { eddFromLmp, gaFromCrl, pregnancyDiscordance } from './clinical-v4.js';

// The Robinson-Fleming CRL formula is a first-trimester dating tool: a crown-rump
// length is measurable from a few mm up to ~84 mm (≈ 14 weeks), beyond which other
// biometry dates the pregnancy. Bounding CRL to this physiologic range both keeps
// the tool honest and prevents an absurd input from overflowing the date math into
// a non-finite value (an implausibly large CRL is not a CRL).
const CRL_MIN_MM = 1;
const CRL_MAX_MM = 120;

// Returns a dating summary from any of { lmpIso, crlMm, ultrasoundDateIso }, or
// null when nothing computable is supplied. Malformed dates throw (RangeError)
// from the underlying parsers, which the MCP layer surfaces as COMPUTE_ERROR.
export function pregnancyDating({ lmpIso, crlMm, ultrasoundDateIso } = {}) {
  const hasLmp = typeof lmpIso === 'string' && lmpIso.trim() !== '';
  const crl = typeof crlMm === 'number' ? crlMm : Number(crlMm);
  const hasCrl = Number.isFinite(crl) && crl >= CRL_MIN_MM && crl <= CRL_MAX_MM;
  const hasUs = typeof ultrasoundDateIso === 'string' && ultrasoundDateIso.trim() !== '';
  if (!hasLmp && !hasCrl) return null;

  const result = {};

  if (hasLmp) {
    // EDD only: addDays(lmp, 280) does not depend on the reference date, so pin
    // the reference to the LMP itself rather than the clock.
    result.lmpEdd = eddFromLmp({ lmpIso, todayIso: lmpIso }).edd;
  }

  if (hasCrl) {
    // GA (weeks/days) depends only on CRL; the implied EDD needs the ultrasound
    // date, so it is reported only when that date is supplied. gaFromCrl always
    // wants a reference date to build its (here-discarded) EDD, so pass a
    // deterministic one — the ultrasound date, else the LMP, else a fixed
    // sentinel — rather than let it fall back to the wall clock.
    const ref = hasUs ? ultrasoundDateIso : (hasLmp ? lmpIso : '2000-01-01');
    const g = gaFromCrl({ crlMm: crl, ultrasoundDateIso: ref });
    result.crlGaWeeks = g.gaWeeks;
    result.crlGaRemainderDays = g.gaRemainderDays;
    result.crlGaDays = g.gaDays;
    if (hasUs) result.crlEdd = g.edd;
  }

  if (hasLmp && hasCrl && hasUs) {
    const lmpGaDays = eddFromLmp({ lmpIso, todayIso: ultrasoundDateIso }).gaDays;
    const usGaDays = gaFromCrl({ crlMm: crl, ultrasoundDateIso }).gaDays;
    const d = pregnancyDiscordance({ lmpGaDays, usGaDays });
    result.discordanceDays = d.differenceDays;
    result.trimester = d.trimester;
    result.redateThreshold = d.redateThreshold;
    result.discordant = d.discordant;
  }

  return result;
}
