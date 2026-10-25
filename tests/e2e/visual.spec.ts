// Verifica ausência de overflow horizontal (390, 768 e 1440 px) e regressão visual das telas principais.
import { expect, test, type Page } from "@playwright/test";

/** Aguarda fontes carregadas e oculta o botão flutuante de simulação para estabilizar os snapshots. */
async function stabilizePage(page: Page) {
  await page.addStyleTag({
    content: '[aria-label="Abrir painel de cenários de simulação"] { display: none !important; }',
  });
  await page.evaluate(() => document.fonts.ready);
}

/** Confirma que a página não gera barra de rolagem horizontal na largura atual. */
async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
}

test("não apresenta overflow horizontal em 390, 768 e 1440 px", async ({ page }) => {
  await page.goto("/login?scenario=default");
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("textbox", { name: "E-mail" }).fill("ana@kurio.dev");
  await dialog.getByRole("textbox", { name: "Senha", exact: true }).fill("Kurio@123");
  await dialog.getByRole("button", { name: "Entrar" }).click();
  await expect(page).not.toHaveURL(/\/login/);

  await page.goto("/nft/golden-beat-207");
  await page.getByRole("button", { name: /Comprar/ }).click();
  await expect(page).toHaveURL(/\/carrinho/);

  const routes = [
    ["/", "Oferta limitada"],
    ["/nft/golden-beat-207", "Golden Beat #207"],
    ["/carrinho", "Resumo da carteira"],
    ["/checkout", "Perfil do colecionador"],
    ["/perfil", "Segurança"],
    ["/carteiras", "Carteiras"],
  ] as const;

  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const [path, heading] of routes) {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      await expect(page.getByRole("heading", { name: heading }).first()).toBeVisible();
      await expectNoHorizontalOverflow(page);
    }
  }
});

test("mantém regressão visual estável em início, detalhe, carrinho e pagamento", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });

  await page.goto("/?scenario=default");
  await expect(page.getByRole("heading", { name: "Oferta limitada" })).toBeVisible();
  await expect(page.locator("#catalogo article").first()).toBeVisible();
  await stabilizePage(page);
  await expect(page).toHaveScreenshot("home.png", {
    animations: "disabled",
    maxDiffPixelRatio: 0.01,
  });

  await page.goto("/login");
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("textbox", { name: "E-mail" }).fill("ana@kurio.dev");
  await dialog.getByRole("textbox", { name: "Senha", exact: true }).fill("Kurio@123");
  await dialog.getByRole("button", { name: "Entrar" }).click();
  await expect(page).not.toHaveURL(/\/login/);

  await page.goto("/nft/golden-beat-207");
  await expect(page.getByRole("heading", { name: "Golden Beat #207" })).toBeVisible();
  await stabilizePage(page);
  await expect(page).toHaveScreenshot("nft-detail.png", {
    animations: "disabled",
    maxDiffPixelRatio: 0.01,
  });

  await page.getByRole("button", { name: /Comprar/ }).click();
  await expect(page).toHaveURL(/\/carrinho/);
  await expect(page.getByRole("link", { name: "Golden Beat #207" })).toBeVisible();
  await expect(
    page.getByRole("complementary").getByText("0.99 ETH", { exact: true }),
  ).toBeVisible();
  await stabilizePage(page);
  await expect(page).toHaveScreenshot("cart.png", {
    animations: "disabled",
    maxDiffPixelRatio: 0.01,
  });

  await page.getByRole("button", { name: "Concluir e finalizar" }).click();
  await expect(page).toHaveURL(/\/checkout/);
  await expect(page.getByRole("heading", { name: "Perfil do colecionador" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Conectar carteira" })).toBeEnabled();
  await expect(page.getByRole("button", { name: "Revisar pedido" })).toBeEnabled();
  await stabilizePage(page);
  await expect(page).toHaveScreenshot("checkout.png", {
    animations: "disabled",
    maxDiffPixelRatio: 0.01,
  });
});
