import { test, expect } from '@playwright/test'

test.describe('Cadastro de Usuário', () => {
  const baseUrl = 'https://agulhadeprata.com.br/Cadastro' 

  test('Cadastro com sucesso', async ({ page }) => {
    await page.goto(baseUrl)

    // Preenche os campos com dados válidos
    await page.locator('#name').fill('maiconT')
    await page.locator('#email').fill(`maiconT@teste.com`) 
    await page.locator('#document').fill('731.194.150-49') 
    await page.locator('#password').fill('Senha@123') 

    await page.getByRole('button', { name: 'Cadastrar' }).click()

    // Aumenta timeout para aguardar redirecionamento
    await expect(page).toHaveURL('https://agulhadeprata.com.br/login', { timeout: 10000 })
  })

  test('Cadastro com erro por email inválido', async ({ page }) => {
    await page.goto(baseUrl)

    await page.locator('#name').fill('Joao Teste')
    await page.locator('#email').fill('invalidoemail.com') 
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
    await page.locator('#password').fill('12345678') 

    await page.getByRole('button', { name: 'Cadastrar' }).click()

    await expect(page.locator('text=A senha deve conter')).toBeVisible()
  })
})
