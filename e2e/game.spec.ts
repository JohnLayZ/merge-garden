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

test('win overlay sits on top and its New Game button is clickable', async ({ page }) => {
  await page.goto('/');
  // Seed a nearly won position: two level-6 trees side by side.
  await page.evaluate(() => {
    const raw = JSON.parse(localStorage.getItem('merge-garden:v1') ?? 'null');
    const state = raw?.state;
    state.board = [6, 6, ...new Array(14).fill(0)];
    state.status = 'playing';
    state.cans = 0;
    localStorage.setItem('merge-garden:v1', JSON.stringify({ state, best: 0 }));
  });
  await page.reload();
  await page.keyboard.press('ArrowLeft');
  const overlay = page.locator('.overlay');
  await expect(overlay).toBeVisible();
  await expect(overlay).toContainText('You win!');
  await expect(overlay).toContainText('Score: 128');
  await expect(overlay).toContainText('Best: 128');
  await expect(overlay.getByRole('button')).toHaveCount(1);
  await expect(page.getByText('Keep playing')).toHaveCount(0);
  // The overlay must be the topmost element at the centre of the board.
  const onTop = await page.evaluate(() => {
    const r = document.querySelector('.board')!.getBoundingClientRect();
    return !!document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)?.closest('.overlay');
  });
  expect(onTop).toBe(true);
  // Game is over: further keys change nothing.
  const tiles = () => page.locator('.tile').count();
  const n = await tiles();
  await page.keyboard.press('ArrowDown');
  expect(await tiles()).toBe(n);
  // Reload keeps the won state and overlay.
  await page.reload();
  await expect(page.locator('.overlay')).toContainText('You win!');
  // Real click (no force): fails if something covers the button.
  await page.locator('.overlay').getByRole('button', { name: 'New Game' }).click();
  await expect(page.locator('.overlay')).toBeHidden();
  await expect(page.locator('.box-value').first()).toHaveText('0');
});
