// spec-v80 §2: E/M & time-based coding, completed -- six deterministic,
// AMA/CMS-cited engines that finish the E/M surface the office-only `em-time` /
// `em-mdm` tiles started (spec-v77 billing & coding program, Group B "Billing &
// Reimbursement").
//
// The catalog's E/M tools stopped at the office (99202-99215). The AMA's 2023
// overhaul extended the same 2-of-3 MDM framework to every setting, and the
// time-unit codes (critical care, prolonged services, therapy 8-minute rule,
// anesthesia) are each input->output band math. v80 ships all six.
//
// Doctrine (spec-v77 §2): no proprietary CPT descriptor file and no ASA RVG
// base-unit table ship -- base units and documented MDM/time elements are the
// user's inputs; these functions compute the level / units / payment from them.
// The setting and payer/rule forks are EXPLICIT, never inferred: no function
// silently assumes Medicare or office (spec-v80 §3).
//
// Safety contract (spec-v59): every time band is the cited table, gated at its
// boundary; minutes below a floor return a structured `note`, never a negative
// or zero-unit silent answer. Bad inputs throw TypeError/RangeError (caught by
// the view's safe() wrapper); no returned string embeds NaN / Infinity /
// undefined (strings are built from validated numbers and fixed text). Money is
// computed in integer cents and formatted once at the edge.
//
// Dated constants (the anesthesia CF default, the 99417/G2212 thresholds, the
// medical-direction percentages, the CPT E/M edition) are ledger-tracked in
// pa-staleness-ledger.json (ruleFamily "billing-v80"); check-pa-staleness guards
// their currency in CI.

import { num } from './num.js';

// --- shared input guards -----------------------------------------------------
// One of an allowed string set, case-insensitive. Throws TypeError otherwise.
function oneOf(name, v, allowed) {
  const s = typeof v === 'string' ? v.trim().toLowerCase() : '';
  if (!allowed.includes(s)) {
    throw new TypeError(`${name} must be one of: ${allowed.join(', ')}`);
  }
  return s;
}

// =============================================================================
// 2.1 em-mdm-2023 -- MDM-based E/M level across every setting
// =============================================================================
// AMA CPT 2023 E/M Guidelines: the 2021 office 2-of-3 MDM grid (problems / data
// / risk, each graded straightforward(2) / low(3) / moderate(4) / high(5))
// extended to inpatient-observation, ED, nursing facility, and home/residence.
// The level is the highest met or exceeded by >=2 of the 3 elements; the
// setting then maps the level to its specific code. Several settings collapse
// straightforward and low into a single low-level code (the AMA leveling for
// those families starts at "straightforward/low"); ED has no time path and its
// 99281 is the special "presence not required" code, so MDM leveling there
// begins at 99282.
const MDM_LABEL = Object.freeze({ 2: 'Straightforward', 3: 'Low', 4: 'Moderate', 5: 'High' });

// Each setting maps an MDM level (2..5) to the specific code. A `null` at a
// level means that level is not separately codeable in that setting and rolls
// up to the next code (encoded by repeating the code). `office` is special-
// cased to defer to the existing em-mdm output shape (both new and est codes).
const EM_SETTINGS = Object.freeze({
  'inpatient-initial': {
    label: 'Inpatient / observation, initial (99221-99223)',
    // 99221 = straightforward OR low; 99222 = moderate; 99223 = high.
    codes: { 2: '99221', 3: '99221', 4: '99222', 5: '99223' },
  },
  'inpatient-subsequent': {
    label: 'Inpatient / observation, subsequent (99231-99233)',
    codes: { 2: '99231', 3: '99231', 4: '99232', 5: '99233' },
  },
  ed: {
    label: 'Emergency department (99281-99285; MDM only, no time path)',
    // 99282 = straightforward; 99283 = low; 99284 = moderate; 99285 = high.
    // (99281 does not require physician presence and is not MDM-leveled.)
    codes: { 2: '99282', 3: '99283', 4: '99284', 5: '99285' },
  },
  'snf-initial': {
    label: 'Nursing facility, initial (99304-99306)',
    codes: { 2: '99304', 3: '99304', 4: '99305', 5: '99306' },
  },
  'snf-subsequent': {
    label: 'Nursing facility, subsequent (99307-99310)',
    codes: { 2: '99307', 3: '99308', 4: '99309', 5: '99310' },
  },
  'home-new': {
    label: 'Home / residence, new patient (99341-99345; 99343 deleted 2023)',
    codes: { 2: '99341', 3: '99342', 4: '99344', 5: '99345' },
  },
  'home-established': {
    label: 'Home / residence, established patient (99347-99350)',
    codes: { 2: '99347', 3: '99348', 4: '99349', 5: '99350' },
  },
});
export const EM_SETTING_KEYS = Object.freeze(['office', ...Object.keys(EM_SETTINGS)]);

// Office leveling (the existing em-mdm grid; pinned here so em-mdm-2023's office
// fork is byte-identical to ops-v63 emMdm without importing across layers).
const OFFICE_CODES = Object.freeze({
  2: { newCode: '99202', estCode: '99212' },
  3: { newCode: '99203', estCode: '99213' },
  4: { newCode: '99204', estCode: '99214' },
  5: { newCode: '99205', estCode: '99215' },
});

function mdmLevel(problems, data, risk) {
  num('problems', problems, { min: 2, max: 5 });
  num('data', data, { min: 2, max: 5 });
  num('risk', risk, { min: 2, max: 5 });
  const vals = [Math.round(problems), Math.round(data), Math.round(risk)];
  let level = 2;
  for (let L = 5; L >= 2; L -= 1) {
    if (vals.filter((v) => v >= L).length >= 2) { level = L; break; }
  }
  const names = ['problems', 'data', 'risk'];
  const limiting = names.filter((_, i) => vals[i] < level);
  return { level, vals, limiting };
}

export function emMdm2023({ setting, problems, data, risk }) {
  const s = oneOf('setting', setting, EM_SETTING_KEYS);
  const { level, limiting } = mdmLevel(problems, data, risk);
  const mdm = MDM_LABEL[level];

  if (s === 'office') {
    const c = OFFICE_CODES[level];
    return {
      setting: s,
      settingLabel: 'Office / outpatient (99202-99215; new and established)',
      level, mdm,
      code: null, newCode: c.newCode, estCode: c.estCode,
      limitingElements: limiting,
      note: `Office E/M is handled by the existing em-mdm tile: Moderate-to-high MDM -> new ${c.newCode} / established ${c.estCode}. This setting is shown for cross-reference; pick a non-office setting to code 99221-99350.`,
    };
  }
  const def = EM_SETTINGS[s];
  const code = def.codes[level];
  return {
    setting: s,
    settingLabel: def.label,
    level, mdm,
    code, newCode: null, estCode: null,
    limitingElements: limiting,
    note: limiting.length
      ? `${mdm} MDM is set by the two elements at or above ${mdm}; ${limiting.join(' and ')} ${limiting.length > 1 ? 'are' : 'is'} the limiting element below it.`
      : `All three MDM elements reach ${mdm}.`,
  };
}

// =============================================================================
// 2.2 critical-care-time -- 99291 + 99292 aggregate-time units
// =============================================================================
// AMA CPT: 99291 = critical care, first 30-74 minutes; 99292 = each additional
// 30 minutes. CMS Pub. 100-04 Ch. 12 §30.6.12: aggregate the day's bedside +
// unit critical-care time and SUBTRACT time spent on separately reported
// procedures. Below 30 minutes is not critical care -- report an E/M instead.
//
// Band table: net < 30 -> none; 30-74 -> 99291 x1; then each additional full
// 30-minute block adds a 99292 unit. The first 99292 attaches at 75 minutes
// (74 + 1), so units of 99292 = floor((net - 75) / 30) + 1 for net >= 75.
export function criticalCareTime({ totalMinutes, procedureMinutes = 0 }) {
  num('totalMinutes', totalMinutes, { min: 0, max: 100000 });
  const proc = procedureMinutes == null ? 0 : num('procedureMinutes', procedureMinutes, { min: 0, max: 100000 });
  const total = Math.round(totalMinutes);
  const net = total - Math.round(proc);

  if (net < 30) {
    return {
      totalMinutes: total, procedureMinutes: Math.round(proc), netMinutes: net,
      isCriticalCare: false, code99291: 0, units99292: 0, codes: [],
      note: net < 0
        ? 'Separately reported procedure time exceeds the total time entered -- re-check the inputs; there is no critical-care time to report.'
        : `Net critical-care time is ${net} minute(s), below the 30-minute floor. This is NOT critical care -- report the appropriate E/M visit instead, not 99291.`,
    };
  }
  const units99292 = net >= 75 ? Math.floor((net - 75) / 30) + 1 : 0;
  const codes = ['99291'];
  for (let i = 0; i < units99292; i += 1) codes.push('99292');
  return {
    totalMinutes: total, procedureMinutes: Math.round(proc), netMinutes: net,
    isCriticalCare: true, code99291: 1, units99292, codes,
    note: units99292 === 0
      ? `${net} minutes of net critical care: report 99291 alone (covers the first 30-74 minutes).`
      : `${net} minutes of net critical care: 99291 (first 30-74 min) + 99292 x${units99292} (each additional 30 min).`,
  };
}

// =============================================================================
// 2.3 split-shared -- substantive-portion determiner & FS modifier (2024 rule)
// =============================================================================
// CMS Pub. 100-04 Ch. 12 §30.6.18: in a facility setting, when a physician and
// an NPP both perform part of an E/M, the visit is billed by whoever performs
// the SUBSTANTIVE PORTION; the FS modifier identifies the split/shared service.
// The substantive portion is either more than half of the total time OR a
// substantive part of the MDM (the basis the user selects). When the NPP bills,
// Medicare pays at the NPP percentage (85%) of the physician fee schedule.
export const NPP_FEE_PERCENT = 85; // ruleFamily billing-v80

export function splitShared({ basis, physicianTime = 0, nppTime = 0, mdmBy = '' }) {
  const b = oneOf('basis', basis, ['time', 'mdm']);
  let provider;
  let reason;
  let tie = false;

  if (b === 'time') {
    const pt = num('physicianTime', physicianTime, { min: 0, max: 100000 });
    const nt = num('nppTime', nppTime, { min: 0, max: 100000 });
    const totalTime = pt + nt;
    if (totalTime <= 0) throw new RangeError('enter the physician and/or NPP time -- total time must be positive');
    if (pt > nt) { provider = 'physician'; reason = `the physician performed ${pt} of ${totalTime} total minutes (more than half).`; }
    else if (nt > pt) { provider = 'npp'; reason = `the NPP performed ${nt} of ${totalTime} total minutes (more than half).`; }
    else { provider = 'physician'; tie = true; reason = `time is split exactly evenly (${pt} each); neither exceeds half. The rule requires MORE than half -- document who performed the substantive portion, or switch to the MDM basis.`; }
  } else {
    provider = oneOf('mdmBy', mdmBy, ['physician', 'npp']);
    reason = `the ${provider === 'physician' ? 'physician' : 'NPP'} performed the substantive part of the medical decision making.`;
  }

  const billingProvider = provider; // 'physician' | 'npp'
  const paymentPercent = billingProvider === 'physician' ? 100 : NPP_FEE_PERCENT;
  return {
    basis: b,
    billingProvider,
    fsModifier: true,
    paymentPercent,
    tie,
    verdict: `${billingProvider === 'physician' ? 'The PHYSICIAN' : 'The NPP'} must bill this split/shared visit -- ${reason} Append modifier FS to identify the split/shared service.`,
    paymentNote: billingProvider === 'physician'
      ? 'Billed under the physician: paid at 100% of the physician fee schedule.'
      : `Billed under the NPP: paid at ${NPP_FEE_PERCENT}% of the physician fee schedule -- billing the physician instead (when the basis supports it) recovers the remaining ${100 - NPP_FEE_PERCENT}%.`,
  };
}

// =============================================================================
// 2.4 prolonged-services -- 99417 / 99418 / G2212 / G0316 unit calculator
// =============================================================================
// AMA 99417 (prolonged office/outpatient) / 99418 (prolonged inpatient/
// observation) attach once total time passes 15 minutes beyond the MINIMUM time
// of the highest-level primary code. CMS pays Medicare prolonged outpatient with
// G2212 (and inpatient with G0316), whose floor is 15 minutes beyond the
// MAXIMUM time of the primary -- a higher threshold than 99417. Billing 99417 to
// a Medicare payer that wants G2212 is the classic error this tile prevents.
// Each add-on unit is a further 15 minutes. CMS Pub. 100-04 Ch. 12.
//
// Floors per primary code (the minute at which the FIRST add-on unit is
// reportable). AMA = primary minimum + 15; Medicare = primary maximum + 15.
const PROLONGED_PRIMARIES = Object.freeze({
  99205: { setting: 'office/outpatient, new (60-74 min)', ama: { code: '99417', floor: 75 }, medicare: { code: 'G2212', floor: 89 } },
  99215: { setting: 'office/outpatient, established (40-54 min)', ama: { code: '99417', floor: 55 }, medicare: { code: 'G2212', floor: 69 } },
  99223: { setting: 'inpatient/observation, initial (75-89 min)', ama: { code: '99418', floor: 90 }, medicare: { code: 'G0316', floor: 104 } },
  99233: { setting: 'inpatient/observation, subsequent (50-64 min)', ama: { code: '99418', floor: 65 }, medicare: { code: 'G0316', floor: 79 } },
});
export const PROLONGED_PRIMARY_CODES = Object.freeze(Object.keys(PROLONGED_PRIMARIES));

export function prolongedServices({ primaryCode, totalMinutes, payer }) {
  const code = typeof primaryCode === 'number' && Number.isFinite(primaryCode)
    ? String(Math.round(primaryCode))
    : (typeof primaryCode === 'string' ? primaryCode.trim().toUpperCase() : '');
  const def = PROLONGED_PRIMARIES[code];
  if (!def) {
    throw new RangeError(`primaryCode must be one of: ${PROLONGED_PRIMARY_CODES.join(', ')} (the time-selectable highest-level E/M codes prolonged add-ons attach to)`);
  }
  num('totalMinutes', totalMinutes, { min: 0, max: 100000 });
  const total = Math.round(totalMinutes);
  const p = oneOf('payer', payer, ['ama', 'medicare']);
  const rule = def[p];
  const otherKey = p === 'ama' ? 'medicare' : 'ama';
  const other = def[otherKey];

  const units = total >= rule.floor ? Math.floor((total - rule.floor) / 15) + 1 : 0;
  const divergence = `AMA ${def.ama.code} starts at ${def.ama.floor} min; Medicare ${def.medicare.code} starts at ${def.medicare.floor} min. Bill ${rule.code} to a ${p === 'ama' ? 'CPT/commercial' : 'Medicare'} payer -- not ${other.code}.`;

  if (units === 0) {
    return {
      primaryCode: code, primarySetting: def.setting, payer: p,
      prolongedCode: rule.code, threshold: rule.floor, units: 0, totalMinutes: total,
      note: `${total} minutes is below the ${rule.code} threshold of ${rule.floor} minutes for ${code} -- no prolonged-service add-on yet. ${divergence}`,
      divergence,
    };
  }
  return {
    primaryCode: code, primarySetting: def.setting, payer: p,
    prolongedCode: rule.code, threshold: rule.floor, units, totalMinutes: total,
    note: `${total} minutes with primary ${code}: report ${rule.code} x${units} (each unit = 15 min beyond the ${rule.floor}-minute threshold). ${divergence}`,
    divergence,
  };
}

// =============================================================================
// 2.5 therapy-units -- timed-code units under the 8-minute rule
// =============================================================================
// CMS Pub. 100-04 Ch. 5 §20.2 / 42 CFR §410: the Medicare 8-minute rule counts
// total timed-treatment minutes once, then converts: 8-22 = 1 unit, 23-37 = 2,
// 38-52 = 3, 53-67 = 4, ... each +15 adds a unit (units = floor((total+7)/15);
// 0 below 8). The AMA "Rule of Eights" instead applies the 8-minute threshold to
// EACH service individually and sums -- which diverges from the cumulative rule
// at the boundaries (pooled remainders the per-service count drops).
function eightMinuteUnits(minutes) {
  // 0 for minutes < 8; floor((m+7)/15) otherwise (8->1, 22->1, 23->2, 53->4).
  return minutes < 8 ? 0 : Math.floor((minutes + 7) / 15);
}
function bandLabel(units) {
  if (units === 0) return 'below 8 minutes -- not billable';
  const lo = 8 + (units - 1) * 15;
  const hi = 22 + (units - 1) * 15;
  return `${lo}-${hi} min -> ${units} unit(s)`;
}

export function therapyUnits({ totalMinutes, rule, perServiceMinutes }) {
  const r = oneOf('rule', rule, ['medicare', 'rule-of-eights']);

  if (r === 'medicare') {
    num('totalMinutes', totalMinutes, { min: 0, max: 100000 });
    const total = Math.round(totalMinutes);
    const units = eightMinuteUnits(total);
    return {
      rule: r, totalMinutes: total, units, band: bandLabel(units),
      note: units === 0
        ? `${total} timed minutes is below the 8-minute floor -- no billable timed unit.`
        : `${total} cumulative timed minutes -> ${units} unit(s) under the Medicare 8-minute rule (${bandLabel(units)}).`,
    };
  }

  // Rule of Eights: each service graded on its own minutes, then summed.
  if (!Array.isArray(perServiceMinutes) || perServiceMinutes.length === 0) {
    throw new TypeError('Rule of Eights needs perServiceMinutes: a non-empty array of per-service minute totals');
  }
  let total = 0;
  let units = 0;
  const services = [];
  for (let i = 0; i < perServiceMinutes.length; i += 1) {
    const m = num(`perServiceMinutes[${i}]`, perServiceMinutes[i], { min: 0, max: 100000 });
    const mm = Math.round(m);
    const u = eightMinuteUnits(mm);
    total += mm; units += u;
    services.push({ minutes: mm, units: u });
  }
  const medicareUnits = eightMinuteUnits(total);
  const diverges = units !== medicareUnits;
  return {
    rule: r, totalMinutes: total, units, services, medicareUnits, diverges,
    note: diverges
      ? `Rule of Eights (per-service) yields ${units} unit(s); the Medicare cumulative 8-minute rule on the same ${total} total minutes yields ${medicareUnits}. They DIVERGE here -- the boundary case that drives PT/OT/SLP under- and over-billing.`
      : `Rule of Eights yields ${units} unit(s); the Medicare cumulative rule agrees (${medicareUnits}) on these ${total} minutes.`,
  };
}

// =============================================================================
// 2.6 anesthesia-units -- base + time + modifying units x anesthesia CF
// =============================================================================
// CMS Pub. 100-04 Ch. 12 §50: anesthesia payment = (base units + time units +
// modifying units) x the anesthesia conversion factor. Time unit = 15 minutes.
// Base units come from the ASA Relative Value Guide (entered, not shipped --
// doctrine clause 2). Medical-direction modifiers set the concurrency payment
// percentage: AA (personally performed) and QZ (CRNA, non-directed) pay 100%;
// QK / QY / QX (medically directed) pay 50% of the calculated amount; AD
// (medical supervision, >4 concurrent) pays a flat 3 base units.
export const ANESTHESIA_CF_DEFAULT = 20.3178; // ruleFamily billing-v80: CY2025 CMS national anesthesia CF
export const MEDICAL_DIRECTION = Object.freeze({
  aa: { pct: 100, label: 'AA -- personally performed by the anesthesiologist (100%)' },
  qz: { pct: 100, label: 'QZ -- CRNA without medical direction (100%)' },
  qy: { pct: 50, label: 'QY -- medical direction of one CRNA (50% to each)' },
  qk: { pct: 50, label: 'QK -- medical direction of 2-4 concurrent procedures (50%)' },
  qx: { pct: 50, label: 'QX -- CRNA with medical direction (50%)' },
  ad: { flatBaseUnits: 3, label: 'AD -- medical supervision, more than four concurrent (flat 3 base units; +1 unit if present at induction)' },
});
export const MEDICAL_DIRECTION_KEYS = Object.freeze(Object.keys(MEDICAL_DIRECTION));

export function anesthesiaUnits({ baseUnits, timeMinutes, modifyingUnits = 0, conversionFactor, medicalDirection = 'aa' }) {
  num('baseUnits', baseUnits, { min: 0, max: 1000 });
  num('timeMinutes', timeMinutes, { min: 0, max: 100000 });
  const mod = modifyingUnits == null ? 0 : num('modifyingUnits', modifyingUnits, { min: 0, max: 1000 });
  const cf = num('conversionFactor', conversionFactor, { min: 0, max: 100000 });
  const dir = oneOf('medicalDirection', medicalDirection, MEDICAL_DIRECTION_KEYS);
  const rule = MEDICAL_DIRECTION[dir];

  // Time units = minutes / 15 (CMS reports anesthesia time in 15-minute units;
  // kept to one decimal so a 7-minute remainder is not silently dropped).
  const timeUnits = Math.round((timeMinutes / 15) * 10) / 10;
  const totalUnits = Math.round((baseUnits + timeUnits + mod) * 10) / 10;
  const fullCents = Math.round(totalUnits * cf * 100);

  if (rule.flatBaseUnits != null) {
    // AD: payment is a flat allowance of 3 base units x CF, independent of time.
    const directedCents = Math.round(rule.flatBaseUnits * cf * 100);
    return {
      timeUnits, totalUnits, baseUnits: Math.round(baseUnits * 10) / 10,
      modifyingUnits: Math.round(mod * 10) / 10, conversionFactor: cf,
      medicalDirection: dir, directionLabel: rule.label, directionPercent: null,
      fullPaymentCents: fullCents, directedPaymentCents: directedCents,
      note: `Medical supervision (AD): payment is a flat ${rule.flatBaseUnits} base units x $${cf} = ${(directedCents / 100).toFixed(2)} dollars, independent of time units (+1 unit if the physician was present at induction). The (base+time+mod) total is shown for reference only.`,
    };
  }
  const directedCents = Math.round(fullCents * (rule.pct / 100));
  return {
    timeUnits, totalUnits, baseUnits: Math.round(baseUnits * 10) / 10,
    modifyingUnits: Math.round(mod * 10) / 10, conversionFactor: cf,
    medicalDirection: dir, directionLabel: rule.label, directionPercent: rule.pct,
    fullPaymentCents: fullCents, directedPaymentCents: directedCents,
    note: `(${Math.round(baseUnits * 10) / 10} base + ${timeUnits} time + ${Math.round(mod * 10) / 10} modifying) = ${totalUnits} units x $${cf} = ${(fullCents / 100).toFixed(2)} dollars; ${rule.pct}% for ${dir.toUpperCase()} = ${(directedCents / 100).toFixed(2)} dollars.`,
  };
}
