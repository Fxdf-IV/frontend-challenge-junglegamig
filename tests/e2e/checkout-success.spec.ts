// Cobre a compra concluída e o recibo persistido após atualizar a página.
import { expect, test, type Page } from "@playwright/test";

async function loginAsAna(page: Page) {
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("textbox", { name: "E-mail" }).fill("ana@kurio.dev");
  await dialog.getByRole("textbox", { name: "Senha", exact: true }).fill("Kurio@123");
  await dialog.getByRole("button", { name: "Entrar" }).click();
  await expect(page).not.toHaveURL(/\/login/);
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

test("conclui a compra, confirma a rede e restaura o recibo após refresh", async ({ page }) => {
  await page.goto("/login?scenario=default");
  await loginAsAna(page);
  await addGoldenBeat(page);
  await page.getByRole("button", { name: "Concluir e finalizar" }).click();
  await expect(page).toHaveURL(/\/checkout/);

  await expect(page.getByLabel("Nome de exibição *")).toHaveValue("Ana Sato");
  await expect(page.getByLabel("E-mail *")).toHaveValue("ana@kurio.dev");
  await page.getByRole("button", { name: "Conectar carteira" }).click();
  const walletDialog = page.getByRole("dialog");
  await expect(walletDialog.getByRole("heading", { name: /simulação/ })).toBeVisible();
  await walletDialog.getByRole("button", { name: "Aprovar conexão" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Conectada" })).toBeVisible();

  await page.getByRole("button", { name: "Revisar pedido" }).click();
  const review = page.getByRole("dialog");
  await expect(review.getByRole("heading", { name: "Revise seu pedido" })).toBeVisible();
  await expect(review.getByText("Golden Beat #207")).toBeVisible();
  await expect(review.getByText(/Reserva.*Ethereum/)).toBeVisible();

  const orderResponse = page.waitForResponse(
    (res) => new URL(res.url()).pathname === "/api/orders" && res.request().method() === "POST",
  );
  await review.getByRole("button", { name: "Confirmar compra" }).click();
  expect((await orderResponse).status()).toBe(201);
  await expect(page).toHaveURL(/\/pedido\/ord_/);

  const receipt = page.getByRole("dialog");
  await expect(
    receipt.getByText(
      "Transação confirmada (simulação). A propriedade foi transferida para sua carteira conectada.",
    ),
  ).toBeVisible();
  await expect(receipt.getByText("Golden Beat #207")).toBeVisible();
  await expect(
    receipt
      .locator("dl")
      .last()
      .getByText("Total", { exact: true })
      .locator("xpath=..")
      .getByRole("definition"),
  ).toHaveText("0.9942 ETH");

  await page.reload();
  const restoredReceipt = page.getByRole("dialog");
  await expect(restoredReceipt.getByText("Golden Beat #207")).toBeVisible();
  await expect(
    restoredReceipt
      .locator("dl")
      .last()
      .getByText("Total", { exact: true })
      .locator("xpath=..")
      .getByRole("definition"),
  ).toHaveText("0.9942 ETH");
});
