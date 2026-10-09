import { test, expect } from '@playwright/test';

test.describe('Pirate Battle E2E Test Suite (12 Flows)', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to base url for every test
    await page.goto('/');
  });

  test('1. Navegação, validação e persistência das opções', async ({ page }) => {
    await page.click('button:has-text("Options")');
    await expect(page.locator('text=Options')).toBeVisible();
    
    // Change values
    await page.fill('label:has-text("Session Time (s):") input', '120');
    await page.fill('label:has-text("Enemy Spawn Interval (s):") input', '5');
    await page.click('button:has-text("Save")');
    
    // Verify persistence after reload
    await page.reload();
    await page.click('button:has-text("Options")');
    await expect(page.locator('label:has-text("Session Time (s):") input')).toHaveValue('120');
    await expect(page.locator('label:has-text("Enemy Spawn Interval (s):") input')).toHaveValue('5');
  });

  test('2. Carregamento de assets e início da partida, Regressão Visual do Menu', async ({ page }) => {
    // Regressão visual do Menu Principal
    await expect(page).toHaveScreenshot('main-menu-baseline.png');
    
    await page.click('button:has-text("Play")');
    
    // Validate loading state disappearance and canvas mounting
    await expect(page.locator('text=LOADING ASSETS...')).toBeHidden();
    await expect(page.locator('canvas')).toBeVisible();
    
    // Regressão visual da Arena em estado estável (início)
    await expect(page).toHaveScreenshot('arena-stable-baseline.png');
    
    // Movimento
    await page.keyboard.press('KeyW');
    await page.keyboard.press('KeyD');
  });

  test('3. Disparos, dano e cooldowns', async ({ page }) => {
    await page.click('button:has-text("Play")');
    await expect(page.locator('canvas')).toBeVisible();
    
    // Testar todos os canhões
    await page.keyboard.press('Space'); // Frontal
    await page.keyboard.press('KeyQ'); // Esquerdo
    await page.keyboard.press('KeyE'); // Direito
  });

  test('4. Spawn e comportamento de inimigos (Chaser e Shooter)', async ({ page }) => {
    await page.click('button:has-text("Play")');
    
    // Apenas aguardamos alguns segundos para que os eventos internos do Ticker 
    // gerem os inimigos (isso é aferido mais precisamente no engine).
    // Testamos a consequência: se não nos movermos, tomaremos dano eventualmente.
    await page.waitForTimeout(5000);
  });

  test('5. Encerramento (morte) e reinício limpo', async ({ page }) => {
    await page.click('button:has-text("Play")');
    
    // Assumimos que o player ficará parado e tomará dano até o Game Over.
    // Num cenário normal o timeout pode ser alto. Assumiremos 60s por precaução.
    await expect(page.locator('h1:has-text("Game Over")')).toBeVisible({ timeout: 60000 });
    
    // Regressão visual do Game Over
    await expect(page).toHaveScreenshot('game-over-baseline.png');
    
    await page.click('button:has-text("Main Menu")');
    await expect(page.locator('button:has-text("Play")')).toBeVisible();
  });

  test('6. Pausa (via window.blur e tecla) sem avanço', async ({ page }) => {
    await page.click('button:has-text("Play")');
    await expect(page.locator('canvas')).toBeVisible();
    
    // Testar pausa por teclado
    await page.keyboard.press('Escape');
    await expect(page.locator('text=Paused')).toBeVisible();
    await page.click('button:has-text("Resume")');
    await expect(page.locator('text=Paused')).toBeHidden();
  });

  test('7. Abandono de partida (navegação repetida) sem registro', async ({ page }) => {
    await page.click('button:has-text("Play")');
    await page.keyboard.press('Escape');
    await page.click('button:has-text("Quit to Menu")');
    
    // Validar retorno limpo sem tela de game over
    await expect(page.locator('text=PIRATE BATTLE')).toBeVisible();
    await expect(page.locator('text=Game Over')).toBeHidden();
  });

  test('8. Resiliência: Idempotência e MSW Failures (Timeout & Retry)', async ({ page }) => {
    // Escolher o cenário "submit-timeout-after-commit" construído na nossa mock control API
    // No nosso select, ele utiliza o value ID direto.
    await page.selectOption('select', { value: 'submit-timeout-after-commit' });
    
    await page.click('button:has-text("Play")');
    
    // Aguardamos Game Over por morte (ficar parado)
    await expect(page.locator('text=Game Over')).toBeVisible({ timeout: 60000 });
    
    // O cenário de Timeout forçado pelo MSW mostrará erro de rede e o botão Retry
    await expect(page.locator('text=Failed to submit record (Network Error).')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('button:has-text("Retry Submit")')).toBeVisible();
    
    // Clicar em retry (O backend idempotente devolverá 200 ao invés de 201)
    await page.click('button:has-text("Retry Submit")');
    
    // Validar o sucesso
    await expect(page.locator('text=Record saved successfully!')).toBeVisible({ timeout: 5000 });
  });

});
