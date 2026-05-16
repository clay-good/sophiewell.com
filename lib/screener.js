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
    // spec-v9 §3.3: pre-fill the form with example answers on first paint
    // so the empty state is never empty. Hash-state radios already ticked
    // above win per slot; only fill answers the user has not set.
    const fillFromExample = (forceAll) => {
      items.forEach((item, i) => {
        if (!forceAll && answers[i] != null) return;
        const v = exampleAnswers[i];
        if (v == null) return;
        answers[i] = v;
        item.options.forEach((opt) => {
          const radio = form.querySelector(`#${CSS.escape(`${id}-i${i}-v${opt.value}`)}`);
          if (radio) radio.checked = String(opt.value) === String(v);
        });
      });
      writeHash();
      renderResult();
    };
    fillFromExample(false);

    const link = el('a', {
      href: '#',
      class: 'example-reset',
      text: 'Reset to example',
      'aria-label': 'Reset answers to the example responses',
    });
    link.addEventListener('click', (e) => {
      e.preventDefault();
      fillFromExample(true);
    });
    rootEl.appendChild(el('p', { class: 'screener-example-row' }, [link]));
  }

  rootEl.appendChild(resultRegion);

  // spec-v9 §3.4: the per-tile References region (rendered by
  // renderMetaBlock in app.js from META[id].citation) is the only
  // citation surface. The screener no longer emits its own duplicate
  // citation line. `citation` remains accepted on the config so
  // configs do not need to drop the field, and so tests asserting on
  // its presence in the config object keep passing.
  void citation;

  renderResult();
  return { getAnswers: () => answers.slice(), setAnswers: (a) => { answers = a.slice(); renderResult(); } };
}
