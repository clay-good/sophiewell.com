// spec-v1505 backfill: ndc-hcpcs-units from an NDC, through the CMS ASP NDC-HCPCS crosswalk (data/asp-ndc).
//
// The NDC (normalized as nadac-margin does, so 4-4-2, 5-3-2 and 5-4-1 reach the same 11 digits) finds
// its HCPCS code(s) in the crosswalk. The code's dosage ("10 MG") becomes the billing-unit size and
// measure, and the dose converts exactly as ndc-hcpcs-units always has (lib/billing-v81.js, imported). A
// dosage the converter cannot read ("UP TO 0.50 MG", "1 MEQ") gives the code and package units and asks
// for the unit size. An NDC billed under more than one code asks which.
//
// Pure: no DOM, no fetch, no clock. The caller passes `lookup` (see xwLookup).

import { normalizeNdc, shardName } from './nadac-margin.js';
import { ndcHcpcsUnits } from './billing-v81.js';
import { datasetStatus, EXPIRED_TEXT } from './data.js';

export { normalizeNdc, shardName };
const dashed = (n) => `${n.slice(0, 5)}-${n.slice(5, 9)}-${n.slice(9)}`;

// parseDosage('10 MG') -> { size: 10, unit: 'mg' }; IU reads as units and CC as mL, and says so.
const MEASURES = { MG: 'mg', MCG: 'mcg', GM: 'g', G: 'g', ML: 'ml', CC: 'ml', UNIT: 'units', UNITS: 'units', IU: 'units' };
export function parseDosage(raw) {
  const m = /^(\d+(?:\.\d+)?)\s*([A-Z]+)$/.exec(String(raw ?? '').trim().toUpperCase());
  if (!m || !MEASURES[m[2]]) return null;
  return { size: Number(m[1]), unit: MEASURES[m[2]], read: m[2] === 'IU' ? 'IU read as units' : m[2] === 'CC' ? 'cc read as mL' : null };
}

export function xwLookup({ ndc, manifest, rows, now }) {
  if (datasetStatus(manifest, now).status === 'expired') return { status: 'expired' };
  const listed = (manifest.shards || []).some((s) => s.name === shardName(ndc));
  const rec = listed && Array.isArray(rows) ? rows.find((r) => r.ndc === ndc) : null;
  return rec ? { status: 'found', rec, edition: manifest.sourceEdition } : { status: 'not-listed', edition: manifest.sourceEdition };
}

// ndcUnits({ ndc, code?, dose, doseUnit, rounding, lookup, unitSize?, unitUnit? }).
export function ndcUnits(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const n = normalizeNdc(o.ndc);
  if (n.error) return { valid: false, message: n.error === 'blank' ? 'Enter the NDC.' : n.error };
  const lk = o.lookup || { status: 'unavailable' };
  if (lk.status === 'expired') return { valid: false, message: `${EXPIRED_TEXT} Enter the billing-unit size from the code descriptor instead.` };
  if (lk.status === 'unavailable') return { valid: false, message: 'The NDC-HCPCS crosswalk could not be loaded. Enter the billing-unit size from the code descriptor instead.' };
  if (lk.status !== 'found') return { valid: false, message: `NDC ${dashed(n.ndc)} is not in the CMS ASP NDC-HCPCS crosswalk (${lk.edition || 'the quarter on file'}), which lists drugs paid under the ASP method. Enter the HCPCS code's billing-unit size instead.` };
  const codes = lk.rec.codes;
  let pick = codes[0];
  if (codes.length > 1) {
    const want = String(o.code ?? '').trim().toUpperCase();
    pick = codes.find((c) => c.code === want);
    if (!pick) return { valid: false, message: `NDC ${dashed(n.ndc)} bills under more than one code: ${codes.map((c) => `${c.code} (${c.dosage} per unit)`).join(' or ')}. Enter the HCPCS code you are billing.` };
  }
  const pkg = `The package holds ${pick.billUnitsPkg} billing units (${pick.pkgQty} x ${pick.pkgSize}).`;
  const dosage = parseDosage(pick.dosage);
  let unitSize = dosage && dosage.size;
  let unitUnit = dosage && dosage.unit;
  if (!dosage) {
    if (!String(o.unitSize ?? '').trim()) return { valid: false, message: `NDC ${dashed(n.ndc)} is ${pick.drug} under ${pick.code}, whose billing unit reads "${pick.dosage}". ${pkg} Enter the billing-unit size from the code descriptor.` };
    unitSize = Number(o.unitSize);
    unitUnit = o.unitUnit;
  }
  if (!String(o.dose ?? '').trim()) return { valid: false, message: `NDC ${dashed(n.ndc)} is ${pick.drug} under ${pick.code}, 1 unit = ${pick.dosage}. ${pkg} Enter the dose administered.` };
  const r = ndcHcpcsUnits({ dose: Number(o.dose), doseUnit: o.doseUnit, unitSize, unitUnit, rounding: o.rounding || 'up' });
  const notes = [pkg, `Report the NDC on the claim as ${dashed(n.ndc)}.`];
  if (dosage && dosage.read) notes.push(`The crosswalk's unit was ${dosage.read}.`);
  return { valid: true, ...r, ndc: dashed(n.ndc), code: pick.code, drug: pick.drug, packageUnits: pick.billUnitsPkg, notes, source: `CMS ASP NDC-HCPCS crosswalk, ${lk.edition}` };
}
