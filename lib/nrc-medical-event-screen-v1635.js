// spec-v1635 tool 29: is it a reportable medical event under 10 CFR 35.3045?
//
// Source: 10 CFR 35.3045, read on eCFR as current October 8, 2026 (re-read October 11, 2026).
// Paragraph (a)(1), for everything except permanent implant brachytherapy; any one test makes an event:
//   (i)   a dose that differs from the prescribed dose (or the dose the prescribed dosage would have
//         given) "by more than" 5 rem effective dose equivalent, 50 rem to an organ or tissue, or
//         50 rem shallow dose equivalent to the skin; AND (A) total dose off by 20 percent or more,
//         or (B) total dosage off by 20 percent or more or outside the prescribed dosage range, or
//         (C) a single fraction off by 50 percent or more.
//   (ii)  a dose that "exceeds" the same three thresholds from a wrong radioactive drug or
//         radionuclide, wrong route, wrong individual, wrong mode of treatment, or a leaking sealed
//         source.
//   (iii) a dose to the skin or to an organ or tissue other than the treatment site that exceeds the
//         expected dose there by 50 rem or more AND by 50 percent or more.
// Paragraph (a) excepts an event that results from patient intervention; paragraph (b) still requires
// a report when such an event "results or will result in unintended permanent functional damage to
// an organ or a physiological system, as determined by a physician".
// Clocks: (c) telephone the NRC Operations Center "no later than the next calendar day after
// discovery"; (d) written report "within 15 days after discovery"; (e) notify the referring physician
// and the individual "no later than 24 hours after its discovery" (with the exceptions in (e)).
// Paragraph (a)(2), permanent implant brachytherapy, has its own source-strength criteria and is not
// screened here. The dose estimates are the reader's.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';
import { parseIsoStrict, fmtUtc, addCalendarDaysUtc } from './deadline.js';

export const YES_NO = [{ value: 'yes', text: 'Yes' }, { value: 'no', text: 'No' }];
export const DOSE_KINDS = [
  { value: 'effective', text: 'Effective dose equivalent (threshold 5 rem)', threshold: 5 },
  { value: 'organ', text: 'Dose to an organ or tissue (threshold 50 rem)', threshold: 50 },
  { value: 'skin', text: 'Shallow dose equivalent to the skin (threshold 50 rem)', threshold: 50 },
];
export const WRONG = [
  { value: 'none', text: 'None of these' },
  { value: 'wrong-drug', text: 'Wrong radioactive drug or radionuclide' },
  { value: 'wrong-route', text: 'Wrong route of administration' },
  { value: 'wrong-individual', text: 'Wrong individual or research subject' },
  { value: 'wrong-mode', text: 'Wrong mode of treatment' },
  { value: 'leaking-source', text: 'A leaking sealed source' },
];
const NOTE = 'A screen against the words of the rule, with the reader\'s own dose estimates: it is not the licensee\'s determination, and an Agreement State may have different rules. Permanent implant brachytherapy has separate criteria that are not screened here, and a dose to an embryo, fetus or nursing child is reported under a different section (35.3047). Appropriate medical care is never delayed for notification.';
const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const pctOff = (a, b) => (Math.abs(a - b) / b) * 100;
const n1 = (x) => (Math.round(x * 10) / 10).toLocaleString('en-US');
const say = (d) => d.toLocaleDateString('en-US', { timeZone: 'UTC', year: 'numeric', month: 'long', day: 'numeric' });

export function nrcMedicalEventScreen(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const intervention = YES_NO.find((y) => y.value === String(o.patientIntervention ?? '').trim());
  if (!intervention) return { valid: false, message: 'Choose whether the event resulted from intervention by the patient or research subject. The rule treats that case separately.' };
  let discovered = null;
  if (!blank(o.discovered)) { try { discovered = parseIsoStrict(String(o.discovered).trim()); } catch { return { valid: false, message: 'Enter the discovery date as a date, or leave it blank.' }; } }
  const clocks = discovered
    ? [`Discovered ${say(discovered)}: telephone the NRC Operations Center no later than ${say(addCalendarDaysUtc(discovered, 1))}, the next calendar day (35.3045(c)).`, `Written report to the NRC Regional Office by ${say(addCalendarDaysUtc(discovered, 15))}, within 15 days after discovery (35.3045(d)).`, 'Notify the referring physician and the individual no later than 24 hours after discovery, unless the referring physician will inform the individual or judges that telling them would be harmful (35.3045(e)).']
    : ['If reportable: telephone the NRC Operations Center no later than the next calendar day after discovery; written report within 15 days after discovery; notify the referring physician and the individual no later than 24 hours after discovery (35.3045(c), (d), (e)).'];
  const due = discovered ? { telephoneBy: fmtUtc(addCalendarDaysUtc(discovered, 1)), writtenReportBy: fmtUtc(addCalendarDaysUtc(discovered, 15)) } : {};
  const cite = '10 CFR 35.3045.';
  if (intervention.value === 'yes') {
    const damage = YES_NO.find((y) => y.value === String(o.permanentDamage ?? '').trim());
    if (!damage) return { valid: false, message: 'Choose whether a physician has determined that the event results or will result in unintended permanent functional damage to an organ or a physiological system.' };
    const report = damage.value === 'yes';
    return { valid: true, flag: report ? 'reportable-b' : 'not-reportable-intervention', abnormal: report, reportable: report, ...(report ? due : {}), band: report ? 'Reportable under paragraph (b): an event from patient intervention that results or will result in unintended permanent functional damage, as determined by a physician.' : 'Not a medical event under paragraph (a), which excepts patient intervention, and paragraph (b) does not apply without unintended permanent functional damage as determined by a physician.', bandLabel: report ? 'Reportable (b)' : 'Not reportable', notes: [...(report ? clocks : []), cite], note: NOTE };
  }
  const kind = DOSE_KINDS.find((k) => k.value === String(o.doseKind ?? '').trim());
  const wrong = WRONG.find((w) => w.value === String(o.wrongAdministration ?? '').trim());
  if (!wrong) return { valid: false, message: 'Choose whether a wrong drug, route, individual or mode, or a leaking sealed source, was involved, or "none of these".' };
  const hasDose = !blank(o.doseRem); const hasSite = !blank(o.otherSiteDoseRem) || !blank(o.otherSiteExpectedRem);
  if (!hasDose && !hasSite) return { valid: false, message: 'Enter the dose difference in rem (with the kind of dose), or the dose to a site other than the treatment site with the dose expected there.' };
  const tests = []; const notes = [];
  if (hasDose) {
    if (!kind) return { valid: false, message: 'Choose the kind of dose the estimate is: effective dose equivalent, organ or tissue, or skin. Each has its own threshold.' };
    const f = inputFault([['the dose or dose difference', o.doseRem, 0, 1e6, 'rem']]);
    if (f) return { valid: false, message: f };
    const dose = Number(o.doseRem); const overThreshold = dose > kind.threshold;
    // (i): the threshold AND one of (A), (B), (C).
    const limbs = []; let assessed = false;
    if (!blank(o.prescribed) || !blank(o.delivered)) {
      const pf = inputFault([['the prescribed total dose or dosage', o.prescribed, null, 1e9, ''], ['the delivered total dose or dosage', o.delivered, 0, 1e9, '']]);
      if (pf) return { valid: false, message: pf };
      const p = pctOff(Number(o.delivered), Number(o.prescribed)); assessed = true;
      limbs.push({ met: p >= 20 - 1e-9, text: `total off by ${n1(p)}% (20% or more needed)` });
    }
    if (!blank(o.outsideRange)) {
      const r = YES_NO.find((y) => y.value === String(o.outsideRange).trim());
      if (!r) return { valid: false, message: 'Choose yes or no for "dosage outside the prescribed range", or leave it blank.' };
      assessed = true; limbs.push({ met: r.value === 'yes', text: `dosage ${r.value === 'yes' ? 'outside' : 'within'} the prescribed range` });
    }
    if (!blank(o.prescribedFraction) || !blank(o.deliveredFraction)) {
      const ff = inputFault([['the prescribed dose for the fraction', o.prescribedFraction, null, 1e9, ''], ['the delivered dose for the fraction', o.deliveredFraction, 0, 1e9, '']]);
      if (ff) return { valid: false, message: ff };
      const p = pctOff(Number(o.deliveredFraction), Number(o.prescribedFraction)); assessed = true;
      limbs.push({ met: p >= 50 - 1e-9, text: `single fraction off by ${n1(p)}% (50% or more needed)` });
    }
    const anyLimb = limbs.some((l) => l.met);
    const iMet = !overThreshold ? false : assessed ? anyLimb : null;
    tests.push({ test: '(a)(1)(i)', met: iMet });
    notes.push(`(a)(1)(i): the dose differs by ${n1(dose)} rem, ${overThreshold ? 'more than' : 'not more than'} the ${kind.threshold} rem threshold${assessed ? `; ${limbs.map((l) => l.text).join('; ')}` : overThreshold ? '; enter the prescribed and delivered totals, the range answer or a fraction to finish this test' : ''}. ${iMet === true ? 'Met.' : iMet === false ? 'Not met.' : 'Not assessed.'}`);
    if (wrong.value !== 'none') {
      tests.push({ test: '(a)(1)(ii)', met: overThreshold });
      notes.push(`(a)(1)(ii): ${wrong.text.toLowerCase()}, with a dose of ${n1(dose)} rem that ${overThreshold ? 'exceeds' : 'does not exceed'} ${kind.threshold} rem. ${overThreshold ? 'Met.' : 'Not met.'}`);
    }
  } else if (wrong.value !== 'none') {
    tests.push({ test: '(a)(1)(ii)', met: null });
    notes.push(`(a)(1)(ii): ${wrong.text.toLowerCase()} was involved, but no dose was entered. Not assessed.`);
  }
  if (hasSite) {
    const sf = inputFault([['the dose to the other site', o.otherSiteDoseRem, 0, 1e6, 'rem'], ['the dose expected at that site', o.otherSiteExpectedRem, 0, 1e6, 'rem']]);
    if (sf) return { valid: false, message: sf };
    const got = Number(o.otherSiteDoseRem); const exp = Number(o.otherSiteExpectedRem); const excess = got - exp;
    // With nothing expected at the site, any excess is more than 50 percent of it.
    const byPct = exp === 0 ? excess > 0 : (excess / exp) * 100 >= 50 - 1e-9;
    const met = excess >= 50 && byPct;
    tests.push({ test: '(a)(1)(iii)', met });
    notes.push(`(a)(1)(iii): the other site received ${n1(got)} rem against ${n1(exp)} rem expected, an excess of ${n1(excess)} rem${exp > 0 ? ` (${n1((excess / exp) * 100)}%)` : ''}; both 50 rem or more and 50% or more are needed. ${met ? 'Met.' : 'Not met.'}`);
  }
  const met = tests.filter((t) => t.met === true); const open = tests.filter((t) => t.met === null);
  const reportable = met.length > 0;
  const band = reportable ? `Meets ${met.map((t) => t.test).join(' and ')}: a medical event under 10 CFR 35.3045.`
    : open.length ? `No test is met on what was entered, but ${open.map((t) => t.test).join(' and ')} could not be assessed, so this is not a negative screen.`
      : 'None of the tests assessed is met.';
  return { valid: true, flag: reportable ? 'medical-event' : open.length ? 'incomplete' : 'not-met', abnormal: reportable || open.length > 0, reportable: reportable ? true : open.length ? null : false, tests, ...(reportable ? due : {}), band, bandLabel: reportable ? 'Medical event' : open.length ? 'Incomplete' : 'Not met', notes: [...notes, ...(reportable ? clocks : []), cite], note: NOTE };
}
