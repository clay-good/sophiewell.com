import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { convertV4MiniflareOptions, Miniflare } from 'miniflare';
import { cleanupReports, storeReport } from '../../report-worker.mjs';

const BASE_REPORT = {
  calculatorId: 'bmi',
  calculatorName: 'BMI Calculator',
  pageUrl: 'https://sophiewell.com/#bmi',
  note: 'expected a different result',
  inputs: [{ label: 'Weight', value: '70' }],
  outputs: {
    values: [{ label: 'BMI', value: '22.9' }],
    text: 'BMI 22.9',
    truncated: false,
  },
};

test('real D1 schema enforces dedupe, quotas, counters, and retention', async () => {
  const mf = new Miniflare(convertV4MiniflareOptions({
    name: 'report-test',
    modules: true,
    script: 'export default { fetch() { return new Response("ok"); } };',
    compatibilityDate: '2026-08-23',
    d1Databases: { REPORTS_DB: 'reports-test' },
  }));
  try {
    const db = await mf.getD1Database('REPORTS_DB', 'report-test');
    const migration = await readFile(new URL('../../migrations/0001_calculator_reports.sql', import.meta.url), 'utf8');
    for (const statement of migration.split(';').map((sql) => sql.trim()).filter(Boolean)) {
      await db.prepare(statement).run();
    }
    const env = {
      REPORT_HASH_SECRET: 'x'.repeat(32),
      REPORT_DAILY_LIMIT: '3',
      REPORT_REPORTER_DAILY_LIMIT: '2',
    };

    await storeReport(db, BASE_REPORT, env, '192.0.2.1');
    await storeReport(db, BASE_REPORT, env, '192.0.2.1');
    await storeReport(db, { ...BASE_REPORT, note: 'second report' }, env, '192.0.2.1');
    await storeReport(db, { ...BASE_REPORT, note: 'reporter quota drop' }, env, '192.0.2.1');
    await storeReport(db, { ...BASE_REPORT, note: 'third accepted report' }, env, '192.0.2.2');
    await storeReport(db, { ...BASE_REPORT, note: 'global quota drop' }, env, '192.0.2.3');

    const reports = await db.prepare('SELECT id, note FROM calculator_reports ORDER BY created_at').all();
    assert.equal(reports.results.length, 3);
    assert.deepEqual(reports.results.map((row) => row.note).sort(), [
      'expected a different result', 'second report', 'third accepted report',
    ]);
    const limits = await db.prepare('SELECT scope, count FROM report_limits ORDER BY scope, count').all();
    assert.deepEqual(limits.results.map(({ scope, count }) => ({ scope, count })), [
      { scope: 'global', count: 3 },
      { scope: 'reporter', count: 1 },
      { scope: 'reporter', count: 2 },
    ]);

    await db.prepare(`UPDATE calculator_reports SET status = 'resolved',
      created_at = datetime('now', '-91 days') WHERE note = ?`).bind('second report').run();
    await db.prepare(`UPDATE calculator_reports SET created_at = datetime('now', '-181 days')
      WHERE note = ?`).bind('third accepted report').run();
    await db.prepare("INSERT INTO report_limits VALUES ('2000-01-01', 'global', 'old', 1)").run();
    await cleanupReports(db);

    const retained = await db.prepare('SELECT note FROM calculator_reports').all();
    assert.deepEqual(retained.results, [{ note: 'expected a different result' }]);
    const oldLimits = await db.prepare("SELECT count(*) AS count FROM report_limits WHERE bucket = '2000-01-01'").first();
    assert.equal(oldLimits.count, 0);
  } finally {
    await mf.dispose();
  }
});
