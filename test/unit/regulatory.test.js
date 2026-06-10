// Tests for the HIPAA breach-notification deadline calculator.
// Spec citations: 45 CFR §§164.404, 164.406, 164.408.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { breachNotificationDeadlines, lintGenerator, GENERATOR_ELEMENTS } from '../../lib/regulatory.js';

test('breach: small breach (<500) uses individual + HHS-annual deadlines', () => {
  const r = breachNotificationDeadlines({ discoveryDate: '2026-03-15', affectedIndividuals: 10 });
  assert.equal(r.discoveryDate, '2026-03-15');
  // 60 days after 2026-03-15 = 2026-05-14.
  assert.equal(r.individualNoticeDeadline, '2026-05-14');
  assert.equal(r.mediaNoticeDeadline, null);
  // Annual HHS log due 60 days after 2026-12-31 = 2027-03-01 (2027 is not a leap year).
  assert.equal(r.hhsNoticeDeadline, '2027-03-01');
  assert.ok(r.recipients.some((s) => /annual log/.test(s)));
});

test('breach: >=500 triggers media + contemporaneous HHS notice', () => {
  const r = breachNotificationDeadlines({ discoveryDate: '2026-01-01', affectedIndividuals: 500 });
  // 60 days after 2026-01-01 = 2026-03-02.
  assert.equal(r.individualNoticeDeadline, '2026-03-02');
  assert.equal(r.mediaNoticeDeadline, '2026-03-02');
  assert.equal(r.hhsNoticeDeadline, '2026-03-02');
  assert.ok(r.recipients.some((s) => /media outlets/.test(s)));
});

test('breach: leap-year boundary is handled', () => {
  // 60 days after 2024-01-01 = 2024-03-01 (leap year).
  const r = breachNotificationDeadlines({ discoveryDate: '2024-01-01', affectedIndividuals: 1 });
  assert.equal(r.individualNoticeDeadline, '2024-03-01');
});

test('breach: rejects malformed inputs', () => {
  assert.throws(() => breachNotificationDeadlines({ discoveryDate: '2026/03/15', affectedIndividuals: 1 }), /YYYY-MM-DD/);
  assert.throws(() => breachNotificationDeadlines({ discoveryDate: '2026-02-30', affectedIndividuals: 1 }), /real date/);
  assert.throws(() => breachNotificationDeadlines({ discoveryDate: '2026-01-01', affectedIndividuals: -1 }), /non-negative/);
  assert.throws(() => breachNotificationDeadlines({ discoveryDate: '2026-01-01', affectedIndividuals: 1.5 }), /non-negative integer/);
});

test('breach: cites the controlling regulation', () => {
  const r = breachNotificationDeadlines({ discoveryDate: '2026-01-01', affectedIndividuals: 1 });
  assert.match(r.citation, /164\.40[468]/);
});

// --- spec-v63 OA3: generator completeness linting -------------------------

test('OA3: every generator checklist element carries a CFR anchor', () => {
  for (const [kind, spec] of Object.entries(GENERATOR_ELEMENTS)) {
    assert.ok(spec.elements.length >= 5, `${kind}: expected >=5 required elements`);
    for (const e of spec.elements) {
      assert.ok(e.key && e.label, `${kind}/${e.key}: element needs a key and label`);
      assert.match(e.anchor, /CFR/, `${kind}/${e.key}: every finding must carry a CFR anchor`);
    }
  }
});

test('OA3: covers the four spec-named generators', () => {
  for (const kind of ['hipaa-auth', 'hipaa-roa', 'appeal-letter', 'breach-notice']) {
    assert.ok(GENERATOR_ELEMENTS[kind], `${kind} must have a required-element checklist`);
  }
  // 45 CFR 164.508(c) authorization core elements.
  assert.ok(GENERATOR_ELEMENTS['hipaa-auth'].elements.some((e) => /164\.508\(c\)/.test(e.anchor)));
  // 45 CFR 164.524 access-request elements.
  assert.ok(GENERATOR_ELEMENTS['hipaa-roa'].elements.some((e) => /164\.524/.test(e.anchor)));
  // 45 CFR 164.404(c) breach-notice content.
  assert.ok(GENERATOR_ELEMENTS['breach-notice'].elements.some((e) => /164\.404\(c\)/.test(e.anchor)));
});

test('OA3: lintGenerator flags missing elements and confirms a complete document', () => {
  // Nothing supplied -> everything missing, each finding carrying its anchor.
  const empty = lintGenerator('hipaa-auth', {});
  assert.equal(empty.complete, false);
  assert.equal(empty.missing.length, empty.findings.length);
  for (const f of empty.missing) assert.match(f.anchor, /CFR/);

  // All six 164.508(c) core elements present -> complete, nothing missing.
  const full = lintGenerator('hipaa-auth', {
    phi: true, discloser: true, recipient: true, purpose: true, expiration: true, individual: true,
  });
  assert.equal(full.complete, true);
  assert.equal(full.missing.length, 0);

  // A Set of present keys is accepted; one missing element is reported.
  const partial = lintGenerator('breach-notice', new Set(['what', 'types', 'steps', 'mitigation']));
  assert.equal(partial.complete, false);
  assert.deepEqual(partial.missing.map((m) => m.key), ['contact']);
});

test('OA3: unknown generator kind returns null', () => {
  assert.equal(lintGenerator('not-a-generator', {}), null);
});
