import { test, expect } from "@playwright/test";

test.describe("Login", () => {
  test("Login com sucesso", async ({ page }) => {
    await page.goto("https://agulhadeprata.com.br/login"); // ajuste se necessário

    await page.locator('#email').fill('testehome@gmail.com');     // substitua pelo email real de teste
    await page.locator('#password').fill('Emilly@123');           // substitua pela senha real
    await page.getByRole('button', { name: 'Entrar' }).click();

    await expect(page).toHaveURL("https://agulhadeprata.com.br/Home");                   // conforme o navigate do seu login
    await expect(page.locator('text=Login')).not.toBeVisible(); // garante que saiu da tela de login
  });

  test("Login com falha", async ({ page }) => {
    await page.goto("https://agulhadeprata.com.br/login");

    await page.locator('#email').fill('email@invalido.com');
    await page.locator('#password').fill('senhaerrada');
    await page.getByRole('button', { name: 'Entrar' }).click();

    await expect(page.locator('text=E-mail ou senha inválidos.')).toBeVisible();
  });
});
