// spec-v760: read a tile's fields from what it actually rendered.
//
// data/fields/<bucket>.json is built from the MCP adapters, so a tile without
// an adapter has no shard and can never prefill. That coupling is wrong: the
// 24 waivers in docs/mcp-waivers.md are about AGENT exposure -- determinism, a
// live clock, a recommendation posture, a file upload -- and none of those are
// reasons a nurse's typed values should fail to land in a browser form.
//
// 18 of those 24 have real typed inputs. A reader can find `device-day-counter`
// by name and then has to retype the values their own question already carried.
//
// So when there is no shard, read the DOM. It is the most accurate source there
// is -- it IS what the reader is looking at, labels and units and all -- it
// needs no build step, and it covers any tile added later without anyone
// remembering to wire it up. Returns the same short-keyed rows
// lib/query-fill.js reads, so the extractor and every safety rule in it are
// shared verbatim between the two paths.

// Inputs that hold no value worth filling from a sentence.
const SKIP_TYPES = new Set(['button', 'submit', 'reset', 'file', 'image', 'hidden']);

// The unit a field is expressed in: the selected option of its `<id>-unit`
// toggle, else the parenthetical the label carries ("Age (years)").
function unitFor(root, id, labelText) {
  const sel = root.ownerDocument
    ? root.ownerDocument.getElementById(`${id}-unit`)
    : null;
  if (sel && sel.tagName === 'SELECT') {
    const opt = sel.selectedOptions && sel.selectedOptions[0];
    if (opt && opt.textContent.trim()) return opt.textContent.trim();
  }
  const m = /\(([^)]{1,24})\)/.exec(labelText || '');
  return m ? m[1].trim() : '';
}

function labelFor(root, node) {
  if (node.id) {
    const lab = root.querySelector(`label[for="${CSS.escape(node.id)}"]`);
    if (lab && lab.textContent.trim()) return lab.textContent.trim();
  }
  // A checkbox is usually wrapped by its own label rather than pointed at.
  const wrap = node.closest('label');
  if (wrap && wrap.textContent.trim()) return wrap.textContent.trim();
  return node.getAttribute('aria-label') || '';
}

/**
 * Describe every fillable field a rendered tile is showing.
 *
 * @param {Element} root  the tile body (#tool-body)
 * @returns {Array} rows in the shape lib/query-fill.js reads
 */
export function readDomFields(root) {
  if (!root || typeof root.querySelectorAll !== 'function') return [];
  const rows = [];
  const seen = new Set();

  for (const node of root.querySelectorAll('input, select, textarea')) {
    const id = node.id;
    // No id means no way to address it, and no way to put it in the hash.
    if (!id || seen.has(id)) continue;
    // The unit toggles are read THROUGH their field, never filled directly.
    if (/-unit$/.test(id)) continue;
    if (node.tagName === 'INPUT' && SKIP_TYPES.has(node.type)) continue;

    const label = labelFor(root, node);
    if (!label) continue;
    seen.add(id);

    if (node.tagName === 'SELECT') {
      const values = [...node.options].map((o) => o.value).filter((v) => v !== '');
      if (!values.length) continue;
      rows.push({ d: id, k: 'enum', l: label, v: values });
      continue;
    }
    if (node.type === 'checkbox' || node.type === 'radio') {
      rows.push({ d: id, k: 'bool', l: label });
      continue;
    }

    const row = { d: id, k: node.type === 'number' ? 'number' : 'string', l: label };
    // A text input that carries a numeric-looking unit or a number placeholder
    // is a number field the view simply did not type as one; several tiles use
    // `type="text"` with `inputmode="numeric"`.
    if (row.k === 'string' && (node.inputMode === 'numeric' || node.inputMode === 'decimal')) {
      row.k = 'number';
    }
    const unit = unitFor(root, id, label);
    if (unit) row.u = unit;
    if (node.required) row.r = 1;
    rows.push(row);
  }

  return rows;
}
