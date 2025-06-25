import { test, expect } from '@playwright/test';

test.describe('UserPerfil', async () => {


  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('userId', '6');
    });

    await page.route('**/users/Perfil/6', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          name: 'maicon',
          document: '056.312.810-07',
        }),
      });
    });

    await page.route('**/users/Perfil/6', async (route, request) => {
      if (request.method() === 'PUT' || request.method() === 'DELETE') {
        route.fulfill({ status: 200 });
      } else {
        route.continue();
      }
    });
  });

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



  

  test('Deve mostrar erro ao tentar atualizar com senha inválida', async ({ page }) => {
    await page.goto("http://localhost:5173/UserPerfil");
    await page.waitForTimeout(1000);
    await page.fill('input#name', 'Novo Nome');
    await page.fill('input#password', 'abc');
    await page.fill('input#confirmPassword', 'abc');

    await page.click('button:has-text("Atualizar")');

    await expect(
      page.locator('p.error-msg').filter({
        hasText: 'A senha deve conter no mínimo 8 caracteres',
      })
    ).toBeVisible();
  });

  test('Deve excluir conta após confirmação', async ({ page }) => {
    await page.goto("http://localhost:5173/UserPerfil");
    await page.waitForTimeout(60000);
    page.on('dialog', (dialog) => dialog.accept());

    await page.click('button:has-text("Excluir Conta")');
    await expect(page).toHaveURL(/\/login$/);
  });
});
