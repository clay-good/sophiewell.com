// spec-v1698: the VCF tools read off the UI thread. The File is posted as is (structured clone, not read),
// streamed here, and progress is posted back; the page cancels by terminating the worker.
import { runVcf } from './vcf-run-v1698.js';

self.addEventListener('message', async (event) => {
  const m = event.data || {};
  try {
    if (m.type !== 'run') throw new TypeError('Unknown VCF operation.');
    const { result, receipts } = await runVcf(m.tool, m.file, m.file && m.file.name, {
      query: m.query, sample: m.sample,
      onProgress: (p) => self.postMessage({ type: 'progress', ...p }),
    });
    self.postMessage({ type: 'done', result, receipt: receipts && receipts.receipt, shareableReceipt: receipts && receipts.shareable });
  } catch (error) {
    self.postMessage({ type: 'error', message: error instanceof Error ? error.message : String(error) });
  }
});
