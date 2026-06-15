// spec-v81 §2: Drug & infusion billing -- three deterministic engines for the
// place claims hemorrhage money and trigger audits (spec-v77 billing & coding
// program, Group B "Billing & Reimbursement").
//
//   2.1 ndcHcpcsUnits     -- dose -> HCPCS billing units (the unit != the mg)
//   2.2 drugWastage       -- JW (discarded) / JZ (zero-waste) units + least-waste vial
//   2.3 infusionHierarchy -- the 96360-96379 initial-code picker (hierarchy, not clock)
//
// Doctrine (spec-v77 §2): no proprietary CPT descriptor file and no bundled
// J-code -> unit-size master ship -- the billing-unit size is the user's input
// (entered from the code descriptor); these functions compute the units / waste
// / role from it. The vial-type and payer/setting forks are EXPLICIT, never
// inferred (spec-v81 §3): multi-dose -> JW is REFUSED, not warned.
//
// Safety contract (spec-v59): unit math is exact and integer where the rule is;
// the rounding rule is explicit and tested at fractional boundaries. Bad inputs
// throw TypeError/RangeError (caught by the view's safe() wrapper); no returned
// string embeds NaN / Infinity / undefined (strings are built from validated
// numbers and fixed text).
//
// Dated constants (the JZ-required date, the 16-minute infusion/push floor, the
// CPT 96360-96379 hierarchy ordering) are ledger-tracked in
// pa-staleness-ledger.json (ruleFamily "billing-v81"); check-pa-staleness guards
// their currency in CI.

import { num, r2, r3 } from './num.js';

// --- shared input guards -----------------------------------------------------
function oneOf(name, v, allowed) {
  const s = typeof v === 'string' ? v.trim().toLowerCase() : '';
  if (!allowed.includes(s)) {
    throw new TypeError(`${name} must be one of: ${allowed.join(', ')}`);
  }
  return s;
}

// Measure families: a dose can only be divided by a billing unit of the SAME
// kind. Mass converts within {mcg, mg, g} (base = mg); "units" (international
// units / USP units) and "ml" are their own families and do not convert across.
const MEASURE_TO_MG = Object.freeze({ mcg: 0.001, mg: 1, g: 1000 });
const MEASURE_FAMILY = Object.freeze({
  mcg: 'mass', mg: 'mass', g: 'mass', units: 'units', ml: 'volume',
});
export const DOSE_UNITS = Object.freeze(Object.keys(MEASURE_FAMILY));

// Convert a value in `unit` to the family's base (mg for mass; identity for
// units/volume). Throws on an unknown unit.
function toBase(name, value, unit) {
  const u = oneOf(name, unit, DOSE_UNITS);
  if (MEASURE_FAMILY[u] === 'mass') return { base: value * MEASURE_TO_MG[u], family: 'mass', unit: u };
  return { base: value, family: MEASURE_FAMILY[u], unit: u };
}

// Round per the explicit rule. "up" is the conservative single-dose billing
// default (a partial unit administered is a whole unit reported); "nearest" and
// "down" are offered for codes whose descriptor specifies them.
const ROUNDING_RULES = Object.freeze(['up', 'nearest', 'down']);
function roundUnits(exact, rule) {
  if (rule === 'up') return Math.ceil(exact - 1e-9);
  if (rule === 'down') return Math.floor(exact + 1e-9);
  return Math.round(exact);
}

// =============================================================================
// 2.1 ndc-hcpcs-units -- dose administered -> number of HCPCS billing units
// =============================================================================
// A J-code's billing unit is a fixed amount ("1 unit = 10 mg"). The dose given
// must be divided by that unit and rounded per the unit's rule to get the units
// to report. The off-by-a-factor error here is the most common drug-claim
// mistake. CMS HCPCS Level II drug descriptors; CMS Pub. 100-04 Ch. 17.
export function ndcHcpcsUnits({ dose, doseUnit, unitSize, unitUnit, rounding = 'up' }) {
  num('dose', dose, { min: 0, max: 1e9 });
  num('unitSize', unitSize, { min: 1e-9, max: 1e9 });
  const rule = oneOf('rounding', rounding, ROUNDING_RULES);
  const d = toBase('doseUnit', dose, doseUnit);
  const u = toBase('unitUnit', unitSize, unitUnit);
  if (d.family !== u.family) {
    throw new RangeError(`dose (${d.unit}) and the billing unit (${u.unit}) must measure the same thing (both mass, both units, or both volume)`);
  }
  const exactUnits = d.base / u.base;
  const billingUnits = roundUnits(exactUnits, rule);
  const isCleanMultiple = Math.abs(exactUnits - Math.round(exactUnits)) < 1e-9;
  return {
    dose, doseUnit: d.unit, unitSize, unitUnit: u.unit, rounding: rule,
    exactUnits: r3(exactUnits),
    billingUnits,
    isCleanMultiple,
    note: isCleanMultiple
      ? `${dose} ${d.unit} / ${unitSize} ${u.unit} per unit = ${r3(exactUnits)} billing units (a clean multiple).`
      : `${dose} ${d.unit} / ${unitSize} ${u.unit} per unit = ${r3(exactUnits)} -> ${billingUnits} billing units (rounded ${rule}). The dose is NOT a clean multiple of the billing unit -- the case that produces fractional-unit and rounding errors; confirm the rounding rule against the code descriptor.`,
  };
}

// =============================================================================
// 2.2 drug-wastage -- JW (discarded) / JZ (zero waste) units from a single-dose vial
// =============================================================================
// CMS Pub. 100-04 Ch. 17 §40 + the JW/JZ guidance: for a SINGLE-dose vial, bill
// the administered amount on one line and the discarded amount with modifier JW;
// when NO drug is discarded, append JZ (required since 2023-07-01). MULTI-dose
// vials are NOT eligible for JW -- billing waste on one is a denial.
export const JZ_REQUIRED_DATE = '2023-07-01'; // ruleFamily billing-v81

// Least-waste vial selection: minimize total drawn amount >= dose using the
// supplied vial sizes (unlimited count each). An exact bounded DP over the
// amount axis (resolution = the smallest vial), capped just past the dose so we
// never search beyond where waste could still shrink (spec-v81 §3).
function leastWasteVials(dose, sizes) {
  const clean = sizes.filter((s) => Number.isFinite(s) && s > 0);
  if (!clean.length) return null;
  const maxSize = Math.max(...clean);
  // Quantize to whole "smallest-vial" steps to keep the DP finite and exact for
  // the integer-milligram vial sizes these come in. Work in a scaled integer
  // grid at 0.001 resolution, bounded to dose + maxSize.
  const SCALE = 1000;
  const target = Math.ceil(dose * SCALE);
  const cap = target + Math.ceil(maxSize * SCALE);
  const steps = clean.map((s) => Math.round(s * SCALE)).filter((s) => s > 0);
  // best[a] = min number of vials to reach exactly amount a (a in scaled units).
  const best = new Array(cap + 1).fill(Infinity);
  const from = new Array(cap + 1).fill(-1);
  best[0] = 0;
  for (let a = 1; a <= cap; a += 1) {
    for (const step of steps) {
      if (a - step >= 0 && best[a - step] + 1 < best[a]) {
        best[a] = best[a - step] + 1;
        from[a] = step;
      }
    }
  }
  // Smallest reachable total >= target.
  let chosen = -1;
  for (let a = target; a <= cap; a += 1) {
    if (best[a] !== Infinity) { chosen = a; break; }
  }
  if (chosen < 0) return null;
  const counts = new Map();
  for (let a = chosen; a > 0; a -= from[a]) {
    const sizeMg = from[a] / SCALE;
    counts.set(sizeMg, (counts.get(sizeMg) || 0) + 1);
  }
  const combo = [...counts.entries()].sort((x, y) => y[0] - x[0]).map(([size, n]) => ({ size, count: n }));
  return { totalAmount: r3(chosen / SCALE), wasteAmount: r2(chosen / SCALE - dose), combo };
}

export function drugWastage({ vialSize, dose, doseUnit, unitSize, unitUnit, vialType, availableVialSizes }) {
  num('vialSize', vialSize, { min: 1e-9, max: 1e9 });
  num('dose', dose, { min: 0, max: 1e9 });
  num('unitSize', unitSize, { min: 1e-9, max: 1e9 });
  const type = oneOf('vialType', vialType, ['single', 'multi']);
  // All math is done in billing units, so the dose/vial/unit must share a family.
  const d = toBase('doseUnit', dose, doseUnit);
  const v = toBase('doseUnit', vialSize, doseUnit); // vial entered in the dose's unit
  const u = toBase('unitUnit', unitSize, unitUnit);
  if (d.family !== u.family) {
    throw new RangeError(`dose (${d.unit}) and the billing unit (${u.unit}) must measure the same thing`);
  }
  if (dose > vialSize && type === 'single') {
    // More than one single-dose vial is needed; draw whole vials.
    // (Handled below via vialsUsed; not an error.)
  }

  const vialsUsed = Math.max(1, Math.ceil(dose / vialSize - 1e-9));
  const totalDrawnBase = vialsUsed * v.base;
  const totalUnits = Math.round(totalDrawnBase / u.base);
  const administeredUnits = Math.ceil(d.base / u.base - 1e-9);
  const discardedUnits = Math.max(0, totalUnits - administeredUnits);

  // The optional least-waste vial selection (computed in the dose's unit).
  let leastWaste = null;
  if (Array.isArray(availableVialSizes) && availableVialSizes.length) {
    leastWaste = leastWasteVials(dose, availableVialSizes);
  }

  if (type === 'multi') {
    return {
      vialType: 'multi', eligibleForJW: false,
      vialsUsed, totalUnits, administeredUnits, discardedUnits: 0,
      modifier: null,
      leastWaste,
      note: 'MULTI-DOSE vial: JW does NOT apply -- do not bill the unused drug as waste. Discarded drug from a multi-dose vial is not separately payable; billing JW on it is a denial (CMS Pub. 100-04 Ch. 17 §40).',
    };
  }

  if (discardedUnits === 0) {
    return {
      vialType: 'single', eligibleForJW: true,
      vialsUsed, totalUnits, administeredUnits, discardedUnits: 0,
      modifier: 'JZ',
      leastWaste,
      note: `Zero waste: the dose uses the full vial(s) (${administeredUnits} of ${totalUnits} units). Append modifier JZ to attest no drug was discarded -- required since ${JZ_REQUIRED_DATE}; omitting JZ is an active audit target.`,
    };
  }
  return {
    vialType: 'single', eligibleForJW: true,
    vialsUsed, totalUnits, administeredUnits, discardedUnits,
    modifier: 'JW',
    leastWaste,
    note: `Single-dose vial, partial use: bill ${administeredUnits} administered unit(s) on one line and ${discardedUnits} discarded unit(s) with modifier JW (administered + JW must total the ${totalUnits} unit(s) drawn). CMS Pub. 100-04 Ch. 17 §40.`,
  };
}

// =============================================================================
// 2.3 infusion-hierarchy -- the IV infusion/injection/hydration initial-code picker
// =============================================================================
// AMA CPT 96360-96379 + CMS Pub. 100-04 Ch. 12: exactly ONE "initial" code per
// encounter (single IV site), chosen by the CMS HIERARCHY, not by what ran
// first: chemo/complex > therapeutic/prophylactic/diagnostic > hydration; and
// within a category, infusion > push > injection. Everything else is reported as
// sequential / concurrent / additional-hour / additional-push. An infusion that
// runs under 16 minutes is reported as an IV PUSH, not an infusion.
export const INFUSION_PUSH_FLOOR_MIN = 16; // ruleFamily billing-v81

const CATEGORY_RANK = Object.freeze({ chemo: 3, therapeutic: 2, hydration: 1 });
const MODE_RANK = Object.freeze({ infusion: 3, push: 2 });

// Canonical administration kinds the tile accepts. Hydration is infusion-only.
const KINDS = Object.freeze({
  'chemo-infusion': { category: 'chemo', mode: 'infusion' },
  'chemo-push': { category: 'chemo', mode: 'push' },
  'therapeutic-infusion': { category: 'therapeutic', mode: 'infusion' },
  'therapeutic-push': { category: 'therapeutic', mode: 'push' },
  'hydration': { category: 'hydration', mode: 'infusion' },
});
export const ADMIN_KINDS = Object.freeze(Object.keys(KINDS));

// CPT code maps. INITIAL / sequential (different substance) / additional-hour
// (same infusion continuing) / concurrent, by category+mode.
const CODES = Object.freeze({
  'chemo-infusion': { initial: '96413', sequential: '96417', additionalHour: '96415', concurrent: null },
  'chemo-push': { initial: '96409', sequential: '96411', additionalHour: null, concurrent: null },
  'therapeutic-infusion': { initial: '96365', sequential: '96367', additionalHour: '96366', concurrent: '96368' },
  'therapeutic-push': { initial: '96374', sequential: '96375', additionalHour: null, concurrent: null },
  'hydration': { initial: '96360', sequential: '96361', additionalHour: '96361', concurrent: null },
});

// Additional-hour units for an infusion: the first hour is the initial/sequential
// code; each further full hour is an add-on, and a remaining portion of MORE than
// 30 minutes counts as another hour (CPT time-increment rule).
function additionalHours(minutes) {
  if (minutes <= 60) return 0;
  const extra = minutes - 60;
  return Math.floor(extra / 60) + (extra % 60 > 30 ? 1 : 0);
}

export function infusionHierarchy({ administrations }) {
  if (!Array.isArray(administrations)) {
    throw new TypeError('administrations must be an array of { type, minutes } objects');
  }
  if (administrations.length === 0) {
    throw new RangeError('enter at least one administration');
  }
  if (administrations.length > 50) {
    throw new RangeError('too many administrations (max 50)');
  }

  // Normalize + reclassify sub-16-minute infusions to pushes.
  const items = administrations.map((a, i) => {
    if (!a || typeof a !== 'object') throw new TypeError(`administration ${i + 1} must be an object`);
    const type = oneOf(`administration ${i + 1} type`, a.type, ADMIN_KINDS);
    let { category, mode } = KINDS[type];
    const minutes = a.minutes == null ? 0 : num(`administration ${i + 1} minutes`, a.minutes, { min: 0, max: 100000 });
    const concurrent = !!a.concurrent;
    let reclassified = false;
    let effectiveType = type;
    if (mode === 'infusion' && minutes > 0 && minutes < INFUSION_PUSH_FLOOR_MIN && category !== 'hydration') {
      // <16-min therapeutic/chemo infusion is reported as a push.
      mode = 'push';
      effectiveType = category === 'chemo' ? 'chemo-push' : 'therapeutic-push';
      reclassified = true;
    }
    return { index: i, type, effectiveType, category, mode, minutes: Math.round(minutes), concurrent, reclassified };
  });

  // Pick the single initial by hierarchy: category, then mode, then longer
  // duration, then input order -- never by chronology.
  const ranked = [...items].sort((x, y) =>
    (CATEGORY_RANK[y.category] - CATEGORY_RANK[x.category])
    || (MODE_RANK[y.mode] - MODE_RANK[x.mode])
    || (y.minutes - x.minutes)
    || (x.index - y.index));
  const initial = ranked[0];

  const lines = items.map((it) => {
    const codeSet = CODES[it.effectiveType];
    if (it.index === initial.index) {
      const addHours = it.mode === 'infusion' ? additionalHours(it.minutes) : 0;
      return {
        index: it.index, type: it.type, category: it.category, mode: it.mode,
        minutes: it.minutes, reclassified: it.reclassified,
        role: 'initial', code: codeSet.initial,
        addOnCode: addHours > 0 ? codeSet.additionalHour : null,
        addOnUnits: addHours,
      };
    }
    // Non-initial line.
    if (it.mode === 'push') {
      return {
        index: it.index, type: it.type, category: it.category, mode: 'push',
        minutes: it.minutes, reclassified: it.reclassified,
        role: 'additional-push', code: codeSet.sequential, addOnCode: null, addOnUnits: 0,
      };
    }
    if (it.concurrent && codeSet.concurrent) {
      return {
        index: it.index, type: it.type, category: it.category, mode: 'infusion',
        minutes: it.minutes, reclassified: it.reclassified,
        role: 'concurrent-infusion', code: codeSet.concurrent, addOnCode: null, addOnUnits: 0,
      };
    }
    const addHours = additionalHours(it.minutes);
    return {
      index: it.index, type: it.type, category: it.category, mode: 'infusion',
      minutes: it.minutes, reclassified: it.reclassified,
      role: it.category === 'hydration' ? 'sequential-hydration' : 'sequential-infusion',
      code: codeSet.sequential,
      addOnCode: addHours > 0 ? codeSet.additionalHour : null,
      addOnUnits: addHours,
    };
  });

  const initialLine = lines.find((l) => l.role === 'initial');
  const reclassNote = items.some((it) => it.reclassified)
    ? ` One infusion ran under ${INFUSION_PUSH_FLOOR_MIN} minutes and is reported as an IV push, not an infusion.`
    : '';
  return {
    count: items.length,
    initialIndex: initial.index,
    initialCode: initialLine.code,
    initialKind: initial.type,
    lines,
    note: `The initial code is ${initialLine.code} (${initial.type.replace('-', ' ')}), chosen by the CMS hierarchy (chemo > therapeutic > hydration; infusion > push), NOT by what was given first. Every other administration is reported as a sequential / concurrent / additional-hour / additional-push add-on.${reclassNote}`,
  };
}
