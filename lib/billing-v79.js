// spec-v79 §2: claim edits & modifier logic -- five deterministic, CMS-cited
// decision engines (spec-v77 billing & coding program, Group B "Billing &
// Reimbursement"). v78 prices the line; v79 decides whether the line survives.
//
// Doctrine clause 2 (spec-v77 §2): no NCCI PTP table and no MUE table ship with
// the site -- those are large quarterly CMS downloads. Each tile takes the
// published edit indicator / MUE value as INPUT and computes the decision, so it
// can never be silently stale. The functions here are pure: a handful of inputs
// in, a structured verdict out, no I/O.
//
// Safety contract (spec-v59): indicators GATE rather than guess. Modifier
// indicator 0, MAI 2, global indicator XXX, and a no-distinct-service scenario
// each return a hard, specific "cannot / not applicable" verdict, never a
// permissive default that would green-light an unbillable claim. Bad inputs
// throw TypeError/RangeError (caught by the view's safe() wrapper); no returned
// string ever embeds NaN / Infinity / undefined (string fields are built from
// validated values and fixed text only). Global date math reuses lib/deadline.js
// (UTC-midnight, calendar days, day-0 convention) -- no Invalid Date, no TZ drift.
//
// Decision constants (the modifier-indicator semantics, the MAI semantics, the
// GLOB DAYS definitions, the NCCI-associated-modifier set, and the pricing-
// before-informational ordering) are dated and ledger-tracked in
// pa-staleness-ledger.json (ruleFamily "billing-v79"); check-pa-staleness guards
// their currency in CI.

import { num } from './num.js';
import { parseIsoStrict, fmtUtc, addCalendarDaysUtc } from './deadline.js';

// --- shared input guards -----------------------------------------------------
// A claim code is a short alphanumeric token (CPT/HCPCS/ICD). Accept a string or
// a finite number (number inputs are coerced, never String(undefined)/String(NaN)
// which would leak a banned token); reject anything else so a bad code can never
// become a silently-wrong verdict.
function codeStr(name, v) {
  if (typeof v === 'number' && Number.isFinite(v)) v = String(v);
  if (typeof v !== 'string' || v.trim() === '') {
    throw new TypeError(`${name} must be a non-empty code string`);
  }
  return v.trim().toUpperCase();
}

// One of an allowed string set, case-insensitive. Throws TypeError otherwise.
function oneOf(name, v, allowed) {
  if (typeof v === 'number' && Number.isFinite(v)) v = String(v);
  const s = typeof v === 'string' ? v.trim().toLowerCase() : '';
  if (!allowed.includes(s)) {
    throw new TypeError(`${name} must be one of: ${allowed.join(', ')}`);
  }
  return s;
}

// --- dated constants (ruleFamily billing-v79) --------------------------------
// CMS NCCI-associated modifiers: the only modifiers that can bypass a PTP edit
// with modifier indicator 1 (NCCI Policy Manual, Ch. I). Anatomic, global-
// surgery, and the distinct-service (59 / X{EPSU}) modifiers.
export const NCCI_ASSOCIATED_MODIFIERS = Object.freeze([
  // anatomic
  'E1', 'E2', 'E3', 'E4',
  'FA', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9',
  'TA', 'T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9',
  'LT', 'RT', 'LC', 'LD', 'RC', 'LM', 'RI',
  // global surgery
  '24', '25', '57', '58', '78', '79',
  // other distinct-service
  '27', '59', '91', 'XE', 'XS', 'XP', 'XU',
]);

// PTP modifier indicator semantics (column-2 bypass permission).
export const PTP_MODIFIER_INDICATORS = Object.freeze({
  0: 'No modifier permitted -- the component code can never be reported separately with this comprehensive code.',
  1: 'A permitted NCCI-associated modifier may bypass the edit when the documentation supports a distinct service.',
  9: 'Edit deleted / not active -- the pair is not an NCCI edit; report both codes normally.',
});

// MUE Adjudication Indicator (MAI) semantics.
export const MUE_ADJUDICATION_INDICATORS = Object.freeze({
  1: 'Claim-line edit -- units over the value on a single line deny; medically necessary excess may be reported on a separate line with an appropriate modifier.',
  2: 'Date-of-service edit, ABSOLUTE -- per anatomic/policy limits the units can never exceed the value; the excess is not payable and must not be appealed as a units error.',
  3: 'Date-of-service edit -- units over the value are denied but reviewable on appeal with supporting documentation.',
});

// MPFS GLOB DAYS indicator -> postoperative-day count (or a non-numeric concept).
// 090 carries a 1-day preoperative period in addition to the 90 postop days.
export const GLOBAL_DAYS = Object.freeze({
  '000': { postopDays: 0, preopDay: false, label: '0-day (endoscopy / minor procedure; day of service only)' },
  '010': { postopDays: 10, preopDay: false, label: '10-day minor procedure' },
  '090': { postopDays: 90, preopDay: true, label: '90-day major surgery (1 preoperative day + 90 postoperative)' },
});
export const GLOBAL_DAYS_NONNUMERIC = Object.freeze({
  XXX: 'The global-surgery concept does not apply to this code -- there is no package; bill each service normally.',
  YYY: 'Carrier/MAC-priced global period -- the window is set by the contractor, not a fixed day count; confirm locally.',
  ZZZ: 'Add-on code -- the global period is that of the primary procedure it is reported with.',
  MMM: 'Maternity code -- the global concept is the maternity package, not a day-count surgical global.',
});

// --- 2.1 ncci-ptp ------------------------------------------------------------
// NCCI procedure-to-procedure edit & modifier-override checker. Determines the
// Column 1 (payable) vs Column 2 (bundled) code, whether the entered modifier
// indicator permits a bypass, and whether the proposed modifier is an NCCI-
// associated modifier. Refuses to bless a bypass on an indicator-0 pair.
export function ncciPtp({ codeA, codeB, column1 = 'unknown', modifierIndicator, proposedModifier = '' }) {
  const a = codeStr('codeA', codeA);
  const b = codeStr('codeB', codeB);
  if (a === b) throw new RangeError('codeA and codeB must be two different codes');
  const ind = Math.round(num('modifierIndicator', modifierIndicator, { min: 0, max: 9 }));
  if (ind !== 0 && ind !== 1 && ind !== 9) {
    throw new RangeError('modifierIndicator must be 0, 1, or 9');
  }
  const which = oneOf('column1', column1, ['a', 'b', 'unknown']);

  // Column 1 = the comprehensive (payable) code; Column 2 = the component
  // (bundled) code. When the user does not know the ordering, explain the rule
  // rather than guessing which is payable.
  let column1Code = null;
  let column2Code = null;
  let columnNote;
  if (which === 'a') { column1Code = a; column2Code = b; columnNote = `${a} is Column 1 (comprehensive, payable); ${b} is Column 2 (component, bundled into ${a}).`; }
  else if (which === 'b') { column1Code = b; column2Code = a; columnNote = `${b} is Column 1 (comprehensive, payable); ${a} is Column 2 (component, bundled into ${b}).`; }
  else { columnNote = 'Column 1/Column 2 not specified: in an NCCI PTP pair the Column 1 code is the comprehensive (payable) service and the Column 2 code is the component bundled into it. Look the pair up in the CMS PTP edit file to confirm which is which before billing.'; }

  const mod = proposedModifier === '' || proposedModifier == null ? '' : codeStr('proposedModifier', proposedModifier);
  const proposedIsNcciAssociated = mod === '' ? null : NCCI_ASSOCIATED_MODIFIERS.includes(mod);

  // The bypass verdict is driven entirely by the indicator -- it gates, never guesses.
  let canBypass;
  let bypassVerdict;
  if (ind === 9) {
    canBypass = false; // no edit to bypass
    bypassVerdict = 'Indicator 9: this pair is not an active NCCI edit -- report both codes normally; no modifier is needed.';
  } else if (ind === 0) {
    canBypass = false;
    bypassVerdict = 'Indicator 0: no modifier can unbundle this pair. The component code cannot be reported separately with the comprehensive code, period -- a 59/X{EPSU} or any other modifier will not override it.';
    if (mod !== '') {
      bypassVerdict += ` The proposed modifier ${mod} cannot rescue an indicator-0 pair; appending it is incorrect.`;
    }
  } else { // ind === 1
    canBypass = true;
    bypassVerdict = 'Indicator 1: a permitted NCCI-associated modifier MAY bypass the edit when the medical record supports a distinct service.';
    if (mod !== '') {
      bypassVerdict += proposedIsNcciAssociated
        ? ` ${mod} is an NCCI-associated modifier; it may bypass the edit if the documentation supports it.`
        : ` ${mod} is NOT an NCCI-associated modifier; it cannot bypass this edit -- choose a 59/X{EPSU}, anatomic, or global-surgery modifier the record supports.`;
    }
  }

  return {
    codeA: a, codeB: b,
    column1Code, column2Code, columnNote,
    indicator: ind,
    indicatorMeaning: PTP_MODIFIER_INDICATORS[ind],
    isEdit: ind !== 9,
    canBypass,
    bypassVerdict,
    proposedModifier: mod || null,
    proposedIsNcciAssociated,
  };
}

// --- 2.2 mue-check -----------------------------------------------------------
// Medically Unlikely Edits units adjudication. Compares the units billed to the
// MUE value under the entered MAI and returns the pass/deny decision, the
// payable units, the units at risk, and whether the excess is rescuable.
export function mueCheck({ unitsBilled, mueValue, mai, splitAcrossLines = false }) {
  const billed = Math.round(num('unitsBilled', unitsBilled, { min: 0, max: 1e6 }));
  const value = Math.round(num('mueValue', mueValue, { min: 0, max: 1e6 }));
  const indicator = Math.round(num('mai', mai, { min: 1, max: 3 }));
  if (indicator !== 1 && indicator !== 2 && indicator !== 3) {
    throw new RangeError('mai must be 1, 2, or 3');
  }
  const split = splitAcrossLines === true;

  const pass = billed <= value;
  const payableUnits = pass ? billed : value;
  const unitsAtRisk = pass ? 0 : billed - value;

  let rescuable;
  let verdict;
  if (pass) {
    rescuable = false;
    verdict = `${billed} unit(s) is within the MUE of ${value}: the line passes the units edit.`;
  } else if (indicator === 1) {
    // Claim-line edit: the per-line excess denies, but the medically necessary
    // excess can be reported on a separate line with a modifier.
    rescuable = true;
    verdict = `MAI 1 (claim-line edit): ${billed} on one line exceeds the per-line MUE of ${value}; ${unitsAtRisk} unit(s) deny on that line. Report the medically necessary excess on a SEPARATE line with an appropriate modifier (e.g., 59/X{EPSU} or an anatomic modifier) to rescue it.` + (split ? ' You indicated the units are already split across lines -- each line is adjudicated against the MUE separately.' : '');
  } else if (indicator === 2) {
    // Date-of-service, absolute: never payable, never appeal as a units error.
    rescuable = false;
    verdict = `MAI 2 (date-of-service edit, ABSOLUTE): the MUE of ${value} is a hard per-day ceiling for anatomic/policy reasons; the ${unitsAtRisk} excess unit(s) can NEVER be paid and must not be appealed as a units error. Splitting lines will not rescue them.`;
  } else {
    // Date-of-service, reviewable with documentation.
    rescuable = true;
    verdict = `MAI 3 (date-of-service edit): ${billed} exceeds the per-day MUE of ${value}; the ${unitsAtRisk} excess unit(s) deny but are REVIEWABLE on appeal with supporting documentation of medical necessity.`;
  }

  return {
    unitsBilled: billed, mueValue: value, mai: indicator,
    maiMeaning: MUE_ADJUDICATION_INDICATORS[indicator],
    pass, payableUnits, unitsAtRisk, rescuable, verdict,
  };
}

// --- 2.3 modifier-x-selector -------------------------------------------------
// 59 vs XE / XS / XP / XU decision. Given the clinical scenario, returns the
// single most specific X-modifier, 59 only when a distinct service exists but no
// X-subset fits, or a hard refusal when there is no distinct-service basis.
// Precedence when more than one X-subset applies: XE > XS > XP > XU (XU is the
// residual "unusual, non-overlapping" subset); the others are named too.
export function modifierXSelector({
  distinctService = false, separateEncounter = false, separateSite = false,
  separatePractitioner = false, nonOverlapping = false,
}) {
  const distinct = distinctService === true || distinctService === 1 || distinctService === 'true';
  const flags = [
    { mod: 'XE', on: !!separateEncounter, why: 'a separate encounter' },
    { mod: 'XS', on: !!separateSite, why: 'a separate anatomic structure/site' },
    { mod: 'XP', on: !!separatePractitioner, why: 'a separate practitioner' },
    { mod: 'XU', on: !!nonOverlapping, why: 'an unusual, non-overlapping service' },
  ];
  const applicable = flags.filter((f) => f.on);

  if (!distinct) {
    return {
      applicable: false, modifier: null, alsoApply: [],
      verdict: 'No distinct procedural service is present -- a distinct-procedure modifier (59 or X{EPSU}) is NOT appropriate here. Do not append one; the second code stays bundled.',
    };
  }
  if (applicable.length === 0) {
    return {
      applicable: true, modifier: '59', alsoApply: [],
      verdict: 'A distinct service exists but fits none of the X{EPSU} subsets (separate encounter/site/practitioner/non-overlapping). Use 59 as the generic distinct-procedural-service modifier -- but 59 is the most-audited modifier, so confirm the record truly supports a distinct service.',
    };
  }
  const chosen = applicable[0]; // XE > XS > XP > XU precedence (array order)
  const alsoApply = applicable.slice(1).map((f) => f.mod);
  let verdict = `Use ${chosen.mod} -- the most specific X{EPSU} modifier for ${chosen.why}. CMS prefers the specific X-modifier over the blunt 59.`;
  if (alsoApply.length) {
    verdict += ` ${alsoApply.join(', ')} also describe(s) the scenario; report the single most specific one (${chosen.mod}).`;
  }
  return { applicable: true, modifier: chosen.mod, alsoApply, verdict };
}

// --- 2.4 global-period -------------------------------------------------------
// Global surgery package date math & required modifier. Computes whether a
// subsequent encounter falls inside the global package from the surgery date and
// the GLOB DAYS indicator, and names the modifier that unlocks separate payment
// for the encounter's nature. Reuses lib/deadline.js for UTC calendar math.
const GLOBAL_NATURES = [
  'unrelated-em', 'staged', 'return-to-or', 'unrelated-procedure',
  'decision-for-surgery', 'related-postop',
];
export function globalPeriod({ surgeryDate, globalDays, subsequentDate, nature }) {
  const surg = parseIsoStrict(surgeryDate, 'surgeryDate');
  const subseq = parseIsoStrict(subsequentDate, 'subsequentDate');
  const nat = oneOf('nature', nature, GLOBAL_NATURES);
  const ind = typeof globalDays === 'number' && Number.isFinite(globalDays)
    ? String(Math.round(globalDays)).padStart(3, '0')
    : (typeof globalDays === 'string' ? globalDays.trim().toUpperCase() : '');

  // Non-numeric GLOB DAYS gate: no fixed window to compute.
  if (Object.prototype.hasOwnProperty.call(GLOBAL_DAYS_NONNUMERIC, ind)) {
    return {
      globalDays: ind, insideGlobal: false, separatelyBillable: true,
      daysFromSurgery: null, windowStart: null, windowEnd: null, requiredModifier: null,
      verdict: GLOBAL_DAYS_NONNUMERIC[ind],
    };
  }
  if (!Object.prototype.hasOwnProperty.call(GLOBAL_DAYS, ind)) {
    throw new RangeError('globalDays must be 000, 010, 090, XXX, YYY, ZZZ, or MMM');
  }
  const def = GLOBAL_DAYS[ind];

  // Day-0 convention: the day of surgery is day 0. The postoperative window runs
  // surgery date .. surgery date + postopDays (inclusive). A 90-day global also
  // includes the single preoperative day (surgery date - 1).
  const MS_PER_DAY = 86400000;
  const daysFromSurgery = Math.round((subseq.getTime() - surg.getTime()) / MS_PER_DAY);
  const windowStart = def.preopDay ? fmtUtc(addCalendarDaysUtc(surg, -1)) : fmtUtc(surg);
  const windowEnd = fmtUtc(addCalendarDaysUtc(surg, def.postopDays));
  const inPostop = daysFromSurgery >= 0 && daysFromSurgery <= def.postopDays;
  const inPreop = def.preopDay && daysFromSurgery === -1;
  const insideGlobal = inPostop || inPreop;

  // The decision-for-surgery visit sits just before the global starts: 57 for a
  // major (90-day) surgery, 25 for a minor (0/10-day) procedure, on the day of
  // or (for major) the day before surgery.
  if (nat === 'decision-for-surgery') {
    const atDecisionPoint = daysFromSurgery === 0 || (def.preopDay && daysFromSurgery === -1);
    if (atDecisionPoint) {
      const mod = def.postopDays >= 90 ? '57' : '25';
      return {
        globalDays: ind, insideGlobal, separatelyBillable: true, daysFromSurgery,
        windowStart, windowEnd, requiredModifier: mod,
        verdict: `The decision-for-surgery E/M is separately billable with modifier ${mod} (${mod === '57' ? 'decision for major surgery' : 'significant, separately identifiable E/M on the day of a minor procedure'}). This visit is what triggers the global, not part of it.`,
      };
    }
    // A "decision for surgery" visit nowhere near the surgery date is mis-tagged.
    return {
      globalDays: ind, insideGlobal, separatelyBillable: !insideGlobal, daysFromSurgery,
      windowStart, windowEnd, requiredModifier: null,
      verdict: `A decision-for-surgery visit applies on the day of (modifier 25) or, for a major surgery, the day before (modifier 57) the procedure. This encounter is ${daysFromSurgery} day(s) from surgery -- re-check the date or the encounter's nature.`,
    };
  }

  if (!insideGlobal) {
    return {
      globalDays: ind, insideGlobal: false, separatelyBillable: true, daysFromSurgery,
      windowStart, windowEnd, requiredModifier: null,
      verdict: `Outside the global period (the package runs ${windowStart} through ${windowEnd}). Bill the encounter normally -- no global modifier is needed.`,
    };
  }

  // Inside the global: the required modifier depends on the encounter's nature.
  const NATURE_MODIFIER = {
    'unrelated-em': { mod: '24', why: 'unrelated E/M during the postoperative period' },
    'staged': { mod: '58', why: 'staged or related procedure/therapy during the postoperative period' },
    'return-to-or': { mod: '78', why: 'unplanned return to the OR for a related complication' },
    'unrelated-procedure': { mod: '79', why: 'unrelated procedure by the same physician during the postoperative period' },
  };
  if (nat === 'related-postop') {
    return {
      globalDays: ind, insideGlobal: true, separatelyBillable: false, daysFromSurgery,
      windowStart, windowEnd, requiredModifier: null,
      verdict: `Inside the global period (day ${daysFromSurgery} of ${def.postopDays}). A routine related post-operative visit is INCLUDED in the surgical package -- it is not separately billable, and no modifier makes it payable.`,
    };
  }
  const m = NATURE_MODIFIER[nat];
  return {
    globalDays: ind, insideGlobal: true, separatelyBillable: true, daysFromSurgery,
    windowStart, windowEnd, requiredModifier: m.mod,
    verdict: `Inside the global period (day ${daysFromSurgery} of ${def.postopDays}), but separately billable with modifier ${m.mod} -- ${m.why}.`,
  };
}

// --- 2.5 modifier-order ------------------------------------------------------
// Pricing vs informational modifier sequencing. Re-sequences up to four
// modifiers into the correct claim order (pricing/payment-affecting first, then
// informational/statistical), tags each, and flags conflicting pairs.
//
// Pricing modifiers carry a rank so the most payment-affecting sorts first; an
// unrecognized modifier is treated as informational and flagged so the coder
// verifies its placement.
const PRICING_RANK = {
  // global-service split & physician-role pricing modifiers, highest payment effect first
  '26': 10, TC: 10,            // professional / technical component
  '50': 20,                    // bilateral
  '51': 30,                    // multiple procedures
  '52': 40, '53': 40,          // reduced / discontinued
  '54': 50, '55': 50, '56': 50, // surgical care split
  '62': 60, '66': 60,          // co- / team surgeon
  '80': 70, '81': 70, '82': 70, AS: 70, // assistant at surgery
  '22': 80, '63': 80,          // increased procedural service / infant
  '73': 90, '74': 90,          // ASC discontinued (pre/post anesthesia)
};
const INFORMATIONAL = new Set([
  '24', '25', '57', '58', '59', '76', '77', '78', '79', '91', '95',
  'XE', 'XS', 'XP', 'XU', 'GT', 'GA', 'GX', 'GY', 'GZ', 'KX', 'Q5', 'Q6',
  'LT', 'RT', 'LC', 'LD', 'RC', 'LM', 'RI',
  'E1', 'E2', 'E3', 'E4', 'FA', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9',
  'TA', 'T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9',
]);
export function modifierOrder({ modifiers }) {
  if (!Array.isArray(modifiers)) throw new TypeError('modifiers must be an array');
  const cleaned = [];
  for (let i = 0; i < modifiers.length; i += 1) {
    const raw = modifiers[i];
    if (raw == null || raw === '') continue;
    cleaned.push(codeStr(`modifiers[${i}]`, raw));
  }
  if (cleaned.length === 0) throw new RangeError('enter at least one modifier');
  if (cleaned.length > 4) throw new RangeError('a single claim line carries at most four modifiers');

  const tagged = cleaned.map((mod, originalIndex) => {
    const isPricing = Object.prototype.hasOwnProperty.call(PRICING_RANK, mod);
    const recognized = isPricing || INFORMATIONAL.has(mod);
    return {
      modifier: mod,
      class: isPricing ? 'pricing' : 'informational',
      recognized,
      rank: isPricing ? PRICING_RANK[mod] : 1000,
      originalIndex,
    };
  });

  // Pricing first (by rank, then original order for stability), then informational
  // in original order.
  const ordered = tagged.slice().sort((a, b) => {
    const aPricing = a.class === 'pricing' ? 0 : 1;
    const bPricing = b.class === 'pricing' ? 0 : 1;
    if (aPricing !== bPricing) return aPricing - bPricing;
    if (a.rank !== b.rank) return a.rank - b.rank;
    return a.originalIndex - b.originalIndex;
  });

  // Conflict detection.
  const set = new Set(cleaned);
  const conflicts = [];
  const seen = new Set();
  for (const m of cleaned) {
    if (seen.has(m)) conflicts.push(`Modifier ${m} appears twice -- a line carries each modifier at most once.`);
    seen.add(m);
  }
  if (set.has('26') && set.has('TC')) conflicts.push('26 (professional) and TC (technical) together equal the global service -- report neither, or one, not both.');
  if (set.has('LT') && set.has('RT')) conflicts.push('LT and RT on one line are contradictory -- a bilateral service is reported with modifier 50 (or per payer policy), not LT+RT together.');
  if (set.has('50') && (set.has('LT') || set.has('RT'))) conflicts.push('Modifier 50 (bilateral) already covers both sides -- do not also append LT/RT.');
  const assistant = ['80', '81', '82', 'AS'].filter((x) => set.has(x));
  if (assistant.length > 1) conflicts.push(`Only one assistant-at-surgery modifier applies per line; found ${assistant.join(', ')}.`);

  const unrecognized = tagged.filter((t) => !t.recognized).map((t) => t.modifier);
  return {
    ordered: ordered.map((t) => ({ modifier: t.modifier, class: t.class, recognized: t.recognized })),
    sequence: ordered.map((t) => t.modifier),
    conflicts,
    unrecognized,
    note: 'Pricing (payment-affecting) modifiers are reported before informational/statistical modifiers; the wrong order can mis-price or reject the line. An unrecognized modifier is placed in the informational group -- verify its position against the payer rule.',
  };
}
