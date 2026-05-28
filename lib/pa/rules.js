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
