// spec-v5 §4.4: coding & billing helpers.
// Pure functions. No external data. Renderers in views/group-v5.js.

// --- T14: Time-based E/M code selector (AMA 2021 office/outpatient) ------
// AMA 2021 office E/M codes can be selected by total time on date of
// encounter (face-to-face plus non-face-to-face provider time). Bands
// are inclusive on the low end. The selector returns the code or null
// (under-threshold). No CPT descriptive text is bundled.
//
// Citation: CPT Evaluation and Management code structure, AMA 2021.

const EM_NEW = [
  { min: 75,  code: '99205' },
  { min: 60,  code: '99204' },
  { min: 45,  code: '99203' },
  { min: 30,  code: '99202' },
];
// 99201 was deleted in 2021. New-patient times below 30 min do not
// qualify for an outpatient new-patient E/M code.

const EM_EST = [
  { min: 55,  code: '99215' },
  { min: 40,  code: '99214' },
  { min: 30,  code: '99213' },
  { min: 20,  code: '99212' },
  { min: 10,  code: '99211' }, // 99211 has no time threshold technically;
                               // included as the floor for the helper.
];

export function emTimeSelector({ totalMinutes, encounterType }) {
  if (typeof totalMinutes !== 'number' || !Number.isFinite(totalMinutes) || totalMinutes < 0) {
    throw new TypeError('totalMinutes must be a non-negative finite number');
  }
  let table;
  if (encounterType === 'new') table = EM_NEW;
  else if (encounterType === 'established') table = EM_EST;
  else throw new RangeError('encounterType must be "new" or "established"');
  for (const row of table) {
    if (totalMinutes >= row.min) {
      return { code: row.code, minutes: totalMinutes, encounterType };
    }
  }
  return {
    code: null,
    minutes: totalMinutes,
    encounterType,
    note: encounterType === 'new'
      ? 'Below the 30-minute floor for outpatient new-patient E/M.'
      : 'Below the 99211 floor.',
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
  // 10-digit FDA form: drop the inserted zero based on source if known,
  // else compute the most-likely 10-digit form by assuming labeler is
  // 5-digit (the modern default, since NDCs allocated since 2002 use
  // 5-digit labelers).
  let fda10;
  if (p.source === '4-4-2') fda10 = `${p.labeler.slice(1)}-${p.product}-${p.package}`;
  else if (p.source === '5-3-2') fda10 = `${p.labeler}-${p.product.slice(1)}-${p.package}`;
  else if (p.source === '5-4-1') fda10 = `${p.labeler}-${p.product}-${p.package.slice(1)}`;
  else fda10 = null; // 5-4-2 cannot be converted back without knowing where the inserted zero lives
  return {
    billing11,
    fda10,
    source: p.source,
  };
}
