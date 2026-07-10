const { test, expect } = require('@playwright/test');
const { registerNewUser } = require('./helpers');

test('Verify Game UI and Tower Interaction', async ({ page }) => {
  await registerNewUser(page);

  // Go to Mode Selection
  await page.click('text=EXECUTE_GAME');
  await expect(page.locator('text=Story Mode')).toBeVisible();

  // Go to Level Selection
  await page.click('text=Story Mode');
  await expect(page.locator('text=Select Build Level')).toBeVisible();

  // Launch Level 1
  await page.click('text=BLD_1');

  // Wait for the game session to actually be ready server-side (session creation is async,
  // a click before this resolves would be silently dropped) before interacting with the canvas.
  await expect(page.locator('text=☕ 150')).toBeVisible();

  // Verify PAUSE button exists
  const pauseBtn = page.locator('button:has-text("PAUSE")');
  await expect(pauseBtn).toBeVisible();

  // Place a tower (click center-ish)
  const canvas = page.locator('canvas');
  await canvas.click({ position: { x: 400, y: 300 } });

  // Wait for the actual server round-trip instead of a fixed delay (avoids flakiness on
  // slow/cold starts): level 1 starts with 150 coffee, tower_console costs 50.
  await expect(page.locator('text=☕ 100')).toBeVisible();

  // Click same spot to select tower
  await canvas.click({ position: { x: 400, y: 300 } });

  // Verify the selected-tower detail panel appears (only rendered once a tower is selected)
  await expect(page.locator('text=RESELL_VAL')).toBeVisible();
  await expect(page.locator('text=UPGRADE')).toBeVisible();
});

test('Upgrade then sell a tower updates resources', async ({ page }) => {
  await registerNewUser(page);
  await page.click('text=EXECUTE_GAME');
  await page.click('text=Infinite Build');
  await expect(page.locator('text=☕ 150')).toBeVisible();

  const canvas = page.locator('canvas');
  await canvas.click({ position: { x: 400, y: 300 } });
  await expect(page.locator('text=☕ 100')).toBeVisible(); // 150 start - 50 cost

  await canvas.click({ position: { x: 400, y: 300 } });
  await expect(page.locator('text=UPGRADE')).toBeVisible();
  await page.click('button:has-text("UPGRADE")');
  await expect(page.locator('text=☕ 50')).toBeVisible(); // -50 upgrade cost

  await page.click('button:has-text("SELL")');
  // Selling refunds 30% of total spent (100 spent -> +30)
  await expect(page.locator('text=☕ 80')).toBeVisible();
});

test('Permanent upgrades screen: purchase is rejected without enough credits', async ({ page }) => {
  await registerNewUser(page);
  await page.click('text=MODS');
  await expect(page.locator('text=Permanent_Mods')).toBeVisible();
  await expect(page.locator('text=AVAILABLE_CREDITS: 0')).toBeVisible();

  page.once('dialog', dialog => dialog.accept());
  await page.click('button:has-text("50 CR")');
  // Credits stay at 0 (a fresh account has no credits yet)
  await expect(page.locator('text=AVAILABLE_CREDITS: 0')).toBeVisible();
});

test('Leaderboard screen loads without error', async ({ page }) => {
  await registerNewUser(page);
  await page.click('text=RANK');
  await expect(page.locator('text=Hall_Of_Fame')).toBeVisible();
  await page.click('text=Close_Record');
  await expect(page.locator('text=EVOLUTION.SYS')).toBeVisible();
});
