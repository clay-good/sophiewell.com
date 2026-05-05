// spec-v4 §6: shared decision-tree renderer.
//
// A tree node is `{ question, helpText?, options: [{ label, next?, result?, rationale? }] }`.
// Each option either advances to a `next` node (object) or terminates with a `result` string.
// Path is encoded as a comma-separated list of option indices in the URL hash key `t`.

import { el, clear } from './dom.js';
import { copyButton } from './clipboard.js';
import { patchHash, parseHash } from './hash.js';

// --- Pure helpers (testable without a DOM) ---

export function traverseTree(tree, path) {
  const history = [];
  let node = tree;
  for (let i = 0; i < path.length; i++) {
    if (!node || !Array.isArray(node.options)) {
      return { node: null, atResult: false, history, invalidAt: i };
    }
    const idx = path[i];
    const opt = node.options[idx];
    if (!opt) return { node: null, atResult: false, history, invalidAt: i };
    history.push({ question: node.question, choice: opt.label });
    if (opt.result !== undefined) {
      return { node: opt, atResult: true, history, invalidAt: -1 };
    }
    node = opt.next;
  }
  return { node, atResult: false, history, invalidAt: -1 };
}

export function encodePath(path) {
  return path.join(',');
}

export function decodePath(s) {
  if (!s) return [];
  return s.split(',').map((n) => Number(n)).filter((n) => Number.isInteger(n) && n >= 0);
}

// --- Render ---

export function renderDecisionTree(rootEl, tree, opts = {}) {
  const { stateKey = 't' } = opts;
  let path = decodePath(parseHash(typeof window !== 'undefined' ? window.location.hash : '').state[stateKey] || '');

  const live = el('div', { 'aria-live': 'polite', class: 'tree-live' });

  function writeHash() {
    if (typeof window === 'undefined') return;
    const cur = parseHash(window.location.hash);
    const state = { ...cur.state };
    if (path.length) state[stateKey] = encodePath(path);
    else delete state[stateKey];
    window.history.replaceState(null, '', patchHash({ state }));
  }

  function go(idx) {
    path = path.concat([idx]);
    writeHash();
    draw();
  }

  function back() {
    if (!path.length) return;
    path = path.slice(0, -1);
    writeHash();
    draw();
  }

  function restart() {
    path = [];
    writeHash();
    draw();
  }

  function draw() {
    clear(rootEl);
    const { node, atResult, history } = traverseTree(tree, path);
    if (!node) {
      // Invalid path -- reset.
      path = [];
      writeHash();
    }
    const cur = node || tree;

    if (atResult) {
      const card = el('div', { class: 'tree-result', role: 'region', 'aria-label': 'Result' });
      card.appendChild(el('h2', { text: 'Result' }));
      card.appendChild(el('p', { class: 'tree-result-text', text: String(cur.result) }));
      if (cur.rationale) {
        card.appendChild(el('p', { class: 'tree-rationale', text: cur.rationale }));
      }
      const ol = el('ol', { class: 'tree-path' });
      for (const step of history) {
        ol.appendChild(el('li', {}, [
          el('span', { class: 'tree-q', text: step.question }),
          el('span', { 'aria-hidden': 'true', text: ' → ' }),
          el('span', { class: 'tree-a', text: step.choice }),
        ]));
      }
      card.appendChild(ol);
      const copyText = [
        String(cur.result),
        cur.rationale || '',
        ...history.map((s) => `${s.question} → ${s.choice}`),
      ].filter(Boolean).join('\n');
      const liveCopy = el('span', { class: 'copy-live visually-hidden', 'aria-live': 'polite', role: 'status' });
      const row = el('div', { class: 'tree-actions' }, [
        copyButton(() => copyText, { label: 'Copy', live: liveCopy }),
        liveCopy,
        el('button', { type: 'button', class: 'tree-back', text: 'Back' }),
        el('button', { type: 'button', class: 'tree-restart', text: 'Restart' }),
      ]);
      row.querySelector('.tree-back').addEventListener('click', back);
      row.querySelector('.tree-restart').addEventListener('click', restart);
      card.appendChild(row);
      rootEl.appendChild(card);
    } else {
      rootEl.appendChild(el('h2', { class: 'tree-question', text: cur.question || '' }));
      if (cur.helpText) {
        rootEl.appendChild(el('p', { class: 'tree-help', text: cur.helpText }));
      }
      const list = el('div', { class: 'tree-options', role: 'group' });
      (cur.options || []).forEach((opt, i) => {
        const b = el('button', { type: 'button', class: 'tree-option', text: opt.label });
        b.addEventListener('click', () => go(i));
        list.appendChild(b);
      });
      rootEl.appendChild(list);
      if (path.length) {
        const actions = el('div', { class: 'tree-actions' }, [
          el('button', { type: 'button', class: 'tree-back', text: 'Back' }),
          el('button', { type: 'button', class: 'tree-restart', text: 'Restart' }),
        ]);
        actions.querySelector('.tree-back').addEventListener('click', back);
        actions.querySelector('.tree-restart').addEventListener('click', restart);
        rootEl.appendChild(actions);
      }
    }
    rootEl.appendChild(live);
  }

  draw();
  return { restart, back, getPath: () => path.slice() };
}
