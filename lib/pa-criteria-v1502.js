// spec-v1502 tool 1: payer criteria checklist.
//
// The reader pastes the criteria from the payer's published policy and marks each item at the end of its
// line: [met], [not met] or [not documented], optionally followed by "--" and where the evidence is. The
// text is split at the policy's own numbering (1. or 1), a. or a), i. or i), and bullets), keeping its
// nesting, and the "all of" / "one of" connectives are read only where the policy states them (a heading
// line, or an item that ends by introducing its sub-items). "Not documented" and an unmarked item never
// count as met. If a connective the logic needs is not stated, nothing is evaluated and the tool says the
// reader must decide the logic. The reader supplies every judgment; the tool does the bookkeeping.
//
// Pure: no DOM, no clock.

const ALL = /\b(all|each|every one) of the following\b|\ball the following\b|\bmust meet all\b|\bboth of the following\b/i;
const ANY = /\b(one|any|at least one|either) of the following\b|\bmust meet (one|any)\b/i;
const MARK = /\[\s*(met|not met|not documented)\s*\]\s*(?:(?:--|—|–)\s*(.*))?$/i;
const ROMAN = /^(i|ii|iii|iv|v|vi|vii|viii|ix|x)$/i;

function connective(text) {
  if (ALL.test(text)) return 'all';
  if (ANY.test(text)) return 'any';
  return null;
}

export function parseCriteria(text) {
  const root = { level: 0, children: [], conn: null, label: 'root' };
  const stack = [root];
  let lastLetter = null;
  let pendingConn = null;
  const lines = String(text ?? '').split(/\r?\n/).map((l) => l.replace(/\s+$/, '')).filter((l) => l.trim());
  for (const raw of lines) {
    const line = raw.trim();
    const m = /^(?:(\d+)[.)]|\(?([a-z]{1,4})[.)]|([-•*]))\s+(.*)$/i.exec(line);
    if (!m) {
      const c = connective(line);
      if (c) pendingConn = c;
      continue;
    }
    let level;
    let label;
    if (m[1]) { level = 1; label = m[1]; lastLetter = null; } else if (m[2]) {
      const tok = m[2].toLowerCase();
      const nextLetter = lastLetter ? String.fromCharCode(lastLetter.charCodeAt(0) + 1) : 'a';
      if (tok.length === 1 && (tok === nextLetter || !ROMAN.test(tok))) { level = 2; label = tok; lastLetter = tok; } else if (ROMAN.test(tok)) { level = 3; label = tok; } else { level = 2; label = tok; }
    } else { level = stack[stack.length - 1].level + 1; label = '•'; }
    let body = m[4];
    const mk = MARK.exec(body);
    let mark = null;
    let evidence = '';
    if (mk) { mark = mk[1].toLowerCase(); evidence = (mk[2] || '').trim(); body = body.slice(0, mk.index).trim(); }
    while (stack.length > 1 && stack[stack.length - 1].level >= level) stack.pop();
    const parent = stack[stack.length - 1];
    if (pendingConn && parent.conn === null) parent.conn = pendingConn;
    pendingConn = null;
    const node = { level, label, text: body, mark, evidence, children: [], conn: connective(body) };
    parent.children.push(node);
    stack.push(node);
  }
  return root;
}

// value: true / false / null (logic not stated)
function evaluate(node, open, missing) {
  if (!node.children.length) {
    if (!node.mark) open.push(node);
    return node.mark === 'met';
  }
  const vals = node.children.map((c) => evaluate(c, open, missing));
  if (node.conn === null) { missing.push(node); return null; }
  if (vals.some((v) => v === null)) return null;
  return node.conn === 'all' ? vals.every(Boolean) : vals.some(Boolean);
}

export function paCriteriaChecklist(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  if (!String(o.criteria ?? '').trim()) return { valid: false, message: 'Paste the criteria from the payer\'s policy, one item per line, and mark each item at the end: [met], [not met] or [not documented], then "--" and where the evidence is.' };
  const root = parseCriteria(o.criteria);
  if (!root.children.length) return { valid: false, message: 'No numbered or bulleted items were found; keep the policy\'s own numbering (1., a., i., or bullets) at the start of each item.' };
  const open = [];
  const missing = [];
  const result = evaluate(root, open, missing);
  const notes = [];
  const rows = [];
  const walk = (n, path) => {
    for (const c of n.children) {
      const p = path ? `${path}.${c.label}` : c.label;
      const status = c.children.length ? (c.conn ? `${c.conn === 'all' ? 'all of' : 'one of'} ${c.children.length}` : 'logic not stated') : (c.mark ? c.mark.replace(/^./, (x) => x.toUpperCase()) : 'Not yet marked');
      const txt = c.text.replace(/[:;]\s*$/, '');
      rows.push(`${p}. ${txt.slice(0, 120)}${txt.length > 120 ? '…' : ''}: ${status}${c.evidence ? ` (evidence: ${c.evidence})` : ''}.`);
      walk(c, p);
    }
  };
  walk(root, '');
  const drug = String(o.drug ?? '').trim();
  const plan = String(o.plan ?? '').trim();
  const head = drug || plan ? `Criteria for ${[drug, plan].filter(Boolean).join(', ')}: ` : '';
  let band;
  let label;
  if (result === null) {
    const where = missing.map((m) => (m === root ? 'the top-level list' : `item ${m.label}`)).join(', ');
    band = `${head}the policy text does not state "all of" or "one of" for ${where}, so the logic is not evaluated; decide it from the policy.${open.length ? ` ${open.length} item${open.length === 1 ? ' is' : 's are'} not yet marked.` : ''}`;
    label = 'Logic not stated';
  } else if (result) {
    band = `${head}the stated logic is satisfied by the items marked met.`;
    label = 'Satisfied';
  } else {
    band = `${head}the stated logic is not satisfied${open.length ? `; ${open.length} item${open.length === 1 ? ' is' : 's are'} not yet marked` : ''}.`;
    label = open.length ? `Not yet: ${open.length} open` : 'Not satisfied';
  }
  band = band.charAt(0).toUpperCase() + band.slice(1);
  notes.push(...rows);
  notes.push('"Not documented" and an unmarked item never count as met.');
  return { valid: true, satisfied: result, band, bandLabel: label, abnormal: result === false, notes, note: 'The reader judges each criterion; this checks the marks against the logic the policy states. The payer decides.' };
}
