// Cobre itens, quantidades, cupons, totais e migração do carrinho visitante.
import { expect, test, type Page } from "@playwright/test";

async function loginAs(page: Page) {
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("textbox", { name: "E-mail" }).fill("ana@kurio.dev");
  await dialog.getByRole("textbox", { name: "Senha", exact: true }).fill("Kurio@123");
  await dialog.getByRole("button", { name: "Entrar" }).click();
  await expect(page).not.toHaveURL(/\/login/);
}

function summaryValue(page: Page, label: string) {
  return page.getByText(label, { exact: true }).locator("xpath=..").getByRole("definition");
}

async function addGoldenBeat(page: Page) {
  await page.goto("/nft/golden-beat-207?scenario=default");
  const response = page.waitForResponse(
    (res) => new URL(res.url()).pathname === "/api/cart/items" && res.request().method() === "POST",
  );
  await page.getByRole("button", { name: /Comprar/ }).click();
  expect((await response).status()).toBe(200);
  await expect(page).toHaveURL(/\/carrinho/);
}

test("mostra o estado vazio antes de adicionar itens", async ({ page }) => {
  await page.goto("/carrinho?scenario=default");

  await expect(page.getByText("Seu carrinho está vazio")).toBeVisible();
  await expect(page.getByRole("link", { name: "Explorar NFTs" })).toBeVisible();
});

test("adiciona item, atualiza quantidade e calcula cupom e totais", async ({ page }) => {
  await addGoldenBeat(page);
  await expect(page.getByRole("link", { name: /Golden Beat #207/ })).toBeVisible();

  const quantity = page.getByRole("group", { name: "Quantidade de Golden Beat #207" });
  const update = page.waitForResponse(
    (res) =>
      new URL(res.url()).pathname === "/api/cart/items" && res.request().method() === "PATCH",
  );
  await quantity.getByRole("button", { name: "Aumentar quantidade de Golden Beat #207" }).click();
  expect((await update).status()).toBe(200);
  await expect(quantity.getByRole("status")).toHaveText("2");
  await expect(summaryValue(page, "Subtotal")).toHaveText("1.98 ETH");

  await page.getByLabel("Código promocional").fill("KURIO10");
  await page.getByRole("button", { name: "Aplicar" }).click();
  await expect(page.getByRole("status").filter({ hasText: "KURIO10" })).toBeVisible();
  await expect(summaryValue(page, "Desconto de lançamento")).toHaveText("- 0.198 ETH");
  await expect(summaryValue(page, "Total")).toHaveText("1.7862 ETH");

  await page
    .getByRole("status")
    .filter({ hasText: "KURIO10" })
    .getByRole("button", { name: "Remover" })
    .click();
  await expect(page.getByRole("status").filter({ hasText: "KURIO10" })).toHaveCount(0);
  await expect(summaryValue(page, "Total")).toHaveText("1.9842 ETH");

  await page.getByLabel("Código promocional").fill("VERAO25");
  await page.getByRole("button", { name: "Aplicar" }).click();
  await expect(page.getByRole("alert")).toHaveText("Este cupom expirou");
  await page.getByLabel("Código promocional").fill("INVALIDO");
  await page.getByRole("button", { name: "Aplicar" }).click();
  await expect(page.getByRole("alert")).toHaveText("Cupom inválido");

  const remove = page.waitForResponse(
    (res) =>
      new URL(res.url()).pathname === "/api/cart/items" && res.request().method() === "DELETE",
  );
  await page.getByRole("button", { name: "Remover Golden Beat #207" }).click();
  expect((await remove).status()).toBe(200);
  await expect(page.getByText("Seu carrinho está vazio")).toBeVisible();
});

test("migra itens do visitante para a conta antes do pagamento", async ({ page }) => {
  await addGoldenBeat(page);
  await page.getByRole("button", { name: "Conectar e finalizar" }).click();
  await expect(page).toHaveURL(/\/login\?redirect=%2Fcheckout/);

  await loginAs(page);
  await expect(page).toHaveURL(/\/checkout/);
  await expect(page.getByRole("heading", { name: "Perfil do colecionador" })).toBeVisible();

  await page.goto("/carrinho");
  await expect(page.getByRole("link", { name: /Golden Beat #207/ })).toBeVisible();
  await expect(page.getByRole("button", { name: "Concluir e finalizar" })).toBeVisible();
});
