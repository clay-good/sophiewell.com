// spec-v52 §4.5: declarative core ruleset.
//
// Wave 52-1e shipped 7 rules; wave 52-1f brings the starter set to 25
// of the planned 60 §4.5.1 core rules. Each rule is a plain object
// with a stable id, a one-line description, a severity, a payer-
// policy / authoritative citation, and a `check(bundle)` predicate
// that returns either:
//   - { pass: true,  evidence?: string }            -- rule satisfied
//   - { pass: false, evidence?: string, note?: string } -- rule fires
//
// The engine in engine.js wraps each result into a finding with the
// rule's metadata and severity, and aggregates findings across the
// packet. Adding a rule is a one-entry append: no engine change.
//
// Severities follow spec-v52 §4.4: 'block' / 'flag' / 'info' / 'pass'.

import {
  luhnNpi,
  POS_CODES_BUNDLED,
  keywordPresent,
  DELETED_CPT_HCPCS_BUNDLED,
  DELETED_ICD10_BUNDLED,
  NCCI_PAIRS_BUNDLED,
} from './extract.js';
import { parseDate, diffDays, todayUtc } from './date.js';

// spec-v52 §4.5.1: default payer-agnostic windows. Each one can be
// overridden by a payer overlay in a later wave; the default lives
// here so the starter ruleset is self-contained.
const RETRO_AUTH_WINDOW_DAYS = 90;        // R-PA-005 default
const FUTURE_AUTH_WINDOW_DAYS = 365;      // R-PA-006 hard ceiling
const PACKET_BYTE_CEILING = 50 * 1024 * 1024; // R-PA-045 default

export const STARTER_RULES = [
  {
    id: 'R-PA-001',
    description: 'Patient name present in at least one document',
    severity: 'block',
    citation: 'spec-v52 §4.5.1 R-PA-001 (core, payer-agnostic).',
    check(bundle) {
      const found = bundle.documents.find((d) => d.extract.patientName);
      if (found) return { pass: true, evidence: 'Found "' + found.extract.patientName + '" in ' + found.name };
      return { pass: false, note: 'No "Patient:" or "Name:" line found in any document.' };
    },
  },
  {
    id: 'R-PA-004',
    description: 'Service date present in the packet',
    severity: 'block',
    citation: 'spec-v52 §4.5.1 R-PA-004 (core, payer-agnostic).',
    check(bundle) {
      const total = bundle.documents.reduce((n, d) => n + d.extract.dates.length, 0);
      if (total > 0) return { pass: true, evidence: total + ' date string(s) recognized across the packet.' };
      return { pass: false, note: 'No date string in YYYY-MM-DD or MM/DD/YYYY form found in any document.' };
    },
  },
  {
    id: 'R-PA-007',
    description: 'At least one CPT or HCPCS code present',
    severity: 'block',
    citation: 'spec-v52 §4.5.1 R-PA-007 (core, payer-agnostic). AMA CPT / CMS HCPCS Level II.',
    check(bundle) {
      const codes = new Set();
      for (const d of bundle.documents) for (const c of d.extract.cpts) codes.add(c);
      if (codes.size === 0) return { pass: false, note: 'No 5-digit CPT or 1-letter+4-digit HCPCS code found in any document.' };
      return { pass: true, evidence: 'Codes: ' + [...codes].slice(0, 6).join(', ') + (codes.size > 6 ? ', ...' : '') };
    },
  },
  {
    id: 'R-PA-010',
    description: 'At least one ICD-10-CM diagnosis code present',
    severity: 'block',
    citation: 'spec-v52 §4.5.1 R-PA-010 (core, payer-agnostic). ICD-10-CM, public domain (CMS / CDC).',
    check(bundle) {
      const codes = new Set();
      for (const d of bundle.documents) for (const c of d.extract.icd10) codes.add(c);
      if (codes.size === 0) return { pass: false, note: 'No ICD-10-CM pattern (letter + 2 digits, optional decimal) found.' };
      return { pass: true, evidence: 'Codes: ' + [...codes].slice(0, 6).join(', ') + (codes.size > 6 ? ', ...' : '') };
    },
  },
  {
    id: 'R-PA-013',
    description: 'Place-of-service code is present and on the bundled CMS list',
    severity: 'block',
    citation: 'spec-v52 §4.5.1 R-PA-013. CMS Place of Service codes (POS list, public).',
    check(bundle) {
      const seen = new Set();
      for (const d of bundle.documents) for (const c of d.extract.pos) seen.add(c);
      if (seen.size === 0) return { pass: false, note: 'No "Place of service: NN" or "POS: NN" line found.' };
      const bad = [...seen].filter((c) => !POS_CODES_BUNDLED.has(c));
      if (bad.length > 0) return { pass: false, note: 'POS code(s) not on bundled CMS list: ' + bad.join(', ') };
      return { pass: true, evidence: 'POS code(s): ' + [...seen].join(', ') };
    },
  },
  {
    id: 'R-PA-016',
    description: 'Ordering provider NPI passes Luhn checksum',
    severity: 'block',
    citation: 'spec-v52 §4.5.1 R-PA-016. NPPES Luhn-mod-10 with the 80840 issuer prefix. Registry membership is NOT verified (Sophie does not ship the NPPES dump).',
    check(bundle) {
      const npis = new Set();
      for (const d of bundle.documents) for (const n of d.extract.npis) npis.add(n);
      if (npis.size === 0) return { pass: false, note: 'No Luhn-valid 10-digit NPI found in any document.' };
      // luhnNpi was already used by the extractor; double-check here so the
      // rule fires deterministically even if extractor behavior changes.
      const valid = [...npis].filter(luhnNpi);
      if (valid.length === 0) return { pass: false, note: 'Found 10-digit candidate(s) but none passed Luhn.' };
      return { pass: true, evidence: 'NPI(s): ' + valid.slice(0, 4).join(', ') + (valid.length > 4 ? ', ...' : '') };
    },
  },
  {
    id: 'R-PA-041',
    description: 'At-risk PHI (SSN) is NOT present in the packet',
    severity: 'flag',
    citation: 'spec-v52 §4.5.1 R-PA-041. SSA SSN format. SSN in a PA packet is a PHI minimization concern; payers rarely require it.',
    check(bundle) {
      const seen = new Set();
      for (const d of bundle.documents) for (const s of d.extract.ssns) seen.add(s);
      if (seen.size === 0) return { pass: true, evidence: 'No SSN-shaped string found.' };
      return { pass: false, note: 'Found ' + seen.size + ' SSN-shaped string(s). Consider redacting before submission.' };
    },
  },

  // ---- spec-v52 wave 52-1f: additional core rules ----

  {
    id: 'R-PA-002',
    description: 'Date of birth present in at least one document',
    severity: 'block',
    citation: 'spec-v52 §4.5.1 R-PA-002 (core, payer-agnostic).',
    check(bundle) {
      const found = bundle.documents.find((d) => d.extract.dob);
      if (!found) return { pass: false, note: 'No "DOB:" or "Date of birth:" line found in any document.' };
      return { pass: true, evidence: 'DOB "' + found.extract.dob + '" in ' + found.name };
    },
  },
  {
    id: 'R-PA-003',
    description: 'Member ID present in at least one document',
    severity: 'block',
    citation: 'spec-v52 §4.5.1 R-PA-003. Payer-specific format validation lives in payer overlays (v52-2+).',
    check(bundle) {
      const found = bundle.documents.find((d) => d.extract.memberId);
      if (!found) return { pass: false, note: 'No "Member ID:" / "Subscriber ID:" / "MRN:" line found.' };
      return { pass: true, evidence: 'Member ID "' + found.extract.memberId + '" in ' + found.name };
    },
  },
  {
    id: 'R-PA-005',
    description: 'Service date is not past the default retro-auth window (' + RETRO_AUTH_WINDOW_DAYS + ' days)',
    severity: 'flag',
    citation: 'spec-v52 §4.5.1 R-PA-005. Default retro-auth window is 90 days; payer overlays override. Scoped to dates explicitly labeled "Date of service" / "DOS" / "Service date" so DOB strings and signature dates are excluded.',
    check(bundle) {
      const today = todayUtc();
      let oldest = null;
      for (const d of bundle.documents) {
        for (const raw of d.extract.serviceDates) {
          const dt = parseDate(raw);
          if (!dt) continue;
          const age = diffDays(today, dt);
          if (age === null || age < 0) continue;
          if (oldest === null || dt.getTime() < oldest.getTime()) oldest = dt;
        }
      }
      if (oldest === null) return { pass: true, evidence: 'No labeled service date; rule vacuously satisfied (R-PA-004 covers presence).' };
      const age = diffDays(today, oldest);
      if (age !== null && age > RETRO_AUTH_WINDOW_DAYS) {
        return { pass: false, note: 'Oldest labeled service date is ' + age + ' days in the past, beyond the default ' + RETRO_AUTH_WINDOW_DAYS + '-day retro window.' };
      }
      return { pass: true, evidence: 'Oldest labeled service date is ' + age + ' days in the past.' };
    },
  },
  {
    id: 'R-PA-006',
    description: 'Service date is not more than ' + FUTURE_AUTH_WINDOW_DAYS + ' days in the future',
    severity: 'block',
    citation: 'spec-v52 §4.5.1 R-PA-006. Hard ceiling, not payer-specific. Scoped to dates labeled "Date of service" / "DOS" / "Service date".',
    check(bundle) {
      const today = todayUtc();
      let furthest = null;
      for (const d of bundle.documents) {
        for (const raw of d.extract.serviceDates) {
          const dt = parseDate(raw);
          if (dt && (furthest === null || dt.getTime() > furthest.getTime())) furthest = dt;
        }
      }
      if (furthest === null) return { pass: true, evidence: 'No labeled service date; rule vacuously satisfied (R-PA-004 covers presence).' };
      const ahead = diffDays(furthest, today);
      if (ahead !== null && ahead > FUTURE_AUTH_WINDOW_DAYS) {
        return { pass: false, note: 'Furthest labeled service date is ' + ahead + ' days in the future, beyond the ' + FUTURE_AUTH_WINDOW_DAYS + '-day ceiling.' };
      }
      return { pass: true, evidence: 'Furthest labeled service date is ' + ahead + ' days in the future.' };
    },
  },
  {
    id: 'R-PA-015',
    description: 'Quantity / units present and >= 1',
    severity: 'block',
    citation: 'spec-v52 §4.5.1 R-PA-015.',
    check(bundle) {
      let best = null;
      for (const d of bundle.documents) {
        const q = d.extract.quantity;
        if (q !== null && (best === null || q > best)) best = q;
      }
      if (best === null) return { pass: false, note: 'No "Quantity:" / "Qty" / "Units:" field found.' };
      if (best < 1) return { pass: false, note: 'Quantity (' + best + ') is below the >= 1 floor.' };
      return { pass: true, evidence: 'Quantity ' + best + ' found.' };
    },
  },
  {
    id: 'R-PA-017',
    description: 'Ordering provider signature present in at least one document',
    severity: 'block',
    citation: 'spec-v52 §4.5.1 R-PA-017. Detects "Signature:" / "Signed by" / "Electronically signed" / "/s/" anchors.',
    check(bundle) {
      const found = bundle.documents.find((d) => d.extract.signature && d.extract.signature.present);
      if (!found) return { pass: false, note: 'No signature anchor found in any document.' };
      return { pass: true, evidence: 'Signature anchor in ' + found.name };
    },
  },
  {
    id: 'R-PA-018',
    description: 'Ordering provider signature is dated (only if a signature is present)',
    severity: 'block',
    citation: 'spec-v52 §4.5.1 R-PA-018.',
    check(bundle) {
      let anySig = false;
      let anyDated = false;
      let datedDoc = null;
      for (const d of bundle.documents) {
        const sig = d.extract.signature;
        if (sig && sig.present) {
          anySig = true;
          if (sig.dated) { anyDated = true; datedDoc = d.name; break; }
        }
      }
      if (!anySig) return { pass: true, evidence: 'No signature anchor; R-PA-018 vacuously satisfied (R-PA-017 covers presence).' };
      if (!anyDated) return { pass: false, note: 'Signature anchor present but no date found in the ~160 chars after the anchor.' };
      return { pass: true, evidence: 'Dated signature in ' + datedDoc };
    },
  },
  {
    id: 'R-PA-020',
    description: 'Servicing facility TIN present (9 digits)',
    severity: 'flag',
    citation: 'spec-v52 §4.5.1 R-PA-020. Federal tax ID expected on most institutional PA packets.',
    check(bundle) {
      const tins = new Set();
      for (const d of bundle.documents) for (const t of d.extract.tins) tins.add(t);
      if (tins.size === 0) return { pass: false, note: 'No "TIN:" / "EIN:" / "Tax ID:" 9-digit string found.' };
      return { pass: true, evidence: 'TIN(s): ' + [...tins].join(', ') };
    },
  },
  {
    id: 'R-PA-021',
    description: 'Clinical-note content appears in at least one document',
    severity: 'block',
    citation: 'spec-v52 §4.5.1 R-PA-021. Keyword anchors: "chief complaint", "history of present illness", "assessment and plan", "progress note", "clinical note", "soap note".',
    check(bundle) {
      const anchors = ['chief complaint', 'history of present illness', 'assessment and plan', 'progress note', 'clinical note', 'soap note'];
      const found = bundle.documents.find((d) => keywordPresent(d.text, anchors));
      if (!found) return { pass: false, note: 'No clinical-note anchor (chief complaint, HPI, A&P, progress note, etc.) found.' };
      return { pass: true, evidence: 'Clinical-note anchor in ' + found.name };
    },
  },
  {
    id: 'R-PA-024',
    description: 'Medical-necessity statement present',
    severity: 'flag',
    citation: 'spec-v52 §4.5.1 R-PA-024. Free-text anchor: "medical necessity", "medically necessary", "necessary because", "necessary due to".',
    check(bundle) {
      const anchors = ['medical necessity', 'medically necessary', 'necessary because', 'necessary due to'];
      const found = bundle.documents.find((d) => keywordPresent(d.text, anchors));
      if (!found) return { pass: false, note: 'No medical-necessity statement found.' };
      return { pass: true, evidence: 'Anchor in ' + found.name };
    },
  },
  {
    id: 'R-PA-029',
    description: 'Step-therapy documentation present when payer requires it',
    severity: 'flag',
    citation: 'spec-v52 §4.5.1 R-PA-029. Default firing condition is keyword absence; payer overlays will pre-filter on whether the requested drug class triggers step therapy.',
    check(bundle) {
      const anchors = ['step therapy', 'step-therapy', 'failed first-line', 'prior failure of', 'trial of'];
      const found = bundle.documents.find((d) => keywordPresent(d.text, anchors));
      if (!found) return { pass: false, note: 'No step-therapy documentation anchor found. If the requested drug class requires step therapy, the packet will be denied.' };
      return { pass: true, evidence: 'Anchor in ' + found.name };
    },
  },
  {
    id: 'R-PA-031',
    description: 'Allergies / intolerances list present',
    severity: 'info',
    citation: 'spec-v52 §4.5.1 R-PA-031.',
    check(bundle) {
      const anchors = ['allergies', 'allergy:', 'nkda', 'no known drug allergies', 'intolerances'];
      const found = bundle.documents.find((d) => keywordPresent(d.text, anchors));
      if (!found) return { pass: false, note: 'No allergies / intolerances anchor found.' };
      return { pass: true, evidence: 'Anchor in ' + found.name };
    },
  },
  {
    id: 'R-PA-032',
    description: 'Active medication list present',
    severity: 'info',
    citation: 'spec-v52 §4.5.1 R-PA-032.',
    check(bundle) {
      const anchors = ['active medications', 'current medications', 'med list', 'medication list', 'home meds'];
      const found = bundle.documents.find((d) => keywordPresent(d.text, anchors));
      if (!found) return { pass: false, note: 'No active-medication-list anchor found.' };
      return { pass: true, evidence: 'Anchor in ' + found.name };
    },
  },
  {
    id: 'R-PA-037',
    description: 'Duration / length of approval requested is present',
    severity: 'flag',
    citation: 'spec-v52 §4.5.1 R-PA-037.',
    check(bundle) {
      const anchors = ['duration:', 'length of approval', 'authorization period', 'auth period', 'units requested for', 'days of supply'];
      const found = bundle.documents.find((d) => keywordPresent(d.text, anchors));
      if (!found) return { pass: false, note: 'No duration / length-of-approval anchor found.' };
      return { pass: true, evidence: 'Anchor in ' + found.name };
    },
  },
  {
    id: 'R-PA-045',
    description: 'Total packet size <= ' + (PACKET_BYTE_CEILING / (1024 * 1024)) + ' MB (default payer max)',
    severity: 'flag',
    citation: 'spec-v52 §4.5.1 R-PA-045. Default payer maximum is 50 MB; payer overlays may raise / lower.',
    check(bundle) {
      const totalBytes = typeof bundle.totalBytes === 'number' ? bundle.totalBytes : 0;
      if (totalBytes <= 0) return { pass: true, evidence: 'Total byte count not provided; rule vacuously satisfied.' };
      if (totalBytes > PACKET_BYTE_CEILING) {
        return { pass: false, note: 'Packet is ' + Math.round(totalBytes / (1024 * 1024)) + ' MB, above the default 50 MB ceiling.' };
      }
      return { pass: true, evidence: 'Packet is ' + Math.round(totalBytes / (1024 * 1024)) + ' MB.' };
    },
  },
  {
    id: 'R-PA-046',
    description: 'No corrupted character encoding (mojibake) in extracted text',
    severity: 'flag',
    citation: 'spec-v52 §4.5.1 R-PA-046. Non-zero count of U+FFFD REPLACEMENT CHARACTER signals a non-UTF8 source that the parser fell back on.',
    check(bundle) {
      const bad = bundle.documents.filter((d) => (d.extract.replacementChars || 0) > 0);
      if (bad.length === 0) return { pass: true, evidence: 'No U+FFFD replacement chars in extracted text.' };
      const summary = bad.map((d) => d.name + ' (' + d.extract.replacementChars + ')').join(', ');
      return { pass: false, note: 'Replacement-char count > 0 in: ' + summary };
    },
  },
  {
    id: 'R-PA-053',
    description: 'Authorization not requested for a code on the bundled no-PA-needed list (v52-1f: empty; expands with payer overlays)',
    severity: 'info',
    citation: 'spec-v52 §4.5.1 R-PA-053. Wave 52-1f ships an empty bundled no-PA list; the rule remains in the table so payer overlays can populate the list without an engine change.',
    check() {
      return { pass: true, evidence: 'No bundled no-PA-needed list at v52-1f close.' };
    },
  },
  {
    id: 'R-PA-060',
    description: 'Packet completeness summary / cover sheet present',
    severity: 'info',
    citation: 'spec-v52 §4.5.1 R-PA-060.',
    check(bundle) {
      const anchors = ['cover sheet', 'pa cover sheet', 'pa checklist', 'packet contents', 'enclosure list'];
      const found = bundle.documents.find((d) => keywordPresent(d.text, anchors));
      if (!found) return { pass: false, note: 'No cover-sheet / checklist anchor found.' };
      return { pass: true, evidence: 'Anchor in ' + found.name };
    },
  },

  // ---- spec-v52 wave 52-1h: additional core rules ----

  {
    id: 'R-PA-019',
    description: 'Servicing facility / second NPI present (distinct from ordering)',
    severity: 'flag',
    citation: 'spec-v52 §4.5.1 R-PA-019. Most institutional PA packets carry both an ordering and a servicing NPI; v52-1h flags when only one Luhn-valid NPI is in the packet.',
    check(bundle) {
      const npis = new Set();
      for (const d of bundle.documents) for (const n of d.extract.npis) npis.add(n);
      if (npis.size >= 2) return { pass: true, evidence: npis.size + ' distinct Luhn-valid NPIs found.' };
      if (npis.size === 1) return { pass: false, note: 'Only one Luhn-valid NPI found; servicing-facility NPI may be missing.' };
      return { pass: false, note: 'No Luhn-valid NPI found (R-PA-016 covers ordering NPI presence).' };
    },
  },
  {
    id: 'R-PA-022',
    description: 'Clinical-note document has at least one extractable date',
    severity: 'flag',
    citation: 'spec-v52 §4.5.1 R-PA-022. Default clinical-look-back window is payer-specific; v52-1h checks date presence inside the clinical-note document(s) only.',
    check(bundle) {
      const notes = bundle.documents.filter((d) => d.role === 'clinical-note');
      if (notes.length === 0) return { pass: true, evidence: 'No clinical-note document tagged; vacuously satisfied (R-PA-021 covers presence).' };
      const dated = notes.find((d) => d.extract.dates.length > 0);
      if (!dated) return { pass: false, note: 'Clinical-note document(s) present but no extractable date inside.' };
      return { pass: true, evidence: 'Date(s) found in clinical-note: ' + dated.name };
    },
  },
  {
    id: 'R-PA-023',
    description: 'Clinical note references at least one of the requested CPT/HCPCS codes',
    severity: 'flag',
    citation: 'spec-v52 §4.5.1 R-PA-023. Heuristic: at least one CPT/HCPCS code extracted anywhere in the packet also appears inside a clinical-note document.',
    check(bundle) {
      const requested = new Set();
      for (const d of bundle.documents) for (const c of d.extract.cpts) requested.add(c);
      if (requested.size === 0) return { pass: true, evidence: 'No CPT/HCPCS codes extracted; vacuously satisfied (R-PA-007 covers presence).' };
      const notes = bundle.documents.filter((d) => d.role === 'clinical-note');
      if (notes.length === 0) return { pass: true, evidence: 'No clinical-note document tagged; vacuously satisfied (R-PA-021 covers presence).' };
      for (const note of notes) {
        const noteCodes = new Set(note.extract.cpts);
        for (const c of requested) if (noteCodes.has(c)) return { pass: true, evidence: 'Code ' + c + ' in ' + note.name };
      }
      return { pass: false, note: 'No requested CPT/HCPCS code appears in any clinical-note document.' };
    },
  },
  {
    id: 'R-PA-025',
    description: 'Lab-result document attached when the packet references labs',
    severity: 'flag',
    citation: 'spec-v52 §4.5.1 R-PA-025.',
    check(bundle) {
      const labMentions = bundle.documents.some((d) => keywordPresent(d.text, ['lab results', 'laboratory results', 'lab work', 'cbc', 'cmp', 'lipid panel', 'a1c', 'hba1c']));
      if (!labMentions) return { pass: true, evidence: 'No lab references in packet; rule vacuously satisfied.' };
      const labDoc = bundle.documents.find((d) => d.role === 'lab-result');
      if (!labDoc) return { pass: false, note: 'Packet references labs but no document was classified as lab-result.' };
      return { pass: true, evidence: 'Lab-result document attached: ' + labDoc.name };
    },
  },
  {
    id: 'R-PA-026',
    description: 'Imaging-report document attached when the packet references imaging',
    severity: 'flag',
    citation: 'spec-v52 §4.5.1 R-PA-026.',
    check(bundle) {
      const imagingMentions = bundle.documents.some((d) => keywordPresent(d.text, ['mri', 'ct scan', 'ultrasound', 'x-ray', 'xray', 'radiology', 'imaging']));
      if (!imagingMentions) return { pass: true, evidence: 'No imaging references in packet; rule vacuously satisfied.' };
      const imagingDoc = bundle.documents.find((d) => d.role === 'imaging-report');
      if (!imagingDoc) return { pass: false, note: 'Packet references imaging but no document was classified as imaging-report.' };
      return { pass: true, evidence: 'Imaging-report attached: ' + imagingDoc.name };
    },
  },
  {
    id: 'R-PA-027',
    description: 'Each attached lab-result document is dated within the default freshness window (' + (12 * 30) + ' days)',
    severity: 'flag',
    citation: 'spec-v52 §4.5.1 R-PA-027. Default freshness window is 12 months; payer overlays override.',
    check(bundle) {
      const labs = bundle.documents.filter((d) => d.role === 'lab-result');
      if (labs.length === 0) return { pass: true, evidence: 'No lab-result documents to evaluate.' };
      const today = todayUtc();
      const stale = [];
      for (const lab of labs) {
        let newest = null;
        for (const raw of lab.extract.dates) {
          const dt = parseDate(raw);
          if (!dt) continue;
          if (newest === null || dt.getTime() > newest.getTime()) newest = dt;
        }
        if (newest === null) { stale.push(lab.name + ' (no date)'); continue; }
        const age = diffDays(today, newest);
        if (age !== null && age > 365) stale.push(lab.name + ' (' + age + ' days old)');
      }
      if (stale.length > 0) return { pass: false, note: 'Stale or undated lab(s): ' + stale.join(', ') };
      return { pass: true, evidence: labs.length + ' lab-result document(s) within freshness window.' };
    },
  },
  {
    id: 'R-PA-028',
    description: 'Each attached imaging-report document is dated within the default freshness window (12 months)',
    severity: 'flag',
    citation: 'spec-v52 §4.5.1 R-PA-028.',
    check(bundle) {
      const imgs = bundle.documents.filter((d) => d.role === 'imaging-report');
      if (imgs.length === 0) return { pass: true, evidence: 'No imaging-report documents to evaluate.' };
      const today = todayUtc();
      const stale = [];
      for (const img of imgs) {
        let newest = null;
        for (const raw of img.extract.dates) {
          const dt = parseDate(raw);
          if (!dt) continue;
          if (newest === null || dt.getTime() > newest.getTime()) newest = dt;
        }
        if (newest === null) { stale.push(img.name + ' (no date)'); continue; }
        const age = diffDays(today, newest);
        if (age !== null && age > 365) stale.push(img.name + ' (' + age + ' days old)');
      }
      if (stale.length > 0) return { pass: false, note: 'Stale or undated imaging report(s): ' + stale.join(', ') };
      return { pass: true, evidence: imgs.length + ' imaging-report document(s) within freshness window.' };
    },
  },
  {
    id: 'R-PA-033',
    description: 'Height / weight present when the packet references a weight-based dose',
    severity: 'flag',
    citation: 'spec-v52 §4.5.1 R-PA-033. Triggered by "mg/kg" / "weight-based" anchors in the packet text.',
    check(bundle) {
      const trigger = bundle.documents.some((d) => keywordPresent(d.text, ['mg/kg', 'mcg/kg', 'units/kg', 'weight-based', 'weight based', 'per kg']));
      if (!trigger) return { pass: true, evidence: 'No weight-based-dose anchor; rule vacuously satisfied.' };
      const hasWeight = bundle.documents.some((d) => d.extract.weight);
      if (!hasWeight) return { pass: false, note: 'Weight-based dose referenced but no "Weight:" / "Wt" field found.' };
      return { pass: true, evidence: 'Weight present.' };
    },
  },
  {
    id: 'R-PA-034',
    description: 'Renal function present when the packet references a renally-dosed agent',
    severity: 'flag',
    citation: 'spec-v52 §4.5.1 R-PA-034. Triggered by "renal dose adjustment" / "CrCl" / common renally-dosed drug names.',
    check(bundle) {
      const trigger = bundle.documents.some((d) => keywordPresent(d.text, ['renal dose', 'renally dosed', 'renal adjustment', 'crcl', 'creatinine clearance', 'egfr', 'vancomycin', 'gentamicin', 'tobramycin', 'enoxaparin']));
      if (!trigger) return { pass: true, evidence: 'No renally-dosed-agent anchor; rule vacuously satisfied.' };
      const hasRenal = bundle.documents.some((d) => keywordPresent(d.text, ['egfr', 'creatinine clearance', 'crcl', 'serum creatinine', 'scr ']));
      if (!hasRenal) return { pass: false, note: 'Renally-dosed agent referenced but no eGFR / CrCl / serum creatinine value found.' };
      return { pass: true, evidence: 'Renal-function indicator present.' };
    },
  },
  {
    id: 'R-PA-036',
    description: 'Frequency / interval present (daily, BID, q6h, etc.)',
    severity: 'flag',
    citation: 'spec-v52 §4.5.1 R-PA-036.',
    check(bundle) {
      const found = bundle.documents.find((d) => d.extract.frequency);
      if (!found) return { pass: false, note: 'No frequency/interval keyword (daily, BID, TID, qXh, etc.) found.' };
      return { pass: true, evidence: 'Frequency "' + found.extract.frequency + '" in ' + found.name };
    },
  },

  // ---- spec-v52 wave 52-1i: additional core rules (35 -> 45) ----

  {
    id: 'R-PA-030',
    description: 'Prior-treatment list present when step therapy applies',
    severity: 'flag',
    citation: 'spec-v52 §4.5.1 R-PA-030. Triggered when a step-therapy anchor is present; passes when the packet documents at least one prior tried-and-failed medication.',
    check(bundle) {
      const stepAnchors = ['step therapy', 'step-therapy'];
      const stepDoc = bundle.documents.find((d) => keywordPresent(d.text, stepAnchors));
      if (!stepDoc) return { pass: true, evidence: 'No step-therapy anchor; rule vacuously satisfied (R-PA-029 covers presence).' };
      const priorAnchors = ['trial of', 'tried and failed', 'failed first-line', 'prior failure of', 'prior therapy', 'previous treatment', 'previous medication', 'treatment history', 'medication history'];
      const found = bundle.documents.find((d) => keywordPresent(d.text, priorAnchors));
      if (!found) return { pass: false, note: 'Step-therapy referenced but no prior-treatment list (trial of / failed / treatment history) found.' };
      return { pass: true, evidence: 'Prior-treatment anchor in ' + found.name };
    },
  },
  {
    id: 'R-PA-035',
    description: 'Hepatic function (LFTs) present when packet references a hepatically-dosed agent',
    severity: 'info',
    citation: 'spec-v52 §4.5.1 R-PA-035. Triggered by "hepatic dose adjustment" / common hepatically-cleared drug names.',
    check(bundle) {
      const trigger = bundle.documents.some((d) => keywordPresent(d.text, ['hepatic dose', 'hepatically dosed', 'hepatic adjustment', 'methotrexate', 'amiodarone', 'voriconazole', 'rifampin', 'isoniazid', 'valproate']));
      if (!trigger) return { pass: true, evidence: 'No hepatically-dosed-agent anchor; rule vacuously satisfied.' };
      const hasLft = bundle.documents.some((d) => keywordPresent(d.text, ['ast', 'alt', 'alkaline phosphatase', 'bilirubin', 'lft', 'liver function']));
      if (!hasLft) return { pass: false, note: 'Hepatically-dosed agent referenced but no LFT (AST / ALT / bilirubin / alk phos) value found.' };
      return { pass: true, evidence: 'LFT indicator present.' };
    },
  },
  {
    id: 'R-PA-038',
    description: 'Submission is a resubmission iff a prior-auth-denial document is attached',
    severity: 'flag',
    citation: 'spec-v52 §4.5.1 R-PA-038. The packet declares resubmission/reconsideration intent and a prior-auth-denial document is attached, or neither is the case.',
    check(bundle) {
      const resubAnchors = ['resubmission', 'resubmit', 'reconsideration', 'appeal of denial'];
      const declared = bundle.documents.some((d) => keywordPresent(d.text, resubAnchors));
      const hasDenialDoc = bundle.documents.some((d) => d.role === 'prior-auth-denial');
      if (!declared && !hasDenialDoc) return { pass: true, evidence: 'Not a resubmission; rule vacuously satisfied.' };
      if (declared && hasDenialDoc) return { pass: true, evidence: 'Resubmission declared and prior-denial document attached.' };
      if (declared && !hasDenialDoc) return { pass: false, note: 'Packet declares resubmission/reconsideration but no prior-auth-denial document is attached.' };
      return { pass: false, note: 'Prior-auth-denial document attached but the packet does not declare resubmission/reconsideration intent.' };
    },
  },
  {
    id: 'R-PA-039',
    description: 'Resubmission references the original PA reference number',
    severity: 'flag',
    citation: 'spec-v52 §4.5.1 R-PA-039. Only checked when a resubmission/denial signal is present.',
    check(bundle) {
      const resubAnchors = ['resubmission', 'resubmit', 'reconsideration', 'appeal of denial'];
      const declared = bundle.documents.some((d) => keywordPresent(d.text, resubAnchors));
      const hasDenialDoc = bundle.documents.some((d) => d.role === 'prior-auth-denial');
      if (!declared && !hasDenialDoc) return { pass: true, evidence: 'Not a resubmission; rule vacuously satisfied.' };
      const refAnchors = ['prior pa reference', 'prior authorization number', 'previous pa #', 'reference number', 'auth reference', 'prior auth #'];
      const found = bundle.documents.find((d) => keywordPresent(d.text, refAnchors));
      if (!found) return { pass: false, note: 'Resubmission detected but no prior PA reference number anchor found.' };
      return { pass: true, evidence: 'Prior PA reference anchor in ' + found.name };
    },
  },
  {
    id: 'R-PA-040',
    description: 'Resubmission addresses each reason cited in the prior denial',
    severity: 'info',
    citation: 'spec-v52 §4.5.1 R-PA-040. Heuristic: a "denial reason" or "response to denial" anchor is present when a prior-denial document is in the packet.',
    check(bundle) {
      const hasDenialDoc = bundle.documents.some((d) => d.role === 'prior-auth-denial');
      if (!hasDenialDoc) return { pass: true, evidence: 'No prior-auth-denial document; rule vacuously satisfied.' };
      const responseAnchors = ['response to denial', 'addressing denial', 'denial reason', 'reason for denial', 'rebuttal'];
      const found = bundle.documents.find((d) => keywordPresent(d.text, responseAnchors));
      if (!found) return { pass: false, note: 'Prior-denial document attached but no response-to-denial / denial-reason narrative found.' };
      return { pass: true, evidence: 'Denial-response anchor in ' + found.name };
    },
  },
  {
    id: 'R-PA-052',
    description: 'Date of injury present when an external-cause ICD-10 code (V/W/X/Y) is in the packet',
    severity: 'flag',
    citation: 'spec-v52 §4.5.1 R-PA-052. ICD-10-CM external-cause codes (V00-Y99) signal injury-related encounters; payers require a date of injury.',
    check(bundle) {
      let trigger = false;
      for (const d of bundle.documents) {
        for (const code of d.extract.icd10) {
          if (/^[VWXY]/.test(code)) { trigger = true; break; }
        }
        if (trigger) break;
      }
      if (!trigger) return { pass: true, evidence: 'No external-cause (V/W/X/Y) ICD-10 code; rule vacuously satisfied.' };
      const anchors = ['date of injury', 'doi:', 'injury date', 'date injured'];
      const found = bundle.documents.find((d) => keywordPresent(d.text, anchors));
      if (!found) return { pass: false, note: 'External-cause ICD-10 code present but no "Date of injury" anchor found.' };
      return { pass: true, evidence: 'Injury-date anchor in ' + found.name };
    },
  },
  {
    id: 'R-PA-054',
    description: 'Each modifier 25 / 59 is accompanied by supporting documentation',
    severity: 'flag',
    citation: 'spec-v52 §4.5.1 R-PA-054. Modifiers 25 and 59 are the two most-audited CPT modifiers; both require documentation of a separately identifiable service.',
    check(bundle) {
      const trigger = bundle.documents.some((d) => keywordPresent(d.text, ['modifier 25', '-25 modifier', 'modifier-25', 'modifier 59', '-59 modifier', 'modifier-59']));
      if (!trigger) return { pass: true, evidence: 'No modifier 25 / 59 anchor; rule vacuously satisfied.' };
      const supportAnchors = ['separately identifiable', 'distinct procedural service', 'documented separately', 'supporting documentation'];
      const found = bundle.documents.find((d) => keywordPresent(d.text, supportAnchors));
      if (!found) return { pass: false, note: 'Modifier 25 or 59 referenced but no "separately identifiable" / "distinct procedural service" supporting language found.' };
      return { pass: true, evidence: 'Supporting language in ' + found.name };
    },
  },
  {
    id: 'R-PA-055',
    description: 'Bilateral procedure flag matches modifier 50 presence',
    severity: 'flag',
    citation: 'spec-v52 §4.5.1 R-PA-055. "Bilateral" mentioned in the clinical narrative should be accompanied by modifier 50 on the CPT line.',
    check(bundle) {
      const bilateralMention = bundle.documents.some((d) => keywordPresent(d.text, ['bilateral']));
      if (!bilateralMention) return { pass: true, evidence: 'No bilateral mention; rule vacuously satisfied.' };
      const modPresent = bundle.documents.some((d) => keywordPresent(d.text, ['modifier 50', '-50 modifier', 'modifier-50', ' mod 50']));
      if (!modPresent) return { pass: false, note: 'Packet references a bilateral procedure but modifier 50 is not on the CPT line.' };
      return { pass: true, evidence: 'Modifier 50 present.' };
    },
  },
  {
    id: 'R-PA-058',
    description: 'Unlisted-code procedure has a narrative justification',
    severity: 'flag',
    citation: 'spec-v52 §4.5.1 R-PA-058. CPT unlisted codes require a clinician narrative explaining what was done.',
    check(bundle) {
      const trigger = bundle.documents.some((d) => keywordPresent(d.text, ['unlisted procedure', 'unlisted code', 'unlisted cpt']));
      if (!trigger) return { pass: true, evidence: 'No unlisted-procedure anchor; rule vacuously satisfied.' };
      const narrativeAnchors = ['narrative:', 'narrative justification', 'procedure description:', 'description of procedure'];
      const found = bundle.documents.find((d) => keywordPresent(d.text, narrativeAnchors));
      if (!found) return { pass: false, note: 'Unlisted procedure referenced but no narrative / procedure-description anchor found.' };
      return { pass: true, evidence: 'Narrative anchor in ' + found.name };
    },
  },
  // ---- spec-v52 wave 52-1j: additional core rules (45 -> 55) ----

  {
    id: 'R-PA-014',
    description: 'Each CPT modifier present is a well-formed 2-character code',
    severity: 'flag',
    citation: 'spec-v52 §4.5.1 R-PA-014. Wave 52-1j enforces format only; payer-specific permissibility lands with payer overlays.',
    check(bundle) {
      const bad = new Set();
      const good = new Set();
      const re = /(?<!\d)(\d{5})-([A-Z0-9]{1,4})(?![A-Za-z0-9])/g;
      for (const d of bundle.documents) {
        for (const m of String(d.text || '').matchAll(re)) {
          const mod = m[2];
          if (/^[0-9]{2}$|^[A-Z]{2}$|^[A-Z][0-9]$|^[0-9][A-Z]$/.test(mod)) good.add(mod);
          else bad.add(mod);
        }
      }
      if (bad.size === 0 && good.size === 0) return { pass: true, evidence: 'No CPT modifier suffix found; rule vacuously satisfied.' };
      if (bad.size > 0) return { pass: false, note: 'Malformed modifier suffix(es): ' + [...bad].join(', ') };
      return { pass: true, evidence: 'Modifier(s) well-formed: ' + [...good].join(', ') };
    },
  },
  {
    id: 'R-PA-042',
    description: 'Each PDF document in the packet is text-extractable (non-zero extracted text length)',
    severity: 'flag',
    citation: 'spec-v52 §4.5.1 R-PA-042. A scanned PDF without an embedded text layer fails this rule; the user is steered toward OCR before resubmission (spec-v52 §2).',
    check(bundle) {
      const pdfs = bundle.documents.filter((d) => String(d.kind || '').toUpperCase() === 'PDF');
      if (pdfs.length === 0) return { pass: true, evidence: 'No PDF documents in packet; rule vacuously satisfied.' };
      const empty = pdfs.filter((d) => (d.extract.textLength || 0) === 0);
      if (empty.length > 0) return { pass: false, note: 'PDF document(s) with zero extractable text (likely scans): ' + empty.map((d) => d.name).join(', ') };
      return { pass: true, evidence: pdfs.length + ' PDF document(s) text-extractable.' };
    },
  },
  {
    id: 'R-PA-044',
    description: 'Every document in the packet has extractable content (non-zero text length)',
    severity: 'block',
    citation: 'spec-v52 §4.5.1 R-PA-044. Catches password-protected, corrupted, or empty documents that the ingest step could not open.',
    check(bundle) {
      if (bundle.documents.length === 0) return { pass: true, evidence: 'No documents in packet; rule vacuously satisfied.' };
      const empty = bundle.documents.filter((d) => (d.extract.textLength || 0) === 0);
      if (empty.length > 0) return { pass: false, note: 'Document(s) with zero extractable content (parse error / password-protected / empty): ' + empty.map((d) => d.name).join(', ') };
      return { pass: true, evidence: bundle.documents.length + ' document(s) opened cleanly.' };
    },
  },
  {
    id: 'R-PA-047',
    description: 'Patient address present (info — only fires when a payer overlay requires it)',
    severity: 'info',
    citation: 'spec-v52 §4.5.1 R-PA-047. Default payer-agnostic posture: vacuously satisfied at v52-1j. Payer overlays in v52-2+ flip this to "required" per plan.',
    check() {
      return { pass: true, evidence: 'No payer overlay loaded; rule vacuously satisfied until v52-2+.' };
    },
  },
  {
    id: 'R-PA-048',
    description: 'Subscriber relationship to patient indicated (info — payer-overlay-gated)',
    severity: 'info',
    citation: 'spec-v52 §4.5.1 R-PA-048. Default payer-agnostic posture: vacuously satisfied at v52-1j.',
    check() {
      return { pass: true, evidence: 'No payer overlay loaded; rule vacuously satisfied until v52-2+.' };
    },
  },
  {
    id: 'R-PA-049',
    description: 'Other insurance / COB information indicated (info — payer-overlay-gated)',
    severity: 'info',
    citation: 'spec-v52 §4.5.1 R-PA-049. Default payer-agnostic posture: vacuously satisfied at v52-1j.',
    check() {
      return { pass: true, evidence: 'No payer overlay loaded; rule vacuously satisfied until v52-2+.' };
    },
  },
  {
    id: 'R-PA-050',
    description: 'Diagnosis-procedure linkage shown (an ICD-10 code and a CPT/HCPCS code co-occur within the same document)',
    severity: 'flag',
    citation: 'spec-v52 §4.5.1 R-PA-050. Heuristic: at least one document carries both an ICD-10 code and a CPT/HCPCS code within ~400 characters of each other.',
    check(bundle) {
      const allIcd = new Set();
      const allCpt = new Set();
      for (const d of bundle.documents) {
        for (const c of d.extract.icd10) allIcd.add(c);
        for (const c of d.extract.cpts) allCpt.add(c);
      }
      if (allIcd.size === 0 || allCpt.size === 0) {
        return { pass: true, evidence: 'Packet lacks ICD-10 or CPT/HCPCS codes; rule vacuously satisfied (R-PA-007 / R-PA-010 cover presence).' };
      }
      for (const d of bundle.documents) {
        const hasIcd = d.extract.icd10.length > 0;
        const hasCpt = d.extract.cpts.length > 0;
        if (hasIcd && hasCpt) return { pass: true, evidence: 'ICD-10 + CPT/HCPCS co-occur in ' + d.name };
      }
      return { pass: false, note: 'No single document carries both an ICD-10 and a CPT/HCPCS code; linkage between diagnosis and procedure cannot be established.' };
    },
  },
  {
    id: 'R-PA-051',
    description: 'Procedure description matches the CPT short descriptor (info — descriptor table not shipped at v52-1j)',
    severity: 'info',
    citation: 'spec-v52 §4.5.1 R-PA-051. AMA CPT short descriptors are copyrighted; per spec-v52 §5.3, descriptor-match degrades to an info-level "check skipped" finding until a license-clean source ships.',
    check() {
      return { pass: true, evidence: 'CPT descriptor table not loaded (license-gated); descriptor match skipped.' };
    },
  },
  {
    id: 'R-PA-056',
    description: 'Anesthesia time is documented when an anesthesia CPT is present',
    severity: 'flag',
    citation: 'spec-v52 §4.5.1 R-PA-056. Anesthesia CPT range is 00100-01999; anesthesia claims require start/stop times.',
    check(bundle) {
      let trigger = false;
      for (const d of bundle.documents) {
        for (const c of d.extract.cpts) {
          if (/^0[01]\d{3}$/.test(c) && c >= '00100' && c <= '01999') { trigger = true; break; }
        }
        if (trigger) break;
      }
      if (!trigger) {
        const kw = bundle.documents.some((d) => keywordPresent(d.text, ['anesthesia time', 'anesthesia start']));
        if (!kw) return { pass: true, evidence: 'No anesthesia CPT or anesthesia anchor; rule vacuously satisfied.' };
        trigger = true;
      }
      const timeAnchors = ['anesthesia time', 'anesthesia start', 'anesthesia stop', 'start time', 'stop time', 'time in', 'time out'];
      const found = bundle.documents.find((d) => keywordPresent(d.text, timeAnchors));
      if (!found) return { pass: false, note: 'Anesthesia CPT (00100-01999) present but no anesthesia start/stop / time-in/time-out anchor found.' };
      return { pass: true, evidence: 'Anesthesia-time anchor in ' + found.name };
    },
  },
  {
    id: 'R-PA-057',
    description: 'Assistant surgeon modifier (80/81/82/AS) is accompanied by a second Luhn-valid NPI',
    severity: 'flag',
    citation: 'spec-v52 §4.5.1 R-PA-057. Modifiers 80/81/82 (assistant surgeon, MD) and AS (PA/NP assistant) require the assistant to be identifiable; payers expect a second NPI.',
    check(bundle) {
      const trigger = bundle.documents.some((d) => keywordPresent(d.text, ['modifier 80', 'modifier 81', 'modifier 82', 'modifier as', 'assistant surgeon', '-80 modifier', '-81 modifier', '-82 modifier']));
      if (!trigger) return { pass: true, evidence: 'No assistant-surgeon anchor; rule vacuously satisfied.' };
      const npis = new Set();
      for (const d of bundle.documents) for (const n of d.extract.npis) npis.add(n);
      if (npis.size < 2) return { pass: false, note: 'Assistant-surgeon modifier referenced but fewer than 2 Luhn-valid NPIs are in the packet.' };
      return { pass: true, evidence: npis.size + ' distinct Luhn-valid NPIs found.' };
    },
  },

  // ---- spec-v52 wave 52-1k: final 5 core rules (55 -> 60) ----

  {
    id: 'R-PA-008',
    description: 'Each extracted CPT code is well-formed (5 digits) and not on the bundled deleted-codes list',
    severity: 'block',
    citation: 'spec-v52 §4.5.1 R-PA-008. v52-1k ships an empty deleted-codes table; the rule is a format-strict pass and expands as payer-overlay waves populate the table per §5.3.',
    check(bundle) {
      const seen = new Set();
      const bad = new Set();
      for (const d of bundle.documents) {
        for (const c of d.extract.cpts) {
          seen.add(c);
          // CPTs are 5 digits; HCPCS Level II is letter+4 digits (skip those here).
          if (/^\d{5}$/.test(c) && DELETED_CPT_HCPCS_BUNDLED.has(c)) bad.add(c);
        }
      }
      if (seen.size === 0) return { pass: true, evidence: 'No CPT/HCPCS codes; rule vacuously satisfied (R-PA-007 covers presence).' };
      if (bad.size > 0) return { pass: false, note: 'Deleted CPT code(s) on bundled list: ' + [...bad].join(', ') };
      return { pass: true, evidence: seen.size + ' code(s) format-valid; none on the bundled deleted list.' };
    },
  },
  {
    id: 'R-PA-009',
    description: 'Each extracted HCPCS code is well-formed (letter + 4 digits) and not on the bundled deleted-codes list',
    severity: 'block',
    citation: 'spec-v52 §4.5.1 R-PA-009. v52-1k ships an empty deleted-codes table.',
    check(bundle) {
      const hcpcs = new Set();
      const bad = new Set();
      for (const d of bundle.documents) {
        for (const c of d.extract.cpts) {
          if (/^[A-V]\d{4}$/.test(c)) {
            hcpcs.add(c);
            if (DELETED_CPT_HCPCS_BUNDLED.has(c)) bad.add(c);
          }
        }
      }
      if (hcpcs.size === 0) return { pass: true, evidence: 'No HCPCS Level II code; rule vacuously satisfied.' };
      if (bad.size > 0) return { pass: false, note: 'Deleted HCPCS code(s) on bundled list: ' + [...bad].join(', ') };
      return { pass: true, evidence: hcpcs.size + ' HCPCS code(s) format-valid; none on the bundled deleted list.' };
    },
  },
  {
    id: 'R-PA-011',
    description: 'Each extracted ICD-10-CM code is well-formed and not on the bundled deleted-codes list',
    severity: 'block',
    citation: 'spec-v52 §4.5.1 R-PA-011. v52-1k ships an empty deleted-codes table; CMS ICD-10-CM annual updates populate it via the maintainer refresh script.',
    check(bundle) {
      const seen = new Set();
      const bad = new Set();
      for (const d of bundle.documents) {
        for (const c of d.extract.icd10) {
          seen.add(c);
          if (DELETED_ICD10_BUNDLED.has(c)) bad.add(c);
        }
      }
      if (seen.size === 0) return { pass: true, evidence: 'No ICD-10 code; rule vacuously satisfied (R-PA-010 covers presence).' };
      if (bad.size > 0) return { pass: false, note: 'Deleted ICD-10 code(s) on bundled list: ' + [...bad].join(', ') };
      return { pass: true, evidence: seen.size + ' code(s) format-valid; none on the bundled deleted list.' };
    },
  },
  {
    id: 'R-PA-012',
    description: 'No bundled NCCI procedure-to-procedure (PTP) edit-pair conflict among the extracted CPT codes',
    severity: 'flag',
    citation: 'spec-v52 §4.5.1 R-PA-012. v52-1k ships an empty NCCI PTP-pairs table per §5.3; populated to ~5,000 high-volume pairs by a later wave.',
    check(bundle) {
      const cpts = new Set();
      for (const d of bundle.documents) for (const c of d.extract.cpts) if (/^\d{5}$/.test(c)) cpts.add(c);
      if (cpts.size < 2) return { pass: true, evidence: 'Fewer than 2 distinct CPT codes; rule vacuously satisfied.' };
      if (NCCI_PAIRS_BUNDLED.size === 0) return { pass: true, evidence: 'NCCI PTP-pairs table empty at v52-1k; check skipped.' };
      const sorted = [...cpts].sort();
      const conflicts = [];
      for (let i = 0; i < sorted.length; i += 1) {
        for (let j = i + 1; j < sorted.length; j += 1) {
          if (NCCI_PAIRS_BUNDLED.has(sorted[i] + '-' + sorted[j])) conflicts.push(sorted[i] + '/' + sorted[j]);
        }
      }
      if (conflicts.length > 0) return { pass: false, note: 'NCCI PTP-pair conflict(s): ' + conflicts.join(', ') };
      return { pass: true, evidence: 'No bundled NCCI PTP-pair conflict among ' + cpts.size + ' CPT code(s).' };
    },
  },
  {
    id: 'R-PA-043',
    description: 'No document in the packet is password-protected or encrypted',
    severity: 'block',
    citation: 'spec-v52 §4.5.1 R-PA-043. Triggered by the view\'s parse-error metadata (encrypted PDFs and password-protected DOCXs throw at extract time) and by explicit "password protected" / "encrypted document" anchors in the extracted text.',
    check(bundle) {
      const encrypted = [];
      for (const d of bundle.documents) {
        const err = String(d.parseError || '').toLowerCase();
        if (err && /password|encrypt/.test(err)) encrypted.push(d.name + ' (' + d.parseError + ')');
        else if (keywordPresent(d.text, ['password protected', 'password-protected', 'encrypted document', 'this document is encrypted'])) {
          encrypted.push(d.name);
        }
      }
      if (encrypted.length > 0) return { pass: false, note: 'Encrypted / password-protected document(s): ' + encrypted.join(', ') };
      return { pass: true, evidence: bundle.documents.length + ' document(s) opened without an encryption error.' };
    },
  },

  // ---- spec-v52 wave 52-2a: CMS Medicare FFS overlay (first 5 of 25) ----
  //
  // Per spec-v52 §4.5.2 these rules cite specific CMS NCDs / LCDs / IOM
  // chapters and only fire when `bundle.payer === 'cms-medicare-ffs'`
  // (detected by lib/pa/payer.js letterhead anchors). They are
  // self-gating: on any non-Medicare-FFS packet each rule returns a
  // vacuous pass with an explicit "not Medicare FFS" note so the
  // audit trail still records that the rule was evaluated and chose
  // not to fire. This keeps the engine's rule-set monolithic and
  // matches the existing payer-overlay-gated info rules
  // (R-PA-047 / R-PA-048 / R-PA-049 from wave 52-1j).

  {
    id: 'R-PA-CMS-001',
    description: 'Medicare FFS DME: face-to-face encounter documented',
    severity: 'block',
    citation: 'spec-v52 §4.5.2 R-PA-CMS-001. CMS NCD-280.x; Medicare requires a face-to-face encounter with the prescribing physician within 6 months prior to the written order for most DME categories.',
    check(bundle) {
      if (bundle.payer !== 'cms-medicare-ffs') return { pass: true, evidence: 'Not Medicare FFS; rule vacuously satisfied.' };
      const dmeTrigger = bundle.documents.some((d) => keywordPresent(d.text, ['durable medical equipment', 'dme order', 'dme item', 'wheelchair', 'cpap', 'bipap', 'hospital bed', 'oxygen concentrator', 'walker', 'scooter']));
      if (!dmeTrigger) return { pass: true, evidence: 'Medicare FFS packet without a DME context anchor; rule vacuously satisfied.' };
      const ftfAnchors = ['face-to-face encounter', 'face to face encounter', 'face-to-face visit', 'f2f encounter', 'f2f visit'];
      const found = bundle.documents.find((d) => keywordPresent(d.text, ftfAnchors));
      if (!found) return { pass: false, note: 'Medicare FFS DME request without a face-to-face-encounter anchor. NCD-280.x requires F2F documentation within 6 months prior to the written order.' };
      return { pass: true, evidence: 'F2F encounter anchor in ' + found.name };
    },
  },
  {
    id: 'R-PA-CMS-002',
    description: 'Medicare FFS DME: Detailed / Standard Written Order (DWO/SWO) present and dated',
    severity: 'block',
    citation: 'spec-v52 §4.5.2 R-PA-CMS-002. CMS IOM Pub 100-08 ch. 5; a Standard Written Order (or pre-2020 Detailed Written Order) signed and dated by the prescribing physician is required before DME delivery.',
    check(bundle) {
      if (bundle.payer !== 'cms-medicare-ffs') return { pass: true, evidence: 'Not Medicare FFS; rule vacuously satisfied.' };
      const dmeTrigger = bundle.documents.some((d) => keywordPresent(d.text, ['durable medical equipment', 'dme order', 'dme item', 'wheelchair', 'cpap', 'bipap', 'hospital bed', 'oxygen concentrator', 'walker', 'scooter']));
      if (!dmeTrigger) return { pass: true, evidence: 'Medicare FFS packet without a DME context anchor; rule vacuously satisfied.' };
      const orderAnchors = ['standard written order', 'detailed written order', ' swo ', ' dwo ', 'written order:'];
      const found = bundle.documents.find((d) => keywordPresent(d.text, orderAnchors));
      if (!found) return { pass: false, note: 'Medicare FFS DME request without a Standard / Detailed Written Order anchor.' };
      const sig = bundle.documents.find((d) => d.extract.signature && d.extract.signature.dated);
      if (!sig) return { pass: false, note: 'Written-order anchor present but no dated prescriber signature found.' };
      return { pass: true, evidence: 'SWO/DWO + dated signature present.' };
    },
  },
  {
    // spec-v52 wave 52-2b: spec-aligned rename. Wave 52-2a shipped this
    // rule as R-PA-CMS-003 with the POD description; spec-v52 §4.5.2
    // reserves R-PA-CMS-003 for the SWO-elements-complete rule (added
    // below in wave 52-2b) and R-PA-CMS-004 for POD. The rename keeps
    // the logic identical; only the rule id and citation prefix move.
    id: 'R-PA-CMS-004',
    description: 'Medicare FFS DME: proof of delivery requirements documented',
    severity: 'flag',
    citation: 'spec-v52 §4.5.2 R-PA-CMS-004. CMS IOM Pub 100-08 ch. 4 §4.26; supplier must retain proof of delivery (POD) including date and recipient signature.',
    check(bundle) {
      if (bundle.payer !== 'cms-medicare-ffs') return { pass: true, evidence: 'Not Medicare FFS; rule vacuously satisfied.' };
      const dmeTrigger = bundle.documents.some((d) => keywordPresent(d.text, ['durable medical equipment', 'dme order', 'dme item', 'dme supplier']));
      if (!dmeTrigger) return { pass: true, evidence: 'Medicare FFS packet without a DME context anchor; rule vacuously satisfied.' };
      const podAnchors = ['proof of delivery', ' pod ', 'delivery confirmation', 'recipient signature', 'delivery receipt'];
      const found = bundle.documents.find((d) => keywordPresent(d.text, podAnchors));
      if (!found) return { pass: false, note: 'Medicare FFS DME request without a proof-of-delivery anchor.' };
      return { pass: true, evidence: 'POD anchor in ' + found.name };
    },
  },
  {
    id: 'R-PA-CMS-006',
    description: 'Medicare FFS PAP device: sleep study results documented within 12 months prior to initial PAP order',
    severity: 'flag',
    citation: 'spec-v52 §4.5.2 R-PA-CMS-006. LCD L33718 (Positive Airway Pressure Devices) requires a Medicare-covered sleep test with results within 12 months prior to initiating PAP therapy.',
    check(bundle) {
      if (bundle.payer !== 'cms-medicare-ffs') return { pass: true, evidence: 'Not Medicare FFS; rule vacuously satisfied.' };
      const papTrigger = bundle.documents.some((d) => keywordPresent(d.text, ['cpap', 'bipap', 'apap', 'positive airway pressure', 'pap device']));
      if (!papTrigger) return { pass: true, evidence: 'Not a PAP-device request; rule vacuously satisfied.' };
      const sleepAnchors = ['sleep study', 'polysomnogram', 'polysomnography', 'home sleep test', ' psg ', ' hst ', 'ahi'];
      const found = bundle.documents.find((d) => keywordPresent(d.text, sleepAnchors));
      if (!found) return { pass: false, note: 'PAP-device request without a sleep-study / polysomnogram / home-sleep-test anchor.' };
      return { pass: true, evidence: 'Sleep-study anchor in ' + found.name };
    },
  },
  // ---- spec-v52 wave 52-2b: CMS FFS overlay (5 more, 5 -> 10 of 25) ----

  {
    id: 'R-PA-CMS-003',
    description: 'Medicare FFS DME: Standard Written Order elements complete (beneficiary, item, date, quantity, prescriber NPI, signature)',
    severity: 'block',
    citation: 'spec-v52 §4.5.2 R-PA-CMS-003. CMS IOM Pub 100-08 ch. 5; the SWO must carry the beneficiary identity, item description / HCPCS, order date, quantity, treating-practitioner NPI, and a dated prescriber signature.',
    check(bundle) {
      if (bundle.payer !== 'cms-medicare-ffs') return { pass: true, evidence: 'Not Medicare FFS; rule vacuously satisfied.' };
      const dmeTrigger = bundle.documents.some((d) => keywordPresent(d.text, ['durable medical equipment', 'dme order', 'dme item', 'wheelchair', 'cpap', 'bipap', 'hospital bed', 'oxygen concentrator', 'walker', 'scooter']));
      if (!dmeTrigger) return { pass: true, evidence: 'Medicare FFS packet without a DME context anchor; rule vacuously satisfied.' };
      const orderPresent = bundle.documents.some((d) => keywordPresent(d.text, ['standard written order', 'detailed written order', ' swo ', ' dwo ', 'written order:']));
      if (!orderPresent) return { pass: true, evidence: 'No SWO/DWO anchor; R-PA-CMS-002 covers presence.' };
      const missing = [];
      const hasBeneficiary = bundle.documents.some((d) => d.extract.patientName) && bundle.documents.some((d) => d.extract.dob || d.extract.memberId);
      if (!hasBeneficiary) missing.push('beneficiary identity');
      const hasItem = bundle.documents.some((d) => d.extract.cpts.length > 0);
      if (!hasItem) missing.push('item / HCPCS');
      const hasDate = bundle.documents.some((d) => d.extract.dates.length > 0);
      if (!hasDate) missing.push('order date');
      const hasQty = bundle.documents.some((d) => d.extract.quantity !== null && d.extract.quantity !== undefined);
      if (!hasQty) missing.push('quantity');
      const hasNpi = bundle.documents.some((d) => d.extract.npis.length > 0);
      if (!hasNpi) missing.push('prescriber NPI');
      const hasDatedSig = bundle.documents.some((d) => d.extract.signature && d.extract.signature.dated);
      if (!hasDatedSig) missing.push('dated signature');
      if (missing.length > 0) return { pass: false, note: 'SWO is missing required element(s): ' + missing.join(', ') + '.' };
      return { pass: true, evidence: 'All required SWO elements detected.' };
    },
  },
  {
    id: 'R-PA-CMS-005',
    description: 'Medicare FFS mobility device: patient functional status documented',
    severity: 'flag',
    citation: 'spec-v52 §4.5.2 R-PA-CMS-005. CMS LCD L33788 (Power Mobility Devices) requires a documented mobility limitation evaluation: ADL impact, ambulation distance, balance, and home accessibility.',
    check(bundle) {
      if (bundle.payer !== 'cms-medicare-ffs') return { pass: true, evidence: 'Not Medicare FFS; rule vacuously satisfied.' };
      const mobilityTrigger = bundle.documents.some((d) => keywordPresent(d.text, ['power wheelchair', 'manual wheelchair', 'power mobility device', ' pmd ', 'scooter', 'walker', 'rollator']));
      if (!mobilityTrigger) return { pass: true, evidence: 'No mobility-device anchor; rule vacuously satisfied.' };
      const functionalAnchors = ['mobility limitation', 'mobility evaluation', 'functional status', 'ambulation distance', 'activities of daily living', ' adl ', 'home assessment', 'balance assessment'];
      const found = bundle.documents.find((d) => keywordPresent(d.text, functionalAnchors));
      if (!found) return { pass: false, note: 'Mobility-device request without a functional-status / mobility-evaluation anchor (LCD L33788).' };
      return { pass: true, evidence: 'Functional-status anchor in ' + found.name };
    },
  },
  {
    id: 'R-PA-CMS-007',
    description: 'Medicare FFS PAP continuation: 90-day adherence / compliance documentation',
    severity: 'flag',
    citation: 'spec-v52 §4.5.2 R-PA-CMS-007. LCD L33718 requires documentation that the beneficiary is using PAP >= 4 hours/night on >= 70% of nights during a consecutive 30-day period within the first 90 days of initial PAP use, before continued coverage past three months.',
    check(bundle) {
      if (bundle.payer !== 'cms-medicare-ffs') return { pass: true, evidence: 'Not Medicare FFS; rule vacuously satisfied.' };
      const continuationTrigger = bundle.documents.some((d) => keywordPresent(d.text, ['pap continuation', 'cpap continuation', 'bipap continuation', 'continued coverage', '90-day compliance', '90 day compliance']));
      if (!continuationTrigger) return { pass: true, evidence: 'No PAP-continuation anchor; rule vacuously satisfied.' };
      const adherenceAnchors = ['adherence', 'compliance data', 'usage data', 'hours per night', 'nights of use', '4 hours/night', '70% of nights'];
      const found = bundle.documents.find((d) => keywordPresent(d.text, adherenceAnchors));
      if (!found) return { pass: false, note: 'PAP-continuation request without an adherence / usage-data anchor (LCD L33718).' };
      return { pass: true, evidence: 'Adherence anchor in ' + found.name };
    },
  },
  {
    id: 'R-PA-CMS-008',
    description: 'Medicare FFS home oxygen: qualifying arterial blood gas or pulse-oximetry result documented',
    severity: 'block',
    citation: 'spec-v52 §4.5.2 R-PA-CMS-008. CMS NCD 240.2 / LCD L33797 (Oxygen and Oxygen Equipment) requires a qualifying ABG (PaO2 <= 55 mmHg) or pulse oximetry (SpO2 <= 88%) on room air at rest, during sleep, or with exertion.',
    check(bundle) {
      if (bundle.payer !== 'cms-medicare-ffs') return { pass: true, evidence: 'Not Medicare FFS; rule vacuously satisfied.' };
      const oxygenTrigger = bundle.documents.some((d) => keywordPresent(d.text, ['home oxygen', 'oxygen therapy', 'oxygen concentrator', 'liquid oxygen', 'portable oxygen']));
      if (!oxygenTrigger) return { pass: true, evidence: 'No home-oxygen anchor; rule vacuously satisfied.' };
      const qualifyingAnchors = ['abg', 'arterial blood gas', 'pao2', 'pulse oximetry', 'spo2', 'oxygen saturation', 'room air'];
      const found = bundle.documents.find((d) => keywordPresent(d.text, qualifyingAnchors));
      if (!found) return { pass: false, note: 'Home-oxygen request without a qualifying ABG / SpO2 anchor (NCD 240.2 / LCD L33797).' };
      return { pass: true, evidence: 'Qualifying-test anchor in ' + found.name };
    },
  },
  {
    id: 'R-PA-CMS-011',
    description: 'Medicare FFS hospital bed: medical-necessity documentation present',
    severity: 'flag',
    citation: 'spec-v52 §4.5.2 R-PA-CMS-011. LCD L33820 (Hospital Beds and Accessories) requires documentation that the beneficiary has a condition requiring positioning of the body in ways not feasible with an ordinary bed (e.g., head elevation > 30°, frequent body position change).',
    check(bundle) {
      if (bundle.payer !== 'cms-medicare-ffs') return { pass: true, evidence: 'Not Medicare FFS; rule vacuously satisfied.' };
      const bedTrigger = bundle.documents.some((d) => keywordPresent(d.text, ['hospital bed', 'adjustable bed', 'semi-electric bed', 'electric hospital bed']));
      if (!bedTrigger) return { pass: true, evidence: 'No hospital-bed anchor; rule vacuously satisfied.' };
      const necessityAnchors = ['head elevation', 'body positioning', 'position change', 'congestive heart failure', 'cardiopulmonary', 'aspiration risk', 'reflux', 'positioning requirement'];
      const found = bundle.documents.find((d) => keywordPresent(d.text, necessityAnchors));
      if (!found) return { pass: false, note: 'Hospital-bed request without a positioning / medical-necessity anchor (LCD L33820).' };
      return { pass: true, evidence: 'Medical-necessity anchor in ' + found.name };
    },
  },

  // ---- spec-v52 wave 52-2c: CMS FFS overlay (5 more, 10 -> 15 of 25) ----

  {
    id: 'R-PA-CMS-012',
    description: 'Medicare FFS enteral nutrition: inability to ingest / projected duration documented',
    severity: 'flag',
    citation: 'spec-v52 §4.5.2 R-PA-CMS-012. LCD L33783 (Enteral Nutrition) requires documentation of a permanent (>= 90 days) inability to take nutrition orally and a functioning gastrointestinal tract.',
    check(bundle) {
      if (bundle.payer !== 'cms-medicare-ffs') return { pass: true, evidence: 'Not Medicare FFS; rule vacuously satisfied.' };
      const enteralTrigger = bundle.documents.some((d) => keywordPresent(d.text, ['enteral nutrition', 'tube feeding', 'g-tube', 'gastrostomy tube', 'j-tube', 'jejunostomy tube', 'nasogastric tube', ' ng tube']));
      if (!enteralTrigger) return { pass: true, evidence: 'No enteral-nutrition anchor; rule vacuously satisfied.' };
      const necessityAnchors = ['unable to take oral', 'inability to swallow', 'dysphagia', 'aspiration risk', 'permanent impairment', '90 days', 'long-term enteral', 'chronic enteral'];
      const found = bundle.documents.find((d) => keywordPresent(d.text, necessityAnchors));
      if (!found) return { pass: false, note: 'Enteral-nutrition request without an inability-to-ingest / projected-duration anchor (LCD L33783).' };
      return { pass: true, evidence: 'Necessity anchor in ' + found.name };
    },
  },
  {
    id: 'R-PA-CMS-013',
    description: 'Medicare FFS nebulizer: obstructive pulmonary disease diagnosis documented',
    severity: 'flag',
    citation: 'spec-v52 §4.5.2 R-PA-CMS-013. LCD L33370 (Nebulizers) requires documentation of a covered diagnosis (COPD, asthma, cystic fibrosis, bronchiectasis, etc.) and the inhalation drug being delivered.',
    check(bundle) {
      if (bundle.payer !== 'cms-medicare-ffs') return { pass: true, evidence: 'Not Medicare FFS; rule vacuously satisfied.' };
      const nebTrigger = bundle.documents.some((d) => keywordPresent(d.text, ['nebulizer', 'compressor nebulizer', 'small volume nebulizer', ' svn ', 'inhalation solution']));
      if (!nebTrigger) return { pass: true, evidence: 'No nebulizer anchor; rule vacuously satisfied.' };
      const dxAnchors = ['copd', 'chronic obstructive pulmonary', 'asthma', 'cystic fibrosis', 'bronchiectasis', 'bronchospasm', 'emphysema', 'chronic bronchitis'];
      const found = bundle.documents.find((d) => keywordPresent(d.text, dxAnchors));
      if (!found) return { pass: false, note: 'Nebulizer request without a covered obstructive-pulmonary diagnosis anchor (LCD L33370).' };
      return { pass: true, evidence: 'Diagnosis anchor in ' + found.name };
    },
  },
  {
    id: 'R-PA-CMS-014',
    description: 'Medicare FFS TENS unit: chronic intractable pain > 3 months + failed conventional therapy documented',
    severity: 'block',
    citation: 'spec-v52 §4.5.2 R-PA-CMS-014. NCD 160.13 / LCD L33802 (TENS) requires chronic intractable pain present > 3 months and documentation of failure or unsuitability of conventional therapy.',
    check(bundle) {
      if (bundle.payer !== 'cms-medicare-ffs') return { pass: true, evidence: 'Not Medicare FFS; rule vacuously satisfied.' };
      const tensTrigger = bundle.documents.some((d) => keywordPresent(d.text, ['tens unit', 'transcutaneous electrical nerve stimulation', 'tens therapy', 'tens device']));
      if (!tensTrigger) return { pass: true, evidence: 'No TENS anchor; rule vacuously satisfied.' };
      const painAnchors = ['chronic intractable pain', 'chronic pain', 'intractable pain', 'pain > 3 months', 'pain greater than 3 months', 'long-standing pain'];
      const failureAnchors = ['failed conservative', 'failed conventional', 'failed physical therapy', 'failed nsaid', 'failed pharmacologic', 'conservative therapy failed'];
      const painFound = bundle.documents.find((d) => keywordPresent(d.text, painAnchors));
      const failureFound = bundle.documents.find((d) => keywordPresent(d.text, failureAnchors));
      if (!painFound) return { pass: false, note: 'TENS request without a chronic-intractable-pain anchor (NCD 160.13).' };
      if (!failureFound) return { pass: false, note: 'TENS request without a failed-conventional-therapy anchor (NCD 160.13).' };
      return { pass: true, evidence: 'Pain + failed-therapy anchors present.' };
    },
  },
  {
    id: 'R-PA-CMS-015',
    description: 'Medicare FFS NPWT: wound type / size / failed standard wound care documented',
    severity: 'flag',
    citation: 'spec-v52 §4.5.2 R-PA-CMS-015. LCD L33821 (Negative Pressure Wound Therapy) requires documentation of a covered wound type (Stage III/IV pressure ulcer, neuropathic ulcer, etc.) plus failure of standard wound care.',
    check(bundle) {
      if (bundle.payer !== 'cms-medicare-ffs') return { pass: true, evidence: 'Not Medicare FFS; rule vacuously satisfied.' };
      const npwtTrigger = bundle.documents.some((d) => keywordPresent(d.text, ['negative pressure wound therapy', ' npwt', 'wound vac', 'vacuum-assisted closure', ' v.a.c.']));
      if (!npwtTrigger) return { pass: true, evidence: 'No NPWT anchor; rule vacuously satisfied.' };
      const woundAnchors = ['stage iii pressure', 'stage iv pressure', 'stage 3 pressure', 'stage 4 pressure', 'neuropathic ulcer', 'venous ulcer', 'arterial ulcer', 'diabetic foot ulcer', 'wound dimension', 'wound measurement', 'wound size'];
      const failureAnchors = ['failed standard wound care', 'failed conservative wound', 'failed wound care', 'standard wound care unsuccessful'];
      const woundFound = bundle.documents.find((d) => keywordPresent(d.text, woundAnchors));
      const failureFound = bundle.documents.find((d) => keywordPresent(d.text, failureAnchors));
      if (!woundFound) return { pass: false, note: 'NPWT request without a covered wound-type / size anchor (LCD L33821).' };
      if (!failureFound) return { pass: false, note: 'NPWT request without a failed-standard-wound-care anchor (LCD L33821).' };
      return { pass: true, evidence: 'Wound + failure anchors present.' };
    },
  },
  {
    id: 'R-PA-CMS-016',
    description: 'Medicare FFS lower-limb prosthesis: K-level / functional rehabilitation potential documented',
    severity: 'flag',
    citation: 'spec-v52 §4.5.2 R-PA-CMS-016. LCD L33787 (Lower Limb Prostheses) requires documentation of the beneficiary\'s functional level (K0-K4) and rehabilitation potential.',
    check(bundle) {
      if (bundle.payer !== 'cms-medicare-ffs') return { pass: true, evidence: 'Not Medicare FFS; rule vacuously satisfied.' };
      const prosTrigger = bundle.documents.some((d) => keywordPresent(d.text, ['lower limb prosthesis', 'lower-limb prosthesis', 'transtibial prosthesis', 'transfemoral prosthesis', 'below-knee prosthesis', 'above-knee prosthesis', 'bka prosthesis', 'aka prosthesis']));
      if (!prosTrigger) return { pass: true, evidence: 'No lower-limb-prosthesis anchor; rule vacuously satisfied.' };
      const kLevelAnchors = ['k0', 'k1', 'k2', 'k3', 'k4', 'functional level', 'rehabilitation potential', 'ambulation potential'];
      const found = bundle.documents.find((d) => keywordPresent(d.text, kLevelAnchors));
      if (!found) return { pass: false, note: 'Lower-limb-prosthesis request without a K-level / functional-rehabilitation-potential anchor (LCD L33787).' };
      return { pass: true, evidence: 'K-level / functional-potential anchor in ' + found.name };
    },
  },

  // ---- spec-v52 wave 52-2d: CMS FFS overlay (5 more, 15 -> 20 of 25) ----

  {
    id: 'R-PA-CMS-017',
    description: 'Medicare FFS orthotics: documented condition + L-code present',
    severity: 'flag',
    citation: 'spec-v52 §4.5.2 R-PA-CMS-017. LCD L33686 (Ankle-Foot / Knee-Ankle-Foot Orthoses) requires documentation of a condition (e.g., drop foot, peroneal palsy, post-CVA) plus an appropriate L-code HCPCS.',
    check(bundle) {
      if (bundle.payer !== 'cms-medicare-ffs') return { pass: true, evidence: 'Not Medicare FFS; rule vacuously satisfied.' };
      const orthTrigger = bundle.documents.some((d) => keywordPresent(d.text, ['orthosis', 'orthotic', 'ankle-foot orthosis', 'afo', 'knee-ankle-foot orthosis', 'kafo', 'wrist-hand orthosis', 'whfo']));
      if (!orthTrigger) return { pass: true, evidence: 'No orthotic anchor; rule vacuously satisfied.' };
      const dxAnchors = ['drop foot', 'peroneal palsy', 'post-cva', 'post cva', 'hemiplegia', 'foot drop', 'spasticity', 'contracture', 'gait abnormality'];
      const dxFound = bundle.documents.find((d) => keywordPresent(d.text, dxAnchors));
      // L-code = HCPCS Level II starting with 'L' followed by 4 digits.
      let lCode = null;
      for (const d of bundle.documents) {
        for (const c of d.extract.cpts) {
          if (/^L\d{4}$/.test(c)) { lCode = c; break; }
        }
        if (lCode) break;
      }
      if (!dxFound) return { pass: false, note: 'Orthotic request without a covered-condition anchor (LCD L33686).' };
      if (!lCode) return { pass: false, note: 'Orthotic request without an L-code HCPCS for the device.' };
      return { pass: true, evidence: 'Condition anchor + L-code ' + lCode + ' present.' };
    },
  },
  {
    id: 'R-PA-CMS-018',
    description: 'Medicare FFS continuous glucose monitor: insulin therapy + frequent self-monitoring documented',
    severity: 'flag',
    citation: 'spec-v52 §4.5.2 R-PA-CMS-018. LCD L33822 (Glucose Monitors) requires documentation of insulin therapy AND a history of frequent self-monitoring (>= 4 fingersticks/day) or problematic hypoglycemia before CGM coverage.',
    check(bundle) {
      if (bundle.payer !== 'cms-medicare-ffs') return { pass: true, evidence: 'Not Medicare FFS; rule vacuously satisfied.' };
      const cgmTrigger = bundle.documents.some((d) => keywordPresent(d.text, ['continuous glucose monitor', ' cgm ', 'dexcom', 'freestyle libre', 'guardian sensor']));
      if (!cgmTrigger) return { pass: true, evidence: 'No CGM anchor; rule vacuously satisfied.' };
      const insulinAnchors = ['insulin therapy', 'on insulin', 'multiple daily injections', 'insulin pump', 'basal insulin', 'bolus insulin'];
      const monitoringAnchors = ['fingerstick', 'self-monitoring of blood glucose', ' smbg ', 'hypoglycemia unawareness', 'severe hypoglycemia', 'problematic hypoglycemia', '4 times a day', 'four times daily'];
      const insulinFound = bundle.documents.find((d) => keywordPresent(d.text, insulinAnchors));
      const monitorFound = bundle.documents.find((d) => keywordPresent(d.text, monitoringAnchors));
      if (!insulinFound) return { pass: false, note: 'CGM request without an insulin-therapy anchor (LCD L33822).' };
      if (!monitorFound) return { pass: false, note: 'CGM request without a frequent-self-monitoring / hypoglycemia anchor (LCD L33822).' };
      return { pass: true, evidence: 'Insulin + monitoring anchors present.' };
    },
  },
  {
    id: 'R-PA-CMS-019',
    description: 'Medicare FFS post-transplant immunosuppressives: date and Medicare-covered transplant type documented',
    severity: 'flag',
    citation: 'spec-v52 §4.5.2 R-PA-CMS-019. CMS Part B covers immunosuppressive drugs for beneficiaries who had a Medicare-covered organ transplant (kidney, heart, liver, lung, pancreas, intestinal). The transplant date and organ must be documented.',
    check(bundle) {
      if (bundle.payer !== 'cms-medicare-ffs') return { pass: true, evidence: 'Not Medicare FFS; rule vacuously satisfied.' };
      const immunoTrigger = bundle.documents.some((d) => keywordPresent(d.text, ['immunosuppressive', 'tacrolimus', 'cyclosporine', 'mycophenolate', 'sirolimus', 'everolimus', 'post-transplant', 'post transplant', 'anti-rejection']));
      if (!immunoTrigger) return { pass: true, evidence: 'No immunosuppressive anchor; rule vacuously satisfied.' };
      const transplantAnchors = ['kidney transplant', 'renal transplant', 'heart transplant', 'liver transplant', 'lung transplant', 'pancreas transplant', 'intestinal transplant', 'organ transplant', 'transplant date'];
      const found = bundle.documents.find((d) => keywordPresent(d.text, transplantAnchors));
      if (!found) return { pass: false, note: 'Immunosuppressive request without a Medicare-covered transplant-organ anchor.' };
      return { pass: true, evidence: 'Transplant-organ anchor in ' + found.name };
    },
  },
  {
    id: 'R-PA-CMS-020',
    description: 'Medicare FFS parenteral nutrition: documented GI tract failure + caloric requirements',
    severity: 'flag',
    citation: 'spec-v52 §4.5.2 R-PA-CMS-020. LCD L33799 (Parenteral Nutrition) requires documentation that the GI tract is non-functional or inaccessible (e.g., short bowel syndrome, motility disorder, fistula) and an estimate of caloric / protein requirements.',
    check(bundle) {
      if (bundle.payer !== 'cms-medicare-ffs') return { pass: true, evidence: 'Not Medicare FFS; rule vacuously satisfied.' };
      const parTrigger = bundle.documents.some((d) => keywordPresent(d.text, ['parenteral nutrition', ' tpn ', 'total parenteral nutrition', ' ppn ', 'peripheral parenteral']));
      if (!parTrigger) return { pass: true, evidence: 'No parenteral-nutrition anchor; rule vacuously satisfied.' };
      const giAnchors = ['short bowel syndrome', 'motility disorder', 'enterocutaneous fistula', 'malabsorption', 'non-functional gi', 'gi tract failure', 'severe pancreatitis', 'high-output fistula', 'ileus'];
      const caloricAnchors = ['caloric requirement', 'calorie requirement', 'kcal/day', 'kcal per day', 'protein requirement', 'macronutrient', 'nutritional requirements'];
      const giFound = bundle.documents.find((d) => keywordPresent(d.text, giAnchors));
      const calFound = bundle.documents.find((d) => keywordPresent(d.text, caloricAnchors));
      if (!giFound) return { pass: false, note: 'Parenteral-nutrition request without a GI-tract-failure anchor (LCD L33799).' };
      if (!calFound) return { pass: false, note: 'Parenteral-nutrition request without a caloric / protein-requirement anchor (LCD L33799).' };
      return { pass: true, evidence: 'GI failure + caloric anchors present.' };
    },
  },
  {
    id: 'R-PA-CMS-021',
    description: 'Medicare FFS lymphedema pneumatic compression pump: documented lymphedema + failed conservative therapy',
    severity: 'flag',
    citation: 'spec-v52 §4.5.2 R-PA-CMS-021. LCD L33829 (Pneumatic Compression Devices) requires documentation of chronic venous insufficiency or lymphedema plus failure of a 4-week trial of conservative therapy (compression garments / manual lymphatic drainage).',
    check(bundle) {
      if (bundle.payer !== 'cms-medicare-ffs') return { pass: true, evidence: 'Not Medicare FFS; rule vacuously satisfied.' };
      const pumpTrigger = bundle.documents.some((d) => keywordPresent(d.text, ['pneumatic compression', 'lymphedema pump', 'compression pump', 'pneumatic compression device', ' pcd ', 'sequential compression']));
      if (!pumpTrigger) return { pass: true, evidence: 'No pneumatic-compression anchor; rule vacuously satisfied.' };
      const dxAnchors = ['lymphedema', 'chronic venous insufficiency', ' cvi ', 'venous ulcer', 'post-mastectomy lymphedema', 'primary lymphedema', 'secondary lymphedema'];
      const failureAnchors = ['failed compression garment', 'failed conservative', 'failed manual lymphatic drainage', 'failed mld', 'conservative therapy unsuccessful', '4-week trial', 'four-week trial'];
      const dxFound = bundle.documents.find((d) => keywordPresent(d.text, dxAnchors));
      const failureFound = bundle.documents.find((d) => keywordPresent(d.text, failureAnchors));
      if (!dxFound) return { pass: false, note: 'Pneumatic-compression request without a lymphedema / CVI diagnosis anchor (LCD L33829).' };
      if (!failureFound) return { pass: false, note: 'Pneumatic-compression request without a failed-conservative-therapy anchor (LCD L33829).' };
      return { pass: true, evidence: 'Diagnosis + failed-therapy anchors present.' };
    },
  },

  {
    id: 'R-PA-CMS-009',
    description: 'Medicare FFS DME: supplier PTAN documented',
    severity: 'flag',
    citation: 'spec-v52 §4.5.2 R-PA-CMS-009. CMS supplier PTAN (Provider Transaction Access Number) is required on DME claims so the MAC can match the supplier to the Medicare enrollment record.',
    check(bundle) {
      if (bundle.payer !== 'cms-medicare-ffs') return { pass: true, evidence: 'Not Medicare FFS; rule vacuously satisfied.' };
      const dmeTrigger = bundle.documents.some((d) => keywordPresent(d.text, ['durable medical equipment', 'dme order', 'dme item', 'dme supplier']));
      if (!dmeTrigger) return { pass: true, evidence: 'Medicare FFS packet without a DME context anchor; rule vacuously satisfied.' };
      const ptanAnchors = ['ptan:', 'ptan ', 'provider transaction access number', 'supplier ptan'];
      const found = bundle.documents.find((d) => keywordPresent(d.text, ptanAnchors));
      if (!found) return { pass: false, note: 'Medicare FFS DME request without a supplier PTAN anchor.' };
      return { pass: true, evidence: 'PTAN anchor in ' + found.name };
    },
  },

  {
    id: 'R-PA-059',
    description: 'Date of consent (when a consent document is present) is on or before the date of service',
    severity: 'flag',
    citation: 'spec-v52 §4.5.1 R-PA-059. Consent must be obtained before the procedure.',
    check(bundle) {
      const consentDocs = bundle.documents.filter((d) => keywordPresent(d.text, ['informed consent', 'consent form', 'consent:', 'patient consent']));
      if (consentDocs.length === 0) return { pass: true, evidence: 'No consent document; rule vacuously satisfied.' };
      // Latest service date
      let latestService = null;
      for (const d of bundle.documents) {
        for (const raw of d.extract.serviceDates) {
          const dt = parseDate(raw);
          if (!dt) continue;
          if (latestService === null || dt.getTime() > latestService.getTime()) latestService = dt;
        }
      }
      if (latestService === null) return { pass: true, evidence: 'No labeled service date; rule vacuously satisfied (R-PA-004 covers presence).' };
      // Pick latest date in any consent document
      let latestConsent = null;
      let consentDocName = null;
      for (const d of consentDocs) {
        for (const raw of d.extract.dates) {
          const dt = parseDate(raw);
          if (!dt) continue;
          if (latestConsent === null || dt.getTime() > latestConsent.getTime()) { latestConsent = dt; consentDocName = d.name; }
        }
      }
      if (latestConsent === null) return { pass: false, note: 'Consent document present but no extractable consent date.' };
      if (latestConsent.getTime() > latestService.getTime()) {
        return { pass: false, note: 'Latest consent date in ' + consentDocName + ' is after the latest service date.' };
      }
      return { pass: true, evidence: 'Consent date is on or before the service date.' };
    },
  },
];
