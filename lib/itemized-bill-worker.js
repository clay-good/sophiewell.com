// spec-v1602 tool 2: an itemized bill against the hospital's price file, read in a Worker so a price file of
// gigabytes never sits in the page. No network code: the page passes in the MUE rows it loaded.
import { extractForCodes } from './hpt-compare.js';
import { itemizedBillCheck } from './itemized-bill-check.js';
import { sha256Blob } from './sha256.js';
import { recognize, LIMITS } from './file-kinds.js';
import { receiptFor } from './receipt-worker.js';

self.addEventListener('message', async (event) => {
  try {
    const m = event.data || {};
    if (m.type !== 'check' || !(m.priceFile instanceof Blob)) throw new TypeError('Choose the hospital\'s price file.');
    self.postMessage({ type: 'progress', name: m.priceFile.name });
    const codes = [...new Set((m.lines || []).map((l) => String(l.code ?? '').trim().toUpperCase()).filter(Boolean))];
    const prices = await extractForCodes(m.priceFile, codes);
    if (prices.error) throw new Error(`${m.priceFile.name} could not be read: ${prices.error}`);
    const result = itemizedBillCheck({ lines: m.lines, setting: m.setting, payment: m.payment, plan: m.plan, prices: prices.prices, hospital: prices.hospital, mue: m.mue && m.mue.rows, mueEdition: m.mue && m.mue.edition });
    if (prices.truncated) result.notes = [...(result.notes || []), 'The price file had more matching items than are kept; some posted prices may be missing.'];
    const files = [m.priceFile, ...(m.billFile instanceof Blob ? [m.billFile] : [])];
    const facts = [];
    for (const f of files) {
      const kind = recognize(new Uint8Array(await f.slice(0, LIMITS.headBytes).arrayBuffer()), { name: f.name });
      facts.push({ name: f.name, size: f.size, sha256: await sha256Blob(f), kind: kind.kind, evidence: kind.evidence });
    }
    const data = m.mue && m.mue.edition ? [{ id: 'mue', sourceEdition: m.mue.edition }] : [];
    const receipts = receiptFor('itemized-bill-check', facts, result, { setting: m.setting, payment: m.payment, plan: m.plan || null }, data);
    self.postMessage({ type: 'checked', ...result, hospitalUpdated: prices.lastUpdated, receipt: receipts.receipt, shareableReceipt: receipts.shareable });
  } catch (error) {
    self.postMessage({ type: 'error', message: error instanceof Error ? error.message : String(error) });
  }
});
