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
