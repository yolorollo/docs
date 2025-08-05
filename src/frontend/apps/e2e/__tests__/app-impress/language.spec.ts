import { expect, test } from '@playwright/test';

import { TestLanguage, createDoc, waitForLanguageSwitch } from './utils-common';

test.describe('Language', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('checks language switching', async ({ page }) => {
    const header = page.locator('header').first();

    await expect(page.locator('html')).toHaveAttribute('lang', 'en-us');

    // initial language should be english
    await expect(
      page.getByRole('button', {
        name: 'New doc',
      }),
    ).toBeVisible();

    // switch to french
    await waitForLanguageSwitch(page, TestLanguage.French);

    await expect(page.locator('html')).toHaveAttribute('lang', 'fr');

    await expect(
      header.getByRole('button').getByText('Français'),
    ).toBeVisible();

    await expect(page.getByLabel('Se déconnecter')).toBeVisible();

    await header.getByRole('button').getByText('Français').click();
    await page.getByLabel('Deutsch').click();
    await expect(header.getByRole('button').getByText('Deutsch')).toBeVisible();

    await expect(page.getByLabel('Abmelden')).toBeVisible();

    await expect(page.locator('html')).toHaveAttribute('lang', 'de');
  });

  test('checks that backend uses the same language as the frontend', async ({
    page,
  }) => {
    // Helper function to intercept and assert 404 response
    const check404Response = async (expectedDetail: string) => {
      const interceptedBackendResponse = await page.request.get(
        'http://localhost:8071/api/v1.0/documents/non-existent-doc-uuid/',
      );

      // Assert that the intercepted error message is in the expected language
      expect(await interceptedBackendResponse.json()).toStrictEqual({
        detail: expectedDetail,
      });
    };

    // Check for English 404 response
    await check404Response('Not found.');

    await waitForLanguageSwitch(page, TestLanguage.French);

    // Check for French 404 response
    await check404Response('Pas trouvé.');
  });

  test('it check translations of the slash menu when changing language', async ({
    page,
    browserName,
  }) => {
    await createDoc(page, 'doc-toolbar', browserName, 1);

    const editor = page.locator('.ProseMirror');

    // Trigger slash menu to show english menu
    await editor.click();
    await editor.fill('/');
    await expect(page.getByText('Headings', { exact: true })).toBeVisible();

    // Change language to French
    await waitForLanguageSwitch(page, TestLanguage.French);

    // Trigger slash menu to show french menu
    await editor.locator('.bn-block-outer').last().fill('/');
    await expect(page.getByText('Titres', { exact: true })).toBeVisible();
  });
});
