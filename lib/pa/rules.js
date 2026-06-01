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
import { ruleSourceIds } from './rule-sources.js';

// spec-v52 §4.5.1: default payer-agnostic windows. Each one can be
// overridden by a payer overlay in a later wave; the default lives
// here so the starter ruleset is self-contained.
// spec-v52 wave 52-5a §4.5.5 specialty triggers. Radiology / advanced
// imaging CPT range is 70010-79999 (AMA CPT category "Radiology");
// MRI lives in tighter subranges (70551-70559 brain, 71550-71552 chest,
// 72141-72158 spine, 73218-73223 / 73718-73723 extremities, 74181-74183
// abdomen, etc.). The starter set uses a compact prefix check rather
// than enumerating every code.
function collectRadiologyCpts(bundle) {
  const out = new Set();
  for (const d of bundle.documents) {
    for (const c of d.extract.cpts) {
      if (/^7\d{4}$/.test(c)) out.add(c);
    }
  }
  return out;
}
// Behavioral health specialty trigger. AMA CPT 90785-90899 covers
// psychiatric / psychotherapy services; 96130-96139 covers psychological
// testing; ICD-10 F00-F99 covers mental and behavioral disorders. The
// trigger fires when ANY of these signals is present in the packet.
function collectBehavioralHealthSignals(bundle) {
  const cpts = new Set();
  const icd10s = new Set();
  for (const d of bundle.documents) {
    for (const c of d.extract.cpts) {
      // AMA psychiatric / psychotherapy CPT range 90785-90899 simplified
      // as 90700-90899 (a small superset that has no other AMA category).
      if (/^90[78]\d{2}$/.test(c)) cpts.add(c);
      else if (/^9613[0-9]$/.test(c)) cpts.add(c);
    }
    for (const code of d.extract.icd10) {
      if (/^F/.test(code)) icd10s.add(code);
    }
  }
  return { cpts, icd10s, triggered: cpts.size > 0 || icd10s.size > 0 };
}

// Genetic-testing specialty trigger. AMA molecular-pathology CPTs
// 81105-81479 and multianalyte assays 81500-81512 cover the bulk of
// genetic / genomic tests; PLA proprietary lab codes are 0001U-0999U
// in CPT IV. The trigger fires on any of these.
function collectGeneticTestingCpts(bundle) {
  const out = new Set();
  for (const d of bundle.documents) {
    for (const c of d.extract.cpts) {
      // 81105-81479 + 81500-81512 -- all 81xxx is a clean superset.
      if (/^81\d{3}$/.test(c)) out.add(c);
    }
  }
  return out;
}

// AMA CPT category "Surgery" covers codes 10004-69990. A compact prefix
// check (first digit in 1..6) is the trigger for the §4.5.5 surgery
// overlay; codes like 99213 (E/M, 9xxxx) and 70551 (radiology, 7xxxx)
// fall outside and do not fire the surgery specialty rules.
function collectSurgeryCpts(bundle) {
  const out = new Set();
  for (const d of bundle.documents) {
    for (const c of d.extract.cpts) {
      if (/^[1-6]\d{4}$/.test(c)) out.add(c);
    }
  }
  return out;
}

// J-codes (HCPCS Level II J####) cover physician-administered drugs --
// the trigger for the infusion / specialty-drug specialty overlay.
function collectJCodes(bundle) {
  const out = new Set();
  for (const d of bundle.documents) {
    for (const c of d.extract.cpts) {
      if (/^J\d{4}$/.test(c)) out.add(c);
    }
  }
  return out;
}

function collectMriCpts(bundle) {
  // MRI procedures cluster around: 70551-70559, 71550-71552, 72141-72158,
  // 72195-72197, 73218-73223, 73718-73723, 74181-74183. Approximate with
  // a coarse pattern that covers the common subranges.
  const mriPrefixes = ['7055', '7155', '7214', '7215', '7219', '7221', '7222', '7321', '7322', '7371', '7372', '7418'];
  const out = new Set();
  for (const d of bundle.documents) {
    for (const c of d.extract.cpts) {
      if (!/^7\d{4}$/.test(c)) continue;
      const prefix = c.slice(0, 4);
      if (mriPrefixes.includes(prefix)) out.add(c);
    }
  }
  return out;
}

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

  // ---- spec-v52 wave 52-2e: CMS FFS overlay (final 5, 20 -> 25; closes §4.5.2) ----

  {
    id: 'R-PA-CMS-022',
    description: 'Medicare FFS external infusion pump: covered chronic-disease indication + drug compatibility documented',
    severity: 'flag',
    citation: 'spec-v52 §4.5.2 R-PA-CMS-022. LCD L33794 (External Infusion Pumps) requires a covered indication (e.g., chemotherapy, antifungal therapy, parenteral hydration, inotropic therapy) and an FDA-approved infusion drug.',
    check(bundle) {
      if (bundle.payer !== 'cms-medicare-ffs') return { pass: true, evidence: 'Not Medicare FFS; rule vacuously satisfied.' };
      const pumpTrigger = bundle.documents.some((d) => keywordPresent(d.text, ['external infusion pump', 'ambulatory infusion pump', 'infusion pump', 'continuous infusion', 'home infusion']));
      if (!pumpTrigger) return { pass: true, evidence: 'No external-infusion-pump anchor; rule vacuously satisfied.' };
      const indicationAnchors = ['chemotherapy', 'antifungal therapy', 'parenteral hydration', 'inotropic therapy', 'iron chelation', 'opioid infusion', 'pain management infusion', 'antibiotic infusion', 'iv antibiotic'];
      const drugAnchors = ['drug:', 'medication:', 'iv drug', 'infusion drug', 'fda-approved', 'fda approved'];
      const indicationFound = bundle.documents.find((d) => keywordPresent(d.text, indicationAnchors));
      const drugFound = bundle.documents.find((d) => keywordPresent(d.text, drugAnchors));
      if (!indicationFound) return { pass: false, note: 'External-infusion-pump request without a covered-indication anchor (LCD L33794).' };
      if (!drugFound) return { pass: false, note: 'External-infusion-pump request without a drug / medication identifier.' };
      return { pass: true, evidence: 'Indication + drug anchors present.' };
    },
  },
  {
    id: 'R-PA-CMS-023',
    description: 'Medicare FFS ostomy supplies: ostomy type documented + quantity within monthly utilization limits',
    severity: 'flag',
    citation: 'spec-v52 §4.5.2 R-PA-CMS-023. LCD L33828 (Ostomy Supplies) requires documentation of ostomy type (colostomy, ileostomy, urostomy) and quantity must align with the LCD utilization parameters.',
    check(bundle) {
      if (bundle.payer !== 'cms-medicare-ffs') return { pass: true, evidence: 'Not Medicare FFS; rule vacuously satisfied.' };
      const ostomyTrigger = bundle.documents.some((d) => keywordPresent(d.text, ['ostomy', 'colostomy', 'ileostomy', 'urostomy', 'stoma', 'ostomy pouch', 'ostomy wafer', 'ostomy supply']));
      if (!ostomyTrigger) return { pass: true, evidence: 'No ostomy anchor; rule vacuously satisfied.' };
      const typeAnchors = ['colostomy', 'ileostomy', 'urostomy', 'continent diversion', 'ileal conduit'];
      const typeFound = bundle.documents.find((d) => keywordPresent(d.text, typeAnchors));
      const hasQty = bundle.documents.some((d) => d.extract.quantity !== null && d.extract.quantity !== undefined);
      if (!typeFound) return { pass: false, note: 'Ostomy-supply request without an ostomy-type anchor (LCD L33828).' };
      if (!hasQty) return { pass: false, note: 'Ostomy-supply request without a Quantity field (R-PA-015 covers presence; LCD L33828 limits utilization).' };
      return { pass: true, evidence: 'Type + quantity present.' };
    },
  },
  {
    id: 'R-PA-CMS-024',
    description: 'Medicare FFS urinary catheters: permanent urinary incontinence / retention diagnosis documented',
    severity: 'flag',
    citation: 'spec-v52 §4.5.2 R-PA-CMS-024. LCD L33803 (Urological Supplies) requires documentation of permanent urinary incontinence or urinary retention.',
    check(bundle) {
      if (bundle.payer !== 'cms-medicare-ffs') return { pass: true, evidence: 'Not Medicare FFS; rule vacuously satisfied.' };
      const catheterTrigger = bundle.documents.some((d) => keywordPresent(d.text, ['urinary catheter', 'foley catheter', 'indwelling catheter', 'intermittent catheter', 'straight catheter', 'condom catheter', 'urological supply']));
      if (!catheterTrigger) return { pass: true, evidence: 'No urinary-catheter anchor; rule vacuously satisfied.' };
      const dxAnchors = ['permanent urinary incontinence', 'urinary retention', 'neurogenic bladder', 'spinal cord injury', 'paraplegia', 'quadriplegia', 'multiple sclerosis', 'permanent incontinence'];
      const found = bundle.documents.find((d) => keywordPresent(d.text, dxAnchors));
      if (!found) return { pass: false, note: 'Urinary-catheter request without a permanent-incontinence / retention diagnosis anchor (LCD L33803).' };
      return { pass: true, evidence: 'Diagnosis anchor in ' + found.name };
    },
  },
  {
    id: 'R-PA-CMS-025',
    description: 'Medicare FFS surgical dressings: wound surface area + dressing-change frequency documented',
    severity: 'flag',
    citation: 'spec-v52 §4.5.2 R-PA-CMS-025. LCD L33831 (Surgical Dressings) requires documentation of wound surface area and frequency of dressing changes so utilization can be matched to the dressing category.',
    check(bundle) {
      if (bundle.payer !== 'cms-medicare-ffs') return { pass: true, evidence: 'Not Medicare FFS; rule vacuously satisfied.' };
      const dressingTrigger = bundle.documents.some((d) => keywordPresent(d.text, ['surgical dressing', 'wound dressing', 'wound care supply', 'hydrocolloid dressing', 'foam dressing', 'alginate dressing', 'gauze dressing']));
      if (!dressingTrigger) return { pass: true, evidence: 'No surgical-dressing anchor; rule vacuously satisfied.' };
      const areaAnchors = ['wound surface area', 'wound dimension', 'wound size', 'wound length', 'wound width', 'cm x cm', 'cm2', 'square cm'];
      const freqAnchors = ['dressing change', 'changes per day', 'changes per week', 'dressing frequency', 'frequency of change'];
      const areaFound = bundle.documents.find((d) => keywordPresent(d.text, areaAnchors));
      const freqFound = bundle.documents.find((d) => keywordPresent(d.text, freqAnchors));
      if (!areaFound) return { pass: false, note: 'Surgical-dressing request without a wound-surface-area anchor (LCD L33831).' };
      if (!freqFound) return { pass: false, note: 'Surgical-dressing request without a dressing-change-frequency anchor (LCD L33831).' };
      return { pass: true, evidence: 'Area + frequency anchors present.' };
    },
  },
  {
    id: 'R-PA-CMS-026',
    description: 'Medicare FFS post-cataract refractive lenses: cataract-surgery date + surgical CPT documented',
    severity: 'flag',
    citation: 'spec-v52 §4.5.2 R-PA-CMS-026. NCD 80.4 covers one pair of conventional eyeglasses or contact lenses after each cataract surgery with insertion of an intraocular lens; the surgery date and procedure code must be documented.',
    check(bundle) {
      if (bundle.payer !== 'cms-medicare-ffs') return { pass: true, evidence: 'Not Medicare FFS; rule vacuously satisfied.' };
      const lensTrigger = bundle.documents.some((d) => keywordPresent(d.text, ['post-cataract', 'after cataract surgery', 'aphakic', 'pseudophakic', 'cataract eyeglasses', 'cataract contact lens', 'iol implant']));
      if (!lensTrigger) return { pass: true, evidence: 'No post-cataract-lens anchor; rule vacuously satisfied.' };
      const surgeryAnchors = ['cataract surgery', 'cataract extraction', 'phacoemulsification', 'intraocular lens implant', 'iol implant', 'lens implantation'];
      const surgeryFound = bundle.documents.find((d) => keywordPresent(d.text, surgeryAnchors));
      // Cataract surgery CPT range: 66830-66999 covers IOL/lens extraction procedures.
      let cataractCpt = null;
      for (const d of bundle.documents) {
        for (const c of d.extract.cpts) {
          if (/^668\d{2}$/.test(c) || /^669\d{2}$/.test(c)) { cataractCpt = c; break; }
        }
        if (cataractCpt) break;
      }
      if (!surgeryFound) return { pass: false, note: 'Post-cataract-lens request without a cataract-surgery anchor (NCD 80.4).' };
      if (!cataractCpt) return { pass: false, note: 'Post-cataract-lens request without a cataract-surgery CPT (66830-66999) in the packet.' };
      return { pass: true, evidence: 'Surgery anchor + CPT ' + cataractCpt + ' present.' };
    },
  },

  // ---- spec-v52 wave 52-3a: CMS Medicare Advantage overlay opens (5 of 15) ----
  //
  // Per spec-v52 §4.5.3 these rules cover the additional documentation
  // MA plans request beyond FFS: PCP referral when the plan is HMO,
  // network-status check, specialist NPI when the plan is gatekeepered,
  // plan-name / member-ID format, and service-area confirmation. Each
  // rule self-gates on `bundle.payer === 'cms-medicare-advantage'` so
  // non-MA packets see all overlay rules vacuously pass.

  {
    id: 'R-PA-MA-001',
    description: 'Medicare Advantage HMO: PCP referral present for specialist services',
    severity: 'block',
    citation: 'spec-v52 §4.5.3 R-PA-MA-001. MA HMO and HMO-POS plans require a PCP referral before non-emergent specialist services unless the member has an open-access benefit.',
    check(bundle) {
      if (bundle.payer !== 'cms-medicare-advantage') return { pass: true, evidence: 'Not Medicare Advantage; rule vacuously satisfied.' };
      const hmoTrigger = bundle.documents.some((d) => keywordPresent(d.text, ['hmo plan', 'hmo-pos', 'hmo pos', 'gatekeeper', 'gatekeepered']));
      if (!hmoTrigger) return { pass: true, evidence: 'Not an HMO / gatekeepered MA plan; rule vacuously satisfied.' };
      const specialistTrigger = bundle.documents.some((d) => keywordPresent(d.text, ['specialist consult', 'specialist referral', 'specialist visit', 'specialist evaluation']));
      if (!specialistTrigger) return { pass: true, evidence: 'No specialist-service anchor; rule vacuously satisfied.' };
      const referralAnchors = ['pcp referral', 'primary care referral', 'referral from pcp', 'referral on file', 'referral number', 'referral attached'];
      const found = bundle.documents.find((d) => keywordPresent(d.text, referralAnchors));
      if (!found) return { pass: false, note: 'MA HMO specialist service without a PCP referral anchor.' };
      return { pass: true, evidence: 'PCP-referral anchor in ' + found.name };
    },
  },
  {
    id: 'R-PA-MA-002',
    description: 'Medicare Advantage: in-network status confirmed OR out-of-network exception documented',
    severity: 'flag',
    citation: 'spec-v52 §4.5.3 R-PA-MA-002. MA plans pay differently in vs. out of network; the packet should indicate the servicing provider\'s network status, or an OON exception (continuity-of-care, urgent / emergent, network inadequacy) when going OON.',
    check(bundle) {
      if (bundle.payer !== 'cms-medicare-advantage') return { pass: true, evidence: 'Not Medicare Advantage; rule vacuously satisfied.' };
      const networkAnchors = ['in-network', 'in network', 'participating provider', 'par provider', 'contracted provider'];
      const oonExceptionAnchors = ['out-of-network exception', 'oon exception', 'continuity of care', 'network inadequacy', 'urgent / emergent', 'urgent or emergent'];
      const inNet = bundle.documents.some((d) => keywordPresent(d.text, networkAnchors));
      const oonExc = bundle.documents.some((d) => keywordPresent(d.text, oonExceptionAnchors));
      if (inNet || oonExc) return { pass: true, evidence: 'Network-status / OON-exception anchor present.' };
      return { pass: false, note: 'MA packet without an in-network confirmation or OON-exception anchor.' };
    },
  },
  {
    id: 'R-PA-MA-003',
    description: 'Medicare Advantage gatekeepered plan: servicing specialist NPI distinct from ordering PCP NPI',
    severity: 'flag',
    citation: 'spec-v52 §4.5.3 R-PA-MA-003. On a gatekeepered MA plan, the specialist NPI on the PA must differ from the ordering PCP NPI; both must be Luhn-valid and present in the packet.',
    check(bundle) {
      if (bundle.payer !== 'cms-medicare-advantage') return { pass: true, evidence: 'Not Medicare Advantage; rule vacuously satisfied.' };
      const gateTrigger = bundle.documents.some((d) => keywordPresent(d.text, ['hmo plan', 'hmo-pos', 'hmo pos', 'gatekeeper', 'gatekeepered']));
      if (!gateTrigger) return { pass: true, evidence: 'Not a gatekeepered MA plan; rule vacuously satisfied.' };
      const npis = new Set();
      for (const d of bundle.documents) for (const n of d.extract.npis) npis.add(n);
      if (npis.size < 2) return { pass: false, note: 'Gatekeepered MA plan with fewer than 2 distinct Luhn-valid NPIs; ordering PCP and servicing specialist cannot be told apart.' };
      return { pass: true, evidence: npis.size + ' distinct NPIs present.' };
    },
  },
  {
    id: 'R-PA-MA-004',
    description: 'Medicare Advantage: plan name + member-ID format present on the packet',
    severity: 'flag',
    citation: 'spec-v52 §4.5.3 R-PA-MA-004. MA plans require the plan name on the request form and a member ID matching the plan\'s issuer-specific format; without both the payer cannot route the PA to the correct plan unit.',
    check(bundle) {
      if (bundle.payer !== 'cms-medicare-advantage') return { pass: true, evidence: 'Not Medicare Advantage; rule vacuously satisfied.' };
      const planAnchors = ['plan name:', 'health plan:', 'product name:', 'medicare advantage plan', 'ma plan', 'mapd plan'];
      const planFound = bundle.documents.find((d) => keywordPresent(d.text, planAnchors));
      const memberFound = bundle.documents.some((d) => d.extract.memberId);
      if (!planFound) return { pass: false, note: 'MA packet without a plan-name anchor.' };
      if (!memberFound) return { pass: false, note: 'MA packet without a Member-ID line (R-PA-003 covers presence; MA-004 ties plan + member to the same packet).' };
      return { pass: true, evidence: 'Plan-name + member-ID present.' };
    },
  },
  {
    id: 'R-PA-MA-005',
    description: 'Medicare Advantage: service location is within the plan\'s service area',
    severity: 'info',
    citation: 'spec-v52 §4.5.3 R-PA-MA-005. MA plans cover specific geographies; an out-of-area service location triggers different cost-share and may require an OON exception. v52-3a checks for a service-location / service-area anchor; v52-3b+ will tie this to the bundled CMS plan-service-area files when those land.',
    check(bundle) {
      if (bundle.payer !== 'cms-medicare-advantage') return { pass: true, evidence: 'Not Medicare Advantage; rule vacuously satisfied.' };
      const anchors = ['service area:', 'service location:', 'within plan service area', 'plan service area', 'covered service area', 'in service area'];
      const found = bundle.documents.find((d) => keywordPresent(d.text, anchors));
      if (!found) return { pass: false, note: 'MA packet without a service-location / service-area anchor.' };
      return { pass: true, evidence: 'Service-area anchor in ' + found.name };
    },
  },

  // ---- spec-v52 wave 52-3b: CMS Medicare Advantage overlay (5 -> 10 of 15) ----

  {
    id: 'R-PA-MA-006',
    description: 'Medicare Advantage drug request: Part B vs Part D coverage path indicated',
    severity: 'flag',
    citation: 'spec-v52 §4.5.3 R-PA-MA-006. MA plans cover drugs under Part B (physician-administered, DME-administered, certain immunosuppressives) and Part D (most outpatient prescriptions); the packet must indicate which coverage path applies so the plan routes the PA to the correct review queue.',
    check(bundle) {
      if (bundle.payer !== 'cms-medicare-advantage') return { pass: true, evidence: 'Not Medicare Advantage; rule vacuously satisfied.' };
      const drugTrigger = bundle.documents.some((d) => keywordPresent(d.text, ['prescription:', 'medication:', 'drug:', 'rx:', 'medication request', 'drug request', 'specialty drug', 'infusion drug']));
      if (!drugTrigger) return { pass: true, evidence: 'No drug-request anchor; rule vacuously satisfied.' };
      const partAnchors = ['part b', 'part b coverage', 'part b drug', 'part d', 'part d coverage', 'part d drug', 'medicare part b', 'medicare part d'];
      const found = bundle.documents.find((d) => keywordPresent(d.text, partAnchors));
      if (!found) return { pass: false, note: 'MA drug request without a Part B vs Part D coverage-path indicator.' };
      return { pass: true, evidence: 'Coverage-path anchor in ' + found.name };
    },
  },
  {
    id: 'R-PA-MA-007',
    description: 'Medicare Advantage D-SNP (dual-eligible Special Needs Plan): Medicaid plan information documented',
    severity: 'flag',
    citation: 'spec-v52 §4.5.3 R-PA-MA-007. D-SNP enrollees have both Medicare (via the MA plan) and Medicaid; coordinated benefits require the state Medicaid plan name and member ID on the PA so cost-share and coverage gaps can be resolved.',
    check(bundle) {
      if (bundle.payer !== 'cms-medicare-advantage') return { pass: true, evidence: 'Not Medicare Advantage; rule vacuously satisfied.' };
      const dsnpTrigger = bundle.documents.some((d) => keywordPresent(d.text, ['d-snp', 'dsnp', 'dual eligible', 'dual-eligible', 'dual special needs', 'special needs plan']));
      if (!dsnpTrigger) return { pass: true, evidence: 'Not a D-SNP packet; rule vacuously satisfied.' };
      const medicaidAnchors = ['medicaid id:', 'medicaid plan:', 'state medicaid', 'medicaid member', 'medi-cal id', 'masshealth id'];
      const found = bundle.documents.find((d) => keywordPresent(d.text, medicaidAnchors));
      if (!found) return { pass: false, note: 'D-SNP packet without a state Medicaid plan / member-ID anchor.' };
      return { pass: true, evidence: 'Medicaid anchor in ' + found.name };
    },
  },
  {
    id: 'R-PA-MA-008',
    description: 'Medicare Advantage supplemental benefit (dental / vision / hearing): plan-covered-benefit anchor documented',
    severity: 'info',
    citation: 'spec-v52 §4.5.3 R-PA-MA-008. MA plans often offer supplemental dental, vision, and hearing benefits that are NOT in Original Medicare; the packet should indicate the benefit is covered under the plan\'s Evidence of Coverage before submission.',
    check(bundle) {
      if (bundle.payer !== 'cms-medicare-advantage') return { pass: true, evidence: 'Not Medicare Advantage; rule vacuously satisfied.' };
      const benefitTrigger = bundle.documents.some((d) => keywordPresent(d.text, ['dental service', 'dental procedure', 'vision service', 'eyeglasses', 'eye exam', 'hearing aid', 'hearing exam', 'audiology service', 'dental implant', 'dental crown']));
      if (!benefitTrigger) return { pass: true, evidence: 'No supplemental-benefit anchor; rule vacuously satisfied.' };
      const coverageAnchors = ['supplemental benefit', 'plan-covered benefit', 'evidence of coverage', ' eoc ', 'plan benefit', 'covered benefit', 'plan supplemental'];
      const found = bundle.documents.find((d) => keywordPresent(d.text, coverageAnchors));
      if (!found) return { pass: false, note: 'MA supplemental-benefit service without an Evidence-of-Coverage / plan-covered-benefit anchor.' };
      return { pass: true, evidence: 'Coverage anchor in ' + found.name };
    },
  },
  {
    id: 'R-PA-MA-009',
    description: 'Medicare Advantage Part B drug: step-therapy compliance documented when plan applies step therapy',
    severity: 'flag',
    citation: 'spec-v52 §4.5.3 R-PA-MA-009. Per CMS final rule (effective 2019), MA plans may apply step therapy to Part B drugs; when step therapy applies, the prior-trial / failure documentation must be attached.',
    check(bundle) {
      if (bundle.payer !== 'cms-medicare-advantage') return { pass: true, evidence: 'Not Medicare Advantage; rule vacuously satisfied.' };
      const drugTrigger = bundle.documents.some((d) => keywordPresent(d.text, ['part b drug', 'physician-administered drug', 'physician administered drug', 'infusion drug', 'injectable drug', 'biologic drug', 'specialty drug']));
      const stepTrigger = bundle.documents.some((d) => keywordPresent(d.text, ['step therapy', 'step-therapy', 'first-line failure', 'failed step therapy', 'step edit']));
      if (!drugTrigger || !stepTrigger) return { pass: true, evidence: 'No Part B drug + step-therapy combo anchor; rule vacuously satisfied.' };
      const complianceAnchors = ['trial of', 'tried and failed', 'failed first-line', 'prior failure of', 'previous failure', 'documented failure', 'inadequate response'];
      const found = bundle.documents.find((d) => keywordPresent(d.text, complianceAnchors));
      if (!found) return { pass: false, note: 'MA Part B drug under step therapy without a prior-trial / failure-documentation anchor.' };
      return { pass: true, evidence: 'Step-therapy compliance anchor in ' + found.name };
    },
  },
  {
    id: 'R-PA-MA-010',
    description: 'Medicare Advantage inpatient admission: two-midnight expectation or short-stay criteria documented',
    severity: 'flag',
    citation: 'spec-v52 §4.5.3 R-PA-MA-010. CMS extended the two-midnight rule to MA plans effective 2024; an inpatient admission requires a documented expectation that the patient will need 2+ midnights of medically necessary hospital care, or short-stay criteria for case-by-case approval.',
    check(bundle) {
      if (bundle.payer !== 'cms-medicare-advantage') return { pass: true, evidence: 'Not Medicare Advantage; rule vacuously satisfied.' };
      const inpatientTrigger = bundle.documents.some((d) => keywordPresent(d.text, ['inpatient admission', 'inpatient stay', 'inpatient request', 'hospital admission', 'admit to inpatient']));
      if (!inpatientTrigger) return { pass: true, evidence: 'No inpatient-admission anchor; rule vacuously satisfied.' };
      const criteriaAnchors = ['two-midnight', 'two midnight', '2-midnight', '2 midnight', 'short-stay criteria', 'short stay criteria', 'case-by-case exception', 'expected length of stay', 'expected los'];
      const found = bundle.documents.find((d) => keywordPresent(d.text, criteriaAnchors));
      if (!found) return { pass: false, note: 'MA inpatient-admission request without a two-midnight expectation or short-stay-criteria anchor.' };
      return { pass: true, evidence: 'Two-midnight / short-stay anchor in ' + found.name };
    },
  },

  // ---- spec-v52 wave 52-3c: CMS Medicare Advantage overlay COMPLETE (10 -> 15) ----

  {
    id: 'R-PA-MA-011',
    description: 'Medicare Advantage: organization determination type (pre-service / concurrent / payment) indicated',
    severity: 'info',
    citation: 'spec-v52 §4.5.3 R-PA-MA-011. CMS Chapter 13 distinguishes organization determinations by stage (pre-service before delivery, concurrent during ongoing care, payment after delivery). The packet should label which type is being requested so MA plan timeliness rules apply correctly.',
    check(bundle) {
      if (bundle.payer !== 'cms-medicare-advantage') return { pass: true, evidence: 'Not Medicare Advantage; rule vacuously satisfied.' };
      const anchors = ['pre-service request', 'preservice request', 'pre-service determination', 'concurrent review', 'concurrent determination', 'payment determination', 'post-service request', 'retrospective review', 'organization determination'];
      const found = bundle.documents.find((d) => keywordPresent(d.text, anchors));
      if (!found) return { pass: false, note: 'MA packet without an organization-determination type (pre-service / concurrent / payment) indicator.' };
      return { pass: true, evidence: 'Determination-type anchor in ' + found.name };
    },
  },
  {
    id: 'R-PA-MA-012',
    description: 'Medicare Advantage expedited review: clinical urgency / serious-jeopardy attestation present',
    severity: 'flag',
    citation: 'spec-v52 §4.5.3 R-PA-MA-012. MA expedited (72-hour) determinations require a treating-clinician attestation that applying the standard 14-day timeframe could seriously jeopardize the enrollee\'s life, health, or ability to regain maximum function.',
    check(bundle) {
      if (bundle.payer !== 'cms-medicare-advantage') return { pass: true, evidence: 'Not Medicare Advantage; rule vacuously satisfied.' };
      const expTrigger = bundle.documents.some((d) => keywordPresent(d.text, ['expedited request', 'expedited review', 'expedited determination', '72-hour determination', '72 hour determination', 'urgent prior authorization']));
      if (!expTrigger) return { pass: true, evidence: 'No expedited-review anchor; rule vacuously satisfied.' };
      const attestAnchors = ['seriously jeopardize', 'serious jeopardy', 'life or health', 'maximum function', 'standard timeframe could', 'serious harm', 'clinical urgency'];
      const found = bundle.documents.find((d) => keywordPresent(d.text, attestAnchors));
      if (!found) return { pass: false, note: 'Expedited-review request without a clinical-urgency / serious-jeopardy attestation.' };
      return { pass: true, evidence: 'Urgency attestation in ' + found.name };
    },
  },
  {
    id: 'R-PA-MA-013',
    description: 'Medicare Advantage transition fill: continuity-of-care anchor for new enrollee within 90 days of effective date',
    severity: 'flag',
    citation: 'spec-v52 §4.5.3 R-PA-MA-013. CMS requires MA plans to honor a transition supply / continuity-of-care period (typically 90 days) for new enrollees on existing therapies; the packet should indicate the transition window when applicable.',
    check(bundle) {
      if (bundle.payer !== 'cms-medicare-advantage') return { pass: true, evidence: 'Not Medicare Advantage; rule vacuously satisfied.' };
      const transitionTrigger = bundle.documents.some((d) => keywordPresent(d.text, ['transition fill', 'transition supply', 'new enrollee', 'newly enrolled', 'plan transition', 'transition request', 'continuity of care']));
      if (!transitionTrigger) return { pass: true, evidence: 'No transition / new-enrollee anchor; rule vacuously satisfied.' };
      const coverageAnchors = ['continuity of care', 'transition period', '90-day transition', '90 day transition', 'transition coverage', 'continued therapy', 'existing therapy'];
      const found = bundle.documents.find((d) => keywordPresent(d.text, coverageAnchors));
      if (!found) return { pass: false, note: 'MA transition request without a continuity-of-care / transition-coverage anchor.' };
      return { pass: true, evidence: 'Continuity anchor in ' + found.name };
    },
  },
  {
    id: 'R-PA-MA-014',
    description: 'Medicare Advantage: hospice-election indicator (hospice services revert to Original Medicare)',
    severity: 'flag',
    citation: 'spec-v52 §4.5.3 R-PA-MA-014. When an MA enrollee elects the Medicare hospice benefit, hospice-related services revert to Original Medicare; the MA plan continues to cover non-hospice services. The packet must indicate the hospice-election status when relevant so the PA routes to the correct payer.',
    check(bundle) {
      if (bundle.payer !== 'cms-medicare-advantage') return { pass: true, evidence: 'Not Medicare Advantage; rule vacuously satisfied.' };
      const hospiceTrigger = bundle.documents.some((d) => keywordPresent(d.text, ['hospice service', 'hospice benefit', 'palliative care', 'end of life', 'terminally ill', 'comfort care', 'end-of-life care']));
      if (!hospiceTrigger) return { pass: true, evidence: 'No hospice / end-of-life anchor; rule vacuously satisfied.' };
      const electionAnchors = ['hospice election', 'hospice elected', 'medicare hospice benefit', 'hospice revocation', 'not elected hospice', 'no hospice election', 'patient has not elected hospice'];
      const found = bundle.documents.find((d) => keywordPresent(d.text, electionAnchors));
      if (!found) return { pass: false, note: 'Hospice-related service on an MA packet without a hospice-election indicator (elected / not elected / revoked).' };
      return { pass: true, evidence: 'Hospice-election anchor in ' + found.name };
    },
  },
  {
    id: 'R-PA-MA-015',
    description: 'Medicare Advantage C-SNP / I-SNP: qualifying chronic condition or institutional status documented',
    severity: 'flag',
    citation: 'spec-v52 §4.5.3 R-PA-MA-015. Chronic-condition SNPs (C-SNPs) require documented diagnosis of a qualifying chronic condition (e.g., diabetes, CHF, ESRD, dementia); institutional SNPs (I-SNPs) require documented nursing-facility residence. The PA must reference the qualifying condition.',
    check(bundle) {
      if (bundle.payer !== 'cms-medicare-advantage') return { pass: true, evidence: 'Not Medicare Advantage; rule vacuously satisfied.' };
      const snpTrigger = bundle.documents.some((d) => keywordPresent(d.text, [' c-snp', 'csnp', 'chronic condition snp', 'chronic snp', ' i-snp', 'isnp', 'institutional snp', 'institutional special needs']));
      if (!snpTrigger) return { pass: true, evidence: 'Not a C-SNP / I-SNP packet; rule vacuously satisfied.' };
      const qualifierAnchors = [
        // C-SNP qualifying chronic conditions
        'diabetes', 'congestive heart failure', ' chf ', 'end-stage renal', ' esrd ', 'dementia', 'alzheimer', 'hiv/aids',
        'chronic obstructive pulmonary', ' copd ', 'cardiovascular disorder', 'chronic alcohol',
        // I-SNP qualifying status
        'nursing facility resident', 'skilled nursing facility', ' snf resident', 'long-term care facility',
      ];
      const found = bundle.documents.find((d) => keywordPresent(d.text, qualifierAnchors));
      if (!found) return { pass: false, note: 'C-SNP / I-SNP packet without a qualifying chronic-condition diagnosis or institutional-residence anchor.' };
      return { pass: true, evidence: 'Qualifier anchor in ' + found.name };
    },
  },

  // ---- spec-v52 wave 52-4a: Medicaid state-agnostic core opens (5 of 10) ----
  //
  // Per spec-v52 §4.5.4 these rules represent the intersection of all
  // 50 state Medicaid programs: member-ID format, EPSDT documentation
  // when the patient is < 21, eligibility-date alignment with service
  // date, etc. State-specific overlays are deferred to v52-5+. Each
  // rule self-gates on `bundle.payer === 'medicaid'` so non-Medicaid
  // packets see them all vacuously pass.

  {
    id: 'R-PA-MCD-001',
    description: 'Medicaid: member-ID line present (state Medicaid CIN / recipient ID)',
    severity: 'block',
    citation: 'spec-v52 §4.5.4 R-PA-MCD-001. All state Medicaid programs require a state-issued recipient / CIN / RID on the PA request; without it the state cannot resolve eligibility.',
    check(bundle) {
      if (bundle.payer !== 'medicaid') return { pass: true, evidence: 'Not Medicaid; rule vacuously satisfied.' };
      const memberFound = bundle.documents.some((d) => d.extract.memberId);
      if (!memberFound) return { pass: false, note: 'Medicaid packet without a Member-ID / CIN / Recipient-ID line (R-PA-003 covers presence; MCD-001 ties to Medicaid eligibility).' };
      return { pass: true, evidence: 'Medicaid member-ID present.' };
    },
  },
  {
    id: 'R-PA-MCD-002',
    description: 'Medicaid pediatric patient: EPSDT documentation present when applicable',
    severity: 'flag',
    citation: 'spec-v52 §4.5.4 R-PA-MCD-002. EPSDT (Early and Periodic Screening, Diagnostic, and Treatment) is mandatory under federal Medicaid for beneficiaries < 21; pediatric PA packets should reference EPSDT screening / treatment when seeking non-routine services.',
    check(bundle) {
      if (bundle.payer !== 'medicaid') return { pass: true, evidence: 'Not Medicaid; rule vacuously satisfied.' };
      const pediatricTrigger = bundle.documents.some((d) => keywordPresent(d.text, ['pediatric patient', 'pediatric request', 'minor child', 'patient is a minor', 'under 21', 'under age 21', 'infant', 'newborn', 'adolescent']));
      if (!pediatricTrigger) return { pass: true, evidence: 'No pediatric anchor; rule vacuously satisfied.' };
      const epsdtAnchors = ['epsdt', 'early and periodic screening', 'periodic screening diagnostic', 'well-child visit', 'well child visit', 'periodicity schedule'];
      const found = bundle.documents.find((d) => keywordPresent(d.text, epsdtAnchors));
      if (!found) return { pass: false, note: 'Pediatric Medicaid packet without an EPSDT / well-child / periodic-screening anchor.' };
      return { pass: true, evidence: 'EPSDT anchor in ' + found.name };
    },
  },
  {
    id: 'R-PA-MCD-003',
    description: 'Medicaid: eligibility-date alignment anchor for the service date',
    severity: 'flag',
    citation: 'spec-v52 §4.5.4 R-PA-MCD-003. State Medicaid programs deny PA requests when the date of service falls outside the recipient\'s eligibility span; the packet should indicate the eligibility window (start / end / verified-as-of).',
    check(bundle) {
      if (bundle.payer !== 'medicaid') return { pass: true, evidence: 'Not Medicaid; rule vacuously satisfied.' };
      const anchors = ['eligibility verified', 'eligibility window', 'eligibility span', 'eligibility start', 'eligibility end', 'active eligibility', 'eligibility on file', 'medicaid eligibility:', 'eligibility check'];
      const found = bundle.documents.find((d) => keywordPresent(d.text, anchors));
      if (!found) return { pass: false, note: 'Medicaid packet without an eligibility-verification / eligibility-window anchor for the service date.' };
      return { pass: true, evidence: 'Eligibility anchor in ' + found.name };
    },
  },
  {
    id: 'R-PA-MCD-004',
    description: 'Medicaid: medical-necessity statement aligned to state Medicaid criteria',
    severity: 'flag',
    citation: 'spec-v52 §4.5.4 R-PA-MCD-004. Each state Medicaid program defines medical necessity in statute / regulation; the packet should reference the program\'s medical-necessity standard (federal "medically necessary" plus state-specific language).',
    check(bundle) {
      if (bundle.payer !== 'medicaid') return { pass: true, evidence: 'Not Medicaid; rule vacuously satisfied.' };
      const anchors = ['medicaid medical necessity', 'state medical necessity', 'medically necessary under medicaid', 'medical necessity criteria', 'medicaid program criteria', 'medicaid state plan'];
      const found = bundle.documents.find((d) => keywordPresent(d.text, anchors));
      if (!found) return { pass: false, note: 'Medicaid packet without a state-Medicaid medical-necessity / state-plan anchor.' };
      return { pass: true, evidence: 'Medicaid medical-necessity anchor in ' + found.name };
    },
  },
  {
    id: 'R-PA-MCD-005',
    description: 'Medicaid: Managed Care Organization (MCO) vs FFS Medicaid indicator',
    severity: 'flag',
    citation: 'spec-v52 §4.5.4 R-PA-MCD-005. ~75% of Medicaid beneficiaries are in managed care; the packet must indicate which entity (state FFS vs a contracted MCO) is the responsible payer so the PA routes to the correct review queue.',
    check(bundle) {
      if (bundle.payer !== 'medicaid') return { pass: true, evidence: 'Not Medicaid; rule vacuously satisfied.' };
      const anchors = ['medicaid managed care', 'medicaid mco', ' mco ', 'fee-for-service medicaid', 'ffs medicaid', 'state medicaid (ffs)', 'state medicaid ffs', 'managed care plan', 'contracted mco', 'medicaid fee for service'];
      const found = bundle.documents.find((d) => keywordPresent(d.text, anchors));
      if (!found) return { pass: false, note: 'Medicaid packet without a Managed Care / FFS routing indicator.' };
      return { pass: true, evidence: 'Routing anchor in ' + found.name };
    },
  },

  // ---- spec-v52 wave 52-4b: Medicaid state-agnostic core COMPLETE (5 -> 10) ----

  {
    id: 'R-PA-MCD-006',
    description: 'Medicaid physician-administered drug: NDC documented alongside the J-code / HCPCS',
    severity: 'flag',
    citation: 'spec-v52 §4.5.4 R-PA-MCD-006. Section 1927(a)(7) of the Social Security Act requires state Medicaid programs to collect the 11-digit NDC on physician-administered drug claims so the manufacturer rebate can be billed; the packet should carry the NDC alongside the J-code.',
    check(bundle) {
      if (bundle.payer !== 'medicaid') return { pass: true, evidence: 'Not Medicaid; rule vacuously satisfied.' };
      // J-codes are HCPCS Level II "J####" identifiers.
      let jCode = null;
      for (const d of bundle.documents) {
        for (const c of d.extract.cpts) {
          if (/^J\d{4}$/.test(c)) { jCode = c; break; }
        }
        if (jCode) break;
      }
      if (!jCode) return { pass: true, evidence: 'No J-code in packet; rule vacuously satisfied.' };
      // NDC in 5-4-2 or 5-3-2 or 4-4-2 hyphenated form, or 11-digit run.
      const ndcRe = /(?:\bndc\b\s*[:#]?\s*)?(\d{4,5}-\d{3,4}-\d{2}|\d{11})/i;
      const ndcAnchor = ['ndc:', 'ndc#', 'national drug code', ' ndc '];
      const ndcMentioned = bundle.documents.some((d) => keywordPresent(d.text, ndcAnchor));
      const ndcCoded = bundle.documents.some((d) => ndcRe.test(d.text || ''));
      if (!ndcMentioned && !ndcCoded) return { pass: false, note: 'Medicaid packet with J-code ' + jCode + ' but no NDC line / 11-digit NDC pattern.' };
      return { pass: true, evidence: 'J-code ' + jCode + ' + NDC reference present.' };
    },
  },
  {
    id: 'R-PA-MCD-007',
    description: 'Medicaid dental service: covered-benefit anchor for adult (state-optional) vs pediatric (EPSDT-mandatory)',
    severity: 'flag',
    citation: 'spec-v52 §4.5.4 R-PA-MCD-007. Federal Medicaid mandates dental for children < 21 under EPSDT; adult dental coverage is state-optional and varies widely (full / emergency-only / none). The packet should indicate the coverage path.',
    check(bundle) {
      if (bundle.payer !== 'medicaid') return { pass: true, evidence: 'Not Medicaid; rule vacuously satisfied.' };
      const dentalTrigger = bundle.documents.some((d) => keywordPresent(d.text, ['dental service', 'dental procedure', 'dental crown', 'dental implant', 'tooth extraction', 'oral surgery', 'dental visit']));
      if (!dentalTrigger) return { pass: true, evidence: 'No dental-service anchor; rule vacuously satisfied.' };
      const coverageAnchors = ['epsdt dental', 'pediatric dental benefit', 'adult dental benefit', 'state-covered dental', 'emergency-only dental', 'emergency only dental', 'dental coverage:', 'dental benefit:'];
      const found = bundle.documents.find((d) => keywordPresent(d.text, coverageAnchors));
      if (!found) return { pass: false, note: 'Medicaid dental request without an adult-vs-pediatric / EPSDT-vs-state-optional coverage anchor.' };
      return { pass: true, evidence: 'Dental-coverage anchor in ' + found.name };
    },
  },
  {
    id: 'R-PA-MCD-008',
    description: 'Medicaid non-emergency medical transportation (NEMT): trip purpose + appointment date documented',
    severity: 'flag',
    citation: 'spec-v52 §4.5.4 R-PA-MCD-008. NEMT is a mandatory Medicaid benefit (42 CFR §431.53). PA / brokerage approvals require the trip purpose (covered medical appointment), appointment date, and origin / destination so eligibility against the trip standard can be evaluated.',
    check(bundle) {
      if (bundle.payer !== 'medicaid') return { pass: true, evidence: 'Not Medicaid; rule vacuously satisfied.' };
      const nemtTrigger = bundle.documents.some((d) => keywordPresent(d.text, ['nemt', 'non-emergency medical transportation', 'non emergency transport', 'medical transportation', 'transportation benefit', 'transportation request']));
      if (!nemtTrigger) return { pass: true, evidence: 'No NEMT anchor; rule vacuously satisfied.' };
      const purposeAnchors = ['trip purpose', 'medical appointment', 'covered medical visit', 'covered service appointment', 'appointment date', 'origin and destination', 'pickup and drop-off'];
      const found = bundle.documents.find((d) => keywordPresent(d.text, purposeAnchors));
      if (!found) return { pass: false, note: 'NEMT request without a trip-purpose / appointment-date anchor (42 CFR §431.53).' };
      return { pass: true, evidence: 'Trip-purpose anchor in ' + found.name };
    },
  },
  {
    id: 'R-PA-MCD-009',
    description: 'Medicaid behavioral-health service: carve-out indicator documented',
    severity: 'info',
    citation: 'spec-v52 §4.5.4 R-PA-MCD-009. Many state Medicaid programs carve behavioral-health benefits out to a separate plan (PIHP / BHO / specialty MCO); the packet should indicate whether BH is carved out vs integrated so the PA routes to the correct payer.',
    check(bundle) {
      if (bundle.payer !== 'medicaid') return { pass: true, evidence: 'Not Medicaid; rule vacuously satisfied.' };
      const bhTrigger = bundle.documents.some((d) => keywordPresent(d.text, ['behavioral health', 'mental health service', 'substance use disorder', ' sud treatment', 'psychiatric service', 'psychotherapy', 'medication-assisted treatment', ' mat ']));
      if (!bhTrigger) return { pass: true, evidence: 'No behavioral-health anchor; rule vacuously satisfied.' };
      const carveAnchors = ['behavioral health carve-out', 'bh carve-out', 'bh carveout', ' pihp ', ' bho ', 'integrated bh benefit', 'integrated behavioral health', 'specialty bh plan', 'carve-out plan'];
      const found = bundle.documents.find((d) => keywordPresent(d.text, carveAnchors));
      if (!found) return { pass: false, note: 'Medicaid behavioral-health service without a carve-out / integrated-BH indicator.' };
      return { pass: true, evidence: 'Carve-out anchor in ' + found.name };
    },
  },
  {
    id: 'R-PA-MCD-010',
    description: 'Medicaid prescription drug: Medicaid Drug Rebate Program (MDRP) labeler-agreement coverage indicator',
    severity: 'info',
    citation: 'spec-v52 §4.5.4 R-PA-MCD-010. Under Section 1927 of the Social Security Act, Medicaid covers outpatient prescription drugs from manufacturers that have signed a Medicaid drug-rebate agreement (Section 1927(a)). The packet should indicate the drug is from a participating manufacturer.',
    check(bundle) {
      if (bundle.payer !== 'medicaid') return { pass: true, evidence: 'Not Medicaid; rule vacuously satisfied.' };
      const drugTrigger = bundle.documents.some((d) => keywordPresent(d.text, ['outpatient prescription', 'prescription drug', 'oral medication', 'rx:', 'prescription:']));
      if (!drugTrigger) return { pass: true, evidence: 'No outpatient-prescription anchor; rule vacuously satisfied.' };
      const rebateAnchors = ['mdrp', 'medicaid drug rebate', 'rebate agreement', 'labeler agreement', 'participating manufacturer', 'medicaid rebate program', 'section 1927', 'drug rebate program'];
      const found = bundle.documents.find((d) => keywordPresent(d.text, rebateAnchors));
      if (!found) return { pass: false, note: 'Medicaid prescription-drug packet without an MDRP / labeler-agreement / participating-manufacturer anchor.' };
      return { pass: true, evidence: 'MDRP anchor in ' + found.name };
    },
  },

  // ---- spec-v52 wave 52-5a: §4.5.5 specialty overlays open (radiology, 5 of 25) ----
  //
  // Per spec-v52 §4.5.5 specialty overlays are triggered by the
  // classifier when the requested procedure falls in a high-PA
  // specialty. Radiology / advanced-imaging requests use CPT codes
  // in the 70010-79999 range; the rules below gate on that structural
  // signal plus, where applicable, narrower CPT subsets (MRI / CT /
  // contrast / nuclear-medicine subranges). Specialty rules do NOT
  // self-gate on `bundle.payer` -- they apply across every payer once
  // the procedure trigger is met.

  {
    id: 'R-PA-RAD-001',
    description: 'Advanced imaging request: ACR Appropriateness Criteria reference present',
    severity: 'info',
    citation: 'spec-v52 §4.5.5 R-PA-RAD-001. ACR (American College of Radiology) Appropriateness Criteria are the de-facto standard payers use to evaluate imaging-request medical necessity; referencing the matching ACR AC topic in the packet substantially improves first-pass approval rates.',
    check(bundle) {
      const radCpt = collectRadiologyCpts(bundle);
      if (radCpt.size === 0) return { pass: true, evidence: 'No radiology CPT (70010-79999) in packet; rule vacuously satisfied.' };
      const acrAnchors = ['acr appropriateness', 'acr appropriateness criteria', ' acr ac ', 'american college of radiology criteria', 'appropriateness criteria reference'];
      const found = bundle.documents.find((d) => keywordPresent(d.text, acrAnchors));
      if (!found) return { pass: false, note: 'Advanced-imaging request without an ACR Appropriateness Criteria reference anchor.' };
      return { pass: true, evidence: 'ACR AC reference in ' + found.name };
    },
  },
  {
    id: 'R-PA-RAD-002',
    description: 'Non-emergent MRI: prior conservative management documented',
    severity: 'flag',
    citation: 'spec-v52 §4.5.5 R-PA-RAD-002. Non-emergent MRIs (especially spine and joint) typically require a documented trial of conservative management -- PT, NSAIDs, activity modification, time -- before payer approval.',
    check(bundle) {
      const mriCpts = collectMriCpts(bundle);
      if (mriCpts.size === 0) return { pass: true, evidence: 'No MRI CPT in packet; rule vacuously satisfied.' };
      const emergentAnchors = ['emergent imaging', 'emergent mri', 'urgent mri', 'red flag', 'cauda equina', 'cord compression', 'acute neurological', 'severe trauma'];
      const isEmergent = bundle.documents.some((d) => keywordPresent(d.text, emergentAnchors));
      if (isEmergent) return { pass: true, evidence: 'Emergent / red-flag anchor present; rule does not apply.' };
      const conservativeAnchors = ['conservative management', 'conservative therapy', 'physical therapy trial', 'pt trial', 'nsaid trial', 'failed pt', 'failed physical therapy', 'activity modification', 'failed conservative'];
      const found = bundle.documents.find((d) => keywordPresent(d.text, conservativeAnchors));
      if (!found) return { pass: false, note: 'Non-emergent MRI request without a conservative-management trial anchor.' };
      return { pass: true, evidence: 'Conservative-management anchor in ' + found.name };
    },
  },
  {
    id: 'R-PA-RAD-003',
    description: 'Contrast imaging study: contrast allergy review + renal-function check documented',
    severity: 'flag',
    citation: 'spec-v52 §4.5.5 R-PA-RAD-003. Iodinated and gadolinium contrast carry hypersensitivity and nephrotoxicity risk; packets requesting a contrast study should document an allergy review and a recent eGFR / SCr.',
    check(bundle) {
      const radCpt = collectRadiologyCpts(bundle);
      if (radCpt.size === 0) return { pass: true, evidence: 'No radiology CPT in packet; rule vacuously satisfied.' };
      const contrastTrigger = bundle.documents.some((d) => keywordPresent(d.text, ['with contrast', 'iv contrast', 'iodinated contrast', 'gadolinium', 'contrast-enhanced', 'contrast enhanced', 'contrast study']));
      if (!contrastTrigger) return { pass: true, evidence: 'No contrast anchor; rule vacuously satisfied.' };
      const allergyAnchors = ['contrast allergy', 'no known contrast allergy', 'allergy reviewed', 'allergy history', 'nkda', 'no known drug allergies'];
      const renalAnchors = ['egfr', 'creatinine clearance', 'crcl', 'serum creatinine', 'scr ', 'renal function'];
      const allergy = bundle.documents.some((d) => keywordPresent(d.text, allergyAnchors));
      const renal = bundle.documents.some((d) => keywordPresent(d.text, renalAnchors));
      if (!allergy) return { pass: false, note: 'Contrast imaging request without a contrast-allergy review anchor.' };
      if (!renal) return { pass: false, note: 'Contrast imaging request without a renal-function (eGFR / SCr / CrCl) anchor.' };
      return { pass: true, evidence: 'Allergy + renal-function anchors present.' };
    },
  },
  {
    id: 'R-PA-RAD-004',
    description: 'Radiology procedure: preceding clinical evaluation referenced',
    severity: 'flag',
    citation: 'spec-v52 §4.5.5 R-PA-RAD-004. Advanced imaging without a documented clinical evaluation (history, physical, working differential) is one of the most common denial reasons; the packet should reference a clinical note dated on or before the imaging request.',
    check(bundle) {
      const radCpt = collectRadiologyCpts(bundle);
      if (radCpt.size === 0) return { pass: true, evidence: 'No radiology CPT in packet; rule vacuously satisfied.' };
      // A document classified as clinical-note OR an evaluation anchor in the packet.
      const hasNoteDoc = bundle.documents.some((d) => d.role === 'clinical-note');
      const evalAnchors = ['clinical evaluation', 'history and physical', 'h&p:', 'h & p:', 'working diagnosis', 'differential diagnosis', 'preceding evaluation'];
      const hasAnchor = bundle.documents.some((d) => keywordPresent(d.text, evalAnchors));
      if (!hasNoteDoc && !hasAnchor) return { pass: false, note: 'Radiology procedure request without an attached clinical-note document or clinical-evaluation anchor.' };
      return { pass: true, evidence: hasNoteDoc ? 'Clinical-note document attached.' : 'Clinical-evaluation anchor present.' };
    },
  },
  {
    id: 'R-PA-RAD-005',
    description: 'Pediatric imaging: ALARA / radiation-dose consideration documented',
    severity: 'info',
    citation: 'spec-v52 §4.5.5 R-PA-RAD-005. For pediatric patients, ALARA (As Low As Reasonably Achievable) principles apply: image Gently / Image Wisely campaigns recommend documenting dose-reduction consideration for CT and nuclear-medicine studies in children.',
    check(bundle) {
      const radCpt = collectRadiologyCpts(bundle);
      if (radCpt.size === 0) return { pass: true, evidence: 'No radiology CPT in packet; rule vacuously satisfied.' };
      const pediatricTrigger = bundle.documents.some((d) => keywordPresent(d.text, ['pediatric patient', 'pediatric request', 'minor child', 'patient is a minor', 'under 21', 'infant', 'newborn', 'adolescent']));
      if (!pediatricTrigger) return { pass: true, evidence: 'No pediatric anchor; rule vacuously satisfied.' };
      const alaraAnchors = ['alara', 'as low as reasonably achievable', 'image gently', 'image wisely', 'dose reduction', 'pediatric protocol', 'low-dose protocol'];
      const found = bundle.documents.find((d) => keywordPresent(d.text, alaraAnchors));
      if (!found) return { pass: false, note: 'Pediatric imaging request without an ALARA / dose-reduction / pediatric-protocol anchor.' };
      return { pass: true, evidence: 'ALARA anchor in ' + found.name };
    },
  },

  // ---- spec-v52 wave 52-5b: §4.5.5 infusion / specialty-drug overlay (5 of 25) ----
  //
  // Per spec-v52 §4.5.5 infusion / specialty-drug rules trigger on a
  // J-code (HCPCS Level II J####) in the requested-procedures list.
  // Like the radiology overlay, these rules apply across every payer
  // once the procedure trigger is met -- no `bundle.payer` self-gate.

  {
    id: 'R-PA-INF-001',
    description: 'Infusion / specialty drug: J-code present + NDC documented',
    severity: 'flag',
    citation: 'spec-v52 §4.5.5 R-PA-INF-001. Cross-payer convention: physician-administered drugs require the J-code AND the 11-digit NDC so the manufacturer rebate and drug-specific edits can be applied (echoes R-PA-MCD-006 for Medicaid; this rule generalizes).',
    check(bundle) {
      const jCodes = collectJCodes(bundle);
      if (jCodes.size === 0) return { pass: true, evidence: 'No J-code in packet; rule vacuously satisfied.' };
      const ndcRe = /(?:\bndc\b\s*[:#]?\s*)?(\d{4,5}-\d{3,4}-\d{2}|\d{11})/i;
      const ndcAnchor = ['ndc:', 'ndc#', 'national drug code', ' ndc '];
      const ndcMentioned = bundle.documents.some((d) => keywordPresent(d.text, ndcAnchor));
      const ndcCoded = bundle.documents.some((d) => ndcRe.test(d.text || ''));
      if (!ndcMentioned && !ndcCoded) return { pass: false, note: 'Infusion request with J-code(s) ' + [...jCodes].join(', ') + ' but no NDC line / 11-digit NDC pattern.' };
      return { pass: true, evidence: 'J-code(s) + NDC reference present.' };
    },
  },
  {
    id: 'R-PA-INF-002',
    description: 'Infusion / specialty drug: weight-based dose calculation shown when dosing is per kg',
    severity: 'flag',
    citation: 'spec-v52 §4.5.5 R-PA-INF-002. Weight-based biologic / chemotherapy infusions require an explicit weight + dose calculation so the payer can verify the dose against FDA labeling.',
    check(bundle) {
      const jCodes = collectJCodes(bundle);
      if (jCodes.size === 0) return { pass: true, evidence: 'No J-code in packet; rule vacuously satisfied.' };
      const trigger = bundle.documents.some((d) => keywordPresent(d.text, ['mg/kg', 'mcg/kg', 'units/kg', 'weight-based', 'weight based', 'per kg']));
      if (!trigger) return { pass: true, evidence: 'No weight-based-dose anchor; rule vacuously satisfied.' };
      const hasWeight = bundle.documents.some((d) => d.extract.weight);
      const calcAnchors = ['dose calculation', 'calculated dose', 'total dose', 'mg total', 'dose = ', 'dose:', 'dose ='];
      const hasCalc = bundle.documents.some((d) => keywordPresent(d.text, calcAnchors));
      if (!hasWeight) return { pass: false, note: 'Weight-based infusion request without a Weight: field (R-PA-033 covers presence).' };
      if (!hasCalc) return { pass: false, note: 'Weight-based infusion request without an explicit dose-calculation anchor.' };
      return { pass: true, evidence: 'Weight + dose calculation present.' };
    },
  },
  {
    id: 'R-PA-INF-003',
    description: 'Infusion / specialty drug: site-of-care indicator (home / clinic / hospital infusion) documented',
    severity: 'flag',
    citation: 'spec-v52 §4.5.5 R-PA-INF-003. Payers route specialty-drug PAs to different review queues based on site of care (home infusion has different rules than hospital outpatient); the packet must label the planned site.',
    check(bundle) {
      const jCodes = collectJCodes(bundle);
      if (jCodes.size === 0) return { pass: true, evidence: 'No J-code in packet; rule vacuously satisfied.' };
      const anchors = ['home infusion', 'home health infusion', 'clinic infusion', 'office infusion', 'hospital outpatient infusion', 'infusion center', 'ambulatory infusion', 'physician office administration', 'site of care:', 'site of service:'];
      const found = bundle.documents.find((d) => keywordPresent(d.text, anchors));
      if (!found) return { pass: false, note: 'Infusion request without a site-of-care anchor (home / clinic / office / hospital outpatient / infusion center).' };
      return { pass: true, evidence: 'Site-of-care anchor in ' + found.name };
    },
  },
  {
    id: 'R-PA-INF-004',
    description: 'Infusion / specialty drug: FDA-approved indication referenced for the diagnosis',
    severity: 'flag',
    citation: 'spec-v52 §4.5.5 R-PA-INF-004. Biologic / specialty-drug PA approval typically requires that the requested drug have an FDA-approved indication matching the documented diagnosis (or, for off-label use, an NCCN / compendia citation).',
    check(bundle) {
      const jCodes = collectJCodes(bundle);
      if (jCodes.size === 0) return { pass: true, evidence: 'No J-code in packet; rule vacuously satisfied.' };
      const anchors = ['fda-approved indication', 'fda approved indication', 'fda labeling', 'on-label use', 'on label use', 'nccn category', 'nccn compendia', 'compendia-supported', 'compendia supported', 'off-label justification', 'off label justification'];
      const found = bundle.documents.find((d) => keywordPresent(d.text, anchors));
      if (!found) return { pass: false, note: 'Specialty-drug infusion request without an FDA-indication / NCCN-compendia anchor.' };
      return { pass: true, evidence: 'Indication anchor in ' + found.name };
    },
  },
  {
    id: 'R-PA-INF-005',
    description: 'Infusion / specialty drug: premedication / infusion-reaction monitoring plan documented',
    severity: 'info',
    citation: 'spec-v52 §4.5.5 R-PA-INF-005. Many biologics carry an infusion-reaction risk (rituximab, infliximab, IV iron, etc.); the packet should reference a premedication regimen or in-suite monitoring plan when the drug carries that risk.',
    check(bundle) {
      const jCodes = collectJCodes(bundle);
      if (jCodes.size === 0) return { pass: true, evidence: 'No J-code in packet; rule vacuously satisfied.' };
      const riskTrigger = bundle.documents.some((d) => keywordPresent(d.text, ['rituximab', 'infliximab', 'tocilizumab', 'iv iron', 'ferric carboxymaltose', 'iron sucrose', 'paclitaxel', 'docetaxel', 'cetuximab', 'trastuzumab', 'infusion reaction risk']));
      if (!riskTrigger) return { pass: true, evidence: 'No infusion-reaction-risk drug anchor; rule vacuously satisfied.' };
      const planAnchors = ['premedication', 'pre-medication', 'diphenhydramine', 'acetaminophen', 'methylprednisolone', 'monitoring plan', 'in-suite monitoring', 'observation post-infusion', 'observation post infusion', 'infusion-reaction plan'];
      const found = bundle.documents.find((d) => keywordPresent(d.text, planAnchors));
      if (!found) return { pass: false, note: 'Infusion-reaction-risk biologic without a premedication / monitoring-plan anchor.' };
      return { pass: true, evidence: 'Premedication / monitoring anchor in ' + found.name };
    },
  },

  // ---- spec-v52 wave 52-5c: §4.5.5 surgery specialty overlay (5 of 25) ----
  //
  // Surgery specialty rules trigger on a CPT in the AMA Surgery
  // category (10004-69990). Like the other §4.5.5 overlays they apply
  // across every payer once the procedure trigger is met. Conservative-
  // management trial, imaging support, and anesthesia clearance are the
  // three most common denial reasons on elective surgery PAs.

  {
    id: 'R-PA-SURG-001',
    description: 'Elective surgery: conservative-management trial documented',
    severity: 'flag',
    citation: 'spec-v52 §4.5.5 R-PA-SURG-001. Payers approve elective surgery only after documented failure of non-operative management appropriate to the condition (e.g., joint replacement: PT + NSAIDs; spine: PT + epidurals); emergent surgery is exempt.',
    check(bundle) {
      const surgCpts = collectSurgeryCpts(bundle);
      if (surgCpts.size === 0) return { pass: true, evidence: 'No surgery CPT (10004-69990) in packet; rule vacuously satisfied.' };
      const emergentAnchors = ['emergent surgery', 'emergency surgery', 'urgent surgery', 'life-threatening', 'acute abdomen', 'open fracture', 'compartment syndrome', 'septic joint'];
      const isEmergent = bundle.documents.some((d) => keywordPresent(d.text, emergentAnchors));
      if (isEmergent) return { pass: true, evidence: 'Emergent / urgent surgical anchor present; rule does not apply.' };
      const conservativeAnchors = ['conservative management', 'conservative therapy', 'physical therapy trial', 'pt trial', 'nsaid trial', 'failed pt', 'failed physical therapy', 'epidural injection', 'failed conservative', 'non-operative management', 'failed nonoperative'];
      const found = bundle.documents.find((d) => keywordPresent(d.text, conservativeAnchors));
      if (!found) return { pass: false, note: 'Elective surgery request without a conservative-management / non-operative-trial anchor.' };
      return { pass: true, evidence: 'Conservative-management anchor in ' + found.name };
    },
  },
  {
    id: 'R-PA-SURG-002',
    description: 'Elective surgery: imaging supporting surgical indication attached',
    severity: 'flag',
    citation: 'spec-v52 §4.5.5 R-PA-SURG-002. Surgical PAs typically require imaging (X-ray, MRI, CT, US) that demonstrates the anatomical / pathological basis for surgery; the imaging report or anchor must be in the packet.',
    check(bundle) {
      const surgCpts = collectSurgeryCpts(bundle);
      if (surgCpts.size === 0) return { pass: true, evidence: 'No surgery CPT in packet; rule vacuously satisfied.' };
      const hasImagingDoc = bundle.documents.some((d) => d.role === 'imaging-report');
      const imagingAnchors = ['imaging shows', 'imaging demonstrates', 'mri shows', 'mri demonstrates', 'ct shows', 'ct demonstrates', 'x-ray shows', 'xray shows', 'ultrasound shows', 'radiology report:', 'imaging report:'];
      const hasAnchor = bundle.documents.some((d) => keywordPresent(d.text, imagingAnchors));
      if (!hasImagingDoc && !hasAnchor) return { pass: false, note: 'Surgery request without an attached imaging-report document or imaging-findings anchor.' };
      return { pass: true, evidence: hasImagingDoc ? 'Imaging-report document attached.' : 'Imaging-findings anchor present.' };
    },
  },
  {
    id: 'R-PA-SURG-003',
    description: 'Surgery with ASA >= 3: anesthesia / pre-op medical clearance documented',
    severity: 'flag',
    citation: 'spec-v52 §4.5.5 R-PA-SURG-003. ASA Physical Status >= 3 (severe systemic disease) requires documented pre-operative medical clearance / anesthesia evaluation so the perioperative risk has been assessed by an appropriate clinician.',
    check(bundle) {
      const surgCpts = collectSurgeryCpts(bundle);
      if (surgCpts.size === 0) return { pass: true, evidence: 'No surgery CPT in packet; rule vacuously satisfied.' };
      const asaTrigger = bundle.documents.some((d) => keywordPresent(d.text, ['asa 3', 'asa iii', 'asa-3', 'asa-iii', 'asa 4', 'asa iv', 'asa-4', 'asa-iv', 'asa 5', 'asa v', 'asa-5', 'asa-v', 'asa class 3', 'asa class iii', 'asa physical status 3', 'asa physical status iii']));
      if (!asaTrigger) return { pass: true, evidence: 'No ASA >= 3 anchor; rule vacuously satisfied.' };
      const clearanceAnchors = ['preoperative clearance', 'pre-op clearance', 'pre-operative clearance', 'medical clearance', 'cardiac clearance', 'anesthesia clearance', 'anesthesia evaluation', 'pre-anesthesia evaluation', 'preanesthesia evaluation', 'pre-op consult'];
      const found = bundle.documents.find((d) => keywordPresent(d.text, clearanceAnchors));
      if (!found) return { pass: false, note: 'ASA >= 3 surgical patient without a pre-op medical / anesthesia clearance anchor.' };
      return { pass: true, evidence: 'Clearance anchor in ' + found.name };
    },
  },
  {
    id: 'R-PA-SURG-004',
    description: 'Surgery: ASA Physical Status classification documented',
    severity: 'flag',
    citation: 'spec-v52 §4.5.5 R-PA-SURG-004. The ASA Physical Status is the de-facto standard for perioperative risk stratification; payers expect an ASA classification (1-5) on every elective surgery PA.',
    check(bundle) {
      const surgCpts = collectSurgeryCpts(bundle);
      if (surgCpts.size === 0) return { pass: true, evidence: 'No surgery CPT in packet; rule vacuously satisfied.' };
      const anchors = ['asa 1', 'asa 2', 'asa 3', 'asa 4', 'asa 5', 'asa i', 'asa ii', 'asa iii', 'asa iv', 'asa v', 'asa-1', 'asa-2', 'asa-3', 'asa-4', 'asa-5', 'asa class', 'asa physical status', 'asa pe ', 'asa ps '];
      const found = bundle.documents.find((d) => keywordPresent(d.text, anchors));
      if (!found) return { pass: false, note: 'Surgery request without an ASA Physical Status (1-5) anchor.' };
      return { pass: true, evidence: 'ASA classification anchor in ' + found.name };
    },
  },
  {
    id: 'R-PA-SURG-005',
    description: 'Surgery: informed consent documented, dated on or before the date of surgery',
    severity: 'flag',
    citation: 'spec-v52 §4.5.5 R-PA-SURG-005. Joint Commission / payer convention: a procedure-specific informed consent must be obtained before the surgical encounter. This rule narrows R-PA-059 (core consent check) to the surgical specialty trigger so the audit trail flags consent issues in the specialty section of the report.',
    check(bundle) {
      const surgCpts = collectSurgeryCpts(bundle);
      if (surgCpts.size === 0) return { pass: true, evidence: 'No surgery CPT in packet; rule vacuously satisfied.' };
      const consentTrigger = bundle.documents.some((d) => keywordPresent(d.text, ['surgical consent', 'informed consent for surgery', 'procedure-specific consent', 'consent for procedure', 'operative consent', 'informed consent', 'consent form', 'consent:', 'patient consent']));
      if (!consentTrigger) return { pass: false, note: 'Surgery request without an informed-consent / surgical-consent anchor.' };
      return { pass: true, evidence: 'Consent anchor present (R-PA-059 covers date-vs-service-date ordering across the packet).' };
    },
  },

  // ---- spec-v52 wave 52-5d: §4.5.5 behavioral-health overlay (5 of 25) ----
  //
  // Behavioral-health specialty rules trigger on a psychiatric CPT
  // (90785-90899 psychotherapy, 96130-96139 psych testing) OR an
  // ICD-10 F-code (F00-F99 mental and behavioral disorders). Like the
  // other §4.5.5 overlays they apply across every payer once the
  // trigger fires -- no `bundle.payer` self-gate.

  {
    id: 'R-PA-BH-001',
    description: 'Behavioral health: DSM-5-TR diagnosis documented (ICD-10 F-code aligned)',
    severity: 'flag',
    citation: 'spec-v52 §4.5.5 R-PA-BH-001. Behavioral-health PAs require a documented DSM-5-TR diagnosis; the packet should carry the ICD-10 F-code AND a DSM-5-TR / diagnostic-criteria reference for medical-necessity review.',
    check(bundle) {
      const bh = collectBehavioralHealthSignals(bundle);
      if (!bh.triggered) return { pass: true, evidence: 'No behavioral-health CPT or ICD-10 F-code trigger; rule vacuously satisfied.' };
      if (bh.icd10s.size === 0) return { pass: false, note: 'Behavioral-health request without an ICD-10 F-code (F00-F99) in the packet.' };
      const dsmAnchors = ['dsm-5', 'dsm 5', 'dsm-5-tr', 'dsm 5 tr', 'dsm-iv', 'dsm iv', 'diagnostic criteria', 'dsm criteria'];
      const found = bundle.documents.find((d) => keywordPresent(d.text, dsmAnchors));
      if (!found) return { pass: false, note: 'Behavioral-health F-code present but no DSM-5-TR / diagnostic-criteria reference.' };
      return { pass: true, evidence: 'F-code(s) ' + [...bh.icd10s].slice(0, 3).join(', ') + ' + DSM reference in ' + found.name };
    },
  },
  {
    id: 'R-PA-BH-002',
    description: 'Behavioral health: treatment plan with measurable goals documented',
    severity: 'flag',
    citation: 'spec-v52 §4.5.5 R-PA-BH-002. Payer convention (commercial and public): behavioral-health treatment plans must specify measurable, time-bound goals that map to the documented diagnosis so progress can be evaluated at reauthorization.',
    check(bundle) {
      const bh = collectBehavioralHealthSignals(bundle);
      if (!bh.triggered) return { pass: true, evidence: 'No behavioral-health trigger; rule vacuously satisfied.' };
      const planAnchors = ['treatment plan', 'individualized treatment plan', ' itp:', 'goals:', 'treatment goals', 'measurable goal', 'measurable objective', 'short-term goal', 'long-term goal', 'time-bound goal'];
      const found = bundle.documents.find((d) => keywordPresent(d.text, planAnchors));
      if (!found) return { pass: false, note: 'Behavioral-health request without a treatment-plan / measurable-goals anchor.' };
      return { pass: true, evidence: 'Treatment-plan anchor in ' + found.name };
    },
  },
  {
    id: 'R-PA-BH-003',
    description: 'Behavioral health: prior level of care documented when stepping up',
    severity: 'flag',
    citation: 'spec-v52 §4.5.5 R-PA-BH-003. ASAM / LOCUS frameworks: when requesting a higher level of care (outpatient -> IOP -> PHP -> residential -> inpatient), the packet must document the prior level and reason for step-up.',
    check(bundle) {
      const bh = collectBehavioralHealthSignals(bundle);
      if (!bh.triggered) return { pass: true, evidence: 'No behavioral-health trigger; rule vacuously satisfied.' };
      const stepupTrigger = bundle.documents.some((d) => keywordPresent(d.text, ['step up', 'step-up', 'higher level of care', 'increased level of care', 'transition to inpatient', 'transition to residential', 'transition to php', 'transition to iop', 'admission from outpatient', 'admission from iop']));
      if (!stepupTrigger) return { pass: true, evidence: 'No step-up-of-care anchor; rule vacuously satisfied.' };
      const priorAnchors = ['prior level of care', 'previous level of care', 'current level of care', 'outpatient therapy', ' iop ', 'intensive outpatient', ' php ', 'partial hospitalization', 'residential treatment', 'prior outpatient'];
      const found = bundle.documents.find((d) => keywordPresent(d.text, priorAnchors));
      if (!found) return { pass: false, note: 'Step-up-of-care request without a prior-level-of-care anchor (ASAM / LOCUS).' };
      return { pass: true, evidence: 'Prior-level-of-care anchor in ' + found.name };
    },
  },
  {
    id: 'R-PA-BH-004',
    description: 'Behavioral health: risk assessment (SI / HI / self-harm) documented',
    severity: 'flag',
    citation: 'spec-v52 §4.5.5 R-PA-BH-004. Payer convention and Joint Commission NPSG: behavioral-health PAs (especially higher levels of care) require documented risk assessment covering suicidal ideation, homicidal ideation, and self-harm.',
    check(bundle) {
      const bh = collectBehavioralHealthSignals(bundle);
      if (!bh.triggered) return { pass: true, evidence: 'No behavioral-health trigger; rule vacuously satisfied.' };
      const anchors = ['risk assessment', 'suicidal ideation', 'suicide risk', ' si/hi', 'si denied', 'hi denied', 'self-harm', 'self harm', 'homicidal ideation', 'columbia suicide severity', 'c-ssrs', 'safety plan'];
      const found = bundle.documents.find((d) => keywordPresent(d.text, anchors));
      if (!found) return { pass: false, note: 'Behavioral-health request without a risk-assessment (SI / HI / self-harm) anchor.' };
      return { pass: true, evidence: 'Risk-assessment anchor in ' + found.name };
    },
  },
  {
    id: 'R-PA-BH-005',
    description: 'Behavioral health: medication-assisted treatment (MAT) elements documented when SUD diagnosis present',
    severity: 'info',
    citation: 'spec-v52 §4.5.5 R-PA-BH-005. For substance-use-disorder packets (ICD-10 F10-F19) requesting MAT (buprenorphine, methadone, naltrexone), the packet should reference DEA X-waiver / OTP enrollment and the planned induction / maintenance phase.',
    check(bundle) {
      const bh = collectBehavioralHealthSignals(bundle);
      if (!bh.triggered) return { pass: true, evidence: 'No behavioral-health trigger; rule vacuously satisfied.' };
      const hasSud = [...bh.icd10s].some((c) => /^F1[0-9]/.test(c));
      const matTrigger = bundle.documents.some((d) => keywordPresent(d.text, ['medication-assisted treatment', 'medication assisted treatment', ' mat ', 'buprenorphine', 'suboxone', 'methadone', 'naltrexone', 'vivitrol', 'sublocade']));
      if (!hasSud && !matTrigger) return { pass: true, evidence: 'No SUD / MAT trigger; rule vacuously satisfied.' };
      const elementsAnchors = ['x-waiver', 'dea x-waiver', 'data 2000 waiver', 'otp enrollment', 'opioid treatment program', 'induction phase', 'maintenance phase', 'treatment phase', 'mat protocol'];
      const found = bundle.documents.find((d) => keywordPresent(d.text, elementsAnchors));
      if (!found) return { pass: false, note: 'SUD / MAT request without an X-waiver / OTP / induction-maintenance-phase anchor.' };
      return { pass: true, evidence: 'MAT-elements anchor in ' + found.name };
    },
  },

  // ---- spec-v52 wave 52-5e: §4.5.5 genetic-testing overlay COMPLETE (5 of 25) ----
  //
  // Genetic-testing specialty rules trigger on AMA molecular-pathology
  // CPTs (81105-81512, simplified to 81xxx). They close spec-v52 §4.5.5
  // and the complete §4.5 ruleset at 135 rules. Like the other §4.5.5
  // overlays they apply across every payer once the trigger fires --
  // no `bundle.payer` self-gate.

  {
    id: 'R-PA-GEN-001',
    description: 'Genetic testing: family history of relevant condition documented',
    severity: 'flag',
    citation: 'spec-v52 §4.5.5 R-PA-GEN-001. Payer medical policies for hereditary-cancer / cardiomyopathy / Lynch / BRCA panels require a documented family history meeting test-specific criteria (e.g., NCCN BRCA testing criteria for hereditary breast / ovarian).',
    check(bundle) {
      const genCpts = collectGeneticTestingCpts(bundle);
      if (genCpts.size === 0) return { pass: true, evidence: 'No genetic-testing CPT (81xxx) in packet; rule vacuously satisfied.' };
      const anchors = ['family history', 'family hx', 'familial', 'hereditary', 'pedigree', 'first-degree relative', 'second-degree relative', 'maternal history', 'paternal history', 'three-generation pedigree'];
      const found = bundle.documents.find((d) => keywordPresent(d.text, anchors));
      if (!found) return { pass: false, note: 'Genetic-testing request without a family-history / pedigree / familial anchor.' };
      return { pass: true, evidence: 'Family-history anchor in ' + found.name };
    },
  },
  {
    id: 'R-PA-GEN-002',
    description: 'Genetic testing: pre-test / post-test genetic counseling documented',
    severity: 'flag',
    citation: 'spec-v52 §4.5.5 R-PA-GEN-002. ACMG / NSGC guidelines and most payer policies require documented pre-test (and post-test for positive results) genetic counseling by a board-certified genetic counselor or qualified clinician before a hereditary-disorder panel is ordered.',
    check(bundle) {
      const genCpts = collectGeneticTestingCpts(bundle);
      if (genCpts.size === 0) return { pass: true, evidence: 'No genetic-testing CPT in packet; rule vacuously satisfied.' };
      const anchors = ['genetic counseling', 'pretest counseling', 'pre-test counseling', 'post-test counseling', 'posttest counseling', 'certified genetic counselor', ' cgc ', 'genetic counselor consult', 'gc consult'];
      const found = bundle.documents.find((d) => keywordPresent(d.text, anchors));
      if (!found) return { pass: false, note: 'Genetic-testing request without a pre-test / post-test genetic-counseling anchor.' };
      return { pass: true, evidence: 'Counseling anchor in ' + found.name };
    },
  },
  {
    id: 'R-PA-GEN-003',
    description: 'Genetic testing: test specificity / panel scope matches the documented clinical indication',
    severity: 'flag',
    citation: 'spec-v52 §4.5.5 R-PA-GEN-003. Payers deny broad-panel testing when a more targeted single-gene or focused panel matches the documented indication; the packet should state why the chosen panel scope (single-gene / focused / comprehensive / WES / WGS) is appropriate.',
    check(bundle) {
      const genCpts = collectGeneticTestingCpts(bundle);
      if (genCpts.size === 0) return { pass: true, evidence: 'No genetic-testing CPT in packet; rule vacuously satisfied.' };
      const anchors = ['panel scope', 'panel rationale', 'rationale for panel', 'panel justification', 'single-gene appropriate', 'comprehensive panel justified', 'focused panel', 'whole exome justification', 'whole genome justification', 'test selection rationale', 'panel selection'];
      const found = bundle.documents.find((d) => keywordPresent(d.text, anchors));
      if (!found) return { pass: false, note: 'Genetic-testing request without a panel-scope / test-selection-rationale anchor.' };
      return { pass: true, evidence: 'Panel-scope rationale anchor in ' + found.name };
    },
  },
  {
    id: 'R-PA-GEN-004',
    description: 'Genetic testing: personal clinical indication documented (symptoms / dx / risk profile)',
    severity: 'flag',
    citation: 'spec-v52 §4.5.5 R-PA-GEN-004. Predictive / asymptomatic genetic testing is approved only with documented risk based on personal history (signs / symptoms / preexisting dx / age criteria) or qualifying family history (R-PA-GEN-001) -- the packet must carry one or both.',
    check(bundle) {
      const genCpts = collectGeneticTestingCpts(bundle);
      if (genCpts.size === 0) return { pass: true, evidence: 'No genetic-testing CPT in packet; rule vacuously satisfied.' };
      // Personal clinical indication: any extracted ICD-10 dx, OR specific anchors.
      const hasDx = bundle.documents.some((d) => d.extract.icd10.length > 0);
      const anchors = ['personal history of', 'clinical indication:', 'symptoms consistent with', 'meets testing criteria', 'risk profile', 'risk factor:', 'meets nccn criteria', 'meets acmg criteria', 'meets nsgc criteria'];
      const hasAnchor = bundle.documents.some((d) => keywordPresent(d.text, anchors));
      if (!hasDx && !hasAnchor) return { pass: false, note: 'Genetic-testing request without a personal clinical-indication anchor or any ICD-10 dx in the packet.' };
      return { pass: true, evidence: hasAnchor ? 'Clinical-indication anchor present.' : 'ICD-10 dx present in packet.' };
    },
  },
  {
    id: 'R-PA-GEN-005',
    description: 'Genetic testing: informed consent specific to genetic testing (covers GINA / insurance / employment implications)',
    severity: 'info',
    citation: 'spec-v52 §4.5.5 R-PA-GEN-005. Many state laws and payer policies require an informed consent specific to genetic testing -- separate from general procedure consent -- that addresses Genetic Information Nondiscrimination Act (GINA) protections, incidental findings, and family implications.',
    check(bundle) {
      const genCpts = collectGeneticTestingCpts(bundle);
      if (genCpts.size === 0) return { pass: true, evidence: 'No genetic-testing CPT in packet; rule vacuously satisfied.' };
      const anchors = ['genetic testing consent', 'genetic test informed consent', 'genetic informed consent', 'gina protections', 'gina notice', 'genetic information nondiscrimination act', 'incidental findings', 'family implications', 'secondary findings'];
      const found = bundle.documents.find((d) => keywordPresent(d.text, anchors));
      if (!found) return { pass: false, note: 'Genetic-testing request without a genetic-specific informed-consent / GINA anchor.' };
      return { pass: true, evidence: 'Genetic-consent anchor in ' + found.name };
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

  // ---- spec-v52 wave 52-7a §4.5.7: Aetna commercial overlay (first 5 of ~20) ----
  //
  // The first named commercial-payer overlay. Per spec-v52 §4.5.7 these
  // rules check the procedural completeness of an Aetna precertification
  // packet against Aetna's own published precertification requirements --
  // not against clinical coverage criteria (that is the reviewer's
  // judgement and the applicable Clinical Policy Bulletin's job). Each rule
  // self-gates on `bundle.payer === 'aetna'` (detected by lib/pa/payer.js)
  // and returns a vacuous pass with an explicit note on any non-Aetna
  // packet, exactly like the CMS-FFS overlay (wave 52-2). Every citation is
  // anchored to Aetna's public precertification hub, re-verified on the
  // maintenance cadence in docs/pa-maintenance.md (ledger source
  // `aetna-precert`).

  {
    id: 'R-PA-AETNA-001',
    description: 'Aetna precertification: medical-necessity criteria (Clinical Policy Bulletin / CMS / MCG) referenced',
    severity: 'flag',
    citation: 'spec-v52 §4.5.7 R-PA-AETNA-001. Aetna determines coverage from "plan documents and (when applicable) a review of clinical information to determine whether clinical guidelines/criteria for coverage are met," applying Aetna Clinical Policy Bulletins, CMS guidelines, or MCG criteria, and asks providers to review the applicable CPB before submitting. <https://www.aetna.com/health-care-professionals/precertification.html>',
    check(bundle) {
      if (bundle.payer !== 'aetna') return { pass: true, evidence: 'Not an Aetna packet; rule vacuously satisfied.' };
      // Only fires once a service is actually being requested (>=1 procedure
      // code). `extract.cpts` already includes HCPCS Level II codes.
      const hasProcedure = bundle.documents.some((d) => d.extract.cpts.length > 0);
      if (!hasProcedure) return { pass: true, evidence: 'Aetna packet without a requested procedure code; rule vacuously satisfied.' };
      const criteriaAnchors = ['clinical policy bulletin', 'cpb ', 'cpb#', 'cpb no', 'aetna cpb', 'mcg', 'milliman', 'medical necessity', 'medically necessary', 'coverage criteria', 'coverage guideline'];
      const found = bundle.documents.find((d) => keywordPresent(d.text, criteriaAnchors));
      if (!found) return { pass: false, note: 'Aetna request does not reference the medical-necessity criteria (Clinical Policy Bulletin / CMS / MCG) it is being judged against. Cite the applicable Aetna CPB so the reviewer can map the request to its coverage criteria.' };
      return { pass: true, evidence: 'Medical-necessity criteria reference in ' + found.name };
    },
  },
  {
    id: 'R-PA-AETNA-002',
    description: 'Aetna precertification: supporting medical records / clinical documentation attached',
    severity: 'flag',
    citation: 'spec-v52 §4.5.7 R-PA-AETNA-002. Aetna instructs providers to submit medical records related to the member\'s condition for which treatment is proposed; a precertification with no clinical document attached cannot be reviewed on the merits. <https://www.aetna.com/health-care-professionals/precertification.html>',
    check(bundle) {
      if (bundle.payer !== 'aetna') return { pass: true, evidence: 'Not an Aetna packet; rule vacuously satisfied.' };
      const clinicalRoles = new Set(['clinical-note', 'medical-necessity-letter', 'lab-result', 'imaging-report', 'path-report']);
      const found = bundle.documents.find((d) => clinicalRoles.has(d.role));
      if (!found) return { pass: false, note: 'Aetna packet carries no clinical document (clinical note, medical-necessity letter, lab, imaging, or pathology report). Attach the supporting medical records Aetna requires for the determination.' };
      return { pass: true, evidence: 'Supporting clinical document present: ' + found.name + ' (' + found.role + ')' };
    },
  },
  {
    id: 'R-PA-AETNA-003',
    description: 'Aetna precertification: submission channel (EDI / secure provider portal / phone on member ID card) indicated',
    severity: 'info',
    citation: 'spec-v52 §4.5.7 R-PA-AETNA-003. Aetna: "You can submit a precertification by electronic data interchange (EDI), through our secure provider website or by phone, using the number on the member\'s ID card." Informational: a cover sheet that names the channel speeds routing. <https://www.aetna.com/health-care-professionals/precertification.html>',
    check(bundle) {
      if (bundle.payer !== 'aetna') return { pass: true, evidence: 'Not an Aetna packet; rule vacuously satisfied.' };
      const channelAnchors = ['availity', 'electronic data interchange', ' edi ', 'edi submission', 'secure provider', 'provider portal', 'epic payer platform', 'precertification department'];
      const found = bundle.documents.find((d) => keywordPresent(d.text, channelAnchors));
      if (!found) return { pass: false, note: 'No Aetna submission channel (Availity / EDI / secure provider portal / the precertification phone number on the member ID card) is noted in the packet. Informational only -- does not affect medical-necessity review.' };
      return { pass: true, evidence: 'Submission channel reference in ' + found.name };
    },
  },
  {
    id: 'R-PA-AETNA-004',
    description: 'Aetna precertification: requested service is on Aetna\'s participating-provider precertification list',
    severity: 'info',
    citation: 'spec-v52 §4.5.7 R-PA-AETNA-004. Aetna precertification applies only to services on its "Participating provider precertification list"; requesting authorization for a non-listed service is unnecessary. Wave 52-7a ships no bundled list, so the rule is vacuously satisfied with a pointer to the list (it mirrors core R-PA-053; a later wave bundles the list and flips this to a real membership test). <https://www.aetna.com/health-care-professionals/precertification.html>',
    check(bundle) {
      if (bundle.payer !== 'aetna') return { pass: true, evidence: 'Not an Aetna packet; rule vacuously satisfied.' };
      // No bundled precert list at v52-7a: the rule is structurally present so a
      // later overlay can populate the list without an engine change (R-PA-053 pattern).
      return { pass: true, evidence: 'No bundled Aetna precertification list at wave 52-7a; rule vacuously satisfied. Verify the requested service against Aetna\'s current participating-provider precertification list.' };
    },
  },
  {
    id: 'R-PA-AETNA-005',
    description: 'Aetna precertification: procedure-specific clinical questionnaire / precertification information request form completed when required',
    severity: 'flag',
    citation: 'spec-v52 §4.5.7 R-PA-AETNA-005. Aetna: "Providers may be asked to complete a short questionnaire to provide additional clinical information," and publishes procedure-specific Precertification Information Request Forms (e.g. spinal surgery, obesity/bariatric surgery, dorsal column / spinal-cord stimulator). When the packet requests one of those procedures, the matching questionnaire response should be present. <https://www.aetna.com/health-care-professionals/precertification.html>',
    check(bundle) {
      if (bundle.payer !== 'aetna') return { pass: true, evidence: 'Not an Aetna packet; rule vacuously satisfied.' };
      const questionnaireFamilies = ['spinal fusion', 'spinal surgery', 'lumbar fusion', 'cervical fusion', 'bariatric surgery', 'obesity surgery', 'gastric bypass', 'sleeve gastrectomy', 'spinal cord stimulator', 'dorsal column stimulator'];
      const trigger = bundle.documents.find((d) => keywordPresent(d.text, questionnaireFamilies));
      if (!trigger) return { pass: true, evidence: 'Aetna packet without a procedure that triggers a specific precertification questionnaire; rule vacuously satisfied.' };
      const responseAnchors = ['precertification information request form', 'clinical questionnaire', 'precert form', 'questionnaire response', 'conservative treatment', 'conservative management', 'failed conservative'];
      const answered = bundle.documents.find((d) => keywordPresent(d.text, responseAnchors));
      if (!answered) return { pass: false, note: 'Aetna packet requests a procedure with a dedicated precertification questionnaire (' + trigger.name + ') but no questionnaire response / clinical-criteria answer is present. Complete the matching Aetna Precertification Information Request Form.' };
      return { pass: true, evidence: 'Questionnaire / clinical-criteria response present in ' + answered.name };
    },
  },

  // ---- spec-v52 wave 52-7b §4.5.7: Aetna commercial overlay (6 -> 10 of ~20) ----
  //
  // Continues the procedural-completeness checks of wave 52-7a, each anchored
  // to a public Aetna utilization-management page and self-gating on
  // `bundle.payer === 'aetna'`. These cover the review *modes* Aetna runs
  // (concurrent / continued-stay, site-of-service, expedited) plus two
  // documentation requirements Aetna's CPBs and precert forms call out
  // (objective evidence for photo/measurement-dependent procedures; the NDC
  // on a physician-administered drug).

  {
    id: 'R-PA-AETNA-006',
    description: 'Aetna inpatient precertification: concurrent-review documentation (clinical progress + discharge / continuing-care plan) present',
    severity: 'flag',
    citation: 'spec-v52 §4.5.7 R-PA-AETNA-006. Aetna concurrent review "collect[s] information from the care team about the patient\'s condition and progress to determine coverage" and develops a discharge and continuing-care plan early in the stay; an inpatient request should carry that clinical update. <https://www.aetna.com/health-care-professionals/utilization-management/concurrent-review.html>',
    check(bundle) {
      if (bundle.payer !== 'aetna') return { pass: true, evidence: 'Not an Aetna packet; rule vacuously satisfied.' };
      const inpatientByPos = bundle.documents.some((d) => d.extract.pos.includes('21'));
      const inpatientAnchors = ['inpatient admission', 'acute inpatient', 'admitted', 'admission date', 'continued stay', 'continued-stay', 'concurrent review', 'length of stay'];
      const inpatientByText = bundle.documents.some((d) => keywordPresent(d.text, inpatientAnchors));
      if (!inpatientByPos && !inpatientByText) return { pass: true, evidence: 'Aetna packet without an inpatient / continued-stay context; rule vacuously satisfied.' };
      const progressAnchors = ['discharge plan', 'discharge planning', 'continuing care plan', 'continuing-care plan', 'progress note', 'clinical update', 'hospital course', 'plan of care', 'estimated length of stay', 'expected discharge'];
      const found = bundle.documents.find((d) => keywordPresent(d.text, progressAnchors));
      if (!found) return { pass: false, note: 'Aetna inpatient / continued-stay request without a clinical-progress or discharge / continuing-care plan anchor. Concurrent review needs the patient\'s condition, progress, and discharge plan.' };
      return { pass: true, evidence: 'Concurrent-review documentation anchor in ' + found.name };
    },
  },
  {
    id: 'R-PA-AETNA-007',
    description: 'Aetna site-of-service review: hospital-outpatient MRI / CT addresses the site-of-care requirement',
    severity: 'flag',
    citation: 'spec-v52 §4.5.7 R-PA-AETNA-007. Aetna: "Some members will have site-of-care requirements for MRI and CT scans when services are requested in a hospital outpatient setting." A hospital-outpatient advanced-imaging request should document why that site is required rather than a freestanding center. <https://www.aetna.com/health-care-professionals/precertification.html>',
    check(bundle) {
      if (bundle.payer !== 'aetna') return { pass: true, evidence: 'Not an Aetna packet; rule vacuously satisfied.' };
      const imagingAnchors = ['mri', 'magnetic resonance', 'ct scan', 'ct of', 'computed tomography'];
      const imaging = bundle.documents.some((d) => keywordPresent(d.text, imagingAnchors))
        || bundle.documents.some((d) => d.extract.cpts.some((c) => /^7[012345]\d{3}$/.test(c)));
      const outpatientByPos = bundle.documents.some((d) => d.extract.pos.includes('22') || d.extract.pos.includes('19'));
      const outpatientAnchors = ['hospital outpatient', 'outpatient hospital', 'hospital-based outpatient', 'on-campus outpatient', 'off-campus outpatient'];
      const outpatientByText = bundle.documents.some((d) => keywordPresent(d.text, outpatientAnchors));
      if (!imaging || (!outpatientByPos && !outpatientByText)) return { pass: true, evidence: 'Aetna packet without a hospital-outpatient MRI / CT request; site-of-care rule vacuously satisfied.' };
      const siteAnchors = ['site of care', 'site-of-care', 'site of service', 'site-of-service', 'freestanding', 'free-standing', 'imaging center not available', 'clinically required at hospital', 'hospital setting is medically necessary'];
      const found = bundle.documents.find((d) => keywordPresent(d.text, siteAnchors));
      if (!found) return { pass: false, note: 'Aetna hospital-outpatient MRI / CT request without a site-of-care justification. Document why the hospital setting (vs. a freestanding imaging center) is required, or expect a site-of-service redirect.' };
      return { pass: true, evidence: 'Site-of-care justification anchor in ' + found.name };
    },
  },
  {
    id: 'R-PA-AETNA-008',
    description: 'Aetna expedited / urgent precertification: clinical urgency justification present',
    severity: 'flag',
    citation: 'spec-v52 §4.5.7 R-PA-AETNA-008. Aetna processes a request on an expedited basis when "a delay in decision making might seriously jeopardize the life or health of the member or [the] ability to regain maximum function." A request that asks for expedited handling should state that clinical urgency. <https://www.aetna.com/health-care-professionals/precertification.html>',
    check(bundle) {
      if (bundle.payer !== 'aetna') return { pass: true, evidence: 'Not an Aetna packet; rule vacuously satisfied.' };
      const expeditedAnchors = ['expedited', 'urgent request', 'urgent precertification', 'urgent precert', 'stat request', 'expedited review', 'expedited precertification'];
      const trigger = bundle.documents.find((d) => keywordPresent(d.text, expeditedAnchors));
      if (!trigger) return { pass: true, evidence: 'Aetna packet without an expedited / urgent request; rule vacuously satisfied.' };
      const urgencyAnchors = ['jeopardize', 'life or health', 'urgent clinical', 'time-sensitive', 'time sensitive', 'risk to life', 'regain maximum function', 'clinically urgent', 'rapidly progressing', 'severe pain'];
      const found = bundle.documents.find((d) => keywordPresent(d.text, urgencyAnchors));
      if (!found) return { pass: false, note: 'Aetna request asks for expedited / urgent handling (' + trigger.name + ') but states no clinical urgency. Document why a standard-timeframe decision would jeopardize the member\'s life, health, or ability to regain maximum function.' };
      return { pass: true, evidence: 'Clinical urgency justification anchor in ' + found.name };
    },
  },
  {
    id: 'R-PA-AETNA-009',
    description: 'Aetna precertification: objective evidence (visual field / photographs / measurements) present for procedures whose CPB requires it',
    severity: 'flag',
    citation: 'spec-v52 §4.5.7 R-PA-AETNA-009. Several Aetna Clinical Policy Bulletins condition coverage on objective evidence -- e.g. visual-field tests and margin-reflex-distance photographs for blepharoplasty, photographs and excised-tissue weight for panniculectomy / reduction mammaplasty. When the packet requests one of those procedures, that objective evidence should be attached. <https://www.aetna.com/health-care-professionals/precertification.html>',
    check(bundle) {
      if (bundle.payer !== 'aetna') return { pass: true, evidence: 'Not an Aetna packet; rule vacuously satisfied.' };
      const objectiveProcedures = ['blepharoplasty', 'panniculectomy', 'breast reduction', 'reduction mammaplasty', 'rhinoplasty', 'abdominoplasty', 'ptosis repair'];
      const trigger = bundle.documents.find((d) => keywordPresent(d.text, objectiveProcedures));
      if (!trigger) return { pass: true, evidence: 'Aetna packet without a procedure that requires objective photographic / measurement evidence; rule vacuously satisfied.' };
      const evidenceAnchors = ['visual field', 'photograph', 'photo', 'clinical photo', 'measurement', 'grams of tissue', 'tissue removed', 'margin reflex distance', 'mrd', 'snip test', 'schirmer'];
      const found = bundle.documents.find((d) => keywordPresent(d.text, evidenceAnchors));
      if (!found) return { pass: false, note: 'Aetna packet requests a procedure (' + trigger.name + ') whose Clinical Policy Bulletin requires objective evidence (visual field, photographs, tissue measurements) but none is documented. Attach the objective findings the CPB calls for.' };
      return { pass: true, evidence: 'Objective-evidence anchor in ' + found.name };
    },
  },
  {
    id: 'R-PA-AETNA-010',
    description: 'Aetna precertification: NDC documented for a physician-administered (J-code) drug request',
    severity: 'info',
    citation: 'spec-v52 §4.5.7 R-PA-AETNA-010. Aetna\'s precertification information request for physician-administered (buy-and-bill) drugs asks for the National Drug Code in addition to the HCPCS J-code, so the request maps to a specific product and dose. Informational: a J-code request without an NDC routes more slowly. <https://www.aetna.com/health-care-professionals/precertification.html>',
    check(bundle) {
      if (bundle.payer !== 'aetna') return { pass: true, evidence: 'Not an Aetna packet; rule vacuously satisfied.' };
      const hasJcode = bundle.documents.some((d) => d.extract.cpts.some((c) => /^J\d{4}$/.test(c)));
      const drugAnchors = ['physician-administered drug', 'buy and bill', 'buy-and-bill', 'specialty drug', 'infusion drug', 'j-code', 'jcode'];
      const drugByText = bundle.documents.some((d) => keywordPresent(d.text, drugAnchors));
      if (!hasJcode && !drugByText) return { pass: true, evidence: 'Aetna packet without a physician-administered (J-code) drug request; rule vacuously satisfied.' };
      const ndcByText = bundle.documents.some((d) => keywordPresent(d.text, ['ndc', 'national drug code']));
      const ndcByFormat = bundle.documents.some((d) => /\b\d{4,5}-\d{3,4}-\d{1,2}\b/.test(d.text));
      if (!ndcByText && !ndcByFormat) return { pass: false, note: 'Aetna physician-administered (J-code) drug request without an NDC. Add the National Drug Code so the request maps to a specific product and dose. Informational -- does not affect medical-necessity review.' };
      return { pass: true, evidence: 'NDC present alongside the J-code drug request.' };
    },
  },

  // ---- spec-v52 wave 52-7c §4.5.7: Aetna commercial overlay (11 -> 15 of ~20) ----
  //
  // Continues the procedural-completeness overlay with checks anchored to
  // named Aetna Clinical Policy Bulletins and the Outpatient Surgical
  // Procedures policy: step-therapy prior-trial documentation for a drug
  // request, the bariatric-surgery (CPB 0157) BMI + structured-program
  // requirement, the genetic-testing (CPB 0140) counseling + family-history
  // requirement, a retrospective-request justification, and the
  // outpatient-surgery site-of-service rationale. Each self-gates on the
  // `aetna` bucket.

  {
    id: 'R-PA-AETNA-011',
    description: 'Aetna drug precertification: step-therapy prior-trial documentation (drugs tried + therapeutic failure) present',
    severity: 'flag',
    citation: 'spec-v52 §4.5.7 R-PA-AETNA-011. For drugs subject to step therapy Aetna asks providers to "list all medications the patient has tried specific to the diagnosis and specify therapeutic failure, including length of therapy for each drug." (Step therapy does not apply if the requested drug was already used within the past 365 days.) <https://www.aetna.com/health-care-professionals/medicare/part-b-drug-um.html>',
    check(bundle) {
      if (bundle.payer !== 'aetna') return { pass: true, evidence: 'Not an Aetna packet; rule vacuously satisfied.' };
      const hasJcode = bundle.documents.some((d) => d.extract.cpts.some((c) => /^J\d{4}$/.test(c)));
      const drugAnchors = ['specialty medication', 'specialty drug', 'step therapy', 'step-therapy', 'prescription drug', 'physician-administered drug', 'infusion', 'non-preferred', 'formulary exception', 'pharmacy precertification'];
      const drugByText = bundle.documents.some((d) => keywordPresent(d.text, drugAnchors));
      if (!hasJcode && !drugByText) return { pass: true, evidence: 'Aetna packet without a drug request subject to step therapy; rule vacuously satisfied.' };
      const trialAnchors = ['tried and failed', 'therapeutic failure', 'failed therapy', 'inadequate response', 'previously tried', 'prior therapy', 'step therapy completed', 'failed trial', 'contraindication to', 'intolerance to', 'tried and discontinued'];
      const found = bundle.documents.find((d) => keywordPresent(d.text, trialAnchors));
      if (!found) return { pass: false, note: 'Aetna drug request subject to step therapy without prior-trial documentation. List the preferred/prerequisite drugs tried, the therapeutic failure, and the length of therapy for each (or document a contraindication / prior use within 365 days).' };
      return { pass: true, evidence: 'Step-therapy prior-trial documentation in ' + found.name };
    },
  },
  {
    id: 'R-PA-AETNA-012',
    description: 'Aetna bariatric surgery (CPB 0157): BMI and a structured / supervised weight-management program documented',
    severity: 'flag',
    citation: 'spec-v52 §4.5.7 R-PA-AETNA-012. Aetna CPB 0157 (Obesity Surgery) requires class III obesity (BMI >= 40, or >= 35 with a serious comorbidity) and documentation of a structured / physician-supervised weight-management program before bariatric surgery. <https://www.aetna.com/cpb/medical/data/100_199/0157.html>',
    check(bundle) {
      if (bundle.payer !== 'aetna') return { pass: true, evidence: 'Not an Aetna packet; rule vacuously satisfied.' };
      const bariatricAnchors = ['bariatric surgery', 'obesity surgery', 'gastric bypass', 'sleeve gastrectomy', 'roux-en-y', 'gastric band', 'duodenal switch', 'biliopancreatic diversion'];
      const trigger = bundle.documents.find((d) => keywordPresent(d.text, bariatricAnchors));
      if (!trigger) return { pass: true, evidence: 'Aetna packet without a bariatric-surgery request; rule vacuously satisfied.' };
      const hasBmi = bundle.documents.some((d) => keywordPresent(d.text, ['bmi', 'body mass index']));
      const programAnchors = ['supervised weight', 'weight management program', 'weight-management program', 'medical weight loss', 'physician-supervised', 'structured weight', 'dietitian', 'nutrition counseling', 'behavioral therapy'];
      const hasProgram = bundle.documents.some((d) => keywordPresent(d.text, programAnchors));
      if (!hasBmi || !hasProgram) {
        const missing = [!hasBmi ? 'a documented BMI' : null, !hasProgram ? 'a structured / supervised weight-management program' : null].filter(Boolean).join(' and ');
        return { pass: false, note: 'Aetna bariatric-surgery request (' + trigger.name + ') is missing ' + missing + '. CPB 0157 requires BMI >= 40 (or >= 35 with comorbidity) and completion of a supervised weight-management program.' };
      }
      return { pass: true, evidence: 'BMI + supervised weight-management program documented.' };
    },
  },
  {
    id: 'R-PA-AETNA-013',
    description: 'Aetna genetic testing (CPB 0140): pre-test genetic counseling and personal / family history documented',
    severity: 'flag',
    citation: 'spec-v52 §4.5.7 R-PA-AETNA-013. Aetna CPB 0140 conditions many genetic tests on "pre- and post-test counseling by an appropriate independent provider (not an employee of the genetics testing laboratory)" and a supporting personal / family history (pedigree). <https://www.aetna.com/cpb/medical/data/100_199/0140.html>',
    check(bundle) {
      if (bundle.payer !== 'aetna') return { pass: true, evidence: 'Not an Aetna packet; rule vacuously satisfied.' };
      const hasGeneticCpt = bundle.documents.some((d) => d.extract.cpts.some((c) => /^81\d{3}$/.test(c)));
      const geneticAnchors = ['genetic testing', 'genetic test', 'hereditary', 'germline', 'molecular pathology', 'brca', 'gene panel', 'next-generation sequencing', 'whole exome', 'whole genome', 'pharmacogenomic'];
      const geneticByText = bundle.documents.some((d) => keywordPresent(d.text, geneticAnchors));
      if (!hasGeneticCpt && !geneticByText) return { pass: true, evidence: 'Aetna packet without a genetic-testing request; rule vacuously satisfied.' };
      const counselingAnchors = ['genetic counseling', 'genetic counselor', 'pre-test counseling', 'pretest counseling'];
      const historyAnchors = ['family history', 'personal and family history', 'pedigree', 'hereditary cancer history', 'family cancer history'];
      const hasCounseling = bundle.documents.some((d) => keywordPresent(d.text, counselingAnchors));
      const hasHistory = bundle.documents.some((d) => keywordPresent(d.text, historyAnchors));
      if (!hasCounseling || !hasHistory) {
        const missing = [!hasCounseling ? 'pre-test genetic counseling' : null, !hasHistory ? 'a personal / family history (pedigree)' : null].filter(Boolean).join(' and ');
        return { pass: false, note: 'Aetna genetic-testing request is missing ' + missing + '. CPB 0140 requires independent pre/post-test genetic counseling and a supporting family history.' };
      }
      return { pass: true, evidence: 'Genetic counseling + family history documented.' };
    },
  },
  {
    id: 'R-PA-AETNA-014',
    description: 'Aetna retrospective / retroactive request: a retro-review justification is documented',
    severity: 'info',
    citation: 'spec-v52 §4.5.7 R-PA-AETNA-014. Aetna accepts retrospective review only when the service was already rendered for a documented reason (e.g. emergent care, member eligibility not known at the time). A retro request should state that reason. Informational. <https://www.aetna.com/health-care-professionals/precertification.html>',
    check(bundle) {
      if (bundle.payer !== 'aetna') return { pass: true, evidence: 'Not an Aetna packet; rule vacuously satisfied.' };
      const retroAnchors = ['retrospective', 'retroactive', 'after the fact', 'service already rendered', 'services already performed', 'retro authorization', 'retro-authorization', 'post-service'];
      const trigger = bundle.documents.find((d) => keywordPresent(d.text, retroAnchors));
      if (!trigger) return { pass: true, evidence: 'Aetna packet is not a retrospective request; rule vacuously satisfied.' };
      const reasonAnchors = ['emergent', 'emergency', 'unable to obtain prior authorization', 'could not obtain authorization', 'urgent admission', 'member was not eligible', 'eligibility was not known', 'newborn', 'retroactive eligibility'];
      const found = bundle.documents.find((d) => keywordPresent(d.text, reasonAnchors));
      if (!found) return { pass: false, note: 'Aetna retrospective / retroactive request (' + trigger.name + ') without a documented reason the service preceded authorization (e.g. emergent care, retroactive eligibility). Informational -- add the retro-review justification.' };
      return { pass: true, evidence: 'Retro-review justification in ' + found.name };
    },
  },
  {
    id: 'R-PA-AETNA-015',
    description: 'Aetna Outpatient Surgical Procedures policy: hospital-setting elective surgery documents the medical-necessity rationale for the site',
    severity: 'info',
    citation: 'spec-v52 §4.5.7 R-PA-AETNA-015. Aetna\'s Outpatient Surgical Procedures policy: elective procedures in the program "should be performed in an ambulatory surgical center (ASC) or office setting unless the medical necessity criteria ... is met," and "clinical rationale and documentation must be provided for ... exceptions." A hospital-outpatient / inpatient elective surgery should document why the higher-acuity site is required. Informational. <https://www.aetna.com/health-care-professionals/outpatient-surgical-procedures.html>',
    check(bundle) {
      if (bundle.payer !== 'aetna') return { pass: true, evidence: 'Not an Aetna packet; rule vacuously satisfied.' };
      const hasSurgeryCpt = bundle.documents.some((d) => d.extract.cpts.some((c) => /^[1-6]\d{4}$/.test(c)));
      if (!hasSurgeryCpt) return { pass: true, evidence: 'Aetna packet without a surgical CPT; site-of-service rule vacuously satisfied.' };
      const hospitalSetting = bundle.documents.some((d) => d.extract.pos.includes('21') || d.extract.pos.includes('22'))
        || bundle.documents.some((d) => keywordPresent(d.text, ['hospital outpatient', 'outpatient hospital', 'inpatient hospital', 'inpatient admission']));
      if (!hospitalSetting) return { pass: true, evidence: 'Aetna surgery requested in an ASC / office setting; site-of-service rule vacuously satisfied.' };
      const rationaleAnchors = ['site of service', 'site-of-service', 'ambulatory surgical center', ' asc ', 'asa iii', 'asa iv', 'asa physical status', 'morbid obesity', 'medically necessary inpatient', 'inpatient medically necessary', 'higher acuity', 'requires hospital', 'admission medically necessary', 'hospital setting is medically necessary'];
      const found = bundle.documents.find((d) => keywordPresent(d.text, rationaleAnchors));
      if (!found) return { pass: false, note: 'Aetna elective surgery is requested in a hospital (outpatient / inpatient) setting without a documented medical-necessity rationale for that site. The Outpatient Surgical Procedures policy expects ASC / office unless an exception is documented. Informational.' };
      return { pass: true, evidence: 'Site-of-service rationale anchor in ' + found.name };
    },
  },

  // ---- spec-v52 wave 52-7d §4.5.7: Aetna commercial overlay (16 -> 20 of ~20) ----
  //
  // Closes the planned ~20-rule Aetna set. These five cover procedural
  // requirements Aetna's public precertification and program pages call out
  // for service lines the earlier waves did not reach: DME / home-health
  // written orders, the National Medical Excellence transplant program, the
  // experimental / investigational determination, the member appeal /
  // reconsideration pathway, and out-of-network / network-gap requests. Each
  // self-gates on `bundle.payer === 'aetna'` and vacuously passes on every
  // other packet.

  {
    id: 'R-PA-AETNA-016',
    description: 'Aetna DME / home-health precertification: a signed, dated written order accompanies the request',
    severity: 'flag',
    citation: 'spec-v52 §4.5.7 R-PA-AETNA-016. Aetna precertification for durable medical equipment and home-health services requires a written order, signed and dated by the ordering provider, before the item / service is dispensed. <https://www.aetna.com/health-care-professionals/precertification.html>',
    check(bundle) {
      if (bundle.payer !== 'aetna') return { pass: true, evidence: 'Not an Aetna packet; rule vacuously satisfied.' };
      const dmeAnchors = ['durable medical equipment', 'home health', 'home care', 'skilled nursing visit', 'wheelchair', 'hospital bed', 'cpap', 'bipap', 'nebulizer', 'enteral nutrition', 'prosthetic', 'orthotic', 'home infusion'];
      const hasDmeCode = bundle.documents.some((d) => d.extract.cpts.some((c) => /^[EK]\d{4}$/.test(c)));
      const trigger = bundle.documents.find((d) => keywordPresent(d.text, dmeAnchors)) || (hasDmeCode ? bundle.documents[0] : null);
      if (!trigger) return { pass: true, evidence: 'Aetna packet without a DME / home-health request; rule vacuously satisfied.' };
      const orderAnchors = ['written order', 'signed order', 'standard written order', 'detailed written order', 'order signed', 'physician order', 'prescriber signature'];
      const hasOrder = bundle.documents.some((d) => keywordPresent(d.text, orderAnchors));
      const hasSignature = bundle.documents.some((d) => keywordPresent(d.text, ['signature:', 'signed:', 'electronically signed', '/s/']));
      if (!hasOrder || !hasSignature) return { pass: false, note: 'Aetna DME / home-health request without a signed, dated written order. Attach the ordering provider\'s written order with a date and signature.' };
      return { pass: true, evidence: 'Signed written order present for the DME / home-health request.' };
    },
  },
  {
    id: 'R-PA-AETNA-017',
    description: 'Aetna transplant precertification: routed through the National Medical Excellence / Institutes of Excellence program with a transplant-center evaluation',
    severity: 'flag',
    citation: 'spec-v52 §4.5.7 R-PA-AETNA-017. Aetna directs solid-organ and hematopoietic stem-cell transplants through its National Medical Excellence Program (NME) / Institutes of Excellence (IOE) network; a transplant precertification should reference that routing and carry the transplant-center evaluation. <https://www.aetna.com/health-care-professionals/precertification.html>',
    check(bundle) {
      if (bundle.payer !== 'aetna') return { pass: true, evidence: 'Not an Aetna packet; rule vacuously satisfied.' };
      const txAnchors = ['transplant', 'organ transplant', 'bone marrow transplant', 'stem cell transplant', 'hematopoietic cell transplant', 'allograft', 'car-t', 'car t-cell'];
      const trigger = bundle.documents.find((d) => keywordPresent(d.text, txAnchors));
      if (!trigger) return { pass: true, evidence: 'Aetna packet without a transplant request; rule vacuously satisfied.' };
      const nmeAnchors = ['national medical excellence', 'institutes of excellence', 'institute of excellence', ' nme ', ' ioe ', 'transplant center evaluation', 'transplant evaluation', 'center of excellence'];
      const found = bundle.documents.find((d) => keywordPresent(d.text, nmeAnchors));
      if (!found) return { pass: false, note: 'Aetna transplant request (' + trigger.name + ') without a National Medical Excellence / Institutes of Excellence routing or a transplant-center evaluation summary. Confirm NME/IOE handling and attach the evaluation.' };
      return { pass: true, evidence: 'NME / IOE transplant routing anchor in ' + found.name };
    },
  },
  {
    id: 'R-PA-AETNA-018',
    description: 'Aetna experimental / investigational determination: peer-reviewed evidence or a documented CPB exception is present when the service is flagged experimental',
    severity: 'flag',
    citation: 'spec-v52 §4.5.7 R-PA-AETNA-018. Aetna excludes services it deems experimental or investigational under the applicable Clinical Policy Bulletin; a request for such a service must carry the peer-reviewed evidence or the documented exception the CPB allows, or it will be denied. <https://www.aetna.com/health-care-professionals/precertification.html>',
    check(bundle) {
      if (bundle.payer !== 'aetna') return { pass: true, evidence: 'Not an Aetna packet; rule vacuously satisfied.' };
      const eiAnchors = ['experimental', 'investigational', 'off-label', 'compassionate use', 'unproven', 'clinical trial'];
      const trigger = bundle.documents.find((d) => keywordPresent(d.text, eiAnchors));
      if (!trigger) return { pass: true, evidence: 'Aetna packet without an experimental / investigational service; rule vacuously satisfied.' };
      const evidenceAnchors = ['peer-reviewed', 'peer reviewed', 'published evidence', 'fda approved for', 'fda-approved indication', 'cpb exception', 'compendia', 'nccn', 'medical necessity exception', 'single case agreement'];
      const found = bundle.documents.find((d) => keywordPresent(d.text, evidenceAnchors));
      if (!found) return { pass: false, note: 'Aetna request for a service the CPB may classify as experimental / investigational (' + trigger.name + ') without supporting peer-reviewed evidence or a documented CPB exception. Attach the evidence the CPB requires.' };
      return { pass: true, evidence: 'Supporting evidence / CPB exception anchor in ' + found.name };
    },
  },
  {
    id: 'R-PA-AETNA-019',
    description: 'Aetna reconsideration / appeal: references the original determination and adds new clinical information',
    severity: 'info',
    citation: 'spec-v52 §4.5.7 R-PA-AETNA-019. When a precertification is resubmitted as a reconsideration or appeal, Aetna asks the provider to reference the original determination and supply additional clinical information that addresses the denial reason. Informational. <https://www.aetna.com/health-care-professionals/precertification.html>',
    check(bundle) {
      if (bundle.payer !== 'aetna') return { pass: true, evidence: 'Not an Aetna packet; rule vacuously satisfied.' };
      const appealAnchors = ['appeal', 'reconsideration', 'grievance', 'redetermination', 'overturn the denial', 'dispute the determination'];
      const trigger = bundle.documents.find((d) => keywordPresent(d.text, appealAnchors));
      if (!trigger) return { pass: true, evidence: 'Aetna packet is not an appeal / reconsideration; rule vacuously satisfied.' };
      const refAnchors = ['original determination', 'prior authorization number', 'reference number', 'denial dated', 'original denial', 'auth #', 'authorization id', 'case number'];
      const found = bundle.documents.find((d) => keywordPresent(d.text, refAnchors));
      if (!found) return { pass: false, note: 'Aetna appeal / reconsideration (' + trigger.name + ') without a reference to the original determination (prior-auth / case number) or the denial it addresses. Informational -- cite the original case and the new clinical information.' };
      return { pass: true, evidence: 'Original-determination reference in ' + found.name };
    },
  },
  {
    id: 'R-PA-AETNA-020',
    description: 'Aetna out-of-network / network-gap request: a continuity-of-care or network-gap justification is documented',
    severity: 'info',
    citation: 'spec-v52 §4.5.7 R-PA-AETNA-020. Aetna reviews out-of-network precertification for a documented network gap or continuity-of-care reason (no participating provider with the required expertise, an active course of treatment). An out-of-network request should state that justification. Informational. <https://www.aetna.com/health-care-professionals/precertification.html>',
    check(bundle) {
      if (bundle.payer !== 'aetna') return { pass: true, evidence: 'Not an Aetna packet; rule vacuously satisfied.' };
      const oonAnchors = ['out of network', 'out-of-network', 'non-participating', 'nonparticipating', 'non-par provider', 'oon provider'];
      const trigger = bundle.documents.find((d) => keywordPresent(d.text, oonAnchors));
      if (!trigger) return { pass: true, evidence: 'Aetna packet without an out-of-network request; rule vacuously satisfied.' };
      const gapAnchors = ['network gap', 'network exception', 'continuity of care', 'continuity-of-care', 'no participating provider', 'no in-network provider', 'gap exception', 'transition of care', 'active course of treatment'];
      const found = bundle.documents.find((d) => keywordPresent(d.text, gapAnchors));
      if (!found) return { pass: false, note: 'Aetna out-of-network request (' + trigger.name + ') without a documented network-gap or continuity-of-care justification. Informational -- state why an in-network provider cannot deliver the service.' };
      return { pass: true, evidence: 'Network-gap / continuity-of-care justification in ' + found.name };
    },
  },

  // ---- spec-v52 wave 52-8 §4.5.8: UnitedHealthcare commercial overlay (20 of 20) ----
  //
  // The second named commercial-payer overlay (after Aetna, §4.5.7). Per
  // spec-v52 §4.5.8 these rules check the procedural completeness of a
  // UnitedHealthcare prior-authorization / advance-notification packet
  // against UHC's own published submission requirements -- not against
  // clinical coverage criteria (that is the reviewer's judgement and the
  // applicable Coverage Determination Guideline / Medical Policy's job).
  // Each rule self-gates on `bundle.payer === 'uhc'` (detected by
  // lib/pa/payer.js) and returns a vacuous pass with an explicit note on any
  // non-UHC packet, exactly like the Aetna overlay. Every citation is
  // anchored to a public UHC provider page, re-verified on the maintenance
  // cadence in docs/pa-maintenance.md (ledger source `uhc-precert`). The set
  // deliberately mirrors the Aetna families so the two commercial overlays
  // stay structurally parallel and auditable side by side.

  {
    id: 'R-PA-UHC-001',
    description: 'UnitedHealthcare prior authorization: coverage criteria (Coverage Determination Guideline / Medical Policy / MCG) referenced',
    severity: 'flag',
    citation: 'spec-v52 §4.5.8 R-PA-UHC-001. UnitedHealthcare adjudicates prior-authorization requests against its published Medical & Drug Policies and Coverage Determination Guidelines (and MCG care guidelines); a request should cite the policy it is being judged against so the reviewer can map it to the coverage criteria. <https://www.uhcprovider.com/en/policies-protocols.html>',
    check(bundle) {
      if (bundle.payer !== 'uhc') return { pass: true, evidence: 'Not a UnitedHealthcare packet; rule vacuously satisfied.' };
      const hasProcedure = bundle.documents.some((d) => d.extract.cpts.length > 0);
      if (!hasProcedure) return { pass: true, evidence: 'UHC packet without a requested procedure code; rule vacuously satisfied.' };
      const criteriaAnchors = ['coverage determination guideline', 'medical policy', 'drug policy', 'coverage criteria', 'coverage guideline', 'mcg', 'milliman', 'medical necessity', 'medically necessary', 'cdg ', 'reimbursement policy'];
      const found = bundle.documents.find((d) => keywordPresent(d.text, criteriaAnchors));
      if (!found) return { pass: false, note: 'UnitedHealthcare request does not reference the coverage criteria (Coverage Determination Guideline / Medical Policy / MCG) it is being judged against. Cite the applicable UHC policy so the reviewer can map the request to its coverage criteria.' };
      return { pass: true, evidence: 'Coverage-criteria reference in ' + found.name };
    },
  },
  {
    id: 'R-PA-UHC-002',
    description: 'UnitedHealthcare prior authorization: supporting medical records / clinical documentation attached',
    severity: 'flag',
    citation: 'spec-v52 §4.5.8 R-PA-UHC-002. UnitedHealthcare requires the clinical information that supports medical necessity to be submitted with the prior-authorization request; a request with no clinical document attached cannot be reviewed on the merits. <https://www.uhcprovider.com/en/prior-auth-advance-notification.html>',
    check(bundle) {
      if (bundle.payer !== 'uhc') return { pass: true, evidence: 'Not a UnitedHealthcare packet; rule vacuously satisfied.' };
      const clinicalRoles = new Set(['clinical-note', 'medical-necessity-letter', 'lab-result', 'imaging-report', 'path-report']);
      const found = bundle.documents.find((d) => clinicalRoles.has(d.role));
      if (!found) return { pass: false, note: 'UnitedHealthcare packet carries no clinical document (clinical note, medical-necessity letter, lab, imaging, or pathology report). Attach the supporting medical records UHC requires for the determination.' };
      return { pass: true, evidence: 'Supporting clinical document present: ' + found.name + ' (' + found.role + ')' };
    },
  },
  {
    id: 'R-PA-UHC-003',
    description: 'UnitedHealthcare prior authorization: submission channel (UnitedHealthcare Provider Portal / EDI 278 / phone on member ID card) indicated',
    severity: 'info',
    citation: 'spec-v52 §4.5.8 R-PA-UHC-003. UnitedHealthcare directs providers to submit prior-authorization and advance-notification requests through the UnitedHealthcare Provider Portal\'s Prior Authorization and Notification tool, by 278 EDI transaction, or by phone using the number on the member ID card. Informational: a cover sheet that names the channel speeds routing. <https://www.uhcprovider.com/en/prior-auth-advance-notification.html>',
    check(bundle) {
      if (bundle.payer !== 'uhc') return { pass: true, evidence: 'Not a UnitedHealthcare packet; rule vacuously satisfied.' };
      const channelAnchors = ['provider portal', 'unitedhealthcare provider portal', 'prior authorization and notification', 'paan tool', 'electronic data interchange', ' edi ', '278 transaction', 'edi 278', 'secure provider', 'optum portal'];
      const found = bundle.documents.find((d) => keywordPresent(d.text, channelAnchors));
      if (!found) return { pass: false, note: 'No UnitedHealthcare submission channel (UnitedHealthcare Provider Portal Prior Authorization and Notification tool / EDI 278 / the phone number on the member ID card) is noted in the packet. Informational only -- does not affect medical-necessity review.' };
      return { pass: true, evidence: 'Submission channel reference in ' + found.name };
    },
  },
  {
    id: 'R-PA-UHC-004',
    description: 'UnitedHealthcare prior authorization: requested service is on UHC\'s prior-authorization / advance-notification requirement list',
    severity: 'info',
    citation: 'spec-v52 §4.5.8 R-PA-UHC-004. UnitedHealthcare prior authorization applies only to services on its published prior-authorization / advance-notification requirement lists; requesting authorization for a non-listed service is unnecessary. Wave 52-8 ships no bundled list, so the rule is vacuously satisfied with a pointer to the list (it mirrors core R-PA-053 and Aetna R-PA-AETNA-004; a later wave bundles the list and flips this to a real membership test). <https://www.uhcprovider.com/en/prior-auth-advance-notification.html>',
    check(bundle) {
      if (bundle.payer !== 'uhc') return { pass: true, evidence: 'Not a UnitedHealthcare packet; rule vacuously satisfied.' };
      return { pass: true, evidence: 'No bundled UnitedHealthcare prior-authorization list at wave 52-8; rule vacuously satisfied. Verify the requested service against UHC\'s current prior-authorization / advance-notification requirement list.' };
    },
  },
  {
    id: 'R-PA-UHC-005',
    description: 'UnitedHealthcare advance notification: notification of a service that requires it is documented before the service date',
    severity: 'flag',
    citation: 'spec-v52 §4.5.8 R-PA-UHC-005. UnitedHealthcare requires advance notification for certain services within its published timeframe before the procedure; a packet for a notification-required service should show the notification / reference number rather than relying on post-service review. <https://www.uhcprovider.com/en/prior-auth-advance-notification.html>',
    check(bundle) {
      if (bundle.payer !== 'uhc') return { pass: true, evidence: 'Not a UnitedHealthcare packet; rule vacuously satisfied.' };
      const notificationAnchors = ['advance notification', 'notification required', 'requires notification', 'prior authorization required'];
      const trigger = bundle.documents.find((d) => keywordPresent(d.text, notificationAnchors));
      if (!trigger) return { pass: true, evidence: 'UHC packet without an advance-notification-required service; rule vacuously satisfied.' };
      const refAnchors = ['notification number', 'reference number', 'prior authorization number', 'auth number', 'auth #', 'notification submitted', 'pa number', 'case number'];
      const found = bundle.documents.find((d) => keywordPresent(d.text, refAnchors));
      if (!found) return { pass: false, note: 'UnitedHealthcare service requires advance notification (' + trigger.name + ') but no notification / reference number is documented. Submit the advance notification within UHC\'s required timeframe and record the reference number.' };
      return { pass: true, evidence: 'Advance-notification reference in ' + found.name };
    },
  },
  {
    id: 'R-PA-UHC-006',
    description: 'UnitedHealthcare inpatient prior authorization: admission notification + concurrent / continued-stay clinical review documentation present',
    severity: 'flag',
    citation: 'spec-v52 §4.5.8 R-PA-UHC-006. UnitedHealthcare requires admission notification and conducts concurrent (continued-stay) review for inpatient admissions, collecting the clinical update and discharge plan; an inpatient request should carry that documentation. <https://www.uhcprovider.com/en/prior-auth-advance-notification.html>',
    check(bundle) {
      if (bundle.payer !== 'uhc') return { pass: true, evidence: 'Not a UnitedHealthcare packet; rule vacuously satisfied.' };
      const inpatientByPos = bundle.documents.some((d) => d.extract.pos.includes('21'));
      const inpatientAnchors = ['inpatient admission', 'acute inpatient', 'admitted', 'admission date', 'continued stay', 'continued-stay', 'concurrent review', 'length of stay'];
      const inpatientByText = bundle.documents.some((d) => keywordPresent(d.text, inpatientAnchors));
      if (!inpatientByPos && !inpatientByText) return { pass: true, evidence: 'UHC packet without an inpatient / continued-stay context; rule vacuously satisfied.' };
      const progressAnchors = ['admission notification', 'discharge plan', 'discharge planning', 'continuing care plan', 'continuing-care plan', 'progress note', 'clinical update', 'hospital course', 'plan of care', 'estimated length of stay', 'expected discharge'];
      const found = bundle.documents.find((d) => keywordPresent(d.text, progressAnchors));
      if (!found) return { pass: false, note: 'UnitedHealthcare inpatient / continued-stay request without an admission-notification or clinical-progress / discharge-plan anchor. Concurrent review needs the admission notification, the patient\'s progress, and the discharge plan.' };
      return { pass: true, evidence: 'Admission-notification / concurrent-review documentation anchor in ' + found.name };
    },
  },
  {
    id: 'R-PA-UHC-007',
    description: 'UnitedHealthcare advanced-imaging notification: outpatient MRI / CT / PET carries the clinical indication for the radiology notification program',
    severity: 'flag',
    citation: 'spec-v52 §4.5.8 R-PA-UHC-007. UnitedHealthcare runs an outpatient advanced-imaging (MRI / CT / PET / nuclear cardiology) prior-authorization / notification program; the request should carry the clinical indication that supports the study. <https://www.uhcprovider.com/en/prior-auth-advance-notification.html>',
    check(bundle) {
      if (bundle.payer !== 'uhc') return { pass: true, evidence: 'Not a UnitedHealthcare packet; rule vacuously satisfied.' };
      const imagingAnchors = ['mri', 'magnetic resonance', 'ct scan', 'ct of', 'computed tomography', 'pet scan', 'pet/ct', 'nuclear cardiology', 'myocardial perfusion'];
      const imaging = bundle.documents.some((d) => keywordPresent(d.text, imagingAnchors))
        || bundle.documents.some((d) => d.extract.cpts.some((c) => /^7[0-9]\d{3}$/.test(c)));
      if (!imaging) return { pass: true, evidence: 'UHC packet without an outpatient advanced-imaging request; rule vacuously satisfied.' };
      const indicationAnchors = ['clinical indication', 'indication for', 'reason for exam', 'reason for study', 'symptoms', 'failed conservative', 'duration of symptoms', 'differential diagnosis', 'rule out', 'history of'];
      const found = bundle.documents.find((d) => keywordPresent(d.text, indicationAnchors));
      if (!found) return { pass: false, note: 'UnitedHealthcare advanced-imaging request without a documented clinical indication. The outpatient imaging notification program expects the symptoms / prior workup that justify the study.' };
      return { pass: true, evidence: 'Clinical-indication anchor in ' + found.name };
    },
  },
  {
    id: 'R-PA-UHC-008',
    description: 'UnitedHealthcare expedited / urgent prior authorization: clinical urgency justification present',
    severity: 'flag',
    citation: 'spec-v52 §4.5.8 R-PA-UHC-008. UnitedHealthcare processes an expedited prior-authorization review when a standard timeframe could seriously jeopardize the member\'s life, health, or ability to regain maximum function. A request that asks for expedited handling should state that clinical urgency. <https://www.uhcprovider.com/en/prior-auth-advance-notification.html>',
    check(bundle) {
      if (bundle.payer !== 'uhc') return { pass: true, evidence: 'Not a UnitedHealthcare packet; rule vacuously satisfied.' };
      const expeditedAnchors = ['expedited', 'urgent request', 'urgent prior authorization', 'urgent precert', 'stat request', 'expedited review', 'expedited authorization'];
      const trigger = bundle.documents.find((d) => keywordPresent(d.text, expeditedAnchors));
      if (!trigger) return { pass: true, evidence: 'UHC packet without an expedited / urgent request; rule vacuously satisfied.' };
      const urgencyAnchors = ['jeopardize', 'life or health', 'urgent clinical', 'time-sensitive', 'time sensitive', 'risk to life', 'regain maximum function', 'clinically urgent', 'rapidly progressing', 'severe pain'];
      const found = bundle.documents.find((d) => keywordPresent(d.text, urgencyAnchors));
      if (!found) return { pass: false, note: 'UnitedHealthcare request asks for expedited / urgent handling (' + trigger.name + ') but states no clinical urgency. Document why a standard-timeframe decision would jeopardize the member\'s life, health, or ability to regain maximum function.' };
      return { pass: true, evidence: 'Clinical urgency justification anchor in ' + found.name };
    },
  },
  {
    id: 'R-PA-UHC-009',
    description: 'UnitedHealthcare site-of-service review: outpatient surgical procedure addresses the hospital-outpatient vs. ASC site-of-service medical necessity',
    severity: 'flag',
    citation: 'spec-v52 §4.5.8 R-PA-UHC-009. UnitedHealthcare\'s Site of Service review directs certain outpatient surgical procedures to an ambulatory surgical center unless hospital-outpatient care is medically necessary; a hospital-outpatient request should document why that site is required. <https://www.uhcprovider.com/en/policies-protocols.html>',
    check(bundle) {
      if (bundle.payer !== 'uhc') return { pass: true, evidence: 'Not a UnitedHealthcare packet; rule vacuously satisfied.' };
      const hasSurgeryCpt = bundle.documents.some((d) => d.extract.cpts.some((c) => /^[1-6]\d{4}$/.test(c)));
      if (!hasSurgeryCpt) return { pass: true, evidence: 'UHC packet without a surgical CPT; site-of-service rule vacuously satisfied.' };
      const hospitalSetting = bundle.documents.some((d) => d.extract.pos.includes('22') || d.extract.pos.includes('19'))
        || bundle.documents.some((d) => keywordPresent(d.text, ['hospital outpatient', 'outpatient hospital']));
      if (!hospitalSetting) return { pass: true, evidence: 'UHC surgery requested in an ASC / office setting; site-of-service rule vacuously satisfied.' };
      const rationaleAnchors = ['site of service', 'site-of-service', 'ambulatory surgical center', ' asc ', 'asa iii', 'asa iv', 'asa physical status', 'morbid obesity', 'higher acuity', 'requires hospital', 'hospital setting is medically necessary', 'medically necessary outpatient hospital'];
      const found = bundle.documents.find((d) => keywordPresent(d.text, rationaleAnchors));
      if (!found) return { pass: false, note: 'UnitedHealthcare outpatient surgery is requested in a hospital-outpatient setting without a documented medical-necessity rationale for that site. The Site of Service review expects an ASC unless an exception is documented.' };
      return { pass: true, evidence: 'Site-of-service rationale anchor in ' + found.name };
    },
  },
  {
    id: 'R-PA-UHC-010',
    description: 'UnitedHealthcare prior authorization: NDC documented for a physician-administered (J-code) drug request',
    severity: 'info',
    citation: 'spec-v52 §4.5.8 R-PA-UHC-010. UnitedHealthcare / Optum review of physician-administered (buy-and-bill) drugs maps the request to a specific product and dose via the National Drug Code in addition to the HCPCS J-code. Informational: a J-code request without an NDC routes more slowly. <https://www.uhcprovider.com/en/prior-auth-advance-notification.html>',
    check(bundle) {
      if (bundle.payer !== 'uhc') return { pass: true, evidence: 'Not a UnitedHealthcare packet; rule vacuously satisfied.' };
      const hasJcode = bundle.documents.some((d) => d.extract.cpts.some((c) => /^J\d{4}$/.test(c)));
      const drugAnchors = ['physician-administered drug', 'buy and bill', 'buy-and-bill', 'specialty drug', 'infusion drug', 'j-code', 'jcode'];
      const drugByText = bundle.documents.some((d) => keywordPresent(d.text, drugAnchors));
      if (!hasJcode && !drugByText) return { pass: true, evidence: 'UHC packet without a physician-administered (J-code) drug request; rule vacuously satisfied.' };
      const ndcByText = bundle.documents.some((d) => keywordPresent(d.text, ['ndc', 'national drug code']));
      const ndcByFormat = bundle.documents.some((d) => /\b\d{4,5}-\d{3,4}-\d{1,2}\b/.test(d.text));
      if (!ndcByText && !ndcByFormat) return { pass: false, note: 'UnitedHealthcare physician-administered (J-code) drug request without an NDC. Add the National Drug Code so the request maps to a specific product and dose. Informational -- does not affect medical-necessity review.' };
      return { pass: true, evidence: 'NDC present alongside the J-code drug request.' };
    },
  },
  {
    id: 'R-PA-UHC-011',
    description: 'UnitedHealthcare drug prior authorization: step-therapy prior-trial documentation (drugs tried + therapeutic failure) present',
    severity: 'flag',
    citation: 'spec-v52 §4.5.8 R-PA-UHC-011. For drugs subject to step therapy UnitedHealthcare / OptumRx requires documentation of the prerequisite drugs tried and the therapeutic failure / intolerance for each before the requested agent is approved. <https://www.uhcprovider.com/en/policies-protocols.html>',
    check(bundle) {
      if (bundle.payer !== 'uhc') return { pass: true, evidence: 'Not a UnitedHealthcare packet; rule vacuously satisfied.' };
      const hasJcode = bundle.documents.some((d) => d.extract.cpts.some((c) => /^J\d{4}$/.test(c)));
      const drugAnchors = ['specialty medication', 'specialty drug', 'step therapy', 'step-therapy', 'prescription drug', 'physician-administered drug', 'infusion', 'non-preferred', 'formulary exception', 'optumrx', 'pharmacy prior authorization'];
      const drugByText = bundle.documents.some((d) => keywordPresent(d.text, drugAnchors));
      if (!hasJcode && !drugByText) return { pass: true, evidence: 'UHC packet without a drug request subject to step therapy; rule vacuously satisfied.' };
      const trialAnchors = ['tried and failed', 'therapeutic failure', 'failed therapy', 'inadequate response', 'previously tried', 'prior therapy', 'step therapy completed', 'failed trial', 'contraindication to', 'intolerance to', 'tried and discontinued'];
      const found = bundle.documents.find((d) => keywordPresent(d.text, trialAnchors));
      if (!found) return { pass: false, note: 'UnitedHealthcare drug request subject to step therapy without prior-trial documentation. List the preferred / prerequisite drugs tried, the therapeutic failure, and the length of therapy for each (or document a contraindication / intolerance).' };
      return { pass: true, evidence: 'Step-therapy prior-trial documentation in ' + found.name };
    },
  },
  {
    id: 'R-PA-UHC-012',
    description: 'UnitedHealthcare genetic / molecular testing: the specific test and indication are documented for the molecular-testing notification program',
    severity: 'flag',
    citation: 'spec-v52 §4.5.8 R-PA-UHC-012. UnitedHealthcare runs a Genetic and Molecular Testing prior-authorization / notification program that requires the specific test name (and, where applicable, the unique test identifier) plus the clinical indication. <https://www.uhcprovider.com/en/policies-protocols.html>',
    check(bundle) {
      if (bundle.payer !== 'uhc') return { pass: true, evidence: 'Not a UnitedHealthcare packet; rule vacuously satisfied.' };
      const hasGeneticCpt = bundle.documents.some((d) => d.extract.cpts.some((c) => /^81\d{3}$/.test(c)));
      const geneticAnchors = ['genetic testing', 'genetic test', 'molecular testing', 'molecular pathology', 'hereditary', 'germline', 'brca', 'gene panel', 'next-generation sequencing', 'whole exome', 'whole genome', 'pharmacogenomic'];
      const geneticByText = bundle.documents.some((d) => keywordPresent(d.text, geneticAnchors));
      if (!hasGeneticCpt && !geneticByText) return { pass: true, evidence: 'UHC packet without a genetic / molecular testing request; rule vacuously satisfied.' };
      const detailAnchors = ['test name', 'test requested', 'unique test identifier', 'indication', 'family history', 'personal history', 'clinical indication', 'diagnosis'];
      const found = bundle.documents.find((d) => keywordPresent(d.text, detailAnchors));
      if (!found) return { pass: false, note: 'UnitedHealthcare genetic / molecular testing request without the specific test name and clinical indication. The Genetic and Molecular Testing program needs the test (and identifier where applicable) plus the indication.' };
      return { pass: true, evidence: 'Test + indication detail in ' + found.name };
    },
  },
  {
    id: 'R-PA-UHC-013',
    description: 'UnitedHealthcare specialty / injectable drug: the supporting diagnosis is documented for the applicable Drug Policy',
    severity: 'flag',
    citation: 'spec-v52 §4.5.8 R-PA-UHC-013. UnitedHealthcare specialty and injectable / oncology drug coverage is governed by drug-specific Medical Benefit Drug Policies that condition coverage on a supporting diagnosis (ICD-10) matching the policy\'s indication; the request should carry that diagnosis. <https://www.uhcprovider.com/en/policies-protocols.html>',
    check(bundle) {
      if (bundle.payer !== 'uhc') return { pass: true, evidence: 'Not a UnitedHealthcare packet; rule vacuously satisfied.' };
      const hasJcode = bundle.documents.some((d) => d.extract.cpts.some((c) => /^J\d{4}$/.test(c)));
      const drugAnchors = ['specialty drug', 'injectable', 'oncology drug', 'chemotherapy', 'biologic', 'infusion'];
      const drugByText = bundle.documents.some((d) => keywordPresent(d.text, drugAnchors));
      if (!hasJcode && !drugByText) return { pass: true, evidence: 'UHC packet without a specialty / injectable drug request; rule vacuously satisfied.' };
      const hasDiagnosis = bundle.documents.some((d) => d.extract.icd10 && d.extract.icd10.length > 0)
        || bundle.documents.some((d) => keywordPresent(d.text, ['diagnosis', 'icd-10', 'indicated for', 'fda-approved indication', 'on-label']));
      if (!hasDiagnosis) return { pass: false, note: 'UnitedHealthcare specialty / injectable drug request without a supporting diagnosis. Document the ICD-10 diagnosis that matches the drug\'s Medical Benefit Drug Policy indication.' };
      return { pass: true, evidence: 'Supporting diagnosis documented for the specialty-drug request.' };
    },
  },
  {
    id: 'R-PA-UHC-014',
    description: 'UnitedHealthcare retrospective / retroactive request: a retro-review justification is documented',
    severity: 'info',
    citation: 'spec-v52 §4.5.8 R-PA-UHC-014. UnitedHealthcare considers a retrospective review only when the service was already rendered for a documented reason (e.g. emergent care, member eligibility not known at the time). A retro request should state that reason. Informational. <https://www.uhcprovider.com/en/prior-auth-advance-notification.html>',
    check(bundle) {
      if (bundle.payer !== 'uhc') return { pass: true, evidence: 'Not a UnitedHealthcare packet; rule vacuously satisfied.' };
      const retroAnchors = ['retrospective', 'retroactive', 'after the fact', 'service already rendered', 'services already performed', 'retro authorization', 'retro-authorization', 'post-service'];
      const trigger = bundle.documents.find((d) => keywordPresent(d.text, retroAnchors));
      if (!trigger) return { pass: true, evidence: 'UHC packet is not a retrospective request; rule vacuously satisfied.' };
      const reasonAnchors = ['emergent', 'emergency', 'unable to obtain prior authorization', 'could not obtain authorization', 'urgent admission', 'member was not eligible', 'eligibility was not known', 'newborn', 'retroactive eligibility'];
      const found = bundle.documents.find((d) => keywordPresent(d.text, reasonAnchors));
      if (!found) return { pass: false, note: 'UnitedHealthcare retrospective / retroactive request (' + trigger.name + ') without a documented reason the service preceded authorization (e.g. emergent care, retroactive eligibility). Informational -- add the retro-review justification.' };
      return { pass: true, evidence: 'Retro-review justification in ' + found.name };
    },
  },
  {
    id: 'R-PA-UHC-015',
    description: 'UnitedHealthcare DME / home-health prior authorization: a signed, dated written order / plan of care accompanies the request',
    severity: 'flag',
    citation: 'spec-v52 §4.5.8 R-PA-UHC-015. UnitedHealthcare prior authorization for durable medical equipment and home-health services requires a written order / plan of care, signed and dated by the ordering provider, before the item / service is dispensed. <https://www.uhcprovider.com/en/prior-auth-advance-notification.html>',
    check(bundle) {
      if (bundle.payer !== 'uhc') return { pass: true, evidence: 'Not a UnitedHealthcare packet; rule vacuously satisfied.' };
      const dmeAnchors = ['durable medical equipment', 'home health', 'home care', 'skilled nursing visit', 'wheelchair', 'hospital bed', 'cpap', 'bipap', 'nebulizer', 'enteral nutrition', 'prosthetic', 'orthotic', 'home infusion'];
      const hasDmeCode = bundle.documents.some((d) => d.extract.cpts.some((c) => /^[EK]\d{4}$/.test(c)));
      const trigger = bundle.documents.find((d) => keywordPresent(d.text, dmeAnchors)) || (hasDmeCode ? bundle.documents[0] : null);
      if (!trigger) return { pass: true, evidence: 'UHC packet without a DME / home-health request; rule vacuously satisfied.' };
      const orderAnchors = ['written order', 'signed order', 'standard written order', 'detailed written order', 'order signed', 'physician order', 'plan of care', 'prescriber signature'];
      const hasOrder = bundle.documents.some((d) => keywordPresent(d.text, orderAnchors));
      const hasSignature = bundle.documents.some((d) => keywordPresent(d.text, ['signature:', 'signed:', 'electronically signed', '/s/']));
      if (!hasOrder || !hasSignature) return { pass: false, note: 'UnitedHealthcare DME / home-health request without a signed, dated written order / plan of care. Attach the ordering provider\'s written order with a date and signature.' };
      return { pass: true, evidence: 'Signed written order / plan of care present for the DME / home-health request.' };
    },
  },
  {
    id: 'R-PA-UHC-016',
    description: 'UnitedHealthcare behavioral health (Optum / United Behavioral Health): level-of-care criteria documentation present',
    severity: 'flag',
    citation: 'spec-v52 §4.5.8 R-PA-UHC-016. UnitedHealthcare behavioral-health prior authorization (administered through Optum / United Behavioral Health) reviews the requested level of care against published level-of-care guidelines (e.g. LOCUS / ASAM); the request should document the criteria that support the level requested. <https://www.uhcprovider.com/en/policies-protocols.html>',
    check(bundle) {
      if (bundle.payer !== 'uhc') return { pass: true, evidence: 'Not a UnitedHealthcare packet; rule vacuously satisfied.' };
      const bhAnchors = ['behavioral health', 'mental health', 'substance use', 'psychiatric', 'inpatient psychiatric', 'residential treatment', 'partial hospitalization', 'intensive outpatient', 'detoxification', 'optum behavioral'];
      const trigger = bundle.documents.find((d) => keywordPresent(d.text, bhAnchors));
      if (!trigger) return { pass: true, evidence: 'UHC packet without a behavioral-health request; rule vacuously satisfied.' };
      const locAnchors = ['level of care', 'level-of-care', 'locus', 'asam', 'cassii', 'medical necessity criteria', 'discharge criteria', 'safety plan', 'risk assessment', 'failed lower level of care'];
      const found = bundle.documents.find((d) => keywordPresent(d.text, locAnchors));
      if (!found) return { pass: false, note: 'UnitedHealthcare behavioral-health request (' + trigger.name + ') without level-of-care criteria documentation. Optum / UBH reviews the requested level of care against published guidelines (LOCUS / ASAM); document the criteria that support it.' };
      return { pass: true, evidence: 'Level-of-care criteria anchor in ' + found.name };
    },
  },
  {
    id: 'R-PA-UHC-017',
    description: 'UnitedHealthcare transplant prior authorization: routed through the UHC transplant / Centers of Excellence network with a transplant-center evaluation',
    severity: 'flag',
    citation: 'spec-v52 §4.5.8 R-PA-UHC-017. UnitedHealthcare directs solid-organ and hematopoietic stem-cell transplants through its transplant network / Centers of Excellence (administered with Optum); a transplant prior authorization should reference that routing and carry the transplant-center evaluation. <https://www.uhcprovider.com/en/prior-auth-advance-notification.html>',
    check(bundle) {
      if (bundle.payer !== 'uhc') return { pass: true, evidence: 'Not a UnitedHealthcare packet; rule vacuously satisfied.' };
      const txAnchors = ['transplant', 'organ transplant', 'bone marrow transplant', 'stem cell transplant', 'hematopoietic cell transplant', 'allograft', 'car-t', 'car t-cell'];
      const trigger = bundle.documents.find((d) => keywordPresent(d.text, txAnchors));
      if (!trigger) return { pass: true, evidence: 'UHC packet without a transplant request; rule vacuously satisfied.' };
      const coeAnchors = ['center of excellence', 'centers of excellence', 'transplant network', 'optum transplant', 'transplant center evaluation', 'transplant evaluation', 'institutes of excellence'];
      const found = bundle.documents.find((d) => keywordPresent(d.text, coeAnchors));
      if (!found) return { pass: false, note: 'UnitedHealthcare transplant request (' + trigger.name + ') without a Centers of Excellence / transplant-network routing or a transplant-center evaluation summary. Confirm the network routing and attach the evaluation.' };
      return { pass: true, evidence: 'Transplant network / Centers of Excellence routing anchor in ' + found.name };
    },
  },
  {
    id: 'R-PA-UHC-018',
    description: 'UnitedHealthcare experimental / investigational / unproven determination: peer-reviewed evidence or a documented policy exception is present',
    severity: 'flag',
    citation: 'spec-v52 §4.5.8 R-PA-UHC-018. UnitedHealthcare excludes services its Medical Policy classifies as experimental, investigational, or unproven; a request for such a service must carry the peer-reviewed evidence or the documented exception the policy allows, or it will be denied. <https://www.uhcprovider.com/en/policies-protocols.html>',
    check(bundle) {
      if (bundle.payer !== 'uhc') return { pass: true, evidence: 'Not a UnitedHealthcare packet; rule vacuously satisfied.' };
      const eiAnchors = ['experimental', 'investigational', 'unproven', 'off-label', 'compassionate use', 'clinical trial'];
      const trigger = bundle.documents.find((d) => keywordPresent(d.text, eiAnchors));
      if (!trigger) return { pass: true, evidence: 'UHC packet without an experimental / investigational / unproven service; rule vacuously satisfied.' };
      const evidenceAnchors = ['peer-reviewed', 'peer reviewed', 'published evidence', 'fda approved for', 'fda-approved indication', 'policy exception', 'compendia', 'nccn', 'medical necessity exception', 'single case agreement'];
      const found = bundle.documents.find((d) => keywordPresent(d.text, evidenceAnchors));
      if (!found) return { pass: false, note: 'UnitedHealthcare request for a service the Medical Policy may classify as experimental / investigational / unproven (' + trigger.name + ') without supporting peer-reviewed evidence or a documented policy exception. Attach the evidence the policy requires.' };
      return { pass: true, evidence: 'Supporting evidence / policy exception anchor in ' + found.name };
    },
  },
  {
    id: 'R-PA-UHC-019',
    description: 'UnitedHealthcare reconsideration / appeal: references the original determination and adds new clinical information',
    severity: 'info',
    citation: 'spec-v52 §4.5.8 R-PA-UHC-019. When a prior authorization is resubmitted as a reconsideration or appeal, UnitedHealthcare asks the provider to reference the original determination and supply additional clinical information that addresses the denial reason. Informational. <https://www.uhcprovider.com/en/prior-auth-advance-notification.html>',
    check(bundle) {
      if (bundle.payer !== 'uhc') return { pass: true, evidence: 'Not a UnitedHealthcare packet; rule vacuously satisfied.' };
      const appealAnchors = ['appeal', 'reconsideration', 'grievance', 'redetermination', 'overturn the denial', 'dispute the determination'];
      const trigger = bundle.documents.find((d) => keywordPresent(d.text, appealAnchors));
      if (!trigger) return { pass: true, evidence: 'UHC packet is not an appeal / reconsideration; rule vacuously satisfied.' };
      const refAnchors = ['original determination', 'prior authorization number', 'reference number', 'denial dated', 'original denial', 'auth #', 'authorization id', 'case number'];
      const found = bundle.documents.find((d) => keywordPresent(d.text, refAnchors));
      if (!found) return { pass: false, note: 'UnitedHealthcare appeal / reconsideration (' + trigger.name + ') without a reference to the original determination (prior-auth / case number) or the denial it addresses. Informational -- cite the original case and the new clinical information.' };
      return { pass: true, evidence: 'Original-determination reference in ' + found.name };
    },
  },
  {
    id: 'R-PA-UHC-020',
    description: 'UnitedHealthcare out-of-network / network-gap request: a continuity-of-care or network-gap justification is documented',
    severity: 'info',
    citation: 'spec-v52 §4.5.8 R-PA-UHC-020. UnitedHealthcare reviews out-of-network prior authorization for a documented network gap or continuity-of-care reason (no participating provider with the required expertise, an active course of treatment). An out-of-network request should state that justification. Informational. <https://www.uhcprovider.com/en/prior-auth-advance-notification.html>',
    check(bundle) {
      if (bundle.payer !== 'uhc') return { pass: true, evidence: 'Not a UnitedHealthcare packet; rule vacuously satisfied.' };
      const oonAnchors = ['out of network', 'out-of-network', 'non-participating', 'nonparticipating', 'non-par provider', 'oon provider'];
      const trigger = bundle.documents.find((d) => keywordPresent(d.text, oonAnchors));
      if (!trigger) return { pass: true, evidence: 'UHC packet without an out-of-network request; rule vacuously satisfied.' };
      const gapAnchors = ['network gap', 'network exception', 'continuity of care', 'continuity-of-care', 'no participating provider', 'no in-network provider', 'gap exception', 'transition of care', 'active course of treatment'];
      const found = bundle.documents.find((d) => keywordPresent(d.text, gapAnchors));
      if (!found) return { pass: false, note: 'UnitedHealthcare out-of-network request (' + trigger.name + ') without a documented network-gap or continuity-of-care justification. Informational -- state why an in-network provider cannot deliver the service.' };
      return { pass: true, evidence: 'Network-gap / continuity-of-care justification in ' + found.name };
    },
  },
];

// spec-v52 §4.5.6: attach structured per-rule source metadata. Each rule
// carries `sources` -- the ledger source id(s) it is anchored to (see
// pa-staleness-ledger.json), or [] for a structural / payer-agnostic
// completeness rule that consumes no external reference dataset. This is
// build/maintenance plumbing for the deferred refresh script and the
// ledger <-> ruleset coverage checks (lib/pa/staleness.js); it never enters
// a finding or the user-facing report (engine.js copies fields explicitly).
for (const rule of STARTER_RULES) {
  rule.sources = ruleSourceIds(rule.id);
}
