import { test, expect } from '@playwright/test';

test('start a game and make a move', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Merge Garden' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'New Game' }).first()).toBeVisible();
  const tiles = page.locator('.tile');
  expect(await tiles.count()).toBeGreaterThanOrEqual(2);
  const before = await page.locator('.tile').evaluateAll((els) =>
    els.map((e) => (e as HTMLElement).style.getPropertyValue('--r') + (e as HTMLElement).style.getPropertyValue('--c')).join());
  for (const key of ['ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown']) await page.keyboard.press(key);
  await page.waitForTimeout(400);
  const after = await page.locator('.tile').evaluateAll((els) =>
    els.map((e) => (e as HTMLElement).style.getPropertyValue('--r') + (e as HTMLElement).style.getPropertyValue('--c')).join());
  expect(after).not.toBe(before);
});

test('reload keeps the game state', async ({ page }) => {
  await page.goto('/');
  for (const key of ['ArrowLeft', 'ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft']) await page.keyboard.press(key);
  await page.waitForTimeout(400);
  const snapshot = () =>
    page.evaluate(() => ({ stored: localStorage.getItem('merge-garden:v1'), tiles: [...document.querySelectorAll('.tile')].length,
      score: document.querySelector('.box-value')?.textContent }));
  const before = await snapshot();
  await page.reload();
  const after = await snapshot();
  expect(after).toEqual(before);
});
