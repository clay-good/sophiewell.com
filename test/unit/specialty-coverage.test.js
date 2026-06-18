// spec-v11 §4.3 / spec-v29 §5.1: specialty tags. `META[id].specialties` are
// additive search tokens (lib/prompt.js) and drive the audience/specialty
// filter (app.js), so an untagged clinical tile is under-discoverable. These
// tests pin two invariants the spec describes but never enforced in code:
//   1. every CLINICAL tile carries at least one specialty (coverage), and
//   2. specialty values stay within the CLOSED vocabulary (no typos / drift).
// The spec-v64-followup SPECIALTIES_BACKFILL (lib/meta.js) completed the
// coverage; this file keeps it from regressing.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { META } from '../../lib/meta.js';

// The closed specialty vocabulary (spec-v11 §4.3). A new specialty must be
// added here deliberately -- this is the enforcement point that was missing.
const ALLOWED_SPECIALTIES = new Set([
  'addiction-medicine', 'anesthesia', 'anesthesiology', 'blood-bank', 'burn',
  'cardiac-surgery', 'cardiology', 'case-management', 'critical-care',
  'dermatology', 'dialysis-nursing', 'diabetes-education', 'echocardiography', 'emergency-medicine', 'ems',
  'endocrinology', 'family-medicine', 'gastroenterology', 'geriatrics',
  'headache', 'interventional-radiology',
  'hematology', 'hepatology', 'infectious-disease', 'internal-medicine',
  'maternal-fetal-medicine', 'movement-disorders', 'neonatology', 'nephrology', 'neurocritical-care',
  'neurology', 'otolaryngology',
  'neurosurgery', 'nursing-ed', 'nursing-er', 'nursing-floor', 'nursing-general',
  'nursing-icu', 'nursing-infusion', 'nursing-ld', 'nursing-neuro',
  'nursing-nicu', 'nursing-nursery', 'nursing-ob', 'nursing-onc', 'nursing-or',
  'nursing-peds', 'nursing-periop', 'nursing-picu', 'nursing-postop',
  'nursing-postpartum', 'nursing-psych',
  'nursing-preop', 'nursing-procedural', 'nursing-rehab', 'nursing-tele',
  'nursing-transport',
  'nutrition', 'obstetrics', 'obstetrics-gynecology', 'occupational-therapy',
  'oncology', 'orthopedics', 'pain-management', 'pain-medicine', 'palliative',
  'palliative-care', 'paramedicine', 'pathology', 'burn-surgery',
  'pediatric-cardiology', 'pediatric-critical-care', 'pediatric-emergency',
  'pediatric-emergency-medicine', 'pediatric-nephrology', 'pediatric-orthopedics',
  'pediatric-surgery',
  'pediatrics', 'perfusion', 'periop', 'pharmacy',
  'physical-medicine-rehabilitation',
  'physical-therapy', 'poison-control', 'primary-care', 'psychiatry', 'pulmonology',
  'quality-safety', 'rehabilitation', 'respiratory-therapy', 'rheumatology', 'social-work',
  'speech-language-pathology', 'sports-medicine', 'stroke', 'surgery', 'surgery-general',
  'toxicology', 'transfusion-medicine', 'transplant', 'trauma-surgery',
  'urgent-care',
  'urology', 'vascular-surgery', 'wilderness-medicine', 'wound-care',
]);

function clinicalIds() {
  const src = readFileSync(new URL('../../app.js', import.meta.url), 'utf8');
  const body = src.match(/const UTILITIES = \[([\s\S]*?)\n\];/);
  if (!body) throw new Error('specialty-coverage: could not find UTILITIES in app.js');
  return [...body[1].matchAll(/\{ id: '([^']+)'[^}]*\}/g)]
    .filter((m) => /clinical:\s*true/.test(m[0]))
    .map((m) => m[1]);
}

test('coverage: every clinical tile carries at least one specialty', () => {
  const missing = clinicalIds().filter((id) => !(META[id] && Array.isArray(META[id].specialties) && META[id].specialties.length));
  assert.deepEqual(missing, [], `clinical tiles missing a specialty tag:\n  - ${missing.join('\n  - ')}`);
});

test('closed vocabulary: every specialty value is a known kebab-case term', () => {
  const offenders = [];
  for (const [id, m] of Object.entries(META)) {
    if (!m || !Array.isArray(m.specialties)) continue;
    for (const s of m.specialties) {
      if (typeof s !== 'string' || !/^[a-z]+(-[a-z]+)*$/.test(s)) offenders.push(`${id}: malformed specialty "${s}"`);
      else if (!ALLOWED_SPECIALTIES.has(s)) offenders.push(`${id}: "${s}" is not in the closed vocabulary`);
    }
  }
  assert.deepEqual(offenders, [], `specialty vocabulary violations:\n  - ${offenders.join('\n  - ')}`);
});

test('no specialty list contains a duplicate', () => {
  const offenders = [];
  for (const [id, m] of Object.entries(META)) {
    if (!m || !Array.isArray(m.specialties)) continue;
    if (new Set(m.specialties).size !== m.specialties.length) offenders.push(`${id}: duplicate specialty`);
  }
  assert.deepEqual(offenders, []);
});
