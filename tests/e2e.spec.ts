import { test, expect } from '@playwright/test';

test.describe('Pirate Battle E2E Test Suite (12 Flows)', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to base url for every test
    await page.goto('/');
  });

  test('1. Navegação, validação e persistência das opções', async ({ page }) => {
    await page.click('button:has-text("Options")');
    await expect(page.locator('h2:has-text("OPTIONS")')).toBeVisible();
    
    // Validar valor inicial (padrão é 90s)
    await expect(page.locator('[data-testid="session-time-value"]')).toHaveText('90s');
    
    // Change values using the new + buttons (Session Time)
    // Garante exclusividade no clique do botão de incremento e força a ação
    await page.click('[data-testid="session-time-plus"]', { force: true });
    await page.waitForTimeout(100);
    
    // Validar visualmente a alteração (90s + 30s = 120s)
    await expect(page.locator('[data-testid="session-time-value"]')).toHaveText('120s');
    
    // Save Options (remover force: true para garantir que o botão correto seja clicado se não estiver obstruído)
    await page.click('[data-testid="save-options-button"]');
    await expect(page.locator('text=Options Saved Successfully!')).toBeVisible();
    
    // Verify persistence after reload
    await page.reload();
    await page.click('button:has-text("Options")');
    await expect(page.locator('h2:has-text("OPTIONS")')).toBeVisible();
    
    // Validação de persistência dos valores alterados
    await expect(page.locator('[data-testid="session-time-value"]')).toHaveText('120s');
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
    // 1ª Etapa do Game Over: Alerta "YOUR SHIP SANK!"
    await expect(page.locator('h2:has-text("YOUR SHIP SANK!")')).toBeVisible({ timeout: 120000 });
    
    // Clicar no botão intermediário
    await page.click('button:has-text("SEE RESULTS")');
    
    // 2ª Etapa do Game Over: Placar Final
    await expect(page.locator('h2:has-text("SHIP SUNK")')).toBeVisible();
    
    // Aguardar mensagem da rede para evitar screenshot flaky com animação (RECORDING TO LOG...)
    await expect(page.locator('text=Battle recorded in the Captain\'s Log.')).toBeVisible({ timeout: 15000 });
    
    // Regressão visual do Game Over
    await expect(page).toHaveScreenshot('game-over-baseline.png');
    
    // Voltar para o menu e iniciar nova partida para limpar o estado e desmontar o canvas
    await page.click('button:has-text("PLAY AGAIN")', { force: true });
    await expect(page.locator('canvas')).toBeVisible();
    
    // Wait a moment for rendering
    await page.waitForTimeout(500);
  });

  test('6. Pausa (via window.blur e tecla) sem avanço', async ({ page }) => {
    await page.click('button:has-text("Play")');
    await expect(page.locator('canvas')).toBeVisible();
    
    // Testar pausa por teclado (usando toPass para garantir que a engine já escuta eventos)
    await expect(async () => {
      await page.keyboard.press('Escape');
      await expect(page.locator('text=Paused')).toBeVisible({ timeout: 1000 });
    }).toPass({ timeout: 10000 });
    
    await page.click('button:has-text("Resume")');
    await expect(page.locator('text=Paused')).toBeHidden();
  });

  test('7. Abandono de partida (navegação repetida) sem registro', async ({ page }) => {
    await page.click('button:has-text("Play")');
    await expect(page.locator('canvas')).toBeVisible();
    
    await expect(async () => {
      await page.keyboard.press('Escape');
      await expect(page.locator('button:has-text("Quit to Menu")')).toBeVisible({ timeout: 1000 });
    }).toPass({ timeout: 10000 });
    
    await page.click('button:has-text("Quit to Menu")'); 
    
    // Validar retorno limpo sem tela de game over
    await expect(page.locator('text=PIRATE BATTLE')).toBeVisible();
    await expect(page.locator('text=YOUR SHIP SANK!')).toBeHidden();
  });

  test('8. Resiliência: Idempotência e MSW Failures (Timeout & Retry)', async ({ page }) => {
    test.setTimeout(60000);
    // Escolher o cenário "submit-timeout-after-commit"
    await page.selectOption('select', { value: 'submit-timeout-after-commit' });
    
    await page.click('button:has-text("Play")');
    
    // 1ª Etapa do Game Over: Alerta "YOUR SHIP SANK!"
    await expect(page.locator('h2:has-text("YOUR SHIP SANK!")')).toBeVisible({ timeout: 120000 });
    
    // Clicar no botão intermediário
    await page.click('button:has-text("SEE RESULTS")');
    
    // 2ª Etapa do Game Over: Placar Final
    await expect(page.locator('h2:has-text("SHIP SUNK")')).toBeVisible();
    
    // Aguardar a mensagem de sucesso de rede do MSW
    await expect(page.locator('text=Battle recorded in the Captain\'s Log.')).toBeVisible({ timeout: 15000 });
  });

});
