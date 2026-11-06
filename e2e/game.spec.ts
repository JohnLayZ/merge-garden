import { test, expect, type Page } from '@playwright/test';

/** Seeds a nearly won position before the app loads (once per tab), so the page's own save on unload cannot overwrite it. */
async function seedNearlyWon(page: Page, extra: Record<string, unknown> = {}) {
  await page.addInitScript((patch) => {
    if (sessionStorage.getItem('seeded')) return;
    sessionStorage.setItem('seeded', '1');
    const state = { board: [6, 6, ...new Array(14).fill(0)], score: 0, cans: 0, mergeCount: 0, status: 'playing', moves: 3,
      rng: 12345, seed: 1, playMs: 0, prev: null, ...patch };
    localStorage.setItem('merge-garden:v1', JSON.stringify({ state, best: 0 }));
  }, extra);
}


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
    page.evaluate(() => ({ stored: localStorage.getItem('merge-garden:v1')?.replace(/"playMs":\d+/, '"playMs":0'), tiles: [...document.querySelectorAll('.tile')].length,
      score: document.querySelector('.box-value')?.textContent }));
  const before = await snapshot();
  await page.reload();
  const after = await snapshot();
  expect(after).toEqual(before);
});

test('win overlay sits on top and its New Game button is clickable', async ({ page }) => {
  await seedNearlyWon(page);
  await page.goto('/');
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

test('timer starts with the first move, pauses when hidden, survives reload, resets on New Game', async ({ page }) => {
  await page.goto('/');
  const time = page.getByTestId('time');
  await expect(time).toHaveText('0:00');
  await page.waitForTimeout(1200);
  await expect(time).toHaveText('0:00'); // no valid move yet
  for (const key of ['ArrowLeft', 'ArrowDown', 'ArrowRight', 'ArrowUp']) await page.keyboard.press(key);
  await expect(time).not.toHaveText('0:00', { timeout: 3000 });
  // hidden tab: time stands still
  const hide = (hidden: boolean) =>
    page.evaluate((h) => {
      Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => (h ? 'hidden' : 'visible') });
      document.dispatchEvent(new Event('visibilitychange'));
    }, hidden);
  await hide(true);
  const frozen = await time.textContent();
  await page.waitForTimeout(2200);
  await expect(time).toHaveText(frozen!);
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('merge-garden:v1')!).state.playMs as number);
  expect(stored).toBeGreaterThan(0);
  await hide(false);
  // reload continues from the stored value
  await page.reload();
  await expect(time).not.toHaveText('0:00');
  await page.getByRole('button', { name: 'New Game' }).first().click();
  await expect(time).toHaveText('0:00');
});

test('win overlay shows the frozen play time, also after reload', async ({ page }) => {
  await seedNearlyWon(page, { playMs: 65_000 });
  await page.goto('/');
  await page.keyboard.press('ArrowLeft');
  await expect(page.locator('.overlay')).toContainText('Time: 1:0');
  const shown = await page.locator('.overlay-time').textContent();
  await page.waitForTimeout(2200);
  await expect(page.locator('.overlay-time')).toHaveText(shown!);
  await page.reload();
  await expect(page.locator('.overlay-time')).toHaveText(shown!);
});
