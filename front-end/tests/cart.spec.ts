import { test, expect } from '@playwright/test';

test.describe('Fluxo completo CRUD do Carrinho', () => {
  const baseUrl = 'https://agulhadeprata.com.br/Cart';
  const userId = '1';

  let cartData = [
    {
      id: 1,
      userId: Number(userId),
      quantity: 1,
      ProductModel: {
        id: 1,
        userId: Number(userId),
        name: 'Paranoid',
        price: 199.9,
        image: 'https://m.media-amazon.com/images/I/81J19yHBFTL._UF894,1000_QL80_.jpg',
      },
    },
  ];

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('userId', '1'));

    // Mock GET carrinho
    await page.route(`**/cart/${userId}`, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(cartData),
      });
    });

    // Mock PUT e DELETE
    await page.route(`**/cart/*`, async (route, request) => {
      const id = Number(request.url().split('/').pop());
      const method = request.method();

      if (method === 'PUT') {
        const body = JSON.parse(request.postData() || '{}');
        const item = cartData.find((c) => c.id === id);
        if (item) {
          item.quantity = body.quantity;
          route.fulfill({ status: 200 });
        } else {
          route.fulfill({ status: 404 });
        }
      } else if (method === 'DELETE') {
        cartData = cartData.filter((c) => c.id !== id);
        route.fulfill({ status: 200 });
      } else {
        route.continue();
      }
    });
  });




  test('Deve exibir erro se usuário não estiver logado', async ({ page }) => {
    await page.addInitScript(() => localStorage.removeItem('userId'));
    await page.goto(baseUrl);

    page.once('dialog', async (dialog) => {
      expect(dialog.message()).toContain('Você precisa estar logado para acessar o carrinho.');
      await dialog.dismiss();
    });
  });

  test('Deve exibir erro ao falhar na busca dos produtos do carrinho', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('userId', '1'));

    // Simula erro no GET
    await page.route(`**/cart/${userId}`, (route) => {
      route.fulfill({ status: 500 });
    });

    await page.goto(baseUrl);

    page.once('dialog', async (dialog) => {
      expect(dialog.message()).toContain('Erro ao buscar produtos do carrinho');
      await dialog.dismiss();
    });
  });

  

  //test('Deve exibir erro ao tentar remover item do carrinho', async ({ page }) => {
    //await page.goto(baseUrl);

    // Simula erro no DELETE
   // await page.route(`**/cart/*`, (route, request) => {
     // if (request.method() === 'DELETE') {
       // route.fulfill({ status: 500 });
   //   } else {
    //    route.continue();
     // }
  //  });

    //page.once('dialog', async (dialog) => {
    //  expect(dialog.message()).toContain('Erro ao remover produto do carrinho');
    //  await dialog.dismiss();
    //});

   // await page.getByRole('button', { name: 'Remover' }).click();
 // });
});
