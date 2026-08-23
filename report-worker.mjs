// API-only Cloudflare Worker for anonymous tool reports. It has no static
// asset binding and exposes only /api/reports and /api/reports/config.

import { REPORT_TOOL_NAMES } from './report-catalog.js';
import { SENSITIVE_CONTEXT_TOOLS } from './report-policy.js';

export const REPORT_PATH = '/api/reports';
export const CONFIG_PATH = '/api/reports/config';
export const MAX_BODY_BYTES = 24 * 1024;
export const MAX_NOTE_LENGTH = 160;
export const DAILY_LIMIT_CEILING = 200;
export const REPORTER_LIMIT_CEILING = 5;
const MAX_URL_LENGTH = 8192;
const MAX_FIELDS = 100;
const MAX_LABEL_LENGTH = 120;
const MAX_VALUE_LENGTH = 500;
const MAX_OUTPUT_TEXT_LENGTH = 12000;
const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const TURNSTILE_ACTION = 'calculator-report';
const UNSAFE_STORED_TEXT = /[\u0000-\u0008\u000B-\u001F\u007F-\u009F\u202A-\u202E\u2066-\u2069]/u;

const JSON_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
  'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'; sandbox",
  'Cross-Origin-Resource-Policy': 'same-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  'Referrer-Policy': 'no-referrer',
};

function json(status, body, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...JSON_HEADERS, ...extraHeaders },
  });
}

function configuredOrigins(env) {
  const raw = String(env.REPORT_ALLOWED_ORIGINS || 'https://sophiewell.com');
  const origins = [];
  for (const item of raw.split(',')) {
    try {
      const candidate = item.trim();
      const url = new URL(candidate);
      if ((url.protocol === 'https:' || url.hostname === 'localhost') && url.origin === candidate) {
        origins.push(url.origin);
      }
    } catch { /* malformed configured origins are ignored */ }
  }
  return [...new Set(origins)].slice(0, 5);
}

function allowedOrigin(request, origins) {
  const origin = request.headers.get('Origin');
  return Boolean(origin && origins.includes(origin));
}

function exactKeys(value, allowed) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  return Object.keys(value).every((key) => allowed.includes(key));
}

function safeStoredText(value) {
  return typeof value === 'string' && !UNSAFE_STORED_TEXT.test(value);
}

function validRows(rows) {
  if (!Array.isArray(rows) || rows.length > MAX_FIELDS) return false;
  return rows.every((row) => exactKeys(row, ['label', 'value'])
    && safeStoredText(row.label) && row.label.trim().length > 0
    && row.label.length <= MAX_LABEL_LENGTH
    && safeStoredText(row.value) && row.value.length <= MAX_VALUE_LENGTH);
}

function emptyOutputs(outputs) {
  return Array.isArray(outputs.values) && outputs.values.length === 0
    && outputs.text === '' && outputs.truncated === false;
}

export function validateReportPayload(payload, origins = ['https://sophiewell.com']) {
  const topKeys = [
    'calculator_id', 'calculator_name', 'page_url', 'note', 'inputs', 'outputs', 'turnstile_token',
  ];
  if (!exactKeys(payload, topKeys)) return { ok: false, status: 400 };
  if (typeof payload.calculator_id !== 'string'
    || !Object.hasOwn(REPORT_TOOL_NAMES, payload.calculator_id)) {
    return { ok: false, status: 400 };
  }
  if (!safeStoredText(payload.calculator_name) || payload.calculator_name.length > 200) {
    return { ok: false, status: 400 };
  }
  if (!safeStoredText(payload.page_url) || payload.page_url.length > MAX_URL_LENGTH) {
    return { ok: false, status: 400 };
  }
  let pageUrl;
  try { pageUrl = new URL(payload.page_url); } catch { return { ok: false, status: 400 }; }
  if (pageUrl.username || pageUrl.password || pageUrl.search
    || !origins.includes(pageUrl.origin)
    || pageUrl.pathname !== '/'
    || pageUrl.hash !== `#${payload.calculator_id}`) {
    return { ok: false, status: 403 };
  }
  if (!safeStoredText(payload.note) || payload.note.length > MAX_NOTE_LENGTH) {
    return { ok: false, status: 400 };
  }
  if (!validRows(payload.inputs)) return { ok: false, status: 400 };
  if (!exactKeys(payload.outputs, ['values', 'text', 'truncated'])) return { ok: false, status: 400 };
  if (!validRows(payload.outputs.values)
    || !safeStoredText(payload.outputs.text)
    || payload.outputs.text.length > MAX_OUTPUT_TEXT_LENGTH
    || typeof payload.outputs.truncated !== 'boolean') {
    return { ok: false, status: 400 };
  }
  if (SENSITIVE_CONTEXT_TOOLS.has(payload.calculator_id)
    && (payload.inputs.length !== 0
      || !emptyOutputs(payload.outputs))) {
    return { ok: false, status: 400 };
  }
  if (typeof payload.turnstile_token !== 'string'
    || payload.turnstile_token.length < 1
    || payload.turnstile_token.length > 2048) {
    return { ok: false, status: 400 };
  }
  return {
    ok: true,
    value: {
      calculatorId: payload.calculator_id,
      calculatorName: REPORT_TOOL_NAMES[payload.calculator_id],
      pageUrl: pageUrl.href,
      note: payload.note.trim(),
      inputs: payload.inputs,
      outputs: payload.outputs,
      turnstileToken: payload.turnstile_token,
    },
  };
}

async function readJsonBody(request) {
  const lengthHeader = request.headers.get('Content-Length');
  if (lengthHeader !== null) {
    if (!/^\d+$/.test(lengthHeader)) return { error: 400 };
    if (Number(lengthHeader) > MAX_BODY_BYTES) return { error: 413 };
  }
  if (!request.body) return { error: 400 };

  const reader = request.body.getReader();
  const chunks = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_BODY_BYTES) {
      await reader.cancel();
      return { error: 413 };
    }
    chunks.push(value);
  }

  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  let raw;
  try { raw = new TextDecoder('utf-8', { fatal: true }).decode(bytes); } catch { return { error: 400 }; }
  try { return { value: JSON.parse(raw) }; } catch { return { error: 400 }; }
}

export async function verifyTurnstile({ token, remoteIp, env, origins, idempotencyKey, fetcher = fetch }) {
  const form = new FormData();
  form.set('secret', env.TURNSTILE_SECRET_KEY);
  form.set('response', token);
  form.set('remoteip', remoteIp);
  form.set('idempotency_key', idempotencyKey);
  let response;
  try {
    response = await fetcher(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      body: form,
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    return false;
  }
  if (!response.ok) return false;
  let result;
  try { result = await response.json(); } catch { return false; }
  const allowedHostnames = new Set(origins.map((origin) => new URL(origin).hostname));
  return result.success === true
    && result.action === TURNSTILE_ACTION
    && typeof result.hostname === 'string'
    && allowedHostnames.has(result.hostname);
}

async function sha256(value) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function dailyReporterHmac(day, remoteIp, secret) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const digest = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${day}:${remoteIp}`));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function configuredLimit(value, fallback, ceiling) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, ceiling);
}

function storagePayload(value) {
  return JSON.stringify(value);
}

export async function storeReport(db, report, env, remoteIp) {
  const now = new Date();
  const createdAt = now.toISOString();
  const day = createdAt.slice(0, 10);
  const reportId = crypto.randomUUID();
  const reporter = await dailyReporterHmac(day, remoteIp, env.REPORT_HASH_SECRET);
  const dailyLimit = configuredLimit(env.REPORT_DAILY_LIMIT, DAILY_LIMIT_CEILING, DAILY_LIMIT_CEILING);
  const reporterLimit = configuredLimit(env.REPORT_REPORTER_DAILY_LIMIT, REPORTER_LIMIT_CEILING, REPORTER_LIMIT_CEILING);
  const dedupeSource = storagePayload({
    calculator_id: report.calculatorId,
    page_url: report.pageUrl,
    note: report.note,
    inputs: report.inputs,
    outputs: report.outputs,
  });
  const dedupeKey = `${day}:${await sha256(dedupeSource)}`;

  const insert = db.prepare(`
    INSERT OR IGNORE INTO calculator_reports (
      id, created_at, calculator_id, calculator_name, page_url, note,
      inputs_json, outputs_json, output_text, output_truncated, dedupe_key
    )
    SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    WHERE COALESCE((
      SELECT count FROM report_limits
      WHERE bucket = ? AND scope = 'global' AND subject = 'all'
    ), 0) < ?
    AND COALESCE((
      SELECT count FROM report_limits
      WHERE bucket = ? AND scope = 'reporter' AND subject = ?
    ), 0) < ?
  `).bind(
    reportId, createdAt, report.calculatorId, report.calculatorName, report.pageUrl,
    report.note || null, storagePayload(report.inputs), storagePayload(report.outputs.values),
    report.outputs.text, report.outputs.truncated ? 1 : 0, dedupeKey,
    day, dailyLimit, day, reporter, reporterLimit,
  );
  const incrementGlobal = db.prepare(`
    INSERT INTO report_limits (bucket, scope, subject, count)
    SELECT ?, 'global', 'all', 1
    WHERE EXISTS (SELECT 1 FROM calculator_reports WHERE id = ?)
    ON CONFLICT (bucket, scope, subject) DO UPDATE SET count = count + 1
  `).bind(day, reportId);
  const incrementReporter = db.prepare(`
    INSERT INTO report_limits (bucket, scope, subject, count)
    SELECT ?, 'reporter', ?, 1
    WHERE EXISTS (SELECT 1 FROM calculator_reports WHERE id = ?)
    ON CONFLICT (bucket, scope, subject) DO UPDATE SET count = count + 1
  `).bind(day, reporter, reportId);

  await db.batch([insert, incrementGlobal, incrementReporter]);
}

export async function cleanupReports(db) {
  await db.batch([
    db.prepare("DELETE FROM report_limits WHERE bucket < date('now', '-14 days')"),
    db.prepare(`
      DELETE FROM calculator_reports
      WHERE (status IN ('resolved', 'wont_fix')
        AND created_at < datetime('now', '-90 days'))
      OR created_at < datetime('now', '-180 days')
    `),
  ]);
}

function reportingConfigured(env) {
  return Boolean(env.REPORTS_DB
    && typeof env.TURNSTILE_SITE_KEY === 'string' && env.TURNSTILE_SITE_KEY
    && typeof env.TURNSTILE_SECRET_KEY === 'string' && env.TURNSTILE_SECRET_KEY
    && typeof env.REPORT_HASH_SECRET === 'string' && env.REPORT_HASH_SECRET.length >= 32
    && configuredOrigins(env).length > 0);
}

async function handleConfig(request, env) {
  if (request.method !== 'GET') return json(405, { ok: false });
  if (!reportingConfigured(env)) return json(503, { ok: false });
  return json(200, { sitekey: env.TURNSTILE_SITE_KEY }, { 'Cache-Control': 'public, max-age=300' });
}

async function handleReport(request, env) {
  if (request.method !== 'POST') return json(405, { ok: false });
  if (!reportingConfigured(env)) return json(503, { ok: false });
  const origins = configuredOrigins(env);
  if (!allowedOrigin(request, origins)) return json(403, { ok: false });
  const contentType = request.headers.get('Content-Type') || '';
  if (!/^application\/json(?:\s*;|$)/i.test(contentType)) return json(415, { ok: false });
  const contentEncoding = request.headers.get('Content-Encoding');
  if (contentEncoding && contentEncoding.toLowerCase() !== 'identity') return json(415, { ok: false });

  const remoteIp = request.headers.get('CF-Connecting-IP');
  if (!remoteIp || remoteIp.length > 64) return json(403, { ok: false });

  let parsed;
  try { parsed = await readJsonBody(request); } catch { return json(400, { ok: false }); }
  if (parsed.error) return json(parsed.error, { ok: false });
  const validated = validateReportPayload(parsed.value, origins);
  if (!validated.ok) return json(validated.status, { ok: false });

  const verified = await verifyTurnstile({
    token: validated.value.turnstileToken,
    remoteIp,
    env,
    origins,
    idempotencyKey: crypto.randomUUID(),
  });
  if (!verified) return json(400, { ok: false });

  try {
    await storeReport(env.REPORTS_DB, validated.value, env, remoteIp);
  } catch {
    return json(503, { ok: false });
  }
  // Accepted, duplicate, and quota-dropped submissions are intentionally
  // indistinguishable so the endpoint does not reveal its queue state.
  return json(202, { ok: true });
}

export async function handleRequest(request, env) {
  const pathname = new URL(request.url).pathname;
  if (pathname === CONFIG_PATH) return handleConfig(request, env);
  if (pathname === REPORT_PATH) return handleReport(request, env);
  if (pathname.startsWith('/api/reports')) return json(404, { ok: false });
  return json(404, { ok: false });
}

export default {
  fetch(request, env) {
    return handleRequest(request, env);
  },
  scheduled(_controller, env, ctx) {
    ctx.waitUntil(cleanupReports(env.REPORTS_DB));
  },
};
