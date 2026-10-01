// spec-v1510 tool 1: what Medicare allows and pays for a Part B drug, from the quarter's payment limit file.
//
// Allowed = the posted payment limit per HCPCS dosage unit x units. The limit is CMS's (106% of ASP for most
// drugs, 42 U.S.C. 1395w-3a(b)(1); for a biosimilar, its ASP plus 8% or 6% of the reference product's ASP
// under (b)(8), which the file's Notes mark). The tool does not recompute ASP: the file does not post it.
// The patient's coinsurance is the file's percentage (20%, lower where an inflation-adjusted coinsurance
// applies), Medicare pays the rest, and the 2% sequestration reduction comes off Medicare's share.
//
// The site holds one quarter (data/asp), so a date of service outside it has no limit here. A limit typed
// from another quarter's file replaces the lookup.
//
// Pure: no DOM, no fetch, no clock. The caller passes `lookup` (see aspLookup).

import { inputFault, usDateLong } from './num.js';
import { parseDate, diffDays } from './pa/date.js';
import { datasetStatus, EXPIRED_TEXT } from './data.js';
import { SEQUESTRATION_PCT } from './billing-v78.js';

const money = (c) => `$${(c / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const ASK = 'Enter the payment limit per unit from that quarter\'s CMS file instead.';

export const normalizeHcpcs = (raw) => {
  const s = String(raw ?? '').trim().toUpperCase();
  return /^[A-Z0-9]\d{3}[A-Z0-9]$/.test(s) ? s : null;
};
export const shardName = (code) => `${code.slice(0, 1)}.json`;

// aspLookup({ code, manifest, period, rows, now }) -> the `lookup` aspPayment takes. `rows` is the code's
// shard, or null when the manifest lists none for it.
export function aspLookup({ code, manifest, period, rows, now }) {
  if (datasetStatus(manifest, now).status === 'expired') return { status: 'expired' };
  const listed = (manifest.shards || []).some((s) => s.name === shardName(code));
  const row = listed && Array.isArray(rows) ? rows.find((r) => r.code === code) : null;
  return row ? { status: 'found', row, period } : { status: 'not-listed', period };
}

export function aspPayment(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const code = normalizeHcpcs(o.code);
  if (!String(o.code ?? '').trim()) return { valid: false, message: 'Enter the HCPCS code of the drug.' };
  if (!code) return { valid: false, message: 'A HCPCS code is five characters, such as J9035. Check the value entered.' };
  const f = inputFault([['the units billed', o.units, 0.001, 1e6, 'HCPCS dosage units']]);
  if (f) return { valid: false, message: f };
  const units = Number(o.units);
  const notes = [];
  let limit;
  let coins;
  let what;

  if (String(o.limit ?? '').trim()) {
    const lf = inputFault([['the payment limit per unit', o.limit, 0, 1e6, 'dollars']]);
    if (lf) return { valid: false, message: lf };
    limit = Number(o.limit);
    if (String(o.coinsurance ?? '').trim()) {
      const cf = inputFault([['the coinsurance percentage', o.coinsurance, 0, 20, 'percent']]);
      if (cf) return { valid: false, message: cf };
      coins = Number(o.coinsurance);
    } else {
      coins = 20;
      notes.push('No coinsurance percentage was entered, so 20% is used. The file lowers it for some drugs (inflation-adjusted coinsurance).');
    }
    what = `${code}: payment limit $${limit} per unit (entered)`;
  } else {
    const dos = parseDate(o.serviceDate);
    if (!dos) return { valid: false, message: 'Enter the date of service: the payment limit changes each quarter.' };
    const lk = o.lookup || { status: 'unavailable' };
    if (lk.status === 'expired') return { valid: false, message: `${EXPIRED_TEXT} ${ASK}` };
    if (lk.status === 'unavailable') return { valid: false, message: `The payment limit file could not be loaded. ${ASK}` };
    const p = lk.period || {};
    const span = p.effectiveFrom ? `${usDateLong(p.effectiveFrom)} through ${usDateLong(p.effectiveTo)}` : 'the quarter on file';
    if (p.effectiveFrom && (diffDays(dos, parseDate(p.effectiveFrom)) < 0 || diffDays(dos, parseDate(p.effectiveTo)) > 0)) {
      return { valid: false, message: `This site holds the payment limits for ${span}, not for ${usDateLong(dos.toISOString().slice(0, 10))}. ${ASK}` };
    }
    if (lk.status !== 'found') return { valid: false, message: `${code} is not in the Part B payment limit file for ${span}. The file lists drugs paid under the ASP method and a few others; a code that is not there is priced another way, if Medicare covers it.` };
    const r = lk.row;
    if (r.limit == null) return { valid: false, message: `The file posts no payment limit for ${code} for ${span}. Its note: ${r.notes} ${ASK}` };
    limit = r.limit;
    coins = r.coinsurance;
    what = `${code}${r.dosage ? ` (${r.dosage} per unit)` : ''}: payment limit $${limit} per unit for ${span}`;
    if (r.notes) notes.push(`The file's note for this code: ${r.notes}.`);
  }

  const allowed = Math.round(limit * units * 100);
  const patient = Math.round(allowed * coins / 100);
  const medicare = allowed - patient;
  const afterSeq = Math.round(medicare * (1 - SEQUESTRATION_PCT / 100));
  const band = `${what}, times ${units} = ${money(allowed)} allowed. Patient coinsurance ${coins}% = ${money(patient)}; Medicare pays ${money(medicare)}, ${money(afterSeq)} after the ${SEQUESTRATION_PCT}% sequestration reduction.`;
  notes.push('Any Part B deductible the patient still owes is paid first and is not shown. A hospital outpatient department is paid under the OPPS rule for the year, which may differ.');
  return {
    valid: true, allowedCents: allowed, patientCents: patient, medicareCents: medicare, medicareAfterSequestrationCents: afterSeq,
    band, bandLabel: `${money(allowed)} allowed`, abnormal: false, notes,
    note: 'Payment limits are CMS\'s, posted per HCPCS dosage unit; whether Medicare covers the drug for this patient is the contractor\'s decision.',
  };
}
