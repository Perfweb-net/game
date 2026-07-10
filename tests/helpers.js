const { expect } = require('@playwright/test');

async function registerNewUser(page, prefix = 'test') {
  await page.goto('http://localhost:3000');
  await page.click('text=Create New Entry');
  const username = `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  await page.fill('[placeholder="Identifier"]', username);
  await page.fill('[placeholder="Passkey"]', 'password123');
  await page.click('button:has-text("Register")');
  await expect(page.locator('text=EVOLUTION.SYS')).toBeVisible();
  return username;
}

module.exports = { registerNewUser };
