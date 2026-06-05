// spec-v52 §4.3: PA document classifier + payer-detect.
//
// One assertion per role / payer bucket exercising the keyword
// anchors. Failures here cascade into wrong rule scoping
// (especially R-PA-005, which is scoped to clinical-note documents),
// so the contract is asserted here rather than via UI integration.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { classifyDocument } from '../../lib/pa/classify.js';
import { detectPayer, detectPacketPayer } from '../../lib/pa/payer.js';
import { buildBundle, runEngine } from '../../lib/pa/engine.js';

// ---- classifier ----

test('classifyDocument: clinical-note via HPI / A&P anchors', () => {
  assert.equal(classifyDocument('Chief complaint: cough\nHistory of present illness: ...'), 'clinical-note');
  assert.equal(classifyDocument('Assessment and plan: continue lisinopril.'), 'clinical-note');
  assert.equal(classifyDocument('SOAP note: S O A P sections follow.'), 'clinical-note');
});

test('classifyDocument: pa-form via authorization-request anchors', () => {
  assert.equal(classifyDocument('Prior Authorization Request Form\nMember:...'), 'pa-form');
  assert.equal(classifyDocument('Request for Prior Authorization'), 'pa-form');
});

test('classifyDocument: medical-necessity-letter', () => {
  assert.equal(classifyDocument('Letter of Medical Necessity\nTo whom it may concern,'), 'medical-necessity-letter');
});

test('classifyDocument: lab-result via reference range', () => {
  assert.equal(classifyDocument('Laboratory report\nReference range: 3.5-5.0'), 'lab-result');
});

test('classifyDocument: imaging-report via MRI + findings', () => {
  assert.equal(classifyDocument('MRI of the lumbar spine.\nFindings: ...\nImpression: ...'), 'imaging-report');
});

test('classifyDocument: prior-auth-denial', () => {
  assert.equal(classifyDocument('NOTICE OF DENIAL\nDenial reason: not medically necessary.'), 'prior-auth-denial');
});

test('classifyDocument: empty / unrecognized text falls back to "other"', () => {
  assert.equal(classifyDocument(''), 'other');
  assert.equal(classifyDocument('random text with no anchors'), 'other');
});

// ---- payer-detect ----

test('detectPayer: Medicare Advantage beats Medicare even when both phrases present', () => {
  assert.equal(detectPayer('Aetna Medicare Advantage plan'), 'cms-medicare-advantage');
  assert.equal(detectPayer('Humana Gold Plus MA plan'), 'cms-medicare-advantage');
});

test('detectPayer: Medicaid', () => {
  // 'Medi-Cal' now routes to its own per-state bucket (wave 52-30); a
  // state-agnostic Medicaid string stays in the generic 'medicaid' bucket.
  assert.equal(detectPayer('California Medi-Cal program'), 'medicaid-ca');
  assert.equal(detectPayer('Member is enrolled in state Medicaid managed care'), 'medicaid');
});

test('detectPayer: Medicare FFS', () => {
  assert.equal(detectPayer('Medicare Part B covered service'), 'cms-medicare-ffs');
  assert.equal(detectPayer('MAC jurisdiction Noridian Medicare'), 'cms-medicare-ffs');
});

test('detectPayer: commercial fallthrough', () => {
  // Generic Blues (not a named overlay licensee) and other commercial plans fall through.
  assert.equal(detectPayer('Horizon BlueCross BlueShield of New Jersey PPO plan'), 'commercial');
  assert.equal(detectPayer('TRICARE West region plan'), 'commercial');
});

test('detectPayer: Aetna commercial routes to its own bucket (wave 52-7)', () => {
  // Plain Aetna commercial -> the named 'aetna' overlay bucket.
  assert.equal(detectPayer('Aetna Choice POS II member'), 'aetna');
  // ...but Aetna Medicare Advantage still routes to the MA bucket (checked first).
  assert.equal(detectPayer('Aetna Medicare Advantage HMO'), 'cms-medicare-advantage');
});

test('detectPayer: UnitedHealthcare commercial routes to its own bucket (wave 52-8)', () => {
  // Plain UHC commercial -> the named 'uhc' overlay bucket.
  assert.equal(detectPayer('UnitedHealthcare Choice Plus'), 'uhc');
  assert.equal(detectPayer('United Healthcare PPO member'), 'uhc');
  // ...but UHC Medicare Advantage still routes to the MA bucket (checked first).
  assert.equal(detectPayer('UnitedHealthcare Medicare Advantage HMO'), 'cms-medicare-advantage');
});

test('detectPayer: Anthem / Elevance commercial routes to its own bucket (wave 52-9)', () => {
  // Anthem (and the Elevance Health parent) -> the named 'anthem' overlay bucket.
  assert.equal(detectPayer('Anthem Blue Cross PPO plan'), 'anthem');
  assert.equal(detectPayer('Elevance Health member'), 'anthem');
  // ...but an explicit Anthem Medicare Advantage string still routes to the MA bucket.
  assert.equal(detectPayer('Anthem Medicare Advantage HMO'), 'cms-medicare-advantage');
  // Generic Blues without the Anthem/Elevance name stay in the commercial bucket.
  assert.equal(detectPayer('Regence BlueShield PPO'), 'commercial');
});

test('detectPayer: Cigna commercial routes to its own bucket (wave 52-10)', () => {
  // Plain Cigna commercial (and the Evernorth health-services brand) -> the
  // named 'cigna' overlay bucket.
  assert.equal(detectPayer('Cigna Open Access Plus'), 'cigna');
  assert.equal(detectPayer('Evernorth Behavioral Health member'), 'cigna');
  // ...but an explicit Cigna Medicare Advantage string still routes to the MA bucket.
  assert.equal(detectPayer('Cigna Medicare Advantage HMO'), 'cms-medicare-advantage');
});

test('detectPayer: Humana commercial routes to its own bucket (wave 52-11)', () => {
  // Plain Humana commercial (and the CenterWell brand) -> the named 'humana'
  // overlay bucket.
  assert.equal(detectPayer('Humana ChoiceCare PPO'), 'humana');
  assert.equal(detectPayer('CenterWell Pharmacy specialty request'), 'humana');
  // ...but Humana Gold Plus (and any explicit Medicare Advantage string) still
  // routes to the MA bucket (checked first).
  assert.equal(detectPayer('Humana Gold Plus HMO'), 'cms-medicare-advantage');
  assert.equal(detectPayer('Humana Medicare Advantage PPO'), 'cms-medicare-advantage');
});

test('detectPayer: HCSC (Blue Cross Blue Shield of IL/TX/MT/NM/OK) routes to its own bucket (wave 52-12)', () => {
  // The five HCSC state plans (and the corporate name / acronym) -> the named
  // 'hcsc' overlay bucket.
  assert.equal(detectPayer('Blue Cross Blue Shield of Illinois PPO'), 'hcsc');
  assert.equal(detectPayer('Blue Cross and Blue Shield of Texas member'), 'hcsc');
  assert.equal(detectPayer('Health Care Service Corporation'), 'hcsc');
  // ...but generic / other-licensee Blues stay in the commercial fall-through.
  assert.equal(detectPayer('Premera Blue Cross PPO plan'), 'commercial');
  assert.equal(detectPayer('Wellmark Blue Cross Blue Shield PPO'), 'commercial');
  // ...and an explicit Medicare Advantage string still routes to the MA bucket.
  assert.equal(detectPayer('Blue Cross Medicare Advantage from Illinois'), 'cms-medicare-advantage');
});

test('detectPayer: Highmark (Blue Cross Blue Shield of PA/WV/DE + western NY) routes to its own bucket (wave 52-13)', () => {
  // The distinct 'highmark' brand anchor -> the named 'highmark' overlay bucket.
  assert.equal(detectPayer('Highmark Blue Shield PPO'), 'highmark');
  assert.equal(detectPayer('Highmark Blue Cross Blue Shield West Virginia'), 'highmark');
  // ...but generic / other-licensee Blues stay in the commercial fall-through.
  assert.equal(detectPayer('Capital BlueCross PPO plan'), 'commercial');
  // ...and an explicit Medicare Advantage string still routes to the MA bucket.
  assert.equal(detectPayer('Highmark Medicare Advantage Freedom Blue PPO'), 'cms-medicare-advantage');
});

test('detectPayer: Florida Blue / GuideWell (Blue Cross and Blue Shield of Florida) routes to its own bucket (wave 52-14)', () => {
  // The 'florida blue' / 'guidewell' trade names and the plan name -> the
  // named 'florida-blue' overlay bucket.
  assert.equal(detectPayer('Florida Blue PPO plan'), 'florida-blue');
  assert.equal(detectPayer('Blue Cross and Blue Shield of Florida member'), 'florida-blue');
  assert.equal(detectPayer('GuideWell health plan'), 'florida-blue');
  // ...but generic / other-licensee Blues stay in the commercial fall-through.
  assert.equal(detectPayer('Capital BlueCross PPO plan'), 'commercial');
  // ...and an explicit Medicare Advantage string still routes to the MA bucket.
  assert.equal(detectPayer('Florida Blue Medicare Advantage HMO plan'), 'cms-medicare-advantage');
});

test('detectPayer: BCBSM (Blue Cross Blue Shield of Michigan) routes to its own bucket (wave 52-15)', () => {
  // The Michigan plan name, the 'bcbsm' acronym, and the Blue Care Network HMO
  // brand -> the named 'bcbsm' overlay bucket.
  assert.equal(detectPayer('Blue Cross Blue Shield of Michigan PPO'), 'bcbsm');
  assert.equal(detectPayer('Blue Cross and Blue Shield of Michigan member'), 'bcbsm');
  assert.equal(detectPayer('Blue Care Network HMO plan'), 'bcbsm');
  // ...but generic / other-licensee Blues stay in the commercial fall-through.
  assert.equal(detectPayer('Premera Blue Cross PPO plan'), 'commercial');
  // ...and an explicit Medicare Advantage string still routes to the MA bucket.
  assert.equal(detectPayer('BCBSM Medicare Plus Blue Medicare Advantage PPO'), 'cms-medicare-advantage');
});

test('detectPayer: Blue Shield of California routes to its own bucket (wave 52-16)', () => {
  // The 'blue shield of california' plan name -> the named 'blue-shield-ca'
  // overlay bucket. It is a distinct licensee from Anthem Blue Cross of
  // California, which the 'anthem' bucket catches earlier.
  assert.equal(detectPayer('Blue Shield of California PPO'), 'blue-shield-ca');
  assert.equal(detectPayer('Blue Shield of CA Trio HMO'), 'blue-shield-ca');
  // ...Anthem Blue Cross of California still routes to the Anthem bucket.
  assert.equal(detectPayer('Anthem Blue Cross of California PPO'), 'anthem');
  // ...but generic / other-licensee Blues stay in the commercial fall-through.
  assert.equal(detectPayer('Premera Blue Cross PPO plan'), 'commercial');
  // ...and an explicit Medicare Advantage string still routes to the MA bucket.
  assert.equal(detectPayer('Blue Shield of California Medicare Advantage HMO'), 'cms-medicare-advantage');
});

test('detectPayer: Independence Blue Cross (IBX) routes to its own bucket (wave 52-17)', () => {
  // The 'independence blue cross' / 'ibx' anchors -> the named 'ibx' overlay
  // bucket. IBX (southeastern PA) is a distinct licensee from Highmark
  // (western / central PA), which the 'highmark' bucket catches earlier.
  assert.equal(detectPayer('Independence Blue Cross PPO plan'), 'ibx');
  assert.equal(detectPayer('IBX Keystone Health Plan East member'), 'ibx');
  // ...Highmark still routes to the Highmark bucket.
  assert.equal(detectPayer('Highmark Blue Shield of Pennsylvania'), 'highmark');
  // ...but generic / other-licensee Blues stay in the commercial fall-through.
  assert.equal(detectPayer('Excellus BlueCross BlueShield PPO plan'), 'commercial');
  // ...and an explicit Medicare Advantage string still routes to the MA bucket.
  assert.equal(detectPayer('Independence Blue Cross Medicare Advantage HMO'), 'cms-medicare-advantage');
});

test('detectPayer: CareFirst BlueCross BlueShield routes to its own bucket (wave 52-18)', () => {
  // The 'carefirst' anchor -> the named 'carefirst' overlay bucket. CareFirst
  // (MD / DC / Northern VA) is matched only by its own distinct trade name, so
  // generic / other-licensee Blues stay in the commercial fall-through.
  assert.equal(detectPayer('CareFirst BlueCross BlueShield PPO plan'), 'carefirst');
  assert.equal(detectPayer('CareFirst of Maryland member'), 'carefirst');
  // ...but generic / other-licensee Blues stay in the commercial fall-through.
  assert.equal(detectPayer('Capital BlueCross PPO plan'), 'commercial');
  // ...and an explicit Medicare Advantage string still routes to the MA bucket.
  assert.equal(detectPayer('CareFirst Medicare Advantage HMO'), 'cms-medicare-advantage');
});

test('detectPayer: Blue Cross Blue Shield of North Carolina routes to its own bucket (wave 52-19)', () => {
  // The North Carolina plan name, the 'blue cross nc' short form, and the
  // 'bcbsnc' acronym -> the named 'bcbsnc' overlay bucket.
  assert.equal(detectPayer('Blue Cross Blue Shield of North Carolina PPO'), 'bcbsnc');
  assert.equal(detectPayer('Blue Cross NC member'), 'bcbsnc');
  assert.equal(detectPayer('BCBSNC Blue Advantage plan'), 'bcbsnc');
  // ...but generic / other-licensee Blues stay in the commercial fall-through.
  assert.equal(detectPayer('Premera Blue Cross PPO plan'), 'commercial');
  // ...and an explicit Medicare Advantage string still routes to the MA bucket.
  assert.equal(detectPayer('Blue Cross NC Medicare Advantage HMO'), 'cms-medicare-advantage');
});

test('detectPayer: Horizon Blue Cross Blue Shield of New Jersey routes to its own bucket (wave 52-20)', () => {
  // The 'horizon blue cross' / 'horizon bcbs' / 'horizon healthcare services'
  // anchors -> the named 'horizon' overlay bucket. The bare common word
  // 'horizon' is never used as an anchor.
  assert.equal(detectPayer('Horizon Blue Cross Blue Shield of New Jersey PPO plan'), 'horizon');
  assert.equal(detectPayer('Horizon BCBS NJ member'), 'horizon');
  assert.equal(detectPayer('Horizon Healthcare Services, Inc.'), 'horizon');
  // ...but generic / other-licensee Blues stay in the commercial fall-through.
  assert.equal(detectPayer('Capital BlueCross PPO plan'), 'commercial');
  // ...and an explicit Medicare Advantage string still routes to the MA bucket.
  assert.equal(detectPayer('Horizon Medicare Advantage HMO plan'), 'cms-medicare-advantage');
});

test('detectPayer: Blue Cross Blue Shield of Tennessee routes to its own bucket (wave 52-21)', () => {
  // The Tennessee plan name and the 'bcbst' acronym -> the named 'bcbst' overlay
  // bucket.
  assert.equal(detectPayer('Blue Cross Blue Shield of Tennessee PPO'), 'bcbst');
  assert.equal(detectPayer('BCBST Network S member'), 'bcbst');
  // ...but generic / other-licensee Blues stay in the commercial fall-through.
  assert.equal(detectPayer('Premera Blue Cross PPO plan'), 'commercial');
  // ...and an explicit Medicare Advantage string still routes to the MA bucket.
  assert.equal(detectPayer('Blue Cross Blue Shield of Tennessee Medicare Advantage'), 'cms-medicare-advantage');
});

test('detectPayer: Blue Cross Blue Shield of Massachusetts routes to its own bucket (wave 52-22)', () => {
  // The Massachusetts plan name and the 'bcbs of massachusetts' short form ->
  // the named 'bcbsma' overlay bucket. The bare 'bcbsma' acronym is NOT an
  // anchor because 'bcbsm' (the Michigan bucket) is a substring of it; the
  // spelled-out plan name carries no such collision.
  assert.equal(detectPayer('Blue Cross Blue Shield of Massachusetts PPO'), 'bcbsma');
  assert.equal(detectPayer('BCBS of Massachusetts HMO Blue member'), 'bcbsma');
  // ...Michigan (BCBSM) still routes to its own bucket, unaffected.
  assert.equal(detectPayer('Blue Cross Blue Shield of Michigan PPO'), 'bcbsm');
  // ...but generic / other-licensee Blues stay in the commercial fall-through.
  assert.equal(detectPayer('Premera Blue Cross PPO plan'), 'commercial');
  // ...and an explicit Medicare Advantage string still routes to the MA bucket.
  assert.equal(detectPayer('Blue Cross Blue Shield of Massachusetts Medicare Advantage'), 'cms-medicare-advantage');
});

test('detectPayer: Blue Cross Blue Shield of Alabama routes to its own bucket (wave 52-23)', () => {
  // The Alabama plan name and the 'bcbsal' acronym -> the named 'bcbsal' overlay
  // bucket.
  assert.equal(detectPayer('Blue Cross Blue Shield of Alabama PPO'), 'bcbsal');
  assert.equal(detectPayer('BCBSAL member ID card'), 'bcbsal');
  // ...but generic / other-licensee Blues stay in the commercial fall-through.
  assert.equal(detectPayer('Premera Blue Cross PPO plan'), 'commercial');
  // ...and an explicit Medicare Advantage string still routes to the MA bucket.
  assert.equal(detectPayer('Blue Cross Blue Shield of Alabama Medicare Advantage'), 'cms-medicare-advantage');
});

test('detectPayer: Blue Cross Blue Shield of South Carolina routes to its own bucket (wave 52-24)', () => {
  // The South Carolina plan name and the 'bcbssc' acronym -> the named 'bcbssc'
  // overlay bucket. The 'bcbssc' acronym carries no substring collision with the
  // Michigan 'bcbsm' bucket.
  assert.equal(detectPayer('Blue Cross Blue Shield of South Carolina PPO'), 'bcbssc');
  assert.equal(detectPayer('BCBSSC State Health Plan member'), 'bcbssc');
  // ...but generic / other-licensee Blues stay in the commercial fall-through.
  assert.equal(detectPayer('Premera Blue Cross PPO plan'), 'commercial');
  // ...and an explicit Medicare Advantage string still routes to the MA bucket.
  assert.equal(detectPayer('Blue Cross Blue Shield of South Carolina Medicare Advantage'), 'cms-medicare-advantage');
});

test('detectPayer: Arkansas Blue Cross and Blue Shield routes to its own bucket (wave 52-25)', () => {
  // The 'arkansas blue cross [and blue shield]' plan name and the 'arkansas bcbs'
  // short form -> the named 'arkbcbs' overlay bucket.
  assert.equal(detectPayer('Arkansas Blue Cross and Blue Shield PPO'), 'arkbcbs');
  assert.equal(detectPayer('Arkansas BCBS member'), 'arkbcbs');
  // ...but generic / other-licensee Blues stay in the commercial fall-through.
  assert.equal(detectPayer('Premera Blue Cross PPO plan'), 'commercial');
  // ...and an explicit Medicare Advantage string still routes to the MA bucket.
  assert.equal(detectPayer('Arkansas Blue Cross and Blue Shield Medicare Advantage'), 'cms-medicare-advantage');
});

test('detectPayer: Blue Cross and Blue Shield of Kansas City routes to its own bucket (wave 52-26)', () => {
  // The Kansas City plan name and the 'blue kc' short form -> the named 'bluekc'
  // overlay bucket.
  assert.equal(detectPayer('Blue Cross and Blue Shield of Kansas City PPO'), 'bluekc');
  assert.equal(detectPayer('Blue KC Preferred-Care Blue member'), 'bluekc');
  // ...but generic / other-licensee Blues stay in the commercial fall-through.
  assert.equal(detectPayer('Premera Blue Cross PPO plan'), 'commercial');
  // ...and an explicit Medicare Advantage string still routes to the MA bucket.
  assert.equal(detectPayer('Blue Cross and Blue Shield of Kansas City Medicare Advantage'), 'cms-medicare-advantage');
});

test('detectPayer: Blue Cross and Blue Shield of Minnesota routes to its own bucket (wave 52-27)', () => {
  // The spelled-out Minnesota plan name and the 'blue cross of minnesota' short
  // form -> the named 'bcbsmn' overlay bucket. The bare 'bcbsmn' acronym is NOT
  // an anchor because 'bcbsm' (the Michigan bucket) is a substring of it; the
  // spelled-out name carries no such collision.
  assert.equal(detectPayer('Blue Cross and Blue Shield of Minnesota PPO'), 'bcbsmn');
  assert.equal(detectPayer('Blue Cross of Minnesota Aware member'), 'bcbsmn');
  // ...Michigan (BCBSM) still routes to its own bucket, unaffected.
  assert.equal(detectPayer('Blue Cross Blue Shield of Michigan PPO'), 'bcbsm');
  // ...but generic / other-licensee Blues stay in the commercial fall-through.
  assert.equal(detectPayer('Premera Blue Cross PPO plan'), 'commercial');
  // ...and an explicit Medicare Advantage string still routes to the MA bucket.
  assert.equal(detectPayer('Blue Cross and Blue Shield of Minnesota Medicare Advantage'), 'cms-medicare-advantage');
});

test('detectPayer: Blue Cross and Blue Shield of Louisiana routes to its own bucket (wave 52-28)', () => {
  // The Louisiana plan name and the 'bcbsla' acronym -> the named 'bcbsla'
  // overlay bucket. 'bcbsla' carries no substring collision with the Alabama
  // ('bcbsal') or Michigan ('bcbsm') buckets.
  assert.equal(detectPayer('Blue Cross and Blue Shield of Louisiana PPO'), 'bcbsla');
  assert.equal(detectPayer('BCBSLA HMO member'), 'bcbsla');
  // ...Alabama (BCBSAL) still routes to its own bucket, unaffected.
  assert.equal(detectPayer('Blue Cross Blue Shield of Alabama PPO'), 'bcbsal');
  // ...but generic / other-licensee Blues stay in the commercial fall-through.
  assert.equal(detectPayer('Premera Blue Cross PPO plan'), 'commercial');
  // ...and an explicit Medicare Advantage string still routes to the MA bucket.
  assert.equal(detectPayer('Blue Cross and Blue Shield of Louisiana Medicare Advantage'), 'cms-medicare-advantage');
});

test('detectPayer: HMSA (Blue Cross Blue Shield of Hawaii) routes to its own bucket (wave 52-29)', () => {
  // The 'hmsa' acronym, the 'hawaii medical service association' corporate name,
  // and the 'blue cross blue shield of hawaii' plan name -> the named 'hmsa'
  // overlay bucket.
  assert.equal(detectPayer('HMSA Preferred Provider Plan member'), 'hmsa');
  assert.equal(detectPayer('Hawaii Medical Service Association PPO'), 'hmsa');
  assert.equal(detectPayer('Blue Cross Blue Shield of Hawaii member'), 'hmsa');
  // ...but generic / other-licensee Blues stay in the commercial fall-through.
  assert.equal(detectPayer('Premera Blue Cross PPO plan'), 'commercial');
  // ...and an explicit Medicare Advantage string still routes to the MA bucket.
  assert.equal(detectPayer('HMSA Akamai Advantage Medicare Advantage HMO'), 'cms-medicare-advantage');
});

test('detectPayer: Medi-Cal (California Medicaid) routes to its own per-state bucket (wave 52-30)', () => {
  // The 'medi-cal' / 'denti-cal' / 'california medicaid' anchors -> the named
  // 'medicaid-ca' overlay bucket, detected before the generic 'medicaid' bucket.
  assert.equal(detectPayer('Medi-Cal managed care member'), 'medicaid-ca');
  assert.equal(detectPayer('Denti-Cal dental authorization'), 'medicaid-ca');
  assert.equal(detectPayer('California Medicaid TAR'), 'medicaid-ca');
  // ...the hyphen in 'medi-cal' prevents a false match on the word "medical".
  assert.equal(detectPayer('the patient has a complex medical history'), 'unknown');
  // ...a state-agnostic Medicaid packet stays in the generic bucket.
  assert.equal(detectPayer('state Medicaid fee-for-service'), 'medicaid');
  // ...and a dual-eligible "Medi-Cal Medicare Advantage" string wins the MA bucket.
  assert.equal(detectPayer('Medi-Cal Medicare Advantage dual plan'), 'cms-medicare-advantage');
});

test('detectPayer: New York State Medicaid routes to its own per-state bucket (wave 52-31)', () => {
  assert.equal(detectPayer('New York State Medicaid prior authorization'), 'medicaid-ny');
  assert.equal(detectPayer('Submitted via eMedNY / ePACES'), 'medicaid-ny');
  // ...a state-agnostic Medicaid packet stays in the generic bucket.
  assert.equal(detectPayer('state Medicaid fee-for-service'), 'medicaid');
  // ...and a dual-eligible "Medicare Advantage" string wins the MA bucket.
  assert.equal(detectPayer('New York Medicaid Medicare Advantage dual plan'), 'cms-medicare-advantage');
});

test('detectPayer: Texas Medicaid routes to its own per-state bucket (wave 52-32)', () => {
  assert.equal(detectPayer('Texas Medicaid prior authorization'), 'medicaid-tx');
  assert.equal(detectPayer('submitted via TMHP'), 'medicaid-tx');
  // ...a state-agnostic Medicaid packet stays in the generic bucket.
  assert.equal(detectPayer('state Medicaid managed care'), 'medicaid');
  // ...and a dual-eligible "Medicare Advantage" string wins the MA bucket.
  assert.equal(detectPayer('Texas Medicaid Medicare Advantage dual plan'), 'cms-medicare-advantage');
});

test('detectPayer: Florida Medicaid routes to its own per-state bucket, distinct from Florida Blue (wave 52-33)', () => {
  assert.equal(detectPayer('Florida Medicaid prior authorization'), 'medicaid-fl');
  assert.equal(detectPayer('Statewide Medicaid Managed Care plan'), 'medicaid-fl');
  // ...Florida Blue (the commercial Blues licensee) still routes to its bucket.
  assert.equal(detectPayer('Florida Blue PPO plan'), 'florida-blue');
  // ...a state-agnostic Medicaid packet stays in the generic bucket.
  assert.equal(detectPayer('state Medicaid managed care'), 'medicaid');
  // ...and a dual-eligible "Medicare Advantage" string wins the MA bucket.
  assert.equal(detectPayer('Florida Medicaid Medicare Advantage dual plan'), 'cms-medicare-advantage');
});

test('detectPayer: Ohio Medicaid routes to its own per-state bucket (wave 52-34)', () => {
  assert.equal(detectPayer('Ohio Medicaid prior authorization'), 'medicaid-oh');
  assert.equal(detectPayer('Ohio Department of Medicaid PNM'), 'medicaid-oh');
  assert.equal(detectPayer('state Medicaid managed care'), 'medicaid');
  assert.equal(detectPayer('Ohio Medicaid Medicare Advantage dual plan'), 'cms-medicare-advantage');
});

test('detectPayer: Illinois Medicaid routes to its own per-state bucket, distinct from HCSC (wave 52-35)', () => {
  assert.equal(detectPayer('Illinois Medicaid prior authorization'), 'medicaid-il');
  assert.equal(detectPayer('Illinois Department of Healthcare and Family Services'), 'medicaid-il');
  // ...BCBS of Illinois (HCSC) still routes to its commercial bucket.
  assert.equal(detectPayer('Blue Cross Blue Shield of Illinois PPO'), 'hcsc');
  // ...a state-agnostic Medicaid packet stays in the generic bucket.
  assert.equal(detectPayer('state Medicaid managed care'), 'medicaid');
  // ...and a dual-eligible "Medicare Advantage" string wins the MA bucket.
  assert.equal(detectPayer('Illinois Medicaid Medicare Advantage dual plan'), 'cms-medicare-advantage');
});

test('detectPayer: Washington Apple Health (Medicaid) routes to its own per-state bucket (wave 52-36)', () => {
  assert.equal(detectPayer('Washington Apple Health managed care'), 'medicaid-wa');
  assert.equal(detectPayer('Washington Medicaid via ProviderOne'), 'medicaid-wa');
  assert.equal(detectPayer('state Medicaid managed care'), 'medicaid');
  assert.equal(detectPayer('Washington Apple Health Medicare Advantage dual plan'), 'cms-medicare-advantage');
});

test('detectPayer: Georgia Medicaid routes to its own per-state bucket (wave 52-37)', () => {
  assert.equal(detectPayer('Georgia Medicaid prior authorization'), 'medicaid-ga');
  assert.equal(detectPayer('submitted via GAMMIS'), 'medicaid-ga');
  assert.equal(detectPayer('state Medicaid managed care'), 'medicaid');
  assert.equal(detectPayer('Georgia Medicaid Medicare Advantage dual plan'), 'cms-medicare-advantage');
});

test('detectPayer: unknown for empty / non-payer text', () => {
  assert.equal(detectPayer(''), 'unknown');
  assert.equal(detectPayer('this packet has no payer letterhead'), 'unknown');
});

test('detectPacketPayer: majority across documents, unknowns excluded', () => {
  const docs = [
    { text: 'Aetna Medicare Advantage' },
    { text: 'Aetna Medicare Advantage' },
    { text: 'this packet has no payer letterhead' },
  ];
  assert.equal(detectPacketPayer(docs), 'cms-medicare-advantage');
});

// ---- R-PA-005 refactor: clinical-note scoping ----

test('R-PA-005 only counts dates from clinical-note documents when one is present', () => {
  // DOB 1985-03-12 lives in a non-clinical doc; the only clinical-note
  // date is the recent service date. R-PA-005 must pass.
  const docs = [
    { name: 'id-page.txt', sha256: 'x', kind: 'TXT',
      text: 'DOB: 1985-03-12\nMember ID: W123456789\n' },
    { name: 'note.txt', sha256: 'y', kind: 'TXT',
      text: 'Chief complaint: hypertension\nDate of service: 2026-04-12\nAssessment and plan: continue lisinopril.\n' },
  ];
  const bundle = buildBundle(docs, { totalBytes: 4096 });
  const findings = runEngine(bundle);
  const f = findings.find((x) => x.ruleId === 'R-PA-005');
  assert.equal(f.status, 'pass');
});
