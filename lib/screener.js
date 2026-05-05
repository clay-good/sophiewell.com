// spec-v4 §6: shared screener renderer for PHQ-9 / GAD-7 / AUDIT-C / CAGE /
// EPDS / Mini-Cog / CIWA-Ar / COWS-style instruments.
//
// Config shape:
//   { id, items: [{ prompt, options: [{ label, value }] }],
//     severityBands: [{ min, max, label, advisory? }],
//     citation, exampleAnswers? }

import { el, clear } from './dom.js';
import { copyButton } from './clipboard.js';
import { patchHash, parseHash } from './hash.js';

// --- Pure helpers ---

export function scoreScreener(items, answers) {
  if (!Array.isArray(items)) throw new TypeError('items must be an array');
  if (!Array.isArray(answers)) throw new TypeError('answers must be an array');
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    const a = answers[i];
    if (a === undefined || a === null || a === '') continue;
    const n = Number(a);
    if (!Number.isFinite(n)) throw new RangeError(`answer ${i} not numeric`);
    total += n;
  }
  return total;
}

export function bandFor(severityBands, score) {
  if (!Array.isArray(severityBands)) return null;
  for (const b of severityBands) {
    if (score >= b.min && score <= b.max) return b;
  }
  return null;
}

export function isComplete(items, answers) {
  if (!Array.isArray(items) || !Array.isArray(answers)) return false;
  if (answers.length < items.length) return false;
  for (let i = 0; i < items.length; i++) {
    const a = answers[i];
    if (a === undefined || a === null || a === '') return false;
  }
  return true;
}

export function serializeAnswers(answers) {
  return answers.map((a) => (a === undefined || a === null || a === '' ? '_' : String(a))).join(',');
}

export function parseAnswers(s) {
  if (!s) return [];
  return s.split(',').map((tok) => (tok === '_' ? null : tok));
}

// --- Render ---

export function renderScreener(rootEl, config) {
  const { id, items, severityBands, citation, exampleAnswers, notice } = config;
  const stateKey = 'a';
  let answers = new Array(items.length).fill(null);

  // Hydrate from hash if present.
  if (typeof window !== 'undefined') {
    const cur = parseHash(window.location.hash);
    if (cur.state[stateKey]) {
      const parsed = parseAnswers(cur.state[stateKey]);
      for (let i = 0; i < items.length; i++) answers[i] = parsed[i] != null ? parsed[i] : null;
    }
  }

  const resultRegion = el('div', { class: 'screener-result', 'aria-live': 'polite' });

  function writeHash() {
    if (typeof window === 'undefined') return;
    const cur = parseHash(window.location.hash);
    const state = { ...cur.state, [stateKey]: serializeAnswers(answers) };
    window.history.replaceState(null, '', patchHash({ state }));
  }

  function renderResult() {
    clear(resultRegion);
    if (!isComplete(items, answers)) return;
    const score = scoreScreener(items, answers);
    const band = bandFor(severityBands, score);
    resultRegion.appendChild(el('p', { class: 'screener-score', text: `Score: ${score}` }));
    if (band) {
      resultRegion.appendChild(el('p', { class: 'screener-band', text: `Severity: ${band.label}` }));
      if (band.advisory) {
        resultRegion.appendChild(el('p', { class: 'screener-advisory muted', text: band.advisory }));
      }
    }
    const liveCopy = el('span', { class: 'copy-live visually-hidden', 'aria-live': 'polite', role: 'status' });
    const copyText = [`Score: ${score}`, band ? `Severity: ${band.label}` : null].filter(Boolean).join('\n');
    resultRegion.appendChild(el('div', { class: 'screener-copy-row' }, [
      copyButton(() => copyText, { label: 'Copy result', live: liveCopy }),
      liveCopy,
    ]));
  }

  function setAnswer(i, value) {
    answers[i] = value;
    writeHash();
    renderResult();
  }

  clear(rootEl);

  const noticeText = notice || 'Screening, not diagnosis. Clinical judgment governs interpretation.';
  rootEl.appendChild(el('p', { class: 'screener-notice', role: 'note', text: noticeText }));

  const form = el('form', { class: 'screener-form' });
  form.addEventListener('submit', (e) => e.preventDefault());

  items.forEach((item, i) => {
    const fs = el('fieldset', { class: 'screener-item' });
    fs.appendChild(el('legend', { text: item.prompt }));
    item.options.forEach((opt) => {
      const inputId = `${id}-i${i}-v${opt.value}`;
      const input = el('input', {
        type: 'radio',
        name: `${id}-i${i}`,
        id: inputId,
        value: String(opt.value),
      });
      if (String(answers[i]) === String(opt.value)) input.setAttribute('checked', 'checked');
      input.addEventListener('change', () => setAnswer(i, opt.value));
      const label = el('label', { for: inputId }, [input, ' ' + opt.label]);
      fs.appendChild(label);
    });
    form.appendChild(fs);
  });

  rootEl.appendChild(form);

  if (exampleAnswers) {
    const btn = el('button', { type: 'button', class: 'example-btn', text: 'Test with example' });
    btn.addEventListener('click', () => {
      answers = exampleAnswers.slice();
      writeHash();
      // Re-tick radios to match.
      items.forEach((item, i) => {
        item.options.forEach((opt) => {
          const radio = form.querySelector(`#${CSS.escape(`${id}-i${i}-v${opt.value}`)}`);
          if (radio) radio.checked = String(opt.value) === String(answers[i]);
        });
      });
      renderResult();
    });
    rootEl.appendChild(el('p', { class: 'screener-example-row' }, [btn]));
  }

  rootEl.appendChild(resultRegion);

  if (citation) {
    rootEl.appendChild(el('p', { class: 'screener-citation muted', text: `Citation: ${citation}` }));
  }

  renderResult();
  return { getAnswers: () => answers.slice(), setAnswers: (a) => { answers = a.slice(); renderResult(); } };
}
