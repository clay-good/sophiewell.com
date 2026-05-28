// spec-v52 §4.5, §4.10: PA rule engine. Each of the 7 starter rules
// gets a fires-when-it-should and doesn't-fire-when-it-shouldn't
// assertion. Plus engine-level invariants: order is deterministic;
// same input -> same output (property test); rule throw is caught.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildBundle, runEngine, summarizeFindings } from '../../lib/pa/engine.js';
import { STARTER_RULES } from '../../lib/pa/rules.js';

// Happy-path packet: one clinical-note document with everything the
// starter rules look for, all valid. Should be all-pass.
// Happy-path packet that satisfies every rule in the wave 52-1f
// starter set (25 rules total). Each anchor below is exercised by
// at least one rule's check(); changes here cascade to multiple
// rule assertions, so add to bundleOf({...}) rather than reshape
// this block when extending.
// Happy-path single-document packet -- satisfies the 25 rules from
// wave 52-1f. Wave 52-1h ships rules that span document roles, so
// the 35-rule happy-path fixture lives below as HAPPY_PACKET and
// is built from multiple documents.
const HAPPY_TEXT = [
  'Cover sheet',
  'Patient: Jane Q Doe',
  'DOB: 1985-03-12',
  'Member ID: W123456789',
  'Date of service: 2026-04-12',
  'Procedure 99213 office visit',
  'Quantity: 1',
  'Dx: I10 essential hypertension',
  'Place of service: 11',
  'Ordering provider NPI: 1234567893',
  'TIN: 123456789',
  'Chief complaint: hypertension follow-up',
  'Medical necessity: required for blood-pressure control.',
  'Step therapy: trial of lisinopril completed without adequate response.',
  'Active medications: lisinopril 10 mg daily.',
  'Allergies: NKDA.',
  'Duration: 12 months requested.',
  'Signature: Jane Doe MD, 2026-04-12',
].join('\n') + '\n';

// Wave 52-1h: multi-document fixture that satisfies all 35 rules. The
// clinical note carries the procedure code so R-PA-023 passes; a
// second NPI on the lab cover satisfies R-PA-019; the lab-result and
// imaging-report documents are present + dated so R-PA-025/026/027/
// 028 pass.
const HAPPY_PACKET = {
  documents: [
    {
      name: 'pa-form.txt',
      sha256: 'sha-pa',
      kind: 'TXT',
      text: [
        'PA Cover sheet',
        'Prior Authorization Request Form',
        'Patient: Jane Q Doe',
        'DOB: 1985-03-12',
        'Member ID: W123456789',
        'Date of service: 2026-04-12',
        'Place of service: 11',
        'Procedure 99213 office visit',
        'Quantity: 1',
        'Duration: 12 months requested.',
        'Frequency: daily',
        'Dx: I10 essential hypertension',
        'Ordering provider NPI: 1234567893',
        'Servicing facility NPI: 1306849393',
        'TIN: 123456789',
        'Step therapy: trial of lisinopril completed without adequate response.',
        'Lab results attached. Imaging attached.',
        'Signature: Jane Doe MD, 2026-04-12',
      ].join('\n'),
    },
    {
      name: 'note.txt',
      sha256: 'sha-note',
      kind: 'TXT',
      text: [
        'Clinical note',
        'Chief complaint: hypertension follow-up',
        'History of present illness: stable on lisinopril.',
        'Assessment and plan: continue 99213-level office visit, daily lisinopril.',
        'Medical necessity: required for blood-pressure control.',
        'Active medications: lisinopril 10 mg daily.',
        'Allergies: NKDA.',
        'Weight: 70 kg. Height: 175 cm.',
        'Note date: 2026-04-12',
        'Signed: Jane Doe MD, 2026-04-12',
      ].join('\n'),
    },
    {
      name: 'lab.txt',
      sha256: 'sha-lab',
      kind: 'TXT',
      text: [
        'Laboratory report',
        'Collection date: 2026-04-01',
        'Reference range: 3.5-5.0 mEq/L',
        'Result: 4.1 mEq/L',
      ].join('\n'),
    },
    {
      name: 'imaging.txt',
      sha256: 'sha-img',
      kind: 'TXT',
      text: [
        'Radiology report',
        'Imaging date: 2026-03-15',
        'MRI of the lumbar spine.',
        'Findings: ...',
        'Impression: ...',
      ].join('\n'),
    },
  ],
  totalBytes: 8192,
};

function bundleOf(textBlocks, opts) {
  const docs = (Array.isArray(textBlocks) ? textBlocks : [textBlocks]).map((t, i) => ({
    name: 'doc-' + (i + 1) + '.txt',
    sha256: 'sha-' + (i + 1),
    kind: 'TXT',
    text: t,
  }));
  return buildBundle(docs, opts || { totalBytes: 4096 });
}

function happyBundle(opts) {
  return buildBundle(HAPPY_PACKET.documents, opts || { totalBytes: HAPPY_PACKET.totalBytes });
}

test('runEngine passes every starter rule on a clean multi-doc happy-path packet', () => {
  const findings = runEngine(happyBundle());
  const counts = summarizeFindings(findings);
  assert.equal(findings.length, STARTER_RULES.length);
  assert.equal(counts.block, 0);
  assert.equal(counts.flag, 0);
  assert.equal(counts.error, 0);
  assert.equal(counts.pass, STARTER_RULES.length);
});

test('STARTER_RULES at wave 52-2d close is 80 rules (60 core + 20 CMS FFS overlay)', () => {
  assert.equal(STARTER_RULES.length, 80);
});

test('CMS overlay carries the spec-aligned id R-PA-CMS-004 for proof-of-delivery', () => {
  const podRule = STARTER_RULES.find((r) => r.id === 'R-PA-CMS-004');
  assert.ok(podRule, 'R-PA-CMS-004 should exist after wave 52-2b renumber.');
  assert.match(podRule.description, /proof of delivery/i);
});

// ---- wave 52-2b sanity checks ----

test('R-PA-CMS-003 blocks on a Medicare FFS DME SWO that is missing required elements', () => {
  // SWO anchor present but no quantity / NPI / signature / patient name
  const text = 'Medicare Part B beneficiary on file.\n'
    + 'Durable medical equipment: standard wheelchair.\n'
    + 'Standard Written Order on file.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-CMS-003');
  assert.equal(f.status, 'block');
});

test('R-PA-CMS-005 flags a Medicare FFS power-mobility request without a functional-status anchor', () => {
  const text = HAPPY_TEXT
    + '\nMedicare Part B beneficiary on file.\n'
    + 'Power wheelchair requested for ambulation impairment.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-CMS-005');
  assert.equal(f.status, 'flag');
});

test('R-PA-CMS-007 flags a Medicare FFS PAP-continuation request without adherence data', () => {
  const text = HAPPY_TEXT
    + '\nMedicare Part B beneficiary on file.\n'
    + 'CPAP continuation requested beyond 90-day compliance period.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-CMS-007');
  assert.equal(f.status, 'flag');
});

test('R-PA-CMS-008 blocks a Medicare FFS home-oxygen request without an ABG / SpO2 anchor', () => {
  const text = HAPPY_TEXT
    + '\nMedicare Part B beneficiary on file.\n'
    + 'Home oxygen therapy ordered for chronic hypoxemia.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-CMS-008');
  assert.equal(f.status, 'block');
});

test('R-PA-CMS-011 flags a Medicare FFS hospital-bed request without a positioning anchor', () => {
  const text = HAPPY_TEXT
    + '\nMedicare Part B beneficiary on file.\n'
    + 'Hospital bed (semi-electric) requested for home use.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-CMS-011');
  assert.equal(f.status, 'flag');
});

// ---- wave 52-2c sanity checks ----

test('R-PA-CMS-012 flags a Medicare FFS enteral-nutrition request without an inability-to-ingest anchor', () => {
  const text = HAPPY_TEXT
    + '\nMedicare Part B beneficiary on file.\n'
    + 'Tube feeding ordered: enteral nutrition formula.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-CMS-012');
  assert.equal(f.status, 'flag');
});

test('R-PA-CMS-013 flags a Medicare FFS nebulizer request without a covered diagnosis anchor', () => {
  const text = HAPPY_TEXT
    + '\nMedicare Part B beneficiary on file.\n'
    + 'Compressor nebulizer with inhalation solution ordered.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-CMS-013');
  assert.equal(f.status, 'flag');
});

test('R-PA-CMS-014 blocks a Medicare FFS TENS request without chronic-pain + failed-therapy anchors', () => {
  const text = HAPPY_TEXT
    + '\nMedicare Part B beneficiary on file.\n'
    + 'TENS unit prescribed for back discomfort.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-CMS-014');
  assert.equal(f.status, 'block');
});

test('R-PA-CMS-015 flags a Medicare FFS NPWT request without a wound-type / failed-care anchor', () => {
  const text = HAPPY_TEXT
    + '\nMedicare Part B beneficiary on file.\n'
    + 'Negative pressure wound therapy ordered for sacral wound.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-CMS-015');
  assert.equal(f.status, 'flag');
});

test('R-PA-CMS-016 flags a Medicare FFS lower-limb-prosthesis request without a K-level anchor', () => {
  const text = HAPPY_TEXT
    + '\nMedicare Part B beneficiary on file.\n'
    + 'Transtibial prosthesis prescribed for amputee.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-CMS-016');
  assert.equal(f.status, 'flag');
});

// ---- wave 52-2d sanity checks ----

test('R-PA-CMS-017 flags a Medicare FFS orthotic request without a covered-condition anchor', () => {
  const text = HAPPY_TEXT
    + '\nMedicare Part B beneficiary on file.\n'
    + 'Ankle-foot orthosis (L1960) ordered for patient.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-CMS-017');
  assert.equal(f.status, 'flag');
});

test('R-PA-CMS-018 flags a Medicare FFS CGM request without insulin or monitoring anchors', () => {
  const text = HAPPY_TEXT
    + '\nMedicare Part B beneficiary on file.\n'
    + 'Continuous glucose monitor (Dexcom) ordered for diabetic patient.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-CMS-018');
  assert.equal(f.status, 'flag');
});

test('R-PA-CMS-019 flags a Medicare FFS immunosuppressive request without a transplant-organ anchor', () => {
  const text = HAPPY_TEXT
    + '\nMedicare Part B beneficiary on file.\n'
    + 'Tacrolimus prescribed for anti-rejection therapy.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-CMS-019');
  assert.equal(f.status, 'flag');
});

test('R-PA-CMS-020 flags a Medicare FFS TPN request without GI-failure or caloric anchors', () => {
  const text = HAPPY_TEXT
    + '\nMedicare Part B beneficiary on file.\n'
    + 'Total parenteral nutrition ordered for inpatient.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-CMS-020');
  assert.equal(f.status, 'flag');
});

test('R-PA-CMS-021 flags a Medicare FFS lymphedema-pump request without dx + failed-therapy anchors', () => {
  const text = HAPPY_TEXT
    + '\nMedicare Part B beneficiary on file.\n'
    + 'Pneumatic compression device ordered for swelling.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-CMS-021');
  assert.equal(f.status, 'flag');
});

// ---- wave 52-2a sanity checks: CMS Medicare FFS overlay self-gating ----

test('R-PA-CMS-001 passes (vacuous) when the detected payer is not Medicare FFS', () => {
  const findings = runEngine(happyBundle());
  const f = findings.find((x) => x.ruleId === 'R-PA-CMS-001');
  assert.equal(f.status, 'pass');
});

test('R-PA-CMS-001 passes (vacuous) on a Medicare FFS packet without DME context', () => {
  const text = HAPPY_TEXT + '\nMedicare Part B beneficiary on file.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-CMS-001');
  assert.equal(f.status, 'pass');
});

test('R-PA-CMS-001 blocks on a Medicare FFS DME packet without a face-to-face anchor', () => {
  const text = HAPPY_TEXT
    + '\nMedicare Part B beneficiary on file.\n'
    + 'Durable medical equipment: standard wheelchair.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-CMS-001');
  assert.equal(f.status, 'block');
});

test('R-PA-CMS-002 blocks on a Medicare FFS DME packet without an SWO/DWO anchor', () => {
  const text = HAPPY_TEXT
    + '\nMedicare Part B beneficiary on file.\n'
    + 'Durable medical equipment: standard wheelchair.\n'
    + 'Face-to-face encounter completed 2026-04-01.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-CMS-002');
  assert.equal(f.status, 'block');
});

test('R-PA-CMS-006 flags a Medicare FFS PAP request without a sleep-study anchor', () => {
  const text = HAPPY_TEXT
    + '\nMedicare Part B beneficiary on file.\n'
    + 'Order: CPAP device.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-CMS-006');
  assert.equal(f.status, 'flag');
});

test('R-PA-CMS-009 flags a Medicare FFS DME packet without a supplier PTAN anchor', () => {
  const text = HAPPY_TEXT
    + '\nMedicare Part B beneficiary on file.\n'
    + 'Durable medical equipment: standard wheelchair.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-CMS-009');
  assert.equal(f.status, 'flag');
});

// ---- wave 52-1k sanity checks (R-PA-008, 009, 011, 012, 043) ----

test('R-PA-008 passes (vacuous) when no CPT/HCPCS codes are extracted', () => {
  const findings = runEngine(bundleOf('Patient: Jane Doe\nNo procedure codes here.\n'));
  const f = findings.find((x) => x.ruleId === 'R-PA-008');
  assert.equal(f.status, 'pass');
});

test('R-PA-009 passes (vacuous) when no HCPCS Level II code is in the packet', () => {
  const findings = runEngine(happyBundle());
  const f = findings.find((x) => x.ruleId === 'R-PA-009');
  assert.equal(f.status, 'pass');
});

test('R-PA-011 passes (format-valid) on the happy multi-doc packet', () => {
  const findings = runEngine(happyBundle());
  const f = findings.find((x) => x.ruleId === 'R-PA-011');
  assert.equal(f.status, 'pass');
});

test('R-PA-012 passes (placeholder) when NCCI pairs table is empty', () => {
  const findings = runEngine(happyBundle());
  const f = findings.find((x) => x.ruleId === 'R-PA-012');
  assert.equal(f.status, 'pass');
});

test('R-PA-043 blocks when a document has a password-protected parse error', () => {
  const docs = [
    ...HAPPY_PACKET.documents,
    { name: 'locked.pdf', sha256: 'sha-pdf', kind: 'PDF', text: '', parseError: 'PDF is password-protected' },
  ];
  const findings = runEngine(buildBundle(docs, { totalBytes: 8192 }));
  const f = findings.find((x) => x.ruleId === 'R-PA-043');
  assert.equal(f.status, 'block');
});

test('R-PA-043 blocks when a document text contains an encryption anchor', () => {
  const docs = [
    ...HAPPY_PACKET.documents,
    { name: 'note.txt', sha256: 'sha-x', kind: 'TXT', text: 'This document is encrypted. Cannot proceed.' },
  ];
  const findings = runEngine(buildBundle(docs, { totalBytes: 8192 }));
  const f = findings.find((x) => x.ruleId === 'R-PA-043');
  assert.equal(f.status, 'block');
});

// ---- wave 52-1j sanity checks (R-PA-014, 042, 044, 047-051, 056, 057) ----

test('R-PA-014 flags a malformed CPT modifier suffix', () => {
  const docs = HAPPY_PACKET.documents.map((d) =>
    d.name === 'pa-form.txt' ? { ...d, text: d.text + '\nProcedure: 99213-Q office visit.' } : d);
  const findings = runEngine(buildBundle(docs, { totalBytes: 8192 }));
  const f = findings.find((x) => x.ruleId === 'R-PA-014');
  assert.equal(f.status, 'flag');
});

test('R-PA-014 passes (vacuous) when no CPT modifier suffix is present', () => {
  const findings = runEngine(happyBundle());
  const f = findings.find((x) => x.ruleId === 'R-PA-014');
  assert.equal(f.status, 'pass');
});

test('R-PA-042 flags a PDF document with zero extractable text', () => {
  const docs = [
    { name: 'scan.pdf', sha256: 'sha-pdf', kind: 'PDF', text: '' },
    ...HAPPY_PACKET.documents,
  ];
  const findings = runEngine(buildBundle(docs, { totalBytes: 8192 }));
  const f = findings.find((x) => x.ruleId === 'R-PA-042');
  assert.equal(f.status, 'flag');
});

test('R-PA-044 blocks when any document opened with zero extractable content', () => {
  const docs = [
    ...HAPPY_PACKET.documents,
    { name: 'empty.txt', sha256: 'sha-empty', kind: 'TXT', text: '' },
  ];
  const findings = runEngine(buildBundle(docs, { totalBytes: 8192 }));
  const f = findings.find((x) => x.ruleId === 'R-PA-044');
  assert.equal(f.status, 'block');
});

test('R-PA-047 passes (vacuous info) at v52-1j when no payer overlay is loaded', () => {
  const findings = runEngine(happyBundle());
  const f = findings.find((x) => x.ruleId === 'R-PA-047');
  assert.equal(f.status, 'pass');
});

test('R-PA-050 flags when no document carries both an ICD-10 and a CPT/HCPCS code', () => {
  const docs = [
    { name: 'codes.txt', sha256: 's1', kind: 'TXT', text: 'Procedure 99213 office visit.\nPatient: Jane Q Doe\nDOB: 1985-03-12\nMember ID: W123456789\nDate of service: 2026-04-12\nPlace of service: 11\nQuantity: 1\nOrdering provider NPI: 1234567893\nServicing facility NPI: 1306849393\nTIN: 123456789\nChief complaint: hypertension follow-up\nMedical necessity: required.\nStep therapy: trial of lisinopril.\nActive medications: lisinopril daily.\nAllergies: NKDA.\nDuration: 12 months.\nFrequency: daily\nSignature: Jane Doe MD, 2026-04-12\n' },
    { name: 'dx.txt', sha256: 's2', kind: 'TXT', text: 'Dx: I10 essential hypertension.\n' },
  ];
  const findings = runEngine(buildBundle(docs, { totalBytes: 4096 }));
  const f = findings.find((x) => x.ruleId === 'R-PA-050');
  assert.equal(f.status, 'flag');
});

test('R-PA-051 passes (vacuous info) at v52-1j when the CPT descriptor table is not loaded', () => {
  const findings = runEngine(happyBundle());
  const f = findings.find((x) => x.ruleId === 'R-PA-051');
  assert.equal(f.status, 'pass');
});

test('R-PA-056 flags when an anesthesia CPT (00100-01999) is present without an anesthesia-time anchor', () => {
  const docs = HAPPY_PACKET.documents.map((d) =>
    d.name === 'pa-form.txt' ? { ...d, text: d.text + '\nAdditional CPT: 01967 neuraxial labor analgesia' } : d);
  const findings = runEngine(buildBundle(docs, { totalBytes: 8192 }));
  const f = findings.find((x) => x.ruleId === 'R-PA-056');
  assert.equal(f.status, 'flag');
});

test('R-PA-057 flags when an assistant-surgeon modifier is referenced but fewer than 2 NPIs are present', () => {
  // Strip the servicing NPI so only one NPI remains; add modifier 80.
  const docs = HAPPY_PACKET.documents.map((d) =>
    d.name === 'pa-form.txt'
      ? { ...d, text: d.text.replace('Servicing facility NPI: 1306849393', '') + '\nUsing modifier 80 for assistant surgeon.' }
      : d);
  const findings = runEngine(buildBundle(docs, { totalBytes: 8192 }));
  const f = findings.find((x) => x.ruleId === 'R-PA-057');
  assert.equal(f.status, 'flag');
});

// ---- wave 52-1i sanity checks (R-PA-030, 035, 038-040, 052, 054, 055, 058, 059) ----

test('R-PA-030 flags when step therapy is referenced but no prior-treatment list is present', () => {
  const docs = HAPPY_PACKET.documents.map((d) =>
    d.name === 'pa-form.txt'
      ? { ...d, text: d.text.replace('Step therapy: trial of lisinopril completed without adequate response.', 'Step therapy: required.') }
      : d);
  const findings = runEngine(buildBundle(docs, { totalBytes: 8192 }));
  const f = findings.find((x) => x.ruleId === 'R-PA-030');
  assert.equal(f.status, 'flag');
});

test('R-PA-035 fires (info) when a hepatically-dosed agent is referenced but no LFT value is present', () => {
  const docs = HAPPY_PACKET.documents.map((d) =>
    d.name === 'note.txt' ? { ...d, text: d.text + '\nPlan: start methotrexate weekly.' } : d);
  const findings = runEngine(buildBundle(docs, { totalBytes: 8192 }));
  const f = findings.find((x) => x.ruleId === 'R-PA-035');
  assert.equal(f.status, 'info');
});

test('R-PA-038 flags when resubmission is declared but no prior-auth-denial document is attached', () => {
  const docs = HAPPY_PACKET.documents.map((d) =>
    d.name === 'pa-form.txt' ? { ...d, text: d.text + '\nThis is a resubmission.' } : d);
  const findings = runEngine(buildBundle(docs, { totalBytes: 8192 }));
  const f = findings.find((x) => x.ruleId === 'R-PA-038');
  assert.equal(f.status, 'flag');
});

test('R-PA-039 flags when a resubmission is declared but no prior PA reference number is present', () => {
  const docs = HAPPY_PACKET.documents.map((d) =>
    d.name === 'pa-form.txt' ? { ...d, text: d.text + '\nResubmission for reconsideration.' } : d);
  const findings = runEngine(buildBundle(docs, { totalBytes: 8192 }));
  const f = findings.find((x) => x.ruleId === 'R-PA-039');
  assert.equal(f.status, 'flag');
});

test('R-PA-052 flags when an external-cause ICD-10 code is present but no date of injury anchor is in the packet', () => {
  const docs = HAPPY_PACKET.documents.map((d) =>
    d.name === 'pa-form.txt' ? { ...d, text: d.text + '\nDx: V43.52 driver injured in collision' } : d);
  const findings = runEngine(buildBundle(docs, { totalBytes: 8192 }));
  const f = findings.find((x) => x.ruleId === 'R-PA-052');
  assert.equal(f.status, 'flag');
});

test('R-PA-054 flags when modifier 25 is referenced but no separately-identifiable language is present', () => {
  const docs = HAPPY_PACKET.documents.map((d) =>
    d.name === 'pa-form.txt' ? { ...d, text: d.text + '\nUsing modifier 25 on the E/M.' } : d);
  const findings = runEngine(buildBundle(docs, { totalBytes: 8192 }));
  const f = findings.find((x) => x.ruleId === 'R-PA-054');
  assert.equal(f.status, 'flag');
});

test('R-PA-055 flags when "bilateral" is mentioned but modifier 50 is not on the CPT line', () => {
  const docs = HAPPY_PACKET.documents.map((d) =>
    d.name === 'note.txt' ? { ...d, text: d.text + '\nBilateral knee assessment.' } : d);
  const findings = runEngine(buildBundle(docs, { totalBytes: 8192 }));
  const f = findings.find((x) => x.ruleId === 'R-PA-055');
  assert.equal(f.status, 'flag');
});

test('R-PA-058 flags when an unlisted-procedure anchor is present without a narrative', () => {
  const docs = HAPPY_PACKET.documents.map((d) =>
    d.name === 'pa-form.txt' ? { ...d, text: d.text + '\nRequest: unlisted procedure.' } : d);
  const findings = runEngine(buildBundle(docs, { totalBytes: 8192 }));
  const f = findings.find((x) => x.ruleId === 'R-PA-058');
  assert.equal(f.status, 'flag');
});

test('R-PA-059 flags when consent date is after the service date', () => {
  const docs = HAPPY_PACKET.documents.map((d) =>
    d.name === 'pa-form.txt' ? { ...d, text: d.text + '\nInformed consent signed 2026-05-15.' } : d);
  const findings = runEngine(buildBundle(docs, { totalBytes: 8192 }));
  const f = findings.find((x) => x.ruleId === 'R-PA-059');
  assert.equal(f.status, 'flag');
});

// ---- wave 52-1f new-rule sanity checks ----

test('R-PA-002 fires when no DOB block is present', () => {
  const findings = runEngine(bundleOf(HAPPY_TEXT.replace(/DOB:.*\n/, '')));
  const f = findings.find((x) => x.ruleId === 'R-PA-002');
  assert.equal(f.status, 'block');
});

test('R-PA-003 fires when no member-ID block is present', () => {
  const findings = runEngine(bundleOf(HAPPY_TEXT.replace(/Member ID:.*\n/, '')));
  const f = findings.find((x) => x.ruleId === 'R-PA-003');
  assert.equal(f.status, 'block');
});

test('R-PA-006 fires when service date is more than 365 days in the future', () => {
  const future = HAPPY_TEXT.replace('2026-04-12', '2099-01-01');
  const findings = runEngine(bundleOf(future));
  const f = findings.find((x) => x.ruleId === 'R-PA-006');
  assert.equal(f.status, 'block');
});

test('R-PA-015 fires when no quantity field is present', () => {
  const findings = runEngine(bundleOf(HAPPY_TEXT.replace(/Quantity:.*\n/, '')));
  const f = findings.find((x) => x.ruleId === 'R-PA-015');
  assert.equal(f.status, 'block');
});

test('R-PA-017 fires when no signature anchor is present', () => {
  const findings = runEngine(bundleOf(HAPPY_TEXT.replace(/Signature:.*\n/, '')));
  const f = findings.find((x) => x.ruleId === 'R-PA-017');
  assert.equal(f.status, 'block');
});

test('R-PA-018 fires when signature is present but undated', () => {
  const findings = runEngine(bundleOf(HAPPY_TEXT.replace('Signature: Jane Doe MD, 2026-04-12', 'Signature: Jane Doe MD')));
  const f = findings.find((x) => x.ruleId === 'R-PA-018');
  assert.equal(f.status, 'block');
});

test('R-PA-021 fires when no clinical-note anchor is present', () => {
  const findings = runEngine(bundleOf(HAPPY_TEXT.replace('Chief complaint: hypertension follow-up', '')));
  const f = findings.find((x) => x.ruleId === 'R-PA-021');
  assert.equal(f.status, 'block');
});

test('R-PA-045 flags when totalBytes exceeds the default 50 MB ceiling', () => {
  const findings = runEngine(bundleOf(HAPPY_TEXT, { totalBytes: 60 * 1024 * 1024 }));
  const f = findings.find((x) => x.ruleId === 'R-PA-045');
  assert.equal(f.status, 'flag');
});

test('R-PA-046 flags when extracted text contains U+FFFD characters', () => {
  const findings = runEngine(bundleOf(HAPPY_TEXT + 'mo�jibake here\n'));
  const f = findings.find((x) => x.ruleId === 'R-PA-046');
  assert.equal(f.status, 'flag');
});

// ---- wave 52-1h sanity checks ----

test('R-PA-019 flags when only one Luhn-valid NPI is in the packet', () => {
  const findings = runEngine(bundleOf(HAPPY_TEXT));
  const f = findings.find((x) => x.ruleId === 'R-PA-019');
  assert.equal(f.status, 'flag');
});

test('R-PA-023 flags when no clinical-note document mentions the requested CPT', () => {
  // Use the multi-doc happy packet but strip the CPT from the note.
  const docs = HAPPY_PACKET.documents.map((d) =>
    d.name === 'note.txt' ? { ...d, text: d.text.replace('99213-level office visit, daily lisinopril', 'office visit, daily lisinopril') } : d);
  const findings = runEngine(buildBundle(docs, { totalBytes: 8192 }));
  const f = findings.find((x) => x.ruleId === 'R-PA-023');
  assert.equal(f.status, 'flag');
});

test('R-PA-025 flags when packet references labs but no lab-result document is attached', () => {
  // PA form mentions labs, but no lab document in the bundle.
  const docs = HAPPY_PACKET.documents.filter((d) => d.name !== 'lab.txt');
  const findings = runEngine(buildBundle(docs, { totalBytes: 6144 }));
  const f = findings.find((x) => x.ruleId === 'R-PA-025');
  assert.equal(f.status, 'flag');
});

test('R-PA-027 flags when an attached lab-result is undated or stale', () => {
  const docs = HAPPY_PACKET.documents.map((d) =>
    d.name === 'lab.txt' ? { ...d, text: 'Laboratory report\nReference range: 3.5-5.0\nResult: 4.1\n' } : d);
  const findings = runEngine(buildBundle(docs, { totalBytes: 8192 }));
  const f = findings.find((x) => x.ruleId === 'R-PA-027');
  assert.equal(f.status, 'flag');
});

test('R-PA-033 flags when a weight-based-dose anchor is present but no Weight: field', () => {
  // Inject mg/kg trigger but strip Weight.
  const docs = HAPPY_PACKET.documents.map((d) =>
    d.name === 'note.txt' ? { ...d, text: d.text.replace('Weight: 70 kg. Height: 175 cm.', '') + '\nDose: 5 mg/kg' } : d);
  const findings = runEngine(buildBundle(docs, { totalBytes: 8192 }));
  const f = findings.find((x) => x.ruleId === 'R-PA-033');
  assert.equal(f.status, 'flag');
});

test('R-PA-036 flags when no frequency keyword is present', () => {
  const docs = HAPPY_PACKET.documents.map((d) => ({
    ...d,
    text: d.text
      .replace(/Frequency: daily/g, '')
      .replace(/\bdaily\b/g, ''),
  }));
  const findings = runEngine(buildBundle(docs, { totalBytes: 8192 }));
  const f = findings.find((x) => x.ruleId === 'R-PA-036');
  assert.equal(f.status, 'flag');
});

test('R-PA-001 fires when no patient-name line is present', () => {
  const findings = runEngine(bundleOf(HAPPY_TEXT.replace(/Patient:.*\n/, '')));
  const f = findings.find((x) => x.ruleId === 'R-PA-001');
  assert.equal(f.status, 'block');
});

test('R-PA-004 fires when no date is in the packet', () => {
  const findings = runEngine(bundleOf('Patient: Jane Doe\nProc 99213\nDx I10\nPOS: 11\nNPI 1234567893\n'));
  const f = findings.find((x) => x.ruleId === 'R-PA-004');
  assert.equal(f.status, 'block');
});

test('R-PA-007 fires when no CPT/HCPCS code is present', () => {
  const findings = runEngine(bundleOf(HAPPY_TEXT.replace(/Procedure 99213.*\n/, '')));
  const f = findings.find((x) => x.ruleId === 'R-PA-007');
  assert.equal(f.status, 'block');
});

test('R-PA-010 fires when no ICD-10 code is present', () => {
  const findings = runEngine(bundleOf(HAPPY_TEXT.replace(/Dx:.*\n/, '')));
  const f = findings.find((x) => x.ruleId === 'R-PA-010');
  assert.equal(f.status, 'block');
});

test('R-PA-013 fires when no POS line is present', () => {
  const findings = runEngine(bundleOf(HAPPY_TEXT.replace(/Place of service:.*\n/, '')));
  const f = findings.find((x) => x.ruleId === 'R-PA-013');
  assert.equal(f.status, 'block');
});

test('R-PA-013 fires when POS code is not on the bundled CMS list', () => {
  const findings = runEngine(bundleOf(HAPPY_TEXT.replace('Place of service: 11', 'Place of service: 88')));
  const f = findings.find((x) => x.ruleId === 'R-PA-013');
  assert.equal(f.status, 'block');
  assert.match(f.note, /not on bundled CMS list/);
});

test('R-PA-016 fires when NPI fails Luhn', () => {
  const findings = runEngine(bundleOf(HAPPY_TEXT.replace('1234567893', '1234567890')));
  const f = findings.find((x) => x.ruleId === 'R-PA-016');
  assert.equal(f.status, 'block');
});

test('R-PA-041 flags an SSN-shaped string in the packet', () => {
  const findings = runEngine(bundleOf(HAPPY_TEXT + 'Member SSN 123-45-6789 on file.\n'));
  const f = findings.find((x) => x.ruleId === 'R-PA-041');
  assert.equal(f.status, 'flag');
});

test('runEngine output order is deterministic across runs', () => {
  const a = runEngine(bundleOf(HAPPY_TEXT));
  const b = runEngine(bundleOf(HAPPY_TEXT));
  assert.deepEqual(a, b);
});

test('runEngine catches throws from rule.check and records an error finding', () => {
  const badRule = {
    id: 'R-PA-XXX',
    description: 'always throws',
    severity: 'flag',
    citation: 'test',
    check() { throw new Error('boom'); },
  };
  const findings = runEngine(bundleOf(HAPPY_TEXT), [badRule]);
  assert.equal(findings.length, 1);
  assert.equal(findings[0].status, 'error');
  assert.match(findings[0].note, /boom/);
});

test('runEngine is order-independent in input documents (property)', () => {
  const a = runEngine(buildBundle([
    { name: 'a.txt', sha256: '1', kind: 'TXT', text: HAPPY_TEXT },
    { name: 'b.txt', sha256: '2', kind: 'TXT', text: 'Random unrelated text.' },
  ]));
  const b = runEngine(buildBundle([
    { name: 'b.txt', sha256: '2', kind: 'TXT', text: 'Random unrelated text.' },
    { name: 'a.txt', sha256: '1', kind: 'TXT', text: HAPPY_TEXT },
  ]));
  // Findings depend on aggregate-presence, not on which document carries
  // the evidence, so the two orderings must agree on every rule status.
  for (let i = 0; i < a.length; i += 1) {
    assert.equal(a[i].ruleId, b[i].ruleId);
    assert.equal(a[i].status, b[i].status);
  }
});
