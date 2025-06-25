import { test, expect } from '@playwright/test'

test.describe('Cadastro de Usuário', () => {
  const baseUrl = 'http://localhost:5173/Cadastro' // confirme a rota

  test('Cadastro com sucesso', async ({ page }) => {
    await page.goto(baseUrl)

    // Preenche os campos com dados válidos
    await page.locator('#name').fill('maicon')
    await page.locator('#email').fill(`maicon@teste.com`) // email único
    await page.locator('#document').fill('056.312.810-07') // CPF com 11 dígitos
    await page.locator('#password').fill('Senha@123') // senha forte

    await page.getByRole('button', { name: 'Cadastrar' }).click()

    // Aumenta timeout para aguardar redirecionamento
    await expect(page).toHaveURL('http://localhost:5173/login', { timeout: 10000 })
  })

  test('Cadastro com erro por email inválido', async ({ page }) => {
    await page.goto(baseUrl)

    await page.locator('#name').fill('Joao Teste')
    await page.locator('#email').fill('invalidoemail.com') // inválido
    await page.locator('#document').fill('12345678901')
    await page.locator('#password').fill('Senha@123')

    await page.getByRole('button', { name: 'Cadastrar' }).click()

    page.once('dialog', async (dialog) => {
      console.log('Mensagem do diálogo:', dialog.message());
      expect(dialog.message()).toContain('Erro ao cadastrar usuário. Tente novamente.');
      await dialog.dismiss();
    });
  })

  test('Cadastro com erro por CPF inválido', async ({ page }) => {
    await page.goto(baseUrl)

    await page.locator('#name').fill('Teste CPF')
    await page.locator('#email').fill(`cpf${Date.now()}@teste.com`)
    await page.locator('#document').fill('123') // CPF inválido
    await page.locator('#password').fill('Senha@123')

    await page.getByRole('button', { name: 'Cadastrar' }).click()

    await expect(page.locator('text=CPF inválido.')).toBeVisible()
  })

  test('Cadastro com erro por senha fraca', async ({ page }) => {
    await page.goto(baseUrl)

    await page.locator('#name').fill('Teste Fraco')
    await page.locator('#email').fill(`fraco${Date.now()}@teste.com`)
    await page.locator('#document').fill('12345678901')
    await page.locator('#password').fill('12345678') // sem maiúscula e especial

    await page.getByRole('button', { name: 'Cadastrar' }).click()

    await expect(page.locator('text=A senha deve conter')).toBeVisible()
  })
})
