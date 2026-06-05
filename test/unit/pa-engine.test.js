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

test('STARTER_RULES at wave 52-41 is 815 rules (135 §4.5 core/overlay/specialty + 20 each for the 23 commercial overlays + 20 each for 11 per-state Medicaid overlays: CA + NY + TX + FL + OH + IL + WA + GA + NC + PA + MI)', () => {
  assert.equal(STARTER_RULES.length, 815);
});

// ---- wave 52-7a sanity checks: Aetna commercial overlay (§4.5.7) ----

test('Aetna overlay rules vacuously pass on a non-Aetna packet', () => {
  // happyBundle is not an Aetna packet -> every R-PA-AETNA-* rule passes.
  const findings = runEngine(happyBundle());
  for (let n = 1; n <= 20; n += 1) {
    const id = 'R-PA-AETNA-' + String(n).padStart(3, '0');
    const f = findings.find((x) => x.ruleId === id);
    assert.ok(f, id + ' should be in the findings');
    assert.equal(f.status, 'pass', id + ' should vacuously pass off-bucket');
  }
});

test('R-PA-AETNA-001 flags an Aetna request with a procedure but no medical-necessity criteria reference', () => {
  const text = 'Aetna Choice POS II member.\n'
    + 'Requested procedure: CPT 72148 (MRI lumbar spine).\n'
    + 'Please authorize.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-AETNA-001');
  assert.equal(f.status, 'flag');
});

test('R-PA-AETNA-001 passes when the Aetna packet cites the applicable CPB / medical necessity', () => {
  const text = 'Aetna Choice POS II member.\n'
    + 'Requested procedure: CPT 72148 (MRI lumbar spine).\n'
    + 'Medical necessity: persistent radiculopathy per Aetna Clinical Policy Bulletin.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-AETNA-001');
  assert.equal(f.status, 'pass');
});

test('R-PA-AETNA-002 flags an Aetna packet with no clinical document attached', () => {
  const text = 'Aetna PPO member.\nRequested procedure: CPT 72148.\nMedical necessity per CPB.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-AETNA-002');
  assert.equal(f.status, 'flag');
});

test('R-PA-AETNA-005 flags an Aetna spinal-fusion request without a questionnaire response', () => {
  const text = 'Aetna commercial member.\n'
    + 'Requested procedure: lumbar fusion (CPT 22633).\n'
    + 'Medical necessity per Aetna CPB.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-AETNA-005');
  assert.equal(f.status, 'flag');
});

// ---- wave 52-7b sanity checks (Aetna rules 6-10) ----

test('R-PA-AETNA-006 flags an inpatient (POS 21) Aetna request with no discharge / progress documentation', () => {
  const text = 'Aetna PPO member.\nPlace of service: 21\nInpatient admission for lumbar fusion CPT 22633.\nMedical necessity per CPB.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-AETNA-006');
  assert.equal(f.status, 'flag');
});

test('R-PA-AETNA-006 passes when the inpatient Aetna packet documents a discharge plan', () => {
  const text = 'Aetna PPO member.\nPlace of service: 21\nInpatient admission.\nDischarge plan: home with PT; estimated length of stay 2 days.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-AETNA-006');
  assert.equal(f.status, 'pass');
});

test('R-PA-AETNA-007 flags a hospital-outpatient (POS 22) Aetna MRI with no site-of-care justification', () => {
  const text = 'Aetna member.\nPlace of service: 22\nMRI brain CPT 70551 at hospital outpatient imaging.\nMedical necessity per CPB.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-AETNA-007');
  assert.equal(f.status, 'flag');
});

test('R-PA-AETNA-008 flags an expedited Aetna request with no clinical urgency stated', () => {
  const text = 'Aetna member.\nExpedited / urgent request.\nRequested procedure: MRI brain CPT 70551.\nMedical necessity per CPB.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-AETNA-008');
  assert.equal(f.status, 'flag');
});

test('R-PA-AETNA-008 passes when an expedited Aetna request documents the clinical urgency', () => {
  const text = 'Aetna member.\nExpedited / urgent request: delay would seriously jeopardize the life or health of the member.\nMRI brain CPT 70551.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-AETNA-008');
  assert.equal(f.status, 'pass');
});

test('R-PA-AETNA-009 flags an Aetna blepharoplasty request with no visual-field / photographic evidence', () => {
  const text = 'Aetna member.\nRequested procedure: blepharoplasty CPT 15823.\nMedical necessity per CPB.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-AETNA-009');
  assert.equal(f.status, 'flag');
});

test('R-PA-AETNA-010 flags an Aetna J-code drug request with no NDC', () => {
  const text = 'Aetna member.\nRequested drug: J9299 nivolumab infusion.\nMedical necessity per CPB.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-AETNA-010');
  assert.equal(f.status, 'info');
});

// ---- wave 52-7c sanity checks (Aetna rules 11-15) ----

test('R-PA-AETNA-011 flags an Aetna specialty-drug request with no step-therapy prior-trial documentation', () => {
  const text = 'Aetna member.\nSpecialty medication precertification: J9299 nivolumab.\nMedical necessity per CPB.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-AETNA-011');
  assert.equal(f.status, 'flag');
});

test('R-PA-AETNA-011 passes when prior tried-and-failed therapy is documented', () => {
  const text = 'Aetna member.\nSpecialty medication precertification: J9299 nivolumab.\nPrior therapy: tried and failed carboplatin/pemetrexed with therapeutic failure.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-AETNA-011');
  assert.equal(f.status, 'pass');
});

test('R-PA-AETNA-012 flags an Aetna bariatric request missing BMI or a supervised weight-management program', () => {
  const text = 'Aetna member.\nRequested procedure: sleeve gastrectomy (obesity surgery).\nMedical necessity per CPB 0157.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-AETNA-012');
  assert.equal(f.status, 'flag');
});

test('R-PA-AETNA-012 passes when BMI and a supervised weight-management program are documented', () => {
  const text = 'Aetna member.\nRequested procedure: sleeve gastrectomy.\nBMI 43. Completed a 6-month physician-supervised weight management program with a dietitian.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-AETNA-012');
  assert.equal(f.status, 'pass');
});

test('R-PA-AETNA-013 flags an Aetna genetic-testing request with no counseling / family history', () => {
  const text = 'Aetna member.\nRequested test: hereditary cancer gene panel (BRCA), CPT 81432.\nMedical necessity per CPB 0140.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-AETNA-013');
  assert.equal(f.status, 'flag');
});

test('R-PA-AETNA-014 flags a retrospective Aetna request with no justification (info)', () => {
  const text = 'Aetna member.\nRetrospective review request for services already rendered.\nProcedure CPT 70551.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-AETNA-014');
  assert.equal(f.status, 'info');
});

test('R-PA-AETNA-015 flags an Aetna elective surgery in an inpatient setting with no site rationale (info)', () => {
  const text = 'Aetna member.\nPlace of service: 21\nInpatient admission for knee arthroplasty CPT 27447.\nMedical necessity per CPB.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-AETNA-015');
  assert.equal(f.status, 'info');
});

// ---- wave 52-7d sanity checks (Aetna rules 16-20) ----

test('R-PA-AETNA-016 flags an Aetna DME / home-health request with no signed written order', () => {
  const text = 'Aetna member.\nDurable medical equipment: hospital bed requested for home use.\nMedical necessity per CPB.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-AETNA-016');
  assert.equal(f.status, 'flag');
});

test('R-PA-AETNA-016 passes when the DME request carries a signed written order', () => {
  const text = 'Aetna member.\nDurable medical equipment: hospital bed.\nStandard written order on file.\nSignature: Ordering MD, 2026-06-01\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-AETNA-016');
  assert.equal(f.status, 'pass');
});

test('R-PA-AETNA-017 flags an Aetna transplant request with no NME / IOE routing', () => {
  const text = 'Aetna member.\nRequested service: kidney transplant.\nMedical necessity per CPB.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-AETNA-017');
  assert.equal(f.status, 'flag');
});

test('R-PA-AETNA-017 passes when the transplant request references the NME / IOE program', () => {
  const text = 'Aetna member.\nRequested service: kidney transplant.\nRouted through the National Medical Excellence program; transplant center evaluation attached.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-AETNA-017');
  assert.equal(f.status, 'pass');
});

test('R-PA-AETNA-018 flags an Aetna experimental service with no supporting evidence', () => {
  const text = 'Aetna member.\nRequested service is considered investigational for this indication.\nProcedure CPT 0xxxxT.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-AETNA-018');
  assert.equal(f.status, 'flag');
});

test('R-PA-AETNA-018 passes when peer-reviewed evidence accompanies the experimental request', () => {
  const text = 'Aetna member.\nService labeled investigational; peer-reviewed evidence and NCCN compendia support attached.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-AETNA-018');
  assert.equal(f.status, 'pass');
});

test('R-PA-AETNA-019 flags an Aetna appeal with no reference to the original determination (info)', () => {
  const text = 'Aetna member.\nThis is an appeal of the precertification.\nPlease overturn the denial.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-AETNA-019');
  assert.equal(f.status, 'info');
});

test('R-PA-AETNA-020 flags an Aetna out-of-network request with no network-gap justification (info)', () => {
  const text = 'Aetna member.\nOut-of-network precertification request.\nProcedure CPT 70551.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-AETNA-020');
  assert.equal(f.status, 'info');
});

// ---- wave 52-8 sanity checks: UnitedHealthcare commercial overlay (§4.5.8) ----

test('UnitedHealthcare overlay rules vacuously pass on a non-UHC packet', () => {
  // happyBundle is not a UHC packet -> every R-PA-UHC-* rule passes.
  const findings = runEngine(happyBundle());
  for (let n = 1; n <= 20; n += 1) {
    const id = 'R-PA-UHC-' + String(n).padStart(3, '0');
    const f = findings.find((x) => x.ruleId === id);
    assert.ok(f, id + ' should be in the findings');
    assert.equal(f.status, 'pass', id + ' should vacuously pass off-bucket');
  }
});

test('R-PA-UHC-001 flags a UHC request with a procedure but no coverage-criteria reference', () => {
  const text = 'UnitedHealthcare Choice Plus member.\n'
    + 'Requested procedure: CPT 72148 (MRI lumbar spine).\n'
    + 'Please authorize.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-UHC-001');
  assert.equal(f.status, 'flag');
});

test('R-PA-UHC-001 passes when the UHC packet cites the applicable Coverage Determination Guideline', () => {
  const text = 'UnitedHealthcare member.\n'
    + 'Requested procedure: CPT 72148.\n'
    + 'Medical necessity per the applicable UHC Coverage Determination Guideline (MCG).\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-UHC-001');
  assert.equal(f.status, 'pass');
});

test('R-PA-UHC-002 flags a UHC packet with no clinical document attached', () => {
  const text = 'UnitedHealthcare PPO member.\nRequested procedure: CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-UHC-002');
  assert.equal(f.status, 'flag');
});

test('R-PA-UHC-005 flags a notification-required UHC service with no notification reference', () => {
  const text = 'UnitedHealthcare member.\nThis service requires notification / prior authorization required.\nProcedure CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-UHC-005');
  assert.equal(f.status, 'flag');
});

test('R-PA-UHC-006 flags an inpatient (POS 21) UHC request with no admission / progress documentation', () => {
  const text = 'UnitedHealthcare member.\nPlace of service: 21\nInpatient admission for acute care.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-UHC-006');
  assert.equal(f.status, 'flag');
});

test('R-PA-UHC-006 passes when the inpatient UHC packet documents an admission notification + discharge plan', () => {
  const text = 'UnitedHealthcare member.\nPlace of service: 21\nInpatient admission.\nAdmission notification submitted. Discharge plan: home with PT; estimated length of stay 2 days.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-UHC-006');
  assert.equal(f.status, 'pass');
});

test('R-PA-UHC-007 flags a UHC outpatient MRI with no clinical indication', () => {
  const text = 'UnitedHealthcare member.\nRequested: MRI lumbar spine, CPT 72148.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-UHC-007');
  assert.equal(f.status, 'flag');
});

test('R-PA-UHC-008 passes when an expedited UHC request documents the clinical urgency', () => {
  const text = 'UnitedHealthcare member.\nExpedited review requested: delay would jeopardize the member\'s life or health.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-UHC-008');
  assert.equal(f.status, 'pass');
});

test('R-PA-UHC-011 flags a UHC specialty-drug request with no step-therapy prior-trial documentation', () => {
  const text = 'UnitedHealthcare member.\nSpecialty drug requested via OptumRx; step therapy applies.\nProcedure J3590.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-UHC-011');
  assert.equal(f.status, 'flag');
});

test('R-PA-UHC-016 flags a UHC behavioral-health request with no level-of-care criteria', () => {
  const text = 'UnitedHealthcare member.\nRequest: inpatient psychiatric admission (Optum Behavioral Health).\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-UHC-016');
  assert.equal(f.status, 'flag');
});

test('R-PA-UHC-020 flags a UHC out-of-network request with no network-gap justification (info)', () => {
  const text = 'UnitedHealthcare member.\nOut-of-network prior authorization request.\nProcedure CPT 70551.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-UHC-020');
  assert.equal(f.status, 'info');
});

// ---- wave 52-9 sanity checks: Anthem commercial overlay (§4.5.9) ----

test('Anthem overlay rules vacuously pass on a non-Anthem packet', () => {
  // happyBundle is not an Anthem packet -> every R-PA-ANTHEM-* rule passes.
  const findings = runEngine(happyBundle());
  for (let n = 1; n <= 20; n += 1) {
    const id = 'R-PA-ANTHEM-' + String(n).padStart(3, '0');
    const f = findings.find((x) => x.ruleId === id);
    assert.ok(f, id + ' should be in the findings');
    assert.equal(f.status, 'pass', id + ' should vacuously pass off-bucket');
  }
});

test('R-PA-ANTHEM-001 flags an Anthem request with a procedure but no medical-necessity criteria reference', () => {
  const text = 'Anthem Blue Cross PPO member.\n'
    + 'Requested procedure: CPT 72148 (MRI lumbar spine).\n'
    + 'Please authorize.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-ANTHEM-001');
  assert.equal(f.status, 'flag');
});

test('R-PA-ANTHEM-001 passes when the Anthem packet cites the applicable Clinical UM Guideline', () => {
  const text = 'Anthem member.\n'
    + 'Requested procedure: CPT 72148.\n'
    + 'Medical necessity per the applicable Anthem Clinical UM Guideline (MCG).\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-ANTHEM-001');
  assert.equal(f.status, 'pass');
});

test('R-PA-ANTHEM-002 flags an Anthem packet with no clinical document attached', () => {
  const text = 'Anthem Blue Cross PPO member.\nRequested procedure: CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-ANTHEM-002');
  assert.equal(f.status, 'flag');
});

test('R-PA-ANTHEM-003 passes when the Anthem packet names the Availity / Interactive Care Reviewer channel (info)', () => {
  const text = 'Anthem member.\nSubmitted via Availity Interactive Care Reviewer.\nProcedure CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-ANTHEM-003');
  assert.equal(f.status, 'pass');
});

test('R-PA-ANTHEM-006 flags an inpatient (POS 21) Anthem request with no admission / progress documentation', () => {
  const text = 'Anthem member.\nPlace of service: 21\nInpatient admission for acute care.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-ANTHEM-006');
  assert.equal(f.status, 'flag');
});

test('R-PA-ANTHEM-007 flags an Anthem outpatient MRI with no clinical indication', () => {
  const text = 'Anthem member.\nRequested: MRI lumbar spine, CPT 72148.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-ANTHEM-007');
  assert.equal(f.status, 'flag');
});

test('R-PA-ANTHEM-008 passes when an expedited Anthem request documents the clinical urgency', () => {
  const text = 'Anthem member.\nExpedited review requested: delay would jeopardize the member\'s life or health.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-ANTHEM-008');
  assert.equal(f.status, 'pass');
});

test('R-PA-ANTHEM-011 flags an Anthem specialty-drug request with no step-therapy prior-trial documentation', () => {
  const text = 'Anthem member.\nSpecialty drug requested via CarelonRx; step therapy applies.\nProcedure J3590.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-ANTHEM-011');
  assert.equal(f.status, 'flag');
});

test('R-PA-ANTHEM-017 flags an Anthem transplant request with no Blue Distinction / network routing', () => {
  const text = 'Anthem member.\nRequested service: kidney transplant.\nMedical necessity per Clinical UM Guideline.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-ANTHEM-017');
  assert.equal(f.status, 'flag');
});

test('R-PA-ANTHEM-020 flags an Anthem out-of-network request with no network-gap justification (info)', () => {
  const text = 'Anthem member.\nOut-of-network prior authorization request.\nProcedure CPT 70551.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-ANTHEM-020');
  assert.equal(f.status, 'info');
});

// ---- wave 52-10 sanity checks: Cigna commercial overlay (§4.5.10) ----

test('Cigna overlay rules vacuously pass on a non-Cigna packet', () => {
  // happyBundle is not a Cigna packet -> every R-PA-CIGNA-* rule passes.
  const findings = runEngine(happyBundle());
  for (let n = 1; n <= 20; n += 1) {
    const id = 'R-PA-CIGNA-' + String(n).padStart(3, '0');
    const f = findings.find((x) => x.ruleId === id);
    assert.ok(f, id + ' should be in the findings');
    assert.equal(f.status, 'pass', id + ' should vacuously pass off-bucket');
  }
});

test('R-PA-CIGNA-001 flags a Cigna request with a procedure but no coverage-criteria reference', () => {
  const text = 'Cigna Open Access Plus member.\n'
    + 'Requested procedure: CPT 72148 (MRI lumbar spine).\n'
    + 'Please authorize.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-CIGNA-001');
  assert.equal(f.status, 'flag');
});

test('R-PA-CIGNA-001 passes when the Cigna packet cites the applicable Medical Coverage Policy', () => {
  const text = 'Cigna member.\n'
    + 'Requested procedure: CPT 72148.\n'
    + 'Medical necessity per the applicable Cigna Medical Coverage Policy (MCG).\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-CIGNA-001');
  assert.equal(f.status, 'pass');
});

test('R-PA-CIGNA-002 flags a Cigna packet with no clinical document attached', () => {
  const text = 'Cigna Open Access Plus member.\nRequested procedure: CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-CIGNA-002');
  assert.equal(f.status, 'flag');
});

test('R-PA-CIGNA-003 passes when the Cigna packet names the CignaforHCP / Availity channel (info)', () => {
  const text = 'Cigna member.\nSubmitted via the CignaforHCP provider portal.\nProcedure CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-CIGNA-003');
  assert.equal(f.status, 'pass');
});

test('R-PA-CIGNA-006 flags an inpatient (POS 21) Cigna request with no admission / progress documentation', () => {
  const text = 'Cigna member.\nPlace of service: 21\nInpatient admission for acute care.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-CIGNA-006');
  assert.equal(f.status, 'flag');
});

test('R-PA-CIGNA-007 flags a Cigna outpatient MRI with no clinical indication', () => {
  const text = 'Cigna member.\nRequested: MRI lumbar spine, CPT 72148.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-CIGNA-007');
  assert.equal(f.status, 'flag');
});

test('R-PA-CIGNA-008 passes when an expedited Cigna request documents the clinical urgency', () => {
  const text = 'Cigna member.\nExpedited review requested: delay would jeopardize the member\'s life or health.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-CIGNA-008');
  assert.equal(f.status, 'pass');
});

test('R-PA-CIGNA-011 flags a Cigna specialty-drug request with no step-therapy prior-trial documentation', () => {
  const text = 'Cigna member.\nSpecialty drug requested via Express Scripts / Accredo; step therapy applies.\nProcedure J3590.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-CIGNA-011');
  assert.equal(f.status, 'flag');
});

test('R-PA-CIGNA-017 flags a Cigna transplant request with no LifeSOURCE / network routing', () => {
  const text = 'Cigna member.\nRequested service: kidney transplant.\nMedical necessity per Medical Coverage Policy.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-CIGNA-017');
  assert.equal(f.status, 'flag');
});

test('R-PA-CIGNA-020 flags a Cigna out-of-network request with no network-gap justification (info)', () => {
  const text = 'Cigna member.\nOut-of-network prior authorization request.\nProcedure CPT 70551.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-CIGNA-020');
  assert.equal(f.status, 'info');
});

// ---- wave 52-11 sanity checks: Humana commercial overlay (§4.5.11) ----

test('Humana overlay rules vacuously pass on a non-Humana packet', () => {
  // happyBundle is not a Humana packet -> every R-PA-HUMANA-* rule passes.
  const findings = runEngine(happyBundle());
  for (let n = 1; n <= 20; n += 1) {
    const id = 'R-PA-HUMANA-' + String(n).padStart(3, '0');
    const f = findings.find((x) => x.ruleId === id);
    assert.ok(f, id + ' should be in the findings');
    assert.equal(f.status, 'pass', id + ' should vacuously pass off-bucket');
  }
});

test('R-PA-HUMANA-001 flags a Humana request with a procedure but no coverage-criteria reference', () => {
  const text = 'Humana ChoiceCare PPO member.\n'
    + 'Requested procedure: CPT 72148 (MRI lumbar spine).\n'
    + 'Please authorize.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-HUMANA-001');
  assert.equal(f.status, 'flag');
});

test('R-PA-HUMANA-001 passes when the Humana packet cites the applicable Medical Coverage Policy', () => {
  const text = 'Humana member.\n'
    + 'Requested procedure: CPT 72148.\n'
    + 'Medical necessity per the applicable Humana Medical Coverage Policy (MCG).\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-HUMANA-001');
  assert.equal(f.status, 'pass');
});

test('R-PA-HUMANA-002 flags a Humana packet with no clinical document attached', () => {
  const text = 'Humana ChoiceCare PPO member.\nRequested procedure: CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-HUMANA-002');
  assert.equal(f.status, 'flag');
});

test('R-PA-HUMANA-003 passes when the Humana packet names the Availity channel (info)', () => {
  const text = 'Humana member.\nSubmitted via the Availity Essentials portal.\nProcedure CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-HUMANA-003');
  assert.equal(f.status, 'pass');
});

test('R-PA-HUMANA-006 flags an inpatient (POS 21) Humana request with no admission / progress documentation', () => {
  const text = 'Humana member.\nPlace of service: 21\nInpatient admission for acute care.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-HUMANA-006');
  assert.equal(f.status, 'flag');
});

test('R-PA-HUMANA-007 flags a Humana outpatient MRI with no clinical indication', () => {
  const text = 'Humana member.\nRequested: MRI lumbar spine, CPT 72148.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-HUMANA-007');
  assert.equal(f.status, 'flag');
});

test('R-PA-HUMANA-008 passes when an expedited Humana request documents the clinical urgency', () => {
  const text = 'Humana member.\nExpedited review requested: delay would jeopardize the member\'s life or health.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-HUMANA-008');
  assert.equal(f.status, 'pass');
});

test('R-PA-HUMANA-011 flags a Humana specialty-drug request with no step-therapy prior-trial documentation', () => {
  const text = 'Humana member.\nSpecialty drug requested via CenterWell Pharmacy; step therapy applies.\nProcedure J3590.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-HUMANA-011');
  assert.equal(f.status, 'flag');
});

test('R-PA-HUMANA-017 flags a Humana transplant request with no National Transplant Network routing', () => {
  const text = 'Humana member.\nRequested service: kidney transplant.\nMedical necessity per Medical Coverage Policy.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-HUMANA-017');
  assert.equal(f.status, 'flag');
});

test('R-PA-HUMANA-020 flags a Humana out-of-network request with no network-gap justification (info)', () => {
  const text = 'Humana member.\nOut-of-network prior authorization request.\nProcedure CPT 70551.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-HUMANA-020');
  assert.equal(f.status, 'info');
});

// ---- wave 52-12 sanity checks: HCSC (Blue Cross Blue Shield) overlay (§4.5.12) ----

test('HCSC overlay rules vacuously pass on a non-HCSC packet', () => {
  // happyBundle is not an HCSC packet -> every R-PA-HCSC-* rule passes.
  const findings = runEngine(happyBundle());
  for (let n = 1; n <= 20; n += 1) {
    const id = 'R-PA-HCSC-' + String(n).padStart(3, '0');
    const f = findings.find((x) => x.ruleId === id);
    assert.ok(f, id + ' should be in the findings');
    assert.equal(f.status, 'pass', id + ' should vacuously pass off-bucket');
  }
});

test('R-PA-HCSC-001 flags an HCSC request with a procedure but no coverage-criteria reference', () => {
  const text = 'Blue Cross Blue Shield of Illinois PPO member.\n'
    + 'Requested procedure: CPT 72148 (MRI lumbar spine).\n'
    + 'Please authorize.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-HCSC-001');
  assert.equal(f.status, 'flag');
});

test('R-PA-HCSC-001 passes when the HCSC packet cites the applicable Medical Policy', () => {
  const text = 'Blue Cross Blue Shield of Texas member.\n'
    + 'Requested procedure: CPT 72148.\n'
    + 'Medical necessity per the applicable HCSC Medical Policy (MCG).\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-HCSC-001');
  assert.equal(f.status, 'pass');
});

test('R-PA-HCSC-002 flags an HCSC packet with no clinical document attached', () => {
  const text = 'Blue Cross Blue Shield of Illinois PPO member.\nRequested procedure: CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-HCSC-002');
  assert.equal(f.status, 'flag');
});

test('R-PA-HCSC-003 passes when the HCSC packet names the Availity channel (info)', () => {
  const text = 'Health Care Service Corporation member.\nSubmitted via the Availity Essentials portal.\nProcedure CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-HCSC-003');
  assert.equal(f.status, 'pass');
});

test('R-PA-HCSC-006 flags an inpatient (POS 21) HCSC request with no admission / progress documentation', () => {
  const text = 'Blue Cross Blue Shield of Illinois member.\nPlace of service: 21\nInpatient admission for acute care.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-HCSC-006');
  assert.equal(f.status, 'flag');
});

test('R-PA-HCSC-007 flags an HCSC outpatient MRI with no clinical indication', () => {
  const text = 'Blue Cross Blue Shield of Texas member.\nRequested: MRI lumbar spine, CPT 72148.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-HCSC-007');
  assert.equal(f.status, 'flag');
});

test('R-PA-HCSC-008 passes when an expedited HCSC request documents the clinical urgency', () => {
  const text = 'Blue Cross Blue Shield of Illinois member.\nExpedited review requested: delay would jeopardize the member\'s life or health.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-HCSC-008');
  assert.equal(f.status, 'pass');
});

test('R-PA-HCSC-011 flags an HCSC specialty-drug request with no step-therapy prior-trial documentation', () => {
  const text = 'Blue Cross Blue Shield of Illinois member.\nSpecialty drug requested; Prime Therapeutics step therapy applies.\nProcedure J3590.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-HCSC-011');
  assert.equal(f.status, 'flag');
});

test('R-PA-HCSC-017 flags an HCSC transplant request with no Blue Distinction routing', () => {
  const text = 'Blue Cross Blue Shield of Illinois member.\nRequested service: kidney transplant.\nMedical necessity per Medical Policy.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-HCSC-017');
  assert.equal(f.status, 'flag');
});

test('R-PA-HCSC-020 flags an HCSC out-of-network request with no network-gap justification (info)', () => {
  const text = 'Blue Cross Blue Shield of Illinois member.\nOut-of-network prior authorization request.\nProcedure CPT 70551.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-HCSC-020');
  assert.equal(f.status, 'info');
});

// ---- wave 52-13 sanity checks: Highmark (Blue Cross Blue Shield) overlay (§4.5.13) ----

test('Highmark overlay rules vacuously pass on a non-Highmark packet', () => {
  // happyBundle is not a Highmark packet -> every R-PA-HIGHMARK-* rule passes.
  const findings = runEngine(happyBundle());
  for (let n = 1; n <= 20; n += 1) {
    const id = 'R-PA-HIGHMARK-' + String(n).padStart(3, '0');
    const f = findings.find((x) => x.ruleId === id);
    assert.ok(f, id + ' should be in the findings');
    assert.equal(f.status, 'pass', id + ' should vacuously pass off-bucket');
  }
});

test('R-PA-HIGHMARK-001 flags a Highmark request with a procedure but no coverage-criteria reference', () => {
  const text = 'Highmark Blue Shield PPO member.\n'
    + 'Requested procedure: CPT 72148 (MRI lumbar spine).\n'
    + 'Please authorize.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-HIGHMARK-001');
  assert.equal(f.status, 'flag');
});

test('R-PA-HIGHMARK-001 passes when the Highmark packet cites the applicable Medical Policy', () => {
  const text = 'Highmark member.\n'
    + 'Requested procedure: CPT 72148.\n'
    + 'Medical necessity per the applicable Highmark Medical Policy (MCG).\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-HIGHMARK-001');
  assert.equal(f.status, 'pass');
});

test('R-PA-HIGHMARK-002 flags a Highmark packet with no clinical document attached', () => {
  const text = 'Highmark Blue Shield PPO member.\nRequested procedure: CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-HIGHMARK-002');
  assert.equal(f.status, 'flag');
});

test('R-PA-HIGHMARK-003 passes when the Highmark packet names the Availity channel (info)', () => {
  const text = 'Highmark member.\nSubmitted via the Availity Essentials portal.\nProcedure CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-HIGHMARK-003');
  assert.equal(f.status, 'pass');
});

test('R-PA-HIGHMARK-006 flags an inpatient (POS 21) Highmark request with no admission / progress documentation', () => {
  const text = 'Highmark member.\nPlace of service: 21\nInpatient admission for acute care.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-HIGHMARK-006');
  assert.equal(f.status, 'flag');
});

test('R-PA-HIGHMARK-007 flags a Highmark outpatient MRI with no clinical indication', () => {
  const text = 'Highmark member.\nRequested: MRI lumbar spine, CPT 72148.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-HIGHMARK-007');
  assert.equal(f.status, 'flag');
});

test('R-PA-HIGHMARK-008 passes when an expedited Highmark request documents the clinical urgency', () => {
  const text = 'Highmark member.\nExpedited review requested: delay would jeopardize the member\'s life or health.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-HIGHMARK-008');
  assert.equal(f.status, 'pass');
});

test('R-PA-HIGHMARK-011 flags a Highmark specialty-drug request with no step-therapy prior-trial documentation', () => {
  const text = 'Highmark member.\nSpecialty drug requested; Highmark pharmacy step therapy applies.\nProcedure J3590.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-HIGHMARK-011');
  assert.equal(f.status, 'flag');
});

test('R-PA-HIGHMARK-017 flags a Highmark transplant request with no Blue Distinction routing', () => {
  const text = 'Highmark member.\nRequested service: kidney transplant.\nMedical necessity per Medical Policy.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-HIGHMARK-017');
  assert.equal(f.status, 'flag');
});

test('R-PA-HIGHMARK-020 flags a Highmark out-of-network request with no network-gap justification (info)', () => {
  const text = 'Highmark member.\nOut-of-network prior authorization request.\nProcedure CPT 70551.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-HIGHMARK-020');
  assert.equal(f.status, 'info');
});

// ---- wave 52-14 sanity checks: Florida Blue (Blue Cross Blue Shield) overlay (§4.5.14) ----

test('Florida Blue overlay rules vacuously pass on a non-Florida-Blue packet', () => {
  // happyBundle is not a Florida Blue packet -> every R-PA-FLBLUE-* rule passes.
  const findings = runEngine(happyBundle());
  for (let n = 1; n <= 20; n += 1) {
    const id = 'R-PA-FLBLUE-' + String(n).padStart(3, '0');
    const f = findings.find((x) => x.ruleId === id);
    assert.ok(f, id + ' should be in the findings');
    assert.equal(f.status, 'pass', id + ' should vacuously pass off-bucket');
  }
});

test('R-PA-FLBLUE-001 flags a Florida Blue request with a procedure but no coverage-criteria reference', () => {
  const text = 'Florida Blue PPO member.\n'
    + 'Requested procedure: CPT 72148 (MRI lumbar spine).\n'
    + 'Please authorize.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-FLBLUE-001');
  assert.equal(f.status, 'flag');
});

test('R-PA-FLBLUE-001 passes when the Florida Blue packet cites the applicable Medical Policy', () => {
  const text = 'Florida Blue member.\n'
    + 'Requested procedure: CPT 72148.\n'
    + 'Medical necessity per the applicable Florida Blue Medical Policy (MCG).\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-FLBLUE-001');
  assert.equal(f.status, 'pass');
});

test('R-PA-FLBLUE-002 flags a Florida Blue packet with no clinical document attached', () => {
  const text = 'Florida Blue PPO member.\nRequested procedure: CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-FLBLUE-002');
  assert.equal(f.status, 'flag');
});

test('R-PA-FLBLUE-003 passes when the Florida Blue packet names the Availity channel (info)', () => {
  const text = 'Florida Blue member.\nSubmitted via the Availity Essentials portal.\nProcedure CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-FLBLUE-003');
  assert.equal(f.status, 'pass');
});

test('R-PA-FLBLUE-006 flags an inpatient (POS 21) Florida Blue request with no admission / progress documentation', () => {
  const text = 'Florida Blue member.\nPlace of service: 21\nInpatient admission for acute care.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-FLBLUE-006');
  assert.equal(f.status, 'flag');
});

test('R-PA-FLBLUE-007 flags a Florida Blue outpatient MRI with no clinical indication', () => {
  const text = 'Florida Blue member.\nRequested: MRI lumbar spine, CPT 72148.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-FLBLUE-007');
  assert.equal(f.status, 'flag');
});

test('R-PA-FLBLUE-008 passes when an expedited Florida Blue request documents the clinical urgency', () => {
  const text = 'Florida Blue member.\nExpedited review requested: delay would jeopardize the member\'s life or health.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-FLBLUE-008');
  assert.equal(f.status, 'pass');
});

test('R-PA-FLBLUE-011 flags a Florida Blue specialty-drug request with no step-therapy prior-trial documentation', () => {
  const text = 'Florida Blue member.\nSpecialty drug requested; Florida Blue pharmacy step therapy applies.\nProcedure J3590.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-FLBLUE-011');
  assert.equal(f.status, 'flag');
});

test('R-PA-FLBLUE-017 flags a Florida Blue transplant request with no Blue Distinction routing', () => {
  const text = 'Florida Blue member.\nRequested service: kidney transplant.\nMedical necessity per Medical Policy.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-FLBLUE-017');
  assert.equal(f.status, 'flag');
});

test('R-PA-FLBLUE-020 flags a Florida Blue out-of-network request with no network-gap justification (info)', () => {
  const text = 'Florida Blue member.\nOut-of-network prior authorization request.\nProcedure CPT 70551.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-FLBLUE-020');
  assert.equal(f.status, 'info');
});

// ---- wave 52-15 sanity checks: BCBSM (Blue Cross Blue Shield) overlay (§4.5.15) ----

test('BCBSM overlay rules vacuously pass on a non-BCBSM packet', () => {
  // happyBundle is not a BCBSM packet -> every R-PA-BCBSM-* rule passes.
  const findings = runEngine(happyBundle());
  for (let n = 1; n <= 20; n += 1) {
    const id = 'R-PA-BCBSM-' + String(n).padStart(3, '0');
    const f = findings.find((x) => x.ruleId === id);
    assert.ok(f, id + ' should be in the findings');
    assert.equal(f.status, 'pass', id + ' should vacuously pass off-bucket');
  }
});

test('R-PA-BCBSM-001 flags a BCBSM request with a procedure but no coverage-criteria reference', () => {
  const text = 'Blue Cross Blue Shield of Michigan member.\n'
    + 'Requested procedure: CPT 72148 (MRI lumbar spine).\n'
    + 'Please authorize.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BCBSM-001');
  assert.equal(f.status, 'flag');
});

test('R-PA-BCBSM-001 passes when the BCBSM packet cites the applicable Medical Policy', () => {
  const text = 'Blue Cross Blue Shield of Michigan member.\n'
    + 'Requested procedure: CPT 72148.\n'
    + 'Medical necessity per the applicable BCBSM Medical Policy (MCG).\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BCBSM-001');
  assert.equal(f.status, 'pass');
});

test('R-PA-BCBSM-002 flags a BCBSM packet with no clinical document attached', () => {
  const text = 'Blue Cross Blue Shield of Michigan member.\nRequested procedure: CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BCBSM-002');
  assert.equal(f.status, 'flag');
});

test('R-PA-BCBSM-003 passes when the BCBSM packet names the Availity channel (info)', () => {
  const text = 'Blue Cross Blue Shield of Michigan member.\nSubmitted via the Availity Essentials portal.\nProcedure CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BCBSM-003');
  assert.equal(f.status, 'pass');
});

test('R-PA-BCBSM-006 flags an inpatient (POS 21) BCBSM request with no admission / progress documentation', () => {
  const text = 'Blue Cross Blue Shield of Michigan member.\nPlace of service: 21\nInpatient admission for acute care.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BCBSM-006');
  assert.equal(f.status, 'flag');
});

test('R-PA-BCBSM-007 flags a BCBSM outpatient MRI with no clinical indication', () => {
  const text = 'Blue Cross Blue Shield of Michigan member.\nRequested: MRI lumbar spine, CPT 72148.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BCBSM-007');
  assert.equal(f.status, 'flag');
});

test('R-PA-BCBSM-008 passes when an expedited BCBSM request documents the clinical urgency', () => {
  const text = 'Blue Cross Blue Shield of Michigan member.\nExpedited review requested: delay would jeopardize the member\'s life or health.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BCBSM-008');
  assert.equal(f.status, 'pass');
});

test('R-PA-BCBSM-011 flags a BCBSM specialty-drug request with no step-therapy prior-trial documentation', () => {
  const text = 'Blue Cross Blue Shield of Michigan member.\nSpecialty drug requested; BCBSM pharmacy step therapy applies.\nProcedure J3590.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BCBSM-011');
  assert.equal(f.status, 'flag');
});

test('R-PA-BCBSM-017 flags a BCBSM transplant request with no Blue Distinction routing', () => {
  const text = 'Blue Cross Blue Shield of Michigan member.\nRequested service: kidney transplant.\nMedical necessity per Medical Policy.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BCBSM-017');
  assert.equal(f.status, 'flag');
});

test('R-PA-BCBSM-020 flags a BCBSM out-of-network request with no network-gap justification (info)', () => {
  const text = 'Blue Cross Blue Shield of Michigan member.\nOut-of-network prior authorization request.\nProcedure CPT 70551.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BCBSM-020');
  assert.equal(f.status, 'info');
});

// ---- wave 52-16 sanity checks: Blue Shield of California (Blue Cross Blue Shield) overlay (§4.5.16) ----

test('Blue Shield of California overlay rules vacuously pass on a non-Blue-Shield-of-California packet', () => {
  // happyBundle is not a Blue Shield of California packet -> every R-PA-BSCA-* rule passes.
  const findings = runEngine(happyBundle());
  for (let n = 1; n <= 20; n += 1) {
    const id = 'R-PA-BSCA-' + String(n).padStart(3, '0');
    const f = findings.find((x) => x.ruleId === id);
    assert.ok(f, id + ' should be in the findings');
    assert.equal(f.status, 'pass', id + ' should vacuously pass off-bucket');
  }
});

test('R-PA-BSCA-001 flags a Blue Shield of California request with a procedure but no coverage-criteria reference', () => {
  const text = 'Blue Shield of California member.\n'
    + 'Requested procedure: CPT 72148 (MRI lumbar spine).\n'
    + 'Please authorize.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BSCA-001');
  assert.equal(f.status, 'flag');
});

test('R-PA-BSCA-001 passes when the Blue Shield of California packet cites the applicable Medical Policy', () => {
  const text = 'Blue Shield of California member.\n'
    + 'Requested procedure: CPT 72148.\n'
    + 'Medical necessity per the applicable Blue Shield of California Medical Policy (MCG).\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BSCA-001');
  assert.equal(f.status, 'pass');
});

test('R-PA-BSCA-002 flags a Blue Shield of California packet with no clinical document attached', () => {
  const text = 'Blue Shield of California member.\nRequested procedure: CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BSCA-002');
  assert.equal(f.status, 'flag');
});

test('R-PA-BSCA-003 passes when the Blue Shield of California packet names the Availity channel (info)', () => {
  const text = 'Blue Shield of California member.\nSubmitted via the Availity Essentials portal.\nProcedure CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BSCA-003');
  assert.equal(f.status, 'pass');
});

test('R-PA-BSCA-006 flags an inpatient (POS 21) Blue Shield of California request with no admission / progress documentation', () => {
  const text = 'Blue Shield of California member.\nPlace of service: 21\nInpatient admission for acute care.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BSCA-006');
  assert.equal(f.status, 'flag');
});

test('R-PA-BSCA-007 flags a Blue Shield of California outpatient MRI with no clinical indication', () => {
  const text = 'Blue Shield of California member.\nRequested: MRI lumbar spine, CPT 72148.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BSCA-007');
  assert.equal(f.status, 'flag');
});

test('R-PA-BSCA-008 passes when an expedited Blue Shield of California request documents the clinical urgency', () => {
  const text = 'Blue Shield of California member.\nExpedited review requested: delay would jeopardize the member\'s life or health.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BSCA-008');
  assert.equal(f.status, 'pass');
});

test('R-PA-BSCA-011 flags a Blue Shield of California specialty-drug request with no step-therapy prior-trial documentation', () => {
  const text = 'Blue Shield of California member.\nSpecialty drug requested; Blue Shield of California pharmacy step therapy applies.\nProcedure J3590.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BSCA-011');
  assert.equal(f.status, 'flag');
});

test('R-PA-BSCA-017 flags a Blue Shield of California transplant request with no Blue Distinction routing', () => {
  const text = 'Blue Shield of California member.\nRequested service: kidney transplant.\nMedical necessity per Medical Policy.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BSCA-017');
  assert.equal(f.status, 'flag');
});

test('R-PA-BSCA-020 flags a Blue Shield of California out-of-network request with no network-gap justification (info)', () => {
  const text = 'Blue Shield of California member.\nOut-of-network prior authorization request.\nProcedure CPT 70551.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BSCA-020');
  assert.equal(f.status, 'info');
});

// ---- wave 52-17 sanity checks: Independence Blue Cross (Blue Cross Blue Shield) overlay (§4.5.17) ----

test('Independence Blue Cross overlay rules vacuously pass on a non-IBX packet', () => {
  // happyBundle is not an IBX packet -> every R-PA-IBX-* rule passes.
  const findings = runEngine(happyBundle());
  for (let n = 1; n <= 20; n += 1) {
    const id = 'R-PA-IBX-' + String(n).padStart(3, '0');
    const f = findings.find((x) => x.ruleId === id);
    assert.ok(f, id + ' should be in the findings');
    assert.equal(f.status, 'pass', id + ' should vacuously pass off-bucket');
  }
});

test('R-PA-IBX-001 flags a Independence Blue Cross request with a procedure but no coverage-criteria reference', () => {
  const text = 'Independence Blue Cross member.\n'
    + 'Requested procedure: CPT 72148 (MRI lumbar spine).\n'
    + 'Please authorize.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-IBX-001');
  assert.equal(f.status, 'flag');
});

test('R-PA-IBX-001 passes when the Independence Blue Cross packet cites the applicable Medical Policy', () => {
  const text = 'Independence Blue Cross member.\n'
    + 'Requested procedure: CPT 72148.\n'
    + 'Medical necessity per the applicable Independence Blue Cross Medical Policy (MCG).\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-IBX-001');
  assert.equal(f.status, 'pass');
});

test('R-PA-IBX-002 flags an IBX packet with no clinical document attached', () => {
  const text = 'Independence Blue Cross member.\nRequested procedure: CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-IBX-002');
  assert.equal(f.status, 'flag');
});

test('R-PA-IBX-003 passes when the Independence Blue Cross packet names the Availity channel (info)', () => {
  const text = 'Independence Blue Cross member.\nSubmitted via the Availity Essentials portal.\nProcedure CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-IBX-003');
  assert.equal(f.status, 'pass');
});

test('R-PA-IBX-006 flags an inpatient (POS 21) Independence Blue Cross request with no admission / progress documentation', () => {
  const text = 'Independence Blue Cross member.\nPlace of service: 21\nInpatient admission for acute care.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-IBX-006');
  assert.equal(f.status, 'flag');
});

test('R-PA-IBX-007 flags a Independence Blue Cross outpatient MRI with no clinical indication', () => {
  const text = 'Independence Blue Cross member.\nRequested: MRI lumbar spine, CPT 72148.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-IBX-007');
  assert.equal(f.status, 'flag');
});

test('R-PA-IBX-008 passes when an expedited Independence Blue Cross request documents the clinical urgency', () => {
  const text = 'Independence Blue Cross member.\nExpedited review requested: delay would jeopardize the member\'s life or health.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-IBX-008');
  assert.equal(f.status, 'pass');
});

test('R-PA-IBX-011 flags a Independence Blue Cross specialty-drug request with no step-therapy prior-trial documentation', () => {
  const text = 'Independence Blue Cross member.\nSpecialty drug requested; Independence Blue Cross pharmacy step therapy applies.\nProcedure J3590.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-IBX-011');
  assert.equal(f.status, 'flag');
});

test('R-PA-IBX-017 flags a Independence Blue Cross transplant request with no Blue Distinction routing', () => {
  const text = 'Independence Blue Cross member.\nRequested service: kidney transplant.\nMedical necessity per Medical Policy.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-IBX-017');
  assert.equal(f.status, 'flag');
});

test('R-PA-IBX-020 flags a Independence Blue Cross out-of-network request with no network-gap justification (info)', () => {
  const text = 'Independence Blue Cross member.\nOut-of-network prior authorization request.\nProcedure CPT 70551.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-IBX-020');
  assert.equal(f.status, 'info');
});

// ---- wave 52-18 sanity checks: CareFirst BlueCross BlueShield overlay (§4.5.18) ----

test('CareFirst overlay rules vacuously pass on a non-CareFirst packet', () => {
  // happyBundle is not a CareFirst packet -> every R-PA-CAREFIRST-* rule passes.
  const findings = runEngine(happyBundle());
  for (let n = 1; n <= 20; n += 1) {
    const id = 'R-PA-CAREFIRST-' + String(n).padStart(3, '0');
    const f = findings.find((x) => x.ruleId === id);
    assert.ok(f, id + ' should be in the findings');
    assert.equal(f.status, 'pass', id + ' should vacuously pass off-bucket');
  }
});

test('R-PA-CAREFIRST-001 flags a CareFirst request with a procedure but no coverage-criteria reference', () => {
  const text = 'CareFirst BlueCross BlueShield member.\n'
    + 'Requested procedure: CPT 72148 (MRI lumbar spine).\n'
    + 'Please authorize.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-CAREFIRST-001');
  assert.equal(f.status, 'flag');
});

test('R-PA-CAREFIRST-001 passes when the CareFirst packet cites the applicable Medical Policy', () => {
  const text = 'CareFirst member.\n'
    + 'Requested procedure: CPT 72148.\n'
    + 'Medical necessity per the applicable CareFirst Medical Policy (MCG).\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-CAREFIRST-001');
  assert.equal(f.status, 'pass');
});

test('R-PA-CAREFIRST-002 flags a CareFirst packet with no clinical document attached', () => {
  const text = 'CareFirst member.\nRequested procedure: CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-CAREFIRST-002');
  assert.equal(f.status, 'flag');
});

test('R-PA-CAREFIRST-003 passes when the CareFirst packet names the CareFirst Direct channel (info)', () => {
  const text = 'CareFirst member.\nSubmitted via the CareFirst Direct provider portal.\nProcedure CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-CAREFIRST-003');
  assert.equal(f.status, 'pass');
});

test('R-PA-CAREFIRST-007 flags a CareFirst outpatient MRI with no clinical indication', () => {
  const text = 'CareFirst member.\nRequested: MRI lumbar spine, CPT 72148.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-CAREFIRST-007');
  assert.equal(f.status, 'flag');
});

test('R-PA-CAREFIRST-008 passes when an expedited CareFirst request documents the clinical urgency', () => {
  const text = 'CareFirst member.\nExpedited review requested: delay would jeopardize the member\'s life or health.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-CAREFIRST-008');
  assert.equal(f.status, 'pass');
});

test('R-PA-CAREFIRST-017 flags a CareFirst transplant request with no Blue Distinction routing', () => {
  const text = 'CareFirst member.\nRequested service: kidney transplant.\nMedical necessity per Medical Policy.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-CAREFIRST-017');
  assert.equal(f.status, 'flag');
});

test('R-PA-CAREFIRST-020 flags a CareFirst out-of-network request with no network-gap justification (info)', () => {
  const text = 'CareFirst member.\nOut-of-network prior authorization request.\nProcedure CPT 70551.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-CAREFIRST-020');
  assert.equal(f.status, 'info');
});

// ---- wave 52-19 sanity checks: Blue Cross Blue Shield of North Carolina overlay (§4.5.19) ----

test('Blue Cross NC overlay rules vacuously pass on a non-Blue-Cross-NC packet', () => {
  // happyBundle is not a Blue Cross NC packet -> every R-PA-BCBSNC-* rule passes.
  const findings = runEngine(happyBundle());
  for (let n = 1; n <= 20; n += 1) {
    const id = 'R-PA-BCBSNC-' + String(n).padStart(3, '0');
    const f = findings.find((x) => x.ruleId === id);
    assert.ok(f, id + ' should be in the findings');
    assert.equal(f.status, 'pass', id + ' should vacuously pass off-bucket');
  }
});

test('R-PA-BCBSNC-001 flags a Blue Cross NC request with a procedure but no coverage-criteria reference', () => {
  const text = 'Blue Cross Blue Shield of North Carolina member.\n'
    + 'Requested procedure: CPT 72148 (MRI lumbar spine).\n'
    + 'Please authorize.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BCBSNC-001');
  assert.equal(f.status, 'flag');
});

test('R-PA-BCBSNC-001 passes when the Blue Cross NC packet cites the applicable Medical Policy', () => {
  const text = 'Blue Cross Blue Shield of North Carolina member.\n'
    + 'Requested procedure: CPT 72148.\n'
    + 'Medical necessity per the applicable Blue Cross NC Medical Policy (MCG).\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BCBSNC-001');
  assert.equal(f.status, 'pass');
});

test('R-PA-BCBSNC-002 flags a Blue Cross NC packet with no clinical document attached', () => {
  const text = 'Blue Cross Blue Shield of North Carolina member.\nRequested procedure: CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BCBSNC-002');
  assert.equal(f.status, 'flag');
});

test('R-PA-BCBSNC-003 passes when the Blue Cross NC packet names the Blue e channel (info)', () => {
  const text = 'Blue Cross Blue Shield of North Carolina member.\nSubmitted via the Blue e provider portal.\nProcedure CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BCBSNC-003');
  assert.equal(f.status, 'pass');
});

test('R-PA-BCBSNC-007 flags a Blue Cross NC outpatient MRI with no clinical indication', () => {
  const text = 'Blue Cross Blue Shield of North Carolina member.\nRequested: MRI lumbar spine, CPT 72148.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BCBSNC-007');
  assert.equal(f.status, 'flag');
});

test('R-PA-BCBSNC-008 passes when an expedited Blue Cross NC request documents the clinical urgency', () => {
  const text = 'Blue Cross Blue Shield of North Carolina member.\nExpedited review requested: delay would jeopardize the member\'s life or health.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BCBSNC-008');
  assert.equal(f.status, 'pass');
});

test('R-PA-BCBSNC-017 flags a Blue Cross NC transplant request with no Blue Distinction routing', () => {
  const text = 'Blue Cross Blue Shield of North Carolina member.\nRequested service: kidney transplant.\nMedical necessity per Medical Policy.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BCBSNC-017');
  assert.equal(f.status, 'flag');
});

test('R-PA-BCBSNC-020 flags a Blue Cross NC out-of-network request with no network-gap justification (info)', () => {
  const text = 'Blue Cross Blue Shield of North Carolina member.\nOut-of-network prior authorization request.\nProcedure CPT 70551.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BCBSNC-020');
  assert.equal(f.status, 'info');
});

// ---- wave 52-20 sanity checks: Horizon Blue Cross Blue Shield of New Jersey overlay (§4.5.20) ----

test('Horizon overlay rules vacuously pass on a non-Horizon packet', () => {
  // happyBundle is not a Horizon packet -> every R-PA-HORIZON-* rule passes.
  const findings = runEngine(happyBundle());
  for (let n = 1; n <= 20; n += 1) {
    const id = 'R-PA-HORIZON-' + String(n).padStart(3, '0');
    const f = findings.find((x) => x.ruleId === id);
    assert.ok(f, id + ' should be in the findings');
    assert.equal(f.status, 'pass', id + ' should vacuously pass off-bucket');
  }
});

test('R-PA-HORIZON-001 flags a Horizon request with a procedure but no coverage-criteria reference', () => {
  const text = 'Horizon Blue Cross Blue Shield of New Jersey member.\n'
    + 'Requested procedure: CPT 72148 (MRI lumbar spine).\n'
    + 'Please authorize.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-HORIZON-001');
  assert.equal(f.status, 'flag');
});

test('R-PA-HORIZON-001 passes when the Horizon packet cites the applicable Medical Policy', () => {
  const text = 'Horizon Blue Cross Blue Shield of New Jersey member.\n'
    + 'Requested procedure: CPT 72148.\n'
    + 'Medical necessity per the applicable Horizon Medical Policy (MCG).\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-HORIZON-001');
  assert.equal(f.status, 'pass');
});

test('R-PA-HORIZON-002 flags a Horizon packet with no clinical document attached', () => {
  const text = 'Horizon Blue Cross Blue Shield of New Jersey member.\nRequested procedure: CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-HORIZON-002');
  assert.equal(f.status, 'flag');
});

test('R-PA-HORIZON-003 passes when the Horizon packet names the NaviNet channel (info)', () => {
  const text = 'Horizon Blue Cross Blue Shield of New Jersey member.\nSubmitted via the NaviNet provider portal.\nProcedure CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-HORIZON-003');
  assert.equal(f.status, 'pass');
});

test('R-PA-HORIZON-007 flags a Horizon outpatient MRI with no clinical indication', () => {
  const text = 'Horizon Blue Cross Blue Shield of New Jersey member.\nRequested: MRI lumbar spine, CPT 72148.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-HORIZON-007');
  assert.equal(f.status, 'flag');
});

test('R-PA-HORIZON-008 passes when an expedited Horizon request documents the clinical urgency', () => {
  const text = 'Horizon Blue Cross Blue Shield of New Jersey member.\nExpedited review requested: delay would jeopardize the member\'s life or health.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-HORIZON-008');
  assert.equal(f.status, 'pass');
});

test('R-PA-HORIZON-017 flags a Horizon transplant request with no Blue Distinction routing', () => {
  const text = 'Horizon Blue Cross Blue Shield of New Jersey member.\nRequested service: kidney transplant.\nMedical necessity per Medical Policy.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-HORIZON-017');
  assert.equal(f.status, 'flag');
});

test('R-PA-HORIZON-020 flags a Horizon out-of-network request with no network-gap justification (info)', () => {
  const text = 'Horizon Blue Cross Blue Shield of New Jersey member.\nOut-of-network prior authorization request.\nProcedure CPT 70551.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-HORIZON-020');
  assert.equal(f.status, 'info');
});

// ---- wave 52-21 sanity checks: Blue Cross Blue Shield of Tennessee overlay (§4.5.21) ----

test('BCBST overlay rules vacuously pass on a non-BCBST packet', () => {
  // happyBundle is not a BCBST packet -> every R-PA-BCBST-* rule passes.
  const findings = runEngine(happyBundle());
  for (let n = 1; n <= 20; n += 1) {
    const id = 'R-PA-BCBST-' + String(n).padStart(3, '0');
    const f = findings.find((x) => x.ruleId === id);
    assert.ok(f, id + ' should be in the findings');
    assert.equal(f.status, 'pass', id + ' should vacuously pass off-bucket');
  }
});

test('R-PA-BCBST-001 flags a BCBST request with a procedure but no coverage-criteria reference', () => {
  const text = 'Blue Cross Blue Shield of Tennessee member.\n'
    + 'Requested procedure: CPT 72148 (MRI lumbar spine).\n'
    + 'Please authorize.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BCBST-001');
  assert.equal(f.status, 'flag');
});

test('R-PA-BCBST-001 passes when the BCBST packet cites the applicable Medical Policy', () => {
  const text = 'Blue Cross Blue Shield of Tennessee member.\n'
    + 'Requested procedure: CPT 72148.\n'
    + 'Medical necessity per the applicable BCBST Medical Policy (MCG).\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BCBST-001');
  assert.equal(f.status, 'pass');
});

test('R-PA-BCBST-002 flags a BCBST packet with no clinical document attached', () => {
  const text = 'Blue Cross Blue Shield of Tennessee member.\nRequested procedure: CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BCBST-002');
  assert.equal(f.status, 'flag');
});

test('R-PA-BCBST-003 passes when the BCBST packet names the BlueAccess channel (info)', () => {
  const text = 'Blue Cross Blue Shield of Tennessee member.\nSubmitted via the BlueAccess provider portal.\nProcedure CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BCBST-003');
  assert.equal(f.status, 'pass');
});

test('R-PA-BCBST-007 flags a BCBST outpatient MRI with no clinical indication', () => {
  const text = 'Blue Cross Blue Shield of Tennessee member.\nRequested: MRI lumbar spine, CPT 72148.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BCBST-007');
  assert.equal(f.status, 'flag');
});

test('R-PA-BCBST-008 passes when an expedited BCBST request documents the clinical urgency', () => {
  const text = 'Blue Cross Blue Shield of Tennessee member.\nExpedited review requested: delay would jeopardize the member\'s life or health.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BCBST-008');
  assert.equal(f.status, 'pass');
});

test('R-PA-BCBST-017 flags a BCBST transplant request with no Blue Distinction routing', () => {
  const text = 'Blue Cross Blue Shield of Tennessee member.\nRequested service: kidney transplant.\nMedical necessity per Medical Policy.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BCBST-017');
  assert.equal(f.status, 'flag');
});

test('R-PA-BCBST-020 flags a BCBST out-of-network request with no network-gap justification (info)', () => {
  const text = 'Blue Cross Blue Shield of Tennessee member.\nOut-of-network prior authorization request.\nProcedure CPT 70551.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BCBST-020');
  assert.equal(f.status, 'info');
});

// ---- wave 52-22 sanity checks: Blue Cross Blue Shield of Massachusetts overlay (§4.5.22) ----

test('BCBSMA overlay rules vacuously pass on a non-BCBSMA packet', () => {
  // happyBundle is not a BCBSMA packet -> every R-PA-BCBSMA-* rule passes.
  const findings = runEngine(happyBundle());
  for (let n = 1; n <= 20; n += 1) {
    const id = 'R-PA-BCBSMA-' + String(n).padStart(3, '0');
    const f = findings.find((x) => x.ruleId === id);
    assert.ok(f, id + ' should be in the findings');
    assert.equal(f.status, 'pass', id + ' should vacuously pass off-bucket');
  }
});

test('R-PA-BCBSMA-001 flags a BCBSMA request with a procedure but no coverage-criteria reference', () => {
  const text = 'Blue Cross Blue Shield of Massachusetts member.\n'
    + 'Requested procedure: CPT 72148 (MRI lumbar spine).\n'
    + 'Please authorize.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BCBSMA-001');
  assert.equal(f.status, 'flag');
});

test('R-PA-BCBSMA-001 passes when the BCBSMA packet cites the applicable Medical Policy', () => {
  const text = 'Blue Cross Blue Shield of Massachusetts member.\n'
    + 'Requested procedure: CPT 72148.\n'
    + 'Medical necessity per the applicable BCBS of Massachusetts Medical Policy (MCG).\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BCBSMA-001');
  assert.equal(f.status, 'pass');
});

test('R-PA-BCBSMA-002 flags a BCBSMA packet with no clinical document attached', () => {
  const text = 'Blue Cross Blue Shield of Massachusetts member.\nRequested procedure: CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BCBSMA-002');
  assert.equal(f.status, 'flag');
});

test('R-PA-BCBSMA-003 passes when the BCBSMA packet names the Provider Central channel (info)', () => {
  const text = 'Blue Cross Blue Shield of Massachusetts member.\nSubmitted via the Provider Central portal.\nProcedure CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BCBSMA-003');
  assert.equal(f.status, 'pass');
});

test('R-PA-BCBSMA-007 flags a BCBSMA outpatient MRI with no clinical indication', () => {
  const text = 'Blue Cross Blue Shield of Massachusetts member.\nRequested: MRI lumbar spine, CPT 72148.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BCBSMA-007');
  assert.equal(f.status, 'flag');
});

test('R-PA-BCBSMA-008 passes when an expedited BCBSMA request documents the clinical urgency', () => {
  const text = 'Blue Cross Blue Shield of Massachusetts member.\nExpedited review requested: delay would jeopardize the member\'s life or health.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BCBSMA-008');
  assert.equal(f.status, 'pass');
});

test('R-PA-BCBSMA-017 flags a BCBSMA transplant request with no Blue Distinction routing', () => {
  const text = 'Blue Cross Blue Shield of Massachusetts member.\nRequested service: kidney transplant.\nMedical necessity per Medical Policy.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BCBSMA-017');
  assert.equal(f.status, 'flag');
});

test('R-PA-BCBSMA-020 flags a BCBSMA out-of-network request with no network-gap justification (info)', () => {
  const text = 'Blue Cross Blue Shield of Massachusetts member.\nOut-of-network prior authorization request.\nProcedure CPT 70551.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BCBSMA-020');
  assert.equal(f.status, 'info');
});

// ---- wave 52-23 sanity checks: Blue Cross Blue Shield of Alabama overlay (§4.5.23) ----

test('BCBSAL overlay rules vacuously pass on a non-BCBSAL packet', () => {
  // happyBundle is not a BCBSAL packet -> every R-PA-BCBSAL-* rule passes.
  const findings = runEngine(happyBundle());
  for (let n = 1; n <= 20; n += 1) {
    const id = 'R-PA-BCBSAL-' + String(n).padStart(3, '0');
    const f = findings.find((x) => x.ruleId === id);
    assert.ok(f, id + ' should be in the findings');
    assert.equal(f.status, 'pass', id + ' should vacuously pass off-bucket');
  }
});

test('R-PA-BCBSAL-001 flags a BCBSAL request with a procedure but no coverage-criteria reference', () => {
  const text = 'Blue Cross Blue Shield of Alabama member.\n'
    + 'Requested procedure: CPT 72148 (MRI lumbar spine).\n'
    + 'Please authorize.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BCBSAL-001');
  assert.equal(f.status, 'flag');
});

test('R-PA-BCBSAL-001 passes when the BCBSAL packet cites the applicable Medical Policy', () => {
  const text = 'Blue Cross Blue Shield of Alabama member.\n'
    + 'Requested procedure: CPT 72148.\n'
    + 'Medical necessity per the applicable BCBSAL Medical Policy (MCG).\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BCBSAL-001');
  assert.equal(f.status, 'pass');
});

test('R-PA-BCBSAL-002 flags a BCBSAL packet with no clinical document attached', () => {
  const text = 'Blue Cross Blue Shield of Alabama member.\nRequested procedure: CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BCBSAL-002');
  assert.equal(f.status, 'flag');
});

test('R-PA-BCBSAL-003 passes when the BCBSAL packet names the ProviderAccess channel (info)', () => {
  const text = 'Blue Cross Blue Shield of Alabama member.\nSubmitted via the ProviderAccess provider portal.\nProcedure CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BCBSAL-003');
  assert.equal(f.status, 'pass');
});

test('R-PA-BCBSAL-007 flags a BCBSAL outpatient MRI with no clinical indication', () => {
  const text = 'Blue Cross Blue Shield of Alabama member.\nRequested: MRI lumbar spine, CPT 72148.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BCBSAL-007');
  assert.equal(f.status, 'flag');
});

test('R-PA-BCBSAL-008 passes when an expedited BCBSAL request documents the clinical urgency', () => {
  const text = 'Blue Cross Blue Shield of Alabama member.\nExpedited review requested: delay would jeopardize the member\'s life or health.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BCBSAL-008');
  assert.equal(f.status, 'pass');
});

test('R-PA-BCBSAL-017 flags a BCBSAL transplant request with no Blue Distinction routing', () => {
  const text = 'Blue Cross Blue Shield of Alabama member.\nRequested service: kidney transplant.\nMedical necessity per Medical Policy.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BCBSAL-017');
  assert.equal(f.status, 'flag');
});

test('R-PA-BCBSAL-020 flags a BCBSAL out-of-network request with no network-gap justification (info)', () => {
  const text = 'Blue Cross Blue Shield of Alabama member.\nOut-of-network prior authorization request.\nProcedure CPT 70551.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BCBSAL-020');
  assert.equal(f.status, 'info');
});

// ---- wave 52-24 sanity checks: Blue Cross Blue Shield of South Carolina overlay (§4.5.24) ----

test('BCBSSC overlay rules vacuously pass on a non-BCBSSC packet', () => {
  // happyBundle is not a BCBSSC packet -> every R-PA-BCBSSC-* rule passes.
  const findings = runEngine(happyBundle());
  for (let n = 1; n <= 20; n += 1) {
    const id = 'R-PA-BCBSSC-' + String(n).padStart(3, '0');
    const f = findings.find((x) => x.ruleId === id);
    assert.ok(f, id + ' should be in the findings');
    assert.equal(f.status, 'pass', id + ' should vacuously pass off-bucket');
  }
});

test('R-PA-BCBSSC-001 flags a BCBSSC request with a procedure but no coverage-criteria reference', () => {
  const text = 'Blue Cross Blue Shield of South Carolina member.\n'
    + 'Requested procedure: CPT 72148 (MRI lumbar spine).\n'
    + 'Please authorize.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BCBSSC-001');
  assert.equal(f.status, 'flag');
});

test('R-PA-BCBSSC-001 passes when the BCBSSC packet cites the applicable Medical Policy', () => {
  const text = 'Blue Cross Blue Shield of South Carolina member.\n'
    + 'Requested procedure: CPT 72148.\n'
    + 'Medical necessity per the applicable BCBSSC Medical Policy (MCG).\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BCBSSC-001');
  assert.equal(f.status, 'pass');
});

test('R-PA-BCBSSC-002 flags a BCBSSC packet with no clinical document attached', () => {
  const text = 'Blue Cross Blue Shield of South Carolina member.\nRequested procedure: CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BCBSSC-002');
  assert.equal(f.status, 'flag');
});

test('R-PA-BCBSSC-003 passes when the BCBSSC packet names the My Insurance Manager channel (info)', () => {
  const text = 'Blue Cross Blue Shield of South Carolina member.\nSubmitted via the My Insurance Manager provider portal.\nProcedure CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BCBSSC-003');
  assert.equal(f.status, 'pass');
});

test('R-PA-BCBSSC-007 flags a BCBSSC outpatient MRI with no clinical indication', () => {
  const text = 'Blue Cross Blue Shield of South Carolina member.\nRequested: MRI lumbar spine, CPT 72148.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BCBSSC-007');
  assert.equal(f.status, 'flag');
});

test('R-PA-BCBSSC-008 passes when an expedited BCBSSC request documents the clinical urgency', () => {
  const text = 'Blue Cross Blue Shield of South Carolina member.\nExpedited review requested: delay would jeopardize the member\'s life or health.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BCBSSC-008');
  assert.equal(f.status, 'pass');
});

test('R-PA-BCBSSC-017 flags a BCBSSC transplant request with no Blue Distinction routing', () => {
  const text = 'Blue Cross Blue Shield of South Carolina member.\nRequested service: kidney transplant.\nMedical necessity per Medical Policy.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BCBSSC-017');
  assert.equal(f.status, 'flag');
});

test('R-PA-BCBSSC-020 flags a BCBSSC out-of-network request with no network-gap justification (info)', () => {
  const text = 'Blue Cross Blue Shield of South Carolina member.\nOut-of-network prior authorization request.\nProcedure CPT 70551.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BCBSSC-020');
  assert.equal(f.status, 'info');
});

// ---- wave 52-25 sanity checks: Arkansas Blue Cross and Blue Shield overlay (§4.5.25) ----

test('Arkansas Blue Cross overlay rules vacuously pass on a non-Arkansas packet', () => {
  // happyBundle is not an Arkansas Blue Cross packet -> every R-PA-ARKBCBS-* rule passes.
  const findings = runEngine(happyBundle());
  for (let n = 1; n <= 20; n += 1) {
    const id = 'R-PA-ARKBCBS-' + String(n).padStart(3, '0');
    const f = findings.find((x) => x.ruleId === id);
    assert.ok(f, id + ' should be in the findings');
    assert.equal(f.status, 'pass', id + ' should vacuously pass off-bucket');
  }
});

test('R-PA-ARKBCBS-001 flags an Arkansas Blue Cross request with a procedure but no coverage-criteria reference', () => {
  const text = 'Arkansas Blue Cross and Blue Shield member.\n'
    + 'Requested procedure: CPT 72148 (MRI lumbar spine).\n'
    + 'Please authorize.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-ARKBCBS-001');
  assert.equal(f.status, 'flag');
});

test('R-PA-ARKBCBS-001 passes when the Arkansas Blue Cross packet cites the applicable Medical Policy', () => {
  const text = 'Arkansas Blue Cross and Blue Shield member.\n'
    + 'Requested procedure: CPT 72148.\n'
    + 'Medical necessity per the applicable Arkansas Blue Cross Medical Policy (MCG).\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-ARKBCBS-001');
  assert.equal(f.status, 'pass');
});

test('R-PA-ARKBCBS-002 flags an Arkansas Blue Cross packet with no clinical document attached', () => {
  const text = 'Arkansas Blue Cross and Blue Shield member.\nRequested procedure: CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-ARKBCBS-002');
  assert.equal(f.status, 'flag');
});

test('R-PA-ARKBCBS-003 passes when the Arkansas Blue Cross packet names the AHIN channel (info)', () => {
  const text = 'Arkansas Blue Cross and Blue Shield member.\nSubmitted via the AHIN provider portal.\nProcedure CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-ARKBCBS-003');
  assert.equal(f.status, 'pass');
});

test('R-PA-ARKBCBS-007 flags an Arkansas Blue Cross outpatient MRI with no clinical indication', () => {
  const text = 'Arkansas Blue Cross and Blue Shield member.\nRequested: MRI lumbar spine, CPT 72148.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-ARKBCBS-007');
  assert.equal(f.status, 'flag');
});

test('R-PA-ARKBCBS-008 passes when an expedited Arkansas Blue Cross request documents the clinical urgency', () => {
  const text = 'Arkansas Blue Cross and Blue Shield member.\nExpedited review requested: delay would jeopardize the member\'s life or health.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-ARKBCBS-008');
  assert.equal(f.status, 'pass');
});

test('R-PA-ARKBCBS-017 flags an Arkansas Blue Cross transplant request with no Blue Distinction routing', () => {
  const text = 'Arkansas Blue Cross and Blue Shield member.\nRequested service: kidney transplant.\nMedical necessity per Medical Policy.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-ARKBCBS-017');
  assert.equal(f.status, 'flag');
});

test('R-PA-ARKBCBS-020 flags an Arkansas Blue Cross out-of-network request with no network-gap justification (info)', () => {
  const text = 'Arkansas Blue Cross and Blue Shield member.\nOut-of-network prior authorization request.\nProcedure CPT 70551.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-ARKBCBS-020');
  assert.equal(f.status, 'info');
});

// ---- wave 52-26 sanity checks: Blue Cross and Blue Shield of Kansas City overlay (§4.5.26) ----

test('Blue KC overlay rules vacuously pass on a non-Blue-KC packet', () => {
  // happyBundle is not a Blue KC packet -> every R-PA-BLUEKC-* rule passes.
  const findings = runEngine(happyBundle());
  for (let n = 1; n <= 20; n += 1) {
    const id = 'R-PA-BLUEKC-' + String(n).padStart(3, '0');
    const f = findings.find((x) => x.ruleId === id);
    assert.ok(f, id + ' should be in the findings');
    assert.equal(f.status, 'pass', id + ' should vacuously pass off-bucket');
  }
});

test('R-PA-BLUEKC-001 flags a Blue KC request with a procedure but no coverage-criteria reference', () => {
  const text = 'Blue Cross and Blue Shield of Kansas City member.\n'
    + 'Requested procedure: CPT 72148 (MRI lumbar spine).\n'
    + 'Please authorize.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BLUEKC-001');
  assert.equal(f.status, 'flag');
});

test('R-PA-BLUEKC-001 passes when the Blue KC packet cites the applicable Medical Policy', () => {
  const text = 'Blue Cross and Blue Shield of Kansas City member.\n'
    + 'Requested procedure: CPT 72148.\n'
    + 'Medical necessity per the applicable Blue KC Medical Policy (MCG).\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BLUEKC-001');
  assert.equal(f.status, 'pass');
});

test('R-PA-BLUEKC-002 flags a Blue KC packet with no clinical document attached', () => {
  const text = 'Blue Cross and Blue Shield of Kansas City member.\nRequested procedure: CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BLUEKC-002');
  assert.equal(f.status, 'flag');
});

test('R-PA-BLUEKC-003 passes when the Blue KC packet names the Availity channel (info)', () => {
  const text = 'Blue Cross and Blue Shield of Kansas City member.\nSubmitted via the Availity Essentials portal.\nProcedure CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BLUEKC-003');
  assert.equal(f.status, 'pass');
});

test('R-PA-BLUEKC-007 flags a Blue KC outpatient MRI with no clinical indication', () => {
  const text = 'Blue Cross and Blue Shield of Kansas City member.\nRequested: MRI lumbar spine, CPT 72148.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BLUEKC-007');
  assert.equal(f.status, 'flag');
});

test('R-PA-BLUEKC-008 passes when an expedited Blue KC request documents the clinical urgency', () => {
  const text = 'Blue Cross and Blue Shield of Kansas City member.\nExpedited review requested: delay would jeopardize the member\'s life or health.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BLUEKC-008');
  assert.equal(f.status, 'pass');
});

test('R-PA-BLUEKC-017 flags a Blue KC transplant request with no Blue Distinction routing', () => {
  const text = 'Blue Cross and Blue Shield of Kansas City member.\nRequested service: kidney transplant.\nMedical necessity per Medical Policy.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BLUEKC-017');
  assert.equal(f.status, 'flag');
});

test('R-PA-BLUEKC-020 flags a Blue KC out-of-network request with no network-gap justification (info)', () => {
  const text = 'Blue Cross and Blue Shield of Kansas City member.\nOut-of-network prior authorization request.\nProcedure CPT 70551.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BLUEKC-020');
  assert.equal(f.status, 'info');
});

// ---- wave 52-27 sanity checks: Blue Cross and Blue Shield of Minnesota overlay (§4.5.27) ----
// NOTE: the routing line uses the spelled-out plan name, never the bare "BCBSMN"
// acronym, because 'bcbsm' (the Michigan bucket) is a substring of 'bcbsmn'.

test('BCBSMN overlay rules vacuously pass on a non-BCBSMN packet', () => {
  // happyBundle is not a BCBSMN packet -> every R-PA-BCBSMN-* rule passes.
  const findings = runEngine(happyBundle());
  for (let n = 1; n <= 20; n += 1) {
    const id = 'R-PA-BCBSMN-' + String(n).padStart(3, '0');
    const f = findings.find((x) => x.ruleId === id);
    assert.ok(f, id + ' should be in the findings');
    assert.equal(f.status, 'pass', id + ' should vacuously pass off-bucket');
  }
});

test('R-PA-BCBSMN-001 flags a BCBSMN request with a procedure but no coverage-criteria reference', () => {
  const text = 'Blue Cross and Blue Shield of Minnesota member.\n'
    + 'Requested procedure: CPT 72148 (MRI lumbar spine).\n'
    + 'Please authorize.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BCBSMN-001');
  assert.equal(f.status, 'flag');
});

test('R-PA-BCBSMN-001 passes when the BCBSMN packet cites the applicable Medical Policy', () => {
  const text = 'Blue Cross and Blue Shield of Minnesota member.\n'
    + 'Requested procedure: CPT 72148.\n'
    + 'Medical necessity per the applicable Medical Policy (MCG).\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BCBSMN-001');
  assert.equal(f.status, 'pass');
});

test('R-PA-BCBSMN-002 flags a BCBSMN packet with no clinical document attached', () => {
  const text = 'Blue Cross and Blue Shield of Minnesota member.\nRequested procedure: CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BCBSMN-002');
  assert.equal(f.status, 'flag');
});

test('R-PA-BCBSMN-003 passes when the BCBSMN packet names the Availity channel (info)', () => {
  const text = 'Blue Cross and Blue Shield of Minnesota member.\nSubmitted via the Availity Essentials portal.\nProcedure CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BCBSMN-003');
  assert.equal(f.status, 'pass');
});

test('R-PA-BCBSMN-007 flags a BCBSMN outpatient MRI with no clinical indication', () => {
  const text = 'Blue Cross and Blue Shield of Minnesota member.\nRequested: MRI lumbar spine, CPT 72148.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BCBSMN-007');
  assert.equal(f.status, 'flag');
});

test('R-PA-BCBSMN-008 passes when an expedited BCBSMN request documents the clinical urgency', () => {
  const text = 'Blue Cross and Blue Shield of Minnesota member.\nExpedited review requested: delay would jeopardize the member\'s life or health.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BCBSMN-008');
  assert.equal(f.status, 'pass');
});

test('R-PA-BCBSMN-017 flags a BCBSMN transplant request with no Blue Distinction routing', () => {
  const text = 'Blue Cross and Blue Shield of Minnesota member.\nRequested service: kidney transplant.\nMedical necessity per Medical Policy.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BCBSMN-017');
  assert.equal(f.status, 'flag');
});

test('R-PA-BCBSMN-020 flags a BCBSMN out-of-network request with no network-gap justification (info)', () => {
  const text = 'Blue Cross and Blue Shield of Minnesota member.\nOut-of-network prior authorization request.\nProcedure CPT 70551.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BCBSMN-020');
  assert.equal(f.status, 'info');
});

// ---- wave 52-28 sanity checks: Blue Cross and Blue Shield of Louisiana overlay (§4.5.28) ----

test('BCBSLA overlay rules vacuously pass on a non-BCBSLA packet', () => {
  // happyBundle is not a BCBSLA packet -> every R-PA-BCBSLA-* rule passes.
  const findings = runEngine(happyBundle());
  for (let n = 1; n <= 20; n += 1) {
    const id = 'R-PA-BCBSLA-' + String(n).padStart(3, '0');
    const f = findings.find((x) => x.ruleId === id);
    assert.ok(f, id + ' should be in the findings');
    assert.equal(f.status, 'pass', id + ' should vacuously pass off-bucket');
  }
});

test('R-PA-BCBSLA-001 flags a BCBSLA request with a procedure but no coverage-criteria reference', () => {
  const text = 'Blue Cross and Blue Shield of Louisiana member.\n'
    + 'Requested procedure: CPT 72148 (MRI lumbar spine).\n'
    + 'Please authorize.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BCBSLA-001');
  assert.equal(f.status, 'flag');
});

test('R-PA-BCBSLA-001 passes when the BCBSLA packet cites the applicable Medical Policy', () => {
  const text = 'Blue Cross and Blue Shield of Louisiana member.\n'
    + 'Requested procedure: CPT 72148.\n'
    + 'Medical necessity per the applicable BCBSLA Medical Policy (MCG).\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BCBSLA-001');
  assert.equal(f.status, 'pass');
});

test('R-PA-BCBSLA-002 flags a BCBSLA packet with no clinical document attached', () => {
  const text = 'Blue Cross and Blue Shield of Louisiana member.\nRequested procedure: CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BCBSLA-002');
  assert.equal(f.status, 'flag');
});

test('R-PA-BCBSLA-003 passes when the BCBSLA packet names the iLinkBlue channel (info)', () => {
  const text = 'Blue Cross and Blue Shield of Louisiana member.\nSubmitted via the iLinkBlue provider portal.\nProcedure CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BCBSLA-003');
  assert.equal(f.status, 'pass');
});

test('R-PA-BCBSLA-007 flags a BCBSLA outpatient MRI with no clinical indication', () => {
  const text = 'Blue Cross and Blue Shield of Louisiana member.\nRequested: MRI lumbar spine, CPT 72148.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BCBSLA-007');
  assert.equal(f.status, 'flag');
});

test('R-PA-BCBSLA-008 passes when an expedited BCBSLA request documents the clinical urgency', () => {
  const text = 'Blue Cross and Blue Shield of Louisiana member.\nExpedited review requested: delay would jeopardize the member\'s life or health.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BCBSLA-008');
  assert.equal(f.status, 'pass');
});

test('R-PA-BCBSLA-017 flags a BCBSLA transplant request with no Blue Distinction routing', () => {
  const text = 'Blue Cross and Blue Shield of Louisiana member.\nRequested service: kidney transplant.\nMedical necessity per Medical Policy.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BCBSLA-017');
  assert.equal(f.status, 'flag');
});

test('R-PA-BCBSLA-020 flags a BCBSLA out-of-network request with no network-gap justification (info)', () => {
  const text = 'Blue Cross and Blue Shield of Louisiana member.\nOut-of-network prior authorization request.\nProcedure CPT 70551.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BCBSLA-020');
  assert.equal(f.status, 'info');
});

// ---- wave 52-29 sanity checks: HMSA (Blue Cross Blue Shield of Hawaii) overlay (§4.5.29) ----

test('HMSA overlay rules vacuously pass on a non-HMSA packet', () => {
  // happyBundle is not an HMSA packet -> every R-PA-HMSA-* rule passes.
  const findings = runEngine(happyBundle());
  for (let n = 1; n <= 20; n += 1) {
    const id = 'R-PA-HMSA-' + String(n).padStart(3, '0');
    const f = findings.find((x) => x.ruleId === id);
    assert.ok(f, id + ' should be in the findings');
    assert.equal(f.status, 'pass', id + ' should vacuously pass off-bucket');
  }
});

test('R-PA-HMSA-001 flags an HMSA request with a procedure but no coverage-criteria reference', () => {
  const text = 'HMSA member.\n'
    + 'Requested procedure: CPT 72148 (MRI lumbar spine).\n'
    + 'Please authorize.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-HMSA-001');
  assert.equal(f.status, 'flag');
});

test('R-PA-HMSA-001 passes when the HMSA packet cites the applicable Medical Policy', () => {
  const text = 'HMSA member.\n'
    + 'Requested procedure: CPT 72148.\n'
    + 'Medical necessity per the applicable HMSA Medical Policy (MCG).\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-HMSA-001');
  assert.equal(f.status, 'pass');
});

test('R-PA-HMSA-002 flags an HMSA packet with no clinical document attached', () => {
  const text = 'HMSA member.\nRequested procedure: CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-HMSA-002');
  assert.equal(f.status, 'flag');
});

test('R-PA-HMSA-003 passes when the HMSA packet names the HHIN channel (info)', () => {
  const text = 'HMSA member.\nSubmitted via the HHIN provider portal.\nProcedure CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-HMSA-003');
  assert.equal(f.status, 'pass');
});

test('R-PA-HMSA-007 flags an HMSA outpatient MRI with no clinical indication', () => {
  const text = 'HMSA member.\nRequested: MRI lumbar spine, CPT 72148.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-HMSA-007');
  assert.equal(f.status, 'flag');
});

test('R-PA-HMSA-008 passes when an expedited HMSA request documents the clinical urgency', () => {
  const text = 'HMSA member.\nExpedited review requested: delay would jeopardize the member\'s life or health.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-HMSA-008');
  assert.equal(f.status, 'pass');
});

test('R-PA-HMSA-017 flags an HMSA transplant request with no Blue Distinction routing', () => {
  const text = 'HMSA member.\nRequested service: kidney transplant.\nMedical necessity per Medical Policy.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-HMSA-017');
  assert.equal(f.status, 'flag');
});

test('R-PA-HMSA-020 flags an HMSA out-of-network request with no network-gap justification (info)', () => {
  const text = 'HMSA member.\nOut-of-network prior authorization request.\nProcedure CPT 70551.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-HMSA-020');
  assert.equal(f.status, 'info');
});

// ---- wave 52-30 sanity checks: Medi-Cal (California Medicaid) overlay (§4.5.30) ----
// Medi-Cal is the first PER-STATE Medicaid overlay. Two things must hold: the
// state overlay (R-PA-MCAL-*) engages on a Medi-Cal packet, AND the §4.5.4
// state-agnostic Medicaid core (R-PA-MCD-*) keeps firing on it via isMedicaid().

test('Medi-Cal overlay rules vacuously pass on a non-Medi-Cal packet', () => {
  const findings = runEngine(happyBundle());
  for (let n = 1; n <= 20; n += 1) {
    const id = 'R-PA-MCAL-' + String(n).padStart(3, '0');
    const f = findings.find((x) => x.ruleId === id);
    assert.ok(f, id + ' should be in the findings');
    assert.equal(f.status, 'pass', id + ' should vacuously pass off-bucket');
  }
});

test('isMedicaid composition: the state-agnostic Medicaid core (R-PA-MCD) still fires on a Medi-Cal (medicaid-ca) packet', () => {
  // A Medi-Cal packet with no eligibility-verification anchor must trip the
  // core rule R-PA-MCD-003. This is the regression guard for the wave-52-30
  // change that re-pointed the 10 MCD gates from `=== 'medicaid'` to
  // isMedicaid(): adding the per-state bucket must NOT silence the core.
  const text = 'Medi-Cal managed care member.\nRequested procedure: CPT 29881.\nMedicaid medical necessity criteria cited.\n';
  const findings = runEngine(bundleOf(text));
  // the Medi-Cal overlay engaged...
  assert.ok(findings.find((x) => x.ruleId === 'R-PA-MCAL-001'), 'MCAL overlay should be present');
  // ...and the Medicaid core fired (no eligibility anchor -> MCD-003 flags).
  const mcd003 = findings.find((x) => x.ruleId === 'R-PA-MCD-003');
  assert.equal(mcd003.status, 'flag', 'MCD core must evaluate on a state Medicaid packet');
});

test('R-PA-MCAL-001 flags a Medi-Cal request with a procedure but no coverage-criteria reference', () => {
  const text = 'Medi-Cal managed care member.\n'
    + 'Requested procedure: CPT 72148 (MRI lumbar spine).\n'
    + 'Please authorize.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-MCAL-001');
  assert.equal(f.status, 'flag');
});

test('R-PA-MCAL-001 passes when the Medi-Cal packet cites the applicable Medical Policy', () => {
  const text = 'Medi-Cal managed care member.\n'
    + 'Requested procedure: CPT 72148.\n'
    + 'Medical necessity per the applicable Medi-Cal Medical Policy (MCG).\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-MCAL-001');
  assert.equal(f.status, 'pass');
});

test('R-PA-MCAL-003 passes when the Medi-Cal packet names the TAR / provider-portal channel (info)', () => {
  const text = 'Medi-Cal Treatment Authorization Request submitted via the Medi-Cal Provider Portal.\nProcedure CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-MCAL-003');
  assert.equal(f.status, 'pass');
});

test('R-PA-MCAL-017 flags a Medi-Cal transplant request with no Medicaid-designated transplant-center routing', () => {
  const text = 'Medi-Cal managed care member.\nRequested service: kidney transplant.\nMedical necessity per Medical Policy.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-MCAL-017');
  assert.equal(f.status, 'flag');
});

test('R-PA-MCAL-019 treats a Medi-Cal state fair hearing as an appeal (info)', () => {
  const text = 'Medi-Cal managed care member.\nThis is a state fair hearing request.\nProcedure CPT 70551.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-MCAL-019');
  assert.equal(f.status, 'info');
});

// ---- wave 52-31 sanity checks: New York State Medicaid overlay (§4.5.31) ----

test('New York Medicaid overlay rules vacuously pass on a non-NY-Medicaid packet', () => {
  const findings = runEngine(happyBundle());
  for (let n = 1; n <= 20; n += 1) {
    const id = 'R-PA-MCNY-' + String(n).padStart(3, '0');
    const f = findings.find((x) => x.ruleId === id);
    assert.ok(f, id + ' should be in the findings');
    assert.equal(f.status, 'pass', id + ' should vacuously pass off-bucket');
  }
});

test('R-PA-MCNY-001 flags a New York Medicaid request with a procedure but no coverage-criteria reference', () => {
  const text = 'New York State Medicaid member.\nRequested procedure: CPT 72148 (MRI lumbar spine).\nPlease authorize.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-MCNY-001');
  assert.equal(f.status, 'flag');
});

test('R-PA-MCNY-003 passes when the New York Medicaid packet names the eMedNY channel (info)', () => {
  const text = 'New York State Medicaid request submitted via eMedNY / ePACES.\nProcedure CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-MCNY-003');
  assert.equal(f.status, 'pass');
});

test('R-PA-MCNY-017 flags a New York Medicaid transplant request with no Medicaid-designated transplant-center routing', () => {
  const text = 'New York State Medicaid member.\nRequested service: kidney transplant.\nMedical necessity per Medical Policy.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-MCNY-017');
  assert.equal(f.status, 'flag');
});

test('R-PA-MCNY core composition: the Medicaid core fires on a New York Medicaid (medicaid-ny) packet', () => {
  const text = 'New York State Medicaid member.\nRequested procedure: CPT 29881.\n';
  const findings = runEngine(bundleOf(text));
  const mcd003 = findings.find((x) => x.ruleId === 'R-PA-MCD-003');
  assert.equal(mcd003.status, 'flag', 'MCD core must evaluate on a NY Medicaid packet');
});

// ---- wave 52-32 sanity checks: Texas Medicaid overlay (§4.5.32) ----

test('Texas Medicaid overlay rules vacuously pass on a non-Texas-Medicaid packet', () => {
  const findings = runEngine(happyBundle());
  for (let n = 1; n <= 20; n += 1) {
    const id = 'R-PA-MCTX-' + String(n).padStart(3, '0');
    const f = findings.find((x) => x.ruleId === id);
    assert.ok(f, id + ' should be in the findings');
    assert.equal(f.status, 'pass', id + ' should vacuously pass off-bucket');
  }
});

test('R-PA-MCTX-001 flags a Texas Medicaid request with a procedure but no coverage-criteria reference', () => {
  const text = 'Texas Medicaid member.\nRequested procedure: CPT 72148 (MRI lumbar spine).\nPlease authorize.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-MCTX-001');
  assert.equal(f.status, 'flag');
});

test('R-PA-MCTX-003 passes when the Texas Medicaid packet names the TMHP channel (info)', () => {
  const text = 'Texas Medicaid request submitted via the TMHP provider portal.\nProcedure CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-MCTX-003');
  assert.equal(f.status, 'pass');
});

test('R-PA-MCTX-017 flags a Texas Medicaid transplant request with no Medicaid-designated transplant-center routing', () => {
  const text = 'Texas Medicaid member.\nRequested service: kidney transplant.\nMedical necessity per Medical Policy.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-MCTX-017');
  assert.equal(f.status, 'flag');
});

test('R-PA-MCTX core composition: the Medicaid core fires on a Texas Medicaid (medicaid-tx) packet', () => {
  const text = 'Texas Medicaid member.\nRequested procedure: CPT 29881.\n';
  const findings = runEngine(bundleOf(text));
  const mcd003 = findings.find((x) => x.ruleId === 'R-PA-MCD-003');
  assert.equal(mcd003.status, 'flag', 'MCD core must evaluate on a TX Medicaid packet');
});

// ---- wave 52-33 sanity checks: Florida Medicaid overlay (§4.5.33) ----

test('Florida Medicaid overlay rules vacuously pass on a non-Florida-Medicaid packet', () => {
  const findings = runEngine(happyBundle());
  for (let n = 1; n <= 20; n += 1) {
    const id = 'R-PA-MCFL-' + String(n).padStart(3, '0');
    const f = findings.find((x) => x.ruleId === id);
    assert.ok(f, id + ' should be in the findings');
    assert.equal(f.status, 'pass', id + ' should vacuously pass off-bucket');
  }
});

test('R-PA-MCFL-001 flags a Florida Medicaid request with a procedure but no coverage-criteria reference', () => {
  const text = 'Florida Medicaid member.\nRequested procedure: CPT 72148 (MRI lumbar spine).\nPlease authorize.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-MCFL-001');
  assert.equal(f.status, 'flag');
});

test('R-PA-MCFL-003 passes when the Florida Medicaid packet names the FMMIS channel (info)', () => {
  const text = 'Florida Medicaid request submitted via the Florida Medicaid Web Portal (FMMIS).\nProcedure CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-MCFL-003');
  assert.equal(f.status, 'pass');
});

test('R-PA-MCFL-017 flags a Florida Medicaid transplant request with no Medicaid-designated transplant-center routing', () => {
  const text = 'Florida Medicaid member.\nRequested service: kidney transplant.\nMedical necessity per Medical Policy.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-MCFL-017');
  assert.equal(f.status, 'flag');
});

test('Florida Medicaid does not collide with the Florida Blue commercial overlay', () => {
  // 'Florida Medicaid' -> medicaid-fl; 'Florida Blue' -> florida-blue. Each
  // packet engages its own overlay and the other stays vacuous.
  const flMcd = runEngine(bundleOf('Florida Medicaid member.\nProcedure CPT 29881.\n'));
  assert.ok(flMcd.find((x) => x.ruleId === 'R-PA-MCFL-001'));
  assert.equal(flMcd.find((x) => x.ruleId === 'R-PA-FLBLUE-001').status, 'pass');
  const flBlue = runEngine(bundleOf('Florida Blue PPO member.\nProcedure CPT 29881.\n'));
  assert.equal(flBlue.find((x) => x.ruleId === 'R-PA-MCFL-001').status, 'pass');
});

// ---- wave 52-34 sanity checks: Ohio Medicaid overlay (§4.5.34) ----

test('Ohio Medicaid overlay rules vacuously pass on a non-Ohio-Medicaid packet', () => {
  const findings = runEngine(happyBundle());
  for (let n = 1; n <= 20; n += 1) {
    const id = 'R-PA-MCOH-' + String(n).padStart(3, '0');
    const f = findings.find((x) => x.ruleId === id);
    assert.ok(f, id + ' should be in the findings');
    assert.equal(f.status, 'pass', id + ' should vacuously pass off-bucket');
  }
});

test('R-PA-MCOH-001 flags an Ohio Medicaid request with a procedure but no coverage-criteria reference', () => {
  const text = 'Ohio Medicaid member.\nRequested procedure: CPT 72148 (MRI lumbar spine).\nPlease authorize.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-MCOH-001');
  assert.equal(f.status, 'flag');
});

test('R-PA-MCOH-003 passes when the Ohio Medicaid packet names the PNM channel (info)', () => {
  const text = 'Ohio Medicaid request submitted via the Provider Network Management (PNM) portal.\nProcedure CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-MCOH-003');
  assert.equal(f.status, 'pass');
});

test('R-PA-MCOH-017 flags an Ohio Medicaid transplant request with no Medicaid-designated transplant-center routing', () => {
  const text = 'Ohio Medicaid member.\nRequested service: kidney transplant.\nMedical necessity per Medical Policy.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-MCOH-017');
  assert.equal(f.status, 'flag');
});

test('R-PA-MCOH core composition: the Medicaid core fires on an Ohio Medicaid (medicaid-oh) packet', () => {
  const text = 'Ohio Medicaid member.\nRequested procedure: CPT 29881.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCD-003').status, 'flag');
});

// ---- wave 52-35 sanity checks: Illinois Medicaid overlay (§4.5.35) ----

test('Illinois Medicaid overlay rules vacuously pass on a non-Illinois-Medicaid packet', () => {
  const findings = runEngine(happyBundle());
  for (let n = 1; n <= 20; n += 1) {
    const id = 'R-PA-MCIL-' + String(n).padStart(3, '0');
    const f = findings.find((x) => x.ruleId === id);
    assert.ok(f, id + ' should be in the findings');
    assert.equal(f.status, 'pass', id + ' should vacuously pass off-bucket');
  }
});

test('R-PA-MCIL-001 flags an Illinois Medicaid request with a procedure but no coverage-criteria reference', () => {
  const text = 'Illinois Medicaid member.\nRequested procedure: CPT 72148 (MRI lumbar spine).\nPlease authorize.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-MCIL-001');
  assert.equal(f.status, 'flag');
});

test('R-PA-MCIL-003 passes when the Illinois Medicaid packet names the IMPACT channel (info)', () => {
  const text = 'Illinois Medicaid request submitted via the IMPACT provider portal.\nProcedure CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-MCIL-003');
  assert.equal(f.status, 'pass');
});

test('R-PA-MCIL-017 flags an Illinois Medicaid transplant request with no Medicaid-designated transplant-center routing', () => {
  const text = 'Illinois Medicaid member.\nRequested service: kidney transplant.\nMedical necessity per Medical Policy.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-MCIL-017');
  assert.equal(f.status, 'flag');
});

test('Illinois Medicaid does not collide with the HCSC (BCBS of Illinois) commercial overlay', () => {
  // 'Illinois Medicaid' -> medicaid-il; 'Blue Cross Blue Shield of Illinois' -> hcsc.
  const ilMcd = runEngine(bundleOf('Illinois Medicaid member.\nProcedure CPT 29881.\n'));
  assert.ok(ilMcd.find((x) => x.ruleId === 'R-PA-MCIL-001'));
  assert.equal(ilMcd.find((x) => x.ruleId === 'R-PA-HCSC-001').status, 'pass');
  // ...and the Medicaid core fires on the Illinois Medicaid packet.
  assert.equal(ilMcd.find((x) => x.ruleId === 'R-PA-MCD-003').status, 'flag');
  const hcsc = runEngine(bundleOf('Blue Cross Blue Shield of Illinois PPO member.\nProcedure CPT 29881.\n'));
  assert.equal(hcsc.find((x) => x.ruleId === 'R-PA-MCIL-001').status, 'pass');
});

// ---- wave 52-36 sanity checks: Washington Apple Health (Medicaid) overlay (§4.5.36) ----

test('Washington Medicaid overlay rules vacuously pass on a non-Washington-Medicaid packet', () => {
  const findings = runEngine(happyBundle());
  for (let n = 1; n <= 20; n += 1) {
    const id = 'R-PA-MCWA-' + String(n).padStart(3, '0');
    const f = findings.find((x) => x.ruleId === id);
    assert.ok(f, id + ' should be in the findings');
    assert.equal(f.status, 'pass', id + ' should vacuously pass off-bucket');
  }
});

test('R-PA-MCWA-001 flags a Washington Apple Health request with a procedure but no coverage-criteria reference', () => {
  const text = 'Washington Apple Health member.\nRequested procedure: CPT 72148 (MRI lumbar spine).\nPlease authorize.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-MCWA-001');
  assert.equal(f.status, 'flag');
});

test('R-PA-MCWA-003 passes when the Washington Apple Health packet names the ProviderOne channel (info)', () => {
  const text = 'Washington Apple Health request submitted via the ProviderOne provider portal.\nProcedure CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-MCWA-003');
  assert.equal(f.status, 'pass');
});

test('R-PA-MCWA-017 flags a Washington Apple Health transplant request with no Medicaid-designated transplant-center routing', () => {
  const text = 'Washington Apple Health member.\nRequested service: kidney transplant.\nMedical necessity per Medical Policy.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-MCWA-017');
  assert.equal(f.status, 'flag');
});

test('R-PA-MCWA core composition: the Medicaid core fires on a Washington Apple Health (medicaid-wa) packet', () => {
  const findings = runEngine(bundleOf('Washington Apple Health member.\nRequested procedure: CPT 29881.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCD-003').status, 'flag');
});

// ---- wave 52-37 sanity checks: Georgia Medicaid overlay (§4.5.37) ----

test('Georgia Medicaid overlay rules vacuously pass on a non-Georgia-Medicaid packet', () => {
  const findings = runEngine(happyBundle());
  for (let n = 1; n <= 20; n += 1) {
    const id = 'R-PA-MCGA-' + String(n).padStart(3, '0');
    const f = findings.find((x) => x.ruleId === id);
    assert.ok(f, id + ' should be in the findings');
    assert.equal(f.status, 'pass', id + ' should vacuously pass off-bucket');
  }
});

test('R-PA-MCGA-001 flags a Georgia Medicaid request with a procedure but no coverage-criteria reference', () => {
  const text = 'Georgia Medicaid member.\nRequested procedure: CPT 72148 (MRI lumbar spine).\nPlease authorize.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-MCGA-001');
  assert.equal(f.status, 'flag');
});

test('R-PA-MCGA-003 passes when the Georgia Medicaid packet names the GAMMIS channel (info)', () => {
  const text = 'Georgia Medicaid request submitted via GAMMIS.\nProcedure CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-MCGA-003');
  assert.equal(f.status, 'pass');
});

test('R-PA-MCGA-017 flags a Georgia Medicaid transplant request with no Medicaid-designated transplant-center routing', () => {
  const text = 'Georgia Medicaid member.\nRequested service: kidney transplant.\nMedical necessity per Medical Policy.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-MCGA-017');
  assert.equal(f.status, 'flag');
});

test('R-PA-MCGA core composition: the Medicaid core fires on a Georgia Medicaid (medicaid-ga) packet', () => {
  const findings = runEngine(bundleOf('Georgia Medicaid member.\nRequested procedure: CPT 29881.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCD-003').status, 'flag');
});

// ---- wave 52-38 sanity checks: North Carolina Medicaid overlay (§4.5.38) ----

test('North Carolina Medicaid overlay rules vacuously pass on a non-NC-Medicaid packet', () => {
  const findings = runEngine(happyBundle());
  for (let n = 1; n <= 20; n += 1) {
    const id = 'R-PA-MCNC-' + String(n).padStart(3, '0');
    const f = findings.find((x) => x.ruleId === id);
    assert.ok(f, id + ' should be in the findings');
    assert.equal(f.status, 'pass', id + ' should vacuously pass off-bucket');
  }
});

test('R-PA-MCNC-001 flags a North Carolina Medicaid request with a procedure but no coverage-criteria reference', () => {
  const text = 'North Carolina Medicaid member.\nRequested procedure: CPT 72148 (MRI lumbar spine).\nPlease authorize.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-MCNC-001');
  assert.equal(f.status, 'flag');
});

test('R-PA-MCNC-003 passes when the North Carolina Medicaid packet names the NCTracks channel (info)', () => {
  const text = 'North Carolina Medicaid request submitted via NCTracks.\nProcedure CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-MCNC-003');
  assert.equal(f.status, 'pass');
});

test('R-PA-MCNC-017 flags a North Carolina Medicaid transplant request with no Medicaid-designated transplant-center routing', () => {
  const text = 'North Carolina Medicaid member.\nRequested service: kidney transplant.\nMedical necessity per Medical Policy.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-MCNC-017');
  assert.equal(f.status, 'flag');
});

test('North Carolina Medicaid does not collide with the Blue Cross NC commercial overlay', () => {
  // 'North Carolina Medicaid' -> medicaid-nc; 'Blue Cross Blue Shield of NC' -> bcbsnc.
  const ncMcd = runEngine(bundleOf('North Carolina Medicaid member.\nProcedure CPT 29881.\n'));
  assert.ok(ncMcd.find((x) => x.ruleId === 'R-PA-MCNC-001'));
  assert.equal(ncMcd.find((x) => x.ruleId === 'R-PA-BCBSNC-001').status, 'pass');
  assert.equal(ncMcd.find((x) => x.ruleId === 'R-PA-MCD-003').status, 'flag');
  const bcbsnc = runEngine(bundleOf('Blue Cross Blue Shield of North Carolina PPO member.\nProcedure CPT 29881.\n'));
  assert.equal(bcbsnc.find((x) => x.ruleId === 'R-PA-MCNC-001').status, 'pass');
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

// ---- wave 52-2e sanity checks ----

test('R-PA-CMS-022 flags a Medicare FFS infusion-pump request without indication / drug anchors', () => {
  const text = HAPPY_TEXT
    + '\nMedicare Part B beneficiary on file.\n'
    + 'External infusion pump ordered.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-CMS-022');
  assert.equal(f.status, 'flag');
});

test('R-PA-CMS-023 flags a Medicare FFS ostomy-supply request without an ostomy-type anchor', () => {
  // Use a fixture without a Quantity line so type anchor is the failure.
  const text = 'Medicare Part B beneficiary on file.\n'
    + 'Ostomy supplies ordered: ostomy pouch and wafer.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-CMS-023');
  assert.equal(f.status, 'flag');
});

test('R-PA-CMS-024 flags a Medicare FFS urinary-catheter request without a covered diagnosis anchor', () => {
  const text = HAPPY_TEXT
    + '\nMedicare Part B beneficiary on file.\n'
    + 'Foley catheter ordered for home use.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-CMS-024');
  assert.equal(f.status, 'flag');
});

test('R-PA-CMS-025 flags a Medicare FFS surgical-dressing request without wound-area / change-frequency anchors', () => {
  const text = HAPPY_TEXT
    + '\nMedicare Part B beneficiary on file.\n'
    + 'Surgical dressing supplies ordered for post-op wound.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-CMS-025');
  assert.equal(f.status, 'flag');
});

test('R-PA-CMS-026 flags a Medicare FFS post-cataract-lens request without surgery anchor + CPT', () => {
  const text = HAPPY_TEXT
    + '\nMedicare Part B beneficiary on file.\n'
    + 'Post-cataract eyeglasses ordered for aphakic patient.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-CMS-026');
  assert.equal(f.status, 'flag');
});

// ---- wave 52-3a sanity checks: CMS Medicare Advantage overlay opens ----

test('R-PA-MA-001 / -002 / -003 / -004 / -005 all vacuously pass on a non-MA packet', () => {
  const findings = runEngine(happyBundle());
  for (const id of ['R-PA-MA-001', 'R-PA-MA-002', 'R-PA-MA-003', 'R-PA-MA-004', 'R-PA-MA-005']) {
    const f = findings.find((x) => x.ruleId === id);
    assert.equal(f.status, 'pass', id + ' should vacuously pass when payer is not MA.');
  }
});

test('R-PA-MA-001 blocks a Medicare Advantage HMO specialist request without a PCP referral anchor', () => {
  const text = HAPPY_TEXT
    + '\nMedicare Advantage HMO plan member.\n'
    + 'Specialist consult requested for cardiology evaluation.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-MA-001');
  assert.equal(f.status, 'block');
});

test('R-PA-MA-002 flags an MA packet without an in-network or OON-exception anchor', () => {
  const text = HAPPY_TEXT
    + '\nMedicare Advantage plan member.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-MA-002');
  assert.equal(f.status, 'flag');
});

test('R-PA-MA-003 flags a gatekeepered MA plan with fewer than 2 distinct NPIs', () => {
  // Strip the NPI line entirely so only 0 NPIs are present (sub-2).
  const base = HAPPY_TEXT.replace('Ordering provider NPI: 1234567893\n', '');
  const text = base
    + '\nMedicare Advantage HMO plan member.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-MA-003');
  assert.equal(f.status, 'flag');
});

test('R-PA-MA-004 flags an MA packet without a plan-name anchor', () => {
  // HAPPY_TEXT already has a Member ID; we add an MA payer anchor without a "Plan name:" line.
  const text = HAPPY_TEXT
    + '\nMedicare Advantage member.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-MA-004');
  assert.equal(f.status, 'flag');
});

test('R-PA-MA-005 fires (info) on an MA packet without a service-area anchor', () => {
  const text = HAPPY_TEXT
    + '\nMedicare Advantage plan member.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-MA-005');
  assert.equal(f.status, 'info');
});

// ---- wave 52-3b sanity checks ----

test('R-PA-MA-006 flags an MA drug request without a Part B vs Part D coverage-path anchor', () => {
  const text = HAPPY_TEXT
    + '\nMedicare Advantage plan member.\n'
    + 'Drug: specialty infusion drug requested.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-MA-006');
  assert.equal(f.status, 'flag');
});

test('R-PA-MA-007 flags a D-SNP packet without a state-Medicaid plan / member-ID anchor', () => {
  const text = HAPPY_TEXT
    + '\nMedicare Advantage D-SNP dual-eligible member.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-MA-007');
  assert.equal(f.status, 'flag');
});

test('R-PA-MA-008 fires (info) on an MA dental request without an Evidence-of-Coverage anchor', () => {
  const text = HAPPY_TEXT
    + '\nMedicare Advantage plan member.\n'
    + 'Dental procedure: dental crown requested.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-MA-008');
  assert.equal(f.status, 'info');
});

test('R-PA-MA-009 flags an MA Part B drug under step therapy without prior-failure documentation', () => {
  // Strip HAPPY_TEXT's "Step therapy: trial of lisinopril..." line so the
  // compliance anchor isn't pre-satisfied, then add the MA Part B + step-
  // therapy trigger without any trial-of / failed-first-line language.
  const base = HAPPY_TEXT.replace(/Step therapy:.*\n/, '');
  const text = base
    + '\nMedicare Advantage plan member.\n'
    + 'Part B drug requested. Plan applies step therapy for this biologic.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-MA-009');
  assert.equal(f.status, 'flag');
});

test('R-PA-MA-010 flags an MA inpatient-admission request without a two-midnight / short-stay anchor', () => {
  const text = HAPPY_TEXT
    + '\nMedicare Advantage plan member.\n'
    + 'Inpatient admission requested for acute care.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-MA-010');
  assert.equal(f.status, 'flag');
});

// ---- wave 52-3c sanity checks ----

test('R-PA-MA-011 fires (info) on an MA packet without an organization-determination type anchor', () => {
  const text = HAPPY_TEXT
    + '\nMedicare Advantage plan member.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-MA-011');
  assert.equal(f.status, 'info');
});

test('R-PA-MA-012 flags an MA expedited-review request without a clinical-urgency attestation', () => {
  const text = HAPPY_TEXT
    + '\nMedicare Advantage plan member.\n'
    + 'Expedited review requested for this PA.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-MA-012');
  assert.equal(f.status, 'flag');
});

test('R-PA-MA-013 flags an MA transition request without a continuity-of-care anchor', () => {
  const text = HAPPY_TEXT
    + '\nMedicare Advantage plan member.\n'
    + 'Transition fill requested for new enrollee.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-MA-013');
  assert.equal(f.status, 'flag');
});

test('R-PA-MA-014 flags hospice-related services on an MA packet without a hospice-election indicator', () => {
  const text = HAPPY_TEXT
    + '\nMedicare Advantage plan member.\n'
    + 'Hospice service / palliative care requested.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-MA-014');
  assert.equal(f.status, 'flag');
});

// ---- wave 52-4a sanity checks: Medicaid state-agnostic core opens ----

test('R-PA-MCD-001 / -002 / -003 / -004 / -005 all vacuously pass on a non-Medicaid packet', () => {
  const findings = runEngine(happyBundle());
  for (const id of ['R-PA-MCD-001', 'R-PA-MCD-002', 'R-PA-MCD-003', 'R-PA-MCD-004', 'R-PA-MCD-005']) {
    const f = findings.find((x) => x.ruleId === id);
    assert.equal(f.status, 'pass', id + ' should vacuously pass when payer is not Medicaid.');
  }
});

test('R-PA-MCD-001 blocks a Medicaid packet without a Member-ID line', () => {
  const text = HAPPY_TEXT.replace(/Member ID:.*\n/, '')
    + '\nState Medicaid recipient on file.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-MCD-001');
  assert.equal(f.status, 'block');
});

test('R-PA-MCD-002 flags a pediatric Medicaid packet without an EPSDT anchor', () => {
  const text = HAPPY_TEXT
    + '\nState Medicaid pediatric patient.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-MCD-002');
  assert.equal(f.status, 'flag');
});

test('R-PA-MCD-003 flags a Medicaid packet without an eligibility-window anchor', () => {
  const text = HAPPY_TEXT
    + '\nState Medicaid recipient on file.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-MCD-003');
  assert.equal(f.status, 'flag');
});

test('R-PA-MCD-004 flags a Medicaid packet without a state-Medicaid medical-necessity anchor', () => {
  const text = HAPPY_TEXT
    + '\nState Medicaid recipient on file.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-MCD-004');
  assert.equal(f.status, 'flag');
});

test('R-PA-MCD-005 flags a Medicaid packet without an MCO / FFS routing indicator', () => {
  const text = HAPPY_TEXT
    + '\nState Medicaid recipient on file.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-MCD-005');
  assert.equal(f.status, 'flag');
});

// ---- wave 52-4b sanity checks ----

test('R-PA-MCD-006 flags a Medicaid J-code request without an NDC anchor', () => {
  const text = HAPPY_TEXT
    + '\nState Medicaid recipient on file.\n'
    + 'J-code billing: J1745 infliximab infusion.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-MCD-006');
  assert.equal(f.status, 'flag');
});

test('R-PA-MCD-007 flags a Medicaid dental request without an adult / pediatric coverage anchor', () => {
  const text = HAPPY_TEXT
    + '\nState Medicaid recipient on file.\n'
    + 'Dental procedure: tooth extraction requested.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-MCD-007');
  assert.equal(f.status, 'flag');
});

test('R-PA-MCD-008 flags a Medicaid NEMT request without trip-purpose / appointment-date anchors', () => {
  const text = HAPPY_TEXT
    + '\nState Medicaid recipient on file.\n'
    + 'NEMT transportation requested.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-MCD-008');
  assert.equal(f.status, 'flag');
});

test('R-PA-MCD-009 fires (info) on a Medicaid behavioral-health service without a carve-out / integrated indicator', () => {
  const text = HAPPY_TEXT
    + '\nState Medicaid recipient on file.\n'
    + 'Behavioral health psychotherapy session requested.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-MCD-009');
  assert.equal(f.status, 'info');
});

test('R-PA-MCD-010 fires (info) on a Medicaid outpatient-prescription packet without an MDRP / labeler-agreement anchor', () => {
  const text = HAPPY_TEXT
    + '\nState Medicaid recipient on file.\n'
    + 'Outpatient prescription drug requested.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-MCD-010');
  assert.equal(f.status, 'info');
});

// ---- wave 52-5a sanity checks: radiology specialty overlay opens ----

test('R-PA-RAD-001..005 all vacuously pass on a packet without a radiology CPT', () => {
  const findings = runEngine(happyBundle());
  for (const id of ['R-PA-RAD-001', 'R-PA-RAD-002', 'R-PA-RAD-003', 'R-PA-RAD-004', 'R-PA-RAD-005']) {
    const f = findings.find((x) => x.ruleId === id);
    assert.equal(f.status, 'pass', id + ' should vacuously pass when no 70010-79999 CPT is in the packet.');
  }
});

test('R-PA-RAD-001 fires (info) on an advanced-imaging request without an ACR AC anchor', () => {
  const text = HAPPY_TEXT + '\nProcedure: 70551 MRI brain without contrast.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-RAD-001');
  assert.equal(f.status, 'info');
});

test('R-PA-RAD-002 flags a non-emergent MRI without a conservative-management anchor', () => {
  const base = HAPPY_TEXT.replace(/Step therapy:.*\n/, '');
  const text = base + '\nProcedure: 72148 MRI lumbar spine without contrast for non-emergent back pain.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-RAD-002');
  assert.equal(f.status, 'flag');
});

test('R-PA-RAD-003 flags a contrast imaging request without contrast-allergy + renal-function anchors', () => {
  const text = HAPPY_TEXT + '\nProcedure: 70553 MRI brain with contrast. IV contrast required.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-RAD-003');
  assert.equal(f.status, 'flag');
});

test('R-PA-RAD-005 fires (info) on a pediatric imaging request without an ALARA anchor', () => {
  const text = HAPPY_TEXT + '\nProcedure: 70551 MRI brain without contrast.\nPediatric patient, adolescent.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-RAD-005');
  assert.equal(f.status, 'info');
});

// ---- wave 52-5b sanity checks: infusion specialty overlay ----

test('R-PA-INF-001..005 all vacuously pass on a packet without a J-code', () => {
  const findings = runEngine(happyBundle());
  for (const id of ['R-PA-INF-001', 'R-PA-INF-002', 'R-PA-INF-003', 'R-PA-INF-004', 'R-PA-INF-005']) {
    const f = findings.find((x) => x.ruleId === id);
    assert.equal(f.status, 'pass', id + ' should vacuously pass when no J-code is in the packet.');
  }
});

test('R-PA-INF-001 flags an infusion request with a J-code but no NDC anchor', () => {
  const text = HAPPY_TEXT + '\nJ1745 infliximab infusion.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-INF-001');
  assert.equal(f.status, 'flag');
});

test('R-PA-INF-002 flags a weight-based infusion without a dose-calculation anchor', () => {
  const text = HAPPY_TEXT
    + '\nJ1745 infliximab infusion.\n'
    + 'Dosing: 5 mg/kg every 8 weeks.\n'
    + 'Weight: 70 kg.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-INF-002');
  assert.equal(f.status, 'flag');
});

test('R-PA-INF-003 flags an infusion request without a site-of-care anchor', () => {
  const text = HAPPY_TEXT + '\nJ1745 infliximab infusion.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-INF-003');
  assert.equal(f.status, 'flag');
});

test('R-PA-INF-004 flags an infusion request without an FDA-indication / NCCN-compendia anchor', () => {
  const text = HAPPY_TEXT + '\nJ1745 infliximab infusion.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-INF-004');
  assert.equal(f.status, 'flag');
});

test('R-PA-INF-005 fires (info) on an infusion-reaction-risk biologic without a premedication anchor', () => {
  const text = HAPPY_TEXT
    + '\nJ9312 rituximab infusion.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-INF-005');
  assert.equal(f.status, 'info');
});

// ---- wave 52-5c sanity checks: surgery specialty overlay ----

test('R-PA-SURG-001..005 all vacuously pass on a packet without a surgery CPT (10004-69990)', () => {
  const findings = runEngine(happyBundle());
  for (const id of ['R-PA-SURG-001', 'R-PA-SURG-002', 'R-PA-SURG-003', 'R-PA-SURG-004', 'R-PA-SURG-005']) {
    const f = findings.find((x) => x.ruleId === id);
    assert.equal(f.status, 'pass', id + ' should vacuously pass when no surgery CPT is in the packet.');
  }
});

test('R-PA-SURG-001 flags an elective surgery request without a conservative-management anchor', () => {
  // Strip HAPPY_TEXT's pre-existing "Step therapy: trial of lisinopril" so
  // the "trial of" anchor doesn't pre-satisfy the conservative check.
  const base = HAPPY_TEXT.replace(/Step therapy:.*\n/, '');
  const text = base + '\nProcedure: 27447 total knee arthroplasty.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-SURG-001');
  assert.equal(f.status, 'flag');
});

test('R-PA-SURG-002 flags an elective surgery request without imaging support', () => {
  // bundleOf wraps text in a single TXT document; no imaging-report doc role.
  const text = HAPPY_TEXT + '\nProcedure: 27447 total knee arthroplasty.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-SURG-002');
  assert.equal(f.status, 'flag');
});

test('R-PA-SURG-003 flags an ASA >= 3 surgical patient without a pre-op clearance anchor', () => {
  const text = HAPPY_TEXT
    + '\nProcedure: 27447 total knee arthroplasty.\n'
    + 'ASA Physical Status 3 -- patient has severe systemic disease.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-SURG-003');
  assert.equal(f.status, 'flag');
});

test('R-PA-SURG-004 flags a surgery request without an ASA classification anchor', () => {
  const text = HAPPY_TEXT + '\nProcedure: 27447 total knee arthroplasty.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-SURG-004');
  assert.equal(f.status, 'flag');
});

test('R-PA-SURG-005 flags a surgery request without an informed-consent anchor', () => {
  const text = HAPPY_TEXT + '\nProcedure: 27447 total knee arthroplasty.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-SURG-005');
  assert.equal(f.status, 'flag');
});

// ---- wave 52-5d sanity checks: behavioral-health specialty overlay ----

test('R-PA-BH-001..005 all vacuously pass on a packet without a BH CPT or F-code', () => {
  const findings = runEngine(happyBundle());
  for (const id of ['R-PA-BH-001', 'R-PA-BH-002', 'R-PA-BH-003', 'R-PA-BH-004', 'R-PA-BH-005']) {
    const f = findings.find((x) => x.ruleId === id);
    assert.equal(f.status, 'pass', id + ' should vacuously pass when no psychiatric CPT or ICD-10 F-code is in the packet.');
  }
});

test('R-PA-BH-001 flags a BH CPT request without an ICD-10 F-code', () => {
  // Use only the BH CPT trigger; HAPPY_TEXT's only ICD-10 is I10 (not F).
  const text = HAPPY_TEXT + '\nProcedure: 90834 individual psychotherapy 45 minutes.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BH-001');
  assert.equal(f.status, 'flag');
});

test('R-PA-BH-002 flags a BH request without a treatment-plan / measurable-goals anchor', () => {
  const text = HAPPY_TEXT + '\nDx: F32.9 major depressive disorder\nProcedure: 90834 individual psychotherapy.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BH-002');
  assert.equal(f.status, 'flag');
});

test('R-PA-BH-003 flags a BH step-up-of-care request without a prior-level-of-care anchor', () => {
  const text = HAPPY_TEXT
    + '\nDx: F32.9 major depressive disorder\nProcedure: 90834 individual psychotherapy.\n'
    + 'Requesting step-up to higher level of care.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BH-003');
  assert.equal(f.status, 'flag');
});

test('R-PA-BH-004 flags a BH request without a risk-assessment anchor', () => {
  const text = HAPPY_TEXT + '\nDx: F32.9 major depressive disorder\nProcedure: 90834 individual psychotherapy.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BH-004');
  assert.equal(f.status, 'flag');
});

test('R-PA-BH-005 fires (info) on an SUD / MAT request without an X-waiver / OTP anchor', () => {
  const text = HAPPY_TEXT
    + '\nDx: F11.20 opioid use disorder\nProcedure: 90834 individual psychotherapy.\n'
    + 'Buprenorphine treatment requested.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BH-005');
  assert.equal(f.status, 'info');
});

// ---- wave 52-5e sanity checks: genetic-testing specialty overlay (closes §4.5.5 + §4.5) ----

test('R-PA-GEN-001..005 all vacuously pass on a packet without a genetic-testing CPT', () => {
  const findings = runEngine(happyBundle());
  for (const id of ['R-PA-GEN-001', 'R-PA-GEN-002', 'R-PA-GEN-003', 'R-PA-GEN-004', 'R-PA-GEN-005']) {
    const f = findings.find((x) => x.ruleId === id);
    assert.equal(f.status, 'pass', id + ' should vacuously pass when no 81xxx CPT is in the packet.');
  }
});

test('R-PA-GEN-001 flags a genetic-testing request without a family-history anchor', () => {
  const text = HAPPY_TEXT + '\nProcedure: 81479 unlisted molecular pathology procedure.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-GEN-001');
  assert.equal(f.status, 'flag');
});

test('R-PA-GEN-002 flags a genetic-testing request without a genetic-counseling anchor', () => {
  const text = HAPPY_TEXT + '\nProcedure: 81479 unlisted molecular pathology procedure.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-GEN-002');
  assert.equal(f.status, 'flag');
});

test('R-PA-GEN-003 flags a genetic-testing request without a panel-scope rationale anchor', () => {
  const text = HAPPY_TEXT + '\nProcedure: 81479 unlisted molecular pathology procedure.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-GEN-003');
  assert.equal(f.status, 'flag');
});

test('R-PA-GEN-005 fires (info) on a genetic-testing request without a genetic-specific consent anchor', () => {
  const text = HAPPY_TEXT + '\nProcedure: 81479 unlisted molecular pathology procedure.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-GEN-005');
  assert.equal(f.status, 'info');
});

test('R-PA-MA-015 flags a C-SNP / I-SNP packet without a qualifying condition / residence anchor', () => {
  // Strip HAPPY_TEXT's "Step therapy: ..." line and the dx I10 line so
  // none of the qualifying-condition anchors match, then add the C-SNP
  // trigger.
  const base = HAPPY_TEXT.replace(/Step therapy:.*\n/, '').replace(/Dx:.*\n/, 'Dx: M25.561 right knee pain\n');
  const text = base
    + '\nMedicare Advantage C-SNP chronic-condition special needs plan.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-MA-015');
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

// ---- spec-v52 §4.5.6 stale-source disabling (wave 52-6j) ----

test('runEngine disables every rule anchored to a disabled source and skips its check', () => {
  // cms-pos backs R-PA-013 (POS code valid). Disable it and the rule must not
  // run -- it reports status 'disabled' regardless of the POS value.
  const text = HAPPY_TEXT + '\nPlace of service: 88\n'; // 88 is off the bundled POS list
  const disabled = { 'cms-pos': { since: '2026-06-01', reason: 'CMS POS page 404' } };
  const findings = runEngine(bundleOf(text), undefined, { disabledSources: disabled });
  const f = findings.find((x) => x.ruleId === 'R-PA-013');
  assert.equal(f.status, 'disabled', 'R-PA-013 is anchored to cms-pos and must be disabled');
  assert.equal(f.evidence, null);
  assert.match(f.note, /cms-pos/);
  assert.match(f.note, /CMS POS page 404/);
  assert.match(f.note, /2026-06-01/);
});

test('disabling a source leaves rules anchored to other sources untouched', () => {
  const disabled = { 'cms-pos': true }; // bare-true form is accepted
  const findings = runEngine(happyBundle(), undefined, { disabledSources: disabled });
  // R-PA-013 (cms-pos) is disabled; R-PA-016 (nppes-npi) is not.
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-013').status, 'disabled');
  assert.notEqual(findings.find((x) => x.ruleId === 'R-PA-016').status, 'disabled');
  // A structural rule (no sources) is never disabled.
  assert.notEqual(findings.find((x) => x.ruleId === 'R-PA-001').status, 'disabled');
});

test('summarizeFindings counts disabled findings; an empty disabled map is a no-op', () => {
  const off = summarizeFindings(runEngine(happyBundle(), undefined, { disabledSources: { 'cms-pos': true, 'cms-ncci': true } }));
  // cms-pos backs R-PA-013; cms-ncci backs R-PA-012 and R-PA-054 -> 3 disabled.
  assert.equal(off.disabled, 3);
  assert.equal(off.pass, STARTER_RULES.length - 3);

  const none = summarizeFindings(runEngine(happyBundle(), undefined, { disabledSources: {} }));
  assert.equal(none.disabled, 0);
  assert.equal(none.pass, STARTER_RULES.length);

  // No opts at all is identical to an empty disabled map.
  assert.equal(summarizeFindings(runEngine(happyBundle())).disabled, 0);
});
