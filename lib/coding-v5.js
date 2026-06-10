// spec-v5 §4.4: coding & billing helpers.
// Pure functions. No external data. Renderers in views/group-v5.js.

// --- T14: Time-based E/M code selector (AMA 2021 office/outpatient) ------
// AMA 2021 office E/M codes by total time on date of encounter
// (face-to-face plus non-face-to-face same-day provider work). Bands per
// CPT 2021 (unchanged through 2026):
//
//   New patient (highest level reached at lower bound):
//     99202: 15-29   99203: 30-44   99204: 45-59   99205: 60-74
//     99417 (prolonged) adds in 15-min units when total time >= 75.
//   Established patient:
//     99212: 10-19   99213: 20-29   99214: 30-39   99215: 40-54
//     99417 (prolonged) adds in 15-min units when total time >= 55.
//
// 99201 was deleted in 2021. 99211 is a nurse-only visit with no time
// threshold and is NOT selectable from time alone, so it is excluded.
//
// Citation: AMA CPT E/M guidelines, 2021 office/outpatient revision.

const EM_NEW = [
  { min: 60, code: '99205' },
  { min: 45, code: '99204' },
  { min: 30, code: '99203' },
  { min: 15, code: '99202' },
];

const EM_EST = [
  { min: 40, code: '99215' },
  { min: 30, code: '99214' },
  { min: 20, code: '99213' },
  { min: 10, code: '99212' },
];

// Prolonged service (CPT 99417) kicks in 15 minutes past the top base-band
// floor: 75 min for new (60 + 15), 55 min for established (40 + 15).
const PROLONGED_FLOOR = { new: 75, established: 55 };

export function emTimeSelector({ totalMinutes, encounterType }) {
  if (typeof totalMinutes !== 'number' || !Number.isFinite(totalMinutes) || totalMinutes < 0) {
    throw new TypeError('totalMinutes must be a non-negative finite number');
  }
  let table;
  if (encounterType === 'new') table = EM_NEW;
  else if (encounterType === 'established') table = EM_EST;
  else throw new RangeError('encounterType must be "new" or "established"');

  let code = null;
  for (const row of table) {
    if (totalMinutes >= row.min) { code = row.code; break; }
  }

  const prolongedFloor = PROLONGED_FLOOR[encounterType];
  let prolongedUnits = 0;
  if (totalMinutes >= prolongedFloor) {
    prolongedUnits = Math.floor((totalMinutes - prolongedFloor) / 15) + 1;
  }

  if (code === null) {
    return {
      code: null,
      minutes: totalMinutes,
      encounterType,
      prolongedUnits: 0,
      note: encounterType === 'new'
        ? 'Below the 15-minute floor for outpatient new-patient E/M (99202).'
        : 'Below the 10-minute floor for an established-patient time-based code (99212). 99211 is nurse-only and not time-selectable.',
    };
  }
  return {
    code,
    minutes: totalMinutes,
    encounterType,
    prolongedUnits,
    prolongedCode: prolongedUnits > 0 ? '99417' : null,
  };
}

// --- T15: NDC 10 <-> 11 digit converter ----------------------------------
// FDA labels ship in three 10-digit formats: 4-4-2, 5-3-2, 5-4-1.
// CMS billing format is always 11 digits (5-4-2). The conversion pads
// the under-length segment with a leading zero.
//
// Input parsing accepts:
//   - dash-separated 10- or 11-digit forms
//   - bare digit strings of length 10 or 11 (5-4-2 if 11)
//
// Output: { billing11, fda10 } with both formats present.

function digits(s) { return String(s || '').replace(/\D/g, ''); }

export function parseNdc(input) {
  const raw = String(input || '').trim();
  if (!raw) throw new RangeError('NDC input is required');
  // Dashed form: parse segments
  if (raw.includes('-')) {
    const parts = raw.split('-').map((p) => p.trim());
    if (parts.length !== 3) throw new RangeError('NDC must have three dash-separated segments');
    const [a, b, c] = parts;
    if (!/^\d+$/.test(a + b + c)) throw new RangeError('NDC segments must be digits');
    if (a.length === 4 && b.length === 4 && c.length === 2) return { labeler: '0' + a, product: b, package: c, source: '4-4-2' };
    if (a.length === 5 && b.length === 3 && c.length === 2) return { labeler: a, product: '0' + b, package: c, source: '5-3-2' };
    if (a.length === 5 && b.length === 4 && c.length === 1) return { labeler: a, product: b, package: '0' + c, source: '5-4-1' };
    if (a.length === 5 && b.length === 4 && c.length === 2) return { labeler: a, product: b, package: c, source: '5-4-2' };
    throw new RangeError(`Unrecognized NDC segment lengths: ${a.length}-${b.length}-${c.length}`);
  }
  // Bare digit string: 11 digits = already 5-4-2; 10 digits is ambiguous
  // without dashes — reject and ask for dashed form.
  const d = digits(raw);
  if (d.length === 11) return { labeler: d.slice(0, 5), product: d.slice(5, 9), package: d.slice(9, 11), source: '5-4-2' };
  if (d.length === 10) throw new RangeError('Bare 10-digit NDC is ambiguous; provide dashes (4-4-2, 5-3-2, or 5-4-1)');
  throw new RangeError(`NDC must be 10 or 11 digits; got ${d.length}`);
}

export function ndcConvert(input) {
  const p = parseNdc(input);
  const billing11 = `${p.labeler}-${p.product}-${p.package}`;
  // 10-digit FDA form: when the original 10-digit format is known, drop
  // the segment-specific inserted zero. When the input was already 11-digit
  // (5-4-2), the original could be any of the three 10-digit shapes if
  // the leading digit of that segment is '0' — enumerate plausible forms
  // rather than guessing.
  let fda10 = null;
  let fda10Candidates = null;
  if (p.source === '4-4-2') {
    fda10 = `${p.labeler.slice(1)}-${p.product}-${p.package}`;
  } else if (p.source === '5-3-2') {
    fda10 = `${p.labeler}-${p.product.slice(1)}-${p.package}`;
  } else if (p.source === '5-4-1') {
    fda10 = `${p.labeler}-${p.product}-${p.package.slice(1)}`;
  } else {
    // source === '5-4-2' (already billing-format 11-digit). For each segment
    // whose leading digit is '0', that zero *could* be the padding inserted
    // when 10→11 conversion was done, so the original could have been the
    // corresponding shorter shape. The truly correct answer requires the
    // labeler's drug-listing record; we surface every plausible candidate.
    fda10Candidates = [];
    if (p.labeler.startsWith('0')) fda10Candidates.push({ form: '4-4-2', value: `${p.labeler.slice(1)}-${p.product}-${p.package}` });
    if (p.product.startsWith('0')) fda10Candidates.push({ form: '5-3-2', value: `${p.labeler}-${p.product.slice(1)}-${p.package}` });
    if (p.package.startsWith('0')) fda10Candidates.push({ form: '5-4-1', value: `${p.labeler}-${p.product}-${p.package.slice(1)}` });
    if (fda10Candidates.length === 1) fda10 = fda10Candidates[0].value;
  }
  return {
    billing11,
    fda10,
    fda10Candidates,
    source: p.source,
  };
}

// --- spec-v63 OA2: denial -> next-step routing ----------------------------
// An input-driven decision, NOT a browsable CARC/RARC code index (the v29 §3
// code-reference retirement stays closed -- no code list is shipped or
// searchable). The user picks the denial CATEGORY they were given; the map
// returns the plain-language meaning, whether the denial is appealable on the
// merits, the next step, and which catalog tile to open next, each anchored to
// the governing 42 CFR Part 405 subpart / CMS manual section. Medicare framing:
// commercial/ERISA appeal rights and levels vary by plan and are not decided
// here (the lib/regulatory.js posture -- it routes, it does not adjudicate).
//
// `appealStart` is the appeal-deadline level the routing implies for an
// appealable denial of an initial determination (Medicare level 1,
// redetermination, runs from the initial determination = the 'initial' row of
// APPEAL_LEVELS), so the renderer can compute the filing deadline through OA1.
export const DENIAL_ROUTES = Object.freeze({
  'medical-necessity': {
    label: 'Medical necessity / not reasonable and necessary',
    meaning: 'The payer judged the service not reasonable and necessary for the diagnosis billed (often an NCD/LCD coverage limit).',
    appealable: true,
    appealStart: 'initial',
    nextStep: 'File a redetermination (Medicare appeal level 1) within 120 days, attaching the clinical records that establish medical necessity.',
    tile: 'appeal-letter',
    cfr: '42 CFR 405.940-405.958 (redetermination); coverage per the applicable NCD/LCD.',
  },
  'non-covered': {
    label: 'Non-covered / statutorily excluded service',
    meaning: 'The item or service is excluded from the benefit. If a valid ABN was issued, the beneficiary may be liable; if not, balance-billing limits may apply.',
    appealable: true,
    appealStart: 'initial',
    nextStep: 'Confirm the exclusion basis; if the service should be covered, file a redetermination within 120 days. Check whether an ABN (CMS-R-131) was on file.',
    tile: 'appeal-letter',
    cfr: '42 CFR 405.940 (appeal of an initial determination); 42 CFR 411 (exclusions).',
  },
  'no-prior-auth': {
    label: 'Prior authorization not on file',
    meaning: 'The service required prior authorization that was absent or expired when the claim was adjudicated.',
    appealable: true,
    appealStart: 'initial',
    nextStep: 'Verify the payer\'s decision clock and packet completeness, then appeal or resubmit with the authorization. Open pa-turnaround for the decision window and pa-lint for the packet.',
    tile: 'pa-turnaround',
    cfr: '42 CFR 405.940 (appeal); prior-auth windows per CMS-0057-F.',
  },
  'coding-bundling': {
    label: 'Coding / bundling edit (NCCI)',
    meaning: 'A code-level or correct-coding edit denied the line -- e.g. an NCCI procedure-to-procedure edit, a modifier requirement, or an invalid code pairing.',
    appealable: true,
    appealStart: 'initial',
    nextStep: 'Review the coding against the NCCI edit; correct and resubmit if the code/modifier was wrong, or appeal with documentation if the edit was applied in error.',
    tile: 'pa-lint',
    cfr: '42 CFR 405.940 (appeal); CMS NCCI Policy Manual.',
  },
  'timely-filing': {
    label: 'Untimely filing (past the filing limit)',
    meaning: 'The claim was received after the payer\'s filing limit. This is an administrative denial, not a coverage decision -- it is generally not appealable on the merits.',
    appealable: false,
    appealStart: null,
    nextStep: 'Confirm the filing deadline and whether a good-cause exception applies. Open timely-filing to check the limit against the date of service.',
    tile: 'timely-filing',
    cfr: '42 CFR 424.44 (Medicare one-year filing limit); good-cause exceptions per the Medicare Claims Processing Manual Ch. 1 §70.',
  },
  'duplicate': {
    label: 'Duplicate claim/service',
    meaning: 'The payer matched an already-adjudicated claim. No appeal is needed unless the match is wrong.',
    appealable: false,
    appealStart: null,
    nextStep: 'Verify against the previously paid/denied claim. If the services are genuinely distinct, resubmit with an appropriate modifier and documentation rather than appealing.',
    tile: 'ndc-convert',
    cfr: 'CMS Medicare Claims Processing Manual Ch. 1 (duplicate-claim editing).',
  },
  'cob': {
    label: 'Coordination of benefits / other payer primary',
    meaning: 'Another payer is primary. The claim was denied pending the primary payer\'s adjudication.',
    appealable: false,
    appealStart: null,
    nextStep: 'Bill the primary payer first, then resubmit to the secondary with the primary remittance (EOB/MSN). This is a resubmission, not an appeal.',
    tile: 'roi',
    cfr: '42 CFR 411.20-411.206 (Medicare Secondary Payer).',
  },
  'missing-info': {
    label: 'Missing / invalid information',
    meaning: 'The claim lacked required data or carried an invalid code, NPI, or place of service. It was rejected for correction, not denied on coverage.',
    appealable: false,
    appealStart: null,
    nextStep: 'Correct the flagged field(s) and resubmit; do not file an appeal. Use pa-lint to check packet completeness and ndc-convert for NDC formatting.',
    tile: 'pa-lint',
    cfr: 'CMS Medicare Claims Processing Manual Ch. 1 (claim completeness / return-to-provider).',
  },
});

export function denialRoute({ category }) {
  const r = DENIAL_ROUTES[String(category)];
  if (!r) return null;
  return { ...r };
}
