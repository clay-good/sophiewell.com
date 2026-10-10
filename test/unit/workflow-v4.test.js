// spec-v4 §7 step v4.9: each generator validated to produce all required fields.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildHipaaAuthorization, buildROIRequest, buildDischargeInstructions,
  buildSpecialtyVisit, buildWalletCard, specialtyQuestions,
} from '../../lib/workflow-v4.js';

function headings(doc) { return doc.sections.map((s) => s.heading); }

test('HIPAA Authorization includes the 45 CFR 164.508 core elements', () => {
  const r = buildHipaaAuthorization({ patient: 'Jane Doe', plan: 'Acme Health',
    info: 'Records 2024-01-01 to 2024-12-31', recipient: 'Dr. Smith',
    purpose: 'continuity of care', expiration: '2027-01-01' });
  const h = headings(r);
  assert.ok(h.includes('Patient'));
  assert.ok(h.includes('Information to be released'));
  assert.ok(h.includes('Recipient (who may receive the PHI)'));
  assert.ok(h.includes('Purpose of the disclosure'));
  assert.ok(h.includes('Expiration'));
  assert.ok(h.includes('Right to revoke'));
  assert.ok(h.includes('Signature'));
  assert.match(JSON.stringify(r), /Jane Doe/);
});

test('ROI request includes patient, records, delivery, signature', () => {
  const r = buildROIRequest({ patient: 'Jane', dob: '1990-01-01',
    fromProvider: 'Acme', toRecipient: 'Beta', dateRange: '2024',
    recordsRequested: 'all clinic notes', deliveryMethod: 'secure email' });
  const h = headings(r);
  assert.ok(h.includes('Patient'));
  assert.ok(h.includes('Records requested'));
  assert.ok(h.includes('Authorization'));
  assert.ok(h.includes('Signature'));
});

test('Discharge instructions includes diagnosis, follow-up, return precautions, meds', () => {
  const r = buildDischargeInstructions({
    diagnosis: 'Pneumonia', followUpDate: '2026-05-15',
    returnPrecautions: ['fever > 38.5C', 'shortness of breath'],
    medications: ['Amoxicillin 500 mg PO TID x 7d'],
    notes: 'Rest and hydrate.',
  });
  const h = headings(r);
  assert.ok(h.includes('Diagnosis'));
  assert.ok(h.includes('Follow-up appointment'));
  assert.ok(h.some((x) => /Return precautions/.test(x)));
  assert.ok(h.includes('Medications'));
});

test('Specialty visit Q generator: cardiology has >=5 questions', () => {
  const qs = specialtyQuestions('cardiology');
  assert.ok(qs && qs.length >= 5);
});

test('Specialty visit: covers all 8 documented specialties', () => {
  for (const s of ['cardiology','oncology','ortho','gi','derm','neuro','obgyn','peds']) {
    assert.ok(specialtyQuestions(s), `missing ${s}`);
  }
});

test('Specialty visit: unknown specialty returns null', () => {
  assert.equal(specialtyQuestions('unknown'), null);
});

test('Specialty visit builder returns title + sections', () => {
  const r = buildSpecialtyVisit({ specialty: 'oncology', visitContext: 'newly diagnosed' });
  assert.match(r.title, /Oncology/i);
  assert.ok(r.sections.length >= 2);
  assert.equal(buildSpecialtyVisit({ specialty: 'unknown' }), null);
});

test('Wallet card: includes patient, allergies, meds, care team', () => {
  const r = buildWalletCard({ patientName: 'Jane Doe', allergies: ['penicillin'],
    conditions: ['HTN'], medications: ['lisinopril 10 mg PO daily'],
    emergencyContact: 'John Doe 555-1234', primaryProvider: 'Dr. Smith', pharmacy: 'Acme Rx' });
  const h = headings(r);
  assert.ok(h.includes('Patient'));
  assert.ok(h.includes('Allergies'));
  assert.ok(h.includes('Conditions'));
  assert.ok(h.some((x) => /Medications/.test(x)));
  assert.ok(h.includes('Care team'));
});

test('Wallet card defaults: NKDA appears when allergies empty', () => {
  const r = buildWalletCard({ patientName: 'X' });
  const allergiesSection = r.sections.find((s) => s.heading === 'Allergies');
  assert.deepEqual(allergiesSection.items, ['NKDA']);
});

test('All builders produce a documented warnings array', () => {
  for (const r of [
    buildHipaaAuthorization({}), buildROIRequest({}),
    buildDischargeInstructions({}), buildWalletCard({}),
    buildSpecialtyVisit({ specialty: 'gi' }),
  ]) {
    assert.ok(Array.isArray(r.warnings) && r.warnings.length >= 1);
  }
});

// 45 CFR 164.508(c), re-read October 9, 2026: the six core elements and three required statements. The template
// carried only the revocation statement, and a blank expiration printed "12 months from signature".
test('the HIPAA authorization carries every statement 164.508(c)(2) requires, and never invents an expiration', () => {
  const all = (r) => r.sections.flatMap((s) => [...(s.paragraphs || []), ...(s.items || [])]).join(' ');
  const text = all(buildHipaaAuthorization({ patient: 'Jane Doe', plan: 'Acme Health', info: 'records', recipient: 'Dr. B', purpose: 'care' }));
  assert.match(text, /revoke this authorization in writing/);
  assert.match(text, /To revoke it, I send a signed written notice/);
  assert.match(text, /will not be conditioned on whether I sign/);
  assert.match(text, /may be redisclosed by the recipient and may no longer be protected/);
  assert.match(text, /personal representative, describe the authority/);
  assert.match(text, /\[expiration date, or an event that ends this authorization\]/);
  assert.doesNotMatch(text, /12 months/);
});
