import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  CONFIG_PATH,
  MAX_BODY_BYTES,
  handleRequest,
  validateReportPayload,
  verifyTurnstile,
} from '../../report-worker.mjs';
import { REPORT_TOOL_NAMES } from '../../report-catalog.js';
import { SENSITIVE_CONTEXT_TOOLS } from '../../report-policy.js';

function validPayload() {
  return {
    calculator_id: 'bmi',
    calculator_name: 'untrusted client name',
    page_url: 'https://sophiewell.com/#bmi?w=70&h=1.75',
    note: 'I expected a different BMI.',
    inputs: [{ label: 'Weight', value: '70' }],
    outputs: {
      values: [{ label: 'BMI', value: '22.9' }],
      text: 'BMI 22.9 (normal range)',
      truncated: false,
    },
    turnstile_token: 'test-token',
  };
}

test('every sensitive-context policy entry names a real tool', () => {
  assert.deepEqual(
    [...SENSITIVE_CONTEXT_TOOLS].filter((id) => !REPORT_TOOL_NAMES[id]),
    [],
  );
});

test('report validation accepts bounded context and derives the catalog name', () => {
  const result = validateReportPayload(validPayload());
  assert.equal(result.ok, true);
  assert.equal(result.value.calculatorId, 'bmi');
  assert.notEqual(result.value.calculatorName, 'untrusted client name');
  assert.equal(result.value.note, 'I expected a different BMI.');
});

test('report validation accepts a no-note report', () => {
  const payload = validPayload();
  payload.note = '';
  const result = validateReportPayload(payload);
  assert.equal(result.ok, true);
  assert.equal(result.value.note, '');
});

test('report validation rejects unknown tools and mismatched URLs', () => {
  const unknown = validPayload();
  unknown.calculator_id = 'not-a-real-tool';
  assert.equal(validateReportPayload(unknown).status, 400);

  for (const inherited of ['constructor', 'toString', '__proto__']) {
    const candidate = validPayload();
    candidate.calculator_id = inherited;
    candidate.page_url = `https://sophiewell.com/#${inherited}`;
    assert.equal(validateReportPayload(candidate).status, 400);
  }

  const crossOrigin = validPayload();
  crossOrigin.page_url = 'https://example.com/#bmi';
  assert.equal(validateReportPayload(crossOrigin).status, 403);

  const wrongTool = validPayload();
  wrongTool.page_url = 'https://sophiewell.com/#wells-pe';
  assert.equal(validateReportPayload(wrongTool).status, 403);

  const credentials = validPayload();
  credentials.page_url = 'https://name:secret@sophiewell.com/#bmi';
  assert.equal(validateReportPayload(credentials).status, 403);

  const query = validPayload();
  query.page_url = 'https://sophiewell.com/?patient=identifier#bmi';
  assert.equal(validateReportPayload(query).status, 403);
});

test('sensitive tools cannot submit identifiers, generated text, or URL state', () => {
  const payload = validPayload();
  payload.calculator_id = 'mbi-validate';
  payload.page_url = 'https://sophiewell.com/#mbi-validate';
  payload.inputs = [];
  payload.outputs = { values: [], text: '', truncated: false };
  assert.equal(validateReportPayload(payload).ok, true);

  for (const mutate of [
    (candidate) => { candidate.page_url += '?mbi=1EG4TE5MK73'; },
    (candidate) => { candidate.inputs = [{ label: 'MBI', value: '1EG4TE5MK73' }]; },
    (candidate) => { candidate.outputs.text = 'MBI 1EG4TE5MK73 is valid'; },
    (candidate) => { candidate.outputs.values = [{ label: 'MBI', value: '1EG4TE5MK73' }]; },
  ]) {
    const candidate = structuredClone(payload);
    mutate(candidate);
    assert.equal(validateReportPayload(candidate).ok, false);
  }
});

test('report validation rejects oversized, expanded, and unsafe fields', () => {
  const longNote = validPayload();
  longNote.note = 'x'.repeat(161);
  assert.equal(validateReportPayload(longNote).status, 400);

  const longToken = validPayload();
  longToken.turnstile_token = 'x'.repeat(2049);
  assert.equal(validateReportPayload(longToken).status, 400);

  const tooManyInputs = validPayload();
  tooManyInputs.inputs = Array.from({ length: 101 }, (_, i) => ({ label: `Input ${i}`, value: '1' }));
  assert.equal(validateReportPayload(tooManyInputs).status, 400);

  const extraKey = validPayload();
  extraKey.email = 'should-not-be-stored@example.com';
  assert.equal(validateReportPayload(extraKey).status, 400);

  for (const unsafe of ['expected\u001b[2Jclear', 'expected\rrewritten', 'expected\u202Etxt']) {
    const payload = validPayload();
    payload.note = unsafe;
    assert.equal(validateReportPayload(payload).status, 400);
  }
  assert.equal(MAX_BODY_BYTES, 24 * 1024);
});

test('Turnstile verification requires success, action, and an allowed hostname', async () => {
  const base = {
    token: 'token',
    remoteIp: '192.0.2.1',
    env: { TURNSTILE_SECRET_KEY: 'secret' },
    origins: ['https://sophiewell.com'],
    idempotencyKey: '00000000-0000-4000-8000-000000000000',
  };
  const valid = async () => new Response(JSON.stringify({
    success: true,
    action: 'calculator-report',
    hostname: 'sophiewell.com',
  }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  assert.equal(await verifyTurnstile({ ...base, fetcher: valid }), true);

  const wrongAction = async () => new Response(JSON.stringify({
    success: true, action: 'login', hostname: 'sophiewell.com',
  }), { status: 200 });
  assert.equal(await verifyTurnstile({ ...base, fetcher: wrongAction }), false);

  const wrongHost = async () => new Response(JSON.stringify({
    success: true, action: 'calculator-report', hostname: 'example.com',
  }), { status: 200 });
  assert.equal(await verifyTurnstile({ ...base, fetcher: wrongHost }), false);
});

test('report config fails closed until every binding and secret exists', async () => {
  const request = new Request(`https://sophiewell.com${CONFIG_PATH}`);
  const missing = await handleRequest(request, {});
  assert.equal(missing.status, 503);

  const configured = await handleRequest(request, {
    REPORTS_DB: {},
    TURNSTILE_SITE_KEY: 'public-key',
    TURNSTILE_SECRET_KEY: 'private-key',
    REPORT_HASH_SECRET: 'x'.repeat(32),
  });
  assert.equal(configured.status, 200);
  assert.deepEqual(await configured.json(), { sitekey: 'public-key' });
  assert.equal(configured.headers.get('Cross-Origin-Resource-Policy'), 'same-origin');
  assert.match(configured.headers.get('Content-Security-Policy'), /default-src 'none'/);
});

test('encoded and chunked oversized report bodies are rejected before parsing', async () => {
  const env = {
    REPORTS_DB: {},
    TURNSTILE_SITE_KEY: 'public-key',
    TURNSTILE_SECRET_KEY: 'private-key',
    REPORT_HASH_SECRET: 'x'.repeat(32),
  };
  const encoded = new Request('https://sophiewell.com/api/reports', {
    method: 'POST',
    headers: {
      Origin: 'https://sophiewell.com',
      'Content-Type': 'application/json',
      'Content-Encoding': 'gzip',
    },
    body: 'not-really-gzip',
  });
  assert.equal((await handleRequest(encoded, env)).status, 415);

  let canceled = false;
  const body = new ReadableStream({
    start(controller) {
      controller.enqueue(new Uint8Array(MAX_BODY_BYTES));
      controller.enqueue(new Uint8Array([1]));
    },
    cancel() { canceled = true; },
  });
  const oversized = new Request('https://sophiewell.com/api/reports', {
    method: 'POST',
    headers: {
      Origin: 'https://sophiewell.com',
      'Content-Type': 'application/json',
      'CF-Connecting-IP': '192.0.2.1',
    },
    body,
    duplex: 'half',
  });
  assert.equal((await handleRequest(oversized, env)).status, 413);
  assert.equal(canceled, true);
});

test('non-report requests cannot reach Pages assets through the API Worker', async () => {
  const response = await handleRequest(new Request('https://sophiewell.com/styles.css'), {});
  assert.equal(response.status, 404);
});
