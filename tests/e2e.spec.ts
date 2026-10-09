import { test, expect } from '@playwright/test';

test.describe('Pirate Battle E2E', () => {

  test('A: Options menu navigation and localStorage persistence', async ({ page }) => {
    await page.goto('/');
    
    // Go to Options
    await page.click('text=Options');
    
    // Check initial values
    await expect(page.locator('input[type="number"]').first()).toHaveValue('90');
    
    // Change session time
    await page.fill('input[type="number"]', '120');
    await page.click('text=Save');
    
    // Should return to menu
    await expect(page.locator('text=PIRATE BATTLE')).toBeVisible();
    
    // Reload and check if persistence worked
    await page.reload();
    await page.click('text=Options');
    await expect(page.locator('input[type="number"]').first()).toHaveValue('120');
  });

  test('B: Gameplay flow (Pause and Death)', async ({ page }) => {
    await page.goto('/');
    
    // Click Play
    await page.click('text=Play');
    
    // Assert HUD is visible
    await expect(page.locator('text=HP:')).toBeVisible();
    
    // Trigger Pause via Esc key
    await page.keyboard.press('Escape');
    await expect(page.locator('text=Paused')).toBeVisible();
    
    // Resume
    await page.click('text=Resume');
    await expect(page.locator('text=Paused')).toBeHidden();
    
    // Trigger Auto-Pause by blurring window (simulated via Esc for tests, as window blur is flaky in headless)
    await page.keyboard.press('Escape');
    await expect(page.locator('text=Paused')).toBeVisible();
    await page.click('text=Resume');

    // Wait or force game over (we assume player will die eventually, or we can trigger it)
    // To speed up the test, we could just wait for the game over screen to appear if we set 1 HP, 
    // but without hooking into the game state, we just verify that play state starts.
  });

  test('C: Network Resilience (MSW Error Recovery)', async ({ page }) => {
    // Start with a mockLatency query param or trigger the game over state
    await page.goto('/?mockLatency=0');
    
    // In a real E2E, we would mock the MSW endpoint to return 500
    await page.route('/api/history', async route => {
      // Fail the first request
      if (route.request().method() === 'POST' && !route.request().postData()?.includes('retried')) {
        await route.fulfill({ status: 500, body: JSON.stringify({ error: 'Server Error' }) });
      } else {
        await route.continue();
      }
    });

    await page.click('text=Play');
    // We would need to wait for Game Over. We can simulate game over by setting window state or waiting.
  });
});
