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
  // spec-v1357: bundleOf takes TEXT BLOCKS -- a string, or an array of strings.
  // Five call sites had passed a document object, `bundleOf({ documents: [...] })`,
  // which String()s to "[object Object]": payer detection returned "unknown", every
  // role became "other", and the payer rule under test passed vacuously. Five tests
  // asserted nothing and stayed green for waves. Throwing is the cheap fix -- a
  // misuse now fails loudly at the call site instead of turning into a false pass.
  const blocks = Array.isArray(textBlocks) ? textBlocks : [textBlocks];
  for (const t of blocks) {
    if (typeof t !== 'string') {
      throw new TypeError('bundleOf takes text blocks (a string or an array of strings), not ' + Object.prototype.toString.call(t)
        + '. To build a multi-document packet, pass one string per document.');
    }
  }
  const docs = blocks.map((t, i) => ({
    name: 'doc-' + (i + 1) + '.txt',
    sha256: 'sha-' + (i + 1),
    kind: 'TXT',
    text: t,
  }));
  return buildBundle(docs, opts || { totalBytes: 4096 });
}

test('bundleOf refuses a document object passed where text blocks belong', () => {
  // The exact misuse that made five payer tests vacuous: the object stringified
  // to "[object Object]", so no payer was detected and the rule never ran.
  assert.throws(
    () => bundleOf({ documents: [{ name: 'a.txt', text: 'Arkansas Blue Cross and Blue Shield member.' }] }),
    /bundleOf takes text blocks/,
  );
  assert.throws(() => bundleOf(['fine', { name: 'a.txt' }]), /bundleOf takes text blocks/);
});

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

test('R-PA-BCBSM-006 does not infer a clinical attachment requirement from inpatient status alone', () => {
  const text = 'Blue Cross Blue Shield of Michigan member.\nPlace of service: 21\nInpatient admission for acute care.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BCBSM-006');
  assert.equal(f.status, 'pass');
});

test('R-PA-BCBSM-006 advises on an explicit pended clinical review without an attachment', () => {
  const text = 'Blue Cross Blue Shield of Michigan member.\nInpatient authorization pended for clinical review.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSM-006').status, 'info');
});

test('R-PA-BCBSM-007 does not infer outpatient radiology from an MRI alone', () => {
  const text = 'Blue Cross Blue Shield of Michigan member.\nRequested: MRI lumbar spine, CPT 72148.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BCBSM-007');
  assert.equal(f.status, 'pass');
});

test('R-PA-BCBSM-007 advises when an outpatient MRI lacks clinical rationale', () => {
  const text = 'Blue Cross Blue Shield of Michigan member.\nOutpatient imaging requested: MRI lumbar spine, CPT 72148.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSM-007').status, 'info');
});

test('R-PA-BCBSM-008 passes when an expedited BCBSM request documents the clinical urgency', () => {
  const text = 'Blue Cross Blue Shield of Michigan member.\nExpedited review requested: delay would jeopardize the member\'s life or health.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BCBSM-008');
  assert.equal(f.status, 'pass');
});

test('R-PA-BCBSM-008 does not treat generic STAT wording as an expedited authorization', () => {
  const text = 'Blue Cross Blue Shield of Michigan member.\nSTAT lab requested.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSM-008').status, 'pass');
});

test('R-PA-BCBSM-009 does not apply site-of-care review to generic outpatient surgery', () => {
  const text = 'Blue Cross Blue Shield of Michigan member.\nOutpatient hospital surgery, CPT 27447, POS 22.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSM-009').status, 'pass');
});

test('R-PA-BCBSM-009 advises on an explicit inpatient TurningPoint exception without rationale', () => {
  const text = 'Blue Cross Blue Shield of Michigan member.\nTurningPoint site-of-care review applies.\nInpatient surgery, POS 21.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSM-009').status, 'info');
});

test('R-PA-BCBSM-010 does not infer an NDC requirement from a J-code', () => {
  const text = 'Blue Cross Blue Shield of Michigan member.\nMedical drug requested: J1745.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSM-010').status, 'pass');
});

test('R-PA-BCBSM-010 advises when an explicit authorization NDC requirement is unmet', () => {
  const text = 'Blue Cross Blue Shield of Michigan member.\nInclude NDC in authorization request.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSM-010').status, 'info');
});

test('R-PA-BCBSM-011 advises on an explicit step-therapy requirement without a criterion response', () => {
  const text = 'Blue Cross Blue Shield of Michigan member.\nSpecialty drug requested; BCBSM pharmacy step therapy applies.\nProcedure J3590.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BCBSM-011');
  assert.equal(f.status, 'info');
});

test('R-PA-BCBSM-011 does not infer step therapy from a specialty drug or J-code', () => {
  const findings = runEngine(bundleOf('Blue Cross Blue Shield of Michigan member.\nSpecialty drug requested, J3590.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSM-011').status, 'pass');
});

test('R-PA-BCBSM-012 does not infer the BCN JVHL workflow from genetic testing alone', () => {
  const findings = runEngine(bundleOf('Blue Cross Blue Shield of Michigan member.\nGenetic testing requested, CPT 81455.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSM-012').status, 'pass');
});

test('R-PA-BCBSM-012 advises when an explicit BCN JVHL request lacks test details', () => {
  const findings = runEngine(bundleOf('Blue Cross Blue Shield of Michigan member.\nJVHL genetic authorization applies.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSM-012').status, 'info');
});

test('R-PA-BCBSM-013 does not infer a diagnosis criterion from an oncology J-code', () => {
  const findings = runEngine(bundleOf('Blue Cross Blue Shield of Michigan member.\nOncology infusion requested, J9190.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSM-013').status, 'pass');
});

test('R-PA-BCBSM-014 keeps a generic retroactive request non-enforcing', () => {
  const findings = runEngine(bundleOf('Blue Cross Blue Shield of Michigan member.\nRetroactive authorization request.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSM-014').status, 'pass');
});

test('R-PA-BCBSM-015 does not impose one signed-order rule on every DME request', () => {
  const findings = runEngine(bundleOf('Blue Cross Blue Shield of Michigan member.\nDurable medical equipment requested: wheelchair.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSM-015').status, 'pass');
});

test('R-PA-BCBSM-017 does not infer HOTP applicability from a transplant alone', () => {
  const text = 'Blue Cross Blue Shield of Michigan member.\nRequested service: kidney transplant.\nMedical necessity per Medical Policy.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BCBSM-017');
  assert.equal(f.status, 'pass');
});

test('R-PA-BCBSM-020 does not infer a network exception from an out-of-network request', () => {
  const text = 'Blue Cross Blue Shield of Michigan member.\nOut-of-network prior authorization request.\nProcedure CPT 70551.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BCBSM-020');
  assert.equal(f.status, 'pass');
});

test('R-PA-BCBSM-016 does not apply intensive criteria to generic behavioral health', () => {
  const findings = runEngine(bundleOf('Blue Cross Blue Shield of Michigan member.\nBehavioral health office visit.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSM-016').status, 'pass');
});

test('R-PA-BCBSM-016 advises when an explicit intensive request lacks clinical support', () => {
  const findings = runEngine(bundleOf('Blue Cross Blue Shield of Michigan member.\nPartial hospitalization authorization requested.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSM-016').status, 'info');
});

test('R-PA-BCBSM-017 advises when explicit HOTP applicability lacks facility and evaluation', () => {
  const findings = runEngine(bundleOf('Blue Cross Blue Shield of Michigan member.\nHuman Organ Transplant Program applies.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSM-017').status, 'info');
});

test('R-PA-BCBSM-018 does not infer investigational status from clinical-trial participation', () => {
  const findings = runEngine(bundleOf('Blue Cross Blue Shield of Michigan member.\nPatient participates in a clinical trial.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSM-018').status, 'pass');
});

test('R-PA-BCBSM-019 does not apply a PA-appeal check to a generic grievance', () => {
  const findings = runEngine(bundleOf('Blue Cross Blue Shield of Michigan member.\nMember grievance submitted.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSM-019').status, 'pass');
});

test('R-PA-BCBSM-020 advises when an explicit network-gap exception lacks its basis', () => {
  const findings = runEngine(bundleOf('Blue Cross Blue Shield of Michigan member.\nNetwork gap exception request.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSM-020').status, 'info');
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

test('R-PA-BSCA-001 gives an informational finding when a procedure has no criterion reference', () => {
  const text = 'Blue Shield of California member.\n'
    + 'Requested procedure: CPT 72148 (MRI lumbar spine).\n'
    + 'Please authorize.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BSCA-001');
  assert.equal(f.status, 'info');
});

test('R-PA-BSCA-001 passes when the Blue Shield of California packet cites the applicable Medical Policy', () => {
  const text = 'Blue Shield of California member.\n'
    + 'Requested procedure: CPT 72148.\n'
    + 'Medical necessity per the applicable Blue Shield of California Medical Policy (MCG).\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BSCA-001');
  assert.equal(f.status, 'pass');
});

test('R-PA-BSCA-002 gives an informational finding when no clinical document is attached', () => {
  const text = 'Blue Shield of California member.\nRequested procedure: CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BSCA-002');
  assert.equal(f.status, 'info');
});

test('R-PA-BSCA-003 does not require the packet to name its submission channel', () => {
  const text = 'Blue Shield of California member.\nProcedure CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BSCA-003');
  assert.equal(f.status, 'pass');
});

test('R-PA-BSCA-004 remains non-enforcing without member-specific requirements', () => {
  const findings = runEngine(bundleOf('Blue Shield of California member.\nProcedure CPT 27447.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BSCA-004').status, 'pass');
});

test('R-PA-BSCA-005 does not require a confirmation number on an initial request', () => {
  const findings = runEngine(bundleOf('Blue Shield of California member.\nPrior authorization required for CPT 27447.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BSCA-005').status, 'pass');
});

test('R-PA-BSCA-005 advises retaining a reference after submission', () => {
  const findings = runEngine(bundleOf('Blue Shield of California member.\nPrior authorization submitted for CPT 27447.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BSCA-005').status, 'info');
});

test('R-PA-BSCA-005 passes a submitted request with an inquiry reference', () => {
  const findings = runEngine(bundleOf('Blue Shield of California member.\nPrior authorization submitted for CPT 27447.\nReference number: CA-12345.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BSCA-005').status, 'pass');
});

test('R-PA-BSCA-006 does not infer continued-stay documentation from inpatient status alone', () => {
  const text = 'Blue Shield of California member.\nPlace of service: 21\nInpatient admission for acute care.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BSCA-006');
  assert.equal(f.status, 'pass');
});

test('R-PA-BSCA-006 advises when an explicit continued-stay request lacks updates', () => {
  const findings = runEngine(bundleOf('Blue Shield of California member.\nContinued stay request for additional inpatient days.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BSCA-006').status, 'info');
});

test('R-PA-BSCA-007 does not infer outpatient imaging from an MRI alone', () => {
  const text = 'Blue Shield of California member.\nRequested: MRI lumbar spine, CPT 72148.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BSCA-007');
  assert.equal(f.status, 'pass');
});

test('R-PA-BSCA-007 advises when outpatient MRI lacks clinical rationale', () => {
  const findings = runEngine(bundleOf('Blue Shield of California member.\nOutpatient imaging requested: MRI lumbar spine, CPT 72148.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BSCA-007').status, 'info');
});

test('R-PA-BSCA-008 passes when an expedited Blue Shield of California request documents the clinical urgency', () => {
  const text = 'Blue Shield of California member.\nExpedited review requested: delay would jeopardize the member\'s life or health.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BSCA-008');
  assert.equal(f.status, 'pass');
});

test('R-PA-BSCA-008 does not treat generic STAT wording as an expedited authorization', () => {
  const findings = runEngine(bundleOf('Blue Shield of California member.\nSTAT lab requested.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BSCA-008').status, 'pass');
});

test('R-PA-BSCA-009 does not infer site-of-care review from generic outpatient surgery', () => {
  const findings = runEngine(bundleOf('Blue Shield of California member.\nOutpatient hospital surgery, CPT 27447, POS 22.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BSCA-009').status, 'pass');
});

test('R-PA-BSCA-009 advises when an explicit site-of-care review lacks rationale', () => {
  const findings = runEngine(bundleOf('Blue Shield of California member.\nBlue Shield site-of-care review applies.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BSCA-009').status, 'info');
});

test('R-PA-BSCA-010 does not infer an NDC requirement from a J-code', () => {
  const findings = runEngine(bundleOf('Blue Shield of California member.\nMedical drug requested: J1745.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BSCA-010').status, 'pass');
});

test('R-PA-BSCA-010 advises when an explicit authorization NDC requirement is unmet', () => {
  const findings = runEngine(bundleOf('Blue Shield of California member.\nInclude NDC in authorization request.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BSCA-010').status, 'info');
});

test('R-PA-BSCA-011 advises on an explicit step-therapy requirement without a criterion response', () => {
  const text = 'Blue Shield of California member.\nSpecialty drug requested; Blue Shield of California pharmacy step therapy applies.\nProcedure J3590.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BSCA-011');
  assert.equal(f.status, 'info');
});

test('R-PA-BSCA-011 does not infer step therapy from a specialty drug or J-code', () => {
  const findings = runEngine(bundleOf('Blue Shield of California member.\nSpecialty drug requested, J3590.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BSCA-011').status, 'pass');
});

test('R-PA-BSCA-012 does not infer authorization from genetic testing alone', () => {
  const findings = runEngine(bundleOf('Blue Shield of California member.\nGenetic testing requested, CPT 81455.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BSCA-012').status, 'pass');
});

test('R-PA-BSCA-012 advises when an explicit genetic authorization lacks test details', () => {
  const findings = runEngine(bundleOf('Blue Shield of California member.\nGenetic testing authorization applies.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BSCA-012').status, 'info');
});

test('R-PA-BSCA-013 does not infer an oncology diagnosis criterion from a J-code', () => {
  const findings = runEngine(bundleOf('Blue Shield of California member.\nOncology infusion requested, J9190.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BSCA-013').status, 'pass');
});

test('R-PA-BSCA-014 keeps a generic retroactive request non-enforcing', () => {
  const findings = runEngine(bundleOf('Blue Shield of California member.\nRetroactive authorization request.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BSCA-014').status, 'pass');
});

test('R-PA-BSCA-015 does not impose one signed-order rule on every DME request', () => {
  const findings = runEngine(bundleOf('Blue Shield of California member.\nDurable medical equipment requested: wheelchair.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BSCA-015').status, 'pass');
});

test('R-PA-BSCA-016 does not infer level-of-care review from a behavioral-health service', () => {
  const findings = runEngine(bundleOf('Blue Shield of California member.\nIntensive outpatient behavioral health requested.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BSCA-016').status, 'pass');
});

test('R-PA-BSCA-016 flags an explicit level-of-care review without a criteria response', () => {
  const findings = runEngine(bundleOf('Blue Shield of California member.\nBehavioral health medical necessity review applies.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BSCA-016').status, 'flag');
});

test('R-PA-BSCA-017 does not impose Blue Distinction routing on kidney-only transplant', () => {
  const text = 'Blue Shield of California member.\nRequested service: kidney transplant.\nMedical necessity per Medical Policy.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BSCA-017');
  assert.equal(f.status, 'pass');
});

test('R-PA-BSCA-017 flags a listed major-organ transplant without routing and evaluation', () => {
  const findings = runEngine(bundleOf('Blue Shield of California member.\nRequested service: heart transplant.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BSCA-017').status, 'flag');
});

test('R-PA-BSCA-018 does not require evidence attachments for an investigational determination', () => {
  const findings = runEngine(bundleOf('Blue Shield of California member.\nInvestigational determination under BSC9.01.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BSCA-018').status, 'pass');
});

test('R-PA-BSCA-019 keeps a generic appeal non-enforcing', () => {
  const findings = runEngine(bundleOf('Blue Shield of California member.\nAppeal of authorization denial.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BSCA-019').status, 'pass');
});

test('R-PA-BSCA-020 does not infer continuity of care from an out-of-network request', () => {
  const text = 'Blue Shield of California member.\nOut-of-network prior authorization request.\nProcedure CPT 70551.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BSCA-020');
  assert.equal(f.status, 'pass');
});

test('R-PA-BSCA-020 advises when an explicit continuity-of-care request lacks application details', () => {
  const findings = runEngine(bundleOf('Blue Shield of California member.\nBlue Shield continuity of care request.\n'));
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

test('R-PA-IBX-001 advises when an Independence Blue Cross request does not identify a known policy', () => {
  const text = 'Independence Blue Cross member.\n'
    + 'Requested procedure: CPT 72148 (MRI lumbar spine).\n'
    + 'Please authorize.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-IBX-001');
  assert.equal(f.status, 'info');
});

test('R-PA-IBX-001 passes when the Independence Blue Cross packet cites the applicable Medical Policy', () => {
  const text = 'Independence Blue Cross member.\n'
    + 'Requested procedure: CPT 72148.\n'
    + 'Medical necessity per the applicable Independence Blue Cross Medical Policy (MCG).\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-IBX-001');
  assert.equal(f.status, 'pass');
});

test('R-PA-IBX-002 treats a missing clinical document as informational', () => {
  const text = 'Independence Blue Cross member.\nRequested procedure: CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-IBX-002');
  assert.equal(f.status, 'info');
});

test('R-PA-IBX-003 does not require the submission channel in packet content', () => {
  const text = 'Independence Blue Cross member.\nProcedure CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-IBX-003');
  assert.equal(f.status, 'pass');
});

test('R-PA-IBX-004 remains non-enforcing without a live PEAR or member lookup', () => {
  const findings = runEngine(bundleOf('Independence Blue Cross member.\nProcedure CPT 27447.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-IBX-004').status, 'pass');
});

test('R-PA-IBX-005 does not demand a confirmation for an initial precertification request', () => {
  const findings = runEngine(bundleOf('Independence Blue Cross member.\nPrior authorization required for CPT 27447.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-IBX-005').status, 'pass');
});

test('R-PA-IBX-005 advises when a submitted request has no confirmation reference', () => {
  const findings = runEngine(bundleOf('Independence Blue Cross member.\nPrecertification submitted.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-IBX-005').status, 'info');
});

test('R-PA-IBX-006 does not treat an initial IBX inpatient admission as concurrent review', () => {
  const text = 'Independence Blue Cross member.\nPlace of service: 21\nInpatient admission for acute care.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-IBX-006');
  assert.equal(f.status, 'pass');
});

test('R-PA-IBX-006 flags an IBX concurrent review missing its required updates', () => {
  const findings = runEngine(bundleOf('Independence Blue Cross member.\nConcurrent review requested.\n'));
  const f = findings.find((x) => x.ruleId === 'R-PA-IBX-006');
  assert.equal(f.status, 'flag');
  assert.match(f.note, /current clinical status.*treatment plan.*progress on goals.*discharge-plan update/);
});

test('R-PA-IBX-007 advises on an Independence Blue Cross outpatient MRI with no clinical indication', () => {
  const text = 'Independence Blue Cross member.\nRequested: MRI lumbar spine, CPT 72148.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-IBX-007');
  assert.equal(f.status, 'info');
});

test('R-PA-IBX-007 does not treat every 7xxxx radiology code as Carelon advanced imaging', () => {
  const findings = runEngine(bundleOf('Independence Blue Cross member.\nRequested chest X-ray, CPT 71046.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-IBX-007').status, 'pass');
});

test('R-PA-IBX-007 does not apply the outpatient Carelon workflow to inpatient MRI', () => {
  const findings = runEngine(bundleOf('Independence Blue Cross member.\nInpatient MRI lumbar spine.\nPlace of service: 21\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-IBX-007').status, 'pass');
});

test('R-PA-IBX-008 passes when an expedited Independence Blue Cross request documents the clinical urgency', () => {
  const text = 'Independence Blue Cross member.\nExpedited review requested: delay would jeopardize the member\'s life or health.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-IBX-008');
  assert.equal(f.status, 'pass');
});

test('R-PA-IBX-008 does not infer an expedited Part B drug request from generic STAT wording', () => {
  const findings = runEngine(bundleOf('Independence Blue Cross member.\nSTAT request.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-IBX-008').status, 'pass');
});

test('R-PA-IBX-008 advises when an explicit expedited IBX request lacks a clinical rationale', () => {
  const findings = runEngine(bundleOf('Independence Blue Cross member.\nExpedited review requested.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-IBX-008').status, 'info');
});

test('R-PA-IBX-009 does not apply specialty-drug setting review to hospital-outpatient surgery', () => {
  const findings = runEngine(bundleOf('Independence Blue Cross member.\nCPT 27447.\nPlace of service: 22\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-IBX-009').status, 'pass');
});

test('R-PA-IBX-009 advises when an applicable MCES request omits the treatment setting', () => {
  const findings = runEngine(bundleOf('Independence Blue Cross member.\nMost Cost-Effective Setting Program applies to the requested specialty drug.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-IBX-009').status, 'info');
});

test('R-PA-IBX-010 does not require an NDC from a J-code alone', () => {
  const findings = runEngine(bundleOf('Independence Blue Cross member.\nRequested procedure: J3590.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-IBX-010').status, 'pass');
});

test('R-PA-IBX-010 advises when an IBX medical-benefit drug request omits height and weight', () => {
  const findings = runEngine(bundleOf('Independence Blue Cross member.\nMedical benefit drug requires precertification.\n'));
  const f = findings.find((x) => x.ruleId === 'R-PA-IBX-010');
  assert.equal(f.status, 'info');
  assert.match(f.note, /height and weight/);
});

test('R-PA-IBX-011 gives an informational reminder for an explicit step-therapy requirement without medication history', () => {
  const text = 'Independence Blue Cross member.\nSpecialty drug requested; Independence Blue Cross pharmacy step therapy applies.\nProcedure J3590.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-IBX-011');
  assert.equal(f.status, 'info');
});

test('R-PA-IBX-011 does not infer step therapy from a J-code or specialty-drug request', () => {
  const findings = runEngine(bundleOf('Independence Blue Cross member.\nSpecialty drug request, J3590.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-IBX-011').status, 'pass');
});

test('R-PA-IBX-011 accepts medication history for an explicit step-therapy requirement', () => {
  const findings = runEngine(bundleOf('Independence Blue Cross member.\nStep therapy applies.\nMedication history: step-1 medication used January through March.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-IBX-011').status, 'pass');
});

test('R-PA-IBX-012 does not infer an eviCore requirement from every 81xxx code', () => {
  const findings = runEngine(bundleOf('Independence Blue Cross member.\nRequested CPT 81200.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-IBX-012').status, 'pass');
});

test('R-PA-IBX-012 flags an applicable laboratory workflow with no eviCore authorization on file', () => {
  const findings = runEngine(bundleOf('Independence Blue Cross member.\nTesting laboratory received request.\neviCore genetic precertification applies.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-IBX-012').status, 'flag');
});

test('R-PA-IBX-013 does not require a diagnosis from a generic J-code request', () => {
  const findings = runEngine(bundleOf('Independence Blue Cross member.\nSpecialty drug request, J3590.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-IBX-013').status, 'pass');
});

test('R-PA-IBX-013 requires ICD-10 on an IBX Direct Ship general drug request', () => {
  const findings = runEngine(bundleOf('Independence Blue Cross member.\nDirect Ship General Drug Request.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-IBX-013').status, 'flag');
});

test('R-PA-IBX-014 does not apply inpatient retro-review criteria to a generic post-service request', () => {
  const findings = runEngine(bundleOf('Independence Blue Cross member.\nPost-service review requested for outpatient surgery.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-IBX-014').status, 'pass');
});

test('R-PA-IBX-014 advises when retrospective inpatient review lacks a qualifying circumstance', () => {
  const findings = runEngine(bundleOf('Independence Blue Cross member.\nRetrospective review of inpatient stay requested.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-IBX-014').status, 'info');
});

test('R-PA-IBX-014 accepts coverage discovered after discharge', () => {
  const findings = runEngine(bundleOf('Independence Blue Cross member.\nRetrospective review of inpatient stay.\nEligibility discovered after discharge; patient had been classified under different coverage.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-IBX-014').status, 'pass');
});

test('R-PA-IBX-015 does not impose a universal signed-order requirement on IBX DME', () => {
  const findings = runEngine(bundleOf('Independence Blue Cross member.\nWheelchair request, HCPCS K0001.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-IBX-015').status, 'pass');
});

test('R-PA-IBX-016 does not apply ABA form requirements to generic behavioral-health care', () => {
  const findings = runEngine(bundleOf('Independence Blue Cross member.\nOutpatient mental health therapy requested.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-IBX-016').status, 'pass');
});

test('R-PA-IBX-016 flags a current ABA request without the ABA form and supporting documents', () => {
  const findings = runEngine(bundleOf('Independence Blue Cross member.\nABA prior authorization requested.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-IBX-016').status, 'flag');
});

test('R-PA-IBX-016 accepts the current ABA form with supporting documents', () => {
  const findings = runEngine(bundleOf('Independence Blue Cross member.\nABA prior authorization form.\nSupporting documents: behavior assessment and treatment plan.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-IBX-016').status, 'pass');
});

test('R-PA-IBX-017 does not impose universal Blue Distinction routing on a transplant request', () => {
  const text = 'Independence Blue Cross member.\nRequested service: kidney transplant.\nMedical necessity per Medical Policy.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-IBX-017').status, 'pass');
});

test('R-PA-IBX-018 does not infer experimental status from off-label use alone', () => {
  const findings = runEngine(bundleOf('Independence Blue Cross member.\nOff-label drug use requested and supported by NCCN.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-IBX-018').status, 'pass');
});

test('R-PA-IBX-018 flags an explicit experimental classification without a reliable-evidence basis', () => {
  const findings = runEngine(bundleOf('Independence Blue Cross member.\nService classified as experimental by IBX.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-IBX-018').status, 'flag');
});

test('R-PA-IBX-019 does not apply member-consent requirements to a generic grievance', () => {
  const findings = runEngine(bundleOf('Independence Blue Cross member.\nProvider grievance regarding office administration.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-IBX-019').status, 'pass');
});

test('R-PA-IBX-019 advises when a provider-filed member appeal omits consent and records', () => {
  const findings = runEngine(bundleOf('Independence Blue Cross member.\nMedical necessity member appeal.\nProvider filing on behalf of member.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-IBX-019').status, 'info');
});

test('R-PA-IBX-019 accepts signed member consent and supporting records', () => {
  const findings = runEngine(bundleOf('Independence Blue Cross member.\nMedical necessity member appeal.\nProvider filing on behalf of member.\nSigned member consent form and supporting medical records included.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-IBX-019').status, 'pass');
});

test('R-PA-IBX-020 does not impose HMO criteria on a generic out-of-network request', () => {
  const text = 'Independence Blue Cross member.\nOut-of-network prior authorization request.\nProcedure CPT 70551.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-IBX-020').status, 'pass');
});

test('R-PA-IBX-020 advises when an HMO out-of-network request omits the three referral criteria', () => {
  const findings = runEngine(bundleOf('Independence Blue Cross HMO member.\nOut-of-network provider requested.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-IBX-020').status, 'info');
});

test('R-PA-IBX-020 accepts a complete HMO out-of-network referral rationale', () => {
  const text = 'Independence Blue Cross HMO member.\nOut-of-network provider requested.\n'
    + 'PCP referral included. Member received care from a participating provider in the same specialty.\n'
    + 'The service is not available in network; no participating provider can offer it.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-IBX-020').status, 'pass');
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

test('R-PA-CAREFIRST-001 treats a missing policy reference as informational', () => {
  const text = 'CareFirst BlueCross BlueShield member.\n'
    + 'Requested procedure: CPT 72148 (MRI lumbar spine).\n'
    + 'Please authorize.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-CAREFIRST-001');
  assert.equal(f.status, 'info');
});

test('R-PA-CAREFIRST-001 passes when the CareFirst packet cites the applicable Medical Policy', () => {
  const text = 'CareFirst member.\n'
    + 'Requested procedure: CPT 72148.\n'
    + 'Medical necessity per the applicable CareFirst Medical Policy (MCG).\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-CAREFIRST-001');
  assert.equal(f.status, 'pass');
});

test('R-PA-CAREFIRST-002 treats a missing clinical document as request-specific information', () => {
  const text = 'CareFirst member.\nRequested procedure: CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-CAREFIRST-002');
  assert.equal(f.status, 'info');
});

test('R-PA-CAREFIRST-003 passes when the CareFirst packet names the CareFirst Direct channel (info)', () => {
  const text = 'CareFirst member.\nSubmitted via the CareFirst Direct provider portal.\nProcedure CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-CAREFIRST-003');
  assert.equal(f.status, 'pass');
});

test('R-PA-CAREFIRST-003 does not require the submission channel in packet content', () => {
  const findings = runEngine(bundleOf('CareFirst member.\nPrior authorization request for CPT 27447.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-CAREFIRST-003').status, 'pass');
});

test('R-PA-CAREFIRST-004 remains non-enforcing without a live member or portal lookup', () => {
  const findings = runEngine(bundleOf('CareFirst member.\nProcedure CPT 27447.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-CAREFIRST-004').status, 'pass');
});

test('R-PA-CAREFIRST-005 does not demand a confirmation for an initial authorization request', () => {
  const findings = runEngine(bundleOf('CareFirst member.\nPrior authorization required for CPT 27447.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-CAREFIRST-005').status, 'pass');
});

test('R-PA-CAREFIRST-005 advises when a submitted request has no confirmation reference', () => {
  const findings = runEngine(bundleOf('CareFirst member.\nPrior authorization submitted.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-CAREFIRST-005').status, 'info');
});

test('R-PA-CAREFIRST-005 accepts a submitted request with a case reference', () => {
  const findings = runEngine(bundleOf('CareFirst member.\nPrior authorization submitted.\nCase number: CF-1234.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-CAREFIRST-005').status, 'pass');
});

test('R-PA-CAREFIRST-006 treats missing inpatient clinical documentation as informational', () => {
  const findings = runEngine(bundleOf('CareFirst member.\nInpatient admission requested.\nPlace of service: 21.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-CAREFIRST-006').status, 'info');
});

test('R-PA-CAREFIRST-006 accepts an inpatient clinical note', () => {
  const text = 'CareFirst member.\nInpatient admission requested.\nPlace of service: 21.\nClinical note.\nHospital course documented.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-CAREFIRST-006').status, 'pass');
});

test('R-PA-CAREFIRST-007 does not infer EviCore eligibility from imaging alone', () => {
  const text = 'CareFirst member.\nRequested: MRI lumbar spine, CPT 72148.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-CAREFIRST-007');
  assert.equal(f.status, 'pass');
});

test('R-PA-CAREFIRST-007 flags eligible EviCore advanced imaging without an indication', () => {
  const text = 'CareFirst commercial fully insured member.\nRequested: MRI lumbar spine, CPT 72148.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-CAREFIRST-007');
  assert.equal(f.status, 'flag');
});

test('R-PA-CAREFIRST-007 does not treat every 7xxxx radiology code as advanced imaging', () => {
  const text = 'CareFirst commercial fully insured member.\nRequested procedure: CPT 77080.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-CAREFIRST-007').status, 'pass');
});

test('R-PA-CAREFIRST-008 passes when an expedited CareFirst request documents the clinical urgency', () => {
  const text = 'CareFirst member.\nExpedited review requested: delay would jeopardize the member\'s life or health.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-CAREFIRST-008');
  assert.equal(f.status, 'pass');
});

test('R-PA-CAREFIRST-008 treats an unexplained urgent request as informational', () => {
  const findings = runEngine(bundleOf('CareFirst member.\nExpedited prior authorization requested.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-CAREFIRST-008').status, 'info');
});

test('R-PA-CAREFIRST-009 does not apply a medical-drug site-of-care rule to outpatient surgery', () => {
  const text = 'CareFirst member.\nOutpatient hospital, place of service: 22.\nSurgery CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-CAREFIRST-009').status, 'pass');
});

test('R-PA-CAREFIRST-009 advises on an explicit hospital-outpatient drug site-of-care requirement', () => {
  const text = 'CareFirst member.\nSite of care management required.\nOutpatient hospital, place of service: 22.\nInfusion drug J1745.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-CAREFIRST-009').status, 'info');
});

test('R-PA-CAREFIRST-009 accepts a documented hospital-outpatient drug rationale', () => {
  const text = 'CareFirst member.\nSite of care management required.\nOutpatient hospital, place of service: 22.\n'
    + 'Infusion drug J1745. Hospital setting is medically necessary.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-CAREFIRST-009').status, 'pass');
});

test('R-PA-CAREFIRST-010 does not require an NDC for every J-code', () => {
  const findings = runEngine(bundleOf('CareFirst member.\nInfusion drug J1745.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-CAREFIRST-010').status, 'pass');
});

test('R-PA-CAREFIRST-010 advises when J3490 has no corresponding NDC', () => {
  const findings = runEngine(bundleOf('CareFirst member.\nUnclassified drug HCPCS J3490.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-CAREFIRST-010').status, 'info');
});

test('R-PA-CAREFIRST-010 accepts J3490 with an NDC', () => {
  const findings = runEngine(bundleOf('CareFirst member.\nUnclassified drug HCPCS J3490.\nNDC: 0002-1434-01.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-CAREFIRST-010').status, 'pass');
});

test('R-PA-CAREFIRST-011 does not infer step therapy from a J-code drug request', () => {
  const findings = runEngine(bundleOf('CareFirst member.\nInfusion drug J1745.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-CAREFIRST-011').status, 'pass');
});

test('R-PA-CAREFIRST-011 advises when explicit step therapy lacks a trial or exception basis', () => {
  const findings = runEngine(bundleOf('CareFirst member.\nThis drug is subject to step therapy.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-CAREFIRST-011').status, 'info');
});

test('R-PA-CAREFIRST-011 accepts an explicit step-therapy intolerance', () => {
  const findings = runEngine(bundleOf('CareFirst member.\nStep therapy required.\nIntolerance to the preferred drug documented.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-CAREFIRST-011').status, 'pass');
});

test('R-PA-CAREFIRST-012 does not infer genetic testing from the broad 81xxx laboratory range', () => {
  const findings = runEngine(bundleOf('CareFirst member.\nLaboratory procedure CPT 81001.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-CAREFIRST-012').status, 'pass');
});

test('R-PA-CAREFIRST-012 requires both a specific genetic test and an indication', () => {
  const findings = runEngine(bundleOf('CareFirst member.\nGenetic testing requested.\n'));
  const finding = findings.find((x) => x.ruleId === 'R-PA-CAREFIRST-012');
  assert.equal(finding.status, 'info');
  assert.match(finding.note, /specific test and clinical indication/);
});

test('R-PA-CAREFIRST-012 does not treat an unrelated CPT as the specific genetic test', () => {
  const findings = runEngine(bundleOf('CareFirst member.\nGenetic testing requested with office visit CPT 99213.\nClinical indication: family history.\n'));
  const finding = findings.find((x) => x.ruleId === 'R-PA-CAREFIRST-012');
  assert.equal(finding.status, 'info');
  assert.match(finding.note, /specific test/);
});

test('R-PA-CAREFIRST-012 does not accept a test name without an indication', () => {
  const findings = runEngine(bundleOf('CareFirst member.\nBRCA1 genetic testing requested.\n'));
  const finding = findings.find((x) => x.ruleId === 'R-PA-CAREFIRST-012');
  assert.equal(finding.status, 'info');
  assert.match(finding.note, /clinical indication/);
});

test('R-PA-CAREFIRST-012 accepts a specific genetic test and indication', () => {
  const findings = runEngine(bundleOf('CareFirst member.\nBRCA1 genetic testing requested.\nClinical indication: personal history of breast cancer.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-CAREFIRST-012').status, 'pass');
});

test('R-PA-CAREFIRST-013 treats a missing medical-drug diagnosis as informational', () => {
  const findings = runEngine(bundleOf('CareFirst member.\nInfusion drug J1745.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-CAREFIRST-013').status, 'info');
});

test('R-PA-CAREFIRST-013 accepts a medical-drug diagnosis', () => {
  const findings = runEngine(bundleOf('CareFirst member.\nInfusion drug J1745.\nDiagnosis: K50.90.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-CAREFIRST-013').status, 'pass');
});

test('R-PA-CAREFIRST-014 does not invent a universal retrospective-justification rule', () => {
  const findings = runEngine(bundleOf('CareFirst member.\nRetrospective authorization request.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-CAREFIRST-014').status, 'pass');
});

test('R-PA-CAREFIRST-015 does not apply the home-care form to DME alone', () => {
  const findings = runEngine(bundleOf('CareFirst member.\nDurable medical equipment E0601.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-CAREFIRST-015').status, 'pass');
});

test('R-PA-CAREFIRST-015 advises when home-care form details are incomplete', () => {
  const findings = runEngine(bundleOf('CareFirst member.\nHome care authorization requested.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-CAREFIRST-015').status, 'info');
});

test('R-PA-CAREFIRST-015 accepts a home-care diagnosis and requested services', () => {
  const text = 'CareFirst member.\nHome care authorization requested.\nDiagnosis: I10.\nServices requested: skilled nursing, 2 visits per week.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-CAREFIRST-015').status, 'pass');
});

test('R-PA-CAREFIRST-016 does not impose level-of-care fields on generic behavioral health', () => {
  const findings = runEngine(bundleOf('CareFirst member.\nBehavioral health prior authorization request.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-CAREFIRST-016').status, 'pass');
});

test('R-PA-CAREFIRST-016 advises when an ASAM level 3.7 request omits the setting', () => {
  const findings = runEngine(bundleOf('CareFirst member.\nASAM level 3.7 detoxification requested.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-CAREFIRST-016').status, 'info');
});

test('R-PA-CAREFIRST-016 accepts an ASAM level 3.7 residential setting', () => {
  const text = 'CareFirst member.\nASAM level 3.7 detoxification requested.\nPlace of service: residential treatment center.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-CAREFIRST-016').status, 'pass');
});

test('R-PA-CAREFIRST-017 does not invent universal Blue Distinction packet fields', () => {
  const text = 'CareFirst member.\nRequested service: kidney transplant.\nMedical necessity per Medical Policy.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-CAREFIRST-017').status, 'pass');
});

test('R-PA-CAREFIRST-018 does not treat off-label or clinical-trial language as experimental', () => {
  const text = 'CareFirst member.\nOff-label therapy requested as part of a clinical trial.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-CAREFIRST-018').status, 'pass');
});

test('R-PA-CAREFIRST-018 advises when an explicit investigational classification lacks its policy', () => {
  const findings = runEngine(bundleOf('CareFirst member.\nThe requested service is investigational.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-CAREFIRST-018').status, 'info');
});

test('R-PA-CAREFIRST-018 accepts an explicit investigational classification with its policy', () => {
  const text = 'CareFirst member.\nThe requested service is investigational under Medical Policy 7.01.001.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-CAREFIRST-018').status, 'pass');
});

test('R-PA-CAREFIRST-019 independently reports a missing appeal rationale', () => {
  const text = 'CareFirst member.\nAppeal of original denial, case number 12345.\n';
  const findings = runEngine(bundleOf(text));
  const finding = findings.find((x) => x.ruleId === 'R-PA-CAREFIRST-019');
  assert.equal(finding.status, 'info');
  assert.match(finding.note, /clinical rationale/);
});

test('R-PA-CAREFIRST-019 accepts an original denial and clinical rationale', () => {
  const text = 'CareFirst member.\nAppeal of original denial, case number 12345.\nClinical rationale: prior therapy failed.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-CAREFIRST-019').status, 'pass');
});

test('R-PA-CAREFIRST-020 does not apply the BlueChoice form to generic CareFirst OON benefits', () => {
  const text = 'CareFirst member.\nOut-of-network prior authorization request.\nProcedure CPT 70551.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-CAREFIRST-020').status, 'pass');
});

test('R-PA-CAREFIRST-020 advises when a BlueChoice OON request omits the required letter', () => {
  const text = 'CareFirst BlueChoice member.\nOut-of-network prior authorization request.\nProcedure CPT 70551.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-CAREFIRST-020').status, 'info');
});

test('R-PA-CAREFIRST-020 accepts the BlueChoice OON letter and explanation', () => {
  const text = 'CareFirst BlueChoice member.\nOut-of-network request.\nLetter of medical necessity: no in-network provider offers the service.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-CAREFIRST-020').status, 'pass');
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

test('R-PA-BCBSNC-001 treats a missing policy reference as informational', () => {
  const text = 'Blue Cross Blue Shield of North Carolina member.\n'
    + 'Requested procedure: CPT 72148 (MRI lumbar spine).\n'
    + 'Please authorize.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BCBSNC-001');
  assert.equal(f.status, 'info');
});

test('R-PA-BCBSNC-001 passes when the Blue Cross NC packet cites the applicable Medical Policy', () => {
  const text = 'Blue Cross Blue Shield of North Carolina member.\n'
    + 'Requested procedure: CPT 72148.\n'
    + 'Medical necessity per the applicable Blue Cross NC Medical Policy (MCG).\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BCBSNC-001');
  assert.equal(f.status, 'pass');
});

test('R-PA-BCBSNC-002 treats missing clinical context as informational', () => {
  const text = 'Blue Cross Blue Shield of North Carolina member.\nRequested procedure: CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BCBSNC-002');
  assert.equal(f.status, 'info');
});

test('R-PA-BCBSNC-002 accepts clinical context in the request itself', () => {
  const text = 'Blue Cross Blue Shield of North Carolina member.\nProcedure CPT 27447.\nClinical rationale: severe osteoarthritis after failed therapy.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSNC-002').status, 'pass');
});

test('R-PA-BCBSNC-003 does not require submission-channel text in packet content', () => {
  const text = 'Blue Cross Blue Shield of North Carolina member.\nProcedure CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSNC-003').status, 'pass');
});

test('R-PA-BCBSNC-005 does not expect an authorization number on an initial request', () => {
  const text = 'Blue Cross Blue Shield of North Carolina member.\nPrior authorization required for CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSNC-005').status, 'pass');
});

test('R-PA-BCBSNC-005 checks the conditional reference on an in-network benefit review', () => {
  const text = 'Blue Cross Blue Shield of North Carolina member.\nIn-network benefit review.\nExisting authorization: yes.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSNC-005').status, 'info');
});

test('R-PA-BCBSNC-005 accepts the declared existing authorization reference', () => {
  const text = 'Blue Cross Blue Shield of North Carolina member.\nIn-network benefit review.\nExisting authorization: yes.\nAuthorization number: 12345.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSNC-005').status, 'pass');
});

test('R-PA-BCBSNC-006 does not require concurrent-review content on an initial inpatient request', () => {
  const text = 'Blue Cross Blue Shield of North Carolina member.\nInpatient admission request.\nPlace of service: 21.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSNC-006').status, 'pass');
});

test('R-PA-BCBSNC-006 treats a continued-stay request without a clinical update as informational', () => {
  const text = 'Blue Cross Blue Shield of North Carolina member.\nContinued stay request for 2 additional inpatient days.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSNC-006').status, 'info');
});

test('R-PA-BCBSNC-006 accepts a continued-stay clinical update', () => {
  const text = 'Blue Cross Blue Shield of North Carolina member.\nContinued stay request.\nClinical update: patient remains unstable.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSNC-006').status, 'pass');
});

test('R-PA-BCBSNC-007 treats a missing outpatient MRI indication as informational', () => {
  const text = 'Blue Cross Blue Shield of North Carolina member.\nRequested: MRI lumbar spine, CPT 72148.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BCBSNC-007');
  assert.equal(f.status, 'info');
});

test('R-PA-BCBSNC-007 does not infer advanced imaging from a generic radiology CPT', () => {
  const text = 'Blue Cross Blue Shield of North Carolina member.\nRequested: chest radiograph, CPT 71046.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSNC-007').status, 'pass');
});

test('R-PA-BCBSNC-008 passes when an expedited Blue Cross NC request documents the clinical urgency', () => {
  const text = 'Blue Cross Blue Shield of North Carolina member.\nExpedited review requested: delay would jeopardize the member\'s life or health.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BCBSNC-008');
  assert.equal(f.status, 'pass');
});

test('R-PA-BCBSNC-008 treats an unexplained urgent request as informational', () => {
  const text = 'Blue Cross Blue Shield of North Carolina member.\nUrgent prior authorization requested.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSNC-008').status, 'info');
});

test('R-PA-BCBSNC-009 does not infer site-of-care review from every outpatient surgery', () => {
  const text = 'Blue Cross Blue Shield of North Carolina member.\nProcedure CPT 43235.\nPlace of service: 22.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSNC-009').status, 'pass');
});

test('R-PA-BCBSNC-009 flags a confirmed hospital-outpatient site-of-care review without rationale', () => {
  const text = 'Blue Cross Blue Shield of North Carolina member.\nSite of care review required.\nProcedure CPT 43235.\nPlace of service: 22.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSNC-009').status, 'flag');
});

test('R-PA-BCBSNC-009 accepts a hospital-outpatient site-of-care rationale', () => {
  const text = 'Blue Cross Blue Shield of North Carolina member.\nSite of care review required.\nPlace of service: 22.\nHospital setting is medically necessary because of higher acuity.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSNC-009').status, 'pass');
});

test('R-PA-BCBSNC-010 does not apply claims-only NDC validation to a J-code request', () => {
  const text = 'Blue Cross Blue Shield of North Carolina member.\nPhysician-administered drug J0123 requested.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSNC-010').status, 'pass');
});

test('R-PA-BCBSNC-011 does not infer step therapy from a generic drug request', () => {
  const text = 'Blue Cross Blue Shield of North Carolina member.\nSpecialty drug J0123 requested.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSNC-011').status, 'pass');
});

test('R-PA-BCBSNC-011 flags an explicit step-therapy request with no trial or exception', () => {
  const text = 'Blue Cross Blue Shield of North Carolina member.\nStep therapy required for requested medication.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSNC-011').status, 'flag');
});

test('R-PA-BCBSNC-011 accepts a documented step-therapy exception', () => {
  const text = 'Blue Cross Blue Shield of North Carolina member.\nStep therapy required.\nContraindication to preferred drug.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSNC-011').status, 'pass');
});

test('R-PA-BCBSNC-012 does not treat every 81xxx code as molecular testing', () => {
  const text = 'Blue Cross Blue Shield of North Carolina member.\nUrinalysis CPT 81001 requested.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSNC-012').status, 'pass');
});

test('R-PA-BCBSNC-012 requires both a specific test and clinical purpose as information', () => {
  const text = 'Blue Cross Blue Shield of North Carolina member.\nGenetic testing CPT 81226 requested.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSNC-012').status, 'info');
});

test('R-PA-BCBSNC-012 accepts a named genetic test and clinical purpose', () => {
  const text = 'Blue Cross Blue Shield of North Carolina member.\nTest name: CYP2C19 genotype, CPT 81226.\nPurpose of testing: therapy selection.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSNC-012').status, 'pass');
});

test('R-PA-BCBSNC-013 does not infer a specialty-drug workflow from a bare J-code', () => {
  const text = 'Blue Cross Blue Shield of North Carolina member.\nRequested code J0123.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSNC-013').status, 'pass');
});

test('R-PA-BCBSNC-013 treats a missing specialty-drug diagnosis as informational', () => {
  const text = 'Blue Cross Blue Shield of North Carolina member.\nSpecialty drug requested.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSNC-013').status, 'info');
});

test('R-PA-BCBSNC-014 advises when a retrospective request has no explanation', () => {
  const text = 'Blue Cross Blue Shield of North Carolina member.\nRetrospective authorization request.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSNC-014').status, 'info');
});

test('R-PA-BCBSNC-015 does not apply the DME policy to a generic home-health request', () => {
  const text = 'Blue Cross Blue Shield of North Carolina member.\nHome health prior authorization requested.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSNC-015').status, 'pass');
});

test('R-PA-BCBSNC-015 checks the DME treatment plan without inventing a signature field', () => {
  const incomplete = runEngine(bundleOf('Blue Cross Blue Shield of North Carolina member.\nWheelchair requested.\n'));
  assert.equal(incomplete.find((x) => x.ruleId === 'R-PA-BCBSNC-015').status, 'info');

  const complete = runEngine(bundleOf('Blue Cross Blue Shield of North Carolina member.\nWheelchair requested.\nTreatment plan: mobility support.\nLength of need: 12 months.\nExpected benefit: independent movement.\n'));
  assert.equal(complete.find((x) => x.ruleId === 'R-PA-BCBSNC-015').status, 'pass');
});

test('R-PA-BCBSNC-016 does not apply to a generic mental-health request', () => {
  const text = 'Blue Cross Blue Shield of North Carolina member.\nMental health office visit requested.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSNC-016').status, 'pass');
});

test('R-PA-BCBSNC-016 flags an inpatient behavioral-health request without a treatment plan and level-of-care rationale', () => {
  const text = 'Blue Cross Blue Shield of North Carolina member.\nInpatient psychiatric admission requested.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSNC-016').status, 'flag');
});

test('R-PA-BCBSNC-016 accepts a treatment plan and less-intensive-care rationale', () => {
  const text = 'Blue Cross Blue Shield of North Carolina member.\nInpatient psychiatric admission requested.\nProposed treatment plan: medication stabilization.\nRationale for inpatient care versus a less intensive level: imminent risk requires 24-hour monitoring.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSNC-016').status, 'pass');
});

test('R-PA-BCBSNC-017 does not impose designated-center routing on every transplant request', () => {
  const text = 'Blue Cross Blue Shield of North Carolina member.\nRequested service: kidney transplant.\nMedical necessity per Medical Policy.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSNC-017').status, 'pass');
});

test('R-PA-BCBSNC-017 advises when an explicit designated-center requirement lacks a facility', () => {
  const text = 'Blue Cross Blue Shield of North Carolina member.\nKidney transplant requested.\nBlue Distinction center required.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSNC-017').status, 'info');
});

test('R-PA-BCBSNC-017 accepts a qualifying transplant facility', () => {
  const text = 'Blue Cross Blue Shield of North Carolina member.\nKidney transplant requested.\nBlue Distinction center required.\nBlue Distinction center: Example Transplant Institute.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSNC-017').status, 'pass');
});

test('R-PA-BCBSNC-018 does not equate off-label use or a clinical trial with investigational status', () => {
  const text = 'Blue Cross Blue Shield of North Carolina member.\nOff-label drug requested as part of a clinical trial.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSNC-018').status, 'pass');
});

test('R-PA-BCBSNC-018 flags an explicitly investigational service with no policy or coverage basis', () => {
  const text = 'Blue Cross Blue Shield of North Carolina member.\nInvestigational treatment requested.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSNC-018').status, 'flag');
});

test('R-PA-BCBSNC-018 accepts a covered-clinical-trial basis', () => {
  const text = 'Blue Cross Blue Shield of North Carolina member.\nInvestigational treatment requested.\nCovered clinical trial basis: qualifying phase III trial.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSNC-018').status, 'pass');
});

test('R-PA-BCBSNC-019 ignores a generic grievance', () => {
  const text = 'Blue Cross Blue Shield of North Carolina member.\nMember grievance regarding customer service.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSNC-019').status, 'pass');
});

test('R-PA-BCBSNC-019 advises when a prior-authorization appeal does not identify the decision', () => {
  const text = 'Blue Cross Blue Shield of North Carolina member.\nPrior authorization appeal requested.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSNC-019').status, 'info');
});

test('R-PA-BCBSNC-020 does not require a network-gap reason for every out-of-network authorization', () => {
  const text = 'Blue Cross Blue Shield of North Carolina member.\nOut-of-network prior authorization request.\nProcedure CPT 70551.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSNC-020').status, 'pass');
});

test('R-PA-BCBSNC-020 advises when an explicit network-exception request has no reason', () => {
  const text = 'Blue Cross Blue Shield of North Carolina member.\nNetwork exception request for CPT 70551.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSNC-020').status, 'info');
});

test('R-PA-BCBSNC-020 accepts an explicit network exception with an access-gap reason', () => {
  const text = 'Blue Cross Blue Shield of North Carolina member.\nNetwork exception request for CPT 70551.\nNo in-network provider has the required expertise.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSNC-020').status, 'pass');
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

test('R-PA-HORIZON-001 treats a missing coverage-criteria reference as informational', () => {
  const text = 'Horizon Blue Cross Blue Shield of New Jersey member.\n'
    + 'Requested procedure: CPT 72148 (MRI lumbar spine).\n'
    + 'Please authorize.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-HORIZON-001');
  assert.equal(f.status, 'info');
});

test('R-PA-HORIZON-001 passes when the Horizon packet cites the applicable Medical Policy', () => {
  const text = 'Horizon Blue Cross Blue Shield of New Jersey member.\n'
    + 'Requested procedure: CPT 72148.\n'
    + 'Medical necessity per the applicable Horizon Medical Policy (MCG).\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-HORIZON-001');
  assert.equal(f.status, 'pass');
});

test('R-PA-HORIZON-002 advises when a Horizon packet has no clinical context', () => {
  const text = 'Horizon Blue Cross Blue Shield of New Jersey member.\nRequested procedure: CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-HORIZON-002');
  assert.equal(f.status, 'info');
});

test('R-PA-HORIZON-002 accepts clinical context in the request itself', () => {
  const text = 'Horizon Blue Cross Blue Shield of New Jersey member.\nRequested procedure: CPT 27447.\nClinical indication: end-stage knee osteoarthritis.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-HORIZON-002').status, 'pass');
});

test('R-PA-HORIZON-003 does not require submission-channel text in the packet', () => {
  const text = 'Horizon Blue Cross Blue Shield of New Jersey member.\nProcedure CPT 27447 requested.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-HORIZON-003').status, 'pass');
});

test('R-PA-HORIZON-004 does not infer authorization-list membership without member-specific data', () => {
  const text = 'Horizon Blue Cross Blue Shield of New Jersey member.\nProcedure CPT 27447 requested.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-HORIZON-004').status, 'pass');
});

test('R-PA-HORIZON-005 does not require an approval number on an initial request', () => {
  const text = 'Horizon Blue Cross Blue Shield of New Jersey member.\nPrior authorization required for CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-HORIZON-005').status, 'pass');
});

test('R-PA-HORIZON-005 advises when a declared existing authorization lacks its reference', () => {
  const text = 'Horizon Blue Cross Blue Shield of New Jersey member.\nExisting authorization: yes.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-HORIZON-005').status, 'info');
});

test('R-PA-HORIZON-005 accepts the reference for a declared existing authorization', () => {
  const text = 'Horizon Blue Cross Blue Shield of New Jersey member.\nExisting authorization: yes.\nAuthorization number: HZN-12345.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-HORIZON-005').status, 'pass');
});

test('R-PA-HORIZON-006 does not require concurrent-review fields on an initial inpatient request', () => {
  const text = 'Horizon Blue Cross Blue Shield of New Jersey member.\nInpatient admission requested at POS 21.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-HORIZON-006').status, 'pass');
});

test('R-PA-HORIZON-006 advises when an explicit concurrent review lacks current clinical context', () => {
  const text = 'Horizon Blue Cross Blue Shield of New Jersey member.\nConcurrent review requested.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-HORIZON-006').status, 'info');
});

test('R-PA-HORIZON-006 accepts current clinical context for an explicit concurrent review', () => {
  const text = 'Horizon Blue Cross Blue Shield of New Jersey member.\nConcurrent review requested.\nClinical update: improving after treatment.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-HORIZON-006').status, 'pass');
});

test('R-PA-HORIZON-007 advises on a Horizon outpatient MRI with no clinical indication', () => {
  const text = 'Horizon Blue Cross Blue Shield of New Jersey member.\nRequested: MRI lumbar spine, CPT 72148.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-HORIZON-007');
  assert.equal(f.status, 'info');
});

test('R-PA-HORIZON-007 does not treat every radiology CPT as advanced imaging', () => {
  const text = 'Horizon Blue Cross Blue Shield of New Jersey member.\nRequested: chest radiograph, CPT 71046.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-HORIZON-007').status, 'pass');
});

test('R-PA-HORIZON-007 excludes inpatient advanced imaging from its outpatient check', () => {
  const text = 'Horizon Blue Cross Blue Shield of New Jersey member.\nInpatient hospital POS 21. Requested MRI CPT 72148.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-HORIZON-007').status, 'pass');
});

test('R-PA-HORIZON-007 accepts an outpatient advanced-imaging indication', () => {
  const text = 'Horizon Blue Cross Blue Shield of New Jersey member.\nRequested MRI CPT 72148. Clinical indication: lumbar radiculopathy.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-HORIZON-007').status, 'pass');
});

test('R-PA-HORIZON-008 does not treat generic urgent language as an expedited authorization request', () => {
  const text = 'Horizon Blue Cross Blue Shield of New Jersey member.\nUrgent request for clinical records.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-HORIZON-008').status, 'pass');
});

test('R-PA-HORIZON-008 advises when expedited authorization has no clinical urgency rationale', () => {
  const text = 'Horizon Blue Cross Blue Shield of New Jersey member.\nExpedited prior authorization requested.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-HORIZON-008').status, 'info');
});

test('R-PA-HORIZON-008 passes when an expedited Horizon request documents the clinical urgency', () => {
  const text = 'Horizon Blue Cross Blue Shield of New Jersey member.\nExpedited review requested: delay would jeopardize the member\'s life or health.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-HORIZON-008');
  assert.equal(f.status, 'pass');
});

test('R-PA-HORIZON-009 does not infer site-of-care review from every hospital-outpatient surgery', () => {
  const text = 'Horizon Blue Cross Blue Shield of New Jersey member.\nHospital outpatient POS 22. Procedure CPT 27447 requested.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-HORIZON-009').status, 'pass');
});

test('R-PA-HORIZON-009 advises when confirmed site-of-care review lacks a hospital rationale', () => {
  const text = 'Horizon Blue Cross Blue Shield of New Jersey member.\nSite-of-care review applies. Hospital outpatient POS 22 requested.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-HORIZON-009').status, 'info');
});

test('R-PA-HORIZON-009 accepts a hospital rationale when site-of-care review applies', () => {
  const text = 'Horizon Blue Cross Blue Shield of New Jersey member.\nSite-of-care review applies. Hospital outpatient POS 22 requested.\nHigher acuity requires hospital monitoring.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-HORIZON-009').status, 'pass');
});

test('R-PA-HORIZON-010 does not impose a universal NDC field on a J-code request', () => {
  const text = 'Horizon Blue Cross Blue Shield of New Jersey member.\nPhysician-administered drug requested under HCPCS J1745.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-HORIZON-010').status, 'pass');
});

test('R-PA-HORIZON-011 does not infer step therapy from a J-code', () => {
  const text = 'Horizon Blue Cross Blue Shield of New Jersey member.\nPhysician-administered drug requested under HCPCS J1745.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-HORIZON-011').status, 'pass');
});

test('R-PA-HORIZON-011 advises when confirmed step therapy has no prior-use or exception context', () => {
  const text = 'Horizon Blue Cross Blue Shield of New Jersey member.\nStep therapy applies to the requested drug.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-HORIZON-011').status, 'info');
});

test('R-PA-HORIZON-011 accepts prior drug use when step therapy applies', () => {
  const text = 'Horizon Blue Cross Blue Shield of New Jersey member.\nStep therapy applies. Previous use: methotrexate.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-HORIZON-011').status, 'pass');
});

test('R-PA-HORIZON-012 does not treat an ordinary 81xxx laboratory code as genetic testing', () => {
  const text = 'Horizon Blue Cross Blue Shield of New Jersey member.\nUrinalysis requested, CPT 81002.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-HORIZON-012').status, 'pass');
});

test('R-PA-HORIZON-012 separately requires test identity and indication', () => {
  const text = 'Horizon Blue Cross Blue Shield of New Jersey member.\nGenetic testing prior authorization requested. Diagnosis documented elsewhere.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-HORIZON-012');
  assert.equal(f.status, 'info');
  assert.match(f.note, /specific test/);
});

test('R-PA-HORIZON-012 accepts a specific genetic test and clinical indication', () => {
  const text = 'Horizon Blue Cross Blue Shield of New Jersey member.\nTest requested: BRCA1/BRCA2 gene panel. Clinical indication: strong family history of breast cancer.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-HORIZON-012').status, 'pass');
});

test('R-PA-HORIZON-013 does not infer specialty-drug review from a J-code or generic infusion', () => {
  const text = 'Horizon Blue Cross Blue Shield of New Jersey member.\nInfusion requested under HCPCS J1745.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-HORIZON-013').status, 'pass');
});

test('R-PA-HORIZON-013 advises when an explicit specialty-drug request lacks a diagnosis', () => {
  const text = 'Horizon Blue Cross Blue Shield of New Jersey member.\nSpecialty drug prior authorization requested.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-HORIZON-013').status, 'info');
});

test('R-PA-HORIZON-013 accepts a diagnosis on an explicit specialty-drug request', () => {
  const text = 'Horizon Blue Cross Blue Shield of New Jersey member.\nSpecialty drug prior authorization requested. Diagnosis: rheumatoid arthritis.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-HORIZON-013').status, 'pass');
});

test('R-PA-HORIZON-014 does not infer retrospective authorization from post-service language', () => {
  const text = 'Horizon Blue Cross Blue Shield of New Jersey member.\nPost-service clinical note attached.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-HORIZON-014').status, 'pass');
});

test('R-PA-HORIZON-014 advises when an explicit retrospective authorization lacks a reason', () => {
  const text = 'Horizon Blue Cross Blue Shield of New Jersey member.\nRetrospective authorization requested.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-HORIZON-014').status, 'info');
});

test('R-PA-HORIZON-014 accepts a reason for an explicit retrospective authorization', () => {
  const text = 'Horizon Blue Cross Blue Shield of New Jersey member.\nRetrospective authorization requested because emergency care prevented advance review.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-HORIZON-014').status, 'pass');
});

test('R-PA-HORIZON-015 does not infer an order requirement from DME or an E-code', () => {
  const text = 'Horizon Blue Cross Blue Shield of New Jersey member.\nDurable medical equipment requested under HCPCS E0601.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-HORIZON-015').status, 'pass');
});

test('R-PA-HORIZON-015 advises when a declared order requirement has no signature', () => {
  const text = 'Horizon Blue Cross Blue Shield of New Jersey member.\nWritten order required for this request.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-HORIZON-015').status, 'info');
});

test('R-PA-HORIZON-015 accepts signature evidence for a declared order requirement', () => {
  const text = 'Horizon Blue Cross Blue Shield of New Jersey member.\nWritten order required for this request.\nElectronically signed by Ordering Clinician.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-HORIZON-015').status, 'pass');
});

test('R-PA-HORIZON-016 does not require level-of-care criteria for generic mental-health care', () => {
  const text = 'Horizon Blue Cross Blue Shield of New Jersey member.\nOutpatient mental health office visit requested.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-HORIZON-016').status, 'pass');
});

test('R-PA-HORIZON-016 advises when facility-based behavioral health lacks plan and level rationale', () => {
  const text = 'Horizon Blue Cross Blue Shield of New Jersey member.\nResidential treatment requested.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-HORIZON-016').status, 'info');
});

test('R-PA-HORIZON-016 accepts a treatment plan and requested-level rationale', () => {
  const text = 'Horizon Blue Cross Blue Shield of New Jersey member.\nResidential treatment requested.\nProposed treatment plan: daily therapy. Rationale for residential: failed lower level of care.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-HORIZON-016').status, 'pass');
});

test('R-PA-HORIZON-017 does not infer designated-center routing from every transplant request', () => {
  const text = 'Horizon Blue Cross Blue Shield of New Jersey member.\nRequested service: kidney transplant.\nMedical necessity per Medical Policy.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-HORIZON-017');
  assert.equal(f.status, 'pass');
});

test('R-PA-HORIZON-017 advises when an explicit designated-center requirement lacks a facility', () => {
  const text = 'Horizon Blue Cross Blue Shield of New Jersey member.\nKidney transplant requested. Blue Distinction center required.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-HORIZON-017').status, 'info');
});

test('R-PA-HORIZON-017 accepts the qualifying facility for designated-center routing', () => {
  const text = 'Horizon Blue Cross Blue Shield of New Jersey member.\nKidney transplant requested. Blue Distinction center required.\nBlue Distinction center: Example Transplant Institute.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-HORIZON-017').status, 'pass');
});

test('R-PA-HORIZON-018 does not classify off-label use or trial participation as investigational', () => {
  const text = 'Horizon Blue Cross Blue Shield of New Jersey member.\nOff-label drug use in a clinical trial.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-HORIZON-018').status, 'pass');
});

test('R-PA-HORIZON-018 advises when an explicitly investigational service lacks its policy basis', () => {
  const text = 'Horizon Blue Cross Blue Shield of New Jersey member.\nRequested treatment is classified as investigational.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-HORIZON-018').status, 'info');
});

test('R-PA-HORIZON-018 accepts the policy basis for an explicitly investigational service', () => {
  const text = 'Horizon Blue Cross Blue Shield of New Jersey member.\nRequested treatment is classified as investigational. Medical Policy number: 164.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-HORIZON-018').status, 'pass');
});

test('R-PA-HORIZON-019 does not treat a generic appeal as a prior-authorization appeal', () => {
  const text = 'Horizon Blue Cross Blue Shield of New Jersey member.\nClaim payment appeal requested.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-HORIZON-019').status, 'pass');
});

test('R-PA-HORIZON-019 advises when a prior-authorization appeal omits the original decision', () => {
  const text = 'Horizon Blue Cross Blue Shield of New Jersey member.\nPrior authorization appeal requested.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-HORIZON-019').status, 'info');
});

test('R-PA-HORIZON-019 accepts an original-decision reference on a prior-authorization appeal', () => {
  const text = 'Horizon Blue Cross Blue Shield of New Jersey member.\nPrior authorization appeal requested. Original denial dated 2026-09-01.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-HORIZON-019').status, 'pass');
});

test('R-PA-HORIZON-020 does not require a network-gap reason for every out-of-network authorization', () => {
  const text = 'Horizon Blue Cross Blue Shield of New Jersey member.\nOut-of-network prior authorization request.\nProcedure CPT 70551.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-HORIZON-020');
  assert.equal(f.status, 'pass');
});

test('R-PA-HORIZON-020 advises when an explicit network-exception request lacks a reason', () => {
  const text = 'Horizon Blue Cross Blue Shield of New Jersey member.\nNetwork exception request for CPT 70551.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-HORIZON-020').status, 'info');
});

test('R-PA-HORIZON-020 accepts an access-gap reason for a network exception', () => {
  const text = 'Horizon Blue Cross Blue Shield of New Jersey member.\nNetwork exception request for CPT 70551.\nNo in-network provider has the required expertise.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-HORIZON-020').status, 'pass');
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

test('R-PA-BCBST-001 does not require every BCBST procedure request to cite a Medical Policy', () => {
  const text = 'Blue Cross Blue Shield of Tennessee member.\n'
    + 'Requested procedure: CPT 72148 (MRI lumbar spine).\n'
    + 'Please authorize.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BCBST-001');
  assert.equal(f.status, 'pass');
});

test('R-PA-BCBST-001 advises when a BCBST rationale relies on an unidentified Medical Policy', () => {
  const text = 'Blue Cross Blue Shield of Tennessee member.\n'
    + 'Requested procedure: CPT 72148.\n'
    + 'Medical necessity per Medical Policy.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BCBST-001');
  assert.equal(f.status, 'info');
});

test('R-PA-BCBST-001 accepts a named Medical Policy when the rationale relies on it', () => {
  const text = 'Blue Cross Blue Shield of Tennessee member.\n'
    + 'Requested procedure: CPT 72148.\n'
    + 'Medical necessity per Medical Policy. Medical Policy number: MRI-12.\n';
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

test('R-PA-BCBST-002 does not demand clinical attachments without an identifiable authorization request', () => {
  const text = 'Blue Cross Blue Shield of Tennessee member.\nProvider contact update.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBST-002').status, 'pass');
});

test('R-PA-BCBST-003 passes when the BCBST packet names the Availity channel', () => {
  const text = 'Blue Cross Blue Shield of Tennessee member.\nSubmitted via Availity.\nProcedure CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BCBST-003');
  assert.equal(f.status, 'pass');
});

test('R-PA-BCBST-003 does not require transmission metadata inside the clinical packet', () => {
  const text = 'Blue Cross Blue Shield of Tennessee member.\nProcedure CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBST-003').status, 'pass');
});

test('R-PA-BCBST-006 does not treat an initial inpatient request as concurrent review', () => {
  const text = 'Blue Cross Blue Shield of Tennessee member.\nInitial inpatient admission request. Place of service: 21.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBST-006').status, 'pass');
});

test('R-PA-BCBST-006 flags a concurrent review without a current clinical update', () => {
  const text = 'Blue Cross Blue Shield of Tennessee member.\nConcurrent review request for additional inpatient days.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBST-006').status, 'flag');
});

test('R-PA-BCBST-006 accepts current progress on a concurrent review', () => {
  const text = 'Blue Cross Blue Shield of Tennessee member.\nConcurrent review request for additional inpatient days. Clinical update: improving on IV therapy.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBST-006').status, 'pass');
});

test('R-PA-BCBST-005 does not require a future authorization number on an initial request', () => {
  const text = 'Blue Cross Blue Shield of Tennessee member.\nPrior authorization required for CPT 27447. Please authorize.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBST-005').status, 'pass');
});

test('R-PA-BCBST-005 advises when claimed approval lacks its issued reference', () => {
  const text = 'Blue Cross Blue Shield of Tennessee member.\nPrior authorization approved for CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBST-005').status, 'info');
});

test('R-PA-BCBST-005 accepts a reference on a claimed approval', () => {
  const text = 'Blue Cross Blue Shield of Tennessee member.\nPrior authorization approved for CPT 27447. Authorization number: TN-123.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBST-005').status, 'pass');
});

test('R-PA-BCBST-007 flags a BCBST outpatient MRI with no clinical indication', () => {
  const text = 'Blue Cross Blue Shield of Tennessee member.\nRequested: MRI lumbar spine, CPT 72148.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BCBST-007');
  assert.equal(f.status, 'flag');
});

test('R-PA-BCBST-007 does not infer high-tech imaging from every 7xxxx CPT', () => {
  const text = 'Blue Cross Blue Shield of Tennessee member.\nRequested radiology procedure CPT 71046.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBST-007').status, 'pass');
});

test('R-PA-BCBST-007 does not apply the outpatient check in an emergency setting', () => {
  const text = 'Blue Cross Blue Shield of Tennessee member.\nEmergency department CT scan, place of service: 23.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBST-007').status, 'pass');
});

test('R-PA-BCBST-007 accepts a clinical indication for outpatient high-tech imaging', () => {
  const text = 'Blue Cross Blue Shield of Tennessee member.\nRequested MRI lumbar spine. Clinical indication: persistent radiculopathy.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBST-007').status, 'pass');
});

test('R-PA-BCBST-008 passes when an expedited BCBST request documents the clinical urgency', () => {
  const text = 'Blue Cross Blue Shield of Tennessee member.\nExpedited review requested: delay would jeopardize the member\'s life or health.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BCBST-008');
  assert.equal(f.status, 'pass');
});

test('R-PA-BCBST-008 does not treat generic urgent clinical language as an expedited request', () => {
  const text = 'Blue Cross Blue Shield of Tennessee member.\nUrgent care visit with STAT laboratory testing.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBST-008').status, 'pass');
});

test('R-PA-BCBST-008 flags an explicit expedited request without clinician justification', () => {
  const text = 'Blue Cross Blue Shield of Tennessee member.\nExpedited review requested.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBST-008').status, 'flag');
});

test('R-PA-BCBST-009 does not infer a site restriction from hospital-outpatient surgery', () => {
  const text = 'Blue Cross Blue Shield of Tennessee member.\nOutpatient knee surgery CPT 29881, place of service: 22.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBST-009').status, 'pass');
});

test('R-PA-BCBST-009 advises when an explicit site-of-care review lacks rationale', () => {
  const text = 'Blue Cross Blue Shield of Tennessee member.\nSite-of-care review required for outpatient surgery.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBST-009').status, 'info');
});

test('R-PA-BCBST-009 accepts the requested-site rationale', () => {
  const text = 'Blue Cross Blue Shield of Tennessee member.\nSite-of-care review required. Requested site rationale: ambulatory surgical center unavailable.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBST-009').status, 'pass');
});

test('R-PA-BCBST-010 does not require an NDC for every J-code request', () => {
  const text = 'Blue Cross Blue Shield of Tennessee member.\nPhysician-administered drug HCPCS J1745 requested.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBST-010').status, 'pass');
});

test('R-PA-BCBST-010 advises when a declared NDC requirement lacks a value', () => {
  const text = 'Blue Cross Blue Shield of Tennessee member.\nPhysician-administered drug requested. NDC required for this request.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBST-010').status, 'info');
});

test('R-PA-BCBST-010 accepts an NDC-formatted value when declared required', () => {
  const text = 'Blue Cross Blue Shield of Tennessee member.\nNDC required for this request: 00069-1003-01.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBST-010').status, 'pass');
});

test('R-PA-BCBST-011 does not infer step therapy from a J-code', () => {
  const text = 'Blue Cross Blue Shield of Tennessee member.\nProvider-administered drug HCPCS J1745 requested.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBST-011').status, 'pass');
});

test('R-PA-BCBST-011 flags an explicit step-therapy requirement without a trial or exception', () => {
  const text = 'Blue Cross Blue Shield of Tennessee member.\nRequested drug is subject to step therapy.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBST-011').status, 'flag');
});

test('R-PA-BCBST-011 accepts a preferred-product trial or exception', () => {
  const text = 'Blue Cross Blue Shield of Tennessee member.\nRequested drug is subject to step therapy. Preferred product previously tried with inadequate response.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBST-011').status, 'pass');
});

test('R-PA-BCBST-012 does not infer genetic testing from a broad 81xxx CPT', () => {
  const text = 'Blue Cross Blue Shield of Tennessee member.\nLaboratory procedure CPT 81001 requested.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBST-012').status, 'pass');
});

test('R-PA-BCBST-012 advises when a genetic request omits test identity or indication', () => {
  const text = 'Blue Cross Blue Shield of Tennessee member.\nGenetic testing authorization requested.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBST-012').status, 'info');
});

test('R-PA-BCBST-012 accepts separate test and indication details', () => {
  const text = 'Blue Cross Blue Shield of Tennessee member.\nGenetic testing authorization requested. Test name: hereditary cancer panel. Clinical indication: personal history of breast cancer.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBST-012').status, 'pass');
});

test('R-PA-BCBST-013 does not infer the medication-form workflow from a generic infusion', () => {
  const text = 'Blue Cross Blue Shield of Tennessee member.\nOffice infusion requested with HCPCS J1745.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBST-013').status, 'pass');
});

test('R-PA-BCBST-013 flags a provider-administered medication form without diagnosis', () => {
  const text = 'Blue Cross Blue Shield of Tennessee member.\nProvider-Administered Medication Authorization. Drug name: infliximab.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBST-013').status, 'flag');
});

test('R-PA-BCBST-013 accepts a diagnosis on the medication form', () => {
  const text = 'Blue Cross Blue Shield of Tennessee member.\nProvider-Administered Medication Authorization. Drug name: infliximab. Diagnosis code: K50.90.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBST-013').status, 'pass');
});

test('R-PA-BCBST-014 does not treat generic post-service text as a retrospective request', () => {
  const text = 'Blue Cross Blue Shield of Tennessee member.\nPost-service claim documentation.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBST-014').status, 'pass');
});

test('R-PA-BCBST-014 advises when an explicit retrospective request omits its reason', () => {
  const text = 'Blue Cross Blue Shield of Tennessee member.\nRetrospective authorization request.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBST-014').status, 'info');
});

test('R-PA-BCBST-014 accepts a retrospective-request reason', () => {
  const text = 'Blue Cross Blue Shield of Tennessee member.\nRetrospective authorization request because eligibility was not known at the time.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBST-014').status, 'pass');
});

test('R-PA-BCBST-015 does not require a signed order on every DME request', () => {
  const text = 'Blue Cross Blue Shield of Tennessee member.\nDME request for E0601. Diagnosis: G47.33. Estimated duration: 12 months.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBST-015').status, 'pass');
});

test('R-PA-BCBST-015 advises when a DME request lacks diagnosis or expected-use context', () => {
  const text = 'Blue Cross Blue Shield of Tennessee member.\nDME request for E0601.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBST-015').status, 'info');
});

test('R-PA-BCBST-015 accepts diagnosis and use-capability documentation', () => {
  const text = 'Blue Cross Blue Shield of Tennessee member.\nWheelchair request. Diagnosis: G82.20. Member can use the equipment independently.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBST-015').status, 'pass');
});

test('R-PA-BCBST-016 does not infer a higher-level request from generic behavioral-health text', () => {
  const text = 'Blue Cross Blue Shield of Tennessee member.\nBehavioral health outpatient follow-up requested.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBST-016').status, 'pass');
});

test('R-PA-BCBST-016 flags an explicit psychiatric authorization without acuity or risk', () => {
  const text = 'Blue Cross Blue Shield of Tennessee member.\nPsychiatric Clinical Service Authorization.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBST-016').status, 'flag');
});

test('R-PA-BCBST-016 accepts presenting acuity and safety-risk documentation', () => {
  const text = 'Blue Cross Blue Shield of Tennessee member.\nPsychiatric Clinical Service Authorization. Presenting problem: acute mania. Danger to self or others: no.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBST-016').status, 'pass');
});

test('R-PA-BCBST-017 does not require Blue Distinction routing', () => {
  const text = 'Blue Cross Blue Shield of Tennessee member.\nKidney transplant request. History and physical attached. Psychosocial evaluation attached.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBST-017').status, 'pass');
});

test('R-PA-BCBST-017 does not infer a request from transplant history', () => {
  const text = 'Blue Cross Blue Shield of Tennessee member.\nHistory of kidney transplant noted in the clinical record.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBST-017').status, 'pass');
});

test('R-PA-BCBST-017 flags a transplant request missing either required evaluation', () => {
  const text = 'Blue Cross Blue Shield of Tennessee member.\nKidney transplant request. History and physical attached.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBST-017').status, 'flag');
});

test('R-PA-BCBST-017 accepts both transplant evaluations', () => {
  const text = 'Blue Cross Blue Shield of Tennessee member.\nStem cell transplant request. H&P: attached. Psychosocial assessment attached.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBST-017').status, 'pass');
});

test('R-PA-BCBST-018 does not infer a medical-policy appeal from clinical-trial wording', () => {
  const text = 'Blue Cross Blue Shield of Tennessee member.\nClinical trial participation noted in the history.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBST-018').status, 'pass');
});

test('R-PA-BCBST-018 flags a medical-policy appeal without full-text evidence', () => {
  const text = 'Blue Cross Blue Shield of Tennessee member.\nMedical policy appeal requested.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBST-018').status, 'flag');
});

test('R-PA-BCBST-018 accepts full-text peer-reviewed research', () => {
  const text = 'Blue Cross Blue Shield of Tennessee member.\nMedical policy appeal requested. Full-text peer-reviewed studies attached.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBST-018').status, 'pass');
});

test('R-PA-BCBST-019 does not infer the UM workflow from a generic appeal', () => {
  const text = 'Blue Cross Blue Shield of Tennessee member.\nClaim appeal submitted.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBST-019').status, 'pass');
});

test('R-PA-BCBST-019 flags a commercial UM appeal missing required attachments', () => {
  const text = 'Blue Cross Blue Shield of Tennessee member.\nCommercial Utilization Management Appeal.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBST-019').status, 'flag');
});

test('R-PA-BCBST-019 accepts the denial letter and clinical documentation', () => {
  const text = 'Blue Cross Blue Shield of Tennessee member.\nCommercial Utilization Management Appeal. Denial letter attached. Clinical documentation attached.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBST-019').status, 'pass');
});

test('R-PA-BCBST-020 does not require a rationale for generic out-of-network text', () => {
  const text = 'Blue Cross Blue Shield of Tennessee member.\nOut-of-network prior authorization request.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBST-020').status, 'pass');
});

test('R-PA-BCBST-020 advises when an in-network-benefit request omits its rationale', () => {
  const text = 'Blue Cross Blue Shield of Tennessee member.\nOut-of-network provider requesting in-network benefits.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBST-020').status, 'info');
});

test('R-PA-BCBST-020 accepts an attached out-of-network rationale', () => {
  const text = 'Blue Cross Blue Shield of Tennessee member.\nOut-of-network provider requesting in-network benefits. Rationale attached.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBST-020').status, 'pass');
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

test('R-PA-BCBSMA-001 does not require a policy citation on every request', () => {
  const text = 'Blue Cross Blue Shield of Massachusetts member.\nRequested procedure: CPT 72148. Please authorize.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSMA-001').status, 'pass');
});

test('R-PA-BCBSMA-001 advises when an explicitly relied-on policy is unidentified', () => {
  const text = 'Blue Cross Blue Shield of Massachusetts member.\nMedical necessity per medical policy.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSMA-001').status, 'info');
});

test('R-PA-BCBSMA-001 accepts an identified policy rationale', () => {
  const text = 'Blue Cross Blue Shield of Massachusetts member.\nPer medical policy criteria. Medical Policy: 123.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSMA-001').status, 'pass');
});

test('R-PA-BCBSMA-002 does not run without an identifiable authorization request', () => {
  const text = 'Blue Cross Blue Shield of Massachusetts member.\nEligibility inquiry only.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSMA-002').status, 'pass');
});

test('R-PA-BCBSMA-002 advises when a request has no clinical document', () => {
  const text = 'Blue Cross Blue Shield of Massachusetts member.\nRequested procedure: CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSMA-002').status, 'info');
});

test('R-PA-BCBSMA-002 accepts an attached clinical note', () => {
  const texts = [
    'Blue Cross Blue Shield of Massachusetts member.\nPrior authorization request for CPT 27447.\n',
    'Clinical note\nHistory and physical exam support the requested service.\n',
  ];
  const findings = runEngine(bundleOf(texts));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSMA-002').status, 'pass');
});

test('R-PA-BCBSMA-003 does not require a channel inside the clinical packet', () => {
  const text = 'Blue Cross Blue Shield of Massachusetts member.\nPrior authorization request for CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSMA-003').status, 'pass');
});

test('R-PA-BCBSMA-003 remains satisfied when Authorization Manager is named', () => {
  const text = 'Blue Cross Blue Shield of Massachusetts member.\nSubmitted through Authorization Manager.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSMA-003').status, 'pass');
});

test('R-PA-BCBSMA-003 remains satisfied when Carelon routing is named', () => {
  const text = 'Blue Cross Blue Shield of Massachusetts member.\nCarelon submission for genetic testing.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSMA-003').status, 'pass');
});

test('R-PA-BCBSMA-004 does not infer authorization status from a CPT code', () => {
  const text = 'Blue Cross Blue Shield of Massachusetts member.\nRequested procedure: CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSMA-004').status, 'pass');
});

test('R-PA-BCBSMA-004 remains informational without a bundled member-benefit list', () => {
  const text = 'Blue Cross Blue Shield of Massachusetts member.\nAuthorization requirement unknown.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSMA-004').status, 'pass');
});

test('R-PA-BCBSMA-005 does not require a future reference on an initial request', () => {
  const text = 'Blue Cross Blue Shield of Massachusetts member.\nPrior authorization required for CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSMA-005').status, 'pass');
});

test('R-PA-BCBSMA-005 advises when claimed approval omits its reference', () => {
  const text = 'Blue Cross Blue Shield of Massachusetts member.\nPrior authorization approved.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSMA-005').status, 'info');
});

test('R-PA-BCBSMA-005 accepts a claimed approval with its reference', () => {
  const text = 'Blue Cross Blue Shield of Massachusetts member.\nPrior authorization approved. Authorization number: MA-1234.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSMA-005').status, 'pass');
});

test('R-PA-BCBSMA-006 does not treat an initial inpatient request as continued stay', () => {
  const text = 'Blue Cross Blue Shield of Massachusetts member.\nInitial inpatient admission request. Place of service: 21.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSMA-006').status, 'pass');
});

test('R-PA-BCBSMA-006 advises when an explicit continued-stay request lacks a clinical update', () => {
  const text = 'Blue Cross Blue Shield of Massachusetts member.\nContinued stay request for 2 additional inpatient days.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSMA-006').status, 'info');
});

test('R-PA-BCBSMA-006 accepts a continued-stay request with a current clinical update', () => {
  const text = 'Blue Cross Blue Shield of Massachusetts member.\nContinued stay request. Current clinical status and response to treatment documented.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSMA-006').status, 'pass');
});

test('R-PA-BCBSMA-007 does not infer high-tech imaging scope from a radiology CPT alone', () => {
  const text = 'Blue Cross Blue Shield of Massachusetts member.\nRequested procedure: CPT 71046.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSMA-007').status, 'pass');
});

test('R-PA-BCBSMA-007 does not apply the outpatient check to explicit inpatient imaging', () => {
  const text = 'Blue Cross Blue Shield of Massachusetts member.\nInpatient MRI requested. Place of service: 21.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSMA-007').status, 'pass');
});

test('R-PA-BCBSMA-007 flags an outpatient MRI with no clinical indication', () => {
  const text = 'Blue Cross Blue Shield of Massachusetts member.\nRequested: MRI lumbar spine, CPT 72148.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSMA-007').status, 'flag');
});

test('R-PA-BCBSMA-007 accepts high-tech imaging with a clinical indication', () => {
  const text = 'Blue Cross Blue Shield of Massachusetts member.\nMRI lumbar spine. Clinical indication: persistent radiculopathy.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSMA-007').status, 'pass');
});

test('R-PA-BCBSMA-008 accepts an urgent workflow attestation without duplicate narrative', () => {
  const text = 'Blue Cross Blue Shield of Massachusetts member.\nUrgent request.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSMA-008').status, 'pass');
});

test('R-PA-BCBSMA-008 also accepts a documented clinical urgency', () => {
  const text = 'Blue Cross Blue Shield of Massachusetts member.\nExpedited review requested: delay would jeopardize the member\'s life or health.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSMA-008').status, 'pass');
});

test('R-PA-BCBSMA-009 does not infer an exception from surgery and hospital POS alone', () => {
  const text = 'Blue Cross Blue Shield of Massachusetts member.\nRequested surgery CPT 27447. Place of service: 22.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSMA-009').status, 'pass');
});

test('R-PA-BCBSMA-009 advises when an explicit hospital site exception lacks rationale', () => {
  const text = 'Blue Cross Blue Shield of Massachusetts member.\nHospital outpatient exception requested.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSMA-009').status, 'info');
});

test('R-PA-BCBSMA-009 accepts an explicit hospital site exception with rationale', () => {
  const text = 'Blue Cross Blue Shield of Massachusetts member.\nHospital outpatient exception requested because the patient requires hospital monitoring.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSMA-009').status, 'pass');
});

test('R-PA-BCBSMA-010 does not require medication fields outside a medication request', () => {
  const text = 'Blue Cross Blue Shield of Massachusetts member.\nEligibility inquiry only.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSMA-010').status, 'pass');
});

test('R-PA-BCBSMA-010 does not accept an NDC in place of required medication details', () => {
  const text = 'Blue Cross Blue Shield of Massachusetts member.\nMedication prior authorization. NDC 00000-0000-00.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSMA-010').status, 'info');
});

test('R-PA-BCBSMA-010 accepts the current medication-form details without an NDC', () => {
  const text = 'Blue Cross Blue Shield of Massachusetts member.\nMedication prior authorization. Medication being requested: Examplemab. Strength: 100 mg. Quantity: 2. Dosing schedule: weekly. Length of therapy: 3 months.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSMA-010').status, 'pass');
});

test('R-PA-BCBSMA-011 does not infer step therapy from a J-code', () => {
  const text = 'Blue Cross Blue Shield of Massachusetts member.\nMedication request: HCPCS J0123.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSMA-011').status, 'pass');
});

test('R-PA-BCBSMA-011 advises when an explicit step requirement has no prior-therapy context', () => {
  const text = 'Blue Cross Blue Shield of Massachusetts member.\nStep therapy required for the requested medication.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSMA-011').status, 'info');
});

test('R-PA-BCBSMA-011 accepts a prior therapy for an explicit step requirement', () => {
  const text = 'Blue Cross Blue Shield of Massachusetts member.\nStep therapy required. Prior therapy tried and failed.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSMA-011').status, 'pass');
});

test('R-PA-BCBSMA-012 does not infer Carelon genetic scope from an 81xxx code alone', () => {
  const text = 'Blue Cross Blue Shield of Massachusetts member.\nRequested procedure: CPT 81455.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSMA-012').status, 'pass');
});

test('R-PA-BCBSMA-012 reports each missing Carelon genetic request field', () => {
  const text = 'Blue Cross Blue Shield of Massachusetts member.\nGenetic testing authorization request.\n';
  const findings = runEngine(bundleOf(text));
  const finding = findings.find((x) => x.ruleId === 'R-PA-BCBSMA-012');
  assert.equal(finding.status, 'flag');
  assert.match(finding.note, /specific test, performing laboratory, clinical indication/);
});

test('R-PA-BCBSMA-012 accepts a complete Carelon genetic request', () => {
  const text = 'Blue Cross Blue Shield of Massachusetts member.\nGenetic testing request. Test requested: hereditary cancer panel. Performing laboratory: Example Lab. Clinical indication: personal history of breast cancer.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSMA-012').status, 'pass');
});

test('R-PA-BCBSMA-013 does not infer cancer-program scope from infusion or a J-code', () => {
  const text = 'Blue Cross Blue Shield of Massachusetts member.\nInfusion request for HCPCS J0123.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSMA-013').status, 'pass');
});

test('R-PA-BCBSMA-013 flags an identified outpatient oncology request without diagnosis', () => {
  const text = 'Blue Cross Blue Shield of Massachusetts member.\nOutpatient oncology authorization request.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSMA-013').status, 'flag');
});

test('R-PA-BCBSMA-013 accepts an outpatient oncology request with diagnosis', () => {
  const text = 'Blue Cross Blue Shield of Massachusetts member.\nOutpatient oncology authorization request. Patient diagnosis: C50.919.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSMA-013').status, 'pass');
});

test('R-PA-BCBSMA-014 does not run on a prospective request', () => {
  const text = 'Blue Cross Blue Shield of Massachusetts member.\nProspective authorization request.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSMA-014').status, 'pass');
});

test('R-PA-BCBSMA-014 advises when an explicit retro request gives no reason', () => {
  const text = 'Blue Cross Blue Shield of Massachusetts member.\nRetrospective authorization request.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSMA-014').status, 'info');
});

test('R-PA-BCBSMA-014 accepts a case-specific retro reason', () => {
  const text = 'Blue Cross Blue Shield of Massachusetts member.\nRetrospective authorization requested because the payer portal was unavailable.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSMA-014').status, 'pass');
});

test('R-PA-BCBSMA-015 does not infer a signed-order requirement from DME context', () => {
  const text = 'Blue Cross Blue Shield of Massachusetts member.\nWheelchair request, HCPCS E1234.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSMA-015').status, 'pass');
});

test('R-PA-BCBSMA-015 advises when a declared signed-order requirement lacks signature evidence', () => {
  const text = 'Blue Cross Blue Shield of Massachusetts member.\nSigned written order required for this request.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSMA-015').status, 'info');
});

test('R-PA-BCBSMA-015 accepts signature evidence for a declared requirement', () => {
  const text = 'Blue Cross Blue Shield of Massachusetts member.\nSigned written order required. Electronically signed by Example Clinician.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSMA-015').status, 'pass');
});

test('R-PA-BCBSMA-016 does not trigger on generic mental-health context', () => {
  const text = 'Blue Cross Blue Shield of Massachusetts member.\nMental health office visit request.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSMA-016').status, 'pass');
});

test('R-PA-BCBSMA-016 advises when an intensive setting lacks clinical support', () => {
  const text = 'Blue Cross Blue Shield of Massachusetts member.\nPartial hospitalization request.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSMA-016').status, 'info');
});

test('R-PA-BCBSMA-016 accepts clinical support for an intensive setting', () => {
  const text = 'Blue Cross Blue Shield of Massachusetts member.\nPartial hospitalization request. Current symptoms: escalating self-harm risk.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSMA-016').status, 'pass');
});

test('R-PA-BCBSMA-017 does not infer a designated-center requirement from transplant context', () => {
  const text = 'Blue Cross Blue Shield of Massachusetts member.\nRequested service: kidney transplant.\nMedical necessity per Medical Policy.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSMA-017').status, 'pass');
});

test('R-PA-BCBSMA-017 advises when a declared designated-center requirement lacks routing', () => {
  const text = 'Blue Cross Blue Shield of Massachusetts member.\nBlue Distinction Center required for this transplant.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSMA-017').status, 'info');
});

test('R-PA-BCBSMA-017 accepts a selected center for a declared requirement', () => {
  const text = 'Blue Cross Blue Shield of Massachusetts member.\nBlue Distinction Center required. Selected transplant center: Example Medical Center.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSMA-017').status, 'pass');
});

test('R-PA-BCBSMA-018 does not infer experimental status from off-label context', () => {
  const text = 'Blue Cross Blue Shield of Massachusetts member.\nOff-label treatment discussed with the patient.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSMA-018').status, 'pass');
});

test('R-PA-BCBSMA-018 advises when an explicit classification lacks its basis', () => {
  const text = 'Blue Cross Blue Shield of Massachusetts member.\nService denied as investigational.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSMA-018').status, 'info');
});

test('R-PA-BCBSMA-018 accepts the policy basis for an explicit classification', () => {
  const text = 'Blue Cross Blue Shield of Massachusetts member.\nService denied as investigational under Medical Policy 999.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSMA-018').status, 'pass');
});

test('R-PA-BCBSMA-019 does not trigger on generic appeal language', () => {
  const text = 'Blue Cross Blue Shield of Massachusetts member.\nAppeal of a claim payment.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSMA-019').status, 'pass');
});

test('R-PA-BCBSMA-019 advises when an authorization appeal lacks the original case', () => {
  const text = 'Blue Cross Blue Shield of Massachusetts member.\nPrior authorization appeal.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSMA-019').status, 'info');
});

test('R-PA-BCBSMA-019 accepts an original-case reference', () => {
  const text = 'Blue Cross Blue Shield of Massachusetts member.\nPrior authorization appeal. Case number: PA-1234.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSMA-019').status, 'pass');
});

test('R-PA-BCBSMA-020 does not infer an exception from ordinary out-of-network context', () => {
  const text = 'Blue Cross Blue Shield of Massachusetts member.\nOut-of-network prior authorization request.\nProcedure CPT 70551.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSMA-020').status, 'pass');
});

test('R-PA-BCBSMA-020 advises when an explicit exception lacks a qualifying reason', () => {
  const text = 'Blue Cross Blue Shield of Massachusetts member.\nOut-of-network exception request.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSMA-020').status, 'info');
});

test('R-PA-BCBSMA-020 accepts a qualifying reason from the current form', () => {
  const text = 'Blue Cross Blue Shield of Massachusetts member.\nOut-of-network exception request. No network provider available in the member\'s area.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSMA-020').status, 'pass');
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

test('R-PA-BCBSAL-001 advises when a coded request has no coverage-criterion reference', () => {
  const text = 'Blue Cross Blue Shield of Alabama member.\n'
    + 'Requested procedure: CPT 72148 (MRI lumbar spine).\n'
    + 'Please authorize.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BCBSAL-001');
  assert.equal(f.status, 'info');
});

test('R-PA-BCBSAL-001 passes when the BCBSAL packet cites the applicable Medical Policy', () => {
  const text = 'Blue Cross Blue Shield of Alabama member.\n'
    + 'Requested procedure: CPT 72148.\n'
    + 'Medical necessity per the applicable BCBSAL Medical Policy (MCG).\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BCBSAL-001');
  assert.equal(f.status, 'pass');
});

test('R-PA-BCBSAL-001 does not ask for criteria when no procedure is identified', () => {
  const text = 'Blue Cross Blue Shield of Alabama member.\nGeneral precertification question.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSAL-001').status, 'pass');
});

test('R-PA-BCBSAL-002 advises when a BCBSAL packet has no clinical document', () => {
  const text = 'Blue Cross Blue Shield of Alabama member.\nRequested procedure: CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BCBSAL-002');
  assert.equal(f.status, 'info');
});

test('R-PA-BCBSAL-002 accepts a recognized clinical document', () => {
  const text = 'Blue Cross Blue Shield of Alabama member.\nHPI: progressive knee pain. Assessment and plan: total knee arthroplasty, CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSAL-002').status, 'pass');
});

test('R-PA-BCBSAL-003 does not require the transport channel in packet content', () => {
  const text = 'Blue Cross Blue Shield of Alabama member.\nProcedure CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSAL-003').status, 'pass');
});

test('R-PA-BCBSAL-003 also passes when the packet names ProviderAccess', () => {
  const text = 'Blue Cross Blue Shield of Alabama member.\nSubmitted via the ProviderAccess provider portal.\nProcedure CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BCBSAL-003');
  assert.equal(f.status, 'pass');
});

test('R-PA-BCBSAL-004 remains non-enforcing without member-specific eligibility data', () => {
  const text = 'Blue Cross Blue Shield of Alabama member.\nProcedure CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSAL-004').status, 'pass');
});

test('R-PA-BCBSAL-005 does not expect an authorization number on an initial request', () => {
  const text = 'Blue Cross Blue Shield of Alabama member.\nPrior authorization required for CPT 27447. Initial request.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSAL-005').status, 'pass');
});

test('R-PA-BCBSAL-005 advises when a completed submission lacks its reference', () => {
  const text = 'Blue Cross Blue Shield of Alabama member.\nPrecertification submitted.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSAL-005').status, 'info');
});

test('R-PA-BCBSAL-005 accepts a completed submission reference', () => {
  const text = 'Blue Cross Blue Shield of Alabama member.\nPrecertification submitted. Reference number: AL-1234.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSAL-005').status, 'pass');
});

test('R-PA-BCBSAL-006 does not infer continued-stay review from an inpatient setting', () => {
  const text = 'Blue Cross Blue Shield of Alabama member.\nInitial inpatient admission request. Place of service: 21.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSAL-006').status, 'pass');
});

test('R-PA-BCBSAL-006 advises when an explicit continued-stay request has no current update', () => {
  const text = 'Blue Cross Blue Shield of Alabama member.\nContinued stay request for 2 additional days.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSAL-006').status, 'info');
});

test('R-PA-BCBSAL-006 accepts a continued-stay request with a clinical update', () => {
  const text = 'Blue Cross Blue Shield of Alabama member.\nContinued stay request. Clinical update: improving on IV therapy; expected discharge tomorrow.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSAL-006').status, 'pass');
});

test('R-PA-BCBSAL-007 does not infer advanced imaging from an arbitrary 7xxxx CPT', () => {
  const text = 'Blue Cross Blue Shield of Alabama member.\nRequested plain radiograph, CPT 73030.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSAL-007').status, 'pass');
});

test('R-PA-BCBSAL-007 flags a BCBSAL outpatient MRI with no clinical indication', () => {
  const text = 'Blue Cross Blue Shield of Alabama member.\nRequested: MRI lumbar spine, CPT 72148.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BCBSAL-007');
  assert.equal(f.status, 'flag');
});

test('R-PA-BCBSAL-007 accepts excluded emergency, observation, and inpatient imaging', () => {
  for (const setting of ['Emergency department, place of service: 23.', 'Observation status.', 'Inpatient admission, place of service: 21.']) {
    const text = 'Blue Cross Blue Shield of Alabama member.\n' + setting + ' Requested MRI lumbar spine.\n';
    const findings = runEngine(bundleOf(text));
    assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSAL-007').status, 'pass', setting);
  }
});

test('R-PA-BCBSAL-007 accepts outpatient advanced imaging with an indication', () => {
  const text = 'Blue Cross Blue Shield of Alabama member.\nRequested MRI lumbar spine. Clinical indication: progressive radiculopathy.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSAL-007').status, 'pass');
});

test('R-PA-BCBSAL-008 does not apply Blue Advantage language to another BCBSAL product', () => {
  const text = 'Blue Cross Blue Shield of Alabama commercial member.\nExpedited review requested.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSAL-008').status, 'pass');
});

test('R-PA-BCBSAL-008 advises when a Blue Advantage expedited request lacks urgency support', () => {
  const text = 'Blue Cross Blue Shield of Alabama Blue Advantage member.\nExpedited review requested.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSAL-008').status, 'info');
});

test('R-PA-BCBSAL-008 passes when an expedited Blue Advantage request documents urgency', () => {
  const text = 'Blue Cross Blue Shield of Alabama Blue Advantage member.\nExpedited review requested: delay would jeopardize the member\'s life or health.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BCBSAL-008');
  assert.equal(f.status, 'pass');
});

test('R-PA-BCBSAL-009 does not infer a site exception from outpatient hospital surgery', () => {
  const text = 'Blue Cross Blue Shield of Alabama member.\nCPT 27447 requested at place of service 22.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSAL-009').status, 'pass');
});

test('R-PA-BCBSAL-009 advises when a declared site exception lacks rationale', () => {
  const text = 'Blue Cross Blue Shield of Alabama member.\nHospital outpatient exception required.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSAL-009').status, 'info');
});

test('R-PA-BCBSAL-009 accepts a declared site exception with rationale', () => {
  const text = 'Blue Cross Blue Shield of Alabama member.\nHospital outpatient exception required because the patient requires hospital monitoring for higher acuity.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSAL-009').status, 'pass');
});

test('R-PA-BCBSAL-010 does not infer an NDC requirement from a J-code', () => {
  const text = 'Blue Cross Blue Shield of Alabama member.\nPhysician-administered drug request, HCPCS J0123.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSAL-010').status, 'pass');
});

test('R-PA-BCBSAL-010 advises when a declared NDC requirement has no code', () => {
  const text = 'Blue Cross Blue Shield of Alabama member.\nNDC required for this request.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSAL-010').status, 'info');
});

test('R-PA-BCBSAL-010 accepts a formatted NDC for a declared requirement', () => {
  const text = 'Blue Cross Blue Shield of Alabama member.\nNDC required for this request. NDC: 12345-6789-01.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSAL-010').status, 'pass');
});

test('R-PA-BCBSAL-011 does not infer step therapy from a J-code drug request', () => {
  const text = 'Blue Cross Blue Shield of Alabama member.\nSpecialty drug request, HCPCS J0123.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSAL-011').status, 'pass');
});

test('R-PA-BCBSAL-011 advises when explicit step therapy lacks a trial or exception', () => {
  const text = 'Blue Cross Blue Shield of Alabama member.\nThe requested product requires step therapy.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSAL-011').status, 'info');
});

test('R-PA-BCBSAL-011 accepts an explicit step-therapy exception basis', () => {
  const text = 'Blue Cross Blue Shield of Alabama member.\nThe requested product requires step therapy. Contraindication to the preferred product is documented.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSAL-011').status, 'pass');
});

test('R-PA-BCBSAL-012 does not infer Carelon scope from a genetic code alone', () => {
  const text = 'Blue Cross Blue Shield of Alabama member.\nRequested genetic test, CPT 81211.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSAL-012').status, 'pass');
});

test('R-PA-BCBSAL-012 advises when an explicit genetic precertification lacks details', () => {
  const text = 'Blue Cross Blue Shield of Alabama member.\nCarelon genetic testing precertification requested.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSAL-012').status, 'info');
});

test('R-PA-BCBSAL-012 accepts a genetic precertification with the test and indication', () => {
  const text = 'Blue Cross Blue Shield of Alabama member.\nCarelon genetic testing precertification. Test requested: BRCA1/2 panel. Clinical indication: personal history of breast cancer.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSAL-012').status, 'pass');
});

test('R-PA-BCBSAL-013 does not infer provider-administered drug program scope from a J-code', () => {
  const text = 'Blue Cross Blue Shield of Alabama member.\nInfusion request, HCPCS J0123.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSAL-013').status, 'pass');
});

test('R-PA-BCBSAL-013 advises when an explicit provider-administered drug review lacks a diagnosis', () => {
  const text = 'Blue Cross Blue Shield of Alabama member.\nProvider-administered drug precertification requested. Diagnosis: \n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSAL-013').status, 'info');
});

test('R-PA-BCBSAL-013 accepts provider-administered drug review with a diagnosis', () => {
  const text = 'Blue Cross Blue Shield of Alabama member.\nProvider-administered drug precertification requested. Diagnosis: rheumatoid arthritis, ICD-10 M06.9.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSAL-013').status, 'pass');
});

test('R-PA-BCBSAL-014 does not invent universal exceptions for retrospective review', () => {
  const text = 'Blue Cross Blue Shield of Alabama member.\nRetrospective authorization requested for a service already rendered.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSAL-014').status, 'pass');
});

test('R-PA-BCBSAL-015 does not apply the home-health packet to DME', () => {
  const text = 'Blue Cross Blue Shield of Alabama member.\nDurable medical equipment request for wheelchair E1234.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSAL-015').status, 'pass');
});

test('R-PA-BCBSAL-015 flags incomplete initial home-health certification', () => {
  const text = 'Blue Cross Blue Shield of Alabama member.\nInitial home health certification requested.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSAL-015').status, 'flag');
});

test('R-PA-BCBSAL-015 accepts the complete initial home-health packet', () => {
  const text = 'Blue Cross Blue Shield of Alabama member.\nInitial home health certification. Start-of-care assessment attached. Plan of treatment attached. Medication list attached. Attending physician signature: /s/ Dr. Smith.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSAL-015').status, 'pass');
});

test('R-PA-BCBSAL-016 does not infer intensive review from generic mental-health context', () => {
  const text = 'Blue Cross Blue Shield of Alabama member.\nMental health counseling request.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSAL-016').status, 'pass');
});

test('R-PA-BCBSAL-016 advises when an intensive behavioral-health request lacks clinical support', () => {
  const text = 'Blue Cross Blue Shield of Alabama member.\nPartial hospitalization requested.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSAL-016').status, 'info');
});

test('R-PA-BCBSAL-016 accepts clinical support for an intensive behavioral-health setting', () => {
  const text = 'Blue Cross Blue Shield of Alabama member.\nPartial hospitalization requested. Current symptoms: escalating depression. Safety risk and functional impairment documented.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSAL-016').status, 'pass');
});

test('R-PA-BCBSAL-017 does not infer designated-center routing from a transplant request', () => {
  const text = 'Blue Cross Blue Shield of Alabama member.\nRequested service: kidney transplant.\nMedical necessity per Medical Policy.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSAL-017').status, 'pass');
});

test('R-PA-BCBSAL-017 advises when an explicit designated-center requirement lacks the center', () => {
  const text = 'Blue Cross Blue Shield of Alabama member.\nKidney transplant request. Blue Distinction Center required.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSAL-017').status, 'info');
});

test('R-PA-BCBSAL-017 accepts an identified transplant center', () => {
  const text = 'Blue Cross Blue Shield of Alabama member.\nKidney transplant request. Blue Distinction Center required. Selected transplant center: UAB Hospital.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSAL-017').status, 'pass');
});

test('R-PA-BCBSAL-018 does not infer an investigational classification from off-label use', () => {
  const text = 'Blue Cross Blue Shield of Alabama member.\nOff-label medication use requested with supporting literature.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSAL-018').status, 'pass');
});

test('R-PA-BCBSAL-018 advises when an explicit classification lacks its policy basis', () => {
  const text = 'Blue Cross Blue Shield of Alabama member.\nThe service was denied as investigational.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSAL-018').status, 'info');
});

test('R-PA-BCBSAL-018 accepts the policy basis for an explicit classification', () => {
  const text = 'Blue Cross Blue Shield of Alabama member.\nThe service was denied as investigational under Medical Policy MP-123.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSAL-018').status, 'pass');
});

test('R-PA-BCBSAL-019 does not treat a generic claim appeal as a preservice appeal', () => {
  const text = 'Blue Cross Blue Shield of Alabama member.\nClaim payment appeal and grievance submitted.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSAL-019').status, 'pass');
});

test('R-PA-BCBSAL-019 advises when a preservice appeal lacks the original case', () => {
  const text = 'Blue Cross Blue Shield of Alabama member.\nPreservice appeal of the adverse determination.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSAL-019').status, 'info');
});

test('R-PA-BCBSAL-019 accepts a preservice appeal with the original case', () => {
  const text = 'Blue Cross Blue Shield of Alabama member.\nPreservice appeal. Original determination case number PA-12345.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSAL-019').status, 'pass');
});

test('R-PA-BCBSAL-020 does not infer an exception workflow from ordinary out-of-network context', () => {
  const text = 'Blue Cross Blue Shield of Alabama member.\nOut-of-network prior authorization request.\nProcedure CPT 70551.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSAL-020').status, 'pass');
});

test('R-PA-BCBSAL-020 advises when an explicit exception lacks its reason', () => {
  const text = 'Blue Cross Blue Shield of Alabama member.\nOut-of-network exception request.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSAL-020').status, 'info');
});

test('R-PA-BCBSAL-020 accepts a documented exception reason', () => {
  const text = 'Blue Cross Blue Shield of Alabama member.\nOut-of-network exception request. No in-network provider offers the required service.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSAL-020').status, 'pass');
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

test('R-PA-BCBSSC-001 advises when a coded request has no coverage-criteria reference', () => {
  const text = 'Blue Cross Blue Shield of South Carolina member.\n'
    + 'Requested procedure: CPT 72148 (MRI lumbar spine).\n'
    + 'Please authorize.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BCBSSC-001');
  assert.equal(f.status, 'info');
});

test('R-PA-BCBSSC-001 passes when the BCBSSC packet cites the applicable Medical Policy', () => {
  const text = 'Blue Cross Blue Shield of South Carolina member.\n'
    + 'Requested procedure: CPT 72148.\n'
    + 'Medical necessity per the applicable BCBSSC Medical Policy (MCG).\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BCBSSC-001');
  assert.equal(f.status, 'pass');
});

test('R-PA-BCBSSC-002 advises when a BCBSSC packet has no clinical document attached', () => {
  const text = 'Blue Cross Blue Shield of South Carolina member.\nRequested procedure: CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BCBSSC-002');
  assert.equal(f.status, 'info');
});

test('R-PA-BCBSSC-002 accepts a request-specific clinical document', () => {
  const text = 'Blue Cross Blue Shield of South Carolina member.\nRequested procedure: CPT 27447.\nMedical necessity letter with current symptoms attached.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSSC-002').status, 'pass');
});

test('R-PA-BCBSSC-003 does not require the packet to record its submission channel', () => {
  const text = 'Blue Cross Blue Shield of South Carolina member.\nProcedure CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSSC-003').status, 'pass');
});

test('R-PA-BCBSSC-004 remains non-enforcing without a member-specific lookup', () => {
  const text = 'Blue Cross Blue Shield of South Carolina member.\nProcedure CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSSC-004').status, 'pass');
});

test('R-PA-BCBSSC-005 does not expect an authorization number on an initial request', () => {
  const text = 'Blue Cross Blue Shield of South Carolina member.\nPrior authorization required for CPT 27447. Initial request.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSSC-005').status, 'pass');
});

test('R-PA-BCBSSC-005 advises when a completed submission lacks a confirmation reference', () => {
  const text = 'Blue Cross Blue Shield of South Carolina member.\nPrior authorization submitted for CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSSC-005').status, 'info');
});

test('R-PA-BCBSSC-005 accepts a completed submission with a case reference', () => {
  const text = 'Blue Cross Blue Shield of South Carolina member.\nPrior authorization submitted for CPT 27447. Case number PA-12345.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSSC-005').status, 'pass');
});

test('R-PA-BCBSSC-006 does not infer continued-stay review from inpatient context', () => {
  const text = 'Blue Cross Blue Shield of South Carolina member.\nInpatient admission, POS 21.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSSC-006').status, 'pass');
});

test('R-PA-BCBSSC-006 advises when an explicit continued-stay review lacks required workflow details', () => {
  const text = 'Blue Cross Blue Shield of South Carolina member.\nContinued stay review requested.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSSC-006').status, 'info');
});

test('R-PA-BCBSSC-006 accepts clinical documentation and continuation confirmation', () => {
  const text = 'Blue Cross Blue Shield of South Carolina member.\nContinued stay review. Start continuation selected. Clinical update and plan of care attached.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSSC-006').status, 'pass');
});

test('R-PA-BCBSSC-007 does not infer delegated review from an outpatient MRI', () => {
  const text = 'Blue Cross Blue Shield of South Carolina member.\nRequested: MRI lumbar spine, CPT 72148.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSSC-007').status, 'pass');
});

test('R-PA-BCBSSC-007 advises when delegated advanced-radiology review lacks an indication', () => {
  const text = 'Blue Cross Blue Shield of South Carolina member.\nEvolent advanced radiology authorization for MRI lumbar spine.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSSC-007').status, 'info');
});

test('R-PA-BCBSSC-007 accepts a delegated request with a clinical indication', () => {
  const text = 'Blue Cross Blue Shield of South Carolina member.\nEvolent advanced radiology authorization. MRI lumbar spine. Clinical indication: persistent radiculopathy.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSSC-007').status, 'pass');
});

test('R-PA-BCBSSC-008 advises when an expedited request lacks clinical urgency', () => {
  const text = 'Blue Cross Blue Shield of South Carolina member.\nExpedited authorization requested.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSSC-008').status, 'info');
});

test('R-PA-BCBSSC-008 passes when an expedited BCBSSC request documents the clinical urgency', () => {
  const text = 'Blue Cross Blue Shield of South Carolina member.\nExpedited review requested: delay would jeopardize the member\'s life or health.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BCBSSC-008');
  assert.equal(f.status, 'pass');
});

test('R-PA-BCBSSC-009 does not infer a site-of-care rule from hospital-outpatient surgery', () => {
  const text = 'Blue Cross Blue Shield of South Carolina member.\nHospital outpatient surgery, POS 22, CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSSC-009').status, 'pass');
});

test('R-PA-BCBSSC-009 advises when an explicit drug site-of-care requirement lacks a site', () => {
  const text = 'Blue Cross Blue Shield of South Carolina member.\nSpecialty drug site-of-care review required.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSSC-009').status, 'info');
});

test('R-PA-BCBSSC-009 accepts a selected specialty-drug administration site', () => {
  const text = 'Blue Cross Blue Shield of South Carolina member.\nSpecialty drug site-of-care review required. Administration site: physician office.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSSC-009').status, 'pass');
});

test('R-PA-BCBSSC-010 does not infer an NDC requirement from a J-code', () => {
  const text = 'Blue Cross Blue Shield of South Carolina member.\nInfusion request, HCPCS J0123.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSSC-010').status, 'pass');
});

test('R-PA-BCBSSC-010 advises when an explicit NDC requirement lacks a formatted code', () => {
  const text = 'Blue Cross Blue Shield of South Carolina member.\nNDC required for this drug request.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSSC-010').status, 'info');
});

test('R-PA-BCBSSC-010 accepts a formatted NDC for an explicit requirement', () => {
  const text = 'Blue Cross Blue Shield of South Carolina member.\nNDC required: 0002-7597-01.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSSC-010').status, 'pass');
});

test('R-PA-BCBSSC-011 does not infer step therapy from a J-code or specialty-drug request', () => {
  const findings = runEngine(bundleOf('Blue Cross Blue Shield of South Carolina member.\nSpecialty drug infusion, HCPCS J0123.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSSC-011').status, 'pass');
});

test('R-PA-BCBSSC-011 advises when an explicit step-therapy requirement lacks trial evidence', () => {
  const findings = runEngine(bundleOf('Blue Cross Blue Shield of South Carolina member.\nStep therapy required for the requested drug.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSSC-011').status, 'info');
});

test('R-PA-BCBSSC-011 accepts a prerequisite trial or exception basis', () => {
  const findings = runEngine(bundleOf('Blue Cross Blue Shield of South Carolina member.\nStep therapy required. Contraindication to the preferred drug documented.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSSC-011').status, 'pass');
});

test('R-PA-BCBSSC-012 does not infer delegated laboratory review from a genetic-test code', () => {
  const findings = runEngine(bundleOf('Blue Cross Blue Shield of South Carolina member.\nGenetic testing requested, CPT 81211.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSSC-012').status, 'pass');
});

test('R-PA-BCBSSC-012 reports each missing delegated laboratory detail', () => {
  const findings = runEngine(bundleOf('Blue Cross Blue Shield of South Carolina member.\nAvalon laboratory authorization. Test requested: BRCA panel.\n'));
  const finding = findings.find((x) => x.ruleId === 'R-PA-BCBSSC-012');
  assert.equal(finding.status, 'info');
  assert.match(finding.note, /clinical indication/);
});

test('R-PA-BCBSSC-012 accepts the requested test and clinical indication', () => {
  const findings = runEngine(bundleOf('Blue Cross Blue Shield of South Carolina member.\nAvalon laboratory authorization. Test requested: BRCA panel. Clinical indication: strong family history.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSSC-012').status, 'pass');
});

test('R-PA-BCBSSC-013 does not infer medical-drug program scope from an infusion J-code', () => {
  const findings = runEngine(bundleOf('Blue Cross Blue Shield of South Carolina member.\nInfusion request, HCPCS J0123.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSSC-013').status, 'pass');
});

test('R-PA-BCBSSC-013 advises when specialty medical-drug review lacks a diagnosis', () => {
  const findings = runEngine(bundleOf('Blue Cross Blue Shield of South Carolina member.\nSpecialty medical drug authorization requested.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSSC-013').status, 'info');
});

test('R-PA-BCBSSC-013 accepts a specialty medical-drug request with a diagnosis', () => {
  const findings = runEngine(bundleOf('Blue Cross Blue Shield of South Carolina member.\nSpecialty medical drug authorization. Diagnosis: rheumatoid arthritis, ICD-10 M06.9.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSSC-013').status, 'pass');
});

test('R-PA-BCBSSC-014 advises when an explicit retrospective request lacks a reason', () => {
  const findings = runEngine(bundleOf('Blue Cross Blue Shield of South Carolina member.\nRetrospective authorization requested.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSSC-014').status, 'info');
});

test('R-PA-BCBSSC-014 accepts a request-specific retrospective reason', () => {
  const findings = runEngine(bundleOf('Blue Cross Blue Shield of South Carolina member.\nRetrospective authorization requested. Reason for retrospective review: emergency admission.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSSC-014').status, 'pass');
});

test('R-PA-BCBSSC-015 does not infer IHCS workflow from a DME code', () => {
  const findings = runEngine(bundleOf('Blue Cross Blue Shield of South Carolina member.\nWheelchair requested, HCPCS E1234.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSSC-015').status, 'pass');
});

test('R-PA-BCBSSC-015 advises when an IHCS home-services request lacks supporting material', () => {
  const findings = runEngine(bundleOf('Blue Cross Blue Shield of South Carolina member.\nIHCS home health authorization requested.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSSC-015').status, 'info');
});

test('R-PA-BCBSSC-015 accepts an identified IHCS supporting document', () => {
  const findings = runEngine(bundleOf('Blue Cross Blue Shield of South Carolina member.\nIHCS home health authorization. Medical order attached.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSSC-015').status, 'pass');
});

test('R-PA-BCBSSC-016 does not infer intensive review from generic mental-health context', () => {
  const findings = runEngine(bundleOf('Blue Cross Blue Shield of South Carolina member.\nOutpatient mental health visit requested.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSSC-016').status, 'pass');
});

test('R-PA-BCBSSC-016 advises when an intensive setting lacks clinical support', () => {
  const findings = runEngine(bundleOf('Blue Cross Blue Shield of South Carolina member.\nResidential treatment requested.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSSC-016').status, 'info');
});

test('R-PA-BCBSSC-016 accepts request-specific support for an intensive setting', () => {
  const findings = runEngine(bundleOf('Blue Cross Blue Shield of South Carolina member.\nResidential treatment requested. Functional impairment: unable to maintain safety at home.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSSC-016').status, 'pass');
});

test('R-PA-BCBSSC-017 does not apply the HIX transplant rule to a generic transplant', () => {
  const findings = runEngine(bundleOf('Blue Cross Blue Shield of South Carolina member.\nKidney transplant requested.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSSC-017').status, 'pass');
});

test('R-PA-BCBSSC-017 advises when an HIX transplant lacks product-specific routing', () => {
  const findings = runEngine(bundleOf('Blue Cross Blue Shield of South Carolina member.\nHIX transplant authorization requested.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSSC-017').status, 'info');
});

test('R-PA-BCBSSC-017 accepts a Blue Distinction transplant center', () => {
  const findings = runEngine(bundleOf('Blue Cross Blue Shield of South Carolina member.\nHIX transplant. Blue Distinction Center for Transplants selected.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSSC-017').status, 'pass');
});

test('R-PA-BCBSSC-018 does not infer investigational status from off-label or trial context', () => {
  const findings = runEngine(bundleOf('Blue Cross Blue Shield of South Carolina member.\nOff-label therapy in a clinical trial.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSSC-018').status, 'pass');
});

test('R-PA-BCBSSC-018 advises when an explicit classification lacks its policy basis', () => {
  const findings = runEngine(bundleOf('Blue Cross Blue Shield of South Carolina member.\nBCBSSC investigational classification.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSSC-018').status, 'info');
});

test('R-PA-BCBSSC-018 accepts an identified Medical Policy basis', () => {
  const findings = runEngine(bundleOf('Blue Cross Blue Shield of South Carolina member.\nBCBSSC investigational classification. Medical Policy: CAM 201115.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSSC-018').status, 'pass');
});

test('R-PA-BCBSSC-019 ignores generic appeal language', () => {
  const findings = runEngine(bundleOf('Blue Cross Blue Shield of South Carolina member.\nClaim appeal submitted.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSSC-019').status, 'pass');
});

test('R-PA-BCBSSC-019 advises when an authorization appeal omits the original case', () => {
  const findings = runEngine(bundleOf('Blue Cross Blue Shield of South Carolina member.\nPrior authorization appeal requested.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSSC-019').status, 'info');
});

test('R-PA-BCBSSC-019 accepts an authorization appeal with its case number', () => {
  const findings = runEngine(bundleOf('Blue Cross Blue Shield of South Carolina member.\nPrior authorization appeal. Case number PA-12345.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSSC-019').status, 'pass');
});

test('R-PA-BCBSSC-020 does not infer a gap exception from out-of-network care', () => {
  const findings = runEngine(bundleOf('Blue Cross Blue Shield of South Carolina member.\nOut-of-network prior authorization request.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSSC-020').status, 'pass');
});

test('R-PA-BCBSSC-020 advises when a network-gap request lacks its reason', () => {
  const findings = runEngine(bundleOf('Blue Cross Blue Shield of South Carolina member.\nNetwork gap request.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSSC-020').status, 'info');
});

test('R-PA-BCBSSC-020 accepts a request-specific network-gap reason', () => {
  const findings = runEngine(bundleOf('Blue Cross Blue Shield of South Carolina member.\nNetwork gap request. No in-network provider has the required expertise.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSSC-020').status, 'pass');
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

test('R-PA-ARKBCBS-001 advises when an Arkansas Blue Cross request omits its criteria reference', () => {
  const text = 'Arkansas Blue Cross and Blue Shield member.\n'
    + 'Requested procedure: CPT 72148 (MRI lumbar spine).\n'
    + 'Please authorize.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-ARKBCBS-001');
  assert.equal(f.status, 'info');
});

test('R-PA-ARKBCBS-001 passes when the Arkansas Blue Cross packet cites the applicable Medical Policy', () => {
  const text = 'Arkansas Blue Cross and Blue Shield member.\n'
    + 'Requested procedure: CPT 72148.\n'
    + 'Medical necessity per the applicable Arkansas Blue Cross Medical Policy (MCG).\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-ARKBCBS-001');
  assert.equal(f.status, 'pass');
});

test('R-PA-ARKBCBS-002 does not infer an authorization request from payer context', () => {
  const text = 'Arkansas Blue Cross and Blue Shield member.\nRequested procedure: CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-ARKBCBS-002');
  assert.equal(f.status, 'pass');
});

test('R-PA-ARKBCBS-002 flags an explicit authorization request with no clinical document', () => {
  const findings = runEngine(bundleOf('Arkansas Blue Cross and Blue Shield member.\nPrior authorization request for CPT 27447.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-ARKBCBS-002').status, 'flag');
});

test('R-PA-ARKBCBS-002 accepts a request with a clinical attachment', () => {
  const findings = runEngine(bundleOf([
    'Arkansas Blue Cross and Blue Shield member. Prior authorization request for CPT 27447.',
    'Clinical note: current symptoms and treatment plan.',
  ]));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-ARKBCBS-002').status, 'pass');
});

test('R-PA-ARKBCBS-003 passes when the Arkansas Blue Cross packet names the AHIN channel (info)', () => {
  const text = 'Arkansas Blue Cross and Blue Shield member.\nSubmitted via the AHIN provider portal.\nProcedure CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-ARKBCBS-003');
  assert.equal(f.status, 'pass');
});

test('R-PA-ARKBCBS-003 does not require submission-channel metadata', () => {
  const findings = runEngine(bundleOf('Arkansas Blue Cross and Blue Shield member.\nPrior authorization request for CPT 27447.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-ARKBCBS-003').status, 'pass');
});

test('R-PA-ARKBCBS-004 remains non-enforcing without a member-specific lookup', () => {
  const findings = runEngine(bundleOf('Arkansas Blue Cross and Blue Shield member.\nProcedure CPT 27447.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-ARKBCBS-004').status, 'pass');
});

test('R-PA-ARKBCBS-005 does not expect a reference on an initial request', () => {
  const findings = runEngine(bundleOf('Arkansas Blue Cross and Blue Shield member.\nPrior authorization required for CPT 27447. Initial request.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-ARKBCBS-005').status, 'pass');
});

test('R-PA-ARKBCBS-005 advises when a completed submission lacks a reference', () => {
  const findings = runEngine(bundleOf('Arkansas Blue Cross and Blue Shield member.\nPrior authorization submitted for CPT 27447.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-ARKBCBS-005').status, 'info');
});

test('R-PA-ARKBCBS-005 accepts a completed submission with a case number', () => {
  const findings = runEngine(bundleOf('Arkansas Blue Cross and Blue Shield member.\nPrior authorization submitted for CPT 27447. Case number PA-12345.\n'));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-ARKBCBS-005').status, 'pass');
});

test('R-PA-ARKBCBS-006 does not infer an inpatient review from admission prose', () => {
  const text = 'Arkansas Blue Cross and Blue Shield member.\nPatient was admitted yesterday; length of stay is three days.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-ARKBCBS-006').status, 'pass');
});

test('R-PA-ARKBCBS-006 flags an explicit inpatient request with no admission clinical support', () => {
  const text = 'Arkansas Blue Cross and Blue Shield member.\nInpatient admission request for CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-ARKBCBS-006').status, 'flag');
});

test('R-PA-ARKBCBS-006 accepts an inpatient request that documents the level of service', () => {
  const text = 'Arkansas Blue Cross and Blue Shield member.\nInpatient admission request for CPT 27447.\n'
    + 'Admitting diagnosis and clinical documentation supporting the level of service are attached.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-ARKBCBS-006').status, 'pass');
});

test('R-PA-ARKBCBS-006 flags a continued-stay review missing the discharge plan', () => {
  const text = 'Arkansas Blue Cross and Blue Shield member.\nContinued stay review for hospital day 4.\n'
    + 'Clinical update: afebrile, tolerating diet.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-ARKBCBS-006').status, 'flag');
});

test('R-PA-ARKBCBS-006 accepts a complete continued-stay review', () => {
  const text = 'Arkansas Blue Cross and Blue Shield member.\nContinued stay review for hospital day 4.\n'
    + 'Clinical update: afebrile, tolerating diet. Discharge plan: home with home health on day 6.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-ARKBCBS-006').status, 'pass');
});

test('R-PA-ARKBCBS-007 flags an Arkansas Blue Cross outpatient MRI with no clinical indication', () => {
  const text = 'Arkansas Blue Cross and Blue Shield member.\nRequested: MRI lumbar spine, CPT 72148.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-ARKBCBS-007');
  assert.equal(f.status, 'flag');
});

test('R-PA-ARKBCBS-007 does not treat an arbitrary 7xxxx code as advanced imaging', () => {
  const text = 'Arkansas Blue Cross and Blue Shield member.\nRequested: CPT 76700 abdominal ultrasound.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-ARKBCBS-007').status, 'pass');
});

test('R-PA-ARKBCBS-007 exempts imaging in a setting Arkansas Blue Cross excludes', () => {
  const text = 'Arkansas Blue Cross and Blue Shield member.\nHead CT ordered during the emergency room encounter.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-ARKBCBS-007').status, 'pass');
});

test('R-PA-ARKBCBS-007 accepts an outpatient MRI with symptoms and conservative treatment', () => {
  const text = 'Arkansas Blue Cross and Blue Shield member.\nRequested: MRI lumbar spine, CPT 72148.\n'
    + 'Symptoms for 10 weeks; failed conservative treatment with physical therapy.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-ARKBCBS-007').status, 'pass');
});

test('R-PA-ARKBCBS-008 advises when an expedited request states no urgency (info)', () => {
  const text = 'Arkansas Blue Cross and Blue Shield member.\nExpedited review requested for CPT 72148.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-ARKBCBS-008').status, 'info');
});

test('R-PA-ARKBCBS-008 passes when an expedited Arkansas Blue Cross request documents the clinical urgency', () => {
  const text = 'Arkansas Blue Cross and Blue Shield member.\nExpedited review requested: delay would jeopardize the member\'s life or health.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-ARKBCBS-008');
  assert.equal(f.status, 'pass');
});

test('R-PA-ARKBCBS-009 does not infer site-of-care steerage from hospital-outpatient surgery', () => {
  const text = 'Arkansas Blue Cross and Blue Shield member.\nOutpatient hospital surgery, CPT 29881.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-ARKBCBS-009').status, 'pass');
});

test('R-PA-ARKBCBS-009 advises when declared site-of-care steerage names no site (info)', () => {
  const text = 'Arkansas Blue Cross and Blue Shield member.\nHigh-cost infusion under site of care steerage.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-ARKBCBS-009').status, 'info');
});

test('R-PA-ARKBCBS-009 accepts declared steerage that names the administration site', () => {
  const text = 'Arkansas Blue Cross and Blue Shield member.\nHigh-cost infusion under site of care steerage.\n'
    + 'Administration site: home infusion.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-ARKBCBS-009').status, 'pass');
});

test('R-PA-ARKBCBS-010 does not demand an NDC from a J-code alone', () => {
  const text = 'Arkansas Blue Cross and Blue Shield member.\nRequested drug: J1745 infliximab, 400 mg.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-ARKBCBS-010').status, 'pass');
});

test('R-PA-ARKBCBS-010 advises when a referenced NDC is not in the 5-4-2 format (info)', () => {
  const text = 'Arkansas Blue Cross and Blue Shield member.\nRequested drug: J1745. NDC 5730-30-1.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-ARKBCBS-010').status, 'info');
});

test('R-PA-ARKBCBS-010 accepts an NDC billed in the published 5-4-2 format', () => {
  const text = 'Arkansas Blue Cross and Blue Shield member.\nRequested drug: J1745. NDC 57894-0030-01.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-ARKBCBS-010').status, 'pass');
});

test('R-PA-ARKBCBS-011 does not infer step therapy from an infusion drug request', () => {
  const text = 'Arkansas Blue Cross and Blue Shield member.\nRequested: J1745 infliximab infusion.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-ARKBCBS-011').status, 'pass');
});

test('R-PA-ARKBCBS-011 advises when declared step therapy has no prior trial (info)', () => {
  const text = 'Arkansas Blue Cross and Blue Shield member.\nThis drug is subject to step therapy.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-ARKBCBS-011').status, 'info');
});

test('R-PA-ARKBCBS-011 accepts declared step therapy with a documented failure', () => {
  const text = 'Arkansas Blue Cross and Blue Shield member.\nThis drug is subject to step therapy.\n'
    + 'Methotrexate tried and failed after 12 weeks.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-ARKBCBS-011').status, 'pass');
});

test('R-PA-ARKBCBS-012 does not treat an 81xxx code as molecular-diagnostic billing', () => {
  const text = 'Arkansas Blue Cross and Blue Shield member.\nRequested: CPT 81162 hereditary panel.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-ARKBCBS-012').status, 'pass');
});

test('R-PA-ARKBCBS-012 advises when a cytogenetic request omits the reason ordered (info)', () => {
  const text = 'Arkansas Blue Cross and Blue Shield member.\nCPT 88237 cytogenetic study.\nTest name: karyotype.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-ARKBCBS-012').status, 'info');
});

test('R-PA-ARKBCBS-012 exempts laboratory testing in an excluded setting', () => {
  const text = 'Arkansas Blue Cross and Blue Shield member.\nCPT 88237 drawn during the emergency room encounter.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-ARKBCBS-012').status, 'pass');
});

test('R-PA-ARKBCBS-012 accepts a molecular request with the test name and reason', () => {
  const text = 'Arkansas Blue Cross and Blue Shield member.\nCPT 83891 molecular diagnostic.\n'
    + 'Test name: BCR-ABL probe. Clinical indication: suspected CML.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-ARKBCBS-012').status, 'pass');
});

test('R-PA-ARKBCBS-013 does not demand a diagnosis from a J-code alone', () => {
  const text = 'Arkansas Blue Cross and Blue Shield member.\nRequested: J9299 nivolumab.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-ARKBCBS-013').status, 'pass');
});

test('R-PA-ARKBCBS-013 advises when a declared drug workflow carries no diagnosis (info)', () => {
  const text = 'Arkansas Blue Cross and Blue Shield member.\nPharmacy prior approval for J9299.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-ARKBCBS-013').status, 'info');
});

test('R-PA-ARKBCBS-014 does not fire on generic post-service prose', () => {
  const text = 'Arkansas Blue Cross and Blue Shield member.\nClaim will be filed post-service.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-ARKBCBS-014').status, 'pass');
});

test('R-PA-ARKBCBS-014 advises when a retrospective request states no reason (info)', () => {
  const text = 'Arkansas Blue Cross and Blue Shield member.\nRetrospective review requested for CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-ARKBCBS-014').status, 'info');
});

test('R-PA-ARKBCBS-015 does not infer a DME request from an E code alone', () => {
  const text = 'Arkansas Blue Cross and Blue Shield member.\nRequested: E0601 CPAP device.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-ARKBCBS-015').status, 'pass');
});

test('R-PA-ARKBCBS-015 advises when an explicit home-health request has no order (info)', () => {
  const text = 'Arkansas Blue Cross and Blue Shield member.\nPrior approval request for home health visits.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-ARKBCBS-015').status, 'info');
});

test('R-PA-ARKBCBS-015 accepts a home-health request with a plan of care', () => {
  const text = 'Arkansas Blue Cross and Blue Shield member.\nPrior approval request for home health visits.\n'
    + 'Plan of care attached.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-ARKBCBS-015').status, 'pass');
});

test('R-PA-ARKBCBS-016 does not fire on generic mental-health context', () => {
  const text = 'Arkansas Blue Cross and Blue Shield member.\nMental health follow-up visit.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-ARKBCBS-016').status, 'pass');
});

test('R-PA-ARKBCBS-016 flags a residential request missing the discharge plan', () => {
  const text = 'Arkansas Blue Cross and Blue Shield member.\nResidential treatment requested.\n'
    + 'Proposed treatment plan attached. Risk assessment completed.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-ARKBCBS-016').status, 'flag');
});

test('R-PA-ARKBCBS-016 accepts a complete Lucet behavioral-health request', () => {
  const text = 'Arkansas Blue Cross and Blue Shield member.\nResidential treatment requested.\n'
    + 'Proposed treatment plan attached. Risk assessment completed. Tentative discharge plan at 21 days.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-ARKBCBS-016').status, 'pass');
});

test('R-PA-ARKBCBS-017 exempts a kidney transplant from prior approval', () => {
  const text = 'Arkansas Blue Cross and Blue Shield member.\nRequested service: kidney transplant.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-ARKBCBS-017').status, 'pass');
});

test('R-PA-ARKBCBS-017 flags a liver transplant with no evaluation or policy basis', () => {
  const text = 'Arkansas Blue Cross and Blue Shield member.\nRequested service: liver transplant.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-ARKBCBS-017').status, 'flag');
});

test('R-PA-ARKBCBS-017 accepts a liver transplant with the evaluation documented', () => {
  const text = 'Arkansas Blue Cross and Blue Shield member.\nRequested service: liver transplant.\n'
    + 'Transplant evaluation completed; meets the applicable Coverage Policy criteria.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-ARKBCBS-017').status, 'pass');
});

test('R-PA-ARKBCBS-018 does not infer a non-coverage classification from clinical-trial context', () => {
  const text = 'Arkansas Blue Cross and Blue Shield member.\nPatient is enrolled in a clinical trial.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-ARKBCBS-018').status, 'pass');
});

test('R-PA-ARKBCBS-018 advises when a declared classification has no waiver or policy basis (info)', () => {
  const text = 'Arkansas Blue Cross and Blue Shield member.\nThis service is deemed investigational.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-ARKBCBS-018').status, 'info');
});

test('R-PA-ARKBCBS-018 accepts a declared classification with a signed member waiver', () => {
  const text = 'Arkansas Blue Cross and Blue Shield member.\nThis service is deemed investigational.\n'
    + 'Signed waiver of health plan liability on file, dated before the service.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-ARKBCBS-018').status, 'pass');
});

test('R-PA-ARKBCBS-019 does not treat a grievance as an authorization appeal', () => {
  const text = 'Arkansas Blue Cross and Blue Shield member.\nMember filed a grievance about office wait times.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-ARKBCBS-019').status, 'pass');
});

test('R-PA-ARKBCBS-019 advises when an appeal names no contested determination (info)', () => {
  const text = 'Arkansas Blue Cross and Blue Shield member.\nReconsideration request for CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-ARKBCBS-019').status, 'info');
});

test('R-PA-ARKBCBS-020 does not fire on out-of-network status alone', () => {
  const text = 'Arkansas Blue Cross and Blue Shield member.\nOut-of-network prior authorization request.\nProcedure CPT 70551.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-ARKBCBS-020').status, 'pass');
});

test('R-PA-ARKBCBS-020 advises when an out-of-state request states no basis (info)', () => {
  const text = 'Arkansas Blue Cross and Blue Shield member.\nOut-of-state request for CPT 70551.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-ARKBCBS-020').status, 'info');
});

test('R-PA-ARKBCBS-020 accepts an out-of-state request with a continuity-of-care basis', () => {
  const text = 'Arkansas Blue Cross and Blue Shield member.\nOut-of-state request for CPT 70551.\n'
    + 'Continuity of care: complex condition managed by this physician for three years.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-ARKBCBS-020').status, 'pass');
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

test('R-PA-BLUEKC-001 advises when a Blue KC request omits its criteria reference (info)', () => {
  const text = 'Blue Cross and Blue Shield of Kansas City member.\n'
    + 'Requested procedure: CPT 72148 (MRI lumbar spine).\n'
    + 'Please authorize.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BLUEKC-001');
  assert.equal(f.status, 'info');
});

test('R-PA-BLUEKC-001 passes when the Blue KC packet cites the applicable Medical Policy', () => {
  const text = 'Blue Cross and Blue Shield of Kansas City member.\n'
    + 'Requested procedure: CPT 72148.\n'
    + 'Medical necessity per the applicable Blue KC Medical Policy (MCG).\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BLUEKC-001');
  assert.equal(f.status, 'pass');
});

test('R-PA-BLUEKC-002 does not infer an authorization request from payer context', () => {
  const text = 'Blue Cross and Blue Shield of Kansas City member.\nRequested procedure: CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BLUEKC-002').status, 'pass');
});

test('R-PA-BLUEKC-002 flags an explicit authorization request with no clinical document', () => {
  const text = 'Blue Cross and Blue Shield of Kansas City member.\nPrior authorization request for CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BLUEKC-002').status, 'flag');
});

test('R-PA-BLUEKC-002 accepts a request with a clinical attachment', () => {
  const findings = runEngine(bundleOf([
    'Blue Cross and Blue Shield of Kansas City member. Prior authorization request for CPT 27447.',
    'Clinical note: current symptoms and treatment plan.',
  ]));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BLUEKC-002').status, 'pass');
});

test('R-PA-BLUEKC-005 does not expect a reference on an initial request', () => {
  const text = 'Blue Cross and Blue Shield of Kansas City member.\nPrior authorization required for CPT 27447. Initial request.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BLUEKC-005').status, 'pass');
});

test('R-PA-BLUEKC-005 advises when a completed submission lacks a reference (info)', () => {
  const text = 'Blue Cross and Blue Shield of Kansas City member.\nPrior authorization submitted for CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BLUEKC-005').status, 'info');
});

test('R-PA-BLUEKC-003 does not require submission-channel metadata', () => {
  const text = 'Blue Cross and Blue Shield of Kansas City member.\nProcedure CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BLUEKC-003');
  assert.equal(f.status, 'pass');
});

test('R-PA-BLUEKC-008 passes when an expedited Blue KC request documents the clinical urgency', () => {
  const text = 'Blue Cross and Blue Shield of Kansas City member.\nExpedited review requested: delay would jeopardize the member\'s life or health.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BLUEKC-008');
  assert.equal(f.status, 'pass');
});

test('R-PA-BLUEKC-006 does not infer a concurrent review from admission prose', () => {
  const text = 'Blue Cross and Blue Shield of Kansas City member.\nPatient was admitted Tuesday; length of stay is four days.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BLUEKC-006').status, 'pass');
});

test('R-PA-BLUEKC-006 flags a continued-stay review with no interval clinical data', () => {
  const text = 'Blue Cross and Blue Shield of Kansas City member.\nContinued stay requested for two additional days.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BLUEKC-006').status, 'flag');
});

test('R-PA-BLUEKC-006 accepts a continued-stay review with a clinical update', () => {
  const text = 'Blue Cross and Blue Shield of Kansas City member.\nContinued stay requested for two additional days.\n'
    + 'Clinical update since the initial approval: still requiring IV antibiotics.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BLUEKC-006').status, 'pass');
});

test('R-PA-BLUEKC-007 flags a Blue KC outpatient MRI with no clinical indication', () => {
  const text = 'Blue Cross and Blue Shield of Kansas City member.\nRequested: MRI lumbar spine, CPT 72148.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BLUEKC-007').status, 'flag');
});

test('R-PA-BLUEKC-007 does not treat an arbitrary 7xxxx code as an eviCore study', () => {
  const text = 'Blue Cross and Blue Shield of Kansas City member.\nRequested: CPT 76700 abdominal ultrasound.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BLUEKC-007').status, 'pass');
});

test('R-PA-BLUEKC-007 exempts imaging done in the emergency room', () => {
  const text = 'Blue Cross and Blue Shield of Kansas City member.\nHead CT scan performed in the emergency room.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BLUEKC-007').status, 'pass');
});

test('R-PA-BLUEKC-008 advises when an expedited request names no urgent condition (info)', () => {
  const text = 'Blue Cross and Blue Shield of Kansas City member.\nExpedited review requested for CPT 72148.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BLUEKC-008').status, 'info');
});

test('R-PA-BLUEKC-009 does not infer site-of-care review from hospital-outpatient surgery', () => {
  const text = 'Blue Cross and Blue Shield of Kansas City member.\nOutpatient hospital surgery, CPT 29881.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BLUEKC-009').status, 'pass');
});

test('R-PA-BLUEKC-009 advises when a declared site-of-care review names no site (info)', () => {
  const text = 'Blue Cross and Blue Shield of Kansas City member.\nThis request is subject to site-of-care review.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BLUEKC-009').status, 'info');
});

test('R-PA-BLUEKC-010 does not demand an NDC from a J-code alone', () => {
  const text = 'Blue Cross and Blue Shield of Kansas City member.\nRequested drug: J1745 infliximab.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BLUEKC-010').status, 'pass');
});

test('R-PA-BLUEKC-010 advises when a declared NDC requirement has no code (info)', () => {
  const text = 'Blue Cross and Blue Shield of Kansas City member.\nNDC required for this drug request.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BLUEKC-010').status, 'info');
});

test('R-PA-BLUEKC-011 does not infer step therapy from a specialty-drug label', () => {
  const text = 'Blue Cross and Blue Shield of Kansas City member.\nRequested: specialty drug J1745 infusion.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BLUEKC-011').status, 'pass');
});

test('R-PA-BLUEKC-011 advises when declared step therapy has no prior trial (info)', () => {
  const text = 'Blue Cross and Blue Shield of Kansas City member.\nThis drug is subject to step therapy.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BLUEKC-011').status, 'info');
});

test('R-PA-BLUEKC-011 accepts declared step therapy with a documented failure', () => {
  const text = 'Blue Cross and Blue Shield of Kansas City member.\nThis drug is subject to step therapy.\n'
    + 'Adalimumab tried and failed after 16 weeks.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BLUEKC-011').status, 'pass');
});

test('R-PA-BLUEKC-012 does not infer a lab workflow from an 81xxx code', () => {
  const text = 'Blue Cross and Blue Shield of Kansas City member.\nRequested: CPT 81162 hereditary panel.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BLUEKC-012').status, 'pass');
});

test('R-PA-BLUEKC-012 advises when a declared lab workflow omits the indication (info)', () => {
  const text = 'Blue Cross and Blue Shield of Kansas City member.\nSubmitted to the lab management program.\nTest name: BRCA1/2 sequencing.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BLUEKC-012').status, 'info');
});

test('R-PA-BLUEKC-013 does not demand a diagnosis from a J-code alone', () => {
  const text = 'Blue Cross and Blue Shield of Kansas City member.\nRequested: J9299 nivolumab.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BLUEKC-013').status, 'pass');
});

test('R-PA-BLUEKC-013 advises when a declared drug workflow carries no diagnosis (info)', () => {
  const text = 'Blue Cross and Blue Shield of Kansas City member.\nSpecialty medication prior authorization for J9299.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BLUEKC-013').status, 'info');
});

test('R-PA-BLUEKC-014 does not fire on the phrase retrospective review alone', () => {
  const text = 'Blue Cross and Blue Shield of Kansas City member.\nClaim may be selected for retrospective review.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BLUEKC-014').status, 'pass');
});

test('R-PA-BLUEKC-014 advises when a post-service request states no reason (info)', () => {
  const text = 'Blue Cross and Blue Shield of Kansas City member.\nRetroactive authorization requested for CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BLUEKC-014').status, 'info');
});

test('R-PA-BLUEKC-015 does not infer a DME request from an E code alone', () => {
  const text = 'Blue Cross and Blue Shield of Kansas City member.\nRequested: E0601 CPAP device.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BLUEKC-015').status, 'pass');
});

test('R-PA-BLUEKC-015 accepts a home-health request with a plan of care', () => {
  const text = 'Blue Cross and Blue Shield of Kansas City member.\nPrior authorization request for home health visits.\n'
    + 'Plan of care attached.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BLUEKC-015').status, 'pass');
});

test('R-PA-BLUEKC-016 does not fire on generic mental-health context', () => {
  const text = 'Blue Cross and Blue Shield of Kansas City member.\nMental health follow-up visit.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BLUEKC-016').status, 'pass');
});

test('R-PA-BLUEKC-016 flags a residential request that addresses no level of care', () => {
  const text = 'Blue Cross and Blue Shield of Kansas City member.\nResidential treatment requested.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BLUEKC-016').status, 'flag');
});

test('R-PA-BLUEKC-016 accepts a substance-use request citing ASAM', () => {
  const text = 'Blue Cross and Blue Shield of Kansas City member.\nSubstance use treatment requested.\n'
    + 'ASAM criteria support this level of care.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BLUEKC-016').status, 'pass');
});

test('R-PA-BLUEKC-017 does not fire on the word transplant alone', () => {
  const text = 'Blue Cross and Blue Shield of Kansas City member.\nHistory of kidney transplant in 2019.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BLUEKC-017').status, 'pass');
});

test('R-PA-BLUEKC-017 advises when a transplant request carries no evaluation (info)', () => {
  const text = 'Blue Cross and Blue Shield of Kansas City member.\nTransplant authorization requested.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BLUEKC-017').status, 'info');
});

test('R-PA-BLUEKC-017 accepts a transplant request with the evaluation attached', () => {
  const text = 'Blue Cross and Blue Shield of Kansas City member.\nTransplant authorization requested.\n'
    + 'Transplant evaluation completed; candidacy confirmed.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BLUEKC-017').status, 'pass');
});

test('R-PA-BLUEKC-018 does not infer a classification from clinical-trial context', () => {
  const text = 'Blue Cross and Blue Shield of Kansas City member.\nPatient is enrolled in a clinical trial.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BLUEKC-018').status, 'pass');
});

test('R-PA-BLUEKC-018 advises when a declared classification names no policy (info)', () => {
  const text = 'Blue Cross and Blue Shield of Kansas City member.\nThis service was denied as investigational.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BLUEKC-018').status, 'info');
});

test('R-PA-BLUEKC-019 does not treat a grievance as an authorization appeal', () => {
  const text = 'Blue Cross and Blue Shield of Kansas City member.\nMember filed a grievance about billing.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BLUEKC-019').status, 'pass');
});

test('R-PA-BLUEKC-019 advises when a peer-to-peer request names no denial (info)', () => {
  const text = 'Blue Cross and Blue Shield of Kansas City member.\nPeer-to-peer request for CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BLUEKC-019').status, 'info');
});

test('R-PA-BLUEKC-020 does not require an out-of-network authorization for a PPO member', () => {
  const text = 'Blue Cross and Blue Shield of Kansas City member.\nOut-of-network prior authorization request.\nProcedure CPT 70551.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BLUEKC-020').status, 'pass');
});

test('R-PA-BLUEKC-020 advises on an HMO out-of-network request with no basis (info)', () => {
  const text = 'Blue Cross and Blue Shield of Kansas City HMO member.\nOut-of-network request for CPT 70551.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BLUEKC-020').status, 'info');
});

test('R-PA-BLUEKC-020 accepts an HMO out-of-network request that is not available in network', () => {
  const text = 'Blue Cross and Blue Shield of Kansas City HMO member.\nOut-of-network request for CPT 70551.\n'
    + 'This procedure is not available in network within the service area.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BLUEKC-020').status, 'pass');
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

test('R-PA-BCBSMN-006 does not fire on an admission notification alone', () => {
  const text = 'Blue Cross and Blue Shield of Minnesota member.\nAdmission notification submitted for an inpatient stay.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSMN-006').status, 'pass');
});

test('R-PA-BCBSMN-006 flags a continued-stay request with no clinical support', () => {
  const text = 'Blue Cross and Blue Shield of Minnesota member.\nContinued stay requested beyond the approved days.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSMN-006').status, 'flag');
});

test('R-PA-BCBSMN-006 accepts a continued-stay request with a clinical update', () => {
  const text = 'Blue Cross and Blue Shield of Minnesota member.\nContinued stay requested beyond the approved days.\n'
    + 'Clinical update: still requiring IV antibiotics. Expected discharge in two days.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSMN-006').status, 'pass');
});

test('R-PA-BCBSMN-007 does not infer an imaging workflow from an MRI request', () => {
  const text = 'Blue Cross and Blue Shield of Minnesota member.\nRequested: MRI lumbar spine, CPT 72148.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSMN-007').status, 'pass');
});

test('R-PA-BCBSMN-007 advises when a declared imaging workflow omits the indication (info)', () => {
  const text = 'Blue Cross and Blue Shield of Minnesota member.\nImaging prior authorization for CPT 72148.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSMN-007').status, 'info');
});

test('R-PA-BCBSMN-008 accepts any one of the three published urgency conditions', () => {
  for (const basis of [
    'Immediate action is needed to prevent serious deterioration from an unforeseen illness.',
    'Delay could jeopardize the ability to regain maximum function.',
    'The member has severe pain that cannot be adequately managed without this treatment.',
  ]) {
    const text = 'Blue Cross and Blue Shield of Minnesota member.\nExpedited review requested.\n' + basis + '\n';
    const findings = runEngine(bundleOf(text));
    assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSMN-008').status, 'pass', basis);
  }
});

test('R-PA-BCBSMN-008 flags an urgent request stating no published condition', () => {
  const text = 'Blue Cross and Blue Shield of Minnesota member.\nExpedited review requested for CPT 72148.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSMN-008').status, 'flag');
});

test('R-PA-BCBSMN-008 treats care already provided as non-urgent rather than unjustified', () => {
  const text = 'Blue Cross and Blue Shield of Minnesota member.\nExpedited review requested.\nService already rendered on 2026-09-01.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSMN-008').status, 'pass');
});

test('R-PA-BCBSMN-011 does not infer step therapy from a specialty-drug label', () => {
  const text = 'Blue Cross and Blue Shield of Minnesota member.\nRequested: specialty drug J1745 infusion.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSMN-011').status, 'pass');
});

test('R-PA-BCBSMN-011 advises when declared step therapy has no prior trial (info)', () => {
  const text = 'Blue Cross and Blue Shield of Minnesota member.\nThis drug is subject to step therapy.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSMN-011').status, 'info');
});

test('R-PA-BCBSMN-012 does not treat an 81xxx code as an EviCore molecular request', () => {
  const text = 'Blue Cross and Blue Shield of Minnesota member.\nRequested: CPT 81162.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSMN-012').status, 'pass');
});

test('R-PA-BCBSMN-012 flags a molecular lab request missing the indication', () => {
  const text = 'Blue Cross and Blue Shield of Minnesota member.\nMolecular lab request.\nTest name: BRCA1/2 sequencing.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSMN-012').status, 'flag');
});

test('R-PA-BCBSMN-012 accepts a molecular lab request with test and indication', () => {
  const text = 'Blue Cross and Blue Shield of Minnesota member.\nMolecular lab request.\n'
    + 'Test name: BRCA1/2 sequencing. Family history of early-onset breast cancer.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSMN-012').status, 'pass');
});

test('R-PA-BCBSMN-013 does not demand a diagnosis from a J-code alone', () => {
  const text = 'Blue Cross and Blue Shield of Minnesota member.\nRequested: J9299 nivolumab.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSMN-013').status, 'pass');
});

test('R-PA-BCBSMN-013 advises when a Prime MPS request carries no diagnosis (info)', () => {
  const text = 'Blue Cross and Blue Shield of Minnesota member.\nPrime MPS specialty drug review for J9299.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSMN-013').status, 'info');
});

test('R-PA-BCBSMN-014 advises when a retrospective request states no reason (info)', () => {
  const text = 'Blue Cross and Blue Shield of Minnesota member.\nRetrospective clinical review requested for CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSMN-014').status, 'info');
});

test('R-PA-BCBSMN-014 accepts an after-hours reason for retrospective review', () => {
  const text = 'Blue Cross and Blue Shield of Minnesota member.\nRetrospective clinical review requested for CPT 27447.\n'
    + 'After-hours urgent situation; authorization could not be obtained first.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSMN-014').status, 'pass');
});

test('R-PA-BCBSMN-015 does not infer a DME request from an E code alone', () => {
  const text = 'Blue Cross and Blue Shield of Minnesota member.\nRequested: E0601 CPAP device.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSMN-015').status, 'pass');
});

test('R-PA-BCBSMN-015 accepts a home-health request with a plan of care', () => {
  const text = 'Blue Cross and Blue Shield of Minnesota member.\nPrior authorization request for home health services.\n'
    + 'Plan of care attached.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSMN-015').status, 'pass');
});

test('R-PA-BCBSMN-009 does not infer site-of-care review from hospital-outpatient surgery', () => {
  const text = 'Blue Cross and Blue Shield of Minnesota member.\nOutpatient hospital surgery, CPT 29881.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSMN-009').status, 'pass');
});

test('R-PA-BCBSMN-010 does not demand an NDC from a J-code alone', () => {
  const text = 'Blue Cross and Blue Shield of Minnesota member.\nRequested drug: J1745 infliximab.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSMN-010').status, 'pass');
});

test('R-PA-BCBSMN-008 passes when an expedited BCBSMN request documents the clinical urgency', () => {
  const text = 'Blue Cross and Blue Shield of Minnesota member.\nExpedited review requested: delay would jeopardize the member\'s life or health.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-BCBSMN-008');
  assert.equal(f.status, 'pass');
});

test('R-PA-BCBSMN-016 does not fire on generic mental-health context', () => {
  const text = 'Blue Cross and Blue Shield of Minnesota member.\nMental health follow-up visit.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSMN-016').status, 'pass');
});

test('R-PA-BCBSMN-016 accepts a substance-use request citing ASAM', () => {
  const text = 'Blue Cross and Blue Shield of Minnesota member.\nSubstance use treatment requested.\n'
    + 'ASAM criteria support this level of care.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSMN-016').status, 'pass');
});

test('R-PA-BCBSMN-017 does not fire on the word transplant alone', () => {
  const text = 'Blue Cross and Blue Shield of Minnesota member.\nHistory of kidney transplant in 2019.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSMN-017').status, 'pass');
});

test('R-PA-BCBSMN-017 flags a transplant request with no evaluation or policy basis', () => {
  const text = 'Blue Cross and Blue Shield of Minnesota member.\nTransplant request for a liver.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSMN-017').status, 'flag');
});

test('R-PA-BCBSMN-017 accepts a transplant request with the evaluation attached', () => {
  const text = 'Blue Cross and Blue Shield of Minnesota member.\nTransplant request for a liver.\n'
    + 'Transplant evaluation completed; candidacy confirmed.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSMN-017').status, 'pass');
});

test('R-PA-BCBSMN-018 does not infer a classification from clinical-trial context', () => {
  const text = 'Blue Cross and Blue Shield of Minnesota member.\nPatient is enrolled in a clinical trial.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSMN-018').status, 'pass');
});

test('R-PA-BCBSMN-018 flags a declared classification with no evidence', () => {
  const text = 'Blue Cross and Blue Shield of Minnesota member.\nThis service is deemed investigational.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSMN-018').status, 'flag');
});

test('R-PA-BCBSMN-018 accepts evidence addressing the published test', () => {
  const text = 'Blue Cross and Blue Shield of Minnesota member.\nThis service is deemed investigational.\n'
    + 'Peer-reviewed literature supports the effect on health outcomes for this indication.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSMN-018').status, 'pass');
});

test('R-PA-BCBSMN-019 does not treat a grievance as an authorization appeal', () => {
  const text = 'Blue Cross and Blue Shield of Minnesota member.\nMember filed a grievance about billing.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSMN-019').status, 'pass');
});

test('R-PA-BCBSMN-019 advises when a reconsideration names no determination (info)', () => {
  const text = 'Blue Cross and Blue Shield of Minnesota member.\nReconsideration request for CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSMN-019').status, 'info');
});

test('R-PA-BCBSMN-020 does not fire on out-of-network status alone', () => {
  const text = 'Blue Cross and Blue Shield of Minnesota member.\nOut-of-network prior authorization request.\nProcedure CPT 70551.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSMN-020').status, 'pass');
});

test('R-PA-BCBSMN-020 advises when an exception request states no basis (info)', () => {
  const text = 'Blue Cross and Blue Shield of Minnesota member.\nOut-of-network exception requested for CPT 70551.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSMN-020').status, 'info');
});

test('R-PA-BCBSMN-020 accepts an exception request with a medical-necessity basis', () => {
  const text = 'Blue Cross and Blue Shield of Minnesota member.\nOut-of-network exception requested for CPT 70551.\n'
    + 'Medically necessary: no participating provider offers this procedure in the service area.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSMN-020').status, 'pass');
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

test('R-PA-BCBSLA-006 does not infer a continued-stay review from admission prose', () => {
  const text = 'Blue Cross and Blue Shield of Louisiana member.\nPatient was admitted Tuesday.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSLA-006').status, 'pass');
});

test('R-PA-BCBSLA-006 flags a continued-stay request with no clinical support', () => {
  const text = 'Blue Cross and Blue Shield of Louisiana member.\nContinued stay requested for two additional days.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSLA-006').status, 'flag');
});

test('R-PA-BCBSLA-007 does not treat an arbitrary 7xxxx code as high-tech imaging', () => {
  const text = 'Blue Cross and Blue Shield of Louisiana member.\nRequested: CPT 76700 abdominal ultrasound.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSLA-007').status, 'pass');
});

test('R-PA-BCBSLA-008 flags an urgent request with no supporting clinical information', () => {
  // Louisiana Blue denies an urgent request after 72 hours for lack of information,
  // so the published risk is missing clinical material -- not missing urgency wording.
  const text = 'Blue Cross and Blue Shield of Louisiana member.\nExpedited review requested: delay would jeopardize the member\'s life or health.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSLA-008').status, 'flag');
});

test('R-PA-BCBSLA-008 accepts an urgent request carrying a clinical document', () => {
  const findings = runEngine(bundleOf([
    'Blue Cross and Blue Shield of Louisiana member. Urgent authorization requested.',
    'Clinical note: rapidly worsening cellulitis, failing oral antibiotics.',
  ]));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSLA-008').status, 'pass');
});

test('R-PA-BCBSLA-011 does not infer step therapy from a specialty-drug label', () => {
  const text = 'Blue Cross and Blue Shield of Louisiana member.\nRequested: specialty drug J1745 infusion.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSLA-011').status, 'pass');
});

test('R-PA-BCBSLA-011 accepts either a Step 1 trial or clinical inappropriateness', () => {
  for (const basis of [
    'Step 1 drug tried and failed after 10 weeks.',
    'Step 1 drugs are not clinically appropriate for this member.',
  ]) {
    const text = 'Blue Cross and Blue Shield of Louisiana member.\nThis drug is subject to step therapy.\n' + basis + '\n';
    const findings = runEngine(bundleOf(text));
    assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSLA-011').status, 'pass', basis);
  }
});

test('R-PA-BCBSLA-012 does not treat an 81xxx code as a Carelon genetic request', () => {
  const text = 'Blue Cross and Blue Shield of Louisiana member.\nRequested: CPT 81162.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSLA-012').status, 'pass');
});

test('R-PA-BCBSLA-012 accepts a genetic request with the test and indication', () => {
  const text = 'Blue Cross and Blue Shield of Louisiana member.\nGenetic testing requested.\n'
    + 'Test name: BRCA1/2 sequencing. Family history of early-onset breast cancer.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSLA-012').status, 'pass');
});

test('R-PA-BCBSLA-013 does not demand a diagnosis from a J-code alone', () => {
  const text = 'Blue Cross and Blue Shield of Louisiana member.\nRequested: J9299 nivolumab.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSLA-013').status, 'pass');
});

test('R-PA-BCBSLA-014 advises when a retrospective request omits the required form (info)', () => {
  const findings = runEngine(bundleOf([
    'Blue Cross and Blue Shield of Louisiana member. Retrospective authorization requested for CPT 27447.',
    'Clinical note: post-operative course.',
  ]));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSLA-014').status, 'info');
});

test('R-PA-BCBSLA-014 accepts records plus the Retrospective Review Authorization Form', () => {
  const findings = runEngine(bundleOf([
    'Blue Cross and Blue Shield of Louisiana member. Retrospective authorization requested. Retrospective Review Authorization Form attached.',
    'Clinical note: post-operative course.',
  ]));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSLA-014').status, 'pass');
});

test('R-PA-BCBSLA-015 does not infer a DME request from an E code alone', () => {
  const text = 'Blue Cross and Blue Shield of Louisiana member.\nRequested: E0601 CPAP device.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSLA-015').status, 'pass');
});

test('R-PA-BCBSLA-015 accepts a home-health request with an InterQual review', () => {
  const text = 'Blue Cross and Blue Shield of Louisiana member.\nPrior authorization request for home health services.\n'
    + 'InterQual criteria review completed.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSLA-015').status, 'pass');
});

test('R-PA-BCBSLA-009 does not infer site-of-care review from hospital-outpatient surgery', () => {
  const text = 'Blue Cross and Blue Shield of Louisiana member.\nOutpatient hospital surgery, CPT 29881.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSLA-009').status, 'pass');
});

test('R-PA-BCBSLA-010 does not demand an NDC from a J-code alone', () => {
  const text = 'Blue Cross and Blue Shield of Louisiana member.\nRequested drug: J1745 infliximab.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSLA-010').status, 'pass');
});

test('R-PA-BCBSLA-016 does not fire on generic mental-health context', () => {
  const text = 'Blue Cross and Blue Shield of Louisiana member.\nMental health follow-up visit.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSLA-016').status, 'pass');
});

test('R-PA-BCBSLA-016 flags an intensive outpatient request with no level-of-care support', () => {
  const text = 'Blue Cross and Blue Shield of Louisiana member.\nIntensive outpatient program requested.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSLA-016').status, 'flag');
});

test('R-PA-BCBSLA-017 does not fire on the word transplant alone', () => {
  const text = 'Blue Cross and Blue Shield of Louisiana member.\nHistory of kidney transplant in 2019.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSLA-017').status, 'pass');
});

test('R-PA-BCBSLA-017 flags a transplant request with no evaluation or coverage basis', () => {
  const text = 'Blue Cross and Blue Shield of Louisiana member.\nTransplant request for a liver.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSLA-017').status, 'flag');
});

test('R-PA-BCBSLA-018 does not infer a classification from clinical-trial context', () => {
  const text = 'Blue Cross and Blue Shield of Louisiana member.\nPatient is enrolled in a clinical trial.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSLA-018').status, 'pass');
});

test('R-PA-BCBSLA-018 flags an investigational-status inquiry with no evidence', () => {
  const text = 'Blue Cross and Blue Shield of Louisiana member.\nRequesting the investigational status of this device.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSLA-018').status, 'flag');
});

test('R-PA-BCBSLA-018 accepts peer-reviewed outcomes evidence', () => {
  const text = 'Blue Cross and Blue Shield of Louisiana member.\nRequesting the investigational status of this device.\n'
    + 'Peer-reviewed scientific evidence on net health outcome is attached.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSLA-018').status, 'pass');
});

test('R-PA-BCBSLA-019 does not treat a grievance as an authorization appeal', () => {
  const text = 'Blue Cross and Blue Shield of Louisiana member.\nMember filed a grievance about billing.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSLA-019').status, 'pass');
});

test('R-PA-BCBSLA-020 does not fire on out-of-network status alone', () => {
  const text = 'Blue Cross and Blue Shield of Louisiana member.\nOut-of-network prior authorization request.\nProcedure CPT 70551.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSLA-020').status, 'pass');
});

test('R-PA-BCBSLA-020 advises when an out-of-network exception states no basis (info)', () => {
  const text = 'Blue Cross and Blue Shield of Louisiana member.\nOut-of-network exception requested for CPT 70551.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-BCBSLA-020').status, 'info');
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

test('R-PA-HMSA-006 does not fire on an acute admission, which needs no precertification', () => {
  const text = 'HMSA member.\nAcute hospitalization; patient admitted Tuesday.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-HMSA-006').status, 'pass');
});

test('R-PA-HMSA-006 flags a concurrent review with no clinical support', () => {
  const text = 'HMSA member.\nConcurrent review for hospital day 4.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-HMSA-006').status, 'flag');
});

test('R-PA-HMSA-006 accepts a concurrent review with a clinical update', () => {
  const text = 'HMSA member.\nConcurrent review for hospital day 4.\n'
    + 'Clinical update: still requiring IV antibiotics. Expected discharge in two days.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-HMSA-006').status, 'pass');
});

test('R-PA-HMSA-007 does not treat an arbitrary 7xxxx code as advanced imaging', () => {
  const text = 'HMSA member.\nRequested: CPT 76700 abdominal ultrasound.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-HMSA-007').status, 'pass');
});

test('R-PA-HMSA-007 flags an advanced-imaging request with no clinical indication', () => {
  const text = 'HMSA member.\nRequested: MRI lumbar spine, CPT 72148.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-HMSA-007').status, 'flag');
});

test('R-PA-HMSA-008 advises when an expedited request states no urgency (info)', () => {
  const text = 'HMSA member.\nExpedited review requested for CPT 72148.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-HMSA-008').status, 'info');
});

test('R-PA-HMSA-009 does not fire on hospital-outpatient surgery alone', () => {
  // HMSA publishes a place-of-treatment EXCEPTION, not a steering rule: the
  // obligation attaches to choosing a non-standard setting, not to any setting.
  const text = 'HMSA member.\nOutpatient hospital surgery, CPT 29881.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-HMSA-009').status, 'pass');
});

test('R-PA-HMSA-009 flags a place-of-treatment exception with no precertification sought', () => {
  const text = 'HMSA member.\nRequesting an alternate treatment setting for CPT 29881.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-HMSA-009').status, 'flag');
});

test('R-PA-HMSA-009 accepts a place-of-treatment exception seeking precertification', () => {
  const text = 'HMSA member.\nRequesting an alternate treatment setting for CPT 29881.\n'
    + 'Precertification approval is requested for this setting.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-HMSA-009').status, 'pass');
});

test('R-PA-HMSA-010 does not demand an NDC from a J-code alone', () => {
  const text = 'HMSA member.\nRequested drug: J1745 infliximab.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-HMSA-010').status, 'pass');
});

test('R-PA-HMSA-011 does not infer step therapy from a specialty-drug label', () => {
  const text = 'HMSA member.\nRequested: specialty drug J1745 infusion.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-HMSA-011').status, 'pass');
});

test('R-PA-HMSA-012 does not treat an 81xxx code as an Avalon genetic request', () => {
  const text = 'HMSA member.\nRequested: CPT 81162.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-HMSA-012').status, 'pass');
});

test('R-PA-HMSA-012 flags a genetic request missing the indication', () => {
  const text = 'HMSA member.\nGenetic testing requested.\nTest name: BRCA1/2 sequencing.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-HMSA-012').status, 'flag');
});

test('R-PA-HMSA-012 accepts a genetic request with the test and indication', () => {
  const text = 'HMSA member.\nGenetic testing requested.\n'
    + 'Test name: BRCA1/2 sequencing. Family history of early-onset breast cancer.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-HMSA-012').status, 'pass');
});

test('R-PA-HMSA-013 does not demand a diagnosis from a J-code alone', () => {
  const text = 'HMSA member.\nRequested: J9299 nivolumab.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-HMSA-013').status, 'pass');
});

test('R-PA-HMSA-013 advises when a declared drug workflow carries no diagnosis (info)', () => {
  const text = 'HMSA member.\nMedical specialty drug review requested for J9299.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-HMSA-013').status, 'info');
});

test('R-PA-HMSA-014 does not fire on the phrase retrospective review alone', () => {
  const text = 'HMSA member.\nHMSA may conduct a retrospective review of this claim.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-HMSA-014').status, 'pass');
});

test('R-PA-HMSA-014 advises when a post-service request carries no documentation (info)', () => {
  const text = 'HMSA member.\nRetroactive authorization requested for CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-HMSA-014').status, 'info');
});

test('R-PA-HMSA-015 does not infer a DME request from an E code alone', () => {
  const text = 'HMSA member.\nRequested: E0601 CPAP device.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-HMSA-015').status, 'pass');
});

test('R-PA-HMSA-015 accepts a home-health request with the assessment attached', () => {
  const text = 'HMSA member.\nPrecertification request for home health services.\n'
    + 'Home health assessment attached.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-HMSA-015').status, 'pass');
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

test('R-PA-HMSA-016 does not fire on an acute hospitalization, which needs no precertification', () => {
  const text = 'HMSA member.\nAcute psychiatric hospitalization; patient admitted.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-HMSA-016').status, 'pass');
});

test('R-PA-HMSA-016 flags a residential request with no level-of-care support', () => {
  const text = 'HMSA member.\nResidential treatment program requested.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-HMSA-016').status, 'flag');
});

test('R-PA-HMSA-016 accepts a residential request citing the criteria', () => {
  const text = 'HMSA member.\nResidential treatment program requested.\n'
    + 'Magellan level of care criteria support this placement; safety plan attached.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-HMSA-016').status, 'pass');
});

test('R-PA-HMSA-017 does not fire on the word transplant alone', () => {
  const text = 'HMSA member.\nHistory of kidney transplant in 2019.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-HMSA-017').status, 'pass');
});

test('R-PA-HMSA-017 flags a transplant request with no evaluation or policy basis', () => {
  const text = 'HMSA member.\nTransplant request for a liver.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-HMSA-017').status, 'flag');
});

test('R-PA-HMSA-018 does not infer new technology from clinical-trial context', () => {
  const text = 'HMSA member.\nPatient is enrolled in a clinical trial.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-HMSA-018').status, 'pass');
});

test('R-PA-HMSA-018 flags new technology with no precertification sought', () => {
  const text = 'HMSA member.\nThis procedure employs new technology.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-HMSA-018').status, 'flag');
});

test('R-PA-HMSA-019 advises when an appeal omits the denial date (info)', () => {
  const text = 'HMSA member.\nAppealing the denial for CPT 27447; we believe the decision was in error.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-HMSA-019').status, 'info');
});

test('R-PA-HMSA-019 accepts an appeal with the denial date and the error rationale', () => {
  const text = 'HMSA member.\nAppealing the denial for CPT 27447.\n'
    + 'Denial dated 2026-08-14; we believe the decision was in error because the criteria were met.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-HMSA-019').status, 'pass');
});

test('R-PA-HMSA-020 flags a nonparticipating referral with no administrative review', () => {
  const text = 'HMSA member.\nReferral to an out-of-network provider for CPT 70551.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-HMSA-020').status, 'flag');
});

test('R-PA-HMSA-020 exempts urgent and emergent services from administrative review', () => {
  const text = 'HMSA member.\nEmergent care delivered by an out-of-network provider.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-HMSA-020').status, 'pass');
});

test('R-PA-HMSA-020 accepts a referral that sought administrative review', () => {
  const text = 'HMSA member.\nReferral to an out-of-network provider for CPT 70551.\n'
    + 'Administrative review requested before services are rendered.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-HMSA-020').status, 'pass');
});

// ---- Michigan Medicaid overlay (spec-v1362) ----
//
// The payer id is `medicaid-mi`, not `mcmi`. Writing the guard from the rule-id
// prefix instead of lib/pa/payer.js silently disables every rule in the overlay,
// which is why the first test here asserts a rule actually FIRES.

test('Michigan Medicaid rules are wired to the medicaid-mi payer id', () => {
  const text = 'Michigan Medicaid beneficiary.\nInpatient admission request for CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCMI-006').status, 'flag',
    'R-PA-MCMI-006 should fire on a Michigan Medicaid packet; a vacuous pass means the payer guard is wrong');
});

test('R-PA-MCMI-006 excepts an emergency admission from prior authorization', () => {
  const text = 'Michigan Medicaid beneficiary.\nInpatient admission request; emergency admission through the emergency department.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCMI-006').status, 'pass');
});

test('R-PA-MCMI-006 does not fire on a CHAMPS admission notification', () => {
  const text = 'Michigan Medicaid beneficiary.\nAdmission notification submitted via CHAMPS.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCMI-006').status, 'pass');
});

test('R-PA-MCMI-006 accepts an admission request naming the authorizing body', () => {
  const text = 'Michigan Medicaid beneficiary.\nInpatient admission request for CPT 27447.\n'
    + 'Submitted to the Program Review Division with the admitting diagnosis and clinical documentation.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCMI-006').status, 'pass');
});

test('R-PA-MCMI-007 does not treat an arbitrary 7xxxx code as a CT, MRI or PET', () => {
  const text = 'Michigan Medicaid beneficiary.\nRequested: CPT 76700 abdominal ultrasound.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCMI-007').status, 'pass');
});

test('R-PA-MCMI-007 flags an MRI that names no suspected problem', () => {
  const text = 'Michigan Medicaid beneficiary.\nRequested: MRI lumbar spine, CPT 72148.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCMI-007').status, 'flag');
});

test('R-PA-MCMI-008 accepts any one of the published expedited criteria', () => {
  for (const basis of [
    'Failure to render within 10 calendar days poses a serious risk to functional capacity.',
    'Needed to prevent further deterioration and irreversible loss of function.',
    'The service is required for discharge from an inpatient hospital on the submission date.',
  ]) {
    const text = 'Michigan Medicaid beneficiary.\nExpedited prior authorization requested.\n' + basis + '\n';
    const findings = runEngine(bundleOf(text));
    assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCMI-008').status, 'pass', basis);
  }
});

test('R-PA-MCMI-008 flags an expedited request stating no published criterion', () => {
  const text = 'Michigan Medicaid beneficiary.\nExpedited prior authorization requested for CPT 72148.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCMI-008').status, 'flag');
});

test('R-PA-MCMI-009 does not infer site-of-care review from hospital-outpatient surgery', () => {
  const text = 'Michigan Medicaid beneficiary.\nOutpatient hospital surgery, CPT 29881.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCMI-009').status, 'pass');
});

test('R-PA-MCMI-010 does not demand an NDC from a J-code alone', () => {
  const text = 'Michigan Medicaid beneficiary.\nRequested drug: J1745 infliximab.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCMI-010').status, 'pass');
});

test('R-PA-MCMI-012 does not treat an 81xxx code as a genetic test request', () => {
  const text = 'Michigan Medicaid beneficiary.\nRequested: CPT 81162.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCMI-012').status, 'pass');
});

test('R-PA-MCMI-012 flags a genetic test missing the indication', () => {
  const text = 'Michigan Medicaid beneficiary.\nGenetic test requested.\nTest name: BRCA1/2 sequencing.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCMI-012').status, 'flag');
});

test('R-PA-MCMI-012 flags a predictive genetic test with no informed consent', () => {
  const text = 'Michigan Medicaid beneficiary.\nPredictive genetic testing requested.\n'
    + 'Test name: BRCA1/2 sequencing. Family history of early-onset breast cancer.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCMI-012').status, 'flag');
});

test('R-PA-MCMI-012 accepts a predictive genetic test documenting consent', () => {
  const text = 'Michigan Medicaid beneficiary.\nPredictive genetic testing requested.\n'
    + 'Test name: BRCA1/2 sequencing. Family history of early-onset breast cancer.\n'
    + 'Informed consent obtained with pre-test genetic counseling.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCMI-012').status, 'pass');
});

test('R-PA-MCMI-012 accepts a diagnostic genetic test without a consent record', () => {
  // The consent requirement is statutory for PREDICTIVE testing; a diagnostic
  // request must not be flagged for the absence of one.
  const text = 'Michigan Medicaid beneficiary.\nGenetic test requested for diagnosis.\n'
    + 'Test name: CFTR sequencing. Clinical indication: suspected cystic fibrosis.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCMI-012').status, 'pass');
});

test('R-PA-MCMI-013 does not demand a diagnosis from a J-code alone', () => {
  const text = 'Michigan Medicaid beneficiary.\nRequested: J9299 nivolumab.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCMI-013').status, 'pass');
});

test('R-PA-MCMI-014 flags a retrospective review with no medical record', () => {
  const text = 'Michigan Medicaid beneficiary.\nRetrospective review requested for the nonauthorized days.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCMI-014').status, 'flag');
});

test('R-PA-MCMI-014 accepts a retrospective review with the medical record attached', () => {
  const text = 'Michigan Medicaid beneficiary.\nRetrospective review requested for the nonauthorized days.\n'
    + 'A copy of the medical record is attached.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCMI-014').status, 'pass');
});

test('R-PA-MCMI-015 does not infer a DME request from an E code alone', () => {
  const text = 'Michigan Medicaid beneficiary.\nRequested: E0601 CPAP device.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCMI-015').status, 'pass');
});

test('R-PA-MCMI-016 flags a psychiatric admission with no PIHP routing or clinical support', () => {
  const text = 'Michigan Medicaid beneficiary.\nInpatient psychiatric admission requested.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCMI-016').status, 'flag');
});

test('R-PA-MCMI-016 accepts a psychiatric admission routed to the PIHP', () => {
  const text = 'Michigan Medicaid beneficiary.\nInpatient psychiatric admission requested.\n'
    + 'Authorization requested from the local PIHP; medical necessity documented.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCMI-016').status, 'pass');
});

test('R-PA-MCMI-017 does not fire on the word transplant alone', () => {
  const text = 'Michigan Medicaid beneficiary.\nHistory of kidney transplant in 2019.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCMI-017').status, 'pass');
});

test('R-PA-MCMI-017 flags a transplant request with no OMA letter of authorization', () => {
  const text = 'Michigan Medicaid beneficiary.\nTransplant request for a liver.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCMI-017').status, 'flag');
});

test('R-PA-MCMI-017 accepts a transplant packet carrying the authorization letter', () => {
  const text = 'Michigan Medicaid beneficiary.\nTransplant request for a liver.\n'
    + 'Letter of authorization from the Office of Medical Affairs attached.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCMI-017').status, 'pass');
});

test('R-PA-MCMI-018 does not fire on off-label context alone', () => {
  const text = 'Michigan Medicaid beneficiary.\nRequested off-label use of this agent.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCMI-018').status, 'pass');
});

test('R-PA-MCMI-018 flags a clinical-trial request missing the NCT number and attestation', () => {
  const text = 'Michigan Medicaid beneficiary.\nRoutine services within a qualifying clinical trial.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCMI-018').status, 'flag');
});

test('R-PA-MCMI-018 accepts a clinical-trial request with the NCT number and attestation', () => {
  const text = 'Michigan Medicaid beneficiary.\nRoutine services within a qualifying clinical trial.\n'
    + 'NCT04123456. Signed Attestation to the Appropriateness of the Qualified Clinical Trial form attached.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCMI-018').status, 'pass');
});

test('R-PA-MCMI-020 does not fire on out-of-network wording alone', () => {
  const text = 'Michigan Medicaid beneficiary.\nOut-of-network request for CPT 70551.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCMI-020').status, 'pass');
});

test('R-PA-MCMI-020 flags a non-emergency out-of-state service with no written PA', () => {
  const text = 'Michigan Medicaid beneficiary.\nElective service by an out-of-state provider.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCMI-020').status, 'flag');
});

test('R-PA-MCMI-020 excepts genetic and molecular laboratory services', () => {
  const text = 'Michigan Medicaid beneficiary.\nMolecular laboratory service by an out-of-state provider.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCMI-020').status, 'pass');
});

// ---- Indiana Medicaid overlay (spec-v1365) ----

test('Indiana Medicaid rules are wired to the medicaid-in payer id', () => {
  const text = 'Indiana Medicaid member.\nInpatient stay following emergency services.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCIN-006').status, 'flag',
    'R-PA-MCIN-006 should fire on an Indiana Medicaid packet; a vacuous pass means the payer guard is wrong');
});

test('R-PA-MCIN-006 excepts burn care with an emergency or trauma admission type', () => {
  const text = 'Indiana Medicaid member.\nInpatient stay for burn care; emergency admission, admission type 1.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCIN-006').status, 'pass');
});

test('R-PA-MCIN-006 accepts an inpatient stay reported within 48 hours', () => {
  const text = 'Indiana Medicaid member.\nInpatient stay following emergency services.\n'
    + 'Reported to the PA contractor within 48 hours of admission.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCIN-006').status, 'pass');
});

test('R-PA-MCIN-007 does not infer an imaging workflow from an MRI request', () => {
  const text = 'Indiana Medicaid member.\nRequested: MRI lumbar spine, CPT 72148.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCIN-007').status, 'pass');
});

test('R-PA-MCIN-008 advises when an expedited request states no urgency (info)', () => {
  const text = 'Indiana Medicaid member.\nExpedited review requested for CPT 72148.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCIN-008').status, 'info');
});

test('R-PA-MCIN-009 does not fire on hospital-outpatient surgery', () => {
  const text = 'Indiana Medicaid member.\nOutpatient hospital surgery, CPT 29881.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCIN-009').status, 'pass');
});

test('R-PA-MCIN-009 flags an outpatient-typical procedure rendered inpatient with no PA', () => {
  const text = 'Indiana Medicaid member.\nProcedure ordinarily rendered on an outpatient basis, admitted inpatient.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCIN-009').status, 'flag');
});

test('R-PA-MCIN-009 accepts the inpatient setting when authorization was sought', () => {
  const text = 'Indiana Medicaid member.\nProcedure ordinarily rendered on an outpatient basis, admitted inpatient.\n'
    + 'Prior authorization requested for the inpatient setting.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCIN-009').status, 'pass');
});

test('R-PA-MCIN-011 does not infer a brand or step-therapy requirement from a J-code', () => {
  const text = 'Indiana Medicaid member.\nRequested: J1745 infliximab.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCIN-011').status, 'pass');
});

test('R-PA-MCIN-011 advises when a brand medically necessary request states no basis (info)', () => {
  const text = 'Indiana Medicaid member.\nBrand medically necessary drug requested.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCIN-011').status, 'info');
});

test('R-PA-MCIN-012 does not treat an 81xxx code as a genetic test request', () => {
  const text = 'Indiana Medicaid member.\nRequested: CPT 81162.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCIN-012').status, 'pass');
});

test('R-PA-MCIN-012 accepts a BRCA request with the test and indication', () => {
  const text = 'Indiana Medicaid member.\nGenetic testing requested.\n'
    + 'Test name: BRCA1/2 sequencing. Family history of early-onset breast cancer.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCIN-012').status, 'pass');
});

test('R-PA-MCIN-013 does not demand a diagnosis from a J-code alone', () => {
  const text = 'Indiana Medicaid member.\nRequested: J9299 nivolumab.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCIN-013').status, 'pass');
});

test('R-PA-MCIN-014 flags a retroactive request stating no published circumstance', () => {
  const text = 'Indiana Medicaid member.\nRetroactive prior authorization requested for CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCIN-014').status, 'flag');
});

test('R-PA-MCIN-014 accepts a retroactive request citing retroactive eligibility', () => {
  const text = 'Indiana Medicaid member.\nRetroactive prior authorization requested for CPT 27447.\n'
    + 'Member had retroactive eligibility entered by the caseworker.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCIN-014').status, 'pass');
});

test('R-PA-MCIN-015 accepts home health under the written post-discharge order', () => {
  const text = 'Indiana Medicaid member.\nHome health services continuing within 30 days of discharge.\n'
    + 'Physician ordered in writing upon discharge; 120 hours or fewer.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCIN-015').status, 'pass');
});

test('R-PA-MCIN-015 does not extend the post-discharge exemption to DME', () => {
  // 405 IAC 5-3-12 expressly excludes durable medical equipment from the
  // 120-hour carve-out, so a DME packet relying on it must still be flagged.
  const text = 'Indiana Medicaid member.\nDurable medical equipment ordered in writing upon discharge, within 30 days.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCIN-015').status, 'flag');
});

test('R-PA-MCIN-016 does not fire on generic mental-health context', () => {
  const text = 'Indiana Medicaid member.\nMental health follow-up visit.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCIN-016').status, 'pass');
});

test('R-PA-MCIN-016 flags a listed behavioral-health service with no medical necessity', () => {
  const text = 'Indiana Medicaid member.\nPartial hospitalization requested.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCIN-016').status, 'flag');
});

test('R-PA-MCIN-017 does not fire on the word transplant alone', () => {
  const text = 'Indiana Medicaid member.\nHistory of kidney transplant in 2019.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCIN-017').status, 'pass');
});

test('R-PA-MCIN-017 flags a stem-cell transplant with no authorization', () => {
  const text = 'Indiana Medicaid member.\nStem cell transplant planned.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCIN-017').status, 'flag');
});

test('R-PA-MCIN-018 does not infer a classification from clinical-trial context', () => {
  const text = 'Indiana Medicaid member.\nPatient is enrolled in a clinical trial.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCIN-018').status, 'pass');
});

test('R-PA-MCIN-019 flags an administrative review missing the authorization reference', () => {
  const text = 'Indiana Medicaid member.\nAdministrative review requested; the service is medically necessary.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCIN-019').status, 'flag');
});

test('R-PA-MCIN-019 accepts a review with the authorization number and the reasons', () => {
  const text = 'Indiana Medicaid member.\nAdministrative review requested.\n'
    + 'Authorization number 12345678; the requested services are medically necessary because conservative care failed.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCIN-019').status, 'pass');
});

test('R-PA-MCIN-020 does not fire on out-of-network wording alone', () => {
  const text = 'Indiana Medicaid member.\nOut-of-network request for CPT 70551.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCIN-020').status, 'pass');
});

test('R-PA-MCIN-020 flags an out-of-state service with no prior authorization', () => {
  // Raised from info to flag with this slice: Indiana states the requirement as
  // mandatory -- all services from out-of-state providers require PA.
  const text = 'Indiana Medicaid member.\nService by an out-of-state provider.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCIN-020').status, 'flag');
});

test('R-PA-MCIN-020 accepts an out-of-state service with prior authorization', () => {
  const text = 'Indiana Medicaid member.\nService by an out-of-state provider.\nPrior authorization obtained.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCIN-020').status, 'pass');
});

// ---- Arizona AHCCCS overlay (spec-v1368) ----

test('Arizona AHCCCS rules are wired to the medicaid-az payer id', () => {
  const text = 'AHCCCS member.\nInpatient admission notification.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCAZ-006').status, 'flag',
    'R-PA-MCAZ-006 should fire on an AHCCCS packet; a vacuous pass means the payer guard is wrong');
});

test('R-PA-MCAZ-006 names each document the admission notification is missing', () => {
  const text = 'AHCCCS member.\nInpatient admission notification.\nHospital face sheet attached.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-MCAZ-006');
  assert.equal(f.status, 'flag');
  assert.match(f.note, /history and physical/);
  assert.doesNotMatch(f.note, /face sheet/);
});

test('R-PA-MCAZ-006 accepts a complete admission notification', () => {
  const text = 'AHCCCS member.\nInpatient admission notification; admission status documented.\n'
    + 'Hospital face sheet attached. History and physical attached.\n'
    + 'Inpatient admission order signed by the attending MD.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCAZ-006').status, 'pass');
});

test('R-PA-MCAZ-007 does not infer an imaging workflow from an MRI request', () => {
  const text = 'AHCCCS member.\nRequested: MRI lumbar spine, CPT 72148.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCAZ-007').status, 'pass');
});

test('R-PA-MCAZ-008 accepts the urgency standard AAC R9-34-306(B) publishes', () => {
  // Unlike most payers in this program, Arizona's standard really does turn on
  // the ability to attain, maintain, or regain maximum function -- by rule.
  const text = 'AHCCCS member.\nExpedited authorization requested.\n'
    + 'The standard timeframe could seriously jeopardize the ability to regain maximum function.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCAZ-008').status, 'pass');
});

test('R-PA-MCAZ-008 flags an expedited request stating no standard', () => {
  const text = 'AHCCCS member.\nExpedited authorization requested for CPT 72148.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCAZ-008').status, 'flag');
});

test('R-PA-MCAZ-009 does not infer site-of-care review from hospital-outpatient surgery', () => {
  const text = 'AHCCCS member.\nOutpatient hospital surgery, CPT 29881.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCAZ-009').status, 'pass');
});

test('R-PA-MCAZ-010 does not demand an NDC from a J-code alone', () => {
  const text = 'AHCCCS member.\nRequested drug: J1745 infliximab.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCAZ-010').status, 'pass');
});

test('R-PA-MCAZ-011 does not infer step therapy from a specialty-drug label', () => {
  const text = 'AHCCCS member.\nRequested: specialty drug J1745 infusion.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCAZ-011').status, 'pass');
});

test('R-PA-MCAZ-012 does not treat an 81xxx code as a genetic test request', () => {
  const text = 'AHCCCS member.\nRequested: CPT 81162.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCAZ-012').status, 'pass');
});

test('R-PA-MCAZ-012 names each minimum document a genetic request is missing', () => {
  const text = 'AHCCCS member.\nGenetic testing requested.\nFamily history of early-onset breast cancer.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-MCAZ-012');
  assert.equal(f.status, 'flag');
  assert.match(f.note, /coverage criteria/);
  assert.match(f.note, /genetic counselor/);
  assert.doesNotMatch(f.note, /family history/);
});

test('R-PA-MCAZ-012 accepts a genetic request with all minimum documentation', () => {
  const text = 'AHCCCS member.\nGenetic testing requested; consistent with the coverage criteria.\n'
    + 'Recommended by a licensed genetic counselor. Family history of early-onset breast cancer.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCAZ-012').status, 'pass');
});

test('R-PA-MCAZ-013 does not demand a diagnosis from a J-code alone', () => {
  const text = 'AHCCCS member.\nRequested: J9299 nivolumab.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCAZ-013').status, 'pass');
});

test('R-PA-MCAZ-014 waives notice when eligibility posts after discharge', () => {
  const text = 'AHCCCS member.\nRetroactive eligibility; eligibility posted after discharge.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCAZ-014').status, 'pass');
});

test('R-PA-MCAZ-014 advises when an in-hospital retroactive case shows no notice (info)', () => {
  const text = 'AHCCCS member.\nRetroactive eligibility posted while still hospitalized.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCAZ-014').status, 'info');
});

test('R-PA-MCAZ-015 exempts the first five home health visits after discharge', () => {
  const text = 'AHCCCS member.\nHome health nursing within the first five home health visits after acute discharge.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCAZ-015').status, 'pass');
});

test('R-PA-MCAZ-015 flags home health nursing with no prescription or face-to-face record', () => {
  const text = 'AHCCCS member.\nHome health nursing requested for eight weeks.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCAZ-015').status, 'flag');
});

test('R-PA-MCAZ-015 accepts home health nursing with both documents', () => {
  const text = 'AHCCCS member.\nHome health nursing requested for eight weeks.\n'
    + 'Prescription from the ordering prescriber stating nursing duties and duration. Face-to-face encounter documented.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCAZ-015').status, 'pass');
});

test('R-PA-MCAZ-016 does not fire on generic mental-health context', () => {
  const text = 'AHCCCS member.\nMental health follow-up visit.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCAZ-016').status, 'pass');
});

test('R-PA-MCAZ-016 flags a psychiatric admission with no care-coordination evidence', () => {
  const text = 'AHCCCS member.\nInpatient psychiatric admission requested.\nPsychiatric evaluation attached.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCAZ-016').status, 'flag');
});

test('R-PA-MCAZ-016 accepts a psychiatric admission with coordination and evaluation', () => {
  const text = 'AHCCCS member.\nInpatient psychiatric admission requested.\n'
    + 'Psychiatric evaluation attached. Care coordination with the outpatient treatment team documented.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCAZ-016').status, 'pass');
});

test('R-PA-MCAZ-017 requires PA for a corneal transplant, which AHCCCS does not exempt', () => {
  const text = 'AHCCCS member.\nCorneal transplant planned.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCAZ-017').status, 'flag');
});

test('R-PA-MCAZ-017 flags a transplant for a Federal Emergency Services enrollee', () => {
  const text = 'AHCCCS member enrolled in Federal Emergency Services.\nTransplant request for a liver; prior authorization requested.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-MCAZ-017');
  assert.equal(f.status, 'flag');
  assert.match(f.note, /not eligible for transplantation/);
});

test('R-PA-MCAZ-017 accepts a transplant request with prior authorization', () => {
  const text = 'AHCCCS member.\nTransplant request for a liver.\nPrior authorization submitted to the DFSM PA Unit.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCAZ-017').status, 'pass');
});

test('R-PA-MCAZ-018 does not infer a classification from clinical-trial context', () => {
  const text = 'AHCCCS member.\nPatient is enrolled in a clinical trial.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCAZ-018').status, 'pass');
});

test('R-PA-MCAZ-019 does not treat a grievance as an appeal', () => {
  const text = 'AHCCCS member.\nMember filed a grievance about billing.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCAZ-019').status, 'pass');
});

test('R-PA-MCAZ-020 does not fire on out-of-network wording alone', () => {
  const text = 'AHCCCS member.\nOut-of-network request for CPT 70551.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCAZ-020').status, 'pass');
});

test('R-PA-MCAZ-020 advises when an out-of-state facility is not shown to be the nearest (info)', () => {
  const text = 'AHCCCS member.\nEmergency transport to an out-of-state facility.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCAZ-020').status, 'info');
});

// ---- Washington Apple Health overlay (spec-v1371) ----

test('Washington Apple Health rules are wired to the medicaid-wa payer id', () => {
  const text = 'Washington Apple Health client.\nPrior authorization request for CPT 27447.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCWA-006').status, 'flag',
    'R-PA-MCWA-006 should fire on a Washington packet; a vacuous pass means the payer guard is wrong');
});

test('R-PA-MCWA-006 flags a fax request with justification but no 13-835 form', () => {
  const text = 'Washington Apple Health client.\nPrior authorization request by fax.\nMedical justification attached.\n';
  const findings = runEngine(bundleOf(text));
  assert.match(findings.find((x) => x.ruleId === 'R-PA-MCWA-006').note, /13-835/);
});

test('R-PA-MCWA-006 does not require the 13-835 form on a ProviderOne submission', () => {
  const text = 'Washington Apple Health client.\nPrior authorization request via ProviderOne direct data entry.\nMedical justification attached.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCWA-006').status, 'pass');
});

test('R-PA-MCWA-008 does not ask an EPA packet for clinical urgency', () => {
  // In Washington, EPA is a self-created authorization number, not an urgent
  // review. A packet with the number and no urgency wording is complete.
  const text = 'Washington Apple Health client.\nExpedited prior authorization used; EPA number 870001375.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCWA-008').status, 'pass');
});

test('R-PA-MCWA-008 flags an EPA packet with no EPA number', () => {
  const text = 'Washington Apple Health client.\nBilled under expedited prior authorization.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-MCWA-008');
  assert.equal(f.status, 'flag');
  assert.match(f.note, /not an urgent review/);
});

test('R-PA-MCWA-007 does not infer an imaging workflow from an MRI request', () => {
  const text = 'Washington Apple Health client.\nRequested: MRI lumbar spine, CPT 72148.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCWA-007').status, 'pass');
});

test('R-PA-MCWA-009 does not infer site-of-care review from hospital-outpatient surgery', () => {
  const text = 'Washington Apple Health client.\nOutpatient hospital surgery, CPT 29881.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCWA-009').status, 'pass');
});

test('R-PA-MCWA-010 does not demand an NDC from a J-code alone', () => {
  const text = 'Washington Apple Health client.\nRequested drug: J1745 infliximab.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCWA-010').status, 'pass');
});

test('R-PA-MCWA-011 does not infer step therapy from a specialty-drug label', () => {
  const text = 'Washington Apple Health client.\nRequested: specialty drug J1745 infusion.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCWA-011').status, 'pass');
});

test('R-PA-MCWA-012 does not infer a genetic workflow from an 81xxx code', () => {
  const text = 'Washington Apple Health client.\nRequested: CPT 81162.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCWA-012').status, 'pass');
});

test('R-PA-MCWA-013 does not demand a diagnosis from a J-code alone', () => {
  const text = 'Washington Apple Health client.\nRequested: J9299 nivolumab.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCWA-013').status, 'pass');
});

test('R-PA-MCWA-014 advises when a retroactive request has no intake form (info)', () => {
  const text = 'Washington Apple Health client.\nRetroactive authorization requested; medical justification attached.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCWA-014').status, 'info');
});

test('R-PA-MCWA-014 accepts a retroactive request through ProviderOne with justification', () => {
  const text = 'Washington Apple Health client.\nRetroactive authorization requested via ProviderOne.\nMedical justification attached.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCWA-014').status, 'pass');
});

test('R-PA-MCWA-015 exempts home health delivered by telemedicine', () => {
  const text = 'Washington Apple Health client.\nHome health services delivered through telemedicine.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCWA-015').status, 'pass');
});

test('R-PA-MCWA-015 advises when home health lacks the face-to-face encounter (info)', () => {
  const text = 'Washington Apple Health client.\nHome health skilled nursing visits requested.\nSigned order attached.\n';
  const findings = runEngine(bundleOf(text));
  const f = findings.find((x) => x.ruleId === 'R-PA-MCWA-015');
  assert.equal(f.status, 'info');
  assert.match(f.note, /182-551-2040/);
});

test('R-PA-MCWA-015 accepts home health with the encounter and a signed order', () => {
  const text = 'Washington Apple Health client.\nHome health skilled nursing visits requested.\n'
    + 'Face-to-face encounter documented. Signed order attached.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCWA-015').status, 'pass');
});

test('R-PA-MCIN-010 does not demand an NDC from a J-code alone', () => {
  const text = 'Indiana Medicaid member.\nRequested drug: J1745 infliximab.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCIN-010').status, 'pass');
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

test('R-PA-MCWA-016 flags a psychiatric transfer with no post-stabilization approval', () => {
  const text = 'Washington Apple Health client.\nTransferring hospital: inpatient psychiatric transfer.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCWA-016').status, 'flag');
});

test('R-PA-MCWA-016 accepts a psychiatric transfer with the authorization number', () => {
  const text = 'Washington Apple Health client.\nTransferring hospital: inpatient psychiatric transfer.\n'
    + 'Prior approval of post-stabilization care from the mental health designee; authorization number recorded.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCWA-016').status, 'pass');
});

test('R-PA-MCWA-017 does not fire on the word transplant alone', () => {
  const text = 'Washington Apple Health client.\nHistory of kidney transplant in 2019.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCWA-017').status, 'pass');
});

test('R-PA-MCWA-017 flags a transplant request with no HCA-approved facility', () => {
  // Replaces a test that asserted a "Medicaid-designated transplant-center
  // routing" requirement; HCA's actual rule is an approved, certified facility.
  const text = 'Washington Apple Health client.\nTransplant request for a kidney.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCWA-017').status, 'flag');
});

test('R-PA-MCWA-017 exempts corneal transplants from the facility-approval requirement', () => {
  const text = 'Washington Apple Health client.\nTransplant request: corneal transplant.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCWA-017').status, 'pass');
});

test('R-PA-MCWA-017 flags an out-of-state transplant with no prior authorization', () => {
  const text = 'Washington Apple Health client.\nTransplant request at an out-of-state transplant facility.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCWA-017').status, 'flag');
});

test('R-PA-MCWA-018 advises when a noncovered service has no exception-to-rule request (info)', () => {
  const text = 'Washington Apple Health client.\nThis is a noncovered service.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCWA-018').status, 'info');
});

test('R-PA-MCWA-018 accepts an exception-to-rule request under WAC 182-501-0160', () => {
  const text = 'Washington Apple Health client.\nThis is a noncovered service.\nException to rule requested under WAC 182-501-0160.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCWA-018').status, 'pass');
});

test('R-PA-MCWA-020 does not require PA for emergency out-of-state care', () => {
  const text = 'Washington Apple Health client.\nEmergency care at an out-of-state hospital.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCWA-020').status, 'pass');
});

test('R-PA-MCWA-020 treats a designated bordering-city hospital as in-state', () => {
  const text = 'Washington Apple Health client.\nElective surgery at an out-of-state hospital in a designated bordering city.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCWA-020').status, 'pass');
});

test('R-PA-MCWA-020 flags elective out-of-state care with no request form', () => {
  const text = 'Washington Apple Health client.\nElective surgery at an out-of-state hospital.\n';
  const findings = runEngine(bundleOf(text));
  assert.equal(findings.find((x) => x.ruleId === 'R-PA-MCWA-020').status, 'flag');
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

// ---- spec-v1362: every payer guard must name a payer id that can actually occur ----
//
// Each overlay rule self-gates on `bundle.payer !== '<id>'`. Writing that id from
// the rule-id prefix instead of lib/pa/payer.js (e.g. 'mcmi' for the MCMI rules,
// when the payer id is 'medicaid-mi') disables the whole overlay silently: every
// rule returns its vacuous pass and no test fails, because a pass is what an
// off-payer packet is supposed to produce. One assertion closes it.

test('every payer guard in lib/pa/rules.js names a real payer bucket', async () => {
  const { readFileSync } = await import('node:fs');
  const { fileURLToPath } = await import('node:url');
  const root = fileURLToPath(new URL('../..', import.meta.url));
  const src = readFileSync(`${root}/lib/pa/rules.js`, 'utf8');
  const { PAYER_BUCKETS } = await import('../../lib/pa/payer.js');
  // PAYER_BUCKETS is an array of id STRINGS, not objects.
  const known = new Set(PAYER_BUCKETS);
  const guards = [...new Set([...src.matchAll(/bundle\.payer !== '([a-z0-9-]+)'/g)].map((m) => m[1]))];
  assert.ok(guards.length > 30, 'expected the overlay guards to be found; the pattern may have drifted');
  const unknown = guards.filter((g) => !known.has(g));
  assert.deepEqual(unknown, [], 'payer guards that no packet can ever match, so their rules never run');
});
