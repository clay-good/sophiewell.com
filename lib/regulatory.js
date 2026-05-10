// HIPAA / regulatory deadline math. Deterministic date arithmetic only;
// no judgment about whether a breach occurred.
//
// HIPAA Breach Notification Rule (45 CFR 164.404, 164.406, 164.408):
//   - Discovery date = first day on which the breach is known, or by
//     exercising reasonable diligence would have been known, to the
//     covered entity (45 CFR 164.404(a)(2)).
//   - Individual notice: "without unreasonable delay" and in no case later
//     than 60 calendar days after discovery (164.404(b)).
//   - Media notice (>= 500 affected residents of a state/jurisdiction):
//     same 60-day deadline (164.406(b)).
//   - HHS Secretary notice:
//       * >= 500 individuals: contemporaneously with individual notice
//         (no later than 60 days after discovery) (164.408(b)).
//       * < 500 individuals: annual log, due no later than 60 days after
//         the end of the calendar year in which the breach was discovered
//         (164.408(c)).
//
// Returned dates are ISO YYYY-MM-DD strings in UTC; the regulation uses
// "calendar days" without a timezone qualifier, so the calculator treats
// the discovery date as UTC midnight to avoid DST/locale drift.

function parseIsoDateUtc(s) {
  if (typeof s !== 'string') throw new TypeError('discoveryDate must be a YYYY-MM-DD string');
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) throw new RangeError('discoveryDate must match YYYY-MM-DD');
  const [_, y, mo, d] = m;
  const dt = new Date(Date.UTC(Number(y), Number(mo) - 1, Number(d)));
  if (Number.isNaN(dt.getTime())) throw new RangeError('discoveryDate is not a valid date');
  if (dt.getUTCFullYear() !== Number(y) || dt.getUTCMonth() !== Number(mo) - 1 || dt.getUTCDate() !== Number(d)) {
    throw new RangeError('discoveryDate components do not form a real date');
  }
  return dt;
}

function fmt(dt) {
  const y = dt.getUTCFullYear();
  const m = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const d = String(dt.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function addDaysUtc(dt, n) {
  return new Date(dt.getTime() + n * 86400000);
}

export function breachNotificationDeadlines({ discoveryDate, affectedIndividuals }) {
  const start = parseIsoDateUtc(discoveryDate);
  if (typeof affectedIndividuals !== 'number' || !Number.isFinite(affectedIndividuals)
      || affectedIndividuals < 0 || !Number.isInteger(affectedIndividuals)) {
    throw new TypeError('affectedIndividuals must be a non-negative integer');
  }

  // 60 calendar days after discovery, inclusive of the discovery date as day 0.
  // 164.404(b) wording: "in no case later than 60 calendar days after the
  // discovery". We surface the deadline date itself.
  const day60 = addDaysUtc(start, 60);

  // HHS annual log (sub-500 breaches): due 60 days after the end of the
  // calendar year of discovery.
  const yearEnd = new Date(Date.UTC(start.getUTCFullYear(), 11, 31));
  const hhsAnnual = addDaysUtc(yearEnd, 60);

  const isLarge = affectedIndividuals >= 500;
  const recipients = ['Affected individual(s) (45 CFR 164.404(b))'];
  if (isLarge) {
    recipients.push('Prominent media outlets serving the state/jurisdiction (45 CFR 164.406(b))');
    recipients.push('HHS Secretary, contemporaneously with individual notice (45 CFR 164.408(b))');
  } else {
    recipients.push(`HHS Secretary, via the annual log (45 CFR 164.408(c)) due ${fmt(hhsAnnual)}`);
  }

  return {
    discoveryDate: fmt(start),
    individualNoticeDeadline: fmt(day60),
    mediaNoticeDeadline: isLarge ? fmt(day60) : null,
    hhsNoticeDeadline: isLarge ? fmt(day60) : fmt(hhsAnnual),
    affectedIndividuals,
    threshold: isLarge ? '>=500 individuals: large-breach rules apply' : '<500 individuals: annual log to HHS',
    recipients,
    citation: '45 CFR §§164.404, 164.406, 164.408.',
    note: 'This calculator surfaces the regulatory deadline only. The Privacy Rule requires "without unreasonable delay" — covered entities should not wait until day 60 if notice can reasonably be sent sooner.',
  };
}
