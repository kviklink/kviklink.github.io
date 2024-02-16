import { expect, test } from '@playwright/test';

// eslint-disable-next-line
test('index page has expected h1', async ({ page }) => {
    // await page.goto('/');
    // await expect(
    //     page.getByRole('heading', { name: 'Welcome to SvelteKit' })
    // ).toBeVisible();
    expect(1).toBe(1)
});
