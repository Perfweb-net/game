const { test, expect } = require('@playwright/test');

test('Verify Game UI and Tower Interaction', async ({ page }) => {
  await page.goto('http://localhost:3000');

  // New UI uses "Create New Entry"
  await page.click('text=Create New Entry');
  const testUser = `test_${Date.now()}`;
  await page.fill('[placeholder="Identifier"]', testUser);
  await page.fill('[placeholder="Passkey"]', 'password123');
  await page.click('button:has-text("Register")');

  // Wait for menu
  await expect(page.locator('text=EVOLUTION.SYS')).toBeVisible();

  // Go to Mode Selection
  await page.click('text=EXECUTE_GAME');
  await expect(page.locator('text=Story Mode')).toBeVisible();

  // Go to Level Selection
  await page.click('text=Story Mode');
  await expect(page.locator('text=Select Build Level')).toBeVisible();

  // Launch Level 1
  await page.click('text=BLD_1');
  
  // Wait for Game HUD
  await expect(page.locator('text=RESOURCE')).toBeVisible();
  
  // Verify PAUSE button exists
  const pauseBtn = page.locator('button:has-text("PAUSE")');
  await expect(pauseBtn).toBeVisible();

  // Place a tower (click center-ish)
  const canvas = page.locator('canvas');
  await canvas.click({ position: { x: 400, y: 300 } });

  // Wait a bit for server sync
  await page.waitForTimeout(1000);

  // Click same spot to select tower
  await canvas.click({ position: { x: 400, y: 300 } });

  // Verify the selected-tower detail panel appears (only rendered once a tower is selected)
  await expect(page.locator('text=RESELL_VAL')).toBeVisible();
  await expect(page.locator('text=UPGRADE')).toBeVisible();
});
