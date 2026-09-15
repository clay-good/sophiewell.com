// spec-v52 §4.5, §4.10: PA rule engine. Starter rules get fires-when-it-should
// and doesn't-fire-when-it-shouldn't assertions; the ruleset has grown from the
// original 7 to 876 rules (see the STARTER_RULES count assertion below), with
// representative per-rule coverage across the commercial and Medicaid overlays.
// Plus engine-level invariants: order is deterministic;
// same input -> same output (property test); rule throw is caught.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildBundle, runEngine, summarizeFindings } from '../../lib/pa/engine.js';
import { STARTER_RULES } from '../../lib/pa/rules.js';

// Pin "today" so the clock-relative rules (R-PA-005 retro window, R-PA-006
// future ceiling) see the hardcoded fixture service dates as recent forever.
// Same seed date as scripts/audit-pa.mjs; todayUtc() reads the pin lazily.
process.env.SOPHIEWELL_NOW = '2026-05-29';

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

test('STARTER_RULES at wave 52-45 is 876 rules (135 §4.5 core/overlay/specialty + 20 each for the 23 commercial overlays + 20 each for 14 per-state Medicaid overlays (CA + NY + TX + FL + OH + IL + WA + GA + NC + PA + MI + NJ + AZ + IN) + 1 CMS OPD prior-auth-list membership rule)', () => {
  assert.equal(STARTER_RULES.length, 876);
});

// ---- wave 52-46: complete CMS Place-of-Service code set (R-PA-013) ----
// Regression guard for the false-positive `block`: before wave 52-46 the bundled
// POS list omitted 01-10 (and 16 / 18 / 27), so a legitimate telehealth packet
// (POS 02 / 10) was wrongly blocked. The complete CMS POS set now accepts every
// assigned code; a genuinely unassigned code (88) still blocks.
function pos013(text) {
  const bundle = buildBundle([{ name: 'f.txt', sha256: 'x', kind: 'TXT', text }], {});
  return runEngine(bundle).find((x) => x.ruleId === 'R-PA-013').status;
}

test('R-PA-013 accepts the telehealth POS codes (02 / 10) that were previously false-blocked', () => {
  assert.equal(pos013('Place of service: 02\nProcedure 99214'), 'pass');
  assert.equal(pos013('Place of service: 10\nProcedure 99214'), 'pass');
});

test('R-PA-013 accepts the rest of the previously-missing assigned POS codes (01, 03-09, 16, 18, 27)', () => {
  for (const p of ['01', '03', '04', '05', '06', '07', '08', '09', '16', '18', '27']) {
    assert.equal(pos013('Place of service: ' + p + '\nProcedure 99214'), 'pass', 'POS ' + p + ' should be valid');
  }
});

test('R-PA-013 still blocks a genuinely unassigned POS code (88) and a missing POS line', () => {
  assert.equal(pos013('Place of service: 88\nProcedure 99214'), 'block');
  assert.equal(pos013('Procedure 99214 with no place-of-service line'), 'block');
});

// ---- wave 52-45: CMS Hospital OPD Prior Authorization membership test (§4.5.2.1) ----
// The first REAL bundled PA-list membership test (R-PA-OPD-001). Builds a
// single-document Medicare FFS bundle for each case and asserts the rule's
// status. detectPayer routes "Medicare Part B (Noridian)" to 'cms-medicare-ffs'.
function opdStatus(text) {
  const bundle = buildBundle([{ name: 'f.txt', sha256: 'x', kind: 'TXT', text }], {});
  const f = runEngine(bundle).find((x) => x.ruleId === 'R-PA-OPD-001');
  return { payer: bundle.payer, status: f.status };
}

test('R-PA-OPD-001 flags a Medicare FFS hospital-outpatient OPD-listed service with no UTN / authorization reference', () => {
  const r = opdStatus('Medicare Part B (Noridian) prior authorization\nPlace of service: 22\nRequested procedure: endovenous vein ablation CPT 36475\n');
  assert.equal(r.payer, 'cms-medicare-ffs');
  assert.equal(r.status, 'flag');
});

test('R-PA-OPD-001 passes once a UTN / authorization reference is documented', () => {
  const r = opdStatus('Medicare Part B (Noridian) prior authorization\nPlace of service: 22\nRequested procedure: vein ablation CPT 36475\nUnique Tracking Number (UTN): ABC1234567890\n');
  assert.equal(r.status, 'pass');
});

test('R-PA-OPD-001 self-gates off for an office-based (POS 11) service -- the OPD program does not apply', () => {
  const r = opdStatus('Medicare Part B (Noridian) prior authorization\nPlace of service: 11\nRequested procedure: vein ablation CPT 36475\n');
  assert.equal(r.status, 'pass');
});

test('R-PA-OPD-001 self-gates off when no requested CPT is on the CMS OPD PA list', () => {
  const r = opdStatus('Medicare Part B (Noridian) prior authorization\nPlace of service: 22\nRequested procedure: knee arthroscopy CPT 29881\n');
  assert.equal(r.status, 'pass');
});

test('R-PA-OPD-001 self-gates off for a non-Medicare-FFS payer (the OPD program is Medicare FFS only)', () => {
  const r = opdStatus('Aetna prior authorization\nPlace of service: 22\nRequested procedure: vein ablation CPT 36475\n');
  assert.equal(r.payer, 'aetna');
  assert.equal(r.status, 'pass');
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

test('R-PA-AETNA-001 is advisory when an Aetna request does not name coverage criteria', () => {
  const text = 'Aetna Choice POS II member.\n'
    + 'Requested procedure: CPT 72148 (MRI lumbar spine).\n'
    + 'Please authorize.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-AETNA-001');
  assert.equal(f.status, 'info');
});

test('R-PA-AETNA-001 passes when the Aetna packet cites the applicable CPB / medical necessity', () => {
  const text = 'Aetna Choice POS II member.\n'
    + 'Requested procedure: CPT 72148 (MRI lumbar spine).\n'
    + 'Medical necessity: persistent radiculopathy per Aetna Clinical Policy Bulletin.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-AETNA-001');
  assert.equal(f.status, 'pass');
});

test('R-PA-AETNA-002 is advisory when an Aetna request has no clinical document attached', () => {
  const text = 'Aetna PPO member.\nRequested procedure: CPT 72148.\nMedical necessity per CPB.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-AETNA-002');
  assert.equal(f.status, 'info');
});

test('R-PA-AETNA-003 does not require the submission channel in packet content', () => {
  const text = 'Aetna PPO member.\nRequested procedure: CPT 72148.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-AETNA-003');
  assert.equal(f.status, 'pass');
});

test('R-PA-AETNA-005 does not assume every Aetna spinal-fusion request needs the questionnaire', () => {
  const text = 'Aetna commercial member.\n'
    + 'Requested procedure: lumbar fusion (CPT 22633).\n'
    + 'Medical necessity per Aetna CPB.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-AETNA-005');
  assert.equal(f.status, 'pass');
});

test('R-PA-AETNA-005 flags an explicitly requested spinal questionnaire with no answer', () => {
  const text = 'Aetna commercial member.\n'
    + 'Requested procedure: lumbar fusion (CPT 22633).\n'
    + 'Aetna requested additional information and the spinal surgery form is required.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-AETNA-005');
  assert.equal(f.status, 'flag');
});

test('R-PA-AETNA-005 passes when the requested spinal questionnaire is answered', () => {
  const text = 'Aetna commercial member.\n'
    + 'Requested procedure: lumbar fusion (CPT 22633).\n'
    + 'Aetna requested additional information and the spinal surgery form is required.\n'
    + 'Questionnaire response: conservative treatment completed for 12 weeks.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-AETNA-005');
  assert.equal(f.status, 'pass');
});

test('R-PA-AETNA-005 does not extrapolate the reviewed spinal form to bariatric surgery', () => {
  const text = 'Aetna commercial member.\n'
    + 'Requested procedure: bariatric surgery.\n'
    + 'Aetna requested additional clinical information.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-AETNA-005');
  assert.equal(f.status, 'pass');
});

// ---- wave 52-7b sanity checks (Aetna rules 6-10) ----

test('R-PA-AETNA-006 does not treat an initial inpatient request as concurrent review', () => {
  const text = 'Aetna PPO member.\nPlace of service: 21\nInpatient admission for lumbar fusion CPT 22633.\nMedical necessity per CPB.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-AETNA-006');
  assert.equal(f.status, 'pass');
});

test('R-PA-AETNA-006 is advisory when an Aetna concurrent review has no progress update', () => {
  const text = 'Aetna PPO member.\nConcurrent review for continued stay.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-AETNA-006');
  assert.equal(f.status, 'info');
});

test('R-PA-AETNA-006 passes when the concurrent review documents clinical progress', () => {
  const text = 'Aetna PPO member.\nConcurrent review for continued stay.\nClinical progress: tolerating therapy.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-AETNA-006');
  assert.equal(f.status, 'pass');
});

test('R-PA-AETNA-007 is advisory because site-of-care requirements are member-specific', () => {
  const text = 'Aetna member.\nPlace of service: 22\nMRI brain CPT 70551 at hospital outpatient imaging.\nMedical necessity per CPB.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-AETNA-007');
  assert.equal(f.status, 'info');
});

test('R-PA-AETNA-007 does not infer MRI or CT from every 7xxxx radiology code', () => {
  const text = 'Aetna member.\nPlace of service: 22\nScreening mammography CPT 77067 at hospital outpatient imaging.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-AETNA-007');
  assert.equal(f.status, 'pass');
});

test('R-PA-AETNA-008 is a source-free advisory when an expedited request has no rationale', () => {
  const text = 'Aetna member.\nExpedited / urgent request.\nRequested procedure: MRI brain CPT 70551.\nMedical necessity per CPB.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-AETNA-008');
  assert.equal(f.status, 'info');
});

test('R-PA-AETNA-008 passes when an expedited Aetna request documents the clinical urgency', () => {
  const text = 'Aetna member.\nExpedited / urgent request: delay would seriously jeopardize the life or health of the member.\nMRI brain CPT 70551.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-AETNA-008');
  assert.equal(f.status, 'pass');
});

test('R-PA-AETNA-009 does not assume every blepharoplasty uses functional-impairment criteria', () => {
  const text = 'Aetna member.\nRequested procedure: blepharoplasty CPT 15823.\nMedical necessity per CPB.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-AETNA-009');
  assert.equal(f.status, 'pass');
});

test('R-PA-AETNA-009 flags functional upper-lid surgery missing CPB 0084 evidence', () => {
  const text = 'Aetna member.\nRequested procedure: upper lid blepharoplasty CPT 15823 for functional visual impairment.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-AETNA-009');
  assert.equal(f.status, 'flag');
  assert.match(f.note, /photographs/);
  assert.match(f.note, /visual-field/);
});

test('R-PA-AETNA-009 requires margin-reflex distance for functional ptosis repair', () => {
  const text = 'Aetna member.\nPtosis repair for functional visual impairment.\nClinical photographs attached.\nTaped and untaped visual field testing attached.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-AETNA-009');
  assert.equal(f.status, 'flag');
  assert.match(f.note, /margin-reflex distance/);
});

test('R-PA-AETNA-009 passes complete functional upper-lid evidence', () => {
  const text = 'Aetna member.\nPtosis repair for functional visual impairment.\nClinical photographs attached.\nTaped and untaped visual field testing attached.\nMargin reflex distance: 1 mm.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-AETNA-009');
  assert.equal(f.status, 'pass');
});

test('R-PA-AETNA-010 advises on a missing administration code, not a universal NDC', () => {
  const text = 'Aetna member.\nRequested drug: J9299 nivolumab infusion.\nMedical necessity per CPB.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-AETNA-010');
  assert.equal(f.status, 'info');
  assert.match(f.note, /administration code/);
});

test('R-PA-AETNA-010 passes when the J-code request includes an administration code', () => {
  const text = 'Aetna member.\nRequested drug: J9299 nivolumab infusion with administration CPT 96413.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-AETNA-010');
  assert.equal(f.status, 'pass');
});

// ---- wave 52-7c sanity checks (Aetna rules 11-15) ----

test('R-PA-AETNA-011 does not infer Medicare Part B step therapy from a commercial J-code request', () => {
  const text = 'Aetna commercial member.\nSpecialty medication precertification: J9299 nivolumab.\nMedical necessity per CPB.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-AETNA-011');
  assert.equal(f.status, 'pass');
});

test('R-PA-AETNA-011 flags an explicit Aetna Medicare Part B step-therapy request with no evidence', () => {
  const text = 'Aetna Medicare Advantage member.\nPart B drug J9299 is a non-preferred drug subject to step therapy.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-AETNA-011');
  assert.equal(f.status, 'flag');
});

test('R-PA-AETNA-011 passes when the Medicare Part B preferred-drug trial is documented', () => {
  const text = 'Aetna Medicare Advantage member.\nPart B drug J9299 is a non-preferred drug subject to step therapy.\nPreferred drug trial: tried and failed carboplatin/pemetrexed.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-AETNA-011');
  assert.equal(f.status, 'pass');
});

test('R-PA-AETNA-011 does not apply Aetna policy to another Medicare Advantage carrier', () => {
  const text = 'UnitedHealthcare Medicare Advantage member.\nPart B drug J9299 is subject to step therapy.\n';
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

test('R-PA-AETNA-012 rejects a program label without the current intervention details', () => {
  const text = 'Aetna member.\nRequested procedure: sleeve gastrectomy.\nBMI 43. Completed a 6-month physician-supervised weight management program.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-AETNA-012');
  assert.equal(f.status, 'flag');
});

test('R-PA-AETNA-012 passes a qualifying BMI and documented 12-session multicomponent intervention', () => {
  const text = 'Aetna member.\nRequested procedure: sleeve gastrectomy.\nBMI: 43. Completed 12 sessions covering nutrition, physical activity, and behavioral modification within 2 years.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-AETNA-012');
  assert.equal(f.status, 'pass');
});

test('R-PA-AETNA-012 does not apply primary-surgery criteria to a revision', () => {
  const text = 'Aetna member.\nRevision of prior sleeve gastrectomy to Roux-en-Y gastric bypass for a documented complication.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-AETNA-012');
  assert.equal(f.status, 'pass');
});

test('R-PA-AETNA-013 does not apply WES / WGS counseling criteria to a hereditary cancer panel', () => {
  const text = 'Aetna member.\nRequested test: hereditary cancer gene panel (BRCA), CPT 81432.\nMedical necessity per CPB 0140.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-AETNA-013');
  assert.equal(f.status, 'pass');
});

test('R-PA-AETNA-013 flags WES without a genetics evaluation and independent counseling', () => {
  const text = 'Aetna member.\nRequested test: whole exome sequencing, CPT 81415.\nMedical necessity per CPB 0140.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-AETNA-013');
  assert.equal(f.status, 'flag');
});

test('R-PA-AETNA-013 passes WES with the CPB 0140 evaluation and counseling evidence', () => {
  const text = 'Aetna member.\nRequested test: whole exome sequencing, CPT 81415.\nMedical geneticist evaluated the member and family history. Independent pre- and post-test counseling completed.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-AETNA-013');
  assert.equal(f.status, 'pass');
});

test('R-PA-AETNA-014 flags a retrospective Aetna request with no justification (info)', () => {
  const text = 'Aetna member.\nRetrospective review request for services already rendered.\nProcedure CPT 70551.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-AETNA-014');
  assert.equal(f.status, 'info');
});

test('R-PA-AETNA-015 does not apply the outpatient program to inpatient knee arthroplasty', () => {
  const text = 'Aetna member.\nPlace of service: 21\nInpatient admission for knee arthroplasty CPT 27447.\nMedical necessity per CPB.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-AETNA-015');
  assert.equal(f.status, 'pass');
});

test('R-PA-AETNA-015 flags a named procedure at a hospital outpatient site without rationale (info)', () => {
  const text = 'Aetna member.\nPlace of service: 22\nHospital outpatient septoplasty CPT 30520.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-AETNA-015');
  assert.equal(f.status, 'info');
});

// ---- wave 52-7d sanity checks (Aetna rules 16-20) ----

test('R-PA-AETNA-016 advises on an Aetna DME / home-health request with no signed written order', () => {
  const text = 'Aetna member.\nDurable medical equipment: hospital bed requested for home use.\nMedical necessity per CPB.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-AETNA-016');
  assert.equal(f.status, 'info');
});

test('R-PA-AETNA-016 passes when the DME request carries a signed written order', () => {
  const text = 'Aetna member.\nDurable medical equipment: hospital bed.\nStandard written order on file.\nSignature: Ordering MD, 2026-06-01\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-AETNA-016');
  assert.equal(f.status, 'pass');
});

test('R-PA-AETNA-017 advises when an Aetna transplant request omits NME routing', () => {
  const text = 'Aetna member.\nRequested service: kidney transplant.\nMedical necessity per CPB.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-AETNA-017');
  assert.equal(f.status, 'info');
});

test('R-PA-AETNA-017 passes when the transplant request references the NME program', () => {
  const text = 'Aetna member.\nRequested service: kidney transplant.\nRouted through the National Medical Excellence program.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-AETNA-017');
  assert.equal(f.status, 'pass');
});

test('R-PA-AETNA-018 advises when an explicit investigational classification has no policy basis', () => {
  const text = 'Aetna member.\nRequested service is considered investigational for this indication.\nProcedure CPT 0xxxxT.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-AETNA-018');
  assert.equal(f.status, 'info');
});

test('R-PA-AETNA-018 does not infer investigational status from off-label use', () => {
  const text = 'Aetna member.\nOff-label medication request supported by NCCN compendia.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-AETNA-018');
  assert.equal(f.status, 'pass');
});

test('R-PA-AETNA-018 passes when an explicit classification identifies the CPB basis', () => {
  const text = 'Aetna member.\nService was considered investigational under Clinical Policy Bulletin 0123.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-AETNA-018');
  assert.equal(f.status, 'pass');
});

test('R-PA-AETNA-019 does not apply post-service claim requirements to a prospective appeal', () => {
  const text = 'Aetna member.\nThis is an appeal of the precertification.\nPlease overturn the denial.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-AETNA-019');
  assert.equal(f.status, 'pass');
});

test('R-PA-AETNA-019 advises when a post-service appeal is incomplete (info)', () => {
  const text = 'Aetna member.\nPost-service appeal of claim denial.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-AETNA-019');
  assert.equal(f.status, 'info');
});

test('R-PA-AETNA-019 passes a documented post-service appeal', () => {
  const text = 'Aetna member.\nPost-service appeal of claim denial. Reason for appeal: we disagree with the denied code.\nMedical records attached. Denial letter attached; original claim attached.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-AETNA-019');
  assert.equal(f.status, 'pass');
});

test('R-PA-AETNA-020 advises on missing out-of-network benefit / responsibility details (info)', () => {
  const text = 'Aetna member.\nOut-of-network precertification request.\nProcedure CPT 70551.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-AETNA-020');
  assert.equal(f.status, 'info');
});

test('R-PA-AETNA-020 passes when out-of-network benefits and submission responsibility are identified', () => {
  const text = 'Aetna member.\nOut-of-network request. Plan documents confirm an out-of-network benefit. Member handles precertification.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-AETNA-020');
  assert.equal(f.status, 'pass');
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

test('R-PA-UHC-001 advises when a UHC request has no coverage-policy reference', () => {
  const text = 'UnitedHealthcare Choice Plus member.\n'
    + 'Requested procedure: CPT 72148 (MRI lumbar spine).\n'
    + 'Please authorize.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-UHC-001');
  assert.equal(f.status, 'info');
});

test('R-PA-UHC-001 passes when the UHC packet cites the applicable Coverage Determination Guideline', () => {
  const text = 'UnitedHealthcare member.\n'
    + 'Requested procedure: CPT 72148.\n'
    + 'Medical necessity per the applicable UHC Coverage Determination Guideline (MCG).\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-UHC-001');
  assert.equal(f.status, 'pass');
});

test('R-PA-UHC-002 advises when a UHC packet has no recognized clinical document', () => {
  const text = 'UnitedHealthcare PPO member.\nRequested procedure: CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-UHC-002');
  assert.equal(f.status, 'info');
});

test('R-PA-UHC-002 passes when a UHC packet includes a clinical note', () => {
  const text = 'UnitedHealthcare member.\nRequested procedure: CPT 27447.\nChief complaint: knee pain. HPI: symptoms persist. Assessment and plan: proceed with arthroplasty.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-UHC-002');
  assert.equal(f.status, 'pass');
});

test('R-PA-UHC-003 advises when no electronic submission channel is identified', () => {
  const text = 'UnitedHealthcare member.\nRequested procedure: CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-UHC-003');
  assert.equal(f.status, 'info');
});

test('R-PA-UHC-003 passes for a Provider Portal submission', () => {
  const text = 'UnitedHealthcare member.\nSubmitted through the UnitedHealthcare Provider Portal Prior Authorization and Notification tool.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-UHC-003');
  assert.equal(f.status, 'pass');
});

test('R-PA-UHC-004 advises when no member-specific requirement lookup is documented', () => {
  const text = 'UnitedHealthcare member.\nRequested procedure: CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-UHC-004');
  assert.equal(f.status, 'info');
});

test('R-PA-UHC-004 passes when the member-specific lookup result is documented', () => {
  const text = 'UnitedHealthcare member.\nRequested procedure: CPT 27447.\nChecked by member in the Provider Portal; prior authorization is required. Decision ID D12345.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-UHC-004');
  assert.equal(f.status, 'pass');
});

test('R-PA-UHC-005 does not demand a confirmation for an unsubmitted prior-authorization request', () => {
  const text = 'UnitedHealthcare member.\nPrior authorization is required.\nProcedure CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-UHC-005');
  assert.equal(f.status, 'pass');
});

test('R-PA-UHC-005 advises when a submitted notification has no confirmation reference', () => {
  const text = 'UnitedHealthcare member.\nAdvance notification submitted.\nProcedure CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-UHC-005');
  assert.equal(f.status, 'info');
});

test('R-PA-UHC-005 passes when a submitted notification has a Decision ID', () => {
  const text = 'UnitedHealthcare member.\nAdvance notification submitted. Decision ID D12345.\nProcedure CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-UHC-005');
  assert.equal(f.status, 'pass');
});

test('R-PA-UHC-006 advises on an inpatient UHC workflow with no admission-notification status', () => {
  const text = 'UnitedHealthcare member.\nPlace of service: 21\nInpatient admission for acute care.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-UHC-006');
  assert.equal(f.status, 'info');
});

test('R-PA-UHC-006 passes an initial admission workflow with notification status', () => {
  const text = 'UnitedHealthcare member.\nPlace of service: 21\nInpatient admission.\nAdmission notification submitted.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-UHC-006');
  assert.equal(f.status, 'pass');
});

test('R-PA-UHC-006 advises when a concurrent review lacks clinical and discharge updates', () => {
  const text = 'UnitedHealthcare member.\nPlace of service: 21\nContinued-stay concurrent review.\nAdmission notification submitted.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-UHC-006');
  assert.equal(f.status, 'info');
  assert.match(f.note, /concurrent clinical update/);
  assert.match(f.note, /discharge-planning information/);
});

test('R-PA-UHC-006 passes a complete concurrent-review update', () => {
  const text = 'UnitedHealthcare member.\nPlace of service: 21\nContinued-stay concurrent review.\nAdmission notification submitted. Clinical update: improving. Discharge plan: home tomorrow.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-UHC-006');
  assert.equal(f.status, 'pass');
});

test('R-PA-UHC-007 advises on an in-scope outpatient MRI with no clinical condition', () => {
  const text = 'UnitedHealthcare commercial member.\nOutpatient imaging requested: MRI lumbar spine, CPT 72148.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-UHC-007');
  assert.equal(f.status, 'info');
});

test('R-PA-UHC-007 does not apply the outpatient protocol to inpatient imaging', () => {
  const text = 'UnitedHealthcare member.\nInpatient stay, place of service: 21. MRI lumbar spine, CPT 72148.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-UHC-007');
  assert.equal(f.status, 'pass');
});

test('R-PA-UHC-007 does not require CT authorization for Medicare Advantage', () => {
  const text = 'UnitedHealthcare Medicare Advantage member.\nOutpatient imaging requested: CT of the chest, CPT 71260.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-UHC-007');
  assert.equal(f.status, 'pass');
});

test('R-PA-UHC-008 passes when an expedited UHC request documents the clinical urgency', () => {
  const text = 'UnitedHealthcare member.\nExpedited review requested: delay would jeopardize the member\'s life or health.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-UHC-008');
  assert.equal(f.status, 'pass');
});

test('R-PA-UHC-008 flags an expedited UHC request with no clinical-urgency explanation', () => {
  const text = 'UnitedHealthcare member.\nExpedited review requested.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-UHC-008');
  assert.equal(f.status, 'flag');
});

test('R-PA-UHC-009 does not infer site-of-service review from an arbitrary hospital-outpatient surgery', () => {
  const text = 'UnitedHealthcare member.\nHospital outpatient surgery, place of service: 22. Procedure CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-UHC-009');
  assert.equal(f.status, 'pass');
});

test('R-PA-UHC-009 flags an explicitly in-scope site-of-service review with no hospital rationale', () => {
  const text = 'UnitedHealthcare commercial member.\nHospital outpatient surgery, place of service: 22. Site of service review applies under the Applicable Codes List. Procedure CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-UHC-009');
  assert.equal(f.status, 'flag');
});

test('R-PA-UHC-009 passes an in-scope review with a listed hospital rationale', () => {
  const text = 'UnitedHealthcare commercial member.\nHospital outpatient surgery, place of service: 22. Site of service review applies. Anticipated need for transfusion. Procedure CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-UHC-009');
  assert.equal(f.status, 'pass');
});

test('R-PA-UHC-010 does not apply the NDC claim rule to a prior-authorization request', () => {
  const text = 'UnitedHealthcare member.\nPrior authorization request for physician-administered drug J9299.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-UHC-010');
  assert.equal(f.status, 'pass');
});

test('R-PA-UHC-010 advises when a UHC drug claim lacks an 11-digit NDC', () => {
  const text = 'UnitedHealthcare member.\nCMS-1500 professional claim for J9299.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-UHC-010');
  assert.equal(f.status, 'info');
});

test('R-PA-UHC-010 passes a UHC drug claim with an 11-digit NDC', () => {
  const text = 'UnitedHealthcare member.\nCMS-1500 professional claim for J9299. NDC 00002143301.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-UHC-010');
  assert.equal(f.status, 'pass');
});

test('R-PA-UHC-011 flags a UHC specialty-drug request with no step-therapy prior-trial documentation', () => {
  const text = 'UnitedHealthcare member.\nSpecialty drug requested via OptumRx; step therapy applies.\nProcedure J3590.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-UHC-011');
  assert.equal(f.status, 'flag');
});

test('R-PA-UHC-011 does not infer step therapy from a specialty-drug request', () => {
  const text = 'UnitedHealthcare member.\nSpecialty drug requested via OptumRx. Procedure J3590.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-UHC-011');
  assert.equal(f.status, 'pass');
});

test('R-PA-UHC-011 passes an explicit step-therapy request with an exception basis', () => {
  const text = 'UnitedHealthcare member.\nStep therapy applies. Contraindication to the prerequisite drug documented.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-UHC-011');
  assert.equal(f.status, 'pass');
});

test('R-PA-UHC-012 does not infer program scope from generic genetic-testing language', () => {
  const text = 'UnitedHealthcare member.\nGenetic testing requested, CPT 81479.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-UHC-012');
  assert.equal(f.status, 'pass');
});

test('R-PA-UHC-012 flags an in-scope genetic request missing test, laboratory, and indication', () => {
  const text = 'UnitedHealthcare member.\nGenetic prior authorization required.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-UHC-012');
  assert.equal(f.status, 'flag');
  assert.match(f.note, /specific test name/);
  assert.match(f.note, /performing laboratory/);
  assert.match(f.note, /clinical indication/);
});

test('R-PA-UHC-012 passes a documented in-scope genetic request', () => {
  const text = 'UnitedHealthcare member.\nGenetic prior authorization required. Test name: hereditary cancer panel. Performing laboratory: Example Genetics, CLIA: 12D3456789. Diagnosis: Z80.3.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-UHC-012');
  assert.equal(f.status, 'pass');
});

test('R-PA-UHC-013 flags a UHC specialty-drug request with no ICD-10-CM code', () => {
  const text = 'UnitedHealthcare member.\nSpecialty drug infusion requested, J9299. Diagnosis: lung cancer.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-UHC-013');
  assert.equal(f.status, 'flag');
});

test('R-PA-UHC-013 passes a UHC specialty-drug request with an ICD-10-CM code', () => {
  const text = 'UnitedHealthcare member.\nSpecialty drug infusion requested, J9299. Diagnosis: C34.90.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-UHC-013');
  assert.equal(f.status, 'pass');
});

test('R-PA-UHC-014 does not generalize urgent imaging rules to every retrospective request', () => {
  const text = 'UnitedHealthcare member.\nRetrospective review requested for a completed office visit.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-UHC-014');
  assert.equal(f.status, 'pass');
});

test('R-PA-UHC-014 flags retrospective advanced imaging without both required explanations', () => {
  const text = 'UnitedHealthcare member.\nRetrospective authorization for CT scan performed on an urgent basis.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-UHC-014');
  assert.equal(f.status, 'flag');
  assert.match(f.note, /normal business hours/);
});

test('R-PA-UHC-014 passes retrospective advanced imaging with urgency and after-hours explanations', () => {
  const text = 'UnitedHealthcare member.\nRetrospective authorization for CT scan. Clinical urgency: risk to health. Authorization could not be requested because the office was closed after hours.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-UHC-014');
  assert.equal(f.status, 'pass');
});

test('R-PA-UHC-015 advises when a UHC DME request omits an order or prescriber', () => {
  const text = 'UnitedHealthcare member.\nDurable medical equipment: wheelchair requested.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-UHC-015');
  assert.equal(f.status, 'info');
});

test('R-PA-UHC-015 passes when a UHC DME request identifies the ordering provider', () => {
  const text = 'UnitedHealthcare member.\nDurable medical equipment: wheelchair requested. Ordering provider: Jane Doe, MD.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-UHC-015');
  assert.equal(f.status, 'pass');
});

test('R-PA-UHC-016 advises on an intensive UHC behavioral-health request with no clinical assessment', () => {
  const text = 'UnitedHealthcare member.\nRequest: inpatient psychiatric admission (Optum Behavioral Health).\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-UHC-016');
  assert.equal(f.status, 'info');
});

test('R-PA-UHC-016 passes generic mental-health language and an intensive request with an assessment', () => {
  const generic = runEngine(bundleOf('UnitedHealthcare member.\nMental health office visit.\n'));
  assert.equal(generic.find((x) => x.ruleId === 'R-PA-UHC-016').status, 'pass');

  const assessed = runEngine(bundleOf('UnitedHealthcare member.\nRequest: inpatient psychiatric admission.\nClinical assessment: current symptoms include suicidal ideation.\n'));
  assert.equal(assessed.find((x) => x.ruleId === 'R-PA-UHC-016').status, 'pass');
});

test('R-PA-UHC-017 applies only when the packet states an Optum transplant routing requirement', () => {
  const generic = runEngine(bundleOf('UnitedHealthcare member.\nRequest: kidney transplant evaluation.\n'));
  assert.equal(generic.find((x) => x.ruleId === 'R-PA-UHC-017').status, 'pass');

  const incomplete = runEngine(bundleOf('UnitedHealthcare member.\nOptum transplant protocol applies.\nRequest: kidney transplant evaluation.\n'));
  assert.equal(incomplete.find((x) => x.ruleId === 'R-PA-UHC-017').status, 'info');

  const complete = runEngine(bundleOf('UnitedHealthcare member.\nOptum transplant protocol applies.\nApproved transplant facility: University Hospital.\n'));
  assert.equal(complete.find((x) => x.ruleId === 'R-PA-UHC-017').status, 'pass');
});

test('R-PA-UHC-018 does not treat generic off-label or clinical-trial language as unproven', () => {
  for (const text of [
    'UnitedHealthcare member.\nOff-label medication request.\n',
    'UnitedHealthcare member.\nClinical trial participation documented.\n',
  ]) {
    const findings = runEngine(bundleOf(text));
    assert.equal(findings.find((x) => x.ruleId === 'R-PA-UHC-018').status, 'pass');
  }
});

test('R-PA-UHC-018 checks the exception workflow for a specialty drug explicitly listed as unproven', () => {
  const base = 'UnitedHealthcare member.\nMedical benefit specialty drug. Policy lists the drug as unproven for the requested indication.\n';
  const incomplete = runEngine(bundleOf(base));
  assert.equal(incomplete.find((x) => x.ruleId === 'R-PA-UHC-018').status, 'flag');

  const complete = runEngine(bundleOf(base + 'Health plan notified. Benefit exception approved.\n'));
  assert.equal(complete.find((x) => x.ruleId === 'R-PA-UHC-018').status, 'pass');
});

test('R-PA-UHC-019 limits its check to urgent pre-service appeals', () => {
  const generic = runEngine(bundleOf('UnitedHealthcare member.\nClaim reconsideration requested.\n'));
  assert.equal(generic.find((x) => x.ruleId === 'R-PA-UHC-019').status, 'pass');

  const incomplete = runEngine(bundleOf('UnitedHealthcare member.\nUrgent pre-service appeal requested.\n'));
  assert.equal(incomplete.find((x) => x.ruleId === 'R-PA-UHC-019').status, 'info');

  const complete = runEngine(bundleOf('UnitedHealthcare member.\nUrgent pre-service appeal requested because standard timing risks the health of the member.\n'));
  assert.equal(complete.find((x) => x.ruleId === 'R-PA-UHC-019').status, 'pass');
});

test('R-PA-UHC-020 does not apply the network-gap form to a generic out-of-network request', () => {
  const text = 'UnitedHealthcare member.\nOut-of-network prior authorization request.\nProcedure CPT 70551.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-UHC-020');
  assert.equal(f.status, 'pass');
});

test('R-PA-UHC-020 checks required intake fields for an explicit Commercial network-gap exception', () => {
  const incomplete = runEngine(bundleOf('UnitedHealthcare Commercial member.\nNetwork gap exception request.\n'));
  assert.equal(incomplete.find((x) => x.ruleId === 'R-PA-UHC-020').status, 'flag');

  const completeText = 'UnitedHealthcare Commercial member.\nNetwork gap exception request.\n'
    + 'Service reference number: PA-123.\n'
    + 'In-network referring provider: Jane Doe, MD.\n'
    + 'Reason for gap exception: no in-network provider offers the required service.\n';
  const complete = runEngine(bundleOf(completeText));
  assert.equal(complete.find((x) => x.ruleId === 'R-PA-UHC-020').status, 'pass');
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

test('R-PA-ANTHEM-001 advises when an Anthem request does not identify an applicable criteria resource', () => {
  const text = 'Anthem Blue Cross PPO member.\n'
    + 'Requested procedure: CPT 72148 (MRI lumbar spine).\n'
    + 'Please authorize.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-ANTHEM-001');
  assert.equal(f.status, 'info');
});

test('R-PA-ANTHEM-001 passes when the Anthem packet cites the applicable Clinical UM Guideline', () => {
  const text = 'Anthem member.\n'
    + 'Requested procedure: CPT 72148.\n'
    + 'Medical necessity per the applicable Anthem Clinical UM Guideline (MCG).\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-ANTHEM-001');
  assert.equal(f.status, 'pass');
});

test('R-PA-ANTHEM-002 treats missing recommended clinical documentation as advisory', () => {
  const text = 'Anthem Blue Cross PPO member.\nRequested procedure: CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-ANTHEM-002');
  assert.equal(f.status, 'info');
});

test('R-PA-ANTHEM-003 does not require the transport channel in packet content', () => {
  for (const text of [
    'Anthem member.\nProcedure CPT 27447.\n',
    'Anthem member.\nSubmitted via Availity.\nProcedure CPT 27447.\n',
  ]) {
    const findings = runEngine(bundleOf(text));
    assert.equal(findings.find((x) => x.ruleId === 'R-PA-ANTHEM-003').status, 'pass');
  }
});

test('R-PA-ANTHEM-004 remains neutral because Anthem requirements vary by state and plan', () => {
  const findings = runEngine(bundleOf('Anthem member.\nProcedure CPT 27447.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-ANTHEM-004').status, 'pass');
});

test('R-PA-ANTHEM-005 does not demand a reference from an initial authorization request', () => {
  const findings = runEngine(bundleOf('Anthem member.\nPrior authorization required for CPT 27447.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-ANTHEM-005').status, 'pass');
});

test('R-PA-ANTHEM-005 advises when a submitted authorization omits its case reference', () => {
  const incomplete = runEngine(bundleOf('Anthem member.\nPrior authorization submitted.\n'));
  assert.equal(incomplete.find((x) => x.ruleId === 'R-PA-ANTHEM-005').status, 'info');

  const complete = runEngine(bundleOf('Anthem member.\nPrior authorization submitted.\nAuthorization case: PA-123.\n'));
  assert.equal(complete.find((x) => x.ruleId === 'R-PA-ANTHEM-005').status, 'pass');
});

test('R-PA-ANTHEM-006 does not require concurrent-review documentation on an initial inpatient request', () => {
  const text = 'Anthem member.\nPlace of service: 21\nInitial inpatient admission request for acute care.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-ANTHEM-006').status, 'pass');
});

test('R-PA-ANTHEM-006 advises only when an explicit concurrent review lacks a current update', () => {
  const incomplete = runEngine(bundleOf('Anthem member.\nConcurrent review requested for additional inpatient days.\n'));
  assert.equal(incomplete.find((x) => x.ruleId === 'R-PA-ANTHEM-006').status, 'info');

  const complete = runEngine(bundleOf('Anthem member.\nConcurrent review requested.\nCurrent clinical status and response to treatment documented.\n'));
  assert.equal(complete.find((x) => x.ruleId === 'R-PA-ANTHEM-006').status, 'pass');
});

test('R-PA-ANTHEM-007 does not infer Carelon imaging review from an MRI or radiology code', () => {
  for (const text of [
    'Anthem member.\nRequested: MRI lumbar spine, CPT 72148.\n',
    'Anthem member.\nRequested procedure: CPT 71046.\n',
  ]) {
    const findings = runEngine(bundleOf(text));
    assert.equal(findings.find((x) => x.ruleId === 'R-PA-ANTHEM-007').status, 'pass');
  }
});

test('R-PA-ANTHEM-007 advises when an explicit Carelon imaging review lacks an indication', () => {
  const incomplete = runEngine(bundleOf('Anthem member.\nCarelon imaging review applies.\nRequested: MRI lumbar spine.\n'));
  assert.equal(incomplete.find((x) => x.ruleId === 'R-PA-ANTHEM-007').status, 'info');

  const complete = runEngine(bundleOf('Anthem member.\nCarelon imaging review applies.\nRequested: MRI lumbar spine.\nClinical indication: persistent radiculopathy.\n'));
  assert.equal(complete.find((x) => x.ruleId === 'R-PA-ANTHEM-007').status, 'pass');

  const inpatient = runEngine(bundleOf('Anthem member.\nPlace of service: 21\nAcute inpatient admission.\nCarelon imaging review applies.\nRequested: MRI lumbar spine.\n'));
  assert.equal(inpatient.find((x) => x.ruleId === 'R-PA-ANTHEM-007').status, 'pass');
});

test('R-PA-ANTHEM-008 passes when an expedited Anthem request documents the clinical urgency', () => {
  const text = 'Anthem member.\nExpedited review requested: delay would jeopardize the member\'s life or health.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-ANTHEM-008');
  assert.equal(f.status, 'pass');
});

test('R-PA-ANTHEM-008 gives a source-free advisory when an urgent request omits its rationale', () => {
  const findings = runEngine(bundleOf('Anthem member.\nUrgent prior authorization requested.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-ANTHEM-008').status, 'info');
});

test('R-PA-ANTHEM-009 runs only when the packet establishes that CG-SURG-10 applies', () => {
  const generic = runEngine(bundleOf('Anthem member.\nHospital outpatient surgery requested, CPT 27447.\n'));
  assert.equal(generic.find((x) => x.ruleId === 'R-PA-ANTHEM-009').status, 'pass');

  const incomplete = runEngine(bundleOf('Anthem member.\nCG-SURG-10 applies to this request.\n'));
  assert.equal(incomplete.find((x) => x.ruleId === 'R-PA-ANTHEM-009').status, 'flag');

  const complete = runEngine(bundleOf('Anthem member.\nCG-SURG-10 review.\nFacility required because the patient is ASA class III.\n'));
  assert.equal(complete.find((x) => x.ruleId === 'R-PA-ANTHEM-009').status, 'pass');
});

test('R-PA-ANTHEM-010 runs only for an explicit NDC requirement', () => {
  const generic = runEngine(bundleOf('Anthem member.\nSpecialty drug requested, procedure J3590.\n'));
  assert.equal(generic.find((x) => x.ruleId === 'R-PA-ANTHEM-010').status, 'pass');

  const incomplete = runEngine(bundleOf('Anthem member.\nNDC required for this request.\n'));
  assert.equal(incomplete.find((x) => x.ruleId === 'R-PA-ANTHEM-010').status, 'info');

  const complete = runEngine(bundleOf('Anthem member.\nNDC required for this request.\nNDC: 12345-6789-01.\n'));
  assert.equal(complete.find((x) => x.ruleId === 'R-PA-ANTHEM-010').status, 'pass');
});

test('R-PA-ANTHEM-011 does not infer step therapy from a specialty-drug request', () => {
  const findings = runEngine(bundleOf('Anthem member.\nSpecialty drug requested via CarelonRx.\nProcedure J3590.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-ANTHEM-011').status, 'pass');
});

test('R-PA-ANTHEM-011 advises on an incomplete explicit step-therapy workflow', () => {
  const incomplete = runEngine(bundleOf('Anthem member.\nMedical specialty drug request; step therapy applies.\n'));
  assert.equal(incomplete.find((x) => x.ruleId === 'R-PA-ANTHEM-011').status, 'info');

  const complete = runEngine(bundleOf('Anthem member.\nMedical specialty drug request; step therapy applies.\nPreferred drug tried and failed because of an inadequate response.\n'));
  assert.equal(complete.find((x) => x.ruleId === 'R-PA-ANTHEM-011').status, 'pass');
});

test('R-PA-ANTHEM-012 requires explicit Carelon scope before checking genetic-test details', () => {
  for (const text of [
    'Anthem member.\nGenetic testing requested, CPT 81479.\n',
    'Anthem member.\nMolecular pathology procedure, CPT 81211.\n',
  ]) {
    const findings = runEngine(bundleOf(text));
    assert.equal(findings.find((x) => x.ruleId === 'R-PA-ANTHEM-012').status, 'pass');
  }
});

test('R-PA-ANTHEM-012 requires both the named test and indication in an explicit Carelon review', () => {
  const missingBoth = runEngine(bundleOf('Anthem member.\nCarelon genetic review applies to this genetic testing request.\n'));
  assert.equal(missingBoth.find((x) => x.ruleId === 'R-PA-ANTHEM-012').status, 'info');

  const missingIndication = runEngine(bundleOf('Anthem member.\nCarelon genetic review applies.\nGenetic testing requested.\nTest name: hereditary cancer panel.\n'));
  assert.equal(missingIndication.find((x) => x.ruleId === 'R-PA-ANTHEM-012').status, 'info');

  const complete = runEngine(bundleOf('Anthem member.\nCarelon genetic review applies.\nGenetic testing requested.\nTest name: hereditary cancer panel.\nClinical indication: personal history of breast cancer.\n'));
  assert.equal(complete.find((x) => x.ruleId === 'R-PA-ANTHEM-012').status, 'pass');
});

test('R-PA-ANTHEM-013 checks diagnosis only when drug-specific Clinical Criteria explicitly apply', () => {
  const generic = runEngine(bundleOf('Anthem member.\nOncology drug requested, procedure J3590.\n'));
  assert.equal(generic.find((x) => x.ruleId === 'R-PA-ANTHEM-013').status, 'pass');

  const incomplete = runEngine(bundleOf('Anthem member.\nAnthem pharmacy Clinical Criteria applies to this drug request.\n'));
  assert.equal(incomplete.find((x) => x.ruleId === 'R-PA-ANTHEM-013').status, 'info');

  const complete = runEngine(bundleOf('Anthem member.\nAnthem pharmacy Clinical Criteria applies.\nDiagnosis: rheumatoid arthritis.\n'));
  assert.equal(complete.find((x) => x.ruleId === 'R-PA-ANTHEM-013').status, 'pass');
});

test('R-PA-ANTHEM-014 is a source-free advisory for an unexplained retrospective request', () => {
  const incomplete = runEngine(bundleOf('Anthem member.\nRetrospective authorization requested.\n'));
  assert.equal(incomplete.find((x) => x.ruleId === 'R-PA-ANTHEM-014').status, 'info');

  const complete = runEngine(bundleOf('Anthem member.\nRetrospective authorization requested after emergency care.\n'));
  assert.equal(complete.find((x) => x.ruleId === 'R-PA-ANTHEM-014').status, 'pass');
});

test('R-PA-ANTHEM-015 does not impose a universal signed-order rule on DME or home health', () => {
  for (const text of [
    'Anthem member.\nWheelchair requested, HCPCS E1130.\n',
    'Anthem member.\nHome health services requested.\n',
  ]) {
    const findings = runEngine(bundleOf(text));
    assert.equal(findings.find((x) => x.ruleId === 'R-PA-ANTHEM-015').status, 'pass');
  }
});

test('R-PA-ANTHEM-015 checks a signed order only when member-specific instructions require it', () => {
  const incomplete = runEngine(bundleOf('Anthem member.\nMember-specific instructions: signed order required.\n'));
  assert.equal(incomplete.find((x) => x.ruleId === 'R-PA-ANTHEM-015').status, 'info');

  const complete = runEngine(bundleOf('Anthem member.\nMember-specific instructions: signed order required.\nPhysician order.\nSignature: Dr. Smith.\n'));
  assert.equal(complete.find((x) => x.ruleId === 'R-PA-ANTHEM-015').status, 'pass');
});

test('R-PA-ANTHEM-016 checks only an explicit intensive behavioral-health level of care', () => {
  const generic = runEngine(bundleOf('Anthem member.\nOutpatient mental health therapy requested.\n'));
  assert.equal(generic.find((x) => x.ruleId === 'R-PA-ANTHEM-016').status, 'pass');

  const incomplete = runEngine(bundleOf('Anthem member.\nResidential treatment requested.\n'));
  assert.equal(incomplete.find((x) => x.ruleId === 'R-PA-ANTHEM-016').status, 'info');

  const complete = runEngine(bundleOf('Anthem member.\nResidential treatment requested.\nClinical assessment: current symptoms cannot be managed at a lower level.\n'));
  assert.equal(complete.find((x) => x.ruleId === 'R-PA-ANTHEM-016').status, 'pass');
});

test('R-PA-ANTHEM-017 checks transplant routing only when member-specific instructions require it', () => {
  const generic = runEngine(bundleOf('Anthem member.\nRequested service: kidney transplant.\n'));
  assert.equal(generic.find((x) => x.ruleId === 'R-PA-ANTHEM-017').status, 'pass');

  const incomplete = runEngine(bundleOf('Anthem member.\nDesignated transplant center required.\n'));
  assert.equal(incomplete.find((x) => x.ruleId === 'R-PA-ANTHEM-017').status, 'info');

  const complete = runEngine(bundleOf('Anthem member.\nDesignated transplant center required.\nSelected transplant center: General Hospital.\n'));
  assert.equal(complete.find((x) => x.ruleId === 'R-PA-ANTHEM-017').status, 'pass');
});

test('R-PA-ANTHEM-018 does not infer investigational status from off-label or trial language', () => {
  for (const text of [
    'Anthem member.\nOff-label drug use requested.\n',
    'Anthem member.\nPatient is enrolled in a clinical trial.\n',
  ]) {
    const findings = runEngine(bundleOf(text));
    assert.equal(findings.find((x) => x.ruleId === 'R-PA-ANTHEM-018').status, 'pass');
  }
});

test('R-PA-ANTHEM-018 checks the policy basis for an explicit Anthem investigational classification', () => {
  const incomplete = runEngine(bundleOf('Anthem member.\nClassified as investigational by Anthem.\n'));
  assert.equal(incomplete.find((x) => x.ruleId === 'R-PA-ANTHEM-018').status, 'info');

  const complete = runEngine(bundleOf('Anthem member.\nClassified as investigational by Anthem.\nApplicable Medical Policy: ADMIN.00005.\n'));
  assert.equal(complete.find((x) => x.ruleId === 'R-PA-ANTHEM-018').status, 'pass');
});

test('R-PA-ANTHEM-019 gives a source-free advisory when an appeal omits the original case', () => {
  const incomplete = runEngine(bundleOf('Anthem member.\nAppeal of prior authorization denial.\n'));
  assert.equal(incomplete.find((x) => x.ruleId === 'R-PA-ANTHEM-019').status, 'info');

  const complete = runEngine(bundleOf('Anthem member.\nAppeal of original denial dated September 1, 2026.\n'));
  assert.equal(complete.find((x) => x.ruleId === 'R-PA-ANTHEM-019').status, 'pass');
});

test('R-PA-ANTHEM-020 does not treat generic out-of-network use as a gap exception', () => {
  const findings = runEngine(bundleOf('Anthem member.\nOut-of-network prior authorization request.\nProcedure CPT 70551.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-ANTHEM-020').status, 'pass');
});

test('R-PA-ANTHEM-020 checks the reason for an explicit gap or continuity request', () => {
  const incomplete = runEngine(bundleOf('Anthem member.\nNetwork gap request.\n'));
  assert.equal(incomplete.find((x) => x.ruleId === 'R-PA-ANTHEM-020').status, 'info');

  const complete = runEngine(bundleOf('Anthem member.\nContinuity of care request because the patient is in an active course of treatment.\n'));
  assert.equal(complete.find((x) => x.ruleId === 'R-PA-ANTHEM-020').status, 'pass');
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

test('R-PA-CIGNA-001 treats a missing coverage-criteria reference as informational', () => {
  const text = 'Cigna Open Access Plus member.\n'
    + 'Requested procedure: CPT 72148 (MRI lumbar spine).\n'
    + 'Please authorize.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-CIGNA-001');
  assert.equal(f.status, 'info');
});

test('R-PA-CIGNA-001 passes when the Cigna packet cites the applicable Medical Coverage Policy', () => {
  const text = 'Cigna member.\n'
    + 'Requested procedure: CPT 72148.\n'
    + 'Medical necessity per the applicable Cigna Medical Coverage Policy (MCG).\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-CIGNA-001');
  assert.equal(f.status, 'pass');
});

test('R-PA-CIGNA-002 treats a missing clinical document as informational', () => {
  const text = 'Cigna Open Access Plus member.\nRequested procedure: CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-CIGNA-002');
  assert.equal(f.status, 'info');
});

test('R-PA-CIGNA-003 does not require the transport channel in packet content', () => {
  const text = 'Cigna member.\nProcedure CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-CIGNA-003');
  assert.equal(f.status, 'pass');
});

test('R-PA-CIGNA-004 remains non-enforcing without a member-specific requirement lookup', () => {
  const findings = runEngine(bundleOf('Cigna member.\nProcedure CPT 27447.\n'));
  const f = findings.find((x) => x.ruleId === 'R-PA-CIGNA-004');
  assert.equal(f.status, 'pass');
  assert.match(f.evidence, /member-specific/i);
});

test('R-PA-CIGNA-005 does not expect an authorization number on an initial request', () => {
  const findings = runEngine(bundleOf('Cigna member.\nPrior authorization required.\nProcedure CPT 27447.\n'));
  const f = findings.find((x) => x.ruleId === 'R-PA-CIGNA-005');
  assert.equal(f.status, 'pass');
});

test('R-PA-CIGNA-005 checks the reference only after submission is claimed', () => {
  const incomplete = runEngine(bundleOf('Cigna member.\nPrecertification submitted.\n'));
  assert.equal(incomplete.find((x) => x.ruleId === 'R-PA-CIGNA-005').status, 'info');

  const complete = runEngine(bundleOf('Cigna member.\nPrecertification submitted.\nReference number: CIG-123.\n'));
  assert.equal(complete.find((x) => x.ruleId === 'R-PA-CIGNA-005').status, 'pass');
});

test('R-PA-CIGNA-006 does not treat an initial inpatient request as an admission notification', () => {
  const text = 'Cigna member.\nPlace of service: 21\nInpatient admission for acute care.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-CIGNA-006');
  assert.equal(f.status, 'pass');
});

test('R-PA-CIGNA-006 enforces notification only for an emergency inpatient admission', () => {
  const incomplete = runEngine(bundleOf('Cigna member.\nEmergency inpatient admission.\n'));
  assert.equal(incomplete.find((x) => x.ruleId === 'R-PA-CIGNA-006').status, 'flag');

  const complete = runEngine(bundleOf('Cigna member.\nEmergency inpatient admission.\nAdmission reported to Cigna.\n'));
  assert.equal(complete.find((x) => x.ruleId === 'R-PA-CIGNA-006').status, 'pass');
});

test('R-PA-CIGNA-007 treats a missing MRI indication as informational', () => {
  const text = 'Cigna member.\nRequested: MRI lumbar spine, CPT 72148.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-CIGNA-007');
  assert.equal(f.status, 'info');
});

test('R-PA-CIGNA-007 does not infer advanced imaging from every radiology CPT', () => {
  const findings = runEngine(bundleOf('Cigna member.\nRequested: bone density study, CPT 77080.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-CIGNA-007').status, 'pass');
});

test('R-PA-CIGNA-008 passes when an expedited Cigna request documents the clinical urgency', () => {
  const text = 'Cigna member.\nExpedited review requested: delay would jeopardize the member\'s life or health.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-CIGNA-008');
  assert.equal(f.status, 'pass');
});

test('R-PA-CIGNA-008 is a source-free advisory when urgency is missing', () => {
  const findings = runEngine(bundleOf('Cigna member.\nExpedited review requested.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-CIGNA-008').status, 'info');
});

test('R-PA-CIGNA-009 does not extrapolate Policy 0550 to outpatient surgery', () => {
  const findings = runEngine(bundleOf('Cigna member.\nHospital outpatient surgery.\nPlace of service: 22\nProcedure CPT 27447.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-CIGNA-009').status, 'pass');
});

test('R-PA-CIGNA-009 advises when hospital-based high-tech imaging lacks a Policy 0550 reason', () => {
  const incomplete = runEngine(bundleOf('Cigna member.\nHospital-based imaging: MRI lumbar spine.\n'));
  assert.equal(incomplete.find((x) => x.ruleId === 'R-PA-CIGNA-009').status, 'info');

  const complete = runEngine(bundleOf('Cigna member.\nHospital-based imaging: MRI lumbar spine.\nGeneral anesthesia is required.\n'));
  assert.equal(complete.find((x) => x.ruleId === 'R-PA-CIGNA-009').status, 'pass');
});

test('R-PA-CIGNA-010 does not impose an NDC on every J-code request', () => {
  const findings = runEngine(bundleOf('Cigna member.\nPhysician-administered drug, procedure J3590.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-CIGNA-010').status, 'pass');
});

test('R-PA-CIGNA-010 checks an explicitly required NDC', () => {
  const incomplete = runEngine(bundleOf('Cigna member.\nNDC required.\nProcedure J3590.\n'));
  assert.equal(incomplete.find((x) => x.ruleId === 'R-PA-CIGNA-010').status, 'info');

  const complete = runEngine(bundleOf('Cigna member.\nNDC required: 00002-8215-01.\nProcedure J3590.\n'));
  assert.equal(complete.find((x) => x.ruleId === 'R-PA-CIGNA-010').status, 'pass');
});

test('R-PA-CIGNA-011 flags a Cigna specialty-drug request with no step-therapy prior-trial documentation', () => {
  const text = 'Cigna member.\nSpecialty drug requested via Express Scripts / Accredo; step therapy applies.\nProcedure J3590.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-CIGNA-011');
  assert.equal(f.status, 'flag');
});

test('R-PA-CIGNA-011 does not infer step therapy from a generic specialty-drug request', () => {
  const findings = runEngine(bundleOf('Cigna member.\nSpecialty drug request.\nProcedure J3590.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-CIGNA-011').status, 'pass');
});

test('R-PA-CIGNA-012 requires both the specific genetic test and indication', () => {
  const incomplete = runEngine(bundleOf('Cigna member.\nGenetic testing requested.\nClinical indication: hereditary neuropathy.\n'));
  assert.equal(incomplete.find((x) => x.ruleId === 'R-PA-CIGNA-012').status, 'info');

  const complete = runEngine(bundleOf('Cigna member.\nGenetic testing requested.\nGene panel: hereditary neuropathy panel.\nClinical indication: hereditary neuropathy.\n'));
  assert.equal(complete.find((x) => x.ruleId === 'R-PA-CIGNA-012').status, 'pass');
});

test('R-PA-CIGNA-013 does not impose a diagnosis rule on every J-code request', () => {
  const findings = runEngine(bundleOf('Cigna member.\nSpecialty drug request.\nProcedure J3590.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-CIGNA-013').status, 'pass');
});

test('R-PA-CIGNA-013 checks an explicitly required drug-policy diagnosis', () => {
  const incomplete = runEngine(bundleOf('Cigna member.\nDiagnosis required by drug policy.\n'));
  assert.equal(incomplete.find((x) => x.ruleId === 'R-PA-CIGNA-013').status, 'info');

  const complete = runEngine(bundleOf('Cigna member.\nDiagnosis required by drug policy.\nDiagnosis: rheumatoid arthritis.\n'));
  assert.equal(complete.find((x) => x.ruleId === 'R-PA-CIGNA-013').status, 'pass');
});

test('R-PA-CIGNA-014 is a source-free advisory for an unexplained retro request', () => {
  const findings = runEngine(bundleOf('Cigna member.\nRetrospective authorization request.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-CIGNA-014').status, 'info');
});

test('R-PA-CIGNA-015 does not require an order for every DME request', () => {
  const findings = runEngine(bundleOf('Cigna member.\nWheelchair request, HCPCS K0001.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-CIGNA-015').status, 'pass');
});

test('R-PA-CIGNA-015 checks a signed order only when explicitly required', () => {
  const incomplete = runEngine(bundleOf('Cigna member.\nWritten order required.\n'));
  assert.equal(incomplete.find((x) => x.ruleId === 'R-PA-CIGNA-015').status, 'info');

  const complete = runEngine(bundleOf('Cigna member.\nWritten order required.\nPhysician order.\nElectronically signed.\n'));
  assert.equal(complete.find((x) => x.ruleId === 'R-PA-CIGNA-015').status, 'pass');
});

test('R-PA-CIGNA-016 checks only facility-based behavioral-health requests', () => {
  const routine = runEngine(bundleOf('Cigna member.\nRoutine outpatient mental health visit.\n'));
  assert.equal(routine.find((x) => x.ruleId === 'R-PA-CIGNA-016').status, 'pass');

  const incomplete = runEngine(bundleOf('Cigna member.\nInpatient psychiatric request.\n'));
  assert.equal(incomplete.find((x) => x.ruleId === 'R-PA-CIGNA-016').status, 'info');

  const complete = runEngine(bundleOf('Cigna member.\nInpatient psychiatric request.\nClinical assessment: current symptoms and risk assessment documented.\n'));
  assert.equal(complete.find((x) => x.ruleId === 'R-PA-CIGNA-016').status, 'pass');
});

test('R-PA-CIGNA-017 applies LifeSOURCE routing only when explicitly required', () => {
  const generic = runEngine(bundleOf('Cigna member.\nRequested service: kidney transplant.\n'));
  assert.equal(generic.find((x) => x.ruleId === 'R-PA-CIGNA-017').status, 'pass');

  const incomplete = runEngine(bundleOf('Cigna member.\nCigna LifeSOURCE required.\n'));
  assert.equal(incomplete.find((x) => x.ruleId === 'R-PA-CIGNA-017').status, 'info');

  const complete = runEngine(bundleOf('Cigna member.\nCigna LifeSOURCE required.\nLifeSOURCE facility: Example Transplant Center.\n'));
  assert.equal(complete.find((x) => x.ruleId === 'R-PA-CIGNA-017').status, 'pass');
});

test('R-PA-CIGNA-018 does not infer EIU status from off-label or trial language', () => {
  const findings = runEngine(bundleOf('Cigna member.\nOff-label treatment in a clinical trial.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-CIGNA-018').status, 'pass');
});

test('R-PA-CIGNA-018 checks the policy behind an explicit EIU classification', () => {
  const incomplete = runEngine(bundleOf('Cigna member.\nClassified by Cigna as investigational.\n'));
  assert.equal(incomplete.find((x) => x.ruleId === 'R-PA-CIGNA-018').status, 'info');

  const complete = runEngine(bundleOf('Cigna member.\nClassified by Cigna as investigational.\nCigna Coverage Policy: 0123.\n'));
  assert.equal(complete.find((x) => x.ruleId === 'R-PA-CIGNA-018').status, 'pass');
});

test('R-PA-CIGNA-019 checks the original determination on an appeal', () => {
  const incomplete = runEngine(bundleOf('Cigna member.\nAppeal requested.\n'));
  assert.equal(incomplete.find((x) => x.ruleId === 'R-PA-CIGNA-019').status, 'info');

  const complete = runEngine(bundleOf('Cigna member.\nAppeal of original denial dated September 1, 2026.\n'));
  assert.equal(complete.find((x) => x.ruleId === 'R-PA-CIGNA-019').status, 'pass');
});

test('R-PA-CIGNA-020 distinguishes generic out-of-network use from a gap request', () => {
  const generic = runEngine(bundleOf('Cigna member.\nOut-of-network prior authorization request.\n'));
  assert.equal(generic.find((x) => x.ruleId === 'R-PA-CIGNA-020').status, 'pass');

  const incomplete = runEngine(bundleOf('Cigna member.\nNetwork gap request.\n'));
  assert.equal(incomplete.find((x) => x.ruleId === 'R-PA-CIGNA-020').status, 'info');

  const complete = runEngine(bundleOf('Cigna member.\nContinuity of care request for an active course of treatment.\n'));
  assert.equal(complete.find((x) => x.ruleId === 'R-PA-CIGNA-020').status, 'pass');
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

test('R-PA-HUMANA-001 treats a missing policy reference as informational', () => {
  const text = 'Humana ChoiceCare PPO member.\n'
    + 'Requested procedure: CPT 72148 (MRI lumbar spine).\n'
    + 'Please authorize.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-HUMANA-001');
  assert.equal(f.status, 'info');
});

test('R-PA-HUMANA-001 passes when the Humana packet cites the applicable Medical Coverage Policy', () => {
  const text = 'Humana member.\n'
    + 'Requested procedure: CPT 72148.\n'
    + 'Medical necessity per the applicable Humana Medical Coverage Policy (MCG).\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-HUMANA-001');
  assert.equal(f.status, 'pass');
});

test('R-PA-HUMANA-002 treats a missing recognized clinical document as informational', () => {
  const text = 'Humana ChoiceCare PPO member.\nRequested procedure: CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-HUMANA-002');
  assert.equal(f.status, 'info');
});

test('R-PA-HUMANA-003 does not require the transport channel in packet content', () => {
  const text = 'Humana member.\nProcedure CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-HUMANA-003');
  assert.equal(f.status, 'pass');
});

test('R-PA-HUMANA-004 remains non-enforcing without member-specific requirements', () => {
  const findings = runEngine(bundleOf('Humana member.\nProcedure CPT 27447.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-HUMANA-004').status, 'pass');
});

test('R-PA-HUMANA-005 checks a reference only after submission is complete', () => {
  const initial = runEngine(bundleOf('Humana member.\nPrior authorization required.\n'));
  assert.equal(initial.find((x) => x.ruleId === 'R-PA-HUMANA-005').status, 'pass');

  const submitted = runEngine(bundleOf('Humana member.\nPrior authorization submitted.\n'));
  assert.equal(submitted.find((x) => x.ruleId === 'R-PA-HUMANA-005').status, 'info');

  const confirmed = runEngine(bundleOf('Humana member.\nPrior authorization submitted.\nReference number: H12345.\n'));
  assert.equal(confirmed.find((x) => x.ruleId === 'R-PA-HUMANA-005').status, 'pass');
});

test('R-PA-HUMANA-006 distinguishes an initial admission from continued-stay review', () => {
  const initial = runEngine(bundleOf('Humana member.\nPlace of service: 21\nInpatient admission for acute care.\n'));
  assert.equal(initial.find((x) => x.ruleId === 'R-PA-HUMANA-006').status, 'pass');

  const incomplete = runEngine(bundleOf('Humana member.\nContinued stay request for additional inpatient days.\n'));
  assert.equal(incomplete.find((x) => x.ruleId === 'R-PA-HUMANA-006').status, 'info');

  const complete = runEngine(bundleOf('Humana member.\nContinued stay request.\nClinical update: response to treatment and expected discharge documented.\n'));
  assert.equal(complete.find((x) => x.ruleId === 'R-PA-HUMANA-006').status, 'pass');
});

test('R-PA-HUMANA-007 scopes clinical rationale to explicit advanced imaging', () => {
  const otherRadiology = runEngine(bundleOf('Humana member.\nScreening mammography CPT 77067.\n'));
  assert.equal(otherRadiology.find((x) => x.ruleId === 'R-PA-HUMANA-007').status, 'pass');

  const incomplete = runEngine(bundleOf('Humana member.\nRequested: MRI lumbar spine, CPT 72148.\n'));
  assert.equal(incomplete.find((x) => x.ruleId === 'R-PA-HUMANA-007').status, 'info');

  const complete = runEngine(bundleOf('Humana member.\nRequested: MRI lumbar spine.\nClinical indication: persistent radicular symptoms.\n'));
  assert.equal(complete.find((x) => x.ruleId === 'R-PA-HUMANA-007').status, 'pass');
});

test('R-PA-HUMANA-008 is advisory and requires a rationale only for expedited handling', () => {
  const incomplete = runEngine(bundleOf('Humana member.\nExpedited review requested.\n'));
  assert.equal(incomplete.find((x) => x.ruleId === 'R-PA-HUMANA-008').status, 'info');

  const complete = runEngine(bundleOf('Humana member.\nExpedited review requested: delay would jeopardize the member\'s life or health.\n'));
  assert.equal(complete.find((x) => x.ruleId === 'R-PA-HUMANA-008').status, 'pass');
});

test('R-PA-HUMANA-009 runs only for an explicit site-of-care review', () => {
  const generic = runEngine(bundleOf('Humana member.\nHospital outpatient surgery, POS 22, CPT 29881.\n'));
  assert.equal(generic.find((x) => x.ruleId === 'R-PA-HUMANA-009').status, 'pass');

  const incomplete = runEngine(bundleOf('Humana member.\nSite-of-care review requested.\n'));
  assert.equal(incomplete.find((x) => x.ruleId === 'R-PA-HUMANA-009').status, 'info');

  const complete = runEngine(bundleOf('Humana member.\nSite-of-care review requested.\nHospital setting is medically necessary because higher acuity monitoring is required.\n'));
  assert.equal(complete.find((x) => x.ruleId === 'R-PA-HUMANA-009').status, 'pass');
});

test('R-PA-HUMANA-010 does not infer an NDC requirement from every J-code', () => {
  const generic = runEngine(bundleOf('Humana member.\nPhysician-administered drug J3590.\n'));
  assert.equal(generic.find((x) => x.ruleId === 'R-PA-HUMANA-010').status, 'pass');

  const incomplete = runEngine(bundleOf('Humana member.\nPhysician-administered drug.\nNDC required.\n'));
  assert.equal(incomplete.find((x) => x.ruleId === 'R-PA-HUMANA-010').status, 'info');

  const complete = runEngine(bundleOf('Humana member.\nPhysician-administered drug.\nNDC required: 0002-8215-01.\n'));
  assert.equal(complete.find((x) => x.ruleId === 'R-PA-HUMANA-010').status, 'pass');
});

test('R-PA-HUMANA-011 applies only to an explicit step-therapy requirement', () => {
  const generic = runEngine(bundleOf('Humana member.\nSpecialty drug J3590.\n'));
  assert.equal(generic.find((x) => x.ruleId === 'R-PA-HUMANA-011').status, 'pass');

  const incomplete = runEngine(bundleOf('Humana member.\nStep therapy applies.\n'));
  assert.equal(incomplete.find((x) => x.ruleId === 'R-PA-HUMANA-011').status, 'info');

  const complete = runEngine(bundleOf('Humana member.\nStep therapy applies.\nPrior therapy tried and failed.\n'));
  assert.equal(complete.find((x) => x.ruleId === 'R-PA-HUMANA-011').status, 'pass');
});

test('R-PA-HUMANA-012 scopes MD/GT details to the explicit Humana workflow', () => {
  const generic = runEngine(bundleOf('Humana member.\nGenetic test CPT 81479.\n'));
  assert.equal(generic.find((x) => x.ruleId === 'R-PA-HUMANA-012').status, 'pass');

  const incomplete = runEngine(bundleOf('Humana member.\nHumana MD/GT prior authorization.\n'));
  assert.equal(incomplete.find((x) => x.ruleId === 'R-PA-HUMANA-012').status, 'info');

  const complete = runEngine(bundleOf('Humana member.\nHumana MD/GT prior authorization.\nTest name: hereditary cancer panel.\nClinical indication: personal cancer history.\n'));
  assert.equal(complete.find((x) => x.ruleId === 'R-PA-HUMANA-012').status, 'pass');
});

test('R-PA-HUMANA-013 checks diagnosis only for explicit oncology-drug review', () => {
  const generic = runEngine(bundleOf('Humana member.\nSpecialty infusion drug J3590.\n'));
  assert.equal(generic.find((x) => x.ruleId === 'R-PA-HUMANA-013').status, 'pass');

  const incomplete = runEngine(bundleOf('Humana member.\nChemotherapy agent authorization request.\n'));
  assert.equal(incomplete.find((x) => x.ruleId === 'R-PA-HUMANA-013').status, 'info');

  const complete = runEngine(bundleOf('Humana member.\nChemotherapy agent authorization request.\nDiagnosis: C50.919.\n'));
  assert.equal(complete.find((x) => x.ruleId === 'R-PA-HUMANA-013').status, 'pass');
});

test('R-PA-HUMANA-014 is a source-free retro-review completeness advisory', () => {
  const incomplete = runEngine(bundleOf('Humana member.\nRetroactive authorization requested.\n'));
  assert.equal(incomplete.find((x) => x.ruleId === 'R-PA-HUMANA-014').status, 'info');

  const complete = runEngine(bundleOf('Humana member.\nRetroactive authorization requested after emergency care.\n'));
  assert.equal(complete.find((x) => x.ruleId === 'R-PA-HUMANA-014').status, 'pass');
});

test('R-PA-HUMANA-015 applies only when instructions explicitly require an order', () => {
  const generic = runEngine(bundleOf('Humana member.\nDurable medical equipment: wheelchair.\n'));
  assert.equal(generic.find((x) => x.ruleId === 'R-PA-HUMANA-015').status, 'pass');

  const incomplete = runEngine(bundleOf('Humana member.\nWritten order required.\n'));
  assert.equal(incomplete.find((x) => x.ruleId === 'R-PA-HUMANA-015').status, 'info');

  const complete = runEngine(bundleOf('Humana member.\nWritten order required.\nPhysician order.\nElectronically signed.\n'));
  assert.equal(complete.find((x) => x.ruleId === 'R-PA-HUMANA-015').status, 'pass');
});

test('R-PA-HUMANA-016 scopes assessment checks to intensive behavioral care', () => {
  const outpatient = runEngine(bundleOf('Humana member.\nOutpatient mental health visit.\n'));
  assert.equal(outpatient.find((x) => x.ruleId === 'R-PA-HUMANA-016').status, 'pass');

  const incomplete = runEngine(bundleOf('Humana member.\nInpatient psychiatric admission requested.\n'));
  assert.equal(incomplete.find((x) => x.ruleId === 'R-PA-HUMANA-016').status, 'info');

  const complete = runEngine(bundleOf('Humana member.\nInpatient psychiatric admission requested.\nPsychiatric assessment: current symptoms and risks documented.\n'));
  assert.equal(complete.find((x) => x.ruleId === 'R-PA-HUMANA-016').status, 'pass');
});

test('R-PA-HUMANA-017 checks a facility only for explicit transplant routing', () => {
  const evaluation = runEngine(bundleOf('Humana member.\nTransplant evaluation requested.\n'));
  assert.equal(evaluation.find((x) => x.ruleId === 'R-PA-HUMANA-017').status, 'pass');

  const incomplete = runEngine(bundleOf('Humana member.\nNational Transplant Network required.\n'));
  assert.equal(incomplete.find((x) => x.ruleId === 'R-PA-HUMANA-017').status, 'info');

  const complete = runEngine(bundleOf('Humana member.\nNational Transplant Network required.\nSelected transplant center: Example Medical Center.\n'));
  assert.equal(complete.find((x) => x.ruleId === 'R-PA-HUMANA-017').status, 'pass');
});

test('R-PA-HUMANA-018 requires a policy only for an explicit Humana classification', () => {
  const generic = runEngine(bundleOf('Humana member.\nOff-label treatment in a clinical trial.\n'));
  assert.equal(generic.find((x) => x.ruleId === 'R-PA-HUMANA-018').status, 'pass');

  const incomplete = runEngine(bundleOf('Humana member.\nClassified by Humana as investigational.\n'));
  assert.equal(incomplete.find((x) => x.ruleId === 'R-PA-HUMANA-018').status, 'info');

  const complete = runEngine(bundleOf('Humana member.\nClassified by Humana as investigational.\nHumana Medical Coverage Policy: Example policy.\n'));
  assert.equal(complete.find((x) => x.ruleId === 'R-PA-HUMANA-018').status, 'pass');
});

test('R-PA-HUMANA-019 checks the original reference for an explicit appeal', () => {
  const incomplete = runEngine(bundleOf('Humana member.\nAppeal requested.\n'));
  assert.equal(incomplete.find((x) => x.ruleId === 'R-PA-HUMANA-019').status, 'info');

  const complete = runEngine(bundleOf('Humana member.\nAppeal requested.\nOriginal denial dated August 1, 2026.\n'));
  assert.equal(complete.find((x) => x.ruleId === 'R-PA-HUMANA-019').status, 'pass');
});

test('R-PA-HUMANA-020 scopes rationale checks to an explicit network exception', () => {
  const generic = runEngine(bundleOf('Humana member.\nOut-of-network prior authorization request.\n'));
  assert.equal(generic.find((x) => x.ruleId === 'R-PA-HUMANA-020').status, 'pass');

  const incomplete = runEngine(bundleOf('Humana member.\nNetwork gap request.\n'));
  assert.equal(incomplete.find((x) => x.ruleId === 'R-PA-HUMANA-020').status, 'info');

  const complete = runEngine(bundleOf('Humana member.\nContinuity of care exception.\nActive course of treatment with the current provider.\n'));
  assert.equal(complete.find((x) => x.ruleId === 'R-PA-HUMANA-020').status, 'pass');
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

test('R-PA-HCSC-001 is an informational coverage-policy mapping aid', () => {
  const text = 'Blue Cross Blue Shield of Illinois PPO member.\n'
    + 'Requested procedure: CPT 72148 (MRI lumbar spine).\n'
    + 'Please authorize.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-HCSC-001');
  assert.equal(f.status, 'info');
});

test('R-PA-HCSC-001 passes when the HCSC packet cites the applicable Medical Policy', () => {
  const text = 'Blue Cross Blue Shield of Texas member.\n'
    + 'Requested procedure: CPT 72148.\n'
    + 'Medical necessity per the applicable HCSC Medical Policy (MCG).\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-HCSC-001');
  assert.equal(f.status, 'pass');
});

test('R-PA-HCSC-002 treats a recognized clinical attachment as request-specific', () => {
  const incomplete = runEngine(bundleOf('Blue Cross Blue Shield of Illinois PPO member.\nRequested procedure: CPT 27447.\n'));
  assert.equal(incomplete.find((x) => x.ruleId === 'R-PA-HCSC-002').status, 'info');

  const complete = runEngine(bundleOf('Blue Cross Blue Shield of Illinois PPO member.\nClinical note.\nRequested procedure: CPT 27447.\n'));
  assert.equal(complete.find((x) => x.ruleId === 'R-PA-HCSC-002').status, 'pass');
});

test('R-PA-HCSC-003 does not require the submission channel in packet content', () => {
  const findings = runEngine(bundleOf('Health Care Service Corporation member.\nProcedure CPT 27447.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-HCSC-003').status, 'pass');
});

test('R-PA-HCSC-004 remains non-enforcing without a member-specific lookup', () => {
  const findings = runEngine(bundleOf('Blue Cross Blue Shield of Illinois PPO member.\nProcedure CPT 27447.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-HCSC-004').status, 'pass');
});

test('R-PA-HCSC-005 checks a reference only after submission is complete', () => {
  const initial = runEngine(bundleOf('Blue Cross Blue Shield of Illinois PPO member.\nPrior authorization required.\n'));
  assert.equal(initial.find((x) => x.ruleId === 'R-PA-HCSC-005').status, 'pass');

  const submitted = runEngine(bundleOf('Blue Cross Blue Shield of Illinois PPO member.\nPrior authorization submitted.\n'));
  assert.equal(submitted.find((x) => x.ruleId === 'R-PA-HCSC-005').status, 'info');

  const confirmed = runEngine(bundleOf('Blue Cross Blue Shield of Illinois PPO member.\nPrior authorization submitted.\nReference number: I12345.\n'));
  assert.equal(confirmed.find((x) => x.ruleId === 'R-PA-HCSC-005').status, 'pass');
});

test('R-PA-HCSC-006 distinguishes initial admission from continued-stay review', () => {
  const initial = runEngine(bundleOf('Blue Cross Blue Shield of Illinois member.\nPlace of service: 21\nInpatient admission for acute care.\n'));
  assert.equal(initial.find((x) => x.ruleId === 'R-PA-HCSC-006').status, 'pass');

  const incomplete = runEngine(bundleOf('Blue Cross Blue Shield of Illinois member.\nContinued stay request for additional inpatient days.\n'));
  assert.equal(incomplete.find((x) => x.ruleId === 'R-PA-HCSC-006').status, 'info');

  const complete = runEngine(bundleOf('Blue Cross Blue Shield of Illinois member.\nContinued stay request.\nClinical update: responding to treatment.\nExpected discharge: September 20, 2026.\n'));
  assert.equal(complete.find((x) => x.ruleId === 'R-PA-HCSC-006').status, 'pass');
});

test('R-PA-HCSC-007 scopes clinical rationale to outpatient advanced imaging', () => {
  const otherRadiology = runEngine(bundleOf('Blue Cross Blue Shield of Illinois member.\nScreening mammography CPT 77067.\n'));
  assert.equal(otherRadiology.find((x) => x.ruleId === 'R-PA-HCSC-007').status, 'pass');

  const inpatient = runEngine(bundleOf('Blue Cross Blue Shield of Illinois member.\nPlace of service: 21\nInpatient MRI lumbar spine.\n'));
  assert.equal(inpatient.find((x) => x.ruleId === 'R-PA-HCSC-007').status, 'pass');

  const incomplete = runEngine(bundleOf('Blue Cross Blue Shield of Texas member.\nRequested: MRI lumbar spine, CPT 72148.\n'));
  assert.equal(incomplete.find((x) => x.ruleId === 'R-PA-HCSC-007').status, 'info');

  const complete = runEngine(bundleOf('Blue Cross Blue Shield of Texas member.\nRequested: MRI lumbar spine.\nClinical indication: persistent radicular symptoms.\n'));
  assert.equal(complete.find((x) => x.ruleId === 'R-PA-HCSC-007').status, 'pass');
});

test('R-PA-HCSC-008 is an informational expedited-review advisory', () => {
  const incomplete = runEngine(bundleOf('Blue Cross Blue Shield of Illinois member.\nExpedited review requested.\n'));
  assert.equal(incomplete.find((x) => x.ruleId === 'R-PA-HCSC-008').status, 'info');

  const complete = runEngine(bundleOf('Blue Cross Blue Shield of Illinois member.\nExpedited review requested: delay would jeopardize the member\'s life or health.\n'));
  assert.equal(complete.find((x) => x.ruleId === 'R-PA-HCSC-008').status, 'pass');
});

test('R-PA-HCSC-009 runs only for an explicit site-of-care review', () => {
  const generic = runEngine(bundleOf('Blue Cross Blue Shield of Illinois member.\nHospital outpatient surgery, POS 22, CPT 29881.\n'));
  assert.equal(generic.find((x) => x.ruleId === 'R-PA-HCSC-009').status, 'pass');

  const incomplete = runEngine(bundleOf('Blue Cross Blue Shield of Illinois member.\nSite-of-care review requested.\n'));
  assert.equal(incomplete.find((x) => x.ruleId === 'R-PA-HCSC-009').status, 'info');

  const complete = runEngine(bundleOf('Blue Cross Blue Shield of Illinois member.\nSite-of-care review requested.\nRequested site is medically necessary because higher acuity monitoring is required.\n'));
  assert.equal(complete.find((x) => x.ruleId === 'R-PA-HCSC-009').status, 'pass');
});

test('R-PA-HCSC-010 does not infer an NDC requirement from every J-code', () => {
  const generic = runEngine(bundleOf('Blue Cross Blue Shield of Illinois member.\nPhysician-administered drug J3590.\n'));
  assert.equal(generic.find((x) => x.ruleId === 'R-PA-HCSC-010').status, 'pass');

  const incomplete = runEngine(bundleOf('Blue Cross Blue Shield of Illinois member.\nPhysician-administered drug.\nNDC required.\n'));
  assert.equal(incomplete.find((x) => x.ruleId === 'R-PA-HCSC-010').status, 'info');

  const complete = runEngine(bundleOf('Blue Cross Blue Shield of Illinois member.\nPhysician-administered drug.\nNDC required: 0002-8215-01.\n'));
  assert.equal(complete.find((x) => x.ruleId === 'R-PA-HCSC-010').status, 'pass');
});

test('R-PA-HCSC-011 runs only for an explicit step-therapy requirement', () => {
  const generic = runEngine(bundleOf('Blue Cross Blue Shield of Illinois member.\nSpecialty infusion, procedure J3590.\n'));
  assert.equal(generic.find((x) => x.ruleId === 'R-PA-HCSC-011').status, 'pass');

  const incomplete = runEngine(bundleOf('Blue Cross Blue Shield of Illinois member.\nPrime Therapeutics step therapy applies.\n'));
  assert.equal(incomplete.find((x) => x.ruleId === 'R-PA-HCSC-011').status, 'info');

  const complete = runEngine(bundleOf('Blue Cross Blue Shield of Illinois member.\nStep therapy required.\nPrior therapy tried and failed.\n'));
  assert.equal(complete.find((x) => x.ruleId === 'R-PA-HCSC-011').status, 'pass');
});

test('R-PA-HCSC-012 requires both test identity and indication for explicit molecular testing', () => {
  const generic = runEngine(bundleOf('Blue Cross Blue Shield of Illinois member.\nPathology service CPT 81479.\n'));
  assert.equal(generic.find((x) => x.ruleId === 'R-PA-HCSC-012').status, 'pass');

  const incomplete = runEngine(bundleOf('Blue Cross Blue Shield of Illinois member.\nMolecular testing authorization request.\nTest name: hereditary cancer panel.\n'));
  assert.equal(incomplete.find((x) => x.ruleId === 'R-PA-HCSC-012').status, 'info');

  const complete = runEngine(bundleOf('Blue Cross Blue Shield of Illinois member.\nMolecular testing authorization request.\nTest name: hereditary cancer panel.\nClinical indication: personal history of breast cancer.\n'));
  assert.equal(complete.find((x) => x.ruleId === 'R-PA-HCSC-012').status, 'pass');
});

test('R-PA-HCSC-013 scopes diagnosis review to explicit oncology-drug requests', () => {
  const generic = runEngine(bundleOf('Blue Cross Blue Shield of Illinois member.\nSpecialty infusion, procedure J3590.\n'));
  assert.equal(generic.find((x) => x.ruleId === 'R-PA-HCSC-013').status, 'pass');

  const incomplete = runEngine(bundleOf('Blue Cross Blue Shield of Illinois member.\nMedical oncology drug request.\n'));
  assert.equal(incomplete.find((x) => x.ruleId === 'R-PA-HCSC-013').status, 'info');

  const complete = runEngine(bundleOf('Blue Cross Blue Shield of Illinois member.\nMedical oncology drug request.\nDiagnosis: C50.919.\n'));
  assert.equal(complete.find((x) => x.ruleId === 'R-PA-HCSC-013').status, 'pass');
});

test('R-PA-HCSC-014 keeps retrospective justification informational', () => {
  const incomplete = runEngine(bundleOf('Blue Cross Blue Shield of Illinois member.\nRetrospective authorization request.\n'));
  assert.equal(incomplete.find((x) => x.ruleId === 'R-PA-HCSC-014').status, 'info');

  const complete = runEngine(bundleOf('Blue Cross Blue Shield of Illinois member.\nRetrospective authorization requested because the portal was unavailable.\n'));
  assert.equal(complete.find((x) => x.ruleId === 'R-PA-HCSC-014').status, 'pass');
});

test('R-PA-HCSC-015 runs only for an explicit written-order requirement', () => {
  const generic = runEngine(bundleOf('Blue Cross Blue Shield of Illinois member.\nWheelchair request, procedure E1234.\n'));
  assert.equal(generic.find((x) => x.ruleId === 'R-PA-HCSC-015').status, 'pass');

  const incomplete = runEngine(bundleOf('Blue Cross Blue Shield of Illinois member.\nWritten order required.\n'));
  assert.equal(incomplete.find((x) => x.ruleId === 'R-PA-HCSC-015').status, 'info');

  const complete = runEngine(bundleOf('Blue Cross Blue Shield of Illinois member.\nWritten order required.\nPhysician order. Electronically signed.\n'));
  assert.equal(complete.find((x) => x.ruleId === 'R-PA-HCSC-015').status, 'pass');
});

test('R-PA-HCSC-016 scopes level-of-care rationale to intensive behavioral health', () => {
  const generic = runEngine(bundleOf('Blue Cross Blue Shield of Illinois member.\nMental health counseling request.\n'));
  assert.equal(generic.find((x) => x.ruleId === 'R-PA-HCSC-016').status, 'pass');

  const incomplete = runEngine(bundleOf('Blue Cross Blue Shield of Illinois member.\nResidential substance use treatment request.\n'));
  assert.equal(incomplete.find((x) => x.ruleId === 'R-PA-HCSC-016').status, 'info');

  const complete = runEngine(bundleOf('Blue Cross Blue Shield of Illinois member.\nResidential substance use treatment request.\nRisk assessment: severe withdrawal risk requires 24-hour care.\n'));
  assert.equal(complete.find((x) => x.ruleId === 'R-PA-HCSC-016').status, 'pass');
});

test('R-PA-HCSC-017 runs only for an explicit designated transplant-center requirement', () => {
  const generic = runEngine(bundleOf('Blue Cross Blue Shield of Illinois member.\nKidney transplant authorization request.\n'));
  assert.equal(generic.find((x) => x.ruleId === 'R-PA-HCSC-017').status, 'pass');

  const incomplete = runEngine(bundleOf('Blue Cross Blue Shield of Illinois member.\nBlue Distinction Center required.\n'));
  assert.equal(incomplete.find((x) => x.ruleId === 'R-PA-HCSC-017').status, 'info');

  const complete = runEngine(bundleOf('Blue Cross Blue Shield of Illinois member.\nDesignated transplant center required.\nTransplant center: Northwestern Memorial Hospital.\n'));
  assert.equal(complete.find((x) => x.ruleId === 'R-PA-HCSC-017').status, 'pass');
});

test('R-PA-HCSC-018 checks only an explicit HCSC investigational classification', () => {
  const generic = runEngine(bundleOf('Blue Cross Blue Shield of Illinois member.\nOff-label treatment in a clinical trial.\n'));
  assert.equal(generic.find((x) => x.ruleId === 'R-PA-HCSC-018').status, 'pass');

  const incomplete = runEngine(bundleOf('Blue Cross Blue Shield of Illinois member.\nBCBSIL determined investigational.\n'));
  assert.equal(incomplete.find((x) => x.ruleId === 'R-PA-HCSC-018').status, 'info');

  const complete = runEngine(bundleOf('Blue Cross Blue Shield of Illinois member.\nBCBSIL determined investigational under Medical Policy MED205.001.\n'));
  assert.equal(complete.find((x) => x.ruleId === 'R-PA-HCSC-018').status, 'pass');
});

test('R-PA-HCSC-019 scopes the original-case check to a clinical authorization appeal', () => {
  const generic = runEngine(bundleOf('Blue Cross Blue Shield of Illinois member.\nClaim payment appeal.\n'));
  assert.equal(generic.find((x) => x.ruleId === 'R-PA-HCSC-019').status, 'pass');

  const incomplete = runEngine(bundleOf('Blue Cross Blue Shield of Illinois member.\nPrior authorization appeal.\n'));
  assert.equal(incomplete.find((x) => x.ruleId === 'R-PA-HCSC-019').status, 'info');

  const complete = runEngine(bundleOf('Blue Cross Blue Shield of Illinois member.\nClinical appeal.\nOriginal determination case number: IL-12345.\n'));
  assert.equal(complete.find((x) => x.ruleId === 'R-PA-HCSC-019').status, 'pass');
});

test('R-PA-HCSC-020 distinguishes ordinary out-of-network review from an exception', () => {
  const generic = runEngine(bundleOf('Blue Cross Blue Shield of Illinois member.\nOut-of-network prior authorization request.\n'));
  assert.equal(generic.find((x) => x.ruleId === 'R-PA-HCSC-020').status, 'pass');

  const incomplete = runEngine(bundleOf('Blue Cross Blue Shield of Illinois member.\nNetwork gap exception request.\n'));
  assert.equal(incomplete.find((x) => x.ruleId === 'R-PA-HCSC-020').status, 'info');

  const complete = runEngine(bundleOf('Blue Cross Blue Shield of Illinois member.\nContinuity of care request because the provider is leaving the network during an active course of treatment.\n'));
  assert.equal(complete.find((x) => x.ruleId === 'R-PA-HCSC-020').status, 'pass');
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

test('R-PA-HIGHMARK-001 treats a policy reference as an informational mapping aid', () => {
  const text = 'Highmark Blue Shield PPO member.\n'
    + 'Requested procedure: CPT 72148 (MRI lumbar spine).\n'
    + 'Please authorize.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-HIGHMARK-001');
  assert.equal(f.status, 'info');

  const complete = runEngine(bundleOf('Highmark member.\n'
    + 'Requested procedure: CPT 72148.\n'
    + 'Medical necessity per the applicable Highmark Medical Policy (MCG).\n'));
  assert.equal(complete.find((x) => x.ruleId === 'R-PA-HIGHMARK-001').status, 'pass');
});

test('R-PA-HIGHMARK-002 keeps request-specific clinical attachments informational', () => {
  const text = 'Highmark Blue Shield PPO member.\nRequested procedure: CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-HIGHMARK-002');
  assert.equal(f.status, 'info');

  const complete = runEngine(bundleOf('Highmark member.\nRequested procedure: CPT 27447.\nClinical note: persistent knee pain despite therapy.\n'));
  assert.equal(complete.find((x) => x.ruleId === 'R-PA-HIGHMARK-002').status, 'pass');
});

test('R-PA-HIGHMARK-003 does not require the packet to name its submission channel', () => {
  const findings = runEngine(bundleOf('Highmark member.\nProcedure CPT 27447.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-HIGHMARK-003').status, 'pass');
});

test('R-PA-HIGHMARK-004 remains a non-enforcing member-specific lookup reminder', () => {
  const findings = runEngine(bundleOf('Highmark member.\nProcedure CPT 27447.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-HIGHMARK-004').status, 'pass');
});

test('R-PA-HIGHMARK-005 asks for a reference only after completed submission', () => {
  const initial = runEngine(bundleOf('Highmark member.\nPrior authorization required for CPT 27447.\n'));
  assert.equal(initial.find((x) => x.ruleId === 'R-PA-HIGHMARK-005').status, 'pass');

  const submitted = runEngine(bundleOf('Highmark member.\nPrior authorization submitted.\n'));
  assert.equal(submitted.find((x) => x.ruleId === 'R-PA-HIGHMARK-005').status, 'info');

  const confirmed = runEngine(bundleOf('Highmark member.\nPrior authorization submitted.\nReference number: HM-12345.\n'));
  assert.equal(confirmed.find((x) => x.ruleId === 'R-PA-HIGHMARK-005').status, 'pass');
});

test('R-PA-HIGHMARK-006 separates initial admission from concurrent review', () => {
  const initial = runEngine(bundleOf('Highmark member.\nPlace of service: 21\nInitial inpatient admission request.\n'));
  assert.equal(initial.find((x) => x.ruleId === 'R-PA-HIGHMARK-006').status, 'pass');

  const incomplete = runEngine(bundleOf('Highmark member.\nConcurrent review request for additional inpatient days.\n'));
  assert.equal(incomplete.find((x) => x.ruleId === 'R-PA-HIGHMARK-006').status, 'flag');

  const complete = runEngine(bundleOf('Highmark member.\nConcurrent review request.\nClinical update: improving on continuing treatment.\nDischarge plan: home tomorrow.\n'));
  assert.equal(complete.find((x) => x.ruleId === 'R-PA-HIGHMARK-006').status, 'pass');
});

test('R-PA-HIGHMARK-007 limits imaging review to explicit outpatient non-emergent studies', () => {
  const genericRadiology = runEngine(bundleOf('Highmark member.\nRequested CPT 77080.\n'));
  assert.equal(genericRadiology.find((x) => x.ruleId === 'R-PA-HIGHMARK-007').status, 'pass');

  const emergency = runEngine(bundleOf('Highmark member.\nEmergency imaging: CT scan, place of service 23.\n'));
  assert.equal(emergency.find((x) => x.ruleId === 'R-PA-HIGHMARK-007').status, 'pass');

  const incomplete = runEngine(bundleOf('Highmark member.\nOutpatient MRI lumbar spine requested.\n'));
  assert.equal(incomplete.find((x) => x.ruleId === 'R-PA-HIGHMARK-007').status, 'info');

  const complete = runEngine(bundleOf('Highmark member.\nOutpatient MRI lumbar spine requested.\nClinical indication: persistent radiculopathy.\n'));
  assert.equal(complete.find((x) => x.ruleId === 'R-PA-HIGHMARK-007').status, 'pass');
});

test('R-PA-HIGHMARK-008 keeps expedited-review rationale informational', () => {
  const incomplete = runEngine(bundleOf('Highmark member.\nExpedited review requested.\n'));
  assert.equal(incomplete.find((x) => x.ruleId === 'R-PA-HIGHMARK-008').status, 'info');

  const complete = runEngine(bundleOf('Highmark member.\nExpedited review requested: delay would jeopardize the member\'s life or health.\n'));
  assert.equal(complete.find((x) => x.ruleId === 'R-PA-HIGHMARK-008').status, 'pass');
});

test('R-PA-HIGHMARK-009 runs only for explicit outpatient-surgery site-of-care review', () => {
  const generic = runEngine(bundleOf('Highmark member.\nHospital outpatient knee surgery, CPT 27447, POS 22.\n'));
  assert.equal(generic.find((x) => x.ruleId === 'R-PA-HIGHMARK-009').status, 'pass');

  const incomplete = runEngine(bundleOf('Highmark member.\nMedical Policy Z-109 site-of-care clinical review.\nHospital outpatient surgery, POS 22.\n'));
  assert.equal(incomplete.find((x) => x.ruleId === 'R-PA-HIGHMARK-009').status, 'flag');

  const complete = runEngine(bundleOf('Highmark member.\nOutpatient surgery site-of-care review.\nHospital outpatient surgery because patient complexity requires hospital monitoring.\n'));
  assert.equal(complete.find((x) => x.ruleId === 'R-PA-HIGHMARK-009').status, 'pass');
});

test('R-PA-HIGHMARK-010 requires an NDC only when request-specific instructions do', () => {
  const generic = runEngine(bundleOf('Highmark member.\nPhysician-administered drug J0123 requested.\n'));
  assert.equal(generic.find((x) => x.ruleId === 'R-PA-HIGHMARK-010').status, 'pass');

  const incomplete = runEngine(bundleOf('Highmark member.\nJ0123 requested; NDC required.\n'));
  assert.equal(incomplete.find((x) => x.ruleId === 'R-PA-HIGHMARK-010').status, 'info');

  const complete = runEngine(bundleOf('Highmark member.\nJ0123 requested; NDC required.\nNDC: 00002-7597-01.\n'));
  assert.equal(complete.find((x) => x.ruleId === 'R-PA-HIGHMARK-010').status, 'pass');
});

test('R-PA-HIGHMARK-011 runs only for explicit step therapy', () => {
  const generic = runEngine(bundleOf('Highmark member.\nSpecialty drug J3590 requested.\n'));
  assert.equal(generic.find((x) => x.ruleId === 'R-PA-HIGHMARK-011').status, 'pass');

  const incomplete = runEngine(bundleOf('Highmark member.\nStep therapy applies to the requested drug.\n'));
  assert.equal(incomplete.find((x) => x.ruleId === 'R-PA-HIGHMARK-011').status, 'info');

  const complete = runEngine(bundleOf('Highmark member.\nStep therapy required.\nPreferred drug tried and failed after an inadequate response.\n'));
  assert.equal(complete.find((x) => x.ruleId === 'R-PA-HIGHMARK-011').status, 'pass');
});

test('R-PA-HIGHMARK-012 independently checks the genetic test and indication', () => {
  const generic = runEngine(bundleOf('Highmark member.\nLaboratory procedure CPT 81234 requested.\n'));
  assert.equal(generic.find((x) => x.ruleId === 'R-PA-HIGHMARK-012').status, 'pass');

  const incomplete = runEngine(bundleOf('Highmark member.\nGenetic testing request.\nTest name: hereditary cancer panel.\n'));
  assert.equal(incomplete.find((x) => x.ruleId === 'R-PA-HIGHMARK-012').status, 'info');

  const complete = runEngine(bundleOf('Highmark member.\nGenetic testing request.\nTest name: hereditary cancer panel.\nClinical indication: personal history of breast cancer.\n'));
  assert.equal(complete.find((x) => x.ruleId === 'R-PA-HIGHMARK-012').status, 'pass');
});

test('R-PA-HIGHMARK-013 limits diagnosis review to explicit oncology authorization', () => {
  const generic = runEngine(bundleOf('Highmark member.\nSpecialty drug infusion J3590 requested.\n'));
  assert.equal(generic.find((x) => x.ruleId === 'R-PA-HIGHMARK-013').status, 'pass');

  const incomplete = runEngine(bundleOf('Highmark member.\nMedical oncology review requested.\n'));
  assert.equal(incomplete.find((x) => x.ruleId === 'R-PA-HIGHMARK-013').status, 'info');

  const complete = runEngine(bundleOf('Highmark member.\nOncology authorization requested.\nCancer type: non-small cell lung cancer.\n'));
  assert.equal(complete.find((x) => x.ruleId === 'R-PA-HIGHMARK-013').status, 'pass');
});

test('R-PA-HIGHMARK-014 keeps retrospective justification informational', () => {
  const incomplete = runEngine(bundleOf('Highmark member.\nRetrospective authorization request.\n'));
  assert.equal(incomplete.find((x) => x.ruleId === 'R-PA-HIGHMARK-014').status, 'info');

  const complete = runEngine(bundleOf('Highmark member.\nRetrospective authorization request because emergency care prevented prior submission.\n'));
  assert.equal(complete.find((x) => x.ruleId === 'R-PA-HIGHMARK-014').status, 'pass');
});

test('R-PA-HIGHMARK-015 checks Highmark home-health OASIS and CMS-485 requirements', () => {
  const dme = runEngine(bundleOf('Highmark member.\nDurable medical equipment E1234 requested.\n'));
  assert.equal(dme.find((x) => x.ruleId === 'R-PA-HIGHMARK-015').status, 'pass');

  const incomplete = runEngine(bundleOf('Highmark member.\nHome health authorization request.\nOASIS file attached.\n'));
  assert.equal(incomplete.find((x) => x.ruleId === 'R-PA-HIGHMARK-015').status, 'flag');

  const complete = runEngine(bundleOf('Highmark member.\nHome health authorization request.\nOASIS file attached.\nCMS-485 form attached.\n'));
  assert.equal(complete.find((x) => x.ruleId === 'R-PA-HIGHMARK-015').status, 'pass');
});

test('R-PA-HIGHMARK-016 checks explicit intensive behavioral-health authorization details', () => {
  const generic = runEngine(bundleOf('Highmark member.\nOutpatient mental health counseling requested.\n'));
  assert.equal(generic.find((x) => x.ruleId === 'R-PA-HIGHMARK-016').status, 'pass');

  const incomplete = runEngine(bundleOf('Highmark member.\nBehavioral health authorization request.\n'));
  assert.equal(incomplete.find((x) => x.ruleId === 'R-PA-HIGHMARK-016').status, 'flag');

  const complete = runEngine(bundleOf('Highmark member.\nBehavioral health authorization request.\nLevel of care: psychiatric inpatient.\nPresenting problem: acute suicidal ideation.\n'));
  assert.equal(complete.find((x) => x.ruleId === 'R-PA-HIGHMARK-016').status, 'pass');
});

test('R-PA-HIGHMARK-017 runs only when designated transplant-center routing is explicit', () => {
  const generic = runEngine(bundleOf('Highmark member.\nRequested service: kidney transplant.\n'));
  assert.equal(generic.find((x) => x.ruleId === 'R-PA-HIGHMARK-017').status, 'pass');

  const incomplete = runEngine(bundleOf('Highmark member.\nKidney transplant; Blue Distinction Center required.\n'));
  assert.equal(incomplete.find((x) => x.ruleId === 'R-PA-HIGHMARK-017').status, 'info');

  const complete = runEngine(bundleOf('Highmark member.\nKidney transplant; Blue Distinction Center required.\nTransplant center: Allegheny General Hospital.\n'));
  assert.equal(complete.find((x) => x.ruleId === 'R-PA-HIGHMARK-017').status, 'pass');
});

test('R-PA-HIGHMARK-018 does not infer an experimental determination', () => {
  const generic = runEngine(bundleOf('Highmark member.\nOff-label treatment requested for a clinical trial.\n'));
  assert.equal(generic.find((x) => x.ruleId === 'R-PA-HIGHMARK-018').status, 'pass');

  const incomplete = runEngine(bundleOf('Highmark member.\nThe service was denied as investigational.\n'));
  assert.equal(incomplete.find((x) => x.ruleId === 'R-PA-HIGHMARK-018').status, 'info');

  const complete = runEngine(bundleOf('Highmark member.\nThe service was denied as investigational under Medical Policy Z-1.\n'));
  assert.equal(complete.find((x) => x.ruleId === 'R-PA-HIGHMARK-018').status, 'pass');
});

test('R-PA-HIGHMARK-019 limits original-determination review to clinical authorization appeals', () => {
  const generic = runEngine(bundleOf('Highmark member.\nClaim grievance submitted.\n'));
  assert.equal(generic.find((x) => x.ruleId === 'R-PA-HIGHMARK-019').status, 'pass');

  const incomplete = runEngine(bundleOf('Highmark member.\nMedical necessity appeal requested.\n'));
  assert.equal(incomplete.find((x) => x.ruleId === 'R-PA-HIGHMARK-019').status, 'info');

  const complete = runEngine(bundleOf('Highmark member.\nMedical necessity appeal requested.\nOriginal determination: AUTH-1234.\n'));
  assert.equal(complete.find((x) => x.ruleId === 'R-PA-HIGHMARK-019').status, 'pass');
});

test('R-PA-HIGHMARK-020 distinguishes an out-of-network request from a gap exception', () => {
  const generic = runEngine(bundleOf('Highmark member.\nOut-of-network prior authorization request.\nProcedure CPT 70551.\n'));
  assert.equal(generic.find((x) => x.ruleId === 'R-PA-HIGHMARK-020').status, 'pass');

  const incomplete = runEngine(bundleOf('Highmark member.\nOut-of-network gap exception request.\n'));
  assert.equal(incomplete.find((x) => x.ruleId === 'R-PA-HIGHMARK-020').status, 'info');

  const complete = runEngine(bundleOf('Highmark member.\nOut-of-network gap exception request.\nNetwork lacks the required transplant service.\n'));
  assert.equal(complete.find((x) => x.ruleId === 'R-PA-HIGHMARK-020').status, 'pass');
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

test('R-PA-FLBLUE-001 treats a policy reference as an informational mapping aid', () => {
  const text = 'Florida Blue PPO member.\n'
    + 'Requested procedure: CPT 72148 (MRI lumbar spine).\n'
    + 'Please authorize.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-FLBLUE-001');
  assert.equal(f.status, 'info');

  const complete = runEngine(bundleOf('Florida Blue member.\n'
    + 'Requested procedure: CPT 72148.\n'
    + 'Medical necessity per the applicable Florida Blue Medical Coverage Guideline.\n'));
  assert.equal(complete.find((x) => x.ruleId === 'R-PA-FLBLUE-001').status, 'pass');
});

test('R-PA-FLBLUE-002 keeps request-specific clinical attachments informational', () => {
  const text = 'Florida Blue PPO member.\nRequested procedure: CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-FLBLUE-002');
  assert.equal(f.status, 'info');

  const complete = runEngine(bundleOf('Florida Blue member.\nRequested procedure: CPT 27447.\nClinical note: persistent knee pain despite therapy.\n'));
  assert.equal(complete.find((x) => x.ruleId === 'R-PA-FLBLUE-002').status, 'pass');
});

test('R-PA-FLBLUE-003 does not require the packet to name its submission channel', () => {
  const findings = runEngine(bundleOf('Florida Blue member.\nProcedure CPT 27447.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-FLBLUE-003').status, 'pass');
});

test('R-PA-FLBLUE-004 remains a non-enforcing member-specific lookup reminder', () => {
  const findings = runEngine(bundleOf('Florida Blue member.\nProcedure CPT 27447.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-FLBLUE-004').status, 'pass');
});

test('R-PA-FLBLUE-005 asks for a reference only after completed submission', () => {
  const initial = runEngine(bundleOf('Florida Blue member.\nPrior authorization required for CPT 27447.\n'));
  assert.equal(initial.find((x) => x.ruleId === 'R-PA-FLBLUE-005').status, 'pass');

  const submitted = runEngine(bundleOf('Florida Blue member.\nPrior authorization submitted.\n'));
  assert.equal(submitted.find((x) => x.ruleId === 'R-PA-FLBLUE-005').status, 'info');

  const confirmed = runEngine(bundleOf('Florida Blue member.\nPrior authorization submitted.\nAuthorization number: FB-12345.\n'));
  assert.equal(confirmed.find((x) => x.ruleId === 'R-PA-FLBLUE-005').status, 'pass');
});

test('R-PA-FLBLUE-006 separates initial inpatient admission from explicit continued-stay review', () => {
  const initial = runEngine(bundleOf('Florida Blue member.\nPlace of service: 21\nInitial inpatient admission request.\n'));
  assert.equal(initial.find((x) => x.ruleId === 'R-PA-FLBLUE-006').status, 'pass');

  const incomplete = runEngine(bundleOf('Florida Blue member.\nContinued stay request for 2 additional inpatient days.\n'));
  assert.equal(incomplete.find((x) => x.ruleId === 'R-PA-FLBLUE-006').status, 'info');

  const complete = runEngine(bundleOf('Florida Blue member.\nContinued stay request.\nClinical update: improving with treatment.\nExpected discharge date: 2026-09-18.\n'));
  assert.equal(complete.find((x) => x.ruleId === 'R-PA-FLBLUE-006').status, 'pass');
});

test('R-PA-FLBLUE-007 is informational only for explicit outpatient advanced imaging and excludes inpatient imaging', () => {
  const unknownSetting = runEngine(bundleOf('Florida Blue member.\nRequested: MRI lumbar spine, CPT 72148.\n'));
  assert.equal(unknownSetting.find((x) => x.ruleId === 'R-PA-FLBLUE-007').status, 'pass');

  const outpatient = runEngine(bundleOf('Florida Blue member.\nOutpatient imaging at place of service: 22.\nRequested: MRI lumbar spine, CPT 72148.\n'));
  assert.equal(outpatient.find((x) => x.ruleId === 'R-PA-FLBLUE-007').status, 'info');

  const inpatient = runEngine(bundleOf('Florida Blue member.\nInpatient imaging at place of service: 21.\nRequested: MRI lumbar spine, CPT 72148.\n'));
  assert.equal(inpatient.find((x) => x.ruleId === 'R-PA-FLBLUE-007').status, 'pass');

  const complete = runEngine(bundleOf('Florida Blue member.\nOffice setting, place of service: 11.\nRequested: MRI lumbar spine, CPT 72148.\nClinical indication: persistent radiculopathy.\n'));
  assert.equal(complete.find((x) => x.ruleId === 'R-PA-FLBLUE-007').status, 'pass');
});

test('R-PA-FLBLUE-008 is limited to an expedited pre-service appeal or concurrent-care extension', () => {
  const initialAuth = runEngine(bundleOf('Florida Blue member.\nUrgent prior authorization requested.\n'));
  assert.equal(initialAuth.find((x) => x.ruleId === 'R-PA-FLBLUE-008').status, 'pass');

  const incompleteAppeal = runEngine(bundleOf('Florida Blue member.\nExpedited appeal requested.\n'));
  assert.equal(incompleteAppeal.find((x) => x.ruleId === 'R-PA-FLBLUE-008').status, 'info');

  const completeAppeal = runEngine(bundleOf('Florida Blue member.\nExpedited appeal requested because delay would jeopardize the member\'s life or health.\n'));
  assert.equal(completeAppeal.find((x) => x.ruleId === 'R-PA-FLBLUE-008').status, 'pass');
});

test('R-PA-FLBLUE-009 requires a hospital exception only when designated-procedure site review is explicit', () => {
  const genericSurgery = runEngine(bundleOf('Florida Blue member.\nCPT 29881 at outpatient hospital, place of service: 22.\n'));
  assert.equal(genericSurgery.find((x) => x.ruleId === 'R-PA-FLBLUE-009').status, 'pass');

  const incomplete = runEngine(bundleOf('Florida Blue member.\nFlorida Blue site-of-care review applies.\nCPT 29881 at outpatient hospital, place of service: 22.\n'));
  assert.equal(incomplete.find((x) => x.ruleId === 'R-PA-FLBLUE-009').status, 'flag');

  const complete = runEngine(bundleOf('Florida Blue member.\nFlorida Blue site-of-care review applies.\nCPT 29881 at outpatient hospital.\nNo geographically accessible ASC has the necessary equipment.\n'));
  assert.equal(complete.find((x) => x.ruleId === 'R-PA-FLBLUE-009').status, 'pass');
});

test('R-PA-FLBLUE-010 requires an NDC value only when request-specific instructions require it', () => {
  const genericJcode = runEngine(bundleOf('Florida Blue member.\nPhysician-administered drug CPT J3590.\n'));
  assert.equal(genericJcode.find((x) => x.ruleId === 'R-PA-FLBLUE-010').status, 'pass');

  const incomplete = runEngine(bundleOf('Florida Blue member.\nCPT J3590.\nNDC required for this request.\n'));
  assert.equal(incomplete.find((x) => x.ruleId === 'R-PA-FLBLUE-010').status, 'info');

  const complete = runEngine(bundleOf('Florida Blue member.\nCPT J3590.\nNDC required: 12345-6789-01.\n'));
  assert.equal(complete.find((x) => x.ruleId === 'R-PA-FLBLUE-010').status, 'pass');
});

test('R-PA-FLBLUE-011 applies only to an explicit Responsible Steps or step-therapy requirement', () => {
  const genericDrug = runEngine(bundleOf('Florida Blue member.\nSpecialty drug requested, CPT J3590.\n'));
  assert.equal(genericDrug.find((x) => x.ruleId === 'R-PA-FLBLUE-011').status, 'pass');

  const incomplete = runEngine(bundleOf('Florida Blue member.\nResponsible Steps applies to the requested drug.\n'));
  assert.equal(incomplete.find((x) => x.ruleId === 'R-PA-FLBLUE-011').status, 'info');

  const complete = runEngine(bundleOf('Florida Blue member.\nResponsible Steps applies.\nPrerequisite drug tried and failed because of intolerance.\n'));
  assert.equal(complete.find((x) => x.ruleId === 'R-PA-FLBLUE-011').status, 'pass');
});

test('R-PA-FLBLUE-012 does not infer genetic-review requirements from a genetic CPT alone', () => {
  const genericGenetic = runEngine(bundleOf('Florida Blue member.\nGenetic test requested, CPT 81479.\n'));
  assert.equal(genericGenetic.find((x) => x.ruleId === 'R-PA-FLBLUE-012').status, 'pass');

  const incomplete = runEngine(bundleOf('Florida Blue member.\nFlorida Blue genetic review required.\n'));
  assert.equal(incomplete.find((x) => x.ruleId === 'R-PA-FLBLUE-012').status, 'info');

  const complete = runEngine(bundleOf('Florida Blue member.\nFlorida Blue genetic review required.\nTest requested: BRCA gene panel.\nClinical indication: personal history of breast cancer.\n'));
  assert.equal(complete.find((x) => x.ruleId === 'R-PA-FLBLUE-012').status, 'pass');
});

test('R-PA-FLBLUE-013 is limited to the explicit Medicare Advantage oncology or hematology program', () => {
  const genericDrug = runEngine(bundleOf('Florida Blue member.\nSpecialty drug requested, CPT J3590.\n'));
  assert.equal(genericDrug.find((x) => x.ruleId === 'R-PA-FLBLUE-013').status, 'pass');

  const incomplete = runEngine(bundleOf('Florida Blue member.\nNew Century Health oncology authorization request.\n'));
  assert.equal(incomplete.find((x) => x.ruleId === 'R-PA-FLBLUE-013').status, 'flag');

  const complete = runEngine(bundleOf('Florida Blue member.\nNew Century Health oncology authorization request.\nOncology diagnosis: ICD-10 C50.919.\n'));
  assert.equal(complete.find((x) => x.ruleId === 'R-PA-FLBLUE-013').status, 'pass');
});

test('R-PA-FLBLUE-014 treats retrospective reason as informational and does not invent exception categories', () => {
  const incomplete = runEngine(bundleOf('Florida Blue member.\nRetrospective authorization request.\n'));
  assert.equal(incomplete.find((x) => x.ruleId === 'R-PA-FLBLUE-014').status, 'info');

  const complete = runEngine(bundleOf('Florida Blue member.\nRetrospective authorization request because the service was emergent.\n'));
  assert.equal(complete.find((x) => x.ruleId === 'R-PA-FLBLUE-014').status, 'pass');
});

test('R-PA-FLBLUE-015 checks a signed order only when request-specific instructions require it', () => {
  const genericDme = runEngine(bundleOf('Florida Blue member.\nWheelchair requested, HCPCS E1161.\n'));
  assert.equal(genericDme.find((x) => x.ruleId === 'R-PA-FLBLUE-015').status, 'pass');

  const incomplete = runEngine(bundleOf('Florida Blue member.\nSigned order required for this request.\n'));
  assert.equal(incomplete.find((x) => x.ruleId === 'R-PA-FLBLUE-015').status, 'info');

  const complete = runEngine(bundleOf('Florida Blue member.\nSigned order required.\nPhysician order: wheelchair.\nElectronically signed by ordering provider.\n'));
  assert.equal(complete.find((x) => x.ruleId === 'R-PA-FLBLUE-015').status, 'pass');
});

test('R-PA-FLBLUE-016 applies only to explicit intensive behavioral-health authorization', () => {
  const routine = runEngine(bundleOf('Florida Blue member.\nOutpatient mental health therapy requested.\n'));
  assert.equal(routine.find((x) => x.ruleId === 'R-PA-FLBLUE-016').status, 'pass');

  const incomplete = runEngine(bundleOf('Florida Blue member.\nResidential treatment authorization requested.\n'));
  assert.equal(incomplete.find((x) => x.ruleId === 'R-PA-FLBLUE-016').status, 'info');

  const complete = runEngine(bundleOf('Florida Blue member.\nResidential treatment authorization requested.\nClinical assessment: current symptoms cause severe functional impairment.\n'));
  assert.equal(complete.find((x) => x.ruleId === 'R-PA-FLBLUE-016').status, 'pass');
});

test('R-PA-FLBLUE-017 requires a transplant-center evaluation only after an explicit designated-center requirement', () => {
  const genericTransplant = runEngine(bundleOf('Florida Blue member.\nKidney transplant authorization requested.\n'));
  assert.equal(genericTransplant.find((x) => x.ruleId === 'R-PA-FLBLUE-017').status, 'pass');

  const incomplete = runEngine(bundleOf('Florida Blue member.\nDesignated transplant center required by member instructions.\n'));
  assert.equal(incomplete.find((x) => x.ruleId === 'R-PA-FLBLUE-017').status, 'info');

  const complete = runEngine(bundleOf('Florida Blue member.\nDesignated transplant center required.\nTransplant center evaluation: member accepted for kidney transplant.\n'));
  assert.equal(complete.find((x) => x.ruleId === 'R-PA-FLBLUE-017').status, 'pass');
});

test('R-PA-FLBLUE-018 requires a policy basis only for an explicit investigational determination', () => {
  const offLabel = runEngine(bundleOf('Florida Blue member.\nOff-label drug use in a clinical trial.\n'));
  assert.equal(offLabel.find((x) => x.ruleId === 'R-PA-FLBLUE-018').status, 'pass');

  const incomplete = runEngine(bundleOf('Florida Blue member.\nService determined investigational.\n'));
  assert.equal(incomplete.find((x) => x.ruleId === 'R-PA-FLBLUE-018').status, 'info');

  const complete = runEngine(bundleOf('Florida Blue member.\nService determined investigational under Medical Coverage Guideline 02-40000-18.\n'));
  assert.equal(complete.find((x) => x.ruleId === 'R-PA-FLBLUE-018').status, 'pass');
});

test('R-PA-FLBLUE-019 is limited to an explicit clinical prior-authorization appeal', () => {
  const claimDispute = runEngine(bundleOf('Florida Blue member.\nClaim payment grievance.\n'));
  assert.equal(claimDispute.find((x) => x.ruleId === 'R-PA-FLBLUE-019').status, 'pass');

  const incomplete = runEngine(bundleOf('Florida Blue member.\nPrior authorization appeal.\n'));
  assert.equal(incomplete.find((x) => x.ruleId === 'R-PA-FLBLUE-019').status, 'info');

  const complete = runEngine(bundleOf('Florida Blue member.\nPrior authorization appeal.\nOriginal determination: case number FB-1001, denied 2026-09-10.\n'));
  assert.equal(complete.find((x) => x.ruleId === 'R-PA-FLBLUE-019').status, 'pass');
});

test('R-PA-FLBLUE-020 does not infer a network-gap exception from ordinary out-of-network context', () => {
  const genericOon = runEngine(bundleOf('Florida Blue member.\nOut-of-network prior authorization request.\n'));
  assert.equal(genericOon.find((x) => x.ruleId === 'R-PA-FLBLUE-020').status, 'pass');

  const incomplete = runEngine(bundleOf('Florida Blue member.\nNetwork gap request.\n'));
  assert.equal(incomplete.find((x) => x.ruleId === 'R-PA-FLBLUE-020').status, 'info');

  const complete = runEngine(bundleOf('Florida Blue member.\nNetwork gap request because the required specialty is unavailable in network.\n'));
  assert.equal(complete.find((x) => x.ruleId === 'R-PA-FLBLUE-020').status, 'pass');
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

test('R-PA-BCBSM-001 gives an informational finding when a BCBSM procedure has no criterion reference', () => {
  const text = 'Blue Cross Blue Shield of Michigan member.\n'
    + 'Requested procedure: CPT 72148 (MRI lumbar spine).\n'
    + 'Please authorize.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BCBSM-001');
  assert.equal(f.status, 'info');
});

test('R-PA-BCBSM-001 passes when the BCBSM packet cites the applicable Medical Policy', () => {
  const text = 'Blue Cross Blue Shield of Michigan member.\n'
    + 'Requested procedure: CPT 72148.\n'
    + 'Medical necessity per the applicable BCBSM Medical Policy (MCG).\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BCBSM-001');
  assert.equal(f.status, 'pass');
});

test('R-PA-BCBSM-002 gives an informational finding when a BCBSM packet has no clinical document attached', () => {
  const text = 'Blue Cross Blue Shield of Michigan member.\nRequested procedure: CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BCBSM-002');
  assert.equal(f.status, 'info');
});

test('R-PA-BCBSM-003 does not require the packet to name its submission channel', () => {
  const text = 'Blue Cross Blue Shield of Michigan member.\nProcedure CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BCBSM-003');
  assert.equal(f.status, 'pass');
});

test('R-PA-BCBSM-004 remains non-enforcing without member-specific requirements', () => {
  const text = 'Blue Cross Blue Shield of Michigan member.\nProcedure CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BCBSM-004');
  assert.equal(f.status, 'pass');
});

test('R-PA-BCBSM-005 does not require a confirmation number on an initial request', () => {
  const text = 'Blue Cross Blue Shield of Michigan member.\nPrior authorization required for CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BCBSM-005');
  assert.equal(f.status, 'pass');
});

test('R-PA-BCBSM-005 advises retaining a reference after submission', () => {
  const text = 'Blue Cross Blue Shield of Michigan member.\nPrior authorization submitted for CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BCBSM-005');
  assert.equal(f.status, 'info');
});

test('R-PA-BCBSM-005 passes a submitted request with a reference', () => {
  const text = 'Blue Cross Blue Shield of Michigan member.\nPrior authorization submitted for CPT 27447.\nAuthorization number: MI-12345.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BCBSM-005');
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
  assert.match(podRule.citation, /§4\.7\.3\.1/);
  assert.doesNotMatch(podRule.citation, /§4\.26/);
});

// ---- wave 52-2b sanity checks ----

test('R-PA-CMS-003 blocks on a Medicare FFS DME SWO that is missing required elements', () => {
  // SWO anchor present but no beneficiary, order date, or signature.
  const text = 'Medicare Part B beneficiary on file.\n'
    + 'Durable medical equipment: standard wheelchair.\n'
    + 'Standard Written Order on file.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-CMS-003');
  assert.equal(f.status, 'block');
});

test('R-PA-CMS-003 accepts the current SWO alternatives without quantity or NPI', () => {
  const text = 'Medicare Part B beneficiary on file.\n'
    + 'Member ID: 1EG4TE5MK73\n'
    + 'Durable medical equipment: standard wheelchair.\n'
    + 'Standard Written Order dated 2026-09-10.\n'
    + 'Signature: Treating Practitioner\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-CMS-003');
  assert.equal(f.status, 'pass');
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

test('R-PA-CMS-018 flags a Medicare FFS CGM request without insulin or hypoglycemia anchors', () => {
  const text = HAPPY_TEXT
    + '\nMedicare Part B beneficiary on file.\n'
    + 'Continuous glucose monitor (Dexcom) ordered for diabetic patient.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-CMS-018');
  assert.equal(f.status, 'flag');
});

test('R-PA-CMS-018 accepts insulin treatment without the retired finger-stick prerequisite', () => {
  const text = HAPPY_TEXT
    + '\nMedicare Part B beneficiary on file.\n'
    + 'Continuous glucose monitor (Dexcom) ordered for diabetic patient on insulin.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-CMS-018');
  assert.equal(f.status, 'pass');
  assert.match(f.evidence, /Insulin-treatment/);
});

test('R-PA-CMS-018 accepts documented problematic hypoglycemia without insulin', () => {
  const text = HAPPY_TEXT
    + '\nMedicare Part B beneficiary on file.\n'
    + 'Continuous glucose monitor ordered after recurrent level 2 hypoglycemia.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-CMS-018');
  assert.equal(f.status, 'pass');
  assert.match(f.evidence, /Problematic-hypoglycemia/);
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

test('R-PA-MA-012 cites the current 2026 standard and expedited deadlines', () => {
  const rule = STARTER_RULES.find((candidate) => candidate.id === 'R-PA-MA-012');
  assert.match(rule.citation, /7-calendar-day deadline/);
  assert.match(rule.citation, /within 72 hours/);
  assert.doesNotMatch(rule.citation, /14-day timeframe/);
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

test('R-PA-MCD-002 flags pediatric Medicaid treatment without an individualized EPSDT rationale', () => {
  const text = HAPPY_TEXT
    + '\nState Medicaid pediatric patient.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-MCD-002');
  assert.equal(f.status, 'flag');
  assert.match(f.note, /case-by-case EPSDT/i);
});

test('R-PA-MCD-002 passes pediatric treatment with a correct-or-ameliorate rationale', () => {
  const text = HAPPY_TEXT
    + '\nState Medicaid pediatric patient.\n'
    + 'This treatment is medically necessary to correct or ameliorate the child\'s condition.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-MCD-002');
  assert.equal(f.status, 'pass');
  assert.match(f.evidence, /individualized EPSDT treatment rationale/i);
});

test('R-PA-MCD-002 flags an EPSDT screening service routed through prior authorization', () => {
  const text = HAPPY_TEXT
    + '\nState Medicaid pediatric patient.\n'
    + 'EPSDT screening: well-child visit under the periodicity schedule.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-MCD-002');
  assert.equal(f.status, 'flag');
  assert.match(f.note, /may not impose prior authorization/i);
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

test('R-PA-MCD-006 requires an NDC value, not a bare label', () => {
  const text = HAPPY_TEXT
    + '\nState Medicaid recipient on file.\n'
    + 'J-code billing: J1745 infliximab infusion. NDC:\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-MCD-006');
  assert.equal(f.status, 'flag');
  assert.match(f.note, /no valid current FDA 10-digit or HIPAA 11-digit NDC/i);
});

test('R-PA-MCD-006 states the federal PAD NDC scope and identifies its broader heuristic', () => {
  const rule = STARTER_RULES.find((r) => r.id === 'R-PA-MCD-006');
  assert.match(rule.citation, /single-source/i);
  assert.match(rule.citation, /certain high-dollar-volume multiple-source/i);
  assert.match(rule.citation, /conservatively flags any Medicaid J-code/i);
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

test('R-PA-RAD-002 does not impose conservative management on a brain MRI', () => {
  const text = HAPPY_TEXT + '\nProcedure: 70551 MRI brain without contrast.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-RAD-002');
  assert.equal(f.status, 'pass');
  assert.match(f.evidence, /no spine or extremity MRI/i);
});

test('R-PA-RAD-003 flags a contrast imaging request without contrast-allergy + renal-function anchors', () => {
  const text = HAPPY_TEXT + '\nProcedure: 70553 MRI brain with contrast. IV contrast required.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-RAD-003');
  assert.equal(f.status, 'flag');
});

test('R-PA-RAD-003 accepts negative renal-risk screening without routine creatinine', () => {
  const text = HAPPY_TEXT
    + '\nProcedure: 70553 MRI brain with contrast. IV contrast required.\n'
    + 'No prior contrast reaction. No history of kidney disease.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-RAD-003');
  assert.equal(f.status, 'pass');
  assert.match(f.evidence, /negative renal-risk screening/i);
});

test('R-PA-RAD-003 requires renal function when kidney-disease risk is documented', () => {
  const text = HAPPY_TEXT
    + '\nProcedure: 70553 MRI brain with contrast. IV contrast required.\n'
    + 'No prior contrast reaction. History of chronic kidney disease.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-RAD-003');
  assert.equal(f.status, 'flag');
  assert.match(f.note, /renal-risk anchor present/i);
});

test('R-PA-RAD-005 fires (info) on a pediatric CT request without an ALARA anchor', () => {
  const text = HAPPY_TEXT + '\nProcedure: 70450 CT head without contrast.\nPediatric patient, adolescent.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-RAD-005');
  assert.equal(f.status, 'info');
});

test('R-PA-RAD-005 does not treat pediatric MRI as ionizing radiation', () => {
  for (const [code, label] of [['70551', 'brain'], ['70542', 'neck'], ['77048', 'breast']]) {
    const text = HAPPY_TEXT + `\nProcedure: ${code} MRI ${label}.\nPediatric patient, adolescent.\n`;
    const findings = runEngine(bundleOf(text));
    const f = findings.find((x) => x.ruleId === 'R-PA-RAD-005');
    assert.equal(f.status, 'pass', code);
    assert.match(f.evidence, /no ionizing-radiation CPT/i, code);
  }
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

test('R-PA-INF-001 rejects a bare or malformed NDC and accepts every current segment shape', () => {
  for (const invalid of ['NDC:', 'NDC: 1234-567-89']) {
    const findings = runEngine(bundleOf(HAPPY_TEXT + `\nJ-code J1745. ${invalid}\n`));
    assert.equal(findings.find((x) => x.ruleId === 'R-PA-INF-001').status, 'flag', invalid);
  }
  for (const valid of ['0002-7597-01', '12345-678-90', '12345-6789-0', '12345-6789-01', '12345067890']) {
    const findings = runEngine(bundleOf(HAPPY_TEXT + `\nJ-code J1745. NDC: ${valid}\n`));
    assert.equal(findings.find((x) => x.ruleId === 'R-PA-INF-001').status, 'pass', valid);
  }
});

test('R-PA-INF-001 discloses its cross-payer NDC heuristic', () => {
  const rule = STARTER_RULES.find((r) => r.id === 'R-PA-INF-001');
  assert.match(rule.citation, /NDC listing does not establish FDA approval or payer coverage/i);
  assert.match(rule.citation, /conservative heuristic/i);
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
  const text = base
    + '\nMedicare Fee-for-Service. Applicable policy: LCD L40232.\n'
    + 'Procedure: 27447 total knee arthroplasty.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-SURG-001');
  assert.equal(f.status, 'flag');
});

test('R-PA-SURG-001 and 002 do not generalize arthroplasty criteria to unrelated surgery', () => {
  const text = HAPPY_TEXT + '\nProcedure: 47562 laparoscopic cholecystectomy.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-SURG-001').status, 'pass');
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-SURG-002').status, 'pass');
});

test('R-PA-SURG-001 and 002 do not infer one local CMS policy across payers or jurisdictions', () => {
  const text = HAPPY_TEXT + '\nProcedure: 27447 total knee arthroplasty.\n';
  const findings = runEngine(bundleOf(text));
  for (const id of ['R-PA-SURG-001', 'R-PA-SURG-002']) {
    const finding = findings.find((x) => x.ruleId === id);
    assert.equal(finding.status, 'pass');
    assert.match(finding.evidence, /not inferred across payers or jurisdictions/i);
  }
});

test('R-PA-SURG-001 accepts a documented exception when conservative therapy is inappropriate', () => {
  const text = HAPPY_TEXT
    + '\nMedicare Fee-for-Service. Applicable policy: LCD L40232.\n'
    + 'Procedure: 27447 total knee arthroplasty.\n'
    + 'Conservative therapy not appropriate; exception rationale documented.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-SURG-001').status, 'pass');
});

test('R-PA-SURG-002 flags an elective surgery request without imaging support', () => {
  // bundleOf wraps text in a single TXT document; no imaging-report doc role.
  const text = HAPPY_TEXT
    + '\nMedicare Fee-for-Service. Applicable policy: LCD L40232.\n'
    + 'Procedure: 27447 total knee arthroplasty.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-SURG-002');
  assert.equal(f.status, 'flag');
});

test('R-PA-SURG-003 emits a workflow reminder for planned anesthesia with ASA >= 3 and no assessment', () => {
  const text = HAPPY_TEXT
    + '\nProcedure: 27447 total knee arthroplasty.\n'
    + 'General anesthesia planned.\n'
    + 'ASA Physical Status 3 -- patient has severe systemic disease.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-SURG-003');
  assert.equal(f.status, 'info');
  assert.match(f.note, /workflow reminder, not a payer-approval defect/i);
});

test('R-PA-SURG-003 does not infer anesthesia care from a surgery CPT alone', () => {
  const text = HAPPY_TEXT
    + '\nProcedure: 27447 total knee arthroplasty.\n'
    + 'ASA Physical Status 3 -- patient has severe systemic disease.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-SURG-003').status, 'pass');
});

test('R-PA-SURG-004 does not require ASA status in every prospective surgery PA', () => {
  const text = HAPPY_TEXT + '\nProcedure: 27447 total knee arthroplasty.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-SURG-004');
  assert.equal(f.status, 'pass');
  assert.match(f.evidence, /not treated as a universal PA prerequisite/i);
});

test('R-PA-SURG-004 validates a supplied ASA field', () => {
  const invalid = runEngine(bundleOf(HAPPY_TEXT + '\nProcedure: 27447. ASA class pending.\n'));
  assert.equal(invalid.find((x) => x.ruleId === 'R-PA-SURG-004').status, 'info');

  const valid = runEngine(bundleOf(HAPPY_TEXT + '\nProcedure: 27447. ASA class IV.\n'));
  assert.equal(valid.find((x) => x.ruleId === 'R-PA-SURG-004').status, 'pass');

  const donorEmergency = runEngine(bundleOf(HAPPY_TEXT + '\nProcedure: 01990. ASA VI E.\n'));
  assert.equal(donorEmergency.find((x) => x.ruleId === 'R-PA-SURG-004').status, 'pass');
});

test('R-PA-SURG-005 flags a completed hospital surgery record without informed consent', () => {
  const text = HAPPY_TEXT.replace('Place of service: 11', 'Place of service: 22')
    + '\nProcedure: 27447 total knee arthroplasty. Operative report: surgery performed.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-SURG-005');
  assert.equal(f.status, 'flag');
});

test('R-PA-SURG-005 does not require completed consent in a prospective PA packet', () => {
  const text = HAPPY_TEXT.replace('Place of service: 11', 'Place of service: 22')
    + '\nProcedure: 27447 total knee arthroplasty requested.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-SURG-005').status, 'pass');
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

test('R-PA-BH-001 accepts an F-code without inventing a literal DSM citation requirement', () => {
  const text = HAPPY_TEXT + '\nDx: F32.9 major depressive disorder\nProcedure: 90834 individual psychotherapy.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BH-001').status, 'pass');
});

test('R-PA-BH-002 applies its treatment-plan reminder only to reauthorization', () => {
  const initial = HAPPY_TEXT + '\nDx: F32.9 major depressive disorder\nProcedure: 90834 individual psychotherapy.\n';
  assert.equal(runEngine(bundleOf(initial)).find((x) => x.ruleId === 'R-PA-BH-002').status, 'pass');

  const reauthorization = initial + 'Requesting reauthorization for continued treatment.\n';
  assert.equal(runEngine(bundleOf(reauthorization)).find((x) => x.ruleId === 'R-PA-BH-002').status, 'info');

  const planned = reauthorization + 'Current treatment plan: measurable goal documented.\n';
  assert.equal(runEngine(bundleOf(planned)).find((x) => x.ruleId === 'R-PA-BH-002').status, 'pass');
});

test('R-PA-BH-003 does not apply ASAM addiction criteria to a non-SUD step-up request', () => {
  const text = HAPPY_TEXT
    + '\nDx: F32.9 major depressive disorder\nProcedure: 90834 individual psychotherapy.\n'
    + 'Requesting step-up to higher level of care.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BH-003').status, 'pass');
});

test('R-PA-BH-003 reminds on a SUD step-up until level and reassessment rationale are present', () => {
  const base = HAPPY_TEXT
    + '\nDx: F10.20 alcohol use disorder\nProcedure: 90834 individual psychotherapy.\n'
    + 'Requesting step-up to residential treatment.\n';
  assert.equal(runEngine(bundleOf(base)).find((x) => x.ruleId === 'R-PA-BH-003').status, 'info');

  const supported = base + 'Current level of care: intensive outpatient. ASAM reassessment and clinical rationale documented.\n';
  assert.equal(runEngine(bundleOf(supported)).find((x) => x.ruleId === 'R-PA-BH-003').status, 'pass');
});

test('R-PA-BH-004 does not infer primary behavioral-health care from a code alone', () => {
  const text = HAPPY_TEXT + '\nDx: F32.9 major depressive disorder\nProcedure: 90834 individual psychotherapy.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BH-004').status, 'pass');
});

test('R-PA-BH-004 requires a validated suicide-screening anchor only for primary BH care', () => {
  const base = HAPPY_TEXT
    + '\nDx: F32.9 major depressive disorder\nProcedure: 90834 individual psychotherapy.\n'
    + 'Behavioral health is the primary reason for care.\n';
  assert.equal(runEngine(bundleOf(base)).find((x) => x.ruleId === 'R-PA-BH-004').status, 'info');

  const screened = base + 'C-SSRS completed.\n';
  assert.equal(runEngine(bundleOf(screened)).find((x) => x.ruleId === 'R-PA-BH-004').status, 'pass');
});

test('R-PA-BH-005 does not require the eliminated X-waiver for buprenorphine', () => {
  const text = HAPPY_TEXT
    + '\nDx: F11.20 opioid use disorder\nProcedure: 90834 individual psychotherapy.\n'
    + 'Buprenorphine treatment requested.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BH-005');
  assert.equal(f.status, 'pass');
  assert.match(f.evidence, /X-waiver is no longer required/i);
});

test('R-PA-BH-005 requires an OTP anchor only for methadone requested for OUD', () => {
  const base = HAPPY_TEXT
    + '\nDx: F11.20 opioid use disorder\nProcedure: 90834 individual psychotherapy.\n';
  const missing = runEngine(bundleOf(base + 'Methadone treatment requested.\n'));
  assert.equal(missing.find((x) => x.ruleId === 'R-PA-BH-005').status, 'info');

  const present = runEngine(bundleOf(base + 'Methadone through certified OTP provider.\n'));
  assert.equal(present.find((x) => x.ruleId === 'R-PA-BH-005').status, 'pass');
});

test('R-PA-BH-005 does not apply the methadone OTP rule to naltrexone', () => {
  const text = HAPPY_TEXT
    + '\nDx: F11.20 opioid use disorder\nProcedure: 90834 individual psychotherapy.\n'
    + 'Naltrexone treatment requested.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BH-005').status, 'pass');
});

test('R-PA-BH-005 does not infer OUD treatment from methadone alone', () => {
  const text = HAPPY_TEXT
    + '\nDx: G89.29 chronic pain\nProcedure: 90834 individual psychotherapy.\n'
    + 'Methadone listed in current medications.\n';
  const findings = runEngine(bundleOf(text));
  const finding = findings.find((x) => x.ruleId === 'R-PA-BH-005');
  assert.equal(finding.status, 'pass');
  assert.match(finding.evidence, /not paired with an F11 OUD diagnosis/i);
});

// ---- wave 52-5e sanity checks: genetic-testing specialty overlay (closes §4.5.5 + §4.5) ----

test('R-PA-GEN-001..005 all vacuously pass on a packet without a genetic-testing CPT', () => {
  const findings = runEngine(happyBundle());
  for (const id of ['R-PA-GEN-001', 'R-PA-GEN-002', 'R-PA-GEN-003', 'R-PA-GEN-004', 'R-PA-GEN-005']) {
    const f = findings.find((x) => x.ruleId === id);
    assert.equal(f.status, 'pass', id + ' should vacuously pass when no 81xxx CPT is in the packet.');
  }
});

test('genetic specialty trigger uses the documented CPT endpoints, not every 81xxx code', () => {
  const text = HAPPY_TEXT + '\nProcedure: 81513 laboratory procedure.\n';
  const findings = runEngine(bundleOf(text));
  for (const id of ['R-PA-GEN-001', 'R-PA-GEN-002', 'R-PA-GEN-003', 'R-PA-GEN-004', 'R-PA-GEN-005']) {
    assert.equal(findings.find((x) => x.ruleId === id).status, 'pass');
  }
});

test('hereditary-cancer rules do not apply to an unclassified molecular test', () => {
  const text = HAPPY_TEXT + '\nProcedure: 81479 unlisted molecular pathology procedure.\n';
  const findings = runEngine(bundleOf(text));
  for (const id of ['R-PA-GEN-001', 'R-PA-GEN-002', 'R-PA-GEN-003']) {
    assert.equal(findings.find((x) => x.ruleId === id).status, 'pass');
  }
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-GEN-004').status, 'info');
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-GEN-005').status, 'pass');
});

test('a BRCA gene name alone does not turn a somatic tumor assay into hereditary testing', () => {
  const text = HAPPY_TEXT
    + '\nProcedure: 81479 somatic BRCA1 tumor testing. Clinical indication for molecular testing: therapy selection.\n';
  const findings = runEngine(bundleOf(text));
  for (const id of ['R-PA-GEN-001', 'R-PA-GEN-002', 'R-PA-GEN-003']) {
    assert.equal(findings.find((x) => x.ruleId === id).status, 'pass');
  }
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-GEN-004').status, 'pass');
});

test('R-PA-GEN-001 accepts personal cancer history as an alternative to family history', () => {
  const text = HAPPY_TEXT + '\nDx: C50.919 breast cancer. Procedure: 81479 germline BRCA1 testing for hereditary cancer.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-GEN-001').status, 'pass');
});

test('R-PA-GEN-001 and 002 report only informational reminders in hereditary-cancer context', () => {
  const text = HAPPY_TEXT + '\nProcedure: 81479 germline BRCA1 testing for hereditary cancer.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-GEN-001').status, 'info');
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-GEN-002').status, 'info');

  const supported = text + 'Family history: mother had breast cancer. Pre-test genetic counseling completed.\n';
  const supportedFindings = runEngine(bundleOf(supported));
  assert.equal(supportedFindings.find((x) => x.ruleId === 'R-PA-GEN-001').status, 'pass');
  assert.equal(supportedFindings.find((x) => x.ruleId === 'R-PA-GEN-002').status, 'pass');
});

test('R-PA-GEN-003 applies selection rationale only to an explicit hereditary-cancer panel', () => {
  const singleGene = HAPPY_TEXT + '\nProcedure: 81479 germline BRCA1 testing for hereditary cancer.\n';
  assert.equal(runEngine(bundleOf(singleGene)).find((x) => x.ruleId === 'R-PA-GEN-003').status, 'pass');

  const panel = singleGene + 'Hereditary cancer multigene panel requested.\n';
  assert.equal(runEngine(bundleOf(panel)).find((x) => x.ruleId === 'R-PA-GEN-003').status, 'info');

  const selected = panel + 'Panel selected because personal and family history span several cancer syndromes.\n';
  assert.equal(runEngine(bundleOf(selected)).find((x) => x.ruleId === 'R-PA-GEN-003').status, 'pass');
});

test('R-PA-GEN-004 requires an explicit molecular-test purpose, not an unrelated diagnosis', () => {
  const base = HAPPY_TEXT + '\nProcedure: 81479 unlisted molecular pathology procedure.\n';
  assert.equal(runEngine(bundleOf(base)).find((x) => x.ruleId === 'R-PA-GEN-004').status, 'info');

  const purposeful = base + 'Clinical indication for molecular testing: tumor profiling for therapy selection.\n';
  assert.equal(runEngine(bundleOf(purposeful)).find((x) => x.ruleId === 'R-PA-GEN-004').status, 'pass');
});

test('R-PA-GEN-005 flags only an overstatement of GINA insurance protection', () => {
  const base = HAPPY_TEXT + '\nProcedure: 81479 germline BRCA1 testing for hereditary cancer.\n';
  assert.equal(runEngine(bundleOf(base)).find((x) => x.ruleId === 'R-PA-GEN-005').status, 'pass');

  const overstated = base + 'GINA protects all insurance, including life insurance.\n';
  assert.equal(runEngine(bundleOf(overstated)).find((x) => x.ruleId === 'R-PA-GEN-005').status, 'info');

  const accurate = base + 'GINA protects health insurance and employment but does not cover life insurance.\n';
  assert.equal(runEngine(bundleOf(accurate)).find((x) => x.ruleId === 'R-PA-GEN-005').status, 'pass');
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

test('R-PA-CMS-002 accepts a signed SWO without a separately dated signature', () => {
  const text = 'Medicare Part B beneficiary on file.\n'
    + 'Durable medical equipment: standard wheelchair.\n'
    + 'Standard Written Order dated 2026-09-10.\n'
    + 'Signature: Treating Practitioner\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-CMS-002');
  assert.equal(f.status, 'pass');
});

test('R-PA-CMS-002 does not borrow a signature from a separate clinical note', () => {
  const bundle = bundleOf([
    'Medicare Part B beneficiary on file.\nDurable medical equipment: standard wheelchair.\nStandard Written Order dated 2026-09-10.\n',
    'Clinical note\nSignature: Treating Practitioner, 2026-09-10.\n',
  ]);
  const findings = runEngine(bundle);
  const f = findings.find((x) => x.ruleId === 'R-PA-CMS-002');
  assert.equal(f.status, 'block');
});

test('R-PA-CMS-004 does not demand proof of delivery for a prospective DME request', () => {
  const text = 'Medicare Part B beneficiary on file.\n'
    + 'Durable medical equipment: standard wheelchair.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-CMS-004');
  assert.equal(f.status, 'pass');
  assert.match(f.evidence, /not yet expected/i);
});

test('R-PA-CMS-004 flags delivered DME without proof-of-delivery documentation', () => {
  const text = 'Medicare Part B beneficiary on file.\n'
    + 'Durable medical equipment: standard wheelchair.\n'
    + 'Equipment delivered to the beneficiary.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-CMS-004');
  assert.equal(f.status, 'flag');
});

test('R-PA-CMS-006 flags a Medicare FFS PAP request without a sleep-study anchor', () => {
  const text = HAPPY_TEXT
    + '\nMedicare Part B beneficiary on file.\n'
    + 'Order: CPAP device.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-CMS-006');
  assert.equal(f.status, 'flag');
});

test('R-PA-CMS-009 reports missing supplier enrollment as information, not a PTAN claim defect', () => {
  const text = HAPPY_TEXT
    + '\nMedicare Part B beneficiary on file.\n'
    + 'Durable medical equipment: standard wheelchair.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-CMS-009');
  assert.equal(f.status, 'info');
  assert.doesNotMatch(f.citation, /required on DME claims/i);
});

test('R-PA-CMS-009 accepts an active PECOS enrollment anchor', () => {
  const text = HAPPY_TEXT
    + '\nMedicare Part B beneficiary on file.\n'
    + 'Durable medical equipment: standard wheelchair.\n'
    + 'DMEPOS enrollment active in PECOS.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-CMS-009');
  assert.equal(f.status, 'pass');
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

test('R-PA-019 flags a separate servicing entity when only one Luhn-valid NPI is present', () => {
  const findings = runEngine(bundleOf(HAPPY_TEXT + 'Servicing facility: Regional Hospital.\n'));
  const f = findings.find((x) => x.ruleId === 'R-PA-019');
  assert.equal(f.status, 'flag');
});

test('R-PA-019 does not assume a second NPI for a single-provider office packet', () => {
  const findings = runEngine(bundleOf(HAPPY_TEXT));
  const f = findings.find((x) => x.ruleId === 'R-PA-019');
  assert.equal(f.status, 'pass');
  assert.match(f.evidence, /second NPI is not assumed/i);
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

test('R-PA-016 describes syntax validation without claiming an ordering-provider role', () => {
  const rule = STARTER_RULES.find((r) => r.id === 'R-PA-016');
  assert.match(rule.description, /provider NPI/i);
  assert.doesNotMatch(rule.description, /ordering/i);
  assert.match(rule.citation, /9 numeric identifier digits/i);
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
