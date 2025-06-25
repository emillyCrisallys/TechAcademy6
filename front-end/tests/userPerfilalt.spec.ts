import { test, expect } from '@playwright/test';

test.describe('UserPerfilalt', () => {
  

  test('Deve carregar dados do usuário e permitir atualizar nome e senha', async ({ page }) => {
    // 🔐 Login real
    await page.goto("http://localhost:5173/login"); // ajuste se necessário

    await page.locator('#email').fill('maicon@gmail.com');     // substitua pelo email real de teste
    await page.locator('#password').fill('Emilly@123');           // substitua pela senha real
    await page.getByRole('button', { name: 'Entrar' }).click();

    // Espera redirecionar pro /Home (ou outro)
    await page.waitForURL("http://localhost:5173/Home");

    // Acessa o perfil
    await page.goto("http://localhost:5173/UserPerfil");

    // Aguarda os inputs do perfil
    await expect(page.locator('input#name')).not.toHaveValue('', { timeout: 8000 });

    // Preenche os campos com novos dados
    await page.fill('input#name', 'Novo Nome Teste');
    await page.fill('input#password', 'SenhaNova123@');
    await page.fill('input#confirmPassword', 'SenhaNova123@');

    // Clica no botão de atualizar
    await page.click('button:has-text("Atualizar")');

    // Aguarda mensagem de sucesso
    await expect(page.locator('p.success-msg')).toHaveText('Alterado com sucesso!');
  });
});
