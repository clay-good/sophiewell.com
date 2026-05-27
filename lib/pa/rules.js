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

import { luhnNpi, POS_CODES_BUNDLED, keywordPresent } from './extract.js';
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
];
