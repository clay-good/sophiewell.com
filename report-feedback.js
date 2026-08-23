// Anonymous tool feedback client. This module and Cloudflare Turnstile load
// only after a user chooses "Report a problem"; ordinary tool use stays local.

import { SENSITIVE_CONTEXT_TOOLS } from './report-policy.js';

const CONFIG_URL = '/api/reports/config';
const REPORT_URL = '/api/reports';
const TURNSTILE_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
const NOTE_LIMIT = 160;
const OUTPUT_TEXT_LIMIT = 12000;
const MAX_FIELDS = 100;
const SENSITIVE_INPUT_TYPES = new Set(['password', 'email', 'tel', 'file']);
const SENSITIVE_AUTOCOMPLETE = /(?:^|\s)(?:name|email|tel|street-address|postal-code|cc-[^\s]+|current-password|new-password|one-time-code)(?:\s|$)/i;
const SENSITIVE_FIELD = /(?:patient|member|subscriber|beneficiary|guardian|recipient)[-_ ]*(?:name|address|phone|email|id|number|dob|birth)|medical record|\bmrn\b|social security|\bssn\b/i;
let turnstilePromise = null;

function bounded(value, max) {
  return String(value == null ? '' : value).trim().slice(0, max);
}

function labelFor(region, control) {
  if (control.id) {
    for (const label of region.querySelectorAll('label')) {
      if (label.htmlFor === control.id) return bounded(label.textContent, 120);
    }
  }
  const parent = control.closest ? control.closest('p, .field, .row-field, .unit-field-row') : null;
  const label = parent && parent.querySelector ? parent.querySelector('label') : null;
  return bounded((label && label.textContent)
    || control.getAttribute('aria-label')
    || control.name
    || control.id
    || 'Input', 120);
}

function controlValue(control) {
  if (control.type === 'checkbox' || control.type === 'radio') {
    return control.checked ? 'Checked' : 'Not checked';
  }
  if (control.tagName === 'SELECT') {
    const option = control.selectedOptions && control.selectedOptions[0];
    return bounded((option && option.textContent) || control.value, 500);
  }
  return bounded(control.value, 500);
}

export function collectReportInputs(inputRegion, toolId = '') {
  if (!inputRegion || SENSITIVE_CONTEXT_TOOLS.has(toolId)) return [];
  const out = [];
  for (const control of inputRegion.querySelectorAll('input, select, textarea')) {
    if (out.length >= MAX_FIELDS) break;
    if (control.disabled || ['button', 'submit', 'reset', 'hidden'].includes(control.type)) continue;
    const label = labelFor(inputRegion, control);
    const identity = [label, control.id, control.name].filter(Boolean).join(' ');
    if (SENSITIVE_INPUT_TYPES.has(control.type)
      || SENSITIVE_AUTOCOMPLETE.test(control.getAttribute('autocomplete') || '')
      || SENSITIVE_FIELD.test(identity)) continue;
    out.push({ label, value: controlValue(control) });
  }
  return out;
}

function outputText(outputRegion) {
  if (!outputRegion) return { text: '', truncated: false };
  const clone = outputRegion.cloneNode(true);
  for (const node of clone.querySelectorAll('button, input, select, textarea, [aria-hidden="true"]')) node.remove();
  const normalized = String(clone.textContent || '').replace(/\s+/g, ' ').trim();
  return {
    text: normalized.slice(0, OUTPUT_TEXT_LIMIT),
    truncated: normalized.length > OUTPUT_TEXT_LIMIT,
  };
}

export function collectReportOutputs(outputRegion) {
  if (!outputRegion) return { values: [], text: '', truncated: false };
  const values = [];
  const rows = outputRegion.querySelectorAll(':scope > li, :scope > p, .result-primary, .result-band');
  for (const row of rows) {
    if (values.length >= MAX_FIELDS) break;
    const value = bounded(row.textContent, 500);
    if (!value) continue;
    const named = row.querySelector && row.querySelector('.rp-label, .result-label, dt, strong');
    values.push({
      label: bounded((named && named.textContent) || `Result ${values.length + 1}`, 120),
      value,
    });
  }
  return { values, ...outputText(outputRegion) };
}

export function buildReportPayload({ tool, inputRegion, outputRegion, note, token }) {
  const sensitive = SENSITIVE_CONTEXT_TOOLS.has(tool.id);
  const sanitized = new URL(window.location.href);
  sanitized.search = '';
  if (sensitive) {
    sanitized.hash = tool.id;
  }
  return {
    calculator_id: tool.id,
    calculator_name: tool.name,
    page_url: sanitized.href,
    note: bounded(note, NOTE_LIMIT),
    inputs: collectReportInputs(inputRegion, tool.id),
    outputs: sensitive
      ? { values: [], text: '', truncated: false }
      : collectReportOutputs(outputRegion),
    turnstile_token: token,
  };
}

async function getConfig() {
  const response = await fetch(CONFIG_URL, {
    method: 'GET',
    credentials: 'same-origin',
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) throw new Error('reporting unavailable');
  const config = await response.json();
  if (!config || typeof config.sitekey !== 'string' || !config.sitekey) {
    throw new Error('reporting unavailable');
  }
  return config;
}

function loadTurnstile() {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (turnstilePromise) return turnstilePromise;
  turnstilePromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = TURNSTILE_URL;
    script.defer = true;
    script.addEventListener('load', () => {
      if (window.turnstile) resolve(window.turnstile);
      else reject(new Error('Turnstile did not initialize'));
    }, { once: true });
    script.addEventListener('error', () => reject(new Error('Turnstile did not load')), { once: true });
    document.head.appendChild(script);
  }).catch((error) => {
    turnstilePromise = null;
    throw error;
  });
  return turnstilePromise;
}

function makeButton(label, className) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = className;
  button.textContent = label;
  return button;
}

export async function openReportDialog({ tool, inputRegion, outputRegion, trigger, host }) {
  if (!tool || !trigger || trigger.dataset.reportSent === 'true'
    || trigger.dataset.reportOpen === 'true') return;
  trigger.dataset.reportOpen = 'true';

  const dialog = document.createElement('dialog');
  dialog.className = 'report-dialog';
  dialog.setAttribute('aria-labelledby', 'report-dialog-title');

  const title = document.createElement('h2');
  title.id = 'report-dialog-title';
  title.textContent = 'Report a problem';
  dialog.appendChild(title);

  const context = document.createElement('p');
  context.className = 'report-context';
  const includesContext = !SENSITIVE_CONTEXT_TOOLS.has(tool.id);
  context.textContent = includesContext
    ? `${tool.name}: we will attach this tool's URL, current inputs, and results.`
    : `${tool.name}: we will not attach form entries, generated text, or URL state.`;
  dialog.appendChild(context);

  const privacy = document.createElement('p');
  privacy.className = 'report-privacy';
  privacy.textContent = 'Do not include a patient name, date of birth, medical record number, address, or other identifying information.';
  dialog.appendChild(privacy);

  const label = document.createElement('label');
  label.htmlFor = 'report-note';
  label.textContent = 'What did you expect instead? (optional)';
  dialog.appendChild(label);

  const note = document.createElement('textarea');
  note.id = 'report-note';
  note.maxLength = NOTE_LIMIT;
  note.rows = 3;
  note.autocomplete = 'off';
  note.placeholder = 'Example: I expected a score of 4, not 5.';
  dialog.appendChild(note);

  const count = document.createElement('div');
  count.className = 'report-count';
  count.textContent = `${NOTE_LIMIT} characters remaining`;
  dialog.appendChild(count);
  note.addEventListener('input', () => {
    count.textContent = `${NOTE_LIMIT - note.value.length} characters remaining`;
  });

  const turnstileHost = document.createElement('div');
  turnstileHost.className = 'report-turnstile';
  dialog.appendChild(turnstileHost);

  const status = document.createElement('p');
  status.className = 'report-status';
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  status.textContent = navigator.onLine ? 'Preparing secure submission...' : 'Reporting needs an internet connection.';
  dialog.appendChild(status);

  const actions = document.createElement('div');
  actions.className = 'report-actions';
  const cancel = makeButton('Cancel', 'report-cancel');
  const submit = makeButton('Send report', 'report-submit');
  submit.disabled = true;
  actions.appendChild(cancel);
  actions.appendChild(submit);
  dialog.appendChild(actions);

  (host || document.body).appendChild(dialog);
  dialog.showModal();
  let token = '';
  let widgetId = null;
  let api = null;

  const close = () => {
    if (api && widgetId !== null) {
      try { api.remove(widgetId); } catch { /* dialog removal is sufficient */ }
    }
    if (dialog.open) dialog.close();
    dialog.remove();
    delete trigger.dataset.reportOpen;
    if (trigger.isConnected) trigger.focus();
  };
  cancel.addEventListener('click', close);
  dialog.addEventListener('cancel', (event) => { event.preventDefault(); close(); });

  try {
    if (!navigator.onLine) return;
    const config = await getConfig();
    const turnstile = await loadTurnstile();
    if (!dialog.isConnected) return;
    api = turnstile;
    widgetId = api.render(turnstileHost, {
      sitekey: config.sitekey,
      action: 'calculator-report',
      appearance: 'interaction-only',
      'feedback-enabled': false,
      size: 'flexible',
      theme: 'auto',
      callback: (value) => {
        token = value;
        submit.disabled = false;
        status.textContent = 'Ready to send.';
      },
      'expired-callback': () => {
        token = '';
        submit.disabled = true;
        status.textContent = 'Security check expired. Please try it again.';
      },
      'error-callback': () => {
        token = '';
        submit.disabled = true;
        status.textContent = 'Security check unavailable. Please try again later.';
      },
    });
    status.textContent = 'Checking this submission...';
  } catch {
    status.textContent = 'Reporting is temporarily unavailable. The tool still works normally.';
    return;
  }

  submit.addEventListener('click', async () => {
    if (!token || submit.disabled) return;
    submit.disabled = true;
    cancel.disabled = true;
    status.textContent = 'Sending report...';
    try {
      const payload = buildReportPayload({ tool, inputRegion, outputRegion, note: note.value, token });
      const response = await fetch(REPORT_URL, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('report rejected');
      status.textContent = 'Thanks. Report saved.';
      trigger.dataset.reportSent = 'true';
      trigger.textContent = 'Report sent';
      setTimeout(close, 900);
    } catch {
      token = '';
      cancel.disabled = false;
      status.textContent = 'Report not sent. Please try again later.';
      if (api && widgetId !== null) {
        try { api.reset(widgetId); } catch { /* leave submit disabled */ }
      }
    }
  });
}
