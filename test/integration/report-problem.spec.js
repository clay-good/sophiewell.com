import { test, expect } from '@playwright/test';

async function expectDialogCentered(dialog) {
  const centerDelta = await dialog.evaluate((element) => {
    const bounds = element.getBoundingClientRect();
    return {
      x: Math.abs(bounds.left + (bounds.width / 2) - (window.innerWidth / 2)),
      y: Math.abs(bounds.top + (bounds.height / 2) - (window.innerHeight / 2)),
    };
  });
  expect(centerDelta.x).toBeLessThanOrEqual(2);
  expect(centerDelta.y).toBeLessThanOrEqual(2);
}

test('a mobile clinician can send reproducible tool context', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.addInitScript(() => {
    window.turnstile = {
      render: (_host, options) => {
        queueMicrotask(() => options.callback('browser-test-token'));
        return 'widget-1';
      },
      remove: () => {},
      reset: () => {},
    };
  });

  let submitted = null;
  await page.route('**/api/reports/config', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ sitekey: 'browser-test-sitekey' }),
  }));
  await page.route('**/api/reports', async (route) => {
    submitted = route.request().postDataJSON();
    await route.fulfill({
      status: 202,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true }),
    });
  });

  await page.goto('/#bmi');
  const report = page.getByRole('button', { name: 'Report a problem' });
  await expect(report).toBeVisible();
  await expect(report).toHaveCSS('min-height', '44px');

  await report.click();
  const dialog = page.getByRole('dialog', { name: 'Report a problem' });
  await expect(dialog).toBeVisible();
  await expectDialogCentered(dialog);
  await expect(dialog).toContainText("only this tool's URL");
  await expect(dialog).toContainText('Do not include a patient name');
  await dialog.getByLabel(/Include current inputs and results/).check();

  const note = dialog.getByLabel('What did you expect instead? (optional)');
  await expect(note).toHaveAttribute('maxlength', '160');
  await note.fill('I expected a BMI of 23.');
  await expect(dialog).toContainText('137 characters remaining');

  const send = dialog.getByRole('button', { name: 'Send report' });
  await expect(send).toBeEnabled();
  await send.click();
  await expect(dialog).toContainText('Thanks. Report saved.');

  expect(submitted).toBeTruthy();
  expect(submitted.calculator_id).toBe('bmi');
  expect(submitted.page_url).toMatch(/\/#bmi$/);
  expect(submitted.note).toBe('I expected a BMI of 23.');
  expect(submitted.turnstile_token).toBe('browser-test-token');
  expect(submitted.inputs.length).toBeGreaterThan(0);
  expect(submitted.outputs).toHaveProperty('values');

  const width = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    client: document.documentElement.clientWidth,
  }));
  expect(width.scroll).toBeLessThanOrEqual(width.client + 1);
});

test('ordinary reports omit calculator context unless the clinician opts in', async ({ page }) => {
  await page.addInitScript(() => {
    window.turnstile = {
      render: (_host, options) => {
        queueMicrotask(() => options.callback('browser-test-token'));
        return 'widget-1';
      },
      remove: () => {},
      reset: () => {},
    };
  });
  let submitted = null;
  await page.route('**/api/reports/config', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ sitekey: 'browser-test-sitekey' }),
  }));
  await page.route('**/api/reports', async (route) => {
    submitted = route.request().postDataJSON();
    await route.fulfill({ status: 202, contentType: 'application/json', body: '{"ok":true}' });
  });

  await page.goto('/#bmi');
  await page.getByRole('button', { name: 'Report a problem' }).click();
  const dialog = page.getByRole('dialog', { name: 'Report a problem' });
  await expectDialogCentered(dialog);
  await expect(dialog.getByLabel(/Include current inputs and results/)).not.toBeChecked();
  await dialog.getByRole('button', { name: 'Send report' }).click();
  await expect(dialog).toContainText('Thanks. Report saved.');
  expect(submitted.inputs).toEqual([]);
  expect(submitted.outputs).toEqual({ values: [], text: '', truncated: false });
});

test('sensitive tools do not attach form fields, generated text, or URL state', async ({ page }) => {
  await page.addInitScript(() => {
    window.turnstile = {
      render: (_host, options) => {
        queueMicrotask(() => options.callback('browser-test-token'));
        return 'widget-1';
      },
      remove: () => {},
      reset: () => {},
    };
  });
  let submitted = null;
  await page.route('**/api/reports/config', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ sitekey: 'browser-test-sitekey' }),
  }));
  await page.route('**/api/reports', async (route) => {
    submitted = route.request().postDataJSON();
    await route.fulfill({ status: 202, contentType: 'application/json', body: '{"ok":true}' });
  });

  await page.goto('/?patient=URL-IDENTIFIER#mbi-validate');
  await page.getByLabel('MBI (11 characters)').fill('1EG4TE5MK73');
  await expect(page.locator('#q-results')).toContainText('1EG4TE5MK73');
  await page.getByRole('button', { name: 'Report a problem' }).click();
  const dialog = page.getByRole('dialog', { name: 'Report a problem' });
  await expect(dialog).toContainText('we will not attach form entries, generated text, or URL state');
  await dialog.getByRole('button', { name: 'Send report' }).click();
  await expect(dialog).toContainText('Thanks. Report saved.');
  expect(submitted.inputs).toEqual([]);
  expect(submitted.outputs).toEqual({ values: [], text: '', truncated: false });
  expect(submitted.page_url).toMatch(/\/#mbi-validate$/);
  expect(JSON.stringify(submitted)).not.toContain('1EG4TE5MK73');
  expect(JSON.stringify(submitted)).not.toContain('URL-IDENTIFIER');
});
