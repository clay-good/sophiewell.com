// spec-v1509 tools 1 and 2: hospital 340B eligibility, and the orphan-drug exclusion.
//
// 42 U.S.C. 256b(a)(4), read on uscode.house.gov 2026-09-26:
//   (L) a subsection (d) hospital that (i) is government-owned or operated, a nonprofit granted governmental
//       powers, or a nonprofit with a state or local contract to care for low-income people without
//       Medicare or Medicaid; (ii) had a disproportionate share adjustment percentage over 11.75% (or is a
//       hospital described in 1886(d)(5)(F)(i)(II)); and (iii) does not buy covered outpatient drugs through
//       a group purchasing organization.
//   (M) a children's or free-standing cancer hospital excluded from the inpatient PPS that would meet (L),
//       including the 11.75%, if it were a subsection (d) hospital.
//   (N) a critical access hospital that meets (L)(i).
//   (O) a rural referral center or sole community hospital that meets (L)(i) with a percentage of at least 8%.
// 256b(e): for (M) free-standing cancer hospitals, (N) and (O), a drug with an orphan designation under 21
// U.S.C. 360bb is not a covered outpatient drug, whatever it is used for; the rules that narrowed this to
// rare-condition uses were vacated, and 42 CFR part 10 no longer addresses it.
// Grantee entities (health centers, Ryan White programs and others) qualify through their grants and are
// not covered here.
//
// Pure: no DOM, no clock.

import { inputFault } from './num.js';
import { computeUra, DRUG_CATEGORIES } from './medicaid-ura-v1510.js';
import { parseIsoStrict } from './deadline.js';
import { longDate as longDateLocal } from './partd-appeals-v1503.js';

export const HOSPITAL_TYPES = [
  { value: 'dsh', text: 'Disproportionate share hospital (subsection (d))' },
  { value: 'childrens', text: 'Children\'s hospital' },
  { value: 'cancer', text: 'Free-standing cancer hospital' },
  { value: 'cah', text: 'Critical access hospital' },
  { value: 'rrc', text: 'Rural referral center' },
  { value: 'sch', text: 'Sole community hospital' },
];
export const OWNERSHIP = [
  { value: 'government', text: 'Owned or operated by a state or local government' },
  { value: 'powers', text: 'Nonprofit formally granted governmental powers' },
  { value: 'contract', text: 'Nonprofit with a state or local contract for low-income care' },
  { value: 'other', text: 'None of these (for example, for-profit)' },
];
export const YES_NO = [{ value: 'yes', text: 'Yes' }, { value: 'no', text: 'No' }];
const ORPHAN_EXCLUDED = new Set(['cancer', 'cah', 'rrc', 'sch']);
export const ORPHAN_ENTITY_TYPES = [...HOSPITAL_TYPES, { value: 'grantee', text: 'Grantee (health center, Ryan White and others)' }];
const NAME = Object.fromEntries(HOSPITAL_TYPES.map((t) => [t.value, t.text.replace(/ \(subsection \(d\)\)$/, '').toLowerCase()]));

export function entityEligibility340b(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const type = HOSPITAL_TYPES.some((t) => t.value === o.type) ? o.type : null;
  if (!type) return { valid: false, message: 'Choose the hospital type.' };
  const own = OWNERSHIP.some((t) => t.value === o.ownership) ? o.ownership : null;
  if (!own) return { valid: false, message: 'Choose the hospital\'s ownership or government contract status (42 U.S.C. 256b(a)(4)(L)(i)).' };
  const notes = [];
  const fails = [];
  if (own === 'other') fails.push('it is not government-owned, granted governmental powers, or under a state or local contract for low-income care ((L)(i))');
  const needsPct = type !== 'cah';
  let pct = null;
  const pickle = o.pickle === 'yes';
  if (needsPct && !(pickle && ['dsh', 'childrens', 'cancer'].includes(type))) {
    const f = inputFault([['the disproportionate share adjustment percentage', o.dshPercent, 0, 100, 'percent']]);
    if (f) return { valid: false, message: f };
    pct = Number(o.dshPercent);
    if (type === 'rrc' || type === 'sch') { if (pct < 8) fails.push(`its disproportionate share adjustment percentage of ${pct}% is under 8% ((O))`); }
    else if (!(pct > 11.75)) fails.push(`its disproportionate share adjustment percentage of ${pct}% is not over 11.75% ((L)(ii)${type === 'dsh' ? '' : ', (M)'})`);
  }
  if (pickle && ['dsh', 'childrens', 'cancer'].includes(type)) notes.push('A hospital described in section 1886(d)(5)(F)(i)(II) of the Social Security Act meets the percentage test without the 11.75% ((L)(ii)).');
  const gpoBan = ['dsh', 'childrens', 'cancer'].includes(type);
  if (gpoBan && o.usesGpo === 'yes') fails.push('it buys covered outpatient drugs through a group purchasing organization, which (L)(iii) prohibits');
  if (gpoBan && o.usesGpo !== 'yes' && o.usesGpo !== 'no') notes.push('Whether the hospital uses a group purchasing organization for covered outpatient drugs was not entered: this type must not ((L)(iii)).');
  notes.push(gpoBan ? 'Restriction: no group purchasing organization for covered outpatient drugs ((L)(iii)).' : 'The statute sets no group purchasing ban for this type.');
  notes.push(ORPHAN_EXCLUDED.has(type) ? 'Restriction: drugs with an FDA orphan designation are excluded from 340B pricing, whatever they are used for (42 U.S.C. 256b(e)).' : 'The orphan-drug exclusion does not apply to this type.');
  const band = fails.length
    ? `Not eligible as a ${NAME[type]}: ${fails.join('; ')}.`
    : `Eligible as a ${NAME[type]}${pct !== null ? ` with a disproportionate share adjustment percentage of ${pct}%` : ''} (42 U.S.C. 256b(a)(4)(${{ dsh: 'L', childrens: 'M', cancer: 'M', cah: 'N', rrc: 'O', sch: 'O' }[type]})).`;
  return { valid: true, eligible: fails.length === 0, band, bandLabel: fails.length ? 'Not eligible' : 'Eligible', abnormal: fails.length > 0, notes, note: 'The statutory tests only; registration, recertification and HRSA\'s decisions control. Grantee entities qualify through their grants and are not covered here.' };
}

export function orphanExclusion340b(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const type = ORPHAN_ENTITY_TYPES.some((t) => t.value === o.type) ? o.type : null;
  if (!type) return { valid: false, message: 'Choose the covered entity type.' };
  const orphan = o.orphan === 'yes' ? true : o.orphan === 'no' ? false : null;
  if (orphan === null) return { valid: false, message: 'Choose whether the drug carries an FDA orphan designation (21 U.S.C. 360bb).' };
  const applies = ORPHAN_EXCLUDED.has(type);
  const notes = ['The use it is prescribed for does not matter: the rules that limited the exclusion to rare-condition uses were vacated, and 42 CFR part 10 no longer addresses it.'];
  let band;
  if (!orphan) band = 'Not excluded: the drug has no orphan designation, so the exclusion does not reach it.';
  else if (applies) band = `Excluded: for a ${NAME[type]}, a drug with an orphan designation is not a covered outpatient drug under 340B, whatever it is used for (42 U.S.C. 256b(e)).`;
  else band = `Not excluded: the orphan-drug exclusion applies only to free-standing cancer hospitals, critical access hospitals, rural referral centers and sole community hospitals (42 U.S.C. 256b(e)).`;
  if (type === 'childrens') notes.push('Children\'s hospitals are expressly left out of the exclusion.');
  return { valid: true, excluded: Boolean(orphan && applies), band, bandLabel: orphan && applies ? 'Excluded' : 'Not excluded', notes, note: 'The statute\'s test; whether a drug has an orphan designation comes from the FDA designation record.' };
}

// spec-v1509 tool 3: is this person a 340B patient for this prescription? HRSA's 1996 patient definition
// (61 FR 55156, October 24, 1996): (1) the entity has a relationship with the person such that it keeps
// the records of their care; (2) the person gets care from a professional employed by the entity, or under
// a contract or referral such that responsibility for the care stays with the entity; (3) for a grantee,
// the care is within the scope of the grant or look-alike designation (hospitals are exempt from this
// prong). A person whose only service from the entity is the dispensing of drugs is not a patient.
export const ENTITY_KINDS = [{ value: 'hospital', text: 'Hospital' }, { value: 'grantee', text: 'Grantee or look-alike (health center, Ryan White and others)' }];
export function patientCheck340b(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const kind = ENTITY_KINDS.some((k) => k.value === o.entity) ? o.entity : null;
  if (!kind) return { valid: false, message: 'Choose the covered entity kind: hospital or grantee.' };
  const ask = [['records', 'whether the entity keeps the person\'s health care records'], ['provider', 'whether the prescriber is employed by the entity, or under a contract or referral that leaves responsibility for the care with it'], ['dispensingOnly', 'whether dispensing is the only service the entity provides the person']];
  if (kind === 'grantee') ask.push(['scope', 'whether the care is within the scope of the grant']);
  for (const [k, what] of ask) if (o[k] !== 'yes' && o[k] !== 'no') return { valid: false, message: `Choose ${what}.` };
  const fails = [];
  if (o.records !== 'yes') fails.push('the entity does not keep the person\'s health care records (prong 1)');
  if (o.provider !== 'yes') fails.push('the care is not given by the entity\'s professional or under an arrangement that keeps responsibility with it (prong 2)');
  if (kind === 'grantee' && o.scope !== 'yes') fails.push('the care is outside the scope of the grant (prong 3)');
  if (o.dispensingOnly === 'yes') fails.push('dispensing is the only service, which never makes someone a patient');
  const notes = kind === 'hospital'
    ? ['Hospitals are exempt from the grant-scope prong (the 1996 notice names disproportionate share hospitals, the only hospitals in the program then).']
    : ['A person registered in a state AIDS Drug Assistance Program counts as a patient when the state program registers them as eligible.'];
  return {
    valid: true,
    patient: fails.length === 0,
    band: fails.length ? `Not a 340B patient for this prescription: ${fails.join('; ')}.` : 'A 340B patient for this prescription: every applicable part of the 1996 patient definition is met (61 FR 55156).',
    bandLabel: fails.length ? 'Not a patient' : 'Patient',
    abnormal: fails.length > 0,
    notes,
    note: 'The facts are the reader\'s, prescription by prescription; the entity\'s own policies and HRSA\'s audits control.',
  };
}

// spec-v1509 tool 6: duplicate discounts and 340B claim identifiers.
//   Medicare Part B: the TB modifier on separately payable drug lines for 340B-acquired units, required for
//     every covered entity from January 1, 2025 in place of JG (CMS MLN4800856).
//   Medicare Part D: no claim-level 340B identifier is required; CMS's Part D 340B claims repository opened
//     for voluntary quarterly submission on October 1, 2026 (dates of service from 2026, within 3 months
//     after each quarter), and the CY2027 physician fee schedule proposed rule would require it for dates
//     of service from January 1, 2027 (CMS repository fact sheet and FAQs, August 2026).
//   Medicaid fee-for-service: HRSA's Medicaid Exclusion File. A carve-in entity is listed and bills Medicaid
//     for 340B drugs, and the state excludes those claims from rebates; a carve-out entity must not use 340B
//     drugs for them. A change takes effect on the first day of the next quarter, only if approved before
//     the snapshot at 12:01 am Eastern on the 16th of the month before that quarter (HRSA FAQ; this spec
//     said the 15th). The file does not apply to Medicaid managed care, where the state's rule does.
export const PAYERS_340B = [
  { value: 'partb', text: 'Medicare Part B' },
  { value: 'partd', text: 'Medicare Part D' },
  { value: 'medicaid-ffs', text: 'Medicaid fee-for-service' },
  { value: 'medicaid-mco', text: 'Medicaid managed care' },
  { value: 'commercial', text: 'Commercial' },
];
export const MEF_STATUS = [{ value: 'in', text: 'Carve-in (listed on the Medicaid Exclusion File)' }, { value: 'out', text: 'Carve-out' }];
const iso = (d) => d.toISOString().slice(0, 10);
const pdate = (s) => { try { return parseIsoStrict(String(s ?? '').trim()); } catch { return null; } };

export function duplicateDiscount340b(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const payer = PAYERS_340B.some((p) => p.value === o.payer) ? o.payer : null;
  if (!payer) return { valid: false, message: 'Choose the payer.' };
  const notes = [];
  let band;
  let label;
  let dos = null;
  if (String(o.serviceDate ?? '').trim()) {
    dos = pdate(o.serviceDate);
    if (!dos) return { valid: false, message: 'Enter the date of service as YYYY-MM-DD, or leave it blank.' };
  }
  if (payer === 'partb') {
    if (dos && iso(dos) < '2025-01-01') { band = 'Before January 1, 2025, a hospital-based entity reported 340B units with the JG modifier and other entities with TB; from 2025 every entity uses TB.'; label = 'JG or TB (2024)'; }
    else { band = 'Put the TB modifier on each separately payable Part B drug line for units acquired under 340B; it replaced JG for every covered entity on January 1, 2025 (CMS MLN4800856).'; label = 'TB modifier'; }
    notes.push('The modifier lets CMS leave 340B units out of the Part B inflation rebate.');
  } else if (payer === 'partd') {
    band = 'No claim-level 340B identifier is required on Part D claims. CMS\'s Part D 340B claims repository has taken voluntary quarterly submissions since October 1, 2026, for dates of service in 2026, within 3 months after each quarter.';
    label = 'No claim identifier';
    notes.push('The CY2027 physician fee schedule proposed rule would require submission to the repository for dates of service from January 1, 2027; check the final rule.');
  } else if (payer === 'medicaid-ffs') {
    const mef = MEF_STATUS.some((m) => m.value === o.mef) ? o.mef : null;
    if (!mef) return { valid: false, message: 'Choose the entity\'s status on HRSA\'s Medicaid Exclusion File: carve-in or carve-out.' };
    band = mef === 'in'
      ? 'Carve-in: the entity is listed on the Medicaid Exclusion File and bills fee-for-service Medicaid for 340B drugs; the state leaves those claims out of its rebate requests. Use the state\'s billing rule for 340B claims.'
      : 'Carve-out: do not use 340B drugs for fee-for-service Medicaid claims. Filling them from 340B stock risks a duplicate discount, a 340B price and a Medicaid rebate on the same drug.';
    label = mef === 'in' ? 'Carve-in' : 'Carve-out: no 340B stock';
    if (String(o.changeApproved ?? '').trim()) {
      const d = pdate(o.changeApproved);
      if (!d) return { valid: false, message: 'Enter the date the carve-in or carve-out change was approved as YYYY-MM-DD, or leave it blank.' };
      let qStart = new Date(Date.UTC(d.getUTCFullYear(), Math.floor(d.getUTCMonth() / 3) * 3 + 3, 1));
      const snap = new Date(Date.UTC(qStart.getUTCFullYear(), qStart.getUTCMonth() - 1, 16));
      if (d >= snap) qStart = new Date(Date.UTC(qStart.getUTCFullYear(), qStart.getUTCMonth() + 3, 1));
      notes.push(`A change approved ${longDateLocal(d)} takes effect ${longDateLocal(qStart)}: changes start the first day of a quarter, and only when approved before the snapshot at 12:01 am Eastern on the 16th of the month before it (HRSA).`);
    }
    notes.push('The Medicaid Exclusion File applies only to fee-for-service Medicaid.');
  } else if (payer === 'medicaid-mco') {
    band = 'The Medicaid Exclusion File does not apply to managed care: follow the state\'s rule for identifying 340B claims to its Medicaid plans (often a modifier or an NCPDP submission clarification code).';
    label = 'State rule';
    if (String(o.stateRule ?? '').trim()) notes.push(`The state rule entered: ${String(o.stateRule).trim().slice(0, 120)}.`);
    else notes.push('The state\'s rule was not entered; check the state Medicaid agency\'s 340B billing guidance.');
  } else {
    band = 'No federal 340B identifier applies to commercial claims, and there is no duplicate-discount prohibition for them; the payer contract may require one.';
    label = 'No federal rule';
  }
  return { valid: true, band, bandLabel: label, notes, note: 'Federal rules as of September 2026; state Medicaid rules and payer contracts add their own.' };
}

// spec-v1509 tool 5: 340B ceiling price and the Medicaid unit rebate amount (URA).
// 42 U.S.C. 1396r-8(c) (uscode.house.gov, 2026-09-26): brand (single source or innovator) basic rebate is the
// greater of AMP minus best price or 23.1% of AMP (17.1% for clotting factors and drugs approved only for
// pediatric use); generics 13% of AMP. Both add the inflation rebate: AMP minus the baseline AMP raised by the
// CPI-U change. For rebate periods before January 1, 2024, the brand rebate was capped at 100% of AMP; the
// cap no longer applies. 42 CFR 10.10: ceiling = AMP minus URA, at six decimals, published at two; below
// $0.01 it is $0.01. The figures are the manufacturer's and are entered by the reader.
export { DRUG_CATEGORIES };
const d6 = (x) => Math.round(x * 1e6) / 1e6;
export function ceilingPrice340b(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const r = computeUra(o);
  if (r.error) return { valid: false, message: r.error };
  const { amp, ura } = r;
  const notes = r.notes.map((n) => n.replace(/the rebate is larger\.$/, 'the rebate is larger and the ceiling lower.'));
  let ceiling = d6(amp - ura);
  const penny = ceiling < 0.01;
  if (penny) ceiling = 0.01;
  const pub = Math.round(ceiling * 100) / 100;
  const money6 = (x) => `$${x.toFixed(6)}`;
  let band = `Unit rebate amount ${money6(ura)}; 340B ceiling price ${money6(ceiling)} per unit, published as $${pub.toFixed(2)}${penny ? ' (penny pricing: the calculation fell below $0.01)' : ''}.`;
  if (String(o.unitsPerPackage ?? '').trim()) {
    const uf = inputFault([['the units per package', o.unitsPerPackage, 1, 1e6, '']]);
    if (uf) return { valid: false, message: uf };
    band += ` Per package of ${Number(o.unitsPerPackage)}: $${(ceiling * Number(o.unitsPerPackage)).toFixed(2)}.`;
  }
  return { valid: true, ura, ceiling, penny, band, bandLabel: `$${pub.toFixed(2)} per unit`, notes, note: 'The arithmetic of 42 U.S.C. 1396r-8(c) and 42 CFR 10.10 on the figures entered; HRSA\'s published ceiling price and the manufacturer\'s own figures control.' };
}
