import { test, expect } from '@playwright/test';

test.describe('Página Home - Integração real com banco', () => {
  const baseUrl = 'https://agulhadeprata.com.br/Home';

  test('Deve exibir os produtos e permitir compra com login', async ({ page }) => {
  // Navega para a página de login
  await page.goto('https://agulhadeprata.com.br/login');

  await page.locator('#email').fill('keila@gmail.com');    
  await page.locator('#password').fill('Emilly@123');               


  await page.click('button[type="submit"]');

  
  await page.waitForURL('https://agulhadeprata.com.br/Home');

  
  await page.waitForTimeout(1000);

  await expect(page.getByText('Paranoid')).toBeVisible();
  await expect(page.getByText('Master of Puppets')).toBeVisible();
  await page.waitForTimeout(3000);

  page.once('dialog', async (dialog) => {
    expect(dialog.message()).toContain('Produto adicionado ao carrinho');
    await dialog.dismiss();
  });

  await page.locator('button', { hasText: 'Comprar' }).first().click();
});


  test('Deve exibir alerta ao tentar comprar sem login', async ({ page }) => {
    await page.addInitScript(() => localStorage.removeItem('userId'));
    await page.goto(baseUrl);
    await page.waitForTimeout(1000);

    page.once('dialog', async (dialog) => {
      expect(dialog.message()).toContain('precisa estar logado');
      await dialog.dismiss();
    });

    await page.locator('button', { hasText: 'Comprar' }).first().click();
    await page.waitForTimeout(3000);
  });

  test('Deve exibir alerta ao tentar comprar produto sem estoque', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('userId', '1'));
    await page.goto(baseUrl);
    await page.waitForTimeout(1000);

    const produtoSemEstoque = page.getByText('RUBY'); 
    await expect(produtoSemEstoque).toBeVisible();

    const botao = await produtoSemEstoque.locator('..').getByRole('button', { name: 'Comprar' });

    page.once('dialog', async (dialog) => {
      console.log('Mensagem do diálogo:', dialog.message());
      expect(dialog.message()).toContain('Erro ao adicionar produto ao carrinho. Tente novamente mais tarde.');
      await dialog.dismiss();
    });

    await botao.click();
  });
});
