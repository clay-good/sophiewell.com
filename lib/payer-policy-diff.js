// spec-v1603 tool 2: what changed in this payer policy?
//
// Two versions of a payer's published criteria, pasted as text, are split
// with the pa-criteria-checklist splitter (parseCriteria, which keeps the
// policy's own numbering and its "all of" / "one of" connectives) and matched
// criterion by criterion:
//   - unchanged: the same words (case, spacing and punctuation aside);
//   - threshold: the same words around different numbers ("2 prior drugs"
//     becoming "3"). Tightened or loosened is said only where the wording
//     shows which way is stricter; otherwise it is "changed" and the reader
//     judges it;
//   - reworded: mostly the same words and the same numbers. The tool cannot
//     tell whether the meaning moved, so it shows both;
//   - added and removed: what matched nothing.
// A list whose connective changed ("one of" to "all of") is a change in its
// own right. The tool compares wording; the payer's policy decides requests.
//
// Pure: no DOM, no clock.

import { parseCriteria } from './pa-criteria-v1502.js';

const NUM = /\d+(?:\.\d+)?/g;
// A number that caps something: a lower one is stricter.
const CEILING = /\b(no more than|not more than|at most|maximum( of)?|max|less than|fewer than|under|below|within|up to|or less|or fewer)\s*$|[<≤]=?\s*$/i;
// A number that sets a floor or a required amount: a higher one is stricter.
const FLOOR = /\b(at least|minimum( of)?|min|more than|greater than|over|above|or more|or older|or greater|trials? of|failed?|prior|previous|consecutive|duration of|for)\s*$|[>≥]=?\s*$|^\s*\S*\s*(prior|previous|consecutive|trials?|failed|weeks?|months?|days?|years?|doses?|drugs?|medications?|agents?|attempts?|or more|or older)\b/i;
const STOP = new Set(['the', 'a', 'an', 'of', 'to', 'and', 'or', 'with', 'for', 'in', 'on', 'is', 'be', 'by', 'has', 'have', 'patient', 'member']);

const norm = (t) => String(t).toLowerCase().replace(/[^\p{L}\p{N}\s.]/gu, ' ').replace(/\.(?!\d)/g, ' ').replace(/\s+/g, ' ').trim();
const shape = (t) => norm(t).replace(NUM, '#');
const nums = (t) => norm(t).match(NUM) || [];
const words = (t) => new Set(norm(t).replace(NUM, ' ').split(' ').filter((w) => w && !STOP.has(w)));
function similarity(a, b) {
  const x = words(a);
  const y = words(b);
  if (!x.size && !y.size) return 1;
  let both = 0;
  for (const w of x) if (y.has(w)) both += 1;
  return both / (x.size + y.size - both);
}

function flatten(root) {
  const out = [];
  const walk = (node, path, parent) => {
    node.children.forEach((c) => {
      const p = path ? `${path}.${c.label}` : c.label;
      const item = { path: p, text: c.text, conn: c.conn, parentConn: parent.conn, hasChildren: c.children.length > 0 };
      out.push(item);
      walk(c, p, c);
    });
  };
  walk(root, '', root);
  return out;
}

// Which way did each changed number move, and is that stricter?
function thresholdChange(before, after) {
  const a = nums(before);
  const b = nums(after);
  const changes = [];
  const text = norm(after);
  const positions = [...text.matchAll(NUM)].map((m) => m.index);
  a.forEach((x, i) => {
    if (Number(x) === Number(b[i])) return;
    const pos = positions[i];
    const lead = text.slice(Math.max(0, pos - 24), pos);
    const tail = text.slice(pos, pos + 32).replace(NUM, '').replace(/^\s*/, '');
    let direction = null;
    if (CEILING.test(lead)) direction = Number(b[i]) < Number(x) ? 'tightened' : 'loosened';
    else if (FLOOR.test(lead) || FLOOR.test(` ${tail}`)) direction = Number(b[i]) > Number(x) ? 'tightened' : 'loosened';
    changes.push({ from: x, to: b[i], direction });
  });
  const dirs = new Set(changes.map((c) => c.direction));
  const direction = dirs.size === 1 ? [...dirs][0] : null;
  return { changes, direction };
}

const ORDER = { tightened: 0, 'logic-tightened': 1, added: 2, changed: 3, removed: 4, loosened: 5, 'logic-loosened': 6, reworded: 7 };
const LABEL = { tightened: 'Tightened', 'logic-tightened': 'Tightened (logic)', added: 'Added', changed: 'Threshold changed', removed: 'Removed', loosened: 'Loosened', 'logic-loosened': 'Loosened (logic)', reworded: 'Reworded' };
const DATE = /^\d{4}-\d{2}-\d{2}$/;

export function payerPolicyDiff(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const before = flatten(parseCriteria(o.before));
  if (!before.length) return { valid: false, message: 'Paste the earlier version of the policy\'s criteria, keeping its numbering (1., a., i. or bullets).' };
  const after = flatten(parseCriteria(o.after));
  if (!after.length) return { valid: false, message: 'Paste the newer version of the policy\'s criteria, keeping its numbering (1., a., i. or bullets).' };
  for (const k of ['beforeDate', 'afterDate']) {
    const v = String(o[k] ?? '').trim();
    if (v && !DATE.test(v)) return { valid: false, message: 'Enter each effective date as YYYY-MM-DD, or leave it blank.' };
  }
  const beforeDate = String(o.beforeDate ?? '').trim() || null;
  const afterDate = String(o.afterDate ?? '').trim() || null;
  if (beforeDate && afterDate && afterDate < beforeDate) return { valid: false, message: 'The newer version\'s effective date is before the earlier one\'s: check which text is which.' };

  const usedA = new Set();
  const usedB = new Set();
  const pairs = [];
  const pass = (test) => {
    before.forEach((x, i) => {
      if (usedA.has(i)) return;
      let best = -1;
      let score = 0;
      after.forEach((y, j) => {
        if (usedB.has(j)) return;
        const s = test(x, y);
        // A tie goes to the same position in the policy.
        if (s > score || (s === score && s > 0 && y.path === x.path)) { best = j; score = s; }
      });
      if (best >= 0) { usedA.add(i); usedB.add(best); pairs.push([x, after[best]]); }
    });
  };
  pass((x, y) => (norm(x.text) === norm(y.text) ? 1 : 0));
  pass((x, y) => (shape(x.text) === shape(y.text) && nums(x.text).length === nums(y.text).length ? 1 : 0));
  pass((x, y) => { const s = similarity(x.text, y.text); return s >= 0.6 ? s : 0; });

  const rows = [];
  let unchanged = 0;
  for (const [x, y] of pairs) {
    if (norm(x.text) === norm(y.text)) unchanged += 1;
    else if (shape(x.text) === shape(y.text)) {
      const t = thresholdChange(x.text, y.text);
      const nums2 = t.changes.map((c) => `${c.from} to ${c.to}`).join(', ');
      rows.push({ kind: t.direction || 'changed', path: y.path, before: x.text, after: y.text, detail: `${nums2}${t.direction ? '' : '; which way is stricter depends on the criterion'}` });
    } else rows.push({ kind: 'reworded', path: y.path, before: x.text, after: y.text, detail: 'Mostly the same words; read both to see whether the meaning moved.' });
    if (x.hasChildren && y.hasChildren && x.conn && y.conn && x.conn !== y.conn) {
      rows.push({ kind: y.conn === 'all' ? 'logic-tightened' : 'logic-loosened', path: y.path, before: x.text, after: y.text, detail: `Its sub-items went from ${x.conn === 'all' ? 'all of' : 'one of'} to ${y.conn === 'all' ? 'all of' : 'one of'}.` });
    }
  }
  const top = (list) => list.find((i) => !i.path.includes('.'))?.parentConn ?? null;
  const ta = top(before);
  const tb = top(after);
  if (ta && tb && ta !== tb) rows.push({ kind: tb === 'all' ? 'logic-tightened' : 'logic-loosened', path: '', before: '', after: '', detail: `The criteria as a whole went from ${ta === 'all' ? 'all of' : 'one of'} to ${tb === 'all' ? 'all of' : 'one of'}.` });
  before.forEach((x, i) => { if (!usedA.has(i)) rows.push({ kind: 'removed', path: x.path, before: x.text, after: '', detail: '' }); });
  after.forEach((y, j) => { if (!usedB.has(j)) rows.push({ kind: 'added', path: y.path, before: '', after: y.text, detail: '' }); });
  rows.sort((a, b) => ORDER[a.kind] - ORDER[b.kind]);
  for (const r of rows) r.label = LABEL[r.kind];

  const count = (k) => rows.filter((r) => r.kind === k || r.kind === `logic-${k}`).length;
  const parts = [['tightened', count('tightened')], ['added', count('added')], ['removed', count('removed')], ['with a changed threshold', count('changed')], ['loosened', count('loosened')], ['reworded', count('reworded')]].filter(([, n]) => n).map(([w, n]) => `${n} ${w}`);
  const when = afterDate ? ` The newer version is effective ${afterDate}${beforeDate ? `; the earlier one was effective ${beforeDate}` : ''}.` : '';
  const note = 'This compares the wording of the two versions. It does not decide what either one requires; the payer\'s policy does.';
  const notes = ['Criteria are matched by their words, not their numbering, so a criterion that moved is not reported as removed and added.'];
  if (!rows.length) {
    return { valid: true, verdict: 'no-change', band: `No change in the criteria: all ${unchanged} match word for word.${when}`, bandLabel: 'No change', abnormal: false, rows, unchanged, notes, note };
  }
  const tight = count('tightened');
  return {
    valid: true,
    verdict: tight ? 'tightened' : 'changed',
    band: `${rows.length} ${rows.length === 1 ? 'change' : 'changes'}: ${parts.join(', ')}; ${unchanged} unchanged.${when}`,
    bandLabel: tight ? 'Stricter in places' : 'Changed',
    abnormal: tight > 0 || count('added') > 0,
    rows,
    unchanged,
    notes,
    note,
  };
}

// The change list as CSV, for the practice to file with the policy.
export function diffCsv(r) {
  const q = (s) => `"${String(s ?? '').replace(/"/g, '""')}"`;
  const lines = ['change,item,before,after,detail'];
  for (const x of r.rows || []) lines.push([x.label, x.path, x.before, x.after, x.detail].map(q).join(','));
  return `${lines.join('\n')}\n`;
}
